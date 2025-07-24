# Express Router and Modular Route Management

## Overview

As Express.js applications grow in complexity, managing all routes in a single file becomes unwieldy and difficult to maintain. Express Router provides a powerful solution for organizing routes into modular, reusable components. It allows you to create mini-applications with their own middleware, routes, and error handling, making your codebase more organized, scalable, and maintainable.

## Key Concepts

### Express Router

Express Router is:
- A mini Express application without views or settings
- A complete middleware and routing system
- Mountable at different paths
- Capable of performing middleware and routing functions
- Stackable and composable

### Benefits of Modular Routing

1. **Organization**: Separate concerns into logical modules
2. **Maintainability**: Easier to find and modify specific functionality
3. **Reusability**: Routes can be reused across different applications
4. **Team Development**: Different developers can work on different modules
5. **Testing**: Easier to test individual route modules
6. **Scalability**: Better structure for large applications

### Router Patterns

- **Resource-based routing**: Routes organized by data entities
- **Feature-based routing**: Routes organized by application features
- **Version-based routing**: API versioning through separate routers
- **Middleware stacking**: Applying middleware at router level
- **Nested routing**: Routers within routers for complex hierarchies

## Example Code

### Basic Router Setup

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// Sample user data
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];
let nextId = 4;

// Middleware specific to this router
router.use((req, res, next) => {
    console.log(`Users route accessed: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /users - Get all users
router.get('/', (req, res) => {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let filteredUsers = [...users];
    
    // Filter by role
    if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Search by name or email
    if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedUsers,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit)
        }
    });
});

// GET /users/:id - Get user by ID
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    res.json({
        success: true,
        data: user
    });
});

// POST /users - Create new user
router.post('/', (req, res) => {
    const { name, email, role = 'user' } = req.body;
    
    // Validation
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            error: 'Name and email are required'
        });
    }
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return res.status(409).json({
            success: false,
            error: 'Email already exists'
        });
    }
    
    const newUser = {
        id: nextId++,
        name,
        email,
        role
    };
    
    users.push(newUser);
    
    res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
    });
});

// PUT /users/:id - Update user
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    const { name, email, role } = req.body;
    
    // Check if email is being changed and already exists
    if (email && email !== users[userIndex].email) {
        if (users.find(u => u.email === email)) {
            return res.status(409).json({
                success: false,
                error: 'Email already exists'
            });
        }
    }
    
    // Update user
    users[userIndex] = {
        ...users[userIndex],
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role })
    };
    
    res.json({
        success: true,
        data: users[userIndex],
        message: 'User updated successfully'
    });
});

// DELETE /users/:id - Delete user
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
        success: true,
        data: deletedUser,
        message: 'User deleted successfully'
    });
});

module.exports = router;
```

### Advanced Router with Middleware

```javascript
// routes/posts.js
const express = require('express');
const router = express.Router();

// Sample posts data
let posts = [
    { id: 1, title: 'First Post', content: 'This is the first post', authorId: 1, published: true, createdAt: new Date() },
    { id: 2, title: 'Second Post', content: 'This is the second post', authorId: 2, published: false, createdAt: new Date() },
    { id: 3, title: 'Third Post', content: 'This is the third post', authorId: 1, published: true, createdAt: new Date() }
];
let nextId = 4;

// Validation middleware
const validatePost = (req, res, next) => {
    const { title, content, authorId } = req.body;
    const errors = [];
    
    if (!title || title.trim().length === 0) {
        errors.push('Title is required');
    }
    
    if (!content || content.trim().length === 0) {
        errors.push('Content is required');
    }
    
    if (!authorId || isNaN(parseInt(authorId))) {
        errors.push('Valid author ID is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};

// Authentication middleware (simplified)
const authenticate = (req, res, next) => {
    const token = req.get('Authorization');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    // Simplified token validation
    if (token !== 'Bearer valid-token') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
    
    // Add user info to request
    req.user = { id: 1, role: 'admin' };
    next();
};

// Authorization middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        if (roles.length > 0 && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

// Logging middleware for this router
router.use((req, res, next) => {
    console.log(`Posts route: ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
    next();
});

// GET /posts - Get all posts (public)
router.get('/', (req, res) => {
    const { published, authorId, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let filteredPosts = [...posts];
    
    // Filter by published status
    if (published !== undefined) {
        filteredPosts = filteredPosts.filter(post => 
            post.published === (published === 'true')
        );
    }
    
    // Filter by author
    if (authorId) {
        filteredPosts = filteredPosts.filter(post => 
            post.authorId === parseInt(authorId)
        );
    }
    
    // Search in title and content
    if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower)
        );
    }
    
    // Sorting
    filteredPosts.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (order === 'desc') {
            return bVal > aVal ? 1 : -1;
        } else {
            return aVal > bVal ? 1 : -1;
        }
    });
    
    res.json({
        success: true,
        data: filteredPosts,
        count: filteredPosts.length
    });
});

// GET /posts/:id - Get single post (public)
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(p => p.id === id);
    
    if (!post) {
        return res.status(404).json({
            success: false,
            error: 'Post not found'
        });
    }
    
    res.json({
        success: true,
        data: post
    });
});

// POST /posts - Create new post (requires authentication)
router.post('/', authenticate, validatePost, (req, res) => {
    const { title, content, authorId, published = false } = req.body;
    
    const newPost = {
        id: nextId++,
        title: title.trim(),
        content: content.trim(),
        authorId: parseInt(authorId),
        published,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    posts.push(newPost);
    
    res.status(201).json({
        success: true,
        data: newPost,
        message: 'Post created successfully'
    });
});

// PUT /posts/:id - Update post (requires authentication)
router.put('/:id', authenticate, validatePost, (req, res) => {
    const id = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Post not found'
        });
    }
    
    const { title, content, published } = req.body;
    
    // Update post
    posts[postIndex] = {
        ...posts[postIndex],
        title: title.trim(),
        content: content.trim(),
        published,
        updatedAt: new Date()
    };
    
    res.json({
        success: true,
        data: posts[postIndex],
        message: 'Post updated successfully'
    });
});

// DELETE /posts/:id - Delete post (requires admin role)
router.delete('/:id', authenticate, authorize(['admin']), (req, res) => {
    const id = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Post not found'
        });
    }
    
    const deletedPost = posts.splice(postIndex, 1)[0];
    
    res.json({
        success: true,
        data: deletedPost,
        message: 'Post deleted successfully'
    });
});

// PATCH /posts/:id/publish - Toggle publish status (requires authentication)
router.patch('/:id/publish', authenticate, (req, res) => {
    const id = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Post not found'
        });
    }
    
    posts[postIndex].published = !posts[postIndex].published;
    posts[postIndex].updatedAt = new Date();
    
    res.json({
        success: true,
        data: posts[postIndex],
        message: `Post ${posts[postIndex].published ? 'published' : 'unpublished'} successfully`
    });
});

module.exports = router;
```

### Nested Routers and Route Parameters

```javascript
// routes/api.js - Main API router
const express = require('express');
const router = express.Router();

// Import sub-routers
const usersRouter = require('./users');
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const authRouter = require('./auth');

// API-wide middleware
router.use((req, res, next) => {
    res.set({
        'X-API-Version': '1.0.0',
        'X-Powered-By': 'Express.js'
    });
    next();
});

// Request logging
router.use((req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Mount sub-routers
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/posts/:postId/comments', commentsRouter); // Nested route

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            posts: '/api/posts',
            comments: '/api/posts/:postId/comments'
        },
        documentation: '/api/docs'
    });
});

// API documentation endpoint
router.get('/docs', (req, res) => {
    const documentation = {
        version: '1.0.0',
        baseUrl: '/api',
        endpoints: {
            auth: {
                'POST /auth/login': 'Authenticate user',
                'POST /auth/register': 'Register new user',
                'POST /auth/logout': 'Logout user'
            },
            users: {
                'GET /users': 'Get all users',
                'GET /users/:id': 'Get user by ID',
                'POST /users': 'Create new user',
                'PUT /users/:id': 'Update user',
                'DELETE /users/:id': 'Delete user'
            },
            posts: {
                'GET /posts': 'Get all posts',
                'GET /posts/:id': 'Get post by ID',
                'POST /posts': 'Create new post',
                'PUT /posts/:id': 'Update post',
                'DELETE /posts/:id': 'Delete post',
                'PATCH /posts/:id/publish': 'Toggle publish status'
            },
            comments: {
                'GET /posts/:postId/comments': 'Get comments for post',
                'POST /posts/:postId/comments': 'Add comment to post',
                'PUT /posts/:postId/comments/:id': 'Update comment',
                'DELETE /posts/:postId/comments/:id': 'Delete comment'
            }
        }
    };
    
    res.json({
        success: true,
        documentation
    });
});

module.exports = router;
```

```javascript
// routes/comments.js - Nested router for comments
const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for accessing parent params

// Sample comments data
let comments = [
    { id: 1, postId: 1, content: 'Great post!', authorId: 2, createdAt: new Date() },
    { id: 2, postId: 1, content: 'Thanks for sharing', authorId: 3, createdAt: new Date() },
    { id: 3, postId: 2, content: 'Interesting perspective', authorId: 1, createdAt: new Date() }
];
let nextId = 4;

// Middleware to validate post exists
const validatePost = (req, res, next) => {
    const postId = parseInt(req.params.postId);
    
    // In a real app, you'd check the database
    // For demo, we'll assume posts with IDs 1-3 exist
    if (isNaN(postId) || postId < 1 || postId > 3) {
        return res.status(404).json({
            success: false,
            error: 'Post not found'
        });
    }
    
    req.postId = postId;
    next();
};

// Apply post validation to all routes
router.use(validatePost);

// GET /posts/:postId/comments - Get comments for a post
router.get('/', (req, res) => {
    const postComments = comments.filter(comment => comment.postId === req.postId);
    
    res.json({
        success: true,
        data: postComments,
        postId: req.postId,
        count: postComments.length
    });
});

// GET /posts/:postId/comments/:id - Get specific comment
router.get('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    const comment = comments.find(c => c.id === commentId && c.postId === req.postId);
    
    if (!comment) {
        return res.status(404).json({
            success: false,
            error: 'Comment not found'
        });
    }
    
    res.json({
        success: true,
        data: comment
    });
});

// POST /posts/:postId/comments - Add comment to post
router.post('/', (req, res) => {
    const { content, authorId } = req.body;
    
    if (!content || !authorId) {
        return res.status(400).json({
            success: false,
            error: 'Content and author ID are required'
        });
    }
    
    const newComment = {
        id: nextId++,
        postId: req.postId,
        content: content.trim(),
        authorId: parseInt(authorId),
        createdAt: new Date()
    };
    
    comments.push(newComment);
    
    res.status(201).json({
        success: true,
        data: newComment,
        message: 'Comment added successfully'
    });
});

// PUT /posts/:postId/comments/:id - Update comment
router.put('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    const commentIndex = comments.findIndex(c => c.id === commentId && c.postId === req.postId);
    
    if (commentIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Comment not found'
        });
    }
    
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({
            success: false,
            error: 'Content is required'
        });
    }
    
    comments[commentIndex] = {
        ...comments[commentIndex],
        content: content.trim(),
        updatedAt: new Date()
    };
    
    res.json({
        success: true,
        data: comments[commentIndex],
        message: 'Comment updated successfully'
    });
});

// DELETE /posts/:postId/comments/:id - Delete comment
router.delete('/:id', (req, res) => {
    const commentId = parseInt(req.params.id);
    const commentIndex = comments.findIndex(c => c.id === commentId && c.postId === req.postId);
    
    if (commentIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Comment not found'
        });
    }
    
    const deletedComment = comments.splice(commentIndex, 1)[0];
    
    res.json({
        success: true,
        data: deletedComment,
        message: 'Comment deleted successfully'
    });
});

module.exports = router;
```

### Main Application with Router Integration

```javascript
// app.js - Main application file
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routers
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const webhooksRouter = require('./routes/webhooks');

// Mount routers
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/webhooks', webhooksRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the Express Router Demo',
        version: '1.0.0',
        routes: {
            api: '/api',
            admin: '/admin',
            webhooks: '/webhooks'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 API documentation available at http://localhost:${PORT}/api/docs`);
});

module.exports = app;
```

## Real-World Use Case

### E-commerce API with Modular Routing

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();

// Product data (in real app, this would be a database)
let products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', stock: 10 },
    { id: 2, name: 'Book', price: 19.99, category: 'Education', stock: 50 },
    { id: 3, name: 'Coffee Mug', price: 9.99, category: 'Kitchen', stock: 25 }
];

// Middleware for product validation
const validateProduct = (req, res, next) => {
    const { name, price, category } = req.body;
    const errors = [];
    
    if (!name || name.trim().length === 0) {
        errors.push('Product name is required');
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        errors.push('Valid price is required');
    }
    
    if (!category || category.trim().length === 0) {
        errors.push('Category is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    
    next();
};

// GET /products - Get all products with filtering and pagination
router.get('/', (req, res) => {
    const { 
        category, 
        minPrice, 
        maxPrice, 
        search, 
        sortBy = 'name', 
        order = 'asc',
        page = 1, 
        limit = 10 
    } = req.query;
    
    let filteredProducts = [...products];
    
    // Apply filters
    if (category) {
        filteredProducts = filteredProducts.filter(p => 
            p.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.category.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
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
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedProducts,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredProducts.length,
            totalPages: Math.ceil(filteredProducts.length / limit)
        },
        filters: { category, minPrice, maxPrice, search },
        sorting: { sortBy, order }
    });
});

// GET /products/categories - Get all categories
router.get('/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    
    res.json({
        success: true,
        data: categories,
        count: categories.length
    });
});

// GET /products/:id - Get single product
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    res.json({
        success: true,
        data: product
    });
});

// POST /products - Create new product (admin only)
router.post('/', validateProduct, (req, res) => {
    const { name, price, category, stock = 0 } = req.body;
    
    const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        stock: parseInt(stock) || 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    products.push(newProduct);
    
    res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
    });
});

// PUT /products/:id - Update product
router.put('/:id', validateProduct, (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    const { name, price, category, stock } = req.body;
    
    products[productIndex] = {
        ...products[productIndex],
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim(),
        stock: parseInt(stock) || 0,
        updatedAt: new Date()
    };
    
    res.json({
        success: true,
        data: products[productIndex],
        message: 'Product updated successfully'
    });
});

// PATCH /products/:id/stock - Update stock only
router.patch('/:id/stock', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    const { stock } = req.body;
    
    if (stock === undefined || isNaN(parseInt(stock))) {
        return res.status(400).json({
            success: false,
            error: 'Valid stock quantity is required'
        });
    }
    
    products[productIndex].stock = parseInt(stock);
    products[productIndex].updatedAt = new Date();
    
    res.json({
        success: true,
        data: products[productIndex],
        message: 'Stock updated successfully'
    });
});

// DELETE /products/:id - Delete product
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
        success: true,
        data: deletedProduct,
        message: 'Product deleted successfully'
    });
});

module.exports = router;
```

```javascript
// routes/orders.js
const express = require('express');
const router = express.Router();

// Sample orders data
let orders = [
    {
        id: 1,
        userId: 1,
        items: [
            { productId: 1, quantity: 1, price: 999.99 },
            { productId: 3, quantity: 2, price: 9.99 }
        ],
        total: 1019.97,
        status: 'pending',
        createdAt: new Date()
    }
];
let nextId = 2;

// Order validation middleware
const validateOrder = (req, res, next) => {
    const { userId, items } = req.body;
    
    if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({
            success: false,
            error: 'Valid user ID is required'
        });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Order must contain at least one item'
        });
    }
    
    // Validate each item
    for (const item of items) {
        if (!item.productId || !item.quantity || !item.price) {
            return res.status(400).json({
                success: false,
                error: 'Each item must have productId, quantity, and price'
            });
        }
    }
    
    next();
};

// GET /orders - Get all orders
router.get('/', (req, res) => {
    const { userId, status, page = 1, limit = 10 } = req.query;
    
    let filteredOrders = [...orders];
    
    if (userId) {
        filteredOrders = filteredOrders.filter(order => 
            order.userId === parseInt(userId)
        );
    }
    
    if (status) {
        filteredOrders = filteredOrders.filter(order => 
            order.status === status
        );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        data: paginatedOrders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / limit)
        }
    });
});

// GET /orders/:id - Get single order
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const order = orders.find(o => o.id === id);
    
    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    res.json({
        success: true,
        data: order
    });
});

// POST /orders - Create new order
router.post('/', validateOrder, (req, res) => {
    const { userId, items } = req.body;
    
    // Calculate total
    const total = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const newOrder = {
        id: nextId++,
        userId: parseInt(userId),
        items,
        total: parseFloat(total.toFixed(2)),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    orders.push(newOrder);
    
    res.status(201).json({
        success: true,
        data: newOrder,
        message: 'Order created successfully'
    });
});

// PATCH /orders/:id/status - Update order status
router.patch('/:id/status', (req, res) => {
    const id = parseInt(req.params.id);
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`
        });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date();
    
    res.json({
        success: true,
        data: orders[orderIndex],
        message: 'Order status updated successfully'
    });
});

module.exports = router;
```

## Best Practices

### 1. Organize Routes by Resource
```
routes/
├── api.js          # Main API router
├── auth.js         # Authentication routes
├── users.js        # User management
├── products.js     # Product management
├── orders.js       # Order management
├── admin.js        # Admin routes
└── webhooks.js     # Webhook endpoints
```

### 2. Use Middleware Effectively
```javascript
// Apply middleware at router level
router.use(authenticate); // All routes require auth
router.use('/admin', authorize(['admin'])); // Admin routes only

// Route-specific middleware
router.post('/users', validateUser, createUser);
router.put('/users/:id', validateUser, authorize(['admin', 'user']), updateUser);
```

### 3. Handle Route Parameters
```javascript
// Use router.param for parameter preprocessing
router.param('id', (req, res, next, id) => {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    req.params.id = numericId;
    next();
});
```

### 4. Implement Consistent Error Handling
```javascript
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Use in routes
router.get('/users', asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json({ success: true, data: users });
}));
```

### 5. Version Your APIs
```javascript
// routes/v1/index.js
const router = express.Router();
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));

// routes/v2/index.js
const router = express.Router();
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));

// app.js
app.use('/api/v1', require('./routes/v1'));
app.use('/api/v2', require('./routes/v2'));
```

## Summary

Express Router enables modular route management through:

**Core Features**:
- Mini Express applications with routing and middleware
- Mountable at different paths
- Parameter handling with `mergeParams`
- Route-specific and router-level middleware

**Organization Benefits**:
- Separation of concerns by resource or feature
- Easier maintenance and testing
- Better team collaboration
- Reusable route modules

**Advanced Patterns**:
- Nested routers for complex hierarchies
- Parameter preprocessing with `router.param()`
- Middleware stacking for authentication and authorization
- API versioning through separate routers

**Best Practices**:
- Organize routes by logical groupings
- Use consistent error handling
- Implement proper validation middleware
- Document API endpoints
- Version APIs for backward compatibility

Mastering Express Router is essential for building scalable, maintainable Express.js applications. Next, we'll explore template engines like EJS and Pug for server-side rendering.