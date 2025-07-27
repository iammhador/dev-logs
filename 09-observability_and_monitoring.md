# Chapter 09: Observability & Monitoring

## Overview

Observability is the ability to understand the internal state of a system by examining its external outputs. It's crucial for maintaining system health, debugging issues, and ensuring optimal performance in distributed systems.

## The Three Pillars of Observability

### 1. Logging

**Structured Logging Example (Python)**
```python
import json
import logging
from datetime import datetime
from typing import Dict, Any

class StructuredLogger:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        
    def log(self, level: str, message: str, **kwargs):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": level,
            "message": message,
            "trace_id": kwargs.get("trace_id"),
            "user_id": kwargs.get("user_id"),
            "request_id": kwargs.get("request_id"),
            "metadata": {k: v for k, v in kwargs.items() 
                        if k not in ["trace_id", "user_id", "request_id"]}
        }
        
        self.logger.info(json.dumps(log_entry))
    
    def info(self, message: str, **kwargs):
        self.log("INFO", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        self.log("ERROR", message, **kwargs)
    
    def warn(self, message: str, **kwargs):
        self.log("WARN", message, **kwargs)

# Usage
logger = StructuredLogger("user-service")
logger.info(
    "User login successful",
    user_id="12345",
    trace_id="abc-123",
    ip_address="192.168.1.1",
    duration_ms=150
)
```

### 2. Metrics

**Metrics Collection Example (Python with Prometheus)**
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import functools

class MetricsCollector:
    def __init__(self):
        # Counters
        self.request_count = Counter(
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        )
        
        # Histograms
        self.request_duration = Histogram(
            'http_request_duration_seconds',
            'HTTP request duration',
            ['method', 'endpoint']
        )
        
        # Gauges
        self.active_connections = Gauge(
            'active_connections',
            'Number of active connections'
        )
        
        self.memory_usage = Gauge(
            'memory_usage_bytes',
            'Memory usage in bytes'
        )
    
    def track_request(self, method: str, endpoint: str):
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                start_time = time.time()
                
                try:
                    result = func(*args, **kwargs)
                    status = "200"
                    return result
                except Exception as e:
                    status = "500"
                    raise
                finally:
                    duration = time.time() - start_time
                    
                    # Record metrics
                    self.request_count.labels(
                        method=method,
                        endpoint=endpoint,
                        status=status
                    ).inc()
                    
                    self.request_duration.labels(
                        method=method,
                        endpoint=endpoint
                    ).observe(duration)
            
            return wrapper
        return decorator
    
    def update_active_connections(self, count: int):
        self.active_connections.set(count)
    
    def update_memory_usage(self, bytes_used: int):
        self.memory_usage.set(bytes_used)

# Usage
metrics = MetricsCollector()

@metrics.track_request("GET", "/users")
def get_users():
    # Simulate API call
    time.sleep(0.1)
    return {"users": []}

# Start metrics server
start_http_server(8000)
```

### 3. Distributed Tracing

**OpenTelemetry Tracing Example (Python)**
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
import requests
import time

class DistributedTracer:
    def __init__(self, service_name: str):
        self.service_name = service_name
        
        # Configure tracer
        trace.set_tracer_provider(TracerProvider())
        tracer_provider = trace.get_tracer_provider()
        
        # Configure Jaeger exporter
        jaeger_exporter = JaegerExporter(
            agent_host_name="localhost",
            agent_port=6831,
        )
        
        span_processor = BatchSpanProcessor(jaeger_exporter)
        tracer_provider.add_span_processor(span_processor)
        
        self.tracer = trace.get_tracer(service_name)
        
        # Auto-instrument requests
        RequestsInstrumentor().instrument()
    
    def trace_operation(self, operation_name: str):
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                with self.tracer.start_as_current_span(operation_name) as span:
                    # Add attributes
                    span.set_attribute("service.name", self.service_name)
                    span.set_attribute("operation.name", operation_name)
                    
                    try:
                        result = func(*args, **kwargs)
                        span.set_attribute("operation.status", "success")
                        return result
                    except Exception as e:
                        span.set_attribute("operation.status", "error")
                        span.set_attribute("error.message", str(e))
                        raise
            
            return wrapper
        return decorator
    
    def add_span_attributes(self, **attributes):
        current_span = trace.get_current_span()
        for key, value in attributes.items():
            current_span.set_attribute(key, value)

# Usage
tracer = DistributedTracer("user-service")

@tracer.trace_operation("process_user_request")
def process_user_request(user_id: str):
    tracer.add_span_attributes(user_id=user_id)
    
    # Simulate database call
    with tracer.tracer.start_as_current_span("database_query"):
        time.sleep(0.05)
    
    # Simulate external API call
    with tracer.tracer.start_as_current_span("external_api_call"):
        response = requests.get(f"https://api.example.com/users/{user_id}")
    
    return {"user_id": user_id, "status": "processed"}
```

## Monitoring Strategies

### Health Checks

**Comprehensive Health Check System**
```python
from enum import Enum
from typing import Dict, List, Optional
from dataclasses import dataclass
import asyncio
import aiohttp
import time

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

@dataclass
class HealthCheckResult:
    name: str
    status: HealthStatus
    response_time_ms: float
    message: Optional[str] = None
    details: Optional[Dict] = None

class HealthChecker:
    def __init__(self):
        self.checks: List[callable] = []
    
    def register_check(self, check_func: callable):
        self.checks.append(check_func)
    
    async def run_all_checks(self) -> Dict[str, HealthCheckResult]:
        results = {}
        
        for check in self.checks:
            start_time = time.time()
            try:
                result = await check()
                response_time = (time.time() - start_time) * 1000
                
                if isinstance(result, HealthCheckResult):
                    result.response_time_ms = response_time
                    results[result.name] = result
                else:
                    results[check.__name__] = HealthCheckResult(
                        name=check.__name__,
                        status=HealthStatus.HEALTHY,
                        response_time_ms=response_time
                    )
            except Exception as e:
                response_time = (time.time() - start_time) * 1000
                results[check.__name__] = HealthCheckResult(
                    name=check.__name__,
                    status=HealthStatus.UNHEALTHY,
                    response_time_ms=response_time,
                    message=str(e)
                )
        
        return results
    
    def get_overall_status(self, results: Dict[str, HealthCheckResult]) -> HealthStatus:
        if not results:
            return HealthStatus.UNHEALTHY
        
        statuses = [result.status for result in results.values()]
        
        if all(status == HealthStatus.HEALTHY for status in statuses):
            return HealthStatus.HEALTHY
        elif any(status == HealthStatus.UNHEALTHY for status in statuses):
            return HealthStatus.UNHEALTHY
        else:
            return HealthStatus.DEGRADED

# Health check implementations
async def database_health_check() -> HealthCheckResult:
    try:
        # Simulate database ping
        await asyncio.sleep(0.01)
        return HealthCheckResult(
            name="database",
            status=HealthStatus.HEALTHY,
            response_time_ms=0,
            details={"connection_pool_size": 10, "active_connections": 3}
        )
    except Exception as e:
        return HealthCheckResult(
            name="database",
            status=HealthStatus.UNHEALTHY,
            response_time_ms=0,
            message=str(e)
        )

async def redis_health_check() -> HealthCheckResult:
    try:
        # Simulate Redis ping
        await asyncio.sleep(0.005)
        return HealthCheckResult(
            name="redis",
            status=HealthStatus.HEALTHY,
            response_time_ms=0,
            details={"memory_usage": "45MB", "connected_clients": 12}
        )
    except Exception as e:
        return HealthCheckResult(
            name="redis",
            status=HealthStatus.UNHEALTHY,
            response_time_ms=0,
            message=str(e)
        )

async def external_api_health_check() -> HealthCheckResult:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.example.com/health", timeout=5) as response:
                if response.status == 200:
                    return HealthCheckResult(
                        name="external_api",
                        status=HealthStatus.HEALTHY,
                        response_time_ms=0
                    )
                else:
                    return HealthCheckResult(
                        name="external_api",
                        status=HealthStatus.DEGRADED,
                        response_time_ms=0,
                        message=f"HTTP {response.status}"
                    )
    except Exception as e:
        return HealthCheckResult(
            name="external_api",
            status=HealthStatus.UNHEALTHY,
            response_time_ms=0,
            message=str(e)
        )

# Usage
health_checker = HealthChecker()
health_checker.register_check(database_health_check)
health_checker.register_check(redis_health_check)
health_checker.register_check(external_api_health_check)
```

### Alerting System

**Alert Manager Implementation**
```python
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional
import asyncio
import json
from datetime import datetime, timedelta

class AlertSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class AlertStatus(Enum):
    FIRING = "firing"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"

@dataclass
class Alert:
    name: str
    severity: AlertSeverity
    status: AlertStatus
    message: str
    labels: Dict[str, str]
    timestamp: datetime
    resolved_at: Optional[datetime] = None
    
class AlertRule:
    def __init__(self, name: str, condition: callable, severity: AlertSeverity, 
                 message_template: str, labels: Dict[str, str] = None):
        self.name = name
        self.condition = condition
        self.severity = severity
        self.message_template = message_template
        self.labels = labels or {}
        self.last_fired = None
        self.cooldown_period = timedelta(minutes=5)
    
    def should_fire(self, metrics: Dict) -> bool:
        if self.last_fired and datetime.now() - self.last_fired < self.cooldown_period:
            return False
        return self.condition(metrics)
    
    def create_alert(self, metrics: Dict) -> Alert:
        self.last_fired = datetime.now()
        return Alert(
            name=self.name,
            severity=self.severity,
            status=AlertStatus.FIRING,
            message=self.message_template.format(**metrics),
            labels=self.labels,
            timestamp=datetime.now()
        )

class AlertManager:
    def __init__(self):
        self.rules: List[AlertRule] = []
        self.active_alerts: Dict[str, Alert] = {}
        self.notification_channels: List[callable] = []
    
    def add_rule(self, rule: AlertRule):
        self.rules.append(rule)
    
    def add_notification_channel(self, channel: callable):
        self.notification_channels.append(channel)
    
    async def evaluate_rules(self, metrics: Dict):
        for rule in self.rules:
            if rule.should_fire(metrics):
                alert = rule.create_alert(metrics)
                await self._fire_alert(alert)
            elif rule.name in self.active_alerts:
                await self._resolve_alert(rule.name)
    
    async def _fire_alert(self, alert: Alert):
        self.active_alerts[alert.name] = alert
        
        for channel in self.notification_channels:
            try:
                await channel(alert)
            except Exception as e:
                print(f"Failed to send alert via {channel.__name__}: {e}")
    
    async def _resolve_alert(self, alert_name: str):
        if alert_name in self.active_alerts:
            alert = self.active_alerts[alert_name]
            alert.status = AlertStatus.RESOLVED
            alert.resolved_at = datetime.now()
            
            for channel in self.notification_channels:
                try:
                    await channel(alert)
                except Exception as e:
                    print(f"Failed to send resolution via {channel.__name__}: {e}")
            
            del self.active_alerts[alert_name]

# Notification channels
async def slack_notification(alert: Alert):
    # Simulate Slack notification
    webhook_url = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    
    color = {
        AlertSeverity.INFO: "good",
        AlertSeverity.WARNING: "warning", 
        AlertSeverity.CRITICAL: "danger"
    }[alert.severity]
    
    payload = {
        "attachments": [{
            "color": color,
            "title": f"Alert: {alert.name}",
            "text": alert.message,
            "fields": [
                {"title": "Severity", "value": alert.severity.value, "short": True},
                {"title": "Status", "value": alert.status.value, "short": True},
                {"title": "Time", "value": alert.timestamp.isoformat(), "short": True}
            ]
        }]
    }
    
    print(f"Slack notification: {json.dumps(payload, indent=2)}")

async def email_notification(alert: Alert):
    # Simulate email notification
    print(f"Email notification: {alert.severity.value.upper()} - {alert.name}")
    print(f"Message: {alert.message}")
    print(f"Status: {alert.status.value}")

# Alert rules
def high_cpu_condition(metrics: Dict) -> bool:
    return metrics.get("cpu_usage_percent", 0) > 80

def high_memory_condition(metrics: Dict) -> bool:
    return metrics.get("memory_usage_percent", 0) > 90

def high_error_rate_condition(metrics: Dict) -> bool:
    return metrics.get("error_rate_percent", 0) > 5

# Usage
alert_manager = AlertManager()

# Add rules
alert_manager.add_rule(AlertRule(
    name="high_cpu_usage",
    condition=high_cpu_condition,
    severity=AlertSeverity.WARNING,
    message_template="CPU usage is {cpu_usage_percent}%",
    labels={"service": "web-server"}
))

alert_manager.add_rule(AlertRule(
    name="high_memory_usage",
    condition=high_memory_condition,
    severity=AlertSeverity.CRITICAL,
    message_template="Memory usage is {memory_usage_percent}%",
    labels={"service": "web-server"}
))

alert_manager.add_rule(AlertRule(
    name="high_error_rate",
    condition=high_error_rate_condition,
    severity=AlertSeverity.CRITICAL,
    message_template="Error rate is {error_rate_percent}%",
    labels={"service": "api-gateway"}
))

# Add notification channels
alert_manager.add_notification_channel(slack_notification)
alert_manager.add_notification_channel(email_notification)
```

## Real-World Examples

### Netflix's Observability Stack

**Key Components:**
- **Atlas**: Time-series metrics collection and visualization
- **Mantis**: Real-time stream processing for operational insights
- **Zipkin**: Distributed tracing for request flow analysis
- **Spectator**: Client-side metrics collection library

**Architecture Pattern:**
```
[Applications] → [Spectator] → [Atlas] → [Grafana Dashboards]
      ↓              ↓            ↓
[Log Aggregation] → [ELK Stack] → [Kibana]
      ↓
[Distributed Tracing] → [Zipkin] → [Jaeger UI]
```

### Google's SRE Monitoring

**Four Golden Signals:**
1. **Latency**: Time to process requests
2. **Traffic**: Demand on the system
3. **Errors**: Rate of failed requests
4. **Saturation**: Resource utilization

## Best Practices

### 1. Monitoring Strategy
- **Start with the Four Golden Signals**
- **Implement SLIs (Service Level Indicators) and SLOs (Service Level Objectives)**
- **Use RED metrics (Rate, Errors, Duration) for services**
- **Use USE metrics (Utilization, Saturation, Errors) for resources**

### 2. Alerting Guidelines
- **Alert on symptoms, not causes**
- **Reduce alert fatigue with proper thresholds**
- **Implement alert escalation policies**
- **Use runbooks for common alerts**

### 3. Logging Best Practices
- **Use structured logging (JSON format)**
- **Include correlation IDs for request tracing**
- **Log at appropriate levels (DEBUG, INFO, WARN, ERROR)**
- **Avoid logging sensitive information**

### 4. Metrics Collection
- **Use consistent naming conventions**
- **Avoid high-cardinality labels**
- **Implement proper retention policies**
- **Monitor your monitoring system**

## Common Pitfalls

### 1. Over-Monitoring
- **Too many metrics without clear purpose**
- **Alert fatigue from excessive notifications**
- **Performance impact from excessive instrumentation**

### 2. Under-Monitoring
- **Missing critical business metrics**
- **Insufficient error tracking**
- **Lack of end-to-end visibility**

### 3. Poor Alert Design
- **Alerts that don't require action**
- **Missing context in alert messages**
- **No clear escalation procedures**

### 4. Data Silos
- **Disconnected monitoring tools**
- **Inconsistent data formats**
- **Lack of correlation between metrics, logs, and traces**

---

**Next Chapter**: [Chapter 10: Security & Authentication](chapter-10.md) - OAuth, JWT, API security, and threat mitigation