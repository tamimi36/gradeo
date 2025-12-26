# OTP Implementation Guide

## Overview
Email-based OTP (One-Time Password) verification has been successfully added to your Flask backend for local registration and login.

## What Was Implemented

### 1. **New Database Model**: `OTP`
- Located in: `app/models/otp.py`
- Stores verification codes with 10-minute expiry
- Supports both registration and login OTP types
- Auto-invalidates old OTPs when new ones are created

### 2. **Email Service**
- Located in: `app/services/email_service.py`
- Sends beautifully formatted HTML emails
- Functions:
  - `send_otp_email()` - Sends OTP codes
  - `send_welcome_email()` - Sends welcome email after verification

### 3. **Modified Endpoints**

#### `/api/auth/register` (POST)
- **Old behavior**: Created user immediately
- **New behavior**:
  - Validates registration data
  - Generates 6-digit OTP
  - Sends OTP to user's email
  - Stores registration data temporarily
  - User must verify OTP to complete registration

#### `/api/auth/login` (POST)
- **Old behavior**: Logged in immediately
- **New behavior**:
  - If user is not verified, sends OTP to email
  - Verified users or OAuth users login normally
  - Unverified users must enter OTP to complete login

### 4. **New Endpoints**

#### `/api/auth/verify-otp` (POST)
Verifies OTP code and completes registration or login.

**Request:**
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "otp_type": "registration"  // or "login"
}
```

**Response (Success):**
```json
{
  "message": "Registration successful! You are now logged in.",
  "status": "success",
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}
```

#### `/api/auth/resend-otp` (POST)
Resends OTP if it expired or wasn't received.

**Request:**
```json
{
  "email": "user@example.com",
  "otp_type": "registration"  // or "login"
}
```

## Configuration

### Required: Add Email Settings to `.env`

Add these variables to your `.env` file:

```env
# Email Configuration (Required for OTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Optional: Customize OTP settings
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

### For Gmail Users:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Use the generated 16-character password as `MAIL_PASSWORD`

### For Other Email Providers:

Update the SMTP settings accordingly:

**Outlook/Hotmail:**
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=True
```

**SendGrid:**
```env
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
```

## Testing the Implementation

### 1. **Test Registration Flow**

```bash
# Step 1: Register (sends OTP)
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "role": "student"
  }'

# Expected Response:
# {
#   "message": "Verification code sent to test@example.com. Please check your email...",
#   "status": "success",
#   "email": "test@example.com"
# }

# Step 2: Check email for OTP code (6 digits)

# Step 3: Verify OTP
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456",
    "otp_type": "registration"
  }'

# Expected Response:
# {
#   "message": "Registration successful! You are now logged in.",
#   "status": "success",
#   "access_token": "...",
#   "refresh_token": "...",
#   "user": { ... }
# }
```

### 2. **Test Login Flow (Unverified User)**

```bash
# Step 1: Login (sends OTP if not verified)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# If not verified, expected response:
# {
#   "message": "Account not verified. Verification code sent to test@example.com...",
#   "status": "verification_required",
#   "email": "test@example.com",
#   "requires_otp": true
# }

# Step 2: Verify OTP
curl -X POST http://localhost:5001/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_code": "123456",
    "otp_type": "login"
  }'
```

### 3. **Test Resend OTP**

```bash
curl -X POST http://localhost:5001/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp_type": "registration"
  }'
```

## Important Notes

### What's Protected:
- ✅ Local registration (email/password) requires OTP
- ✅ Local login for unverified accounts requires OTP
- ✅ OTP expires after 10 minutes
- ✅ Old OTPs are automatically invalidated when new ones are generated
- ✅ Users are marked as verified after successful OTP verification

### What's NOT Affected:
- ✅ OAuth login (Google/Microsoft) works as before - no OTP required
- ✅ Already verified users can login normally without OTP
- ✅ All other endpoints remain unchanged

### Security Features:
- Passwords are hashed before storage
- OTP codes are random 6-digit numbers
- OTP codes expire after 10 minutes
- Used OTPs cannot be reused
- Old OTPs are invalidated when new ones are created

## Frontend Integration Guide

### Registration Flow:
```javascript
// Step 1: Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username, email, password, first_name, last_name, role
  })
});

if (registerResponse.ok) {
  // Show OTP input form
  showOTPInput(email, 'registration');
}

// Step 2: Verify OTP
const verifyResponse = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    otp_code: userEnteredOTP,
    otp_type: 'registration'
  })
});

if (verifyResponse.ok) {
  const { access_token, user } = await verifyResponse.json();
  // Store tokens and redirect to dashboard
}
```

### Login Flow:
```javascript
// Step 1: Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const loginData = await loginResponse.json();

if (loginData.status === 'verification_required') {
  // Show OTP input form
  showOTPInput(loginData.email, 'login');
} else if (loginData.status === 'success') {
  // User is verified, proceed with login
  const { access_token, user } = loginData;
  // Store tokens and redirect to dashboard
}

// Step 2: Verify OTP (if needed)
// Same as registration
```

## Troubleshooting

### OTP emails not being sent:
1. Check email configuration in `.env`
2. Verify SMTP credentials are correct
3. For Gmail: Ensure App Password is used (not regular password)
4. Check Flask app logs for email errors

### "Failed to send verification email" error:
- Email service configuration is missing or incorrect
- SMTP server is unreachable
- Check logs in terminal for detailed error messages

### OTP code always "Invalid or expired":
- OTP might have expired (10 minutes)
- User might be entering wrong code
- Check if OTP was created successfully in database

### Migration issues:
- Already handled during implementation
- OTP table is created and ready to use

## Database Schema

```sql
CREATE TABLE otps (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_type VARCHAR(20) NOT NULL,  -- 'registration' or 'login'
    is_used BOOLEAN NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    temp_user_data TEXT,  -- JSON string for registration data
    INDEX ix_otps_email (email)
);
```

## Next Steps

1. **Configure Email**: Add email settings to `.env` file
2. **Test**: Try registering a new user
3. **Frontend**: Update your frontend to handle OTP flow
4. **Production**: Consider using a dedicated email service (SendGrid, AWS SES, etc.) for production

## Support

For issues or questions, refer to:
- Flask-Mail documentation: https://pythonhosted.org/Flask-Mail/
- Source files:
  - `app/models/otp.py` - OTP model
  - `app/services/email_service.py` - Email functions
  - `app/api/auth.py` - Authentication endpoints
