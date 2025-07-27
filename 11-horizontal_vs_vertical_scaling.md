# Chapter 11: Horizontal vs Vertical Scaling

## Overview

Scaling is the process of increasing system capacity to handle growing workloads. There are two primary approaches: vertical scaling (scaling up) and horizontal scaling (scaling out). Understanding when and how to apply each approach is crucial for building scalable systems.

## Vertical Scaling (Scale Up)

### Definition
Vertical scaling involves adding more power (CPU, RAM, storage) to existing machines.

### Vertical Scaling Implementation

**Dynamic Resource Allocation (Python)**
```python
import psutil
import time
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum

class ResourceType(Enum):
    CPU = "cpu"
    MEMORY = "memory"
    DISK = "disk"

@dataclass
class ResourceMetrics:
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    timestamp: float

@dataclass
class ScalingAction:
    resource_type: ResourceType
    action: str  # "increase" or "decrease"
    amount: int
    reason: str

class VerticalScaler:
    def __init__(self):
        self.cpu_threshold_high = 80.0
        self.cpu_threshold_low = 20.0
        self.memory_threshold_high = 85.0
        self.memory_threshold_low = 30.0
        self.disk_threshold_high = 90.0
        
        self.scaling_history: List[ScalingAction] = []
        self.cooldown_period = 300  # 5 minutes
        self.last_scaling_time = 0
    
    def get_current_metrics(self) -> ResourceMetrics:
        """Get current system resource metrics"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return ResourceMetrics(
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            disk_percent=(disk.used / disk.total) * 100,
            timestamp=time.time()
        )
    
    def should_scale(self, metrics: ResourceMetrics) -> List[ScalingAction]:
        """Determine if scaling is needed based on metrics"""
        actions = []
        current_time = time.time()
        
        # Check cooldown period
        if current_time - self.last_scaling_time < self.cooldown_period:
            return actions
        
        # CPU scaling decisions
        if metrics.cpu_percent > self.cpu_threshold_high:
            actions.append(ScalingAction(
                resource_type=ResourceType.CPU,
                action="increase",
                amount=1,  # Add 1 CPU core
                reason=f"CPU usage at {metrics.cpu_percent}%"
            ))
        elif metrics.cpu_percent < self.cpu_threshold_low:
            actions.append(ScalingAction(
                resource_type=ResourceType.CPU,
                action="decrease",
                amount=1,  # Remove 1 CPU core
                reason=f"CPU usage at {metrics.cpu_percent}%"
            ))
        
        # Memory scaling decisions
        if metrics.memory_percent > self.memory_threshold_high:
            actions.append(ScalingAction(
                resource_type=ResourceType.MEMORY,
                action="increase",
                amount=2048,  # Add 2GB RAM
                reason=f"Memory usage at {metrics.memory_percent}%"
            ))
        elif metrics.memory_percent < self.memory_threshold_low:
            actions.append(ScalingAction(
                resource_type=ResourceType.MEMORY,
                action="decrease",
                amount=1024,  # Remove 1GB RAM
                reason=f"Memory usage at {metrics.memory_percent}%"
            ))
        
        # Disk scaling decisions
        if metrics.disk_percent > self.disk_threshold_high:
            actions.append(ScalingAction(
                resource_type=ResourceType.DISK,
                action="increase",
                amount=10240,  # Add 10GB storage
                reason=f"Disk usage at {metrics.disk_percent}%"
            ))
        
        return actions
    
    def execute_scaling(self, actions: List[ScalingAction]) -> bool:
        """Execute scaling actions (cloud provider specific)"""
        for action in actions:
            try:
                if action.resource_type == ResourceType.CPU:
                    self._scale_cpu(action)
                elif action.resource_type == ResourceType.MEMORY:
                    self._scale_memory(action)
                elif action.resource_type == ResourceType.DISK:
                    self._scale_disk(action)
                
                self.scaling_history.append(action)
                self.last_scaling_time = time.time()
                
                print(f"Scaling action executed: {action.action} {action.resource_type.value} by {action.amount}")
                print(f"Reason: {action.reason}")
                
            except Exception as e:
                print(f"Failed to execute scaling action: {e}")
                return False
        
        return True
    
    def _scale_cpu(self, action: ScalingAction):
        """Scale CPU resources (implementation depends on cloud provider)"""
        # AWS EC2 example
        if action.action == "increase":
            # Resize instance to larger instance type
            pass
        else:
            # Resize instance to smaller instance type
            pass
    
    def _scale_memory(self, action: ScalingAction):
        """Scale memory resources"""
        # Implementation depends on cloud provider
        pass
    
    def _scale_disk(self, action: ScalingAction):
        """Scale disk resources"""
        # Implementation depends on cloud provider
        pass
    
    def monitor_and_scale(self):
        """Continuous monitoring and scaling loop"""
        while True:
            try:
                metrics = self.get_current_metrics()
                actions = self.should_scale(metrics)
                
                if actions:
                    self.execute_scaling(actions)
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                time.sleep(60)
```

## Horizontal Scaling (Scale Out)

### Definition
Horizontal scaling involves adding more machines to the pool of resources.

### Load Balancer for Horizontal Scaling

**Application Load Balancer Implementation**
```python
import asyncio
import aiohttp
import random
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum

class ServerStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    DRAINING = "draining"

@dataclass
class Server:
    id: str
    host: str
    port: int
    status: ServerStatus
    current_connections: int = 0
    max_connections: int = 1000
    response_time_ms: float = 0.0
    last_health_check: float = 0.0
    weight: int = 1

class LoadBalancingAlgorithm(Enum):
    ROUND_ROBIN = "round_robin"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_LEAST_CONNECTIONS = "weighted_least_connections"
    RANDOM = "random"
    IP_HASH = "ip_hash"

class HorizontalLoadBalancer:
    def __init__(self, algorithm: LoadBalancingAlgorithm = LoadBalancingAlgorithm.ROUND_ROBIN):
        self.servers: List[Server] = []
        self.algorithm = algorithm
        self.current_index = 0
        self.health_check_interval = 30
        self.health_check_timeout = 5
        
    def add_server(self, server: Server):
        """Add a server to the load balancer pool"""
        self.servers.append(server)
        print(f"Added server {server.id} ({server.host}:{server.port})")
    
    def remove_server(self, server_id: str):
        """Remove a server from the pool"""
        self.servers = [s for s in self.servers if s.id != server_id]
        print(f"Removed server {server_id}")
    
    def get_healthy_servers(self) -> List[Server]:
        """Get list of healthy servers"""
        return [s for s in self.servers if s.status == ServerStatus.HEALTHY]
    
    def select_server(self, client_ip: str = None) -> Optional[Server]:
        """Select a server based on the configured algorithm"""
        healthy_servers = self.get_healthy_servers()
        
        if not healthy_servers:
            return None
        
        if self.algorithm == LoadBalancingAlgorithm.ROUND_ROBIN:
            return self._round_robin_selection(healthy_servers)
        elif self.algorithm == LoadBalancingAlgorithm.WEIGHTED_ROUND_ROBIN:
            return self._weighted_round_robin_selection(healthy_servers)
        elif self.algorithm == LoadBalancingAlgorithm.LEAST_CONNECTIONS:
            return self._least_connections_selection(healthy_servers)
        elif self.algorithm == LoadBalancingAlgorithm.WEIGHTED_LEAST_CONNECTIONS:
            return self._weighted_least_connections_selection(healthy_servers)
        elif self.algorithm == LoadBalancingAlgorithm.RANDOM:
            return random.choice(healthy_servers)
        elif self.algorithm == LoadBalancingAlgorithm.IP_HASH:
            return self._ip_hash_selection(healthy_servers, client_ip)
        
        return healthy_servers[0]
    
    def _round_robin_selection(self, servers: List[Server]) -> Server:
        """Round-robin server selection"""
        server = servers[self.current_index % len(servers)]
        self.current_index += 1
        return server
    
    def _weighted_round_robin_selection(self, servers: List[Server]) -> Server:
        """Weighted round-robin server selection"""
        total_weight = sum(s.weight for s in servers)
        random_weight = random.randint(1, total_weight)
        
        current_weight = 0
        for server in servers:
            current_weight += server.weight
            if random_weight <= current_weight:
                return server
        
        return servers[0]
    
    def _least_connections_selection(self, servers: List[Server]) -> Server:
        """Least connections server selection"""
        return min(servers, key=lambda s: s.current_connections)
    
    def _weighted_least_connections_selection(self, servers: List[Server]) -> Server:
        """Weighted least connections server selection"""
        return min(servers, key=lambda s: s.current_connections / s.weight)
    
    def _ip_hash_selection(self, servers: List[Server], client_ip: str) -> Server:
        """IP hash-based server selection for session affinity"""
        if not client_ip:
            return servers[0]
        
        hash_value = hash(client_ip)
        return servers[hash_value % len(servers)]
    
    async def health_check(self, server: Server) -> bool:
        """Perform health check on a server"""
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.health_check_timeout)) as session:
                async with session.get(f"http://{server.host}:{server.port}/health") as response:
                    response_time = (time.time() - start_time) * 1000
                    server.response_time_ms = response_time
                    server.last_health_check = time.time()
                    
                    if response.status == 200:
                        if server.status != ServerStatus.HEALTHY:
                            print(f"Server {server.id} is now healthy")
                        server.status = ServerStatus.HEALTHY
                        return True
                    else:
                        if server.status != ServerStatus.UNHEALTHY:
                            print(f"Server {server.id} is unhealthy (HTTP {response.status})")
                        server.status = ServerStatus.UNHEALTHY
                        return False
        
        except Exception as e:
            if server.status != ServerStatus.UNHEALTHY:
                print(f"Server {server.id} health check failed: {e}")
            server.status = ServerStatus.UNHEALTHY
            server.last_health_check = time.time()
            return False
    
    async def continuous_health_check(self):
        """Continuously monitor server health"""
        while True:
            try:
                health_check_tasks = [self.health_check(server) for server in self.servers]
                await asyncio.gather(*health_check_tasks, return_exceptions=True)
                await asyncio.sleep(self.health_check_interval)
            except Exception as e:
                print(f"Error in health check loop: {e}")
                await asyncio.sleep(self.health_check_interval)
    
    async def forward_request(self, server: Server, request_data: Dict) -> Dict:
        """Forward request to selected server"""
        try:
            server.current_connections += 1
            
            async with aiohttp.ClientSession() as session:
                url = f"http://{server.host}:{server.port}{request_data.get('path', '/')}"
                
                async with session.request(
                    method=request_data.get('method', 'GET'),
                    url=url,
                    headers=request_data.get('headers', {}),
                    data=request_data.get('body')
                ) as response:
                    response_data = {
                        'status': response.status,
                        'headers': dict(response.headers),
                        'body': await response.text()
                    }
                    
                    return response_data
        
        except Exception as e:
            raise Exception(f"Failed to forward request to {server.id}: {e}")
        
        finally:
            server.current_connections -= 1
    
    def get_server_stats(self) -> Dict:
        """Get load balancer statistics"""
        healthy_count = len(self.get_healthy_servers())
        total_connections = sum(s.current_connections for s in self.servers)
        avg_response_time = sum(s.response_time_ms for s in self.servers) / len(self.servers) if self.servers else 0
        
        return {
            'total_servers': len(self.servers),
            'healthy_servers': healthy_count,
            'unhealthy_servers': len(self.servers) - healthy_count,
            'total_connections': total_connections,
            'average_response_time_ms': avg_response_time,
            'algorithm': self.algorithm.value
        }
```

### Auto-Scaling Implementation

**Kubernetes-style Auto-Scaler**
```python
import asyncio
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

class ScalingDirection(Enum):
    UP = "up"
    DOWN = "down"
    NONE = "none"

@dataclass
class ScalingMetrics:
    cpu_utilization: float
    memory_utilization: float
    request_rate: float
    response_time_ms: float
    error_rate: float
    timestamp: float

@dataclass
class ScalingPolicy:
    min_replicas: int
    max_replicas: int
    target_cpu_utilization: float
    target_memory_utilization: float
    scale_up_threshold: float
    scale_down_threshold: float
    scale_up_cooldown: int  # seconds
    scale_down_cooldown: int  # seconds
    scale_up_step: int  # number of replicas to add
    scale_down_step: int  # number of replicas to remove

class HorizontalPodAutoscaler:
    def __init__(self, service_name: str, policy: ScalingPolicy):
        self.service_name = service_name
        self.policy = policy
        self.current_replicas = policy.min_replicas
        self.last_scale_up_time = 0
        self.last_scale_down_time = 0
        self.metrics_history: List[ScalingMetrics] = []
        self.max_history_size = 10
    
    def add_metrics(self, metrics: ScalingMetrics):
        """Add new metrics to history"""
        self.metrics_history.append(metrics)
        
        # Keep only recent metrics
        if len(self.metrics_history) > self.max_history_size:
            self.metrics_history = self.metrics_history[-self.max_history_size:]
    
    def get_average_metrics(self, window_size: int = 5) -> Optional[ScalingMetrics]:
        """Get average metrics over a time window"""
        if len(self.metrics_history) < window_size:
            return None
        
        recent_metrics = self.metrics_history[-window_size:]
        
        avg_cpu = sum(m.cpu_utilization for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m.memory_utilization for m in recent_metrics) / len(recent_metrics)
        avg_request_rate = sum(m.request_rate for m in recent_metrics) / len(recent_metrics)
        avg_response_time = sum(m.response_time_ms for m in recent_metrics) / len(recent_metrics)
        avg_error_rate = sum(m.error_rate for m in recent_metrics) / len(recent_metrics)
        
        return ScalingMetrics(
            cpu_utilization=avg_cpu,
            memory_utilization=avg_memory,
            request_rate=avg_request_rate,
            response_time_ms=avg_response_time,
            error_rate=avg_error_rate,
            timestamp=time.time()
        )
    
    def should_scale(self) -> ScalingDirection:
        """Determine if scaling is needed"""
        avg_metrics = self.get_average_metrics()
        if not avg_metrics:
            return ScalingDirection.NONE
        
        current_time = time.time()
        
        # Check scale-up conditions
        scale_up_needed = (
            avg_metrics.cpu_utilization > self.policy.scale_up_threshold or
            avg_metrics.memory_utilization > self.policy.scale_up_threshold or
            avg_metrics.response_time_ms > 1000  # 1 second response time threshold
        )
        
        if (scale_up_needed and 
            self.current_replicas < self.policy.max_replicas and
            current_time - self.last_scale_up_time > self.policy.scale_up_cooldown):
            return ScalingDirection.UP
        
        # Check scale-down conditions
        scale_down_needed = (
            avg_metrics.cpu_utilization < self.policy.scale_down_threshold and
            avg_metrics.memory_utilization < self.policy.scale_down_threshold and
            avg_metrics.response_time_ms < 200  # Fast response time
        )
        
        if (scale_down_needed and 
            self.current_replicas > self.policy.min_replicas and
            current_time - self.last_scale_down_time > self.policy.scale_down_cooldown):
            return ScalingDirection.DOWN
        
        return ScalingDirection.NONE
    
    def calculate_desired_replicas(self, metrics: ScalingMetrics) -> int:
        """Calculate desired number of replicas based on metrics"""
        # CPU-based calculation
        cpu_desired = max(1, int(
            self.current_replicas * (metrics.cpu_utilization / self.policy.target_cpu_utilization)
        ))
        
        # Memory-based calculation
        memory_desired = max(1, int(
            self.current_replicas * (metrics.memory_utilization / self.policy.target_memory_utilization)
        ))
        
        # Take the maximum to ensure resource requirements are met
        desired = max(cpu_desired, memory_desired)
        
        # Apply min/max constraints
        desired = max(self.policy.min_replicas, min(self.policy.max_replicas, desired))
        
        return desired
    
    async def scale_up(self) -> bool:
        """Scale up the service"""
        new_replicas = min(
            self.policy.max_replicas,
            self.current_replicas + self.policy.scale_up_step
        )
        
        if new_replicas > self.current_replicas:
            try:
                await self._execute_scaling(new_replicas)
                self.current_replicas = new_replicas
                self.last_scale_up_time = time.time()
                
                print(f"Scaled up {self.service_name} to {new_replicas} replicas")
                return True
            except Exception as e:
                print(f"Failed to scale up {self.service_name}: {e}")
                return False
        
        return False
    
    async def scale_down(self) -> bool:
        """Scale down the service"""
        new_replicas = max(
            self.policy.min_replicas,
            self.current_replicas - self.policy.scale_down_step
        )
        
        if new_replicas < self.current_replicas:
            try:
                await self._execute_scaling(new_replicas)
                self.current_replicas = new_replicas
                self.last_scale_down_time = time.time()
                
                print(f"Scaled down {self.service_name} to {new_replicas} replicas")
                return True
            except Exception as e:
                print(f"Failed to scale down {self.service_name}: {e}")
                return False
        
        return False
    
    async def _execute_scaling(self, target_replicas: int):
        """Execute the actual scaling operation (implementation specific)"""
        # This would integrate with your orchestration platform
        # Examples: Kubernetes API, Docker Swarm, AWS ECS, etc.
        
        # Kubernetes example:
        # kubectl scale deployment {self.service_name} --replicas={target_replicas}
        
        # AWS ECS example:
        # ecs.update_service(serviceName=self.service_name, desiredCount=target_replicas)
        
        # Simulate scaling delay
        await asyncio.sleep(2)
    
    async def auto_scale_loop(self):
        """Main auto-scaling loop"""
        while True:
            try:
                scaling_direction = self.should_scale()
                
                if scaling_direction == ScalingDirection.UP:
                    await self.scale_up()
                elif scaling_direction == ScalingDirection.DOWN:
                    await self.scale_down()
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                print(f"Error in auto-scaling loop for {self.service_name}: {e}")
                await asyncio.sleep(30)
    
    def get_scaling_status(self) -> Dict:
        """Get current scaling status"""
        avg_metrics = self.get_average_metrics()
        
        return {
            'service_name': self.service_name,
            'current_replicas': self.current_replicas,
            'min_replicas': self.policy.min_replicas,
            'max_replicas': self.policy.max_replicas,
            'last_scale_up': self.last_scale_up_time,
            'last_scale_down': self.last_scale_down_time,
            'average_metrics': {
                'cpu_utilization': avg_metrics.cpu_utilization if avg_metrics else 0,
                'memory_utilization': avg_metrics.memory_utilization if avg_metrics else 0,
                'response_time_ms': avg_metrics.response_time_ms if avg_metrics else 0
            } if avg_metrics else None
        }

# Usage example
scaling_policy = ScalingPolicy(
    min_replicas=2,
    max_replicas=20,
    target_cpu_utilization=70.0,
    target_memory_utilization=80.0,
    scale_up_threshold=80.0,
    scale_down_threshold=30.0,
    scale_up_cooldown=300,  # 5 minutes
    scale_down_cooldown=600,  # 10 minutes
    scale_up_step=2,
    scale_down_step=1
)

autoscaler = HorizontalPodAutoscaler("web-service", scaling_policy)
```

## Comparison: Vertical vs Horizontal Scaling

### Vertical Scaling

**Pros:**
- Simpler to implement
- No application changes required
- Better for single-threaded applications
- Lower network overhead
- Easier data consistency

**Cons:**
- Hardware limits (finite scaling)
- Single point of failure
- Expensive at scale
- Downtime during scaling
- Resource waste during low usage

**Use Cases:**
- Legacy applications
- Databases requiring ACID properties
- Applications with shared state
- Small to medium workloads

### Horizontal Scaling

**Pros:**
- Virtually unlimited scaling
- Better fault tolerance
- Cost-effective at scale
- No downtime during scaling
- Geographic distribution possible

**Cons:**
- Complex implementation
- Application must be stateless
- Data consistency challenges
- Network overhead
- Load balancing complexity

**Use Cases:**
- Web applications
- Microservices
- Stateless services
- High-traffic systems
- Global applications

## Real-World Examples

### Netflix's Scaling Strategy

**Horizontal Scaling Approach:**
```
[Global Load Balancer]
        ↓
[Regional Load Balancers]
        ↓
[Auto Scaling Groups]
        ↓
[Microservices Instances]
```

**Key Components:**
- **Eureka**: Service discovery
- **Zuul**: API Gateway with load balancing
- **Hystrix**: Circuit breaker for fault tolerance
- **Auto Scaling Groups**: Dynamic instance management

### Amazon's Scaling Architecture

**Multi-tier Scaling:**
1. **CDN Layer**: CloudFront for global content delivery
2. **Load Balancer Layer**: Application Load Balancers
3. **Application Layer**: Auto Scaling Groups
4. **Database Layer**: RDS with read replicas
5. **Cache Layer**: ElastiCache clusters

## Best Practices

### 1. Scaling Strategy Selection
- **Start with vertical scaling** for simplicity
- **Move to horizontal scaling** for high availability
- **Use hybrid approaches** for optimal cost-performance
- **Consider application architecture** when choosing

### 2. Auto-Scaling Configuration
- **Set appropriate thresholds** to avoid flapping
- **Implement cooldown periods** to prevent rapid scaling
- **Monitor multiple metrics** for better decisions
- **Test scaling policies** under load

### 3. Application Design
- **Design for statelessness** to enable horizontal scaling
- **Implement health checks** for proper load balancing
- **Use connection pooling** for database efficiency
- **Cache frequently accessed data**

### 4. Monitoring and Alerting
- **Monitor resource utilization** continuously
- **Set up alerts** for scaling events
- **Track scaling effectiveness** with metrics
- **Review and adjust** scaling policies regularly

## Common Pitfalls

### 1. Premature Optimization
- **Over-engineering** for scale not yet needed
- **Complex architectures** without clear benefits
- **Ignoring current bottlenecks** while planning for future scale

### 2. Poor Scaling Policies
- **Aggressive scaling** causing resource waste
- **Conservative scaling** leading to poor performance
- **Ignoring application warm-up time**
- **Not considering dependencies**

### 3. State Management Issues
- **Sticky sessions** preventing effective load balancing
- **Shared mutable state** causing scaling bottlenecks
- **Database connections** not scaling with application

### 4. Cost Management
- **Not monitoring scaling costs**
- **Forgetting to scale down** during low usage
- **Using expensive instance types** unnecessarily
- **Ignoring reserved instance opportunities**

---

**Next Chapter**: [Chapter 12: Content Delivery & Edge Computing](chapter-12.md) - CDN, edge networks, and global distribution