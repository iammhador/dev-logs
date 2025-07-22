# 📚 Chapter 10: Asynchronous JavaScript

> Master asynchronous programming with callbacks, promises, async/await, and event handling.

## 📖 Plain English Explanation

Asynchronous programming is like ordering food at a restaurant:
- **Synchronous** = You wait at the counter until your order is ready (blocking)
- **Asynchronous** = You get a number, sit down, and they call you when ready (non-blocking)

In JavaScript, asynchronous operations allow your code to continue running while waiting for:
- **Network requests** (fetching data from APIs)
- **File operations** (reading/writing files)
- **Timers** (setTimeout, setInterval)
- **User interactions** (clicks, form submissions)
- **Database operations** (queries, updates)

## 🔄 Understanding Synchronous vs Asynchronous

### Synchronous Code (Blocking)
```javascript
console.log('Start');

// This blocks execution for 3 seconds
function blockingOperation() {
    const start = Date.now();
    while (Date.now() - start < 3000) {
        // Busy waiting - blocks everything!
    }
    return 'Done waiting';
}

const result = blockingOperation();
console.log(result); // After 3 seconds
console.log('End');  // After 3 seconds

// Output (with 3-second delay):
// Start
// Done waiting
// End
```

### Asynchronous Code (Non-blocking)
```javascript
console.log('Start');

// This doesn't block execution
setTimeout(() => {
    console.log('Async operation completed');
}, 3000);

console.log('End');

// Output (immediate):
// Start
// End
// Async operation completed (after 3 seconds)
```

### The Event Loop
```javascript
// Understanding execution order
console.log('1: Synchronous');

setTimeout(() => {
    console.log('4: Timeout (macrotask)');
}, 0);

Promise.resolve().then(() => {
    console.log('3: Promise (microtask)');
});

console.log('2: Synchronous');

// Output:
// 1: Synchronous
// 2: Synchronous
// 3: Promise (microtask)
// 4: Timeout (macrotask)

// Execution order:
// 1. Synchronous code runs first
// 2. Microtasks (Promises) run next
// 3. Macrotasks (setTimeout) run last
```

## 📞 Callbacks

### Basic Callback Pattern
```javascript
// Simple callback example
function greetUser(name, callback) {
    console.log(`Hello, ${name}!`);
    callback();
}

function afterGreeting() {
    console.log('Nice to meet you!');
}

greetUser('Alice', afterGreeting);
// Output:
// Hello, Alice!
// Nice to meet you!

// Inline callback
greetUser('Bob', function() {
    console.log('How are you doing?');
});

// Arrow function callback
greetUser('Charlie', () => {
    console.log('Have a great day!');
});
```

### Asynchronous Callbacks
```javascript
// Simulating async operation with callback
function fetchUserData(userId, callback) {
    console.log(`Fetching user ${userId}...`);
    
    // Simulate network delay
    setTimeout(() => {
        const userData = {
            id: userId,
            name: 'Alice',
            email: 'alice@example.com'
        };
        
        callback(null, userData); // null = no error
    }, 2000);
}

// Using the async function
fetchUserData(123, (error, user) => {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('User data:', user);
    }
});

console.log('This runs immediately');

// Output:
// Fetching user 123...
// This runs immediately
// User data: { id: 123, name: 'Alice', email: 'alice@example.com' } (after 2 seconds)
```

### Error Handling with Callbacks
```javascript
// Error-first callback pattern (Node.js style)
function riskyOperation(shouldFail, callback) {
    setTimeout(() => {
        if (shouldFail) {
            callback(new Error('Something went wrong!'), null);
        } else {
            callback(null, 'Success!');
        }
    }, 1000);
}

// Success case
riskyOperation(false, (error, result) => {
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Result:', result); // "Result: Success!"
    }
});

// Error case
riskyOperation(true, (error, result) => {
    if (error) {
        console.error('Error:', error.message); // "Error: Something went wrong!"
    } else {
        console.log('Result:', result);
    }
});
```

### Callback Hell
```javascript
// ❌ Callback hell - hard to read and maintain
function getUserProfile(userId) {
    fetchUser(userId, (userError, user) => {
        if (userError) {
            console.error('User error:', userError);
            return;
        }
        
        fetchUserPosts(user.id, (postsError, posts) => {
            if (postsError) {
                console.error('Posts error:', postsError);
                return;
            }
            
            fetchPostComments(posts[0].id, (commentsError, comments) => {
                if (commentsError) {
                    console.error('Comments error:', commentsError);
                    return;
                }
                
                fetchUserFriends(user.id, (friendsError, friends) => {
                    if (friendsError) {
                        console.error('Friends error:', friendsError);
                        return;
                    }
                    
                    // Finally, we have all the data!
                    const profile = {
                        user,
                        posts,
                        comments,
                        friends
                    };
                    
                    console.log('Complete profile:', profile);
                });
            });
        });
    });
}

// Solutions to callback hell:
// 1. Named functions
// 2. Promises
// 3. Async/await
```

## 🤝 Promises

### Creating Promises
```javascript
// Basic Promise creation
const myPromise = new Promise((resolve, reject) => {
    // Async operation
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
        if (success) {
            resolve('Operation successful!'); // Promise fulfilled
        } else {
            reject(new Error('Operation failed!')); // Promise rejected
        }
    }, 1000);
});

// Using the Promise
myPromise
    .then(result => {
        console.log('Success:', result);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
```

### Promise States
```javascript
// Promise has three states:
// 1. Pending - initial state
// 2. Fulfilled - operation completed successfully
// 3. Rejected - operation failed

function createPromise(delay, shouldResolve) {
    return new Promise((resolve, reject) => {
        console.log('Promise is pending...');
        
        setTimeout(() => {
            if (shouldResolve) {
                resolve(`Resolved after ${delay}ms`);
            } else {
                reject(new Error(`Rejected after ${delay}ms`));
            }
        }, delay);
    });
}

// Fulfilled promise
createPromise(1000, true)
    .then(result => console.log('✅', result))
    .catch(error => console.error('❌', error.message));

// Rejected promise
createPromise(1500, false)
    .then(result => console.log('✅', result))
    .catch(error => console.error('❌', error.message));
```

### Promise Chaining
```javascript
// Chaining promises to avoid callback hell
function fetchUser(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id: userId, name: 'Alice', email: 'alice@example.com' });
        }, 1000);
    });
}

function fetchUserPosts(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, title: 'First Post', userId },
                { id: 2, title: 'Second Post', userId }
            ]);
        }, 1000);
    });
}

function fetchPostComments(postId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, text: 'Great post!', postId },
                { id: 2, text: 'Thanks for sharing!', postId }
            ]);
        }, 1000);
    });
}

// ✅ Clean promise chaining
fetchUser(123)
    .then(user => {
        console.log('User:', user);
        return fetchUserPosts(user.id); // Return promise for chaining
    })
    .then(posts => {
        console.log('Posts:', posts);
        return fetchPostComments(posts[0].id);
    })
    .then(comments => {
        console.log('Comments:', comments);
    })
    .catch(error => {
        console.error('Error in chain:', error);
    });
```

### Promise Utility Methods
```javascript
// Promise.all() - wait for all promises to resolve
const promise1 = Promise.resolve(3);
const promise2 = new Promise(resolve => setTimeout(() => resolve('foo'), 1000));
const promise3 = Promise.resolve(42);

Promise.all([promise1, promise2, promise3])
    .then(values => {
        console.log('All resolved:', values); // [3, 'foo', 42]
    })
    .catch(error => {
        console.error('One failed:', error);
    });

// Promise.allSettled() - wait for all promises to settle (resolve or reject)
const promises = [
    Promise.resolve('Success 1'),
    Promise.reject(new Error('Error 1')),
    Promise.resolve('Success 2')
];

Promise.allSettled(promises)
    .then(results => {
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`Promise ${index} fulfilled:`, result.value);
            } else {
                console.log(`Promise ${index} rejected:`, result.reason.message);
            }
        });
    });

// Promise.race() - resolve with the first promise that settles
const fastPromise = new Promise(resolve => setTimeout(() => resolve('Fast'), 100));
const slowPromise = new Promise(resolve => setTimeout(() => resolve('Slow'), 1000));

Promise.race([fastPromise, slowPromise])
    .then(result => {
        console.log('First to finish:', result); // 'Fast'
    });

// Promise.any() - resolve with the first promise that fulfills
const failingPromise = Promise.reject(new Error('Failed'));
const succeedingPromise = new Promise(resolve => setTimeout(() => resolve('Success'), 500));

Promise.any([failingPromise, succeedingPromise])
    .then(result => {
        console.log('First success:', result); // 'Success'
    })
    .catch(error => {
        console.error('All failed:', error);
    });
```

### Converting Callbacks to Promises
```javascript
// Promisify a callback-based function
function promisify(callbackFunction) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            callbackFunction(...args, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Original callback-based function
function oldAsyncFunction(data, callback) {
    setTimeout(() => {
        if (data) {
            callback(null, `Processed: ${data}`);
        } else {
            callback(new Error('No data provided'));
        }
    }, 1000);
}

// Promisified version
const newAsyncFunction = promisify(oldAsyncFunction);

// Now we can use it with promises
newAsyncFunction('Hello')
    .then(result => console.log(result)) // "Processed: Hello"
    .catch(error => console.error(error));

// Or with async/await
async function usePromisified() {
    try {
        const result = await newAsyncFunction('World');
        console.log(result); // "Processed: World"
    } catch (error) {
        console.error(error);
    }
}
```

## 🎯 Async/Await

### Basic Async/Await
```javascript
// Async function always returns a Promise
async function fetchData() {
    return 'Hello, World!'; // Automatically wrapped in Promise.resolve()
}

fetchData().then(result => console.log(result)); // "Hello, World!"

// Await can only be used inside async functions
async function getData() {
    const result = await fetchData();
    console.log(result); // "Hello, World!"
    return result;
}

getData();
```

### Converting Promises to Async/Await
```javascript
// Promise-based code
function fetchUserWithPromises(userId) {
    return fetchUser(userId)
        .then(user => {
            console.log('User:', user);
            return fetchUserPosts(user.id);
        })
        .then(posts => {
            console.log('Posts:', posts);
            return fetchPostComments(posts[0].id);
        })
        .then(comments => {
            console.log('Comments:', comments);
            return { user, posts, comments };
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}

// ✅ Equivalent async/await code (much cleaner!)
async function fetchUserWithAsync(userId) {
    try {
        const user = await fetchUser(userId);
        console.log('User:', user);
        
        const posts = await fetchUserPosts(user.id);
        console.log('Posts:', posts);
        
        const comments = await fetchPostComments(posts[0].id);
        console.log('Comments:', comments);
        
        return { user, posts, comments };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

### Error Handling with Async/Await
```javascript
// Multiple try-catch blocks for granular error handling
async function complexOperation() {
    let user, posts, comments;
    
    try {
        user = await fetchUser(123);
        console.log('✅ User fetched successfully');
    } catch (error) {
        console.error('❌ Failed to fetch user:', error.message);
        return null; // Early return on critical error
    }
    
    try {
        posts = await fetchUserPosts(user.id);
        console.log('✅ Posts fetched successfully');
    } catch (error) {
        console.error('❌ Failed to fetch posts:', error.message);
        posts = []; // Continue with empty posts
    }
    
    try {
        if (posts.length > 0) {
            comments = await fetchPostComments(posts[0].id);
            console.log('✅ Comments fetched successfully');
        } else {
            comments = [];
        }
    } catch (error) {
        console.error('❌ Failed to fetch comments:', error.message);
        comments = []; // Continue with empty comments
    }
    
    return { user, posts, comments };
}

// Using the function
complexOperation()
    .then(result => {
        if (result) {
            console.log('Final result:', result);
        }
    })
    .catch(error => {
        console.error('Unexpected error:', error);
    });
```

### Parallel vs Sequential Execution
```javascript
// ❌ Sequential execution (slower)
async function sequentialFetch() {
    console.time('Sequential');
    
    const user1 = await fetchUser(1);   // Wait 1 second
    const user2 = await fetchUser(2);   // Wait another 1 second
    const user3 = await fetchUser(3);   // Wait another 1 second
    
    console.timeEnd('Sequential'); // ~3 seconds
    return [user1, user2, user3];
}

// ✅ Parallel execution (faster)
async function parallelFetch() {
    console.time('Parallel');
    
    // Start all requests simultaneously
    const userPromises = [
        fetchUser(1),
        fetchUser(2),
        fetchUser(3)
    ];
    
    // Wait for all to complete
    const users = await Promise.all(userPromises);
    
    console.timeEnd('Parallel'); // ~1 second
    return users;
}

// Mixed approach - some sequential, some parallel
async function mixedFetch() {
    // First, get user data
    const user = await fetchUser(123);
    
    // Then, fetch posts and friends in parallel
    const [posts, friends] = await Promise.all([
        fetchUserPosts(user.id),
        fetchUserFriends(user.id)
    ]);
    
    // Finally, get comments for the first post
    const comments = posts.length > 0 
        ? await fetchPostComments(posts[0].id)
        : [];
    
    return { user, posts, friends, comments };
}
```

### Async Iteration
```javascript
// Processing arrays with async operations
const userIds = [1, 2, 3, 4, 5];

// ❌ Wrong - doesn't wait for async operations
function wrongAsyncMap() {
    return userIds.map(async (id) => {
        const user = await fetchUser(id);
        return user.name;
    });
    // Returns array of Promises, not resolved values!
}

// ✅ Correct - sequential processing
async function sequentialAsyncMap() {
    const names = [];
    for (const id of userIds) {
        const user = await fetchUser(id);
        names.push(user.name);
    }
    return names;
}

// ✅ Correct - parallel processing
async function parallelAsyncMap() {
    const userPromises = userIds.map(id => fetchUser(id));
    const users = await Promise.all(userPromises);
    return users.map(user => user.name);
}

// ✅ Correct - using Promise.all with map
async function promiseAllMap() {
    const names = await Promise.all(
        userIds.map(async (id) => {
            const user = await fetchUser(id);
            return user.name;
        })
    );
    return names;
}

// For-await-of loop (for async iterables)
async function* asyncGenerator() {
    for (let i = 1; i <= 3; i++) {
        yield await fetchUser(i);
    }
}

async function useAsyncIterator() {
    for await (const user of asyncGenerator()) {
        console.log('User:', user.name);
    }
}
```

## 🎪 Event Handling

### DOM Events
```javascript
// Basic event handling
const button = document.getElementById('myButton');

// Method 1: addEventListener (recommended)
button.addEventListener('click', function(event) {
    console.log('Button clicked!', event);
});

// Method 2: Arrow function
button.addEventListener('click', (event) => {
    console.log('Button clicked with arrow function!');
});

// Method 3: Named function (for removal)
function handleClick(event) {
    console.log('Named function handler');
}

button.addEventListener('click', handleClick);

// Remove event listener
button.removeEventListener('click', handleClick);

// Event options
button.addEventListener('click', handleClick, {
    once: true,      // Run only once
    passive: true,   // Never calls preventDefault()
    capture: true    // Capture phase instead of bubble
});
```

### Event Delegation
```javascript
// Instead of adding listeners to many elements
const items = document.querySelectorAll('.item');
items.forEach(item => {
    item.addEventListener('click', handleItemClick); // Many listeners
});

// ✅ Use event delegation (one listener on parent)
const container = document.getElementById('container');
container.addEventListener('click', function(event) {
    // Check if clicked element has the class we want
    if (event.target.classList.contains('item')) {
        handleItemClick(event);
    }
});

function handleItemClick(event) {
    console.log('Item clicked:', event.target.textContent);
}

// Advanced event delegation with closest()
container.addEventListener('click', function(event) {
    const item = event.target.closest('.item');
    if (item) {
        console.log('Item or its child clicked:', item.dataset.id);
    }
});
```

### Custom Events
```javascript
// Creating custom events
const customEvent = new CustomEvent('userLogin', {
    detail: {
        userId: 123,
        username: 'alice',
        timestamp: Date.now()
    },
    bubbles: true,
    cancelable: true
});

// Listen for custom event
document.addEventListener('userLogin', function(event) {
    console.log('User logged in:', event.detail);
});

// Dispatch custom event
document.dispatchEvent(customEvent);

// Event emitter pattern
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// Usage
const emitter = new EventEmitter();

emitter.on('data', (data) => console.log('Data received:', data));
emitter.once('error', (error) => console.error('Error:', error));

emitter.emit('data', { message: 'Hello' });
emitter.emit('error', new Error('Something went wrong'));
```

## 🌐 Fetch API

### Basic Fetch Usage
```javascript
// Basic GET request
fetch('https://jsonplaceholder.typicode.com/users/1')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(user => {
        console.log('User:', user);
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });

// ✅ With async/await (cleaner)
async function fetchUser(userId) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

### Advanced Fetch Options
```javascript
// POST request with JSON data
async function createUser(userData) {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-token-here'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newUser = await response.json();
        return newUser;
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
}

// Usage
const newUser = {
    name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe'
};

createUser(newUser)
    .then(user => console.log('Created user:', user))
    .catch(error => console.error('Failed to create user:', error));

// File upload
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', 'My uploaded file');
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData // Don't set Content-Type header for FormData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Request with timeout
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    }
}
```

### Error Handling and Retry Logic
```javascript
// Robust fetch with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    const { retryDelay = 1000, ...fetchOptions } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, fetchOptions);
            
            if (response.ok) {
                return response;
            }
            
            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                throw new Error(`Client error: ${response.status}`);
            }
            
            // Retry on server errors (5xx)
            if (attempt === maxRetries) {
                throw new Error(`Server error after ${maxRetries} attempts: ${response.status}`);
            }
            
            console.log(`Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            console.log(`Attempt ${attempt} failed:`, error.message);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

// Usage
fetchWithRetry('https://api.example.com/data', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' },
    retryDelay: 2000
}, 3)
.then(response => response.json())
.then(data => console.log('Data:', data))
.catch(error => console.error('Final error:', error));
```

## ⚠️ Common Pitfalls

### 1. Forgetting to Handle Errors
```javascript
// ❌ No error handling
async function badFunction() {
    const response = await fetch('/api/data');
    const data = await response.json(); // Could throw if response is not JSON
    return data;
}

// ✅ Proper error handling
async function goodFunction() {
    try {
        const response = await fetch('/api/data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw if caller should handle it
    }
}
```

### 2. Not Understanding Promise Resolution
```javascript
// ❌ Wrong - returns Promise, not the value
function wrongAsyncFunction() {
    return fetch('/api/data').then(response => response.json());
}

const result = wrongAsyncFunction();
console.log(result); // Promise object, not the data!

// ✅ Correct ways
async function correctAsyncFunction() {
    const response = await fetch('/api/data');
    return response.json();
}

// Or use the Promise properly
wrongAsyncFunction().then(data => {
    console.log(data); // Now we have the actual data
});
```

### 3. Mixing Async Patterns
```javascript
// ❌ Mixing async/await with .then() (confusing)
async function mixedPattern() {
    const response = await fetch('/api/data');
    return response.json().then(data => {
        return data.users;
    });
}

// ✅ Consistent async/await
async function consistentPattern() {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data.users;
}

// ✅ Consistent Promise chain
function consistentPromises() {
    return fetch('/api/data')
        .then(response => response.json())
        .then(data => data.users);
}
```

### 4. Not Handling Parallel vs Sequential
```javascript
// ❌ Unnecessary sequential execution
async function inefficient() {
    const user = await fetchUser(1);
    const posts = await fetchPosts(); // Doesn't depend on user!
    const comments = await fetchComments(); // Doesn't depend on user or posts!
    
    return { user, posts, comments };
}

// ✅ Parallel execution when possible
async function efficient() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(1),
        fetchPosts(),
        fetchComments()
    ]);
    
    return { user, posts, comments };
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Promise-based Timer
```javascript
// Create a promise-based delay function
function delay(ms) {
    // Your implementation here
    // Should return a Promise that resolves after ms milliseconds
}

// Usage:
delay(2000).then(() => console.log('2 seconds passed'));

// With async/await:
async function example() {
    console.log('Starting...');
    await delay(1000);
    console.log('1 second later');
    await delay(1000);
    console.log('2 seconds later');
}
```

### Problem 2: Parallel API Calls
```javascript
// Fetch multiple users in parallel and return their names
async function fetchUserNames(userIds) {
    // Your implementation here
    // Should fetch all users in parallel and return array of names
    // Handle errors gracefully (skip failed requests)
}

// Test:
fetchUserNames([1, 2, 3, 999]) // 999 might not exist
    .then(names => console.log('Names:', names))
    .catch(error => console.error('Error:', error));
```

### Problem 3: Rate-Limited API Client
```javascript
// Create an API client that limits requests to avoid rate limiting
class RateLimitedClient {
    constructor(requestsPerSecond = 5) {
        this.requestsPerSecond = requestsPerSecond;
        // Your implementation here
    }
    
    async request(url, options = {}) {
        // Your implementation here
        // Should ensure no more than requestsPerSecond requests per second
        // Should queue requests if rate limit would be exceeded
    }
}

// Test:
const client = new RateLimitedClient(2); // 2 requests per second

// These should be spaced out automatically
client.request('/api/user/1').then(console.log);
client.request('/api/user/2').then(console.log);
client.request('/api/user/3').then(console.log);
client.request('/api/user/4').then(console.log);
```

### Problem 4: Event-based Data Loader
```javascript
// Create a data loader that emits events during loading
class DataLoader extends EventEmitter {
    constructor() {
        super();
        // Your implementation here
    }
    
    async loadData(urls) {
        // Your implementation here
        // Should emit 'start', 'progress', 'complete', and 'error' events
        // Progress should include percentage and current item
    }
}

// Usage:
const loader = new DataLoader();

loader.on('start', () => console.log('Loading started'));
loader.on('progress', (data) => console.log(`Progress: ${data.percentage}%`));
loader.on('complete', (results) => console.log('All data loaded:', results));
loader.on('error', (error) => console.error('Loading error:', error));

loader.loadData([
    '/api/users',
    '/api/posts',
    '/api/comments'
]);
```

### Problem 5: Async Queue
```javascript
// Implement an async queue that processes tasks with concurrency limit
class AsyncQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        // Your implementation here
    }
    
    add(asyncTask) {
        // Your implementation here
        // Should return a Promise that resolves when task completes
        // Should respect concurrency limit
    }
    
    async drain() {
        // Your implementation here
        // Should wait for all queued tasks to complete
    }
}

// Test:
const queue = new AsyncQueue(2); // Max 2 concurrent tasks

// Add tasks
for (let i = 1; i <= 10; i++) {
    queue.add(async () => {
        console.log(`Task ${i} started`);
        await delay(1000);
        console.log(`Task ${i} completed`);
        return `Result ${i}`;
    }).then(result => console.log('Got:', result));
}

queue.drain().then(() => console.log('All tasks completed'));
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between callbacks, promises, and async/await?**
- Callbacks: Functions passed as arguments, can lead to callback hell
- Promises: Objects representing eventual completion, chainable with .then()
- Async/await: Syntactic sugar over promises, makes async code look synchronous

**Q: How does the event loop work?**
- Call stack executes synchronous code
- Web APIs handle async operations
- Callback queue holds completed async callbacks
- Event loop moves callbacks from queue to stack when stack is empty
- Microtasks (Promises) have higher priority than macrotasks (setTimeout)

**Q: What's the difference between Promise.all() and Promise.allSettled()?**
- Promise.all(): Fails fast - rejects if any promise rejects
- Promise.allSettled(): Waits for all promises to settle (resolve or reject)

**Q: How do you handle errors in async/await?**
- Use try-catch blocks
- Can have multiple try-catch for granular error handling
- Unhandled promise rejections should be caught

**Q: What's the difference between parallel and sequential execution?**
- Sequential: await each operation one by one (slower)
- Parallel: start all operations, then await Promise.all() (faster)

### 🏢 Asked at Companies:
- **Google**: "Implement Promise.all() from scratch"
- **Facebook**: "Design a rate-limited API client"
- **Amazon**: "Explain the event loop and microtask queue"
- **Microsoft**: "Implement async retry logic with exponential backoff"
- **Netflix**: "Create an async data pipeline with error handling"

## 🎯 Key Takeaways

1. **Understand the event loop** - foundation of async JavaScript
2. **Master Promise patterns** - chaining, error handling, utility methods
3. **Use async/await for readability** - but understand the underlying promises
4. **Handle errors properly** - always have error handling strategies
5. **Choose parallel vs sequential** - based on dependencies between operations
6. **Avoid callback hell** - use promises or async/await instead
7. **Practice with real APIs** - fetch, error handling, retry logic
8. **Understand event-driven programming** - DOM events, custom events, event emitters

---

**Previous Chapter**: [← Prototypes & Inheritance](./09-prototypes.md)  
**Next Chapter**: [Error Handling & Debugging →](./11-error-handling.md)

**Practice**: Try the async problems and experiment with different async patterns!