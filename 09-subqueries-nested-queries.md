# 📘 Chapter 9: Subqueries and Nested Queries

## 🎯 What You'll Learn
- Understanding subqueries and their types
- Scalar subqueries (single value)
- Row subqueries (single row, multiple columns)
- Table subqueries (multiple rows and columns)
- Correlated vs non-correlated subqueries
- EXISTS and NOT EXISTS clauses
- IN and NOT IN with subqueries
- ANY, ALL, and SOME operators
- Common Table Expressions (CTEs)
- Performance considerations and optimization

---

## 📖 Concept Explanation

**Subqueries** (also called nested queries or inner queries) are queries embedded within another query. They allow you to break complex problems into smaller, manageable parts and perform operations that would be difficult or impossible with a single query.

### Key Characteristics:
1. **Nested Structure**: A query inside another query
2. **Execution Order**: Inner query executes first (usually)
3. **Scope**: Inner query can reference outer query columns (correlated)
4. **Return Types**: Can return single value, single row, or multiple rows
5. **Usage**: Can be used in SELECT, FROM, WHERE, HAVING clauses

### Types of Subqueries:
- **Scalar Subquery**: Returns single value (one row, one column)
- **Row Subquery**: Returns single row with multiple columns
- **Table Subquery**: Returns multiple rows and columns
- **Correlated Subquery**: References outer query columns
- **Non-correlated Subquery**: Independent of outer query

---

## 🔍 Scalar Subqueries (Single Value)

### Basic Scalar Subqueries

**1. Simple Scalar Examples:**
```sql
-- Find customers who spent more than the average
SELECT 
    customer_id,
    first_name,
    last_name,
    total_spent
FROM (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        SUM(o.total_amount) as total_spent
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id, c.first_name, c.last_name
) customer_spending
WHERE total_spent > (
    SELECT AVG(customer_total)
    FROM (
        SELECT SUM(o.total_amount) as customer_total
        FROM orders o
        WHERE o.status = 'completed'
        GROUP BY o.customer_id
    ) avg_calculation
);

-- Products priced above category average
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    (
        SELECT AVG(p2.price)
        FROM products p2
        WHERE p2.category_id = p.category_id
          AND p2.status = 'active'
    ) as category_avg_price
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.price > (
      SELECT AVG(p2.price)
      FROM products p2
      WHERE p2.category_id = p.category_id
        AND p2.status = 'active'
  )
ORDER BY p.price DESC;

-- Orders with above-average value
SELECT 
    order_id,
    customer_id,
    order_date,
    total_amount,
    (
        SELECT AVG(total_amount)
        FROM orders
        WHERE status = 'completed'
    ) as overall_avg_order_value,
    
    total_amount - (
        SELECT AVG(total_amount)
        FROM orders
        WHERE status = 'completed'
    ) as difference_from_avg
FROM orders
WHERE status = 'completed'
  AND total_amount > (
      SELECT AVG(total_amount)
      FROM orders
      WHERE status = 'completed'
  )
ORDER BY total_amount DESC;
```

**2. Scalar Subqueries in SELECT Clause:**
```sql
-- Customer summary with comparative metrics
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    
    -- Customer's order count
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as order_count,
    
    -- Customer's total spending
    (
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as total_spent,
    
    -- Customer's average order value
    (
        SELECT COALESCE(AVG(o.total_amount), 0)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as avg_order_value,
    
    -- Days since last order
    (
        SELECT COALESCE(
            CURRENT_DATE - MAX(o.order_date), 
            CURRENT_DATE - c.created_at
        )
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as days_since_last_order,
    
    -- Compare to overall average
    (
        SELECT AVG(total_amount)
        FROM orders
        WHERE status = 'completed'
    ) as overall_avg_order_value
FROM customers c
WHERE c.status = 'active'
ORDER BY total_spent DESC;

-- Product performance with market context
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    c.category_name,
    
    -- Units sold (last 12 months)
    (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = p.product_id
          AND o.status IN ('completed', 'delivered')
          AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    ) as units_sold_12m,
    
    -- Revenue generated (last 12 months)
    (
        SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = p.product_id
          AND o.status IN ('completed', 'delivered')
          AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    ) as revenue_12m,
    
    -- Category average price
    (
        SELECT AVG(p2.price)
        FROM products p2
        WHERE p2.category_id = p.category_id
          AND p2.status = 'active'
    ) as category_avg_price,
    
    -- Market share within category (by revenue)
    (
        SELECT 
            CASE 
                WHEN SUM(oi.quantity * oi.unit_price) > 0 THEN
                    ROUND(
                        (
                            SELECT SUM(oi2.quantity * oi2.unit_price)
                            FROM order_items oi2
                            JOIN orders o2 ON oi2.order_id = o2.order_id
                            WHERE oi2.product_id = p.product_id
                              AND o2.status IN ('completed', 'delivered')
                              AND o2.order_date >= CURRENT_DATE - INTERVAL '12 months'
                        ) * 100.0 / SUM(oi.quantity * oi.unit_price), 2
                    )
                ELSE 0
            END
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        JOIN products p2 ON oi.product_id = p2.product_id
        WHERE p2.category_id = p.category_id
          AND o.status IN ('completed', 'delivered')
          AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    ) as category_market_share_percent
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
ORDER BY revenue_12m DESC;
```

---

## 📊 Row and Table Subqueries

### Row Subqueries (Single Row, Multiple Columns)

**1. Row Comparisons:**
```sql
-- Find customers with the same registration date and city as customer ID 1
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    city,
    created_at
FROM customers
WHERE (city, DATE(created_at)) = (
    SELECT city, DATE(created_at)
    FROM customers
    WHERE customer_id = 1
)
AND customer_id != 1;

-- Products with the same price and category as the most expensive product
SELECT 
    p1.product_id,
    p1.product_name,
    p1.price,
    c.category_name
FROM products p1
JOIN categories c ON p1.category_id = c.category_id
WHERE (p1.price, p1.category_id) = (
    SELECT price, category_id
    FROM products
    WHERE status = 'active'
    ORDER BY price DESC
    LIMIT 1
)
AND p1.status = 'active';

-- Orders placed on the same date with the same total as a specific order
SELECT 
    o1.order_id,
    o1.customer_id,
    o1.order_date,
    o1.total_amount,
    c.first_name,
    c.last_name
FROM orders o1
JOIN customers c ON o1.customer_id = c.customer_id
WHERE (DATE(o1.order_date), o1.total_amount) = (
    SELECT DATE(order_date), total_amount
    FROM orders
    WHERE order_id = 12345  -- Specific order to match
)
AND o1.order_id != 12345
AND o1.status = 'completed';
```

### Table Subqueries (Multiple Rows and Columns)

**1. Subqueries in FROM Clause:**
```sql
-- Customer spending analysis using derived table
SELECT 
    spending_tier,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spending,
    MIN(total_spent) as min_spending,
    MAX(total_spent) as max_spending
FROM (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        SUM(o.total_amount) as total_spent,
        CASE 
            WHEN SUM(o.total_amount) < 100 THEN 'Low Spender'
            WHEN SUM(o.total_amount) < 500 THEN 'Medium Spender'
            WHEN SUM(o.total_amount) < 2000 THEN 'High Spender'
            ELSE 'VIP Spender'
        END as spending_tier
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id, c.first_name, c.last_name
) customer_spending
GROUP BY spending_tier
ORDER BY avg_spending DESC;

-- Monthly sales trends with year-over-year comparison
SELECT 
    month_name,
    current_year_sales,
    previous_year_sales,
    CASE 
        WHEN previous_year_sales > 0 THEN
            ROUND(
                (current_year_sales - previous_year_sales) / previous_year_sales * 100, 2
            )
        ELSE NULL
    END as growth_percentage
FROM (
    SELECT 
        TO_CHAR(order_date, 'Month') as month_name,
        EXTRACT(MONTH FROM order_date) as month_num,
        SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = 2024 THEN total_amount ELSE 0 END) as current_year_sales,
        SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = 2023 THEN total_amount ELSE 0 END) as previous_year_sales
    FROM orders
    WHERE status = 'completed'
      AND EXTRACT(YEAR FROM order_date) IN (2023, 2024)
    GROUP BY EXTRACT(MONTH FROM order_date), TO_CHAR(order_date, 'Month')
) monthly_comparison
ORDER BY month_num;

-- Product performance ranking within categories
SELECT 
    category_name,
    product_name,
    revenue_12m,
    category_rank,
    category_total_revenue,
    ROUND(revenue_12m / category_total_revenue * 100, 2) as category_revenue_share
FROM (
    SELECT 
        c.category_name,
        p.product_name,
        COALESCE(sales.revenue, 0) as revenue_12m,
        ROW_NUMBER() OVER (
            PARTITION BY c.category_id 
            ORDER BY COALESCE(sales.revenue, 0) DESC
        ) as category_rank,
        SUM(COALESCE(sales.revenue, 0)) OVER (
            PARTITION BY c.category_id
        ) as category_total_revenue
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN (
        SELECT 
            oi.product_id,
            SUM(oi.quantity * oi.unit_price) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.status IN ('completed', 'delivered')
          AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY oi.product_id
    ) sales ON p.product_id = sales.product_id
    WHERE p.status = 'active'
) ranked_products
WHERE category_rank <= 5  -- Top 5 products per category
ORDER BY category_name, category_rank;
```

---

## 🔗 Correlated Subqueries

### Understanding Correlated Subqueries

**1. Basic Correlated Examples:**
```sql
-- Customers who have placed orders above their personal average
SELECT 
    o.order_id,
    o.customer_id,
    c.first_name,
    c.last_name,
    o.order_date,
    o.total_amount,
    (
        SELECT AVG(o2.total_amount)
        FROM orders o2
        WHERE o2.customer_id = o.customer_id
          AND o2.status = 'completed'
    ) as customer_avg_order_value
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
  AND o.total_amount > (
      SELECT AVG(o2.total_amount)
      FROM orders o2
      WHERE o2.customer_id = o.customer_id
        AND o2.status = 'completed'
  )
ORDER BY o.total_amount DESC;

-- Products that are the most expensive in their category
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.price = (
      SELECT MAX(p2.price)
      FROM products p2
      WHERE p2.category_id = p.category_id
        AND p2.status = 'active'
  )
ORDER BY p.price DESC;

-- Customers with their latest order information
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    (
        SELECT o.order_date
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
        ORDER BY o.order_date DESC
        LIMIT 1
    ) as last_order_date,
    (
        SELECT o.total_amount
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
        ORDER BY o.order_date DESC
        LIMIT 1
    ) as last_order_amount,
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as total_orders
FROM customers c
WHERE c.status = 'active'
  AND EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'completed'
  )
ORDER BY last_order_date DESC;
```

**2. Advanced Correlated Patterns:**
```sql
-- Products with above-average sales in their category
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.price,
    (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = p.product_id
          AND o.status IN ('completed', 'delivered')
          AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    ) as units_sold_12m,
    (
        SELECT AVG(category_sales.units_sold)
        FROM (
            SELECT 
                p2.product_id,
                COALESCE(SUM(oi2.quantity), 0) as units_sold
            FROM products p2
            LEFT JOIN order_items oi2 ON p2.product_id = oi2.product_id
            LEFT JOIN orders o2 ON oi2.order_id = o2.order_id
                AND o2.status IN ('completed', 'delivered')
                AND o2.order_date >= CURRENT_DATE - INTERVAL '12 months'
            WHERE p2.category_id = p.category_id
              AND p2.status = 'active'
            GROUP BY p2.product_id
        ) category_sales
    ) as category_avg_units_sold
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND (
      SELECT COALESCE(SUM(oi.quantity), 0)
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      WHERE oi.product_id = p.product_id
        AND o.status IN ('completed', 'delivered')
        AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
  ) > (
      SELECT AVG(category_sales.units_sold)
      FROM (
          SELECT 
              p2.product_id,
              COALESCE(SUM(oi2.quantity), 0) as units_sold
          FROM products p2
          LEFT JOIN order_items oi2 ON p2.product_id = oi2.product_id
          LEFT JOIN orders o2 ON oi2.order_id = o2.order_id
              AND o2.status IN ('completed', 'delivered')
              AND o2.order_date >= CURRENT_DATE - INTERVAL '12 months'
          WHERE p2.category_id = p.category_id
            AND p2.status = 'active'
          GROUP BY p2.product_id
      ) category_sales
  )
ORDER BY units_sold_12m DESC;

-- Customers who haven't ordered in longer than their typical interval
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    (
        SELECT MAX(o.order_date)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as last_order_date,
    (
        SELECT 
            AVG(EXTRACT(EPOCH FROM (o2.order_date - o1.order_date)) / 86400)
        FROM orders o1
        JOIN orders o2 ON o1.customer_id = o2.customer_id
        WHERE o1.customer_id = c.customer_id
          AND o1.status = 'completed'
          AND o2.status = 'completed'
          AND o2.order_date > o1.order_date
          AND NOT EXISTS (
              SELECT 1
              FROM orders o3
              WHERE o3.customer_id = c.customer_id
                AND o3.status = 'completed'
                AND o3.order_date > o1.order_date
                AND o3.order_date < o2.order_date
          )
    ) as avg_days_between_orders,
    CURRENT_DATE - (
        SELECT MAX(o.order_date)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as days_since_last_order
FROM customers c
WHERE c.status = 'active'
  AND EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'completed'
      HAVING COUNT(*) >= 3  -- At least 3 orders to calculate average interval
  )
  AND (
      CURRENT_DATE - (
          SELECT MAX(o.order_date)
          FROM orders o
          WHERE o.customer_id = c.customer_id
            AND o.status = 'completed'
      )
  ) > (
      SELECT 
          AVG(EXTRACT(EPOCH FROM (o2.order_date - o1.order_date)) / 86400) * 1.5
      FROM orders o1
      JOIN orders o2 ON o1.customer_id = o2.customer_id
      WHERE o1.customer_id = c.customer_id
        AND o1.status = 'completed'
        AND o2.status = 'completed'
        AND o2.order_date > o1.order_date
        AND NOT EXISTS (
            SELECT 1
            FROM orders o3
            WHERE o3.customer_id = c.customer_id
              AND o3.status = 'completed'
              AND o3.order_date > o1.order_date
              AND o3.order_date < o2.order_date
        )
  )
ORDER BY days_since_last_order DESC;
```

---

## ✅ EXISTS and NOT EXISTS

### EXISTS Clause

**1. Basic EXISTS Examples:**
```sql
-- Customers who have placed at least one order
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.created_at
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
)
ORDER BY c.created_at DESC;

-- Products that have been ordered in the last 30 days
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      WHERE oi.product_id = p.product_id
        AND o.status IN ('completed', 'delivered')
        AND o.order_date >= CURRENT_DATE - INTERVAL '30 days'
  )
ORDER BY p.product_name;

-- Categories that have products with reviews
SELECT 
    c.category_id,
    c.category_name,
    c.description
FROM categories c
WHERE EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = c.category_id
      AND p.status = 'active'
      AND EXISTS (
          SELECT 1
          FROM reviews r
          WHERE r.product_id = p.product_id
      )
)
ORDER BY c.category_name;
```

**2. Complex EXISTS Patterns:**
```sql
-- Customers who have ordered from multiple categories
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    (
        SELECT COUNT(DISTINCT p.category_id)
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as categories_purchased_from
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM (
        SELECT DISTINCT p.category_id
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) customer_categories
    HAVING COUNT(*) >= 3  -- At least 3 different categories
)
ORDER BY categories_purchased_from DESC;

-- Products that are frequently bought together
SELECT 
    p1.product_id as product_a_id,
    p1.product_name as product_a_name,
    p2.product_id as product_b_id,
    p2.product_name as product_b_name,
    COUNT(*) as times_bought_together
FROM products p1
JOIN order_items oi1 ON p1.product_id = oi1.product_id
JOIN order_items oi2 ON oi1.order_id = oi2.order_id
JOIN products p2 ON oi2.product_id = p2.product_id
JOIN orders o ON oi1.order_id = o.order_id
WHERE p1.product_id < p2.product_id  -- Avoid duplicates
  AND o.status = 'completed'
  AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
  AND EXISTS (
      SELECT 1
      FROM order_items oi_check
      JOIN orders o_check ON oi_check.order_id = o_check.order_id
      WHERE oi_check.product_id = p1.product_id
        AND o_check.status = 'completed'
        AND o_check.order_date >= CURRENT_DATE - INTERVAL '12 months'
      HAVING COUNT(*) >= 10  -- Product A sold at least 10 times
  )
  AND EXISTS (
      SELECT 1
      FROM order_items oi_check
      JOIN orders o_check ON oi_check.order_id = o_check.order_id
      WHERE oi_check.product_id = p2.product_id
        AND o_check.status = 'completed'
        AND o_check.order_date >= CURRENT_DATE - INTERVAL '12 months'
      HAVING COUNT(*) >= 10  -- Product B sold at least 10 times
  )
GROUP BY p1.product_id, p1.product_name, p2.product_id, p2.product_name
HAVING COUNT(*) >= 5  -- Bought together at least 5 times
ORDER BY times_bought_together DESC;
```

### NOT EXISTS Clause

**1. Basic NOT EXISTS Examples:**
```sql
-- Customers who have never placed an order
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    c.created_at,
    CURRENT_DATE - c.created_at as days_since_registration
FROM customers c
WHERE c.status = 'active'
  AND NOT EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
  )
ORDER BY c.created_at;

-- Products that have never been ordered
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    c.category_name,
    p.created_at
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND NOT EXISTS (
      SELECT 1
      FROM order_items oi
      WHERE oi.product_id = p.product_id
  )
ORDER BY p.created_at DESC;

-- Categories without any active products
SELECT 
    c.category_id,
    c.category_name,
    c.description
FROM categories c
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = c.category_id
      AND p.status = 'active'
)
ORDER BY c.category_name;
```

**2. Advanced NOT EXISTS Patterns:**
```sql
-- Customers who haven't ordered in the last 6 months but were active before
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    (
        SELECT MAX(o.order_date)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as last_order_date,
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as total_orders,
    (
        SELECT SUM(o.total_amount)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as lifetime_value
FROM customers c
WHERE c.status = 'active'
  AND EXISTS (
      -- Has placed orders before
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'completed'
  )
  AND NOT EXISTS (
      -- But not in the last 6 months
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'completed'
        AND o.order_date >= CURRENT_DATE - INTERVAL '6 months'
  )
ORDER BY lifetime_value DESC;

-- Products available in some categories but missing in others
SELECT 
    c.category_id,
    c.category_name,
    missing_products.product_name,
    missing_products.avg_price_in_other_categories
FROM categories c
CROSS JOIN (
    SELECT DISTINCT
        p.product_name,
        AVG(p.price) as avg_price_in_other_categories
    FROM products p
    WHERE p.status = 'active'
    GROUP BY p.product_name
    HAVING COUNT(DISTINCT p.category_id) >= 2  -- Available in at least 2 categories
) missing_products
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.category_id = c.category_id
      AND p.product_name = missing_products.product_name
      AND p.status = 'active'
)
ORDER BY c.category_name, missing_products.product_name;

-- Identify gaps in customer purchase patterns
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    popular_products.product_name,
    popular_products.times_ordered,
    popular_products.avg_price
FROM customers c
CROSS JOIN (
    SELECT 
        p.product_id,
        p.product_name,
        COUNT(*) as times_ordered,
        AVG(oi.unit_price) as avg_price
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY p.product_id, p.product_name
    HAVING COUNT(*) >= 50  -- Popular products (ordered 50+ times)
) popular_products
WHERE EXISTS (
    -- Customer has placed orders
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
)
AND NOT EXISTS (
    -- But hasn't ordered this popular product
    SELECT 1
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.customer_id = c.customer_id
      AND oi.product_id = popular_products.product_id
      AND o.status = 'completed'
)
AND (
    SELECT COUNT(*)
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
) >= 3  -- Active customers (3+ orders in last year)
ORDER BY c.customer_id, popular_products.times_ordered DESC;
```

---

## 📋 IN and NOT IN with Subqueries

### IN Clause with Subqueries

**1. Basic IN Examples:**
```sql
-- Customers who have ordered specific high-value products
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email
FROM customers c
WHERE c.customer_id IN (
    SELECT DISTINCT o.customer_id
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE oi.product_id IN (
        SELECT product_id
        FROM products
        WHERE price > 500
          AND status = 'active'
    )
    AND o.status = 'completed'
)
ORDER BY c.last_name, c.first_name;

-- Products in categories that have high average ratings
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.category_id IN (
      SELECT p2.category_id
      FROM products p2
      JOIN reviews r ON p2.product_id = r.product_id
      WHERE p2.status = 'active'
      GROUP BY p2.category_id
      HAVING AVG(r.rating) >= 4.0
        AND COUNT(r.review_id) >= 20  -- At least 20 reviews
  )
ORDER BY c.category_name, p.product_name;

-- Orders placed by customers from specific cities
SELECT 
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    c.city
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
  AND c.city IN (
      SELECT city
      FROM customers
      WHERE status = 'active'
      GROUP BY city
      HAVING COUNT(*) >= 100  -- Cities with at least 100 customers
  )
ORDER BY o.order_date DESC;
```

**2. Complex IN Patterns:**
```sql
-- Products that are top sellers in their respective categories
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    sales_data.units_sold,
    sales_data.revenue
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold,
        SUM(oi.quantity * oi.unit_price) as revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY oi.product_id
) sales_data ON p.product_id = sales_data.product_id
WHERE p.status = 'active'
  AND p.product_id IN (
      -- Top 3 products by revenue in each category
      SELECT ranked_products.product_id
      FROM (
          SELECT 
              p2.product_id,
              p2.category_id,
              SUM(oi2.quantity * oi2.unit_price) as revenue,
              ROW_NUMBER() OVER (
                  PARTITION BY p2.category_id 
                  ORDER BY SUM(oi2.quantity * oi2.unit_price) DESC
              ) as category_rank
          FROM products p2
          JOIN order_items oi2 ON p2.product_id = oi2.product_id
          JOIN orders o2 ON oi2.order_id = o2.order_id
          WHERE p2.status = 'active'
            AND o2.status IN ('completed', 'delivered')
            AND o2.order_date >= CURRENT_DATE - INTERVAL '12 months'
          GROUP BY p2.product_id, p2.category_id
      ) ranked_products
      WHERE ranked_products.category_rank <= 3
  )
ORDER BY c.category_name, sales_data.revenue DESC;

-- Customers who have purchased from the same categories as VIP customers
SELECT DISTINCT
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    customer_stats.total_spent,
    customer_stats.order_count
FROM customers c
JOIN (
    SELECT 
        c2.customer_id,
        SUM(o2.total_amount) as total_spent,
        COUNT(o2.order_id) as order_count
    FROM customers c2
    JOIN orders o2 ON c2.customer_id = o2.customer_id
    WHERE o2.status = 'completed'
    GROUP BY c2.customer_id
) customer_stats ON c.customer_id = customer_stats.customer_id
WHERE customer_stats.total_spent < 2000  -- Non-VIP customers
  AND c.customer_id IN (
      SELECT DISTINCT o.customer_id
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.status = 'completed'
        AND p.category_id IN (
            -- Categories purchased by VIP customers
            SELECT DISTINCT p2.category_id
            FROM orders o2
            JOIN order_items oi2 ON o2.order_id = oi2.order_id
            JOIN products p2 ON oi2.product_id = p2.product_id
            JOIN (
                SELECT customer_id
                FROM orders
                WHERE status = 'completed'
                GROUP BY customer_id
                HAVING SUM(total_amount) >= 2000  -- VIP threshold
            ) vip_customers ON o2.customer_id = vip_customers.customer_id
            WHERE o2.status = 'completed'
        )
  )
ORDER BY customer_stats.total_spent DESC;
```

### NOT IN Clause with Subqueries

**1. Basic NOT IN Examples:**
```sql
-- Customers who have never ordered expensive products
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as total_orders,
    (
        SELECT COALESCE(SUM(o.total_amount), 0)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as total_spent
FROM customers c
WHERE c.status = 'active'
  AND c.customer_id NOT IN (
      SELECT DISTINCT o.customer_id
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.status = 'completed'
        AND p.price > 200  -- Expensive products
        AND o.customer_id IS NOT NULL  -- Important for NOT IN
  )
  AND EXISTS (
      -- But have placed at least one order
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'completed'
  )
ORDER BY total_spent DESC;

-- Products not ordered in the last 6 months
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    p.stock_quantity,
    c.category_name,
    (
        SELECT MAX(o.order_date)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.product_id = p.product_id
          AND o.status IN ('completed', 'delivered')
    ) as last_ordered_date
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.product_id NOT IN (
      SELECT DISTINCT oi.product_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status IN ('completed', 'delivered')
        AND o.order_date >= CURRENT_DATE - INTERVAL '6 months'
        AND oi.product_id IS NOT NULL  -- Important for NOT IN
  )
ORDER BY last_ordered_date DESC NULLS LAST;

-- Categories without products in a specific price range
SELECT 
    c.category_id,
    c.category_name,
    (
        SELECT COUNT(*)
        FROM products p
        WHERE p.category_id = c.category_id
          AND p.status = 'active'
    ) as total_products,
    (
        SELECT MIN(p.price)
        FROM products p
        WHERE p.category_id = c.category_id
          AND p.status = 'active'
    ) as min_price,
    (
        SELECT MAX(p.price)
        FROM products p
        WHERE p.category_id = c.category_id
          AND p.status = 'active'
    ) as max_price
FROM categories c
WHERE c.category_id NOT IN (
    SELECT DISTINCT p.category_id
    FROM products p
    WHERE p.status = 'active'
      AND p.price BETWEEN 50 AND 150  -- Mid-range products
      AND p.category_id IS NOT NULL  -- Important for NOT IN
)
AND EXISTS (
    -- But have at least one active product
    SELECT 1
    FROM products p
    WHERE p.category_id = c.category_id
      AND p.status = 'active'
)
ORDER BY c.category_name;
```

**2. NOT IN with NULL Handling:**
```sql
-- Safe NOT IN pattern (handling NULLs)
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email
FROM customers c
WHERE c.status = 'active'
  AND c.customer_id NOT IN (
      SELECT o.customer_id
      FROM orders o
      WHERE o.status = 'cancelled'
        AND o.customer_id IS NOT NULL  -- Explicit NULL check
  )
ORDER BY c.last_name, c.first_name;

-- Alternative using NOT EXISTS (safer than NOT IN)
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email
FROM customers c
WHERE c.status = 'active'
  AND NOT EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.customer_id = c.customer_id
        AND o.status = 'cancelled'
  )
ORDER BY c.last_name, c.first_name;
```

---

## 🔄 ANY, ALL, and SOME Operators

### ANY and SOME Operators (equivalent)

**1. Basic ANY/SOME Examples:**
```sql
-- Products more expensive than ANY product in the 'Electronics' category
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.price > ANY (
      SELECT p2.price
      FROM products p2
      JOIN categories c2 ON p2.category_id = c2.category_id
      WHERE c2.category_name = 'Electronics'
        AND p2.status = 'active'
  )
ORDER BY p.price DESC;

-- Customers who have spent more than ANY customer from 'New York'
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.city,
    customer_spending.total_spent
FROM customers c
JOIN (
    SELECT 
        customer_id,
        SUM(total_amount) as total_spent
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
) customer_spending ON c.customer_id = customer_spending.customer_id
WHERE c.status = 'active'
  AND customer_spending.total_spent > ANY (
      SELECT SUM(o.total_amount)
      FROM customers c2
      JOIN orders o ON c2.customer_id = o.customer_id
      WHERE c2.city = 'New York'
        AND c2.status = 'active'
        AND o.status = 'completed'
      GROUP BY c2.customer_id
  )
  AND c.city != 'New York'  -- Exclude New York customers
ORDER BY customer_spending.total_spent DESC;

-- Orders with amounts greater than ANY order from the previous month
SELECT 
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    c.first_name,
    c.last_name
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
  AND EXTRACT(MONTH FROM o.order_date) = EXTRACT(MONTH FROM CURRENT_DATE)
  AND EXTRACT(YEAR FROM o.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  AND o.total_amount > ANY (
      SELECT o2.total_amount
      FROM orders o2
      WHERE o2.status = 'completed'
        AND EXTRACT(MONTH FROM o2.order_date) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        AND EXTRACT(YEAR FROM o2.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
  )
ORDER BY o.total_amount DESC;
```

### ALL Operator

**1. Basic ALL Examples:**
```sql
-- Products more expensive than ALL products in the 'Books' category
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.status = 'active'
  AND p.price > ALL (
      SELECT p2.price
      FROM products p2
      JOIN categories c2 ON p2.category_id = c2.category_id
      WHERE c2.category_name = 'Books'
        AND p2.status = 'active'
  )
ORDER BY p.price;

-- Customers who have spent more than ALL customers from 'Small Town'
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.city,
    customer_spending.total_spent
FROM customers c
JOIN (
    SELECT 
        customer_id,
        SUM(total_amount) as total_spent
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
) customer_spending ON c.customer_id = customer_spending.customer_id
WHERE c.status = 'active'
  AND customer_spending.total_spent > ALL (
      SELECT COALESCE(SUM(o.total_amount), 0)
      FROM customers c2
      LEFT JOIN orders o ON c2.customer_id = o.customer_id
          AND o.status = 'completed'
      WHERE c2.city = 'Small Town'
        AND c2.status = 'active'
      GROUP BY c2.customer_id
  )
  AND c.city != 'Small Town'  -- Exclude Small Town customers
ORDER BY customer_spending.total_spent DESC;

-- Products with ratings higher than ALL products in competing categories
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    product_ratings.avg_rating,
    product_ratings.review_count
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN (
    SELECT 
        product_id,
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
    FROM reviews
    GROUP BY product_id
    HAVING COUNT(*) >= 5  -- At least 5 reviews
) product_ratings ON p.product_id = product_ratings.product_id
WHERE p.status = 'active'
  AND product_ratings.avg_rating > ALL (
      SELECT AVG(r2.rating)
      FROM products p2
      JOIN reviews r2 ON p2.product_id = r2.product_id
      JOIN categories c2 ON p2.category_id = c2.category_id
      WHERE c2.category_name IN ('Competing Category 1', 'Competing Category 2')
        AND p2.status = 'active'
      GROUP BY p2.product_id
      HAVING COUNT(r2.review_id) >= 5
  )
ORDER BY product_ratings.avg_rating DESC;
```

**2. Complex ANY/ALL Patterns:**
```sql
-- Products that outperform ALL products in lower price categories
SELECT 
    p.product_id,
    p.product_name,
    p.price,
    c.category_name,
    sales_metrics.units_sold_12m,
    sales_metrics.revenue_12m
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold_12m,
        SUM(oi.quantity * oi.unit_price) as revenue_12m
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY oi.product_id
) sales_metrics ON p.product_id = sales_metrics.product_id
WHERE p.status = 'active'
  AND p.price >= 100  -- Focus on higher-priced products
  AND sales_metrics.units_sold_12m > ALL (
      -- Compare to all products in lower price ranges
      SELECT COALESCE(SUM(oi2.quantity), 0)
      FROM products p2
      LEFT JOIN order_items oi2 ON p2.product_id = oi2.product_id
      LEFT JOIN orders o2 ON oi2.order_id = o2.order_id
          AND o2.status IN ('completed', 'delivered')
          AND o2.order_date >= CURRENT_DATE - INTERVAL '12 months'
      WHERE p2.status = 'active'
        AND p2.price < p.price * 0.7  -- Products priced at least 30% lower
      GROUP BY p2.product_id
  )
ORDER BY sales_metrics.units_sold_12m DESC;

-- Customers whose average order value exceeds ANY VIP customer's average
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    customer_metrics.order_count,
    customer_metrics.total_spent,
    customer_metrics.avg_order_value
FROM customers c
JOIN (
    SELECT 
        customer_id,
        COUNT(*) as order_count,
        SUM(total_amount) as total_spent,
        AVG(total_amount) as avg_order_value
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
    HAVING COUNT(*) >= 3  -- At least 3 orders for reliable average
) customer_metrics ON c.customer_id = customer_metrics.customer_id
WHERE c.status = 'active'
  AND customer_metrics.total_spent < 2000  -- Non-VIP customers
  AND customer_metrics.avg_order_value > ANY (
      -- Compare to VIP customers' average order values
      SELECT AVG(o.total_amount)
      FROM orders o
      JOIN (
          SELECT customer_id
          FROM orders
          WHERE status = 'completed'
          GROUP BY customer_id
          HAVING SUM(total_amount) >= 2000  -- VIP threshold
      ) vip_customers ON o.customer_id = vip_customers.customer_id
      WHERE o.status = 'completed'
      GROUP BY o.customer_id
      HAVING COUNT(*) >= 3
  )
ORDER BY customer_metrics.avg_order_value DESC;
```

---

## 📝 Common Table Expressions (CTEs)

### Basic CTEs

**1. Simple CTE Examples:**
```sql
-- Customer spending analysis with CTE
WITH customer_spending AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        COUNT(o.order_id) as order_count,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.order_date) as first_order_date,
        MAX(o.order_date) as last_order_date
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
)
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    order_count,
    total_spent,
    avg_order_value,
    first_order_date,
    last_order_date,
    CURRENT_DATE - last_order_date as days_since_last_order,
    CASE 
        WHEN total_spent >= 2000 THEN 'VIP'
        WHEN total_spent >= 1000 THEN 'Premium'
        WHEN total_spent >= 500 THEN 'Regular'
        ELSE 'Basic'
    END as customer_tier
FROM customer_spending
WHERE order_count >= 2
ORDER BY total_spent DESC;

-- Product performance analysis with CTE
WITH product_sales AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.price,
        c.category_name,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as revenue,
        COUNT(DISTINCT o.order_id) as order_count
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.order_id
        AND o.status IN ('completed', 'delivered')
        AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    WHERE p.status = 'active'
    GROUP BY p.product_id, p.product_name, p.price, c.category_name
),
category_averages AS (
    SELECT 
        category_name,
        AVG(units_sold) as avg_category_units,
        AVG(revenue) as avg_category_revenue
    FROM product_sales
    GROUP BY category_name
)
SELECT 
    ps.product_id,
    ps.product_name,
    ps.price,
    ps.category_name,
    ps.units_sold,
    ps.revenue,
    ps.order_count,
    ca.avg_category_units,
    ca.avg_category_revenue,
    CASE 
        WHEN ps.units_sold > ca.avg_category_units THEN 'Above Average'
        WHEN ps.units_sold = ca.avg_category_units THEN 'Average'
        ELSE 'Below Average'
    END as performance_vs_category
FROM product_sales ps
JOIN category_averages ca ON ps.category_name = ca.category_name
ORDER BY ps.revenue DESC;
```

### Multiple CTEs

**1. Complex Analysis with Multiple CTEs:**
```sql
-- Comprehensive customer analysis with multiple CTEs
WITH customer_orders AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.city,
        c.created_at as registration_date,
        COUNT(o.order_id) as order_count,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.order_date) as first_order_date,
        MAX(o.order_date) as last_order_date
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
        AND o.status = 'completed'
    WHERE c.status = 'active'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.city, c.created_at
),
customer_segments AS (
    SELECT 
        *,
        CASE 
            WHEN total_spent >= 2000 THEN 'VIP'
            WHEN total_spent >= 1000 THEN 'Premium'
            WHEN total_spent >= 500 THEN 'Regular'
            WHEN total_spent > 0 THEN 'Basic'
            ELSE 'No Orders'
        END as spending_tier,
        CASE 
            WHEN order_count = 0 THEN 'Never Ordered'
            WHEN last_order_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Active'
            WHEN last_order_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Recent'
            WHEN last_order_date >= CURRENT_DATE - INTERVAL '180 days' THEN 'Dormant'
            ELSE 'Inactive'
        END as activity_status
    FROM customer_orders
),
segment_stats AS (
    SELECT 
        spending_tier,
        activity_status,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spending,
        AVG(order_count) as avg_orders,
        AVG(avg_order_value) as avg_order_value
    FROM customer_segments
    GROUP BY spending_tier, activity_status
)
SELECT 
    cs.customer_id,
    cs.first_name,
    cs.last_name,
    cs.email,
    cs.city,
    cs.spending_tier,
    cs.activity_status,
    cs.order_count,
    cs.total_spent,
    cs.avg_order_value,
    cs.last_order_date,
    ss.customer_count as peers_in_segment,
    ss.avg_spending as segment_avg_spending,
    CASE 
        WHEN cs.total_spent > ss.avg_spending THEN 'Above Segment Average'
        ELSE 'Below Segment Average'
    END as performance_vs_peers
FROM customer_segments cs
JOIN segment_stats ss ON cs.spending_tier = ss.spending_tier 
    AND cs.activity_status = ss.activity_status
WHERE cs.order_count > 0
ORDER BY cs.total_spent DESC;
```

**2. Recursive CTEs (PostgreSQL):**
```sql
-- Hierarchical category structure (if categories have parent-child relationships)
WITH RECURSIVE category_hierarchy AS (
    -- Base case: top-level categories
    SELECT 
        category_id,
        category_name,
        parent_category_id,
        0 as level,
        category_name as path
    FROM categories
    WHERE parent_category_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT 
        c.category_id,
        c.category_name,
        c.parent_category_id,
        ch.level + 1,
        ch.path || ' > ' || c.category_name
    FROM categories c
    JOIN category_hierarchy ch ON c.parent_category_id = ch.category_id
)
SELECT 
    ch.category_id,
    ch.category_name,
    ch.level,
    ch.path,
    COUNT(p.product_id) as product_count,
    COALESCE(SUM(sales.revenue), 0) as total_revenue
FROM category_hierarchy ch
LEFT JOIN products p ON ch.category_id = p.category_id
    AND p.status = 'active'
LEFT JOIN (
    SELECT 
        p.category_id,
        SUM(oi.quantity * oi.unit_price) as revenue
    FROM products p
    JOIN order_items oi ON p.product_id = oi.product_id
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY p.category_id
) sales ON ch.category_id = sales.category_id
GROUP BY ch.category_id, ch.category_name, ch.level, ch.path
ORDER BY ch.level, ch.path;
```

---

## ⚡ Performance Considerations

### Optimization Strategies

**1. Index Usage:**
```sql
-- Ensure proper indexes for subquery performance
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_orders_date_status ON orders(order_date, status);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_reviews_product_rating ON reviews(product_id, rating);

-- Covering indexes for common subquery patterns
CREATE INDEX idx_orders_customer_date_amount ON orders(customer_id, order_date, total_amount) 
WHERE status = 'completed';
```

**2. Subquery vs JOIN Performance:**
```sql
-- Slower: Correlated subquery
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.customer_id = c.customer_id
          AND o.status = 'completed'
    ) as order_count
FROM customers c;

-- Faster: LEFT JOIN with GROUP BY
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
    AND o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name;
```

**3. EXISTS vs IN Performance:**
```sql
-- Generally faster: EXISTS
SELECT c.*
FROM customers c
WHERE EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
      AND o.status = 'completed'
);

-- Can be slower: IN
SELECT c.*
FROM customers c
WHERE c.customer_id IN (
    SELECT o.customer_id
    FROM orders o
    WHERE o.status = 'completed'
);
```

---

## 💡 Real-World Examples

### Example 1: Customer Churn Analysis

```sql
-- Identify customers at risk of churning
WITH customer_activity AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        COUNT(o.order_id) as total_orders,
        MAX(o.order_date) as last_order_date,
        AVG(EXTRACT(EPOCH FROM (o2.order_date - o1.order_date)) / 86400) as avg_days_between_orders
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
        AND o.status = 'completed'
    LEFT JOIN orders o1 ON c.customer_id = o1.customer_id
        AND o1.status = 'completed'
    LEFT JOIN orders o2 ON c.customer_id = o2.customer_id
        AND o2.status = 'completed'
        AND o2.order_date > o1.order_date
        AND NOT EXISTS (
            SELECT 1
            FROM orders o3
            WHERE o3.customer_id = c.customer_id
              AND o3.status = 'completed'
              AND o3.order_date > o1.order_date
              AND o3.order_date < o2.order_date
        )
    WHERE c.status = 'active'
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
    HAVING COUNT(o.order_id) >= 2
)
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    total_orders,
    last_order_date,
    CURRENT_DATE - last_order_date as days_since_last_order,
    avg_days_between_orders,
    CASE 
        WHEN (CURRENT_DATE - last_order_date) > (avg_days_between_orders * 2) THEN 'High Risk'
        WHEN (CURRENT_DATE - last_order_date) > (avg_days_between_orders * 1.5) THEN 'Medium Risk'
        ELSE 'Low Risk'
    END as churn_risk
FROM customer_activity
WHERE avg_days_between_orders IS NOT NULL
ORDER BY days_since_last_order DESC;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between correlated and non-correlated subqueries?"**
   - Non-correlated: Independent, executes once
   - Correlated: References outer query, executes for each outer row
   - Performance implications and use cases

2. **"When would you use EXISTS vs IN?"**
   - EXISTS: Better for checking existence, handles NULLs safely
   - IN: Good for exact matches, but watch out for NULL issues
   - Performance considerations

3. **"How do you handle NULL values in NOT IN subqueries?"**
   - NOT IN with NULLs returns no results
   - Use NOT EXISTS or explicit NULL checks
   - Always filter out NULLs in subquery

### Performance Best Practices:

1. **Prefer EXISTS over IN for existence checks**
2. **Use proper indexes on subquery columns**
3. **Consider JOINs instead of correlated subqueries**
4. **Use CTEs for complex, reusable logic**
5. **Limit subquery result sets when possible**

---

## ⚠️ Things to Watch Out For

### 1. **NULL Handling in NOT IN**
```sql
-- Problem: Returns no results if subquery contains NULL
SELECT * FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id FROM orders  -- If any customer_id is NULL
);

-- Solution: Filter NULLs or use NOT EXISTS
SELECT * FROM customers
WHERE customer_id NOT IN (
    SELECT customer_id FROM orders WHERE customer_id IS NOT NULL
);
```

### 2. **Correlated Subquery Performance**
```sql
-- Slow: Executes subquery for each row
SELECT c.*, (
    SELECT COUNT(*) FROM orders o 
    WHERE o.customer_id = c.customer_id
) FROM customers c;

-- Better: Use JOIN
SELECT c.*, COUNT(o.order_id)
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id;
```

### 3. **Subquery Return Type Mismatch**
```sql
-- Error: Scalar subquery returns multiple rows
SELECT customer_id, (
    SELECT order_date FROM orders  -- Missing WHERE clause
) FROM customers;

-- Fix: Ensure single value
SELECT customer_id, (
    SELECT MAX(order_date) FROM orders 
    WHERE customer_id = customers.customer_id
) FROM customers;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Window Functions** - advanced analytical functions that allow you to perform calculations across related rows without grouping. You'll learn about ROW_NUMBER(), RANK(), LAG(), LEAD(), and how to create powerful analytical queries.

---

## 📝 Quick Practice

Try these subquery exercises:

1. **Scalar Subqueries**: Find products priced above their category average
2. **EXISTS**: Find customers who have ordered in multiple categories
3. **NOT EXISTS**: Find products never ordered by VIP customers
4. **Correlated**: Find each customer's most expensive order
5. **CTEs**: Create a customer segmentation analysis

Consider:
- When to use subqueries vs JOINs
- How to handle NULL values safely
- Performance implications of different approaches
- How to break complex problems into manageable parts