# Chapter 6: Recursion Basics - The Art of Self-Reference

## 🎯 What is Recursion?

**Recursion** is a programming technique where a function calls itself to solve a smaller version of the same problem. It's like looking into two mirrors facing each other - you see infinite reflections, each smaller than the last.

### Why Recursion Matters:
- **Natural problem-solving**: Many problems have recursive structure
- **Elegant solutions**: Often simpler and more readable than iterative approaches
- **Tree and graph algorithms**: Essential for hierarchical data structures
- **Divide and conquer**: Foundation for many efficient algorithms

### Recursion Components:
1. **Base Case**: Condition that stops the recursion
2. **Recursive Case**: Function calls itself with modified parameters
3. **Progress**: Each call moves closer to the base case

---

## 🔍 How Recursion Works

### The Call Stack:
When a function calls itself, each call is added to the **call stack**:

```
factorial(4)
├── factorial(3)
│   ├── factorial(2)
│   │   ├── factorial(1)
│   │   │   └── factorial(0) → returns 1
│   │   └── returns 1 * 1 = 1
│   └── returns 2 * 1 = 2
└── returns 3 * 2 = 6
returns 4 * 6 = 24
```

### Recursion vs Iteration:

| Aspect | Recursion | Iteration |
|--------|-----------|----------|
| **Readability** | Often cleaner | Can be verbose |
| **Memory** | Uses call stack | Uses variables |
| **Performance** | Function call overhead | Generally faster |
| **Stack overflow** | Possible with deep recursion | Not applicable |

---

## 💻 JavaScript Implementation

```javascript
// Basic Recursion Examples

// 1. Factorial
// Time: O(n), Space: O(n)
function factorial(n) {
    // Base case: factorial of 0 or 1 is 1
    if (n <= 1) {
        return 1;
    }
    
    // Recursive case: n! = n * (n-1)!
    return n * factorial(n - 1);
}

// 2. Fibonacci Sequence
// Time: O(2^n), Space: O(n) - naive approach
function fibonacci(n) {
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Recursive case: F(n) = F(n-1) + F(n-2)
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Optimized Fibonacci with Memoization
// Time: O(n), Space: O(n)
function fibonacciMemo(n, memo = {}) {
    // Check if already computed
    if (n in memo) {
        return memo[n];
    }
    
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Store result in memo and return
    memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    return memo[n];
}

// 3. Power Function
// Time: O(log n), Space: O(log n)
function power(base, exponent) {
    // Base case
    if (exponent === 0) {
        return 1;
    }
    
    // Handle negative exponents
    if (exponent < 0) {
        return 1 / power(base, -exponent);
    }
    
    // Optimize using divide and conquer
    if (exponent % 2 === 0) {
        const half = power(base, exponent / 2);
        return half * half;
    } else {
        return base * power(base, exponent - 1);
    }
}

// 4. Sum of Array
// Time: O(n), Space: O(n)
function arraySum(arr, index = 0) {
    // Base case: reached end of array
    if (index >= arr.length) {
        return 0;
    }
    
    // Recursive case: current element + sum of rest
    return arr[index] + arraySum(arr, index + 1);
}

// 5. Reverse String
// Time: O(n), Space: O(n)
function reverseString(str) {
    // Base case: empty or single character
    if (str.length <= 1) {
        return str;
    }
    
    // Recursive case: last char + reverse of rest
    return str[str.length - 1] + reverseString(str.slice(0, -1));
}

// 6. Check if String is Palindrome
// Time: O(n), Space: O(n)
function isPalindrome(str, start = 0, end = str.length - 1) {
    // Base case: single character or empty
    if (start >= end) {
        return true;
    }
    
    // Check if characters match
    if (str[start] !== str[end]) {
        return false;
    }
    
    // Recursive case: check inner substring
    return isPalindrome(str, start + 1, end - 1);
}

// 7. Binary Search (Recursive)
// Time: O(log n), Space: O(log n)
function binarySearch(arr, target, left = 0, right = arr.length - 1) {
    // Base case: element not found
    if (left > right) {
        return -1;
    }
    
    const mid = Math.floor((left + right) / 2);
    
    // Base case: element found
    if (arr[mid] === target) {
        return mid;
    }
    
    // Recursive cases
    if (target < arr[mid]) {
        return binarySearch(arr, target, left, mid - 1);
    } else {
        return binarySearch(arr, target, mid + 1, right);
    }
}

// 8. Generate All Subsets
// Time: O(2^n), Space: O(2^n)
function generateSubsets(nums) {
    const result = [];
    
    function backtrack(index, currentSubset) {
        // Base case: processed all elements
        if (index === nums.length) {
            result.push([...currentSubset]);
            return;
        }
        
        // Include current element
        currentSubset.push(nums[index]);
        backtrack(index + 1, currentSubset);
        
        // Exclude current element (backtrack)
        currentSubset.pop();
        backtrack(index + 1, currentSubset);
    }
    
    backtrack(0, []);
    return result;
}

// 9. Tower of Hanoi
// Time: O(2^n), Space: O(n)
function towerOfHanoi(n, source, destination, auxiliary) {
    const moves = [];
    
    function solve(disks, src, dest, aux) {
        // Base case: only one disk
        if (disks === 1) {
            moves.push(`Move disk 1 from ${src} to ${dest}`);
            return;
        }
        
        // Move n-1 disks from source to auxiliary
        solve(disks - 1, src, aux, dest);
        
        // Move the largest disk from source to destination
        moves.push(`Move disk ${disks} from ${src} to ${dest}`);
        
        // Move n-1 disks from auxiliary to destination
        solve(disks - 1, aux, dest, src);
    }
    
    solve(n, source, destination, auxiliary);
    return moves;
}

// 10. Count Paths in Grid
// Time: O(2^(m+n)), Space: O(m+n) - naive
// Time: O(m*n), Space: O(m*n) - with memoization
function countPaths(m, n, memo = {}) {
    const key = `${m},${n}`;
    
    // Check memo
    if (key in memo) {
        return memo[key];
    }
    
    // Base cases
    if (m === 1 || n === 1) {
        return 1;
    }
    
    // Recursive case: paths from top + paths from left
    memo[key] = countPaths(m - 1, n, memo) + countPaths(m, n - 1, memo);
    return memo[key];
}

// 11. Merge Sort (Recursive)
// Time: O(n log n), Space: O(n)
function mergeSort(arr) {
    // Base case: array with 0 or 1 element
    if (arr.length <= 1) {
        return arr;
    }
    
    // Divide
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    // Conquer (merge)
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    // Add remaining elements
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// 12. Quick Sort (Recursive)
// Time: O(n log n) average, O(n^2) worst, Space: O(log n)
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        // Partition and get pivot index
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
    
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// Recursion Helper Functions
class RecursionHelpers {
    // Convert recursion to iteration using explicit stack
    static factorialIterative(n) {
        if (n <= 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    // Tail recursion optimization (JavaScript doesn't optimize, but concept)
    static factorialTailRecursive(n, accumulator = 1) {
        if (n <= 1) {
            return accumulator;
        }
        return RecursionHelpers.factorialTailRecursive(n - 1, n * accumulator);
    }
    
    // Mutual recursion example
    static isEven(n) {
        if (n === 0) return true;
        return RecursionHelpers.isOdd(n - 1);
    }
    
    static isOdd(n) {
        if (n === 0) return false;
        return RecursionHelpers.isEven(n - 1);
    }
    
    // Recursion with multiple base cases
    static tribonacci(n) {
        if (n === 0) return 0;
        if (n === 1 || n === 2) return 1;
        
        return RecursionHelpers.tribonacci(n - 1) + 
               RecursionHelpers.tribonacci(n - 2) + 
               RecursionHelpers.tribonacci(n - 3);
    }
}

// Example Usage and Testing
console.log('=== Basic Recursion Examples ===');
console.log('Factorial of 5:', factorial(5)); // 120
console.log('Fibonacci of 10:', fibonacci(10)); // 55
console.log('Fibonacci of 10 (memoized):', fibonacciMemo(10)); // 55
console.log('2^10:', power(2, 10)); // 1024
console.log('Sum of [1,2,3,4,5]:', arraySum([1, 2, 3, 4, 5])); // 15
console.log('Reverse "hello":', reverseString('hello')); // "olleh"
console.log('Is "racecar" palindrome?', isPalindrome('racecar')); // true

console.log('\n=== Advanced Recursion Examples ===');
const sortedArray = [1, 3, 5, 7, 9, 11, 13];
console.log('Binary search for 7:', binarySearch(sortedArray, 7)); // 3

const subsets = generateSubsets([1, 2, 3]);
console.log('Subsets of [1,2,3]:', subsets);

const hanoi = towerOfHanoi(3, 'A', 'C', 'B');
console.log('Tower of Hanoi (3 disks):');
hanoi.forEach(move => console.log(move));

console.log('Paths in 3x3 grid:', countPaths(3, 3)); // 6

const unsortedArray = [64, 34, 25, 12, 22, 11, 90];
console.log('Original array:', unsortedArray);
console.log('Merge sorted:', mergeSort([...unsortedArray]));
console.log('Quick sorted:', quickSort([...unsortedArray]));

console.log('\n=== Helper Functions ===');
console.log('Factorial iterative:', RecursionHelpers.factorialIterative(5));
console.log('Factorial tail recursive:', RecursionHelpers.factorialTailRecursive(5));
console.log('Is 4 even?', RecursionHelpers.isEven(4)); // true
console.log('Is 5 odd?', RecursionHelpers.isOdd(5)); // true
console.log('Tribonacci of 7:', RecursionHelpers.tribonacci(7)); // 24
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

// Basic Recursion Examples

// 1. Factorial
// Time: O(n), Space: O(n)
long long factorial(int n) {
    // Base case
    if (n <= 1) {
        return 1;
    }
    
    // Recursive case
    return n * factorial(n - 1);
}

// 2. Fibonacci (naive)
// Time: O(2^n), Space: O(n)
long long fibonacci(int n) {
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Recursive case
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Fibonacci with memoization
// Time: O(n), Space: O(n)
unordered_map<int, long long> fiboMemo;

long long fibonacciMemo(int n) {
    // Check if already computed
    if (fiboMemo.find(n) != fiboMemo.end()) {
        return fiboMemo[n];
    }
    
    // Base cases
    if (n <= 1) {
        return n;
    }
    
    // Compute and store
    fiboMemo[n] = fibonacciMemo(n - 1) + fibonacciMemo(n - 2);
    return fiboMemo[n];
}

// 3. Power function
// Time: O(log n), Space: O(log n)
double power(double base, int exponent) {
    // Base case
    if (exponent == 0) {
        return 1.0;
    }
    
    // Handle negative exponents
    if (exponent < 0) {
        return 1.0 / power(base, -exponent);
    }
    
    // Optimize using divide and conquer
    if (exponent % 2 == 0) {
        double half = power(base, exponent / 2);
        return half * half;
    } else {
        return base * power(base, exponent - 1);
    }
}

// 4. Sum of array
// Time: O(n), Space: O(n)
int arraySum(const vector<int>& arr, int index = 0) {
    // Base case
    if (index >= arr.size()) {
        return 0;
    }
    
    // Recursive case
    return arr[index] + arraySum(arr, index + 1);
}

// 5. Reverse string
// Time: O(n), Space: O(n)
string reverseString(const string& str) {
    // Base case
    if (str.length() <= 1) {
        return str;
    }
    
    // Recursive case
    return str.back() + reverseString(str.substr(0, str.length() - 1));
}

// 6. Check palindrome
// Time: O(n), Space: O(n)
bool isPalindrome(const string& str, int start = 0, int end = -1) {
    if (end == -1) end = str.length() - 1;
    
    // Base case
    if (start >= end) {
        return true;
    }
    
    // Check characters
    if (str[start] != str[end]) {
        return false;
    }
    
    // Recursive case
    return isPalindrome(str, start + 1, end - 1);
}

// 7. Binary search
// Time: O(log n), Space: O(log n)
int binarySearch(const vector<int>& arr, int target, int left = 0, int right = -1) {
    if (right == -1) right = arr.size() - 1;
    
    // Base case: not found
    if (left > right) {
        return -1;
    }
    
    int mid = left + (right - left) / 2;
    
    // Base case: found
    if (arr[mid] == target) {
        return mid;
    }
    
    // Recursive cases
    if (target < arr[mid]) {
        return binarySearch(arr, target, left, mid - 1);
    } else {
        return binarySearch(arr, target, mid + 1, right);
    }
}

// 8. Generate subsets
// Time: O(2^n), Space: O(2^n)
void generateSubsets(const vector<int>& nums, int index, vector<int>& current, vector<vector<int>>& result) {
    // Base case: processed all elements
    if (index == nums.size()) {
        result.push_back(current);
        return;
    }
    
    // Include current element
    current.push_back(nums[index]);
    generateSubsets(nums, index + 1, current, result);
    
    // Exclude current element (backtrack)
    current.pop_back();
    generateSubsets(nums, index + 1, current, result);
}

vector<vector<int>> getAllSubsets(const vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    generateSubsets(nums, 0, current, result);
    return result;
}

// 9. Tower of Hanoi
// Time: O(2^n), Space: O(n)
void towerOfHanoi(int n, char source, char destination, char auxiliary, vector<string>& moves) {
    // Base case
    if (n == 1) {
        moves.push_back("Move disk 1 from " + string(1, source) + " to " + string(1, destination));
        return;
    }
    
    // Move n-1 disks from source to auxiliary
    towerOfHanoi(n - 1, source, auxiliary, destination, moves);
    
    // Move the largest disk
    moves.push_back("Move disk " + to_string(n) + " from " + string(1, source) + " to " + string(1, destination));
    
    // Move n-1 disks from auxiliary to destination
    towerOfHanoi(n - 1, auxiliary, destination, source, moves);
}

// 10. Count paths in grid
// Time: O(m*n) with memoization, Space: O(m*n)
unordered_map<string, int> pathMemo;

int countPaths(int m, int n) {
    string key = to_string(m) + "," + to_string(n);
    
    // Check memo
    if (pathMemo.find(key) != pathMemo.end()) {
        return pathMemo[key];
    }
    
    // Base cases
    if (m == 1 || n == 1) {
        return 1;
    }
    
    // Recursive case
    pathMemo[key] = countPaths(m - 1, n) + countPaths(m, n - 1);
    return pathMemo[key];
}

// 11. Merge Sort
// Time: O(n log n), Space: O(n)
vector<int> merge(const vector<int>& left, const vector<int>& right) {
    vector<int> result;
    int i = 0, j = 0;
    
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) {
            result.push_back(left[i]);
            i++;
        } else {
            result.push_back(right[j]);
            j++;
        }
    }
    
    // Add remaining elements
    while (i < left.size()) {
        result.push_back(left[i]);
        i++;
    }
    while (j < right.size()) {
        result.push_back(right[j]);
        j++;
    }
    
    return result;
}

vector<int> mergeSort(const vector<int>& arr) {
    // Base case
    if (arr.size() <= 1) {
        return arr;
    }
    
    // Divide
    int mid = arr.size() / 2;
    vector<int> left(arr.begin(), arr.begin() + mid);
    vector<int> right(arr.begin() + mid, arr.end());
    
    // Conquer
    vector<int> sortedLeft = mergeSort(left);
    vector<int> sortedRight = mergeSort(right);
    
    // Merge
    return merge(sortedLeft, sortedRight);
}

// 12. Quick Sort
// Time: O(n log n) average, O(n^2) worst, Space: O(log n)
int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

// Helper Functions
class RecursionHelpers {
public:
    // Tail recursion (C++ may optimize)
    static long long factorialTailRecursive(int n, long long accumulator = 1) {
        if (n <= 1) {
            return accumulator;
        }
        return factorialTailRecursive(n - 1, n * accumulator);
    }
    
    // Mutual recursion
    static bool isEven(int n) {
        if (n == 0) return true;
        return isOdd(n - 1);
    }
    
    static bool isOdd(int n) {
        if (n == 0) return false;
        return isEven(n - 1);
    }
    
    // Greatest Common Divisor (Euclidean algorithm)
    static int gcd(int a, int b) {
        if (b == 0) return a;
        return gcd(b, a % b);
    }
    
    // Convert decimal to binary
    static string decimalToBinary(int n) {
        if (n == 0) return "0";
        if (n == 1) return "1";
        
        return decimalToBinary(n / 2) + to_string(n % 2);
    }
};

// Example Usage
int main() {
    cout << "=== Basic Recursion Examples ===" << endl;
    cout << "Factorial of 5: " << factorial(5) << endl;
    cout << "Fibonacci of 10: " << fibonacci(10) << endl;
    cout << "Fibonacci of 10 (memoized): " << fibonacciMemo(10) << endl;
    cout << "2^10: " << power(2, 10) << endl;
    
    vector<int> arr = {1, 2, 3, 4, 5};
    cout << "Sum of array: " << arraySum(arr) << endl;
    
    string str = "hello";
    cout << "Reverse of \"" << str << "\": " << reverseString(str) << endl;
    
    string palindrome = "racecar";
    cout << "Is \"" << palindrome << "\" palindrome? " << (isPalindrome(palindrome) ? "Yes" : "No") << endl;
    
    cout << "\n=== Advanced Recursion Examples ===" << endl;
    vector<int> sortedArr = {1, 3, 5, 7, 9, 11, 13};
    cout << "Binary search for 7: " << binarySearch(sortedArr, 7) << endl;
    
    vector<int> nums = {1, 2, 3};
    vector<vector<int>> subsets = getAllSubsets(nums);
    cout << "Subsets of [1,2,3]: ";
    for (const auto& subset : subsets) {
        cout << "[";
        for (int i = 0; i < subset.size(); i++) {
            cout << subset[i];
            if (i < subset.size() - 1) cout << ",";
        }
        cout << "] ";
    }
    cout << endl;
    
    vector<string> hanoiMoves;
    towerOfHanoi(3, 'A', 'C', 'B', hanoiMoves);
    cout << "Tower of Hanoi (3 disks):" << endl;
    for (const string& move : hanoiMoves) {
        cout << move << endl;
    }
    
    cout << "Paths in 3x3 grid: " << countPaths(3, 3) << endl;
    
    vector<int> unsorted = {64, 34, 25, 12, 22, 11, 90};
    cout << "Original array: ";
    for (int x : unsorted) cout << x << " ";
    cout << endl;
    
    vector<int> mergeSorted = mergeSort(unsorted);
    cout << "Merge sorted: ";
    for (int x : mergeSorted) cout << x << " ";
    cout << endl;
    
    vector<int> quickSorted = unsorted;
    quickSort(quickSorted, 0, quickSorted.size() - 1);
    cout << "Quick sorted: ";
    for (int x : quickSorted) cout << x << " ";
    cout << endl;
    
    cout << "\n=== Helper Functions ===" << endl;
    cout << "Factorial tail recursive: " << RecursionHelpers::factorialTailRecursive(5) << endl;
    cout << "Is 4 even? " << (RecursionHelpers::isEven(4) ? "Yes" : "No") << endl;
    cout << "Is 5 odd? " << (RecursionHelpers::isOdd(5) ? "Yes" : "No") << endl;
    cout << "GCD of 48 and 18: " << RecursionHelpers::gcd(48, 18) << endl;
    cout << "Binary of 10: " << RecursionHelpers::decimalToBinary(10) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Patterns:

| Pattern | Example | Time Complexity | Space Complexity |
|---------|---------|----------------|------------------|
| **Linear Recursion** | Factorial, Sum | O(n) | O(n) |
| **Binary Recursion** | Fibonacci (naive) | O(2^n) | O(n) |
| **Logarithmic** | Binary Search, Power | O(log n) | O(log n) |
| **Divide & Conquer** | Merge Sort | O(n log n) | O(n) |

### Common Pitfalls:

1. **Stack Overflow**: Deep recursion can exhaust call stack
   ```javascript
   // Bad: Will cause stack overflow for large n
   function badFactorial(n) {
       if (n === 0) return 1;
       return n * badFactorial(n - 1); // No tail call optimization
   }
   ```

2. **Exponential Time**: Naive recursive solutions
   ```javascript
   // Bad: O(2^n) time complexity
   function slowFibonacci(n) {
       if (n <= 1) return n;
       return slowFibonacci(n-1) + slowFibonacci(n-2); // Recalculates same values
   }
   ```

3. **Missing Base Case**: Infinite recursion
   ```javascript
   // Bad: No base case
   function infiniteRecursion(n) {
       return infiniteRecursion(n - 1); // Will never stop
   }
   ```

4. **Incorrect Progress**: Not moving toward base case
   ```javascript
   // Bad: n never decreases
   function noProgress(n) {
       if (n === 0) return 0;
       return noProgress(n); // Same value passed
   }
   ```

### Optimization Techniques:

1. **Memoization**: Store computed results
2. **Tail Recursion**: Last operation is recursive call
3. **Iterative Conversion**: Convert to loops when possible
4. **Dynamic Programming**: Bottom-up approach

---

## 🧩 Practice Problems

### Problem 1: Sum of Digits
**Question**: Write a recursive function to find the sum of digits of a number.

**Example**: `sumDigits(1234)` should return `10`

**Solution**:
```javascript
function sumDigits(n) {
    if (n === 0) return 0;
    return (n % 10) + sumDigits(Math.floor(n / 10));
}
```

### Problem 2: Count Occurrences
**Question**: Count occurrences of a character in a string recursively.

**Hint**: Process one character at a time.

### Problem 3: Flatten Nested Array
**Question**: Flatten a nested array using recursion.

**Example**: `[1, [2, 3], [4, [5, 6]]]` → `[1, 2, 3, 4, 5, 6]`

**Hint**: Check if element is array, recurse if true.

### Problem 4: Generate Permutations
**Question**: Generate all permutations of a string.

**Hint**: Fix first character, permute rest, then swap.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Base case identification**: Can you identify when to stop?
2. **Recursive case logic**: Do you break down the problem correctly?
3. **Complexity analysis**: Can you analyze time/space complexity?
4. **Optimization awareness**: Do you know when recursion isn't optimal?

### Common Interview Patterns:
- **Tree traversals**: Inorder, preorder, postorder
- **Divide and conquer**: Merge sort, quick sort, binary search
- **Backtracking**: Permutations, combinations, N-Queens
- **Dynamic programming**: Fibonacci, coin change, longest subsequence

### Red Flags to Avoid:
- Forgetting base cases
- Not making progress toward base case
- Ignoring stack overflow for large inputs
- Not considering iterative alternatives

### Pro Tips:
1. **Start with base case**: Always identify stopping condition first
2. **Trust the recursion**: Assume recursive calls work correctly
3. **Draw the call stack**: Visualize for complex problems
4. **Consider memoization**: For overlapping subproblems
5. **Think iteratively too**: Sometimes loops are better

---

## 🚀 Key Takeaways

1. **Recursion is powerful** - Elegant solutions for many problems
2. **Base cases are crucial** - Always define stopping conditions
3. **Watch the complexity** - Naive recursion can be exponential
4. **Memoization helps** - Cache results for overlapping subproblems
5. **Not always optimal** - Sometimes iteration is better
6. **Practice makes perfect** - Start simple, build complexity

**Next Chapter**: We'll explore Sorting Algorithms and see how recursion powers divide-and-conquer sorting methods like merge sort and quick sort.