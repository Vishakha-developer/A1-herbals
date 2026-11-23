from flask import Blueprint, request
from database import get_db_connection
from utils.security import hash_password, verify_password

customer_bp = Blueprint("customer", __name__)


# Customer Registration API
@customer_bp.route("/register", methods=["POST"])
def register_customer():

    data = request.get_json()

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([first_name, last_name, email, phone, password]):
        return {
            "success": False,
            "message": "All fields are required!"
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT customer_id FROM customers WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return {
                "success": False,
                "message": "Email already registered!"
            }, 409

        hashed_password = hash_password(password)

        cursor.execute(
            """
            INSERT INTO customers
            (first_name, last_name, email, phone, password)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (first_name, last_name, email, phone, hashed_password)
        )

        db.commit()

        return {
            "success": True,
            "message": "Customer registered successfully!"
        }, 201

    except Exception as e:
        return {
            "success": False,
            "message": "Registration failed!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Customer Login API
@customer_bp.route("/login", methods=["POST"])
def login_customer():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {
            "success": False,
            "message": "Email and password are required!"
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM customers WHERE email = %s",
            (email,)
        )

        customer = cursor.fetchone()

        if not customer or not verify_password(customer["password"], password):
            return {
                "success": False,
                "message": "Invalid email or password!"
            }, 401

        return {
            "success": True,
            "message": "Login successful!",
            "customer": {
                "customer_id": customer["customer_id"],
                "first_name": customer["first_name"],
                "last_name": customer["last_name"],
                "email": customer["email"],
                "phone": customer["phone"]
            }
        }, 200

    except Exception as e:
        return {
            "success": False,
            "message": "Login failed!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()