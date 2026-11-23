
from flask import Blueprint, request
from database import get_db_connection
from utils.security import verify_password

admin_bp = Blueprint("admin", __name__)


# Admin Login
@admin_bp.route("/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM admins WHERE email = %s",
        (email,)
    )

    admin = cursor.fetchone()

    cursor.close()
    db.close()

    if not admin or not verify_password(admin["password"], password):
        return {
            "success": False,
            "message": "Invalid email or password!"
        }, 401

    return {
        "success": True,
        "message": "Admin login successful!",
        "admin": {
            "admin_id": admin["admin_id"],
            "name": admin["name"],
            "email": admin["email"]
        }
    }, 200
