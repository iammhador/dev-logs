# Declaration Merging and Ambient Declarations

> Learn how to extend existing types, work with third-party libraries, and create ambient declarations for JavaScript code

## Declaration Merging

Declaration merging allows TypeScript to combine multiple declarations with the same name into a single definition.

### Interface Merging

```typescript
// Basic interface merging
interface User {
  id: number;
  name: string;
}

interface User {
  email: string;
  age: number;
}

// Merged interface has all properties
const user: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

// Interface merging with methods
interface Calculator {
  add(a: number, b: number): number;
}

interface Calculator {
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

interface Calculator {
  divide(a: number, b: number): number;
}

// All methods are available
const calc: Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b
};

// Interface merging with generics
interface Container<T> {
  value: T;
}

interface Container<T> {
  getValue(): T;
  setValue(value: T): void;
}

const stringContainer: Container<string> = {
  value: 'hello',
  getValue() { return this.value; },
  setValue(value) { this.value = value; }
};

// Interface merging with function overloads
interface EventEmitter {
  on(event: 'data', listener: (data: string) => void): void;
}

interface EventEmitter {
  on(event: 'error', listener: (error: Error) => void): void;
}

interface EventEmitter {
  on(event: 'close', listener: () => void): void;
}

// All overloads are merged
const emitter: EventEmitter = {
  on(event: any, listener: any) {
    // Implementation
  }
};

emitter.on('data', (data) => console.log(data)); // data is string
emitter.on('error', (error) => console.error(error)); // error is Error
emitter.on('close', () => console.log('closed')); // no parameters
```

### Namespace Merging

```typescript
// Basic namespace merging
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

namespace Utils {
  export function formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }
}

namespace Utils {
  export interface Config {
    dateFormat: string;
    timeFormat: string;
  }
  
  export const defaultConfig: Config = {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  };
}

// All exports are available
const formattedDate = Utils.formatDate(new Date());
const formattedTime = Utils.formatTime(new Date());
const config = Utils.defaultConfig;

// Namespace merging with classes
namespace Database {
  export class Connection {
    constructor(public connectionString: string) {}
    
    connect(): void {
      console.log('Connecting to database...');
    }
  }
}

namespace Database {
  export interface ConnectionOptions {
    ssl: boolean;
    timeout: number;
    retries: number;
  }
  
  export function createConnection(
    connectionString: string, 
    options?: ConnectionOptions
  ): Connection {
    return new Connection(connectionString);
  }
}

// Both class and function are available
const connection = Database.createConnection('postgresql://localhost:5432/mydb');
const directConnection = new Database.Connection('postgresql://localhost:5432/mydb');
```

### Module Augmentation

```typescript
// Augmenting existing modules

// global.d.ts - Augmenting global scope
declare global {
  interface Window {
    myApp: {
      version: string;
      config: Record<string, any>;
      utils: {
        formatCurrency(amount: number): string;
        debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T;
      };
    };
  }
  
  interface Array<T> {
    last(): T | undefined;
    first(): T | undefined;
    isEmpty(): boolean;
  }
  
  interface String {
    toTitleCase(): string;
    truncate(length: number, suffix?: string): string;
  }
  
  interface Number {
    toPercent(decimals?: number): string;
    toCurrency(currency?: string): string;
  }
}

// Implementation (would be in a separate .ts file)
if (typeof window !== 'undefined') {
  window.myApp = {
    version: '1.0.0',
    config: {},
    utils: {
      formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
      debounce: <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
        let timeoutId: NodeJS.Timeout;
        return ((...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fn(...args), delay);
        }) as T;
      }
    }
  };
}

Array.prototype.last = function<T>(this: T[]): T | undefined {
  return this[this.length - 1];
};

Array.prototype.first = function<T>(this: T[]): T | undefined {
  return this[0];
};

Array.prototype.isEmpty = function<T>(this: T[]): boolean {
  return this.length === 0;
};

String.prototype.toTitleCase = function(this: string): string {
  return this.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

String.prototype.truncate = function(this: string, length: number, suffix = '...'): string {
  return this.length > length ? this.substring(0, length) + suffix : this;
};

Number.prototype.toPercent = function(this: number, decimals = 2): string {
  return `${(this * 100).toFixed(decimals)}%`;
};

Number.prototype.toCurrency = function(this: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(this);
};

// Usage
const numbers = [1, 2, 3, 4, 5];
console.log(numbers.first()); // 1
console.log(numbers.last()); // 5
console.log([].isEmpty()); // true

const text = 'hello world';
console.log(text.toTitleCase()); // 'Hello World'
console.log(text.truncate(5)); // 'hello...'

const value = 0.1234;
console.log(value.toPercent()); // '12.34%'
console.log(value.toCurrency()); // '$0.12'
```

### Third-Party Library Augmentation

```typescript
// Augmenting Express.js
import { User } from './types/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    requestId: string;
    startTime: number;
    correlationId?: string;
  }
  
  interface Response {
    success(data?: any): Response;
    error(message: string, code?: number): Response;
  }
}

// Implementation (middleware)
import express from 'express';

const app = express();

// Add custom methods to Response
app.use((req, res, next) => {
  res.success = function(data?: any) {
    return this.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  };
  
  res.error = function(message: string, code = 500) {
    return this.status(code).json({
      success: false,
      error: { message },
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    });
  };
  
  next();
});

// Add request tracking
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9);
  req.startTime = Date.now();
  req.correlationId = req.headers['x-correlation-id'] as string;
  next();
});

// Usage with augmented types
app.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.error('User not found', 404);
    }
    
    res.success(user);
  } catch (error) {
    res.error('Internal server error');
  }
});

// Augmenting Lodash
import _ from 'lodash';

declare module 'lodash' {
  interface LoDashStatic {
    isValidEmail(value: string): boolean;
    formatPhoneNumber(value: string): string;
    generateId(prefix?: string): string;
  }
  
  interface LoDashImplicitWrapper<TValue> {
    isValidEmail(): boolean;
    formatPhoneNumber(): LoDashImplicitWrapper<string>;
  }
}

// Implementation
_.mixin({
  isValidEmail: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  
  formatPhoneNumber: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
  },
  
  generateId: (prefix = 'id'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
});

// Usage
const email = 'user@example.com';
console.log(_.isValidEmail(email)); // true
console.log(_(email).isValidEmail()); // true

const phone = '1234567890';
console.log(_.formatPhoneNumber(phone)); // '(123) 456-7890'
console.log(_(phone).formatPhoneNumber().value()); // '(123) 456-7890'

const id = _.generateId('user'); // 'user_1634567890123_abc123def'

function getUserById(id: string): Promise<User | null> {
  // Implementation
  return Promise.resolve(null);
}
```

## Ambient Declarations

Ambient declarations describe the shape of existing JavaScript code without providing implementation.

### Basic Ambient Declarations

```typescript
// Declaring global variables
declare const VERSION: string;
declare const BUILD_TIME: number;
declare const IS_PRODUCTION: boolean;

// Declaring global functions
declare function gtag(command: string, targetId: string, config?: object): void;
declare function fbq(command: string, eventName: string, parameters?: object): void;

// Declaring global objects
declare const analytics: {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name?: string, properties?: Record<string, any>): void;
};

// Usage (no implementation needed)
console.log(`Version: ${VERSION}`);
gtag('config', 'GA_MEASUREMENT_ID');
analytics.track('page_view', { page: '/home' });

// Declaring classes
declare class ThirdPartyWidget {
  constructor(element: HTMLElement, options?: WidgetOptions);
  render(): void;
  destroy(): void;
  on(event: string, callback: Function): void;
  off(event: string, callback?: Function): void;
}

interface WidgetOptions {
  theme?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  autoplay?: boolean;
}

// Usage
const widget = new ThirdPartyWidget(document.getElementById('widget')!, {
  theme: 'dark',
  size: 'large'
});

widget.render();
widget.on('ready', () => console.log('Widget is ready'));

// Declaring modules
declare module 'legacy-library' {
  export interface Config {
    apiKey: string;
    baseUrl: string;
    timeout?: number;
  }
  
  export class Client {
    constructor(config: Config);
    request(endpoint: string, data?: any): Promise<any>;
    upload(file: File, options?: UploadOptions): Promise<UploadResult>;
  }
  
  export interface UploadOptions {
    onProgress?: (progress: number) => void;
    maxSize?: number;
  }
  
  export interface UploadResult {
    id: string;
    url: string;
    size: number;
  }
  
  export function initialize(config: Config): Client;
  export const version: string;
}

// Usage
import { initialize, Client, Config } from 'legacy-library';

const config: Config = {
  apiKey: 'your-api-key',
  baseUrl: 'https://api.example.com',
  timeout: 5000
};

const client = initialize(config);
client.request('/users').then(users => console.log(users));
```

### Environment-Specific Declarations

```typescript
// Node.js environment declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    REDIS_URL?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
    AWS_REGION?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
  }
  
  interface Global {
    __DEV__: boolean;
    __TEST__: boolean;
    __PROD__: boolean;
  }
}

// Browser environment declarations
declare interface Window {
  gtag?: (
    command: 'config' | 'event' | 'set',
    targetIdOrName: string,
    configOrParameters?: object
  ) => void;
  
  fbq?: (
    command: 'track' | 'trackCustom' | 'init',
    eventNameOrPixelId: string,
    parameters?: object
  ) => void;
  
  dataLayer?: any[];
  
  Stripe?: {
    (publishableKey: string, options?: StripeOptions): StripeInstance;
  };
  
  PayPal?: {
    Buttons(options: PayPalButtonsOptions): PayPalButtonsInstance;
  };
  
  grecaptcha?: {
    ready(callback: () => void): void;
    execute(siteKey: string, options: { action: string }): Promise<string>;
  };
}

interface StripeOptions {
  apiVersion?: string;
  locale?: string;
}

interface StripeInstance {
  elements(): StripeElements;
  confirmCardPayment(clientSecret: string, data?: any): Promise<any>;
  createToken(element: any, data?: any): Promise<any>;
}

interface StripeElements {
  create(type: string, options?: any): StripeElement;
}

interface StripeElement {
  mount(selector: string): void;
  on(event: string, callback: Function): void;
}

interface PayPalButtonsOptions {
  createOrder?: (data: any, actions: any) => Promise<string>;
  onApprove?: (data: any, actions: any) => Promise<void>;
  onError?: (error: any) => void;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
  };
}

interface PayPalButtonsInstance {
  render(selector: string): Promise<void>;
}

// Usage
if (typeof window !== 'undefined') {
  // Google Analytics
  window.gtag?.('config', 'GA_MEASUREMENT_ID');
  
  // Facebook Pixel
  window.fbq?.('track', 'PageView');
  
  // Stripe
  if (window.Stripe) {
    const stripe = window.Stripe('pk_test_...');
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');
  }
  
  // PayPal
  window.PayPal?.Buttons({
    createOrder: async (data, actions) => {
      // Implementation
      return 'order-id';
    },
    onApprove: async (data, actions) => {
      // Implementation
    }
  }).render('#paypal-button-container');
}

// Node.js usage
if (typeof process !== 'undefined') {
  const port = process.env.PORT || '3000';
  const isDev = process.env.NODE_ENV === 'development';
  const dbUrl = process.env.DATABASE_URL;
}
```

### Creating Type Definition Files

```typescript
// types/my-library.d.ts

// For a simple JavaScript library
declare module 'simple-validator' {
  interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }
  
  interface ValidationSchema {
    [field: string]: ValidationRule;
  }
  
  interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string[]>;
  }
  
  export class Validator {
    constructor(schema: ValidationSchema);
    validate(data: Record<string, any>): ValidationResult;
    addRule(name: string, rule: ValidationRule): void;
  }
  
  export function validate(
    data: Record<string, any>, 
    schema: ValidationSchema
  ): ValidationResult;
  
  export const rules: {
    email: ValidationRule;
    url: ValidationRule;
    numeric: ValidationRule;
    alpha: ValidationRule;
    alphanumeric: ValidationRule;
  };
}

// For a library with default export
declare module 'date-formatter' {
  interface FormatOptions {
    locale?: string;
    timezone?: string;
    format?: string;
  }
  
  interface DateFormatter {
    format(date: Date, options?: FormatOptions): string;
    parse(dateString: string, format?: string): Date;
    addDays(date: Date, days: number): Date;
    addMonths(date: Date, months: number): Date;
    addYears(date: Date, years: number): Date;
    isBefore(date1: Date, date2: Date): boolean;
    isAfter(date1: Date, date2: Date): boolean;
    isSame(date1: Date, date2: Date, unit?: 'day' | 'month' | 'year'): boolean;
  }
  
  const formatter: DateFormatter;
  export = formatter;
}

// For a library with mixed exports
declare module 'http-client' {
  interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    baseURL?: string;
  }
  
  interface Response<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }
  
  interface HttpClient {
    get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
    delete<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;
    patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
  }
  
  export function create(config?: RequestConfig): HttpClient;
  export function get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;
  export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
  
  export default create;
}

// For a jQuery plugin
declare namespace JQuery {
  interface JQuery {
    myPlugin(options?: MyPluginOptions): JQuery;
    myPlugin(method: 'destroy'): JQuery;
    myPlugin(method: 'update', data: any): JQuery;
    myPlugin(method: 'getValue'): any;
  }
}

interface MyPluginOptions {
  theme?: 'light' | 'dark';
  animation?: boolean;
  duration?: number;
  onInit?: () => void;
  onChange?: (value: any) => void;
}

// Usage examples
import { Validator, validate, rules } from 'simple-validator';
import dateFormatter from 'date-formatter';
import httpClient, { create, get } from 'http-client';

// Simple validator
const validator = new Validator({
  email: { ...rules.email, required: true },
  password: { required: true, minLength: 8 }
});

const result = validator.validate({
  email: 'user@example.com',
  password: 'password123'
});

// Date formatter
const formatted = dateFormatter.format(new Date(), {
  locale: 'en-US',
  format: 'YYYY-MM-DD'
});

// HTTP client
const client = create({ baseURL: 'https://api.example.com' });
const response = await client.get<User[]>('/users');

// jQuery plugin
$('#my-element').myPlugin({
  theme: 'dark',
  animation: true,
  onChange: (value) => console.log('Value changed:', value)
});
```

## Working with @types Packages

### Installing and Using Type Definitions

```typescript
// Install type definitions for popular libraries
// npm install --save-dev @types/node @types/express @types/lodash @types/jest

// Using Express with types
import express, { Request, Response, NextFunction } from 'express';
import { User } from './types/user';

const app = express();

// Middleware with proper typing
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Verify token and attach user
  req.user = { id: '1', name: 'John Doe' } as User;
  next();
};

// Route handlers with typing
app.get('/users/:id', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.params.id;
  const currentUser = req.user; // TypeScript knows this exists due to augmentation
  
  try {
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Using Lodash with types
import _ from 'lodash';

const users: User[] = [
  { id: '1', name: 'John', email: 'john@example.com', age: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Jane', email: 'jane@example.com', age: 25, isActive: false, createdAt: new Date(), updatedAt: new Date() }
];

// TypeScript knows the return types
const activeUsers = _.filter(users, 'isActive'); // User[]
const userNames = _.map(users, 'name'); // string[]
const groupedByAge = _.groupBy(users, 'age'); // Record<string, User[]>
const sortedUsers = _.sortBy(users, ['age', 'name']); // User[]

// Using Jest with types
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('User Service', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('should create a user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      age: 25,
      isActive: true
    };
    
    const user = await userService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
  });
  
  it('should throw error for invalid email', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      age: 25,
      isActive: true
    };
    
    await expect(userService.createUser(userData)).rejects.toThrow('Invalid email');
  });
});

class UserService {
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Implementation
    return {
      id: '1',
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
```

### Creating Custom @types Packages

```typescript
// package.json for @types/my-custom-library
{
  "name": "@types/my-custom-library",
  "version": "1.0.0",
  "description": "TypeScript definitions for my-custom-library",
  "types": "index.d.ts",
  "typesPublisherContentHash": "...",
  "typeScriptVersion": "4.0",
  "dependencies": {},
  "devDependencies": {
    "typescript": "^4.0.0"
  }
}

// index.d.ts
// Type definitions for my-custom-library 2.1
// Project: https://github.com/example/my-custom-library
// Definitions by: Your Name <https://github.com/yourusername>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export interface LibraryConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class MyLibrary {
  constructor(config: LibraryConfig);
  
  get<T = any>(endpoint: string): Promise<ApiResponse<T>>;
  post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>>;
  put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>>;
  delete<T = any>(endpoint: string): Promise<ApiResponse<T>>;
  
  setConfig(config: Partial<LibraryConfig>): void;
  getConfig(): LibraryConfig;
}

export function createClient(config: LibraryConfig): MyLibrary;
export function isValidConfig(config: any): config is LibraryConfig;

export const version: string;
export const defaultConfig: Partial<LibraryConfig>;

// For libraries with global side effects
declare global {
  interface Window {
    MyLibrary?: typeof MyLibrary;
  }
}

// tests/index.ts - Test the type definitions
import { MyLibrary, createClient, LibraryConfig, ApiResponse } from 'my-custom-library';

// Test basic usage
const config: LibraryConfig = {
  apiKey: 'test-key',
  baseUrl: 'https://api.example.com',
  timeout: 5000
};

const client = new MyLibrary(config);
const client2 = createClient(config);

// Test API calls
client.get<{ users: any[] }>('/users').then((response: ApiResponse<{ users: any[] }>) => {
  if (response.success && response.data) {
    console.log(response.data.users);
  }
});

client.post('/users', { name: 'John' }).then((response: ApiResponse) => {
  console.log(response.success);
});

// Test configuration
client.setConfig({ timeout: 10000 });
const currentConfig: LibraryConfig = client.getConfig();
```

## Best Practices

### ✅ Good Practices

```typescript
// Use interface merging for extending existing types
interface User {
  id: string;
  name: string;
}

interface User {
  email: string; // Extends the User interface
}

// Create specific ambient declarations for third-party libraries
declare module 'specific-library' {
  export interface Config {
    apiKey: string;
    baseUrl: string;
  }
  
  export class Client {
    constructor(config: Config);
    request(endpoint: string): Promise<any>;
  }
}

// Use namespace merging for organizing related functionality
namespace Utils {
  export function formatDate(date: Date): string {
    return date.toISOString();
  }
}

namespace Utils {
  export function parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}

// Augment global types carefully and specifically
declare global {
  interface Window {
    mySpecificLibrary?: {
      version: string;
      init(): void;
    };
  }
}

// Use proper type constraints in ambient declarations
declare function processData<T extends Record<string, any>>(data: T): T;
```

### ❌ Avoid

```typescript
// Don't over-augment global types
declare global {
  interface Window {
    [key: string]: any; // ❌ Too broad
  }
  
  interface Array<T> {
    customMethod(): any; // ❌ Pollutes all arrays
  }
}

// Don't create conflicting interface merges
interface User {
  id: string;
}

interface User {
  id: number; // ❌ Conflicts with previous declaration
}

// Don't use any in ambient declarations
declare module 'some-library' {
  export function doSomething(data: any): any; // ❌ Not type-safe
}

// Don't create overly broad ambient declarations
declare const globalVariable: any; // ❌ Should be more specific

// Don't ignore existing type definitions
// If @types/library exists, don't create your own unless necessary
```

## Summary Checklist

- [ ] Use interface merging to extend existing types
- [ ] Leverage namespace merging for organizing code
- [ ] Create ambient declarations for JavaScript libraries
- [ ] Augment third-party library types when needed
- [ ] Use module augmentation for extending external modules
- [ ] Create proper type definition files for custom libraries
- [ ] Install and use @types packages for popular libraries
- [ ] Be specific and careful with global augmentations
- [ ] Test your type definitions thoroughly
- [ ] Document your ambient declarations clearly

## Next Steps

Now that you understand declaration merging and ambient declarations, let's explore working with third-party types and creating custom type definitions.

---

*Continue to: [Working with Third-Party Types](18-third-party-types.md)*