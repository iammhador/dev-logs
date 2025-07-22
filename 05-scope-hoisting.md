# 🔍 Chapter 5: Scope, Hoisting & TDZ

> Understand how JavaScript manages variable access, memory, and execution context.

## 📖 Plain English Explanation

Think of scope like rooms in a house:
- **Global scope** = the main living area (everyone can access)
- **Function scope** = private bedrooms (only family members can enter)
- **Block scope** = closets (only the person in that room can access)

Hoisting is like JavaScript "reading ahead" - it sees all your variable declarations before running your code, but not their values.

## 🏠 Understanding Scope

### Global Scope
```javascript
// Global scope - accessible everywhere
const globalVar = "I'm global!";
var alsoGlobal = "Me too!";

function testGlobal() {
    console.log(globalVar); // ✅ Can access global variables
    console.log(alsoGlobal); // ✅ Can access global variables
}

testGlobal();
console.log(globalVar); // ✅ Accessible outside functions

// Be careful - implicit globals (avoid!)
function createImplicitGlobal() {
    implicitGlobal = "Oops, I'm global!"; // No var/let/const = global!
}

createImplicitGlobal();
console.log(implicitGlobal); // "Oops, I'm global!"
```

### Function Scope
```javascript
function outerFunction() {
    const outerVar = "I'm in outer function";
    
    function innerFunction() {
        const innerVar = "I'm in inner function";
        console.log(outerVar); // ✅ Can access outer scope
        console.log(innerVar); // ✅ Can access own scope
    }
    
    innerFunction();
    console.log(outerVar); // ✅ Can access own scope
    // console.log(innerVar); // ❌ ReferenceError!
}

outerFunction();
// console.log(outerVar); // ❌ ReferenceError!
```

### Block Scope (ES6+)
```javascript
// let and const are block-scoped
if (true) {
    let blockScoped = "I'm block scoped";
    const alsoBlockScoped = "Me too!";
    var functionScoped = "I'm function scoped";
    
    console.log(blockScoped); // ✅ Works inside block
}

// console.log(blockScoped); // ❌ ReferenceError!
// console.log(alsoBlockScoped); // ❌ ReferenceError!
console.log(functionScoped); // ✅ var leaks out of blocks!

// Same with loops
for (let i = 0; i < 3; i++) {
    // i is only accessible here
}
// console.log(i); // ❌ ReferenceError!

// But var leaks:
for (var j = 0; j < 3; j++) {
    // j will be accessible outside
}
console.log(j); // ✅ 3 (leaked out!)
```

### Lexical Scope (Static Scope)
```javascript
const globalName = "Global Alice";

function outer() {
    const outerName = "Outer Bob";
    
    function inner() {
        const innerName = "Inner Charlie";
        
        // Scope chain: inner → outer → global
        console.log(innerName);  // "Inner Charlie"
        console.log(outerName);  // "Outer Bob"
        console.log(globalName); // "Global Alice"
    }
    
    return inner;
}

const innerFunc = outer();
innerFunc(); // Still has access to outer scope!
```

## 🎈 Hoisting Explained

### Variable Hoisting with var
```javascript
// What you write:
console.log(myVar); // undefined (not error!)
var myVar = "Hello";
console.log(myVar); // "Hello"

// What JavaScript actually does:
// var myVar; // Declaration hoisted to top
// console.log(myVar); // undefined
// myVar = "Hello"; // Assignment stays in place
// console.log(myVar); // "Hello"
```

### Function Hoisting
```javascript
// Function declarations are fully hoisted
console.log(hoistedFunction()); // "I'm hoisted!"

function hoistedFunction() {
    return "I'm hoisted!";
}

// Function expressions are NOT hoisted
// console.log(notHoisted()); // TypeError!

var notHoisted = function() {
    return "I'm not hoisted!";
};
```

### let and const Hoisting (Temporal Dead Zone)
```javascript
// let and const are hoisted but in "Temporal Dead Zone"
console.log(typeof myVar); // "undefined"
console.log(typeof myLet); // ReferenceError!

var myVar = "var variable";
let myLet = "let variable";

// Example of TDZ
function demonstrateTDZ() {
    console.log(x); // ReferenceError! (TDZ)
    
    let x = "I'm in TDZ until this line";
    console.log(x); // "I'm in TDZ until this line"
}
```

## ⚡ Temporal Dead Zone (TDZ)

### What is TDZ?
```javascript
// TDZ exists from start of scope until declaration
function showTDZ() {
    // TDZ starts here for 'temporal'
    
    console.log(typeof temporal); // ReferenceError!
    
    // Still in TDZ
    if (true) {
        console.log(typeof temporal); // ReferenceError!
        
        let temporal = "Now I exist!"; // TDZ ends here
        console.log(temporal); // "Now I exist!"
    }
}

showTDZ();
```

### TDZ with const
```javascript
// const must be initialized when declared
// const uninitializedConst; // SyntaxError!

const properConst = "I'm properly initialized";

// const cannot be reassigned
// properConst = "New value"; // TypeError!
```

### TDZ in Loops
```javascript
// Classic var problem
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log("var:", i); // 3, 3, 3 (all reference same i)
    }, 100);
}

// let creates new binding each iteration
for (let j = 0; j < 3; j++) {
    setTimeout(() => {
        console.log("let:", j); // 0, 1, 2 (each has own j)
    }, 100);
}
```

## 🔗 Scope Chain

### How Scope Chain Works
```javascript
const global = "global";

function level1() {
    const level1Var = "level1";
    
    function level2() {
        const level2Var = "level2";
        
        function level3() {
            const level3Var = "level3";
            
            // Scope chain: level3 → level2 → level1 → global
            console.log(level3Var); // Found in level3
            console.log(level2Var); // Found in level2
            console.log(level1Var); // Found in level1
            console.log(global);    // Found in global
            // console.log(nonExistent); // ReferenceError!
        }
        
        level3();
    }
    
    level2();
}

level1();
```

### Variable Shadowing
```javascript
const name = "Global";

function outer() {
    const name = "Outer";
    
    function inner() {
        const name = "Inner";
        console.log(name); // "Inner" (shadows outer scopes)
    }
    
    inner();
    console.log(name); // "Outer" (shadows global)
}

outer();
console.log(name); // "Global"
```

## 🎯 Practical Examples

### Module Pattern with Scope
```javascript
// Using IIFE to create private scope
const calculator = (function() {
    // Private variables
    let result = 0;
    
    // Private function
    function log(operation, value) {
        console.log(`${operation}: ${value}, result: ${result}`);
    }
    
    // Public API
    return {
        add(value) {
            result += value;
            log('add', value);
            return this; // For chaining
        },
        
        subtract(value) {
            result -= value;
            log('subtract', value);
            return this;
        },
        
        getResult() {
            return result;
        },
        
        reset() {
            result = 0;
            log('reset', 0);
            return this;
        }
    };
})();

// Usage
calculator.add(10).subtract(3).add(5);
console.log(calculator.getResult()); // 12

// Private variables are not accessible
// console.log(calculator.result); // undefined
```

### Closure with Scope
```javascript
function createCounter(initialValue = 0) {
    let count = initialValue;
    
    return {
        increment() {
            return ++count;
        },
        
        decrement() {
            return --count;
        },
        
        getValue() {
            return count;
        },
        
        reset() {
            count = initialValue;
            return count;
        }
    };
}

const counter1 = createCounter(5);
const counter2 = createCounter(10);

console.log(counter1.increment()); // 6
console.log(counter2.increment()); // 11
console.log(counter1.getValue());  // 6
console.log(counter2.getValue());  // 11
```

## ⚠️ Common Pitfalls

### 1. var in Loops
```javascript
// Problem: All callbacks reference same variable
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("var i:", i); // 3, 3, 3
    }, 100);
}

// Solution 1: Use let
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("let i:", i); // 0, 1, 2
    }, 100);
}

// Solution 2: IIFE with var
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log("IIFE i:", index); // 0, 1, 2
        }, 100);
    })(i);
}
```

### 2. Hoisting Confusion
```javascript
// Confusing hoisting behavior
var x = 1;

function confusing() {
    console.log(x); // undefined (not 1!)
    
    if (false) {
        var x = 2; // This declaration is hoisted!
    }
}

confusing();

// What actually happens:
function confusing() {
    var x; // Hoisted declaration
    console.log(x); // undefined
    
    if (false) {
        x = 2; // Assignment (never executed)
    }
}
```

### 3. TDZ Gotchas
```javascript
// TDZ with default parameters
function tdz(a = b, b = 2) {
    return a + b;
}

// tdz(); // ReferenceError! b is in TDZ when a is initialized

// Correct order
function fixed(b = 2, a = b) {
    return a + b;
}

console.log(fixed()); // 4
```

### 4. Block Scope Confusion
```javascript
// Mixing let and var
function mixedScope() {
    if (true) {
        var varVariable = "var";
        let letVariable = "let";
    }
    
    console.log(varVariable); // "var" (function scoped)
    // console.log(letVariable); // ReferenceError! (block scoped)
}

mixedScope();
```

## 🎯 When & Why to Use

### Choose the Right Declaration
```javascript
// Use const by default
const API_URL = "https://api.example.com";
const users = []; // Reference won't change

// Use let when you need to reassign
let currentUser = null;
let counter = 0;

// Avoid var in modern JavaScript
// var oldStyle = "Don't use this";
```

### Scope Best Practices
```javascript
// Keep variables in smallest possible scope
function processData(data) {
    // Don't declare everything at the top
    
    if (data.length === 0) {
        return [];
    }
    
    // Declare variables when needed
    const processed = [];
    
    for (let i = 0; i < data.length; i++) {
        const item = data[i]; // Block scoped
        
        if (item.isValid) {
            const transformed = transform(item); // Even smaller scope
            processed.push(transformed);
        }
    }
    
    return processed;
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Hoisting Quiz
```javascript
// Predict the output of each console.log

console.log(a); // ?
console.log(b); // ?
// console.log(c); // ?

var a = 1;
let b = 2;
const c = 3;

function hoistingTest() {
    console.log(a); // ?
    console.log(b); // ?
    
    var a = 10;
    let b = 20;
}

hoistingTest();
```

### Problem 2: Scope Chain Challenge
```javascript
// What will this output?
const x = 'global';

function outer() {
    const x = 'outer';
    
    function inner() {
        console.log(x); // ?
    }
    
    return inner;
}

const fn = outer();
fn();
```

### Problem 3: Loop Scope Fix
```javascript
// Fix this code so it prints 0, 1, 2 instead of 3, 3, 3
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 100);
}

// Provide at least 2 different solutions
```

### Problem 4: Create a Private Counter
```javascript
// Create a function that returns an object with methods
// to increment, decrement, and get the current count
// The count should be private (not accessible from outside)

function createPrivateCounter(start = 0) {
    // Your code here
}

const counter = createPrivateCounter(5);
console.log(counter.increment()); // 6
console.log(counter.increment()); // 7
console.log(counter.decrement()); // 6
console.log(counter.getCount());  // 6
// console.log(counter.count); // Should be undefined
```

### Problem 5: TDZ Understanding
```javascript
// Explain why this code throws an error and how to fix it

function example() {
    console.log(typeof myVar); // Works
    console.log(typeof myLet); // ReferenceError - why?
    
    var myVar = "var";
    let myLet = "let";
}

example();
```

## 💼 Interview Notes

### Common Questions:

**Q: What is hoisting?**
- JavaScript moves variable and function declarations to the top of their scope
- Only declarations are hoisted, not initializations
- `var` is hoisted and initialized with `undefined`
- `let`/`const` are hoisted but in Temporal Dead Zone

**Q: What is the Temporal Dead Zone?**
- Period between entering scope and variable declaration
- Accessing variable in TDZ throws ReferenceError
- Exists for `let`, `const`, and `class` declarations

**Q: Difference between function and block scope?**
- Function scope: variables accessible throughout entire function
- Block scope: variables accessible only within `{}` block
- `var` is function-scoped, `let`/`const` are block-scoped

**Q: What is the scope chain?**
- JavaScript looks for variables starting from current scope
- If not found, looks in outer scope, then outer's outer, etc.
- Continues until global scope or ReferenceError

### 🏢 Asked at Companies:
- **Google**: "Explain what happens when you declare a variable with `var` vs `let`"
- **Facebook**: "What is the Temporal Dead Zone and why does it exist?"
- **Amazon**: "Fix this loop so each timeout prints a different number"
- **Microsoft**: "Explain the difference between function and block scope"
- **Netflix**: "What is hoisting and how does it work with functions?"

## 📊 Scope & Hoisting Summary

```
Variable Declarations
├── var
│   ├── Function scoped
│   ├── Hoisted with undefined
│   ├── Can be redeclared
│   └── Can be reassigned
├── let
│   ├── Block scoped
│   ├── Hoisted but in TDZ
│   ├── Cannot be redeclared
│   └── Can be reassigned
└── const
    ├── Block scoped
    ├── Hoisted but in TDZ
    ├── Cannot be redeclared
    ├── Cannot be reassigned
    └── Must be initialized
```

## 🎯 Key Takeaways

1. **Use `const` by default, `let` when you need to reassign**
2. **Avoid `var` in modern JavaScript**
3. **Understand hoisting to avoid bugs**
4. **Be aware of Temporal Dead Zone with `let`/`const`**
5. **Keep variables in the smallest possible scope**
6. **Use block scope to prevent variable leaking**
7. **Understand scope chain for debugging**

---

**Previous Chapter**: [← Functions Deep Dive](./04-functions.md)  
**Next Chapter**: [Closures Explained →](./06-closures.md)

**Practice**: Try the hoisting quiz and experiment with different scoping scenarios!