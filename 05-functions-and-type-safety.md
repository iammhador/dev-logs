# Functions and Type Safety

> Master function typing in TypeScript, including parameters, return types, overloads, and advanced function patterns

## Basic Function Typing

### Function Declarations

```typescript
// Basic function with typed parameters and return type
function add(a: number, b: number): number {
  return a + b;
}

// Function with no return value
function logMessage(message: string): void {
  console.log(message);
}

// Function that never returns
function throwError(message: string): never {
  throw new Error(message);
}
```

### Function Expressions

```typescript
// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Function expression
const divide = function(a: number, b: number): number {
  return a / b;
};

// Function with explicit type annotation
const subtract: (a: number, b: number) => number = (a, b) => a - b;
```

### Function Type Aliases

```typescript
// Define function type
type MathOperation = (a: number, b: number) => number;
type StringProcessor = (input: string) => string;
type EventHandler = (event: Event) => void;

// Use function types
const add: MathOperation = (a, b) => a + b;
const toUpperCase: StringProcessor = (str) => str.toUpperCase();

// Function that accepts another function
function calculate(operation: MathOperation, x: number, y: number): number {
  return operation(x, y);
}

const result = calculate(add, 5, 3); // 8
```

## Parameter Types

### Optional Parameters

```typescript
// Optional parameters must come after required ones
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

greet("John"); // "Hello, John!"
greet("John", "Hi"); // "Hi, John!"

// Multiple optional parameters
function createUser(name: string, age?: number, email?: string): User {
  return {
    id: Math.random().toString(),
    name,
    age: age || 0,
    email: email || ""
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
function buildUrl(protocol: string = "https", host: string, path: string = "/"): string {
  return `${protocol}://${host}${path}`;
}
```

### Rest Parameters

```typescript
// Rest parameters for variable arguments
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3, 4, 5); // 15
sum(); // 0

// Rest parameters with other parameters
function logWithPrefix(prefix: string, ...messages: string[]): void {
  messages.forEach(message => {
    console.log(`${prefix}: ${message}`);
  });
}

logWithPrefix("INFO", "Server started", "Database connected");

// Typed rest parameters
function combineObjects<T>(...objects: T[]): T {
  return Object.assign({}, ...objects);
}
```

### Destructured Parameters

```typescript
// Object destructuring in parameters
interface UserInfo {
  name: string;
  age: number;
  email: string;
}

function displayUser({ name, age, email }: UserInfo): string {
  return `${name} (${age}) - ${email}`;
}

// With default values
function createApiClient({
  baseUrl = "https://api.example.com",
  timeout = 5000,
  retries = 3
}: {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
} = {}): ApiClient {
  return new ApiClient(baseUrl, timeout, retries);
}

// Array destructuring
function getCoordinates([x, y]: [number, number]): string {
  return `(${x}, ${y})`;
}
```

## Return Types

### Explicit Return Types

```typescript
// Explicit return type annotation
function getUser(id: string): User | null {
  // Implementation
  return users.find(user => user.id === id) || null;
}

// Promise return types
function fetchUserData(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(response => response.json());
}

// Async function return types
async function getUserAsync(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error) {
    return null;
  }
}
```

### Return Type Inference

```typescript
// TypeScript infers return types
function multiply(a: number, b: number) {
  return a * b; // Inferred as number
}

function getUsers() {
  return [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" }
  ]; // Inferred as { id: number; name: string; }[]
}

// Complex inference
function processData(data: string[]) {
  return data
    .filter(item => item.length > 0)
    .map(item => ({ value: item, length: item.length }));
  // Inferred as { value: string; length: number; }[]
}
```

## Function Overloads

Function overloads allow you to define multiple function signatures for the same function.

### Basic Overloads

```typescript
// Overload signatures
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;

// Implementation signature (must be compatible with all overloads)
function format(value: string | number | boolean): string {
  return String(value);
}

// Usage
const str1 = format("hello"); // string
const str2 = format(42); // string
const str3 = format(true); // string
```

### Complex Overloads

```typescript
// Different return types based on parameters
function createElement(tag: "div"): HTMLDivElement;
function createElement(tag: "span"): HTMLSpanElement;
function createElement(tag: "button"): HTMLButtonElement;
function createElement(tag: string): HTMLElement;

function createElement(tag: string): HTMLElement {
  return document.createElement(tag);
}

// TypeScript knows the specific return type
const div = createElement("div"); // HTMLDivElement
const button = createElement("button"); // HTMLButtonElement

// Conditional overloads
function get(url: string): Promise<string>;
function get(url: string, options: { json: true }): Promise<object>;
function get(url: string, options?: { json?: boolean }): Promise<string | object> {
  // Implementation
  return fetch(url).then(response => 
    options?.json ? response.json() : response.text()
  );
}
```

### Method Overloads

```typescript
class DataProcessor {
  // Method overloads
  process(data: string): string;
  process(data: number): number;
  process(data: string[]): string[];
  
  process(data: string | number | string[]): string | number | string[] {
    if (typeof data === "string") {
      return data.toUpperCase();
    } else if (typeof data === "number") {
      return data * 2;
    } else {
      return data.map(item => item.toUpperCase());
    }
  }
}

const processor = new DataProcessor();
const result1 = processor.process("hello"); // string
const result2 = processor.process(42); // number
const result3 = processor.process(["a", "b"]); // string[]
```

## Generic Functions

### Basic Generic Functions

```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Usage with explicit type
const stringResult = identity<string>("hello");
const numberResult = identity<number>(42);

// Usage with type inference
const autoString = identity("hello"); // T inferred as string
const autoNumber = identity(42); // T inferred as number
```

### Generic Functions with Constraints

```typescript
// Constraint: T must have a length property
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

getLength("hello"); // OK: string has length
getLength([1, 2, 3]); // OK: array has length
// getLength(42); // Error: number doesn't have length

// Multiple constraints
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const merged = merge({ name: "John" }, { age: 30 });
// Type: { name: string } & { age: number }
```

### Generic Functions with Multiple Type Parameters

```typescript
// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const stringNumberPair = pair("hello", 42); // [string, number]
const booleanArrayPair = pair(true, [1, 2, 3]); // [boolean, number[]]

// Generic function with conditional logic
function convert<T, U>(value: T, converter: (input: T) => U): U {
  return converter(value);
}

const stringToNumber = convert("42", parseInt); // number
const numberToString = convert(42, String); // string
```

## Higher-Order Functions

### Functions that Return Functions

```typescript
// Function factory
function createValidator<T>(predicate: (value: T) => boolean) {
  return function(value: T): boolean {
    return predicate(value);
  };
}

const isPositive = createValidator<number>(n => n > 0);
const isNotEmpty = createValidator<string>(s => s.length > 0);

// Curried functions
function add(a: number) {
  return function(b: number): number {
    return a + b;
  };
}

const add5 = add(5);
const result = add5(3); // 8

// Generic curried function
function curry<T, U, V>(fn: (a: T, b: U) => V) {
  return function(a: T) {
    return function(b: U): V {
      return fn(a, b);
    };
  };
}
```

### Callback Functions

```typescript
// Typed callbacks
function processArray<T, U>(
  array: T[],
  callback: (item: T, index: number) => U
): U[] {
  return array.map(callback);
}

const numbers = [1, 2, 3, 4, 5];
const doubled = processArray(numbers, (n, i) => n * 2); // number[]
const strings = processArray(numbers, (n, i) => `Item ${i}: ${n}`); // string[]

// Event handlers
type EventCallback<T> = (event: T) => void;

function addEventListener<T extends Event>(
  element: HTMLElement,
  eventType: string,
  callback: EventCallback<T>
): void {
  element.addEventListener(eventType, callback as EventListener);
}
```

## Function Type Guards

### Custom Type Guards

```typescript
// Type guard function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

// Using type guards
function processValue(value: unknown): string {
  if (isString(value)) {
    return value.toUpperCase(); // TypeScript knows value is string
  } else if (isNumber(value)) {
    return value.toString(); // TypeScript knows value is number
  } else {
    return "Unknown type";
  }
}

// Generic type guard
function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const maybeStringArray: unknown = ["a", "b", "c"];
if (isArrayOf(maybeStringArray, isString)) {
  // TypeScript knows maybeStringArray is string[]
  console.log(maybeStringArray.join(", "));
}
```

## Async Functions and Promises

### Promise-based Functions

```typescript
// Function returning Promise
function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
}

// Generic Promise function
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}

// Promise utility functions
function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    delay(ms, null).then(() => {
      throw new Error("Timeout");
    })
  ]);
}
```

### Async/Await Functions

```typescript
// Async function
async function getUserData(id: string): Promise<UserData> {
  try {
    const user = await fetchUser(id);
    const profile = await fetchUserProfile(user.id);
    const preferences = await fetchUserPreferences(user.id);
    
    return {
      user,
      profile,
      preferences
    };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    throw error;
  }
}

// Async generator function
async function* fetchPages<T>(url: string): AsyncGenerator<T[], void, unknown> {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    
    yield data.items;
    
    hasMore = data.hasMore;
    page++;
  }
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Always type function parameters
function processUser(user: User, options: ProcessOptions): ProcessResult {
  // Implementation
}

// Use specific return types for public APIs
function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

// Use function overloads for different behaviors
function format(value: string): string;
function format(value: number, decimals: number): string;
function format(value: string | number, decimals?: number): string {
  // Implementation
}

// Use generics for reusable functions
function createRepository<T>(entityType: new() => T): Repository<T> {
  return new Repository(entityType);
}
```

### ❌ Avoid

```typescript
// Don't use any for parameters
function badFunction(data: any): any {
  return data.whatever;
}

// Don't omit return types for public functions
function publicApi(input: string) { // Should specify return type
  return processInput(input);
}

// Don't use function overloads when union types suffice
function unnecessary(value: string): string;
function unnecessary(value: number): string;
// Better: function format(value: string | number): string
```

## Function Type Checklist

- [ ] All function parameters have explicit types
- [ ] Public functions have explicit return types
- [ ] Use optional parameters instead of undefined unions when possible
- [ ] Leverage function overloads for different behaviors
- [ ] Use generics for reusable functions
- [ ] Implement proper error handling in async functions
- [ ] Use type guards for runtime type checking

## Next Steps

Now that you understand function typing, let's explore arrays, tuples, and enums to handle collections and fixed sets of values.

---

*Continue to: [Arrays, Tuples, and Enums](06-arrays-tuples-enums.md)*