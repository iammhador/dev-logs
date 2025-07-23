# Chapter 4: Hash Tables & Maps - Efficient Key-Value Storage

## 🎯 What Are Hash Tables?

**Hash Tables** (also called Hash Maps) are data structures that implement an associative array abstract data type, mapping keys to values. They use a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.

### Why Hash Tables Matter:
- **Fast Access**: Average O(1) time for search, insert, and delete
- **Flexible Keys**: Can use strings, numbers, or custom objects as keys
- **Memory Efficient**: Direct indexing eliminates need for comparisons
- **Ubiquitous**: Foundation for databases, caches, and many algorithms

### Core Concepts:
1. **Hash Function**: Converts keys into array indices
2. **Buckets**: Array slots where key-value pairs are stored
3. **Collision**: When two keys hash to the same index
4. **Load Factor**: Ratio of stored elements to total capacity

---

## 🔍 Hash Functions & Collision Resolution

### Hash Function Properties:
- **Deterministic**: Same key always produces same hash
- **Uniform Distribution**: Spreads keys evenly across buckets
- **Fast Computation**: Should be quick to calculate
- **Avalanche Effect**: Small key changes cause large hash changes

### Collision Resolution Techniques:

#### 1. Separate Chaining (Open Hashing)
- Each bucket contains a linked list of key-value pairs
- Multiple elements can exist in the same bucket

#### 2. Open Addressing (Closed Hashing)
- All elements stored in the hash table itself
- When collision occurs, probe for next available slot
- **Linear Probing**: Check next slot sequentially
- **Quadratic Probing**: Check slots at quadratic intervals
- **Double Hashing**: Use second hash function for probing

---

## 💻 JavaScript Implementation

```javascript
// Hash Table with Separate Chaining
class HashTableChaining {
    constructor(size = 10) {
        this.size = size;
        this.buckets = new Array(size);
        this.count = 0;
        
        // Initialize buckets as empty arrays
        for (let i = 0; i < size; i++) {
            this.buckets[i] = [];
        }
    }
    
    // Simple hash function
    // Time: O(k) where k is key length, Space: O(1)
    hash(key) {
        let hash = 0;
        const keyStr = String(key);
        
        for (let i = 0; i < keyStr.length; i++) {
            hash = (hash + keyStr.charCodeAt(i) * (i + 1)) % this.size;
        }
        
        return hash;
    }
    
    // Insert or update key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    set(key, value) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        // Check if key already exists
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket[i][1] = value; // Update existing
                return;
            }
        }
        
        // Add new key-value pair
        bucket.push([key, value]);
        this.count++;
        
        // Resize if load factor exceeds threshold
        if (this.count > this.size * 0.75) {
            this.resize();
        }
    }
    
    // Get value by key
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    get(key) {
        const index = this.hash(key);
        const bucket = this.buckets[index];
        
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                return bucket[i][1];
            }
        }
        
        return undefined;
    }
    
    // Check if key exists
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    has(key) {
        return this.get(key) !== undefined;
    }
    
    // Delete key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
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
    
    // Get all keys
    keys() {
        const keys = [];
        for (let bucket of this.buckets) {
            for (let [key] of bucket) {
                keys.push(key);
            }
        }
        return keys;
    }
    
    // Get all values
    values() {
        const values = [];
        for (let bucket of this.buckets) {
            for (let [, value] of bucket) {
                values.push(value);
            }
        }
        return values;
    }
    
    // Resize hash table when load factor is high
    resize() {
        const oldBuckets = this.buckets;
        this.size *= 2;
        this.buckets = new Array(this.size);
        this.count = 0;
        
        // Initialize new buckets
        for (let i = 0; i < this.size; i++) {
            this.buckets[i] = [];
        }
        
        // Rehash all existing elements
        for (let bucket of oldBuckets) {
            for (let [key, value] of bucket) {
                this.set(key, value);
            }
        }
    }
    
    // Get load factor
    getLoadFactor() {
        return this.count / this.size;
    }
    
    // Display hash table structure
    display() {
        console.log('Hash Table Structure:');
        for (let i = 0; i < this.buckets.length; i++) {
            if (this.buckets[i].length > 0) {
                console.log(`Bucket ${i}:`, this.buckets[i]);
            }
        }
        console.log(`Load Factor: ${this.getLoadFactor().toFixed(2)}`);
    }
}

// Hash Table with Linear Probing
class HashTableLinearProbing {
    constructor(size = 10) {
        this.size = size;
        this.keys = new Array(size);
        this.values = new Array(size);
        this.count = 0;
    }
    
    // Hash function
    hash(key) {
        let hash = 0;
        const keyStr = String(key);
        
        for (let i = 0; i < keyStr.length; i++) {
            hash = (hash + keyStr.charCodeAt(i) * 31) % this.size;
        }
        
        return hash;
    }
    
    // Insert or update key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    set(key, value) {
        if (this.count >= this.size * 0.75) {
            this.resize();
        }
        
        let index = this.hash(key);
        
        // Linear probing to find empty slot or existing key
        while (this.keys[index] !== undefined) {
            if (this.keys[index] === key) {
                this.values[index] = value; // Update existing
                return;
            }
            index = (index + 1) % this.size;
        }
        
        // Insert new key-value pair
        this.keys[index] = key;
        this.values[index] = value;
        this.count++;
    }
    
    // Get value by key
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    get(key) {
        let index = this.hash(key);
        
        while (this.keys[index] !== undefined) {
            if (this.keys[index] === key) {
                return this.values[index];
            }
            index = (index + 1) % this.size;
        }
        
        return undefined;
    }
    
    // Delete key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    delete(key) {
        let index = this.hash(key);
        
        while (this.keys[index] !== undefined) {
            if (this.keys[index] === key) {
                this.keys[index] = undefined;
                this.values[index] = undefined;
                this.count--;
                
                // Rehash subsequent elements to maintain clustering
                this.rehashCluster(index);
                return true;
            }
            index = (index + 1) % this.size;
        }
        
        return false;
    }
    
    // Rehash elements after deletion to maintain proper clustering
    rehashCluster(deletedIndex) {
        let index = (deletedIndex + 1) % this.size;
        
        while (this.keys[index] !== undefined) {
            const keyToRehash = this.keys[index];
            const valueToRehash = this.values[index];
            
            this.keys[index] = undefined;
            this.values[index] = undefined;
            this.count--;
            
            this.set(keyToRehash, valueToRehash);
            index = (index + 1) % this.size;
        }
    }
    
    // Resize hash table
    resize() {
        const oldKeys = this.keys;
        const oldValues = this.values;
        
        this.size *= 2;
        this.keys = new Array(this.size);
        this.values = new Array(this.size);
        this.count = 0;
        
        // Rehash all existing elements
        for (let i = 0; i < oldKeys.length; i++) {
            if (oldKeys[i] !== undefined) {
                this.set(oldKeys[i], oldValues[i]);
            }
        }
    }
    
    // Check if key exists
    has(key) {
        return this.get(key) !== undefined;
    }
    
    // Get all keys
    getKeys() {
        return this.keys.filter(key => key !== undefined);
    }
    
    // Get load factor
    getLoadFactor() {
        return this.count / this.size;
    }
}

// Hash Set Implementation
class HashSet {
    constructor() {
        this.map = new HashTableChaining();
    }
    
    // Add element to set
    add(element) {
        this.map.set(element, true);
    }
    
    // Check if element exists
    has(element) {
        return this.map.has(element);
    }
    
    // Remove element from set
    delete(element) {
        return this.map.delete(element);
    }
    
    // Get all elements
    values() {
        return this.map.keys();
    }
    
    // Get size
    size() {
        return this.map.count;
    }
    
    // Clear all elements
    clear() {
        this.map = new HashTableChaining();
    }
}

// Hash Table Applications
class HashTableApplications {
    // Find two numbers that sum to target
    // Time: O(n), Space: O(n)
    static twoSum(nums, target) {
        const map = new Map();
        
        for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) {
                return [map.get(complement), i];
            }
            map.set(nums[i], i);
        }
        
        return [];
    }
    
    // Group anagrams together
    // Time: O(n * k log k), Space: O(n * k)
    static groupAnagrams(strs) {
        const map = new Map();
        
        for (let str of strs) {
            const sorted = str.split('').sort().join('');
            if (!map.has(sorted)) {
                map.set(sorted, []);
            }
            map.get(sorted).push(str);
        }
        
        return Array.from(map.values());
    }
    
    // Find first non-repeating character
    // Time: O(n), Space: O(1) - limited character set
    static firstUniqueChar(s) {
        const charCount = new Map();
        
        // Count character frequencies
        for (let char of s) {
            charCount.set(char, (charCount.get(char) || 0) + 1);
        }
        
        // Find first character with count 1
        for (let i = 0; i < s.length; i++) {
            if (charCount.get(s[i]) === 1) {
                return i;
            }
        }
        
        return -1;
    }
    
    // Implement LRU Cache
    static createLRUCache(capacity) {
        return new LRUCache(capacity);
    }
}

// LRU Cache Implementation
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    
    // Get value and mark as recently used
    // Time: O(1), Space: O(1)
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return -1;
    }
    
    // Put key-value pair
    // Time: O(1), Space: O(1)
    put(key, value) {
        if (this.cache.has(key)) {
            // Update existing key
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
    
    // Display cache state
    display() {
        console.log('LRU Cache:', Array.from(this.cache.entries()));
    }
}

// Example Usage
console.log('=== Hash Table with Chaining Demo ===');
const hashTable = new HashTableChaining(5);
hashTable.set('name', 'John');
hashTable.set('age', 30);
hashTable.set('city', 'New York');
hashTable.set('country', 'USA');
console.log('Get name:', hashTable.get('name')); // John
console.log('Has age:', hashTable.has('age')); // true
hashTable.display();

console.log('\n=== Hash Table with Linear Probing Demo ===');
const hashTableLP = new HashTableLinearProbing(7);
hashTableLP.set('apple', 5);
hashTableLP.set('banana', 3);
hashTableLP.set('orange', 8);
console.log('Get apple:', hashTableLP.get('apple')); // 5
console.log('Load factor:', hashTableLP.getLoadFactor().toFixed(2));

console.log('\n=== Hash Set Demo ===');
const hashSet = new HashSet();
hashSet.add('red');
hashSet.add('blue');
hashSet.add('green');
console.log('Has red:', hashSet.has('red')); // true
console.log('Set values:', hashSet.values());

console.log('\n=== Hash Table Applications ===');
console.log('Two Sum [2,7,11,15], target 9:', HashTableApplications.twoSum([2,7,11,15], 9)); // [0,1]
console.log('Group Anagrams:', HashTableApplications.groupAnagrams(['eat','tea','tan','ate','nat','bat']));
console.log('First unique char in "leetcode":', HashTableApplications.firstUniqueChar('leetcode')); // 0

console.log('\n=== LRU Cache Demo ===');
const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log('Get 1:', lru.get(1)); // 1
lru.put(3, 3); // Evicts key 2
console.log('Get 2:', lru.get(2)); // -1 (not found)
lru.display();
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <list>
#include <unordered_map>
#include <algorithm>
using namespace std;

// Hash Table with Separate Chaining
template<typename K, typename V>
class HashTableChaining {
private:
    struct KeyValue {
        K key;
        V value;
        KeyValue(const K& k, const V& v) : key(k), value(v) {}
    };
    
    vector<list<KeyValue>> buckets;
    size_t bucket_count;
    size_t size;
    
    // Hash function for different types
    size_t hash(const K& key) const {
        return std::hash<K>{}(key) % bucket_count;
    }
    
public:
    HashTableChaining(size_t initial_bucket_count = 10) 
        : bucket_count(initial_bucket_count), size(0) {
        buckets.resize(bucket_count);
    }
    
    // Insert or update key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    void set(const K& key, const V& value) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        // Check if key already exists
        for (auto& kv : bucket) {
            if (kv.key == key) {
                kv.value = value; // Update existing
                return;
            }
        }
        
        // Add new key-value pair
        bucket.emplace_back(key, value);
        size++;
        
        // Resize if load factor exceeds threshold
        if (static_cast<double>(size) / bucket_count > 0.75) {
            resize();
        }
    }
    
    // Get value by key
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    bool get(const K& key, V& value) const {
        size_t index = hash(key);
        const auto& bucket = buckets[index];
        
        for (const auto& kv : bucket) {
            if (kv.key == key) {
                value = kv.value;
                return true;
            }
        }
        
        return false;
    }
    
    // Check if key exists
    bool has(const K& key) const {
        V dummy;
        return get(key, dummy);
    }
    
    // Delete key-value pair
    // Average Time: O(1), Worst Time: O(n), Space: O(1)
    bool remove(const K& key) {
        size_t index = hash(key);
        auto& bucket = buckets[index];
        
        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (it->key == key) {
                bucket.erase(it);
                size--;
                return true;
            }
        }
        
        return false;
    }
    
    // Get all keys
    vector<K> keys() const {
        vector<K> result;
        for (const auto& bucket : buckets) {
            for (const auto& kv : bucket) {
                result.push_back(kv.key);
            }
        }
        return result;
    }
    
    // Get load factor
    double getLoadFactor() const {
        return static_cast<double>(size) / bucket_count;
    }
    
    // Get size
    size_t getSize() const {
        return size;
    }
    
    // Display hash table structure
    void display() const {
        cout << "Hash Table Structure:" << endl;
        for (size_t i = 0; i < buckets.size(); i++) {
            if (!buckets[i].empty()) {
                cout << "Bucket " << i << ": ";
                for (const auto& kv : buckets[i]) {
                    cout << "(" << kv.key << ", " << kv.value << ") ";
                }
                cout << endl;
            }
        }
        cout << "Load Factor: " << getLoadFactor() << endl;
    }
    
private:
    // Resize hash table when load factor is high
    void resize() {
        vector<list<KeyValue>> old_buckets = move(buckets);
        bucket_count *= 2;
        buckets.clear();
        buckets.resize(bucket_count);
        size = 0;
        
        // Rehash all existing elements
        for (const auto& bucket : old_buckets) {
            for (const auto& kv : bucket) {
                set(kv.key, kv.value);
            }
        }
    }
};

// Hash Table with Linear Probing
template<typename K, typename V>
class HashTableLinearProbing {
private:
    struct Entry {
        K key;
        V value;
        bool deleted;
        
        Entry() : deleted(true) {}
        Entry(const K& k, const V& v) : key(k), value(v), deleted(false) {}
    };
    
    vector<Entry> table;
    size_t capacity;
    size_t size;
    
    size_t hash(const K& key) const {
        return std::hash<K>{}(key) % capacity;
    }
    
public:
    HashTableLinearProbing(size_t initial_capacity = 10) 
        : capacity(initial_capacity), size(0) {
        table.resize(capacity);
    }
    
    // Insert or update key-value pair
    void set(const K& key, const V& value) {
        if (static_cast<double>(size) / capacity > 0.75) {
            resize();
        }
        
        size_t index = hash(key);
        
        // Linear probing to find empty slot or existing key
        while (!table[index].deleted) {
            if (table[index].key == key) {
                table[index].value = value; // Update existing
                return;
            }
            index = (index + 1) % capacity;
        }
        
        // Insert new key-value pair
        table[index] = Entry(key, value);
        size++;
    }
    
    // Get value by key
    bool get(const K& key, V& value) const {
        size_t index = hash(key);
        size_t original_index = index;
        
        do {
            if (table[index].deleted) {
                return false; // Empty slot found, key doesn't exist
            }
            if (table[index].key == key) {
                value = table[index].value;
                return true;
            }
            index = (index + 1) % capacity;
        } while (index != original_index);
        
        return false;
    }
    
    // Check if key exists
    bool has(const K& key) const {
        V dummy;
        return get(key, dummy);
    }
    
    // Delete key-value pair
    bool remove(const K& key) {
        size_t index = hash(key);
        size_t original_index = index;
        
        do {
            if (table[index].deleted) {
                return false; // Empty slot found, key doesn't exist
            }
            if (table[index].key == key) {
                table[index].deleted = true;
                size--;
                return true;
            }
            index = (index + 1) % capacity;
        } while (index != original_index);
        
        return false;
    }
    
    // Get load factor
    double getLoadFactor() const {
        return static_cast<double>(size) / capacity;
    }
    
    // Get size
    size_t getSize() const {
        return size;
    }
    
private:
    // Resize hash table
    void resize() {
        vector<Entry> old_table = move(table);
        capacity *= 2;
        table.clear();
        table.resize(capacity);
        size = 0;
        
        // Rehash all existing elements
        for (const auto& entry : old_table) {
            if (!entry.deleted) {
                set(entry.key, entry.value);
            }
        }
    }
};

// Hash Set Implementation
template<typename T>
class HashSet {
private:
    HashTableChaining<T, bool> table;
    
public:
    void add(const T& element) {
        table.set(element, true);
    }
    
    bool has(const T& element) const {
        return table.has(element);
    }
    
    bool remove(const T& element) {
        return table.remove(element);
    }
    
    vector<T> values() const {
        return table.keys();
    }
    
    size_t size() const {
        return table.getSize();
    }
};

// Hash Table Applications
class HashTableApplications {
public:
    // Find two numbers that sum to target
    // Time: O(n), Space: O(n)
    static vector<int> twoSum(const vector<int>& nums, int target) {
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        
        return {};
    }
    
    // Group anagrams together
    // Time: O(n * k log k), Space: O(n * k)
    static vector<vector<string>> groupAnagrams(const vector<string>& strs) {
        unordered_map<string, vector<string>> map;
        
        for (const string& str : strs) {
            string sorted = str;
            sort(sorted.begin(), sorted.end());
            map[sorted].push_back(str);
        }
        
        vector<vector<string>> result;
        for (const auto& pair : map) {
            result.push_back(pair.second);
        }
        
        return result;
    }
    
    // Find first non-repeating character
    // Time: O(n), Space: O(1) - limited character set
    static int firstUniqueChar(const string& s) {
        unordered_map<char, int> charCount;
        
        // Count character frequencies
        for (char c : s) {
            charCount[c]++;
        }
        
        // Find first character with count 1
        for (int i = 0; i < s.length(); i++) {
            if (charCount[s[i]] == 1) {
                return i;
            }
        }
        
        return -1;
    }
};

// Example Usage
int main() {
    cout << "=== Hash Table with Chaining Demo ===" << endl;
    HashTableChaining<string, int> hashTable;
    hashTable.set("apple", 5);
    hashTable.set("banana", 3);
    hashTable.set("orange", 8);
    
    int value;
    if (hashTable.get("apple", value)) {
        cout << "Apple: " << value << endl;
    }
    
    hashTable.display();
    
    cout << "\n=== Hash Table with Linear Probing Demo ===" << endl;
    HashTableLinearProbing<string, int> hashTableLP;
    hashTableLP.set("red", 1);
    hashTableLP.set("green", 2);
    hashTableLP.set("blue", 3);
    
    cout << "Load factor: " << hashTableLP.getLoadFactor() << endl;
    
    cout << "\n=== Hash Set Demo ===" << endl;
    HashSet<string> hashSet;
    hashSet.add("cat");
    hashSet.add("dog");
    hashSet.add("bird");
    
    cout << "Has cat: " << (hashSet.has("cat") ? "Yes" : "No") << endl;
    cout << "Set size: " << hashSet.size() << endl;
    
    cout << "\n=== Hash Table Applications ===" << endl;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> result = HashTableApplications::twoSum(nums, 9);
    cout << "Two Sum result: [" << result[0] << ", " << result[1] << "]" << endl;
    
    cout << "First unique char in 'leetcode': " 
         << HashTableApplications::firstUniqueChar("leetcode") << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity:

| Operation | Average Case | Worst Case | Best Case |
|-----------|--------------|------------|----------|
| Search | O(1) | O(n) | O(1) |
| Insert | O(1) | O(n) | O(1) |
| Delete | O(1) | O(n) | O(1) |

### Space Complexity:
- **Hash Table**: O(n) where n is the number of key-value pairs
- **Additional space per operation**: O(1)

### Load Factor Impact:
- **Low load factor (< 0.5)**: Fewer collisions, more memory usage
- **High load factor (> 0.75)**: More collisions, less memory usage
- **Optimal range**: 0.5 - 0.75 for good balance

### Collision Resolution Comparison:

| Aspect | Separate Chaining | Linear Probing |
|--------|------------------|----------------|
| Memory | Higher (pointers) | Lower (no pointers) |
| Cache Performance | Poor | Better |
| Deletion | Easy | Complex |
| Load Factor Tolerance | Higher | Lower |

---

## 🧩 Practice Problems

### Problem 1: Two Sum
**Question**: Given an array of integers and a target, return indices of two numbers that add up to target.

**Solution**:
```javascript
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
```

### Problem 2: Group Anagrams
**Question**: Group strings that are anagrams of each other.

**Hint**: Use sorted string as key in hash map.

### Problem 3: Longest Substring Without Repeating Characters
**Question**: Find the length of the longest substring without repeating characters.

**Hint**: Use sliding window with hash set to track characters.

### Problem 4: Design HashMap
**Question**: Design a HashMap without using built-in hash table libraries.

**Hint**: Implement with array of buckets and handle collisions.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Hash function understanding**: Can you explain how hashing works?
2. **Collision handling**: Knowledge of different resolution techniques
3. **Load factor awareness**: Understanding of performance implications
4. **Real-world applications**: When to use hash tables vs. other structures

### Common Interview Patterns:
- **Frequency counting**: Character/element frequency problems
- **Two-pointer with hash**: Finding pairs, triplets with specific sums
- **Caching**: LRU cache, memoization problems
- **Grouping**: Anagrams, similar strings, etc.

### Red Flags to Avoid:
- Not considering hash collisions
- Ignoring load factor and resizing
- Using hash tables when order matters
- Not handling edge cases (empty keys, null values)

### Pro Tips:
1. **Understand trade-offs**: Hash tables vs. trees vs. arrays
2. **Consider hash quality**: Good distribution reduces collisions
3. **Think about resizing**: When and how to resize
4. **Practice common patterns**: Two sum, anagrams, frequency counting

---

## 🚀 Key Takeaways

1. **Hash tables provide O(1) average access** - Excellent for lookups
2. **Hash function quality matters** - Good distribution prevents clustering
3. **Handle collisions properly** - Choose appropriate resolution method
4. **Monitor load factor** - Resize when necessary for performance
5. **Perfect for many algorithms** - Frequency counting, caching, grouping

**Next Chapter**: We'll explore Trees and see how they provide hierarchical data organization with efficient search, insertion, and deletion operations.