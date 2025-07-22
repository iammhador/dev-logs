# Chapter 17: Performance Optimization ⚡

## 📚 Table of Contents
- [Performance Fundamentals](#performance-fundamentals)
- [Memory Management](#memory-management)
- [Code Optimization](#code-optimization)
- [DOM Performance](#dom-performance)
- [Network Optimization](#network-optimization)
- [Async Performance](#async-performance)
- [Bundle Optimization](#bundle-optimization)
- [Monitoring & Profiling](#monitoring--profiling)
- [Common Pitfalls](#common-pitfalls)
- [Practice Problems](#practice-problems)
- [Interview Notes](#interview-notes)

---

## 🎯 Performance Fundamentals

### Understanding Performance Metrics
```javascript
// Core Web Vitals
function measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
            console.log('FID:', entry.processingStart - entry.startTime);
        });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        });
        console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
}
```

### Performance Timing API
```javascript
// Measure custom performance
class PerformanceTracker {
    static mark(name) {
        performance.mark(name);
    }
    
    static measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
    }
    
    static async timeFunction(fn, label) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    static getNavigationTiming() {
        const timing = performance.getEntriesByType('navigation')[0];
        return {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            domParsing: timing.domInteractive - timing.responseEnd,
            domReady: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            loadComplete: timing.loadEventEnd - timing.loadEventStart
        };
    }
}

// Usage
PerformanceTracker.mark('data-fetch-start');
await fetchData();
PerformanceTracker.mark('data-fetch-end');
PerformanceTracker.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
```

---

## 🧠 Memory Management

### Understanding Memory Leaks
```javascript
// Common memory leak patterns

// 1. Global variables
// ❌ Memory leak
function createUser() {
    // Accidentally creates global variable
    user = { name: 'John', data: new Array(1000000) };
    return user;
}

// ✅ Proper scoping
function createUser() {
    const user = { name: 'John', data: new Array(1000000) };
    return user;
}

// 2. Event listeners not removed
// ❌ Memory leak
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
    
    handleClick() {
        console.log('Clicked');
    }
    
    // Missing cleanup!
}

// ✅ Proper cleanup
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
    
    handleClick() {
        console.log('Clicked');
    }
    
    destroy() {
        document.removeEventListener('click', this.handleClick);
    }
}

// 3. Timers not cleared
// ❌ Memory leak
class Timer {
    start() {
        this.interval = setInterval(() => {
            console.log('Timer tick');
        }, 1000);
    }
    
    // Missing cleanup!
}

// ✅ Proper cleanup
class Timer {
    start() {
        this.interval = setInterval(() => {
            console.log('Timer tick');
        }, 1000);
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}
```

### Memory Optimization Techniques
```javascript
// Object pooling
class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createFn();
    }
    
    release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
    }
    
    size() {
        return this.pool.length;
    }
}

// Usage for expensive objects
const particlePool = new ObjectPool(
    () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1 }),
    (particle) => {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 1;
    },
    100
);

// WeakMap for private data
const privateData = new WeakMap();

class User {
    constructor(name) {
        this.name = name;
        privateData.set(this, {
            id: Math.random(),
            secret: 'private-data'
        });
    }
    
    getPrivateData() {
        return privateData.get(this);
    }
}

// When User instance is garbage collected,
// its private data is automatically removed from WeakMap
```

### Memory Monitoring
```javascript
// Memory usage monitoring
class MemoryMonitor {
    static getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    static startMonitoring(interval = 5000) {
        return setInterval(() => {
            const memory = this.getMemoryUsage();
            if (memory) {
                console.log(`Memory: ${memory.used}MB / ${memory.total}MB (limit: ${memory.limit}MB)`);
                
                // Alert if memory usage is high
                if (memory.used / memory.limit > 0.8) {
                    console.warn('High memory usage detected!');
                }
            }
        }, interval);
    }
    
    static measureFunction(fn, label) {
        const beforeMemory = this.getMemoryUsage();
        const start = performance.now();
        
        const result = fn();
        
        const end = performance.now();
        const afterMemory = this.getMemoryUsage();
        
        console.log(`${label}:`, {
            duration: `${(end - start).toFixed(2)}ms`,
            memoryDelta: beforeMemory && afterMemory 
                ? `${afterMemory.used - beforeMemory.used}MB`
                : 'N/A'
        });
        
        return result;
    }
}

// Usage
const monitorId = MemoryMonitor.startMonitoring();

// Later...
clearInterval(monitorId);
```

---

## 🚀 Code Optimization

### Algorithm Optimization
```javascript
// Optimize loops
// ❌ Inefficient
function processItems(items) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].active) {
            for (let j = 0; j < items[i].tags.length; j++) {
                if (items[i].tags[j].length > 3) {
                    results.push({
                        id: items[i].id,
                        tag: items[i].tags[j].toUpperCase()
                    });
                }
            }
        }
    }
    return results;
}

// ✅ Optimized
function processItemsOptimized(items) {
    const results = [];
    const itemsLength = items.length;
    
    for (let i = 0; i < itemsLength; i++) {
        const item = items[i];
        if (!item.active) continue;
        
        const tags = item.tags;
        const tagsLength = tags.length;
        const itemId = item.id;
        
        for (let j = 0; j < tagsLength; j++) {
            const tag = tags[j];
            if (tag.length > 3) {
                results.push({
                    id: itemId,
                    tag: tag.toUpperCase()
                });
            }
        }
    }
    
    return results;
}

// Even better: Use functional approach with early returns
function processItemsFunctional(items) {
    return items
        .filter(item => item.active)
        .flatMap(item => 
            item.tags
                .filter(tag => tag.length > 3)
                .map(tag => ({
                    id: item.id,
                    tag: tag.toUpperCase()
                }))
        );
}
```

### Data Structure Optimization
```javascript
// Use appropriate data structures

// ❌ Array for lookups (O(n))
class UserManagerSlow {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    findUser(id) {
        return this.users.find(user => user.id === id); // O(n)
    }
    
    removeUser(id) {
        const index = this.users.findIndex(user => user.id === id); // O(n)
        if (index !== -1) {
            this.users.splice(index, 1); // O(n)
        }
    }
}

// ✅ Map for lookups (O(1))
class UserManagerFast {
    constructor() {
        this.users = new Map();
    }
    
    addUser(user) {
        this.users.set(user.id, user); // O(1)
    }
    
    findUser(id) {
        return this.users.get(id); // O(1)
    }
    
    removeUser(id) {
        return this.users.delete(id); // O(1)
    }
    
    getAllUsers() {
        return Array.from(this.users.values());
    }
}

// Set for unique values
class TagManager {
    constructor() {
        this.tags = new Set();
    }
    
    addTag(tag) {
        this.tags.add(tag.toLowerCase());
    }
    
    hasTag(tag) {
        return this.tags.has(tag.toLowerCase());
    }
    
    getUniqueTagCount() {
        return this.tags.size;
    }
}
```

### Function Optimization
```javascript
// Memoization
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Expensive function
const fibonacci = memoize(function(n) {
    if (n < 2) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

// Debouncing
function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttling
function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
const debouncedSearch = debounce(searchFunction, 300);
const throttledScroll = throttle(scrollHandler, 100);
```

---

## 🎨 DOM Performance

### Efficient DOM Manipulation
```javascript
// ❌ Inefficient DOM updates
function updateListSlow(items) {
    const list = document.getElementById('list');
    list.innerHTML = ''; // Triggers reflow
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        list.appendChild(li); // Triggers reflow for each item
    });
}

// ✅ Batch DOM updates
function updateListFast(items) {
    const list = document.getElementById('list');
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        fragment.appendChild(li); // No reflow
    });
    
    list.innerHTML = '';
    list.appendChild(fragment); // Single reflow
}

// Even better: Use template strings
function updateListTemplate(items) {
    const list = document.getElementById('list');
    const html = items.map(item => `<li>${item.name}</li>`).join('');
    list.innerHTML = html; // Single reflow
}
```

### Virtual Scrolling
```javascript
// Virtual scrolling for large lists
class VirtualList {
    constructor(container, items, itemHeight = 50) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.startIndex = 0;
        
        this.setupContainer();
        this.render();
        this.bindEvents();
    }
    
    setupContainer() {
        this.container.style.overflow = 'auto';
        this.container.style.position = 'relative';
        
        // Create scrollable area
        this.scrollArea = document.createElement('div');
        this.scrollArea.style.height = `${this.items.length * this.itemHeight}px`;
        this.container.appendChild(this.scrollArea);
        
        // Create visible items container
        this.itemsContainer = document.createElement('div');
        this.itemsContainer.style.position = 'absolute';
        this.itemsContainer.style.top = '0';
        this.itemsContainer.style.width = '100%';
        this.scrollArea.appendChild(this.itemsContainer);
    }
    
    render() {
        const endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
        const visibleItems = this.items.slice(this.startIndex, endIndex);
        
        this.itemsContainer.innerHTML = '';
        this.itemsContainer.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`;
        
        visibleItems.forEach((item, index) => {
            const element = document.createElement('div');
            element.style.height = `${this.itemHeight}px`;
            element.textContent = item.name;
            element.dataset.index = this.startIndex + index;
            this.itemsContainer.appendChild(element);
        });
    }
    
    bindEvents() {
        this.container.addEventListener('scroll', () => {
            const newStartIndex = Math.floor(this.container.scrollTop / this.itemHeight);
            
            if (newStartIndex !== this.startIndex) {
                this.startIndex = newStartIndex;
                this.render();
            }
        });
    }
}

// Usage
const items = Array.from({ length: 10000 }, (_, i) => ({ name: `Item ${i}` }));
const virtualList = new VirtualList(document.getElementById('list-container'), items);
```

### Event Delegation
```javascript
// ❌ Multiple event listeners
function attachEventsSlow() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
}

// ✅ Event delegation
function attachEventsFast() {
    document.addEventListener('click', (event) => {
        if (event.target.matches('.button')) {
            handleButtonClick(event);
        }
    });
}

// Advanced event delegation
class EventDelegator {
    constructor(container) {
        this.container = container;
        this.handlers = new Map();
        this.bindEvents();
    }
    
    on(selector, eventType, handler) {
        const key = `${eventType}:${selector}`;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        this.handlers.get(key).push(handler);
    }
    
    off(selector, eventType, handler) {
        const key = `${eventType}:${selector}`;
        const handlers = this.handlers.get(key);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    bindEvents() {
        this.container.addEventListener('click', this.handleEvent.bind(this));
        this.container.addEventListener('change', this.handleEvent.bind(this));
        this.container.addEventListener('input', this.handleEvent.bind(this));
    }
    
    handleEvent(event) {
        const key = `${event.type}:`;
        
        for (const [handlerKey, handlers] of this.handlers) {
            if (handlerKey.startsWith(key)) {
                const selector = handlerKey.substring(key.length);
                if (event.target.matches(selector)) {
                    handlers.forEach(handler => handler(event));
                }
            }
        }
    }
}

// Usage
const delegator = new EventDelegator(document.body);
delegator.on('.button', 'click', handleButtonClick);
delegator.on('.input', 'input', handleInputChange);
```

---

## 🌐 Network Optimization

### Request Optimization
```javascript
// Request batching
class RequestBatcher {
    constructor(batchSize = 10, delay = 100) {
        this.batchSize = batchSize;
        this.delay = delay;
        this.queue = [];
        this.timeoutId = null;
    }
    
    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            
            if (this.queue.length >= this.batchSize) {
                this.flush();
            } else if (!this.timeoutId) {
                this.timeoutId = setTimeout(() => this.flush(), this.delay);
            }
        });
    }
    
    async flush() {
        if (this.queue.length === 0) return;
        
        const batch = this.queue.splice(0, this.batchSize);
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        try {
            const requests = batch.map(item => item.request);
            const results = await this.processBatch(requests);
            
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        } catch (error) {
            batch.forEach(item => item.reject(error));
        }
    }
    
    async processBatch(requests) {
        // Send all requests in a single API call
        const response = await fetch('/api/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requests })
        });
        
        return response.json();
    }
}

// Usage
const batcher = new RequestBatcher();

// These will be batched together
const user1 = await batcher.add({ type: 'getUser', id: 1 });
const user2 = await batcher.add({ type: 'getUser', id: 2 });
const user3 = await batcher.add({ type: 'getUser', id: 3 });
```

### Caching Strategies
```javascript
// HTTP cache with TTL
class HTTPCache {
    constructor(defaultTTL = 300000) { // 5 minutes
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }
    
    set(key, value, ttl = this.defaultTTL) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    clear() {
        this.cache.clear();
    }
    
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// API client with caching
class CachedAPIClient {
    constructor() {
        this.cache = new HTTPCache();
        this.pendingRequests = new Map();
    }
    
    async get(url, options = {}) {
        const cacheKey = this.getCacheKey(url, options);
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Check if request is already pending
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }
        
        // Make request
        const requestPromise = this.makeRequest(url, options)
            .then(response => {
                this.cache.set(cacheKey, response, options.ttl);
                this.pendingRequests.delete(cacheKey);
                return response;
            })
            .catch(error => {
                this.pendingRequests.delete(cacheKey);
                throw error;
            });
        
        this.pendingRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }
    
    async makeRequest(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }
    
    getCacheKey(url, options) {
        return `${url}:${JSON.stringify(options)}`;
    }
}
```

### Resource Loading
```javascript
// Lazy loading with Intersection Observer
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',
            threshold: 0.1,
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.options
        );
    }
    
    observe(element) {
        this.observer.observe(element);
    }
    
    unobserve(element) {
        this.observer.unobserve(element);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadElement(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }
    
    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        
        if (element.dataset.srcset) {
            element.srcset = element.dataset.srcset;
            element.removeAttribute('data-srcset');
        }
        
        element.classList.add('loaded');
    }
}

// Preloading critical resources
class ResourcePreloader {
    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    static preloadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.onload = resolve;
            script.onerror = reject;
            script.src = src;
            document.head.appendChild(script);
        });
    }
    
    static preloadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.onload = resolve;
            link.onerror = reject;
            link.href = href;
            document.head.appendChild(link);
        });
    }
    
    static async preloadCriticalResources(resources) {
        const promises = resources.map(resource => {
            switch (resource.type) {
                case 'image':
                    return this.preloadImage(resource.src);
                case 'script':
                    return this.preloadScript(resource.src);
                case 'css':
                    return this.preloadCSS(resource.href);
                default:
                    return Promise.resolve();
            }
        });
        
        return Promise.all(promises);
    }
}

// Usage
const lazyLoader = new LazyLoader();
document.querySelectorAll('img[data-src]').forEach(img => {
    lazyLoader.observe(img);
});

// Preload critical resources
ResourcePreloader.preloadCriticalResources([
    { type: 'image', src: '/hero-image.jpg' },
    { type: 'script', src: '/critical.js' },
    { type: 'css', href: '/critical.css' }
]);
```

---

## ⚡ Async Performance

### Parallel vs Sequential Execution
```javascript
// ❌ Sequential execution (slow)
async function fetchUserDataSequential(userIds) {
    const users = [];
    
    for (const id of userIds) {
        const user = await fetchUser(id); // Waits for each request
        users.push(user);
    }
    
    return users;
}

// ✅ Parallel execution (fast)
async function fetchUserDataParallel(userIds) {
    const promises = userIds.map(id => fetchUser(id));
    return Promise.all(promises);
}

// ✅ Controlled concurrency
async function fetchUserDataConcurrent(userIds, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < userIds.length; i += concurrency) {
        const batch = userIds.slice(i, i + concurrency);
        const batchPromises = batch.map(id => fetchUser(id));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
    }
    
    return results;
}

// Advanced: Promise pool with retry
class PromisePool {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async add(promiseFactory, retries = 3) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promiseFactory,
                resolve,
                reject,
                retries
            });
            
            this.process();
        });
    }
    
    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }
        
        this.running++;
        const { promiseFactory, resolve, reject, retries } = this.queue.shift();
        
        try {
            const result = await promiseFactory();
            resolve(result);
        } catch (error) {
            if (retries > 0) {
                // Retry with exponential backoff
                setTimeout(() => {
                    this.queue.unshift({
                        promiseFactory,
                        resolve,
                        reject,
                        retries: retries - 1
                    });
                    this.process();
                }, Math.pow(2, 3 - retries) * 1000);
            } else {
                reject(error);
            }
        } finally {
            this.running--;
            this.process();
        }
    }
}

// Usage
const pool = new PromisePool(5);
const results = await Promise.all(
    userIds.map(id => pool.add(() => fetchUser(id)))
);
```

### Web Workers for Heavy Tasks
```javascript
// Main thread
class WorkerPool {
    constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
        this.workers = [];
        this.queue = [];
        this.taskId = 0;
        
        for (let i = 0; i < poolSize; i++) {
            this.workers.push({
                worker: new Worker(workerScript),
                busy: false
            });
        }
    }
    
    execute(data) {
        return new Promise((resolve, reject) => {
            const taskId = ++this.taskId;
            
            this.queue.push({
                taskId,
                data,
                resolve,
                reject
            });
            
            this.processQueue();
        });
    }
    
    processQueue() {
        if (this.queue.length === 0) return;
        
        const availableWorker = this.workers.find(w => !w.busy);
        if (!availableWorker) return;
        
        const task = this.queue.shift();
        availableWorker.busy = true;
        
        const handleMessage = (event) => {
            if (event.data.taskId === task.taskId) {
                availableWorker.worker.removeEventListener('message', handleMessage);
                availableWorker.worker.removeEventListener('error', handleError);
                availableWorker.busy = false;
                
                if (event.data.error) {
                    task.reject(new Error(event.data.error));
                } else {
                    task.resolve(event.data.result);
                }
                
                this.processQueue();
            }
        };
        
        const handleError = (error) => {
            availableWorker.worker.removeEventListener('message', handleMessage);
            availableWorker.worker.removeEventListener('error', handleError);
            availableWorker.busy = false;
            task.reject(error);
            this.processQueue();
        };
        
        availableWorker.worker.addEventListener('message', handleMessage);
        availableWorker.worker.addEventListener('error', handleError);
        
        availableWorker.worker.postMessage({
            taskId: task.taskId,
            data: task.data
        });
    }
    
    terminate() {
        this.workers.forEach(w => w.worker.terminate());
    }
}

// worker.js
self.addEventListener('message', (event) => {
    const { taskId, data } = event.data;
    
    try {
        // Heavy computation
        const result = processLargeDataset(data);
        
        self.postMessage({
            taskId,
            result
        });
    } catch (error) {
        self.postMessage({
            taskId,
            error: error.message
        });
    }
});

function processLargeDataset(data) {
    // CPU-intensive task
    return data.map(item => {
        // Complex calculations
        return Math.sqrt(item * item + item);
    });
}

// Usage
const workerPool = new WorkerPool('worker.js', 4);
const result = await workerPool.execute(largeDataArray);
```

---

## 📦 Bundle Optimization

### Code Splitting
```javascript
// Dynamic imports for code splitting
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
    }
    
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        let modulePromise;
        
        switch (moduleName) {
            case 'chart':
                modulePromise = import('./modules/chart.js');
                break;
            case 'editor':
                modulePromise = import('./modules/editor.js');
                break;
            case 'calendar':
                modulePromise = import('./modules/calendar.js');
                break;
            default:
                throw new Error(`Unknown module: ${moduleName}`);
        }
        
        this.loadedModules.set(moduleName, modulePromise);
        return modulePromise;
    }
    
    async loadModuleOnDemand(moduleName, trigger) {
        const loadModule = async () => {
            const module = await this.loadModule(moduleName);
            return module.default || module;
        };
        
        // Load on user interaction
        if (trigger) {
            trigger.addEventListener('click', loadModule, { once: true });
        }
        
        return loadModule;
    }
}

// Route-based code splitting
class Router {
    constructor() {
        this.routes = new Map();
        this.moduleLoader = new ModuleLoader();
    }
    
    addRoute(path, moduleFactory) {
        this.routes.set(path, moduleFactory);
    }
    
    async navigate(path) {
        const moduleFactory = this.routes.get(path);
        
        if (!moduleFactory) {
            throw new Error(`Route not found: ${path}`);
        }
        
        // Show loading indicator
        this.showLoading();
        
        try {
            const module = await moduleFactory();
            const component = new module.default();
            this.render(component);
        } catch (error) {
            this.showError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }
    
    render(component) {
        const container = document.getElementById('app');
        container.innerHTML = '';
        container.appendChild(component.render());
    }
    
    showError(error) {
        console.error('Route loading error:', error);
    }
}

// Usage
const router = new Router();

router.addRoute('/dashboard', () => import('./pages/Dashboard.js'));
router.addRoute('/profile', () => import('./pages/Profile.js'));
router.addRoute('/settings', () => import('./pages/Settings.js'));
```

### Tree Shaking Optimization
```javascript
// ❌ Imports entire library
import * as utils from './utils.js';
utils.debounce(fn, 300);

// ✅ Import only what you need
import { debounce } from './utils.js';
debounce(fn, 300);

// Create tree-shakable modules
// utils.js
export function debounce(func, wait) {
    // Implementation
}

export function throttle(func, limit) {
    // Implementation
}

export function memoize(func) {
    // Implementation
}

// Don't export default objects
// ❌ Not tree-shakable
export default {
    debounce,
    throttle,
    memoize
};

// ✅ Tree-shakable
export { debounce, throttle, memoize };
```

---

## 📊 Monitoring & Profiling

### Performance Monitoring
```javascript
// Comprehensive performance monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = [];
        this.setupObservers();
    }
    
    setupObservers() {
        // Long tasks
        if ('PerformanceObserver' in window) {
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.recordMetric('longTask', {
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                });
            });
            
            try {
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                console.warn('Long task observer not supported');
            }
        }
        
        // Layout shifts
        const layoutShiftObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (!entry.hadRecentInput) {
                    this.recordMetric('layoutShift', {
                        value: entry.value,
                        startTime: entry.startTime
                    });
                }
            });
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
    }
    
    recordMetric(name, data) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        this.metrics.get(name).push({
            ...data,
            timestamp: Date.now()
        });
    }
    
    getMetrics(name) {
        return this.metrics.get(name) || [];
    }
    
    getAverageMetric(name, property) {
        const metrics = this.getMetrics(name);
        if (metrics.length === 0) return 0;
        
        const sum = metrics.reduce((acc, metric) => acc + metric[property], 0);
        return sum / metrics.length;
    }
    
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            navigation: this.getNavigationTiming(),
            longTasks: this.getMetrics('longTask'),
            layoutShifts: this.getMetrics('layoutShift'),
            memory: this.getMemoryInfo(),
            averages: {
                longTaskDuration: this.getAverageMetric('longTask', 'duration'),
                layoutShiftValue: this.getAverageMetric('layoutShift', 'value')
            }
        };
        
        return report;
    }
    
    getNavigationTiming() {
        const timing = performance.getEntriesByType('navigation')[0];
        if (!timing) return null;
        
        return {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseStart - timing.requestStart,
            response: timing.responseEnd - timing.responseStart,
            domParsing: timing.domInteractive - timing.responseEnd,
            domReady: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
            loadComplete: timing.loadEventEnd - timing.loadEventStart
        };
    }
    
    getMemoryInfo() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    sendReport(endpoint) {
        const report = this.generateReport();
        
        // Use sendBeacon for reliability
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(report));
        } else {
            fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(report),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(console.error);
        }
    }
    
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
    }
}

// Usage
const monitor = new PerformanceMonitor();

// Send report every 30 seconds
setInterval(() => {
    monitor.sendReport('/api/performance');
}, 30000);

// Send report before page unload
window.addEventListener('beforeunload', () => {
    monitor.sendReport('/api/performance');
});
```

---

## ⚠️ Common Pitfalls

### 1. Premature Optimization
```javascript
// ❌ Optimizing before measuring
function processData(data) {
    // Complex optimization that may not be needed
    const cache = new Map();
    const pool = new ObjectPool();
    // ... overly complex code
}

// ✅ Measure first, then optimize
function processData(data) {
    // Simple, readable implementation first
    return data.map(item => transform(item));
}

// Profile and optimize only if needed
```

### 2. Memory Leaks in Event Listeners
```javascript
// ❌ Memory leak
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
    
    handleClick() {
        console.log('Clicked');
    }
    
    // Missing cleanup!
}

// ✅ Proper cleanup
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
    
    handleClick() {
        console.log('Clicked');
    }
    
    destroy() {
        document.removeEventListener('click', this.handleClick);
    }
}
```

### 3. Blocking the Main Thread
```javascript
// ❌ Blocking operation
function processLargeArray(data) {
    for (let i = 0; i < data.length; i++) {
        // Heavy computation blocks UI
        heavyCalculation(data[i]);
    }
}

// ✅ Non-blocking with time slicing
function processLargeArrayNonBlocking(data, callback) {
    let index = 0;
    const batchSize = 1000;
    
    function processBatch() {
        const endIndex = Math.min(index + batchSize, data.length);
        
        for (let i = index; i < endIndex; i++) {
            heavyCalculation(data[i]);
        }
        
        index = endIndex;
        
        if (index < data.length) {
            setTimeout(processBatch, 0); // Yield to browser
        } else {
            callback();
        }
    }
    
    processBatch();
}
```

### 4. Inefficient DOM Queries
```javascript
// ❌ Repeated DOM queries
function updateElements() {
    for (let i = 0; i < 100; i++) {
        document.getElementById('item-' + i).textContent = 'Updated';
        document.getElementById('item-' + i).classList.add('active');
    }
}

// ✅ Cache DOM references
function updateElementsOptimized() {
    const elements = [];
    for (let i = 0; i < 100; i++) {
        elements[i] = document.getElementById('item-' + i);
    }
    
    elements.forEach(element => {
        element.textContent = 'Updated';
        element.classList.add('active');
    });
}
```

### 5. Not Using RequestAnimationFrame
```javascript
// ❌ Using setTimeout for animations
function animateElement(element) {
    let position = 0;
    const animate = () => {
        position += 1;
        element.style.left = position + 'px';
        if (position < 100) {
            setTimeout(animate, 16); // Not synced with display
        }
    };
    animate();
}

// ✅ Using requestAnimationFrame
function animateElementOptimized(element) {
    let position = 0;
    const animate = () => {
        position += 1;
        element.style.left = position + 'px';
        if (position < 100) {
            requestAnimationFrame(animate); // Synced with display
        }
    };
    requestAnimationFrame(animate);
}
```

---

## 🏋️ Mini Practice Problems

### Problem 1: Optimize a Data Processing Pipeline
```javascript
// Optimize this slow data processing function
function processUserData(users) {
    const results = [];
    
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        if (user.active) {
            const profile = getUserProfile(user.id); // Sync API call
            const permissions = getUserPermissions(user.id); // Sync API call
            const preferences = getUserPreferences(user.id); // Sync API call
            
            const processed = {
                id: user.id,
                name: user.name.toUpperCase(),
                email: user.email.toLowerCase(),
                profile: profile,
                permissions: permissions,
                preferences: preferences,
                score: calculateUserScore(user, profile, permissions)
            };
            
            results.push(processed);
        }
    }
    
    return results.sort((a, b) => b.score - a.score);
}

// Tasks:
// 1. Make API calls parallel
// 2. Implement caching
// 3. Add batch processing
// 4. Use Web Workers for heavy calculations
// 5. Implement progress tracking
```

### Problem 2: Create a High-Performance Virtual List
```javascript
// Implement a virtual list that can handle 100,000+ items smoothly
class HighPerformanceVirtualList {
    constructor(container, items, itemHeight, renderItem) {
        // Your implementation here
        // Requirements:
        // - Smooth scrolling with 100k+ items
        // - Dynamic item heights support
        // - Horizontal scrolling support
        // - Search and filtering
        // - Memory efficient
        // - Keyboard navigation
    }
    
    // Methods to implement:
    // render()
    // scrollToIndex(index)
    // updateItems(newItems)
    // filter(predicate)
    // search(query)
    // destroy()
}
```

### Problem 3: Build a Performance Budget Monitor
```javascript
// Create a system that monitors and enforces performance budgets
class PerformanceBudgetMonitor {
    constructor(budgets) {
        // budgets = {
        //     bundleSize: 250000, // 250KB
        //     firstContentfulPaint: 1500, // 1.5s
        //     largestContentfulPaint: 2500, // 2.5s
        //     cumulativeLayoutShift: 0.1,
        //     firstInputDelay: 100 // 100ms
        // }
    }
    
    // Methods to implement:
    // startMonitoring()
    // checkBudgets()
    // reportViolations()
    // generateReport()
    // setupAlerts()
}
```

### Problem 4: Optimize Image Loading
```javascript
// Create an advanced image loading system
class ImageOptimizer {
    constructor(options) {
        // Features to implement:
        // - Lazy loading with intersection observer
        // - Progressive image loading (blur-up)
        // - WebP/AVIF format detection and serving
        // - Responsive images based on device
        // - Image compression on the fly
        // - Preloading critical images
        // - Error handling and fallbacks
    }
    
    // Methods to implement:
    // loadImage(src, options)
    // preloadImages(srcs)
    // generateResponsiveSrc(src, sizes)
    // compressImage(file, quality)
    // convertToWebP(file)
}
```

### Problem 5: Memory Leak Detector
```javascript
// Build a tool to detect and report memory leaks
class MemoryLeakDetector {
    constructor() {
        // Features:
        // - Track object creation and destruction
        // - Monitor DOM node leaks
        // - Detect event listener leaks
        // - Monitor closure leaks
        // - Generate leak reports
        // - Suggest fixes
    }
    
    // Methods to implement:
    // startTracking()
    // trackObject(obj, label)
    // detectLeaks()
    // generateReport()
    // suggestFixes()
    // cleanup()
}
```

---

## 💼 Interview Notes

### Common Questions:

**Q: What are the main performance bottlenecks in web applications?**
- **Network**: Large bundles, too many requests, no caching
- **Rendering**: Layout thrashing, unnecessary repaints, large DOM
- **JavaScript**: Blocking main thread, memory leaks, inefficient algorithms
- **Images**: Large file sizes, no optimization, blocking loading

**Q: How do you measure web performance?**
- **Core Web Vitals**: LCP, FID, CLS
- **Performance API**: Navigation timing, resource timing
- **Tools**: Lighthouse, WebPageTest, Chrome DevTools
- **Real User Monitoring**: Track actual user experience

**Q: What's the difference between throttling and debouncing?**
- **Throttling**: Limits function execution to once per time period
- **Debouncing**: Delays function execution until after a quiet period
- **Use cases**: Throttle for scroll events, debounce for search input

**Q: How do you optimize JavaScript bundle size?**
- **Tree shaking**: Remove unused code
- **Code splitting**: Load code on demand
- **Minification**: Compress code
- **Compression**: Gzip/Brotli
- **Dynamic imports**: Lazy load modules

**Q: What causes memory leaks in JavaScript?**
- **Global variables**: Unintentional global scope pollution
- **Event listeners**: Not removed when elements are destroyed
- **Timers**: setInterval/setTimeout not cleared
- **Closures**: Retaining references to large objects
- **DOM references**: Keeping references to removed DOM nodes

**Q: How do you optimize DOM manipulation?**
- **Batch updates**: Use DocumentFragment
- **Minimize reflows**: Change styles in batches
- **Use CSS transforms**: For animations instead of changing layout properties
- **Virtual DOM**: For complex UIs
- **Event delegation**: Instead of multiple event listeners

### 🏢 Asked at Companies:
- **Google**: "Optimize a React component that renders 10,000 items"
- **Facebook**: "Debug and fix performance issues in a large JavaScript application"
- **Amazon**: "Design a caching strategy for a high-traffic e-commerce site"
- **Microsoft**: "Implement lazy loading for a complex dashboard"
- **Netflix**: "Optimize video streaming performance across different devices"

## 🎯 Key Takeaways

1. **Measure before optimizing** - Use profiling tools to identify bottlenecks
2. **Optimize for the critical path** - Focus on what affects user experience most
3. **Use appropriate data structures** - Map for lookups, Set for unique values
4. **Minimize DOM manipulation** - Batch updates, use virtual scrolling
5. **Implement proper caching** - HTTP cache, memory cache, service workers
6. **Avoid memory leaks** - Clean up event listeners, timers, and references
7. **Use Web Workers** - For CPU-intensive tasks
8. **Monitor performance continuously** - Set up alerts and budgets

---

**Previous Chapter**: [← Testing & Debugging](./16-testing-debugging.md)  
**Next Chapter**: [Security Best Practices →](./18-security-best-practices.md)

**Practice**: Profile a real application, identify bottlenecks, and implement optimizations!