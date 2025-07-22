# Chapter 12: Stored Procedures and Functions

## 📚 What You'll Learn

Stored procedures and functions are reusable code blocks stored in the database that can encapsulate business logic, improve performance, and enhance security. This chapter covers how to create, manage, and optimize stored procedures and functions in both MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand the difference between stored procedures and functions
- Create and manage stored procedures and functions
- Use parameters, variables, and control structures
- Handle exceptions and errors
- Implement business logic in the database layer
- Understand security and performance implications

---

## 🔍 Concept Explanation

### Stored Procedures vs Functions

| Feature | Stored Procedure | Function |
|---------|------------------|----------|
| **Return Value** | Optional (via OUT parameters) | Must return a value |
| **Usage** | Called with CALL statement | Used in SELECT, WHERE, etc. |
| **Side Effects** | Can modify data | Should be read-only (best practice) |
| **Transaction Control** | Can use COMMIT/ROLLBACK | Limited transaction control |
| **Parameters** | IN, OUT, INOUT | IN parameters only (usually) |

### Benefits:
- **Performance**: Compiled once, executed many times
- **Security**: Controlled data access, SQL injection prevention
- **Maintainability**: Centralized business logic
- **Network Traffic**: Reduced client-server communication
- **Consistency**: Standardized operations across applications

---

## 🛠️ Syntax Comparison

### MySQL vs PostgreSQL Differences

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Language** | SQL, limited procedural | SQL, PL/pgSQL, Python, etc. |
| **Function Types** | Limited | Scalar, Table, Aggregate |
| **Exception Handling** | DECLARE HANDLER | BEGIN/EXCEPTION blocks |
| **Cursors** | ✅ | ✅ |
| **Triggers** | ✅ | ✅ (more advanced) |
| **Packages** | ❌ | ✅ (Schemas) |
| **Overloading** | ❌ | ✅ |

---

## 📝 Basic Stored Procedures

### MySQL Stored Procedures

```sql
-- Simple procedure without parameters
DELIMITER //
CREATE PROCEDURE GetCustomerCount()
BEGIN
    SELECT COUNT(*) as total_customers FROM customers WHERE status = 'active';
END //
DELIMITER ;

-- Call the procedure
CALL GetCustomerCount();

-- Procedure with IN parameters
DELIMITER //
CREATE PROCEDURE GetCustomerOrders(
    IN customer_id_param INT,
    IN start_date DATE,
    IN end_date DATE
)
BEGIN
    SELECT 
        o.order_id,
        o.order_date,
        o.total_amount,
        o.status
    FROM orders o
    WHERE o.customer_id = customer_id_param
      AND o.order_date BETWEEN start_date AND end_date
    ORDER BY o.order_date DESC;
END //
DELIMITER ;

-- Call with parameters
CALL GetCustomerOrders(123, '2024-01-01', '2024-12-31');

-- Procedure with OUT parameters
DELIMITER //
CREATE PROCEDURE GetCustomerStats(
    IN customer_id_param INT,
    OUT total_orders INT,
    OUT total_spent DECIMAL(10,2),
    OUT avg_order_value DECIMAL(10,2)
)
BEGIN
    SELECT 
        COUNT(order_id),
        COALESCE(SUM(total_amount), 0),
        COALESCE(AVG(total_amount), 0)
    INTO total_orders, total_spent, avg_order_value
    FROM orders
    WHERE customer_id = customer_id_param
      AND status = 'completed';
END //
DELIMITER ;

-- Call and get output
CALL GetCustomerStats(123, @orders, @spent, @avg);
SELECT @orders as total_orders, @spent as total_spent, @avg as avg_order_value;
```

### PostgreSQL Stored Procedures

```sql
-- Simple procedure (PostgreSQL 11+)
CREATE OR REPLACE PROCEDURE get_customer_count()
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'Total active customers: %', (SELECT COUNT(*) FROM customers WHERE status = 'active');
END;
$$;

-- Call the procedure
CALL get_customer_count();

-- Procedure with parameters
CREATE OR REPLACE PROCEDURE get_customer_orders(
    customer_id_param INT,
    start_date DATE,
    end_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    order_record RECORD;
BEGIN
    FOR order_record IN
        SELECT 
            o.order_id,
            o.order_date,
            o.total_amount,
            o.status
        FROM orders o
        WHERE o.customer_id = customer_id_param
          AND o.order_date BETWEEN start_date AND end_date
        ORDER BY o.order_date DESC
    LOOP
        RAISE NOTICE 'Order ID: %, Date: %, Amount: %', 
            order_record.order_id, 
            order_record.order_date, 
            order_record.total_amount;
    END LOOP;
END;
$$;

-- Call with parameters
CALL get_customer_orders(123, '2024-01-01', '2024-12-31');

-- Procedure with INOUT parameters
CREATE OR REPLACE PROCEDURE get_customer_stats(
    INOUT customer_id_param INT,
    OUT total_orders INT,
    OUT total_spent DECIMAL(10,2),
    OUT avg_order_value DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT 
        COUNT(order_id),
        COALESCE(SUM(total_amount), 0),
        COALESCE(AVG(total_amount), 0)
    INTO total_orders, total_spent, avg_order_value
    FROM orders
    WHERE customer_id = customer_id_param
      AND status = 'completed';
END;
$$;

-- Call and get output
CALL get_customer_stats(123, NULL, NULL, NULL);
```

---

## 🔧 Functions

### MySQL Functions

```sql
-- Scalar function
DELIMITER //
CREATE FUNCTION CalculateDiscount(
    order_amount DECIMAL(10,2),
    customer_tier VARCHAR(20)
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE discount_rate DECIMAL(5,4) DEFAULT 0;
    
    CASE customer_tier
        WHEN 'VIP' THEN SET discount_rate = 0.15;
        WHEN 'Premium' THEN SET discount_rate = 0.10;
        WHEN 'Regular' THEN SET discount_rate = 0.05;
        ELSE SET discount_rate = 0;
    END CASE;
    
    IF order_amount >= 1000 THEN
        SET discount_rate = discount_rate + 0.05;
    END IF;
    
    RETURN order_amount * discount_rate;
END //
DELIMITER ;

-- Use the function
SELECT 
    order_id,
    total_amount,
    CalculateDiscount(total_amount, 'VIP') as discount_amount,
    total_amount - CalculateDiscount(total_amount, 'VIP') as final_amount
FROM orders
WHERE customer_id = 123;

-- Function with complex logic
DELIMITER //
CREATE FUNCTION GetCustomerTier(
    customer_id_param INT
) RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE total_spent DECIMAL(10,2) DEFAULT 0;
    DECLARE order_count INT DEFAULT 0;
    DECLARE tier VARCHAR(20) DEFAULT 'Basic';
    
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(order_id)
    INTO total_spent, order_count
    FROM orders
    WHERE customer_id = customer_id_param
      AND status = 'completed'
      AND order_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH);
    
    IF total_spent >= 5000 OR order_count >= 20 THEN
        SET tier = 'VIP';
    ELSEIF total_spent >= 2000 OR order_count >= 10 THEN
        SET tier = 'Premium';
    ELSEIF total_spent >= 500 OR order_count >= 3 THEN
        SET tier = 'Regular';
    END IF;
    
    RETURN tier;
END //
DELIMITER ;

-- Use in queries
SELECT 
    customer_id,
    first_name,
    last_name,
    GetCustomerTier(customer_id) as tier
FROM customers
WHERE status = 'active'
LIMIT 10;
```

### PostgreSQL Functions

```sql
-- Scalar function
CREATE OR REPLACE FUNCTION calculate_discount(
    order_amount DECIMAL(10,2),
    customer_tier VARCHAR(20)
) RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    discount_rate DECIMAL(5,4) := 0;
BEGIN
    CASE customer_tier
        WHEN 'VIP' THEN discount_rate := 0.15;
        WHEN 'Premium' THEN discount_rate := 0.10;
        WHEN 'Regular' THEN discount_rate := 0.05;
        ELSE discount_rate := 0;
    END CASE;
    
    IF order_amount >= 1000 THEN
        discount_rate := discount_rate + 0.05;
    END IF;
    
    RETURN order_amount * discount_rate;
END;
$$;

-- Use the function
SELECT 
    order_id,
    total_amount,
    calculate_discount(total_amount, 'VIP') as discount_amount,
    total_amount - calculate_discount(total_amount, 'VIP') as final_amount
FROM orders
WHERE customer_id = 123;

-- Table-valued function
CREATE OR REPLACE FUNCTION get_top_customers(
    limit_count INT DEFAULT 10
) RETURNS TABLE(
    customer_id INT,
    full_name TEXT,
    total_orders BIGINT,
    total_spent DECIMAL(10,2),
    avg_order_value DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.customer_id,
        c.first_name || ' ' || c.last_name as full_name,
        COUNT(o.order_id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
        AND o.status = 'completed'
        AND o.order_date >= CURRENT_DATE - INTERVAL '12 months'
    WHERE c.status = 'active'
    GROUP BY c.customer_id, c.first_name, c.last_name
    ORDER BY total_spent DESC
    LIMIT limit_count;
END;
$$;

-- Use table-valued function
SELECT * FROM get_top_customers(5);

-- Function with complex return type
CREATE TYPE customer_summary AS (
    customer_id INT,
    tier VARCHAR(20),
    total_spent DECIMAL(10,2),
    order_count INT,
    last_order_date DATE
);

CREATE OR REPLACE FUNCTION get_customer_summary(
    customer_id_param INT
) RETURNS customer_summary
LANGUAGE plpgsql
AS $$
DECLARE
    result customer_summary;
    total_spent DECIMAL(10,2);
    order_count INT;
BEGIN
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(order_id),
        MAX(order_date)
    INTO total_spent, order_count, result.last_order_date
    FROM orders
    WHERE customer_id = customer_id_param
      AND status = 'completed'
      AND order_date >= CURRENT_DATE - INTERVAL '12 months';
    
    result.customer_id := customer_id_param;
    result.total_spent := total_spent;
    result.order_count := order_count;
    
    -- Determine tier
    IF total_spent >= 5000 OR order_count >= 20 THEN
        result.tier := 'VIP';
    ELSIF total_spent >= 2000 OR order_count >= 10 THEN
        result.tier := 'Premium';
    ELSIF total_spent >= 500 OR order_count >= 3 THEN
        result.tier := 'Regular';
    ELSE
        result.tier := 'Basic';
    END IF;
    
    RETURN result;
END;
$$;

-- Use complex function
SELECT (get_customer_summary(123)).*;
```

---

## 🔄 Control Structures

### Conditional Logic

**MySQL:**
```sql
DELIMITER //
CREATE PROCEDURE ProcessOrder(
    IN order_id_param INT,
    OUT result_message VARCHAR(255)
)
BEGIN
    DECLARE order_status VARCHAR(20);
    DECLARE order_amount DECIMAL(10,2);
    DECLARE customer_credit DECIMAL(10,2);
    
    -- Get order details
    SELECT status, total_amount INTO order_status, order_amount
    FROM orders
    WHERE order_id = order_id_param;
    
    -- Check if order exists
    IF order_status IS NULL THEN
        SET result_message = 'Order not found';
    ELSEIF order_status != 'pending' THEN
        SET result_message = 'Order already processed';
    ELSE
        -- Get customer credit
        SELECT credit_limit INTO customer_credit
        FROM customers c
        JOIN orders o ON c.customer_id = o.customer_id
        WHERE o.order_id = order_id_param;
        
        IF order_amount <= customer_credit THEN
            UPDATE orders SET status = 'approved' WHERE order_id = order_id_param;
            SET result_message = 'Order approved';
        ELSE
            UPDATE orders SET status = 'rejected' WHERE order_id = order_id_param;
            SET result_message = 'Order rejected - insufficient credit';
        END IF;
    END IF;
END //
DELIMITER ;
```

**PostgreSQL:**
```sql
CREATE OR REPLACE FUNCTION process_order(
    order_id_param INT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    order_status VARCHAR(20);
    order_amount DECIMAL(10,2);
    customer_credit DECIMAL(10,2);
    result_message TEXT;
BEGIN
    -- Get order details
    SELECT status, total_amount INTO order_status, order_amount
    FROM orders
    WHERE order_id = order_id_param;
    
    -- Check if order exists
    IF NOT FOUND THEN
        RETURN 'Order not found';
    ELSIF order_status != 'pending' THEN
        RETURN 'Order already processed';
    ELSE
        -- Get customer credit
        SELECT c.credit_limit INTO customer_credit
        FROM customers c
        JOIN orders o ON c.customer_id = o.customer_id
        WHERE o.order_id = order_id_param;
        
        IF order_amount <= customer_credit THEN
            UPDATE orders SET status = 'approved' WHERE order_id = order_id_param;
            result_message := 'Order approved';
        ELSE
            UPDATE orders SET status = 'rejected' WHERE order_id = order_id_param;
            result_message := 'Order rejected - insufficient credit';
        END IF;
    END IF;
    
    RETURN result_message;
END;
$$;
```

### Loops

**MySQL:**
```sql
DELIMITER //
CREATE PROCEDURE GenerateMonthlyReport(
    IN year_param INT
)
BEGIN
    DECLARE month_counter INT DEFAULT 1;
    DECLARE monthly_revenue DECIMAL(10,2);
    
    -- Create temporary table for results
    CREATE TEMPORARY TABLE IF NOT EXISTS monthly_report (
        month_num INT,
        month_name VARCHAR(20),
        revenue DECIMAL(10,2)
    );
    
    -- Clear previous data
    DELETE FROM monthly_report;
    
    WHILE month_counter <= 12 DO
        SELECT COALESCE(SUM(total_amount), 0) INTO monthly_revenue
        FROM orders
        WHERE YEAR(order_date) = year_param
          AND MONTH(order_date) = month_counter
          AND status = 'completed';
        
        INSERT INTO monthly_report VALUES (
            month_counter,
            MONTHNAME(STR_TO_DATE(month_counter, '%m')),
            monthly_revenue
        );
        
        SET month_counter = month_counter + 1;
    END WHILE;
    
    SELECT * FROM monthly_report ORDER BY month_num;
END //
DELIMITER ;
```

**PostgreSQL:**
```sql
CREATE OR REPLACE FUNCTION generate_monthly_report(
    year_param INT
) RETURNS TABLE(
    month_num INT,
    month_name TEXT,
    revenue DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    month_counter INT;
    monthly_revenue DECIMAL(10,2);
BEGIN
    FOR month_counter IN 1..12 LOOP
        SELECT COALESCE(SUM(total_amount), 0) INTO monthly_revenue
        FROM orders
        WHERE EXTRACT(YEAR FROM order_date) = year_param
          AND EXTRACT(MONTH FROM order_date) = month_counter
          AND status = 'completed';
        
        month_num := month_counter;
        month_name := TO_CHAR(TO_DATE(month_counter::TEXT, 'MM'), 'Month');
        revenue := monthly_revenue;
        
        RETURN NEXT;
    END LOOP;
END;
$$;

-- Use the function
SELECT * FROM generate_monthly_report(2024);
```

---

## ⚠️ Error Handling

### MySQL Error Handling

```sql
DELIMITER //
CREATE PROCEDURE SafeTransferFunds(
    IN from_account INT,
    IN to_account INT,
    IN amount DECIMAL(10,2),
    OUT result_message VARCHAR(255)
)
BEGIN
    DECLARE account_balance DECIMAL(10,2);
    DECLARE exit_handler_called BOOLEAN DEFAULT FALSE;
    
    -- Error handlers
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET exit_handler_called = TRUE;
        ROLLBACK;
        SET result_message = 'Transaction failed due to error';
    END;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND
    BEGIN
        SET exit_handler_called = TRUE;
        ROLLBACK;
        SET result_message = 'Account not found';
    END;
    
    START TRANSACTION;
    
    -- Check source account balance
    SELECT balance INTO account_balance
    FROM accounts
    WHERE account_id = from_account
    FOR UPDATE;
    
    IF exit_handler_called THEN
        LEAVE;
    END IF;
    
    IF account_balance < amount THEN
        ROLLBACK;
        SET result_message = 'Insufficient funds';
    ELSE
        -- Debit source account
        UPDATE accounts 
        SET balance = balance - amount 
        WHERE account_id = from_account;
        
        -- Credit destination account
        UPDATE accounts 
        SET balance = balance + amount 
        WHERE account_id = to_account;
        
        IF exit_handler_called THEN
            LEAVE;
        END IF;
        
        COMMIT;
        SET result_message = 'Transfer completed successfully';
    END IF;
END //
DELIMITER ;
```

### PostgreSQL Error Handling

```sql
CREATE OR REPLACE FUNCTION safe_transfer_funds(
    from_account INT,
    to_account INT,
    amount DECIMAL(10,2)
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    account_balance DECIMAL(10,2);
BEGIN
    BEGIN
        -- Check source account balance
        SELECT balance INTO STRICT account_balance
        FROM accounts
        WHERE account_id = from_account
        FOR UPDATE;
        
        IF account_balance < amount THEN
            RETURN 'Insufficient funds';
        END IF;
        
        -- Debit source account
        UPDATE accounts 
        SET balance = balance - amount 
        WHERE account_id = from_account;
        
        -- Credit destination account
        UPDATE accounts 
        SET balance = balance + amount 
        WHERE account_id = to_account;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Destination account not found';
        END IF;
        
        RETURN 'Transfer completed successfully';
        
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'Source account not found';
        WHEN TOO_MANY_ROWS THEN
            RETURN 'Multiple accounts found - data integrity issue';
        WHEN OTHERS THEN
            RETURN 'Transaction failed: ' || SQLERRM;
    END;
END;
$$;
```

---

## 💡 Real-World Business Examples

### Example 1: E-commerce Order Processing System

```sql
-- PostgreSQL comprehensive order processing
CREATE OR REPLACE FUNCTION process_ecommerce_order(
    customer_id_param INT,
    items JSONB,  -- [{"product_id": 1, "quantity": 2, "unit_price": 29.99}, ...]
    shipping_address JSONB,
    payment_method VARCHAR(50)
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    new_order_id INT;
    item JSONB;
    product_stock INT;
    order_total DECIMAL(10,2) := 0;
    tax_amount DECIMAL(10,2);
    shipping_cost DECIMAL(10,2) := 9.99;
    customer_tier VARCHAR(20);
    discount_amount DECIMAL(10,2) := 0;
    result JSONB;
BEGIN
    -- Validate customer
    SELECT get_customer_tier(customer_id_param) INTO customer_tier;
    
    IF customer_tier IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid customer ID'
        );
    END IF;
    
    BEGIN
        -- Create order
        INSERT INTO orders (customer_id, order_date, status, shipping_address, payment_method)
        VALUES (customer_id_param, CURRENT_TIMESTAMP, 'pending', shipping_address, payment_method)
        RETURNING order_id INTO new_order_id;
        
        -- Process each item
        FOR item IN SELECT * FROM jsonb_array_elements(items)
        LOOP
            -- Check stock
            SELECT stock_quantity INTO product_stock
            FROM products
            WHERE product_id = (item->>'product_id')::INT
              AND status = 'active'
            FOR UPDATE;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product % not found or inactive', item->>'product_id';
            END IF;
            
            IF product_stock < (item->>'quantity')::INT THEN
                RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
                    item->>'product_id', product_stock, item->>'quantity';
            END IF;
            
            -- Add order item
            INSERT INTO order_items (order_id, product_id, quantity, unit_price)
            VALUES (
                new_order_id,
                (item->>'product_id')::INT,
                (item->>'quantity')::INT,
                (item->>'unit_price')::DECIMAL(10,2)
            );
            
            -- Update stock
            UPDATE products
            SET stock_quantity = stock_quantity - (item->>'quantity')::INT
            WHERE product_id = (item->>'product_id')::INT;
            
            -- Add to order total
            order_total := order_total + ((item->>'quantity')::INT * (item->>'unit_price')::DECIMAL(10,2));
        END LOOP;
        
        -- Calculate discount
        discount_amount := calculate_discount(order_total, customer_tier);
        
        -- Calculate tax (8.5%)
        tax_amount := (order_total - discount_amount) * 0.085;
        
        -- Free shipping for orders over $100 or VIP customers
        IF order_total >= 100 OR customer_tier = 'VIP' THEN
            shipping_cost := 0;
        END IF;
        
        -- Update order totals
        UPDATE orders
        SET 
            subtotal = order_total,
            discount_amount = discount_amount,
            tax_amount = tax_amount,
            shipping_cost = shipping_cost,
            total_amount = order_total - discount_amount + tax_amount + shipping_cost,
            status = 'confirmed'
        WHERE order_id = new_order_id;
        
        -- Return success result
        result := jsonb_build_object(
            'success', true,
            'order_id', new_order_id,
            'subtotal', order_total,
            'discount', discount_amount,
            'tax', tax_amount,
            'shipping', shipping_cost,
            'total', order_total - discount_amount + tax_amount + shipping_cost,
            'customer_tier', customer_tier
        );
        
        RETURN result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback is automatic in PostgreSQL functions
            RETURN jsonb_build_object(
                'success', false,
                'error', SQLERRM
            );
    END;
END;
$$;

-- Usage example
SELECT process_ecommerce_order(
    123,  -- customer_id
    '[{"product_id": 1, "quantity": 2, "unit_price": 29.99}, 
      {"product_id": 5, "quantity": 1, "unit_price": 149.99}]'::jsonb,
    '{"street": "123 Main St", "city": "Anytown", "state": "CA", "zip": "12345"}'::jsonb,
    'credit_card'
);
```

### Example 2: Customer Analytics and Segmentation

```sql
-- MySQL customer analytics procedure
DELIMITER //
CREATE PROCEDURE AnalyzeCustomerSegments(
    IN analysis_date DATE
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE customer_id_var INT;
    DECLARE total_spent DECIMAL(10,2);
    DECLARE order_count INT;
    DECLARE avg_order_value DECIMAL(10,2);
    DECLARE last_order_date DATE;
    DECLARE days_since_last_order INT;
    DECLARE customer_tier VARCHAR(20);
    DECLARE lifecycle_stage VARCHAR(20);
    DECLARE churn_risk VARCHAR(20);
    
    -- Cursor for active customers
    DECLARE customer_cursor CURSOR FOR
        SELECT customer_id FROM customers WHERE status = 'active';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create or clear analytics table
    CREATE TABLE IF NOT EXISTS customer_analytics (
        customer_id INT PRIMARY KEY,
        analysis_date DATE,
        total_spent DECIMAL(10,2),
        order_count INT,
        avg_order_value DECIMAL(10,2),
        last_order_date DATE,
        days_since_last_order INT,
        customer_tier VARCHAR(20),
        lifecycle_stage VARCHAR(20),
        churn_risk VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    DELETE FROM customer_analytics WHERE analysis_date = analysis_date;
    
    OPEN customer_cursor;
    
    customer_loop: LOOP
        FETCH customer_cursor INTO customer_id_var;
        
        IF done THEN
            LEAVE customer_loop;
        END IF;
        
        -- Calculate customer metrics
        SELECT 
            COALESCE(SUM(total_amount), 0),
            COUNT(order_id),
            COALESCE(AVG(total_amount), 0),
            MAX(order_date)
        INTO total_spent, order_count, avg_order_value, last_order_date
        FROM orders
        WHERE customer_id = customer_id_var
          AND status = 'completed'
          AND order_date >= DATE_SUB(analysis_date, INTERVAL 12 MONTH);
        
        -- Calculate days since last order
        IF last_order_date IS NOT NULL THEN
            SET days_since_last_order = DATEDIFF(analysis_date, last_order_date);
        ELSE
            SET days_since_last_order = NULL;
        END IF;
        
        -- Determine customer tier
        IF total_spent >= 5000 OR order_count >= 20 THEN
            SET customer_tier = 'VIP';
        ELSEIF total_spent >= 2000 OR order_count >= 10 THEN
            SET customer_tier = 'Premium';
        ELSEIF total_spent >= 500 OR order_count >= 3 THEN
            SET customer_tier = 'Regular';
        ELSE
            SET customer_tier = 'Basic';
        END IF;
        
        -- Determine lifecycle stage
        IF order_count = 0 THEN
            SET lifecycle_stage = 'Prospect';
        ELSEIF order_count = 1 THEN
            SET lifecycle_stage = 'New Customer';
        ELSEIF order_count <= 5 THEN
            SET lifecycle_stage = 'Developing';
        ELSE
            SET lifecycle_stage = 'Established';
        END IF;
        
        -- Determine churn risk
        IF days_since_last_order IS NULL THEN
            SET churn_risk = 'Never Purchased';
        ELSEIF days_since_last_order <= 30 THEN
            SET churn_risk = 'Low';
        ELSEIF days_since_last_order <= 90 THEN
            SET churn_risk = 'Medium';
        ELSEIF days_since_last_order <= 180 THEN
            SET churn_risk = 'High';
        ELSE
            SET churn_risk = 'Very High';
        END IF;
        
        -- Insert analytics record
        INSERT INTO customer_analytics (
            customer_id, analysis_date, total_spent, order_count, avg_order_value,
            last_order_date, days_since_last_order, customer_tier, lifecycle_stage, churn_risk
        ) VALUES (
            customer_id_var, analysis_date, total_spent, order_count, avg_order_value,
            last_order_date, days_since_last_order, customer_tier, lifecycle_stage, churn_risk
        );
        
    END LOOP;
    
    CLOSE customer_cursor;
    
    -- Return summary
    SELECT 
        customer_tier,
        lifecycle_stage,
        churn_risk,
        COUNT(*) as customer_count,
        AVG(total_spent) as avg_spent,
        AVG(order_count) as avg_orders
    FROM customer_analytics
    WHERE analysis_date = analysis_date
    GROUP BY customer_tier, lifecycle_stage, churn_risk
    ORDER BY customer_tier, lifecycle_stage, churn_risk;
END //
DELIMITER ;

-- Run the analysis
CALL AnalyzeCustomerSegments(CURDATE());
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"When would you use a stored procedure vs a function?"**
   - Procedures: Complex business logic, data modifications, transaction control
   - Functions: Calculations, data transformations, reusable logic in queries
   - Consider maintainability and where business logic should reside

2. **"How do you handle errors in stored procedures?"**
   - MySQL: DECLARE HANDLER statements
   - PostgreSQL: BEGIN/EXCEPTION blocks
   - Always consider transaction rollback and cleanup

3. **"What are the performance implications of stored procedures?"**
   - Pros: Compiled once, reduced network traffic, optimized execution plans
   - Cons: Database server load, harder to scale horizontally, debugging complexity

4. **"How do you secure stored procedures?"**
   - Grant specific EXECUTE permissions
   - Use DEFINER vs INVOKER rights
   - Validate all input parameters
   - Avoid dynamic SQL construction

### Best Practices:

1. **Keep procedures focused and single-purpose**
2. **Use proper error handling and logging**
3. **Validate all input parameters**
4. **Use transactions appropriately**
5. **Document complex business logic**
6. **Consider version control for database objects**

---

## ⚠️ Things to Watch Out For

### 1. **SQL Injection in Dynamic SQL**
```sql
-- Bad: Vulnerable to SQL injection
DELIMITER //
CREATE PROCEDURE BadSearch(IN search_term VARCHAR(255))
BEGIN
    SET @sql = CONCAT('SELECT * FROM products WHERE product_name LIKE "%', search_term, '%"');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- Good: Use parameters
DELIMITER //
CREATE PROCEDURE GoodSearch(IN search_term VARCHAR(255))
BEGIN
    SELECT * FROM products 
    WHERE product_name LIKE CONCAT('%', search_term, '%');
END //
DELIMITER ;
```

### 2. **Transaction Management**
```sql
-- Be careful with transaction boundaries
CREATE OR REPLACE FUNCTION risky_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- This function should not control transactions
    -- if it's called within another transaction
    INSERT INTO audit_log VALUES (...);
    
    -- Don't do this in a function:
    -- COMMIT;  -- This would commit the entire transaction
END;
$$;
```

### 3. **Performance Issues**
```sql
-- Avoid cursor loops when set-based operations work
-- Bad: Cursor-based processing
DELIMITER //
CREATE PROCEDURE SlowUpdate()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE order_id_var INT;
    DECLARE order_cursor CURSOR FOR SELECT order_id FROM orders WHERE status = 'pending';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN order_cursor;
    order_loop: LOOP
        FETCH order_cursor INTO order_id_var;
        IF done THEN LEAVE order_loop; END IF;
        
        UPDATE orders SET processed_date = NOW() WHERE order_id = order_id_var;
    END LOOP;
    CLOSE order_cursor;
END //
DELIMITER ;

-- Good: Set-based operation
DELIMITER //
CREATE PROCEDURE FastUpdate()
BEGIN
    UPDATE orders SET processed_date = NOW() WHERE status = 'pending';
END //
DELIMITER ;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Triggers and Events** - special stored procedures that automatically execute in response to database events. You'll learn how to create audit trails, enforce business rules, and automate database maintenance tasks.

---

## 📝 Quick Practice

Try these stored procedure exercises:

1. **Basic Procedure**: Create a procedure to calculate monthly sales totals
2. **Function**: Write a function to determine shipping cost based on weight and distance
3. **Error Handling**: Implement a safe money transfer procedure with proper error handling
4. **Business Logic**: Create a customer loyalty points calculation system
5. **Complex Processing**: Build an order fulfillment procedure that handles inventory, pricing, and notifications

Consider:
- When to use procedures vs functions
- Proper error handling strategies
- Transaction management
- Security implications
- Performance optimization techniques