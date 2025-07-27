# Chapter 6: Message Queues and Event Processing

## Overview

Message queues and event processing systems enable asynchronous communication between services, improving system scalability, reliability, and decoupling. They allow applications to handle high loads, process tasks in the background, and maintain system responsiveness.

## Message Queue Fundamentals

### 1. Core Concepts

**Producer:** Application that sends messages to the queue
**Consumer:** Application that receives and processes messages from the queue
**Queue:** Storage mechanism that holds messages until they are processed
**Broker:** Message queue server that manages queues and routes messages

### 2. Message Queue Patterns

**Point-to-Point (Queue):**
```
Producer → Queue → Consumer
```
- One message is consumed by exactly one consumer
- Messages are removed from queue after consumption
- Load balancing across multiple consumers

**Publish-Subscribe (Topic):**
```
Publisher → Topic → Subscriber 1
              ↓
            Subscriber 2
              ↓
            Subscriber 3
```
- One message can be consumed by multiple subscribers
- Messages are broadcast to all interested parties
- Decoupled communication pattern

**Request-Reply:**
```
Client → Request Queue → Server
  ↑                        ↓
Reply Queue ← Response ←────┘
```
- Synchronous-like communication over async infrastructure
- Client waits for response with correlation ID

## Popular Message Queue Systems

### 1. Redis (Simple Queue)

**Basic Queue Implementation:**
```python
import redis
import json
import time
from typing import Optional, Dict, Any

class RedisQueue:
    def __init__(self, redis_client, queue_name):
        self.redis = redis_client
        self.queue_name = queue_name
    
    def enqueue(self, message: Dict[str, Any], priority: int = 0):
        """Add message to queue with optional priority"""
        message_data = {
            'id': f"{time.time()}_{hash(str(message))}",
            'timestamp': time.time(),
            'payload': message,
            'priority': priority,
            'retry_count': 0
        }
        
        # Use sorted set for priority queue
        self.redis.zadd(
            self.queue_name, 
            {json.dumps(message_data): priority}
        )
        
        return message_data['id']
    
    def dequeue(self, timeout: int = 0) -> Optional[Dict[str, Any]]:
        """Remove and return highest priority message"""
        # Get highest priority message (lowest score)
        result = self.redis.bzpopmin(self.queue_name, timeout=timeout)
        
        if result:
            queue_name, message_json, score = result
            return json.loads(message_json)
        
        return None
    
    def peek(self) -> Optional[Dict[str, Any]]:
        """Look at next message without removing it"""
        result = self.redis.zrange(self.queue_name, 0, 0, withscores=True)
        
        if result:
            message_json, score = result[0]
            return json.loads(message_json)
        
        return None
    
    def size(self) -> int:
        """Get queue size"""
        return self.redis.zcard(self.queue_name)
    
    def clear(self):
        """Clear all messages from queue"""
        self.redis.delete(self.queue_name)

# Usage example
redis_client = redis.Redis(host='localhost', port=6379, db=0)
queue = RedisQueue(redis_client, 'task_queue')

# Producer
queue.enqueue({
    'task_type': 'send_email',
    'recipient': 'user@example.com',
    'subject': 'Welcome!',
    'body': 'Welcome to our platform!'
}, priority=1)

queue.enqueue({
    'task_type': 'process_image',
    'image_url': 'https://example.com/image.jpg',
    'transformations': ['resize', 'compress']
}, priority=5)

# Consumer
while True:
    message = queue.dequeue(timeout=10)
    if message:
        try:
            process_task(message['payload'])
            print(f"Processed task: {message['id']}")
        except Exception as e:
            print(f"Error processing task {message['id']}: {e}")
            # Could implement retry logic here
    else:
        print("No messages in queue")
```

**Redis Pub/Sub Implementation:**
```python
import redis
import json
import threading
from typing import Callable, Dict, Any

class RedisPubSub:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.pubsub = self.redis.pubsub()
        self.subscribers = {}
        self.running = False
    
    def publish(self, channel: str, message: Dict[str, Any]):
        """Publish message to channel"""
        message_data = {
            'timestamp': time.time(),
            'payload': message
        }
        
        self.redis.publish(channel, json.dumps(message_data))
    
    def subscribe(self, channel: str, callback: Callable[[Dict[str, Any]], None]):
        """Subscribe to channel with callback function"""
        self.pubsub.subscribe(channel)
        self.subscribers[channel] = callback
    
    def start_listening(self):
        """Start listening for messages in background thread"""
        self.running = True
        
        def listen():
            for message in self.pubsub.listen():
                if not self.running:
                    break
                
                if message['type'] == 'message':
                    channel = message['channel'].decode('utf-8')
                    data = json.loads(message['data'].decode('utf-8'))
                    
                    if channel in self.subscribers:
                        try:
                            self.subscribers[channel](data)
                        except Exception as e:
                            print(f"Error in subscriber for {channel}: {e}")
        
        self.listener_thread = threading.Thread(target=listen)
        self.listener_thread.start()
    
    def stop_listening(self):
        """Stop listening for messages"""
        self.running = False
        self.pubsub.close()
        if hasattr(self, 'listener_thread'):
            self.listener_thread.join()

# Usage example
pubsub = RedisPubSub(redis_client)

# Subscriber 1: Email service
def handle_user_events(message):
    event_type = message['payload']['event_type']
    user_data = message['payload']['user_data']
    
    if event_type == 'user_registered':
        send_welcome_email(user_data['email'])
    elif event_type == 'user_updated':
        update_email_preferences(user_data)

pubsub.subscribe('user_events', handle_user_events)

# Subscriber 2: Analytics service
def handle_analytics_events(message):
    event_data = message['payload']
    track_user_action(event_data)

pubsub.subscribe('user_events', handle_analytics_events)

# Start listening
pubsub.start_listening()

# Publisher: User service
pubsub.publish('user_events', {
    'event_type': 'user_registered',
    'user_data': {
        'id': 123,
        'email': 'newuser@example.com',
        'username': 'newuser'
    }
})
```

### 2. RabbitMQ (Advanced Messaging)

**Basic Queue Setup:**
```python
import pika
import json
import time
from typing import Dict, Any, Callable

class RabbitMQQueue:
    def __init__(self, host='localhost', port=5672, username='guest', password='guest'):
        credentials = pika.PlainCredentials(username, password)
        parameters = pika.ConnectionParameters(
            host=host,
            port=port,
            credentials=credentials
        )
        
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()
    
    def declare_queue(self, queue_name: str, durable: bool = True):
        """Declare a queue"""
        self.channel.queue_declare(queue=queue_name, durable=durable)
    
    def publish_message(self, queue_name: str, message: Dict[str, Any], 
                      persistent: bool = True):
        """Publish message to queue"""
        properties = None
        if persistent:
            properties = pika.BasicProperties(delivery_mode=2)  # Make message persistent
        
        self.channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=properties
        )
    
    def consume_messages(self, queue_name: str, callback: Callable[[Dict[str, Any]], bool]):
        """Consume messages from queue"""
        def wrapper(ch, method, properties, body):
            try:
                message = json.loads(body)
                success = callback(message)
                
                if success:
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                else:
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
            except Exception as e:
                print(f"Error processing message: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        self.channel.basic_qos(prefetch_count=1)  # Fair dispatch
        self.channel.basic_consume(queue=queue_name, on_message_callback=wrapper)
        
        print(f"Waiting for messages from {queue_name}. To exit press CTRL+C")
        self.channel.start_consuming()
    
    def close(self):
        """Close connection"""
        self.connection.close()

# Producer
producer = RabbitMQQueue()
producer.declare_queue('email_queue')

# Send email task
producer.publish_message('email_queue', {
    'task_id': 'email_001',
    'recipient': 'user@example.com',
    'subject': 'Order Confirmation',
    'template': 'order_confirmation',
    'data': {
        'order_id': 'ORD-12345',
        'total': 99.99
    }
})

producer.close()

# Consumer
consumer = RabbitMQQueue()
consumer.declare_queue('email_queue')

def process_email_task(message: Dict[str, Any]) -> bool:
    """Process email sending task"""
    try:
        print(f"Processing email task: {message['task_id']}")
        
        # Simulate email sending
        send_email(
            recipient=message['recipient'],
            subject=message['subject'],
            template=message['template'],
            data=message['data']
        )
        
        print(f"Email sent successfully: {message['task_id']}")
        return True
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

# Start consuming
consumer.consume_messages('email_queue', process_email_task)
```

**RabbitMQ Exchange Patterns:**
```python
class RabbitMQExchange:
    def __init__(self, host='localhost'):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host)
        )
        self.channel = self.connection.channel()
    
    def setup_direct_exchange(self, exchange_name: str):
        """Direct exchange - route by exact routing key match"""
        self.channel.exchange_declare(
            exchange=exchange_name,
            exchange_type='direct',
            durable=True
        )
    
    def setup_topic_exchange(self, exchange_name: str):
        """Topic exchange - route by pattern matching"""
        self.channel.exchange_declare(
            exchange=exchange_name,
            exchange_type='topic',
            durable=True
        )
    
    def setup_fanout_exchange(self, exchange_name: str):
        """Fanout exchange - broadcast to all queues"""
        self.channel.exchange_declare(
            exchange=exchange_name,
            exchange_type='fanout',
            durable=True
        )
    
    def bind_queue_to_exchange(self, queue_name: str, exchange_name: str, 
                              routing_key: str = ''):
        """Bind queue to exchange with routing key"""
        self.channel.queue_declare(queue=queue_name, durable=True)
        self.channel.queue_bind(
            exchange=exchange_name,
            queue=queue_name,
            routing_key=routing_key
        )
    
    def publish_to_exchange(self, exchange_name: str, routing_key: str, 
                           message: Dict[str, Any]):
        """Publish message to exchange"""
        self.channel.basic_publish(
            exchange=exchange_name,
            routing_key=routing_key,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )

# Example: Order processing system
exchange = RabbitMQExchange()

# Setup topic exchange for order events
exchange.setup_topic_exchange('order_events')

# Bind queues with different routing patterns
exchange.bind_queue_to_exchange('payment_queue', 'order_events', 'order.payment.*')
exchange.bind_queue_to_exchange('shipping_queue', 'order_events', 'order.shipping.*')
exchange.bind_queue_to_exchange('inventory_queue', 'order_events', 'order.*.created')
exchange.bind_queue_to_exchange('analytics_queue', 'order_events', 'order.*')

# Publish different order events
exchange.publish_to_exchange('order_events', 'order.payment.created', {
    'order_id': 'ORD-001',
    'amount': 99.99,
    'payment_method': 'credit_card'
})

exchange.publish_to_exchange('order_events', 'order.shipping.created', {
    'order_id': 'ORD-001',
    'address': '123 Main St',
    'shipping_method': 'express'
})

exchange.publish_to_exchange('order_events', 'order.inventory.created', {
    'order_id': 'ORD-001',
    'items': [{'sku': 'ITEM-001', 'quantity': 2}]
})
```

### 3. Apache Kafka (High-Throughput Streaming)

**Kafka Producer:**
```python
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
import json
import time
from typing import Dict, Any, Optional

class KafkaMessageProducer:
    def __init__(self, bootstrap_servers=['localhost:9092']):
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            key_serializer=lambda k: k.encode('utf-8') if k else None,
            acks='all',  # Wait for all replicas to acknowledge
            retries=3,
            batch_size=16384,
            linger_ms=10,  # Wait up to 10ms to batch messages
            compression_type='gzip'
        )
    
    def send_message(self, topic: str, message: Dict[str, Any], 
                    key: Optional[str] = None, partition: Optional[int] = None):
        """Send message to Kafka topic"""
        try:
            # Add metadata
            enriched_message = {
                'timestamp': time.time(),
                'message_id': f"{time.time()}_{hash(str(message))}",
                'payload': message
            }
            
            future = self.producer.send(
                topic=topic,
                value=enriched_message,
                key=key,
                partition=partition
            )
            
            # Wait for message to be sent
            record_metadata = future.get(timeout=10)
            
            return {
                'topic': record_metadata.topic,
                'partition': record_metadata.partition,
                'offset': record_metadata.offset,
                'message_id': enriched_message['message_id']
            }
            
        except KafkaError as e:
            print(f"Failed to send message: {e}")
            raise
    
    def send_batch(self, topic: str, messages: list, keys: Optional[list] = None):
        """Send multiple messages in batch"""
        results = []
        
        for i, message in enumerate(messages):
            key = keys[i] if keys and i < len(keys) else None
            result = self.send_message(topic, message, key)
            results.append(result)
        
        return results
    
    def close(self):
        """Close producer and flush pending messages"""
        self.producer.flush()
        self.producer.close()

# Usage example
producer = KafkaMessageProducer()

# Send user activity events
user_events = [
    {
        'event_type': 'page_view',
        'user_id': 'user_123',
        'page': '/products',
        'session_id': 'session_456'
    },
    {
        'event_type': 'add_to_cart',
        'user_id': 'user_123',
        'product_id': 'prod_789',
        'quantity': 2
    },
    {
        'event_type': 'purchase',
        'user_id': 'user_123',
        'order_id': 'order_101',
        'total': 99.99
    }
]

# Send events with user_id as key for partitioning
for event in user_events:
    result = producer.send_message(
        topic='user_activity',
        message=event,
        key=event['user_id']
    )
    print(f"Sent event to partition {result['partition']}, offset {result['offset']}")

producer.close()
```

**Kafka Consumer:**
```python
class KafkaMessageConsumer:
    def __init__(self, topics, group_id, bootstrap_servers=['localhost:9092']):
        self.consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=bootstrap_servers,
            group_id=group_id,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
            auto_offset_reset='earliest',  # Start from beginning if no offset
            enable_auto_commit=False,  # Manual commit for better control
            max_poll_records=100,
            session_timeout_ms=30000,
            heartbeat_interval_ms=10000
        )
    
    def consume_messages(self, message_handler):
        """Consume messages and process with handler function"""
        try:
            for message in self.consumer:
                try:
                    # Process message
                    success = message_handler({
                        'topic': message.topic,
                        'partition': message.partition,
                        'offset': message.offset,
                        'key': message.key,
                        'value': message.value,
                        'timestamp': message.timestamp
                    })
                    
                    if success:
                        # Commit offset after successful processing
                        self.consumer.commit()
                    else:
                        print(f"Failed to process message at offset {message.offset}")
                        # Could implement retry logic or dead letter queue
                        
                except Exception as e:
                    print(f"Error processing message: {e}")
                    # Skip this message and continue
                    self.consumer.commit()
                    
        except KeyboardInterrupt:
            print("Stopping consumer...")
        finally:
            self.consumer.close()
    
    def consume_batch(self, batch_handler, max_records=100, timeout_ms=1000):
        """Consume messages in batches"""
        try:
            while True:
                message_batch = self.consumer.poll(
                    timeout_ms=timeout_ms,
                    max_records=max_records
                )
                
                if message_batch:
                    # Process batch
                    batch_data = []
                    for topic_partition, messages in message_batch.items():
                        for message in messages:
                            batch_data.append({
                                'topic': message.topic,
                                'partition': message.partition,
                                'offset': message.offset,
                                'key': message.key,
                                'value': message.value,
                                'timestamp': message.timestamp
                            })
                    
                    success = batch_handler(batch_data)
                    
                    if success:
                        self.consumer.commit()
                    else:
                        print("Failed to process batch")
                        
        except KeyboardInterrupt:
            print("Stopping batch consumer...")
        finally:
            self.consumer.close()

# Consumer example: Real-time analytics
def process_user_activity(message_data):
    """Process user activity events for real-time analytics"""
    try:
        event = message_data['value']['payload']
        user_id = event['user_id']
        event_type = event['event_type']
        
        print(f"Processing {event_type} for user {user_id}")
        
        # Update real-time metrics
        if event_type == 'page_view':
            increment_page_view_counter(event['page'])
            update_user_session(user_id, event['session_id'])
            
        elif event_type == 'add_to_cart':
            track_cart_addition(user_id, event['product_id'])
            
        elif event_type == 'purchase':
            record_purchase(user_id, event['order_id'], event['total'])
            trigger_recommendation_update(user_id)
        
        return True
        
    except Exception as e:
        print(f"Error processing user activity: {e}")
        return False

# Start consumer
consumer = KafkaMessageConsumer(
    topics=['user_activity'],
    group_id='analytics_service'
)

consumer.consume_messages(process_user_activity)
```

**Kafka Streams Processing:**
```python
from kafka import KafkaProducer, KafkaConsumer
import json
from collections import defaultdict, deque
import time
from typing import Dict, Any

class KafkaStreamProcessor:
    def __init__(self, input_topic, output_topic, bootstrap_servers=['localhost:9092']):
        self.input_topic = input_topic
        self.output_topic = output_topic
        
        self.consumer = KafkaConsumer(
            input_topic,
            bootstrap_servers=bootstrap_servers,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id='stream_processor'
        )
        
        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        # State stores for windowed operations
        self.window_store = defaultdict(lambda: deque())
        self.window_size = 60  # 60 seconds
    
    def process_stream(self):
        """Process stream with windowed aggregations"""
        try:
            for message in self.consumer:
                event = message.value['payload']
                current_time = time.time()
                
                # Clean old events from window
                self.clean_window(current_time)
                
                # Add current event to window
                self.add_to_window(event, current_time)
                
                # Process event and generate output
                result = self.process_event(event, current_time)
                
                if result:
                    # Send result to output topic
                    self.producer.send(self.output_topic, result)
                    
        except KeyboardInterrupt:
            print("Stopping stream processor...")
        finally:
            self.consumer.close()
            self.producer.close()
    
    def clean_window(self, current_time):
        """Remove events older than window size"""
        cutoff_time = current_time - self.window_size
        
        for key in list(self.window_store.keys()):
            window = self.window_store[key]
            while window and window[0]['timestamp'] < cutoff_time:
                window.popleft()
            
            # Remove empty windows
            if not window:
                del self.window_store[key]
    
    def add_to_window(self, event, timestamp):
        """Add event to appropriate window"""
        key = self.get_window_key(event)
        self.window_store[key].append({
            'event': event,
            'timestamp': timestamp
        })
    
    def get_window_key(self, event):
        """Determine window key for event (e.g., user_id, product_id)"""
        return event.get('user_id', 'global')
    
    def process_event(self, event, current_time):
        """Process individual event and generate aggregated result"""
        if event['event_type'] == 'page_view':
            return self.calculate_page_view_metrics(event, current_time)
        elif event['event_type'] == 'purchase':
            return self.calculate_purchase_metrics(event, current_time)
        
        return None
    
    def calculate_page_view_metrics(self, event, current_time):
        """Calculate page view metrics for current window"""
        user_id = event['user_id']
        window = self.window_store[user_id]
        
        # Count page views in current window
        page_views = sum(1 for item in window 
                        if item['event']['event_type'] == 'page_view')
        
        # Calculate unique pages viewed
        unique_pages = len(set(item['event']['page'] 
                              for item in window 
                              if item['event']['event_type'] == 'page_view'))
        
        return {
            'metric_type': 'user_activity_window',
            'user_id': user_id,
            'window_start': current_time - self.window_size,
            'window_end': current_time,
            'page_views': page_views,
            'unique_pages': unique_pages,
            'timestamp': current_time
        }
    
    def calculate_purchase_metrics(self, event, current_time):
        """Calculate purchase metrics for current window"""
        user_id = event['user_id']
        window = self.window_store[user_id]
        
        # Calculate total spent in window
        total_spent = sum(item['event']['total'] 
                         for item in window 
                         if item['event']['event_type'] == 'purchase')
        
        # Count purchases
        purchase_count = sum(1 for item in window 
                           if item['event']['event_type'] == 'purchase')
        
        return {
            'metric_type': 'user_purchase_window',
            'user_id': user_id,
            'window_start': current_time - self.window_size,
            'window_end': current_time,
            'total_spent': total_spent,
            'purchase_count': purchase_count,
            'average_order_value': total_spent / purchase_count if purchase_count > 0 else 0,
            'timestamp': current_time
        }

# Start stream processor
processor = KafkaStreamProcessor(
    input_topic='user_activity',
    output_topic='user_metrics'
)

processor.process_stream()
```

## Event-Driven Architecture

### 1. Event Sourcing Pattern

```python
import json
import time
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class Event:
    event_id: str
    event_type: str
    aggregate_id: str
    data: Dict[str, Any]
    timestamp: float
    version: int

class EventStore:
    def __init__(self):
        self.events = []  # In production, use database
        self.snapshots = {}  # For performance optimization
    
    def append_event(self, event: Event):
        """Append event to store"""
        self.events.append(event)
    
    def get_events(self, aggregate_id: str, from_version: int = 0) -> List[Event]:
        """Get events for aggregate from specific version"""
        return [
            event for event in self.events
            if event.aggregate_id == aggregate_id and event.version > from_version
        ]
    
    def save_snapshot(self, aggregate_id: str, version: int, state: Dict[str, Any]):
        """Save aggregate snapshot for performance"""
        self.snapshots[aggregate_id] = {
            'version': version,
            'state': state,
            'timestamp': time.time()
        }
    
    def get_snapshot(self, aggregate_id: str) -> Optional[Dict[str, Any]]:
        """Get latest snapshot for aggregate"""
        return self.snapshots.get(aggregate_id)

class Aggregate(ABC):
    def __init__(self, aggregate_id: str):
        self.aggregate_id = aggregate_id
        self.version = 0
        self.uncommitted_events = []
    
    @abstractmethod
    def apply_event(self, event: Event):
        """Apply event to aggregate state"""
        pass
    
    def raise_event(self, event_type: str, data: Dict[str, Any]):
        """Raise new event"""
        event = Event(
            event_id=f"{time.time()}_{hash(str(data))}",
            event_type=event_type,
            aggregate_id=self.aggregate_id,
            data=data,
            timestamp=time.time(),
            version=self.version + 1
        )
        
        self.uncommitted_events.append(event)
        self.apply_event(event)
        self.version += 1
    
    def mark_events_as_committed(self):
        """Mark events as committed after saving to store"""
        self.uncommitted_events = []

class UserAggregate(Aggregate):
    def __init__(self, user_id: str):
        super().__init__(user_id)
        self.email = None
        self.username = None
        self.is_active = False
        self.created_at = None
    
    def apply_event(self, event: Event):
        """Apply event to user state"""
        if event.event_type == 'UserCreated':
            self.email = event.data['email']
            self.username = event.data['username']
            self.is_active = True
            self.created_at = event.timestamp
            
        elif event.event_type == 'UserEmailUpdated':
            self.email = event.data['new_email']
            
        elif event.event_type == 'UserDeactivated':
            self.is_active = False
            
        elif event.event_type == 'UserReactivated':
            self.is_active = True
    
    def create_user(self, email: str, username: str):
        """Create new user"""
        if self.created_at:
            raise ValueError("User already exists")
        
        self.raise_event('UserCreated', {
            'email': email,
            'username': username
        })
    
    def update_email(self, new_email: str):
        """Update user email"""
        if not self.is_active:
            raise ValueError("Cannot update inactive user")
        
        if self.email == new_email:
            return  # No change needed
        
        self.raise_event('UserEmailUpdated', {
            'old_email': self.email,
            'new_email': new_email
        })
    
    def deactivate(self):
        """Deactivate user"""
        if not self.is_active:
            return  # Already inactive
        
        self.raise_event('UserDeactivated', {})
    
    def reactivate(self):
        """Reactivate user"""
        if self.is_active:
            return  # Already active
        
        self.raise_event('UserReactivated', {})

class Repository:
    def __init__(self, event_store: EventStore):
        self.event_store = event_store
    
    def save(self, aggregate: Aggregate):
        """Save aggregate events to store"""
        for event in aggregate.uncommitted_events:
            self.event_store.append_event(event)
        
        aggregate.mark_events_as_committed()
    
    def get_by_id(self, aggregate_id: str, aggregate_class) -> Aggregate:
        """Reconstruct aggregate from events"""
        aggregate = aggregate_class(aggregate_id)
        
        # Try to load from snapshot first
        snapshot = self.event_store.get_snapshot(aggregate_id)
        from_version = 0
        
        if snapshot:
            # Restore from snapshot
            aggregate.version = snapshot['version']
            # Apply snapshot state to aggregate
            for key, value in snapshot['state'].items():
                setattr(aggregate, key, value)
            from_version = snapshot['version']
        
        # Apply events after snapshot
        events = self.event_store.get_events(aggregate_id, from_version)
        for event in events:
            aggregate.apply_event(event)
            aggregate.version = event.version
        
        return aggregate

# Usage example
event_store = EventStore()
repository = Repository(event_store)

# Create user
user = UserAggregate('user_123')
user.create_user('john@example.com', 'johndoe')
repository.save(user)

# Update user
user.update_email('john.doe@example.com')
user.deactivate()
repository.save(user)

# Reconstruct user from events
reconstructed_user = repository.get_by_id('user_123', UserAggregate)
print(f"User email: {reconstructed_user.email}")
print(f"User active: {reconstructed_user.is_active}")
print(f"User version: {reconstructed_user.version}")
```

### 2. CQRS (Command Query Responsibility Segregation)

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import asyncio

# Command side (Write model)
class Command(ABC):
    pass

class CreateUserCommand(Command):
    def __init__(self, user_id: str, email: str, username: str):
        self.user_id = user_id
        self.email = email
        self.username = username

class UpdateUserEmailCommand(Command):
    def __init__(self, user_id: str, new_email: str):
        self.user_id = user_id
        self.new_email = new_email

class CommandHandler(ABC):
    @abstractmethod
    async def handle(self, command: Command):
        pass

class UserCommandHandler(CommandHandler):
    def __init__(self, repository: Repository, event_bus):
        self.repository = repository
        self.event_bus = event_bus
    
    async def handle(self, command: Command):
        if isinstance(command, CreateUserCommand):
            await self.handle_create_user(command)
        elif isinstance(command, UpdateUserEmailCommand):
            await self.handle_update_email(command)
    
    async def handle_create_user(self, command: CreateUserCommand):
        user = UserAggregate(command.user_id)
        user.create_user(command.email, command.username)
        
        self.repository.save(user)
        
        # Publish events to event bus
        for event in user.uncommitted_events:
            await self.event_bus.publish(event)
    
    async def handle_update_email(self, command: UpdateUserEmailCommand):
        user = self.repository.get_by_id(command.user_id, UserAggregate)
        user.update_email(command.new_email)
        
        self.repository.save(user)
        
        # Publish events
        for event in user.uncommitted_events:
            await self.event_bus.publish(event)

# Query side (Read model)
class UserReadModel:
    def __init__(self):
        self.users = {}  # In production, use optimized read database
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.users.get(user_id)
    
    def get_users_by_email_domain(self, domain: str) -> List[Dict[str, Any]]:
        return [
            user for user in self.users.values()
            if user['email'].endswith(f'@{domain}')
        ]
    
    def get_active_users(self) -> List[Dict[str, Any]]:
        return [
            user for user in self.users.values()
            if user['is_active']
        ]
    
    def update_user(self, user_id: str, data: Dict[str, Any]):
        if user_id in self.users:
            self.users[user_id].update(data)
        else:
            self.users[user_id] = data

class UserProjection:
    """Event handler that updates read model"""
    
    def __init__(self, read_model: UserReadModel):
        self.read_model = read_model
    
    async def handle_event(self, event: Event):
        if event.event_type == 'UserCreated':
            await self.handle_user_created(event)
        elif event.event_type == 'UserEmailUpdated':
            await self.handle_user_email_updated(event)
        elif event.event_type == 'UserDeactivated':
            await self.handle_user_deactivated(event)
        elif event.event_type == 'UserReactivated':
            await self.handle_user_reactivated(event)
    
    async def handle_user_created(self, event: Event):
        self.read_model.update_user(event.aggregate_id, {
            'user_id': event.aggregate_id,
            'email': event.data['email'],
            'username': event.data['username'],
            'is_active': True,
            'created_at': event.timestamp,
            'version': event.version
        })
    
    async def handle_user_email_updated(self, event: Event):
        user = self.read_model.get_user(event.aggregate_id)
        if user:
            user['email'] = event.data['new_email']
            user['version'] = event.version
    
    async def handle_user_deactivated(self, event: Event):
        user = self.read_model.get_user(event.aggregate_id)
        if user:
            user['is_active'] = False
            user['version'] = event.version
    
    async def handle_user_reactivated(self, event: Event):
        user = self.read_model.get_user(event.aggregate_id)
        if user:
            user['is_active'] = True
            user['version'] = event.version

class EventBus:
    def __init__(self):
        self.handlers = []
    
    def subscribe(self, handler):
        self.handlers.append(handler)
    
    async def publish(self, event: Event):
        for handler in self.handlers:
            try:
                await handler.handle_event(event)
            except Exception as e:
                print(f"Error in event handler: {e}")

# Application service that coordinates commands and queries
class UserApplicationService:
    def __init__(self, command_handler: UserCommandHandler, read_model: UserReadModel):
        self.command_handler = command_handler
        self.read_model = read_model
    
    # Command methods (write operations)
    async def create_user(self, user_id: str, email: str, username: str):
        command = CreateUserCommand(user_id, email, username)
        await self.command_handler.handle(command)
    
    async def update_user_email(self, user_id: str, new_email: str):
        command = UpdateUserEmailCommand(user_id, new_email)
        await self.command_handler.handle(command)
    
    # Query methods (read operations)
    def get_user(self, user_id: str):
        return self.read_model.get_user(user_id)
    
    def get_users_by_domain(self, domain: str):
        return self.read_model.get_users_by_email_domain(domain)
    
    def get_active_users(self):
        return self.read_model.get_active_users()

# Setup CQRS system
async def setup_cqrs_system():
    # Setup components
    event_store = EventStore()
    repository = Repository(event_store)
    event_bus = EventBus()
    
    # Setup command side
    command_handler = UserCommandHandler(repository, event_bus)
    
    # Setup query side
    read_model = UserReadModel()
    projection = UserProjection(read_model)
    event_bus.subscribe(projection)
    
    # Setup application service
    app_service = UserApplicationService(command_handler, read_model)
    
    return app_service

# Usage example
async def main():
    app_service = await setup_cqrs_system()
    
    # Create users (commands)
    await app_service.create_user('user_1', 'alice@example.com', 'alice')
    await app_service.create_user('user_2', 'bob@company.com', 'bob')
    
    # Update user (command)
    await app_service.update_user_email('user_1', 'alice.smith@example.com')
    
    # Query users (queries)
    user = app_service.get_user('user_1')
    print(f"User: {user}")
    
    company_users = app_service.get_users_by_domain('company.com')
    print(f"Company users: {company_users}")
    
    active_users = app_service.get_active_users()
    print(f"Active users: {len(active_users)}")

# Run example
# asyncio.run(main())
```

## Message Queue Reliability Patterns

### 1. Dead Letter Queue

```python
import json
import time
from typing import Dict, Any, Optional

class ReliableMessageProcessor:
    def __init__(self, main_queue, dead_letter_queue, max_retries=3):
        self.main_queue = main_queue
        self.dead_letter_queue = dead_letter_queue
        self.max_retries = max_retries
    
    def process_message_with_retry(self, message: Dict[str, Any]) -> bool:
        """Process message with retry logic and dead letter handling"""
        retry_count = message.get('retry_count', 0)
        
        try:
            # Attempt to process message
            success = self.process_message(message['payload'])
            
            if success:
                return True
            else:
                return self.handle_processing_failure(message, retry_count)
                
        except Exception as e:
            print(f"Error processing message: {e}")
            return self.handle_processing_failure(message, retry_count, str(e))
    
    def handle_processing_failure(self, message: Dict[str, Any], 
                                retry_count: int, error: Optional[str] = None) -> bool:
        """Handle message processing failure"""
        if retry_count < self.max_retries:
            # Retry with exponential backoff
            retry_delay = 2 ** retry_count  # 1s, 2s, 4s, 8s...
            
            retry_message = {
                **message,
                'retry_count': retry_count + 1,
                'last_error': error,
                'retry_at': time.time() + retry_delay
            }
            
            # Schedule retry (in production, use delayed queue)
            self.schedule_retry(retry_message, retry_delay)
            return True
            
        else:
            # Send to dead letter queue
            dead_letter_message = {
                **message,
                'failed_at': time.time(),
                'final_error': error,
                'total_retries': retry_count
            }
            
            self.dead_letter_queue.enqueue(dead_letter_message)
            print(f"Message sent to dead letter queue after {retry_count} retries")
            return False
    
    def process_message(self, payload: Dict[str, Any]) -> bool:
        """Override this method with actual message processing logic"""
        # Simulate processing that might fail
        if payload.get('should_fail', False):
            raise Exception("Simulated processing failure")
        
        print(f"Successfully processed message: {payload}")
        return True
    
    def schedule_retry(self, message: Dict[str, Any], delay: int):
        """Schedule message for retry after delay"""
        # In production, use a delayed queue or scheduler
        print(f"Scheduling retry in {delay} seconds for message: {message['id']}")
        # For demo, just re-queue immediately
        self.main_queue.enqueue(message)
    
    def process_dead_letter_queue(self):
        """Process messages in dead letter queue for manual intervention"""
        while True:
            message = self.dead_letter_queue.dequeue(timeout=1)
            if not message:
                break
            
            print(f"Dead letter message: {message}")
            
            # Manual intervention logic
            if self.should_retry_dead_letter(message):
                # Reset retry count and re-queue
                retry_message = {
                    **message,
                    'retry_count': 0,
                    'reprocessed_at': time.time()
                }
                self.main_queue.enqueue(retry_message)
                print(f"Requeued dead letter message: {message['id']}")
    
    def should_retry_dead_letter(self, message: Dict[str, Any]) -> bool:
        """Determine if dead letter message should be retried"""
        # Implement business logic for dead letter retry
        # For example, retry if error was temporary
        error = message.get('final_error', '')
        return 'timeout' in error.lower() or 'connection' in error.lower()
```

### 2. Circuit Breaker Pattern

```python
import time
from enum import Enum
from typing import Callable, Any

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60, expected_exception=Exception):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.expected_exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        return (time.time() - self.last_failure_time) >= self.timeout
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.state = CircuitState.CLOSED
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

class MessageProcessorWithCircuitBreaker:
    def __init__(self):
        # Circuit breakers for different external services
        self.email_circuit = CircuitBreaker(
            failure_threshold=3,
            timeout=30,
            expected_exception=EmailServiceException
        )
        
        self.payment_circuit = CircuitBreaker(
            failure_threshold=5,
            timeout=60,
            expected_exception=PaymentServiceException
        )
    
    def process_order_message(self, message: Dict[str, Any]):
        """Process order with circuit breaker protection"""
        order_data = message['payload']
        
        try:
            # Process payment with circuit breaker
            payment_result = self.payment_circuit.call(
                self.process_payment,
                order_data['payment_info']
            )
            
            # Send confirmation email with circuit breaker
            self.email_circuit.call(
                self.send_confirmation_email,
                order_data['customer_email'],
                order_data['order_id']
            )
            
            return True
            
        except Exception as e:
            print(f"Order processing failed: {e}")
            
            # Handle partial failure
            if 'payment_result' in locals() and payment_result:
                # Payment succeeded but email failed
                self.schedule_email_retry(order_data)
            
            return False
    
    def process_payment(self, payment_info: Dict[str, Any]):
        """Simulate payment processing that might fail"""
        # Simulate external payment service call
        if payment_info.get('should_fail', False):
            raise PaymentServiceException("Payment service unavailable")
        
        return {'transaction_id': 'txn_123', 'status': 'completed'}
    
    def send_confirmation_email(self, email: str, order_id: str):
        """Simulate email sending that might fail"""
        # Simulate external email service call
        if email.endswith('@fail.com'):
            raise EmailServiceException("Email service unavailable")
        
        print(f"Confirmation email sent to {email} for order {order_id}")
    
    def schedule_email_retry(self, order_data: Dict[str, Any]):
        """Schedule email retry for later"""
        # In production, send to retry queue
        print(f"Scheduling email retry for order {order_data['order_id']}")

class EmailServiceException(Exception):
    pass

class PaymentServiceException(Exception):
    pass
```

## Performance Optimization

### 1. Message Batching

```python
import asyncio
import time
from typing import List, Dict, Any, Callable
from collections import deque

class BatchProcessor:
    def __init__(self, batch_size=100, max_wait_time=5.0, processor_func=None):
        self.batch_size = batch_size
        self.max_wait_time = max_wait_time
        self.processor_func = processor_func
        
        self.batch = deque()
        self.last_batch_time = time.time()
        self.processing = False
    
    async def add_message(self, message: Dict[str, Any]):
        """Add message to batch"""
        self.batch.append(message)
        
        # Check if batch should be processed
        if (len(self.batch) >= self.batch_size or 
            time.time() - self.last_batch_time >= self.max_wait_time):
            await self.process_batch()
    
    async def process_batch(self):
        """Process current batch"""
        if self.processing or not self.batch:
            return
        
        self.processing = True
        
        try:
            # Extract current batch
            current_batch = list(self.batch)
            self.batch.clear()
            self.last_batch_time = time.time()
            
            # Process batch
            if self.processor_func:
                await self.processor_func(current_batch)
            else:
                await self.default_batch_processor(current_batch)
                
        finally:
            self.processing = False
    
    async def default_batch_processor(self, messages: List[Dict[str, Any]]):
        """Default batch processing implementation"""
        print(f"Processing batch of {len(messages)} messages")
        
        # Group messages by type for efficient processing
        message_groups = {}
        for message in messages:
            msg_type = message.get('type', 'default')
            if msg_type not in message_groups:
                message_groups[msg_type] = []
            message_groups[msg_type].append(message)
        
        # Process each group
        for msg_type, group_messages in message_groups.items():
            await self.process_message_group(msg_type, group_messages)
    
    async def process_message_group(self, message_type: str, messages: List[Dict[str, Any]]):
        """Process group of messages of same type"""
        if message_type == 'email':
            await self.batch_send_emails(messages)
        elif message_type == 'database_update':
            await self.batch_database_updates(messages)
        elif message_type == 'analytics':
            await self.batch_analytics_events(messages)
        else:
            # Process individually
            for message in messages:
                await self.process_single_message(message)
    
    async def batch_send_emails(self, messages: List[Dict[str, Any]]):
        """Send multiple emails in batch"""
        email_data = []
        for message in messages:
            payload = message['payload']
            email_data.append({
                'to': payload['recipient'],
                'subject': payload['subject'],
                'body': payload['body']
            })
        
        # Simulate batch email sending
        print(f"Sending {len(email_data)} emails in batch")
        # In production: await email_service.send_batch(email_data)
    
    async def batch_database_updates(self, messages: List[Dict[str, Any]]):
        """Perform multiple database updates in batch"""
        updates = []
        for message in messages:
            payload = message['payload']
            updates.append({
                'table': payload['table'],
                'id': payload['id'],
                'data': payload['data']
            })
        
        # Simulate batch database update
        print(f"Performing {len(updates)} database updates in batch")
        # In production: await database.batch_update(updates)
    
    async def batch_analytics_events(self, messages: List[Dict[str, Any]]):
        """Send multiple analytics events in batch"""
        events = [message['payload'] for message in messages]
        
        # Simulate batch analytics
        print(f"Sending {len(events)} analytics events in batch")
        # In production: await analytics_service.track_batch(events)
    
    async def process_single_message(self, message: Dict[str, Any]]):
        """Process individual message"""
        print(f"Processing single message: {message['id']}")
    
    async def flush(self):
        """Force process any remaining messages in batch"""
        if self.batch:
            await self.process_batch()

# Usage example
async def main():
    batch_processor = BatchProcessor(batch_size=10, max_wait_time=2.0)
    
    # Simulate incoming messages
    for i in range(25):
        message = {
            'id': f'msg_{i}',
            'type': 'email' if i % 3 == 0 else 'analytics',
            'payload': {
                'recipient': f'user{i}@example.com',
                'subject': f'Message {i}',
                'body': f'This is message number {i}'
            }
        }
        
        await batch_processor.add_message(message)
        await asyncio.sleep(0.1)  # Simulate message arrival rate
    
    # Flush any remaining messages
    await batch_processor.flush()

# asyncio.run(main())
```

### 2. Connection Pooling

```python
import asyncio
import aioredis
from typing import Optional, Dict, Any
from contextlib import asynccontextmanager

class ConnectionPool:
    def __init__(self, max_connections=10, host='localhost', port=6379):
        self.max_connections = max_connections
        self.host = host
        self.port = port
        self.pool = None
        self.active_connections = 0
    
    async def initialize(self):
        """Initialize connection pool"""
        self.pool = aioredis.ConnectionPool.from_url(
            f"redis://{self.host}:{self.port}",
            max_connections=self.max_connections,
            retry_on_timeout=True
        )
    
    @asynccontextmanager
    async def get_connection(self):
        """Get connection from pool with context manager"""
        if not self.pool:
            await self.initialize()
        
        connection = aioredis.Redis(connection_pool=self.pool)
        self.active_connections += 1
        
        try:
            yield connection
        finally:
            self.active_connections -= 1
    
    async def close(self):
        """Close all connections in pool"""
        if self.pool:
            await self.pool.disconnect()

class PooledMessageQueue:
    def __init__(self, connection_pool: ConnectionPool):
        self.pool = connection_pool
    
    async def enqueue(self, queue_name: str, message: Dict[str, Any]):
        """Enqueue message using pooled connection"""
        async with self.pool.get_connection() as redis:
            await redis.lpush(queue_name, json.dumps(message))
    
    async def dequeue(self, queue_name: str, timeout: int = 0) -> Optional[Dict[str, Any]]:
        """Dequeue message using pooled connection"""
        async with self.pool.get_connection() as redis:
            result = await redis.brpop(queue_name, timeout=timeout)
            if result:
                _, message_json = result
                return json.loads(message_json)
            return None
    
    async def batch_enqueue(self, queue_name: str, messages: list):
        """Enqueue multiple messages efficiently"""
        async with self.pool.get_connection() as redis:
            pipe = redis.pipeline()
            for message in messages:
                pipe.lpush(queue_name, json.dumps(message))
            await pipe.execute()
```

## Monitoring and Observability

### 1. Message Queue Metrics

```python
import time
import asyncio
from typing import Dict, Any
from dataclasses import dataclass, field
from collections import defaultdict

@dataclass
class QueueMetrics:
    queue_name: str
    messages_produced: int = 0
    messages_consumed: int = 0
    messages_failed: int = 0
    total_processing_time: float = 0.0
    average_processing_time: float = 0.0
    queue_depth: int = 0
    last_updated: float = field(default_factory=time.time)

class MetricsCollector:
    def __init__(self):
        self.queue_metrics = defaultdict(lambda: QueueMetrics(""))
        self.processing_times = defaultdict(list)
    
    def record_message_produced(self, queue_name: str):
        """Record message production"""
        metrics = self.queue_metrics[queue_name]
        metrics.queue_name = queue_name
        metrics.messages_produced += 1
        metrics.last_updated = time.time()
    
    def record_message_consumed(self, queue_name: str, processing_time: float, success: bool = True):
        """Record message consumption"""
        metrics = self.queue_metrics[queue_name]
        metrics.queue_name = queue_name
        
        if success:
            metrics.messages_consumed += 1
            metrics.total_processing_time += processing_time
            
            # Calculate rolling average
            self.processing_times[queue_name].append(processing_time)
            if len(self.processing_times[queue_name]) > 100:  # Keep last 100 measurements
                self.processing_times[queue_name].pop(0)
            
            metrics.average_processing_time = sum(self.processing_times[queue_name]) / len(self.processing_times[queue_name])
        else:
            metrics.messages_failed += 1
        
        metrics.last_updated = time.time()
    
    def update_queue_depth(self, queue_name: str, depth: int):
        """Update queue depth"""
        metrics = self.queue_metrics[queue_name]
        metrics.queue_name = queue_name
        metrics.queue_depth = depth
        metrics.last_updated = time.time()
    
    def get_metrics(self, queue_name: str) -> QueueMetrics:
        """Get metrics for specific queue"""
        return self.queue_metrics[queue_name]
    
    def get_all_metrics(self) -> Dict[str, QueueMetrics]:
        """Get metrics for all queues"""
        return dict(self.queue_metrics)
    
    def calculate_throughput(self, queue_name: str, window_seconds: int = 60) -> Dict[str, float]:
        """Calculate throughput metrics"""
        metrics = self.queue_metrics[queue_name]
        current_time = time.time()
        
        # In production, you'd track time-windowed metrics
        return {
            'messages_per_second': metrics.messages_consumed / max(1, current_time - (current_time - window_seconds)),
            'error_rate': metrics.messages_failed / max(1, metrics.messages_consumed + metrics.messages_failed),
            'average_processing_time': metrics.average_processing_time
        }

class MonitoredMessageQueue:
    def __init__(self, queue, metrics_collector: MetricsCollector):
        self.queue = queue
        self.metrics = metrics_collector
    
    async def enqueue(self, queue_name: str, message: Dict[str, Any]):
        """Enqueue with metrics"""
        await self.queue.enqueue(queue_name, message)
        self.metrics.record_message_produced(queue_name)
        
        # Update queue depth
        depth = await self.get_queue_depth(queue_name)
        self.metrics.update_queue_depth(queue_name, depth)
    
    async def dequeue_and_process(self, queue_name: str, processor_func, timeout: int = 0):
        """Dequeue and process with metrics"""
        start_time = time.time()
        
        try:
            message = await self.queue.dequeue(queue_name, timeout)
            if not message:
                return None
            
            # Process message
            success = await processor_func(message)
            processing_time = time.time() - start_time
            
            self.metrics.record_message_consumed(queue_name, processing_time, success)
            
            # Update queue depth
            depth = await self.get_queue_depth(queue_name)
            self.metrics.update_queue_depth(queue_name, depth)
            
            return message
            
        except Exception as e:
            processing_time = time.time() - start_time
            self.metrics.record_message_consumed(queue_name, processing_time, False)
            raise e
    
    async def get_queue_depth(self, queue_name: str) -> int:
        """Get current queue depth"""
        # Implementation depends on queue type
        return self.queue.size() if hasattr(self.queue, 'size') else 0
```

### 2. Health Checks and Alerting

```python
import asyncio
import logging
from typing import Dict, Any, List, Callable
from enum import Enum

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

class HealthCheck:
    def __init__(self, name: str, check_func: Callable, threshold: Dict[str, Any]):
        self.name = name
        self.check_func = check_func
        self.threshold = threshold
        self.last_status = HealthStatus.HEALTHY
        self.last_check_time = 0
    
    async def run_check(self) -> Dict[str, Any]:
        """Run health check"""
        try:
            start_time = time.time()
            result = await self.check_func()
            check_duration = time.time() - start_time
            
            status = self.evaluate_status(result)
            
            self.last_status = status
            self.last_check_time = time.time()
            
            return {
                'name': self.name,
                'status': status.value,
                'result': result,
                'check_duration': check_duration,
                'timestamp': self.last_check_time
            }
            
        except Exception as e:
            self.last_status = HealthStatus.UNHEALTHY
            self.last_check_time = time.time()
            
            return {
                'name': self.name,
                'status': HealthStatus.UNHEALTHY.value,
                'error': str(e),
                'timestamp': self.last_check_time
            }
    
    def evaluate_status(self, result: Dict[str, Any]) -> HealthStatus:
        """Evaluate health status based on result and thresholds"""
        # Queue depth check
        if 'queue_depth' in result and 'max_queue_depth' in self.threshold:
            if result['queue_depth'] > self.threshold['max_queue_depth']:
                return HealthStatus.UNHEALTHY
            elif result['queue_depth'] > self.threshold['max_queue_depth'] * 0.8:
                return HealthStatus.DEGRADED
        
        # Error rate check
        if 'error_rate' in result and 'max_error_rate' in self.threshold:
            if result['error_rate'] > self.threshold['max_error_rate']:
                return HealthStatus.UNHEALTHY
            elif result['error_rate'] > self.threshold['max_error_rate'] * 0.8:
                return HealthStatus.DEGRADED
        
        # Processing time check
        if 'avg_processing_time' in result and 'max_processing_time' in self.threshold:
            if result['avg_processing_time'] > self.threshold['max_processing_time']:
                return HealthStatus.DEGRADED
        
        return HealthStatus.HEALTHY

class QueueHealthMonitor:
    def __init__(self, metrics_collector: MetricsCollector):
        self.metrics = metrics_collector
        self.health_checks = []
        self.alert_handlers = []
    
    def add_health_check(self, health_check: HealthCheck):
        """Add health check"""
        self.health_checks.append(health_check)
    
    def add_alert_handler(self, handler: Callable):
        """Add alert handler"""
        self.alert_handlers.append(handler)
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks"""
        results = []
        overall_status = HealthStatus.HEALTHY
        
        for check in self.health_checks:
            result = await check.run_check()
            results.append(result)
            
            # Determine overall status
            if result['status'] == HealthStatus.UNHEALTHY.value:
                overall_status = HealthStatus.UNHEALTHY
            elif result['status'] == HealthStatus.DEGRADED.value and overall_status == HealthStatus.HEALTHY:
                overall_status = HealthStatus.DEGRADED
        
        health_report = {
            'overall_status': overall_status.value,
            'checks': results,
            'timestamp': time.time()
        }
        
        # Send alerts if needed
        await self.handle_alerts(health_report)
        
        return health_report
    
    async def handle_alerts(self, health_report: Dict[str, Any]):
        """Handle alerts based on health report"""
        if health_report['overall_status'] != HealthStatus.HEALTHY.value:
            for handler in self.alert_handlers:
                try:
                    await handler(health_report)
                except Exception as e:
                    logging.error(f"Alert handler failed: {e}")
    
    async def start_monitoring(self, check_interval: int = 30):
        """Start continuous monitoring"""
        while True:
            try:
                health_report = await self.run_all_checks()
                logging.info(f"Health check completed: {health_report['overall_status']}")
                
                await asyncio.sleep(check_interval)
                
            except Exception as e:
                logging.error(f"Health monitoring error: {e}")
                await asyncio.sleep(check_interval)

# Health check implementations
async def queue_depth_check(queue_name: str, queue) -> Dict[str, Any]:
    """Check queue depth"""
    depth = await queue.get_queue_depth(queue_name)
    return {'queue_depth': depth}

async def error_rate_check(queue_name: str, metrics: MetricsCollector) -> Dict[str, Any]:
    """Check error rate"""
    queue_metrics = metrics.get_metrics(queue_name)
    total_messages = queue_metrics.messages_consumed + queue_metrics.messages_failed
    error_rate = queue_metrics.messages_failed / max(1, total_messages)
    
    return {
        'error_rate': error_rate,
        'total_messages': total_messages,
        'failed_messages': queue_metrics.messages_failed
    }

async def processing_time_check(queue_name: str, metrics: MetricsCollector) -> Dict[str, Any]:
    """Check average processing time"""
    queue_metrics = metrics.get_metrics(queue_name)
    
    return {
        'avg_processing_time': queue_metrics.average_processing_time,
        'total_processing_time': queue_metrics.total_processing_time
    }

# Alert handlers
async def log_alert_handler(health_report: Dict[str, Any]):
    """Log alert to file"""
    logging.warning(f"Queue health alert: {health_report}")

async def email_alert_handler(health_report: Dict[str, Any]):
    """Send email alert"""
    # Implementation would send actual email
    print(f"EMAIL ALERT: Queue health issue detected - {health_report['overall_status']}")

async def slack_alert_handler(health_report: Dict[str, Any]):
    """Send Slack alert"""
    # Implementation would send to Slack webhook
    print(f"SLACK ALERT: Queue health issue detected - {health_report['overall_status']}")
```

## Real-World Use Cases

### 1. E-commerce Order Processing

```python
class OrderProcessingSystem:
    def __init__(self):
        self.order_queue = RedisQueue(redis_client, 'orders')
        self.payment_queue = RedisQueue(redis_client, 'payments')
        self.inventory_queue = RedisQueue(redis_client, 'inventory')
        self.shipping_queue = RedisQueue(redis_client, 'shipping')
        self.notification_queue = RedisQueue(redis_client, 'notifications')
    
    async def process_new_order(self, order_data: Dict[str, Any]):
        """Process new order through multiple stages"""
        order_id = order_data['order_id']
        
        try:
            # Stage 1: Validate and reserve inventory
            inventory_task = {
                'task_type': 'reserve_inventory',
                'order_id': order_id,
                'items': order_data['items']
            }
            self.inventory_queue.enqueue(inventory_task)
            
            # Stage 2: Process payment
            payment_task = {
                'task_type': 'process_payment',
                'order_id': order_id,
                'amount': order_data['total'],
                'payment_method': order_data['payment_method']
            }
            self.payment_queue.enqueue(payment_task)
            
            # Stage 3: Create shipping label (after payment)
            shipping_task = {
                'task_type': 'create_shipping_label',
                'order_id': order_id,
                'address': order_data['shipping_address'],
                'items': order_data['items']
            }
            self.shipping_queue.enqueue(shipping_task)
            
            # Stage 4: Send confirmation notification
            notification_task = {
                'task_type': 'order_confirmation',
                'order_id': order_id,
                'customer_email': order_data['customer_email'],
                'order_details': order_data
            }
            self.notification_queue.enqueue(notification_task)
            
            return {'status': 'queued', 'order_id': order_id}
            
        except Exception as e:
            # Handle order processing failure
            await self.handle_order_failure(order_id, str(e))
            raise e
    
    async def handle_order_failure(self, order_id: str, error: str):
        """Handle order processing failure"""
        failure_notification = {
            'task_type': 'order_failure_notification',
            'order_id': order_id,
            'error': error,
            'timestamp': time.time()
        }
        self.notification_queue.enqueue(failure_notification)
```

### 2. Real-time Analytics Pipeline

```python
class AnalyticsPipeline:
    def __init__(self):
        self.raw_events_topic = 'raw_events'
        self.processed_events_topic = 'processed_events'
        self.aggregated_metrics_topic = 'aggregated_metrics'
        
        self.producer = KafkaMessageProducer()
        self.stream_processor = KafkaStreamProcessor(
            self.raw_events_topic,
            self.processed_events_topic
        )
    
    async def ingest_user_event(self, event_data: Dict[str, Any]):
        """Ingest raw user event"""
        enriched_event = {
            'event_id': f"{time.time()}_{hash(str(event_data))}",
            'timestamp': time.time(),
            'user_id': event_data['user_id'],
            'event_type': event_data['event_type'],
            'properties': event_data.get('properties', {}),
            'session_id': event_data.get('session_id'),
            'device_info': event_data.get('device_info', {})
        }
        
        # Send to raw events topic
        await self.producer.send_message(
            self.raw_events_topic,
            enriched_event,
            key=event_data['user_id']
        )
    
    async def process_events_stream(self):
        """Process events in real-time"""
        consumer = KafkaMessageConsumer(
            [self.raw_events_topic],
            'analytics_processor'
        )
        
        async def process_event(message_data):
            event = message_data['value']['payload']
            
            # Enrich event with additional data
            enriched_event = await self.enrich_event(event)
            
            # Apply business rules
            processed_event = await self.apply_business_rules(enriched_event)
            
            # Send to processed events topic
            await self.producer.send_message(
                self.processed_events_topic,
                processed_event,
                key=event['user_id']
            )
            
            return True
        
        await consumer.consume_messages(process_event)
    
    async def enrich_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich event with additional context"""
        # Add user profile data
        user_profile = await self.get_user_profile(event['user_id'])
        
        # Add session context
        session_data = await self.get_session_data(event.get('session_id'))
        
        # Add geolocation
        geo_data = await self.get_geo_data(event.get('ip_address'))
        
        return {
            **event,
            'user_profile': user_profile,
            'session_data': session_data,
            'geo_data': geo_data,
            'enriched_at': time.time()
        }
    
    async def apply_business_rules(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Apply business rules to event"""
        # Calculate derived metrics
        if event['event_type'] == 'page_view':
            event['is_bounce'] = await self.calculate_bounce(event)
            event['page_category'] = await self.categorize_page(event['properties']['page'])
        
        elif event['event_type'] == 'purchase':
            event['customer_ltv'] = await self.calculate_ltv(event['user_id'])
            event['product_category'] = await self.get_product_category(event['properties']['product_id'])
        
        return event
```

## Best Practices

### 1. Message Design
- **Idempotency:** Design messages to be safely processed multiple times
- **Schema Evolution:** Use versioned message schemas for backward compatibility
- **Message Size:** Keep messages small and reference large data by ID
- **Correlation IDs:** Include correlation IDs for tracing across services

### 2. Error Handling
- **Retry Logic:** Implement exponential backoff for transient failures
- **Dead Letter Queues:** Handle messages that consistently fail
- **Circuit Breakers:** Protect against cascading failures
- **Monitoring:** Track error rates and processing times

### 3. Performance
- **Batching:** Process messages in batches when possible
- **Connection Pooling:** Reuse connections to reduce overhead
- **Partitioning:** Use message keys for even distribution
- **Compression:** Compress large messages to reduce network overhead

### 4. Security
- **Authentication:** Secure access to message queues
- **Encryption:** Encrypt sensitive message content
- **Network Security:** Use TLS for message transmission
- **Access Control:** Implement fine-grained permissions

### 5. Operational Excellence
- **Monitoring:** Implement comprehensive metrics and alerting
- **Documentation:** Document message schemas and processing logic
- **Testing:** Test message processing under various failure scenarios
- **Capacity Planning:** Monitor and plan for queue capacity needs

## Next Steps

In the next chapter, we'll explore microservices architecture patterns, including service discovery, inter-service communication, and distributed system challenges that build upon the messaging patterns covered here.