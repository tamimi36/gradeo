# Troubleshooting Guide

## Common Issues and Solutions

### 1. ImportError: Can't find Python file migrations/env.py

**Problem**: This error occurs when trying to run `flask db upgrade` but Flask-Migrate hasn't been initialized.

**Solution**: 
- If you haven't initialized migrations yet, run:
  ```bash
  flask db init
  ```
- If you want to skip migrations for now, use the setup script instead:
  ```bash
  python setup.py
  ```
  This uses `db.create_all()` which doesn't require migrations.

### 2. ModuleNotFoundError: No module named 'app'

**Problem**: This happens when running scripts from the wrong directory or when Python can't find the app module.

**Solution**: 
- Always run scripts from the project root directory:
  ```bash
  cd /Users/hashim/Documents/Competetions/Faud\ Farraj/Backend
  python scripts/init_db.py
  ```
- Or use the setup script which handles paths automatically:
  ```bash
  python setup.py
  ```

### 3. Database Already Exists Error

**Problem**: SQLite database file already exists but schema is different.

**Solution**:
- Delete the existing database file:
  ```bash
  rm exam_scanner.db
  python setup.py
  ```
- Or use Flask-Migrate to handle schema changes:
  ```bash
  flask db migrate -m "Update schema"
  flask db upgrade
  ```

### 4. Port Already in Use

**Problem**: Port 5000 is already in use by another application.

**Solution**:
- Change the port in `run.py`:
  ```python
  app.run(debug=True, host='0.0.0.0', port=5001)
  ```
- Or kill the process using port 5000:
  ```bash
  lsof -ti:5000 | xargs kill -9
  ```

### 5. JWT Token Errors

**Problem**: "Invalid token" or "Token expired" errors.

**Solution**:
- Make sure you're including the token in the Authorization header:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```
- Check token expiration settings in `config.py`
- Generate a new token by logging in again

### 6. CORS Errors (Frontend Integration)

**Problem**: CORS errors when accessing API from frontend.

**Solution**:
- Update CORS configuration in `app/__init__.py`:
  ```python
  cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
  ```
- Or configure specific origins in production

### 7. File Upload Issues

**Problem**: File uploads fail or are rejected.

**Solution**:
- Check file size limits in `config.py` (MAX_CONTENT_LENGTH)
- Verify file extensions are in ALLOWED_EXTENSIONS
- Ensure UPLOAD_FOLDER directory exists:
  ```bash
  mkdir -p uploads
  ```

## Getting Help

If you encounter other issues:
1. Check the application logs
2. Verify all dependencies are installed: `pip install -r requirements.txt`
3. Ensure you're using Python 3.8 or higher
4. Check that the database file has proper permissions

