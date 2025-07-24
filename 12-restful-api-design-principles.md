# RESTful API Design Principles

## Overview

REST (Representational State Transfer) is an architectural style for designing networked applications, particularly web services. RESTful APIs have become the standard for building web services due to their simplicity, scalability, and stateless nature. Understanding REST principles is crucial for creating APIs that are intuitive, maintainable, and follow industry best practices.

## Key Concepts

### REST Fundamentals

**REST (Representational State Transfer)**: An architectural style that defines a set of constraints for creating web services.

**Key Principles**:
1. **Stateless**: Each request contains all information needed to process it
2. **Client-Server**: Separation of concerns between client and server
3. **Cacheable**: Responses should be cacheable when appropriate
4. **Uniform Interface**: Consistent interface for all resources
5. **Layered System**: Architecture can be composed of hierarchical layers
6. **Code on Demand** (optional): Server can send executable code to client

### HTTP Methods and Their Usage

- **GET**: Retrieve data (safe and idempotent)
- **POST**: Create new resources
- **PUT**: Update/replace entire resource (idempotent)
- **PATCH**: Partial update of resource
- **DELETE**: Remove resource (idempotent)
- **HEAD**: Get headers only (like GET but no body)
- **OPTIONS**: Get allowed methods for resource

### HTTP Status Codes

**Success (2xx)**:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no response body

**Client Error (4xx)**:
- `400 Bad Request`: Invalid request syntax
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Request conflicts with current state
- `422 Unprocessable Entity`: Validation errors

**Server Error (5xx)**:
- `500 Internal Server Error`: Generic server error
- `502 Bad Gateway`: Invalid response from upstream server
- `503 Service Unavailable`: Server temporarily unavailable

### Resource Naming Conventions

- Use **nouns**, not verbs: `/users` not `/getUsers`
- Use **plural nouns**: `/users` not `/user`
- Use **hierarchical structure**: `/users/123/posts`
- Use **lowercase**: `/users` not `/Users`
- Use **hyphens** for multi-word resources: `/user-profiles`

## Example Code

### Basic RESTful API Structure

```javascript
// models/User.js - User Model
class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.role = data.role || 'user';
        this.active = data.active !== undefined ? data.active : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Validation method
    validate() {
        const errors = [];
        
        if (!this.username || this.username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('Valid email is required');
        }
        
        if (!this.firstName || this.firstName.length < 1) {
            errors.push('First name is required');
        }
        
        if (!this.lastName || this.lastName.length < 1) {
            errors.push('Last name is required');
        }
        
        return errors;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Get public representation (exclude sensitive data)
    toPublic() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: `${this.firstName} ${this.lastName}`,
            role: this.role,
            active: this.active,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = User;
```

```javascript
// services/UserService.js - Business Logic Layer
const User = require('../models/User');

class UserService {
    constructor() {
        // In-memory storage (use database in production)
        this.users = [
            new User({
                id: 1,
                username: 'johndoe',
                email: 'john@example.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'admin'
            }),
            new User({
                id: 2,
                username: 'janedoe',
                email: 'jane@example.com',
                firstName: 'Jane',
                lastName: 'Doe',
                role: 'user'
            })
        ];
        this.nextId = 3;
    }
    
    // Get all users with filtering and pagination
    async getAllUsers(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            role,
            active,
            search
        } = options;
        
        let filteredUsers = [...this.users];
        
        // Apply filters
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        
        if (active !== undefined) {
            filteredUsers = filteredUsers.filter(user => user.active === active);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => 
                user.username.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply sorting
        filteredUsers.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
        
        // Apply pagination
        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        
        return {
            users: paginatedUsers.map(user => user.toPublic()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }
    
    // Get user by ID
    async getUserById(id) {
        const user = this.users.find(u => u.id === parseInt(id));
        return user ? user.toPublic() : null;
    }
    
    // Create new user
    async createUser(userData) {
        // Check if username or email already exists
        const existingUser = this.users.find(u => 
            u.username === userData.username || u.email === userData.email
        );
        
        if (existingUser) {
            throw new Error('Username or email already exists');
        }
        
        const user = new User({
            ...userData,
            id: this.nextId++
        });
        
        const validationErrors = user.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        this.users.push(user);
        return user.toPublic();
    }
    
    // Update user
    async updateUser(id, updateData) {
        const userIndex = this.users.findIndex(u => u.id === parseInt(id));
        
        if (userIndex === -1) {
            return null;
        }
        
        // Check for conflicts with other users
        if (updateData.username || updateData.email) {
            const conflictUser = this.users.find(u => 
                u.id !== parseInt(id) && 
                (u.username === updateData.username || u.email === updateData.email)
            );
            
            if (conflictUser) {
                throw new Error('Username or email already exists');
            }
        }
        
        // Update user data
        const updatedUser = new User({
            ...this.users[userIndex],
            ...updateData,
            id: parseInt(id),
            updatedAt: new Date()
        });
        
        const validationErrors = updatedUser.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        this.users[userIndex] = updatedUser;
        return updatedUser.toPublic();
    }
    
    // Delete user
    async deleteUser(id) {
        const userIndex = this.users.findIndex(u => u.id === parseInt(id));
        
        if (userIndex === -1) {
            return null;
        }
        
        const deletedUser = this.users.splice(userIndex, 1)[0];
        return deletedUser.toPublic();
    }
    
    // Soft delete (deactivate) user
    async deactivateUser(id) {
        const userIndex = this.users.findIndex(u => u.id === parseInt(id));
        
        if (userIndex === -1) {
            return null;
        }
        
        this.users[userIndex].active = false;
        this.users[userIndex].updatedAt = new Date();
        
        return this.users[userIndex].toPublic();
    }
}

module.exports = UserService;
```

```javascript
// controllers/UserController.js - Request/Response Handling
const UserService = require('../services/UserService');

class UserController {
    constructor() {
        this.userService = new UserService();
    }
    
    // GET /api/users
    async getUsers(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
                role: req.query.role,
                active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
                search: req.query.search
            };
            
            const result = await this.userService.getAllUsers(options);
            
            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
                message: 'Users retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // GET /api/users/:id
    async getUserById(req, res) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: `User with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // POST /api/users
    async createUser(req, res) {
        try {
            const user = await this.userService.createUser(req.body);
            
            res.status(201).json({
                success: true,
                data: user,
                message: 'User created successfully'
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Conflict',
                    message: error.message
                });
            }
            
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // PUT /api/users/:id
    async updateUser(req, res) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: `User with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Conflict',
                    message: error.message
                });
            }
            
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // PATCH /api/users/:id
    async patchUser(req, res) {
        try {
            const user = await this.userService.updateUser(req.params.id, req.body);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: `User with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: 'Conflict',
                    message: error.message
                });
            }
            
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // DELETE /api/users/:id
    async deleteUser(req, res) {
        try {
            const user = await this.userService.deleteUser(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: `User with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
    
    // PATCH /api/users/:id/deactivate
    async deactivateUser(req, res) {
        try {
            const user = await this.userService.deactivateUser(req.params.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    message: `User with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User deactivated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: error.message
            });
        }
    }
}

module.exports = UserController;
```

### RESTful Routes Implementation

```javascript
// routes/users.js - User Routes
const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

const userController = new UserController();

// Middleware for request logging
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Validation middleware
const validateUserInput = (req, res, next) => {
    const { method } = req;
    const { body } = req;
    
    if (method === 'POST') {
        const required = ['username', 'email', 'firstName', 'lastName'];
        const missing = required.filter(field => !body[field]);
        
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: `Missing required fields: ${missing.join(', ')}`
            });
        }
    }
    
    next();
};

// Routes following REST conventions

// GET /api/users - Get all users
router.get('/', userController.getUsers.bind(userController));

// GET /api/users/:id - Get specific user
router.get('/:id', userController.getUserById.bind(userController));

// POST /api/users - Create new user
router.post('/', validateUserInput, userController.createUser.bind(userController));

// PUT /api/users/:id - Update entire user
router.put('/:id', validateUserInput, userController.updateUser.bind(userController));

// PATCH /api/users/:id - Partial update
router.patch('/:id', userController.patchUser.bind(userController));

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser.bind(userController));

// PATCH /api/users/:id/deactivate - Deactivate user (custom action)
router.patch('/:id/deactivate', userController.deactivateUser.bind(userController));

// OPTIONS /api/users - Get allowed methods
router.options('/', (req, res) => {
    res.set({
        'Allow': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    res.status(200).end();
});

router.options('/:id', (req, res) => {
    res.set({
        'Allow': 'GET, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Methods': 'GET, PUT, PATCH, DELETE, OPTIONS'
    });
    res.status(200).end();
});

module.exports = router;
```

### Complete RESTful API Application

```javascript
// app.js - Main Application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
    }
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API versioning
const v1Router = express.Router();

// Import route modules
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories');

// Mount routes
v1Router.use('/users', userRoutes);
v1Router.use('/posts', postRoutes);
v1Router.use('/categories', categoryRoutes);

// API info endpoint
v1Router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RESTful API v1',
        version: '1.0.0',
        endpoints: {
            users: '/api/v1/users',
            posts: '/api/v1/posts',
            categories: '/api/v1/categories'
        },
        documentation: '/api/v1/docs',
        timestamp: new Date().toISOString()
    });
});

// API documentation endpoint
v1Router.get('/docs', (req, res) => {
    res.json({
        success: true,
        documentation: {
            version: '1.0.0',
            baseUrl: '/api/v1',
            authentication: 'Bearer token required for protected endpoints',
            rateLimit: '100 requests per 15 minutes per IP',
            endpoints: {
                users: {
                    'GET /users': {
                        description: 'Get all users',
                        parameters: {
                            page: 'Page number (default: 1)',
                            limit: 'Items per page (default: 10)',
                            sortBy: 'Sort field (default: createdAt)',
                            sortOrder: 'Sort order: asc|desc (default: desc)',
                            role: 'Filter by role',
                            active: 'Filter by active status: true|false',
                            search: 'Search in username, email, firstName, lastName'
                        },
                        response: '200 OK with users array and pagination info'
                    },
                    'GET /users/:id': {
                        description: 'Get user by ID',
                        parameters: { id: 'User ID' },
                        response: '200 OK with user object or 404 Not Found'
                    },
                    'POST /users': {
                        description: 'Create new user',
                        body: {
                            username: 'string (required)',
                            email: 'string (required)',
                            firstName: 'string (required)',
                            lastName: 'string (required)',
                            role: 'string (optional, default: user)'
                        },
                        response: '201 Created with user object'
                    },
                    'PUT /users/:id': {
                        description: 'Update entire user',
                        parameters: { id: 'User ID' },
                        body: 'Complete user object',
                        response: '200 OK with updated user or 404 Not Found'
                    },
                    'PATCH /users/:id': {
                        description: 'Partial user update',
                        parameters: { id: 'User ID' },
                        body: 'Partial user object',
                        response: '200 OK with updated user or 404 Not Found'
                    },
                    'DELETE /users/:id': {
                        description: 'Delete user',
                        parameters: { id: 'User ID' },
                        response: '200 OK with deleted user or 404 Not Found'
                    }
                }
            },
            statusCodes: {
                200: 'OK - Request successful',
                201: 'Created - Resource created successfully',
                400: 'Bad Request - Invalid request syntax',
                401: 'Unauthorized - Authentication required',
                403: 'Forbidden - Access denied',
                404: 'Not Found - Resource not found',
                409: 'Conflict - Request conflicts with current state',
                422: 'Unprocessable Entity - Validation errors',
                429: 'Too Many Requests - Rate limit exceeded',
                500: 'Internal Server Error - Server error'
            }
        }
    });
});

// Mount API version
app.use('/api/v1', v1Router);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'RESTful API Server',
        version: '1.0.0',
        api: {
            v1: '/api/v1',
            documentation: '/api/v1/docs'
        },
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: {
            api: '/api/v1',
            documentation: '/api/v1/docs',
            health: '/health'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Invalid JSON in request body'
        });
    }
    
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: 'Request body exceeds size limit'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: err.status === 500 ? 'Internal Server Error' : err.name || 'Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred while processing your request'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 RESTful API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
```

## Real-World Use Case

### E-commerce Product API

```javascript
// models/Product.js
class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = parseFloat(data.price);
        this.category = data.category;
        this.brand = data.brand;
        this.sku = data.sku;
        this.stock = parseInt(data.stock) || 0;
        this.images = data.images || [];
        this.specifications = data.specifications || {};
        this.tags = data.tags || [];
        this.active = data.active !== undefined ? data.active : true;
        this.featured = data.featured || false;
        this.rating = data.rating || 0;
        this.reviewCount = data.reviewCount || 0;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }
    
    validate() {
        const errors = [];
        
        if (!this.name || this.name.length < 3) {
            errors.push('Product name must be at least 3 characters');
        }
        
        if (!this.description || this.description.length < 10) {
            errors.push('Description must be at least 10 characters');
        }
        
        if (!this.price || this.price <= 0) {
            errors.push('Price must be greater than 0');
        }
        
        if (!this.category) {
            errors.push('Category is required');
        }
        
        if (!this.sku) {
            errors.push('SKU is required');
        }
        
        return errors;
    }
    
    toPublic() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            brand: this.brand,
            sku: this.sku,
            stock: this.stock,
            images: this.images,
            specifications: this.specifications,
            tags: this.tags,
            active: this.active,
            featured: this.featured,
            rating: this.rating,
            reviewCount: this.reviewCount,
            availability: this.stock > 0 ? 'in-stock' : 'out-of-stock',
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;
```

```javascript
// routes/products.js - Product API Routes
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Sample product data
let products = [
    new Product({
        id: 1,
        name: 'MacBook Pro 16"',
        description: 'Powerful laptop for professionals with M2 Pro chip',
        price: 2499.99,
        category: 'Electronics',
        brand: 'Apple',
        sku: 'MBP16-M2PRO-512',
        stock: 15,
        images: ['macbook-1.jpg', 'macbook-2.jpg'],
        specifications: {
            processor: 'M2 Pro',
            memory: '16GB',
            storage: '512GB SSD',
            display: '16-inch Retina'
        },
        tags: ['laptop', 'apple', 'professional'],
        featured: true,
        rating: 4.8,
        reviewCount: 127
    }),
    new Product({
        id: 2,
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with titanium design and A17 Pro chip',
        price: 999.99,
        category: 'Electronics',
        brand: 'Apple',
        sku: 'IP15PRO-128-TIT',
        stock: 25,
        images: ['iphone-1.jpg', 'iphone-2.jpg'],
        specifications: {
            processor: 'A17 Pro',
            storage: '128GB',
            camera: '48MP Pro camera system',
            display: '6.1-inch Super Retina XDR'
        },
        tags: ['smartphone', 'apple', 'pro'],
        featured: true,
        rating: 4.9,
        reviewCount: 89
    })
];
let nextId = 3;

// GET /api/products - Get all products with advanced filtering
router.get('/', (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            category,
            brand,
            minPrice,
            maxPrice,
            inStock,
            featured,
            search,
            tags
        } = req.query;
        
        let filteredProducts = products.filter(p => p.active);
        
        // Apply filters
        if (category) {
            filteredProducts = filteredProducts.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (brand) {
            filteredProducts = filteredProducts.filter(p => 
                p.brand.toLowerCase() === brand.toLowerCase()
            );
        }
        
        if (minPrice) {
            filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
        }
        
        if (maxPrice) {
            filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
        }
        
        if (inStock === 'true') {
            filteredProducts = filteredProducts.filter(p => p.stock > 0);
        }
        
        if (featured === 'true') {
            filteredProducts = filteredProducts.filter(p => p.featured);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.brand.toLowerCase().includes(searchLower) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
        
        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
            filteredProducts = filteredProducts.filter(p => 
                tagList.some(tag => p.tags.map(t => t.toLowerCase()).includes(tag))
            );
        }
        
        // Apply sorting
        filteredProducts.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
        
        // Apply pagination
        const total = filteredProducts.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedProducts = filteredProducts.slice(offset, offset + parseInt(limit));
        
        // Get filter options for frontend
        const filterOptions = {
            categories: [...new Set(products.map(p => p.category))],
            brands: [...new Set(products.map(p => p.brand))],
            priceRange: {
                min: Math.min(...products.map(p => p.price)),
                max: Math.max(...products.map(p => p.price))
            },
            tags: [...new Set(products.flatMap(p => p.tags))]
        };
        
        res.json({
            success: true,
            data: paginatedProducts.map(p => p.toPublic()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: {
                applied: { category, brand, minPrice, maxPrice, inStock, featured, search, tags },
                available: filterOptions
            },
            message: 'Products retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/products/featured - Get featured products
router.get('/featured', (req, res) => {
    try {
        const featuredProducts = products
            .filter(p => p.featured && p.active)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, parseInt(req.query.limit) || 6);
        
        res.json({
            success: true,
            data: featuredProducts.map(p => p.toPublic()),
            count: featuredProducts.length,
            message: 'Featured products retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/products/categories - Get all categories
router.get('/categories', (req, res) => {
    try {
        const categories = [...new Set(products.map(p => p.category))];
        const categoryStats = categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category && p.active);
            return {
                name: category,
                count: categoryProducts.length,
                averagePrice: categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length
            };
        });
        
        res.json({
            success: true,
            data: categoryStats,
            message: 'Categories retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res) => {
    try {
        const product = products.find(p => p.id === parseInt(req.params.id) && p.active);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `Product with ID ${req.params.id} does not exist`
            });
        }
        
        // Get related products
        const relatedProducts = products
            .filter(p => 
                p.id !== product.id && 
                p.category === product.category && 
                p.active
            )
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
        
        res.json({
            success: true,
            data: {
                product: product.toPublic(),
                related: relatedProducts.map(p => p.toPublic())
            },
            message: 'Product retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/products - Create new product
router.post('/', (req, res) => {
    try {
        // Check if SKU already exists
        const existingProduct = products.find(p => p.sku === req.body.sku);
        if (existingProduct) {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: 'Product with this SKU already exists'
            });
        }
        
        const product = new Product({
            ...req.body,
            id: nextId++
        });
        
        const validationErrors = product.validate();
        if (validationErrors.length > 0) {
            return res.status(422).json({
                success: false,
                error: 'Validation error',
                message: `Validation failed: ${validationErrors.join(', ')}`
            });
        }
        
        products.push(product);
        
        res.status(201).json({
            success: true,
            data: product.toPublic(),
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// PUT /api/products/:id - Update entire product
router.put('/:id', (req, res) => {
    try {
        const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `Product with ID ${req.params.id} does not exist`
            });
        }
        
        // Check SKU conflict
        if (req.body.sku) {
            const conflictProduct = products.find(p => 
                p.id !== parseInt(req.params.id) && p.sku === req.body.sku
            );
            if (conflictProduct) {
                return res.status(409).json({
                    success: false,
                    error: 'Conflict',
                    message: 'Product with this SKU already exists'
                });
            }
        }
        
        const updatedProduct = new Product({
            ...req.body,
            id: parseInt(req.params.id),
            updatedAt: new Date()
        });
        
        const validationErrors = updatedProduct.validate();
        if (validationErrors.length > 0) {
            return res.status(422).json({
                success: false,
                error: 'Validation error',
                message: `Validation failed: ${validationErrors.join(', ')}`
            });
        }
        
        products[productIndex] = updatedProduct;
        
        res.json({
            success: true,
            data: updatedProduct.toPublic(),
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// PATCH /api/products/:id/stock - Update stock only
router.patch('/:id/stock', (req, res) => {
    try {
        const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `Product with ID ${req.params.id} does not exist`
            });
        }
        
        const { stock } = req.body;
        
        if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: 'Valid stock quantity (>= 0) is required'
            });
        }
        
        products[productIndex].stock = parseInt(stock);
        products[productIndex].updatedAt = new Date();
        
        res.json({
            success: true,
            data: products[productIndex].toPublic(),
            message: 'Product stock updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', (req, res) => {
    try {
        const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Product not found',
                message: `Product with ID ${req.params.id} does not exist`
            });
        }
        
        // Soft delete - mark as inactive
        products[productIndex].active = false;
        products[productIndex].updatedAt = new Date();
        
        res.json({
            success: true,
            data: products[productIndex].toPublic(),
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
```

## Best Practices

### 1. Use Proper HTTP Methods

```javascript
// ✅ Correct usage
GET /api/users          // Get all users
GET /api/users/123      // Get specific user
POST /api/users         // Create new user
PUT /api/users/123      // Update entire user
PATCH /api/users/123    // Partial update
DELETE /api/users/123   // Delete user

// ❌ Incorrect usage
GET /api/getUsers       // Don't use verbs in URLs
POST /api/users/delete  // Use DELETE method instead
GET /api/users/create   // Use POST for creation
```

### 2. Implement Consistent Response Format

```javascript
// Success response format
{
    "success": true,
    "data": { /* response data */ },
    "message": "Operation completed successfully",
    "pagination": { /* pagination info if applicable */ }
}

// Error response format
{
    "success": false,
    "error": "Error Type",
    "message": "Detailed error message",
    "details": { /* additional error details */ }
}
```

### 3. Use Appropriate Status Codes

```javascript
// Success responses
res.status(200).json(data);     // OK - successful GET, PUT, PATCH
res.status(201).json(data);     // Created - successful POST
res.status(204).end();          // No Content - successful DELETE

// Client error responses
res.status(400).json(error);    // Bad Request - invalid syntax
res.status(401).json(error);    // Unauthorized - authentication required
res.status(403).json(error);    // Forbidden - access denied
res.status(404).json(error);    // Not Found - resource doesn't exist
res.status(409).json(error);    // Conflict - resource already exists
res.status(422).json(error);    // Unprocessable Entity - validation errors

// Server error responses
res.status(500).json(error);    // Internal Server Error
```

### 4. Implement Proper Error Handling

```javascript
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.get('/users', asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
}));
```

### 5. Add Input Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                error: 'Validation error',
                details: errors.array()
            });
        }
        next();
    }
];
```

## Summary

RESTful API design principles provide a foundation for building scalable, maintainable web services:

**Core Principles**:
- **Stateless**: Each request is independent
- **Resource-based**: URLs represent resources, not actions
- **HTTP methods**: Use appropriate methods for different operations
- **Status codes**: Return meaningful HTTP status codes
- **Consistent format**: Standardize request/response structures

**Best Practices**:
- Use nouns in URLs, not verbs
- Implement proper error handling
- Add input validation
- Use consistent response formats
- Follow HTTP status code conventions
- Implement pagination for large datasets
- Add filtering and sorting capabilities

**Benefits**:
- **Predictable**: Follows established conventions
- **Scalable**: Stateless nature enables horizontal scaling
- **Cacheable**: Responses can be cached for performance
- **Maintainable**: Clear structure and separation of concerns
- **Interoperable**: Works with any HTTP client

Mastering RESTful API design is essential for building modern web applications. Next, we'll explore CRUD operations with Express.js in more detail, building upon these REST principles.