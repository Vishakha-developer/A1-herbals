
from flask import Blueprint
from database import get_db_connection

admin_customer_bp = Blueprint("admin_customer", __name__)


# Admin - Get All Customers
@admin_customer_bp.route("/", methods=["GET"])
def get_all_customers():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            customer_id,
            first_name,
            last_name,
            email,
            phone,
            created_at
        FROM customers
        ORDER BY created_at DESC
        """
    )

    customers = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "total_customers": len(customers),
        "customers": customers
    }, 200


# Admin - Get Customer Details
@admin_customer_bp.route("/<int:customer_id>", methods=["GET"])
def get_customer_details(customer_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Customer Information
    cursor.execute(
        """
        SELECT
            customer_id,
            first_name,
            last_name,
            email,
            phone,
            created_at
        FROM customers
        WHERE customer_id = %s
        """,
        (customer_id,)
    )

    customer = cursor.fetchone()

    if not customer:
        cursor.close()
        db.close()

        return {
            "success": False,
            "message": "Customer not found!"
        }, 404

    # Customer Addresses
    cursor.execute(
        """
        SELECT *
        FROM addresses
        WHERE customer_id = %s
        ORDER BY is_default DESC, created_at DESC
        """,
        (customer_id,)
    )

    addresses = cursor.fetchall()

    # Customer Orders
    cursor.execute(
        """
        SELECT
            order_id,
            total_amount,
            payment_method,
            payment_status,
            order_status,
            order_date
        FROM orders
        WHERE customer_id = %s
        ORDER BY order_date DESC
        """,
        (customer_id,)
    )

    orders = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "customer": customer,
        "addresses": addresses,
        "orders": orders
    }, 200
