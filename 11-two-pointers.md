# Chapter 11: Two Pointers - Efficient Array & String Processing

## 🎯 What is the Two Pointers Technique?

**Two Pointers** is an algorithmic pattern that uses two pointers to traverse data structures, typically arrays or strings, to solve problems more efficiently than brute force approaches. Instead of nested loops (O(n²)), we often achieve O(n) time complexity.

### Why Two Pointers Matter:
- **Optimization**: Reduces time complexity from O(n²) to O(n)
- **Space efficiency**: Usually O(1) extra space
- **Versatile**: Works on arrays, strings, linked lists
- **Interview favorite**: Common in coding interviews
- **Real applications**: Data processing, algorithms, system design

### Core Concept:
Use two pointers that move through the data structure according to specific rules to find solutions without examining all possible pairs.

---

## 📊 Two Pointers Patterns

### Pattern Classifications:

| Pattern | Description | Movement | Use Cases |
|---------|-------------|----------|----------|
| **Opposite Direction** | Start from ends, move toward center | `left++`, `right--` | Palindromes, Two Sum (sorted) |
| **Same Direction** | Both start from beginning | `slow++`, `fast++` | Remove duplicates, sliding window |
| **Fast & Slow** | Different speeds | `slow++`, `fast += 2` | Cycle detection, middle element |
| **Sliding Window** | Maintain window size | Expand/contract window | Subarray problems |

### When to Use Two Pointers:
- ✅ **Sorted arrays**: Take advantage of ordering
- ✅ **Palindrome problems**: Check from both ends
- ✅ **Pair/triplet finding**: Avoid nested loops
- ✅ **Subarray problems**: Maintain window efficiently
- ✅ **Linked list problems**: Fast/slow pointer techniques

---

## 💻 JavaScript Implementation

```javascript
// Two Pointers Technique - Comprehensive Implementation

// ===== PATTERN 1: OPPOSITE DIRECTION POINTERS =====

/**
 * Two Sum - Find pair that sums to target (sorted array)
 * Time: O(n), Space: O(1)
 */
function twoSumSorted(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        
        if (sum === target) {
            return [left, right]; // Return indices
        } else if (sum < target) {
            left++; // Need larger sum
        } else {
            right--; // Need smaller sum
        }
    }
    
    return [-1, -1]; // No solution found
}

/**
 * Valid Palindrome - Check if string is palindrome
 * Time: O(n), Space: O(1)
 */
function isPalindrome(s) {
    // Clean string: remove non-alphanumeric, convert to lowercase
    const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
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

/**
 * Three Sum - Find all unique triplets that sum to zero
 * Time: O(n²), Space: O(1) excluding output
 */
function threeSum(nums) {
    const result = [];
    nums.sort((a, b) => a - b); // Sort array first
    
    for (let i = 0; i < nums.length - 2; i++) {
        // Skip duplicates for first element
        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }
        
        let left = i + 1;
        let right = nums.length - 1;
        const target = -nums[i]; // We want nums[i] + nums[left] + nums[right] = 0
        
        while (left < right) {
            const sum = nums[left] + nums[right];
            
            if (sum === target) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // Skip duplicates for second element
                while (left < right && nums[left] === nums[left + 1]) {
                    left++;
                }
                // Skip duplicates for third element
                while (left < right && nums[right] === nums[right - 1]) {
                    right--;
                }
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

/**
 * Container With Most Water - Find maximum area
 * Time: O(n), Space: O(1)
 */
function maxArea(height) {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;
    
    while (left < right) {
        // Calculate current area
        const width = right - left;
        const currentHeight = Math.min(height[left], height[right]);
        const area = width * currentHeight;
        
        maxWater = Math.max(maxWater, area);
        
        // Move pointer with smaller height
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}

/**
 * Reverse Array In-Place
 * Time: O(n), Space: O(1)
 */
function reverseArray(arr) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        // Swap elements
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    
    return arr;
}

// ===== PATTERN 2: SAME DIRECTION POINTERS =====

/**
 * Remove Duplicates from Sorted Array
 * Time: O(n), Space: O(1)
 */
function removeDuplicates(nums) {
    if (nums.length <= 1) return nums.length;
    
    let writeIndex = 1; // Position to write next unique element
    
    for (let readIndex = 1; readIndex < nums.length; readIndex++) {
        if (nums[readIndex] !== nums[readIndex - 1]) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex; // New length
}

/**
 * Remove Element - Remove all instances of val
 * Time: O(n), Space: O(1)
 */
function removeElement(nums, val) {
    let writeIndex = 0;
    
    for (let readIndex = 0; readIndex < nums.length; readIndex++) {
        if (nums[readIndex] !== val) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex;
}

/**
 * Move Zeros - Move all zeros to end
 * Time: O(n), Space: O(1)
 */
function moveZeroes(nums) {
    let writeIndex = 0; // Position for next non-zero element
    
    // Move all non-zero elements to front
    for (let readIndex = 0; readIndex < nums.length; readIndex++) {
        if (nums[readIndex] !== 0) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    // Fill remaining positions with zeros
    while (writeIndex < nums.length) {
        nums[writeIndex] = 0;
        writeIndex++;
    }
    
    return nums;
}

/**
 * Partition Array - Rearrange so elements < x come before elements >= x
 * Time: O(n), Space: O(1)
 */
function partition(nums, x) {
    let writeIndex = 0;
    
    // First pass: move elements < x to front
    for (let readIndex = 0; readIndex < nums.length; readIndex++) {
        if (nums[readIndex] < x) {
            [nums[writeIndex], nums[readIndex]] = [nums[readIndex], nums[writeIndex]];
            writeIndex++;
        }
    }
    
    return nums;
}

// ===== PATTERN 3: FAST & SLOW POINTERS =====

/**
 * Find Middle of Array/Linked List
 * Time: O(n), Space: O(1)
 */
function findMiddle(arr) {
    let slow = 0;
    let fast = 0;
    
    // Fast pointer moves 2 steps, slow moves 1 step
    while (fast < arr.length - 1 && fast < arr.length - 2) {
        slow++;
        fast += 2;
    }
    
    return arr[slow];
}

/**
 * Detect Cycle in Array (using indices as next pointers)
 * Time: O(n), Space: O(1)
 */
function hasCycle(nums) {
    if (nums.length <= 1) return false;
    
    let slow = 0;
    let fast = 0;
    
    // Phase 1: Detect if cycle exists
    do {
        slow = Math.abs(nums[slow]) % nums.length;
        fast = Math.abs(nums[Math.abs(nums[fast]) % nums.length]) % nums.length;
    } while (slow !== fast);
    
    // Phase 2: Find cycle start (if needed)
    slow = 0;
    while (slow !== fast) {
        slow = Math.abs(nums[slow]) % nums.length;
        fast = Math.abs(nums[fast]) % nums.length;
    }
    
    return true; // Cycle detected
}

// ===== PATTERN 4: SLIDING WINDOW WITH TWO POINTERS =====

/**
 * Longest Substring Without Repeating Characters
 * Time: O(n), Space: O(min(m,n)) where m is charset size
 */
function lengthOfLongestSubstring(s) {
    const charSet = new Set();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        // Shrink window until no duplicates
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

/**
 * Minimum Window Substring
 * Time: O(|s| + |t|), Space: O(|s| + |t|)
 */
function minWindow(s, t) {
    if (s.length < t.length) return "";
    
    // Count characters in t
    const targetCount = new Map();
    for (let char of t) {
        targetCount.set(char, (targetCount.get(char) || 0) + 1);
    }
    
    let left = 0;
    let minLength = Infinity;
    let minStart = 0;
    let required = targetCount.size;
    let formed = 0;
    const windowCount = new Map();
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        windowCount.set(char, (windowCount.get(char) || 0) + 1);
        
        if (targetCount.has(char) && windowCount.get(char) === targetCount.get(char)) {
            formed++;
        }
        
        // Try to shrink window
        while (left <= right && formed === required) {
            if (right - left + 1 < minLength) {
                minLength = right - left + 1;
                minStart = left;
            }
            
            const leftChar = s[left];
            windowCount.set(leftChar, windowCount.get(leftChar) - 1);
            
            if (targetCount.has(leftChar) && windowCount.get(leftChar) < targetCount.get(leftChar)) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLength === Infinity ? "" : s.substring(minStart, minStart + minLength);
}

/**
 * Subarray Sum Equals K (for positive numbers)
 * Time: O(n), Space: O(1)
 */
function subarraySum(nums, k) {
    let left = 0;
    let currentSum = 0;
    let count = 0;
    
    for (let right = 0; right < nums.length; right++) {
        currentSum += nums[right];
        
        // Shrink window if sum exceeds k
        while (currentSum > k && left <= right) {
            currentSum -= nums[left];
            left++;
        }
        
        if (currentSum === k) {
            count++;
        }
    }
    
    return count;
}

// ===== ADVANCED TWO POINTERS TECHNIQUES =====

/**
 * Four Sum - Find all unique quadruplets that sum to target
 * Time: O(n³), Space: O(1) excluding output
 */
function fourSum(nums, target) {
    const result = [];
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length - 3; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        for (let j = i + 1; j < nums.length - 2; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            let left = j + 1;
            let right = nums.length - 1;
            
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                
                if (sum === target) {
                    result.push([nums[i], nums[j], nums[left], nums[right]]);
                    
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    
                    left++;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }
    
    return result;
}

/**
 * Trapping Rain Water
 * Time: O(n), Space: O(1)
 */
function trap(height) {
    if (height.length <= 2) return 0;
    
    let left = 0;
    let right = height.length - 1;
    let leftMax = 0;
    let rightMax = 0;
    let water = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    
    return water;
}

/**
 * Sort Colors (Dutch National Flag)
 * Time: O(n), Space: O(1)
 */
function sortColors(nums) {
    let left = 0;    // Boundary for 0s
    let current = 0; // Current element
    let right = nums.length - 1; // Boundary for 2s
    
    while (current <= right) {
        if (nums[current] === 0) {
            [nums[left], nums[current]] = [nums[current], nums[left]];
            left++;
            current++;
        } else if (nums[current] === 2) {
            [nums[current], nums[right]] = [nums[right], nums[current]];
            right--;
            // Don't increment current as we need to check swapped element
        } else {
            current++; // nums[current] === 1
        }
    }
    
    return nums;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Two Pointers Template for Custom Problems
 */
function twoPointersTemplate(arr, condition) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left < right) {
        if (condition(arr[left], arr[right])) {
            // Found solution or move both pointers
            return [left, right];
        } else if (/* need to increase something */) {
            left++;
        } else {
            right--;
        }
    }
    
    return null; // No solution found
}

/**
 * Performance Testing
 */
function performanceTest() {
    console.log('=== Two Pointers Performance Test ===');
    
    // Generate test data
    const sizes = [1000, 10000, 100000];
    
    sizes.forEach(size => {
        const arr = Array.from({length: size}, (_, i) => i);
        const target = size - 1;
        
        console.time(`Two Sum (size: ${size})`);
        twoSumSorted(arr, target);
        console.timeEnd(`Two Sum (size: ${size})`);
        
        console.time(`Remove Duplicates (size: ${size})`);
        removeDuplicates([...arr, ...arr]); // Create duplicates
        console.timeEnd(`Remove Duplicates (size: ${size})`);
    });
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Two Pointers Technique Demo ===');

// Test Opposite Direction Pattern
console.log('\n=== Opposite Direction Pattern ===');
const sortedArray = [2, 7, 11, 15];
console.log('Two Sum:', twoSumSorted(sortedArray, 9)); // [0, 1]
console.log('Is Palindrome "racecar":', isPalindrome('racecar')); // true
console.log('Is Palindrome "race a car":', isPalindrome('race a car')); // false
console.log('Three Sum:', threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]

const heights = [1, 8, 6, 2, 5, 4, 8, 3, 7];
console.log('Max Area:', maxArea(heights)); // 49

const testArray = [1, 2, 3, 4, 5];
console.log('Original:', testArray);
console.log('Reversed:', reverseArray([...testArray])); // [5, 4, 3, 2, 1]

// Test Same Direction Pattern
console.log('\n=== Same Direction Pattern ===');
const duplicatesArray = [1, 1, 2, 2, 3, 4, 4, 5];
console.log('Remove Duplicates:', removeDuplicates([...duplicatesArray])); // 5

const elementArray = [3, 2, 2, 3, 4, 5];
console.log('Remove Element 3:', removeElement([...elementArray], 3)); // 4

const zerosArray = [0, 1, 0, 3, 12];
console.log('Move Zeros:', moveZeroes([...zerosArray])); // [1, 3, 12, 0, 0]

const partitionArray = [3, 1, 4, 1, 5, 9, 2, 6];
console.log('Partition around 5:', partition([...partitionArray], 5)); // [3, 1, 4, 1, 2, 9, 5, 6]

// Test Fast & Slow Pattern
console.log('\n=== Fast & Slow Pattern ===');
const middleArray = [1, 2, 3, 4, 5, 6, 7];
console.log('Find Middle:', findMiddle(middleArray)); // 4

// Test Sliding Window Pattern
console.log('\n=== Sliding Window Pattern ===');
console.log('Longest Substring:', lengthOfLongestSubstring('abcabcbb')); // 3
console.log('Min Window:', minWindow('ADOBECODEBANC', 'ABC')); // 'BANC'

const sumArray = [1, 2, 3, 4, 5];
console.log('Subarray Sum (k=5):', subarraySum(sumArray, 5)); // 2

// Test Advanced Techniques
console.log('\n=== Advanced Techniques ===');
const fourSumArray = [1, 0, -1, 0, -2, 2];
console.log('Four Sum (target=0):', fourSum(fourSumArray, 0));

const rainArray = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
console.log('Trapped Rain Water:', trap(rainArray)); // 6

const colorsArray = [2, 0, 2, 1, 1, 0];
console.log('Sort Colors:', sortColors([...colorsArray])); // [0, 0, 1, 1, 2, 2]

// Performance test
performanceTest();

// Pattern Recognition Examples
console.log('\n=== Pattern Recognition ===');
console.log('When to use each pattern:');
console.log('1. Opposite Direction: Sorted arrays, palindromes, pair finding');
console.log('2. Same Direction: Remove elements, partitioning');
console.log('3. Fast & Slow: Cycle detection, finding middle');
console.log('4. Sliding Window: Substring problems, subarray sums');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <climits>
using namespace std;

// ===== OPPOSITE DIRECTION POINTERS =====

// Two Sum in Sorted Array
vector<int> twoSumSorted(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        
        if (sum == target) {
            return {left, right};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return {-1, -1};
}

// Valid Palindrome
bool isPalindrome(string s) {
    int left = 0, right = s.length() - 1;
    
    while (left < right) {
        // Skip non-alphanumeric characters
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        
        if (tolower(s[left]) != tolower(s[right])) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

// Three Sum
vector<vector<int>> threeSum(vector<int>& nums) {
    vector<vector<int>> result;
    sort(nums.begin(), nums.end());
    
    for (int i = 0; i < nums.size() - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        
        int left = i + 1, right = nums.size() - 1;
        int target = -nums[i];
        
        while (left < right) {
            int sum = nums[left] + nums[right];
            
            if (sum == target) {
                result.push_back({nums[i], nums[left], nums[right]});
                
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// Container With Most Water
int maxArea(vector<int>& height) {
    int left = 0, right = height.size() - 1;
    int maxWater = 0;
    
    while (left < right) {
        int width = right - left;
        int currentHeight = min(height[left], height[right]);
        int area = width * currentHeight;
        
        maxWater = max(maxWater, area);
        
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}

// ===== SAME DIRECTION POINTERS =====

// Remove Duplicates from Sorted Array
int removeDuplicates(vector<int>& nums) {
    if (nums.size() <= 1) return nums.size();
    
    int writeIndex = 1;
    
    for (int readIndex = 1; readIndex < nums.size(); readIndex++) {
        if (nums[readIndex] != nums[readIndex - 1]) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex;
}

// Remove Element
int removeElement(vector<int>& nums, int val) {
    int writeIndex = 0;
    
    for (int readIndex = 0; readIndex < nums.size(); readIndex++) {
        if (nums[readIndex] != val) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex;
}

// Move Zeros
void moveZeroes(vector<int>& nums) {
    int writeIndex = 0;
    
    // Move non-zero elements to front
    for (int readIndex = 0; readIndex < nums.size(); readIndex++) {
        if (nums[readIndex] != 0) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    // Fill remaining with zeros
    while (writeIndex < nums.size()) {
        nums[writeIndex] = 0;
        writeIndex++;
    }
}

// ===== FAST & SLOW POINTERS =====

// Find Middle Element
int findMiddle(vector<int>& arr) {
    int slow = 0, fast = 0;
    
    while (fast < arr.size() - 1 && fast < arr.size() - 2) {
        slow++;
        fast += 2;
    }
    
    return arr[slow];
}

// ===== SLIDING WINDOW =====

// Longest Substring Without Repeating Characters
int lengthOfLongestSubstring(string s) {
    unordered_set<char> charSet;
    int left = 0, maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        while (charSet.count(s[right])) {
            charSet.erase(s[left]);
            left++;
        }
        
        charSet.insert(s[right]);
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Minimum Window Substring
string minWindow(string s, string t) {
    if (s.length() < t.length()) return "";
    
    unordered_map<char, int> targetCount;
    for (char c : t) {
        targetCount[c]++;
    }
    
    int left = 0, minLength = INT_MAX, minStart = 0;
    int required = targetCount.size(), formed = 0;
    unordered_map<char, int> windowCount;
    
    for (int right = 0; right < s.length(); right++) {
        char c = s[right];
        windowCount[c]++;
        
        if (targetCount.count(c) && windowCount[c] == targetCount[c]) {
            formed++;
        }
        
        while (left <= right && formed == required) {
            if (right - left + 1 < minLength) {
                minLength = right - left + 1;
                minStart = left;
            }
            
            char leftChar = s[left];
            windowCount[leftChar]--;
            
            if (targetCount.count(leftChar) && windowCount[leftChar] < targetCount[leftChar]) {
                formed--;
            }
            
            left++;
        }
    }
    
    return minLength == INT_MAX ? "" : s.substr(minStart, minLength);
}

// ===== ADVANCED TECHNIQUES =====

// Trapping Rain Water
int trap(vector<int>& height) {
    if (height.size() <= 2) return 0;
    
    int left = 0, right = height.size() - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    
    return water;
}

// Sort Colors (Dutch National Flag)
void sortColors(vector<int>& nums) {
    int left = 0, current = 0, right = nums.size() - 1;
    
    while (current <= right) {
        if (nums[current] == 0) {
            swap(nums[left], nums[current]);
            left++;
            current++;
        } else if (nums[current] == 2) {
            swap(nums[current], nums[right]);
            right--;
            // Don't increment current
        } else {
            current++;
        }
    }
}

// ===== UTILITY FUNCTIONS =====

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

void printMatrix(const vector<vector<int>>& matrix, const string& label = "") {
    if (!label.empty()) {
        cout << label << ":" << endl;
    }
    for (const auto& row : matrix) {
        cout << "[";
        for (int i = 0; i < row.size(); i++) {
            cout << row[i];
            if (i < row.size() - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
}

// Example Usage
int main() {
    cout << "=== Two Pointers Technique Demo ===" << endl;
    
    // Test Opposite Direction
    cout << "\n=== Opposite Direction Pattern ===" << endl;
    vector<int> sortedArray = {2, 7, 11, 15};
    auto twoSumResult = twoSumSorted(sortedArray, 9);
    printVector(twoSumResult, "Two Sum");
    
    cout << "Is Palindrome 'racecar': " << (isPalindrome("racecar") ? "true" : "false") << endl;
    cout << "Is Palindrome 'race a car': " << (isPalindrome("race a car") ? "true" : "false") << endl;
    
    vector<int> threeSumArray = {-1, 0, 1, 2, -1, -4};
    auto threeSumResult = threeSum(threeSumArray);
    printMatrix(threeSumResult, "Three Sum");
    
    vector<int> heights = {1, 8, 6, 2, 5, 4, 8, 3, 7};
    cout << "Max Area: " << maxArea(heights) << endl;
    
    // Test Same Direction
    cout << "\n=== Same Direction Pattern ===" << endl;
    vector<int> duplicatesArray = {1, 1, 2, 2, 3, 4, 4, 5};
    cout << "Remove Duplicates: " << removeDuplicates(duplicatesArray) << endl;
    
    vector<int> elementArray = {3, 2, 2, 3, 4, 5};
    cout << "Remove Element 3: " << removeElement(elementArray, 3) << endl;
    
    vector<int> zerosArray = {0, 1, 0, 3, 12};
    moveZeroes(zerosArray);
    printVector(zerosArray, "Move Zeros");
    
    // Test Fast & Slow
    cout << "\n=== Fast & Slow Pattern ===" << endl;
    vector<int> middleArray = {1, 2, 3, 4, 5, 6, 7};
    cout << "Find Middle: " << findMiddle(middleArray) << endl;
    
    // Test Sliding Window
    cout << "\n=== Sliding Window Pattern ===" << endl;
    cout << "Longest Substring: " << lengthOfLongestSubstring("abcabcbb") << endl;
    cout << "Min Window: " << minWindow("ADOBECODEBANC", "ABC") << endl;
    
    // Test Advanced
    cout << "\n=== Advanced Techniques ===" << endl;
    vector<int> rainArray = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
    cout << "Trapped Rain Water: " << trap(rainArray) << endl;
    
    vector<int> colorsArray = {2, 0, 2, 1, 1, 0};
    sortColors(colorsArray);
    printVector(colorsArray, "Sort Colors");
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Improvements:

| Problem | Brute Force | Two Pointers | Improvement |
|---------|-------------|--------------|-------------|
| **Two Sum (sorted)** | O(n²) | O(n) | n times faster |
| **Three Sum** | O(n³) | O(n²) | n times faster |
| **Palindrome Check** | O(n) | O(n) | Same, but O(1) space |
| **Remove Duplicates** | O(n²) | O(n) | n times faster |
| **Container Water** | O(n²) | O(n) | n times faster |

### Space Complexity:
- Most two-pointer solutions use **O(1) extra space**
- Sliding window may use **O(k)** where k is window size
- Much better than hash-based solutions that use **O(n) space**

### When Two Pointers Wins:
- ✅ **Sorted arrays**: Take advantage of ordering
- ✅ **Pair/triplet problems**: Avoid nested loops
- ✅ **In-place operations**: Minimize space usage
- ✅ **Optimization problems**: Find optimal solutions efficiently

---

## 🧩 Practice Problems

### Problem 1: Squares of Sorted Array
**Question**: Given sorted array, return squares in sorted order.
**Example**: `[-4,-1,0,3,10]` → `[0,1,9,16,100]`
**Hint**: Use two pointers from ends, compare absolute values.

### Problem 2: Intersection of Two Arrays
**Question**: Find intersection of two sorted arrays.
**Example**: `[1,2,2,1]`, `[2,2]` → `[2]`
**Hint**: Use two pointers, advance smaller element.

### Problem 3: Merge Sorted Array
**Question**: Merge two sorted arrays in-place.
**Example**: `[1,2,3,0,0,0]`, `[2,5,6]` → `[1,2,2,3,5,6]`
**Hint**: Start from the end to avoid overwriting.

### Problem 4: Backspace String Compare
**Question**: Compare strings with backspaces (`#`).
**Example**: `"ab#c"`, `"ad#c"` → `true`
**Hint**: Process from end using two pointers.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Pattern recognition**: Can you identify when to use two pointers?
2. **Pointer movement logic**: Do you move pointers correctly?
3. **Edge case handling**: Empty arrays, single elements, no solution
4. **Optimization thinking**: Can you improve from brute force?

### Common Interview Patterns:
- **Sorted array problems**: Almost always consider two pointers
- **Palindrome problems**: Start from ends
- **Sum problems**: Use sorting + two pointers
- **Sliding window**: Expand/contract window with two pointers
- **In-place operations**: Use read/write pointers

### Red Flags to Avoid:
- Moving pointers incorrectly (infinite loops)
- Not handling duplicates properly
- Forgetting edge cases (empty input, single element)
- Using extra space when O(1) is possible

### Pro Tips:
1. **Draw it out**: Visualize pointer movements
2. **Start simple**: Get basic case working first
3. **Handle duplicates**: Often requires special logic
4. **Check boundaries**: Ensure pointers don't go out of bounds
5. **Consider sorting**: Sometimes preprocessing helps
6. **Think about invariants**: What should be true at each step?

---

## 🚀 Key Takeaways

1. **Two pointers optimize nested loops** - Reduce O(n²) to O(n)
2. **Four main patterns** - Opposite, same direction, fast/slow, sliding window
3. **Sorted arrays are key** - Ordering enables efficient pointer movement
4. **Space efficient** - Usually O(1) extra space
5. **Interview favorite** - Master the patterns for coding interviews
6. **Think before coding** - Identify the pattern first

**Next Chapter**: We'll explore Sliding Window technique in detail and see how it optimizes subarray and substring problems.