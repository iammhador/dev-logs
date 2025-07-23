# Chapter 10: Basic Graph Theory - Understanding Connected Data

## 🎯 What are Graphs?

**Graphs** are non-linear data structures consisting of vertices (nodes) connected by edges. They represent relationships between entities and are fundamental to modeling real-world problems like social networks, transportation systems, and computer networks.

### Why Graphs Matter:
- **Social networks**: Friends, followers, connections
- **Transportation**: Roads, flights, routes
- **Computer networks**: Internet, LANs, routing
- **Dependencies**: Task scheduling, package management
- **Recommendation systems**: User preferences, item relationships
- **Game development**: Pathfinding, AI decision trees

### Graph Components:
1. **Vertices (V)**: Nodes or points in the graph
2. **Edges (E)**: Connections between vertices
3. **Weight**: Optional value associated with edges
4. **Degree**: Number of edges connected to a vertex

---

## 📊 Graph Types & Properties

### Graph Classifications:

| Type | Description | Example | Use Cases |
|------|-------------|---------|----------|
| **Directed** | Edges have direction | Twitter follows | Web links, dependencies |
| **Undirected** | Edges are bidirectional | Facebook friends | Social networks, maps |
| **Weighted** | Edges have values | Road distances | Shortest path, cost optimization |
| **Unweighted** | All edges equal | Simple connections | Basic relationships |
| **Cyclic** | Contains cycles | Road networks | Most real-world graphs |
| **Acyclic** | No cycles | Family trees | Hierarchies, DAGs |
| **Connected** | Path exists between all vertices | Single network | Communication systems |
| **Disconnected** | Some vertices unreachable | Multiple networks | Isolated components |

### Special Graph Types:
- **Complete Graph**: Every vertex connected to every other vertex
- **Bipartite Graph**: Vertices can be divided into two disjoint sets
- **Tree**: Connected acyclic graph with V-1 edges
- **DAG (Directed Acyclic Graph)**: Directed graph with no cycles
- **Planar Graph**: Can be drawn without edge crossings

---

## 💻 JavaScript Implementation

```javascript
// Graph Representations and Basic Operations

// ===== GRAPH REPRESENTATIONS =====

// 1. ADJACENCY LIST REPRESENTATION
// Most common and space-efficient for sparse graphs
class GraphAdjacencyList {
    constructor(isDirected = false) {
        this.vertices = new Map(); // vertex -> list of neighbors
        this.isDirected = isDirected;
        this.vertexCount = 0;
        this.edgeCount = 0;
    }
    
    // Add vertex to graph
    addVertex(vertex) {
        if (!this.vertices.has(vertex)) {
            this.vertices.set(vertex, []);
            this.vertexCount++;
            return true;
        }
        return false; // Vertex already exists
    }
    
    // Remove vertex and all its edges
    removeVertex(vertex) {
        if (!this.vertices.has(vertex)) {
            return false;
        }
        
        // Remove all edges to this vertex
        for (let [v, neighbors] of this.vertices) {
            const index = neighbors.findIndex(neighbor => 
                (typeof neighbor === 'object' ? neighbor.vertex : neighbor) === vertex
            );
            if (index !== -1) {
                neighbors.splice(index, 1);
                this.edgeCount--;
            }
        }
        
        // Remove the vertex itself
        this.edgeCount -= this.vertices.get(vertex).length;
        this.vertices.delete(vertex);
        this.vertexCount--;
        return true;
    }
    
    // Add edge between two vertices
    addEdge(vertex1, vertex2, weight = 1) {
        // Ensure both vertices exist
        this.addVertex(vertex1);
        this.addVertex(vertex2);
        
        // Add edge from vertex1 to vertex2
        const neighbors1 = this.vertices.get(vertex1);
        if (weight === 1) {
            neighbors1.push(vertex2);
        } else {
            neighbors1.push({ vertex: vertex2, weight });
        }
        
        // If undirected, add reverse edge
        if (!this.isDirected) {
            const neighbors2 = this.vertices.get(vertex2);
            if (weight === 1) {
                neighbors2.push(vertex1);
            } else {
                neighbors2.push({ vertex: vertex1, weight });
            }
        }
        
        this.edgeCount++;
        return true;
    }
    
    // Remove edge between two vertices
    removeEdge(vertex1, vertex2) {
        if (!this.vertices.has(vertex1) || !this.vertices.has(vertex2)) {
            return false;
        }
        
        // Remove edge from vertex1 to vertex2
        const neighbors1 = this.vertices.get(vertex1);
        const index1 = neighbors1.findIndex(neighbor => 
            (typeof neighbor === 'object' ? neighbor.vertex : neighbor) === vertex2
        );
        
        if (index1 === -1) {
            return false; // Edge doesn't exist
        }
        
        neighbors1.splice(index1, 1);
        
        // If undirected, remove reverse edge
        if (!this.isDirected) {
            const neighbors2 = this.vertices.get(vertex2);
            const index2 = neighbors2.findIndex(neighbor => 
                (typeof neighbor === 'object' ? neighbor.vertex : neighbor) === vertex1
            );
            if (index2 !== -1) {
                neighbors2.splice(index2, 1);
            }
        }
        
        this.edgeCount--;
        return true;
    }
    
    // Check if edge exists
    hasEdge(vertex1, vertex2) {
        if (!this.vertices.has(vertex1)) {
            return false;
        }
        
        const neighbors = this.vertices.get(vertex1);
        return neighbors.some(neighbor => 
            (typeof neighbor === 'object' ? neighbor.vertex : neighbor) === vertex2
        );
    }
    
    // Get neighbors of a vertex
    getNeighbors(vertex) {
        return this.vertices.get(vertex) || [];
    }
    
    // Get all vertices
    getVertices() {
        return Array.from(this.vertices.keys());
    }
    
    // Get vertex degree
    getDegree(vertex) {
        if (!this.vertices.has(vertex)) {
            return 0;
        }
        return this.vertices.get(vertex).length;
    }
    
    // Print graph
    printGraph() {
        console.log(`Graph (${this.isDirected ? 'Directed' : 'Undirected'}):`);
        for (let [vertex, neighbors] of this.vertices) {
            const neighborStr = neighbors.map(neighbor => 
                typeof neighbor === 'object' ? `${neighbor.vertex}(${neighbor.weight})` : neighbor
            ).join(', ');
            console.log(`${vertex} -> [${neighborStr}]`);
        }
        console.log(`Vertices: ${this.vertexCount}, Edges: ${this.edgeCount}`);
    }
}

// 2. ADJACENCY MATRIX REPRESENTATION
// Good for dense graphs and when you need O(1) edge lookup
class GraphAdjacencyMatrix {
    constructor(maxVertices = 100, isDirected = false) {
        this.maxVertices = maxVertices;
        this.isDirected = isDirected;
        this.matrix = Array(maxVertices).fill(null).map(() => Array(maxVertices).fill(0));
        this.vertexMap = new Map(); // vertex -> index
        this.indexMap = new Map(); // index -> vertex
        this.vertexCount = 0;
        this.edgeCount = 0;
    }
    
    // Add vertex
    addVertex(vertex) {
        if (this.vertexMap.has(vertex) || this.vertexCount >= this.maxVertices) {
            return false;
        }
        
        const index = this.vertexCount;
        this.vertexMap.set(vertex, index);
        this.indexMap.set(index, vertex);
        this.vertexCount++;
        return true;
    }
    
    // Add edge
    addEdge(vertex1, vertex2, weight = 1) {
        if (!this.vertexMap.has(vertex1) || !this.vertexMap.has(vertex2)) {
            return false;
        }
        
        const index1 = this.vertexMap.get(vertex1);
        const index2 = this.vertexMap.get(vertex2);
        
        // Add edge
        if (this.matrix[index1][index2] === 0) {
            this.edgeCount++;
        }
        this.matrix[index1][index2] = weight;
        
        // If undirected, add reverse edge
        if (!this.isDirected) {
            this.matrix[index2][index1] = weight;
        }
        
        return true;
    }
    
    // Remove edge
    removeEdge(vertex1, vertex2) {
        if (!this.vertexMap.has(vertex1) || !this.vertexMap.has(vertex2)) {
            return false;
        }
        
        const index1 = this.vertexMap.get(vertex1);
        const index2 = this.vertexMap.get(vertex2);
        
        if (this.matrix[index1][index2] !== 0) {
            this.matrix[index1][index2] = 0;
            if (!this.isDirected) {
                this.matrix[index2][index1] = 0;
            }
            this.edgeCount--;
            return true;
        }
        
        return false;
    }
    
    // Check if edge exists
    hasEdge(vertex1, vertex2) {
        if (!this.vertexMap.has(vertex1) || !this.vertexMap.has(vertex2)) {
            return false;
        }
        
        const index1 = this.vertexMap.get(vertex1);
        const index2 = this.vertexMap.get(vertex2);
        return this.matrix[index1][index2] !== 0;
    }
    
    // Get neighbors
    getNeighbors(vertex) {
        if (!this.vertexMap.has(vertex)) {
            return [];
        }
        
        const index = this.vertexMap.get(vertex);
        const neighbors = [];
        
        for (let i = 0; i < this.vertexCount; i++) {
            if (this.matrix[index][i] !== 0) {
                const neighborVertex = this.indexMap.get(i);
                const weight = this.matrix[index][i];
                if (weight === 1) {
                    neighbors.push(neighborVertex);
                } else {
                    neighbors.push({ vertex: neighborVertex, weight });
                }
            }
        }
        
        return neighbors;
    }
    
    // Print matrix
    printMatrix() {
        console.log('Adjacency Matrix:');
        const vertices = Array.from(this.indexMap.values());
        
        // Print header
        console.log('   ', vertices.join('  '));
        
        // Print rows
        for (let i = 0; i < this.vertexCount; i++) {
            const row = this.matrix[i].slice(0, this.vertexCount);
            console.log(`${vertices[i]}:  ${row.join('  ')}`);
        }
    }
}

// ===== GRAPH TRAVERSAL ALGORITHMS =====

// 1. DEPTH-FIRST SEARCH (DFS)
// Explores as far as possible before backtracking
class GraphDFS {
    // Recursive DFS
    static dfsRecursive(graph, startVertex, visited = new Set(), result = []) {
        visited.add(startVertex);
        result.push(startVertex);
        
        const neighbors = graph.getNeighbors(startVertex);
        for (let neighbor of neighbors) {
            const vertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
            if (!visited.has(vertex)) {
                GraphDFS.dfsRecursive(graph, vertex, visited, result);
            }
        }
        
        return result;
    }
    
    // Iterative DFS using stack
    static dfsIterative(graph, startVertex) {
        const visited = new Set();
        const result = [];
        const stack = [startVertex];
        
        while (stack.length > 0) {
            const vertex = stack.pop();
            
            if (!visited.has(vertex)) {
                visited.add(vertex);
                result.push(vertex);
                
                // Add neighbors to stack (in reverse order for consistent traversal)
                const neighbors = graph.getNeighbors(vertex);
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    const neighbor = neighbors[i];
                    const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                    if (!visited.has(neighborVertex)) {
                        stack.push(neighborVertex);
                    }
                }
            }
        }
        
        return result;
    }
    
    // DFS to find path between two vertices
    static findPath(graph, start, end, visited = new Set(), path = []) {
        visited.add(start);
        path.push(start);
        
        if (start === end) {
            return [...path]; // Return copy of path
        }
        
        const neighbors = graph.getNeighbors(start);
        for (let neighbor of neighbors) {
            const vertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
            if (!visited.has(vertex)) {
                const result = GraphDFS.findPath(graph, vertex, end, visited, path);
                if (result) {
                    return result;
                }
            }
        }
        
        path.pop(); // Backtrack
        return null;
    }
    
    // DFS to find all paths between two vertices
    static findAllPaths(graph, start, end, visited = new Set(), path = [], allPaths = []) {
        visited.add(start);
        path.push(start);
        
        if (start === end) {
            allPaths.push([...path]);
        } else {
            const neighbors = graph.getNeighbors(start);
            for (let neighbor of neighbors) {
                const vertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                if (!visited.has(vertex)) {
                    GraphDFS.findAllPaths(graph, vertex, end, visited, path, allPaths);
                }
            }
        }
        
        path.pop();
        visited.delete(start);
        return allPaths;
    }
    
    // Check if graph is connected (for undirected graphs)
    static isConnected(graph) {
        const vertices = graph.getVertices();
        if (vertices.length === 0) return true;
        
        const visited = GraphDFS.dfsRecursive(graph, vertices[0]);
        return visited.length === vertices.length;
    }
    
    // Detect cycle in undirected graph
    static hasCycleUndirected(graph) {
        const visited = new Set();
        const vertices = graph.getVertices();
        
        function dfsCheckCycle(vertex, parent) {
            visited.add(vertex);
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                
                if (!visited.has(neighborVertex)) {
                    if (dfsCheckCycle(neighborVertex, vertex)) {
                        return true;
                    }
                } else if (neighborVertex !== parent) {
                    return true; // Back edge found
                }
            }
            
            return false;
        }
        
        for (let vertex of vertices) {
            if (!visited.has(vertex)) {
                if (dfsCheckCycle(vertex, null)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Detect cycle in directed graph
    static hasCycleDirected(graph) {
        const visited = new Set();
        const recursionStack = new Set();
        const vertices = graph.getVertices();
        
        function dfsCheckCycle(vertex) {
            visited.add(vertex);
            recursionStack.add(vertex);
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                
                if (!visited.has(neighborVertex)) {
                    if (dfsCheckCycle(neighborVertex)) {
                        return true;
                    }
                } else if (recursionStack.has(neighborVertex)) {
                    return true; // Back edge in recursion stack
                }
            }
            
            recursionStack.delete(vertex);
            return false;
        }
        
        for (let vertex of vertices) {
            if (!visited.has(vertex)) {
                if (dfsCheckCycle(vertex)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}

// 2. BREADTH-FIRST SEARCH (BFS)
// Explores neighbors level by level
class GraphBFS {
    // Basic BFS traversal
    static bfs(graph, startVertex) {
        const visited = new Set();
        const result = [];
        const queue = [startVertex];
        
        visited.add(startVertex);
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            result.push(vertex);
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                if (!visited.has(neighborVertex)) {
                    visited.add(neighborVertex);
                    queue.push(neighborVertex);
                }
            }
        }
        
        return result;
    }
    
    // BFS to find shortest path (unweighted graph)
    static shortestPath(graph, start, end) {
        if (start === end) {
            return [start];
        }
        
        const visited = new Set();
        const queue = [[start]];
        visited.add(start);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const vertex = path[path.length - 1];
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                
                if (neighborVertex === end) {
                    return [...path, neighborVertex];
                }
                
                if (!visited.has(neighborVertex)) {
                    visited.add(neighborVertex);
                    queue.push([...path, neighborVertex]);
                }
            }
        }
        
        return null; // No path found
    }
    
    // BFS to find shortest distance
    static shortestDistance(graph, start, end) {
        if (start === end) {
            return 0;
        }
        
        const visited = new Set();
        const queue = [{ vertex: start, distance: 0 }];
        visited.add(start);
        
        while (queue.length > 0) {
            const { vertex, distance } = queue.shift();
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                
                if (neighborVertex === end) {
                    return distance + 1;
                }
                
                if (!visited.has(neighborVertex)) {
                    visited.add(neighborVertex);
                    queue.push({ vertex: neighborVertex, distance: distance + 1 });
                }
            }
        }
        
        return -1; // No path found
    }
    
    // BFS level-order traversal
    static levelOrder(graph, startVertex) {
        const visited = new Set();
        const result = [];
        const queue = [{ vertex: startVertex, level: 0 }];
        visited.add(startVertex);
        
        while (queue.length > 0) {
            const { vertex, level } = queue.shift();
            
            // Ensure result array has enough levels
            while (result.length <= level) {
                result.push([]);
            }
            
            result[level].push(vertex);
            
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                if (!visited.has(neighborVertex)) {
                    visited.add(neighborVertex);
                    queue.push({ vertex: neighborVertex, level: level + 1 });
                }
            }
        }
        
        return result;
    }
    
    // Check if graph is bipartite
    static isBipartite(graph) {
        const color = new Map();
        const vertices = graph.getVertices();
        
        for (let startVertex of vertices) {
            if (color.has(startVertex)) continue;
            
            const queue = [startVertex];
            color.set(startVertex, 0);
            
            while (queue.length > 0) {
                const vertex = queue.shift();
                const currentColor = color.get(vertex);
                
                const neighbors = graph.getNeighbors(vertex);
                for (let neighbor of neighbors) {
                    const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                    
                    if (!color.has(neighborVertex)) {
                        color.set(neighborVertex, 1 - currentColor);
                        queue.push(neighborVertex);
                    } else if (color.get(neighborVertex) === currentColor) {
                        return false; // Same color adjacent vertices
                    }
                }
            }
        }
        
        return true;
    }
}

// ===== GRAPH UTILITIES =====

class GraphUtils {
    // Create graph from edge list
    static fromEdgeList(edges, isDirected = false) {
        const graph = new GraphAdjacencyList(isDirected);
        
        for (let edge of edges) {
            if (edge.length === 2) {
                graph.addEdge(edge[0], edge[1]);
            } else if (edge.length === 3) {
                graph.addEdge(edge[0], edge[1], edge[2]);
            }
        }
        
        return graph;
    }
    
    // Convert to edge list
    static toEdgeList(graph) {
        const edges = [];
        const vertices = graph.getVertices();
        const visited = new Set();
        
        for (let vertex of vertices) {
            const neighbors = graph.getNeighbors(vertex);
            for (let neighbor of neighbors) {
                const neighborVertex = typeof neighbor === 'object' ? neighbor.vertex : neighbor;
                const weight = typeof neighbor === 'object' ? neighbor.weight : 1;
                
                const edgeKey = graph.isDirected ? 
                    `${vertex}->${neighborVertex}` : 
                    [vertex, neighborVertex].sort().join('-');
                
                if (!visited.has(edgeKey)) {
                    visited.add(edgeKey);
                    if (weight === 1) {
                        edges.push([vertex, neighborVertex]);
                    } else {
                        edges.push([vertex, neighborVertex, weight]);
                    }
                }
            }
        }
        
        return edges;
    }
    
    // Find connected components
    static findConnectedComponents(graph) {
        const visited = new Set();
        const components = [];
        const vertices = graph.getVertices();
        
        for (let vertex of vertices) {
            if (!visited.has(vertex)) {
                const component = GraphDFS.dfsRecursive(graph, vertex, visited);
                components.push(component);
            }
        }
        
        return components;
    }
    
    // Calculate graph density
    static calculateDensity(graph) {
        const V = graph.vertexCount;
        const E = graph.edgeCount;
        
        if (V <= 1) return 0;
        
        const maxEdges = graph.isDirected ? V * (V - 1) : V * (V - 1) / 2;
        return E / maxEdges;
    }
    
    // Generate random graph
    static generateRandomGraph(numVertices, edgeProbability = 0.3, isDirected = false) {
        const graph = new GraphAdjacencyList(isDirected);
        
        // Add vertices
        for (let i = 0; i < numVertices; i++) {
            graph.addVertex(i);
        }
        
        // Add random edges
        for (let i = 0; i < numVertices; i++) {
            for (let j = isDirected ? 0 : i + 1; j < numVertices; j++) {
                if (i !== j && Math.random() < edgeProbability) {
                    graph.addEdge(i, j);
                }
            }
        }
        
        return graph;
    }
    
    // Performance comparison
    static compareRepresentations(numVertices, numEdges) {
        console.log('=== Graph Representation Comparison ===');
        
        // Create same graph in both representations
        const adjList = new GraphAdjacencyList();
        const adjMatrix = new GraphAdjacencyMatrix(numVertices);
        
        // Add vertices
        for (let i = 0; i < numVertices; i++) {
            adjList.addVertex(i);
            adjMatrix.addVertex(i);
        }
        
        // Add random edges
        const edges = [];
        for (let i = 0; i < numEdges; i++) {
            const v1 = Math.floor(Math.random() * numVertices);
            const v2 = Math.floor(Math.random() * numVertices);
            if (v1 !== v2) {
                edges.push([v1, v2]);
            }
        }
        
        // Measure edge addition time
        console.time('Adjacency List - Add Edges');
        for (let [v1, v2] of edges) {
            adjList.addEdge(v1, v2);
        }
        console.timeEnd('Adjacency List - Add Edges');
        
        console.time('Adjacency Matrix - Add Edges');
        for (let [v1, v2] of edges) {
            adjMatrix.addEdge(v1, v2);
        }
        console.timeEnd('Adjacency Matrix - Add Edges');
        
        // Measure edge lookup time
        const testEdge = edges[0];
        
        console.time('Adjacency List - Edge Lookup');
        for (let i = 0; i < 1000; i++) {
            adjList.hasEdge(testEdge[0], testEdge[1]);
        }
        console.timeEnd('Adjacency List - Edge Lookup');
        
        console.time('Adjacency Matrix - Edge Lookup');
        for (let i = 0; i < 1000; i++) {
            adjMatrix.hasEdge(testEdge[0], testEdge[1]);
        }
        console.timeEnd('Adjacency Matrix - Edge Lookup');
        
        // Space usage estimation
        const listSpace = numVertices + 2 * numEdges; // Rough estimate
        const matrixSpace = numVertices * numVertices;
        
        console.log(`\nSpace Usage Estimation:`);
        console.log(`Adjacency List: ~${listSpace} units`);
        console.log(`Adjacency Matrix: ~${matrixSpace} units`);
        console.log(`Density: ${(numEdges / (numVertices * (numVertices - 1) / 2) * 100).toFixed(2)}%`);
    }
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Basic Graph Theory Demo ===');

// Create undirected graph
const graph = new GraphAdjacencyList(false);

// Add vertices
['A', 'B', 'C', 'D', 'E'].forEach(v => graph.addVertex(v));

// Add edges
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
graph.addEdge('B', 'D');
graph.addEdge('C', 'D');
graph.addEdge('D', 'E');

console.log('\n=== Graph Structure ===');
graph.printGraph();

console.log('\n=== Graph Traversals ===');
console.log('DFS (Recursive):', GraphDFS.dfsRecursive(graph, 'A'));
console.log('DFS (Iterative):', GraphDFS.dfsIterative(graph, 'A'));
console.log('BFS:', GraphBFS.bfs(graph, 'A'));
console.log('BFS Level Order:', GraphBFS.levelOrder(graph, 'A'));

console.log('\n=== Path Finding ===');
console.log('Path A to E:', GraphDFS.findPath(graph, 'A', 'E'));
console.log('All paths A to E:', GraphDFS.findAllPaths(graph, 'A', 'E'));
console.log('Shortest path A to E:', GraphBFS.shortestPath(graph, 'A', 'E'));
console.log('Shortest distance A to E:', GraphBFS.shortestDistance(graph, 'A', 'E'));

console.log('\n=== Graph Properties ===');
console.log('Is connected:', GraphDFS.isConnected(graph));
console.log('Has cycle:', GraphDFS.hasCycleUndirected(graph));
console.log('Is bipartite:', GraphBFS.isBipartite(graph));
console.log('Connected components:', GraphUtils.findConnectedComponents(graph));
console.log('Graph density:', GraphUtils.calculateDensity(graph).toFixed(3));

// Create directed graph for cycle detection
const directedGraph = new GraphAdjacencyList(true);
['X', 'Y', 'Z'].forEach(v => directedGraph.addVertex(v));
directedGraph.addEdge('X', 'Y');
directedGraph.addEdge('Y', 'Z');
directedGraph.addEdge('Z', 'X'); // Creates cycle

console.log('\n=== Directed Graph ===');
directedGraph.printGraph();
console.log('Has cycle (directed):', GraphDFS.hasCycleDirected(directedGraph));

// Weighted graph example
const weightedGraph = new GraphAdjacencyList(false);
['P', 'Q', 'R', 'S'].forEach(v => weightedGraph.addVertex(v));
weightedGraph.addEdge('P', 'Q', 5);
weightedGraph.addEdge('P', 'R', 3);
weightedGraph.addEdge('Q', 'S', 2);
weightedGraph.addEdge('R', 'S', 7);

console.log('\n=== Weighted Graph ===');
weightedGraph.printGraph();

// Adjacency matrix example
const matrixGraph = new GraphAdjacencyMatrix(5, false);
[0, 1, 2, 3, 4].forEach(v => matrixGraph.addVertex(v));
matrixGraph.addEdge(0, 1);
matrixGraph.addEdge(0, 2);
matrixGraph.addEdge(1, 3);
matrixGraph.addEdge(2, 3);
matrixGraph.addEdge(3, 4);

console.log('\n=== Adjacency Matrix ===');
matrixGraph.printMatrix();

// Edge list conversion
console.log('\n=== Edge List Conversion ===');
const edgeList = GraphUtils.toEdgeList(graph);
console.log('Edge list:', edgeList);

const graphFromEdges = GraphUtils.fromEdgeList(edgeList);
console.log('Graph from edge list:');
graphFromEdges.printGraph();

// Performance comparison
console.log('\n=== Performance Comparison ===');
GraphUtils.compareRepresentations(100, 200);

// Random graph generation
console.log('\n=== Random Graph ===');
const randomGraph = GraphUtils.generateRandomGraph(6, 0.4);
randomGraph.printGraph();
console.log('Random graph properties:');
console.log('- Connected components:', GraphUtils.findConnectedComponents(randomGraph).length);
console.log('- Density:', GraphUtils.calculateDensity(randomGraph).toFixed(3));
console.log('- Has cycle:', GraphDFS.hasCycleUndirected(randomGraph));
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <list>
#include <queue>
#include <stack>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <chrono>
using namespace std;
using namespace std::chrono;

// ===== ADJACENCY LIST REPRESENTATION =====

class GraphAdjacencyList {
private:
    unordered_map<int, list<pair<int, int>>> adjList; // vertex -> list of (neighbor, weight)
    bool isDirected;
    int vertexCount;
    int edgeCount;
    
public:
    GraphAdjacencyList(bool directed = false) : isDirected(directed), vertexCount(0), edgeCount(0) {}
    
    // Add vertex
    bool addVertex(int vertex) {
        if (adjList.find(vertex) == adjList.end()) {
            adjList[vertex] = list<pair<int, int>>();
            vertexCount++;
            return true;
        }
        return false;
    }
    
    // Add edge
    bool addEdge(int vertex1, int vertex2, int weight = 1) {
        addVertex(vertex1);
        addVertex(vertex2);
        
        adjList[vertex1].push_back({vertex2, weight});
        
        if (!isDirected) {
            adjList[vertex2].push_back({vertex1, weight});
        }
        
        edgeCount++;
        return true;
    }
    
    // Remove edge
    bool removeEdge(int vertex1, int vertex2) {
        if (adjList.find(vertex1) == adjList.end() || adjList.find(vertex2) == adjList.end()) {
            return false;
        }
        
        auto& neighbors1 = adjList[vertex1];
        auto it1 = find_if(neighbors1.begin(), neighbors1.end(),
                          [vertex2](const pair<int, int>& p) { return p.first == vertex2; });
        
        if (it1 == neighbors1.end()) {
            return false;
        }
        
        neighbors1.erase(it1);
        
        if (!isDirected) {
            auto& neighbors2 = adjList[vertex2];
            auto it2 = find_if(neighbors2.begin(), neighbors2.end(),
                              [vertex1](const pair<int, int>& p) { return p.first == vertex1; });
            if (it2 != neighbors2.end()) {
                neighbors2.erase(it2);
            }
        }
        
        edgeCount--;
        return true;
    }
    
    // Check if edge exists
    bool hasEdge(int vertex1, int vertex2) {
        if (adjList.find(vertex1) == adjList.end()) {
            return false;
        }
        
        const auto& neighbors = adjList[vertex1];
        return find_if(neighbors.begin(), neighbors.end(),
                      [vertex2](const pair<int, int>& p) { return p.first == vertex2; }) != neighbors.end();
    }
    
    // Get neighbors
    vector<pair<int, int>> getNeighbors(int vertex) {
        if (adjList.find(vertex) == adjList.end()) {
            return {};
        }
        
        vector<pair<int, int>> neighbors;
        for (const auto& neighbor : adjList[vertex]) {
            neighbors.push_back(neighbor);
        }
        return neighbors;
    }
    
    // Get all vertices
    vector<int> getVertices() {
        vector<int> vertices;
        for (const auto& pair : adjList) {
            vertices.push_back(pair.first);
        }
        return vertices;
    }
    
    // Print graph
    void printGraph() {
        cout << "Graph (" << (isDirected ? "Directed" : "Undirected") << "):" << endl;
        for (const auto& vertex : adjList) {
            cout << vertex.first << " -> [";
            bool first = true;
            for (const auto& neighbor : vertex.second) {
                if (!first) cout << ", ";
                if (neighbor.second == 1) {
                    cout << neighbor.first;
                } else {
                    cout << neighbor.first << "(" << neighbor.second << ")";
                }
                first = false;
            }
            cout << "]" << endl;
        }
        cout << "Vertices: " << vertexCount << ", Edges: " << edgeCount << endl;
    }
    
    // Getters
    int getVertexCount() const { return vertexCount; }
    int getEdgeCount() const { return edgeCount; }
    bool getIsDirected() const { return isDirected; }
};

// ===== ADJACENCY MATRIX REPRESENTATION =====

class GraphAdjacencyMatrix {
private:
    vector<vector<int>> matrix;
    unordered_map<int, int> vertexToIndex;
    unordered_map<int, int> indexToVertex;
    bool isDirected;
    int maxVertices;
    int vertexCount;
    int edgeCount;
    
public:
    GraphAdjacencyMatrix(int maxVert = 100, bool directed = false) 
        : maxVertices(maxVert), isDirected(directed), vertexCount(0), edgeCount(0) {
        matrix.resize(maxVertices, vector<int>(maxVertices, 0));
    }
    
    // Add vertex
    bool addVertex(int vertex) {
        if (vertexToIndex.find(vertex) != vertexToIndex.end() || vertexCount >= maxVertices) {
            return false;
        }
        
        int index = vertexCount;
        vertexToIndex[vertex] = index;
        indexToVertex[index] = vertex;
        vertexCount++;
        return true;
    }
    
    // Add edge
    bool addEdge(int vertex1, int vertex2, int weight = 1) {
        if (vertexToIndex.find(vertex1) == vertexToIndex.end() || 
            vertexToIndex.find(vertex2) == vertexToIndex.end()) {
            return false;
        }
        
        int index1 = vertexToIndex[vertex1];
        int index2 = vertexToIndex[vertex2];
        
        if (matrix[index1][index2] == 0) {
            edgeCount++;
        }
        
        matrix[index1][index2] = weight;
        
        if (!isDirected) {
            matrix[index2][index1] = weight;
        }
        
        return true;
    }
    
    // Check if edge exists
    bool hasEdge(int vertex1, int vertex2) {
        if (vertexToIndex.find(vertex1) == vertexToIndex.end() || 
            vertexToIndex.find(vertex2) == vertexToIndex.end()) {
            return false;
        }
        
        int index1 = vertexToIndex[vertex1];
        int index2 = vertexToIndex[vertex2];
        return matrix[index1][index2] != 0;
    }
    
    // Print matrix
    void printMatrix() {
        cout << "Adjacency Matrix:" << endl;
        
        // Print header
        cout << "   ";
        for (int i = 0; i < vertexCount; i++) {
            cout << indexToVertex[i] << "  ";
        }
        cout << endl;
        
        // Print rows
        for (int i = 0; i < vertexCount; i++) {
            cout << indexToVertex[i] << ": ";
            for (int j = 0; j < vertexCount; j++) {
                cout << matrix[i][j] << "  ";
            }
            cout << endl;
        }
    }
};

// ===== GRAPH TRAVERSAL ALGORITHMS =====

// DFS Implementation
class GraphDFS {
public:
    // Recursive DFS
    static vector<int> dfsRecursive(GraphAdjacencyList& graph, int startVertex) {
        unordered_set<int> visited;
        vector<int> result;
        dfsRecursiveHelper(graph, startVertex, visited, result);
        return result;
    }
    
private:
    static void dfsRecursiveHelper(GraphAdjacencyList& graph, int vertex, 
                                  unordered_set<int>& visited, vector<int>& result) {
        visited.insert(vertex);
        result.push_back(vertex);
        
        auto neighbors = graph.getNeighbors(vertex);
        for (const auto& neighbor : neighbors) {
            if (visited.find(neighbor.first) == visited.end()) {
                dfsRecursiveHelper(graph, neighbor.first, visited, result);
            }
        }
    }
    
public:
    // Iterative DFS
    static vector<int> dfsIterative(GraphAdjacencyList& graph, int startVertex) {
        unordered_set<int> visited;
        vector<int> result;
        stack<int> stk;
        
        stk.push(startVertex);
        
        while (!stk.empty()) {
            int vertex = stk.top();
            stk.pop();
            
            if (visited.find(vertex) == visited.end()) {
                visited.insert(vertex);
                result.push_back(vertex);
                
                auto neighbors = graph.getNeighbors(vertex);
                for (auto it = neighbors.rbegin(); it != neighbors.rend(); ++it) {
                    if (visited.find(it->first) == visited.end()) {
                        stk.push(it->first);
                    }
                }
            }
        }
        
        return result;
    }
    
    // Find path between two vertices
    static vector<int> findPath(GraphAdjacencyList& graph, int start, int end) {
        unordered_set<int> visited;
        vector<int> path;
        
        if (findPathHelper(graph, start, end, visited, path)) {
            return path;
        }
        
        return {}; // No path found
    }
    
private:
    static bool findPathHelper(GraphAdjacencyList& graph, int current, int end,
                              unordered_set<int>& visited, vector<int>& path) {
        visited.insert(current);
        path.push_back(current);
        
        if (current == end) {
            return true;
        }
        
        auto neighbors = graph.getNeighbors(current);
        for (const auto& neighbor : neighbors) {
            if (visited.find(neighbor.first) == visited.end()) {
                if (findPathHelper(graph, neighbor.first, end, visited, path)) {
                    return true;
                }
            }
        }
        
        path.pop_back(); // Backtrack
        return false;
    }
    
public:
    // Check if graph has cycle (undirected)
    static bool hasCycleUndirected(GraphAdjacencyList& graph) {
        unordered_set<int> visited;
        auto vertices = graph.getVertices();
        
        for (int vertex : vertices) {
            if (visited.find(vertex) == visited.end()) {
                if (hasCycleUndirectedHelper(graph, vertex, -1, visited)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
private:
    static bool hasCycleUndirectedHelper(GraphAdjacencyList& graph, int vertex, int parent,
                                        unordered_set<int>& visited) {
        visited.insert(vertex);
        
        auto neighbors = graph.getNeighbors(vertex);
        for (const auto& neighbor : neighbors) {
            if (visited.find(neighbor.first) == visited.end()) {
                if (hasCycleUndirectedHelper(graph, neighbor.first, vertex, visited)) {
                    return true;
                }
            } else if (neighbor.first != parent) {
                return true; // Back edge found
            }
        }
        
        return false;
    }
};

// BFS Implementation
class GraphBFS {
public:
    // Basic BFS
    static vector<int> bfs(GraphAdjacencyList& graph, int startVertex) {
        unordered_set<int> visited;
        vector<int> result;
        queue<int> q;
        
        visited.insert(startVertex);
        q.push(startVertex);
        
        while (!q.empty()) {
            int vertex = q.front();
            q.pop();
            result.push_back(vertex);
            
            auto neighbors = graph.getNeighbors(vertex);
            for (const auto& neighbor : neighbors) {
                if (visited.find(neighbor.first) == visited.end()) {
                    visited.insert(neighbor.first);
                    q.push(neighbor.first);
                }
            }
        }
        
        return result;
    }
    
    // Find shortest path (unweighted)
    static vector<int> shortestPath(GraphAdjacencyList& graph, int start, int end) {
        if (start == end) {
            return {start};
        }
        
        unordered_set<int> visited;
        queue<vector<int>> q;
        
        visited.insert(start);
        q.push({start});
        
        while (!q.empty()) {
            vector<int> path = q.front();
            q.pop();
            
            int vertex = path.back();
            auto neighbors = graph.getNeighbors(vertex);
            
            for (const auto& neighbor : neighbors) {
                if (neighbor.first == end) {
                    path.push_back(neighbor.first);
                    return path;
                }
                
                if (visited.find(neighbor.first) == visited.end()) {
                    visited.insert(neighbor.first);
                    vector<int> newPath = path;
                    newPath.push_back(neighbor.first);
                    q.push(newPath);
                }
            }
        }
        
        return {}; // No path found
    }
    
    // Find shortest distance
    static int shortestDistance(GraphAdjacencyList& graph, int start, int end) {
        if (start == end) {
            return 0;
        }
        
        unordered_set<int> visited;
        queue<pair<int, int>> q; // vertex, distance
        
        visited.insert(start);
        q.push({start, 0});
        
        while (!q.empty()) {
            auto [vertex, distance] = q.front();
            q.pop();
            
            auto neighbors = graph.getNeighbors(vertex);
            for (const auto& neighbor : neighbors) {
                if (neighbor.first == end) {
                    return distance + 1;
                }
                
                if (visited.find(neighbor.first) == visited.end()) {
                    visited.insert(neighbor.first);
                    q.push({neighbor.first, distance + 1});
                }
            }
        }
        
        return -1; // No path found
    }
};

// Utility functions
void printVector(const vector<int>& vec, const string& label = "") {
    if (!label.empty()) {
        cout << label << ": ";
    }
    for (int x : vec) {
        cout << x << " ";
    }
    cout << endl;
}

// Example Usage
int main() {
    cout << "=== Basic Graph Theory Demo ===" << endl;
    
    // Create undirected graph
    GraphAdjacencyList graph(false);
    
    // Add vertices and edges
    for (int i = 1; i <= 5; i++) {
        graph.addVertex(i);
    }
    
    graph.addEdge(1, 2);
    graph.addEdge(1, 3);
    graph.addEdge(2, 4);
    graph.addEdge(3, 4);
    graph.addEdge(4, 5);
    
    cout << "\n=== Graph Structure ===" << endl;
    graph.printGraph();
    
    cout << "\n=== Graph Traversals ===" << endl;
    printVector(GraphDFS::dfsRecursive(graph, 1), "DFS (Recursive)");
    printVector(GraphDFS::dfsIterative(graph, 1), "DFS (Iterative)");
    printVector(GraphBFS::bfs(graph, 1), "BFS");
    
    cout << "\n=== Path Finding ===" << endl;
    printVector(GraphDFS::findPath(graph, 1, 5), "Path 1 to 5");
    printVector(GraphBFS::shortestPath(graph, 1, 5), "Shortest path 1 to 5");
    cout << "Shortest distance 1 to 5: " << GraphBFS::shortestDistance(graph, 1, 5) << endl;
    
    cout << "\n=== Graph Properties ===" << endl;
    cout << "Has cycle: " << (GraphDFS::hasCycleUndirected(graph) ? "Yes" : "No") << endl;
    
    // Adjacency matrix example
    cout << "\n=== Adjacency Matrix ===" << endl;
    GraphAdjacencyMatrix matrixGraph(10, false);
    
    for (int i = 0; i < 4; i++) {
        matrixGraph.addVertex(i);
    }
    
    matrixGraph.addEdge(0, 1);
    matrixGraph.addEdge(0, 2);
    matrixGraph.addEdge(1, 3);
    matrixGraph.addEdge(2, 3);
    
    matrixGraph.printMatrix();
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Representation Comparison:

| Operation | Adjacency List | Adjacency Matrix |
|-----------|----------------|------------------|
| **Add Vertex** | O(1) | O(1) |
| **Add Edge** | O(1) | O(1) |
| **Remove Edge** | O(V) | O(1) |
| **Check Edge** | O(V) | O(1) |
| **Get Neighbors** | O(degree) | O(V) |
| **Space** | O(V + E) | O(V²) |

### When to Use Each:

**Adjacency List**:
- ✅ Sparse graphs (E << V²)
- ✅ Memory-constrained environments
- ✅ Frequent traversals
- ❌ Frequent edge lookups

**Adjacency Matrix**:
- ✅ Dense graphs (E ≈ V²)
- ✅ Frequent edge lookups
- ✅ Simple implementation
- ❌ Memory-constrained environments

### Traversal Complexity:

| Algorithm | Time | Space | Use Case |
|-----------|------|-------|----------|
| **DFS** | O(V + E) | O(V) | Path finding, cycle detection |
| **BFS** | O(V + E) | O(V) | Shortest path, level-order |

---

## 🧩 Practice Problems

### Problem 1: Number of Islands
**Question**: Count number of islands in 2D grid (1=land, 0=water).

**Example**: 
```
11110
11010
11000
00000
```
**Output**: 1

**Hint**: Use DFS/BFS to explore connected components.

### Problem 2: Clone Graph
**Question**: Deep clone an undirected graph.

**Hint**: Use DFS/BFS with hash map to track cloned nodes.

### Problem 3: Course Schedule
**Question**: Determine if you can finish all courses given prerequisites.

**Hint**: Model as directed graph, detect cycles.

### Problem 4: Word Ladder
**Question**: Find shortest transformation sequence from start to end word.

**Hint**: Model as graph where words are vertices, edges connect words differing by one character.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Representation choice**: Can you choose appropriate representation?
2. **Traversal mastery**: Know DFS and BFS implementations
3. **Problem modeling**: Can you model real problems as graphs?
4. **Complexity analysis**: Understand time/space trade-offs

### Common Interview Patterns:
- **Connected components**: Use DFS/BFS to find groups
- **Cycle detection**: DFS with recursion stack (directed) or parent tracking (undirected)
- **Shortest path**: BFS for unweighted, Dijkstra for weighted
- **Topological sort**: DFS-based ordering for DAGs
- **Bipartite checking**: BFS with 2-coloring

### Red Flags to Avoid:
- Confusing directed vs undirected graphs
- Not handling disconnected components
- Infinite loops in traversal
- Wrong complexity analysis

### Pro Tips:
1. **Clarify graph type**: Directed? Weighted? Connected?
2. **Choose representation wisely**: Consider space/time trade-offs
3. **Handle edge cases**: Empty graph, single vertex, disconnected components
4. **Practice both traversals**: DFS and BFS have different use cases
5. **Think in terms of problems**: Many problems are graph problems in disguise

---

## 🚀 Key Takeaways

1. **Graphs model relationships** - Fundamental for many real-world problems
2. **Two main representations** - Adjacency list vs matrix trade-offs
3. **DFS goes deep** - Good for path finding and cycle detection
4. **BFS goes wide** - Good for shortest paths and level-order processing
5. **Many problems are graphs** - Social networks, dependencies, maps
6. **Practice recognition** - Learn to identify graph problems

**Next Chapter**: We'll explore Two Pointers technique and see how it optimizes array and string problems.