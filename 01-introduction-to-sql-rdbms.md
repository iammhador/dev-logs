# 📘 Chapter 1: Introduction to SQL & RDBMS

## 🎯 What You'll Learn
- What SQL is and why it matters
- Understanding Relational Database Management Systems (RDBMS)
- Key differences between MySQL and PostgreSQL
- Setting up your first database

---

## 📖 Concept Explanation

**SQL (Structured Query Language)** is a standardized language for managing and manipulating relational databases. Think of it as the "universal language" that lets you communicate with databases to store, retrieve, update, and delete data.

**RDBMS (Relational Database Management System)** is software that manages relational databases. Popular examples include:
- **MySQL**: Fast, reliable, widely used in web applications
- **PostgreSQL**: Feature-rich, standards-compliant, excellent for complex queries
- **SQLite**: Lightweight, file-based, perfect for small applications
- **Microsoft SQL Server**: Enterprise-grade, Windows-focused
- **MariaDB**: MySQL fork with additional features

### Why Relational Databases?
- **Structure**: Data is organized in tables with rows and columns
- **Relationships**: Tables can be linked together (hence "relational")
- **ACID Properties**: Atomicity, Consistency, Isolation, Durability
- **Scalability**: Can handle millions of records efficiently

---

## 🔧 Syntax Comparison

### Creating a Database

**MySQL:**
```sql
CREATE DATABASE company_db;
USE company_db;
```

**PostgreSQL:**
```sql
CREATE DATABASE company_db;
\c company_db  -- Connect to database in psql
```

### Basic Database Operations

**Show Databases:**
```sql
-- MySQL
SHOW DATABASES;

-- PostgreSQL
\l  -- In psql command line
-- OR
SELECT datname FROM pg_database;
```

**Show Tables:**
```sql
-- MySQL
SHOW TABLES;

-- PostgreSQL
\dt  -- In psql
-- OR
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 💡 Real-World Examples

### Example 1: E-commerce Database Structure
```sql
-- Creating a simple e-commerce database
CREATE DATABASE ecommerce_db;

-- MySQL/PostgreSQL (similar syntax)
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,  -- MySQL
    -- customer_id SERIAL PRIMARY KEY,          -- PostgreSQL alternative
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,   -- MySQL
    -- product_id SERIAL PRIMARY KEY,           -- PostgreSQL alternative
    product_name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category VARCHAR(50)
);
```

### Example 2: Blog Database
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    author_id INT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id)
);
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between SQL and NoSQL?"**
   - SQL: Structured, ACID compliant, good for complex relationships
   - NoSQL: Flexible schema, horizontally scalable, good for big data

2. **"Why choose PostgreSQL over MySQL?"**
   - PostgreSQL: Better standards compliance, advanced features (JSON, arrays, window functions)
   - MySQL: Faster for simple queries, easier to set up, more hosting options

3. **"What are ACID properties?"**
   - **Atomicity**: All or nothing transactions
   - **Consistency**: Data integrity maintained
   - **Isolation**: Concurrent transactions don't interfere
   - **Durability**: Committed data survives system failures

### Real-World Use Cases:
- **E-commerce**: Product catalogs, order management, inventory tracking
- **Social Media**: User profiles, posts, comments, relationships
- **Banking**: Account management, transactions, audit trails
- **Healthcare**: Patient records, appointments, medical history

---

## ⚠️ Things to Watch Out For

### 1. **Case Sensitivity Differences**
```sql
-- MySQL: Generally case-insensitive (depends on OS)
SELECT * FROM Users;  -- Works
SELECT * FROM users;  -- Also works

-- PostgreSQL: Case-sensitive
SELECT * FROM Users;  -- Error if table is 'users'
SELECT * FROM users;  -- Correct
```

### 2. **Auto-Increment Syntax**
```sql
-- MySQL
id INT PRIMARY KEY AUTO_INCREMENT

-- PostgreSQL
id SERIAL PRIMARY KEY
-- OR
id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

### 3. **String Concatenation**
```sql
-- MySQL
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;

-- PostgreSQL
SELECT first_name || ' ' || last_name AS full_name FROM users;
-- OR
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;
```

### 4. **Limit Syntax**
```sql
-- MySQL
SELECT * FROM products LIMIT 10;

-- PostgreSQL
SELECT * FROM products LIMIT 10;
-- Both support LIMIT, but PostgreSQL also supports:
SELECT * FROM products LIMIT 10 OFFSET 20;
```

### 5. **Date/Time Functions**
```sql
-- MySQL
SELECT NOW(), CURDATE(), CURTIME();

-- PostgreSQL
SELECT NOW(), CURRENT_DATE, CURRENT_TIME;
```

---

## 🚀 Next Steps

In the next chapter, we'll dive into **Data Types** and explore how MySQL and PostgreSQL handle different kinds of data. You'll learn when to use VARCHAR vs TEXT, INT vs BIGINT, and how to work with dates, JSON, and more.

---

## 📝 Quick Practice

Try creating a simple database for a library system with tables for:
- `books` (id, title, author, isbn, published_year)
- `members` (id, name, email, join_date)
- `loans` (id, book_id, member_id, loan_date, return_date)

Think about what data types and constraints you'd use for each field!