
import getpass
from database import get_db_connection
from utils.security import hash_password


def create_admin():

    print("\n===== A1 Herbals Admin Account =====")

    name = input("Enter Admin Name: ").strip()
    email = input("Enter Admin Email: ").strip()

    password = getpass.getpass("Enter Admin Password: ")
    confirm_password = getpass.getpass("Confirm Admin Password: ")

    if not name or not email or not password:
        print("All fields are required!")
        return

    if password != confirm_password:
        print("Passwords do not match!")
        return

    if len(password) < 8:
        print("Password must contain at least 8 characters!")
        return

    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT admin_id FROM admins WHERE email = %s",
            (email,)
        )

        existing_admin = cursor.fetchone()

        if existing_admin:
            print("Admin with this email already exists!")
            return

        hashed_password = hash_password(password)

        cursor.execute(
            """
            INSERT INTO admins (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password)
        )

        db.commit()

        print("\nAdmin Account Created Successfully!")

    except Exception as e:
        db.rollback()
        print("Error:", e)

    finally:
        cursor.close()
        db.close()


if __name__ == "__main__":
    create_admin()
