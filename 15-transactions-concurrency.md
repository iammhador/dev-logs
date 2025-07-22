# Chapter 15: Transactions and Concurrency Control

## 📚 What You'll Learn

Transactions are fundamental to database integrity, ensuring that operations either complete successfully or fail completely. Concurrency control manages how multiple users access the same data simultaneously. This chapter covers ACID properties, isolation levels, locking mechanisms, and strategies for handling concurrent database access.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand ACID properties and their importance
- Master transaction control statements (BEGIN, COMMIT, ROLLBACK)
- Implement proper error handling in transactions
- Configure and use different isolation levels
- Handle deadlocks and concurrency issues
- Optimize transaction performance
- Implement distributed transactions

---

## 🔍 Concept Explanation

### What are Transactions?

A transaction is a sequence of database operations that are treated as a single unit of work. Transactions ensure data integrity by following the ACID properties:

**ACID Properties:**
- **Atomicity**: All operations succeed or all fail (all-or-nothing)
- **Consistency**: Database remains in a valid state before and after
- **Isolation**: Concurrent transactions don't interfere with each other
- **Durability**: Committed changes persist even after system failure

### Concurrency Control

Concurrency control manages simultaneous access to data by multiple users/processes:

**Common Issues:**
- **Dirty Reads**: Reading uncommitted changes
- **Non-repeatable Reads**: Same query returns different results
- **Phantom Reads**: New rows appear between reads
- **Lost Updates**: Concurrent updates overwrite each other

**Solutions:**
- **Locking**: Prevent concurrent access to data
- **Isolation Levels**: Control what changes are visible
- **Optimistic Concurrency**: Detect conflicts at commit time
- **Pessimistic Concurrency**: Prevent conflicts with locks

---

## 🛠️ Syntax Comparison

### MySQL vs PostgreSQL Transactions

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| **Auto-commit** | ON by default | OFF by default |
| **Transaction Start** | START TRANSACTION, BEGIN | BEGIN, START TRANSACTION |
| **Savepoints** | ✅ | ✅ |
| **Nested Transactions** | ❌ | ✅ (via savepoints) |
| **Isolation Levels** | 4 standard levels | 4 standard + custom |
| **Lock Types** | Table, row, metadata | Table, row, advisory |
| **Deadlock Detection** | ✅ Automatic | ✅ Automatic |
| **MVCC** | ✅ (InnoDB) | ✅ Native |
| **Read Committed** | Default | Default |
| **Serializable** | ✅ | ✅ |

---

## 🔄 Basic Transaction Control

### MySQL Transactions

```sql
-- Basic transaction structure
START TRANSACTION;

-- Your SQL operations here
INSERT INTO customers (first_name, last_name, email) 
VALUES ('John', 'Doe', 'john.doe@email.com');

UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;

-- Commit if everything is successful
COMMIT;

-- Example with rollback on error
START TRANSACTION;

DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
    ROLLBACK;
    RESIGNAL;
END;

-- Transfer money between accounts
UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;

COMMIT;

-- Using savepoints
START TRANSACTION;

INSERT INTO orders (customer_id, total_amount) VALUES (1, 100.00);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
VALUES (LAST_INSERT_ID(), 1, 2, 25.00);
SAVEPOINT items_added;

UPDATE products SET stock_quantity = stock_quantity - 2 WHERE product_id = 1;

-- If stock update fails, rollback to savepoint
IF ROW_COUNT() = 0 THEN
    ROLLBACK TO SAVEPOINT items_added;
    -- Handle insufficient stock
END IF;

COMMIT;

-- Auto-commit control
SET autocommit = 0;  -- Disable auto-commit
SELECT @@autocommit; -- Check current setting

-- Manual transaction without START TRANSACTION
INSERT INTO customers (first_name, last_name, email) 
VALUES ('Jane', 'Smith', 'jane.smith@email.com');
COMMIT;

SET autocommit = 1;  -- Re-enable auto-commit
```

### PostgreSQL Transactions

```sql
-- Basic transaction structure
BEGIN;

-- Your SQL operations here
INSERT INTO customers (first_name, last_name, email) 
VALUES ('John', 'Doe', 'john.doe@email.com');

UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;

-- Commit if everything is successful
COMMIT;

-- Example with exception handling
DO $$
BEGIN
    BEGIN
        -- Start transaction block
        INSERT INTO orders (customer_id, total_amount) VALUES (1, 100.00);
        
        -- This might fail
        UPDATE products SET stock_quantity = stock_quantity - 10 
        WHERE product_id = 1 AND stock_quantity >= 10;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Insufficient stock for product %', 1;
        END IF;
        
        -- If we get here, commit
        COMMIT;
        
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE NOTICE 'Transaction failed: %', SQLERRM;
    END;
END $$;

-- Using savepoints (nested transactions)
BEGIN;

INSERT INTO orders (customer_id, total_amount) VALUES (1, 100.00);
SAVEPOINT order_created;

INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
VALUES (currval('orders_order_id_seq'), 1, 2, 25.00);
SAVEPOINT items_added;

-- Try to update stock
UPDATE products SET stock_quantity = stock_quantity - 2 
WHERE product_id = 1 AND stock_quantity >= 2;

IF NOT FOUND THEN
    -- Rollback to savepoint and handle error
    ROLLBACK TO SAVEPOINT items_added;
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, status) 
    VALUES (currval('orders_order_id_seq'), 1, 2, 25.00, 'backordered');
END IF;

COMMIT;

-- Transaction isolation levels
BEGIN ISOLATION LEVEL READ COMMITTED;
-- or
BEGIN ISOLATION LEVEL REPEATABLE READ;
-- or
BEGIN ISOLATION LEVEL SERIALIZABLE;

-- Set isolation level for session
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Check current isolation level
SHOW TRANSACTION ISOLATION LEVEL;
```

---

## 🔒 Isolation Levels

### Understanding Isolation Levels

```sql
-- READ UNCOMMITTED (lowest isolation)
-- Can see uncommitted changes from other transactions
-- Allows: Dirty reads, non-repeatable reads, phantom reads

-- Session 1
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE account_id = 1; -- Shows 1000

-- Session 2 (concurrent)
BEGIN;
UPDATE accounts SET balance = 500 WHERE account_id = 1;
-- Don't commit yet

-- Back to Session 1
SELECT balance FROM accounts WHERE account_id = 1; -- Shows 500 (dirty read!)
COMMIT;

-- READ COMMITTED (default in most databases)
-- Only sees committed changes
-- Prevents: Dirty reads
-- Allows: Non-repeatable reads, phantom reads

-- Session 1
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
SELECT balance FROM accounts WHERE account_id = 1; -- Shows 1000

-- Session 2
BEGIN;
UPDATE accounts SET balance = 500 WHERE account_id = 1;
COMMIT; -- Now committed

-- Back to Session 1
SELECT balance FROM accounts WHERE account_id = 1; -- Shows 500 (non-repeatable read)
COMMIT;

-- REPEATABLE READ
-- Same reads return same results within transaction
-- Prevents: Dirty reads, non-repeatable reads
-- Allows: Phantom reads

-- Session 1
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT COUNT(*) FROM customers WHERE city = 'New York'; -- Shows 10

-- Session 2
BEGIN;
INSERT INTO customers (first_name, last_name, city) 
VALUES ('New', 'Customer', 'New York');
COMMIT;

-- Back to Session 1
SELECT COUNT(*) FROM customers WHERE city = 'New York'; -- Still shows 10
SELECT * FROM customers WHERE city = 'New York'; -- Might show 11 rows (phantom read)
COMMIT;

-- SERIALIZABLE (highest isolation)
-- Transactions appear to run sequentially
-- Prevents: All concurrency issues
-- May cause: More deadlocks and performance issues

-- Session 1
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT SUM(balance) FROM accounts; -- Shows total

-- Session 2
BEGIN ISOLATION LEVEL SERIALIZABLE;
INSERT INTO accounts (customer_id, balance) VALUES (999, 1000);
-- This might block or cause serialization failure
COMMIT;

-- Back to Session 1
SELECT SUM(balance) FROM accounts; -- Same result as before
COMMIT;
```

### Practical Isolation Level Examples

**E-commerce Order Processing:**
```sql
-- PostgreSQL: Handling concurrent order processing
CREATE OR REPLACE FUNCTION process_order(
    p_customer_id INT,
    p_product_id INT,
    p_quantity INT
) RETURNS TABLE(
    order_id INT,
    status TEXT,
    message TEXT
) AS $$
DECLARE
    v_order_id INT;
    v_available_stock INT;
    v_unit_price DECIMAL(10,2);
BEGIN
    -- Use REPEATABLE READ to ensure consistent stock checks
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    
    BEGIN
        -- Check product availability and get price
        SELECT stock_quantity, price INTO v_available_stock, v_unit_price
        FROM products 
        WHERE product_id = p_product_id AND status = 'active'
        FOR UPDATE; -- Lock the row
        
        IF NOT FOUND THEN
            RETURN QUERY SELECT NULL::INT, 'ERROR'::TEXT, 'Product not found'::TEXT;
            RETURN;
        END IF;
        
        IF v_available_stock < p_quantity THEN
            RETURN QUERY SELECT NULL::INT, 'ERROR'::TEXT, 
                format('Insufficient stock. Available: %s, Requested: %s', 
                       v_available_stock, p_quantity)::TEXT;
            RETURN;
        END IF;
        
        -- Create order
        INSERT INTO orders (customer_id, total_amount, status, order_date)
        VALUES (p_customer_id, v_unit_price * p_quantity, 'pending', CURRENT_TIMESTAMP)
        RETURNING orders.order_id INTO v_order_id;
        
        -- Add order item
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (v_order_id, p_product_id, p_quantity, v_unit_price);
        
        -- Update stock
        UPDATE products 
        SET stock_quantity = stock_quantity - p_quantity
        WHERE product_id = p_product_id;
        
        -- Update order status
        UPDATE orders SET status = 'confirmed' WHERE orders.order_id = v_order_id;
        
        RETURN QUERY SELECT v_order_id, 'SUCCESS'::TEXT, 'Order processed successfully'::TEXT;
        
    EXCEPTION
        WHEN serialization_failure THEN
            RETURN QUERY SELECT NULL::INT, 'RETRY'::TEXT, 'Serialization conflict, please retry'::TEXT;
        WHEN OTHERS THEN
            RETURN QUERY SELECT NULL::INT, 'ERROR'::TEXT, SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql;

-- Usage with retry logic
DO $$
DECLARE
    result RECORD;
    retry_count INT := 0;
    max_retries INT := 3;
BEGIN
    LOOP
        SELECT * INTO result FROM process_order(1, 101, 2);
        
        IF result.status = 'SUCCESS' THEN
            RAISE NOTICE 'Order processed: %', result.message;
            EXIT;
        ELSIF result.status = 'RETRY' AND retry_count < max_retries THEN
            retry_count := retry_count + 1;
            RAISE NOTICE 'Retrying... Attempt %', retry_count;
            PERFORM pg_sleep(0.1); -- Brief delay
        ELSE
            RAISE NOTICE 'Order failed: %', result.message;
            EXIT;
        END IF;
    END LOOP;
END $$;
```

**Banking Transfer with Deadlock Prevention:**
```sql
-- MySQL: Safe money transfer with deadlock prevention
DELIMITER //
CREATE PROCEDURE transfer_money(
    IN from_account INT,
    IN to_account INT,
    IN amount DECIMAL(10,2),
    OUT result_status VARCHAR(50),
    OUT result_message TEXT
)
BEGIN
    DECLARE from_balance DECIMAL(10,2);
    DECLARE account1 INT;
    DECLARE account2 INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1
            result_message = MESSAGE_TEXT;
        SET result_status = 'ERROR';
    END;
    
    -- Prevent deadlocks by always locking accounts in same order
    IF from_account < to_account THEN
        SET account1 = from_account;
        SET account2 = to_account;
    ELSE
        SET account1 = to_account;
        SET account2 = from_account;
    END IF;
    
    START TRANSACTION;
    
    -- Lock accounts in consistent order
    SELECT balance INTO from_balance 
    FROM accounts 
    WHERE account_id = account1 
    FOR UPDATE;
    
    SELECT balance INTO @temp 
    FROM accounts 
    WHERE account_id = account2 
    FOR UPDATE;
    
    -- Check sufficient funds
    SELECT balance INTO from_balance 
    FROM accounts 
    WHERE account_id = from_account;
    
    IF from_balance < amount THEN
        SET result_status = 'INSUFFICIENT_FUNDS';
        SET result_message = CONCAT('Insufficient funds. Available: ', from_balance, ', Requested: ', amount);
        ROLLBACK;
    ELSE
        -- Perform transfer
        UPDATE accounts SET balance = balance - amount WHERE account_id = from_account;
        UPDATE accounts SET balance = balance + amount WHERE account_id = to_account;
        
        -- Log transaction
        INSERT INTO transaction_log (from_account, to_account, amount, transaction_date)
        VALUES (from_account, to_account, amount, NOW());
        
        SET result_status = 'SUCCESS';
        SET result_message = CONCAT('Transfer completed: $', amount, ' from account ', from_account, ' to account ', to_account);
        
        COMMIT;
    END IF;
END //
DELIMITER ;

-- Usage
CALL transfer_money(1, 2, 500.00, @status, @message);
SELECT @status, @message;
```

---

## 🔐 Locking Mechanisms

### Explicit Locking

**MySQL Locking:**
```sql
-- Table-level locking
LOCK TABLES customers READ, orders WRITE;
-- Perform operations
SELECT * FROM customers WHERE customer_id = 1;
INSERT INTO orders (customer_id, total_amount) VALUES (1, 100.00);
UNLOCK TABLES;

-- Row-level locking with SELECT FOR UPDATE
START TRANSACTION;

-- Lock specific rows for update
SELECT * FROM products 
WHERE category_id = 1 AND stock_quantity > 0
FOR UPDATE;

-- Update the locked rows
UPDATE products 
SET stock_quantity = stock_quantity - 1 
WHERE category_id = 1 AND stock_quantity > 0;

COMMIT;

-- Shared locks (SELECT FOR SHARE)
START TRANSACTION;

-- Multiple transactions can hold shared locks
SELECT * FROM customers WHERE customer_id = 1 FOR SHARE;

-- This allows other SELECT FOR SHARE but blocks SELECT FOR UPDATE
COMMIT;

-- Lock with timeout (MySQL 8.0+)
SELECT * FROM products WHERE product_id = 1 
FOR UPDATE NOWAIT; -- Fail immediately if can't lock

SELECT * FROM products WHERE product_id = 1 
FOR UPDATE SKIP LOCKED; -- Skip locked rows
```

**PostgreSQL Locking:**
```sql
-- Table-level locking
BEGIN;
LOCK TABLE customers IN ACCESS SHARE MODE; -- Least restrictive
LOCK TABLE orders IN ROW EXCLUSIVE MODE;   -- For INSERT/UPDATE/DELETE
LOCK TABLE products IN EXCLUSIVE MODE;     -- Most restrictive
COMMIT;

-- Row-level locking
BEGIN;

-- FOR UPDATE (exclusive row lock)
SELECT * FROM accounts WHERE account_id = 1 FOR UPDATE;

-- FOR NO KEY UPDATE (allows foreign key references)
SELECT * FROM customers WHERE customer_id = 1 FOR NO KEY UPDATE;

-- FOR SHARE (shared row lock)
SELECT * FROM products WHERE product_id = 1 FOR SHARE;

-- FOR KEY SHARE (weakest row lock)
SELECT * FROM categories WHERE category_id = 1 FOR KEY SHARE;

COMMIT;

-- Advisory locks (application-level)
SELECT pg_advisory_lock(12345); -- Block until lock acquired
SELECT pg_try_advisory_lock(12345); -- Return immediately (true/false)

-- Perform application logic
-- ...

SELECT pg_advisory_unlock(12345);

-- Session-level advisory locks
SELECT pg_advisory_lock_shared(12345); -- Shared advisory lock
SELECT pg_advisory_unlock_shared(12345);

-- Lock with timeout
BEGIN;
SET lock_timeout = '5s';
SELECT * FROM products WHERE product_id = 1 FOR UPDATE;
COMMIT;
```

### Deadlock Handling

**Deadlock Detection and Resolution:**
```sql
-- PostgreSQL: Deadlock detection example
CREATE OR REPLACE FUNCTION safe_transfer(
    from_acc INT,
    to_acc INT,
    amount DECIMAL
) RETURNS TEXT AS $$
DECLARE
    retry_count INT := 0;
    max_retries INT := 3;
BEGIN
    LOOP
        BEGIN
            -- Always lock accounts in same order to prevent deadlocks
            IF from_acc < to_acc THEN
                PERFORM * FROM accounts WHERE account_id = from_acc FOR UPDATE;
                PERFORM * FROM accounts WHERE account_id = to_acc FOR UPDATE;
            ELSE
                PERFORM * FROM accounts WHERE account_id = to_acc FOR UPDATE;
                PERFORM * FROM accounts WHERE account_id = from_acc FOR UPDATE;
            END IF;
            
            -- Perform transfer
            UPDATE accounts SET balance = balance - amount WHERE account_id = from_acc;
            UPDATE accounts SET balance = balance + amount WHERE account_id = to_acc;
            
            RETURN 'Transfer completed successfully';
            
        EXCEPTION
            WHEN deadlock_detected THEN
                retry_count := retry_count + 1;
                IF retry_count >= max_retries THEN
                    RAISE EXCEPTION 'Transfer failed after % retries due to deadlocks', max_retries;
                END IF;
                
                -- Random delay to reduce deadlock probability
                PERFORM pg_sleep(random() * 0.1);
                
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- MySQL: Deadlock handling
DELIMITER //
CREATE PROCEDURE safe_update_inventory(
    IN product_id_1 INT,
    IN quantity_1 INT,
    IN product_id_2 INT,
    IN quantity_2 INT
)
BEGIN
    DECLARE deadlock_count INT DEFAULT 0;
    DECLARE max_retries INT DEFAULT 3;
    DECLARE done INT DEFAULT FALSE;
    
    retry_loop: LOOP
        BEGIN
            DECLARE EXIT HANDLER FOR 1213 -- Deadlock error code
            BEGIN
                SET deadlock_count = deadlock_count + 1;
                IF deadlock_count >= max_retries THEN
                    RESIGNAL;
                END IF;
                ROLLBACK;
                -- Random delay
                DO SLEEP(RAND() * 0.1);
            END;
            
            START TRANSACTION;
            
            -- Lock products in consistent order
            IF product_id_1 < product_id_2 THEN
                SELECT stock_quantity FROM products WHERE product_id = product_id_1 FOR UPDATE;
                SELECT stock_quantity FROM products WHERE product_id = product_id_2 FOR UPDATE;
            ELSE
                SELECT stock_quantity FROM products WHERE product_id = product_id_2 FOR UPDATE;
                SELECT stock_quantity FROM products WHERE product_id = product_id_1 FOR UPDATE;
            END IF;
            
            -- Update inventory
            UPDATE products SET stock_quantity = stock_quantity - quantity_1 WHERE product_id = product_id_1;
            UPDATE products SET stock_quantity = stock_quantity - quantity_2 WHERE product_id = product_id_2;
            
            COMMIT;
            SET done = TRUE;
            
        END;
        
        IF done THEN
            LEAVE retry_loop;
        END IF;
    END LOOP;
END //
DELIMITER ;
```

---

## ⚡ Performance Optimization

### Transaction Best Practices

```sql
-- Keep transactions short
-- BAD: Long-running transaction
BEGIN;
SELECT * FROM large_table; -- Long-running query
UPDATE products SET price = price * 1.1; -- Locks many rows
-- User input or external API call
COMMIT;

-- GOOD: Short, focused transaction
BEGIN;
UPDATE products SET price = price * 1.1 WHERE category_id = 1;
COMMIT;

-- Batch processing for large operations
-- PostgreSQL: Process large updates in batches
DO $$
DECLARE
    batch_size INT := 1000;
    processed INT := 0;
    total_rows INT;
BEGIN
    SELECT COUNT(*) INTO total_rows FROM old_orders WHERE status = 'pending';
    
    WHILE processed < total_rows LOOP
        BEGIN
            UPDATE old_orders 
            SET status = 'expired' 
            WHERE order_id IN (
                SELECT order_id 
                FROM old_orders 
                WHERE status = 'pending' 
                  AND order_date < CURRENT_DATE - INTERVAL '30 days'
                LIMIT batch_size
            );
            
            processed := processed + batch_size;
            
            -- Commit each batch
            COMMIT;
            
            -- Brief pause to allow other transactions
            PERFORM pg_sleep(0.01);
            
        EXCEPTION
            WHEN OTHERS THEN
                ROLLBACK;
                RAISE NOTICE 'Batch failed at row %: %', processed, SQLERRM;
                EXIT;
        END;
    END LOOP;
    
    RAISE NOTICE 'Processed % rows in batches of %', processed, batch_size;
END $$;

-- MySQL: Batch processing with cursor
DELIMITER //
CREATE PROCEDURE batch_update_prices()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE batch_count INT DEFAULT 0;
    DECLARE product_cursor CURSOR FOR 
        SELECT product_id FROM products WHERE last_updated < DATE_SUB(NOW(), INTERVAL 1 YEAR);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN product_cursor;
    
    read_loop: LOOP
        START TRANSACTION;
        
        SET batch_count = 0;
        
        batch_loop: LOOP
            FETCH product_cursor INTO @product_id;
            
            IF done OR batch_count >= 100 THEN
                LEAVE batch_loop;
            END IF;
            
            UPDATE products 
            SET price = price * 1.05, last_updated = NOW() 
            WHERE product_id = @product_id;
            
            SET batch_count = batch_count + 1;
        END LOOP;
        
        COMMIT;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Brief pause
        DO SLEEP(0.01);
    END LOOP;
    
    CLOSE product_cursor;
END //
DELIMITER ;
```

### Connection Pooling and Transaction Management

```sql
-- PostgreSQL: Connection pooling considerations
-- Set appropriate timeout values
SET statement_timeout = '30s';
SET lock_timeout = '10s';
SET idle_in_transaction_session_timeout = '60s';

-- Monitor long-running transactions
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE state IN ('active', 'idle in transaction')
  AND now() - pg_stat_activity.query_start > interval '5 minutes'
ORDER BY duration DESC;

-- Kill long-running transactions if needed
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction'
  AND now() - query_start > interval '1 hour';

-- MySQL: Transaction monitoring
-- Check for long-running transactions
SELECT 
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_seconds,
    trx_mysql_thread_id,
    trx_query
FROM information_schema.INNODB_TRX
WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 300
ORDER BY duration_seconds DESC;

-- Check for locks
SELECT 
    r.trx_id AS waiting_trx_id,
    r.trx_mysql_thread_id AS waiting_thread,
    r.trx_query AS waiting_query,
    b.trx_id AS blocking_trx_id,
    b.trx_mysql_thread_id AS blocking_thread,
    b.trx_query AS blocking_query
FROM information_schema.INNODB_LOCK_WAITS w
INNER JOIN information_schema.INNODB_TRX b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.INNODB_TRX r ON r.trx_id = w.requesting_trx_id;

-- Kill blocking transaction if needed
KILL 12345; -- Replace with actual thread ID
```

---

## 🌐 Distributed Transactions

### Two-Phase Commit (2PC)

```sql
-- PostgreSQL: Prepared transactions (2PC)
-- Phase 1: Prepare
BEGIN;
INSERT INTO orders (customer_id, total_amount) VALUES (1, 100.00);
UPDATE inventory SET quantity = quantity - 1 WHERE product_id = 1;
PREPARE TRANSACTION 'order_txn_12345';

-- Phase 2: Commit or Rollback
-- On success:
COMMIT PREPARED 'order_txn_12345';

-- On failure:
ROLLBACK PREPARED 'order_txn_12345';

-- Check prepared transactions
SELECT * FROM pg_prepared_xacts;

-- Cleanup orphaned prepared transactions
SELECT 
    gid,
    prepared,
    owner,
    database
FROM pg_prepared_xacts
WHERE prepared < NOW() - INTERVAL '1 hour';

-- Example distributed transaction coordinator
CREATE OR REPLACE FUNCTION distributed_order_process(
    p_customer_id INT,
    p_product_id INT,
    p_quantity INT
) RETURNS BOOLEAN AS $$
DECLARE
    txn_id TEXT;
    inventory_success BOOLEAN := FALSE;
    payment_success BOOLEAN := FALSE;
BEGIN
    txn_id := 'order_' || p_customer_id || '_' || extract(epoch from now());
    
    -- Phase 1: Prepare all participants
    BEGIN
        -- Prepare inventory transaction
        BEGIN;
        UPDATE inventory SET quantity = quantity - p_quantity 
        WHERE product_id = p_product_id AND quantity >= p_quantity;
        
        IF NOT FOUND THEN
            ROLLBACK;
            RETURN FALSE;
        END IF;
        
        PREPARE TRANSACTION txn_id || '_inventory';
        inventory_success := TRUE;
        
        -- Prepare payment transaction
        BEGIN;
        INSERT INTO orders (customer_id, product_id, quantity, status)
        VALUES (p_customer_id, p_product_id, p_quantity, 'pending');
        
        -- Simulate payment processing
        IF random() > 0.1 THEN -- 90% success rate
            PREPARE TRANSACTION txn_id || '_payment';
            payment_success := TRUE;
        ELSE
            ROLLBACK;
            payment_success := FALSE;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Cleanup on error
            IF inventory_success THEN
                ROLLBACK PREPARED txn_id || '_inventory';
            END IF;
            RETURN FALSE;
    END;
    
    -- Phase 2: Commit or rollback all
    IF inventory_success AND payment_success THEN
        COMMIT PREPARED txn_id || '_inventory';
        COMMIT PREPARED txn_id || '_payment';
        RETURN TRUE;
    ELSE
        IF inventory_success THEN
            ROLLBACK PREPARED txn_id || '_inventory';
        END IF;
        IF payment_success THEN
            ROLLBACK PREPARED txn_id || '_payment';
        END IF;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Saga Pattern (Alternative to 2PC)

```sql
-- PostgreSQL: Saga pattern implementation
CREATE TABLE saga_transactions (
    saga_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'started',
    current_step INT DEFAULT 1,
    total_steps INT NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saga_steps (
    step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id UUID REFERENCES saga_transactions(saga_id),
    step_number INT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    forward_action TEXT,
    compensate_action TEXT,
    result JSONB,
    executed_at TIMESTAMP,
    compensated_at TIMESTAMP
);

-- Order processing saga
CREATE OR REPLACE FUNCTION start_order_saga(
    p_customer_id INT,
    p_product_id INT,
    p_quantity INT,
    p_amount DECIMAL
) RETURNS UUID AS $$
DECLARE
    saga_id UUID;
BEGIN
    -- Create saga transaction
    INSERT INTO saga_transactions (saga_type, total_steps, data)
    VALUES (
        'order_processing',
        4,
        jsonb_build_object(
            'customer_id', p_customer_id,
            'product_id', p_product_id,
            'quantity', p_quantity,
            'amount', p_amount
        )
    ) RETURNING saga_transactions.saga_id INTO saga_id;
    
    -- Define saga steps
    INSERT INTO saga_steps (saga_id, step_number, step_name, forward_action, compensate_action)
    VALUES 
    (saga_id, 1, 'reserve_inventory', 'reserve_product_inventory', 'release_product_inventory'),
    (saga_id, 2, 'process_payment', 'charge_customer_payment', 'refund_customer_payment'),
    (saga_id, 3, 'create_order', 'create_customer_order', 'cancel_customer_order'),
    (saga_id, 4, 'send_confirmation', 'send_order_confirmation', 'send_cancellation_notice');
    
    -- Start processing
    PERFORM process_saga_step(saga_id, 1);
    
    RETURN saga_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_saga_step(
    p_saga_id UUID,
    p_step_number INT
) RETURNS BOOLEAN AS $$
DECLARE
    saga_data JSONB;
    step_record RECORD;
    success BOOLEAN := FALSE;
BEGIN
    -- Get saga data
    SELECT data INTO saga_data FROM saga_transactions WHERE saga_id = p_saga_id;
    
    -- Get step details
    SELECT * INTO step_record FROM saga_steps 
    WHERE saga_id = p_saga_id AND step_number = p_step_number;
    
    -- Execute step based on step name
    CASE step_record.step_name
        WHEN 'reserve_inventory' THEN
            success := execute_inventory_reservation(saga_data);
        WHEN 'process_payment' THEN
            success := execute_payment_processing(saga_data);
        WHEN 'create_order' THEN
            success := execute_order_creation(saga_data);
        WHEN 'send_confirmation' THEN
            success := execute_confirmation_sending(saga_data);
    END CASE;
    
    -- Update step status
    UPDATE saga_steps 
    SET status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
        executed_at = CURRENT_TIMESTAMP
    WHERE saga_id = p_saga_id AND step_number = p_step_number;
    
    IF success THEN
        -- Move to next step or complete saga
        IF p_step_number < (SELECT total_steps FROM saga_transactions WHERE saga_id = p_saga_id) THEN
            UPDATE saga_transactions 
            SET current_step = p_step_number + 1
            WHERE saga_id = p_saga_id;
            
            PERFORM process_saga_step(p_saga_id, p_step_number + 1);
        ELSE
            UPDATE saga_transactions 
            SET status = 'completed'
            WHERE saga_id = p_saga_id;
        END IF;
    ELSE
        -- Start compensation
        UPDATE saga_transactions 
        SET status = 'compensating'
        WHERE saga_id = p_saga_id;
        
        PERFORM compensate_saga(p_saga_id, p_step_number - 1);
    END IF;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION compensate_saga(
    p_saga_id UUID,
    p_from_step INT
) RETURNS VOID AS $$
DECLARE
    step_record RECORD;
    saga_data JSONB;
BEGIN
    SELECT data INTO saga_data FROM saga_transactions WHERE saga_id = p_saga_id;
    
    -- Compensate steps in reverse order
    FOR step_record IN 
        SELECT * FROM saga_steps 
        WHERE saga_id = p_saga_id 
          AND step_number <= p_from_step 
          AND status = 'completed'
        ORDER BY step_number DESC
    LOOP
        -- Execute compensation action
        CASE step_record.step_name
            WHEN 'reserve_inventory' THEN
                PERFORM compensate_inventory_reservation(saga_data);
            WHEN 'process_payment' THEN
                PERFORM compensate_payment_processing(saga_data);
            WHEN 'create_order' THEN
                PERFORM compensate_order_creation(saga_data);
        END CASE;
        
        UPDATE saga_steps 
        SET status = 'compensated',
            compensated_at = CURRENT_TIMESTAMP
        WHERE step_id = step_record.step_id;
    END LOOP;
    
    UPDATE saga_transactions 
    SET status = 'compensated'
    WHERE saga_id = p_saga_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 💡 Real-World Business Examples

### Example 1: E-commerce Checkout Process

```sql
-- Complete checkout transaction with multiple validations
CREATE OR REPLACE FUNCTION process_checkout(
    p_customer_id INT,
    p_cart_items JSONB,
    p_payment_method VARCHAR(50),
    p_shipping_address JSONB
) RETURNS TABLE(
    success BOOLEAN,
    order_id INT,
    message TEXT,
    total_amount DECIMAL(10,2)
) AS $$
DECLARE
    v_order_id INT;
    v_total_amount DECIMAL(10,2) := 0;
    v_item JSONB;
    v_product RECORD;
    v_customer RECORD;
BEGIN
    -- Start transaction with appropriate isolation level
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    
    BEGIN
        -- Validate customer
        SELECT * INTO v_customer FROM customers 
        WHERE customer_id = p_customer_id AND status = 'active';
        
        IF NOT FOUND THEN
            RETURN QUERY SELECT FALSE, NULL::INT, 'Invalid customer'::TEXT, 0::DECIMAL(10,2);
            RETURN;
        END IF;
        
        -- Create order
        INSERT INTO orders (customer_id, status, order_date, shipping_address)
        VALUES (p_customer_id, 'processing', CURRENT_TIMESTAMP, p_shipping_address)
        RETURNING orders.order_id INTO v_order_id;
        
        -- Process each cart item
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
        LOOP
            -- Lock and validate product
            SELECT * INTO v_product FROM products 
            WHERE product_id = (v_item->>'product_id')::INT
              AND status = 'active'
            FOR UPDATE;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
            END IF;
            
            -- Check stock
            IF v_product.stock_quantity < (v_item->>'quantity')::INT THEN
                RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
                    v_product.product_name, v_product.stock_quantity, v_item->>'quantity';
            END IF;
            
            -- Add order item
            INSERT INTO order_items (
                order_id, product_id, quantity, unit_price, total_price
            ) VALUES (
                v_order_id,
                v_product.product_id,
                (v_item->>'quantity')::INT,
                v_product.price,
                v_product.price * (v_item->>'quantity')::INT
            );
            
            -- Update stock
            UPDATE products 
            SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT
            WHERE product_id = v_product.product_id;
            
            -- Add to total
            v_total_amount := v_total_amount + (v_product.price * (v_item->>'quantity')::INT);
        END LOOP;
        
        -- Update order total
        UPDATE orders SET total_amount = v_total_amount WHERE order_id = v_order_id;
        
        -- Process payment (simplified)
        INSERT INTO payments (
            order_id, customer_id, amount, payment_method, status, processed_at
        ) VALUES (
            v_order_id, p_customer_id, v_total_amount, p_payment_method, 'completed', CURRENT_TIMESTAMP
        );
        
        -- Update order status
        UPDATE orders SET status = 'confirmed' WHERE order_id = v_order_id;
        
        -- Update customer stats
        INSERT INTO customer_stats (customer_id, total_orders, total_spent, last_order_date)
        VALUES (p_customer_id, 1, v_total_amount, CURRENT_DATE)
        ON CONFLICT (customer_id) DO UPDATE SET
            total_orders = customer_stats.total_orders + 1,
            total_spent = customer_stats.total_spent + v_total_amount,
            last_order_date = CURRENT_DATE;
        
        RETURN QUERY SELECT TRUE, v_order_id, 'Order processed successfully'::TEXT, v_total_amount;
        
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT FALSE, NULL::INT, SQLERRM::TEXT, 0::DECIMAL(10,2);
    END;
END;
$$ LANGUAGE plpgsql;

-- Usage with retry logic for serialization failures
DO $$
DECLARE
    result RECORD;
    retry_count INT := 0;
    max_retries INT := 3;
    cart_data JSONB := '[
        {"product_id": 1, "quantity": 2},
        {"product_id": 3, "quantity": 1}
    ]';
    shipping_addr JSONB := '{
        "street": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345"
    }';
BEGIN
    LOOP
        BEGIN
            SELECT * INTO result FROM process_checkout(
                1, -- customer_id
                cart_data,
                'credit_card',
                shipping_addr
            );
            
            IF result.success THEN
                RAISE NOTICE 'Checkout successful! Order ID: %, Total: $%', 
                    result.order_id, result.total_amount;
                EXIT;
            ELSE
                RAISE NOTICE 'Checkout failed: %', result.message;
                EXIT;
            END IF;
            
        EXCEPTION
            WHEN serialization_failure THEN
                retry_count := retry_count + 1;
                IF retry_count >= max_retries THEN
                    RAISE NOTICE 'Checkout failed after % retries due to serialization conflicts', max_retries;
                    EXIT;
                END IF;
                
                RAISE NOTICE 'Serialization conflict, retrying... (attempt %)', retry_count;
                PERFORM pg_sleep(random() * 0.1);
        END;
    END LOOP;
END $$;
```

### Example 2: Banking System with Audit Trail

```sql
-- Comprehensive banking transaction system
CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    FOREIGN KEY (to_account_id) REFERENCES accounts(account_id)
);

CREATE TABLE transaction_audit (
    audit_id SERIAL PRIMARY KEY,
    transaction_id INT,
    action VARCHAR(20),
    old_values JSONB,
    new_values JSONB,
    user_id INT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Secure money transfer function
CREATE OR REPLACE FUNCTION transfer_funds(
    p_from_account VARCHAR(20),
    p_to_account VARCHAR(20),
    p_amount DECIMAL(15,2),
    p_description TEXT DEFAULT NULL,
    p_user_id INT DEFAULT NULL
) RETURNS TABLE(
    success BOOLEAN,
    transaction_id INT,
    reference_number VARCHAR(50),
    message TEXT
) AS $$
DECLARE
    v_from_account_id INT;
    v_to_account_id INT;
    v_from_balance DECIMAL(15,2);
    v_to_balance DECIMAL(15,2);
    v_transaction_id INT;
    v_reference_number VARCHAR(50);
    v_from_account_rec RECORD;
    v_to_account_rec RECORD;
BEGIN
    -- Generate unique reference number
    v_reference_number := 'TXN' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || 
                         lpad(floor(random() * 1000)::text, 3, '0');
    
    -- Use serializable isolation for consistency
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    
    BEGIN
        -- Lock and validate accounts in consistent order to prevent deadlocks
        IF p_from_account < p_to_account THEN
            SELECT * INTO v_from_account_rec FROM accounts 
            WHERE account_number = p_from_account AND status = 'active' FOR UPDATE;
            
            SELECT * INTO v_to_account_rec FROM accounts 
            WHERE account_number = p_to_account AND status = 'active' FOR UPDATE;
        ELSE
            SELECT * INTO v_to_account_rec FROM accounts 
            WHERE account_number = p_to_account AND status = 'active' FOR UPDATE;
            
            SELECT * INTO v_from_account_rec FROM accounts 
            WHERE account_number = p_from_account AND status = 'active' FOR UPDATE;
        END IF;
        
        -- Validate accounts exist
        IF v_from_account_rec.account_id IS NULL THEN
            RETURN QUERY SELECT FALSE, NULL::INT, NULL::VARCHAR(50), 
                'Source account not found or inactive'::TEXT;
            RETURN;
        END IF;
        
        IF v_to_account_rec.account_id IS NULL THEN
            RETURN QUERY SELECT FALSE, NULL::INT, NULL::VARCHAR(50), 
                'Destination account not found or inactive'::TEXT;
            RETURN;
        END IF;
        
        -- Validate amount
        IF p_amount <= 0 THEN
            RETURN QUERY SELECT FALSE, NULL::INT, NULL::VARCHAR(50), 
                'Transfer amount must be positive'::TEXT;
            RETURN;
        END IF;
        
        -- Check sufficient funds
        IF v_from_account_rec.balance < p_amount THEN
            RETURN QUERY SELECT FALSE, NULL::INT, NULL::VARCHAR(50), 
                format('Insufficient funds. Available: $%.2f, Requested: $%.2f', 
                       v_from_account_rec.balance, p_amount)::TEXT;
            RETURN;
        END IF;
        
        -- Create transaction record
        INSERT INTO transactions (
            from_account_id, to_account_id, transaction_type, amount, 
            description, reference_number, status
        ) VALUES (
            v_from_account_rec.account_id, v_to_account_rec.account_id, 'transfer', 
            p_amount, p_description, v_reference_number, 'processing'
        ) RETURNING transactions.transaction_id INTO v_transaction_id;
        
        -- Audit: Transaction created
        INSERT INTO transaction_audit (
            transaction_id, action, new_values, user_id, ip_address
        ) VALUES (
            v_transaction_id, 'created', 
            jsonb_build_object(
                'from_account', p_from_account,
                'to_account', p_to_account,
                'amount', p_amount,
                'reference', v_reference_number
            ),
            p_user_id, inet_client_addr()
        );
        
        -- Update account balances
        UPDATE accounts 
        SET balance = balance - p_amount, updated_at = CURRENT_TIMESTAMP
        WHERE account_id = v_from_account_rec.account_id;
        
        UPDATE accounts 
        SET balance = balance + p_amount, updated_at = CURRENT_TIMESTAMP
        WHERE account_id = v_to_account_rec.account_id;
        
        -- Update transaction status
        UPDATE transactions 
        SET status = 'completed', processed_at = CURRENT_TIMESTAMP
        WHERE transaction_id = v_transaction_id;
        
        -- Audit: Transaction completed
        INSERT INTO transaction_audit (
            transaction_id, action, new_values, user_id, ip_address
        ) VALUES (
            v_transaction_id, 'completed',
            jsonb_build_object(
                'from_balance_after', v_from_account_rec.balance - p_amount,
                'to_balance_after', v_to_account_rec.balance + p_amount,
                'processed_at', CURRENT_TIMESTAMP
            ),
            p_user_id, inet_client_addr()
        );
        
        RETURN QUERY SELECT TRUE, v_transaction_id, v_reference_number, 
            format('Transfer completed successfully. Reference: %s', v_reference_number)::TEXT;
        
    EXCEPTION
        WHEN serialization_failure THEN
            -- Update transaction status to failed
            IF v_transaction_id IS NOT NULL THEN
                UPDATE transactions 
                SET status = 'failed' 
                WHERE transaction_id = v_transaction_id;
                
                INSERT INTO transaction_audit (
                    transaction_id, action, new_values, user_id, ip_address
                ) VALUES (
                    v_transaction_id, 'failed',
                    jsonb_build_object('error', 'serialization_failure'),
                    p_user_id, inet_client_addr()
                );
            END IF;
            
            RETURN QUERY SELECT FALSE, v_transaction_id, v_reference_number, 
                'Transfer failed due to concurrent access. Please retry.'::TEXT;
            
        WHEN OTHERS THEN
            -- Update transaction status to failed
            IF v_transaction_id IS NOT NULL THEN
                UPDATE transactions 
                SET status = 'failed' 
                WHERE transaction_id = v_transaction_id;
                
                INSERT INTO transaction_audit (
                    transaction_id, action, new_values, user_id, ip_address
                ) VALUES (
                    v_transaction_id, 'failed',
                    jsonb_build_object('error', SQLERRM),
                    p_user_id, inet_client_addr()
                );
            END IF;
            
            RETURN QUERY SELECT FALSE, v_transaction_id, v_reference_number, 
                format('Transfer failed: %s', SQLERRM)::TEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage example with retry logic
CREATE OR REPLACE FUNCTION safe_transfer_with_retry(
    p_from_account VARCHAR(20),
    p_to_account VARCHAR(20),
    p_amount DECIMAL(15,2),
    p_description TEXT DEFAULT NULL,
    p_user_id INT DEFAULT NULL
) RETURNS TABLE(
    success BOOLEAN,
    transaction_id INT,
    reference_number VARCHAR(50),
    message TEXT,
    attempts INT
) AS $$
DECLARE
    result RECORD;
    retry_count INT := 0;
    max_retries INT := 3;
BEGIN
    LOOP
        SELECT * INTO result FROM transfer_funds(
            p_from_account, p_to_account, p_amount, p_description, p_user_id
        );
        
        IF result.success OR retry_count >= max_retries THEN
            RETURN QUERY SELECT result.success, result.transaction_id, 
                result.reference_number, result.message, retry_count + 1;
            RETURN;
        END IF;
        
        -- Only retry on serialization failures
        IF result.message LIKE '%concurrent access%' THEN
            retry_count := retry_count + 1;
            PERFORM pg_sleep(random() * 0.1); -- Random delay
        ELSE
            RETURN QUERY SELECT result.success, result.transaction_id, 
                result.reference_number, result.message, retry_count + 1;
            RETURN;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"Explain the ACID properties with examples."**
   - **Atomicity**: Bank transfer - both debit and credit must succeed
   - **Consistency**: Account balances must follow business rules
   - **Isolation**: Concurrent transfers don't interfere
   - **Durability**: Committed transactions survive system crashes

2. **"What's the difference between optimistic and pessimistic locking?"**
   - **Pessimistic**: Lock data when reading (SELECT FOR UPDATE)
   - **Optimistic**: Check for conflicts at commit time (version numbers)
   - **Use pessimistic** for high contention, critical data
   - **Use optimistic** for low contention, better performance

3. **"How do you handle deadlocks?"**
   - **Prevention**: Lock resources in consistent order
   - **Detection**: Database automatically detects and resolves
   - **Recovery**: Retry failed transactions with exponential backoff
   - **Monitoring**: Track deadlock frequency and patterns

4. **"When would you use different isolation levels?"**
   - **READ UNCOMMITTED**: Rarely, only for approximate analytics
   - **READ COMMITTED**: Default for most applications
   - **REPEATABLE READ**: Financial calculations, reporting
   - **SERIALIZABLE**: Critical business logic, audit requirements

### Best Practices:

1. **Keep transactions short and focused**
2. **Use appropriate isolation levels**
3. **Handle deadlocks gracefully with retries**
4. **Implement proper error handling and logging**
5. **Monitor transaction performance and blocking**
6. **Use connection pooling effectively**

---

## ⚠️ Things to Watch Out For

### 1. **Long-Running Transactions**
```sql
-- Problem: Transaction holds locks too long
BEGIN;
SELECT * FROM products FOR UPDATE; -- Locks all products
-- Long processing time or user input
UPDATE products SET price = price * 1.1;
COMMIT;

-- Solution: Minimize lock time
BEGIN;
SELECT product_id, price FROM products WHERE category_id = 1;
COMMIT;

-- Process data in application

BEGIN;
UPDATE products SET price = new_price WHERE product_id = specific_id;
COMMIT;
```

### 2. **Implicit Transactions**
```sql
-- Problem: Forgetting about auto-commit behavior
-- MySQL (auto-commit ON by default)
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
-- This commits immediately!
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
-- If this fails, first update is already committed

-- Solution: Explicit transaction control
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
COMMIT;
```

### 3. **Nested Transaction Confusion**
```sql
-- Problem: Misunderstanding nested transactions
-- PostgreSQL doesn't support true nested transactions
BEGIN;
  INSERT INTO orders VALUES (...);
  BEGIN; -- This is ignored!
    INSERT INTO order_items VALUES (...);
  ROLLBACK; -- This rolls back the entire transaction!
COMMIT; -- This will fail because transaction was rolled back

-- Solution: Use savepoints
BEGIN;
  INSERT INTO orders VALUES (...);
  SAVEPOINT order_created;
    INSERT INTO order_items VALUES (...);
  ROLLBACK TO SAVEPOINT order_created; -- Only rolls back to savepoint
  -- Order insert is still valid
COMMIT;
```

### 4. **Deadlock-Prone Code Patterns**
```sql
-- Problem: Inconsistent lock ordering
-- Session 1:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;
COMMIT;

-- Session 2 (concurrent):
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE account_id = 2;
UPDATE accounts SET balance = balance + 50 WHERE account_id = 1;
COMMIT;
-- Deadlock!

-- Solution: Consistent lock ordering
-- Both sessions:
BEGIN;
-- Always lock lower account_id first
IF from_account < to_account THEN
  SELECT * FROM accounts WHERE account_id = from_account FOR UPDATE;
  SELECT * FROM accounts WHERE account_id = to_account FOR UPDATE;
ELSE
  SELECT * FROM accounts WHERE account_id = to_account FOR UPDATE;
  SELECT * FROM accounts WHERE account_id = from_account FOR UPDATE;
END IF;
-- Perform updates
COMMIT;
```

### 5. **Isolation Level Misunderstanding**
```sql
-- Problem: Using wrong isolation level
-- Using SERIALIZABLE for everything (performance impact)
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT COUNT(*) FROM page_views; -- Simple analytics query

-- Solution: Use appropriate isolation level
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT COUNT(*) FROM page_views; -- Sufficient for analytics

-- Use SERIALIZABLE only when necessary
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
-- Critical financial calculations
SELECT SUM(balance) FROM accounts WHERE customer_id = 123;
```

### 6. **Connection Pool Exhaustion**
```sql
-- Problem: Holding connections too long
-- Application code (pseudo-code):
connection = get_connection()
connection.begin()
result = connection.execute("SELECT * FROM large_table")
-- Long processing time
process_large_result_set(result)
connection.commit()
connection.close()

-- Solution: Minimize connection hold time
connection = get_connection()
result = connection.execute("SELECT * FROM large_table")
connection.close()

-- Process data without holding connection
process_large_result_set(result)

-- New connection for updates
connection = get_connection()
connection.begin()
connection.execute("UPDATE table SET ...")
connection.commit()
connection.close()
```

### 7. **Phantom Read Confusion**
```sql
-- Problem: Not understanding phantom reads
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
SELECT COUNT(*) FROM orders WHERE status = 'pending'; -- Returns 10

-- Another session inserts new pending order

SELECT * FROM orders WHERE status = 'pending'; -- Might show 11 rows!
COMMIT;

-- Solution: Use SERIALIZABLE if phantom reads are problematic
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
SELECT COUNT(*) FROM orders WHERE status = 'pending';
-- New inserts will be blocked or cause serialization failure
SELECT * FROM orders WHERE status = 'pending';
COMMIT;
```

---

## 📚 Summary

Transactions and concurrency control are fundamental to maintaining data integrity in multi-user database systems. Key takeaways:

- **ACID properties** ensure reliable transaction processing
- **Isolation levels** control what changes are visible between transactions
- **Locking mechanisms** prevent data corruption from concurrent access
- **Deadlock prevention** requires consistent resource ordering
- **Performance optimization** involves keeping transactions short and using appropriate isolation levels
- **Error handling** must account for serialization failures and deadlocks
- **Monitoring** helps identify performance bottlenecks and blocking issues

Master these concepts to build robust, scalable database applications that handle concurrent users safely and efficiently.

---

## 🔗 Next Steps

In the next chapter, we'll explore **Database Security and User Management**, covering authentication, authorization, encryption, and security best practices for protecting sensitive data.

---

*Remember: Transactions are not just about data consistency—they're about building trust in your application's reliability.*