# Chapter 13: Triggers and Events

## 📚 What You'll Learn

Triggers are special stored procedures that automatically execute ("fire") in response to specific database events. Events are scheduled tasks that run at predetermined times. This chapter covers how to create, manage, and optimize triggers and events for automation, auditing, and business rule enforcement.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand different types of triggers and their use cases
- Create BEFORE, AFTER, and INSTEAD OF triggers
- Implement audit trails and data validation
- Use events for scheduled database maintenance
- Handle trigger performance and avoid common pitfalls
- Implement complex business rules with triggers

---

## 🔍 Concept Explanation

### What are Triggers?

Triggers are special stored procedures that automatically execute in response to specific database events such as INSERT, UPDATE, or DELETE operations. They cannot be called directly and run within the same transaction as the triggering statement.

**Types of Triggers:**
- **BEFORE**: Execute before the triggering event
- **AFTER**: Execute after the triggering event
- **INSTEAD OF**: Replace the triggering event (views only)

**Common Use Cases:**
- Audit trails and logging
- Data validation and business rules
- Automatic calculations and updates
- Maintaining derived data
- Security and access control

### What are Events?

Events are scheduled tasks that run automatically at specified times or intervals. They're useful for database maintenance, reporting, and batch processing.

---

## 🛠️ Syntax Comparison

### MySQL vs PostgreSQL Triggers

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Trigger Types** | BEFORE, AFTER | BEFORE, AFTER, INSTEAD OF |
| **Row vs Statement** | Row-level only | Both row and statement level |
| **Multiple Triggers** | ✅ (5.7+) | ✅ |
| **Trigger Functions** | Inline SQL | Separate functions |
| **OLD/NEW References** | OLD, NEW | OLD, NEW |
| **Conditional Logic** | WHEN clause (5.7+) | WHEN clause |
| **Events/Scheduling** | Event Scheduler | pg_cron extension |

---

## 🔥 Basic Triggers

### MySQL Triggers

```sql
-- Simple audit trigger
DELIMITER //
CREATE TRIGGER audit_customer_changes
    AFTER UPDATE ON customers
    FOR EACH ROW
BEGIN
    INSERT INTO customer_audit (
        customer_id,
        action_type,
        old_email,
        new_email,
        old_status,
        new_status,
        changed_by,
        changed_at
    ) VALUES (
        NEW.customer_id,
        'UPDATE',
        OLD.email,
        NEW.email,
        OLD.status,
        NEW.status,
        USER(),
        NOW()
    );
END //
DELIMITER ;

-- BEFORE trigger for data validation
DELIMITER //
CREATE TRIGGER validate_order_before_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
BEGIN
    -- Validate customer exists and is active
    IF NOT EXISTS (SELECT 1 FROM customers WHERE customer_id = NEW.customer_id AND status = 'active') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer does not exist or is inactive';
    END IF;
    
    -- Set default values
    IF NEW.order_date IS NULL THEN
        SET NEW.order_date = NOW();
    END IF;
    
    IF NEW.status IS NULL THEN
        SET NEW.status = 'pending';
    END IF;
    
    -- Validate order amount
    IF NEW.total_amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order amount cannot be negative';
    END IF;
END //
DELIMITER ;

-- AFTER trigger for automatic updates
DELIMITER //
CREATE TRIGGER update_customer_stats_after_order
    AFTER INSERT ON orders
    FOR EACH ROW
BEGIN
    -- Update customer statistics
    UPDATE customer_stats 
    SET 
        total_orders = total_orders + 1,
        total_spent = total_spent + NEW.total_amount,
        last_order_date = NEW.order_date
    WHERE customer_id = NEW.customer_id;
    
    -- Insert if customer stats don't exist
    IF ROW_COUNT() = 0 THEN
        INSERT INTO customer_stats (customer_id, total_orders, total_spent, last_order_date)
        VALUES (NEW.customer_id, 1, NEW.total_amount, NEW.order_date);
    END IF;
END //
DELIMITER ;
```

### PostgreSQL Triggers

```sql
-- Create trigger function first
CREATE OR REPLACE FUNCTION audit_customer_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO customer_audit (
            customer_id,
            action_type,
            old_email,
            new_email,
            old_status,
            new_status,
            changed_by,
            changed_at
        ) VALUES (
            NEW.customer_id,
            'UPDATE',
            OLD.email,
            NEW.email,
            OLD.status,
            NEW.status,
            current_user,
            current_timestamp
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO customer_audit (
            customer_id,
            action_type,
            new_email,
            new_status,
            changed_by,
            changed_at
        ) VALUES (
            NEW.customer_id,
            'INSERT',
            NEW.email,
            NEW.status,
            current_user,
            current_timestamp
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO customer_audit (
            customer_id,
            action_type,
            old_email,
            old_status,
            changed_by,
            changed_at
        ) VALUES (
            OLD.customer_id,
            'DELETE',
            OLD.email,
            OLD.status,
            current_user,
            current_timestamp
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Create the trigger
CREATE TRIGGER audit_customer_changes
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION audit_customer_changes();

-- BEFORE trigger for validation
CREATE OR REPLACE FUNCTION validate_order_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate customer exists and is active
    IF NOT EXISTS (SELECT 1 FROM customers WHERE customer_id = NEW.customer_id AND status = 'active') THEN
        RAISE EXCEPTION 'Customer does not exist or is inactive';
    END IF;
    
    -- Set default values
    IF NEW.order_date IS NULL THEN
        NEW.order_date := current_timestamp;
    END IF;
    
    IF NEW.status IS NULL THEN
        NEW.status := 'pending';
    END IF;
    
    -- Validate order amount
    IF NEW.total_amount < 0 THEN
        RAISE EXCEPTION 'Order amount cannot be negative';
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_order_before_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_before_insert();

-- Statement-level trigger (PostgreSQL only)
CREATE OR REPLACE FUNCTION log_bulk_operations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO operation_log (table_name, operation, row_count, timestamp)
    VALUES (TG_TABLE_NAME, TG_OP, TG_LEVEL, current_timestamp);
    
    RETURN NULL;
END;
$$;

CREATE TRIGGER log_bulk_operations
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH STATEMENT
    EXECUTE FUNCTION log_bulk_operations();
```

---

## 📊 Advanced Trigger Examples

### Inventory Management System

**MySQL:**
```sql
-- Create inventory tracking tables
CREATE TABLE inventory_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Trigger to track inventory movements
DELIMITER //
CREATE TRIGGER track_inventory_on_order_item_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    -- Check current stock
    SELECT stock_quantity INTO current_stock
    FROM products
    WHERE product_id = NEW.product_id;
    
    -- Validate sufficient stock
    IF current_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Insufficient stock. Available: ', current_stock, ', Requested: ', NEW.quantity);
    END IF;
    
    -- Update product stock
    UPDATE products
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE product_id = NEW.product_id;
    
    -- Record inventory movement
    INSERT INTO inventory_movements (
        product_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes
    ) VALUES (
        NEW.product_id,
        'OUT',
        NEW.quantity,
        'ORDER',
        NEW.order_id,
        CONCAT('Order item for order #', NEW.order_id)
    );
END //
DELIMITER ;

-- Trigger to handle order cancellations
DELIMITER //
CREATE TRIGGER restore_inventory_on_order_cancel
    AFTER UPDATE ON orders
    FOR EACH ROW
BEGIN
    -- Only process if order status changed to cancelled
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        -- Restore inventory for all order items
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes)
        SELECT 
            oi.product_id,
            'IN',
            oi.quantity,
            'ORDER_CANCEL',
            NEW.order_id,
            CONCAT('Inventory restored from cancelled order #', NEW.order_id)
        FROM order_items oi
        WHERE oi.order_id = NEW.order_id;
        
        -- Update product stock
        UPDATE products p
        JOIN order_items oi ON p.product_id = oi.product_id
        SET p.stock_quantity = p.stock_quantity + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END //
DELIMITER ;
```

**PostgreSQL:**
```sql
-- Comprehensive inventory management trigger
CREATE OR REPLACE FUNCTION manage_inventory()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    current_stock INT;
    item_record RECORD;
BEGIN
    IF TG_TABLE_NAME = 'order_items' THEN
        IF TG_OP = 'INSERT' THEN
            -- Check and update stock for new order item
            SELECT stock_quantity INTO current_stock
            FROM products
            WHERE product_id = NEW.product_id
            FOR UPDATE;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product % not found', NEW.product_id;
            END IF;
            
            IF current_stock < NEW.quantity THEN
                RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, NEW.quantity;
            END IF;
            
            -- Update stock
            UPDATE products
            SET stock_quantity = stock_quantity - NEW.quantity
            WHERE product_id = NEW.product_id;
            
            -- Record movement
            INSERT INTO inventory_movements (
                product_id, movement_type, quantity, reference_type, reference_id, notes
            ) VALUES (
                NEW.product_id, 'OUT', NEW.quantity, 'ORDER', NEW.order_id,
                'Order item for order #' || NEW.order_id
            );
            
            RETURN NEW;
            
        ELSIF TG_OP = 'DELETE' THEN
            -- Restore stock when order item is deleted
            UPDATE products
            SET stock_quantity = stock_quantity + OLD.quantity
            WHERE product_id = OLD.product_id;
            
            INSERT INTO inventory_movements (
                product_id, movement_type, quantity, reference_type, reference_id, notes
            ) VALUES (
                OLD.product_id, 'IN', OLD.quantity, 'ORDER_ITEM_DELETE', OLD.order_id,
                'Stock restored from deleted order item'
            );
            
            RETURN OLD;
        END IF;
        
    ELSIF TG_TABLE_NAME = 'orders' THEN
        IF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
            -- Restore inventory for cancelled orders
            FOR item_record IN
                SELECT product_id, quantity FROM order_items WHERE order_id = NEW.order_id
            LOOP
                UPDATE products
                SET stock_quantity = stock_quantity + item_record.quantity
                WHERE product_id = item_record.product_id;
                
                INSERT INTO inventory_movements (
                    product_id, movement_type, quantity, reference_type, reference_id, notes
                ) VALUES (
                    item_record.product_id, 'IN', item_record.quantity, 'ORDER_CANCEL', NEW.order_id,
                    'Inventory restored from cancelled order #' || NEW.order_id
                );
            END LOOP;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER manage_inventory_order_items
    AFTER INSERT OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION manage_inventory();

CREATE TRIGGER manage_inventory_orders
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION manage_inventory();
```

### Comprehensive Audit System

**PostgreSQL Advanced Audit:**
```sql
-- Generic audit function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB;
BEGIN
    -- Convert row data to JSON
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Calculate changed fields
        SELECT jsonb_object_agg(key, jsonb_build_object(
            'old', old_data->key,
            'new', new_data->key
        )) INTO changed_fields
        FROM jsonb_each(new_data)
        WHERE new_data->key IS DISTINCT FROM old_data->key;
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_log (
        table_name,
        operation,
        record_id,
        old_data,
        new_data,
        changed_fields,
        user_name,
        timestamp,
        application_name,
        client_addr
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),  -- Assumes 'id' column exists
        old_data,
        new_data,
        changed_fields,
        current_user,
        current_timestamp,
        current_setting('application_name', true),
        inet_client_addr()
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Apply audit trigger to multiple tables
CREATE TRIGGER audit_customers
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger();
```

---

## ⏰ Events and Scheduled Tasks

### MySQL Event Scheduler

```sql
-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Daily cleanup event
DELIMITER //
CREATE EVENT daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 02:00:00'
DO
BEGIN
    -- Clean up old audit records (keep 1 year)
    DELETE FROM audit_log 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    
    -- Clean up expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    -- Update customer statistics
    CALL UpdateCustomerStatistics();
    
    -- Log cleanup completion
    INSERT INTO maintenance_log (task_name, completion_time, records_affected)
    VALUES ('daily_cleanup', NOW(), ROW_COUNT());
END //
DELIMITER ;

-- Weekly report generation
DELIMITER //
CREATE EVENT weekly_sales_report
ON SCHEDULE EVERY 1 WEEK
STARTS '2024-01-01 06:00:00'
DO
BEGIN
    DECLARE report_start_date DATE;
    DECLARE report_end_date DATE;
    
    SET report_end_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
    SET report_start_date = DATE_SUB(report_end_date, INTERVAL 6 DAY);
    
    -- Generate weekly sales summary
    INSERT INTO weekly_sales_reports (
        report_week,
        start_date,
        end_date,
        total_orders,
        total_revenue,
        avg_order_value,
        new_customers,
        generated_at
    )
    SELECT 
        YEARWEEK(report_end_date),
        report_start_date,
        report_end_date,
        COUNT(o.order_id),
        SUM(o.total_amount),
        AVG(o.total_amount),
        COUNT(DISTINCT CASE WHEN c.created_at >= report_start_date THEN c.customer_id END),
        NOW()
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_date BETWEEN report_start_date AND report_end_date
      AND o.status = 'completed';
END //
DELIMITER ;

-- Monthly maintenance event
DELIMITER //
CREATE EVENT monthly_maintenance
ON SCHEDULE EVERY 1 MONTH
STARTS '2024-01-01 01:00:00'
DO
BEGIN
    -- Optimize tables
    OPTIMIZE TABLE customers, orders, order_items, products;
    
    -- Update table statistics
    ANALYZE TABLE customers, orders, order_items, products;
    
    -- Archive old data
    INSERT INTO orders_archive 
    SELECT * FROM orders 
    WHERE order_date < DATE_SUB(NOW(), INTERVAL 2 YEAR)
      AND status IN ('completed', 'cancelled');
    
    DELETE FROM orders 
    WHERE order_date < DATE_SUB(NOW(), INTERVAL 2 YEAR)
      AND status IN ('completed', 'cancelled');
    
    -- Log maintenance completion
    INSERT INTO maintenance_log (task_name, completion_time, records_affected)
    VALUES ('monthly_maintenance', NOW(), ROW_COUNT());
END //
DELIMITER ;

-- View and manage events
SHOW EVENTS;

-- Disable an event
ALTER EVENT daily_cleanup DISABLE;

-- Enable an event
ALTER EVENT daily_cleanup ENABLE;

-- Drop an event
DROP EVENT IF EXISTS old_event;
```

### PostgreSQL Scheduled Tasks (pg_cron)

```sql
-- Install pg_cron extension (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup (runs at 2 AM every day)
SELECT cron.schedule('daily-cleanup', '0 2 * * *', $$
    -- Clean up old audit records
    DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Clean up expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Update materialized views
    REFRESH MATERIALIZED VIEW customer_analytics_12m;
    
    -- Log completion
    INSERT INTO maintenance_log (task_name, completion_time)
    VALUES ('daily_cleanup', NOW());
$$);

-- Schedule weekly report (runs at 6 AM every Monday)
SELECT cron.schedule('weekly-report', '0 6 * * 1', $$
    INSERT INTO weekly_sales_reports (
        report_week,
        start_date,
        end_date,
        total_orders,
        total_revenue,
        avg_order_value,
        new_customers,
        generated_at
    )
    SELECT 
        EXTRACT(WEEK FROM (CURRENT_DATE - INTERVAL '1 week')),
        CURRENT_DATE - INTERVAL '1 week',
        CURRENT_DATE - INTERVAL '1 day',
        COUNT(o.order_id),
        SUM(o.total_amount),
        AVG(o.total_amount),
        COUNT(DISTINCT CASE WHEN c.created_at >= CURRENT_DATE - INTERVAL '1 week' THEN c.customer_id END),
        NOW()
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_date >= CURRENT_DATE - INTERVAL '1 week'
      AND o.order_date < CURRENT_DATE
      AND o.status = 'completed';
$$);

-- Schedule monthly maintenance (runs at 1 AM on the 1st of each month)
SELECT cron.schedule('monthly-maintenance', '0 1 1 * *', $$
    -- Vacuum and analyze tables
    VACUUM ANALYZE customers;
    VACUUM ANALYZE orders;
    VACUUM ANALYZE order_items;
    VACUUM ANALYZE products;
    
    -- Reindex if needed
    REINDEX INDEX CONCURRENTLY idx_orders_customer_date;
    
    -- Archive old data
    WITH archived_orders AS (
        DELETE FROM orders 
        WHERE order_date < NOW() - INTERVAL '2 years'
          AND status IN ('completed', 'cancelled')
        RETURNING *
    )
    INSERT INTO orders_archive SELECT * FROM archived_orders;
$$);

-- View scheduled jobs
SELECT * FROM cron.job;

-- Unschedule a job
SELECT cron.unschedule('daily-cleanup');
```

---

## 💡 Real-World Business Examples

### Example 1: E-commerce Price Change Tracking

```sql
-- PostgreSQL: Track price changes and notify stakeholders
CREATE TABLE price_history (
    price_history_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    price_change_percent DECIMAL(5,2),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

CREATE TABLE price_alerts (
    alert_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    alert_type VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION track_price_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    price_change_percent DECIMAL(5,2);
    alert_message TEXT;
BEGIN
    -- Only process if price actually changed
    IF OLD.price IS DISTINCT FROM NEW.price THEN
        -- Calculate percentage change
        IF OLD.price > 0 THEN
            price_change_percent := ((NEW.price - OLD.price) / OLD.price) * 100;
        ELSE
            price_change_percent := 100;  -- New product
        END IF;
        
        -- Record price history
        INSERT INTO price_history (
            product_id,
            old_price,
            new_price,
            price_change_percent,
            changed_by
        ) VALUES (
            NEW.product_id,
            OLD.price,
            NEW.price,
            price_change_percent,
            current_user
        );
        
        -- Generate alerts for significant changes
        IF ABS(price_change_percent) >= 10 THEN
            alert_message := format(
                'Significant price change for product %s (%s): %s → %s (%.1f%% %s)',
                NEW.product_name,
                NEW.sku,
                OLD.price,
                NEW.price,
                ABS(price_change_percent),
                CASE WHEN price_change_percent > 0 THEN 'increase' ELSE 'decrease' END
            );
            
            INSERT INTO price_alerts (product_id, alert_type, message)
            VALUES (NEW.product_id, 'SIGNIFICANT_CHANGE', alert_message);
        END IF;
        
        -- Alert for products going out of stock
        IF OLD.stock_quantity > 0 AND NEW.stock_quantity = 0 THEN
            INSERT INTO price_alerts (product_id, alert_type, message)
            VALUES (NEW.product_id, 'OUT_OF_STOCK', 
                   format('Product %s (%s) is now out of stock', NEW.product_name, NEW.sku));
        END IF;
        
        -- Alert for products coming back in stock
        IF OLD.stock_quantity = 0 AND NEW.stock_quantity > 0 THEN
            INSERT INTO price_alerts (product_id, alert_type, message)
            VALUES (NEW.product_id, 'BACK_IN_STOCK', 
                   format('Product %s (%s) is back in stock (%s units)', 
                          NEW.product_name, NEW.sku, NEW.stock_quantity));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER track_price_changes
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION track_price_changes();
```

### Example 2: Customer Loyalty Points System

```sql
-- MySQL: Automatic loyalty points calculation
CREATE TABLE customer_loyalty (
    customer_id INT PRIMARY KEY,
    total_points INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'Bronze',
    tier_start_date DATE,
    lifetime_points INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE points_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    points_earned INT DEFAULT 0,
    points_redeemed INT DEFAULT 0,
    transaction_type VARCHAR(50),
    reference_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELIMITER //
CREATE TRIGGER calculate_loyalty_points
    AFTER INSERT ON orders
    FOR EACH ROW
BEGIN
    DECLARE points_earned INT DEFAULT 0;
    DECLARE current_tier VARCHAR(20);
    DECLARE new_tier VARCHAR(20);
    DECLARE total_lifetime_points INT;
    
    -- Only process completed orders
    IF NEW.status = 'completed' THEN
        -- Calculate base points (1 point per dollar)
        SET points_earned = FLOOR(NEW.total_amount);
        
        -- Get current customer tier
        SELECT tier INTO current_tier
        FROM customer_loyalty
        WHERE customer_id = NEW.customer_id;
        
        -- Apply tier multipliers
        CASE current_tier
            WHEN 'Gold' THEN SET points_earned = points_earned * 2;
            WHEN 'Silver' THEN SET points_earned = FLOOR(points_earned * 1.5);
            WHEN 'Bronze' THEN SET points_earned = points_earned * 1;
        END CASE;
        
        -- Bonus points for large orders
        IF NEW.total_amount >= 500 THEN
            SET points_earned = points_earned + 100;
        ELSEIF NEW.total_amount >= 200 THEN
            SET points_earned = points_earned + 50;
        END IF;
        
        -- Update customer loyalty record
        INSERT INTO customer_loyalty (customer_id, total_points, lifetime_points, tier, tier_start_date)
        VALUES (NEW.customer_id, points_earned, points_earned, 'Bronze', CURDATE())
        ON DUPLICATE KEY UPDATE
            total_points = total_points + points_earned,
            lifetime_points = lifetime_points + points_earned;
        
        -- Check for tier upgrade
        SELECT lifetime_points INTO total_lifetime_points
        FROM customer_loyalty
        WHERE customer_id = NEW.customer_id;
        
        IF total_lifetime_points >= 10000 THEN
            SET new_tier = 'Gold';
        ELSEIF total_lifetime_points >= 5000 THEN
            SET new_tier = 'Silver';
        ELSE
            SET new_tier = 'Bronze';
        END IF;
        
        -- Update tier if changed
        IF new_tier != current_tier THEN
            UPDATE customer_loyalty
            SET tier = new_tier, tier_start_date = CURDATE()
            WHERE customer_id = NEW.customer_id;
        END IF;
        
        -- Record points transaction
        INSERT INTO points_transactions (
            customer_id,
            points_earned,
            transaction_type,
            reference_id,
            description
        ) VALUES (
            NEW.customer_id,
            points_earned,
            'ORDER_PURCHASE',
            NEW.order_id,
            CONCAT('Points earned from order #', NEW.order_id, ' ($', NEW.total_amount, ')')
        );
    END IF;
END //
DELIMITER ;

-- Trigger for points redemption
DELIMITER //
CREATE TRIGGER handle_points_redemption
    AFTER INSERT ON points_redemptions
    FOR EACH ROW
BEGIN
    DECLARE current_points INT;
    
    -- Check if customer has enough points
    SELECT total_points INTO current_points
    FROM customer_loyalty
    WHERE customer_id = NEW.customer_id;
    
    IF current_points >= NEW.points_redeemed THEN
        -- Deduct points
        UPDATE customer_loyalty
        SET total_points = total_points - NEW.points_redeemed
        WHERE customer_id = NEW.customer_id;
        
        -- Record transaction
        INSERT INTO points_transactions (
            customer_id,
            points_redeemed,
            transaction_type,
            reference_id,
            description
        ) VALUES (
            NEW.customer_id,
            NEW.points_redeemed,
            'REDEMPTION',
            NEW.redemption_id,
            NEW.description
        );
    ELSE
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Insufficient loyalty points for redemption';
    END IF;
END //
DELIMITER ;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"What's the difference between BEFORE and AFTER triggers?"**
   - BEFORE: Can modify NEW values, prevent operations, validation
   - AFTER: Cannot modify data, used for logging, cascading updates
   - INSTEAD OF: Replace the operation (views only)

2. **"How do you handle recursive triggers?"**
   - Use conditional logic to prevent infinite loops
   - Set flags or use session variables
   - Consider using statement-level triggers

3. **"What are the performance implications of triggers?"**
   - Triggers add overhead to DML operations
   - Can slow down bulk operations
   - Consider batching and asynchronous processing

4. **"When would you use triggers vs stored procedures?"**
   - Triggers: Automatic, event-driven, data integrity
   - Procedures: Manual execution, complex business logic, better control

### Best Practices:

1. **Keep triggers simple and fast**
2. **Avoid complex business logic in triggers**
3. **Use proper error handling**
4. **Document trigger behavior thoroughly**
5. **Test trigger interactions carefully**
6. **Consider alternatives for heavy processing**

---

## ⚠️ Things to Watch Out For

### 1. **Recursive Triggers**
```sql
-- Problem: Infinite loop
CREATE TRIGGER update_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW
    SET NEW.updated_at = NOW();

-- This trigger fires on every update, including its own!

-- Solution: Add condition
DELIMITER //
CREATE TRIGGER update_timestamp_safe
    BEFORE UPDATE ON orders
    FOR EACH ROW
BEGIN
    IF NEW.updated_at = OLD.updated_at THEN
        SET NEW.updated_at = NOW();
    END IF;
END //
DELIMITER ;
```

### 2. **Performance Issues with Bulk Operations**
```sql
-- Problem: Row-level trigger on bulk insert
-- This will fire once for each of 10,000 rows
INSERT INTO orders (customer_id, total_amount)
SELECT customer_id, 100
FROM customers
LIMIT 10000;

-- Solution: Use statement-level triggers (PostgreSQL)
CREATE TRIGGER bulk_operation_log
    AFTER INSERT ON orders
    FOR EACH STATEMENT
    EXECUTE FUNCTION log_bulk_insert();
```

### 3. **Transaction Rollback Issues**
```sql
-- Be careful with error handling in triggers
CREATE OR REPLACE FUNCTION risky_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- This could cause the entire transaction to rollback
    INSERT INTO external_api_log VALUES (...);
    
    -- Better: Use exception handling
    BEGIN
        INSERT INTO external_api_log VALUES (...);
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error but don't fail the main operation
            INSERT INTO error_log VALUES (SQLERRM);
    END;
    
    RETURN NEW;
END;
$$;
```

### 4. **Trigger Order Dependencies**
```sql
-- Multiple triggers on same table can have order issues
-- MySQL: Use naming convention or FOLLOWS/PRECEDES (5.7+)
CREATE TRIGGER audit_first
    AFTER UPDATE ON customers
    FOR EACH ROW
    -- This should run first
    INSERT INTO audit_log VALUES (...);

CREATE TRIGGER update_stats_second
    AFTER UPDATE ON customers
    FOR EACH ROW
    FOLLOWS audit_first  -- MySQL 5.7+
    -- This runs after audit_first
    UPDATE customer_stats SET ...;
```

---

## 🚀 Next Steps

In the next chapter, we'll explore **Views and CTEs (Common Table Expressions)** - powerful tools for creating virtual tables, simplifying complex queries, and organizing data access. You'll learn how to create updatable views, recursive CTEs, and use them for security and abstraction.

---

## 📝 Quick Practice

Try these trigger and event exercises:

1. **Audit System**: Create a comprehensive audit trail for all table changes
2. **Inventory Management**: Build triggers to automatically manage product stock levels
3. **Business Rules**: Implement complex validation rules using triggers
4. **Scheduled Maintenance**: Create events for database cleanup and optimization
5. **Real-time Analytics**: Use triggers to maintain real-time summary tables

Consider:
- When to use triggers vs application logic
- Performance implications of trigger complexity
- Error handling and transaction management
- Testing strategies for trigger-dependent systems
- Alternatives like message queues for heavy processing