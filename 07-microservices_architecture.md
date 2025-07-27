# Chapter 07: Microservices Architecture

## Overview

Microservices architecture is a design approach where applications are built as a collection of loosely coupled, independently deployable services. Each service is responsible for a specific business capability and communicates with other services through well-defined APIs.

### Key Characteristics
- **Single Responsibility:** Each service focuses on one business capability
- **Decentralized:** Services manage their own data and business logic
- **Independent Deployment:** Services can be deployed independently
- **Technology Diversity:** Different services can use different technologies
- **Fault Isolation:** Failure in one service doesn't bring down the entire system

## Microservices vs Monoliths

### Monolithic Architecture

```
┌─────────────────────────────────────┐
│           Monolithic App            │
├─────────────────────────────────────┤
│  User Interface                     │
├─────────────────────────────────────┤
│  Business Logic                     │
│  ├─ User Management                 │
│  ├─ Order Processing               │
│  ├─ Payment Processing             │
│  ├─ Inventory Management           │
│  └─ Notification Service           │
├─────────────────────────────────────┤
│  Data Access Layer                  │
├─────────────────────────────────────┤
│  Single Database                    │
└─────────────────────────────────────┘
```

### Microservices Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Web App   │  │ Mobile App  │  │   Admin     │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
              ┌─────────┴─────────┐
              │   API Gateway     │
              └─────────┬─────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ User Service │ │Order Service│ │Pay Service  │
│   ┌─────┐    │ │   ┌─────┐   │ │   ┌─────┐   │
│   │ DB  │    │ │   │ DB  │   │ │   │ DB  │   │
│   └─────┘    │ │   └─────┘   │ │   └─────┘   │
└──────────────┘ └─────────────┘ └─────────────┘
```

## Service Design Patterns

### 1. Database per Service

Each microservice owns its data and database schema.

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import asyncio
import json
from dataclasses import dataclass
from datetime import datetime

@dataclass
class User:
    user_id: str
    email: str
    name: str
    created_at: datetime
    is_active: bool = True

class UserRepository(ABC):
    @abstractmethod
    async def create_user(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def get_user(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def update_user(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def delete_user(self, user_id: str) -> bool:
        pass

class PostgreSQLUserRepository(UserRepository):
    def __init__(self, connection_pool):
        self.pool = connection_pool
    
    async def create_user(self, user: User) -> User:
        async with self.pool.acquire() as conn:
            query = """
                INSERT INTO users (user_id, email, name, created_at, is_active)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            """
            row = await conn.fetchrow(
                query, user.user_id, user.email, user.name, 
                user.created_at, user.is_active
            )
            return User(**dict(row))
    
    async def get_user(self, user_id: str) -> Optional[User]:
        async with self.pool.acquire() as conn:
            query = "SELECT * FROM users WHERE user_id = $1"
            row = await conn.fetchrow(query, user_id)
            return User(**dict(row)) if row else None
    
    async def update_user(self, user: User) -> User:
        async with self.pool.acquire() as conn:
            query = """
                UPDATE users 
                SET email = $2, name = $3, is_active = $4
                WHERE user_id = $1
                RETURNING *
            """
            row = await conn.fetchrow(
                query, user.user_id, user.email, user.name, user.is_active
            )
            return User(**dict(row))
    
    async def delete_user(self, user_id: str) -> bool:
        async with self.pool.acquire() as conn:
            query = "DELETE FROM users WHERE user_id = $1"
            result = await conn.execute(query, user_id)
            return result == "DELETE 1"

class UserService:
    def __init__(self, repository: UserRepository, event_publisher):
        self.repository = repository
        self.event_publisher = event_publisher
    
    async def create_user(self, user_data: Dict) -> User:
        """Create a new user"""
        user = User(
            user_id=user_data['user_id'],
            email=user_data['email'],
            name=user_data['name'],
            created_at=datetime.utcnow()
        )
        
        # Save to database
        created_user = await self.repository.create_user(user)
        
        # Publish domain event
        await self.event_publisher.publish('user.created', {
            'user_id': created_user.user_id,
            'email': created_user.email,
            'name': created_user.name,
            'created_at': created_user.created_at.isoformat()
        })
        
        return created_user
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return await self.repository.get_user(user_id)
    
    async def update_user(self, user_id: str, updates: Dict) -> User:
        """Update user information"""
        user = await self.repository.get_user(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        # Apply updates
        for key, value in updates.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        # Save changes
        updated_user = await self.repository.update_user(user)
        
        # Publish domain event
        await self.event_publisher.publish('user.updated', {
            'user_id': updated_user.user_id,
            'updates': updates
        })
        
        return updated_user
    
    async def deactivate_user(self, user_id: str) -> User:
        """Deactivate user account"""
        return await self.update_user(user_id, {'is_active': False})
```

### 2. API Gateway Pattern

Centralized entry point for all client requests.

```python
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import asyncio
from typing import Dict, Any, Optional
import time
import logging
from dataclasses import dataclass
from enum import Enum

class ServiceStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

@dataclass
class ServiceConfig:
    name: str
    base_url: str
    timeout: int = 30
    retries: int = 3
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: int = 60

class CircuitBreaker:
    def __init__(self, threshold: int = 5, timeout: int = 60):
        self.threshold = threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def can_execute(self) -> bool:
        """Check if request can be executed"""
        if self.state == 'CLOSED':
            return True
        elif self.state == 'OPEN':
            if time.time() - self.last_failure_time > self.timeout:
                self.state = 'HALF_OPEN'
                return True
            return False
        else:  # HALF_OPEN
            return True
    
    def record_success(self):
        """Record successful request"""
        self.failure_count = 0
        self.state = 'CLOSED'
    
    def record_failure(self):
        """Record failed request"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.threshold:
            self.state = 'OPEN'

class ServiceRegistry:
    def __init__(self):
        self.services = {}
        self.circuit_breakers = {}
        self.health_status = {}
    
    def register_service(self, config: ServiceConfig):
        """Register a service"""
        self.services[config.name] = config
        self.circuit_breakers[config.name] = CircuitBreaker(
            config.circuit_breaker_threshold,
            config.circuit_breaker_timeout
        )
        self.health_status[config.name] = ServiceStatus.HEALTHY
    
    def get_service(self, name: str) -> Optional[ServiceConfig]:
        """Get service configuration"""
        return self.services.get(name)
    
    def get_circuit_breaker(self, name: str) -> Optional[CircuitBreaker]:
        """Get circuit breaker for service"""
        return self.circuit_breakers.get(name)
    
    def update_health_status(self, name: str, status: ServiceStatus):
        """Update service health status"""
        self.health_status[name] = status
    
    def get_health_status(self, name: str) -> ServiceStatus:
        """Get service health status"""
        return self.health_status.get(name, ServiceStatus.UNHEALTHY)

class APIGateway:
    def __init__(self):
        self.app = FastAPI(title="API Gateway", version="1.0.0")
        self.service_registry = ServiceRegistry()
        self.http_client = httpx.AsyncClient()
        self.security = HTTPBearer()
        
        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Register routes
        self.setup_routes()
        
        # Register services
        self.register_services()
    
    def register_services(self):
        """Register all microservices"""
        services = [
            ServiceConfig("user-service", "http://user-service:8001"),
            ServiceConfig("order-service", "http://order-service:8002"),
            ServiceConfig("payment-service", "http://payment-service:8003"),
            ServiceConfig("inventory-service", "http://inventory-service:8004"),
            ServiceConfig("notification-service", "http://notification-service:8005")
        ]
        
        for service in services:
            self.service_registry.register_service(service)
    
    def setup_routes(self):
        """Setup API Gateway routes"""
        
        @self.app.middleware("http")
        async def add_request_id(request: Request, call_next):
            """Add request ID for tracing"""
            request_id = f"req_{int(time.time() * 1000)}"
            request.state.request_id = request_id
            
            response = await call_next(request)
            response.headers["X-Request-ID"] = request_id
            return response
        
        @self.app.get("/health")
        async def health_check():
            """Gateway health check"""
            service_health = {}
            overall_healthy = True
            
            for name in self.service_registry.services.keys():
                status = self.service_registry.get_health_status(name)
                service_health[name] = status.value
                if status != ServiceStatus.HEALTHY:
                    overall_healthy = False
            
            return {
                "status": "healthy" if overall_healthy else "degraded",
                "services": service_health,
                "timestamp": time.time()
            }
        
        # User service routes
        @self.app.post("/api/v1/users")
        async def create_user(user_data: Dict[str, Any], token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("user-service", "POST", "/users", json=user_data, token=token.credentials)
        
        @self.app.get("/api/v1/users/{user_id}")
        async def get_user(user_id: str, token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("user-service", "GET", f"/users/{user_id}", token=token.credentials)
        
        @self.app.put("/api/v1/users/{user_id}")
        async def update_user(user_id: str, updates: Dict[str, Any], token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("user-service", "PUT", f"/users/{user_id}", json=updates, token=token.credentials)
        
        # Order service routes
        @self.app.post("/api/v1/orders")
        async def create_order(order_data: Dict[str, Any], token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("order-service", "POST", "/orders", json=order_data, token=token.credentials)
        
        @self.app.get("/api/v1/orders/{order_id}")
        async def get_order(order_id: str, token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("order-service", "GET", f"/orders/{order_id}", token=token.credentials)
        
        # Payment service routes
        @self.app.post("/api/v1/payments")
        async def process_payment(payment_data: Dict[str, Any], token: HTTPAuthorizationCredentials = Depends(self.security)):
            return await self.proxy_request("payment-service", "POST", "/payments", json=payment_data, token=token.credentials)
    
    async def proxy_request(self, service_name: str, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """Proxy request to microservice"""
        service = self.service_registry.get_service(service_name)
        if not service:
            raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
        
        circuit_breaker = self.service_registry.get_circuit_breaker(service_name)
        
        # Check circuit breaker
        if not circuit_breaker.can_execute():
            raise HTTPException(status_code=503, detail=f"Service {service_name} is currently unavailable")
        
        url = f"{service.base_url}{path}"
        
        try:
            # Add authentication header if token provided
            headers = kwargs.pop('headers', {})
            if 'token' in kwargs:
                headers['Authorization'] = f"Bearer {kwargs.pop('token')}"
            
            # Make request with timeout and retries
            for attempt in range(service.retries):
                try:
                    response = await self.http_client.request(
                        method=method,
                        url=url,
                        headers=headers,
                        timeout=service.timeout,
                        **kwargs
                    )
                    
                    if response.status_code < 500:
                        circuit_breaker.record_success()
                        
                        if response.status_code >= 400:
                            raise HTTPException(status_code=response.status_code, detail=response.text)
                        
                        return response.json()
                    
                    # Server error, retry
                    if attempt == service.retries - 1:
                        raise HTTPException(status_code=response.status_code, detail=response.text)
                    
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    
                except httpx.TimeoutException:
                    if attempt == service.retries - 1:
                        circuit_breaker.record_failure()
                        raise HTTPException(status_code=504, detail=f"Service {service_name} timeout")
                    
                    await asyncio.sleep(2 ** attempt)
                
                except httpx.ConnectError:
                    if attempt == service.retries - 1:
                        circuit_breaker.record_failure()
                        raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable")
                    
                    await asyncio.sleep(2 ** attempt)
        
        except Exception as e:
            circuit_breaker.record_failure()
            logging.error(f"Error proxying request to {service_name}: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

# Initialize API Gateway
gateway = APIGateway()
app = gateway.app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3. Service Discovery

Automatic detection and registration of services.

```python
import asyncio
import json
import time
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, asdict
from abc import ABC, abstractmethod
import aioredis
import consul.aio
from datetime import datetime, timedelta

@dataclass
class ServiceInstance:
    service_name: str
    instance_id: str
    host: str
    port: int
    health_check_url: str
    metadata: Dict[str, str]
    registered_at: datetime
    last_heartbeat: datetime
    status: str = "healthy"  # healthy, unhealthy, unknown
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        data['registered_at'] = self.registered_at.isoformat()
        data['last_heartbeat'] = self.last_heartbeat.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ServiceInstance':
        data['registered_at'] = datetime.fromisoformat(data['registered_at'])
        data['last_heartbeat'] = datetime.fromisoformat(data['last_heartbeat'])
        return cls(**data)

class ServiceDiscovery(ABC):
    @abstractmethod
    async def register_service(self, instance: ServiceInstance) -> bool:
        pass
    
    @abstractmethod
    async def deregister_service(self, service_name: str, instance_id: str) -> bool:
        pass
    
    @abstractmethod
    async def discover_services(self, service_name: str) -> List[ServiceInstance]:
        pass
    
    @abstractmethod
    async def get_healthy_instances(self, service_name: str) -> List[ServiceInstance]:
        pass
    
    @abstractmethod
    async def heartbeat(self, service_name: str, instance_id: str) -> bool:
        pass

class RedisServiceDiscovery(ServiceDiscovery):
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis = None
        self.heartbeat_interval = 30  # seconds
        self.instance_ttl = 90  # seconds
    
    async def connect(self):
        """Connect to Redis"""
        self.redis = await aioredis.from_url(self.redis_url)
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
    
    def _service_key(self, service_name: str) -> str:
        return f"services:{service_name}"
    
    def _instance_key(self, service_name: str, instance_id: str) -> str:
        return f"services:{service_name}:instances:{instance_id}"
    
    async def register_service(self, instance: ServiceInstance) -> bool:
        """Register service instance"""
        try:
            service_key = self._service_key(instance.service_name)
            instance_key = self._instance_key(instance.service_name, instance.instance_id)
            
            # Store instance data
            await self.redis.hset(instance_key, mapping=instance.to_dict())
            await self.redis.expire(instance_key, self.instance_ttl)
            
            # Add to service set
            await self.redis.sadd(service_key, instance.instance_id)
            await self.redis.expire(service_key, self.instance_ttl)
            
            return True
        except Exception as e:
            print(f"Error registering service: {e}")
            return False
    
    async def deregister_service(self, service_name: str, instance_id: str) -> bool:
        """Deregister service instance"""
        try:
            service_key = self._service_key(service_name)
            instance_key = self._instance_key(service_name, instance_id)
            
            # Remove from service set
            await self.redis.srem(service_key, instance_id)
            
            # Delete instance data
            await self.redis.delete(instance_key)
            
            return True
        except Exception as e:
            print(f"Error deregistering service: {e}")
            return False
    
    async def discover_services(self, service_name: str) -> List[ServiceInstance]:
        """Discover all instances of a service"""
        try:
            service_key = self._service_key(service_name)
            instance_ids = await self.redis.smembers(service_key)
            
            instances = []
            for instance_id in instance_ids:
                instance_key = self._instance_key(service_name, instance_id.decode())
                instance_data = await self.redis.hgetall(instance_key)
                
                if instance_data:
                    # Convert bytes to strings
                    instance_dict = {k.decode(): v.decode() for k, v in instance_data.items()}
                    instance_dict['metadata'] = json.loads(instance_dict.get('metadata', '{}'))
                    instances.append(ServiceInstance.from_dict(instance_dict))
            
            return instances
        except Exception as e:
            print(f"Error discovering services: {e}")
            return []
    
    async def get_healthy_instances(self, service_name: str) -> List[ServiceInstance]:
        """Get only healthy instances of a service"""
        all_instances = await self.discover_services(service_name)
        healthy_instances = []
        
        for instance in all_instances:
            # Check if instance is still alive based on last heartbeat
            time_since_heartbeat = datetime.utcnow() - instance.last_heartbeat
            if time_since_heartbeat.total_seconds() < self.instance_ttl:
                if instance.status == "healthy":
                    healthy_instances.append(instance)
        
        return healthy_instances
    
    async def heartbeat(self, service_name: str, instance_id: str) -> bool:
        """Send heartbeat for service instance"""
        try:
            instance_key = self._instance_key(service_name, instance_id)
            
            # Update last heartbeat
            await self.redis.hset(instance_key, "last_heartbeat", datetime.utcnow().isoformat())
            await self.redis.expire(instance_key, self.instance_ttl)
            
            # Refresh service set TTL
            service_key = self._service_key(service_name)
            await self.redis.expire(service_key, self.instance_ttl)
            
            return True
        except Exception as e:
            print(f"Error sending heartbeat: {e}")
            return False
    
    async def start_health_checker(self):
        """Start background health checker"""
        while True:
            try:
                # Get all services
                service_keys = await self.redis.keys("services:*")
                
                for service_key in service_keys:
                    service_key_str = service_key.decode()
                    if ":instances:" in service_key_str:
                        continue
                    
                    service_name = service_key_str.split(":")[1]
                    instances = await self.discover_services(service_name)
                    
                    for instance in instances:
                        # Check if instance is still responding
                        is_healthy = await self._check_instance_health(instance)
                        
                        # Update instance status
                        instance_key = self._instance_key(service_name, instance.instance_id)
                        new_status = "healthy" if is_healthy else "unhealthy"
                        await self.redis.hset(instance_key, "status", new_status)
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                print(f"Health checker error: {e}")
                await asyncio.sleep(30)
    
    async def _check_instance_health(self, instance: ServiceInstance) -> bool:
        """Check if service instance is healthy"""
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(instance.health_check_url, timeout=5) as response:
                    return response.status == 200
        except Exception:
            return False

class ServiceRegistrar:
    def __init__(self, discovery: ServiceDiscovery, instance: ServiceInstance):
        self.discovery = discovery
        self.instance = instance
        self.heartbeat_task = None
    
    async def register(self) -> bool:
        """Register this service instance"""
        success = await self.discovery.register_service(self.instance)
        if success:
            # Start heartbeat task
            self.heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        return success
    
    async def deregister(self) -> bool:
        """Deregister this service instance"""
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
        
        return await self.discovery.deregister_service(
            self.instance.service_name,
            self.instance.instance_id
        )
    
    async def _heartbeat_loop(self):
        """Send periodic heartbeats"""
        while True:
            try:
                await self.discovery.heartbeat(
                    self.instance.service_name,
                    self.instance.instance_id
                )
                await asyncio.sleep(30)  # Send heartbeat every 30 seconds
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"Heartbeat error: {e}")
                await asyncio.sleep(30)

class LoadBalancer:
    def __init__(self, discovery: ServiceDiscovery):
        self.discovery = discovery
        self.round_robin_counters = {}
    
    async def get_instance(self, service_name: str, strategy: str = "round_robin") -> Optional[ServiceInstance]:
        """Get service instance using load balancing strategy"""
        healthy_instances = await self.discovery.get_healthy_instances(service_name)
        
        if not healthy_instances:
            return None
        
        if strategy == "round_robin":
            return self._round_robin_select(service_name, healthy_instances)
        elif strategy == "random":
            import random
            return random.choice(healthy_instances)
        elif strategy == "least_connections":
            # In a real implementation, you'd track connection counts
            return healthy_instances[0]
        else:
            return healthy_instances[0]
    
    def _round_robin_select(self, service_name: str, instances: List[ServiceInstance]) -> ServiceInstance:
        """Round-robin load balancing"""
        if service_name not in self.round_robin_counters:
            self.round_robin_counters[service_name] = 0
        
        index = self.round_robin_counters[service_name] % len(instances)
        self.round_robin_counters[service_name] += 1
        
        return instances[index]

# Example usage
async def example_service_discovery():
    # Initialize service discovery
    discovery = RedisServiceDiscovery()
    await discovery.connect()
    
    # Create service instance
    instance = ServiceInstance(
        service_name="user-service",
        instance_id="user-service-001",
        host="localhost",
        port=8001,
        health_check_url="http://localhost:8001/health",
        metadata={"version": "1.0.0", "region": "us-east-1"},
        registered_at=datetime.utcnow(),
        last_heartbeat=datetime.utcnow()
    )
    
    # Register service
    registrar = ServiceRegistrar(discovery, instance)
    await registrar.register()
    
    # Discover services
    load_balancer = LoadBalancer(discovery)
    selected_instance = await load_balancer.get_instance("user-service")
    
    if selected_instance:
        print(f"Selected instance: {selected_instance.host}:{selected_instance.port}")
    
    # Cleanup
    await registrar.deregister()
    await discovery.disconnect()
```

## Inter-Service Communication

### 1. Synchronous Communication (HTTP/REST)

```python
import aiohttp
import asyncio
from typing import Dict, Any, Optional
from dataclasses import dataclass
import time
import logging

@dataclass
class ServiceCall:
    service_name: str
    method: str
    endpoint: str
    payload: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, str]] = None
    timeout: int = 30
    retries: int = 3

class ServiceClient:
    def __init__(self, discovery: ServiceDiscovery, load_balancer: LoadBalancer):
        self.discovery = discovery
        self.load_balancer = load_balancer
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def call_service(self, call: ServiceCall) -> Dict[str, Any]:
        """Make service-to-service call"""
        for attempt in range(call.retries):
            try:
                # Get service instance
                instance = await self.load_balancer.get_instance(call.service_name)
                if not instance:
                    raise Exception(f"No healthy instances found for {call.service_name}")
                
                # Build URL
                url = f"http://{instance.host}:{instance.port}{call.endpoint}"
                
                # Prepare headers
                headers = call.headers or {}
                headers.update({
                    'Content-Type': 'application/json',
                    'X-Service-Name': 'calling-service',
                    'X-Request-ID': f"req_{int(time.time() * 1000)}"
                })
                
                # Make request
                async with self.session.request(
                    method=call.method,
                    url=url,
                    json=call.payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=call.timeout)
                ) as response:
                    
                    if response.status < 500:
                        if response.status >= 400:
                            error_text = await response.text()
                            raise Exception(f"Client error {response.status}: {error_text}")
                        
                        return await response.json()
                    
                    # Server error, retry
                    if attempt == call.retries - 1:
                        error_text = await response.text()
                        raise Exception(f"Server error {response.status}: {error_text}")
                    
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
            
            except aiohttp.ClientTimeout:
                if attempt == call.retries - 1:
                    raise Exception(f"Timeout calling {call.service_name}")
                await asyncio.sleep(2 ** attempt)
            
            except aiohttp.ClientError as e:
                if attempt == call.retries - 1:
                    raise Exception(f"Connection error calling {call.service_name}: {e}")
                await asyncio.sleep(2 ** attempt)
        
        raise Exception(f"Failed to call {call.service_name} after {call.retries} attempts")

# Example: Order Service calling User Service
class OrderService:
    def __init__(self, service_client: ServiceClient):
        self.service_client = service_client
    
    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create order with user validation"""
        user_id = order_data['user_id']
        
        # Validate user exists
        user_call = ServiceCall(
            service_name="user-service",
            method="GET",
            endpoint=f"/users/{user_id}"
        )
        
        try:
            user = await self.service_client.call_service(user_call)
            if not user.get('is_active'):
                raise Exception("User account is not active")
        except Exception as e:
            raise Exception(f"User validation failed: {e}")
        
        # Create order
        order = {
            'order_id': f"order_{int(time.time())}",
            'user_id': user_id,
            'items': order_data['items'],
            'total': order_data['total'],
            'status': 'pending',
            'created_at': time.time()
        }
        
        # Save order (database operation)
        # ...
        
        return order
```

### 2. Asynchronous Communication (Events)

```python
import asyncio
import json
from typing import Dict, Any, Callable, List
from dataclasses import dataclass
from datetime import datetime
import aioredis

@dataclass
class DomainEvent:
    event_type: str
    aggregate_id: str
    event_data: Dict[str, Any]
    event_id: str
    timestamp: datetime
    version: int = 1
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'event_type': self.event_type,
            'aggregate_id': self.aggregate_id,
            'event_data': self.event_data,
            'event_id': self.event_id,
            'timestamp': self.timestamp.isoformat(),
            'version': self.version
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DomainEvent':
        return cls(
            event_type=data['event_type'],
            aggregate_id=data['aggregate_id'],
            event_data=data['event_data'],
            event_id=data['event_id'],
            timestamp=datetime.fromisoformat(data['timestamp']),
            version=data.get('version', 1)
        )

class EventBus:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis = None
        self.subscribers = {}
        self.running = False
    
    async def connect(self):
        """Connect to Redis"""
        self.redis = await aioredis.from_url(self.redis_url)
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
    
    async def publish_event(self, event: DomainEvent):
        """Publish domain event"""
        channel = f"events:{event.event_type}"
        message = json.dumps(event.to_dict())
        await self.redis.publish(channel, message)
        
        # Also store in event store for replay
        event_key = f"event_store:{event.aggregate_id}:{event.event_id}"
        await self.redis.hset(event_key, mapping=event.to_dict())
    
    def subscribe(self, event_type: str, handler: Callable[[DomainEvent], None]):
        """Subscribe to event type"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
    
    async def start_listening(self):
        """Start listening for events"""
        self.running = True
        pubsub = self.redis.pubsub()
        
        # Subscribe to all event channels
        for event_type in self.subscribers.keys():
            await pubsub.subscribe(f"events:{event_type}")
        
        try:
            while self.running:
                message = await pubsub.get_message(timeout=1.0)
                if message and message['type'] == 'message':
                    await self._handle_message(message)
        finally:
            await pubsub.unsubscribe()
    
    async def _handle_message(self, message):
        """Handle received message"""
        try:
            channel = message['channel'].decode()
            event_type = channel.split(':')[1]
            
            event_data = json.loads(message['data'].decode())
            event = DomainEvent.from_dict(event_data)
            
            # Call all handlers for this event type
            if event_type in self.subscribers:
                for handler in self.subscribers[event_type]:
                    try:
                        await handler(event)
                    except Exception as e:
                        logging.error(f"Error handling event {event.event_id}: {e}")
        
        except Exception as e:
            logging.error(f"Error processing message: {e}")
    
    def stop_listening(self):
        """Stop listening for events"""
        self.running = False

# Example: Event-driven order processing
class OrderEventHandlers:
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup event handlers"""
        self.event_bus.subscribe('user.created', self.handle_user_created)
        self.event_bus.subscribe('order.created', self.handle_order_created)
        self.event_bus.subscribe('payment.processed', self.handle_payment_processed)
        self.event_bus.subscribe('order.shipped', self.handle_order_shipped)
    
    async def handle_user_created(self, event: DomainEvent):
        """Handle user creation event"""
        user_data = event.event_data
        print(f"New user created: {user_data['email']}")
        
        # Send welcome email
        welcome_event = DomainEvent(
            event_type='notification.send',
            aggregate_id=user_data['user_id'],
            event_data={
                'type': 'welcome_email',
                'recipient': user_data['email'],
                'template': 'welcome',
                'data': user_data
            },
            event_id=f"welcome_{user_data['user_id']}_{int(time.time())}",
            timestamp=datetime.utcnow()
        )
        
        await self.event_bus.publish_event(welcome_event)
    
    async def handle_order_created(self, event: DomainEvent):
        """Handle order creation event"""
        order_data = event.event_data
        print(f"New order created: {order_data['order_id']}")
        
        # Reserve inventory
        inventory_event = DomainEvent(
            event_type='inventory.reserve',
            aggregate_id=order_data['order_id'],
            event_data={
                'order_id': order_data['order_id'],
                'items': order_data['items']
            },
            event_id=f"inventory_reserve_{order_data['order_id']}_{int(time.time())}",
            timestamp=datetime.utcnow()
        )
        
        await self.event_bus.publish_event(inventory_event)
    
    async def handle_payment_processed(self, event: DomainEvent):
        """Handle payment processing event"""
        payment_data = event.event_data
        
        if payment_data['status'] == 'success':
            # Create shipping event
            shipping_event = DomainEvent(
                event_type='shipping.create_label',
                aggregate_id=payment_data['order_id'],
                event_data={
                    'order_id': payment_data['order_id'],
                    'amount': payment_data['amount']
                },
                event_id=f"shipping_{payment_data['order_id']}_{int(time.time())}",
                timestamp=datetime.utcnow()
            )
            
            await self.event_bus.publish_event(shipping_event)
        else:
            # Handle payment failure
            print(f"Payment failed for order {payment_data['order_id']}")
    
    async def handle_order_shipped(self, event: DomainEvent):
        """Handle order shipping event"""
        shipping_data = event.event_data
        
        # Send shipping notification
        notification_event = DomainEvent(
            event_type='notification.send',
            aggregate_id=shipping_data['order_id'],
            event_data={
                'type': 'shipping_notification',
                'order_id': shipping_data['order_id'],
                'tracking_number': shipping_data['tracking_number']
            },
            event_id=f"ship_notify_{shipping_data['order_id']}_{int(time.time())}",
            timestamp=datetime.utcnow()
        )
        
        await self.event_bus.publish_event(notification_event)
```

## Data Management Patterns

### 1. Saga Pattern

Manage distributed transactions across multiple services.

```python
import asyncio
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import uuid

class SagaStatus(Enum):
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATING = "compensating"
    COMPENSATED = "compensated"

class StepStatus(Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    COMPENSATED = "compensated"

@dataclass
class SagaStep:
    step_id: str
    service_name: str
    action: str
    compensation_action: str
    payload: Dict[str, Any]
    status: StepStatus = StepStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    executed_at: Optional[datetime] = None
    compensated_at: Optional[datetime] = None

@dataclass
class Saga:
    saga_id: str
    saga_type: str
    steps: List[SagaStep]
    status: SagaStatus = SagaStatus.STARTED
    current_step: int = 0
    started_at: datetime = None
    completed_at: Optional[datetime] = None
    context: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.started_at is None:
            self.started_at = datetime.utcnow()
        if self.context is None:
            self.context = {}

class SagaOrchestrator:
    def __init__(self, service_client: ServiceClient, event_bus: EventBus):
        self.service_client = service_client
        self.event_bus = event_bus
        self.active_sagas = {}
        self.setup_event_handlers()
    
    def setup_event_handlers(self):
        """Setup event handlers for saga responses"""
        self.event_bus.subscribe('saga.step.completed', self.handle_step_completed)
        self.event_bus.subscribe('saga.step.failed', self.handle_step_failed)
    
    async def start_saga(self, saga: Saga) -> str:
        """Start saga execution"""
        self.active_sagas[saga.saga_id] = saga
        
        # Publish saga started event
        await self.event_bus.publish_event(DomainEvent(
            event_type='saga.started',
            aggregate_id=saga.saga_id,
            event_data={
                'saga_id': saga.saga_id,
                'saga_type': saga.saga_type,
                'steps_count': len(saga.steps)
            },
            event_id=f"saga_start_{saga.saga_id}",
            timestamp=datetime.utcnow()
        ))
        
        # Execute first step
        await self.execute_next_step(saga.saga_id)
        
        return saga.saga_id
    
    async def execute_next_step(self, saga_id: str):
        """Execute next step in saga"""
        saga = self.active_sagas.get(saga_id)
        if not saga or saga.current_step >= len(saga.steps):
            return
        
        step = saga.steps[saga.current_step]
        step.status = StepStatus.PENDING
        
        try:
            # Prepare service call
            call = ServiceCall(
                service_name=step.service_name,
                method="POST",
                endpoint=f"/{step.action}",
                payload={
                    **step.payload,
                    'saga_id': saga_id,
                    'step_id': step.step_id,
                    'context': saga.context
                }
            )
            
            # Execute step
            result = await self.service_client.call_service(call)
            
            # Update step status
            step.status = StepStatus.COMPLETED
            step.result = result
            step.executed_at = datetime.utcnow()
            
            # Update saga context with result
            saga.context.update(result.get('context', {}))
            
            # Move to next step
            saga.current_step += 1
            
            # Check if saga is complete
            if saga.current_step >= len(saga.steps):
                await self.complete_saga(saga_id)
            else:
                await self.execute_next_step(saga_id)
        
        except Exception as e:
            # Step failed, start compensation
            step.status = StepStatus.FAILED
            step.error = str(e)
            saga.status = SagaStatus.FAILED
            
            await self.start_compensation(saga_id)
    
    async def start_compensation(self, saga_id: str):
        """Start compensation process"""
        saga = self.active_sagas.get(saga_id)
        if not saga:
            return
        
        saga.status = SagaStatus.COMPENSATING
        
        # Compensate completed steps in reverse order
        for i in range(saga.current_step - 1, -1, -1):
            step = saga.steps[i]
            if step.status == StepStatus.COMPLETED:
                await self.compensate_step(saga_id, step)
        
        saga.status = SagaStatus.COMPENSATED
        saga.completed_at = datetime.utcnow()
        
        # Publish saga compensated event
        await self.event_bus.publish_event(DomainEvent(
            event_type='saga.compensated',
            aggregate_id=saga_id,
            event_data={
                'saga_id': saga_id,
                'saga_type': saga.saga_type,
                'reason': 'step_failure'
            },
            event_id=f"saga_compensated_{saga_id}",
            timestamp=datetime.utcnow()
        ))
    
    async def compensate_step(self, saga_id: str, step: SagaStep):
        """Compensate a completed step"""
        try:
            call = ServiceCall(
                service_name=step.service_name,
                method="POST",
                endpoint=f"/{step.compensation_action}",
                payload={
                    'saga_id': saga_id,
                    'step_id': step.step_id,
                    'original_result': step.result
                }
            )
            
            await self.service_client.call_service(call)
            step.status = StepStatus.COMPENSATED
            step.compensated_at = datetime.utcnow()
        
        except Exception as e:
            print(f"Compensation failed for step {step.step_id}: {e}")
    
    async def complete_saga(self, saga_id: str):
        """Complete saga successfully"""
        saga = self.active_sagas.get(saga_id)
        if not saga:
            return
        
        saga.status = SagaStatus.COMPLETED
        saga.completed_at = datetime.utcnow()
        
        # Publish saga completed event
        await self.event_bus.publish_event(DomainEvent(
            event_type='saga.completed',
            aggregate_id=saga_id,
            event_data={
                'saga_id': saga_id,
                'saga_type': saga.saga_type,
                'duration': (saga.completed_at - saga.started_at).total_seconds()
            },
            event_id=f"saga_completed_{saga_id}",
            timestamp=datetime.utcnow()
        ))
        
        # Remove from active sagas
        del self.active_sagas[saga_id]
    
    async def handle_step_completed(self, event: DomainEvent):
        """Handle step completion event"""
        # This would be called by services to notify step completion
        pass
    
    async def handle_step_failed(self, event: DomainEvent):
        """Handle step failure event"""
        # This would be called by services to notify step failure
        pass

# Example: Order Processing Saga
class OrderProcessingSaga:
    def __init__(self, orchestrator: SagaOrchestrator):
        self.orchestrator = orchestrator
    
    async def process_order(self, order_data: Dict[str, Any]) -> str:
        """Process order using saga pattern"""
        saga_id = str(uuid.uuid4())
        
        steps = [
            SagaStep(
                step_id="validate_user",
                service_name="user-service",
                action="validate_user",
                compensation_action="noop",
                payload={'user_id': order_data['user_id']}
            ),
            SagaStep(
                step_id="reserve_inventory",
                service_name="inventory-service",
                action="reserve_items",
                compensation_action="release_reservation",
                payload={'items': order_data['items']}
            ),
            SagaStep(
                step_id="process_payment",
                service_name="payment-service",
                action="charge_payment",
                compensation_action="refund_payment",
                payload={
                    'amount': order_data['total'],
                    'payment_method': order_data['payment_method']
                }
            ),
            SagaStep(
                step_id="create_order",
                service_name="order-service",
                action="create_order",
                compensation_action="cancel_order",
                payload=order_data
            ),
            SagaStep(
                step_id="send_confirmation",
                service_name="notification-service",
                action="send_order_confirmation",
                compensation_action="send_cancellation_notice",
                payload={
                    'user_id': order_data['user_id'],
                    'order_id': order_data.get('order_id')
                }
            )
        ]
        
        saga = Saga(
            saga_id=saga_id,
            saga_type="order_processing",
            steps=steps,
            context={'order_data': order_data}
        )
        
        return await self.orchestrator.start_saga(saga)
```

## Best Practices

### 1. Service Design
- **Single Responsibility:** Each service should have one clear business purpose
- **Loose Coupling:** Minimize dependencies between services
- **High Cohesion:** Related functionality should be grouped together
- **API Versioning:** Support backward compatibility

### 2. Data Management
- **Database per Service:** Each service owns its data
- **Event Sourcing:** Store events rather than current state
- **CQRS:** Separate read and write models
- **Eventual Consistency:** Accept temporary inconsistency

### 3. Communication
- **Async First:** Prefer asynchronous communication
- **Idempotency:** Design operations to be safely retried
- **Circuit Breakers:** Protect against cascading failures
- **Timeouts:** Set appropriate timeouts for all calls

### 4. Deployment
- **Containerization:** Use containers for consistent deployment
- **Independent Deployment:** Deploy services independently
- **Blue-Green Deployment:** Minimize deployment downtime
- **Health Checks:** Implement comprehensive health monitoring

### 5. Monitoring
- **Distributed Tracing:** Track requests across services
- **Centralized Logging:** Aggregate logs from all services
- **Metrics Collection:** Monitor key performance indicators
- **Alerting:** Set up proactive alerting

## Common Pitfalls

### 1. Distributed Monolith
- **Problem:** Services are too tightly coupled
- **Solution:** Ensure services can be developed and deployed independently

### 2. Data Consistency Issues
- **Problem:** Maintaining consistency across services
- **Solution:** Use eventual consistency and saga patterns

### 3. Network Latency
- **Problem:** Too many service-to-service calls
- **Solution:** Optimize service boundaries and use caching

### 4. Operational Complexity
- **Problem:** Managing many services is complex
- **Solution:** Invest in automation and monitoring tools

## Next Steps

In the next chapter, we'll explore distributed system fundamentals, including the CAP theorem, consistency models, and consensus algorithms that are crucial for building reliable microservices architectures.