# Error Handling in TypeScript

> Learn comprehensive error handling strategies, custom error types, and best practices for building robust TypeScript applications

## Basic Error Handling

### Try-Catch-Finally

```typescript
// Basic try-catch structure
function parseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

// Try-catch with finally
function processFile(filename: string): string | null {
  let fileHandle: any = null;
  
  try {
    fileHandle = openFile(filename);
    const content = readFile(fileHandle);
    return processContent(content);
  } catch (error) {
    console.error(`Error processing file ${filename}:`, error);
    return null;
  } finally {
    // Always executed, regardless of success or failure
    if (fileHandle) {
      closeFile(fileHandle);
    }
  }
}

// Type-safe error handling
function safeDivide(a: number, b: number): number {
  try {
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Division error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
    throw error; // Re-throw if you want calling code to handle it
  }
}

// Multiple catch scenarios (TypeScript doesn't have multiple catch blocks)
function handleMultipleErrors(operation: string): void {
  try {
    performOperation(operation);
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Type error:', error.message);
    } else if (error instanceof RangeError) {
      console.error('Range error:', error.message);
    } else if (error instanceof Error) {
      console.error('General error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

function performOperation(operation: string): void {
  // Implementation that might throw different types of errors
}

function openFile(filename: string): any { /* Implementation */ }
function readFile(handle: any): string { /* Implementation */ }
function closeFile(handle: any): void { /* Implementation */ }
function processContent(content: string): string { /* Implementation */ }
```

## Custom Error Types

### Creating Custom Error Classes

```typescript
// Base custom error class
abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  
  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Specific error types
class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any,
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;
  
  constructor(
    public readonly resource: string,
    public readonly id: string | number,
    context?: Record<string, any>
  ) {
    super(`${resource} with id ${id} not found`, context);
  }
}

class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;
  
  constructor(
    message: string,
    public readonly query?: string,
    public readonly originalError?: Error,
    context?: Record<string, any>
  ) {
    super(message, context);
  }
}

class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;
  
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, context);
  }
}

class AuthorizationError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;
  
  constructor(
    public readonly requiredPermission: string,
    public readonly userPermissions: string[],
    context?: Record<string, any>
  ) {
    super(
      `Access denied. Required permission: ${requiredPermission}`,
      context
    );
  }
}

// Business logic specific errors
class InsufficientFundsError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;
  
  constructor(
    public readonly requestedAmount: number,
    public readonly availableAmount: number,
    context?: Record<string, any>
  ) {
    super(
      `Insufficient funds. Requested: ${requestedAmount}, Available: ${availableAmount}`,
      context
    );
  }
}

class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly isOperational = true;
  
  constructor(
    public readonly limit: number,
    public readonly resetTime: Date,
    context?: Record<string, any>
  ) {
    super(
      `Rate limit exceeded. Limit: ${limit}, Reset time: ${resetTime.toISOString()}`,
      context
    );
  }
}
```

### Error Factory Pattern

```typescript
// Error factory for consistent error creation
class ErrorFactory {
  static validation(field: string, value: any, message: string): ValidationError {
    return new ValidationError(message, field, value, {
      timestamp: new Date().toISOString(),
      type: 'validation'
    });
  }
  
  static notFound(resource: string, id: string | number): NotFoundError {
    return new NotFoundError(resource, id, {
      timestamp: new Date().toISOString(),
      type: 'not_found'
    });
  }
  
  static database(message: string, query?: string, originalError?: Error): DatabaseError {
    return new DatabaseError(message, query, originalError, {
      timestamp: new Date().toISOString(),
      type: 'database'
    });
  }
  
  static authentication(message?: string): AuthenticationError {
    return new AuthenticationError(message, {
      timestamp: new Date().toISOString(),
      type: 'authentication'
    });
  }
  
  static authorization(requiredPermission: string, userPermissions: string[]): AuthorizationError {
    return new AuthorizationError(requiredPermission, userPermissions, {
      timestamp: new Date().toISOString(),
      type: 'authorization'
    });
  }
  
  static rateLimit(limit: number, resetTime: Date): RateLimitError {
    return new RateLimitError(limit, resetTime, {
      timestamp: new Date().toISOString(),
      type: 'rate_limit'
    });
  }
}

// Usage
try {
  validateEmail('invalid-email');
} catch (error) {
  throw ErrorFactory.validation('email', 'invalid-email', 'Invalid email format');
}

function validateEmail(email: string): void {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
}
```

## Result Pattern

The Result pattern is an alternative to throwing exceptions, providing explicit error handling.

### Basic Result Implementation

```typescript
// Result type definition
type Result<T, E = Error> = Success<T> | Failure<E>;

class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  
  constructor(public readonly value: T) {}
  
  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }
  
  flatMap<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }
  
  mapError<F>(_fn: (error: never) => F): Result<T, F> {
    return this as any;
  }
  
  unwrap(): T {
    return this.value;
  }
  
  unwrapOr(_defaultValue: T): T {
    return this.value;
  }
}

class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;
  
  constructor(public readonly error: E) {}
  
  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as any;
  }
  
  flatMap<U, F>(_fn: (value: never) => Result<U, F>): Result<U, E | F> {
    return this as any;
  }
  
  mapError<F>(fn: (error: E) => F): Result<never, F> {
    return new Failure(fn(this.error));
  }
  
  unwrap(): never {
    throw new Error('Called unwrap on a Failure');
  }
  
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
}

// Helper functions
function success<T>(value: T): Success<T> {
  return new Success(value);
}

function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

// Utility function to wrap try-catch in Result
function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return success(fn());
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

// Async version
async function tryAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return success(value);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}
```

### Using the Result Pattern

```typescript
// Example: User service with Result pattern
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

class UserService {
  private users: Map<string, User> = new Map();
  
  createUser(userData: Omit<User, 'id'>): Result<User, ValidationError> {
    // Validate input
    const validationResult = this.validateUserData(userData);
    if (validationResult.isFailure) {
      return validationResult;
    }
    
    // Create user
    const user: User = {
      id: this.generateId(),
      ...userData
    };
    
    this.users.set(user.id, user);
    return success(user);
  }
  
  getUserById(id: string): Result<User, NotFoundError> {
    const user = this.users.get(id);
    if (!user) {
      return failure(ErrorFactory.notFound('User', id));
    }
    return success(user);
  }
  
  updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Result<User, NotFoundError | ValidationError> {
    const userResult = this.getUserById(id);
    if (userResult.isFailure) {
      return userResult;
    }
    
    const user = userResult.value;
    const updatedUserData = { ...user, ...updates };
    
    // Validate updated data
    const validationResult = this.validateUserData(updatedUserData);
    if (validationResult.isFailure) {
      return validationResult;
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return success(updatedUser);
  }
  
  deleteUser(id: string): Result<void, NotFoundError> {
    if (!this.users.has(id)) {
      return failure(ErrorFactory.notFound('User', id));
    }
    
    this.users.delete(id);
    return success(undefined);
  }
  
  private validateUserData(userData: Omit<User, 'id'>): Result<void, ValidationError> {
    if (!userData.name || userData.name.trim().length === 0) {
      return failure(ErrorFactory.validation('name', userData.name, 'Name is required'));
    }
    
    if (!userData.email || !this.isValidEmail(userData.email)) {
      return failure(ErrorFactory.validation('email', userData.email, 'Valid email is required'));
    }
    
    if (userData.age < 0 || userData.age > 150) {
      return failure(ErrorFactory.validation('age', userData.age, 'Age must be between 0 and 150'));
    }
    
    return success(undefined);
  }
  
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Usage with Result pattern
const userService = new UserService();

// Creating a user
const createResult = userService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

if (createResult.isSuccess) {
  console.log('User created:', createResult.value);
} else {
  console.error('Failed to create user:', createResult.error.message);
}

// Chaining operations with flatMap
const result = userService.createUser({
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 25
})
.flatMap(user => userService.updateUser(user.id, { age: 26 }))
.map(user => ({ ...user, displayName: `${user.name} (${user.age})` }));

if (result.isSuccess) {
  console.log('Final result:', result.value);
} else {
  console.error('Operation failed:', result.error.message);
}
```

## Async Error Handling

### Promise-based Error Handling

```typescript
// Basic async error handling
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw ErrorFactory.notFound('User', userId);
      } else if (response.status === 401) {
        throw ErrorFactory.authentication();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Re-throw our custom errors
    } else if (error instanceof TypeError) {
      // Network errors often manifest as TypeErrors
      throw new Error('Network error: Unable to fetch user data');
    } else {
      throw new Error(`Unexpected error: ${error}`);
    }
  }
}

// Async Result pattern
async function fetchUserDataSafe(userId: string): Promise<Result<User, AppError>> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return failure(ErrorFactory.notFound('User', userId));
      } else if (response.status === 401) {
        return failure(ErrorFactory.authentication());
      } else {
        return failure(new AppError(`HTTP ${response.status}: ${response.statusText}`) as any);
      }
    }
    
    const userData = await response.json();
    return success(userData);
  } catch (error) {
    if (error instanceof AppError) {
      return failure(error);
    } else {
      return failure(new AppError(`Unexpected error: ${error}`) as any);
    }
  }
}

// Multiple async operations with error handling
async function processUserWorkflow(userId: string): Promise<Result<string, AppError>> {
  const userResult = await fetchUserDataSafe(userId);
  if (userResult.isFailure) {
    return userResult as any;
  }
  
  const user = userResult.value;
  
  // Validate user permissions
  const permissionsResult = await checkUserPermissions(user.id);
  if (permissionsResult.isFailure) {
    return permissionsResult as any;
  }
  
  // Process user data
  const processResult = await processUserData(user);
  if (processResult.isFailure) {
    return processResult as any;
  }
  
  return success(`User ${user.name} processed successfully`);
}

async function checkUserPermissions(userId: string): Promise<Result<string[], AuthorizationError>> {
  // Implementation
  return success(['read', 'write']);
}

async function processUserData(user: User): Promise<Result<void, Error>> {
  // Implementation
  return success(undefined);
}
```

### Parallel Error Handling

```typescript
// Handle multiple async operations
async function fetchMultipleUsers(userIds: string[]): Promise<Result<User[], AppError[]>> {
  const results = await Promise.allSettled(
    userIds.map(id => fetchUserDataSafe(id))
  );
  
  const users: User[] = [];
  const errors: AppError[] = [];
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.isSuccess) {
        users.push(result.value.value);
      } else {
        errors.push(result.value.error);
      }
    } else {
      errors.push(new AppError(`Promise rejected: ${result.reason}`) as any);
    }
  }
  
  if (errors.length > 0) {
    return failure(errors);
  }
  
  return success(users);
}

// Retry mechanism with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
  
  getState(): string {
    return this.state;
  }
}

// Usage
const circuitBreaker = new CircuitBreaker(3, 30000);

async function reliableFetchUser(userId: string): Promise<User> {
  return circuitBreaker.execute(async () => {
    return withRetry(() => fetchUserData(userId), 2, 500);
  });
}
```

## Error Logging and Monitoring

### Structured Error Logging

```typescript
// Logger interface
interface Logger {
  error(message: string, error?: Error, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

// Error context interface
interface ErrorContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  timestamp: string;
  stackTrace?: string;
  additionalData?: Record<string, any>;
}

// Enhanced error logger
class ErrorLogger implements Logger {
  constructor(
    private serviceName: string,
    private environment: string
  ) {}
  
  error(message: string, error?: Error, context: Record<string, any> = {}): void {
    const errorContext: ErrorContext = {
      ...context,
      timestamp: new Date().toISOString(),
      stackTrace: error?.stack
    };
    
    const logEntry = {
      level: 'error',
      service: this.serviceName,
      environment: this.environment,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      context: errorContext
    };
    
    // In production, send to logging service
    if (this.environment === 'production') {
      this.sendToLoggingService(logEntry);
    } else {
      console.error(JSON.stringify(logEntry, null, 2));
    }
  }
  
  warn(message: string, context: Record<string, any> = {}): void {
    this.log('warn', message, context);
  }
  
  info(message: string, context: Record<string, any> = {}): void {
    this.log('info', message, context);
  }
  
  debug(message: string, context: Record<string, any> = {}): void {
    this.log('debug', message, context);
  }
  
  private log(level: string, message: string, context: Record<string, any>): void {
    const logEntry = {
      level,
      service: this.serviceName,
      environment: this.environment,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(JSON.stringify(logEntry, null, 2));
  }
  
  private async sendToLoggingService(logEntry: any): Promise<void> {
    try {
      // Send to external logging service (e.g., CloudWatch, Datadog, etc.)
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      // Fallback to console if logging service is unavailable
      console.error('Failed to send log to service:', error);
      console.error('Original log entry:', logEntry);
    }
  }
}

// Error monitoring and metrics
class ErrorMonitor {
  private errorCounts = new Map<string, number>();
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }
  
  recordError(error: Error, context: Record<string, any> = {}): void {
    const errorKey = `${error.name}:${error.message}`;
    const currentCount = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, currentCount + 1);
    
    this.logger.error('Error recorded', error, {
      ...context,
      errorCount: currentCount + 1,
      errorKey
    });
    
    // Alert if error frequency is high
    if (currentCount + 1 >= 10) {
      this.sendAlert(error, currentCount + 1, context);
    }
  }
  
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }
  
  resetStats(): void {
    this.errorCounts.clear();
  }
  
  private sendAlert(error: Error, count: number, context: Record<string, any>): void {
    this.logger.error('High error frequency detected', error, {
      ...context,
      alertType: 'high_frequency',
      errorCount: count,
      threshold: 10
    });
    
    // In production, send to alerting system
    // await this.sendToAlertingSystem({ error, count, context });
  }
}
```

## Global Error Handling

### Application-wide Error Handler

```typescript
// Global error handler
class GlobalErrorHandler {
  private logger: Logger;
  private monitor: ErrorMonitor;
  
  constructor(logger: Logger, monitor: ErrorMonitor) {
    this.logger = logger;
    this.monitor = monitor;
    this.setupGlobalHandlers();
  }
  
  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.handleError(error, {
        type: 'unhandledRejection',
        promise: promise.toString()
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.handleError(error, {
        type: 'uncaughtException',
        fatal: true
      });
      
      // Graceful shutdown
      process.exit(1);
    });
    
    // Handle warnings
    process.on('warning', (warning: Error) => {
      this.logger.warn('Process warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack
      });
    });
  }
  
  handleError(error: Error, context: Record<string, any> = {}): void {
    // Determine if error is operational or programming error
    const isOperational = error instanceof AppError && error.isOperational;
    
    this.monitor.recordError(error, {
      ...context,
      isOperational,
      handled: true
    });
    
    if (!isOperational) {
      // Programming errors should be logged with high priority
      this.logger.error('Programming error detected', error, {
        ...context,
        severity: 'critical'
      });
    }
  }
  
  // Express.js error middleware
  expressErrorHandler() {
    return (error: Error, req: any, res: any, next: any) => {
      const context = {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id,
        requestId: req.requestId
      };
      
      this.handleError(error, context);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: {
            message: error.message,
            type: error.constructor.name,
            ...(error.isOperational ? {} : { details: 'Internal server error' })
          }
        });
      } else {
        res.status(500).json({
          error: {
            message: 'Internal server error',
            type: 'InternalError'
          }
        });
      }
    };
  }
}

// Application setup
const logger = new ErrorLogger('user-service', process.env.NODE_ENV || 'development');
const monitor = new ErrorMonitor(logger);
const globalErrorHandler = new GlobalErrorHandler(logger, monitor);

// Express app setup (example)
// app.use(globalErrorHandler.expressErrorHandler());
```

## Best Practices

### ✅ Good Practices

```typescript
// Create specific error types for different scenarios
class PaymentError extends AppError {
  constructor(
    message: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly currency: string
  ) {
    super(message);
  }
}

// Use Result pattern for operations that commonly fail
function parseConfig(configString: string): Result<Config, ValidationError> {
  try {
    const config = JSON.parse(configString);
    return validateConfig(config);
  } catch (error) {
    return failure(new ValidationError('Invalid JSON format', 'config', configString));
  }
}

// Provide context in error messages
function processOrder(orderId: string): void {
  try {
    // Process order
  } catch (error) {
    throw new Error(`Failed to process order ${orderId}: ${error}`);
  }
}

// Use type guards for error handling
function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

function handleApiError(error: unknown): void {
  if (isAppError(error)) {
    console.error(`App error [${error.statusCode}]: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Unexpected error: ${error.message}`);
  } else {
    console.error('Unknown error:', error);
  }
}

// Validate inputs early
function createUser(userData: any): User {
  if (!userData || typeof userData !== 'object') {
    throw new ValidationError('Invalid user data', 'userData', userData);
  }
  
  if (!userData.email || typeof userData.email !== 'string') {
    throw new ValidationError('Email is required', 'email', userData.email);
  }
  
  // Continue with user creation
  return userData as User;
}
```

### ❌ Avoid

```typescript
// Don't swallow errors silently
try {
  riskyOperation();
} catch (error) {
  // ❌ Silent failure
}

// Don't use generic error messages
throw new Error('Something went wrong'); // ❌ Not helpful

// Don't catch and re-throw without adding value
try {
  operation();
} catch (error) {
  throw error; // ❌ Pointless catch
}

// Don't use string errors
throw 'Error message'; // ❌ Should be Error object

// Don't ignore error types
function handleError(error: any): void { // ❌ Should be more specific
  console.log(error.message); // Might not exist
}

// Don't create overly broad catch blocks
try {
  operation1();
  operation2();
  operation3();
} catch (error) {
  // ❌ Can't tell which operation failed
  console.error('One of the operations failed');
}

function riskyOperation(): void { /* Implementation */ }
function operation(): void { /* Implementation */ }
function operation1(): void { /* Implementation */ }
function operation2(): void { /* Implementation */ }
function operation3(): void { /* Implementation */ }
interface Config { /* Definition */ }
function validateConfig(config: any): Result<Config, ValidationError> { /* Implementation */ return success({} as Config); }
```

## Summary Checklist

- [ ] Create specific error types for different scenarios
- [ ] Use the Result pattern for operations that commonly fail
- [ ] Implement proper async error handling
- [ ] Set up structured error logging
- [ ] Use global error handlers for unhandled errors
- [ ] Provide meaningful error messages with context
- [ ] Distinguish between operational and programming errors
- [ ] Implement retry mechanisms for transient failures
- [ ] Use circuit breakers for external service calls
- [ ] Monitor and alert on error patterns

## Next Steps

Now that you understand error handling in TypeScript, let's explore utility types and advanced type manipulations.

---

*Continue to: [Utility Types and Type Manipulations](16-utility-types.md)*