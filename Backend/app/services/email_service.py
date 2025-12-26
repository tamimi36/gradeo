"""
Email Service for sending OTP and other emails
"""
from flask import current_app
from flask_mail import Message
from app import mail
import logging

logger = logging.getLogger(__name__)


def send_email(subject, recipient, body_text, body_html=None):
    """
    Send an email using Flask-Mail.

    Args:
        subject: Email subject
        recipient: Recipient email address
        body_text: Plain text body
        body_html: HTML body (optional)
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        sender = current_app.config.get('MAIL_DEFAULT_SENDER') or current_app.config.get('MAIL_USERNAME')
        if not sender:
            logger.error("MAIL_DEFAULT_SENDER or MAIL_USERNAME missing in config.")
            return False

        if not current_app.config.get('MAIL_USERNAME') or not current_app.config.get('MAIL_PASSWORD'):
            logger.error("MAIL_USERNAME and MAIL_PASSWORD must be set in config.")
            return False

        msg = Message(
            subject=subject,
            recipients=[recipient],
            body=body_text,
            html=body_html,
            sender=sender
        )
        mail.send(msg)
        logger.info(f"Email sent successfully to {recipient}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email to {recipient}: {str(e)}")
        return False


def send_otp_email(email, otp_code, otp_type='registration'):
    """
    Send OTP verification email to user.

    Args:
        email: Recipient email
        otp_code: The OTP code
        otp_type: 'registration' or 'login'
    """
    if otp_type == 'registration':
        subject = 'Verify Your Email - Registration OTP'
        greeting = 'Welcome to Gradeo!'
        action = 'complete your registration'
    else:
        subject = 'Login Verification Code'
        greeting = 'Verify Your Login'
        action = 'verify your login'

    # Plain text version
    body_text = f"""
Hello,

Your verification code is: {otp_code}

Please enter this code to {action}.

This code will expire in 5 minutes.

If you didn't request this code, please contact us at help.gradeo@outlook.com

Best regards,
The Gradeo Team
    """.strip()

    # HTML version with Apple-like bold text
    body_html = f"""
<html>
  <body style="margin:0; padding:0; background:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1c1c1e;">

    <div style="max-width:600px; margin:0 auto; padding:28px;">

        <h2 style="color:#374151; font-size:24px; font-weight:700; margin-bottom:14px;">
            {greeting}
        </h2>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Your verification code is:
        </p>

        <div style="background:#f5f5f7; padding:18px; border-radius:10px; text-align:center; margin:22px 0;">
            <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#111;">
                {otp_code}
            </span>
        </div>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Please enter this code to {action}.
        </p>

        <p style="font-size:15px; font-weight:600; color:#6e6e73; margin:10px 0 22px;">
            This code will expire in 5 minutes.
        </p>

        <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:14px; margin:22px 0; border-radius:4px;">
            <p style="font-size:15px; font-weight:600; color:#856404; margin:0;">
                Never share this code with anyone. If you did not request this code, or if you need any further help, please contact us at 
                <a href="mailto:help.gradeo@outlook.com" style="color:#856404; text-decoration:none; font-weight:700;">
                    help.gradeo@outlook.com
                </a>
            </p>
        </div>

        <hr style="border:0; border-top:1px solid #e5e5ea; margin:24px 0;">

        <p style="font-size:14px; font-weight:500; color:#6b7280; margin-top:28px; line-height:1.5;">
            Best regards,<br>
            <span style="font-weight:500; color:#6b7280;">The Gradeo Team</span>
        </p>

    </div>

  </body>
</html>
"""

    return send_email(subject, email, body_text, body_html)


def send_welcome_email(email, first_name):
    """
    Send welcome email after successful registration.
    """
    subject = 'Welcome to Gradeo!'

    body_text = f"""
Hello {first_name},

Welcome to Gradeo! Your account has been successfully verified.

You can now log in and start using our exam scanning and grading platform.

Best regards,
The Gradeo Team
    """.strip()

    body_html = f"""
<html>
  <body style="margin:0; padding:0; background:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1c1c1e;">

    <div style="max-width:600px; margin:0 auto; padding:28px;">

        <h2 style="color:#374151; font-size:24px; font-weight:700; margin-bottom:16px;">
            Welcome to Gradeo!
        </h2>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Hello {first_name},
        </p>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Welcome to Gradeo! Your account has been successfully verified.
        </p>

        <p style="font-size:16px; font-weight:600; margin:0 0 24px;">
            You can now log in and start using our exam scanning and grading platform.
        </p>

        <hr style="border:0; border-top:1px solid #e5e5ea; margin:26px 0;">

        <p style="font-size:14px; font-weight:500; color:#6b7280; margin-top:28px; line-height:1.5;">
            Best regards,<br>
            <span style="font-weight:500; color:#6b7280;">The Gradeo Team</span>
        </p>

    </div>

  </body>
</html>
"""

    return send_email(subject, email, body_text, body_html)


def send_password_reset_email(email, reset_token):
    """
    Send password reset email with token.

    Args:
        email: Recipient email
        reset_token: The password reset token (6-digit code)
    """
    subject = 'Password Reset Request - Gradeo'

    # Plain text version
    body_text = f"""
Hello,

You requested to reset your password for your Gradeo account.

Your password reset code is: {reset_token}

Please enter this code to reset your password. This code will expire in 5 minutes.

If you didn't request a password reset, please contact us at help.gradeo@outlook.com

For security reasons, never share this code with anyone.

Best regards,
The Gradeo Team
    """.strip()

    # HTML version with Apple-like bold text
    body_html = f"""
<html>
  <body style="margin:0; padding:0; background:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1c1c1e;">

    <div style="max-width:600px; margin:0 auto; padding:28px;">

        <h2 style="color:#374151; font-size:24px; font-weight:700; margin-bottom:14px;">
            Password Reset Request
        </h2>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Your password reset code is:
        </p>

        <div style="background:#f5f5f7; padding:18px; border-radius:10px; text-align:center; margin:22px 0;">
            <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#111;">
                {reset_token}
            </span>
        </div>

        <p style="font-size:16px; font-weight:600; margin:0 0 14px;">
            Please enter this code to reset your password. This code will expire in 5 minutes.
        </p>

        <div style="background:#fff3cd; border-left:4px solid #ffc107; padding:14px; margin:22px 0; border-radius:4px;">
            <p style="font-size:15px; font-weight:600; color:#856404; margin:0;">
                Never share this code with anyone. If you did not request this password reset, or if you need any further help, please contact us at 
                <a href="mailto:help.gradeo@outlook.com" style="color:#856404; text-decoration:none; font-weight:700;">
                    help.gradeo@outlook.com
                </a>
            </p>
        </div>

        <hr style="border:0; border-top:1px solid #e5e5ea; margin:24px 0;">

        <p style="font-size:14px; font-weight:500; color:#6b7280; margin-top:28px; line-height:1.5;">
            Best regards,<br>
            <span style="font-weight:500; color:#6b7280;">The Gradeo Team</span>
        </p>

    </div>

  </body>
</html>
"""

    return send_email(subject, email, body_text, body_html)
