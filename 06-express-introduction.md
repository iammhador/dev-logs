# Introduction to Express.js: Web Framework for Node.js

## Overview

Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies the process of building web servers and APIs by providing a thin layer of fundamental web application features, without obscuring Node.js features you know and love.

## Key Concepts

### What is Express.js?

Express.js is:
- A **web framework** for Node.js
- **Minimalist** and **unopinionated**
- Built on top of Node.js HTTP module
- Provides **routing**, **middleware**, and **templating** capabilities
- The most popular Node.js framework

### Core Features

- **Routing**: Define routes for different HTTP methods and URLs
- **Middleware**: Functions that execute during the request-response cycle
- **Template Engines**: Support for various view engines (EJS, Pug, Handlebars)
- **Static Files**: Serve static assets like CSS, JavaScript, images
- **Error Handling**: Built-in error handling mechanisms

### Express vs Raw Node.js

| Feature | Raw Node.js | Express.js |
|---------|-------------|------------|
| Setup | Complex | Simple |
| Routing | Manual parsing | Built-in router |
| Middleware | Custom implementation | Rich ecosystem |
| Request parsing | Manual | Built-in parsers |
| Static files | Manual handling | `express.static()` |
| Template engines | Manual integration | Built-in support |

## Example Code

### Installing Express

```bash
# Initialize a new project
npm init -y

# Install Express
npm install express

# Install development dependencies
npm install -D nodemon
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Basic Express Server

```javascript
// app.js
const express = require('express');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, Express.js!');
});

// JSON response
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Express server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
```

### Basic Routing

```javascript
// routes-basic.js
const express = require('express');
const app = express();

// GET route
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Express!</h1>');
});

// POST route
app.post('/users', (req, res) => {
    res.json({ message: 'User created' });
});

// PUT route
app.put('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ message: `User ${userId} updated` });
});

// DELETE route
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ message: `User ${userId} deleted` });
});

// Route with multiple HTTP methods
app.route('/products')
    .get((req, res) => {
        res.json({ message: 'Get all products' });
    })
    .post((req, res) => {
        res.json({ message: 'Create product' });
    });

// Route parameters
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ 
        message: `Getting user ${userId}`,
        params: req.params
    });
});

// Multiple route parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    res.json({
        message: `Getting post ${postId} from user ${userId}`,
        params: req.params
    });
});

// Query parameters
app.get('/search', (req, res) => {
    const { q, page, limit } = req.query;
    res.json({
        message: 'Search results',
        query: q,
        page: page || 1,
        limit: limit || 10,
        allQuery: req.query
    });
});

// Wildcard routes
app.get('/files/*', (req, res) => {
    const filePath = req.params[0];
    res.json({
        message: `Accessing file: ${filePath}`,
        fullPath: req.path
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Middleware Basics

```javascript
// middleware-basics.js
const express = require('express');
const app = express();

// Built-in middleware for parsing JSON
app.use(express.json());

// Built-in middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next(); // Pass control to the next middleware
});

// Authentication middleware (example)
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Simple token check (in real app, verify JWT)
    if (authHeader !== 'Bearer valid-token') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Add user info to request object
    req.user = { id: 1, name: 'John Doe' };
    next();
};

// Middleware for specific routes
app.use('/api/protected', requireAuth);

// Request timing middleware
app.use((req, res, next) => {
    req.startTime = Date.now();
    
    // Override res.json to add timing
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - req.startTime;
        console.log(`Request completed in ${duration}ms`);
        return originalJson.call(this, data);
    };
    
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Public endpoint' });
});

app.get('/api/protected/profile', (req, res) => {
    res.json({
        message: 'Protected endpoint',
        user: req.user
    });
});

app.post('/api/data', (req, res) => {
    console.log('Request body:', req.body);
    res.json({
        message: 'Data received',
        received: req.body
    });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler (must be after all routes)
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Complete CRUD API Example

```javascript
// crud-api.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// In-memory data store (use database in production)
let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 },
    { id: 3, title: '1984', author: 'George Orwell', year: 1949 }
];

let nextId = 4;

// Validation middleware
const validateBook = (req, res, next) => {
    const { title, author, year } = req.body;
    const errors = [];
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }
    
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
        errors.push('Author is required and must be a non-empty string');
    }
    
    if (!year || !Number.isInteger(year) || year < 0 || year > new Date().getFullYear()) {
        errors.push('Year must be a valid integer between 0 and current year');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};

// Routes

// Home page
app.get('/', (req, res) => {
    res.send(`
        <h1>📚 Books API</h1>
        <p>Welcome to the Books API built with Express.js!</p>
        <h2>Available Endpoints:</h2>
        <ul>
            <li><strong>GET</strong> /api/books - Get all books</li>
            <li><strong>GET</strong> /api/books/:id - Get book by ID</li>
            <li><strong>POST</strong> /api/books - Create a new book</li>
            <li><strong>PUT</strong> /api/books/:id - Update book by ID</li>
            <li><strong>DELETE</strong> /api/books/:id - Delete book by ID</li>
        </ul>
        <h2>Example Usage:</h2>
        <pre>
# Get all books
curl http://localhost:3000/api/books

# Create a book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Brave New World","author":"Aldous Huxley","year":1932}'
        </pre>
    `);
});

// GET /api/books - Get all books
app.get('/api/books', (req, res) => {
    const { author, year, search } = req.query;
    let filteredBooks = books;
    
    // Filter by author
    if (author) {
        filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }
    
    // Filter by year
    if (year) {
        filteredBooks = filteredBooks.filter(book => book.year === parseInt(year));
    }
    
    // Search in title or author
    if (search) {
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({
        success: true,
        count: filteredBooks.length,
        data: filteredBooks
    });
});

// GET /api/books/:id - Get book by ID
app.get('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid book ID'
        });
    }
    
    const book = books.find(b => b.id === id);
    
    if (!book) {
        return res.status(404).json({
            success: false,
            error: 'Book not found'
        });
    }
    
    res.json({
        success: true,
        data: book
    });
});

// POST /api/books - Create new book
app.post('/api/books', validateBook, (req, res) => {
    const { title, author, year } = req.body;
    
    // Check if book already exists
    const existingBook = books.find(b => 
        b.title.toLowerCase() === title.toLowerCase() && 
        b.author.toLowerCase() === author.toLowerCase()
    );
    
    if (existingBook) {
        return res.status(409).json({
            success: false,
            error: 'Book with this title and author already exists'
        });
    }
    
    const newBook = {
        id: nextId++,
        title: title.trim(),
        author: author.trim(),
        year
    };
    
    books.push(newBook);
    
    res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: newBook
    });
});

// PUT /api/books/:id - Update book
app.put('/api/books/:id', validateBook, (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid book ID'
        });
    }
    
    const bookIndex = books.findIndex(b => b.id === id);
    
    if (bookIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Book not found'
        });
    }
    
    const { title, author, year } = req.body;
    
    // Update book
    books[bookIndex] = {
        id,
        title: title.trim(),
        author: author.trim(),
        year
    };
    
    res.json({
        success: true,
        message: 'Book updated successfully',
        data: books[bookIndex]
    });
});

// DELETE /api/books/:id - Delete book
app.delete('/api/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid book ID'
        });
    }
    
    const bookIndex = books.findIndex(b => b.id === id);
    
    if (bookIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Book not found'
        });
    }
    
    const deletedBook = books.splice(bookIndex, 1)[0];
    
    res.json({
        success: true,
        message: 'Book deleted successfully',
        data: deletedBook
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        booksCount: books.length
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Books API server running on http://localhost:${PORT}`);
    console.log(`📖 API documentation available at http://localhost:${PORT}`);
});
```

## Real-World Use Case

### Express Server with Environment Configuration

```javascript
// server.js
const express = require('express');
const path = require('path');

// Environment configuration
const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1'
};

const app = express();

// Middleware setup based on environment
if (config.nodeEnv === 'development') {
    // Development-specific middleware
    app.use((req, res, next) => {
        console.log(`[DEV] ${req.method} ${req.path}`);
        next();
    });
}

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// API routes
const apiRouter = express.Router();

apiRouter.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        environment: config.nodeEnv,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

apiRouter.get('/info', (req, res) => {
    res.json({
        app: 'Express.js API',
        version: '1.0.0',
        environment: config.nodeEnv,
        node: process.version,
        platform: process.platform,
        uptime: process.uptime()
    });
});

// Mount API routes
app.use(config.apiPrefix, apiRouter);

// Serve static files in production
if (config.nodeEnv === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Catch-all handler for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// Development route
if (config.nodeEnv === 'development') {
    app.get('/', (req, res) => {
        res.send(`
            <h1>Express.js Development Server</h1>
            <p>Environment: ${config.nodeEnv}</p>
            <p>API Base URL: <a href="${config.apiPrefix}">${config.apiPrefix}</a></p>
            <ul>
                <li><a href="${config.apiPrefix}/status">Status</a></li>
                <li><a href="${config.apiPrefix}/info">Info</a></li>
            </ul>
        `);
    });
}

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const errorResponse = {
        error: 'Internal server error'
    };
    
    // Include stack trace in development
    if (config.nodeEnv === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.originalUrl
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

const server = app.listen(config.port, () => {
    console.log(`🚀 Express server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API Base URL: ${config.apiPrefix}`);
});

module.exports = app;
```

## Best Practices

### 1. Project Structure
```
project/
├── app.js              # Main application file
├── routes/             # Route definitions
│   ├── index.js
│   ├── users.js
│   └── products.js
├── middleware/         # Custom middleware
│   ├── auth.js
│   └── validation.js
├── controllers/        # Route handlers
│   ├── userController.js
│   └── productController.js
├── models/            # Data models
├── config/            # Configuration files
├── public/            # Static files
└── views/             # Template files
```

### 2. Environment Variables
```javascript
// Use environment variables for configuration
const config = {
    port: process.env.PORT || 3000,
    dbUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/myapp',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    nodeEnv: process.env.NODE_ENV || 'development'
};
```

### 3. Error Handling
```javascript
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/users', asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json(users);
}));
```

### 4. Input Validation
```javascript
// Validation middleware
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    next();
};
```

### 5. Security Headers
```javascript
// Security middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    next();
});
```

## Summary

Express.js simplifies Node.js web development by providing:

- **Simple Setup**: Minimal boilerplate code to get started
- **Powerful Routing**: Easy route definition with parameters and query strings
- **Middleware System**: Modular request processing pipeline
- **Built-in Parsers**: JSON and URL-encoded body parsing
- **Static File Serving**: Easy static asset serving
- **Error Handling**: Centralized error handling mechanisms

Key advantages over raw Node.js:
- Less boilerplate code
- Better organization and structure
- Rich ecosystem of middleware
- Simplified request/response handling
- Built-in routing system

Express.js strikes the perfect balance between simplicity and functionality, making it the go-to choice for Node.js web applications. Next, we'll dive deeper into handling request and response objects, exploring all the methods and properties available for building robust web applications.