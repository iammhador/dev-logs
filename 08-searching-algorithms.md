# Chapter 8: Searching Algorithms - Finding Data Efficiently

## 🎯 What is Searching?

**Searching** is the process of finding a specific element or determining if it exists in a collection of data. It's one of the most fundamental operations in computer science and forms the backbone of many applications.

### Why Searching Matters:
- **Data retrieval**: Core operation in databases and file systems
- **User experience**: Fast search improves application responsiveness
- **Algorithm foundation**: Many algorithms rely on efficient searching
- **Real-world applications**: Web search, autocomplete, recommendation systems
- **Problem solving**: Essential for many coding interview questions

### Search Categories:
1. **Linear vs Binary**: Sequential vs divide-and-conquer approaches
2. **Exact vs Approximate**: Finding exact matches vs similar items
3. **Single vs Multiple**: Finding one occurrence vs all occurrences
4. **Static vs Dynamic**: Searching in fixed vs changing datasets

---

## 🔍 Search Algorithm Overview

| Algorithm | Data Structure | Time (Best) | Time (Average) | Time (Worst) | Space | Prerequisites |
|-----------|----------------|-------------|----------------|--------------|-------|---------------|
| **Linear Search** | Any | O(1) | O(n) | O(n) | O(1) | None |
| **Binary Search** | Sorted Array | O(1) | O(log n) | O(log n) | O(1) | Sorted data |
| **Jump Search** | Sorted Array | O(1) | O(√n) | O(√n) | O(1) | Sorted data |
| **Interpolation Search** | Uniformly Distributed | O(1) | O(log log n) | O(n) | O(1) | Sorted, uniform |
| **Exponential Search** | Sorted Array | O(1) | O(log n) | O(log n) | O(1) | Sorted data |
| **Ternary Search** | Sorted Array | O(1) | O(log₃ n) | O(log₃ n) | O(1) | Sorted data |

---

## 💻 JavaScript Implementation

```javascript
// Searching Algorithms Implementation

// 1. Linear Search (Sequential Search)
// Time: O(n), Space: O(1)
// Works on: Any data structure
function linearSearch(arr, target) {
    // Search through each element sequentially
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i; // Return index if found
        }
    }
    return -1; // Return -1 if not found
}

// Linear Search - Find All Occurrences
// Time: O(n), Space: O(k) where k is number of occurrences
function linearSearchAll(arr, target) {
    const indices = [];
    
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            indices.push(i);
        }
    }
    
    return indices;
}

// 2. Binary Search (Iterative)
// Time: O(log n), Space: O(1)
// Prerequisite: Array must be sorted
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        // Calculate middle index (avoid overflow)
        const mid = Math.floor(left + (right - left) / 2);
        
        // Check if target is at middle
        if (arr[mid] === target) {
            return mid;
        }
        
        // If target is smaller, search left half
        if (arr[mid] > target) {
            right = mid - 1;
        }
        // If target is larger, search right half
        else {
            left = mid + 1;
        }
    }
    
    return -1; // Target not found
}

// Binary Search (Recursive)
// Time: O(log n), Space: O(log n)
function binarySearchRecursive(arr, target, left = 0, right = arr.length - 1) {
    // Base case: element not found
    if (left > right) {
        return -1;
    }
    
    const mid = Math.floor(left + (right - left) / 2);
    
    // Base case: element found
    if (arr[mid] === target) {
        return mid;
    }
    
    // Recursive cases
    if (arr[mid] > target) {
        return binarySearchRecursive(arr, target, left, mid - 1);
    } else {
        return binarySearchRecursive(arr, target, mid + 1, right);
    }
}

// Binary Search Variations

// Find First Occurrence (Leftmost)
// Time: O(log n), Space: O(1)
function findFirstOccurrence(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] === target) {
            result = mid;
            right = mid - 1; // Continue searching in left half
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Find Last Occurrence (Rightmost)
// Time: O(log n), Space: O(1)
function findLastOccurrence(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] === target) {
            result = mid;
            left = mid + 1; // Continue searching in right half
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Find Range of Target (First and Last Occurrence)
// Time: O(log n), Space: O(1)
function findRange(arr, target) {
    const first = findFirstOccurrence(arr, target);
    if (first === -1) {
        return [-1, -1];
    }
    
    const last = findLastOccurrence(arr, target);
    return [first, last];
}

// Find Insert Position
// Time: O(log n), Space: O(1)
function findInsertPosition(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return left;
}

// 3. Jump Search (Block Search)
// Time: O(√n), Space: O(1)
// Prerequisite: Array must be sorted
function jumpSearch(arr, target) {
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));
    let prev = 0;
    
    // Find the block where element is present
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += Math.floor(Math.sqrt(n));
        
        // If we reached end of array
        if (prev >= n) {
            return -1;
        }
    }
    
    // Linear search in the identified block
    while (arr[prev] < target) {
        prev++;
        
        // If we reached next block or end of array
        if (prev === Math.min(step, n)) {
            return -1;
        }
    }
    
    // If element is found
    if (arr[prev] === target) {
        return prev;
    }
    
    return -1;
}

// 4. Interpolation Search
// Time: O(log log n) average, O(n) worst, Space: O(1)
// Prerequisite: Array must be sorted and uniformly distributed
function interpolationSearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        // If array has only one element
        if (left === right) {
            return arr[left] === target ? left : -1;
        }
        
        // Calculate position using interpolation formula
        const pos = left + Math.floor(
            ((target - arr[left]) * (right - left)) / (arr[right] - arr[left])
        );
        
        // Target found
        if (arr[pos] === target) {
            return pos;
        }
        
        // If target is larger, search right subarray
        if (arr[pos] < target) {
            left = pos + 1;
        }
        // If target is smaller, search left subarray
        else {
            right = pos - 1;
        }
    }
    
    return -1;
}

// 5. Exponential Search (Doubling Search)
// Time: O(log n), Space: O(1)
// Prerequisite: Array must be sorted
function exponentialSearch(arr, target) {
    const n = arr.length;
    
    // If target is at first position
    if (arr[0] === target) {
        return 0;
    }
    
    // Find range for binary search by repeated doubling
    let bound = 1;
    while (bound < n && arr[bound] <= target) {
        bound *= 2;
    }
    
    // Perform binary search in the found range
    return binarySearchRange(arr, target, bound / 2, Math.min(bound, n - 1));
}

// Helper function for exponential search
function binarySearchRange(arr, target, left, right) {
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] === target) {
            return mid;
        }
        
        if (arr[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return -1;
}

// 6. Ternary Search
// Time: O(log₃ n), Space: O(1)
// Prerequisite: Array must be sorted
function ternarySearch(arr, target, left = 0, right = arr.length - 1) {
    if (left > right) {
        return -1;
    }
    
    // Divide array into three parts
    const mid1 = left + Math.floor((right - left) / 3);
    const mid2 = right - Math.floor((right - left) / 3);
    
    // Check if target is at either midpoint
    if (arr[mid1] === target) {
        return mid1;
    }
    if (arr[mid2] === target) {
        return mid2;
    }
    
    // Determine which third to search
    if (target < arr[mid1]) {
        return ternarySearch(arr, target, left, mid1 - 1);
    } else if (target > arr[mid2]) {
        return ternarySearch(arr, target, mid2 + 1, right);
    } else {
        return ternarySearch(arr, target, mid1 + 1, mid2 - 1);
    }
}

// Advanced Search Algorithms

// 7. Search in Rotated Sorted Array
// Time: O(log n), Space: O(1)
function searchRotatedArray(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] === target) {
            return mid;
        }
        
        // Check which half is sorted
        if (arr[left] <= arr[mid]) {
            // Left half is sorted
            if (target >= arr[left] && target < arr[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (target > arr[mid] && target <= arr[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}

// 8. Search in 2D Matrix
// Time: O(log(m*n)), Space: O(1)
function searchMatrix(matrix, target) {
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        return false;
    }
    
    const m = matrix.length;
    const n = matrix[0].length;
    let left = 0;
    let right = m * n - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        const midValue = matrix[Math.floor(mid / n)][mid % n];
        
        if (midValue === target) {
            return true;
        } else if (midValue < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return false;
}

// 9. Find Peak Element
// Time: O(log n), Space: O(1)
function findPeakElement(arr) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] > arr[mid + 1]) {
            // Peak is in left half (including mid)
            right = mid;
        } else {
            // Peak is in right half
            left = mid + 1;
        }
    }
    
    return left;
}

// 10. Find Minimum in Rotated Sorted Array
// Time: O(log n), Space: O(1)
function findMinRotated(arr) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (arr[mid] > arr[right]) {
            // Minimum is in right half
            left = mid + 1;
        } else {
            // Minimum is in left half (including mid)
            right = mid;
        }
    }
    
    return arr[left];
}

// Search Utilities
class SearchUtils {
    // Binary search for closest element
    static findClosest(arr, target) {
        if (arr.length === 0) return -1;
        
        let left = 0;
        let right = arr.length - 1;
        let closest = 0;
        
        while (left <= right) {
            const mid = Math.floor(left + (right - left) / 2);
            
            // Update closest if current element is closer
            if (Math.abs(arr[mid] - target) < Math.abs(arr[closest] - target)) {
                closest = mid;
            }
            
            if (arr[mid] === target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return closest;
    }
    
    // Count occurrences using binary search
    static countOccurrences(arr, target) {
        const range = findRange(arr, target);
        if (range[0] === -1) {
            return 0;
        }
        return range[1] - range[0] + 1;
    }
    
    // Search in infinite array (simulated with large array)
    static searchInfinite(arr, target) {
        let bound = 1;
        
        // Find upper bound
        while (bound < arr.length && arr[bound] < target) {
            bound *= 2;
        }
        
        // Binary search in the range
        return binarySearchRange(arr, target, bound / 2, Math.min(bound, arr.length - 1));
    }
    
    // Find floor and ceiling
    static findFloorCeiling(arr, target) {
        let floor = -1;
        let ceiling = -1;
        
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] <= target) {
                floor = arr[i];
            }
            if (arr[i] >= target && ceiling === -1) {
                ceiling = arr[i];
            }
        }
        
        return { floor, ceiling };
    }
    
    // Performance measurement
    static measureSearchPerformance(searchFunc, arr, target, name) {
        const start = performance.now();
        const result = searchFunc(arr, target);
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(4)}ms, Result: ${result}`);
        return result;
    }
    
    // Generate test data
    static generateSortedArray(size, min = 0, max = 1000) {
        const arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return arr.sort((a, b) => a - b);
    }
    
    // Fuzzy search (simple implementation)
    static fuzzySearch(arr, target, threshold = 2) {
        const results = [];
        
        for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] === 'string' && typeof target === 'string') {
                const distance = SearchUtils.levenshteinDistance(arr[i], target);
                if (distance <= threshold) {
                    results.push({ index: i, value: arr[i], distance });
                }
            }
        }
        
        return results.sort((a, b) => a.distance - b.distance);
    }
    
    // Levenshtein distance for fuzzy search
    static levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
}

// Example Usage and Testing
console.log('=== Searching Algorithms Demo ===');

// Test data
const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25];
const target = 13;

console.log('Sorted array:', sortedArray);
console.log('Target:', target);

console.log('\n=== Basic Search Algorithms ===');
console.log('Linear Search:', linearSearch(sortedArray, target));
console.log('Binary Search (Iterative):', binarySearch(sortedArray, target));
console.log('Binary Search (Recursive):', binarySearchRecursive(sortedArray, target));

console.log('\n=== Advanced Search Algorithms ===');
console.log('Jump Search:', jumpSearch(sortedArray, target));
console.log('Interpolation Search:', interpolationSearch(sortedArray, target));
console.log('Exponential Search:', exponentialSearch(sortedArray, target));
console.log('Ternary Search:', ternarySearch(sortedArray, target));

// Test with duplicates
const arrayWithDuplicates = [1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7];
console.log('\n=== Binary Search Variations ===');
console.log('Array with duplicates:', arrayWithDuplicates);
console.log('First occurrence of 2:', findFirstOccurrence(arrayWithDuplicates, 2));
console.log('Last occurrence of 6:', findLastOccurrence(arrayWithDuplicates, 6));
console.log('Range of 4:', findRange(arrayWithDuplicates, 4));
console.log('Insert position for 3.5:', findInsertPosition(arrayWithDuplicates, 3.5));

// Advanced problems
console.log('\n=== Advanced Search Problems ===');
const rotatedArray = [4, 5, 6, 7, 0, 1, 2];
console.log('Rotated array:', rotatedArray);
console.log('Search 0 in rotated array:', searchRotatedArray(rotatedArray, 0));
console.log('Find minimum in rotated array:', findMinRotated(rotatedArray));

const peakArray = [1, 2, 3, 1];
console.log('Peak array:', peakArray);
console.log('Peak element index:', findPeakElement(peakArray));

// 2D Matrix search
const matrix = [
    [1,  4,  7,  11],
    [2,  5,  8,  12],
    [3,  6,  9,  16],
    [10, 13, 14, 17]
];
console.log('\n=== 2D Matrix Search ===');
console.log('Search 5 in matrix:', searchMatrix(matrix, 5));
console.log('Search 13 in matrix:', searchMatrix(matrix, 13));

// Performance comparison
console.log('\n=== Performance Comparison ===');
const largeArray = SearchUtils.generateSortedArray(10000);
const searchTarget = largeArray[Math.floor(Math.random() * largeArray.length)];

SearchUtils.measureSearchPerformance(linearSearch, largeArray, searchTarget, 'Linear Search');
SearchUtils.measureSearchPerformance(binarySearch, largeArray, searchTarget, 'Binary Search');
SearchUtils.measureSearchPerformance(jumpSearch, largeArray, searchTarget, 'Jump Search');
SearchUtils.measureSearchPerformance(interpolationSearch, largeArray, searchTarget, 'Interpolation Search');

// Utility demonstrations
console.log('\n=== Search Utilities ===');
console.log('Closest to 14 in sorted array:', SearchUtils.findClosest(sortedArray, 14));
console.log('Count of 2 in duplicates array:', SearchUtils.countOccurrences(arrayWithDuplicates, 2));

const floorCeiling = SearchUtils.findFloorCeiling(sortedArray, 12);
console.log('Floor and ceiling of 12:', floorCeiling);

// Fuzzy search demo
const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'];
const fuzzyResults = SearchUtils.fuzzySearch(names, 'Charli', 2);
console.log('\n=== Fuzzy Search ===');
console.log('Fuzzy search for "Charli":', fuzzyResults);
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <chrono>
#include <random>
using namespace std;
using namespace std::chrono;

// Searching Algorithms Implementation

// 1. Linear Search
// Time: O(n), Space: O(1)
int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}

// Linear Search - Find All Occurrences
vector<int> linearSearchAll(const vector<int>& arr, int target) {
    vector<int> indices;
    
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            indices.push_back(i);
        }
    }
    
    return indices;
}

// 2. Binary Search (Iterative)
// Time: O(log n), Space: O(1)
int binarySearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return -1;
}

// Binary Search (Recursive)
// Time: O(log n), Space: O(log n)
int binarySearchRecursive(const vector<int>& arr, int target, int left, int right) {
    if (left > right) {
        return -1;
    }
    
    int mid = left + (right - left) / 2;
    
    if (arr[mid] == target) {
        return mid;
    }
    
    if (arr[mid] > target) {
        return binarySearchRecursive(arr, target, left, mid - 1);
    } else {
        return binarySearchRecursive(arr, target, mid + 1, right);
    }
}

// Find First Occurrence
int findFirstOccurrence(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            right = mid - 1; // Continue searching left
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Find Last Occurrence
int findLastOccurrence(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    int result = -1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            result = mid;
            left = mid + 1; // Continue searching right
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return result;
}

// Find Range
pair<int, int> findRange(const vector<int>& arr, int target) {
    int first = findFirstOccurrence(arr, target);
    if (first == -1) {
        return {-1, -1};
    }
    
    int last = findLastOccurrence(arr, target);
    return {first, last};
}

// 3. Jump Search
// Time: O(√n), Space: O(1)
int jumpSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int step = sqrt(n);
    int prev = 0;
    
    // Find the block where element is present
    while (arr[min(step, n) - 1] < target) {
        prev = step;
        step += sqrt(n);
        
        if (prev >= n) {
            return -1;
        }
    }
    
    // Linear search in the block
    while (arr[prev] < target) {
        prev++;
        
        if (prev == min(step, n)) {
            return -1;
        }
    }
    
    if (arr[prev] == target) {
        return prev;
    }
    
    return -1;
}

// 4. Interpolation Search
// Time: O(log log n) average, O(n) worst
int interpolationSearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        if (left == right) {
            return arr[left] == target ? left : -1;
        }
        
        // Calculate position using interpolation formula
        int pos = left + ((double)(target - arr[left]) * (right - left)) / (arr[right] - arr[left]);
        
        if (arr[pos] == target) {
            return pos;
        }
        
        if (arr[pos] < target) {
            left = pos + 1;
        } else {
            right = pos - 1;
        }
    }
    
    return -1;
}

// 5. Exponential Search
// Time: O(log n), Space: O(1)
int binarySearchRange(const vector<int>& arr, int target, int left, int right) {
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] > target) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }
    
    return -1;
}

int exponentialSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    
    if (arr[0] == target) {
        return 0;
    }
    
    // Find range for binary search
    int bound = 1;
    while (bound < n && arr[bound] <= target) {
        bound *= 2;
    }
    
    return binarySearchRange(arr, target, bound / 2, min(bound, n - 1));
}

// 6. Ternary Search
// Time: O(log₃ n), Space: O(log n)
int ternarySearch(const vector<int>& arr, int target, int left, int right) {
    if (left > right) {
        return -1;
    }
    
    int mid1 = left + (right - left) / 3;
    int mid2 = right - (right - left) / 3;
    
    if (arr[mid1] == target) {
        return mid1;
    }
    if (arr[mid2] == target) {
        return mid2;
    }
    
    if (target < arr[mid1]) {
        return ternarySearch(arr, target, left, mid1 - 1);
    } else if (target > arr[mid2]) {
        return ternarySearch(arr, target, mid2 + 1, right);
    } else {
        return ternarySearch(arr, target, mid1 + 1, mid2 - 1);
    }
}

// Advanced Search Problems

// Search in Rotated Sorted Array
int searchRotatedArray(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[left] <= arr[mid]) {
            // Left half is sorted
            if (target >= arr[left] && target < arr[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (target > arr[mid] && target <= arr[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}

// Find Peak Element
int findPeakElement(const vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] > arr[mid + 1]) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}

// Find Minimum in Rotated Sorted Array
int findMinRotated(const vector<int>& arr) {
    int left = 0;
    int right = arr.size() - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] > arr[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return arr[left];
}

// Search Utilities
class SearchUtils {
public:
    // Generate sorted array for testing
    static vector<int> generateSortedArray(int size, int minVal = 0, int maxVal = 1000) {
        vector<int> arr(size);
        random_device rd;
        mt19937 gen(rd());
        uniform_int_distribution<> dis(minVal, maxVal);
        
        for (int i = 0; i < size; i++) {
            arr[i] = dis(gen);
        }
        
        sort(arr.begin(), arr.end());
        return arr;
    }
    
    // Measure search performance
    static void measurePerformance(int (*searchFunc)(const vector<int>&, int), 
                                  const vector<int>& arr, int target, const string& name) {
        auto start = high_resolution_clock::now();
        int result = searchFunc(arr, target);
        auto end = high_resolution_clock::now();
        
        auto duration = duration_cast<microseconds>(end - start);
        cout << name << ": " << duration.count() << " microseconds, Result: " << result << endl;
    }
    
    // Find closest element
    static int findClosest(const vector<int>& arr, int target) {
        if (arr.empty()) return -1;
        
        int left = 0;
        int right = arr.size() - 1;
        int closest = 0;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (abs(arr[mid] - target) < abs(arr[closest] - target)) {
                closest = mid;
            }
            
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return closest;
    }
    
    // Count occurrences
    static int countOccurrences(const vector<int>& arr, int target) {
        auto range = findRange(arr, target);
        if (range.first == -1) {
            return 0;
        }
        return range.second - range.first + 1;
    }
};

// Print vector utility
void printVector(const vector<int>& arr, const string& label = "") {
    if (!label.empty()) {
        cout << label << ": ";
    }
    for (int x : arr) {
        cout << x << " ";
    }
    cout << endl;
}

// Example Usage
int main() {
    cout << "=== Searching Algorithms Demo ===" << endl;
    
    // Test data
    vector<int> sortedArray = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25};
    int target = 13;
    
    printVector(sortedArray, "Sorted array");
    cout << "Target: " << target << endl;
    
    cout << "\n=== Basic Search Algorithms ===" << endl;
    cout << "Linear Search: " << linearSearch(sortedArray, target) << endl;
    cout << "Binary Search (Iterative): " << binarySearch(sortedArray, target) << endl;
    cout << "Binary Search (Recursive): " << binarySearchRecursive(sortedArray, target, 0, sortedArray.size() - 1) << endl;
    
    cout << "\n=== Advanced Search Algorithms ===" << endl;
    cout << "Jump Search: " << jumpSearch(sortedArray, target) << endl;
    cout << "Interpolation Search: " << interpolationSearch(sortedArray, target) << endl;
    cout << "Exponential Search: " << exponentialSearch(sortedArray, target) << endl;
    cout << "Ternary Search: " << ternarySearch(sortedArray, target, 0, sortedArray.size() - 1) << endl;
    
    // Test with duplicates
    vector<int> arrayWithDuplicates = {1, 2, 2, 2, 3, 4, 4, 5, 6, 6, 6, 7};
    cout << "\n=== Binary Search Variations ===" << endl;
    printVector(arrayWithDuplicates, "Array with duplicates");
    cout << "First occurrence of 2: " << findFirstOccurrence(arrayWithDuplicates, 2) << endl;
    cout << "Last occurrence of 6: " << findLastOccurrence(arrayWithDuplicates, 6) << endl;
    
    auto range = findRange(arrayWithDuplicates, 4);
    cout << "Range of 4: [" << range.first << ", " << range.second << "]" << endl;
    
    // Advanced problems
    cout << "\n=== Advanced Search Problems ===" << endl;
    vector<int> rotatedArray = {4, 5, 6, 7, 0, 1, 2};
    printVector(rotatedArray, "Rotated array");
    cout << "Search 0 in rotated array: " << searchRotatedArray(rotatedArray, 0) << endl;
    cout << "Find minimum in rotated array: " << findMinRotated(rotatedArray) << endl;
    
    vector<int> peakArray = {1, 2, 3, 1};
    printVector(peakArray, "Peak array");
    cout << "Peak element index: " << findPeakElement(peakArray) << endl;
    
    // Performance comparison
    cout << "\n=== Performance Comparison (10000 elements) ===" << endl;
    vector<int> largeArray = SearchUtils::generateSortedArray(10000);
    int searchTarget = largeArray[rand() % largeArray.size()];
    
    SearchUtils::measurePerformance(linearSearch, largeArray, searchTarget, "Linear Search");
    SearchUtils::measurePerformance(binarySearch, largeArray, searchTarget, "Binary Search");
    SearchUtils::measurePerformance(jumpSearch, largeArray, searchTarget, "Jump Search");
    SearchUtils::measurePerformance(interpolationSearch, largeArray, searchTarget, "Interpolation Search");
    
    // Utility demonstrations
    cout << "\n=== Search Utilities ===" << endl;
    cout << "Closest to 14 in sorted array: " << SearchUtils::findClosest(sortedArray, 14) << endl;
    cout << "Count of 2 in duplicates array: " << SearchUtils::countOccurrences(arrayWithDuplicates, 2) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Algorithm Selection Guide:

1. **Linear Search**:
   - ✅ Unsorted data
   - ✅ Small datasets (< 100 elements)
   - ✅ Simple implementation needed
   - ❌ Large datasets

2. **Binary Search**:
   - ✅ Sorted data
   - ✅ Large datasets
   - ✅ Guaranteed O(log n) performance
   - ❌ Unsorted data

3. **Jump Search**:
   - ✅ Sorted data, better than linear
   - ✅ When binary search overhead is concern
   - ❌ Generally worse than binary search

4. **Interpolation Search**:
   - ✅ Uniformly distributed sorted data
   - ✅ Very large datasets
   - ❌ Non-uniform distribution

### Common Pitfalls:

1. **Integer overflow**: In mid calculation
   ```javascript
   // Bad: Can overflow
   const mid = Math.floor((left + right) / 2);
   
   // Good: Prevents overflow
   const mid = Math.floor(left + (right - left) / 2);
   ```

2. **Infinite loops**: Incorrect boundary updates
   ```javascript
   // Bad: Can cause infinite loop
   if (arr[mid] < target) {
       left = mid; // Should be mid + 1
   }
   ```

3. **Off-by-one errors**: Incorrect loop conditions
   ```javascript
   // Correct condition for binary search
   while (left <= right) { // Note: <=, not <
   ```

4. **Unsorted data**: Using binary search on unsorted array

---

## 🧩 Practice Problems

### Problem 1: Search Insert Position
**Question**: Find the index where target should be inserted in sorted array.

**Example**: `nums = [1,3,5,6], target = 5` → `2`

**Solution**:
```javascript
function searchInsert(nums, target) {
    let left = 0, right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return left;
}
```

### Problem 2: Find First and Last Position
**Question**: Find first and last position of target in sorted array.

**Hint**: Use modified binary search to find leftmost and rightmost occurrences.

### Problem 3: Search in 2D Matrix II
**Question**: Search target in matrix where each row and column is sorted.

**Hint**: Start from top-right or bottom-left corner.

### Problem 4: Find Minimum in Rotated Sorted Array
**Question**: Find minimum element in rotated sorted array.

**Hint**: Use binary search with rotation logic.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Algorithm selection**: Can you choose the right search algorithm?
2. **Implementation correctness**: Handle edge cases and boundaries
3. **Complexity analysis**: Understand time/space trade-offs
4. **Problem variations**: Adapt to different constraints

### Common Interview Patterns:
- **Binary search variations**: First/last occurrence, insert position
- **Rotated arrays**: Search in rotated sorted arrays
- **2D searching**: Matrix search problems
- **Peak finding**: Local maxima/minima
- **Range queries**: Finding ranges and counts

### Red Flags to Avoid:
- Using linear search when binary search is possible
- Integer overflow in mid calculation
- Infinite loops due to incorrect boundaries
- Not handling empty arrays or edge cases

### Pro Tips:
1. **Clarify requirements**: Sorted? Duplicates? Return index or boolean?
2. **Start with brute force**: Then optimize to binary search
3. **Draw the search space**: Visualize the problem
4. **Test edge cases**: Empty array, single element, target not found
5. **Practice variations**: Master the binary search template

---

## 🚀 Key Takeaways

1. **Binary search is powerful** - O(log n) vs O(n) is huge for large data
2. **Sorted data enables efficiency** - Always consider if sorting first helps
3. **Master the template** - Binary search has many variations
4. **Handle edge cases** - Empty arrays, duplicates, boundaries
5. **Choose wisely** - Linear search is fine for small datasets
6. **Practice variations** - First/last occurrence, rotated arrays, 2D matrices

**Next Chapter**: We'll explore Tree Traversals and see how searching principles apply to hierarchical data structures.