# Optional and Readonly Properties

> Learn how to work with optional properties, readonly modifiers, and default parameters in TypeScript

## Optional Properties

Optional properties allow you to define object types where some properties may or may not be present.

### Basic Optional Properties

```typescript
// Interface with optional properties
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string; // Optional property
  bio?: string;
  website?: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// Valid objects - optional properties can be omitted
const user1: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};

// Also valid - optional properties included
const user2: User = {
  id: 2,
  name: "Jane Smith",
  email: "jane@example.com",
  avatar: "avatar.jpg",
  bio: "Software developer",
  preferences: {
    theme: "dark",
    notifications: true
  }
};
```

### Optional Properties in Type Aliases

```typescript
// Type alias with optional properties
type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  tags?: string[];
  inStock?: boolean;
};

// Configuration object with optional properties
type ApiConfig = {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  debug?: boolean;
};

function createApiClient(config: ApiConfig) {
  const defaultConfig = {
    timeout: 5000,
    retries: 3,
    debug: false,
    ...config
  };
  
  return new ApiClient(defaultConfig);
}
```

### Working with Optional Properties

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

// Safe access to optional properties
function displayUserInfo(user: UserProfile): string {
  let info = `${user.username} (${user.email})`;
  
  // Check if optional property exists
  if (user.firstName && user.lastName) {
    info += ` - ${user.firstName} ${user.lastName}`;
  }
  
  // Optional chaining (TypeScript 3.7+)
  const twitterHandle = user.socialLinks?.twitter;
  if (twitterHandle) {
    info += ` | Twitter: @${twitterHandle}`;
  }
  
  return info;
}

// Nullish coalescing with optional properties
function getUserDisplayName(user: UserProfile): string {
  return user.firstName ?? user.username ?? "Anonymous";
}

function getAvatarUrl(user: UserProfile): string {
  return user.avatar ?? "/default-avatar.png";
}
```

### Optional Properties vs Union with Undefined

```typescript
// Optional property
interface WithOptional {
  name: string;
  age?: number; // Can be omitted or undefined
}

// Union with undefined
interface WithUnion {
  name: string;
  age: number | undefined; // Must be present, but can be undefined
}

// Usage differences
const optional1: WithOptional = { name: "John" }; // Valid
const optional2: WithOptional = { name: "John", age: undefined }; // Valid

const union1: WithUnion = { name: "John", age: undefined }; // Valid
// const union2: WithUnion = { name: "John" }; // Error: Property 'age' is missing

// When to use each:
// Optional (?): When the property might not be relevant
// Union with undefined: When the property is always relevant but might not have a value
```

## Readonly Properties

Readonly properties cannot be modified after object creation.

### Basic Readonly Properties

```typescript
interface ImmutableUser {
  readonly id: number;
  readonly createdAt: Date;
  name: string; // Can be modified
  email: string;
}

const user: ImmutableUser = {
  id: 1,
  createdAt: new Date(),
  name: "John Doe",
  email: "john@example.com"
};

// user.id = 2; // Error: Cannot assign to 'id' because it is a read-only property
// user.createdAt = new Date(); // Error: Cannot assign to 'createdAt'
user.name = "Jane Doe"; // OK: name is not readonly
user.email = "jane@example.com"; // OK: email is not readonly
```

### Readonly Arrays and Tuples

```typescript
// Readonly array
interface Config {
  readonly supportedLanguages: readonly string[];
  readonly coordinates: readonly [number, number];
}

const appConfig: Config = {
  supportedLanguages: ["en", "es", "fr"],
  coordinates: [40.7128, -74.0060]
};

// appConfig.supportedLanguages.push("de"); // Error: Property 'push' does not exist
// appConfig.coordinates[0] = 50; // Error: Index signature only permits reading

// ReadonlyArray<T> type
function processItems(items: ReadonlyArray<string>): string {
  return items.join(", "); // OK: reading is allowed
  // items.push("new"); // Error: Property 'push' does not exist
}

// Readonly tuple
type Point = readonly [number, number];
const origin: Point = [0, 0];
// origin[0] = 1; // Error: Index signature only permits reading
```

### Readonly Utility Type

```typescript
// Readonly<T> utility type makes all properties readonly
interface MutableUser {
  id: number;
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

type ImmutableUser = Readonly<MutableUser>;
// Equivalent to:
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email: string;
//   readonly preferences: {
//     theme: string;
//     notifications: boolean;
//   };
// }

// Note: Readonly is shallow - nested objects are not made readonly
const user: ImmutableUser = {
  id: 1,
  name: "John",
  email: "john@example.com",
  preferences: {
    theme: "dark",
    notifications: true
  }
};

// user.name = "Jane"; // Error: readonly
user.preferences.theme = "light"; // OK: nested object is not readonly
```

### Deep Readonly

```typescript
// Deep readonly utility type
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepImmutableUser = DeepReadonly<MutableUser>;

const deepUser: DeepImmutableUser = {
  id: 1,
  name: "John",
  email: "john@example.com",
  preferences: {
    theme: "dark",
    notifications: true
  }
};

// deepUser.name = "Jane"; // Error: readonly
// deepUser.preferences.theme = "light"; // Error: readonly (deep)

// Alternative using const assertions
const constUser = {
  id: 1,
  name: "John",
  email: "john@example.com",
  preferences: {
    theme: "dark",
    notifications: true
  }
} as const;
// All properties become readonly and literal types
```

## Optional Function Parameters

### Basic Optional Parameters

```typescript
// Optional parameters must come after required ones
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

greet("John"); // "Hello, John!"
greet("John", "Hi"); // "Hi, John!"

// Multiple optional parameters
function createUser(
  name: string,
  age?: number,
  email?: string,
  isActive?: boolean
): User {
  return {
    id: Math.random(),
    name,
    age: age ?? 0,
    email: email ?? "",
    isActive: isActive ?? true
  };
}
```

### Default Parameters

```typescript
// Default parameter values
function createConnection(
  host: string = "localhost",
  port: number = 3000,
  ssl: boolean = false
): Connection {
  return new Connection(host, port, ssl);
}

// Can call with any number of arguments
createConnection(); // Uses all defaults
createConnection("api.example.com"); // Custom host, default port and ssl
createConnection("api.example.com", 443, true); // All custom

// Default parameters can reference earlier parameters
function buildUrl(
  protocol: string = "https",
  host: string,
  path: string = "/",
  port?: number
): string {
  const portSuffix = port ? `:${port}` : "";
  return `${protocol}://${host}${portSuffix}${path}`;
}
```

### Optional vs Default Parameters

```typescript
// Optional parameter
function optionalParam(name: string, age?: number): void {
  console.log(`Name: ${name}, Age: ${age ?? "unknown"}`);
}

// Default parameter
function defaultParam(name: string, age: number = 0): void {
  console.log(`Name: ${name}, Age: ${age}`);
}

// Usage
optionalParam("John"); // age is undefined
defaultParam("John"); // age is 0

// Explicit undefined
optionalParam("John", undefined); // OK
defaultParam("John", undefined); // age becomes 0 (default applied)
```

## Object Destructuring with Optional Properties

### Destructuring Optional Properties

```typescript
interface ApiOptions {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Destructuring with defaults
function makeRequest({
  baseUrl,
  timeout = 5000,
  retries = 3,
  headers = {}
}: ApiOptions): Promise<Response> {
  // Implementation
  return fetch(baseUrl, {
    headers,
    signal: AbortSignal.timeout(timeout)
  });
}

// Destructuring with optional object parameter
function createApiClient({
  baseUrl = "https://api.example.com",
  timeout = 5000,
  retries = 3
}: ApiOptions = {}): ApiClient {
  return new ApiClient(baseUrl, timeout, retries);
}

// Can be called without arguments
const client1 = createApiClient(); // Uses all defaults
const client2 = createApiClient({ baseUrl: "https://custom.api.com" });
```

### Nested Destructuring

```typescript
interface UserSettings {
  profile: {
    name: string;
    avatar?: string;
  };
  preferences?: {
    theme?: "light" | "dark";
    notifications?: boolean;
    language?: string;
  };
}

function updateUserSettings({
  profile: { name, avatar = "/default-avatar.png" },
  preferences: {
    theme = "light",
    notifications = true,
    language = "en"
  } = {}
}: UserSettings): void {
  console.log({
    name,
    avatar,
    theme,
    notifications,
    language
  });
}
```

## Practical Examples

### Configuration Objects

```typescript
interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionTimeout?: number;
  maxConnections?: number;
  readonly createdAt: Date;
}

function createDatabaseConnection(config: DatabaseConfig): DatabaseConnection {
  // Validate required readonly properties
  if (!config.host || !config.port || !config.database) {
    throw new Error("Host, port, and database are required");
  }
  
  const connectionConfig = {
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username ?? "guest",
    password: config.password ?? "",
    ssl: config.ssl ?? false,
    connectionTimeout: config.connectionTimeout ?? 30000,
    maxConnections: config.maxConnections ?? 10
  };
  
  return new DatabaseConnection(connectionConfig);
}
```

### API Response Types

```typescript
interface ApiResponse<T> {
  readonly success: boolean;
  readonly timestamp: Date;
  readonly requestId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.success && response.data) {
    return response.data;
  }
  
  if (response.error) {
    console.error(`API Error ${response.error.code}: ${response.error.message}`);
    if (response.error.details) {
      console.error("Details:", response.error.details);
    }
  }
  
  return null;
}
```

### Form Validation

```typescript
interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms: boolean;
  newsletter?: boolean;
}

interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
}

function validateForm(data: FormData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required field validation
  if (!data.email.includes("@")) {
    errors.push("Invalid email format");
  }
  
  if (data.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  // Optional field validation
  if (data.confirmPassword && data.confirmPassword !== data.password) {
    errors.push("Passwords do not match");
  }
  
  if (!data.firstName && !data.lastName) {
    warnings.push("Consider providing your name for better experience");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Use optional properties for truly optional data
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string; // Truly optional
  lastLoginAt?: Date; // May not exist for new users
}

// Use readonly for immutable data
interface Event {
  readonly id: string;
  readonly timestamp: Date;
  readonly type: string;
  data: any; // Can be modified
}

// Provide sensible defaults
function createApiClient({
  baseUrl,
  timeout = 5000, // Reasonable default
  retries = 3,
  debug = false
}: {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}): ApiClient {
  return new ApiClient(baseUrl, timeout, retries, debug);
}

// Use const assertions for immutable data
const config = {
  apiUrl: "https://api.example.com",
  version: "1.0.0",
  features: ["auth", "analytics"]
} as const;
```

### ❌ Avoid

```typescript
// Don't make everything optional
interface BadUser {
  id?: number; // ID should be required
  name?: string; // Name should be required
  email?: string; // Email should be required
}

// Don't use readonly for data that needs to change
interface BadCounter {
  readonly count: number; // Should be mutable
  readonly increment: () => void; // Methods don't need readonly
}

// Don't use optional when undefined union is clearer
interface ConfusingApi {
  data?: any; // Is this missing data or undefined data?
}

// Better:
interface ClearApi {
  data: any | null; // Explicitly nullable
}
```

## Summary Checklist

- [ ] Use optional properties (`?`) for truly optional data
- [ ] Use readonly for immutable properties
- [ ] Understand the difference between optional and undefined union
- [ ] Use default parameters for function arguments
- [ ] Use `Readonly<T>` utility type when needed
- [ ] Consider deep readonly for nested immutability
- [ ] Use const assertions for compile-time immutability
- [ ] Provide sensible defaults in destructuring
- [ ] Use optional chaining (`?.`) for safe property access
- [ ] Use nullish coalescing (`??`) for default values

## Next Steps

Now that you understand optional and readonly properties, let's explore classes, access modifiers, and inheritance in TypeScript.

---

*Continue to: [Classes and Object-Oriented Programming](10-classes-oop.md)*