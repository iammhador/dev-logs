# Creating HTTP Servers with Node.js

## Overview

Building HTTP servers is one of the most common use cases for Node.js. The built-in `http` module provides everything you need to create web servers, handle requests, serve files, and build APIs. This chapter covers creating HTTP servers from scratch, handling different HTTP methods, routing, and serving various types of content.

## Key Concepts

### HTTP Protocol Basics

HTTP (HyperText Transfer Protocol) is a request-response protocol:
- **Client** sends a request to the server
- **Server** processes the request and sends back a response
- Each request contains: method, URL, headers, and optional body
- Each response contains: status code, headers, and optional body

### HTTP Methods

- **GET**: Retrieve data
- **POST**: Create new data
- **PUT**: Update existing data
- **DELETE**: Remove data
- **PATCH**: Partial update
- **HEAD**: Get headers only
- **OPTIONS**: Get allowed methods

### Status Codes

- **2xx**: Success (200 OK, 201 Created)
- **3xx**: Redirection (301 Moved, 304 Not Modified)
- **4xx**: Client Error (400 Bad Request, 404 Not Found)
- **5xx**: Server Error (500 Internal Server Error)

## Example Code

### Basic HTTP Server

```javascript
// basic-server.js
const http = require('http');

// Create server
const server = http.createServer((req, res) => {
    // Set response headers
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
    });
    
    // Send response
    res.end('Hello, World! This is my first Node.js server.');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error.message);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

### Handling Different HTTP Methods

```javascript
// method-handler.js
const http = require('http');
const url = require('url');

// In-memory data store
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

let nextId = 3;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    const query = parsedUrl.query;
    
    // Set common headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Route handling
    if (path === '/api/users') {
        handleUsersRoute(req, res, method, query);
    } else if (path.startsWith('/api/users/')) {
        const userId = parseInt(path.split('/')[3]);
        handleUserRoute(req, res, method, userId);
    } else if (path === '/') {
        handleHomeRoute(req, res);
    } else {
        handle404(req, res);
    }
});

function handleUsersRoute(req, res, method, query) {
    switch (method) {
        case 'GET':
            // Get all users with optional filtering
            let filteredUsers = users;
            
            if (query.name) {
                filteredUsers = users.filter(user => 
                    user.name.toLowerCase().includes(query.name.toLowerCase())
                );
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: filteredUsers,
                count: filteredUsers.length
            }, null, 2));
            break;
            
        case 'POST':
            // Create new user
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const userData = JSON.parse(body);
                    
                    // Validate required fields
                    if (!userData.name || !userData.email) {
                        res.writeHead(400);
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Name and email are required'
                        }));
                        return;
                    }
                    
                    // Check if email already exists
                    const existingUser = users.find(user => user.email === userData.email);
                    if (existingUser) {
                        res.writeHead(409);
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Email already exists'
                        }));
                        return;
                    }
                    
                    // Create new user
                    const newUser = {
                        id: nextId++,
                        name: userData.name,
                        email: userData.email
                    };
                    
                    users.push(newUser);
                    
                    res.writeHead(201);
                    res.end(JSON.stringify({
                        success: true,
                        data: newUser,
                        message: 'User created successfully'
                    }, null, 2));
                    
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid JSON data'
                    }));
                }
            });
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({
                success: false,
                error: 'Method not allowed'
            }));
    }
}

function handleUserRoute(req, res, method, userId) {
    const userIndex = users.findIndex(user => user.id === userId);
    
    switch (method) {
        case 'GET':
            if (userIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    error: 'User not found'
                }));
                return;
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: users[userIndex]
            }, null, 2));
            break;
            
        case 'PUT':
            if (userIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    error: 'User not found'
                }));
                return;
            }
            
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const userData = JSON.parse(body);
                    
                    // Update user
                    users[userIndex] = {
                        ...users[userIndex],
                        ...userData,
                        id: userId // Ensure ID doesn't change
                    };
                    
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        success: true,
                        data: users[userIndex],
                        message: 'User updated successfully'
                    }, null, 2));
                    
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid JSON data'
                    }));
                }
            });
            break;
            
        case 'DELETE':
            if (userIndex === -1) {
                res.writeHead(404);
                res.end(JSON.stringify({
                    success: false,
                    error: 'User not found'
                }));
                return;
            }
            
            const deletedUser = users.splice(userIndex, 1)[0];
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: deletedUser,
                message: 'User deleted successfully'
            }, null, 2));
            break;
            
        default:
            res.writeHead(405);
            res.end(JSON.stringify({
                success: false,
                error: 'Method not allowed'
            }));
    }
}

function handleHomeRoute(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Node.js API Server</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
                .method { font-weight: bold; color: #007acc; }
            </style>
        </head>
        <body>
            <h1>🚀 Node.js API Server</h1>
            <p>Welcome to the Node.js HTTP server! Here are the available endpoints:</p>
            
            <h2>📋 API Endpoints</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/users - Get all users
                <br><small>Query params: ?name=searchTerm</small>
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span> /api/users - Create a new user
                <br><small>Body: {"name": "John Doe", "email": "john@example.com"}</small>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/users/:id - Get user by ID
            </div>
            
            <div class="endpoint">
                <span class="method">PUT</span> /api/users/:id - Update user by ID
                <br><small>Body: {"name": "Updated Name", "email": "updated@example.com"}</small>
            </div>
            
            <div class="endpoint">
                <span class="method">DELETE</span> /api/users/:id - Delete user by ID
            </div>
            
            <h2>🧪 Test the API</h2>
            <p>You can test these endpoints using:</p>
            <ul>
                <li>Browser (for GET requests)</li>
                <li>Postman</li>
                <li>Thunder Client (VS Code extension)</li>
                <li>curl commands</li>
            </ul>
            
            <h3>Example curl commands:</h3>
            <pre>
# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","email":"alice@example.com"}'

# Get user by ID
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
            </pre>
        </body>
        </html>
    `);
}

function handle404(req, res) {
    res.writeHead(404);
    res.end(JSON.stringify({
        success: false,
        error: 'Endpoint not found',
        path: req.url,
        method: req.method
    }, null, 2));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 API documentation available at http://localhost:${PORT}`);
});
```

### File Server

```javascript
// file-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Security: prevent directory traversal
    pathname = path.normalize(pathname);
    if (pathname.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden: Directory traversal not allowed');
        return;
    }
    
    // Default to index.html for root path
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construct file path
    const filePath = path.join(__dirname, 'public', pathname);
    
    // Get file extension and MIME type
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            serve404(res);
            return;
        }
        
        // Get file stats
        fs.stat(filePath, (err, stats) => {
            if (err) {
                serve500(res, err);
                return;
            }
            
            // Don't serve directories
            if (stats.isDirectory()) {
                serve403(res, 'Directory listing not allowed');
                return;
            }
            
            // Set headers
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Last-Modified', stats.mtime.toUTCString());
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            
            // Check if client has cached version
            const ifModifiedSince = req.headers['if-modified-since'];
            if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
                res.writeHead(304); // Not Modified
                res.end();
                return;
            }
            
            // Stream file to response
            const readStream = fs.createReadStream(filePath);
            
            readStream.on('error', (err) => {
                serve500(res, err);
            });
            
            res.writeHead(200);
            readStream.pipe(res);
        });
    });
});

function serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Not Found</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                h1 { color: #e74c3c; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The requested resource could not be found on this server.</p>
            <a href="/">Go back to home</a>
        </body>
        </html>
    `);
}

function serve403(res, message) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>403 - Forbidden</title>
        </head>
        <body>
            <h1>403 - Forbidden</h1>
            <p>${message}</p>
        </body>
        </html>
    `);
}

function serve500(res, error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>500 - Internal Server Error</title>
        </head>
        <body>
            <h1>500 - Internal Server Error</h1>
            <p>Something went wrong on the server.</p>
        </body>
        </html>
    `);
}

// Create public directory and sample files
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    
    // Create sample index.html
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Node.js File Server</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to Node.js File Server</h1>
    <p>This is a static file server built with Node.js!</p>
    <script src="script.js"></script>
</body>
</html>
    `;
    
    const css = `
body {
    font-family: Arial, sans-serif;
    margin: 40px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}

p {
    text-align: center;
    font-size: 18px;
}
    `;
    
    const js = `
console.log('Hello from Node.js file server!');
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded successfully!');
});
    `;
    
    fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
    fs.writeFileSync(path.join(publicDir, 'styles.css'), css);
    fs.writeFileSync(path.join(publicDir, 'script.js'), js);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 File server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${publicDir}`);
});
```

## Real-World Use Case

### RESTful API Server with Logging

```javascript
// api-server.js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Simple logging middleware
class Logger {
    static log(req, res, startTime) {
        const duration = Date.now() - startTime;
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.headers['user-agent'] || 'Unknown'
        };
        
        console.log(`${logEntry.method} ${logEntry.url} ${logEntry.statusCode} ${logEntry.duration}`);
        
        // Write to log file
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFile('access.log', logLine, (err) => {
            if (err) console.error('Failed to write log:', err);
        });
    }
}

// Simple router
class Router {
    constructor() {
        this.routes = new Map();
    }
    
    addRoute(method, path, handler) {
        const key = `${method.toUpperCase()}:${path}`;
        this.routes.set(key, handler);
    }
    
    get(path, handler) {
        this.addRoute('GET', path, handler);
    }
    
    post(path, handler) {
        this.addRoute('POST', path, handler);
    }
    
    put(path, handler) {
        this.addRoute('PUT', path, handler);
    }
    
    delete(path, handler) {
        this.addRoute('DELETE', path, handler);
    }
    
    handle(req, res) {
        const parsedUrl = url.parse(req.url, true);
        const key = `${req.method}:${parsedUrl.pathname}`;
        
        const handler = this.routes.get(key);
        if (handler) {
            handler(req, res, parsedUrl.query);
        } else {
            // Try pattern matching for dynamic routes
            const dynamicHandler = this.findDynamicRoute(req.method, parsedUrl.pathname);
            if (dynamicHandler) {
                dynamicHandler.handler(req, res, dynamicHandler.params);
            } else {
                this.send404(res);
            }
        }
    }
    
    findDynamicRoute(method, pathname) {
        for (const [key, handler] of this.routes) {
            const [routeMethod, routePath] = key.split(':');
            
            if (routeMethod !== method) continue;
            
            const routeParts = routePath.split('/');
            const pathParts = pathname.split('/');
            
            if (routeParts.length !== pathParts.length) continue;
            
            const params = {};
            let matches = true;
            
            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    const paramName = routeParts[i].slice(1);
                    params[paramName] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return { handler, params };
            }
        }
        
        return null;
    }
    
    send404(res) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}

// Response helpers
class Response {
    static json(res, data, statusCode = 200) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data, null, 2));
    }
    
    static error(res, message, statusCode = 500) {
        Response.json(res, { error: message }, statusCode);
    }
}

// Request body parser
class RequestParser {
    static parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', () => {
                try {
                    const data = body ? JSON.parse(body) : {};
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
            
            req.on('error', reject);
        });
    }
}

// Data store (in production, use a real database)
let products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Book', price: 19.99, category: 'Education' },
    { id: 3, name: 'Coffee Mug', price: 9.99, category: 'Kitchen' }
];
let nextId = 4;

// Create router and define routes
const router = new Router();

// Health check
router.get('/health', (req, res) => {
    Response.json(res, {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get all products
router.get('/api/products', (req, res, query) => {
    let filteredProducts = products;
    
    // Filter by category
    if (query.category) {
        filteredProducts = products.filter(p => 
            p.category.toLowerCase() === query.category.toLowerCase()
        );
    }
    
    // Filter by price range
    if (query.minPrice) {
        const minPrice = parseFloat(query.minPrice);
        filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    
    if (query.maxPrice) {
        const maxPrice = parseFloat(query.maxPrice);
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }
    
    Response.json(res, {
        products: filteredProducts,
        count: filteredProducts.length
    });
});

// Get product by ID
router.get('/api/products/:id', (req, res, params) => {
    const id = parseInt(params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        Response.error(res, 'Product not found', 404);
        return;
    }
    
    Response.json(res, { product });
});

// Create product
router.post('/api/products', async (req, res) => {
    try {
        const data = await RequestParser.parseBody(req);
        
        // Validate required fields
        if (!data.name || !data.price) {
            Response.error(res, 'Name and price are required', 400);
            return;
        }
        
        const newProduct = {
            id: nextId++,
            name: data.name,
            price: parseFloat(data.price),
            category: data.category || 'Uncategorized'
        };
        
        products.push(newProduct);
        
        Response.json(res, {
            message: 'Product created successfully',
            product: newProduct
        }, 201);
        
    } catch (error) {
        Response.error(res, error.message, 400);
    }
});

// Update product
router.put('/api/products/:id', async (req, res, params) => {
    try {
        const id = parseInt(params.id);
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            Response.error(res, 'Product not found', 404);
            return;
        }
        
        const data = await RequestParser.parseBody(req);
        
        // Update product
        products[productIndex] = {
            ...products[productIndex],
            ...data,
            id // Ensure ID doesn't change
        };
        
        Response.json(res, {
            message: 'Product updated successfully',
            product: products[productIndex]
        });
        
    } catch (error) {
        Response.error(res, error.message, 400);
    }
});

// Delete product
router.delete('/api/products/:id', (req, res, params) => {
    const id = parseInt(params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        Response.error(res, 'Product not found', 404);
        return;
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    Response.json(res, {
        message: 'Product deleted successfully',
        product: deletedProduct
    });
});

// Create server
const server = http.createServer((req, res) => {
    const startTime = Date.now();
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle request
    router.handle(req, res);
    
    // Log request after response is sent
    res.on('finish', () => {
        Logger.log(req, res, startTime);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('  GET    /health');
    console.log('  GET    /api/products');
    console.log('  GET    /api/products/:id');
    console.log('  POST   /api/products');
    console.log('  PUT    /api/products/:id');
    console.log('  DELETE /api/products/:id');
});
```

## Best Practices

### 1. Always Handle Errors
```javascript
server.on('error', (error) => {
    console.error('Server error:', error);
});

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

### 2. Set Appropriate Headers
```javascript
// Security headers
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');

// CORS headers
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
```

### 3. Validate Input
```javascript
function validateProductData(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Name is required and must be a string');
    }
    
    if (!data.price || isNaN(parseFloat(data.price))) {
        errors.push('Price is required and must be a number');
    }
    
    return errors;
}
```

### 4. Use Streams for Large Data
```javascript
// For large responses, use streams
const readStream = fs.createReadStream('large-file.json');
res.setHeader('Content-Type', 'application/json');
readStream.pipe(res);
```

### 5. Implement Graceful Shutdown
```javascript
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
```

## Summary

Creating HTTP servers with Node.js involves:

- **Basic Server**: Using `http.createServer()` to handle requests and responses
- **Routing**: Parsing URLs and handling different endpoints
- **HTTP Methods**: Supporting GET, POST, PUT, DELETE operations
- **Request Parsing**: Handling request bodies and query parameters
- **Response Formatting**: Sending JSON, HTML, and file responses
- **Error Handling**: Proper error responses and server error handling
- **Security**: Setting appropriate headers and validating input

Key concepts:
- Always handle errors gracefully
- Set appropriate HTTP status codes
- Use streams for large data
- Implement proper CORS handling
- Log requests for debugging and monitoring

While building HTTP servers from scratch is educational, in production you'll typically use Express.js, which provides a much more convenient and feature-rich framework. Next, we'll explore Express.js and see how it simplifies web server development.