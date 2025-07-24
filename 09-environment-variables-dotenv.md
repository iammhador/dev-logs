# Environment Variables with dotenv

## Overview

Environment variables are key-value pairs that exist outside your application code and provide configuration data to your application at runtime. They are essential for managing different configurations across development, testing, and production environments without hardcoding sensitive information like API keys, database URLs, or server ports.

The `dotenv` package is a popular Node.js library that loads environment variables from a `.env` file into `process.env`, making it easy to manage configuration in development.

## Key Concepts

### What are Environment Variables?

Environment variables are:
- Configuration values stored outside your code
- Accessible through `process.env` in Node.js
- Different for each environment (dev, staging, production)
- Secure way to store sensitive information
- Platform-independent configuration method

### Why Use Environment Variables?

1. **Security**: Keep sensitive data out of source code
2. **Flexibility**: Different configs for different environments
3. **Portability**: Same code works across environments
4. **Best Practice**: Industry standard for configuration
5. **CI/CD**: Easy deployment configuration

### The dotenv Package

`dotenv` allows you to:
- Load variables from `.env` files
- Override system environment variables
- Support multiple environment files
- Provide default values
- Parse different data types

## Example Code

### Basic dotenv Setup

```javascript
// basic-dotenv.js
// Load dotenv as early as possible
require('dotenv').config();

const express = require('express');
const app = express();

// Access environment variables
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_KEY = process.env.API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

// Middleware
app.use(express.json());

// Environment info endpoint
app.get('/env-info', (req, res) => {
    res.json({
        environment: NODE_ENV,
        port: PORT,
        hasApiKey: !!API_KEY,
        hasDatabaseUrl: !!DATABASE_URL,
        nodeVersion: process.version,
        platform: process.platform,
        // Never expose sensitive values directly
        apiKeyLength: API_KEY ? API_KEY.length : 0
    });
});

// Configuration endpoint
app.get('/config', (req, res) => {
    const config = {
        server: {
            port: PORT,
            environment: NODE_ENV,
            debug: process.env.DEBUG === 'true'
        },
        features: {
            enableLogging: process.env.ENABLE_LOGGING !== 'false',
            maxUploadSize: process.env.MAX_UPLOAD_SIZE || '10mb',
            rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000
        },
        external: {
            hasApiKey: !!API_KEY,
            hasDatabase: !!DATABASE_URL,
            redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
        }
    };
    
    res.json(config);
});

// Health check with environment validation
app.get('/health', (req, res) => {
    const requiredVars = ['API_KEY', 'DATABASE_URL'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    const health = {
        status: missing.length === 0 ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        missingVariables: missing,
        uptime: process.uptime()
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔑 API Key: ${API_KEY ? 'Loaded' : 'Missing'}`);
    console.log(`🗄️  Database: ${DATABASE_URL ? 'Configured' : 'Missing'}`);
});
```

### Advanced dotenv Configuration

```javascript
// advanced-dotenv.js
const path = require('path');

// Custom dotenv configuration
require('dotenv').config({
    path: path.join(__dirname, '.env'), // Custom path
    debug: process.env.DEBUG_DOTENV === 'true', // Debug mode
    override: false // Don't override existing env vars
});

// Load environment-specific files
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFiles = [
    `.env.${NODE_ENV}.local`,
    `.env.${NODE_ENV}`,
    '.env.local',
    '.env'
];

// Load multiple env files in order of priority
envFiles.forEach(file => {
    require('dotenv').config({
        path: path.join(__dirname, file),
        override: false
    });
});

const express = require('express');
const app = express();

// Configuration class
class Config {
    constructor() {
        this.server = {
            port: this.getNumber('PORT', 3000),
            host: this.getString('HOST', 'localhost'),
            environment: this.getString('NODE_ENV', 'development')
        };
        
        this.database = {
            url: this.getString('DATABASE_URL'),
            maxConnections: this.getNumber('DB_MAX_CONNECTIONS', 10),
            timeout: this.getNumber('DB_TIMEOUT', 30000),
            ssl: this.getBoolean('DB_SSL', false)
        };
        
        this.redis = {
            url: this.getString('REDIS_URL'),
            ttl: this.getNumber('REDIS_TTL', 3600)
        };
        
        this.auth = {
            jwtSecret: this.getString('JWT_SECRET'),
            jwtExpiry: this.getString('JWT_EXPIRY', '24h'),
            bcryptRounds: this.getNumber('BCRYPT_ROUNDS', 12)
        };
        
        this.external = {
            apiKey: this.getString('API_KEY'),
            apiUrl: this.getString('API_URL', 'https://api.example.com'),
            webhookSecret: this.getString('WEBHOOK_SECRET')
        };
        
        this.features = {
            enableLogging: this.getBoolean('ENABLE_LOGGING', true),
            enableMetrics: this.getBoolean('ENABLE_METRICS', false),
            enableCache: this.getBoolean('ENABLE_CACHE', true),
            maxUploadSize: this.getString('MAX_UPLOAD_SIZE', '10mb')
        };
        
        this.security = {
            corsOrigin: this.getArray('CORS_ORIGIN', ['http://localhost:3000']),
            rateLimitWindow: this.getNumber('RATE_LIMIT_WINDOW', 900000),
            rateLimitMax: this.getNumber('RATE_LIMIT_MAX', 100)
        };
        
        // Validate required variables
        this.validate();
    }
    
    getString(key, defaultValue = undefined) {
        const value = process.env[key];
        if (value === undefined && defaultValue === undefined) {
            throw new Error(`Required environment variable ${key} is not set`);
        }
        return value || defaultValue;
    }
    
    getNumber(key, defaultValue = undefined) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
        }
        return parsed;
    }
    
    getBoolean(key, defaultValue = undefined) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        
        return value.toLowerCase() === 'true';
    }
    
    getArray(key, defaultValue = undefined) {
        const value = process.env[key];
        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`Required environment variable ${key} is not set`);
            }
            return defaultValue;
        }
        
        return value.split(',').map(item => item.trim());
    }
    
    validate() {
        const requiredVars = {
            production: ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'],
            development: ['DATABASE_URL'],
            test: []
        };
        
        const required = requiredVars[this.server.environment] || [];
        const missing = required.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
    
    // Get sanitized config for logging (no secrets)
    getSanitized() {
        return {
            server: this.server,
            database: {
                ...this.database,
                url: this.database.url ? '[CONFIGURED]' : '[NOT SET]'
            },
            redis: {
                ...this.redis,
                url: this.redis.url ? '[CONFIGURED]' : '[NOT SET]'
            },
            auth: {
                jwtExpiry: this.auth.jwtExpiry,
                bcryptRounds: this.auth.bcryptRounds,
                jwtSecret: this.auth.jwtSecret ? '[CONFIGURED]' : '[NOT SET]'
            },
            external: {
                apiUrl: this.external.apiUrl,
                apiKey: this.external.apiKey ? '[CONFIGURED]' : '[NOT SET]',
                webhookSecret: this.external.webhookSecret ? '[CONFIGURED]' : '[NOT SET]'
            },
            features: this.features,
            security: this.security
        };
    }
}

// Initialize configuration
const config = new Config();

app.use(express.json());

// Configuration endpoint
app.get('/api/config', (req, res) => {
    res.json({
        success: true,
        config: config.getSanitized()
    });
});

// Environment variables endpoint
app.get('/api/env', (req, res) => {
    // Only show non-sensitive environment info
    const envInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        environment: config.server.environment,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        loadedEnvFiles: envFiles.filter(file => {
            try {
                require('fs').accessSync(path.join(__dirname, file));
                return true;
            } catch {
                return false;
            }
        })
    };
    
    res.json({
        success: true,
        environment: envInfo
    });
});

// Feature flags endpoint
app.get('/api/features', (req, res) => {
    res.json({
        success: true,
        features: config.features
    });
});

// Validation endpoint
app.get('/api/validate', (req, res) => {
    try {
        // Re-validate configuration
        config.validate();
        
        res.json({
            success: true,
            message: 'Configuration is valid',
            environment: config.server.environment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(config.server.port, config.server.host, () => {
    console.log(`🚀 Server running on ${config.server.host}:${config.server.port}`);
    console.log(`📊 Environment: ${config.server.environment}`);
    console.log('📋 Configuration loaded successfully');
    
    if (config.server.environment === 'development') {
        console.log('🔧 Sanitized config:', JSON.stringify(config.getSanitized(), null, 2));
    }
});

// Export config for use in other modules
module.exports = config;
```

### Environment-Specific Configuration

```javascript
// config-manager.js
const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.loadEnvironmentFiles();
        this.config = this.buildConfig();
    }
    
    loadEnvironmentFiles() {
        const NODE_ENV = process.env.NODE_ENV || 'development';
        
        // Priority order: most specific to least specific
        const envFiles = [
            `.env.${NODE_ENV}.local`,
            `.env.local`,
            `.env.${NODE_ENV}`,
            '.env'
        ];
        
        console.log(`Loading environment files for: ${NODE_ENV}`);
        
        envFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            
            if (fs.existsSync(filePath)) {
                console.log(`✅ Loading ${file}`);
                require('dotenv').config({
                    path: filePath,
                    override: false // Don't override already set variables
                });
            } else {
                console.log(`⏭️  Skipping ${file} (not found)`);
            }
        });
    }
    
    buildConfig() {
        const env = process.env.NODE_ENV || 'development';
        
        const baseConfig = {
            app: {
                name: process.env.APP_NAME || 'My App',
                version: process.env.APP_VERSION || '1.0.0',
                environment: env,
                debug: this.parseBoolean(process.env.DEBUG, env === 'development')
            },
            
            server: {
                port: this.parseNumber(process.env.PORT, 3000),
                host: process.env.HOST || '0.0.0.0',
                timeout: this.parseNumber(process.env.SERVER_TIMEOUT, 30000),
                keepAliveTimeout: this.parseNumber(process.env.KEEP_ALIVE_TIMEOUT, 5000)
            },
            
            database: {
                url: process.env.DATABASE_URL,
                host: process.env.DB_HOST || 'localhost',
                port: this.parseNumber(process.env.DB_PORT, 5432),
                name: process.env.DB_NAME || 'myapp',
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD,
                ssl: this.parseBoolean(process.env.DB_SSL, env === 'production'),
                pool: {
                    min: this.parseNumber(process.env.DB_POOL_MIN, 2),
                    max: this.parseNumber(process.env.DB_POOL_MAX, 10),
                    idle: this.parseNumber(process.env.DB_POOL_IDLE, 10000)
                }
            },
            
            redis: {
                url: process.env.REDIS_URL,
                host: process.env.REDIS_HOST || 'localhost',
                port: this.parseNumber(process.env.REDIS_PORT, 6379),
                password: process.env.REDIS_PASSWORD,
                db: this.parseNumber(process.env.REDIS_DB, 0),
                ttl: this.parseNumber(process.env.REDIS_TTL, 3600)
            },
            
            auth: {
                jwtSecret: process.env.JWT_SECRET,
                jwtExpiry: process.env.JWT_EXPIRY || '24h',
                refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
                bcryptRounds: this.parseNumber(process.env.BCRYPT_ROUNDS, 12),
                sessionSecret: process.env.SESSION_SECRET,
                cookieMaxAge: this.parseNumber(process.env.COOKIE_MAX_AGE, 86400000)
            },
            
            email: {
                provider: process.env.EMAIL_PROVIDER || 'smtp',
                host: process.env.EMAIL_HOST,
                port: this.parseNumber(process.env.EMAIL_PORT, 587),
                secure: this.parseBoolean(process.env.EMAIL_SECURE, false),
                username: process.env.EMAIL_USERNAME,
                password: process.env.EMAIL_PASSWORD,
                from: process.env.EMAIL_FROM || 'noreply@example.com'
            },
            
            storage: {
                provider: process.env.STORAGE_PROVIDER || 'local',
                bucket: process.env.STORAGE_BUCKET,
                region: process.env.STORAGE_REGION,
                accessKey: process.env.STORAGE_ACCESS_KEY,
                secretKey: process.env.STORAGE_SECRET_KEY,
                uploadPath: process.env.UPLOAD_PATH || './uploads',
                maxFileSize: process.env.MAX_FILE_SIZE || '10mb'
            },
            
            logging: {
                level: process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug'),
                file: this.parseBoolean(process.env.LOG_TO_FILE, env === 'production'),
                console: this.parseBoolean(process.env.LOG_TO_CONSOLE, true),
                logPath: process.env.LOG_PATH || './logs'
            },
            
            security: {
                corsOrigin: this.parseArray(process.env.CORS_ORIGIN, ['http://localhost:3000']),
                rateLimitWindow: this.parseNumber(process.env.RATE_LIMIT_WINDOW, 900000),
                rateLimitMax: this.parseNumber(process.env.RATE_LIMIT_MAX, 100),
                helmetEnabled: this.parseBoolean(process.env.HELMET_ENABLED, true),
                csrfEnabled: this.parseBoolean(process.env.CSRF_ENABLED, env === 'production')
            },
            
            monitoring: {
                enabled: this.parseBoolean(process.env.MONITORING_ENABLED, env === 'production'),
                metricsPort: this.parseNumber(process.env.METRICS_PORT, 9090),
                healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health'
            }
        };
        
        // Environment-specific overrides
        return this.applyEnvironmentOverrides(baseConfig, env);
    }
    
    applyEnvironmentOverrides(config, env) {
        const overrides = {
            development: {
                database: {
                    ssl: false,
                    pool: { max: 5 }
                },
                logging: {
                    level: 'debug',
                    console: true,
                    file: false
                },
                security: {
                    corsOrigin: ['*'],
                    csrfEnabled: false
                }
            },
            
            test: {
                database: {
                    name: config.database.name + '_test',
                    pool: { max: 2 }
                },
                logging: {
                    level: 'error',
                    console: false,
                    file: false
                },
                auth: {
                    bcryptRounds: 1 // Faster for tests
                }
            },
            
            production: {
                server: {
                    host: '0.0.0.0'
                },
                database: {
                    ssl: true
                },
                logging: {
                    level: 'info',
                    console: false,
                    file: true
                },
                security: {
                    csrfEnabled: true,
                    helmetEnabled: true
                },
                monitoring: {
                    enabled: true
                }
            }
        };
        
        const envOverrides = overrides[env] || {};
        return this.deepMerge(config, envOverrides);
    }
    
    parseBoolean(value, defaultValue = false) {
        if (value === undefined) return defaultValue;
        return value.toLowerCase() === 'true';
    }
    
    parseNumber(value, defaultValue = 0) {
        if (value === undefined) return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    
    parseArray(value, defaultValue = []) {
        if (value === undefined) return defaultValue;
        return value.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    validate() {
        const requiredByEnv = {
            production: [
                'JWT_SECRET',
                'DATABASE_URL',
                'SESSION_SECRET'
            ],
            development: [
                'DATABASE_URL'
            ],
            test: []
        };
        
        const required = requiredByEnv[this.config.app.environment] || [];
        const missing = required.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables for ${this.config.app.environment}: ${missing.join(', ')}`);
        }
        
        // Additional validation
        if (this.config.server.port < 1 || this.config.server.port > 65535) {
            throw new Error('PORT must be between 1 and 65535');
        }
        
        if (this.config.auth.bcryptRounds < 1 || this.config.auth.bcryptRounds > 20) {
            throw new Error('BCRYPT_ROUNDS must be between 1 and 20');
        }
    }
    
    getSanitized() {
        const sanitized = JSON.parse(JSON.stringify(this.config));
        
        // Remove sensitive data
        const sensitiveKeys = [
            'password', 'secret', 'key', 'token', 'auth', 'credential'
        ];
        
        const sanitize = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                } else if (typeof obj[key] === 'string' && 
                          sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                    obj[key] = obj[key] ? '[CONFIGURED]' : '[NOT SET]';
                }
            }
        };
        
        sanitize(sanitized);
        return sanitized;
    }
    
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }
}

// Usage example
const configManager = new ConfigManager();
configManager.validate();

module.exports = configManager.config;
module.exports.manager = configManager;
```

### Sample .env Files

```bash
# .env (base configuration)
APP_NAME=My Express App
APP_VERSION=1.0.0
NODE_ENV=development

# Server Configuration
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/myapp
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Storage Configuration
STORAGE_PROVIDER=local
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10mb

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_TO_CONSOLE=true
LOG_TO_FILE=false

# Features
ENABLE_LOGGING=true
ENABLE_METRICS=false
DEBUG=true
```

```bash
# .env.development (development overrides)
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug

# Development database
DATABASE_URL=postgresql://dev:dev@localhost:5432/myapp_dev
DB_SSL=false

# Disable security features for development
CSRF_ENABLED=false
CORS_ORIGIN=*

# Development email (use local service)
EMAIL_HOST=localhost
EMAIL_PORT=1025
```

```bash
# .env.production (production overrides)
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# Production server
PORT=8080
HOST=0.0.0.0

# Production database with SSL
DB_SSL=true
DB_POOL_MAX=20

# Enable all security features
CSRF_ENABLED=true
HELMET_ENABLED=true

# Production logging
LOG_TO_CONSOLE=false
LOG_TO_FILE=true

# Monitoring
MONITORING_ENABLED=true
METRICS_PORT=9090
```

```bash
# .env.test (test environment)
NODE_ENV=test
DEBUG=false
LOG_LEVEL=error

# Test database
DATABASE_URL=postgresql://test:test@localhost:5432/myapp_test
DB_POOL_MAX=2

# Fast bcrypt for tests
BCRYPT_ROUNDS=1

# Disable logging in tests
LOG_TO_CONSOLE=false
LOG_TO_FILE=false

# Test-specific settings
JWT_EXPIRY=1h
RATE_LIMIT_MAX=1000
```

## Real-World Use Case

### Complete Application with Environment Configuration

```javascript
// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const logger = require('./utils/logger');

const app = express();

// Security middleware
if (config.security.helmetEnabled) {
    app.use(helmet());
}

// CORS configuration
app.use(cors({
    origin: config.security.corsOrigin,
    credentials: true
}));

// Rate limiting
if (config.security.rateLimitMax > 0) {
    const limiter = rateLimit({
        windowMs: config.security.rateLimitWindow,
        max: config.security.rateLimitMax,
        message: {
            error: 'Too many requests',
            retryAfter: Math.ceil(config.security.rateLimitWindow / 1000)
        }
    });
    app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: config.storage.maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: config.storage.maxFileSize }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id
    });
    next();
});

// Health check endpoint
app.get(config.monitoring.healthCheckPath, (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.app.environment,
        version: config.app.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        config: {
            database: config.database.url ? 'connected' : 'not configured',
            redis: config.redis.url ? 'connected' : 'not configured',
            email: config.email.host ? 'configured' : 'not configured'
        }
    };
    
    res.json(health);
});

// Configuration endpoint (development only)
if (config.app.environment === 'development') {
    app.get('/api/config', (req, res) => {
        const { manager } = require('./config/config');
        res.json({
            success: true,
            config: manager.getSanitized()
        });
    });
}

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Error handling
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: config.app.environment === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const server = app.listen(config.server.port, config.server.host, () => {
    logger.info(`🚀 ${config.app.name} v${config.app.version} started`, {
        port: config.server.port,
        host: config.server.host,
        environment: config.app.environment,
        nodeVersion: process.version
    });
});

// Set server timeouts
server.timeout = config.server.timeout;
server.keepAliveTimeout = config.server.keepAliveTimeout;

module.exports = app;
```

## Best Practices

### 1. Never Commit .env Files
```bash
# .gitignore
.env
.env.local
.env.*.local
.env.development
.env.production
.env.test

# But commit example files
!.env.example
```

### 2. Provide .env.example
```bash
# .env.example
# Copy this file to .env and fill in your values

# Application
APP_NAME=My App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database

# Authentication
JWT_SECRET=your-secret-key-here

# Email
EMAIL_HOST=smtp.example.com
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-password
```

### 3. Validate Environment Variables
```javascript
const requiredEnvVars = {
    production: ['DATABASE_URL', 'JWT_SECRET', 'EMAIL_PASSWORD'],
    development: ['DATABASE_URL'],
    test: []
};

const validateEnv = () => {
    const env = process.env.NODE_ENV || 'development';
    const required = requiredEnvVars[env] || [];
    const missing = required.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
```

### 4. Use Type Conversion
```javascript
const config = {
    port: parseInt(process.env.PORT) || 3000,
    debug: process.env.DEBUG === 'true',
    maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 10,
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
};
```

### 5. Environment-Specific Loading
```javascript
const loadEnvFiles = () => {
    const env = process.env.NODE_ENV || 'development';
    const files = [
        `.env.${env}.local`,
        `.env.local`,
        `.env.${env}`,
        '.env'
    ];
    
    files.forEach(file => {
        require('dotenv').config({ path: file, override: false });
    });
};
```

## Summary

Environment variables with dotenv provide:

**Configuration Management**:
- Separate config from code
- Environment-specific settings
- Secure handling of sensitive data
- Easy deployment configuration

**Best Practices**:
- Use `.env.example` for documentation
- Validate required variables
- Convert types appropriately
- Never commit actual `.env` files
- Use environment-specific files

**Advanced Features**:
- Configuration classes with validation
- Type conversion and defaults
- Sanitized config for logging
- Environment-specific overrides
- Graceful error handling

**Security Considerations**:
- Keep secrets out of source code
- Use different secrets per environment
- Implement proper access controls
- Log configuration without exposing secrets

Mastering environment variables is crucial for building maintainable, secure, and deployable applications. Next, we'll explore Express Router and modular route management for organizing larger applications.