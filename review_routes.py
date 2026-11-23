
from flask import Blueprint, request
from database import get_db_connection

review_bp = Blueprint("review", __name__)


# Add Product Review
@review_bp.route("/add", methods=["POST"])
def add_review():

    data = request.get_json() or {}

    customer_id = data.get("customer_id")
    product_id = data.get("product_id")
    rating = data.get("rating")
    review_title = data.get("review_title")
    review_text = data.get("review_text")

    if not customer_id or not product_id or not isinstance(rating, int) or isinstance(rating, bool) or rating < 1 or rating > 5:
        return {
            "success": False,
            "message": "Invalid review details! Rating must be between 1 and 5."
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO reviews
        (customer_id, product_id, rating, review_title, review_text)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        review_title = VALUES(review_title),
        review_text = VALUES(review_text),
        updated_at = CURRENT_TIMESTAMP
        """,
        (customer_id, product_id, rating, review_title, review_text)
    )

    db.commit()

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Review submitted successfully!"
    }, 201


# Get Product Reviews
@review_bp.route("/product/<int:product_id>", methods=["GET"])
def get_product_reviews(product_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            reviews.review_id,
            reviews.rating,
            reviews.review_title,
            reviews.review_text,
            reviews.created_at,
            customers.first_name,
            customers.last_name
        FROM reviews
        JOIN customers
        ON reviews.customer_id = customers.customer_id
        WHERE reviews.product_id = %s
        ORDER BY reviews.created_at DESC
        """,
        (product_id,)
    )

    reviews = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "reviews": reviews
    }, 200


# Admin - Get All Reviews
@review_bp.route("/admin/all", methods=["GET"])
def get_all_reviews():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            reviews.*,
            customers.first_name,
            customers.last_name,
            products.product_name
        FROM reviews
        JOIN customers
        ON reviews.customer_id = customers.customer_id
        JOIN products
        ON reviews.product_id = products.product_id
        ORDER BY reviews.created_at DESC
        """
    )

    reviews = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "reviews": reviews
    }, 200


# Delete Review
@review_bp.route("/delete/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM reviews WHERE review_id = %s",
        (review_id,)
    )

    db.commit()
    deleted = cursor.rowcount

    cursor.close()
    db.close()

    if deleted == 0:
        return {
            "success": False,
            "message": "Review not found!"
        }, 404

    return {
        "success": True,
        "message": "Review deleted successfully!"
    }, 200
