# Chapter 14: Backtracking - Systematic Solution Space Exploration

## 🎯 What is Backtracking?

**Backtracking** is an algorithmic technique that systematically explores all possible solutions to a problem by making choices, exploring their consequences, and undoing (backtracking) when a choice leads to a dead end. It's essentially a refined brute force approach that prunes invalid paths early.

### Why Backtracking Matters:
- **Systematic exploration**: Explores all possible solutions methodically
- **Early pruning**: Eliminates invalid paths to improve efficiency
- **Constraint satisfaction**: Solves problems with multiple constraints
- **Combinatorial problems**: Generates permutations, combinations, subsets
- **Game solving**: Chess, Sudoku, N-Queens, maze solving
- **Interview favorite**: Tests problem-solving and recursion skills

### Core Principles:
1. **Choose**: Make a choice from available options
2. **Explore**: Recursively explore the consequences
3. **Unchoose**: Backtrack if the path doesn't lead to a solution

---

## 📊 Backtracking Framework

### General Template:
```
function backtrack(state, choices):
    if (isComplete(state)):
        processResult(state)
        return
    
    for choice in choices:
        if (isValid(choice, state)):
            makeChoice(choice, state)
            backtrack(state, getNextChoices(state))
            undoChoice(choice, state)  // Backtrack
```

### Problem Classifications:

| Type | Description | Examples | Characteristics |
|------|-------------|----------|----------------|
| **Decision Problems** | Find if solution exists | N-Queens, Sudoku | Boolean result |
| **Optimization Problems** | Find best solution | Traveling Salesman | Compare solutions |
| **Enumeration Problems** | Find all solutions | All permutations | Generate all results |
| **Construction Problems** | Build valid solution | Generate parentheses | Construct step by step |

### When to Use Backtracking:
- ✅ **Constraint satisfaction**: Multiple rules to satisfy
- ✅ **Combinatorial enumeration**: Generate all possibilities
- ✅ **Puzzle solving**: Sudoku, crosswords, mazes
- ✅ **Game tree search**: Chess, tic-tac-toe
- ✅ **Path finding**: With constraints or obstacles

---

## 💻 JavaScript Implementation

```javascript
// Backtracking - Comprehensive Implementation

// ===== CLASSIC BACKTRACKING PROBLEMS =====

/**
 * N-Queens Problem
 * Problem: Place N queens on NxN chessboard so none attack each other
 * Constraints: No two queens in same row, column, or diagonal
 */
function solveNQueens(n) {
    const result = [];
    const board = Array(n).fill(null).map(() => Array(n).fill('.'));
    
    function isValid(row, col) {
        // Check column
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
        }
        
        // Check diagonal (top-left to bottom-right)
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 'Q') return false;
        }
        
        // Check diagonal (top-right to bottom-left)
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] === 'Q') return false;
        }
        
        return true;
    }
    
    function backtrack(row) {
        // Base case: all queens placed
        if (row === n) {
            result.push(board.map(row => row.join('')));
            return;
        }
        
        // Try placing queen in each column of current row
        for (let col = 0; col < n; col++) {
            if (isValid(row, col)) {
                board[row][col] = 'Q';        // Choose
                backtrack(row + 1);          // Explore
                board[row][col] = '.';        // Unchoose
            }
        }
    }
    
    backtrack(0);
    return result;
}

/**
 * Generate Parentheses
 * Problem: Generate all valid combinations of n pairs of parentheses
 * Constraints: Balanced parentheses
 */
function generateParenthesis(n) {
    const result = [];
    
    function backtrack(current, open, close) {
        // Base case: used all parentheses
        if (current.length === 2 * n) {
            result.push(current);
            return;
        }
        
        // Add opening parenthesis if we haven't used all
        if (open < n) {
            backtrack(current + '(', open + 1, close);
        }
        
        // Add closing parenthesis if it won't make string invalid
        if (close < open) {
            backtrack(current + ')', open, close + 1);
        }
    }
    
    backtrack('', 0, 0);
    return result;
}

/**
 * Permutations
 * Problem: Generate all permutations of given array
 * Approach: Choose element, recurse on remaining, backtrack
 */
function permute(nums) {
    const result = [];
    const current = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack() {
        // Base case: permutation complete
        if (current.length === nums.length) {
            result.push([...current]); // Copy array
            return;
        }
        
        // Try each unused number
        for (let i = 0; i < nums.length; i++) {
            if (!used[i]) {
                current.push(nums[i]);    // Choose
                used[i] = true;
                backtrack();              // Explore
                current.pop();            // Unchoose
                used[i] = false;
            }
        }
    }
    
    backtrack();
    return result;
}

/**
 * Permutations II (with duplicates)
 * Problem: Generate unique permutations from array with duplicates
 * Approach: Sort array and skip duplicates intelligently
 */
function permuteUnique(nums) {
    const result = [];
    const current = [];
    const used = new Array(nums.length).fill(false);
    
    nums.sort((a, b) => a - b); // Sort to group duplicates
    
    function backtrack() {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            
            // Skip duplicates: if current element equals previous
            // and previous is not used, skip current
            if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
                continue;
            }
            
            current.push(nums[i]);
            used[i] = true;
            backtrack();
            current.pop();
            used[i] = false;
        }
    }
    
    backtrack();
    return result;
}

/**
 * Combinations
 * Problem: Generate all combinations of k numbers from 1 to n
 * Approach: Choose number, recurse with remaining choices
 */
function combine(n, k) {
    const result = [];
    const current = [];
    
    function backtrack(start) {
        // Base case: combination complete
        if (current.length === k) {
            result.push([...current]);
            return;
        }
        
        // Try numbers from start to n
        for (let i = start; i <= n; i++) {
            current.push(i);          // Choose
            backtrack(i + 1);         // Explore (i+1 to avoid duplicates)
            current.pop();            // Unchoose
        }
    }
    
    backtrack(1);
    return result;
}

/**
 * Combination Sum
 * Problem: Find all combinations that sum to target
 * Approach: Choose number, subtract from target, recurse
 */
function combinationSum(candidates, target) {
    const result = [];
    const current = [];
    
    function backtrack(start, remaining) {
        // Base case: found valid combination
        if (remaining === 0) {
            result.push([...current]);
            return;
        }
        
        // Base case: exceeded target
        if (remaining < 0) {
            return;
        }
        
        // Try each candidate from start index
        for (let i = start; i < candidates.length; i++) {
            current.push(candidates[i]);
            // Can reuse same number, so pass i (not i+1)
            backtrack(i, remaining - candidates[i]);
            current.pop();
        }
    }
    
    backtrack(0, target);
    return result;
}

/**
 * Combination Sum II (no duplicates)
 * Problem: Find combinations that sum to target, each number used once
 * Approach: Sort array, skip duplicates at same level
 */
function combinationSum2(candidates, target) {
    const result = [];
    const current = [];
    
    candidates.sort((a, b) => a - b);
    
    function backtrack(start, remaining) {
        if (remaining === 0) {
            result.push([...current]);
            return;
        }
        
        for (let i = start; i < candidates.length; i++) {
            // Skip duplicates at same recursion level
            if (i > start && candidates[i] === candidates[i - 1]) {
                continue;
            }
            
            if (candidates[i] > remaining) break; // Optimization
            
            current.push(candidates[i]);
            backtrack(i + 1, remaining - candidates[i]); // i+1: use each number once
            current.pop();
        }
    }
    
    backtrack(0, target);
    return result;
}

/**
 * Subsets
 * Problem: Generate all possible subsets (power set)
 * Approach: For each element, choose to include or exclude
 */
function subsets(nums) {
    const result = [];
    const current = [];
    
    function backtrack(start) {
        // Add current subset to result
        result.push([...current]);
        
        // Try adding each remaining number
        for (let i = start; i < nums.length; i++) {
            current.push(nums[i]);    // Choose
            backtrack(i + 1);         // Explore
            current.pop();            // Unchoose
        }
    }
    
    backtrack(0);
    return result;
}

/**
 * Subsets II (with duplicates)
 * Problem: Generate unique subsets from array with duplicates
 * Approach: Sort and skip duplicates at same level
 */
function subsetsWithDup(nums) {
    const result = [];
    const current = [];
    
    nums.sort((a, b) => a - b);
    
    function backtrack(start) {
        result.push([...current]);
        
        for (let i = start; i < nums.length; i++) {
            // Skip duplicates at same level
            if (i > start && nums[i] === nums[i - 1]) {
                continue;
            }
            
            current.push(nums[i]);
            backtrack(i + 1);
            current.pop();
        }
    }
    
    backtrack(0);
    return result;
}

/**
 * Palindrome Partitioning
 * Problem: Partition string into palindromic substrings
 * Approach: Try all possible cuts, check if substring is palindrome
 */
function partition(s) {
    const result = [];
    const current = [];
    
    function isPalindrome(str, start, end) {
        while (start < end) {
            if (str[start] !== str[end]) return false;
            start++;
            end--;
        }
        return true;
    }
    
    function backtrack(start) {
        // Base case: processed entire string
        if (start === s.length) {
            result.push([...current]);
            return;
        }
        
        // Try all possible end positions
        for (let end = start; end < s.length; end++) {
            if (isPalindrome(s, start, end)) {
                current.push(s.substring(start, end + 1)); // Choose
                backtrack(end + 1);                        // Explore
                current.pop();                              // Unchoose
            }
        }
    }
    
    backtrack(0);
    return result;
}

/**
 * Word Search
 * Problem: Find if word exists in 2D board
 * Approach: DFS with backtracking, mark visited cells
 */
function exist(board, word) {
    const rows = board.length;
    const cols = board[0].length;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    function backtrack(row, col, index) {
        // Base case: found complete word
        if (index === word.length) return true;
        
        // Check bounds and character match
        if (row < 0 || row >= rows || col < 0 || col >= cols ||
            board[row][col] !== word[index] || board[row][col] === '#') {
            return false;
        }
        
        // Mark cell as visited
        const temp = board[row][col];
        board[row][col] = '#';
        
        // Explore all directions
        for (let [dr, dc] of directions) {
            if (backtrack(row + dr, col + dc, index + 1)) {
                board[row][col] = temp; // Restore
                return true;
            }
        }
        
        // Backtrack: restore cell
        board[row][col] = temp;
        return false;
    }
    
    // Try starting from each cell
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (backtrack(i, j, 0)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Sudoku Solver
 * Problem: Solve 9x9 Sudoku puzzle
 * Approach: Try numbers 1-9 in empty cells, backtrack if invalid
 */
function solveSudoku(board) {
    function isValid(board, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        
        return true;
    }
    
    function backtrack() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === '.') {
                    // Try numbers 1-9
                    for (let num = '1'; num <= '9'; num++) {
                        if (isValid(board, i, j, num)) {
                            board[i][j] = num;    // Choose
                            if (backtrack()) {    // Explore
                                return true;
                            }
                            board[i][j] = '.';    // Unchoose
                        }
                    }
                    return false; // No valid number found
                }
            }
        }
        return true; // All cells filled
    }
    
    backtrack();
}

/**
 * Letter Combinations of Phone Number
 * Problem: Generate all letter combinations from phone number
 * Approach: Map digits to letters, backtrack through combinations
 */
function letterCombinations(digits) {
    if (digits.length === 0) return [];
    
    const phoneMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    const result = [];
    
    function backtrack(index, current) {
        // Base case: processed all digits
        if (index === digits.length) {
            result.push(current);
            return;
        }
        
        // Get letters for current digit
        const letters = phoneMap[digits[index]];
        
        // Try each letter
        for (let letter of letters) {
            backtrack(index + 1, current + letter);
        }
    }
    
    backtrack(0, '');
    return result;
}

// ===== ADVANCED BACKTRACKING PROBLEMS =====

/**
 * Restore IP Addresses
 * Problem: Generate all valid IP addresses from string
 * Approach: Try all possible segment lengths, validate each segment
 */
function restoreIpAddresses(s) {
    const result = [];
    const segments = [];
    
    function isValidSegment(segment) {
        if (segment.length === 0 || segment.length > 3) return false;
        if (segment[0] === '0' && segment.length > 1) return false; // No leading zeros
        const num = parseInt(segment);
        return num >= 0 && num <= 255;
    }
    
    function backtrack(start) {
        // Base case: 4 segments formed
        if (segments.length === 4) {
            if (start === s.length) {
                result.push(segments.join('.'));
            }
            return;
        }
        
        // Try segment lengths 1, 2, 3
        for (let len = 1; len <= 3 && start + len <= s.length; len++) {
            const segment = s.substring(start, start + len);
            if (isValidSegment(segment)) {
                segments.push(segment);       // Choose
                backtrack(start + len);      // Explore
                segments.pop();              // Unchoose
            }
        }
    }
    
    backtrack(0);
    return result;
}

/**
 * Expression Add Operators
 * Problem: Add +, -, * operators to make target
 * Approach: Try all operator placements, handle precedence
 */
function addOperators(num, target) {
    const result = [];
    
    function backtrack(index, expression, value, prev) {
        // Base case: processed all digits
        if (index === num.length) {
            if (value === target) {
                result.push(expression);
            }
            return;
        }
        
        // Try all possible number lengths from current position
        for (let i = index; i < num.length; i++) {
            const numStr = num.substring(index, i + 1);
            
            // Skip numbers with leading zeros (except single '0')
            if (numStr.length > 1 && numStr[0] === '0') break;
            
            const numVal = parseInt(numStr);
            
            if (index === 0) {
                // First number, no operator needed
                backtrack(i + 1, numStr, numVal, numVal);
            } else {
                // Try addition
                backtrack(i + 1, expression + '+' + numStr, value + numVal, numVal);
                
                // Try subtraction
                backtrack(i + 1, expression + '-' + numStr, value - numVal, -numVal);
                
                // Try multiplication (handle precedence)
                backtrack(i + 1, expression + '*' + numStr, 
                         value - prev + prev * numVal, prev * numVal);
            }
        }
    }
    
    backtrack(0, '', 0, 0);
    return result;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generic Backtracking Template
 */
function genericBacktrack(choices, isComplete, isValid, makeChoice, undoChoice, processResult) {
    const state = [];
    
    function backtrack() {
        if (isComplete(state)) {
            processResult([...state]);
            return;
        }
        
        for (let choice of choices(state)) {
            if (isValid(choice, state)) {
                makeChoice(choice, state);
                backtrack();
                undoChoice(choice, state);
            }
        }
    }
    
    backtrack();
}

/**
 * Performance Measurement
 */
function measureBacktrackingPerformance(func, ...args) {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    console.log(`Function: ${func.name}`);
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
    console.log(`Results: ${Array.isArray(result) ? result.length : result}`);
    
    return result;
}

/**
 * Backtracking Problem Classifier
 */
function classifyBacktrackingProblem(description) {
    const patterns = {
        'permutation': ['permute', 'arrange', 'order'],
        'combination': ['choose', 'select', 'subset'],
        'partition': ['split', 'divide', 'partition'],
        'constraint': ['sudoku', 'queens', 'valid'],
        'path': ['maze', 'word search', 'path'],
        'expression': ['operators', 'parentheses', 'formula']
    };
    
    for (let [category, keywords] of Object.entries(patterns)) {
        if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
            return category;
        }
    }
    
    return 'unknown';
}

// ===== EXAMPLE USAGE AND TESTING =====

console.log('=== Backtracking Demo ===');

// Test Classic Problems
console.log('\n=== Classic Backtracking Problems ===');
console.log('N-Queens(4):');
solveNQueens(4).forEach((solution, i) => {
    console.log(`Solution ${i + 1}:`);
    solution.forEach(row => console.log(row));
    console.log();
});

console.log('Generate Parentheses(3):', generateParenthesis(3));
console.log('Permutations([1,2,3]):', permute([1, 2, 3]));
console.log('Combinations(4,2):', combine(4, 2));
console.log('Combination Sum([2,3,6,7], 7):', combinationSum([2, 3, 6, 7], 7));
console.log('Subsets([1,2,3]):', subsets([1, 2, 3]));

// Test String Problems
console.log('\n=== String Backtracking Problems ===');
console.log('Palindrome Partitioning("aab"):', partition('aab'));
console.log('Letter Combinations("23"):', letterCombinations('23'));
console.log('Restore IP("25525511135"):', restoreIpAddresses('25525511135'));

// Test Board Problems
console.log('\n=== Board Backtracking Problems ===');
const board = [
    ['A', 'B', 'C', 'E'],
    ['S', 'F', 'C', 'S'],
    ['A', 'D', 'E', 'E']
];
console.log('Word Search("ABCCED"):', exist(board, 'ABCCED')); // true
console.log('Word Search("SEE"):', exist(board, 'SEE')); // true
console.log('Word Search("ABCB"):', exist(board, 'ABCB')); // false

// Performance measurement
console.log('\n=== Performance Measurement ===');
measureBacktrackingPerformance(permute, [1, 2, 3, 4]);
measureBacktrackingPerformance(subsets, [1, 2, 3, 4, 5]);
measureBacktrackingPerformance(combine, 10, 3);

// Problem classification
console.log('\n=== Problem Classification ===');
console.log('"Generate all permutations":', classifyBacktrackingProblem('Generate all permutations'));
console.log('"Choose k elements":', classifyBacktrackingProblem('Choose k elements'));
console.log('"Solve sudoku puzzle":', classifyBacktrackingProblem('Solve sudoku puzzle'));
console.log('"Find path in maze":', classifyBacktrackingProblem('Find path in maze'));

console.log('\n=== Backtracking Strategy Guide ===');
console.log('1. Identify choices at each step');
console.log('2. Define constraints/validity checks');
console.log('3. Implement choose-explore-unchoose pattern');
console.log('4. Handle base cases (complete/invalid states)');
console.log('5. Optimize with early pruning');
```

---

## 🔧 C++ Implementation

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_set>
using namespace std;

// ===== CLASSIC BACKTRACKING PROBLEMS =====

// N-Queens Problem
class NQueens {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> result;
        vector<string> board(n, string(n, '.'));
        backtrack(result, board, 0, n);
        return result;
    }
    
private:
    void backtrack(vector<vector<string>>& result, vector<string>& board, int row, int n) {
        if (row == n) {
            result.push_back(board);
            return;
        }
        
        for (int col = 0; col < n; col++) {
            if (isValid(board, row, col, n)) {
                board[row][col] = 'Q';        // Choose
                backtrack(result, board, row + 1, n); // Explore
                board[row][col] = '.';        // Unchoose
            }
        }
    }
    
    bool isValid(vector<string>& board, int row, int col, int n) {
        // Check column
        for (int i = 0; i < row; i++) {
            if (board[i][col] == 'Q') return false;
        }
        
        // Check diagonal (top-left to bottom-right)
        for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] == 'Q') return false;
        }
        
        // Check diagonal (top-right to bottom-left)
        for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] == 'Q') return false;
        }
        
        return true;
    }
};

// Generate Parentheses
class GenerateParentheses {
public:
    vector<string> generateParenthesis(int n) {
        vector<string> result;
        backtrack(result, "", 0, 0, n);
        return result;
    }
    
private:
    void backtrack(vector<string>& result, string current, int open, int close, int n) {
        if (current.length() == 2 * n) {
            result.push_back(current);
            return;
        }
        
        if (open < n) {
            backtrack(result, current + "(", open + 1, close, n);
        }
        
        if (close < open) {
            backtrack(result, current + ")", open, close + 1, n);
        }
    }
};

// Permutations
class Permutations {
public:
    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        vector<bool> used(nums.size(), false);
        backtrack(result, current, nums, used);
        return result;
    }
    
private:
    void backtrack(vector<vector<int>>& result, vector<int>& current, 
                   vector<int>& nums, vector<bool>& used) {
        if (current.size() == nums.size()) {
            result.push_back(current);
            return;
        }
        
        for (int i = 0; i < nums.size(); i++) {
            if (!used[i]) {
                current.push_back(nums[i]);  // Choose
                used[i] = true;
                backtrack(result, current, nums, used); // Explore
                current.pop_back();          // Unchoose
                used[i] = false;
            }
        }
    }
};

// Combinations
class Combinations {
public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(result, current, 1, n, k);
        return result;
    }
    
private:
    void backtrack(vector<vector<int>>& result, vector<int>& current, 
                   int start, int n, int k) {
        if (current.size() == k) {
            result.push_back(current);
            return;
        }
        
        for (int i = start; i <= n; i++) {
            current.push_back(i);         // Choose
            backtrack(result, current, i + 1, n, k); // Explore
            current.pop_back();           // Unchoose
        }
    }
};

// Combination Sum
class CombinationSum {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(result, current, candidates, target, 0);
        return result;
    }
    
private:
    void backtrack(vector<vector<int>>& result, vector<int>& current,
                   vector<int>& candidates, int remaining, int start) {
        if (remaining == 0) {
            result.push_back(current);
            return;
        }
        
        if (remaining < 0) return;
        
        for (int i = start; i < candidates.size(); i++) {
            current.push_back(candidates[i]);
            backtrack(result, current, candidates, remaining - candidates[i], i);
            current.pop_back();
        }
    }
};

// Subsets
class Subsets {
public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> result;
        vector<int> current;
        backtrack(result, current, nums, 0);
        return result;
    }
    
private:
    void backtrack(vector<vector<int>>& result, vector<int>& current,
                   vector<int>& nums, int start) {
        result.push_back(current);
        
        for (int i = start; i < nums.size(); i++) {
            current.push_back(nums[i]);   // Choose
            backtrack(result, current, nums, i + 1); // Explore
            current.pop_back();           // Unchoose
        }
    }
};

// Palindrome Partitioning
class PalindromePartitioning {
public:
    vector<vector<string>> partition(string s) {
        vector<vector<string>> result;
        vector<string> current;
        backtrack(result, current, s, 0);
        return result;
    }
    
private:
    void backtrack(vector<vector<string>>& result, vector<string>& current,
                   string& s, int start) {
        if (start == s.length()) {
            result.push_back(current);
            return;
        }
        
        for (int end = start; end < s.length(); end++) {
            if (isPalindrome(s, start, end)) {
                current.push_back(s.substr(start, end - start + 1));
                backtrack(result, current, s, end + 1);
                current.pop_back();
            }
        }
    }
    
    bool isPalindrome(string& s, int start, int end) {
        while (start < end) {
            if (s[start] != s[end]) return false;
            start++;
            end--;
        }
        return true;
    }
};

// Word Search
class WordSearch {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size(), cols = board[0].size();
        
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (backtrack(board, word, i, j, 0)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
private:
    bool backtrack(vector<vector<char>>& board, string& word, 
                   int row, int col, int index) {
        if (index == word.length()) return true;
        
        if (row < 0 || row >= board.size() || col < 0 || col >= board[0].size() ||
            board[row][col] != word[index] || board[row][col] == '#') {
            return false;
        }
        
        char temp = board[row][col];
        board[row][col] = '#';  // Mark as visited
        
        // Explore all directions
        vector<vector<int>> directions = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};
        for (auto& dir : directions) {
            if (backtrack(board, word, row + dir[0], col + dir[1], index + 1)) {
                board[row][col] = temp; // Restore
                return true;
            }
        }
        
        board[row][col] = temp; // Backtrack
        return false;
    }
};

// Sudoku Solver
class SudokuSolver {
public:
    void solveSudoku(vector<vector<char>>& board) {
        backtrack(board);
    }
    
private:
    bool backtrack(vector<vector<char>>& board) {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (board[i][j] == '.') {
                    for (char num = '1'; num <= '9'; num++) {
                        if (isValid(board, i, j, num)) {
                            board[i][j] = num;    // Choose
                            if (backtrack(board)) { // Explore
                                return true;
                            }
                            board[i][j] = '.';    // Unchoose
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    bool isValid(vector<vector<char>>& board, int row, int col, char num) {
        // Check row
        for (int j = 0; j < 9; j++) {
            if (board[row][j] == num) return false;
        }
        
        // Check column
        for (int i = 0; i < 9; i++) {
            if (board[i][col] == num) return false;
        }
        
        // Check 3x3 box
        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        for (int i = boxRow; i < boxRow + 3; i++) {
            for (int j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] == num) return false;
            }
        }
        
        return true;
    }
};

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

void printStringMatrix(const vector<vector<string>>& matrix, const string& label = "") {
    if (!label.empty()) {
        cout << label << ":" << endl;
    }
    for (const auto& row : matrix) {
        for (const string& val : row) {
            cout << val << " ";
        }
        cout << endl;
    }
}

// Example Usage
int main() {
    cout << "=== Backtracking Demo ===" << endl;
    
    // Test N-Queens
    cout << "\n=== N-Queens Problem ===" << endl;
    NQueens nq;
    auto queens = nq.solveNQueens(4);
    cout << "N-Queens(4) solutions: " << queens.size() << endl;
    for (int i = 0; i < queens.size(); i++) {
        cout << "Solution " << i + 1 << ":" << endl;
        for (const string& row : queens[i]) {
            cout << row << endl;
        }
        cout << endl;
    }
    
    // Test Generate Parentheses
    cout << "\n=== Generate Parentheses ===" << endl;
    GenerateParentheses gp;
    auto parentheses = gp.generateParenthesis(3);
    cout << "Generate Parentheses(3): ";
    for (const string& p : parentheses) {
        cout << p << " ";
    }
    cout << endl;
    
    // Test Permutations
    cout << "\n=== Permutations ===" << endl;
    Permutations perm;
    vector<int> nums = {1, 2, 3};
    auto perms = perm.permute(nums);
    cout << "Permutations([1,2,3]):" << endl;
    printMatrix(perms);
    
    // Test Combinations
    cout << "\n=== Combinations ===" << endl;
    Combinations comb;
    auto combs = comb.combine(4, 2);
    cout << "Combinations(4,2):" << endl;
    printMatrix(combs);
    
    // Test Combination Sum
    cout << "\n=== Combination Sum ===" << endl;
    CombinationSum cs;
    vector<int> candidates = {2, 3, 6, 7};
    auto combSums = cs.combinationSum(candidates, 7);
    cout << "Combination Sum([2,3,6,7], 7):" << endl;
    printMatrix(combSums);
    
    // Test Subsets
    cout << "\n=== Subsets ===" << endl;
    Subsets sub;
    vector<int> subNums = {1, 2, 3};
    auto subsets = sub.subsets(subNums);
    cout << "Subsets([1,2,3]):" << endl;
    printMatrix(subsets);
    
    // Test Palindrome Partitioning
    cout << "\n=== Palindrome Partitioning ===" << endl;
    PalindromePartitioning pp;
    auto partitions = pp.partition("aab");
    cout << "Palindrome Partitioning('aab'):" << endl;
    printStringMatrix(partitions);
    
    // Test Word Search
    cout << "\n=== Word Search ===" << endl;
    WordSearch ws;
    vector<vector<char>> board = {
        {'A', 'B', 'C', 'E'},
        {'S', 'F', 'C', 'S'},
        {'A', 'D', 'E', 'E'}
    };
    cout << "Word Search('ABCCED'): " << (ws.exist(board, "ABCCED") ? "true" : "false") << endl;
    cout << "Word Search('SEE'): " << (ws.exist(board, "SEE") ? "true" : "false") << endl;
    cout << "Word Search('ABCB'): " << (ws.exist(board, "ABCB") ? "true" : "false") << endl;
    
    return 0;
}
```

---

## ⚡ Performance Analysis

### Time Complexity:

| Problem | Time Complexity | Space Complexity | Notes |
|---------|----------------|------------------|-------|
| **N-Queens** | O(N!) | O(N²) | N! possible arrangements |
| **Permutations** | O(N! × N) | O(N) | N! permutations, N to copy |
| **Combinations** | O(C(n,k)) | O(k) | Binomial coefficient |
| **Subsets** | O(2ⁿ × N) | O(N) | 2ⁿ subsets, N to copy |
| **Sudoku** | O(9^(empty cells)) | O(1) | Worst case: try all numbers |
| **Word Search** | O(M×N×4^L) | O(L) | M×N starting points, 4^L paths |

### Space Complexity Factors:
- **Recursion stack**: O(depth of recursion)
- **Current state**: O(size of partial solution)
- **Result storage**: O(number of solutions × solution size)

### Optimization Techniques:
1. **Early pruning**: Eliminate invalid paths quickly
2. **Constraint propagation**: Use constraints to reduce search space
3. **Ordering heuristics**: Try most promising choices first
4. **Memoization**: Cache results of subproblems (when applicable)

---

## 🧩 Practice Problems

### Problem 1: Beautiful Arrangement
**Question**: Count arrangements where nums[i] is divisible by i or i is divisible by nums[i].
**Example**: N=2 → 2 (arrangements: [1,2] and [2,1])
**Hint**: Use backtracking with position-based choices

### Problem 2: Partition to K Equal Sum Subsets
**Question**: Check if array can be partitioned into k subsets with equal sum.
**Example**: [4,3,2,3,5,2,1], k=4 → true
**Hint**: Backtrack by trying to fill each subset to target sum

### Problem 3: Remove Invalid Parentheses
**Question**: Remove minimum parentheses to make string valid.
**Example**: "()())()" → ["()()()", "(())()"]
**Hint**: BFS or backtracking with pruning

### Problem 4: Word Search II
**Question**: Find all words from dictionary that exist in 2D board.
**Example**: Board + ["oath","pea","eat","rain"] → ["eat","oath"]
**Hint**: Use Trie + backtracking for efficiency

---

## 🎯 Interview Tips

### What Interviewers Look For:
1. **Problem decomposition**: Can you break down the problem?
2. **Constraint identification**: Do you understand the rules?
3. **Backtracking pattern**: Can you implement choose-explore-unchoose?
4. **Base cases**: Do you handle termination correctly?
5. **Optimization**: Can you prune invalid paths early?

### Common Interview Patterns:
- **Generate all**: Permutations, combinations, subsets
- **Find valid**: N-Queens, Sudoku, valid arrangements
- **Path finding**: Word search, maze solving
- **Constraint satisfaction**: Scheduling, assignment problems

### Red Flags to Avoid:
- Not implementing proper backtracking (missing unchoose step)
- Incorrect base cases or termination conditions
- Not handling duplicates properly
- Missing constraint validation
- Inefficient pruning or no pruning at all

### Pro Tips:
1. **Start with brute force**: Identify all possible choices
2. **Add constraints**: Implement validity checks
3. **Implement backtracking**: Choose-explore-unchoose pattern
4. **Optimize with pruning**: Eliminate invalid paths early
5. **Handle edge cases**: Empty inputs, single elements
6. **Practice templates**: Master the backtracking framework

---

## 🚀 Key Takeaways

1. **Backtracking explores all possibilities systematically** - Choose, explore, unchoose
2. **Early pruning is crucial** - Eliminate invalid paths to improve efficiency
3. **State management matters** - Properly track and restore state
4. **Constraint validation is key** - Check validity before exploring
5. **Template approach works** - Master the general backtracking pattern
6. **Practice problem recognition** - Learn to identify backtracking problems

**Next Chapter**: We'll explore Simple Greedy Algorithms and learn how to make locally optimal choices that lead to globally optimal solutions.