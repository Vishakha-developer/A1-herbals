
class Config:
    SECRET_KEY = "a1_herbals_secret_key_change_later"

    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = "Vishakha0930"
    MYSQL_DATABASE = "a1_herbals"
    MYSQL_PORT = 3306


import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = "a1_herbals_secret_key_change_later"

    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
    MYSQL_DATABASE = "a1_herbals"
    MYSQL_PORT = 3306

    # Gmail SMTP Configuration
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("shigvanvishakha3@gmail.com")
    MAIL_PASSWORD = os.getenv("fqmk wnwh racv cexk")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME")
    FRONTEND_RESET_URL = "http://127.0.0.1:5500/pages/reset-password.html"

