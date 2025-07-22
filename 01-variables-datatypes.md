# 📝 Chapter 1: Variables & Data Types

> Understanding the foundation of JavaScript: how to store and work with different types of data.

## 📖 Plain English Explanation

Variables are like labeled boxes where you store information. Data types are the different kinds of information you can store - like numbers, text, true/false values, and more complex structures.

Think of it like organizing your desk:
- **Variables** = labeled drawers
- **Data Types** = what kind of stuff goes in each drawer (pens, papers, etc.)

## 🔧 Variable Declarations

### Modern Way (ES6+)

```javascript
// const - for values that won't change
const userName = "Alice";
const PI = 3.14159;

// let - for values that might change
let age = 25;
let isLoggedIn = false;

// ❌ Avoid var in modern JavaScript
var oldStyle = "Don't use this";
```

### 💡 Key Differences

```javascript
// const - Cannot be reassigned
const name = "John";
// name = "Jane"; // ❌ TypeError!

// let - Can be reassigned
let score = 100;
score = 150; // ✅ Works fine

// var - Function scoped (causes issues)
if (true) {
    var x = 1;
    let y = 2;
}
console.log(x); // ✅ 1 (var leaks out)
// console.log(y); // ❌ ReferenceError (let is block-scoped)
```

## 🎯 JavaScript Data Types

### Primitive Types (7 types)

#### 1. Number
```javascript
const integer = 42;
const decimal = 3.14;
const negative = -10;
const scientific = 2e3; // 2000
const infinity = Infinity;
const notANumber = NaN;

// Type checking
console.log(typeof 42); // "number"
console.log(Number.isInteger(42)); // true
console.log(Number.isNaN(NaN)); // true
```

#### 2. String
```javascript
const singleQuotes = 'Hello';
const doubleQuotes = "World";
const templateLiteral = `Hello ${singleQuotes}!`; // Template literals

// String methods
const text = "JavaScript";
console.log(text.length); // 10
console.log(text.toUpperCase()); // "JAVASCRIPT"
console.log(text.slice(0, 4)); // "Java"
```

#### 3. Boolean
```javascript
const isTrue = true;
const isFalse = false;

// Truthy and Falsy values
console.log(Boolean(1)); // true
console.log(Boolean(0)); // false
console.log(Boolean("")); // false
console.log(Boolean("hello")); // true
```

#### 4. Undefined
```javascript
let notAssigned;
console.log(notAssigned); // undefined
console.log(typeof notAssigned); // "undefined"
```

#### 5. Null
```javascript
const empty = null;
console.log(empty); // null
console.log(typeof null); // "object" (this is a known bug!)
```

#### 6. Symbol (ES6)
```javascript
const sym1 = Symbol('description');
const sym2 = Symbol('description');
console.log(sym1 === sym2); // false (always unique)
```

#### 7. BigInt (ES2020)
```javascript
const bigNumber = 123456789012345678901234567890n;
const anotherBig = BigInt("123456789012345678901234567890");
console.log(typeof bigNumber); // "bigint"
```

### Non-Primitive Types (Reference Types)

#### Object
```javascript
const person = {
    name: "Alice",
    age: 30,
    isStudent: false
};

// Arrays are objects too!
const numbers = [1, 2, 3, 4, 5];
console.log(typeof numbers); // "object"
console.log(Array.isArray(numbers)); // true

// Functions are objects too!
function greet() {
    return "Hello!";
}
console.log(typeof greet); // "function"
```

## 🔍 Type Checking & Conversion

### Checking Types
```javascript
const value = 42;

// typeof operator
console.log(typeof value); // "number"

// More specific checks
console.log(Array.isArray([])); // true
console.log(Number.isInteger(42)); // true
console.log(Object.prototype.toString.call(value)); // "[object Number]"
```

### Type Conversion
```javascript
// Explicit conversion
const str = "123";
const num = Number(str); // 123
const bool = Boolean(1); // true

// Implicit conversion (coercion)
console.log("5" + 3); // "53" (string concatenation)
console.log("5" - 3); // 2 (numeric subtraction)
console.log("5" * 3); // 15 (numeric multiplication)
```

## ⚠️ Common Pitfalls

### 1. typeof null Bug
```javascript
console.log(typeof null); // "object" (not "null"!)

// Correct way to check for null
const value = null;
if (value === null) {
    console.log("It's null!");
}
```

### 2. NaN Comparison
```javascript
const result = 0 / 0; // NaN
console.log(result === NaN); // false (NaN is not equal to anything!)
console.log(Number.isNaN(result)); // true (correct way)
```

### 3. Floating Point Precision
```javascript
console.log(0.1 + 0.2); // 0.30000000000000004 (not 0.3!)

// Solution: use toFixed() or compare with epsilon
const sum = 0.1 + 0.2;
console.log(sum.toFixed(1)); // "0.3"
console.log(Math.abs(sum - 0.3) < Number.EPSILON); // true
```

### 4. Variable Hoisting with var
```javascript
console.log(x); // undefined (not error!)
var x = 5;

// What actually happens:
// var x; // hoisted to top
// console.log(x); // undefined
// x = 5;
```

## 🎯 When & Why to Use

### Use `const` by default
```javascript
// For values that won't change
const API_URL = "https://api.example.com";
const user = { name: "Alice" }; // Object reference won't change
```

### Use `let` when you need to reassign
```javascript
// For counters, flags, etc.
let counter = 0;
for (let i = 0; i < 5; i++) {
    counter += i;
}
```

### Choose appropriate data types
```javascript
// Use numbers for calculations
const price = 29.99;
const quantity = 3;
const total = price * quantity;

// Use strings for text
const message = `Total: $${total.toFixed(2)}`;

// Use booleans for flags
const isDiscountApplied = total > 50;
```

## 🏋️ Mini Practice Problems

### Problem 1: Type Detective
```javascript
// What will these log?
console.log(typeof "42");
console.log(typeof 42);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof []);
console.log(typeof {});

// Try to guess before running!
```

### Problem 2: Fix the Bug
```javascript
// This code has issues. Can you fix them?
var name = "John";
if (true) {
    var name = "Jane";
}
console.log(name); // Should this be "John" or "Jane"?

// Rewrite using const/let appropriately
```

### Problem 3: Type Conversion Challenge
```javascript
// Predict the output
console.log("5" + 3 + 2);
console.log(3 + 2 + "5");
console.log("5" - 3);
console.log("5" * "3");
console.log("hello" - 3);
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `let`, `const`, and `var`?**
- `var`: Function-scoped, hoisted, can be redeclared
- `let`: Block-scoped, hoisted but in TDZ, cannot be redeclared
- `const`: Block-scoped, hoisted but in TDZ, cannot be reassigned

**Q: Why does `typeof null` return "object"?**
- It's a historical bug in JavaScript that can't be fixed due to backward compatibility

**Q: What are falsy values in JavaScript?**
- `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`

**Q: How do you check if a variable is an array?**
- Use `Array.isArray(variable)`, not `typeof` (which returns "object")

### 🏢 Asked at Companies:
- **Google**: "Explain type coercion with examples"
- **Facebook**: "What happens when you add a string and a number?"
- **Amazon**: "How would you safely check if a variable is null?"

## 📊 Visual Memory Aid

```
JavaScript Data Types
├── Primitive (Stored by Value)
│   ├── Number (42, 3.14, NaN, Infinity)
│   ├── String ("hello", 'world', `template`)
│   ├── Boolean (true, false)
│   ├── Undefined (declared but not assigned)
│   ├── Null (intentionally empty)
│   ├── Symbol (unique identifier)
│   └── BigInt (large integers)
└── Non-Primitive (Stored by Reference)
    └── Object (objects, arrays, functions)
```

## 🎯 Key Takeaways

1. **Always use `const` by default, `let` when you need to reassign**
2. **JavaScript has 7 primitive types + objects**
3. **`typeof` has quirks - know them for interviews**
4. **Type coercion can be tricky - be explicit when possible**
5. **Understand the difference between primitive and reference types**

---

**Next Chapter**: [Operators & Expressions →](./02-operators-expressions.md)

**Practice**: Try the problems above and experiment with different data types in your browser console!