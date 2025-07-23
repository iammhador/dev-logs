# Chapter 13: Basic Dynamic Programming - Optimizing Through Subproblems

## 🎯 What is Dynamic Programming?

**Dynamic Programming (DP)** is an algorithmic technique that solves complex problems by breaking them down into simpler subproblems and storing the results to avoid redundant calculations. It's particularly effective for optimization problems where we need to find the best solution among many possibilities.

### Why Dynamic Programming Matters:
- **Optimization**: Reduces exponential time complexity to polynomial
- **Efficiency**: Avoids redundant calculations through memoization
- **Versatile**: Solves many types of optimization problems
- **Real applications**: Resource allocation, scheduling, game theory
- **Interview favorite**: Essential for technical interviews

### Core Principles:
1. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems**: Same subproblems are solved multiple times
3. **Memoization**: Store results to avoid recomputation

---

## 📊 Dynamic Programming Approaches

### Approach Classifications:

| Approach | Description | Implementation | Use Cases |
|----------|-------------|----------------|----------|
| **Top-Down (Memoization)** | Recursive with caching | Recursion + memo table | Natural recursive problems |
| **Bottom-Up (Tabulation)** | Iterative table filling | Loops + DP table | When iteration is clearer |
| **Space Optimized** | Reduce space complexity | Rolling arrays | When only recent states needed |

### When to Use Dynamic Programming:
- ✅ **Optimization problems**: Find min/max/count/best solution
- ✅ **Overlapping subproblems**: Same calculations repeated
- ✅ **Optimal substructure**: Optimal solution built from optimal subsolutions
- ✅ **Decision problems**: Make choices that affect future options

---

## 💻 JavaScript Implementation

```javascript
// Dynamic Programming - Comprehensive Implementation

// ===== CLASSIC DP PROBLEMS =====

/**
 * Fibonacci Sequence - Classic DP Introduction
 * Problem: Find nth Fibonacci number
 * Recurrence: F(n) = F(n-1) + F(n-2)
 */

// Naive Recursive (Exponential Time)
function fibonacciNaive(n) {
    if (n <= 1) return n;
    return fibonacciNaive(n - 1) + fibonacciNaive(n - 2);
}

// Top-Down DP (Memoization)
function fibonacciMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    return memo[n];
}

// Bottom-Up DP (Tabulation)
function fibonacciDP(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Space Optimized DP
function fibonacciOptimized(n) {
    if (n <= 1) return n;
    
    let prev2 = 0;
    let prev1 = 1;
    
    for (let i = 2; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

/**
 * Climbing Stairs
 * Problem: Count ways to climb n stairs (1 or 2 steps at a time)
 * Recurrence: ways(n) = ways(n-1) + ways(n-2)
 */
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev2 = 1; // ways(1)
    let prev1 = 2; // ways(2)
    
    for (let i = 3; i <= n; i++) {
        const current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

/**
 * House Robber
 * Problem: Rob houses to maximize money without robbing adjacent houses
 * Recurrence: rob(i) = max(rob(i-1), rob(i-2) + nums[i])
 */
function rob(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    
    let prev2 = 0;           // rob(i-2)
    let prev1 = nums[0];     // rob(i-1)
    
    for (let i = 1; i < nums.length; i++) {
        const current = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

/**
 * Coin Change
 * Problem: Find minimum coins needed to make amount
 * Recurrence: dp[amount] = min(dp[amount - coin] + 1) for all coins
 */
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    
    for (let i = 1; i <= amount; i++) {
        for (let coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] === Infinity ? -1 : dp[amount];
}

/**
 * Coin Change II - Count Ways
 * Problem: Count number of ways to make amount
 * Recurrence: dp[amount] = sum(dp[amount - coin]) for all coins
 */
function change(amount, coins) {
    const dp = new Array(amount + 1).fill(0);
    dp[0] = 1;
    
    // Process coins one by one to avoid counting permutations
    for (let coin of coins) {
        for (let i = coin; i <= amount; i++) {
            dp[i] += dp[i - coin];
        }
    }
    
    return dp[amount];
}

/**
 * Longest Increasing Subsequence (LIS)
 * Problem: Find length of longest increasing subsequence
 * Recurrence: dp[i] = max(dp[j] + 1) where j < i and nums[j] < nums[i]
 */
function lengthOfLIS(nums) {
    if (nums.length === 0) return 0;
    
    const dp = new Array(nums.length).fill(1);
    let maxLength = 1;
    
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLength = Math.max(maxLength, dp[i]);
    }
    
    return maxLength;
}

/**
 * Maximum Subarray (Kadane's Algorithm)
 * Problem: Find maximum sum of contiguous subarray
 * Recurrence: maxEndingHere = max(nums[i], maxEndingHere + nums[i])
 */
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

/**
 * Unique Paths
 * Problem: Count unique paths from top-left to bottom-right in grid
 * Recurrence: dp[i][j] = dp[i-1][j] + dp[i][j-1]
 */
function uniquePaths(m, n) {
    const dp = Array(m).fill(null).map(() => Array(n).fill(1));
    
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    
    return dp[m - 1][n - 1];
}

// Space Optimized Version
function uniquePathsOptimized(m, n) {
    let dp = new Array(n).fill(1);
    
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    
    return dp[n - 1];
}

/**
 * Unique Paths II (with obstacles)
 * Problem: Count unique paths with obstacles
 * Recurrence: dp[i][j] = dp[i-1][j] + dp[i][j-1] if no obstacle
 */
function uniquePathsWithObstacles(obstacleGrid) {
    const m = obstacleGrid.length;
    const n = obstacleGrid[0].length;
    
    if (obstacleGrid[0][0] === 1) return 0;
    
    const dp = Array(m).fill(null).map(() => Array(n).fill(0));
    dp[0][0] = 1;
    
    // Fill first row
    for (let j = 1; j < n; j++) {
        dp[0][j] = obstacleGrid[0][j] === 1 ? 0 : dp[0][j - 1];
    }
    
    // Fill first column
    for (let i = 1; i < m; i++) {
        dp[i][0] = obstacleGrid[i][0] === 1 ? 0 : dp[i - 1][0];
    }
    
    // Fill rest of the grid
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (obstacleGrid[i][j] === 1) {
                dp[i][j] = 0;
            } else {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
    }
    
    return dp[m - 1][n - 1];
}

/**
 * Minimum Path Sum
 * Problem: Find minimum sum path from top-left to bottom-right
 * Recurrence: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
 */
function minPathSum(grid) {
    const m = grid.length;
    const n = grid[0].length;
    
    const dp = Array(m).fill(null).map(() => Array(n).fill(0));
    dp[0][0] = grid[0][0];
    
    // Fill first row
    for (let j = 1; j < n; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }
    
    // Fill first column
    for (let i = 1; i < m; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }
    
    // Fill rest of the grid
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    
    return dp[m - 1][n - 1];
}

// ===== STRING DP PROBLEMS =====

/**
 * Longest Common Subsequence (LCS)
 * Problem: Find length of longest common subsequence
 * Recurrence: dp[i][j] = dp[i-1][j-1] + 1 if chars match, else max(dp[i-1][j], dp[i][j-1])
 */
function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Edit Distance (Levenshtein Distance)
 * Problem: Minimum operations to convert word1 to word2
 * Operations: insert, delete, replace
 */
function minDistance(word1, word2) {
    const m = word1.length;
    const n = word2.length;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    // Base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i; // Delete all
    for (let j = 0; j <= n; j++) dp[0][j] = j; // Insert all
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // No operation needed
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // Delete
                    dp[i][j - 1],     // Insert
                    dp[i - 1][j - 1]  // Replace
                );
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Palindromic Substrings
 * Problem: Count number of palindromic substrings
 * Approach: Expand around centers
 */
function countSubstrings(s) {
    let count = 0;
    
    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            count++;
            left--;
            right++;
        }
    }
    
    for (let i = 0; i < s.length; i++) {
        expandAroundCenter(i, i);     // Odd length palindromes
        expandAroundCenter(i, i + 1); // Even length palindromes
    }
    
    return count;
}

/**
 * Longest Palindromic Substring
 * Problem: Find longest palindromic substring
 * Approach: DP table or expand around centers
 */
function longestPalindrome(s) {
    if (s.length <= 1) return s;
    
    let start = 0;
    let maxLength = 1;
    
    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            const currentLength = right - left + 1;
            if (currentLength > maxLength) {
                start = left;
                maxLength = currentLength;
            }
            left--;
            right++;
        }
    }
    
    for (let i = 0; i < s.length; i++) {
        expandAroundCenter(i, i);     // Odd length
        expandAroundCenter(i, i + 1); // Even length
    }
    
    return s.substring(start, start + maxLength);
}

// ===== KNAPSACK PROBLEMS =====

/**
 * 0/1 Knapsack
 * Problem: Maximum value with weight constraint
 * Recurrence: dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i])
 */
function knapsack(weights, values, capacity) {
    const n = weights.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w], // Don't take item
                    dp[i - 1][w - weights[i - 1]] + values[i - 1] // Take item
                );
            } else {
                dp[i][w] = dp[i - 1][w]; // Can't take item
            }
        }
    }
    
    return dp[n][capacity];
}

// Space Optimized Knapsack
function knapsackOptimized(weights, values, capacity) {
    let dp = new Array(capacity + 1).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
        // Traverse backwards to avoid using updated values
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    
    return dp[capacity];
}

/**
 * Partition Equal Subset Sum
 * Problem: Check if array can be partitioned into two equal sum subsets
 * Approach: Knapsack variant - find subset with sum = total/2
 */
function canPartition(nums) {
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum % 2 !== 0) return false;
    
    const target = sum / 2;
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    
    for (let num of nums) {
        for (let j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    
    return dp[target];
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generic DP Template with Memoization
 */
function dpWithMemo(problem, ...args) {
    const memo = new Map();
    
    function solve(...params) {
        const key = JSON.stringify(params);
        if (memo.has(key)) return memo.get(key);
        
        const result = problem(...params, solve);
        memo.set(key, result);
        return result;
    }
    
    return solve(...args);
}

/**
 * Performance Comparison
 */
function performanceComparison() {
    console.log('=== DP Performance Comparison ===');
    
    const n = 35;
    
    console.time('Fibonacci Naive');
    // fibonacciNaive(n); // Too slow for large n
    console.timeEnd('Fibonacci Naive');
    
    console.time('Fibonacci Memoization');
    fibonacciMemo(n);
    console.timeEnd('Fibonacci Memoization');
    
    console.time('Fibonacci DP');
    fibonacciDP(n);
    console.timeEnd('Fibonacci DP');
    
    console.time('Fibonacci Optimized');
    fibonacciOptimized(n);
    console.timeEnd('Fibonacci Optimized');
}

/**
 * DP Problem Classifier
 */
function classifyDPProblem(description) {
    const patterns = {
        'sequence': ['fibonacci', 'climbing', 'house robber'],
        'grid': ['unique paths', 'minimum path', 'dungeon'],
        'string': ['edit distance', 'lcs', 'palindrome'],
        'knapsack': ['subset sum', 'coin change', 'partition'],
        'interval': ['matrix chain', 'burst balloons'],
        'tree': ['binary tree', 'diameter', 'path sum']
    };
    
    for (let [category, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    
    return 'unknown';
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Dynamic Programming Demo ===');

// Test Classic Problems
console.log('\n=== Classic DP Problems ===');
console.log('Fibonacci(10):', fibonacciDP(10)); // 55
console.log('Climb Stairs(5):', climbStairs(5)); // 8
console.log('House Robber([2,7,9,3,1]):', rob([2, 7, 9, 3, 1])); // 12
console.log('Coin Change([1,3,4], 6):', coinChange([1, 3, 4], 6)); // 2
console.log('Coin Change Ways([1,2,5], 5):', change(5, [1, 2, 5])); // 4
console.log('LIS([10,9,2,5,3,7,101,18]):', lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log('Max Subarray([-2,1,-3,4,-1,2,1,-5,4]):', maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6

// Test Grid Problems
console.log('\n=== Grid DP Problems ===');
console.log('Unique Paths(3,7):', uniquePaths(3, 7)); // 28
const obstacleGrid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
console.log('Unique Paths with Obstacles:', uniquePathsWithObstacles(obstacleGrid)); // 2
const grid = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];
console.log('Min Path Sum:', minPathSum(grid)); // 7

// Test String Problems
console.log('\n=== String DP Problems ===');
console.log('LCS("abcde", "ace"):', longestCommonSubsequence('abcde', 'ace')); // 3
console.log('Edit Distance("horse", "ros"):', minDistance('horse', 'ros')); // 3
console.log('Palindromic Substrings("abc"):', countSubstrings('abc')); // 3
console.log('Longest Palindrome("babad"):', longestPalindrome('babad')); // "bab" or "aba"

// Test Knapsack Problems
console.log('\n=== Knapsack DP Problems ===');
const weights = [1, 3, 4, 5];
const values = [1, 4, 5, 7];
console.log('Knapsack(capacity=7):', knapsack(weights, values, 7)); // 9
console.log('Can Partition([1,5,11,5]):', canPartition([1, 5, 11, 5])); // true

// Performance comparison
performanceComparison();

// Problem classification
console.log('\n=== Problem Classification ===');
console.log('"Find fibonacci number":', classifyDPProblem('Find fibonacci number'));
console.log('"Count unique paths in grid":', classifyDPProblem('Count unique paths in grid'));
console.log('"Edit distance between strings":', classifyDPProblem('Edit distance between strings'));
console.log('"Subset sum problem":', classifyDPProblem('Subset sum problem'));

console.log('\n=== DP Strategy Guide ===');
console.log('1. Identify optimal substructure');
console.log('2. Find overlapping subproblems');
console.log('3. Define recurrence relation');
console.log('4. Choose memoization vs tabulation');
console.log('5. Optimize space if possible');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <climits>
using namespace std;

// ===== CLASSIC DP PROBLEMS =====

// Fibonacci with Memoization
class FibonacciMemo {
private:
    unordered_map<int, long long> memo;
    
public:
    long long fib(int n) {
        if (memo.find(n) != memo.end()) {
            return memo[n];
        }
        
        if (n <= 1) {
            return memo[n] = n;
        }
        
        return memo[n] = fib(n - 1) + fib(n - 2);
    }
};

// Fibonacci Bottom-Up
long long fibonacciDP(int n) {
    if (n <= 1) return n;
    
    vector<long long> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Climbing Stairs
int climbStairs(int n) {
    if (n <= 2) return n;
    
    int prev2 = 1, prev1 = 2;
    
    for (int i = 3; i <= n; i++) {
        int current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// House Robber
int rob(vector<int>& nums) {
    if (nums.empty()) return 0;
    if (nums.size() == 1) return nums[0];
    
    int prev2 = 0, prev1 = nums[0];
    
    for (int i = 1; i < nums.size(); i++) {
        int current = max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Coin Change
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i && dp[i - coin] != INT_MAX) {
                dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}

// Longest Increasing Subsequence
int lengthOfLIS(vector<int>& nums) {
    if (nums.empty()) return 0;
    
    vector<int> dp(nums.size(), 1);
    int maxLength = 1;
    
    for (int i = 1; i < nums.size(); i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        maxLength = max(maxLength, dp[i]);
    }
    
    return maxLength;
}

// Maximum Subarray (Kadane's Algorithm)
int maxSubArray(vector<int>& nums) {
    int maxSoFar = nums[0];
    int maxEndingHere = nums[0];
    
    for (int i = 1; i < nums.size(); i++) {
        maxEndingHere = max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

// ===== GRID DP PROBLEMS =====

// Unique Paths
int uniquePaths(int m, int n) {
    vector<vector<int>> dp(m, vector<int>(n, 1));
    
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
        }
    }
    
    return dp[m - 1][n - 1];
}

// Minimum Path Sum
int minPathSum(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n));
    
    dp[0][0] = grid[0][0];
    
    // Fill first row
    for (int j = 1; j < n; j++) {
        dp[0][j] = dp[0][j - 1] + grid[0][j];
    }
    
    // Fill first column
    for (int i = 1; i < m; i++) {
        dp[i][0] = dp[i - 1][0] + grid[i][0];
    }
    
    // Fill rest of grid
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[i][j] = grid[i][j] + min(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    
    return dp[m - 1][n - 1];
}

// ===== STRING DP PROBLEMS =====

// Longest Common Subsequence
int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length(), n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// Edit Distance
int minDistance(string word1, string word2) {
    int m = word1.length(), n = word2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    
    // Base cases
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (word1[i - 1] == word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
    }
    
    return dp[m][n];
}

// ===== KNAPSACK PROBLEMS =====

// 0/1 Knapsack
int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));
    
    for (int i = 1; i <= n; i++) {
        for (int w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = max(dp[i - 1][w], 
                              dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][capacity];
}

// Partition Equal Subset Sum
bool canPartition(vector<int>& nums) {
    int sum = 0;
    for (int num : nums) sum += num;
    
    if (sum % 2 != 0) return false;
    
    int target = sum / 2;
    vector<bool> dp(target + 1, false);
    dp[0] = true;
    
    for (int num : nums) {
        for (int j = target; j >= num; j--) {
            dp[j] = dp[j] || dp[j - num];
        }
    }
    
    return dp[target];
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
        for (int val : row) {
            cout << val << " ";
        }
        cout << endl;
    }
}

// Example Usage
int main() {
    cout << "=== Dynamic Programming Demo ===" << endl;
    
    // Test Classic Problems
    cout << "\n=== Classic DP Problems ===" << endl;
    cout << "Fibonacci(10): " << fibonacciDP(10) << endl;
    cout << "Climb Stairs(5): " << climbStairs(5) << endl;
    
    vector<int> houses = {2, 7, 9, 3, 1};
    cout << "House Robber: " << rob(houses) << endl;
    
    vector<int> coins = {1, 3, 4};
    cout << "Coin Change(6): " << coinChange(coins, 6) << endl;
    
    vector<int> nums = {10, 9, 2, 5, 3, 7, 101, 18};
    cout << "LIS: " << lengthOfLIS(nums) << endl;
    
    vector<int> subarray = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "Max Subarray: " << maxSubArray(subarray) << endl;
    
    // Test Grid Problems
    cout << "\n=== Grid DP Problems ===" << endl;
    cout << "Unique Paths(3,7): " << uniquePaths(3, 7) << endl;
    
    vector<vector<int>> grid = {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}};
    cout << "Min Path Sum: " << minPathSum(grid) << endl;
    
    // Test String Problems
    cout << "\n=== String DP Problems ===" << endl;
    cout << "LCS('abcde', 'ace'): " << longestCommonSubsequence("abcde", "ace") << endl;
    cout << "Edit Distance('horse', 'ros'): " << minDistance("horse", "ros") << endl;
    
    // Test Knapsack Problems
    cout << "\n=== Knapsack DP Problems ===" << endl;
    vector<int> weights = {1, 3, 4, 5};
    vector<int> values = {1, 4, 5, 7};
    cout << "Knapsack(capacity=7): " << knapsack(weights, values, 7) << endl;
    
    vector<int> partition = {1, 5, 11, 5};
    cout << "Can Partition: " << (canPartition(partition) ? "true" : "false") << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity Improvements:

| Problem | Naive Approach | DP Approach | Improvement |
|---------|----------------|-------------|-------------|
| **Fibonacci** | O(2ⁿ) | O(n) | Exponential to linear |
| **Coin Change** | O(amount^coins) | O(amount × coins) | Exponential to polynomial |
| **LCS** | O(2^(m+n)) | O(m × n) | Exponential to polynomial |
| **Knapsack** | O(2ⁿ) | O(n × capacity) | Exponential to polynomial |
| **Edit Distance** | O(3^max(m,n)) | O(m × n) | Exponential to polynomial |

### Space Complexity:
- **2D DP**: O(m × n) - can often be optimized to O(min(m, n))
- **1D DP**: O(n) - can often be optimized to O(1)
- **Memoization**: O(recursion depth + memo size)

### When DP Excels:
- ✅ **Optimization problems**: Min/max/count solutions
- ✅ **Overlapping subproblems**: Same calculations repeated
- ✅ **Optimal substructure**: Optimal solution contains optimal subsolutions
- ✅ **Decision problems**: Choices affect future options

---

## 🧩 Practice Problems

### Problem 1: Triangle Minimum Path Sum
**Question**: Find minimum path sum from top to bottom of triangle.
**Example**: `[[2],[3,4],[6,5,7],[4,1,8,3]]` → 11 (path: 2+3+5+1)
**Hint**: Bottom-up DP, dp[i][j] = triangle[i][j] + min(dp[i+1][j], dp[i+1][j+1])

### Problem 2: Word Break
**Question**: Check if string can be segmented into dictionary words.
**Example**: `"leetcode"`, dict=["leet","code"] → true
**Hint**: dp[i] = true if substring(0,i) can be segmented

### Problem 3: Decode Ways
**Question**: Count ways to decode numeric string to letters (A=1, B=2, ..., Z=26).
**Example**: `"226"` → 3 ("BZ", "VF", "BBF")
**Hint**: dp[i] = dp[i-1] + dp[i-2] (if valid single/double digit)

### Problem 4: Maximum Product Subarray
**Question**: Find contiguous subarray with maximum product.
**Example**: `[2,3,-2,4]` → 6 (subarray [2,3])
**Hint**: Track both max and min products (negative × negative = positive)

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Problem recognition**: Can you identify DP problems?
2. **Recurrence relation**: Can you define the recursive structure?
3. **Base cases**: Do you handle edge cases correctly?
4. **Optimization**: Can you optimize space complexity?

### Common Interview Patterns:
- **1D DP**: Fibonacci-like problems, house robber, climbing stairs
- **2D DP**: Grid problems, string matching, knapsack
- **State machines**: Problems with different states/modes
- **Interval DP**: Problems involving ranges or intervals

### Red Flags to Avoid:
- Not identifying optimal substructure
- Incorrect recurrence relation
- Missing base cases
- Not considering space optimization
- Confusing top-down vs bottom-up

### Pro Tips:
1. **Start with recursion**: Write naive recursive solution first
2. **Identify overlapping subproblems**: Look for repeated calculations
3. **Define state clearly**: What parameters uniquely identify a subproblem?
4. **Choose approach**: Memoization (top-down) vs tabulation (bottom-up)
5. **Optimize space**: Can you reduce dimensions?
6. **Practice patterns**: Master common DP patterns

---

## 🚀 Key Takeaways

1. **DP optimizes overlapping subproblems** - Avoid redundant calculations
2. **Two main approaches** - Top-down (memoization) vs bottom-up (tabulation)
3. **Optimal substructure required** - Optimal solution contains optimal subsolutions
4. **State definition is crucial** - What parameters define a subproblem?
5. **Space optimization often possible** - Reduce dimensions when only recent states needed
6. **Practice pattern recognition** - Learn to identify DP problems quickly

**Next Chapter**: We'll explore Backtracking and see how to systematically explore solution spaces by making and undoing choices.