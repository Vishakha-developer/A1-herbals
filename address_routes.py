
from flask import Blueprint, request
from database import get_db_connection

address_bp = Blueprint("address", __name__)


# Add Customer Address
@address_bp.route("/add", methods=["POST"])
def add_address():

    data = request.get_json()

    required_fields = [
        "customer_id", "full_name", "phone",
        "address_line1", "city", "state", "pincode"
    ]

    if not data or any(not data.get(field) for field in required_fields):
        return {
            "success": False,
            "message": "Please provide all required address details!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

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
            data["customer_id"],
            data.get("address_label", "Home"),
            data["full_name"],
            data["phone"],
            data["address_line1"],
            data.get("address_line2"),
            data.get("landmark"),
            data["city"],
            data["state"],
            data["pincode"],
            data.get("country", "India"),
            data.get("is_default", False)
        )
    )

    db.commit()
    address_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {
        "success": True,
        "message": "Address added successfully!",
        "address_id": address_id
    }, 201


# Get Customer Addresses
@address_bp.route("/<int:customer_id>", methods=["GET"])
def get_addresses(customer_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT * FROM addresses
        WHERE customer_id = %s
        ORDER BY is_default DESC, created_at DESC
        """,
        (customer_id,)
    )

    addresses = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "success": True,
        "addresses": addresses
    }, 200


# Update Customer Address
@address_bp.route("/update/<int:address_id>", methods=["PUT"])
def update_address(address_id):

    data = request.get_json()

    allowed_fields = [
        "address_label", "full_name", "phone",
        "address_line1", "address_line2", "landmark",
        "city", "state", "pincode", "country", "is_default"
    ]

    updates = {
        field: data[field]
        for field in allowed_fields
        if field in data
    }

    if not updates:
        return {
            "success": False,
            "message": "No address details provided!"
        }, 400

    db = get_db_connection()
    cursor = db.cursor()

    set_clause = ", ".join(f"{field} = %s" for field in updates)

    query = f"UPDATE addresses SET {set_clause} WHERE address_id = %s"

    cursor.execute(query, (*updates.values(), address_id))

    db.commit()
    updated = cursor.rowcount

    cursor.close()
    db.close()

    if updated == 0:
        return {
            "success": False,
            "message": "Address not found or no changes made!"
        }, 404

    return {
        "success": True,
        "message": "Address updated successfully!"
    }, 200


# Delete Customer Address
@address_bp.route("/delete/<int:address_id>", methods=["DELETE"])
def delete_address(address_id):

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "DELETE FROM addresses WHERE address_id = %s",
        (address_id,)
    )

    db.commit()
    deleted = cursor.rowcount

    cursor.close()
    db.close()

    if deleted == 0:
        return {
            "success": False,
            "message": "Address not found!"
        }, 404

    return {
        "success": True,
        "message": "Address deleted successfully!"
    }, 200
