
from flask import Blueprint, request
from database import get_db_connection

product_bp = Blueprint("product", __name__)


# Get All Products API
@product_bp.route("/", methods=["GET"])
def get_all_products():

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.product_id,
                p.category_id,
                c.category_name,
                p.product_name,
                p.sku,
                p.description,
                p.price,
                p.price_in,
                p.price_us,
                p.available_in,
                p.available_us,
                p.stock_quantity,
                p.product_image,
                p.status,
                p.created_at
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.status = 'active'
            ORDER BY p.product_id DESC
        """)

        products = cursor.fetchall()

        return {
            "success": True,
            "total_products": len(products),
            "products": products
        }, 200

    except Exception as e:
        return {
            "success": False,
            "message": "Unable to fetch products!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Get Single Product API
@product_bp.route("/<int:product_id>", methods=["GET"])
def get_single_product(product_id):

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.product_id = %s
              AND p.status = 'active'
        """, (product_id,))

        product = cursor.fetchone()

        if not product:
            return {
                "success": False,
                "message": "Product not found!"
            }, 404

        return {
            "success": True,
            "product": product
        }, 200

    except Exception as e:
        return {
            "success": False,
            "message": "Unable to fetch product!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Add Product API
@product_bp.route("/", methods=["POST"])
def add_product():

    data = request.get_json()

    required_fields = [
        "product_name",
        "description",
        "stock_quantity",
        "price_in",
        "price_us"
    ]

    if not data or not all(field in data for field in required_fields):
        return {
            "success": False,
            "message": "Required product details are missing!"
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        price_in = data["price_in"]

        cursor.execute("""
            INSERT INTO products
            (
                category_id,
                product_name,
                sku,
                description,
                price,
                price_in,
                price_us,
                available_in,
                available_us,
                stock_quantity,
                product_image,
                status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get("category_id"),
            data["product_name"],
            data.get("sku"),
            data["description"],
            price_in,
            price_in,
            data["price_us"],
            data.get("available_in", 0),
            data.get("available_us", 0),
            data["stock_quantity"],
            data.get("product_image"),
            data.get("status", "active")
        ))

        db.commit()
        new_product_id = cursor.lastrowid

        return {
            "success": True,
            "message": "Product added successfully!",
            "product_id": new_product_id
        }, 201

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to add product!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Update Product API
@product_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):

    data = request.get_json()

    if not data:
        return {
            "success": False,
            "message": "No product details provided!"
        }, 400

    allowed_fields = [
        "category_id",
        "product_name",
        "sku",
        "description",
        "price_in",
        "price_us",
        "available_in",
        "available_us",
        "stock_quantity",
        "product_image",
        "status"
    ]

    update_fields = [
        field for field in allowed_fields if field in data
    ]

    if not update_fields:
        return {
            "success": False,
            "message": "No valid fields to update!"
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        set_parts = []
        values = []

        for field in update_fields:
            set_parts.append(f"{field} = %s")
            values.append(data[field])

            # Keep old price column synchronized with India price
            if field == "price_in":
                set_parts.append("price = %s")
                values.append(data[field])

        set_clause = ", ".join(set_parts)
        values.append(product_id)

        cursor.execute(
            f"UPDATE products SET {set_clause} WHERE product_id = %s",
            tuple(values)
        )

        if cursor.rowcount == 0:
            db.rollback()

            return {
                "success": False,
                "message": "Product not found or no changes made!"
            }, 404

        db.commit()

        return {
            "success": True,
            "message": "Product updated successfully!"
        }, 200

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to update product!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Delete Product API
@product_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM products WHERE product_id = %s",
            (product_id,)
        )

        if cursor.rowcount == 0:
            return {
                "success": False,
                "message": "Product not found!"
            }, 404

        db.commit()

        return {
            "success": True,
            "message": "Product deleted successfully!"
        }, 200

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to delete product!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
