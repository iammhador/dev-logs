# Chapter 10: Window Functions

## 📚 What You'll Learn

Window functions are powerful analytical tools that allow you to perform calculations across a set of rows related to the current row, without collapsing the result set like aggregate functions do. They're essential for advanced data analysis, ranking, running totals, and comparative analytics.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand what window functions are and how they differ from aggregate functions
- Master ranking functions (ROW_NUMBER, RANK, DENSE_RANK)
- Use analytical functions (LAG, LEAD, FIRST_VALUE, LAST_VALUE)
- Create running totals and moving averages
- Apply window functions for business analytics
- Optimize window function performance

---

## 🔍 Concept Explanation

### What are Window Functions?

Window functions perform calculations across a set of rows that are somehow related to the current row. Unlike aggregate functions that return a single value for a group of rows, window functions return a value for each row while maintaining the detail level of the original query.

**Key Components:**
- **OVER clause**: Defines the window of rows
- **PARTITION BY**: Divides rows into groups (like GROUP BY but doesn't collapse rows)
- **ORDER BY**: Defines the order within each partition
- **Frame specification**: Defines which rows within the partition to include

### Basic Syntax:
```sql
function_name() OVER (
    [PARTITION BY column1, column2, ...]
    [ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...]
    [ROWS|RANGE frame_specification]
)
```

---

## 🛠️ Syntax Comparison

### MySQL vs PostgreSQL Window Functions

Both MySQL (8.0+) and PostgreSQL support comprehensive window functions with similar syntax:

| Feature | MySQL 8.0+ | PostgreSQL |
|---------|------------|------------|
| Basic Window Functions | ✅ | ✅ |
| Ranking Functions | ✅ | ✅ |
| Analytical Functions | ✅ | ✅ |
| Frame Specifications | ✅ | ✅ |
| Named Windows | ✅ | ✅ |
| Advanced Frames | Limited | Full Support |

**Note**: MySQL versions before 8.0 don't support window functions.

---

## 📊 Ranking Functions

### ROW_NUMBER()

Assigns a unique sequential number to each row within a partition.

```sql
-- Basic row numbering
SELECT 
    customer_id,
    first_name,
    last_name,
    order_date,
    total_amount,
    ROW_NUMBER() OVER (ORDER BY order_date) as order_sequence
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
ORDER BY order_date;

-- Row numbering within partitions
SELECT 
    customer_id,
    first_name,
    last_name,
    order_date,
    total_amount,
    ROW_NUMBER() OVER (
        PARTITION BY customer_id 
        ORDER BY order_date
    ) as customer_order_number
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.status = 'completed'
ORDER BY customer_id, order_date;
```

### RANK() and DENSE_RANK()

**RANK()**: Assigns ranks with gaps for ties
**DENSE_RANK()**: Assigns ranks without gaps for ties

```sql
-- Product ranking by sales within categories
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    sales.total_revenue,
    sales.units_sold,
    RANK() OVER (
        PARTITION BY c.category_name 
        ORDER BY sales.total_revenue DESC
    ) as revenue_rank,
    DENSE_RANK() OVER (
        PARTITION BY c.category_name 
        ORDER BY sales.total_revenue DESC
    ) as revenue_dense_rank,
    ROW_NUMBER() OVER (
        PARTITION BY c.category_name 
        ORDER BY sales.total_revenue DESC
    ) as revenue_row_number
FROM products p
JOIN categories c ON p.category_id = c.category_id
JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity * oi.unit_price) as total_revenue,
        SUM(oi.quantity) as units_sold
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.status IN ('completed', 'delivered')
      AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY oi.product_id
) sales ON p.product_id = sales.product_id
WHERE p.status = 'active'
ORDER BY c.category_name, sales.total_revenue DESC;
```

### PERCENT_RANK() and CUME_DIST()

```sql
-- Customer spending percentiles
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    customer_stats.total_spent,
    customer_stats.order_count,
    PERCENT_RANK() OVER (ORDER BY customer_stats.total_spent) as spending_percentile,
    CUME_DIST() OVER (ORDER BY customer_stats.total_spent) as cumulative_distribution,
    CASE 
        WHEN PERCENT_RANK() OVER (ORDER BY customer_stats.total_spent) >= 0.9 THEN 'Top 10%'
        WHEN PERCENT_RANK() OVER (ORDER BY customer_stats.total_spent) >= 0.75 THEN 'Top 25%'
        WHEN PERCENT_RANK() OVER (ORDER BY customer_stats.total_spent) >= 0.5 THEN 'Top 50%'
        ELSE 'Bottom 50%'
    END as spending_tier
FROM customers c
JOIN (
    SELECT 
        customer_id,
        COUNT(order_id) as order_count,
        SUM(total_amount) as total_spent
    FROM orders
    WHERE status = 'completed'
    GROUP BY customer_id
    HAVING COUNT(order_id) >= 1
) customer_stats ON c.customer_id = customer_stats.customer_id
WHERE c.status = 'active'
ORDER BY customer_stats.total_spent DESC;
```

---

## 📈 Analytical Functions

### LAG() and LEAD()

Access data from previous or next rows within the same result set.

```sql
-- Monthly sales comparison
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', order_date) as month,
        COUNT(order_id) as order_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '24 months'
    GROUP BY DATE_TRUNC('month', order_date)
    ORDER BY month
)
SELECT 
    month,
    order_count,
    total_revenue,
    avg_order_value,
    LAG(total_revenue, 1) OVER (ORDER BY month) as prev_month_revenue,
    LEAD(total_revenue, 1) OVER (ORDER BY month) as next_month_revenue,
    total_revenue - LAG(total_revenue, 1) OVER (ORDER BY month) as revenue_change,
    ROUND(
        ((total_revenue - LAG(total_revenue, 1) OVER (ORDER BY month)) / 
         NULLIF(LAG(total_revenue, 1) OVER (ORDER BY month), 0)) * 100, 2
    ) as revenue_change_percent,
    LAG(total_revenue, 12) OVER (ORDER BY month) as same_month_last_year,
    CASE 
        WHEN LAG(total_revenue, 12) OVER (ORDER BY month) IS NOT NULL THEN
            ROUND(
                ((total_revenue - LAG(total_revenue, 12) OVER (ORDER BY month)) / 
                 LAG(total_revenue, 12) OVER (ORDER BY month)) * 100, 2
            )
        ELSE NULL
    END as yoy_growth_percent
FROM monthly_sales
ORDER BY month;
```

### FIRST_VALUE() and LAST_VALUE()

```sql
-- Customer order analysis with first and last orders
SELECT 
    c.customer_id,
    c.first_name,
    c.last_name,
    o.order_id,
    o.order_date,
    o.total_amount,
    FIRST_VALUE(o.order_date) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS UNBOUNDED PRECEDING
    ) as first_order_date,
    FIRST_VALUE(o.total_amount) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS UNBOUNDED PRECEDING
    ) as first_order_amount,
    LAST_VALUE(o.order_date) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_order_date,
    LAST_VALUE(o.total_amount) OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_order_amount,
    ROW_NUMBER() OVER (
        PARTITION BY c.customer_id 
        ORDER BY o.order_date
    ) as order_sequence
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.status = 'completed'
  AND c.status = 'active'
ORDER BY c.customer_id, o.order_date;
```

---

## 🔢 Running Totals and Moving Averages

### Running Totals

```sql
-- Daily sales with running totals
WITH daily_sales AS (
    SELECT 
        DATE(order_date) as sale_date,
        COUNT(order_id) as daily_orders,
        SUM(total_amount) as daily_revenue
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE(order_date)
    ORDER BY sale_date
)
SELECT 
    sale_date,
    daily_orders,
    daily_revenue,
    SUM(daily_orders) OVER (
        ORDER BY sale_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total_orders,
    SUM(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS UNBOUNDED PRECEDING
    ) as cumulative_avg_revenue
FROM daily_sales
ORDER BY sale_date;
```

### Moving Averages

```sql
-- 7-day and 30-day moving averages
WITH daily_sales AS (
    SELECT 
        DATE(order_date) as sale_date,
        COUNT(order_id) as daily_orders,
        SUM(total_amount) as daily_revenue
    FROM orders
    WHERE status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY DATE(order_date)
    ORDER BY sale_date
)
SELECT 
    sale_date,
    daily_orders,
    daily_revenue,
    AVG(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_avg,
    AVG(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
    ) as thirty_day_avg,
    SUM(daily_revenue) OVER (
        ORDER BY sale_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as seven_day_total,
    COUNT(*) OVER (
        ORDER BY sale_date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as days_in_7day_window
FROM daily_sales
ORDER BY sale_date;
```

---

## 🎯 Frame Specifications

### Understanding Window Frames

Window frames define which rows within the partition to include in the calculation:

```sql
-- Different frame specifications
SELECT 
    order_date,
    total_amount,
    -- Default frame: RANGE UNBOUNDED PRECEDING
    SUM(total_amount) OVER (ORDER BY order_date) as running_total_default,
    
    -- Explicit ROWS frame
    SUM(total_amount) OVER (
        ORDER BY order_date 
        ROWS UNBOUNDED PRECEDING
    ) as running_total_rows,
    
    -- Moving window: last 3 rows including current
    SUM(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as last_3_orders_total,
    
    -- Centered window: 1 before, current, 1 after
    AVG(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) as centered_avg,
    
    -- Future window: current and next 2 rows
    MAX(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING
    ) as max_next_3_orders
FROM orders
WHERE status = 'completed'
  AND customer_id = 1
ORDER BY order_date;
```

### ROWS vs RANGE

```sql
-- Demonstrating ROWS vs RANGE with duplicate dates
SELECT 
    order_date,
    total_amount,
    order_id,
    -- ROWS: Physical row-based window
    SUM(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) as rows_sum,
    
    -- RANGE: Logical value-based window (includes all rows with same order_date)
    SUM(total_amount) OVER (
        ORDER BY order_date 
        RANGE BETWEEN INTERVAL '1 day' PRECEDING AND INTERVAL '1 day' FOLLOWING
    ) as range_sum
FROM orders
WHERE status = 'completed'
  AND order_date >= '2024-01-01'
  AND order_date <= '2024-01-10'
ORDER BY order_date, order_id;
```

---

## 🏢 Real-World Business Examples

### Example 1: Sales Performance Dashboard

```sql
-- Comprehensive sales performance analysis
WITH sales_data AS (
    SELECT 
        DATE_TRUNC('month', o.order_date) as month,
        c.city,
        c.state,
        COUNT(o.order_id) as orders,
        SUM(o.total_amount) as revenue,
        COUNT(DISTINCT o.customer_id) as unique_customers,
        AVG(o.total_amount) as avg_order_value
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.status = 'completed'
      AND o.order_date >= CURRENT_DATE - INTERVAL '24 months'
    GROUP BY DATE_TRUNC('month', o.order_date), c.city, c.state
),
ranked_cities AS (
    SELECT 
        month,
        city,
        state,
        orders,
        revenue,
        unique_customers,
        avg_order_value,
        -- Ranking within each month
        RANK() OVER (
            PARTITION BY month 
            ORDER BY revenue DESC
        ) as monthly_revenue_rank,
        
        -- Running totals for each city
        SUM(revenue) OVER (
            PARTITION BY city, state 
            ORDER BY month 
            ROWS UNBOUNDED PRECEDING
        ) as cumulative_revenue,
        
        -- Month-over-month comparison
        LAG(revenue, 1) OVER (
            PARTITION BY city, state 
            ORDER BY month
        ) as prev_month_revenue,
        
        -- 3-month moving average
        AVG(revenue) OVER (
            PARTITION BY city, state 
            ORDER BY month 
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ) as three_month_avg,
        
        -- Year-over-year comparison
        LAG(revenue, 12) OVER (
            PARTITION BY city, state 
            ORDER BY month
        ) as same_month_last_year
    FROM sales_data
)
SELECT 
    month,
    city,
    state,
    orders,
    revenue,
    unique_customers,
    avg_order_value,
    monthly_revenue_rank,
    cumulative_revenue,
    prev_month_revenue,
    revenue - prev_month_revenue as mom_change,
    CASE 
        WHEN prev_month_revenue > 0 THEN
            ROUND(((revenue - prev_month_revenue) / prev_month_revenue) * 100, 2)
        ELSE NULL
    END as mom_change_percent,
    three_month_avg,
    same_month_last_year,
    CASE 
        WHEN same_month_last_year > 0 THEN
            ROUND(((revenue - same_month_last_year) / same_month_last_year) * 100, 2)
        ELSE NULL
    END as yoy_change_percent
FROM ranked_cities
WHERE monthly_revenue_rank <= 10  -- Top 10 cities by revenue each month
ORDER BY month DESC, monthly_revenue_rank;
```

### Example 2: Customer Lifecycle Analysis

```sql
-- Customer journey and lifecycle analysis
WITH customer_orders AS (
    SELECT 
        c.customer_id,
        c.first_name,
        c.last_name,
        c.email,
        c.created_at as registration_date,
        o.order_id,
        o.order_date,
        o.total_amount,
        ROW_NUMBER() OVER (
            PARTITION BY c.customer_id 
            ORDER BY o.order_date
        ) as order_number
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
      AND c.status = 'active'
),
customer_metrics AS (
    SELECT 
        customer_id,
        first_name,
        last_name,
        email,
        registration_date,
        order_id,
        order_date,
        total_amount,
        order_number,
        
        -- First order details
        FIRST_VALUE(order_date) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date 
            ROWS UNBOUNDED PRECEDING
        ) as first_order_date,
        
        FIRST_VALUE(total_amount) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date 
            ROWS UNBOUNDED PRECEDING
        ) as first_order_amount,
        
        -- Running customer totals
        SUM(total_amount) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date 
            ROWS UNBOUNDED PRECEDING
        ) as cumulative_spent,
        
        -- Average order value up to this point
        AVG(total_amount) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date 
            ROWS UNBOUNDED PRECEDING
        ) as avg_order_value_to_date,
        
        -- Days between orders
        LAG(order_date, 1) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date
        ) as prev_order_date,
        
        -- Time to next order
        LEAD(order_date, 1) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date
        ) as next_order_date,
        
        -- Last order in sequence
        LAST_VALUE(order_date) OVER (
            PARTITION BY customer_id 
            ORDER BY order_date 
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        ) as last_order_date,
        
        -- Total orders for customer
        COUNT(*) OVER (
            PARTITION BY customer_id
        ) as total_orders
    FROM customer_orders
)
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    registration_date,
    order_number,
    order_date,
    total_amount,
    first_order_date,
    first_order_amount,
    cumulative_spent,
    avg_order_value_to_date,
    
    -- Days since registration to first order
    CASE 
        WHEN order_number = 1 THEN 
            order_date - registration_date
        ELSE NULL
    END as days_to_first_order,
    
    -- Days between consecutive orders
    CASE 
        WHEN prev_order_date IS NOT NULL THEN 
            order_date - prev_order_date
        ELSE NULL
    END as days_since_last_order,
    
    -- Customer lifecycle stage
    CASE 
        WHEN order_number = 1 THEN 'New Customer'
        WHEN order_number = 2 THEN 'Repeat Customer'
        WHEN order_number >= 3 AND order_number <= 5 THEN 'Regular Customer'
        WHEN order_number > 5 THEN 'Loyal Customer'
    END as lifecycle_stage,
    
    -- Customer value tier based on cumulative spending
    CASE 
        WHEN cumulative_spent >= 2000 THEN 'VIP'
        WHEN cumulative_spent >= 1000 THEN 'Premium'
        WHEN cumulative_spent >= 500 THEN 'Regular'
        ELSE 'Basic'
    END as value_tier,
    
    total_orders,
    last_order_date,
    CURRENT_DATE - last_order_date as days_since_last_order_overall
FROM customer_metrics
ORDER BY customer_id, order_number;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between RANK() and DENSE_RANK()?"**
   - RANK() leaves gaps after ties (1, 2, 2, 4)
   - DENSE_RANK() doesn't leave gaps (1, 2, 2, 3)
   - ROW_NUMBER() assigns unique numbers regardless of ties

2. **"How do you calculate a running total?"**
   - Use SUM() with ROWS UNBOUNDED PRECEDING
   - Explain frame specifications
   - Discuss performance considerations

3. **"When would you use LAG() vs LEAD()?"**
   - LAG(): Compare with previous values (month-over-month growth)
   - LEAD(): Look ahead to future values (forecasting)
   - Both useful for time series analysis

4. **"How do you handle NULL values in window functions?"**
   - Most window functions ignore NULLs by default
   - Use COALESCE() or CASE statements for explicit handling
   - Consider IGNORE NULLS clause where supported

### Performance Best Practices:

1. **Use appropriate indexes for PARTITION BY and ORDER BY columns**
2. **Limit the window frame size when possible**
3. **Consider using named windows for repeated window specifications**
4. **Be careful with LAST_VALUE() - specify proper frame bounds**
5. **Use LIMIT with window functions for large datasets**

---

## ⚠️ Things to Watch Out For

### 1. **LAST_VALUE() Default Frame**
```sql
-- Problem: Default frame only goes to current row
SELECT 
    order_date,
    total_amount,
    LAST_VALUE(total_amount) OVER (ORDER BY order_date) as last_value_wrong
FROM orders;

-- Solution: Specify proper frame
SELECT 
    order_date,
    total_amount,
    LAST_VALUE(total_amount) OVER (
        ORDER BY order_date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) as last_value_correct
FROM orders;
```

### 2. **Performance with Large Datasets**
```sql
-- Slow: No indexes on window columns
SELECT 
    customer_id,
    order_date,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date)
FROM orders;  -- Millions of rows

-- Better: Create appropriate indexes
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
```

### 3. **NULL Handling in Analytical Functions**
```sql
-- Be aware of NULL behavior
SELECT 
    order_date,
    total_amount,
    LAG(total_amount, 1) OVER (ORDER BY order_date) as prev_amount,
    LAG(total_amount, 1, 0) OVER (ORDER BY order_date) as prev_amount_default_0
FROM orders
WHERE customer_id = 1;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Indexes and Query Optimization** - crucial topics for improving database performance. You'll learn about different index types, how to analyze query execution plans, and optimization strategies for complex queries.

---

## 📝 Quick Practice

Try these window function exercises:

1. **Ranking**: Find the top 3 products by sales in each category
2. **Running Totals**: Calculate cumulative sales by month
3. **Moving Averages**: Create 7-day moving average of daily orders
4. **Analytical Functions**: Find customers who increased their order frequency
5. **Complex Analysis**: Build a customer churn prediction model using window functions

Consider:
- When to use different ranking functions
- How frame specifications affect results
- Performance implications of window functions
- Real-world applications in business analytics