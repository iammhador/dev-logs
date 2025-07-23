# Chapter 15: Simple Greedy Algorithms - Making Locally Optimal Choices

## 🎯 What are Greedy Algorithms?

**Greedy Algorithms** make locally optimal choices at each step, hoping to find a globally optimal solution. The key insight is that for certain problems, making the best choice at each moment leads to the best overall solution.

### Why Greedy Algorithms Matter:
- **Simplicity**: Often easier to understand and implement than DP
- **Efficiency**: Usually have better time complexity than exhaustive search
- **Real-world applications**: Scheduling, resource allocation, networking
- **Building intuition**: Helps develop algorithmic thinking
- **Interview frequency**: Common in coding interviews
- **Foundation**: Basis for more complex optimization algorithms

### Core Principles:
1. **Greedy Choice Property**: Local optimum leads to global optimum
2. **Optimal Substructure**: Optimal solution contains optimal subsolutions
3. **No backtracking**: Once a choice is made, it's never reconsidered

---

## 📊 Greedy vs Other Approaches

### Comparison Table:

| Aspect | Greedy | Dynamic Programming | Backtracking |
|--------|--------|-------------------|---------------|
| **Strategy** | Local optimum | Global optimum via subproblems | Explore all possibilities |
| **Backtracking** | Never | No (bottom-up) | Always |
| **Time Complexity** | Usually O(n log n) | Usually O(n²) or O(n³) | Usually exponential |
| **Space Complexity** | Usually O(1) | Usually O(n) or O(n²) | Usually O(depth) |
| **Guarantee** | Not always optimal | Always optimal (if applicable) | Always finds solution |
| **Examples** | Activity selection | Knapsack | N-Queens |

### When Greedy Works:
- ✅ **Greedy choice property holds**: Local optimum → global optimum
- ✅ **Optimal substructure exists**: Problem can be broken down
- ✅ **No dependencies**: Current choice doesn't affect future optimality
- ✅ **Sorting helps**: Often involves sorting by some criteria

### When Greedy Fails:
- ❌ **Coin change with arbitrary denominations**: [1,3,4] for amount 6
- ❌ **0/1 Knapsack**: Need to consider all combinations
- ❌ **Shortest path with negative weights**: Need to consider all paths

---

## 💻 JavaScript Implementation

```javascript
// Greedy Algorithms - Comprehensive Implementation

// ===== CLASSIC GREEDY PROBLEMS =====

/**
 * Activity Selection Problem
 * Problem: Select maximum number of non-overlapping activities
 * Greedy Strategy: Always pick activity that finishes earliest
 */
function activitySelection(activities) {
    // Sort by finish time
    activities.sort((a, b) => a.finish - b.finish);
    
    const selected = [];
    let lastFinishTime = 0;
    
    for (let activity of activities) {
        // If activity starts after last selected activity finishes
        if (activity.start >= lastFinishTime) {
            selected.push(activity);
            lastFinishTime = activity.finish;
        }
    }
    
    return selected;
}

/**
 * Fractional Knapsack
 * Problem: Maximize value with weight constraint (can take fractions)
 * Greedy Strategy: Sort by value-to-weight ratio, take highest ratios first
 */
function fractionalKnapsack(items, capacity) {
    // Calculate value-to-weight ratio and sort
    const itemsWithRatio = items.map((item, index) => ({
        ...item,
        ratio: item.value / item.weight,
        index
    }));
    
    itemsWithRatio.sort((a, b) => b.ratio - a.ratio);
    
    let totalValue = 0;
    let remainingCapacity = capacity;
    const solution = [];
    
    for (let item of itemsWithRatio) {
        if (remainingCapacity === 0) break;
        
        if (item.weight <= remainingCapacity) {
            // Take entire item
            solution.push({ ...item, fraction: 1 });
            totalValue += item.value;
            remainingCapacity -= item.weight;
        } else {
            // Take fraction of item
            const fraction = remainingCapacity / item.weight;
            solution.push({ ...item, fraction });
            totalValue += item.value * fraction;
            remainingCapacity = 0;
        }
    }
    
    return { totalValue, solution };
}

/**
 * Coin Change (Greedy - works for standard denominations)
 * Problem: Make change using minimum number of coins
 * Greedy Strategy: Use largest denomination first
 * Note: Only works for canonical coin systems (like US coins)
 */
function coinChangeGreedy(coins, amount) {
    coins.sort((a, b) => b - a); // Sort in descending order
    
    const result = [];
    let remaining = amount;
    
    for (let coin of coins) {
        while (remaining >= coin) {
            result.push(coin);
            remaining -= coin;
        }
    }
    
    return remaining === 0 ? result : null; // null if can't make exact change
}

/**
 * Job Scheduling with Deadlines
 * Problem: Schedule jobs to maximize profit within deadlines
 * Greedy Strategy: Sort by profit, schedule highest profit jobs first
 */
function jobScheduling(jobs) {
    // Sort jobs by profit in descending order
    jobs.sort((a, b) => b.profit - a.profit);
    
    const maxDeadline = Math.max(...jobs.map(job => job.deadline));
    const schedule = new Array(maxDeadline).fill(null);
    const selectedJobs = [];
    let totalProfit = 0;
    
    for (let job of jobs) {
        // Find latest available slot before deadline
        for (let slot = Math.min(job.deadline - 1, maxDeadline - 1); slot >= 0; slot--) {
            if (schedule[slot] === null) {
                schedule[slot] = job;
                selectedJobs.push(job);
                totalProfit += job.profit;
                break;
            }
        }
    }
    
    return { selectedJobs, totalProfit, schedule };
}

/**
 * Huffman Coding
 * Problem: Create optimal prefix-free binary codes
 * Greedy Strategy: Always merge two nodes with smallest frequencies
 */
class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }
    
    isLeaf() {
        return this.left === null && this.right === null;
    }
}

class MinHeap {
    constructor() {
        this.heap = [];
    }
    
    insert(node) {
        this.heap.push(node);
        this.heapifyUp(this.heap.length - 1);
    }
    
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        
        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }
    
    heapifyUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].freq <= this.heap[index].freq) break;
            
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
        }
    }
    
    heapifyDown(index) {
        while (true) {
            let smallest = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            
            if (leftChild < this.heap.length && 
                this.heap[leftChild].freq < this.heap[smallest].freq) {
                smallest = leftChild;
            }
            
            if (rightChild < this.heap.length && 
                this.heap[rightChild].freq < this.heap[smallest].freq) {
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
}

function huffmanCoding(text) {
    // Count character frequencies
    const freqMap = {};
    for (let char of text) {
        freqMap[char] = (freqMap[char] || 0) + 1;
    }
    
    // Create min heap with character nodes
    const heap = new MinHeap();
    for (let [char, freq] of Object.entries(freqMap)) {
        heap.insert(new HuffmanNode(char, freq));
    }
    
    // Build Huffman tree
    while (heap.size() > 1) {
        const left = heap.extractMin();
        const right = heap.extractMin();
        const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
        heap.insert(merged);
    }
    
    const root = heap.extractMin();
    
    // Generate codes
    const codes = {};
    
    function generateCodes(node, code = '') {
        if (node.isLeaf()) {
            codes[node.char] = code || '0'; // Handle single character case
            return;
        }
        
        if (node.left) generateCodes(node.left, code + '0');
        if (node.right) generateCodes(node.right, code + '1');
    }
    
    generateCodes(root);
    
    // Encode text
    const encoded = text.split('').map(char => codes[char]).join('');
    
    return { codes, encoded, root };
}

/**
 * Minimum Spanning Tree - Kruskal's Algorithm
 * Problem: Find minimum cost to connect all vertices
 * Greedy Strategy: Sort edges by weight, add edge if it doesn't create cycle
 */
class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
    
    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }
    
    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return false; // Already connected
        
        // Union by rank
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        
        return true;
    }
}

function kruskalMST(vertices, edges) {
    // Sort edges by weight
    edges.sort((a, b) => a.weight - b.weight);
    
    const uf = new UnionFind(vertices);
    const mst = [];
    let totalWeight = 0;
    
    for (let edge of edges) {
        if (uf.union(edge.from, edge.to)) {
            mst.push(edge);
            totalWeight += edge.weight;
            
            // MST complete when we have V-1 edges
            if (mst.length === vertices - 1) break;
        }
    }
    
    return { mst, totalWeight };
}

/**
 * Minimum Spanning Tree - Prim's Algorithm
 * Problem: Find minimum cost to connect all vertices
 * Greedy Strategy: Start from vertex, always add minimum weight edge to new vertex
 */
function primMST(graph) {
    const vertices = graph.length;
    const visited = new Array(vertices).fill(false);
    const minEdge = new Array(vertices).fill(Infinity);
    const parent = new Array(vertices).fill(-1);
    
    minEdge[0] = 0; // Start from vertex 0
    const mst = [];
    let totalWeight = 0;
    
    for (let count = 0; count < vertices; count++) {
        // Find minimum weight edge to unvisited vertex
        let u = -1;
        for (let v = 0; v < vertices; v++) {
            if (!visited[v] && (u === -1 || minEdge[v] < minEdge[u])) {
                u = v;
            }
        }
        
        visited[u] = true;
        
        if (parent[u] !== -1) {
            mst.push({ from: parent[u], to: u, weight: minEdge[u] });
            totalWeight += minEdge[u];
        }
        
        // Update minimum edges to adjacent vertices
        for (let v = 0; v < vertices; v++) {
            if (!visited[v] && graph[u][v] < minEdge[v]) {
                minEdge[v] = graph[u][v];
                parent[v] = u;
            }
        }
    }
    
    return { mst, totalWeight };
}

/**
 * Dijkstra's Shortest Path
 * Problem: Find shortest path from source to all vertices
 * Greedy Strategy: Always process vertex with minimum distance
 */
function dijkstra(graph, source) {
    const vertices = graph.length;
    const dist = new Array(vertices).fill(Infinity);
    const visited = new Array(vertices).fill(false);
    const parent = new Array(vertices).fill(-1);
    
    dist[source] = 0;
    
    for (let count = 0; count < vertices; count++) {
        // Find unvisited vertex with minimum distance
        let u = -1;
        for (let v = 0; v < vertices; v++) {
            if (!visited[v] && (u === -1 || dist[v] < dist[u])) {
                u = v;
            }
        }
        
        visited[u] = true;
        
        // Update distances to adjacent vertices
        for (let v = 0; v < vertices; v++) {
            if (!visited[v] && graph[u][v] !== 0 && 
                dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }
    
    return { distances: dist, parents: parent };
}

// ===== INTERVAL PROBLEMS =====

/**
 * Meeting Rooms II
 * Problem: Find minimum number of meeting rooms needed
 * Greedy Strategy: Sort by start time, use heap to track end times
 */
function minMeetingRooms(intervals) {
    if (intervals.length === 0) return 0;
    
    // Sort by start time
    intervals.sort((a, b) => a.start - b.start);
    
    // Min heap to track end times of ongoing meetings
    const endTimes = [];
    
    function insertHeap(time) {
        endTimes.push(time);
        let i = endTimes.length - 1;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (endTimes[parent] <= endTimes[i]) break;
            [endTimes[parent], endTimes[i]] = [endTimes[i], endTimes[parent]];
            i = parent;
        }
    }
    
    function extractMin() {
        if (endTimes.length === 1) return endTimes.pop();
        const min = endTimes[0];
        endTimes[0] = endTimes.pop();
        
        let i = 0;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            
            if (left < endTimes.length && endTimes[left] < endTimes[smallest]) {
                smallest = left;
            }
            if (right < endTimes.length && endTimes[right] < endTimes[smallest]) {
                smallest = right;
            }
            
            if (smallest === i) break;
            [endTimes[i], endTimes[smallest]] = [endTimes[smallest], endTimes[i]];
            i = smallest;
        }
        
        return min;
    }
    
    for (let interval of intervals) {
        // If current meeting starts after earliest ending meeting
        if (endTimes.length > 0 && interval.start >= endTimes[0]) {
            extractMin(); // Free up a room
        }
        insertHeap(interval.end); // Allocate room for current meeting
    }
    
    return endTimes.length;
}

/**
 * Non-overlapping Intervals
 * Problem: Remove minimum intervals to make rest non-overlapping
 * Greedy Strategy: Sort by end time, keep intervals that end earliest
 */
function eraseOverlapIntervals(intervals) {
    if (intervals.length <= 1) return 0;
    
    // Sort by end time
    intervals.sort((a, b) => a[1] - b[1]);
    
    let count = 0;
    let lastEnd = intervals[0][1];
    
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < lastEnd) {
            // Overlapping interval, remove it
            count++;
        } else {
            // Non-overlapping, update last end time
            lastEnd = intervals[i][1];
        }
    }
    
    return count;
}

// ===== STRING PROBLEMS =====

/**
 * Remove K Digits
 * Problem: Remove k digits to make smallest possible number
 * Greedy Strategy: Remove digits that make number larger (monotonic stack)
 */
function removeKdigits(num, k) {
    const stack = [];
    let toRemove = k;
    
    for (let digit of num) {
        // Remove larger digits from stack
        while (toRemove > 0 && stack.length > 0 && stack[stack.length - 1] > digit) {
            stack.pop();
            toRemove--;
        }
        stack.push(digit);
    }
    
    // Remove remaining digits from end
    while (toRemove > 0) {
        stack.pop();
        toRemove--;
    }
    
    // Build result, removing leading zeros
    const result = stack.join('').replace(/^0+/, '');
    return result === '' ? '0' : result;
}

/**
 * Gas Station
 * Problem: Find starting gas station to complete circular route
 * Greedy Strategy: If total gas >= total cost, solution exists
 */
function canCompleteCircuit(gas, cost) {
    let totalGas = 0;
    let totalCost = 0;
    let currentGas = 0;
    let start = 0;
    
    for (let i = 0; i < gas.length; i++) {
        totalGas += gas[i];
        totalCost += cost[i];
        currentGas += gas[i] - cost[i];
        
        // If we can't reach next station, start from next station
        if (currentGas < 0) {
            start = i + 1;
            currentGas = 0;
        }
    }
    
    return totalGas >= totalCost ? start : -1;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Greedy Algorithm Validator
 * Checks if greedy choice property holds for a problem
 */
function validateGreedyChoice(problem, testCases) {
    console.log(`Validating greedy choice for: ${problem}`);
    
    for (let testCase of testCases) {
        const greedyResult = testCase.greedyFunction(...testCase.input);
        const optimalResult = testCase.optimalFunction(...testCase.input);
        
        const isValid = JSON.stringify(greedyResult) === JSON.stringify(optimalResult);
        console.log(`Test case ${testCase.name}: ${isValid ? 'PASS' : 'FAIL'}`);
        
        if (!isValid) {
            console.log(`  Greedy: ${JSON.stringify(greedyResult)}`);
            console.log(`  Optimal: ${JSON.stringify(optimalResult)}`);
        }
    }
}

/**
 * Performance Comparison
 */
function compareAlgorithmPerformance(algorithms, input) {
    console.log('=== Algorithm Performance Comparison ===');
    
    for (let algo of algorithms) {
        console.time(algo.name);
        const result = algo.function(...input);
        console.timeEnd(algo.name);
        console.log(`${algo.name} result:`, result);
        console.log();
    }
}

/**
 * Greedy Problem Classifier
 */
function classifyGreedyProblem(description) {
    const patterns = {
        'scheduling': ['activity', 'job', 'meeting', 'interval'],
        'graph': ['spanning tree', 'shortest path', 'minimum cost'],
        'optimization': ['maximum', 'minimum', 'optimal'],
        'selection': ['choose', 'select', 'pick'],
        'partitioning': ['partition', 'divide', 'split'],
        'encoding': ['huffman', 'compression', 'coding']
    };
    
    for (let [category, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    
    return 'unknown';
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Greedy Algorithms Demo ===');

// Test Activity Selection
console.log('\n=== Activity Selection ===');
const activities = [
    { name: 'A1', start: 1, finish: 4 },
    { name: 'A2', start: 3, finish: 5 },
    { name: 'A3', start: 0, finish: 6 },
    { name: 'A4', start: 5, finish: 7 },
    { name: 'A5', start: 8, finish: 9 },
    { name: 'A6', start: 5, finish: 9 }
];
const selectedActivities = activitySelection(activities);
console.log('Selected activities:', selectedActivities.map(a => a.name));

// Test Fractional Knapsack
console.log('\n=== Fractional Knapsack ===');
const items = [
    { value: 60, weight: 10 },
    { value: 100, weight: 20 },
    { value: 120, weight: 30 }
];
const knapsackResult = fractionalKnapsack(items, 50);
console.log('Fractional Knapsack result:', knapsackResult);

// Test Coin Change
console.log('\n=== Coin Change (Greedy) ===');
const coins = [25, 10, 5, 1];
console.log('Change for 67:', coinChangeGreedy(coins, 67));
console.log('Change for 43:', coinChangeGreedy(coins, 43));

// Test Job Scheduling
console.log('\n=== Job Scheduling ===');
const jobs = [
    { id: 'J1', deadline: 4, profit: 20 },
    { id: 'J2', deadline: 1, profit: 10 },
    { id: 'J3', deadline: 1, profit: 40 },
    { id: 'J4', deadline: 1, profit: 30 }
];
const jobResult = jobScheduling(jobs);
console.log('Job scheduling result:', jobResult);

// Test Huffman Coding
console.log('\n=== Huffman Coding ===');
const text = 'hello world';
const huffmanResult = huffmanCoding(text);
console.log('Huffman codes:', huffmanResult.codes);
console.log('Encoded text:', huffmanResult.encoded);
console.log('Compression ratio:', (huffmanResult.encoded.length / (text.length * 8)).toFixed(2));

// Test MST
console.log('\n=== Minimum Spanning Tree ===');
const edges = [
    { from: 0, to: 1, weight: 10 },
    { from: 0, to: 2, weight: 6 },
    { from: 0, to: 3, weight: 5 },
    { from: 1, to: 3, weight: 15 },
    { from: 2, to: 3, weight: 4 }
];
const mstResult = kruskalMST(4, edges);
console.log('Kruskal MST:', mstResult);

// Test Dijkstra
console.log('\n=== Dijkstra Shortest Path ===');
const graph = [
    [0, 4, 0, 0, 0, 0, 0, 8, 0],
    [4, 0, 8, 0, 0, 0, 0, 11, 0],
    [0, 8, 0, 7, 0, 4, 0, 0, 2],
    [0, 0, 7, 0, 9, 14, 0, 0, 0],
    [0, 0, 0, 9, 0, 10, 0, 0, 0],
    [0, 0, 4, 14, 10, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 1, 6],
    [8, 11, 0, 0, 0, 0, 1, 0, 7],
    [0, 0, 2, 0, 0, 0, 6, 7, 0]
];
const dijkstraResult = dijkstra(graph, 0);
console.log('Shortest distances from vertex 0:', dijkstraResult.distances);

// Test Interval Problems
console.log('\n=== Interval Problems ===');
const meetings = [
    { start: 0, end: 30 },
    { start: 5, end: 10 },
    { start: 15, end: 20 }
];
console.log('Minimum meeting rooms needed:', minMeetingRooms(meetings));

const intervals = [[1, 2], [2, 3], [3, 4], [1, 3]];
console.log('Intervals to remove:', eraseOverlapIntervals(intervals));

// Test String Problems
console.log('\n=== String Problems ===');
console.log('Remove 3 digits from "1432219":', removeKdigits('1432219', 3));
console.log('Remove 1 digit from "10200":', removeKdigits('10200', 1));

const gas = [1, 2, 3, 4, 5];
const cost = [3, 4, 5, 1, 2];
console.log('Gas station starting point:', canCompleteCircuit(gas, cost));

// Problem classification
console.log('\n=== Problem Classification ===');
console.log('"Activity selection problem":', classifyGreedyProblem('Activity selection problem'));
console.log('"Find minimum spanning tree":', classifyGreedyProblem('Find minimum spanning tree'));
console.log('"Choose maximum profit jobs":', classifyGreedyProblem('Choose maximum profit jobs'));
console.log('"Huffman encoding algorithm":', classifyGreedyProblem('Huffman encoding algorithm'));

console.log('\n=== Greedy Strategy Guide ===');
console.log('1. Identify the greedy choice property');
console.log('2. Prove that greedy choice leads to optimal solution');
console.log('3. Sort input by appropriate criteria');
console.log('4. Make locally optimal choices');
console.log('5. Verify solution optimality');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <unordered_map>
#include <string>
#include <climits>
using namespace std;

// ===== CLASSIC GREEDY PROBLEMS =====

// Activity Selection
struct Activity {
    string name;
    int start, finish;
};

vector<Activity> activitySelection(vector<Activity> activities) {
    // Sort by finish time
    sort(activities.begin(), activities.end(), 
         [](const Activity& a, const Activity& b) {
             return a.finish < b.finish;
         });
    
    vector<Activity> selected;
    int lastFinishTime = 0;
    
    for (const auto& activity : activities) {
        if (activity.start >= lastFinishTime) {
            selected.push_back(activity);
            lastFinishTime = activity.finish;
        }
    }
    
    return selected;
}

// Fractional Knapsack
struct Item {
    int value, weight;
    double ratio;
};

struct KnapsackResult {
    double totalValue;
    vector<pair<Item, double>> solution; // item and fraction taken
};

KnapsackResult fractionalKnapsack(vector<Item> items, int capacity) {
    // Calculate ratios
    for (auto& item : items) {
        item.ratio = (double)item.value / item.weight;
    }
    
    // Sort by ratio in descending order
    sort(items.begin(), items.end(), 
         [](const Item& a, const Item& b) {
             return a.ratio > b.ratio;
         });
    
    KnapsackResult result;
    result.totalValue = 0;
    int remainingCapacity = capacity;
    
    for (const auto& item : items) {
        if (remainingCapacity == 0) break;
        
        if (item.weight <= remainingCapacity) {
            // Take entire item
            result.solution.push_back({item, 1.0});
            result.totalValue += item.value;
            remainingCapacity -= item.weight;
        } else {
            // Take fraction
            double fraction = (double)remainingCapacity / item.weight;
            result.solution.push_back({item, fraction});
            result.totalValue += item.value * fraction;
            remainingCapacity = 0;
        }
    }
    
    return result;
}

// Job Scheduling
struct Job {
    string id;
    int deadline, profit;
};

struct JobResult {
    vector<Job> selectedJobs;
    int totalProfit;
    vector<Job> schedule;
};

JobResult jobScheduling(vector<Job> jobs) {
    // Sort by profit in descending order
    sort(jobs.begin(), jobs.end(), 
         [](const Job& a, const Job& b) {
             return a.profit > b.profit;
         });
    
    int maxDeadline = 0;
    for (const auto& job : jobs) {
        maxDeadline = max(maxDeadline, job.deadline);
    }
    
    vector<Job> schedule(maxDeadline);
    vector<bool> occupied(maxDeadline, false);
    JobResult result;
    result.totalProfit = 0;
    
    for (const auto& job : jobs) {
        // Find latest available slot before deadline
        for (int slot = min(job.deadline - 1, maxDeadline - 1); slot >= 0; slot--) {
            if (!occupied[slot]) {
                schedule[slot] = job;
                occupied[slot] = true;
                result.selectedJobs.push_back(job);
                result.totalProfit += job.profit;
                break;
            }
        }
    }
    
    result.schedule = schedule;
    return result;
}

// Union-Find for Kruskal's Algorithm
class UnionFind {
public:
    vector<int> parent, rank;
    
    UnionFind(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }
    
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // Path compression
        }
        return parent[x];
    }
    
    bool unite(int x, int y) {
        int rootX = find(x), rootY = find(y);
        if (rootX == rootY) return false;
        
        // Union by rank
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
        
        return true;
    }
};

// Kruskal's MST
struct Edge {
    int from, to, weight;
};

struct MSTResult {
    vector<Edge> mst;
    int totalWeight;
};

MSTResult kruskalMST(int vertices, vector<Edge> edges) {
    // Sort edges by weight
    sort(edges.begin(), edges.end(), 
         [](const Edge& a, const Edge& b) {
             return a.weight < b.weight;
         });
    
    UnionFind uf(vertices);
    MSTResult result;
    result.totalWeight = 0;
    
    for (const auto& edge : edges) {
        if (uf.unite(edge.from, edge.to)) {
            result.mst.push_back(edge);
            result.totalWeight += edge.weight;
            
            if (result.mst.size() == vertices - 1) break;
        }
    }
    
    return result;
}

// Dijkstra's Algorithm
vector<int> dijkstra(vector<vector<int>>& graph, int source) {
    int vertices = graph.size();
    vector<int> dist(vertices, INT_MAX);
    vector<bool> visited(vertices, false);
    
    dist[source] = 0;
    
    for (int count = 0; count < vertices; count++) {
        // Find unvisited vertex with minimum distance
        int u = -1;
        for (int v = 0; v < vertices; v++) {
            if (!visited[v] && (u == -1 || dist[v] < dist[u])) {
                u = v;
            }
        }
        
        visited[u] = true;
        
        // Update distances
        for (int v = 0; v < vertices; v++) {
            if (!visited[v] && graph[u][v] != 0 && 
                dist[u] != INT_MAX && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }
    
    return dist;
}

// Meeting Rooms II
struct Interval {
    int start, end;
};

int minMeetingRooms(vector<Interval> intervals) {
    if (intervals.empty()) return 0;
    
    // Sort by start time
    sort(intervals.begin(), intervals.end(), 
         [](const Interval& a, const Interval& b) {
             return a.start < b.start;
         });
    
    // Min heap for end times
    priority_queue<int, vector<int>, greater<int>> endTimes;
    
    for (const auto& interval : intervals) {
        // If current meeting starts after earliest ending meeting
        if (!endTimes.empty() && interval.start >= endTimes.top()) {
            endTimes.pop(); // Free up a room
        }
        endTimes.push(interval.end); // Allocate room
    }
    
    return endTimes.size();
}

// Remove K Digits
string removeKdigits(string num, int k) {
    string stack;
    int toRemove = k;
    
    for (char digit : num) {
        // Remove larger digits
        while (toRemove > 0 && !stack.empty() && stack.back() > digit) {
            stack.pop_back();
            toRemove--;
        }
        stack.push_back(digit);
    }
    
    // Remove remaining digits from end
    while (toRemove > 0) {
        stack.pop_back();
        toRemove--;
    }
    
    // Remove leading zeros
    int start = 0;
    while (start < stack.length() && stack[start] == '0') {
        start++;
    }
    
    string result = stack.substr(start);
    return result.empty() ? "0" : result;
}

// Gas Station
int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int totalGas = 0, totalCost = 0, currentGas = 0, start = 0;
    
    for (int i = 0; i < gas.size(); i++) {
        totalGas += gas[i];
        totalCost += cost[i];
        currentGas += gas[i] - cost[i];
        
        if (currentGas < 0) {
            start = i + 1;
            currentGas = 0;
        }
    }
    
    return totalGas >= totalCost ? start : -1;
}

// ===== UTILITY FUNCTIONS =====

template<typename T>
void printVector(const vector<T>& vec, const string& label = "") {
    if (!label.empty()) {
        cout << label << ": ";
    }
    for (const auto& x : vec) {
        cout << x << " ";
    }
    cout << endl;
}

void printActivities(const vector<Activity>& activities) {
    for (const auto& activity : activities) {
        cout << activity.name << "(" << activity.start << "-" << activity.finish << ") ";
    }
    cout << endl;
}

void printJobs(const vector<Job>& jobs) {
    for (const auto& job : jobs) {
        cout << job.id << "(deadline:" << job.deadline << ", profit:" << job.profit << ") ";
    }
    cout << endl;
}

void printEdges(const vector<Edge>& edges) {
    for (const auto& edge : edges) {
        cout << edge.from << "-" << edge.to << "(" << edge.weight << ") ";
    }
    cout << endl;
}

// Example Usage
int main() {
    cout << "=== Greedy Algorithms Demo ===" << endl;
    
    // Test Activity Selection
    cout << "\n=== Activity Selection ===" << endl;
    vector<Activity> activities = {
        {"A1", 1, 4}, {"A2", 3, 5}, {"A3", 0, 6},
        {"A4", 5, 7}, {"A5", 8, 9}, {"A6", 5, 9}
    };
    auto selected = activitySelection(activities);
    cout << "Selected activities: ";
    printActivities(selected);
    
    // Test Fractional Knapsack
    cout << "\n=== Fractional Knapsack ===" << endl;
    vector<Item> items = {{60, 10, 0}, {100, 20, 0}, {120, 30, 0}};
    auto knapsackResult = fractionalKnapsack(items, 50);
    cout << "Total value: " << knapsackResult.totalValue << endl;
    
    // Test Job Scheduling
    cout << "\n=== Job Scheduling ===" << endl;
    vector<Job> jobs = {
        {"J1", 4, 20}, {"J2", 1, 10}, {"J3", 1, 40}, {"J4", 1, 30}
    };
    auto jobResult = jobScheduling(jobs);
    cout << "Selected jobs: ";
    printJobs(jobResult.selectedJobs);
    cout << "Total profit: " << jobResult.totalProfit << endl;
    
    // Test Kruskal's MST
    cout << "\n=== Kruskal's MST ===" << endl;
    vector<Edge> edges = {
        {0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}
    };
    auto mstResult = kruskalMST(4, edges);
    cout << "MST edges: ";
    printEdges(mstResult.mst);
    cout << "Total weight: " << mstResult.totalWeight << endl;
    
    // Test Dijkstra
    cout << "\n=== Dijkstra's Algorithm ===" << endl;
    vector<vector<int>> graph = {
        {0, 4, 0, 0, 0, 0, 0, 8, 0},
        {4, 0, 8, 0, 0, 0, 0, 11, 0},
        {0, 8, 0, 7, 0, 4, 0, 0, 2},
        {0, 0, 7, 0, 9, 14, 0, 0, 0},
        {0, 0, 0, 9, 0, 10, 0, 0, 0},
        {0, 0, 4, 14, 10, 0, 2, 0, 0},
        {0, 0, 0, 0, 0, 2, 0, 1, 6},
        {8, 11, 0, 0, 0, 0, 1, 0, 7},
        {0, 0, 2, 0, 0, 0, 6, 7, 0}
    };
    auto distances = dijkstra(graph, 0);
    cout << "Shortest distances from vertex 0: ";
    printVector(distances);
    
    // Test Meeting Rooms
    cout << "\n=== Meeting Rooms ===" << endl;
    vector<Interval> meetings = {{0, 30}, {5, 10}, {15, 20}};
    cout << "Minimum meeting rooms: " << minMeetingRooms(meetings) << endl;
    
    // Test Remove K Digits
    cout << "\n=== Remove K Digits ===" << endl;
    cout << "Remove 3 digits from '1432219': " << removeKdigits("1432219", 3) << endl;
    cout << "Remove 1 digit from '10200': " << removeKdigits("10200", 1) << endl;
    
    // Test Gas Station
    cout << "\n=== Gas Station ===" << endl;
    vector<int> gas = {1, 2, 3, 4, 5};
    vector<int> cost = {3, 4, 5, 1, 2};
    cout << "Starting gas station: " << canCompleteCircuit(gas, cost) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Comparison:

| Problem | Greedy Time | Optimal Time | Space | Notes |
|---------|-------------|--------------|-------|-------|
| **Activity Selection** | O(n log n) | O(2ⁿ) | O(1) | Sorting dominates |
| **Fractional Knapsack** | O(n log n) | O(n log n) | O(1) | Greedy is optimal |
| **Coin Change** | O(n) | O(amount × coins) | O(1) | Only for canonical systems |
| **Job Scheduling** | O(n log n) | O(2ⁿ) | O(n) | Sorting + scheduling |
| **MST (Kruskal)** | O(E log E) | O(E log E) | O(V) | Greedy is optimal |
| **MST (Prim)** | O(V²) | O(V²) | O(V) | With adjacency matrix |
| **Shortest Path** | O(V²) | O(V²) | O(V) | Dijkstra is optimal |

### Space Complexity:
- **Most greedy algorithms**: O(1) to O(n) auxiliary space
- **Graph algorithms**: O(V + E) for adjacency representation
- **Heap-based algorithms**: O(n) for priority queue

### When Greedy is Optimal:
1. **Greedy choice property**: Local optimum leads to global optimum
2. **Optimal substructure**: Problem exhibits optimal substructure
3. **No future dependencies**: Current choice doesn't affect future optimality

---

## 🧩 Practice Problems

### Problem 1: Jump Game II
**Question**: Find minimum jumps to reach end of array.
**Example**: `[2,3,1,1,4]` → 2 (jump 1 step from index 0 to 1, then 3 steps to last index)
**Hint**: Greedy - always jump to position that allows furthest reach

### Problem 2: Candy Distribution
**Question**: Distribute minimum candies to children with rating constraints.
**Example**: `[1,0,2]` → 5 (give [2,1,2] candies)
**Hint**: Two passes - left to right, then right to left

### Problem 3: Task Scheduler
**Question**: Find minimum time to execute tasks with cooldown period.
**Example**: `['A','A','A','B','B','B']`, n=2 → 8
**Hint**: Greedy scheduling with most frequent tasks first

### Problem 4: Minimum Number of Arrows
**Question**: Find minimum arrows to burst all balloons.
**Example**: `[[10,16],[2,8],[1,6],[7,12]]` → 2
**Hint**: Sort by end position, shoot arrow at earliest end

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Problem recognition**: Can you identify when greedy works?
2. **Proof of correctness**: Can you prove greedy choice property?
3. **Implementation**: Clean, efficient code
4. **Edge cases**: Handle empty inputs, single elements
5. **Optimization**: Can you optimize time/space complexity?

### Common Interview Patterns:
- **Interval problems**: Activity selection, meeting rooms
- **Graph problems**: MST, shortest path
- **Optimization problems**: Knapsack variants, scheduling
- **String problems**: Parentheses, digit removal
- **Array problems**: Jump game, candy distribution

### Red Flags to Avoid:
- Using greedy when it doesn't guarantee optimal solution
- Not proving greedy choice property
- Incorrect sorting criteria
- Missing edge cases
- Inefficient implementation

### Pro Tips:
1. **Identify the greedy choice**: What's the locally optimal decision?
2. **Prove correctness**: Show that greedy choice leads to optimal solution
3. **Sort when needed**: Many greedy algorithms require sorting
4. **Consider counterexamples**: Test if greedy always works
5. **Optimize implementation**: Use appropriate data structures
6. **Practice pattern recognition**: Learn common greedy problem types

---

## 🚀 Key Takeaways

1. **Greedy makes locally optimal choices** - Hope for globally optimal solution
2. **Not always optimal** - Must prove greedy choice property
3. **Often involves sorting** - Sort by appropriate criteria first
4. **Efficient when applicable** - Usually better time complexity than DP
5. **Pattern recognition crucial** - Learn to identify greedy problems
6. **Proof is important** - Always verify correctness

**Congratulations!** You've completed the Medium Complexity section of the DSA learning path. You now have a solid foundation in fundamental data structures and essential algorithms. The next step would be to work on the final mini-project that combines multiple concepts you've learned.

**Next Steps**: 
- Review all chapters and practice problems
- Work on the comprehensive mini-project
- Apply these concepts to real-world problems
- Continue with advanced topics like advanced graph algorithms, advanced DP, and system design