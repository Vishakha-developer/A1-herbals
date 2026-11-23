
from flask import Blueprint, request
from database import get_db_connection

category_bp = Blueprint("category", __name__)


# Get All Categories API
@category_bp.route("/", methods=["GET"])
def get_all_categories():

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM categories
            ORDER BY category_id DESC
        """)

        categories = cursor.fetchall()

        return {
            "success": True,
            "total_categories": len(categories),
            "categories": categories
        }, 200

    except Exception as e:
        return {
            "success": False,
            "message": "Unable to fetch categories!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Get Single Category API
@category_bp.route("/<int:category_id>", methods=["GET"])
def get_single_category(category_id):

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM categories WHERE category_id = %s",
            (category_id,)
        )

        category = cursor.fetchone()

        if not category:
            return {
                "success": False,
                "message": "Category not found!"
            }, 404

        return {
            "success": True,
            "category": category
        }, 200

    except Exception as e:
        return {
            "success": False,
            "message": "Unable to fetch category!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Add Category API
@category_bp.route("/", methods=["POST"])
def add_category():

    data = request.get_json()

    if not data or not data.get("category_name"):
        return {
            "success": False,
            "message": "Category name is required!"
        }, 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO categories (category_name, description)
            VALUES (%s, %s)
        """, (
            data["category_name"],
            data.get("description")
        ))

        db.commit()
        new_category_id = cursor.lastrowid

        return {
            "success": True,
            "message": "Category added successfully!",
            "category_id": new_category_id
        }, 201

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to add category!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Update Category API
@category_bp.route("/<int:category_id>", methods=["PUT"])
def update_category(category_id):

    data = request.get_json()

    allowed_fields = ["category_name", "description"]

    if not data:
        return {
            "success": False,
            "message": "No category details provided!"
        }, 400

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

        set_clause = ", ".join(
            f"{field} = %s" for field in update_fields
        )

        values = [data[field] for field in update_fields]
        values.append(category_id)

        cursor.execute(
            f"UPDATE categories SET {set_clause} WHERE category_id = %s",
            tuple(values)
        )

        if cursor.rowcount == 0:
            db.rollback()

            return {
                "success": False,
                "message": "Category not found or no changes made!"
            }, 404

        db.commit()

        return {
            "success": True,
            "message": "Category updated successfully!"
        }, 200

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to update category!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# Delete Category API
@category_bp.route("/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM categories WHERE category_id = %s",
            (category_id,)
        )

        if cursor.rowcount == 0:
            db.rollback()

            return {
                "success": False,
                "message": "Category not found!"
            }, 404

        db.commit()

        return {
            "success": True,
            "message": "Category deleted successfully!"
        }, 200

    except Exception as e:
        if db:
            db.rollback()

        return {
            "success": False,
            "message": "Unable to delete category!",
            "error": str(e)
        }, 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
