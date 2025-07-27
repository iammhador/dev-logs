# Chapter 5: API Design and Gateway Patterns

## Overview

API (Application Programming Interface) design is crucial for building scalable, maintainable, and user-friendly systems. API gateways serve as the single entry point for all client requests, providing cross-cutting concerns like authentication, rate limiting, and request routing.

## API Design Principles

### 1. RESTful API Design
**REST (Representational State Transfer)** is an architectural style for designing networked applications.

**Core Principles:**
- **Stateless:** Each request contains all information needed
- **Resource-based:** URLs represent resources, not actions
- **HTTP Methods:** Use appropriate HTTP verbs
- **Uniform Interface:** Consistent API structure
- **Cacheable:** Responses should be cacheable when appropriate

**HTTP Methods and Their Usage:**
```http
# GET - Retrieve data (idempotent, safe)
GET /api/v1/users/123
GET /api/v1/users?page=1&limit=20

# POST - Create new resources
POST /api/v1/users
Content-Type: application/json
{
  "username": "johndoe",
  "email": "john@example.com"
}

# PUT - Update entire resource (idempotent)
PUT /api/v1/users/123
Content-Type: application/json
{
  "id": 123,
  "username": "johndoe_updated",
  "email": "john.updated@example.com"
}

# PATCH - Partial update (not necessarily idempotent)
PATCH /api/v1/users/123
Content-Type: application/json
{
  "email": "new.email@example.com"
}

# DELETE - Remove resource (idempotent)
DELETE /api/v1/users/123
```

**Resource Naming Conventions:**
```http
# Good: Noun-based, hierarchical
GET /api/v1/users                    # Get all users
GET /api/v1/users/123                # Get specific user
GET /api/v1/users/123/posts          # Get user's posts
GET /api/v1/users/123/posts/456      # Get specific post by user

# Bad: Verb-based, inconsistent
GET /api/v1/getUsers
GET /api/v1/user/123/getPosts
POST /api/v1/createUser
```

### 2. API Versioning Strategies

**URL Path Versioning:**
```http
GET /api/v1/users/123
GET /api/v2/users/123
```

**Header Versioning:**
```http
GET /api/users/123
API-Version: v1

GET /api/users/123
API-Version: v2
```

**Query Parameter Versioning:**
```http
GET /api/users/123?version=v1
GET /api/users/123?version=v2
```

**Implementation Example:**
```python
from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)

def version_required(supported_versions):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check URL path version
            version = request.view_args.get('version', 'v1')
            
            # Check header version
            if not version:
                version = request.headers.get('API-Version', 'v1')
            
            # Check query parameter version
            if not version:
                version = request.args.get('version', 'v1')
            
            if version not in supported_versions:
                return jsonify({
                    'error': 'Unsupported API version',
                    'supported_versions': supported_versions
                }), 400
            
            return f(version=version, *args, **kwargs)
        return decorated_function
    return decorator

@app.route('/api/<version>/users/<int:user_id>')
@version_required(['v1', 'v2'])
def get_user(version, user_id):
    if version == 'v1':
        return jsonify({
            'id': user_id,
            'name': 'John Doe',
            'email': 'john@example.com'
        })
    elif version == 'v2':
        return jsonify({
            'id': user_id,
            'profile': {
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'avatar': 'https://example.com/avatar.jpg'
            },
            'metadata': {
                'createdAt': '2023-01-01T00:00:00Z',
                'lastLogin': '2023-12-01T10:30:00Z'
            }
        })
```

### 3. Response Format Standardization

**Success Response Format:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "metadata": {
    "timestamp": "2023-12-01T10:30:00Z",
    "version": "v1"
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "username",
        "message": "Username must be at least 3 characters"
      }
    ]
  },
  "metadata": {
    "timestamp": "2023-12-01T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

**Pagination Response:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "username": "user1"},
    {"id": 2, "username": "user2"}
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

### 4. Status Code Usage

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

# 200 OK - Successful GET, PUT, PATCH
@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    user = find_user(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({'error': 'User not found'}), 404

# 201 Created - Successful POST
@app.route('/api/users', methods=['POST'])
def create_user():
    user_data = request.json
    new_user = create_new_user(user_data)
    return jsonify(new_user), 201

# 204 No Content - Successful DELETE
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if delete_user_by_id(user_id):
        return '', 204
    return jsonify({'error': 'User not found'}), 404

# 400 Bad Request - Invalid input
@app.route('/api/users', methods=['POST'])
def create_user_with_validation():
    user_data = request.json
    
    errors = validate_user_data(user_data)
    if errors:
        return jsonify({
            'error': 'Validation failed',
            'details': errors
        }), 400
    
    new_user = create_new_user(user_data)
    return jsonify(new_user), 201

# 401 Unauthorized - Authentication required
@app.route('/api/protected')
def protected_endpoint():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not validate_token(auth_header):
        return jsonify({'error': 'Authentication required'}), 401
    
    return jsonify({'message': 'Access granted'}), 200

# 403 Forbidden - Insufficient permissions
@app.route('/api/admin/users')
def admin_only():
    user = get_current_user()
    if not user or not user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    return jsonify(get_all_users()), 200

# 429 Too Many Requests - Rate limiting
@app.route('/api/data')
def rate_limited_endpoint():
    if is_rate_limited(request.remote_addr):
        return jsonify({
            'error': 'Rate limit exceeded',
            'retryAfter': 60
        }), 429
    
    return jsonify(get_data()), 200

# 500 Internal Server Error - Server errors
@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'Something went wrong on our end'
    }), 500
```

## GraphQL API Design

**GraphQL** provides a more flexible alternative to REST, allowing clients to request exactly the data they need.

### Schema Definition
```graphql
type User {
  id: ID!
  username: String!
  email: String!
  posts: [Post!]!
  followers: [User!]!
  following: [User!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  comments: [Comment!]!
  likes: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
  post(id: ID!): Post
  posts(first: Int, after: String, authorId: ID): PostConnection!
  search(query: String!, type: SearchType!): SearchResult!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  
  followUser(userId: ID!): Boolean!
  unfollowUser(userId: ID!): Boolean!
}

type Subscription {
  postAdded(authorId: ID): Post!
  commentAdded(postId: ID!): Comment!
  userOnline(userId: ID!): User!
}

input CreateUserInput {
  username: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  username: String
  email: String
  bio: String
}

input CreatePostInput {
  title: String!
  content: String!
}

input UpdatePostInput {
  title: String
  content: String
}
```

### GraphQL Resolver Implementation
```python
import graphene
from graphene import ObjectType, String, Int, List, Field, Mutation
from graphene_sqlalchemy import SQLAlchemyObjectType

class UserType(SQLAlchemyObjectType):
    class Meta:
        model = User
        interfaces = (graphene.relay.Node,)

class PostType(SQLAlchemyObjectType):
    class Meta:
        model = Post
        interfaces = (graphene.relay.Node,)

class Query(ObjectType):
    user = Field(UserType, id=graphene.ID(required=True))
    users = List(UserType, limit=Int(default_value=10))
    post = Field(PostType, id=graphene.ID(required=True))
    posts = List(PostType, author_id=graphene.ID(), limit=Int(default_value=10))
    
    def resolve_user(self, info, id):
        return User.query.get(id)
    
    def resolve_users(self, info, limit):
        return User.query.limit(limit).all()
    
    def resolve_post(self, info, id):
        return Post.query.get(id)
    
    def resolve_posts(self, info, author_id=None, limit=10):
        query = Post.query
        if author_id:
            query = query.filter(Post.author_id == author_id)
        return query.limit(limit).all()

class CreateUser(Mutation):
    class Arguments:
        username = String(required=True)
        email = String(required=True)
        password = String(required=True)
    
    user = Field(UserType)
    
    def mutate(self, info, username, email, password):
        # Validation
        if User.query.filter_by(email=email).first():
            raise Exception("Email already exists")
        
        # Create user
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password)
        )
        db.session.add(user)
        db.session.commit()
        
        return CreateUser(user=user)

class Mutation(ObjectType):
    create_user = CreateUser.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
```

### GraphQL Query Examples
```graphql
# Get user with specific fields
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    username
    email
    posts {
      id
      title
      createdAt
    }
  }
}

# Get posts with author information
query GetPosts {
  posts(first: 10) {
    id
    title
    content
    author {
      username
      email
    }
    comments {
      id
      content
      author {
        username
      }
    }
  }
}

# Create a new post
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      username
    }
    createdAt
  }
}

# Subscribe to new posts
subscription PostAdded {
  postAdded {
    id
    title
    author {
      username
    }
  }
}
```

## API Gateway Patterns

### 1. Single API Gateway
**Architecture:** One gateway handles all API traffic

```python
from flask import Flask, request, jsonify
import requests
import time
from functools import wraps

app = Flask(__name__)

# Service registry
SERVICES = {
    'users': 'http://user-service:8001',
    'posts': 'http://post-service:8002',
    'notifications': 'http://notification-service:8003'
}

# Rate limiting
rate_limits = {}

def rate_limit(max_requests=100, window=3600):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            current_time = time.time()
            
            if client_ip not in rate_limits:
                rate_limits[client_ip] = []
            
            # Clean old requests
            rate_limits[client_ip] = [
                req_time for req_time in rate_limits[client_ip]
                if current_time - req_time < window
            ]
            
            # Check rate limit
            if len(rate_limits[client_ip]) >= max_requests:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'retryAfter': window
                }), 429
            
            rate_limits[client_ip].append(current_time)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Authentication middleware
def authenticate_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(' ')[1]  # Bearer token
        # Validate token (implement your token validation logic)
        user_id = validate_jwt_token(token)
        return user_id
    except:
        return None

# Request routing
@app.route('/api/<service>/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
@rate_limit(max_requests=1000, window=3600)
def proxy_request(service, endpoint):
    # Authentication
    user_id = authenticate_request()
    if not user_id and service != 'auth':
        return jsonify({'error': 'Authentication required'}), 401
    
    # Service discovery
    if service not in SERVICES:
        return jsonify({'error': 'Service not found'}), 404
    
    service_url = SERVICES[service]
    target_url = f"{service_url}/{endpoint}"
    
    # Forward request
    try:
        headers = dict(request.headers)
        headers['X-User-ID'] = str(user_id) if user_id else ''
        
        response = requests.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=request.args,
            json=request.get_json() if request.is_json else None,
            data=request.get_data() if not request.is_json else None,
            timeout=30
        )
        
        return jsonify(response.json()), response.status_code
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Service timeout'}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Service unavailable'}), 503
    except Exception as e:
        return jsonify({'error': 'Internal gateway error'}), 500

# Health check
@app.route('/health')
def health_check():
    service_health = {}
    
    for service_name, service_url in SERVICES.items():
        try:
            response = requests.get(f"{service_url}/health", timeout=5)
            service_health[service_name] = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time': response.elapsed.total_seconds()
            }
        except:
            service_health[service_name] = {
                'status': 'unhealthy',
                'response_time': None
            }
    
    overall_status = 'healthy' if all(
        service['status'] == 'healthy' 
        for service in service_health.values()
    ) else 'degraded'
    
    return jsonify({
        'status': overall_status,
        'services': service_health
    })
```

### 2. Backend for Frontend (BFF) Pattern
**Architecture:** Separate gateways for different client types

```python
# Mobile BFF
from flask import Flask, jsonify

mobile_app = Flask(__name__)

@mobile_app.route('/api/mobile/dashboard')
def mobile_dashboard():
    # Optimized for mobile - minimal data
    user_data = get_user_summary()
    recent_posts = get_recent_posts(limit=5)
    notifications = get_unread_notifications(limit=3)
    
    return jsonify({
        'user': {
            'id': user_data['id'],
            'username': user_data['username'],
            'avatar': user_data['avatar']
        },
        'recentPosts': [{
            'id': post['id'],
            'title': post['title'][:50] + '...',  # Truncated for mobile
            'createdAt': post['createdAt']
        } for post in recent_posts],
        'notifications': notifications
    })

# Web BFF
web_app = Flask(__name__)

@web_app.route('/api/web/dashboard')
def web_dashboard():
    # Rich data for web interface
    user_data = get_user_full_profile()
    recent_posts = get_recent_posts(limit=20)
    notifications = get_all_notifications()
    analytics = get_user_analytics()
    
    return jsonify({
        'user': user_data,
        'recentPosts': recent_posts,
        'notifications': notifications,
        'analytics': analytics,
        'sidebar': {
            'trending': get_trending_topics(),
            'suggestions': get_user_suggestions()
        }
    })
```

### 3. Microgateway Pattern
**Architecture:** Lightweight gateways for specific domains

```python
# User domain gateway
from flask import Flask, request, jsonify
import consul

user_gateway = Flask(__name__)
consul_client = consul.Consul()

class ServiceDiscovery:
    def __init__(self, consul_client):
        self.consul = consul_client
    
    def get_service_url(self, service_name):
        # Get healthy service instances
        _, services = self.consul.health.service(
            service_name, 
            passing=True
        )
        
        if not services:
            raise Exception(f"No healthy instances of {service_name}")
        
        # Simple round-robin selection
        service = services[0]['Service']
        return f"http://{service['Address']}:{service['Port']}"

service_discovery = ServiceDiscovery(consul_client)

@user_gateway.route('/users/<int:user_id>')
def get_user(user_id):
    try:
        user_service_url = service_discovery.get_service_url('user-service')
        response = requests.get(f"{user_service_url}/users/{user_id}")
        return jsonify(response.json()), response.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 503

@user_gateway.route('/users/<int:user_id>/posts')
def get_user_posts(user_id):
    try:
        # Aggregate data from multiple services
        user_service_url = service_discovery.get_service_url('user-service')
        post_service_url = service_discovery.get_service_url('post-service')
        
        # Get user info
        user_response = requests.get(f"{user_service_url}/users/{user_id}")
        user_data = user_response.json()
        
        # Get user's posts
        posts_response = requests.get(
            f"{post_service_url}/posts",
            params={'author_id': user_id}
        )
        posts_data = posts_response.json()
        
        return jsonify({
            'user': user_data,
            'posts': posts_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 503
```

## API Security

### 1. Authentication Strategies

**JWT (JSON Web Tokens):**
```python
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app

class JWTAuth:
    def __init__(self, secret_key, algorithm='HS256'):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def generate_token(self, user_id, expires_in=3600):
        payload = {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            raise Exception('Token has expired')
        except jwt.InvalidTokenError:
            raise Exception('Invalid token')
    
    def require_auth(self, f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'Authorization header required'}), 401
            
            try:
                token = auth_header.split(' ')[1]  # Bearer token
                user_id = self.verify_token(token)
                request.current_user_id = user_id
                return f(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': str(e)}), 401
        
        return decorated_function

# Usage
jwt_auth = JWTAuth(secret_key='your-secret-key')

@app.route('/api/login', methods=['POST'])
def login():
    credentials = request.json
    user = authenticate_user(credentials['username'], credentials['password'])
    
    if user:
        token = jwt_auth.generate_token(user.id)
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/protected')
@jwt_auth.require_auth
def protected_endpoint():
    user_id = request.current_user_id
    return jsonify({'message': f'Hello user {user_id}'})
```

**OAuth 2.0 Implementation:**
```python
import requests
from flask import redirect, request, session, url_for

class OAuth2Provider:
    def __init__(self, client_id, client_secret, auth_url, token_url, user_info_url):
        self.client_id = client_id
        self.client_secret = client_secret
        self.auth_url = auth_url
        self.token_url = token_url
        self.user_info_url = user_info_url
    
    def get_authorization_url(self, redirect_uri, scope='read'):
        params = {
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': scope,
            'response_type': 'code',
            'state': generate_random_state()  # CSRF protection
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    def exchange_code_for_token(self, code, redirect_uri):
        data = {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(self.token_url, data=data)
        return response.json()
    
    def get_user_info(self, access_token):
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(self.user_info_url, headers=headers)
        return response.json()

# GitHub OAuth example
github_oauth = OAuth2Provider(
    client_id='your-github-client-id',
    client_secret='your-github-client-secret',
    auth_url='https://github.com/login/oauth/authorize',
    token_url='https://github.com/login/oauth/access_token',
    user_info_url='https://api.github.com/user'
)

@app.route('/auth/github')
def github_login():
    redirect_uri = url_for('github_callback', _external=True)
    auth_url = github_oauth.get_authorization_url(redirect_uri)
    return redirect(auth_url)

@app.route('/auth/github/callback')
def github_callback():
    code = request.args.get('code')
    redirect_uri = url_for('github_callback', _external=True)
    
    # Exchange code for token
    token_data = github_oauth.exchange_code_for_token(code, redirect_uri)
    access_token = token_data['access_token']
    
    # Get user info
    user_info = github_oauth.get_user_info(access_token)
    
    # Create or update user in your system
    user = create_or_update_user_from_oauth(user_info)
    
    # Create session
    session['user_id'] = user.id
    
    return redirect('/dashboard')
```

### 2. API Key Management
```python
import secrets
import hashlib
from datetime import datetime, timedelta

class APIKeyManager:
    def __init__(self, db_session):
        self.db = db_session
    
    def generate_api_key(self, user_id, name, expires_in_days=365):
        # Generate random API key
        api_key = f"ak_{secrets.token_urlsafe(32)}"
        
        # Hash for storage
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Store in database
        api_key_record = APIKey(
            user_id=user_id,
            name=name,
            key_hash=key_hash,
            expires_at=datetime.utcnow() + timedelta(days=expires_in_days),
            created_at=datetime.utcnow()
        )
        
        self.db.add(api_key_record)
        self.db.commit()
        
        return api_key  # Return unhashed key to user (only time they see it)
    
    def validate_api_key(self, api_key):
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        api_key_record = self.db.query(APIKey).filter(
            APIKey.key_hash == key_hash,
            APIKey.is_active == True,
            APIKey.expires_at > datetime.utcnow()
        ).first()
        
        if api_key_record:
            # Update last used timestamp
            api_key_record.last_used_at = datetime.utcnow()
            self.db.commit()
            return api_key_record.user_id
        
        return None
    
    def revoke_api_key(self, api_key):
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        api_key_record = self.db.query(APIKey).filter(
            APIKey.key_hash == key_hash
        ).first()
        
        if api_key_record:
            api_key_record.is_active = False
            self.db.commit()
            return True
        
        return False

# Middleware for API key authentication
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        
        api_key_manager = APIKeyManager(db.session)
        user_id = api_key_manager.validate_api_key(api_key)
        
        if not user_id:
            return jsonify({'error': 'Invalid or expired API key'}), 401
        
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function
```

### 3. Rate Limiting
```python
import time
import redis
from functools import wraps

class RedisRateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def is_allowed(self, key, limit, window):
        current_time = time.time()
        pipeline = self.redis.pipeline()
        
        # Remove old entries
        pipeline.zremrangebyscore(key, 0, current_time - window)
        
        # Count current requests
        pipeline.zcard(key)
        
        # Add current request
        pipeline.zadd(key, {str(current_time): current_time})
        
        # Set expiration
        pipeline.expire(key, int(window))
        
        results = pipeline.execute()
        current_requests = results[1]
        
        return current_requests < limit
    
    def get_reset_time(self, key, window):
        oldest_request = self.redis.zrange(key, 0, 0, withscores=True)
        if oldest_request:
            return oldest_request[0][1] + window
        return time.time() + window

class RateLimitDecorator:
    def __init__(self, redis_client):
        self.limiter = RedisRateLimiter(redis_client)
    
    def limit(self, requests_per_minute=60, per_user=True):
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                # Determine rate limit key
                if per_user and hasattr(request, 'current_user_id'):
                    key = f"rate_limit:user:{request.current_user_id}:{f.__name__}"
                else:
                    key = f"rate_limit:ip:{request.remote_addr}:{f.__name__}"
                
                window = 60  # 1 minute
                
                if not self.limiter.is_allowed(key, requests_per_minute, window):
                    reset_time = self.limiter.get_reset_time(key, window)
                    
                    return jsonify({
                        'error': 'Rate limit exceeded',
                        'limit': requests_per_minute,
                        'window': window,
                        'resetTime': reset_time
                    }), 429
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator

# Usage
redis_client = redis.Redis(host='localhost', port=6379, db=0)
rate_limiter = RateLimitDecorator(redis_client)

@app.route('/api/search')
@rate_limiter.limit(requests_per_minute=30)
def search_endpoint():
    query = request.args.get('q')
    results = perform_search(query)
    return jsonify(results)

@app.route('/api/upload')
@jwt_auth.require_auth
@rate_limiter.limit(requests_per_minute=5, per_user=True)
def upload_endpoint():
    # Handle file upload
    pass
```

## API Documentation

### OpenAPI/Swagger Documentation
```python
from flask import Flask
from flask_restx import Api, Resource, fields
from flask_restx import reqparse

app = Flask(__name__)
api = Api(
    app,
    version='1.0',
    title='User Management API',
    description='A comprehensive API for managing users and posts',
    doc='/docs/'  # Swagger UI available at /docs/
)

# Namespaces for organization
user_ns = api.namespace('users', description='User operations')
post_ns = api.namespace('posts', description='Post operations')

# Data models for documentation
user_model = api.model('User', {
    'id': fields.Integer(required=True, description='User ID'),
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'created_at': fields.DateTime(description='Account creation date')
})

user_input_model = api.model('UserInput', {
    'username': fields.String(required=True, description='Username'),
    'email': fields.String(required=True, description='Email address'),
    'password': fields.String(required=True, description='Password')
})

post_model = api.model('Post', {
    'id': fields.Integer(required=True, description='Post ID'),
    'title': fields.String(required=True, description='Post title'),
    'content': fields.String(required=True, description='Post content'),
    'author_id': fields.Integer(required=True, description='Author user ID'),
    'created_at': fields.DateTime(description='Post creation date')
})

@user_ns.route('/')
class UserList(Resource):
    @user_ns.doc('list_users')
    @user_ns.marshal_list_with(user_model)
    @user_ns.param('page', 'Page number', type='integer', default=1)
    @user_ns.param('limit', 'Items per page', type='integer', default=10)
    def get(self):
        """Get list of users"""
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, default=1)
        parser.add_argument('limit', type=int, default=10)
        args = parser.parse_args()
        
        users = get_users_paginated(args['page'], args['limit'])
        return users
    
    @user_ns.doc('create_user')
    @user_ns.expect(user_input_model)
    @user_ns.marshal_with(user_model, code=201)
    @user_ns.response(400, 'Validation error')
    @user_ns.response(409, 'User already exists')
    def post(self):
        """Create a new user"""
        data = api.payload
        
        # Validation
        if not validate_email(data['email']):
            api.abort(400, 'Invalid email format')
        
        if user_exists(data['email']):
            api.abort(409, 'User with this email already exists')
        
        user = create_user(data)
        return user, 201

@user_ns.route('/<int:user_id>')
@user_ns.param('user_id', 'User identifier')
class User(Resource):
    @user_ns.doc('get_user')
    @user_ns.marshal_with(user_model)
    @user_ns.response(404, 'User not found')
    def get(self, user_id):
        """Get user by ID"""
        user = get_user_by_id(user_id)
        if not user:
            api.abort(404, 'User not found')
        return user
    
    @user_ns.doc('update_user')
    @user_ns.expect(user_input_model)
    @user_ns.marshal_with(user_model)
    @user_ns.response(404, 'User not found')
    def put(self, user_id):
        """Update user"""
        user = get_user_by_id(user_id)
        if not user:
            api.abort(404, 'User not found')
        
        data = api.payload
        updated_user = update_user(user_id, data)
        return updated_user
    
    @user_ns.doc('delete_user')
    @user_ns.response(204, 'User deleted')
    @user_ns.response(404, 'User not found')
    def delete(self, user_id):
        """Delete user"""
        if not delete_user(user_id):
            api.abort(404, 'User not found')
        return '', 204
```

## API Testing

### Unit Testing
```python
import unittest
import json
from unittest.mock import patch, MagicMock
from app import app, db

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        
        # Create test database
        with app.app_context():
            db.create_all()
    
    def tearDown(self):
        with app.app_context():
            db.drop_all()
    
    def test_get_users(self):
        # Create test user
        response = self.app.post('/api/users', 
            data=json.dumps({
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        
        # Get users
        response = self.app.get('/api/users')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['username'], 'testuser')
    
    def test_create_user_validation(self):
        # Test invalid email
        response = self.app.post('/api/users',
            data=json.dumps({
                'username': 'testuser',
                'email': 'invalid-email',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertIn('error', data)
    
    def test_authentication_required(self):
        response = self.app.get('/api/protected')
        self.assertEqual(response.status_code, 401)
    
    @patch('app.authenticate_user')
    def test_login_success(self, mock_auth):
        # Mock successful authentication
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = 'testuser'
        mock_auth.return_value = mock_user
        
        response = self.app.post('/api/login',
            data=json.dumps({
                'username': 'testuser',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('token', data)
        self.assertIn('user', data)
    
    def test_rate_limiting(self):
        # Make multiple requests to trigger rate limit
        for i in range(101):  # Assuming limit is 100
            response = self.app.get('/api/search?q=test')
            if response.status_code == 429:
                break
        
        self.assertEqual(response.status_code, 429)
        data = json.loads(response.data)
        self.assertIn('Rate limit exceeded', data['error'])

if __name__ == '__main__':
    unittest.main()
```

### Integration Testing
```python
import requests
import pytest
from concurrent.futures import ThreadPoolExecutor
import time

class APIIntegrationTest:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_user_workflow(self):
        """Test complete user creation and management workflow"""
        
        # 1. Create user
        user_data = {
            'username': 'integrationtest',
            'email': 'integration@test.com',
            'password': 'password123'
        }
        
        response = self.session.post(
            f"{self.base_url}/api/users",
            json=user_data
        )
        assert response.status_code == 201
        
        created_user = response.json()
        user_id = created_user['id']
        
        # 2. Login
        login_response = self.session.post(
            f"{self.base_url}/api/login",
            json={
                'username': user_data['username'],
                'password': user_data['password']
            }
        )
        assert login_response.status_code == 200
        
        token = login_response.json()['token']
        self.session.headers.update({'Authorization': f'Bearer {token}'})
        
        # 3. Get user profile
        profile_response = self.session.get(
            f"{self.base_url}/api/users/{user_id}"
        )
        assert profile_response.status_code == 200
        
        profile = profile_response.json()
        assert profile['username'] == user_data['username']
        
        # 4. Update user
        update_response = self.session.put(
            f"{self.base_url}/api/users/{user_id}",
            json={'username': 'updated_username'}
        )
        assert update_response.status_code == 200
        
        # 5. Verify update
        updated_profile = self.session.get(
            f"{self.base_url}/api/users/{user_id}"
        ).json()
        assert updated_profile['username'] == 'updated_username'
        
        # 6. Delete user
        delete_response = self.session.delete(
            f"{self.base_url}/api/users/{user_id}"
        )
        assert delete_response.status_code == 204
        
        # 7. Verify deletion
        get_deleted_response = self.session.get(
            f"{self.base_url}/api/users/{user_id}"
        )
        assert get_deleted_response.status_code == 404
    
    def test_concurrent_requests(self):
        """Test API under concurrent load"""
        
        def make_request(i):
            response = requests.get(f"{self.base_url}/api/users")
            return response.status_code
        
        # Make 50 concurrent requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request, i) for i in range(50)]
            results = [future.result() for future in futures]
        
        # All requests should succeed
        assert all(status == 200 for status in results)
    
    def test_rate_limiting_behavior(self):
        """Test rate limiting functionality"""
        
        # Make requests until rate limited
        rate_limited = False
        for i in range(200):
            response = requests.get(f"{self.base_url}/api/search?q=test")
            if response.status_code == 429:
                rate_limited = True
                break
            time.sleep(0.1)
        
        assert rate_limited, "Rate limiting should have been triggered"

# Run integration tests
if __name__ == '__main__':
    test_suite = APIIntegrationTest('http://localhost:5000')
    test_suite.test_user_workflow()
    test_suite.test_concurrent_requests()
    test_suite.test_rate_limiting_behavior()
    print("All integration tests passed!")
```

## Best Practices

### 1. API Design
- Use consistent naming conventions
- Implement proper HTTP status codes
- Provide comprehensive error messages
- Support pagination for list endpoints
- Use appropriate HTTP methods
- Version your APIs from the start

### 2. Security
- Always use HTTPS in production
- Implement proper authentication and authorization
- Validate and sanitize all inputs
- Use rate limiting to prevent abuse
- Log security events
- Keep dependencies updated

### 3. Performance
- Implement caching strategies
- Use connection pooling
- Optimize database queries
- Implement request/response compression
- Monitor API performance metrics
- Use CDNs for static content

### 4. Documentation
- Maintain up-to-date API documentation
- Provide code examples
- Document error responses
- Include authentication instructions
- Provide SDKs for popular languages

### 5. Monitoring
- Track key metrics (latency, throughput, error rates)
- Implement health checks
- Set up alerting for critical issues
- Log all API requests and responses
- Monitor third-party dependencies

## Next Steps

In the next chapter, we'll explore message queues and event processing, which enable asynchronous communication and help decouple system components for better scalability and reliability.