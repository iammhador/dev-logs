# Performance Optimization

## Overview

Performance optimization is crucial for building scalable systems that can handle increasing load while maintaining responsiveness. This chapter covers systematic approaches to identifying bottlenecks, optimizing code, and tuning system components.

## Performance Fundamentals

### Key Metrics

**Latency Metrics:**
- Response Time: Time to complete a single request
- Percentiles: P50, P95, P99 response times
- Time to First Byte (TTFB)
- Round Trip Time (RTT)

**Throughput Metrics:**
- Requests Per Second (RPS)
- Transactions Per Second (TPS)
- Bandwidth utilization
- Queue processing rate

**Resource Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network I/O
- Connection pool usage

### Performance Monitoring

```python
import time
import psutil
import threading
from collections import defaultdict, deque
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class PerformanceMetric:
    timestamp: datetime
    metric_name: str
    value: float
    tags: Dict[str, str] = None

class PerformanceMonitor:
    def __init__(self, window_size: int = 1000):
        self.metrics: Dict[str, deque] = defaultdict(lambda: deque(maxlen=window_size))
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = defaultdict(float)
        self.histograms: Dict[str, List[float]] = defaultdict(list)
        self._lock = threading.Lock()
    
    def record_timing(self, metric_name: str, duration: float, tags: Dict[str, str] = None):
        """Record timing metric"""
        with self._lock:
            metric = PerformanceMetric(
                timestamp=datetime.utcnow(),
                metric_name=metric_name,
                value=duration,
                tags=tags or {}
            )
            self.metrics[metric_name].append(metric)
            self.histograms[metric_name].append(duration)
    
    def increment_counter(self, metric_name: str, value: int = 1):
        """Increment counter metric"""
        with self._lock:
            self.counters[metric_name] += value
    
    def set_gauge(self, metric_name: str, value: float):
        """Set gauge metric"""
        with self._lock:
            self.gauges[metric_name] = value
    
    def get_percentile(self, metric_name: str, percentile: float) -> Optional[float]:
        """Calculate percentile for timing metrics"""
        if metric_name not in self.histograms or not self.histograms[metric_name]:
            return None
        
        values = sorted(self.histograms[metric_name])
        index = int(len(values) * percentile / 100)
        return values[min(index, len(values) - 1)]
    
    def get_average(self, metric_name: str) -> Optional[float]:
        """Calculate average for timing metrics"""
        if metric_name not in self.histograms or not self.histograms[metric_name]:
            return None
        
        return sum(self.histograms[metric_name]) / len(self.histograms[metric_name])
    
    def get_rate(self, metric_name: str, window_seconds: int = 60) -> float:
        """Calculate rate per second for counter metrics"""
        if metric_name not in self.metrics:
            return 0.0
        
        cutoff_time = datetime.utcnow() - timedelta(seconds=window_seconds)
        recent_metrics = [
            m for m in self.metrics[metric_name] 
            if m.timestamp >= cutoff_time
        ]
        
        return len(recent_metrics) / window_seconds if recent_metrics else 0.0
    
    def get_system_metrics(self) -> Dict[str, float]:
        """Get current system metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_io_read_mb': psutil.disk_io_counters().read_bytes / 1024 / 1024,
            'disk_io_write_mb': psutil.disk_io_counters().write_bytes / 1024 / 1024,
            'network_sent_mb': psutil.net_io_counters().bytes_sent / 1024 / 1024,
            'network_recv_mb': psutil.net_io_counters().bytes_recv / 1024 / 1024,
        }
    
    def generate_report(self) -> Dict:
        """Generate performance report"""
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'system_metrics': self.get_system_metrics(),
            'timing_metrics': {},
            'counters': dict(self.counters),
            'gauges': dict(self.gauges)
        }
        
        for metric_name in self.histograms:
            if self.histograms[metric_name]:
                report['timing_metrics'][metric_name] = {
                    'count': len(self.histograms[metric_name]),
                    'average': self.get_average(metric_name),
                    'p50': self.get_percentile(metric_name, 50),
                    'p95': self.get_percentile(metric_name, 95),
                    'p99': self.get_percentile(metric_name, 99),
                    'rate_per_second': self.get_rate(metric_name)
                }
        
        return report

# Global monitor instance
monitor = PerformanceMonitor()

# Decorator for timing functions
def time_it(metric_name: str = None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            name = metric_name or f"{func.__module__}.{func.__name__}"
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                monitor.increment_counter(f"{name}.success")
                return result
            except Exception as e:
                monitor.increment_counter(f"{name}.error")
                raise
            finally:
                duration = (time.time() - start_time) * 1000  # Convert to ms
                monitor.record_timing(name, duration)
        return wrapper
    return decorator

# Context manager for timing code blocks
class Timer:
    def __init__(self, metric_name: str):
        self.metric_name = metric_name
        self.start_time = None
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (time.time() - self.start_time) * 1000
        monitor.record_timing(self.metric_name, duration)
        
        if exc_type is not None:
            monitor.increment_counter(f"{self.metric_name}.error")
        else:
            monitor.increment_counter(f"{self.metric_name}.success")

# Usage examples
@time_it("user_service.create_user")
def create_user(username, email, password):
    # User creation logic
    time.sleep(0.1)  # Simulate work
    return {"id": "user123", "username": username}

def process_batch():
    with Timer("batch_processing"):
        # Batch processing logic
        time.sleep(0.5)
        monitor.set_gauge("batch_size", 100)
```

## Profiling and Bottleneck Identification

### CPU Profiling

```python
import cProfile
import pstats
import io
from functools import wraps
from typing import Callable, Any

class CPUProfiler:
    def __init__(self):
        self.profiler = cProfile.Profile()
        self.is_profiling = False
    
    def start(self):
        """Start CPU profiling"""
        if not self.is_profiling:
            self.profiler.enable()
            self.is_profiling = True
    
    def stop(self):
        """Stop CPU profiling"""
        if self.is_profiling:
            self.profiler.disable()
            self.is_profiling = False
    
    def get_stats(self, sort_by: str = 'cumulative', limit: int = 20) -> str:
        """Get profiling statistics"""
        s = io.StringIO()
        ps = pstats.Stats(self.profiler, stream=s)
        ps.sort_stats(sort_by)
        ps.print_stats(limit)
        return s.getvalue()
    
    def profile_function(self, func: Callable) -> Callable:
        """Decorator to profile a specific function"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            self.start()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                self.stop()
        return wrapper

# Memory profiling
import tracemalloc
from typing import List, Tuple

class MemoryProfiler:
    def __init__(self):
        self.snapshots: List[tracemalloc.Snapshot] = []
        self.is_tracing = False
    
    def start(self):
        """Start memory tracing"""
        if not self.is_tracing:
            tracemalloc.start()
            self.is_tracing = True
    
    def take_snapshot(self) -> tracemalloc.Snapshot:
        """Take a memory snapshot"""
        if not self.is_tracing:
            raise RuntimeError("Memory tracing not started")
        
        snapshot = tracemalloc.take_snapshot()
        self.snapshots.append(snapshot)
        return snapshot
    
    def stop(self):
        """Stop memory tracing"""
        if self.is_tracing:
            tracemalloc.stop()
            self.is_tracing = False
    
    def get_top_allocations(self, snapshot: tracemalloc.Snapshot = None, limit: int = 10) -> List[str]:
        """Get top memory allocations"""
        if snapshot is None and self.snapshots:
            snapshot = self.snapshots[-1]
        elif snapshot is None:
            raise ValueError("No snapshots available")
        
        top_stats = snapshot.statistics('lineno')
        results = []
        
        for index, stat in enumerate(top_stats[:limit], 1):
            results.append(
                f"{index}. {stat.traceback.format()[-1]} - "
                f"{stat.size / 1024 / 1024:.2f} MB ({stat.count} blocks)"
            )
        
        return results
    
    def compare_snapshots(self, snapshot1: tracemalloc.Snapshot, 
                         snapshot2: tracemalloc.Snapshot, limit: int = 10) -> List[str]:
        """Compare two memory snapshots"""
        top_stats = snapshot2.compare_to(snapshot1, 'lineno')
        results = []
        
        for index, stat in enumerate(top_stats[:limit], 1):
            size_diff = stat.size_diff / 1024 / 1024
            results.append(
                f"{index}. {stat.traceback.format()[-1]} - "
                f"{size_diff:+.2f} MB ({stat.size / 1024 / 1024:.2f} MB total)"
            )
        
        return results

# Line-by-line profiling
import line_profiler

def profile_lines(func):
    """Decorator for line-by-line profiling"""
    profiler = line_profiler.LineProfiler()
    profiler.add_function(func)
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        profiler.enable_by_count()
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            profiler.disable_by_count()
            profiler.print_stats()
    
    return wrapper

# Usage example
cpu_profiler = CPUProfiler()
memory_profiler = MemoryProfiler()

@cpu_profiler.profile_function
@profile_lines
def expensive_function():
    # Simulate expensive computation
    data = []
    for i in range(100000):
        data.append(i ** 2)
    
    # Simulate memory allocation
    large_list = [0] * 1000000
    
    # Simulate CPU-intensive work
    result = sum(x for x in data if x % 2 == 0)
    
    return result

# Profile the function
memory_profiler.start()
snapshot1 = memory_profiler.take_snapshot()

result = expensive_function()

snapshot2 = memory_profiler.take_snapshot()
memory_profiler.stop()

# Analyze results
print("CPU Profiling Results:")
print(cpu_profiler.get_stats())

print("\nMemory Profiling Results:")
print("\n".join(memory_profiler.compare_snapshots(snapshot1, snapshot2)))
```

### Database Query Optimization

```python
import time
import logging
from typing import Dict, List, Any
from contextlib import contextmanager

class QueryOptimizer:
    def __init__(self, db_connection):
        self.db = db_connection
        self.slow_query_threshold = 1.0  # 1 second
        self.query_cache = {}
        self.query_stats = {}
    
    @contextmanager
    def query_timer(self, query: str):
        """Context manager to time database queries"""
        start_time = time.time()
        try:
            yield
        finally:
            duration = time.time() - start_time
            self._record_query_stats(query, duration)
            
            if duration > self.slow_query_threshold:
                logging.warning(f"Slow query detected ({duration:.2f}s): {query[:100]}...")
    
    def _record_query_stats(self, query: str, duration: float):
        """Record query execution statistics"""
        query_key = self._normalize_query(query)
        
        if query_key not in self.query_stats:
            self.query_stats[query_key] = {
                'count': 0,
                'total_time': 0,
                'min_time': float('inf'),
                'max_time': 0,
                'query': query
            }
        
        stats = self.query_stats[query_key]
        stats['count'] += 1
        stats['total_time'] += duration
        stats['min_time'] = min(stats['min_time'], duration)
        stats['max_time'] = max(stats['max_time'], duration)
    
    def _normalize_query(self, query: str) -> str:
        """Normalize query for statistics grouping"""
        # Remove parameter values and normalize whitespace
        import re
        normalized = re.sub(r'\$\d+|\?|\d+', '?', query)
        normalized = ' '.join(normalized.split())
        return normalized.lower()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Execute query with timing and optimization"""
        # Check cache first
        cache_key = (query, params)
        if cache_key in self.query_cache:
            return self.query_cache[cache_key]
        
        with self.query_timer(query):
            cursor = self.db.cursor()
            cursor.execute(query, params or ())
            
            # Fetch results
            columns = [desc[0] for desc in cursor.description]
            results = [
                dict(zip(columns, row))
                for row in cursor.fetchall()
            ]
            
            # Cache results for read-only queries
            if query.strip().lower().startswith('select'):
                self.query_cache[cache_key] = results
            
            return results
    
    def analyze_query_plan(self, query: str) -> Dict:
        """Analyze query execution plan"""
        explain_query = f"EXPLAIN ANALYZE {query}"
        
        with self.query_timer(explain_query):
            cursor = self.db.cursor()
            cursor.execute(explain_query)
            plan = cursor.fetchall()
        
        return {
            'query': query,
            'execution_plan': plan,
            'recommendations': self._generate_recommendations(plan)
        }
    
    def _generate_recommendations(self, plan: List) -> List[str]:
        """Generate optimization recommendations based on execution plan"""
        recommendations = []
        plan_text = ' '.join(str(row) for row in plan).lower()
        
        if 'seq scan' in plan_text:
            recommendations.append("Consider adding an index to avoid sequential scans")
        
        if 'nested loop' in plan_text and 'large' in plan_text:
            recommendations.append("Consider using hash join instead of nested loop for large datasets")
        
        if 'sort' in plan_text and 'disk' in plan_text:
            recommendations.append("Increase work_mem to avoid disk-based sorting")
        
        if 'bitmap heap scan' in plan_text:
            recommendations.append("Consider creating a more selective index")
        
        return recommendations
    
    def get_slow_queries(self, limit: int = 10) -> List[Dict]:
        """Get slowest queries by average execution time"""
        sorted_queries = sorted(
            self.query_stats.values(),
            key=lambda x: x['total_time'] / x['count'],
            reverse=True
        )
        
        return [
            {
                'query': stats['query'][:100] + '...' if len(stats['query']) > 100 else stats['query'],
                'count': stats['count'],
                'avg_time': stats['total_time'] / stats['count'],
                'total_time': stats['total_time'],
                'min_time': stats['min_time'],
                'max_time': stats['max_time']
            }
            for stats in sorted_queries[:limit]
        ]
    
    def suggest_indexes(self) -> List[str]:
        """Suggest indexes based on query patterns"""
        suggestions = []
        
        for stats in self.query_stats.values():
            query = stats['query'].lower()
            
            # Look for WHERE clauses
            if 'where' in query:
                # Extract potential index candidates
                import re
                where_match = re.search(r'where\s+(.+?)(?:order by|group by|limit|$)', query)
                if where_match:
                    where_clause = where_match.group(1)
                    
                    # Look for column references
                    column_matches = re.findall(r'(\w+)\s*[=<>]', where_clause)
                    for column in column_matches:
                        if column not in ['and', 'or', 'not']:
                            suggestions.append(f"CREATE INDEX idx_{column} ON table_name ({column});")
        
        return list(set(suggestions))  # Remove duplicates

# Connection pooling for better performance
import threading
from queue import Queue, Empty

class ConnectionPool:
    def __init__(self, connection_factory, min_size: int = 5, max_size: int = 20):
        self.connection_factory = connection_factory
        self.min_size = min_size
        self.max_size = max_size
        self.pool = Queue(maxsize=max_size)
        self.active_connections = 0
        self.lock = threading.Lock()
        
        # Initialize minimum connections
        for _ in range(min_size):
            self.pool.put(self._create_connection())
            self.active_connections += 1
    
    def _create_connection(self):
        """Create a new database connection"""
        return self.connection_factory()
    
    @contextmanager
    def get_connection(self, timeout: float = 5.0):
        """Get a connection from the pool"""
        connection = None
        try:
            # Try to get existing connection
            try:
                connection = self.pool.get(timeout=timeout)
            except Empty:
                # Create new connection if under max limit
                with self.lock:
                    if self.active_connections < self.max_size:
                        connection = self._create_connection()
                        self.active_connections += 1
                    else:
                        raise Exception("Connection pool exhausted")
            
            yield connection
            
        finally:
            if connection:
                # Return connection to pool
                try:
                    self.pool.put_nowait(connection)
                except:
                    # Pool is full, close connection
                    connection.close()
                    with self.lock:
                        self.active_connections -= 1
    
    def close_all(self):
        """Close all connections in the pool"""
        while not self.pool.empty():
            try:
                connection = self.pool.get_nowait()
                connection.close()
            except Empty:
                break
        
        self.active_connections = 0

# Usage example
def create_db_connection():
    import sqlite3
    return sqlite3.connect(':memory:')

pool = ConnectionPool(create_db_connection, min_size=3, max_size=10)

with pool.get_connection() as conn:
    optimizer = QueryOptimizer(conn)
    
    # Execute queries with optimization
    results = optimizer.execute_query(
        "SELECT * FROM users WHERE age > ? AND city = ?",
        (25, 'New York')
    )
    
    # Analyze slow queries
    slow_queries = optimizer.get_slow_queries()
    for query_info in slow_queries:
        print(f"Slow query: {query_info['query']} (avg: {query_info['avg_time']:.3f}s)")
```

### Caching Optimization

```python
import time
import hashlib
import pickle
from typing import Any, Optional, Callable, Dict
from functools import wraps
from abc import ABC, abstractmethod

class CacheBackend(ABC):
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    def set(self, key: str, value: Any, ttl: int = None) -> None:
        pass
    
    @abstractmethod
    def delete(self, key: str) -> None:
        pass
    
    @abstractmethod
    def clear(self) -> None:
        pass

class MemoryCache(CacheBackend):
    def __init__(self, max_size: int = 1000):
        self.cache: Dict[str, Dict] = {}
        self.max_size = max_size
        self.access_times: Dict[str, float] = {}
    
    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            entry = self.cache[key]
            
            # Check TTL
            if entry['expires_at'] and time.time() > entry['expires_at']:
                self.delete(key)
                return None
            
            # Update access time for LRU
            self.access_times[key] = time.time()
            return entry['value']
        
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> None:
        # Evict if at capacity
        if len(self.cache) >= self.max_size and key not in self.cache:
            self._evict_lru()
        
        expires_at = time.time() + ttl if ttl else None
        
        self.cache[key] = {
            'value': value,
            'expires_at': expires_at,
            'created_at': time.time()
        }
        self.access_times[key] = time.time()
    
    def delete(self, key: str) -> None:
        self.cache.pop(key, None)
        self.access_times.pop(key, None)
    
    def clear(self) -> None:
        self.cache.clear()
        self.access_times.clear()
    
    def _evict_lru(self) -> None:
        """Evict least recently used item"""
        if self.access_times:
            lru_key = min(self.access_times.keys(), key=lambda k: self.access_times[k])
            self.delete(lru_key)

class RedisCache(CacheBackend):
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def get(self, key: str) -> Optional[Any]:
        data = self.redis.get(key)
        if data:
            return pickle.loads(data)
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> None:
        data = pickle.dumps(value)
        if ttl:
            self.redis.setex(key, ttl, data)
        else:
            self.redis.set(key, data)
    
    def delete(self, key: str) -> None:
        self.redis.delete(key)
    
    def clear(self) -> None:
        self.redis.flushdb()

class MultiLevelCache:
    def __init__(self, l1_cache: CacheBackend, l2_cache: CacheBackend):
        self.l1 = l1_cache  # Fast cache (memory)
        self.l2 = l2_cache  # Slower cache (Redis)
        self.stats = {
            'l1_hits': 0,
            'l2_hits': 0,
            'misses': 0
        }
    
    def get(self, key: str) -> Optional[Any]:
        # Try L1 cache first
        value = self.l1.get(key)
        if value is not None:
            self.stats['l1_hits'] += 1
            return value
        
        # Try L2 cache
        value = self.l2.get(key)
        if value is not None:
            self.stats['l2_hits'] += 1
            # Promote to L1
            self.l1.set(key, value)
            return value
        
        self.stats['misses'] += 1
        return None
    
    def set(self, key: str, value: Any, ttl: int = None) -> None:
        # Set in both caches
        self.l1.set(key, value, ttl)
        self.l2.set(key, value, ttl)
    
    def delete(self, key: str) -> None:
        self.l1.delete(key)
        self.l2.delete(key)
    
    def get_hit_ratio(self) -> Dict[str, float]:
        total_requests = sum(self.stats.values())
        if total_requests == 0:
            return {'l1': 0.0, 'l2': 0.0, 'overall': 0.0}
        
        return {
            'l1': self.stats['l1_hits'] / total_requests,
            'l2': self.stats['l2_hits'] / total_requests,
            'overall': (self.stats['l1_hits'] + self.stats['l2_hits']) / total_requests
        }

class SmartCache:
    def __init__(self, backend: CacheBackend):
        self.backend = backend
        self.hit_stats = {}
        self.computation_times = {}
    
    def cached(self, ttl: int = 3600, key_func: Callable = None):
        """Decorator for caching function results"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                if key_func:
                    cache_key = key_func(*args, **kwargs)
                else:
                    cache_key = self._generate_key(func.__name__, args, kwargs)
                
                # Try to get from cache
                cached_result = self.backend.get(cache_key)
                if cached_result is not None:
                    self._record_hit(cache_key)
                    return cached_result
                
                # Compute result
                start_time = time.time()
                result = func(*args, **kwargs)
                computation_time = time.time() - start_time
                
                # Cache result with adaptive TTL
                adaptive_ttl = self._calculate_adaptive_ttl(cache_key, computation_time, ttl)
                self.backend.set(cache_key, result, adaptive_ttl)
                
                self._record_miss(cache_key, computation_time)
                return result
            
            return wrapper
        return decorator
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate cache key from function name and arguments"""
        key_data = f"{func_name}:{args}:{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _calculate_adaptive_ttl(self, cache_key: str, computation_time: float, base_ttl: int) -> int:
        """Calculate adaptive TTL based on computation cost and hit rate"""
        # Store computation time
        self.computation_times[cache_key] = computation_time
        
        # Get hit rate for this key
        hit_rate = self._get_hit_rate(cache_key)
        
        # Adjust TTL based on computation cost and hit rate
        if computation_time > 1.0:  # Expensive computation
            ttl_multiplier = 2.0
        elif computation_time > 0.1:
            ttl_multiplier = 1.5
        else:
            ttl_multiplier = 1.0
        
        # Increase TTL for frequently accessed items
        if hit_rate > 0.8:
            ttl_multiplier *= 1.5
        elif hit_rate > 0.5:
            ttl_multiplier *= 1.2
        
        return int(base_ttl * ttl_multiplier)
    
    def _record_hit(self, cache_key: str):
        if cache_key not in self.hit_stats:
            self.hit_stats[cache_key] = {'hits': 0, 'misses': 0}
        self.hit_stats[cache_key]['hits'] += 1
    
    def _record_miss(self, cache_key: str, computation_time: float):
        if cache_key not in self.hit_stats:
            self.hit_stats[cache_key] = {'hits': 0, 'misses': 0}
        self.hit_stats[cache_key]['misses'] += 1
    
    def _get_hit_rate(self, cache_key: str) -> float:
        if cache_key not in self.hit_stats:
            return 0.0
        
        stats = self.hit_stats[cache_key]
        total = stats['hits'] + stats['misses']
        return stats['hits'] / total if total > 0 else 0.0
    
    def get_cache_stats(self) -> Dict:
        """Get comprehensive cache statistics"""
        total_hits = sum(stats['hits'] for stats in self.hit_stats.values())
        total_misses = sum(stats['misses'] for stats in self.hit_stats.values())
        total_requests = total_hits + total_misses
        
        return {
            'total_requests': total_requests,
            'total_hits': total_hits,
            'total_misses': total_misses,
            'hit_rate': total_hits / total_requests if total_requests > 0 else 0.0,
            'average_computation_time': sum(self.computation_times.values()) / len(self.computation_times) if self.computation_times else 0.0,
            'top_cached_functions': sorted(
                [
                    {
                        'key': key,
                        'hits': stats['hits'],
                        'misses': stats['misses'],
                        'hit_rate': stats['hits'] / (stats['hits'] + stats['misses']),
                        'computation_time': self.computation_times.get(key, 0)
                    }
                    for key, stats in self.hit_stats.items()
                ],
                key=lambda x: x['hits'],
                reverse=True
            )[:10]
        }

# Usage example
memory_cache = MemoryCache(max_size=500)
redis_cache = RedisCache(redis_client)  # Assume redis_client is configured
multi_cache = MultiLevelCache(memory_cache, redis_cache)
smart_cache = SmartCache(multi_cache)

@smart_cache.cached(ttl=1800)  # 30 minutes
def expensive_computation(n: int) -> int:
    """Simulate expensive computation"""
    time.sleep(0.1)  # Simulate work
    return sum(i ** 2 for i in range(n))

@smart_cache.cached(ttl=300, key_func=lambda user_id: f"user_profile:{user_id}")  # 5 minutes
def get_user_profile(user_id: str) -> Dict:
    """Simulate database query"""
    time.sleep(0.05)  # Simulate DB query
    return {
        'id': user_id,
        'name': f'User {user_id}',
        'email': f'user{user_id}@example.com'
    }

# Test caching performance
for i in range(100):
    result = expensive_computation(1000)
    profile = get_user_profile(f"user_{i % 10}")  # Only 10 unique users

# Print cache statistics
stats = smart_cache.get_cache_stats()
print(f"Cache hit rate: {stats['hit_rate']:.2%}")
print(f"Average computation time: {stats['average_computation_time']:.3f}s")
```

## Application-Level Optimization

### Asynchronous Programming

```python
import asyncio
import aiohttp
import time
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

class AsyncOptimizer:
    def __init__(self, max_concurrent: int = 10):
        self.max_concurrent = max_concurrent
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_url(self, url: str) -> Dict[str, Any]:
        """Fetch URL with concurrency control"""
        async with self.semaphore:
            start_time = time.time()
            try:
                async with self.session.get(url) as response:
                    content = await response.text()
                    return {
                        'url': url,
                        'status': response.status,
                        'content_length': len(content),
                        'response_time': time.time() - start_time
                    }
            except Exception as e:
                return {
                    'url': url,
                    'error': str(e),
                    'response_time': time.time() - start_time
                }
    
    async def fetch_multiple_urls(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Fetch multiple URLs concurrently"""
        tasks = [self.fetch_url(url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def process_batch(self, items: List[Any], processor_func, batch_size: int = 100) -> List[Any]:
        """Process items in batches asynchronously"""
        results = []
        
        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            batch_tasks = [processor_func(item) for item in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
            results.extend(batch_results)
        
        return results

# CPU-bound task optimization
class CPUOptimizer:
    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or min(32, (os.cpu_count() or 1) + 4)
        self.executor = ThreadPoolExecutor(max_workers=self.max_workers)
    
    def process_parallel(self, func, items: List[Any], chunk_size: int = None) -> List[Any]:
        """Process items in parallel using thread pool"""
        if chunk_size is None:
            chunk_size = max(1, len(items) // self.max_workers)
        
        # Split items into chunks
        chunks = [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]
        
        # Submit tasks
        futures = [self.executor.submit(self._process_chunk, func, chunk) for chunk in chunks]
        
        # Collect results
        results = []
        for future in as_completed(futures):
            try:
                chunk_results = future.result()
                results.extend(chunk_results)
            except Exception as e:
                print(f"Chunk processing failed: {e}")
        
        return results
    
    def _process_chunk(self, func, chunk: List[Any]) -> List[Any]:
        """Process a chunk of items"""
        return [func(item) for item in chunk]
    
    def close(self):
        """Close the thread pool"""
        self.executor.shutdown(wait=True)

# Example usage
async def optimize_data_processing():
    # Async I/O optimization
    urls = [
        'https://api.example.com/users',
        'https://api.example.com/posts',
        'https://api.example.com/comments'
    ]
    
    async with AsyncOptimizer(max_concurrent=5) as optimizer:
        results = await optimizer.fetch_multiple_urls(urls)
        
        for result in results:
            if 'error' not in result:
                print(f"Fetched {result['url']} in {result['response_time']:.3f}s")
    
    # CPU-bound optimization
    def expensive_calculation(n: int) -> int:
        return sum(i ** 2 for i in range(n))
    
    cpu_optimizer = CPUOptimizer()
    numbers = list(range(1000, 2000))
    
    start_time = time.time()
    results = cpu_optimizer.process_parallel(expensive_calculation, numbers)
    end_time = time.time()
    
    print(f"Processed {len(numbers)} items in {end_time - start_time:.3f}s")
    cpu_optimizer.close()

# asyncio.run(optimize_data_processing())
```

## System-Level Optimization

### Resource Management

```python
import os
import psutil
import resource
from typing import Dict, List
from dataclasses import dataclass

@dataclass
class ResourceLimits:
    max_memory_mb: int = 1024
    max_cpu_percent: float = 80.0
    max_open_files: int = 1024
    max_threads: int = 100

class ResourceManager:
    def __init__(self, limits: ResourceLimits):
        self.limits = limits
        self.initial_limits = self._get_current_limits()
    
    def _get_current_limits(self) -> Dict:
        """Get current system resource limits"""
        return {
            'memory': resource.getrlimit(resource.RLIMIT_AS),
            'files': resource.getrlimit(resource.RLIMIT_NOFILE),
            'processes': resource.getrlimit(resource.RLIMIT_NPROC)
        }
    
    def apply_limits(self):
        """Apply resource limits to current process"""
        try:
            # Set memory limit
            memory_limit = self.limits.max_memory_mb * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (memory_limit, memory_limit))
            
            # Set file descriptor limit
            resource.setrlimit(resource.RLIMIT_NOFILE, 
                              (self.limits.max_open_files, self.limits.max_open_files))
            
            print(f"Applied resource limits: {self.limits}")
        except Exception as e:
            print(f"Failed to apply resource limits: {e}")
    
    def monitor_resources(self) -> Dict:
        """Monitor current resource usage"""
        process = psutil.Process()
        
        return {
            'cpu_percent': process.cpu_percent(),
            'memory_mb': process.memory_info().rss / 1024 / 1024,
            'memory_percent': process.memory_percent(),
            'open_files': len(process.open_files()),
            'threads': process.num_threads(),
            'connections': len(process.connections())
        }
    
    def check_limits(self) -> Dict[str, bool]:
        """Check if current usage exceeds limits"""
        usage = self.monitor_resources()
        
        return {
            'memory_ok': usage['memory_mb'] <= self.limits.max_memory_mb,
            'cpu_ok': usage['cpu_percent'] <= self.limits.max_cpu_percent,
            'files_ok': usage['open_files'] <= self.limits.max_open_files,
            'threads_ok': usage['threads'] <= self.limits.max_threads
        }
    
    def optimize_gc(self):
        """Optimize garbage collection settings"""
        import gc
        
        # Tune garbage collection thresholds
        gc.set_threshold(700, 10, 10)  # More aggressive collection
        
        # Force garbage collection
        collected = gc.collect()
        print(f"Garbage collection freed {collected} objects")
        
        return collected

# Usage example
limits = ResourceLimits(
    max_memory_mb=2048,
    max_cpu_percent=75.0,
    max_open_files=2048,
    max_threads=50
)

resource_manager = ResourceManager(limits)
resource_manager.apply_limits()

# Monitor resources periodically
usage = resource_manager.monitor_resources()
print(f"Current usage: {usage}")

limit_check = resource_manager.check_limits()
if not all(limit_check.values()):
    print("Resource limits exceeded!")
    resource_manager.optimize_gc()
```

## Performance Testing and Benchmarking

```python
import time
import statistics
from typing import Callable, List, Dict, Any
from functools import wraps

class PerformanceBenchmark:
    def __init__(self):
        self.results: Dict[str, List[float]] = {}
    
    def benchmark(self, name: str, iterations: int = 100):
        """Decorator to benchmark function performance"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                times = []
                
                for _ in range(iterations):
                    start_time = time.perf_counter()
                    result = func(*args, **kwargs)
                    end_time = time.perf_counter()
                    times.append((end_time - start_time) * 1000)  # Convert to ms
                
                self.results[name] = times
                return result
            
            return wrapper
        return decorator
    
    def compare_functions(self, functions: Dict[str, Callable], 
                         test_args: tuple = (), test_kwargs: Dict = None, 
                         iterations: int = 100) -> Dict[str, Dict]:
        """Compare performance of multiple functions"""
        test_kwargs = test_kwargs or {}
        comparison_results = {}
        
        for name, func in functions.items():
            times = []
            
            for _ in range(iterations):
                start_time = time.perf_counter()
                func(*test_args, **test_kwargs)
                end_time = time.perf_counter()
                times.append((end_time - start_time) * 1000)
            
            comparison_results[name] = {
                'mean': statistics.mean(times),
                'median': statistics.median(times),
                'stdev': statistics.stdev(times) if len(times) > 1 else 0,
                'min': min(times),
                'max': max(times),
                'p95': self._percentile(times, 95),
                'p99': self._percentile(times, 99)
            }
        
        return comparison_results
    
    def _percentile(self, data: List[float], percentile: float) -> float:
        """Calculate percentile"""
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]
    
    def generate_report(self) -> str:
        """Generate performance report"""
        report = "Performance Benchmark Report\n"
        report += "=" * 40 + "\n\n"
        
        for name, times in self.results.items():
            if times:
                mean_time = statistics.mean(times)
                median_time = statistics.median(times)
                stdev_time = statistics.stdev(times) if len(times) > 1 else 0
                
                report += f"Function: {name}\n"
                report += f"  Iterations: {len(times)}\n"
                report += f"  Mean: {mean_time:.3f}ms\n"
                report += f"  Median: {median_time:.3f}ms\n"
                report += f"  Std Dev: {stdev_time:.3f}ms\n"
                report += f"  Min: {min(times):.3f}ms\n"
                report += f"  Max: {max(times):.3f}ms\n"
                report += f"  P95: {self._percentile(times, 95):.3f}ms\n"
                report += f"  P99: {self._percentile(times, 99):.3f}ms\n\n"
        
        return report

# Example usage
benchmark = PerformanceBenchmark()

# Different sorting algorithms for comparison
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

def python_sort(arr):
    return sorted(arr)

# Compare sorting algorithms
test_data = list(range(100, 0, -1))  # Reverse sorted list

sort_functions = {
    'bubble_sort': lambda: bubble_sort(test_data.copy()),
    'quick_sort': lambda: quick_sort(test_data.copy()),
    'python_sort': lambda: python_sort(test_data.copy())
}

comparison = benchmark.compare_functions(sort_functions, iterations=50)

print("Sorting Algorithm Comparison:")
for name, stats in comparison.items():
    print(f"{name}: {stats['mean']:.3f}ms (±{stats['stdev']:.3f}ms)")

# Find the fastest algorithm
fastest = min(comparison.items(), key=lambda x: x[1]['mean'])
print(f"\nFastest algorithm: {fastest[0]} ({fastest[1]['mean']:.3f}ms)")
```

## Best Practices

### Performance Optimization Checklist

**1. Measurement First:**
- Profile before optimizing
- Establish baseline metrics
- Use real-world data and scenarios
- Monitor continuously

**2. Database Optimization:**
- Add appropriate indexes
- Optimize query patterns
- Use connection pooling
- Implement query caching
- Consider read replicas

**3. Application Optimization:**
- Use async programming for I/O
- Implement efficient caching
- Optimize data structures
- Minimize object creation
- Use lazy loading

**4. System Optimization:**
- Tune garbage collection
- Optimize resource limits
- Use appropriate concurrency models
- Monitor system resources

**5. Network Optimization:**
- Minimize round trips
- Use compression
- Implement CDN
- Optimize payload sizes
- Use HTTP/2 or HTTP/3

---

**Next Topic**: [Deployment Strategies](deployment_strategies.md)
**Previous Topic**: [Testing Strategies](testing_strategies.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)