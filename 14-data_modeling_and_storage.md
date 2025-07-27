# Data Modeling & Storage

## Overview

Data modeling is the foundation of any system design. This chapter covers different data modeling approaches, storage patterns, and how to choose the right data storage solution for your specific use case.

## Data Modeling Fundamentals

### Relational Data Modeling

**Key Concepts:**
- **Normalization**: Reducing data redundancy
- **ACID Properties**: Atomicity, Consistency, Isolation, Durability
- **Referential Integrity**: Maintaining relationships between tables
- **Indexing**: Optimizing query performance

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="user")

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

# Database operations
class BlogRepository:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def create_user(self, username: str, email: str) -> User:
        user = User(username=username, email=email)
        self.session.add(user)
        self.session.commit()
        return user
    
    def create_post(self, title: str, content: str, author_id: int) -> Post:
        post = Post(title=title, content=content, author_id=author_id)
        self.session.add(post)
        self.session.commit()
        return post
    
    def get_user_posts(self, user_id: int) -> list:
        return self.session.query(Post).filter(Post.author_id == user_id).all()
    
    def get_post_with_comments(self, post_id: int) -> Post:
        return self.session.query(Post).filter(Post.id == post_id).first()

# Usage example
repo = BlogRepository("sqlite:///blog.db")
user = repo.create_user("john_doe", "john@example.com")
post = repo.create_post("My First Post", "Hello World!", user.id)
```

### NoSQL Data Modeling

**Document-Based Modeling (MongoDB):**

```python
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Optional

class DocumentStore:
    def __init__(self, connection_string: str, database_name: str):
        self.client = MongoClient(connection_string)
        self.db = self.client[database_name]
    
    def create_user_profile(self, user_data: Dict) -> str:
        """Create a user profile with embedded data"""
        user_document = {
            "username": user_data["username"],
            "email": user_data["email"],
            "profile": {
                "first_name": user_data.get("first_name"),
                "last_name": user_data.get("last_name"),
                "bio": user_data.get("bio"),
                "avatar_url": user_data.get("avatar_url")
            },
            "preferences": {
                "theme": "light",
                "notifications": {
                    "email": True,
                    "push": True,
                    "sms": False
                }
            },
            "social_links": user_data.get("social_links", []),
            "created_at": datetime.utcnow(),
            "last_login": None,
            "is_active": True
        }
        
        result = self.db.users.insert_one(user_document)
        return str(result.inserted_id)
    
    def create_blog_post(self, post_data: Dict) -> str:
        """Create a blog post with embedded comments"""
        post_document = {
            "title": post_data["title"],
            "content": post_data["content"],
            "author": {
                "user_id": post_data["author_id"],
                "username": post_data["author_username"]
            },
            "tags": post_data.get("tags", []),
            "metadata": {
                "word_count": len(post_data["content"].split()),
                "reading_time": len(post_data["content"].split()) // 200,  # Avg 200 WPM
                "language": "en"
            },
            "engagement": {
                "views": 0,
                "likes": 0,
                "shares": 0
            },
            "comments": [],  # Embedded comments
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "published": post_data.get("published", False)
        }
        
        result = self.db.posts.insert_one(post_document)
        return str(result.inserted_id)
    
    def add_comment_to_post(self, post_id: str, comment_data: Dict):
        """Add a comment to a blog post"""
        comment = {
            "id": str(datetime.utcnow().timestamp()),
            "content": comment_data["content"],
            "author": {
                "user_id": comment_data["author_id"],
                "username": comment_data["author_username"]
            },
            "created_at": datetime.utcnow(),
            "likes": 0,
            "replies": []
        }
        
        self.db.posts.update_one(
            {"_id": post_id},
            {"$push": {"comments": comment}}
        )
    
    def get_user_feed(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get personalized feed for user"""
        # This would typically involve complex aggregation
        pipeline = [
            {"$match": {"published": True}},
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {
                "$project": {
                    "title": 1,
                    "content": {"$substr": ["$content", 0, 200]},  # Truncate content
                    "author": 1,
                    "tags": 1,
                    "engagement": 1,
                    "created_at": 1
                }
            }
        ]
        
        return list(self.db.posts.aggregate(pipeline))

# Usage example
doc_store = DocumentStore("mongodb://localhost:27017", "blog_db")

user_data = {
    "username": "jane_doe",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "bio": "Software engineer and blogger",
    "social_links": [
        {"platform": "twitter", "url": "https://twitter.com/jane_doe"},
        {"platform": "github", "url": "https://github.com/jane_doe"}
    ]
}

user_id = doc_store.create_user_profile(user_data)
```

### Graph Data Modeling

**Neo4j Example:**

```python
from neo4j import GraphDatabase
from typing import List, Dict

class SocialNetworkGraph:
    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def close(self):
        self.driver.close()
    
    def create_user(self, user_id: str, name: str, email: str):
        with self.driver.session() as session:
            session.write_transaction(self._create_user, user_id, name, email)
    
    @staticmethod
    def _create_user(tx, user_id: str, name: str, email: str):
        query = (
            "CREATE (u:User {id: $user_id, name: $name, email: $email, created_at: datetime()})"
        )
        tx.run(query, user_id=user_id, name=name, email=email)
    
    def create_friendship(self, user1_id: str, user2_id: str):
        with self.driver.session() as session:
            session.write_transaction(self._create_friendship, user1_id, user2_id)
    
    @staticmethod
    def _create_friendship(tx, user1_id: str, user2_id: str):
        query = (
            "MATCH (u1:User {id: $user1_id}), (u2:User {id: $user2_id}) "
            "CREATE (u1)-[:FRIENDS_WITH {since: datetime()}]->(u2), "
            "(u2)-[:FRIENDS_WITH {since: datetime()}]->(u1)"
        )
        tx.run(query, user1_id=user1_id, user2_id=user2_id)
    
    def get_friends_of_friends(self, user_id: str) -> List[Dict]:
        with self.driver.session() as session:
            return session.read_transaction(self._get_friends_of_friends, user_id)
    
    @staticmethod
    def _get_friends_of_friends(tx, user_id: str):
        query = (
            "MATCH (u:User {id: $user_id})-[:FRIENDS_WITH]->(friend)-[:FRIENDS_WITH]->(fof) "
            "WHERE fof.id <> $user_id AND NOT (u)-[:FRIENDS_WITH]->(fof) "
            "RETURN fof.id as id, fof.name as name, count(*) as mutual_friends "
            "ORDER BY mutual_friends DESC"
        )
        result = tx.run(query, user_id=user_id)
        return [record.data() for record in result]
    
    def get_shortest_path(self, user1_id: str, user2_id: str) -> List[str]:
        with self.driver.session() as session:
            return session.read_transaction(self._get_shortest_path, user1_id, user2_id)
    
    @staticmethod
    def _get_shortest_path(tx, user1_id: str, user2_id: str):
        query = (
            "MATCH path = shortestPath((u1:User {id: $user1_id})-[:FRIENDS_WITH*]-(u2:User {id: $user2_id})) "
            "RETURN [node in nodes(path) | node.name] as path"
        )
        result = tx.run(query, user1_id=user1_id, user2_id=user2_id)
        record = result.single()
        return record["path"] if record else []

# Usage example
graph = SocialNetworkGraph("bolt://localhost:7687", "neo4j", "password")
graph.create_user("user1", "Alice", "alice@example.com")
graph.create_user("user2", "Bob", "bob@example.com")
graph.create_friendship("user1", "user2")
```

## Storage Patterns

### Event Sourcing

```python
from typing import List, Dict, Any
from datetime import datetime
from abc import ABC, abstractmethod
import json

class Event(ABC):
    def __init__(self, aggregate_id: str, event_data: Dict[str, Any]):
        self.aggregate_id = aggregate_id
        self.event_data = event_data
        self.timestamp = datetime.utcnow()
        self.event_id = f"{aggregate_id}_{self.timestamp.timestamp()}"
    
    @abstractmethod
    def event_type(self) -> str:
        pass

class UserCreatedEvent(Event):
    def event_type(self) -> str:
        return "UserCreated"

class UserEmailUpdatedEvent(Event):
    def event_type(self) -> str:
        return "UserEmailUpdated"

class EventStore:
    def __init__(self):
        self.events: List[Event] = []
        self.snapshots: Dict[str, Dict] = {}
    
    def append_event(self, event: Event):
        """Append event to the event store"""
        self.events.append(event)
    
    def get_events(self, aggregate_id: str, from_version: int = 0) -> List[Event]:
        """Get events for an aggregate from a specific version"""
        return [
            event for event in self.events 
            if event.aggregate_id == aggregate_id
        ][from_version:]
    
    def create_snapshot(self, aggregate_id: str, state: Dict, version: int):
        """Create a snapshot of aggregate state"""
        self.snapshots[aggregate_id] = {
            "state": state,
            "version": version,
            "timestamp": datetime.utcnow()
        }
    
    def get_snapshot(self, aggregate_id: str) -> Dict:
        """Get the latest snapshot for an aggregate"""
        return self.snapshots.get(aggregate_id)

class UserAggregate:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.email = None
        self.name = None
        self.created_at = None
        self.version = 0
        self.uncommitted_events: List[Event] = []
    
    def create_user(self, name: str, email: str):
        """Create a new user"""
        event = UserCreatedEvent(self.user_id, {
            "name": name,
            "email": email
        })
        self._apply_event(event)
        self.uncommitted_events.append(event)
    
    def update_email(self, new_email: str):
        """Update user email"""
        if self.email != new_email:
            event = UserEmailUpdatedEvent(self.user_id, {
                "old_email": self.email,
                "new_email": new_email
            })
            self._apply_event(event)
            self.uncommitted_events.append(event)
    
    def _apply_event(self, event: Event):
        """Apply event to aggregate state"""
        if isinstance(event, UserCreatedEvent):
            self.name = event.event_data["name"]
            self.email = event.event_data["email"]
            self.created_at = event.timestamp
        elif isinstance(event, UserEmailUpdatedEvent):
            self.email = event.event_data["new_email"]
        
        self.version += 1
    
    def load_from_history(self, events: List[Event]):
        """Rebuild aggregate state from events"""
        for event in events:
            self._apply_event(event)
    
    def get_uncommitted_events(self) -> List[Event]:
        """Get events that haven't been persisted yet"""
        return self.uncommitted_events.copy()
    
    def mark_events_as_committed(self):
        """Mark events as committed"""
        self.uncommitted_events.clear()

class UserRepository:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
    
    def save(self, user: UserAggregate):
        """Save user aggregate"""
        for event in user.get_uncommitted_events():
            self.event_store.append_event(event)
        user.mark_events_as_committed()
    
    def get_by_id(self, user_id: str) -> UserAggregate:
        """Load user aggregate by ID"""
        user = UserAggregate(user_id)
        
        # Try to load from snapshot first
        snapshot = self.event_store.get_snapshot(user_id)
        from_version = 0
        
        if snapshot:
            # Load from snapshot
            user.name = snapshot["state"].get("name")
            user.email = snapshot["state"].get("email")
            user.created_at = snapshot["state"].get("created_at")
            user.version = snapshot["version"]
            from_version = snapshot["version"]
        
        # Load events after snapshot
        events = self.event_store.get_events(user_id, from_version)
        user.load_from_history(events)
        
        return user

# Usage example
event_store = EventStore()
user_repo = UserRepository(event_store)

# Create and save user
user = UserAggregate("user123")
user.create_user("John Doe", "john@example.com")
user_repo.save(user)

# Update user
user.update_email("john.doe@example.com")
user_repo.save(user)

# Load user from events
loaded_user = user_repo.get_by_id("user123")
print(f"User: {loaded_user.name}, Email: {loaded_user.email}")
```

### CQRS (Command Query Responsibility Segregation)

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Any
from dataclasses import dataclass

# Commands
@dataclass
class Command(ABC):
    pass

@dataclass
class CreateUserCommand(Command):
    user_id: str
    name: str
    email: str

@dataclass
class UpdateUserEmailCommand(Command):
    user_id: str
    new_email: str

# Queries
@dataclass
class Query(ABC):
    pass

@dataclass
class GetUserByIdQuery(Query):
    user_id: str

@dataclass
class GetUsersByEmailDomainQuery(Query):
    domain: str

# Command Handlers
class CommandHandler(ABC):
    @abstractmethod
    def handle(self, command: Command):
        pass

class CreateUserCommandHandler(CommandHandler):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def handle(self, command: CreateUserCommand):
        user = UserAggregate(command.user_id)
        user.create_user(command.name, command.email)
        self.user_repository.save(user)

class UpdateUserEmailCommandHandler(CommandHandler):
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def handle(self, command: UpdateUserEmailCommand):
        user = self.user_repository.get_by_id(command.user_id)
        user.update_email(command.new_email)
        self.user_repository.save(user)

# Query Handlers
class QueryHandler(ABC):
    @abstractmethod
    def handle(self, query: Query) -> Any:
        pass

class GetUserByIdQueryHandler(QueryHandler):
    def __init__(self, read_model_store: Dict):
        self.read_model_store = read_model_store
    
    def handle(self, query: GetUserByIdQuery) -> Dict:
        return self.read_model_store.get(query.user_id)

class GetUsersByEmailDomainQueryHandler(QueryHandler):
    def __init__(self, read_model_store: Dict):
        self.read_model_store = read_model_store
    
    def handle(self, query: GetUsersByEmailDomainQuery) -> List[Dict]:
        return [
            user for user in self.read_model_store.values()
            if user.get("email", "").endswith(f"@{query.domain}")
        ]

# Command/Query Bus
class CommandBus:
    def __init__(self):
        self.handlers: Dict[type, CommandHandler] = {}
    
    def register_handler(self, command_type: type, handler: CommandHandler):
        self.handlers[command_type] = handler
    
    def execute(self, command: Command):
        handler = self.handlers.get(type(command))
        if handler:
            handler.handle(command)
        else:
            raise ValueError(f"No handler registered for {type(command)}")

class QueryBus:
    def __init__(self):
        self.handlers: Dict[type, QueryHandler] = {}
    
    def register_handler(self, query_type: type, handler: QueryHandler):
        self.handlers[query_type] = handler
    
    def execute(self, query: Query) -> Any:
        handler = self.handlers.get(type(query))
        if handler:
            return handler.handle(query)
        else:
            raise ValueError(f"No handler registered for {type(query)}")

# Read Model Projector
class UserReadModelProjector:
    def __init__(self, read_model_store: Dict):
        self.read_model_store = read_model_store
    
    def project_user_created(self, event: UserCreatedEvent):
        self.read_model_store[event.aggregate_id] = {
            "user_id": event.aggregate_id,
            "name": event.event_data["name"],
            "email": event.event_data["email"],
            "created_at": event.timestamp.isoformat()
        }
    
    def project_user_email_updated(self, event: UserEmailUpdatedEvent):
        if event.aggregate_id in self.read_model_store:
            self.read_model_store[event.aggregate_id]["email"] = event.event_data["new_email"]

# Usage example
event_store = EventStore()
user_repo = UserRepository(event_store)
read_model_store = {}
projector = UserReadModelProjector(read_model_store)

# Setup command bus
command_bus = CommandBus()
command_bus.register_handler(CreateUserCommand, CreateUserCommandHandler(user_repo))
command_bus.register_handler(UpdateUserEmailCommand, UpdateUserEmailCommandHandler(user_repo))

# Setup query bus
query_bus = QueryBus()
query_bus.register_handler(GetUserByIdQuery, GetUserByIdQueryHandler(read_model_store))
query_bus.register_handler(GetUsersByEmailDomainQuery, GetUsersByEmailDomainQueryHandler(read_model_store))

# Execute commands
command_bus.execute(CreateUserCommand("user123", "John Doe", "john@example.com"))
projector.project_user_created(UserCreatedEvent("user123", {"name": "John Doe", "email": "john@example.com"}))

# Execute queries
user = query_bus.execute(GetUserByIdQuery("user123"))
print(f"User: {user}")
```

## Storage Technology Selection

### Decision Matrix

| Use Case | RDBMS | Document DB | Key-Value | Graph DB | Time-Series |
|----------|-------|-------------|-----------|----------|-------------|
| **ACID Transactions** | ✅ | ⚠️ | ❌ | ⚠️ | ❌ |
| **Complex Queries** | ✅ | ⚠️ | ❌ | ✅ | ⚠️ |
| **Horizontal Scaling** | ⚠️ | ✅ | ✅ | ⚠️ | ✅ |
| **Schema Flexibility** | ❌ | ✅ | ✅ | ⚠️ | ❌ |
| **Relationships** | ✅ | ⚠️ | ❌ | ✅ | ❌ |
| **High Write Volume** | ⚠️ | ✅ | ✅ | ⚠️ | ✅ |
| **Analytics** | ✅ | ⚠️ | ❌ | ✅ | ✅ |

### Technology Recommendations

**RDBMS (PostgreSQL, MySQL):**
- **Best for**: Traditional applications, complex transactions, reporting
- **Examples**: E-commerce, CRM, ERP systems
- **Pros**: ACID compliance, mature ecosystem, SQL familiarity
- **Cons**: Vertical scaling limitations, rigid schema

**Document Stores (MongoDB, CouchDB):**
- **Best for**: Content management, catalogs, user profiles
- **Examples**: Blogging platforms, product catalogs
- **Pros**: Schema flexibility, horizontal scaling, developer-friendly
- **Cons**: Limited transaction support, eventual consistency

**Key-Value Stores (Redis, DynamoDB):**
- **Best for**: Caching, session storage, real-time applications
- **Examples**: Gaming leaderboards, shopping carts
- **Pros**: High performance, simple model, excellent scaling
- **Cons**: Limited query capabilities, no relationships

**Graph Databases (Neo4j, Amazon Neptune):**
- **Best for**: Social networks, recommendation engines, fraud detection
- **Examples**: LinkedIn connections, recommendation systems
- **Pros**: Relationship queries, pattern matching, traversals
- **Cons**: Learning curve, limited ecosystem

**Time-Series (InfluxDB, TimescaleDB):**
- **Best for**: Monitoring, IoT, financial data
- **Examples**: Application metrics, sensor data
- **Pros**: Optimized for time-based data, compression, analytics
- **Cons**: Specialized use case, limited general-purpose features

## Best Practices

### Data Modeling Guidelines

**1. Understand Your Access Patterns:**
- Identify read vs. write patterns
- Determine query requirements
- Consider data growth patterns
- Plan for future requirements

**2. Choose the Right Consistency Model:**
- **Strong Consistency**: Financial transactions, inventory
- **Eventual Consistency**: Social media feeds, recommendations
- **Causal Consistency**: Collaborative editing, messaging

**3. Design for Scale:**
- Plan partitioning strategy early
- Consider data distribution
- Design efficient indexes
- Minimize cross-partition queries

**4. Optimize for Performance:**
- Denormalize when appropriate
- Use appropriate data types
- Implement effective caching
- Monitor and optimize queries

### Common Pitfalls

**1. Over-Normalization:**
- **Problem**: Too many joins affecting performance
- **Solution**: Strategic denormalization for read-heavy workloads

**2. Ignoring Access Patterns:**
- **Problem**: Designing schema without understanding queries
- **Solution**: Model based on how data will be accessed

**3. Wrong Technology Choice:**
- **Problem**: Using RDBMS for everything or NoSQL for everything
- **Solution**: Choose technology based on specific requirements

**4. Poor Partitioning Strategy:**
- **Problem**: Uneven data distribution, hot partitions
- **Solution**: Choose partition keys that distribute data evenly

---

**Next Topic**: [Testing Strategies](testing_strategies.md)
**Previous Topic**: [System Design Interview Preparation](system_design_interview_preparation.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)