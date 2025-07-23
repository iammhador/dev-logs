# Chapter 7: Sorting Algorithms - Organizing Data Efficiently

## 🎯 What is Sorting?

**Sorting** is the process of arranging data in a particular order (ascending or descending). It's one of the most fundamental operations in computer science and forms the basis for many other algorithms.

### Why Sorting Matters:
- **Search optimization**: Sorted data enables binary search (O(log n))
- **Data organization**: Makes data easier to understand and process
- **Algorithm foundation**: Many algorithms require sorted input
- **Database operations**: Crucial for joins, indexing, and queries
- **User experience**: Organized data is more user-friendly

### Sorting Categories:
1. **Comparison-based**: Compare elements to determine order
2. **Non-comparison**: Use element properties (counting, radix)
3. **Stable**: Preserve relative order of equal elements
4. **In-place**: Sort with O(1) extra space
5. **Adaptive**: Perform better on partially sorted data

---

## 🔍 Sorting Algorithm Overview

| Algorithm | Time (Best) | Time (Average) | Time (Worst) | Space | Stable | In-place |
|-----------|-------------|----------------|--------------|-------|--------|----------|
| **Bubble Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| **Selection Sort** | O(n²) | O(n²) | O(n²) | O(1) | ❌ | ✅ |
| **Insertion Sort** | O(n) | O(n²) | O(n²) | O(1) | ✅ | ✅ |
| **Merge Sort** | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ | ❌ |
| **Quick Sort** | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ | ✅ |
| **Heap Sort** | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ | ✅ |

---

## 💻 JavaScript Implementation

```javascript
// Sorting Algorithms Implementation

// 1. Bubble Sort
// Time: O(n²), Space: O(1)
// Stable: Yes, In-place: Yes
function bubbleSort(arr) {
    const n = arr.length;
    const result = [...arr]; // Create copy to avoid mutation
    
    // Outer loop for number of passes
    for (let i = 0; i < n - 1; i++) {
        let swapped = false; // Optimization: track if any swaps occurred
        
        // Inner loop for comparisons in current pass
        // Last i elements are already sorted
        for (let j = 0; j < n - i - 1; j++) {
            // Compare adjacent elements
            if (result[j] > result[j + 1]) {
                // Swap if they're in wrong order
                [result[j], result[j + 1]] = [result[j + 1], result[j]];
                swapped = true;
            }
        }
        
        // If no swaps occurred, array is sorted
        if (!swapped) {
            break;
        }
    }
    
    return result;
}

// 2. Selection Sort
// Time: O(n²), Space: O(1)
// Stable: No, In-place: Yes
function selectionSort(arr) {
    const n = arr.length;
    const result = [...arr];
    
    // Move boundary of unsorted subarray
    for (let i = 0; i < n - 1; i++) {
        // Find minimum element in unsorted array
        let minIndex = i;
        
        for (let j = i + 1; j < n; j++) {
            if (result[j] < result[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap found minimum with first element
        if (minIndex !== i) {
            [result[i], result[minIndex]] = [result[minIndex], result[i]];
        }
    }
    
    return result;
}

// 3. Insertion Sort
// Time: O(n²), Space: O(1)
// Stable: Yes, In-place: Yes
function insertionSort(arr) {
    const n = arr.length;
    const result = [...arr];
    
    // Start from second element (first is considered sorted)
    for (let i = 1; i < n; i++) {
        const key = result[i]; // Current element to be positioned
        let j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && result[j] > key) {
            result[j + 1] = result[j];
            j--;
        }
        
        // Place key at its correct position
        result[j + 1] = key;
    }
    
    return result;
}

// 4. Merge Sort
// Time: O(n log n), Space: O(n)
// Stable: Yes, In-place: No
function mergeSort(arr) {
    // Base case: arrays with 0 or 1 element are already sorted
    if (arr.length <= 1) {
        return arr;
    }
    
    // Divide: split array into two halves
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    // Conquer: merge sorted halves
    return merge(left, right);
}

// Helper function to merge two sorted arrays
function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    // Compare elements from both arrays and merge in sorted order
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    // Add remaining elements (if any)
    while (i < left.length) {
        result.push(left[i]);
        i++;
    }
    
    while (j < right.length) {
        result.push(right[j]);
        j++;
    }
    
    return result;
}

// 5. Quick Sort
// Time: O(n log n) average, O(n²) worst, Space: O(log n)
// Stable: No, In-place: Yes
function quickSort(arr, low = 0, high = arr.length - 1) {
    const result = [...arr]; // Create copy for non-destructive sorting
    quickSortHelper(result, low, high);
    return result;
}

function quickSortHelper(arr, low, high) {
    if (low < high) {
        // Partition array and get pivot index
        const pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSortHelper(arr, low, pivotIndex - 1);
        quickSortHelper(arr, pivotIndex + 1, high);
    }
}

// Partition function for Quick Sort
function partition(arr, low, high) {
    // Choose rightmost element as pivot
    const pivot = arr[high];
    let i = low - 1; // Index of smaller element
    
    for (let j = low; j < high; j++) {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

// 6. Heap Sort
// Time: O(n log n), Space: O(1)
// Stable: No, In-place: Yes
function heapSort(arr) {
    const result = [...arr];
    const n = result.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(result, n, i);
    }
    
    // Extract elements from heap one by one
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        [result[0], result[i]] = [result[i], result[0]];
        
        // Call heapify on reduced heap
        heapify(result, i, 0);
    }
    
    return result;
}

// Heapify a subtree rooted at index i
function heapify(arr, n, i) {
    let largest = i; // Initialize largest as root
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    // If left child is larger than root
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    // If right child is larger than largest so far
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    // If largest is not root
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        
        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest);
    }
}

// Advanced Sorting Algorithms

// 7. Counting Sort (for integers in limited range)
// Time: O(n + k), Space: O(k) where k is range
// Stable: Yes, In-place: No
function countingSort(arr, maxValue = null) {
    if (arr.length === 0) return arr;
    
    // Find maximum value if not provided
    if (maxValue === null) {
        maxValue = Math.max(...arr);
    }
    
    // Create count array
    const count = new Array(maxValue + 1).fill(0);
    
    // Count occurrences of each element
    for (let num of arr) {
        count[num]++;
    }
    
    // Build result array
    const result = [];
    for (let i = 0; i <= maxValue; i++) {
        while (count[i] > 0) {
            result.push(i);
            count[i]--;
        }
    }
    
    return result;
}

// 8. Radix Sort (for non-negative integers)
// Time: O(d * (n + k)), Space: O(n + k)
// where d is number of digits, k is range of digits (0-9)
function radixSort(arr) {
    if (arr.length === 0) return arr;
    
    // Find maximum number to know number of digits
    const max = Math.max(...arr);
    
    // Do counting sort for every digit
    let result = [...arr];
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        result = countingSortByDigit(result, exp);
    }
    
    return result;
}

// Counting sort for radix sort
function countingSortByDigit(arr, exp) {
    const n = arr.length;
    const output = new Array(n);
    const count = new Array(10).fill(0);
    
    // Count occurrences of each digit
    for (let i = 0; i < n; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }
    
    // Change count[i] to actual position
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    return output;
}

// Sorting Utilities
class SortingUtils {
    // Check if array is sorted
    static isSorted(arr, ascending = true) {
        for (let i = 1; i < arr.length; i++) {
            if (ascending && arr[i] < arr[i - 1]) {
                return false;
            }
            if (!ascending && arr[i] > arr[i - 1]) {
                return false;
            }
        }
        return true;
    }
    
    // Generate random array for testing
    static generateRandomArray(size, min = 0, max = 100) {
        return Array.from({ length: size }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }
    
    // Measure sorting performance
    static measurePerformance(sortFunction, arr, name) {
        const start = performance.now();
        const sorted = sortFunction([...arr]);
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        console.log(`Sorted correctly: ${SortingUtils.isSorted(sorted)}`);
        return sorted;
    }
    
    // Sort with custom comparator
    static customSort(arr, compareFn) {
        return [...arr].sort(compareFn);
    }
    
    // Stable sort check
    static isStableSort(sortFunction) {
        // Test with objects having same keys
        const testData = [
            { key: 3, id: 'a' },
            { key: 1, id: 'b' },
            { key: 3, id: 'c' },
            { key: 2, id: 'd' },
            { key: 3, id: 'e' }
        ];
        
        const sorted = sortFunction(testData, (a, b) => a.key - b.key);
        
        // Check if relative order of equal elements is preserved
        const threes = sorted.filter(item => item.key === 3);
        return threes[0].id === 'a' && threes[1].id === 'c' && threes[2].id === 'e';
    }
    
    // Find kth smallest element (QuickSelect)
    static quickSelect(arr, k) {
        if (k < 1 || k > arr.length) {
            throw new Error('k is out of bounds');
        }
        
        const result = [...arr];
        return quickSelectHelper(result, 0, result.length - 1, k - 1);
    }
}

// QuickSelect helper function
function quickSelectHelper(arr, low, high, k) {
    if (low === high) {
        return arr[low];
    }
    
    const pivotIndex = partition(arr, low, high);
    
    if (k === pivotIndex) {
        return arr[k];
    } else if (k < pivotIndex) {
        return quickSelectHelper(arr, low, pivotIndex - 1, k);
    } else {
        return quickSelectHelper(arr, pivotIndex + 1, high, k);
    }
}

// Hybrid Sorting Algorithm (Introsort-like)
function hybridSort(arr) {
    if (arr.length <= 10) {
        // Use insertion sort for small arrays
        return insertionSort(arr);
    } else if (arr.length <= 1000) {
        // Use quick sort for medium arrays
        return quickSort(arr);
    } else {
        // Use merge sort for large arrays
        return mergeSort(arr);
    }
}

// Example Usage and Performance Testing
console.log('=== Sorting Algorithms Demo ===');

// Test data
const testArray = [64, 34, 25, 12, 22, 11, 90, 5, 77, 30];
console.log('Original array:', testArray);

// Test all sorting algorithms
console.log('\n=== Basic Sorting Algorithms ===');
console.log('Bubble Sort:', bubbleSort(testArray));
console.log('Selection Sort:', selectionSort(testArray));
console.log('Insertion Sort:', insertionSort(testArray));

console.log('\n=== Advanced Sorting Algorithms ===');
console.log('Merge Sort:', mergeSort(testArray));
console.log('Quick Sort:', quickSort(testArray));
console.log('Heap Sort:', heapSort(testArray));

console.log('\n=== Specialized Sorting Algorithms ===');
const integerArray = [4, 2, 2, 8, 3, 3, 1];
console.log('Original integers:', integerArray);
console.log('Counting Sort:', countingSort(integerArray));
console.log('Radix Sort:', radixSort(integerArray));

// Performance comparison
console.log('\n=== Performance Comparison ===');
const largeArray = SortingUtils.generateRandomArray(1000);

SortingUtils.measurePerformance(bubbleSort, largeArray, 'Bubble Sort');
SortingUtils.measurePerformance(selectionSort, largeArray, 'Selection Sort');
SortingUtils.measurePerformance(insertionSort, largeArray, 'Insertion Sort');
SortingUtils.measurePerformance(mergeSort, largeArray, 'Merge Sort');
SortingUtils.measurePerformance(quickSort, largeArray, 'Quick Sort');
SortingUtils.measurePerformance(heapSort, largeArray, 'Heap Sort');

// Utility demonstrations
console.log('\n=== Utility Functions ===');
console.log('Is [1,2,3,4,5] sorted?', SortingUtils.isSorted([1, 2, 3, 4, 5]));
console.log('3rd smallest in [3,1,4,1,5,9,2,6]:', SortingUtils.quickSelect([3, 1, 4, 1, 5, 9, 2, 6], 3));

// Custom sorting
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
];
const sortedByAge = SortingUtils.customSort(people, (a, b) => a.age - b.age);
console.log('People sorted by age:', sortedByAge);

console.log('\n=== Hybrid Sort Demo ===');
console.log('Hybrid Sort result:', hybridSort(testArray));
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <random>
#include <climits>
using namespace std;
using namespace std::chrono;

// Sorting Algorithms Implementation

// 1. Bubble Sort
// Time: O(n²), Space: O(1)
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        
        // If no swapping occurred, array is sorted
        if (!swapped) {
            break;
        }
    }
}

// 2. Selection Sort
// Time: O(n²), Space: O(1)
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        
        // Find minimum element in unsorted portion
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // Swap minimum with first element
        if (minIndex != i) {
            swap(arr[i], arr[minIndex]);
        }
    }
}

// 3. Insertion Sort
// Time: O(n²), Space: O(1)
void insertionSort(vector<int>& arr) {
    int n = arr.size();
    
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        arr[j + 1] = key;
    }
}

// 4. Merge Sort
// Time: O(n log n), Space: O(n)
void merge(vector<int>& arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    // Create temporary arrays
    vector<int> leftArr(n1), rightArr(n2);
    
    // Copy data to temporary arrays
    for (int i = 0; i < n1; i++) {
        leftArr[i] = arr[left + i];
    }
    for (int j = 0; j < n2; j++) {
        rightArr[j] = arr[mid + 1 + j];
    }
    
    // Merge temporary arrays back
    int i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    
    // Copy remaining elements
    while (i < n1) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

// 5. Quick Sort
// Time: O(n log n) average, O(n²) worst, Space: O(log n)
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

// 6. Heap Sort
// Time: O(n log n), Space: O(1)
void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

// 7. Counting Sort
// Time: O(n + k), Space: O(k)
vector<int> countingSort(const vector<int>& arr, int maxVal) {
    vector<int> count(maxVal + 1, 0);
    vector<int> result;
    
    // Count occurrences
    for (int num : arr) {
        count[num]++;
    }
    
    // Build result
    for (int i = 0; i <= maxVal; i++) {
        while (count[i] > 0) {
            result.push_back(i);
            count[i]--;
        }
    }
    
    return result;
}

// 8. Radix Sort
// Time: O(d * (n + k)), Space: O(n + k)
vector<int> countingSortForRadix(vector<int> arr, int exp) {
    int n = arr.size();
    vector<int> output(n);
    vector<int> count(10, 0);
    
    // Count occurrences of each digit
    for (int i = 0; i < n; i++) {
        count[(arr[i] / exp) % 10]++;
    }
    
    // Change count[i] to actual position
    for (int i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (int i = n - 1; i >= 0; i--) {
        output[count[(arr[i] / exp) % 10] - 1] = arr[i];
        count[(arr[i] / exp) % 10]--;
    }
    
    return output;
}

vector<int> radixSort(vector<int> arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        arr = countingSortForRadix(arr, exp);
    }
    
    return arr;
}

// Utility Functions
class SortingUtils {
public:
    // Check if array is sorted
    static bool isSorted(const vector<int>& arr) {
        for (int i = 1; i < arr.size(); i++) {
            if (arr[i] < arr[i - 1]) {
                return false;
            }
        }
        return true;
    }
    
    // Generate random array
    static vector<int> generateRandomArray(int size, int minVal = 0, int maxVal = 100) {
        vector<int> arr(size);
        random_device rd;
        mt19937 gen(rd());
        uniform_int_distribution<> dis(minVal, maxVal);
        
        for (int i = 0; i < size; i++) {
            arr[i] = dis(gen);
        }
        
        return arr;
    }
    
    // Measure performance
    static void measurePerformance(void (*sortFunc)(vector<int>&), vector<int> arr, const string& name) {
        auto start = high_resolution_clock::now();
        sortFunc(arr);
        auto end = high_resolution_clock::now();
        
        auto duration = duration_cast<microseconds>(end - start);
        cout << name << ": " << duration.count() << " microseconds" << endl;
        cout << "Sorted correctly: " << (isSorted(arr) ? "Yes" : "No") << endl;
    }
    
    // QuickSelect for kth smallest element
    static int quickSelect(vector<int> arr, int k) {
        if (k < 1 || k > arr.size()) {
            throw invalid_argument("k is out of bounds");
        }
        
        return quickSelectHelper(arr, 0, arr.size() - 1, k - 1);
    }
    
private:
    static int quickSelectHelper(vector<int>& arr, int low, int high, int k) {
        if (low == high) {
            return arr[low];
        }
        
        int pivotIndex = partition(arr, low, high);
        
        if (k == pivotIndex) {
            return arr[k];
        } else if (k < pivotIndex) {
            return quickSelectHelper(arr, low, pivotIndex - 1, k);
        } else {
            return quickSelectHelper(arr, pivotIndex + 1, high, k);
        }
    }
};

// Print array utility
void printArray(const vector<int>& arr, const string& label = "") {
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
    cout << "=== Sorting Algorithms Demo ===" << endl;
    
    // Test data
    vector<int> testArray = {64, 34, 25, 12, 22, 11, 90, 5, 77, 30};
    printArray(testArray, "Original array");
    
    cout << "\n=== Basic Sorting Algorithms ===" << endl;
    
    vector<int> bubbleArr = testArray;
    bubbleSort(bubbleArr);
    printArray(bubbleArr, "Bubble Sort");
    
    vector<int> selectionArr = testArray;
    selectionSort(selectionArr);
    printArray(selectionArr, "Selection Sort");
    
    vector<int> insertionArr = testArray;
    insertionSort(insertionArr);
    printArray(insertionArr, "Insertion Sort");
    
    cout << "\n=== Advanced Sorting Algorithms ===" << endl;
    
    vector<int> mergeArr = testArray;
    mergeSort(mergeArr, 0, mergeArr.size() - 1);
    printArray(mergeArr, "Merge Sort");
    
    vector<int> quickArr = testArray;
    quickSort(quickArr, 0, quickArr.size() - 1);
    printArray(quickArr, "Quick Sort");
    
    vector<int> heapArr = testArray;
    heapSort(heapArr);
    printArray(heapArr, "Heap Sort");
    
    cout << "\n=== Specialized Sorting Algorithms ===" << endl;
    
    vector<int> integerArray = {4, 2, 2, 8, 3, 3, 1};
    printArray(integerArray, "Original integers");
    
    vector<int> countingSorted = countingSort(integerArray, 8);
    printArray(countingSorted, "Counting Sort");
    
    vector<int> radixSorted = radixSort(integerArray);
    printArray(radixSorted, "Radix Sort");
    
    // Performance comparison
    cout << "\n=== Performance Comparison (1000 elements) ===" << endl;
    vector<int> largeArray = SortingUtils::generateRandomArray(1000);
    
    SortingUtils::measurePerformance(bubbleSort, largeArray, "Bubble Sort");
    SortingUtils::measurePerformance(selectionSort, largeArray, "Selection Sort");
    SortingUtils::measurePerformance(insertionSort, largeArray, "Insertion Sort");
    
    // For merge and quick sort, we need wrapper functions
    auto mergeSortWrapper = [](vector<int>& arr) {
        mergeSort(arr, 0, arr.size() - 1);
    };
    
    auto quickSortWrapper = [](vector<int>& arr) {
        quickSort(arr, 0, arr.size() - 1);
    };
    
    SortingUtils::measurePerformance(mergeSortWrapper, largeArray, "Merge Sort");
    SortingUtils::measurePerformance(quickSortWrapper, largeArray, "Quick Sort");
    SortingUtils::measurePerformance(heapSort, largeArray, "Heap Sort");
    
    // Utility demonstrations
    cout << "\n=== Utility Functions ===" << endl;
    vector<int> sortedTest = {1, 2, 3, 4, 5};
    cout << "Is [1,2,3,4,5] sorted? " << (SortingUtils::isSorted(sortedTest) ? "Yes" : "No") << endl;
    
    vector<int> selectTest = {3, 1, 4, 1, 5, 9, 2, 6};
    cout << "3rd smallest in [3,1,4,1,5,9,2,6]: " << SortingUtils::quickSelect(selectTest, 3) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### When to Use Each Algorithm:

1. **Bubble Sort**:
   - ✅ Educational purposes, very small datasets
   - ❌ Never for production code

2. **Selection Sort**:
   - ✅ When memory writes are expensive
   - ❌ Generally poor performance

3. **Insertion Sort**:
   - ✅ Small arrays (< 50 elements)
   - ✅ Nearly sorted data
   - ✅ Online algorithm (can sort as data arrives)

4. **Merge Sort**:
   - ✅ Stable sorting required
   - ✅ Guaranteed O(n log n) performance
   - ✅ External sorting (large datasets)
   - ❌ Extra memory required

5. **Quick Sort**:
   - ✅ Average case performance
   - ✅ In-place sorting
   - ❌ Worst case O(n²)
   - ❌ Not stable

6. **Heap Sort**:
   - ✅ Guaranteed O(n log n)
   - ✅ In-place sorting
   - ❌ Not stable
   - ❌ Poor cache performance

### Common Pitfalls:

1. **Choosing wrong algorithm**: Using bubble sort for large data
2. **Ignoring stability**: When relative order matters
3. **Memory constraints**: Not considering space complexity
4. **Worst-case scenarios**: Quick sort on already sorted data
5. **Integer overflow**: In partition calculations

---

## 🧩 Practice Problems

### Problem 1: Sort Colors (Dutch Flag)
**Question**: Sort an array containing only 0s, 1s, and 2s.

**Example**: `[2,0,2,1,1,0]` → `[0,0,1,1,2,2]`

**Solution**:
```javascript
function sortColors(nums) {
    let low = 0, mid = 0, high = nums.length - 1;
    
    while (mid <= high) {
        if (nums[mid] === 0) {
            [nums[low], nums[mid]] = [nums[mid], nums[low]];
            low++;
            mid++;
        } else if (nums[mid] === 1) {
            mid++;
        } else {
            [nums[mid], nums[high]] = [nums[high], nums[mid]];
            high--;
        }
    }
}
```

### Problem 2: Merge Sorted Arrays
**Question**: Merge two sorted arrays into one sorted array.

**Hint**: Use two pointers approach.

### Problem 3: Find Kth Largest Element
**Question**: Find the kth largest element in an unsorted array.

**Hint**: Use QuickSelect algorithm.

### Problem 4: Sort Array by Frequency
**Question**: Sort array elements by their frequency of occurrence.

**Hint**: Use hash map to count frequencies, then custom sort.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Algorithm selection**: Can you choose the right sorting algorithm?
2. **Implementation skills**: Can you code the algorithm correctly?
3. **Complexity analysis**: Do you understand time/space trade-offs?
4. **Edge cases**: Empty arrays, single elements, duplicates

### Common Interview Questions:
- "Sort an array of 0s, 1s, and 2s"
- "Merge k sorted arrays"
- "Find the kth largest element"
- "Sort array with custom comparator"
- "Implement merge sort/quick sort"

### Red Flags to Avoid:
- Using bubble sort for large datasets
- Not handling edge cases (empty arrays)
- Incorrect complexity analysis
- Not considering stability when required

### Pro Tips:
1. **Know the classics**: Master merge sort and quick sort
2. **Understand trade-offs**: Time vs space, stable vs unstable
3. **Practice implementation**: Code without looking up
4. **Consider constraints**: Array size, memory limits, stability
5. **Optimize for the problem**: Sometimes counting sort is better

---

## 🚀 Key Takeaways

1. **No universal best algorithm** - Choice depends on constraints
2. **Merge sort for stability** - When relative order matters
3. **Quick sort for average performance** - Good general-purpose choice
4. **Insertion sort for small arrays** - Simple and efficient
5. **Specialized algorithms exist** - Counting/radix for specific data
6. **Practice makes perfect** - Implement algorithms from scratch

**Next Chapter**: We'll explore Searching Algorithms and see how sorted data enables efficient search techniques like binary search.