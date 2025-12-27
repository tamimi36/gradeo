"""
OCR Celery Tasks for Asynchronous Processing
"""
import time
import os
from datetime import datetime
from celery import Task
from celery.utils.log import get_task_logger
from app import db
from app.models.submission import Submission, OCRResult, SubmissionAnswer, OCRProcessingJob
from app.models.exam import Exam
from app.services.ocr import GoogleVisionOCR, OCRStrategySelector, TextProcessor, AnswerExtractor

logger = get_task_logger(__name__)

# Will be set when celery is initialized
celery = None


def set_celery(celery_instance):
    """Set the celery instance (called from app factory)"""
    global celery
    celery = celery_instance


class OCRTask(Task):
    """Base task class for OCR tasks with error handling"""
    autoretry_for = (Exception,)  # Retry on any exception
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True  # Exponential backoff
    retry_backoff_max = 600  # Max 10 minutes
    retry_jitter = True  # Add randomness to avoid thundering herd


def process_submission_ocr(submission_id: int):
    """
    Main OCR processing task for a submission

    Workflow:
    1. Load submission and exam metadata
    2. Determine OCR strategy based on exam type
    3. Process scanned image(s)
    4. Extract answers
    5. Create SubmissionAnswer records
    6. Update submission status

    Args:
        submission_id: Submission ID to process

    Returns:
        Dictionary with processing results
    """
    from app.services.tasks.celery_config import celery

    start_time = time.time()
    job = None

    try:
        logger.info(f"Starting OCR processing for submission {submission_id}")

        # Load submission and exam
        submission = Submission.query.get(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")

        exam = submission.exam

        # Update submission status
        submission.submission_status = 'processing'
        db.session.commit()

        # Initialize OCR services
        ocr_service = GoogleVisionOCR()
        strategy_selector = OCRStrategySelector(ocr_service)
        text_processor = TextProcessor()
        answer_extractor = AnswerExtractor()

        # Select OCR strategy
        strategy = strategy_selector.select_strategy_for_exam(exam)
        language_hints = strategy_selector.get_language_hints(exam)

        logger.info(f"Using OCR strategy: {strategy}, languages: {language_hints}")

        # Get file path (handle both absolute and relative paths)
        file_path = submission.scanned_paper_path
        if not os.path.isabs(file_path):
            # Relative path - prepend upload folder
            from flask import current_app
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            file_path = os.path.join(upload_folder, file_path)

        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Scanned paper not found: {file_path}")

        # Check if file is PDF and convert to images if necessary
        from app.utils.pdf_utils import is_pdf, pdf_to_images

        image_paths = []
        temp_images_to_cleanup = []

        if is_pdf(file_path):
            logger.info(f"PDF detected, converting to images: {file_path}")
            pdf_conversion = pdf_to_images(file_path)

            if not pdf_conversion['success']:
                raise Exception(f"Failed to convert PDF: {pdf_conversion['error']}")

            image_paths = pdf_conversion['image_paths']
            temp_images_to_cleanup = image_paths  # Mark for cleanup after processing
            logger.info(f"PDF converted to {len(image_paths)} page(s)")

            # Update submission page count
            submission.page_count = len(image_paths)
        else:
            # Single image file
            image_paths = [file_path]
            submission.page_count = 1

        # Process each page/image
        ocr_results = []
        all_extracted_answers = []

        for page_num, image_path in enumerate(image_paths, start=1):
            logger.info(f"Processing page {page_num}/{len(image_paths)}: {image_path}")

            # Perform OCR on this page
            ocr_raw_result = strategy_selector.execute_strategy(
                strategy=strategy,
                image_path=image_path,
                language_hints=language_hints
            )

            # Extract data
            full_text = ocr_raw_result.get('full_text', '')
            confidence = ocr_raw_result.get('confidence', 0.0)
            detected_language = ocr_raw_result.get('language', 'unknown')

            # Clean/process text
            processed_text = text_processor.clean_text(full_text, detected_language)

            # Create OCRResult record for this page
            ocr_result = OCRResult(
                submission_id=submission_id,
                ocr_service='google_vision',
                raw_text=full_text,
                processed_text=processed_text,
                confidence_score=confidence,
                processing_status='completed',
                raw_response=ocr_raw_result.get('raw_response'),
                detected_language=detected_language,
                bounding_boxes=ocr_raw_result.get('annotations', []),
                detected_breaks=ocr_raw_result.get('breaks', {}),
                processing_time_seconds=time.time() - start_time,
                page_number=page_num
            )
            db.session.add(ocr_result)
            db.session.flush()  # Get ocr_result.id
            ocr_results.append(ocr_result)

        # Clean up temporary images from PDF conversion
        for temp_img in temp_images_to_cleanup:
            try:
                if os.path.exists(temp_img):
                    os.remove(temp_img)
                    logger.info(f"Cleaned up temporary image: {temp_img}")
            except Exception as e:
                logger.warning(f"Failed to cleanup temp image {temp_img}: {str(e)}")

        # Use the first OCR result for backwards compatibility
        # (or combine results if multi-page)
        primary_ocr_result = ocr_results[0]

        # If multi-page, combine the text
        if len(ocr_results) > 1:
            combined_text = '\n\n--- PAGE BREAK ---\n\n'.join(
                [r.processed_text for r in ocr_results]
            )
            avg_confidence = sum([r.confidence_score for r in ocr_results]) / len(ocr_results)

            # Update primary result with combined data
            primary_ocr_result.processed_text = combined_text
            primary_ocr_result.confidence_score = avg_confidence

        # Extract answers based on scan type
        if submission.scan_type == 'full_page':
            # Use primary OCR result (with combined text if multi-page)
            extracted_answers = answer_extractor.extract_answers_from_full_page(
                primary_ocr_result, exam
            )
        else:  # per_question
            # Use all OCR results for per-question extraction
            extracted_answers = answer_extractor.extract_answers_from_per_question_scan(
                ocr_results, exam
            )

        # Create SubmissionAnswer records
        for ans_data in extracted_answers:
            submission_answer = SubmissionAnswer(
                submission_id=submission_id,
                question_id=ans_data['question_id'],
                answer_text=ans_data['answer_text'],
                answer_option_id=ans_data.get('answer_option_id'),
                confidence_score=ans_data['confidence'],
                ocr_result_id=primary_ocr_result.id,
                extracted_bounding_box=ans_data.get('bounding_box'),
                extraction_method=ans_data.get('extraction_method')
            )
            db.session.add(submission_answer)

        # Update submission
        submission.submission_status = 'completed'
        submission.processed_at = datetime.utcnow()

        db.session.commit()

        logger.info(f"OCR processing completed for submission {submission_id}: "
                   f"{len(extracted_answers)} answers extracted")

        return {
            'status': 'success',
            'submission_id': submission_id,
            'ocr_result_id': primary_ocr_result.id,
            'page_count': len(ocr_results),
            'answers_extracted': len(extracted_answers),
            'confidence_score': primary_ocr_result.confidence_score,
            'processing_time': time.time() - start_time
        }

    except FileNotFoundError as e:
        logger.error(f"File not found for submission {submission_id}: {str(e)}")

        # Update submission status
        submission = Submission.query.get(submission_id)
        if submission:
            submission.submission_status = 'failed'
            db.session.commit()

        # Don't retry for file not found
        return {
            'status': 'failed',
            'submission_id': submission_id,
            'error': str(e)
        }

    except Exception as e:
        logger.error(f"OCR processing failed for submission {submission_id}: {str(e)}")

        # Update submission status
        submission = Submission.query.get(submission_id)
        if submission:
            submission.submission_status = 'failed'
            db.session.commit()

        # Return error details
        return {
            'status': 'failed',
            'submission_id': submission_id,
            'error': str(e),
            'processing_time': time.time() - start_time
        }


def process_single_page_ocr(submission_id: int, page_number: int):
    """
    Process a single page/question scan (for per-question scan mode)

    Args:
        submission_id: Submission ID
        page_number: Page number to process

    Returns:
        Dictionary with processing results
    """
    # Similar to process_submission_ocr but for individual pages
    # Can be implemented later if needed for multi-page per-question scans
    pass
