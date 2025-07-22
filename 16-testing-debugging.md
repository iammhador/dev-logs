# Chapter 16: Testing & Debugging 🧪

## 📚 Table of Contents
- [Testing Fundamentals](#testing-fundamentals)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test-Driven Development (TDD)](#test-driven-development-tdd)
- [Debugging Techniques](#debugging-techniques)
- [Browser DevTools](#browser-devtools)
- [Performance Testing](#performance-testing)
- [Common Pitfalls](#common-pitfalls)
- [Practice Problems](#practice-problems)
- [Interview Notes](#interview-notes)

---

## 🎯 Testing Fundamentals

### What is Testing?
Testing ensures your code works as expected and helps prevent bugs from reaching production.

### Types of Testing
```javascript
// 1. Unit Testing - Test individual functions/components
function add(a, b) {
    return a + b;
}

// Test
expect(add(2, 3)).toBe(5);

// 2. Integration Testing - Test component interactions
class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
    
    getResult() {
        return this.result;
    }
}

// Integration test
const calc = new Calculator();
expect(calc.add(5).add(3).getResult()).toBe(8);

// 3. End-to-End Testing - Test complete user workflows
// (Usually done with tools like Cypress, Playwright)
```

### Testing Pyramid
```
    /\     E2E Tests (Few, Slow, Expensive)
   /  \
  /____\   Integration Tests (Some, Medium)
 /______\  Unit Tests (Many, Fast, Cheap)
```

---

## 🔬 Unit Testing

### Basic Test Structure
```javascript
// Using Jest syntax (most popular)
describe('Math utilities', () => {
    test('should add two numbers correctly', () => {
        // Arrange
        const a = 2;
        const b = 3;
        
        // Act
        const result = add(a, b);
        
        // Assert
        expect(result).toBe(5);
    });
    
    test('should handle negative numbers', () => {
        expect(add(-2, 3)).toBe(1);
        expect(add(-2, -3)).toBe(-5);
    });
});
```

### Testing Async Code
```javascript
// Testing Promises
test('should fetch user data', async () => {
    const userData = await fetchUser(1);
    expect(userData.name).toBe('John Doe');
});

// Testing with async/await
test('should handle API errors', async () => {
    await expect(fetchUser(-1)).rejects.toThrow('User not found');
});

// Testing callbacks
test('should call callback with result', (done) => {
    processData('input', (result) => {
        expect(result).toBe('processed: input');
        done();
    });
});
```

### Mocking and Spies
```javascript
// Mocking functions
const mockFetch = jest.fn();
global.fetch = mockFetch;

test('should call API with correct parameters', async () => {
    mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ id: 1, name: 'John' })
    });
    
    const user = await getUser(1);
    
    expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
    expect(user.name).toBe('John');
});

// Spying on methods
test('should log user creation', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    createUser('John');
    
    expect(consoleSpy).toHaveBeenCalledWith('User created: John');
    
    consoleSpy.mockRestore();
});

// Mocking modules
jest.mock('./userService', () => ({
    getUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Mock User' }))
}));
```

### Testing Classes
```javascript
class UserManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.users = [];
    }
    
    async addUser(userData) {
        const user = await this.apiService.createUser(userData);
        this.users.push(user);
        return user;
    }
    
    getUserCount() {
        return this.users.length;
    }
}

describe('UserManager', () => {
    let userManager;
    let mockApiService;
    
    beforeEach(() => {
        mockApiService = {
            createUser: jest.fn()
        };
        userManager = new UserManager(mockApiService);
    });
    
    test('should add user and update count', async () => {
        const userData = { name: 'John', email: 'john@example.com' };
        const createdUser = { id: 1, ...userData };
        
        mockApiService.createUser.mockResolvedValue(createdUser);
        
        const result = await userManager.addUser(userData);
        
        expect(result).toEqual(createdUser);
        expect(userManager.getUserCount()).toBe(1);
        expect(mockApiService.createUser).toHaveBeenCalledWith(userData);
    });
});
```

### Testing DOM Manipulation
```javascript
// Using jsdom (automatically set up in Jest)
test('should create button element', () => {
    document.body.innerHTML = '<div id="container"></div>';
    
    const button = createButton('Click me', () => console.log('clicked'));
    document.getElementById('container').appendChild(button);
    
    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toBe('Click me');
    expect(document.querySelector('button')).toBeTruthy();
});

// Testing event handlers
test('should handle button click', () => {
    const mockHandler = jest.fn();
    const button = createButton('Test', mockHandler);
    
    button.click();
    
    expect(mockHandler).toHaveBeenCalled();
});
```

---

## 🔗 Integration Testing

### Testing Component Interactions
```javascript
// Testing multiple components working together
class TodoApp {
    constructor() {
        this.todos = [];
        this.storage = new LocalStorage();
        this.ui = new TodoUI();
    }
    
    addTodo(text) {
        const todo = { id: Date.now(), text, completed: false };
        this.todos.push(todo);
        this.storage.save('todos', this.todos);
        this.ui.render(this.todos);
        return todo;
    }
}

describe('TodoApp Integration', () => {
    let app;
    
    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = '<div id="todo-container"></div>';
        localStorage.clear();
        app = new TodoApp();
    });
    
    test('should add todo and persist to storage', () => {
        const todo = app.addTodo('Learn testing');
        
        // Check todo was added
        expect(app.todos).toContain(todo);
        
        // Check storage was updated
        const stored = JSON.parse(localStorage.getItem('todos'));
        expect(stored).toContain(todo);
        
        // Check UI was updated
        expect(document.querySelector('.todo-item')).toBeTruthy();
    });
});
```

### API Integration Testing
```javascript
// Testing with real API calls (use sparingly)
describe('User API Integration', () => {
    test('should create and retrieve user', async () => {
        // Create user
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`
        };
        
        const createdUser = await userAPI.create(userData);
        expect(createdUser.id).toBeDefined();
        expect(createdUser.name).toBe(userData.name);
        
        // Retrieve user
        const retrievedUser = await userAPI.get(createdUser.id);
        expect(retrievedUser).toEqual(createdUser);
        
        // Cleanup
        await userAPI.delete(createdUser.id);
    });
});

// Better: Mock the API layer
class UserService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }
    
    async createUser(userData) {
        const response = await this.apiClient.post('/users', userData);
        return response.data;
    }
}

test('UserService integration with API client', async () => {
    const mockApiClient = {
        post: jest.fn().mockResolvedValue({
            data: { id: 1, name: 'John', email: 'john@example.com' }
        })
    };
    
    const userService = new UserService(mockApiClient);
    const result = await userService.createUser({ name: 'John' });
    
    expect(mockApiClient.post).toHaveBeenCalledWith('/users', { name: 'John' });
    expect(result.id).toBe(1);
});
```

---

## 🎭 End-to-End Testing

### Cypress Example
```javascript
// cypress/integration/todo-app.spec.js
describe('Todo App E2E', () => {
    beforeEach(() => {
        cy.visit('/todo-app');
    });
    
    it('should add and complete a todo', () => {
        // Add todo
        cy.get('[data-testid="todo-input"]')
            .type('Learn Cypress{enter}');
        
        // Verify todo appears
        cy.get('[data-testid="todo-item"]')
            .should('contain', 'Learn Cypress')
            .should('not.have.class', 'completed');
        
        // Complete todo
        cy.get('[data-testid="todo-checkbox"]').click();
        
        // Verify completion
        cy.get('[data-testid="todo-item"]')
            .should('have.class', 'completed');
    });
    
    it('should persist todos after page reload', () => {
        cy.get('[data-testid="todo-input"]')
            .type('Persistent todo{enter}');
        
        cy.reload();
        
        cy.get('[data-testid="todo-item"]')
            .should('contain', 'Persistent todo');
    });
});
```

### Playwright Example
```javascript
// tests/todo-app.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Todo App', () => {
    test('should handle user workflow', async ({ page }) => {
        await page.goto('/todo-app');
        
        // Add multiple todos
        await page.fill('[data-testid="todo-input"]', 'First todo');
        await page.press('[data-testid="todo-input"]', 'Enter');
        
        await page.fill('[data-testid="todo-input"]', 'Second todo');
        await page.press('[data-testid="todo-input"]', 'Enter');
        
        // Check todos are visible
        await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(2);
        
        // Complete first todo
        await page.click('[data-testid="todo-checkbox"]:first-child');
        
        // Filter completed todos
        await page.click('[data-testid="filter-completed"]');
        await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(1);
    });
});
```

---

## 🔄 Test-Driven Development (TDD)

### TDD Cycle: Red-Green-Refactor
```javascript
// 1. RED: Write a failing test
test('should calculate area of rectangle', () => {
    expect(calculateArea(5, 3)).toBe(15);
});

// 2. GREEN: Write minimal code to pass
function calculateArea(width, height) {
    return width * height;
}

// 3. REFACTOR: Improve the code
function calculateArea(width, height) {
    if (width <= 0 || height <= 0) {
        throw new Error('Dimensions must be positive');
    }
    return width * height;
}

// Add more tests
test('should throw error for negative dimensions', () => {
    expect(() => calculateArea(-5, 3)).toThrow('Dimensions must be positive');
    expect(() => calculateArea(5, -3)).toThrow('Dimensions must be positive');
});
```

### TDD Example: Building a Shopping Cart
```javascript
// Step 1: Write tests first
describe('ShoppingCart', () => {
    let cart;
    
    beforeEach(() => {
        cart = new ShoppingCart();
    });
    
    test('should start empty', () => {
        expect(cart.getItems()).toEqual([]);
        expect(cart.getTotal()).toBe(0);
    });
    
    test('should add items', () => {
        cart.addItem({ id: 1, name: 'Apple', price: 1.50 });
        expect(cart.getItems()).toHaveLength(1);
        expect(cart.getTotal()).toBe(1.50);
    });
    
    test('should handle quantity', () => {
        cart.addItem({ id: 1, name: 'Apple', price: 1.50 }, 3);
        expect(cart.getTotal()).toBe(4.50);
    });
});

// Step 2: Implement to pass tests
class ShoppingCart {
    constructor() {
        this.items = [];
    }
    
    getItems() {
        return this.items;
    }
    
    addItem(item, quantity = 1) {
        this.items.push({ ...item, quantity });
    }
    
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
}
```

---

## 🐛 Debugging Techniques

### Console Debugging
```javascript
// Basic logging
console.log('Variable value:', myVariable);
console.error('Error occurred:', error);
console.warn('Warning:', warning);

// Advanced console methods
console.table(arrayOfObjects); // Display as table
console.group('User Operations');
console.log('Creating user...');
console.log('Validating data...');
console.groupEnd();

// Conditional logging
console.assert(user.age >= 18, 'User must be 18 or older');

// Performance timing
console.time('API Call');
await fetchUserData();
console.timeEnd('API Call');

// Stack trace
console.trace('Execution path');
```

### Debugger Statement
```javascript
function processUserData(userData) {
    // Execution will pause here when DevTools is open
    debugger;
    
    const processed = userData.map(user => {
        debugger; // Pause for each iteration
        return {
            ...user,
            fullName: `${user.firstName} ${user.lastName}`
        };
    });
    
    return processed;
}
```

### Error Handling for Debugging
```javascript
// Custom error with context
class ValidationError extends Error {
    constructor(message, field, value) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
        this.timestamp = new Date().toISOString();
    }
}

function validateUser(user) {
    if (!user.email) {
        throw new ValidationError(
            'Email is required',
            'email',
            user.email
        );
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent default browser behavior
});
```

### Debugging Async Code
```javascript
// Debug async/await
async function fetchUserData(userId) {
    try {
        console.log('Fetching user:', userId);
        
        const response = await fetch(`/api/users/${userId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        return userData;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

// Debug promises
fetchUserData(123)
    .then(user => {
        console.log('Success:', user);
        return user;
    })
    .catch(error => {
        console.error('Failed:', error);
        return null;
    });
```

---

## 🔧 Browser DevTools

### Sources Panel Debugging
```javascript
// Set breakpoints programmatically
function complexCalculation(data) {
    let result = 0;
    
    for (let i = 0; i < data.length; i++) {
        // Set conditional breakpoint: i === 5
        result += data[i] * 2;
        
        if (result > 100) {
            // Logpoint: console.log('Result exceeded 100:', result)
            break;
        }
    }
    
    return result;
}
```

### Network Panel Debugging
```javascript
// Monitor network requests
class APIClient {
    async request(url, options = {}) {
        const startTime = performance.now();
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            const endTime = performance.now();
            console.log(`Request to ${url} took ${endTime - startTime}ms`);
            
            return response;
        } catch (error) {
            console.error(`Request to ${url} failed:`, error);
            throw error;
        }
    }
}
```

### Performance Panel Debugging
```javascript
// Mark performance events
function expensiveOperation() {
    performance.mark('expensive-start');
    
    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
        result += Math.random();
    }
    
    performance.mark('expensive-end');
    performance.measure('expensive-operation', 'expensive-start', 'expensive-end');
    
    // Get measurements
    const measures = performance.getEntriesByType('measure');
    console.log('Performance measures:', measures);
    
    return result;
}
```

### Memory Debugging
```javascript
// Detect memory leaks
class MemoryTracker {
    constructor() {
        this.objects = new Set();
    }
    
    track(obj) {
        this.objects.add(obj);
        return obj;
    }
    
    untrack(obj) {
        this.objects.delete(obj);
    }
    
    getTrackedCount() {
        return this.objects.size;
    }
    
    logMemoryUsage() {
        if (performance.memory) {
            console.log('Memory usage:', {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                tracked: this.getTrackedCount()
            });
        }
    }
}

const memoryTracker = new MemoryTracker();

// Usage
const user = memoryTracker.track(new User());
// ... use user
memoryTracker.untrack(user);
```

---

## ⚡ Performance Testing

### Benchmarking
```javascript
// Simple benchmark
function benchmark(fn, iterations = 1000) {
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    
    const end = performance.now();
    return end - start;
}

// Compare implementations
function compareImplementations() {
    const data = Array.from({ length: 1000 }, (_, i) => i);
    
    const forLoopTime = benchmark(() => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum;
    });
    
    const reduceTime = benchmark(() => {
        return data.reduce((sum, num) => sum + num, 0);
    });
    
    console.log('For loop:', forLoopTime + 'ms');
    console.log('Reduce:', reduceTime + 'ms');
}
```

### Load Testing
```javascript
// Simulate concurrent users
async function loadTest(url, concurrentUsers = 10, requestsPerUser = 100) {
    const results = [];
    
    const userPromises = Array.from({ length: concurrentUsers }, async (_, userId) => {
        const userResults = [];
        
        for (let i = 0; i < requestsPerUser; i++) {
            const start = performance.now();
            
            try {
                const response = await fetch(url);
                const end = performance.now();
                
                userResults.push({
                    userId,
                    requestId: i,
                    status: response.status,
                    duration: end - start,
                    success: response.ok
                });
            } catch (error) {
                userResults.push({
                    userId,
                    requestId: i,
                    error: error.message,
                    success: false
                });
            }
        }
        
        return userResults;
    });
    
    const allResults = await Promise.all(userPromises);
    const flatResults = allResults.flat();
    
    // Analyze results
    const successRate = flatResults.filter(r => r.success).length / flatResults.length;
    const avgDuration = flatResults
        .filter(r => r.duration)
        .reduce((sum, r) => sum + r.duration, 0) / flatResults.length;
    
    console.log('Load test results:', {
        totalRequests: flatResults.length,
        successRate: (successRate * 100).toFixed(2) + '%',
        averageDuration: avgDuration.toFixed(2) + 'ms'
    });
    
    return flatResults;
}
```

---

## ⚠️ Common Pitfalls

### 1. Testing Implementation Details
```javascript
// ❌ Testing internal implementation
test('should call internal method', () => {
    const spy = jest.spyOn(calculator, '_internalCalculation');
    calculator.add(2, 3);
    expect(spy).toHaveBeenCalled();
});

// ✅ Test behavior, not implementation
test('should add numbers correctly', () => {
    expect(calculator.add(2, 3)).toBe(5);
});
```

### 2. Flaky Tests
```javascript
// ❌ Time-dependent test
test('should process within 100ms', async () => {
    const start = Date.now();
    await processData();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Flaky!
});

// ✅ Mock time or use proper async testing
test('should process data correctly', async () => {
    const result = await processData();
    expect(result).toEqual(expectedResult);
});
```

### 3. Not Cleaning Up
```javascript
// ❌ Not cleaning up after tests
test('should handle user login', () => {
    localStorage.setItem('user', JSON.stringify(user));
    // Test logic...
    // localStorage still contains data!
});

// ✅ Clean up properly
test('should handle user login', () => {
    localStorage.setItem('user', JSON.stringify(user));
    // Test logic...
    
    // Cleanup
    localStorage.clear();
});

// Better: Use beforeEach/afterEach
afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});
```

### 4. Over-mocking
```javascript
// ❌ Mocking everything
test('should process user data', () => {
    const mockUser = { name: 'John' };
    const mockProcessor = jest.fn().mockReturnValue('processed');
    const mockValidator = jest.fn().mockReturnValue(true);
    
    // Test becomes meaningless
});

// ✅ Mock only external dependencies
test('should process user data', () => {
    const mockApiCall = jest.fn().mockResolvedValue(userData);
    // Test actual processing logic
});
```

### 5. Debugging in Production
```javascript
// ❌ Leaving debug code in production
function processPayment(amount) {
    console.log('Processing payment:', amount); // Remove this!
    debugger; // Remove this!
    
    // Payment logic
}

// ✅ Use environment-aware logging
function processPayment(amount) {
    if (process.env.NODE_ENV === 'development') {
        console.log('Processing payment:', amount);
    }
    
    // Payment logic
}
```

---

## 🏋️ Mini Practice Problems

### Problem 1: Test a User Registration System
```javascript
// Implement and test a user registration system
class UserRegistration {
    constructor(userService, emailService) {
        this.userService = userService;
        this.emailService = emailService;
    }
    
    async register(userData) {
        // Your implementation here
        // Should:
        // - Validate user data
        // - Check if user already exists
        // - Create user account
        // - Send welcome email
        // - Return user object
    }
}

// Write comprehensive tests for:
// - Valid registration
// - Invalid data handling
// - Duplicate user handling
// - Email service failures
// - Database errors
```

### Problem 2: Debug a Shopping Cart Bug
```javascript
// This shopping cart has bugs - find and fix them
class ShoppingCart {
    constructor() {
        this.items = [];
    }
    
    addItem(product, quantity) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
    }
    
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }
    
    applyDiscount(percentage) {
        this.items.forEach(item => {
            item.price = item.price * (1 - percentage / 100);
        });
    }
}

// Issues to find:
// 1. What happens with negative quantities?
// 2. What if product price is not a number?
// 3. What if discount is applied multiple times?
// 4. What about floating point precision?
// 5. What if items array is modified during iteration?
```

### Problem 3: Performance Test a Data Processing Function
```javascript
// Test and optimize this data processing function
function processLargeDataset(data) {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        if (item.active && item.score > 50) {
            const processed = {
                id: item.id,
                name: item.name.toUpperCase(),
                category: item.category,
                normalizedScore: item.score / 100,
                tags: item.tags.filter(tag => tag.length > 3)
            };
            
            result.push(processed);
        }
    }
    
    return result.sort((a, b) => b.normalizedScore - a.normalizedScore);
}

// Tasks:
// 1. Write performance benchmarks
// 2. Identify bottlenecks
// 3. Optimize the function
// 4. Compare before/after performance
// 5. Test with different data sizes
```

### Problem 4: E2E Test a Todo Application
```javascript
// Write comprehensive E2E tests for a todo app
// Features to test:
// - Add new todos
// - Mark todos as complete
// - Edit existing todos
// - Delete todos
// - Filter todos (all, active, completed)
// - Clear completed todos
// - Persist data across page reloads
// - Handle empty states
// - Validate input constraints

// Use Cypress or Playwright to implement:
describe('Todo Application E2E', () => {
    // Your test implementations here
});
```

### Problem 5: Debug Memory Leaks
```javascript
// This code has memory leaks - find and fix them
class EventManager {
    constructor() {
        this.listeners = new Map();
        this.timers = [];
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        
        this.listeners.get(element).push({ event, handler });
    }
    
    startPeriodicTask(callback, interval) {
        const timerId = setInterval(callback, interval);
        this.timers.push(timerId);
        return timerId;
    }
    
    createDOMElements() {
        const container = document.createElement('div');
        
        for (let i = 0; i < 1000; i++) {
            const element = document.createElement('div');
            element.innerHTML = `Item ${i}`;
            
            this.addEventListener(element, 'click', () => {
                console.log(`Clicked item ${i}`);
            });
            
            container.appendChild(element);
        }
        
        return container;
    }
}

// Issues to identify:
// 1. Event listeners not being removed
// 2. Timers not being cleared
// 3. DOM references being held
// 4. Closure memory retention
// 5. Missing cleanup methods
```

---

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between unit, integration, and E2E tests?**
- **Unit**: Test individual functions/components in isolation
- **Integration**: Test how components work together
- **E2E**: Test complete user workflows from start to finish
- **Pyramid**: Many unit tests, some integration tests, few E2E tests

**Q: How do you test async code?**
- Use `async/await` in test functions
- Return promises from test functions
- Use `done` callback for callback-based code
- Mock async dependencies appropriately

**Q: What are mocks, stubs, and spies?**
- **Mock**: Replace entire object/function with fake implementation
- **Stub**: Replace specific method with predetermined behavior
- **Spy**: Monitor calls to existing function without replacing it

**Q: How do you debug JavaScript in production?**
- Use proper logging (not console.log)
- Implement error tracking (Sentry, Bugsnag)
- Use source maps for meaningful stack traces
- Monitor performance metrics
- Implement feature flags for safe rollbacks

**Q: What's Test-Driven Development (TDD)?**
- Write failing test first (Red)
- Write minimal code to pass (Green)
- Refactor while keeping tests green (Refactor)
- Benefits: Better design, fewer bugs, confidence in changes

**Q: How do you handle flaky tests?**
- Identify root cause (timing, dependencies, environment)
- Use proper async testing patterns
- Mock external dependencies
- Avoid time-dependent assertions
- Implement proper test isolation

### 🏢 Asked at Companies:
- **Google**: "How would you test a complex React component with multiple async operations?"
- **Facebook**: "Debug this performance issue in a large dataset processing function"
- **Amazon**: "Design a testing strategy for a microservices architecture"
- **Microsoft**: "How do you ensure code quality in a large team?"
- **Netflix**: "Test a video streaming component with various network conditions"

## 🎯 Key Takeaways

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Follow the testing pyramid** - Many unit tests, fewer integration/E2E tests
3. **Write tests first** - TDD leads to better design and fewer bugs
4. **Mock external dependencies** - Keep tests fast and reliable
5. **Use proper debugging tools** - Browser DevTools, debugger statements, logging
6. **Clean up after tests** - Prevent test pollution and flaky tests
7. **Test edge cases** - Empty inputs, error conditions, boundary values
8. **Monitor performance** - Use benchmarks and profiling tools

---

**Previous Chapter**: [← Browser APIs](./15-browser-apis.md)  
**Next Chapter**: [Performance Optimization →](./17-performance-optimization.md)

**Practice**: Write comprehensive tests for a real project and use debugging tools to optimize performance!