
from flask import Blueprint, request
from database import get_db_connection
from decimal import Decimal

order_bp = Blueprint("order", __name__)


# Place Customer Order
@order_bp.route("/place", methods=["POST"])
def place_order():

    data = request.get_json()

    if not data:
        return {"success": False, "message": "Invalid order data!"}, 400

    customer_id = data.get("customer_id")
    payment_method = data.get("payment_method")
    country_code = data.get("country")
    address = data.get("address")
    items = data.get("items")

    if not customer_id or not str(customer_id).isdigit():
        return {"success": False, "message": "Valid customer ID is required!"}, 400

    customer_id = int(customer_id)

    if payment_method not in ["COD", "Online"]:
        return {"success": False, "message": "Invalid payment method!"}, 400

    if country_code not in ["IN", "US"]:
        return {"success": False, "message": "Invalid country selection!"}, 400

    if not isinstance(address, dict):
        return {"success": False, "message": "Delivery address is required!"}, 400

    required_address_fields = [
        "full_name", "phone", "address_line1",
        "city", "state", "pincode"
    ]

    if any(not str(address.get(field, "")).strip() for field in required_address_fields):
        return {"success": False, "message": "Please provide complete delivery details!"}, 400

    if not isinstance(items, list) or not items:
        return {"success": False, "message": "Your cart is empty!"}, 400

    currency = "INR" if country_code == "IN" else "USD"
    country_name = "India" if country_code == "IN" else "USA"

    db = get_db_connection()

    if not db:
        return {"success": False, "message": "Database connection failed!"}, 500

    cursor = db.cursor(dictionary=True)

    try:
        # Verify customer
        cursor.execute(
            "SELECT customer_id FROM customers WHERE customer_id = %s",
            (customer_id,)
        )

        if not cursor.fetchone():
            db.rollback()
            return {"success": False, "message": "Customer not found!"}, 404

        # Validate products and calculate total using database prices
        validated_items = []
        total_amount = Decimal("0.00")

        for item in items:

            try:
                product_id = int(item.get("product_id"))
                quantity = int(item.get("quantity"))
            except (TypeError, ValueError):
                db.rollback()
                return {"success": False, "message": "Invalid product or quantity!"}, 400

            if product_id <= 0 or quantity <= 0:
                db.rollback()
                return {"success": False, "message": "Invalid product or quantity!"}, 400

            cursor.execute(
                """
                SELECT product_id, product_name, price_in, price_us,
                       available_in, available_us, stock_quantity
                FROM products
                WHERE product_id = %s AND status = 'active'
                FOR UPDATE
                """,
                (product_id,)
            )

            product = cursor.fetchone()

            if not product:
                db.rollback()
                return {"success": False, "message": f"Product ID {product_id} not found!"}, 404

            available = product["available_in"] if country_code == "IN" else product["available_us"]
            price = product["price_in"] if country_code == "IN" else product["price_us"]

            if not available:
                db.rollback()
                return {"success": False, "message": f"{product['product_name']} is not available in {country_name}!"}, 400

            if price is None or Decimal(str(price)) <= 0:
                db.rollback()
                return {"success": False, "message": f"Price is not configured for {product['product_name']}!"}, 400

            if product["stock_quantity"] is None or product["stock_quantity"] < quantity:
                db.rollback()
                return {"success": False, "message": f"Insufficient stock for {product['product_name']}!"}, 400

            product_price = Decimal(str(price))
            subtotal = product_price * quantity
            total_amount += subtotal

            validated_items.append({
                "product_id": product_id,
                "quantity": quantity,
                "product_price": product_price,
                "subtotal": subtotal
            })

        # Save delivery address
        cursor.execute(
            """
            INSERT INTO addresses (
                customer_id, address_label, full_name, phone,
                address_line1, address_line2, landmark,
                city, state, pincode, country, is_default
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                customer_id,
                "Home",
                address["full_name"].strip(),
                address["phone"].strip(),
                address["address_line1"].strip(),
                address.get("address_line2"),
                address.get("landmark"),
                address["city"].strip(),
                address["state"].strip(),
                address["pincode"].strip(),
                country_name,
                0
            )
        )

        address_id = cursor.lastrowid

        # Create order
        cursor.execute(
            """
            INSERT INTO orders (
                customer_id, total_amount, payment_method,
                payment_status, order_status, address_id, currency
            )
            VALUES (%s, %s, %s, 'Pending', 'Placed', %s, %s)
            """,
            (
                customer_id,
                total_amount,
                payment_method,
                address_id,
                currency
            )
        )

        order_id = cursor.lastrowid

        # Save order items and update stock
        for item in validated_items:

            cursor.execute(
                """
                INSERT INTO order_items (
                    order_id, product_id, quantity,
                    product_price, subtotal
                )
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    order_id,
                    item["product_id"],
                    item["quantity"],
                    item["product_price"],
                    item["subtotal"]
                )
            )

            cursor.execute(
                """
                UPDATE products
                SET stock_quantity = stock_quantity - %s
                WHERE product_id = %s
                """,
                (item["quantity"], item["product_id"])
            )

        db.commit()

        return {
            "success": True,
            "message": "Order placed successfully!",
            "order_id": order_id,
            "address_id": address_id,
            "total_amount": float(total_amount),
            "currency": currency,
            "payment_status": "Pending",
            "order_status": "Placed"
        }, 201

    except Exception as error:
        db.rollback()
        print("Place Order Error:", error)

        return {
            "success": False,
            "message": "Unable to place order. Please try again."
        }, 500

    finally:
        cursor.close()
        db.close()


# Get Customer Orders
@order_bp.route("/customer/<int:customer_id>", methods=["GET"])
def get_customer_orders(customer_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                o.order_id, o.customer_id, o.total_amount,
                o.payment_method, o.payment_status, o.order_status,
                o.order_date, o.address_id, o.currency,
                a.full_name, a.phone, a.address_line1,
                a.city, a.state, a.pincode, a.country
            FROM orders o
            LEFT JOIN addresses a ON o.address_id = a.address_id
            WHERE o.customer_id = %s
            ORDER BY o.order_date DESC
            """,
            (customer_id,)
        )

        orders = cursor.fetchall()

        for order in orders:
            order["total_amount"] = float(order["total_amount"])

            cursor.execute(
                """
                SELECT
                    oi.order_item_id, oi.product_id,
                    p.product_name, oi.quantity,
                    oi.product_price, oi.subtotal
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = %s
                """,
                (order["order_id"],)
            )

            order["items"] = cursor.fetchall()

            for item in order["items"]:
                item["product_price"] = float(item["product_price"])
                item["subtotal"] = float(item["subtotal"])

        return {"success": True, "orders": orders}, 200

    except Exception as error:
        print("Customer Orders Error:", error)
        return {"success": False, "message": "Unable to fetch orders!"}, 500

    finally:
        cursor.close()
        db.close()


# Get All Admin Orders
@order_bp.route("/admin/all", methods=["GET"])
def get_all_orders():

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                o.order_id, o.customer_id, o.total_amount,
                o.payment_method, o.payment_status, o.order_status,
                o.order_date, o.address_id, o.currency,
                c.first_name, c.last_name, c.email,
                a.full_name, a.phone, a.address_line1,
                a.city, a.state, a.pincode, a.country
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN addresses a ON o.address_id = a.address_id
            ORDER BY o.order_date DESC
            """
        )

        orders = cursor.fetchall()

        for order in orders:
            order["total_amount"] = float(order["total_amount"])

            cursor.execute(
                """
                SELECT
                    oi.order_item_id, oi.product_id,
                    p.product_name, oi.quantity,
                    oi.product_price, oi.subtotal
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = %s
                """,
                (order["order_id"],)
            )

            order["items"] = cursor.fetchall()

            for item in order["items"]:
                item["product_price"] = float(item["product_price"])
                item["subtotal"] = float(item["subtotal"])

        return {"success": True, "orders": orders}, 200

    except Exception as error:
        print("Admin Orders Error:", error)
        return {"success": False, "message": "Unable to fetch orders!"}, 500

    finally:
        cursor.close()
        db.close()


# Update Order Status
@order_bp.route("/admin/update/<int:order_id>", methods=["PUT"])
def update_order_status(order_id):

    data = request.get_json()

    if not data or data.get("order_status") not in [
        "Placed", "Processing", "Shipped",
        "Delivered", "Cancelled"
    ]:
        return {"success": False, "message": "Invalid order status!"}, 400

    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "UPDATE orders SET order_status = %s WHERE order_id = %s",
            (data["order_status"], order_id)
        )

        if cursor.rowcount == 0:
            db.rollback()
            return {"success": False, "message": "Order not found!"}, 404

        db.commit()

        return {
            "success": True,
            "message": "Order status updated successfully!"
        }, 200

    except Exception as error:
        db.rollback()
        print("Update Order Error:", error)
        return {"success": False, "message": "Unable to update order status!"}, 500

    finally:
        cursor.close()
        db.close()
