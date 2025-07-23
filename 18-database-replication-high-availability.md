# Chapter 18: Database Replication & High Availability

## 📚 What You'll Learn

Database replication and high availability are critical for production systems that require minimal downtime and data protection. This chapter covers master-slave replication, clustering, failover strategies, and load balancing for both MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

- **Master-Slave Replication**: Understand primary-replica architecture
- **Master-Master Replication**: Bidirectional data synchronization
- **Read Replicas**: Scale read operations across multiple servers
- **Failover Strategies**: Automatic and manual failover procedures
- **Load Balancing**: Distribute database load effectively
- **Monitoring**: Track replication lag and health
- **Conflict Resolution**: Handle replication conflicts

---

## 📖 Concept Explanation

### What is Database Replication?

**Database replication** is the process of copying and maintaining database objects in multiple database instances. It ensures data availability, improves performance, and provides disaster recovery capabilities.

### Master-Slave vs Master-Master

**Master-Slave (Primary-Replica)**:
- One primary server handles writes
- Multiple replica servers handle reads
- Unidirectional data flow
- Simpler to manage, less conflict potential

**Master-Master (Multi-Master)**:
- Multiple servers can handle writes
- Bidirectional data synchronization
- More complex, requires conflict resolution
- Higher availability but increased complexity

---

## 🔧 MySQL Replication

### Setting Up Master-Slave Replication

#### 1. Configure Master Server

```sql
-- Edit /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
binlog-do-db = production_db

-- Restart MySQL service
-- sudo systemctl restart mysql
```

#### 2. Create Replication User

```sql
-- On Master server
CREATE USER 'replication_user'@'%' 
IDENTIFIED BY 'strong_password';

GRANT REPLICATION SLAVE ON *.* 
TO 'replication_user'@'%';

FLUSH PRIVILEGES;

-- Get master status
SHOW MASTER STATUS;
-- Note: File and Position values
```

#### 3. Configure Slave Server

```sql
-- Edit /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
server-id = 2
relay-log = relay-bin
log-slave-updates = 1
read-only = 1

-- Restart MySQL service
```

#### 4. Start Replication

```sql
-- On Slave server
CHANGE MASTER TO
  MASTER_HOST = '192.168.1.100',
  MASTER_USER = 'replication_user',
  MASTER_PASSWORD = 'strong_password',
  MASTER_LOG_FILE = 'mysql-bin.000001',
  MASTER_LOG_POS = 154;

START SLAVE;

-- Check replication status
SHOW SLAVE STATUS\G
```

### MySQL Group Replication (Master-Master)

```sql
-- Install Group Replication plugin
INSTALL PLUGIN group_replication SONAME 'group_replication.so';

-- Configure group replication
SET GLOBAL group_replication_group_name = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET GLOBAL group_replication_start_on_boot = OFF;
SET GLOBAL group_replication_local_address = '192.168.1.100:33061';
SET GLOBAL group_replication_group_seeds = '192.168.1.100:33061,192.168.1.101:33061';

-- Start group replication
START GROUP_REPLICATION;
```

---

## 🐘 PostgreSQL Replication

### Setting Up Streaming Replication

#### 1. Configure Primary Server

```sql
-- Edit postgresql.conf
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

-- Edit pg_hba.conf
host replication replication_user 192.168.1.0/24 md5
```

#### 2. Create Replication User

```sql
-- On Primary server
CREATE USER replication_user WITH REPLICATION PASSWORD 'strong_password';

-- Create replication slot
SELECT pg_create_physical_replication_slot('replica_slot');
```

#### 3. Set Up Standby Server

```bash
# Stop PostgreSQL on standby
sudo systemctl stop postgresql

# Remove existing data directory
sudo rm -rf /var/lib/postgresql/13/main/*

# Create base backup
sudo -u postgres pg_basebackup -h 192.168.1.100 -D /var/lib/postgresql/13/main -U replication_user -P -W -R

# Start PostgreSQL
sudo systemctl start postgresql
```

#### 4. Configure Standby

```sql
-- standby.signal file is created automatically by pg_basebackup -R
-- Edit postgresql.conf on standby
primary_conninfo = 'host=192.168.1.100 port=5432 user=replication_user password=strong_password'
primary_slot_name = 'replica_slot'
hot_standby = on
```

### PostgreSQL Logical Replication

```sql
-- On Publisher (Primary)
CREATE PUBLICATION my_publication FOR ALL TABLES;

-- On Subscriber (Replica)
CREATE SUBSCRIPTION my_subscription 
CONNECTION 'host=192.168.1.100 dbname=mydb user=replication_user password=strong_password' 
PUBLICATION my_publication;

-- Monitor replication
SELECT * FROM pg_stat_replication;
SELECT * FROM pg_stat_subscription;
```

---

## 🔄 Failover Strategies

### Automatic Failover with MySQL

```bash
# Using MySQL Router for automatic failover
mysqlrouter --bootstrap root@mysql-cluster --user=mysqlrouter

# Start MySQL Router
mysqlrouter &

# Application connects to router port (6446 for read-write, 6447 for read-only)
```

### PostgreSQL Automatic Failover

```bash
# Using Patroni for automatic failover
# Install Patroni
pip install patroni[etcd]

# Configure patroni.yml
scope: postgres-cluster
namespace: /db/
name: node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: 192.168.1.100:8008

etcd:
  hosts: 192.168.1.100:2379,192.168.1.101:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 30
    maximum_lag_on_failover: 1048576

postgresql:
  listen: 0.0.0.0:5432
  connect_address: 192.168.1.100:5432
  data_dir: /var/lib/postgresql/13/main
  bin_dir: /usr/lib/postgresql/13/bin
```

---

## ⚖️ Load Balancing

### HAProxy Configuration

```bash
# /etc/haproxy/haproxy.cfg
global
    daemon
    maxconn 4096

defaults
    mode tcp
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

# MySQL Load Balancing
listen mysql-cluster
    bind *:3306
    mode tcp
    balance roundrobin
    option mysql-check user haproxy_check
    server mysql1 192.168.1.100:3306 check
    server mysql2 192.168.1.101:3306 check backup

# PostgreSQL Load Balancing
listen postgres-cluster
    bind *:5432
    mode tcp
    balance roundrobin
    option pgsql-check user haproxy_check
    server postgres1 192.168.1.100:5432 check
    server postgres2 192.168.1.101:5432 check backup
```

### Application-Level Load Balancing

```python
# Python example with read/write splitting
import random
from sqlalchemy import create_engine

class DatabaseRouter:
    def __init__(self):
        self.write_engine = create_engine('mysql://user:pass@master:3306/db')
        self.read_engines = [
            create_engine('mysql://user:pass@slave1:3306/db'),
            create_engine('mysql://user:pass@slave2:3306/db')
        ]
    
    def get_write_connection(self):
        return self.write_engine.connect()
    
    def get_read_connection(self):
        return random.choice(self.read_engines).connect()

# Usage
db_router = DatabaseRouter()

# For writes
with db_router.get_write_connection() as conn:
    conn.execute("INSERT INTO users (name) VALUES ('John')")

# For reads
with db_router.get_read_connection() as conn:
    result = conn.execute("SELECT * FROM users")
```

---

## 📊 Monitoring Replication

### MySQL Monitoring

```sql
-- Check master status
SHOW MASTER STATUS;

-- Check slave status
SHOW SLAVE STATUS\G

-- Monitor replication lag
SELECT 
    CASE 
        WHEN Slave_lag_seconds IS NULL THEN 'No Delay'
        WHEN Slave_lag_seconds = 0 THEN 'No Delay'
        ELSE CONCAT(Slave_lag_seconds, ' seconds')
    END AS replication_delay
FROM (
    SELECT 
        CASE 
            WHEN Seconds_Behind_Master IS NULL THEN NULL
            ELSE Seconds_Behind_Master
        END AS Slave_lag_seconds
    FROM INFORMATION_SCHEMA.REPLICA_HOST_STATUS
) AS lag_info;

-- Check binary log status
SHOW BINARY LOGS;
```

### PostgreSQL Monitoring

```sql
-- Check replication status on primary
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    write_lag,
    flush_lag,
    replay_lag
FROM pg_stat_replication;

-- Check replication status on standby
SELECT 
    pg_is_in_recovery() AS is_standby,
    pg_last_wal_receive_lsn() AS last_received,
    pg_last_wal_replay_lsn() AS last_replayed,
    pg_last_xact_replay_timestamp() AS last_replay_time;

-- Calculate replication lag
SELECT 
    EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;
```

---

## 🚨 Conflict Resolution

### MySQL Conflict Resolution

```sql
-- Skip replication errors (use carefully)
SET GLOBAL sql_slave_skip_counter = 1;
START SLAVE;

-- Or set slave to ignore specific errors
SET GLOBAL slave_skip_errors = '1062,1053';

-- Check for duplicate key errors
SHOW SLAVE STATUS\G
-- Look for Last_SQL_Error field
```

### PostgreSQL Conflict Resolution

```sql
-- Monitor conflicts
SELECT 
    datname,
    confl_tablespace,
    confl_lock,
    confl_snapshot,
    confl_bufferpin,
    confl_deadlock
FROM pg_stat_database_conflicts;

-- Handle logical replication conflicts
SELECT 
    subname,
    received_lsn,
    latest_end_lsn,
    latest_end_time
FROM pg_stat_subscription;

-- Resolve conflicts by dropping and recreating subscription
DROP SUBSCRIPTION my_subscription;
CREATE SUBSCRIPTION my_subscription 
CONNECTION 'host=primary dbname=mydb user=replication_user' 
PUBLICATION my_publication;
```

---

## 🏗️ Real-World Example: E-commerce High Availability

### Architecture Setup

```sql
-- Master database (writes)
CREATE DATABASE ecommerce_master;
USE ecommerce_master;

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'processing', 'shipped', 'delivered'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Read replica optimization
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Application Implementation

```python
class EcommerceDatabase:
    def __init__(self):
        self.master = create_engine('mysql://user:pass@master:3306/ecommerce')
        self.slaves = [
            create_engine('mysql://user:pass@slave1:3306/ecommerce'),
            create_engine('mysql://user:pass@slave2:3306/ecommerce')
        ]
    
    def create_order(self, user_id, items):
        """Write operation - use master"""
        with self.master.connect() as conn:
            with conn.begin():
                # Insert order
                result = conn.execute(
                    "INSERT INTO orders (user_id, total_amount, status) VALUES (%s, %s, 'pending')",
                    (user_id, sum(item['price'] * item['quantity'] for item in items))
                )
                order_id = result.lastrowid
                
                # Insert order items
                for item in items:
                    conn.execute(
                        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                        (order_id, item['product_id'], item['quantity'], item['price'])
                    )
                
                return order_id
    
    def get_user_orders(self, user_id):
        """Read operation - use slave"""
        slave = random.choice(self.slaves)
        with slave.connect() as conn:
            return conn.execute(
                "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            ).fetchall()
    
    def get_order_analytics(self):
        """Heavy read operation - use dedicated analytics slave"""
        with self.slaves[1].connect() as conn:  # Dedicated analytics slave
            return conn.execute("""
                SELECT 
                    DATE(created_at) as order_date,
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order_value
                FROM orders 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(created_at)
                ORDER BY order_date DESC
            """).fetchall()
```

---

## 🎯 Interview Questions

### Basic Questions
1. **What is the difference between master-slave and master-master replication?**
2. **How do you handle replication lag?**
3. **What are the benefits of read replicas?**

### Intermediate Questions
1. **How would you implement automatic failover?**
2. **What strategies would you use for conflict resolution in multi-master setup?**
3. **How do you monitor replication health?**

### Advanced Questions
1. **Design a high-availability architecture for a global e-commerce platform**
2. **How would you handle split-brain scenarios in database clustering?**
3. **What are the trade-offs between synchronous and asynchronous replication?**

---

## ⚠️ Common Pitfalls

### 1. **Replication Lag Issues**
```sql
-- Problem: Reading immediately after write from replica
-- Solution: Use master for critical reads or implement read-after-write consistency

-- Check lag before critical reads
SELECT Seconds_Behind_Master FROM SHOW SLAVE STATUS;
```

### 2. **Split-Brain Scenarios**
```bash
# Problem: Multiple masters in failover
# Solution: Use proper quorum and fencing

# Implement proper fencing in cluster configuration
STONITH_enabled = true
no_quorum_policy = stop
```

### 3. **Inadequate Monitoring**
```sql
-- Problem: Not monitoring replication health
-- Solution: Implement comprehensive monitoring

-- Create monitoring queries
CREATE VIEW replication_health AS
SELECT 
    'MySQL' as db_type,
    Slave_IO_Running,
    Slave_SQL_Running,
    Seconds_Behind_Master,
    Last_Error
FROM SHOW SLAVE STATUS;
```

---

## 🎯 Next Steps

Congratulations! You've mastered database replication and high availability. You now understand:

✅ **Master-slave and master-master replication**  
✅ **Failover strategies and automation**  
✅ **Load balancing and read scaling**  
✅ **Monitoring and conflict resolution**  
✅ **Production-ready high availability architectures**

**Continue to** → [Chapter 19: Database Proxies & Connection Pooling](./19-database-proxies-connection-pooling.md)

---

*You're now equipped to design and manage highly available database systems that can handle enterprise-scale workloads!* 🚀