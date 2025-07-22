# 📘 Chapter 8: Aggregate Functions (COUNT, SUM, AVG, etc.)

## 🎯 What You'll Learn
- Understanding aggregate functions and their purpose
- COUNT for counting records and non-NULL values
- SUM for calculating totals
- AVG for calculating averages
- MIN and MAX for finding extremes
- Advanced aggregate functions (STDDEV, VARIANCE, etc.)
- Using aggregates with GROUP BY and HAVING
- Window functions vs aggregate functions
- Performance considerations

---

## 📖 Concept Explanation

**Aggregate functions** perform calculations on a set of rows and return a single result. They're essential for data analysis, reporting, and business intelligence. Think of them as "summarizing" your data - turning many rows into meaningful insights.

### Key Characteristics:
1. **Input**: Multiple rows
2. **Output**: Single value
3. **NULL Handling**: Most aggregates ignore NULL values
4. **Grouping**: Work with GROUP BY to create subtotals
5. **Filtering**: Use HAVING to filter aggregated results

### Common Aggregate Functions:
- **COUNT()**: Count rows or non-NULL values
- **SUM()**: Add up numeric values
- **AVG()**: Calculate average of numeric values
- **MIN()**: Find minimum value
- **MAX()**: Find maximum value
- **STDDEV()**: Calculate standard deviation
- **VARIANCE()**: Calculate variance

---

## 🔢 COUNT Function

### COUNT Variations
```sql
COUNT(*)           -- Count all rows (including NULLs)
COUNT(column)      -- Count non-NULL values in column
COUNT(DISTINCT column)  -- Count unique non-NULL values
```

### Basic COUNT Examples

**1. Simple Counting:**
```sql
-- Total number of customers
SELECT COUNT(*) as total_customers
FROM customers;

-- Customers with phone numbers
SELECT COUNT(phone) as customers_with_phone
FROM customers;

-- Customers with verified emails
SELECT COUNT(*) as verified_customers
FROM customers
WHERE email_verified = true;

-- Unique countries
SELECT COUNT(DISTINCT country) as unique_countries
FROM customers;
```

**2. COUNT with Conditions:**
```sql
-- Count orders by status
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    
    -- Calculate percentages
    ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as completion_rate
FROM orders;

-- Count customers by registration year
SELECT 
    EXTRACT(YEAR FROM created_at) as registration_year,
    COUNT(*) as new_customers,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_customers
FROM customers
GROUP BY EXTRACT(YEAR FROM created_at)
ORDER BY registration_year;
```

**3. Advanced COUNT Patterns:**
```sql
-- Count distinct customers who made purchases in different time periods
SELECT 
    COUNT(DISTINCT CASE 
        WHEN order_date >= CURRENT_DATE - INTERVAL '30 days' 
        THEN customer_id 
    END) as active_last_30_days,
    
    COUNT(DISTINCT CASE 
        WHEN order_date >= CURRENT_DATE - INTERVAL '90 days' 
        THEN customer_id 
    END) as active_last_90_days,
    
    COUNT(DISTINCT customer_id) as total_customers_with_orders
FROM orders
WHERE status IN ('completed', 'shipped', 'delivered');

-- Count products by availability and price range
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as in_stock_products,
    COUNT(CASE WHEN price < 50 THEN 1 END) as budget_products,
    COUNT(CASE WHEN price BETWEEN 50 AND 200 THEN 1 END) as mid_range_products,
    COUNT(CASE WHEN price > 200 THEN 1 END) as premium_products,
    
    -- Count products with reviews
    COUNT(CASE WHEN average_rating IS NOT NULL THEN 1 END) as products_with_reviews
FROM products
WHERE status = 'active';
```

---

## ➕ SUM Function

### Basic SUM Examples

**1. Simple Totals:**
```sql
-- Total revenue
SELECT SUM(total_amount) as total_revenue
FROM orders
WHERE status IN ('completed', 'delivered');

-- Total inventory value
SELECT SUM(price * stock_quantity) as total_inventory_value
FROM products
WHERE status = 'active';

-- Total units sold
SELECT SUM(quantity) as total_units_sold
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status IN ('completed', 'delivered');
```

**2. Conditional SUM:**
```sql
-- Revenue by payment method
SELECT 
    SUM(CASE WHEN payment_method = 'credit_card' THEN total_amount ELSE 0 END) as credit_card_revenue,
    SUM(CASE WHEN payment_method = 'paypal' THEN total_amount ELSE 0 END) as paypal_revenue,
    SUM(CASE WHEN payment_method = 'bank_transfer' THEN total_amount ELSE 0 END) as bank_transfer_revenue,
    SUM(total_amount) as total_revenue
FROM orders
WHERE status = 'completed';

-- Monthly revenue comparison
SELECT 
    EXTRACT(MONTH FROM order_date) as month,
    SUM(total_amount) as monthly_revenue,
    SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = 2024 THEN total_amount ELSE 0 END) as revenue_2024,
    SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = 2023 THEN total_amount ELSE 0 END) as revenue_2023
FROM orders
WHERE status = 'completed'
  AND order_date >= '2023-01-01'
GROUP BY EXTRACT(MONTH FROM order_date)
ORDER BY month;
```

**3. SUM with Joins:**
```sql
-- Revenue by product category
SELECT 
    c.category_name,
    SUM(oi.quantity * oi.unit_price) as category_revenue,
    SUM(oi.quantity) as units_sold,
    COUNT(DISTINCT o.order_id) as order_count,
    COUNT(DISTINCT o.customer_id) as unique_customers
FROM categories c
JOIN products p ON c.category_id = p.category_id
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status IN ('completed', 'delivered')
  AND o.order_date >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY c.category_id, c.category_name
ORDER BY category_revenue DESC;

-- Customer lifetime value
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    c.email,
    COUNT(o.order_id) as total_orders,
    SUM(o.total_amount) as lifetime_value,
    AVG(o.total_amount) as avg_order_value,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status IN ('completed', 'delivered')
GROUP BY c.customer_id, c.first_name, c.last_name, c.email
HAVING SUM(o.total_amount) > 500  -- High-value customers only
ORDER BY lifetime_value DESC;
```

---

## 📊 AVG Function

### Basic AVG Examples

**1. Simple Averages:**
```sql
-- Average order value
SELECT AVG(total_amount) as avg_order_value
FROM orders
WHERE status = 'completed';

-- Average product price by category
SELECT 
    c.category_name,
    AVG(p.price) as avg_price,
    COUNT(p.product_id) as product_count
FROM categories c
JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
ORDER BY avg_price DESC;

-- Average customer age
SELECT 
    AVG(EXTRACT(YEAR FROM age(date_of_birth))) as avg_age
FROM customers
WHERE date_of_birth IS NOT NULL;
```

**2. Weighted Averages:**
```sql
-- Weighted average product rating (by number of reviews)
SELECT 
    p.product_id,
    p.product_name,
    COUNT(r.review_id) as review_count,
    AVG(r.rating) as avg_rating,
    
    -- Weighted average considering review volume
    CASE 
        WHEN COUNT(r.review_id) >= 10 THEN AVG(r.rating)
        WHEN COUNT(r.review_id) >= 5 THEN AVG(r.rating) * 0.9
        WHEN COUNT(r.review_id) >= 1 THEN AVG(r.rating) * 0.8
        ELSE NULL
    END as weighted_rating
FROM products p
LEFT JOIN reviews r ON p.product_id = r.product_id
WHERE p.status = 'active'
GROUP BY p.product_id, p.product_name
HAVING COUNT(r.review_id) > 0
ORDER BY weighted_rating DESC;

-- Average order value by customer segment
SELECT 
    CASE 
        WHEN customer_orders.order_count = 1 THEN 'One-time'
        WHEN customer_orders.order_count BETWEEN 2 AND 5 THEN 'Occasional'
        WHEN customer_orders.order_count BETWEEN 6 AND 15 THEN 'Regular'
        ELSE 'VIP'
    END as customer_segment,
    COUNT(*) as customers_in_segment,
    AVG(customer_orders.avg_order_value) as segment_avg_order_value,
    AVG(customer_orders.total_spent) as segment_avg_lifetime_value
FROM (
    SELECT 
        c.customer_id,
        COUNT(o.order_id) as order_count,
        AVG(o.total_amount) as avg_order_value,
        SUM(o.total_amount) as total_spent
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id
) customer_orders
GROUP BY customer_segment
ORDER BY segment_avg_lifetime_value DESC;
```

**3. Moving Averages:**
```sql
-- 7-day moving average of daily sales
SELECT 
    order_date,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as moving_avg_7_days
FROM (
    SELECT 
        DATE(order_date) as order_date,
        SUM(total_amount) as daily_revenue
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE(order_date)
) daily_sales
ORDER BY order_date;
```

---

## 🔍 MIN and MAX Functions

### Basic MIN/MAX Examples

**1. Simple Extremes:**
```sql
-- Price range analysis
SELECT 
    MIN(price) as cheapest_product,
    MAX(price) as most_expensive_product,
    AVG(price) as average_price,
    MAX(price) - MIN(price) as price_range
FROM products
WHERE status = 'active';

-- Order date range
SELECT 
    MIN(order_date) as first_order,
    MAX(order_date) as latest_order,
    MAX(order_date) - MIN(order_date) as business_duration_days
FROM orders;

-- Customer age demographics
SELECT 
    MIN(EXTRACT(YEAR FROM age(date_of_birth))) as youngest_customer,
    MAX(EXTRACT(YEAR FROM age(date_of_birth))) as oldest_customer,
    AVG(EXTRACT(YEAR FROM age(date_of_birth))) as average_age
FROM customers
WHERE date_of_birth IS NOT NULL;
```

**2. MIN/MAX with GROUP BY:**
```sql
-- Price range by category
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    AVG(p.price) as avg_price,
    MAX(p.price) - MIN(p.price) as price_range
FROM categories c
JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
ORDER BY price_range DESC;

-- Customer order patterns
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as total_orders,
    MIN(o.order_date) as first_order_date,
    MAX(o.order_date) as last_order_date,
    MIN(o.total_amount) as smallest_order,
    MAX(o.total_amount) as largest_order,
    
    -- Calculate customer lifecycle metrics
    MAX(o.order_date) - MIN(o.order_date) as customer_lifespan_days,
    CURRENT_DATE - MAX(o.order_date) as days_since_last_order
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(o.order_id) > 1  -- Multi-order customers only
ORDER BY customer_lifespan_days DESC;
```

**3. Finding Records with MIN/MAX Values:**
```sql
-- Most expensive product in each category
SELECT 
    c.category_name,
    p.product_name,
    p.price
FROM products p
JOIN categories c ON p.category_id = c.category_id
WHERE p.price = (
    SELECT MAX(p2.price)
    FROM products p2
    WHERE p2.category_id = p.category_id
      AND p2.status = 'active'
)
AND p.status = 'active'
ORDER BY p.price DESC;

-- Latest order for each customer
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date = (
    SELECT MAX(o2.order_date)
    FROM orders o2
    WHERE o2.customer_id = c.customer_id
      AND o2.status = 'completed'
)
AND o.status = 'completed'
ORDER BY o.order_date DESC;
```

---

## 📈 Advanced Aggregate Functions

### Statistical Functions

**1. Standard Deviation and Variance:**
```sql
-- Price distribution analysis
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    AVG(p.price) as avg_price,
    STDDEV(p.price) as price_stddev,
    VARIANCE(p.price) as price_variance,
    
    -- Coefficient of variation (relative variability)
    CASE 
        WHEN AVG(p.price) > 0 
        THEN STDDEV(p.price) / AVG(p.price)
        ELSE NULL
    END as coefficient_of_variation
FROM categories c
JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
HAVING COUNT(p.product_id) >= 5  -- Categories with enough products
ORDER BY coefficient_of_variation DESC;

-- Order value consistency by customer
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    AVG(o.total_amount) as avg_order_value,
    STDDEV(o.total_amount) as order_value_stddev,
    
    -- Customer spending consistency
    CASE 
        WHEN STDDEV(o.total_amount) < AVG(o.total_amount) * 0.3 THEN 'Consistent'
        WHEN STDDEV(o.total_amount) < AVG(o.total_amount) * 0.7 THEN 'Moderate'
        ELSE 'Variable'
    END as spending_pattern
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(o.order_id) >= 5  -- Customers with enough orders
ORDER BY order_value_stddev DESC;
```

**2. Percentiles (PostgreSQL):**
```sql
-- Order value percentiles
SELECT 
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_amount) as q1_25th_percentile,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_amount) as median_50th_percentile,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_amount) as q3_75th_percentile,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY total_amount) as p90_90th_percentile,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY total_amount) as p95_95th_percentile
FROM orders
WHERE status = 'completed'
  AND order_date >= CURRENT_DATE - INTERVAL '1 year';

-- Customer spending distribution
SELECT 
    customer_segment,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spent,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_spent) as median_spent
FROM (
    SELECT 
        c.customer_id,
        SUM(o.total_amount) as total_spent,
        CASE 
            WHEN SUM(o.total_amount) < 100 THEN 'Low Value'
            WHEN SUM(o.total_amount) < 500 THEN 'Medium Value'
            WHEN SUM(o.total_amount) < 2000 THEN 'High Value'
            ELSE 'Premium Value'
        END as customer_segment
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.customer_id
) customer_spending
GROUP BY customer_segment
ORDER BY avg_spent DESC;
```

### String Aggregation

**1. STRING_AGG (PostgreSQL) / GROUP_CONCAT (MySQL):**
```sql
-- PostgreSQL: Concatenate product names by category
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    STRING_AGG(p.product_name, ', ' ORDER BY p.product_name) as product_list
FROM categories c
JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
ORDER BY product_count DESC;

-- MySQL: Same functionality with GROUP_CONCAT
SELECT 
    c.category_name,
    COUNT(p.product_id) as product_count,
    GROUP_CONCAT(p.product_name ORDER BY p.product_name SEPARATOR ', ') as product_list
FROM categories c
JOIN products p ON c.category_id = p.category_id
WHERE p.status = 'active'
GROUP BY c.category_id, c.category_name
ORDER BY product_count DESC;

-- Customer order history summary
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(o.order_id) as order_count,
    SUM(o.total_amount) as total_spent,
    STRING_AGG(
        o.order_id::text || ' ($' || o.total_amount || ')',
        ', ' 
        ORDER BY o.order_date DESC
    ) as order_history
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(o.order_id) <= 5  -- Customers with few orders
ORDER BY total_spent DESC;
```

---

## 🔄 Aggregate Functions with Window Functions

### Running Totals and Cumulative Aggregates

**1. Running Totals:**
```sql
-- Daily sales with running total
SELECT 
    order_date,
    daily_revenue,
    SUM(daily_revenue) OVER (
        ORDER BY order_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total,
    
    -- Running average
    AVG(daily_revenue) OVER (
        ORDER BY order_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_average
FROM (
    SELECT 
        DATE(order_date) as order_date,
        SUM(total_amount) as daily_revenue
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE(order_date)
) daily_sales
ORDER BY order_date;
```

**2. Ranking with Aggregates:**
```sql
-- Top customers by spending with rankings
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    SUM(o.total_amount) as total_spent,
    COUNT(o.order_id) as order_count,
    AVG(o.total_amount) as avg_order_value,
    
    -- Rankings
    RANK() OVER (ORDER BY SUM(o.total_amount) DESC) as spending_rank,
    RANK() OVER (ORDER BY COUNT(o.order_id) DESC) as frequency_rank,
    RANK() OVER (ORDER BY AVG(o.total_amount) DESC) as avg_value_rank,
    
    -- Percentile rankings
    PERCENT_RANK() OVER (ORDER BY SUM(o.total_amount)) as spending_percentile
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;
```

---

## 💡 Real-World Aggregate Examples

### Example 1: Sales Performance Dashboard

```sql
-- Comprehensive sales dashboard with multiple aggregates
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', o.order_date) as month,
        COUNT(DISTINCT o.order_id) as order_count,
        COUNT(DISTINCT o.customer_id) as unique_customers,
        SUM(o.total_amount) as revenue,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.total_amount) as min_order_value,
        MAX(o.total_amount) as max_order_value,
        STDDEV(o.total_amount) as order_value_stddev
    FROM orders o
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o.order_date)
),
product_performance AS (
    SELECT 
        DATE_TRUNC('month', o.order_date) as month,
        COUNT(DISTINCT oi.product_id) as unique_products_sold,
        SUM(oi.quantity) as total_units_sold,
        AVG(oi.unit_price) as avg_unit_price
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', o.order_date)
)
SELECT 
    ms.month,
    TO_CHAR(ms.month, 'YYYY-MM') as month_label,
    
    -- Order metrics
    ms.order_count,
    ms.unique_customers,
    ms.revenue,
    ms.avg_order_value,
    ms.order_value_stddev,
    
    -- Product metrics
    pp.unique_products_sold,
    pp.total_units_sold,
    pp.avg_unit_price,
    
    -- Calculated metrics
    ROUND(ms.revenue / ms.order_count, 2) as revenue_per_order,
    ROUND(ms.revenue / ms.unique_customers, 2) as revenue_per_customer,
    ROUND(pp.total_units_sold::float / ms.order_count, 2) as units_per_order,
    
    -- Growth metrics (compared to previous month)
    LAG(ms.revenue) OVER (ORDER BY ms.month) as prev_month_revenue,
    ROUND(
        (ms.revenue - LAG(ms.revenue) OVER (ORDER BY ms.month)) / 
        LAG(ms.revenue) OVER (ORDER BY ms.month) * 100, 2
    ) as revenue_growth_percent
FROM monthly_sales ms
JOIN product_performance pp ON ms.month = pp.month
ORDER BY ms.month DESC;
```

### Example 2: Customer Segmentation Analysis

```sql
-- RFM Analysis using aggregates
WITH customer_rfm AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        
        -- Recency: Days since last order
        CURRENT_DATE - MAX(o.order_date) as days_since_last_order,
        
        -- Frequency: Number of orders
        COUNT(o.order_id) as order_frequency,
        
        -- Monetary: Total amount spent
        SUM(o.total_amount) as total_monetary_value,
        AVG(o.total_amount) as avg_order_value,
        
        -- Additional metrics
        MIN(o.order_date) as first_order_date,
        MAX(o.order_date) as last_order_date,
        MAX(o.order_date) - MIN(o.order_date) as customer_lifespan_days
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status IN ('completed', 'delivered')
    GROUP BY c.customer_id, c.first_name, c.last_name, c.email
),
rfm_scores AS (
    SELECT 
        *,
        -- Recency score (lower days = higher score)
        CASE 
            WHEN days_since_last_order <= 30 THEN 5
            WHEN days_since_last_order <= 60 THEN 4
            WHEN days_since_last_order <= 90 THEN 3
            WHEN days_since_last_order <= 180 THEN 2
            ELSE 1
        END as recency_score,
        
        -- Frequency score
        CASE 
            WHEN order_frequency >= 20 THEN 5
            WHEN order_frequency >= 10 THEN 4
            WHEN order_frequency >= 5 THEN 3
            WHEN order_frequency >= 2 THEN 2
            ELSE 1
        END as frequency_score,
        
        -- Monetary score
        CASE 
            WHEN total_monetary_value >= 2000 THEN 5
            WHEN total_monetary_value >= 1000 THEN 4
            WHEN total_monetary_value >= 500 THEN 3
            WHEN total_monetary_value >= 100 THEN 2
            ELSE 1
        END as monetary_score
    FROM customer_rfm
)
SELECT 
    -- Customer segments based on RFM scores
    CASE 
        WHEN recency_score >= 4 AND frequency_score >= 4 AND monetary_score >= 4 THEN 'Champions'
        WHEN recency_score >= 3 AND frequency_score >= 3 AND monetary_score >= 3 THEN 'Loyal Customers'
        WHEN recency_score >= 4 AND frequency_score <= 2 THEN 'New Customers'
        WHEN recency_score <= 2 AND frequency_score >= 3 AND monetary_score >= 3 THEN 'At Risk'
        WHEN recency_score <= 2 AND frequency_score <= 2 THEN 'Lost Customers'
        WHEN frequency_score >= 3 AND monetary_score <= 2 THEN 'Price Sensitive'
        ELSE 'Others'
    END as customer_segment,
    
    COUNT(*) as customer_count,
    AVG(total_monetary_value) as avg_monetary_value,
    AVG(order_frequency) as avg_frequency,
    AVG(days_since_last_order) as avg_recency,
    SUM(total_monetary_value) as segment_total_value,
    
    -- Segment percentages
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2
    ) as segment_percentage
FROM rfm_scores
GROUP BY customer_segment
ORDER BY segment_total_value DESC;
```

### Example 3: Product Performance Analysis

```sql
-- Comprehensive product analysis with multiple aggregates
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.price as current_price,
    p.stock_quantity,
    
    -- Sales metrics (last 12 months)
    COALESCE(sales.units_sold, 0) as units_sold_12m,
    COALESCE(sales.revenue, 0) as revenue_12m,
    COALESCE(sales.order_count, 0) as order_count_12m,
    COALESCE(sales.unique_customers, 0) as unique_customers_12m,
    COALESCE(sales.avg_unit_price, p.price) as avg_selling_price,
    
    -- Review metrics
    COALESCE(reviews.review_count, 0) as review_count,
    COALESCE(reviews.avg_rating, 0) as avg_rating,
    COALESCE(reviews.rating_stddev, 0) as rating_stddev,
    
    -- Performance calculations
    CASE 
        WHEN sales.units_sold > 0 THEN 
            ROUND(sales.revenue / sales.units_sold, 2)
        ELSE p.price
    END as actual_avg_price,
    
    CASE 
        WHEN sales.units_sold > 0 THEN 
            ROUND((p.price - sales.avg_unit_price) / p.price * 100, 2)
        ELSE 0
    END as avg_discount_percent,
    
    -- Inventory turnover (annual rate)
    CASE 
        WHEN p.stock_quantity > 0 AND sales.units_sold > 0 THEN 
            ROUND(sales.units_sold::float / p.stock_quantity, 2)
        ELSE 0
    END as inventory_turnover_rate,
    
    -- Performance categories
    CASE 
        WHEN COALESCE(sales.revenue, 0) = 0 THEN 'No Sales'
        WHEN sales.revenue > 10000 THEN 'Top Performer'
        WHEN sales.revenue > 5000 THEN 'Good Performer'
        WHEN sales.revenue > 1000 THEN 'Average Performer'
        ELSE 'Poor Performer'
    END as performance_category,
    
    -- Stock status
    CASE 
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        WHEN p.stock_quantity < 10 THEN 'Low Stock'
        WHEN sales.units_sold > 0 AND 
             (p.stock_quantity::float / (sales.units_sold / 12.0)) < 30 THEN 'Fast Moving'
        WHEN sales.units_sold > 0 AND 
             (p.stock_quantity::float / (sales.units_sold / 12.0)) > 180 THEN 'Slow Moving'
        ELSE 'Normal Stock'
    END as stock_status
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as units_sold,
        SUM(oi.quantity * oi.unit_price) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count,
        COUNT(DISTINCT o.customer_id) as unique_customers,
        AVG(oi.unit_price) as avg_unit_price
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating,
        STDDEV(rating) as rating_stddev
    FROM reviews
    WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY product_id
) reviews ON p.product_id = reviews.product_id
WHERE p.status = 'active'
ORDER BY revenue_12m DESC;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between COUNT(*) and COUNT(column)?"**
   - COUNT(*): Counts all rows, including those with NULL values
   - COUNT(column): Counts only non-NULL values in the specified column
   - COUNT(DISTINCT column): Counts unique non-NULL values

2. **"How do aggregate functions handle NULL values?"**
   - Most aggregates (SUM, AVG, MIN, MAX) ignore NULL values
   - COUNT(*) includes rows with NULLs, COUNT(column) excludes them
   - If all values are NULL, SUM returns NULL, COUNT returns 0

3. **"When would you use HAVING vs WHERE?"**
   - WHERE: Filters rows before grouping and aggregation
   - HAVING: Filters groups after aggregation
   - HAVING can use aggregate functions, WHERE cannot

### Performance Best Practices:

1. **Index Strategy for Aggregates:**
   ```sql
   -- Create indexes for GROUP BY columns
   CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
   CREATE INDEX idx_order_items_product ON order_items(product_id);
   
   -- Covering indexes for common aggregate queries
   CREATE INDEX idx_orders_status_date_amount ON orders(status, order_date, total_amount);
   ```

2. **Efficient Aggregate Queries:**
   ```sql
   -- Good: Filter before aggregating
   SELECT customer_id, SUM(total_amount)
   FROM orders 
   WHERE status = 'completed'  -- Filter first
   GROUP BY customer_id;
   
   -- Avoid: Aggregating then filtering
   SELECT customer_id, total_spent
   FROM (
       SELECT customer_id, SUM(total_amount) as total_spent
       FROM orders
       GROUP BY customer_id
   ) t
   WHERE total_spent > 1000;  -- Better to use HAVING
   ```

3. **Use Appropriate Data Types:**
   ```sql
   -- Use DECIMAL for monetary calculations
   SELECT SUM(price::DECIMAL(10,2)) FROM products;
   
   -- Be careful with integer division
   SELECT AVG(price::FLOAT) FROM products;  -- Avoid integer truncation
   ```

---

## ⚠️ Things to Watch Out For

### 1. **NULL Handling Gotchas**
```sql
-- Problem: Unexpected results with NULLs
SELECT AVG(rating) FROM reviews;  -- Ignores NULL ratings

-- Solution: Handle NULLs explicitly
SELECT 
    AVG(rating) as avg_rating_excluding_nulls,
    AVG(COALESCE(rating, 0)) as avg_rating_including_nulls_as_zero,
    COUNT(*) as total_reviews,
    COUNT(rating) as reviews_with_rating
FROM reviews;
```

### 2. **Integer Division Issues**
```sql
-- Problem: Integer division truncates
SELECT 5 / 2;  -- Returns 2, not 2.5

-- Solution: Cast to decimal/float
SELECT 5.0 / 2;  -- Returns 2.5
SELECT 5::FLOAT / 2;  -- PostgreSQL
SELECT CAST(5 AS FLOAT) / 2;  -- Standard SQL
```

### 3. **GROUP BY Requirements**
```sql
-- Error: Non-aggregated column not in GROUP BY
SELECT customer_id, order_date, COUNT(*)
FROM orders
GROUP BY customer_id;  -- order_date must be in GROUP BY or aggregated

-- Correct: Include all non-aggregated columns
SELECT customer_id, order_date, COUNT(*)
FROM orders
GROUP BY customer_id, order_date;

-- Or aggregate the column
SELECT customer_id, MAX(order_date), COUNT(*)
FROM orders
GROUP BY customer_id;
```

### 4. **Performance with Large Datasets**
```sql
-- Slow: Aggregating without proper indexes
SELECT category_id, AVG(price)
FROM products
GROUP BY category_id;  -- Needs index on category_id

-- Fast: With proper index
CREATE INDEX idx_products_category ON products(category_id);
```

### 5. **Precision Issues with Averages**
```sql
-- Problem: Precision loss
SELECT AVG(price) FROM products;  -- May lose precision

-- Solution: Use appropriate precision
SELECT ROUND(AVG(price), 2) FROM products;
SELECT AVG(price::DECIMAL(10,2)) FROM products;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Subqueries and Nested Queries** - powerful techniques for creating complex queries that use the results of one query within another. You'll learn about correlated subqueries, EXISTS clauses, and how to break down complex problems into manageable parts.

---

## 📝 Quick Practice

Try these aggregate function exercises:

1. **Basic Aggregates**: Calculate total sales, average order value, and customer count for the last quarter
2. **Conditional Aggregates**: Count orders by status and calculate completion rate
3. **Grouped Aggregates**: Find the top 5 product categories by revenue
4. **Statistical Analysis**: Calculate price distribution (mean, median, standard deviation) by category
5. **Customer Analysis**: Identify customers in the top 10% by spending using percentiles

Consider:
- How do you handle NULL values in your calculations?
- What indexes would improve performance?
- How do you ensure precision in monetary calculations?
- What business insights can you derive from the aggregated data?