# Modules and Namespaces

> Learn how to organize and structure TypeScript code using modules and namespaces for better maintainability and scalability

## ES6 Modules in TypeScript

TypeScript fully supports ES6 modules, which are the standard way to organize code in modern JavaScript and TypeScript applications.

### Basic Module Exports and Imports

```typescript
// math.ts - Named exports
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export const PI = 3.14159;

export interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

// logger.ts - Default export
export default class Logger {
  private prefix: string;
  
  constructor(prefix: string = 'LOG') {
    this.prefix = prefix;
  }
  
  log(message: string): void {
    console.log(`[${this.prefix}] ${message}`);
  }
  
  error(message: string): void {
    console.error(`[${this.prefix}] ERROR: ${message}`);
  }
}

// utils.ts - Mixed exports
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

const DEFAULT_CONFIG = {
  timeout: 5000,
  retries: 3
};

export { DEFAULT_CONFIG };
export { DEFAULT_CONFIG as Config }; // Export with alias

// Re-export from another module
export { add, subtract } from './math';
```

### Importing Modules

```typescript
// app.ts - Various import patterns

// Named imports
import { add, subtract, PI } from './math';
import { formatDate, generateId } from './utils';

// Default import
import Logger from './logger';

// Import with alias
import { Calculator as MathCalculator } from './math';
import { DEFAULT_CONFIG as AppConfig } from './utils';

// Import entire module as namespace
import * as MathUtils from './math';
import * as Utils from './utils';

// Side-effect import (runs module code without importing anything)
import './polyfills';

// Dynamic imports (returns Promise)
async function loadMath() {
  const mathModule = await import('./math');
  return mathModule.add(5, 3);
}

// Usage examples
const logger = new Logger('APP');
logger.log('Application started');

const result = add(10, 5);
const today = formatDate(new Date());
const id = generateId();

// Using namespace imports
const sum = MathUtils.add(1, 2);
const difference = MathUtils.subtract(5, 3);
const formattedDate = Utils.formatDate(new Date());

// Using aliased imports
class BasicCalculator implements MathCalculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  subtract(a: number, b: number): number {
    return a - b;
  }
}
```

### Module Resolution

```typescript
// Relative imports
import { UserService } from './services/user-service'; // Same directory
import { ApiClient } from '../api/client'; // Parent directory
import { Config } from '../../config/app-config'; // Multiple levels up

// Non-relative imports (node_modules or paths mapping)
import express from 'express'; // npm package
import { Observable } from 'rxjs'; // npm package
import { Component } from '@angular/core'; // scoped package

// Import with file extensions (sometimes required)
import { helper } from './helper.js';
import data from './data.json';

// Import types only (TypeScript 3.8+)
import type { User } from './types/user';
import type { ApiResponse } from './api/types';

// Import both value and type
import { type User, createUser } from './user';
```

## Advanced Module Patterns

### Barrel Exports

```typescript
// types/index.ts - Barrel file for types
export type { User } from './user';
export type { Product } from './product';
export type { Order } from './order';
export type { ApiResponse, ApiError } from './api';

// services/index.ts - Barrel file for services
export { UserService } from './user-service';
export { ProductService } from './product-service';
export { OrderService } from './order-service';
export { ApiService } from './api-service';

// utils/index.ts - Barrel file for utilities
export * from './date-utils';
export * from './string-utils';
export * from './validation-utils';
export { default as Logger } from './logger';

// Now you can import from the barrel
import { User, Product, ApiResponse } from './types';
import { UserService, ProductService } from './services';
import { formatDate, validateEmail, Logger } from './utils';
```

### Module Augmentation

```typescript
// Extending existing modules

// global.d.ts - Augmenting global scope
declare global {
  interface Window {
    myApp: {
      version: string;
      config: Record<string, any>;
    };
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}

// express.d.ts - Augmenting Express Request
import { User } from './types/user';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    requestId: string;
  }
}

// lodash-extensions.ts - Adding methods to existing library
import _ from 'lodash';

declare module 'lodash' {
  interface LoDashStatic {
    customMethod(value: any): boolean;
  }
}

_.customMethod = function(value: any): boolean {
  return typeof value === 'string' && value.length > 0;
};

// Usage
const isValid = _.customMethod('hello'); // TypeScript knows about this method
```

### Conditional Module Loading

```typescript
// feature-loader.ts
interface FeatureModule {
  initialize(): void;
  cleanup(): void;
}

class FeatureLoader {
  private loadedFeatures = new Map<string, FeatureModule>();
  
  async loadFeature(featureName: string): Promise<FeatureModule | null> {
    if (this.loadedFeatures.has(featureName)) {
      return this.loadedFeatures.get(featureName)!;
    }
    
    try {
      let module: FeatureModule;
      
      switch (featureName) {
        case 'analytics':
          module = await import('./features/analytics');
          break;
        case 'chat':
          module = await import('./features/chat');
          break;
        case 'notifications':
          module = await import('./features/notifications');
          break;
        default:
          console.warn(`Unknown feature: ${featureName}`);
          return null;
      }
      
      module.initialize();
      this.loadedFeatures.set(featureName, module);
      return module;
    } catch (error) {
      console.error(`Failed to load feature ${featureName}:`, error);
      return null;
    }
  }
  
  unloadFeature(featureName: string): void {
    const feature = this.loadedFeatures.get(featureName);
    if (feature) {
      feature.cleanup();
      this.loadedFeatures.delete(featureName);
    }
  }
}

// features/analytics.ts
export function initialize(): void {
  console.log('Analytics feature initialized');
  // Setup analytics tracking
}

export function cleanup(): void {
  console.log('Analytics feature cleaned up');
  // Cleanup analytics resources
}

// Usage
const featureLoader = new FeatureLoader();

// Load features conditionally
if (process.env.NODE_ENV === 'production') {
  await featureLoader.loadFeature('analytics');
}

if (userHasPremium) {
  await featureLoader.loadFeature('chat');
}
```

## Namespaces

While modules are preferred in modern TypeScript, namespaces can still be useful for organizing code within a single file or for library definitions.

### Basic Namespace Usage

```typescript
// geometry.ts
namespace Geometry {
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface Rectangle {
    topLeft: Point;
    bottomRight: Point;
  }
  
  export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  export function area(rect: Rectangle): number {
    const width = rect.bottomRight.x - rect.topLeft.x;
    const height = rect.bottomRight.y - rect.topLeft.y;
    return width * height;
  }
  
  export namespace Circle {
    export interface CircleShape {
      center: Point;
      radius: number;
    }
    
    export function area(circle: CircleShape): number {
      return Math.PI * circle.radius * circle.radius;
    }
    
    export function circumference(circle: CircleShape): number {
      return 2 * Math.PI * circle.radius;
    }
  }
}

// Usage
const point1: Geometry.Point = { x: 0, y: 0 };
const point2: Geometry.Point = { x: 3, y: 4 };
const dist = Geometry.distance(point1, point2);

const rectangle: Geometry.Rectangle = {
  topLeft: { x: 0, y: 0 },
  bottomRight: { x: 10, y: 5 }
};
const rectArea = Geometry.area(rectangle);

const circle: Geometry.Circle.CircleShape = {
  center: { x: 0, y: 0 },
  radius: 5
};
const circleArea = Geometry.Circle.area(circle);
```

### Namespace Merging

```typescript
// Multiple namespace declarations with the same name are merged
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

// All declarations are merged into one namespace
const formattedDate = Utils.formatDate(new Date());
const formattedTime = Utils.formatTime(new Date());
const config = Utils.defaultConfig;
```

### Namespace Aliases

```typescript
// Long namespace names can be aliased
namespace VeryLongCompanyName {
  export namespace ProductManagement {
    export namespace InventorySystem {
      export interface Product {
        id: string;
        name: string;
        price: number;
      }
      
      export function createProduct(name: string, price: number): Product {
        return {
          id: Math.random().toString(36),
          name,
          price
        };
      }
    }
  }
}

// Create alias for easier access
import Inventory = VeryLongCompanyName.ProductManagement.InventorySystem;

// Now use the shorter alias
const product: Inventory.Product = Inventory.createProduct('Widget', 29.99);
```

## Module vs Namespace Guidelines

### When to Use Modules

```typescript
// ✅ Use modules for:

// 1. Separate files with related functionality
// user-service.ts
export class UserService {
  async getUser(id: string): Promise<User> {
    // Implementation
  }
}

// 2. Third-party library integration
// api-client.ts
import axios from 'axios';

export class ApiClient {
  constructor(private baseURL: string) {}
  
  async get<T>(endpoint: string): Promise<T> {
    const response = await axios.get(`${this.baseURL}${endpoint}`);
    return response.data;
  }
}

// 3. Code that needs to be tree-shaken
// utils.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  // Implementation
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  // Implementation
}

// Only import what you need
import { debounce } from './utils'; // throttle is not included in bundle
```

### When to Use Namespaces

```typescript
// ✅ Use namespaces for:

// 1. Organizing related types and functions in a single file
namespace ValidationRules {
  export interface Rule<T> {
    validate(value: T): boolean;
    message: string;
  }
  
  export const required: Rule<any> = {
    validate: (value) => value != null && value !== '',
    message: 'This field is required'
  };
  
  export const email: Rule<string> = {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Invalid email format'
  };
  
  export function minLength(min: number): Rule<string> {
    return {
      validate: (value) => value.length >= min,
      message: `Minimum length is ${min}`
    };
  }
}

// 2. Library type definitions
declare namespace MyLibrary {
  interface Config {
    apiKey: string;
    baseUrl: string;
  }
  
  interface User {
    id: string;
    name: string;
  }
  
  function initialize(config: Config): void;
  function getUser(id: string): Promise<User>;
}

// 3. Global augmentations
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

## Practical Examples

### Plugin System with Modules

```typescript
// plugin-system.ts
export interface Plugin {
  name: string;
  version: string;
  initialize(app: Application): void;
  destroy(): void;
}

export interface Application {
  registerRoute(path: string, handler: Function): void;
  registerMiddleware(middleware: Function): void;
  getConfig(key: string): any;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private app: Application;
  
  constructor(app: Application) {
    this.app = app;
  }
  
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      const pluginModule = await import(pluginPath);
      const plugin: Plugin = pluginModule.default || pluginModule;
      
      if (this.plugins.has(plugin.name)) {
        throw new Error(`Plugin ${plugin.name} is already loaded`);
      }
      
      plugin.initialize(this.app);
      this.plugins.set(plugin.name, plugin);
      
      console.log(`Plugin ${plugin.name} v${plugin.version} loaded`);
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginPath}:`, error);
    }
  }
  
  unloadPlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.destroy();
      this.plugins.delete(name);
      console.log(`Plugin ${name} unloaded`);
    }
  }
  
  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}

// plugins/auth-plugin.ts
import { Plugin, Application } from '../plugin-system';

class AuthPlugin implements Plugin {
  name = 'auth';
  version = '1.0.0';
  
  initialize(app: Application): void {
    // Register authentication middleware
    app.registerMiddleware((req: any, res: any, next: any) => {
      // Authentication logic
      next();
    });
    
    // Register auth routes
    app.registerRoute('/login', this.handleLogin);
    app.registerRoute('/logout', this.handleLogout);
  }
  
  destroy(): void {
    // Cleanup resources
    console.log('Auth plugin destroyed');
  }
  
  private handleLogin(req: any, res: any): void {
    // Login logic
  }
  
  private handleLogout(req: any, res: any): void {
    // Logout logic
  }
}

export default AuthPlugin;

// plugins/analytics-plugin.ts
import { Plugin, Application } from '../plugin-system';

class AnalyticsPlugin implements Plugin {
  name = 'analytics';
  version = '2.1.0';
  private trackingId: string;
  
  initialize(app: Application): void {
    this.trackingId = app.getConfig('analytics.trackingId');
    
    // Register analytics middleware
    app.registerMiddleware((req: any, res: any, next: any) => {
      this.trackPageView(req.path);
      next();
    });
  }
  
  destroy(): void {
    // Send final analytics data
    this.flush();
  }
  
  private trackPageView(path: string): void {
    // Track page view
    console.log(`Tracking page view: ${path}`);
  }
  
  private flush(): void {
    // Send remaining analytics data
    console.log('Analytics data flushed');
  }
}

export default AnalyticsPlugin;

// app.ts
import { PluginManager, Application } from './plugin-system';

class MyApplication implements Application {
  private routes = new Map<string, Function>();
  private middlewares: Function[] = [];
  private config = new Map<string, any>();
  
  constructor() {
    this.config.set('analytics.trackingId', 'GA-123456789');
  }
  
  registerRoute(path: string, handler: Function): void {
    this.routes.set(path, handler);
  }
  
  registerMiddleware(middleware: Function): void {
    this.middlewares.push(middleware);
  }
  
  getConfig(key: string): any {
    return this.config.get(key);
  }
}

// Usage
const app = new MyApplication();
const pluginManager = new PluginManager(app);

// Load plugins dynamically
await pluginManager.loadPlugin('./plugins/auth-plugin');
await pluginManager.loadPlugin('./plugins/analytics-plugin');

console.log('Loaded plugins:', pluginManager.getLoadedPlugins());
```

### Configuration Management System

```typescript
// config/types.ts
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputs: ('console' | 'file' | 'remote')[];
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  database: DatabaseConfig;
  api: ApiConfig;
  logging: LoggingConfig;
  features: {
    authentication: boolean;
    analytics: boolean;
    caching: boolean;
  };
}

// config/loaders.ts
import { AppConfig } from './types';

export interface ConfigLoader {
  load(): Promise<Partial<AppConfig>>;
}

export class EnvironmentConfigLoader implements ConfigLoader {
  async load(): Promise<Partial<AppConfig>> {
    return {
      environment: (process.env.NODE_ENV as any) || 'development',
      port: parseInt(process.env.PORT || '3000'),
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'user',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'myapp',
        ssl: process.env.DB_SSL === 'true'
      },
      api: {
        baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
        timeout: parseInt(process.env.API_TIMEOUT || '5000'),
        retries: parseInt(process.env.API_RETRIES || '3'),
        apiKey: process.env.API_KEY || ''
      }
    };
  }
}

export class FileConfigLoader implements ConfigLoader {
  constructor(private filePath: string) {}
  
  async load(): Promise<Partial<AppConfig>> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load config from ${this.filePath}:`, error);
      return {};
    }
  }
}

export class RemoteConfigLoader implements ConfigLoader {
  constructor(private url: string, private apiKey: string) {}
  
  async load(): Promise<Partial<AppConfig>> {
    try {
      const response = await fetch(this.url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`Failed to load remote config from ${this.url}:`, error);
      return {};
    }
  }
}

// config/manager.ts
import { AppConfig } from './types';
import { ConfigLoader } from './loaders';

export class ConfigManager {
  private config: AppConfig;
  private loaders: ConfigLoader[] = [];
  
  constructor(private defaultConfig: AppConfig) {
    this.config = { ...defaultConfig };
  }
  
  addLoader(loader: ConfigLoader): void {
    this.loaders.push(loader);
  }
  
  async load(): Promise<void> {
    for (const loader of this.loaders) {
      try {
        const partialConfig = await loader.load();
        this.config = this.mergeConfig(this.config, partialConfig);
      } catch (error) {
        console.error('Config loader failed:', error);
      }
    }
  }
  
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }
  
  getAll(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }
  
  private mergeConfig(base: AppConfig, partial: Partial<AppConfig>): AppConfig {
    const result = { ...base };
    
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          (result as any)[key] = { ...(result as any)[key], ...value };
        } else {
          (result as any)[key] = value;
        }
      }
    }
    
    return result;
  }
}

// config/index.ts - Barrel export
export * from './types';
export * from './loaders';
export * from './manager';

// Default configuration
export const defaultConfig: AppConfig = {
  environment: 'development',
  port: 3000,
  database: {
    host: 'localhost',
    port: 5432,
    username: 'user',
    password: 'password',
    database: 'myapp',
    ssl: false
  },
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000,
    retries: 3,
    apiKey: ''
  },
  logging: {
    level: 'info',
    format: 'text',
    outputs: ['console']
  },
  features: {
    authentication: true,
    analytics: false,
    caching: true
  }
};

// app.ts - Usage
import {
  ConfigManager,
  EnvironmentConfigLoader,
  FileConfigLoader,
  RemoteConfigLoader,
  defaultConfig
} from './config';

const configManager = new ConfigManager(defaultConfig);

// Add multiple config sources
configManager.addLoader(new EnvironmentConfigLoader());
configManager.addLoader(new FileConfigLoader('./config.json'));

if (process.env.REMOTE_CONFIG_URL) {
  configManager.addLoader(
    new RemoteConfigLoader(
      process.env.REMOTE_CONFIG_URL,
      process.env.REMOTE_CONFIG_API_KEY || ''
    )
  );
}

// Load configuration
await configManager.load();

// Use configuration
const dbConfig = configManager.get('database');
const apiConfig = configManager.get('api');
const isAnalyticsEnabled = configManager.get('features').analytics;

console.log('Database host:', dbConfig.host);
console.log('API base URL:', apiConfig.baseUrl);
console.log('Analytics enabled:', isAnalyticsEnabled);
```

## Best Practices

### ✅ Good Practices

```typescript
// Use barrel exports for clean imports
// index.ts
export * from './user-service';
export * from './product-service';
export { default as Logger } from './logger';

// Prefer named exports over default exports
export class UserService { /* ... */ }
export interface User { /* ... */ }
export const API_VERSION = 'v1';

// Use type-only imports when possible
import type { User } from './types';
import { createUser } from './user-factory';

// Organize related functionality in modules
// user/
//   ├── types.ts
//   ├── service.ts
//   ├── repository.ts
//   ├── validation.ts
//   └── index.ts

// Use consistent naming conventions
export class UserService { } // PascalCase for classes
export interface UserConfig { } // PascalCase for interfaces
export const USER_ROLES = { } as const; // UPPER_SNAKE_CASE for constants
export function createUser() { } // camelCase for functions
```

### ❌ Avoid

```typescript
// Don't use namespaces for code that could be modules
namespace UserManagement { // ❌ Should be separate modules
  export class UserService { }
  export class UserRepository { }
  export class UserValidator { }
}

// Don't mix default and named exports in the same module
export default class UserService { } // ❌
export class UserRepository { } // ❌ Inconsistent

// Don't create deep namespace hierarchies
namespace Company.Department.Team.Project.Module { // ❌ Too deep
  export function doSomething() { }
}

// Don't use relative imports for distant files
import { Utils } from '../../../../../../../utils'; // ❌ Hard to maintain

// Don't export everything
export * from './internal-helpers'; // ❌ Exposes internal implementation
```

## Summary Checklist

- [ ] Use ES6 modules for organizing code across files
- [ ] Prefer named exports over default exports
- [ ] Use barrel exports for clean import statements
- [ ] Implement proper module resolution strategies
- [ ] Use type-only imports when importing only types
- [ ] Organize related functionality into cohesive modules
- [ ] Use namespaces sparingly, mainly for type definitions
- [ ] Implement dynamic imports for code splitting
- [ ] Follow consistent naming conventions
- [ ] Avoid deep namespace hierarchies

## Next Steps

Now that you understand modules and namespaces, let's explore error handling patterns and best practices in TypeScript.

---

*Continue to: [Error Handling in TypeScript](15-error-handling.md)*