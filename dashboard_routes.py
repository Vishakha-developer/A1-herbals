
from flask import Blueprint
from database import get_db_connection

dashboard_bp = Blueprint("dashboard", __name__)


# Admin Dashboard API
@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard_data():

    db = None
    cursor = None

    try:

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Total Products
        cursor.execute("""
            SELECT COUNT(*) AS total_products
            FROM products
        """)
        products = cursor.fetchone()

        # Total Categories
        cursor.execute("""
            SELECT COUNT(*) AS total_categories
            FROM categories
        """)
        categories = cursor.fetchone()

        # Total Orders
        cursor.execute("""
            SELECT COUNT(*) AS total_orders
            FROM orders
        """)
        orders = cursor.fetchone()

        # Total Customers
        cursor.execute("""
            SELECT COUNT(*) AS total_customers
            FROM customers
        """)
        customers = cursor.fetchone()

        # Total Revenue from Delivered Orders
        cursor.execute("""
            SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
            FROM orders
            WHERE order_status = 'Delivered'
        """)
        revenue = cursor.fetchone()

        # Recent Orders
        cursor.execute("""
            SELECT
                o.order_id,
                CONCAT(c.first_name, ' ', COALESCE(c.last_name, '')) AS customer_name,
                o.order_date,
                o.total_amount,
                o.order_status

            FROM orders o

            JOIN customers c
            ON o.customer_id = c.customer_id

            ORDER BY o.order_date DESC

            LIMIT 5
        """)

        recent_orders = cursor.fetchall()

        # Convert Decimal and Date values
        for order in recent_orders:

            order["total_amount"] = float(order["total_amount"])

            if order["order_date"]:
                order["order_date"] = order["order_date"].strftime(
                    "%d %b %Y"
                )

        return {
            "success": True,
            "dashboard": {
                "total_products": products["total_products"],
                "total_categories": categories["total_categories"],
                "total_orders": orders["total_orders"],
                "total_customers": customers["total_customers"],
                "total_revenue": float(revenue["total_revenue"]),
                "recent_orders": recent_orders
            }
        }, 200

    except Exception as e:

        return {
            "success": False,
            "message": "Unable to load dashboard data!",
            "error": str(e)
        }, 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()
