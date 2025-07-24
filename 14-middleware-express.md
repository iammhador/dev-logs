# Middleware in Express.js

## Overview

Middleware functions are the backbone of Express.js applications. They are functions that have access to the request object (`req`), response object (`res`), and the next middleware function in the application's request-response cycle. Middleware can execute code, modify request and response objects, end the request-response cycle, or call the next middleware in the stack. Understanding middleware is crucial for building scalable and maintainable Express applications.

## Key Concepts

### What is Middleware?

**Middleware Function**: A function that sits between the raw HTTP request and the final route handler, processing the request and response objects.

**Middleware Stack**: The sequence of middleware functions that execute in order during request processing.

**Next Function**: A function that passes control to the next middleware function. If not called, the request will be left hanging.

### Types of Middleware

1. **Application-level middleware**: Bound to the app object
2. **Router-level middleware**: Bound to router instances
3. **Error-handling middleware**: Special middleware for handling errors
4. **Built-in middleware**: Provided by Express (e.g., `express.static`)
5. **Third-party middleware**: External packages (e.g., `cors`, `helmet`)

### Middleware Execution Order

Middleware executes in the order it's defined:
1. Application-level middleware
2. Router-level middleware
3. Route handlers
4. Error-handling middleware

## Example Code

### Basic Middleware Concepts

```javascript
// middleware/logger.js - Custom Logging Middleware
const fs = require('fs').promises;
const path = require('path');

class Logger {
    constructor(options = {}) {
        this.logFile = options.logFile || path.join(__dirname, '../logs/access.log');
        this.format = options.format || 'combined';
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile !== false;
        this.ensureLogDirectory();
    }
    
    async ensureLogDirectory() {
        try {
            const logDir = path.dirname(this.logFile);
            await fs.mkdir(logDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create log directory:', error);
        }
    }
    
    formatLog(req, res, responseTime) {
        const timestamp = new Date().toISOString();
        const method = req.method;
        const url = req.originalUrl || req.url;
        const status = res.statusCode;
        const userAgent = req.get('User-Agent') || '-';
        const ip = req.ip || req.connection.remoteAddress;
        const contentLength = res.get('Content-Length') || '-';
        
        switch (this.format) {
            case 'simple':
                return `${timestamp} ${method} ${url} ${status} ${responseTime}ms`;
            case 'combined':
                return `${ip} - - [${timestamp}] "${method} ${url} HTTP/1.1" ${status} ${contentLength} "-" "${userAgent}" ${responseTime}ms`;
            case 'json':
                return JSON.stringify({
                    timestamp,
                    method,
                    url,
                    status,
                    responseTime,
                    ip,
                    userAgent,
                    contentLength
                });
            default:
                return `${timestamp} ${method} ${url} ${status} ${responseTime}ms`;
        }
    }
    
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Capture the original end function
            const originalEnd = res.end;
            
            // Override the end function to log when response is sent
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                const logEntry = this.formatLog(req, res, responseTime);
                
                // Log to console
                if (this.enableConsole) {
                    console.log(logEntry);
                }
                
                // Log to file
                if (this.enableFile) {
                    this.writeToFile(logEntry);
                }
                
                // Call the original end function
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }
    
    async writeToFile(logEntry) {
        try {
            await fs.appendFile(this.logFile, logEntry + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
}

module.exports = Logger;
```

```javascript
// middleware/auth.js - Authentication Middleware
const jwt = require('jsonwebtoken');

class AuthMiddleware {
    constructor(options = {}) {
        this.secret = options.secret || process.env.JWT_SECRET || 'default-secret';
        this.algorithms = options.algorithms || ['HS256'];
        this.expiresIn = options.expiresIn || '24h';
        this.issuer = options.issuer || 'task-api';
    }
    
    // Generate JWT token
    generateToken(payload) {
        return jwt.sign(
            { ...payload, iss: this.issuer },
            this.secret,
            { 
                expiresIn: this.expiresIn,
                algorithm: this.algorithms[0]
            }
        );
    }
    
    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret, {
                algorithms: this.algorithms,
                issuer: this.issuer
            });
        } catch (error) {
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
    
    // Extract token from request
    extractToken(req) {
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Check query parameter
        if (req.query.token) {
            return req.query.token;
        }
        
        // Check cookies
        if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        }
        
        return null;
    }
    
    // Authentication middleware
    authenticate() {
        return (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (!token) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Access token is required'
                    });
                }
                
                const decoded = this.verifyToken(token);
                req.user = decoded;
                next();
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: error.message
                });
            }
        };
    }
    
    // Authorization middleware (role-based)
    authorize(roles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }
            
            next();
        };
    }
    
    // Optional authentication (doesn't fail if no token)
    optionalAuth() {
        return (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (token) {
                    const decoded = this.verifyToken(token);
                    req.user = decoded;
                }
            } catch (error) {
                // Ignore token errors for optional auth
                console.warn('Optional auth token error:', error.message);
            }
            
            next();
        };
    }
}

module.exports = AuthMiddleware;
```

### Validation Middleware

```javascript
// middleware/validation.js - Request Validation Middleware
const { validationResult } = require('express-validator');

class ValidationMiddleware {
    // Handle validation errors
    static handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value,
                location: error.location
            }));
            
            return res.status(422).json({
                success: false,
                error: 'Validation Error',
                message: 'Invalid input data',
                details: formattedErrors
            });
        }
        
        next();
    }
    
    // Sanitize request data
    static sanitizeRequest(req, res, next) {
        // Remove undefined and null values from body
        if (req.body && typeof req.body === 'object') {
            Object.keys(req.body).forEach(key => {
                if (req.body[key] === undefined || req.body[key] === null) {
                    delete req.body[key];
                }
                
                // Trim string values
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim();
                }
            });
        }
        
        next();
    }
    
    // Content type validation
    static validateContentType(allowedTypes = ['application/json']) {
        return (req, res, next) => {
            if (req.method === 'GET' || req.method === 'DELETE') {
                return next();
            }
            
            const contentType = req.get('Content-Type');
            
            if (!contentType) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Content-Type header is required'
                });
            }
            
            const isValidType = allowedTypes.some(type => 
                contentType.toLowerCase().includes(type.toLowerCase())
            );
            
            if (!isValidType) {
                return res.status(415).json({
                    success: false,
                    error: 'Unsupported Media Type',
                    message: `Content-Type must be one of: ${allowedTypes.join(', ')}`
                });
            }
            
            next();
        };
    }
    
    // Request size validation
    static validateRequestSize(maxSize = '10mb') {
        return (req, res, next) => {
            const contentLength = req.get('Content-Length');
            
            if (contentLength) {
                const sizeInBytes = parseInt(contentLength);
                const maxSizeInBytes = this.parseSize(maxSize);
                
                if (sizeInBytes > maxSizeInBytes) {
                    return res.status(413).json({
                        success: false,
                        error: 'Payload Too Large',
                        message: `Request size exceeds maximum allowed size of ${maxSize}`
                    });
                }
            }
            
            next();
        };
    }
    
    static parseSize(size) {
        const units = {
            'b': 1,
            'kb': 1024,
            'mb': 1024 * 1024,
            'gb': 1024 * 1024 * 1024
        };
        
        const match = size.toLowerCase().match(/^(\d+)([a-z]+)$/);
        if (!match) return parseInt(size);
        
        const [, number, unit] = match;
        return parseInt(number) * (units[unit] || 1);
    }
}

module.exports = ValidationMiddleware;
```

### Error Handling Middleware

```javascript
// middleware/errorHandler.js - Comprehensive Error Handling
class ErrorHandler {
    constructor(options = {}) {
        this.includeStack = options.includeStack || process.env.NODE_ENV !== 'production';
        this.logErrors = options.logErrors !== false;
        this.logger = options.logger || console;
    }
    
    // Main error handling middleware
    handle() {
        return (err, req, res, next) => {
            // Log error
            if (this.logErrors) {
                this.logError(err, req);
            }
            
            // Handle different error types
            if (err.name === 'ValidationError') {
                return this.handleValidationError(err, res);
            }
            
            if (err.name === 'CastError') {
                return this.handleCastError(err, res);
            }
            
            if (err.code === 11000) {
                return this.handleDuplicateError(err, res);
            }
            
            if (err.name === 'JsonWebTokenError') {
                return this.handleJWTError(err, res);
            }
            
            if (err.name === 'TokenExpiredError') {
                return this.handleTokenExpiredError(err, res);
            }
            
            if (err.type === 'entity.parse.failed') {
                return this.handleJSONParseError(err, res);
            }
            
            if (err.type === 'entity.too.large') {
                return this.handlePayloadTooLargeError(err, res);
            }
            
            // Handle operational errors
            if (err.isOperational) {
                return this.handleOperationalError(err, res);
            }
            
            // Handle programming errors
            this.handleProgrammingError(err, res);
        };
    }
    
    logError(err, req) {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            error: {
                name: err.name,
                message: err.message,
                stack: err.stack
            },
            user: req.user ? { id: req.user.id, role: req.user.role } : null
        };
        
        this.logger.error('Application Error:', JSON.stringify(errorInfo, null, 2));
    }
    
    handleValidationError(err, res) {
        const errors = Object.values(err.errors).map(error => ({
            field: error.path,
            message: error.message,
            value: error.value
        }));
        
        return res.status(422).json({
            success: false,
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors
        });
    }
    
    handleCastError(err, res) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: `Invalid ${err.path}: ${err.value}`
        });
    }
    
    handleDuplicateError(err, res) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        
        return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `${field} '${value}' already exists`
        });
    }
    
    handleJWTError(err, res) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid authentication token'
        });
    }
    
    handleTokenExpiredError(err, res) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Authentication token has expired'
        });
    }
    
    handleJSONParseError(err, res) {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Invalid JSON in request body'
        });
    }
    
    handlePayloadTooLargeError(err, res) {
        return res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: 'Request body exceeds size limit'
        });
    }
    
    handleOperationalError(err, res) {
        return res.status(err.statusCode || 500).json({
            success: false,
            error: err.name || 'Operational Error',
            message: err.message,
            ...(this.includeStack && { stack: err.stack })
        });
    }
    
    handleProgrammingError(err, res) {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: this.includeStack ? err.message : 'Something went wrong',
            ...(this.includeStack && { stack: err.stack })
        });
    }
    
    // 404 handler
    notFound() {
        return (req, res, next) => {
            const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
            error.statusCode = 404;
            error.isOperational = true;
            next(error);
        };
    }
}

module.exports = ErrorHandler;
```

### Security Middleware

```javascript
// middleware/security.js - Security Middleware Collection
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');

class SecurityMiddleware {
    // Rate limiting
    static createRateLimit(options = {}) {
        return rateLimit({
            windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
            max: options.max || 100, // limit each IP to 100 requests per windowMs
            message: {
                success: false,
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil(options.windowMs / 1000) || 900
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                res.status(429).json({
                    success: false,
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil(options.windowMs / 1000) || 900
                });
            },
            skip: options.skip || (() => false)
        });
    }
    
    // Speed limiting (slow down responses)
    static createSpeedLimit(options = {}) {
        return slowDown({
            windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
            delayAfter: options.delayAfter || 50, // allow 50 requests per windowMs without delay
            delayMs: options.delayMs || 500, // add 500ms delay per request after delayAfter
            maxDelayMs: options.maxDelayMs || 20000, // max delay of 20 seconds
            skipFailedRequests: true,
            skipSuccessfulRequests: false
        });
    }
    
    // CORS configuration
    static configureCORS(options = {}) {
        return (req, res, next) => {
            const allowedOrigins = options.origins || [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://yourdomain.com'
            ];
            
            const origin = req.headers.origin;
            
            if (allowedOrigins.includes(origin) || !origin) {
                res.setHeader('Access-Control-Allow-Origin', origin || '*');
            }
            
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
            
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }
            
            next();
        };
    }
    
    // Security headers
    static securityHeaders() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false,
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        });
    }
    
    // IP whitelist/blacklist
    static ipFilter(options = {}) {
        const whitelist = options.whitelist || [];
        const blacklist = options.blacklist || [];
        
        return (req, res, next) => {
            const clientIP = req.ip || req.connection.remoteAddress;
            
            // Check blacklist first
            if (blacklist.length > 0 && blacklist.includes(clientIP)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Access denied from this IP address'
                });
            }
            
            // Check whitelist if defined
            if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Access denied from this IP address'
                });
            }
            
            next();
        };
    }
    
    // Request sanitization
    static sanitizeRequest() {
        return (req, res, next) => {
            // Remove potentially dangerous characters
            const sanitize = (obj) => {
                if (typeof obj === 'string') {
                    return obj.replace(/<script[^>]*>.*?<\/script>/gi, '')
                             .replace(/<[^>]*>/g, '')
                             .replace(/javascript:/gi, '')
                             .replace(/on\w+=/gi, '');
                }
                
                if (typeof obj === 'object' && obj !== null) {
                    for (const key in obj) {
                        obj[key] = sanitize(obj[key]);
                    }
                }
                
                return obj;
            };
            
            if (req.body) {
                req.body = sanitize(req.body);
            }
            
            if (req.query) {
                req.query = sanitize(req.query);
            }
            
            if (req.params) {
                req.params = sanitize(req.params);
            }
            
            next();
        };
    }
}

module.exports = SecurityMiddleware;
```

### Complete Middleware Application

```javascript
// app.js - Application with Comprehensive Middleware
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Custom middleware
const Logger = require('./middleware/logger');
const AuthMiddleware = require('./middleware/auth');
const ValidationMiddleware = require('./middleware/validation');
const ErrorHandler = require('./middleware/errorHandler');
const SecurityMiddleware = require('./middleware/security');

const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Initialize middleware instances
const logger = new Logger({
    format: 'combined',
    enableConsole: true,
    enableFile: true
});

const auth = new AuthMiddleware({
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
});

const errorHandler = new ErrorHandler({
    includeStack: process.env.NODE_ENV !== 'production',
    logErrors: true
});

// Security middleware (applied first)
app.use(SecurityMiddleware.securityHeaders());
app.use(SecurityMiddleware.configureCORS({
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
}));

// Rate limiting
app.use('/api/', SecurityMiddleware.createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
}));

// Speed limiting for auth endpoints
app.use('/api/auth/', SecurityMiddleware.createSpeedLimit({
    windowMs: 15 * 60 * 1000,
    delayAfter: 5,
    delayMs: 1000
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request sanitization
app.use(SecurityMiddleware.sanitizeRequest());

// Content type validation for POST/PUT/PATCH
app.use(ValidationMiddleware.validateContentType(['application/json']));

// Request size validation
app.use(ValidationMiddleware.validateRequestSize('10mb'));

// Request sanitization
app.use(ValidationMiddleware.sanitizeRequest);

// Logging
app.use(logger.middleware());

// Custom request context middleware
app.use((req, res, next) => {
    req.requestId = require('crypto').randomUUID();
    req.startTime = Date.now();
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', req.requestId);
    
    next();
});

// API versioning
const v1Router = express.Router();

// Authentication routes (no auth required)
v1Router.post('/auth/login', (req, res) => {
    // Mock login logic
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'password') {
        const token = auth.generateToken({
            id: 1,
            username: 'admin',
            role: 'admin'
        });
        
        res.json({
            success: true,
            data: {
                token,
                user: { id: 1, username: 'admin', role: 'admin' }
            },
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid credentials'
        });
    }
});

// Protected routes
const protectedRouter = express.Router();

// Apply authentication to all protected routes
protectedRouter.use(auth.authenticate());

// Import and mount route modules
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

protectedRouter.use('/tasks', taskRoutes);
protectedRouter.use('/users', auth.authorize(['admin']), userRoutes);

// Mount routers
v1Router.use('/', protectedRouter);

// API info endpoint
v1Router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API v1',
        version: '1.0.0',
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        user: req.user || null
    });
});

// Mount API version
app.use('/api/v1', v1Router);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API Server',
        version: '1.0.0',
        requestId: req.requestId,
        endpoints: {
            api: '/api/v1',
            auth: '/api/v1/auth/login',
            tasks: '/api/v1/tasks',
            users: '/api/v1/users'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        requestId: req.requestId
    };
    
    res.json({
        success: true,
        data: healthData
    });
});

// 404 handler
app.use(errorHandler.notFound());

// Global error handler (must be last)
app.use(errorHandler.handle());

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api/v1`);
    console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
```

## Real-World Use Case

### E-commerce API with Advanced Middleware

```javascript
// middleware/analytics.js - Analytics and Monitoring Middleware
class AnalyticsMiddleware {
    constructor() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTimeSum: 0,
            endpoints: {},
            statusCodes: {},
            userAgents: {},
            ips: {}
        };
        
        // Reset metrics every hour
        setInterval(() => {
            this.resetMetrics();
        }, 60 * 60 * 1000);
    }
    
    middleware() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Track request
            this.metrics.requests++;
            
            // Track endpoint
            const endpoint = `${req.method} ${req.route?.path || req.path}`;
            this.metrics.endpoints[endpoint] = (this.metrics.endpoints[endpoint] || 0) + 1;
            
            // Track IP
            const ip = req.ip;
            this.metrics.ips[ip] = (this.metrics.ips[ip] || 0) + 1;
            
            // Track User Agent
            const userAgent = req.get('User-Agent') || 'Unknown';
            this.metrics.userAgents[userAgent] = (this.metrics.userAgents[userAgent] || 0) + 1;
            
            // Override res.end to capture response metrics
            const originalEnd = res.end;
            res.end = (...args) => {
                const responseTime = Date.now() - startTime;
                
                // Track response time
                this.metrics.responseTimeSum += responseTime;
                
                // Track status codes
                const statusCode = res.statusCode;
                this.metrics.statusCodes[statusCode] = (this.metrics.statusCodes[statusCode] || 0) + 1;
                
                // Track errors
                if (statusCode >= 400) {
                    this.metrics.errors++;
                }
                
                // Add performance headers
                res.setHeader('X-Response-Time', `${responseTime}ms`);
                
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }
    
    getMetrics() {
        const avgResponseTime = this.metrics.requests > 0 
            ? Math.round(this.metrics.responseTimeSum / this.metrics.requests)
            : 0;
            
        return {
            ...this.metrics,
            averageResponseTime: avgResponseTime,
            errorRate: this.metrics.requests > 0 
                ? Math.round((this.metrics.errors / this.metrics.requests) * 100)
                : 0,
            timestamp: new Date().toISOString()
        };
    }
    
    resetMetrics() {
        this.metrics = {
            requests: 0,
            errors: 0,
            responseTimeSum: 0,
            endpoints: {},
            statusCodes: {},
            userAgents: {},
            ips: {}
        };
    }
}

module.exports = AnalyticsMiddleware;
```

```javascript
// middleware/cache.js - Response Caching Middleware
const NodeCache = require('node-cache');

class CacheMiddleware {
    constructor(options = {}) {
        this.cache = new NodeCache({
            stdTTL: options.ttl || 300, // 5 minutes default
            checkperiod: options.checkperiod || 60, // check for expired keys every 60 seconds
            useClones: false
        });
        
        this.defaultTTL = options.ttl || 300;
    }
    
    // Cache GET requests
    cacheGet(ttl = this.defaultTTL) {
        return (req, res, next) => {
            // Only cache GET requests
            if (req.method !== 'GET') {
                return next();
            }
            
            // Create cache key from URL and query parameters
            const cacheKey = this.generateCacheKey(req);
            
            // Check if response is cached
            const cachedResponse = this.cache.get(cacheKey);
            
            if (cachedResponse) {
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Key', cacheKey);
                return res.json(cachedResponse);
            }
            
            // Override res.json to cache the response
            const originalJson = res.json;
            res.json = (data) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    this.cache.set(cacheKey, data, ttl);
                    res.setHeader('X-Cache', 'MISS');
                    res.setHeader('X-Cache-TTL', ttl.toString());
                } else {
                    res.setHeader('X-Cache', 'SKIP');
                }
                
                res.setHeader('X-Cache-Key', cacheKey);
                originalJson.call(res, data);
            };
            
            next();
        };
    }
    
    // Invalidate cache for specific patterns
    invalidate(pattern) {
        const keys = this.cache.keys();
        const keysToDelete = keys.filter(key => key.includes(pattern));
        
        keysToDelete.forEach(key => {
            this.cache.del(key);
        });
        
        return keysToDelete.length;
    }
    
    // Clear all cache
    clear() {
        this.cache.flushAll();
    }
    
    // Get cache statistics
    getStats() {
        return {
            keys: this.cache.keys().length,
            hits: this.cache.getStats().hits,
            misses: this.cache.getStats().misses,
            ksize: this.cache.getStats().ksize,
            vsize: this.cache.getStats().vsize
        };
    }
    
    generateCacheKey(req) {
        const url = req.originalUrl || req.url;
        const user = req.user ? req.user.id : 'anonymous';
        return `${user}:${url}`;
    }
    
    // Middleware to add cache control headers
    cacheControl(maxAge = 300) {
        return (req, res, next) => {
            if (req.method === 'GET') {
                res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
                res.setHeader('ETag', this.generateETag(req));
            } else {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
            
            next();
        };
    }
    
    generateETag(req) {
        const crypto = require('crypto');
        const content = req.originalUrl + (req.user ? req.user.id : '');
        return crypto.createHash('md5').update(content).digest('hex');
    }
}

module.exports = CacheMiddleware;
```

## Best Practices

### 1. Middleware Order Matters

```javascript
// Correct order:
app.use(helmet()); // Security first
app.use(cors()); // CORS before other middleware
app.use(rateLimit); // Rate limiting early
app.use(express.json()); // Body parsing
app.use(authentication); // Auth before routes
app.use('/api', routes); // Routes
app.use(errorHandler); // Error handling last
```

### 2. Use Async Middleware Properly

```javascript
// Async middleware wrapper
const asyncMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.use('/api/users', asyncMiddleware(async (req, res, next) => {
    req.user = await getUserFromDatabase(req.headers.authorization);
    next();
}));
```

### 3. Create Reusable Middleware

```javascript
// Factory function for creating middleware
const createAuthMiddleware = (options = {}) => {
    return (req, res, next) => {
        // Middleware logic with options
        next();
    };
};

// Usage
app.use('/admin', createAuthMiddleware({ role: 'admin' }));
app.use('/api', createAuthMiddleware({ role: 'user' }));
```

### 4. Handle Errors Properly

```javascript
// Always call next() with error to trigger error handling
app.use((req, res, next) => {
    try {
        // Middleware logic
        next();
    } catch (error) {
        next(error); // Pass error to error handler
    }
});
```

### 5. Use Conditional Middleware

```javascript
// Apply middleware conditionally
const conditionalMiddleware = (condition, middleware) => {
    return (req, res, next) => {
        if (condition(req)) {
            return middleware(req, res, next);
        }
        next();
    };
};

// Usage
app.use(conditionalMiddleware(
    req => req.path.startsWith('/api'),
    rateLimit
));
```

## Summary

Middleware is the foundation of Express.js applications, providing a powerful way to process requests and responses:

**Key Concepts**:
- **Middleware Stack**: Functions execute in order
- **Next Function**: Controls flow to next middleware
- **Error Handling**: Special middleware for error processing
- **Types**: Application, router, built-in, third-party, and error-handling

**Common Middleware Types**:
- **Security**: Authentication, authorization, rate limiting
- **Logging**: Request/response logging and analytics
- **Validation**: Input validation and sanitization
- **Caching**: Response caching and cache control
- **Error Handling**: Comprehensive error processing

**Best Practices**:
- Order middleware correctly
- Handle async operations properly
- Create reusable middleware factories
- Always handle errors
- Use conditional middleware when needed
- Keep middleware focused and single-purpose

**Benefits**:
- **Modularity**: Separate concerns into focused functions
- **Reusability**: Share middleware across routes and applications
- **Flexibility**: Apply middleware conditionally
- **Maintainability**: Clear separation of cross-cutting concerns
- **Testability**: Easy to test individual middleware functions

Mastering middleware is essential for building robust, secure, and maintainable Express.js applications. Next, we'll explore database integration with MongoDB and Mongoose, building upon the middleware foundation to create data-driven applications.