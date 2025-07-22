# 📚 Chapter 8: Objects & Object Access

> Master JavaScript objects, the foundation of everything in JavaScript.

## 📖 Plain English Explanation

Objects are like containers that hold related information and actions together. Think of them as:
- **Person** = object with properties (name, age, height) and actions (walk, talk, eat)
- **Car** = object with properties (color, model, year) and actions (start, stop, accelerate)
- **Book** = object with properties (title, author, pages) and actions (open, close, bookmark)
- **Bank Account** = object with properties (balance, owner) and actions (deposit, withdraw)

In JavaScript, almost everything is an object (except primitives), and objects are the building blocks of complex applications.

## 🏗️ Creating Objects

### Object Literal (Most Common)
```javascript
// Empty object
const emptyObj = {};

// Object with properties
const person = {
    name: 'Alice',
    age: 30,
    city: 'New York',
    isEmployed: true
};

// Object with methods
const calculator = {
    result: 0,
    add: function(num) {
        this.result += num;
        return this;
    },
    subtract: function(num) {
        this.result -= num;
        return this;
    },
    getValue: function() {
        return this.result;
    }
};

// ES6 method shorthand
const modernCalculator = {
    result: 0,
    add(num) {
        this.result += num;
        return this;
    },
    subtract(num) {
        this.result -= num;
        return this;
    },
    getValue() {
        return this.result;
    }
};
```

### Object Constructor
```javascript
// Using Object constructor
const obj1 = new Object();
obj1.name = 'Alice';
obj1.age = 30;

// Equivalent to object literal
const obj2 = {
    name: 'Alice',
    age: 30
};
```

### Object.create()
```javascript
// Create object with specific prototype
const personPrototype = {
    greet: function() {
        return `Hello, I'm ${this.name}`;
    }
};

const alice = Object.create(personPrototype);
alice.name = 'Alice';
alice.age = 30;

console.log(alice.greet()); // "Hello, I'm Alice"

// Create object with null prototype (no inherited properties)
const pureObject = Object.create(null);
pureObject.name = 'Pure';
console.log(pureObject.toString); // undefined (no inherited methods)
```

### Constructor Functions
```javascript
// Constructor function (before ES6 classes)
function Person(name, age, city) {
    this.name = name;
    this.age = age;
    this.city = city;
    
    this.greet = function() {
        return `Hello, I'm ${this.name} from ${this.city}`;
    };
}

// Create instances
const alice = new Person('Alice', 30, 'New York');
const bob = new Person('Bob', 25, 'London');

console.log(alice.greet()); // "Hello, I'm Alice from New York"
console.log(bob.greet());   // "Hello, I'm Bob from London"
```

### ES6 Classes
```javascript
class Person {
    constructor(name, age, city) {
        this.name = name;
        this.age = age;
        this.city = city;
    }
    
    greet() {
        return `Hello, I'm ${this.name} from ${this.city}`;
    }
    
    getAge() {
        return this.age;
    }
    
    // Static method
    static createAnonymous() {
        return new Person('Anonymous', 0, 'Unknown');
    }
}

const alice = new Person('Alice', 30, 'New York');
console.log(alice.greet());

const anon = Person.createAnonymous();
console.log(anon.name); // 'Anonymous'
```

## 🔍 Accessing Object Properties

### Dot Notation
```javascript
const person = {
    name: 'Alice',
    age: 30,
    address: {
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001'
    }
};

// Reading properties
console.log(person.name);              // 'Alice'
console.log(person.age);               // 30
console.log(person.address.city);      // 'New York'

// Setting properties
person.name = 'Alice Smith';
person.email = 'alice@example.com';   // Adding new property
person.address.country = 'USA';       // Adding nested property

console.log(person.email);             // 'alice@example.com'
```

### Bracket Notation
```javascript
const person = {
    name: 'Alice',
    age: 30,
    'favorite color': 'blue',  // Property with space
    '123': 'numeric key'       // Numeric string key
};

// Reading with bracket notation
console.log(person['name']);           // 'Alice'
console.log(person['favorite color']); // 'blue'
console.log(person['123']);            // 'numeric key'

// Dynamic property access
const propertyName = 'age';
console.log(person[propertyName]);     // 30

// Setting with bracket notation
person['last name'] = 'Smith';
person[propertyName] = 31;

// Computed property names
const prefix = 'user';
const obj = {
    [prefix + 'Name']: 'Alice',        // userName: 'Alice'
    [prefix + 'Age']: 30,              // userAge: 30
    [`${prefix}Email`]: 'alice@example.com' // userEmail: 'alice@example.com'
};

console.log(obj.userName);  // 'Alice'
console.log(obj.userAge);   // 30
console.log(obj.userEmail); // 'alice@example.com'
```

### When to Use Dot vs Bracket Notation
```javascript
const obj = {
    name: 'Alice',
    'first-name': 'Alice',
    123: 'number',
    'user name': 'alice123'
};

// ✅ Use dot notation when:
// - Property name is a valid identifier
// - Property name is known at write time
console.log(obj.name);

// ✅ Use bracket notation when:
// - Property name has spaces, hyphens, or special characters
console.log(obj['first-name']);
console.log(obj['user name']);

// - Property name starts with a number
console.log(obj['123']);

// - Property name is dynamic/computed
const propName = 'name';
console.log(obj[propName]);

// - Property name comes from a variable
function getValue(object, key) {
    return object[key];
}

console.log(getValue(obj, 'name')); // 'Alice'
```

## 🔧 Object Methods and `this`

### Method Definition
```javascript
const person = {
    name: 'Alice',
    age: 30,
    
    // Method using function keyword
    greet: function() {
        return `Hello, I'm ${this.name}`;
    },
    
    // ES6 method shorthand
    introduce() {
        return `I'm ${this.name} and I'm ${this.age} years old`;
    },
    
    // Arrow function (be careful with 'this'!)
    arrowMethod: () => {
        // 'this' doesn't refer to the object!
        return `Hello from ${this.name}`; // undefined
    },
    
    // Method that modifies object
    haveBirthday() {
        this.age++;
        return `Happy birthday! Now I'm ${this.age}`;
    }
};

console.log(person.greet());      // "Hello, I'm Alice"
console.log(person.introduce());  // "I'm Alice and I'm 30 years old"
console.log(person.arrowMethod()); // "Hello from undefined"
console.log(person.haveBirthday()); // "Happy birthday! Now I'm 31"
```

### Understanding `this` Context
```javascript
const person = {
    name: 'Alice',
    greet() {
        return `Hello, I'm ${this.name}`;
    }
};

// Method called on object - 'this' refers to person
console.log(person.greet()); // "Hello, I'm Alice"

// Method assigned to variable - 'this' context lost
const greetFunction = person.greet;
console.log(greetFunction()); // "Hello, I'm undefined"

// Binding 'this' context
const boundGreet = person.greet.bind(person);
console.log(boundGreet()); // "Hello, I'm Alice"

// Using call() and apply()
const anotherPerson = { name: 'Bob' };
console.log(person.greet.call(anotherPerson)); // "Hello, I'm Bob"
console.log(person.greet.apply(anotherPerson)); // "Hello, I'm Bob"
```

### Method Chaining
```javascript
const calculator = {
    value: 0,
    
    add(num) {
        this.value += num;
        return this; // Return 'this' for chaining
    },
    
    subtract(num) {
        this.value -= num;
        return this;
    },
    
    multiply(num) {
        this.value *= num;
        return this;
    },
    
    divide(num) {
        if (num !== 0) {
            this.value /= num;
        }
        return this;
    },
    
    getValue() {
        return this.value;
    },
    
    reset() {
        this.value = 0;
        return this;
    }
};

// Method chaining
const result = calculator
    .add(10)
    .multiply(2)
    .subtract(5)
    .divide(3)
    .getValue();

console.log(result); // 5

// Reset and chain again
calculator.reset().add(100).subtract(50).multiply(2);
console.log(calculator.getValue()); // 100
```

## 🔍 Object Property Descriptors

### Property Descriptors
```javascript
const person = {
    name: 'Alice',
    age: 30
};

// Get property descriptor
const nameDescriptor = Object.getOwnPropertyDescriptor(person, 'name');
console.log(nameDescriptor);
// {
//   value: 'Alice',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

// Define property with custom descriptor
Object.defineProperty(person, 'id', {
    value: 12345,
    writable: false,    // Cannot be changed
    enumerable: false,  // Won't show in for...in or Object.keys()
    configurable: false // Cannot be deleted or reconfigured
});

console.log(person.id); // 12345
person.id = 54321;      // Silently fails (or throws in strict mode)
console.log(person.id); // 12345 (unchanged)

console.log(Object.keys(person)); // ['name', 'age'] (id not enumerable)

// Define multiple properties
Object.defineProperties(person, {
    firstName: {
        value: 'Alice',
        writable: true,
        enumerable: true,
        configurable: true
    },
    lastName: {
        value: 'Smith',
        writable: true,
        enumerable: true,
        configurable: true
    }
});
```

### Getters and Setters
```javascript
const person = {
    firstName: 'Alice',
    lastName: 'Smith',
    
    // Getter - computed property
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    },
    
    // Setter - validates and sets value
    set fullName(value) {
        const parts = value.split(' ');
        if (parts.length === 2) {
            this.firstName = parts[0];
            this.lastName = parts[1];
        } else {
            throw new Error('Full name must be in format "First Last"');
        }
    },
    
    // Private-like property with getter/setter
    _age: 30,
    
    get age() {
        return this._age;
    },
    
    set age(value) {
        if (value < 0 || value > 150) {
            throw new Error('Age must be between 0 and 150');
        }
        this._age = value;
    }
};

// Using getters and setters
console.log(person.fullName); // "Alice Smith"
person.fullName = 'Bob Johnson';
console.log(person.firstName); // "Bob"
console.log(person.lastName);  // "Johnson"

console.log(person.age); // 30
person.age = 25;
console.log(person.age); // 25

// This will throw an error
// person.age = -5; // Error: Age must be between 0 and 150

// Define getter/setter with Object.defineProperty
const obj = {};
Object.defineProperty(obj, 'temperature', {
    get() {
        return this._celsius;
    },
    set(celsius) {
        this._celsius = celsius;
        this._fahrenheit = celsius * 9/5 + 32;
    },
    enumerable: true,
    configurable: true
});

obj.temperature = 25;
console.log(obj.temperature);   // 25
console.log(obj._fahrenheit);   // 77
```

## 🔄 Object Iteration

### for...in Loop
```javascript
const person = {
    name: 'Alice',
    age: 30,
    city: 'New York'
};

// Iterate over enumerable properties
for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}
// Output:
// name: Alice
// age: 30
// city: New York

// Check if property belongs to object (not inherited)
for (const key in person) {
    if (person.hasOwnProperty(key)) {
        console.log(`${key}: ${person[key]}`);
    }
}
```

### Object.keys(), Object.values(), Object.entries()
```javascript
const person = {
    name: 'Alice',
    age: 30,
    city: 'New York'
};

// Get all keys
const keys = Object.keys(person);
console.log(keys); // ['name', 'age', 'city']

// Get all values
const values = Object.values(person);
console.log(values); // ['Alice', 30, 'New York']

// Get key-value pairs
const entries = Object.entries(person);
console.log(entries); // [['name', 'Alice'], ['age', 30], ['city', 'New York']]

// Iterate using these methods
Object.keys(person).forEach(key => {
    console.log(`${key}: ${person[key]}`);
});

Object.entries(person).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

// Convert back to object
const newObj = Object.fromEntries(entries);
console.log(newObj); // { name: 'Alice', age: 30, city: 'New York' }
```

## 🛠️ Object Utility Methods

### Object.assign() - Copying and Merging
```javascript
const target = { a: 1, b: 2 };
const source1 = { b: 3, c: 4 };
const source2 = { c: 5, d: 6 };

// Merge objects (modifies target)
Object.assign(target, source1, source2);
console.log(target); // { a: 1, b: 3, c: 5, d: 6 }

// Create new object without modifying original
const original = { name: 'Alice', age: 30 };
const copy = Object.assign({}, original, { city: 'New York' });
console.log(copy); // { name: 'Alice', age: 30, city: 'New York' }
console.log(original); // { name: 'Alice', age: 30 } (unchanged)

// Shallow copy limitation
const obj1 = {
    name: 'Alice',
    address: { city: 'New York', zip: '10001' }
};

const obj2 = Object.assign({}, obj1);
obj2.address.city = 'Boston'; // Modifies original!
console.log(obj1.address.city); // 'Boston' (not 'New York'!)
```

### Spread Operator (ES6)
```javascript
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const obj3 = { c: 5, d: 6 };

// Merge objects with spread
const merged = { ...obj1, ...obj2, ...obj3 };
console.log(merged); // { a: 1, b: 3, c: 5, d: 6 }

// Add properties while copying
const person = { name: 'Alice', age: 30 };
const employee = {
    ...person,
    id: 12345,
    department: 'Engineering',
    age: 31 // Override existing property
};
console.log(employee); // { name: 'Alice', age: 31, id: 12345, department: 'Engineering' }

// Conditional properties
const includeEmail = true;
const user = {
    name: 'Alice',
    age: 30,
    ...(includeEmail && { email: 'alice@example.com' })
};
console.log(user); // { name: 'Alice', age: 30, email: 'alice@example.com' }
```

### Object.freeze(), Object.seal(), Object.preventExtensions()
```javascript
const obj = { name: 'Alice', age: 30 };

// Object.freeze() - completely immutable
const frozen = Object.freeze({ ...obj });
frozen.name = 'Bob';      // Silently fails
frozen.city = 'New York'; // Silently fails
delete frozen.age;        // Silently fails
console.log(frozen);      // { name: 'Alice', age: 30 } (unchanged)
console.log(Object.isFrozen(frozen)); // true

// Object.seal() - can modify existing properties, but can't add/delete
const sealed = Object.seal({ ...obj });
sealed.name = 'Bob';      // ✅ Works
sealed.city = 'New York'; // ❌ Silently fails
delete sealed.age;        // ❌ Silently fails
console.log(sealed);      // { name: 'Bob', age: 30 }
console.log(Object.isSealed(sealed)); // true

// Object.preventExtensions() - can modify and delete, but can't add
const nonExtensible = Object.preventExtensions({ ...obj });
nonExtensible.name = 'Bob';      // ✅ Works
nonExtensible.city = 'New York'; // ❌ Silently fails
delete nonExtensible.age;        // ✅ Works
console.log(nonExtensible);      // { name: 'Bob' }
console.log(Object.isExtensible(nonExtensible)); // false
```

## 🔍 Object Comparison and Checking

### Checking Properties
```javascript
const person = {
    name: 'Alice',
    age: 30,
    address: {
        city: 'New York'
    }
};

// Check if property exists
console.log('name' in person);        // true
console.log('email' in person);       // false
console.log('toString' in person);    // true (inherited)

// Check own property (not inherited)
console.log(person.hasOwnProperty('name'));     // true
console.log(person.hasOwnProperty('toString')); // false

// Modern alternative to hasOwnProperty
console.log(Object.hasOwn(person, 'name'));     // true (ES2022)
console.log(Object.hasOwn(person, 'toString')); // false

// Check if property is undefined
console.log(person.name !== undefined);  // true
console.log(person.email !== undefined); // false

// Nested property checking
console.log(person.address && person.address.city); // 'New York'
console.log(person.address && person.address.zip);  // undefined

// Optional chaining (ES2020)
console.log(person.address?.city);    // 'New York'
console.log(person.address?.zip);     // undefined
console.log(person.contact?.email);   // undefined (no error)
```

### Object Comparison
```javascript
// Objects are compared by reference, not value
const obj1 = { name: 'Alice' };
const obj2 = { name: 'Alice' };
const obj3 = obj1;

console.log(obj1 === obj2); // false (different objects)
console.log(obj1 === obj3); // true (same reference)

// Shallow equality check
function shallowEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) {
        return false;
    }
    
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    
    return true;
}

console.log(shallowEqual(obj1, obj2)); // true

// Deep equality check (simplified)
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
}

const deep1 = { a: 1, b: { c: 2 } };
const deep2 = { a: 1, b: { c: 2 } };
console.log(deepEqual(deep1, deep2)); // true
```

## 🔄 Destructuring Objects

### Basic Destructuring
```javascript
const person = {
    name: 'Alice',
    age: 30,
    city: 'New York',
    country: 'USA'
};

// Basic destructuring
const { name, age } = person;
console.log(name, age); // 'Alice', 30

// Rename variables
const { name: fullName, age: years } = person;
console.log(fullName, years); // 'Alice', 30

// Default values
const { name, email = 'No email' } = person;
console.log(name, email); // 'Alice', 'No email'

// Rest operator
const { name: personName, ...rest } = person;
console.log(personName); // 'Alice'
console.log(rest);       // { age: 30, city: 'New York', country: 'USA' }
```

### Nested Destructuring
```javascript
const user = {
    id: 1,
    name: 'Alice',
    address: {
        street: '123 Main St',
        city: 'New York',
        coordinates: {
            lat: 40.7128,
            lng: -74.0060
        }
    },
    preferences: {
        theme: 'dark',
        language: 'en'
    }
};

// Nested destructuring
const {
    name,
    address: {
        city,
        coordinates: { lat, lng }
    },
    preferences: { theme }
} = user;

console.log(name, city, lat, lng, theme);
// 'Alice', 'New York', 40.7128, -74.0060, 'dark'

// Destructuring with default values for nested properties
const {
    address: {
        zipCode = 'Unknown'
    } = {}
} = user;

console.log(zipCode); // 'Unknown'
```

### Function Parameter Destructuring
```javascript
// Function with object parameter
function greetUser({ name, age, city = 'Unknown' }) {
    return `Hello ${name}, age ${age} from ${city}`;
}

const user = { name: 'Alice', age: 30 };
console.log(greetUser(user)); // "Hello Alice, age 30 from Unknown"

// Nested destructuring in parameters
function processOrder({
    id,
    customer: { name, email },
    items = [],
    shipping: { address, method = 'standard' } = {}
}) {
    return {
        orderId: id,
        customerName: name,
        customerEmail: email,
        itemCount: items.length,
        shippingAddress: address,
        shippingMethod: method
    };
}

const order = {
    id: 'ORD-123',
    customer: {
        name: 'Alice',
        email: 'alice@example.com'
    },
    items: ['item1', 'item2'],
    shipping: {
        address: '123 Main St'
    }
};

console.log(processOrder(order));
```

## ⚠️ Common Pitfalls

### 1. Reference vs Value
```javascript
// Objects are passed by reference
const original = { name: 'Alice', age: 30 };
const reference = original;

reference.age = 31;
console.log(original.age); // 31 (original is modified!)

// Create actual copy
const copy = { ...original };
copy.age = 32;
console.log(original.age); // 31 (original unchanged)

// Shallow copy limitation
const obj = {
    name: 'Alice',
    hobbies: ['reading', 'swimming']
};

const shallowCopy = { ...obj };
shallowCopy.hobbies.push('cooking');
console.log(obj.hobbies); // ['reading', 'swimming', 'cooking'] (modified!)

// Deep copy (simple approach)
const deepCopy = JSON.parse(JSON.stringify(obj));
// Note: This doesn't work with functions, dates, undefined, etc.
```

### 2. `this` Context Issues
```javascript
const person = {
    name: 'Alice',
    greet: function() {
        return `Hello, I'm ${this.name}`;
    },
    arrowGreet: () => {
        return `Hello, I'm ${this.name}`; // 'this' is not the object!
    }
};

console.log(person.greet());      // "Hello, I'm Alice"
console.log(person.arrowGreet()); // "Hello, I'm undefined"

// Method assignment loses context
const greetFunc = person.greet;
console.log(greetFunc()); // "Hello, I'm undefined"

// Solutions:
// 1. Bind the method
const boundGreet = person.greet.bind(person);
console.log(boundGreet()); // "Hello, I'm Alice"

// 2. Use arrow function wrapper
const wrappedGreet = () => person.greet();
console.log(wrappedGreet()); // "Hello, I'm Alice"
```

### 3. Property Existence Checking
```javascript
const obj = {
    name: 'Alice',
    age: 0,
    active: false,
    data: null
};

// ❌ Wrong ways to check property existence
if (obj.age) { /* Won't execute because 0 is falsy */ }
if (obj.active) { /* Won't execute because false is falsy */ }
if (obj.data) { /* Won't execute because null is falsy */ }

// ✅ Correct ways
if ('age' in obj) { /* Correct */ }
if (obj.hasOwnProperty('age')) { /* Correct */ }
if (obj.age !== undefined) { /* Correct */ }
if (typeof obj.age !== 'undefined') { /* Correct */ }
```

### 4. Deleting Properties
```javascript
const obj = {
    name: 'Alice',
    age: 30,
    temp: 'delete me'
};

// ✅ Correct way to delete
delete obj.temp;
console.log(obj); // { name: 'Alice', age: 30 }

// ❌ Wrong ways
obj.temp = undefined; // Property still exists!
obj.temp = null;      // Property still exists!

console.log('temp' in obj); // true (still exists)

// ✅ Alternative: destructuring to exclude
const { temp, ...newObj } = obj;
console.log(newObj); // { name: 'Alice', age: 30 }
```

## 🏋️ Mini Practice Problems

### Problem 1: Object Manipulation
```javascript
// Create a function that takes an array of objects and returns
// a new object with specific transformations

const users = [
    { id: 1, name: 'Alice', age: 30, active: true },
    { id: 2, name: 'Bob', age: 25, active: false },
    { id: 3, name: 'Charlie', age: 35, active: true }
];

// Your function should return:
// {
//   activeUsers: ['Alice', 'Charlie'],
//   averageAge: 30,
//   userById: { 1: 'Alice', 2: 'Bob', 3: 'Charlie' }
// }

function processUsers(users) {
    // Your code here
}

console.log(processUsers(users));
```

### Problem 2: Deep Object Merging
```javascript
// Implement a deep merge function that combines objects recursively

function deepMerge(target, source) {
    // Your implementation here
}

const obj1 = {
    a: 1,
    b: {
        c: 2,
        d: 3
    },
    e: [1, 2]
};

const obj2 = {
    b: {
        d: 4,
        f: 5
    },
    e: [3, 4],
    g: 6
};

// Should result in:
// {
//   a: 1,
//   b: { c: 2, d: 4, f: 5 },
//   e: [3, 4],
//   g: 6
// }

console.log(deepMerge(obj1, obj2));
```

### Problem 3: Object Path Access
```javascript
// Create a function that safely accesses nested object properties
// using a string path like 'user.address.city'

function getNestedValue(obj, path, defaultValue = undefined) {
    // Your implementation here
}

const data = {
    user: {
        name: 'Alice',
        address: {
            city: 'New York',
            coordinates: {
                lat: 40.7128
            }
        }
    }
};

console.log(getNestedValue(data, 'user.name'));                    // 'Alice'
console.log(getNestedValue(data, 'user.address.city'));            // 'New York'
console.log(getNestedValue(data, 'user.address.coordinates.lat')); // 40.7128
console.log(getNestedValue(data, 'user.email', 'No email'));       // 'No email'
console.log(getNestedValue(data, 'user.address.zip'));             // undefined
```

### Problem 4: Object Validation
```javascript
// Create a validation system for objects

class ObjectValidator {
    constructor(schema) {
        this.schema = schema;
    }
    
    validate(obj) {
        // Your implementation here
        // Return { valid: boolean, errors: string[] }
    }
}

// Usage example:
const userSchema = {
    name: { type: 'string', required: true },
    age: { type: 'number', required: true, min: 0, max: 150 },
    email: { type: 'string', required: false, pattern: /^[^@]+@[^@]+\.[^@]+$/ }
};

const validator = new ObjectValidator(userSchema);

const validUser = { name: 'Alice', age: 30, email: 'alice@example.com' };
const invalidUser = { name: '', age: -5, email: 'invalid-email' };

console.log(validator.validate(validUser));   // { valid: true, errors: [] }
console.log(validator.validate(invalidUser)); // { valid: false, errors: [...] }
```

### Problem 5: Object Proxy
```javascript
// Create a proxy that logs all property access and modifications

function createLoggingProxy(obj, logFunction = console.log) {
    // Your implementation using Proxy
}

const person = { name: 'Alice', age: 30 };
const loggedPerson = createLoggingProxy(person);

// These operations should log to console:
loggedPerson.name;           // "GET: name = Alice"
loggedPerson.age = 31;       // "SET: age = 31"
loggedPerson.city = 'NYC';   // "SET: city = NYC"
delete loggedPerson.age;     // "DELETE: age"
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between dot notation and bracket notation?**
- Dot notation: `obj.property` - for valid identifiers, known at write time
- Bracket notation: `obj['property']` - for dynamic access, special characters, computed properties

**Q: How do you check if a property exists in an object?**
- `'property' in obj` - checks own and inherited properties
- `obj.hasOwnProperty('property')` - checks only own properties
- `Object.hasOwn(obj, 'property')` - modern alternative (ES2022)
- `obj.property !== undefined` - checks if value is not undefined

**Q: What's the difference between `Object.assign()` and spread operator?**
- Both perform shallow copying/merging
- Spread operator is more concise and readable
- `Object.assign()` modifies the target object, spread creates new object
- Spread operator doesn't work with getters/setters the same way

**Q: How do you deep copy an object?**
- `JSON.parse(JSON.stringify(obj))` - simple but limited (no functions, dates, etc.)
- Lodash `cloneDeep()` - robust library solution
- Custom recursive function - for specific needs
- `structuredClone()` - new native method (limited browser support)

### 🏢 Asked at Companies:
- **Google**: "Implement Object.assign() from scratch"
- **Facebook**: "Create a function to flatten nested objects"
- **Amazon**: "Implement deep equality comparison for objects"
- **Microsoft**: "Design a system for object validation and transformation"
- **Netflix**: "Create a proxy that tracks object property access patterns"

## 🎯 Key Takeaways

1. **Objects are reference types** - understand copying vs referencing
2. **Use appropriate property access method** - dot vs bracket notation
3. **Be careful with `this` context** - especially with arrow functions
4. **Understand property descriptors** - writable, enumerable, configurable
5. **Master object iteration methods** - for...in, Object.keys(), Object.entries()
6. **Use destructuring for cleaner code** - especially in function parameters
7. **Know the difference between shallow and deep operations**
8. **Practice object manipulation patterns** - merging, filtering, transforming

---

**Previous Chapter**: [← Arrays & Array Methods](./07-arrays.md)  
**Next Chapter**: [Prototypes & Inheritance →](./09-prototypes.md)

**Practice**: Try the object manipulation problems and experiment with different property access patterns!