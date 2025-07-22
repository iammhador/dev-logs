# 📚 Chapter 7: Arrays & Array Methods

> Master JavaScript arrays and their powerful built-in methods for data manipulation.

## 📖 Plain English Explanation

Arrays are like organized lists or containers that hold multiple items in order. Think of them as:
- **Shopping list** = array of items to buy
- **Playlist** = array of songs in order
- **Photo album** = array of pictures
- **To-do list** = array of tasks

Array methods are like tools that help you work with these lists - adding items, removing items, finding items, transforming items, etc.

## 🏗️ Creating Arrays

### Array Literal (Preferred)
```javascript
// Empty array
const emptyArray = [];

// Array with initial values
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];
const mixed = ['hello', 42, true, null, { name: 'Alice' }];

// Multi-line for readability
const colors = [
    'red',
    'green',
    'blue',
    'yellow'
];
```

### Array Constructor
```javascript
// Empty array
const arr1 = new Array();

// Array with specific length (filled with undefined)
const arr2 = new Array(5); // [undefined, undefined, undefined, undefined, undefined]

// Array with initial values
const arr3 = new Array('a', 'b', 'c'); // ['a', 'b', 'c']

// ⚠️ Gotcha: Single number creates array with that length
const arr4 = new Array(3); // [undefined, undefined, undefined]
const arr5 = [3];          // [3]
```

### Array.from() and Array.of()
```javascript
// Array.from() - creates array from iterable
const str = 'hello';
const charArray = Array.from(str); // ['h', 'e', 'l', 'l', 'o']

// Array.from() with mapping function
const numbers = Array.from({ length: 5 }, (_, i) => i + 1); // [1, 2, 3, 4, 5]

// Array.of() - creates array from arguments
const arr6 = Array.of(1, 2, 3); // [1, 2, 3]
const arr7 = Array.of(3);       // [3] (not array with length 3!)
```

## 🔍 Accessing Array Elements

### Basic Access
```javascript
const fruits = ['apple', 'banana', 'orange', 'grape'];

// Access by index (0-based)
console.log(fruits[0]);  // 'apple'
console.log(fruits[1]);  // 'banana'
console.log(fruits[-1]); // undefined (no negative indexing)

// Get last element
console.log(fruits[fruits.length - 1]); // 'grape'

// Array length
console.log(fruits.length); // 4

// Check if index exists
if (fruits[10] !== undefined) {
    console.log(fruits[10]);
} else {
    console.log('Index 10 does not exist');
}
```

### Destructuring Assignment
```javascript
const colors = ['red', 'green', 'blue', 'yellow'];

// Basic destructuring
const [first, second] = colors;
console.log(first, second); // 'red', 'green'

// Skip elements
const [, , third] = colors;
console.log(third); // 'blue'

// Rest operator
const [primary, ...secondary] = colors;
console.log(primary);   // 'red'
console.log(secondary); // ['green', 'blue', 'yellow']

// Default values
const [a, b, c, d, e = 'default'] = colors;
console.log(e); // 'default'
```

## ➕ Adding Elements

### push() - Add to End
```javascript
const fruits = ['apple', 'banana'];

// Add single element
fruits.push('orange');
console.log(fruits); // ['apple', 'banana', 'orange']

// Add multiple elements
fruits.push('grape', 'kiwi');
console.log(fruits); // ['apple', 'banana', 'orange', 'grape', 'kiwi']

// push() returns new length
const newLength = fruits.push('mango');
console.log(newLength); // 6
```

### unshift() - Add to Beginning
```javascript
const numbers = [2, 3, 4];

// Add to beginning
numbers.unshift(1);
console.log(numbers); // [1, 2, 3, 4]

// Add multiple to beginning
numbers.unshift(-1, 0);
console.log(numbers); // [-1, 0, 1, 2, 3, 4]
```

### splice() - Add at Specific Position
```javascript
const letters = ['a', 'c', 'd'];

// Insert 'b' at index 1
letters.splice(1, 0, 'b');
console.log(letters); // ['a', 'b', 'c', 'd']

// Insert multiple elements
letters.splice(2, 0, 'x', 'y');
console.log(letters); // ['a', 'b', 'x', 'y', 'c', 'd']
```

## ➖ Removing Elements

### pop() - Remove from End
```javascript
const fruits = ['apple', 'banana', 'orange'];

// Remove and return last element
const removed = fruits.pop();
console.log(removed); // 'orange'
console.log(fruits);  // ['apple', 'banana']
```

### shift() - Remove from Beginning
```javascript
const numbers = [1, 2, 3, 4];

// Remove and return first element
const removed = numbers.shift();
console.log(removed); // 1
console.log(numbers); // [2, 3, 4]
```

### splice() - Remove from Specific Position
```javascript
const colors = ['red', 'green', 'blue', 'yellow'];

// Remove 1 element at index 1
const removed = colors.splice(1, 1);
console.log(removed); // ['green']
console.log(colors);  // ['red', 'blue', 'yellow']

// Remove multiple elements
const moreRemoved = colors.splice(1, 2);
console.log(moreRemoved); // ['blue', 'yellow']
console.log(colors);      // ['red']
```

### delete Operator (Not Recommended)
```javascript
const arr = [1, 2, 3, 4, 5];

// delete creates "holes" in array
delete arr[2];
console.log(arr);        // [1, 2, undefined, 4, 5]
console.log(arr.length); // 5 (length unchanged!)

// Use splice() instead
const arr2 = [1, 2, 3, 4, 5];
arr2.splice(2, 1);
console.log(arr2);        // [1, 2, 4, 5]
console.log(arr2.length); // 4
```

## 🔄 Iteration Methods

### forEach() - Execute Function for Each Element
```javascript
const numbers = [1, 2, 3, 4, 5];

// Basic forEach
numbers.forEach(function(number) {
    console.log(number * 2);
});

// Arrow function with index
numbers.forEach((number, index) => {
    console.log(`Index ${index}: ${number}`);
});

// With array parameter
numbers.forEach((number, index, array) => {
    console.log(`${number} is at index ${index} of array with length ${array.length}`);
});
```

### map() - Transform Each Element
```javascript
const numbers = [1, 2, 3, 4, 5];

// Double each number
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Transform objects
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 35 }
];

const names = users.map(user => user.name);
console.log(names); // ['Alice', 'Bob', 'Charlie']

// More complex transformation
const userInfo = users.map((user, index) => ({
    id: index + 1,
    displayName: `${user.name} (${user.age} years old)`,
    isAdult: user.age >= 18
}));
console.log(userInfo);
```

### filter() - Filter Elements
```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers
const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// Filter objects
const products = [
    { name: 'Laptop', price: 1000, inStock: true },
    { name: 'Phone', price: 500, inStock: false },
    { name: 'Tablet', price: 300, inStock: true }
];

const availableProducts = products.filter(product => product.inStock);
const expensiveProducts = products.filter(product => product.price > 400);

console.log(availableProducts);
console.log(expensiveProducts);
```

### reduce() - Reduce to Single Value
```javascript
const numbers = [1, 2, 3, 4, 5];

// Sum all numbers
const sum = numbers.reduce((accumulator, current) => {
    return accumulator + current;
}, 0);
console.log(sum); // 15

// Find maximum
const max = numbers.reduce((max, current) => {
    return current > max ? current : max;
});
console.log(max); // 5

// Count occurrences
const fruits = ['apple', 'banana', 'apple', 'orange', 'banana', 'apple'];
const count = fruits.reduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1;
    return acc;
}, {});
console.log(count); // { apple: 3, banana: 2, orange: 1 }

// Group by property
const people = [
    { name: 'Alice', age: 25, city: 'New York' },
    { name: 'Bob', age: 30, city: 'London' },
    { name: 'Charlie', age: 35, city: 'New York' }
];

const groupedByCity = people.reduce((acc, person) => {
    const city = person.city;
    if (!acc[city]) {
        acc[city] = [];
    }
    acc[city].push(person);
    return acc;
}, {});
console.log(groupedByCity);
```

## 🔍 Search Methods

### find() - Find First Matching Element
```javascript
const users = [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
    { id: 3, name: 'Charlie', active: true }
];

// Find first active user
const activeUser = users.find(user => user.active);
console.log(activeUser); // { id: 1, name: 'Alice', active: true }

// Find by ID
const userById = users.find(user => user.id === 2);
console.log(userById); // { id: 2, name: 'Bob', active: false }

// Returns undefined if not found
const notFound = users.find(user => user.id === 999);
console.log(notFound); // undefined
```

### findIndex() - Find Index of First Match
```javascript
const numbers = [10, 20, 30, 40, 50];

// Find index of first number > 25
const index = numbers.findIndex(num => num > 25);
console.log(index); // 2 (index of 30)

// Returns -1 if not found
const notFoundIndex = numbers.findIndex(num => num > 100);
console.log(notFoundIndex); // -1
```

### indexOf() and lastIndexOf()
```javascript
const fruits = ['apple', 'banana', 'orange', 'banana', 'grape'];

// Find first occurrence
console.log(fruits.indexOf('banana'));    // 1
console.log(fruits.indexOf('kiwi'));      // -1 (not found)

// Find last occurrence
console.log(fruits.lastIndexOf('banana')); // 3

// With start position
console.log(fruits.indexOf('banana', 2));  // 3 (start searching from index 2)
```

### includes() - Check if Element Exists
```javascript
const colors = ['red', 'green', 'blue'];

console.log(colors.includes('red'));    // true
console.log(colors.includes('yellow')); // false

// Case sensitive
console.log(colors.includes('Red'));    // false

// With start position
console.log(colors.includes('green', 2)); // false (start from index 2)
```

## ✅ Testing Methods

### some() - Test if Any Element Passes
```javascript
const numbers = [1, 3, 5, 8, 9];

// Check if any number is even
const hasEven = numbers.some(num => num % 2 === 0);
console.log(hasEven); // true (8 is even)

// Check if any number is > 10
const hasLarge = numbers.some(num => num > 10);
console.log(hasLarge); // false
```

### every() - Test if All Elements Pass
```javascript
const numbers = [2, 4, 6, 8, 10];

// Check if all numbers are even
const allEven = numbers.every(num => num % 2 === 0);
console.log(allEven); // true

// Check if all numbers are > 5
const allLarge = numbers.every(num => num > 5);
console.log(allLarge); // false (2 and 4 are not > 5)
```

## 🔧 Utility Methods

### join() - Convert to String
```javascript
const fruits = ['apple', 'banana', 'orange'];

// Default separator (comma)
console.log(fruits.join());      // "apple,banana,orange"

// Custom separator
console.log(fruits.join(' - '));  // "apple - banana - orange"
console.log(fruits.join(''));     // "applebananaorange"
console.log(fruits.join(' and ')); // "apple and banana and orange"
```

### reverse() - Reverse Array (Mutates Original)
```javascript
const numbers = [1, 2, 3, 4, 5];

// Reverse in place
numbers.reverse();
console.log(numbers); // [5, 4, 3, 2, 1]

// To avoid mutation, create copy first
const original = [1, 2, 3, 4, 5];
const reversed = [...original].reverse();
console.log(original); // [1, 2, 3, 4, 5] (unchanged)
console.log(reversed); // [5, 4, 3, 2, 1]
```

### sort() - Sort Array (Mutates Original)
```javascript
const fruits = ['banana', 'apple', 'orange', 'grape'];

// Default sort (alphabetical)
fruits.sort();
console.log(fruits); // ['apple', 'banana', 'grape', 'orange']

// Numbers need custom compare function
const numbers = [10, 5, 40, 25, 1000, 1];

// ❌ Wrong - converts to strings first
numbers.sort();
console.log(numbers); // [1, 10, 1000, 25, 40, 5]

// ✅ Correct - numeric sort
const nums = [10, 5, 40, 25, 1000, 1];
nums.sort((a, b) => a - b); // Ascending
console.log(nums); // [1, 5, 10, 25, 40, 1000]

// Descending
nums.sort((a, b) => b - a);
console.log(nums); // [1000, 40, 25, 10, 5, 1]

// Sort objects
const people = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
];

// Sort by age
people.sort((a, b) => a.age - b.age);
console.log(people);

// Sort by name
people.sort((a, b) => a.name.localeCompare(b.name));
console.log(people);
```

### slice() - Extract Portion (Non-Mutating)
```javascript
const fruits = ['apple', 'banana', 'orange', 'grape', 'kiwi'];

// Extract from index 1 to 3 (exclusive)
const sliced = fruits.slice(1, 3);
console.log(sliced); // ['banana', 'orange']
console.log(fruits); // Original unchanged

// From index to end
const fromIndex = fruits.slice(2);
console.log(fromIndex); // ['orange', 'grape', 'kiwi']

// Negative indices (from end)
const lastTwo = fruits.slice(-2);
console.log(lastTwo); // ['grape', 'kiwi']

// Copy entire array
const copy = fruits.slice();
console.log(copy); // ['apple', 'banana', 'orange', 'grape', 'kiwi']
```

## 🔗 Chaining Methods

### Method Chaining Examples
```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Chain multiple operations
const result = numbers
    .filter(num => num % 2 === 0)  // Get even numbers: [2, 4, 6, 8, 10]
    .map(num => num * num)         // Square them: [4, 16, 36, 64, 100]
    .reduce((sum, num) => sum + num, 0); // Sum them: 220

console.log(result); // 220

// More complex example
const users = [
    { name: 'Alice', age: 25, active: true, score: 85 },
    { name: 'Bob', age: 30, active: false, score: 92 },
    { name: 'Charlie', age: 35, active: true, score: 78 },
    { name: 'Diana', age: 28, active: true, score: 95 }
];

const topActiveUsers = users
    .filter(user => user.active)           // Only active users
    .filter(user => user.score > 80)       // High scores only
    .sort((a, b) => b.score - a.score)     // Sort by score (descending)
    .map(user => ({                        // Transform to simpler object
        name: user.name,
        score: user.score,
        grade: user.score >= 90 ? 'A' : 'B'
    }));

console.log(topActiveUsers);
// [{ name: 'Diana', score: 95, grade: 'A' }, { name: 'Alice', score: 85, grade: 'B' }]
```

## ⚠️ Common Pitfalls

### 1. Mutating vs Non-Mutating Methods
```javascript
const original = [1, 2, 3];

// ❌ These methods mutate the original array
original.push(4);      // [1, 2, 3, 4]
original.pop();        // [1, 2, 3]
original.reverse();    // [3, 2, 1]
original.sort();       // [1, 2, 3]
original.splice(1, 1); // [1, 3]

// ✅ These methods return new arrays
const arr = [1, 2, 3];
const mapped = arr.map(x => x * 2);     // [2, 4, 6], arr unchanged
const filtered = arr.filter(x => x > 1); // [2, 3], arr unchanged
const sliced = arr.slice(1);            // [2, 3], arr unchanged
```

### 2. Array Reference vs Copy
```javascript
const original = [1, 2, 3];

// ❌ This creates a reference, not a copy
const reference = original;
reference.push(4);
console.log(original); // [1, 2, 3, 4] - original is modified!

// ✅ Create actual copies
const copy1 = [...original];        // Spread operator
const copy2 = Array.from(original); // Array.from()
const copy3 = original.slice();     // slice() with no arguments
```

### 3. Sparse Arrays
```javascript
// Creating sparse arrays
const sparse = new Array(3); // [undefined, undefined, undefined]
const sparse2 = [1, , 3];    // [1, undefined, 3]

// Some methods skip holes
console.log(sparse2.map(x => x * 2)); // [2, undefined, 6]

// Others don't
console.log(sparse2.forEach(x => console.log(x))); // Only logs 1 and 3
```

### 4. Sort Gotchas
```javascript
// ❌ Default sort converts to strings
const numbers = [1, 10, 2, 20];
numbers.sort();
console.log(numbers); // [1, 10, 2, 20] - Wrong!

// ✅ Use compare function for numbers
numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 2, 10, 20] - Correct!
```

## 🏋️ Mini Practice Problems

### Problem 1: Array Manipulation
```javascript
// Given an array of numbers, create a new array with:
// 1. Only even numbers
// 2. Each number squared
// 3. Sorted in descending order

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Your solution here
const result = numbers
    // Your code here

console.log(result); // Should output: [100, 64, 36, 16, 4]
```

### Problem 2: Object Array Processing
```javascript
// Given an array of products, find:
// 1. Total value of all products in stock
// 2. Names of products under $50
// 3. Most expensive product

const products = [
    { name: 'Laptop', price: 1000, inStock: true },
    { name: 'Phone', price: 500, inStock: false },
    { name: 'Tablet', price: 300, inStock: true },
    { name: 'Watch', price: 200, inStock: true },
    { name: 'Headphones', price: 100, inStock: false }
];

// Your solutions here
const totalValue = // ?
const cheapProducts = // ?
const mostExpensive = // ?
```

### Problem 3: Custom Array Methods
```javascript
// Implement these array methods from scratch:

// 1. Custom map
Array.prototype.myMap = function(callback) {
    // Your implementation
};

// 2. Custom filter
Array.prototype.myFilter = function(callback) {
    // Your implementation
};

// 3. Custom reduce
Array.prototype.myReduce = function(callback, initialValue) {
    // Your implementation
};

// Test your implementations
const nums = [1, 2, 3, 4, 5];
console.log(nums.myMap(x => x * 2));        // [2, 4, 6, 8, 10]
console.log(nums.myFilter(x => x % 2 === 0)); // [2, 4]
console.log(nums.myReduce((a, b) => a + b, 0)); // 15
```

### Problem 4: Array Flattening
```javascript
// Flatten a nested array (one level deep)
const nested = [1, [2, 3], [4, [5, 6]], 7];

// Your solution here (don't use flat())
function flattenArray(arr) {
    // Your code here
}

console.log(flattenArray(nested)); // [1, 2, 3, 4, [5, 6], 7]
```

### Problem 5: Remove Duplicates
```javascript
// Remove duplicates from an array while preserving order
const withDuplicates = [1, 2, 2, 3, 4, 4, 5, 1];

// Provide multiple solutions:
// 1. Using Set
// 2. Using filter + indexOf
// 3. Using reduce

function removeDuplicates1(arr) {
    // Using Set
}

function removeDuplicates2(arr) {
    // Using filter + indexOf
}

function removeDuplicates3(arr) {
    // Using reduce
}

console.log(removeDuplicates1(withDuplicates)); // [1, 2, 3, 4, 5]
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `map()` and `forEach()`?**
- `map()` returns a new array with transformed elements
- `forEach()` executes a function for each element but returns undefined
- Use `map()` when you need to transform data, `forEach()` for side effects

**Q: How do you remove duplicates from an array?**
- `[...new Set(array)]` - using Set (ES6)
- `array.filter((item, index) => array.indexOf(item) === index)`
- Using `reduce()` to build unique array

**Q: What's the difference between `slice()` and `splice()`?**
- `slice()` returns a new array (non-mutating)
- `splice()` modifies the original array (mutating)
- `slice()` for extraction, `splice()` for insertion/deletion

**Q: How do you flatten an array?**
- `array.flat()` - ES2019 method
- `[].concat(...array)` - spread with concat
- `array.reduce((acc, val) => acc.concat(val), [])`

### 🏢 Asked at Companies:
- **Google**: "Implement array methods from scratch (map, filter, reduce)"
- **Facebook**: "Find the intersection of two arrays"
- **Amazon**: "Remove duplicates from an array without using Set"
- **Microsoft**: "Sort an array of objects by multiple properties"
- **Netflix**: "Implement a function to group array elements by a property"

## 📊 Array Methods Cheat Sheet

```
Mutating Methods (Change Original):
├── push(), pop(), shift(), unshift()
├── splice(), reverse(), sort()
└── fill(), copyWithin()

Non-Mutating Methods (Return New Array):
├── map(), filter(), reduce(), reduceRight()
├── slice(), concat(), flat(), flatMap()
├── find(), findIndex(), some(), every()
└── includes(), indexOf(), lastIndexOf()

Iteration Methods:
├── forEach() - Execute function for each
├── map() - Transform each element
├── filter() - Select elements
├── reduce() - Reduce to single value
├── find() - Find first match
└── some()/every() - Test elements
```

## 🎯 Key Takeaways

1. **Understand mutating vs non-mutating methods**
2. **Use method chaining for readable data transformations**
3. **Choose the right method for the task (map vs forEach)**
4. **Be careful with array references vs copies**
5. **Use spread operator for array copying and concatenation**
6. **Remember that sort() converts to strings by default**
7. **Practice implementing array methods from scratch**

---

**Previous Chapter**: [← Closures Explained](./06-closures.md)  
**Next Chapter**: [Objects & Object Access →](./08-objects.md)

**Practice**: Try the array manipulation problems and experiment with method chaining!