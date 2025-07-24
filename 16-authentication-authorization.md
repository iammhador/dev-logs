# Authentication and Authorization in Express.js

## Overview

Authentication and authorization are critical security components in web applications. Authentication verifies who a user is (identity), while authorization determines what a user can do (permissions). This chapter covers implementing secure authentication using JWT (JSON Web Tokens), session-based authentication, password hashing, role-based access control (RBAC), and advanced security patterns in Express.js applications.

## Key Concepts

### Authentication vs Authorization

**Authentication**: The process of verifying a user's identity ("Who are you?")
- Login with username/password
- Token verification
- Multi-factor authentication
- Social login (OAuth)

**Authorization**: The process of determining what an authenticated user can access ("What can you do?")
- Role-based access control (RBAC)
- Permission-based access control
- Resource-level permissions
- Attribute-based access control (ABAC)

### JWT (JSON Web Tokens)

**Structure**: Header.Payload.Signature
- **Header**: Token type and signing algorithm
- **Payload**: Claims (user data, permissions, expiration)
- **Signature**: Verification of token integrity

**Benefits**: Stateless, scalable, cross-domain support
**Considerations**: Token size, security, refresh strategies

### Session-Based Authentication

**Server-side sessions**: Store session data on server
**Session cookies**: Client stores session identifier
**Benefits**: Server control, easy revocation
**Considerations**: Scalability, memory usage

## Example Code

### JWT Authentication Service

```javascript
// services/AuthService.js - Comprehensive Authentication Service
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
        this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        this.issuer = process.env.JWT_ISSUER || 'task-api';
        this.audience = process.env.JWT_AUDIENCE || 'task-app';
    }
    
    // Generate access token
    generateAccessToken(user) {
        const payload = {
            sub: user._id.toString(), // Subject (user ID)
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: this.getUserPermissions(user.role),
            iss: this.issuer, // Issuer
            aud: this.audience, // Audience
            iat: Math.floor(Date.now() / 1000), // Issued at
            type: 'access'
        };
        
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.accessTokenExpiry,
            algorithm: 'HS256'
        });
    }
    
    // Generate refresh token
    async generateRefreshToken(userId) {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
        
        // Store refresh token in database
        const refreshToken = new RefreshToken({
            token,
            userId,
            expiresAt,
            isActive: true
        });
        
        await refreshToken.save();
        return token;
    }
    
    // Verify access token
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret, {
                issuer: this.issuer,
                audience: this.audience,
                algorithms: ['HS256']
            });
            
            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }
            
            return decoded;
        } catch (error) {
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
    
    // Verify refresh token
    async verifyRefreshToken(token) {
        try {
            const refreshToken = await RefreshToken.findOne({
                token,
                isActive: true,
                expiresAt: { $gt: new Date() }
            }).populate('userId');
            
            if (!refreshToken) {
                throw new Error('Invalid or expired refresh token');
            }
            
            return refreshToken;
        } catch (error) {
            throw new Error(`Refresh token verification failed: ${error.message}`);
        }
    }
    
    // Register new user
    async register(userData) {
        try {
            const { username, email, password, firstName, lastName } = userData;
            
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });
            
            if (existingUser) {
                throw new Error('User already exists with this email or username');
            }
            
            // Create new user
            const user = new User({
                username,
                email,
                password, // Will be hashed by pre-save middleware
                firstName,
                lastName,
                role: 'user' // Default role
            });
            
            await user.save();
            
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user._id);
            
            return {
                user: user.toPublicJSON(),
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: this.accessTokenExpiry
                }
            };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }
    
    // Login user
    async login(credentials) {
        try {
            const { identifier, password, rememberMe = false } = credentials;
            
            // Find user by email or username
            const user = await User.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier }
                ],
                isActive: true
            }).select('+password'); // Include password field
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            
            // Update last login
            await user.updateLastLogin();
            
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user._id);
            
            // Revoke old refresh tokens if not "remember me"
            if (!rememberMe) {
                await this.revokeUserRefreshTokens(user._id);
            }
            
            return {
                user: user.toPublicJSON(),
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: this.accessTokenExpiry
                }
            };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    
    // Refresh access token
    async refreshAccessToken(refreshToken) {
        try {
            const tokenDoc = await this.verifyRefreshToken(refreshToken);
            const user = tokenDoc.userId;
            
            if (!user.isActive) {
                throw new Error('User account is deactivated');
            }
            
            // Generate new access token
            const newAccessToken = this.generateAccessToken(user);
            
            // Optionally rotate refresh token
            let newRefreshToken = refreshToken;
            if (process.env.ROTATE_REFRESH_TOKENS === 'true') {
                // Revoke old refresh token
                await this.revokeRefreshToken(refreshToken);
                // Generate new refresh token
                newRefreshToken = await this.generateRefreshToken(user._id);
            }
            
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: this.accessTokenExpiry
            };
        } catch (error) {
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }
    
    // Logout user
    async logout(refreshToken) {
        try {
            if (refreshToken) {
                await this.revokeRefreshToken(refreshToken);
            }
            return { message: 'Logged out successfully' };
        } catch (error) {
            throw new Error(`Logout failed: ${error.message}`);
        }
    }
    
    // Logout from all devices
    async logoutAll(userId) {
        try {
            await this.revokeUserRefreshTokens(userId);
            return { message: 'Logged out from all devices' };
        } catch (error) {
            throw new Error(`Logout all failed: ${error.message}`);
        }
    }
    
    // Revoke refresh token
    async revokeRefreshToken(token) {
        await RefreshToken.updateOne(
            { token },
            { isActive: false, revokedAt: new Date() }
        );
    }
    
    // Revoke all user refresh tokens
    async revokeUserRefreshTokens(userId) {
        await RefreshToken.updateMany(
            { userId, isActive: true },
            { isActive: false, revokedAt: new Date() }
        );
    }
    
    // Change password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId).select('+password');
            if (!user) {
                throw new Error('User not found');
            }
            
            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            
            // Update password
            user.password = newPassword;
            await user.save();
            
            // Revoke all refresh tokens to force re-login
            await this.revokeUserRefreshTokens(userId);
            
            return { message: 'Password changed successfully' };
        } catch (error) {
            throw new Error(`Password change failed: ${error.message}`);
        }
    }
    
    // Reset password
    async resetPassword(email) {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                // Don't reveal if email exists
                return { message: 'If the email exists, a reset link has been sent' };
            }
            
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
            
            // Save reset token to user
            user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.passwordResetExpires = resetTokenExpiry;
            await user.save({ validateBeforeSave: false });
            
            // TODO: Send email with reset link
            // await emailService.sendPasswordResetEmail(user.email, resetToken);
            
            return { 
                message: 'Password reset link sent to email',
                resetToken // Remove in production
            };
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }
    
    // Confirm password reset
    async confirmPasswordReset(resetToken, newPassword) {
        try {
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            
            const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
            });
            
            if (!user) {
                throw new Error('Invalid or expired reset token');
            }
            
            // Update password and clear reset token
            user.password = newPassword;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            
            // Revoke all refresh tokens
            await this.revokeUserRefreshTokens(user._id);
            
            return { message: 'Password reset successfully' };
        } catch (error) {
            throw new Error(`Password reset confirmation failed: ${error.message}`);
        }
    }
    
    // Get user permissions based on role
    getUserPermissions(role) {
        const permissions = {
            user: [
                'tasks:read:own',
                'tasks:create',
                'tasks:update:own',
                'tasks:delete:own',
                'profile:read:own',
                'profile:update:own'
            ],
            moderator: [
                'tasks:read:all',
                'tasks:create',
                'tasks:update:all',
                'tasks:delete:own',
                'users:read:all',
                'profile:read:own',
                'profile:update:own'
            ],
            admin: [
                'tasks:*',
                'users:*',
                'analytics:read',
                'system:manage'
            ]
        };
        
        return permissions[role] || permissions.user;
    }
    
    // Clean up expired tokens (run periodically)
    async cleanupExpiredTokens() {
        try {
            const result = await RefreshToken.deleteMany({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { isActive: false, revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 days old
                ]
            });
            
            console.log(`Cleaned up ${result.deletedCount} expired tokens`);
            return result.deletedCount;
        } catch (error) {
            console.error('Token cleanup failed:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();
```

### Refresh Token Model

```javascript
// models/RefreshToken.js - Refresh Token Schema
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL index
    },
    revokedAt: {
        type: Date
    },
    deviceInfo: {
        userAgent: String,
        ip: String,
        platform: String,
        browser: String
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound indexes
refreshTokenSchema.index({ userId: 1, isActive: 1 });
refreshTokenSchema.index({ token: 1, isActive: 1 });

// Update lastUsed when token is accessed
refreshTokenSchema.methods.updateLastUsed = function() {
    this.lastUsed = new Date();
    return this.save({ validateBeforeSave: false });
};

// Static method to find active tokens for user
refreshTokenSchema.statics.findActiveTokensForUser = function(userId) {
    return this.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    }).sort({ lastUsed: -1 });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
```

### Authentication Middleware

```javascript
// middleware/auth.js - Authentication and Authorization Middleware
const AuthService = require('../services/AuthService');
const User = require('../models/User');

class AuthMiddleware {
    // Extract token from request
    static extractToken(req) {
        // Check Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Check query parameter
        if (req.query.token) {
            return req.query.token;
        }
        
        // Check cookies
        if (req.cookies && req.cookies.accessToken) {
            return req.cookies.accessToken;
        }
        
        return null;
    }
    
    // Authentication middleware - requires valid token
    static authenticate() {
        return async (req, res, next) => {
            try {
                const token = AuthMiddleware.extractToken(req);
                
                if (!token) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Access token is required'
                    });
                }
                
                // Verify token
                const decoded = AuthService.verifyAccessToken(token);
                
                // Get fresh user data
                const user = await User.findById(decoded.sub);
                if (!user || !user.isActive) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'User not found or inactive'
                    });
                }
                
                // Attach user and token info to request
                req.user = user;
                req.token = decoded;
                req.permissions = decoded.permissions || [];
                
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
    
    // Optional authentication - doesn't fail if no token
    static optionalAuth() {
        return async (req, res, next) => {
            try {
                const token = AuthMiddleware.extractToken(req);
                
                if (token) {
                    const decoded = AuthService.verifyAccessToken(token);
                    const user = await User.findById(decoded.sub);
                    
                    if (user && user.isActive) {
                        req.user = user;
                        req.token = decoded;
                        req.permissions = decoded.permissions || [];
                    }
                }
            } catch (error) {
                // Ignore token errors for optional auth
                console.warn('Optional auth token error:', error.message);
            }
            
            next();
        };
    }
    
    // Role-based authorization
    static authorize(allowedRoles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }
            
            next();
        };
    }
    
    // Permission-based authorization
    static requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            
            if (!AuthMiddleware.hasPermission(req.permissions, permission)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: `Permission required: ${permission}`
                });
            }
            
            next();
        };
    }
    
    // Resource ownership authorization
    static requireOwnership(resourceField = 'userId') {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            
            // Admin can access any resource
            if (req.user.role === 'admin') {
                return next();
            }
            
            // Check if user owns the resource
            const resourceUserId = req.params[resourceField] || req.body[resourceField];
            
            if (resourceUserId && resourceUserId !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Access denied to this resource'
                });
            }
            
            next();
        };
    }
    
    // Check if user has specific permission
    static hasPermission(userPermissions, requiredPermission) {
        if (!userPermissions || userPermissions.length === 0) {
            return false;
        }
        
        // Check for exact match
        if (userPermissions.includes(requiredPermission)) {
            return true;
        }
        
        // Check for wildcard permissions
        const [resource, action, scope] = requiredPermission.split(':');
        
        // Check for resource-level wildcard (e.g., 'tasks:*')
        if (userPermissions.includes(`${resource}:*`)) {
            return true;
        }
        
        // Check for action-level wildcard (e.g., 'tasks:read:*')
        if (scope && userPermissions.includes(`${resource}:${action}:*`)) {
            return true;
        }
        
        return false;
    }
    
    // Rate limiting for auth endpoints
    static createAuthRateLimit() {
        const rateLimit = require('express-rate-limit');
        
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts per window
            message: {
                success: false,
                error: 'Too Many Requests',
                message: 'Too many authentication attempts. Please try again later.'
            },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true
        });
    }
    
    // Account lockout middleware
    static accountLockout() {
        return async (req, res, next) => {
            try {
                const { identifier } = req.body;
                
                if (identifier) {
                    const user = await User.findOne({
                        $or: [
                            { email: identifier.toLowerCase() },
                            { username: identifier }
                        ]
                    });
                    
                    if (user && user.isLocked) {
                        return res.status(423).json({
                            success: false,
                            error: 'Account Locked',
                            message: 'Account is temporarily locked due to multiple failed login attempts'
                        });
                    }
                }
                
                next();
            } catch (error) {
                next(error);
            }
        };
    }
}

module.exports = AuthMiddleware;
```

### Session-Based Authentication Alternative

```javascript
// middleware/sessionAuth.js - Session-Based Authentication
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('../models/User');

class SessionAuth {
    // Configure session middleware
    static configureSession() {
        return session({
            secret: process.env.SESSION_SECRET || 'your-session-secret',
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                touchAfter: 24 * 3600, // lazy session update
                ttl: 7 * 24 * 60 * 60 // 7 days
            }),
            cookie: {
                secure: process.env.NODE_ENV === 'production', // HTTPS only in production
                httpOnly: true, // Prevent XSS
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                sameSite: 'strict' // CSRF protection
            },
            name: 'sessionId' // Don't use default session name
        });
    }
    
    // Login user (session-based)
    static async login(req, res, next) {
        try {
            const { identifier, password } = req.body;
            
            // Find user
            const user = await User.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier }
                ],
                isActive: true
            }).select('+password');
            
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid credentials'
                });
            }
            
            // Create session
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.loginTime = new Date();
            
            // Update last login
            await user.updateLastLogin();
            
            res.json({
                success: true,
                data: {
                    user: user.toPublicJSON(),
                    sessionId: req.sessionID
                },
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }
    
    // Logout user (session-based)
    static logout(req, res, next) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            
            res.clearCookie('sessionId');
            res.json({
                success: true,
                message: 'Logout successful'
            });
        });
    }
    
    // Authentication middleware (session-based)
    static authenticate() {
        return async (req, res, next) => {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'Please log in to access this resource'
                    });
                }
                
                // Get user data
                const user = await User.findById(req.session.userId);
                if (!user || !user.isActive) {
                    req.session.destroy(() => {});
                    return res.status(401).json({
                        success: false,
                        error: 'Unauthorized',
                        message: 'User not found or inactive'
                    });
                }
                
                req.user = user;
                next();
            } catch (error) {
                next(error);
            }
        };
    }
    
    // Authorization middleware (session-based)
    static authorize(allowedRoles = []) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Authentication required'
                });
            }
            
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }
            
            next();
        };
    }
}

module.exports = SessionAuth;
```

### Authentication Routes

```javascript
// routes/auth.js - Authentication Routes
const express = require('express');
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/AuthService');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name is required and must be less than 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name is required and must be less than 50 characters')
];

const loginValidation = [
    body('identifier')
        .notEmpty()
        .withMessage('Email or username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character')
];

// Apply rate limiting to auth routes
router.use(AuthMiddleware.createAuthRateLimit());

// Register
router.post('/register', 
    registerValidation,
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const result = await AuthService.register(req.body);
            
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    expiresIn: result.tokens.expiresIn
                },
                message: 'Registration successful'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Login
router.post('/login',
    loginValidation,
    ValidationMiddleware.handleValidationErrors,
    AuthMiddleware.accountLockout(),
    async (req, res, next) => {
        try {
            const result = await AuthService.login(req.body);
            
            // Set refresh token as httpOnly cookie
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            res.json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                    expiresIn: result.tokens.expiresIn
                },
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Refresh token
router.post('/refresh', async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'Refresh token is required'
            });
        }
        
        const result = await AuthService.refreshAccessToken(refreshToken);
        
        // Update refresh token cookie if rotated
        if (result.refreshToken !== refreshToken) {
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }
        
        res.json({
            success: true,
            data: {
                accessToken: result.accessToken,
                expiresIn: result.expiresIn
            },
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        // Clear invalid refresh token
        res.clearCookie('refreshToken');
        next(error);
    }
});

// Logout
router.post('/logout',
    AuthMiddleware.optionalAuth(),
    async (req, res, next) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            
            await AuthService.logout(refreshToken);
            
            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Logout from all devices
router.post('/logout-all',
    AuthMiddleware.authenticate(),
    async (req, res, next) => {
        try {
            await AuthService.logoutAll(req.user._id);
            
            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            
            res.json({
                success: true,
                message: 'Logged out from all devices'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Change password
router.post('/change-password',
    AuthMiddleware.authenticate(),
    changePasswordValidation,
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            await AuthService.changePassword(req.user._id, currentPassword, newPassword);
            
            // Clear refresh token cookie to force re-login
            res.clearCookie('refreshToken');
            
            res.json({
                success: true,
                message: 'Password changed successfully. Please log in again.'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Request password reset
router.post('/forgot-password',
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { email } = req.body;
            
            const result = await AuthService.resetPassword(email);
            
            res.json({
                success: true,
                message: result.message,
                ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken })
            });
        } catch (error) {
            next(error);
        }
    }
);

// Confirm password reset
router.post('/reset-password',
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { resetToken, newPassword } = req.body;
            
            await AuthService.confirmPasswordReset(resetToken, newPassword);
            
            res.json({
                success: true,
                message: 'Password reset successfully. Please log in with your new password.'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get current user profile
router.get('/me',
    AuthMiddleware.authenticate(),
    (req, res) => {
        res.json({
            success: true,
            data: {
                user: req.user.toPublicJSON(),
                permissions: req.permissions,
                tokenInfo: {
                    issuedAt: new Date(req.token.iat * 1000),
                    expiresAt: new Date(req.token.exp * 1000)
                }
            }
        });
    }
);

// Verify token (for client-side validation)
router.post('/verify',
    AuthMiddleware.authenticate(),
    (req, res) => {
        res.json({
            success: true,
            data: {
                valid: true,
                user: req.user.toPublicJSON(),
                permissions: req.permissions
            },
            message: 'Token is valid'
        });
    }
);

module.exports = router;
```

## Real-World Use Case

### Multi-Factor Authentication (MFA)

```javascript
// services/MFAService.js - Multi-Factor Authentication
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');

class MFAService {
    // Generate TOTP secret for user
    async generateTOTPSecret(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const secret = speakeasy.generateSecret({
                name: `TaskApp (${user.email})`,
                issuer: 'TaskApp',
                length: 32
            });
            
            // Store secret temporarily (not activated until verified)
            user.mfa = {
                secret: secret.base32,
                enabled: false,
                backupCodes: this.generateBackupCodes()
            };
            
            await user.save();
            
            // Generate QR code
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
            
            return {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                backupCodes: user.mfa.backupCodes
            };
        } catch (error) {
            throw new Error(`MFA setup failed: ${error.message}`);
        }
    }
    
    // Verify and enable TOTP
    async enableTOTP(userId, token) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.mfa || !user.mfa.secret) {
                throw new Error('MFA not set up');
            }
            
            const verified = speakeasy.totp.verify({
                secret: user.mfa.secret,
                encoding: 'base32',
                token,
                window: 2 // Allow 2 time steps (60 seconds)
            });
            
            if (!verified) {
                throw new Error('Invalid verification code');
            }
            
            // Enable MFA
            user.mfa.enabled = true;
            await user.save();
            
            return {
                message: 'MFA enabled successfully',
                backupCodes: user.mfa.backupCodes
            };
        } catch (error) {
            throw new Error(`MFA verification failed: ${error.message}`);
        }
    }
    
    // Verify TOTP token
    async verifyTOTP(userId, token) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.mfa || !user.mfa.enabled) {
                throw new Error('MFA not enabled');
            }
            
            // Check if it's a backup code
            if (user.mfa.backupCodes.includes(token)) {
                // Remove used backup code
                user.mfa.backupCodes = user.mfa.backupCodes.filter(code => code !== token);
                await user.save();
                return true;
            }
            
            // Verify TOTP
            const verified = speakeasy.totp.verify({
                secret: user.mfa.secret,
                encoding: 'base32',
                token,
                window: 2
            });
            
            return verified;
        } catch (error) {
            throw new Error(`MFA verification failed: ${error.message}`);
        }
    }
    
    // Disable MFA
    async disableMFA(userId, password) {
        try {
            const user = await User.findById(userId).select('+password');
            if (!user) {
                throw new Error('User not found');
            }
            
            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }
            
            // Disable MFA
            user.mfa = {
                enabled: false,
                secret: null,
                backupCodes: []
            };
            
            await user.save();
            
            return { message: 'MFA disabled successfully' };
        } catch (error) {
            throw new Error(`MFA disable failed: ${error.message}`);
        }
    }
    
    // Generate backup codes
    generateBackupCodes(count = 10) {
        const codes = [];
        for (let i = 0; i < count; i++) {
            codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
        }
        return codes;
    }
    
    // Regenerate backup codes
    async regenerateBackupCodes(userId) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.mfa || !user.mfa.enabled) {
                throw new Error('MFA not enabled');
            }
            
            user.mfa.backupCodes = this.generateBackupCodes();
            await user.save();
            
            return {
                message: 'Backup codes regenerated',
                backupCodes: user.mfa.backupCodes
            };
        } catch (error) {
            throw new Error(`Backup code regeneration failed: ${error.message}`);
        }
    }
}

module.exports = new MFAService();
```

## Best Practices

### 1. Password Security

```javascript
// Use strong hashing with salt
const bcrypt = require('bcryptjs');
const saltRounds = 12; // Increase for better security

// Hash password
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. JWT Security

```javascript
// Use strong secrets and proper algorithms
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET, // Use strong, random secret
    {
        expiresIn: '15m', // Short expiry for access tokens
        algorithm: 'HS256', // Specify algorithm
        issuer: 'your-app',
        audience: 'your-users'
    }
);
```

### 3. Rate Limiting

```javascript
// Implement aggressive rate limiting for auth endpoints
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts'
});
```

### 4. Input Validation

```javascript
// Validate all authentication inputs
const { body } = require('express-validator');

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
];
```

### 5. Secure Headers

```javascript
// Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    }
}));
```

## Summary

Authentication and authorization are fundamental security components:

**Authentication Methods**:
- **JWT**: Stateless, scalable, cross-domain support
- **Sessions**: Server-side control, easy revocation
- **Multi-Factor**: Enhanced security with TOTP/backup codes
- **OAuth**: Third-party authentication integration

**Authorization Patterns**:
- **Role-Based Access Control (RBAC)**: Simple role hierarchy
- **Permission-Based**: Granular permission system
- **Resource Ownership**: User-specific resource access
- **Attribute-Based**: Context-aware authorization

**Security Best Practices**:
- Use strong password hashing (bcrypt with high salt rounds)
- Implement proper JWT security (strong secrets, short expiry)
- Apply rate limiting to authentication endpoints
- Validate and sanitize all inputs
- Use secure headers and HTTPS
- Implement account lockout mechanisms
- Log security events for monitoring

**Advanced Features**:
- Token refresh and rotation
- Multi-factor authentication
- Password reset flows
- Session management
- Device tracking
- Security event logging

Proper authentication and authorization implementation ensures application security while providing a smooth user experience. Next, we'll explore file upload and handling, building upon the secure foundation to manage user-generated content safely.