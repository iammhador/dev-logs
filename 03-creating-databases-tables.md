# 📘 Chapter 3: Creating Databases & Tables

## 🎯 What You'll Learn
- How to create and manage databases
- Table creation with proper structure
- Primary keys, foreign keys, and constraints
- Indexes for performance
- Best practices for schema design

---

## 📖 Concept Explanation

**Database creation** is the foundation of any data-driven application. A well-designed database schema is like a blueprint for a house - it determines how efficiently your application will run and how easily you can maintain it.

### Key Concepts:
- **Database**: A container that holds related tables
- **Schema**: The structure and organization of your database
- **Table**: A collection of related data organized in rows and columns
- **Constraints**: Rules that ensure data integrity
- **Indexes**: Data structures that speed up queries

### Design Principles:
1. **Normalization**: Reduce data redundancy
2. **Consistency**: Use consistent naming conventions
3. **Scalability**: Design for future growth
4. **Performance**: Consider query patterns
5. **Integrity**: Enforce data quality through constraints

---

## 🔧 Syntax Comparison

### Creating Databases

**MySQL:**
```sql
-- Create database
CREATE DATABASE ecommerce_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use database
USE ecommerce_db;

-- Show current database
SELECT DATABASE();

-- Drop database (careful!)
DROP DATABASE IF EXISTS ecommerce_db;
```

**PostgreSQL:**
```sql
-- Create database
CREATE DATABASE ecommerce_db 
WITH ENCODING 'UTF8' 
LC_COLLATE = 'en_US.UTF-8' 
LC_CTYPE = 'en_US.UTF-8';

-- Connect to database (in psql)
\c ecommerce_db

-- Show current database
SELECT current_database();

-- Drop database (careful!)
DROP DATABASE IF EXISTS ecommerce_db;
```

### Basic Table Creation

**Simple Table:**
```sql
-- Works in both MySQL and PostgreSQL
CREATE TABLE categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Auto-Increment Differences:**
```sql
-- MySQL
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- PostgreSQL
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    price NUMERIC(10,2) NOT NULL
);
```

---

## 💡 Real-World Examples

### Example 1: Complete E-commerce Database

```sql
-- 1. Categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    parent_category_id INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Self-referencing foreign key for subcategories
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);

-- 2. Products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    category_id INT NOT NULL,
    brand VARCHAR(100),
    weight NUMERIC(8,3),
    dimensions VARCHAR(50), -- "10x5x3 cm"
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CHECK (price > 0),
    CHECK (stock_quantity >= 0),
    CHECK (cost_price IS NULL OR cost_price >= 0)
);

-- 3. Customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Constraints
    CHECK (email LIKE '%@%'),
    CHECK (date_of_birth IS NULL OR date_of_birth < CURRENT_DATE)
);

-- 4. Addresses table (one-to-many with customers)
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    address_type VARCHAR(20) DEFAULT 'shipping', -- 'shipping', 'billing'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CHECK (address_type IN ('shipping', 'billing'))
);

-- 5. Orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    order_status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    subtotal NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    shipping_amount NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    
    -- Address snapshots (data at time of order)
    shipping_address_id INT,
    billing_address_id INT,
    
    -- Timestamps
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_date TIMESTAMP,
    delivered_date TIMESTAMP,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id),
    FOREIGN KEY (billing_address_id) REFERENCES addresses(address_id),
    
    CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    CHECK (subtotal >= 0),
    CHECK (total_amount >= 0)
);

-- 6. Order items table (many-to-many between orders and products)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    
    -- Product snapshot at time of order
    product_name VARCHAR(200) NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (total_price >= 0),
    
    -- Ensure total_price = quantity * unit_price
    CHECK (total_price = quantity * unit_price)
);
```

### Example 2: Blog/CMS Database

```sql
-- 1. Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    CHECK (role IN ('admin', 'editor', 'author', 'user')),
    CHECK (email LIKE '%@%')
);

-- 2. Categories table
CREATE TABLE post_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_category_id) REFERENCES post_categories(category_id)
);

-- 3. Posts table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url VARCHAR(500),
    author_id INT NOT NULL,
    category_id INT,
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    
    -- SEO fields
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES post_categories(category_id),
    
    CHECK (status IN ('draft', 'published', 'archived')),
    CHECK (view_count >= 0),
    CHECK (comment_count >= 0),
    CHECK (like_count >= 0)
);

-- 4. Comments table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    parent_comment_id INT, -- For nested comments
    author_id INT, -- NULL for guest comments
    author_name VARCHAR(100), -- For guest comments
    author_email VARCHAR(255), -- For guest comments
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    ip_address INET, -- PostgreSQL specific
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id),
    FOREIGN KEY (author_id) REFERENCES users(user_id),
    
    CHECK (status IN ('pending', 'approved', 'spam', 'trash')),
    -- Either registered user OR guest info required
    CHECK (
        (author_id IS NOT NULL) OR 
        (author_name IS NOT NULL AND author_email IS NOT NULL)
    )
);
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"How do you design a database schema?"**
   - Start with entities and relationships
   - Normalize to reduce redundancy
   - Add constraints for data integrity
   - Consider performance and indexing
   - Plan for scalability

2. **"What's the difference between PRIMARY KEY and UNIQUE?"**
   - PRIMARY KEY: Unique + NOT NULL + one per table
   - UNIQUE: Can have NULLs + multiple per table
   - PRIMARY KEY creates clustered index (usually)

3. **"When would you use CASCADE vs RESTRICT for foreign keys?"**
   - CASCADE: Delete related records (order_items when order deleted)
   - RESTRICT: Prevent deletion if references exist
   - SET NULL: Set foreign key to NULL when parent deleted

### Schema Design Best Practices:

1. **Naming Conventions**
   ```sql
   -- Good: Consistent, descriptive names
   CREATE TABLE user_profiles (
       user_id INT,
       profile_id INT,
       created_at TIMESTAMP
   );
   
   -- Bad: Inconsistent, unclear
   CREATE TABLE UserProf (
       uid INT,
       PID INT,
       dt TIMESTAMP
   );
   ```

2. **Use Appropriate Constraints**
   ```sql
   CREATE TABLE products (
       product_id SERIAL PRIMARY KEY,
       price NUMERIC(10,2) NOT NULL CHECK (price > 0),
       stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
       category_id INT NOT NULL,
       FOREIGN KEY (category_id) REFERENCES categories(category_id)
   );
   ```

3. **Plan for Soft Deletes**
   ```sql
   CREATE TABLE users (
       user_id SERIAL PRIMARY KEY,
       email VARCHAR(255) NOT NULL,
       is_deleted BOOLEAN DEFAULT FALSE,
       deleted_at TIMESTAMP,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

## ⚠️ Things to Watch Out For

### 1. **Foreign Key Constraint Differences**
```sql
-- MySQL: Foreign keys optional by default
CREATE TABLE orders (
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB; -- Must specify InnoDB for FK support

-- PostgreSQL: Foreign keys always enforced
CREATE TABLE orders (
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
); -- Always enforced
```

### 2. **Auto-Increment Reset Behavior**
```sql
-- MySQL: AUTO_INCREMENT continues after DELETE
DELETE FROM products WHERE product_id = 5;
INSERT INTO products (name) VALUES ('New Product'); -- Gets ID 6, not 5

-- PostgreSQL: SERIAL continues after DELETE
DELETE FROM products WHERE product_id = 5;
INSERT INTO products (name) VALUES ('New Product'); -- Gets ID 6, not 5

-- To reset (be careful!):
-- MySQL
ALTER TABLE products AUTO_INCREMENT = 1;
-- PostgreSQL
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;
```

### 3. **Case Sensitivity in Names**
```sql
-- MySQL: Generally case-insensitive
CREATE TABLE Users (id INT); -- Creates 'users' table
SELECT * FROM users; -- Works

-- PostgreSQL: Case-sensitive
CREATE TABLE Users (id INT); -- Creates 'Users' table
SELECT * FROM users; -- Error! Table is 'Users'
SELECT * FROM "Users"; -- Correct
```

### 4. **Default Value Differences**
```sql
-- MySQL: Can use functions in defaults
CREATE TABLE logs (
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PostgreSQL: Limited function defaults
CREATE TABLE logs (
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- No automatic ON UPDATE equivalent
);
```

### 5. **Storage Engine Considerations (MySQL)**
```sql
-- MySQL: Different storage engines
CREATE TABLE products (
    id INT PRIMARY KEY
) ENGINE=InnoDB; -- Supports transactions, foreign keys

CREATE TABLE search_cache (
    keyword VARCHAR(100)
) ENGINE=MEMORY; -- Faster, but data lost on restart
```

### 6. **Index Creation Timing**
```sql
-- Create indexes after table creation for better performance
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT,
    price NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes separately
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Composite index for common query patterns
CREATE INDEX idx_products_category_price ON products(category_id, price);
```

---

## 🚀 Next Steps

In the next chapter, we'll dive into **CRUD Operations** (Create, Read, Update, Delete) - the fundamental operations you'll use to manipulate data in your tables. You'll learn how to insert, select, update, and delete data effectively.

---

## 📝 Quick Practice

Design a database schema for a library management system:

**Required entities:**
- Books (title, author, ISBN, publication year, copies available)
- Members (name, email, phone, membership date)
- Loans (which book, which member, loan date, due date, return date)
- Authors (name, biography, birth date)
- Categories (fiction, non-fiction, science, etc.)

**Consider:**
- What relationships exist between entities?
- What constraints would ensure data integrity?
- What indexes would improve query performance?
- How would you handle a book with multiple authors?