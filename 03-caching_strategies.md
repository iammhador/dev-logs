# Chapter 3: Caching Strategies and Implementation

## Overview

Caching is a technique that stores frequently accessed data in a fast storage layer to reduce latency, decrease load on backend systems, and improve overall system performance. It's one of the most effective ways to scale applications.

## What is Caching?

Caching involves:
- **Temporary Storage**: Keeping copies of data in faster storage
- **Performance Optimization**: Reducing response times
- **Load Reduction**: Decreasing pressure on backend systems
- **Cost Efficiency**: Reducing computational and network costs

## Types of Caching

### 1. Browser Caching
**Location:** Client-side (user's browser)
**Purpose:** Cache static assets and API responses

**HTTP Headers for Browser Caching:**
```http
# Cache for 1 year
Cache-Control: public, max-age=31536000

# Cache but revalidate
Cache-Control: public, max-age=3600, must-revalidate

# No caching
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

**Implementation Example:**
```javascript
// Service Worker for advanced browser caching
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open('images-v1').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response; // Return cached image
          }
          
          return fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### 2. CDN (Content Delivery Network)
**Location:** Edge servers worldwide
**Purpose:** Cache static content closer to users

**Benefits:**
- Reduced latency
- Decreased origin server load
- Improved availability
- DDoS protection

**CDN Configuration Example:**
```yaml
# CloudFront configuration
Distribution:
  DistributionConfig:
    Origins:
      - DomainName: myapp.com
        Id: myapp-origin
        CustomOriginConfig:
          HTTPPort: 80
          HTTPSPort: 443
          OriginProtocolPolicy: https-only
    
    DefaultCacheBehavior:
      TargetOriginId: myapp-origin
      ViewerProtocolPolicy: redirect-to-https
      CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # Managed-CachingOptimized
      TTL:
        DefaultTTL: 86400  # 1 day
        MaxTTL: 31536000   # 1 year
```

### 3. Reverse Proxy Caching
**Location:** Between clients and origin servers
**Purpose:** Cache responses from backend services

**NGINX Caching Example:**
```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g 
                     inactive=60m use_temp_path=off;
    
    server {
        listen 80;
        
        location / {
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
            proxy_cache_lock on;
            
            proxy_pass http://backend;
            
            # Add cache status header
            add_header X-Cache-Status $upstream_cache_status;
        }
        
        # Cache static files for longer
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            proxy_cache my_cache;
            proxy_cache_valid 200 1y;
            proxy_pass http://backend;
        }
    }
}
```

### 4. Application-Level Caching
**Location:** Within the application code
**Purpose:** Cache computed results, database queries, API responses

**In-Memory Caching Example:**
```python
import time
from functools import wraps
from typing import Any, Dict, Optional

class InMemoryCache:
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
    
    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() < entry['expires_at']:
                return entry['value']
            else:
                del self._cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        self._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl
        }
    
    def delete(self, key: str):
        self._cache.pop(key, None)
    
    def clear(self):
        self._cache.clear()

# Cache decorator
cache = InMemoryCache()

def cached(ttl: int = 3600):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

# Usage
@cached(ttl=1800)  # Cache for 30 minutes
def expensive_computation(n: int) -> int:
    time.sleep(2)  # Simulate expensive operation
    return sum(i * i for i in range(n))
```

### 5. Database Caching
**Location:** Database layer or between application and database
**Purpose:** Cache query results and reduce database load

**Redis Caching Example:**
```python
import redis
import json
import hashlib
from typing import Any, Optional

class RedisCache:
    def __init__(self, host='localhost', port=6379, db=0):
        self.redis_client = redis.Redis(host=host, port=port, db=db, decode_responses=True)
    
    def get(self, key: str) -> Optional[Any]:
        try:
            value = self.redis_client.get(key)
            return json.loads(value) if value else None
        except (redis.RedisError, json.JSONDecodeError):
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        try:
            self.redis_client.setex(key, ttl, json.dumps(value))
        except redis.RedisError:
            pass  # Handle error appropriately
    
    def delete(self, key: str):
        try:
            self.redis_client.delete(key)
        except redis.RedisError:
            pass
    
    def exists(self, key: str) -> bool:
        try:
            return self.redis_client.exists(key) > 0
        except redis.RedisError:
            return False

class DatabaseCache:
    def __init__(self, cache_backend):
        self.cache = cache_backend
    
    def cache_query(self, query: str, params: tuple = (), ttl: int = 3600):
        # Create cache key from query and parameters
        cache_key = self._generate_cache_key(query, params)
        
        # Try to get from cache
        result = self.cache.get(cache_key)
        if result is not None:
            return result
        
        # Execute query (this would be your actual database call)
        result = self._execute_query(query, params)
        
        # Cache the result
        self.cache.set(cache_key, result, ttl)
        return result
    
    def _generate_cache_key(self, query: str, params: tuple) -> str:
        combined = f"{query}:{str(params)}"
        return f"db_query:{hashlib.md5(combined.encode()).hexdigest()}"
    
    def _execute_query(self, query: str, params: tuple):
        # This would be your actual database execution logic
        pass
```

## Caching Patterns

### 1. Cache-Aside (Lazy Loading)
**How it works:** Application manages cache directly

```python
def get_user(user_id: int):
    # Try cache first
    cache_key = f"user:{user_id}"
    user = cache.get(cache_key)
    
    if user is None:
        # Cache miss - fetch from database
        user = database.get_user(user_id)
        if user:
            cache.set(cache_key, user, ttl=3600)
    
    return user

def update_user(user_id: int, user_data: dict):
    # Update database
    database.update_user(user_id, user_data)
    
    # Invalidate cache
    cache_key = f"user:{user_id}"
    cache.delete(cache_key)
```

**Pros:**
- Simple to implement
- Cache only what's needed
- Resilient to cache failures

**Cons:**
- Cache miss penalty
- Potential for stale data
- Manual cache management

### 2. Write-Through
**How it works:** Write to cache and database simultaneously

```python
def update_user(user_id: int, user_data: dict):
    # Update database
    database.update_user(user_id, user_data)
    
    # Update cache
    cache_key = f"user:{user_id}"
    cache.set(cache_key, user_data, ttl=3600)
    
    return user_data
```

**Pros:**
- Data consistency
- No cache miss penalty for writes
- Simple read operations

**Cons:**
- Write latency
- Unnecessary cache writes
- Cache and database must both be available

### 3. Write-Behind (Write-Back)
**How it works:** Write to cache immediately, database asynchronously

```python
import asyncio
from queue import Queue
from threading import Thread

class WriteBehindCache:
    def __init__(self, cache, database):
        self.cache = cache
        self.database = database
        self.write_queue = Queue()
        self.start_background_writer()
    
    def update_user(self, user_id: int, user_data: dict):
        # Update cache immediately
        cache_key = f"user:{user_id}"
        self.cache.set(cache_key, user_data)
        
        # Queue database write
        self.write_queue.put(('update_user', user_id, user_data))
        
        return user_data
    
    def background_writer(self):
        while True:
            try:
                operation, user_id, user_data = self.write_queue.get(timeout=1)
                if operation == 'update_user':
                    self.database.update_user(user_id, user_data)
                self.write_queue.task_done()
            except:
                continue
    
    def start_background_writer(self):
        Thread(target=self.background_writer, daemon=True).start()
```

**Pros:**
- Low write latency
- High write throughput
- Batching opportunities

**Cons:**
- Risk of data loss
- Complex implementation
- Eventual consistency

### 4. Refresh-Ahead
**How it works:** Proactively refresh cache before expiration

```python
import time
from threading import Thread

class RefreshAheadCache:
    def __init__(self, cache, data_source, refresh_threshold=0.8):
        self.cache = cache
        self.data_source = data_source
        self.refresh_threshold = refresh_threshold
    
    def get(self, key: str):
        # Get from cache with metadata
        cached_item = self.cache.get_with_metadata(key)
        
        if cached_item is None:
            # Cache miss - fetch and cache
            value = self.data_source.get(key)
            self.cache.set(key, value)
            return value
        
        value, created_at, ttl = cached_item
        age = time.time() - created_at
        
        # Check if refresh is needed
        if age > (ttl * self.refresh_threshold):
            # Trigger background refresh
            Thread(target=self._refresh_key, args=(key,), daemon=True).start()
        
        return value
    
    def _refresh_key(self, key: str):
        try:
            fresh_value = self.data_source.get(key)
            self.cache.set(key, fresh_value)
        except Exception:
            # Handle refresh failure
            pass
```

## Cache Invalidation Strategies

### 1. TTL (Time To Live)
**How it works:** Cache entries expire after a set time

```python
# Simple TTL implementation
class TTLCache:
    def __init__(self):
        self._cache = {}
    
    def set(self, key: str, value: Any, ttl: int):
        expires_at = time.time() + ttl
        self._cache[key] = {'value': value, 'expires_at': expires_at}
    
    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() < entry['expires_at']:
                return entry['value']
            else:
                del self._cache[key]
        return None
```

### 2. Event-Based Invalidation
**How it works:** Invalidate cache when related data changes

```python
from typing import Set, Callable

class EventBasedCache:
    def __init__(self):
        self._cache = {}
        self._subscribers = {}  # event -> set of cache keys
    
    def set(self, key: str, value: Any, events: Set[str] = None):
        self._cache[key] = value
        
        # Subscribe to events
        if events:
            for event in events:
                if event not in self._subscribers:
                    self._subscribers[event] = set()
                self._subscribers[event].add(key)
    
    def invalidate_by_event(self, event: str):
        if event in self._subscribers:
            for key in self._subscribers[event]:
                self._cache.pop(key, None)
            del self._subscribers[event]

# Usage
cache = EventBasedCache()

# Cache user data with events
user_data = get_user_from_db(123)
cache.set('user:123', user_data, events={'user_updated', 'user_deleted'})

# When user is updated
def update_user(user_id: int, new_data: dict):
    database.update_user(user_id, new_data)
    cache.invalidate_by_event('user_updated')
```

### 3. Tag-Based Invalidation
**How it works:** Group cache entries by tags and invalidate by tag

```python
class TaggedCache:
    def __init__(self):
        self._cache = {}
        self._tags = {}  # tag -> set of cache keys
    
    def set(self, key: str, value: Any, tags: Set[str] = None):
        self._cache[key] = value
        
        if tags:
            for tag in tags:
                if tag not in self._tags:
                    self._tags[tag] = set()
                self._tags[tag].add(key)
    
    def invalidate_by_tag(self, tag: str):
        if tag in self._tags:
            for key in self._tags[tag]:
                self._cache.pop(key, None)
            del self._tags[tag]
    
    def get(self, key: str):
        return self._cache.get(key)

# Usage
cache = TaggedCache()

# Cache with tags
cache.set('user:123:profile', user_profile, tags={'user:123', 'profiles'})
cache.set('user:123:settings', user_settings, tags={'user:123', 'settings'})

# Invalidate all data for user 123
cache.invalidate_by_tag('user:123')
```

## Distributed Caching

### Redis Cluster Example
```python
import redis
from rediscluster import RedisCluster

# Redis Cluster configuration
startup_nodes = [
    {"host": "127.0.0.1", "port": "7000"},
    {"host": "127.0.0.1", "port": "7001"},
    {"host": "127.0.0.1", "port": "7002"},
]

class DistributedCache:
    def __init__(self, nodes):
        self.redis_cluster = RedisCluster(
            startup_nodes=nodes,
            decode_responses=True,
            skip_full_coverage_check=True
        )
    
    def get(self, key: str):
        try:
            value = self.redis_cluster.get(key)
            return json.loads(value) if value else None
        except Exception:
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        try:
            self.redis_cluster.setex(key, ttl, json.dumps(value))
        except Exception:
            pass
    
    def delete(self, key: str):
        try:
            self.redis_cluster.delete(key)
        except Exception:
            pass
```

### Consistent Hashing for Cache Distribution
```python
import hashlib
from bisect import bisect_left

class ConsistentHashRing:
    def __init__(self, nodes, replicas=3):
        self.replicas = replicas
        self.ring = {}
        self.sorted_keys = []
        
        for node in nodes:
            self.add_node(node)
    
    def add_node(self, node):
        for i in range(self.replicas):
            key = self.hash(f"{node}:{i}")
            self.ring[key] = node
            self.sorted_keys.append(key)
        self.sorted_keys.sort()
    
    def remove_node(self, node):
        for i in range(self.replicas):
            key = self.hash(f"{node}:{i}")
            del self.ring[key]
            self.sorted_keys.remove(key)
    
    def get_node(self, key):
        if not self.ring:
            return None
        
        hash_key = self.hash(key)
        idx = bisect_left(self.sorted_keys, hash_key)
        
        if idx == len(self.sorted_keys):
            idx = 0
        
        return self.ring[self.sorted_keys[idx]]
    
    def hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)
```

## Cache Performance Optimization

### 1. Cache Hit Ratio Monitoring
```python
class CacheMetrics:
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.total_requests = 0
    
    def record_hit(self):
        self.hits += 1
        self.total_requests += 1
    
    def record_miss(self):
        self.misses += 1
        self.total_requests += 1
    
    def hit_ratio(self):
        if self.total_requests == 0:
            return 0
        return self.hits / self.total_requests
    
    def miss_ratio(self):
        return 1 - self.hit_ratio()
```

### 2. Cache Warming
```python
class CacheWarmer:
    def __init__(self, cache, data_source):
        self.cache = cache
        self.data_source = data_source
    
    def warm_popular_data(self, popular_keys):
        """Pre-load popular data into cache"""
        for key in popular_keys:
            try:
                data = self.data_source.get(key)
                self.cache.set(key, data)
            except Exception:
                continue
    
    def warm_user_data(self, user_id):
        """Pre-load all data for a specific user"""
        user_keys = [
            f"user:{user_id}:profile",
            f"user:{user_id}:settings",
            f"user:{user_id}:preferences"
        ]
        self.warm_popular_data(user_keys)
```

## Real-World Examples

### Facebook's TAO
**Purpose:** Distributed caching system for social graph data

**Key Features:**
- Graph-aware caching
- Consistency guarantees
- Automatic invalidation
- Geographic distribution

### Twitter's Cache Architecture
**Components:**
- **L1 Cache:** In-process cache in application servers
- **L2 Cache:** Redis clusters for shared caching
- **L3 Cache:** CDN for static content

### Netflix's EVCache
**Purpose:** Distributed in-memory caching

**Features:**
- Multi-region replication
- Automatic failover
- Monitoring and alerting
- Client-side load balancing

## Best Practices

### 1. Cache Key Design
```python
# Good: Hierarchical and descriptive
user_profile_key = f"user:{user_id}:profile:v2"
product_key = f"product:{product_id}:details:{locale}"

# Bad: Unclear and non-hierarchical
key1 = f"u{user_id}p"
key2 = f"prod{product_id}"
```

### 2. Cache Size Management
```python
class LRUCache:
    def __init__(self, max_size=1000):
        self.max_size = max_size
        self.cache = {}
        self.access_order = []
    
    def get(self, key):
        if key in self.cache:
            # Move to end (most recently used)
            self.access_order.remove(key)
            self.access_order.append(key)
            return self.cache[key]
        return None
    
    def set(self, key, value):
        if key in self.cache:
            self.access_order.remove(key)
        elif len(self.cache) >= self.max_size:
            # Remove least recently used
            lru_key = self.access_order.pop(0)
            del self.cache[lru_key]
        
        self.cache[key] = value
        self.access_order.append(key)
```

### 3. Error Handling
```python
class ResilientCache:
    def __init__(self, primary_cache, fallback_cache=None):
        self.primary_cache = primary_cache
        self.fallback_cache = fallback_cache
    
    def get(self, key):
        try:
            return self.primary_cache.get(key)
        except Exception:
            if self.fallback_cache:
                try:
                    return self.fallback_cache.get(key)
                except Exception:
                    pass
            return None
    
    def set(self, key, value, ttl=3600):
        try:
            self.primary_cache.set(key, value, ttl)
        except Exception:
            if self.fallback_cache:
                try:
                    self.fallback_cache.set(key, value, ttl)
                except Exception:
                    pass
```

## Common Pitfalls

### 1. Cache Stampede
**Problem:** Multiple requests fetch the same data simultaneously

**Solution:** Use cache locking
```python
import threading

class StampedeProtectedCache:
    def __init__(self, cache, data_source):
        self.cache = cache
        self.data_source = data_source
        self.locks = {}
        self.locks_lock = threading.Lock()
    
    def get(self, key):
        # Try cache first
        value = self.cache.get(key)
        if value is not None:
            return value
        
        # Get or create lock for this key
        with self.locks_lock:
            if key not in self.locks:
                self.locks[key] = threading.Lock()
            lock = self.locks[key]
        
        # Only one thread fetches data for this key
        with lock:
            # Double-check cache
            value = self.cache.get(key)
            if value is not None:
                return value
            
            # Fetch and cache
            value = self.data_source.get(key)
            self.cache.set(key, value)
            return value
```

### 2. Hot Key Problem
**Problem:** Single cache key receives too much traffic

**Solution:** Key sharding
```python
import random

class ShardedCache:
    def __init__(self, cache, shard_count=10):
        self.cache = cache
        self.shard_count = shard_count
    
    def get(self, key):
        # Try all shards
        for i in range(self.shard_count):
            shard_key = f"{key}:shard:{i}"
            value = self.cache.get(shard_key)
            if value is not None:
                return value
        return None
    
    def set(self, key, value, ttl=3600):
        # Randomly select a shard
        shard_id = random.randint(0, self.shard_count - 1)
        shard_key = f"{key}:shard:{shard_id}"
        self.cache.set(shard_key, value, ttl)
```

## Next Steps

In the next chapter, we'll explore database design and scaling strategies, which complement caching by optimizing data storage and retrieval at the persistence layer.