# Chapter 3: Stacks & Queues - LIFO and FIFO Data Structures

## 🎯 What Are Stacks & Queues?

**Stack** is a linear data structure that follows the Last In, First Out (LIFO) principle. Think of it like a stack of plates - you can only add or remove plates from the top.

**Queue** is a linear data structure that follows the First In, First Out (FIFO) principle. Think of it like a line at a store - the first person in line is the first to be served.

### Why Stacks & Queues Matter:
- **Function calls**: Call stack in programming languages
- **Undo operations**: Text editors, browsers
- **Expression evaluation**: Parsing mathematical expressions
- **BFS/DFS**: Graph traversal algorithms
- **Task scheduling**: Operating systems, print queues

---

## 🔍 Stack Operations

### Core Operations:
1. **Push**: Add element to the top
2. **Pop**: Remove element from the top
3. **Peek/Top**: View the top element without removing
4. **isEmpty**: Check if stack is empty
5. **Size**: Get number of elements

### Applications:
- **Expression evaluation** (infix to postfix)
- **Parentheses matching**
- **Function call management**
- **Undo/Redo operations**
- **Depth-First Search (DFS)**

---

## 🔍 Queue Operations

### Core Operations:
1. **Enqueue**: Add element to the rear
2. **Dequeue**: Remove element from the front
3. **Front**: View the front element
4. **Rear**: View the rear element
5. **isEmpty**: Check if queue is empty
6. **Size**: Get number of elements

### Types of Queues:
- **Simple Queue**: Basic FIFO queue
- **Circular Queue**: Rear connects back to front
- **Priority Queue**: Elements have priorities
- **Deque**: Double-ended queue (insertion/deletion at both ends)

---

## 💻 JavaScript Implementation

```javascript
// Stack Implementation using Array
class Stack {
    constructor() {
        this.items = [];
    }
    
    // Push element to top
    // Time: O(1), Space: O(1)
    push(element) {
        this.items.push(element);
        return this.size();
    }
    
    // Pop element from top
    // Time: O(1), Space: O(1)
    pop() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        return this.items.pop();
    }
    
    // Peek at top element
    // Time: O(1), Space: O(1)
    peek() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        return this.items[this.items.length - 1];
    }
    
    // Check if stack is empty
    isEmpty() {
        return this.items.length === 0;
    }
    
    // Get stack size
    size() {
        return this.items.length;
    }
    
    // Clear stack
    clear() {
        this.items = [];
    }
    
    // Convert to array for display
    toArray() {
        return [...this.items];
    }
}

// Stack Implementation using Linked List
class StackNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class LinkedStack {
    constructor() {
        this.top = null;
        this.count = 0;
    }
    
    // Push element
    // Time: O(1), Space: O(1)
    push(data) {
        const newNode = new StackNode(data);
        newNode.next = this.top;
        this.top = newNode;
        this.count++;
        return this.count;
    }
    
    // Pop element
    // Time: O(1), Space: O(1)
    pop() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        
        const poppedData = this.top.data;
        this.top = this.top.next;
        this.count--;
        return poppedData;
    }
    
    // Peek at top
    peek() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        return this.top.data;
    }
    
    isEmpty() {
        return this.top === null;
    }
    
    size() {
        return this.count;
    }
}

// Queue Implementation using Array
class Queue {
    constructor() {
        this.items = [];
    }
    
    // Add element to rear
    // Time: O(1), Space: O(1)
    enqueue(element) {
        this.items.push(element);
        return this.size();
    }
    
    // Remove element from front
    // Time: O(n) due to array shift, Space: O(1)
    dequeue() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items.shift();
    }
    
    // View front element
    front() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items[0];
    }
    
    // View rear element
    rear() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
    
    toArray() {
        return [...this.items];
    }
}

// Optimized Queue using Two Pointers
class OptimizedQueue {
    constructor() {
        this.items = [];
        this.frontIndex = 0;
        this.rearIndex = 0;
    }
    
    // Enqueue operation
    // Time: O(1), Space: O(1)
    enqueue(element) {
        this.items[this.rearIndex] = element;
        this.rearIndex++;
        return this.size();
    }
    
    // Dequeue operation
    // Time: O(1), Space: O(1)
    dequeue() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        
        const dequeuedElement = this.items[this.frontIndex];
        delete this.items[this.frontIndex];
        this.frontIndex++;
        
        // Reset pointers when queue becomes empty
        if (this.frontIndex === this.rearIndex) {
            this.frontIndex = 0;
            this.rearIndex = 0;
        }
        
        return dequeuedElement;
    }
    
    front() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items[this.frontIndex];
    }
    
    isEmpty() {
        return this.frontIndex === this.rearIndex;
    }
    
    size() {
        return this.rearIndex - this.frontIndex;
    }
}

// Circular Queue Implementation
class CircularQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.items = new Array(capacity);
        this.front = -1;
        this.rear = -1;
        this.count = 0;
    }
    
    // Check if queue is full
    isFull() {
        return this.count === this.capacity;
    }
    
    isEmpty() {
        return this.count === 0;
    }
    
    // Enqueue operation
    // Time: O(1), Space: O(1)
    enqueue(element) {
        if (this.isFull()) {
            throw new Error('Queue is full');
        }
        
        if (this.isEmpty()) {
            this.front = 0;
            this.rear = 0;
        } else {
            this.rear = (this.rear + 1) % this.capacity;
        }
        
        this.items[this.rear] = element;
        this.count++;
        return this.count;
    }
    
    // Dequeue operation
    // Time: O(1), Space: O(1)
    dequeue() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        
        const dequeuedElement = this.items[this.front];
        this.items[this.front] = undefined;
        
        if (this.count === 1) {
            this.front = -1;
            this.rear = -1;
        } else {
            this.front = (this.front + 1) % this.capacity;
        }
        
        this.count--;
        return dequeuedElement;
    }
    
    getFront() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items[this.front];
    }
    
    getRear() {
        if (this.isEmpty()) {
            throw new Error('Queue is empty');
        }
        return this.items[this.rear];
    }
    
    size() {
        return this.count;
    }
    
    display() {
        if (this.isEmpty()) {
            return [];
        }
        
        const result = [];
        let i = this.front;
        let itemsAdded = 0;
        
        while (itemsAdded < this.count) {
            result.push(this.items[i]);
            i = (i + 1) % this.capacity;
            itemsAdded++;
        }
        
        return result;
    }
}

// Stack Applications
class StackApplications {
    // Check balanced parentheses
    // Time: O(n), Space: O(n)
    static isBalanced(expression) {
        const stack = new Stack();
        const pairs = {
            ')': '(',
            '}': '{',
            ']': '['
        };
        
        for (let char of expression) {
            if (char === '(' || char === '{' || char === '[') {
                stack.push(char);
            } else if (char === ')' || char === '}' || char === ']') {
                if (stack.isEmpty() || stack.pop() !== pairs[char]) {
                    return false;
                }
            }
        }
        
        return stack.isEmpty();
    }
    
    // Convert infix to postfix
    // Time: O(n), Space: O(n)
    static infixToPostfix(infix) {
        const stack = new Stack();
        let postfix = '';
        const precedence = {
            '+': 1, '-': 1,
            '*': 2, '/': 2,
            '^': 3
        };
        
        for (let char of infix) {
            if (/[a-zA-Z0-9]/.test(char)) {
                postfix += char;
            } else if (char === '(') {
                stack.push(char);
            } else if (char === ')') {
                while (!stack.isEmpty() && stack.peek() !== '(') {
                    postfix += stack.pop();
                }
                stack.pop(); // Remove '('
            } else if (precedence[char]) {
                while (!stack.isEmpty() && 
                       stack.peek() !== '(' && 
                       precedence[stack.peek()] >= precedence[char]) {
                    postfix += stack.pop();
                }
                stack.push(char);
            }
        }
        
        while (!stack.isEmpty()) {
            postfix += stack.pop();
        }
        
        return postfix;
    }
    
    // Evaluate postfix expression
    // Time: O(n), Space: O(n)
    static evaluatePostfix(postfix) {
        const stack = new Stack();
        
        for (let char of postfix) {
            if (/\d/.test(char)) {
                stack.push(parseInt(char));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                
                switch (char) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        stack.push(Math.floor(a / b));
                        break;
                }
            }
        }
        
        return stack.pop();
    }
}

// Example Usage
console.log('=== Stack Demo ===');
const stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
console.log('Stack:', stack.toArray()); // [1, 2, 3]
console.log('Pop:', stack.pop()); // 3
console.log('Peek:', stack.peek()); // 2

console.log('\n=== Queue Demo ===');
const queue = new Queue();
queue.enqueue('A');
queue.enqueue('B');
queue.enqueue('C');
console.log('Queue:', queue.toArray()); // ['A', 'B', 'C']
console.log('Dequeue:', queue.dequeue()); // 'A'
console.log('Front:', queue.front()); // 'B'

console.log('\n=== Circular Queue Demo ===');
const circularQueue = new CircularQueue(3);
circularQueue.enqueue(1);
circularQueue.enqueue(2);
circularQueue.enqueue(3);
console.log('Circular Queue:', circularQueue.display()); // [1, 2, 3]
circularQueue.dequeue();
circularQueue.enqueue(4);
console.log('After dequeue and enqueue:', circularQueue.display()); // [2, 3, 4]

console.log('\n=== Stack Applications ===');
console.log('Balanced "({[]})": ', StackApplications.isBalanced('({[]})')); // true
console.log('Infix "A+B*C" to postfix:', StackApplications.infixToPostfix('A+B*C')); // ABC*+
console.log('Evaluate "23*4+":', StackApplications.evaluatePostfix('23*4+')); // 10
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
#include <stack>
#include <queue>
using namespace std;

// Stack Implementation using Array
template<typename T>
class ArrayStack {
private:
    vector<T> items;
    
public:
    // Push element to top
    // Time: O(1), Space: O(1)
    void push(const T& element) {
        items.push_back(element);
    }
    
    // Pop element from top
    // Time: O(1), Space: O(1)
    T pop() {
        if (isEmpty()) {
            throw runtime_error("Stack is empty");
        }
        
        T topElement = items.back();
        items.pop_back();
        return topElement;
    }
    
    // Peek at top element
    // Time: O(1), Space: O(1)
    T peek() const {
        if (isEmpty()) {
            throw runtime_error("Stack is empty");
        }
        return items.back();
    }
    
    // Check if stack is empty
    bool isEmpty() const {
        return items.empty();
    }
    
    // Get stack size
    size_t size() const {
        return items.size();
    }
    
    // Display stack
    void display() const {
        cout << "Stack (top to bottom): [";
        for (int i = items.size() - 1; i >= 0; i--) {
            cout << items[i];
            if (i > 0) cout << ", ";
        }
        cout << "]" << endl;
    }
};

// Stack Implementation using Linked List
template<typename T>
struct StackNode {
    T data;
    StackNode* next;
    
    StackNode(const T& value) : data(value), next(nullptr) {}
};

template<typename T>
class LinkedStack {
private:
    StackNode<T>* top;
    size_t count;
    
public:
    LinkedStack() : top(nullptr), count(0) {}
    
    // Destructor
    ~LinkedStack() {
        clear();
    }
    
    // Push element
    // Time: O(1), Space: O(1)
    void push(const T& data) {
        StackNode<T>* newNode = new StackNode<T>(data);
        newNode->next = top;
        top = newNode;
        count++;
    }
    
    // Pop element
    // Time: O(1), Space: O(1)
    T pop() {
        if (isEmpty()) {
            throw runtime_error("Stack is empty");
        }
        
        T poppedData = top->data;
        StackNode<T>* temp = top;
        top = top->next;
        delete temp;
        count--;
        return poppedData;
    }
    
    // Peek at top
    T peek() const {
        if (isEmpty()) {
            throw runtime_error("Stack is empty");
        }
        return top->data;
    }
    
    bool isEmpty() const {
        return top == nullptr;
    }
    
    size_t size() const {
        return count;
    }
    
    // Clear all elements
    void clear() {
        while (!isEmpty()) {
            pop();
        }
    }
};

// Circular Queue Implementation
template<typename T>
class CircularQueue {
private:
    vector<T> items;
    int front;
    int rear;
    int capacity;
    int count;
    
public:
    CircularQueue(int cap) : capacity(cap), front(-1), rear(-1), count(0) {
        items.resize(capacity);
    }
    
    // Check if queue is full
    bool isFull() const {
        return count == capacity;
    }
    
    // Check if queue is empty
    bool isEmpty() const {
        return count == 0;
    }
    
    // Enqueue operation
    // Time: O(1), Space: O(1)
    void enqueue(const T& element) {
        if (isFull()) {
            throw runtime_error("Queue is full");
        }
        
        if (isEmpty()) {
            front = 0;
            rear = 0;
        } else {
            rear = (rear + 1) % capacity;
        }
        
        items[rear] = element;
        count++;
    }
    
    // Dequeue operation
    // Time: O(1), Space: O(1)
    T dequeue() {
        if (isEmpty()) {
            throw runtime_error("Queue is empty");
        }
        
        T dequeuedElement = items[front];
        
        if (count == 1) {
            front = -1;
            rear = -1;
        } else {
            front = (front + 1) % capacity;
        }
        
        count--;
        return dequeuedElement;
    }
    
    // Get front element
    T getFront() const {
        if (isEmpty()) {
            throw runtime_error("Queue is empty");
        }
        return items[front];
    }
    
    // Get rear element
    T getRear() const {
        if (isEmpty()) {
            throw runtime_error("Queue is empty");
        }
        return items[rear];
    }
    
    // Get size
    int size() const {
        return count;
    }
    
    // Display queue
    void display() const {
        if (isEmpty()) {
            cout << "Queue is empty" << endl;
            return;
        }
        
        cout << "Queue: [";
        int i = front;
        int itemsDisplayed = 0;
        
        while (itemsDisplayed < count) {
            cout << items[i];
            if (itemsDisplayed < count - 1) cout << ", ";
            i = (i + 1) % capacity;
            itemsDisplayed++;
        }
        cout << "]" << endl;
    }
};

// Stack Applications
class StackApplications {
public:
    // Check balanced parentheses
    // Time: O(n), Space: O(n)
    static bool isBalanced(const string& expression) {
        stack<char> s;
        
        for (char ch : expression) {
            if (ch == '(' || ch == '{' || ch == '[') {
                s.push(ch);
            } else if (ch == ')' || ch == '}' || ch == ']') {
                if (s.empty()) return false;
                
                char top = s.top();
                s.pop();
                
                if ((ch == ')' && top != '(') ||
                    (ch == '}' && top != '{') ||
                    (ch == ']' && top != '[')) {
                    return false;
                }
            }
        }
        
        return s.empty();
    }
    
    // Get precedence of operator
    static int getPrecedence(char op) {
        switch (op) {
            case '+': case '-': return 1;
            case '*': case '/': return 2;
            case '^': return 3;
            default: return 0;
        }
    }
    
    // Convert infix to postfix
    // Time: O(n), Space: O(n)
    static string infixToPostfix(const string& infix) {
        stack<char> s;
        string postfix = "";
        
        for (char ch : infix) {
            if (isalnum(ch)) {
                postfix += ch;
            } else if (ch == '(') {
                s.push(ch);
            } else if (ch == ')') {
                while (!s.empty() && s.top() != '(') {
                    postfix += s.top();
                    s.pop();
                }
                if (!s.empty()) s.pop(); // Remove '('
            } else if (getPrecedence(ch) > 0) {
                while (!s.empty() && 
                       s.top() != '(' && 
                       getPrecedence(s.top()) >= getPrecedence(ch)) {
                    postfix += s.top();
                    s.pop();
                }
                s.push(ch);
            }
        }
        
        while (!s.empty()) {
            postfix += s.top();
            s.pop();
        }
        
        return postfix;
    }
    
    // Evaluate postfix expression
    // Time: O(n), Space: O(n)
    static int evaluatePostfix(const string& postfix) {
        stack<int> s;
        
        for (char ch : postfix) {
            if (isdigit(ch)) {
                s.push(ch - '0');
            } else {
                int b = s.top(); s.pop();
                int a = s.top(); s.pop();
                
                switch (ch) {
                    case '+': s.push(a + b); break;
                    case '-': s.push(a - b); break;
                    case '*': s.push(a * b); break;
                    case '/': s.push(a / b); break;
                }
            }
        }
        
        return s.top();
    }
};

// Example Usage
int main() {
    cout << "=== Array Stack Demo ===" << endl;
    ArrayStack<int> arrayStack;
    arrayStack.push(1);
    arrayStack.push(2);
    arrayStack.push(3);
    arrayStack.display();
    cout << "Pop: " << arrayStack.pop() << endl;
    cout << "Peek: " << arrayStack.peek() << endl;
    
    cout << "\n=== Linked Stack Demo ===" << endl;
    LinkedStack<string> linkedStack;
    linkedStack.push("First");
    linkedStack.push("Second");
    linkedStack.push("Third");
    cout << "Size: " << linkedStack.size() << endl;
    cout << "Pop: " << linkedStack.pop() << endl;
    
    cout << "\n=== Circular Queue Demo ===" << endl;
    CircularQueue<int> cq(3);
    cq.enqueue(1);
    cq.enqueue(2);
    cq.enqueue(3);
    cq.display();
    cout << "Dequeue: " << cq.dequeue() << endl;
    cq.enqueue(4);
    cq.display();
    
    cout << "\n=== Stack Applications ===" << endl;
    cout << "Balanced \"({[]})\": " << (StackApplications::isBalanced("({[]})") ? "Yes" : "No") << endl;
    cout << "Infix \"A+B*C\" to postfix: " << StackApplications::infixToPostfix("A+B*C") << endl;
    cout << "Evaluate \"23*4+\": " << StackApplications::evaluatePostfix("23*4+") << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity:

| Operation | Array Stack | Linked Stack | Array Queue | Circular Queue |
|-----------|-------------|--------------|-------------|----------------|
| Push/Enqueue | O(1) | O(1) | O(1) | O(1) |
| Pop/Dequeue | O(1) | O(1) | O(n)* | O(1) |
| Peek/Front | O(1) | O(1) | O(1) | O(1) |
| Size | O(1) | O(1) | O(1) | O(1) |

*Array queue dequeue is O(n) due to shifting elements

### Space Complexity:
- **Array-based**: O(n) where n is the number of elements
- **Linked-based**: O(n) + pointer overhead
- **Circular Queue**: O(k) where k is the fixed capacity

### Common Pitfalls:
1. **Stack overflow**: Pushing too many elements
2. **Queue overflow**: In fixed-size implementations
3. **Underflow**: Popping from empty structures
4. **Memory leaks**: Not properly deallocating in C++

---

## 🧩 Practice Problems

### Problem 1: Valid Parentheses
**Question**: Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

**Solution**:
```javascript
function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    
    for (let char of s) {
        if (char in map) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}
```

### Problem 2: Implement Queue using Stacks
**Question**: Implement a first in first out (FIFO) queue using only two stacks.

**Hint**: Use one stack for enqueue and another for dequeue operations.

### Problem 3: Next Greater Element
**Question**: Find the next greater element for each element in an array.

**Hint**: Use a stack to keep track of elements for which we haven't found the next greater element yet.

### Problem 4: Sliding Window Maximum
**Question**: Find the maximum element in each sliding window of size k.

**Hint**: Use a deque to maintain elements in decreasing order.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Understanding of LIFO/FIFO**: Can you explain the principles clearly?
2. **Implementation choices**: When to use array vs. linked list?
3. **Edge case handling**: Empty structures, overflow/underflow
4. **Application knowledge**: Real-world uses of stacks and queues

### Common Interview Patterns:
- **Monotonic Stack**: For next greater/smaller element problems
- **Two Stacks**: To implement queue or undo/redo functionality
- **BFS with Queue**: Level-order traversal, shortest path
- **DFS with Stack**: Tree/graph traversal, backtracking

### Red Flags to Avoid:
- Not checking for empty structures before operations
- Confusing LIFO and FIFO principles
- Not considering space complexity in recursive solutions
- Implementing inefficient queue operations

### Pro Tips:
1. **Visualize the operations**: Draw the stack/queue state
2. **Consider circular arrays**: For efficient queue implementation
3. **Think about applications**: Expression evaluation, BFS/DFS
4. **Practice with constraints**: Fixed size vs. dynamic size

---

## 🚀 Key Takeaways

1. **Stacks are perfect for LIFO scenarios** - Function calls, undo operations
2. **Queues excel at FIFO processing** - Task scheduling, BFS
3. **Circular queues optimize space** - Better than simple array queues
4. **Choose implementation wisely** - Array vs. linked list trade-offs
5. **Master the applications** - Expression evaluation, parentheses matching

**Next Chapter**: We'll explore Hash Tables/Maps and learn about efficient key-value storage and retrieval.