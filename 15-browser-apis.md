# 15. Browser APIs

## 📚 Table of Contents
- [Local Storage & Session Storage](#local-storage--session-storage)
- [Fetch API](#fetch-api)
- [Geolocation API](#geolocation-api)
- [File API](#file-api)
- [Canvas API](#canvas-api)
- [Web Workers](#web-workers)
- [Service Workers](#service-workers)
- [Intersection Observer](#intersection-observer)
- [Mutation Observer](#mutation-observer)
- [History API](#history-api)
- [Notification API](#notification-api)
- [Common Pitfalls](#common-pitfalls)
- [Mini Practice Problems](#mini-practice-problems)
- [Interview Notes](#interview-notes)

---

## 🎯 Learning Objectives
By the end of this chapter, you will:
- Master browser storage APIs (localStorage, sessionStorage)
- Use the Fetch API for HTTP requests
- Work with geolocation and file handling
- Understand Canvas for graphics and animations
- Implement Web Workers for background processing
- Use modern observer APIs for efficient DOM monitoring
- Handle browser history and navigation
- Implement push notifications

---

## 📦 Local Storage & Session Storage

### Basic Usage
```javascript
// localStorage - persists until manually cleared
localStorage.setItem('username', 'john_doe');
localStorage.setItem('preferences', JSON.stringify({
    theme: 'dark',
    language: 'en'
}));

// Get items
const username = localStorage.getItem('username');
const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');

// Remove items
localStorage.removeItem('username');
localStorage.clear(); // Remove all items

// sessionStorage - persists only for the session
sessionStorage.setItem('tempData', 'session-specific');
const tempData = sessionStorage.getItem('tempData');
```

### Storage Events
```javascript
// Listen for storage changes (only fires in other tabs/windows)
window.addEventListener('storage', (e) => {
    console.log('Storage changed:', {
        key: e.key,
        oldValue: e.oldValue,
        newValue: e.newValue,
        url: e.url
    });
    
    // Sync UI with storage changes
    if (e.key === 'theme') {
        updateTheme(e.newValue);
    }
});
```

### Storage Wrapper Class
```javascript
class StorageManager {
    constructor(storage = localStorage) {
        this.storage = storage;
    }
    
    set(key, value, expiry = null) {
        const item = {
            value,
            timestamp: Date.now(),
            expiry: expiry ? Date.now() + expiry : null
        };
        
        try {
            this.storage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
    
    get(key) {
        try {
            const item = JSON.parse(this.storage.getItem(key));
            
            if (!item) return null;
            
            // Check expiry
            if (item.expiry && Date.now() > item.expiry) {
                this.remove(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            console.error('Storage parse error:', error);
            return null;
        }
    }
    
    remove(key) {
        this.storage.removeItem(key);
    }
    
    clear() {
        this.storage.clear();
    }
    
    keys() {
        return Object.keys(this.storage);
    }
    
    size() {
        return this.storage.length;
    }
    
    // Get storage usage in bytes (approximate)
    getUsage() {
        let total = 0;
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                total += this.storage[key].length + key.length;
            }
        }
        return total;
    }
}

// Usage
const storage = new StorageManager();
storage.set('user', { name: 'John', age: 30 }, 24 * 60 * 60 * 1000); // 24 hours
const user = storage.get('user');
```

---

## 🌐 Fetch API

### Basic Requests
```javascript
// GET request
fetch('/api/users')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

// POST request
fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com'
    })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### Advanced Fetch Patterns
```javascript
// Fetch with timeout
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
}

// Retry mechanism
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            
            if (i === maxRetries) throw new Error(`Failed after ${maxRetries} retries`);
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        } catch (error) {
            if (i === maxRetries) throw error;
        }
    }
}

// Upload with progress
function uploadWithProgress(file, url, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
            }
        });
        
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        
        xhr.open('POST', url);
        xhr.send(formData);
    });
}
```

### HTTP Client Class
```javascript
class HTTPClient {
    constructor(baseURL = '', defaultHeaders = {}) {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...defaultHeaders
        };
        this.interceptors = {
            request: [],
            response: []
        };
    }
    
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }
    
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }
    
    async request(url, options = {}) {
        // Apply request interceptors
        let config = {
            ...options,
            headers: { ...this.defaultHeaders, ...options.headers }
        };
        
        for (const interceptor of this.interceptors.request) {
            config = await interceptor(config);
        }
        
        try {
            let response = await fetch(this.baseURL + url, config);
            
            // Apply response interceptors
            for (const interceptor of this.interceptors.response) {
                response = await interceptor(response);
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }
    
    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }
    
    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }
}

// Usage
const api = new HTTPClient('/api/v1');

// Add auth interceptor
api.addRequestInterceptor(async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add error handling interceptor
api.addResponseInterceptor(async (response) => {
    if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login';
    }
    return response;
});

// Make requests
api.get('/users').then(response => response.json());
api.post('/users', { name: 'John', email: 'john@example.com' });
```

---

## 📍 Geolocation API

### Basic Geolocation
```javascript
// Check if geolocation is supported
if ('geolocation' in navigator) {
    // Get current position
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);
            
            // Use the coordinates
            showLocationOnMap(latitude, longitude);
        },
        (error) => {
            console.error('Geolocation error:', error.message);
            handleLocationError(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Cache for 1 minute
        }
    );
} else {
    console.log('Geolocation not supported');
}

// Watch position changes
const watchId = navigator.geolocation.watchPosition(
    (position) => {
        updateLocationOnMap(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
        console.error('Watch position error:', error);
    },
    { enableHighAccuracy: true }
);

// Stop watching
// navigator.geolocation.clearWatch(watchId);
```

### Geolocation Wrapper
```javascript
class GeolocationService {
    constructor() {
        this.watchId = null;
        this.isSupported = 'geolocation' in navigator;
    }
    
    async getCurrentPosition(options = {}) {
        if (!this.isSupported) {
            throw new Error('Geolocation not supported');
        }
        
        const defaultOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        };
        
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                { ...defaultOptions, ...options }
            );
        });
    }
    
    watchPosition(callback, errorCallback, options = {}) {
        if (!this.isSupported) {
            throw new Error('Geolocation not supported');
        }
        
        this.watchId = navigator.geolocation.watchPosition(
            callback,
            errorCallback,
            options
        );
        
        return this.watchId;
    }
    
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
    
    async getAddressFromCoords(lat, lng) {
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=YOUR_API_KEY`
            );
            const data = await response.json();
            return data.results[0]?.formatted || 'Address not found';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

// Usage
const geo = new GeolocationService();

try {
    const position = await geo.getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    const address = await geo.getAddressFromCoords(latitude, longitude);
    console.log('Current location:', address);
    
    // Calculate distance to a point of interest
    const distance = geo.calculateDistance(
        latitude, longitude,
        40.7128, -74.0060 // New York City
    );
    console.log(`Distance to NYC: ${distance.toFixed(2)} km`);
} catch (error) {
    console.error('Location error:', error);
}
```

---

## 📁 File API

### File Input Handling
```javascript
// HTML: <input type="file" id="fileInput" multiple accept="image/*">

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        console.log('File info:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified)
        });
        
        // Process each file
        processFile(file);
    });
});

function processFile(file) {
    const reader = new FileReader();
    
    // Read as different formats
    if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                console.log(`Image dimensions: ${img.width}x${img.height}`);
                displayImage(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'text/plain') {
        reader.onload = (e) => {
            console.log('Text content:', e.target.result);
        };
        reader.readAsText(file);
    } else {
        reader.onload = (e) => {
            console.log('Binary data:', e.target.result);
        };
        reader.readAsArrayBuffer(file);
    }
    
    reader.onerror = () => {
        console.error('File reading error:', reader.error);
    };
}
```

### File Validation and Processing
```javascript
class FileProcessor {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
        this.allowedTypes = options.allowedTypes || [];
        this.maxFiles = options.maxFiles || 10;
    }
    
    validateFile(file) {
        const errors = [];
        
        // Size validation
        if (file.size > this.maxSize) {
            errors.push(`File too large. Max size: ${this.formatBytes(this.maxSize)}`);
        }
        
        // Type validation
        if (this.allowedTypes.length > 0) {
            const isAllowed = this.allowedTypes.some(type => {
                if (type.endsWith('/*')) {
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type;
            });
            
            if (!isAllowed) {
                errors.push(`File type not allowed. Allowed: ${this.allowedTypes.join(', ')}`);
            }
        }
        
        return errors;
    }
    
    validateFiles(files) {
        if (files.length > this.maxFiles) {
            return [`Too many files. Max: ${this.maxFiles}`];
        }
        
        const allErrors = [];
        files.forEach((file, index) => {
            const errors = this.validateFile(file);
            if (errors.length > 0) {
                allErrors.push(`File ${index + 1} (${file.name}): ${errors.join(', ')}`);
            }
        });
        
        return allErrors;
    }
    
    async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }
    
    async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }
    
    async compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, file.type, quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    generateThumbnail(file, size = 150) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = size;
                canvas.height = size;
                
                // Calculate crop area for square thumbnail
                const minDim = Math.min(img.width, img.height);
                const x = (img.width - minDim) / 2;
                const y = (img.height - minDim) / 2;
                
                ctx.drawImage(img, x, y, minDim, minDim, 0, 0, size, size);
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// Usage
const processor = new FileProcessor({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf'],
    maxFiles: 5
});

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const errors = processor.validateFiles(files);
    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return;
    }
    
    // Process each file
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            // Compress image
            const compressed = await processor.compressImage(file);
            console.log(`Original: ${processor.formatBytes(file.size)}, Compressed: ${processor.formatBytes(compressed.size)}`);
            
            // Generate thumbnail
            const thumbnail = await processor.generateThumbnail(file);
            displayThumbnail(thumbnail);
        }
    }
});
```

---

## 🎨 Canvas API

### Basic Canvas Operations
```javascript
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Basic shapes
ctx.fillStyle = '#ff0000';
ctx.fillRect(10, 10, 100, 100);

ctx.strokeStyle = '#0000ff';
ctx.lineWidth = 3;
ctx.strokeRect(150, 10, 100, 100);

// Circles
ctx.beginPath();
ctx.arc(200, 200, 50, 0, 2 * Math.PI);
ctx.fillStyle = '#00ff00';
ctx.fill();

// Lines and paths
ctx.beginPath();
ctx.moveTo(300, 100);
ctx.lineTo(400, 200);
ctx.lineTo(300, 300);
ctx.closePath();
ctx.stroke();

// Text
ctx.font = '24px Arial';
ctx.fillStyle = '#000000';
ctx.fillText('Hello Canvas!', 50, 400);

// Gradients
const gradient = ctx.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, '#ff0000');
gradient.addColorStop(1, '#0000ff');
ctx.fillStyle = gradient;
ctx.fillRect(500, 100, 200, 100);
```

### Animation with Canvas
```javascript
class CanvasAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.lastTime = 0;
        this.objects = [];
    }
    
    start() {
        this.animate(0);
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw objects
        this.objects.forEach(obj => {
            obj.update(deltaTime);
            obj.draw(this.ctx);
        });
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    addObject(obj) {
        this.objects.push(obj);
    }
    
    removeObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
}

// Animated ball class
class Ball {
    constructor(x, y, radius, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.gravity = 0.5;
        this.bounce = 0.8;
    }
    
    update(deltaTime) {
        // Apply gravity
        this.vy += this.gravity;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.vx *= -this.bounce;
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        }
        
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.vy *= -this.bounce;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    }
}

// Usage
const animation = new CanvasAnimation(canvas);

// Add some bouncing balls
for (let i = 0; i < 10; i++) {
    const ball = new Ball(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        10 + Math.random() * 20,
        `hsl(${Math.random() * 360}, 70%, 50%)`,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    );
    animation.addObject(ball);
}

animation.start();
```

### Canvas Drawing Tools
```javascript
class DrawingTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.tool = 'pen';
        this.color = '#000000';
        this.lineWidth = 2;
        this.history = [];
        this.historyStep = -1;
        
        this.setupEventListeners();
        this.saveState();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        if (this.tool === 'pen' || this.tool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        switch (this.tool) {
            case 'pen':
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = this.color;
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                break;
                
            case 'eraser':
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                break;
                
            case 'line':
                this.redrawCanvas();
                this.ctx.strokeStyle = this.color;
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                break;
                
            case 'rectangle':
                this.redrawCanvas();
                this.ctx.strokeStyle = this.color;
                this.ctx.strokeRect(
                    this.lastX,
                    this.lastY,
                    currentX - this.lastX,
                    currentY - this.lastY
                );
                break;
                
            case 'circle':
                this.redrawCanvas();
                const radius = Math.sqrt(
                    Math.pow(currentX - this.lastX, 2) + Math.pow(currentY - this.lastY, 2)
                );
                this.ctx.strokeStyle = this.color;
                this.ctx.beginPath();
                this.ctx.arc(this.lastX, this.lastY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
        }
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    setTool(tool) {
        this.tool = tool;
    }
    
    setColor(color) {
        this.color = color;
    }
    
    setLineWidth(width) {
        this.lineWidth = width;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }
    
    saveState() {
        this.historyStep++;
        if (this.historyStep < this.history.length) {
            this.history.length = this.historyStep;
        }
        this.history.push(this.canvas.toDataURL());
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            this.restoreState();
        }
    }
    
    restoreState() {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        img.src = this.history[this.historyStep];
    }
    
    redrawCanvas() {
        if (this.historyStep >= 0) {
            const img = new Image();
            img.onload = () => {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0);
            };
            img.src = this.history[this.historyStep];
        }
    }
    
    exportImage(format = 'image/png') {
        return this.canvas.toDataURL(format);
    }
    
    importImage(dataURL) {
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            this.saveState();
        };
        img.src = dataURL;
    }
}

// Usage
const drawingTool = new DrawingTool(canvas);

// Tool controls
document.getElementById('penTool').addEventListener('click', () => {
    drawingTool.setTool('pen');
});

document.getElementById('colorPicker').addEventListener('change', (e) => {
    drawingTool.setColor(e.target.value);
});

document.getElementById('lineWidth').addEventListener('input', (e) => {
    drawingTool.setLineWidth(e.target.value);
});

document.getElementById('undo').addEventListener('click', () => {
    drawingTool.undo();
});

document.getElementById('clear').addEventListener('click', () => {
    drawingTool.clear();
});
```

---

## 👷 Web Workers

### Basic Web Worker
```javascript
// main.js
if (typeof Worker !== 'undefined') {
    const worker = new Worker('worker.js');
    
    // Send data to worker
    worker.postMessage({
        command: 'calculate',
        data: [1, 2, 3, 4, 5]
    });
    
    // Receive data from worker
    worker.onmessage = function(e) {
        console.log('Result from worker:', e.data);
    };
    
    // Handle errors
    worker.onerror = function(error) {
        console.error('Worker error:', error);
    };
    
    // Terminate worker when done
    // worker.terminate();
} else {
    console.log('Web Workers not supported');
}
```

```javascript
// worker.js
self.onmessage = function(e) {
    const { command, data } = e.data;
    
    switch (command) {
        case 'calculate':
            const result = heavyCalculation(data);
            self.postMessage(result);
            break;
            
        case 'processImage':
            const processedImage = processImageData(data);
            self.postMessage(processedImage);
            break;
            
        default:
            self.postMessage({ error: 'Unknown command' });
    }
};

function heavyCalculation(numbers) {
    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
        result += numbers.reduce((sum, num) => sum + num * Math.random(), 0);
    }
    return result;
}

function processImageData(imageData) {
    // Process image data (e.g., apply filters)
    const data = imageData.data;
    
    // Apply grayscale filter
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
        // Alpha channel (i + 3) remains unchanged
    }
    
    return imageData;
}
```

### Worker Pool Manager
```javascript
class WorkerPool {
    constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
        this.workerScript = workerScript;
        this.poolSize = poolSize;
        this.workers = [];
        this.queue = [];
        this.activeJobs = new Map();
        
        this.initializeWorkers();
    }
    
    initializeWorkers() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker(this.workerScript);
            worker.id = i;
            worker.busy = false;
            
            worker.onmessage = (e) => {
                this.handleWorkerMessage(worker, e);
            };
            
            worker.onerror = (error) => {
                this.handleWorkerError(worker, error);
            };
            
            this.workers.push(worker);
        }
    }
    
    execute(data, transferable = []) {
        return new Promise((resolve, reject) => {
            const job = {
                id: Date.now() + Math.random(),
                data,
                transferable,
                resolve,
                reject
            };
            
            const availableWorker = this.workers.find(w => !w.busy);
            
            if (availableWorker) {
                this.assignJob(availableWorker, job);
            } else {
                this.queue.push(job);
            }
        });
    }
    
    assignJob(worker, job) {
        worker.busy = true;
        this.activeJobs.set(worker.id, job);
        worker.postMessage(job.data, job.transferable);
    }
    
    handleWorkerMessage(worker, e) {
        const job = this.activeJobs.get(worker.id);
        
        if (job) {
            job.resolve(e.data);
            this.activeJobs.delete(worker.id);
            worker.busy = false;
            
            // Process next job in queue
            if (this.queue.length > 0) {
                const nextJob = this.queue.shift();
                this.assignJob(worker, nextJob);
            }
        }
    }
    
    handleWorkerError(worker, error) {
        const job = this.activeJobs.get(worker.id);
        
        if (job) {
            job.reject(error);
            this.activeJobs.delete(worker.id);
            worker.busy = false;
        }
    }
    
    terminate() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.queue = [];
        this.activeJobs.clear();
    }
    
    getStats() {
        return {
            totalWorkers: this.workers.length,
            busyWorkers: this.workers.filter(w => w.busy).length,
            queueLength: this.queue.length,
            activeJobs: this.activeJobs.size
        };
    }
}

// Usage
const workerPool = new WorkerPool('worker.js', 4);

// Process multiple tasks in parallel
const tasks = [
    { command: 'calculate', data: [1, 2, 3] },
    { command: 'calculate', data: [4, 5, 6] },
    { command: 'calculate', data: [7, 8, 9] },
    { command: 'calculate', data: [10, 11, 12] }
];

Promise.all(tasks.map(task => workerPool.execute(task)))
    .then(results => {
        console.log('All tasks completed:', results);
        console.log('Worker stats:', workerPool.getStats());
    })
    .catch(error => {
        console.error('Task error:', error);
    });
```

---

## ⚙️ Service Workers

### Basic Service Worker
```javascript
// main.js - Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
    
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (e) => {
        console.log('Message from SW:', e.data);
    });
}

function showUpdateNotification() {
    if (confirm('New version available! Reload to update?')) {
        window.location.reload();
    }
}
```

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js',
    '/images/logo.png',
    '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (e) => {
    console.log('Service Worker installing');
    
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Force activation of new service worker
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (e) => {
    console.log('Service Worker activating');
    
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all pages
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                return fetch(e.request).then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(e.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Show offline page for navigation requests
                if (e.request.destination === 'document') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// Background sync
self.addEventListener('sync', (e) => {
    if (e.tag === 'background-sync') {
        e.waitUntil(doBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', (e) => {
    const options = {
        body: e.data ? e.data.text() : 'Default notification body',
        icon: '/images/icon-192x192.png',
        badge: '/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/images/xmark.png'
            }
        ]
    };
    
    e.waitUntil(
        self.registration.showNotification('My App Notification', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    
    if (e.action === 'explore') {
        // Open app
        e.waitUntil(
            clients.openWindow('/explore')
        );
    } else if (e.action === 'close') {
        // Just close notification
        return;
    } else {
        // Default action
        e.waitUntil(
            clients.openWindow('/')
        );
    }
});

function doBackgroundSync() {
    // Perform background tasks
    return fetch('/api/sync')
        .then(response => response.json())
        .then(data => {
            console.log('Background sync completed:', data);
        })
        .catch(error => {
            console.error('Background sync failed:', error);
        });
}

// Message handling
self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
```

---

## 👁️ Intersection Observer

### Basic Intersection Observer
```javascript
// Lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px 0px', // Load 50px before entering viewport
    threshold: 0.1
});

// Observe all lazy images
document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});
```

### Advanced Intersection Observer
```javascript
class IntersectionManager {
    constructor() {
        this.observers = new Map();
    }
    
    createObserver(name, callback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver(callback, {
            ...defaultOptions,
            ...options
        });
        
        this.observers.set(name, observer);
        return observer;
    }
    
    getObserver(name) {
        return this.observers.get(name);
    }
    
    destroyObserver(name) {
        const observer = this.observers.get(name);
        if (observer) {
            observer.disconnect();
            this.observers.delete(name);
        }
    }
    
    destroyAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

const intersectionManager = new IntersectionManager();

// Lazy loading observer
intersectionManager.createObserver('lazyLoad', (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            
            if (element.dataset.src) {
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
            }
            
            if (element.dataset.srcset) {
                element.srcset = element.dataset.srcset;
                element.removeAttribute('data-srcset');
            }
            
            element.classList.add('loaded');
            intersectionManager.getObserver('lazyLoad').unobserve(element);
        }
    });
}, {
    rootMargin: '100px 0px',
    threshold: 0.1
});

// Infinite scroll observer
intersectionManager.createObserver('infiniteScroll', (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadMoreContent();
        }
    });
}, {
    rootMargin: '200px 0px',
    threshold: 1.0
});

// Animation trigger observer
intersectionManager.createObserver('animations', (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        } else {
            entry.target.classList.remove('animate-in');
        }
    });
}, {
    threshold: 0.3
});

// Progress tracking observer
intersectionManager.createObserver('progress', (entries) => {
    entries.forEach(entry => {
        const progress = Math.round(entry.intersectionRatio * 100);
        updateReadingProgress(progress);
    });
}, {
    threshold: Array.from({ length: 101 }, (_, i) => i / 100) // 0, 0.01, 0.02, ..., 1.0
});

// Usage
document.querySelectorAll('[data-src]').forEach(el => {
    intersectionManager.getObserver('lazyLoad').observe(el);
});

const sentinel = document.querySelector('#scroll-sentinel');
if (sentinel) {
    intersectionManager.getObserver('infiniteScroll').observe(sentinel);
}

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    intersectionManager.getObserver('animations').observe(el);
});

const article = document.querySelector('article');
if (article) {
    intersectionManager.getObserver('progress').observe(article);
}

function loadMoreContent() {
    // Load more content implementation
    console.log('Loading more content...');
}

function updateReadingProgress(progress) {
    const progressBar = document.querySelector('#reading-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}
```

---

## 🔍 Mutation Observer

### Basic Mutation Observer
```javascript
// Watch for DOM changes
const targetNode = document.getElementById('content');

const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        console.log('Mutation type:', mutation.type);
        
        switch (mutation.type) {
            case 'childList':
                console.log('Children changed:', {
                    added: mutation.addedNodes,
                    removed: mutation.removedNodes
                });
                break;
                
            case 'attributes':
                console.log('Attribute changed:', {
                    name: mutation.attributeName,
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.getAttribute(mutation.attributeName)
                });
                break;
                
            case 'characterData':
                console.log('Text content changed:', {
                    oldValue: mutation.oldValue,
                    newValue: mutation.target.textContent
                });
                break;
        }
    });
});

// Start observing
observer.observe(targetNode, {
    childList: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    subtree: true // Watch all descendants
});

// Stop observing
// observer.disconnect();
```

### Advanced Mutation Observer
```javascript
class DOMWatcher {
    constructor() {
        this.observers = new Map();
        this.watchers = new Map();
    }
    
    watch(selector, options = {}, callback) {
        const watchId = Date.now() + Math.random();
        
        const defaultOptions = {
            childList: true,
            attributes: false,
            attributeOldValue: false,
            characterData: false,
            characterDataOldValue: false,
            subtree: true
        };
        
        const observer = new MutationObserver((mutations) => {
            const relevantMutations = mutations.filter(mutation => {
                if (selector === '*') return true;
                
                // Check if mutation affects elements matching selector
                if (mutation.type === 'childList') {
                    const addedElements = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === Node.ELEMENT_NODE);
                    const removedElements = Array.from(mutation.removedNodes)
                        .filter(node => node.nodeType === Node.ELEMENT_NODE);
                    
                    return addedElements.some(el => el.matches(selector)) ||
                           removedElements.some(el => el.matches(selector));
                }
                
                return mutation.target.matches(selector);
            });
            
            if (relevantMutations.length > 0) {
                callback(relevantMutations, observer);
            }
        });
        
        const target = document.body; // Watch entire document
        observer.observe(target, { ...defaultOptions, ...options });
        
        this.observers.set(watchId, observer);
        this.watchers.set(watchId, { selector, options, callback });
        
        return watchId;
    }
    
    unwatch(watchId) {
        const observer = this.observers.get(watchId);
        if (observer) {
            observer.disconnect();
            this.observers.delete(watchId);
            this.watchers.delete(watchId);
        }
    }
    
    unwatchAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.watchers.clear();
    }
    
    // Watch for specific element additions
    onElementAdded(selector, callback) {
        return this.watch(selector, { childList: true }, (mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    const addedElements = Array.from(mutation.addedNodes)
                        .filter(node => node.nodeType === Node.ELEMENT_NODE && node.matches(selector));
                    
                    addedElements.forEach(element => callback(element));
                }
            });
        });
    }
    
    // Watch for specific element removals
    onElementRemoved(selector, callback) {
        return this.watch(selector, { childList: true }, (mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    const removedElements = Array.from(mutation.removedNodes)
                        .filter(node => node.nodeType === Node.ELEMENT_NODE && node.matches(selector));
                    
                    removedElements.forEach(element => callback(element));
                }
            });
        });
    }
    
    // Watch for attribute changes
    onAttributeChange(selector, attributeName, callback) {
        return this.watch(selector, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: attributeName ? [attributeName] : undefined
        }, (mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes') {
                    callback(mutation.target, {
                        attributeName: mutation.attributeName,
                        oldValue: mutation.oldValue,
                        newValue: mutation.target.getAttribute(mutation.attributeName)
                    });
                }
            });
        });
    }
    
    // Watch for text content changes
    onTextChange(selector, callback) {
        return this.watch(selector, {
            characterData: true,
            characterDataOldValue: true,
            subtree: true
        }, (mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'characterData') {
                    callback(mutation.target, {
                        oldValue: mutation.oldValue,
                        newValue: mutation.target.textContent
                    });
                }
            });
        });
    }
}

// Usage
const domWatcher = new DOMWatcher();

// Watch for new buttons being added
const buttonWatchId = domWatcher.onElementAdded('button', (button) => {
    console.log('New button added:', button);
    // Auto-setup event listeners for new buttons
    button.addEventListener('click', handleButtonClick);
});

// Watch for class changes on specific elements
const classWatchId = domWatcher.onAttributeChange('.status-indicator', 'class', (element, change) => {
    console.log('Class changed:', change);
    if (change.newValue.includes('error')) {
        showErrorNotification();
    }
});

// Watch for text changes in live content
const textWatchId = domWatcher.onTextChange('#live-content', (textNode, change) => {
    console.log('Text updated:', change);
    updateLastModified();
});

function handleButtonClick(e) {
    console.log('Button clicked:', e.target);
}

function showErrorNotification() {
    console.log('Error detected!');
}

function updateLastModified() {
    document.querySelector('#last-modified').textContent = new Date().toLocaleString();
}

---

## 🕰️ History API

### Basic History Management
```javascript
// Push new state
history.pushState({ page: 'about' }, 'About Page', '/about');

// Replace current state
history.replaceState({ page: 'home', section: 'hero' }, 'Home - Hero', '/home#hero');

// Go back/forward
history.back();
history.forward();
history.go(-2); // Go back 2 pages

// Listen for popstate events (back/forward button)
window.addEventListener('popstate', (e) => {
    console.log('State changed:', e.state);
    handleRouteChange(e.state);
});

function handleRouteChange(state) {
    if (state) {
        // Update page based on state
        switch (state.page) {
            case 'home':
                showHomePage();
                break;
            case 'about':
                showAboutPage();
                break;
            default:
                show404Page();
        }
    }
}
```

### Single Page Application Router
```javascript
class SPARouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeRouteChange = null;
        this.afterRouteChange = null;
        
        this.init();
    }
    
    init() {
        // Handle popstate events
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(window.location.pathname, e.state, false);
        });
        
        // Handle initial page load
        this.handleRouteChange(window.location.pathname, null, false);
        
        // Intercept link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="/"]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });
    }
    
    addRoute(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            title: options.title || '',
            meta: options.meta || {},
            guards: options.guards || []
        });
    }
    
    navigate(path, state = {}, replace = false) {
        const route = this.findRoute(path);
        
        if (!route) {
            console.error('Route not found:', path);
            return;
        }
        
        this.handleRouteChange(path, state, true, replace);
    }
    
    findRoute(path) {
        // Exact match first
        if (this.routes.has(path)) {
            return { path, ...this.routes.get(path) };
        }
        
        // Pattern matching for dynamic routes
        for (const [routePath, routeConfig] of this.routes) {
            const params = this.matchRoute(routePath, path);
            if (params) {
                return { path: routePath, params, ...routeConfig };
            }
        }
        
        return null;
    }
    
    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        
        if (routeParts.length !== actualParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            const routePart = routeParts[i];
            const actualPart = actualParts[i];
            
            if (routePart.startsWith(':')) {
                // Dynamic parameter
                params[routePart.slice(1)] = actualPart;
            } else if (routePart !== actualPart) {
                return null;
            }
        }
        
        return params;
    }
    
    async handleRouteChange(path, state, updateHistory, replace = false) {
        const route = this.findRoute(path);
        
        if (!route) {
            console.error('Route not found:', path);
            return;
        }
        
        // Run before route change hook
        if (this.beforeRouteChange) {
            const canProceed = await this.beforeRouteChange(route, this.currentRoute);
            if (!canProceed) return;
        }
        
        // Run route guards
        for (const guard of route.guards) {
            const canProceed = await guard(route);
            if (!canProceed) return;
        }
        
        // Update browser history
        if (updateHistory) {
            const method = replace ? 'replaceState' : 'pushState';
            history[method](state, route.title, path);
        }
        
        // Update document title
        if (route.title) {
            document.title = route.title;
        }
        
        // Update meta tags
        this.updateMetaTags(route.meta);
        
        // Execute route handler
        try {
            await route.handler(route.params || {}, state);
            this.currentRoute = route;
            
            // Run after route change hook
            if (this.afterRouteChange) {
                this.afterRouteChange(route);
            }
        } catch (error) {
            console.error('Route handler error:', error);
        }
    }
    
    updateMetaTags(meta) {
        Object.entries(meta).forEach(([name, content]) => {
            let metaTag = document.querySelector(`meta[name="${name}"]`);
            
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.name = name;
                document.head.appendChild(metaTag);
            }
            
            metaTag.content = content;
        });
    }
    
    setBeforeRouteChange(callback) {
        this.beforeRouteChange = callback;
    }
    
    setAfterRouteChange(callback) {
        this.afterRouteChange = callback;
    }
    
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Usage
const router = new SPARouter();

// Add routes
router.addRoute('/', async () => {
    document.getElementById('app').innerHTML = '<h1>Home Page</h1>';
}, {
    title: 'Home - My App',
    meta: {
        description: 'Welcome to our home page'
    }
});

router.addRoute('/about', async () => {
    document.getElementById('app').innerHTML = '<h1>About Page</h1>';
}, {
    title: 'About - My App'
});

router.addRoute('/user/:id', async (params) => {
    const userId = params.id;
    const user = await fetchUser(userId);
    document.getElementById('app').innerHTML = `<h1>User: ${user.name}</h1>`;
}, {
    title: 'User Profile - My App',
    guards: [requireAuth]
});

// Route guards
async function requireAuth(route) {
    const isAuthenticated = checkAuthStatus();
    if (!isAuthenticated) {
        router.navigate('/login');
        return false;
    }
    return true;
}

// Hooks
router.setBeforeRouteChange(async (newRoute, oldRoute) => {
    console.log('Navigating from', oldRoute?.path, 'to', newRoute.path);
    showLoadingSpinner();
    return true;
});

router.setAfterRouteChange((route) => {
    console.log('Route changed to:', route.path);
    hideLoadingSpinner();
    trackPageView(route.path);
});

function fetchUser(id) {
    return fetch(`/api/users/${id}`).then(r => r.json());
}

function checkAuthStatus() {
    return localStorage.getItem('authToken') !== null;
}

function showLoadingSpinner() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loading').style.display = 'none';
}

function trackPageView(path) {
    // Analytics tracking
    console.log('Page view:', path);
}
```

---

## 🔔 Notification API

### Basic Notifications
```javascript
// Check if notifications are supported
if ('Notification' in window) {
    // Request permission
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showNotification('Welcome!', 'Thanks for enabling notifications.');
        } else {
            console.log('Notification permission denied');
        }
    });
} else {
    console.log('Notifications not supported');
}

function showNotification(title, body, options = {}) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            image: '/images/notification-image.jpg',
            vibrate: [200, 100, 200],
            tag: 'general', // Prevents duplicate notifications
            renotify: false,
            requireInteraction: false,
            silent: false,
            ...options
        });
        
        // Handle notification events
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        notification.onshow = () => {
            console.log('Notification shown');
        };
        
        notification.onclose = () => {
            console.log('Notification closed');
        };
        
        notification.onerror = () => {
            console.error('Notification error');
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        return notification;
    }
}
```

### Advanced Notification Manager
```javascript
class NotificationManager {
    constructor() {
        this.permission = Notification.permission;
        this.notifications = new Map();
        this.queue = [];
        this.isSupported = 'Notification' in window;
    }
    
    async requestPermission() {
        if (!this.isSupported) {
            throw new Error('Notifications not supported');
        }
        
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        
        return this.permission;
    }
    
    async show(title, options = {}) {
        if (!this.isSupported) {
            console.warn('Notifications not supported');
            return null;
        }
        
        if (this.permission !== 'granted') {
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission denied');
                return null;
            }
        }
        
        const defaultOptions = {
            body: '',
            icon: '/images/icon-192x192.png',
            badge: '/images/badge-72x72.png',
            tag: 'default',
            renotify: false,
            requireInteraction: false,
            silent: false,
            vibrate: [100, 50, 100],
            data: {},
            actions: []
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Close existing notification with same tag
        if (finalOptions.tag && this.notifications.has(finalOptions.tag)) {
            this.notifications.get(finalOptions.tag).close();
        }
        
        const notification = new Notification(title, finalOptions);
        
        // Store notification
        if (finalOptions.tag) {
            this.notifications.set(finalOptions.tag, notification);
        }
        
        // Setup event handlers
        notification.onclick = (e) => {
            if (options.onClick) {
                options.onClick(e, notification);
            } else {
                window.focus();
                notification.close();
            }
        };
        
        notification.onclose = (e) => {
            if (finalOptions.tag) {
                this.notifications.delete(finalOptions.tag);
            }
            if (options.onClose) {
                options.onClose(e, notification);
            }
        };
        
        notification.onerror = (e) => {
            if (options.onError) {
                options.onError(e, notification);
            }
        };
        
        notification.onshow = (e) => {
            if (options.onShow) {
                options.onShow(e, notification);
            }
        };
        
        // Auto-close if specified
        if (options.autoClose) {
            setTimeout(() => {
                notification.close();
            }, options.autoClose);
        }
        
        return notification;
    }
    
    close(tag) {
        const notification = this.notifications.get(tag);
        if (notification) {
            notification.close();
        }
    }
    
    closeAll() {
        this.notifications.forEach(notification => notification.close());
        this.notifications.clear();
    }
    
    // Predefined notification types
    success(title, body, options = {}) {
        return this.show(title, {
            body,
            icon: '/images/success-icon.png',
            tag: 'success',
            autoClose: 3000,
            ...options
        });
    }
    
    error(title, body, options = {}) {
        return this.show(title, {
            body,
            icon: '/images/error-icon.png',
            tag: 'error',
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 200],
            ...options
        });
    }
    
    warning(title, body, options = {}) {
        return this.show(title, {
            body,
            icon: '/images/warning-icon.png',
            tag: 'warning',
            autoClose: 5000,
            ...options
        });
    }
    
    info(title, body, options = {}) {
        return this.show(title, {
            body,
            icon: '/images/info-icon.png',
            tag: 'info',
            autoClose: 4000,
            ...options
        });
    }
    
    // Queue notifications when permission is not granted
    queueNotification(title, options) {
        this.queue.push({ title, options });
    }
    
    async processQueue() {
        if (this.permission === 'granted' && this.queue.length > 0) {
            for (const { title, options } of this.queue) {
                await this.show(title, options);
            }
            this.queue = [];
        }
    }
    
    getPermissionStatus() {
        return this.permission;
    }
    
    isSupported() {
        return this.isSupported;
    }
}

// Usage
const notifications = new NotificationManager();

// Request permission on page load
notifications.requestPermission().then(permission => {
    if (permission === 'granted') {
        notifications.processQueue();
    }
});

// Show different types of notifications
notifications.success('Success!', 'Your changes have been saved.');
notifications.error('Error!', 'Failed to save changes. Please try again.');
notifications.warning('Warning!', 'Your session will expire in 5 minutes.');
notifications.info('Info', 'New features are available!');

// Custom notification with actions (requires service worker)
 notifications.show('New Message', {
     body: 'You have received a new message from John.',
     tag: 'message',
     data: { messageId: 123 },
     actions: [
         { action: 'reply', title: 'Reply', icon: '/images/reply-icon.png' },
         { action: 'mark-read', title: 'Mark as Read', icon: '/images/read-icon.png' }
     ],
     onClick: (e, notification) => {
         // Handle notification click
         window.open('/messages/123');
         notification.close();
     }
 });
 ```

---

## ⚠️ Common Pitfalls

### 1. Storage Quota Exceeded
```javascript
// ❌ Not handling storage quota errors
localStorage.setItem('data', largeDataString); // May throw QuotaExceededError

// ✅ Handle storage errors gracefully
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded');
            // Clear old data or ask user
            clearOldData();
            return false;
        }
        throw error;
    }
}
```

### 2. Fetch API Error Handling
```javascript
// ❌ Not checking response status
fetch('/api/data')
    .then(response => response.json()) // This will succeed even for 404/500
    .then(data => console.log(data));

// ✅ Proper error handling
fetch('/api/data')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Fetch error:', error));
```

### 3. Geolocation Timeout
```javascript
// ❌ No timeout handling
navigator.geolocation.getCurrentPosition(success, error);

// ✅ Set appropriate timeout
navigator.geolocation.getCurrentPosition(success, error, {
    timeout: 10000, // 10 seconds
    maximumAge: 60000, // Cache for 1 minute
    enableHighAccuracy: false // Faster, less accurate
});
```

### 4. Canvas Memory Leaks
```javascript
// ❌ Not cleaning up canvas resources
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// ... use canvas

// ✅ Clean up properly
function cleanupCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    canvas.remove();
}
```

### 5. Web Worker Memory Management
```javascript
// ❌ Not terminating workers
const worker = new Worker('worker.js');
worker.postMessage(data);
// Worker keeps running

// ✅ Terminate when done
worker.onmessage = (e) => {
    console.log(e.data);
    worker.terminate(); // Clean up
};
```

### 6. Service Worker Update Issues
```javascript
// ❌ Not handling service worker updates
navigator.serviceWorker.register('/sw.js');

// ✅ Handle updates properly
navigator.serviceWorker.register('/sw.js')
    .then(registration => {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    showUpdatePrompt();
                }
            });
        });
    });
```

### 7. Observer Memory Leaks
```javascript
// ❌ Not disconnecting observers
const observer = new IntersectionObserver(callback);
observer.observe(element);
// Observer keeps running even after element is removed

// ✅ Clean up observers
function cleanup() {
    observer.disconnect();
    mutationObserver.disconnect();
}

// Clean up when component unmounts
window.addEventListener('beforeunload', cleanup);
```

---

## 🏋️ Mini Practice Problems

### Problem 1: Offline-First Todo App
```javascript
// Create a todo app that works offline using:
// - Service Worker for caching
// - IndexedDB for data storage
// - Background sync for uploading when online
// - Push notifications for reminders

class OfflineTodoApp {
    constructor() {
        // Your implementation here
        // Should handle:
        // - CRUD operations that work offline
        // - Sync with server when online
        // - Conflict resolution
        // - Push notifications for due dates
        // - Offline indicator
    }
    
    // Methods to implement:
    // init()
    // addTodo(text, dueDate)
    // updateTodo(id, updates)
    // deleteTodo(id)
    // syncWithServer()
    // handleConflicts(localTodos, serverTodos)
    // scheduleNotification(todo)
    // showOfflineIndicator()
    // registerServiceWorker()
}
```

### Problem 2: Real-time Collaborative Canvas
```javascript
// Create a collaborative drawing canvas using:
// - Canvas API for drawing
// - WebSockets for real-time sync
// - Web Workers for heavy computations
// - File API for import/export
// - History API for undo/redo

class CollaborativeCanvas {
    constructor(canvas, websocketUrl) {
        // Your implementation
        // Should handle:
        // - Multi-user drawing
        // - Real-time cursor positions
        // - Conflict-free drawing operations
        // - Export to various formats
        // - Undo/redo with collaborative history
    }
    
    // Methods to implement:
    // setupCanvas()
    // setupWebSocket()
    // setupWorkers()
    // broadcastDrawing(operation)
    // receiveDrawing(operation)
    // exportCanvas(format)
    // importImage(file)
    // undo()
    // redo()
    // showCursors(users)
}
```

### Problem 3: Progressive Web App Dashboard
```javascript
// Create a PWA dashboard with:
// - Service Worker for offline functionality
// - Web App Manifest for installation
// - Push notifications for alerts
// - Background sync for data updates
// - Geolocation for location-based features
// - Local storage for user preferences

class PWADashboard {
    constructor() {
        // Your implementation
        // Should include:
        // - Installable PWA
        // - Offline data visualization
        // - Real-time notifications
        // - Location-based widgets
        // - Customizable layout
        // - Data export/import
    }
    
    // Methods to implement:
    // registerServiceWorker()
    // setupPushNotifications()
    // handleInstallPrompt()
    // syncData()
    // updateLocation()
    // saveLayout()
    // exportData()
    // showOfflineMessage()
}
```

### Problem 4: Media Processing Workbench
```javascript
// Create a media processing app using:
// - File API for file handling
// - Canvas API for image processing
// - Web Workers for heavy processing
// - Web Audio API for audio processing
// - Intersection Observer for lazy loading
// - Drag and Drop API

class MediaWorkbench {
    constructor() {
        // Your implementation
        // Should support:
        // - Image filters and effects
        // - Audio visualization
        // - Batch processing
        // - Progress tracking
        // - Preview generation
        // - Format conversion
    }
    
    // Methods to implement:
    // setupDropZone()
    // processImage(file, filters)
    // processAudio(file, effects)
    // generateThumbnails(files)
    // showProgress(operation)
    // exportProcessed(format)
    // setupWorkerPool()
}
```

### Problem 5: Smart Notification System
```javascript
// Create an intelligent notification system using:
// - Notification API for alerts
// - Service Worker for background notifications
// - Geolocation for location-based alerts
// - Intersection Observer for engagement tracking
// - Local Storage for user preferences
// - Machine learning for notification timing

class SmartNotificationSystem {
    constructor() {
        // Your implementation
        // Should include:
        // - Adaptive notification timing
        // - Location-based triggers
        // - User engagement analysis
        // - Notification grouping
        // - Do not disturb modes
        // - A/B testing for effectiveness
    }
    
    // Methods to implement:
    // analyzeUserBehavior()
    // predictOptimalTime(notification)
    // scheduleNotification(notification, timing)
    // groupNotifications(notifications)
    // trackEngagement(notification, action)
    // respectDoNotDisturb()
    // optimizeDelivery()
}
```

---

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between localStorage and sessionStorage?**
- **localStorage**: Persists until manually cleared, shared across tabs
- **sessionStorage**: Persists only for the session, tab-specific
- **Both**: Synchronous, 5-10MB limit, string-only storage

**Q: How do you handle CORS in fetch requests?**
- CORS is handled by the server, not the client
- Use `mode: 'cors'` for cross-origin requests
- Server must send appropriate CORS headers
- For credentials: `credentials: 'include'` and server allows

**Q: When would you use Web Workers?**
- Heavy computations that block the main thread
- Image/video processing
- Data parsing and transformation
- Background data synchronization
- Cryptographic operations

**Q: What's the difference between Service Workers and Web Workers?**
- **Service Workers**: Network proxy, caching, push notifications, background sync
- **Web Workers**: Parallel processing, doesn't intercept network requests
- **Service Workers**: Persist between sessions, control multiple pages
- **Web Workers**: Tied to the page that created them

**Q: How do you implement offline functionality?**
- Service Worker for caching strategies
- IndexedDB for offline data storage
- Background sync for data synchronization
- Cache API for resource caching
- Network detection for online/offline states

**Q: What are the different caching strategies?**
- **Cache First**: Check cache, fallback to network
- **Network First**: Try network, fallback to cache
- **Cache Only**: Only serve from cache
- **Network Only**: Only fetch from network
- **Stale While Revalidate**: Serve from cache, update in background

### 🏢 Asked at Companies:
- **Google**: "Implement a PWA with offline functionality and push notifications"
- **Facebook**: "Create a real-time collaborative editor using various browser APIs"
- **Amazon**: "Build a file upload system with progress tracking and resumable uploads"
- **Microsoft**: "Design a notification system that respects user preferences and timing"
- **Netflix**: "Implement video streaming with offline download capabilities"

## 🎯 Key Takeaways

1. **Always check API support** - Use feature detection before using APIs
2. **Handle errors gracefully** - Network requests, storage limits, permissions
3. **Respect user preferences** - Notifications, location, storage usage
4. **Optimize for performance** - Use Web Workers for heavy tasks
5. **Implement offline strategies** - Service Workers, caching, local storage
6. **Clean up resources** - Terminate workers, disconnect observers
7. **Progressive enhancement** - Apps should work without advanced APIs
8. **Security considerations** - Validate data, handle permissions properly

---

**Previous Chapter**: [← Event Handling](./14-event-handling.md)  
**Next Chapter**: [Testing & Debugging →](./16-testing-debugging.md)

**Practice**: Build a complete PWA using multiple browser APIs and test offline functionality!
```)