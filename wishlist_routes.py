
from flask import Blueprint, request
from database import get_db_connection

wishlist_bp = Blueprint("wishlist", __name__)


# Add Product to Wishlist
@wishlist_bp.route("/add", methods=["POST"])
def add_to_wishlist():

    data = request.get_json()

    customer_id = data.get("customer_id")
    product_id = data.get("product_id")

    if not customer_id or not product_id:
        return {
            "success": False,
            "message": "Customer ID and Product ID are required!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "SELECT product_id FROM products WHERE product_id = %s AND status = 'active'",
        (product_id,)
    )

    if not cursor.fetchone():
        cursor.close()
        db.close()
        return {
            "success": False,
            "message": "Product not found!"
        }, 404

    cursor.execute(
        """
        INSERT IGNORE INTO wishlist (customer_id, product_id)
        VALUES (%s, %s)
        """,
        (customer_id, product_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Product added to wishlist successfully!"
    }, 201


# Get Customer Wishlist
@wishlist_bp.route("/<int:customer_id>", methods=["GET"])
def get_wishlist(customer_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            wishlist.wishlist_id,
            products.product_id,
            products.product_name,
            products.description,
            products.price,
            products.product_image
        FROM wishlist
        JOIN products ON wishlist.product_id = products.product_id
        WHERE wishlist.customer_id = %s
        """,
        (customer_id,)
    )

    wishlist_items = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "wishlist": wishlist_items
    }, 200


# Remove Product from Wishlist
@wishlist_bp.route("/remove/<int:wishlist_id>", methods=["DELETE"])
def remove_from_wishlist(wishlist_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM wishlist WHERE wishlist_id = %s",
        (wishlist_id,)
    )

    db.commit()
    deleted = cursor.rowcount

    cursor.close()
    db.close()

    if deleted == 0:
        return {
            "success": False,
            "message": "Wishlist item not found!"
        }, 404

    return {
        "success": True,
        "message": "Product removed from wishlist successfully!"
    }, 200
