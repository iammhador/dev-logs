# Chapter 19: Database Proxies & Connection Pooling

## 📚 What You'll Learn

Database proxies and connection pooling are essential for scalable applications. This chapter covers proxy databases, connection management, load balancing, query routing, and performance optimization for both MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

- **Database Proxies**: Understand proxy architecture and benefits
- **Connection Pooling**: Manage database connections efficiently
- **Query Routing**: Route queries based on type and load
- **Load Balancing**: Distribute database load across multiple servers
- **Caching**: Implement query result caching
- **Monitoring**: Track proxy performance and health
- **Security**: Secure proxy configurations and access control

---

## 📖 Concept Explanation

### What is a Database Proxy?

**Database proxy** is a middleware layer that sits between applications and database servers. It acts as an intermediary, providing:

- **Connection pooling**: Reuse database connections
- **Load balancing**: Distribute queries across multiple databases
- **Query routing**: Direct queries to appropriate servers
- **Caching**: Store frequently accessed data
- **Security**: Centralized access control and monitoring
- **Failover**: Automatic switching to healthy servers

### Proxy vs Direct Connection

**Direct Connection**:
```
Application → Database Server
```

**Proxy Architecture**:
```
Application → Database Proxy → Database Server(s)
```

---

## 🔧 MySQL Proxy Solutions

### MySQL Router

#### Installation and Setup

```bash
# Install MySQL Router
sudo apt-get install mysql-router

# Bootstrap router for InnoDB Cluster
mysqlrouter --bootstrap root@mysql-cluster --user=mysqlrouter

# Start MySQL Router
sudo systemctl start mysqlrouter
sudo systemctl enable mysqlrouter
```

#### Configuration

```ini
# /etc/mysqlrouter/mysqlrouter.conf
[DEFAULT]
logging_folder = /var/log/mysqlrouter
runtime_folder = /var/run/mysqlrouter
config_folder = /etc/mysqlrouter

[logger]
level = INFO

# Read-Write connections
[routing:primary]
bind_address = 0.0.0.0
bind_port = 6446
destinations = 192.168.1.100:3306,192.168.1.101:3306
routing_strategy = first-available
mode = read-write

# Read-Only connections
[routing:secondary]
bind_address = 0.0.0.0
bind_port = 6447
destinations = 192.168.1.102:3306,192.168.1.103:3306
routing_strategy = round-robin
mode = read-only

# Connection pooling
[connection_pool]
max_connections = 1000
max_idle_connections = 100
max_idle_time = 3600
```

### ProxySQL

#### Installation

```bash
# Install ProxySQL
wget https://github.com/sysown/proxysql/releases/download/v2.4.4/proxysql_2.4.4-ubuntu20_amd64.deb
sudo dpkg -i proxysql_2.4.4-ubuntu20_amd64.deb

# Start ProxySQL
sudo systemctl start proxysql
sudo systemctl enable proxysql
```

#### Configuration

```sql
-- Connect to ProxySQL admin interface
mysql -u admin -padmin -h 127.0.0.1 -P6032

-- Add MySQL servers
INSERT INTO mysql_servers(hostgroup_id, hostname, port, weight) VALUES
(0, '192.168.1.100', 3306, 1000),  -- Master
(1, '192.168.1.101', 3306, 900),   -- Slave 1
(1, '192.168.1.102', 3306, 900);   -- Slave 2

-- Load servers to runtime
LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;

-- Add users
INSERT INTO mysql_users(username, password, default_hostgroup) VALUES
('app_user', 'password123', 0);

LOAD MYSQL USERS TO RUNTIME;
SAVE MYSQL USERS TO DISK;

-- Configure query routing rules
INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup, apply) VALUES
(1, 1, '^SELECT.*', 1, 1),  -- Route SELECT to read replicas
(2, 1, '^INSERT.*', 0, 1),  -- Route INSERT to master
(3, 1, '^UPDATE.*', 0, 1),  -- Route UPDATE to master
(4, 1, '^DELETE.*', 0, 1);  -- Route DELETE to master

LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;

-- Configure connection pooling
SET mysql-max_connections=2000;
SET mysql-default_query_timeout=3600000;
SET mysql-have_compress=true;
SET mysql-poll_timeout=2000;

LOAD MYSQL VARIABLES TO RUNTIME;
SAVE MYSQL VARIABLES TO DISK;
```

---

## 🐘 PostgreSQL Proxy Solutions

### PgBouncer

#### Installation

```bash
# Install PgBouncer
sudo apt-get install pgbouncer

# Create configuration directory
sudo mkdir -p /etc/pgbouncer
```

#### Configuration

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
mydb = host=192.168.1.100 port=5432 dbname=production_db
mydb_ro = host=192.168.1.101 port=5432 dbname=production_db

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/pgbouncer/pgbouncer.pid

# Connection pooling settings
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
max_db_connections = 100
max_user_connections = 100

# Performance settings
server_reset_query = DISCARD ALL
server_check_query = SELECT 1
server_check_delay = 30
server_lifetime = 3600
server_idle_timeout = 600

# Security
ignore_startup_parameters = extra_float_digits
```

```bash
# /etc/pgbouncer/userlist.txt
"app_user" "md5d6a35858d61d85e4a82ab1fb044aba9d"
"read_user" "md5b6d767d2f8ed5d21a44b0e5886680cb9"
```

#### Start PgBouncer

```bash
# Start PgBouncer
sudo systemctl start pgbouncer
sudo systemctl enable pgbouncer

# Connect through PgBouncer
psql -h localhost -p 6432 -U app_user mydb
```

### PgPool-II

#### Installation

```bash
# Install PgPool-II
sudo apt-get install pgpool2
```

#### Configuration

```bash
# /etc/pgpool2/pgpool.conf

# Connection settings
listen_addresses = '*'
port = 9999
pcp_listen_addresses = '*'
pcp_port = 9898

# Backend settings
backend_hostname0 = '192.168.1.100'
backend_port0 = 5432
backend_weight0 = 1
backend_data_directory0 = '/var/lib/postgresql/13/main'
backend_flag0 = 'ALLOW_TO_FAILOVER'

backend_hostname1 = '192.168.1.101'
backend_port1 = 5432
backend_weight1 = 1
backend_data_directory1 = '/var/lib/postgresql/13/main'
backend_flag1 = 'ALLOW_TO_FAILOVER'

# Load balancing
load_balance_mode = on
ignore_leading_white_space = on
white_function_list = ''
black_function_list = 'currval,lastval,nextval,setval'

# Connection pooling
connection_cache = on
max_pool = 4
child_life_time = 300
child_max_connections = 0
connection_life_time = 0
client_idle_limit = 0

# Failover
failover_command = '/etc/pgpool2/failover.sh %d %h %p %D %m %H %M %P %r %R'
failback_command = '/etc/pgpool2/failback.sh %d %h %p %D %m %H %M %P %r %R'
fail_over_on_backend_error = on
search_primary_node_timeout = 10
```

---

## 🔄 Connection Pooling Strategies

### Pool Modes

#### 1. Session Pooling
```sql
-- Connection assigned for entire session
-- Best for: Applications with long-running transactions
-- Pros: Simple, maintains session state
-- Cons: Higher memory usage

-- PgBouncer configuration
pool_mode = session
```

#### 2. Transaction Pooling
```sql
-- Connection returned after each transaction
-- Best for: Web applications with short transactions
-- Pros: Better connection reuse
-- Cons: Cannot use session-level features

-- PgBouncer configuration
pool_mode = transaction
```

#### 3. Statement Pooling
```sql
-- Connection returned after each statement
-- Best for: Simple query applications
-- Pros: Maximum connection reuse
-- Cons: Very limited functionality

-- PgBouncer configuration
pool_mode = statement
```

### Application-Level Connection Pooling

#### Python with SQLAlchemy

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Configure connection pool
engine = create_engine(
    'postgresql://user:password@proxy:6432/mydb',
    poolclass=QueuePool,
    pool_size=20,          # Number of connections to maintain
    max_overflow=30,       # Additional connections when needed
    pool_pre_ping=True,    # Validate connections before use
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False
)

class DatabaseManager:
    def __init__(self):
        self.engine = engine
    
    def execute_query(self, query, params=None):
        with self.engine.connect() as conn:
            return conn.execute(query, params or {})
    
    def get_pool_status(self):
        pool = self.engine.pool
        return {
            'size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid()
        }

# Usage
db = DatabaseManager()
result = db.execute_query("SELECT * FROM users WHERE id = :id", {'id': 123})
print(f"Pool status: {db.get_pool_status()}")
```

#### Node.js with pg-pool

```javascript
const { Pool } = require('pg');

// Configure connection pool
const pool = new Pool({
    host: 'proxy-server',
    port: 6432,
    database: 'mydb',
    user: 'app_user',
    password: 'password',
    max: 20,                    // Maximum connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout when connecting
    maxUses: 7500,              // Close connection after 7500 uses
});

class DatabaseManager {
    async executeQuery(query, params = []) {
        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    getPoolStatus() {
        return {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount
        };
    }
}

// Usage
const db = new DatabaseManager();

async function getUser(id) {
    const users = await db.executeQuery('SELECT * FROM users WHERE id = $1', [id]);
    console.log('Pool status:', db.getPoolStatus());
    return users[0];
}
```

---

## 🎯 Query Routing and Load Balancing

### Read/Write Splitting

#### ProxySQL Query Routing

```sql
-- Route based on query type
INSERT INTO mysql_query_rules(rule_id, active, match_pattern, destination_hostgroup, apply) VALUES
(10, 1, '^SELECT.*FOR UPDATE', 0, 1),     -- SELECT FOR UPDATE to master
(20, 1, '^SELECT.*', 1, 1),              -- Regular SELECT to slaves
(30, 1, '^INSERT.*', 0, 1),              -- INSERT to master
(40, 1, '^UPDATE.*', 0, 1),              -- UPDATE to master
(50, 1, '^DELETE.*', 0, 1),              -- DELETE to master
(60, 1, '^REPLACE.*', 0, 1),             -- REPLACE to master
(70, 1, '^CALL.*', 0, 1);                -- Stored procedures to master

-- Route based on user
INSERT INTO mysql_query_rules(rule_id, active, username, destination_hostgroup, apply) VALUES
(100, 1, 'analytics_user', 2, 1);        -- Analytics user to dedicated server

-- Route based on schema
INSERT INTO mysql_query_rules(rule_id, active, schemaname, destination_hostgroup, apply) VALUES
(200, 1, 'reporting_db', 2, 1);          -- Reporting queries to analytics server

LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;
```

#### Application-Level Routing

```python
class SmartDatabaseRouter:
    def __init__(self):
        self.write_pool = create_engine('mysql://user:pass@master-proxy:6446/db')
        self.read_pool = create_engine('mysql://user:pass@slave-proxy:6447/db')
        self.analytics_pool = create_engine('mysql://user:pass@analytics-proxy:6448/db')
    
    def route_query(self, query, query_type='auto'):
        if query_type == 'auto':
            query_type = self._detect_query_type(query)
        
        if query_type == 'write':
            return self.write_pool
        elif query_type == 'analytics':
            return self.analytics_pool
        else:
            return self.read_pool
    
    def _detect_query_type(self, query):
        query_upper = query.upper().strip()
        
        if any(query_upper.startswith(cmd) for cmd in ['INSERT', 'UPDATE', 'DELETE', 'REPLACE']):
            return 'write'
        elif 'FOR UPDATE' in query_upper or 'LOCK IN SHARE MODE' in query_upper:
            return 'write'
        elif any(func in query_upper for func in ['COUNT(*)', 'SUM(', 'AVG(', 'GROUP BY']):
            return 'analytics'
        else:
            return 'read'
    
    def execute(self, query, params=None):
        engine = self.route_query(query)
        with engine.connect() as conn:
            return conn.execute(query, params or {})

# Usage
router = SmartDatabaseRouter()

# Automatically routed to read replica
users = router.execute("SELECT * FROM users WHERE status = 'active'")

# Automatically routed to master
router.execute("INSERT INTO users (name, email) VALUES ('John', 'john@example.com')")

# Automatically routed to analytics server
stats = router.execute("SELECT COUNT(*), AVG(order_total) FROM orders GROUP BY DATE(created_at)")
```

---

## 🚀 Caching Strategies

### Query Result Caching

#### Redis Integration with Proxy

```python
import redis
import json
import hashlib
from datetime import timedelta

class CachingDatabaseProxy:
    def __init__(self):
        self.db = create_engine('postgresql://user:pass@pgbouncer:6432/db')
        self.cache = redis.Redis(host='redis-server', port=6379, db=0)
        self.default_ttl = 300  # 5 minutes
    
    def _generate_cache_key(self, query, params):
        """Generate unique cache key for query and parameters"""
        query_hash = hashlib.md5(f"{query}{params}".encode()).hexdigest()
        return f"query_cache:{query_hash}"
    
    def _is_cacheable_query(self, query):
        """Determine if query results should be cached"""
        query_upper = query.upper().strip()
        
        # Only cache SELECT queries
        if not query_upper.startswith('SELECT'):
            return False
        
        # Don't cache queries with functions that return current time/data
        non_cacheable = ['NOW()', 'CURRENT_TIMESTAMP', 'RANDOM()', 'UUID()']
        return not any(func in query_upper for func in non_cacheable)
    
    def execute_with_cache(self, query, params=None, ttl=None):
        params = params or {}
        ttl = ttl or self.default_ttl
        
        if not self._is_cacheable_query(query):
            return self._execute_direct(query, params)
        
        cache_key = self._generate_cache_key(query, params)
        
        # Try to get from cache
        cached_result = self.cache.get(cache_key)
        if cached_result:
            return json.loads(cached_result)
        
        # Execute query and cache result
        result = self._execute_direct(query, params)
        
        # Cache the result
        self.cache.setex(
            cache_key, 
            ttl, 
            json.dumps(result, default=str)
        )
        
        return result
    
    def _execute_direct(self, query, params):
        with self.db.connect() as conn:
            result = conn.execute(query, params)
            return [dict(row) for row in result]
    
    def invalidate_cache_pattern(self, pattern):
        """Invalidate cache entries matching pattern"""
        keys = self.cache.keys(f"query_cache:*{pattern}*")
        if keys:
            self.cache.delete(*keys)
    
    def get_cache_stats(self):
        """Get cache statistics"""
        info = self.cache.info()
        return {
            'used_memory': info['used_memory_human'],
            'keyspace_hits': info['keyspace_hits'],
            'keyspace_misses': info['keyspace_misses'],
            'hit_rate': info['keyspace_hits'] / (info['keyspace_hits'] + info['keyspace_misses']) * 100
        }

# Usage
caching_proxy = CachingDatabaseProxy()

# This will be cached
users = caching_proxy.execute_with_cache(
    "SELECT * FROM users WHERE department = :dept", 
    {'dept': 'engineering'},
    ttl=600  # Cache for 10 minutes
)

# Invalidate cache when data changes
caching_proxy.invalidate_cache_pattern('users')

print(f"Cache stats: {caching_proxy.get_cache_stats()}")
```

### ProxySQL Query Caching

```sql
-- Enable query caching in ProxySQL
SET mysql-query_cache_size_MB=256;
SET mysql-query_cache_stores_empty_result=true;

-- Configure caching rules
INSERT INTO mysql_query_rules(
    rule_id, active, match_pattern, cache_ttl, apply
) VALUES
(1000, 1, '^SELECT.*FROM products.*', 300000, 1),    -- Cache product queries for 5 minutes
(1001, 1, '^SELECT.*FROM categories.*', 600000, 1),   -- Cache category queries for 10 minutes
(1002, 1, '^SELECT COUNT\(\*\).*', 60000, 1);         -- Cache count queries for 1 minute

LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;

-- Monitor cache performance
SELECT * FROM stats_mysql_query_cache;
```

---

## 📊 Monitoring and Performance

### ProxySQL Monitoring

```sql
-- Connection statistics
SELECT * FROM stats_mysql_connection_pool;

-- Query statistics
SELECT 
    hostgroup,
    schemaname,
    username,
    digest_text,
    count_star,
    sum_time,
    avg_time
FROM stats_mysql_query_digest 
ORDER BY sum_time DESC 
LIMIT 10;

-- Backend server health
SELECT 
    hostname,
    port,
    status,
    ConnUsed,
    ConnFree,
    ConnOK,
    ConnERR,
    Queries,
    Bytes_data_sent,
    Bytes_data_recv
FROM stats_mysql_servers;

-- Query rules statistics
SELECT 
    rule_id,
    hits,
    match_pattern,
    destination_hostgroup
FROM stats_mysql_query_rules 
ORDER BY hits DESC;
```

### PgBouncer Monitoring

```sql
-- Connect to PgBouncer admin
psql -h localhost -p 6432 -U pgbouncer pgbouncer

-- Show pool statistics
SHOW POOLS;

-- Show client connections
SHOW CLIENTS;

-- Show server connections
SHOW SERVERS;

-- Show configuration
SHOW CONFIG;

-- Show statistics
SHOW STATS;
```

### Custom Monitoring Script

```python
import psutil
import time
from datetime import datetime

class ProxyMonitor:
    def __init__(self, proxy_type='pgbouncer'):
        self.proxy_type = proxy_type
        self.metrics = []
    
    def collect_system_metrics(self):
        """Collect system-level metrics"""
        return {
            'timestamp': datetime.now(),
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_io': psutil.disk_io_counters()._asdict(),
            'network_io': psutil.net_io_counters()._asdict()
        }
    
    def collect_pgbouncer_metrics(self):
        """Collect PgBouncer-specific metrics"""
        import psycopg2
        
        conn = psycopg2.connect(
            host='localhost',
            port=6432,
            user='pgbouncer',
            database='pgbouncer'
        )
        
        with conn.cursor() as cur:
            # Pool statistics
            cur.execute("SHOW POOLS")
            pools = cur.fetchall()
            
            # Statistics
            cur.execute("SHOW STATS")
            stats = cur.fetchall()
            
        conn.close()
        
        return {
            'pools': pools,
            'stats': stats
        }
    
    def collect_proxysql_metrics(self):
        """Collect ProxySQL-specific metrics"""
        import mysql.connector
        
        conn = mysql.connector.connect(
            host='127.0.0.1',
            port=6032,
            user='admin',
            password='admin'
        )
        
        with conn.cursor() as cur:
            # Connection pool stats
            cur.execute("SELECT * FROM stats_mysql_connection_pool")
            pool_stats = cur.fetchall()
            
            # Query digest stats
            cur.execute("""
                SELECT hostgroup, count_star, sum_time, avg_time 
                FROM stats_mysql_query_digest 
                ORDER BY sum_time DESC LIMIT 10
            """)
            query_stats = cur.fetchall()
            
        conn.close()
        
        return {
            'pool_stats': pool_stats,
            'query_stats': query_stats
        }
    
    def monitor_continuously(self, interval=60):
        """Continuously monitor proxy performance"""
        while True:
            try:
                metrics = {
                    'system': self.collect_system_metrics()
                }
                
                if self.proxy_type == 'pgbouncer':
                    metrics['proxy'] = self.collect_pgbouncer_metrics()
                elif self.proxy_type == 'proxysql':
                    metrics['proxy'] = self.collect_proxysql_metrics()
                
                self.metrics.append(metrics)
                
                # Keep only last 1000 metrics
                if len(self.metrics) > 1000:
                    self.metrics = self.metrics[-1000:]
                
                print(f"Collected metrics at {metrics['system']['timestamp']}")
                
            except Exception as e:
                print(f"Error collecting metrics: {e}")
            
            time.sleep(interval)

# Usage
monitor = ProxyMonitor('pgbouncer')
monitor.monitor_continuously(30)  # Monitor every 30 seconds
```

---

## 🔒 Security Considerations

### Secure Proxy Configuration

#### SSL/TLS Configuration

```ini
# PgBouncer SSL configuration
[pgbouncer]
server_tls_sslmode = require
server_tls_ca_file = /etc/ssl/certs/ca-certificates.crt
server_tls_key_file = /etc/pgbouncer/server.key
server_tls_cert_file = /etc/pgbouncer/server.crt

client_tls_sslmode = require
client_tls_ca_file = /etc/ssl/certs/ca-certificates.crt
client_tls_key_file = /etc/pgbouncer/client.key
client_tls_cert_file = /etc/pgbouncer/client.crt
```

```sql
-- ProxySQL SSL configuration
UPDATE global_variables SET variable_value='true' WHERE variable_name='mysql-have_ssl';
UPDATE global_variables SET variable_value='/etc/proxysql/ssl/server-cert.pem' WHERE variable_name='mysql-ssl_cert';
UPDATE global_variables SET variable_value='/etc/proxysql/ssl/server-key.pem' WHERE variable_name='mysql-ssl_key';
UPDATE global_variables SET variable_value='/etc/proxysql/ssl/ca-cert.pem' WHERE variable_name='mysql-ssl_ca';

LOAD MYSQL VARIABLES TO RUNTIME;
SAVE MYSQL VARIABLES TO DISK;
```

#### Access Control

```sql
-- ProxySQL user access control
INSERT INTO mysql_users(username, password, default_hostgroup, max_connections) VALUES
('app_user', 'hashed_password', 0, 100),
('read_only_user', 'hashed_password', 1, 50),
('analytics_user', 'hashed_password', 2, 10);

-- Restrict access by source IP
INSERT INTO mysql_query_rules(rule_id, active, client_addr, apply) VALUES
(5000, 1, '192.168.1.0/24', 1);  -- Only allow from internal network

LOAD MYSQL USERS TO RUNTIME;
LOAD MYSQL QUERY RULES TO RUNTIME;
```

---

## 🏗️ Real-World Example: E-commerce Proxy Architecture

### Architecture Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   API Service   │    │  Analytics App  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      Load Balancer        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │     Database Proxy        │
                    │    (ProxySQL/PgBouncer)   │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                        │                         │
┌───────┴───────┐    ┌───────────┴───────┐    ┌───────────┴───────┐
│   Master DB    │    │   Read Replica 1  │    │   Read Replica 2  │
│   (Writes)     │    │   (Reads)         │    │   (Analytics)     │
└───────────────┘    └───────────────────┘    └───────────────────┘
```

### Implementation

```python
class EcommerceProxyManager:
    def __init__(self):
        # Different connection pools for different workloads
        self.write_pool = self._create_pool('master-proxy:6446', pool_size=50)
        self.read_pool = self._create_pool('read-proxy:6447', pool_size=100)
        self.analytics_pool = self._create_pool('analytics-proxy:6448', pool_size=20)
        
        # Cache for frequently accessed data
        self.cache = redis.Redis(host='redis-cluster', port=6379)
    
    def _create_pool(self, host, pool_size):
        return create_engine(
            f'mysql://app_user:password@{host}/ecommerce',
            pool_size=pool_size,
            max_overflow=pool_size // 2,
            pool_pre_ping=True,
            pool_recycle=3600
        )
    
    def create_order(self, user_id, items):
        """Write operation - use master"""
        with self.write_pool.connect() as conn:
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
                
                # Invalidate relevant caches
                self.cache.delete(f"user_orders:{user_id}")
                self.cache.delete("order_stats")
                
                return order_id
    
    def get_user_orders(self, user_id):
        """Read operation with caching"""
        cache_key = f"user_orders:{user_id}"
        
        # Try cache first
        cached_orders = self.cache.get(cache_key)
        if cached_orders:
            return json.loads(cached_orders)
        
        # Query from read replica
        with self.read_pool.connect() as conn:
            orders = conn.execute(
                "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
                (user_id,)
            ).fetchall()
            
            orders_list = [dict(order) for order in orders]
            
            # Cache for 5 minutes
            self.cache.setex(cache_key, 300, json.dumps(orders_list, default=str))
            
            return orders_list
    
    def get_sales_analytics(self, start_date, end_date):
        """Analytics operation - use dedicated analytics server"""
        with self.analytics_pool.connect() as conn:
            return conn.execute("""
                SELECT 
                    DATE(created_at) as order_date,
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order_value,
                    COUNT(DISTINCT user_id) as unique_customers
                FROM orders 
                WHERE created_at BETWEEN %s AND %s
                GROUP BY DATE(created_at)
                ORDER BY order_date DESC
            """, (start_date, end_date)).fetchall()
    
    def get_connection_stats(self):
        """Monitor connection pool health"""
        return {
            'write_pool': {
                'size': self.write_pool.pool.size(),
                'checked_out': self.write_pool.pool.checkedout(),
                'overflow': self.write_pool.pool.overflow()
            },
            'read_pool': {
                'size': self.read_pool.pool.size(),
                'checked_out': self.read_pool.pool.checkedout(),
                'overflow': self.read_pool.pool.overflow()
            },
            'analytics_pool': {
                'size': self.analytics_pool.pool.size(),
                'checked_out': self.analytics_pool.pool.checkedout(),
                'overflow': self.analytics_pool.pool.overflow()
            }
        }

# Usage
ecommerce_proxy = EcommerceProxyManager()

# Create order (routed to master)
order_id = ecommerce_proxy.create_order(123, [
    {'product_id': 1, 'quantity': 2, 'price': 29.99},
    {'product_id': 2, 'quantity': 1, 'price': 49.99}
])

# Get user orders (routed to read replica, cached)
orders = ecommerce_proxy.get_user_orders(123)

# Get analytics (routed to analytics server)
stats = ecommerce_proxy.get_sales_analytics('2024-01-01', '2024-01-31')

# Monitor connection health
print(f"Connection stats: {ecommerce_proxy.get_connection_stats()}")
```

---

## 🎯 Interview Questions

### Basic Questions
1. **What is a database proxy and why would you use one?**
2. **Explain the difference between session, transaction, and statement pooling.**
3. **How does connection pooling improve application performance?**

### Intermediate Questions
1. **How would you implement read/write splitting in a database proxy?**
2. **What are the trade-offs between application-level and proxy-level connection pooling?**
3. **How do you handle failover in a proxy configuration?**

### Advanced Questions
1. **Design a database proxy architecture for a global e-commerce platform**
2. **How would you implement query result caching in a database proxy?**
3. **What strategies would you use to monitor and optimize proxy performance?**

---

## ⚠️ Common Pitfalls

### 1. **Inadequate Pool Sizing**
```python
# Problem: Pool too small causes connection queuing
pool_size = 5  # Too small for high-traffic app

# Solution: Size based on concurrent users and query duration
pool_size = min(100, max(10, concurrent_users * avg_query_time_seconds))
```

### 2. **Ignoring Connection Leaks**
```python
# Problem: Not properly releasing connections
def bad_query():
    conn = pool.get_connection()
    result = conn.execute("SELECT * FROM users")
    # Connection never released!
    return result

# Solution: Always use context managers
def good_query():
    with pool.get_connection() as conn:
        return conn.execute("SELECT * FROM users")
```

### 3. **Improper Query Routing**
```sql
-- Problem: Routing read queries to master unnecessarily
SELECT * FROM users WHERE id = 123;  -- Could go to replica

-- Solution: Implement proper routing rules
-- Route only writes and critical reads to master
```

---

## 🎯 Next Steps

Congratulations! You've mastered database proxies and connection pooling. You now understand:

✅ **Database proxy architecture and benefits**  
✅ **Connection pooling strategies and optimization**  
✅ **Query routing and load balancing**  
✅ **Caching and performance optimization**  
✅ **Monitoring and security best practices**

**Continue to** → [Chapter 20: Partitioning & Sharding](./20-partitioning-sharding.md)

---

*You're now equipped to design and implement scalable database proxy architectures that can handle enterprise-scale workloads!* 🚀