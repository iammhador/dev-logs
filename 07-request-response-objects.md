# Handling Request and Response Objects in Express.js

## Overview

The request (`req`) and response (`res`) objects are the heart of Express.js applications. They provide access to HTTP request data and methods to send responses back to clients. Understanding these objects thoroughly is crucial for building robust web applications and APIs.

## Key Concepts

### Request Object (req)

The request object represents the HTTP request and contains properties for:
- Request parameters, query strings, and body
- HTTP headers and cookies
- Request method and URL information
- User agent and IP address
- File uploads and form data

### Response Object (res)

The response object represents the HTTP response and provides methods to:
- Send different types of responses (JSON, HTML, files)
- Set HTTP status codes and headers
- Handle cookies and redirects
- Stream data and handle errors

### Request-Response Cycle

1. Client sends HTTP request
2. Express creates `req` and `res` objects
3. Middleware and route handlers process the request
4. Response is sent back to client
5. Connection is closed (unless keep-alive)

## Example Code

### Request Object Properties and Methods

```javascript
// request-examples.js
const express = require('express');
const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comprehensive request information endpoint
app.all('/request-info', (req, res) => {
    const requestInfo = {
        // Basic request information
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        
        // Headers
        headers: req.headers,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        authorization: req.get('Authorization'),
        
        // Network information
        ip: req.ip,
        ips: req.ips,
        hostname: req.hostname,
        
        // Parameters and query
        params: req.params,
        query: req.query,
        body: req.body,
        
        // Request properties
        fresh: req.fresh,
        stale: req.stale,
        xhr: req.xhr, // Is AJAX request
        
        // Cookies (if cookie-parser middleware is used)
        cookies: req.cookies || 'No cookie parser middleware',
        signedCookies: req.signedCookies || 'No cookie parser middleware'
    };
    
    res.json(requestInfo);
});

// Route parameters examples
app.get('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    
    res.json({
        message: `Getting user ${userId}`,
        params: req.params,
        paramType: typeof userId // Always string
    });
});

// Multiple parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    
    res.json({
        message: `Getting post ${postId} from user ${userId}`,
        userId: parseInt(userId), // Convert to number if needed
        postId: parseInt(postId),
        allParams: req.params
    });
});

// Query parameters
app.get('/search', (req, res) => {
    const {
        q,           // Search query
        page = 1,    // Default value
        limit = 10,  // Default value
        sort,        // Optional
        filter       // Optional
    } = req.query;
    
    // Convert string parameters to appropriate types
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Validate parameters
    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({ error: 'Page must be a positive integer' });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }
    
    res.json({
        searchQuery: q,
        pagination: {
            page: pageNum,
            limit: limitNum,
            offset: (pageNum - 1) * limitNum
        },
        sorting: sort,
        filters: filter,
        allQuery: req.query
    });
});

// Request body handling
app.post('/data', (req, res) => {
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is required' });
    }
    
    res.json({
        message: 'Data received successfully',
        receivedData: req.body,
        dataType: typeof req.body,
        contentLength: req.get('Content-Length')
    });
});

// Header inspection
app.get('/headers', (req, res) => {
    const importantHeaders = {
        userAgent: req.get('User-Agent'),
        accept: req.get('Accept'),
        acceptLanguage: req.get('Accept-Language'),
        acceptEncoding: req.get('Accept-Encoding'),
        connection: req.get('Connection'),
        host: req.get('Host'),
        referer: req.get('Referer'),
        origin: req.get('Origin')
    };
    
    res.json({
        importantHeaders,
        allHeaders: req.headers,
        headerCount: Object.keys(req.headers).length
    });
});

// Content negotiation
app.get('/content-negotiation', (req, res) => {
    const acceptsJson = req.accepts('json');
    const acceptsHtml = req.accepts('html');
    const acceptsXml = req.accepts('xml');
    
    res.json({
        clientAccepts: {
            json: !!acceptsJson,
            html: !!acceptsHtml,
            xml: !!acceptsXml
        },
        acceptHeader: req.get('Accept'),
        preferredType: req.accepts(['json', 'html', 'xml'])
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Response Object Methods

```javascript
// response-examples.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());

// Basic response methods
app.get('/response-types', (req, res) => {
    const type = req.query.type;
    
    switch (type) {
        case 'json':
            res.json({ message: 'JSON response', timestamp: new Date() });
            break;
            
        case 'text':
            res.send('Plain text response');
            break;
            
        case 'html':
            res.send('<h1>HTML Response</h1><p>This is HTML content</p>');
            break;
            
        case 'status':
            res.status(201).json({ message: 'Created successfully' });
            break;
            
        default:
            res.json({ 
                message: 'Specify type parameter',
                availableTypes: ['json', 'text', 'html', 'status']
            });
    }
});

// Status codes
app.get('/status/:code', (req, res) => {
    const statusCode = parseInt(req.params.code);
    
    if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
        return res.status(400).json({ error: 'Invalid status code' });
    }
    
    res.status(statusCode).json({
        statusCode,
        message: getStatusMessage(statusCode)
    });
});

function getStatusMessage(code) {
    const messages = {
        200: 'OK',
        201: 'Created',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        500: 'Internal Server Error'
    };
    return messages[code] || 'Unknown Status';
}

// Headers manipulation
app.get('/headers-demo', (req, res) => {
    // Set individual headers
    res.set('X-Custom-Header', 'Custom Value');
    res.set('X-API-Version', '1.0.0');
    
    // Set multiple headers at once
    res.set({
        'X-Response-Time': Date.now(),
        'X-Server': 'Express.js',
        'Cache-Control': 'no-cache'
    });
    
    // Get header value
    const customHeader = res.get('X-Custom-Header');
    
    res.json({
        message: 'Headers set successfully',
        customHeaderValue: customHeader,
        allHeaders: res.getHeaders()
    });
});

// Content-Type examples
app.get('/content-types/:type', (req, res) => {
    const type = req.params.type;
    
    switch (type) {
        case 'json':
            res.type('json').send(JSON.stringify({ message: 'JSON content' }));
            break;
            
        case 'xml':
            res.type('xml').send('<?xml version="1.0"?><message>XML content</message>');
            break;
            
        case 'plain':
            res.type('txt').send('Plain text content');
            break;
            
        case 'html':
            res.type('html').send('<h1>HTML Content</h1>');
            break;
            
        default:
            res.json({ error: 'Unknown content type' });
    }
});

// Redirects
app.get('/redirect-demo/:type', (req, res) => {
    const type = req.params.type;
    
    switch (type) {
        case 'permanent':
            res.redirect(301, '/redirected');
            break;
            
        case 'temporary':
            res.redirect(302, '/redirected');
            break;
            
        case 'back':
            res.redirect('back'); // Redirect to referer or '/'
            break;
            
        default:
            res.redirect('/redirected'); // Default 302
    }
});

app.get('/redirected', (req, res) => {
    res.json({ message: 'You have been redirected!' });
});

// File downloads
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    // Download with original filename
    res.download(filePath, (err) => {
        if (err) {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Download failed' });
            }
        }
    });
});

// File sending
app.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'files', filename);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Send file error:', err);
            if (!res.headersSent) {
                res.status(404).json({ error: 'File not found' });
            }
        }
    });
});

// Streaming responses
app.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
    });
    
    let counter = 0;
    const interval = setInterval(() => {
        counter++;
        res.write(`Chunk ${counter}: ${new Date().toISOString()}\n`);
        
        if (counter >= 10) {
            clearInterval(interval);
            res.end('Stream completed\n');
        }
    }, 1000);
    
    // Handle client disconnect
    req.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

// JSON responses with different structures
app.get('/api/response-formats/:format', (req, res) => {
    const format = req.params.format;
    const sampleData = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    switch (format) {
        case 'simple':
            res.json(sampleData);
            break;
            
        case 'wrapped':
            res.json({
                success: true,
                data: sampleData,
                count: sampleData.length
            });
            break;
            
        case 'paginated':
            res.json({
                success: true,
                data: sampleData,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: sampleData.length,
                    totalPages: 1
                }
            });
            break;
            
        case 'meta':
            res.json({
                data: sampleData,
                meta: {
                    count: sampleData.length,
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            });
            break;
            
        default:
            res.status(400).json({
                error: 'Invalid format',
                availableFormats: ['simple', 'wrapped', 'paginated', 'meta']
            });
    }
});

// Error responses
app.get('/error/:type', (req, res) => {
    const type = req.params.type;
    
    switch (type) {
        case 'validation':
            res.status(400).json({
                error: 'Validation Error',
                details: [
                    { field: 'email', message: 'Email is required' },
                    { field: 'password', message: 'Password must be at least 8 characters' }
                ]
            });
            break;
            
        case 'unauthorized':
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
            break;
            
        case 'forbidden':
            res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            });
            break;
            
        case 'notfound':
            res.status(404).json({
                error: 'Not Found',
                message: 'Resource not found'
            });
            break;
            
        case 'server':
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Something went wrong'
            });
            break;
            
        default:
            res.status(400).json({
                error: 'Invalid error type',
                availableTypes: ['validation', 'unauthorized', 'forbidden', 'notfound', 'server']
            });
    }
});

// Create sample directories and files
const downloadsDir = path.join(__dirname, 'downloads');
const filesDir = path.join(__dirname, 'files');

if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
    fs.writeFileSync(path.join(downloadsDir, 'sample.txt'), 'This is a sample download file.');
}

if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
    fs.writeFileSync(path.join(filesDir, 'sample.json'), JSON.stringify({ message: 'Sample JSON file' }, null, 2));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Advanced Request/Response Handling

```javascript
// advanced-req-res.js
const express = require('express');
const multer = require('multer'); // For file uploads
const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];
        
        // Validate required fields
        if (schema.required) {
            schema.required.forEach(field => {
                if (!req.body[field]) {
                    errors.push(`${field} is required`);
                }
            });
        }
        
        // Validate field types
        if (schema.types) {
            Object.keys(schema.types).forEach(field => {
                if (req.body[field] && typeof req.body[field] !== schema.types[field]) {
                    errors.push(`${field} must be of type ${schema.types[field]}`);
                }
            });
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }
        
        next();
    };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Response sent in ${duration}ms`);
        return originalJson.call(this, data);
    };
    
    next();
};

app.use(requestLogger);

// File upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }
    
    res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        }
    });
});

// Multiple file upload
app.post('/upload-multiple', upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'No files uploaded'
        });
    }
    
    const fileInfo = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
    }));
    
    res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        files: fileInfo
    });
});

// Request with validation
const userSchema = {
    required: ['name', 'email'],
    types: {
        name: 'string',
        email: 'string',
        age: 'number'
    }
};

app.post('/users', validateRequest(userSchema), (req, res) => {
    const { name, email, age } = req.body;
    
    // Additional validation
    if (!email.includes('@')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }
    
    if (age && (age < 0 || age > 150)) {
        return res.status(400).json({
            success: false,
            error: 'Age must be between 0 and 150'
        });
    }
    
    // Simulate user creation
    const newUser = {
        id: Date.now(),
        name,
        email,
        age: age || null,
        createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: newUser
    });
});

// Content negotiation
app.get('/api/data', (req, res) => {
    const data = {
        id: 1,
        name: 'Sample Data',
        timestamp: new Date().toISOString()
    };
    
    // Check what the client accepts
    if (req.accepts('json')) {
        res.json(data);
    } else if (req.accepts('xml')) {
        const xml = `<?xml version="1.0"?>
<data>
  <id>${data.id}</id>
  <name>${data.name}</name>
  <timestamp>${data.timestamp}</timestamp>
</data>`;
        res.type('xml').send(xml);
    } else if (req.accepts('html')) {
        const html = `
        <div>
            <h2>Data</h2>
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Timestamp:</strong> ${data.timestamp}</p>
        </div>`;
        res.type('html').send(html);
    } else {
        res.status(406).json({
            error: 'Not Acceptable',
            supportedTypes: ['application/json', 'application/xml', 'text/html']
        });
    }
});

// Response caching
app.get('/api/cached-data', (req, res) => {
    // Set cache headers
    res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': '"123456"',
        'Last-Modified': new Date().toUTCString()
    });
    
    // Check if client has cached version
    if (req.get('If-None-Match') === '"123456"') {
        return res.status(304).end(); // Not Modified
    }
    
    res.json({
        message: 'This response is cached',
        timestamp: new Date().toISOString(),
        data: 'Some expensive computation result'
    });
});

// Error handling for file uploads
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 5MB'
            });
        }
    }
    
    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    
    next(error);
});

// Create uploads directory
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

## Real-World Use Case

### API with Comprehensive Request/Response Handling

```javascript
// api-server-complete.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req, res, next) => {
    req.id = Math.random().toString(36).substr(2, 9);
    res.set('X-Request-ID', req.id);
    next();
});

// API response wrapper
const apiResponse = {
    success: (res, data, message = 'Success', statusCode = 200) => {
        res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            requestId: res.get('X-Request-ID')
        });
    },
    
    error: (res, message = 'Error', statusCode = 500, errors = null) => {
        res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
            requestId: res.get('X-Request-ID')
        });
    },
    
    paginated: (res, data, pagination, message = 'Success') => {
        res.json({
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString(),
            requestId: res.get('X-Request-ID')
        });
    }
};

// Sample data
let products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Book', price: 19.99, category: 'Education', inStock: true },
    { id: 3, name: 'Coffee Mug', price: 9.99, category: 'Kitchen', inStock: false }
];
let nextId = 4;

// Get products with filtering, sorting, and pagination
app.get('/api/products', (req, res) => {
    try {
        let { 
            page = 1, 
            limit = 10, 
            category, 
            minPrice, 
            maxPrice, 
            inStock, 
            sort = 'id',
            order = 'asc',
            search
        } = req.query;
        
        // Convert and validate parameters
        page = parseInt(page);
        limit = parseInt(limit);
        
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;
        
        let filteredProducts = [...products];
        
        // Apply filters
        if (category) {
            filteredProducts = filteredProducts.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (minPrice) {
            const min = parseFloat(minPrice);
            if (!isNaN(min)) {
                filteredProducts = filteredProducts.filter(p => p.price >= min);
            }
        }
        
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            if (!isNaN(max)) {
                filteredProducts = filteredProducts.filter(p => p.price <= max);
            }
        }
        
        if (inStock !== undefined) {
            const stockFilter = inStock === 'true';
            filteredProducts = filteredProducts.filter(p => p.inStock === stockFilter);
        }
        
        if (search) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply sorting
        if (sort && filteredProducts.length > 0 && filteredProducts[0].hasOwnProperty(sort)) {
            filteredProducts.sort((a, b) => {
                let aVal = a[sort];
                let bVal = b[sort];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (order === 'desc') {
                    return bVal > aVal ? 1 : -1;
                } else {
                    return aVal > bVal ? 1 : -1;
                }
            });
        }
        
        // Apply pagination
        const total = filteredProducts.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedProducts = filteredProducts.slice(offset, offset + limit);
        
        const pagination = {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
        
        apiResponse.paginated(res, paginatedProducts, pagination, 'Products retrieved successfully');
        
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        apiResponse.error(res, 'Failed to retrieve products', 500);
    }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return apiResponse.error(res, 'Invalid product ID', 400);
        }
        
        const product = products.find(p => p.id === id);
        
        if (!product) {
            return apiResponse.error(res, 'Product not found', 404);
        }
        
        apiResponse.success(res, product, 'Product retrieved successfully');
        
    } catch (error) {
        console.error('Error in GET /api/products/:id:', error);
        apiResponse.error(res, 'Failed to retrieve product', 500);
    }
});

// Create product
app.post('/api/products', (req, res) => {
    try {
        const { name, price, category, inStock = true } = req.body;
        
        // Validation
        const errors = [];
        
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        }
        
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            errors.push('Price is required and must be a positive number');
        }
        
        if (!category || typeof category !== 'string' || category.trim().length === 0) {
            errors.push('Category is required and must be a non-empty string');
        }
        
        if (typeof inStock !== 'boolean') {
            errors.push('inStock must be a boolean value');
        }
        
        if (errors.length > 0) {
            return apiResponse.error(res, 'Validation failed', 400, errors);
        }
        
        // Check for duplicate
        const existingProduct = products.find(p => 
            p.name.toLowerCase() === name.toLowerCase() && 
            p.category.toLowerCase() === category.toLowerCase()
        );
        
        if (existingProduct) {
            return apiResponse.error(res, 'Product with this name and category already exists', 409);
        }
        
        // Create product
        const newProduct = {
            id: nextId++,
            name: name.trim(),
            price: parseFloat(price),
            category: category.trim(),
            inStock
        };
        
        products.push(newProduct);
        
        apiResponse.success(res, newProduct, 'Product created successfully', 201);
        
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        apiResponse.error(res, 'Failed to create product', 500);
    }
});

// Update product
app.put('/api/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return apiResponse.error(res, 'Invalid product ID', 400);
        }
        
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            return apiResponse.error(res, 'Product not found', 404);
        }
        
        const { name, price, category, inStock } = req.body;
        const errors = [];
        
        // Validate only provided fields
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            errors.push('Name must be a non-empty string');
        }
        
        if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
            errors.push('Price must be a positive number');
        }
        
        if (category !== undefined && (typeof category !== 'string' || category.trim().length === 0)) {
            errors.push('Category must be a non-empty string');
        }
        
        if (inStock !== undefined && typeof inStock !== 'boolean') {
            errors.push('inStock must be a boolean value');
        }
        
        if (errors.length > 0) {
            return apiResponse.error(res, 'Validation failed', 400, errors);
        }
        
        // Update product
        const updatedProduct = {
            ...products[productIndex],
            ...(name !== undefined && { name: name.trim() }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(category !== undefined && { category: category.trim() }),
            ...(inStock !== undefined && { inStock })
        };
        
        products[productIndex] = updatedProduct;
        
        apiResponse.success(res, updatedProduct, 'Product updated successfully');
        
    } catch (error) {
        console.error('Error in PUT /api/products/:id:', error);
        apiResponse.error(res, 'Failed to update product', 500);
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            return apiResponse.error(res, 'Invalid product ID', 400);
        }
        
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            return apiResponse.error(res, 'Product not found', 404);
        }
        
        const deletedProduct = products.splice(productIndex, 1)[0];
        
        apiResponse.success(res, deletedProduct, 'Product deleted successfully');
        
    } catch (error) {
        console.error('Error in DELETE /api/products/:id:', error);
        apiResponse.error(res, 'Failed to delete product', 500);
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    apiResponse.error(res, 'Internal server error', 500);
});

// 404 handler
app.use('*', (req, res) => {
    apiResponse.error(res, 'Endpoint not found', 404);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
});
```

## Best Practices

### 1. Always Validate Input
```javascript
const validateInput = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }
    
    if (!password || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    next();
};
```

### 2. Use Consistent Response Format
```javascript
const responseFormat = {
    success: (data, message = 'Success') => ({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    }),
    
    error: (message, errors = null) => ({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString()
    })
};
```

### 3. Handle Async Errors
```javascript
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/users', asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json(users);
}));
```

### 4. Set Security Headers
```javascript
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    });
    next();
});
```

### 5. Log Requests and Responses
```javascript
const logger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    
    next();
};
```

## Summary

Mastering request and response objects in Express.js involves:

**Request Object (req)**:
- Access route parameters with `req.params`
- Handle query strings with `req.query`
- Parse request body with `req.body`
- Read headers with `req.get()` or `req.headers`
- Get client information with `req.ip`, `req.hostname`

**Response Object (res)**:
- Send JSON with `res.json()`
- Set status codes with `res.status()`
- Set headers with `res.set()`
- Handle redirects with `res.redirect()`
- Send files with `res.sendFile()` or `res.download()`

**Best Practices**:
- Always validate input data
- Use consistent response formats
- Handle errors gracefully
- Set appropriate HTTP status codes
- Implement proper logging
- Set security headers

Understanding these objects thoroughly enables you to build robust, secure, and user-friendly web applications and APIs. Next, we'll explore serving static files and building complete web applications with Express.js.