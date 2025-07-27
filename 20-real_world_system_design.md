# Chapter 14: Real-World System Design

## Overview

This chapter examines real-world system architectures of major tech companies, analyzing their design decisions, trade-offs, and evolution over time. We'll explore how theoretical concepts are applied in practice to solve massive scale challenges.

## WhatsApp Architecture

### System Overview

**WhatsApp Scale (2014 Acquisition):**
- **450 million users**
- **50 billion messages per day**
- **32 engineers**
- **$19 billion acquisition**

### Architecture Design

**High-Level Architecture:**
```
[Mobile Apps] → [Load Balancer] → [Chat Servers] → [Message Queue]
                                        ↓              ↓
[Push Notifications] ← [Presence Service] ← [Database Cluster]
```

**Core Components Implementation (Python)**
```python
import asyncio
import time
import json
import hashlib
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, asdict
from enum import Enum
import redis
from collections import defaultdict

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
    from_user: str
    to_user: str
    content: str
    timestamp: float
    message_type: str = "text"
    status: MessageStatus = MessageStatus.SENT
    encrypted: bool = True

@dataclass
class User:
    user_id: str
    phone_number: str
    status: UserStatus
    last_seen: float
    device_tokens: List[str]
    public_key: str

class MessageRouter:
    """Routes messages to appropriate chat servers based on user hash"""
    
    def __init__(self, num_servers: int = 100):
        self.num_servers = num_servers
        self.server_connections: Dict[int, str] = {}  # server_id -> connection_string
    
    def get_server_for_user(self, user_id: str) -> int:
        """Consistent hashing to determine which server handles a user"""
        hash_value = int(hashlib.md5(user_id.encode()).hexdigest(), 16)
        return hash_value % self.num_servers
    
    def route_message(self, message: Message) -> tuple[int, int]:
        """Route message to appropriate servers for sender and receiver"""
        sender_server = self.get_server_for_user(message.from_user)
        receiver_server = self.get_server_for_user(message.to_user)
        return sender_server, receiver_server

class ChatServer:
    """Individual chat server handling a subset of users"""
    
    def __init__(self, server_id: int, redis_client):
        self.server_id = server_id
        self.redis = redis_client
        self.active_connections: Dict[str, asyncio.WebSocketServerProtocol] = {}
        self.user_sessions: Dict[str, Dict] = {}
        self.message_queue = asyncio.Queue()
        
        # Start background tasks
        asyncio.create_task(self._process_message_queue())
        asyncio.create_task(self._heartbeat_checker())
    
    async def handle_user_connection(self, websocket, user_id: str):
        """Handle new user connection"""
        try:
            # Register connection
            self.active_connections[user_id] = websocket
            self.user_sessions[user_id] = {
                'connected_at': time.time(),
                'last_heartbeat': time.time()
            }
            
            # Update user status to online
            await self._update_user_status(user_id, UserStatus.ONLINE)
            
            # Send pending messages
            await self._send_pending_messages(user_id)
            
            # Listen for messages
            async for message in websocket:
                await self._handle_incoming_message(user_id, message)
        
        except Exception as e:
            print(f"Connection error for user {user_id}: {e}")
        
        finally:
            # Clean up connection
            if user_id in self.active_connections:
                del self.active_connections[user_id]
            if user_id in self.user_sessions:
                del self.user_sessions[user_id]
            
            # Update user status to offline
            await self._update_user_status(user_id, UserStatus.OFFLINE)
    
    async def _handle_incoming_message(self, from_user: str, raw_message: str):
        """Process incoming message from user"""
        try:
            data = json.loads(raw_message)
            
            if data['type'] == 'message':
                message = Message(
                    id=data['id'],
                    from_user=from_user,
                    to_user=data['to_user'],
                    content=data['content'],
                    timestamp=time.time(),
                    message_type=data.get('message_type', 'text')
                )
                
                await self.message_queue.put(message)
            
            elif data['type'] == 'heartbeat':
                self.user_sessions[from_user]['last_heartbeat'] = time.time()
            
            elif data['type'] == 'message_ack':
                await self._handle_message_acknowledgment(data['message_id'], data['status'])
        
        except Exception as e:
            print(f"Error handling message from {from_user}: {e}")
    
    async def _process_message_queue(self):
        """Background task to process outgoing messages"""
        while True:
            try:
                message = await self.message_queue.get()
                await self._deliver_message(message)
            except Exception as e:
                print(f"Error processing message queue: {e}")
    
    async def _deliver_message(self, message: Message):
        """Deliver message to recipient"""
        # Store message in database
        await self._store_message(message)
        
        # Try to deliver to online user
        if message.to_user in self.active_connections:
            try:
                websocket = self.active_connections[message.to_user]
                await websocket.send(json.dumps({
                    'type': 'message',
                    'message': asdict(message)
                }))
                
                # Update message status to delivered
                message.status = MessageStatus.DELIVERED
                await self._update_message_status(message.id, MessageStatus.DELIVERED)
            
            except Exception as e:
                print(f"Failed to deliver message to {message.to_user}: {e}")
                # Store for later delivery
                await self._store_pending_message(message)
        else:
            # User offline, store for later delivery
            await self._store_pending_message(message)
            
            # Send push notification
            await self._send_push_notification(message)
    
    async def _store_message(self, message: Message):
        """Store message in Redis"""
        message_key = f"message:{message.id}"
        await self.redis.hset(message_key, mapping=asdict(message))
        await self.redis.expire(message_key, 86400 * 30)  # 30 days retention
        
        # Add to user's message list
        user_messages_key = f"user_messages:{message.to_user}"
        await self.redis.lpush(user_messages_key, message.id)
        await self.redis.ltrim(user_messages_key, 0, 1000)  # Keep last 1000 messages
    
    async def _store_pending_message(self, message: Message):
        """Store message for offline user"""
        pending_key = f"pending:{message.to_user}"
        await self.redis.lpush(pending_key, message.id)
    
    async def _send_pending_messages(self, user_id: str):
        """Send all pending messages to newly connected user"""
        pending_key = f"pending:{user_id}"
        
        while True:
            message_id = await self.redis.rpop(pending_key)
            if not message_id:
                break
            
            # Get message details
            message_key = f"message:{message_id}"
            message_data = await self.redis.hgetall(message_key)
            
            if message_data and user_id in self.active_connections:
                try:
                    websocket = self.active_connections[user_id]
                    await websocket.send(json.dumps({
                        'type': 'message',
                        'message': message_data
                    }))
                    
                    # Update message status
                    await self._update_message_status(message_id, MessageStatus.DELIVERED)
                
                except Exception as e:
                    # Put message back if delivery failed
                    await self.redis.rpush(pending_key, message_id)
                    break
    
    async def _send_push_notification(self, message: Message):
        """Send push notification for offline user"""
        # Get user's device tokens
        user_key = f"user:{message.to_user}"
        device_tokens = await self.redis.lrange(f"{user_key}:devices", 0, -1)
        
        for token in device_tokens:
            # Send push notification (simplified)
            notification_payload = {
                'token': token,
                'title': f"Message from {message.from_user}",
                'body': message.content[:50] + "..." if len(message.content) > 50 else message.content,
                'data': {
                    'message_id': message.id,
                    'from_user': message.from_user
                }
            }
            
            # In real implementation, this would use FCM/APNS
            print(f"Sending push notification: {notification_payload}")
    
    async def _update_user_status(self, user_id: str, status: UserStatus):
        """Update user's online status"""
        user_key = f"user:{user_id}"
        await self.redis.hset(user_key, mapping={
            'status': status.value,
            'last_seen': time.time()
        })
        
        # Notify contacts about status change
        await self._broadcast_status_update(user_id, status)
    
    async def _broadcast_status_update(self, user_id: str, status: UserStatus):
        """Broadcast user status to their contacts"""
        # Get user's contacts
        contacts_key = f"contacts:{user_id}"
        contacts = await self.redis.smembers(contacts_key)
        
        status_update = {
            'type': 'status_update',
            'user_id': user_id,
            'status': status.value,
            'timestamp': time.time()
        }
        
        for contact_id in contacts:
            if contact_id in self.active_connections:
                try:
                    websocket = self.active_connections[contact_id]
                    await websocket.send(json.dumps(status_update))
                except Exception as e:
                    print(f"Failed to send status update to {contact_id}: {e}")
    
    async def _heartbeat_checker(self):
        """Check for inactive connections"""
        while True:
            try:
                current_time = time.time()
                inactive_users = []
                
                for user_id, session in self.user_sessions.items():
                    if current_time - session['last_heartbeat'] > 30:  # 30 seconds timeout
                        inactive_users.append(user_id)
                
                # Disconnect inactive users
                for user_id in inactive_users:
                    if user_id in self.active_connections:
                        await self.active_connections[user_id].close()
                
                await asyncio.sleep(10)  # Check every 10 seconds
            
            except Exception as e:
                print(f"Error in heartbeat checker: {e}")
    
    async def _handle_message_acknowledgment(self, message_id: str, status: str):
        """Handle message read/delivery acknowledgment"""
        await self._update_message_status(message_id, MessageStatus(status))
    
    async def _update_message_status(self, message_id: str, status: MessageStatus):
        """Update message delivery status"""
        message_key = f"message:{message_id}"
        await self.redis.hset(message_key, 'status', status.value)
    
    def get_stats(self) -> Dict:
        """Get server statistics"""
        return {
            'server_id': self.server_id,
            'active_connections': len(self.active_connections),
            'queue_size': self.message_queue.qsize(),
            'active_users': list(self.active_connections.keys())
        }

class WhatsAppCluster:
    """Main WhatsApp cluster coordinator"""
    
    def __init__(self, num_servers: int = 100):
        self.router = MessageRouter(num_servers)
        self.chat_servers: Dict[int, ChatServer] = {}
        self.redis_cluster = {}  # Redis cluster connections
        
        # Initialize chat servers
        for i in range(num_servers):
            redis_client = redis.Redis(host='localhost', port=6379, db=i % 16)
            self.chat_servers[i] = ChatServer(i, redis_client)
    
    async def route_user_connection(self, user_id: str, websocket):
        """Route user connection to appropriate server"""
        server_id = self.router.get_server_for_user(user_id)
        chat_server = self.chat_servers[server_id]
        await chat_server.handle_user_connection(websocket, user_id)
    
    async def send_message(self, message: Message):
        """Send message through the cluster"""
        sender_server, receiver_server = self.router.route_message(message)
        
        # Add message to receiver's server queue
        receiver_chat_server = self.chat_servers[receiver_server]
        await receiver_chat_server.message_queue.put(message)
    
    def get_cluster_stats(self) -> Dict:
        """Get cluster-wide statistics"""
        total_connections = 0
        total_queue_size = 0
        server_stats = []
        
        for server in self.chat_servers.values():
            stats = server.get_stats()
            server_stats.append(stats)
            total_connections += stats['active_connections']
            total_queue_size += stats['queue_size']
        
        return {
            'total_servers': len(self.chat_servers),
            'total_active_connections': total_connections,
            'total_queue_size': total_queue_size,
            'server_stats': server_stats
        }
```

### Key Design Decisions

**1. Erlang/OTP Choice:**
- **Actor Model**: Each user connection as lightweight process
- **Fault Tolerance**: "Let it crash" philosophy
- **Hot Code Swapping**: Zero-downtime deployments
- **Massive Concurrency**: Millions of lightweight processes

**2. Minimal Server Infrastructure:**
- **FreeBSD**: Optimized for network performance
- **Custom Load Balancer**: Efficient connection routing
- **Mnesia Database**: Distributed Erlang database
- **Horizontal Scaling**: Add servers as needed

**3. End-to-End Encryption:**
- **Signal Protocol**: Forward secrecy
- **Key Exchange**: Secure key distribution
- **Message Encryption**: Client-side encryption
- **Metadata Protection**: Minimal server-side data

## YouTube Architecture

### System Overview

**YouTube Scale:**
- **2+ billion logged-in users monthly**
- **1 billion hours watched daily**
- **500 hours uploaded per minute**
- **80+ languages supported**

### Architecture Design

**High-Level Architecture:**
```
[CDN] → [Load Balancer] → [Web Servers] → [Application Servers]
   ↓           ↓              ↓               ↓
[Video Storage] ← [Transcoding] ← [Metadata DB] ← [Analytics]
```

**Video Processing Pipeline (Python)**
```python
import asyncio
import hashlib
import json
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import boto3
from concurrent.futures import ThreadPoolExecutor

class VideoStatus(Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    TRANSCODING = "transcoding"
    READY = "ready"
    FAILED = "failed"

class VideoQuality(Enum):
    Q_144P = "144p"
    Q_240P = "240p"
    Q_360P = "360p"
    Q_480P = "480p"
    Q_720P = "720p"
    Q_1080P = "1080p"
    Q_1440P = "1440p"
    Q_2160P = "2160p"

@dataclass
class VideoMetadata:
    video_id: str
    title: str
    description: str
    uploader_id: str
    upload_time: float
    duration: float
    file_size: int
    original_format: str
    status: VideoStatus
    view_count: int = 0
    like_count: int = 0
    dislike_count: int = 0
    tags: List[str] = None

@dataclass
class VideoVariant:
    video_id: str
    quality: VideoQuality
    format: str
    file_path: str
    file_size: int
    bitrate: int
    codec: str
    resolution: Tuple[int, int]

class VideoUploadHandler:
    """Handles video upload and initial processing"""
    
    def __init__(self, storage_client, max_file_size: int = 128 * 1024 * 1024 * 1024):  # 128GB
        self.storage = storage_client
        self.max_file_size = max_file_size
        self.upload_sessions: Dict[str, Dict] = {}
    
    async def initiate_upload(self, metadata: VideoMetadata) -> str:
        """Initiate chunked video upload"""
        upload_id = hashlib.sha256(f"{metadata.video_id}{time.time()}".encode()).hexdigest()
        
        self.upload_sessions[upload_id] = {
            'video_id': metadata.video_id,
            'metadata': metadata,
            'chunks': {},
            'total_chunks': 0,
            'uploaded_chunks': 0,
            'created_at': time.time()
        }
        
        return upload_id
    
    async def upload_chunk(self, upload_id: str, chunk_number: int, 
                          chunk_data: bytes, is_last_chunk: bool = False) -> bool:
        """Upload video chunk"""
        if upload_id not in self.upload_sessions:
            raise ValueError("Invalid upload session")
        
        session = self.upload_sessions[upload_id]
        
        # Store chunk
        chunk_key = f"uploads/{session['video_id']}/chunk_{chunk_number}"
        await self._store_chunk(chunk_key, chunk_data)
        
        session['chunks'][chunk_number] = {
            'size': len(chunk_data),
            'key': chunk_key,
            'uploaded_at': time.time()
        }
        session['uploaded_chunks'] += 1
        
        if is_last_chunk:
            session['total_chunks'] = chunk_number + 1
        
        # Check if upload is complete
        if (session['total_chunks'] > 0 and 
            session['uploaded_chunks'] == session['total_chunks']):
            await self._finalize_upload(upload_id)
        
        return True
    
    async def _store_chunk(self, key: str, data: bytes):
        """Store chunk in object storage"""
        # In real implementation, this would use S3 or similar
        # For demo, we'll simulate storage
        print(f"Storing chunk {key} ({len(data)} bytes)")
    
    async def _finalize_upload(self, upload_id: str):
        """Combine chunks and start processing"""
        session = self.upload_sessions[upload_id]
        video_id = session['video_id']
        
        # Combine chunks into final video file
        final_key = f"raw_videos/{video_id}.original"
        await self._combine_chunks(session['chunks'], final_key)
        
        # Update video status
        metadata = session['metadata']
        metadata.status = VideoStatus.PROCESSING
        
        # Trigger video processing pipeline
        await self._trigger_processing(metadata)
        
        # Clean up upload session
        del self.upload_sessions[upload_id]
    
    async def _combine_chunks(self, chunks: Dict, final_key: str):
        """Combine uploaded chunks into final file"""
        print(f"Combining {len(chunks)} chunks into {final_key}")
        # Implementation would combine chunks in order
    
    async def _trigger_processing(self, metadata: VideoMetadata):
        """Trigger video processing pipeline"""
        # Send to processing queue
        processing_message = {
            'video_id': metadata.video_id,
            'action': 'process',
            'metadata': metadata.__dict__
        }
        
        # In real implementation, this would use SQS/Kafka
        print(f"Triggering processing for video {metadata.video_id}")

class VideoTranscoder:
    """Handles video transcoding to multiple formats and qualities"""
    
    def __init__(self, num_workers: int = 10):
        self.executor = ThreadPoolExecutor(max_workers=num_workers)
        self.transcoding_queue = asyncio.Queue()
        self.quality_profiles = {
            VideoQuality.Q_144P: {'width': 256, 'height': 144, 'bitrate': 100},
            VideoQuality.Q_240P: {'width': 426, 'height': 240, 'bitrate': 300},
            VideoQuality.Q_360P: {'width': 640, 'height': 360, 'bitrate': 700},
            VideoQuality.Q_480P: {'width': 854, 'height': 480, 'bitrate': 1500},
            VideoQuality.Q_720P: {'width': 1280, 'height': 720, 'bitrate': 3000},
            VideoQuality.Q_1080P: {'width': 1920, 'height': 1080, 'bitrate': 6000},
            VideoQuality.Q_1440P: {'width': 2560, 'height': 1440, 'bitrate': 12000},
            VideoQuality.Q_2160P: {'width': 3840, 'height': 2160, 'bitrate': 24000}
        }
        
        # Start worker tasks
        for _ in range(num_workers):
            asyncio.create_task(self._transcoding_worker())
    
    async def transcode_video(self, metadata: VideoMetadata) -> List[VideoVariant]:
        """Transcode video to multiple qualities"""
        # Determine which qualities to generate based on original resolution
        original_resolution = await self._get_video_resolution(metadata.video_id)
        target_qualities = self._select_target_qualities(original_resolution)
        
        # Queue transcoding jobs
        transcoding_jobs = []
        for quality in target_qualities:
            job = {
                'video_id': metadata.video_id,
                'quality': quality,
                'profile': self.quality_profiles[quality],
                'metadata': metadata
            }
            transcoding_jobs.append(job)
            await self.transcoding_queue.put(job)
        
        # Wait for all transcoding jobs to complete
        variants = []
        for _ in transcoding_jobs:
            variant = await self._wait_for_transcoding_result(metadata.video_id)
            if variant:
                variants.append(variant)
        
        return variants
    
    async def _transcoding_worker(self):
        """Background worker for transcoding jobs"""
        while True:
            try:
                job = await self.transcoding_queue.get()
                await self._process_transcoding_job(job)
            except Exception as e:
                print(f"Transcoding worker error: {e}")
    
    async def _process_transcoding_job(self, job: Dict):
        """Process individual transcoding job"""
        video_id = job['video_id']
        quality = job['quality']
        profile = job['profile']
        
        print(f"Transcoding {video_id} to {quality.value}")
        
        # Simulate transcoding (in real implementation, use FFmpeg)
        await asyncio.sleep(2)  # Simulate processing time
        
        # Create video variant
        variant = VideoVariant(
            video_id=video_id,
            quality=quality,
            format='mp4',
            file_path=f"videos/{video_id}/{quality.value}.mp4",
            file_size=profile['bitrate'] * 1000,  # Simplified calculation
            bitrate=profile['bitrate'],
            codec='h264',
            resolution=(profile['width'], profile['height'])
        )
        
        # Store transcoded video
        await self._store_variant(variant)
        
        print(f"Completed transcoding {video_id} to {quality.value}")
    
    async def _get_video_resolution(self, video_id: str) -> Tuple[int, int]:
        """Get original video resolution"""
        # In real implementation, this would analyze the video file
        return (1920, 1080)  # Simulate 1080p original
    
    def _select_target_qualities(self, original_resolution: Tuple[int, int]) -> List[VideoQuality]:
        """Select target qualities based on original resolution"""
        width, height = original_resolution
        qualities = []
        
        # Always include lower qualities
        qualities.extend([VideoQuality.Q_144P, VideoQuality.Q_240P, VideoQuality.Q_360P])
        
        if height >= 480:
            qualities.append(VideoQuality.Q_480P)
        if height >= 720:
            qualities.append(VideoQuality.Q_720P)
        if height >= 1080:
            qualities.append(VideoQuality.Q_1080P)
        if height >= 1440:
            qualities.append(VideoQuality.Q_1440P)
        if height >= 2160:
            qualities.append(VideoQuality.Q_2160P)
        
        return qualities
    
    async def _store_variant(self, variant: VideoVariant):
        """Store transcoded video variant"""
        # In real implementation, store in CDN-backed storage
        print(f"Storing variant: {variant.file_path}")
    
    async def _wait_for_transcoding_result(self, video_id: str) -> Optional[VideoVariant]:
        """Wait for transcoding result (simplified)"""
        # In real implementation, this would wait for actual completion
        await asyncio.sleep(1)
        return None  # Simplified for demo

class VideoRecommendationEngine:
    """Handles video recommendations and personalization"""
    
    def __init__(self):
        self.user_preferences: Dict[str, Dict] = {}
        self.video_features: Dict[str, Dict] = {}
        self.trending_videos: List[str] = []
    
    async def get_recommendations(self, user_id: str, count: int = 20) -> List[str]:
        """Get personalized video recommendations"""
        user_prefs = self.user_preferences.get(user_id, {})
        
        if not user_prefs:
            # New user - return trending videos
            return self.trending_videos[:count]
        
        # Get recommendations based on user history
        recommendations = await self._calculate_recommendations(user_id, user_prefs)
        
        # Mix with trending content
        trending_mix = self.trending_videos[:count // 4]
        recommendations = recommendations[:count - len(trending_mix)] + trending_mix
        
        return recommendations
    
    async def _calculate_recommendations(self, user_id: str, preferences: Dict) -> List[str]:
        """Calculate personalized recommendations"""
        # Simplified recommendation algorithm
        # In real implementation, this would use ML models
        
        favorite_categories = preferences.get('categories', [])
        watched_videos = preferences.get('watched', [])
        
        recommendations = []
        
        # Find similar videos to watched ones
        for video_id in watched_videos[-10:]:  # Last 10 watched
            similar_videos = await self._find_similar_videos(video_id)
            recommendations.extend(similar_videos[:5])
        
        # Add videos from favorite categories
        for category in favorite_categories:
            category_videos = await self._get_videos_by_category(category)
            recommendations.extend(category_videos[:10])
        
        # Remove duplicates and already watched
        recommendations = list(set(recommendations))
        recommendations = [v for v in recommendations if v not in watched_videos]
        
        return recommendations[:50]
    
    async def _find_similar_videos(self, video_id: str) -> List[str]:
        """Find videos similar to given video"""
        # Simplified similarity calculation
        return [f"similar_{video_id}_{i}" for i in range(10)]
    
    async def _get_videos_by_category(self, category: str) -> List[str]:
        """Get videos from specific category"""
        # Simplified category lookup
        return [f"category_{category}_{i}" for i in range(20)]
    
    async def update_user_interaction(self, user_id: str, video_id: str, 
                                    interaction_type: str, duration: float = 0):
        """Update user preferences based on interaction"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                'watched': [],
                'liked': [],
                'categories': [],
                'watch_time': 0
            }
        
        prefs = self.user_preferences[user_id]
        
        if interaction_type == 'watch':
            prefs['watched'].append(video_id)
            prefs['watch_time'] += duration
            
            # Keep only recent history
            if len(prefs['watched']) > 1000:
                prefs['watched'] = prefs['watched'][-1000:]
        
        elif interaction_type == 'like':
            prefs['liked'].append(video_id)
        
        # Update trending videos based on global interactions
        await self._update_trending(video_id, interaction_type)
    
    async def _update_trending(self, video_id: str, interaction_type: str):
        """Update trending videos list"""
        # Simplified trending calculation
        if video_id not in self.trending_videos:
            self.trending_videos.append(video_id)
        
        # Keep trending list manageable
        if len(self.trending_videos) > 100:
            self.trending_videos = self.trending_videos[-100:]

class YouTubeSystem:
    """Main YouTube system coordinator"""
    
    def __init__(self):
        self.upload_handler = VideoUploadHandler(None)
        self.transcoder = VideoTranscoder()
        self.recommendation_engine = VideoRecommendationEngine()
        self.video_metadata: Dict[str, VideoMetadata] = {}
        self.video_variants: Dict[str, List[VideoVariant]] = {}
    
    async def upload_video(self, metadata: VideoMetadata) -> str:
        """Handle complete video upload process"""
        # Store metadata
        self.video_metadata[metadata.video_id] = metadata
        
        # Initiate upload
        upload_id = await self.upload_handler.initiate_upload(metadata)
        
        return upload_id
    
    async def process_uploaded_video(self, video_id: str):
        """Process uploaded video through transcoding pipeline"""
        metadata = self.video_metadata[video_id]
        
        # Transcode to multiple qualities
        variants = await self.transcoder.transcode_video(metadata)
        self.video_variants[video_id] = variants
        
        # Update status to ready
        metadata.status = VideoStatus.READY
        
        print(f"Video {video_id} processing complete")
    
    async def get_video_for_playback(self, video_id: str, 
                                   quality: VideoQuality) -> Optional[VideoVariant]:
        """Get video variant for playback"""
        variants = self.video_variants.get(video_id, [])
        
        # Find requested quality or best available
        for variant in variants:
            if variant.quality == quality:
                return variant
        
        # Fallback to highest available quality
        if variants:
            return max(variants, key=lambda v: int(v.quality.value[:-1]))
        
        return None
    
    async def get_recommendations(self, user_id: str) -> List[str]:
        """Get video recommendations for user"""
        return await self.recommendation_engine.get_recommendations(user_id)
    
    async def record_view(self, user_id: str, video_id: str, watch_duration: float):
        """Record video view and update analytics"""
        # Update video metadata
        if video_id in self.video_metadata:
            self.video_metadata[video_id].view_count += 1
        
        # Update user preferences
        await self.recommendation_engine.update_user_interaction(
            user_id, video_id, 'watch', watch_duration
        )
    
    def get_system_stats(self) -> Dict:
        """Get system statistics"""
        total_videos = len(self.video_metadata)
        ready_videos = len([v for v in self.video_metadata.values() 
                           if v.status == VideoStatus.READY])
        total_views = sum(v.view_count for v in self.video_metadata.values())
        
        return {
            'total_videos': total_videos,
            'ready_videos': ready_videos,
            'processing_videos': total_videos - ready_videos,
            'total_views': total_views,
            'total_variants': sum(len(variants) for variants in self.video_variants.values())
        }
```

### Key Design Decisions

**1. Global CDN Infrastructure:**
- **Edge Servers**: 1000+ locations worldwide
- **Adaptive Bitrate**: Dynamic quality adjustment
- **Caching Strategy**: Popular content cached globally
- **Regional Storage**: Content stored near users

**2. Massive Storage System:**
- **Bigtable**: Metadata storage
- **Colossus**: Distributed file system
- **Multiple Replicas**: Redundancy across data centers
- **Automatic Tiering**: Hot/warm/cold storage

**3. Machine Learning Pipeline:**
- **Recommendation Engine**: Personalized content discovery
- **Content Analysis**: Automatic categorization
- **Abuse Detection**: Automated content moderation
- **Trending Algorithm**: Real-time popularity tracking

## Uber Architecture

### System Overview

**Uber Scale:**
- **100+ million monthly active users**
- **15+ million trips per day**
- **5+ million drivers**
- **700+ cities worldwide**

### Architecture Design

**High-Level Architecture:**
```
[Mobile Apps] → [API Gateway] → [Microservices] → [Databases]
      ↓              ↓              ↓              ↓
[Real-time Location] → [Matching Engine] → [Trip Management] → [Payment]
```

**Core Services Implementation (Python)**
```python
import asyncio
import time
import math
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import redis
from geopy.distance import geodesic
import heapq

class TripStatus(Enum):
    REQUESTED = "requested"
    MATCHED = "matched"
    ACCEPTED = "accepted"
    DRIVER_ARRIVING = "driver_arriving"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class DriverStatus(Enum):
    OFFLINE = "offline"
    ONLINE = "online"
    BUSY = "busy"
    ARRIVING = "arriving"

class VehicleType(Enum):
    UBER_X = "uberx"
    UBER_XL = "uberxl"
    UBER_BLACK = "uberblack"
    UBER_POOL = "uberpool"

@dataclass
class Location:
    latitude: float
    longitude: float
    timestamp: float = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = time.time()
    
    def distance_to(self, other: 'Location') -> float:
        """Calculate distance in kilometers"""
        return geodesic((self.latitude, self.longitude), 
                       (other.latitude, other.longitude)).kilometers

@dataclass
class Driver:
    driver_id: str
    name: str
    phone: str
    vehicle_type: VehicleType
    license_plate: str
    rating: float
    status: DriverStatus
    current_location: Location
    last_updated: float
    total_trips: int = 0
    earnings_today: float = 0.0

@dataclass
class Rider:
    rider_id: str
    name: str
    phone: str
    rating: float
    payment_methods: List[str]
    current_location: Optional[Location] = None

@dataclass
class TripRequest:
    request_id: str
    rider_id: str
    pickup_location: Location
    destination_location: Location
    vehicle_type: VehicleType
    requested_at: float
    estimated_fare: float
    status: TripStatus = TripStatus.REQUESTED
    matched_driver_id: Optional[str] = None
    estimated_arrival_time: Optional[float] = None
    estimated_trip_duration: Optional[float] = None

@dataclass
class Trip:
    trip_id: str
    request_id: str
    rider_id: str
    driver_id: str
    pickup_location: Location
    destination_location: Location
    vehicle_type: VehicleType
    status: TripStatus
    created_at: float
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    fare: Optional[float] = None
    distance_km: Optional[float] = None
    duration_minutes: Optional[float] = None
    driver_rating: Optional[float] = None
    rider_rating: Optional[float] = None

class LocationService:
    """Manages real-time location tracking"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.location_updates = asyncio.Queue()
        
        # Start location processing task
        asyncio.create_task(self._process_location_updates())
    
    async def update_driver_location(self, driver_id: str, location: Location):
        """Update driver's real-time location"""
        # Store in Redis with geospatial indexing
        await self.redis.geoadd(
            'driver_locations',
            location.longitude,
            location.latitude,
            driver_id
        )
        
        # Store detailed location data
        location_key = f"driver_location:{driver_id}"
        await self.redis.hset(location_key, mapping={
            'latitude': location.latitude,
            'longitude': location.longitude,
            'timestamp': location.timestamp
        })
        await self.redis.expire(location_key, 300)  # 5 minutes TTL
        
        # Queue for real-time processing
        await self.location_updates.put({
            'driver_id': driver_id,
            'location': location,
            'type': 'driver_update'
        })
    
    async def update_rider_location(self, rider_id: str, location: Location):
        """Update rider's location"""
        location_key = f"rider_location:{rider_id}"
        await self.redis.hset(location_key, mapping={
            'latitude': location.latitude,
            'longitude': location.longitude,
            'timestamp': location.timestamp
        })
        await self.redis.expire(location_key, 300)
    
    async def find_nearby_drivers(self, location: Location, radius_km: float = 5.0,
                                vehicle_type: VehicleType = None) -> List[Tuple[str, float]]:
        """Find drivers within radius of location"""
        # Use Redis GEORADIUS for efficient spatial queries
        nearby_drivers = await self.redis.georadius(
            'driver_locations',
            location.longitude,
            location.latitude,
            radius_km,
            unit='km',
            withdist=True,
            sort='ASC'
        )
        
        # Filter by vehicle type if specified
        if vehicle_type:
            filtered_drivers = []
            for driver_id, distance in nearby_drivers:
                driver_info = await self._get_driver_info(driver_id)
                if driver_info and driver_info.get('vehicle_type') == vehicle_type.value:
                    filtered_drivers.append((driver_id, distance))
            return filtered_drivers
        
        return nearby_drivers
    
    async def _get_driver_info(self, driver_id: str) -> Optional[Dict]:
        """Get driver information from cache"""
        driver_key = f"driver:{driver_id}"
        return await self.redis.hgetall(driver_key)
    
    async def _process_location_updates(self):
        """Process real-time location updates"""
        while True:
            try:
                update = await self.location_updates.get()
                await self._handle_location_update(update)
            except Exception as e:
                print(f"Error processing location update: {e}")
    
    async def _handle_location_update(self, update: Dict):
        """Handle individual location update"""
        if update['type'] == 'driver_update':
            # Update any active trips
            driver_id = update['driver_id']
            location = update['location']
            
            # Check if driver has active trip
            active_trip = await self._get_active_trip_for_driver(driver_id)
            if active_trip:
                await self._update_trip_location(active_trip, location)
    
    async def _get_active_trip_for_driver(self, driver_id: str) -> Optional[str]:
        """Get active trip ID for driver"""
        trip_key = f"driver_active_trip:{driver_id}"
        return await self.redis.get(trip_key)
    
    async def _update_trip_location(self, trip_id: str, location: Location):
        """Update trip with current driver location"""
        trip_location_key = f"trip_location:{trip_id}"
        await self.redis.hset(trip_location_key, mapping={
            'latitude': location.latitude,
            'longitude': location.longitude,
            'timestamp': location.timestamp
        })

class MatchingEngine:
    """Handles driver-rider matching algorithm"""
    
    def __init__(self, location_service: LocationService):
        self.location_service = location_service
        self.pending_requests: Dict[str, TripRequest] = {}
        self.matching_queue = asyncio.Queue()
        
        # Start matching worker
        asyncio.create_task(self._matching_worker())
    
    async def request_ride(self, trip_request: TripRequest) -> str:
        """Process new ride request"""
        self.pending_requests[trip_request.request_id] = trip_request
        
        # Add to matching queue
        await self.matching_queue.put(trip_request)
        
        return trip_request.request_id
    
    async def _matching_worker(self):
        """Background worker for matching requests"""
        while True:
            try:
                request = await self.matching_queue.get()
                await self._process_matching_request(request)
            except Exception as e:
                print(f"Matching worker error: {e}")
    
    async def _process_matching_request(self, request: TripRequest):
        """Process individual matching request"""
        # Find nearby available drivers
        nearby_drivers = await self.location_service.find_nearby_drivers(
            request.pickup_location,
            radius_km=10.0,
            vehicle_type=request.vehicle_type
        )
        
        if not nearby_drivers:
            # No drivers available, keep in queue for retry
            await asyncio.sleep(5)
            await self.matching_queue.put(request)
            return
        
        # Score and rank drivers
        driver_scores = await self._score_drivers(request, nearby_drivers)
        
        # Try to match with best drivers in order
        for driver_id, score in driver_scores:
            if await self._attempt_match(request, driver_id):
                break
        else:
            # No successful match, retry later
            await asyncio.sleep(10)
            await self.matching_queue.put(request)
    
    async def _score_drivers(self, request: TripRequest, 
                           nearby_drivers: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """Score and rank drivers for matching"""
        scored_drivers = []
        
        for driver_id, distance in nearby_drivers:
            # Get driver details
            driver_info = await self.location_service._get_driver_info(driver_id)
            if not driver_info or driver_info.get('status') != DriverStatus.ONLINE.value:
                continue
            
            # Calculate score based on multiple factors
            score = await self._calculate_driver_score(
                driver_id, distance, driver_info, request
            )
            
            scored_drivers.append((driver_id, score))
        
        # Sort by score (higher is better)
        scored_drivers.sort(key=lambda x: x[1], reverse=True)
        
        return scored_drivers[:5]  # Top 5 candidates
    
    async def _calculate_driver_score(self, driver_id: str, distance: float,
                                    driver_info: Dict, request: TripRequest) -> float:
        """Calculate driver matching score"""
        # Base score starts at 100
        score = 100.0
        
        # Distance factor (closer is better)
        score -= distance * 2  # Penalty for distance
        
        # Driver rating factor
        rating = float(driver_info.get('rating', 4.0))
        score += (rating - 4.0) * 10  # Bonus for high rating
        
        # Driver acceptance rate (if available)
        acceptance_rate = float(driver_info.get('acceptance_rate', 0.8))
        score += acceptance_rate * 20
        
        # Time since last trip (prefer active drivers)
        last_trip_time = float(driver_info.get('last_trip_time', 0))
        if last_trip_time > 0:
            time_since_trip = time.time() - last_trip_time
            if time_since_trip < 3600:  # Within last hour
                score += 10
        
        # Direction factor (if driver is heading towards pickup)
        # This would require more complex calculation in real implementation
        
        return max(0, score)
    
    async def _attempt_match(self, request: TripRequest, driver_id: str) -> bool:
        """Attempt to match request with specific driver"""
        # Send match request to driver
        match_request = {
            'request_id': request.request_id,
            'rider_name': 'Rider',  # Would get from rider service
            'pickup_location': asdict(request.pickup_location),
            'destination_location': asdict(request.destination_location),
            'estimated_fare': request.estimated_fare,
            'estimated_distance': request.pickup_location.distance_to(request.destination_location)
        }
        
        # In real implementation, this would send push notification to driver
        print(f"Sending match request to driver {driver_id}: {match_request}")
        
        # Simulate driver response (in real implementation, wait for actual response)
        await asyncio.sleep(1)
        driver_accepted = True  # Simulate acceptance
        
        if driver_accepted:
            # Update request status
            request.status = TripStatus.MATCHED
            request.matched_driver_id = driver_id
            
            # Remove from pending requests
            if request.request_id in self.pending_requests:
                del self.pending_requests[request.request_id]
            
            print(f"Match successful: Request {request.request_id} matched with driver {driver_id}")
            return True
        
        return False

class TripService:
    """Manages trip lifecycle"""
    
    def __init__(self, location_service: LocationService):
        self.location_service = location_service
        self.active_trips: Dict[str, Trip] = {}
        self.trip_history: Dict[str, Trip] = {}
    
    async def create_trip(self, request: TripRequest) -> Trip:
        """Create trip from matched request"""
        trip = Trip(
            trip_id=f"trip_{int(time.time())}_{request.request_id}",
            request_id=request.request_id,
            rider_id=request.rider_id,
            driver_id=request.matched_driver_id,
            pickup_location=request.pickup_location,
            destination_location=request.destination_location,
            vehicle_type=request.vehicle_type,
            status=TripStatus.ACCEPTED,
            created_at=time.time()
        )
        
        self.active_trips[trip.trip_id] = trip
        
        # Estimate arrival time
        await self._calculate_trip_estimates(trip)
        
        return trip
    
    async def update_trip_status(self, trip_id: str, new_status: TripStatus,
                               location: Optional[Location] = None):
        """Update trip status"""
        if trip_id not in self.active_trips:
            return
        
        trip = self.active_trips[trip_id]
        old_status = trip.status
        trip.status = new_status
        
        if new_status == TripStatus.IN_PROGRESS and not trip.started_at:
            trip.started_at = time.time()
        
        elif new_status == TripStatus.COMPLETED:
            trip.completed_at = time.time()
            
            # Calculate final trip metrics
            if trip.started_at:
                trip.duration_minutes = (trip.completed_at - trip.started_at) / 60
            
            # Calculate distance (simplified)
            trip.distance_km = trip.pickup_location.distance_to(trip.destination_location)
            
            # Calculate fare
            trip.fare = await self._calculate_fare(trip)
            
            # Move to history
            self.trip_history[trip_id] = trip
            del self.active_trips[trip_id]
        
        print(f"Trip {trip_id} status updated: {old_status.value} -> {new_status.value}")
    
    async def _calculate_trip_estimates(self, trip: Trip):
        """Calculate trip time and distance estimates"""
        # Get driver's current location
        driver_location_key = f"driver_location:{trip.driver_id}"
        driver_location_data = await self.location_service.redis.hgetall(driver_location_key)
        
        if driver_location_data:
            driver_location = Location(
                latitude=float(driver_location_data['latitude']),
                longitude=float(driver_location_data['longitude'])
            )
            
            # Estimate arrival time (simplified)
            distance_to_pickup = driver_location.distance_to(trip.pickup_location)
            trip.estimated_arrival_time = time.time() + (distance_to_pickup * 2 * 60)  # 2 min per km
            
            # Estimate trip duration
            trip_distance = trip.pickup_location.distance_to(trip.destination_location)
            trip.estimated_trip_duration = trip_distance * 3 * 60  # 3 min per km
    
    async def _calculate_fare(self, trip: Trip) -> float:
        """Calculate trip fare"""
        # Simplified fare calculation
        base_fare = 2.50
        per_km_rate = 1.20
        per_minute_rate = 0.25
        
        distance_fare = trip.distance_km * per_km_rate
        time_fare = trip.duration_minutes * per_minute_rate
        
        # Apply surge pricing if needed
        surge_multiplier = await self._get_surge_multiplier(trip.pickup_location)
        
        total_fare = (base_fare + distance_fare + time_fare) * surge_multiplier
        
        return round(total_fare, 2)
    
    async def _get_surge_multiplier(self, location: Location) -> float:
        """Get surge pricing multiplier for location"""
        # Simplified surge calculation
        # In real implementation, this would consider supply/demand
        return 1.0  # No surge for demo
    
    def get_trip_stats(self) -> Dict:
        """Get trip service statistics"""
        return {
            'active_trips': len(self.active_trips),
            'completed_trips': len(self.trip_history),
            'total_trips': len(self.active_trips) + len(self.trip_history)
        }

class UberSystem:
    """Main Uber system coordinator"""
    
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, decode_responses=True)
        self.location_service = LocationService(self.redis)
        self.matching_engine = MatchingEngine(self.location_service)
        self.trip_service = TripService(self.location_service)
        
        self.drivers: Dict[str, Driver] = {}
        self.riders: Dict[str, Rider] = {}
    
    async def register_driver(self, driver: Driver):
        """Register new driver"""
        self.drivers[driver.driver_id] = driver
        
        # Store in Redis
        driver_key = f"driver:{driver.driver_id}"
        await self.redis.hset(driver_key, mapping={
            'name': driver.name,
            'vehicle_type': driver.vehicle_type.value,
            'rating': driver.rating,
            'status': driver.status.value
        })
    
    async def register_rider(self, rider: Rider):
        """Register new rider"""
        self.riders[rider.rider_id] = rider
    
    async def driver_goes_online(self, driver_id: str, location: Location):
        """Driver goes online at location"""
        if driver_id in self.drivers:
            self.drivers[driver_id].status = DriverStatus.ONLINE
            self.drivers[driver_id].current_location = location
            
            await self.location_service.update_driver_location(driver_id, location)
    
    async def request_ride(self, rider_id: str, pickup_location: Location,
                         destination_location: Location, vehicle_type: VehicleType) -> str:
        """Request a ride"""
        # Calculate estimated fare
        distance = pickup_location.distance_to(destination_location)
        estimated_fare = 2.50 + (distance * 1.20)  # Simplified calculation
        
        trip_request = TripRequest(
            request_id=f"req_{int(time.time())}_{rider_id}",
            rider_id=rider_id,
            pickup_location=pickup_location,
            destination_location=destination_location,
            vehicle_type=vehicle_type,
            requested_at=time.time(),
            estimated_fare=estimated_fare
        )
        
        request_id = await self.matching_engine.request_ride(trip_request)
        return request_id
    
    async def update_driver_location(self, driver_id: str, location: Location):
        """Update driver's real-time location"""
        if driver_id in self.drivers:
            self.drivers[driver_id].current_location = location
            await self.location_service.update_driver_location(driver_id, location)
    
    def get_system_stats(self) -> Dict:
        """Get system-wide statistics"""
        online_drivers = len([d for d in self.drivers.values() 
                            if d.status == DriverStatus.ONLINE])
        
        trip_stats = self.trip_service.get_trip_stats()
        
        return {
            'total_drivers': len(self.drivers),
            'online_drivers': online_drivers,
            'total_riders': len(self.riders),
            'pending_requests': len(self.matching_engine.pending_requests),
            **trip_stats
        }
```

### Key Design Decisions

**1. Real-Time Location Tracking:**
- **GPS Updates**: Every 4 seconds for drivers
- **Geospatial Indexing**: Redis GeoHash for efficient queries
- **Location Prediction**: Machine learning for ETA accuracy
- **Battery Optimization**: Adaptive update frequency

**2. Matching Algorithm:**
- **Supply-Demand Balance**: Dynamic pricing and incentives
- **Multi-Factor Scoring**: Distance, rating, acceptance rate
- **Real-Time Optimization**: Continuous algorithm improvement
- **Fairness Mechanisms**: Prevent driver cherry-picking

**3. Microservices Architecture:**
- **Service Isolation**: Independent scaling and deployment
- **Event-Driven Communication**: Kafka for real-time events
- **Circuit Breakers**: Fault tolerance between services
- **API Gateway**: Centralized routing and authentication

## Netflix Architecture

### System Overview

**Netflix Scale:**
- **230+ million subscribers globally**
- **15,000+ titles**
- **1+ billion hours watched weekly**
- **190+ countries served**

### Architecture Design

**High-Level Architecture:**
```
[CDN] → [API Gateway] → [Microservices] → [Databases]
  ↓         ↓              ↓              ↓
[Video Encoding] → [Recommendation] → [User Data] → [Analytics]
```

**Recommendation System Implementation (Python)**
```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import redis
import json
from collections import defaultdict

@dataclass
class Content:
    content_id: str
    title: str
    genre: List[str]
    release_year: int
    duration_minutes: int
    rating: str
    language: str
    country: str
    cast: List[str]
    director: str
    description: str
    popularity_score: float
    quality_score: float

@dataclass
class UserProfile:
    user_id: str
    age: int
    country: str
    language: str
    subscription_type: str
    viewing_history: List[str]
    ratings: Dict[str, float]
    genres_preference: Dict[str, float]
    watch_time_by_hour: Dict[int, float]
    device_types: List[str]

@dataclass
class ViewingSession:
    session_id: str
    user_id: str
    content_id: str
    start_time: float
    end_time: Optional[float]
    watch_duration: float
    completion_rate: float
    device_type: str
    quality: str
    paused_count: int
    rewound_count: int
    fast_forwarded: bool

class ContentBasedRecommender:
    """Content-based recommendation using content features"""
    
    def __init__(self):
        self.content_features = {}
        self.content_similarity_matrix = None
        self.feature_weights = {
            'genre': 0.3,
            'cast': 0.2,
            'director': 0.15,
            'language': 0.1,
            'release_year': 0.1,
            'rating': 0.05,
            'popularity': 0.1
        }
    
    def build_content_features(self, contents: List[Content]):
        """Build feature vectors for all content"""
        for content in contents:
            features = self._extract_content_features(content)
            self.content_features[content.content_id] = features
        
        # Build similarity matrix
        self._build_similarity_matrix()
    
    def _extract_content_features(self, content: Content) -> Dict:
        """Extract features from content"""
        return {
            'genres': set(content.genre),
            'cast': set(content.cast[:5]),  # Top 5 cast members
            'director': content.director,
            'language': content.language,
            'release_year_bucket': content.release_year // 10 * 10,  # Decade
            'rating': content.rating,
            'popularity_score': content.popularity_score,
            'quality_score': content.quality_score
        }
    
    def _build_similarity_matrix(self):
        """Build content similarity matrix"""
        content_ids = list(self.content_features.keys())
        n_contents = len(content_ids)
        
        similarity_matrix = np.zeros((n_contents, n_contents))
        
        for i, content_id_1 in enumerate(content_ids):
            for j, content_id_2 in enumerate(content_ids):
                if i != j:
                    similarity = self._calculate_content_similarity(
                        self.content_features[content_id_1],
                        self.content_features[content_id_2]
                    )
                    similarity_matrix[i][j] = similarity
        
        self.content_similarity_matrix = similarity_matrix
        self.content_id_to_index = {cid: i for i, cid in enumerate(content_ids)}
    
    def _calculate_content_similarity(self, features1: Dict, features2: Dict) -> float:
        """Calculate similarity between two content items"""
        similarity = 0.0
        
        # Genre similarity
        genre_jaccard = len(features1['genres'] & features2['genres']) / \
                       len(features1['genres'] | features2['genres'])
        similarity += self.feature_weights['genre'] * genre_jaccard
        
        # Cast similarity
        cast_jaccard = len(features1['cast'] & features2['cast']) / \
                      len(features1['cast'] | features2['cast'])
        similarity += self.feature_weights['cast'] * cast_jaccard
        
        # Director similarity
        director_sim = 1.0 if features1['director'] == features2['director'] else 0.0
        similarity += self.feature_weights['director'] * director_sim
        
        # Language similarity
        language_sim = 1.0 if features1['language'] == features2['language'] else 0.0
        similarity += self.feature_weights['language'] * language_sim
        
        # Release year similarity (closer years = higher similarity)
        year_diff = abs(features1['release_year_bucket'] - features2['release_year_bucket'])
        year_sim = max(0, 1 - year_diff / 50)  # Normalize by 50 years
        similarity += self.feature_weights['release_year'] * year_sim
        
        # Rating similarity
        rating_sim = 1.0 if features1['rating'] == features2['rating'] else 0.5
        similarity += self.feature_weights['rating'] * rating_sim
        
        # Popularity similarity
        pop_diff = abs(features1['popularity_score'] - features2['popularity_score'])
        pop_sim = max(0, 1 - pop_diff)
        similarity += self.feature_weights['popularity'] * pop_sim
        
        return similarity
    
    def get_similar_content(self, content_id: str, n_recommendations: int = 10) -> List[str]:
        """Get similar content recommendations"""
        if content_id not in self.content_id_to_index:
            return []
        
        content_index = self.content_id_to_index[content_id]
        similarities = self.content_similarity_matrix[content_index]
        
        # Get top similar content
        similar_indices = np.argsort(similarities)[::-1][:n_recommendations]
        
        content_ids = list(self.content_id_to_index.keys())
        return [content_ids[i] for i in similar_indices]

class CollaborativeFilteringRecommender:
    """Collaborative filtering using matrix factorization"""
    
    def __init__(self, n_factors: int = 50):
        self.n_factors = n_factors
        self.user_factors = None
        self.item_factors = None
        self.user_to_index = {}
        self.item_to_index = {}
        self.svd_model = TruncatedSVD(n_components=n_factors)
    
    def train(self, user_item_matrix: np.ndarray, user_ids: List[str], item_ids: List[str]):
        """Train collaborative filtering model"""
        self.user_to_index = {uid: i for i, uid in enumerate(user_ids)}
        self.item_to_index = {iid: i for i, iid in enumerate(item_ids)}
        
        # Apply SVD for matrix factorization
        self.user_factors = self.svd_model.fit_transform(user_item_matrix)
        self.item_factors = self.svd_model.components_.T
    
    def predict_rating(self, user_id: str, item_id: str) -> float:
        """Predict user rating for item"""
        if user_id not in self.user_to_index or item_id not in self.item_to_index:
            return 0.0
        
        user_idx = self.user_to_index[user_id]
        item_idx = self.item_to_index[item_id]
        
        prediction = np.dot(self.user_factors[user_idx], self.item_factors[item_idx])
        return max(0, min(5, prediction))  # Clamp between 0 and 5
    
    def get_user_recommendations(self, user_id: str, n_recommendations: int = 10,
                               exclude_seen: List[str] = None) -> List[Tuple[str, float]]:
        """Get recommendations for user"""
        if user_id not in self.user_to_index:
            return []
        
        exclude_seen = exclude_seen or []
        user_idx = self.user_to_index[user_id]
        
        # Calculate predictions for all items
        predictions = []
        for item_id, item_idx in self.item_to_index.items():
            if item_id not in exclude_seen:
                score = np.dot(self.user_factors[user_idx], self.item_factors[item_idx])
                predictions.append((item_id, score))
        
        # Sort by predicted score
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        return predictions[:n_recommendations]

class HybridRecommendationEngine:
    """Hybrid recommendation system combining multiple approaches"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.content_recommender = ContentBasedRecommender()
        self.collaborative_recommender = CollaborativeFilteringRecommender()
        self.user_profiles: Dict[str, UserProfile] = {}
        self.content_catalog: Dict[str, Content] = {}
        self.viewing_sessions: List[ViewingSession] = []
        
        # Recommendation weights
        self.algorithm_weights = {
            'collaborative': 0.4,
            'content_based': 0.3,
            'popularity': 0.15,
            'trending': 0.1,
            'diversity': 0.05
        }
    
    async def initialize(self, contents: List[Content], user_profiles: List[UserProfile]):
        """Initialize recommendation engine"""
        # Store content catalog
        for content in contents:
            self.content_catalog[content.content_id] = content
        
        # Store user profiles
        for profile in user_profiles:
            self.user_profiles[profile.user_id] = profile
        
        # Build content-based features
        self.content_recommender.build_content_features(contents)
        
        # Build collaborative filtering model
        await self._build_collaborative_model()
    
    async def _build_collaborative_model(self):
        """Build collaborative filtering model from user data"""
        # Create user-item matrix from viewing history and ratings
        user_ids = list(self.user_profiles.keys())
        item_ids = list(self.content_catalog.keys())
        
        user_item_matrix = np.zeros((len(user_ids), len(item_ids)))
        
        for i, user_id in enumerate(user_ids):
            profile = self.user_profiles[user_id]
            
            # Use explicit ratings if available
            for item_id, rating in profile.ratings.items():
                if item_id in self.content_catalog:
                    j = item_ids.index(item_id)
                    user_item_matrix[i][j] = rating
            
            # Use implicit feedback from viewing history
            for item_id in profile.viewing_history:
                if item_id in self.content_catalog:
                    j = item_ids.index(item_id)
                    if user_item_matrix[i][j] == 0:  # No explicit rating
                        user_item_matrix[i][j] = 3.0  # Implicit positive feedback
        
        # Train collaborative filtering model
        self.collaborative_recommender.train(user_item_matrix, user_ids, item_ids)
    
    async def get_recommendations(self, user_id: str, n_recommendations: int = 20) -> List[str]:
        """Get hybrid recommendations for user"""
        if user_id not in self.user_profiles:
            return await self._get_popular_content(n_recommendations)
        
        profile = self.user_profiles[user_id]
        
        # Get recommendations from different algorithms
        collaborative_recs = self._get_collaborative_recommendations(user_id, profile)
        content_based_recs = self._get_content_based_recommendations(user_id, profile)
        popularity_recs = await self._get_popularity_recommendations(profile)
        trending_recs = await self._get_trending_recommendations()
        
        # Combine recommendations with weights
        combined_scores = defaultdict(float)
        
        # Collaborative filtering
        for i, (item_id, score) in enumerate(collaborative_recs[:n_recommendations]):
            weight = self.algorithm_weights['collaborative'] * (1 - i / len(collaborative_recs))
            combined_scores[item_id] += weight * score
        
        # Content-based
        for i, item_id in enumerate(content_based_recs[:n_recommendations]):
            weight = self.algorithm_weights['content_based'] * (1 - i / len(content_based_recs))
            combined_scores[item_id] += weight
        
        # Popularity
        for i, item_id in enumerate(popularity_recs[:n_recommendations]):
            weight = self.algorithm_weights['popularity'] * (1 - i / len(popularity_recs))
            combined_scores[item_id] += weight
        
        # Trending
        for i, item_id in enumerate(trending_recs[:n_recommendations]):
            weight = self.algorithm_weights['trending'] * (1 - i / len(trending_recs))
            combined_scores[item_id] += weight
        
        # Apply diversity boost
        await self._apply_diversity_boost(combined_scores, profile)
        
        # Sort by combined score
        recommendations = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Filter out already watched content
        filtered_recs = [item_id for item_id, _ in recommendations 
                        if item_id not in profile.viewing_history]
        
        return filtered_recs[:n_recommendations]
    
    def _get_collaborative_recommendations(self, user_id: str, profile: UserProfile) -> List[Tuple[str, float]]:
        """Get collaborative filtering recommendations"""
        return self.collaborative_recommender.get_user_recommendations(
            user_id, exclude_seen=profile.viewing_history
        )
    
    def _get_content_based_recommendations(self, user_id: str, profile: UserProfile) -> List[str]:
        """Get content-based recommendations"""
        recommendations = []
        
        # Get similar content to recently watched items
        recent_items = profile.viewing_history[-10:]  # Last 10 watched
        
        for item_id in recent_items:
            similar_items = self.content_recommender.get_similar_content(item_id, 5)
            recommendations.extend(similar_items)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recs = []
        for item_id in recommendations:
            if item_id not in seen and item_id not in profile.viewing_history:
                seen.add(item_id)
                unique_recs.append(item_id)
        
        return unique_recs
    
    async def _get_popularity_recommendations(self, profile: UserProfile) -> List[str]:
        """Get popular content recommendations"""
        # Filter by user's preferred genres and language
        popular_content = []
        
        for content_id, content in self.content_catalog.items():
            if (content.language == profile.language and
                any(genre in profile.genres_preference for genre in content.genre)):
                popular_content.append((content_id, content.popularity_score))
        
        # Sort by popularity
        popular_content.sort(key=lambda x: x[1], reverse=True)
        
        return [item_id for item_id, _ in popular_content]
    
    async def _get_trending_recommendations(self) -> List[str]:
        """Get trending content"""
        # Get trending content from Redis cache
        trending_key = "trending_content"
        trending_data = await self.redis.get(trending_key)
        
        if trending_data:
            return json.loads(trending_data)
        
        # Fallback to recent popular content
        recent_content = [(cid, content.popularity_score) 
                         for cid, content in self.content_catalog.items() 
                         if content.release_year >= 2020]
        
        recent_content.sort(key=lambda x: x[1], reverse=True)
        trending = [item_id for item_id, _ in recent_content[:50]]
        
        # Cache for 1 hour
        await self.redis.setex(trending_key, 3600, json.dumps(trending))
        
        return trending
    
    async def _apply_diversity_boost(self, scores: Dict[str, float], profile: UserProfile):
        """Apply diversity boost to recommendations"""
        # Boost content from underrepresented genres
        user_genre_counts = defaultdict(int)
        for item_id in profile.viewing_history[-20:]:  # Recent history
            if item_id in self.content_catalog:
                content = self.content_catalog[item_id]
                for genre in content.genre:
                    user_genre_counts[genre] += 1
        
        # Find underrepresented genres
        avg_genre_count = sum(user_genre_counts.values()) / max(len(user_genre_counts), 1)
        
        for item_id in scores:
            if item_id in self.content_catalog:
                content = self.content_catalog[item_id]
                for genre in content.genre:
                    if user_genre_counts[genre] < avg_genre_count * 0.5:
                        scores[item_id] += self.algorithm_weights['diversity']
    
    async def _get_popular_content(self, n_recommendations: int) -> List[str]:
        """Get popular content for new users"""
        popular_content = [(cid, content.popularity_score) 
                          for cid, content in self.content_catalog.items()]
        
        popular_content.sort(key=lambda x: x[1], reverse=True)
        
        return [item_id for item_id, _ in popular_content[:n_recommendations]]
    
    async def record_viewing_session(self, session: ViewingSession):
        """Record user viewing session for learning"""
        self.viewing_sessions.append(session)
        
        # Update user profile
        if session.user_id in self.user_profiles:
            profile = self.user_profiles[session.user_id]
            
            # Add to viewing history if completed significantly
            if session.completion_rate > 0.7:  # Watched more than 70%
                if session.content_id not in profile.viewing_history:
                    profile.viewing_history.append(session.content_id)
            
            # Update genre preferences based on completion rate
            if session.content_id in self.content_catalog:
                content = self.content_catalog[session.content_id]
                for genre in content.genre:
                    current_pref = profile.genres_preference.get(genre, 0.5)
                    # Adjust preference based on completion rate
                    adjustment = (session.completion_rate - 0.5) * 0.1
                    profile.genres_preference[genre] = max(0, min(1, current_pref + adjustment))
        
        # Store session in Redis for analytics
        session_key = f"viewing_session:{session.session_id}"
        await self.redis.setex(session_key, 86400 * 7, json.dumps(session.__dict__))
```

### Key Design Decisions

**1. Microservices Architecture:**
- **700+ Microservices**: Each with specific responsibilities
- **Service Mesh**: Istio for service-to-service communication
- **API Gateway**: Zuul for routing and load balancing
- **Circuit Breakers**: Hystrix for fault tolerance

**2. Global Content Delivery:**
- **Open Connect**: Custom CDN with 15,000+ servers
- **Regional Caching**: Content cached near users
- **Adaptive Streaming**: Dynamic quality adjustment
- **Predictive Caching**: ML-driven content pre-positioning

**3. Data-Driven Personalization:**
- **A/B Testing**: Continuous experimentation
- **Real-Time Analytics**: Immediate feedback loops
- **Machine Learning**: Deep learning for recommendations
- **Behavioral Analysis**: User interaction patterns

## Best Practices from Real-World Systems

### Architecture Principles

**1. Design for Scale:**
- **Horizontal Scaling**: Add capacity by adding servers
- **Stateless Services**: Enable easy scaling and failover
- **Database Sharding**: Distribute data across multiple databases
- **Caching Layers**: Reduce database load and improve performance

**2. Embrace Failure:**
- **Circuit Breakers**: Prevent cascading failures
- **Bulkhead Pattern**: Isolate critical resources
- **Graceful Degradation**: Maintain core functionality during failures
- **Chaos Engineering**: Proactively test system resilience

**3. Optimize for Performance:**
- **CDN Usage**: Serve content from edge locations
- **Database Optimization**: Proper indexing and query optimization
- **Asynchronous Processing**: Non-blocking operations
- **Connection Pooling**: Reuse database connections

### Technology Choices

**1. Database Selection:**
- **RDBMS**: For ACID transactions and complex queries
- **NoSQL**: For high scalability and flexible schemas
- **In-Memory**: For caching and real-time data
- **Time-Series**: For metrics and monitoring data

**2. Communication Patterns:**
- **Synchronous**: For immediate consistency requirements
- **Asynchronous**: For loose coupling and scalability
- **Event Streaming**: For real-time data processing
- **Message Queues**: For reliable message delivery

**3. Monitoring and Observability:**
- **Distributed Tracing**: Track requests across services
- **Metrics Collection**: Monitor system health and performance
- **Centralized Logging**: Aggregate logs for analysis
- **Alerting**: Proactive notification of issues

## Common Pitfalls and Solutions

### Scalability Pitfalls

**1. Premature Optimization:**
- **Problem**: Over-engineering before understanding requirements
- **Solution**: Start simple, measure, then optimize
- **Example**: Don't implement complex caching before identifying bottlenecks

**2. Database Bottlenecks:**
- **Problem**: Single database becomes the limiting factor
- **Solution**: Read replicas, sharding, caching
- **Example**: WhatsApp's transition from single to sharded databases

**3. Synchronous Dependencies:**
- **Problem**: Services tightly coupled through synchronous calls
- **Solution**: Asynchronous messaging, event-driven architecture
- **Example**: Netflix's move from synchronous to event-driven communication

### Reliability Pitfalls

**1. Single Points of Failure:**
- **Problem**: Critical components without redundancy
- **Solution**: Redundancy, load balancing, failover mechanisms
- **Example**: Multiple data centers, load balancer redundancy

**2. Cascading Failures:**
- **Problem**: Failure in one service causes failures in dependent services
- **Solution**: Circuit breakers, timeouts, bulkhead pattern
- **Example**: Netflix's Hystrix preventing cascading failures

**3. Data Consistency Issues:**
- **Problem**: Inconsistent data across distributed systems
- **Solution**: Eventual consistency, saga pattern, CQRS
- **Example**: Uber's saga pattern for distributed transactions

### Performance Pitfalls

**1. N+1 Query Problem:**
- **Problem**: Multiple database queries for related data
- **Solution**: Eager loading, data denormalization, caching
- **Example**: Loading user profiles with their viewing history

**2. Inefficient Caching:**
- **Problem**: Poor cache hit rates or cache stampede
- **Solution**: Proper cache keys, TTL management, cache warming
- **Example**: Netflix's predictive caching based on viewing patterns

**3. Resource Contention:**
- **Problem**: Multiple processes competing for limited resources
- **Solution**: Connection pooling, rate limiting, resource isolation
- **Example**: Database connection limits causing service degradation

### Security Pitfalls

**1. Insufficient Authentication:**
- **Problem**: Weak or missing authentication mechanisms
- **Solution**: Multi-factor authentication, OAuth 2.0, JWT tokens
- **Example**: Secure API access with proper token validation

**2. Data Exposure:**
- **Problem**: Sensitive data exposed through APIs or logs
- **Solution**: Data encryption, access controls, log sanitization
- **Example**: PII protection in user recommendation systems

**3. Injection Attacks:**
- **Problem**: SQL injection, XSS, and other injection vulnerabilities
- **Solution**: Input validation, parameterized queries, output encoding
- **Example**: Secure user input handling in search functionality

## Key Takeaways

### Design Philosophy

**1. Start Simple, Scale Smart:**
- Begin with monolithic architecture for rapid development
- Identify bottlenecks through monitoring and metrics
- Extract microservices when clear boundaries emerge
- Scale components independently based on demand

**2. Embrace Distributed Systems Complexity:**
- Accept that distributed systems are inherently complex
- Invest in proper tooling and monitoring
- Design for failure from the beginning
- Implement proper testing strategies

**3. Data-Driven Decision Making:**
- Measure everything that matters
- Use A/B testing for feature validation
- Implement real-time analytics for immediate feedback
- Make architectural decisions based on data, not assumptions

### Evolution Patterns

**1. Monolith to Microservices:**
- **Phase 1**: Monolithic application with clear module boundaries
- **Phase 2**: Extract read-heavy services first
- **Phase 3**: Decompose based on business capabilities
- **Phase 4**: Implement service mesh for communication

**2. Database Evolution:**
- **Phase 1**: Single database with proper indexing
- **Phase 2**: Read replicas for scaling reads
- **Phase 3**: Sharding for scaling writes
- **Phase 4**: Polyglot persistence for different use cases

**3. Caching Strategy:**
- **Phase 1**: Application-level caching
- **Phase 2**: Distributed caching layer
- **Phase 3**: CDN for static content
- **Phase 4**: Intelligent caching with ML

### Success Metrics

**1. Technical Metrics:**
- **Availability**: 99.9%+ uptime
- **Latency**: P99 response times under acceptable thresholds
- **Throughput**: Requests per second capacity
- **Error Rate**: Less than 0.1% error rate

**2. Business Metrics:**
- **User Engagement**: Time spent, retention rates
- **Conversion Rates**: Sign-ups, purchases, subscriptions
- **Cost Efficiency**: Infrastructure cost per user
- **Time to Market**: Feature development and deployment speed

**3. Operational Metrics:**
- **Mean Time to Recovery (MTTR)**: How quickly issues are resolved
- **Mean Time Between Failures (MTBF)**: System reliability
- **Deployment Frequency**: How often new features are released
- **Change Failure Rate**: Percentage of deployments causing issues

---

**Next Chapter**: [Chapter 15: System Design Interview Preparation](chapter-15.md)