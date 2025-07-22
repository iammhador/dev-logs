# 🔒 Chapter 6: Closures Explained

> Master one of JavaScript's most powerful and misunderstood features: closures.

## 📖 Plain English Explanation

A closure is like a backpack that a function carries around. When a function is created inside another function, it "packs" all the variables from its parent scope into this backpack. Even when the function travels far from home (gets called elsewhere), it still has access to everything in its backpack.

Think of it like:
- **Function** = a person
- **Closure** = their backpack with memories/tools
- **Outer variables** = items packed in the backpack
- **Inner function** = the person who can always access their backpack

## 🎯 What is a Closure?

### Basic Closure Example
```javascript
function outerFunction(x) {
    // This is the outer function's scope
    
    function innerFunction(y) {
        // Inner function has access to outer function's variables
        return x + y; // x is from outer scope!
    }
    
    return innerFunction;
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8

// Even though outerFunction has finished executing,
// innerFunction still remembers x = 5!
```

### Closure Visualization
```javascript
function createGreeting(greeting) {
    // Outer scope variable
    const message = greeting;
    
    // Inner function "closes over" the message variable
    return function(name) {
        return `${message}, ${name}!`;
    };
}

const sayHello = createGreeting("Hello");
const sayHi = createGreeting("Hi");

console.log(sayHello("Alice")); // "Hello, Alice!"
console.log(sayHi("Bob"));      // "Hi, Bob!"

// Each closure maintains its own copy of the outer variables
```

## 🔧 Practical Closure Patterns

### 1. Private Variables (Data Encapsulation)
```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance; // Private variable
    
    return {
        deposit(amount) {
            if (amount > 0) {
                balance += amount;
                return balance;
            }
            throw new Error("Deposit amount must be positive");
        },
        
        withdraw(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                return balance;
            }
            throw new Error("Invalid withdrawal amount");
        },
        
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
console.log(account.deposit(50));  // 150
console.log(account.withdraw(30)); // 120
console.log(account.getBalance()); // 120

// balance is private - cannot be accessed directly
// console.log(account.balance); // undefined
```

### 2. Function Factories
```javascript
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
const quadruple = createMultiplier(4);

console.log(double(5));     // 10
console.log(triple(5));     // 15
console.log(quadruple(5));  // 20

// Each function remembers its own multiplier value
```

### 3. Event Handlers with State
```javascript
function createClickCounter() {
    let count = 0;
    
    return function() {
        count++;
        console.log(`Button clicked ${count} times`);
        return count;
    };
}

const buttonHandler = createClickCounter();

// Simulate button clicks
buttonHandler(); // "Button clicked 1 times"
buttonHandler(); // "Button clicked 2 times"
buttonHandler(); // "Button clicked 3 times"

// Each button can have its own counter
const anotherButton = createClickCounter();
anotherButton(); // "Button clicked 1 times" (separate counter)
```

### 4. Module Pattern
```javascript
const calculator = (function() {
    // Private variables and functions
    let result = 0;
    
    function log(operation, value) {
        console.log(`${operation}(${value}) = ${result}`);
    }
    
    // Public API (returned object)
    return {
        add(value) {
            result += value;
            log('add', value);
            return this; // For method chaining
        },
        
        subtract(value) {
            result -= value;
            log('subtract', value);
            return this;
        },
        
        multiply(value) {
            result *= value;
            log('multiply', value);
            return this;
        },
        
        divide(value) {
            if (value !== 0) {
                result /= value;
                log('divide', value);
            } else {
                console.log('Cannot divide by zero!');
            }
            return this;
        },
        
        getResult() {
            return result;
        },
        
        clear() {
            result = 0;
            console.log('Calculator cleared');
            return this;
        }
    };
})();

// Usage
calculator.add(10).multiply(2).subtract(5);
console.log(calculator.getResult()); // 15
```

## 🔄 Closures in Loops

### The Classic Loop Problem
```javascript
// ❌ Common mistake with var
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("var i:", i); // 3, 3, 3 (all reference same i)
    }, 100);
}

// ✅ Solution 1: Use let (block scope)
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log("let i:", i); // 0, 1, 2 (each has own i)
    }, 100);
}

// ✅ Solution 2: IIFE to create closure
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log("IIFE i:", index); // 0, 1, 2
        }, 100);
    })(i);
}

// ✅ Solution 3: bind method
for (var i = 0; i < 3; i++) {
    setTimeout(function(index) {
        console.log("bind i:", index); // 0, 1, 2
    }.bind(null, i), 100);
}
```

### Creating Multiple Closures in Loops
```javascript
function createFunctions() {
    const functions = [];
    
    for (let i = 0; i < 3; i++) {
        functions.push(function() {
            return i * i; // Each function closes over its own i
        });
    }
    
    return functions;
}

const funcs = createFunctions();
console.log(funcs[0]()); // 0
console.log(funcs[1]()); // 1
console.log(funcs[2]()); // 4
```

## 🧠 Advanced Closure Concepts

### Closure with Multiple Nested Functions
```javascript
function grandparent(g) {
    const grandparentVar = g;
    
    return function parent(p) {
        const parentVar = p;
        
        return function child(c) {
            const childVar = c;
            
            // Child has access to all ancestor scopes
            return {
                grandparent: grandparentVar,
                parent: parentVar,
                child: childVar,
                sum: grandparentVar + parentVar + childVar
            };
        };
    };
}

const family = grandparent(1)(2)(3);
console.log(family); // { grandparent: 1, parent: 2, child: 3, sum: 6 }
```

### Closure with Shared State
```javascript
function createSharedCounter() {
    let count = 0;
    
    return {
        increment() {
            return ++count;
        },
        
        decrement() {
            return --count;
        },
        
        getCount() {
            return count;
        },
        
        // Create a new function that shares the same count
        createIncrementer() {
            return () => ++count;
        }
    };
}

const counter = createSharedCounter();
const incrementer = counter.createIncrementer();

console.log(counter.increment()); // 1
console.log(incrementer());       // 2 (shares same count!)
console.log(counter.getCount());  // 2
```

### Closure with Dynamic Behavior
```javascript
function createConfigurableFunction(config) {
    const { prefix, suffix, transform } = config;
    
    return function(input) {
        let result = input;
        
        if (transform) {
            result = transform(result);
        }
        
        return `${prefix || ''}${result}${suffix || ''}`;
    };
}

const upperCaseFormatter = createConfigurableFunction({
    prefix: '[',
    suffix: ']',
    transform: str => str.toUpperCase()
});

const numberFormatter = createConfigurableFunction({
    prefix: '$',
    transform: num => num.toFixed(2)
});

console.log(upperCaseFormatter('hello')); // "[HELLO]"
console.log(numberFormatter(42.567));     // "$42.57"
```

## 🎯 Real-World Applications

### 1. Debounce Function
```javascript
function debounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        // Clear previous timeout
        clearTimeout(timeoutId);
        
        // Set new timeout
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Usage: Debounce search input
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(function(event) {
    console.log('Searching for:', event.target.value);
    // Perform search...
}, 300);

// searchInput.addEventListener('input', debouncedSearch);
```

### 2. Throttle Function
```javascript
function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Usage: Throttle scroll events
const throttledScroll = throttle(function() {
    console.log('Scroll event fired');
}, 100);

// window.addEventListener('scroll', throttledScroll);
```

### 3. Memoization
```javascript
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            console.log('Cache hit!');
            return cache.get(key);
        }
        
        console.log('Computing result...');
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        return result;
    };
}

// Expensive function
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.log(memoizedFib(10)); // Computing result... 55
console.log(memoizedFib(10)); // Cache hit! 55
```

## ⚠️ Common Pitfalls

### 1. Memory Leaks
```javascript
// ❌ Potential memory leak
function createLeakyFunction() {
    const largeData = new Array(1000000).fill('data');
    
    return function() {
        // Even if we don't use largeData, it's kept in memory!
        console.log('Function called');
    };
}

// ✅ Better: only close over what you need
function createEfficientFunction() {
    const largeData = new Array(1000000).fill('data');
    const dataLength = largeData.length; // Extract only what's needed
    
    return function() {
        console.log(`Function called, data size: ${dataLength}`);
    };
}
```

### 2. Unexpected Behavior with Loops
```javascript
// ❌ All functions will alert 3
const functions = [];
for (var i = 0; i < 3; i++) {
    functions.push(function() {
        alert(i); // All reference the same i
    });
}

// ✅ Each function gets its own copy
const functionsFixed = [];
for (let i = 0; i < 3; i++) {
    functionsFixed.push(function() {
        alert(i); // Each has its own i
    });
}
```

### 3. Closure Performance
```javascript
// ❌ Creating closure in every call
function inefficient(arr) {
    return arr.map(function(item) {
        return function() {
            return item * 2; // New closure for each item
        };
    });
}

// ✅ Reuse function when possible
function createDoubler(item) {
    return function() {
        return item * 2;
    };
}

function efficient(arr) {
    return arr.map(createDoubler);
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Counter Factory
```javascript
// Create a function that returns an object with increment, decrement, and value methods
// Each counter should be independent

function createCounter(initialValue = 0) {
    // Your code here
}

const counter1 = createCounter(5);
const counter2 = createCounter(10);

console.log(counter1.increment()); // 6
console.log(counter2.increment()); // 11
console.log(counter1.value());     // 6
console.log(counter2.value());     // 11
```

### Problem 2: Function Multiplier
```javascript
// Create a function that returns a new function that multiplies its input by a factor

function createMultiplier(factor) {
    // Your code here
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(4)); // 12
```

### Problem 3: Private Variable Challenge
```javascript
// Create a function that manages a private array
// Return methods to add, remove, and get items
// The array should not be directly accessible

function createPrivateArray() {
    // Your code here
}

const arr = createPrivateArray();
arr.add('apple');
arr.add('banana');
console.log(arr.getItems()); // ['apple', 'banana']
arr.remove('apple');
console.log(arr.getItems()); // ['banana']
// console.log(arr.items); // Should be undefined
```

### Problem 4: Loop Closure Fix
```javascript
// Fix this code so it prints 0, 1, 2 after 1 second
// Provide multiple solutions

for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 1000);
}

// Currently prints: 3, 3, 3
// Should print: 0, 1, 2
```

### Problem 5: Advanced Closure
```javascript
// Create a function that returns an object with methods to:
// 1. Set a value
// 2. Get the value
// 3. Get the history of all values that were set
// 4. Reset to initial value

function createValueTracker(initialValue) {
    // Your code here
}

const tracker = createValueTracker(0);
tracker.setValue(5);
tracker.setValue(10);
console.log(tracker.getValue());    // 10
console.log(tracker.getHistory());  // [0, 5, 10]
tracker.reset();
console.log(tracker.getValue());    // 0
```

## 💼 Interview Notes

### Common Questions:

**Q: What is a closure?**
- A function that has access to variables from its outer (enclosing) scope
- Even after the outer function has returned
- Creates a "persistent scope" that the inner function can access

**Q: How do closures work in JavaScript?**
- When a function is created, it "closes over" variables from its lexical scope
- JavaScript engine keeps these variables alive as long as the closure exists
- Each closure maintains its own copy of the outer variables

**Q: What are practical uses of closures?**
- Data privacy/encapsulation
- Function factories
- Callbacks with state
- Module pattern
- Debouncing/throttling

**Q: What are potential issues with closures?**
- Memory leaks if large objects are unnecessarily closed over
- Performance impact if overused
- Can make debugging more difficult

### 🏢 Asked at Companies:
- **Google**: "Implement a function that can only be called once using closures"
- **Facebook**: "Fix this loop so each timeout prints a different number"
- **Amazon**: "Create a private counter using closures"
- **Microsoft**: "Explain how closures can cause memory leaks"
- **Netflix**: "Implement debounce function using closures"

## 📊 Closure Mental Model

```
Closure Components:
├── Function Definition
│   ├── Inner function code
│   └── Reference to outer scope
├── Lexical Environment
│   ├── Local variables
│   ├── Parameters
│   └── Reference to parent environment
└── Scope Chain
    ├── Current scope
    ├── Outer scope(s)
    └── Global scope
```

## 🎯 Key Takeaways

1. **Closures give functions access to their outer scope**
2. **Use closures for data privacy and encapsulation**
3. **Each closure maintains its own copy of outer variables**
4. **Be careful with memory leaks - don't close over unnecessary data**
5. **Closures are created every time a function is created**
6. **Understanding closures is crucial for advanced JavaScript patterns**
7. **Use `let` instead of `var` in loops to avoid closure issues**

---

**Previous Chapter**: [← Scope, Hoisting & TDZ](./05-scope-hoisting.md)  
**Next Chapter**: [Arrays & Array Methods →](./07-arrays.md)

**Practice**: Try creating your own closure examples and experiment with the loop problems!