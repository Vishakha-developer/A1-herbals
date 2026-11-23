
from flask import Blueprint, request
from database import get_db_connection

newsletter_bp = Blueprint("newsletter", __name__)


# Subscribe to Newsletter
@newsletter_bp.route("/subscribe", methods=["POST"])
def subscribe_newsletter():

    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return {
            "success": False,
            "message": "Email address is required!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT subscriber_id, status FROM newsletter_subscribers WHERE email = %s",
        (email,)
    )

    existing = cursor.fetchone()

    if existing:
        if existing["status"] == "Subscribed":
            cursor.close()
            db.close()

            return {
                "success": True,
                "message": "You are already subscribed!"
            }, 200

        cursor.execute(
            """
            UPDATE newsletter_subscribers
            SET status = 'Subscribed', subscribed_at = CURRENT_TIMESTAMP
            WHERE subscriber_id = %s
            """,
            (existing["subscriber_id"],)
        )

        db.commit()
        cursor.close()
        db.close()

        return {
            "success": True,
            "message": "Newsletter subscription activated successfully!"
        }, 200

    cursor.execute(
        """
        INSERT INTO newsletter_subscribers (email)
        VALUES (%s)
        """,
        (email,)
    )

    db.commit()
    subscriber_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Newsletter subscribed successfully!",
        "subscriber_id": subscriber_id
    }, 201


# Admin - View All Subscribers
@newsletter_bp.route("/admin/all", methods=["GET"])
def get_subscribers():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM newsletter_subscribers
        ORDER BY subscribed_at DESC
        """
    )

    subscribers = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "subscribers": subscribers
    }, 200


# Unsubscribe from Newsletter
@newsletter_bp.route("/unsubscribe", methods=["PUT"])
def unsubscribe_newsletter():

    data = request.get_json() or {}
    email = data.get("email")

    if not email:
        return {
            "success": False,
            "message": "Email address is required!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        UPDATE newsletter_subscribers
        SET status = 'Unsubscribed'
        WHERE email = %s AND status = 'Subscribed'
        """,
        (email,)
    )

    db.commit()
    updated = cursor.rowcount

    cursor.close()
    db.close()

    if updated == 0:
        return {
            "success": False,
            "message": "Active subscription not found!"
        }, 404

    return {
        "success": True,
        "message": "You have unsubscribed successfully!"
    }, 200
