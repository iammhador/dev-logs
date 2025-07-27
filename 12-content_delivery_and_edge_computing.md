# Chapter 12: Content Delivery & Edge Computing

## Overview

Content Delivery Networks (CDNs) and edge computing bring content and computation closer to users, reducing latency and improving user experience. This chapter covers CDN architecture, edge computing patterns, and global distribution strategies.

## Content Delivery Networks (CDN)

### CDN Architecture

**CDN Implementation Example (Python)**
```python
import hashlib
import time
import asyncio
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import aiohttp
import json

class CacheStatus(Enum):
    HIT = "hit"
    MISS = "miss"
    STALE = "stale"
    EXPIRED = "expired"

@dataclass
class CacheEntry:
    content: bytes
    content_type: str
    etag: str
    last_modified: float
    expires_at: float
    cache_control: str
    size_bytes: int

@dataclass
class EdgeLocation:
    id: str
    region: str
    country: str
    city: str
    latitude: float
    longitude: float
    capacity_gbps: float
    current_load: float

@dataclass
class CDNRequest:
    url: str
    method: str
    headers: Dict[str, str]
    client_ip: str
    user_agent: str
    timestamp: float

@dataclass
class CDNResponse:
    status_code: int
    headers: Dict[str, str]
    content: bytes
    cache_status: CacheStatus
    edge_location: str
    response_time_ms: float

class EdgeCache:
    def __init__(self, max_size_gb: float = 100.0):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size_bytes = int(max_size_gb * 1024 * 1024 * 1024)
        self.current_size_bytes = 0
        self.access_times: Dict[str, float] = {}
    
    def _generate_cache_key(self, url: str, headers: Dict[str, str]) -> str:
        """Generate cache key from URL and relevant headers"""
        # Include headers that affect caching
        cache_headers = {
            'accept-encoding': headers.get('accept-encoding', ''),
            'accept-language': headers.get('accept-language', ''),
            'user-agent': headers.get('user-agent', '')
        }
        
        key_data = f"{url}:{json.dumps(cache_headers, sort_keys=True)}"
        return hashlib.sha256(key_data.encode()).hexdigest()
    
    def get(self, url: str, headers: Dict[str, str]) -> Tuple[Optional[CacheEntry], CacheStatus]:
        """Get content from cache"""
        cache_key = self._generate_cache_key(url, headers)
        current_time = time.time()
        
        if cache_key not in self.cache:
            return None, CacheStatus.MISS
        
        entry = self.cache[cache_key]
        
        # Check if content has expired
        if current_time > entry.expires_at:
            self._evict(cache_key)
            return None, CacheStatus.EXPIRED
        
        # Update access time for LRU
        self.access_times[cache_key] = current_time
        
        # Check if content is stale but still usable
        if 'max-age' in entry.cache_control:
            max_age = int(entry.cache_control.split('max-age=')[1].split(',')[0])
            if current_time - entry.last_modified > max_age:
                return entry, CacheStatus.STALE
        
        return entry, CacheStatus.HIT
    
    def put(self, url: str, headers: Dict[str, str], entry: CacheEntry) -> bool:
        """Store content in cache"""
        cache_key = self._generate_cache_key(url, headers)
        
        # Check if we need to make space
        if self.current_size_bytes + entry.size_bytes > self.max_size_bytes:
            if not self._make_space(entry.size_bytes):
                return False  # Cannot make enough space
        
        # Remove old entry if exists
        if cache_key in self.cache:
            self._evict(cache_key)
        
        # Add new entry
        self.cache[cache_key] = entry
        self.current_size_bytes += entry.size_bytes
        self.access_times[cache_key] = time.time()
        
        return True
    
    def _make_space(self, required_bytes: int) -> bool:
        """Make space using LRU eviction"""
        # Sort by access time (LRU first)
        sorted_keys = sorted(self.access_times.keys(), 
                           key=lambda k: self.access_times[k])
        
        freed_bytes = 0
        for cache_key in sorted_keys:
            if freed_bytes >= required_bytes:
                break
            
            entry = self.cache[cache_key]
            freed_bytes += entry.size_bytes
            self._evict(cache_key)
        
        return freed_bytes >= required_bytes
    
    def _evict(self, cache_key: str):
        """Remove entry from cache"""
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            self.current_size_bytes -= entry.size_bytes
            del self.cache[cache_key]
            del self.access_times[cache_key]
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        return {
            'total_entries': len(self.cache),
            'size_bytes': self.current_size_bytes,
            'size_gb': self.current_size_bytes / (1024 * 1024 * 1024),
            'utilization_percent': (self.current_size_bytes / self.max_size_bytes) * 100
        }

class CDNEdgeServer:
    def __init__(self, edge_location: EdgeLocation, origin_servers: List[str]):
        self.edge_location = edge_location
        self.origin_servers = origin_servers
        self.cache = EdgeCache()
        self.request_count = 0
        self.cache_hit_count = 0
        self.bandwidth_usage_mbps = 0.0
    
    async def handle_request(self, request: CDNRequest) -> CDNResponse:
        """Handle incoming request"""
        start_time = time.time()
        self.request_count += 1
        
        # Check cache first
        cache_entry, cache_status = self.cache.get(request.url, request.headers)
        
        if cache_status == CacheStatus.HIT:
            self.cache_hit_count += 1
            response_time = (time.time() - start_time) * 1000
            
            return CDNResponse(
                status_code=200,
                headers={
                    'content-type': cache_entry.content_type,
                    'etag': cache_entry.etag,
                    'cache-control': cache_entry.cache_control,
                    'x-cache': 'HIT',
                    'x-edge-location': self.edge_location.id
                },
                content=cache_entry.content,
                cache_status=cache_status,
                edge_location=self.edge_location.id,
                response_time_ms=response_time
            )
        
        # Cache miss - fetch from origin
        try:
            origin_response = await self._fetch_from_origin(request)
            
            # Cache the response if cacheable
            if self._is_cacheable(origin_response):
                cache_entry = self._create_cache_entry(origin_response)
                self.cache.put(request.url, request.headers, cache_entry)
            
            response_time = (time.time() - start_time) * 1000
            
            return CDNResponse(
                status_code=origin_response['status'],
                headers={
                    **origin_response['headers'],
                    'x-cache': 'MISS',
                    'x-edge-location': self.edge_location.id
                },
                content=origin_response['content'],
                cache_status=CacheStatus.MISS,
                edge_location=self.edge_location.id,
                response_time_ms=response_time
            )
        
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            
            return CDNResponse(
                status_code=502,
                headers={'x-edge-location': self.edge_location.id},
                content=b'Bad Gateway',
                cache_status=CacheStatus.MISS,
                edge_location=self.edge_location.id,
                response_time_ms=response_time
            )
    
    async def _fetch_from_origin(self, request: CDNRequest) -> Dict:
        """Fetch content from origin server"""
        # Try origin servers in order
        for origin_server in self.origin_servers:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.request(
                        method=request.method,
                        url=f"{origin_server}{request.url}",
                        headers=request.headers,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        content = await response.read()
                        
                        return {
                            'status': response.status,
                            'headers': dict(response.headers),
                            'content': content
                        }
            
            except Exception as e:
                print(f"Failed to fetch from {origin_server}: {e}")
                continue
        
        raise Exception("All origin servers failed")
    
    def _is_cacheable(self, response: Dict) -> bool:
        """Determine if response is cacheable"""
        # Don't cache error responses
        if response['status'] >= 400:
            return False
        
        # Check cache-control headers
        cache_control = response['headers'].get('cache-control', '')
        if 'no-cache' in cache_control or 'no-store' in cache_control:
            return False
        
        # Check for explicit caching headers
        if 'expires' in response['headers'] or 'max-age' in cache_control:
            return True
        
        # Default caching for static content
        content_type = response['headers'].get('content-type', '')
        static_types = ['image/', 'text/css', 'application/javascript', 'font/']
        
        return any(content_type.startswith(t) for t in static_types)
    
    def _create_cache_entry(self, response: Dict) -> CacheEntry:
        """Create cache entry from origin response"""
        content = response['content']
        headers = response['headers']
        current_time = time.time()
        
        # Calculate expiration time
        expires_at = current_time + 3600  # Default 1 hour
        
        cache_control = headers.get('cache-control', '')
        if 'max-age' in cache_control:
            max_age = int(cache_control.split('max-age=')[1].split(',')[0])
            expires_at = current_time + max_age
        elif 'expires' in headers:
            # Parse expires header (simplified)
            expires_at = current_time + 3600
        
        # Generate ETag if not present
        etag = headers.get('etag', hashlib.md5(content).hexdigest())
        
        return CacheEntry(
            content=content,
            content_type=headers.get('content-type', 'application/octet-stream'),
            etag=etag,
            last_modified=current_time,
            expires_at=expires_at,
            cache_control=cache_control,
            size_bytes=len(content)
        )
    
    def get_performance_stats(self) -> Dict:
        """Get edge server performance statistics"""
        cache_hit_rate = (self.cache_hit_count / self.request_count * 100) if self.request_count > 0 else 0
        
        return {
            'edge_location': self.edge_location.id,
            'region': self.edge_location.region,
            'total_requests': self.request_count,
            'cache_hit_rate_percent': cache_hit_rate,
            'bandwidth_usage_mbps': self.bandwidth_usage_mbps,
            'load_percent': self.edge_location.current_load,
            'cache_stats': self.cache.get_stats()
        }
```

## Edge Computing

### Edge Function Implementation

**Serverless Edge Functions (Python)**
```python
import json
import time
import asyncio
from typing import Dict, Any, Callable, List
from dataclasses import dataclass
from enum import Enum

class EdgeFunctionType(Enum):
    REQUEST_MODIFIER = "request_modifier"
    RESPONSE_MODIFIER = "response_modifier"
    AUTHENTICATION = "authentication"
    RATE_LIMITING = "rate_limiting"
    A_B_TESTING = "a_b_testing"
    PERSONALIZATION = "personalization"

@dataclass
class EdgeFunctionConfig:
    name: str
    function_type: EdgeFunctionType
    enabled: bool
    priority: int
    timeout_ms: int
    memory_limit_mb: int
    environment_variables: Dict[str, str]

@dataclass
class EdgeRequest:
    method: str
    url: str
    headers: Dict[str, str]
    body: bytes
    client_ip: str
    user_agent: str
    geo_location: Dict[str, str]
    timestamp: float

@dataclass
class EdgeResponse:
    status_code: int
    headers: Dict[str, str]
    body: bytes
    modified: bool = False

class EdgeFunctionRuntime:
    def __init__(self):
        self.functions: Dict[str, Callable] = {}
        self.configs: Dict[str, EdgeFunctionConfig] = {}
        self.execution_stats: Dict[str, Dict] = {}
    
    def register_function(self, config: EdgeFunctionConfig, function: Callable):
        """Register an edge function"""
        self.functions[config.name] = function
        self.configs[config.name] = config
        self.execution_stats[config.name] = {
            'total_executions': 0,
            'total_duration_ms': 0,
            'errors': 0,
            'timeouts': 0
        }
    
    async def execute_request_functions(self, request: EdgeRequest) -> EdgeRequest:
        """Execute request modifier functions"""
        modified_request = request
        
        # Get request modifier functions sorted by priority
        request_functions = [
            (name, func) for name, func in self.functions.items()
            if (self.configs[name].function_type == EdgeFunctionType.REQUEST_MODIFIER and
                self.configs[name].enabled)
        ]
        
        request_functions.sort(key=lambda x: self.configs[x[0]].priority)
        
        for func_name, func in request_functions:
            try:
                start_time = time.time()
                
                # Execute function with timeout
                modified_request = await asyncio.wait_for(
                    func(modified_request),
                    timeout=self.configs[func_name].timeout_ms / 1000
                )
                
                # Update stats
                duration_ms = (time.time() - start_time) * 1000
                self._update_stats(func_name, duration_ms, success=True)
                
            except asyncio.TimeoutError:
                self._update_stats(func_name, 0, timeout=True)
                print(f"Edge function {func_name} timed out")
            except Exception as e:
                self._update_stats(func_name, 0, error=True)
                print(f"Edge function {func_name} failed: {e}")
        
        return modified_request
    
    async def execute_response_functions(self, request: EdgeRequest, 
                                       response: EdgeResponse) -> EdgeResponse:
        """Execute response modifier functions"""
        modified_response = response
        
        # Get response modifier functions sorted by priority
        response_functions = [
            (name, func) for name, func in self.functions.items()
            if (self.configs[name].function_type == EdgeFunctionType.RESPONSE_MODIFIER and
                self.configs[name].enabled)
        ]
        
        response_functions.sort(key=lambda x: self.configs[x[0]].priority)
        
        for func_name, func in response_functions:
            try:
                start_time = time.time()
                
                # Execute function with timeout
                modified_response = await asyncio.wait_for(
                    func(request, modified_response),
                    timeout=self.configs[func_name].timeout_ms / 1000
                )
                
                # Update stats
                duration_ms = (time.time() - start_time) * 1000
                self._update_stats(func_name, duration_ms, success=True)
                
            except asyncio.TimeoutError:
                self._update_stats(func_name, 0, timeout=True)
                print(f"Edge function {func_name} timed out")
            except Exception as e:
                self._update_stats(func_name, 0, error=True)
                print(f"Edge function {func_name} failed: {e}")
        
        return modified_response
    
    def _update_stats(self, func_name: str, duration_ms: float, 
                     success: bool = False, error: bool = False, timeout: bool = False):
        """Update function execution statistics"""
        stats = self.execution_stats[func_name]
        stats['total_executions'] += 1
        
        if success:
            stats['total_duration_ms'] += duration_ms
        elif error:
            stats['errors'] += 1
        elif timeout:
            stats['timeouts'] += 1
    
    def get_function_stats(self) -> Dict[str, Dict]:
        """Get execution statistics for all functions"""
        result = {}
        
        for func_name, stats in self.execution_stats.items():
            avg_duration = 0
            if stats['total_executions'] > stats['errors'] + stats['timeouts']:
                successful_executions = stats['total_executions'] - stats['errors'] - stats['timeouts']
                avg_duration = stats['total_duration_ms'] / successful_executions
            
            result[func_name] = {
                'total_executions': stats['total_executions'],
                'average_duration_ms': avg_duration,
                'error_rate_percent': (stats['errors'] / stats['total_executions'] * 100) if stats['total_executions'] > 0 else 0,
                'timeout_rate_percent': (stats['timeouts'] / stats['total_executions'] * 100) if stats['total_executions'] > 0 else 0,
                'enabled': self.configs[func_name].enabled
            }
        
        return result

# Example edge functions
async def geo_redirect_function(request: EdgeRequest) -> EdgeRequest:
    """Redirect users based on geographic location"""
    country = request.geo_location.get('country', 'US')
    
    # Redirect EU users to EU-specific content
    if country in ['DE', 'FR', 'IT', 'ES', 'NL', 'GB']:
        if not request.url.startswith('/eu/'):
            request.url = f"/eu{request.url}"
    
    return request

async def security_headers_function(request: EdgeRequest, response: EdgeResponse) -> EdgeResponse:
    """Add security headers to response"""
    security_headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
    }
    
    response.headers.update(security_headers)
    response.modified = True
    
    return response

async def a_b_testing_function(request: EdgeRequest) -> EdgeRequest:
    """Implement A/B testing logic"""
    import hashlib
    
    # Use client IP for consistent assignment
    user_hash = int(hashlib.md5(request.client_ip.encode()).hexdigest(), 16)
    variant = 'A' if user_hash % 2 == 0 else 'B'
    
    # Add variant header
    request.headers['X-AB-Variant'] = variant
    
    # Modify URL for variant B
    if variant == 'B' and '/api/' in request.url:
        request.url = request.url.replace('/api/', '/api/v2/')
    
    return request

async def rate_limiting_function(request: EdgeRequest) -> EdgeRequest:
    """Implement rate limiting at the edge"""
    # Simple in-memory rate limiting (in production, use distributed cache)
    rate_limit_store = {}
    
    client_key = request.client_ip
    current_time = int(time.time())
    window_size = 60  # 1 minute window
    max_requests = 100
    
    # Clean old entries
    rate_limit_store = {
        k: v for k, v in rate_limit_store.items()
        if current_time - v['window_start'] < window_size
    }
    
    if client_key not in rate_limit_store:
        rate_limit_store[client_key] = {
            'count': 1,
            'window_start': current_time
        }
    else:
        entry = rate_limit_store[client_key]
        if current_time - entry['window_start'] >= window_size:
            # Reset window
            entry['count'] = 1
            entry['window_start'] = current_time
        else:
            entry['count'] += 1
    
    # Check rate limit
    if rate_limit_store[client_key]['count'] > max_requests:
        # Return rate limit exceeded response
        raise Exception("Rate limit exceeded")
    
    return request

# Setup edge function runtime
runtime = EdgeFunctionRuntime()

# Register functions
runtime.register_function(
    EdgeFunctionConfig(
        name="geo_redirect",
        function_type=EdgeFunctionType.REQUEST_MODIFIER,
        enabled=True,
        priority=1,
        timeout_ms=100,
        memory_limit_mb=128,
        environment_variables={}
    ),
    geo_redirect_function
)

runtime.register_function(
    EdgeFunctionConfig(
        name="security_headers",
        function_type=EdgeFunctionType.RESPONSE_MODIFIER,
        enabled=True,
        priority=1,
        timeout_ms=50,
        memory_limit_mb=64,
        environment_variables={}
    ),
    security_headers_function
)

runtime.register_function(
    EdgeFunctionConfig(
        name="a_b_testing",
        function_type=EdgeFunctionType.REQUEST_MODIFIER,
        enabled=True,
        priority=2,
        timeout_ms=100,
        memory_limit_mb=128,
        environment_variables={}
    ),
    a_b_testing_function
)
```

## Global Distribution Strategies

### Intelligent Routing

**Geographic and Performance-based Routing**
```python
import math
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class RoutingStrategy(Enum):
    GEOGRAPHIC = "geographic"
    PERFORMANCE = "performance"
    LOAD_BASED = "load_based"
    HYBRID = "hybrid"

@dataclass
class GeographicLocation:
    latitude: float
    longitude: float
    country: str
    region: str
    city: str

@dataclass
class EdgeServerMetrics:
    server_id: str
    location: GeographicLocation
    current_load_percent: float
    average_response_time_ms: float
    bandwidth_utilization_percent: float
    health_score: float  # 0.0 to 1.0
    last_updated: float

class IntelligentRouter:
    def __init__(self, strategy: RoutingStrategy = RoutingStrategy.HYBRID):
        self.strategy = strategy
        self.edge_servers: Dict[str, EdgeServerMetrics] = {}
        self.performance_history: Dict[str, List[float]] = {}
        self.routing_weights = {
            'distance': 0.3,
            'performance': 0.4,
            'load': 0.3
        }
    
    def register_edge_server(self, metrics: EdgeServerMetrics):
        """Register an edge server"""
        self.edge_servers[metrics.server_id] = metrics
        if metrics.server_id not in self.performance_history:
            self.performance_history[metrics.server_id] = []
    
    def update_server_metrics(self, server_id: str, metrics: EdgeServerMetrics):
        """Update server metrics"""
        if server_id in self.edge_servers:
            self.edge_servers[server_id] = metrics
            
            # Update performance history
            history = self.performance_history[server_id]
            history.append(metrics.average_response_time_ms)
            
            # Keep only recent history (last 100 measurements)
            if len(history) > 100:
                history.pop(0)
    
    def calculate_distance(self, client_location: GeographicLocation, 
                         server_location: GeographicLocation) -> float:
        """Calculate distance between client and server using Haversine formula"""
        # Convert latitude and longitude from degrees to radians
        lat1, lon1 = math.radians(client_location.latitude), math.radians(client_location.longitude)
        lat2, lon2 = math.radians(server_location.latitude), math.radians(server_location.longitude)
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        
        return c * r
    
    def calculate_server_score(self, client_location: GeographicLocation, 
                             server_metrics: EdgeServerMetrics) -> float:
        """Calculate overall score for a server"""
        # Distance score (lower distance = higher score)
        distance_km = self.calculate_distance(client_location, server_metrics.location)
        max_distance = 20000  # Maximum possible distance (half earth circumference)
        distance_score = 1.0 - (distance_km / max_distance)
        
        # Performance score (lower response time = higher score)
        max_response_time = 2000  # 2 seconds
        performance_score = max(0, 1.0 - (server_metrics.average_response_time_ms / max_response_time))
        
        # Load score (lower load = higher score)
        load_score = 1.0 - (server_metrics.current_load_percent / 100)
        
        # Health score (already normalized 0-1)
        health_score = server_metrics.health_score
        
        # Weighted combination
        if self.strategy == RoutingStrategy.GEOGRAPHIC:
            return distance_score * 0.8 + health_score * 0.2
        elif self.strategy == RoutingStrategy.PERFORMANCE:
            return performance_score * 0.7 + health_score * 0.3
        elif self.strategy == RoutingStrategy.LOAD_BASED:
            return load_score * 0.7 + health_score * 0.3
        else:  # HYBRID
            return (
                distance_score * self.routing_weights['distance'] +
                performance_score * self.routing_weights['performance'] +
                load_score * self.routing_weights['load']
            ) * health_score  # Health as a multiplier
    
    def select_edge_server(self, client_location: GeographicLocation, 
                          request_type: str = 'default') -> Optional[str]:
        """Select the best edge server for a client"""
        if not self.edge_servers:
            return None
        
        # Filter healthy servers
        healthy_servers = {
            server_id: metrics for server_id, metrics in self.edge_servers.items()
            if metrics.health_score > 0.5 and metrics.current_load_percent < 95
        }
        
        if not healthy_servers:
            return None
        
        # Calculate scores for all healthy servers
        server_scores = []
        for server_id, metrics in healthy_servers.items():
            score = self.calculate_server_score(client_location, metrics)
            server_scores.append((server_id, score))
        
        # Sort by score (highest first)
        server_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return the best server
        return server_scores[0][0]
    
    def get_routing_recommendations(self, client_location: GeographicLocation) -> List[Tuple[str, float]]:
        """Get top 3 server recommendations with scores"""
        recommendations = []
        
        for server_id, metrics in self.edge_servers.items():
            if metrics.health_score > 0.3:  # Include marginally healthy servers
                score = self.calculate_server_score(client_location, metrics)
                recommendations.append((server_id, score))
        
        # Sort by score and return top 3
        recommendations.sort(key=lambda x: x[1], reverse=True)
        return recommendations[:3]
    
    def optimize_routing_weights(self, performance_data: Dict[str, List[float]]):
        """Optimize routing weights based on historical performance"""
        # Simple optimization based on average performance
        # In production, use more sophisticated ML algorithms
        
        total_performance = 0
        server_count = 0
        
        for server_id, response_times in performance_data.items():
            if response_times:
                avg_response_time = sum(response_times) / len(response_times)
                total_performance += avg_response_time
                server_count += 1
        
        if server_count > 0:
            avg_global_performance = total_performance / server_count
            
            # Adjust weights based on global performance
            if avg_global_performance > 500:  # High latency
                self.routing_weights['distance'] = 0.5
                self.routing_weights['performance'] = 0.3
                self.routing_weights['load'] = 0.2
            elif avg_global_performance < 100:  # Low latency
                self.routing_weights['distance'] = 0.2
                self.routing_weights['performance'] = 0.3
                self.routing_weights['load'] = 0.5
    
    def get_routing_stats(self) -> Dict:
        """Get routing statistics"""
        total_servers = len(self.edge_servers)
        healthy_servers = sum(1 for m in self.edge_servers.values() if m.health_score > 0.5)
        
        avg_load = sum(m.current_load_percent for m in self.edge_servers.values()) / total_servers if total_servers > 0 else 0
        avg_response_time = sum(m.average_response_time_ms for m in self.edge_servers.values()) / total_servers if total_servers > 0 else 0
        
        return {
            'total_servers': total_servers,
            'healthy_servers': healthy_servers,
            'health_percentage': (healthy_servers / total_servers * 100) if total_servers > 0 else 0,
            'average_load_percent': avg_load,
            'average_response_time_ms': avg_response_time,
            'routing_strategy': self.strategy.value,
            'routing_weights': self.routing_weights
        }
```

## Real-World Examples

### Cloudflare's Edge Network

**Global Edge Architecture:**
```
[User Request] → [Anycast DNS] → [Nearest Edge Location]
                      ↓
[Edge Functions] → [Cache Check] → [Origin Shield] → [Origin Server]
                      ↓
[Response Optimization] → [Security Filtering] → [User Response]
```

**Key Features:**
- **200+ Edge Locations**: Global presence for low latency
- **Anycast Network**: Automatic routing to nearest edge
- **Edge Functions**: Serverless compute at the edge
- **Smart Routing**: Performance-based origin selection

### AWS CloudFront Architecture

**Multi-tier CDN Structure:**
```
[Regional Edge Caches] ← [Edge Locations] ← [Users]
         ↓                    ↓
[Origin Shield] ← [S3/ALB/Custom Origins]
```

**Optimization Features:**
- **HTTP/2 and HTTP/3**: Modern protocol support
- **Compression**: Automatic content compression
- **Lambda@Edge**: Serverless edge computing
- **Real-time Logs**: Detailed analytics and monitoring

## Best Practices

### 1. CDN Configuration
- **Optimize cache headers** for different content types
- **Use appropriate TTL values** based on content update frequency
- **Implement cache invalidation strategies** for dynamic content
- **Monitor cache hit ratios** and optimize accordingly

### 2. Edge Computing
- **Keep edge functions lightweight** to minimize latency
- **Implement proper error handling** for edge function failures
- **Use edge computing for personalization** and A/B testing
- **Monitor edge function performance** and resource usage

### 3. Global Distribution
- **Choose edge locations** based on user geography
- **Implement intelligent routing** for optimal performance
- **Use multiple CDN providers** for redundancy
- **Monitor global performance** and adjust routing accordingly

### 4. Security
- **Implement DDoS protection** at the edge
- **Use Web Application Firewalls (WAF)** for security filtering
- **Enable HTTPS everywhere** with automatic certificate management
- **Implement rate limiting** to prevent abuse

## Common Pitfalls

### 1. Over-Caching
- **Caching dynamic content** inappropriately
- **Long TTL values** for frequently changing content
- **Not implementing cache invalidation** properly
- **Ignoring cache-control headers** from origin

### 2. Poor Edge Function Design
- **Heavy computation** at the edge causing latency
- **Stateful edge functions** causing consistency issues
- **Not handling edge function failures** gracefully
- **Excessive edge function chaining**

### 3. Inadequate Monitoring
- **Not monitoring cache performance** across regions
- **Missing edge function error tracking**
- **Inadequate origin server monitoring**
- **Not tracking user experience metrics**

### 4. Cost Optimization
- **Not optimizing data transfer costs** between regions
- **Over-provisioning edge locations** without traffic justification
- **Ignoring bandwidth costs** for cache misses
- **Not using cost-effective storage tiers** for origin content

---

**Next Chapter**: [Chapter 13: Reliability Patterns](chapter-13.md) - Circuit breakers, retry patterns, and failover design