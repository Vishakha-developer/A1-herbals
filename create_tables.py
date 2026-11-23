
from database import get_db_connection


# 1. Admins Table
def create_admins_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            admin_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Admins table created successfully!")


# 2. Categories Table
def create_categories_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            category_id INT AUTO_INCREMENT PRIMARY KEY,
            category_name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Categories table created successfully!")


# 3. Products Table
def create_products_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NULL,
            product_name VARCHAR(200) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT DEFAULT 0,
            product_image VARCHAR(255),
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (category_id)
            REFERENCES categories(category_id)
            ON DELETE SET NULL
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Products table created successfully!")


# 4. Customers Table
def create_customers_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100),
            email VARCHAR(150) UNIQUE NOT NULL,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Customers table created successfully!")


# 5. Orders Table
def create_orders_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            payment_method ENUM('COD', 'Online') NOT NULL,
            payment_status ENUM(
                'Pending', 'Paid', 'Failed', 'Refunded'
            ) DEFAULT 'Pending',
            order_status ENUM(
                'Placed',
                'Processing',
                'Shipped',
                'Delivered',
                'Cancelled'
            ) DEFAULT 'Placed',
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (customer_id)
            REFERENCES customers(customer_id)
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Orders table created successfully!")


# 6. Order Items Table
def create_order_items_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            order_item_id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            product_price DECIMAL(10, 2) NOT NULL,
            subtotal DECIMAL(10, 2) NOT NULL,

            FOREIGN KEY (order_id)
            REFERENCES orders(order_id)
            ON DELETE CASCADE,

            FOREIGN KEY (product_id)
            REFERENCES products(product_id)
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Order Items table created successfully!")


# 7. Cart Table
def create_cart_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cart (
            cart_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT DEFAULT 1,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_customer_product (
                customer_id, product_id
            ),

            FOREIGN KEY (customer_id)
            REFERENCES customers(customer_id)
            ON DELETE CASCADE,

            FOREIGN KEY (product_id)
            REFERENCES products(product_id)
            ON DELETE CASCADE
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Cart table created successfully!")


# 8. Customer Addresses Table
def create_addresses_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS addresses (
            address_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            address_label VARCHAR(50) DEFAULT 'Home',
            full_name VARCHAR(150) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            address_line1 VARCHAR(255) NOT NULL,
            address_line2 VARCHAR(255),
            landmark VARCHAR(150),
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            pincode VARCHAR(10) NOT NULL,
            country VARCHAR(100) DEFAULT 'India',
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (customer_id)
            REFERENCES customers(customer_id)
            ON DELETE CASCADE
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Addresses table created successfully!")


# 9. Wishlist Table
def create_wishlist_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wishlist (
            wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            product_id INT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            UNIQUE KEY unique_customer_product (
                customer_id, product_id
            ),

            FOREIGN KEY (customer_id)
            REFERENCES customers(customer_id)
            ON DELETE CASCADE,

            FOREIGN KEY (product_id)
            REFERENCES products(product_id)
            ON DELETE CASCADE
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Wishlist table created successfully!")


# 10. Product Reviews & Ratings Table
def create_reviews_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            review_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            product_id INT NOT NULL,
            rating TINYINT NOT NULL,
            review_title VARCHAR(200),
            review_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,

            CONSTRAINT chk_rating
            CHECK (rating BETWEEN 1 AND 5),

            UNIQUE KEY unique_customer_product (
                customer_id, product_id
            ),

            FOREIGN KEY (customer_id)
            REFERENCES customers(customer_id)
            ON DELETE CASCADE,

            FOREIGN KEY (product_id)
            REFERENCES products(product_id)
            ON DELETE CASCADE
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Reviews table created successfully!")


# 11. Contact Messages Table
def create_contact_messages_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            message_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(20),
            subject VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('New', 'Read', 'Replied')
                DEFAULT 'New',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Contact Messages table created successfully!")


# 12. Newsletter Subscribers Table
def create_newsletter_table():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            subscriber_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) UNIQUE NOT NULL,
            status ENUM('Subscribed', 'Unsubscribed')
                DEFAULT 'Subscribed',
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()
    print("Newsletter Subscribers table created successfully!")


# Run All Table Creation Functions
if __name__ == "__main__":

    create_admins_table()
    create_categories_table()
    create_products_table()
    create_customers_table()
    create_orders_table()
    create_order_items_table()
    create_cart_table()
    create_addresses_table()
    create_wishlist_table()
    create_reviews_table()
    create_contact_messages_table()
    create_newsletter_table()

    print("\nAll database tables checked successfully!")
