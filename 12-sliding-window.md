# Chapter 12: Sliding Window - Optimizing Subarray & Substring Problems

## 🎯 What is the Sliding Window Technique?

**Sliding Window** is an algorithmic pattern that maintains a "window" (subarray/substring) that slides through the data structure to solve problems efficiently. Instead of checking all possible subarrays (O(n²) or O(n³)), we maintain a window and adjust its size dynamically to achieve O(n) time complexity.

### Why Sliding Window Matters:
- **Optimization**: Reduces time complexity from O(n²/n³) to O(n)
- **Space efficiency**: Usually O(1) or O(k) extra space
- **Versatile**: Works on arrays, strings, linked lists
- **Real applications**: Data streaming, network protocols, analytics
- **Interview favorite**: Common pattern in coding interviews

### Core Concept:
Maintain a window with two pointers (left and right) and expand/contract the window based on problem constraints while tracking the optimal solution.

---

## 📊 Sliding Window Patterns

### Pattern Classifications:

| Pattern | Window Size | Expansion/Contraction | Use Cases |
|---------|-------------|----------------------|----------|
| **Fixed Size** | Constant | Slide by 1 position | Max sum of k elements |
| **Variable Size** | Dynamic | Expand/contract based on condition | Longest substring |
| **Shrinkable** | Grows then shrinks | Expand until invalid, then shrink | Min window substring |
| **Non-shrinkable** | Only grows | Expand and slide | Longest valid window |

### When to Use Sliding Window:
- ✅ **Contiguous subarray/substring problems**
- ✅ **Optimization problems** (min/max/longest/shortest)
- ✅ **Problems with constraints** (sum, distinct characters, etc.)
- ✅ **Streaming data** where you process elements sequentially

---

## 💻 JavaScript Implementation

```javascript
// Sliding Window Technique - Comprehensive Implementation

// ===== PATTERN 1: FIXED SIZE SLIDING WINDOW =====

/**
 * Maximum Sum of Subarray of Size K
 * Time: O(n), Space: O(1)
 */
function maxSumSubarray(arr, k) {
    if (arr.length < k) return -1;
    
    // Calculate sum of first window
    let windowSum = 0;
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    
    let maxSum = windowSum;
    
    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = Math.max(maxSum, windowSum);
    }
    
    return maxSum;
}

/**
 * Average of All Subarrays of Size K
 * Time: O(n), Space: O(n-k+1)
 */
function findAverages(arr, k) {
    if (arr.length < k) return [];
    
    const result = [];
    let windowSum = 0;
    
    // Calculate sum of first window
    for (let i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    result.push(windowSum / k);
    
    // Slide the window
    for (let i = k; i < arr.length; i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        result.push(windowSum / k);
    }
    
    return result;
}

/**
 * Maximum of All Subarrays of Size K
 * Time: O(n), Space: O(k) using deque
 */
function maxSlidingWindow(nums, k) {
    const result = [];
    const deque = []; // Store indices
    
    for (let i = 0; i < nums.length; i++) {
        // Remove indices outside current window
        while (deque.length > 0 && deque[0] <= i - k) {
            deque.shift();
        }
        
        // Remove indices of smaller elements
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop();
        }
        
        deque.push(i);
        
        // Add to result if window is complete
        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    
    return result;
}

/**
 * First Negative Number in Every Window of Size K
 * Time: O(n), Space: O(k)
 */
function firstNegativeInWindow(arr, k) {
    const result = [];
    const negatives = []; // Queue of negative number indices
    
    for (let i = 0; i < arr.length; i++) {
        // Remove indices outside current window
        while (negatives.length > 0 && negatives[0] <= i - k) {
            negatives.shift();
        }
        
        // Add current negative number
        if (arr[i] < 0) {
            negatives.push(i);
        }
        
        // Add result for current window
        if (i >= k - 1) {
            result.push(negatives.length > 0 ? arr[negatives[0]] : 0);
        }
    }
    
    return result;
}

// ===== PATTERN 2: VARIABLE SIZE SLIDING WINDOW =====

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
 * Longest Substring with At Most K Distinct Characters
 * Time: O(n), Space: O(k)
 */
function lengthOfLongestSubstringKDistinct(s, k) {
    if (k === 0) return 0;
    
    const charCount = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        // Add character to window
        charCount.set(s[right], (charCount.get(s[right]) || 0) + 1);
        
        // Shrink window if more than k distinct characters
        while (charCount.size > k) {
            const leftChar = s[left];
            charCount.set(leftChar, charCount.get(leftChar) - 1);
            if (charCount.get(leftChar) === 0) {
                charCount.delete(leftChar);
            }
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

/**
 * Longest Substring with At Most 2 Distinct Characters
 * Time: O(n), Space: O(1)
 */
function lengthOfLongestSubstringTwoDistinct(s) {
    return lengthOfLongestSubstringKDistinct(s, 2);
}

/**
 * Longest Repeating Character Replacement
 * Time: O(n), Space: O(1) - at most 26 characters
 */
function characterReplacement(s, k) {
    const charCount = new Map();
    let left = 0;
    let maxLength = 0;
    let maxCount = 0; // Count of most frequent character in current window
    
    for (let right = 0; right < s.length; right++) {
        charCount.set(s[right], (charCount.get(s[right]) || 0) + 1);
        maxCount = Math.max(maxCount, charCount.get(s[right]));
        
        // If window size - maxCount > k, shrink window
        if (right - left + 1 - maxCount > k) {
            charCount.set(s[left], charCount.get(s[left]) - 1);
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

/**
 * Subarray with Given Sum (Positive Numbers)
 * Time: O(n), Space: O(1)
 */
function subarraySum(arr, targetSum) {
    let left = 0;
    let currentSum = 0;
    
    for (let right = 0; right < arr.length; right++) {
        currentSum += arr[right];
        
        // Shrink window if sum exceeds target
        while (currentSum > targetSum && left <= right) {
            currentSum -= arr[left];
            left++;
        }
        
        if (currentSum === targetSum) {
            return [left, right]; // Return indices
        }
    }
    
    return [-1, -1]; // No subarray found
}

/**
 * Smallest Subarray with Sum Greater Than X
 * Time: O(n), Space: O(1)
 */
function smallestSubarrayWithSum(arr, x) {
    let left = 0;
    let currentSum = 0;
    let minLength = Infinity;
    
    for (let right = 0; right < arr.length; right++) {
        currentSum += arr[right];
        
        // Shrink window while sum > x
        while (currentSum > x && left <= right) {
            minLength = Math.min(minLength, right - left + 1);
            currentSum -= arr[left];
            left++;
        }
    }
    
    return minLength === Infinity ? 0 : minLength;
}

// ===== PATTERN 3: SHRINKABLE SLIDING WINDOW =====

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
 * Find All Anagrams in a String
 * Time: O(|s| + |p|), Space: O(1) - at most 26 characters
 */
function findAnagrams(s, p) {
    if (s.length < p.length) return [];
    
    const result = [];
    const pCount = new Map();
    const windowCount = new Map();
    
    // Count characters in p
    for (let char of p) {
        pCount.set(char, (pCount.get(char) || 0) + 1);
    }
    
    let left = 0;
    let right = 0;
    
    while (right < s.length) {
        // Expand window
        const rightChar = s[right];
        windowCount.set(rightChar, (windowCount.get(rightChar) || 0) + 1);
        
        // Shrink window if size exceeds p.length
        if (right - left + 1 > p.length) {
            const leftChar = s[left];
            windowCount.set(leftChar, windowCount.get(leftChar) - 1);
            if (windowCount.get(leftChar) === 0) {
                windowCount.delete(leftChar);
            }
            left++;
        }
        
        // Check if current window is anagram
        if (right - left + 1 === p.length && mapsEqual(windowCount, pCount)) {
            result.push(left);
        }
        
        right++;
    }
    
    return result;
}

// Helper function to compare maps
function mapsEqual(map1, map2) {
    if (map1.size !== map2.size) return false;
    
    for (let [key, value] of map1) {
        if (map2.get(key) !== value) return false;
    }
    
    return true;
}

/**
 * Permutation in String
 * Time: O(|s1| + |s2|), Space: O(1)
 */
function checkInclusion(s1, s2) {
    if (s1.length > s2.length) return false;
    
    const s1Count = new Map();
    const windowCount = new Map();
    
    // Count characters in s1
    for (let char of s1) {
        s1Count.set(char, (s1Count.get(char) || 0) + 1);
    }
    
    let left = 0;
    
    for (let right = 0; right < s2.length; right++) {
        // Expand window
        const rightChar = s2[right];
        windowCount.set(rightChar, (windowCount.get(rightChar) || 0) + 1);
        
        // Shrink window if size exceeds s1.length
        if (right - left + 1 > s1.length) {
            const leftChar = s2[left];
            windowCount.set(leftChar, windowCount.get(leftChar) - 1);
            if (windowCount.get(leftChar) === 0) {
                windowCount.delete(leftChar);
            }
            left++;
        }
        
        // Check if current window is permutation
        if (right - left + 1 === s1.length && mapsEqual(windowCount, s1Count)) {
            return true;
        }
    }
    
    return false;
}

// ===== PATTERN 4: NON-SHRINKABLE SLIDING WINDOW =====

/**
 * Longest Subarray with Ones after Replacement
 * Time: O(n), Space: O(1)
 */
function longestOnes(nums, k) {
    let left = 0;
    let maxLength = 0;
    let zeroCount = 0;
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) {
            zeroCount++;
        }
        
        // Shrink window if zero count exceeds k
        while (zeroCount > k) {
            if (nums[left] === 0) {
                zeroCount--;
            }
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

/**
 * Fruits into Baskets (At Most 2 Types)
 * Time: O(n), Space: O(1)
 */
function totalFruit(fruits) {
    const fruitCount = new Map();
    let left = 0;
    let maxFruits = 0;
    
    for (let right = 0; right < fruits.length; right++) {
        fruitCount.set(fruits[right], (fruitCount.get(fruits[right]) || 0) + 1);
        
        // Shrink window if more than 2 types
        while (fruitCount.size > 2) {
            const leftFruit = fruits[left];
            fruitCount.set(leftFruit, fruitCount.get(leftFruit) - 1);
            if (fruitCount.get(leftFruit) === 0) {
                fruitCount.delete(leftFruit);
            }
            left++;
        }
        
        maxFruits = Math.max(maxFruits, right - left + 1);
    }
    
    return maxFruits;
}

// ===== ADVANCED SLIDING WINDOW TECHNIQUES =====

/**
 * Sliding Window Maximum with Custom Comparator
 * Time: O(n log k), Space: O(k)
 */
function slidingWindowMaximumCustom(nums, k, compareFn) {
    const result = [];
    const window = [];
    
    for (let i = 0; i < nums.length; i++) {
        // Remove elements outside window
        while (window.length > 0 && window[0].index <= i - k) {
            window.shift();
        }
        
        // Maintain decreasing order
        while (window.length > 0 && compareFn(nums[i], window[window.length - 1].value) >= 0) {
            window.pop();
        }
        
        window.push({ value: nums[i], index: i });
        
        if (i >= k - 1) {
            result.push(window[0].value);
        }
    }
    
    return result;
}

/**
 * Count Number of Nice Subarrays
 * Time: O(n), Space: O(1)
 */
function numberOfSubarrays(nums, k) {
    return atMostK(nums, k) - atMostK(nums, k - 1);
    
    function atMostK(nums, k) {
        let left = 0;
        let count = 0;
        let oddCount = 0;
        
        for (let right = 0; right < nums.length; right++) {
            if (nums[right] % 2 === 1) {
                oddCount++;
            }
            
            while (oddCount > k) {
                if (nums[left] % 2 === 1) {
                    oddCount--;
                }
                left++;
            }
            
            count += right - left + 1;
        }
        
        return count;
    }
}

/**
 * Sliding Window Median
 * Time: O(n log k), Space: O(k)
 */
function medianSlidingWindow(nums, k) {
    const result = [];
    const window = [];
    
    for (let i = 0; i < nums.length; i++) {
        // Add current element
        insertSorted(window, nums[i]);
        
        // Remove element outside window
        if (window.length > k) {
            const toRemove = nums[i - k];
            const index = window.indexOf(toRemove);
            window.splice(index, 1);
        }
        
        // Calculate median
        if (window.length === k) {
            const median = k % 2 === 1 ? 
                window[Math.floor(k / 2)] : 
                (window[k / 2 - 1] + window[k / 2]) / 2;
            result.push(median);
        }
    }
    
    return result;
}

function insertSorted(arr, val) {
    let left = 0;
    let right = arr.length;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] < val) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    arr.splice(left, 0, val);
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generic Sliding Window Template
 */
function slidingWindowTemplate(arr, k, operation) {
    const result = [];
    let windowState = null;
    
    for (let i = 0; i < arr.length; i++) {
        // Add element to window
        windowState = operation.add(windowState, arr[i], i);
        
        // Remove element if window too large
        if (i >= k) {
            windowState = operation.remove(windowState, arr[i - k], i - k);
        }
        
        // Process window if complete
        if (i >= k - 1) {
            result.push(operation.getResult(windowState));
        }
    }
    
    return result;
}

/**
 * Performance Testing
 */
function performanceTest() {
    console.log('=== Sliding Window Performance Test ===');
    
    const sizes = [1000, 10000, 100000];
    
    sizes.forEach(size => {
        const arr = Array.from({length: size}, (_, i) => Math.floor(Math.random() * 100));
        const k = Math.min(100, size);
        
        console.time(`Max Sum Subarray (size: ${size})`);
        maxSumSubarray(arr, k);
        console.timeEnd(`Max Sum Subarray (size: ${size})`);
        
        const str = Array.from({length: size}, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
        
        console.time(`Longest Substring (size: ${size})`);
        lengthOfLongestSubstring(str);
        console.timeEnd(`Longest Substring (size: ${size})`);
    });
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Sliding Window Technique Demo ===');

// Test Fixed Size Window
console.log('\n=== Fixed Size Window ===');
const arr1 = [2, 1, 5, 1, 3, 2];
console.log('Max Sum (k=3):', maxSumSubarray(arr1, 3)); // 9
console.log('Averages (k=3):', findAverages(arr1, 3)); // [2.67, 2.33, 3, 2]

const arr2 = [1, 3, -1, -3, 5, 3, 6, 7];
console.log('Max Sliding Window (k=3):', maxSlidingWindow(arr2, 3)); // [3, 3, 5, 5, 6, 7]

const arr3 = [12, -1, -7, 8, -15, 30, 16, 28];
console.log('First Negative (k=3):', firstNegativeInWindow(arr3, 3)); // [-1, -1, -7, -15, -15, 0]

// Test Variable Size Window
console.log('\n=== Variable Size Window ===');
console.log('Longest Substring:', lengthOfLongestSubstring('abcabcbb')); // 3
console.log('Longest K Distinct:', lengthOfLongestSubstringKDistinct('araaci', 2)); // 4
console.log('Longest 2 Distinct:', lengthOfLongestSubstringTwoDistinct('eceba')); // 3
console.log('Character Replacement:', characterReplacement('AABABBA', 1)); // 4

const arr4 = [1, 4, 4];
console.log('Subarray Sum (target=9):', subarraySum(arr4, 9)); // [0, 2]

const arr5 = [1, 4, 4];
console.log('Smallest Subarray (x=6):', smallestSubarrayWithSum(arr5, 6)); // 2

// Test Shrinkable Window
console.log('\n=== Shrinkable Window ===');
console.log('Min Window:', minWindow('ADOBECODEBANC', 'ABC')); // 'BANC'
console.log('Find Anagrams:', findAnagrams('abab', 'ab')); // [0, 2]
console.log('Check Inclusion:', checkInclusion('ab', 'eidbaooo')); // true

// Test Non-shrinkable Window
console.log('\n=== Non-shrinkable Window ===');
const arr6 = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0];
console.log('Longest Ones (k=2):', longestOnes(arr6, 2)); // 6

const fruits = [1, 2, 1];
console.log('Total Fruit:', totalFruit(fruits)); // 3

// Test Advanced Techniques
console.log('\n=== Advanced Techniques ===');
const arr7 = [1, 1, 2, 1, 1];
console.log('Nice Subarrays (k=3):', numberOfSubarrays(arr7, 3)); // 2

const arr8 = [1, 3, -1, -3, 5, 3, 6, 7];
console.log('Sliding Window Median (k=3):', medianSlidingWindow(arr8, 3)); // [1, -1, -1, 3, 5, 6]

// Custom comparator example
const customMax = slidingWindowMaximumCustom(arr2, 3, (a, b) => a - b);
console.log('Custom Max:', customMax);

// Performance test
performanceTest();

// Pattern Recognition
console.log('\n=== Pattern Recognition ===');
console.log('Choose the right pattern:');
console.log('1. Fixed Size: When window size is constant');
console.log('2. Variable Size: When optimizing window size');
console.log('3. Shrinkable: When finding minimum valid window');
console.log('4. Non-shrinkable: When finding maximum valid window');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <deque>
#include <algorithm>
#include <climits>
using namespace std;

// ===== FIXED SIZE SLIDING WINDOW =====

// Maximum Sum of Subarray of Size K
int maxSumSubarray(vector<int>& arr, int k) {
    if (arr.size() < k) return -1;
    
    int windowSum = 0;
    for (int i = 0; i < k; i++) {
        windowSum += arr[i];
    }
    
    int maxSum = windowSum;
    
    for (int i = k; i < arr.size(); i++) {
        windowSum = windowSum - arr[i - k] + arr[i];
        maxSum = max(maxSum, windowSum);
    }
    
    return maxSum;
}

// Maximum Sliding Window
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    vector<int> result;
    deque<int> dq; // Store indices
    
    for (int i = 0; i < nums.size(); i++) {
        // Remove indices outside current window
        while (!dq.empty() && dq.front() <= i - k) {
            dq.pop_front();
        }
        
        // Remove indices of smaller elements
        while (!dq.empty() && nums[dq.back()] <= nums[i]) {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        if (i >= k - 1) {
            result.push_back(nums[dq.front()]);
        }
    }
    
    return result;
}

// ===== VARIABLE SIZE SLIDING WINDOW =====

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

// Longest Substring with At Most K Distinct Characters
int lengthOfLongestSubstringKDistinct(string s, int k) {
    if (k == 0) return 0;
    
    unordered_map<char, int> charCount;
    int left = 0, maxLength = 0;
    
    for (int right = 0; right < s.length(); right++) {
        charCount[s[right]]++;
        
        while (charCount.size() > k) {
            charCount[s[left]]--;
            if (charCount[s[left]] == 0) {
                charCount.erase(s[left]);
            }
            left++;
        }
        
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Longest Repeating Character Replacement
int characterReplacement(string s, int k) {
    unordered_map<char, int> charCount;
    int left = 0, maxLength = 0, maxCount = 0;
    
    for (int right = 0; right < s.length(); right++) {
        charCount[s[right]]++;
        maxCount = max(maxCount, charCount[s[right]]);
        
        if (right - left + 1 - maxCount > k) {
            charCount[s[left]]--;
            left++;
        }
        
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Subarray with Given Sum
vector<int> subarraySum(vector<int>& arr, int targetSum) {
    int left = 0, currentSum = 0;
    
    for (int right = 0; right < arr.size(); right++) {
        currentSum += arr[right];
        
        while (currentSum > targetSum && left <= right) {
            currentSum -= arr[left];
            left++;
        }
        
        if (currentSum == targetSum) {
            return {left, right};
        }
    }
    
    return {-1, -1};
}

// ===== SHRINKABLE SLIDING WINDOW =====

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

// Find All Anagrams in a String
vector<int> findAnagrams(string s, string p) {
    if (s.length() < p.length()) return {};
    
    vector<int> result;
    unordered_map<char, int> pCount, windowCount;
    
    for (char c : p) {
        pCount[c]++;
    }
    
    int left = 0;
    
    for (int right = 0; right < s.length(); right++) {
        windowCount[s[right]]++;
        
        if (right - left + 1 > p.length()) {
            windowCount[s[left]]--;
            if (windowCount[s[left]] == 0) {
                windowCount.erase(s[left]);
            }
            left++;
        }
        
        if (right - left + 1 == p.length() && windowCount == pCount) {
            result.push_back(left);
        }
    }
    
    return result;
}

// ===== NON-SHRINKABLE SLIDING WINDOW =====

// Longest Subarray with Ones after Replacement
int longestOnes(vector<int>& nums, int k) {
    int left = 0, maxLength = 0, zeroCount = 0;
    
    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] == 0) {
            zeroCount++;
        }
        
        while (zeroCount > k) {
            if (nums[left] == 0) {
                zeroCount--;
            }
            left++;
        }
        
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Fruits into Baskets
int totalFruit(vector<int>& fruits) {
    unordered_map<int, int> fruitCount;
    int left = 0, maxFruits = 0;
    
    for (int right = 0; right < fruits.size(); right++) {
        fruitCount[fruits[right]]++;
        
        while (fruitCount.size() > 2) {
            fruitCount[fruits[left]]--;
            if (fruitCount[fruits[left]] == 0) {
                fruitCount.erase(fruits[left]);
            }
            left++;
        }
        
        maxFruits = max(maxFruits, right - left + 1);
    }
    
    return maxFruits;
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

// Example Usage
int main() {
    cout << "=== Sliding Window Technique Demo ===" << endl;
    
    // Test Fixed Size Window
    cout << "\n=== Fixed Size Window ===" << endl;
    vector<int> arr1 = {2, 1, 5, 1, 3, 2};
    cout << "Max Sum (k=3): " << maxSumSubarray(arr1, 3) << endl;
    
    vector<int> arr2 = {1, 3, -1, -3, 5, 3, 6, 7};
    auto maxWindow = maxSlidingWindow(arr2, 3);
    printVector(maxWindow, "Max Sliding Window (k=3)");
    
    // Test Variable Size Window
    cout << "\n=== Variable Size Window ===" << endl;
    cout << "Longest Substring: " << lengthOfLongestSubstring("abcabcbb") << endl;
    cout << "Longest K Distinct: " << lengthOfLongestSubstringKDistinct("araaci", 2) << endl;
    cout << "Character Replacement: " << characterReplacement("AABABBA", 1) << endl;
    
    vector<int> arr4 = {1, 4, 4};
    auto subarrayResult = subarraySum(arr4, 9);
    printVector(subarrayResult, "Subarray Sum (target=9)");
    
    // Test Shrinkable Window
    cout << "\n=== Shrinkable Window ===" << endl;
    cout << "Min Window: " << minWindow("ADOBECODEBANC", "ABC") << endl;
    
    auto anagrams = findAnagrams("abab", "ab");
    printVector(anagrams, "Find Anagrams");
    
    // Test Non-shrinkable Window
    cout << "\n=== Non-shrinkable Window ===" << endl;
    vector<int> arr6 = {1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0};
    cout << "Longest Ones (k=2): " << longestOnes(arr6, 2) << endl;
    
    vector<int> fruits = {1, 2, 1};
    cout << "Total Fruit: " << totalFruit(fruits) << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Improvements:

| Problem Type | Brute Force | Sliding Window | Improvement |
|--------------|-------------|----------------|-------------|
| **Fixed Size Problems** | O(n×k) | O(n) | k times faster |
| **Variable Size Problems** | O(n²) or O(n³) | O(n) | n times faster |
| **Substring Problems** | O(n²×m) | O(n+m) | Exponential improvement |
| **Subarray Sum** | O(n²) | O(n) | n times faster |

### Space Complexity:
- **Fixed Size**: O(1) or O(k)
- **Variable Size**: O(k) where k is window size
- **Character Problems**: O(1) for ASCII (at most 256 characters)
- **Much better than generating all subarrays**: O(n²) space

### When Sliding Window Excels:
- ✅ **Contiguous elements**: Problems involving subarrays/substrings
- ✅ **Optimization**: Finding min/max/longest/shortest
- ✅ **Constraints**: Problems with specific conditions
- ✅ **Streaming data**: Processing data sequentially

---

## 🧩 Practice Problems

### Problem 1: Minimum Size Subarray Sum
**Question**: Find minimum length subarray with sum ≥ target.
**Example**: `[2,3,1,2,4,3]`, target=7 → 2 (subarray `[4,3]`)
**Hint**: Use variable size window, expand until sum ≥ target, then shrink.

### Problem 2: Longest Substring with At Most K Distinct Characters
**Question**: Find longest substring with at most k distinct characters.
**Example**: `"eceba"`, k=2 → 3 (`"ece"`)
**Hint**: Use hash map to count characters, shrink when count > k.

### Problem 3: Sliding Window Maximum
**Question**: Find maximum in each window of size k.
**Example**: `[1,3,-1,-3,5,3,6,7]`, k=3 → `[3,3,5,5,6,7]`
**Hint**: Use deque to maintain decreasing order of elements.

### Problem 4: Count Subarrays with K Odd Numbers
**Question**: Count subarrays with exactly k odd numbers.
**Example**: `[1,1,2,1,1]`, k=3 → 2
**Hint**: Use "at most k" - "at most k-1" technique.

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Pattern recognition**: Can you identify sliding window problems?
2. **Window management**: Do you expand/contract correctly?
3. **Edge case handling**: Empty input, window larger than array
4. **Optimization**: Can you achieve O(n) time complexity?

### Common Interview Patterns:
- **Fixed size**: "Find max/min in every window of size k"
- **Variable size**: "Find longest/shortest subarray with condition"
- **Character counting**: "Find substring with specific character constraints"
- **Two pointers**: "Maintain window with left and right pointers"

### Red Flags to Avoid:
- Using nested loops for subarray problems
- Not maintaining window invariants correctly
- Forgetting to handle edge cases
- Inefficient window expansion/contraction

### Pro Tips:
1. **Identify the pattern**: Look for "subarray", "substring", "window", "contiguous"
2. **Choose right variant**: Fixed vs variable size
3. **Maintain invariants**: What should be true about the window?
4. **Handle edge cases**: Empty input, k > array size
5. **Optimize data structures**: Use appropriate containers for tracking
6. **Practice templates**: Master the basic patterns

---

## 🚀 Key Takeaways

1. **Sliding window optimizes subarray problems** - From O(n²) to O(n)
2. **Four main patterns** - Fixed, variable, shrinkable, non-shrinkable
3. **Two pointers manage window** - Left and right boundaries
4. **Maintain window invariants** - What conditions must the window satisfy?
5. **Choose right data structures** - Hash maps, sets, deques as needed
6. **Master the templates** - Practice until pattern recognition is automatic

**Next Chapter**: We'll explore Basic Dynamic Programming and see how to solve optimization problems by breaking them into subproblems.