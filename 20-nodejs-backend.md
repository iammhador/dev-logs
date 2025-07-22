# Chapter 20: Node.js & Backend Development 🚀

## 📋 Table of Contents
- [Introduction to Node.js](#introduction-to-nodejs)
- [Setting Up Node.js Environment](#setting-up-nodejs-environment)
- [Core Modules](#core-modules)
- [Express.js Framework](#expressjs-framework)
- [Database Integration](#database-integration)
- [Authentication & Authorization](#authentication--authorization)
- [API Development](#api-development)
- [File Handling](#file-handling)
- [Real-time Communication](#real-time-communication)
- [Testing Backend Applications](#testing-backend-applications)
- [Deployment & Production](#deployment--production)
- [Common Pitfalls](#common-pitfalls)
- [Practice Problems](#practice-problems)
- [Interview Notes](#interview-notes)

---

## 🌟 Introduction to Node.js

### What is Node.js?
```javascript
// Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine
// It allows you to run JavaScript on the server side

// Key Features:
// 1. Event-driven, non-blocking I/O
// 2. Single-threaded with event loop
// 3. NPM (Node Package Manager)
// 4. Cross-platform
// 5. Fast execution

// Event Loop Example
console.log('Start');

setTimeout(() => {
    console.log('Timeout callback');
}, 0);

setImmediate(() => {
    console.log('Immediate callback');
});

process.nextTick(() => {
    console.log('Next tick callback');
});

console.log('End');

// Output:
// Start
// End
// Next tick callback
// Immediate callback
// Timeout callback
```

### Node.js vs Browser JavaScript
```javascript
// Browser JavaScript
// - DOM manipulation
// - Window object
// - Limited file system access
// - Same-origin policy

// Node.js JavaScript
// - File system access
// - Network operations
// - Process management
// - Module system (CommonJS/ES Modules)

// Node.js Global Objects
console.log(__dirname);  // Current directory
console.log(__filename); // Current file
console.log(process.env); // Environment variables
console.log(process.argv); // Command line arguments

// Module System
// CommonJS (traditional)
const fs = require('fs');
const path = require('path');

// ES Modules (modern)
import fs from 'fs';
import path from 'path';
```

---

## ⚙️ Setting Up Node.js Environment

### Project Initialization
```bash
# Initialize a new Node.js project
npm init -y

# Install dependencies
npm install express mongoose dotenv
npm install -D nodemon jest supertest

# Create basic project structure
mkdir src
mkdir src/controllers
mkdir src/models
mkdir src/routes
mkdir src/middleware
mkdir src/utils
mkdir tests
```

### Package.json Configuration
```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "A Node.js backend application",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "build": "babel src -d dist"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.4",
    "supertest": "^6.3.3",
    "eslint": "^8.48.0"
  }
}
```

### Environment Configuration
```javascript
// .env file
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
API_VERSION=v1

// config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;

// config/config.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1'
};
```

---

## 🔧 Core Modules

### File System (fs)
```javascript
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

// Synchronous file operations (blocking)
try {
    const data = fs.readFileSync('file.txt', 'utf8');
    console.log(data);
} catch (error) {
    console.error('Error reading file:', error.message);
}

// Asynchronous file operations (non-blocking)
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err.message);
        return;
    }
    console.log(data);
});

// Promise-based file operations
try {
    const data = await fsPromises.readFile('file.txt', 'utf8');
    console.log(data);
} catch (error) {
    console.error('Error reading file:', error.message);
}

// File operations utility class
class FileManager {
    static async readJSON(filePath) {
        try {
            const data = await fsPromises.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Failed to read JSON file: ${error.message}`);
        }
    }
    
    static async writeJSON(filePath, data) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            await fsPromises.writeFile(filePath, jsonData, 'utf8');
        } catch (error) {
            throw new Error(`Failed to write JSON file: ${error.message}`);
        }
    }
    
    static async ensureDirectory(dirPath) {
        try {
            await fsPromises.access(dirPath);
        } catch (error) {
            await fsPromises.mkdir(dirPath, { recursive: true });
        }
    }
    
    static async deleteFile(filePath) {
        try {
            await fsPromises.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
}

// Usage
try {
    await FileManager.ensureDirectory('./uploads');
    const config = await FileManager.readJSON('./config.json');
    await FileManager.writeJSON('./backup.json', config);
} catch (error) {
    console.error('File operation failed:', error.message);
}
```

### HTTP Module
```javascript
import http from 'http';
import url from 'url';
import querystring from 'querystring';

// Basic HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const method = req.method;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Route handling
    if (pathname === '/api/users' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users: ['John', 'Jane'] }));
    } else if (pathname === '/api/users' && method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User created', user: userData }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## 🧪 Testing Backend Applications

### Unit Testing with Jest
```javascript
// tests/services/userService.test.js
import UserService from '../../src/services/userService.js';
import User from '../../src/models/User.js';
import { jest } from '@jest/globals';

// Mock the User model
jest.mock('../../src/models/User.js');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            
            const mockUser = {
                _id: 'user123',
                ...userData,
                save: jest.fn().mockResolvedValue(true)
            };
            
            User.mockImplementation(() => mockUser);
            
            const result = await UserService.createUser(userData);
            
            expect(User).toHaveBeenCalledWith(userData);
            expect(mockUser.save).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });
        
        it('should throw error when user creation fails', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            
            const mockUser = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            
            User.mockImplementation(() => mockUser);
            
            await expect(UserService.createUser(userData))
                .rejects.toThrow('Failed to create user: Database error');
        });
    });
    
    describe('getUserById', () => {
        it('should return user when found', async () => {
            const userId = 'user123';
            const mockUser = {
                _id: userId,
                name: 'John Doe',
                email: 'john@example.com'
            };
            
            User.findById.mockResolvedValue(mockUser);
            
            const result = await UserService.getUserById(userId);
            
            expect(User.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUser);
        });
        
        it('should throw error when user not found', async () => {
            const userId = 'nonexistent';
            
            User.findById.mockResolvedValue(null);
            
            await expect(UserService.getUserById(userId))
                .rejects.toThrow('Failed to get user: User not found');
        });
    });
});
```

### Integration Testing
```javascript
// tests/integration/auth.test.js
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import connectDB from '../../src/config/database.js';
import mongoose from 'mongoose';

describe('Authentication Integration Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });
    
    beforeEach(async () => {
        await User.deleteMany({});
    });
    
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(201);
            
            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            
            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.name).toBe(userData.name);
        });
        
        it('should not register user with invalid email', async () => {
            const userData = {
                name: 'John Doe',
                email: 'invalid-email',
                password: 'password123'
            };
            
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(400);
            
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Validation failed');
        });
    });
    
    describe('POST /api/v1/auth/login', () => {
        let user;
        
        beforeEach(async () => {
            user = new User({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            });
            await user.save();
        });
        
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                })
                .expect(200);
            
            expect(response.body.message).toBe('Login successful');
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });
        
        it('should not login with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);
            
            expect(response.body.error).toBe('Invalid credentials');
        });
    });
});
```

### API Testing
```javascript
// tests/api/users.test.js
import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config/config.js';

describe('Users API', () => {
    let authToken;
    let adminToken;
    let testUser;
    let adminUser;
    
    beforeEach(async () => {
        await User.deleteMany({});
        
        // Create test user
        testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        await testUser.save();
        
        // Create admin user
        adminUser = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });
        await adminUser.save();
        
        // Generate tokens
        authToken = testUser.generateAuthToken();
        adminToken = adminUser.generateAuthToken();
    });
    
    describe('GET /api/v1/users', () => {
        it('should get all users', async () => {
            const response = await request(app)
                .get('/api/v1/users')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.pagination).toBeDefined();
        });
        
        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/v1/users?page=1&limit=1')
                .expect(200);
            
            expect(response.body.data).toHaveLength(1);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(1);
            expect(response.body.pagination.total).toBe(2);
        });
    });
    
    describe('PUT /api/v1/users/:id', () => {
        it('should update user with valid token', async () => {
            const updateData = { name: 'Updated Name' };
            
            const response = await request(app)
                .put(`/api/v1/users/${testUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
        });
        
        it('should not update user without token', async () => {
            const updateData = { name: 'Updated Name' };
            
            const response = await request(app)
                .put(`/api/v1/users/${testUser._id}`)
                .send(updateData)
                .expect(401);
            
            expect(response.body.error).toBe('Access denied. No token provided.');
        });
    });
    
    describe('DELETE /api/v1/users/:id', () => {
        it('should delete user as admin', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User deleted successfully');
        });
        
        it('should not delete user as regular user', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${adminUser._id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(403);
            
            expect(response.body.error).toBe('Insufficient permissions.');
        });
    });
});
```

---

## 🚀 Deployment & Production

### Environment Configuration
```javascript
// config/production.js
export const productionConfig = {
    // Database
    mongoUri: process.env.MONGODB_URI,
    
    // Security
    jwtSecret: process.env.JWT_SECRET,
    bcryptRounds: 12,
    
    // Rate limiting
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    
    // CORS
    corsOrigin: process.env.FRONTEND_URL?.split(',') || [],
    
    // Logging
    logLevel: 'info',
    
    // File uploads
    maxFileSize: 10 * 1024 * 1024, // 10MB
    
    // Session
    sessionSecret: process.env.SESSION_SECRET,
    sessionMaxAge: 24 * 60 * 60 * 1000, // 24 hours
    
    // Email
    emailService: process.env.EMAIL_SERVICE,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD
};

// Dockerfile
/*
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY config/ ./config/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start application
CMD ["node", "src/app.js"]
*/

// docker-compose.yml
/*
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
volumes:
  mongo_data:
*/
```

### Process Management with PM2
```javascript
// ecosystem.config.js
module.exports = {
    apps: [{
        name: 'my-app',
        script: 'src/app.js',
        instances: 'max', // Use all CPU cores
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        max_memory_restart: '1G',
        node_args: '--max-old-space-size=1024'
    }]
};

// Start with PM2
// pm2 start ecosystem.config.js --env production
// pm2 save
// pm2 startup
```

---

## ⚠️ Common Pitfalls

### 1. **Blocking the Event Loop**
```javascript
// ❌ Bad: Blocking operation
app.get('/bad', (req, res) => {
    // This blocks the event loop
    const result = heavyComputationSync();
    res.json({ result });
});

// ✅ Good: Non-blocking operation
app.get('/good', async (req, res) => {
    try {
        // Use worker threads or async operations
        const result = await heavyComputationAsync();
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Better: Use worker threads for CPU-intensive tasks
import { Worker, isMainThread, parentPort } from 'worker_threads';

if (isMainThread) {
    app.get('/worker', async (req, res) => {
        try {
            const worker = new Worker(__filename);
            worker.postMessage(req.body.data);
            
            worker.on('message', (result) => {
                res.json({ result });
            });
            
            worker.on('error', (error) => {
                res.status(500).json({ error: error.message });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
} else {
    parentPort.on('message', (data) => {
        const result = heavyComputationSync(data);
        parentPort.postMessage(result);
    });
}
```

### 2. **Memory Leaks**
```javascript
// ❌ Bad: Memory leaks
const cache = new Map();

app.get('/leak', (req, res) => {
    // Cache grows indefinitely
    cache.set(req.url, new Date());
    res.json({ cached: cache.size });
});

// ✅ Good: Proper cache management
import NodeCache from 'node-cache';

const cache = new NodeCache({ 
    stdTTL: 600, // 10 minutes
    maxKeys: 1000 // Maximum 1000 keys
});

app.get('/cached', (req, res) => {
    const key = req.url;
    let data = cache.get(key);
    
    if (!data) {
        data = generateData();
        cache.set(key, data);
    }
    
    res.json(data);
});

// ❌ Bad: Event listener leaks
app.get('/events', (req, res) => {
    const emitter = new EventEmitter();
    
    // Listener never removed
    emitter.on('data', (data) => {
        console.log(data);
    });
    
    res.json({ message: 'Event listener added' });
});

// ✅ Good: Proper cleanup
app.get('/events-clean', (req, res) => {
    const emitter = new EventEmitter();
    
    const handler = (data) => {
        console.log(data);
    };
    
    emitter.on('data', handler);
    
    // Cleanup after use
    setTimeout(() => {
        emitter.removeListener('data', handler);
    }, 5000);
    
    res.json({ message: 'Event listener added with cleanup' });
});
```

### 3. **Improper Error Handling**
```javascript
// ❌ Bad: Unhandled promise rejections
app.get('/bad-async', (req, res) => {
    // This can crash the application
    someAsyncOperation();
    res.json({ message: 'Started operation' });
});

// ✅ Good: Proper error handling
app.get('/good-async', async (req, res) => {
    try {
        const result = await someAsyncOperation();
        res.json({ result });
    } catch (error) {
        console.error('Operation failed:', error);
        res.status(500).json({ error: 'Operation failed' });
    }
});

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
```

### 4. **Security Issues**
```javascript
// ❌ Bad: SQL injection equivalent (NoSQL injection)
app.get('/users/:id', async (req, res) => {
    // Vulnerable to NoSQL injection
    const user = await User.findOne({ _id: req.params.id });
    res.json(user);
});

// ✅ Good: Input validation
import mongoose from 'mongoose';

app.get('/users/:id', async (req, res) => {
    try {
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ❌ Bad: Exposing sensitive information
app.get('/error-info', (req, res) => {
    try {
        throw new Error('Database connection failed: mongodb://admin:password@localhost');
    } catch (error) {
        // Exposes sensitive information
        res.status(500).json({ error: error.message });
    }
});

// ✅ Good: Safe error messages
app.get('/safe-error', (req, res) => {
    try {
        throw new Error('Database connection failed: mongodb://admin:password@localhost');
    } catch (error) {
        // Log full error for debugging
        console.error('Database error:', error.message);
        
        // Send safe message to client
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

---

## 💡 Practice Problems

### 1. **Real-time Chat Application**
```javascript
// Build a real-time chat application with:
// - User authentication
// - Multiple chat rooms
// - Private messaging
// - Message history
// - Online user status
// - Typing indicators
// - File sharing
// - Message reactions

// Key features to implement:
// 1. WebSocket connection management
// 2. Room-based messaging
// 3. User presence tracking
// 4. Message persistence
// 5. Real-time notifications
```

### 2. **E-commerce API**
```javascript
// Create a comprehensive e-commerce API with:
// - Product catalog management
// - Shopping cart functionality
// - Order processing
// - Payment integration
// - Inventory management
// - User reviews and ratings
// - Search and filtering
// - Admin dashboard

// Key features to implement:
// 1. Complex database relationships
// 2. Transaction handling
// 3. Payment gateway integration
// 4. Email notifications
// 5. File upload for product images
```

### 3. **Task Management System**
```javascript
// Develop a task management system with:
// - Project organization
// - Task assignment
// - Due date tracking
// - Progress monitoring
// - Team collaboration
// - File attachments
// - Time tracking
// - Reporting and analytics

// Key features to implement:
// 1. Role-based access control
// 2. Real-time updates
// 3. Email notifications
// 4. Data visualization
// 5. Export functionality
```

---

## 📝 Interview Notes

### Common Node.js Questions

**Q: What is the Event Loop in Node.js?**
A: The Event Loop is the core mechanism that allows Node.js to perform non-blocking I/O operations. It continuously checks the call stack and processes callbacks from the event queue when the stack is empty.

**Q: Explain the difference between `process.nextTick()` and `setImmediate()`.**
A: `process.nextTick()` has higher priority and executes before any other asynchronous operations, while `setImmediate()` executes after I/O events in the current event loop phase.

**Q: How do you handle errors in Node.js?**
A: Use try-catch for synchronous code, .catch() for promises, error-first callbacks for traditional async operations, and global error handlers for uncaught exceptions.

**Q: What are streams in Node.js?**
A: Streams are objects that allow reading/writing data in chunks rather than loading everything into memory. Types include Readable, Writable, Duplex, and Transform streams.

**Q: How do you scale a Node.js application?**
A: Use clustering to utilize multiple CPU cores, implement load balancing, use caching strategies, optimize database queries, and consider microservices architecture.

### Company-Specific Questions

**Startup/Scale-up Companies:**
- How would you design a real-time notification system?
- Implement a rate limiting middleware
- Design a file upload system with progress tracking

**Enterprise Companies:**
- How do you ensure data consistency in distributed systems?
- Implement authentication with multiple providers
- Design a logging and monitoring system

**E-commerce Companies:**
- How would you handle high-traffic product launches?
- Implement a shopping cart with session management
- Design a payment processing system

---

## 🎯 Key Takeaways

1. **Event-Driven Architecture**: Master the event loop and non-blocking I/O
2. **Security First**: Always validate input and handle errors properly
3. **Performance**: Use clustering, caching, and proper database indexing
4. **Testing**: Write comprehensive unit, integration, and API tests
5. **Monitoring**: Implement logging, error tracking, and performance monitoring
6. **Scalability**: Design for horizontal scaling from the beginning
7. **Best Practices**: Follow security guidelines and coding standards
8. **Real-time Features**: Understand WebSockets and Socket.io for live updates

Remember: Node.js excels at I/O-intensive applications but requires careful handling of CPU-intensive tasks. Always consider the event loop and write non-blocking code! 🚀

```

---

## 🔄 Real-time Communication

### WebSocket with Socket.io
```javascript
// socket/socketHandler.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

class SocketHandler {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST']
            }
        });
        
        this.connectedUsers = new Map();
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    
    setupMiddleware() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    throw new Error('No token provided');
                }
                
                const decoded = jwt.verify(token, config.jwtSecret);
                const user = await User.findById(decoded.id);
                
                if (!user) {
                    throw new Error('User not found');
                }
                
                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
    }
    
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.user.name} connected`);
            
            // Store connected user
            this.connectedUsers.set(socket.userId, {
                socketId: socket.id,
                user: socket.user,
                connectedAt: new Date()
            });
            
            // Notify others about user connection
            socket.broadcast.emit('user:online', {
                userId: socket.userId,
                name: socket.user.name
            });
            
            // Send list of online users
            socket.emit('users:online', this.getOnlineUsers());
            
            // Join user to their personal room
            socket.join(`user:${socket.userId}`);
            
            // Chat events
            this.setupChatEvents(socket);
            
            // Notification events
            this.setupNotificationEvents(socket);
            
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User ${socket.user.name} disconnected`);
                
                // Remove from connected users
                this.connectedUsers.delete(socket.userId);
                
                // Notify others about user disconnection
                socket.broadcast.emit('user:offline', {
                    userId: socket.userId,
                    name: socket.user.name
                });
            });
        });
    }
    
    setupChatEvents(socket) {
        // Join chat room
        socket.on('chat:join', (roomId) => {
            socket.join(`chat:${roomId}`);
            socket.emit('chat:joined', { roomId });
        });
        
        // Leave chat room
        socket.on('chat:leave', (roomId) => {
            socket.leave(`chat:${roomId}`);
            socket.emit('chat:left', { roomId });
        });
        
        // Send message
        socket.on('chat:message', (data) => {
            const { roomId, message } = data;
            
            const messageData = {
                id: Date.now().toString(),
                roomId,
                message,
                sender: {
                    id: socket.userId,
                    name: socket.user.name
                },
                timestamp: new Date().toISOString()
            };
            
            // Send to all users in the room
            this.io.to(`chat:${roomId}`).emit('chat:message', messageData);
        });
        
        // Typing indicators
        socket.on('chat:typing', (data) => {
            const { roomId } = data;
            socket.to(`chat:${roomId}`).emit('chat:typing', {
                userId: socket.userId,
                name: socket.user.name
            });
        });
        
        socket.on('chat:stop-typing', (data) => {
            const { roomId } = data;
            socket.to(`chat:${roomId}`).emit('chat:stop-typing', {
                userId: socket.userId
            });
        });
    }
    
    setupNotificationEvents(socket) {
        // Send notification to specific user
        socket.on('notification:send', (data) => {
            const { userId, notification } = data;
            
            const notificationData = {
                id: Date.now().toString(),
                ...notification,
                from: {
                    id: socket.userId,
                    name: socket.user.name
                },
                timestamp: new Date().toISOString()
            };
            
            this.io.to(`user:${userId}`).emit('notification:received', notificationData);
        });
    }
    
    getOnlineUsers() {
        return Array.from(this.connectedUsers.values()).map(user => ({
            id: user.user._id,
            name: user.user.name,
            connectedAt: user.connectedAt
        }));
    }
    
    // Send notification to specific user (called from other parts of the app)
    sendNotificationToUser(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification:received', {
            id: Date.now().toString(),
            ...notification,
            timestamp: new Date().toISOString()
        });
    }
    
    // Broadcast to all connected users
    broadcast(event, data) {
        this.io.emit(event, data);
    }
}

export default SocketHandler;

// app.js integration
import http from 'http';
import SocketHandler from './socket/socketHandler.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const socketHandler = new SocketHandler(server);

// Make socket handler available globally
app.set('socketHandler', socketHandler);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});