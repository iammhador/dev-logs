# Chapter 18: Testing Express.js Applications

Testing is a crucial aspect of building reliable and maintainable Express.js applications. This chapter covers comprehensive testing strategies, from unit tests to end-to-end testing, ensuring your applications work correctly and can be confidently deployed to production.

## Overview of Testing Types

### 1. Unit Testing
Testing individual components (functions, classes, modules) in isolation.

### 2. Integration Testing
Testing how different parts of your application work together.

### 3. End-to-End (E2E) Testing
Testing complete user workflows from start to finish.

### 4. API Testing
Testing HTTP endpoints and their responses.

### 5. Performance Testing
Testing application performance under various loads.

## Testing Frameworks and Tools

### Popular Testing Frameworks
- **Jest**: Feature-rich testing framework with built-in mocking
- **Mocha**: Flexible testing framework with various assertion libraries
- **Chai**: Assertion library that pairs well with Mocha
- **Supertest**: HTTP assertion library for testing Express applications
- **Sinon**: Standalone test spies, stubs, and mocks
- **Artillery**: Load testing toolkit

## Setting Up the Testing Environment

### Package.json Configuration

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:load": "artillery run artillery-config.yml"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "sinon": "^15.0.0",
    "mongodb-memory-server": "^8.12.0",
    "artillery": "^2.0.0",
    "faker": "^6.6.6"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true
};
```

### Global Test Setup

```javascript
// tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Test utilities
global.createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  };
  
  const user = new User({ ...defaultUser, ...userData });
  await user.save();
  return user;
};

global.generateAuthToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};
```

## Unit Testing

### Testing Models

```javascript
// tests/unit/models/User.test.js
const User = require('../../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });
    
    it('should hash password before saving', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      
      await user.save();
      
      const isValidPassword = await bcrypt.compare('password123', user.password);
      expect(isValidPassword).toBe(true);
    });
    
    it('should not allow duplicate emails', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123'
      };
      
      await User.create(userData);
      
      const duplicateUser = new User({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password456'
      });
      
      await expect(duplicateUser.save()).rejects.toThrow();
    });
    
    it('should require all mandatory fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });
  });
  
  describe('Instance Methods', () => {
    let user;
    
    beforeEach(async () => {
      user = await createTestUser();
    });
    
    it('should compare passwords correctly', async () => {
      const isValid = await user.comparePassword('password123');
      const isInvalid = await user.comparePassword('wrongpassword');
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
    
    it('should generate auth token', () => {
      const token = user.generateAuthToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
    
    it('should return user profile without sensitive data', () => {
      const profile = user.toProfile();
      
      expect(profile.password).toBeUndefined();
      expect(profile.__v).toBeUndefined();
      expect(profile.username).toBe(user.username);
      expect(profile.email).toBe(user.email);
    });
  });
  
  describe('Static Methods', () => {
    it('should find user by credentials', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      await User.create(userData);
      
      const foundUser = await User.findByCredentials('test@example.com', 'password123');
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
      
      await expect(
        User.findByCredentials('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Testing Services

```javascript
// tests/unit/services/UserService.test.js
const UserService = require('../../../src/services/UserService');
const User = require('../../../src/models/User');
const sinon = require('sinon');

describe('UserService', () => {
  let userService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'user123',
        ...userData,
        toProfile: () => ({ _id: 'user123', username: 'testuser', email: 'test@example.com' })
      };
      
      const createStub = sinon.stub(User, 'create').resolves(mockUser);
      
      const result = await userService.createUser(userData);
      
      expect(createStub.calledOnceWith(userData)).toBe(true);
      expect(result._id).toBe('user123');
    });
    
    it('should handle duplicate email error', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const duplicateError = new Error('Duplicate email');
      duplicateError.code = 11000;
      
      sinon.stub(User, 'create').rejects(duplicateError);
      
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });
  });
  
  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 'user123';
      const mockUser = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      const findByIdStub = sinon.stub(User, 'findById').resolves(mockUser);
      
      const result = await userService.getUserById(userId);
      
      expect(findByIdStub.calledOnceWith(userId)).toBe(true);
      expect(result._id).toBe(userId);
    });
    
    it('should throw error when user not found', async () => {
      const userId = 'nonexistent';
      
      sinon.stub(User, 'findById').resolves(null);
      
      await expect(userService.getUserById(userId))
        .rejects.toThrow('User not found');
    });
  });
  
  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user123';
      const updateData = { username: 'updateduser' };
      const mockUpdatedUser = {
        _id: userId,
        username: 'updateduser',
        email: 'test@example.com'
      };
      
      const findByIdAndUpdateStub = sinon.stub(User, 'findByIdAndUpdate')
        .resolves(mockUpdatedUser);
      
      const result = await userService.updateUser(userId, updateData);
      
      expect(findByIdAndUpdateStub.calledOnceWith(
        userId,
        updateData,
        { new: true, runValidators: true }
      )).toBe(true);
      expect(result.username).toBe('updateduser');
    });
  });
  
  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';
      const mockDeletedUser = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      const findByIdAndDeleteStub = sinon.stub(User, 'findByIdAndDelete')
        .resolves(mockDeletedUser);
      
      const result = await userService.deleteUser(userId);
      
      expect(findByIdAndDeleteStub.calledOnceWith(userId)).toBe(true);
      expect(result._id).toBe(userId);
    });
  });
  
  describe('getUsersWithPagination', () => {
    it('should return paginated users', async () => {
      const options = { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' };
      const mockUsers = [
        { _id: 'user1', username: 'user1' },
        { _id: 'user2', username: 'user2' }
      ];
      
      const countStub = sinon.stub(User, 'countDocuments').resolves(25);
      const findStub = sinon.stub(User, 'find').returns({
        sort: sinon.stub().returns({
          skip: sinon.stub().returns({
            limit: sinon.stub().resolves(mockUsers)
          })
        })
      });
      
      const result = await userService.getUsersWithPagination(options);
      
      expect(result.users).toEqual(mockUsers);
      expect(result.totalUsers).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(result.currentPage).toBe(1);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });
  });
});
```

### Testing Middleware

```javascript
// tests/unit/middleware/auth.test.js
const authMiddleware = require('../../../src/middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../../src/models/User');
const sinon = require('sinon');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      header: sinon.stub(),
      user: null
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    next = sinon.stub();
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('Authentication', () => {
    it('should authenticate user with valid token', async () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      const mockUser = { _id: userId, username: 'testuser' };
      
      req.header.withArgs('Authorization').returns(`Bearer ${token}`);
      sinon.stub(User, 'findById').resolves(mockUser);
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(req.user).toEqual(mockUser);
      expect(next.calledOnce).toBe(true);
    });
    
    it('should reject request without token', async () => {
      req.header.withArgs('Authorization').returns(null);
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).toBe(true);
      expect(res.json.calledWith({ message: 'Access denied. No token provided.' })).toBe(true);
      expect(next.called).toBe(false);
    });
    
    it('should reject request with invalid token', async () => {
      req.header.withArgs('Authorization').returns('Bearer invalidtoken');
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).toBe(true);
      expect(res.json.calledWith({ message: 'Invalid token.' })).toBe(true);
      expect(next.called).toBe(false);
    });
    
    it('should reject request when user not found', async () => {
      const userId = 'nonexistent';
      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      
      req.header.withArgs('Authorization').returns(`Bearer ${token}`);
      sinon.stub(User, 'findById').resolves(null);
      
      await authMiddleware.authenticate(req, res, next);
      
      expect(res.status.calledWith(401)).toBe(true);
      expect(res.json.calledWith({ message: 'User not found.' })).toBe(true);
      expect(next.called).toBe(false);
    });
  });
  
  describe('Authorization', () => {
    beforeEach(() => {
      req.user = { _id: 'user123', role: 'user' };
    });
    
    it('should allow access for authorized role', () => {
      const authorizeRole = authMiddleware.authorize(['user', 'admin']);
      
      authorizeRole(req, res, next);
      
      expect(next.calledOnce).toBe(true);
    });
    
    it('should deny access for unauthorized role', () => {
      const authorizeRole = authMiddleware.authorize(['admin']);
      
      authorizeRole(req, res, next);
      
      expect(res.status.calledWith(403)).toBe(true);
      expect(res.json.calledWith({ message: 'Insufficient permissions.' })).toBe(true);
      expect(next.called).toBe(false);
    });
  });
});
```

## Integration Testing

### Testing API Endpoints

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeTruthy();
    });
    
    it('should not register user with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should not register user with duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      await User.create(userData);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password456'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    let user;
    
    beforeEach(async () => {
      user = await createTestUser();
    });
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(user.email);
    });
    
    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
  
  describe('GET /api/auth/profile', () => {
    let user, token;
    
    beforeEach(async () => {
      user = await createTestUser();
      token = generateAuthToken(user._id);
    });
    
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user.password).toBeUndefined();
    });
    
    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });
  
  describe('POST /api/auth/refresh-token', () => {
    let user, refreshToken;
    
    beforeEach(async () => {
      user = await createTestUser();
      refreshToken = 'valid-refresh-token';
      // Assume refresh token is stored in database
    });
    
    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
    
    it('should not refresh token with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid refresh token');
    });
  });
});
```

### Testing User Endpoints

```javascript
// tests/integration/users.test.js
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('User Endpoints', () => {
  let adminUser, regularUser, adminToken, userToken;
  
  beforeEach(async () => {
    adminUser = await createTestUser({
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    });
    
    regularUser = await createTestUser({
      username: 'user',
      email: 'user@example.com',
      role: 'user'
    });
    
    adminToken = generateAuthToken(adminUser._id, 'admin');
    userToken = generateAuthToken(regularUser._id, 'user');
  });
  
  describe('GET /api/users', () => {
    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });
    
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
    
    it('should support filtering', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].role).toBe('admin');
    });
    
    it('should support searching', async () => {
      const response = await request(app)
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.data.users).toHaveLength(1);
      expect(response.body.data.users[0].username).toBe('admin');
    });
    
    it('should deny access for regular users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions.');
    });
  });
  
  describe('GET /api/users/:id', () => {
    it('should get user by id for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(regularUser._id.toString());
    });
    
    it('should allow users to get their own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(regularUser._id.toString());
    });
    
    it('should deny access to other users profile for regular users', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/users/:id', () => {
    it('should update user for admin', async () => {
      const updateData = { username: 'updateduser' };
      
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('updateduser');
    });
    
    it('should validate update data', async () => {
      const invalidData = { email: 'invalid-email' };
      
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('DELETE /api/users/:id', () => {
    it('should delete user for admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      
      const deletedUser = await User.findById(regularUser._id);
      expect(deletedUser).toBeNull();
    });
    
    it('should deny deletion for regular users', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
    });
  });
});
```

## Error Handling Testing

```javascript
// tests/integration/errorHandling.test.js
const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

describe('Error Handling', () => {
  describe('404 Errors', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });
  });
  
  describe('Validation Errors', () => {
    it('should handle Mongoose validation errors', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: '',
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
    
    it('should handle express-validator errors', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: ''
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
  
  describe('Database Errors', () => {
    it('should handle invalid ObjectId', async () => {
      const token = generateAuthToken('validUserId', 'admin');
      
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid ID format');
    });
    
    it('should handle duplicate key errors', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
  
  describe('Internal Server Errors', () => {
    it('should handle unexpected errors gracefully', async () => {
      // This would require mocking a service to throw an error
      // Implementation depends on your specific error handling setup
    });
  });
});
```

## End-to-End Testing

```javascript
// tests/e2e/userJourney.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('User Journey E2E', () => {
  let userToken, userId;
  
  it('should complete full user workflow', async () => {
    // 1. Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'journeyuser',
        email: 'journey@example.com',
        password: 'password123'
      })
      .expect(201);
    
    expect(registerResponse.body.success).toBe(true);
    userToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user._id;
    
    // 2. Access protected profile
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    
    expect(profileResponse.body.data.user.email).toBe('journey@example.com');
    
    // 3. Update profile
    const updateResponse = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        username: 'updatedjourney'
      })
      .expect(200);
    
    expect(updateResponse.body.data.user.username).toBe('updatedjourney');
    
    // 4. Change password
    const passwordResponse = await request(app)
      .put('/api/auth/change-password')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      })
      .expect(200);
    
    expect(passwordResponse.body.success).toBe(true);
    
    // 5. Logout
    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    
    expect(logoutResponse.body.success).toBe(true);
    
    // 6. Login with new password
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'journey@example.com',
        password: 'newpassword123'
      })
      .expect(200);
    
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.token).toBeDefined();
  });
});

// tests/e2e/authFlow.test.js
describe('Authentication Flow E2E', () => {
  let refreshToken;
  
  it('should handle complete auth flow with refresh tokens', async () => {
    // 1. Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'authuser',
        email: 'auth@example.com',
        password: 'password123'
      })
      .expect(201);
    
    const initialToken = registerResponse.body.data.token;
    refreshToken = registerResponse.body.data.refreshToken;
    
    // 2. Use initial token
    await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${initialToken}`)
      .expect(200);
    
    // 3. Refresh token
    const refreshResponse = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);
    
    const newToken = refreshResponse.body.data.token;
    const newRefreshToken = refreshResponse.body.data.refreshToken;
    
    // 4. Use new token
    await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200);
    
    // 5. Old refresh token should be invalid
    await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(401);
    
    // 6. New refresh token should work
    await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: newRefreshToken })
      .expect(200);
  });
});
```

## Performance Testing

### Artillery Configuration

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "User Registration and Login"
    weight: 30
    flow:
      - post:
          url: "/api/auth/register"
          json:
            username: "user{{ $randomString() }}"
            email: "{{ $randomString() }}@example.com"
            password: "password123"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomString() }}@example.com"
            password: "password123"

  - name: "Authenticated User Actions"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.token"
              as: "authToken"
      - get:
          url: "/api/auth/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/api/users?page=1&limit=10"
          headers:
            Authorization: "Bearer {{ authToken }}"
```

### Load Testing Script

```javascript
// tests/performance/loadTest.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class LoadTester {
  constructor() {
    this.resultsDir = path.join(__dirname, 'results');
    this.ensureResultsDir();
  }
  
  ensureResultsDir() {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }
  
  async runLoadTest(configFile = 'artillery-config.yml') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.resultsDir, `report-${timestamp}.json`);
    const htmlReport = path.join(this.resultsDir, `report-${timestamp}.html`);
    
    return new Promise((resolve, reject) => {
      const command = `artillery run ${configFile} --output ${reportFile}`;
      
      console.log('Starting load test...');
      console.log(`Command: ${command}`);
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Load test failed:', error);
          reject(error);
          return;
        }
        
        console.log('Load test completed');
        console.log(stdout);
        
        // Generate HTML report
        exec(`artillery report ${reportFile} --output ${htmlReport}`, (reportError) => {
          if (reportError) {
            console.warn('Failed to generate HTML report:', reportError);
          } else {
            console.log(`HTML report generated: ${htmlReport}`);
          }
          
          this.analyzeResults(reportFile)
            .then(analysis => resolve({ reportFile, htmlReport, analysis }))
            .catch(reject);
        });
      });
    });
  }
  
  async analyzeResults(reportFile) {
    try {
      const data = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      const aggregate = data.aggregate;
      
      const analysis = {
        summary: {
          scenariosLaunched: aggregate.scenariosCreated,
          scenariosCompleted: aggregate.scenariosCompleted,
          requestsCompleted: aggregate.requestsCompleted,
          rps: aggregate.rps?.mean || 0,
          latency: {
            min: aggregate.latency?.min || 0,
            max: aggregate.latency?.max || 0,
            median: aggregate.latency?.median || 0,
            p95: aggregate.latency?.p95 || 0,
            p99: aggregate.latency?.p99 || 0
          },
          errors: aggregate.errors || {}
        },
        assertions: this.performAssertions(aggregate)
      };
      
      console.log('\n=== Load Test Analysis ===');
      console.log(`Scenarios Launched: ${analysis.summary.scenariosLaunched}`);
      console.log(`Scenarios Completed: ${analysis.summary.scenariosCompleted}`);
      console.log(`Requests Completed: ${analysis.summary.requestsCompleted}`);
      console.log(`Average RPS: ${analysis.summary.rps.toFixed(2)}`);
      console.log(`Latency P95: ${analysis.summary.latency.p95}ms`);
      console.log(`Latency P99: ${analysis.summary.latency.p99}ms`);
      
      if (Object.keys(analysis.summary.errors).length > 0) {
        console.log('\nErrors:');
        Object.entries(analysis.summary.errors).forEach(([error, count]) => {
          console.log(`  ${error}: ${count}`);
        });
      }
      
      console.log('\n=== Assertions ===');
      analysis.assertions.forEach(assertion => {
        const status = assertion.passed ? '✓' : '✗';
        console.log(`${status} ${assertion.description}`);
      });
      
      return analysis;
    } catch (error) {
      console.error('Failed to analyze results:', error);
      throw error;
    }
  }
  
  performAssertions(aggregate) {
    const assertions = [];
    
    // Response time assertions
    assertions.push({
      description: 'P95 response time should be under 500ms',
      passed: (aggregate.latency?.p95 || Infinity) < 500
    });
    
    assertions.push({
      description: 'P99 response time should be under 1000ms',
      passed: (aggregate.latency?.p99 || Infinity) < 1000
    });
    
    // Error rate assertions
    const totalRequests = aggregate.requestsCompleted || 0;
    const totalErrors = Object.values(aggregate.errors || {}).reduce((sum, count) => sum + count, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    assertions.push({
      description: 'Error rate should be under 1%',
      passed: errorRate < 1
    });
    
    // Throughput assertions
    assertions.push({
      description: 'Average RPS should be at least 10',
      passed: (aggregate.rps?.mean || 0) >= 10
    });
    
    return assertions;
  }
}

// Run load test if called directly
if (require.main === module) {
  const tester = new LoadTester();
  
  tester.runLoadTest()
    .then(results => {
      console.log('\nLoad test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Load test failed:', error);
      process.exit(1);
    });
}

module.exports = LoadTester;
```

## Test Automation and CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
        mongodb-version: [5.0, 6.0]
    
    services:
      mongodb:
        image: mongo:${{ matrix.mongodb-version }}
        ports:
          - 27017:27017
        options: >-
          --health-cmd mongo
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
    
    - name: Run performance tests
      run: npm run test:load
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
    
    - name: Run security audit
      run: npm audit --audit-level moderate
    
    - name: Generate coverage report
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

### Package.json Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "test:load": "node tests/performance/loadTest.js",
    "test:security": "npm audit && snyk test",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix"
  }
}
```

### Docker Test Environment

```dockerfile
# Dockerfile.test
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=dev

# Copy source code
COPY . .

# Run tests
CMD ["npm", "run", "test:all"]
```

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  app-test:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - MONGODB_URI=mongodb://mongo-test:27017/test
    depends_on:
      - mongo-test
    volumes:
      - ./coverage:/app/coverage
  
  mongo-test:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_DATABASE=test
    ports:
      - "27017:27017"
```

## Test Utilities and Helpers

### Custom Jest Matchers

```javascript
// tests/utils/customMatchers.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

expect.extend({
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false
      };
    }
  },
  
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false
      };
    }
  },
  
  toBeValidJWT(received) {
    try {
      jwt.decode(received);
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true
      };
    } catch (error) {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false
      };
    }
  },
  
  toBeWithinTimeRange(received, expectedTime, toleranceMs = 1000) {
    const receivedTime = new Date(received).getTime();
    const expectedTimeMs = new Date(expectedTime).getTime();
    const diff = Math.abs(receivedTime - expectedTimeMs);
    const pass = diff <= toleranceMs;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be within ${toleranceMs}ms of ${expectedTime}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within ${toleranceMs}ms of ${expectedTime}`,
        pass: false
      };
    }
  }
});
```

### Test Data Factory

```javascript
// tests/utils/testDataFactory.js
const faker = require('faker');
const mongoose = require('mongoose');

class TestDataFactory {
  static generateUser(overrides = {}) {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'password123',
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      role: 'user',
      isActive: true,
      ...overrides
    };
  }
  
  static generateUsers(count = 5, overrides = {}) {
    return Array.from({ length: count }, () => this.generateUser(overrides));
  }
  
  static generateTask(overrides = {}) {
    return {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      status: faker.random.arrayElement(['pending', 'in-progress', 'completed']),
      priority: faker.random.arrayElement(['low', 'medium', 'high']),
      dueDate: faker.date.future(),
      tags: faker.random.arrayElements(['work', 'personal', 'urgent', 'important'], 2),
      ...overrides
    };
  }
  
  static generateTasks(count = 10, overrides = {}) {
    return Array.from({ length: count }, () => this.generateTask(overrides));
  }
  
  static generateFile(overrides = {}) {
    return {
      filename: faker.system.fileName(),
      originalName: faker.system.fileName(),
      mimetype: faker.system.mimeType(),
      size: faker.datatype.number({ min: 1000, max: 1000000 }),
      path: faker.system.filePath(),
      uploadedBy: new mongoose.Types.ObjectId(),
      ...overrides
    };
  }
  
  static generateApiResponse(data = {}, success = true) {
    return {
      success,
      message: success ? 'Operation successful' : 'Operation failed',
      data: success ? data : null,
      error: success ? null : 'Something went wrong',
      timestamp: new Date().toISOString()
    };
  }
  
  static generatePaginationData(totalItems = 100, page = 1, limit = 10) {
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}

module.exports = TestDataFactory;
```

### Database Test Helpers

```javascript
// tests/utils/databaseHelpers.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Task = require('../../src/models/Task');
const TestDataFactory = require('./testDataFactory');

class DatabaseTestHelpers {
  static async clearDatabase() {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
  
  static async seedUsers(count = 5, overrides = {}) {
    const userData = TestDataFactory.generateUsers(count, overrides);
    return await User.insertMany(userData);
  }
  
  static async seedTasks(count = 10, userId = null, overrides = {}) {
    const taskData = TestDataFactory.generateTasks(count, {
      assignedTo: userId || new mongoose.Types.ObjectId(),
      ...overrides
    });
    return await Task.insertMany(taskData);
  }
  
  static async createTestUserWithTasks(userOverrides = {}, taskCount = 5, taskOverrides = {}) {
    const user = await User.create(TestDataFactory.generateUser(userOverrides));
    const tasks = await this.seedTasks(taskCount, user._id, taskOverrides);
    
    return { user, tasks };
  }
  
  static async createIndexes() {
    // Ensure all indexes are created for testing
    await User.createIndexes();
    await Task.createIndexes();
  }
  
  static async getCollectionStats(collectionName) {
    const collection = mongoose.connection.collection(collectionName);
    return await collection.stats();
  }
  
  static async dropCollection(collectionName) {
    try {
      await mongoose.connection.collection(collectionName).drop();
    } catch (error) {
      // Collection might not exist
      if (error.code !== 26) {
        throw error;
      }
    }
  }
}

module.exports = DatabaseTestHelpers;
```

## Best Practices

### Test Organization
- **Separate test types**: Keep unit, integration, and E2E tests in separate directories
- **Mirror source structure**: Organize test files to mirror your source code structure
- **Descriptive naming**: Use clear, descriptive names for test files and test cases
- **Group related tests**: Use `describe` blocks to group related functionality

### Test Data Management
- **Use factories**: Create test data using factory functions for consistency
- **Clean up**: Always clean up test data after each test
- **Isolation**: Ensure tests don't depend on each other
- **Realistic data**: Use realistic test data that represents actual usage

### Mocking and Stubbing
- **Mock external services**: Always mock external APIs and services
- **Stub database calls**: Use stubs for database operations in unit tests
- **Restore mocks**: Always restore mocks and stubs after tests
- **Minimal mocking**: Only mock what's necessary for the test

### Async Testing
- **Use async/await**: Prefer async/await over promises and callbacks
- **Handle errors**: Test both success and error scenarios
- **Timeout handling**: Set appropriate timeouts for async operations
- **Race conditions**: Be aware of potential race conditions in tests

### Performance Testing
- **Set realistic thresholds**: Use realistic performance expectations
- **Test with real data volumes**: Use appropriate data sizes for testing
- **Monitor resources**: Track memory and CPU usage during tests
- **Gradual load increase**: Gradually increase load to find breaking points

### Code Coverage
- **Aim for high coverage**: Target 80%+ code coverage
- **Quality over quantity**: Focus on meaningful tests, not just coverage numbers
- **Cover edge cases**: Test error conditions and edge cases
- **Review uncovered code**: Regularly review uncovered code paths

### CI/CD Integration
- **Automate all tests**: Run all test types in CI/CD pipeline
- **Fast feedback**: Ensure tests run quickly for fast feedback
- **Fail fast**: Stop builds on test failures
- **Parallel execution**: Run tests in parallel when possible

### Security Testing
- **Input validation**: Test all input validation thoroughly
- **Authentication**: Test authentication and authorization flows
- **SQL injection**: Test for SQL injection vulnerabilities
- **XSS protection**: Test for cross-site scripting vulnerabilities

### Documentation
- **Document test scenarios**: Clearly document what each test is testing
- **Maintain test documentation**: Keep test documentation up to date
- **Share knowledge**: Document testing patterns and practices for the team
- **Test reports**: Generate and review test reports regularly

## Common Testing Patterns

### AAA Pattern (Arrange, Act, Assert)

```javascript
it('should create user with valid data', async () => {
  // Arrange
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
  
  // Act
  const user = await userService.createUser(userData);
  
  // Assert
  expect(user.username).toBe(userData.username);
  expect(user.email).toBe(userData.email);
});
```

### Test Doubles Pattern

```javascript
// Stub
const userStub = sinon.stub(User, 'findById').resolves(mockUser);

// Mock
const emailMock = sinon.mock(emailService);
emailMock.expects('sendEmail').once().returns(Promise.resolve());

// Spy
const logSpy = sinon.spy(console, 'log');
```

### Page Object Pattern (for E2E tests)

```javascript
class LoginPage {
  constructor(request, app) {
    this.request = request;
    this.app = app;
  }
  
  async login(email, password) {
    return await this.request(this.app)
      .post('/api/auth/login')
      .send({ email, password });
  }
  
  async register(userData) {
    return await this.request(this.app)
      .post('/api/auth/register')
      .send(userData);
  }
}
```

## Troubleshooting Common Issues

### Memory Leaks in Tests

```javascript
// Problem: Not closing database connections
afterAll(async () => {
  await mongoose.connection.close(); // Always close connections
});

// Problem: Not clearing timers
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
```

### Flaky Tests

```javascript
// Problem: Race conditions
// Bad
it('should process async operation', () => {
  processAsync();
  expect(result).toBe(expected); // May fail due to timing
});

// Good
it('should process async operation', async () => {
  await processAsync();
  expect(result).toBe(expected);
});
```

### Test Isolation Issues

```javascript
// Problem: Tests affecting each other
// Solution: Proper cleanup
beforeEach(async () => {
  await DatabaseTestHelpers.clearDatabase();
  jest.clearAllMocks();
});
```

## Summary

Testing Express.js applications requires a comprehensive approach that includes:

**Testing Strategy**:
- Unit tests for individual components
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for scalability
- Security tests for vulnerabilities

**Key Tools**:
- **Jest**: Primary testing framework
- **Supertest**: HTTP testing library
- **Sinon**: Mocking and stubbing
- **MongoDB Memory Server**: In-memory database
- **Artillery**: Load testing

**Best Practices**:
- Maintain high test coverage (80%+)
- Use descriptive test names and structure
- Mock external dependencies
- Clean up test data properly
- Automate testing in CI/CD pipelines

**Advanced Features**:
- Custom Jest matchers
- Test data factories
- Database helpers
- Performance monitoring
- Security testing integration

A well-tested Express.js application provides confidence in deployments, easier maintenance, and better code quality. Testing should be an integral part of the development process, not an afterthought.

Next, we'll explore deployment strategies and production considerations for Express.js applications, including containerization, monitoring, and scaling techniques.