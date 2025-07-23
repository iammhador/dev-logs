# Chapter 2: Linked Lists - Dynamic Memory Management

## 🎯 What Are Linked Lists?

**Linked Lists** are linear data structures where elements (nodes) are stored in sequence, but unlike arrays, they don't require contiguous memory. Each node contains data and a reference (pointer) to the next node in the sequence.

### Why Linked Lists Matter:
- **Dynamic Size**: Can grow or shrink during runtime
- **Efficient Insertion/Deletion**: O(1) at known positions
- **Memory Efficiency**: Only allocate what you need
- **Foundation**: Building block for stacks, queues, and graphs

### Types of Linked Lists:
1. **Singly Linked List**: Each node points to the next node
2. **Doubly Linked List**: Each node has pointers to both next and previous nodes
3. **Circular Linked List**: Last node points back to the first node

---

## 🔍 Core Operations

### 1. Insertion
- At the beginning (head)
- At the end (tail)
- At a specific position

### 2. Deletion
- From the beginning
- From the end
- From a specific position
- By value

### 3. Traversal
- Forward traversal
- Backward traversal (doubly linked)

### 4. Search
- Finding a node by value
- Finding a node by position

---

## 💻 JavaScript Implementation

```javascript
// Node class for singly linked list
class ListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Singly Linked List Implementation
class SinglyLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    // Insert at the beginning
    // Time: O(1), Space: O(1)
    insertAtHead(data) {
        const newNode = new ListNode(data);
        newNode.next = this.head;
        this.head = newNode;
        this.size++;
        return this;
    }
    
    // Insert at the end
    // Time: O(n), Space: O(1)
    insertAtTail(data) {
        const newNode = new ListNode(data);
        
        if (!this.head) {
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = newNode;
        }
        
        this.size++;
        return this;
    }
    
    // Insert at specific index
    // Time: O(n), Space: O(1)
    insertAt(index, data) {
        if (index < 0 || index > this.size) {
            throw new Error('Index out of bounds');
        }
        
        if (index === 0) {
            return this.insertAtHead(data);
        }
        
        const newNode = new ListNode(data);
        let current = this.head;
        
        // Traverse to position index-1
        for (let i = 0; i < index - 1; i++) {
            current = current.next;
        }
        
        newNode.next = current.next;
        current.next = newNode;
        this.size++;
        return this;
    }
    
    // Delete from head
    // Time: O(1), Space: O(1)
    deleteHead() {
        if (!this.head) {
            return null;
        }
        
        const deletedData = this.head.data;
        this.head = this.head.next;
        this.size--;
        return deletedData;
    }
    
    // Delete from tail
    // Time: O(n), Space: O(1)
    deleteTail() {
        if (!this.head) {
            return null;
        }
        
        if (!this.head.next) {
            const deletedData = this.head.data;
            this.head = null;
            this.size--;
            return deletedData;
        }
        
        let current = this.head;
        while (current.next.next) {
            current = current.next;
        }
        
        const deletedData = current.next.data;
        current.next = null;
        this.size--;
        return deletedData;
    }
    
    // Delete by value
    // Time: O(n), Space: O(1)
    deleteByValue(value) {
        if (!this.head) {
            return false;
        }
        
        if (this.head.data === value) {
            this.deleteHead();
            return true;
        }
        
        let current = this.head;
        while (current.next && current.next.data !== value) {
            current = current.next;
        }
        
        if (current.next) {
            current.next = current.next.next;
            this.size--;
            return true;
        }
        
        return false;
    }
    
    // Search for value
    // Time: O(n), Space: O(1)
    search(value) {
        let current = this.head;
        let index = 0;
        
        while (current) {
            if (current.data === value) {
                return index;
            }
            current = current.next;
            index++;
        }
        
        return -1;
    }
    
    // Reverse the linked list
    // Time: O(n), Space: O(1)
    reverse() {
        let prev = null;
        let current = this.head;
        let next = null;
        
        while (current) {
            next = current.next;  // Store next node
            current.next = prev;  // Reverse the link
            prev = current;       // Move prev forward
            current = next;       // Move current forward
        }
        
        this.head = prev;
        return this;
    }
    
    // Find middle element (Floyd's Cycle Detection)
    // Time: O(n), Space: O(1)
    findMiddle() {
        if (!this.head) return null;
        
        let slow = this.head;
        let fast = this.head;
        
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
        }
        
        return slow.data;
    }
    
    // Detect cycle in linked list
    // Time: O(n), Space: O(1)
    hasCycle() {
        if (!this.head) return false;
        
        let slow = this.head;
        let fast = this.head;
        
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            
            if (slow === fast) {
                return true;
            }
        }
        
        return false;
    }
    
    // Convert to array for easy display
    toArray() {
        const result = [];
        let current = this.head;
        
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        
        return result;
    }
    
    // Get size
    getSize() {
        return this.size;
    }
}

// Doubly Linked List Node
class DoublyListNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

// Doubly Linked List Implementation
class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    
    // Insert at head
    // Time: O(1), Space: O(1)
    insertAtHead(data) {
        const newNode = new DoublyListNode(data);
        
        if (!this.head) {
            this.head = this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        
        this.size++;
        return this;
    }
    
    // Insert at tail
    // Time: O(1), Space: O(1)
    insertAtTail(data) {
        const newNode = new DoublyListNode(data);
        
        if (!this.tail) {
            this.head = this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        
        this.size++;
        return this;
    }
    
    // Delete from head
    // Time: O(1), Space: O(1)
    deleteHead() {
        if (!this.head) return null;
        
        const deletedData = this.head.data;
        
        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.head = this.head.next;
            this.head.prev = null;
        }
        
        this.size--;
        return deletedData;
    }
    
    // Delete from tail
    // Time: O(1), Space: O(1)
    deleteTail() {
        if (!this.tail) return null;
        
        const deletedData = this.tail.data;
        
        if (this.head === this.tail) {
            this.head = this.tail = null;
        } else {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        
        this.size--;
        return deletedData;
    }
    
    // Convert to array (forward)
    toArray() {
        const result = [];
        let current = this.head;
        
        while (current) {
            result.push(current.data);
            current = current.next;
        }
        
        return result;
    }
    
    // Convert to array (backward)
    toArrayReverse() {
        const result = [];
        let current = this.tail;
        
        while (current) {
            result.push(current.data);
            current = current.prev;
        }
        
        return result;
    }
}

// Example Usage
const sll = new SinglyLinkedList();
sll.insertAtHead(1).insertAtHead(2).insertAtTail(3).insertAt(1, 5);
console.log('Singly Linked List:', sll.toArray()); // [2, 5, 1, 3]
console.log('Middle element:', sll.findMiddle()); // 5
sll.reverse();
console.log('After reverse:', sll.toArray()); // [3, 1, 5, 2]

const dll = new DoublyLinkedList();
dll.insertAtHead(1).insertAtTail(2).insertAtHead(0);
console.log('Doubly Linked List:', dll.toArray()); // [0, 1, 2]
console.log('Reverse traversal:', dll.toArrayReverse()); // [2, 1, 0]
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Node structure for singly linked list
struct ListNode {
    int data;
    ListNode* next;
    
    ListNode(int val) : data(val), next(nullptr) {}
};

// Singly Linked List Class
class SinglyLinkedList {
private:
    ListNode* head;
    int size;
    
public:
    SinglyLinkedList() : head(nullptr), size(0) {}
    
    // Destructor to prevent memory leaks
    ~SinglyLinkedList() {
        clear();
    }
    
    // Insert at the beginning
    // Time: O(1), Space: O(1)
    void insertAtHead(int data) {
        ListNode* newNode = new ListNode(data);
        newNode->next = head;
        head = newNode;
        size++;
    }
    
    // Insert at the end
    // Time: O(n), Space: O(1)
    void insertAtTail(int data) {
        ListNode* newNode = new ListNode(data);
        
        if (!head) {
            head = newNode;
        } else {
            ListNode* current = head;
            while (current->next) {
                current = current->next;
            }
            current->next = newNode;
        }
        
        size++;
    }
    
    // Insert at specific index
    // Time: O(n), Space: O(1)
    void insertAt(int index, int data) {
        if (index < 0 || index > size) {
            throw out_of_range("Index out of bounds");
        }
        
        if (index == 0) {
            insertAtHead(data);
            return;
        }
        
        ListNode* newNode = new ListNode(data);
        ListNode* current = head;
        
        // Traverse to position index-1
        for (int i = 0; i < index - 1; i++) {
            current = current->next;
        }
        
        newNode->next = current->next;
        current->next = newNode;
        size++;
    }
    
    // Delete from head
    // Time: O(1), Space: O(1)
    bool deleteHead() {
        if (!head) {
            return false;
        }
        
        ListNode* temp = head;
        head = head->next;
        delete temp;
        size--;
        return true;
    }
    
    // Delete by value
    // Time: O(n), Space: O(1)
    bool deleteByValue(int value) {
        if (!head) {
            return false;
        }
        
        if (head->data == value) {
            return deleteHead();
        }
        
        ListNode* current = head;
        while (current->next && current->next->data != value) {
            current = current->next;
        }
        
        if (current->next) {
            ListNode* temp = current->next;
            current->next = current->next->next;
            delete temp;
            size--;
            return true;
        }
        
        return false;
    }
    
    // Search for value
    // Time: O(n), Space: O(1)
    int search(int value) {
        ListNode* current = head;
        int index = 0;
        
        while (current) {
            if (current->data == value) {
                return index;
            }
            current = current->next;
            index++;
        }
        
        return -1;
    }
    
    // Reverse the linked list
    // Time: O(n), Space: O(1)
    void reverse() {
        ListNode* prev = nullptr;
        ListNode* current = head;
        ListNode* next = nullptr;
        
        while (current) {
            next = current->next;  // Store next node
            current->next = prev;  // Reverse the link
            prev = current;        // Move prev forward
            current = next;        // Move current forward
        }
        
        head = prev;
    }
    
    // Find middle element using Floyd's algorithm
    // Time: O(n), Space: O(1)
    int findMiddle() {
        if (!head) {
            throw runtime_error("List is empty");
        }
        
        ListNode* slow = head;
        ListNode* fast = head;
        
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        
        return slow->data;
    }
    
    // Detect cycle in linked list
    // Time: O(n), Space: O(1)
    bool hasCycle() {
        if (!head) return false;
        
        ListNode* slow = head;
        ListNode* fast = head;
        
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            
            if (slow == fast) {
                return true;
            }
        }
        
        return false;
    }
    
    // Merge two sorted linked lists
    // Time: O(m + n), Space: O(1)
    static ListNode* mergeSorted(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* current = &dummy;
        
        while (l1 && l2) {
            if (l1->data <= l2->data) {
                current->next = l1;
                l1 = l1->next;
            } else {
                current->next = l2;
                l2 = l2->next;
            }
            current = current->next;
        }
        
        // Attach remaining nodes
        current->next = l1 ? l1 : l2;
        
        return dummy.next;
    }
    
    // Display the list
    void display() {
        ListNode* current = head;
        cout << "[";
        
        while (current) {
            cout << current->data;
            if (current->next) cout << " -> ";
            current = current->next;
        }
        
        cout << "]" << endl;
    }
    
    // Get size
    int getSize() {
        return size;
    }
    
    // Clear all nodes
    void clear() {
        while (head) {
            ListNode* temp = head;
            head = head->next;
            delete temp;
        }
        size = 0;
    }
    
    // Get head for external operations
    ListNode* getHead() {
        return head;
    }
};

// Doubly Linked List Node
struct DoublyListNode {
    int data;
    DoublyListNode* next;
    DoublyListNode* prev;
    
    DoublyListNode(int val) : data(val), next(nullptr), prev(nullptr) {}
};

// Doubly Linked List Class
class DoublyLinkedList {
private:
    DoublyListNode* head;
    DoublyListNode* tail;
    int size;
    
public:
    DoublyLinkedList() : head(nullptr), tail(nullptr), size(0) {}
    
    // Destructor
    ~DoublyLinkedList() {
        clear();
    }
    
    // Insert at head
    // Time: O(1), Space: O(1)
    void insertAtHead(int data) {
        DoublyListNode* newNode = new DoublyListNode(data);
        
        if (!head) {
            head = tail = newNode;
        } else {
            newNode->next = head;
            head->prev = newNode;
            head = newNode;
        }
        
        size++;
    }
    
    // Insert at tail
    // Time: O(1), Space: O(1)
    void insertAtTail(int data) {
        DoublyListNode* newNode = new DoublyListNode(data);
        
        if (!tail) {
            head = tail = newNode;
        } else {
            tail->next = newNode;
            newNode->prev = tail;
            tail = newNode;
        }
        
        size++;
    }
    
    // Delete from head
    // Time: O(1), Space: O(1)
    bool deleteHead() {
        if (!head) return false;
        
        if (head == tail) {
            delete head;
            head = tail = nullptr;
        } else {
            DoublyListNode* temp = head;
            head = head->next;
            head->prev = nullptr;
            delete temp;
        }
        
        size--;
        return true;
    }
    
    // Delete from tail
    // Time: O(1), Space: O(1)
    bool deleteTail() {
        if (!tail) return false;
        
        if (head == tail) {
            delete tail;
            head = tail = nullptr;
        } else {
            DoublyListNode* temp = tail;
            tail = tail->prev;
            tail->next = nullptr;
            delete temp;
        }
        
        size--;
        return true;
    }
    
    // Display forward
    void displayForward() {
        DoublyListNode* current = head;
        cout << "Forward: [";
        
        while (current) {
            cout << current->data;
            if (current->next) cout << " <-> ";
            current = current->next;
        }
        
        cout << "]" << endl;
    }
    
    // Display backward
    void displayBackward() {
        DoublyListNode* current = tail;
        cout << "Backward: [";
        
        while (current) {
            cout << current->data;
            if (current->prev) cout << " <-> ";
            current = current->prev;
        }
        
        cout << "]" << endl;
    }
    
    // Clear all nodes
    void clear() {
        while (head) {
            DoublyListNode* temp = head;
            head = head->next;
            delete temp;
        }
        head = tail = nullptr;
        size = 0;
    }
    
    int getSize() {
        return size;
    }
};

// Example Usage
int main() {
    cout << "=== Singly Linked List Demo ===" << endl;
    SinglyLinkedList sll;
    
    sll.insertAtHead(1);
    sll.insertAtHead(2);
    sll.insertAtTail(3);
    sll.insertAt(1, 5);
    
    cout << "Original list: ";
    sll.display();
    
    cout << "Middle element: " << sll.findMiddle() << endl;
    cout << "Search for 5: " << sll.search(5) << endl;
    
    sll.reverse();
    cout << "After reverse: ";
    sll.display();
    
    cout << "\n=== Doubly Linked List Demo ===" << endl;
    DoublyLinkedList dll;
    
    dll.insertAtHead(1);
    dll.insertAtTail(2);
    dll.insertAtHead(0);
    
    dll.displayForward();
    dll.displayBackward();
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Comparison:

| Operation | Array | Singly Linked List | Doubly Linked List |
|-----------|-------|-------------------|--------------------|
| Access | O(1) | O(n) | O(n) |
| Search | O(n) | O(n) | O(n) |
| Insert at head | O(n) | O(1) | O(1) |
| Insert at tail | O(1) | O(n) | O(1) |
| Delete at head | O(n) | O(1) | O(1) |
| Delete at tail | O(1) | O(n) | O(1) |

### Space Complexity:
- **Singly Linked List**: O(n) - one pointer per node
- **Doubly Linked List**: O(n) - two pointers per node
- **Additional space per operation**: O(1)

### Common Pitfalls:
1. **Memory leaks**: Always delete nodes in C++
2. **Null pointer access**: Check for null before dereferencing
3. **Lost references**: Keep track of nodes during operations
4. **Infinite loops**: Be careful with cycle detection

---

## 🧩 Practice Problems

### Problem 1: Remove Nth Node from End
**Question**: Given a linked list, remove the nth node from the end.

**Hint**: Use two pointers with n distance between them.

**Solution Approach**:
```javascript
function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let first = dummy;
    let second = dummy;
    
    // Move first pointer n+1 steps ahead
    for (let i = 0; i <= n; i++) {
        first = first.next;
    }
    
    // Move both pointers until first reaches end
    while (first) {
        first = first.next;
        second = second.next;
    }
    
    // Remove the nth node
    second.next = second.next.next;
    return dummy.next;
}
```

### Problem 2: Merge Two Sorted Lists
**Question**: Merge two sorted linked lists into one sorted list.

**Hint**: Use a dummy node and compare values iteratively.

### Problem 3: Linked List Cycle II
**Question**: Find the starting node of a cycle in a linked list.

**Hint**: Use Floyd's algorithm, then find the intersection point.

### Problem 4: Palindrome Linked List
**Question**: Check if a linked list is a palindrome.

**Hint**: Find middle, reverse second half, compare with first half.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Pointer manipulation**: Can you handle next/prev pointers correctly?
2. **Edge cases**: Empty lists, single nodes, cycles
3. **Memory management**: Proper allocation/deallocation in C++
4. **Algorithm optimization**: Using techniques like Floyd's cycle detection

### Common Interview Patterns:
- **Two Pointers**: Fast/slow pointers for cycle detection, finding middle
- **Dummy Nodes**: Simplify edge cases in insertion/deletion
- **Recursion**: For problems like reversing or merging
- **Stack**: For problems requiring backtracking

### Red Flags to Avoid:
- Modifying input without permission
- Not handling null pointers
- Creating memory leaks in C++
- Not considering edge cases (empty list, single node)

### Pro Tips:
1. **Draw it out**: Visualize pointer movements
2. **Use dummy nodes**: Simplifies many operations
3. **Check for cycles**: Always consider if cycles are possible
4. **Practice pointer arithmetic**: Master the fundamentals

---

## 🚀 Key Takeaways

1. **Linked lists excel at insertion/deletion** - O(1) at known positions
2. **Trade-off with arrays** - Dynamic size vs. random access
3. **Pointer manipulation is crucial** - Practice makes perfect
4. **Memory management matters** - Especially in C++
5. **Many algorithms use two pointers** - Fast/slow, leading/trailing

**Next Chapter**: We'll explore Stacks & Queues and see how they can be implemented using linked lists and arrays.