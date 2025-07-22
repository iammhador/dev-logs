# Chapter 14: Views and CTEs (Common Table Expressions)

## 📚 What You'll Learn

Views and CTEs are powerful tools for creating virtual tables, simplifying complex queries, and organizing data access. Views provide a persistent virtual layer over your data, while CTEs offer temporary, query-scoped virtual tables. This chapter covers creating, managing, and optimizing both for better database design and query organization.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand the differences between views and CTEs
- Create simple and complex views with proper security
- Build recursive and non-recursive CTEs
- Implement updatable views and understand their limitations
- Use views for data abstraction and security
- Optimize view and CTE performance
- Handle view dependencies and maintenance

---

## 🔍 Concept Explanation

### What are Views?

Views are virtual tables that don't store data themselves but provide a saved query that can be referenced like a table. They're useful for:
- **Data Abstraction**: Hide complex joins and calculations
- **Security**: Restrict access to specific columns/rows
- **Simplification**: Provide user-friendly interfaces to complex data
- **Consistency**: Ensure consistent data access patterns

**Types of Views:**
- **Simple Views**: Based on single table, usually updatable
- **Complex Views**: Multiple tables, aggregations, may not be updatable
- **Materialized Views**: Physically store results (PostgreSQL)
- **Indexed Views**: Materialized with indexes (SQL Server)

### What are CTEs?

Common Table Expressions (CTEs) are temporary named result sets that exist only within the scope of a single query. They're excellent for:
- **Query Organization**: Break complex queries into readable parts
- **Recursive Operations**: Tree traversal, hierarchical data
- **Avoiding Repetition**: Reference the same subquery multiple times
- **Readability**: Make complex logic more understandable

**Types of CTEs:**
- **Non-Recursive**: Simple temporary result sets
- **Recursive**: Self-referencing for hierarchical data
- **Multiple CTEs**: Several CTEs in one query

---

## 🛠️ Syntax Comparison

### MySQL vs PostgreSQL Views

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Basic Views** | ✅ | ✅ |
| **Updatable Views** | ✅ (limited) | ✅ (more flexible) |
| **Materialized Views** | ❌ | ✅ |
| **Recursive Views** | ❌ | ✅ (via recursive CTEs) |
| **View Dependencies** | Limited tracking | Full dependency tracking |
| **Security Options** | Basic | Advanced (RLS, policies) |
| **WITH CHECK OPTION** | ✅ | ✅ |
| **CTEs** | ✅ (8.0+) | ✅ |
| **Recursive CTEs** | ✅ (8.0+) | ✅ |

---

## 👁️ Basic Views

### Creating Simple Views

**MySQL:**
```sql
-- Simple customer view with calculated fields
CREATE VIEW customer_summary AS
SELECT 
    customer_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    email,
    phone,
    status,
    created_at,
    DATEDIFF(CURDATE(), created_at) AS days_since_registration
FROM customers
WHERE status = 'active';

-- Product catalog view with pricing
CREATE VIEW product_catalog AS
SELECT 
    p.product_id,
    p.product_name,
    p.sku,
    c.category_name,
    p.price,
    p.stock_quantity,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity < 10 THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status,
    p.created_at
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active';

-- Order details view with customer info
CREATE VIEW order_details_view AS
SELECT 
    o.order_id,
    o.order_date,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email AS customer_email,
    o.status,
    o.total_amount,
    COUNT(oi.order_item_id) AS item_count,
    GROUP_CONCAT(p.product_name SEPARATOR ', ') AS products
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY o.order_id, o.order_date, c.first_name, c.last_name, c.email, o.status, o.total_amount;

-- Using views
SELECT * FROM customer_summary WHERE days_since_registration > 365;

SELECT * FROM product_catalog WHERE stock_status = 'Low Stock';

SELECT * FROM order_details_view WHERE order_date >= '2024-01-01';
```

**PostgreSQL:**
```sql
-- Customer analytics view with window functions
CREATE VIEW customer_analytics AS
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.email,
    c.status,
    c.created_at,
    EXTRACT(DAYS FROM (CURRENT_DATE - c.created_at)) AS days_since_registration,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    COALESCE(AVG(o.total_amount), 0) AS avg_order_value,
    MAX(o.order_date) AS last_order_date,
    RANK() OVER (ORDER BY COALESCE(SUM(o.total_amount), 0) DESC) AS spending_rank
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.status, c.created_at;

-- Product performance view
CREATE VIEW product_performance AS
SELECT 
    p.product_id,
    p.product_name,
    p.sku,
    c.category_name,
    p.price,
    p.stock_quantity,
    COUNT(oi.order_item_id) AS times_ordered,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    AVG(oi.unit_price) AS avg_selling_price,
    (p.price - AVG(oi.unit_price)) AS avg_discount,
    CASE 
        WHEN COUNT(oi.order_item_id) = 0 THEN 'Never Ordered'
        WHEN COUNT(oi.order_item_id) < 5 THEN 'Low Demand'
        WHEN COUNT(oi.order_item_id) < 20 THEN 'Medium Demand'
        ELSE 'High Demand'
    END AS demand_category
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name, p.sku, c.category_name, p.price, p.stock_quantity;

-- Monthly sales summary view
CREATE VIEW monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', o.order_date) AS month,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT o.customer_id) AS unique_customers,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.total_amount) AS avg_order_value,
    SUM(oi.quantity) AS total_items_sold,
    COUNT(DISTINCT oi.product_id) AS unique_products_sold
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.status = 'completed'
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month;
```

### Updatable Views

**MySQL:**
```sql
-- Simple updatable view
CREATE VIEW active_customers AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    phone,
    status
FROM customers
WHERE status = 'active'
WITH CHECK OPTION;

-- Update through view
UPDATE active_customers 
SET phone = '555-0123' 
WHERE customer_id = 1;

-- Insert through view (will enforce WHERE condition due to WITH CHECK OPTION)
INSERT INTO active_customers (first_name, last_name, email, status)
VALUES ('John', 'Doe', 'john.doe@email.com', 'active');

-- This would fail due to WITH CHECK OPTION
-- INSERT INTO active_customers (first_name, last_name, email, status)
-- VALUES ('Jane', 'Smith', 'jane@email.com', 'inactive');

-- View with calculated columns (not updatable)
CREATE VIEW customer_stats AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    (SELECT COUNT(*) FROM orders WHERE customer_id = c.customer_id) AS order_count,
    (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.customer_id) AS total_spent
FROM customers c;

-- This view is not updatable due to subqueries
```

**PostgreSQL:**
```sql
-- Updatable view with rules
CREATE VIEW active_products AS
SELECT 
    product_id,
    product_name,
    sku,
    price,
    stock_quantity,
    category_id
FROM products
WHERE status = 'active';

-- Create rules for complex update behavior
CREATE OR REPLACE RULE active_products_update AS
    ON UPDATE TO active_products
    DO INSTEAD
    UPDATE products
    SET 
        product_name = NEW.product_name,
        sku = NEW.sku,
        price = NEW.price,
        stock_quantity = NEW.stock_quantity,
        category_id = NEW.category_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id
      AND status = 'active';

CREATE OR REPLACE RULE active_products_insert AS
    ON INSERT TO active_products
    DO INSTEAD
    INSERT INTO products (product_name, sku, price, stock_quantity, category_id, status, created_at)
    VALUES (NEW.product_name, NEW.sku, NEW.price, NEW.stock_quantity, NEW.category_id, 'active', CURRENT_TIMESTAMP);

CREATE OR REPLACE RULE active_products_delete AS
    ON DELETE TO active_products
    DO INSTEAD
    UPDATE products
    SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;

-- Using the updatable view
INSERT INTO active_products (product_name, sku, price, stock_quantity, category_id)
VALUES ('New Product', 'NP001', 29.99, 100, 1);

UPDATE active_products 
SET price = 24.99 
WHERE sku = 'NP001';

-- "Delete" (actually sets status to inactive)
DELETE FROM active_products WHERE sku = 'NP001';
```

---

## 🔄 Common Table Expressions (CTEs)

### Non-Recursive CTEs

**MySQL 8.0+ and PostgreSQL:**
```sql
-- Single CTE for customer segmentation
WITH customer_segments AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        COUNT(o.order_id) AS order_count,
        SUM(o.total_amount) AS total_spent,
        CASE 
            WHEN SUM(o.total_amount) >= 1000 THEN 'VIP'
            WHEN SUM(o.total_amount) >= 500 THEN 'Premium'
            WHEN SUM(o.total_amount) >= 100 THEN 'Regular'
            ELSE 'New'
        END AS segment
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'completed'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
)
SELECT 
    segment,
    COUNT(*) AS customer_count,
    AVG(total_spent) AS avg_spent,
    MIN(total_spent) AS min_spent,
    MAX(total_spent) AS max_spent
FROM customer_segments
GROUP BY segment
ORDER BY avg_spent DESC;

-- Multiple CTEs for complex analysis
WITH 
-- CTE 1: Monthly sales
monthly_sales AS (
    SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        SUM(total_amount) AS monthly_revenue,
        COUNT(*) AS monthly_orders
    FROM orders
    WHERE status = 'completed'
      AND order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
-- CTE 2: Product categories performance
category_performance AS (
    SELECT 
        c.category_name,
        SUM(oi.quantity * oi.unit_price) AS category_revenue,
        SUM(oi.quantity) AS items_sold
    FROM categories c
    JOIN products p ON c.category_id = p.category_id
    JOIN order_items oi ON p.product_id = oi.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'completed'
      AND o.order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY c.category_id, c.category_name
),
-- CTE 3: Customer acquisition by month
customer_acquisition AS (
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS new_customers
    FROM customers
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
)
-- Main query combining all CTEs
SELECT 
    ms.month,
    ms.monthly_revenue,
    ms.monthly_orders,
    ca.new_customers,
    ROUND(ms.monthly_revenue / ms.monthly_orders, 2) AS avg_order_value,
    ROUND(ms.monthly_revenue / ca.new_customers, 2) AS revenue_per_new_customer
FROM monthly_sales ms
LEFT JOIN customer_acquisition ca ON ms.month = ca.month
ORDER BY ms.month;

-- CTE for window function calculations
WITH sales_with_running_totals AS (
    SELECT 
        order_date,
        total_amount,
        SUM(total_amount) OVER (
            ORDER BY order_date 
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_total,
        AVG(total_amount) OVER (
            ORDER BY order_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS moving_avg_7_days,
        LAG(total_amount, 1) OVER (ORDER BY order_date) AS prev_day_sales,
        LEAD(total_amount, 1) OVER (ORDER BY order_date) AS next_day_sales
    FROM (
        SELECT 
            DATE(order_date) AS order_date,
            SUM(total_amount) AS total_amount
        FROM orders
        WHERE status = 'completed'
        GROUP BY DATE(order_date)
    ) daily_sales
)
SELECT 
    order_date,
    total_amount,
    running_total,
    ROUND(moving_avg_7_days, 2) AS moving_avg_7_days,
    ROUND(((total_amount - prev_day_sales) / prev_day_sales) * 100, 2) AS day_over_day_growth
FROM sales_with_running_totals
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY order_date;
```

### Recursive CTEs

**Organizational Hierarchy:**
```sql
-- Create employee hierarchy table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    title VARCHAR(100),
    manager_id INT,
    salary DECIMAL(10,2),
    hire_date DATE,
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

-- Sample data
INSERT INTO employees VALUES
(1, 'John', 'CEO', 'Chief Executive Officer', NULL, 200000, '2020-01-01'),
(2, 'Jane', 'Smith', 'VP Sales', 1, 150000, '2020-02-01'),
(3, 'Bob', 'Johnson', 'VP Engineering', 1, 160000, '2020-02-15'),
(4, 'Alice', 'Brown', 'Sales Manager', 2, 80000, '2020-03-01'),
(5, 'Charlie', 'Davis', 'Senior Developer', 3, 90000, '2020-03-15'),
(6, 'Diana', 'Wilson', 'Sales Rep', 4, 50000, '2020-04-01'),
(7, 'Eve', 'Miller', 'Junior Developer', 5, 60000, '2020-05-01');

-- Recursive CTE to get full hierarchy
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: top-level employees (CEOs)
    SELECT 
        employee_id,
        first_name,
        last_name,
        title,
        manager_id,
        salary,
        0 AS level,
        CAST(first_name || ' ' || last_name AS VARCHAR(1000)) AS hierarchy_path,
        CAST(employee_id AS VARCHAR(1000)) AS id_path
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive case: employees with managers
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.title,
        e.manager_id,
        e.salary,
        eh.level + 1,
        eh.hierarchy_path || ' -> ' || e.first_name || ' ' || e.last_name,
        eh.id_path || ',' || e.employee_id
    FROM employees e
    JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
)
SELECT 
    REPEAT('  ', level) || first_name || ' ' || last_name AS indented_name,
    title,
    salary,
    level,
    hierarchy_path
FROM employee_hierarchy
ORDER BY id_path;

-- Get all subordinates of a specific manager
WITH RECURSIVE subordinates AS (
    -- Start with the manager
    SELECT 
        employee_id,
        first_name,
        last_name,
        title,
        manager_id,
        salary,
        0 AS level
    FROM employees
    WHERE employee_id = 2  -- VP Sales
    
    UNION ALL
    
    -- Get all direct and indirect reports
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.title,
        e.manager_id,
        e.salary,
        s.level + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.employee_id
)
SELECT 
    first_name || ' ' || last_name AS name,
    title,
    salary,
    level,
    CASE 
        WHEN level = 0 THEN 'Manager'
        WHEN level = 1 THEN 'Direct Report'
        ELSE 'Indirect Report (Level ' || level || ')'
    END AS relationship
FROM subordinates
ORDER BY level, last_name;

-- Calculate total team salary for each manager
WITH RECURSIVE team_hierarchy AS (
    SELECT 
        employee_id,
        first_name,
        last_name,
        title,
        manager_id,
        salary,
        employee_id AS root_manager
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        e.title,
        e.manager_id,
        e.salary,
        th.root_manager
    FROM employees e
    JOIN team_hierarchy th ON e.manager_id = th.employee_id
)
SELECT 
    m.first_name || ' ' || m.last_name AS manager_name,
    m.title AS manager_title,
    COUNT(th.employee_id) - 1 AS team_size,  -- Subtract 1 to exclude manager
    SUM(th.salary) AS total_team_salary,
    AVG(th.salary) AS avg_team_salary,
    m.salary AS manager_salary
FROM team_hierarchy th
JOIN employees m ON th.root_manager = m.employee_id
GROUP BY m.employee_id, m.first_name, m.last_name, m.title, m.salary
ORDER BY total_team_salary DESC;
```

**Category Tree Navigation:**
```sql
-- Create category hierarchy table
CREATE TABLE category_tree (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(100),
    parent_category_id INT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (parent_category_id) REFERENCES category_tree(category_id)
);

-- Sample hierarchical categories
INSERT INTO category_tree VALUES
(1, 'Electronics', NULL, 1),
(2, 'Clothing', NULL, 2),
(3, 'Home & Garden', NULL, 3),
(4, 'Computers', 1, 1),
(5, 'Mobile Phones', 1, 2),
(6, 'Audio', 1, 3),
(7, 'Laptops', 4, 1),
(8, 'Desktops', 4, 2),
(9, 'Gaming Laptops', 7, 1),
(10, 'Business Laptops', 7, 2),
(11, 'Men\'s Clothing', 2, 1),
(12, 'Women\'s Clothing', 2, 2),
(13, 'Shirts', 11, 1),
(14, 'Pants', 11, 2);

-- Get full category tree with breadcrumbs
WITH RECURSIVE category_breadcrumbs AS (
    -- Root categories
    SELECT 
        category_id,
        category_name,
        parent_category_id,
        sort_order,
        0 AS level,
        category_name AS breadcrumb,
        LPAD('', 0, '  ') || category_name AS indented_name,
        CAST(sort_order AS VARCHAR(1000)) AS sort_path
    FROM category_tree
    WHERE parent_category_id IS NULL
    
    UNION ALL
    
    -- Child categories
    SELECT 
        ct.category_id,
        ct.category_name,
        ct.parent_category_id,
        ct.sort_order,
        cb.level + 1,
        cb.breadcrumb || ' > ' || ct.category_name,
        LPAD('', (cb.level + 1) * 2, '  ') || ct.category_name,
        cb.sort_path || '.' || LPAD(ct.sort_order::TEXT, 3, '0')
    FROM category_tree ct
    JOIN category_breadcrumbs cb ON ct.parent_category_id = cb.category_id
)
SELECT 
    category_id,
    indented_name AS category_hierarchy,
    breadcrumb,
    level
FROM category_breadcrumbs
ORDER BY sort_path;

-- Find all products in a category and its subcategories
WITH RECURSIVE category_descendants AS (
    -- Start with specific category
    SELECT category_id
    FROM category_tree
    WHERE category_id = 1  -- Electronics
    
    UNION ALL
    
    -- Get all descendant categories
    SELECT ct.category_id
    FROM category_tree ct
    JOIN category_descendants cd ON ct.parent_category_id = cd.category_id
)
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    ct.category_name,
    cb.breadcrumb AS category_path
FROM products p
JOIN category_descendants cd ON p.category_id = cd.category_id
JOIN category_tree ct ON p.category_id = ct.category_id
JOIN (
    WITH RECURSIVE category_breadcrumbs AS (
        SELECT 
            category_id,
            category_name,
            parent_category_id,
            category_name AS breadcrumb
        FROM category_tree
        WHERE parent_category_id IS NULL
        
        UNION ALL
        
        SELECT 
            ct.category_id,
            ct.category_name,
            ct.parent_category_id,
            cb.breadcrumb || ' > ' || ct.category_name
        FROM category_tree ct
        JOIN category_breadcrumbs cb ON ct.parent_category_id = cb.category_id
    )
    SELECT category_id, breadcrumb FROM category_breadcrumbs
) cb ON p.category_id = cb.category_id
ORDER BY cb.breadcrumb, p.product_name;
```

---

## 🏗️ Materialized Views (PostgreSQL)

```sql
-- Create materialized view for expensive analytics
CREATE MATERIALIZED VIEW customer_analytics_materialized AS
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.email,
    c.created_at AS registration_date,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
    COALESCE(AVG(o.total_amount), 0) AS avg_order_value,
    MAX(o.order_date) AS last_order_date,
    MIN(o.order_date) AS first_order_date,
    EXTRACT(DAYS FROM (MAX(o.order_date) - MIN(o.order_date))) AS customer_lifespan_days,
    COUNT(DISTINCT DATE_TRUNC('month', o.order_date)) AS active_months,
    CASE 
        WHEN COUNT(o.order_id) = 0 THEN 'Never Purchased'
        WHEN MAX(o.order_date) < CURRENT_DATE - INTERVAL '6 months' THEN 'Inactive'
        WHEN COUNT(o.order_id) = 1 THEN 'One-time Buyer'
        WHEN COUNT(o.order_id) BETWEEN 2 AND 5 THEN 'Occasional Buyer'
        WHEN COUNT(o.order_id) BETWEEN 6 AND 15 THEN 'Regular Customer'
        ELSE 'VIP Customer'
    END AS customer_segment,
    -- RFM Analysis components
    EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))) AS recency_days,
    COUNT(o.order_id) AS frequency,
    COALESCE(SUM(o.total_amount), 0) AS monetary
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id AND o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.created_at;

-- Create index on materialized view
CREATE INDEX idx_customer_analytics_segment ON customer_analytics_materialized(customer_segment);
CREATE INDEX idx_customer_analytics_ltv ON customer_analytics_materialized(lifetime_value);
CREATE INDEX idx_customer_analytics_recency ON customer_analytics_materialized(recency_days);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW customer_analytics_materialized;

-- Concurrent refresh (non-blocking)
REFRESH MATERIALIZED VIEW CONCURRENTLY customer_analytics_materialized;

-- Create materialized view for product recommendations
CREATE MATERIALIZED VIEW product_recommendations AS
WITH product_pairs AS (
    SELECT 
        oi1.product_id AS product_a,
        oi2.product_id AS product_b,
        COUNT(*) AS co_occurrence_count
    FROM order_items oi1
    JOIN order_items oi2 ON oi1.order_id = oi2.order_id
    WHERE oi1.product_id < oi2.product_id  -- Avoid duplicates
    GROUP BY oi1.product_id, oi2.product_id
    HAVING COUNT(*) >= 3  -- Minimum co-occurrence threshold
),
product_stats AS (
    SELECT 
        product_id,
        COUNT(DISTINCT order_id) AS total_orders
    FROM order_items
    GROUP BY product_id
)
SELECT 
    pp.product_a,
    pa.product_name AS product_a_name,
    pp.product_b,
    pb.product_name AS product_b_name,
    pp.co_occurrence_count,
    psa.total_orders AS product_a_orders,
    psb.total_orders AS product_b_orders,
    ROUND(
        pp.co_occurrence_count::DECIMAL / LEAST(psa.total_orders, psb.total_orders),
        3
    ) AS confidence_score,
    ROUND(
        pp.co_occurrence_count::DECIMAL / (psa.total_orders + psb.total_orders - pp.co_occurrence_count),
        3
    ) AS jaccard_similarity
FROM product_pairs pp
JOIN products pa ON pp.product_a = pa.product_id
JOIN products pb ON pp.product_b = pb.product_id
JOIN product_stats psa ON pp.product_a = psa.product_id
JOIN product_stats psb ON pp.product_b = psb.product_id
ORDER BY confidence_score DESC, co_occurrence_count DESC;

-- Schedule automatic refresh using pg_cron
SELECT cron.schedule('refresh-analytics', '0 2 * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY customer_analytics_materialized;');

SELECT cron.schedule('refresh-recommendations', '0 3 * * 0', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY product_recommendations;');
```

---

## 🔒 Security Views

```sql
-- PostgreSQL Row Level Security with Views

-- Create user roles
CREATE ROLE sales_manager;
CREATE ROLE sales_rep;
CREATE ROLE customer_service;

-- Create secure customer view for customer service
CREATE VIEW customer_service_view AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    phone,
    status,
    created_at,
    -- Mask sensitive information
    CASE 
        WHEN LENGTH(phone) >= 10 THEN 
            SUBSTRING(phone, 1, 3) || '-XXX-' || SUBSTRING(phone, -4)
        ELSE 'XXX-XXXX'
    END AS masked_phone
FROM customers
WHERE status IN ('active', 'inactive');  -- Exclude deleted customers

-- Grant appropriate permissions
GRANT SELECT ON customer_service_view TO customer_service;

-- Create sales view with territory restrictions
CREATE VIEW sales_territory_view AS
SELECT 
    o.order_id,
    o.order_date,
    o.status,
    o.total_amount,
    c.customer_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.email,
    c.territory,
    u.username AS sales_rep
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN users u ON o.sales_rep_id = u.user_id
WHERE 
    -- Only show orders for current user's territory
    c.territory = COALESCE(
        (SELECT territory FROM users WHERE username = current_user),
        c.territory  -- Fallback for managers
    )
    OR 
    -- Or if user is a manager
    EXISTS (
        SELECT 1 FROM users 
        WHERE username = current_user 
          AND role = 'sales_manager'
    );

GRANT SELECT ON sales_territory_view TO sales_rep, sales_manager;

-- Create financial summary view for managers only
CREATE VIEW financial_summary_view AS
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END) AS cancelled_revenue,
    ROUND(
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) / 
        NULLIF(SUM(total_amount), 0) * 100, 
        2
    ) AS completion_rate
FROM orders
WHERE order_date >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

GRANT SELECT ON financial_summary_view TO sales_manager;

-- MySQL equivalent using views for security
-- (MySQL doesn't have RLS, so we use application-level security)

CREATE VIEW mysql_customer_service_view AS
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    CASE 
        WHEN CHAR_LENGTH(phone) >= 10 THEN 
            CONCAT(LEFT(phone, 3), '-XXX-', RIGHT(phone, 4))
        ELSE 'XXX-XXXX'
    END AS masked_phone,
    status,
    created_at
FROM customers
WHERE status IN ('active', 'inactive');

-- Create application user context table
CREATE TABLE user_context (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT,
    username VARCHAR(100),
    role VARCHAR(50),
    territory VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Territory-based sales view (requires application to set context)
CREATE VIEW mysql_sales_territory_view AS
SELECT 
    o.order_id,
    o.order_date,
    o.status,
    o.total_amount,
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.territory
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN user_context uc ON uc.expires_at > NOW()
WHERE 
    (c.territory = uc.territory OR uc.role = 'sales_manager')
    AND uc.session_id = @session_id;  -- Application sets this variable
```

---

## 💡 Real-World Business Examples

### Example 1: Executive Dashboard Views

```sql
-- PostgreSQL: Comprehensive executive dashboard
CREATE VIEW executive_dashboard AS
WITH 
-- Current month metrics
current_month AS (
    SELECT 
        COUNT(DISTINCT o.order_id) AS orders_this_month,
        COUNT(DISTINCT o.customer_id) AS customers_this_month,
        SUM(o.total_amount) AS revenue_this_month,
        AVG(o.total_amount) AS avg_order_this_month
    FROM orders o
    WHERE DATE_TRUNC('month', o.order_date) = DATE_TRUNC('month', CURRENT_DATE)
      AND o.status = 'completed'
),
-- Previous month metrics
previous_month AS (
    SELECT 
        COUNT(DISTINCT o.order_id) AS orders_last_month,
        COUNT(DISTINCT o.customer_id) AS customers_last_month,
        SUM(o.total_amount) AS revenue_last_month,
        AVG(o.total_amount) AS avg_order_last_month
    FROM orders o
    WHERE DATE_TRUNC('month', o.order_date) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND o.status = 'completed'
),
-- Year-to-date metrics
ytd_metrics AS (
    SELECT 
        COUNT(DISTINCT o.order_id) AS orders_ytd,
        COUNT(DISTINCT o.customer_id) AS customers_ytd,
        SUM(o.total_amount) AS revenue_ytd,
        AVG(o.total_amount) AS avg_order_ytd
    FROM orders o
    WHERE DATE_TRUNC('year', o.order_date) = DATE_TRUNC('year', CURRENT_DATE)
      AND o.status = 'completed'
),
-- Customer metrics
customer_metrics AS (
    SELECT 
        COUNT(*) AS total_customers,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS new_customers_this_month,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_customers
    FROM customers
),
-- Product metrics
product_metrics AS (
    SELECT 
        COUNT(*) AS total_products,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) AS out_of_stock_products,
        COUNT(CASE WHEN stock_quantity < 10 THEN 1 END) AS low_stock_products
    FROM products
    WHERE status = 'active'
)
SELECT 
    -- Current month
    cm.orders_this_month,
    cm.customers_this_month,
    cm.revenue_this_month,
    ROUND(cm.avg_order_this_month, 2) AS avg_order_this_month,
    
    -- Month-over-month growth
    ROUND(
        ((cm.orders_this_month - pm.orders_last_month)::DECIMAL / 
         NULLIF(pm.orders_last_month, 0)) * 100, 2
    ) AS orders_mom_growth,
    ROUND(
        ((cm.revenue_this_month - pm.revenue_last_month)::DECIMAL / 
         NULLIF(pm.revenue_last_month, 0)) * 100, 2
    ) AS revenue_mom_growth,
    
    -- Year-to-date
    ytd.orders_ytd,
    ytd.revenue_ytd,
    ROUND(ytd.avg_order_ytd, 2) AS avg_order_ytd,
    
    -- Customer metrics
    cust.total_customers,
    cust.new_customers_this_month,
    cust.active_customers,
    ROUND(
        (cust.active_customers::DECIMAL / cust.total_customers) * 100, 2
    ) AS customer_retention_rate,
    
    -- Product metrics
    prod.total_products,
    prod.out_of_stock_products,
    prod.low_stock_products,
    ROUND(
        ((prod.total_products - prod.out_of_stock_products)::DECIMAL / 
         prod.total_products) * 100, 2
    ) AS product_availability_rate
    
FROM current_month cm
CROSS JOIN previous_month pm
CROSS JOIN ytd_metrics ytd
CROSS JOIN customer_metrics cust
CROSS JOIN product_metrics prod;

-- Create view for top performing products
CREATE VIEW top_products_dashboard AS
WITH product_performance AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.sku,
        c.category_name,
        p.price,
        p.stock_quantity,
        COUNT(oi.order_item_id) AS times_ordered,
        SUM(oi.quantity) AS total_quantity_sold,
        SUM(oi.quantity * oi.unit_price) AS total_revenue,
        AVG(oi.unit_price) AS avg_selling_price,
        RANK() OVER (ORDER BY SUM(oi.quantity * oi.unit_price) DESC) AS revenue_rank,
        RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS quantity_rank
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id 
        AND o.status = 'completed'
        AND o.order_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
    WHERE p.status = 'active'
    GROUP BY p.product_id, p.product_name, p.sku, c.category_name, p.price, p.stock_quantity
)
SELECT 
    product_id,
    product_name,
    sku,
    category_name,
    price,
    stock_quantity,
    times_ordered,
    total_quantity_sold,
    ROUND(total_revenue, 2) AS total_revenue,
    ROUND(avg_selling_price, 2) AS avg_selling_price,
    revenue_rank,
    quantity_rank,
    CASE 
        WHEN stock_quantity = 0 THEN 'Out of Stock'
        WHEN stock_quantity < 10 THEN 'Low Stock'
        WHEN stock_quantity < 50 THEN 'Medium Stock'
        ELSE 'Well Stocked'
    END AS stock_status
FROM product_performance
WHERE revenue_rank <= 50 OR quantity_rank <= 50
ORDER BY total_revenue DESC;
```

### Example 2: Customer 360 View

```sql
-- Comprehensive customer 360 view
CREATE VIEW customer_360_view AS
WITH 
-- Customer order history
customer_orders AS (
    SELECT 
        customer_id,
        COUNT(*) AS total_orders,
        SUM(total_amount) AS lifetime_value,
        AVG(total_amount) AS avg_order_value,
        MIN(order_date) AS first_order_date,
        MAX(order_date) AS last_order_date,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,
        SUM(CASE WHEN order_date >= CURRENT_DATE - INTERVAL '12 months' THEN total_amount ELSE 0 END) AS value_12m
    FROM orders
    GROUP BY customer_id
),
-- Customer product preferences
customer_categories AS (
    SELECT 
        o.customer_id,
        c.category_name,
        COUNT(*) AS category_orders,
        SUM(oi.quantity * oi.unit_price) AS category_spend,
        ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY COUNT(*) DESC) AS preference_rank
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    JOIN categories c ON p.category_id = c.category_id
    WHERE o.status = 'completed'
    GROUP BY o.customer_id, c.category_id, c.category_name
),
-- Customer communication preferences
customer_communications AS (
    SELECT 
        customer_id,
        COUNT(*) AS total_communications,
        COUNT(CASE WHEN communication_type = 'email' THEN 1 END) AS email_count,
        COUNT(CASE WHEN communication_type = 'phone' THEN 1 END) AS phone_count,
        COUNT(CASE WHEN communication_type = 'chat' THEN 1 END) AS chat_count,
        MAX(communication_date) AS last_communication_date
    FROM customer_communications
    WHERE communication_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY customer_id
),
-- Customer support tickets
customer_support AS (
    SELECT 
        customer_id,
        COUNT(*) AS total_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_tickets,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) AS high_priority_tickets,
        AVG(EXTRACT(DAYS FROM (resolved_date - created_date))) AS avg_resolution_days
    FROM support_tickets
    WHERE created_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY customer_id
)
SELECT 
    c.customer_id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.email,
    c.phone,
    c.status,
    c.created_at AS registration_date,
    EXTRACT(DAYS FROM (CURRENT_DATE - c.created_at)) AS days_since_registration,
    
    -- Order metrics
    COALESCE(co.total_orders, 0) AS total_orders,
    COALESCE(co.lifetime_value, 0) AS lifetime_value,
    COALESCE(co.avg_order_value, 0) AS avg_order_value,
    co.first_order_date,
    co.last_order_date,
    EXTRACT(DAYS FROM (CURRENT_DATE - co.last_order_date)) AS days_since_last_order,
    COALESCE(co.value_12m, 0) AS value_12m,
    
    -- Customer segmentation
    CASE 
        WHEN co.total_orders IS NULL THEN 'Never Purchased'
        WHEN co.last_order_date < CURRENT_DATE - INTERVAL '12 months' THEN 'Inactive'
        WHEN co.total_orders = 1 THEN 'One-time Buyer'
        WHEN co.lifetime_value >= 1000 THEN 'VIP'
        WHEN co.lifetime_value >= 500 THEN 'High Value'
        WHEN co.total_orders >= 5 THEN 'Loyal'
        ELSE 'Regular'
    END AS customer_segment,
    
    -- Preferences
    cc.category_name AS preferred_category,
    cc.category_spend AS preferred_category_spend,
    
    -- Communication metrics
    COALESCE(comm.total_communications, 0) AS total_communications,
    COALESCE(comm.email_count, 0) AS email_communications,
    COALESCE(comm.phone_count, 0) AS phone_communications,
    COALESCE(comm.chat_count, 0) AS chat_communications,
    comm.last_communication_date,
    
    -- Support metrics
    COALESCE(cs.total_tickets, 0) AS total_support_tickets,
    COALESCE(cs.resolved_tickets, 0) AS resolved_tickets,
    COALESCE(cs.high_priority_tickets, 0) AS high_priority_tickets,
    ROUND(COALESCE(cs.avg_resolution_days, 0), 1) AS avg_resolution_days,
    
    -- Risk indicators
    CASE 
        WHEN co.cancelled_orders > co.completed_orders THEN 'High Risk'
        WHEN cs.high_priority_tickets > 2 THEN 'Support Risk'
        WHEN co.last_order_date < CURRENT_DATE - INTERVAL '6 months' THEN 'Churn Risk'
        ELSE 'Low Risk'
    END AS risk_level
    
FROM customers c
LEFT JOIN customer_orders co ON c.customer_id = co.customer_id
LEFT JOIN customer_categories cc ON c.customer_id = cc.customer_id AND cc.preference_rank = 1
LEFT JOIN customer_communications comm ON c.customer_id = comm.customer_id
LEFT JOIN customer_support cs ON c.customer_id = cs.customer_id;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between views and CTEs?"**
   - Views: Persistent, reusable, can be indexed (materialized)
   - CTEs: Query-scoped, temporary, better for complex query organization
   - Use views for consistent data access, CTEs for query readability

2. **"When would you use a materialized view?"**
   - Expensive aggregations that don't need real-time data
   - Complex joins across large tables
   - Reporting and analytics workloads
   - When query performance is more important than data freshness

3. **"How do you handle view dependencies?"**
   - Document dependencies clearly
   - Use dependency tracking tools
   - Consider impact when modifying base tables
   - Plan migration strategies for schema changes

4. **"What are the limitations of updatable views?"**
   - Must be based on single table (usually)
   - Cannot contain aggregations, DISTINCT, GROUP BY
   - Cannot have calculated columns in UPDATE
   - Complex views may require INSTEAD OF triggers

### Best Practices:

1. **Use descriptive names for views and CTEs**
2. **Document complex view logic thoroughly**
3. **Consider performance implications of nested views**
4. **Use materialized views for expensive operations**
5. **Implement proper security through views**
6. **Test view updates and dependencies**

---

## ⚠️ Things to Watch Out For

### 1. **View Performance Issues**
```sql
-- Problem: Nested views can cause performance issues
CREATE VIEW slow_nested_view AS
SELECT * FROM expensive_view
WHERE some_condition = 'value';

-- Solution: Flatten the query or use materialized views
CREATE MATERIALIZED VIEW optimized_view AS
SELECT 
    -- Direct query instead of nesting views
    column1, column2, calculated_field
FROM base_table
WHERE conditions
  AND some_condition = 'value';
```

### 2. **CTE Recursion Limits**
```sql
-- Problem: Infinite recursion
WITH RECURSIVE infinite_loop AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM infinite_loop  -- No termination condition!
)
SELECT * FROM infinite_loop;

-- Solution: Add proper termination conditions
WITH RECURSIVE safe_recursion AS (
    SELECT 1 AS n, 0 AS level
    UNION ALL
    SELECT n + 1, level + 1 
    FROM safe_recursion 
    WHERE level < 100  -- Termination condition
)
SELECT * FROM safe_recursion;
```

### 3. **Materialized View Staleness**
```sql
-- Problem: Forgetting to refresh materialized views
-- Data becomes stale and reports are inaccurate

-- Solution: Set up automatic refresh schedules
SELECT cron.schedule('refresh-daily-analytics', '0 2 * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;');

-- Or use triggers for critical data
CREATE OR REPLACE FUNCTION refresh_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY customer_stats_mv;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_on_order
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_customer_stats();
```

### 4. **Security Through Obscurity**
```sql
-- Problem: Relying only on views for security
CREATE VIEW public_customers AS
SELECT customer_id, first_name, last_name
FROM customers;
-- Users can still access the base table!

-- Solution: Combine with proper permissions
REVOKE ALL ON customers FROM public;
GRANT SELECT ON public_customers TO application_role;

-- Or use Row Level Security (PostgreSQL)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_access_policy ON customers
    FOR ALL TO application_role
    USING (customer_id = current_setting('app.current_customer_id')::INT);
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Transactions and Concurrency Control** - essential concepts for maintaining data integrity in multi-user environments. You'll learn about ACID properties, isolation levels, locking mechanisms, and how to handle concurrent access to your database.

---

## 📝 Quick Practice

Try these view and CTE exercises:

1. **Business Intelligence Views**: Create a set of views for executive reporting
2. **Security Views**: Implement role-based data access through views
3. **Recursive CTEs**: Build hierarchical data navigation (org charts, categories)
4. **Materialized Views**: Create and maintain analytics tables
5. **Complex CTEs**: Break down complex analytical queries into readable parts

Consider:
- When to use views vs CTEs vs materialized views
- Performance implications of your design choices
- Security and access control requirements
- Maintenance and refresh strategies for materialized views
- Documentation and dependency management