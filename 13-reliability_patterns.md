# Chapter 13: Reliability Patterns

## Overview

Reliability patterns are essential for building resilient distributed systems that can handle failures gracefully. This chapter covers circuit breakers, retry patterns, failover mechanisms, and other reliability patterns that ensure system availability and fault tolerance.

## Circuit Breaker Pattern

### Circuit Breaker Implementation

**Advanced Circuit Breaker (Python)**
```python
import time
import asyncio
import threading
from typing import Callable, Any, Optional, Dict, List
from dataclasses import dataclass
from enum import Enum
import statistics
from collections import deque

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, rejecting requests
    HALF_OPEN = "half_open" # Testing if service recovered

@dataclass
class CircuitBreakerConfig:
    failure_threshold: int = 5          # Number of failures to open circuit
    success_threshold: int = 3          # Number of successes to close circuit
    timeout_duration: float = 60.0      # Seconds to wait before trying half-open
    request_timeout: float = 30.0       # Timeout for individual requests
    slow_call_threshold: float = 5.0    # Seconds to consider a call slow
    slow_call_rate_threshold: float = 0.5  # Percentage of slow calls to open circuit
    minimum_throughput: int = 10        # Minimum requests before evaluating
    sliding_window_size: int = 100      # Size of sliding window for metrics

class CircuitBreakerException(Exception):
    """Exception raised when circuit breaker is open"""
    pass

class CircuitBreakerMetrics:
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.requests = deque(maxlen=window_size)
        self.lock = threading.Lock()
    
    def record_success(self, duration: float):
        """Record a successful request"""
        with self.lock:
            self.requests.append({
                'success': True,
                'duration': duration,
                'timestamp': time.time()
            })
    
    def record_failure(self, duration: float, error: Exception):
        """Record a failed request"""
        with self.lock:
            self.requests.append({
                'success': False,
                'duration': duration,
                'timestamp': time.time(),
                'error': str(error)
            })
    
    def get_failure_rate(self) -> float:
        """Get current failure rate"""
        with self.lock:
            if not self.requests:
                return 0.0
            
            failures = sum(1 for req in self.requests if not req['success'])
            return failures / len(self.requests)
    
    def get_slow_call_rate(self, threshold: float) -> float:
        """Get rate of slow calls"""
        with self.lock:
            if not self.requests:
                return 0.0
            
            slow_calls = sum(1 for req in self.requests if req['duration'] > threshold)
            return slow_calls / len(self.requests)
    
    def get_request_count(self) -> int:
        """Get total request count in window"""
        with self.lock:
            return len(self.requests)
    
    def get_average_duration(self) -> float:
        """Get average request duration"""
        with self.lock:
            if not self.requests:
                return 0.0
            
            durations = [req['duration'] for req in self.requests]
            return statistics.mean(durations)
    
    def get_stats(self) -> Dict:
        """Get comprehensive statistics"""
        with self.lock:
            if not self.requests:
                return {
                    'total_requests': 0,
                    'failure_rate': 0.0,
                    'success_rate': 0.0,
                    'average_duration': 0.0,
                    'slow_call_rate': 0.0
                }
            
            total = len(self.requests)
            failures = sum(1 for req in self.requests if not req['success'])
            successes = total - failures
            durations = [req['duration'] for req in self.requests]
            
            return {
                'total_requests': total,
                'failure_rate': failures / total,
                'success_rate': successes / total,
                'average_duration': statistics.mean(durations),
                'min_duration': min(durations),
                'max_duration': max(durations),
                'slow_call_rate': self.get_slow_call_rate(5.0)
            }

class CircuitBreaker:
    def __init__(self, name: str, config: CircuitBreakerConfig = None):
        self.name = name
        self.config = config or CircuitBreakerConfig()
        self.state = CircuitState.CLOSED
        self.metrics = CircuitBreakerMetrics(self.config.sliding_window_size)
        self.last_failure_time = 0
        self.consecutive_failures = 0
        self.consecutive_successes = 0
        self.lock = threading.Lock()
        
        # State change callbacks
        self.on_state_change: Optional[Callable[[CircuitState, CircuitState], None]] = None
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        # Check if we can make the call
        if not self._can_execute():
            raise CircuitBreakerException(f"Circuit breaker '{self.name}' is OPEN")
        
        start_time = time.time()
        
        try:
            # Execute the function with timeout
            result = await asyncio.wait_for(
                func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs),
                timeout=self.config.request_timeout
            )
            
            # Record success
            duration = time.time() - start_time
            self._on_success(duration)
            
            return result
        
        except Exception as e:
            # Record failure
            duration = time.time() - start_time
            self._on_failure(duration, e)
            raise
    
    def _can_execute(self) -> bool:
        """Check if request can be executed based on current state"""
        with self.lock:
            if self.state == CircuitState.CLOSED:
                return True
            elif self.state == CircuitState.OPEN:
                # Check if timeout has passed
                if time.time() - self.last_failure_time >= self.config.timeout_duration:
                    self._transition_to_half_open()
                    return True
                return False
            elif self.state == CircuitState.HALF_OPEN:
                return True
            
            return False
    
    def _on_success(self, duration: float):
        """Handle successful request"""
        self.metrics.record_success(duration)
        
        with self.lock:
            self.consecutive_failures = 0
            
            if self.state == CircuitState.HALF_OPEN:
                self.consecutive_successes += 1
                if self.consecutive_successes >= self.config.success_threshold:
                    self._transition_to_closed()
    
    def _on_failure(self, duration: float, error: Exception):
        """Handle failed request"""
        self.metrics.record_failure(duration, error)
        
        with self.lock:
            self.consecutive_successes = 0
            self.consecutive_failures += 1
            self.last_failure_time = time.time()
            
            if self.state == CircuitState.HALF_OPEN:
                self._transition_to_open()
            elif self.state == CircuitState.CLOSED:
                self._evaluate_circuit_opening()
    
    def _evaluate_circuit_opening(self):
        """Evaluate whether to open the circuit"""
        # Check if we have enough requests to make a decision
        if self.metrics.get_request_count() < self.config.minimum_throughput:
            return
        
        # Check failure rate
        failure_rate = self.metrics.get_failure_rate()
        slow_call_rate = self.metrics.get_slow_call_rate(self.config.slow_call_threshold)
        
        # Open circuit if failure threshold exceeded
        if (self.consecutive_failures >= self.config.failure_threshold or
            failure_rate > 0.5 or  # 50% failure rate
            slow_call_rate > self.config.slow_call_rate_threshold):
            self._transition_to_open()
    
    def _transition_to_open(self):
        """Transition circuit to OPEN state"""
        old_state = self.state
        self.state = CircuitState.OPEN
        self.consecutive_successes = 0
        
        if self.on_state_change:
            self.on_state_change(old_state, self.state)
    
    def _transition_to_half_open(self):
        """Transition circuit to HALF_OPEN state"""
        old_state = self.state
        self.state = CircuitState.HALF_OPEN
        self.consecutive_successes = 0
        self.consecutive_failures = 0
        
        if self.on_state_change:
            self.on_state_change(old_state, self.state)
    
    def _transition_to_closed(self):
        """Transition circuit to CLOSED state"""
        old_state = self.state
        self.state = CircuitState.CLOSED
        self.consecutive_failures = 0
        
        if self.on_state_change:
            self.on_state_change(old_state, self.state)
    
    def force_open(self):
        """Manually force circuit to OPEN state"""
        with self.lock:
            self._transition_to_open()
    
    def force_closed(self):
        """Manually force circuit to CLOSED state"""
        with self.lock:
            self._transition_to_closed()
    
    def get_state(self) -> CircuitState:
        """Get current circuit state"""
        return self.state
    
    def get_stats(self) -> Dict:
        """Get circuit breaker statistics"""
        metrics_stats = self.metrics.get_stats()
        
        return {
            'name': self.name,
            'state': self.state.value,
            'consecutive_failures': self.consecutive_failures,
            'consecutive_successes': self.consecutive_successes,
            'last_failure_time': self.last_failure_time,
            'metrics': metrics_stats
        }

# Circuit Breaker Registry for managing multiple circuit breakers
class CircuitBreakerRegistry:
    def __init__(self):
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.lock = threading.Lock()
    
    def get_or_create(self, name: str, config: CircuitBreakerConfig = None) -> CircuitBreaker:
        """Get existing circuit breaker or create new one"""
        with self.lock:
            if name not in self.circuit_breakers:
                self.circuit_breakers[name] = CircuitBreaker(name, config)
            return self.circuit_breakers[name]
    
    def get_all_stats(self) -> Dict[str, Dict]:
        """Get statistics for all circuit breakers"""
        with self.lock:
            return {name: cb.get_stats() for name, cb in self.circuit_breakers.items()}
    
    def reset_all(self):
        """Reset all circuit breakers to CLOSED state"""
        with self.lock:
            for cb in self.circuit_breakers.values():
                cb.force_closed()

# Global registry instance
circuit_registry = CircuitBreakerRegistry()
```

## Retry Patterns

### Advanced Retry Mechanisms

**Exponential Backoff with Jitter (Python)**
```python
import asyncio
import random
import time
import logging
from typing import Callable, Any, Optional, List, Type
from dataclasses import dataclass
from enum import Enum

class RetryStrategy(Enum):
    FIXED_DELAY = "fixed_delay"
    EXPONENTIAL_BACKOFF = "exponential_backoff"
    LINEAR_BACKOFF = "linear_backoff"
    FIBONACCI_BACKOFF = "fibonacci_backoff"

class JitterType(Enum):
    NONE = "none"
    FULL = "full"
    EQUAL = "equal"
    DECORRELATED = "decorrelated"

@dataclass
class RetryConfig:
    max_attempts: int = 3
    strategy: RetryStrategy = RetryStrategy.EXPONENTIAL_BACKOFF
    base_delay: float = 1.0
    max_delay: float = 60.0
    multiplier: float = 2.0
    jitter_type: JitterType = JitterType.FULL
    retryable_exceptions: List[Type[Exception]] = None
    non_retryable_exceptions: List[Type[Exception]] = None
    retry_on_result: Optional[Callable[[Any], bool]] = None

class RetryExhaustedException(Exception):
    """Exception raised when all retry attempts are exhausted"""
    def __init__(self, attempts: int, last_exception: Exception):
        self.attempts = attempts
        self.last_exception = last_exception
        super().__init__(f"Retry exhausted after {attempts} attempts. Last error: {last_exception}")

class RetryMetrics:
    def __init__(self):
        self.total_attempts = 0
        self.successful_attempts = 0
        self.failed_attempts = 0
        self.retry_attempts = 0
        self.total_delay = 0.0
        self.lock = threading.Lock()
    
    def record_attempt(self, success: bool, delay: float = 0.0, is_retry: bool = False):
        """Record retry attempt"""
        with self.lock:
            self.total_attempts += 1
            if success:
                self.successful_attempts += 1
            else:
                self.failed_attempts += 1
            
            if is_retry:
                self.retry_attempts += 1
                self.total_delay += delay
    
    def get_stats(self) -> Dict:
        """Get retry statistics"""
        with self.lock:
            success_rate = (self.successful_attempts / self.total_attempts * 100) if self.total_attempts > 0 else 0
            avg_delay = (self.total_delay / self.retry_attempts) if self.retry_attempts > 0 else 0
            
            return {
                'total_attempts': self.total_attempts,
                'successful_attempts': self.successful_attempts,
                'failed_attempts': self.failed_attempts,
                'retry_attempts': self.retry_attempts,
                'success_rate_percent': success_rate,
                'average_retry_delay': avg_delay,
                'total_delay': self.total_delay
            }

class RetryHandler:
    def __init__(self, config: RetryConfig = None):
        self.config = config or RetryConfig()
        self.metrics = RetryMetrics()
        self.logger = logging.getLogger(__name__)
    
    async def execute(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with retry logic"""
        last_exception = None
        
        for attempt in range(1, self.config.max_attempts + 1):
            try:
                start_time = time.time()
                
                # Execute the function
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                # Check if result should trigger retry
                if self.config.retry_on_result and self.config.retry_on_result(result):
                    raise Exception(f"Result-based retry triggered: {result}")
                
                # Success
                self.metrics.record_attempt(success=True, is_retry=(attempt > 1))
                self.logger.info(f"Function succeeded on attempt {attempt}")
                return result
            
            except Exception as e:
                last_exception = e
                
                # Check if exception is retryable
                if not self._is_retryable_exception(e):
                    self.metrics.record_attempt(success=False)
                    self.logger.error(f"Non-retryable exception: {e}")
                    raise
                
                # If this was the last attempt, don't retry
                if attempt == self.config.max_attempts:
                    self.metrics.record_attempt(success=False)
                    break
                
                # Calculate delay for next attempt
                delay = self._calculate_delay(attempt)
                self.metrics.record_attempt(success=False, delay=delay, is_retry=True)
                
                self.logger.warning(f"Attempt {attempt} failed: {e}. Retrying in {delay:.2f}s")
                
                # Wait before retry
                await asyncio.sleep(delay)
        
        # All attempts exhausted
        raise RetryExhaustedException(self.config.max_attempts, last_exception)
    
    def _is_retryable_exception(self, exception: Exception) -> bool:
        """Check if exception is retryable"""
        # Check non-retryable exceptions first
        if self.config.non_retryable_exceptions:
            for exc_type in self.config.non_retryable_exceptions:
                if isinstance(exception, exc_type):
                    return False
        
        # Check retryable exceptions
        if self.config.retryable_exceptions:
            for exc_type in self.config.retryable_exceptions:
                if isinstance(exception, exc_type):
                    return True
            return False  # Not in retryable list
        
        # Default: retry most exceptions except specific ones
        non_retryable_defaults = [
            ValueError,
            TypeError,
            AttributeError,
            KeyError,
            IndexError
        ]
        
        return not any(isinstance(exception, exc_type) for exc_type in non_retryable_defaults)
    
    def _calculate_delay(self, attempt: int) -> float:
        """Calculate delay for retry attempt"""
        if self.config.strategy == RetryStrategy.FIXED_DELAY:
            delay = self.config.base_delay
        
        elif self.config.strategy == RetryStrategy.EXPONENTIAL_BACKOFF:
            delay = self.config.base_delay * (self.config.multiplier ** (attempt - 1))
        
        elif self.config.strategy == RetryStrategy.LINEAR_BACKOFF:
            delay = self.config.base_delay * attempt
        
        elif self.config.strategy == RetryStrategy.FIBONACCI_BACKOFF:
            delay = self.config.base_delay * self._fibonacci(attempt)
        
        else:
            delay = self.config.base_delay
        
        # Apply maximum delay limit
        delay = min(delay, self.config.max_delay)
        
        # Apply jitter
        delay = self._apply_jitter(delay, attempt)
        
        return delay
    
    def _fibonacci(self, n: int) -> int:
        """Calculate nth Fibonacci number"""
        if n <= 1:
            return n
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b
    
    def _apply_jitter(self, delay: float, attempt: int) -> float:
        """Apply jitter to delay"""
        if self.config.jitter_type == JitterType.NONE:
            return delay
        
        elif self.config.jitter_type == JitterType.FULL:
            # Random delay between 0 and calculated delay
            return random.uniform(0, delay)
        
        elif self.config.jitter_type == JitterType.EQUAL:
            # Half fixed delay + half random
            return delay / 2 + random.uniform(0, delay / 2)
        
        elif self.config.jitter_type == JitterType.DECORRELATED:
            # Decorrelated jitter (AWS recommendation)
            if attempt == 1:
                return random.uniform(0, delay)
            else:
                return random.uniform(self.config.base_delay, delay * 3)
        
        return delay
    
    def get_stats(self) -> Dict:
        """Get retry handler statistics"""
        return self.metrics.get_stats()

# Decorator for easy retry functionality
def retry(config: RetryConfig = None):
    """Decorator to add retry functionality to functions"""
    def decorator(func):
        retry_handler = RetryHandler(config)
        
        async def async_wrapper(*args, **kwargs):
            return await retry_handler.execute(func, *args, **kwargs)
        
        def sync_wrapper(*args, **kwargs):
            return asyncio.run(retry_handler.execute(func, *args, **kwargs))
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

# Example usage
@retry(RetryConfig(
    max_attempts=5,
    strategy=RetryStrategy.EXPONENTIAL_BACKOFF,
    base_delay=1.0,
    max_delay=30.0,
    jitter_type=JitterType.FULL,
    retryable_exceptions=[ConnectionError, TimeoutError]
))
async def unreliable_api_call(url: str) -> Dict:
    """Example API call with retry logic"""
    # Simulate API call that might fail
    if random.random() < 0.7:  # 70% failure rate
        raise ConnectionError("Network error")
    
    return {"status": "success", "data": "response"}
```

## Failover Patterns

### Active-Passive Failover

**Database Failover Implementation (Python)**
```python
import asyncio
import time
import threading
from typing import List, Optional, Dict, Any, Callable
from dataclasses import dataclass
from enum import Enum
import logging

class NodeStatus(Enum):
    ACTIVE = "active"
    PASSIVE = "passive"
    FAILED = "failed"
    RECOVERING = "recovering"
    MAINTENANCE = "maintenance"

class FailoverStrategy(Enum):
    AUTOMATIC = "automatic"
    MANUAL = "manual"
    SEMI_AUTOMATIC = "semi_automatic"

@dataclass
class DatabaseNode:
    id: str
    host: str
    port: int
    status: NodeStatus
    priority: int  # Lower number = higher priority
    last_health_check: float
    connection_pool: Any = None
    lag_ms: float = 0.0  # Replication lag
    load_percent: float = 0.0

@dataclass
class FailoverConfig:
    health_check_interval: float = 5.0
    failure_threshold: int = 3
    recovery_threshold: int = 2
    max_lag_ms: float = 1000.0
    strategy: FailoverStrategy = FailoverStrategy.AUTOMATIC
    enable_automatic_failback: bool = False
    failback_delay: float = 300.0  # 5 minutes

class HealthChecker:
    def __init__(self, check_function: Callable[[DatabaseNode], bool]):
        self.check_function = check_function
        self.failure_counts: Dict[str, int] = {}
        self.recovery_counts: Dict[str, int] = {}
    
    async def check_node_health(self, node: DatabaseNode) -> bool:
        """Check if a node is healthy"""
        try:
            is_healthy = await self.check_function(node)
            
            if is_healthy:
                # Reset failure count on success
                self.failure_counts[node.id] = 0
                self.recovery_counts[node.id] = self.recovery_counts.get(node.id, 0) + 1
            else:
                # Increment failure count
                self.failure_counts[node.id] = self.failure_counts.get(node.id, 0) + 1
                self.recovery_counts[node.id] = 0
            
            node.last_health_check = time.time()
            return is_healthy
        
        except Exception as e:
            logging.error(f"Health check failed for node {node.id}: {e}")
            self.failure_counts[node.id] = self.failure_counts.get(node.id, 0) + 1
            self.recovery_counts[node.id] = 0
            return False
    
    def should_mark_failed(self, node: DatabaseNode, threshold: int) -> bool:
        """Check if node should be marked as failed"""
        return self.failure_counts.get(node.id, 0) >= threshold
    
    def should_mark_recovered(self, node: DatabaseNode, threshold: int) -> bool:
        """Check if node should be marked as recovered"""
        return self.recovery_counts.get(node.id, 0) >= threshold

class DatabaseFailoverManager:
    def __init__(self, config: FailoverConfig):
        self.config = config
        self.nodes: List[DatabaseNode] = []
        self.active_node: Optional[DatabaseNode] = None
        self.health_checker: Optional[HealthChecker] = None
        self.monitoring_task: Optional[asyncio.Task] = None
        self.lock = threading.Lock()
        self.logger = logging.getLogger(__name__)
        
        # Callbacks
        self.on_failover: Optional[Callable[[DatabaseNode, DatabaseNode], None]] = None
        self.on_failback: Optional[Callable[[DatabaseNode, DatabaseNode], None]] = None
        self.on_node_status_change: Optional[Callable[[DatabaseNode, NodeStatus, NodeStatus], None]] = None
    
    def add_node(self, node: DatabaseNode):
        """Add a database node to the cluster"""
        with self.lock:
            self.nodes.append(node)
            self.nodes.sort(key=lambda n: n.priority)  # Sort by priority
            
            # Set first node as active if none is set
            if not self.active_node and node.status == NodeStatus.ACTIVE:
                self.active_node = node
    
    def set_health_checker(self, health_check_function: Callable[[DatabaseNode], bool]):
        """Set the health check function"""
        self.health_checker = HealthChecker(health_check_function)
    
    async def start_monitoring(self):
        """Start health monitoring"""
        if not self.health_checker:
            raise ValueError("Health checker not configured")
        
        self.monitoring_task = asyncio.create_task(self._monitoring_loop())
        self.logger.info("Database failover monitoring started")
    
    async def stop_monitoring(self):
        """Stop health monitoring"""
        if self.monitoring_task:
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
        
        self.logger.info("Database failover monitoring stopped")
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while True:
            try:
                await self._check_all_nodes()
                await self._evaluate_failover_conditions()
                await asyncio.sleep(self.config.health_check_interval)
            
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(self.config.health_check_interval)
    
    async def _check_all_nodes(self):
        """Check health of all nodes"""
        tasks = []
        
        for node in self.nodes:
            if node.status != NodeStatus.MAINTENANCE:
                task = asyncio.create_task(self.health_checker.check_node_health(node))
                tasks.append((node, task))
        
        # Wait for all health checks to complete
        for node, task in tasks:
            try:
                is_healthy = await task
                await self._update_node_status(node, is_healthy)
            except Exception as e:
                self.logger.error(f"Health check failed for node {node.id}: {e}")
                await self._update_node_status(node, False)
    
    async def _update_node_status(self, node: DatabaseNode, is_healthy: bool):
        """Update node status based on health check"""
        old_status = node.status
        
        if is_healthy:
            if node.status == NodeStatus.FAILED:
                if self.health_checker.should_mark_recovered(node, self.config.recovery_threshold):
                    node.status = NodeStatus.PASSIVE
                    self.logger.info(f"Node {node.id} recovered")
            elif node.status == NodeStatus.RECOVERING:
                if self.health_checker.should_mark_recovered(node, self.config.recovery_threshold):
                    node.status = NodeStatus.PASSIVE
                    self.logger.info(f"Node {node.id} fully recovered")
        else:
            if node.status in [NodeStatus.ACTIVE, NodeStatus.PASSIVE]:
                if self.health_checker.should_mark_failed(node, self.config.failure_threshold):
                    node.status = NodeStatus.FAILED
                    self.logger.warning(f"Node {node.id} marked as failed")
        
        # Notify status change
        if old_status != node.status and self.on_node_status_change:
            self.on_node_status_change(node, old_status, node.status)
    
    async def _evaluate_failover_conditions(self):
        """Evaluate if failover is needed"""
        with self.lock:
            # Check if active node is still healthy
            if (self.active_node and 
                self.active_node.status == NodeStatus.FAILED and
                self.config.strategy in [FailoverStrategy.AUTOMATIC, FailoverStrategy.SEMI_AUTOMATIC]):
                
                await self._perform_failover()
            
            # Check for automatic failback
            if (self.config.enable_automatic_failback and
                self.config.strategy == FailoverStrategy.AUTOMATIC):
                await self._evaluate_failback()
    
    async def _perform_failover(self):
        """Perform failover to next available node"""
        old_active = self.active_node
        new_active = self._select_best_passive_node()
        
        if not new_active:
            self.logger.critical("No healthy passive nodes available for failover!")
            return
        
        # Perform the failover
        if old_active:
            old_active.status = NodeStatus.FAILED
        
        new_active.status = NodeStatus.ACTIVE
        self.active_node = new_active
        
        self.logger.critical(f"Failover completed: {old_active.id if old_active else 'None'} -> {new_active.id}")
        
        # Notify failover
        if self.on_failover:
            self.on_failover(old_active, new_active)
    
    async def _evaluate_failback(self):
        """Evaluate if failback to higher priority node is possible"""
        if not self.active_node:
            return
        
        # Find highest priority healthy node
        best_node = None
        for node in self.nodes:
            if (node.status == NodeStatus.PASSIVE and
                node.priority < self.active_node.priority and
                time.time() - node.last_health_check < self.config.failback_delay):
                
                if not best_node or node.priority < best_node.priority:
                    best_node = node
        
        if best_node:
            await self._perform_failback(best_node)
    
    async def _perform_failback(self, target_node: DatabaseNode):
        """Perform failback to target node"""
        old_active = self.active_node
        
        # Switch roles
        old_active.status = NodeStatus.PASSIVE
        target_node.status = NodeStatus.ACTIVE
        self.active_node = target_node
        
        self.logger.info(f"Failback completed: {old_active.id} -> {target_node.id}")
        
        # Notify failback
        if self.on_failback:
            self.on_failback(old_active, target_node)
    
    def _select_best_passive_node(self) -> Optional[DatabaseNode]:
        """Select the best passive node for failover"""
        candidates = [
            node for node in self.nodes
            if node.status == NodeStatus.PASSIVE and node.lag_ms <= self.config.max_lag_ms
        ]
        
        if not candidates:
            # Fallback to any passive node if no low-lag nodes available
            candidates = [node for node in self.nodes if node.status == NodeStatus.PASSIVE]
        
        if not candidates:
            return None
        
        # Select node with highest priority (lowest priority number)
        return min(candidates, key=lambda n: (n.priority, n.lag_ms, n.load_percent))
    
    async def manual_failover(self, target_node_id: str) -> bool:
        """Manually trigger failover to specific node"""
        target_node = next((n for n in self.nodes if n.id == target_node_id), None)
        
        if not target_node:
            self.logger.error(f"Target node {target_node_id} not found")
            return False
        
        if target_node.status not in [NodeStatus.PASSIVE, NodeStatus.RECOVERING]:
            self.logger.error(f"Target node {target_node_id} is not in a valid state for failover")
            return False
        
        with self.lock:
            old_active = self.active_node
            
            # Perform manual failover
            if old_active:
                old_active.status = NodeStatus.PASSIVE
            
            target_node.status = NodeStatus.ACTIVE
            self.active_node = target_node
            
            self.logger.info(f"Manual failover completed: {old_active.id if old_active else 'None'} -> {target_node.id}")
            
            # Notify failover
            if self.on_failover:
                self.on_failover(old_active, target_node)
            
            return True
    
    def get_cluster_status(self) -> Dict:
        """Get current cluster status"""
        with self.lock:
            return {
                'active_node': self.active_node.id if self.active_node else None,
                'total_nodes': len(self.nodes),
                'healthy_nodes': len([n for n in self.nodes if n.status in [NodeStatus.ACTIVE, NodeStatus.PASSIVE]]),
                'failed_nodes': len([n for n in self.nodes if n.status == NodeStatus.FAILED]),
                'nodes': [
                    {
                        'id': node.id,
                        'host': node.host,
                        'port': node.port,
                        'status': node.status.value,
                        'priority': node.priority,
                        'lag_ms': node.lag_ms,
                        'load_percent': node.load_percent,
                        'last_health_check': node.last_health_check
                    }
                    for node in self.nodes
                ]
            }

# Example health check function
async def database_health_check(node: DatabaseNode) -> bool:
    """Example database health check"""
    try:
        # Simulate database connection check
        # In real implementation, this would check actual database connectivity
        import random
        
        # Simulate some nodes being unhealthy
        if node.id == "db-node-2" and random.random() < 0.3:
            return False
        
        # Update node metrics
        node.lag_ms = random.uniform(0, 500)
        node.load_percent = random.uniform(10, 80)
        
        return True
    
    except Exception:
        return False
```

## Bulkhead Pattern

### Resource Isolation

**Thread Pool Isolation (Python)**
```python
import asyncio
import threading
import time
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor, Future
from enum import Enum

class BulkheadType(Enum):
    THREAD_POOL = "thread_pool"
    SEMAPHORE = "semaphore"
    CONNECTION_POOL = "connection_pool"

@dataclass
class BulkheadConfig:
    name: str
    bulkhead_type: BulkheadType
    max_concurrent: int
    queue_size: int = 0
    timeout_seconds: float = 30.0
    enable_metrics: bool = True

class BulkheadMetrics:
    def __init__(self):
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.rejected_requests = 0
        self.timeout_requests = 0
        self.current_active = 0
        self.max_active = 0
        self.total_wait_time = 0.0
        self.lock = threading.Lock()
    
    def record_request_start(self):
        with self.lock:
            self.total_requests += 1
            self.current_active += 1
            self.max_active = max(self.max_active, self.current_active)
    
    def record_request_end(self, success: bool, wait_time: float = 0.0, 
                          timeout: bool = False, rejected: bool = False):
        with self.lock:
            self.current_active -= 1
            self.total_wait_time += wait_time
            
            if rejected:
                self.rejected_requests += 1
            elif timeout:
                self.timeout_requests += 1
            elif success:
                self.successful_requests += 1
            else:
                self.failed_requests += 1
    
    def get_stats(self) -> Dict:
        with self.lock:
            avg_wait_time = (self.total_wait_time / self.total_requests) if self.total_requests > 0 else 0
            success_rate = (self.successful_requests / self.total_requests * 100) if self.total_requests > 0 else 0
            
            return {
                'total_requests': self.total_requests,
                'successful_requests': self.successful_requests,
                'failed_requests': self.failed_requests,
                'rejected_requests': self.rejected_requests,
                'timeout_requests': self.timeout_requests,
                'current_active': self.current_active,
                'max_active': self.max_active,
                'success_rate_percent': success_rate,
                'average_wait_time': avg_wait_time
            }

class ThreadPoolBulkhead:
    def __init__(self, config: BulkheadConfig):
        self.config = config
        self.executor = ThreadPoolExecutor(
            max_workers=config.max_concurrent,
            thread_name_prefix=f"bulkhead-{config.name}"
        )
        self.metrics = BulkheadMetrics() if config.enable_metrics else None
        self.semaphore = asyncio.Semaphore(config.max_concurrent)
    
    async def execute(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function in isolated thread pool"""
        start_time = time.time()
        
        if self.metrics:
            self.metrics.record_request_start()
        
        try:
            # Acquire semaphore with timeout
            try:
                await asyncio.wait_for(
                    self.semaphore.acquire(),
                    timeout=self.config.timeout_seconds
                )
            except asyncio.TimeoutError:
                wait_time = time.time() - start_time
                if self.metrics:
                    self.metrics.record_request_end(False, wait_time, timeout=True)
                raise TimeoutError(f"Bulkhead {self.config.name} timeout waiting for slot")
            
            wait_time = time.time() - start_time
            
            try:
                # Execute function in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(self.executor, func, *args, **kwargs)
                
                if self.metrics:
                    self.metrics.record_request_end(True, wait_time)
                
                return result
            
            finally:
                self.semaphore.release()
        
        except Exception as e:
            wait_time = time.time() - start_time
            if self.metrics:
                self.metrics.record_request_end(False, wait_time)
            raise
    
    def shutdown(self):
        """Shutdown the thread pool"""
        self.executor.shutdown(wait=True)
    
    def get_stats(self) -> Dict:
        """Get bulkhead statistics"""
        base_stats = {
            'name': self.config.name,
            'type': self.config.bulkhead_type.value,
            'max_concurrent': self.config.max_concurrent,
            'timeout_seconds': self.config.timeout_seconds
        }
        
        if self.metrics:
            base_stats.update(self.metrics.get_stats())
        
        return base_stats

class SemaphoreBulkhead:
    def __init__(self, config: BulkheadConfig):
        self.config = config
        self.semaphore = asyncio.Semaphore(config.max_concurrent)
        self.metrics = BulkheadMetrics() if config.enable_metrics else None
    
    async def execute(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with semaphore-based isolation"""
        start_time = time.time()
        
        if self.metrics:
            self.metrics.record_request_start()
        
        try:
            # Acquire semaphore with timeout
            try:
                await asyncio.wait_for(
                    self.semaphore.acquire(),
                    timeout=self.config.timeout_seconds
                )
            except asyncio.TimeoutError:
                wait_time = time.time() - start_time
                if self.metrics:
                    self.metrics.record_request_end(False, wait_time, timeout=True)
                raise TimeoutError(f"Bulkhead {self.config.name} timeout waiting for slot")
            
            wait_time = time.time() - start_time
            
            try:
                # Execute function
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                if self.metrics:
                    self.metrics.record_request_end(True, wait_time)
                
                return result
            
            finally:
                self.semaphore.release()
        
        except Exception as e:
            wait_time = time.time() - start_time
            if self.metrics:
                self.metrics.record_request_end(False, wait_time)
            raise
    
    def get_stats(self) -> Dict:
        """Get bulkhead statistics"""
        base_stats = {
            'name': self.config.name,
            'type': self.config.bulkhead_type.value,
            'max_concurrent': self.config.max_concurrent,
            'timeout_seconds': self.config.timeout_seconds
        }
        
        if self.metrics:
            base_stats.update(self.metrics.get_stats())
        
        return base_stats

class BulkheadRegistry:
    def __init__(self):
        self.bulkheads: Dict[str, Any] = {}
        self.lock = threading.Lock()
    
    def create_bulkhead(self, config: BulkheadConfig) -> Any:
        """Create and register a bulkhead"""
        with self.lock:
            if config.name in self.bulkheads:
                return self.bulkheads[config.name]
            
            if config.bulkhead_type == BulkheadType.THREAD_POOL:
                bulkhead = ThreadPoolBulkhead(config)
            elif config.bulkhead_type == BulkheadType.SEMAPHORE:
                bulkhead = SemaphoreBulkhead(config)
            else:
                raise ValueError(f"Unsupported bulkhead type: {config.bulkhead_type}")
            
            self.bulkheads[config.name] = bulkhead
            return bulkhead
    
    def get_bulkhead(self, name: str) -> Optional[Any]:
        """Get existing bulkhead"""
        return self.bulkheads.get(name)
    
    def get_all_stats(self) -> Dict[str, Dict]:
        """Get statistics for all bulkheads"""
        with self.lock:
            return {name: bulkhead.get_stats() for name, bulkhead in self.bulkheads.items()}
    
    def shutdown_all(self):
        """Shutdown all bulkheads"""
        with self.lock:
            for bulkhead in self.bulkheads.values():
                if hasattr(bulkhead, 'shutdown'):
                    bulkhead.shutdown()

# Global registry
bulkhead_registry = BulkheadRegistry()
```

## Real-World Examples

### Netflix's Hystrix Pattern

**Hystrix-inspired Implementation:**
```
[Service Call] → [Circuit Breaker] → [Bulkhead] → [Timeout] → [Fallback]
                      ↓               ↓           ↓          ↓
                 [Metrics] → [Dashboard] → [Alerts] → [Auto-scaling]
```

**Key Features:**
- **Circuit Breaker**: Prevents cascading failures
- **Bulkhead**: Isolates thread pools per service
- **Timeout**: Prevents hanging requests
- **Fallback**: Provides degraded functionality
- **Real-time Monitoring**: Hystrix Dashboard

### AWS Auto Scaling

**Multi-tier Scaling Strategy:**
```
[CloudWatch Metrics] → [Auto Scaling Groups] → [Launch Templates]
         ↓                      ↓                    ↓
[Custom Metrics] → [Scaling Policies] → [Instance Management]
```

**Scaling Triggers:**
- **CPU Utilization**: Scale based on compute load
- **Request Count**: Scale based on traffic volume
- **Custom Metrics**: Scale based on business metrics
- **Predictive Scaling**: Scale based on forecasted demand

## Best Practices

### 1. Circuit Breaker Design
- **Set appropriate thresholds** based on service characteristics
- **Implement proper fallback mechanisms** for degraded service
- **Monitor circuit breaker state changes** and alert on frequent trips
- **Use different circuit breakers** for different failure modes

### 2. Retry Strategy
- **Use exponential backoff with jitter** to avoid thundering herd
- **Set maximum retry limits** to prevent infinite loops
- **Distinguish between retryable and non-retryable errors**
- **Implement circuit breakers** alongside retry logic

### 3. Failover Planning
- **Test failover procedures regularly** with chaos engineering
- **Implement health checks** that accurately reflect service state
- **Plan for data consistency** during failover scenarios
- **Document failover procedures** and train operations teams

### 4. Bulkhead Implementation
- **Isolate critical resources** from non-critical workloads
- **Size bulkheads appropriately** based on expected load
- **Monitor bulkhead utilization** and adjust as needed
- **Implement graceful degradation** when bulkheads are full

## Common Pitfalls

### 1. Circuit Breaker Misconfiguration
- **Too sensitive thresholds** causing unnecessary circuit trips
- **Too lenient thresholds** not protecting against failures
- **Missing fallback logic** leaving users with error pages
- **Not considering different failure types** (timeout vs error)

### 2. Retry Logic Issues
- **Retry storms** overwhelming already struggling services
- **Infinite retry loops** without proper exit conditions
- **Not implementing backoff** causing constant hammering
- **Retrying non-idempotent operations** causing data corruption

### 3. Failover Problems
- **Split-brain scenarios** with multiple active nodes
- **Data loss during failover** due to replication lag
- **Inadequate health checks** missing subtle failures
- **Manual failover dependencies** slowing recovery

### 4. Resource Isolation Failures
- **Shared resources** defeating bulkhead isolation
- **Undersized bulkheads** causing resource starvation
- **Missing monitoring** of bulkhead effectiveness
- **Complex dependencies** crossing bulkhead boundaries

---

**Next Chapter**: [Chapter 14: Real-World System Design](chapter-14.md) - Case studies of large-scale systems