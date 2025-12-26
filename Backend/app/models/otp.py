"""
OTP Model for Email Verification
"""
from datetime import datetime, timedelta
import random
import string
from app import db


class OTP(db.Model):
    """OTP model for email verification during registration and login"""
    __tablename__ = 'otps'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    otp_code = db.Column(db.String(6), nullable=False)
    otp_type = db.Column(db.String(20), nullable=False)  # 'registration' or 'login'
    is_used = db.Column(db.Boolean, default=False, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Store registration data temporarily for registration OTPs
    temp_user_data = db.Column(db.Text, nullable=True)  # JSON string with user registration data

    def __repr__(self):
        return f'<OTP {self.email} - {self.otp_type}>'

    @staticmethod
    def generate_otp_code():
        """Generate a random 6-digit OTP code"""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def create_otp(email, otp_type, user_data=None, expires_in_minutes=10):
        """
        Create a new OTP for the given email

        Args:
            email: User's email address
            otp_type: Type of OTP ('registration' or 'login')
            user_data: Temporary user data (for registration OTPs)
            expires_in_minutes: OTP expiry time in minutes (default: 10)

        Returns:
            OTP object
        """
        # Invalidate any existing OTPs for this email and type
        OTP.query.filter_by(email=email, otp_type=otp_type, is_used=False).update({'is_used': True})
        db.session.commit()

        # Generate new OTP
        otp_code = OTP.generate_otp_code()
        expires_at = datetime.utcnow() + timedelta(minutes=expires_in_minutes)

        otp = OTP(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            expires_at=expires_at,
            temp_user_data=user_data
        )

        db.session.add(otp)
        db.session.commit()

        return otp

    def is_valid(self):
        """Check if OTP is valid (not expired and not used)"""
        if self.is_used:
            return False
        if datetime.utcnow() > self.expires_at:
            return False
        return True

    def mark_as_used(self):
        """Mark OTP as used"""
        self.is_used = True
        db.session.commit()

    @staticmethod
    def verify_otp(email, otp_code, otp_type):
        """
        Verify OTP code for the given email

        Args:
            email: User's email address
            otp_code: OTP code to verify
            otp_type: Type of OTP ('registration' or 'login')

        Returns:
            OTP object if valid, None otherwise
        """
        otp = OTP.query.filter_by(
            email=email,
            otp_code=otp_code,
            otp_type=otp_type,
            is_used=False
        ).first()

        if otp and otp.is_valid():
            return otp

        return None

    def to_dict(self):
        """Convert OTP to dictionary (without sensitive data)"""
        return {
            'id': self.id,
            'email': self.email,
            'otp_type': self.otp_type,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_used': self.is_used
        }
