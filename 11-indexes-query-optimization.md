# Chapter 11: Indexes and Query Optimization

## 📚 What You'll Learn

Indexes are database objects that improve query performance by creating shortcuts to data. Understanding how to create, use, and optimize indexes is crucial for building high-performance database applications. This chapter covers index types, query optimization techniques, and performance tuning strategies.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand different types of indexes and when to use them
- Know how to analyze query execution plans
- Master index creation and optimization strategies
- Learn query optimization techniques
- Understand the trade-offs between query performance and storage
- Apply performance tuning best practices

---

## 🔍 Concept Explanation

### What are Indexes?

An index is a data structure that improves the speed of data retrieval operations on a database table. Think of it like an index in a book - instead of reading every page to find a topic, you can use the index to jump directly to the relevant pages.

**Key Benefits:**
- Faster SELECT queries
- Faster WHERE clause filtering
- Faster ORDER BY operations
- Faster JOIN operations

**Trade-offs:**
- Additional storage space
- Slower INSERT/UPDATE/DELETE operations
- Maintenance overhead

---

## 🛠️ Index Types Comparison

### MySQL vs PostgreSQL Index Types

| Index Type | MySQL | PostgreSQL | Use Case |
|------------|-------|------------|----------|
| B-Tree | ✅ (Default) | ✅ (Default) | General purpose, range queries |
| Hash | ✅ (Memory engine) | ✅ | Equality comparisons only |
| Full-Text | ✅ | ✅ | Text search |
| Spatial | ✅ | ✅ (PostGIS) | Geographic data |
| Partial | ❌ | ✅ | Conditional indexing |
| Expression | ❌ | ✅ | Function-based indexing |
| GIN | ❌ | ✅ | Array, JSON, full-text |
| GiST | ❌ | ✅ | Complex data types |
| Covering | ✅ (5.7+) | ✅ | Include non-key columns |

---

## 📊 Basic Index Operations

### Creating Indexes

**MySQL:**
```sql
-- Basic index creation
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_product_category ON products(category_id);

-- Composite index
CREATE INDEX idx_order_customer_date ON orders(customer_id, order_date);

-- Unique index
CREATE UNIQUE INDEX idx_customer_email_unique ON customers(email);

-- Covering index (MySQL 5.7+)
ALTER TABLE orders ADD INDEX idx_customer_covering (customer_id) INCLUDE (order_date, total_amount);

-- Full-text index
CREATE FULLTEXT INDEX idx_product_description ON products(product_name, description);
```

**PostgreSQL:**
```sql
-- Basic index creation
CREATE INDEX idx_customer_email ON customers(email);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_product_category ON products(category_id);

-- Composite index
CREATE INDEX idx_order_customer_date ON orders(customer_id, order_date);

-- Unique index
CREATE UNIQUE INDEX idx_customer_email_unique ON customers(email);

-- Partial index (PostgreSQL only)
CREATE INDEX idx_active_customers ON customers(email) WHERE status = 'active';

-- Expression index (PostgreSQL only)
CREATE INDEX idx_customer_lower_email ON customers(LOWER(email));

-- Covering index
CREATE INDEX idx_customer_covering ON orders(customer_id) INCLUDE (order_date, total_amount);

-- GIN index for JSON
CREATE INDEX idx_product_attributes ON products USING GIN(attributes);

-- Full-text index
CREATE INDEX idx_product_search ON products USING GIN(to_tsvector('english', product_name || ' ' || description));
```

### Viewing and Managing Indexes

**MySQL:**
```sql
-- Show indexes for a table
SHOW INDEXES FROM orders;

-- Show index usage statistics
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'your_database'
  AND TABLE_NAME = 'orders';

-- Drop index
DROP INDEX idx_order_date ON orders;
```

**PostgreSQL:**
```sql
-- Show indexes for a table
\d+ orders

-- Query index information
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'orders';

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'orders';

-- Drop index
DROP INDEX idx_order_date;
```

---

## 🔍 Query Execution Plans

### Understanding EXPLAIN

**MySQL:**
```sql
-- Basic EXPLAIN
EXPLAIN SELECT * FROM orders WHERE customer_id = 123;

-- Detailed execution plan
EXPLAIN FORMAT=JSON 
SELECT 
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.status = 'active'
  AND o.order_date >= '2024-01-01'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(o.order_id) > 5;

-- Analyze actual execution
EXPLAIN ANALYZE 
SELECT * FROM orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY total_amount DESC
LIMIT 100;
```

**PostgreSQL:**
```sql
-- Basic EXPLAIN
EXPLAIN SELECT * FROM orders WHERE customer_id = 123;

-- Detailed execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT 
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.status = 'active'
  AND o.order_date >= '2024-01-01'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(o.order_id) > 5;

-- Visual execution plan
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY total_amount DESC
LIMIT 100;
```

### Reading Execution Plans

**Key Metrics to Watch:**
- **Cost**: Estimated query cost (PostgreSQL)
- **Rows**: Number of rows processed
- **Time**: Actual execution time
- **Access Method**: How data is accessed (Index Scan, Seq Scan, etc.)
- **Join Type**: How tables are joined (Nested Loop, Hash Join, etc.)

```sql
-- Example: Analyzing a slow query
EXPLAIN ANALYZE
SELECT 
    p.product_name,
    c.category_name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.unit_price) as revenue
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_date >= '2024-01-01'
  AND o.status = 'completed'
  AND p.status = 'active'
GROUP BY p.product_id, p.product_name, c.category_name
HAVING SUM(oi.quantity) > 100
ORDER BY revenue DESC;
```

---

## ⚡ Index Optimization Strategies

### 1. Composite Index Column Order

```sql
-- Rule: Most selective columns first, then by query patterns

-- Good: Selective customer_id first, then date range
CREATE INDEX idx_orders_customer_date_status ON orders(customer_id, order_date, status);

-- Query that benefits from this index
SELECT * FROM orders 
WHERE customer_id = 123 
  AND order_date >= '2024-01-01' 
  AND status = 'completed';

-- Also benefits from leftmost prefix
SELECT * FROM orders WHERE customer_id = 123;
SELECT * FROM orders WHERE customer_id = 123 AND order_date >= '2024-01-01';

-- Won't use the index efficiently
SELECT * FROM orders WHERE order_date >= '2024-01-01';  -- Skips customer_id
SELECT * FROM orders WHERE status = 'completed';        -- Skips customer_id and order_date
```

### 2. Covering Indexes

```sql
-- Include frequently accessed columns in the index
CREATE INDEX idx_orders_covering ON orders(customer_id, order_date) 
INCLUDE (total_amount, status);

-- This query can be satisfied entirely from the index
SELECT customer_id, order_date, total_amount, status
FROM orders
WHERE customer_id = 123
  AND order_date >= '2024-01-01';
```

### 3. Partial Indexes (PostgreSQL)

```sql
-- Index only active records
CREATE INDEX idx_active_customers_email ON customers(email) 
WHERE status = 'active';

-- Index only recent orders
CREATE INDEX idx_recent_orders ON orders(customer_id, order_date) 
WHERE order_date >= CURRENT_DATE - INTERVAL '1 year';

-- Index only high-value orders
CREATE INDEX idx_high_value_orders ON orders(customer_id, order_date) 
WHERE total_amount >= 1000;
```

### 4. Expression Indexes (PostgreSQL)

```sql
-- Index on function results
CREATE INDEX idx_customer_lower_email ON customers(LOWER(email));

-- Query that uses the expression index
SELECT * FROM customers WHERE LOWER(email) = 'john@example.com';

-- Index on calculated values
CREATE INDEX idx_order_year_month ON orders(EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date));

-- Query using the expression index
SELECT * FROM orders 
WHERE EXTRACT(YEAR FROM order_date) = 2024 
  AND EXTRACT(MONTH FROM order_date) = 6;
```

---

## 🚀 Query Optimization Techniques

### 1. WHERE Clause Optimization

```sql
-- Bad: Non-sargable queries (can't use indexes effectively)
SELECT * FROM orders WHERE YEAR(order_date) = 2024;
SELECT * FROM customers WHERE UPPER(first_name) = 'JOHN';
SELECT * FROM products WHERE price * 1.1 > 100;

-- Good: Sargable queries (can use indexes)
SELECT * FROM orders 
WHERE order_date >= '2024-01-01' 
  AND order_date < '2025-01-01';

SELECT * FROM customers WHERE first_name = 'John';
SELECT * FROM products WHERE price > 100 / 1.1;

-- Use EXISTS instead of IN for better performance
-- Bad: IN with subquery
SELECT * FROM customers 
WHERE customer_id IN (
    SELECT customer_id FROM orders 
    WHERE order_date >= '2024-01-01'
);

-- Good: EXISTS
SELECT * FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.customer_id = c.customer_id 
      AND o.order_date >= '2024-01-01'
);
```

### 2. JOIN Optimization

```sql
-- Ensure proper indexes on JOIN columns
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Use appropriate JOIN types
-- INNER JOIN when you only want matching records
SELECT c.first_name, c.last_name, COUNT(o.order_id)
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name;

-- LEFT JOIN when you want all records from left table
SELECT c.first_name, c.last_name, COALESCE(COUNT(o.order_id), 0)
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id 
  AND o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name;
```

### 3. LIMIT and Pagination Optimization

```sql
-- Bad: OFFSET becomes slow with large offsets
SELECT * FROM orders 
ORDER BY order_date DESC 
LIMIT 20 OFFSET 10000;  -- Slow for large offsets

-- Good: Cursor-based pagination
SELECT * FROM orders 
WHERE order_date < '2024-06-15 10:30:00'  -- Last order_date from previous page
ORDER BY order_date DESC 
LIMIT 20;

-- Even better: Use indexed column for cursor
SELECT * FROM orders 
WHERE order_id < 12345  -- Last order_id from previous page
ORDER BY order_id DESC 
LIMIT 20;
```

### 4. Subquery Optimization

```sql
-- Convert correlated subqueries to JOINs when possible
-- Bad: Correlated subquery
SELECT c.*, (
    SELECT COUNT(*) 
    FROM orders o 
    WHERE o.customer_id = c.customer_id 
      AND o.status = 'completed'
) as order_count
FROM customers c;

-- Good: JOIN with GROUP BY
SELECT 
    c.*,
    COALESCE(order_stats.order_count, 0) as order_count
FROM customers c
LEFT JOIN (
    SELECT 
        customer_id,
        COUNT(*) as order_count
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
) order_stats ON c.customer_id = order_stats.customer_id;
```

---

## 📊 Performance Monitoring

### MySQL Performance Monitoring

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;  -- Log queries taking more than 2 seconds

-- Check index usage
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database'
ORDER BY COUNT_FETCH DESC;

-- Find unused indexes
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database'
  AND INDEX_NAME IS NOT NULL
  AND COUNT_FETCH = 0
  AND COUNT_INSERT = 0
  AND COUNT_UPDATE = 0
  AND COUNT_DELETE = 0;

-- Query performance statistics
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_seconds,
    MAX_TIMER_WAIT/1000000000 as max_time_seconds
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;
```

### PostgreSQL Performance Monitoring

```sql
-- Enable query statistics
-- Add to postgresql.conf:
-- shared_preload_libraries = 'pg_stat_statements'
-- pg_stat_statements.track = all

-- Top slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Table and index sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
    pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
    pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

---

## 💡 Real-World Optimization Examples

### Example 1: E-commerce Product Search Optimization

```sql
-- Problem: Slow product search query
-- Original slow query
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    AVG(r.rating) as avg_rating,
    COUNT(r.review_id) as review_count
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN reviews r ON p.product_id = r.product_id
WHERE p.product_name ILIKE '%laptop%'
  AND p.status = 'active'
  AND p.price BETWEEN 500 AND 2000
GROUP BY p.product_id, p.product_name, p.price, c.category_name
HAVING AVG(r.rating) >= 4.0
ORDER BY avg_rating DESC, review_count DESC
LIMIT 20;

-- Optimization steps:

-- 1. Create appropriate indexes
CREATE INDEX idx_products_status_price ON products(status, price);
CREATE INDEX idx_products_name_gin ON products USING GIN(to_tsvector('english', product_name));  -- PostgreSQL
CREATE FULLTEXT INDEX idx_products_name_fulltext ON products(product_name);  -- MySQL
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);

-- 2. Optimized query with better structure
WITH product_search AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.price,
        c.category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    WHERE p.status = 'active'
      AND p.price BETWEEN 500 AND 2000
      AND (
          -- PostgreSQL full-text search
          to_tsvector('english', p.product_name) @@ to_tsquery('english', 'laptop')
          -- OR MySQL full-text search
          -- MATCH(p.product_name) AGAINST('laptop' IN NATURAL LANGUAGE MODE)
      )
),
product_ratings AS (
    SELECT 
        product_id,
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
    FROM reviews
    WHERE product_id IN (SELECT product_id FROM product_search)
    GROUP BY product_id
    HAVING AVG(rating) >= 4.0
)
SELECT 
    ps.product_id,
    ps.product_name,
    ps.price,
    ps.category_name,
    COALESCE(pr.avg_rating, 0) as avg_rating,
    COALESCE(pr.review_count, 0) as review_count
FROM product_search ps
LEFT JOIN product_ratings pr ON ps.product_id = pr.product_id
ORDER BY pr.avg_rating DESC NULLS LAST, pr.review_count DESC NULLS LAST
LIMIT 20;
```

### Example 2: Customer Analytics Dashboard Optimization

```sql
-- Problem: Slow customer analytics query
-- Original query taking 30+ seconds
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(o.order_id) as total_orders,
    SUM(o.total_amount) as total_spent,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.order_date) as last_order_date,
    COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) as active_months
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id 
  AND o.status = 'completed'
  AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
WHERE c.status = 'active'
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
ORDER BY total_spent DESC;

-- Optimization approach:

-- 1. Create materialized view or summary table (PostgreSQL)
CREATE MATERIALIZED VIEW customer_analytics_12m AS
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.status,
    COALESCE(order_stats.total_orders, 0) as total_orders,
    COALESCE(order_stats.total_spent, 0) as total_spent,
    COALESCE(order_stats.avg_order_value, 0) as avg_order_value,
    order_stats.last_order_date,
    COALESCE(order_stats.active_months, 0) as active_months,
    CURRENT_DATE as last_updated
FROM customers c
LEFT JOIN (
    SELECT 
        customer_id,
        COUNT(order_id) as total_orders,
        SUM(total_amount) as total_spent,
        AVG(total_amount) as avg_order_value,
        MAX(order_date) as last_order_date,
        COUNT(DISTINCT EXTRACT(MONTH FROM order_date)) as active_months
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY customer_id
) order_stats ON c.customer_id = order_stats.customer_id;

-- Create index on materialized view
CREATE INDEX idx_customer_analytics_spent ON customer_analytics_12m(total_spent DESC);
CREATE INDEX idx_customer_analytics_orders ON customer_analytics_12m(total_orders DESC);

-- Refresh materialized view (can be automated)
REFRESH MATERIALIZED VIEW customer_analytics_12m;

-- Fast query using materialized view
SELECT *
FROM customer_analytics_12m
WHERE status = 'active'
ORDER BY total_spent DESC
LIMIT 100;

-- 2. Alternative: Create summary table with triggers (MySQL/PostgreSQL)
CREATE TABLE customer_summary (
    customer_id INT PRIMARY KEY,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    last_order_date DATE,
    active_months INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_customer_summary_spent ON customer_summary(total_spent DESC);
CREATE INDEX idx_customer_summary_updated ON customer_summary(last_updated);
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"How do you identify slow queries?"**
   - Enable slow query logs
   - Use performance monitoring tools
   - Analyze execution plans
   - Monitor database metrics

2. **"When would you use a composite index vs multiple single-column indexes?"**
   - Composite: When queries filter on multiple columns together
   - Single: When queries typically filter on one column at a time
   - Consider query patterns and selectivity

3. **"How do you decide which columns to include in a covering index?"**
   - Include frequently accessed columns in SELECT clause
   - Balance between query performance and index size
   - Consider update frequency of included columns

4. **"What's the difference between clustered and non-clustered indexes?"**
   - Clustered: Data pages stored in order of index key (one per table)
   - Non-clustered: Separate structure pointing to data pages
   - MySQL InnoDB: Primary key is clustered index

### Performance Tuning Best Practices:

1. **Start with proper indexing strategy**
2. **Monitor and analyze query patterns**
3. **Use appropriate data types**
4. **Normalize appropriately (don't over-normalize)**
5. **Consider partitioning for very large tables**
6. **Regular maintenance (ANALYZE, VACUUM, etc.)**

---

## ⚠️ Things to Watch Out For

### 1. **Over-Indexing**
```sql
-- Problem: Too many indexes slow down writes
-- Don't create indexes for every possible query

-- Bad: Redundant indexes
CREATE INDEX idx1 ON orders(customer_id);
CREATE INDEX idx2 ON orders(customer_id, order_date);  -- idx1 is redundant

-- Good: Use composite index that serves multiple purposes
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
```

### 2. **Wrong Column Order in Composite Indexes**
```sql
-- Bad: Low selectivity column first
CREATE INDEX idx_bad ON orders(status, customer_id);  -- status has few values

-- Good: High selectivity column first
CREATE INDEX idx_good ON orders(customer_id, status);  -- customer_id is more selective
```

### 3. **Ignoring Index Maintenance**
```sql
-- PostgreSQL: Regular maintenance
ANALYZE;  -- Update statistics
VACUUM;   -- Reclaim space
REINDEX;  -- Rebuild indexes if needed

-- MySQL: Regular maintenance
ANALYZE TABLE orders;
OPTIMIZE TABLE orders;  -- For MyISAM tables
```

### 4. **Not Considering Query Patterns**
```sql
-- If most queries are:
SELECT * FROM orders WHERE customer_id = ? AND status = 'completed';

-- Create index matching the query pattern:
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Not:
CREATE INDEX idx_orders_status_customer ON orders(status, customer_id);
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Stored Procedures and Functions** - reusable code blocks that can encapsulate business logic, improve performance, and provide better security. You'll learn how to create, manage, and optimize stored procedures and functions.

---

## 📝 Quick Practice

Try these optimization exercises:

1. **Index Analysis**: Analyze a slow query and create appropriate indexes
2. **Execution Plans**: Compare execution plans before and after optimization
3. **Composite Indexes**: Design optimal composite indexes for complex queries
4. **Performance Monitoring**: Set up monitoring for index usage and query performance
5. **Real-world Scenario**: Optimize a dashboard query that aggregates large amounts of data

Consider:
- Query patterns and frequency
- Index maintenance overhead
- Storage space vs. performance trade-offs
- Different optimization strategies for OLTP vs. OLAP workloads