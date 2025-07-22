# 📘 Chapter 7: Joins (INNER, LEFT, RIGHT, FULL)

## 🎯 What You'll Learn
- Understanding table relationships and join concepts
- INNER JOIN for matching records
- LEFT JOIN for preserving left table records
- RIGHT JOIN for preserving right table records
- FULL OUTER JOIN for all records
- CROSS JOIN for cartesian products
- Self-joins and complex join scenarios
- Join performance optimization

---

## 📖 Concept Explanation

**Joins** are the heart of relational databases. They allow you to combine data from multiple tables based on relationships between them. Think of joins as "connecting the dots" between related information stored in different tables.

### Why Use Joins?
1. **Normalization**: Data is stored in separate tables to avoid redundancy
2. **Relationships**: Tables are connected through foreign keys
3. **Comprehensive Queries**: Get complete information by combining related data
4. **Data Integrity**: Maintain consistency across related tables

### Types of Joins:
- **INNER JOIN**: Only matching records from both tables
- **LEFT JOIN**: All records from left table + matching from right
- **RIGHT JOIN**: All records from right table + matching from left
- **FULL OUTER JOIN**: All records from both tables
- **CROSS JOIN**: Cartesian product (every row with every row)
- **SELF JOIN**: Join a table with itself

### Visual Join Representation:
```
Table A (Customers)     Table B (Orders)
┌─────────────────┐     ┌─────────────────┐
│ customer_id (PK)│────▶│ customer_id (FK)│
│ name            │     │ order_id (PK)   │
│ email           │     │ order_date      │
└─────────────────┘     │ total_amount    │
                        └─────────────────┘
```

---

## 🔗 INNER JOIN - Matching Records Only

### Basic INNER JOIN Syntax
```sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;

-- Alternative syntax (implicit join)
SELECT columns
FROM table1, table2
WHERE table1.column = table2.column;
```

### Simple INNER JOIN Examples

**1. Customers with Orders:**
```sql
-- Get customers who have placed orders
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.last_name, c.first_name, o.order_date;

-- Count orders per customer (only customers with orders)
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;
```

**2. Products with Categories:**
```sql
-- Get products with their category information
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    c.description as category_description
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
ORDER BY c.category_name, p.product_name;

-- Average price by category (only categories with products)
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    AVG(p.price) as avg_price,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM categories c
INNER JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
ORDER BY avg_price DESC;
```

### Multiple INNER JOINs

**1. Three Table Join:**
```sql
-- Get order details with customer and product information
SELECT 
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    p.product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) as line_total
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
INNER JOIN products p ON oi.product_id = p.product_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY o.order_date DESC, o.order_id, oi.order_item_id;
```

**2. Complex Business Query:**
```sql
-- Sales report: Customer, Order, Product, and Category information
SELECT 
    cat.category_name,
    p.product_name,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email,
    o.order_date,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) as revenue,
    
    -- Calculate discount if original price is available
    CASE 
        WHEN p.price > oi.unit_price 
        THEN ROUND(((p.price - oi.unit_price) / p.price * 100), 2)
        ELSE 0
    END as discount_percentage
FROM categories cat
INNER JOIN products p ON cat.category_id = p.category_id
INNER JOIN order_items oi ON p.product_id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.order_id
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE 
    o.order_date BETWEEN '2024-01-01' AND '2024-12-31'
    AND o.status IN ('completed', 'shipped', 'delivered')
ORDER BY 
    cat.category_name, 
    revenue DESC;
```

---

## ⬅️ LEFT JOIN - Preserve Left Table

### Basic LEFT JOIN Syntax
```sql
SELECT columns
FROM table1
LEFT JOIN table2 ON table1.column = table2.column;

-- Alternative syntax
SELECT columns
FROM table1
LEFT OUTER JOIN table2 ON table1.column = table2.column;
```

### LEFT JOIN Examples

**1. All Customers (with or without orders):**
```sql
-- Get all customers and their order information (if any)
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    o.order_id,
    o.order_date,
    o.total_amount,
    
    -- Handle NULL values from right table
    CASE 
        WHEN o.order_id IS NULL THEN 'No orders'
        ELSE 'Has orders'
    END as order_status
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY c.last_name, c.first_name, o.order_date;

-- Find customers who have never placed an order
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.created_at
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL  -- No matching orders
ORDER BY c.created_at DESC;
```

**2. Customer Order Summary:**
```sql
-- All customers with their order statistics
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    
    -- Aggregate functions handle NULLs appropriately
    COUNT(o.order_id) as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    MAX(o.order_date) as last_order_date,
    
    -- Customer segmentation
    CASE 
        WHEN COUNT(o.order_id) = 0 THEN 'No Orders'
        WHEN COUNT(o.order_id) = 1 THEN 'One-time Customer'
        WHEN COUNT(o.order_id) BETWEEN 2 AND 5 THEN 'Regular Customer'
        WHEN COUNT(o.order_id) > 5 THEN 'VIP Customer'
    END as customer_segment
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
ORDER BY total_spent DESC;
```

**3. Product Performance Analysis:**
```sql
-- All products with their sales performance (including unsold products)
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    c.category_name,
    
    -- Sales metrics (NULL-safe)
    COALESCE(SUM(oi.quantity), 0) as total_units_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue,
    COUNT(DISTINCT oi.order_id) as order_count,
    
    -- Performance indicators
    CASE 
        WHEN SUM(oi.quantity) IS NULL THEN 'Never Sold'
        WHEN SUM(oi.quantity) < 10 THEN 'Low Sales'
        WHEN SUM(oi.quantity) < 50 THEN 'Moderate Sales'
        ELSE 'High Sales'
    END as sales_performance
FROM products p
LEFT JOIN categories c ON p.category_id = c.category_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.order_id 
    AND o.status IN ('completed', 'shipped', 'delivered')
WHERE p.status = 'active'
GROUP BY 
    p.product_id, p.product_name, p.price, p.stock_quantity, c.category_name
ORDER BY total_revenue DESC;
```

---

## ➡️ RIGHT JOIN - Preserve Right Table

### Basic RIGHT JOIN Syntax
```sql
SELECT columns
FROM table1
RIGHT JOIN table2 ON table1.column = table2.column;

-- Alternative syntax
SELECT columns
FROM table1
RIGHT OUTER JOIN table2 ON table1.column = table2.column;
```

### RIGHT JOIN Examples

**1. All Orders (with customer info if available):**
```sql
-- Get all orders, even if customer data is missing
SELECT 
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    
    -- Customer info (might be NULL)
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    
    -- Handle missing customer data
    CASE 
        WHEN c.customer_id IS NULL THEN 'Customer data missing'
        ELSE 'Customer found'
    END as customer_status
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id
ORDER BY o.order_date DESC;

-- Find orders with missing customer references (data integrity check)
SELECT 
    o.order_id,
    o.customer_id as orphaned_customer_id,
    o.order_date,
    o.total_amount
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id
WHERE c.customer_id IS NULL;
```

**Note**: RIGHT JOIN is less commonly used than LEFT JOIN. Most developers prefer to rewrite RIGHT JOINs as LEFT JOINs by switching table order:

```sql
-- These queries are equivalent:

-- RIGHT JOIN version
SELECT *
FROM customers c
RIGHT JOIN orders o ON c.customer_id = o.customer_id;

-- LEFT JOIN version (preferred)
SELECT *
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id;
```

---

## 🔄 FULL OUTER JOIN - All Records

### Basic FULL OUTER JOIN Syntax
```sql
SELECT columns
FROM table1
FULL OUTER JOIN table2 ON table1.column = table2.column;

-- Alternative syntax
SELECT columns
FROM table1
FULL JOIN table2 ON table1.column = table2.column;
```

**Note**: MySQL doesn't support FULL OUTER JOIN directly. You can simulate it using UNION:

```sql
-- MySQL: Simulate FULL OUTER JOIN with UNION
SELECT columns FROM table1 LEFT JOIN table2 ON condition
UNION
SELECT columns FROM table1 RIGHT JOIN table2 ON condition;
```

### FULL OUTER JOIN Examples (PostgreSQL)

**1. Complete Customer-Order Relationship:**
```sql
-- Get all customers and all orders, showing relationships where they exist
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount,
    
    -- Categorize the relationship
    CASE 
        WHEN c.customer_id IS NULL THEN 'Order without customer'
        WHEN o.order_id IS NULL THEN 'Customer without orders'
        ELSE 'Customer with orders'
    END as relationship_status
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id
ORDER BY 
    c.customer_id NULLS LAST, 
    o.order_date NULLS LAST;
```

**2. Data Integrity Analysis:**
```sql
-- Find all mismatches between customers and orders tables
SELECT 
    COALESCE(c.customer_id, o.customer_id) as customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    
    -- Identify data issues
    CASE 
        WHEN c.customer_id IS NULL THEN 'ORPHANED ORDER: No customer record'
        WHEN o.order_id IS NULL THEN 'CUSTOMER WITHOUT ORDERS: Potential marketing target'
        ELSE 'VALID RELATIONSHIP'
    END as data_status
FROM customers c
FULL OUTER JOIN orders o ON c.customer_id = o.customer_id
WHERE 
    c.customer_id IS NULL OR o.order_id IS NULL  -- Only show mismatches
ORDER BY data_status, customer_id;
```

---

## ❌ CROSS JOIN - Cartesian Product

### Basic CROSS JOIN Syntax
```sql
SELECT columns
FROM table1
CROSS JOIN table2;

-- Alternative syntax
SELECT columns
FROM table1, table2;
```

### CROSS JOIN Examples

**1. Product-Size Combinations:**
```sql
-- Generate all possible product-size combinations
SELECT 
    p.product_name,
    s.size_name,
    p.base_price,
    s.price_modifier,
    (p.base_price + s.price_modifier) as final_price
FROM products p
CROSS JOIN sizes s
WHERE p.category_id = 1  -- Only for clothing category
ORDER BY p.product_name, s.sort_order;

-- Create a size availability matrix
SELECT 
    p.product_name,
    COUNT(CASE WHEN s.size_name = 'XS' THEN 1 END) as xs_available,
    COUNT(CASE WHEN s.size_name = 'S' THEN 1 END) as s_available,
    COUNT(CASE WHEN s.size_name = 'M' THEN 1 END) as m_available,
    COUNT(CASE WHEN s.size_name = 'L' THEN 1 END) as l_available,
    COUNT(CASE WHEN s.size_name = 'XL' THEN 1 END) as xl_available
FROM products p
CROSS JOIN sizes s
WHERE p.category_id = 1
GROUP BY p.product_id, p.product_name;
```

**2. Date Range Generation:**
```sql
-- Generate sales report template for all months and categories
WITH months AS (
    SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
        DATE_TRUNC('month', CURRENT_DATE),
        INTERVAL '1 month'
    )::date as month_start
)
SELECT 
    m.month_start,
    TO_CHAR(m.month_start, 'YYYY-MM') as month_label,
    c.category_id,
    c.category_name,
    
    -- Placeholder for actual sales data
    0 as planned_sales,
    NULL as actual_sales
FROM months m
CROSS JOIN categories c
ORDER BY m.month_start, c.category_name;
```

**⚠️ Warning**: CROSS JOIN can produce very large result sets. A table with 1,000 rows crossed with another 1,000-row table produces 1,000,000 rows!

---

## 🔄 SELF JOIN - Join Table with Itself

### Self JOIN Concept
A self join is when you join a table with itself, typically to find relationships within the same table (like hierarchies, comparisons, or sequences).

### Self JOIN Examples

**1. Employee Hierarchy:**
```sql
-- Find employees and their managers
SELECT 
    e.employee_id,
    e.first_name || ' ' || e.last_name as employee_name,
    e.job_title,
    m.employee_id as manager_id,
    m.first_name || ' ' || m.last_name as manager_name,
    m.job_title as manager_title
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY m.employee_id NULLS FIRST, e.last_name;

-- Find all employees who report to a specific manager
SELECT 
    m.first_name || ' ' || m.last_name as manager_name,
    COUNT(e.employee_id) as direct_reports,
    STRING_AGG(e.first_name || ' ' || e.last_name, ', ') as team_members
FROM employees m
LEFT JOIN employees e ON m.employee_id = e.manager_id
GROUP BY m.employee_id, m.first_name, m.last_name
HAVING COUNT(e.employee_id) > 0
ORDER BY direct_reports DESC;
```

**2. Product Comparisons:**
```sql
-- Find products in the same category with similar prices
SELECT 
    p1.product_name as product_1,
    p1.price as price_1,
    p2.product_name as product_2,
    p2.price as price_2,
    ABS(p1.price - p2.price) as price_difference
FROM products p1
JOIN products p2 ON p1.category_id = p2.category_id
    AND p1.product_id < p2.product_id  -- Avoid duplicates and self-comparison
    AND ABS(p1.price - p2.price) < 10  -- Similar prices (within $10)
WHERE p1.status = 'active' AND p2.status = 'active'
ORDER BY p1.category_id, price_difference;
```

**3. Sequential Data Analysis:**
```sql
-- Compare consecutive orders from the same customer
SELECT 
    c.first_name || ' ' || c.last_name as customer_name,
    o1.order_id as first_order,
    o1.order_date as first_date,
    o1.total_amount as first_amount,
    o2.order_id as next_order,
    o2.order_date as next_date,
    o2.total_amount as next_amount,
    
    -- Calculate time between orders
    (o2.order_date - o1.order_date) as days_between,
    
    -- Calculate spending change
    (o2.total_amount - o1.total_amount) as amount_change,
    ROUND(
        ((o2.total_amount - o1.total_amount) / o1.total_amount * 100), 2
    ) as percent_change
FROM orders o1
JOIN orders o2 ON o1.customer_id = o2.customer_id
    AND o2.order_date > o1.order_date
JOIN customers c ON o1.customer_id = c.customer_id
WHERE NOT EXISTS (
    -- Ensure o2 is the immediate next order
    SELECT 1 FROM orders o3
    WHERE o3.customer_id = o1.customer_id
    AND o3.order_date > o1.order_date
    AND o3.order_date < o2.order_date
)
ORDER BY c.customer_id, o1.order_date;
```

---

## 🔧 Advanced Join Techniques

### 1. Multiple Join Conditions
```sql
-- Join with multiple conditions
SELECT 
    c.customer_name,
    o.order_date,
    p.product_name,
    oi.quantity
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
    AND o.order_date >= '2024-01-01'  -- Additional condition
JOIN order_items oi ON o.order_id = oi.order_id
    AND oi.quantity > 1  -- Additional condition
JOIN products p ON oi.product_id = p.product_id
    AND p.status = 'active';  -- Additional condition
```

### 2. Conditional Joins
```sql
-- Join based on conditions
SELECT 
    p.product_name,
    p.price,
    d.discount_percentage,
    CASE 
        WHEN d.discount_id IS NOT NULL 
        THEN p.price * (1 - d.discount_percentage / 100)
        ELSE p.price
    END as final_price
FROM products p
LEFT JOIN discounts d ON p.product_id = d.product_id
    AND d.start_date <= CURRENT_DATE
    AND d.end_date >= CURRENT_DATE
    AND d.is_active = true;
```

### 3. Subquery Joins
```sql
-- Join with subquery results
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    recent_orders.order_count,
    recent_orders.total_spent
FROM customers c
JOIN (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent
    FROM orders
    WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY customer_id
    HAVING COUNT(*) >= 2
) recent_orders ON c.customer_id = recent_orders.customer_id;
```

### 4. Window Functions with Joins
```sql
-- Rank customers by spending within each country
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.country,
    SUM(o.total_amount) as total_spent,
    RANK() OVER (
        PARTITION BY c.country 
        ORDER BY SUM(o.total_amount) DESC
    ) as country_rank,
    PERCENT_RANK() OVER (
        PARTITION BY c.country 
        ORDER BY SUM(o.total_amount)
    ) as percentile_rank
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status IN ('completed', 'delivered')
GROUP BY c.customer_id, c.first_name, c.last_name, c.country
ORDER BY c.country, country_rank;
```

---

## 💡 Real-World Join Examples

### Example 1: E-commerce Analytics Dashboard

```sql
-- Comprehensive sales analytics with multiple joins
SELECT 
    -- Time dimensions
    DATE_TRUNC('month', o.order_date) as month,
    
    -- Product dimensions
    cat.category_name,
    p.product_name,
    
    -- Customer dimensions
    c.country,
    CASE 
        WHEN EXTRACT(YEAR FROM age(c.date_of_birth)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM age(c.date_of_birth)) < 35 THEN '25-34'
        WHEN EXTRACT(YEAR FROM age(c.date_of_birth)) < 45 THEN '35-44'
        WHEN EXTRACT(YEAR FROM age(c.date_of_birth)) < 55 THEN '45-54'
        ELSE '55+'
    END as age_group,
    
    -- Metrics
    COUNT(DISTINCT o.order_id) as order_count,
    COUNT(DISTINCT c.customer_id) as unique_customers,
    SUM(oi.quantity) as units_sold,
    SUM(oi.quantity * oi.unit_price) as revenue,
    AVG(oi.unit_price) as avg_unit_price,
    
    -- Advanced metrics
    SUM(oi.quantity * oi.unit_price) / COUNT(DISTINCT o.order_id) as avg_order_value,
    SUM(oi.quantity * oi.unit_price) / COUNT(DISTINCT c.customer_id) as revenue_per_customer
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN categories cat ON p.category_id = cat.category_id
LEFT JOIN discounts d ON p.product_id = d.product_id
    AND o.order_date BETWEEN d.start_date AND d.end_date
WHERE 
    o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    AND o.status IN ('completed', 'shipped', 'delivered')
    AND c.date_of_birth IS NOT NULL
GROUP BY 
    DATE_TRUNC('month', o.order_date),
    cat.category_name,
    p.product_name,
    c.country,
    age_group
HAVING 
    COUNT(DISTINCT o.order_id) >= 5  -- Significant volume
ORDER BY 
    month DESC,
    revenue DESC;
```

### Example 2: Customer Lifetime Value Analysis

```sql
-- Calculate customer lifetime value with cohort analysis
WITH customer_cohorts AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.created_at as registration_date,
        DATE_TRUNC('month', c.created_at) as cohort_month,
        MIN(o.order_date) as first_order_date,
        MAX(o.order_date) as last_order_date
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
        AND o.status IN ('completed', 'delivered')
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.created_at
),
customer_metrics AS (
    SELECT 
        cc.customer_id,
        cc.first_name,
        cc.last_name,
        cc.cohort_month,
        cc.first_order_date,
        cc.last_order_date,
        
        -- Order metrics
        COUNT(o.order_id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        
        -- Time metrics
        CASE 
            WHEN cc.first_order_date IS NOT NULL 
            THEN cc.last_order_date - cc.first_order_date
            ELSE NULL
        END as customer_lifespan_days,
        
        -- Product diversity
        COUNT(DISTINCT oi.product_id) as unique_products_purchased,
        COUNT(DISTINCT cat.category_id) as unique_categories_purchased
    FROM customer_cohorts cc
    LEFT JOIN orders o ON cc.customer_id = o.customer_id
        AND o.status IN ('completed', 'delivered')
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    LEFT JOIN categories cat ON p.category_id = cat.category_id
    GROUP BY 
        cc.customer_id, cc.first_name, cc.last_name, 
        cc.cohort_month, cc.first_order_date, cc.last_order_date
)
SELECT 
    cm.*,
    
    -- Customer segmentation
    CASE 
        WHEN cm.total_orders = 0 THEN 'Never Purchased'
        WHEN cm.total_orders = 1 THEN 'One-time Buyer'
        WHEN cm.total_orders BETWEEN 2 AND 5 THEN 'Occasional Buyer'
        WHEN cm.total_orders BETWEEN 6 AND 15 THEN 'Regular Customer'
        ELSE 'VIP Customer'
    END as customer_segment,
    
    -- Value segmentation
    CASE 
        WHEN cm.total_spent = 0 THEN 'No Value'
        WHEN cm.total_spent < 100 THEN 'Low Value'
        WHEN cm.total_spent < 500 THEN 'Medium Value'
        WHEN cm.total_spent < 2000 THEN 'High Value'
        ELSE 'Premium Value'
    END as value_segment,
    
    -- Engagement metrics
    CASE 
        WHEN cm.last_order_date IS NULL THEN 'Never Ordered'
        WHEN cm.last_order_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
        WHEN cm.last_order_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Recent'
        WHEN cm.last_order_date >= CURRENT_DATE - INTERVAL '365 days' THEN 'Dormant'
        ELSE 'Inactive'
    END as engagement_status
FROM customer_metrics cm
ORDER BY cm.total_spent DESC, cm.total_orders DESC;
```

### Example 3: Inventory and Sales Correlation

```sql
-- Analyze relationship between inventory levels and sales performance
SELECT 
    p.product_id,
    p.product_name,
    cat.category_name,
    p.price,
    p.stock_quantity as current_stock,
    
    -- Sales metrics (last 90 days)
    COALESCE(sales.units_sold, 0) as units_sold_90d,
    COALESCE(sales.revenue, 0) as revenue_90d,
    COALESCE(sales.order_count, 0) as order_count_90d,
    
    -- Inventory metrics
    CASE 
        WHEN COALESCE(sales.units_sold, 0) = 0 THEN NULL
        ELSE p.stock_quantity::float / (sales.units_sold / 90.0)  -- Days of inventory
    END as days_of_inventory,
    
    -- Performance indicators
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity < 10 THEN 'Low Stock'
        WHEN COALESCE(sales.units_sold, 0) = 0 THEN 'No Recent Sales'
        WHEN p.stock_quantity::float / (sales.units_sold / 90.0) < 30 THEN 'Fast Moving'
        WHEN p.stock_quantity::float / (sales.units_sold / 90.0) > 180 THEN 'Slow Moving'
        ELSE 'Normal'
    END as inventory_status,
    
    -- Supplier information
    s.supplier_name,
    s.lead_time_days,
    
    -- Reorder recommendations
    CASE 
        WHEN p.stock_quantity = 0 THEN 'URGENT: Reorder immediately'
        WHEN p.stock_quantity < 10 AND COALESCE(sales.units_sold, 0) > 0 THEN 'HIGH: Reorder soon'
        WHEN p.stock_quantity::float / (sales.units_sold / 90.0) < 30 THEN 'MEDIUM: Monitor closely'
        WHEN COALESCE(sales.units_sold, 0) = 0 AND p.stock_quantity > 50 THEN 'LOW: Consider discontinuing'
        ELSE 'NORMAL: No action needed'
    END as reorder_priority
FROM products p
JOIN categories cat ON p.category_id = cat.category_id
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold,
        SUM(oi.quantity * oi.unit_price) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE 
        o.order_date >= CURRENT_DATE - INTERVAL '90 days'
        AND o.status IN ('completed', 'shipped', 'delivered')
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
WHERE p.status = 'active'
ORDER BY 
    CASE 
        WHEN p.stock_quantity = 0 THEN 1
        WHEN p.stock_quantity < 10 AND COALESCE(sales.units_sold, 0) > 0 THEN 2
        ELSE 3
    END,
    revenue_90d DESC;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"Explain the difference between INNER JOIN and LEFT JOIN"**
   - INNER JOIN: Only returns rows where there's a match in both tables
   - LEFT JOIN: Returns all rows from left table, plus matching rows from right table
   - Use INNER JOIN when you need data that exists in both tables
   - Use LEFT JOIN when you want to preserve all records from one table

2. **"When would you use a self-join?"**
   - Employee-manager relationships
   - Hierarchical data (categories, organizational charts)
   - Comparing records within the same table
   - Finding duplicates or similar records

3. **"How do you optimize join performance?"**
   - Create indexes on join columns
   - Use appropriate join types
   - Filter early with WHERE clauses
   - Consider query execution order
   - Use EXPLAIN to analyze query plans

### Best Practices:

1. **Always Use Table Aliases:**
   ```sql
   -- Good: Clear and readable
   SELECT c.name, o.total
   FROM customers c
   JOIN orders o ON c.id = o.customer_id;
   
   -- Avoid: Ambiguous and verbose
   SELECT customers.name, orders.total
   FROM customers
   JOIN orders ON customers.id = orders.customer_id;
   ```

2. **Be Explicit with JOIN Types:**
   ```sql
   -- Good: Explicit intent
   SELECT *
   FROM customers c
   INNER JOIN orders o ON c.customer_id = o.customer_id;
   
   -- Avoid: Implicit join (harder to read)
   SELECT *
   FROM customers c, orders o
   WHERE c.customer_id = o.customer_id;
   ```

3. **Handle NULL Values Appropriately:**
   ```sql
   -- Use COALESCE for NULL handling
   SELECT 
       c.name,
       COALESCE(SUM(o.total), 0) as total_spent
   FROM customers c
   LEFT JOIN orders o ON c.customer_id = o.customer_id
   GROUP BY c.customer_id, c.name;
   ```

---

## ⚠️ Things to Watch Out For

### 1. **Cartesian Products (Accidental CROSS JOINs)**
```sql
-- Dangerous: Missing join condition
SELECT *
FROM customers c
JOIN orders o;  -- Missing ON clause!

-- This creates a cartesian product: every customer with every order
-- 1,000 customers × 10,000 orders = 10,000,000 rows!

-- Correct: Always include join conditions
SELECT *
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;
```

### 2. **NULL Handling in Joins**
```sql
-- NULLs don't match in joins
SELECT *
FROM table1 t1
JOIN table2 t2 ON t1.column = t2.column;
-- Rows with NULL in either column won't match

-- Use IS NULL checks when needed
SELECT *
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.customer_id IS NULL;  -- Customers without orders
```

### 3. **Performance Issues with Large Joins**
```sql
-- Slow: No indexes on join columns
SELECT *
FROM large_table1 t1
JOIN large_table2 t2 ON t1.unindexed_column = t2.unindexed_column;

-- Fast: Proper indexes
CREATE INDEX idx_table1_join_col ON large_table1(join_column);
CREATE INDEX idx_table2_join_col ON large_table2(join_column);
```

### 4. **Ambiguous Column Names**
```sql
-- Error: Ambiguous column reference
SELECT id, name  -- Which table's id and name?
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;

-- Correct: Use table aliases
SELECT c.customer_id, c.name, o.order_id
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;
```

### 5. **Incorrect Join Logic**
```sql
-- Wrong: Using WHERE instead of ON for join conditions
SELECT *
FROM customers c
LEFT JOIN orders o
WHERE c.customer_id = o.customer_id;  -- This becomes an INNER JOIN!

-- Correct: Use ON for join conditions
SELECT *
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Aggregate Functions** (COUNT, SUM, AVG, etc.) in detail. You'll learn how to use these functions effectively with joins and grouping to create powerful analytical queries.

---

## 📝 Quick Practice

Using a sample e-commerce database, try these join exercises:

1. **Basic Joins**: Find all customers who have placed orders in the last 30 days
2. **LEFT JOIN**: List all products and their total sales (including products with no sales)
3. **Multiple Joins**: Create a report showing customer name, order date, product name, and category for all orders
4. **Self Join**: Find all employees and their managers in an employee hierarchy
5. **Complex Analysis**: Identify customers who bought products from multiple categories

Consider:
- Which join type is most appropriate for each scenario?
- How do you handle NULL values in your results?
- What indexes would improve performance?
- How do you avoid cartesian products?