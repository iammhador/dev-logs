# Chapter 15: System Design Interview Preparation

## Overview

System design interviews are a crucial part of the technical interview process for senior engineering roles. This chapter provides a comprehensive guide to preparing for and excelling in system design interviews, covering common patterns, frameworks, and real-world scenarios.

## Interview Framework

### The SCALE Framework

**S** - **Scope**: Clarify requirements and constraints
**C** - **Capacity**: Estimate scale and performance needs
**A** - **Architecture**: Design high-level system architecture
**L** - **Logic**: Detail key components and algorithms
**E** - **Evolve**: Discuss scaling and optimization strategies

### Step-by-Step Approach

**1. Requirements Gathering (5-10 minutes)**
- Functional requirements: What should the system do?
- Non-functional requirements: Scale, performance, availability
- Constraints: Time, budget, technology limitations

**2. Capacity Estimation (5-10 minutes)**
- Users: Daily/Monthly active users
- Data: Storage requirements, growth rate
- Traffic: Read/Write ratio, peak loads
- Bandwidth: Network requirements

**3. High-Level Design (15-20 minutes)**
- Core components and their interactions
- Data flow between components
- Technology choices and justifications

**4. Detailed Design (15-20 minutes)**
- Database schema design
- API design
- Algorithm details
- Caching strategies

**5. Scale and Optimize (10-15 minutes)**
- Identify bottlenecks
- Scaling strategies
- Performance optimizations
- Monitoring and alerting

## Common System Design Questions

### 1. Design a URL Shortener (like bit.ly)

#### Requirements Analysis

**Functional Requirements:**
- Shorten long URLs to short URLs
- Redirect short URLs to original URLs
- Custom aliases (optional)
- Analytics (click tracking)

**Non-Functional Requirements:**
- 100M URLs shortened per day
- 100:1 read/write ratio
- 99.9% availability
- Low latency (<100ms)

#### Capacity Estimation

```python
# Traffic Estimation
class CapacityEstimator:
    def __init__(self):
        self.urls_per_day = 100_000_000
        self.read_write_ratio = 100
        self.seconds_per_day = 24 * 60 * 60
        
    def calculate_qps(self):
        write_qps = self.urls_per_day / self.seconds_per_day
        read_qps = write_qps * self.read_write_ratio
        
        return {
            'write_qps': write_qps,  # ~1,160 QPS
            'read_qps': read_qps,    # ~116,000 QPS
            'peak_read_qps': read_qps * 2  # ~232,000 QPS
        }
    
    def calculate_storage(self):
        # Assuming 5-year retention
        total_urls = self.urls_per_day * 365 * 5
        
        # Each URL record: 500 bytes average
        storage_bytes = total_urls * 500
        storage_gb = storage_bytes / (1024 ** 3)
        
        return {
            'total_urls': total_urls,      # ~182.5 billion
            'storage_gb': storage_gb       # ~85 TB
        }

estimator = CapacityEstimator()
print("QPS:", estimator.calculate_qps())
print("Storage:", estimator.calculate_storage())
```

#### System Architecture

```python
from typing import Optional, Dict
import hashlib
import base64
import time

class URLShortener:
    def __init__(self):
        self.base_url = "https://short.ly/"
        self.counter = 0
        self.url_mapping = {}  # In production: distributed database
        self.analytics = {}    # In production: analytics service
    
    def encode_base62(self, num: int) -> str:
        """Convert number to base62 string"""
        chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        if num == 0:
            return chars[0]
        
        result = []
        while num > 0:
            result.append(chars[num % 62])
            num //= 62
        
        return ''.join(reversed(result))
    
    def generate_short_code(self, long_url: str, custom_alias: Optional[str] = None) -> str:
        """Generate short code for URL"""
        if custom_alias:
            if custom_alias in self.url_mapping:
                raise ValueError("Custom alias already exists")
            return custom_alias
        
        # Counter-based approach for guaranteed uniqueness
        self.counter += 1
        return self.encode_base62(self.counter)
    
    def shorten_url(self, long_url: str, custom_alias: Optional[str] = None) -> str:
        """Shorten a long URL"""
        # Validate URL
        if not long_url.startswith(('http://', 'https://')):
            raise ValueError("Invalid URL format")
        
        short_code = self.generate_short_code(long_url, custom_alias)
        
        # Store mapping
        self.url_mapping[short_code] = {
            'long_url': long_url,
            'created_at': time.time(),
            'click_count': 0
        }
        
        return f"{self.base_url}{short_code}"
    
    def expand_url(self, short_code: str) -> Optional[str]:
        """Expand short code to original URL"""
        if short_code not in self.url_mapping:
            return None
        
        # Update analytics
        self.url_mapping[short_code]['click_count'] += 1
        
        # In production: async analytics update
        self.update_analytics(short_code)
        
        return self.url_mapping[short_code]['long_url']
    
    def update_analytics(self, short_code: str):
        """Update analytics data"""
        timestamp = int(time.time())
        if short_code not in self.analytics:
            self.analytics[short_code] = []
        
        self.analytics[short_code].append(timestamp)
    
    def get_analytics(self, short_code: str) -> Dict:
        """Get analytics for a short URL"""
        if short_code not in self.url_mapping:
            return {}
        
        url_data = self.url_mapping[short_code]
        clicks = self.analytics.get(short_code, [])
        
        return {
            'total_clicks': url_data['click_count'],
            'created_at': url_data['created_at'],
            'click_timeline': clicks
        }

# Usage Example
shortener = URLShortener()

# Shorten URLs
short_url1 = shortener.shorten_url("https://www.example.com/very/long/url/path")
short_url2 = shortener.shorten_url("https://www.google.com", "google")

print(f"Short URL 1: {short_url1}")
print(f"Short URL 2: {short_url2}")

# Expand URLs
original1 = shortener.expand_url("1")
original2 = shortener.expand_url("google")

print(f"Original URL 1: {original1}")
print(f"Original URL 2: {original2}")

# Analytics
analytics = shortener.get_analytics("1")
print(f"Analytics: {analytics}")
```

#### Database Design

```sql
-- URL Mappings Table
CREATE TABLE url_mappings (
    short_code VARCHAR(10) PRIMARY KEY,
    long_url TEXT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Analytics Table
CREATE TABLE url_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2),
    INDEX idx_short_code_time (short_code, clicked_at),
    FOREIGN KEY (short_code) REFERENCES url_mappings(short_code)
);

-- Users Table (if user accounts are supported)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_type ENUM('free', 'premium') DEFAULT 'free'
);
```

### 2. Design a Chat System (like WhatsApp)

#### Requirements Analysis

**Functional Requirements:**
- One-on-one messaging
- Group messaging
- Online presence indicators
- Message delivery status
- Push notifications

**Non-Functional Requirements:**
- 500M daily active users
- 40 billion messages per day
- Real-time messaging (<100ms latency)
- 99.99% availability

#### System Architecture

```python
import asyncio
import json
import time
from typing import Dict, List, Set
from enum import Enum
from dataclasses import dataclass

class MessageStatus(Enum):
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"

class UserStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    AWAY = "away"

@dataclass
class Message:
    id: str
    sender_id: str
    recipient_id: str
    content: str
    timestamp: float
    status: MessageStatus
    message_type: str = "text"  # text, image, video, etc.

@dataclass
class User:
    id: str
    username: str
    status: UserStatus
    last_seen: float
    device_tokens: List[str]  # For push notifications

class ChatServer:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.user_connections: Dict[str, Set[str]] = {}  # user_id -> connection_ids
        self.messages: Dict[str, List[Message]] = {}  # conversation_id -> messages
        self.message_queue = asyncio.Queue()
    
    async def connect_user(self, user_id: str, connection_id: str):
        """Handle user connection"""
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        
        self.user_connections[user_id].add(connection_id)
        
        # Update user status
        if user_id in self.users:
            self.users[user_id].status = UserStatus.ONLINE
            await self.broadcast_presence_update(user_id, UserStatus.ONLINE)
    
    async def disconnect_user(self, user_id: str, connection_id: str):
        """Handle user disconnection"""
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(connection_id)
            
            # If no more connections, mark as offline
            if not self.user_connections[user_id]:
                if user_id in self.users:
                    self.users[user_id].status = UserStatus.OFFLINE
                    self.users[user_id].last_seen = time.time()
                    await self.broadcast_presence_update(user_id, UserStatus.OFFLINE)
    
    async def send_message(self, message: Message) -> bool:
        """Send a message between users"""
        # Generate conversation ID
        conversation_id = self.get_conversation_id(message.sender_id, message.recipient_id)
        
        # Store message
        if conversation_id not in self.messages:
            self.messages[conversation_id] = []
        
        self.messages[conversation_id].append(message)
        
        # Try to deliver immediately if recipient is online
        if await self.is_user_online(message.recipient_id):
            await self.deliver_message(message)
            message.status = MessageStatus.DELIVERED
        else:
            # Queue for later delivery
            await self.message_queue.put(message)
            # Send push notification
            await self.send_push_notification(message)
        
        return True
    
    async def deliver_message(self, message: Message):
        """Deliver message to online recipient"""
        recipient_connections = self.user_connections.get(message.recipient_id, set())
        
        message_data = {
            'type': 'new_message',
            'message': {
                'id': message.id,
                'sender_id': message.sender_id,
                'content': message.content,
                'timestamp': message.timestamp,
                'message_type': message.message_type
            }
        }
        
        # In a real implementation, this would send via WebSocket
        for connection_id in recipient_connections:
            print(f"Delivering to connection {connection_id}: {message_data}")
    
    async def mark_message_read(self, message_id: str, user_id: str):
        """Mark message as read"""
        # Find and update message status
        for conversation_messages in self.messages.values():
            for message in conversation_messages:
                if message.id == message_id and message.recipient_id == user_id:
                    message.status = MessageStatus.READ
                    
                    # Notify sender about read status
                    await self.send_read_receipt(message)
                    break
    
    async def send_read_receipt(self, message: Message):
        """Send read receipt to message sender"""
        sender_connections = self.user_connections.get(message.sender_id, set())
        
        receipt_data = {
            'type': 'read_receipt',
            'message_id': message.id,
            'read_by': message.recipient_id,
            'read_at': time.time()
        }
        
        for connection_id in sender_connections:
            print(f"Sending read receipt to {connection_id}: {receipt_data}")
    
    async def get_conversation_history(self, user1_id: str, user2_id: str, limit: int = 50) -> List[Message]:
        """Get conversation history between two users"""
        conversation_id = self.get_conversation_id(user1_id, user2_id)
        messages = self.messages.get(conversation_id, [])
        
        # Return last N messages
        return messages[-limit:]
    
    async def is_user_online(self, user_id: str) -> bool:
        """Check if user is online"""
        return user_id in self.user_connections and len(self.user_connections[user_id]) > 0
    
    async def broadcast_presence_update(self, user_id: str, status: UserStatus):
        """Broadcast user presence update to contacts"""
        # In a real implementation, this would notify user's contacts
        presence_data = {
            'type': 'presence_update',
            'user_id': user_id,
            'status': status.value,
            'timestamp': time.time()
        }
        
        print(f"Broadcasting presence update: {presence_data}")
    
    async def send_push_notification(self, message: Message):
        """Send push notification for offline users"""
        recipient = self.users.get(message.recipient_id)
        if recipient and recipient.device_tokens:
            notification_data = {
                'title': f"New message from {message.sender_id}",
                'body': message.content[:50] + "..." if len(message.content) > 50 else message.content,
                'data': {
                    'message_id': message.id,
                    'sender_id': message.sender_id
                }
            }
            
            # In a real implementation, this would use FCM/APNS
            print(f"Sending push notification: {notification_data}")
    
    def get_conversation_id(self, user1_id: str, user2_id: str) -> str:
        """Generate consistent conversation ID for two users"""
        return "_".join(sorted([user1_id, user2_id]))

# Usage Example
async def demo_chat_system():
    chat_server = ChatServer()
    
    # Register users
    user1 = User("user1", "Alice", UserStatus.OFFLINE, time.time(), ["device1"])
    user2 = User("user2", "Bob", UserStatus.OFFLINE, time.time(), ["device2"])
    
    chat_server.users["user1"] = user1
    chat_server.users["user2"] = user2
    
    # Connect users
    await chat_server.connect_user("user1", "conn1")
    await chat_server.connect_user("user2", "conn2")
    
    # Send messages
    message1 = Message(
        id="msg1",
        sender_id="user1",
        recipient_id="user2",
        content="Hello Bob!",
        timestamp=time.time(),
        status=MessageStatus.SENT
    )
    
    await chat_server.send_message(message1)
    
    # Mark as read
    await chat_server.mark_message_read("msg1", "user2")
    
    # Get conversation history
    history = await chat_server.get_conversation_history("user1", "user2")
    print(f"Conversation history: {len(history)} messages")

# Run demo
# asyncio.run(demo_chat_system())
```

## Interview Tips and Best Practices

### Communication Strategies

**1. Think Out Loud:**
- Verbalize your thought process
- Explain trade-offs and decisions
- Ask clarifying questions
- Admit when you're unsure

**2. Start High-Level:**
- Begin with overall architecture
- Gradually dive into details
- Don't get stuck on implementation details early
- Focus on system boundaries and interactions

**3. Consider Trade-offs:**
- Discuss pros and cons of different approaches
- Consider consistency vs. availability
- Evaluate cost vs. performance
- Think about operational complexity

### Technical Considerations

**1. Scalability Patterns:**
- Horizontal vs. vertical scaling
- Database sharding strategies
- Caching layers and strategies
- Load balancing approaches

**2. Reliability Patterns:**
- Fault tolerance mechanisms
- Disaster recovery strategies
- Data backup and replication
- Circuit breakers and timeouts

**3. Performance Optimization:**
- Identify bottlenecks
- Caching strategies
- Database optimization
- CDN usage

### Common Mistakes to Avoid

**1. Jumping to Implementation:**
- Don't start coding immediately
- Understand requirements first
- Design high-level architecture
- Then dive into details

**2. Over-Engineering:**
- Don't design for extreme scale initially
- Start simple and evolve
- Focus on core requirements
- Add complexity when needed

**3. Ignoring Non-Functional Requirements:**
- Consider scalability from the start
- Think about availability and reliability
- Plan for monitoring and observability
- Consider security implications

**4. Poor Time Management:**
- Allocate time for each phase
- Don't spend too long on one area
- Leave time for scaling discussion
- Practice time management

## Practice Problems

### Beginner Level

1. **Design a Parking Lot System**
   - Vehicle types and parking spots
   - Pricing and payment processing
   - Availability tracking

2. **Design a Library Management System**
   - Book catalog and inventory
   - User accounts and borrowing
   - Search and recommendations

3. **Design a Vending Machine**
   - Product inventory
   - Payment processing
   - Change dispensing

### Intermediate Level

1. **Design a Social Media Feed**
   - User posts and interactions
   - Timeline generation
   - Content ranking algorithms

2. **Design a Ride-Sharing Service**
   - Driver and rider matching
   - Real-time location tracking
   - Pricing and payments

3. **Design a Video Streaming Platform**
   - Video upload and processing
   - Content delivery network
   - User recommendations

### Advanced Level

1. **Design a Distributed Cache**
   - Consistent hashing
   - Replication strategies
   - Failure handling

2. **Design a Search Engine**
   - Web crawling and indexing
   - Query processing
   - Ranking algorithms

3. **Design a Cryptocurrency Exchange**
   - Order matching engine
   - Wallet management
   - Security and compliance

## Preparation Resources

### Books
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "System Design Interview" by Alex Xu
- "Building Microservices" by Sam Newman
- "High Performance MySQL" by Baron Schwartz

### Online Resources
- High Scalability blog
- AWS Architecture Center
- Google Cloud Architecture Framework
- System Design Primer (GitHub)

### Practice Platforms
- LeetCode System Design
- Pramp System Design
- InterviewBit System Design
- Grokking the System Design Interview

## Key Takeaways

### Success Factors

**1. Structured Approach:**
- Follow a consistent framework
- Manage time effectively
- Cover all important aspects
- Practice regularly

**2. Technical Depth:**
- Understand fundamental concepts
- Know common patterns and trade-offs
- Stay updated with industry trends
- Learn from real-world systems

**3. Communication Skills:**
- Explain complex concepts clearly
- Ask thoughtful questions
- Collaborate effectively with interviewer
- Handle feedback gracefully

### Final Advice

**1. Practice Regularly:**
- Work through different problem types
- Time yourself during practice
- Get feedback from peers
- Review and improve

**2. Learn from Real Systems:**
- Study architecture blogs and papers
- Understand how large-scale systems work
- Follow engineering blogs of major companies
- Attend technical conferences and talks

**3. Stay Current:**
- Keep up with new technologies
- Understand emerging patterns
- Learn from industry best practices
- Continuously improve your knowledge

---

**Congratulations!** You've completed the comprehensive System Design Dev Log. This guide covers everything from basic concepts to advanced patterns and interview preparation. Use it as a reference for learning, practicing, and excelling in system design.

**Previous Chapter**: [Chapter 14: Real-World System Design](chapter-14.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)