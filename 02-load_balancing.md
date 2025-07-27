# Chapter 2: Load Balancing and Traffic Distribution

## Overview

Load balancing is the process of distributing incoming network traffic across multiple servers to ensure no single server becomes overwhelmed. It's a critical component for building scalable and highly available systems.

## What is Load Balancing?

Load balancing involves:
- **Traffic Distribution**: Spreading requests across multiple servers
- **Health Monitoring**: Checking server availability and performance
- **Failover**: Redirecting traffic when servers become unavailable
- **Session Management**: Maintaining user sessions across servers

## Types of Load Balancers

### Layer 4 (Transport Layer) Load Balancing

**How it works:**
- Operates at the TCP/UDP level
- Routes traffic based on IP address and port
- Doesn't inspect application data

**Pros:**
- Fast and efficient
- Lower latency
- Protocol agnostic
- Less resource intensive

**Cons:**
- Limited routing decisions
- No application-aware routing
- Cannot modify requests

**Example Configuration:**
```nginx
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

### Layer 7 (Application Layer) Load Balancing

**How it works:**
- Operates at the HTTP/HTTPS level
- Can inspect request content
- Routes based on URLs, headers, cookies

**Pros:**
- Intelligent routing decisions
- Content-based routing
- SSL termination
- Request modification capabilities

**Cons:**
- Higher latency
- More resource intensive
- Protocol specific

**Example Configuration:**
```nginx
upstream api_servers {
    server api1.example.com:8080;
    server api2.example.com:8080;
}

upstream web_servers {
    server web1.example.com:8080;
    server web2.example.com:8080;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://api_servers;
    }
    
    location / {
        proxy_pass http://web_servers;
    }
}
```

## Load Balancing Algorithms

### 1. Round Robin
**How it works:** Requests are distributed sequentially across servers

**Pros:**
- Simple to implement
- Equal distribution
- Good for homogeneous servers

**Cons:**
- Doesn't consider server capacity
- May not handle varying request complexity

```python
class RoundRobinBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.current = 0
    
    def get_server(self):
        server = self.servers[self.current]
        self.current = (self.current + 1) % len(self.servers)
        return server
```

### 2. Weighted Round Robin
**How it works:** Servers receive requests proportional to their assigned weights

**Use case:** When servers have different capacities

```python
class WeightedRoundRobinBalancer:
    def __init__(self, servers_weights):
        self.servers_weights = servers_weights  # [(server, weight), ...]
        self.current_weights = [0] * len(servers_weights)
    
    def get_server(self):
        total_weight = sum(weight for _, weight in self.servers_weights)
        
        for i, (server, weight) in enumerate(self.servers_weights):
            self.current_weights[i] += weight
            
            if self.current_weights[i] >= max(self.current_weights):
                self.current_weights[i] -= total_weight
                return server
```

### 3. Least Connections
**How it works:** Routes requests to the server with the fewest active connections

**Pros:**
- Better for long-running requests
- Adapts to server performance

**Cons:**
- Requires connection tracking
- More complex implementation

```python
class LeastConnectionsBalancer:
    def __init__(self, servers):
        self.servers = servers
        self.connections = {server: 0 for server in servers}
    
    def get_server(self):
        return min(self.connections, key=self.connections.get)
    
    def add_connection(self, server):
        self.connections[server] += 1
    
    def remove_connection(self, server):
        self.connections[server] -= 1
```

### 4. IP Hash
**How it works:** Uses client IP to determine which server to route to

**Pros:**
- Session affinity
- Consistent routing for same client

**Cons:**
- Uneven distribution with limited IP ranges
- Doesn't adapt to server failures well

```python
import hashlib

class IPHashBalancer:
    def __init__(self, servers):
        self.servers = servers
    
    def get_server(self, client_ip):
        hash_value = int(hashlib.md5(client_ip.encode()).hexdigest(), 16)
        return self.servers[hash_value % len(self.servers)]
```

### 5. Least Response Time
**How it works:** Routes to server with lowest average response time

**Pros:**
- Performance-aware routing
- Adapts to server performance changes

**Cons:**
- Requires response time monitoring
- Complex implementation

## Health Checks

### Active Health Checks
**How it works:** Load balancer actively probes servers

```python
import requests
import time
from threading import Thread

class HealthChecker:
    def __init__(self, servers, check_interval=30):
        self.servers = servers
        self.check_interval = check_interval
        self.healthy_servers = set(servers)
        self.start_monitoring()
    
    def check_server_health(self, server):
        try:
            response = requests.get(f"http://{server}/health", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def monitor_servers(self):
        while True:
            for server in self.servers:
                if self.check_server_health(server):
                    self.healthy_servers.add(server)
                else:
                    self.healthy_servers.discard(server)
            time.sleep(self.check_interval)
    
    def start_monitoring(self):
        Thread(target=self.monitor_servers, daemon=True).start()
```

### Passive Health Checks
**How it works:** Monitor actual request failures to determine health

```python
class PassiveHealthChecker:
    def __init__(self, servers, failure_threshold=3):
        self.servers = servers
        self.failure_threshold = failure_threshold
        self.failure_counts = {server: 0 for server in servers}
        self.healthy_servers = set(servers)
    
    def record_success(self, server):
        self.failure_counts[server] = 0
        self.healthy_servers.add(server)
    
    def record_failure(self, server):
        self.failure_counts[server] += 1
        if self.failure_counts[server] >= self.failure_threshold:
            self.healthy_servers.discard(server)
```

## Session Affinity (Sticky Sessions)

### Cookie-Based Affinity
```nginx
upstream backend {
    ip_hash;  # Ensures same client goes to same server
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}
```

### Application-Level Session Management
```python
# Using Redis for shared session storage
import redis
import json

class SessionManager:
    def __init__(self, redis_host='localhost', redis_port=6379):
        self.redis_client = redis.Redis(host=redis_host, port=redis_port)
    
    def store_session(self, session_id, data, ttl=3600):
        self.redis_client.setex(
            f"session:{session_id}", 
            ttl, 
            json.dumps(data)
        )
    
    def get_session(self, session_id):
        data = self.redis_client.get(f"session:{session_id}")
        return json.loads(data) if data else None
    
    def delete_session(self, session_id):
        self.redis_client.delete(f"session:{session_id}")
```

## Load Balancer Types

### Hardware Load Balancers
**Examples:** F5 BIG-IP, Citrix NetScaler

**Pros:**
- High performance
- Dedicated hardware
- Advanced features

**Cons:**
- Expensive
- Vendor lock-in
- Limited flexibility

### Software Load Balancers
**Examples:** NGINX, HAProxy, Apache HTTP Server

**Pros:**
- Cost-effective
- Flexible configuration
- Easy to scale

**Cons:**
- Requires server resources
- May have performance limitations

### Cloud Load Balancers
**Examples:** AWS ELB, Google Cloud Load Balancer, Azure Load Balancer

**Pros:**
- Managed service
- Auto-scaling
- High availability

**Cons:**
- Vendor dependency
- Potential cost
- Limited customization

## Advanced Load Balancing Patterns

### Global Server Load Balancing (GSLB)
**Purpose:** Distribute traffic across geographically distributed data centers

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   US East   │    │   US West   │    │   Europe    │
│ Data Center │    │ Data Center │    │ Data Center │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌─────────────┐
                    │    GSLB     │
                    │ Controller  │
                    └─────────────┘
```

### Circuit Breaker Pattern
**Purpose:** Prevent cascading failures by temporarily blocking requests to failing services

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
    
    def on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED
    
    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
```

## Real-World Examples

### Netflix's Zuul
**Purpose:** API Gateway with load balancing capabilities

**Features:**
- Dynamic routing
- Request filtering
- Load balancing
- Circuit breaker integration

### AWS Application Load Balancer
**Features:**
- Layer 7 load balancing
- Content-based routing
- SSL termination
- Integration with AWS services

**Configuration Example:**
```yaml
# AWS ALB Target Group
TargetGroup:
  Type: AWS::ElasticLoadBalancingV2::TargetGroup
  Properties:
    Name: my-app-targets
    Port: 8080
    Protocol: HTTP
    VpcId: !Ref VPC
    HealthCheckPath: /health
    HealthCheckIntervalSeconds: 30
    HealthyThresholdCount: 2
    UnhealthyThresholdCount: 3
```

## Best Practices

### 1. Health Check Design
- Implement meaningful health endpoints
- Check dependencies (database, external services)
- Use appropriate timeouts
- Monitor health check performance

### 2. Graceful Degradation
- Handle server failures gracefully
- Implement fallback mechanisms
- Provide meaningful error messages

### 3. Monitoring and Alerting
- Track key metrics (latency, error rates, throughput)
- Set up alerts for threshold breaches
- Monitor load balancer performance

### 4. Security Considerations
- Implement DDoS protection
- Use SSL/TLS termination
- Validate and sanitize requests
- Implement rate limiting

## Common Pitfalls

### 1. Uneven Load Distribution
**Problem:** Some servers receive more traffic than others
**Solutions:**
- Use appropriate load balancing algorithms
- Consider server capacity differences
- Monitor distribution metrics

### 2. Session Affinity Issues
**Problem:** Sticky sessions can cause uneven load
**Solutions:**
- Use shared session storage
- Implement session replication
- Consider stateless design

### 3. Health Check Overhead
**Problem:** Too frequent health checks impact performance
**Solutions:**
- Optimize health check frequency
- Use lightweight health endpoints
- Implement smart health checking

## Next Steps

In the next chapter, we'll explore caching strategies, which work hand-in-hand with load balancing to improve system performance and reduce server load.