# 📘 Chapter 5: Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, etc.)

## 🎯 What You'll Learn
- Understanding database constraints and their importance
- Primary keys, foreign keys, and referential integrity
- Unique constraints and check constraints
- NOT NULL constraints and default values
- How constraints prevent data corruption and maintain quality

---

## 📖 Concept Explanation

**Database constraints** are rules enforced by the database to ensure data integrity, consistency, and validity. Think of them as "guardrails" that prevent bad data from entering your database and maintain relationships between tables.

### Why Constraints Matter:
1. **Data Integrity**: Prevent invalid or inconsistent data
2. **Referential Integrity**: Maintain relationships between tables
3. **Business Rules**: Enforce application logic at the database level
4. **Performance**: Some constraints create indexes automatically
5. **Documentation**: Constraints serve as living documentation of your data rules

### Types of Constraints:
- **PRIMARY KEY**: Unique identifier for each row
- **FOREIGN KEY**: Links to another table's primary key
- **UNIQUE**: Ensures column values are unique
- **NOT NULL**: Prevents empty values
- **CHECK**: Custom validation rules
- **DEFAULT**: Provides default values

---

## 🔧 PRIMARY KEY Constraints

### What is a Primary Key?
A primary key uniquely identifies each row in a table. Every table should have one (and only one) primary key.

**Rules:**
- Must be unique across all rows
- Cannot be NULL
- Should be immutable (rarely changed)
- Automatically creates a unique index

### Primary Key Examples

**1. Single Column Primary Key:**
```sql
-- Auto-increment primary key (most common)
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,  -- PostgreSQL
    -- customer_id INT AUTO_INCREMENT PRIMARY KEY,  -- MySQL
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL
);

-- Natural primary key (use with caution)
CREATE TABLE countries (
    country_code CHAR(2) PRIMARY KEY,  -- 'US', 'CA', 'UK'
    country_name VARCHAR(100) NOT NULL,
    continent VARCHAR(50)
);
```

**2. Composite Primary Key:**
```sql
-- Multiple columns form the primary key
CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    
    -- Composite primary key
    PRIMARY KEY (order_id, product_id),
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- User roles assignment
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INT,
    
    PRIMARY KEY (user_id, role_id),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);
```

**3. Adding Primary Key to Existing Table:**
```sql
-- Add primary key constraint
ALTER TABLE existing_table
ADD CONSTRAINT pk_existing_table PRIMARY KEY (id);

-- Drop primary key (MySQL)
ALTER TABLE existing_table DROP PRIMARY KEY;

-- Drop primary key (PostgreSQL)
ALTER TABLE existing_table DROP CONSTRAINT existing_table_pkey;
```

---

## 🔗 FOREIGN KEY Constraints

### What is a Foreign Key?
A foreign key creates a link between two tables, ensuring referential integrity. It must match a value in the referenced table's primary key or be NULL.

### Foreign Key Examples

**1. Basic Foreign Key:**
```sql
-- Orders table references customers
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Foreign key constraint
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Alternative syntax
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL
);
```

**2. Foreign Key with Actions:**
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE RESTRICT    -- Prevent deletion if orders exist
        ON UPDATE CASCADE     -- Update order.customer_id if customer.customer_id changes
);

-- Different action options:
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE,    -- Delete order_items when order is deleted
    
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE SET NULL    -- Set product_id to NULL if product is deleted
        ON UPDATE CASCADE
);
```

**3. Self-Referencing Foreign Key:**
```sql
-- Employee hierarchy
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    manager_id INT,
    department VARCHAR(100),
    
    -- Self-referencing foreign key
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
        ON DELETE SET NULL
);

-- Category hierarchy
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_category_id INT,
    
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
        ON DELETE CASCADE
);
```

**4. Multiple Foreign Keys:**
```sql
CREATE TABLE product_reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Multiple foreign keys
    FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
        ON DELETE CASCADE,
    
    -- Ensure one review per customer per product
    UNIQUE (product_id, customer_id)
);
```

### Foreign Key Actions Explained

| Action | Description | Use Case |
|--------|-------------|----------|
| `RESTRICT` | Prevent parent deletion/update | Default, safest option |
| `CASCADE` | Delete/update child records too | Order items when order deleted |
| `SET NULL` | Set foreign key to NULL | Optional relationships |
| `SET DEFAULT` | Set to default value | Rarely used |
| `NO ACTION` | Same as RESTRICT | PostgreSQL default |

---

## 🔒 UNIQUE Constraints

### What is a UNIQUE Constraint?
Ensures that all values in a column (or combination of columns) are unique across the table.

### UNIQUE Examples

**1. Single Column UNIQUE:**
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,  -- Inline unique constraint
    username VARCHAR(50),
    phone VARCHAR(20),
    
    -- Named unique constraints
    CONSTRAINT uk_customers_username UNIQUE (username),
    CONSTRAINT uk_customers_phone UNIQUE (phone)
);
```

**2. Composite UNIQUE:**
```sql
-- Ensure unique combination of first_name + last_name + date_of_birth
CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    
    UNIQUE (first_name, last_name, date_of_birth)
);

-- Product SKU must be unique per supplier
CREATE TABLE supplier_products (
    id SERIAL PRIMARY KEY,
    supplier_id INT NOT NULL,
    product_sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2),
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    UNIQUE (supplier_id, product_sku)
);
```

**3. Adding/Dropping UNIQUE Constraints:**
```sql
-- Add unique constraint to existing table
ALTER TABLE customers
ADD CONSTRAINT uk_customers_email UNIQUE (email);

-- Drop unique constraint
ALTER TABLE customers
DROP CONSTRAINT uk_customers_email;

-- MySQL syntax for dropping
ALTER TABLE customers
DROP INDEX uk_customers_email;
```

---

## ✅ CHECK Constraints

### What is a CHECK Constraint?
Enforces custom business rules by validating data before it's inserted or updated.

### CHECK Examples

**1. Range Validation:**
```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    discount_percentage INT CHECK (discount_percentage BETWEEN 0 AND 100),
    stock_quantity INT CHECK (stock_quantity >= 0),
    weight DECIMAL(8,3) CHECK (weight > 0),
    
    -- Named check constraints
    CONSTRAINT chk_products_price_range CHECK (price BETWEEN 0.01 AND 999999.99)
);
```

**2. Enum-like Validation:**
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_status VARCHAR(20) NOT NULL 
        CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(20) NOT NULL
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    priority VARCHAR(10) DEFAULT 'normal'
        CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

**3. Complex Business Rules:**
```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    birth_date DATE,
    salary DECIMAL(10,2),
    department VARCHAR(100),
    
    -- Business rule validations
    CHECK (hire_date >= '1900-01-01'),
    CHECK (birth_date IS NULL OR birth_date < hire_date),
    CHECK (salary IS NULL OR salary > 0),
    CHECK (email LIKE '%@%'),
    
    -- Age must be at least 16 at hire date
    CHECK (birth_date IS NULL OR 
           (hire_date - birth_date) >= INTERVAL '16 years')
);
```

**4. Cross-Column Validation:**
```sql
CREATE TABLE promotions (
    promotion_id SERIAL PRIMARY KEY,
    promotion_name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_percentage INT,
    discount_amount DECIMAL(10,2),
    
    -- Date validation
    CHECK (end_date > start_date),
    
    -- Either percentage OR amount discount, not both
    CHECK (
        (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR
        (discount_percentage IS NULL AND discount_amount IS NOT NULL)
    ),
    
    -- Percentage must be reasonable
    CHECK (discount_percentage IS NULL OR 
           discount_percentage BETWEEN 1 AND 100),
    
    -- Amount must be positive
    CHECK (discount_amount IS NULL OR discount_amount > 0)
);
```

---

## 🚫 NOT NULL Constraints

### What is NOT NULL?
Prevents empty (NULL) values in a column, ensuring required data is always present.

### NOT NULL Examples

**1. Required Fields:**
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,        -- Required
    first_name VARCHAR(100) NOT NULL,   -- Required
    last_name VARCHAR(100) NOT NULL,    -- Required
    phone VARCHAR(20),                  -- Optional
    date_of_birth DATE,                 -- Optional
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**2. Adding/Removing NOT NULL:**
```sql
-- Add NOT NULL to existing column (ensure no NULLs exist first)
UPDATE customers SET phone = 'Unknown' WHERE phone IS NULL;
ALTER TABLE customers ALTER COLUMN phone SET NOT NULL;

-- Remove NOT NULL constraint
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;

-- MySQL syntax
ALTER TABLE customers MODIFY phone VARCHAR(20) NULL;
```

---

## 🎯 DEFAULT Constraints

### What is DEFAULT?
Provides automatic values when no value is specified during INSERT.

### DEFAULT Examples

**1. Common Defaults:**
```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    is_gift BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
```

**2. Function-based Defaults:**
```sql
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    user_id INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_only DATE DEFAULT CURRENT_DATE,
    
    -- PostgreSQL: Generate UUID
    session_id UUID DEFAULT gen_random_uuid(),
    
    -- MySQL: Generate UUID
    -- session_id CHAR(36) DEFAULT (UUID())
);
```

**3. Computed Defaults:**
```sql
-- PostgreSQL: More advanced defaults
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) DEFAULT ('SKU-' || nextval('sku_sequence')),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Generate slug from name (would need trigger for this)
    slug VARCHAR(255)
);
```

---

## 💡 Real-World Constraint Examples

### Example 1: E-commerce Product Catalog

```sql
CREATE TABLE products (
    -- Primary key
    product_id SERIAL PRIMARY KEY,
    
    -- Required fields with constraints
    sku VARCHAR(50) NOT NULL UNIQUE,
    product_name VARCHAR(200) NOT NULL,
    
    -- Price validation
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    cost_price DECIMAL(10,2) CHECK (cost_price IS NULL OR cost_price >= 0),
    
    -- Stock management
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INT DEFAULT 0 CHECK (min_stock_level >= 0),
    max_stock_level INT CHECK (max_stock_level IS NULL OR max_stock_level >= min_stock_level),
    
    -- Category relationship
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE RESTRICT,
    
    -- Product attributes
    weight DECIMAL(8,3) CHECK (weight IS NULL OR weight > 0),
    dimensions VARCHAR(50),
    
    -- Status and flags
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'discontinued')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    
    -- Business rules
    CHECK (cost_price IS NULL OR cost_price <= price),
    CHECK (NOT (is_digital = TRUE AND weight IS NOT NULL))
);
```

### Example 2: User Management System

```sql
CREATE TABLE users (
    -- Primary key
    user_id SERIAL PRIMARY KEY,
    
    -- Authentication (required, unique)
    email VARCHAR(255) NOT NULL UNIQUE 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    username VARCHAR(50) NOT NULL UNIQUE
        CHECK (LENGTH(username) >= 3 AND username ~ '^[a-zA-Z0-9_]+$'),
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile information
    first_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(first_name)) > 0),
    last_name VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(last_name)) > 0),
    date_of_birth DATE CHECK (date_of_birth < CURRENT_DATE),
    phone VARCHAR(20) CHECK (phone ~ '^\+?[1-9]\d{1,14}$'),
    
    -- Account settings
    role VARCHAR(20) DEFAULT 'user' 
        CHECK (role IN ('admin', 'moderator', 'user', 'guest')),
    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    
    -- Verification and security
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    login_count INT DEFAULT 0 CHECK (login_count >= 0),
    
    -- Age validation (must be at least 13)
    CHECK (date_of_birth IS NULL OR 
           (CURRENT_DATE - date_of_birth) >= INTERVAL '13 years')
);
```

### Example 3: Financial Transactions

```sql
CREATE TABLE transactions (
    -- Primary key
    transaction_id SERIAL PRIMARY KEY,
    
    -- Transaction reference
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Account relationships
    from_account_id BIGINT,
    to_account_id BIGINT,
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id),
    
    -- Amount and currency
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'USD'
        CHECK (currency ~ '^[A-Z]{3}$'),
    
    -- Transaction details
    transaction_type VARCHAR(20) NOT NULL
        CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'fee', 'interest')),
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Descriptions and metadata
    description VARCHAR(255),
    internal_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Business rules
    CHECK (
        -- Transfer must have both accounts
        (transaction_type = 'transfer' AND from_account_id IS NOT NULL AND to_account_id IS NOT NULL) OR
        -- Deposit must have to_account
        (transaction_type = 'deposit' AND to_account_id IS NOT NULL) OR
        -- Withdrawal must have from_account
        (transaction_type = 'withdrawal' AND from_account_id IS NOT NULL) OR
        -- Fee can have either or both
        (transaction_type IN ('fee', 'interest'))
    ),
    
    -- Cannot transfer to same account
    CHECK (from_account_id IS NULL OR to_account_id IS NULL OR from_account_id != to_account_id),
    
    -- Processed timestamp only for completed transactions
    CHECK (status != 'completed' OR processed_at IS NOT NULL)
);
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between PRIMARY KEY and UNIQUE?"**
   - PRIMARY KEY: One per table, cannot be NULL, creates clustered index
   - UNIQUE: Multiple per table, can have one NULL, creates non-clustered index
   - Both ensure uniqueness, but PRIMARY KEY has additional restrictions

2. **"When would you use CASCADE vs RESTRICT for foreign keys?"**
   - CASCADE: When child records should be deleted with parent (order_items with orders)
   - RESTRICT: When you want to prevent accidental deletion (customers with orders)
   - SET NULL: When relationship is optional (manager_id when manager is deleted)

3. **"How do you enforce business rules in the database?"**
   - CHECK constraints for validation rules
   - FOREIGN KEY constraints for referential integrity
   - UNIQUE constraints for business uniqueness
   - NOT NULL for required fields
   - Triggers for complex logic

### Best Practices:

1. **Name Your Constraints:**
   ```sql
   -- Good: Named constraints are easier to manage
   CONSTRAINT pk_customers PRIMARY KEY (customer_id),
   CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
   CONSTRAINT uk_customers_email UNIQUE (email),
   CONSTRAINT chk_products_price CHECK (price > 0)
   ```

2. **Use Appropriate Data Types:**
   ```sql
   -- Good: Specific types with constraints
   email VARCHAR(255) NOT NULL CHECK (email LIKE '%@%'),
   status VARCHAR(20) CHECK (status IN ('active', 'inactive')),
   
   -- Avoid: Generic types without validation
   email TEXT,
   status TEXT
   ```

3. **Document Business Rules:**
   ```sql
   CREATE TABLE orders (
       order_id SERIAL PRIMARY KEY,
       total_amount DECIMAL(10,2) NOT NULL,
       
       -- Business rule: Orders must be at least $1
       CONSTRAINT chk_orders_min_amount CHECK (total_amount >= 1.00)
   );
   ```

---

## ⚠️ Things to Watch Out For

### 1. **Constraint Naming Conflicts**
```sql
-- Bad: Generic constraint names
CREATE TABLE users (
    id INT PRIMARY KEY,  -- Creates generic name
    email VARCHAR(255) UNIQUE  -- Creates generic name
);

-- Good: Explicit constraint names
CREATE TABLE users (
    id INT,
    email VARCHAR(255),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
);
```

### 2. **Foreign Key Performance**
```sql
-- Ensure foreign key columns are indexed
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Add index for better performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### 3. **CHECK Constraint Limitations**
```sql
-- MySQL: CHECK constraints ignored in older versions
-- Always test your constraints!

-- PostgreSQL: Cannot reference other tables in CHECK
-- This won't work:
CHECK (category_id IN (SELECT category_id FROM categories))

-- Use foreign key instead:
FOREIGN KEY (category_id) REFERENCES categories(category_id)
```

### 4. **Circular Foreign Key References**
```sql
-- Problem: Circular dependency
CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    dept_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- Solution: Create tables first, add constraints later
CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    manager_id INT
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    dept_id INT
);

-- Add foreign keys after both tables exist
ALTER TABLE departments 
ADD FOREIGN KEY (manager_id) REFERENCES employees(employee_id);

ALTER TABLE employees 
ADD FOREIGN KEY (dept_id) REFERENCES departments(dept_id);
```

### 5. **Constraint Violation Handling**
```sql
-- Handle constraint violations gracefully in application code

-- PostgreSQL: Use ON CONFLICT
INSERT INTO customers (email, first_name, last_name)
VALUES ('john@email.com', 'John', 'Doe')
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

-- MySQL: Use ON DUPLICATE KEY UPDATE
INSERT INTO customers (email, first_name, last_name)
VALUES ('john@email.com', 'John', 'Doe')
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name);
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Joins** - one of the most powerful features of SQL that allows you to combine data from multiple tables. You'll learn about INNER, LEFT, RIGHT, and FULL joins, and how to write complex queries that span multiple tables.

---

## 📝 Quick Practice

Design constraints for a social media platform:

1. **Users table**: Email must be unique and valid format, username 3-50 characters, age must be 13+
2. **Posts table**: Content cannot be empty, status must be 'draft', 'published', or 'deleted'
3. **Followers table**: User cannot follow themselves, combination of follower_id + following_id must be unique
4. **Comments table**: Must reference valid post and user, content length 1-1000 characters

Consider:
- What happens when a user is deleted?
- How do you prevent spam or invalid data?
- What business rules need to be enforced?