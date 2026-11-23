
import getpass
from app import app
from database import get_db_connection
from utils.security import verify_password

email = input("Enter Admin Email: ").strip()
password = getpass.getpass("Enter Admin Password: ")

# Direct Database Check
db = get_db_connection()
cursor = db.cursor(dictionary=True)

cursor.execute(
    "SELECT * FROM admins WHERE email = %s",
    (email,)
)

admin = cursor.fetchone()

if admin:
    print("\nAdmin Record Found: YES")
    print("Direct Password Check:",
          verify_password(admin["password"], password))
else:
    print("\nAdmin Record Found: NO")

cursor.close()
db.close()

# API Check
with app.test_client() as client:

    response = client.post(
        "/api/admin/login",
        json={
            "email": email,
            "password": password
        }
    )

    print("\nAPI Status Code:", response.status_code)
    print("API Response:", response.get_json())
