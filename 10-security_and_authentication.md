# Chapter 10: Security & Authentication

## Overview

Security is a critical aspect of system design that must be considered at every layer. This chapter covers authentication, authorization, common security threats, and best practices for building secure distributed systems.

## Authentication Mechanisms

### 1. JWT (JSON Web Tokens)

**JWT Implementation Example (Python)**
```python
import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: str
    username: str
    email: str
    roles: list
    password_hash: str

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_token_expire = timedelta(minutes=15)
        self.refresh_token_expire = timedelta(days=7)
    
    def create_access_token(self, user: User) -> str:
        payload = {
            "sub": user.id,
            "username": user.username,
            "email": user.email,
            "roles": user.roles,
            "type": "access",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + self.access_token_expire
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user: User) -> str:
        payload = {
            "sub": user.id,
            "type": "refresh",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + self.refresh_token_expire
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str) -> Optional[Dict]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception("Token has expired")
        except jwt.InvalidTokenError:
            raise Exception("Invalid token")
    
    def refresh_access_token(self, refresh_token: str, user_service) -> str:
        payload = self.verify_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise Exception("Invalid refresh token")
        
        user = user_service.get_user_by_id(payload["sub"])
        if not user:
            raise Exception("User not found")
        
        return self.create_access_token(user)

class PasswordManager:
    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                          password.encode('utf-8'), 
                                          salt.encode('utf-8'), 
                                          100000)
        return salt + password_hash.hex()
    
    @staticmethod
    def verify_password(password: str, stored_hash: str) -> bool:
        salt = stored_hash[:32]
        stored_password_hash = stored_hash[32:]
        
        password_hash = hashlib.pbkdf2_hmac('sha256',
                                          password.encode('utf-8'),
                                          salt.encode('utf-8'),
                                          100000)
        return password_hash.hex() == stored_password_hash

class AuthService:
    def __init__(self, jwt_manager: JWTManager, user_service):
        self.jwt_manager = jwt_manager
        self.user_service = user_service
        self.password_manager = PasswordManager()
    
    def authenticate(self, username: str, password: str) -> Dict[str, str]:
        user = self.user_service.get_user_by_username(username)
        
        if not user or not self.password_manager.verify_password(password, user.password_hash):
            raise Exception("Invalid credentials")
        
        access_token = self.jwt_manager.create_access_token(user)
        refresh_token = self.jwt_manager.create_refresh_token(user)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    def register(self, username: str, email: str, password: str, roles: list = None) -> User:
        if self.user_service.get_user_by_username(username):
            raise Exception("Username already exists")
        
        if self.user_service.get_user_by_email(email):
            raise Exception("Email already exists")
        
        password_hash = self.password_manager.hash_password(password)
        
        user = User(
            id=secrets.token_urlsafe(16),
            username=username,
            email=email,
            roles=roles or ["user"],
            password_hash=password_hash
        )
        
        return self.user_service.create_user(user)
```

### 2. OAuth 2.0 Implementation

**OAuth 2.0 Authorization Server (Python)**
```python
import secrets
import base64
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from dataclasses import dataclass
from urllib.parse import urlencode, parse_qs

@dataclass
class OAuthClient:
    client_id: str
    client_secret: str
    redirect_uris: List[str]
    scopes: List[str]
    grant_types: List[str]

@dataclass
class AuthorizationCode:
    code: str
    client_id: str
    user_id: str
    redirect_uri: str
    scopes: List[str]
    expires_at: datetime

@dataclass
class AccessToken:
    token: str
    client_id: str
    user_id: str
    scopes: List[str]
    expires_at: datetime
    refresh_token: Optional[str] = None

class OAuthServer:
    def __init__(self):
        self.clients: Dict[str, OAuthClient] = {}
        self.authorization_codes: Dict[str, AuthorizationCode] = {}
        self.access_tokens: Dict[str, AccessToken] = {}
        self.refresh_tokens: Dict[str, str] = {}  # refresh_token -> access_token
    
    def register_client(self, redirect_uris: List[str], scopes: List[str], 
                       grant_types: List[str] = None) -> OAuthClient:
        client_id = secrets.token_urlsafe(16)
        client_secret = secrets.token_urlsafe(32)
        
        client = OAuthClient(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uris=redirect_uris,
            scopes=scopes,
            grant_types=grant_types or ["authorization_code", "refresh_token"]
        )
        
        self.clients[client_id] = client
        return client
    
    def authorize(self, client_id: str, redirect_uri: str, scopes: List[str], 
                 user_id: str, state: str = None) -> str:
        client = self.clients.get(client_id)
        if not client:
            raise Exception("Invalid client")
        
        if redirect_uri not in client.redirect_uris:
            raise Exception("Invalid redirect URI")
        
        # Check if requested scopes are allowed
        if not all(scope in client.scopes for scope in scopes):
            raise Exception("Invalid scope")
        
        # Generate authorization code
        code = secrets.token_urlsafe(32)
        auth_code = AuthorizationCode(
            code=code,
            client_id=client_id,
            user_id=user_id,
            redirect_uri=redirect_uri,
            scopes=scopes,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        
        self.authorization_codes[code] = auth_code
        
        # Build redirect URL
        params = {"code": code}
        if state:
            params["state"] = state
        
        return f"{redirect_uri}?{urlencode(params)}"
    
    def exchange_code_for_token(self, client_id: str, client_secret: str, 
                               code: str, redirect_uri: str) -> Dict[str, str]:
        # Verify client credentials
        client = self.clients.get(client_id)
        if not client or client.client_secret != client_secret:
            raise Exception("Invalid client credentials")
        
        # Verify authorization code
        auth_code = self.authorization_codes.get(code)
        if not auth_code:
            raise Exception("Invalid authorization code")
        
        if auth_code.expires_at < datetime.utcnow():
            del self.authorization_codes[code]
            raise Exception("Authorization code expired")
        
        if auth_code.client_id != client_id or auth_code.redirect_uri != redirect_uri:
            raise Exception("Invalid authorization code")
        
        # Generate access token
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        token_obj = AccessToken(
            token=access_token,
            client_id=client_id,
            user_id=auth_code.user_id,
            scopes=auth_code.scopes,
            expires_at=datetime.utcnow() + timedelta(hours=1),
            refresh_token=refresh_token
        )
        
        self.access_tokens[access_token] = token_obj
        self.refresh_tokens[refresh_token] = access_token
        
        # Clean up authorization code
        del self.authorization_codes[code]
        
        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": refresh_token,
            "scope": " ".join(auth_code.scopes)
        }
    
    def refresh_access_token(self, client_id: str, client_secret: str, 
                           refresh_token: str) -> Dict[str, str]:
        # Verify client credentials
        client = self.clients.get(client_id)
        if not client or client.client_secret != client_secret:
            raise Exception("Invalid client credentials")
        
        # Verify refresh token
        old_access_token = self.refresh_tokens.get(refresh_token)
        if not old_access_token:
            raise Exception("Invalid refresh token")
        
        old_token_obj = self.access_tokens.get(old_access_token)
        if not old_token_obj or old_token_obj.client_id != client_id:
            raise Exception("Invalid refresh token")
        
        # Generate new access token
        new_access_token = secrets.token_urlsafe(32)
        new_refresh_token = secrets.token_urlsafe(32)
        
        new_token_obj = AccessToken(
            token=new_access_token,
            client_id=client_id,
            user_id=old_token_obj.user_id,
            scopes=old_token_obj.scopes,
            expires_at=datetime.utcnow() + timedelta(hours=1),
            refresh_token=new_refresh_token
        )
        
        # Clean up old tokens
        if old_access_token in self.access_tokens:
            del self.access_tokens[old_access_token]
        del self.refresh_tokens[refresh_token]
        
        # Store new tokens
        self.access_tokens[new_access_token] = new_token_obj
        self.refresh_tokens[new_refresh_token] = new_access_token
        
        return {
            "access_token": new_access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "refresh_token": new_refresh_token,
            "scope": " ".join(old_token_obj.scopes)
        }
    
    def validate_token(self, access_token: str) -> Optional[AccessToken]:
        token_obj = self.access_tokens.get(access_token)
        
        if not token_obj:
            return None
        
        if token_obj.expires_at < datetime.utcnow():
            del self.access_tokens[access_token]
            if token_obj.refresh_token in self.refresh_tokens:
                del self.refresh_tokens[token_obj.refresh_token]
            return None
        
        return token_obj
```

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**RBAC Implementation (Python)**
```python
from enum import Enum
from typing import Set, Dict, List
from dataclasses import dataclass

class Permission(Enum):
    READ_USER = "read:user"
    WRITE_USER = "write:user"
    DELETE_USER = "delete:user"
    READ_ADMIN = "read:admin"
    WRITE_ADMIN = "write:admin"
    READ_SYSTEM = "read:system"
    WRITE_SYSTEM = "write:system"

@dataclass
class Role:
    name: str
    permissions: Set[Permission]
    description: str = ""

@dataclass
class UserRole:
    user_id: str
    roles: Set[str]

class RBACManager:
    def __init__(self):
        self.roles: Dict[str, Role] = {}
        self.user_roles: Dict[str, UserRole] = {}
        self._setup_default_roles()
    
    def _setup_default_roles(self):
        # Define default roles
        self.roles["user"] = Role(
            name="user",
            permissions={Permission.READ_USER},
            description="Basic user role"
        )
        
        self.roles["moderator"] = Role(
            name="moderator",
            permissions={
                Permission.READ_USER,
                Permission.WRITE_USER,
                Permission.READ_ADMIN
            },
            description="Moderator role with user management"
        )
        
        self.roles["admin"] = Role(
            name="admin",
            permissions={
                Permission.READ_USER,
                Permission.WRITE_USER,
                Permission.DELETE_USER,
                Permission.READ_ADMIN,
                Permission.WRITE_ADMIN
            },
            description="Administrator role"
        )
        
        self.roles["superadmin"] = Role(
            name="superadmin",
            permissions=set(Permission),  # All permissions
            description="Super administrator with all permissions"
        )
    
    def create_role(self, name: str, permissions: Set[Permission], description: str = ""):
        self.roles[name] = Role(name, permissions, description)
    
    def assign_role(self, user_id: str, role_name: str):
        if role_name not in self.roles:
            raise Exception(f"Role {role_name} does not exist")
        
        if user_id not in self.user_roles:
            self.user_roles[user_id] = UserRole(user_id, set())
        
        self.user_roles[user_id].roles.add(role_name)
    
    def remove_role(self, user_id: str, role_name: str):
        if user_id in self.user_roles:
            self.user_roles[user_id].roles.discard(role_name)
    
    def get_user_permissions(self, user_id: str) -> Set[Permission]:
        if user_id not in self.user_roles:
            return set()
        
        permissions = set()
        for role_name in self.user_roles[user_id].roles:
            if role_name in self.roles:
                permissions.update(self.roles[role_name].permissions)
        
        return permissions
    
    def has_permission(self, user_id: str, permission: Permission) -> bool:
        user_permissions = self.get_user_permissions(user_id)
        return permission in user_permissions
    
    def check_permission(self, user_id: str, permission: Permission):
        if not self.has_permission(user_id, permission):
            raise Exception(f"Access denied: Missing permission {permission.value}")

# Decorator for permission checking
def require_permission(permission: Permission):
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract user_id from request context (implementation specific)
            user_id = kwargs.get('user_id') or getattr(args[0], 'current_user_id', None)
            
            if not user_id:
                raise Exception("Authentication required")
            
            rbac_manager.check_permission(user_id, permission)
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Usage example
rbac_manager = RBACManager()

@require_permission(Permission.READ_USER)
def get_user_profile(user_id: str):
    return {"user_id": user_id, "profile": "data"}

@require_permission(Permission.DELETE_USER)
def delete_user(user_id: str, target_user_id: str):
    return f"User {target_user_id} deleted by {user_id}"
```

### API Security

**Rate Limiting Implementation**
```python
import time
from typing import Dict, Optional
from dataclasses import dataclass
from collections import defaultdict
import asyncio

@dataclass
class RateLimitRule:
    requests_per_window: int
    window_size_seconds: int
    burst_allowance: int = 0

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
    
    def consume(self, tokens: int = 1) -> bool:
        now = time.time()
        
        # Refill tokens based on time elapsed
        time_passed = now - self.last_refill
        self.tokens = min(self.capacity, 
                         self.tokens + time_passed * self.refill_rate)
        self.last_refill = now
        
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

class RateLimiter:
    def __init__(self):
        self.rules: Dict[str, RateLimitRule] = {}
        self.buckets: Dict[str, TokenBucket] = {}
        self.request_counts: Dict[str, Dict[int, int]] = defaultdict(lambda: defaultdict(int))
    
    def add_rule(self, identifier: str, rule: RateLimitRule):
        self.rules[identifier] = rule
    
    def is_allowed(self, identifier: str, client_id: str) -> tuple[bool, Dict[str, int]]:
        rule = self.rules.get(identifier)
        if not rule:
            return True, {}
        
        bucket_key = f"{identifier}:{client_id}"
        
        # Token bucket approach
        if bucket_key not in self.buckets:
            refill_rate = rule.requests_per_window / rule.window_size_seconds
            self.buckets[bucket_key] = TokenBucket(
                capacity=rule.requests_per_window + rule.burst_allowance,
                refill_rate=refill_rate
            )
        
        bucket = self.buckets[bucket_key]
        allowed = bucket.consume()
        
        # Calculate remaining requests and reset time
        remaining = int(bucket.tokens)
        reset_time = int(time.time() + (rule.requests_per_window - bucket.tokens) / bucket.refill_rate)
        
        headers = {
            "X-RateLimit-Limit": rule.requests_per_window,
            "X-RateLimit-Remaining": remaining,
            "X-RateLimit-Reset": reset_time
        }
        
        return allowed, headers

# Rate limiting decorator
def rate_limit(identifier: str):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract client identifier (IP, user ID, API key, etc.)
            client_id = kwargs.get('client_id') or 'anonymous'
            
            allowed, headers = rate_limiter.is_allowed(identifier, client_id)
            
            if not allowed:
                raise Exception("Rate limit exceeded")
            
            # Add rate limit headers to response (implementation specific)
            result = await func(*args, **kwargs)
            return result, headers
        return wrapper
    return decorator

# Usage
rate_limiter = RateLimiter()

# Configure rate limits
rate_limiter.add_rule("api_general", RateLimitRule(
    requests_per_window=100,
    window_size_seconds=60,
    burst_allowance=20
))

rate_limiter.add_rule("api_auth", RateLimitRule(
    requests_per_window=5,
    window_size_seconds=60,
    burst_allowance=2
))

@rate_limit("api_general")
async def get_data(client_id: str):
    return {"data": "example"}

@rate_limit("api_auth")
async def login(client_id: str, username: str, password: str):
    return {"token": "jwt_token"}
```

## Security Threats & Mitigation

### 1. SQL Injection Prevention

**Secure Database Queries**
```python
import sqlite3
from typing import List, Dict, Any

class SecureDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute a parameterized query safely"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        # SECURE: Using parameterized query
        query = "SELECT * FROM users WHERE id = ?"
        results = self.execute_query(query, (user_id,))
        return results[0] if results else None
    
    def search_users(self, search_term: str) -> List[Dict[str, Any]]:
        # SECURE: Using parameterized query with LIKE
        query = "SELECT * FROM users WHERE username LIKE ? OR email LIKE ?"
        search_pattern = f"%{search_term}%"
        return self.execute_query(query, (search_pattern, search_pattern))
    
    # INSECURE EXAMPLE (DO NOT USE)
    def insecure_search(self, search_term: str):
        # VULNERABLE: String concatenation allows SQL injection
        query = f"SELECT * FROM users WHERE username = '{search_term}'"
        # This could be exploited with: search_term = "'; DROP TABLE users; --"
        pass
```

### 2. XSS Prevention

**Input Sanitization and Output Encoding**
```python
import html
import re
from typing import Dict, Any

class XSSProtection:
    @staticmethod
    def sanitize_input(user_input: str) -> str:
        """Sanitize user input to prevent XSS"""
        if not user_input:
            return ""
        
        # Remove potentially dangerous HTML tags
        dangerous_tags = [
            'script', 'iframe', 'object', 'embed', 'form',
            'input', 'button', 'select', 'textarea', 'link',
            'meta', 'style'
        ]
        
        for tag in dangerous_tags:
            pattern = re.compile(f'<{tag}[^>]*>.*?</{tag}>', re.IGNORECASE | re.DOTALL)
            user_input = pattern.sub('', user_input)
            
            # Remove self-closing tags
            pattern = re.compile(f'<{tag}[^>]*/?>', re.IGNORECASE)
            user_input = pattern.sub('', user_input)
        
        # Remove javascript: and data: URLs
        user_input = re.sub(r'javascript:', '', user_input, flags=re.IGNORECASE)
        user_input = re.sub(r'data:', '', user_input, flags=re.IGNORECASE)
        
        # Remove on* event handlers
        user_input = re.sub(r'\son\w+\s*=', '', user_input, flags=re.IGNORECASE)
        
        return user_input.strip()
    
    @staticmethod
    def escape_html(text: str) -> str:
        """Escape HTML entities"""
        return html.escape(text, quote=True)
    
    @staticmethod
    def create_safe_response(data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a safe response by escaping all string values"""
        safe_data = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                safe_data[key] = XSSProtection.escape_html(value)
            elif isinstance(value, dict):
                safe_data[key] = XSSProtection.create_safe_response(value)
            elif isinstance(value, list):
                safe_data[key] = [
                    XSSProtection.escape_html(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                safe_data[key] = value
        
        return safe_data

# Content Security Policy (CSP) headers
CSP_HEADERS = {
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://api.example.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self';"
    )
}
```

### 3. CSRF Protection

**CSRF Token Implementation**
```python
import secrets
import hmac
import hashlib
from typing import Optional
from datetime import datetime, timedelta

class CSRFProtection:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
        self.token_lifetime = timedelta(hours=1)
    
    def generate_token(self, session_id: str) -> str:
        """Generate a CSRF token for a session"""
        timestamp = str(int(datetime.utcnow().timestamp()))
        random_value = secrets.token_urlsafe(16)
        
        # Create token payload
        payload = f"{session_id}:{timestamp}:{random_value}"
        
        # Create HMAC signature
        signature = hmac.new(
            self.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return f"{payload}:{signature}"
    
    def validate_token(self, token: str, session_id: str) -> bool:
        """Validate a CSRF token"""
        try:
            parts = token.split(':')
            if len(parts) != 4:
                return False
            
            token_session_id, timestamp, random_value, signature = parts
            
            # Check session ID
            if token_session_id != session_id:
                return False
            
            # Check timestamp (token expiry)
            token_time = datetime.fromtimestamp(int(timestamp))
            if datetime.utcnow() - token_time > self.token_lifetime:
                return False
            
            # Verify signature
            payload = f"{token_session_id}:{timestamp}:{random_value}"
            expected_signature = hmac.new(
                self.secret_key.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, expected_signature)
            
        except (ValueError, TypeError):
            return False

# CSRF protection decorator
def csrf_protect(csrf_protection: CSRFProtection):
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Extract CSRF token and session ID from request
            csrf_token = kwargs.get('csrf_token')
            session_id = kwargs.get('session_id')
            
            if not csrf_token or not session_id:
                raise Exception("CSRF token required")
            
            if not csrf_protection.validate_token(csrf_token, session_id):
                raise Exception("Invalid CSRF token")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

## Real-World Security Examples

### GitHub's Security Model

**Multi-layered Security Approach:**
1. **Authentication**: OAuth 2.0, SSH keys, personal access tokens
2. **Authorization**: Repository permissions, organization roles
3. **Network Security**: TLS encryption, DDoS protection
4. **Application Security**: Input validation, output encoding
5. **Infrastructure Security**: Secure deployment, monitoring

### AWS IAM Best Practices

**Identity and Access Management:**
```
[User] → [IAM Role] → [Policy] → [Resource]
   ↓         ↓          ↓         ↓
[MFA]   [Assume Role] [Least Privilege] [Encryption]
```

## Best Practices

### 1. Authentication
- **Use strong password policies**
- **Implement multi-factor authentication (MFA)**
- **Use secure session management**
- **Implement account lockout mechanisms**

### 2. Authorization
- **Follow principle of least privilege**
- **Use role-based access control (RBAC)**
- **Implement proper session management**
- **Regular access reviews and audits**

### 3. Data Protection
- **Encrypt data in transit and at rest**
- **Use secure communication protocols (TLS 1.3)**
- **Implement proper key management**
- **Regular security assessments**

### 4. API Security
- **Use HTTPS for all communications**
- **Implement rate limiting**
- **Validate and sanitize all inputs**
- **Use API versioning and deprecation strategies**

## Common Security Pitfalls

### 1. Weak Authentication
- **Weak password requirements**
- **Insecure session management**
- **Missing MFA implementation**
- **Poor token management**

### 2. Insufficient Authorization
- **Missing access controls**
- **Privilege escalation vulnerabilities**
- **Insecure direct object references**
- **Missing function-level access control**

### 3. Data Exposure
- **Sensitive data in logs**
- **Unencrypted data transmission**
- **Information disclosure in error messages**
- **Missing data classification**

### 4. Configuration Issues
- **Default credentials**
- **Unnecessary services enabled**
- **Missing security headers**
- **Insecure file permissions**

---

**Next Chapter**: [Chapter 11: Horizontal vs Vertical Scaling](chapter-11.md) - Scaling strategies and auto-scaling patterns