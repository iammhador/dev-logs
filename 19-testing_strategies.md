# Testing Strategies

## Overview

Testing is a critical aspect of system design that ensures reliability, performance, and correctness at scale. This chapter covers comprehensive testing strategies for distributed systems, from unit tests to chaos engineering.

## Testing Pyramid for Distributed Systems

```
        /\           End-to-End Tests
       /  \          (Few, Expensive)
      /    \
     /      \        Integration Tests
    /        \       (Some, Moderate Cost)
   /          \
  /____________\     Unit Tests
                     (Many, Fast, Cheap)
```

### Unit Testing

**Principles:**
- Test individual components in isolation
- Fast execution (< 100ms per test)
- No external dependencies
- High code coverage (80%+)

```python
import unittest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

class UserService:
    def __init__(self, user_repository, email_service, cache):
        self.user_repository = user_repository
        self.email_service = email_service
        self.cache = cache
    
    def create_user(self, username, email, password):
        # Validate input
        if not username or len(username) < 3:
            raise ValueError("Username must be at least 3 characters")
        
        if not self._is_valid_email(email):
            raise ValueError("Invalid email format")
        
        # Check if user exists
        if self.user_repository.find_by_username(username):
            raise ValueError("Username already exists")
        
        if self.user_repository.find_by_email(email):
            raise ValueError("Email already exists")
        
        # Create user
        user = {
            'username': username,
            'email': email,
            'password_hash': self._hash_password(password),
            'created_at': datetime.utcnow(),
            'is_active': True
        }
        
        user_id = self.user_repository.save(user)
        user['id'] = user_id
        
        # Send welcome email
        self.email_service.send_welcome_email(email, username)
        
        # Cache user
        self.cache.set(f"user:{user_id}", user, ttl=3600)
        
        return user
    
    def _is_valid_email(self, email):
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _hash_password(self, password):
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

class TestUserService(unittest.TestCase):
    def setUp(self):
        self.user_repository = Mock()
        self.email_service = Mock()
        self.cache = Mock()
        self.user_service = UserService(
            self.user_repository,
            self.email_service,
            self.cache
        )
    
    def test_create_user_success(self):
        # Arrange
        username = "testuser"
        email = "test@example.com"
        password = "password123"
        
        self.user_repository.find_by_username.return_value = None
        self.user_repository.find_by_email.return_value = None
        self.user_repository.save.return_value = "user123"
        
        # Act
        result = self.user_service.create_user(username, email, password)
        
        # Assert
        self.assertEqual(result['username'], username)
        self.assertEqual(result['email'], email)
        self.assertEqual(result['id'], "user123")
        self.assertTrue(result['is_active'])
        
        # Verify interactions
        self.user_repository.find_by_username.assert_called_once_with(username)
        self.user_repository.find_by_email.assert_called_once_with(email)
        self.user_repository.save.assert_called_once()
        self.email_service.send_welcome_email.assert_called_once_with(email, username)
        self.cache.set.assert_called_once()
    
    def test_create_user_invalid_username(self):
        # Test short username
        with self.assertRaises(ValueError) as context:
            self.user_service.create_user("ab", "test@example.com", "password123")
        
        self.assertIn("Username must be at least 3 characters", str(context.exception))
    
    def test_create_user_invalid_email(self):
        with self.assertRaises(ValueError) as context:
            self.user_service.create_user("testuser", "invalid-email", "password123")
        
        self.assertIn("Invalid email format", str(context.exception))
    
    def test_create_user_duplicate_username(self):
        self.user_repository.find_by_username.return_value = {"id": "existing"}
        
        with self.assertRaises(ValueError) as context:
            self.user_service.create_user("testuser", "test@example.com", "password123")
        
        self.assertIn("Username already exists", str(context.exception))
    
    def test_create_user_duplicate_email(self):
        self.user_repository.find_by_username.return_value = None
        self.user_repository.find_by_email.return_value = {"id": "existing"}
        
        with self.assertRaises(ValueError) as context:
            self.user_service.create_user("testuser", "test@example.com", "password123")
        
        self.assertIn("Email already exists", str(context.exception))

if __name__ == '__main__':
    unittest.main()
```

### Integration Testing

**Focus Areas:**
- Service-to-service communication
- Database interactions
- External API integrations
- Message queue interactions

```python
import pytest
import asyncio
import aiohttp
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

class IntegrationTestBase:
    @classmethod
    def setup_class(cls):
        # Start test containers
        cls.postgres = PostgresContainer("postgres:13")
        cls.postgres.start()
        
        cls.redis = RedisContainer("redis:6")
        cls.redis.start()
        
        # Setup test database
        cls.db_url = cls.postgres.get_connection_url()
        cls.redis_url = cls.redis.get_connection_url()
    
    @classmethod
    def teardown_class(cls):
        cls.postgres.stop()
        cls.redis.stop()

class TestUserServiceIntegration(IntegrationTestBase):
    def setup_method(self):
        # Initialize services with real dependencies
        self.user_repository = PostgresUserRepository(self.db_url)
        self.email_service = EmailService()
        self.cache = RedisCache(self.redis_url)
        self.user_service = UserService(
            self.user_repository,
            self.email_service,
            self.cache
        )
        
        # Setup test data
        self.user_repository.create_tables()
    
    def teardown_method(self):
        # Clean up test data
        self.user_repository.drop_tables()
        self.cache.flush_all()
    
    def test_user_creation_flow(self):
        # Test complete user creation flow
        username = "integrationtest"
        email = "integration@example.com"
        password = "password123"
        
        # Create user
        user = self.user_service.create_user(username, email, password)
        
        # Verify user in database
        db_user = self.user_repository.find_by_id(user['id'])
        assert db_user is not None
        assert db_user['username'] == username
        assert db_user['email'] == email
        
        # Verify user in cache
        cached_user = self.cache.get(f"user:{user['id']}")
        assert cached_user is not None
        assert cached_user['username'] == username
    
    def test_duplicate_user_handling(self):
        # Create first user
        self.user_service.create_user("testuser", "test@example.com", "password123")
        
        # Try to create duplicate
        with pytest.raises(ValueError, match="Username already exists"):
            self.user_service.create_user("testuser", "other@example.com", "password123")
        
        with pytest.raises(ValueError, match="Email already exists"):
            self.user_service.create_user("otheruser", "test@example.com", "password123")

class TestAPIIntegration:
    @pytest.fixture
    async def client(self):
        # Setup test client
        app = create_app(test_config=True)
        async with aiohttp.ClientSession() as session:
            yield TestClient(app, session)
    
    async def test_user_registration_api(self, client):
        # Test user registration endpoint
        user_data = {
            "username": "apitest",
            "email": "apitest@example.com",
            "password": "password123"
        }
        
        response = await client.post("/api/users", json=user_data)
        
        assert response.status == 201
        data = await response.json()
        assert data['username'] == user_data['username']
        assert data['email'] == user_data['email']
        assert 'password' not in data  # Password should not be returned
    
    async def test_user_login_flow(self, client):
        # Register user
        user_data = {
            "username": "logintest",
            "email": "logintest@example.com",
            "password": "password123"
        }
        
        await client.post("/api/users", json=user_data)
        
        # Login
        login_data = {
            "username": "logintest",
            "password": "password123"
        }
        
        response = await client.post("/api/auth/login", json=login_data)
        
        assert response.status == 200
        data = await response.json()
        assert 'access_token' in data
        assert 'refresh_token' in data
```

### Contract Testing

**Consumer-Driven Contracts:**

```python
import pact
from pact import Consumer, Provider, Like, Term

# Consumer side (User Service)
class TestUserServiceContract:
    def setup_method(self):
        self.pact = Consumer('UserService').has_pact_with(
            Provider('EmailService'),
            host_name='localhost',
            port=1234
        )
        self.pact.start()
    
    def teardown_method(self):
        self.pact.stop()
    
    def test_send_welcome_email(self):
        # Define expected interaction
        expected = {
            'email': 'user@example.com',
            'username': 'testuser',
            'template': 'welcome'
        }
        
        (
            self.pact
            .given('Email service is available')
            .upon_receiving('a request to send welcome email')
            .with_request(
                method='POST',
                path='/api/emails/send',
                headers={'Content-Type': 'application/json'},
                body=expected
            )
            .will_respond_with(
                status=200,
                headers={'Content-Type': 'application/json'},
                body={
                    'message_id': Like('msg_123'),
                    'status': 'sent'
                }
            )
        )
        
        # Test the interaction
        with self.pact:
            email_service = EmailService('http://localhost:1234')
            result = email_service.send_welcome_email(
                'user@example.com',
                'testuser'
            )
            
            assert result['status'] == 'sent'
            assert 'message_id' in result

# Provider side (Email Service)
class TestEmailServiceProvider:
    def test_provider_honors_contract(self):
        # Verify that the Email Service honors the contract
        verifier = pact.Verifier(
            provider='EmailService',
            provider_base_url='http://localhost:8080'
        )
        
        # Run verification
        output, logs = verifier.verify_pacts(
            './pacts/userservice-emailservice.json',
            provider_states_setup_url='http://localhost:8080/setup'
        )
        
        assert output == 0  # Verification passed
```

### Load Testing

**Using Locust:**

```python
from locust import HttpUser, task, between
import random
import string

class UserBehavior(HttpUser):
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def on_start(self):
        """Called when a user starts"""
        self.username = self.generate_username()
        self.email = f"{self.username}@example.com"
        self.password = "password123"
        
        # Register user
        self.register()
        
        # Login user
        self.login()
    
    def generate_username(self):
        return ''.join(random.choices(string.ascii_lowercase, k=8))
    
    def register(self):
        response = self.client.post("/api/users", json={
            "username": self.username,
            "email": self.email,
            "password": self.password
        })
        
        if response.status_code == 201:
            self.user_id = response.json()['id']
    
    def login(self):
        response = self.client.post("/api/auth/login", json={
            "username": self.username,
            "password": self.password
        })
        
        if response.status_code == 200:
            self.access_token = response.json()['access_token']
            self.client.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
    
    @task(3)
    def view_profile(self):
        """View user profile (most common action)"""
        self.client.get(f"/api/users/{self.user_id}")
    
    @task(2)
    def update_profile(self):
        """Update user profile"""
        self.client.put(f"/api/users/{self.user_id}", json={
            "bio": f"Updated bio at {random.randint(1, 1000)}"
        })
    
    @task(1)
    def search_users(self):
        """Search for users"""
        query = random.choice(['test', 'user', 'admin', 'demo'])
        self.client.get(f"/api/users/search?q={query}")
    
    @task(1)
    def logout(self):
        """Logout user"""
        self.client.post("/api/auth/logout")

class AdminBehavior(HttpUser):
    wait_time = between(5, 10)
    weight = 1  # 1 admin for every 10 regular users
    
    def on_start(self):
        # Admin login
        response = self.client.post("/api/auth/login", json={
            "username": "admin",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            self.access_token = response.json()['access_token']
            self.client.headers.update({
                'Authorization': f'Bearer {self.access_token}'
            })
    
    @task
    def view_dashboard(self):
        self.client.get("/api/admin/dashboard")
    
    @task
    def view_users(self):
        self.client.get("/api/admin/users")
    
    @task
    def view_metrics(self):
        self.client.get("/api/admin/metrics")

# Run with: locust -f load_test.py --host=http://localhost:8000
```

### Chaos Engineering

**Chaos Testing Framework:**

```python
import random
import time
import asyncio
from typing import List, Callable
from abc import ABC, abstractmethod

class ChaosExperiment(ABC):
    def __init__(self, name: str, duration: int):
        self.name = name
        self.duration = duration
        self.is_running = False
    
    @abstractmethod
    async def inject_chaos(self):
        """Inject chaos into the system"""
        pass
    
    @abstractmethod
    async def restore_system(self):
        """Restore system to normal state"""
        pass
    
    async def run(self):
        """Run the chaos experiment"""
        print(f"Starting chaos experiment: {self.name}")
        self.is_running = True
        
        try:
            await self.inject_chaos()
            await asyncio.sleep(self.duration)
        finally:
            await self.restore_system()
            self.is_running = False
            print(f"Chaos experiment completed: {self.name}")

class NetworkLatencyExperiment(ChaosExperiment):
    def __init__(self, target_service: str, latency_ms: int, duration: int):
        super().__init__(f"Network Latency - {target_service}", duration)
        self.target_service = target_service
        self.latency_ms = latency_ms
    
    async def inject_chaos(self):
        # Simulate network latency using traffic control
        import subprocess
        
        # Add latency to network interface
        cmd = f"tc qdisc add dev eth0 root netem delay {self.latency_ms}ms"
        subprocess.run(cmd, shell=True, check=True)
        print(f"Injected {self.latency_ms}ms latency")
    
    async def restore_system(self):
        import subprocess
        
        # Remove network latency
        cmd = "tc qdisc del dev eth0 root"
        subprocess.run(cmd, shell=True, check=False)
        print("Restored network latency")

class ServiceFailureExperiment(ChaosExperiment):
    def __init__(self, service_name: str, failure_rate: float, duration: int):
        super().__init__(f"Service Failure - {service_name}", duration)
        self.service_name = service_name
        self.failure_rate = failure_rate
        self.original_handler = None
    
    async def inject_chaos(self):
        # Monkey patch service to introduce failures
        service = get_service(self.service_name)
        self.original_handler = service.handle_request
        
        def chaotic_handler(*args, **kwargs):
            if random.random() < self.failure_rate:
                raise Exception(f"Chaos: {self.service_name} failure")
            return self.original_handler(*args, **kwargs)
        
        service.handle_request = chaotic_handler
        print(f"Injected {self.failure_rate*100}% failure rate to {self.service_name}")
    
    async def restore_system(self):
        service = get_service(self.service_name)
        service.handle_request = self.original_handler
        print(f"Restored {self.service_name} to normal operation")

class DatabaseConnectionExperiment(ChaosExperiment):
    def __init__(self, database_name: str, duration: int):
        super().__init__(f"Database Connection - {database_name}", duration)
        self.database_name = database_name
    
    async def inject_chaos(self):
        # Simulate database connection issues
        db_pool = get_database_pool(self.database_name)
        
        # Close all connections
        await db_pool.close_all_connections()
        print(f"Closed all connections to {self.database_name}")
    
    async def restore_system(self):
        # Restore database connections
        db_pool = get_database_pool(self.database_name)
        await db_pool.restore_connections()
        print(f"Restored connections to {self.database_name}")

class ChaosRunner:
    def __init__(self):
        self.experiments: List[ChaosExperiment] = []
        self.metrics_collector = MetricsCollector()
    
    def add_experiment(self, experiment: ChaosExperiment):
        self.experiments.append(experiment)
    
    async def run_experiment(self, experiment: ChaosExperiment):
        # Start metrics collection
        self.metrics_collector.start_collection(experiment.name)
        
        try:
            await experiment.run()
        except Exception as e:
            print(f"Experiment {experiment.name} failed: {e}")
        finally:
            # Stop metrics collection and analyze
            metrics = self.metrics_collector.stop_collection()
            self.analyze_results(experiment.name, metrics)
    
    def analyze_results(self, experiment_name: str, metrics: dict):
        print(f"\nAnalyzing results for {experiment_name}:")
        print(f"Average response time: {metrics.get('avg_response_time', 0):.2f}ms")
        print(f"Error rate: {metrics.get('error_rate', 0):.2f}%")
        print(f"Throughput: {metrics.get('throughput', 0):.2f} req/s")
        
        # Check if system remained stable
        if metrics.get('error_rate', 0) > 5:  # 5% error threshold
            print("⚠️  System showed instability during chaos")
        else:
            print("✅ System remained stable during chaos")
    
    async def run_all_experiments(self):
        for experiment in self.experiments:
            await self.run_experiment(experiment)
            await asyncio.sleep(30)  # Wait between experiments

class MetricsCollector:
    def __init__(self):
        self.collecting = False
        self.start_time = None
        self.metrics = {}
    
    def start_collection(self, experiment_name: str):
        self.collecting = True
        self.start_time = time.time()
        self.metrics = {
            'response_times': [],
            'error_count': 0,
            'request_count': 0
        }
    
    def record_request(self, response_time: float, is_error: bool):
        if self.collecting:
            self.metrics['response_times'].append(response_time)
            self.metrics['request_count'] += 1
            if is_error:
                self.metrics['error_count'] += 1
    
    def stop_collection(self) -> dict:
        self.collecting = False
        duration = time.time() - self.start_time
        
        response_times = self.metrics['response_times']
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        error_rate = (self.metrics['error_count'] / self.metrics['request_count']) * 100 if self.metrics['request_count'] > 0 else 0
        throughput = self.metrics['request_count'] / duration if duration > 0 else 0
        
        return {
            'avg_response_time': avg_response_time,
            'error_rate': error_rate,
            'throughput': throughput,
            'duration': duration
        }

# Usage example
async def run_chaos_tests():
    runner = ChaosRunner()
    
    # Add experiments
    runner.add_experiment(NetworkLatencyExperiment("user-service", 100, 60))
    runner.add_experiment(ServiceFailureExperiment("email-service", 0.1, 120))
    runner.add_experiment(DatabaseConnectionExperiment("user-db", 90))
    
    # Run all experiments
    await runner.run_all_experiments()

# asyncio.run(run_chaos_tests())
```

### Property-Based Testing

```python
from hypothesis import given, strategies as st, assume
import hypothesis.strategies as st

class TestUserServiceProperties:
    @given(
        username=st.text(min_size=3, max_size=50, alphabet=st.characters(whitelist_categories=['Lu', 'Ll', 'Nd'])),
        email=st.emails(),
        password=st.text(min_size=8, max_size=100)
    )
    def test_user_creation_properties(self, username, email, password):
        # Assume valid inputs
        assume(len(username) >= 3)
        assume('@' in email)
        assume(len(password) >= 8)
        
        user_service = UserService(Mock(), Mock(), Mock())
        user_service.user_repository.find_by_username.return_value = None
        user_service.user_repository.find_by_email.return_value = None
        user_service.user_repository.save.return_value = "user123"
        
        # Property: User creation should always succeed with valid inputs
        user = user_service.create_user(username, email, password)
        
        assert user['username'] == username
        assert user['email'] == email
        assert user['is_active'] is True
        assert 'password' not in user  # Password should not be stored in plain text
    
    @given(
        usernames=st.lists(st.text(min_size=3, max_size=20), min_size=2, max_size=10, unique=True)
    )
    def test_unique_username_property(self, usernames):
        user_service = UserService(Mock(), Mock(), Mock())
        created_users = []
        
        for username in usernames:
            email = f"{username}@example.com"
            
            # Mock repository to return existing users
            user_service.user_repository.find_by_username.side_effect = lambda u: next(
                (user for user in created_users if user['username'] == u), None
            )
            user_service.user_repository.find_by_email.return_value = None
            user_service.user_repository.save.return_value = f"user_{len(created_users)}"
            
            user = user_service.create_user(username, email, "password123")
            created_users.append(user)
        
        # Property: All created users should have unique usernames
        usernames_created = [user['username'] for user in created_users]
        assert len(usernames_created) == len(set(usernames_created))
```

## Testing Best Practices

### Test Organization

**Directory Structure:**
```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/
│   ├── api/
│   ├── database/
│   └── external/
├── contract/
│   ├── consumer/
│   └── provider/
├── load/
├── chaos/
└── fixtures/
    ├── data/
    └── mocks/
```

### Test Data Management

```python
import pytest
import factory
from datetime import datetime

class UserFactory(factory.Factory):
    class Meta:
        model = dict
    
    id = factory.Sequence(lambda n: f"user_{n}")
    username = factory.Sequence(lambda n: f"user_{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    created_at = factory.LazyFunction(datetime.utcnow)
    is_active = True

class PostFactory(factory.Factory):
    class Meta:
        model = dict
    
    id = factory.Sequence(lambda n: f"post_{n}")
    title = factory.Faker('sentence', nb_words=4)
    content = factory.Faker('text', max_nb_chars=500)
    author_id = factory.SubFactory(UserFactory)
    created_at = factory.LazyFunction(datetime.utcnow)

@pytest.fixture
def sample_user():
    return UserFactory()

@pytest.fixture
def sample_users():
    return UserFactory.build_batch(5)

@pytest.fixture
def sample_post(sample_user):
    return PostFactory(author_id=sample_user['id'])
```

### Continuous Testing

**GitHub Actions Workflow:**

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run unit tests
      run: |
        pytest tests/unit/ --cov=src --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v1

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run integration tests
      run: |
        pytest tests/integration/
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379

  load-tests:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        pip install locust
    
    - name: Start application
      run: |
        python app.py &
        sleep 10
    
    - name: Run load tests
      run: |
        locust -f tests/load/locustfile.py --host=http://localhost:8000 --users=50 --spawn-rate=5 --run-time=2m --headless
```

## Common Testing Pitfalls

### Anti-Patterns to Avoid

**1. Testing Implementation Details:**
```python
# BAD: Testing internal implementation
def test_user_service_calls_repository_save():
    user_service.create_user("test", "test@example.com", "password")
    user_repository.save.assert_called_once()  # Testing implementation

# GOOD: Testing behavior
def test_user_service_creates_user():
    user = user_service.create_user("test", "test@example.com", "password")
    assert user['username'] == "test"  # Testing behavior
```

**2. Flaky Tests:**
```python
# BAD: Time-dependent test
def test_user_creation_time():
    user = user_service.create_user("test", "test@example.com", "password")
    assert user['created_at'] == datetime.utcnow()  # Will fail due to timing

# GOOD: Controlled time
def test_user_creation_time():
    with patch('datetime.utcnow') as mock_time:
        mock_time.return_value = datetime(2023, 1, 1)
        user = user_service.create_user("test", "test@example.com", "password")
        assert user['created_at'] == datetime(2023, 1, 1)
```

**3. Over-Mocking:**
```python
# BAD: Mocking everything
def test_complex_business_logic():
    # 20 lines of mocking setup
    # Test becomes meaningless

# GOOD: Test with real objects when possible
def test_complex_business_logic():
    # Use real objects for business logic
    # Mock only external dependencies
```

---

**Next Topic**: [Performance Optimization](performance_optimization.md)
**Previous Topic**: [Data Modeling & Storage](data_modeling_and_storage.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)