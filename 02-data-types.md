# 📘 Chapter 2: Data Types (MySQL vs PostgreSQL)

## 🎯 What You'll Learn
- Core data types in MySQL and PostgreSQL
- When to use each data type
- Cross-database compatibility considerations
- Performance implications of data type choices

---

## 📖 Concept Explanation

**Data types** define what kind of data can be stored in each column of a table. Choosing the right data type is crucial for:
- **Storage efficiency**: Using the smallest appropriate type saves space
- **Performance**: Proper types enable faster queries and indexing
- **Data integrity**: Types prevent invalid data from being stored
- **Application compatibility**: Ensures your app can handle the data correctly

### Key Principles:
1. **Use the most restrictive type that fits your data**
2. **Consider future growth** (but don't over-engineer)
3. **Think about queries** you'll run on the data
4. **Plan for data validation** at the database level

---

## 🔧 Data Types Comparison

### 📊 Numeric Types

| Purpose | MySQL | PostgreSQL | Notes |
|---------|-------|------------|-------|
| Small integers | `TINYINT` (-128 to 127) | `SMALLINT` (-32,768 to 32,767) | PostgreSQL doesn't have TINYINT |
| Regular integers | `INT` (-2B to 2B) | `INTEGER` (same range) | Most common for IDs |
| Large integers | `BIGINT` | `BIGINT` | For very large numbers |
| Auto-increment | `AUTO_INCREMENT` | `SERIAL` or `IDENTITY` | Different syntax, same concept |
| Decimals | `DECIMAL(10,2)` | `NUMERIC(10,2)` | Exact precision |
| Floating point | `FLOAT`, `DOUBLE` | `REAL`, `DOUBLE PRECISION` | Approximate values |

**Examples:**
```sql
-- MySQL
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    price DECIMAL(10,2),  -- $99,999,999.99 max
    weight FLOAT,         -- Approximate weight
    stock_count SMALLINT UNSIGNED  -- 0 to 65,535
);

-- PostgreSQL
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    price NUMERIC(10,2),  -- Same precision as MySQL DECIMAL
    weight REAL,          -- Approximate weight
    stock_count SMALLINT CHECK (stock_count >= 0)
);
```

### 📝 String Types

| Purpose | MySQL | PostgreSQL | Max Length |
|---------|-------|------------|------------|
| Fixed length | `CHAR(n)` | `CHAR(n)` | n characters |
| Variable length | `VARCHAR(n)` | `VARCHAR(n)` | n characters |
| Large text | `TEXT` | `TEXT` | ~65KB (MySQL), ~1GB (PostgreSQL) |
| Huge text | `LONGTEXT` | `TEXT` | ~4GB (MySQL), unlimited (PostgreSQL) |
| Binary data | `BLOB` | `BYTEA` | For files, images |

**Examples:**
```sql
-- User profile table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,     -- Short, indexed field
    email VARCHAR(255) NOT NULL,       -- Email addresses
    bio TEXT,                          -- Long description
    avatar_data BYTEA,                 -- Profile picture (PostgreSQL)
    -- avatar_data BLOB,               -- Profile picture (MySQL)
    country_code CHAR(2)               -- Fixed: 'US', 'CA', 'UK'
);
```

### 📅 Date and Time Types

| Purpose | MySQL | PostgreSQL | Notes |
|---------|-------|------------|-------|
| Date only | `DATE` | `DATE` | YYYY-MM-DD |
| Time only | `TIME` | `TIME` | HH:MM:SS |
| Date + Time | `DATETIME` | `TIMESTAMP` | Different default behaviors |
| With timezone | `TIMESTAMP` | `TIMESTAMPTZ` | PostgreSQL handles timezones better |
| Year only | `YEAR` | Use `INTEGER` | MySQL-specific |

**Examples:**
```sql
-- Event scheduling table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(100),
    event_date DATE,                    -- Just the date
    start_time TIME,                    -- Just the time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- PostgreSQL also supports:
    scheduled_at TIMESTAMPTZ,           -- With timezone info
    duration INTERVAL                   -- PostgreSQL: '2 hours 30 minutes'
);
```

### 🔢 Boolean and Special Types

**Boolean:**
```sql
-- MySQL (no native boolean)
CREATE TABLE settings (
    id INT PRIMARY KEY,
    is_active TINYINT(1),  -- 0 or 1
    -- OR
    is_public BOOLEAN      -- Actually TINYINT(1)
);

-- PostgreSQL (true boolean)
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN,     -- TRUE/FALSE/NULL
    is_public BOOL         -- Alias for BOOLEAN
);
```

**JSON (Modern databases):**
```sql
-- MySQL 5.7+
CREATE TABLE products (
    id INT PRIMARY KEY,
    attributes JSON,
    metadata JSON
);

-- PostgreSQL (superior JSON support)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    attributes JSON,       -- Basic JSON
    metadata JSONB,       -- Binary JSON (faster, indexable)
    tags TEXT[]           -- Array of strings (PostgreSQL only)
);
```

---

## 💡 Real-World Examples

### Example 1: E-commerce Product Catalog
```sql
-- Optimized for performance and storage
CREATE TABLE products (
    -- Primary key: INT is sufficient for most catalogs
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Product info: VARCHAR for known limits
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    
    -- Price: DECIMAL for exact money calculations
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    
    -- Inventory: SMALLINT saves space
    stock_quantity SMALLINT UNSIGNED DEFAULT 0,
    
    -- Descriptions: TEXT for variable length
    short_description VARCHAR(500),
    full_description TEXT,
    
    -- Flags: BOOLEAN/TINYINT for true/false
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Tracking: TIMESTAMP for audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Categories: INT for foreign key
    category_id INT,
    
    -- Metadata: JSON for flexible attributes
    attributes JSON,  -- {"color": "red", "size": "large"}
    
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);
```

### Example 2: User Management System
```sql
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,  -- BIGINT for large user base
    
    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash CHAR(60),  -- bcrypt hash is always 60 chars
    
    -- Profile
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    
    -- Settings
    email_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Tracking
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Flexible data
    preferences JSON,  -- User settings, theme, etc.
    
    -- Constraints
    CHECK (email LIKE '%@%'),  -- Basic email validation
    CHECK (date_of_birth < CURRENT_DATE)
);
```

### Example 3: Financial Transactions
```sql
CREATE TABLE transactions (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Money: Always use DECIMAL for currency
    amount DECIMAL(15,2) NOT NULL,  -- Up to $999,999,999,999.99
    currency CHAR(3) DEFAULT 'USD', -- ISO currency codes
    
    -- References
    from_account_id BIGINT NOT NULL,
    to_account_id BIGINT,
    
    -- Transaction details
    transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'fee'),
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    
    -- Audit trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Additional info
    description VARCHAR(255),
    reference_number VARCHAR(50) UNIQUE,
    
    -- Constraints
    CHECK (amount > 0),
    CHECK (from_account_id != to_account_id)
);
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"When would you use VARCHAR vs TEXT?"**
   - VARCHAR: When you know the approximate max length (names, emails)
   - TEXT: For variable-length content (blog posts, comments)
   - Performance: VARCHAR can be indexed more efficiently

2. **"Why use DECIMAL instead of FLOAT for money?"**
   - DECIMAL: Exact precision, no rounding errors
   - FLOAT: Approximate, can cause rounding issues with currency
   - Example: 0.1 + 0.2 might not equal 0.3 in floating point

3. **"What's the difference between DATETIME and TIMESTAMP?"**
   - DATETIME: Fixed time, no timezone conversion
   - TIMESTAMP: Converts to UTC, affected by timezone changes
   - TIMESTAMP has smaller range but better for global apps

### Performance Tips:

1. **Choose the smallest appropriate type**
   ```sql
   -- Bad: Wastes 3 bytes per row
   age INT;
   
   -- Good: TINYINT is sufficient (0-255)
   age TINYINT UNSIGNED;
   ```

2. **Use fixed-length types when possible**
   ```sql
   -- Good for indexing and joins
   country_code CHAR(2);
   phone_country_code CHAR(3);
   ```

3. **Consider indexing implications**
   ```sql
   -- Shorter keys = faster indexes
   email VARCHAR(255),  -- Good
   bio TEXT,           -- Don't index the full column
   ```

---

## ⚠️ Things to Watch Out For

### 1. **MySQL vs PostgreSQL Auto-Increment**
```sql
-- MySQL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY
);

-- PostgreSQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY
    -- OR (PostgreSQL 10+)
    -- id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);
```

### 2. **Boolean Handling**
```sql
-- MySQL: No true boolean
SELECT * FROM users WHERE is_active = 1;  -- Use 1/0

-- PostgreSQL: True boolean
SELECT * FROM users WHERE is_active = TRUE;  -- Use TRUE/FALSE
SELECT * FROM users WHERE is_active;         -- Implicit TRUE check
```

### 3. **String Length Limits**
```sql
-- MySQL: VARCHAR max is 65,535 characters
CREATE TABLE posts (content VARCHAR(65535));  -- Max in MySQL

-- PostgreSQL: VARCHAR can be much larger
CREATE TABLE posts (content VARCHAR(1000000)); -- Works in PostgreSQL
```

### 4. **JSON Support Differences**
```sql
-- MySQL: Basic JSON
SELECT JSON_EXTRACT(data, '$.name') FROM products;

-- PostgreSQL: Rich JSON operators
SELECT data->>'name' FROM products;           -- Get as text
SELECT data->'attributes'->'color' FROM products; -- Nested access
```

### 5. **Date/Time Timezone Handling**
```sql
-- MySQL: TIMESTAMP affected by timezone setting
SET time_zone = '+00:00';
INSERT INTO events (created_at) VALUES (NOW());

-- PostgreSQL: TIMESTAMPTZ stores timezone info
INSERT INTO events (created_at) VALUES (NOW()); -- Includes timezone
```

### 6. **Enum vs Check Constraints**
```sql
-- MySQL: ENUM type
CREATE TABLE orders (
    status ENUM('pending', 'shipped', 'delivered')
);

-- PostgreSQL: Can use ENUM or CHECK
CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered');
CREATE TABLE orders (
    status order_status
);
-- OR
CREATE TABLE orders (
    status VARCHAR(20) CHECK (status IN ('pending', 'shipped', 'delivered'))
);
```

---

## 🚀 Next Steps

In the next chapter, we'll learn how to **Create Databases & Tables** with proper constraints, indexes, and relationships. You'll see how to put these data types to work in real table designs.

---

## 📝 Quick Practice

Design data types for a social media platform:
- User profiles (username, bio, follower count)
- Posts (content, likes, shares, timestamp)
- Comments (text, reply threading)
- Media uploads (file data, metadata)

Think about:
- What's the maximum reasonable length for each field?
- Which fields need exact vs approximate numbers?
- How will you handle user-generated content of varying lengths?