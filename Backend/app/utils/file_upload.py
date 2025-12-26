"""
File Upload Utilities
Handles file uploads with local filesystem storage, designed for easy cloud migration
"""
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename, allowed_extensions=None):
    """
    Check if file extension is allowed

    Args:
        filename: Name of the file
        allowed_extensions: Set of allowed extensions (default from config)

    Returns:
        bool: True if file extension is allowed
    """
    if allowed_extensions is None:
        allowed_extensions = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'pdf'})

    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def get_file_extension(filename):
    """
    Get file extension from filename

    Args:
        filename: Name of the file

    Returns:
        str: File extension (lowercase) or None
    """
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return None


def save_uploaded_file(file, subfolder='', prefix=''):
    """
    Save uploaded file to local filesystem with unique name
    Designed to be easily replaced with cloud storage implementation

    Args:
        file: FileStorage object from request.files
        subfolder: Subfolder within uploads directory (e.g., 'exams', 'submissions')
        prefix: Optional prefix for filename (e.g., 'exam_', 'submission_')

    Returns:
        dict: {
            'success': bool,
            'filepath': str (relative path to file),
            'filename': str (generated filename),
            'error': str (error message if failed)
        }
    """
    try:
        if not file:
            return {'success': False, 'error': 'No file provided'}

        if file.filename == '':
            return {'success': False, 'error': 'No file selected'}

        # Check file extension
        if not allowed_file(file.filename):
            allowed_ext = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'pdf'})
            return {
                'success': False,
                'error': f'File type not allowed. Allowed types: {", ".join(allowed_ext)}'
            }

        # Generate unique filename
        original_filename = secure_filename(file.filename)
        file_ext = get_file_extension(original_filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_id = str(uuid.uuid4())[:8]
        new_filename = f"{prefix}{timestamp}_{unique_id}.{file_ext}"

        # Create upload directory structure
        upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        upload_dir = os.path.join(upload_base, subfolder)

        # Create directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)

        # Full path to save file
        full_path = os.path.join(upload_dir, new_filename)

        # Save file
        file.save(full_path)

        # Return relative path (for database storage)
        relative_path = os.path.join(subfolder, new_filename).replace('\\', '/')

        return {
            'success': True,
            'filepath': relative_path,
            'filename': new_filename,
            'original_filename': original_filename
        }

    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to save file: {str(e)}'
        }


def delete_file(filepath):
    """
    Delete file from local filesystem
    Designed to be easily replaced with cloud storage implementation

    Args:
        filepath: Relative path to file (as stored in database)

    Returns:
        bool: True if file was deleted successfully
    """
    try:
        upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        full_path = os.path.join(upload_base, filepath)

        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False

    except Exception as e:
        current_app.logger.error(f'Failed to delete file {filepath}: {str(e)}')
        return False


def get_file_url(filepath):
    """
    Get URL to access file
    For local storage, returns path. For cloud storage, would return cloud URL

    Args:
        filepath: Relative path to file

    Returns:
        str: URL or path to access file
    """
    # For now, return the filepath as-is
    # In cloud implementation, this would return a signed URL or public URL
    upload_base = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    return os.path.join(upload_base, filepath).replace('\\', '/')
