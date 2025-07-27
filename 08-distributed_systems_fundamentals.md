# Chapter 08: Distributed Systems Fundamentals

## Overview

Distributed systems are collections of independent computers that appear to users as a single coherent system. Understanding the fundamental principles, challenges, and trade-offs in distributed systems is crucial for designing scalable and reliable architectures.

### Key Characteristics
- **Concurrency:** Multiple processes executing simultaneously
- **No Global Clock:** No shared notion of time across nodes
- **Independent Failures:** Components can fail independently
- **Network Partitions:** Communication between nodes can be interrupted
- **Scalability:** System can handle increased load by adding resources

## CAP Theorem

The CAP theorem states that in a distributed system, you can only guarantee two out of three properties:

### The Three Properties

```
┌─────────────────┐
│   Consistency   │
│                 │
│ All nodes see   │
│ the same data   │
│ simultaneously  │
└─────────┬───────┘
          │
          │
┌─────────▼───────┐         ┌─────────────────┐
│  Availability   │◄────────┤   Partition     │
│                 │         │   Tolerance     │
│ System remains  │         │                 │
│ operational     │         │ System continues│
│ at all times    │         │ despite network │
│                 │         │ failures        │
└─────────────────┘         └─────────────────┘

    Choose Any Two:
    ├─ CP: Consistency + Partition Tolerance
    ├─ AP: Availability + Partition Tolerance  
    └─ CA: Consistency + Availability (not realistic in distributed systems)
```

### CAP Theorem Implementation Examples

```python
import asyncio
import time
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass
from enum import Enum
import json
import hashlib
from abc import ABC, abstractmethod

class ConsistencyLevel(Enum):
    STRONG = "strong"
    EVENTUAL = "eventual"
    WEAK = "weak"

class NodeStatus(Enum):
    HEALTHY = "healthy"
    PARTITIONED = "partitioned"
    FAILED = "failed"

@dataclass
class DataRecord:
    key: str
    value: Any
    version: int
    timestamp: float
    node_id: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'key': self.key,
            'value': self.value,
            'version': self.version,
            'timestamp': self.timestamp,
            'node_id': self.node_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DataRecord':
        return cls(**data)

class DistributedNode:
    def __init__(self, node_id: str, consistency_level: ConsistencyLevel = ConsistencyLevel.EVENTUAL):
        self.node_id = node_id
        self.consistency_level = consistency_level
        self.data_store = {}
        self.status = NodeStatus.HEALTHY
        self.peers = set()
        self.partition_groups = set()
        self.vector_clock = {}
        
    def add_peer(self, peer_node: 'DistributedNode'):
        """Add peer node"""
        self.peers.add(peer_node)
        peer_node.peers.add(self)
        
        # Initialize vector clock
        self.vector_clock[peer_node.node_id] = 0
        peer_node.vector_clock[self.node_id] = 0
    
    def simulate_partition(self, partitioned_nodes: Set['DistributedNode']):
        """Simulate network partition"""
        self.partition_groups = partitioned_nodes
        self.status = NodeStatus.PARTITIONED
        
        for node in partitioned_nodes:
            node.partition_groups = partitioned_nodes
            node.status = NodeStatus.PARTITIONED
    
    def heal_partition(self):
        """Heal network partition"""
        self.status = NodeStatus.HEALTHY
        self.partition_groups.clear()
    
    async def write(self, key: str, value: Any, required_acks: int = 1) -> bool:
        """Write data with specified consistency requirements"""
        if self.status == NodeStatus.FAILED:
            return False
        
        # Increment vector clock
        self.vector_clock[self.node_id] = self.vector_clock.get(self.node_id, 0) + 1
        
        # Create data record
        record = DataRecord(
            key=key,
            value=value,
            version=self.vector_clock[self.node_id],
            timestamp=time.time(),
            node_id=self.node_id
        )
        
        # Store locally
        self.data_store[key] = record
        acks_received = 1  # Self acknowledgment
        
        if self.consistency_level == ConsistencyLevel.STRONG:
            # Strong consistency: wait for majority acknowledgments
            replication_tasks = []
            available_peers = self._get_available_peers()
            
            for peer in available_peers:
                task = asyncio.create_task(self._replicate_to_peer(peer, record))
                replication_tasks.append(task)
            
            if replication_tasks:
                results = await asyncio.gather(*replication_tasks, return_exceptions=True)
                acks_received += sum(1 for result in results if result is True)
            
            # Check if we have enough acknowledgments
            total_nodes = len(available_peers) + 1
            majority = (total_nodes // 2) + 1
            
            return acks_received >= min(required_acks, majority)
        
        else:
            # Eventual consistency: replicate asynchronously
            asyncio.create_task(self._async_replicate(record))
            return True
    
    async def read(self, key: str, read_level: str = "local") -> Optional[DataRecord]:
        """Read data with specified consistency level"""
        if self.status == NodeStatus.FAILED:
            return None
        
        if read_level == "local":
            return self.data_store.get(key)
        
        elif read_level == "quorum":
            # Read from majority of nodes
            available_peers = self._get_available_peers()
            read_tasks = [asyncio.create_task(self._read_from_peer(peer, key)) for peer in available_peers]
            
            # Include local read
            local_record = self.data_store.get(key)
            all_records = [local_record] if local_record else []
            
            if read_tasks:
                results = await asyncio.gather(*read_tasks, return_exceptions=True)
                for result in results:
                    if isinstance(result, DataRecord):
                        all_records.append(result)
            
            # Return the most recent version
            if all_records:
                return max(all_records, key=lambda r: (r.version, r.timestamp))
            
            return None
        
        elif read_level == "all":
            # Read from all available nodes
            available_peers = self._get_available_peers()
            read_tasks = [asyncio.create_task(self._read_from_peer(peer, key)) for peer in available_peers]
            
            local_record = self.data_store.get(key)
            all_records = [local_record] if local_record else []
            
            if read_tasks:
                results = await asyncio.gather(*read_tasks, return_exceptions=True)
                for result in results:
                    if isinstance(result, DataRecord):
                        all_records.append(result)
            
            # Check for conflicts and resolve
            return self._resolve_conflicts(all_records) if all_records else None
    
    def _get_available_peers(self) -> Set['DistributedNode']:
        """Get peers that are not partitioned"""
        if self.status == NodeStatus.PARTITIONED:
            return {peer for peer in self.peers if peer in self.partition_groups and peer.status != NodeStatus.FAILED}
        else:
            return {peer for peer in self.peers if peer.status == NodeStatus.HEALTHY}
    
    async def _replicate_to_peer(self, peer: 'DistributedNode', record: DataRecord) -> bool:
        """Replicate data to peer node"""
        try:
            # Simulate network delay
            await asyncio.sleep(0.01)
            
            if peer.status == NodeStatus.FAILED:
                return False
            
            # Check if peer is reachable (not partitioned)
            if self.status == NodeStatus.PARTITIONED and peer not in self.partition_groups:
                return False
            
            # Store on peer
            existing_record = peer.data_store.get(record.key)
            if not existing_record or record.version > existing_record.version:
                peer.data_store[record.key] = record
                # Update peer's vector clock
                peer.vector_clock[record.node_id] = max(
                    peer.vector_clock.get(record.node_id, 0),
                    record.version
                )
            
            return True
        
        except Exception:
            return False
    
    async def _read_from_peer(self, peer: 'DistributedNode', key: str) -> Optional[DataRecord]:
        """Read data from peer node"""
        try:
            # Simulate network delay
            await asyncio.sleep(0.01)
            
            if peer.status == NodeStatus.FAILED:
                return None
            
            # Check if peer is reachable
            if self.status == NodeStatus.PARTITIONED and peer not in self.partition_groups:
                return None
            
            return peer.data_store.get(key)
        
        except Exception:
            return None
    
    async def _async_replicate(self, record: DataRecord):
        """Asynchronously replicate to all available peers"""
        available_peers = self._get_available_peers()
        replication_tasks = [self._replicate_to_peer(peer, record) for peer in available_peers]
        
        if replication_tasks:
            await asyncio.gather(*replication_tasks, return_exceptions=True)
    
    def _resolve_conflicts(self, records: List[DataRecord]) -> DataRecord:
        """Resolve conflicts using last-writer-wins"""
        if not records:
            return None
        
        # Sort by version and timestamp
        sorted_records = sorted(records, key=lambda r: (r.version, r.timestamp), reverse=True)
        return sorted_records[0]
    
    async def anti_entropy_repair(self):
        """Perform anti-entropy repair with peers"""
        available_peers = self._get_available_peers()
        
        for peer in available_peers:
            # Exchange data with peer
            for key, local_record in self.data_store.items():
                peer_record = peer.data_store.get(key)
                
                if not peer_record or local_record.version > peer_record.version:
                    # Send our version to peer
                    peer.data_store[key] = local_record
                elif peer_record.version > local_record.version:
                    # Get peer's version
                    self.data_store[key] = peer_record
            
            # Also check for keys we don't have
            for key, peer_record in peer.data_store.items():
                if key not in self.data_store:
                    self.data_store[key] = peer_record

# Example: CP System (Consistency + Partition Tolerance)
class CPSystem:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.leader = nodes[0] if nodes else None
        
        # Set all nodes to strong consistency
        for node in nodes:
            node.consistency_level = ConsistencyLevel.STRONG
    
    async def write(self, key: str, value: Any) -> bool:
        """Write with strong consistency"""
        if not self.leader or self.leader.status == NodeStatus.FAILED:
            # Leader election would happen here
            return False
        
        # Require majority acknowledgments
        majority = (len(self.nodes) // 2) + 1
        return await self.leader.write(key, value, required_acks=majority)
    
    async def read(self, key: str) -> Optional[DataRecord]:
        """Read with strong consistency"""
        if not self.leader or self.leader.status == NodeStatus.FAILED:
            return None
        
        return await self.leader.read(key, read_level="quorum")

# Example: AP System (Availability + Partition Tolerance)
class APSystem:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        
        # Set all nodes to eventual consistency
        for node in nodes:
            node.consistency_level = ConsistencyLevel.EVENTUAL
    
    async def write(self, key: str, value: Any) -> bool:
        """Write with high availability"""
        # Write to any available node
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                return await node.write(key, value, required_acks=1)
        
        return False
    
    async def read(self, key: str) -> Optional[DataRecord]:
        """Read with high availability"""
        # Read from any available node
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                result = await node.read(key, read_level="local")
                if result:
                    return result
        
        return None
    
    async def start_anti_entropy(self):
        """Start anti-entropy process for eventual consistency"""
        while True:
            for node in self.nodes:
                if node.status != NodeStatus.FAILED:
                    await node.anti_entropy_repair()
            
            await asyncio.sleep(10)  # Run every 10 seconds
```

## Consistency Models

### 1. Strong Consistency

All nodes see the same data at the same time.

```python
class StrongConsistencyStore:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.leader = self._elect_leader()
        self.term = 0
    
    def _elect_leader(self) -> Optional[DistributedNode]:
        """Simple leader election"""
        healthy_nodes = [node for node in self.nodes if node.status == NodeStatus.HEALTHY]
        return healthy_nodes[0] if healthy_nodes else None
    
    async def write(self, key: str, value: Any) -> bool:
        """Write with strong consistency using two-phase commit"""
        if not self.leader:
            return False
        
        # Phase 1: Prepare
        prepare_success = await self._prepare_phase(key, value)
        if not prepare_success:
            await self._abort_transaction(key)
            return False
        
        # Phase 2: Commit
        commit_success = await self._commit_phase(key, value)
        return commit_success
    
    async def _prepare_phase(self, key: str, value: Any) -> bool:
        """Two-phase commit prepare phase"""
        prepare_tasks = []
        
        for node in self.nodes:
            if node != self.leader and node.status == NodeStatus.HEALTHY:
                task = asyncio.create_task(self._send_prepare(node, key, value))
                prepare_tasks.append(task)
        
        if not prepare_tasks:
            return True  # Only leader node
        
        results = await asyncio.gather(*prepare_tasks, return_exceptions=True)
        return all(result is True for result in results)
    
    async def _send_prepare(self, node: DistributedNode, key: str, value: Any) -> bool:
        """Send prepare message to node"""
        try:
            # Simulate prepare request
            await asyncio.sleep(0.01)
            
            if node.status != NodeStatus.HEALTHY:
                return False
            
            # Node votes yes if it can commit
            return True
        
        except Exception:
            return False
    
    async def _commit_phase(self, key: str, value: Any) -> bool:
        """Two-phase commit commit phase"""
        # Commit on leader first
        record = DataRecord(
            key=key,
            value=value,
            version=int(time.time() * 1000),
            timestamp=time.time(),
            node_id=self.leader.node_id
        )
        
        self.leader.data_store[key] = record
        
        # Commit on followers
        commit_tasks = []
        for node in self.nodes:
            if node != self.leader and node.status == NodeStatus.HEALTHY:
                task = asyncio.create_task(self._send_commit(node, record))
                commit_tasks.append(task)
        
        if commit_tasks:
            await asyncio.gather(*commit_tasks, return_exceptions=True)
        
        return True
    
    async def _send_commit(self, node: DistributedNode, record: DataRecord) -> bool:
        """Send commit message to node"""
        try:
            await asyncio.sleep(0.01)
            
            if node.status == NodeStatus.HEALTHY:
                node.data_store[record.key] = record
                return True
            
            return False
        
        except Exception:
            return False
    
    async def _abort_transaction(self, key: str):
        """Abort transaction on all nodes"""
        abort_tasks = []
        for node in self.nodes:
            if node.status == NodeStatus.HEALTHY:
                task = asyncio.create_task(self._send_abort(node, key))
                abort_tasks.append(task)
        
        if abort_tasks:
            await asyncio.gather(*abort_tasks, return_exceptions=True)
    
    async def _send_abort(self, node: DistributedNode, key: str) -> bool:
        """Send abort message to node"""
        try:
            await asyncio.sleep(0.01)
            # Node would rollback any prepared changes
            return True
        except Exception:
            return False
    
    async def read(self, key: str) -> Optional[DataRecord]:
        """Read with strong consistency"""
        if not self.leader:
            return None
        
        return self.leader.data_store.get(key)
```

### 2. Eventual Consistency

System will become consistent over time, but may be temporarily inconsistent.

```python
class EventualConsistencyStore:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.gossip_interval = 1.0  # seconds
        self.running = False
    
    async def write(self, key: str, value: Any) -> bool:
        """Write to any available node"""
        # Find an available node
        available_nodes = [node for node in self.nodes if node.status != NodeStatus.FAILED]
        
        if not available_nodes:
            return False
        
        # Write to first available node
        node = available_nodes[0]
        return await node.write(key, value, required_acks=1)
    
    async def read(self, key: str) -> Optional[DataRecord]:
        """Read from any available node"""
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                record = await node.read(key, read_level="local")
                if record:
                    return record
        
        return None
    
    async def start_gossip_protocol(self):
        """Start gossip protocol for eventual consistency"""
        self.running = True
        
        while self.running:
            await self._gossip_round()
            await asyncio.sleep(self.gossip_interval)
    
    async def _gossip_round(self):
        """Perform one round of gossip"""
        for node in self.nodes:
            if node.status == NodeStatus.FAILED:
                continue
            
            # Select random peer to gossip with
            available_peers = node._get_available_peers()
            if not available_peers:
                continue
            
            import random
            peer = random.choice(list(available_peers))
            
            # Exchange data
            await self._exchange_data(node, peer)
    
    async def _exchange_data(self, node1: DistributedNode, node2: DistributedNode):
        """Exchange data between two nodes"""
        try:
            # Node1 sends its data to Node2
            for key, record in node1.data_store.items():
                peer_record = node2.data_store.get(key)
                
                if not peer_record or self._is_newer(record, peer_record):
                    node2.data_store[key] = record
            
            # Node2 sends its data to Node1
            for key, record in node2.data_store.items():
                peer_record = node1.data_store.get(key)
                
                if not peer_record or self._is_newer(record, peer_record):
                    node1.data_store[key] = record
        
        except Exception as e:
            print(f"Error exchanging data: {e}")
    
    def _is_newer(self, record1: DataRecord, record2: DataRecord) -> bool:
        """Check if record1 is newer than record2"""
        if record1.version != record2.version:
            return record1.version > record2.version
        return record1.timestamp > record2.timestamp
    
    def stop_gossip(self):
        """Stop gossip protocol"""
        self.running = False
```

### 3. Causal Consistency

Maintains causal relationships between operations.

```python
class VectorClock:
    def __init__(self, node_id: str, nodes: List[str]):
        self.node_id = node_id
        self.clock = {node: 0 for node in nodes}
    
    def tick(self):
        """Increment local clock"""
        self.clock[self.node_id] += 1
    
    def update(self, other_clock: Dict[str, int]):
        """Update clock with received clock"""
        for node, timestamp in other_clock.items():
            if node in self.clock:
                self.clock[node] = max(self.clock[node], timestamp)
        
        # Increment local clock
        self.tick()
    
    def happens_before(self, other_clock: Dict[str, int]) -> bool:
        """Check if this clock happens before other clock"""
        return (all(self.clock[node] <= other_clock.get(node, 0) for node in self.clock) and
                any(self.clock[node] < other_clock.get(node, 0) for node in self.clock))
    
    def concurrent(self, other_clock: Dict[str, int]) -> bool:
        """Check if events are concurrent"""
        return not self.happens_before(other_clock) and not self._other_happens_before(other_clock)
    
    def _other_happens_before(self, other_clock: Dict[str, int]) -> bool:
        """Check if other clock happens before this clock"""
        return (all(other_clock.get(node, 0) <= self.clock[node] for node in self.clock) and
                any(other_clock.get(node, 0) < self.clock[node] for node in self.clock))
    
    def copy(self) -> Dict[str, int]:
        """Get copy of clock"""
        return self.clock.copy()

class CausalConsistencyStore:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
        self.node_ids = [node.node_id for node in nodes]
        
        # Initialize vector clocks for each node
        for node in nodes:
            node.vector_clock = VectorClock(node.node_id, self.node_ids)
    
    async def write(self, node_id: str, key: str, value: Any) -> bool:
        """Write with causal consistency"""
        node = self._get_node(node_id)
        if not node or node.status == NodeStatus.FAILED:
            return False
        
        # Increment vector clock
        node.vector_clock.tick()
        
        # Create record with vector clock
        record = DataRecord(
            key=key,
            value=value,
            version=node.vector_clock.clock[node_id],
            timestamp=time.time(),
            node_id=node_id
        )
        
        # Add vector clock to record
        record.vector_clock = node.vector_clock.copy()
        
        # Store locally
        node.data_store[key] = record
        
        # Replicate to other nodes
        await self._replicate_causally(node, record)
        
        return True
    
    async def _replicate_causally(self, source_node: DistributedNode, record: DataRecord):
        """Replicate record maintaining causal order"""
        replication_tasks = []
        
        for node in self.nodes:
            if node != source_node and node.status != NodeStatus.FAILED:
                task = asyncio.create_task(self._send_causal_update(node, record))
                replication_tasks.append(task)
        
        if replication_tasks:
            await asyncio.gather(*replication_tasks, return_exceptions=True)
    
    async def _send_causal_update(self, target_node: DistributedNode, record: DataRecord):
        """Send causal update to target node"""
        try:
            await asyncio.sleep(0.01)  # Simulate network delay
            
            if target_node.status == NodeStatus.FAILED:
                return False
            
            # Update target node's vector clock
            target_node.vector_clock.update(record.vector_clock)
            
            # Store record if it's causally ready
            if self._is_causally_ready(target_node, record):
                target_node.data_store[record.key] = record
            else:
                # Buffer the record until dependencies are satisfied
                if not hasattr(target_node, 'causal_buffer'):
                    target_node.causal_buffer = []
                target_node.causal_buffer.append(record)
            
            # Check if any buffered records can now be applied
            await self._process_causal_buffer(target_node)
            
            return True
        
        except Exception:
            return False
    
    def _is_causally_ready(self, node: DistributedNode, record: DataRecord) -> bool:
        """Check if record is causally ready to be applied"""
        # Record is ready if all its causal dependencies are satisfied
        for dep_node, dep_timestamp in record.vector_clock.items():
            if dep_node == record.node_id:
                # For the originating node, we need exactly the next version
                if node.vector_clock.clock[dep_node] + 1 != dep_timestamp:
                    return False
            else:
                # For other nodes, we need at least the required version
                if node.vector_clock.clock[dep_node] < dep_timestamp:
                    return False
        
        return True
    
    async def _process_causal_buffer(self, node: DistributedNode):
        """Process buffered records that are now causally ready"""
        if not hasattr(node, 'causal_buffer'):
            return
        
        ready_records = []
        remaining_records = []
        
        for record in node.causal_buffer:
            if self._is_causally_ready(node, record):
                ready_records.append(record)
            else:
                remaining_records.append(record)
        
        # Apply ready records
        for record in ready_records:
            node.data_store[record.key] = record
            node.vector_clock.update(record.vector_clock)
        
        # Update buffer
        node.causal_buffer = remaining_records
        
        # Recursively process buffer in case applying records made others ready
        if ready_records:
            await self._process_causal_buffer(node)
    
    async def read(self, node_id: str, key: str) -> Optional[DataRecord]:
        """Read with causal consistency"""
        node = self._get_node(node_id)
        if not node or node.status == NodeStatus.FAILED:
            return None
        
        return node.data_store.get(key)
    
    def _get_node(self, node_id: str) -> Optional[DistributedNode]:
        """Get node by ID"""
        for node in self.nodes:
            if node.node_id == node_id:
                return node
        return None
```

## Consensus Algorithms

### 1. Raft Consensus

Raft is a consensus algorithm designed to be easy to understand.

```python
import random
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

class NodeState(Enum):
    FOLLOWER = "follower"
    CANDIDATE = "candidate"
    LEADER = "leader"

@dataclass
class LogEntry:
    term: int
    index: int
    command: Dict[str, Any]
    committed: bool = False

@dataclass
class RaftNode:
    node_id: str
    peers: List[str] = field(default_factory=list)
    
    # Persistent state
    current_term: int = 0
    voted_for: Optional[str] = None
    log: List[LogEntry] = field(default_factory=list)
    
    # Volatile state
    commit_index: int = 0
    last_applied: int = 0
    state: NodeState = NodeState.FOLLOWER
    
    # Leader state
    next_index: Dict[str, int] = field(default_factory=dict)
    match_index: Dict[str, int] = field(default_factory=dict)
    
    # Timing
    election_timeout: float = 0.0
    heartbeat_interval: float = 0.1
    last_heartbeat: float = 0.0
    
    def __post_init__(self):
        self.reset_election_timeout()
        
        # Initialize leader state
        for peer in self.peers:
            self.next_index[peer] = len(self.log) + 1
            self.match_index[peer] = 0
    
    def reset_election_timeout(self):
        """Reset election timeout with random jitter"""
        self.election_timeout = time.time() + random.uniform(0.15, 0.3)
    
    def is_election_timeout(self) -> bool:
        """Check if election timeout has occurred"""
        return time.time() > self.election_timeout
    
    def should_send_heartbeat(self) -> bool:
        """Check if leader should send heartbeat"""
        return (self.state == NodeState.LEADER and 
                time.time() - self.last_heartbeat > self.heartbeat_interval)

class RaftCluster:
    def __init__(self, node_ids: List[str]):
        self.nodes = {}
        
        # Create nodes
        for node_id in node_ids:
            peers = [peer_id for peer_id in node_ids if peer_id != node_id]
            self.nodes[node_id] = RaftNode(node_id=node_id, peers=peers)
        
        self.leader_id = None
        self.running = False
    
    async def start(self):
        """Start the Raft cluster"""
        self.running = True
        
        # Start main loop for each node
        tasks = []
        for node_id in self.nodes:
            task = asyncio.create_task(self._node_loop(node_id))
            tasks.append(task)
        
        await asyncio.gather(*tasks)
    
    async def _node_loop(self, node_id: str):
        """Main loop for a Raft node"""
        node = self.nodes[node_id]
        
        while self.running:
            if node.state == NodeState.FOLLOWER:
                await self._follower_behavior(node)
            elif node.state == NodeState.CANDIDATE:
                await self._candidate_behavior(node)
            elif node.state == NodeState.LEADER:
                await self._leader_behavior(node)
            
            await asyncio.sleep(0.01)  # Small delay to prevent busy waiting
    
    async def _follower_behavior(self, node: RaftNode):
        """Follower behavior"""
        if node.is_election_timeout():
            # Start election
            await self._start_election(node)
    
    async def _candidate_behavior(self, node: RaftNode):
        """Candidate behavior"""
        # Request votes from peers
        votes_received = await self._request_votes(node)
        majority = len(node.peers) // 2 + 1
        
        if votes_received >= majority:
            # Won election, become leader
            await self._become_leader(node)
        elif node.is_election_timeout():
            # Election timeout, start new election
            await self._start_election(node)
    
    async def _leader_behavior(self, node: RaftNode):
        """Leader behavior"""
        if node.should_send_heartbeat():
            await self._send_heartbeats(node)
            node.last_heartbeat = time.time()
    
    async def _start_election(self, node: RaftNode):
        """Start leader election"""
        node.state = NodeState.CANDIDATE
        node.current_term += 1
        node.voted_for = node.node_id
        node.reset_election_timeout()
        
        print(f"Node {node.node_id} starting election for term {node.current_term}")
    
    async def _request_votes(self, node: RaftNode) -> int:
        """Request votes from peer nodes"""
        votes = 1  # Vote for self
        
        for peer_id in node.peers:
            peer = self.nodes[peer_id]
            
            # Send vote request
            vote_granted = await self._send_vote_request(node, peer)
            if vote_granted:
                votes += 1
        
        return votes
    
    async def _send_vote_request(self, candidate: RaftNode, peer: RaftNode) -> bool:
        """Send vote request to peer"""
        # Simulate network delay
        await asyncio.sleep(0.01)
        
        # Vote request logic
        if (peer.current_term < candidate.current_term and
            (peer.voted_for is None or peer.voted_for == candidate.node_id)):
            
            # Check if candidate's log is at least as up-to-date
            if self._is_log_up_to_date(candidate, peer):
                peer.current_term = candidate.current_term
                peer.voted_for = candidate.node_id
                peer.state = NodeState.FOLLOWER
                peer.reset_election_timeout()
                return True
        
        return False
    
    def _is_log_up_to_date(self, candidate: RaftNode, peer: RaftNode) -> bool:
        """Check if candidate's log is at least as up-to-date as peer's"""
        if not candidate.log and not peer.log:
            return True
        
        if not peer.log:
            return True
        
        if not candidate.log:
            return False
        
        candidate_last = candidate.log[-1]
        peer_last = peer.log[-1]
        
        if candidate_last.term > peer_last.term:
            return True
        elif candidate_last.term == peer_last.term:
            return candidate_last.index >= peer_last.index
        else:
            return False
    
    async def _become_leader(self, node: RaftNode):
        """Become cluster leader"""
        node.state = NodeState.LEADER
        self.leader_id = node.node_id
        
        # Initialize leader state
        for peer_id in node.peers:
            node.next_index[peer_id] = len(node.log) + 1
            node.match_index[peer_id] = 0
        
        print(f"Node {node.node_id} became leader for term {node.current_term}")
        
        # Send initial heartbeats
        await self._send_heartbeats(node)
    
    async def _send_heartbeats(self, leader: RaftNode):
        """Send heartbeats to all followers"""
        for peer_id in leader.peers:
            peer = self.nodes[peer_id]
            await self._send_append_entries(leader, peer, heartbeat=True)
    
    async def _send_append_entries(self, leader: RaftNode, follower: RaftNode, 
                                 entries: List[LogEntry] = None, heartbeat: bool = False):
        """Send append entries RPC"""
        # Simulate network delay
        await asyncio.sleep(0.01)
        
        if entries is None:
            entries = []
        
        # Append entries logic
        if follower.current_term > leader.current_term:
            # Leader is stale, step down
            leader.state = NodeState.FOLLOWER
            leader.current_term = follower.current_term
            leader.voted_for = None
            self.leader_id = None
            return False
        
        # Update follower's term and reset election timeout
        if follower.current_term < leader.current_term:
            follower.current_term = leader.current_term
            follower.voted_for = None
        
        follower.state = NodeState.FOLLOWER
        follower.reset_election_timeout()
        
        # Append entries if any
        if entries:
            follower.log.extend(entries)
        
        return True
    
    async def append_entry(self, command: Dict[str, Any]) -> bool:
        """Append entry to the log (client request)"""
        if not self.leader_id:
            return False
        
        leader = self.nodes[self.leader_id]
        
        # Create log entry
        entry = LogEntry(
            term=leader.current_term,
            index=len(leader.log) + 1,
            command=command
        )
        
        # Append to leader's log
        leader.log.append(entry)
        
        # Replicate to followers
        replicated_count = await self._replicate_entry(leader, entry)
        majority = len(leader.peers) // 2 + 1
        
        if replicated_count >= majority:
            # Commit the entry
            entry.committed = True
            leader.commit_index = entry.index
            return True
        
        return False
    
    async def _replicate_entry(self, leader: RaftNode, entry: LogEntry) -> int:
        """Replicate entry to followers"""
        replicated_count = 1  # Leader has the entry
        
        replication_tasks = []
        for peer_id in leader.peers:
            peer = self.nodes[peer_id]
            task = asyncio.create_task(self._send_append_entries(leader, peer, [entry]))
            replication_tasks.append(task)
        
        if replication_tasks:
            results = await asyncio.gather(*replication_tasks, return_exceptions=True)
            replicated_count += sum(1 for result in results if result is True)
        
        return replicated_count
    
    def get_leader(self) -> Optional[str]:
        """Get current leader ID"""
        return self.leader_id
    
    def get_committed_entries(self, node_id: str) -> List[LogEntry]:
        """Get committed entries for a node"""
        node = self.nodes.get(node_id)
        if not node:
            return []
        
        return [entry for entry in node.log if entry.committed]
    
    def stop(self):
        """Stop the cluster"""
        self.running = False
```

### 2. Byzantine Fault Tolerance (PBFT)

Practical Byzantine Fault Tolerance for handling malicious nodes.

```python
class PBFTMessage:
    def __init__(self, msg_type: str, view: int, sequence: int, 
                 node_id: str, request: Dict[str, Any] = None):
        self.msg_type = msg_type  # "request", "pre-prepare", "prepare", "commit"
        self.view = view
        self.sequence = sequence
        self.node_id = node_id
        self.request = request
        self.timestamp = time.time()
        self.signature = self._sign()
    
    def _sign(self) -> str:
        """Simple signature simulation"""
        content = f"{self.msg_type}:{self.view}:{self.sequence}:{self.node_id}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def verify_signature(self) -> bool:
        """Verify message signature"""
        expected_sig = self._sign()
        return self.signature == expected_sig

class PBFTNode:
    def __init__(self, node_id: str, total_nodes: int):
        self.node_id = node_id
        self.total_nodes = total_nodes
        self.f = (total_nodes - 1) // 3  # Maximum Byzantine nodes
        
        self.view = 0
        self.sequence = 0
        self.is_primary = False
        
        # Message logs
        self.request_log = {}
        self.pre_prepare_log = {}
        self.prepare_log = {}
        self.commit_log = {}
        
        # State
        self.committed_requests = []
        self.executed_requests = set()
    
    def is_primary_for_view(self, view: int) -> bool:
        """Check if this node is primary for given view"""
        primary_id = f"node_{view % self.total_nodes}"
        return self.node_id == primary_id
    
    async def handle_client_request(self, request: Dict[str, Any]) -> bool:
        """Handle client request (only primary)"""
        if not self.is_primary_for_view(self.view):
            return False
        
        self.sequence += 1
        
        # Create pre-prepare message
        pre_prepare = PBFTMessage(
            msg_type="pre-prepare",
            view=self.view,
            sequence=self.sequence,
            node_id=self.node_id,
            request=request
        )
        
        # Store in log
        self.pre_prepare_log[(self.view, self.sequence)] = pre_prepare
        self.request_log[self.sequence] = request
        
        # Broadcast pre-prepare to all replicas
        await self._broadcast_message(pre_prepare)
        
        return True
    
    async def handle_pre_prepare(self, message: PBFTMessage) -> bool:
        """Handle pre-prepare message"""
        if not message.verify_signature():
            return False
        
        # Check if message is from current primary
        if not self.is_primary_for_view(message.view):
            return False
        
        # Store pre-prepare
        key = (message.view, message.sequence)
        self.pre_prepare_log[key] = message
        self.request_log[message.sequence] = message.request
        
        # Send prepare message
        prepare = PBFTMessage(
            msg_type="prepare",
            view=message.view,
            sequence=message.sequence,
            node_id=self.node_id
        )
        
        await self._broadcast_message(prepare)
        return True
    
    async def handle_prepare(self, message: PBFTMessage) -> bool:
        """Handle prepare message"""
        if not message.verify_signature():
            return False
        
        key = (message.view, message.sequence)
        
        # Store prepare message
        if key not in self.prepare_log:
            self.prepare_log[key] = []
        self.prepare_log[key].append(message)
        
        # Check if we have enough prepare messages (2f)
        if len(self.prepare_log[key]) >= 2 * self.f:
            # Send commit message
            commit = PBFTMessage(
                msg_type="commit",
                view=message.view,
                sequence=message.sequence,
                node_id=self.node_id
            )
            
            await self._broadcast_message(commit)
        
        return True
    
    async def handle_commit(self, message: PBFTMessage) -> bool:
        """Handle commit message"""
        if not message.verify_signature():
            return False
        
        key = (message.view, message.sequence)
        
        # Store commit message
        if key not in self.commit_log:
            self.commit_log[key] = []
        self.commit_log[key].append(message)
        
        # Check if we have enough commit messages (2f + 1)
        if len(self.commit_log[key]) >= 2 * self.f + 1:
            # Execute the request
            await self._execute_request(message.sequence)
        
        return True
    
    async def _execute_request(self, sequence: int):
        """Execute committed request"""
        if sequence in self.executed_requests:
            return
        
        request = self.request_log.get(sequence)
        if not request:
            return
        
        # Execute the request (application-specific logic)
        result = await self._apply_request(request)
        
        self.executed_requests.add(sequence)
        self.committed_requests.append((sequence, request, result))
        
        print(f"Node {self.node_id} executed request {sequence}: {request}")
    
    async def _apply_request(self, request: Dict[str, Any]) -> Any:
        """Apply request to state machine"""
        # Simulate request execution
        await asyncio.sleep(0.01)
        return {"status": "success", "request": request}
    
    async def _broadcast_message(self, message: PBFTMessage):
        """Broadcast message to all nodes"""
        # In a real implementation, this would send to all other nodes
        print(f"Node {self.node_id} broadcasting {message.msg_type} for sequence {message.sequence}")
    
    def get_committed_requests(self) -> List[Tuple[int, Dict[str, Any], Any]]:
        """Get all committed requests"""
        return self.committed_requests.copy()
```

## Distributed System Patterns

### 1. Quorum-based Systems

```python
class QuorumSystem:
    def __init__(self, nodes: List[DistributedNode], read_quorum: int, write_quorum: int):
        self.nodes = nodes
        self.read_quorum = read_quorum
        self.write_quorum = write_quorum
        self.total_nodes = len(nodes)
        
        # Validate quorum sizes
        if read_quorum + write_quorum <= self.total_nodes:
            raise ValueError("Read quorum + Write quorum must be > total nodes for strong consistency")
    
    async def write(self, key: str, value: Any) -> bool:
        """Write with quorum consensus"""
        # Create new version
        version = int(time.time() * 1000)
        record = DataRecord(
            key=key,
            value=value,
            version=version,
            timestamp=time.time(),
            node_id="client"
        )
        
        # Write to nodes
        write_tasks = []
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                task = asyncio.create_task(self._write_to_node(node, record))
                write_tasks.append(task)
        
        if not write_tasks:
            return False
        
        # Wait for write quorum
        results = await asyncio.gather(*write_tasks, return_exceptions=True)
        successful_writes = sum(1 for result in results if result is True)
        
        return successful_writes >= self.write_quorum
    
    async def read(self, key: str) -> Optional[DataRecord]:
        """Read with quorum consensus"""
        # Read from nodes
        read_tasks = []
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                task = asyncio.create_task(self._read_from_node(node, key))
                read_tasks.append(task)
        
        if not read_tasks:
            return None
        
        # Wait for read quorum
        results = await asyncio.gather(*read_tasks, return_exceptions=True)
        valid_records = [result for result in results if isinstance(result, DataRecord)]
        
        if len(valid_records) < self.read_quorum:
            return None
        
        # Return the most recent version
        return max(valid_records, key=lambda r: (r.version, r.timestamp))
    
    async def _write_to_node(self, node: DistributedNode, record: DataRecord) -> bool:
        """Write record to specific node"""
        try:
            await asyncio.sleep(0.01)  # Simulate network delay
            
            if node.status == NodeStatus.FAILED:
                return False
            
            node.data_store[record.key] = record
            return True
        
        except Exception:
            return False
    
    async def _read_from_node(self, node: DistributedNode, key: str) -> Optional[DataRecord]:
        """Read record from specific node"""
        try:
            await asyncio.sleep(0.01)  # Simulate network delay
            
            if node.status == NodeStatus.FAILED:
                return None
            
            return node.data_store.get(key)
        
        except Exception:
            return None
```

### 2. Merkle Trees for Data Integrity

```python
import hashlib
from typing import List, Optional, Tuple

class MerkleNode:
    def __init__(self, hash_value: str, left: 'MerkleNode' = None, right: 'MerkleNode' = None, data: str = None):
        self.hash = hash_value
        self.left = left
        self.right = right
        self.data = data  # Only leaf nodes have data
    
    def is_leaf(self) -> bool:
        return self.left is None and self.right is None

class MerkleTree:
    def __init__(self, data_blocks: List[str]):
        self.data_blocks = data_blocks
        self.root = self._build_tree(data_blocks)
    
    def _hash(self, data: str) -> str:
        """Compute SHA-256 hash"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _build_tree(self, data_blocks: List[str]) -> MerkleNode:
        """Build Merkle tree from data blocks"""
        if not data_blocks:
            return None
        
        # Create leaf nodes
        nodes = [MerkleNode(self._hash(data), data=data) for data in data_blocks]
        
        # Build tree bottom-up
        while len(nodes) > 1:
            next_level = []
            
            # Process pairs of nodes
            for i in range(0, len(nodes), 2):
                left = nodes[i]
                right = nodes[i + 1] if i + 1 < len(nodes) else nodes[i]  # Duplicate if odd number
                
                # Create parent node
                combined_hash = self._hash(left.hash + right.hash)
                parent = MerkleNode(combined_hash, left, right)
                next_level.append(parent)
            
            nodes = next_level
        
        return nodes[0] if nodes else None
    
    def get_root_hash(self) -> str:
        """Get root hash of the tree"""
        return self.root.hash if self.root else ""
    
    def get_proof(self, data_block: str) -> List[Tuple[str, str]]:
        """Get Merkle proof for a data block"""
        if not self.root:
            return []
        
        # Find the leaf node
        target_hash = self._hash(data_block)
        proof = []
        
        def find_proof(node: MerkleNode, target: str, path: List[Tuple[str, str]]) -> bool:
            if not node:
                return False
            
            if node.is_leaf():
                return node.hash == target
            
            # Try left subtree
            if find_proof(node.left, target, path):
                if node.right:
                    path.append((node.right.hash, "right"))
                return True
            
            # Try right subtree
            if find_proof(node.right, target, path):
                if node.left:
                    path.append((node.left.hash, "left"))
                return True
            
            return False
        
        find_proof(self.root, target_hash, proof)
        return proof
    
    def verify_proof(self, data_block: str, proof: List[Tuple[str, str]], root_hash: str) -> bool:
        """Verify Merkle proof"""
        current_hash = self._hash(data_block)
        
        for sibling_hash, position in proof:
            if position == "left":
                current_hash = self._hash(sibling_hash + current_hash)
            else:  # position == "right"
                current_hash = self._hash(current_hash + sibling_hash)
        
        return current_hash == root_hash
    
    def detect_differences(self, other_tree: 'MerkleTree') -> List[str]:
        """Detect differences between two Merkle trees"""
        if self.get_root_hash() == other_tree.get_root_hash():
            return []  # Trees are identical
        
        differences = []
        
        def compare_nodes(node1: MerkleNode, node2: MerkleNode):
            if not node1 or not node2:
                return
            
            if node1.hash != node2.hash:
                if node1.is_leaf() and node2.is_leaf():
                    # Found a difference at leaf level
                    differences.append(f"Data mismatch: {node1.data} vs {node2.data}")
                else:
                    # Recurse into children
                    compare_nodes(node1.left, node2.left)
                    compare_nodes(node1.right, node2.right)
        
        compare_nodes(self.root, other_tree.root)
        return differences

# Example usage for distributed data synchronization
class DistributedDataSync:
    def __init__(self, nodes: List[DistributedNode]):
        self.nodes = nodes
    
    async def sync_data(self):
        """Synchronize data across nodes using Merkle trees"""
        # Build Merkle tree for each node
        node_trees = {}
        
        for node in self.nodes:
            if node.status != NodeStatus.FAILED:
                # Get all data from node
                data_blocks = []
                for key, record in node.data_store.items():
                    data_blocks.append(f"{key}:{record.value}:{record.version}")
                
                # Sort for consistent ordering
                data_blocks.sort()
                
                # Build Merkle tree
                tree = MerkleTree(data_blocks)
                node_trees[node.node_id] = tree
        
        # Compare trees and sync differences
        node_ids = list(node_trees.keys())
        
        for i in range(len(node_ids)):
            for j in range(i + 1, len(node_ids)):
                node1_id = node_ids[i]
                node2_id = node_ids[j]
                
                tree1 = node_trees[node1_id]
                tree2 = node_trees[node2_id]
                
                if tree1.get_root_hash() != tree2.get_root_hash():
                    # Trees differ, sync the data
                    await self._sync_nodes(self.nodes[i], self.nodes[j])
    
    async def _sync_nodes(self, node1: DistributedNode, node2: DistributedNode):
        """Sync data between two nodes"""
        # Simple sync: merge all data and keep latest versions
        all_keys = set(node1.data_store.keys()) | set(node2.data_store.keys())
        
        for key in all_keys:
            record1 = node1.data_store.get(key)
            record2 = node2.data_store.get(key)
            
            if not record1:
                node1.data_store[key] = record2
            elif not record2:
                node2.data_store[key] = record1
            elif record1.version > record2.version:
                node2.data_store[key] = record1
            elif record2.version > record1.version:
                node1.data_store[key] = record2
            # If versions are equal, keep both (or use timestamp)
```

## Failure Detection and Recovery

### 1. Heartbeat Mechanism

```python
class HeartbeatMonitor:
    def __init__(self, nodes: List[DistributedNode], heartbeat_interval: float = 1.0, timeout: float = 5.0):
        self.nodes = nodes
        self.heartbeat_interval = heartbeat_interval
        self.timeout = timeout
        self.last_heartbeat = {}
        self.running = False
    
    async def start_monitoring(self):
        """Start heartbeat monitoring"""
        self.running = True
        
        # Initialize last heartbeat times
        for node in self.nodes:
            self.last_heartbeat[node.node_id] = time.time()
        
        # Start monitoring tasks
        tasks = [
            asyncio.create_task(self._heartbeat_sender()),
            asyncio.create_task(self._failure_detector())
        ]
        
        await asyncio.gather(*tasks)
    
    async def _heartbeat_sender(self):
        """Send periodic heartbeats"""
        while self.running:
            for node in self.nodes:
                if node.status != NodeStatus.FAILED:
                    await self._send_heartbeat(node)
            
            await asyncio.sleep(self.heartbeat_interval)
    
    async def _send_heartbeat(self, node: DistributedNode):
        """Send heartbeat from node"""
        # Update heartbeat timestamp
        self.last_heartbeat[node.node_id] = time.time()
        
        # Notify peers
        for peer in node.peers:
            if peer.status != NodeStatus.FAILED:
                await self._receive_heartbeat(peer, node.node_id)
    
    async def _receive_heartbeat(self, receiver: DistributedNode, sender_id: str):
        """Receive heartbeat at node"""
        # Update last seen time for sender
        if not hasattr(receiver, 'peer_heartbeats'):
            receiver.peer_heartbeats = {}
        
        receiver.peer_heartbeats[sender_id] = time.time()
    
    async def _failure_detector(self):
        """Detect failed nodes"""
        while self.running:
            current_time = time.time()
            
            for node in self.nodes:
                if node.status == NodeStatus.FAILED:
                    continue
                
                last_seen = self.last_heartbeat.get(node.node_id, 0)
                
                if current_time - last_seen > self.timeout:
                    # Node has failed
                    await self._handle_node_failure(node)
            
            await asyncio.sleep(1.0)  # Check every second
    
    async def _handle_node_failure(self, failed_node: DistributedNode):
        """Handle node failure"""
        print(f"Node {failed_node.node_id} detected as failed")
        failed_node.status = NodeStatus.FAILED
        
        # Notify other nodes
        for node in self.nodes:
            if node != failed_node and node.status != NodeStatus.FAILED:
                await self._notify_failure(node, failed_node.node_id)
    
    async def _notify_failure(self, node: DistributedNode, failed_node_id: str):
        """Notify node about failure"""
        # Remove failed node from peer list
        node.peers = {peer for peer in node.peers if peer.node_id != failed_node_id}
        
        # Update peer heartbeats
        if hasattr(node, 'peer_heartbeats') and failed_node_id in node.peer_heartbeats:
            del node.peer_heartbeats[failed_node_id]
    
    def stop_monitoring(self):
        """Stop heartbeat monitoring"""
        self.running = False
```

### 2. Split-Brain Prevention

```python
class SplitBrainPrevention:
    def __init__(self, nodes: List[DistributedNode], quorum_size: int):
        self.nodes = nodes
        self.quorum_size = quorum_size
        self.active_partitions = []
    
    def detect_partitions(self) -> List[List[DistributedNode]]:
        """Detect network partitions"""
        partitions = []
        visited = set()
        
        for node in self.nodes:
            if node.node_id in visited or node.status == NodeStatus.FAILED:
                continue
            
            # Find all nodes reachable from this node
            partition = self._find_connected_nodes(node, visited)
            if partition:
                partitions.append(partition)
        
        return partitions
    
    def _find_connected_nodes(self, start_node: DistributedNode, visited: set) -> List[DistributedNode]:
        """Find all nodes connected to start_node"""
        if start_node.node_id in visited:
            return []
        
        connected = [start_node]
        visited.add(start_node.node_id)
        
        # BFS to find connected nodes
        queue = [start_node]
        
        while queue:
            current = queue.pop(0)
            
            for peer in current.peers:
                if (peer.node_id not in visited and 
                    peer.status != NodeStatus.FAILED and
                    self._can_communicate(current, peer)):
                    
                    connected.append(peer)
                    visited.add(peer.node_id)
                    queue.append(peer)
        
        return connected
    
    def _can_communicate(self, node1: DistributedNode, node2: DistributedNode) -> bool:
        """Check if two nodes can communicate"""
        # Check if nodes are in the same partition group
        if (node1.status == NodeStatus.PARTITIONED and 
            node2.status == NodeStatus.PARTITIONED):
            return node2 in node1.partition_groups
        
        # Both nodes must be healthy to communicate
        return (node1.status == NodeStatus.HEALTHY and 
                node2.status == NodeStatus.HEALTHY)
    
    def resolve_split_brain(self, partitions: List[List[DistributedNode]]) -> List[DistributedNode]:
        """Resolve split-brain by selecting the partition with quorum"""
        # Find partition with quorum
        quorum_partition = None
        
        for partition in partitions:
            if len(partition) >= self.quorum_size:
                if quorum_partition is None:
                    quorum_partition = partition
                else:
                    # Multiple partitions with quorum - use tiebreaker
                    if self._tiebreaker(partition, quorum_partition):
                        quorum_partition = partition
        
        if quorum_partition:
            # Activate quorum partition, deactivate others
            for partition in partitions:
                if partition != quorum_partition:
                    self._deactivate_partition(partition)
            
            return quorum_partition
        
        # No partition has quorum - deactivate all
        for partition in partitions:
            self._deactivate_partition(partition)
        
        return []
    
    def _tiebreaker(self, partition1: List[DistributedNode], partition2: List[DistributedNode]) -> bool:
        """Tiebreaker for multiple quorum partitions"""
        # Use partition with lowest node ID as tiebreaker
        min_id1 = min(node.node_id for node in partition1)
        min_id2 = min(node.node_id for node in partition2)
        return min_id1 < min_id2
    
    def _deactivate_partition(self, partition: List[DistributedNode]):
        """Deactivate a partition to prevent split-brain"""
        for node in partition:
            node.status = NodeStatus.PARTITIONED
            print(f"Deactivating node {node.node_id} to prevent split-brain")
```

## Real-World Examples

### 1. Distributed Database (Cassandra-style)

```python
class DistributedDatabase:
    def __init__(self, nodes: List[DistributedNode], replication_factor: int = 3):
        self.nodes = nodes
        self.replication_factor = replication_factor
        self.ring = self._create_consistent_hash_ring()
    
    def _create_consistent_hash_ring(self) -> Dict[int, DistributedNode]:
        """Create consistent hash ring"""
        ring = {}
        
        for node in self.nodes:
            # Create multiple virtual nodes for better distribution
            for i in range(100):  # 100 virtual nodes per physical node
                virtual_key = int(hashlib.md5(f"{node.node_id}:{i}".encode()).hexdigest(), 16)
                ring[virtual_key] = node
        
        return ring
    
    def _get_nodes_for_key(self, key: str) -> List[DistributedNode]:
        """Get nodes responsible for a key"""
        key_hash = int(hashlib.md5(key.encode()).hexdigest(), 16)
        
        # Find nodes in clockwise direction
        sorted_keys = sorted(self.ring.keys())
        
        # Find first node >= key_hash
        start_idx = 0
        for i, ring_key in enumerate(sorted_keys):
            if ring_key >= key_hash:
                start_idx = i
                break
        
        # Get replication_factor unique nodes
        selected_nodes = []
        seen_nodes = set()
        
        for i in range(len(sorted_keys)):
            idx = (start_idx + i) % len(sorted_keys)
            node = self.ring[sorted_keys[idx]]
            
            if node.node_id not in seen_nodes:
                selected_nodes.append(node)
                seen_nodes.add(node.node_id)
                
                if len(selected_nodes) >= self.replication_factor:
                    break
        
        return selected_nodes
    
    async def put(self, key: str, value: Any, consistency_level: str = "QUORUM") -> bool:
        """Put key-value pair"""
        nodes = self._get_nodes_for_key(key)
        
        if not nodes:
            return False
        
        # Determine required acknowledgments
        if consistency_level == "ONE":
            required_acks = 1
        elif consistency_level == "QUORUM":
            required_acks = (len(nodes) // 2) + 1
        elif consistency_level == "ALL":
            required_acks = len(nodes)
        else:
            required_acks = 1
        
        # Write to nodes
        write_tasks = []
        for node in nodes:
            if node.status != NodeStatus.FAILED:
                task = asyncio.create_task(node.write(key, value, required_acks=1))
                write_tasks.append(task)
        
        if not write_tasks:
            return False
        
        results = await asyncio.gather(*write_tasks, return_exceptions=True)
        successful_writes = sum(1 for result in results if result is True)
        
        return successful_writes >= required_acks
    
    async def get(self, key: str, consistency_level: str = "QUORUM") -> Optional[DataRecord]:
        """Get value for key"""
        nodes = self._get_nodes_for_key(key)
        
        if not nodes:
            return None
        
        # Determine required reads
        if consistency_level == "ONE":
            required_reads = 1
        elif consistency_level == "QUORUM":
            required_reads = (len(nodes) // 2) + 1
        elif consistency_level == "ALL":
            required_reads = len(nodes)
        else:
            required_reads = 1
        
        # Read from nodes
        read_tasks = []
        for node in nodes:
            if node.status != NodeStatus.FAILED:
                task = asyncio.create_task(node.read(key, read_level="local"))
                read_tasks.append(task)
        
        if not read_tasks:
            return None
        
        results = await asyncio.gather(*read_tasks, return_exceptions=True)
        valid_records = [result for result in results if isinstance(result, DataRecord)]
        
        if len(valid_records) < required_reads:
            return None
        
        # Return most recent version
        return max(valid_records, key=lambda r: (r.version, r.timestamp))
```

## Best Practices

### 1. Design Principles

- **Embrace Failure:** Design for failure as the norm, not the exception
- **Loose Coupling:** Minimize dependencies between components
- **Idempotency:** Ensure operations can be safely retried
- **Graceful Degradation:** System should continue operating with reduced functionality
- **Monitoring:** Implement comprehensive observability

### 2. Consistency Trade-offs

- **Strong Consistency:** Use when data correctness is critical (financial transactions)
- **Eventual Consistency:** Use when availability is more important than immediate consistency
- **Causal Consistency:** Use when maintaining operation order is important

### 3. Partition Tolerance

- **Design for Partitions:** Assume network partitions will occur
- **Quorum Systems:** Use quorums to maintain consistency during partitions
- **Split-Brain Prevention:** Implement mechanisms to prevent conflicting decisions

### 4. Performance Optimization

- **Locality:** Keep related data close together
- **Caching:** Use caching at multiple levels
- **Batching:** Batch operations to reduce network overhead
- **Compression:** Compress data for network transmission

## Common Pitfalls

### 1. Distributed State Management

- **Problem:** Inconsistent state across nodes
- **Solution:** Use consensus algorithms and state machines

### 2. Clock Synchronization

- **Problem:** Relying on synchronized clocks
- **Solution:** Use logical clocks (Lamport, Vector clocks)

### 3. Network Assumptions

- **Problem:** Assuming reliable network
- **Solution:** Design for network failures and partitions

### 4. Cascading Failures

- **Problem:** One failure causing system-wide outage
- **Solution:** Implement circuit breakers and bulkheads

---

**Next Chapter:** [Chapter 09: Observability and Monitoring](chapter-09.md)

This chapter covered the fundamental concepts of distributed systems, including the CAP theorem, consistency models, consensus algorithms, and practical implementation patterns. Understanding these concepts is crucial for designing reliable and scalable distributed architectures.