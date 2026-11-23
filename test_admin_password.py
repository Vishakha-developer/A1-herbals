from database import get_db_connection
from utils.security import verify_password
import getpass

email = input("Enter Admin Email: ").strip()
password = getpass.getpass("Enter Admin Password: ")

db = get_db_connection()
cursor = db.cursor(dictionary=True)

cursor.execute(
    "SELECT password FROM admins WHERE email = %s",
    (email,)
)

admin = cursor.fetchone()

if admin:
    if verify_password(admin["password"], password):
        print("Password Verification Successful!")
    else:
        print("Password Verification Failed!")
else:
    print("Admin Email Not Found!")

cursor.close()
db.close()
