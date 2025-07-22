# 📘 Chapter 6: WHERE, GROUP BY, HAVING, ORDER BY

## 🎯 What You'll Learn
- Filtering data with WHERE clauses
- Grouping data with GROUP BY
- Filtering groups with HAVING
- Sorting results with ORDER BY
- Combining these clauses effectively
- Performance considerations and best practices

---

## 📖 Concept Explanation

These four clauses are the backbone of data retrieval in SQL. They work together to filter, group, aggregate, and sort your data:

- **WHERE**: Filters individual rows before grouping
- **GROUP BY**: Groups rows that share common values
- **HAVING**: Filters groups after aggregation
- **ORDER BY**: Sorts the final result set

### SQL Query Execution Order:
```
1. FROM       - Choose tables
2. WHERE      - Filter rows
3. GROUP BY   - Group rows
4. HAVING     - Filter groups
5. SELECT     - Choose columns
6. ORDER BY   - Sort results
7. LIMIT      - Limit results
```

Understanding this order is crucial for writing effective queries!

---

## 🔍 WHERE Clause - Filtering Rows

### Basic WHERE Syntax
```sql
SELECT columns
FROM table
WHERE condition;
```

### Comparison Operators

**1. Basic Comparisons:**
```sql
-- Equality and inequality
SELECT * FROM products WHERE price = 29.99;
SELECT * FROM products WHERE price != 29.99;  -- or <>
SELECT * FROM products WHERE price > 50;
SELECT * FROM products WHERE price <= 100;
SELECT * FROM products WHERE stock_quantity >= 10;

-- Date comparisons
SELECT * FROM orders WHERE order_date = '2024-01-15';
SELECT * FROM orders WHERE order_date > '2024-01-01';
SELECT * FROM employees WHERE hire_date < '2020-01-01';
```

**2. Range Conditions:**
```sql
-- BETWEEN (inclusive)
SELECT * FROM products 
WHERE price BETWEEN 10 AND 50;

-- Equivalent to:
SELECT * FROM products 
WHERE price >= 10 AND price <= 50;

-- Date ranges
SELECT * FROM orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';

-- NOT BETWEEN
SELECT * FROM products 
WHERE price NOT BETWEEN 10 AND 50;
```

**3. List Conditions:**
```sql
-- IN operator
SELECT * FROM products 
WHERE category_id IN (1, 3, 5, 7);

SELECT * FROM orders 
WHERE status IN ('pending', 'processing', 'shipped');

-- NOT IN
SELECT * FROM products 
WHERE category_id NOT IN (2, 4, 6);

-- IN with subquery
SELECT * FROM products 
WHERE category_id IN (
    SELECT category_id 
    FROM categories 
    WHERE category_name LIKE '%Electronics%'
);
```

**4. Pattern Matching:**
```sql
-- LIKE with wildcards
SELECT * FROM customers 
WHERE first_name LIKE 'John%';     -- Starts with 'John'

SELECT * FROM customers 
WHERE email LIKE '%@gmail.com';    -- Ends with '@gmail.com'

SELECT * FROM products 
WHERE product_name LIKE '%phone%'; -- Contains 'phone'

SELECT * FROM customers 
WHERE phone LIKE '555-____';       -- _ matches single character

-- Case-insensitive search (PostgreSQL)
SELECT * FROM customers 
WHERE first_name ILIKE 'john%';

-- Regular expressions (PostgreSQL)
SELECT * FROM customers 
WHERE email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';

-- MySQL regular expressions
SELECT * FROM customers 
WHERE email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
```

**5. NULL Handling:**
```sql
-- Check for NULL values
SELECT * FROM customers WHERE phone IS NULL;
SELECT * FROM customers WHERE phone IS NOT NULL;

-- NULL in comparisons (always returns NULL/false)
SELECT * FROM products WHERE description = NULL;     -- Wrong! Returns no rows
SELECT * FROM products WHERE description IS NULL;    -- Correct!

-- COALESCE for NULL handling
SELECT customer_id, 
       COALESCE(phone, 'No phone') as contact_phone
FROM customers;
```

### Logical Operators

**1. AND, OR, NOT:**
```sql
-- AND: All conditions must be true
SELECT * FROM products 
WHERE price > 10 AND price < 100 AND stock_quantity > 0;

-- OR: At least one condition must be true
SELECT * FROM orders 
WHERE status = 'shipped' OR status = 'delivered';

-- NOT: Negates the condition
SELECT * FROM customers 
WHERE NOT (first_name = 'John' AND last_name = 'Doe');

-- Complex combinations with parentheses
SELECT * FROM products 
WHERE (category_id = 1 OR category_id = 2) 
  AND price > 50 
  AND stock_quantity > 0;
```

**2. Operator Precedence:**
```sql
-- Without parentheses (AND has higher precedence)
SELECT * FROM products 
WHERE category_id = 1 OR category_id = 2 AND price > 50;
-- Equivalent to: category_id = 1 OR (category_id = 2 AND price > 50)

-- With parentheses (clearer intent)
SELECT * FROM products 
WHERE (category_id = 1 OR category_id = 2) AND price > 50;
```

### Real-World WHERE Examples

**1. E-commerce Product Search:**
```sql
-- Find available products in specific categories with good ratings
SELECT product_id, product_name, price, average_rating
FROM products 
WHERE category_id IN (1, 3, 5)           -- Electronics, Books, Clothing
  AND stock_quantity > 0                  -- In stock
  AND price BETWEEN 10 AND 500           -- Price range
  AND average_rating >= 4.0              -- Good ratings
  AND status = 'active'                  -- Active products
  AND (discount_percentage > 0 OR is_featured = true); -- On sale or featured
```

**2. Customer Segmentation:**
```sql
-- Find high-value customers for marketing campaign
SELECT customer_id, email, first_name, last_name, total_spent
FROM customers 
WHERE total_spent > 1000                 -- High spenders
  AND last_order_date > CURRENT_DATE - INTERVAL '90 days'  -- Recent activity
  AND email_verified = true              -- Verified email
  AND marketing_consent = true           -- Opted in for marketing
  AND status = 'active'                  -- Active account
  AND country IN ('US', 'CA', 'UK');     -- Specific regions
```

**3. Order Analysis:**
```sql
-- Find problematic orders that need attention
SELECT order_id, customer_id, order_date, total_amount, status
FROM orders 
WHERE (
    -- Old pending orders
    (status = 'pending' AND order_date < CURRENT_DATE - INTERVAL '7 days')
    OR 
    -- High-value failed orders
    (status = 'failed' AND total_amount > 500)
    OR 
    -- Shipped orders without tracking
    (status = 'shipped' AND tracking_number IS NULL)
  )
  AND order_date >= CURRENT_DATE - INTERVAL '30 days'; -- Last 30 days only
```

---

## 📊 GROUP BY Clause - Grouping Data

### Basic GROUP BY Syntax
```sql
SELECT column1, aggregate_function(column2)
FROM table
WHERE condition
GROUP BY column1;
```

### Simple Grouping

**1. Basic Grouping:**
```sql
-- Count customers by country
SELECT country, COUNT(*) as customer_count
FROM customers
GROUP BY country;

-- Average order value by customer
SELECT customer_id, AVG(total_amount) as avg_order_value
FROM orders
GROUP BY customer_id;

-- Total sales by product category
SELECT c.category_name, SUM(oi.quantity * oi.unit_price) as total_sales
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name;
```

**2. Multiple Column Grouping:**
```sql
-- Sales by category and month
SELECT 
    c.category_name,
    EXTRACT(YEAR FROM o.order_date) as year,
    EXTRACT(MONTH FROM o.order_date) as month,
    SUM(oi.quantity * oi.unit_price) as monthly_sales,
    COUNT(DISTINCT o.order_id) as order_count
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
GROUP BY c.category_name, EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date)
ORDER BY year, month, category_name;

-- Customer behavior by country and age group
SELECT 
    country,
    CASE 
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 25 THEN '18-24'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 35 THEN '25-34'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 45 THEN '35-44'
        WHEN EXTRACT(YEAR FROM age(date_of_birth)) < 55 THEN '45-54'
        ELSE '55+'
    END as age_group,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spent
FROM customers
WHERE date_of_birth IS NOT NULL
GROUP BY country, age_group
ORDER BY country, age_group;
```

### Advanced Grouping

**1. Grouping with Expressions:**
```sql
-- Sales by quarter
SELECT 
    EXTRACT(YEAR FROM order_date) as year,
    EXTRACT(QUARTER FROM order_date) as quarter,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(QUARTER FROM order_date)
ORDER BY year, quarter;

-- Product performance by price range
SELECT 
    CASE 
        WHEN price < 25 THEN 'Budget ($0-$24)'
        WHEN price < 100 THEN 'Mid-range ($25-$99)'
        WHEN price < 500 THEN 'Premium ($100-$499)'
        ELSE 'Luxury ($500+)'
    END as price_category,
    COUNT(*) as product_count,
    AVG(average_rating) as avg_rating,
    SUM(units_sold) as total_units_sold
FROM products
GROUP BY price_category
ORDER BY MIN(price);
```

**2. Grouping Sets (PostgreSQL):**
```sql
-- Multiple grouping levels in one query
SELECT 
    category_id,
    EXTRACT(YEAR FROM order_date) as year,
    SUM(total_amount) as total_sales
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY GROUPING SETS (
    (category_id, EXTRACT(YEAR FROM order_date)),  -- By category and year
    (category_id),                                  -- By category only
    (EXTRACT(YEAR FROM order_date)),               -- By year only
    ()                                             -- Grand total
)
ORDER BY category_id, year;
```

**3. ROLLUP and CUBE (PostgreSQL):**
```sql
-- ROLLUP: Hierarchical subtotals
SELECT 
    country,
    state,
    city,
    COUNT(*) as customer_count
FROM customers
GROUP BY ROLLUP(country, state, city)
ORDER BY country, state, city;

-- CUBE: All possible combinations
SELECT 
    category_id,
    EXTRACT(YEAR FROM order_date) as year,
    EXTRACT(QUARTER FROM order_date) as quarter,
    SUM(total_amount) as total_sales
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY CUBE(category_id, year, quarter)
ORDER BY category_id, year, quarter;
```

---

## 🎯 HAVING Clause - Filtering Groups

### Basic HAVING Syntax
```sql
SELECT column1, aggregate_function(column2)
FROM table
WHERE condition
GROUP BY column1
HAVING aggregate_condition;
```

### HAVING vs WHERE
- **WHERE**: Filters rows before grouping
- **HAVING**: Filters groups after aggregation

### HAVING Examples

**1. Basic HAVING:**
```sql
-- Customers with more than 5 orders
SELECT customer_id, COUNT(*) as order_count
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 5;

-- Categories with average product price > $50
SELECT category_id, AVG(price) as avg_price
FROM products
GROUP BY category_id
HAVING AVG(price) > 50;

-- Countries with total sales > $10,000
SELECT 
    c.country,
    SUM(o.total_amount) as total_sales,
    COUNT(DISTINCT c.customer_id) as customer_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.country
HAVING SUM(o.total_amount) > 10000;
```

**2. Complex HAVING Conditions:**
```sql
-- High-value customer segments
SELECT 
    customer_id,
    COUNT(*) as order_count,
    SUM(total_amount) as total_spent,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY customer_id
HAVING COUNT(*) >= 3                    -- At least 3 orders
   AND SUM(total_amount) > 500          -- Spent more than $500
   AND AVG(total_amount) > 50;          -- Average order > $50

-- Product categories with consistent sales
SELECT 
    c.category_name,
    COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) as active_months,
    SUM(oi.quantity * oi.unit_price) as total_sales,
    STDDEV(monthly_sales.sales) as sales_variance
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
JOIN (
    SELECT 
        p2.category_id,
        EXTRACT(MONTH FROM o2.order_date) as month,
        SUM(oi2.quantity * oi2.unit_price) as sales
    FROM products p2
    JOIN order_items oi2 ON p2.product_id = oi2.product_id
    JOIN orders o2 ON oi2.order_id = o2.order_id
    GROUP BY p2.category_id, EXTRACT(MONTH FROM o2.order_date)
) monthly_sales ON c.category_id = monthly_sales.category_id
WHERE o.order_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY c.category_id, c.category_name
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) >= 6  -- Active in 6+ months
   AND STDDEV(monthly_sales.sales) < 1000;                    -- Low variance
```

**3. HAVING with Subqueries:**
```sql
-- Categories performing above average
SELECT 
    c.category_name,
    SUM(oi.quantity * oi.unit_price) as category_sales
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name
HAVING SUM(oi.quantity * oi.unit_price) > (
    SELECT AVG(category_total)
    FROM (
        SELECT SUM(oi2.quantity * oi2.unit_price) as category_total
        FROM categories c2
        JOIN products p2 ON c2.category_id = p2.category_id
        JOIN order_items oi2 ON p2.product_id = oi2.product_id
        GROUP BY c2.category_id
    ) avg_calc
);
```

---

## 📈 ORDER BY Clause - Sorting Results

### Basic ORDER BY Syntax
```sql
SELECT columns
FROM table
WHERE condition
GROUP BY columns
HAVING condition
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC];
```

### Sorting Options

**1. Basic Sorting:**
```sql
-- Single column sorting
SELECT * FROM products ORDER BY price;           -- Ascending (default)
SELECT * FROM products ORDER BY price ASC;      -- Explicit ascending
SELECT * FROM products ORDER BY price DESC;     -- Descending

-- Multiple column sorting
SELECT * FROM customers 
ORDER BY country ASC, last_name ASC, first_name ASC;

-- Mixed sorting directions
SELECT product_name, price, average_rating
FROM products 
ORDER BY average_rating DESC, price ASC;
```

**2. Sorting by Expressions:**
```sql
-- Sort by calculated values
SELECT 
    product_name,
    price,
    stock_quantity,
    (price * stock_quantity) as inventory_value
FROM products 
ORDER BY (price * stock_quantity) DESC;

-- Sort by string functions
SELECT first_name, last_name, email
FROM customers 
ORDER BY LENGTH(email) DESC, email ASC;

-- Sort by date parts
SELECT order_id, order_date, total_amount
FROM orders 
ORDER BY EXTRACT(MONTH FROM order_date), EXTRACT(DAY FROM order_date);
```

**3. Conditional Sorting:**
```sql
-- Custom sort order with CASE
SELECT order_id, status, order_date
FROM orders 
ORDER BY 
    CASE status
        WHEN 'urgent' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'pending' THEN 3
        WHEN 'shipped' THEN 4
        WHEN 'delivered' THEN 5
        ELSE 6
    END,
    order_date DESC;

-- Sort products by availability, then by rating
SELECT product_name, stock_quantity, average_rating
FROM products 
ORDER BY 
    CASE WHEN stock_quantity > 0 THEN 0 ELSE 1 END,  -- In stock first
    average_rating DESC,
    product_name ASC;
```

**4. NULL Handling in Sorting:**
```sql
-- PostgreSQL: Control NULL position
SELECT customer_id, phone
FROM customers 
ORDER BY phone NULLS LAST;   -- NULLs at the end

SELECT customer_id, phone
FROM customers 
ORDER BY phone NULLS FIRST;  -- NULLs at the beginning

-- MySQL: Use ISNULL() or COALESCE()
SELECT customer_id, phone
FROM customers 
ORDER BY ISNULL(phone), phone;  -- NULLs first

SELECT customer_id, phone
FROM customers 
ORDER BY COALESCE(phone, 'ZZZZZ');  -- Treat NULL as 'ZZZZZ'
```

### Advanced Sorting

**1. Sorting Aggregated Results:**
```sql
-- Top customers by total spending
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC NULLS LAST, order_count DESC;

-- Best selling products by category
SELECT 
    c.category_name,
    p.product_name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name, p.product_id, p.product_name
ORDER BY c.category_name, total_revenue DESC;
```

**2. Window Function Sorting:**
```sql
-- Rank products within each category by sales
SELECT 
    c.category_name,
    p.product_name,
    SUM(oi.quantity * oi.unit_price) as revenue,
    RANK() OVER (
        PARTITION BY c.category_id 
        ORDER BY SUM(oi.quantity * oi.unit_price) DESC
    ) as category_rank
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY c.category_id, c.category_name, p.product_id, p.product_name
ORDER BY c.category_name, category_rank;
```

---

## 🔄 Combining All Clauses

### Complete Query Structure
```sql
SELECT 
    -- What to show
    c.category_name,
    COUNT(DISTINCT p.product_id) as product_count,
    COUNT(DISTINCT o.order_id) as order_count,
    SUM(oi.quantity) as total_units_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue,
    AVG(oi.unit_price) as avg_unit_price,
    MAX(o.order_date) as last_order_date
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE 
    -- Filter individual rows
    o.order_date >= CURRENT_DATE - INTERVAL '1 year'  -- Last year only
    AND o.status IN ('completed', 'shipped', 'delivered')  -- Successful orders
    AND p.status = 'active'                           -- Active products
GROUP BY 
    -- Group by category
    c.category_id, c.category_name
HAVING 
    -- Filter groups
    COUNT(DISTINCT o.order_id) >= 10                  -- At least 10 orders
    AND SUM(oi.quantity * oi.unit_price) > 1000      -- Revenue > $1000
ORDER BY 
    -- Sort results
    total_revenue DESC,                               -- Highest revenue first
    product_count DESC;                               -- Then by product count
```

### Real-World Complex Examples

**1. Sales Performance Dashboard:**
```sql
-- Monthly sales performance with growth metrics
SELECT 
    EXTRACT(YEAR FROM o.order_date) as year,
    EXTRACT(MONTH FROM o.order_date) as month,
    COUNT(DISTINCT o.order_id) as order_count,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    SUM(o.total_amount) as total_revenue,
    AVG(o.total_amount) as avg_order_value,
    SUM(CASE WHEN c.created_at >= o.order_date - INTERVAL '30 days' 
             THEN o.total_amount ELSE 0 END) as new_customer_revenue,
    COUNT(CASE WHEN o.total_amount > 100 THEN 1 END) as high_value_orders
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE 
    o.order_date >= CURRENT_DATE - INTERVAL '2 years'
    AND o.status IN ('completed', 'shipped', 'delivered')
    AND o.total_amount > 0
GROUP BY 
    EXTRACT(YEAR FROM o.order_date),
    EXTRACT(MONTH FROM o.order_date)
HAVING 
    COUNT(DISTINCT o.order_id) >= 5  -- Months with at least 5 orders
ORDER BY 
    year DESC, month DESC;
```

**2. Customer Segmentation Analysis:**
```sql
-- RFM Analysis: Recency, Frequency, Monetary
SELECT 
    customer_id,
    -- Recency: Days since last order
    CURRENT_DATE - MAX(order_date) as days_since_last_order,
    
    -- Frequency: Number of orders
    COUNT(*) as order_frequency,
    
    -- Monetary: Total spent
    SUM(total_amount) as total_monetary_value,
    AVG(total_amount) as avg_order_value,
    
    -- Customer segment based on behavior
    CASE 
        WHEN COUNT(*) >= 10 AND SUM(total_amount) >= 1000 
             AND CURRENT_DATE - MAX(order_date) <= 30 
        THEN 'VIP'
        
        WHEN COUNT(*) >= 5 AND SUM(total_amount) >= 500 
             AND CURRENT_DATE - MAX(order_date) <= 90 
        THEN 'Loyal'
        
        WHEN COUNT(*) >= 3 AND CURRENT_DATE - MAX(order_date) <= 180 
        THEN 'Regular'
        
        WHEN CURRENT_DATE - MAX(order_date) <= 365 
        THEN 'Occasional'
        
        ELSE 'Inactive'
    END as customer_segment
FROM orders
WHERE 
    order_date >= CURRENT_DATE - INTERVAL '2 years'
    AND status IN ('completed', 'delivered')
GROUP BY customer_id
HAVING 
    COUNT(*) >= 1  -- At least one order
ORDER BY 
    total_monetary_value DESC,
    order_frequency DESC,
    days_since_last_order ASC;
```

**3. Product Performance Analysis:**
```sql
-- Product performance with seasonal trends
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    
    -- Overall metrics
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as total_units_sold,
    SUM(oi.quantity * oi.unit_price) as total_revenue,
    AVG(oi.unit_price) as avg_selling_price,
    
    -- Seasonal performance
    SUM(CASE WHEN EXTRACT(QUARTER FROM o.order_date) = 1 
             THEN oi.quantity ELSE 0 END) as q1_units,
    SUM(CASE WHEN EXTRACT(QUARTER FROM o.order_date) = 2 
             THEN oi.quantity ELSE 0 END) as q2_units,
    SUM(CASE WHEN EXTRACT(QUARTER FROM o.order_date) = 3 
             THEN oi.quantity ELSE 0 END) as q3_units,
    SUM(CASE WHEN EXTRACT(QUARTER FROM o.order_date) = 4 
             THEN oi.quantity ELSE 0 END) as q4_units,
    
    -- Performance indicators
    CASE 
        WHEN SUM(oi.quantity * oi.unit_price) > 10000 THEN 'Top Performer'
        WHEN SUM(oi.quantity * oi.unit_price) > 5000 THEN 'Good Performer'
        WHEN SUM(oi.quantity * oi.unit_price) > 1000 THEN 'Average Performer'
        ELSE 'Poor Performer'
    END as performance_category
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE 
    o.order_date >= CURRENT_DATE - INTERVAL '1 year'
    AND o.status IN ('completed', 'delivered')
    AND p.status = 'active'
GROUP BY 
    p.product_id, p.product_name, c.category_name
HAVING 
    COUNT(DISTINCT oi.order_id) >= 5      -- At least 5 orders
    AND SUM(oi.quantity) >= 10            -- At least 10 units sold
ORDER BY 
    total_revenue DESC,
    total_units_sold DESC;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between WHERE and HAVING?"**
   - WHERE filters rows before grouping
   - HAVING filters groups after aggregation
   - WHERE cannot use aggregate functions, HAVING can
   - WHERE is processed before GROUP BY, HAVING after

2. **"Explain the SQL execution order"**
   - FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
   - Understanding this helps write correct queries and debug issues

3. **"How do you optimize queries with these clauses?"**
   - Use indexes on WHERE clause columns
   - Use indexes on GROUP BY columns
   - Use indexes on ORDER BY columns
   - Filter early with WHERE to reduce data for grouping
   - Use LIMIT when you don't need all results

### Performance Best Practices:

1. **Index Strategy:**
   ```sql
   -- Create composite indexes for common query patterns
   CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
   CREATE INDEX idx_products_category_price ON products(category_id, price);
   CREATE INDEX idx_orders_status_date ON orders(status, order_date);
   ```

2. **Query Optimization:**
   ```sql
   -- Good: Filter early with WHERE
   SELECT category_id, COUNT(*)
   FROM products 
   WHERE status = 'active'  -- Filter first
   GROUP BY category_id;
   
   -- Avoid: Filtering after grouping when possible
   SELECT category_id, COUNT(*)
   FROM products 
   GROUP BY category_id
   HAVING SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) > 0;
   ```

3. **Efficient Aggregation:**
   ```sql
   -- Use specific aggregate functions
   SELECT COUNT(*) FROM orders;              -- Count all rows
   SELECT COUNT(customer_id) FROM orders;    -- Count non-NULL values
   SELECT COUNT(DISTINCT customer_id) FROM orders;  -- Count unique values
   ```

---

## ⚠️ Things to Watch Out For

### 1. **GROUP BY Rules**
```sql
-- Error: Non-aggregated column in SELECT without GROUP BY
SELECT customer_id, order_date, COUNT(*)
FROM orders
GROUP BY customer_id;  -- order_date not in GROUP BY!

-- Correct: Include all non-aggregated columns in GROUP BY
SELECT customer_id, order_date, COUNT(*)
FROM orders
GROUP BY customer_id, order_date;

-- Or use aggregation for the column
SELECT customer_id, MAX(order_date) as latest_order, COUNT(*)
FROM orders
GROUP BY customer_id;
```

### 2. **NULL Handling in Aggregates**
```sql
-- COUNT(*) counts all rows, COUNT(column) ignores NULLs
SELECT 
    COUNT(*) as total_customers,           -- All customers
    COUNT(phone) as customers_with_phone,  -- Only non-NULL phones
    COUNT(DISTINCT country) as unique_countries
FROM customers;

-- SUM, AVG ignore NULLs
SELECT 
    AVG(rating) as avg_rating,                    -- Ignores NULL ratings
    AVG(COALESCE(rating, 0)) as avg_rating_with_zero  -- Treats NULL as 0
FROM product_reviews;
```

### 3. **Date/Time Grouping Pitfalls**
```sql
-- Problem: Grouping by full timestamp
SELECT order_date, COUNT(*)
FROM orders
GROUP BY order_date;  -- Groups by exact timestamp!

-- Solution: Extract date part
SELECT DATE(order_date) as order_day, COUNT(*)
FROM orders
GROUP BY DATE(order_date);

-- Or use date truncation (PostgreSQL)
SELECT DATE_TRUNC('day', order_date) as order_day, COUNT(*)
FROM orders
GROUP BY DATE_TRUNC('day', order_date);
```

### 4. **Performance Issues**
```sql
-- Slow: No indexes on filtered/grouped columns
SELECT category_id, COUNT(*)
FROM products 
WHERE price > 100
GROUP BY category_id
ORDER BY COUNT(*) DESC;

-- Fast: With proper indexes
CREATE INDEX idx_products_price_category ON products(price, category_id);
```

### 5. **Logical Operator Precedence**
```sql
-- Confusing: AND has higher precedence than OR
SELECT * FROM products 
WHERE category_id = 1 OR category_id = 2 AND price > 50;
-- Equivalent to: category_id = 1 OR (category_id = 2 AND price > 50)

-- Clear: Use parentheses
SELECT * FROM products 
WHERE (category_id = 1 OR category_id = 2) AND price > 50;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Joins** - the powerful feature that allows you to combine data from multiple tables. You'll learn about INNER, LEFT, RIGHT, and FULL joins, and how to write complex queries that span multiple related tables.

---

## 📝 Quick Practice

Try these exercises with a sample e-commerce database:

1. **Basic Filtering**: Find all orders from the last 30 days with a total amount greater than $100
2. **Grouping**: Calculate total sales by month for the current year
3. **Having**: Find customers who have placed more than 3 orders and spent more than $500 total
4. **Complex Query**: Create a report showing the top 5 product categories by revenue, including the number of products and average price per category
5. **Performance**: Identify which indexes would improve the performance of your queries

Consider:
- How do you handle NULL values in your calculations?
- What happens when you group by date columns?
- How do you ensure your queries are efficient?
- What business insights can you derive from the grouped data?