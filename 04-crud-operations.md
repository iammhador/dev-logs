# 📘 Chapter 4: CRUD Operations (SELECT, INSERT, UPDATE, DELETE)

## 🎯 What You'll Learn
- Master the four fundamental database operations
- Write efficient SELECT queries with filtering and sorting
- Insert single and multiple records safely
- Update data with precision and safety
- Delete data responsibly with proper safeguards

---

## 📖 Concept Explanation

**CRUD** stands for the four basic operations you can perform on data:
- **C**reate (INSERT) - Add new data
- **R**ead (SELECT) - Retrieve existing data
- **U**pdate (UPDATE) - Modify existing data
- **D**elete (DELETE) - Remove data

These operations form the foundation of all database interactions. Whether you're building a web app, mobile app, or data analysis tool, you'll use these operations constantly.

### Key Principles:
1. **Safety First**: Always use WHERE clauses with UPDATE/DELETE
2. **Performance**: Write efficient queries that use indexes
3. **Data Integrity**: Respect constraints and relationships
4. **Transactions**: Group related operations together
5. **Testing**: Test queries on small datasets first

---

## 🔧 CREATE (INSERT) Operations

### Basic INSERT Syntax

```sql
-- Insert single record
INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3);

-- Insert multiple records
INSERT INTO table_name (column1, column2, column3)
VALUES 
    (value1a, value2a, value3a),
    (value1b, value2b, value3b),
    (value1c, value2c, value3c);
```

### Real-World Examples

**1. Adding New Customers:**
```sql
-- Single customer
INSERT INTO customers (first_name, last_name, email, phone)
VALUES ('John', 'Doe', 'john.doe@email.com', '+1-555-0123');

-- Multiple customers at once (more efficient)
INSERT INTO customers (first_name, last_name, email, phone, created_at)
VALUES 
    ('Alice', 'Smith', 'alice@email.com', '+1-555-0124', CURRENT_TIMESTAMP),
    ('Bob', 'Johnson', 'bob@email.com', '+1-555-0125', CURRENT_TIMESTAMP),
    ('Carol', 'Williams', 'carol@email.com', '+1-555-0126', CURRENT_TIMESTAMP);
```

**2. Adding Products with Categories:**
```sql
-- First, ensure category exists
INSERT INTO categories (category_name, description)
VALUES ('Electronics', 'Electronic devices and accessories');

-- Then add products
INSERT INTO products (sku, product_name, price, category_id, stock_quantity)
VALUES 
    ('LAPTOP001', 'Gaming Laptop Pro', 1299.99, 1, 15),
    ('MOUSE001', 'Wireless Gaming Mouse', 79.99, 1, 50),
    ('KEYBOARD001', 'Mechanical Keyboard RGB', 149.99, 1, 30);
```

**3. Handling Auto-Increment and Defaults:**
```sql
-- Let database generate ID and timestamp
INSERT INTO orders (customer_id, total_amount, order_status)
VALUES (1, 1529.97, 'pending');

-- Get the generated ID (MySQL)
SELECT LAST_INSERT_ID();

-- Get the generated ID (PostgreSQL)
INSERT INTO orders (customer_id, total_amount, order_status)
VALUES (1, 1529.97, 'pending')
RETURNING order_id;
```

**4. INSERT with SELECT (Copy Data):**
```sql
-- Copy products from one category to another
INSERT INTO product_archive (product_name, price, archived_date)
SELECT product_name, price, CURRENT_TIMESTAMP
FROM products
WHERE category_id = 5 AND is_active = FALSE;
```

### INSERT Safety and Error Handling

```sql
-- Handle duplicate key errors gracefully

-- MySQL: INSERT IGNORE (skips duplicates)
INSERT IGNORE INTO customers (email, first_name, last_name)
VALUES ('existing@email.com', 'John', 'Doe');

-- MySQL: ON DUPLICATE KEY UPDATE
INSERT INTO customers (email, first_name, last_name, updated_at)
VALUES ('john@email.com', 'John', 'Doe', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    updated_at = CURRENT_TIMESTAMP;

-- PostgreSQL: ON CONFLICT
INSERT INTO customers (email, first_name, last_name, updated_at)
VALUES ('john@email.com', 'John', 'Doe', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = CURRENT_TIMESTAMP;
```

---

## 🔍 READ (SELECT) Operations

### Basic SELECT Syntax

```sql
-- Basic structure
SELECT column1, column2, column3
FROM table_name
WHERE condition
ORDER BY column1 ASC/DESC
LIMIT number;
```

### Essential SELECT Patterns

**1. Basic Filtering:**
```sql
-- Select specific columns
SELECT first_name, last_name, email
FROM customers
WHERE is_active = TRUE;

-- Multiple conditions
SELECT product_name, price
FROM products
WHERE price BETWEEN 50 AND 200
  AND category_id IN (1, 2, 3)
  AND stock_quantity > 0;

-- Pattern matching
SELECT *
FROM customers
WHERE email LIKE '%@gmail.com'
  AND first_name ILIKE 'john%';  -- ILIKE is case-insensitive (PostgreSQL)
```

**2. Sorting and Limiting:**
```sql
-- Order by multiple columns
SELECT product_name, price, stock_quantity
FROM products
ORDER BY category_id ASC, price DESC;

-- Top 10 most expensive products
SELECT product_name, price
FROM products
ORDER BY price DESC
LIMIT 10;

-- Pagination (skip first 20, get next 10)
SELECT product_name, price
FROM products
ORDER BY product_name
LIMIT 10 OFFSET 20;
```

**3. Aggregate Functions:**
```sql
-- Count records
SELECT COUNT(*) as total_customers
FROM customers
WHERE created_at >= '2024-01-01';

-- Sum, average, min, max
SELECT 
    COUNT(*) as total_products,
    AVG(price) as average_price,
    MIN(price) as cheapest_price,
    MAX(price) as most_expensive,
    SUM(stock_quantity * price) as total_inventory_value
FROM products
WHERE is_active = TRUE;
```

**4. Grouping Data:**
```sql
-- Sales by category
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    AVG(p.price) as average_price,
    SUM(p.stock_quantity) as total_stock
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_id, c.category_name
HAVING COUNT(p.product_id) > 0
ORDER BY product_count DESC;
```

**5. Advanced Filtering:**
```sql
-- Subqueries
SELECT customer_id, first_name, last_name
FROM customers
WHERE customer_id IN (
    SELECT DISTINCT customer_id
    FROM orders
    WHERE order_date >= '2024-01-01'
);

-- EXISTS clause
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.total_amount > 1000
);

-- CASE statements
SELECT 
    product_name,
    price,
    CASE 
        WHEN price < 50 THEN 'Budget'
        WHEN price BETWEEN 50 AND 200 THEN 'Mid-range'
        WHEN price > 200 THEN 'Premium'
        ELSE 'Unknown'
    END as price_category
FROM products;
```

---

## ✏️ UPDATE Operations

### Basic UPDATE Syntax

```sql
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
```

### Safe UPDATE Practices

**1. Always Use WHERE Clause:**
```sql
-- DANGEROUS: Updates ALL records
UPDATE products SET price = price * 1.1;

-- SAFE: Updates specific records
UPDATE products 
SET price = price * 1.1
WHERE category_id = 1 AND is_active = TRUE;
```

**2. Update Single Records:**
```sql
-- Update customer information
UPDATE customers
SET 
    first_name = 'John',
    last_name = 'Smith',
    phone = '+1-555-9999',
    updated_at = CURRENT_TIMESTAMP
WHERE customer_id = 123;

-- Verify the update
SELECT customer_id, first_name, last_name, phone, updated_at
FROM customers
WHERE customer_id = 123;
```

**3. Conditional Updates:**
```sql
-- Update stock after sale
UPDATE products
SET 
    stock_quantity = stock_quantity - 5,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = 456
  AND stock_quantity >= 5;  -- Only if enough stock

-- Update order status
UPDATE orders
SET 
    order_status = 'shipped',
    shipped_date = CURRENT_TIMESTAMP
WHERE order_id = 789
  AND order_status = 'processing';
```

**4. Bulk Updates:**
```sql
-- Deactivate old products
UPDATE products
SET 
    is_active = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE created_at < '2020-01-01'
  AND stock_quantity = 0;

-- Apply discount to category
UPDATE products
SET 
    price = price * 0.9,  -- 10% discount
    updated_at = CURRENT_TIMESTAMP
WHERE category_id = 5
  AND is_active = TRUE;
```

**5. UPDATE with JOIN (MySQL):**
```sql
-- Update product prices based on category
UPDATE products p
JOIN categories c ON p.category_id = c.category_id
SET p.price = p.price * 1.15
WHERE c.category_name = 'Electronics';
```

**6. UPDATE with FROM (PostgreSQL):**
```sql
-- Update product prices based on category
UPDATE products
SET price = price * 1.15
FROM categories
WHERE products.category_id = categories.category_id
  AND categories.category_name = 'Electronics';
```

---

## 🗑️ DELETE Operations

### Basic DELETE Syntax

```sql
DELETE FROM table_name
WHERE condition;
```

### Safe DELETE Practices

**1. Always Test with SELECT First:**
```sql
-- STEP 1: Test what will be deleted
SELECT customer_id, first_name, last_name, created_at
FROM customers
WHERE is_active = FALSE
  AND created_at < '2020-01-01'
  AND customer_id NOT IN (
      SELECT DISTINCT customer_id
      FROM orders
      WHERE customer_id IS NOT NULL
  );

-- STEP 2: If results look correct, then delete
DELETE FROM customers
WHERE is_active = FALSE
  AND created_at < '2020-01-01'
  AND customer_id NOT IN (
      SELECT DISTINCT customer_id
      FROM orders
      WHERE customer_id IS NOT NULL
  );
```

**2. Soft Delete vs Hard Delete:**
```sql
-- Soft delete (recommended for important data)
UPDATE customers
SET 
    is_deleted = TRUE,
    deleted_at = CURRENT_TIMESTAMP
WHERE customer_id = 123;

-- Hard delete (permanent removal)
DELETE FROM customers
WHERE customer_id = 123;
```

**3. Delete with Foreign Key Considerations:**
```sql
-- Delete order and related items (with CASCADE)
DELETE FROM orders WHERE order_id = 456;
-- This automatically deletes related order_items if CASCADE is set

-- Manual cleanup approach
BEGIN TRANSACTION;

-- Delete related records first
DELETE FROM order_items WHERE order_id = 456;

-- Then delete main record
DELETE FROM orders WHERE order_id = 456;

COMMIT;
```

**4. Conditional Deletes:**
```sql
-- Delete expired sessions
DELETE FROM user_sessions
WHERE expires_at < CURRENT_TIMESTAMP;

-- Delete duplicate records (keep newest)
DELETE FROM customers c1
WHERE EXISTS (
    SELECT 1
    FROM customers c2
    WHERE c2.email = c1.email
      AND c2.customer_id > c1.customer_id
);
```

---

## 💡 Real-World CRUD Examples

### Example 1: E-commerce Order Processing

```sql
-- 1. CREATE: New customer places order
BEGIN TRANSACTION;

-- Insert customer if not exists
INSERT INTO customers (email, first_name, last_name)
VALUES ('newcustomer@email.com', 'Jane', 'Doe')
ON CONFLICT (email) DO NOTHING;

-- Get customer ID
SET @customer_id = (
    SELECT customer_id 
    FROM customers 
    WHERE email = 'newcustomer@email.com'
);

-- Create order
INSERT INTO orders (customer_id, order_status, total_amount)
VALUES (@customer_id, 'pending', 299.98);

SET @order_id = LAST_INSERT_ID();

-- Add order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
VALUES 
    (@order_id, 101, 2, 99.99, 199.98),
    (@order_id, 102, 1, 99.99, 99.99);

-- Update product stock
UPDATE products 
SET stock_quantity = stock_quantity - 2
WHERE product_id = 101 AND stock_quantity >= 2;

UPDATE products 
SET stock_quantity = stock_quantity - 1
WHERE product_id = 102 AND stock_quantity >= 1;

COMMIT;
```

### Example 2: Blog Content Management

```sql
-- 1. CREATE: Publish new blog post
INSERT INTO posts (title, slug, content, author_id, category_id, status)
VALUES (
    'Getting Started with SQL',
    'getting-started-with-sql',
    'SQL is the standard language for managing relational databases...',
    1,
    2,
    'published'
);

-- 2. READ: Get published posts with author info
SELECT 
    p.title,
    p.slug,
    p.excerpt,
    p.published_at,
    u.first_name || ' ' || u.last_name as author_name,
    c.category_name,
    p.view_count,
    p.comment_count
FROM posts p
JOIN users u ON p.author_id = u.user_id
JOIN post_categories c ON p.category_id = c.category_id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 10;

-- 3. UPDATE: Increment view count
UPDATE posts
SET view_count = view_count + 1
WHERE slug = 'getting-started-with-sql';

-- 4. DELETE: Remove spam comments
DELETE FROM comments
WHERE status = 'spam'
  AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"How do you prevent accidental data loss?"**
   - Always use WHERE clauses with UPDATE/DELETE
   - Test with SELECT first
   - Use transactions for multi-step operations
   - Implement soft deletes for critical data
   - Regular backups

2. **"What's the difference between DELETE and TRUNCATE?"**
   - DELETE: Removes rows based on WHERE clause, can be rolled back
   - TRUNCATE: Removes all rows, faster, resets auto-increment, limited rollback
   - DROP: Removes entire table structure

3. **"How do you handle duplicate data during INSERT?"**
   - MySQL: INSERT IGNORE, ON DUPLICATE KEY UPDATE
   - PostgreSQL: ON CONFLICT DO UPDATE/NOTHING
   - Check for existence before inserting

### Performance Tips:

1. **Use Indexes for WHERE Clauses:**
   ```sql
   -- Slow without index on email
   SELECT * FROM customers WHERE email = 'john@email.com';
   
   -- Create index for faster lookups
   CREATE INDEX idx_customers_email ON customers(email);
   ```

2. **Batch Operations:**
   ```sql
   -- Slow: Multiple single inserts
   INSERT INTO products (name, price) VALUES ('Product 1', 10.00);
   INSERT INTO products (name, price) VALUES ('Product 2', 15.00);
   
   -- Fast: Batch insert
   INSERT INTO products (name, price) VALUES 
       ('Product 1', 10.00),
       ('Product 2', 15.00);
   ```

3. **Limit Large Operations:**
   ```sql
   -- Process in chunks to avoid locking
   UPDATE products 
   SET is_active = FALSE 
   WHERE created_at < '2020-01-01'
   LIMIT 1000;
   ```

---

## ⚠️ Things to Watch Out For

### 1. **Missing WHERE Clauses**
```sql
-- DISASTER: Updates all records
UPDATE customers SET email = 'test@email.com';

-- SAFE: Updates specific record
UPDATE customers SET email = 'test@email.com' WHERE customer_id = 1;
```

### 2. **Foreign Key Violations**
```sql
-- Error: Cannot delete customer with orders
DELETE FROM customers WHERE customer_id = 1;

-- Solution: Delete orders first, or use CASCADE
DELETE FROM order_items WHERE order_id IN (
    SELECT order_id FROM orders WHERE customer_id = 1
);
DELETE FROM orders WHERE customer_id = 1;
DELETE FROM customers WHERE customer_id = 1;
```

### 3. **Data Type Mismatches**
```sql
-- Error: String in numeric field
INSERT INTO products (price) VALUES ('not a number');

-- Correct: Proper data type
INSERT INTO products (price) VALUES (29.99);
```

### 4. **Transaction Management**
```sql
-- Always wrap related operations in transactions
BEGIN TRANSACTION;

UPDATE products SET stock_quantity = stock_quantity - 1 WHERE product_id = 1;
INSERT INTO order_items (product_id, quantity) VALUES (1, 1);

-- Check if both operations succeeded
IF @@ERROR = 0
    COMMIT;
ELSE
    ROLLBACK;
```

### 5. **NULL Handling**
```sql
-- Wrong: NULL comparison
SELECT * FROM customers WHERE phone = NULL;

-- Correct: IS NULL
SELECT * FROM customers WHERE phone IS NULL;

-- Handle NULLs in calculations
SELECT 
    product_name,
    COALESCE(discount_price, price) as final_price
FROM products;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Constraints** - the rules that ensure your data stays clean and consistent. You'll learn about primary keys, foreign keys, unique constraints, check constraints, and how they protect your database integrity.

---

## 📝 Quick Practice

Using the e-commerce database from previous chapters:

1. **INSERT**: Add 5 new products in the "Books" category
2. **SELECT**: Find all customers who have placed orders over $500
3. **UPDATE**: Apply a 15% discount to all products in the "Clothing" category
4. **DELETE**: Remove all products that have 0 stock and haven't been ordered in the last year

Remember to:
- Test your SELECT queries first
- Use transactions for multi-step operations
- Verify your results after each operation