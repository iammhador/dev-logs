# Chapter 20: Partitioning & Sharding

## 📚 What You'll Learn

Partitioning and sharding are essential techniques for scaling databases beyond single-server limitations. This chapter covers horizontal and vertical partitioning, sharding strategies, data distribution, and managing distributed databases for both MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

- **Database Partitioning**: Understand table partitioning strategies
- **Horizontal Sharding**: Distribute data across multiple servers
- **Vertical Sharding**: Split tables by columns or functionality
- **Shard Key Selection**: Choose optimal data distribution keys
- **Cross-Shard Queries**: Handle queries spanning multiple shards
- **Rebalancing**: Redistribute data as requirements change
- **Consistency**: Maintain data integrity across shards

---

## 📖 Concept Explanation

### What is Partitioning?

**Partitioning** divides a large table into smaller, more manageable pieces called partitions, while keeping them within the same database instance.

### What is Sharding?

**Sharding** distributes data across multiple database servers (shards), where each shard contains a subset of the total data.

### Partitioning vs Sharding

| Aspect | Partitioning | Sharding |
|--------|-------------|----------|
| **Scope** | Single database instance | Multiple database servers |
| **Complexity** | Lower | Higher |
| **Scalability** | Limited by single server | Unlimited horizontal scaling |
| **Queries** | Transparent to application | May require application changes |
| **Consistency** | ACID guaranteed | Eventual consistency challenges |

---

## 🔧 MySQL Partitioning

### Range Partitioning

```sql
-- Partition orders by date range
CREATE TABLE orders (
    id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status ENUM('pending', 'processing', 'shipped', 'delivered'),
    PRIMARY KEY (id, order_date)
) PARTITION BY RANGE (YEAR(order_date)) (
    PARTITION p2020 VALUES LESS THAN (2021),
    PARTITION p2021 VALUES LESS THAN (2022),
    PARTITION p2022 VALUES LESS THAN (2023),
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Add new partition for 2025
ALTER TABLE orders ADD PARTITION (
    PARTITION p2025 VALUES LESS THAN (2026)
);

-- Drop old partition
ALTER TABLE orders DROP PARTITION p2020;
```

### Hash Partitioning

```sql
-- Partition users by hash of user_id
CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) PARTITION BY HASH(id) PARTITIONS 8;

-- Partition by custom hash function
CREATE TABLE user_sessions (
    session_id VARCHAR(64),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    PRIMARY KEY (session_id, user_id)
) PARTITION BY HASH(CRC32(session_id)) PARTITIONS 16;
```

### List Partitioning

```sql
-- Partition by specific values (regions)
CREATE TABLE sales (
    id INT AUTO_INCREMENT,
    region VARCHAR(20) NOT NULL,
    product_id INT,
    amount DECIMAL(10,2),
    sale_date DATE,
    PRIMARY KEY (id, region)
) PARTITION BY LIST COLUMNS(region) (
    PARTITION p_north VALUES IN ('north', 'northeast', 'northwest'),
    PARTITION p_south VALUES IN ('south', 'southeast', 'southwest'),
    PARTITION p_east VALUES IN ('east', 'central_east'),
    PARTITION p_west VALUES IN ('west', 'central_west'),
    PARTITION p_international VALUES IN ('europe', 'asia', 'africa')
);
```

### Subpartitioning

```sql
-- Combine range and hash partitioning
CREATE TABLE order_details (
    id INT AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT,
    price DECIMAL(10,2),
    order_date DATE NOT NULL,
    PRIMARY KEY (id, order_date, order_id)
) PARTITION BY RANGE (YEAR(order_date))
SUBPARTITION BY HASH(order_id)
SUBPARTITIONS 4 (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## 🐘 PostgreSQL Partitioning

### Declarative Partitioning (PostgreSQL 10+)

#### Range Partitioning

```sql
-- Create parent table
CREATE TABLE orders (
    id SERIAL,
    user_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
) PARTITION BY RANGE (order_date);

-- Create partitions
CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

CREATE TABLE orders_2024 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE orders_default PARTITION OF orders DEFAULT;

-- Create indexes on partitions
CREATE INDEX idx_orders_2023_user_date ON orders_2023 (user_id, order_date);
CREATE INDEX idx_orders_2024_user_date ON orders_2024 (user_id, order_date);
```

#### Hash Partitioning

```sql
-- Create hash-partitioned table
CREATE TABLE user_activities (
    id SERIAL,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(50),
    activity_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY HASH (user_id);

-- Create hash partitions
CREATE TABLE user_activities_0 PARTITION OF user_activities
    FOR VALUES WITH (modulus 4, remainder 0);

CREATE TABLE user_activities_1 PARTITION OF user_activities
    FOR VALUES WITH (modulus 4, remainder 1);

CREATE TABLE user_activities_2 PARTITION OF user_activities
    FOR VALUES WITH (modulus 4, remainder 2);

CREATE TABLE user_activities_3 PARTITION OF user_activities
    FOR VALUES WITH (modulus 4, remainder 3);
```

#### List Partitioning

```sql
-- Create list-partitioned table
CREATE TABLE products (
    id SERIAL,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY LIST (category);

-- Create list partitions
CREATE TABLE products_electronics PARTITION OF products
    FOR VALUES IN ('electronics', 'computers', 'phones');

CREATE TABLE products_clothing PARTITION OF products
    FOR VALUES IN ('clothing', 'shoes', 'accessories');

CREATE TABLE products_books PARTITION OF products
    FOR VALUES IN ('books', 'ebooks', 'audiobooks');

CREATE TABLE products_other PARTITION OF products DEFAULT;
```

### Partition Pruning and Constraint Exclusion

```sql
-- Enable constraint exclusion
SET constraint_exclusion = partition;

-- Query that benefits from partition pruning
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders 
WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31';

-- Check partition pruning
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename LIKE 'orders_%';
```

---

## 🌐 Horizontal Sharding Strategies

### Shard Key Selection

#### 1. User ID Sharding

```python
class UserShardRouter:
    def __init__(self, shard_count=4):
        self.shard_count = shard_count
        self.shards = {
            0: create_engine('mysql://user:pass@shard0:3306/app'),
            1: create_engine('mysql://user:pass@shard1:3306/app'),
            2: create_engine('mysql://user:pass@shard2:3306/app'),
            3: create_engine('mysql://user:pass@shard3:3306/app')
        }
    
    def get_shard(self, user_id):
        """Route based on user_id hash"""
        shard_id = hash(str(user_id)) % self.shard_count
        return self.shards[shard_id]
    
    def create_user(self, user_data):
        """Create user in appropriate shard"""
        user_id = user_data['id']
        shard = self.get_shard(user_id)
        
        with shard.connect() as conn:
            conn.execute("""
                INSERT INTO users (id, username, email, created_at)
                VALUES (%(id)s, %(username)s, %(email)s, %(created_at)s)
            """, user_data)
    
    def get_user(self, user_id):
        """Get user from appropriate shard"""
        shard = self.get_shard(user_id)
        
        with shard.connect() as conn:
            result = conn.execute(
                "SELECT * FROM users WHERE id = %s", (user_id,)
            )
            return result.fetchone()
    
    def get_user_orders(self, user_id):
        """Get orders for user from same shard"""
        shard = self.get_shard(user_id)
        
        with shard.connect() as conn:
            result = conn.execute("""
                SELECT o.*, oi.product_id, oi.quantity, oi.price
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC
            """, (user_id,))
            return result.fetchall()

# Usage
router = UserShardRouter()

# Create user (automatically routed to correct shard)
router.create_user({
    'id': 12345,
    'username': 'john_doe',
    'email': 'john@example.com',
    'created_at': datetime.now()
})

# Get user (automatically routed to correct shard)
user = router.get_user(12345)
orders = router.get_user_orders(12345)
```

#### 2. Geographic Sharding

```python
class GeographicShardRouter:
    def __init__(self):
        self.region_shards = {
            'us_east': create_engine('mysql://user:pass@us-east-shard:3306/app'),
            'us_west': create_engine('mysql://user:pass@us-west-shard:3306/app'),
            'europe': create_engine('mysql://user:pass@eu-shard:3306/app'),
            'asia': create_engine('mysql://user:pass@asia-shard:3306/app')
        }
        
        self.country_to_region = {
            'US': 'us_east', 'CA': 'us_east',
            'GB': 'europe', 'DE': 'europe', 'FR': 'europe',
            'JP': 'asia', 'CN': 'asia', 'IN': 'asia'
        }
    
    def get_shard_by_country(self, country_code):
        """Route based on country"""
        region = self.country_to_region.get(country_code, 'us_east')
        return self.region_shards[region]
    
    def create_order(self, order_data):
        """Create order in geographically appropriate shard"""
        shard = self.get_shard_by_country(order_data['country'])
        
        with shard.connect() as conn:
            with conn.begin():
                # Insert order
                result = conn.execute("""
                    INSERT INTO orders (user_id, country, total_amount, created_at)
                    VALUES (%(user_id)s, %(country)s, %(total_amount)s, %(created_at)s)
                """, order_data)
                
                order_id = result.lastrowid
                
                # Insert order items
                for item in order_data['items']:
                    item['order_id'] = order_id
                    conn.execute("""
                        INSERT INTO order_items (order_id, product_id, quantity, price)
                        VALUES (%(order_id)s, %(product_id)s, %(quantity)s, %(price)s)
                    """, item)
                
                return order_id
    
    def get_regional_analytics(self, region, start_date, end_date):
        """Get analytics for specific region"""
        shard = self.region_shards[region]
        
        with shard.connect() as conn:
            return conn.execute("""
                SELECT 
                    DATE(created_at) as order_date,
                    COUNT(*) as total_orders,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order_value
                FROM orders
                WHERE created_at BETWEEN %s AND %s
                GROUP BY DATE(created_at)
                ORDER BY order_date
            """, (start_date, end_date)).fetchall()

# Usage
geo_router = GeographicShardRouter()

# Create order (routed to appropriate geographic shard)
order_id = geo_router.create_order({
    'user_id': 12345,
    'country': 'US',
    'total_amount': 99.99,
    'created_at': datetime.now(),
    'items': [
        {'product_id': 1, 'quantity': 2, 'price': 29.99},
        {'product_id': 2, 'quantity': 1, 'price': 39.99}
    ]
})

# Get regional analytics
us_stats = geo_router.get_regional_analytics('us_east', '2024-01-01', '2024-01-31')
```

#### 3. Time-Based Sharding

```python
class TimeBasedShardRouter:
    def __init__(self):
        self.time_shards = {
            '2023': create_engine('mysql://user:pass@shard-2023:3306/app'),
            '2024': create_engine('mysql://user:pass@shard-2024:3306/app'),
            '2025': create_engine('mysql://user:pass@shard-2025:3306/app')
        }
    
    def get_shard_by_date(self, date_obj):
        """Route based on year"""
        year = str(date_obj.year)
        return self.time_shards.get(year, self.time_shards['2024'])  # Default to current
    
    def create_log_entry(self, log_data):
        """Create log entry in time-appropriate shard"""
        shard = self.get_shard_by_date(log_data['timestamp'])
        
        with shard.connect() as conn:
            conn.execute("""
                INSERT INTO activity_logs (user_id, action, details, timestamp)
                VALUES (%(user_id)s, %(action)s, %(details)s, %(timestamp)s)
            """, log_data)
    
    def get_logs_for_period(self, start_date, end_date):
        """Get logs across multiple time shards"""
        all_logs = []
        
        # Determine which shards to query
        years = set()
        current_date = start_date
        while current_date <= end_date:
            years.add(str(current_date.year))
            current_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
        
        # Query each relevant shard
        for year in years:
            if year in self.time_shards:
                shard = self.time_shards[year]
                with shard.connect() as conn:
                    logs = conn.execute("""
                        SELECT * FROM activity_logs
                        WHERE timestamp BETWEEN %s AND %s
                        ORDER BY timestamp
                    """, (start_date, end_date)).fetchall()
                    all_logs.extend(logs)
        
        # Sort combined results
        return sorted(all_logs, key=lambda x: x['timestamp'])

# Usage
time_router = TimeBasedShardRouter()

# Create log entry (routed to appropriate time shard)
time_router.create_log_entry({
    'user_id': 12345,
    'action': 'login',
    'details': {'ip': '192.168.1.100', 'user_agent': 'Chrome/91.0'},
    'timestamp': datetime.now()
})

# Get logs across time period (may query multiple shards)
logs = time_router.get_logs_for_period(
    datetime(2023, 12, 1),
    datetime(2024, 2, 1)
)
```

---

## 🔄 Cross-Shard Operations

### Distributed Queries

```python
class DistributedQueryManager:
    def __init__(self, shard_router):
        self.router = shard_router
    
    def aggregate_across_shards(self, query, params=None):
        """Execute query across all shards and aggregate results"""
        all_results = []
        
        for shard_id, shard in self.router.shards.items():
            try:
                with shard.connect() as conn:
                    result = conn.execute(query, params or {})
                    shard_results = result.fetchall()
                    
                    # Add shard_id to each result
                    for row in shard_results:
                        row_dict = dict(row)
                        row_dict['_shard_id'] = shard_id
                        all_results.append(row_dict)
                        
            except Exception as e:
                print(f"Error querying shard {shard_id}: {e}")
                continue
        
        return all_results
    
    def get_global_user_count(self):
        """Get total user count across all shards"""
        results = self.aggregate_across_shards("SELECT COUNT(*) as user_count FROM users")
        return sum(row['user_count'] for row in results)
    
    def get_top_users_by_orders(self, limit=10):
        """Get top users by order count across all shards"""
        query = """
            SELECT 
                user_id,
                COUNT(*) as order_count,
                SUM(total_amount) as total_spent
            FROM orders
            GROUP BY user_id
            ORDER BY order_count DESC
            LIMIT %s
        """
        
        all_results = self.aggregate_across_shards(query, (limit * 2,))  # Get more from each shard
        
        # Aggregate results across shards
        user_aggregates = {}
        for row in all_results:
            user_id = row['user_id']
            if user_id not in user_aggregates:
                user_aggregates[user_id] = {
                    'user_id': user_id,
                    'order_count': 0,
                    'total_spent': 0
                }
            
            user_aggregates[user_id]['order_count'] += row['order_count']
            user_aggregates[user_id]['total_spent'] += row['total_spent']
        
        # Sort and return top users
        sorted_users = sorted(
            user_aggregates.values(),
            key=lambda x: x['order_count'],
            reverse=True
        )
        
        return sorted_users[:limit]
    
    def search_users_by_email(self, email_pattern):
        """Search for users by email pattern across all shards"""
        query = "SELECT * FROM users WHERE email LIKE %s"
        return self.aggregate_across_shards(query, (f"%{email_pattern}%",))

# Usage
dist_query = DistributedQueryManager(router)

# Get global statistics
total_users = dist_query.get_global_user_count()
top_users = dist_query.get_top_users_by_orders(10)

# Search across shards
users = dist_query.search_users_by_email("gmail.com")
```

### Distributed Transactions

```python
from contextlib import contextmanager

class DistributedTransactionManager:
    def __init__(self, shard_router):
        self.router = shard_router
    
    @contextmanager
    def distributed_transaction(self, shard_ids):
        """Two-phase commit across multiple shards"""
        connections = {}
        transactions = {}
        
        try:
            # Phase 1: Prepare all transactions
            for shard_id in shard_ids:
                shard = self.router.shards[shard_id]
                conn = shard.connect()
                trans = conn.begin()
                
                connections[shard_id] = conn
                transactions[shard_id] = trans
            
            yield connections
            
            # Phase 2: Commit all transactions
            for shard_id in shard_ids:
                transactions[shard_id].commit()
                
        except Exception as e:
            # Rollback all transactions on error
            for shard_id in shard_ids:
                if shard_id in transactions:
                    try:
                        transactions[shard_id].rollback()
                    except:
                        pass
            raise e
            
        finally:
            # Close all connections
            for conn in connections.values():
                conn.close()
    
    def transfer_user_data(self, from_user_id, to_user_id, amount):
        """Transfer data between users potentially on different shards"""
        from_shard_id = hash(str(from_user_id)) % len(self.router.shards)
        to_shard_id = hash(str(to_user_id)) % len(self.router.shards)
        
        shard_ids = list(set([from_shard_id, to_shard_id]))
        
        with self.distributed_transaction(shard_ids) as connections:
            # Deduct from source user
            from_conn = connections[from_shard_id]
            from_conn.execute("""
                UPDATE user_balances 
                SET balance = balance - %s 
                WHERE user_id = %s AND balance >= %s
            """, (amount, from_user_id, amount))
            
            # Add to destination user
            to_conn = connections[to_shard_id]
            to_conn.execute("""
                UPDATE user_balances 
                SET balance = balance + %s 
                WHERE user_id = %s
            """, (amount, to_user_id))
            
            # Log transaction in both shards if different
            if from_shard_id != to_shard_id:
                from_conn.execute("""
                    INSERT INTO transfer_logs (from_user_id, to_user_id, amount, type)
                    VALUES (%s, %s, %s, 'outgoing')
                """, (from_user_id, to_user_id, amount))
                
                to_conn.execute("""
                    INSERT INTO transfer_logs (from_user_id, to_user_id, amount, type)
                    VALUES (%s, %s, %s, 'incoming')
                """, (from_user_id, to_user_id, amount))
            else:
                from_conn.execute("""
                    INSERT INTO transfer_logs (from_user_id, to_user_id, amount, type)
                    VALUES (%s, %s, %s, 'internal')
                """, (from_user_id, to_user_id, amount))

# Usage
dist_tx = DistributedTransactionManager(router)

# Transfer between users (potentially on different shards)
try:
    dist_tx.transfer_user_data(12345, 67890, 100.00)
    print("Transfer completed successfully")
except Exception as e:
    print(f"Transfer failed: {e}")
```

---

## ⚖️ Shard Rebalancing

### Consistent Hashing

```python
import hashlib
import bisect

class ConsistentHashRouter:
    def __init__(self, shards, virtual_nodes=150):
        self.shards = shards
        self.virtual_nodes = virtual_nodes
        self.ring = {}
        self.sorted_keys = []
        
        self._build_ring()
    
    def _hash(self, key):
        """Hash function for consistent hashing"""
        return int(hashlib.md5(str(key).encode()).hexdigest(), 16)
    
    def _build_ring(self):
        """Build the consistent hash ring"""
        for shard_id in self.shards:
            for i in range(self.virtual_nodes):
                virtual_key = self._hash(f"{shard_id}:{i}")
                self.ring[virtual_key] = shard_id
        
        self.sorted_keys = sorted(self.ring.keys())
    
    def get_shard(self, key):
        """Get shard for given key"""
        if not self.ring:
            return None
        
        hash_key = self._hash(key)
        
        # Find the first shard clockwise from the hash
        idx = bisect.bisect_right(self.sorted_keys, hash_key)
        if idx == len(self.sorted_keys):
            idx = 0
        
        return self.ring[self.sorted_keys[idx]]
    
    def add_shard(self, shard_id):
        """Add new shard to the ring"""
        self.shards.append(shard_id)
        
        for i in range(self.virtual_nodes):
            virtual_key = self._hash(f"{shard_id}:{i}")
            self.ring[virtual_key] = shard_id
        
        self.sorted_keys = sorted(self.ring.keys())
    
    def remove_shard(self, shard_id):
        """Remove shard from the ring"""
        self.shards.remove(shard_id)
        
        # Remove virtual nodes for this shard
        keys_to_remove = []
        for key, shard in self.ring.items():
            if shard == shard_id:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.ring[key]
        
        self.sorted_keys = sorted(self.ring.keys())
    
    def get_affected_keys(self, old_shard, new_shard, key_range):
        """Get keys that need to be moved when rebalancing"""
        affected_keys = []
        
        for key in key_range:
            current_shard = self.get_shard(key)
            if current_shard != old_shard:
                affected_keys.append(key)
        
        return affected_keys

# Usage
shards = ['shard0', 'shard1', 'shard2', 'shard3']
consistent_router = ConsistentHashRouter(shards)

# Test distribution
user_ids = range(1, 10001)
shard_distribution = {}

for user_id in user_ids:
    shard = consistent_router.get_shard(user_id)
    shard_distribution[shard] = shard_distribution.get(shard, 0) + 1

print("Distribution before adding shard:")
for shard, count in shard_distribution.items():
    print(f"{shard}: {count} users ({count/len(user_ids)*100:.1f}%)")

# Add new shard
consistent_router.add_shard('shard4')

# Check new distribution
new_distribution = {}
for user_id in user_ids:
    shard = consistent_router.get_shard(user_id)
    new_distribution[shard] = new_distribution.get(shard, 0) + 1

print("\nDistribution after adding shard4:")
for shard, count in new_distribution.items():
    print(f"{shard}: {count} users ({count/len(user_ids)*100:.1f}%)")
```

### Data Migration

```python
class ShardMigrationManager:
    def __init__(self, source_router, target_router):
        self.source_router = source_router
        self.target_router = target_router
    
    def migrate_user_data(self, user_id):
        """Migrate single user's data between shards"""
        source_shard = self.source_router.get_shard(user_id)
        target_shard = self.target_router.get_shard(user_id)
        
        if source_shard == target_shard:
            return  # No migration needed
        
        source_conn = self.source_router.shards[source_shard].connect()
        target_conn = self.target_router.shards[target_shard].connect()
        
        try:
            with source_conn.begin() as source_tx:
                with target_conn.begin() as target_tx:
                    # Copy user data
                    user_data = source_conn.execute(
                        "SELECT * FROM users WHERE id = %s", (user_id,)
                    ).fetchone()
                    
                    if user_data:
                        target_conn.execute("""
                            INSERT INTO users (id, username, email, created_at)
                            VALUES (%(id)s, %(username)s, %(email)s, %(created_at)s)
                            ON DUPLICATE KEY UPDATE
                            username = VALUES(username),
                            email = VALUES(email)
                        """, dict(user_data))
                    
                    # Copy user orders
                    orders = source_conn.execute(
                        "SELECT * FROM orders WHERE user_id = %s", (user_id,)
                    ).fetchall()
                    
                    for order in orders:
                        target_conn.execute("""
                            INSERT INTO orders (id, user_id, total_amount, status, created_at)
                            VALUES (%(id)s, %(user_id)s, %(total_amount)s, %(status)s, %(created_at)s)
                            ON DUPLICATE KEY UPDATE
                            total_amount = VALUES(total_amount),
                            status = VALUES(status)
                        """, dict(order))
                        
                        # Copy order items
                        order_items = source_conn.execute(
                            "SELECT * FROM order_items WHERE order_id = %s", (order['id'],)
                        ).fetchall()
                        
                        for item in order_items:
                            target_conn.execute("""
                                INSERT INTO order_items (id, order_id, product_id, quantity, price)
                                VALUES (%(id)s, %(order_id)s, %(product_id)s, %(quantity)s, %(price)s)
                                ON DUPLICATE KEY UPDATE
                                quantity = VALUES(quantity),
                                price = VALUES(price)
                            """, dict(item))
                    
                    # Verify migration
                    source_count = source_conn.execute(
                        "SELECT COUNT(*) FROM orders WHERE user_id = %s", (user_id,)
                    ).scalar()
                    
                    target_count = target_conn.execute(
                        "SELECT COUNT(*) FROM orders WHERE user_id = %s", (user_id,)
                    ).scalar()
                    
                    if source_count != target_count:
                        raise Exception(f"Migration verification failed: {source_count} != {target_count}")
                    
                    # Delete from source after successful migration
                    source_conn.execute("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = %s)", (user_id,))
                    source_conn.execute("DELETE FROM orders WHERE user_id = %s", (user_id,))
                    source_conn.execute("DELETE FROM users WHERE id = %s", (user_id,))
                    
        finally:
            source_conn.close()
            target_conn.close()
    
    def migrate_batch(self, user_ids, batch_size=100):
        """Migrate users in batches"""
        total_users = len(user_ids)
        migrated = 0
        
        for i in range(0, total_users, batch_size):
            batch = user_ids[i:i + batch_size]
            
            for user_id in batch:
                try:
                    self.migrate_user_data(user_id)
                    migrated += 1
                    
                    if migrated % 10 == 0:
                        print(f"Migrated {migrated}/{total_users} users ({migrated/total_users*100:.1f}%)")
                        
                except Exception as e:
                    print(f"Failed to migrate user {user_id}: {e}")
            
            # Small delay between batches
            time.sleep(0.1)
        
        print(f"Migration completed: {migrated}/{total_users} users migrated")

# Usage
old_router = UserShardRouter(shard_count=4)
new_router = UserShardRouter(shard_count=5)  # Added one more shard

migration_manager = ShardMigrationManager(old_router, new_router)

# Migrate specific users
users_to_migrate = [12345, 67890, 11111]
migration_manager.migrate_batch(users_to_migrate)
```

---

## 🏗️ Real-World Example: E-commerce Sharding Architecture

### Multi-Dimensional Sharding

```python
class EcommerceShardingStrategy:
    def __init__(self):
        # User shards (by user_id hash)
        self.user_shards = {
            0: create_engine('mysql://user:pass@user-shard-0:3306/ecommerce'),
            1: create_engine('mysql://user:pass@user-shard-1:3306/ecommerce'),
            2: create_engine('mysql://user:pass@user-shard-2:3306/ecommerce'),
            3: create_engine('mysql://user:pass@user-shard-3:3306/ecommerce')
        }
        
        # Product shards (by category)
        self.product_shards = {
            'electronics': create_engine('mysql://user:pass@product-electronics:3306/ecommerce'),
            'clothing': create_engine('mysql://user:pass@product-clothing:3306/ecommerce'),
            'books': create_engine('mysql://user:pass@product-books:3306/ecommerce'),
            'home': create_engine('mysql://user:pass@product-home:3306/ecommerce')
        }
        
        # Order shards (by time + user_id)
        self.order_shards = {
            ('2024', 0): create_engine('mysql://user:pass@orders-2024-0:3306/ecommerce'),
            ('2024', 1): create_engine('mysql://user:pass@orders-2024-1:3306/ecommerce'),
            ('2024', 2): create_engine('mysql://user:pass@orders-2024-2:3306/ecommerce'),
            ('2024', 3): create_engine('mysql://user:pass@orders-2024-3:3306/ecommerce')
        }
    
    def get_user_shard(self, user_id):
        """Get shard for user data"""
        shard_id = hash(str(user_id)) % len(self.user_shards)
        return self.user_shards[shard_id]
    
    def get_product_shard(self, category):
        """Get shard for product data"""
        return self.product_shards.get(category, self.product_shards['electronics'])
    
    def get_order_shard(self, user_id, order_date):
        """Get shard for order data"""
        year = str(order_date.year)
        user_shard_id = hash(str(user_id)) % 4
        return self.order_shards.get((year, user_shard_id))
    
    def create_user(self, user_data):
        """Create user in appropriate shard"""
        shard = self.get_user_shard(user_data['id'])
        
        with shard.connect() as conn:
            conn.execute("""
                INSERT INTO users (id, username, email, country, created_at)
                VALUES (%(id)s, %(username)s, %(email)s, %(country)s, %(created_at)s)
            """, user_data)
    
    def create_product(self, product_data):
        """Create product in category-specific shard"""
        shard = self.get_product_shard(product_data['category'])
        
        with shard.connect() as conn:
            conn.execute("""
                INSERT INTO products (id, name, category, price, description, created_at)
                VALUES (%(id)s, %(name)s, %(category)s, %(price)s, %(description)s, %(created_at)s)
            """, product_data)
    
    def create_order(self, order_data):
        """Create order with items from multiple product shards"""
        order_shard = self.get_order_shard(order_data['user_id'], order_data['created_at'])
        
        with order_shard.connect() as conn:
            with conn.begin():
                # Insert order
                result = conn.execute("""
                    INSERT INTO orders (user_id, total_amount, status, created_at)
                    VALUES (%(user_id)s, %(total_amount)s, %(status)s, %(created_at)s)
                """, order_data)
                
                order_id = result.lastrowid
                
                # Insert order items
                for item in order_data['items']:
                    item['order_id'] = order_id
                    conn.execute("""
                        INSERT INTO order_items (order_id, product_id, quantity, price)
                        VALUES (%(order_id)s, %(product_id)s, %(quantity)s, %(price)s)
                    """, item)
                
                return order_id
    
    def get_user_orders(self, user_id, start_date=None, end_date=None):
        """Get user orders, potentially from multiple time shards"""
        all_orders = []
        
        # Determine which order shards to query
        if start_date and end_date:
            years = set()
            current_year = start_date.year
            while current_year <= end_date.year:
                years.add(str(current_year))
                current_year += 1
        else:
            years = ['2024']  # Default to current year
        
        user_shard_id = hash(str(user_id)) % 4
        
        for year in years:
            shard_key = (year, user_shard_id)
            if shard_key in self.order_shards:
                shard = self.order_shards[shard_key]
                
                with shard.connect() as conn:
                    query = "SELECT * FROM orders WHERE user_id = %s"
                    params = [user_id]
                    
                    if start_date and end_date:
                        query += " AND created_at BETWEEN %s AND %s"
                        params.extend([start_date, end_date])
                    
                    query += " ORDER BY created_at DESC"
                    
                    orders = conn.execute(query, params).fetchall()
                    all_orders.extend([dict(order) for order in orders])
        
        # Sort combined results
        return sorted(all_orders, key=lambda x: x['created_at'], reverse=True)
    
    def get_product_analytics(self, category, start_date, end_date):
        """Get product analytics for specific category"""
        product_shard = self.get_product_shard(category)
        
        # Need to query across all order shards for this category
        all_sales = []
        
        for shard_key, order_shard in self.order_shards.items():
            with order_shard.connect() as conn:
                sales = conn.execute("""
                    SELECT 
                        oi.product_id,
                        SUM(oi.quantity) as total_quantity,
                        SUM(oi.quantity * oi.price) as total_revenue
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    WHERE o.created_at BETWEEN %s AND %s
                    GROUP BY oi.product_id
                """, (start_date, end_date)).fetchall()
                
                all_sales.extend([dict(sale) for sale in sales])
        
        # Aggregate sales across shards
        product_totals = {}
        for sale in all_sales:
            product_id = sale['product_id']
            if product_id not in product_totals:
                product_totals[product_id] = {
                    'product_id': product_id,
                    'total_quantity': 0,
                    'total_revenue': 0
                }
            
            product_totals[product_id]['total_quantity'] += sale['total_quantity']
            product_totals[product_id]['total_revenue'] += sale['total_revenue']
        
        # Get product details from product shard
        with product_shard.connect() as conn:
            for product_total in product_totals.values():
                product = conn.execute(
                    "SELECT name, category FROM products WHERE id = %s",
                    (product_total['product_id'],)
                ).fetchone()
                
                if product:
                    product_total.update(dict(product))
        
        return list(product_totals.values())

# Usage
ecommerce_sharding = EcommerceShardingStrategy()

# Create user (routed to user shard)
ecommerce_sharding.create_user({
    'id': 12345,
    'username': 'john_doe',
    'email': 'john@example.com',
    'country': 'US',
    'created_at': datetime.now()
})

# Create products (routed to category shards)
ecommerce_sharding.create_product({
    'id': 1001,
    'name': 'iPhone 15',
    'category': 'electronics',
    'price': 999.99,
    'description': 'Latest iPhone model',
    'created_at': datetime.now()
})

# Create order (routed to time+user shard)
order_id = ecommerce_sharding.create_order({
    'user_id': 12345,
    'total_amount': 1049.98,
    'status': 'pending',
    'created_at': datetime.now(),
    'items': [
        {'product_id': 1001, 'quantity': 1, 'price': 999.99},
        {'product_id': 1002, 'quantity': 1, 'price': 49.99}
    ]
})

# Get user orders (may query multiple time shards)
orders = ecommerce_sharding.get_user_orders(12345)

# Get analytics (aggregates across multiple shards)
electronics_analytics = ecommerce_sharding.get_product_analytics(
    'electronics',
    datetime(2024, 1, 1),
    datetime(2024, 1, 31)
)
```

---

## 🎯 Interview Questions

### Basic Questions
1. **What's the difference between partitioning and sharding?**
2. **What are the main types of partitioning strategies?**
3. **How do you choose a good shard key?**

### Intermediate Questions
1. **How would you handle cross-shard queries efficiently?**
2. **What are the challenges of distributed transactions across shards?**
3. **How do you rebalance data when adding new shards?**

### Advanced Questions
1. **Design a sharding strategy for a global social media platform**
2. **How would you implement consistent hashing for dynamic shard management?**
3. **What are the trade-offs between different sharding strategies?**

---

## ⚠️ Common Pitfalls

### 1. **Poor Shard Key Selection**
```python
# Problem: Hotspot sharding
def bad_shard_key(timestamp):
    return timestamp.hour % 4  # All traffic goes to one shard during peak hours

# Solution: Combine multiple factors
def good_shard_key(user_id, timestamp):
    return hash(f"{user_id}:{timestamp.date()}") % 4
```

### 2. **Cross-Shard Join Dependencies**
```sql
-- Problem: Joins across shards are expensive
SELECT u.username, o.total_amount
FROM users u  -- On user shard
JOIN orders o ON u.id = o.user_id  -- On order shard
WHERE o.created_at > '2024-01-01';

-- Solution: Denormalize or use application-level joins
-- Store user info in order records
ALTER TABLE orders ADD COLUMN username VARCHAR(50);
```

### 3. **Inadequate Monitoring**
```python
# Problem: Not monitoring shard distribution
# Solution: Regular distribution analysis
def analyze_shard_distribution(router, sample_keys):
    distribution = {}
    for key in sample_keys:
        shard = router.get_shard(key)
        distribution[shard] = distribution.get(shard, 0) + 1
    
    total = len(sample_keys)
    for shard, count in distribution.items():
        percentage = (count / total) * 100
        print(f"Shard {shard}: {count} keys ({percentage:.1f}%)")
        
        if percentage > 30:  # Alert if any shard has >30% of data
            print(f"WARNING: Shard {shard} is overloaded!")
```

---

## 🎯 Next Steps

Congratulations! You've mastered database partitioning and sharding. You now understand:

✅ **Table partitioning strategies and implementation**  
✅ **Horizontal and vertical sharding techniques**  
✅ **Shard key selection and distribution strategies**  
✅ **Cross-shard operations and distributed transactions**  
✅ **Rebalancing and migration strategies**  
✅ **Real-world sharding architectures**

**Continue to** → [Chapter 21: ETL & Data Warehousing](./21-etl-data-warehousing.md)

---

*You're now equipped to design and implement scalable database architectures that can handle massive datasets across multiple servers!* 🚀