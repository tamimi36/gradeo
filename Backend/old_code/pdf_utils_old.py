"""
PDF Utilities
Handles PDF creation from images and PDF to image conversion for OCR processing
"""
import os
import io
from PIL import Image
from pdf2image import convert_from_path
from typing import List, Dict, Optional
from flask import current_app


def images_to_pdf(image_paths: List[str], output_path: str) -> Dict:
    """
    Convert multiple images to a single PDF file

    Args:
        image_paths: List of paths to image files (PNG, JPG, JPEG)
        output_path: Path where the PDF should be saved

    Returns:
        dict: {
            'success': bool,
            'filepath': str (path to created PDF),
            'page_count': int,
            'error': str (if failed)
        }
    """
    try:
        if not image_paths:
            return {'success': False, 'error': 'No images provided'}

        # Open all images and convert to RGB (required for PDF)
        images = []
        for img_path in image_paths:
            if not os.path.exists(img_path):
                return {'success': False, 'error': f'Image not found: {img_path}'}

            img = Image.open(img_path)

            # Convert to RGB if necessary (PNG with alpha, etc.)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            images.append(img)

        if not images:
            return {'success': False, 'error': 'No valid images to convert'}

        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save first image as PDF with additional pages
        first_image = images[0]
        remaining_images = images[1:] if len(images) > 1 else []

        if remaining_images:
            first_image.save(
                output_path,
                'PDF',
                save_all=True,
                append_images=remaining_images,
                resolution=100.0,
                quality=95
            )
        else:
            first_image.save(output_path, 'PDF', resolution=100.0, quality=95)

        # Close all images
        for img in images:
            img.close()

        return {
            'success': True,
            'filepath': output_path,
            'page_count': len(images)
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to create PDF: {str(e)}'
        }


def pdf_to_images(pdf_path: str, output_dir: Optional[str] = None, dpi: int = 300) -> Dict:
    """
    Convert PDF pages to images for OCR processing

    Args:
        pdf_path: Path to PDF file
        output_dir: Directory to save images (if None, uses temp directory)
        dpi: Resolution for image conversion (default: 300)

    Returns:
        dict: {
            'success': bool,
            'image_paths': List[str] (paths to created images),
            'page_count': int,
            'error': str (if failed)
        }
    """
    try:
        if not os.path.exists(pdf_path):
            return {'success': False, 'error': f'PDF not found: {pdf_path}'}

        # Create output directory if not specified
        if output_dir is None:
            upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            output_dir = os.path.join(upload_base, 'temp_pdf_conversions')

        os.makedirs(output_dir, exist_ok=True)

        # Convert PDF to images
        images = convert_from_path(
            pdf_path,
            dpi=dpi,
            output_folder=output_dir,
            fmt='png'
        )

        # Save images and get paths
        image_paths = []
        base_filename = os.path.splitext(os.path.basename(pdf_path))[0]

        for i, image in enumerate(images, start=1):
            image_filename = f"{base_filename}_page_{i}.png"
            image_path = os.path.join(output_dir, image_filename)
            image.save(image_path, 'PNG')
            image_paths.append(image_path)

        return {
            'success': True,
            'image_paths': image_paths,
            'page_count': len(image_paths)
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to convert PDF to images: {str(e)}'
        }


def is_pdf(file_path: str) -> bool:
    """
    Check if a file is a PDF based on extension

    Args:
        file_path: Path to file

    Returns:
        bool: True if file is PDF
    """
    return file_path.lower().endswith('.pdf')


def get_pdf_page_count(pdf_path: str) -> int:
    """
    Get the number of pages in a PDF file

    Args:
        pdf_path: Path to PDF file

    Returns:
        int: Number of pages (0 if error)
    """
    try:
        from PyPDF2 import PdfReader
        with open(pdf_path, 'rb') as f:
            pdf = PdfReader(f)
            return len(pdf.pages)
    except Exception:
        # Fallback: convert and count
        try:
            result = pdf_to_images(pdf_path)
            if result['success']:
                # Clean up temporary images
                for img_path in result['image_paths']:
                    try:
                        os.remove(img_path)
                    except:
                        pass
                return result['page_count']
        except Exception:
            pass
    return 0
