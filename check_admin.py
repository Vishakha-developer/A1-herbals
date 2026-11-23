from database import get_db_connection

db = get_db_connection()
cursor = db.cursor(dictionary=True)

cursor.execute("""
    SELECT admin_id, name, email
    FROM admins
""")

admins = cursor.fetchall()

print("\nRegistered Admin Accounts:")

for admin in admins:
    print(admin)

cursor.close()
db.close()