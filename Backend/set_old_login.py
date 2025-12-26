"""
Set last_login to 8 days ago to test OTP requirement
"""
from app import db, create_app
from app.models.user import User
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    # Update a specific user by email or username
    user_email = input("Enter user email to update: ")

    user = User.query.filter_by(email=user_email).first()

    if user:
        # Set last_login to 8 days ago
        eight_days_ago = datetime.utcnow() - timedelta(days=8)
        user.last_login = eight_days_ago
        db.session.commit()

        print(f"\n✅ Success!")
        print(f"User: {user.email}")
        print(f"Last login set to: {user.last_login}")
        print(f"This is {(datetime.utcnow() - user.last_login).days} days ago")
        print(f"\nNow try logging in - OTP will be required!")
    else:
        print(f"❌ User not found with email: {user_email}")
