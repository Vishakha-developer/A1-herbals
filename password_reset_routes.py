
from flask import Blueprint, request, current_app
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from database import get_db_connection
from utils.security import hash_password

password_reset_bp = Blueprint("password_reset", __name__)


# Generate secure reset token
def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
    return serializer.dumps(email, salt="password-reset-salt")


# Verify reset token
def verify_reset_token(token):
    serializer = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])

    try:
        email = serializer.loads(
            token,
            salt="password-reset-salt",
            max_age=900
        )
        return email

    except (SignatureExpired, BadSignature):
        return None


# Forgot Password API
@password_reset_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT customer_id, email FROM customers WHERE email = %s",
            (email,)
        )

        customer = cursor.fetchone()

        if customer:
            token = generate_reset_token(customer["email"])

            reset_link = (
                current_app.config["FRONTEND_RESET_URL"]
                + "?token="
                + token
            )

            msg = Message(
                subject="A1 Herbals - Password Reset",
                sender=current_app.config["MAIL_USERNAME"],
                recipients=[customer["email"]]
            )

            msg.body = f"""
Hello,

We received a request to reset your A1 Herbals account password.

Click the link below to create a new password:

{reset_link}

This link expires in 15 minutes.

If you did not request this, please ignore this email.
"""

            current_app.extensions["mail"].send(msg)

        return {
            "success": True,
            "message": "If this email is registered, a password reset link will be sent."
        }, 200

    except Exception:
        current_app.logger.exception("Forgot password error")

        return {
            "success": False,
            "message": "Unable to process your request. Please try again."
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Reset Password API
@password_reset_bp.route("/reset-password", methods=["POST"])
def reset_password():

    data = request.get_json() or {}

    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return {
            "success": False,
            "message": "Token and new password are required."
        }, 400

    if len(new_password) < 8:
        return {
            "success": False,
            "message": "Password must contain at least 8 characters."
        }, 400

    email = verify_reset_token(token)

    if not email:
        return {
            "success": False,
            "message": "Reset link is invalid or expired."
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        hashed_password = hash_password(new_password)

        cursor.execute(
            "UPDATE customers SET password = %s WHERE email = %s",
            (hashed_password, email)
        )

        if cursor.rowcount == 0:
            return {
                "success": False,
                "message": "Customer account not found."
            }, 404

        db.commit()

        return {
            "success": True,
            "message": "Password reset successfully. Please login."
        }, 200

    except Exception:
        if db:
            db.rollback()

        current_app.logger.exception("Reset password error")

        return {
            "success": False,
            "message": "Unable to reset password. Please try again."
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
