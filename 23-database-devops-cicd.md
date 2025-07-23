# Chapter 23: Database DevOps & CI/CD

## 📚 Learning Objectives

By the end of this chapter, you will:
- Understand Database DevOps principles and practices
- Learn database version control and schema migration strategies
- Implement CI/CD pipelines for database changes
- Master database testing strategies (unit, integration, performance)
- Understand Infrastructure as Code (IaC) for databases
- Learn database monitoring and observability in DevOps
- Implement automated database deployment strategies
- Understand database rollback and disaster recovery in CI/CD

---

## 🔄 Introduction to Database DevOps

### What is Database DevOps?

Database DevOps extends traditional DevOps practices to database development and operations:

- **Version Control**: Track database schema and data changes
- **Automated Testing**: Ensure database changes don't break functionality
- **Continuous Integration**: Automatically validate database changes
- **Continuous Deployment**: Safely deploy database changes to production
- **Monitoring**: Track database performance and health
- **Collaboration**: Bridge the gap between developers and DBAs

### Key Principles

1. **Everything as Code**: Database schemas, configurations, and deployments
2. **Automation**: Reduce manual processes and human error
3. **Collaboration**: Shared responsibility between teams
4. **Continuous Feedback**: Monitor and improve continuously
5. **Fail Fast**: Detect issues early in the development cycle

---

## 📝 Database Version Control

### Schema Migration Tools

#### Flyway (Java-based)

```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

```sql
-- V2__Add_user_preferences.sql
ALTER TABLE users ADD COLUMN preferences JSON;

CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
```

```properties
# flyway.conf
flyway.url=jdbc:mysql://localhost:3306/myapp_dev
flyway.user=flyway_user
flyway.password=flyway_password
flyway.locations=filesystem:./migrations
flyway.baselineOnMigrate=true
flyway.validateOnMigrate=true
flyway.cleanDisabled=true
```

```bash
#!/bin/bash
# flyway-migrate.sh

set -e

ENVIRONMENT=${1:-dev}
CONFIG_FILE="flyway-${ENVIRONMENT}.conf"

echo "Running Flyway migration for environment: $ENVIRONMENT"

# Validate configuration
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file $CONFIG_FILE not found"
    exit 1
fi

# Run migration
flyway -configFiles="$CONFIG_FILE" info
flyway -configFiles="$CONFIG_FILE" migrate

echo "Migration completed successfully"
```

#### Liquibase (XML/YAML/JSON/SQL)

```xml
<!-- db.changelog-master.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">

    <include file="db/changelog/001-create-users-table.xml"/>
    <include file="db/changelog/002-add-user-preferences.xml"/>
    <include file="db/changelog/003-create-orders-table.xml"/>
    
</databaseChangeLog>
```

```xml
<!-- db/changelog/001-create-users-table.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-4.0.xsd">

    <changeSet id="001-create-users-table" author="developer">
        <createTable tableName="users">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="email" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="name" type="VARCHAR(100)">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
            <column name="updated_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
        
        <createIndex tableName="users" indexName="idx_users_email">
            <column name="email"/>
        </createIndex>
        
        <rollback>
            <dropTable tableName="users"/>
        </rollback>
    </changeSet>
    
</databaseChangeLog>
```

```yaml
# liquibase.yml
databaseChangeLog:
  - changeSet:
      id: 002-add-user-preferences
      author: developer
      changes:
        - addColumn:
            tableName: users
            columns:
              - column:
                  name: preferences
                  type: JSON
        - createTable:
            tableName: user_sessions
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: user_id
                  type: BIGINT
                  constraints:
                    nullable: false
              - column:
                  name: session_token
                  type: VARCHAR(255)
                  constraints:
                    nullable: false
                    unique: true
              - column:
                  name: expires_at
                  type: TIMESTAMP
                  constraints:
                    nullable: false
              - column:
                  name: created_at
                  type: TIMESTAMP
                  defaultValueComputed: CURRENT_TIMESTAMP
                  constraints:
                    nullable: false
        - addForeignKeyConstraint:
            baseTableName: user_sessions
            baseColumnNames: user_id
            referencedTableName: users
            referencedColumnNames: id
            constraintName: fk_user_sessions_user_id
            onDelete: CASCADE
        - createIndex:
            tableName: user_sessions
            indexName: idx_user_sessions_token
            columns:
              - column:
                  name: session_token
        - createIndex:
            tableName: user_sessions
            indexName: idx_user_sessions_user_id
            columns:
              - column:
                  name: user_id
      rollback:
        - dropTable:
            tableName: user_sessions
        - dropColumn:
            tableName: users
            columnName: preferences
```

### Git-based Database Workflows

```bash
#!/bin/bash
# git-db-workflow.sh

set -e

# Database development workflow
function db_feature_start() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        echo "Usage: db_feature_start <feature_name>"
        exit 1
    fi
    
    # Create feature branch
    git checkout -b "feature/db-$feature_name"
    
    # Create migration directory
    mkdir -p "migrations/$(date +%Y%m%d)_$feature_name"
    
    echo "Database feature branch created: feature/db-$feature_name"
}

function db_feature_test() {
    # Run database tests
    echo "Running database tests..."
    
    # Create test database
    mysql -u root -p -e "DROP DATABASE IF EXISTS myapp_test; CREATE DATABASE myapp_test;"
    
    # Run migrations on test database
    flyway -configFiles=flyway-test.conf migrate
    
    # Run database unit tests
    npm run test:db
    
    # Run integration tests
    npm run test:integration
    
    echo "Database tests completed successfully"
}

function db_feature_finish() {
    local feature_name=$1
    
    # Run tests
    db_feature_test
    
    # Merge to develop
    git checkout develop
    git merge "feature/db-$feature_name"
    
    # Clean up
    git branch -d "feature/db-$feature_name"
    
    echo "Database feature merged and cleaned up"
}

# Parse command line arguments
case "$1" in
    "start")
        db_feature_start "$2"
        ;;
    "test")
        db_feature_test
        ;;
    "finish")
        db_feature_finish "$2"
        ;;
    *)
        echo "Usage: $0 {start|test|finish} [feature_name]"
        exit 1
        ;;
esac
```

---

## 🧪 Database Testing Strategies

### Unit Testing for Database Objects

```sql
-- tests/test_user_functions.sql
-- Unit tests for user-related stored procedures and functions

DELIMITER //

-- Test setup procedure
CREATE PROCEDURE test_setup()
BEGIN
    -- Clean test data
    DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
    DELETE FROM users WHERE email LIKE '%test%';
    
    -- Insert test data
    INSERT INTO users (email, name) VALUES 
        ('test1@example.com', 'Test User 1'),
        ('test2@example.com', 'Test User 2');
END//

-- Test teardown procedure
CREATE PROCEDURE test_teardown()
BEGIN
    DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
    DELETE FROM users WHERE email LIKE '%test%';
END//

-- Test create_user_session function
CREATE PROCEDURE test_create_user_session()
BEGIN
    DECLARE user_id BIGINT;
    DECLARE session_token VARCHAR(255);
    DECLARE session_count INT;
    
    -- Setup
    CALL test_setup();
    
    -- Get test user ID
    SELECT id INTO user_id FROM users WHERE email = 'test1@example.com';
    
    -- Test: Create user session
    CALL create_user_session(user_id, session_token);
    
    -- Verify: Session was created
    SELECT COUNT(*) INTO session_count 
    FROM user_sessions 
    WHERE user_id = user_id AND session_token = session_token;
    
    IF session_count != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Test failed: Session not created';
    END IF;
    
    -- Verify: Session token is not null
    IF session_token IS NULL OR LENGTH(session_token) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Test failed: Invalid session token';
    END IF;
    
    -- Cleanup
    CALL test_teardown();
    
    SELECT 'test_create_user_session PASSED' AS result;
END//

-- Test validate_user_session function
CREATE PROCEDURE test_validate_user_session()
BEGIN
    DECLARE user_id BIGINT;
    DECLARE session_token VARCHAR(255);
    DECLARE is_valid BOOLEAN;
    
    -- Setup
    CALL test_setup();
    
    -- Get test user ID
    SELECT id INTO user_id FROM users WHERE email = 'test1@example.com';
    
    -- Create a session
    CALL create_user_session(user_id, session_token);
    
    -- Test: Validate valid session
    SELECT validate_user_session(session_token) INTO is_valid;
    
    IF NOT is_valid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Test failed: Valid session not recognized';
    END IF;
    
    -- Test: Validate invalid session
    SELECT validate_user_session('invalid_token') INTO is_valid;
    
    IF is_valid THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Test failed: Invalid session recognized as valid';
    END IF;
    
    -- Cleanup
    CALL test_teardown();
    
    SELECT 'test_validate_user_session PASSED' AS result;
END//

DELIMITER ;

-- Run all tests
CALL test_create_user_session();
CALL test_validate_user_session();
```

### Integration Testing with Python

```python
# tests/test_database_integration.py
import pytest
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import json

class DatabaseIntegrationTest:
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    def setup_method(self):
        """Setup test database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_TEST_HOST', 'localhost'),
                database=os.getenv('DB_TEST_NAME', 'myapp_test'),
                user=os.getenv('DB_TEST_USER', 'test_user'),
                password=os.getenv('DB_TEST_PASSWORD', 'test_password')
            )
            self.cursor = self.connection.cursor(dictionary=True)
            
            # Clean test data
            self.cleanup_test_data()
            
        except Error as e:
            pytest.fail(f"Failed to connect to test database: {e}")
    
    def teardown_method(self):
        """Cleanup after test"""
        if self.connection and self.connection.is_connected():
            self.cleanup_test_data()
            self.cursor.close()
            self.connection.close()
    
    def cleanup_test_data(self):
        """Remove test data"""
        cleanup_queries = [
            "DELETE FROM user_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%')",
            "DELETE FROM users WHERE email LIKE '%test%'"
        ]
        
        for query in cleanup_queries:
            self.cursor.execute(query)
        
        self.connection.commit()
    
    def test_user_creation_and_retrieval(self):
        """Test user creation and retrieval"""
        # Insert test user
        insert_query = """
        INSERT INTO users (email, name, preferences) 
        VALUES (%s, %s, %s)
        """
        
        test_preferences = json.dumps({
            "theme": "dark",
            "notifications": True,
            "language": "en"
        })
        
        self.cursor.execute(insert_query, (
            'integration_test@example.com',
            'Integration Test User',
            test_preferences
        ))
        
        user_id = self.cursor.lastrowid
        self.connection.commit()
        
        # Retrieve user
        select_query = "SELECT * FROM users WHERE id = %s"
        self.cursor.execute(select_query, (user_id,))
        user = self.cursor.fetchone()
        
        # Assertions
        assert user is not None
        assert user['email'] == 'integration_test@example.com'
        assert user['name'] == 'Integration Test User'
        assert json.loads(user['preferences'])['theme'] == 'dark'
        assert user['created_at'] is not None
        assert user['updated_at'] is not None
    
    def test_user_session_workflow(self):
        """Test complete user session workflow"""
        # Create user
        insert_user_query = """
        INSERT INTO users (email, name) 
        VALUES (%s, %s)
        """
        
        self.cursor.execute(insert_user_query, (
            'session_test@example.com',
            'Session Test User'
        ))
        
        user_id = self.cursor.lastrowid
        self.connection.commit()
        
        # Create session using stored procedure
        session_token = None
        create_session_query = "CALL create_user_session(%s, @session_token)"
        self.cursor.execute(create_session_query, (user_id,))
        
        # Get the session token
        self.cursor.execute("SELECT @session_token AS session_token")
        result = self.cursor.fetchone()
        session_token = result['session_token']
        
        self.connection.commit()
        
        # Verify session exists
        verify_query = """
        SELECT * FROM user_sessions 
        WHERE user_id = %s AND session_token = %s
        """
        
        self.cursor.execute(verify_query, (user_id, session_token))
        session = self.cursor.fetchone()
        
        assert session is not None
        assert session['user_id'] == user_id
        assert session['session_token'] == session_token
        assert session['expires_at'] > datetime.now()
        
        # Validate session using function
        validate_query = "SELECT validate_user_session(%s) AS is_valid"
        self.cursor.execute(validate_query, (session_token,))
        validation_result = self.cursor.fetchone()
        
        assert validation_result['is_valid'] == 1
        
        # Test invalid session
        self.cursor.execute(validate_query, ('invalid_token',))
        invalid_result = self.cursor.fetchone()
        
        assert invalid_result['is_valid'] == 0
    
    def test_database_constraints(self):
        """Test database constraints and error handling"""
        # Test unique constraint on email
        insert_query = """
        INSERT INTO users (email, name) 
        VALUES (%s, %s)
        """
        
        # Insert first user
        self.cursor.execute(insert_query, (
            'constraint_test@example.com',
            'Constraint Test User 1'
        ))
        self.connection.commit()
        
        # Try to insert duplicate email
        with pytest.raises(mysql.connector.IntegrityError):
            self.cursor.execute(insert_query, (
                'constraint_test@example.com',
                'Constraint Test User 2'
            ))
            self.connection.commit()
    
    def test_transaction_rollback(self):
        """Test transaction rollback functionality"""
        # Start transaction
        self.connection.start_transaction()
        
        try:
            # Insert user
            insert_user_query = """
            INSERT INTO users (email, name) 
            VALUES (%s, %s)
            """
            
            self.cursor.execute(insert_user_query, (
                'transaction_test@example.com',
                'Transaction Test User'
            ))
            
            user_id = self.cursor.lastrowid
            
            # Insert session
            insert_session_query = """
            INSERT INTO user_sessions (user_id, session_token, expires_at) 
            VALUES (%s, %s, %s)
            """
            
            self.cursor.execute(insert_session_query, (
                user_id,
                'test_session_token',
                datetime.now() + timedelta(hours=1)
            ))
            
            # Simulate error condition
            raise Exception("Simulated error")
            
        except Exception:
            # Rollback transaction
            self.connection.rollback()
        
        # Verify no data was inserted
        check_user_query = "SELECT COUNT(*) as count FROM users WHERE email = %s"
        self.cursor.execute(check_user_query, ('transaction_test@example.com',))
        user_count = self.cursor.fetchone()['count']
        
        check_session_query = "SELECT COUNT(*) as count FROM user_sessions WHERE session_token = %s"
        self.cursor.execute(check_session_query, ('test_session_token',))
        session_count = self.cursor.fetchone()['count']
        
        assert user_count == 0
        assert session_count == 0
    
    def test_performance_with_indexes(self):
        """Test query performance with indexes"""
        import time
        
        # Insert test data
        insert_query = """
        INSERT INTO users (email, name) 
        VALUES (%s, %s)
        """
        
        test_users = [
            (f'perf_test_{i}@example.com', f'Performance Test User {i}')
            for i in range(1000)
        ]
        
        self.cursor.executemany(insert_query, test_users)
        self.connection.commit()
        
        # Test query performance with index
        start_time = time.time()
        
        search_query = "SELECT * FROM users WHERE email = %s"
        self.cursor.execute(search_query, ('perf_test_500@example.com',))
        result = self.cursor.fetchone()
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Assert query completed quickly (should be fast with index)
        assert query_time < 0.1  # Less than 100ms
        assert result is not None
        assert result['email'] == 'perf_test_500@example.com'

# Run tests
if __name__ == '__main__':
    pytest.main([__file__, '-v'])
```

### Performance Testing

```python
# tests/test_database_performance.py
import pytest
import mysql.connector
import time
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
import random
import string

class DatabasePerformanceTest:
    def __init__(self):
        self.connection_pool = None
        self.setup_connection_pool()
    
    def setup_connection_pool(self):
        """Setup connection pool for performance testing"""
        config = {
            'host': 'localhost',
            'database': 'myapp_test',
            'user': 'test_user',
            'password': 'test_password',
            'pool_name': 'performance_test_pool',
            'pool_size': 10,
            'pool_reset_session': True
        }
        
        self.connection_pool = mysql.connector.pooling.MySQLConnectionPool(**config)
    
    def get_connection(self):
        """Get connection from pool"""
        return self.connection_pool.get_connection()
    
    def generate_test_data(self, count=10000):
        """Generate test data for performance testing"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        # Clean existing test data
        cursor.execute("DELETE FROM users WHERE email LIKE 'perf_%'")
        
        # Generate test users
        test_users = []
        for i in range(count):
            email = f'perf_{i}@example.com'
            name = f'Performance User {i}'
            test_users.append((email, name))
        
        # Batch insert
        insert_query = "INSERT INTO users (email, name) VALUES (%s, %s)"
        cursor.executemany(insert_query, test_users)
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print(f"Generated {count} test users")
    
    def test_single_query_performance(self):
        """Test single query performance"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        # Test different query types
        queries = [
            ("SELECT * FROM users WHERE email = 'perf_5000@example.com'", "Indexed lookup"),
            ("SELECT COUNT(*) FROM users WHERE name LIKE 'Performance%'", "Pattern matching"),
            ("SELECT * FROM users ORDER BY created_at DESC LIMIT 100", "Ordered limit"),
            ("SELECT name, COUNT(*) FROM users GROUP BY name HAVING COUNT(*) > 1", "Aggregation")
        ]
        
        results = []
        
        for query, description in queries:
            times = []
            
            # Run query multiple times
            for _ in range(10):
                start_time = time.time()
                cursor.execute(query)
                cursor.fetchall()
                end_time = time.time()
                
                times.append(end_time - start_time)
            
            avg_time = statistics.mean(times)
            min_time = min(times)
            max_time = max(times)
            
            results.append({
                'description': description,
                'avg_time': avg_time,
                'min_time': min_time,
                'max_time': max_time,
                'query': query
            })
            
            print(f"{description}: Avg {avg_time:.4f}s, Min {min_time:.4f}s, Max {max_time:.4f}s")
        
        cursor.close()
        connection.close()
        
        # Assert performance thresholds
        for result in results:
            assert result['avg_time'] < 1.0, f"Query too slow: {result['description']}"
    
    def test_concurrent_query_performance(self):
        """Test concurrent query performance"""
        def execute_query(query_id):
            """Execute a query and return timing"""
            connection = self.get_connection()
            cursor = connection.cursor()
            
            start_time = time.time()
            
            # Random user lookup
            user_id = random.randint(1, 1000)
            cursor.execute("SELECT * FROM users WHERE email = %s", (f'perf_{user_id}@example.com',))
            result = cursor.fetchone()
            
            end_time = time.time()
            
            cursor.close()
            connection.close()
            
            return {
                'query_id': query_id,
                'execution_time': end_time - start_time,
                'success': result is not None
            }
        
        # Test with different concurrency levels
        concurrency_levels = [1, 5, 10, 20]
        
        for concurrency in concurrency_levels:
            print(f"\nTesting with {concurrency} concurrent connections...")
            
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=concurrency) as executor:
                futures = [executor.submit(execute_query, i) for i in range(100)]
                results = [future.result() for future in as_completed(futures)]
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Calculate statistics
            execution_times = [r['execution_time'] for r in results]
            success_count = sum(1 for r in results if r['success'])
            
            avg_query_time = statistics.mean(execution_times)
            throughput = len(results) / total_time
            
            print(f"  Total time: {total_time:.2f}s")
            print(f"  Average query time: {avg_query_time:.4f}s")
            print(f"  Throughput: {throughput:.2f} queries/second")
            print(f"  Success rate: {success_count}/{len(results)} ({success_count/len(results)*100:.1f}%)")
            
            # Assert performance thresholds
            assert success_count == len(results), "Some queries failed"
            assert avg_query_time < 0.5, f"Average query time too high: {avg_query_time:.4f}s"
    
    def test_bulk_operations_performance(self):
        """Test bulk operations performance"""
        connection = self.get_connection()
        cursor = connection.cursor()
        
        # Test bulk insert
        print("Testing bulk insert performance...")
        
        bulk_data = []
        for i in range(1000):
            email = f'bulk_{i}@example.com'
            name = f'Bulk User {i}'
            bulk_data.append((email, name))
        
        start_time = time.time()
        
        insert_query = "INSERT INTO users (email, name) VALUES (%s, %s)"
        cursor.executemany(insert_query, bulk_data)
        connection.commit()
        
        end_time = time.time()
        insert_time = end_time - start_time
        
        print(f"Bulk insert of 1000 records: {insert_time:.2f}s ({1000/insert_time:.0f} records/second)")
        
        # Test bulk update
        print("Testing bulk update performance...")
        
        start_time = time.time()
        
        update_query = "UPDATE users SET name = CONCAT(name, ' - Updated') WHERE email LIKE 'bulk_%'"
        cursor.execute(update_query)
        updated_rows = cursor.rowcount
        connection.commit()
        
        end_time = time.time()
        update_time = end_time - start_time
        
        print(f"Bulk update of {updated_rows} records: {update_time:.2f}s ({updated_rows/update_time:.0f} records/second)")
        
        # Test bulk delete
        print("Testing bulk delete performance...")
        
        start_time = time.time()
        
        delete_query = "DELETE FROM users WHERE email LIKE 'bulk_%'"
        cursor.execute(delete_query)
        deleted_rows = cursor.rowcount
        connection.commit()
        
        end_time = time.time()
        delete_time = end_time - start_time
        
        print(f"Bulk delete of {deleted_rows} records: {delete_time:.2f}s ({deleted_rows/delete_time:.0f} records/second)")
        
        cursor.close()
        connection.close()
        
        # Assert performance thresholds
        assert insert_time < 5.0, f"Bulk insert too slow: {insert_time:.2f}s"
        assert update_time < 2.0, f"Bulk update too slow: {update_time:.2f}s"
        assert delete_time < 1.0, f"Bulk delete too slow: {delete_time:.2f}s"

# Run performance tests
if __name__ == '__main__':
    perf_test = DatabasePerformanceTest()
    
    print("Setting up test data...")
    perf_test.generate_test_data(10000)
    
    print("\n=== Single Query Performance Tests ===")
    perf_test.test_single_query_performance()
    
    print("\n=== Concurrent Query Performance Tests ===")
    perf_test.test_concurrent_query_performance()
    
    print("\n=== Bulk Operations Performance Tests ===")
    perf_test.test_bulk_operations_performance()
    
    print("\nPerformance testing completed!")
```

---

## 🚀 CI/CD Pipeline Implementation

### GitHub Actions Workflow

```yaml
# .github/workflows/database-ci-cd.yml
name: Database CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'migrations/**'
      - 'database/**'
      - '.github/workflows/database-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'migrations/**'
      - 'database/**'

env:
  MYSQL_ROOT_PASSWORD: root_password
  MYSQL_DATABASE: myapp_test
  MYSQL_USER: test_user
  MYSQL_PASSWORD: test_password

jobs:
  database-lint:
    runs-on: ubuntu-latest
    name: Database Linting
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install SQL linting tools
      run: |
        pip install sqlfluff
        pip install sqlparse
    
    - name: Lint SQL files
      run: |
        sqlfluff lint migrations/ --dialect mysql
        find migrations/ -name "*.sql" -exec sqlparse --format {} \;
    
    - name: Check migration naming convention
      run: |
        python scripts/check_migration_naming.py

  database-test:
    runs-on: ubuntu-latest
    name: Database Testing
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: ${{ env.MYSQL_ROOT_PASSWORD }}
          MYSQL_DATABASE: ${{ env.MYSQL_DATABASE }}
          MYSQL_USER: ${{ env.MYSQL_USER }}
          MYSQL_PASSWORD: ${{ env.MYSQL_PASSWORD }}
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Java (for Flyway)
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
    
    - name: Install Flyway
      run: |
        wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.8.1/flyway-commandline-9.8.1-linux-x64.tar.gz | tar xvz
        sudo ln -s `pwd`/flyway-9.8.1/flyway /usr/local/bin
    
    - name: Wait for MySQL
      run: |
        while ! mysqladmin ping -h"127.0.0.1" -P3306 -u${{ env.MYSQL_USER }} -p${{ env.MYSQL_PASSWORD }} --silent; do
          sleep 1
        done
    
    - name: Run database migrations
      run: |
        flyway -url=jdbc:mysql://localhost:3306/${{ env.MYSQL_DATABASE }} \
               -user=${{ env.MYSQL_USER }} \
               -password=${{ env.MYSQL_PASSWORD }} \
               -locations=filesystem:migrations \
               migrate
    
    - name: Setup Python for testing
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install Python dependencies
      run: |
        pip install -r requirements-test.txt
    
    - name: Run database unit tests
      run: |
        python -m pytest tests/test_database_unit.py -v
      env:
        DB_TEST_HOST: localhost
        DB_TEST_NAME: ${{ env.MYSQL_DATABASE }}
        DB_TEST_USER: ${{ env.MYSQL_USER }}
        DB_TEST_PASSWORD: ${{ env.MYSQL_PASSWORD }}
    
    - name: Run database integration tests
      run: |
        python -m pytest tests/test_database_integration.py -v
      env:
        DB_TEST_HOST: localhost
        DB_TEST_NAME: ${{ env.MYSQL_DATABASE }}
        DB_TEST_USER: ${{ env.MYSQL_USER }}
        DB_TEST_PASSWORD: ${{ env.MYSQL_PASSWORD }}
    
    - name: Run database performance tests
      run: |
        python -m pytest tests/test_database_performance.py -v
      env:
        DB_TEST_HOST: localhost
        DB_TEST_NAME: ${{ env.MYSQL_DATABASE }}
        DB_TEST_USER: ${{ env.MYSQL_USER }}
        DB_TEST_PASSWORD: ${{ env.MYSQL_PASSWORD }}
    
    - name: Generate test coverage report
      run: |
        python scripts/generate_db_coverage_report.py
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: |
          test-results/
          coverage-reports/

  database-security-scan:
    runs-on: ubuntu-latest
    name: Database Security Scan
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Run SQL injection vulnerability scan
      run: |
        python scripts/scan_sql_injection.py migrations/
    
    - name: Check for sensitive data in migrations
      run: |
        python scripts/check_sensitive_data.py migrations/
    
    - name: Validate database permissions
      run: |
        python scripts/validate_db_permissions.py

  deploy-staging:
    runs-on: ubuntu-latest
    name: Deploy to Staging
    needs: [database-lint, database-test, database-security-scan]
    if: github.ref == 'refs/heads/develop'
    
    environment:
      name: staging
      url: https://staging.myapp.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Java (for Flyway)
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
    
    - name: Install Flyway
      run: |
        wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.8.1/flyway-commandline-9.8.1-linux-x64.tar.gz | tar xvz
        sudo ln -s `pwd`/flyway-9.8.1/flyway /usr/local/bin
    
    - name: Create database backup
      run: |
        python scripts/create_backup.py staging
      env:
        DB_STAGING_HOST: ${{ secrets.DB_STAGING_HOST }}
        DB_STAGING_NAME: ${{ secrets.DB_STAGING_NAME }}
        DB_STAGING_USER: ${{ secrets.DB_STAGING_USER }}
        DB_STAGING_PASSWORD: ${{ secrets.DB_STAGING_PASSWORD }}
    
    - name: Deploy to staging database
      run: |
        flyway -url=jdbc:mysql://${{ secrets.DB_STAGING_HOST }}:3306/${{ secrets.DB_STAGING_NAME }} \
               -user=${{ secrets.DB_STAGING_USER }} \
               -password=${{ secrets.DB_STAGING_PASSWORD }} \
               -locations=filesystem:migrations \
               -validateOnMigrate=true \
               migrate
    
    - name: Run post-deployment tests
      run: |
        python scripts/post_deployment_tests.py staging
      env:
        DB_STAGING_HOST: ${{ secrets.DB_STAGING_HOST }}
        DB_STAGING_NAME: ${{ secrets.DB_STAGING_NAME }}
        DB_STAGING_USER: ${{ secrets.DB_STAGING_USER }}
        DB_STAGING_PASSWORD: ${{ secrets.DB_STAGING_PASSWORD }}
    
    - name: Notify deployment status
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    runs-on: ubuntu-latest
    name: Deploy to Production
    needs: [database-lint, database-test, database-security-scan]
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://myapp.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Java (for Flyway)
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '11'
    
    - name: Install Flyway
      run: |
        wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.8.1/flyway-commandline-9.8.1-linux-x64.tar.gz | tar xvz
        sudo ln -s `pwd`/flyway-9.8.1/flyway /usr/local/bin
    
    - name: Create database backup
      run: |
        python scripts/create_backup.py production
      env:
        DB_PROD_HOST: ${{ secrets.DB_PROD_HOST }}
        DB_PROD_NAME: ${{ secrets.DB_PROD_NAME }}
        DB_PROD_USER: ${{ secrets.DB_PROD_USER }}
        DB_PROD_PASSWORD: ${{ secrets.DB_PROD_PASSWORD }}
    
    - name: Deploy to production database (with approval)
      run: |
        echo "Deploying to production database..."
        flyway -url=jdbc:mysql://${{ secrets.DB_PROD_HOST }}:3306/${{ secrets.DB_PROD_NAME }} \
               -user=${{ secrets.DB_PROD_USER }} \
               -password=${{ secrets.DB_PROD_PASSWORD }} \
               -locations=filesystem:migrations \
               -validateOnMigrate=true \
               -outOfOrder=false \
               migrate
    
    - name: Run post-deployment tests
      run: |
        python scripts/post_deployment_tests.py production
      env:
        DB_PROD_HOST: ${{ secrets.DB_PROD_HOST }}
        DB_PROD_NAME: ${{ secrets.DB_PROD_NAME }}
        DB_PROD_USER: ${{ secrets.DB_PROD_USER }}
        DB_PROD_PASSWORD: ${{ secrets.DB_PROD_PASSWORD }}
    
    - name: Update monitoring dashboards
      run: |
        python scripts/update_monitoring.py production
      env:
        GRAFANA_API_KEY: ${{ secrets.GRAFANA_API_KEY }}
        DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
    
    - name: Notify deployment status
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        MYSQL_ROOT_PASSWORD = credentials('mysql-root-password')
        DB_TEST_PASSWORD = credentials('db-test-password')
        DB_STAGING_PASSWORD = credentials('db-staging-password')
        DB_PROD_PASSWORD = credentials('db-prod-password')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Database Lint') {
            steps {
                script {
                    sh '''
                        pip install sqlfluff
                        sqlfluff lint migrations/ --dialect mysql
                    '''
                }
            }
        }
        
        stage('Setup Test Database') {
            steps {
                script {
                    sh '''
                        docker run -d --name mysql-test \
                            -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} \
                            -e MYSQL_DATABASE=myapp_test \
                            -e MYSQL_USER=test_user \
                            -e MYSQL_PASSWORD=${DB_TEST_PASSWORD} \
                            -p 3307:3306 \
                            mysql:8.0
                        
                        # Wait for MySQL to be ready
                        sleep 30
                        
                        # Test connection
                        docker exec mysql-test mysqladmin ping -h localhost -u test_user -p${DB_TEST_PASSWORD}
                    '''
                }
            }
        }
        
        stage('Run Migrations') {
            steps {
                script {
                    sh '''
                        flyway -url=jdbc:mysql://localhost:3307/myapp_test \
                               -user=test_user \
                               -password=${DB_TEST_PASSWORD} \
                               -locations=filesystem:migrations \
                               migrate
                    '''
                }
            }
        }
        
        stage('Database Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        script {
                            sh '''
                                export DB_TEST_HOST=localhost
                                export DB_TEST_PORT=3307
                                export DB_TEST_NAME=myapp_test
                                export DB_TEST_USER=test_user
                                export DB_TEST_PASSWORD=${DB_TEST_PASSWORD}
                                
                                python -m pytest tests/test_database_unit.py -v --junitxml=test-results/unit-tests.xml
                            '''
                        }
                    }
                }
                
                stage('Integration Tests') {
                    steps {
                        script {
                            sh '''
                                export DB_TEST_HOST=localhost
                                export DB_TEST_PORT=3307
                                export DB_TEST_NAME=myapp_test
                                export DB_TEST_USER=test_user
                                export DB_TEST_PASSWORD=${DB_TEST_PASSWORD}
                                
                                python -m pytest tests/test_database_integration.py -v --junitxml=test-results/integration-tests.xml
                            '''
                        }
                    }
                }
                
                stage('Performance Tests') {
                    steps {
                        script {
                            sh '''
                                export DB_TEST_HOST=localhost
                                export DB_TEST_PORT=3307
                                export DB_TEST_NAME=myapp_test
                                export DB_TEST_USER=test_user
                                export DB_TEST_PASSWORD=${DB_TEST_PASSWORD}
                                
                                python -m pytest tests/test_database_performance.py -v --junitxml=test-results/performance-tests.xml
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        python scripts/scan_sql_injection.py migrations/
                        python scripts/check_sensitive_data.py migrations/
                    '''
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    sh '''
                        # Create backup
                        python scripts/create_backup.py staging
                        
                        # Deploy migrations
                        flyway -url=jdbc:mysql://staging-db:3306/myapp_staging \
                               -user=staging_user \
                               -password=${DB_STAGING_PASSWORD} \
                               -locations=filesystem:migrations \
                               migrate
                        
                        # Run post-deployment tests
                        python scripts/post_deployment_tests.py staging
                    '''
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Require manual approval for production
                    input message: 'Deploy to production?', ok: 'Deploy',
                          submitterParameter: 'DEPLOYER'
                    
                    sh '''
                        echo "Deploying to production (approved by ${DEPLOYER})"
                        
                        # Create backup
                        python scripts/create_backup.py production
                        
                        # Deploy migrations
                        flyway -url=jdbc:mysql://prod-db:3306/myapp_production \
                               -user=prod_user \
                               -password=${DB_PROD_PASSWORD} \
                               -locations=filesystem:migrations \
                               -validateOnMigrate=true \
                               migrate
                        
                        # Run post-deployment tests
                        python scripts/post_deployment_tests.py production
                        
                        # Update monitoring
                        python scripts/update_monitoring.py production
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Cleanup test database
            script {
                sh 'docker stop mysql-test || true'
                sh 'docker rm mysql-test || true'
            }
            
            // Publish test results
            junit 'test-results/*.xml'
            
            // Archive artifacts
            archiveArtifacts artifacts: 'test-results/*, coverage-reports/*', allowEmptyArchive: true
        }
        
        success {
            // Notify success
            slackSend channel: '#deployments',
                     color: 'good',
                     message: "Database deployment successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
        }
        
        failure {
            // Notify failure
            slackSend channel: '#deployments',
                     color: 'danger',
                     message: "Database deployment failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
        }
    }
}
```

---

## 🏗️ Infrastructure as Code (IaC)

### Terraform for Database Infrastructure

```hcl
# terraform/database.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "myapp"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS max allocated storage"
  type        = number
  default     = 100
}

variable "backup_retention_period" {
  description = "Backup retention period"
  type        = number
  default     = 7
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = false
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "${var.project_name}-${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-${var.environment}-app-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-sg"
    Environment = var.environment
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "mysql8.0"
  name   = "${var.project_name}-${var.environment}-db-params"

  parameter {
    name  = "innodb_buffer_pool_size"
    value = "{DBInstanceClassMemory*3/4}"
  }

  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  parameter {
    name  = "long_query_time"
    value = "2"
  }

  parameter {
    name  = "general_log"
    value = "0"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-params"
    Environment = var.environment
  }
}

# KMS Key for RDS Encryption
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "rds" {
  name          = "alias/${var.project_name}-${var.environment}-rds"
  target_key_id = aws_kms_key.rds.key_id
}

# Secrets Manager for Database Credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.project_name}/${var.environment}/database/credentials"
  description             = "Database credentials for ${var.project_name} ${var.environment}"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-credentials"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "admin"
    password = random_password.db_password.result
  })
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"

  # Engine
  engine         = "mysql"
  engine_version = "8.0.35"
  instance_class = var.db_instance_class

  # Storage
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp2"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.rds.arn

  # Database
  db_name  = "${var.project_name}_${var.environment}"
  username = "admin"
  password = random_password.db_password.result

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  delete_automated_backups = false

  # High Availability
  multi_az = var.multi_az

  # Monitoring
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports = ["error", "general", "slow"]

  # Performance Insights
  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn
  performance_insights_retention_period = 7

  # Parameter Group
  parameter_group_name = aws_db_parameter_group.main.name

  # Deletion Protection
  deletion_protection = var.environment == "production" ? true : false
  skip_final_snapshot = var.environment == "production" ? false : true
  final_snapshot_identifier = var.environment == "production" ? "${var.project_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  tags = {
    Name        = "${var.project_name}-${var.environment}-db"
    Environment = var.environment
  }
}

# IAM Role for RDS Monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-monitoring-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Read Replica (for production)
resource "aws_db_instance" "read_replica" {
  count = var.environment == "production" ? 1 : 0

  identifier = "${var.project_name}-${var.environment}-db-replica"

  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.db_instance_class

  publicly_accessible = false
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn

  performance_insights_enabled = true
  performance_insights_kms_key_id = aws_kms_key.rds.arn

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-replica"
    Environment = var.environment
  }
}

# Outputs
output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "secret_arn" {
  description = "Secrets Manager secret ARN"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "read_replica_endpoint" {
  description = "Read replica endpoint"
  value       = var.environment == "production" ? aws_db_instance.read_replica[0].endpoint : null
  sensitive   = true
}
```

### Ansible for Database Configuration

```yaml
# ansible/database-setup.yml
---
- name: Database Setup and Configuration
  hosts: database_servers
  become: yes
  vars:
    mysql_root_password: "{{ vault_mysql_root_password }}"
    mysql_databases:
      - name: myapp_production
        encoding: utf8mb4
        collation: utf8mb4_unicode_ci
      - name: myapp_staging
        encoding: utf8mb4
        collation: utf8mb4_unicode_ci
    mysql_users:
      - name: app_user
        password: "{{ vault_app_user_password }}"
        priv: "myapp_production.*:ALL"
        host: "%"
      - name: readonly_user
        password: "{{ vault_readonly_password }}"
        priv: "myapp_production.*:SELECT"
        host: "%"

  tasks:
    - name: Install MySQL server
      package:
        name: mysql-server
        state: present

    - name: Start and enable MySQL service
      service:
        name: mysql
        state: started
        enabled: yes

    - name: Set MySQL root password
      mysql_user:
        name: root
        password: "{{ mysql_root_password }}"
        login_unix_socket: /var/run/mysqld/mysqld.sock

    - name: Create MySQL configuration file
      template:
        src: my.cnf.j2
        dest: /etc/mysql/mysql.conf.d/custom.cnf
        backup: yes
      notify: restart mysql

    - name: Create databases
      mysql_db:
        name: "{{ item.name }}"
        encoding: "{{ item.encoding }}"
        collation: "{{ item.collation }}"
        state: present
        login_user: root
        login_password: "{{ mysql_root_password }}"
      loop: "{{ mysql_databases }}"

    - name: Create MySQL users
      mysql_user:
        name: "{{ item.name }}"
        password: "{{ item.password }}"
        priv: "{{ item.priv }}"
        host: "{{ item.host }}"
        state: present
        login_user: root
        login_password: "{{ mysql_root_password }}"
      loop: "{{ mysql_users }}"

    - name: Install Flyway
      unarchive:
        src: https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.8.1/flyway-commandline-9.8.1-linux-x64.tar.gz
        dest: /opt
        remote_src: yes
        creates: /opt/flyway-9.8.1

    - name: Create Flyway symlink
      file:
        src: /opt/flyway-9.8.1/flyway
        dest: /usr/local/bin/flyway
        state: link

    - name: Create database backup script
      template:
        src: backup-database.sh.j2
        dest: /usr/local/bin/backup-database.sh
        mode: '0755'

    - name: Schedule database backups
      cron:
        name: "Database backup"
        minute: "0"
        hour: "2"
        job: "/usr/local/bin/backup-database.sh"

  handlers:
    - name: restart mysql
      service:
        name: mysql
        state: restarted
```

---

## 📊 Monitoring and Observability

### Database Monitoring with Prometheus and Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards

  mysql-exporter:
    image: prom/mysqld-exporter:latest
    container_name: mysql-exporter
    ports:
      - "9104:9104"
    environment:
      - DATA_SOURCE_NAME=exporter:exporter_password@(mysql:3306)/
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=myapp_dev
      - MYSQL_USER=app_user
      - MYSQL_PASSWORD=app_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d

volumes:
  prometheus_data:
  grafana_data:
  mysql_data:
```

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "database_rules.yml"

scrape_configs:
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']
    scrape_interval: 5s
    metrics_path: /metrics

  - job_name: 'application'
    static_configs:
      - targets: ['app:8080']
    scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

```yaml
# prometheus/database_rules.yml
groups:
  - name: database.rules
    rules:
      - alert: MySQLDown
        expr: mysql_up == 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: MySQL instance is down
          description: "MySQL database is down on {{ $labels.instance }}"

      - alert: MySQLHighConnections
        expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections * 100 > 80
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: MySQL high connections
          description: "MySQL connections are above 80% ({{ $value }}%)"

      - alert: MySQLSlowQueries
        expr: increase(mysql_global_status_slow_queries[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: MySQL slow queries detected
          description: "{{ $value }} slow queries detected in the last 5 minutes"

      - alert: MySQLHighQPS
        expr: rate(mysql_global_status_queries[5m]) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: MySQL high QPS
          description: "MySQL QPS is {{ $value }} queries per second"

      - alert: MySQLReplicationLag
        expr: mysql_slave_lag_seconds > 30
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: MySQL replication lag
          description: "MySQL replication lag is {{ $value }} seconds"

      - alert: MySQLInnoDBLogWaits
        expr: rate(mysql_global_status_innodb_log_waits[5m]) > 10
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: MySQL InnoDB log waits
          description: "MySQL InnoDB log waits: {{ $value }} per second"
```

### Application Performance Monitoring

```python
# monitoring/database_metrics.py
import time
import mysql.connector
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import threading
from contextlib import contextmanager

class DatabaseMetrics:
    def __init__(self, db_config):
        self.db_config = db_config
        
        # Prometheus metrics
        self.query_counter = Counter(
            'database_queries_total',
            'Total number of database queries',
            ['query_type', 'status']
        )
        
        self.query_duration = Histogram(
            'database_query_duration_seconds',
            'Database query duration in seconds',
            ['query_type']
        )
        
        self.connection_pool_size = Gauge(
            'database_connection_pool_size',
            'Current database connection pool size'
        )
        
        self.active_connections = Gauge(
            'database_active_connections',
            'Number of active database connections'
        )
        
        self.slow_queries = Counter(
            'database_slow_queries_total',
            'Total number of slow queries'
        )
        
        # Start metrics collection
        self.start_metrics_collection()
    
    @contextmanager
    def measure_query(self, query_type):
        """Context manager to measure query performance"""
        start_time = time.time()
        status = 'success'
        
        try:
            yield
        except Exception as e:
            status = 'error'
            raise
        finally:
            duration = time.time() - start_time
            
            # Record metrics
            self.query_counter.labels(query_type=query_type, status=status).inc()
            self.query_duration.labels(query_type=query_type).observe(duration)
            
            # Track slow queries (> 1 second)
            if duration > 1.0:
                self.slow_queries.inc()
    
    def get_database_connection(self):
        """Get database connection with metrics"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            self.active_connections.inc()
            return connection
        except Exception as e:
            self.query_counter.labels(query_type='connection', status='error').inc()
            raise
    
    def close_connection(self, connection):
        """Close database connection with metrics"""
        if connection and connection.is_connected():
            connection.close()
            self.active_connections.dec()
    
    def collect_database_metrics(self):
        """Collect database-specific metrics"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            cursor = connection.cursor(dictionary=True)
            
            # Get connection count
            cursor.execute("SHOW STATUS LIKE 'Threads_connected'")
            result = cursor.fetchone()
            if result:
                self.active_connections.set(int(result['Value']))
            
            # Get slow query count
            cursor.execute("SHOW STATUS LIKE 'Slow_queries'")
            result = cursor.fetchone()
            if result:
                # This is cumulative, so we track the rate
                pass
            
            cursor.close()
            connection.close()
            
        except Exception as e:
            print(f"Error collecting database metrics: {e}")
    
    def start_metrics_collection(self):
        """Start background metrics collection"""
        def collect_metrics():
            while True:
                self.collect_database_metrics()
                time.sleep(30)  # Collect every 30 seconds
        
        thread = threading.Thread(target=collect_metrics, daemon=True)
        thread.start()

# Usage example
if __name__ == '__main__':
    db_config = {
        'host': 'localhost',
        'database': 'myapp_production',
        'user': 'app_user',
        'password': 'app_password'
    }
    
    # Initialize metrics
    metrics = DatabaseMetrics(db_config)
    
    # Start Prometheus metrics server
    start_http_server(8000)
    
    # Example usage in application
    connection = metrics.get_database_connection()
    cursor = connection.cursor()
    
    with metrics.measure_query('select'):
        cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
        result = cursor.fetchone()
    
    cursor.close()
    metrics.close_connection(connection)
    
    print("Metrics server started on port 8000")
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down metrics server")
```

---

## 🎯 Next Steps

Congratulations! You've completed Chapter 23 on Database DevOps & CI/CD. You should now understand:

✅ Database DevOps principles and practices
✅ Database version control with Flyway and Liquibase
✅ Git-based database workflows
✅ Database testing strategies (unit, integration, performance)
✅ CI/CD pipeline implementation for databases
✅ Infrastructure as Code (IaC) with Terraform and Ansible
✅ Database monitoring and observability
✅ Automated deployment and rollback strategies
✅ Security scanning and compliance in database pipelines

**🎉 Congratulations! You have completed the comprehensive SQL learning system!**

You have now mastered:
- **Basic SQL**: Data types, CRUD operations, constraints, queries
- **Intermediate SQL**: Joins, functions, subqueries, window functions
- **Advanced SQL**: Performance optimization, stored procedures, triggers, views
- **Enterprise SQL**: Transactions, security, backup/recovery, replication
- **Modern SQL**: Cloud databases, ETL, partitioning, sharding
- **DevOps SQL**: CI/CD, monitoring, infrastructure as code

**Practice Projects:**
1. Set up a complete CI/CD pipeline for a database project
2. Implement database monitoring with Prometheus and Grafana
3. Create Infrastructure as Code for a multi-environment database setup
4. Build automated testing suite for database changes
5. Implement database security scanning and compliance checks

**Additional Resources:**
- Database DevOps best practices
- CI/CD tools comparison (Jenkins, GitHub Actions, GitLab CI)
- Infrastructure as Code tools (Terraform, Ansible, CloudFormation)
- Database monitoring and observability platforms
- Database security and compliance frameworks

**Career Paths:**
- Database Administrator (DBA)
- DevOps Engineer
- Site Reliability Engineer (SRE)
- Database Developer
- Data Engineer
- Cloud Database Architect

**Next Learning Recommendations:**
- Kubernetes for database orchestration
- Advanced cloud database services
- Data engineering and big data technologies
- Machine learning with databases
- Microservices database patterns