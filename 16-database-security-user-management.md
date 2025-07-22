# Chapter 16: Database Security and User Management

## 📚 What You'll Learn

Database security is critical for protecting sensitive data and ensuring compliance with regulations. This chapter covers authentication, authorization, encryption, auditing, and security best practices for MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand database security fundamentals
- Create and manage database users and roles
- Implement proper access control and permissions
- Configure SSL/TLS encryption
- Set up database auditing and monitoring
- Apply security best practices
- Handle common security vulnerabilities
- Implement data masking and anonymization

---

## 🔍 Concept Explanation

### Database Security Fundamentals

**The CIA Triad:**
- **Confidentiality**: Data is accessible only to authorized users
- **Integrity**: Data remains accurate and unmodified
- **Availability**: Data is accessible when needed

**Security Layers:**
1. **Network Security**: Firewalls, VPNs, network segmentation
2. **Authentication**: Verifying user identity
3. **Authorization**: Controlling what users can do
4. **Encryption**: Protecting data in transit and at rest
5. **Auditing**: Tracking database activities
6. **Application Security**: Preventing SQL injection, etc.

### Authentication vs Authorization

**Authentication** ("Who are you?"):
- Password-based authentication
- Certificate-based authentication
- Multi-factor authentication (MFA)
- LDAP/Active Directory integration
- OAuth/SAML integration

**Authorization** ("What can you do?"):
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Principle of least privilege
- Granular permissions

---

## 🛠️ User and Role Management

### MySQL User Management

```sql
-- Create users
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'ReadOnlyPass456!';
CREATE USER 'admin_user'@'10.0.0.%' IDENTIFIED BY 'AdminPass789!';

-- Create user with SSL requirement
CREATE USER 'secure_user'@'%' 
IDENTIFIED BY 'SecurePass123!' 
REQUIRE SSL;

-- Create user with certificate authentication
CREATE USER 'cert_user'@'%' 
IDENTIFIED BY 'CertPass123!' 
REQUIRE X509;

-- View users
SELECT User, Host, ssl_type, ssl_cipher, x509_issuer, x509_subject 
FROM mysql.user;

-- Modify user password
ALTER USER 'app_user'@'localhost' IDENTIFIED BY 'NewSecurePassword123!';

-- Set password expiration
ALTER USER 'app_user'@'localhost' PASSWORD EXPIRE INTERVAL 90 DAY;
ALTER USER 'temp_user'@'localhost' PASSWORD EXPIRE;

-- Account locking
ALTER USER 'suspicious_user'@'%' ACCOUNT LOCK;
ALTER USER 'suspicious_user'@'%' ACCOUNT UNLOCK;

-- Drop user
DROP USER 'old_user'@'localhost';

-- Create roles (MySQL 8.0+)
CREATE ROLE 'app_read', 'app_write', 'app_admin';

-- Grant privileges to roles
GRANT SELECT ON ecommerce.* TO 'app_read';
GRANT SELECT, INSERT, UPDATE ON ecommerce.* TO 'app_write';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'app_admin';

-- Grant roles to users
GRANT 'app_read' TO 'readonly_user'@'%';
GRANT 'app_write' TO 'app_user'@'localhost';
GRANT 'app_admin' TO 'admin_user'@'10.0.0.%';

-- Set default roles
SET DEFAULT ROLE 'app_read' TO 'readonly_user'@'%';
SET DEFAULT ROLE 'app_write' TO 'app_user'@'localhost';

-- Activate roles in session
SET ROLE 'app_admin';
SET ROLE ALL;
SET ROLE NONE;

-- View current roles
SELECT CURRENT_ROLE();
SHOW GRANTS FOR CURRENT_USER();
```

### PostgreSQL User Management

```sql
-- Create users (roles)
CREATE USER app_user WITH PASSWORD 'SecurePassword123!';
CREATE USER readonly_user WITH PASSWORD 'ReadOnlyPass456!';
CREATE ROLE admin_user WITH LOGIN PASSWORD 'AdminPass789!';

-- Create user with connection limits
CREATE USER limited_user WITH 
  PASSWORD 'LimitedPass123!' 
  CONNECTION LIMIT 5;

-- Create user with expiration
CREATE USER temp_user WITH 
  PASSWORD 'TempPass123!' 
  VALID UNTIL '2024-12-31';

-- Create role without login (for grouping permissions)
CREATE ROLE app_readers;
CREATE ROLE app_writers;
CREATE ROLE app_admins;

-- Grant role membership
GRANT app_readers TO readonly_user;
GRANT app_writers TO app_user;
GRANT app_admins TO admin_user;

-- Create role with inheritance
CREATE ROLE manager WITH 
  LOGIN 
  PASSWORD 'ManagerPass123!' 
  INHERIT; -- Can use privileges of granted roles automatically

-- Create role without inheritance
CREATE ROLE auditor WITH 
  LOGIN 
  PASSWORD 'AuditorPass123!' 
  NOINHERIT; -- Must explicitly SET ROLE to use granted privileges

-- Modify user attributes
ALTER USER app_user WITH PASSWORD 'NewSecurePassword123!';
ALTER USER app_user VALID UNTIL '2025-12-31';
ALTER USER app_user CONNECTION LIMIT 10;

-- Disable/enable user
ALTER USER suspicious_user WITH NOLOGIN;
ALTER USER suspicious_user WITH LOGIN;

-- View users and roles
\du
-- or
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, 
       rolcanlogin, rolconnlimit, rolvaliduntil
FROM pg_roles;

-- Drop user/role
DROP USER old_user;
DROP ROLE old_role;

-- Set role in session
SET ROLE app_admins;
SET ROLE NONE;
RESET ROLE;

-- View current user and roles
SELECT current_user, session_user;
SELECT * FROM pg_roles WHERE pg_has_role(current_user, oid, 'member');
```

---

## 🔐 Permissions and Privileges

### MySQL Privilege System

```sql
-- Database-level privileges
GRANT ALL PRIVILEGES ON ecommerce.* TO 'admin_user'@'10.0.0.%';
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce.* TO 'app_user'@'localhost';
GRANT SELECT ON ecommerce.* TO 'readonly_user'@'%';

-- Table-level privileges
GRANT SELECT, INSERT, UPDATE ON ecommerce.customers TO 'customer_service'@'%';
GRANT SELECT ON ecommerce.orders TO 'reporting_user'@'%';

-- Column-level privileges
GRANT SELECT (customer_id, first_name, last_name, email) 
ON ecommerce.customers TO 'limited_user'@'%';

GRANT UPDATE (status, updated_at) 
ON ecommerce.orders TO 'order_processor'@'%';

-- Stored procedure privileges
GRANT EXECUTE ON PROCEDURE ecommerce.process_order TO 'app_user'@'localhost';
GRANT EXECUTE ON FUNCTION ecommerce.calculate_tax TO 'app_user'@'localhost';

-- Administrative privileges
GRANT RELOAD, PROCESS, SHOW DATABASES ON *.* TO 'monitor_user'@'localhost';
GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'replica.example.com';

-- Grant with grant option (allows user to grant privileges to others)
GRANT SELECT ON ecommerce.products TO 'team_lead'@'%' WITH GRANT OPTION;

-- Revoke privileges
REVOKE INSERT, UPDATE ON ecommerce.customers FROM 'customer_service'@'%';
REVOKE ALL PRIVILEGES ON ecommerce.* FROM 'old_user'@'%';

-- View privileges
SHOW GRANTS FOR 'app_user'@'localhost';
SHOW GRANTS FOR CURRENT_USER();

-- View all user privileges
SELECT 
    GRANTEE,
    TABLE_SCHEMA,
    TABLE_NAME,
    PRIVILEGE_TYPE,
    IS_GRANTABLE
FROM information_schema.TABLE_PRIVILEGES
WHERE GRANTEE = "'app_user'@'localhost'";

-- Complex privilege example: E-commerce application
-- Create specialized roles
CREATE ROLE 'ecommerce_customer_service';
CREATE ROLE 'ecommerce_inventory_manager';
CREATE ROLE 'ecommerce_financial_analyst';

-- Customer service role
GRANT SELECT, UPDATE ON ecommerce.customers TO 'ecommerce_customer_service';
GRANT SELECT ON ecommerce.orders TO 'ecommerce_customer_service';
GRANT SELECT ON ecommerce.order_items TO 'ecommerce_customer_service';
GRANT INSERT ON ecommerce.customer_support_tickets TO 'ecommerce_customer_service';

-- Inventory manager role
GRANT SELECT, INSERT, UPDATE ON ecommerce.products TO 'ecommerce_inventory_manager';
GRANT SELECT, INSERT, UPDATE ON ecommerce.inventory TO 'ecommerce_inventory_manager';
GRANT SELECT ON ecommerce.orders TO 'ecommerce_inventory_manager';
GRANT SELECT ON ecommerce.order_items TO 'ecommerce_inventory_manager';

-- Financial analyst role (read-only with specific tables)
GRANT SELECT ON ecommerce.orders TO 'ecommerce_financial_analyst';
GRANT SELECT ON ecommerce.payments TO 'ecommerce_financial_analyst';
GRANT SELECT ON ecommerce.refunds TO 'ecommerce_financial_analyst';
GRANT SELECT (customer_id, total_spent, registration_date) 
ON ecommerce.customers TO 'ecommerce_financial_analyst';

-- Assign roles to users
GRANT 'ecommerce_customer_service' TO 'cs_agent1'@'%', 'cs_agent2'@'%';
GRANT 'ecommerce_inventory_manager' TO 'inventory_mgr'@'%';
GRANT 'ecommerce_financial_analyst' TO 'finance_team'@'%';
```

### PostgreSQL Privilege System

```sql
-- Database-level privileges
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO admin_user;
GRANT CONNECT ON DATABASE ecommerce TO app_user;
GRANT CONNECT ON DATABASE ecommerce TO readonly_user;

-- Schema-level privileges
GRANT ALL ON SCHEMA public TO admin_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT USAGE ON SCHEMA public TO readonly_user;

-- Table-level privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Grant on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO readonly_user;

-- Sequence privileges (for auto-increment)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE ON SEQUENCES TO app_user;

-- Function/procedure privileges
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT EXECUTE ON FUNCTIONS TO app_user;

-- Column-level privileges
GRANT SELECT (customer_id, first_name, last_name, email) 
ON customers TO limited_user;

GRANT UPDATE (status, updated_at) 
ON orders TO order_processor;

-- Row-level security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY customer_isolation ON customers
    FOR ALL TO app_user
    USING (customer_id = current_setting('app.current_customer_id')::int);

CREATE POLICY admin_all_access ON customers
    FOR ALL TO admin_user
    USING (true);

-- Enable RLS for specific users
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

-- Revoke privileges
REVOKE INSERT, UPDATE ON customers FROM customer_service;
REVOKE ALL PRIVILEGES ON DATABASE ecommerce FROM old_user;

-- View privileges
\dp customers
-- or
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE grantee = 'app_user';

-- View row-level security policies
\d+ customers
-- or
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'customers';

-- Complex example: Multi-tenant application
-- Create tenant-specific roles
CREATE ROLE tenant_admin;
CREATE ROLE tenant_user;
CREATE ROLE tenant_readonly;

-- Set up row-level security for multi-tenancy
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY tenant_orders ON orders
    FOR ALL TO tenant_user, tenant_readonly
    USING (tenant_id = current_setting('app.current_tenant_id')::int);

CREATE POLICY tenant_customers ON customers
    FOR ALL TO tenant_user, tenant_readonly
    USING (tenant_id = current_setting('app.current_tenant_id')::int);

-- Admin can see all
CREATE POLICY admin_all_orders ON orders
    FOR ALL TO tenant_admin
    USING (true);

CREATE POLICY admin_all_customers ON customers
    FOR ALL TO tenant_admin
    USING (true);

-- Set tenant context in application
-- This would be done by the application before each request
SET app.current_tenant_id = '123';

-- Now queries will only return data for tenant 123
SELECT * FROM orders; -- Only shows orders for tenant 123
```

---

## 🔒 SSL/TLS Encryption

### MySQL SSL Configuration

```sql
-- Check SSL status
SHOW VARIABLES LIKE '%ssl%';
STATUS; -- Shows SSL status in client

-- Check if SSL is enabled
SELECT @@have_ssl;

-- View SSL certificates
SHOW STATUS LIKE 'Ssl%';

-- Create user requiring SSL
CREATE USER 'ssl_user'@'%' 
IDENTIFIED BY 'SecurePass123!' 
REQUIRE SSL;

-- Create user requiring specific SSL certificate
CREATE USER 'cert_user'@'%' 
IDENTIFIED BY 'CertPass123!' 
REQUIRE X509;

-- Create user requiring specific certificate attributes
CREATE USER 'specific_cert_user'@'%' 
IDENTIFIED BY 'SpecificCertPass123!' 
REQUIRE ISSUER '/C=US/ST=CA/L=San Francisco/O=MyCompany/CN=MyCA'
AND SUBJECT '/C=US/ST=CA/L=San Francisco/O=MyCompany/CN=client';

-- Modify existing user to require SSL
ALTER USER 'existing_user'@'%' REQUIRE SSL;
ALTER USER 'existing_user'@'%' REQUIRE NONE; -- Remove SSL requirement

-- Check user SSL requirements
SELECT User, Host, ssl_type, ssl_cipher, x509_issuer, x509_subject 
FROM mysql.user 
WHERE User = 'ssl_user';

-- Connect with SSL (command line)
-- mysql --ssl-mode=REQUIRED -u ssl_user -p
-- mysql --ssl-ca=ca.pem --ssl-cert=client-cert.pem --ssl-key=client-key.pem -u cert_user -p
```

### PostgreSQL SSL Configuration

```sql
-- Check SSL status
SHOW ssl;
SELECT * FROM pg_stat_ssl WHERE pid = pg_backend_pid();

-- View SSL connection info
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    ssl,
    ssl_version,
    ssl_cipher
FROM pg_stat_ssl 
JOIN pg_stat_activity USING (pid)
WHERE ssl = true;

-- Configure SSL in postgresql.conf
-- ssl = on
-- ssl_cert_file = 'server.crt'
-- ssl_key_file = 'server.key'
-- ssl_ca_file = 'ca.crt'
-- ssl_crl_file = 'root.crl'

-- Configure client authentication in pg_hba.conf
-- hostssl all all 0.0.0.0/0 md5
-- hostssl all ssl_users 0.0.0.0/0 cert

-- Create user requiring SSL
CREATE USER ssl_user WITH PASSWORD 'SecurePass123!';
-- Then configure in pg_hba.conf:
-- hostssl ecommerce ssl_user 0.0.0.0/0 md5

-- Create user requiring client certificate
CREATE USER cert_user;
-- Configure in pg_hba.conf:
-- hostssl ecommerce cert_user 0.0.0.0/0 cert

-- Connect with SSL (command line)
-- psql "sslmode=require host=localhost dbname=ecommerce user=ssl_user"
-- psql "sslmode=require sslcert=client.crt sslkey=client.key sslrootcert=ca.crt host=localhost dbname=ecommerce user=cert_user"
```

---

## 📊 Database Auditing

### MySQL Audit Logging

```sql
-- Enable general query log
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/general.log';
SHOW VARIABLES LIKE 'general_log%';

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL long_query_time = 2; -- Log queries taking more than 2 seconds
SHOW VARIABLES LIKE 'slow_query_log%';

-- Enable binary log (for replication and point-in-time recovery)
SHOW VARIABLES LIKE 'log_bin%';
SHOW BINARY LOGS;
SHOW BINLOG EVENTS IN 'mysql-bin.000001';

-- MySQL Enterprise Audit (commercial feature)
-- Install audit plugin
-- INSTALL PLUGIN audit_log SONAME 'audit_log.so';

-- Configure audit logging
-- SET GLOBAL audit_log_policy = 'ALL';
-- SET GLOBAL audit_log_format = 'JSON';
-- SET GLOBAL audit_log_file = '/var/log/mysql/audit.log';

-- View audit log status
-- SHOW STATUS LIKE 'audit_log%';

-- Custom audit table approach
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    host_name VARCHAR(100),
    command_type VARCHAR(50),
    table_name VARCHAR(100),
    query_text TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    affected_rows INT,
    INDEX idx_user_time (user_name, timestamp),
    INDEX idx_table_time (table_name, timestamp)
);

-- Create audit trigger
DELIMITER //
CREATE TRIGGER customers_audit_insert
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host_name, command_type, table_name, query_text, affected_rows)
    VALUES (USER(), CONNECTION_ID(), 'INSERT', 'customers', 
            CONCAT('INSERT INTO customers VALUES (', NEW.customer_id, ', "', NEW.first_name, '", ...)'), 1);
END //

CREATE TRIGGER customers_audit_update
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host_name, command_type, table_name, query_text, affected_rows)
    VALUES (USER(), CONNECTION_ID(), 'UPDATE', 'customers',
            CONCAT('UPDATE customers SET ... WHERE customer_id = ', NEW.customer_id), 1);
END //

CREATE TRIGGER customers_audit_delete
AFTER DELETE ON customers
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host_name, command_type, table_name, query_text, affected_rows)
    VALUES (USER(), CONNECTION_ID(), 'DELETE', 'customers',
            CONCAT('DELETE FROM customers WHERE customer_id = ', OLD.customer_id), 1);
END //
DELIMITER ;

-- Query audit log
SELECT 
    user_name,
    command_type,
    table_name,
    COUNT(*) as operation_count,
    MIN(timestamp) as first_operation,
    MAX(timestamp) as last_operation
FROM audit_log
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY user_name, command_type, table_name
ORDER BY operation_count DESC;
```

### PostgreSQL Audit Logging

```sql
-- Enable logging in postgresql.conf
-- log_statement = 'all'  # Log all statements
-- log_min_duration_statement = 1000  # Log slow queries (1 second)
-- log_connections = on
-- log_disconnections = on
-- log_duration = on
-- log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '

-- Check current logging settings
SHOW log_statement;
SHOW log_min_duration_statement;
SHOW log_connections;

-- pgAudit extension (third-party)
-- CREATE EXTENSION pgaudit;

-- Configure pgAudit
-- SET pgaudit.log = 'all';
-- SET pgaudit.log_catalog = off;
-- SET pgaudit.log_parameter = on;
-- SET pgaudit.log_relation = on;
-- SET pgaudit.log_statement_once = on;

-- Custom audit table approach
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    schema_name TEXT,
    table_name TEXT,
    user_name TEXT,
    action TEXT,
    original_data JSONB,
    new_data JSONB,
    query TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table_time ON audit_log (table_name, timestamp);
CREATE INDEX idx_audit_log_user_time ON audit_log (user_name, timestamp);

-- Create audit function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (schema_name, table_name, user_name, action, new_data, query)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, current_user, TG_OP, row_to_json(NEW), current_query());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (schema_name, table_name, user_name, action, original_data, new_data, query)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, current_user, TG_OP, row_to_json(OLD), row_to_json(NEW), current_query());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (schema_name, table_name, user_name, action, original_data, query)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, current_user, TG_OP, row_to_json(OLD), current_query());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to tables
CREATE TRIGGER customers_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER orders_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Query audit log
SELECT 
    user_name,
    table_name,
    action,
    COUNT(*) as operation_count,
    MIN(timestamp) as first_operation,
    MAX(timestamp) as last_operation
FROM audit_log
WHERE timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY user_name, table_name, action
ORDER BY operation_count DESC;

-- View specific changes
SELECT 
    timestamp,
    user_name,
    action,
    original_data,
    new_data
FROM audit_log
WHERE table_name = 'customers'
  AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

---

## 🛡️ Security Best Practices

### 1. **Password Security**

```sql
-- MySQL: Password validation
-- Install password validation plugin
INSTALL PLUGIN validate_password SONAME 'validate_password.so';

-- Configure password policy
SET GLOBAL validate_password.policy = 'STRONG';
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;

-- Check password strength
SELECT VALIDATE_PASSWORD_STRENGTH('WeakPass');
SELECT VALIDATE_PASSWORD_STRENGTH('StrongP@ssw0rd123!');

-- PostgreSQL: Password encryption
-- Set password encryption method
SET password_encryption = 'scram-sha-256';

-- Create user with strong password
CREATE USER secure_user WITH PASSWORD 'StrongP@ssw0rd123!';

-- Check password encryption method
SELECT rolname, rolpassword FROM pg_authid WHERE rolname = 'secure_user';
```

### 2. **Network Security**

```sql
-- MySQL: Bind to specific interfaces
-- In my.cnf:
-- bind-address = 127.0.0.1  # Local only
-- bind-address = 10.0.0.5   # Specific IP

-- Skip name resolution for better security
-- skip-name-resolve = 1

-- PostgreSQL: Configure allowed connections
-- In postgresql.conf:
-- listen_addresses = 'localhost'  # Local only
-- listen_addresses = '10.0.0.5'   # Specific IP
-- port = 5432

-- In pg_hba.conf:
-- # TYPE  DATABASE        USER            ADDRESS                 METHOD
-- local   all             all                                     peer
-- host    all             all             127.0.0.1/32            md5
-- host    all             all             10.0.0.0/24             md5
-- hostssl all             all             0.0.0.0/0               md5

-- Disable remote root/superuser access
-- host    all             postgres        0.0.0.0/0               reject
```

### 3. **Principle of Least Privilege**

```sql
-- Create application-specific database
CREATE DATABASE ecommerce_app;

-- Create dedicated user for application
CREATE USER 'ecommerce_app'@'app-server.example.com' 
IDENTIFIED BY 'SecureAppPassword123!';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce_app.* TO 'ecommerce_app'@'app-server.example.com';

-- Don't grant:
-- - CREATE, DROP (structure changes)
-- - GRANT OPTION (privilege escalation)
-- - SUPER, RELOAD (administrative functions)
-- - FILE (file system access)

-- Create read-only user for reporting
CREATE USER 'reporting_user'@'report-server.example.com' 
IDENTIFIED BY 'ReportingPassword123!';

GRANT SELECT ON ecommerce_app.orders TO 'reporting_user'@'report-server.example.com';
GRANT SELECT ON ecommerce_app.customers TO 'reporting_user'@'report-server.example.com';
GRANT SELECT ON ecommerce_app.products TO 'reporting_user'@'report-server.example.com';

-- Create backup user with minimal privileges
CREATE USER 'backup_user'@'backup-server.example.com' 
IDENTIFIED BY 'BackupPassword123!';

GRANT SELECT, LOCK TABLES ON ecommerce_app.* TO 'backup_user'@'backup-server.example.com';
GRANT RELOAD ON *.* TO 'backup_user'@'backup-server.example.com';
```

### 4. **SQL Injection Prevention**

```sql
-- Use parameterized queries (application level)
-- BAD (vulnerable to SQL injection):
-- query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"

-- GOOD (parameterized query):
-- query = "SELECT * FROM users WHERE username = ? AND password = ?"
-- execute(query, [username, password])

-- Database-level protections
-- Disable dangerous functions if not needed
-- SET GLOBAL local_infile = 0;  -- MySQL

-- Use stored procedures for complex operations
DELIMITER //
CREATE PROCEDURE authenticate_user(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255),
    OUT p_user_id INT,
    OUT p_is_valid BOOLEAN
)
BEGIN
    DECLARE v_stored_password VARCHAR(255);
    DECLARE v_user_id INT DEFAULT NULL;
    
    -- Get stored password hash
    SELECT user_id, password_hash INTO v_user_id, v_stored_password
    FROM users 
    WHERE username = p_username AND status = 'active';
    
    -- Verify password (use proper hashing function)
    IF v_user_id IS NOT NULL AND v_stored_password = SHA2(CONCAT(p_password, 'salt'), 256) THEN
        SET p_user_id = v_user_id;
        SET p_is_valid = TRUE;
        
        -- Log successful login
        INSERT INTO login_log (user_id, login_time, ip_address, status)
        VALUES (v_user_id, NOW(), CONNECTION_ID(), 'success');
    ELSE
        SET p_user_id = NULL;
        SET p_is_valid = FALSE;
        
        -- Log failed login attempt
        INSERT INTO login_log (username, login_time, ip_address, status)
        VALUES (p_username, NOW(), CONNECTION_ID(), 'failed');
    END IF;
END //
DELIMITER ;

-- Grant execute permission only
GRANT EXECUTE ON PROCEDURE authenticate_user TO 'app_user'@'%';
```

### 5. **Data Encryption at Rest**

```sql
-- MySQL: Transparent Data Encryption (TDE)
-- Enable encryption for new tables
CREATE TABLE sensitive_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ssn VARCHAR(11),
    credit_card VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENCRYPTION='Y';

-- Encrypt existing table
ALTER TABLE customers ENCRYPTION='Y';

-- Check encryption status
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    CREATE_OPTIONS
FROM information_schema.TABLES
WHERE CREATE_OPTIONS LIKE '%ENCRYPTION%';

-- PostgreSQL: Column-level encryption
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE sensitive_data (
    id SERIAL PRIMARY KEY,
    ssn_encrypted BYTEA,
    credit_card_encrypted BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert encrypted data
INSERT INTO sensitive_data (ssn_encrypted, credit_card_encrypted)
VALUES (
    pgp_sym_encrypt('123-45-6789', 'encryption_key'),
    pgp_sym_encrypt('1234-5678-9012-3456', 'encryption_key')
);

-- Decrypt data
SELECT 
    id,
    pgp_sym_decrypt(ssn_encrypted, 'encryption_key') AS ssn,
    pgp_sym_decrypt(credit_card_encrypted, 'encryption_key') AS credit_card
FROM sensitive_data;

-- Create function for secure access
CREATE OR REPLACE FUNCTION get_customer_sensitive_data(
    p_customer_id INT,
    p_encryption_key TEXT
) RETURNS TABLE(
    customer_id INT,
    ssn TEXT,
    credit_card TEXT
) AS $$
BEGIN
    -- Check if user has permission
    IF NOT pg_has_role(current_user, 'sensitive_data_access', 'member') THEN
        RAISE EXCEPTION 'Access denied: insufficient privileges';
    END IF;
    
    RETURN QUERY
    SELECT 
        sd.id,
        pgp_sym_decrypt(sd.ssn_encrypted, p_encryption_key),
        pgp_sym_decrypt(sd.credit_card_encrypted, p_encryption_key)
    FROM sensitive_data sd
    WHERE sd.id = p_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎭 Data Masking and Anonymization

### Dynamic Data Masking

```sql
-- MySQL: Create masked views for sensitive data
CREATE VIEW customers_masked AS
SELECT 
    customer_id,
    first_name,
    last_name,
    CASE 
        WHEN CURRENT_USER() LIKE '%admin%' THEN email
        ELSE CONCAT(LEFT(email, 2), '***@', SUBSTRING_INDEX(email, '@', -1))
    END AS email,
    CASE 
        WHEN CURRENT_USER() LIKE '%admin%' THEN phone
        ELSE CONCAT('***-***-', RIGHT(phone, 4))
    END AS phone,
    CASE 
        WHEN CURRENT_USER() LIKE '%admin%' THEN address
        ELSE 'Address Hidden'
    END AS address,
    registration_date
FROM customers;

-- Grant access to masked view instead of table
GRANT SELECT ON customers_masked TO 'customer_service'@'%';
REVOKE SELECT ON customers FROM 'customer_service'@'%';

-- PostgreSQL: Row-level security with masking
CREATE OR REPLACE FUNCTION mask_sensitive_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user should see masked data
    IF NOT pg_has_role(current_user, 'full_data_access', 'member') THEN
        NEW.email := regexp_replace(NEW.email, '^(.{2}).*(@.*)$', '\1***\2');
        NEW.phone := regexp_replace(NEW.phone, '^(.{3}).*(.{4})$', '\1-***-\2');
        NEW.ssn := '***-**-' || right(NEW.ssn, 4);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply masking trigger
CREATE TRIGGER mask_customer_data
    BEFORE SELECT ON customers
    FOR EACH ROW
    WHEN (NOT pg_has_role(current_user, 'full_data_access', 'member'))
    EXECUTE FUNCTION mask_sensitive_data();
```

### Data Anonymization for Testing

```sql
-- Create anonymized copy of production data
CREATE TABLE customers_test AS
SELECT 
    customer_id,
    CONCAT('TestUser', customer_id) AS first_name,
    CONCAT('TestLast', customer_id) AS last_name,
    CONCAT('test', customer_id, '@example.com') AS email,
    CONCAT('555-', LPAD(FLOOR(RAND() * 10000), 4, '0'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0')) AS phone,
    CONCAT(FLOOR(RAND() * 9999) + 1, ' Test St, Test City, TS ', LPAD(FLOOR(RAND() * 100000), 5, '0')) AS address,
    registration_date,
    status
FROM customers;

-- PostgreSQL: More sophisticated anonymization
CREATE TABLE customers_anonymized AS
SELECT 
    customer_id,
    'Anonymous' || customer_id AS first_name,
    'User' || customer_id AS last_name,
    'user' || customer_id || '@testdomain.com' AS email,
    '555-' || lpad((random() * 10000)::int::text, 4, '0') || '-' || lpad((random() * 10000)::int::text, 4, '0') AS phone,
    (random() * 9999 + 1)::int || ' Anonymous St, Test City, TS ' || lpad((random() * 100000)::int::text, 5, '0') AS address,
    registration_date + (random() * interval '365 days') AS registration_date, -- Shift dates
    status
FROM customers;

-- Anonymize order amounts while preserving patterns
CREATE TABLE orders_anonymized AS
SELECT 
    order_id,
    customer_id,
    -- Multiply by random factor to preserve relative amounts
    (total_amount * (0.5 + random()))::decimal(10,2) AS total_amount,
    order_date + (random() * interval '365 days') AS order_date,
    status
FROM orders;
```

---

## 💡 Real-World Security Examples

### Example 1: Healthcare Database Security

```sql
-- HIPAA-compliant patient data system
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    medical_record_number VARCHAR(20) UNIQUE NOT NULL,
    first_name_encrypted BYTEA,
    last_name_encrypted BYTEA,
    ssn_encrypted BYTEA,
    date_of_birth_encrypted BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    last_accessed TIMESTAMP,
    last_accessed_by VARCHAR(100)
);

-- Enable row-level security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create roles
CREATE ROLE healthcare_provider;
CREATE ROLE nurse;
CREATE ROLE admin_staff;
CREATE ROLE billing_staff;

-- Doctors can see all patient data
CREATE POLICY doctor_full_access ON patients
    FOR ALL TO healthcare_provider
    USING (true);

-- Nurses can only see patients they're assigned to
CREATE POLICY nurse_assigned_patients ON patients
    FOR SELECT TO nurse
    USING (
        patient_id IN (
            SELECT patient_id FROM patient_assignments 
            WHERE nurse_id = current_setting('app.current_user_id')::int
        )
    );

-- Billing staff can only see billing-relevant data
CREATE POLICY billing_limited_access ON patients
    FOR SELECT TO billing_staff
    USING (true); -- But they'll use a view with limited columns

-- Create secure view for billing
CREATE VIEW patients_billing AS
SELECT 
    patient_id,
    medical_record_number,
    'PROTECTED' AS first_name,
    'PROTECTED' AS last_name,
    created_at
FROM patients;

GRANT SELECT ON patients_billing TO billing_staff;

-- Audit access to patient data
CREATE OR REPLACE FUNCTION audit_patient_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO patient_access_log (
        patient_id,
        accessed_by,
        access_type,
        access_time,
        ip_address
    ) VALUES (
        COALESCE(NEW.patient_id, OLD.patient_id),
        current_user,
        TG_OP,
        CURRENT_TIMESTAMP,
        inet_client_addr()
    );
    
    -- Update last accessed info
    IF TG_OP = 'SELECT' OR TG_OP = 'UPDATE' THEN
        UPDATE patients 
        SET last_accessed = CURRENT_TIMESTAMP,
            last_accessed_by = current_user
        WHERE patient_id = NEW.patient_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_access_audit
    AFTER SELECT OR INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_patient_access();
```

### Example 2: Financial Services Security

```sql
-- Bank account system with strict security
CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    balance_encrypted BYTEA NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_transaction_at TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_account_id INT,
    to_account_id INT,
    amount_encrypted BYTEA NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description_encrypted BYTEA,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by VARCHAR(100)
);

-- Create security roles
CREATE ROLE bank_teller;
CREATE ROLE account_manager;
CREATE ROLE compliance_officer;
CREATE ROLE system_admin;

-- Tellers can only see basic account info
CREATE POLICY teller_account_access ON accounts
    FOR SELECT TO bank_teller
    USING (
        customer_id IN (
            SELECT customer_id FROM teller_assignments 
            WHERE teller_id = current_setting('app.current_user_id')::int
        )
    );

-- Account managers can see their assigned customers
CREATE POLICY manager_account_access ON accounts
    FOR ALL TO account_manager
    USING (
        customer_id IN (
            SELECT customer_id FROM customer_assignments 
            WHERE manager_id = current_setting('app.current_user_id')::int
        )
    );

-- Compliance officers can see all data but read-only
CREATE POLICY compliance_read_access ON accounts
    FOR SELECT TO compliance_officer
    USING (true);

CREATE POLICY compliance_read_transactions ON transactions
    FOR SELECT TO compliance_officer
    USING (true);

-- Secure transaction function
CREATE OR REPLACE FUNCTION secure_transfer(
    p_from_account VARCHAR(20),
    p_to_account VARCHAR(20),
    p_amount DECIMAL(15,2),
    p_description TEXT,
    p_encryption_key TEXT
) RETURNS TABLE(
    success BOOLEAN,
    transaction_id INT,
    message TEXT
) SECURITY DEFINER AS $$
DECLARE
    v_from_balance DECIMAL(15,2);
    v_transaction_id INT;
BEGIN
    -- Verify user has transfer privileges
    IF NOT pg_has_role(current_user, 'transfer_authorized', 'member') THEN
        RETURN QUERY SELECT FALSE, NULL::INT, 'Unauthorized: Transfer privilege required';
        RETURN;
    END IF;
    
    -- Additional security checks
    IF p_amount > 10000 AND NOT pg_has_role(current_user, 'high_value_transfer', 'member') THEN
        RETURN QUERY SELECT FALSE, NULL::INT, 'Unauthorized: High value transfer requires special authorization';
        RETURN;
    END IF;
    
    -- Proceed with secure transfer logic
    -- (Implementation similar to previous examples but with encryption)
    
    RETURN QUERY SELECT TRUE, v_transaction_id, 'Transfer completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission only to authorized roles
GRANT EXECUTE ON FUNCTION secure_transfer TO bank_teller, account_manager;
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions:

1. **"How do you secure a database?"**
   - **Network**: Firewalls, VPNs, SSL/TLS
   - **Authentication**: Strong passwords, MFA, certificates
   - **Authorization**: RBAC, principle of least privilege
   - **Encryption**: Data at rest and in transit
   - **Auditing**: Log all access and changes
   - **Monitoring**: Detect suspicious activities

2. **"What's the difference between authentication and authorization?"**
   - **Authentication**: Verifying identity ("Who are you?")
   - **Authorization**: Controlling access ("What can you do?")
   - Example: Login (authentication) → Check permissions (authorization)

3. **"How do you prevent SQL injection?"**
   - **Parameterized queries**: Use placeholders for user input
   - **Input validation**: Sanitize and validate all inputs
   - **Stored procedures**: Encapsulate database logic
   - **Least privilege**: Limit database user permissions
   - **WAF**: Web Application Firewall for additional protection

4. **"Explain row-level security."**
   - **Concept**: Filter rows based on user context
   - **Implementation**: Policies that define access rules
   - **Use cases**: Multi-tenant applications, data privacy
   - **Performance**: Consider impact on query performance

### Security Best Practices:

1. **Defense in depth**: Multiple security layers
2. **Regular updates**: Keep database software current
3. **Strong authentication**: Complex passwords, MFA
4. **Principle of least privilege**: Minimal necessary access
5. **Encryption everywhere**: Data at rest and in transit
6. **Comprehensive auditing**: Log all database activities
7. **Regular security assessments**: Penetration testing, vulnerability scans
8. **Incident response plan**: Prepare for security breaches

---

## ⚠️ Things to Watch Out For

### 1. **Overprivileged Users**
```sql
-- Problem: Giving too many privileges
GRANT ALL PRIVILEGES ON *.* TO 'app_user'@'%'; -- Too broad!

-- Solution: Grant specific privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON ecommerce.* TO 'app_user'@'%';
```

### 2. **Weak Password Policies**
```sql
-- Problem: Weak passwords
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';

-- Solution: Strong password requirements
CREATE USER 'admin'@'%' IDENTIFIED BY 'StrongP@ssw0rd123!';
```

### 3. **Unencrypted Connections**
```sql
-- Problem: Allowing unencrypted connections
-- host all all 0.0.0.0/0 md5

-- Solution: Require SSL
-- hostssl all all 0.0.0.0/0 md5
```

### 4. **Missing Audit Trails**
```sql
-- Problem: No logging of sensitive operations
-- Solution: Comprehensive audit logging
CREATE TRIGGER audit_sensitive_table
    AFTER INSERT OR UPDATE OR DELETE ON sensitive_table
    FOR EACH ROW EXECUTE FUNCTION audit_function();
```

### 5. **Storing Sensitive Data in Plain Text**
```sql
-- Problem: Plain text sensitive data
CREATE TABLE users (
    id INT,
    username VARCHAR(50),
    password VARCHAR(50), -- Plain text!
    ssn VARCHAR(11)       -- Plain text!
);

-- Solution: Encrypt sensitive data
CREATE TABLE users (
    id INT,
    username VARCHAR(50),
    password_hash VARCHAR(255), -- Hashed
    ssn_encrypted BYTEA         -- Encrypted
);
```

---

## 📚 Summary

Database security is a multi-layered approach that requires:

- **Strong authentication** and authorization mechanisms
- **Proper user and role management** with least privilege
- **Encryption** for data protection at rest and in transit
- **Comprehensive auditing** for compliance and monitoring
- **Regular security assessments** and updates
- **Defense in depth** strategy with multiple security layers

Implementing these security measures protects sensitive data, ensures compliance with regulations, and maintains user trust in your applications.

---

## 🔗 Next Steps

In the next chapter, we'll explore **Backup and Recovery**, covering backup strategies, point-in-time recovery, disaster recovery planning, and high availability configurations.

---

*Remember: Security is not a one-time setup—it's an ongoing process that requires constant vigilance and updates.*