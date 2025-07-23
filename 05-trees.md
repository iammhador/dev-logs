# Chapter 5: Trees - Hierarchical Data Structures

## 🎯 What Are Trees?

**Trees** are hierarchical data structures consisting of nodes connected by edges. Unlike linear structures (arrays, linked lists), trees represent hierarchical relationships with a root node at the top and child nodes branching downward.

### Why Trees Matter:
- **Hierarchical Organization**: Natural representation of hierarchical data
- **Efficient Search**: O(log n) operations in balanced trees
- **Flexible Structure**: Can represent many real-world relationships
- **Foundation**: Basis for databases, file systems, and decision trees

### Tree Terminology:
- **Root**: Top node with no parent
- **Parent**: Node with child nodes
- **Child**: Node with a parent
- **Leaf**: Node with no children
- **Height**: Longest path from root to leaf
- **Depth**: Distance from root to a specific node
- **Subtree**: Tree formed by a node and its descendants

---

## 🔍 Types of Trees

### 1. Binary Tree
- Each node has at most two children (left and right)
- Foundation for many other tree types

### 2. Binary Search Tree (BST)
- Binary tree with ordering property
- Left subtree values < parent < right subtree values
- Enables efficient searching

### 3. Complete Binary Tree
- All levels filled except possibly the last
- Last level filled from left to right

### 4. Full Binary Tree
- Every node has either 0 or 2 children
- No node has exactly one child

### 5. Perfect Binary Tree
- All internal nodes have two children
- All leaves are at the same level

---

## 💻 JavaScript Implementation

```javascript
// Binary Tree Node
class TreeNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

// Binary Tree Implementation
class BinaryTree {
    constructor() {
        this.root = null;
    }
    
    // Insert node (level-order insertion for complete tree)
    // Time: O(n), Space: O(n)
    insert(data) {
        const newNode = new TreeNode(data);
        
        if (!this.root) {
            this.root = newNode;
            return;
        }
        
        // Use queue for level-order insertion
        const queue = [this.root];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (!current.left) {
                current.left = newNode;
                return;
            } else if (!current.right) {
                current.right = newNode;
                return;
            } else {
                queue.push(current.left);
                queue.push(current.right);
            }
        }
    }
    
    // Search for a value
    // Time: O(n), Space: O(h) where h is height
    search(data, node = this.root) {
        if (!node) {
            return false;
        }
        
        if (node.data === data) {
            return true;
        }
        
        return this.search(data, node.left) || this.search(data, node.right);
    }
    
    // Get height of tree
    // Time: O(n), Space: O(h)
    getHeight(node = this.root) {
        if (!node) {
            return -1;
        }
        
        return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }
    
    // Count total nodes
    // Time: O(n), Space: O(h)
    countNodes(node = this.root) {
        if (!node) {
            return 0;
        }
        
        return 1 + this.countNodes(node.left) + this.countNodes(node.right);
    }
    
    // Check if tree is balanced
    // Time: O(n), Space: O(h)
    isBalanced(node = this.root) {
        if (!node) {
            return true;
        }
        
        const leftHeight = this.getHeight(node.left);
        const rightHeight = this.getHeight(node.right);
        
        return Math.abs(leftHeight - rightHeight) <= 1 &&
               this.isBalanced(node.left) &&
               this.isBalanced(node.right);
    }
    
    // Find maximum value
    // Time: O(n), Space: O(h)
    findMax(node = this.root) {
        if (!node) {
            return null;
        }
        
        let max = node.data;
        const leftMax = this.findMax(node.left);
        const rightMax = this.findMax(node.right);
        
        if (leftMax !== null && leftMax > max) {
            max = leftMax;
        }
        if (rightMax !== null && rightMax > max) {
            max = rightMax;
        }
        
        return max;
    }
    
    // Find minimum value
    // Time: O(n), Space: O(h)
    findMin(node = this.root) {
        if (!node) {
            return null;
        }
        
        let min = node.data;
        const leftMin = this.findMin(node.left);
        const rightMin = this.findMin(node.right);
        
        if (leftMin !== null && leftMin < min) {
            min = leftMin;
        }
        if (rightMin !== null && rightMin < min) {
            min = rightMin;
        }
        
        return min;
    }
}

// Binary Search Tree Implementation
class BinarySearchTree {
    constructor() {
        this.root = null;
    }
    
    // Insert node maintaining BST property
    // Time: O(log n) average, O(n) worst, Space: O(h)
    insert(data) {
        this.root = this.insertNode(this.root, data);
    }
    
    insertNode(node, data) {
        if (!node) {
            return new TreeNode(data);
        }
        
        if (data < node.data) {
            node.left = this.insertNode(node.left, data);
        } else if (data > node.data) {
            node.right = this.insertNode(node.right, data);
        }
        // Ignore duplicates
        
        return node;
    }
    
    // Search for a value
    // Time: O(log n) average, O(n) worst, Space: O(h)
    search(data, node = this.root) {
        if (!node) {
            return false;
        }
        
        if (data === node.data) {
            return true;
        } else if (data < node.data) {
            return this.search(data, node.left);
        } else {
            return this.search(data, node.right);
        }
    }
    
    // Find minimum value (leftmost node)
    // Time: O(log n) average, O(n) worst, Space: O(h)
    findMin(node = this.root) {
        if (!node) {
            return null;
        }
        
        while (node.left) {
            node = node.left;
        }
        
        return node.data;
    }
    
    // Find maximum value (rightmost node)
    // Time: O(log n) average, O(n) worst, Space: O(h)
    findMax(node = this.root) {
        if (!node) {
            return null;
        }
        
        while (node.right) {
            node = node.right;
        }
        
        return node.data;
    }
    
    // Delete node
    // Time: O(log n) average, O(n) worst, Space: O(h)
    delete(data) {
        this.root = this.deleteNode(this.root, data);
    }
    
    deleteNode(node, data) {
        if (!node) {
            return null;
        }
        
        if (data < node.data) {
            node.left = this.deleteNode(node.left, data);
        } else if (data > node.data) {
            node.right = this.deleteNode(node.right, data);
        } else {
            // Node to be deleted found
            
            // Case 1: No children (leaf node)
            if (!node.left && !node.right) {
                return null;
            }
            
            // Case 2: One child
            if (!node.left) {
                return node.right;
            }
            if (!node.right) {
                return node.left;
            }
            
            // Case 3: Two children
            // Find inorder successor (smallest in right subtree)
            const successor = this.findMinNode(node.right);
            node.data = successor.data;
            node.right = this.deleteNode(node.right, successor.data);
        }
        
        return node;
    }
    
    // Helper method to find minimum node
    findMinNode(node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    }
    
    // Validate if tree is a valid BST
    // Time: O(n), Space: O(h)
    isValidBST(node = this.root, min = null, max = null) {
        if (!node) {
            return true;
        }
        
        if ((min !== null && node.data <= min) || 
            (max !== null && node.data >= max)) {
            return false;
        }
        
        return this.isValidBST(node.left, min, node.data) &&
               this.isValidBST(node.right, node.data, max);
    }
    
    // Find kth smallest element
    // Time: O(k), Space: O(h)
    kthSmallest(k) {
        const result = { count: 0, value: null };
        this.inorderKth(this.root, k, result);
        return result.value;
    }
    
    inorderKth(node, k, result) {
        if (!node || result.count >= k) {
            return;
        }
        
        this.inorderKth(node.left, k, result);
        
        result.count++;
        if (result.count === k) {
            result.value = node.data;
            return;
        }
        
        this.inorderKth(node.right, k, result);
    }
    
    // Find lowest common ancestor
    // Time: O(log n) average, O(n) worst, Space: O(h)
    findLCA(node1Data, node2Data, node = this.root) {
        if (!node) {
            return null;
        }
        
        // If both nodes are smaller, LCA is in left subtree
        if (node1Data < node.data && node2Data < node.data) {
            return this.findLCA(node1Data, node2Data, node.left);
        }
        
        // If both nodes are larger, LCA is in right subtree
        if (node1Data > node.data && node2Data > node.data) {
            return this.findLCA(node1Data, node2Data, node.right);
        }
        
        // If one is smaller and one is larger, current node is LCA
        return node.data;
    }
}

// Tree Traversal Methods
class TreeTraversal {
    // Inorder Traversal (Left, Root, Right)
    // Time: O(n), Space: O(h)
    static inorder(node, result = []) {
        if (node) {
            TreeTraversal.inorder(node.left, result);
            result.push(node.data);
            TreeTraversal.inorder(node.right, result);
        }
        return result;
    }
    
    // Preorder Traversal (Root, Left, Right)
    // Time: O(n), Space: O(h)
    static preorder(node, result = []) {
        if (node) {
            result.push(node.data);
            TreeTraversal.preorder(node.left, result);
            TreeTraversal.preorder(node.right, result);
        }
        return result;
    }
    
    // Postorder Traversal (Left, Right, Root)
    // Time: O(n), Space: O(h)
    static postorder(node, result = []) {
        if (node) {
            TreeTraversal.postorder(node.left, result);
            TreeTraversal.postorder(node.right, result);
            result.push(node.data);
        }
        return result;
    }
    
    // Level Order Traversal (Breadth-First)
    // Time: O(n), Space: O(w) where w is maximum width
    static levelOrder(root) {
        if (!root) {
            return [];
        }
        
        const result = [];
        const queue = [root];
        
        while (queue.length > 0) {
            const levelSize = queue.length;
            const currentLevel = [];
            
            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                currentLevel.push(node.data);
                
                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
            }
            
            result.push(currentLevel);
        }
        
        return result;
    }
    
    // Iterative Inorder Traversal
    // Time: O(n), Space: O(h)
    static inorderIterative(root) {
        const result = [];
        const stack = [];
        let current = root;
        
        while (current || stack.length > 0) {
            // Go to leftmost node
            while (current) {
                stack.push(current);
                current = current.left;
            }
            
            // Process current node
            current = stack.pop();
            result.push(current.data);
            
            // Move to right subtree
            current = current.right;
        }
        
        return result;
    }
}

// Tree Applications
class TreeApplications {
    // Build tree from inorder and preorder traversals
    // Time: O(n), Space: O(n)
    static buildTreeFromTraversals(preorder, inorder) {
        if (preorder.length === 0 || inorder.length === 0) {
            return null;
        }
        
        const rootVal = preorder[0];
        const root = new TreeNode(rootVal);
        const rootIndex = inorder.indexOf(rootVal);
        
        const leftInorder = inorder.slice(0, rootIndex);
        const rightInorder = inorder.slice(rootIndex + 1);
        
        const leftPreorder = preorder.slice(1, 1 + leftInorder.length);
        const rightPreorder = preorder.slice(1 + leftInorder.length);
        
        root.left = TreeApplications.buildTreeFromTraversals(leftPreorder, leftInorder);
        root.right = TreeApplications.buildTreeFromTraversals(rightPreorder, rightInorder);
        
        return root;
    }
    
    // Convert sorted array to balanced BST
    // Time: O(n), Space: O(log n)
    static sortedArrayToBST(nums) {
        if (nums.length === 0) {
            return null;
        }
        
        const mid = Math.floor(nums.length / 2);
        const root = new TreeNode(nums[mid]);
        
        root.left = TreeApplications.sortedArrayToBST(nums.slice(0, mid));
        root.right = TreeApplications.sortedArrayToBST(nums.slice(mid + 1));
        
        return root;
    }
    
    // Find diameter of binary tree
    // Time: O(n), Space: O(h)
    static diameterOfBinaryTree(root) {
        let diameter = 0;
        
        function height(node) {
            if (!node) return 0;
            
            const leftHeight = height(node.left);
            const rightHeight = height(node.right);
            
            // Update diameter if path through current node is longer
            diameter = Math.max(diameter, leftHeight + rightHeight);
            
            return 1 + Math.max(leftHeight, rightHeight);
        }
        
        height(root);
        return diameter;
    }
    
    // Check if two trees are identical
    // Time: O(n), Space: O(h)
    static isSameTree(p, q) {
        if (!p && !q) return true;
        if (!p || !q) return false;
        
        return p.data === q.data &&
               TreeApplications.isSameTree(p.left, q.left) &&
               TreeApplications.isSameTree(p.right, q.right);
    }
}

// Example Usage
console.log('=== Binary Tree Demo ===');
const bt = new BinaryTree();
bt.insert(1);
bt.insert(2);
bt.insert(3);
bt.insert(4);
bt.insert(5);

console.log('Tree height:', bt.getHeight()); // 2
console.log('Node count:', bt.countNodes()); // 5
console.log('Is balanced:', bt.isBalanced()); // true
console.log('Search 4:', bt.search(4)); // true

console.log('\n=== Binary Search Tree Demo ===');
const bst = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(val => bst.insert(val));

console.log('Search 40:', bst.search(40)); // true
console.log('Min value:', bst.findMin()); // 20
console.log('Max value:', bst.findMax()); // 80
console.log('Is valid BST:', bst.isValidBST()); // true
console.log('3rd smallest:', bst.kthSmallest(3)); // 40
console.log('LCA of 20 and 40:', bst.findLCA(20, 40)); // 30

console.log('\n=== Tree Traversals ===');
console.log('Inorder:', TreeTraversal.inorder(bst.root)); // [20, 30, 40, 50, 60, 70, 80]
console.log('Preorder:', TreeTraversal.preorder(bst.root)); // [50, 30, 20, 40, 70, 60, 80]
console.log('Postorder:', TreeTraversal.postorder(bst.root)); // [20, 40, 30, 60, 80, 70, 50]
console.log('Level order:', TreeTraversal.levelOrder(bst.root));

console.log('\n=== Tree Applications ===');
const sortedArray = [1, 2, 3, 4, 5, 6, 7];
const balancedBST = TreeApplications.sortedArrayToBST(sortedArray);
console.log('Balanced BST from sorted array:', TreeTraversal.inorder(balancedBST));
console.log('Diameter of tree:', TreeApplications.diameterOfBinaryTree(bst.root));
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <algorithm>
#include <climits>
using namespace std;

// Binary Tree Node
struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

// Binary Tree Class
class BinaryTree {
public:
    TreeNode* root;
    
    BinaryTree() : root(nullptr) {}
    
    // Destructor to prevent memory leaks
    ~BinaryTree() {
        destroyTree(root);
    }
    
    // Insert node (level-order insertion)
    // Time: O(n), Space: O(n)
    void insert(int data) {
        TreeNode* newNode = new TreeNode(data);
        
        if (!root) {
            root = newNode;
            return;
        }
        
        queue<TreeNode*> q;
        q.push(root);
        
        while (!q.empty()) {
            TreeNode* current = q.front();
            q.pop();
            
            if (!current->left) {
                current->left = newNode;
                return;
            } else if (!current->right) {
                current->right = newNode;
                return;
            } else {
                q.push(current->left);
                q.push(current->right);
            }
        }
    }
    
    // Search for a value
    // Time: O(n), Space: O(h)
    bool search(int data, TreeNode* node = nullptr) {
        if (node == nullptr) node = root;
        if (!node) return false;
        
        if (node->data == data) return true;
        
        return search(data, node->left) || search(data, node->right);
    }
    
    // Get height of tree
    // Time: O(n), Space: O(h)
    int getHeight(TreeNode* node = nullptr) {
        if (node == nullptr) node = root;
        if (!node) return -1;
        
        return 1 + max(getHeight(node->left), getHeight(node->right));
    }
    
    // Count total nodes
    // Time: O(n), Space: O(h)
    int countNodes(TreeNode* node = nullptr) {
        if (node == nullptr) node = root;
        if (!node) return 0;
        
        return 1 + countNodes(node->left) + countNodes(node->right);
    }
    
    // Check if tree is balanced
    // Time: O(n), Space: O(h)
    bool isBalanced(TreeNode* node = nullptr) {
        if (node == nullptr) node = root;
        if (!node) return true;
        
        int leftHeight = getHeight(node->left);
        int rightHeight = getHeight(node->right);
        
        return abs(leftHeight - rightHeight) <= 1 &&
               isBalanced(node->left) &&
               isBalanced(node->right);
    }
    
private:
    // Helper function to destroy tree
    void destroyTree(TreeNode* node) {
        if (node) {
            destroyTree(node->left);
            destroyTree(node->right);
            delete node;
        }
    }
};

// Binary Search Tree Class
class BinarySearchTree {
public:
    TreeNode* root;
    
    BinarySearchTree() : root(nullptr) {}
    
    // Destructor
    ~BinarySearchTree() {
        destroyTree(root);
    }
    
    // Insert node maintaining BST property
    // Time: O(log n) average, O(n) worst, Space: O(h)
    void insert(int data) {
        root = insertNode(root, data);
    }
    
    // Search for a value
    // Time: O(log n) average, O(n) worst, Space: O(h)
    bool search(int data, TreeNode* node = nullptr) {
        if (node == nullptr) node = root;
        if (!node) return false;
        
        if (data == node->data) {
            return true;
        } else if (data < node->data) {
            return search(data, node->left);
        } else {
            return search(data, node->right);
        }
    }
    
    // Find minimum value
    // Time: O(log n) average, O(n) worst, Space: O(1)
    int findMin() {
        if (!root) throw runtime_error("Tree is empty");
        
        TreeNode* current = root;
        while (current->left) {
            current = current->left;
        }
        return current->data;
    }
    
    // Find maximum value
    // Time: O(log n) average, O(n) worst, Space: O(1)
    int findMax() {
        if (!root) throw runtime_error("Tree is empty");
        
        TreeNode* current = root;
        while (current->right) {
            current = current->right;
        }
        return current->data;
    }
    
    // Delete node
    // Time: O(log n) average, O(n) worst, Space: O(h)
    void deleteNode(int data) {
        root = deleteNodeHelper(root, data);
    }
    
    // Validate if tree is a valid BST
    // Time: O(n), Space: O(h)
    bool isValidBST() {
        return isValidBSTHelper(root, INT_MIN, INT_MAX);
    }
    
    // Find kth smallest element
    // Time: O(k), Space: O(h)
    int kthSmallest(int k) {
        int count = 0;
        int result = -1;
        inorderKth(root, k, count, result);
        return result;
    }
    
    // Find lowest common ancestor
    // Time: O(log n) average, O(n) worst, Space: O(h)
    int findLCA(int node1, int node2) {
        TreeNode* lca = findLCAHelper(root, node1, node2);
        return lca ? lca->data : -1;
    }
    
private:
    TreeNode* insertNode(TreeNode* node, int data) {
        if (!node) {
            return new TreeNode(data);
        }
        
        if (data < node->data) {
            node->left = insertNode(node->left, data);
        } else if (data > node->data) {
            node->right = insertNode(node->right, data);
        }
        // Ignore duplicates
        
        return node;
    }
    
    TreeNode* deleteNodeHelper(TreeNode* node, int data) {
        if (!node) return nullptr;
        
        if (data < node->data) {
            node->left = deleteNodeHelper(node->left, data);
        } else if (data > node->data) {
            node->right = deleteNodeHelper(node->right, data);
        } else {
            // Node to be deleted found
            
            // Case 1: No children
            if (!node->left && !node->right) {
                delete node;
                return nullptr;
            }
            
            // Case 2: One child
            if (!node->left) {
                TreeNode* temp = node->right;
                delete node;
                return temp;
            }
            if (!node->right) {
                TreeNode* temp = node->left;
                delete node;
                return temp;
            }
            
            // Case 3: Two children
            TreeNode* successor = findMinNode(node->right);
            node->data = successor->data;
            node->right = deleteNodeHelper(node->right, successor->data);
        }
        
        return node;
    }
    
    TreeNode* findMinNode(TreeNode* node) {
        while (node->left) {
            node = node->left;
        }
        return node;
    }
    
    bool isValidBSTHelper(TreeNode* node, int minVal, int maxVal) {
        if (!node) return true;
        
        if (node->data <= minVal || node->data >= maxVal) {
            return false;
        }
        
        return isValidBSTHelper(node->left, minVal, node->data) &&
               isValidBSTHelper(node->right, node->data, maxVal);
    }
    
    void inorderKth(TreeNode* node, int k, int& count, int& result) {
        if (!node || count >= k) return;
        
        inorderKth(node->left, k, count, result);
        
        count++;
        if (count == k) {
            result = node->data;
            return;
        }
        
        inorderKth(node->right, k, count, result);
    }
    
    TreeNode* findLCAHelper(TreeNode* node, int node1, int node2) {
        if (!node) return nullptr;
        
        if (node1 < node->data && node2 < node->data) {
            return findLCAHelper(node->left, node1, node2);
        }
        
        if (node1 > node->data && node2 > node->data) {
            return findLCAHelper(node->right, node1, node2);
        }
        
        return node;
    }
    
    void destroyTree(TreeNode* node) {
        if (node) {
            destroyTree(node->left);
            destroyTree(node->right);
            delete node;
        }
    }
};

// Tree Traversal Class
class TreeTraversal {
public:
    // Inorder Traversal (Left, Root, Right)
    // Time: O(n), Space: O(h)
    static void inorder(TreeNode* node, vector<int>& result) {
        if (node) {
            inorder(node->left, result);
            result.push_back(node->data);
            inorder(node->right, result);
        }
    }
    
    // Preorder Traversal (Root, Left, Right)
    // Time: O(n), Space: O(h)
    static void preorder(TreeNode* node, vector<int>& result) {
        if (node) {
            result.push_back(node->data);
            preorder(node->left, result);
            preorder(node->right, result);
        }
    }
    
    // Postorder Traversal (Left, Right, Root)
    // Time: O(n), Space: O(h)
    static void postorder(TreeNode* node, vector<int>& result) {
        if (node) {
            postorder(node->left, result);
            postorder(node->right, result);
            result.push_back(node->data);
        }
    }
    
    // Level Order Traversal
    // Time: O(n), Space: O(w)
    static vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (!root) return result;
        
        queue<TreeNode*> q;
        q.push(root);
        
        while (!q.empty()) {
            int levelSize = q.size();
            vector<int> currentLevel;
            
            for (int i = 0; i < levelSize; i++) {
                TreeNode* node = q.front();
                q.pop();
                currentLevel.push_back(node->data);
                
                if (node->left) q.push(node->left);
                if (node->right) q.push(node->right);
            }
            
            result.push_back(currentLevel);
        }
        
        return result;
    }
    
    // Iterative Inorder Traversal
    // Time: O(n), Space: O(h)
    static vector<int> inorderIterative(TreeNode* root) {
        vector<int> result;
        stack<TreeNode*> stk;
        TreeNode* current = root;
        
        while (current || !stk.empty()) {
            while (current) {
                stk.push(current);
                current = current->left;
            }
            
            current = stk.top();
            stk.pop();
            result.push_back(current->data);
            
            current = current->right;
        }
        
        return result;
    }
};

// Example Usage
int main() {
    cout << "=== Binary Tree Demo ===" << endl;
    BinaryTree bt;
    bt.insert(1);
    bt.insert(2);
    bt.insert(3);
    bt.insert(4);
    bt.insert(5);
    
    cout << "Tree height: " << bt.getHeight() << endl;
    cout << "Node count: " << bt.countNodes() << endl;
    cout << "Is balanced: " << (bt.isBalanced() ? "Yes" : "No") << endl;
    cout << "Search 4: " << (bt.search(4) ? "Found" : "Not found") << endl;
    
    cout << "\n=== Binary Search Tree Demo ===" << endl;
    BinarySearchTree bst;
    vector<int> values = {50, 30, 70, 20, 40, 60, 80};
    for (int val : values) {
        bst.insert(val);
    }
    
    cout << "Search 40: " << (bst.search(40) ? "Found" : "Not found") << endl;
    cout << "Min value: " << bst.findMin() << endl;
    cout << "Max value: " << bst.findMax() << endl;
    cout << "Is valid BST: " << (bst.isValidBST() ? "Yes" : "No") << endl;
    cout << "3rd smallest: " << bst.kthSmallest(3) << endl;
    cout << "LCA of 20 and 40: " << bst.findLCA(20, 40) << endl;
    
    cout << "\n=== Tree Traversals ===" << endl;
    vector<int> inorderResult, preorderResult, postorderResult;
    
    TreeTraversal::inorder(bst.root, inorderResult);
    TreeTraversal::preorder(bst.root, preorderResult);
    TreeTraversal::postorder(bst.root, postorderResult);
    
    cout << "Inorder: ";
    for (int val : inorderResult) cout << val << " ";
    cout << endl;
    
    cout << "Preorder: ";
    for (int val : preorderResult) cout << val << " ";
    cout << endl;
    
    cout << "Postorder: ";
    for (int val : postorderResult) cout << val << " ";
    cout << endl;
    
    vector<vector<int>> levelOrderResult = TreeTraversal::levelOrder(bst.root);
    cout << "Level order: ";
    for (const auto& level : levelOrderResult) {
        cout << "[";
        for (int i = 0; i < level.size(); i++) {
            cout << level[i];
            if (i < level.size() - 1) cout << ", ";
        }
        cout << "] ";
    }
    cout << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Comparison:

| Operation | Binary Tree | Binary Search Tree (Balanced) | Binary Search Tree (Worst) |
|-----------|-------------|-------------------------------|----------------------------|
| Search | O(n) | O(log n) | O(n) |
| Insert | O(n) | O(log n) | O(n) |
| Delete | O(n) | O(log n) | O(n) |
| Traversal | O(n) | O(n) | O(n) |

### Space Complexity:
- **Tree storage**: O(n) where n is number of nodes
- **Recursive operations**: O(h) where h is height
- **Balanced tree height**: O(log n)
- **Worst case height**: O(n) - skewed tree

### Common Pitfalls:
1. **Memory leaks**: Not properly deallocating nodes in C++
2. **Stack overflow**: Deep recursion in skewed trees
3. **BST property violation**: Incorrect insertion/deletion
4. **Null pointer access**: Not checking for null nodes

---

## 🧩 Practice Problems

### Problem 1: Validate Binary Search Tree
**Question**: Determine if a binary tree is a valid BST.

**Solution**:
```javascript
function isValidBST(root, min = null, max = null) {
    if (!root) return true;
    
    if ((min !== null && root.val <= min) || 
        (max !== null && root.val >= max)) {
        return false;
    }
    
    return isValidBST(root.left, min, root.val) &&
           isValidBST(root.right, root.val, max);
}
```

### Problem 2: Lowest Common Ancestor
**Question**: Find the lowest common ancestor of two nodes in a BST.

**Hint**: Use BST property to navigate efficiently.

### Problem 3: Binary Tree Level Order Traversal
**Question**: Return the level order traversal of a binary tree.

**Hint**: Use a queue for breadth-first traversal.

### Problem 4: Convert Sorted Array to BST
**Question**: Convert a sorted array to a height-balanced BST.

**Hint**: Use divide and conquer with middle element as root.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Tree traversal mastery**: Can you implement all traversal methods?
2. **BST property understanding**: Do you maintain ordering during operations?
3. **Recursion skills**: Comfortable with recursive tree algorithms?
4. **Edge case handling**: Empty trees, single nodes, null pointers

### Common Interview Patterns:
- **Tree traversal**: Inorder, preorder, postorder, level-order
- **Tree construction**: From traversals, from sorted arrays
- **Tree validation**: BST validation, balanced tree checks
- **Path problems**: Root to leaf paths, path sums

### Red Flags to Avoid:
- Not handling null/empty trees
- Confusing tree traversal orders
- Violating BST property during modifications
- Not considering tree balance and performance

### Pro Tips:
1. **Draw the tree**: Visualize the problem
2. **Think recursively**: Most tree problems have recursive solutions
3. **Consider base cases**: Empty nodes, leaf nodes
4. **Practice traversals**: Master all four traversal methods

---

## 🚀 Key Takeaways

1. **Trees provide hierarchical organization** - Natural for many data relationships
2. **BSTs enable efficient searching** - O(log n) in balanced trees
3. **Traversals are fundamental** - Master inorder, preorder, postorder, level-order
4. **Balance matters for performance** - Avoid skewed trees
5. **Recursion is your friend** - Most tree algorithms are naturally recursive

**Next Chapter**: We'll explore Recursion in detail and see how it's the foundation for many tree and other algorithms.