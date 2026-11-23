
from flask import Blueprint, request
from database import get_db_connection

cart_bp = Blueprint("cart", __name__)


# Add Product to Cart
@cart_bp.route("/add", methods=["POST"])
def add_to_cart():

    data = request.get_json()

    customer_id = data.get("customer_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not customer_id or not product_id or quantity < 1:
        return {
            "success": False,
            "message": "Invalid cart details!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT product_id FROM products WHERE product_id = %s AND status = 'active'",
        (product_id,)
    )

    product = cursor.fetchone()

    if not product:
        cursor.close()
        db.close()
        return {
            "success": False,
            "message": "Product not found!"
        }, 404

    cursor.execute(
        """
        INSERT INTO cart (customer_id, product_id, quantity)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE quantity = quantity + %s
        """,
        (customer_id, product_id, quantity, quantity)
    )

    db.commit()
    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Product added to cart successfully!"
    }, 201


# Get Customer Cart
@cart_bp.route("/<int:customer_id>", methods=["GET"])
def get_cart(customer_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            cart.cart_id,
            cart.product_id,
            products.product_name,
            products.price,
            products.product_image,
            cart.quantity,
            (products.price * cart.quantity) AS subtotal
        FROM cart
        JOIN products ON cart.product_id = products.product_id
        WHERE cart.customer_id = %s
        """,
        (customer_id,)
    )

    cart_items = cursor.fetchall()

    cursor.close()
    db.close()

    total_amount = sum(float(item["subtotal"]) for item in cart_items)

    return {
        "success": True,
        "cart": cart_items,
        "total_amount": total_amount
    }, 200


# Update Cart Quantity
@cart_bp.route("/update/<int:cart_id>", methods=["PUT"])
def update_cart(cart_id):

    data = request.get_json()
    quantity = data.get("quantity")

    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
        return {
            "success": False,
            "message": "Quantity must be at least 1!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE cart SET quantity = %s WHERE cart_id = %s",
        (quantity, cart_id)
    )

    db.commit()
    updated = cursor.rowcount

    cursor.close()
    db.close()

    if updated == 0:
        return {
            "success": False,
            "message": "Cart item not found!"
        }, 404

    return {
        "success": True,
        "message": "Cart quantity updated successfully!"
    }, 200


# Remove Product from Cart
@cart_bp.route("/remove/<int:cart_id>", methods=["DELETE"])
def remove_from_cart(cart_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM cart WHERE cart_id = %s",
        (cart_id,)
    )

    db.commit()
    deleted = cursor.rowcount

    cursor.close()
    db.close()

    if deleted == 0:
        return {
            "success": False,
            "message": "Cart item not found!"
        }, 404

    return {
        "success": True,
        "message": "Product removed from cart successfully!"
    }, 200


# Clear Customer Cart
@cart_bp.route("/clear/<int:customer_id>", methods=["DELETE"])
def clear_cart(customer_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM cart WHERE customer_id = %s",
        (customer_id,)
    )

    db.commit()

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Cart cleared successfully!"
    }, 200
