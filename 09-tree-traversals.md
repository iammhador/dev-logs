# Chapter 9: Tree Traversals - Navigating Hierarchical Data

## 🎯 What are Tree Traversals?

**Tree traversal** is the process of visiting each node in a tree data structure exactly once in a systematic way. Unlike linear data structures (arrays, linked lists), trees are hierarchical, so there are multiple ways to traverse them.

### Why Tree Traversals Matter:
- **Data processing**: Process all nodes in a specific order
- **Tree algorithms**: Foundation for search, insertion, deletion
- **Expression evaluation**: Parse mathematical/logical expressions
- **File systems**: Navigate directory structures
- **Database indexing**: B-tree operations
- **Compiler design**: Abstract syntax tree processing

### Traversal Categories:
1. **Depth-First Search (DFS)**: Go deep before going wide
   - Inorder (Left → Root → Right)
   - Preorder (Root → Left → Right)
   - Postorder (Left → Right → Root)

2. **Breadth-First Search (BFS)**: Go wide before going deep
   - Level-order traversal

---

## 🌳 Tree Traversal Overview

| Traversal | Order | Use Cases | Time | Space | Stack Usage |
|-----------|-------|-----------|------|-------|-------------|
| **Inorder** | L→R→R | BST sorted output, expression evaluation | O(n) | O(h) | Recursive: O(h) |
| **Preorder** | R→L→R | Tree copying, prefix expressions | O(n) | O(h) | Recursive: O(h) |
| **Postorder** | L→R→R | Tree deletion, postfix expressions | O(n) | O(h) | Recursive: O(h) |
| **Level-order** | Level by level | Tree printing, shortest path | O(n) | O(w) | Queue: O(w) |

*h = height of tree, w = maximum width of tree*

---

## 💻 JavaScript Implementation

```javascript
// Tree Node Definition
class TreeNode {
    constructor(val, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Tree Traversal Implementations

// ===== DEPTH-FIRST SEARCH (DFS) TRAVERSALS =====

// 1. INORDER TRAVERSAL (Left → Root → Right)
// Use case: Get sorted sequence from BST

// Recursive Inorder
// Time: O(n), Space: O(h) where h is height
function inorderRecursive(root, result = []) {
    if (root === null) {
        return result;
    }
    
    // Traverse left subtree
    inorderRecursive(root.left, result);
    
    // Visit root
    result.push(root.val);
    
    // Traverse right subtree
    inorderRecursive(root.right, result);
    
    return result;
}

// Iterative Inorder using Stack
// Time: O(n), Space: O(h)
function inorderIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current !== null || stack.length > 0) {
        // Go to the leftmost node
        while (current !== null) {
            stack.push(current);
            current = current.left;
        }
        
        // Current is null, so we backtrack
        current = stack.pop();
        result.push(current.val);
        
        // Visit right subtree
        current = current.right;
    }
    
    return result;
}

// Morris Inorder Traversal (No extra space)
// Time: O(n), Space: O(1)
function inorderMorris(root) {
    const result = [];
    let current = root;
    
    while (current !== null) {
        if (current.left === null) {
            // No left child, visit current and go right
            result.push(current.val);
            current = current.right;
        } else {
            // Find inorder predecessor
            let predecessor = current.left;
            while (predecessor.right !== null && predecessor.right !== current) {
                predecessor = predecessor.right;
            }
            
            if (predecessor.right === null) {
                // Make current the right child of predecessor
                predecessor.right = current;
                current = current.left;
            } else {
                // Revert the changes
                predecessor.right = null;
                result.push(current.val);
                current = current.right;
            }
        }
    }
    
    return result;
}

// 2. PREORDER TRAVERSAL (Root → Left → Right)
// Use case: Tree copying, prefix expressions

// Recursive Preorder
// Time: O(n), Space: O(h)
function preorderRecursive(root, result = []) {
    if (root === null) {
        return result;
    }
    
    // Visit root
    result.push(root.val);
    
    // Traverse left subtree
    preorderRecursive(root.left, result);
    
    // Traverse right subtree
    preorderRecursive(root.right, result);
    
    return result;
}

// Iterative Preorder using Stack
// Time: O(n), Space: O(h)
function preorderIterative(root) {
    if (root === null) return [];
    
    const result = [];
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        
        // Push right first, then left (stack is LIFO)
        if (node.right !== null) {
            stack.push(node.right);
        }
        if (node.left !== null) {
            stack.push(node.left);
        }
    }
    
    return result;
}

// Morris Preorder Traversal
// Time: O(n), Space: O(1)
function preorderMorris(root) {
    const result = [];
    let current = root;
    
    while (current !== null) {
        if (current.left === null) {
            result.push(current.val);
            current = current.right;
        } else {
            let predecessor = current.left;
            while (predecessor.right !== null && predecessor.right !== current) {
                predecessor = predecessor.right;
            }
            
            if (predecessor.right === null) {
                result.push(current.val); // Visit before going left
                predecessor.right = current;
                current = current.left;
            } else {
                predecessor.right = null;
                current = current.right;
            }
        }
    }
    
    return result;
}

// 3. POSTORDER TRAVERSAL (Left → Right → Root)
// Use case: Tree deletion, postfix expressions

// Recursive Postorder
// Time: O(n), Space: O(h)
function postorderRecursive(root, result = []) {
    if (root === null) {
        return result;
    }
    
    // Traverse left subtree
    postorderRecursive(root.left, result);
    
    // Traverse right subtree
    postorderRecursive(root.right, result);
    
    // Visit root
    result.push(root.val);
    
    return result;
}

// Iterative Postorder using Two Stacks
// Time: O(n), Space: O(h)
function postorderIterativeTwoStacks(root) {
    if (root === null) return [];
    
    const stack1 = [root];
    const stack2 = [];
    const result = [];
    
    // First stack for traversal, second for result order
    while (stack1.length > 0) {
        const node = stack1.pop();
        stack2.push(node);
        
        if (node.left !== null) {
            stack1.push(node.left);
        }
        if (node.right !== null) {
            stack1.push(node.right);
        }
    }
    
    // Pop from second stack to get postorder
    while (stack2.length > 0) {
        result.push(stack2.pop().val);
    }
    
    return result;
}

// Iterative Postorder using One Stack
// Time: O(n), Space: O(h)
function postorderIterativeOneStack(root) {
    if (root === null) return [];
    
    const result = [];
    const stack = [];
    let lastVisited = null;
    let current = root;
    
    while (stack.length > 0 || current !== null) {
        if (current !== null) {
            stack.push(current);
            current = current.left;
        } else {
            const peekNode = stack[stack.length - 1];
            
            // If right child exists and hasn't been processed yet
            if (peekNode.right !== null && lastVisited !== peekNode.right) {
                current = peekNode.right;
            } else {
                result.push(peekNode.val);
                lastVisited = stack.pop();
            }
        }
    }
    
    return result;
}

// ===== BREADTH-FIRST SEARCH (BFS) TRAVERSAL =====

// 4. LEVEL-ORDER TRAVERSAL (Breadth-First)
// Use case: Tree printing, shortest path in unweighted trees

// Basic Level-order using Queue
// Time: O(n), Space: O(w) where w is maximum width
function levelOrder(root) {
    if (root === null) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.val);
        
        if (node.left !== null) {
            queue.push(node.left);
        }
        if (node.right !== null) {
            queue.push(node.right);
        }
    }
    
    return result;
}

// Level-order with Level Separation
// Returns array of arrays, each representing a level
function levelOrderByLevels(root) {
    if (root === null) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right);
            }
        }
        
        result.push(currentLevel);
    }
    
    return result;
}

// Zigzag Level-order Traversal
// Alternate between left-to-right and right-to-left
function zigzagLevelOrder(root) {
    if (root === null) return [];
    
    const result = [];
    const queue = [root];
    let leftToRight = true;
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            
            if (leftToRight) {
                currentLevel.push(node.val);
            } else {
                currentLevel.unshift(node.val);
            }
            
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right);
            }
        }
        
        result.push(currentLevel);
        leftToRight = !leftToRight;
    }
    
    return result;
}

// Reverse Level-order Traversal (Bottom-up)
function reverseLevelOrder(root) {
    if (root === null) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            if (node.left !== null) {
                queue.push(node.left);
            }
            if (node.right !== null) {
                queue.push(node.right);
            }
        }
        
        result.unshift(currentLevel); // Add to beginning
    }
    
    return result;
}

// ===== ADVANCED TRAVERSAL TECHNIQUES =====

// Vertical Order Traversal
// Group nodes by their horizontal distance from root
function verticalOrder(root) {
    if (root === null) return [];
    
    const columnMap = new Map();
    const queue = [[root, 0]]; // [node, column]
    
    while (queue.length > 0) {
        const [node, col] = queue.shift();
        
        if (!columnMap.has(col)) {
            columnMap.set(col, []);
        }
        columnMap.get(col).push(node.val);
        
        if (node.left !== null) {
            queue.push([node.left, col - 1]);
        }
        if (node.right !== null) {
            queue.push([node.right, col + 1]);
        }
    }
    
    // Sort by column and return values
    const sortedColumns = Array.from(columnMap.keys()).sort((a, b) => a - b);
    return sortedColumns.map(col => columnMap.get(col));
}

// Boundary Traversal
// Traverse the boundary of the tree (anticlockwise)
function boundaryTraversal(root) {
    if (root === null) return [];
    
    const result = [];
    
    // Add root
    result.push(root.val);
    
    if (root.left === null && root.right === null) {
        return result; // Single node
    }
    
    // Add left boundary (excluding leaves)
    function addLeftBoundary(node) {
        if (node === null || (node.left === null && node.right === null)) {
            return;
        }
        
        result.push(node.val);
        
        if (node.left !== null) {
            addLeftBoundary(node.left);
        } else {
            addLeftBoundary(node.right);
        }
    }
    
    // Add leaves
    function addLeaves(node) {
        if (node === null) return;
        
        if (node.left === null && node.right === null) {
            result.push(node.val);
            return;
        }
        
        addLeaves(node.left);
        addLeaves(node.right);
    }
    
    // Add right boundary (excluding leaves, in reverse)
    function addRightBoundary(node) {
        if (node === null || (node.left === null && node.right === null)) {
            return;
        }
        
        if (node.right !== null) {
            addRightBoundary(node.right);
        } else {
            addRightBoundary(node.left);
        }
        
        result.push(node.val);
    }
    
    addLeftBoundary(root.left);
    addLeaves(root);
    addRightBoundary(root.right);
    
    return result;
}

// Diagonal Traversal
// Traverse diagonally (nodes at same diagonal distance)
function diagonalTraversal(root) {
    if (root === null) return [];
    
    const diagonalMap = new Map();
    
    function traverse(node, diagonal) {
        if (node === null) return;
        
        if (!diagonalMap.has(diagonal)) {
            diagonalMap.set(diagonal, []);
        }
        diagonalMap.get(diagonal).push(node.val);
        
        // Left child increases diagonal distance
        traverse(node.left, diagonal + 1);
        // Right child maintains same diagonal distance
        traverse(node.right, diagonal);
    }
    
    traverse(root, 0);
    
    // Convert map to array
    const result = [];
    for (let i = 0; i < diagonalMap.size; i++) {
        if (diagonalMap.has(i)) {
            result.push(...diagonalMap.get(i));
        }
    }
    
    return result;
}

// ===== TRAVERSAL UTILITIES =====

class TraversalUtils {
    // Build tree from array (level-order)
    static buildTreeFromArray(arr) {
        if (!arr || arr.length === 0) return null;
        
        const root = new TreeNode(arr[0]);
        const queue = [root];
        let i = 1;
        
        while (queue.length > 0 && i < arr.length) {
            const node = queue.shift();
            
            if (i < arr.length && arr[i] !== null) {
                node.left = new TreeNode(arr[i]);
                queue.push(node.left);
            }
            i++;
            
            if (i < arr.length && arr[i] !== null) {
                node.right = new TreeNode(arr[i]);
                queue.push(node.right);
            }
            i++;
        }
        
        return root;
    }
    
    // Convert tree to array (level-order)
    static treeToArray(root) {
        if (root === null) return [];
        
        const result = [];
        const queue = [root];
        
        while (queue.length > 0) {
            const node = queue.shift();
            
            if (node === null) {
                result.push(null);
            } else {
                result.push(node.val);
                queue.push(node.left);
                queue.push(node.right);
            }
        }
        
        // Remove trailing nulls
        while (result.length > 0 && result[result.length - 1] === null) {
            result.pop();
        }
        
        return result;
    }
    
    // Print tree structure
    static printTree(root, prefix = '', isLast = true) {
        if (root === null) return;
        
        console.log(prefix + (isLast ? '└── ' : '├── ') + root.val);
        
        const children = [root.left, root.right].filter(child => child !== null);
        
        children.forEach((child, index) => {
            const isLastChild = index === children.length - 1;
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            TraversalUtils.printTree(child, newPrefix, isLastChild);
        });
    }
    
    // Get tree height
    static getHeight(root) {
        if (root === null) return 0;
        return 1 + Math.max(TraversalUtils.getHeight(root.left), TraversalUtils.getHeight(root.right));
    }
    
    // Get tree width (maximum nodes at any level)
    static getWidth(root) {
        if (root === null) return 0;
        
        let maxWidth = 0;
        const queue = [root];
        
        while (queue.length > 0) {
            const levelSize = queue.length;
            maxWidth = Math.max(maxWidth, levelSize);
            
            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                
                if (node.left !== null) {
                    queue.push(node.left);
                }
                if (node.right !== null) {
                    queue.push(node.right);
                }
            }
        }
        
        return maxWidth;
    }
    
    // Compare all traversal methods
    static compareTraversals(root) {
        console.log('=== Tree Traversal Comparison ===');
        console.log('Inorder (Recursive):', inorderRecursive(root));
        console.log('Inorder (Iterative):', inorderIterative(root));
        console.log('Inorder (Morris):', inorderMorris(root));
        console.log('Preorder (Recursive):', preorderRecursive(root));
        console.log('Preorder (Iterative):', preorderIterative(root));
        console.log('Postorder (Recursive):', postorderRecursive(root));
        console.log('Postorder (Iterative):', postorderIterativeTwoStacks(root));
        console.log('Level-order:', levelOrder(root));
        console.log('Level-order by levels:', levelOrderByLevels(root));
        console.log('Zigzag level-order:', zigzagLevelOrder(root));
    }
    
    // Performance measurement
    static measureTraversalPerformance(root, traversalFunc, name) {
        const start = performance.now();
        const result = traversalFunc(root);
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(4)}ms, Nodes: ${result.length}`);
        return result;
    }
    
    // Generate random binary tree
    static generateRandomTree(maxDepth, probability = 0.7) {
        function buildRandom(depth) {
            if (depth > maxDepth || Math.random() > probability) {
                return null;
            }
            
            const val = Math.floor(Math.random() * 100) + 1;
            const node = new TreeNode(val);
            node.left = buildRandom(depth + 1);
            node.right = buildRandom(depth + 1);
            
            return node;
        }
        
        return buildRandom(0);
    }
    
    // Generate BST from sorted array
    static generateBSTFromSorted(arr) {
        function buildBST(start, end) {
            if (start > end) return null;
            
            const mid = Math.floor((start + end) / 2);
            const node = new TreeNode(arr[mid]);
            
            node.left = buildBST(start, mid - 1);
            node.right = buildBST(mid + 1, end);
            
            return node;
        }
        
        return buildBST(0, arr.length - 1);
    }
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Tree Traversals Demo ===');

// Create example tree:
//       1
//      / \
//     2   3
//    / \
//   4   5
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

console.log('\n=== Tree Structure ===');
TraversalUtils.printTree(root);

console.log('\n=== Basic Traversals ===');
console.log('Inorder:', inorderRecursive(root));     // [4, 2, 5, 1, 3]
console.log('Preorder:', preorderRecursive(root));   // [1, 2, 4, 5, 3]
console.log('Postorder:', postorderRecursive(root)); // [4, 5, 2, 3, 1]
console.log('Level-order:', levelOrder(root));       // [1, 2, 3, 4, 5]

console.log('\n=== Advanced Traversals ===');
console.log('Level-order by levels:', levelOrderByLevels(root));
console.log('Zigzag level-order:', zigzagLevelOrder(root));
console.log('Reverse level-order:', reverseLevelOrder(root));
console.log('Vertical order:', verticalOrder(root));
console.log('Boundary traversal:', boundaryTraversal(root));
console.log('Diagonal traversal:', diagonalTraversal(root));

// Create BST for demonstration
const bstArray = [1, 2, 3, 4, 5, 6, 7];
const bst = TraversalUtils.generateBSTFromSorted(bstArray);

console.log('\n=== BST Traversals ===');
console.log('BST Structure:');
TraversalUtils.printTree(bst);
console.log('BST Inorder (should be sorted):', inorderRecursive(bst));

// Performance comparison
console.log('\n=== Performance Comparison ===');
const largeTree = TraversalUtils.generateRandomTree(10);

TraversalUtils.measureTraversalPerformance(largeTree, inorderRecursive, 'Inorder Recursive');
TraversalUtils.measureTraversalPerformance(largeTree, inorderIterative, 'Inorder Iterative');
TraversalUtils.measureTraversalPerformance(largeTree, inorderMorris, 'Inorder Morris');
TraversalUtils.measureTraversalPerformance(largeTree, levelOrder, 'Level-order');

// Tree statistics
console.log('\n=== Tree Statistics ===');
console.log('Tree height:', TraversalUtils.getHeight(root));
console.log('Tree width:', TraversalUtils.getWidth(root));

// All traversals comparison
console.log('\n=== Complete Comparison ===');
TraversalUtils.compareTraversals(root);
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <map>
#include <algorithm>
#include <chrono>
using namespace std;
using namespace std::chrono;

// Tree Node Definition
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// ===== DEPTH-FIRST SEARCH (DFS) TRAVERSALS =====

// 1. INORDER TRAVERSAL (Left → Root → Right)

// Recursive Inorder
void inorderRecursive(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    
    inorderRecursive(root->left, result);
    result.push_back(root->val);
    inorderRecursive(root->right, result);
}

vector<int> inorderRecursive(TreeNode* root) {
    vector<int> result;
    inorderRecursive(root, result);
    return result;
}

// Iterative Inorder
vector<int> inorderIterative(TreeNode* root) {
    vector<int> result;
    stack<TreeNode*> stk;
    TreeNode* current = root;
    
    while (current != nullptr || !stk.empty()) {
        // Go to leftmost node
        while (current != nullptr) {
            stk.push(current);
            current = current->left;
        }
        
        // Backtrack
        current = stk.top();
        stk.pop();
        result.push_back(current->val);
        
        // Visit right subtree
        current = current->right;
    }
    
    return result;
}

// Morris Inorder (O(1) space)
vector<int> inorderMorris(TreeNode* root) {
    vector<int> result;
    TreeNode* current = root;
    
    while (current != nullptr) {
        if (current->left == nullptr) {
            result.push_back(current->val);
            current = current->right;
        } else {
            // Find inorder predecessor
            TreeNode* predecessor = current->left;
            while (predecessor->right != nullptr && predecessor->right != current) {
                predecessor = predecessor->right;
            }
            
            if (predecessor->right == nullptr) {
                // Make current the right child of predecessor
                predecessor->right = current;
                current = current->left;
            } else {
                // Revert changes
                predecessor->right = nullptr;
                result.push_back(current->val);
                current = current->right;
            }
        }
    }
    
    return result;
}

// 2. PREORDER TRAVERSAL (Root → Left → Right)

// Recursive Preorder
void preorderRecursive(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    
    result.push_back(root->val);
    preorderRecursive(root->left, result);
    preorderRecursive(root->right, result);
}

vector<int> preorderRecursive(TreeNode* root) {
    vector<int> result;
    preorderRecursive(root, result);
    return result;
}

// Iterative Preorder
vector<int> preorderIterative(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<int> result;
    stack<TreeNode*> stk;
    stk.push(root);
    
    while (!stk.empty()) {
        TreeNode* node = stk.top();
        stk.pop();
        result.push_back(node->val);
        
        // Push right first, then left
        if (node->right != nullptr) {
            stk.push(node->right);
        }
        if (node->left != nullptr) {
            stk.push(node->left);
        }
    }
    
    return result;
}

// 3. POSTORDER TRAVERSAL (Left → Right → Root)

// Recursive Postorder
void postorderRecursive(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    
    postorderRecursive(root->left, result);
    postorderRecursive(root->right, result);
    result.push_back(root->val);
}

vector<int> postorderRecursive(TreeNode* root) {
    vector<int> result;
    postorderRecursive(root, result);
    return result;
}

// Iterative Postorder (Two Stacks)
vector<int> postorderIterativeTwoStacks(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<int> result;
    stack<TreeNode*> stk1, stk2;
    stk1.push(root);
    
    while (!stk1.empty()) {
        TreeNode* node = stk1.top();
        stk1.pop();
        stk2.push(node);
        
        if (node->left != nullptr) {
            stk1.push(node->left);
        }
        if (node->right != nullptr) {
            stk1.push(node->right);
        }
    }
    
    while (!stk2.empty()) {
        result.push_back(stk2.top()->val);
        stk2.pop();
    }
    
    return result;
}

// Iterative Postorder (One Stack)
vector<int> postorderIterativeOneStack(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<int> result;
    stack<TreeNode*> stk;
    TreeNode* lastVisited = nullptr;
    TreeNode* current = root;
    
    while (!stk.empty() || current != nullptr) {
        if (current != nullptr) {
            stk.push(current);
            current = current->left;
        } else {
            TreeNode* peekNode = stk.top();
            
            if (peekNode->right != nullptr && lastVisited != peekNode->right) {
                current = peekNode->right;
            } else {
                result.push_back(peekNode->val);
                lastVisited = stk.top();
                stk.pop();
            }
        }
    }
    
    return result;
}

// ===== BREADTH-FIRST SEARCH (BFS) TRAVERSAL =====

// Level-order Traversal
vector<int> levelOrder(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<int> result;
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        result.push_back(node->val);
        
        if (node->left != nullptr) {
            q.push(node->left);
        }
        if (node->right != nullptr) {
            q.push(node->right);
        }
    }
    
    return result;
}

// Level-order by Levels
vector<vector<int>> levelOrderByLevels(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<vector<int>> result;
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel;
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            currentLevel.push_back(node->val);
            
            if (node->left != nullptr) {
                q.push(node->left);
            }
            if (node->right != nullptr) {
                q.push(node->right);
            }
        }
        
        result.push_back(currentLevel);
    }
    
    return result;
}

// Zigzag Level-order
vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<vector<int>> result;
    queue<TreeNode*> q;
    q.push(root);
    bool leftToRight = true;
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> currentLevel(levelSize);
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            
            int index = leftToRight ? i : levelSize - 1 - i;
            currentLevel[index] = node->val;
            
            if (node->left != nullptr) {
                q.push(node->left);
            }
            if (node->right != nullptr) {
                q.push(node->right);
            }
        }
        
        result.push_back(currentLevel);
        leftToRight = !leftToRight;
    }
    
    return result;
}

// ===== ADVANCED TRAVERSALS =====

// Vertical Order Traversal
vector<vector<int>> verticalOrder(TreeNode* root) {
    if (root == nullptr) return {};
    
    map<int, vector<int>> columnMap;
    queue<pair<TreeNode*, int>> q;
    q.push({root, 0});
    
    while (!q.empty()) {
        auto [node, col] = q.front();
        q.pop();
        
        columnMap[col].push_back(node->val);
        
        if (node->left != nullptr) {
            q.push({node->left, col - 1});
        }
        if (node->right != nullptr) {
            q.push({node->right, col + 1});
        }
    }
    
    vector<vector<int>> result;
    for (auto& [col, values] : columnMap) {
        result.push_back(values);
    }
    
    return result;
}

// Boundary Traversal
vector<int> boundaryTraversal(TreeNode* root) {
    if (root == nullptr) return {};
    
    vector<int> result;
    result.push_back(root->val);
    
    if (root->left == nullptr && root->right == nullptr) {
        return result;
    }
    
    // Left boundary (excluding leaves)
    function<void(TreeNode*)> addLeftBoundary = [&](TreeNode* node) {
        if (node == nullptr || (node->left == nullptr && node->right == nullptr)) {
            return;
        }
        
        result.push_back(node->val);
        
        if (node->left != nullptr) {
            addLeftBoundary(node->left);
        } else {
            addLeftBoundary(node->right);
        }
    };
    
    // Leaves
    function<void(TreeNode*)> addLeaves = [&](TreeNode* node) {
        if (node == nullptr) return;
        
        if (node->left == nullptr && node->right == nullptr) {
            result.push_back(node->val);
            return;
        }
        
        addLeaves(node->left);
        addLeaves(node->right);
    };
    
    // Right boundary (excluding leaves, in reverse)
    function<void(TreeNode*)> addRightBoundary = [&](TreeNode* node) {
        if (node == nullptr || (node->left == nullptr && node->right == nullptr)) {
            return;
        }
        
        if (node->right != nullptr) {
            addRightBoundary(node->right);
        } else {
            addRightBoundary(node->left);
        }
        
        result.push_back(node->val);
    };
    
    addLeftBoundary(root->left);
    addLeaves(root);
    addRightBoundary(root->right);
    
    return result;
}

// ===== UTILITY FUNCTIONS =====

class TraversalUtils {
public:
    // Build tree from array
    static TreeNode* buildTreeFromArray(const vector<int>& arr) {
        if (arr.empty()) return nullptr;
        
        TreeNode* root = new TreeNode(arr[0]);
        queue<TreeNode*> q;
        q.push(root);
        int i = 1;
        
        while (!q.empty() && i < arr.size()) {
            TreeNode* node = q.front();
            q.pop();
            
            if (i < arr.size()) {
                node->left = new TreeNode(arr[i]);
                q.push(node->left);
                i++;
            }
            
            if (i < arr.size()) {
                node->right = new TreeNode(arr[i]);
                q.push(node->right);
                i++;
            }
        }
        
        return root;
    }
    
    // Print tree structure
    static void printTree(TreeNode* root, string prefix = "", bool isLast = true) {
        if (root == nullptr) return;
        
        cout << prefix << (isLast ? "└── " : "├── ") << root->val << endl;
        
        vector<TreeNode*> children;
        if (root->left != nullptr) children.push_back(root->left);
        if (root->right != nullptr) children.push_back(root->right);
        
        for (int i = 0; i < children.size(); i++) {
            bool isLastChild = (i == children.size() - 1);
            string newPrefix = prefix + (isLast ? "    " : "│   ");
            printTree(children[i], newPrefix, isLastChild);
        }
    }
    
    // Get tree height
    static int getHeight(TreeNode* root) {
        if (root == nullptr) return 0;
        return 1 + max(getHeight(root->left), getHeight(root->right));
    }
    
    // Performance measurement
    static void measurePerformance(function<vector<int>(TreeNode*)> traversalFunc, 
                                  TreeNode* root, const string& name) {
        auto start = high_resolution_clock::now();
        vector<int> result = traversalFunc(root);
        auto end = high_resolution_clock::now();
        
        auto duration = duration_cast<microseconds>(end - start);
        cout << name << ": " << duration.count() << " microseconds, Nodes: " << result.size() << endl;
    }
    
    // Generate BST from sorted array
    static TreeNode* generateBSTFromSorted(const vector<int>& arr) {
        function<TreeNode*(int, int)> buildBST = [&](int start, int end) -> TreeNode* {
            if (start > end) return nullptr;
            
            int mid = start + (end - start) / 2;
            TreeNode* node = new TreeNode(arr[mid]);
            
            node->left = buildBST(start, mid - 1);
            node->right = buildBST(mid + 1, end);
            
            return node;
        };
        
        return buildBST(0, arr.size() - 1);
    }
};

// Print vector utility
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

// Print 2D vector utility
void print2DVector(const vector<vector<int>>& vec, const string& label = "") {
    if (!label.empty()) {
        cout << label << ": ";
    }
    cout << "[";
    for (int i = 0; i < vec.size(); i++) {
        cout << "[";
        for (int j = 0; j < vec[i].size(); j++) {
            cout << vec[i][j];
            if (j < vec[i].size() - 1) cout << ", ";
        }
        cout << "]";
        if (i < vec.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
}

// Example Usage
int main() {
    cout << "=== Tree Traversals Demo ===" << endl;
    
    // Create example tree:
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);
    
    cout << "\n=== Tree Structure ===" << endl;
    TraversalUtils::printTree(root);
    
    cout << "\n=== Basic Traversals ===" << endl;
    printVector(inorderRecursive(root), "Inorder");
    printVector(preorderRecursive(root), "Preorder");
    printVector(postorderRecursive(root), "Postorder");
    printVector(levelOrder(root), "Level-order");
    
    cout << "\n=== Advanced Traversals ===" << endl;
    print2DVector(levelOrderByLevels(root), "Level-order by levels");
    print2DVector(zigzagLevelOrder(root), "Zigzag level-order");
    print2DVector(verticalOrder(root), "Vertical order");
    printVector(boundaryTraversal(root), "Boundary traversal");
    
    // Create BST
    vector<int> bstArray = {1, 2, 3, 4, 5, 6, 7};
    TreeNode* bst = TraversalUtils::generateBSTFromSorted(bstArray);
    
    cout << "\n=== BST Traversals ===" << endl;
    cout << "BST Structure:" << endl;
    TraversalUtils::printTree(bst);
    printVector(inorderRecursive(bst), "BST Inorder (should be sorted)");
    
    // Performance comparison
    cout << "\n=== Performance Comparison ===" << endl;
    TraversalUtils::measurePerformance(inorderRecursive, root, "Inorder Recursive");
    TraversalUtils::measurePerformance(inorderIterative, root, "Inorder Iterative");
    TraversalUtils::measurePerformance(inorderMorris, root, "Inorder Morris");
    TraversalUtils::measurePerformance(levelOrder, root, "Level-order");
    
    cout << "\n=== Tree Statistics ===" << endl;
    cout << "Tree height: " << TraversalUtils::getHeight(root) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time & Space Complexity:

| Traversal | Time | Space (Recursive) | Space (Iterative) | Space (Morris) |
|-----------|------|-------------------|-------------------|----------------|
| **Inorder** | O(n) | O(h) | O(h) | O(1) |
| **Preorder** | O(n) | O(h) | O(h) | O(1) |
| **Postorder** | O(n) | O(h) | O(h) | O(1) |
| **Level-order** | O(n) | N/A | O(w) | N/A |

*h = height, w = maximum width, n = number of nodes*

### When to Use Each:

1. **Inorder**:
   - ✅ BST: Get sorted sequence
   - ✅ Expression trees: Infix notation
   - ✅ Binary tree validation

2. **Preorder**:
   - ✅ Tree copying/serialization
   - ✅ Prefix expressions
   - ✅ Directory listing

3. **Postorder**:
   - ✅ Tree deletion (children first)
   - ✅ Postfix expressions
   - ✅ Calculate tree properties

4. **Level-order**:
   - ✅ Tree printing by levels
   - ✅ Shortest path in unweighted trees
   - ✅ Complete tree operations

### Common Pitfalls:

1. **Stack overflow**: Deep recursion in unbalanced trees
2. **Memory leaks**: Not deallocating tree nodes in C++
3. **Null pointer access**: Not checking for null nodes
4. **Incorrect Morris implementation**: Breaking tree structure permanently

---

## 🧩 Practice Problems

### Problem 1: Binary Tree Right Side View
**Question**: Return values of nodes you can see from the right side.

**Example**: `[1,2,3,null,5,null,4]` → `[1,3,4]`

**Hint**: Use level-order traversal, take last node of each level.

### Problem 2: Binary Tree Vertical Order Traversal
**Question**: Return vertical order traversal of binary tree.

**Hint**: Use BFS with column tracking.

### Problem 3: Serialize and Deserialize Binary Tree
**Question**: Design algorithm to serialize/deserialize binary tree.

**Hint**: Use preorder traversal with null markers.

### Problem 4: Binary Tree Maximum Path Sum
**Question**: Find maximum path sum between any two nodes.

**Hint**: Use postorder traversal with path sum calculation.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Traversal mastery**: Know all four basic traversals
2. **Implementation choice**: Recursive vs iterative vs Morris
3. **Space optimization**: When to use Morris traversal
4. **Problem adaptation**: Apply traversals to solve problems

### Common Interview Patterns:
- **Tree validation**: Use inorder for BST validation
- **Tree construction**: Use preorder/postorder with inorder
- **Path problems**: Use DFS traversals
- **Level problems**: Use BFS traversal
- **Tree views**: Right/left/top/bottom views

### Red Flags to Avoid:
- Confusing traversal orders
- Not handling null nodes
- Stack overflow in deep trees
- Inefficient space usage when O(1) is possible

### Pro Tips:
1. **Master the basics**: Know all four traversals by heart
2. **Practice iterative**: Interviewers often prefer iterative solutions
3. **Consider Morris**: For space-constrained problems
4. **Draw examples**: Visualize traversal order
5. **Handle edge cases**: Empty tree, single node, skewed tree

---

## 🚀 Key Takeaways

1. **Four fundamental traversals** - Each has specific use cases
2. **Recursive vs Iterative** - Trade-off between simplicity and space
3. **Morris traversal** - Achieves O(1) space complexity
4. **Level-order uses queue** - BFS pattern for tree problems
5. **BST inorder is sorted** - Key property for many algorithms
6. **Practice variations** - Zigzag, vertical, boundary traversals

**Next Chapter**: We'll explore Basic Graph Theory and see how traversal concepts extend to graph structures.