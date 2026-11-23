
from flask import Flask
from flask_cors import CORS
from flask_mail import Mail

from config import Config
from database import get_db_connection

from routes.customer_routes import customer_bp
from routes.product_routes import product_bp
from routes.category_routes import category_bp
from routes.admin_routes import admin_bp
from routes.cart_routes import cart_bp
from routes.wishlist_routes import wishlist_bp
from routes.address_routes import address_bp
from routes.order_routes import order_bp
from routes.review_routes import review_bp
from routes.contact_routes import contact_bp
from routes.newsletter_routes import newsletter_bp
from routes.admin_customer_routes import admin_customer_bp
from routes.dashboard_routes import dashboard_bp
from routes.password_reset_routes import password_reset_bp


# Initialize Flask Application
app = Flask(__name__)

# Load Configuration
app.config.from_object(Config)

# Configure Email
mail = Mail(app)

# Enable CORS
CORS(app)


# Register Blueprints
app.register_blueprint(customer_bp, url_prefix="/api/customers")
app.register_blueprint(product_bp, url_prefix="/api/products")
app.register_blueprint(category_bp, url_prefix="/api/categories")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(cart_bp, url_prefix="/api/cart")
app.register_blueprint(wishlist_bp, url_prefix="/api/wishlist")
app.register_blueprint(address_bp, url_prefix="/api/addresses")
app.register_blueprint(order_bp, url_prefix="/api/orders")
app.register_blueprint(review_bp, url_prefix="/api/reviews")
app.register_blueprint(contact_bp, url_prefix="/api/contact")
app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")
app.register_blueprint(admin_customer_bp, url_prefix="/api/admin/customers")
app.register_blueprint(dashboard_bp, url_prefix="/api/admin")
app.register_blueprint(password_reset_bp, url_prefix="/api/password")


# Home Route
@app.route("/")
def home():
    return {
        "success": True,
        "message": "Welcome to A1 Herbals Backend API!"
    }


# Health Check Route
@app.route("/api/health")
def health_check():
    return {
        "success": True,
        "message": "A1 Herbals Backend is Working!"
    }


# Database Connection API
@app.route("/api/database-test")
def database_test():

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("SELECT DATABASE()")
        result = cursor.fetchone()

        cursor.close()
        db.close()

        return {
            "success": True,
            "message": "MySQL Database Connected Successfully!",
            "database": result[0]
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Database Connection Failed!",
            "error": str(e)
        }, 500


# Run Application
if __name__ == "__main__":
    app.run(debug=True)
