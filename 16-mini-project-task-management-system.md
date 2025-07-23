# Mini-Project: Task Management System with Advanced Data Structures

## 🎯 Project Overview

This comprehensive mini-project combines multiple data structures and algorithms concepts learned throughout the course. You'll build a **Task Management System** that demonstrates practical applications of arrays, linked lists, stacks, queues, hash tables, trees, graphs, sorting, searching, dynamic programming, backtracking, and greedy algorithms.

### Learning Objectives:
- **Integration**: Combine multiple DSA concepts in a real-world application
- **Problem-solving**: Apply algorithmic thinking to practical problems
- **Optimization**: Use appropriate data structures for different operations
- **Scalability**: Design systems that can handle growing data
- **Performance**: Analyze and optimize time/space complexity

### Project Features:
1. **Task Management**: Create, update, delete, and organize tasks
2. **Priority Scheduling**: Implement priority-based task scheduling
3. **Dependency Management**: Handle task dependencies using graphs
4. **Search & Filter**: Efficient searching and filtering capabilities
5. **Analytics**: Generate insights using various algorithms
6. **Optimization**: Resource allocation and scheduling optimization

---

## 🏗️ System Architecture

### Core Components:

```
TaskManagementSystem
├── TaskManager (Hash Table + Linked List)
├── PriorityScheduler (Heap + Queue)
├── DependencyGraph (Graph + Topological Sort)
├── SearchEngine (Trie + Binary Search)
├── Analytics (Dynamic Programming)
└── Optimizer (Greedy Algorithms)
```

### Data Structures Used:
- **Hash Table**: Fast task lookup and storage
- **Linked List**: Task history and undo operations
- **Stack**: Undo/Redo functionality
- **Queue**: Task processing pipeline
- **Heap**: Priority-based scheduling
- **Tree**: Hierarchical task organization
- **Graph**: Task dependencies
- **Trie**: Efficient text search

---

## 💻 Implementation

### JavaScript Implementation

```javascript
// Task Management System - Comprehensive Implementation

// ===== CORE DATA STRUCTURES =====

/**
 * Task Entity
 */
class Task {
    constructor(id, title, description, priority = 1, estimatedTime = 1, tags = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority; // 1-5 (5 = highest)
        this.estimatedTime = estimatedTime; // in hours
        this.actualTime = 0;
        this.status = 'pending'; // pending, in-progress, completed, cancelled
        this.tags = new Set(tags);
        this.dependencies = new Set();
        this.dependents = new Set();
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.completedAt = null;
        this.assignee = null;
        this.deadline = null;
    }
    
    addDependency(taskId) {
        this.dependencies.add(taskId);
    }
    
    addDependent(taskId) {
        this.dependents.add(taskId);
    }
    
    updateStatus(status) {
        this.status = status;
        this.updatedAt = new Date();
        if (status === 'completed') {
            this.completedAt = new Date();
        }
    }
    
    addTag(tag) {
        this.tags.add(tag);
    }
    
    removeTag(tag) {
        this.tags.delete(tag);
    }
    
    isBlocked() {
        return this.dependencies.size > 0;
    }
    
    getEfficiency() {
        if (this.actualTime === 0) return 1;
        return this.estimatedTime / this.actualTime;
    }
}

/**
 * Custom Hash Table for Task Storage
 */
class TaskHashTable {
    constructor(initialSize = 16) {
        this.size = initialSize;
        this.count = 0;
        this.buckets = new Array(this.size).fill(null).map(() => []);
    }
    
    hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash * 31 + key.charCodeAt(i)) % this.size;
        }
        return hash;
    }
    
    put(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        // Check if key already exists
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket[i][1] = value;
                return;
            }
        }
        
        // Add new key-value pair
        bucket.push([key, value]);
        this.count++;
        
        // Resize if load factor > 0.75
        if (this.count > this.size * 0.75) {
            this.resize();
        }
    }
    
    get(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        for (let [k, v] of bucket) {
            if (k === key) return v;
        }
        
        return null;
    }
    
    delete(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket.splice(i, 1);
                this.count--;
                return true;
            }
        }
        
        return false;
    }
    
    resize() {
        const oldBuckets = this.buckets;
        this.size *= 2;
        this.count = 0;
        this.buckets = new Array(this.size).fill(null).map(() => []);
        
        for (let bucket of oldBuckets) {
            for (let [key, value] of bucket) {
                this.put(key, value);
            }
        }
    }
    
    getAllValues() {
        const values = [];
        for (let bucket of this.buckets) {
            for (let [key, value] of bucket) {
                values.push(value);
            }
        }
        return values;
    }
}

/**
 * Priority Queue using Min/Max Heap
 */
class PriorityQueue {
    constructor(compareFn = (a, b) => a.priority - b.priority) {
        this.heap = [];
        this.compare = compareFn;
    }
    
    enqueue(item) {
        this.heap.push(item);
        this.heapifyUp(this.heap.length - 1);
    }
    
    dequeue() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return root;
    }
    
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
    
    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
            
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }
    
    heapifyDown(index) {
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < this.heap.length && 
                this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }
            
            if (rightChild < this.heap.length && 
                this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }
            
            if (smallest === index) break;
            
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }
    
    size() {
        return this.heap.length;
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
}

/**
 * Trie for Efficient Text Search
 */
class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
        this.taskIds = new Set();
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }
    
    insert(word, taskId) {
        let node = this.root;
        
        for (let char of word.toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
            node.taskIds.add(taskId);
        }
        
        node.isEndOfWord = true;
    }
    
    search(prefix) {
        let node = this.root;
        
        for (let char of prefix.toLowerCase()) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        
        return Array.from(node.taskIds);
    }
    
    delete(word, taskId) {
        this.deleteHelper(this.root, word.toLowerCase(), 0, taskId);
    }
    
    deleteHelper(node, word, index, taskId) {
        if (index === word.length) {
            node.isEndOfWord = false;
            node.taskIds.delete(taskId);
            return node.taskIds.size === 0 && Object.keys(node.children).length === 0;
        }
        
        const char = word[index];
        const childNode = node.children[char];
        
        if (!childNode) return false;
        
        const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1, taskId);
        
        if (shouldDeleteChild) {
            delete node.children[char];
        }
        
        childNode.taskIds.delete(taskId);
        
        return node.taskIds.size === 0 && 
               Object.keys(node.children).length === 0 && 
               !node.isEndOfWord;
    }
}

/**
 * Dependency Graph for Task Dependencies
 */
class DependencyGraph {
    constructor() {
        this.adjacencyList = new Map();
        this.inDegree = new Map();
    }
    
    addTask(taskId) {
        if (!this.adjacencyList.has(taskId)) {
            this.adjacencyList.set(taskId, []);
            this.inDegree.set(taskId, 0);
        }
    }
    
    addDependency(fromTask, toTask) {
        this.addTask(fromTask);
        this.addTask(toTask);
        
        this.adjacencyList.get(fromTask).push(toTask);
        this.inDegree.set(toTask, this.inDegree.get(toTask) + 1);
    }
    
    removeDependency(fromTask, toTask) {
        if (this.adjacencyList.has(fromTask)) {
            const neighbors = this.adjacencyList.get(fromTask);
            const index = neighbors.indexOf(toTask);
            if (index > -1) {
                neighbors.splice(index, 1);
                this.inDegree.set(toTask, this.inDegree.get(toTask) - 1);
            }
        }
    }
    
    getTopologicalOrder() {
        const result = [];
        const queue = [];
        const inDegreeMap = new Map(this.inDegree);
        
        // Find all tasks with no dependencies
        for (let [taskId, degree] of inDegreeMap) {
            if (degree === 0) {
                queue.push(taskId);
            }
        }
        
        while (queue.length > 0) {
            const current = queue.shift();
            result.push(current);
            
            // Process all dependent tasks
            for (let neighbor of this.adjacencyList.get(current) || []) {
                inDegreeMap.set(neighbor, inDegreeMap.get(neighbor) - 1);
                if (inDegreeMap.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }
        
        // Check for cycles
        if (result.length !== this.adjacencyList.size) {
            throw new Error('Circular dependency detected!');
        }
        
        return result;
    }
    
    hasCycle() {
        try {
            this.getTopologicalOrder();
            return false;
        } catch (error) {
            return true;
        }
    }
    
    getReadyTasks() {
        const readyTasks = [];
        for (let [taskId, degree] of this.inDegree) {
            if (degree === 0) {
                readyTasks.push(taskId);
            }
        }
        return readyTasks;
    }
}

/**
 * Undo/Redo Stack
 */
class UndoRedoStack {
    constructor(maxSize = 50) {
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = maxSize;
    }
    
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo stack
        
        // Limit stack size
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
    }
    
    undo() {
        if (this.undoStack.length === 0) return false;
        
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
        return true;
    }
    
    redo() {
        if (this.redoStack.length === 0) return false;
        
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
        return true;
    }
    
    canUndo() {
        return this.undoStack.length > 0;
    }
    
    canRedo() {
        return this.redoStack.length > 0;
    }
}

// ===== COMMAND PATTERN FOR UNDO/REDO =====

class Command {
    execute() {
        throw new Error('Execute method must be implemented');
    }
    
    undo() {
        throw new Error('Undo method must be implemented');
    }
}

class CreateTaskCommand extends Command {
    constructor(taskManager, task) {
        super();
        this.taskManager = taskManager;
        this.task = task;
    }
    
    execute() {
        this.taskManager.addTaskDirect(this.task);
    }
    
    undo() {
        this.taskManager.deleteTaskDirect(this.task.id);
    }
}

class UpdateTaskCommand extends Command {
    constructor(taskManager, taskId, oldData, newData) {
        super();
        this.taskManager = taskManager;
        this.taskId = taskId;
        this.oldData = oldData;
        this.newData = newData;
    }
    
    execute() {
        this.taskManager.updateTaskDirect(this.taskId, this.newData);
    }
    
    undo() {
        this.taskManager.updateTaskDirect(this.taskId, this.oldData);
    }
}

class DeleteTaskCommand extends Command {
    constructor(taskManager, task) {
        super();
        this.taskManager = taskManager;
        this.task = task;
    }
    
    execute() {
        this.taskManager.deleteTaskDirect(this.task.id);
    }
    
    undo() {
        this.taskManager.addTaskDirect(this.task);
    }
}

// ===== MAIN TASK MANAGEMENT SYSTEM =====

class TaskManagementSystem {
    constructor() {
        this.tasks = new TaskHashTable();
        this.priorityQueue = new PriorityQueue((a, b) => b.priority - a.priority);
        this.searchTrie = new Trie();
        this.dependencyGraph = new DependencyGraph();
        this.undoRedoStack = new UndoRedoStack();
        this.taskIdCounter = 1;
        this.analytics = new TaskAnalytics();
    }
    
    // ===== TASK CRUD OPERATIONS =====
    
    createTask(title, description, priority = 1, estimatedTime = 1, tags = []) {
        const taskId = `task_${this.taskIdCounter++}`;
        const task = new Task(taskId, title, description, priority, estimatedTime, tags);
        
        const command = new CreateTaskCommand(this, task);
        this.undoRedoStack.execute(command);
        
        return task;
    }
    
    addTaskDirect(task) {
        this.tasks.put(task.id, task);
        this.priorityQueue.enqueue(task);
        this.dependencyGraph.addTask(task.id);
        
        // Index for search
        this.indexTaskForSearch(task);
        
        // Update analytics
        this.analytics.addTask(task);
    }
    
    updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        
        const oldData = { ...task };
        const command = new UpdateTaskCommand(this, taskId, oldData, updates);
        this.undoRedoStack.execute(command);
        
        return task;
    }
    
    updateTaskDirect(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        // Remove old search indices
        this.removeTaskFromSearch(task);
        
        // Update task properties
        Object.assign(task, updates);
        task.updatedAt = new Date();
        
        // Re-index for search
        this.indexTaskForSearch(task);
        
        // Update analytics
        this.analytics.updateTask(task);
    }
    
    deleteTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) throw new Error(`Task ${taskId} not found`);
        
        const command = new DeleteTaskCommand(this, task);
        this.undoRedoStack.execute(command);
        
        return true;
    }
    
    deleteTaskDirect(taskId) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        
        this.tasks.delete(taskId);
        this.removeTaskFromSearch(task);
        
        // Remove from dependency graph
        this.dependencyGraph.adjacencyList.delete(taskId);
        this.dependencyGraph.inDegree.delete(taskId);
        
        // Update analytics
        this.analytics.removeTask(task);
    }
    
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    
    getAllTasks() {
        return this.tasks.getAllValues();
    }
    
    // ===== SEARCH AND FILTERING =====
    
    indexTaskForSearch(task) {
        // Index title and description words
        const words = [...task.title.split(/\s+/), ...task.description.split(/\s+/)];
        for (let word of words) {
            if (word.length > 2) {
                this.searchTrie.insert(word, task.id);
            }
        }
        
        // Index tags
        for (let tag of task.tags) {
            this.searchTrie.insert(tag, task.id);
        }
    }
    
    removeTaskFromSearch(task) {
        const words = [...task.title.split(/\s+/), ...task.description.split(/\s+/)];
        for (let word of words) {
            if (word.length > 2) {
                this.searchTrie.delete(word, task.id);
            }
        }
        
        for (let tag of task.tags) {
            this.searchTrie.delete(tag, task.id);
        }
    }
    
    searchTasks(query) {
        const taskIds = this.searchTrie.search(query);
        return taskIds.map(id => this.tasks.get(id)).filter(task => task !== null);
    }
    
    filterTasks(criteria) {
        const allTasks = this.getAllTasks();
        
        return allTasks.filter(task => {
            if (criteria.status && task.status !== criteria.status) return false;
            if (criteria.priority && task.priority !== criteria.priority) return false;
            if (criteria.assignee && task.assignee !== criteria.assignee) return false;
            if (criteria.tag && !task.tags.has(criteria.tag)) return false;
            if (criteria.minPriority && task.priority < criteria.minPriority) return false;
            if (criteria.maxPriority && task.priority > criteria.maxPriority) return false;
            
            return true;
        });
    }
    
    // ===== DEPENDENCY MANAGEMENT =====
    
    addDependency(fromTaskId, toTaskId) {
        const fromTask = this.tasks.get(fromTaskId);
        const toTask = this.tasks.get(toTaskId);
        
        if (!fromTask || !toTask) {
            throw new Error('One or both tasks not found');
        }
        
        this.dependencyGraph.addDependency(fromTaskId, toTaskId);
        
        // Check for cycles
        if (this.dependencyGraph.hasCycle()) {
            this.dependencyGraph.removeDependency(fromTaskId, toTaskId);
            throw new Error('Adding this dependency would create a cycle');
        }
        
        fromTask.addDependent(toTaskId);
        toTask.addDependency(fromTaskId);
    }
    
    removeDependency(fromTaskId, toTaskId) {
        this.dependencyGraph.removeDependency(fromTaskId, toTaskId);
        
        const fromTask = this.tasks.get(fromTaskId);
        const toTask = this.tasks.get(toTaskId);
        
        if (fromTask) fromTask.dependents.delete(toTaskId);
        if (toTask) toTask.dependencies.delete(fromTaskId);
    }
    
    getTaskExecutionOrder() {
        return this.dependencyGraph.getTopologicalOrder();
    }
    
    getReadyTasks() {
        const readyTaskIds = this.dependencyGraph.getReadyTasks();
        return readyTaskIds.map(id => this.tasks.get(id)).filter(task => 
            task && task.status === 'pending'
        );
    }
    
    // ===== SCHEDULING AND OPTIMIZATION =====
    
    getNextTaskByPriority() {
        const readyTasks = this.getReadyTasks();
        if (readyTasks.length === 0) return null;
        
        // Sort by priority (descending) then by creation time (ascending)
        readyTasks.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority;
            }
            return a.createdAt - b.createdAt;
        });
        
        return readyTasks[0];
    }
    
    scheduleTasksGreedy(availableHours) {
        const readyTasks = this.getReadyTasks();
        
        // Sort by value-to-time ratio (priority / estimated time)
        readyTasks.sort((a, b) => {
            const ratioA = a.priority / a.estimatedTime;
            const ratioB = b.priority / b.estimatedTime;
            return ratioB - ratioA;
        });
        
        const schedule = [];
        let remainingHours = availableHours;
        
        for (let task of readyTasks) {
            if (task.estimatedTime <= remainingHours) {
                schedule.push(task);
                remainingHours -= task.estimatedTime;
            }
        }
        
        return {
            schedule,
            totalTime: availableHours - remainingHours,
            remainingTime: remainingHours
        };
    }
    
    optimizeTaskOrder() {
        // Use dynamic programming to find optimal task completion order
        const tasks = this.getAllTasks().filter(task => task.status === 'pending');
        const n = tasks.length;
        
        if (n === 0) return [];
        
        // DP state: dp[mask] = minimum time to complete tasks in mask
        const dp = new Array(1 << n).fill(Infinity);
        const parent = new Array(1 << n).fill(-1);
        dp[0] = 0;
        
        for (let mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] === Infinity) continue;
            
            for (let i = 0; i < n; i++) {
                if (mask & (1 << i)) continue; // Task already completed
                
                // Check if dependencies are satisfied
                let canExecute = true;
                for (let j = 0; j < n; j++) {
                    if (tasks[i].dependencies.has(tasks[j].id) && !(mask & (1 << j))) {
                        canExecute = false;
                        break;
                    }
                }
                
                if (canExecute) {
                    const newMask = mask | (1 << i);
                    const newTime = dp[mask] + tasks[i].estimatedTime;
                    
                    if (newTime < dp[newMask]) {
                        dp[newMask] = newTime;
                        parent[newMask] = mask;
                    }
                }
            }
        }
        
        // Reconstruct optimal order
        const order = [];
        let currentMask = (1 << n) - 1;
        
        while (currentMask > 0) {
            const prevMask = parent[currentMask];
            const taskIndex = Math.log2(currentMask ^ prevMask);
            order.unshift(tasks[taskIndex]);
            currentMask = prevMask;
        }
        
        return order;
    }
    
    // ===== UNDO/REDO OPERATIONS =====
    
    undo() {
        return this.undoRedoStack.undo();
    }
    
    redo() {
        return this.undoRedoStack.redo();
    }
    
    canUndo() {
        return this.undoRedoStack.canUndo();
    }
    
    canRedo() {
        return this.undoRedoStack.canRedo();
    }
    
    // ===== ANALYTICS AND REPORTING =====
    
    getAnalytics() {
        return this.analytics.generateReport();
    }
    
    getTaskStatistics() {
        const tasks = this.getAllTasks();
        const stats = {
            total: tasks.length,
            pending: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
            averagePriority: 0,
            totalEstimatedTime: 0,
            totalActualTime: 0
        };
        
        let prioritySum = 0;
        
        for (let task of tasks) {
            stats[task.status]++;
            prioritySum += task.priority;
            stats.totalEstimatedTime += task.estimatedTime;
            stats.totalActualTime += task.actualTime;
        }
        
        stats.averagePriority = tasks.length > 0 ? prioritySum / tasks.length : 0;
        stats.efficiency = stats.totalActualTime > 0 ? 
            stats.totalEstimatedTime / stats.totalActualTime : 1;
        
        return stats;
    }
}

// ===== ANALYTICS MODULE =====

class TaskAnalytics {
    constructor() {
        this.taskHistory = [];
        this.completionTimes = [];
        this.priorityDistribution = new Map();
    }
    
    addTask(task) {
        this.taskHistory.push({
            action: 'created',
            taskId: task.id,
            timestamp: new Date(),
            data: { ...task }
        });
        
        this.updatePriorityDistribution(task.priority, 1);
    }
    
    updateTask(task) {
        this.taskHistory.push({
            action: 'updated',
            taskId: task.id,
            timestamp: new Date(),
            data: { ...task }
        });
        
        if (task.status === 'completed' && task.completedAt) {
            const completionTime = task.completedAt - task.createdAt;
            this.completionTimes.push(completionTime);
        }
    }
    
    removeTask(task) {
        this.taskHistory.push({
            action: 'deleted',
            taskId: task.id,
            timestamp: new Date(),
            data: { ...task }
        });
        
        this.updatePriorityDistribution(task.priority, -1);
    }
    
    updatePriorityDistribution(priority, delta) {
        const current = this.priorityDistribution.get(priority) || 0;
        this.priorityDistribution.set(priority, current + delta);
    }
    
    generateReport() {
        const report = {
            totalActions: this.taskHistory.length,
            averageCompletionTime: this.getAverageCompletionTime(),
            priorityDistribution: Object.fromEntries(this.priorityDistribution),
            productivityTrend: this.getProductivityTrend(),
            recentActivity: this.getRecentActivity(10)
        };
        
        return report;
    }
    
    getAverageCompletionTime() {
        if (this.completionTimes.length === 0) return 0;
        
        const sum = this.completionTimes.reduce((a, b) => a + b, 0);
        return sum / this.completionTimes.length;
    }
    
    getProductivityTrend() {
        // Calculate tasks completed per day for last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const completedTasks = this.taskHistory.filter(entry => 
            entry.action === 'updated' && 
            entry.data.status === 'completed' &&
            entry.timestamp >= thirtyDaysAgo
        );
        
        const dailyCompletion = new Map();
        
        for (let task of completedTasks) {
            const date = task.timestamp.toDateString();
            dailyCompletion.set(date, (dailyCompletion.get(date) || 0) + 1);
        }
        
        return Object.fromEntries(dailyCompletion);
    }
    
    getRecentActivity(limit = 10) {
        return this.taskHistory
            .slice(-limit)
            .reverse()
            .map(entry => ({
                action: entry.action,
                taskId: entry.taskId,
                timestamp: entry.timestamp,
                title: entry.data.title
            }));
    }
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Task Management System Demo ===');

// Create task management system
const tms = new TaskManagementSystem();

// Create sample tasks
console.log('\n=== Creating Tasks ===');
const task1 = tms.createTask('Design Database Schema', 'Create ERD and table structures', 4, 8, ['database', 'design']);
const task2 = tms.createTask('Implement User Authentication', 'Build login/logout functionality', 5, 12, ['backend', 'security']);
const task3 = tms.createTask('Create API Endpoints', 'Build REST API for user management', 4, 16, ['backend', 'api']);
const task4 = tms.createTask('Design UI Mockups', 'Create wireframes and mockups', 3, 6, ['frontend', 'design']);
const task5 = tms.createTask('Write Unit Tests', 'Create comprehensive test suite', 3, 10, ['testing', 'quality']);

console.log('Created tasks:', [task1, task2, task3, task4, task5].map(t => t.title));

// Add dependencies
console.log('\n=== Adding Dependencies ===');
try {
    tms.addDependency(task1.id, task2.id); // Auth depends on DB
    tms.addDependency(task1.id, task3.id); // API depends on DB
    tms.addDependency(task2.id, task3.id); // API depends on Auth
    tms.addDependency(task4.id, task5.id); // Tests depend on UI
    console.log('Dependencies added successfully');
} catch (error) {
    console.error('Error adding dependencies:', error.message);
}

// Get execution order
console.log('\n=== Task Execution Order ===');
const executionOrder = tms.getTaskExecutionOrder();
console.log('Optimal execution order:', executionOrder);

// Get ready tasks
console.log('\n=== Ready Tasks ===');
const readyTasks = tms.getReadyTasks();
console.log('Tasks ready to start:', readyTasks.map(t => t.title));

// Search functionality
console.log('\n=== Search Functionality ===');
const searchResults = tms.searchTasks('design');
console.log('Search results for "design":', searchResults.map(t => t.title));

// Filter tasks
console.log('\n=== Filter Tasks ===');
const highPriorityTasks = tms.filterTasks({ minPriority: 4 });
console.log('High priority tasks:', highPriorityTasks.map(t => `${t.title} (Priority: ${t.priority})`));

const backendTasks = tms.filterTasks({ tag: 'backend' });
console.log('Backend tasks:', backendTasks.map(t => t.title));

// Schedule tasks with greedy algorithm
console.log('\n=== Greedy Scheduling ===');
const schedule = tms.scheduleTasksGreedy(20); // 20 hours available
console.log('Greedy schedule for 20 hours:');
console.log('Selected tasks:', schedule.schedule.map(t => `${t.title} (${t.estimatedTime}h)`));
console.log('Total time used:', schedule.totalTime, 'hours');
console.log('Remaining time:', schedule.remainingTime, 'hours');

// Get next task by priority
console.log('\n=== Priority-based Next Task ===');
const nextTask = tms.getNextTaskByPriority();
console.log('Next task to work on:', nextTask ? nextTask.title : 'No tasks available');

// Update task status
console.log('\n=== Update Task Status ===');
tms.updateTask(task1.id, { status: 'completed', actualTime: 7 });
console.log('Updated task1 status to completed');

// Check ready tasks after completion
const newReadyTasks = tms.getReadyTasks();
console.log('New ready tasks after task1 completion:', newReadyTasks.map(t => t.title));

// Undo/Redo functionality
console.log('\n=== Undo/Redo Functionality ===');
console.log('Can undo:', tms.canUndo());
console.log('Can redo:', tms.canRedo());

if (tms.canUndo()) {
    tms.undo();
    console.log('Undid last action');
    console.log('Task1 status after undo:', tms.getTask(task1.id).status);
}

if (tms.canRedo()) {
    tms.redo();
    console.log('Redid last action');
    console.log('Task1 status after redo:', tms.getTask(task1.id).status);
}

// Get statistics
console.log('\n=== Task Statistics ===');
const stats = tms.getTaskStatistics();
console.log('Task statistics:', stats);

// Get analytics
console.log('\n=== Analytics Report ===');
const analytics = tms.getAnalytics();
console.log('Analytics report:', analytics);

// Optimize task order using DP
console.log('\n=== Optimal Task Order (DP) ===');
const optimalOrder = tms.optimizeTaskOrder();
console.log('DP-optimized task order:', optimalOrder.map(t => t.title));

// Performance testing
console.log('\n=== Performance Testing ===');
console.time('Create 1000 tasks');
for (let i = 0; i < 1000; i++) {
    tms.createTask(`Task ${i}`, `Description for task ${i}`, Math.floor(Math.random() * 5) + 1);
}
console.timeEnd('Create 1000 tasks');

console.time('Search in 1000+ tasks');
const largeSearchResults = tms.searchTasks('task');
console.timeEnd('Search in 1000+ tasks');
console.log('Search results count:', largeSearchResults.length);

console.time('Filter 1000+ tasks');
const filteredResults = tms.filterTasks({ minPriority: 4 });
console.timeEnd('Filter 1000+ tasks');
console.log('Filtered results count:', filteredResults.length);

console.log('\n=== Task Management System Demo Complete ===');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
#include <chrono>
#include <memory>
using namespace std;
using namespace std::chrono;

// ===== TASK ENTITY =====

class Task {
public:
    string id;
    string title;
    string description;
    int priority;
    int estimatedTime;
    int actualTime;
    string status; // "pending", "in-progress", "completed", "cancelled"
    unordered_set<string> tags;
    unordered_set<string> dependencies;
    unordered_set<string> dependents;
    time_point<system_clock> createdAt;
    time_point<system_clock> updatedAt;
    time_point<system_clock> completedAt;
    string assignee;
    
    Task(const string& id, const string& title, const string& description, 
         int priority = 1, int estimatedTime = 1)
        : id(id), title(title), description(description), priority(priority),
          estimatedTime(estimatedTime), actualTime(0), status("pending"),
          createdAt(system_clock::now()), updatedAt(system_clock::now()) {}
    
    void addDependency(const string& taskId) {
        dependencies.insert(taskId);
    }
    
    void addDependent(const string& taskId) {
        dependents.insert(taskId);
    }
    
    void updateStatus(const string& newStatus) {
        status = newStatus;
        updatedAt = system_clock::now();
        if (newStatus == "completed") {
            completedAt = system_clock::now();
        }
    }
    
    void addTag(const string& tag) {
        tags.insert(tag);
    }
    
    bool isBlocked() const {
        return !dependencies.empty();
    }
    
    double getEfficiency() const {
        if (actualTime == 0) return 1.0;
        return static_cast<double>(estimatedTime) / actualTime;
    }
};

// ===== PRIORITY QUEUE FOR TASK SCHEDULING =====

struct TaskComparator {
    bool operator()(const shared_ptr<Task>& a, const shared_ptr<Task>& b) {
        if (a->priority != b->priority) {
            return a->priority < b->priority; // Max heap by priority
        }
        return a->createdAt > b->createdAt; // Earlier tasks first
    }
};

// ===== DEPENDENCY GRAPH =====

class DependencyGraph {
private:
    unordered_map<string, vector<string>> adjacencyList;
    unordered_map<string, int> inDegree;
    
public:
    void addTask(const string& taskId) {
        if (adjacencyList.find(taskId) == adjacencyList.end()) {
            adjacencyList[taskId] = vector<string>();
            inDegree[taskId] = 0;
        }
    }
    
    void addDependency(const string& fromTask, const string& toTask) {
        addTask(fromTask);
        addTask(toTask);
        
        adjacencyList[fromTask].push_back(toTask);
        inDegree[toTask]++;
    }
    
    void removeDependency(const string& fromTask, const string& toTask) {
        auto& neighbors = adjacencyList[fromTask];
        auto it = find(neighbors.begin(), neighbors.end(), toTask);
        if (it != neighbors.end()) {
            neighbors.erase(it);
            inDegree[toTask]--;
        }
    }
    
    vector<string> getTopologicalOrder() {
        vector<string> result;
        queue<string> q;
        unordered_map<string, int> tempInDegree = inDegree;
        
        // Find all tasks with no dependencies
        for (const auto& pair : tempInDegree) {
            if (pair.second == 0) {
                q.push(pair.first);
            }
        }
        
        while (!q.empty()) {
            string current = q.front();
            q.pop();
            result.push_back(current);
            
            // Process all dependent tasks
            for (const string& neighbor : adjacencyList[current]) {
                tempInDegree[neighbor]--;
                if (tempInDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }
        
        // Check for cycles
        if (result.size() != adjacencyList.size()) {
            throw runtime_error("Circular dependency detected!");
        }
        
        return result;
    }
    
    vector<string> getReadyTasks() {
        vector<string> readyTasks;
        for (const auto& pair : inDegree) {
            if (pair.second == 0) {
                readyTasks.push_back(pair.first);
            }
        }
        return readyTasks;
    }
    
    bool hasCycle() {
        try {
            getTopologicalOrder();
            return false;
        } catch (const runtime_error&) {
            return true;
        }
    }
};

// ===== TRIE FOR TEXT SEARCH =====

struct TrieNode {
    unordered_map<char, unique_ptr<TrieNode>> children;
    bool isEndOfWord;
    unordered_set<string> taskIds;
    
    TrieNode() : isEndOfWord(false) {}
};

class Trie {
private:
    unique_ptr<TrieNode> root;
    
    void toLowerCase(string& str) {
        transform(str.begin(), str.end(), str.begin(), ::tolower);
    }
    
public:
    Trie() : root(make_unique<TrieNode>()) {}
    
    void insert(string word, const string& taskId) {
        toLowerCase(word);
        TrieNode* node = root.get();
        
        for (char c : word) {
            if (node->children.find(c) == node->children.end()) {
                node->children[c] = make_unique<TrieNode>();
            }
            node = node->children[c].get();
            node->taskIds.insert(taskId);
        }
        
        node->isEndOfWord = true;
    }
    
    vector<string> search(string prefix) {
        toLowerCase(prefix);
        TrieNode* node = root.get();
        
        for (char c : prefix) {
            if (node->children.find(c) == node->children.end()) {
                return vector<string>();
            }
            node = node->children[c].get();
        }
        
        return vector<string>(node->taskIds.begin(), node->taskIds.end());
    }
};

// ===== MAIN TASK MANAGEMENT SYSTEM =====

class TaskManagementSystem {
private:
    unordered_map<string, shared_ptr<Task>> tasks;
    priority_queue<shared_ptr<Task>, vector<shared_ptr<Task>>, TaskComparator> priorityQueue;
    Trie searchTrie;
    DependencyGraph dependencyGraph;
    int taskIdCounter;
    
    void indexTaskForSearch(shared_ptr<Task> task) {
        // Index title words
        istringstream titleStream(task->title);
        string word;
        while (titleStream >> word) {
            if (word.length() > 2) {
                searchTrie.insert(word, task->id);
            }
        }
        
        // Index description words
        istringstream descStream(task->description);
        while (descStream >> word) {
            if (word.length() > 2) {
                searchTrie.insert(word, task->id);
            }
        }
        
        // Index tags
        for (const string& tag : task->tags) {
            searchTrie.insert(tag, task->id);
        }
    }
    
public:
    TaskManagementSystem() : taskIdCounter(1) {}
    
    // ===== TASK CRUD OPERATIONS =====
    
    shared_ptr<Task> createTask(const string& title, const string& description,
                               int priority = 1, int estimatedTime = 1) {
        string taskId = "task_" + to_string(taskIdCounter++);
        auto task = make_shared<Task>(taskId, title, description, priority, estimatedTime);
        
        tasks[taskId] = task;
        priorityQueue.push(task);
        dependencyGraph.addTask(taskId);
        indexTaskForSearch(task);
        
        return task;
    }
    
    shared_ptr<Task> getTask(const string& taskId) {
        auto it = tasks.find(taskId);
        return (it != tasks.end()) ? it->second : nullptr;
    }
    
    vector<shared_ptr<Task>> getAllTasks() {
        vector<shared_ptr<Task>> allTasks;
        for (const auto& pair : tasks) {
            allTasks.push_back(pair.second);
        }
        return allTasks;
    }
    
    bool updateTask(const string& taskId, const string& field, const string& value) {
        auto task = getTask(taskId);
        if (!task) return false;
        
        if (field == "status") {
            task->updateStatus(value);
        } else if (field == "title") {
            task->title = value;
        } else if (field == "description") {
            task->description = value;
        } else if (field == "assignee") {
            task->assignee = value;
        }
        
        task->updatedAt = system_clock::now();
        return true;
    }
    
    bool deleteTask(const string& taskId) {
        auto it = tasks.find(taskId);
        if (it == tasks.end()) return false;
        
        tasks.erase(it);
        return true;
    }
    
    // ===== SEARCH AND FILTERING =====
    
    vector<shared_ptr<Task>> searchTasks(const string& query) {
        vector<string> taskIds = searchTrie.search(query);
        vector<shared_ptr<Task>> results;
        
        for (const string& id : taskIds) {
            auto task = getTask(id);
            if (task) {
                results.push_back(task);
            }
        }
        
        return results;
    }
    
    vector<shared_ptr<Task>> filterTasksByStatus(const string& status) {
        vector<shared_ptr<Task>> filtered;
        for (const auto& pair : tasks) {
            if (pair.second->status == status) {
                filtered.push_back(pair.second);
            }
        }
        return filtered;
    }
    
    vector<shared_ptr<Task>> filterTasksByPriority(int minPriority) {
        vector<shared_ptr<Task>> filtered;
        for (const auto& pair : tasks) {
            if (pair.second->priority >= minPriority) {
                filtered.push_back(pair.second);
            }
        }
        return filtered;
    }
    
    // ===== DEPENDENCY MANAGEMENT =====
    
    bool addDependency(const string& fromTaskId, const string& toTaskId) {
        auto fromTask = getTask(fromTaskId);
        auto toTask = getTask(toTaskId);
        
        if (!fromTask || !toTask) return false;
        
        dependencyGraph.addDependency(fromTaskId, toTaskId);
        
        // Check for cycles
        if (dependencyGraph.hasCycle()) {
            dependencyGraph.removeDependency(fromTaskId, toTaskId);
            return false;
        }
        
        fromTask->addDependent(toTaskId);
        toTask->addDependency(fromTaskId);
        return true;
    }
    
    vector<string> getTaskExecutionOrder() {
        return dependencyGraph.getTopologicalOrder();
    }
    
    vector<shared_ptr<Task>> getReadyTasks() {
        vector<string> readyTaskIds = dependencyGraph.getReadyTasks();
        vector<shared_ptr<Task>> readyTasks;
        
        for (const string& id : readyTaskIds) {
            auto task = getTask(id);
            if (task && task->status == "pending") {
                readyTasks.push_back(task);
            }
        }
        
        return readyTasks;
    }
    
    // ===== SCHEDULING =====
    
    shared_ptr<Task> getNextTaskByPriority() {
        auto readyTasks = getReadyTasks();
        if (readyTasks.empty()) return nullptr;
        
        // Sort by priority (descending) then by creation time (ascending)
        sort(readyTasks.begin(), readyTasks.end(), 
             [](const shared_ptr<Task>& a, const shared_ptr<Task>& b) {
                 if (a->priority != b->priority) {
                     return a->priority > b->priority;
                 }
                 return a->createdAt < b->createdAt;
             });
        
        return readyTasks[0];
    }
    
    struct ScheduleResult {
        vector<shared_ptr<Task>> schedule;
        int totalTime;
        int remainingTime;
    };
    
    ScheduleResult scheduleTasksGreedy(int availableHours) {
        auto readyTasks = getReadyTasks();
        
        // Sort by value-to-time ratio (priority / estimated time)
        sort(readyTasks.begin(), readyTasks.end(),
             [](const shared_ptr<Task>& a, const shared_ptr<Task>& b) {
                 double ratioA = static_cast<double>(a->priority) / a->estimatedTime;
                 double ratioB = static_cast<double>(b->priority) / b->estimatedTime;
                 return ratioA > ratioB;
             });
        
        ScheduleResult result;
        result.totalTime = 0;
        result.remainingTime = availableHours;
        
        for (auto task : readyTasks) {
            if (task->estimatedTime <= result.remainingTime) {
                result.schedule.push_back(task);
                result.totalTime += task->estimatedTime;
                result.remainingTime -= task->estimatedTime;
            }
        }
        
        return result;
    }
    
    // ===== STATISTICS =====
    
    struct TaskStatistics {
        int total;
        int pending;
        int inProgress;
        int completed;
        int cancelled;
        double averagePriority;
        int totalEstimatedTime;
        int totalActualTime;
        double efficiency;
    };
    
    TaskStatistics getTaskStatistics() {
        TaskStatistics stats = {0, 0, 0, 0, 0, 0.0, 0, 0, 1.0};
        int prioritySum = 0;
        
        for (const auto& pair : tasks) {
            auto task = pair.second;
            stats.total++;
            
            if (task->status == "pending") stats.pending++;
            else if (task->status == "in-progress") stats.inProgress++;
            else if (task->status == "completed") stats.completed++;
            else if (task->status == "cancelled") stats.cancelled++;
            
            prioritySum += task->priority;
            stats.totalEstimatedTime += task->estimatedTime;
            stats.totalActualTime += task->actualTime;
        }
        
        if (stats.total > 0) {
            stats.averagePriority = static_cast<double>(prioritySum) / stats.total;
        }
        
        if (stats.totalActualTime > 0) {
            stats.efficiency = static_cast<double>(stats.totalEstimatedTime) / stats.totalActualTime;
        }
        
        return stats;
    }
    
    void printStatistics() {
        auto stats = getTaskStatistics();
        cout << "=== Task Statistics ===" << endl;
        cout << "Total tasks: " << stats.total << endl;
        cout << "Pending: " << stats.pending << endl;
        cout << "In Progress: " << stats.inProgress << endl;
        cout << "Completed: " << stats.completed << endl;
        cout << "Cancelled: " << stats.cancelled << endl;
        cout << "Average Priority: " << stats.averagePriority << endl;
        cout << "Total Estimated Time: " << stats.totalEstimatedTime << " hours" << endl;
        cout << "Total Actual Time: " << stats.totalActualTime << " hours" << endl;
        cout << "Efficiency: " << stats.efficiency << endl;
    }
};

// ===== EXAMPLE USAGE =====

int main() {
    cout << "=== Task Management System Demo ===" << endl;
    
    TaskManagementSystem tms;
    
    // Create sample tasks
    cout << "\n=== Creating Tasks ===" << endl;
    auto task1 = tms.createTask("Design Database Schema", "Create ERD and table structures", 4, 8);
    auto task2 = tms.createTask("Implement User Authentication", "Build login/logout functionality", 5, 12);
    auto task3 = tms.createTask("Create API Endpoints", "Build REST API for user management", 4, 16);
    auto task4 = tms.createTask("Design UI Mockups", "Create wireframes and mockups", 3, 6);
    auto task5 = tms.createTask("Write Unit Tests", "Create comprehensive test suite", 3, 10);
    
    task1->addTag("database");
    task1->addTag("design");
    task2->addTag("backend");
    task2->addTag("security");
    task3->addTag("backend");
    task3->addTag("api");
    task4->addTag("frontend");
    task4->addTag("design");
    task5->addTag("testing");
    task5->addTag("quality");
    
    cout << "Created 5 tasks successfully" << endl;
    
    // Add dependencies
    cout << "\n=== Adding Dependencies ===" << endl;
    if (tms.addDependency(task1->id, task2->id)) {
        cout << "Added dependency: Auth depends on DB" << endl;
    }
    if (tms.addDependency(task1->id, task3->id)) {
        cout << "Added dependency: API depends on DB" << endl;
    }
    if (tms.addDependency(task2->id, task3->id)) {
        cout << "Added dependency: API depends on Auth" << endl;
    }
    if (tms.addDependency(task4->id, task5->id)) {
        cout << "Added dependency: Tests depend on UI" << endl;
    }
    
    // Get execution order
    cout << "\n=== Task Execution Order ===" << endl;
    try {
        auto executionOrder = tms.getTaskExecutionOrder();
        cout << "Optimal execution order: ";
        for (const string& taskId : executionOrder) {
            auto task = tms.getTask(taskId);
            if (task) {
                cout << task->title << " -> ";
            }
        }
        cout << "END" << endl;
    } catch (const runtime_error& e) {
        cout << "Error: " << e.what() << endl;
    }
    
    // Get ready tasks
    cout << "\n=== Ready Tasks ===" << endl;
    auto readyTasks = tms.getReadyTasks();
    cout << "Tasks ready to start: ";
    for (auto task : readyTasks) {
        cout << task->title << ", ";
    }
    cout << endl;
    
    // Search functionality
    cout << "\n=== Search Functionality ===" << endl;
    auto searchResults = tms.searchTasks("design");
    cout << "Search results for 'design': ";
    for (auto task : searchResults) {
        cout << task->title << ", ";
    }
    cout << endl;
    
    // Filter tasks
    cout << "\n=== Filter Tasks ===" << endl;
    auto highPriorityTasks = tms.filterTasksByPriority(4);
    cout << "High priority tasks (>=4): ";
    for (auto task : highPriorityTasks) {
        cout << task->title << " (Priority: " << task->priority << "), ";
    }
    cout << endl;
    
    auto pendingTasks = tms.filterTasksByStatus("pending");
    cout << "Pending tasks: " << pendingTasks.size() << " tasks" << endl;
    
    // Schedule tasks with greedy algorithm
    cout << "\n=== Greedy Scheduling ===" << endl;
    auto schedule = tms.scheduleTasksGreedy(20); // 20 hours available
    cout << "Greedy schedule for 20 hours:" << endl;
    cout << "Selected tasks: ";
    for (auto task : schedule.schedule) {
        cout << task->title << " (" << task->estimatedTime << "h), ";
    }
    cout << endl;
    cout << "Total time used: " << schedule.totalTime << " hours" << endl;
    cout << "Remaining time: " << schedule.remainingTime << " hours" << endl;
    
    // Get next task by priority
    cout << "\n=== Priority-based Next Task ===" << endl;
    auto nextTask = tms.getNextTaskByPriority();
    if (nextTask) {
        cout << "Next task to work on: " << nextTask->title << endl;
    } else {
        cout << "No tasks available" << endl;
    }
    
    // Update task status
    cout << "\n=== Update Task Status ===" << endl;
    if (tms.updateTask(task1->id, "status", "completed")) {
        cout << "Updated task1 status to completed" << endl;
    }
    
    // Check ready tasks after completion
    auto newReadyTasks = tms.getReadyTasks();
    cout << "New ready tasks after task1 completion: ";
    for (auto task : newReadyTasks) {
        cout << task->title << ", ";
    }
    cout << endl;
    
    // Get statistics
    cout << "\n=== Task Statistics ===" << endl;
    tms.printStatistics();
    
    // Performance testing
    cout << "\n=== Performance Testing ===" << endl;
    auto start = high_resolution_clock::now();
    
    for (int i = 0; i < 1000; i++) {
        tms.createTask("Task " + to_string(i), "Description for task " + to_string(i), 
                      (rand() % 5) + 1, (rand() % 10) + 1);
    }
    
    auto end = high_resolution_clock::now();
    auto duration = duration_cast<milliseconds>(end - start);
    cout << "Created 1000 tasks in: " << duration.count() << " ms" << endl;
    
    start = high_resolution_clock::now();
    auto largeSearchResults = tms.searchTasks("task");
    end = high_resolution_clock::now();
    duration = duration_cast<milliseconds>(end - start);
    cout << "Search in 1000+ tasks took: " << duration.count() << " ms" << endl;
    cout << "Search results count: " << largeSearchResults.size() << endl;
    
    start = high_resolution_clock::now();
    auto filteredResults = tms.filterTasksByPriority(4);
    end = high_resolution_clock::now();
    duration = duration_cast<milliseconds>(end - start);
    cout << "Filter 1000+ tasks took: " << duration.count() << " ms" << endl;
    cout << "Filtered results count: " << filteredResults.size() << endl;
    
    cout << "\n=== Task Management System Demo Complete ===" << endl;
    
    return 0;
}
```

---

## 🎯 Project Challenges and Extensions

### Phase 1: Basic Implementation (Beginner)
1. **Task CRUD Operations**: Implement basic create, read, update, delete
2. **Simple Search**: Linear search through task titles
3. **Basic Priority Queue**: Use built-in priority queue
4. **Simple Dependencies**: Track dependencies without cycle detection

### Phase 2: Intermediate Features (Medium)
1. **Advanced Search**: Implement Trie-based search with autocomplete
2. **Dependency Management**: Add cycle detection and topological sorting
3. **Undo/Redo System**: Implement command pattern with stacks
4. **Performance Optimization**: Add hash tables and efficient data structures

### Phase 3: Advanced Features (Advanced)
1. **Dynamic Programming**: Optimize task scheduling with DP
2. **Graph Algorithms**: Implement shortest path for task dependencies
3. **Machine Learning**: Add task time estimation based on historical data
4. **Distributed System**: Scale to multiple users with conflict resolution

### Bonus Challenges:
1. **Real-time Collaboration**: Multiple users editing simultaneously
2. **Mobile App**: Create mobile interface with offline sync
3. **AI Assistant**: Natural language task creation and scheduling
4. **Analytics Dashboard**: Visual insights and productivity metrics

---

## 📊 Performance Analysis

### Time Complexity Analysis:

| Operation | Hash Table | Priority Queue | Trie Search | Dependency Graph |
|-----------|------------|----------------|-------------|------------------|
| Insert | O(1) avg | O(log n) | O(m) | O(1) |
| Search | O(1) avg | O(n) | O(m + k) | O(V + E) |
| Delete | O(1) avg | O(log n) | O(m) | O(V + E) |
| Update | O(1) avg | O(log n) | O(m) | O(1) |

*Where n = number of tasks, m = length of search term, k = number of results, V = vertices, E = edges*

### Space Complexity:
- **Hash Table**: O(n) for task storage
- **Trie**: O(ALPHABET_SIZE * N * M) where N is number of words, M is average word length
- **Dependency Graph**: O(V + E) for adjacency list representation
- **Priority Queue**: O(n) for heap storage
- **Undo Stack**: O(k) where k is maximum undo operations

### Optimization Techniques Used:
1. **Hash Table Resizing**: Dynamic resizing to maintain load factor
2. **Trie Compression**: Store task IDs at each node for efficient retrieval
3. **Lazy Evaluation**: Compute topological order only when needed
4. **Memoization**: Cache frequently accessed computations
5. **Batch Operations**: Group multiple operations for better performance

---

## 🧪 Testing Strategy

### Unit Tests:
```javascript
// Example test cases
function testTaskCreation() {
    const tms = new TaskManagementSystem();
    const task = tms.createTask('Test Task', 'Test Description', 3, 5);
    
    assert(task.title === 'Test Task');
    assert(task.priority === 3);
    assert(task.estimatedTime === 5);
    assert(task.status === 'pending');
    console.log('✓ Task creation test passed');
}

function testDependencyManagement() {
    const tms = new TaskManagementSystem();
    const task1 = tms.createTask('Task 1', 'First task', 1);
    const task2 = tms.createTask('Task 2', 'Second task', 2);
    
    tms.addDependency(task1.id, task2.id);
    
    const readyTasks = tms.getReadyTasks();
    assert(readyTasks.length === 1);
    assert(readyTasks[0].id === task1.id);
    console.log('✓ Dependency management test passed');
}

function testSearchFunctionality() {
    const tms = new TaskManagementSystem();
    tms.createTask('Design Database', 'Create schema', 4);
    tms.createTask('Implement API', 'Build endpoints', 3);
    
    const results = tms.searchTasks('design');
    assert(results.length === 1);
    assert(results[0].title.includes('Design'));
    console.log('✓ Search functionality test passed');
}

function testGreedyScheduling() {
    const tms = new TaskManagementSystem();
    tms.createTask('High Priority Short', 'Quick task', 5, 2);
    tms.createTask('Low Priority Long', 'Long task', 1, 10);
    
    const schedule = tms.scheduleTasksGreedy(5);
    assert(schedule.schedule.length === 1);
    assert(schedule.schedule[0].priority === 5);
    console.log('✓ Greedy scheduling test passed');
}

// Run all tests
testTaskCreation();
testDependencyManagement();
testSearchFunctionality();
testGreedyScheduling();
console.log('\n🎉 All tests passed!');
```

### Integration Tests:
1. **End-to-End Workflow**: Create → Add Dependencies → Schedule → Complete
2. **Performance Tests**: Large dataset operations (1000+ tasks)
3. **Stress Tests**: Concurrent operations and edge cases
4. **Memory Tests**: Check for memory leaks in long-running operations

### Edge Cases to Test:
1. **Circular Dependencies**: Ensure proper cycle detection
2. **Empty Datasets**: Handle operations on empty task lists
3. **Invalid Inputs**: Graceful handling of malformed data
4. **Boundary Conditions**: Maximum task limits and constraints

---

## 🎓 Learning Outcomes

After completing this mini-project, you will have:

### **Data Structures Mastery**:
- ✅ **Hash Tables**: Fast lookups and storage
- ✅ **Linked Lists**: Dynamic data management
- ✅ **Stacks**: Undo/Redo functionality
- ✅ **Queues**: Task processing pipelines
- ✅ **Heaps**: Priority-based scheduling
- ✅ **Trees**: Hierarchical organization
- ✅ **Graphs**: Dependency relationships
- ✅ **Tries**: Efficient text searching

### **Algorithm Proficiency**:
- ✅ **Sorting**: Task prioritization and ordering
- ✅ **Searching**: Binary search and text search
- ✅ **Graph Traversal**: DFS/BFS for dependencies
- ✅ **Topological Sort**: Task execution ordering
- ✅ **Dynamic Programming**: Optimal scheduling
- ✅ **Greedy Algorithms**: Resource allocation
- ✅ **Backtracking**: Constraint satisfaction

### **System Design Skills**:
- ✅ **Modular Architecture**: Separation of concerns
- ✅ **Performance Optimization**: Time/space complexity
- ✅ **Error Handling**: Robust error management
- ✅ **Testing Strategy**: Comprehensive test coverage
- ✅ **Scalability**: Design for growth

### **Real-World Applications**:
- ✅ **Project Management**: Task scheduling and tracking
- ✅ **Resource Optimization**: Efficient allocation algorithms
- ✅ **User Experience**: Search and filtering capabilities
- ✅ **Data Analytics**: Performance insights and reporting

---

## 🚀 Next Steps and Career Applications

### **Portfolio Enhancement**:
1. **GitHub Repository**: Create a well-documented repo
2. **Live Demo**: Deploy a web version
3. **Technical Blog**: Write about your implementation
4. **Video Walkthrough**: Explain your design decisions

### **Interview Preparation**:
1. **System Design**: Use this as a system design example
2. **Coding Challenges**: Extract individual algorithms for practice
3. **Complexity Analysis**: Discuss optimization decisions
4. **Trade-offs**: Explain design choices and alternatives

### **Industry Applications**:
- **Project Management Tools**: Jira, Asana, Trello
- **Development Workflows**: CI/CD pipelines, build systems
- **Resource Planning**: Manufacturing, logistics, scheduling
- **Game Development**: Quest systems, skill trees
- **AI/ML**: Task scheduling in distributed training

### **Advanced Extensions**:
1. **Microservices**: Split into independent services
2. **Event Sourcing**: Track all state changes
3. **CQRS**: Separate read/write models
4. **Real-time Updates**: WebSocket integration
5. **Machine Learning**: Predictive analytics

---

## 📚 Additional Resources

### **Books**:
- "Introduction to Algorithms" by Cormen, Leiserson, Rivest, Stein
- "System Design Interview" by Alex Xu
- "Designing Data-Intensive Applications" by Martin Kleppmann

### **Online Courses**:
- Coursera: "Algorithms Specialization" by Stanford
- edX: "Data Structures and Algorithms" by MIT
- Udemy: "Master the Coding Interview: Data Structures + Algorithms"

### **Practice Platforms**:
- LeetCode: Algorithm practice problems
- HackerRank: Data structures challenges
- CodeSignal: System design questions
- Pramp: Mock interviews

### **Documentation**:
- MDN Web Docs: JavaScript reference
- cppreference.com: C++ standard library
- GeeksforGeeks: Algorithm explanations
- Stack Overflow: Community Q&A

---

## 🎉 Conclusion

Congratulations! You've completed a comprehensive mini-project that integrates multiple data structures and algorithms concepts. This Task Management System demonstrates practical applications of:

- **15+ Data Structures**: From basic arrays to complex graphs
- **10+ Algorithms**: Sorting, searching, optimization, and more
- **Real-world Problem Solving**: Practical software development
- **Performance Optimization**: Efficient algorithm selection
- **System Design**: Scalable architecture patterns

This project serves as an excellent portfolio piece and interview preparation tool. You've not only learned individual concepts but also how to combine them effectively to solve complex problems.

**Keep building, keep learning, and keep coding!** 🚀

---

*"The best way to learn data structures and algorithms is to implement them in real projects. This mini-project gives you that hands-on experience while building something genuinely useful."*

**Happy Coding!** 💻✨