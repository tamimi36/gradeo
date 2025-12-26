# Exam Scanner Backend API

A Flask-based REST API for an automated exam paper scanning and grading system. This system allows teachers to create exams, submit answer keys, and automatically grade student submissions using OCR technology.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with role assignment
- **Database Design**: Comprehensive schema for exams, questions, submissions, and grading
- **Swagger UI**: Interactive API documentation at `/api/swagger/`
- **Professional Structure**: Well-organized project structure following Flask best practices

## Project Structure

```
Backend/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models/               # Database models
│   │   ├── __init__.py
│   │   ├── user.py          # User, Role, UserRole models
│   │   ├── exam.py          # Exam, Question, AnswerKey models
│   │   ├── submission.py    # Submission, SubmissionAnswer, OCRResult models
│   │   └── grade.py         # Grade, ReviewQueue, GradeAdjustment models
│   └── api/                  # API routes
│       ├── __init__.py      # API blueprint and Swagger setup
│       ├── auth.py          # Authentication routes
│       └── users.py         # User management routes
├── config.py                 # Configuration settings
├── run.py                    # Application entry point
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

## Database Schema

### Core Tables

- **users**: User accounts with authentication
- **roles**: User roles (admin, teacher, student)
- **user_roles**: Many-to-many relationship between users and roles
- **exams**: Exam definitions
- **questions**: Questions within exams (multiple choice or open-ended)
- **question_options**: Options for multiple choice questions
- **answer_keys**: Teacher-submitted answer keys
- **submissions**: Student exam submissions
- **submission_answers**: Extracted answers from OCR
- **ocr_results**: OCR processing results
- **grades**: Final grades for submissions
- **review_queue**: Questions flagged for teacher review
- **grade_adjustments**: Manual grade corrections

## Installation

1. **Clone the repository** (if applicable)

2. **Create a virtual environment**:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Initialize the database**:

   **Quick Setup (Recommended)**:
   ```bash
   python setup.py
   ```
   This will create all database tables and default roles automatically.

   **Alternative: Using Flask-Migrate (For production)**:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   python scripts/init_db.py  # Create default roles
   ```

6. **Create an admin user (optional)**:
   ```bash
   python scripts/init_db.py --create-admin admin admin@example.com password123 "Admin" "User"
   ```

7. **Run the application**:
```bash
python run.py
```

The API will be available at `http://localhost:5001`

## API Documentation

Once the server is running, access the Swagger UI at:
- **Swagger UI**: `http://localhost:5001/api/swagger/`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user information

### User Management (`/api/users`)

- `GET /api/users` - Get list of users (Admin/Teacher only)
- `GET /api/users/<id>` - Get user by ID
- `PUT /api/users/<id>` - Update user
- `DELETE /api/users/<id>` - Delete user (Admin only)
- `GET /api/users/<id>/roles` - Get user roles (Admin only)
- `POST /api/users/<id>/roles` - Assign role to user (Admin only)
- `DELETE /api/users/<id>/roles` - Remove role from user (Admin only)

## Usage Examples

### Register a User

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "role": "teacher"
  }'
```

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "password": "securepassword"
  }'
```

### Get Current User (with JWT token)

```bash
# First, save your token from login response
TOKEN="YOUR_ACCESS_TOKEN"

# Then use it in the Authorization header
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Note:** For detailed authentication examples and usage in different languages, see [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)

## Configuration

Key configuration options in `config.py`:

- `SECRET_KEY`: Flask secret key for sessions
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `SQLALCHEMY_DATABASE_URI`: Database connection string
- `UPLOAD_FOLDER`: Directory for uploaded files
- `MAX_CONTENT_LENGTH`: Maximum file upload size (16MB default)

## Database Migrations

This project uses Flask-Migrate for database version control:

```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback last migration
flask db downgrade
```

## Security Considerations

- Change `SECRET_KEY` and `JWT_SECRET_KEY` in production
- Use environment variables for sensitive configuration
- Implement rate limiting for production
- Add token blacklisting for logout functionality
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement proper file upload validation

## Future Enhancements

- Exam creation and management endpoints
- Answer key submission endpoints
- Student submission upload endpoints
- OCR integration endpoints
- Automated grading endpoints
- Review queue management endpoints
- Grade adjustment endpoints
- Email verification
- Password reset functionality
- File storage integration (S3, etc.)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

