# 🔧 Chapter 4: Functions Deep Dive

> Master JavaScript functions: the building blocks of reusable, modular code.

## 📖 Plain English Explanation

Functions are like recipes or machines:
- **Input** = ingredients (parameters)
- **Process** = cooking steps (function body)
- **Output** = finished dish (return value)

They let you write code once and use it many times, making your programs organized and efficient.

## 🏗️ Function Declaration

### Basic Function Declaration
```javascript
// Function declaration - hoisted to top
function greet(name) {
    return `Hello, ${name}!`;
}

// Can be called before declaration due to hoisting
console.log(sayHi("Alice")); // Works!

function sayHi(name) {
    return `Hi there, ${name}!`;
}
```

### Function with Multiple Parameters
```javascript
function calculateArea(length, width) {
    return length * width;
}

const area = calculateArea(10, 5);
console.log(area); // 50
```

### Function with Default Parameters (ES6)
```javascript
function greetUser(name = "Guest", greeting = "Hello") {
    return `${greeting}, ${name}!`;
}

console.log(greetUser()); // "Hello, Guest!"
console.log(greetUser("Alice")); // "Hello, Alice!"
console.log(greetUser("Bob", "Hi")); // "Hi, Bob!"
```

### Rest Parameters (...args)
```javascript
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3)); // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// Mix regular params with rest
function introduce(firstName, lastName, ...hobbies) {
    console.log(`I'm ${firstName} ${lastName}`);
    console.log(`My hobbies: ${hobbies.join(", ")}`);
}

introduce("John", "Doe", "reading", "coding", "gaming");
```

## 📝 Function Expressions

### Anonymous Function Expression
```javascript
// Function expression - not hoisted
const multiply = function(a, b) {
    return a * b;
};

console.log(multiply(4, 5)); // 20

// This would cause an error:
// console.log(divide(10, 2)); // ReferenceError!

const divide = function(a, b) {
    return a / b;
};
```

### Named Function Expression
```javascript
const factorial = function fact(n) {
    if (n <= 1) return 1;
    return n * fact(n - 1); // Can reference itself by name
};

console.log(factorial(5)); // 120
// console.log(fact(5)); // ReferenceError - name only available inside
```

### Immediately Invoked Function Expression (IIFE)
```javascript
// IIFE - runs immediately
(function() {
    console.log("This runs right away!");
})();

// IIFE with parameters
(function(name) {
    console.log(`Hello, ${name}!`);
})("World");

// IIFE with return value
const result = (function(a, b) {
    return a + b;
})(5, 3);

console.log(result); // 8
```

## 🏹 Arrow Functions (ES6)

### Basic Arrow Function Syntax
```javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function - concise
const addArrow = (a, b) => a + b;

// Both work the same
console.log(add(2, 3)); // 5
console.log(addArrow(2, 3)); // 5
```

### Arrow Function Variations
```javascript
// No parameters
const sayHello = () => "Hello!";

// One parameter (parentheses optional)
const square = x => x * x;
const squareExplicit = (x) => x * x; // Same thing

// Multiple parameters
const multiply = (a, b) => a * b;

// Block body (need explicit return)
const complexFunction = (x, y) => {
    const sum = x + y;
    const product = x * y;
    return { sum, product };
};

console.log(complexFunction(3, 4)); // { sum: 7, product: 12 }
```

### Arrow Functions with Arrays
```javascript
const numbers = [1, 2, 3, 4, 5];

// Traditional way
const doubled = numbers.map(function(num) {
    return num * 2;
});

// Arrow function way
const doubledArrow = numbers.map(num => num * 2);
const evens = numbers.filter(num => num % 2 === 0);
const sum = numbers.reduce((acc, num) => acc + num, 0);

console.log(doubledArrow); // [2, 4, 6, 8, 10]
console.log(evens); // [2, 4]
console.log(sum); // 15
```

## 🔄 Function Scope & Closures Preview

### Local vs Global Scope
```javascript
const globalVar = "I'm global";

function testScope() {
    const localVar = "I'm local";
    console.log(globalVar); // Can access global
    console.log(localVar);  // Can access local
}

testScope();
console.log(globalVar); // Works
// console.log(localVar); // ReferenceError!
```

### Function Parameters Shadow Global Variables
```javascript
const name = "Global Alice";

function greet(name) {
    console.log(`Hello, ${name}!`); // Uses parameter, not global
}

greet("Local Bob"); // "Hello, Local Bob!"
console.log(name); // Still "Global Alice"
```

## 🎯 Advanced Function Concepts

### Functions as First-Class Citizens
```javascript
// Functions can be assigned to variables
const myFunc = function() { return "Hello!"; };

// Functions can be passed as arguments
function executeFunction(fn) {
    return fn();
}

console.log(executeFunction(myFunc)); // "Hello!"

// Functions can be returned from other functions
function createMultiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

### Higher-Order Functions
```javascript
// Function that takes other functions as arguments
function processArray(arr, callback) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(callback(arr[i], i));
    }
    return result;
}

const numbers = [1, 2, 3, 4, 5];

// Different callbacks for different behaviors
const squared = processArray(numbers, x => x * x);
const withIndex = processArray(numbers, (x, i) => `${i}: ${x}`);

console.log(squared); // [1, 4, 9, 16, 25]
console.log(withIndex); // ["0: 1", "1: 2", "2: 3", "3: 4", "4: 5"]
```

### Callback Functions
```javascript
// Simulating asynchronous operation
function fetchData(callback) {
    setTimeout(() => {
        const data = { id: 1, name: "Alice" };
        callback(data);
    }, 1000);
}

// Using the callback
fetchData(function(data) {
    console.log("Received data:", data);
});

// Arrow function callback
fetchData(data => console.log("Data:", data));
```

## 🔧 Function Methods

### call() Method
```javascript
function introduce() {
    return `Hi, I'm ${this.name} and I'm ${this.age} years old.`;
}

const person1 = { name: "Alice", age: 25 };
const person2 = { name: "Bob", age: 30 };

// Call function with different 'this' context
console.log(introduce.call(person1)); // "Hi, I'm Alice and I'm 25 years old."
console.log(introduce.call(person2)); // "Hi, I'm Bob and I'm 30 years old."

// call() with arguments
function greetWithTitle(title) {
    return `${title} ${this.name}`;
}

console.log(greetWithTitle.call(person1, "Dr.")); // "Dr. Alice"
```

### apply() Method
```javascript
function sum(a, b, c) {
    return a + b + c;
}

const numbers = [1, 2, 3];

// apply() takes array of arguments
console.log(sum.apply(null, numbers)); // 6

// Equivalent to:
console.log(sum.call(null, 1, 2, 3)); // 6

// Modern way with spread operator
console.log(sum(...numbers)); // 6
```

### bind() Method
```javascript
const person = {
    name: "Alice",
    greet: function(greeting) {
        return `${greeting}, I'm ${this.name}!`;
    }
};

// bind() creates new function with fixed 'this'
const boundGreet = person.greet.bind(person);
console.log(boundGreet("Hello")); // "Hello, I'm Alice!"

// Partial application with bind()
const sayHello = person.greet.bind(person, "Hello");
console.log(sayHello()); // "Hello, I'm Alice!"
```

## ⚠️ Common Pitfalls

### 1. Arrow Functions and 'this'
```javascript
const obj = {
    name: "Alice",
    
    // Regular function - 'this' refers to obj
    regularMethod: function() {
        console.log(this.name); // "Alice"
    },
    
    // Arrow function - 'this' refers to outer scope
    arrowMethod: () => {
        console.log(this.name); // undefined (or global)
    }
};

obj.regularMethod(); // "Alice"
obj.arrowMethod();   // undefined
```

### 2. Hoisting Differences
```javascript
// Function declarations are fully hoisted
console.log(declared()); // "Works!"

function declared() {
    return "Works!";
}

// Function expressions are not hoisted
// console.log(expressed()); // TypeError!

const expressed = function() {
    return "Works!";
};
```

### 3. Modifying Parameters
```javascript
// Primitive parameters are passed by value
function changeNumber(num) {
    num = 100;
}

let x = 5;
changeNumber(x);
console.log(x); // Still 5

// Object parameters are passed by reference
function changeObject(obj) {
    obj.name = "Changed";
}

const person = { name: "Alice" };
changeObject(person);
console.log(person.name); // "Changed"
```

### 4. Closure Memory Leaks
```javascript
// Potential memory leak
function createHandler() {
    const largeData = new Array(1000000).fill("data");
    
    return function() {
        // Even if we don't use largeData, it's kept in memory
        console.log("Handler called");
    };
}

// Better: only close over what you need
function createHandlerBetter() {
    const largeData = new Array(1000000).fill("data");
    const needed = largeData.length; // Extract only what's needed
    
    return function() {
        console.log(`Handler called, data size: ${needed}`);
    };
}
```

## 🎯 When & Why to Use

### Function Declaration vs Expression vs Arrow
```javascript
// Use function declarations for main functions
function calculateTax(amount, rate) {
    return amount * rate;
}

// Use function expressions when assigning conditionally
const operation = isAddition ? 
    function(a, b) { return a + b; } : 
    function(a, b) { return a - b; };

// Use arrow functions for short callbacks
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);

// Use regular functions when you need 'this' binding
const button = {
    text: "Click me",
    click: function() {
        console.log(this.text); // Need 'this' to refer to button
    }
};
```

### When to Use Each Pattern
```javascript
// Pure functions (no side effects) - preferred
function add(a, b) {
    return a + b; // Only depends on inputs
}

// Functions with side effects - be careful
function logAndAdd(a, b) {
    console.log(`Adding ${a} + ${b}`); // Side effect
    return a + b;
}

// Higher-order functions for reusability
function createValidator(rule) {
    return function(value) {
        return rule(value);
    };
}

const isEmail = createValidator(val => val.includes("@"));
const isLongEnough = createValidator(val => val.length >= 8);
```

## 🏋️ Mini Practice Problems

### Problem 1: Function Variations
```javascript
// Create the same function using all three methods:
// 1. Function declaration
// 2. Function expression  
// 3. Arrow function
// Function should calculate compound interest

// Formula: A = P(1 + r/n)^(nt)
// P = principal, r = rate, n = compounds per year, t = time

// Your implementations here:
function calculateInterest1(principal, rate, compounds, time) {
    // Function declaration
}

const calculateInterest2 = function(principal, rate, compounds, time) {
    // Function expression
};

const calculateInterest3 = (principal, rate, compounds, time) => {
    // Arrow function
};
```

### Problem 2: Higher-Order Function
```javascript
// Create a function that takes an array and a callback
// and returns a new array with the callback applied to each element
// but only if the element passes a test function

function mapIf(array, testFn, mapFn) {
    // Your code here
}

// Test it:
const numbers = [1, 2, 3, 4, 5, 6];
const result = mapIf(
    numbers,
    n => n % 2 === 0,  // test: only even numbers
    n => n * n         // map: square them
);
console.log(result); // Should output: [4, 16, 36]
```

### Problem 3: Function Factory
```javascript
// Create a function that returns customized greeting functions

function createGreeter(greeting, punctuation = "!") {
    // Return a function that greets with the given style
}

// Test it:
const casualGreet = createGreeter("Hey");
const formalGreet = createGreeter("Good morning", ".");
const excitedGreet = createGreeter("Wow", "!!!");

console.log(casualGreet("Alice"));   // "Hey, Alice!"
console.log(formalGreet("Mr. Smith")); // "Good morning, Mr. Smith."
console.log(excitedGreet("everyone")); // "Wow, everyone!!!"
```

### Problem 4: Callback Pattern
```javascript
// Create a function that processes an array with different strategies

function processNumbers(numbers, strategy) {
    // Your code here
}

// Test with different strategies:
const nums = [1, 2, 3, 4, 5];

const sum = processNumbers(nums, (acc, curr) => acc + curr);
const product = processNumbers(nums, (acc, curr) => acc * curr);
const max = processNumbers(nums, (acc, curr) => Math.max(acc, curr));

console.log(sum, product, max); // 15, 120, 5
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between function declaration and function expression?**
- Function declarations are hoisted completely
- Function expressions are not hoisted
- Function declarations create a named function in the current scope

**Q: When should you use arrow functions vs regular functions?**
- Arrow functions: short callbacks, when you don't need `this` binding
- Regular functions: methods, constructors, when you need `this` context

**Q: What is a closure?**
- A function that has access to variables from its outer scope
- Even after the outer function has returned
- Creates a "persistent scope"

**Q: Explain call(), apply(), and bind()**
- `call()`: invokes function with specific `this` and individual arguments
- `apply()`: invokes function with specific `this` and array of arguments
- `bind()`: creates new function with specific `this` (doesn't invoke)

### 🏢 Asked at Companies:
- **Google**: "Implement a function that can be called with any number of arguments"
- **Facebook**: "What's the difference between `function` and `=>`?"
- **Amazon**: "Create a function that remembers its previous calls"
- **Netflix**: "Explain function hoisting with examples"

## 📊 Function Types Summary

```
Function Types
├── Declaration
│   ├── Hoisted ✅
│   ├── Named ✅
│   └── Block scoped (in strict mode)
├── Expression
│   ├── Not hoisted ❌
│   ├── Can be anonymous
│   └── Can be assigned conditionally
└── Arrow
    ├── Concise syntax ✅
    ├── No 'this' binding ❌
    ├── No 'arguments' object ❌
    └── Cannot be constructor ❌
```

## 🎯 Key Takeaways

1. **Use function declarations for main functions (hoisting benefit)**
2. **Use arrow functions for short callbacks and array methods**
3. **Regular functions when you need `this` context**
4. **Functions are first-class citizens - can be passed around**
5. **Understand the difference between call, apply, and bind**
6. **Be careful with arrow functions and `this` binding**
7. **Use default parameters instead of checking for undefined**

---

**Previous Chapter**: [← Control Flow](./03-control-flow.md)  
**Next Chapter**: [Scope, Hoisting & TDZ →](./05-scope-hoisting.md)

**Practice**: Try creating functions using all three methods and experiment with callbacks!