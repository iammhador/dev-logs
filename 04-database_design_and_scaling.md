# Chapter 4: Database Design and Scaling

## Overview

Database design and scaling are fundamental aspects of system architecture that determine how efficiently your application can store, retrieve, and manage data. As systems grow, choosing the right database strategy becomes critical for performance, reliability, and maintainability.

## Database Types

### 1. Relational Databases (SQL)
**Examples:** PostgreSQL, MySQL, Oracle, SQL Server

**Characteristics:**
- ACID compliance (Atomicity, Consistency, Isolation, Durability)
- Structured data with predefined schemas
- Strong consistency guarantees
- Complex queries with JOINs
- Mature ecosystem and tooling

**When to Use:**
- Complex relationships between data
- Need for ACID transactions
- Structured data with clear schema
- Complex analytical queries
- Financial or critical business data

**Example Schema Design:**
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

### 2. NoSQL Databases

#### Document Databases
**Examples:** MongoDB, CouchDB, Amazon DocumentDB

**Characteristics:**
- Schema-flexible JSON-like documents
- Horizontal scaling capabilities
- Rich query capabilities
- Embedded documents and arrays

**When to Use:**
- Rapidly evolving schemas
- Hierarchical data structures
- Content management systems
- Catalog and inventory systems

**Example Document Design:**
```javascript
// User document
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "user@example.com",
  "username": "johndoe",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Software developer"
  },
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  },
  "posts": [
    {
      "id": "post1",
      "title": "My First Post",
      "excerpt": "This is my first blog post...",
      "publishedAt": ISODate("2023-01-15T10:00:00Z")
    }
  ],
  "createdAt": ISODate("2023-01-01T00:00:00Z"),
  "updatedAt": ISODate("2023-01-15T10:00:00Z")
}

// MongoDB queries
db.users.find({ "profile.firstName": "John" })
db.users.find({ "posts.publishedAt": { $gte: ISODate("2023-01-01") } })
db.users.updateOne(
  { "_id": ObjectId("507f1f77bcf86cd799439011") },
  { $set: { "preferences.theme": "light" } }
)
```

#### Key-Value Stores
**Examples:** Redis, Amazon DynamoDB, Riak

**Characteristics:**
- Simple key-value pairs
- Extremely fast reads/writes
- Horizontal scaling
- Limited query capabilities

**When to Use:**
- Caching layers
- Session storage
- Real-time recommendations
- Shopping carts
- Leaderboards

**Example Usage:**
```python
import redis

# Redis key-value operations
r = redis.Redis(host='localhost', port=6379, db=0)

# Simple key-value
r.set('user:1001:session', 'abc123xyz', ex=3600)  # Expires in 1 hour
session_id = r.get('user:1001:session')

# Hash for structured data
r.hset('user:1001:profile', mapping={
    'name': 'John Doe',
    'email': 'john@example.com',
    'last_login': '2023-01-15T10:00:00Z'
})
user_profile = r.hgetall('user:1001:profile')

# Lists for ordered data
r.lpush('user:1001:notifications', 'New message from Alice')
r.lpush('user:1001:notifications', 'Your post was liked')
notifications = r.lrange('user:1001:notifications', 0, 9)  # Get 10 most recent

# Sets for unique collections
r.sadd('user:1001:followers', '1002', '1003', '1004')
follower_count = r.scard('user:1001:followers')
is_following = r.sismember('user:1001:followers', '1002')

# Sorted sets for rankings
r.zadd('leaderboard', {'player1': 1000, 'player2': 1500, 'player3': 800})
top_players = r.zrevrange('leaderboard', 0, 9, withscores=True)
```

#### Column-Family Databases
**Examples:** Cassandra, HBase, Amazon SimpleDB

**Characteristics:**
- Wide column storage
- Excellent for time-series data
- Horizontal scaling
- Eventual consistency

**When to Use:**
- Time-series data
- IoT sensor data
- Logging and analytics
- High write throughput requirements

**Example Schema (Cassandra):**
```sql
-- Time-series data for IoT sensors
CREATE TABLE sensor_data (
    sensor_id UUID,
    timestamp TIMESTAMP,
    temperature DOUBLE,
    humidity DOUBLE,
    pressure DOUBLE,
    PRIMARY KEY (sensor_id, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- User activity logs
CREATE TABLE user_activity (
    user_id UUID,
    activity_date DATE,
    timestamp TIMESTAMP,
    activity_type TEXT,
    details MAP<TEXT, TEXT>,
    PRIMARY KEY ((user_id, activity_date), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- Queries
SELECT * FROM sensor_data 
WHERE sensor_id = 123e4567-e89b-12d3-a456-426614174000 
AND timestamp >= '2023-01-01' 
AND timestamp < '2023-01-02';
```

#### Graph Databases
**Examples:** Neo4j, Amazon Neptune, ArangoDB

**Characteristics:**
- Nodes and relationships
- Excellent for connected data
- Complex relationship queries
- ACID transactions

**When to Use:**
- Social networks
- Recommendation engines
- Fraud detection
- Knowledge graphs
- Network analysis

**Example (Neo4j Cypher):**
```cypher
// Create nodes and relationships
CREATE (alice:Person {name: 'Alice', age: 30})
CREATE (bob:Person {name: 'Bob', age: 25})
CREATE (company:Company {name: 'TechCorp'})
CREATE (alice)-[:WORKS_FOR {since: '2020-01-01'}]->(company)
CREATE (bob)-[:WORKS_FOR {since: '2021-06-01'}]->(company)
CREATE (alice)-[:FRIENDS_WITH {since: '2019-03-15'}]->(bob)

// Find friends of friends
MATCH (person:Person {name: 'Alice'})-[:FRIENDS_WITH]->(friend)-[:FRIENDS_WITH]->(fof)
WHERE fof <> person
RETURN fof.name AS friend_of_friend

// Find colleagues
MATCH (person:Person {name: 'Alice'})-[:WORKS_FOR]->(company)<-[:WORKS_FOR]-(colleague)
WHERE colleague <> person
RETURN colleague.name AS colleague

// Recommendation: People you might know
MATCH (person:Person {name: 'Alice'})-[:FRIENDS_WITH]->(friend)-[:FRIENDS_WITH]->(suggestion)
WHERE suggestion <> person 
AND NOT (person)-[:FRIENDS_WITH]->(suggestion)
RETURN suggestion.name AS suggestion, COUNT(*) AS mutual_friends
ORDER BY mutual_friends DESC
LIMIT 5
```

## Database Scaling Strategies

### 1. Vertical Scaling (Scale Up)
**Approach:** Increase hardware resources of existing database server

**Pros:**
- Simple to implement
- No application changes required
- Maintains ACID properties
- No data distribution complexity

**Cons:**
- Hardware limits
- Expensive at scale
- Single point of failure
- Downtime for upgrades

**Implementation:**
```yaml
# Example: Upgrading PostgreSQL instance
Before:
  CPU: 4 cores
  RAM: 16 GB
  Storage: 500 GB SSD
  
After:
  CPU: 16 cores
  RAM: 64 GB
  Storage: 2 TB NVMe SSD
```

### 2. Horizontal Scaling (Scale Out)

#### Read Replicas
**Approach:** Create read-only copies of the database

**Benefits:**
- Distribute read load
- Improve read performance
- Geographic distribution
- Backup and disaster recovery

**Implementation Example:**
```python
import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class DatabaseRouter:
    def __init__(self, master_url, replica_urls):
        self.master_engine = create_engine(master_url)
        self.replica_engines = [create_engine(url) for url in replica_urls]
        
        self.MasterSession = sessionmaker(bind=self.master_engine)
        self.ReplicaSessions = [sessionmaker(bind=engine) for engine in self.replica_engines]
    
    def get_write_session(self):
        """Always use master for writes"""
        return self.MasterSession()
    
    def get_read_session(self):
        """Use random replica for reads"""
        replica_session = random.choice(self.ReplicaSessions)
        return replica_session()
    
    def get_session(self, read_only=False):
        if read_only:
            return self.get_read_session()
        return self.get_write_session()

# Usage
db_router = DatabaseRouter(
    master_url="postgresql://user:pass@master-db:5432/myapp",
    replica_urls=[
        "postgresql://user:pass@replica1-db:5432/myapp",
        "postgresql://user:pass@replica2-db:5432/myapp"
    ]
)

# Read operations
with db_router.get_session(read_only=True) as session:
    users = session.query(User).filter(User.active == True).all()

# Write operations
with db_router.get_session(read_only=False) as session:
    new_user = User(email="new@example.com", username="newuser")
    session.add(new_user)
    session.commit()
```

#### Database Sharding
**Approach:** Split data across multiple database instances

**Sharding Strategies:**

1. **Range-Based Sharding:**
```python
class RangeShardRouter:
    def __init__(self, shards):
        self.shards = shards  # [(min_id, max_id, db_connection), ...]
    
    def get_shard(self, user_id):
        for min_id, max_id, connection in self.shards:
            if min_id <= user_id <= max_id:
                return connection
        raise ValueError(f"No shard found for user_id: {user_id}")

# Configuration
shards = [
    (1, 1000000, "postgresql://user:pass@shard1:5432/myapp"),
    (1000001, 2000000, "postgresql://user:pass@shard2:5432/myapp"),
    (2000001, 3000000, "postgresql://user:pass@shard3:5432/myapp")
]
```

2. **Hash-Based Sharding:**
```python
import hashlib

class HashShardRouter:
    def __init__(self, shard_connections):
        self.shard_connections = shard_connections
        self.shard_count = len(shard_connections)
    
    def get_shard(self, key):
        hash_value = int(hashlib.md5(str(key).encode()).hexdigest(), 16)
        shard_index = hash_value % self.shard_count
        return self.shard_connections[shard_index]
    
    def get_user_shard(self, user_id):
        return self.get_shard(user_id)
    
    def get_post_shard(self, user_id):
        # Keep user's posts on same shard as user
        return self.get_shard(user_id)

# Usage
shard_router = HashShardRouter([
    "postgresql://user:pass@shard1:5432/myapp",
    "postgresql://user:pass@shard2:5432/myapp",
    "postgresql://user:pass@shard3:5432/myapp",
    "postgresql://user:pass@shard4:5432/myapp"
])

def get_user(user_id):
    shard_connection = shard_router.get_user_shard(user_id)
    # Execute query on specific shard
    return execute_query(shard_connection, "SELECT * FROM users WHERE id = %s", [user_id])
```

3. **Directory-Based Sharding:**
```python
class DirectoryShardRouter:
    def __init__(self):
        self.directory = {}  # user_id -> shard_id mapping
        self.shard_connections = {}
    
    def register_shard(self, shard_id, connection):
        self.shard_connections[shard_id] = connection
    
    def assign_user_to_shard(self, user_id, shard_id):
        self.directory[user_id] = shard_id
    
    def get_user_shard(self, user_id):
        shard_id = self.directory.get(user_id)
        if shard_id is None:
            raise ValueError(f"User {user_id} not found in directory")
        return self.shard_connections[shard_id]
    
    def migrate_user(self, user_id, new_shard_id):
        old_shard_id = self.directory[user_id]
        
        # Move data from old shard to new shard
        old_connection = self.shard_connections[old_shard_id]
        new_connection = self.shard_connections[new_shard_id]
        
        # This would involve actual data migration logic
        self.migrate_user_data(user_id, old_connection, new_connection)
        
        # Update directory
        self.directory[user_id] = new_shard_id
```

### 3. Federation
**Approach:** Split databases by function or feature

```python
class FederatedDatabaseRouter:
    def __init__(self):
        self.connections = {
            'users': "postgresql://user:pass@users-db:5432/users",
            'posts': "postgresql://user:pass@posts-db:5432/posts",
            'analytics': "postgresql://user:pass@analytics-db:5432/analytics",
            'payments': "postgresql://user:pass@payments-db:5432/payments"
        }
    
    def get_connection(self, service):
        return self.connections[service]
    
    def get_user(self, user_id):
        conn = self.get_connection('users')
        return execute_query(conn, "SELECT * FROM users WHERE id = %s", [user_id])
    
    def get_user_posts(self, user_id):
        conn = self.get_connection('posts')
        return execute_query(conn, "SELECT * FROM posts WHERE user_id = %s", [user_id])
    
    def record_analytics_event(self, event_data):
        conn = self.get_connection('analytics')
        return execute_query(conn, "INSERT INTO events (...) VALUES (...)", event_data)
```

## Database Performance Optimization

### 1. Indexing Strategies

**B-Tree Indexes (Default):**
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Partial index
CREATE INDEX idx_posts_published ON posts(created_at) 
WHERE status = 'published';

-- Expression index
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
```

**Hash Indexes:**
```sql
-- Good for equality comparisons
CREATE INDEX idx_users_id_hash ON users USING HASH(id);
```

**GIN Indexes (for arrays, JSON, full-text search):**
```sql
-- JSON data indexing
CREATE INDEX idx_users_preferences ON users USING GIN(preferences);

-- Array indexing
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Full-text search
CREATE INDEX idx_posts_content_fts ON posts USING GIN(to_tsvector('english', content));
```

### 2. Query Optimization

**Query Analysis:**
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT u.username, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.username
ORDER BY post_count DESC
LIMIT 10;

-- Index recommendations
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_posts_user_id ON posts(user_id);
```

**Query Optimization Techniques:**
```sql
-- Use LIMIT to reduce result set
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;

-- Use EXISTS instead of IN for large subqueries
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id);

-- Use appropriate JOIN types
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id  -- Only users with posts
WHERE u.active = true;

-- Avoid SELECT *
SELECT id, username, email FROM users WHERE active = true;

-- Use covering indexes
CREATE INDEX idx_posts_covering ON posts(user_id, status) INCLUDE (title, created_at);
```

### 3. Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Connection pool configuration
engine = create_engine(
    "postgresql://user:pass@localhost:5432/myapp",
    poolclass=QueuePool,
    pool_size=20,          # Number of connections to maintain
    max_overflow=30,       # Additional connections when pool is full
    pool_pre_ping=True,    # Validate connections before use
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False             # Set to True for SQL logging
)

# Connection pool monitoring
class DatabaseMetrics:
    def __init__(self, engine):
        self.engine = engine
    
    def get_pool_status(self):
        pool = self.engine.pool
        return {
            'size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid()
        }
```

## Data Consistency Patterns

### 1. ACID Transactions
```python
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

def transfer_money(from_account_id, to_account_id, amount):
    session = Session()
    try:
        # Start transaction
        session.begin()
        
        # Lock accounts for update
        from_account = session.query(Account).filter(
            Account.id == from_account_id
        ).with_for_update().first()
        
        to_account = session.query(Account).filter(
            Account.id == to_account_id
        ).with_for_update().first()
        
        # Validate business rules
        if from_account.balance < amount:
            raise ValueError("Insufficient funds")
        
        # Update balances
        from_account.balance -= amount
        to_account.balance += amount
        
        # Create transaction record
        transaction = Transaction(
            from_account_id=from_account_id,
            to_account_id=to_account_id,
            amount=amount,
            status='completed'
        )
        session.add(transaction)
        
        # Commit transaction
        session.commit()
        return transaction
        
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()
```

### 2. Eventual Consistency
```python
import asyncio
from typing import List

class EventuallyConsistentSystem:
    def __init__(self, databases: List[str]):
        self.databases = databases
        self.event_queue = asyncio.Queue()
    
    async def write_data(self, key: str, value: str):
        # Write to primary database first
        primary_db = self.databases[0]
        await self.write_to_db(primary_db, key, value)
        
        # Queue replication events
        for replica_db in self.databases[1:]:
            await self.event_queue.put({
                'type': 'replicate',
                'database': replica_db,
                'key': key,
                'value': value
            })
    
    async def process_replication_events(self):
        while True:
            try:
                event = await asyncio.wait_for(self.event_queue.get(), timeout=1.0)
                await self.write_to_db(event['database'], event['key'], event['value'])
                self.event_queue.task_done()
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                # Handle replication failure
                await self.handle_replication_failure(event, e)
    
    async def write_to_db(self, database: str, key: str, value: str):
        # Simulate database write
        await asyncio.sleep(0.1)
        print(f"Written {key}={value} to {database}")
    
    async def handle_replication_failure(self, event: dict, error: Exception):
        # Retry logic, dead letter queue, etc.
        print(f"Replication failed for {event}: {error}")
```

### 3. Saga Pattern for Distributed Transactions
```python
from enum import Enum
from typing import List, Callable

class SagaStepStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATED = "compensated"

class SagaStep:
    def __init__(self, name: str, execute: Callable, compensate: Callable):
        self.name = name
        self.execute = execute
        self.compensate = compensate
        self.status = SagaStepStatus.PENDING
        self.result = None

class SagaOrchestrator:
    def __init__(self, steps: List[SagaStep]):
        self.steps = steps
        self.completed_steps = []
    
    async def execute(self):
        try:
            for step in self.steps:
                print(f"Executing step: {step.name}")
                step.result = await step.execute()
                step.status = SagaStepStatus.COMPLETED
                self.completed_steps.append(step)
                
            return True
            
        except Exception as e:
            print(f"Saga failed at step {step.name}: {e}")
            await self.compensate()
            return False
    
    async def compensate(self):
        # Compensate in reverse order
        for step in reversed(self.completed_steps):
            try:
                print(f"Compensating step: {step.name}")
                await step.compensate(step.result)
                step.status = SagaStepStatus.COMPENSATED
            except Exception as e:
                print(f"Compensation failed for {step.name}: {e}")

# Example: Order processing saga
async def reserve_inventory(order_data):
    # Reserve items in inventory
    return {"reservation_id": "inv_123"}

async def compensate_inventory(result):
    # Release reserved items
    print(f"Releasing inventory reservation: {result['reservation_id']}")

async def charge_payment(order_data):
    # Charge customer's payment method
    return {"transaction_id": "txn_456"}

async def compensate_payment(result):
    # Refund the payment
    print(f"Refunding payment: {result['transaction_id']}")

async def ship_order(order_data):
    # Create shipping label and schedule pickup
    return {"tracking_number": "track_789"}

async def compensate_shipping(result):
    # Cancel shipping
    print(f"Canceling shipment: {result['tracking_number']}")

# Execute saga
order_saga = SagaOrchestrator([
    SagaStep("reserve_inventory", reserve_inventory, compensate_inventory),
    SagaStep("charge_payment", charge_payment, compensate_payment),
    SagaStep("ship_order", ship_order, compensate_shipping)
])

# await order_saga.execute()
```

## Database Security

### 1. Access Control
```sql
-- Create roles with specific permissions
CREATE ROLE app_read;
CREATE ROLE app_write;
CREATE ROLE app_admin;

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_read;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_write;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;

-- Create users and assign roles
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT app_write TO app_user;

-- Row-level security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_user_policy ON posts
    FOR ALL TO app_user
    USING (user_id = current_setting('app.current_user_id')::INTEGER);
```

### 2. Data Encryption
```sql
-- Column-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO users (email, password_hash, ssn_encrypted)
VALUES (
    'user@example.com',
    crypt('password123', gen_salt('bf')),
    pgp_sym_encrypt('123-45-6789', 'encryption_key')
);

-- Decrypt data
SELECT 
    email,
    pgp_sym_decrypt(ssn_encrypted, 'encryption_key') as ssn
FROM users
WHERE id = 1;
```

### 3. SQL Injection Prevention
```python
# BAD: Vulnerable to SQL injection
def get_user_bad(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return execute_query(query)

# GOOD: Using parameterized queries
def get_user_good(user_id):
    query = "SELECT * FROM users WHERE id = %s"
    return execute_query(query, [user_id])

# GOOD: Using ORM
def get_user_orm(user_id):
    return session.query(User).filter(User.id == user_id).first()

# Input validation
def validate_user_input(user_id):
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user ID")
    return user_id
```

## Monitoring and Maintenance

### 1. Database Monitoring
```python
import psutil
import psycopg2
from datetime import datetime

class DatabaseMonitor:
    def __init__(self, connection_string):
        self.connection_string = connection_string
    
    def get_connection_stats(self):
        with psycopg2.connect(self.connection_string) as conn:
            with conn.cursor() as cur:
                # Active connections
                cur.execute("""
                    SELECT count(*) as active_connections
                    FROM pg_stat_activity
                    WHERE state = 'active'
                """)
                active_connections = cur.fetchone()[0]
                
                # Long running queries
                cur.execute("""
                    SELECT query, state, query_start
                    FROM pg_stat_activity
                    WHERE state = 'active'
                    AND query_start < NOW() - INTERVAL '5 minutes'
                """)
                long_queries = cur.fetchall()
                
                # Database size
                cur.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database()))
                """)
                db_size = cur.fetchone()[0]
                
                return {
                    'active_connections': active_connections,
                    'long_running_queries': len(long_queries),
                    'database_size': db_size,
                    'timestamp': datetime.now()
                }
    
    def get_table_stats(self):
        with psycopg2.connect(self.connection_string) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        schemaname,
                        tablename,
                        n_tup_ins as inserts,
                        n_tup_upd as updates,
                        n_tup_del as deletes,
                        n_live_tup as live_tuples,
                        n_dead_tup as dead_tuples
                    FROM pg_stat_user_tables
                    ORDER BY n_live_tup DESC
                """)
                return cur.fetchall()
```

### 2. Backup Strategies
```bash
#!/bin/bash
# PostgreSQL backup script

DB_NAME="myapp"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Full backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/full_backup_$DATE.sql

# Compressed backup
pg_dump -U $DB_USER -h localhost -Fc $DB_NAME > $BACKUP_DIR/compressed_backup_$DATE.dump

# Point-in-time recovery setup
# Enable WAL archiving in postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /backup/wal_archive/%f'

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete
```

## Real-World Examples

### Instagram's Database Architecture
**Challenge:** Handle billions of photos and user interactions

**Solution:**
- **Sharding:** User data sharded by user ID
- **Read Replicas:** Multiple read replicas for photo metadata
- **Cassandra:** For time-series data (feeds, notifications)
- **Redis:** For caching and session storage

### Uber's Database Strategy
**Challenge:** Real-time location tracking and trip management

**Solution:**
- **Schemaless (MySQL):** Flexible document storage in MySQL
- **Geospatial Databases:** PostGIS for location queries
- **Time-series:** For driver location tracking
- **Sharding:** By geographic regions

### Netflix's Data Architecture
**Challenge:** Personalization and content delivery

**Solution:**
- **Cassandra:** User viewing history and preferences
- **MySQL:** Billing and account information
- **Elasticsearch:** Content search and discovery
- **Redis:** Real-time recommendations

## Best Practices

### 1. Schema Design
- Normalize to reduce redundancy
- Denormalize for performance when needed
- Use appropriate data types
- Plan for future growth
- Document schema changes

### 2. Performance
- Index frequently queried columns
- Monitor query performance
- Use connection pooling
- Implement caching strategies
- Regular maintenance (VACUUM, ANALYZE)

### 3. Security
- Use least privilege access
- Encrypt sensitive data
- Regular security audits
- Backup and disaster recovery
- Monitor for suspicious activity

### 4. Scalability
- Start simple, scale as needed
- Monitor key metrics
- Plan for data growth
- Consider read/write patterns
- Test scaling strategies

## Next Steps

In the next chapter, we'll explore API design and gateway patterns, which provide the interface layer between clients and your database-backed services.