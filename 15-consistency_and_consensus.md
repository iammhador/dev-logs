# Consistency and Consensus

## Overview

Consistency and consensus are fundamental challenges in distributed systems. This chapter explores different consistency models, consensus algorithms, and their practical applications in building reliable distributed systems.

## Consistency Models

### Strong Consistency

**Linearizability:**
The strongest consistency model where operations appear to be instantaneous and atomic.

```python
# Example: Linearizable Counter
import threading
import time
from typing import Dict, List

class LinearizableCounter:
    def __init__(self):
        self._value = 0
        self._lock = threading.Lock()
        self._operations_log: List[Dict] = []
    
    def increment(self, client_id: str) -> int:
        """Atomically increment counter"""
        with self._lock:
            timestamp = time.time()
            self._value += 1
            operation = {
                'type': 'increment',
                'client_id': client_id,
                'timestamp': timestamp,
                'result': self._value
            }
            self._operations_log.append(operation)
            return self._value
    
    def get(self, client_id: str) -> int:
        """Get current value"""
        with self._lock:
            timestamp = time.time()
            operation = {
                'type': 'read',
                'client_id': client_id,
                'timestamp': timestamp,
                'result': self._value
            }
            self._operations_log.append(operation)
            return self._value
    
    def verify_linearizability(self) -> bool:
        """Verify if operations satisfy linearizability"""
        # Check if operations can be ordered consistently
        # with their timestamps and results
        for i, op in enumerate(self._operations_log):
            if op['type'] == 'increment':
                # Verify no concurrent reads see inconsistent state
                for j in range(i):
                    prev_op = self._operations_log[j]
                    if (prev_op['type'] == 'read' and 
                        prev_op['timestamp'] > op['timestamp'] and
                        prev_op['result'] >= op['result']):
                        return False
        return True

# Usage example
counter = LinearizableCounter()

def worker(client_id: str, operations: int):
    for i in range(operations):
        if i % 2 == 0:
            result = counter.increment(client_id)
            print(f"Client {client_id}: increment -> {result}")
        else:
            result = counter.get(client_id)
            print(f"Client {client_id}: read -> {result}")
        time.sleep(0.01)

# Test with multiple clients
threads = []
for i in range(3):
    t = threading.Thread(target=worker, args=(f"client_{i}", 5))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print(f"Linearizability verified: {counter.verify_linearizability()}")
```

**Sequential Consistency:**
Operations appear to execute in some sequential order, but not necessarily real-time order.

```python
# Sequential Consistency Implementation
class SequentiallyConsistentStore:
    def __init__(self):
        self._data: Dict[str, any] = {}
        self._lock = threading.Lock()
        self._sequence_number = 0
        self._operations: List[Dict] = []
    
    def write(self, key: str, value: any, client_id: str) -> None:
        """Write operation"""
        with self._lock:
            self._sequence_number += 1
            operation = {
                'seq': self._sequence_number,
                'type': 'write',
                'key': key,
                'value': value,
                'client_id': client_id,
                'timestamp': time.time()
            }
            self._operations.append(operation)
            self._data[key] = value
    
    def read(self, key: str, client_id: str) -> any:
        """Read operation"""
        with self._lock:
            self._sequence_number += 1
            value = self._data.get(key)
            operation = {
                'seq': self._sequence_number,
                'type': 'read',
                'key': key,
                'value': value,
                'client_id': client_id,
                'timestamp': time.time()
            }
            self._operations.append(operation)
            return value
    
    def get_operations_sequence(self) -> List[Dict]:
        """Get the sequential order of operations"""
        return sorted(self._operations, key=lambda x: x['seq'])
```

### Eventual Consistency

**Implementation with Vector Clocks:**

```python
# Vector Clock Implementation
class VectorClock:
    def __init__(self, node_id: str, nodes: List[str]):
        self.node_id = node_id
        self.clock = {node: 0 for node in nodes}
    
    def tick(self) -> 'VectorClock':
        """Increment local clock"""
        self.clock[self.node_id] += 1
        return self
    
    def update(self, other: 'VectorClock') -> 'VectorClock':
        """Update clock with received clock"""
        for node in self.clock:
            self.clock[node] = max(self.clock[node], other.clock[node])
        self.clock[self.node_id] += 1
        return self
    
    def compare(self, other: 'VectorClock') -> str:
        """Compare two vector clocks"""
        less_than = all(self.clock[node] <= other.clock[node] for node in self.clock)
        greater_than = all(self.clock[node] >= other.clock[node] for node in self.clock)
        
        if less_than and any(self.clock[node] < other.clock[node] for node in self.clock):
            return "before"
        elif greater_than and any(self.clock[node] > other.clock[node] for node in self.clock):
            return "after"
        elif self.clock == other.clock:
            return "equal"
        else:
            return "concurrent"
    
    def copy(self) -> 'VectorClock':
        """Create a copy of the vector clock"""
        new_clock = VectorClock(self.node_id, list(self.clock.keys()))
        new_clock.clock = self.clock.copy()
        return new_clock

class EventuallyConsistentStore:
    def __init__(self, node_id: str, nodes: List[str]):
        self.node_id = node_id
        self.nodes = nodes
        self.data: Dict[str, any] = {}
        self.vector_clock = VectorClock(node_id, nodes)
        self.version_vector: Dict[str, VectorClock] = {}
        self.pending_updates: List[Dict] = []
    
    def write(self, key: str, value: any) -> Dict:
        """Local write operation"""
        self.vector_clock.tick()
        
        update = {
            'key': key,
            'value': value,
            'clock': self.vector_clock.copy(),
            'node_id': self.node_id,
            'timestamp': time.time()
        }
        
        self.data[key] = value
        self.version_vector[key] = self.vector_clock.copy()
        
        # Propagate to other nodes
        self._propagate_update(update)
        
        return update
    
    def read(self, key: str) -> any:
        """Read operation"""
        return self.data.get(key)
    
    def receive_update(self, update: Dict) -> bool:
        """Receive update from another node"""
        key = update['key']
        incoming_clock = update['clock']
        
        # Check if we should apply this update
        if key not in self.version_vector:
            # New key, apply update
            self.data[key] = update['value']
            self.version_vector[key] = incoming_clock
            self.vector_clock.update(incoming_clock)
            return True
        
        current_clock = self.version_vector[key]
        comparison = current_clock.compare(incoming_clock)
        
        if comparison == "before":
            # Incoming update is newer, apply it
            self.data[key] = update['value']
            self.version_vector[key] = incoming_clock
            self.vector_clock.update(incoming_clock)
            return True
        elif comparison == "concurrent":
            # Conflict resolution needed
            self._resolve_conflict(key, update)
            return True
        
        # Incoming update is older or equal, ignore
        return False
    
    def _resolve_conflict(self, key: str, update: Dict):
        """Resolve conflicts using last-writer-wins"""
        current_timestamp = getattr(self.version_vector[key], 'timestamp', 0)
        incoming_timestamp = update['timestamp']
        
        if incoming_timestamp > current_timestamp:
            self.data[key] = update['value']
            self.version_vector[key] = update['clock']
        elif incoming_timestamp == current_timestamp:
            # Use node_id as tiebreaker
            if update['node_id'] > self.node_id:
                self.data[key] = update['value']
                self.version_vector[key] = update['clock']
    
    def _propagate_update(self, update: Dict):
        """Simulate propagating update to other nodes"""
        # In a real implementation, this would send the update
        # to other nodes in the cluster
        pass
    
    def get_state(self) -> Dict:
        """Get current state for debugging"""
        return {
            'node_id': self.node_id,
            'data': self.data.copy(),
            'vector_clock': self.vector_clock.clock.copy()
        }

# Example usage
nodes = ['node1', 'node2', 'node3']
store1 = EventuallyConsistentStore('node1', nodes)
store2 = EventuallyConsistentStore('node2', nodes)
store3 = EventuallyConsistentStore('node3', nodes)

# Simulate concurrent writes
update1 = store1.write('key1', 'value1_from_node1')
update2 = store2.write('key1', 'value1_from_node2')

# Simulate network propagation
store2.receive_update(update1)
store1.receive_update(update2)

print(f"Store1 state: {store1.get_state()}")
print(f"Store2 state: {store2.get_state()}")
```

## Consensus Algorithms

### Raft Consensus Algorithm

```python
# Simplified Raft Implementation
import random
import threading
import time
from enum import Enum
from typing import Dict, List, Optional

class NodeState(Enum):
    FOLLOWER = "follower"
    CANDIDATE = "candidate"
    LEADER = "leader"

class LogEntry:
    def __init__(self, term: int, command: str, index: int):
        self.term = term
        self.command = command
        self.index = index
    
    def __repr__(self):
        return f"LogEntry(term={self.term}, index={self.index}, command='{self.command}')"

class RaftNode:
    def __init__(self, node_id: str, peers: List[str]):
        self.node_id = node_id
        self.peers = peers
        self.state = NodeState.FOLLOWER
        
        # Persistent state
        self.current_term = 0
        self.voted_for: Optional[str] = None
        self.log: List[LogEntry] = []
        
        # Volatile state
        self.commit_index = 0
        self.last_applied = 0
        
        # Leader state
        self.next_index: Dict[str, int] = {}
        self.match_index: Dict[str, int] = {}
        
        # Timing
        self.election_timeout = random.uniform(150, 300)  # ms
        self.heartbeat_interval = 50  # ms
        self.last_heartbeat = time.time()
        
        # Threading
        self.running = True
        self.lock = threading.Lock()
        
        # Start background threads
        threading.Thread(target=self._election_timer, daemon=True).start()
        threading.Thread(target=self._heartbeat_timer, daemon=True).start()
    
    def _election_timer(self):
        """Background thread for election timeout"""
        while self.running:
            time.sleep(0.01)  # 10ms granularity
            
            with self.lock:
                if (self.state in [NodeState.FOLLOWER, NodeState.CANDIDATE] and
                    time.time() - self.last_heartbeat > self.election_timeout / 1000):
                    self._start_election()
    
    def _heartbeat_timer(self):
        """Background thread for sending heartbeats"""
        while self.running:
            time.sleep(self.heartbeat_interval / 1000)
            
            with self.lock:
                if self.state == NodeState.LEADER:
                    self._send_heartbeats()
    
    def _start_election(self):
        """Start a new election"""
        print(f"Node {self.node_id}: Starting election for term {self.current_term + 1}")
        
        self.state = NodeState.CANDIDATE
        self.current_term += 1
        self.voted_for = self.node_id
        self.last_heartbeat = time.time()
        
        votes_received = 1  # Vote for self
        
        # Request votes from peers
        for peer in self.peers:
            if self._request_vote(peer):
                votes_received += 1
        
        # Check if won election
        if votes_received > len(self.peers) // 2:
            self._become_leader()
        else:
            self.state = NodeState.FOLLOWER
    
    def _request_vote(self, peer: str) -> bool:
        """Request vote from a peer"""
        # Simulate network call
        # In real implementation, this would be an RPC call
        
        last_log_index = len(self.log) - 1 if self.log else -1
        last_log_term = self.log[-1].term if self.log else 0
        
        request = {
            'term': self.current_term,
            'candidate_id': self.node_id,
            'last_log_index': last_log_index,
            'last_log_term': last_log_term
        }
        
        # Simulate peer response
        return random.choice([True, False])  # Simplified
    
    def _become_leader(self):
        """Become the leader"""
        print(f"Node {self.node_id}: Became leader for term {self.current_term}")
        
        self.state = NodeState.LEADER
        
        # Initialize leader state
        for peer in self.peers:
            self.next_index[peer] = len(self.log)
            self.match_index[peer] = -1
        
        # Send initial heartbeats
        self._send_heartbeats()
    
    def _send_heartbeats(self):
        """Send heartbeats to all followers"""
        for peer in self.peers:
            self._send_append_entries(peer)
    
    def _send_append_entries(self, peer: str, entries: List[LogEntry] = None):
        """Send append entries RPC to a peer"""
        if entries is None:
            entries = []
        
        prev_log_index = self.next_index[peer] - 1
        prev_log_term = self.log[prev_log_index].term if prev_log_index >= 0 else 0
        
        request = {
            'term': self.current_term,
            'leader_id': self.node_id,
            'prev_log_index': prev_log_index,
            'prev_log_term': prev_log_term,
            'entries': entries,
            'leader_commit': self.commit_index
        }
        
        # Simulate sending request and receiving response
        success = self._simulate_append_entries_response(peer, request)
        
        if success:
            self.next_index[peer] = prev_log_index + len(entries) + 1
            self.match_index[peer] = prev_log_index + len(entries)
        else:
            # Decrement next_index and retry
            self.next_index[peer] = max(0, self.next_index[peer] - 1)
    
    def _simulate_append_entries_response(self, peer: str, request: Dict) -> bool:
        """Simulate append entries response"""
        # In real implementation, this would be handled by the peer
        return random.choice([True, False])  # Simplified
    
    def append_entry(self, command: str) -> bool:
        """Append a new entry (client request)"""
        with self.lock:
            if self.state != NodeState.LEADER:
                return False
            
            entry = LogEntry(
                term=self.current_term,
                command=command,
                index=len(self.log)
            )
            
            self.log.append(entry)
            print(f"Node {self.node_id}: Appended entry {entry}")
            
            # Replicate to followers
            self._replicate_entry(entry)
            
            return True
    
    def _replicate_entry(self, entry: LogEntry):
        """Replicate entry to followers"""
        for peer in self.peers:
            self._send_append_entries(peer, [entry])
    
    def receive_append_entries(self, request: Dict) -> Dict:
        """Handle append entries RPC"""
        with self.lock:
            # Update term if necessary
            if request['term'] > self.current_term:
                self.current_term = request['term']
                self.voted_for = None
                self.state = NodeState.FOLLOWER
            
            # Reset election timer
            self.last_heartbeat = time.time()
            
            # Check term
            if request['term'] < self.current_term:
                return {'term': self.current_term, 'success': False}
            
            # Check log consistency
            prev_log_index = request['prev_log_index']
            prev_log_term = request['prev_log_term']
            
            if (prev_log_index >= 0 and
                (prev_log_index >= len(self.log) or
                 self.log[prev_log_index].term != prev_log_term)):
                return {'term': self.current_term, 'success': False}
            
            # Append entries
            entries = request['entries']
            if entries:
                # Remove conflicting entries
                self.log = self.log[:prev_log_index + 1]
                self.log.extend(entries)
            
            # Update commit index
            if request['leader_commit'] > self.commit_index:
                self.commit_index = min(request['leader_commit'], len(self.log) - 1)
            
            return {'term': self.current_term, 'success': True}
    
    def get_state(self) -> Dict:
        """Get current node state"""
        with self.lock:
            return {
                'node_id': self.node_id,
                'state': self.state.value,
                'term': self.current_term,
                'log_length': len(self.log),
                'commit_index': self.commit_index
            }
    
    def stop(self):
        """Stop the node"""
        self.running = False

# Example usage
peers = ['node2', 'node3']
node1 = RaftNode('node1', peers)

# Simulate some operations
time.sleep(1)
node1.append_entry("SET x 1")
node1.append_entry("SET y 2")

time.sleep(2)
print(f"Node1 state: {node1.get_state()}")

node1.stop()
```

### Byzantine Fault Tolerance (PBFT)

```python
# Simplified PBFT Implementation
class PBFTMessage:
    def __init__(self, msg_type: str, view: int, sequence: int, 
                 digest: str, node_id: str, request=None):
        self.msg_type = msg_type  # 'request', 'pre-prepare', 'prepare', 'commit'
        self.view = view
        self.sequence = sequence
        self.digest = digest
        self.node_id = node_id
        self.request = request
        self.timestamp = time.time()
    
    def __hash__(self):
        return hash((self.msg_type, self.view, self.sequence, self.digest, self.node_id))
    
    def __eq__(self, other):
        return (self.msg_type == other.msg_type and
                self.view == other.view and
                self.sequence == other.sequence and
                self.digest == other.digest)

class PBFTNode:
    def __init__(self, node_id: str, total_nodes: int):
        self.node_id = node_id
        self.total_nodes = total_nodes
        self.f = (total_nodes - 1) // 3  # Maximum Byzantine failures
        
        self.view = 0
        self.sequence = 0
        self.primary_id = self._get_primary(self.view)
        
        # Message logs
        self.message_log: List[PBFTMessage] = []
        self.prepare_log: Dict[str, List[PBFTMessage]] = {}
        self.commit_log: Dict[str, List[PBFTMessage]] = {}
        
        # State
        self.executed_requests: set = set()
        self.lock = threading.Lock()
    
    def _get_primary(self, view: int) -> str:
        """Get primary node for a view"""
        return f"node{view % self.total_nodes}"
    
    def _compute_digest(self, request: str) -> str:
        """Compute digest of a request"""
        import hashlib
        return hashlib.sha256(request.encode()).hexdigest()[:16]
    
    def client_request(self, request: str) -> bool:
        """Handle client request (only primary)"""
        with self.lock:
            if self.node_id != self.primary_id:
                return False
            
            digest = self._compute_digest(request)
            
            # Create pre-prepare message
            pre_prepare = PBFTMessage(
                msg_type='pre-prepare',
                view=self.view,
                sequence=self.sequence,
                digest=digest,
                node_id=self.node_id,
                request=request
            )
            
            self.message_log.append(pre_prepare)
            self.sequence += 1
            
            print(f"Primary {self.node_id}: Sent pre-prepare for request '{request}'")
            
            # Broadcast to backups
            self._broadcast_pre_prepare(pre_prepare)
            
            return True
    
    def _broadcast_pre_prepare(self, pre_prepare: PBFTMessage):
        """Broadcast pre-prepare to backup nodes"""
        # In real implementation, this would send to other nodes
        pass
    
    def receive_pre_prepare(self, pre_prepare: PBFTMessage) -> bool:
        """Handle pre-prepare message"""
        with self.lock:
            # Validate pre-prepare
            if (pre_prepare.view != self.view or
                pre_prepare.node_id != self.primary_id or
                self._is_duplicate_sequence(pre_prepare.sequence)):
                return False
            
            # Verify digest
            expected_digest = self._compute_digest(pre_prepare.request)
            if pre_prepare.digest != expected_digest:
                return False
            
            self.message_log.append(pre_prepare)
            
            # Send prepare message
            prepare = PBFTMessage(
                msg_type='prepare',
                view=self.view,
                sequence=pre_prepare.sequence,
                digest=pre_prepare.digest,
                node_id=self.node_id
            )
            
            self._add_prepare(prepare)
            self._broadcast_prepare(prepare)
            
            print(f"Node {self.node_id}: Sent prepare for sequence {pre_prepare.sequence}")
            
            return True
    
    def _is_duplicate_sequence(self, sequence: int) -> bool:
        """Check if sequence number is duplicate"""
        for msg in self.message_log:
            if msg.msg_type == 'pre-prepare' and msg.sequence == sequence:
                return True
        return False
    
    def _add_prepare(self, prepare: PBFTMessage):
        """Add prepare message to log"""
        key = f"{prepare.view}-{prepare.sequence}-{prepare.digest}"
        if key not in self.prepare_log:
            self.prepare_log[key] = []
        self.prepare_log[key].append(prepare)
    
    def _broadcast_prepare(self, prepare: PBFTMessage):
        """Broadcast prepare message"""
        # In real implementation, this would send to other nodes
        pass
    
    def receive_prepare(self, prepare: PBFTMessage) -> bool:
        """Handle prepare message"""
        with self.lock:
            if prepare.view != self.view:
                return False
            
            self._add_prepare(prepare)
            
            # Check if we have enough prepare messages
            key = f"{prepare.view}-{prepare.sequence}-{prepare.digest}"
            prepare_count = len(self.prepare_log.get(key, []))
            
            if prepare_count >= 2 * self.f:  # Including our own prepare
                # Send commit message
                commit = PBFTMessage(
                    msg_type='commit',
                    view=self.view,
                    sequence=prepare.sequence,
                    digest=prepare.digest,
                    node_id=self.node_id
                )
                
                self._add_commit(commit)
                self._broadcast_commit(commit)
                
                print(f"Node {self.node_id}: Sent commit for sequence {prepare.sequence}")
            
            return True
    
    def _add_commit(self, commit: PBFTMessage):
        """Add commit message to log"""
        key = f"{commit.view}-{commit.sequence}-{commit.digest}"
        if key not in self.commit_log:
            self.commit_log[key] = []
        self.commit_log[key].append(commit)
    
    def _broadcast_commit(self, commit: PBFTMessage):
        """Broadcast commit message"""
        # In real implementation, this would send to other nodes
        pass
    
    def receive_commit(self, commit: PBFTMessage) -> bool:
        """Handle commit message"""
        with self.lock:
            if commit.view != self.view:
                return False
            
            self._add_commit(commit)
            
            # Check if we have enough commit messages
            key = f"{commit.view}-{commit.sequence}-{commit.digest}"
            commit_count = len(self.commit_log.get(key, []))
            
            if commit_count >= 2 * self.f + 1:  # Including our own commit
                # Execute the request
                request = self._get_request_for_sequence(commit.sequence)
                if request and commit.digest not in self.executed_requests:
                    self._execute_request(request, commit.digest)
                    self.executed_requests.add(commit.digest)
                    
                    print(f"Node {self.node_id}: Executed request for sequence {commit.sequence}")
            
            return True
    
    def _get_request_for_sequence(self, sequence: int) -> Optional[str]:
        """Get request for a given sequence number"""
        for msg in self.message_log:
            if (msg.msg_type == 'pre-prepare' and 
                msg.sequence == sequence):
                return msg.request
        return None
    
    def _execute_request(self, request: str, digest: str):
        """Execute the request"""
        # In real implementation, this would apply the state change
        print(f"Node {self.node_id}: Executing request '{request}' with digest {digest}")
    
    def get_state(self) -> Dict:
        """Get current node state"""
        with self.lock:
            return {
                'node_id': self.node_id,
                'view': self.view,
                'sequence': self.sequence,
                'primary': self.primary_id,
                'executed_count': len(self.executed_requests)
            }

# Example usage
pbft_node = PBFTNode('node0', 4)  # 4 nodes, can tolerate 1 Byzantine failure

# Simulate client request
pbft_node.client_request("SET x 100")

print(f"PBFT Node state: {pbft_node.get_state()}")
```

## CAP Theorem and Trade-offs

### CAP Theorem Implementation Examples

```python
# CAP Theorem Demonstration
class CAPSystem:
    """Demonstrates CAP theorem trade-offs"""
    
    def __init__(self, system_type: str):
        self.system_type = system_type
        self.nodes = {}
        self.network_partition = False
    
    def create_partition(self):
        """Simulate network partition"""
        self.network_partition = True
        print(f"Network partition created in {self.system_type} system")
    
    def heal_partition(self):
        """Heal network partition"""
        self.network_partition = False
        print(f"Network partition healed in {self.system_type} system")

class CPSystem(CAPSystem):
    """Consistency + Partition Tolerance (Sacrifice Availability)"""
    
    def __init__(self):
        super().__init__("CP")
        self.data = {}
        self.available = True
    
    def write(self, key: str, value: any) -> bool:
        if self.network_partition:
            # Sacrifice availability to maintain consistency
            self.available = False
            print(f"CP System: Write rejected due to partition (maintaining consistency)")
            return False
        
        self.data[key] = value
        print(f"CP System: Write successful - {key}: {value}")
        return True
    
    def read(self, key: str) -> Optional[any]:
        if self.network_partition:
            # Sacrifice availability to maintain consistency
            print(f"CP System: Read rejected due to partition (maintaining consistency)")
            return None
        
        value = self.data.get(key)
        print(f"CP System: Read - {key}: {value}")
        return value

class APSystem(CAPSystem):
    """Availability + Partition Tolerance (Sacrifice Consistency)"""
    
    def __init__(self):
        super().__init__("AP")
        self.node1_data = {}
        self.node2_data = {}
    
    def write(self, key: str, value: any, node: int = 1) -> bool:
        if node == 1:
            self.node1_data[key] = value
            print(f"AP System: Write to node1 - {key}: {value}")
        else:
            self.node2_data[key] = value
            print(f"AP System: Write to node2 - {key}: {value}")
        
        if not self.network_partition:
            # Replicate to other node when no partition
            if node == 1:
                self.node2_data[key] = value
            else:
                self.node1_data[key] = value
        
        return True
    
    def read(self, key: str, node: int = 1) -> Optional[any]:
        if node == 1:
            value = self.node1_data.get(key)
            print(f"AP System: Read from node1 - {key}: {value}")
        else:
            value = self.node2_data.get(key)
            print(f"AP System: Read from node2 - {key}: {value}")
        
        return value
    
    def check_consistency(self, key: str) -> bool:
        """Check if data is consistent across nodes"""
        value1 = self.node1_data.get(key)
        value2 = self.node2_data.get(key)
        consistent = value1 == value2
        print(f"AP System: Consistency check for {key} - Node1: {value1}, Node2: {value2}, Consistent: {consistent}")
        return consistent

class CASystem(CAPSystem):
    """Consistency + Availability (Sacrifice Partition Tolerance)"""
    
    def __init__(self):
        super().__init__("CA")
        self.data = {}
    
    def write(self, key: str, value: any) -> bool:
        if self.network_partition:
            print(f"CA System: System unavailable due to partition")
            return False
        
        # Synchronous replication to maintain consistency
        self.data[key] = value
        print(f"CA System: Write successful with synchronous replication - {key}: {value}")
        return True
    
    def read(self, key: str) -> Optional[any]:
        if self.network_partition:
            print(f"CA System: System unavailable due to partition")
            return None
        
        value = self.data.get(key)
        print(f"CA System: Read - {key}: {value}")
        return value

# Demonstrate CAP theorem trade-offs
def demonstrate_cap_theorem():
    print("=== CAP Theorem Demonstration ===")
    
    # CP System (like HBase, MongoDB with strong consistency)
    print("\n--- CP System (Consistency + Partition Tolerance) ---")
    cp_system = CPSystem()
    cp_system.write("user1", "Alice")
    cp_system.read("user1")
    
    cp_system.create_partition()
    cp_system.write("user2", "Bob")  # Should fail
    cp_system.read("user1")  # Should fail
    
    cp_system.heal_partition()
    cp_system.write("user2", "Bob")  # Should succeed
    
    # AP System (like Cassandra, DynamoDB)
    print("\n--- AP System (Availability + Partition Tolerance) ---")
    ap_system = APSystem()
    ap_system.write("user1", "Alice")
    ap_system.check_consistency("user1")
    
    ap_system.create_partition()
    ap_system.write("user1", "Alice_Updated", node=1)
    ap_system.write("user1", "Alice_Different", node=2)
    ap_system.check_consistency("user1")  # Should be inconsistent
    
    ap_system.heal_partition()
    # In real systems, conflict resolution would happen here
    
    # CA System (like traditional RDBMS in single data center)
    print("\n--- CA System (Consistency + Availability) ---")
    ca_system = CASystem()
    ca_system.write("user1", "Alice")
    ca_system.read("user1")
    
    ca_system.create_partition()
    ca_system.write("user2", "Bob")  # Should fail
    ca_system.read("user1")  # Should fail
    
    ca_system.heal_partition()
    ca_system.write("user2", "Bob")  # Should succeed

demonstrate_cap_theorem()
```

## Practical Applications

### Database Consistency Levels

```python
# Database Consistency Level Implementation
class ConsistencyLevel(Enum):
    ONE = "one"
    QUORUM = "quorum"
    ALL = "all"
    LOCAL_QUORUM = "local_quorum"
    EACH_QUORUM = "each_quorum"

class DistributedDatabase:
    def __init__(self, nodes: List[str], replication_factor: int = 3):
        self.nodes = nodes
        self.replication_factor = replication_factor
        self.data: Dict[str, Dict[str, any]] = {node: {} for node in nodes}
        self.node_status: Dict[str, bool] = {node: True for node in nodes}
    
    def _get_replica_nodes(self, key: str) -> List[str]:
        """Get replica nodes for a key using consistent hashing"""
        import hashlib
        hash_value = int(hashlib.md5(key.encode()).hexdigest(), 16)
        start_index = hash_value % len(self.nodes)
        
        replicas = []
        for i in range(self.replication_factor):
            node_index = (start_index + i) % len(self.nodes)
            replicas.append(self.nodes[node_index])
        
        return replicas
    
    def _get_available_replicas(self, key: str) -> List[str]:
        """Get available replica nodes for a key"""
        replicas = self._get_replica_nodes(key)
        return [node for node in replicas if self.node_status[node]]
    
    def write(self, key: str, value: any, 
             consistency_level: ConsistencyLevel = ConsistencyLevel.QUORUM) -> bool:
        """Write with specified consistency level"""
        available_replicas = self._get_available_replicas(key)
        
        if not available_replicas:
            print(f"Write failed: No available replicas for key {key}")
            return False
        
        required_acks = self._get_required_acknowledgments(
            len(available_replicas), consistency_level, 'write'
        )
        
        if len(available_replicas) < required_acks:
            print(f"Write failed: Not enough replicas available. "
                  f"Required: {required_acks}, Available: {len(available_replicas)}")
            return False
        
        # Write to replicas
        successful_writes = 0
        for node in available_replicas:
            if self._write_to_node(node, key, value):
                successful_writes += 1
                if successful_writes >= required_acks:
                    break
        
        success = successful_writes >= required_acks
        print(f"Write {'succeeded' if success else 'failed'}: {key}={value} "
              f"(acks: {successful_writes}/{required_acks})")
        
        return success
    
    def read(self, key: str, 
            consistency_level: ConsistencyLevel = ConsistencyLevel.QUORUM) -> Optional[any]:
        """Read with specified consistency level"""
        available_replicas = self._get_available_replicas(key)
        
        if not available_replicas:
            print(f"Read failed: No available replicas for key {key}")
            return None
        
        required_responses = self._get_required_acknowledgments(
            len(available_replicas), consistency_level, 'read'
        )
        
        if len(available_replicas) < required_responses:
            print(f"Read failed: Not enough replicas available. "
                  f"Required: {required_responses}, Available: {len(available_replicas)}")
            return None
        
        # Read from replicas
        responses = []
        for node in available_replicas[:required_responses]:
            value = self._read_from_node(node, key)
            if value is not None:
                responses.append(value)
        
        if len(responses) < required_responses:
            print(f"Read failed: Not enough successful responses")
            return None
        
        # Resolve conflicts (simple majority wins)
        final_value = self._resolve_read_conflicts(responses)
        print(f"Read succeeded: {key}={final_value} "
              f"(responses: {len(responses)}/{required_responses})")
        
        return final_value
    
    def _get_required_acknowledgments(self, available_count: int, 
                                    consistency_level: ConsistencyLevel, 
                                    operation: str) -> int:
        """Calculate required acknowledgments based on consistency level"""
        if consistency_level == ConsistencyLevel.ONE:
            return 1
        elif consistency_level == ConsistencyLevel.ALL:
            return available_count
        elif consistency_level == ConsistencyLevel.QUORUM:
            return (self.replication_factor // 2) + 1
        else:
            return 1  # Default
    
    def _write_to_node(self, node: str, key: str, value: any) -> bool:
        """Write to a specific node"""
        if not self.node_status[node]:
            return False
        
        self.data[node][key] = {
            'value': value,
            'timestamp': time.time(),
            'version': self._get_next_version(node, key)
        }
        return True
    
    def _read_from_node(self, node: str, key: str) -> Optional[any]:
        """Read from a specific node"""
        if not self.node_status[node]:
            return None
        
        data = self.data[node].get(key)
        return data['value'] if data else None
    
    def _get_next_version(self, node: str, key: str) -> int:
        """Get next version number for a key on a node"""
        current_data = self.data[node].get(key)
        return (current_data['version'] + 1) if current_data else 1
    
    def _resolve_read_conflicts(self, responses: List[any]) -> any:
        """Resolve conflicts in read responses"""
        # Simple majority wins
        from collections import Counter
        counter = Counter(responses)
        return counter.most_common(1)[0][0]
    
    def simulate_node_failure(self, node: str):
        """Simulate node failure"""
        self.node_status[node] = False
        print(f"Node {node} failed")
    
    def simulate_node_recovery(self, node: str):
        """Simulate node recovery"""
        self.node_status[node] = True
        print(f"Node {node} recovered")
    
    def get_cluster_status(self) -> Dict:
        """Get cluster status"""
        available_nodes = sum(1 for status in self.node_status.values() if status)
        return {
            'total_nodes': len(self.nodes),
            'available_nodes': available_nodes,
            'replication_factor': self.replication_factor,
            'node_status': self.node_status.copy()
        }

# Example usage
nodes = ['node1', 'node2', 'node3', 'node4', 'node5']
db = DistributedDatabase(nodes, replication_factor=3)

print("=== Consistency Level Examples ===")

# Write with different consistency levels
print("\n--- Writing with QUORUM consistency ---")
db.write("user:1", "Alice", ConsistencyLevel.QUORUM)

print("\n--- Reading with QUORUM consistency ---")
value = db.read("user:1", ConsistencyLevel.QUORUM)

# Simulate node failures
print("\n--- Simulating node failures ---")
db.simulate_node_failure('node1')
db.simulate_node_failure('node2')

print("\n--- Writing with ONE consistency (should succeed) ---")
db.write("user:2", "Bob", ConsistencyLevel.ONE)

print("\n--- Writing with ALL consistency (should fail) ---")
db.write("user:3", "Charlie", ConsistencyLevel.ALL)

print(f"\nCluster status: {db.get_cluster_status()}")
```

## Best Practices

### Consistency Pattern Selection

1. **Strong Consistency**: Use for financial transactions, inventory management
2. **Eventual Consistency**: Use for social media feeds, recommendation systems
3. **Session Consistency**: Use for user preferences, shopping carts
4. **Monotonic Read Consistency**: Use for audit logs, time-series data

### Consensus Algorithm Selection

1. **Raft**: Simple, easy to understand, good for small clusters
2. **PBFT**: Byzantine fault tolerance, use when nodes might be malicious
3. **Paxos**: Proven correctness, complex implementation
4. **PBFT**: High throughput, suitable for permissioned networks

### Common Pitfalls

1. **Split-brain scenarios**: Always use odd number of nodes
2. **Clock synchronization**: Use logical clocks for ordering
3. **Network partitions**: Design for partition tolerance
4. **Cascading failures**: Implement circuit breakers

---

**Next Topic**: [Testing Strategies](testing_strategies.md)
**Previous Topic**: [Deployment Strategies](deployment_strategies.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)