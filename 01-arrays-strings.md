# Chapter 1: Arrays & Strings - Foundation of Data Structures

## 🎯 What Are Arrays & Strings?

**Arrays** are collections of elements stored in contiguous memory locations, where each element can be accessed using an index. **Strings** are essentially arrays of characters with additional operations for text manipulation.

### Why Arrays & Strings Matter:
- **Foundation**: Building blocks for more complex data structures
- **Performance**: O(1) random access to elements
- **Memory Efficiency**: Contiguous storage reduces memory overhead
- **Ubiquitous**: Used in almost every programming problem

---

## 🔍 Core Operations & Concepts

### 1. Array Traversal
Visiting each element in the array sequentially.

### 2. Insertion & Deletion
Adding or removing elements at specific positions.

### 3. Searching
Finding elements or patterns within arrays/strings.

### 4. String Manipulation
Operations like concatenation, substring extraction, and pattern matching.

---

## 💻 JavaScript Implementation

```javascript
class ArrayOperations {
    constructor() {
        this.arr = [];
    }
    
    // Insert element at specific index
    // Time: O(n), Space: O(1)
    insert(index, element) {
        if (index < 0 || index > this.arr.length) {
            throw new Error('Index out of bounds');
        }
        
        // Shift elements to the right
        for (let i = this.arr.length; i > index; i--) {
            this.arr[i] = this.arr[i - 1];
        }
        
        this.arr[index] = element;
        return this.arr;
    }
    
    // Delete element at specific index
    // Time: O(n), Space: O(1)
    delete(index) {
        if (index < 0 || index >= this.arr.length) {
            throw new Error('Index out of bounds');
        }
        
        const deletedElement = this.arr[index];
        
        // Shift elements to the left
        for (let i = index; i < this.arr.length - 1; i++) {
            this.arr[i] = this.arr[i + 1];
        }
        
        this.arr.length--; // Reduce array size
        return deletedElement;
    }
    
    // Linear search for element
    // Time: O(n), Space: O(1)
    search(element) {
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i] === element) {
                return i; // Return index if found
            }
        }
        return -1; // Element not found
    }
    
    // Reverse array in-place
    // Time: O(n), Space: O(1)
    reverse() {
        let left = 0;
        let right = this.arr.length - 1;
        
        while (left < right) {
            // Swap elements
            [this.arr[left], this.arr[right]] = [this.arr[right], this.arr[left]];
            left++;
            right--;
        }
        
        return this.arr;
    }
}

// String Operations
class StringOperations {
    // Check if string is palindrome
    // Time: O(n), Space: O(1)
    static isPalindrome(str) {
        const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        let left = 0;
        let right = cleaned.length - 1;
        
        while (left < right) {
            if (cleaned[left] !== cleaned[right]) {
                return false;
            }
            left++;
            right--;
        }
        
        return true;
    }
    
    // Find all anagrams of pattern in text
    // Time: O(n), Space: O(1) - assuming fixed alphabet size
    static findAnagrams(text, pattern) {
        const result = [];
        const patternCount = new Array(26).fill(0);
        const windowCount = new Array(26).fill(0);
        
        // Count characters in pattern
        for (let char of pattern) {
            patternCount[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
        }
        
        // Sliding window approach
        for (let i = 0; i < text.length; i++) {
            // Add current character to window
            windowCount[text[i].charCodeAt(0) - 'a'.charCodeAt(0)]++;
            
            // Remove character that's out of window
            if (i >= pattern.length) {
                windowCount[text[i - pattern.length].charCodeAt(0) - 'a'.charCodeAt(0)]--;
            }
            
            // Check if current window is an anagram
            if (i >= pattern.length - 1 && this.arraysEqual(patternCount, windowCount)) {
                result.push(i - pattern.length + 1);
            }
        }
        
        return result;
    }
    
    static arraysEqual(arr1, arr2) {
        return arr1.every((val, index) => val === arr2[index]);
    }
}

// Example Usage
const arrayOps = new ArrayOperations();
arrayOps.arr = [1, 2, 3, 4, 5];
console.log(arrayOps.insert(2, 10)); // [1, 2, 10, 3, 4, 5]
console.log(arrayOps.search(10)); // 2
console.log(arrayOps.reverse()); // [5, 4, 3, 10, 2, 1]

console.log(StringOperations.isPalindrome("A man a plan a canal Panama")); // true
console.log(StringOperations.findAnagrams("abab", "ab")); // [0, 2]
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
using namespace std;

class ArrayOperations {
private:
    vector<int> arr;
    
public:
    // Insert element at specific index
    // Time: O(n), Space: O(1)
    void insert(int index, int element) {
        if (index < 0 || index > arr.size()) {
            throw out_of_range("Index out of bounds");
        }
        
        arr.insert(arr.begin() + index, element);
    }
    
    // Delete element at specific index
    // Time: O(n), Space: O(1)
    int deleteAt(int index) {
        if (index < 0 || index >= arr.size()) {
            throw out_of_range("Index out of bounds");
        }
        
        int deletedElement = arr[index];
        arr.erase(arr.begin() + index);
        return deletedElement;
    }
    
    // Linear search for element
    // Time: O(n), Space: O(1)
    int search(int element) {
        for (int i = 0; i < arr.size(); i++) {
            if (arr[i] == element) {
                return i; // Return index if found
            }
        }
        return -1; // Element not found
    }
    
    // Reverse array in-place
    // Time: O(n), Space: O(1)
    void reverse() {
        int left = 0;
        int right = arr.size() - 1;
        
        while (left < right) {
            swap(arr[left], arr[right]);
            left++;
            right--;
        }
    }
    
    // Display array
    void display() {
        cout << "[";
        for (int i = 0; i < arr.size(); i++) {
            cout << arr[i];
            if (i < arr.size() - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
    
    // Initialize array
    void setArray(vector<int> newArr) {
        arr = newArr;
    }
};

class StringOperations {
public:
    // Check if string is palindrome
    // Time: O(n), Space: O(1)
    static bool isPalindrome(string str) {
        // Clean string: remove non-alphanumeric and convert to lowercase
        string cleaned = "";
        for (char c : str) {
            if (isalnum(c)) {
                cleaned += tolower(c);
            }
        }
        
        int left = 0;
        int right = cleaned.length() - 1;
        
        while (left < right) {
            if (cleaned[left] != cleaned[right]) {
                return false;
            }
            left++;
            right--;
        }
        
        return true;
    }
    
    // Find all anagrams of pattern in text
    // Time: O(n), Space: O(1) - assuming fixed alphabet size
    static vector<int> findAnagrams(string text, string pattern) {
        vector<int> result;
        if (text.length() < pattern.length()) return result;
        
        vector<int> patternCount(26, 0);
        vector<int> windowCount(26, 0);
        
        // Count characters in pattern
        for (char c : pattern) {
            patternCount[c - 'a']++;
        }
        
        // Sliding window approach
        for (int i = 0; i < text.length(); i++) {
            // Add current character to window
            windowCount[text[i] - 'a']++;
            
            // Remove character that's out of window
            if (i >= pattern.length()) {
                windowCount[text[i - pattern.length()] - 'a']--;
            }
            
            // Check if current window is an anagram
            if (i >= pattern.length() - 1 && patternCount == windowCount) {
                result.push_back(i - pattern.length() + 1);
            }
        }
        
        return result;
    }
    
    // Longest substring without repeating characters
    // Time: O(n), Space: O(min(m,n)) where m is charset size
    static int longestUniqueSubstring(string s) {
        unordered_map<char, int> charIndex;
        int maxLength = 0;
        int start = 0;
        
        for (int end = 0; end < s.length(); end++) {
            char currentChar = s[end];
            
            // If character is already in current window, move start
            if (charIndex.find(currentChar) != charIndex.end() && 
                charIndex[currentChar] >= start) {
                start = charIndex[currentChar] + 1;
            }
            
            charIndex[currentChar] = end;
            maxLength = max(maxLength, end - start + 1);
        }
        
        return maxLength;
    }
};

// Example Usage
int main() {
    // Array operations
    ArrayOperations arrayOps;
    arrayOps.setArray({1, 2, 3, 4, 5});
    
    cout << "Original array: ";
    arrayOps.display();
    
    arrayOps.insert(2, 10);
    cout << "After inserting 10 at index 2: ";
    arrayOps.display();
    
    cout << "Search for 10: " << arrayOps.search(10) << endl;
    
    arrayOps.reverse();
    cout << "After reversing: ";
    arrayOps.display();
    
    // String operations
    cout << "\nString Operations:" << endl;
    cout << "Is 'A man a plan a canal Panama' palindrome? " 
         << (StringOperations::isPalindrome("A man a plan a canal Panama") ? "Yes" : "No") << endl;
    
    vector<int> anagrams = StringOperations::findAnagrams("abab", "ab");
    cout << "Anagram positions of 'ab' in 'abab': ";
    for (int pos : anagrams) {
        cout << pos << " ";
    }
    cout << endl;
    
    cout << "Longest unique substring in 'abcabcbb': " 
         << StringOperations::longestUniqueSubstring("abcabcbb") << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity:
- **Access**: O(1) - Direct indexing
- **Search**: O(n) - Linear search through elements
- **Insertion**: O(n) - May need to shift elements
- **Deletion**: O(n) - May need to shift elements
- **Traversal**: O(n) - Visit each element once

### Space Complexity:
- **Fixed-size arrays**: O(1) additional space
- **Dynamic arrays**: O(n) for the array itself
- **String operations**: Often O(1) additional space with in-place algorithms

### Common Pitfalls:
1. **Index out of bounds**: Always validate array indices
2. **Off-by-one errors**: Be careful with loop boundaries
3. **Memory management**: In C++, be mindful of dynamic allocation
4. **String immutability**: In some languages, strings are immutable

---

## 🧩 Practice Problems

### Problem 1: Two Sum
**Question**: Given an array of integers and a target sum, return indices of two numbers that add up to the target.

**Hint**: Use a hash map to store complements as you iterate.

**Solution Approach**:
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

### Problem 2: Valid Anagram
**Question**: Given two strings, determine if they are anagrams of each other.

**Hint**: Count character frequencies or sort both strings.

### Problem 3: Remove Duplicates
**Question**: Remove duplicates from a sorted array in-place.

**Hint**: Use two pointers - one for reading, one for writing.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Edge case handling**: Empty arrays, single elements, null inputs
2. **Optimization awareness**: Can you improve from O(n²) to O(n)?
3. **Space-time tradeoffs**: When to use extra space for better time complexity
4. **Clean code**: Readable, well-commented implementations

### Common Interview Patterns:
- **Two Pointers**: For problems involving pairs or reversing
- **Sliding Window**: For substring/subarray problems
- **Hash Maps**: For frequency counting and lookups
- **In-place operations**: Modifying arrays without extra space

### Red Flags to Avoid:
- Not asking about input constraints
- Jumping to code without explaining approach
- Ignoring edge cases
- Not discussing time/space complexity

---

## 🚀 Key Takeaways

1. **Arrays are fundamental** - Master them before moving to complex structures
2. **Index management is crucial** - Most bugs come from incorrect indexing
3. **Consider both time and space** - Sometimes trading space for time is worth it
4. **Practice string manipulation** - Very common in interviews
5. **Learn common patterns** - Two pointers, sliding window, etc.

**Next Chapter**: We'll explore Linked Lists and see how they differ from arrays in memory layout and operations.