
import getpass
from database import get_db_connection
from utils.security import hash_password

email = "a1globalseller@gmail.com"

new_password = getpass.getpass("Enter New Admin Password: ")
confirm_password = getpass.getpass("Confirm New Admin Password: ")

if new_password != confirm_password:
    print("Passwords do not match!")
elif len(new_password) < 8:
    print("Password must contain at least 8 characters!")
else:
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "SELECT admin_id FROM admins WHERE email = %s",
        (email,)
    )

    admin = cursor.fetchone()

    if admin:
        hashed_password = hash_password(new_password)

        cursor.execute(
            "UPDATE admins SET password = %s WHERE email = %s",
            (hashed_password, email)
        )

        db.commit()
        print("Admin Password Updated Successfully!")
    else:
        print("Admin account not found!")

    cursor.close()
    db.close()
