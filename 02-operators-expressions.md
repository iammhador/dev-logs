# ⚡ Chapter 2: Operators & Expressions

> Master JavaScript operators and learn how to build complex expressions that power your applications.

## 📖 Plain English Explanation

Operators are like tools that perform actions on your data. Think of them as:
- **Arithmetic operators** = calculator buttons (+, -, *, /)
- **Comparison operators** = judges that compare things (>, <, ===)
- **Logical operators** = decision makers (&&, ||, !)
- **Assignment operators** = ways to store results (=, +=, -=)

Expressions are combinations of values, variables, and operators that produce a result.

## 🔢 Arithmetic Operators

### Basic Math Operations
```javascript
const a = 10;
const b = 3;

console.log(a + b);  // 13 (Addition)
console.log(a - b);  // 7  (Subtraction)
console.log(a * b);  // 30 (Multiplication)
console.log(a / b);  // 3.333... (Division)
console.log(a % b);  // 1  (Modulus - remainder)
console.log(a ** b); // 1000 (Exponentiation - ES2016)
```

### Increment & Decrement
```javascript
let counter = 5;

// Pre-increment (increment first, then use)
console.log(++counter); // 6 (counter is now 6)

// Post-increment (use first, then increment)
console.log(counter++); // 6 (shows 6, but counter becomes 7)
console.log(counter);   // 7

// Pre-decrement
console.log(--counter); // 6 (counter is now 6)

// Post-decrement
console.log(counter--); // 6 (shows 6, but counter becomes 5)
console.log(counter);   // 5
```

### Unary Plus & Minus
```javascript
const str = "42";
const num = +str;        // 42 (converts string to number)
const negative = -num;   // -42

console.log(typeof str); // "string"
console.log(typeof num); // "number"
```

## 📊 Comparison Operators

### Equality Operators
```javascript
// Strict equality (recommended)
console.log(5 === 5);     // true
console.log(5 === "5");   // false (different types)
console.log(null === undefined); // false

// Loose equality (avoid in most cases)
console.log(5 == "5");    // true (type coercion happens)
console.log(null == undefined); // true
console.log(0 == false);  // true
```

### Inequality Operators
```javascript
console.log(5 !== "5");   // true (strict inequality)
console.log(5 != "5");    // false (loose inequality)
```

### Relational Operators
```javascript
const x = 10;
const y = 5;

console.log(x > y);   // true
console.log(x < y);   // false
console.log(x >= 10); // true
console.log(y <= 5);  // true

// String comparison (lexicographical)
console.log("apple" < "banana"); // true
console.log("10" < "9");         // true (string comparison!)
```

## 🧠 Logical Operators

### AND (&&) - All conditions must be true
```javascript
const age = 25;
const hasLicense = true;

// Both conditions must be true
if (age >= 18 && hasLicense) {
    console.log("Can drive!");
}

// Short-circuit evaluation
const user = { name: "Alice" };
user.profile && console.log(user.profile.bio); // Won't error if profile is undefined
```

### OR (||) - At least one condition must be true
```javascript
const isWeekend = false;
const isHoliday = true;

// Either condition can be true
if (isWeekend || isHoliday) {
    console.log("No work today!");
}

// Default values using ||
const username = user.name || "Guest";
const config = userConfig || defaultConfig;
```

### NOT (!) - Inverts boolean value
```javascript
const isLoggedIn = false;

if (!isLoggedIn) {
    console.log("Please log in");
}

// Double NOT for boolean conversion
console.log(!!"hello"); // true
console.log(!!0);       // false
console.log(!!"");      // false
```

### Nullish Coalescing (??) - ES2020
```javascript
const value1 = null;
const value2 = undefined;
const value3 = 0;
const value4 = "";
const fallback = "default";

// ?? only checks for null/undefined (not other falsy values)
console.log(value1 ?? fallback); // "default"
console.log(value2 ?? fallback); // "default"
console.log(value3 ?? fallback); // 0 (not "default"!)
console.log(value4 ?? fallback); // "" (not "default"!)

// Compare with ||
console.log(value3 || fallback); // "default"
console.log(value4 || fallback); // "default"
```

## 📝 Assignment Operators

### Basic Assignment
```javascript
let x = 10;
let y = x; // y gets the value of x
```

### Compound Assignment
```javascript
let score = 100;

score += 50;  // score = score + 50 (150)
score -= 20;  // score = score - 20 (130)
score *= 2;   // score = score * 2 (260)
score /= 4;   // score = score / 4 (65)
score %= 10;  // score = score % 10 (5)
score **= 2;  // score = score ** 2 (25)

// String concatenation
let message = "Hello";
message += " World"; // "Hello World"
```

### Logical Assignment (ES2021)
```javascript
let user = { name: "Alice" };

// Logical AND assignment
user.name &&= user.name.toUpperCase(); // Only if name exists

// Logical OR assignment
user.email ||= "default@example.com"; // Only if email is falsy

// Nullish coalescing assignment
user.age ??= 18; // Only if age is null/undefined
```

## 🔀 Conditional (Ternary) Operator

### Basic Ternary
```javascript
const age = 20;
const status = age >= 18 ? "adult" : "minor";
console.log(status); // "adult"

// Equivalent to:
let status2;
if (age >= 18) {
    status2 = "adult";
} else {
    status2 = "minor";
}
```

### Nested Ternary (use sparingly)
```javascript
const score = 85;
const grade = score >= 90 ? "A" : 
              score >= 80 ? "B" : 
              score >= 70 ? "C" : 
              score >= 60 ? "D" : "F";
console.log(grade); // "B"
```

### Ternary for Function Calls
```javascript
const isLoggedIn = true;
const action = isLoggedIn ? showDashboard() : showLoginForm();

// Or for conditional execution
isLoggedIn ? console.log("Welcome back!") : console.log("Please log in");
```

## 🎯 Operator Precedence & Associativity

### Precedence (Order of Operations)
```javascript
// Multiplication before addition
console.log(2 + 3 * 4); // 14 (not 20)

// Use parentheses to override
console.log((2 + 3) * 4); // 20

// Complex expression
const result = 10 + 5 * 2 ** 3 / 4 - 1;
// Order: 2**3 = 8, 5*8 = 40, 40/4 = 10, 10+10 = 20, 20-1 = 19
console.log(result); // 19
```

### Associativity (Left-to-Right vs Right-to-Left)
```javascript
// Left-to-right (most operators)
console.log(10 - 5 - 2); // 3 (not 7)
// Evaluated as: (10 - 5) - 2 = 5 - 2 = 3

// Right-to-left (assignment, exponentiation)
let a, b, c;
a = b = c = 5; // All get value 5
// Evaluated as: a = (b = (c = 5))

console.log(2 ** 3 ** 2); // 512 (not 64)
// Evaluated as: 2 ** (3 ** 2) = 2 ** 9 = 512
```

## ⚠️ Common Pitfalls

### 1. Floating Point Arithmetic
```javascript
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false!

// Solution: Use epsilon comparison
const epsilon = Number.EPSILON;
console.log(Math.abs((0.1 + 0.2) - 0.3) < epsilon); // true

// Or round to specific decimal places
console.log(+(0.1 + 0.2).toFixed(1)); // 0.3
```

### 2. Type Coercion with ==
```javascript
// Unexpected results with ==
console.log("" == 0);     // true
console.log(false == 0);  // true
console.log(null == 0);   // false (but null == undefined is true)
console.log(" " == 0);    // true

// Always use === for safety
console.log("" === 0);    // false
console.log(false === 0); // false
```

### 3. Increment/Decrement Confusion
```javascript
let i = 5;
const a = i++; // a = 5, i = 6
const b = ++i; // i = 7, b = 7

console.log(a, b, i); // 5, 7, 7
```

### 4. Logical Operator Short-Circuiting
```javascript
const user = null;

// This will throw an error!
// console.log(user.name && user.name.length);

// Correct way:
console.log(user && user.name && user.name.length);

// Or use optional chaining (ES2020)
console.log(user?.name?.length);
```

## 🎯 When & Why to Use

### Use Strict Equality (===)
```javascript
// Always prefer === over ==
if (userInput === "admin") {
    // Safe comparison
}
```

### Use Logical Operators for Defaults
```javascript
// Set default values
const theme = userPreference || "light";
const timeout = config.timeout ?? 5000;
```

### Use Ternary for Simple Conditions
```javascript
// Good: Simple condition
const message = isOnline ? "Online" : "Offline";

// Bad: Complex logic (use if/else instead)
const result = condition1 ? 
    (condition2 ? value1 : value2) : 
    (condition3 ? value3 : value4);
```

## 🏋️ Mini Practice Problems

### Problem 1: Operator Precedence
```javascript
// What will these expressions evaluate to?
console.log(2 + 3 * 4);
console.log((2 + 3) * 4);
console.log(2 ** 3 ** 2);
console.log(10 - 5 - 2);
console.log(true + false);
console.log("5" + 3 + 2);
console.log(3 + 2 + "5");
```

### Problem 2: Comparison Challenges
```javascript
// Predict the output
console.log("10" > "9");
console.log("10" > 9);
console.log(null == undefined);
console.log(null === undefined);
console.log(NaN === NaN);
console.log(0 === -0);
```

### Problem 3: Logical Operators
```javascript
// What gets logged?
const a = "hello";
const b = "";
const c = null;
const d = 0;

console.log(a || b || c);
console.log(a && b && c);
console.log(c ?? d ?? a);
console.log(!a && !b);
console.log(!!a && !!b);
```

### Problem 4: Build a Grade Calculator
```javascript
// Create a function that takes a score and returns a grade
// Use ternary operators and comparison operators
// 90+ = A, 80-89 = B, 70-79 = C, 60-69 = D, <60 = F

function calculateGrade(score) {
    // Your code here
}

// Test cases
console.log(calculateGrade(95)); // "A"
console.log(calculateGrade(85)); // "B"
console.log(calculateGrade(75)); // "C"
console.log(calculateGrade(65)); // "D"
console.log(calculateGrade(55)); // "F"
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `==` and `===`?**
- `==` performs type coercion, `===` checks both value and type
- Always use `===` unless you specifically need type coercion

**Q: Explain operator precedence in JavaScript**
- Operators have different priorities (*, / before +, -)
- Use parentheses to make intentions clear
- Assignment is right-to-left associative

**Q: What is short-circuit evaluation?**
- `&&` stops at first falsy value
- `||` stops at first truthy value
- Useful for conditional execution and default values

**Q: What's the difference between `||` and `??`?**
- `||` checks for any falsy value (0, "", false, null, undefined)
- `??` only checks for null and undefined

### 🏢 Asked at Companies:
- **Microsoft**: "What does `0.1 + 0.2 === 0.3` return and why?"
- **Netflix**: "Explain the difference between `++i` and `i++`"
- **Spotify**: "How would you safely access a nested property?"

## 📊 Operator Precedence Table (High to Low)

```
1. () [] .           // Grouping, Member access
2. ++ -- ! + -       // Unary operators
3. **                // Exponentiation
4. * / %             // Multiplication, Division, Modulus
5. + -               // Addition, Subtraction
6. < <= > >=         // Relational
7. == != === !==     // Equality
8. &&                // Logical AND
9. ||                // Logical OR
10. ? :              // Conditional (ternary)
11. = += -= *= /=    // Assignment
```

## 🎯 Key Takeaways

1. **Always use `===` instead of `==` for comparisons**
2. **Understand operator precedence to avoid bugs**
3. **Use logical operators for defaults and short-circuiting**
4. **Be careful with floating-point arithmetic**
5. **Ternary operator is great for simple conditions**
6. **`??` is better than `||` for null/undefined checks**

---

**Previous Chapter**: [← Variables & Data Types](./01-variables-datatypes.md)  
**Next Chapter**: [Control Flow →](./03-control-flow.md)

**Practice**: Try the problems above and experiment with different operator combinations!