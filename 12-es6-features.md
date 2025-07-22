# 📚 Chapter 12: ES6+ Features

> Master modern JavaScript syntax and features that make code more elegant and powerful.

## 📖 Plain English Explanation

ES6+ features are like upgrading from an old car to a modern one:
- **Arrow functions** = automatic transmission (simpler, more intuitive)
- **Template literals** = GPS navigation (easier string formatting)
- **Destructuring** = organized toolbox (extract what you need easily)
- **Modules** = standardized parts (import/export functionality)
- **Classes** = blueprint system (cleaner object-oriented programming)
- **Promises** = delivery tracking (better async handling)

These features make JavaScript more readable, maintainable, and powerful while reducing common programming errors.

## 🏹 Arrow Functions

### Basic Syntax
```javascript
// Traditional function
function traditionalAdd(a, b) {
    return a + b;
}

// Arrow function - basic
const arrowAdd = (a, b) => {
    return a + b;
};

// Arrow function - concise (implicit return)
const conciseAdd = (a, b) => a + b;

// Single parameter (parentheses optional)
const square = x => x * x;
const squareExplicit = (x) => x * x;

// No parameters
const greet = () => 'Hello World!';
const getCurrentTime = () => new Date();

// Multiple statements
const processUser = (user) => {
    console.log(`Processing ${user.name}`);
    const processed = { ...user, processed: true };
    return processed;
};

// Returning object literals (wrap in parentheses)
const createUser = (name, age) => ({ name, age, id: Date.now() });

// Array methods with arrow functions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
```

### Lexical `this` Binding
```javascript
// Traditional function - `this` depends on how it's called
function TraditionalTimer() {
    this.seconds = 0;
    
    setInterval(function() {
        this.seconds++; // `this` refers to global object, not TraditionalTimer
        console.log(this.seconds); // NaN or undefined
    }, 1000);
}

// Solution with traditional function
function TraditionalTimerFixed() {
    this.seconds = 0;
    const self = this; // Capture reference
    
    setInterval(function() {
        self.seconds++; // Use captured reference
        console.log(self.seconds);
    }, 1000);
}

// Arrow function - `this` is lexically bound
function ArrowTimer() {
    this.seconds = 0;
    
    setInterval(() => {
        this.seconds++; // `this` refers to ArrowTimer instance
        console.log(this.seconds); // Works correctly!
    }, 1000);
}

// Practical example: Event handlers
class Button {
    constructor(element) {
        this.element = element;
        this.clickCount = 0;
        
        // Arrow function preserves `this`
        this.element.addEventListener('click', () => {
            this.clickCount++;
            console.log(`Clicked ${this.clickCount} times`);
        });
        
        // Traditional function would need .bind(this)
        // this.element.addEventListener('click', function() {
        //     this.clickCount++; // `this` would be the element, not Button
        // }.bind(this));
    }
}

// React component example
class TodoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { todos: [] };
    }
    
    // Arrow function method - automatically bound
    addTodo = (text) => {
        this.setState({
            todos: [...this.state.todos, { id: Date.now(), text }]
        });
    }
    
    render() {
        return (
            <div>
                {/* No need for .bind(this) */}
                <button onClick={() => this.addTodo('New Todo')}>
                    Add Todo
                </button>
            </div>
        );
    }
}
```

### When NOT to Use Arrow Functions
```javascript
// ❌ Object methods (loses `this` context)
const person = {
    name: 'Alice',
    greet: () => {
        console.log(`Hello, I'm ${this.name}`); // `this` is not person
    }
};

// ✅ Use regular function for object methods
const personFixed = {
    name: 'Alice',
    greet() {
        console.log(`Hello, I'm ${this.name}`); // Works correctly
    }
};

// ❌ Constructor functions
const Person = (name) => {
    this.name = name; // Error: arrow functions can't be constructors
};

// ✅ Use regular function or class
function PersonConstructor(name) {
    this.name = name;
}

class PersonClass {
    constructor(name) {
        this.name = name;
    }
}

// ❌ When you need `arguments` object
const sumAll = () => {
    console.log(arguments); // ReferenceError: arguments is not defined
};

// ✅ Use rest parameters instead
const sumAllFixed = (...numbers) => {
    return numbers.reduce((sum, num) => sum + num, 0);
};

// ❌ Dynamic context methods
const calculator = {
    value: 0,
    add: (n) => this.value += n, // `this` doesn't refer to calculator
    multiply: (n) => this.value *= n
};

// ✅ Use regular methods
const calculatorFixed = {
    value: 0,
    add(n) { return this.value += n; },
    multiply(n) { return this.value *= n; }
};
```

## 📝 Template Literals

### Basic String Interpolation
```javascript
// Old way - string concatenation
const name = 'Alice';
const age = 30;
const oldWay = 'Hello, my name is ' + name + ' and I am ' + age + ' years old.';

// Template literals - much cleaner
const newWay = `Hello, my name is ${name} and I am ${age} years old.`;

// Expressions in template literals
const a = 5;
const b = 10;
const mathResult = `The sum of ${a} and ${b} is ${a + b}.`;

// Function calls
const getCurrentTime = () => new Date().toLocaleTimeString();
const timeMessage = `Current time: ${getCurrentTime()}`;

// Object properties
const user = { name: 'Bob', role: 'admin' };
const userInfo = `User: ${user.name} (${user.role.toUpperCase()})`;

// Conditional expressions
const score = 85;
const result = `You ${score >= 60 ? 'passed' : 'failed'} the test with ${score}%.`;

// Complex expressions
const items = ['apple', 'banana', 'orange'];
const itemList = `You have ${items.length} items: ${items.join(', ')}.`;
```

### Multiline Strings
```javascript
// Old way - concatenation or escaping
const oldMultiline = 'This is line 1\n' +
                    'This is line 2\n' +
                    'This is line 3';

// Template literals - natural multiline
const newMultiline = `This is line 1
This is line 2
This is line 3`;

// HTML templates
const htmlTemplate = `
    <div class="user-card">
        <h2>${user.name}</h2>
        <p>Email: ${user.email}</p>
        <p>Role: ${user.role}</p>
        <button onclick="editUser(${user.id})">
            Edit User
        </button>
    </div>
`;

// SQL queries
const sqlQuery = `
    SELECT users.name, users.email, profiles.bio
    FROM users
    JOIN profiles ON users.id = profiles.user_id
    WHERE users.active = true
    AND users.created_at > '${startDate}'
    ORDER BY users.name
`;

// Configuration files
const configFile = `
    {
        "name": "${projectName}",
        "version": "${version}",
        "description": "${description}",
        "main": "${entryPoint}"
    }
`;
```

### Tagged Template Literals
```javascript
// Custom template tag functions
function highlight(strings, ...values) {
    return strings.reduce((result, string, i) => {
        const value = values[i] ? `<mark>${values[i]}</mark>` : '';
        return result + string + value;
    }, '');
}

const searchTerm = 'JavaScript';
const text = highlight`Learn ${searchTerm} programming with ease!`;
// Result: "Learn <mark>JavaScript</mark> programming with ease!"

// SQL template tag (prevents injection)
function sql(strings, ...values) {
    const escapedValues = values.map(value => {
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        }
        return value;
    });
    
    return strings.reduce((result, string, i) => {
        const value = escapedValues[i] || '';
        return result + string + value;
    }, '');
}

const userId = 123;
const userName = "O'Connor";
const query = sql`SELECT * FROM users WHERE id = ${userId} AND name = ${userName}`;
// Result: "SELECT * FROM users WHERE id = 123 AND name = 'O''Connor'"

// Internationalization template tag
function i18n(strings, ...values) {
    const key = strings.join('{}');
    const translation = translations[key] || key;
    
    return values.reduce((result, value, i) => {
        return result.replace('{}', value);
    }, translation);
}

const translations = {
    'Hello, {}! You have {} messages.': 'Hola, {}! Tienes {} mensajes.'
};

const greeting = i18n`Hello, ${userName}! You have ${messageCount} messages.`;

// Styled components (React)
const Button = styled.button`
    background-color: ${props => props.primary ? 'blue' : 'gray'};
    color: white;
    padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
`;
```

## 🎯 Destructuring

### Array Destructuring
```javascript
// Basic array destructuring
const colors = ['red', 'green', 'blue'];
const [first, second, third] = colors;
console.log(first);  // 'red'
console.log(second); // 'green'
console.log(third);  // 'blue'

// Skipping elements
const [primary, , tertiary] = colors;
console.log(primary);  // 'red'
console.log(tertiary); // 'blue'

// Default values
const [a, b, c, d = 'yellow'] = colors;
console.log(d); // 'yellow' (default value)

// Rest operator
const numbers = [1, 2, 3, 4, 5];
const [head, ...tail] = numbers;
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]

// Swapping variables
let x = 1;
let y = 2;
[x, y] = [y, x];
console.log(x); // 2
console.log(y); // 1

// Function return values
function getCoordinates() {
    return [10, 20];
}

const [x, y] = getCoordinates();

// Nested arrays
const matrix = [[1, 2], [3, 4]];
const [[a, b], [c, d]] = matrix;
console.log(a, b, c, d); // 1 2 3 4

// Practical examples
const csvLine = 'John,Doe,30,Engineer';
const [firstName, lastName, age, profession] = csvLine.split(',');

// React hooks
const [count, setCount] = useState(0);
const [loading, setLoading] = useState(false);

// Array methods
const entries = Object.entries({ name: 'Alice', age: 30 });
entries.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});
```

### Object Destructuring
```javascript
// Basic object destructuring
const person = {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com',
    address: {
        street: '123 Main St',
        city: 'New York',
        country: 'USA'
    }
};

const { name, age, email } = person;
console.log(name); // 'Alice'
console.log(age);  // 30

// Renaming variables
const { name: fullName, age: years } = person;
console.log(fullName); // 'Alice'
console.log(years);    // 30

// Default values
const { name, age, phone = 'Not provided' } = person;
console.log(phone); // 'Not provided'

// Nested destructuring
const { address: { street, city } } = person;
console.log(street); // '123 Main St'
console.log(city);   // 'New York'

// Renaming nested properties
const { address: { street: streetAddress, city: cityName } } = person;

// Rest operator with objects
const { name, ...otherInfo } = person;
console.log(otherInfo); // { age: 30, email: '...', address: {...} }

// Function parameters
function greetUser({ name, age, email = 'No email' }) {
    console.log(`Hello ${name}, you are ${age} years old.`);
    console.log(`Email: ${email}`);
}

greetUser(person);

// API response handling
function handleApiResponse({ data, status, message = 'Success' }) {
    if (status === 'success') {
        console.log(message);
        return data;
    } else {
        throw new Error(message);
    }
}

// React props destructuring
function UserCard({ user: { name, email, avatar }, onEdit, className = '' }) {
    return (
        <div className={`user-card ${className}`}>
            <img src={avatar} alt={name} />
            <h3>{name}</h3>
            <p>{email}</p>
            <button onClick={() => onEdit(name)}>Edit</button>
        </div>
    );
}

// Configuration objects
function createServer({ 
    port = 3000, 
    host = 'localhost', 
    ssl = false,
    middleware = [],
    routes = {}
}) {
    console.log(`Starting server on ${host}:${port}`);
    // Server setup logic...
}

createServer({
    port: 8080,
    ssl: true,
    middleware: [cors(), helmet()]
});
```

### Advanced Destructuring Patterns
```javascript
// Computed property names
const key = 'dynamicKey';
const obj = { [key]: 'value', other: 'data' };
const { [key]: dynamicValue, other } = obj;
console.log(dynamicValue); // 'value'

// Destructuring in loops
const users = [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 }
];

// Array of objects
for (const { name, age } of users) {
    console.log(`${name} is ${age} years old`);
}

// Map entries
const userMap = new Map([
    ['alice', { name: 'Alice', role: 'admin' }],
    ['bob', { name: 'Bob', role: 'user' }]
]);

for (const [username, { name, role }] of userMap) {
    console.log(`${username}: ${name} (${role})`);
}

// Mixed destructuring
const response = {
    data: {
        users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
        ],
        meta: { total: 2, page: 1 }
    },
    status: 'success'
};

const {
    data: {
        users: [firstUser, ...otherUsers],
        meta: { total }
    },
    status
} = response;

console.log(firstUser); // { id: 1, name: 'Alice' }
console.log(total);     // 2
console.log(status);    // 'success'

// Destructuring with validation
function processOrder({ 
    items = [], 
    customer: { name, email } = {}, 
    shipping: { address, method = 'standard' } = {} 
}) {
    if (!name || !email) {
        throw new Error('Customer information is required');
    }
    
    if (!address) {
        throw new Error('Shipping address is required');
    }
    
    console.log(`Processing order for ${name} (${email})`);
    console.log(`${items.length} items, shipping to ${address}`);
    console.log(`Shipping method: ${method}`);
}
```

## 🔄 Spread and Rest Operators

### Spread Operator (...)
```javascript
// Array spreading
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// Adding elements
const withExtra = [0, ...arr1, 3.5, ...arr2, 7]; // [0, 1, 2, 3, 3.5, 4, 5, 6, 7]

// Array copying (shallow)
const originalArray = [1, 2, 3];
const copiedArray = [...originalArray];
copiedArray.push(4); // originalArray remains [1, 2, 3]

// Converting iterables to arrays
const nodeList = document.querySelectorAll('.item');
const elementsArray = [...nodeList];

const str = 'hello';
const chars = [...str]; // ['h', 'e', 'l', 'l', 'o']

const set = new Set([1, 2, 3, 2, 1]);
const uniqueArray = [...set]; // [1, 2, 3]

// Function arguments
function sum(a, b, c) {
    return a + b + c;
}

const numbers = [1, 2, 3];
const result = sum(...numbers); // Same as sum(1, 2, 3)

// Math functions
const scores = [85, 92, 78, 96, 88];
const highest = Math.max(...scores);
const lowest = Math.min(...scores);

// Object spreading
const person = { name: 'Alice', age: 30 };
const employee = { ...person, role: 'developer', salary: 75000 };
// { name: 'Alice', age: 30, role: 'developer', salary: 75000 }

// Overriding properties
const updated = { ...person, age: 31 }; // age is updated to 31

// Merging objects
const defaults = { theme: 'light', language: 'en' };
const userPrefs = { theme: 'dark' };
const settings = { ...defaults, ...userPrefs };
// { theme: 'dark', language: 'en' }

// Conditional spreading
const includeExtra = true;
const config = {
    base: 'value',
    ...(includeExtra && { extra: 'data' })
};

// React props spreading
function Button({ children, ...props }) {
    return <button {...props}>{children}</button>;
}

// Usage: <Button className="primary" onClick={handleClick}>Click me</Button>
```

### Rest Operator (...)
```javascript
// Function parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3, 4, 5); // 15
sum(10, 20);        // 30
sum();              // 0

// Mixed parameters
function greet(greeting, ...names) {
    return `${greeting} ${names.join(', ')}!`;
}

greet('Hello', 'Alice', 'Bob', 'Charlie'); // "Hello Alice, Bob, Charlie!"

// Array destructuring with rest
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first);  // 1
console.log(second); // 2
console.log(rest);   // [3, 4, 5]

// Object destructuring with rest
const user = { name: 'Alice', age: 30, email: 'alice@example.com', role: 'admin' };
const { name, age, ...otherProps } = user;
console.log(name);       // 'Alice'
console.log(age);        // 30
console.log(otherProps); // { email: 'alice@example.com', role: 'admin' }

// Function that accepts options
function createUser(name, email, ...options) {
    const [age, role = 'user', department] = options;
    
    return {
        name,
        email,
        age,
        role,
        department
    };
}

const newUser = createUser('Bob', 'bob@example.com', 25, 'admin', 'IT');

// Flexible API functions
function apiCall(endpoint, method = 'GET', ...middlewares) {
    console.log(`${method} ${endpoint}`);
    middlewares.forEach(middleware => middleware());
}

apiCall('/users', 'POST', authMiddleware, validationMiddleware, loggingMiddleware);

// Event handler with rest
function handleFormSubmit(event, ...validators) {
    event.preventDefault();
    
    const isValid = validators.every(validator => validator());
    
    if (isValid) {
        console.log('Form is valid, submitting...');
    }
}
```

### Practical Combinations
```javascript
// Array manipulation utilities
function removeItem(array, index) {
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1)
    ];
}

function insertItem(array, index, item) {
    return [
        ...array.slice(0, index),
        item,
        ...array.slice(index)
    ];
}

function updateItem(array, index, newItem) {
    return array.map((item, i) => i === index ? newItem : item);
}

// Object utilities
function omit(obj, ...keys) {
    const { [keys[0]]: omitted, ...rest } = obj;
    return keys.length > 1 ? omit(rest, ...keys.slice(1)) : rest;
}

function pick(obj, ...keys) {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

// Usage
const user = { name: 'Alice', age: 30, email: 'alice@example.com', password: 'secret' };
const publicUser = omit(user, 'password'); // { name: 'Alice', age: 30, email: 'alice@example.com' }
const basicInfo = pick(user, 'name', 'age'); // { name: 'Alice', age: 30 }

// Redux-style state updates
function updateUserState(state, action) {
    switch (action.type) {
        case 'UPDATE_USER':
            return {
                ...state,
                user: {
                    ...state.user,
                    ...action.payload
                }
            };
        
        case 'ADD_ITEM':
            return {
                ...state,
                items: [...state.items, action.payload]
            };
        
        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id)
            };
        
        default:
            return state;
    }
}
```

## 🏗️ Enhanced Object Literals

### Shorthand Properties and Methods
```javascript
// Old way
const name = 'Alice';
const age = 30;
const email = 'alice@example.com';

const oldUser = {
    name: name,
    age: age,
    email: email,
    greet: function() {
        return 'Hello!';
    }
};

// New way - shorthand properties
const newUser = {
    name,    // Same as name: name
    age,     // Same as age: age
    email,   // Same as email: email
    greet() { // Same as greet: function()
        return 'Hello!';
    }
};

// Method definitions
const calculator = {
    value: 0,
    
    add(n) {
        this.value += n;
        return this;
    },
    
    multiply(n) {
        this.value *= n;
        return this;
    },
    
    get result() {
        return this.value;
    },
    
    set reset(val) {
        this.value = val || 0;
    }
};

// Usage: calculator.add(5).multiply(2).result; // 10

// Async methods
const apiService = {
    baseUrl: 'https://api.example.com',
    
    async fetchUser(id) {
        const response = await fetch(`${this.baseUrl}/users/${id}`);
        return response.json();
    },
    
    async createUser(userData) {
        const response = await fetch(`${this.baseUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }
};
```

### Computed Property Names
```javascript
// Dynamic property names
const propertyName = 'dynamicKey';
const value = 'dynamicValue';

const obj = {
    [propertyName]: value,
    [`${propertyName}_modified`]: value.toUpperCase(),
    [propertyName + '_count']: 1
};
// { dynamicKey: 'dynamicValue', dynamicKey_modified: 'DYNAMICVALUE', dynamicKey_count: 1 }

// Function-based property names
function getPropertyName(prefix, suffix) {
    return `${prefix}_${suffix}`;
}

const config = {
    [getPropertyName('api', 'url')]: 'https://api.example.com',
    [getPropertyName('api', 'key')]: 'secret-key'
};
// { api_url: 'https://api.example.com', api_key: 'secret-key' }

// Symbol properties
const uniqueId = Symbol('id');
const metadata = Symbol('metadata');

const user = {
    name: 'Alice',
    [uniqueId]: 12345,
    [metadata]: { created: new Date(), version: 1 }
};

// Computed method names
const actions = ['create', 'read', 'update', 'delete'];
const api = {};

actions.forEach(action => {
    api[`${action}User`] = function(data) {
        console.log(`${action.toUpperCase()} user:`, data);
    };
});
// api.createUser, api.readUser, api.updateUser, api.deleteUser

// React component with dynamic handlers
class FormComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        
        // Create handlers for each field
        props.fields.forEach(field => {
            this[`handle${field.charAt(0).toUpperCase() + field.slice(1)}Change`] = (e) => {
                this.setState({ [field]: e.target.value });
            };
        });
    }
}

// Practical example: Form validation
function createValidator(rules) {
    return {
        [Symbol.toStringTag]: 'Validator',
        
        validate(data) {
            const errors = {};
            
            Object.keys(rules).forEach(field => {
                const rule = rules[field];
                const value = data[field];
                
                if (rule.required && !value) {
                    errors[field] = `${field} is required`;
                } else if (rule.minLength && value.length < rule.minLength) {
                    errors[field] = `${field} must be at least ${rule.minLength} characters`;
                }
            });
            
            return {
                isValid: Object.keys(errors).length === 0,
                errors
            };
        }
    };
}

const userValidator = createValidator({
    name: { required: true, minLength: 2 },
    email: { required: true },
    password: { required: true, minLength: 8 }
});
```

## 📦 Modules (Import/Export)

### Named Exports and Imports
```javascript
// math.js - Named exports
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

export class Calculator {
    constructor() {
        this.value = 0;
    }
    
    add(n) {
        this.value += n;
        return this;
    }
}

// Alternative export syntax
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };

// Exporting with different names
const power = (base, exponent) => Math.pow(base, exponent);
export { power as pow };

// main.js - Named imports
import { PI, add, multiply, Calculator } from './math.js';
import { subtract, divide, pow } from './math.js';

// Using imported functions
console.log(add(5, 3));        // 8
console.log(multiply(4, 7));   // 28
console.log(PI);               // 3.14159

const calc = new Calculator();
calc.add(10).add(5);

// Importing with different names
import { pow as power } from './math.js';
console.log(power(2, 3)); // 8

// Importing all named exports
import * as MathUtils from './math.js';
console.log(MathUtils.PI);
console.log(MathUtils.add(1, 2));

// Selective imports
import { add, multiply } from './math.js';
```

### Default Exports and Imports
```javascript
// user.js - Default export
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
}

export default User;

// Alternative default export syntax
const createUser = (name, email) => new User(name, email);
export { createUser as default };

// Or inline default export
export default function validateEmail(email) {
    return email.includes('@');
}

// main.js - Default imports
import User from './user.js';              // Import default export
import MyUser from './user.js';            // Can use any name
import validateEmail from './validator.js'; // Import default function

const user = new User('Alice', 'alice@example.com');
console.log(user.greet());

// Mixed imports (default + named)
// utils.js
export default function log(message) {
    console.log(`[LOG]: ${message}`);
}

export const version = '1.0.0';
export const author = 'John Doe';

// main.js
import log, { version, author } from './utils.js';

log(`App version: ${version} by ${author}`);
```

### Re-exports and Module Aggregation
```javascript
// api/users.js
export async function getUsers() {
    const response = await fetch('/api/users');
    return response.json();
}

export async function createUser(userData) {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return response.json();
}

// api/posts.js
export async function getPosts() {
    const response = await fetch('/api/posts');
    return response.json();
}

export async function createPost(postData) {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    });
    return response.json();
}

// api/index.js - Aggregating exports
export * from './users.js';  // Re-export all named exports
export * from './posts.js';

// Or selective re-exports
export { getUsers, createUser } from './users.js';
export { getPosts, createPost } from './posts.js';

// Re-export with renaming
export { getUsers as fetchUsers } from './users.js';

// Re-export default as named
export { default as UserClass } from './user.js';

// main.js - Clean imports
import { getUsers, createUser, getPosts, createPost } from './api/index.js';

// Or namespace import
import * as API from './api/index.js';
API.getUsers().then(users => console.log(users));
```

### Dynamic Imports
```javascript
// Dynamic imports for code splitting
async function loadModule() {
    try {
        const module = await import('./heavy-module.js');
        module.doSomething();
    } catch (error) {
        console.error('Failed to load module:', error);
    }
}

// Conditional loading
if (condition) {
    import('./feature-module.js')
        .then(module => {
            module.initializeFeature();
        })
        .catch(error => {
            console.error('Feature not available:', error);
        });
}

// React lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent.js'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
        </Suspense>
    );
}

// Dynamic import with destructuring
async function loadUtilities() {
    const { add, multiply, PI } = await import('./math.js');
    console.log(add(2, 3));
    console.log(PI);
}

// Module loading based on environment
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = isDevelopment 
    ? await import('./dev-logger.js')
    : await import('./prod-logger.js');

logger.log('Application started');

// Plugin system with dynamic imports
class PluginManager {
    constructor() {
        this.plugins = new Map();
    }
    
    async loadPlugin(name) {
        try {
            const plugin = await import(`./plugins/${name}.js`);
            this.plugins.set(name, plugin.default || plugin);
            console.log(`Plugin ${name} loaded successfully`);
        } catch (error) {
            console.error(`Failed to load plugin ${name}:`, error);
        }
    }
    
    getPlugin(name) {
        return this.plugins.get(name);
    }
}

const pluginManager = new PluginManager();
await pluginManager.loadPlugin('analytics');
await pluginManager.loadPlugin('authentication');
```

## 🏛️ Classes

### Basic Class Syntax
```javascript
// ES6 Class
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
    }
    
    haveBirthday() {
        this.age++;
        return `Happy birthday! I'm now ${this.age}.`;
    }
    
    // Static method
    static createAdult(name) {
        return new Person(name, 18);
    }
    
    // Getter
    get description() {
        return `${this.name} (${this.age} years old)`;
    }
    
    // Setter
    set fullName(name) {
        this.name = name;
    }
}

// Usage
const person = new Person('Alice', 30);
console.log(person.greet());
console.log(person.haveBirthday());
console.log(person.description);

person.fullName = 'Alice Smith';
console.log(person.description);

const adult = Person.createAdult('Bob');
console.log(adult.age); // 18
```

### Inheritance
```javascript
// Base class
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
    
    makeSound() {
        return `${this.name} makes a sound`;
    }
    
    move() {
        return `${this.name} moves`;
    }
    
    toString() {
        return `${this.name} the ${this.species}`;
    }
}

// Derived class
class Dog extends Animal {
    constructor(name, breed) {
        super(name, 'Dog'); // Call parent constructor
        this.breed = breed;
    }
    
    makeSound() {
        return `${this.name} barks: Woof!`;
    }
    
    fetch() {
        return `${this.name} fetches the ball`;
    }
    
    // Override toString
    toString() {
        return `${super.toString()} (${this.breed})`;
    }
}

class Cat extends Animal {
    constructor(name, isIndoor = true) {
        super(name, 'Cat');
        this.isIndoor = isIndoor;
    }
    
    makeSound() {
        return `${this.name} meows: Meow!`;
    }
    
    climb() {
        return `${this.name} climbs the tree`;
    }
}

// Usage
const dog = new Dog('Buddy', 'Golden Retriever');
const cat = new Cat('Whiskers');

console.log(dog.makeSound()); // "Buddy barks: Woof!"
console.log(cat.makeSound()); // "Whiskers meows: Meow!"
console.log(dog.toString());  // "Buddy the Dog (Golden Retriever)"

// Polymorphism
const animals = [dog, cat];
animals.forEach(animal => {
    console.log(animal.makeSound()); // Different behavior for each
});

// instanceof checks
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true
console.log(cat instanceof Dog);    // false
```

### Private Fields and Methods (ES2022)
```javascript
class BankAccount {
    // Private fields
    #balance = 0;
    #accountNumber;
    #transactions = [];
    
    constructor(accountNumber, initialBalance = 0) {
        this.#accountNumber = accountNumber;
        this.#balance = initialBalance;
        this.#addTransaction('Initial deposit', initialBalance);
    }
    
    // Private method
    #addTransaction(type, amount) {
        this.#transactions.push({
            type,
            amount,
            timestamp: new Date(),
            balance: this.#balance
        });
    }
    
    // Public methods
    deposit(amount) {
        if (amount <= 0) {
            throw new Error('Deposit amount must be positive');
        }
        
        this.#balance += amount;
        this.#addTransaction('Deposit', amount);
        return this.#balance;
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be positive');
        }
        
        if (amount > this.#balance) {
            throw new Error('Insufficient funds');
        }
        
        this.#balance -= amount;
        this.#addTransaction('Withdrawal', -amount);
        return this.#balance;
    }
    
    // Getter for balance (read-only access)
    get balance() {
        return this.#balance;
    }
    
    get accountNumber() {
        return this.#accountNumber;
    }
    
    getTransactionHistory() {
        // Return copy to prevent external modification
        return [...this.#transactions];
    }
}

// Usage
const account = new BankAccount('12345', 1000);
console.log(account.balance); // 1000

account.deposit(500);
console.log(account.balance); // 1500

account.withdraw(200);
console.log(account.balance); // 1300

// These would throw errors:
// console.log(account.#balance);     // SyntaxError: Private field '#balance' must be declared in an enclosing class
// account.#addTransaction('test', 100); // SyntaxError

console.log(account.getTransactionHistory());
```

### Static Fields and Methods
```javascript
class MathUtils {
    // Static fields
    static PI = 3.14159;
    static E = 2.71828;
    static #precision = 10; // Private static field
    
    // Static methods
    static add(a, b) {
        return a + b;
    }
    
    static multiply(a, b) {
        return a * b;
    }
    
    static round(number, decimals = 2) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    // Private static method
    static #validateNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            throw new Error('Invalid number');
        }
    }
    
    static circleArea(radius) {
        this.#validateNumber(radius);
        return this.round(this.PI * radius * radius);
    }
    
    // Static getter
    static get precision() {
        return this.#precision;
    }
    
    // Static setter
    static set precision(value) {
        if (value > 0 && value <= 20) {
            this.#precision = value;
        }
    }
}

// Usage
console.log(MathUtils.PI);              // 3.14159
console.log(MathUtils.add(5, 3));       // 8
console.log(MathUtils.circleArea(5));   // 78.54
console.log(MathUtils.precision);       // 10

MathUtils.precision = 5;
console.log(MathUtils.precision);       // 5

// Counter example with static fields
class Counter {
    static #count = 0;
    static #instances = [];
    
    constructor(name) {
        this.name = name;
        this.id = ++Counter.#count;
        Counter.#instances.push(this);
    }
    
    static getCount() {
        return Counter.#count;
    }
    
    static getAllInstances() {
        return [...Counter.#instances];
    }
    
    static reset() {
        Counter.#count = 0;
        Counter.#instances = [];
    }
}

const counter1 = new Counter('First');
const counter2 = new Counter('Second');

console.log(Counter.getCount());        // 2
console.log(Counter.getAllInstances()); // [Counter, Counter]
```

### Mixins and Composition
```javascript
// Mixin functions
const Flyable = {
    fly() {
        return `${this.name} is flying`;
    },
    
    land() {
        return `${this.name} has landed`;
    }
};

const Swimmable = {
    swim() {
        return `${this.name} is swimming`;
    },
    
    dive() {
        return `${this.name} dives underwater`;
    }
};

const Walkable = {
    walk() {
        return `${this.name} is walking`;
    },
    
    run() {
        return `${this.name} is running`;
    }
};

// Mixin helper function
function mixin(target, ...sources) {
    sources.forEach(source => {
        Object.getOwnPropertyNames(source).forEach(name => {
            if (name !== 'constructor') {
                target.prototype[name] = source[name];
            }
        });
    });
    return target;
}

// Base class
class Animal {
    constructor(name) {
        this.name = name;
    }
}

// Classes with mixins
class Bird extends Animal {
    constructor(name, wingspan) {
        super(name);
        this.wingspan = wingspan;
    }
}

class Duck extends Animal {
    constructor(name) {
        super(name);
    }
}

class Human extends Animal {
    constructor(name, age) {
        super(name);
        this.age = age;
    }
}

// Apply mixins
mixin(Bird, Flyable, Walkable);
mixin(Duck, Flyable, Swimmable, Walkable);
mixin(Human, Walkable, Swimmable);

// Usage
const eagle = new Bird('Eagle', 200);
const mallard = new Duck('Mallard');
const person = new Human('Alice', 30);

console.log(eagle.fly());    // "Eagle is flying"
console.log(eagle.walk());   // "Eagle is walking"

console.log(mallard.fly());  // "Mallard is flying"
console.log(mallard.swim()); // "Mallard is swimming"
console.log(mallard.walk()); // "Mallard is walking"

console.log(person.walk());  // "Alice is walking"
console.log(person.swim());  // "Alice is swimming"
// console.log(person.fly()); // Error: person.fly is not a function

// Factory function approach
function createFlyingAnimal(name, type) {
    const animal = {
        name,
        type,
        ...Flyable,
        ...Walkable
    };
    
    return animal;
}

const bat = createFlyingAnimal('Bat', 'Mammal');
console.log(bat.fly()); // "Bat is flying"
```

## ⚠️ Common Pitfalls

### 1. Arrow Function Context Issues
```javascript
// ❌ Using arrow functions where you need dynamic `this`
const button = {
    text: 'Click me',
    click: () => {
        console.log(this.text); // `this` is not the button object
    }
};

// ✅ Use regular function for object methods
const buttonFixed = {
    text: 'Click me',
    click() {
        console.log(this.text); // Works correctly
    }
};

// ❌ Arrow functions as constructors
const Person = (name) => {
    this.name = name; // Error: Arrow functions cannot be constructors
};

// ✅ Use regular function or class
function PersonConstructor(name) {
    this.name = name;
}

class PersonClass {
    constructor(name) {
        this.name = name;
    }
}
```

### 2. Destructuring with Default Values
```javascript
// ❌ Incorrect default value syntax
function processUser({ name = 'Anonymous', age = 0, email }) {
    // This works, but what if the entire object is undefined?
}

processUser(); // TypeError: Cannot destructure property 'name' of 'undefined'

// ✅ Provide default for the entire parameter
function processUserFixed({ name = 'Anonymous', age = 0, email } = {}) {
    console.log(name, age, email);
}

processUserFixed(); // Works: "Anonymous 0 undefined"

// ❌ Nested destructuring without defaults
function getAddress({ user: { address: { street } } }) {
    return street;
}

getAddress({ user: {} }); // TypeError: Cannot destructure property 'street' of 'undefined'

// ✅ Provide defaults at each level
function getAddressFixed({ user: { address: { street } = {} } = {} } = {}) {
    return street;
}

getAddressFixed({ user: {} }); // undefined (no error)
```

### 3. Module Import/Export Issues
```javascript
// ❌ Mixing default and named exports incorrectly
// utils.js
export default function log(message) {
    console.log(message);
}

export const version = '1.0.0';

// main.js - Wrong import
import { log, version } from './utils.js'; // Error: log is default export

// ✅ Correct import
import log, { version } from './utils.js';

// ❌ Circular dependencies
// a.js
import { b } from './b.js';
export const a = 'A';

// b.js
import { a } from './a.js'; // Circular dependency
export const b = 'B';

// ✅ Avoid circular dependencies or use dynamic imports
// b.js
export const b = 'B';

// Later, when needed:
async function useA() {
    const { a } = await import('./a.js');
    console.log(a);
}
```

### 4. Class Inheritance Pitfalls
```javascript
// ❌ Forgetting to call super() in constructor
class Animal {
    constructor(name) {
        this.name = name;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        // Missing super(name) call
        this.breed = breed; // ReferenceError: Must call super constructor
    }
}

// ✅ Always call super() first
class DogFixed extends Animal {
    constructor(name, breed) {
        super(name); // Call parent constructor first
        this.breed = breed;
    }
}

// ❌ Incorrect method overriding
class Calculator {
    add(a, b) {
        return a + b;
    }
}

class ScientificCalculator extends Calculator {
    add(a, b, c = 0) { // Different signature
        return super.add(a, b) + c;
    }
}

// This can cause confusion when used polymorphically
const calc = new ScientificCalculator();
console.log(calc.add(1, 2)); // Works, but third parameter is ignored

// ✅ Maintain consistent method signatures
class ScientificCalculatorFixed extends Calculator {
    add(a, b) {
        return super.add(a, b);
    }
    
    addThree(a, b, c) {
        return this.add(a, b) + c;
    }
}
```

### 5. Template Literal Gotchas
```javascript
// ❌ Unintended expression evaluation
const userInput = '${alert("XSS")}';
const message = `Hello ${userInput}`; // Safe - treated as string

// But be careful with eval-like functions
const dangerousTemplate = `Hello ${eval(userInput)}`; // Dangerous!

// ✅ Always sanitize user input
function sanitize(input) {
    return input.replace(/[<>"'&]/g, (char) => {
        const entities = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
        };
        return entities[char];
    });
}

const safeMessage = `Hello ${sanitize(userInput)}`;

// ❌ Performance issues with large templates
function generateLargeHTML(items) {
    let html = '';
    items.forEach(item => {
        html += `<div>${item.name}</div>`; // String concatenation in loop
    });
    return html;
}

// ✅ Use array join for better performance
function generateLargeHTMLFixed(items) {
    return items.map(item => `<div>${item.name}</div>`).join('');
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Advanced Destructuring
```javascript
// Create a function that extracts and transforms data from a complex API response
function processApiResponse(response) {
    // Your implementation here
    // Extract: user name, email, first hobby, remaining hobbies, and address city
    // Handle cases where data might be missing
    // Return an object with: userName, userEmail, primaryHobby, otherHobbies, city
}

// Test data:
const apiResponse = {
    data: {
        user: {
            profile: {
                name: 'Alice Johnson',
                contact: {
                    email: 'alice@example.com',
                    phone: '123-456-7890'
                }
            },
            preferences: {
                hobbies: ['reading', 'swimming', 'photography'],
                settings: {
                    theme: 'dark'
                }
            },
            location: {
                address: {
                    street: '123 Main St',
                    city: 'New York',
                    country: 'USA'
                }
            }
        }
    },
    meta: {
        timestamp: '2023-01-01T00:00:00Z'
    }
};

// Expected output:
// {
//   userName: 'Alice Johnson',
//   userEmail: 'alice@example.com',
//   primaryHobby: 'reading',
//   otherHobbies: ['swimming', 'photography'],
//   city: 'New York'
// }
```

### Problem 2: Class with Mixins
```javascript
// Create a Vehicle class system with mixins for different capabilities

// Base Vehicle class
class Vehicle {
    constructor(make, model, year) {
        // Your implementation
    }
}

// Mixins
const Drivable = {
    // Add methods: start(), stop(), accelerate(speed), brake()
};

const Flyable = {
    // Add methods: takeOff(), land(), setAltitude(altitude)
};

const Floatable = {
    // Add methods: launch(), dock(), setDepth(depth)
};

// Create specific vehicle types:
// Car (Drivable)
// Airplane (Drivable, Flyable)
// Boat (Drivable, Floatable)
// AmphibiousVehicle (Drivable, Flyable, Floatable)

// Test your implementation:
const car = new Car('Toyota', 'Camry', 2023);
const plane = new Airplane('Boeing', '737', 2022);
const boat = new Boat('Yamaha', 'WaveRunner', 2023);
const amphibious = new AmphibiousVehicle('DUKW', 'Amphibian', 1944);

// All should work:
car.start();
car.accelerate(60);

plane.start();
plane.takeOff();
plane.setAltitude(30000);

boat.launch();
boat.accelerate(25);

amphibious.start();
amphibious.accelerate(30);
amphibious.takeOff();
amphibious.launch();
```

### Problem 3: Module System
```javascript
// Create a plugin system using ES6 modules

// plugin-manager.js
// Create a PluginManager class that can:
// - Register plugins dynamically
// - Load plugins from files
// - Execute plugin hooks
// - Handle plugin dependencies

class PluginManager {
    constructor() {
        // Your implementation
    }
    
    async loadPlugin(pluginPath) {
        // Load plugin from file path
    }
    
    registerPlugin(name, plugin) {
        // Register plugin manually
    }
    
    executeHook(hookName, ...args) {
        // Execute all plugins that have this hook
    }
    
    getPlugin(name) {
        // Get specific plugin
    }
}

// Example plugins:
// plugins/logger.js
export default {
    name: 'logger',
    hooks: {
        beforeRequest: (url) => console.log(`Making request to: ${url}`),
        afterRequest: (response) => console.log(`Response status: ${response.status}`)
    }
};

// plugins/cache.js
export default {
    name: 'cache',
    dependencies: ['logger'],
    hooks: {
        beforeRequest: (url) => {
            // Check cache
        },
        afterRequest: (response) => {
            // Store in cache
        }
    }
};

// Usage:
const pm = new PluginManager();
await pm.loadPlugin('./plugins/logger.js');
await pm.loadPlugin('./plugins/cache.js');

pm.executeHook('beforeRequest', 'https://api.example.com/users');
```

### Problem 4: Advanced Template Literals
```javascript
// Create a template engine using tagged template literals

// Your implementation should support:
// - Variable interpolation
// - Conditional rendering
// - Loop rendering
// - Nested templates
// - Escaping for security

function template(strings, ...values) {
    // Your implementation here
    // Should handle special syntax like:
    // ${if condition}...${endif}
    // ${for item in items}...${endfor}
    // ${include 'template-name'}
}

// Register sub-templates
template.register = function(name, templateFn) {
    // Register named templates
};

// Example usage:
const users = [
    { name: 'Alice', active: true, role: 'admin' },
    { name: 'Bob', active: false, role: 'user' },
    { name: 'Charlie', active: true, role: 'user' }
];

const userListTemplate = template`
    <div class="user-list">
        <h2>Users (${users.length})</h2>
        ${for user in users}
            <div class="user ${user.active ? 'active' : 'inactive'}">
                <h3>${user.name}</h3>
                <p>Role: ${user.role}</p>
                ${if user.role === 'admin'}
                    <span class="badge">Administrator</span>
                ${endif}
            </div>
        ${endfor}
    </div>
`;

console.log(userListTemplate);
```

### Problem 5: Async Class with Error Handling
```javascript
// Create a DataService class that handles async operations with proper error handling

class DataService {
    constructor(baseUrl, options = {}) {
        // Your implementation
        // Should support: timeout, retries, caching, rate limiting
    }
    
    async get(endpoint, options = {}) {
        // GET request with error handling
    }
    
    async post(endpoint, data, options = {}) {
        // POST request with error handling
    }
    
    async put(endpoint, data, options = {}) {
        // PUT request with error handling
    }
    
    async delete(endpoint, options = {}) {
        // DELETE request with error handling
    }
    
    // Private methods for:
    // - Retry logic
    // - Rate limiting
    // - Caching
    // - Request/response transformation
}

// Usage should support:
const api = new DataService('https://api.example.com', {
    timeout: 5000,
    retries: 3,
    cache: true,
    rateLimit: { requests: 100, per: 'minute' }
});

// All methods should return promises and handle errors gracefully
try {
    const users = await api.get('/users');
    const newUser = await api.post('/users', { name: 'Alice', email: 'alice@example.com' });
    const updatedUser = await api.put(`/users/${newUser.id}`, { name: 'Alice Smith' });
    await api.delete(`/users/${newUser.id}`);
} catch (error) {
    console.error('API operation failed:', error);
}
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `let`, `const`, and `var`?**
- `var`: Function-scoped, hoisted, can be redeclared
- `let`: Block-scoped, hoisted but in temporal dead zone, cannot be redeclared
- `const`: Block-scoped, hoisted but in temporal dead zone, cannot be reassigned or redeclared

**Q: When should you use arrow functions vs regular functions?**
- Arrow functions: Callbacks, array methods, when you want lexical `this`
- Regular functions: Object methods, constructors, when you need dynamic `this`

**Q: What are the benefits of destructuring?**
- Cleaner code, easier data extraction, default values, swapping variables
- Reduces repetitive property access, makes function parameters more readable

**Q: How do ES6 modules differ from CommonJS?**
- ES6: Static analysis, tree shaking, top-level await, import/export syntax
- CommonJS: Dynamic loading, require/module.exports, synchronous

**Q: What are the advantages of ES6 classes over function constructors?**
- Cleaner syntax, built-in inheritance with `extends`, static methods, private fields
- Better error messages, no accidental function calls without `new`

### 🏢 Asked at Companies:
- **Google**: "Implement a module bundler that handles ES6 imports"
- **Facebook**: "Create a React-like component system using ES6 classes"
- **Amazon**: "Design a plugin architecture using ES6 modules and dynamic imports"
- **Microsoft**: "Implement a template engine using tagged template literals"
- **Netflix**: "Create a data fetching library with classes and async/await"

## 🎯 Key Takeaways

1. **Arrow functions** - Great for callbacks and when you need lexical `this`
2. **Template literals** - Much cleaner than string concatenation
3. **Destructuring** - Powerful way to extract data from arrays and objects
4. **Spread/Rest** - Flexible operators for arrays, objects, and function parameters
5. **Modules** - Proper way to organize and share code
6. **Classes** - Clean syntax for object-oriented programming
7. **Enhanced object literals** - Shorthand properties and computed names
8. **Default parameters** - Cleaner function definitions

---

**Previous Chapter**: [← Error Handling & Debugging](./11-error-handling.md)  
**Next Chapter**: [DOM Manipulation →](./13-dom-manipulation.md)

**Practice**: Try the ES6+ problems and experiment with modern JavaScript features!