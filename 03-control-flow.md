# 🔀 Chapter 3: Control Flow

> Master the art of making decisions and repeating actions in your JavaScript programs.

## 📖 Plain English Explanation

Control flow is how your program makes decisions and repeats actions. Think of it like:
- **Conditional statements** = traffic lights (if green, go; if red, stop)
- **Loops** = assembly lines (repeat the same action until done)
- **Switch statements** = elevator buttons (different action for each floor)

Your code doesn't just run top to bottom - it can branch, loop, and jump based on conditions!

## 🚦 Conditional Statements

### if Statement
```javascript
const age = 18;

if (age >= 18) {
    console.log("You can vote!");
}

// Single line (no braces needed, but not recommended)
if (age >= 18) console.log("You can vote!");
```

### if...else Statement
```javascript
const temperature = 25;

if (temperature > 30) {
    console.log("It's hot outside!");
} else {
    console.log("It's not too hot.");
}
```

### if...else if...else Chain
```javascript
const score = 85;

if (score >= 90) {
    console.log("Grade: A");
} else if (score >= 80) {
    console.log("Grade: B");
} else if (score >= 70) {
    console.log("Grade: C");
} else if (score >= 60) {
    console.log("Grade: D");
} else {
    console.log("Grade: F");
}
```

### Nested if Statements
```javascript
const weather = "sunny";
const temperature = 25;

if (weather === "sunny") {
    if (temperature > 20) {
        console.log("Perfect day for a picnic!");
    } else {
        console.log("Sunny but a bit cold.");
    }
} else {
    console.log("Maybe stay indoors.");
}
```

## 🔄 Switch Statement

### Basic Switch
```javascript
const day = "monday";

switch (day) {
    case "monday":
        console.log("Start of the work week");
        break;
    case "tuesday":
        console.log("Tuesday blues");
        break;
    case "wednesday":
        console.log("Hump day!");
        break;
    case "thursday":
        console.log("Almost there");
        break;
    case "friday":
        console.log("TGIF!");
        break;
    case "saturday":
    case "sunday":
        console.log("Weekend!");
        break;
    default:
        console.log("Invalid day");
}
```

### Switch with Fall-through
```javascript
const month = "february";
let days;

switch (month) {
    case "january":
    case "march":
    case "may":
    case "july":
    case "august":
    case "october":
    case "december":
        days = 31;
        break;
    case "april":
    case "june":
    case "september":
    case "november":
        days = 30;
        break;
    case "february":
        days = 28; // Simplified (not accounting for leap years)
        break;
    default:
        days = 0;
        console.log("Invalid month");
}

console.log(`${month} has ${days} days`);
```

### Switch with Expressions (Modern Pattern)
```javascript
const getSeasonMessage = (month) => {
    switch (month) {
        case "december":
        case "january":
        case "february":
            return "Winter is here! ❄️";
        case "march":
        case "april":
        case "may":
            return "Spring has arrived! 🌸";
        case "june":
        case "july":
        case "august":
            return "Summer time! ☀️";
        case "september":
        case "october":
        case "november":
            return "Autumn leaves! 🍂";
        default:
            return "Invalid month";
    }
};

console.log(getSeasonMessage("july")); // "Summer time! ☀️"
```

## 🔁 Loops

### for Loop
```javascript
// Basic for loop
for (let i = 0; i < 5; i++) {
    console.log(`Iteration ${i}`);
}

// Counting backwards
for (let i = 10; i >= 0; i--) {
    console.log(`Countdown: ${i}`);
}

// Custom increment
for (let i = 0; i <= 20; i += 2) {
    console.log(`Even number: ${i}`);
}

// Multiple variables
for (let i = 0, j = 10; i < 5; i++, j--) {
    console.log(`i: ${i}, j: ${j}`);
}
```

### while Loop
```javascript
let count = 0;

while (count < 5) {
    console.log(`Count is: ${count}`);
    count++;
}

// Reading user input (conceptual)
let userInput = "";
while (userInput !== "quit") {
    // userInput = prompt("Enter command (or 'quit' to exit):");
    console.log(`You entered: ${userInput}`);
    break; // Prevent infinite loop in this example
}
```

### do...while Loop
```javascript
let number;

do {
    // This runs at least once
    number = Math.floor(Math.random() * 10) + 1;
    console.log(`Generated number: ${number}`);
} while (number !== 7);

console.log("Found lucky number 7!");
```

### for...in Loop (Objects)
```javascript
const person = {
    name: "Alice",
    age: 30,
    city: "New York"
};

// Iterate over object properties
for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}

// With arrays (not recommended - use for...of instead)
const colors = ["red", "green", "blue"];
for (const index in colors) {
    console.log(`Index ${index}: ${colors[index]}`);
}
```

### for...of Loop (Iterables)
```javascript
const fruits = ["apple", "banana", "orange"];

// Iterate over array values
for (const fruit of fruits) {
    console.log(`I like ${fruit}`);
}

// With strings
const word = "hello";
for (const letter of word) {
    console.log(letter.toUpperCase());
}

// With index using entries()
for (const [index, fruit] of fruits.entries()) {
    console.log(`${index}: ${fruit}`);
}
```

## 🛑 Loop Control Statements

### break Statement
```javascript
// Exit loop early
for (let i = 0; i < 10; i++) {
    if (i === 5) {
        break; // Exit the loop when i equals 5
    }
    console.log(i); // Prints 0, 1, 2, 3, 4
}

// Break from nested loops
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) {
            break outer; // Break from outer loop
        }
        console.log(`i: ${i}, j: ${j}`);
    }
}
```

### continue Statement
```javascript
// Skip current iteration
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        continue; // Skip even numbers
    }
    console.log(i); // Prints 1, 3, 5, 7, 9
}

// Continue with labeled loops
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue outer; // Continue outer loop
        }
        console.log(`i: ${i}, j: ${j}`);
    }
}
```

## 🎯 Modern Control Flow Patterns

### Array Methods for Control Flow
```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Instead of for loop with if
const evenNumbers = numbers.filter(num => num % 2 === 0);
console.log(evenNumbers); // [2, 4, 6, 8, 10]

// Instead of for loop with transformation
const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]

// Instead of for loop with accumulation
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum); // 55

// Check conditions
const hasEven = numbers.some(num => num % 2 === 0);
const allPositive = numbers.every(num => num > 0);
console.log(hasEven, allPositive); // true, true
```

### Optional Chaining & Nullish Coalescing
```javascript
const user = {
    profile: {
        social: {
            twitter: "@alice"
        }
    }
};

// Old way (verbose)
if (user && user.profile && user.profile.social && user.profile.social.twitter) {
    console.log(user.profile.social.twitter);
}

// Modern way (ES2020)
console.log(user?.profile?.social?.twitter ?? "No Twitter");

// With function calls
user?.getName?.(); // Only calls if getName exists
```

### Guard Clauses (Early Returns)
```javascript
// Instead of nested if statements
function processUser(user) {
    // Guard clauses
    if (!user) {
        console.log("No user provided");
        return;
    }
    
    if (!user.email) {
        console.log("User has no email");
        return;
    }
    
    if (!user.isActive) {
        console.log("User is not active");
        return;
    }
    
    // Main logic (not nested)
    console.log(`Processing user: ${user.email}`);
    // ... rest of the function
}
```

## ⚠️ Common Pitfalls

### 1. Missing break in Switch
```javascript
const grade = "B";

switch (grade) {
    case "A":
        console.log("Excellent!");
        // Missing break - falls through!
    case "B":
        console.log("Good job!");
        break;
    case "C":
        console.log("Not bad");
        break;
}
// If grade is "A", both "Excellent!" and "Good job!" will print
```

### 2. Infinite Loops
```javascript
// ❌ Infinite loop - forgot to increment
let i = 0;
while (i < 5) {
    console.log(i);
    // i++; // Forgot this!
}

// ❌ Wrong condition
for (let i = 0; i > -5; i++) { // Should be i < 5
    console.log(i);
}
```

### 3. Off-by-One Errors
```javascript
const arr = [1, 2, 3, 4, 5];

// ❌ Goes beyond array length
for (let i = 0; i <= arr.length; i++) {
    console.log(arr[i]); // arr[5] is undefined!
}

// ✅ Correct
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}
```

### 4. Variable Scope in Loops
```javascript
// ❌ Common mistake with var
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i); // Prints 3, 3, 3
    }, 100);
}

// ✅ Fixed with let
for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i); // Prints 0, 1, 2
    }, 100);
}
```

## 🎯 When & Why to Use

### Choose the Right Loop
```javascript
// Use for...of for arrays when you need values
const items = ["a", "b", "c"];
for (const item of items) {
    console.log(item);
}

// Use for...in for objects when you need keys
const obj = { x: 1, y: 2 };
for (const key in obj) {
    console.log(`${key}: ${obj[key]}`);
}

// Use traditional for when you need index control
for (let i = 0; i < items.length; i++) {
    console.log(`${i}: ${items[i]}`);
}

// Use while when you don't know iteration count
while (condition) {
    // Do something until condition becomes false
}
```

### Choose if vs Switch
```javascript
// Use if for complex conditions
if (age >= 18 && hasLicense && !isSuspended) {
    allowDriving();
}

// Use switch for multiple discrete values
switch (userRole) {
    case "admin":
        showAdminPanel();
        break;
    case "user":
        showUserDashboard();
        break;
    case "guest":
        showPublicContent();
        break;
}
```

## 🏋️ Mini Practice Problems

### Problem 1: FizzBuzz Classic
```javascript
// Print numbers 1-100, but:
// - "Fizz" for multiples of 3
// - "Buzz" for multiples of 5
// - "FizzBuzz" for multiples of both

function fizzBuzz() {
    // Your code here
}

fizzBuzz();
```

### Problem 2: Grade Calculator
```javascript
// Convert numeric scores to letter grades
// Use both if/else and switch approaches

function getGrade(score) {
    // Your code here using if/else
}

function getGradeSwitch(score) {
    // Your code here using switch
    // Hint: Use Math.floor(score/10)
}

console.log(getGrade(95));  // "A"
console.log(getGrade(85));  // "B"
console.log(getGrade(75));  // "C"
```

### Problem 3: Pattern Printing
```javascript
// Print this pattern:
// *
// **
// ***
// ****
// *****

function printTriangle(height) {
    // Your code here
}

printTriangle(5);
```

### Problem 4: Find Prime Numbers
```javascript
// Find all prime numbers up to n
function findPrimes(n) {
    const primes = [];
    // Your code here
    return primes;
}

console.log(findPrimes(20)); // [2, 3, 5, 7, 11, 13, 17, 19]
```

### Problem 5: Nested Loop Challenge
```javascript
// Create a multiplication table
function multiplicationTable(size) {
    // Print a size x size multiplication table
    // Example for size 3:
    // 1  2  3
    // 2  4  6
    // 3  6  9
}

multiplicationTable(5);
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `for...in` and `for...of`?**
- `for...in` iterates over enumerable properties (keys)
- `for...of` iterates over iterable values
- Use `for...in` for objects, `for...of` for arrays

**Q: When would you use a `while` loop vs a `for` loop?**
- `for` loop: when you know the number of iterations
- `while` loop: when you iterate until a condition is met

**Q: What happens if you forget `break` in a switch statement?**
- Fall-through behavior - execution continues to next case
- Sometimes intentional, but usually a bug

**Q: How do you break out of nested loops?**
- Use labeled statements with `break labelName`
- Or use a function and `return`
- Or use a flag variable

### 🏢 Asked at Companies:
- **Google**: "Implement FizzBuzz without using if statements"
- **Amazon**: "Find the first duplicate in an array using loops"
- **Facebook**: "Explain the difference between `break` and `continue`"
- **Microsoft**: "How would you avoid infinite loops?"

## 📊 Control Flow Decision Tree

```
Need to make decisions?
├── Simple condition → if/else
├── Multiple discrete values → switch
└── Complex conditions → if/else if/else

Need to repeat actions?
├── Known iterations → for loop
├── Unknown iterations → while loop
├── At least once → do...while
├── Array values → for...of
└── Object properties → for...in
```

## 🎯 Key Takeaways

1. **Use `===` in conditions, not `==`**
2. **Always include `break` in switch cases (unless fall-through is intended)**
3. **Prefer `for...of` for arrays, `for...in` for objects**
4. **Use guard clauses to reduce nesting**
5. **Consider array methods instead of manual loops**
6. **Be careful with loop conditions to avoid infinite loops**
7. **Use `let` instead of `var` in loops**

---

**Previous Chapter**: [← Operators & Expressions](./02-operators-expressions.md)  
**Next Chapter**: [Functions Deep Dive →](./04-functions.md)

**Practice**: Try the FizzBuzz problem and experiment with different loop types!