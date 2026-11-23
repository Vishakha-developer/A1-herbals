
from flask import Blueprint, request
from database import get_db_connection

contact_bp = Blueprint("contact", __name__)


# Submit Contact Message
@contact_bp.route("/submit", methods=["POST"])
def submit_contact():

    data = request.get_json() or {}

    customer_name = data.get("customer_name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    if not customer_name or not email or not subject or not message:
        return {
            "success": False,
            "message": "Please fill all required fields!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO contact_messages
        (customer_name, email, phone, subject, message)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            customer_name,
            email,
            data.get("phone"),
            subject,
            message
        )
    )

    db.commit()
    message_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Your message has been submitted successfully!",
        "message_id": message_id
    }, 201


# Admin - View All Contact Messages
@contact_bp.route("/admin/all", methods=["GET"])
def get_contact_messages():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM contact_messages
        ORDER BY created_at DESC
        """
    )

    messages = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "messages": messages
    }, 200


# Admin - Update Message Status
@contact_bp.route("/admin/update/<int:message_id>", methods=["PUT"])
def update_message_status(message_id):

    data = request.get_json() or {}
    status = data.get("status")

    allowed_status = ["New", "Read", "Replied"]

    if status not in allowed_status:
        return {
            "success": False,
            "message": "Invalid message status!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE contact_messages
        SET status = %s
        WHERE message_id = %s
        """,
        (status, message_id)
    )

    db.commit()
    updated = cursor.rowcount

    cursor.close()
    db.close()

    if updated == 0:
        return {
            "success": False,
            "message": "Message not found or status unchanged!"
        }, 404

    return {
        "success": True,
        "message": "Message status updated successfully!"
    }, 200
