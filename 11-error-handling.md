# 📚 Chapter 11: Error Handling & Debugging

> Master error handling, debugging techniques, and building robust JavaScript applications.

## 📖 Plain English Explanation

Error handling is like having safety nets and emergency procedures:
- **Smoke detectors** = catching errors before they cause damage
- **First aid kit** = having tools ready to handle problems
- **Emergency exits** = graceful ways to handle failures
- **Security cameras** = logging and monitoring to understand what went wrong
- **Building codes** = following best practices to prevent errors

In programming, errors are inevitable. Good error handling makes your applications resilient, user-friendly, and easier to debug.

## 🚨 Types of Errors

### Syntax Errors
```javascript
// ❌ Syntax errors - code won't run at all
function badSyntax() {
    console.log('Hello World'; // Missing closing parenthesis
    
    if (true {
        console.log('Missing closing parenthesis');
    }
    
    const obj = {
        name: 'Alice'
        age: 30 // Missing comma
    };
}

// These are caught by the JavaScript parser before execution
```

### Reference Errors
```javascript
// ❌ ReferenceError - using undefined variables
function referenceErrors() {
    console.log(undefinedVariable); // ReferenceError: undefinedVariable is not defined
    
    someFunction(); // ReferenceError: someFunction is not defined
    
    // Accessing variables before declaration (temporal dead zone)
    console.log(myLet); // ReferenceError
    let myLet = 'Hello';
}

// ✅ How to avoid
function avoidReferenceErrors() {
    // Check if variable exists
    if (typeof someVariable !== 'undefined') {
        console.log(someVariable);
    }
    
    // Or use optional chaining for object properties
    console.log(window.someProperty?.value);
    
    // Declare variables before use
    let myVar = 'Hello';
    console.log(myVar);
}
```

### Type Errors
```javascript
// ❌ TypeError - wrong type operations
function typeErrors() {
    const num = 42;
    num.toUpperCase(); // TypeError: num.toUpperCase is not a function
    
    const str = 'Hello';
    str.push('World'); // TypeError: str.push is not a function
    
    null.property; // TypeError: Cannot read property 'property' of null
    
    const obj = {};
    obj.method(); // TypeError: obj.method is not a function
}

// ✅ How to avoid
function avoidTypeErrors() {
    const num = 42;
    
    // Check type before operation
    if (typeof num === 'string') {
        console.log(num.toUpperCase());
    }
    
    // Check if method exists
    const obj = {};
    if (typeof obj.method === 'function') {
        obj.method();
    }
    
    // Use optional chaining
    const user = null;
    console.log(user?.name?.toUpperCase?.()); // undefined, no error
    
    // Type checking with instanceof
    const arr = [];
    if (arr instanceof Array) {
        arr.push('item');
    }
}
```

### Range Errors
```javascript
// ❌ RangeError - values outside valid range
function rangeErrors() {
    // Array with invalid length
    new Array(-1); // RangeError: Invalid array length
    
    // Number methods with invalid parameters
    const num = 123.456;
    num.toFixed(-1); // RangeError: toFixed() digits argument must be between 0 and 100
    
    // Stack overflow (infinite recursion)
    function infiniteRecursion() {
        return infiniteRecursion(); // RangeError: Maximum call stack size exceeded
    }
    infiniteRecursion();
}

// ✅ How to avoid
function avoidRangeErrors() {
    // Validate array length
    function createArray(length) {
        if (length < 0 || length > Number.MAX_SAFE_INTEGER) {
            throw new Error('Invalid array length');
        }
        return new Array(length);
    }
    
    // Validate number method parameters
    function safeToFixed(num, digits) {
        if (digits < 0 || digits > 100) {
            digits = 2; // Default value
        }
        return num.toFixed(digits);
    }
    
    // Prevent infinite recursion
    function safeRecursion(n, depth = 0) {
        if (depth > 1000) { // Safety limit
            throw new Error('Maximum recursion depth exceeded');
        }
        
        if (n <= 1) return 1;
        return n * safeRecursion(n - 1, depth + 1);
    }
}
```

### Custom Errors
```javascript
// Creating custom error types
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

class BusinessLogicError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'BusinessLogicError';
        this.code = code;
    }
}

// Using custom errors
function validateUser(user) {
    if (!user.email) {
        throw new ValidationError('Email is required', 'email');
    }
    
    if (!user.email.includes('@')) {
        throw new ValidationError('Invalid email format', 'email');
    }
    
    if (user.age < 0 || user.age > 150) {
        throw new ValidationError('Age must be between 0 and 150', 'age');
    }
}

async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
            throw new NetworkError(
                `Failed to fetch user: ${response.statusText}`,
                response.status
            );
        }
        
        return await response.json();
    } catch (error) {
        if (error instanceof NetworkError) {
            throw error; // Re-throw network errors
        }
        throw new NetworkError('Network request failed', 0);
    }
}

function processPayment(amount, balance) {
    if (amount <= 0) {
        throw new BusinessLogicError('Payment amount must be positive', 'INVALID_AMOUNT');
    }
    
    if (amount > balance) {
        throw new BusinessLogicError('Insufficient funds', 'INSUFFICIENT_FUNDS');
    }
    
    // Process payment...
}
```

## 🛡️ Try-Catch-Finally

### Basic Try-Catch
```javascript
// Basic error handling
function basicTryCatch() {
    try {
        // Code that might throw an error
        const result = riskyOperation();
        console.log('Success:', result);
    } catch (error) {
        // Handle the error
        console.error('Error occurred:', error.message);
    }
}

// Catching specific error types
function specificErrorHandling() {
    try {
        const user = { name: 'Alice' };
        validateUser(user);
        processUser(user);
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error(`Validation failed for ${error.field}: ${error.message}`);
            // Show user-friendly validation message
        } else if (error instanceof NetworkError) {
            console.error(`Network error (${error.statusCode}): ${error.message}`);
            // Show network error message, maybe retry
        } else if (error instanceof BusinessLogicError) {
            console.error(`Business logic error (${error.code}): ${error.message}`);
            // Handle business logic errors
        } else {
            console.error('Unexpected error:', error);
            // Log unexpected errors for debugging
        }
    }
}
```

### Finally Block
```javascript
// Finally block always executes
function tryFinallyExample() {
    let resource = null;
    
    try {
        resource = acquireResource();
        processResource(resource);
        return 'Success';
    } catch (error) {
        console.error('Error processing resource:', error);
        return 'Error';
    } finally {
        // This always runs, regardless of success or error
        if (resource) {
            releaseResource(resource);
            console.log('Resource cleaned up');
        }
    }
}

// Practical example: File handling
async function processFile(filename) {
    let fileHandle = null;
    
    try {
        fileHandle = await openFile(filename);
        const data = await readFile(fileHandle);
        const processed = processData(data);
        await writeFile(fileHandle, processed);
        return processed;
    } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
        throw error;
    } finally {
        // Always close the file, even if an error occurred
        if (fileHandle) {
            await closeFile(fileHandle);
        }
    }
}

// Database transaction example
async function transferMoney(fromAccount, toAccount, amount) {
    const transaction = await db.beginTransaction();
    
    try {
        await db.debit(fromAccount, amount);
        await db.credit(toAccount, amount);
        await transaction.commit();
        return { success: true, transactionId: transaction.id };
    } catch (error) {
        await transaction.rollback();
        console.error('Transfer failed:', error);
        throw new BusinessLogicError('Transfer failed', 'TRANSFER_ERROR');
    } finally {
        // Clean up transaction resources
        await transaction.close();
    }
}
```

### Nested Try-Catch
```javascript
// Multiple levels of error handling
async function complexOperation() {
    try {
        // Outer try-catch for general errors
        const user = await fetchUser();
        
        try {
            // Inner try-catch for specific operation
            const preferences = await fetchUserPreferences(user.id);
            return { user, preferences };
        } catch (prefError) {
            // Handle preference errors gracefully
            console.warn('Could not load preferences:', prefError.message);
            return { user, preferences: getDefaultPreferences() };
        }
        
    } catch (userError) {
        // Handle user fetch errors
        if (userError instanceof NetworkError && userError.statusCode === 404) {
            throw new BusinessLogicError('User not found', 'USER_NOT_FOUND');
        }
        throw userError; // Re-throw other errors
    }
}

// Error recovery with fallbacks
async function robustDataFetch() {
    const sources = [
        () => fetchFromPrimaryAPI(),
        () => fetchFromSecondaryAPI(),
        () => fetchFromCache(),
        () => getDefaultData()
    ];
    
    for (let i = 0; i < sources.length; i++) {
        try {
            const data = await sources[i]();
            if (i > 0) {
                console.warn(`Used fallback source ${i}`);
            }
            return data;
        } catch (error) {
            console.error(`Source ${i} failed:`, error.message);
            
            if (i === sources.length - 1) {
                throw new Error('All data sources failed');
            }
            // Continue to next source
        }
    }
}
```

## 🔍 Debugging Techniques

### Console Methods
```javascript
// Different console methods for debugging
function debuggingWithConsole() {
    const user = { name: 'Alice', age: 30, hobbies: ['reading', 'swimming'] };
    
    // Basic logging
    console.log('User data:', user);
    
    // Different log levels
    console.info('Information message');
    console.warn('Warning message');
    console.error('Error message');
    
    // Formatted output
    console.log('User %s is %d years old', user.name, user.age);
    
    // Table format for arrays/objects
    console.table(user.hobbies);
    console.table([user]);
    
    // Grouping related logs
    console.group('User Processing');
    console.log('Validating user...');
    console.log('User is valid');
    console.log('Processing complete');
    console.groupEnd();
    
    // Timing operations
    console.time('Operation');
    // ... some operation
    console.timeEnd('Operation');
    
    // Counting occurrences
    for (let i = 0; i < 5; i++) {
        console.count('Loop iteration');
    }
    
    // Stack trace
    console.trace('Execution path');
    
    // Conditional logging
    console.assert(user.age > 0, 'Age should be positive');
    
    // Clear console
    // console.clear();
}
```

### Debugger Statement
```javascript
// Using debugger statement
function debuggerExample(data) {
    console.log('Starting processing...');
    
    // Execution will pause here when dev tools are open
    debugger;
    
    const processed = data.map(item => {
        // Another breakpoint
        debugger;
        return item * 2;
    });
    
    return processed;
}

// Conditional debugging
function conditionalDebugging(items) {
    items.forEach((item, index) => {
        // Only break on specific conditions
        if (item.error && process.env.NODE_ENV === 'development') {
            debugger;
        }
        
        processItem(item);
    });
}
```

### Error Boundaries (React-style pattern)
```javascript
// Error boundary pattern for JavaScript
class ErrorBoundary {
    constructor(fallbackUI) {
        this.fallbackUI = fallbackUI;
        this.hasError = false;
        this.error = null;
    }
    
    wrap(fn) {
        return (...args) => {
            try {
                this.hasError = false;
                this.error = null;
                return fn(...args);
            } catch (error) {
                this.hasError = true;
                this.error = error;
                console.error('Error caught by boundary:', error);
                
                if (this.fallbackUI) {
                    return this.fallbackUI(error);
                }
                
                throw error;
            }
        };
    }
    
    wrapAsync(fn) {
        return async (...args) => {
            try {
                this.hasError = false;
                this.error = null;
                return await fn(...args);
            } catch (error) {
                this.hasError = true;
                this.error = error;
                console.error('Async error caught by boundary:', error);
                
                if (this.fallbackUI) {
                    return this.fallbackUI(error);
                }
                
                throw error;
            }
        };
    }
}

// Usage
const errorBoundary = new ErrorBoundary((error) => {
    return { error: true, message: 'Something went wrong' };
});

const safeFunction = errorBoundary.wrap((data) => {
    // This function is now protected
    return riskyOperation(data);
});

const safeAsyncFunction = errorBoundary.wrapAsync(async (url) => {
    const response = await fetch(url);
    return response.json();
});
```

### Logging and Monitoring
```javascript
// Advanced logging system
class Logger {
    constructor(level = 'info') {
        this.level = level;
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }
    
    log(level, message, data = {}) {
        if (this.levels[level] <= this.levels[this.level]) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                level: level.toUpperCase(),
                message,
                data,
                stack: new Error().stack
            };
            
            // In production, send to logging service
            if (process.env.NODE_ENV === 'production') {
                this.sendToLoggingService(logEntry);
            } else {
                console[level](logEntry);
            }
        }
    }
    
    error(message, data) {
        this.log('error', message, data);
    }
    
    warn(message, data) {
        this.log('warn', message, data);
    }
    
    info(message, data) {
        this.log('info', message, data);
    }
    
    debug(message, data) {
        this.log('debug', message, data);
    }
    
    sendToLoggingService(logEntry) {
        // Send to external logging service
        // fetch('/api/logs', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(logEntry)
        // });
    }
}

const logger = new Logger('debug');

// Usage throughout application
function processUser(user) {
    logger.info('Processing user', { userId: user.id });
    
    try {
        validateUser(user);
        logger.debug('User validation passed', { userId: user.id });
        
        const result = performComplexOperation(user);
        logger.info('User processing completed', { 
            userId: user.id, 
            result: result.id 
        });
        
        return result;
    } catch (error) {
        logger.error('User processing failed', {
            userId: user.id,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}
```

## 🔧 Error Handling Patterns

### Result Pattern
```javascript
// Result pattern for explicit error handling
class Result {
    constructor(success, value, error) {
        this.success = success;
        this.value = value;
        this.error = error;
    }
    
    static ok(value) {
        return new Result(true, value, null);
    }
    
    static error(error) {
        return new Result(false, null, error);
    }
    
    isOk() {
        return this.success;
    }
    
    isError() {
        return !this.success;
    }
    
    map(fn) {
        if (this.isOk()) {
            try {
                return Result.ok(fn(this.value));
            } catch (error) {
                return Result.error(error);
            }
        }
        return this;
    }
    
    flatMap(fn) {
        if (this.isOk()) {
            try {
                return fn(this.value);
            } catch (error) {
                return Result.error(error);
            }
        }
        return this;
    }
    
    getOrElse(defaultValue) {
        return this.isOk() ? this.value : defaultValue;
    }
}

// Using Result pattern
function safeParseJSON(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return Result.ok(parsed);
    } catch (error) {
        return Result.error(error);
    }
}

function processUserData(jsonString) {
    return safeParseJSON(jsonString)
        .map(data => data.user)
        .map(user => ({ ...user, processed: true }))
        .flatMap(user => {
            if (!user.email) {
                return Result.error(new Error('Email is required'));
            }
            return Result.ok(user);
        });
}

// Usage
const result = processUserData('{"user": {"name": "Alice", "email": "alice@example.com"}}');

if (result.isOk()) {
    console.log('Processed user:', result.value);
} else {
    console.error('Processing failed:', result.error.message);
}
```

### Circuit Breaker Pattern
```javascript
// Circuit breaker for handling repeated failures
class CircuitBreaker {
    constructor(threshold = 5, timeout = 60000) {
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }
    
    async call(fn, ...args) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        
        try {
            const result = await fn(...args);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }
    
    onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
        }
    }
    
    getState() {
        return this.state;
    }
}

// Usage
const apiCircuitBreaker = new CircuitBreaker(3, 30000); // 3 failures, 30s timeout

async function callAPI(endpoint) {
    return apiCircuitBreaker.call(async () => {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }
        return response.json();
    });
}

// The circuit breaker will prevent calls after 3 failures
// and allow them again after 30 seconds
```

### Retry Pattern
```javascript
// Retry pattern with exponential backoff
class RetryHandler {
    constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
    }
    
    async retry(fn, ...args) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await fn(...args);
            } catch (error) {
                lastError = error;
                
                if (attempt === this.maxRetries) {
                    break;
                }
                
                // Don't retry on certain errors
                if (this.shouldNotRetry(error)) {
                    break;
                }
                
                const delay = this.calculateDelay(attempt);
                console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
                
                await this.sleep(delay);
            }
        }
        
        throw lastError;
    }
    
    shouldNotRetry(error) {
        // Don't retry on client errors (4xx)
        if (error instanceof NetworkError && error.statusCode >= 400 && error.statusCode < 500) {
            return true;
        }
        
        // Don't retry on validation errors
        if (error instanceof ValidationError) {
            return true;
        }
        
        return false;
    }
    
    calculateDelay(attempt) {
        // Exponential backoff with jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.1 * exponentialDelay;
        return Math.min(exponentialDelay + jitter, this.maxDelay);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Usage
const retryHandler = new RetryHandler(3, 1000, 10000);

async function reliableAPICall(endpoint) {
    return retryHandler.retry(async () => {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new NetworkError(
                `API call failed: ${response.statusText}`,
                response.status
            );
        }
        
        return response.json();
    });
}
```

## 🔍 Performance Debugging

### Memory Leak Detection
```javascript
// Memory leak detection utilities
class MemoryMonitor {
    constructor() {
        this.snapshots = [];
        this.listeners = new Set();
    }
    
    takeSnapshot(label) {
        if (performance.memory) {
            const snapshot = {
                label,
                timestamp: Date.now(),
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
            
            this.snapshots.push(snapshot);
            return snapshot;
        }
        
        console.warn('performance.memory not available');
        return null;
    }
    
    compareSnapshots(label1, label2) {
        const snap1 = this.snapshots.find(s => s.label === label1);
        const snap2 = this.snapshots.find(s => s.label === label2);
        
        if (!snap1 || !snap2) {
            console.error('Snapshots not found');
            return null;
        }
        
        const diff = {
            timeDiff: snap2.timestamp - snap1.timestamp,
            memoryDiff: snap2.usedJSHeapSize - snap1.usedJSHeapSize,
            percentageIncrease: ((snap2.usedJSHeapSize - snap1.usedJSHeapSize) / snap1.usedJSHeapSize) * 100
        };
        
        console.log(`Memory change from ${label1} to ${label2}:`, diff);
        return diff;
    }
    
    startMonitoring(interval = 5000) {
        this.monitoringInterval = setInterval(() => {
            this.takeSnapshot(`auto-${Date.now()}`);
            
            // Alert if memory usage is growing rapidly
            if (this.snapshots.length >= 2) {
                const recent = this.snapshots.slice(-2);
                const growth = recent[1].usedJSHeapSize - recent[0].usedJSHeapSize;
                
                if (growth > 10 * 1024 * 1024) { // 10MB growth
                    console.warn('Rapid memory growth detected:', growth / 1024 / 1024, 'MB');
                }
            }
        }, interval);
    }
    
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
}

// Usage
const memoryMonitor = new MemoryMonitor();

function potentiallyLeakyFunction() {
    memoryMonitor.takeSnapshot('before-operation');
    
    // Simulate memory-intensive operation
    const largeArray = new Array(1000000).fill('data');
    
    // Potential leak: not cleaning up event listeners
    const element = document.createElement('div');
    element.addEventListener('click', () => {
        console.log('Clicked');
    });
    
    memoryMonitor.takeSnapshot('after-operation');
    memoryMonitor.compareSnapshots('before-operation', 'after-operation');
    
    // Clean up to prevent leaks
    element.removeEventListener('click', () => {});
}
```

### Performance Profiling
```javascript
// Performance profiling utilities
class Profiler {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
    }
    
    mark(name) {
        const timestamp = performance.now();
        this.marks.set(name, timestamp);
        
        if (performance.mark) {
            performance.mark(name);
        }
    }
    
    measure(name, startMark, endMark) {
        const startTime = this.marks.get(startMark);
        const endTime = this.marks.get(endMark);
        
        if (startTime && endTime) {
            const duration = endTime - startTime;
            this.measures.set(name, duration);
            
            if (performance.measure) {
                performance.measure(name, startMark, endMark);
            }
            
            return duration;
        }
        
        console.error('Start or end mark not found');
        return null;
    }
    
    time(label, fn) {
        return async (...args) => {
            this.mark(`${label}-start`);
            
            try {
                const result = await fn(...args);
                this.mark(`${label}-end`);
                const duration = this.measure(label, `${label}-start`, `${label}-end`);
                
                console.log(`${label} took ${duration.toFixed(2)}ms`);
                return result;
            } catch (error) {
                this.mark(`${label}-end`);
                this.measure(label, `${label}-start`, `${label}-end`);
                throw error;
            }
        };
    }
    
    getReport() {
        const report = {
            marks: Object.fromEntries(this.marks),
            measures: Object.fromEntries(this.measures)
        };
        
        console.table(report.measures);
        return report;
    }
}

// Usage
const profiler = new Profiler();

const timedFunction = profiler.time('data-processing', async (data) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
    return data.map(item => item * 2);
});

// Function will automatically be timed
timedFunction([1, 2, 3, 4, 5]).then(result => {
    console.log('Result:', result);
    profiler.getReport();
});
```

## ⚠️ Common Pitfalls

### 1. Swallowing Errors
```javascript
// ❌ Swallowing errors (hiding problems)
function badErrorHandling() {
    try {
        riskyOperation();
    } catch (error) {
        // Silent failure - very bad!
        // Error is lost, making debugging impossible
    }
}

// ❌ Generic error handling
function genericErrorHandling() {
    try {
        riskyOperation();
    } catch (error) {
        console.log('Something went wrong'); // Not helpful!
    }
}

// ✅ Proper error handling
function goodErrorHandling() {
    try {
        riskyOperation();
    } catch (error) {
        // Log the actual error
        console.error('Risk operation failed:', error);
        
        // Provide context
        logger.error('Risk operation failed', {
            operation: 'riskyOperation',
            timestamp: new Date().toISOString(),
            stack: error.stack
        });
        
        // Re-throw if caller should handle it
        throw error;
    }
}
```

### 2. Not Handling Async Errors
```javascript
// ❌ Unhandled promise rejections
function unhandledPromiseRejection() {
    fetch('/api/data'); // No .catch() - unhandled rejection!
    
    Promise.resolve().then(() => {
        throw new Error('Oops');
    }); // No .catch() - unhandled rejection!
}

// ✅ Proper async error handling
function properAsyncErrorHandling() {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Fetch failed:', error));
    
    Promise.resolve()
        .then(() => {
            throw new Error('Oops');
        })
        .catch(error => console.error('Promise failed:', error));
}

// ✅ With async/await
async function asyncErrorHandling() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Async operation failed:', error);
    }
}

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Log to monitoring service
    logger.error('Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
    });
    
    // Prevent default browser behavior
    event.preventDefault();
});
```

### 3. Improper Error Propagation
```javascript
// ❌ Converting errors to different types unnecessarily
function badErrorPropagation() {
    try {
        const result = validateUser(user);
        return result;
    } catch (validationError) {
        // Don't do this - loses original error information
        throw new Error('User validation failed');
    }
}

// ✅ Proper error propagation
function goodErrorPropagation() {
    try {
        const result = validateUser(user);
        return result;
    } catch (validationError) {
        // Add context but preserve original error
        validationError.context = { userId: user.id, timestamp: Date.now() };
        throw validationError;
    }
}

// ✅ Wrapping with additional context
function errorWrapping() {
    try {
        const result = validateUser(user);
        return result;
    } catch (originalError) {
        const wrappedError = new Error(`User validation failed for user ${user.id}`);
        wrappedError.originalError = originalError;
        wrappedError.userId = user.id;
        throw wrappedError;
    }
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Error-Safe JSON Parser
```javascript
// Create a safe JSON parser that handles various error cases
function safeJSONParse(jsonString, defaultValue = null) {
    // Your implementation here
    // Should handle:
    // - Invalid JSON syntax
    // - null/undefined input
    // - Non-string input
    // - Return defaultValue on any error
    // - Log errors appropriately
}

// Test cases:
console.log(safeJSONParse('{"name": "Alice"}'));        // { name: "Alice" }
console.log(safeJSONParse('invalid json'));             // null
console.log(safeJSONParse(null));                       // null
console.log(safeJSONParse(undefined, {}));              // {}
console.log(safeJSONParse(123));                        // null
```

### Problem 2: Async Operation with Timeout
```javascript
// Create a function that adds timeout to any async operation
function withTimeout(asyncFn, timeoutMs) {
    // Your implementation here
    // Should return a function that:
    // - Calls the original async function
    // - Rejects with timeout error if operation takes too long
    // - Properly cleans up resources
}

// Test:
const slowOperation = () => new Promise(resolve => 
    setTimeout(() => resolve('Done'), 5000)
);

const fastOperation = withTimeout(slowOperation, 2000);

fastOperation()
    .then(result => console.log('Result:', result))
    .catch(error => console.error('Error:', error.message)); // Should timeout
```

### Problem 3: Error Aggregator
```javascript
// Create a utility that collects multiple errors and reports them together
class ErrorAggregator {
    constructor() {
        // Your implementation here
    }
    
    add(error, context = {}) {
        // Add an error with optional context
    }
    
    hasErrors() {
        // Return true if any errors were added
    }
    
    getErrors() {
        // Return array of all errors with context
    }
    
    throwIfAny() {
        // Throw aggregated error if any errors exist
    }
    
    clear() {
        // Clear all errors
    }
}

// Usage:
const errors = new ErrorAggregator();

// Collect multiple validation errors
if (!user.name) errors.add(new Error('Name required'), { field: 'name' });
if (!user.email) errors.add(new Error('Email required'), { field: 'email' });
if (user.age < 0) errors.add(new Error('Invalid age'), { field: 'age' });

if (errors.hasErrors()) {
    console.log('Validation errors:', errors.getErrors());
    errors.throwIfAny(); // Throw combined error
}
```

### Problem 4: Retry with Circuit Breaker
```javascript
// Combine retry logic with circuit breaker pattern
class ResilientCaller {
    constructor(maxRetries = 3, circuitThreshold = 5, circuitTimeout = 30000) {
        // Your implementation here
        // Should combine RetryHandler and CircuitBreaker functionality
    }
    
    async call(fn, ...args) {
        // Your implementation here
        // Should:
        // - Check circuit breaker state
        // - Retry on failures (with exponential backoff)
        // - Update circuit breaker on success/failure
        // - Respect circuit breaker open state
    }
    
    getStats() {
        // Return statistics about calls, failures, circuit state
    }
}

// Test:
const resilientCaller = new ResilientCaller(3, 5, 10000);

const unreliableAPI = () => {
    if (Math.random() < 0.7) {
        throw new Error('API temporarily unavailable');
    }
    return 'Success';
};

// Should retry failures and eventually open circuit
for (let i = 0; i < 10; i++) {
    resilientCaller.call(unreliableAPI)
        .then(result => console.log(`Call ${i}:`, result))
        .catch(error => console.error(`Call ${i}:`, error.message));
}
```

### Problem 5: Error Reporting Service
```javascript
// Create an error reporting service that batches and sends errors
class ErrorReporter {
    constructor(options = {}) {
        this.endpoint = options.endpoint || '/api/errors';
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 30000;
        // Your implementation here
    }
    
    report(error, context = {}) {
        // Add error to batch queue
        // Auto-flush if batch is full
    }
    
    flush() {
        // Send all queued errors to server
        // Return promise that resolves when sent
    }
    
    startAutoFlush() {
        // Start automatic flushing on interval
    }
    
    stopAutoFlush() {
        // Stop automatic flushing
    }
}

// Usage:
const errorReporter = new ErrorReporter({
    endpoint: '/api/errors',
    batchSize: 5,
    flushInterval: 10000
});

errorReporter.startAutoFlush();

// Report errors throughout the application
try {
    riskyOperation();
} catch (error) {
    errorReporter.report(error, {
        userId: currentUser.id,
        page: window.location.pathname,
        userAgent: navigator.userAgent
    });
}
```

## 💼 Interview Notes

### Common Questions:

**Q: What are the different types of errors in JavaScript?**
- Syntax errors: Invalid code structure, caught at parse time
- Reference errors: Using undefined variables or functions
- Type errors: Wrong type operations (calling non-function, accessing null properties)
- Range errors: Values outside valid range (array length, recursion depth)
- Custom errors: Application-specific error types

**Q: What's the difference between throw and return in error handling?**
- `throw`: Stops execution, propagates up the call stack until caught
- `return`: Normal function exit, doesn't indicate error to caller
- Use `throw` for exceptional conditions, `return` for normal flow

**Q: How do you handle errors in async/await vs Promises?**
- Async/await: Use try-catch blocks
- Promises: Use .catch() method
- Both can be combined: async functions return promises

**Q: What are unhandled promise rejections and how do you prevent them?**
- Promises that reject without .catch() handler
- Can crash Node.js applications
- Prevent with global handlers and proper error handling

**Q: What's the purpose of the finally block?**
- Always executes regardless of try/catch outcome
- Used for cleanup (closing files, releasing resources)
- Executes even if return statement in try/catch

### 🏢 Asked at Companies:
- **Google**: "Design an error handling system for a large-scale application"
- **Facebook**: "Implement a circuit breaker pattern from scratch"
- **Amazon**: "How would you debug a memory leak in a JavaScript application?"
- **Microsoft**: "Create a logging system that handles different error severities"
- **Netflix**: "Design error boundaries for a component-based architecture"

## 🎯 Key Takeaways

1. **Handle errors explicitly** - don't let them fail silently
2. **Use appropriate error types** - built-in and custom error classes
3. **Provide meaningful error messages** - include context and actionable information
4. **Log errors properly** - with sufficient detail for debugging
5. **Handle async errors** - use try-catch with async/await or .catch() with promises
6. **Implement error boundaries** - prevent single failures from crashing entire application
7. **Use debugging tools effectively** - console methods, debugger, performance profiling
8. **Plan for failure** - circuit breakers, retries, fallbacks

---

**Previous Chapter**: [← Asynchronous JavaScript](./10-async-javascript.md)  
**Next Chapter**: [ES6+ Features →](./12-es6-features.md)

**Practice**: Try the error handling problems and experiment with different debugging techniques!