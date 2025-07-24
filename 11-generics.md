# Generics and Reusable Code

> Master TypeScript generics to create flexible, reusable, and type-safe code components

## Introduction to Generics

Generics allow you to create reusable components that work with multiple types while maintaining type safety.

### Basic Generic Functions

```typescript
// Without generics - limited to specific types
function identityString(arg: string): string {
  return arg;
}

function identityNumber(arg: number): number {
  return arg;
}

// With generics - works with any type
function identity<T>(arg: T): T {
  return arg;
}

// Usage
const stringResult = identity<string>("hello"); // Type: string
const numberResult = identity<number>(42); // Type: number
const booleanResult = identity<boolean>(true); // Type: boolean

// Type inference - TypeScript can infer the type
const inferredString = identity("hello"); // Type: string (inferred)
const inferredNumber = identity(42); // Type: number (inferred)

// Generic function with multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const stringNumberPair = pair("hello", 42); // Type: [string, number]
const booleanStringPair = pair(true, "world"); // Type: [boolean, string]
```

### Generic Array Functions

```typescript
// Generic function working with arrays
function getFirstElement<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

const numbers = [1, 2, 3, 4, 5];
const strings = ["a", "b", "c"];
const booleans = [true, false, true];

const firstNumber = getFirstElement(numbers); // Type: number | undefined
const firstString = getFirstElement(strings); // Type: string | undefined
const firstBoolean = getFirstElement(booleans); // Type: boolean | undefined

// Generic function for array manipulation
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of array) {
    result.push(transform(item));
  }
  return result;
}

// Usage
const doubled = map([1, 2, 3], x => x * 2); // Type: number[]
const lengths = map(["hello", "world"], s => s.length); // Type: number[]
const uppercased = map(["a", "b", "c"], s => s.toUpperCase()); // Type: string[]

// Generic filter function
function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

const evenNumbers = filter([1, 2, 3, 4, 5], n => n % 2 === 0); // [2, 4]
const longStrings = filter(["a", "hello", "hi", "world"], s => s.length > 2); // ["hello", "world"]
```

## Generic Interfaces

### Basic Generic Interfaces

```typescript
// Generic interface for a container
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

// Implementation for different types
class StringContainer implements Container<string> {
  constructor(public value: string) {}
  
  getValue(): string {
    return this.value;
  }
  
  setValue(value: string): void {
    this.value = value;
  }
}

class NumberContainer implements Container<number> {
  constructor(public value: number) {}
  
  getValue(): number {
    return this.value;
  }
  
  setValue(value: number): void {
    this.value = value;
  }
}

// Generic implementation
class GenericContainer<T> implements Container<T> {
  constructor(public value: T) {}
  
  getValue(): T {
    return this.value;
  }
  
  setValue(value: T): void {
    this.value = value;
  }
}

// Usage
const stringContainer = new GenericContainer<string>("hello");
const numberContainer = new GenericContainer<number>(42);
const booleanContainer = new GenericContainer<boolean>(true);
```

### Generic Interfaces for Data Structures

```typescript
// Generic interface for a key-value store
interface KeyValueStore<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  keys(): K[];
  values(): V[];
  entries(): [K, V][];
}

// Implementation using Map
class MapStore<K, V> implements KeyValueStore<K, V> {
  private store = new Map<K, V>();
  
  get(key: K): V | undefined {
    return this.store.get(key);
  }
  
  set(key: K, value: V): void {
    this.store.set(key, value);
  }
  
  has(key: K): boolean {
    return this.store.has(key);
  }
  
  delete(key: K): boolean {
    return this.store.delete(key);
  }
  
  keys(): K[] {
    return Array.from(this.store.keys());
  }
  
  values(): V[] {
    return Array.from(this.store.values());
  }
  
  entries(): [K, V][] {
    return Array.from(this.store.entries());
  }
}

// Usage
const userStore = new MapStore<string, { name: string; age: number }>();
userStore.set("user1", { name: "John", age: 30 });
userStore.set("user2", { name: "Jane", age: 25 });

const user = userStore.get("user1"); // Type: { name: string; age: number } | undefined

// Generic interface for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

// Usage with different data types
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "John", email: "john@example.com" },
  status: 200,
  message: "Success",
  timestamp: new Date()
};

const productsResponse: ApiResponse<Product[]> = {
  data: [
    { id: 1, name: "Laptop", price: 999 },
    { id: 2, name: "Mouse", price: 25 }
  ],
  status: 200,
  message: "Success",
  timestamp: new Date()
};
```

## Generic Classes

### Basic Generic Classes

```typescript
// Generic class for a simple stack
class Stack<T> {
  private items: T[] = [];
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
  
  toArray(): T[] {
    return [...this.items];
  }
}

// Usage
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);

console.log(numberStack.pop()); // 3
console.log(numberStack.peek()); // 2

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");

console.log(stringStack.toArray()); // ["hello", "world"]
```

### Generic Classes with Multiple Type Parameters

```typescript
// Generic class for a result type (similar to Rust's Result or Haskell's Either)
class Result<T, E> {
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null,
    private readonly _isSuccess: boolean
  ) {}
  
  static success<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(value, null, true);
  }
  
  static failure<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(null, error, false);
  }
  
  isSuccess(): boolean {
    return this._isSuccess;
  }
  
  isFailure(): boolean {
    return !this._isSuccess;
  }
  
  getValue(): T {
    if (!this._isSuccess) {
      throw new Error("Cannot get value from failed result");
    }
    return this._value!;
  }
  
  getError(): E {
    if (this._isSuccess) {
      throw new Error("Cannot get error from successful result");
    }
    return this._error!;
  }
  
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success<U, E>(fn(this._value!));
    }
    return Result.failure<U, E>(this._error!);
  }
  
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value!);
    }
    return Result.failure<U, E>(this._error!);
  }
}

// Usage
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return Result.failure("Division by zero");
  }
  return Result.success(a / b);
}

function sqrt(x: number): Result<number, string> {
  if (x < 0) {
    return Result.failure("Cannot take square root of negative number");
  }
  return Result.success(Math.sqrt(x));
}

// Chaining operations
const result = divide(10, 2)
  .flatMap(x => sqrt(x))
  .map(x => x.toFixed(2));

if (result.isSuccess()) {
  console.log("Result:", result.getValue()); // "2.24"
} else {
  console.log("Error:", result.getError());
}
```

## Generic Constraints

### Basic Constraints with extends

```typescript
// Constraint: T must have a length property
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(`Length: ${arg.length}`);
  return arg;
}

// Valid calls
logLength("hello"); // string has length
logLength([1, 2, 3]); // array has length
logLength({ length: 10, value: "test" }); // object with length property

// Invalid call
// logLength(123); // Error: number doesn't have length property

// Constraint: T must extend a specific type
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30, email: "john@example.com" };

const name = getProperty(person, "name"); // Type: string
const age = getProperty(person, "age"); // Type: number
// const invalid = getProperty(person, "invalid"); // Error: "invalid" is not a key of person
```

### Multiple Constraints

```typescript
// Multiple constraints
interface Serializable {
  serialize(): string;
}

interface Timestamped {
  timestamp: Date;
}

// T must implement both interfaces
function processData<T extends Serializable & Timestamped>(data: T): string {
  const serialized = data.serialize();
  const time = data.timestamp.toISOString();
  return `${time}: ${serialized}`;
}

class LogEntry implements Serializable, Timestamped {
  constructor(
    public message: string,
    public timestamp: Date = new Date()
  ) {}
  
  serialize(): string {
    return JSON.stringify({ message: this.message, timestamp: this.timestamp });
  }
}

const entry = new LogEntry("User logged in");
const processed = processData(entry);

// Constraint with conditional types
type NonNullable<T> = T extends null | undefined ? never : T;

function ensureNonNull<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value cannot be null or undefined");
  }
  return value as NonNullable<T>;
}

const maybeString: string | null = "hello";
const definiteString = ensureNonNull(maybeString); // Type: string
```

### Constraints with Class Types

```typescript
// Generic constraint with constructor
interface Constructable {
  new (...args: any[]): any;
}

function createInstance<T extends Constructable>(ctor: T, ...args: any[]): InstanceType<T> {
  return new ctor(...args);
}

class User {
  constructor(public name: string, public age: number) {}
}

class Product {
  constructor(public name: string, public price: number) {}
}

const user = createInstance(User, "John", 30); // Type: User
const product = createInstance(Product, "Laptop", 999); // Type: Product

// Generic factory with constraints
abstract class Animal {
  abstract makeSound(): string;
}

class Dog extends Animal {
  makeSound(): string {
    return "Woof!";
  }
}

class Cat extends Animal {
  makeSound(): string {
    return "Meow!";
  }
}

function createAnimal<T extends Animal>(
  AnimalClass: new () => T
): T {
  return new AnimalClass();
}

const dog = createAnimal(Dog); // Type: Dog
const cat = createAnimal(Cat); // Type: Cat
```

## Advanced Generic Patterns

### Conditional Types

```typescript
// Basic conditional type
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false

// Conditional type for extracting array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElement<string[]>; // string
type NumberArrayElement = ArrayElement<number[]>; // number
type NotArrayElement = ArrayElement<string>; // never

// Conditional type for function return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FunctionReturn = ReturnType<() => string>; // string
type MethodReturn = ReturnType<(x: number) => boolean>; // boolean

// Practical conditional type for API responses
type ApiResult<T> = T extends { error: any } 
  ? { success: false; error: T['error'] }
  : { success: true; data: T };

type SuccessResult = ApiResult<{ name: string }>; // { success: true; data: { name: string } }
type ErrorResult = ApiResult<{ error: string }>; // { success: false; error: string }
```

### Mapped Types with Generics

```typescript
// Generic mapped type for making properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Generic mapped type for making properties required
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Generic mapped type for making properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Custom mapped type for nullable properties
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<User>; // All properties required (including age)
type ReadonlyUser = Readonly<User>; // All properties readonly
type NullableUser = Nullable<User>; // All properties can be null

// Generic mapped type with transformation
type Stringify<T> = {
  [P in keyof T]: string;
};

type StringifiedUser = Stringify<User>; // All properties are strings

// Generic mapped type with filtering
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type StringProperties = PickByType<User, string>; // { name: string; email: string }
type NumberProperties = PickByType<User, number>; // { id: number; age?: number }
```

### Generic Utility Functions

```typescript
// Generic deep clone function
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

// Generic memoization function
function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();
  
  return (...args: TArgs): TReturn => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveFunction = (x: number, y: number): number => {
  console.log(`Computing ${x} + ${y}`);
  return x + y;
};

const memoizedFunction = memoize(expensiveFunction);

console.log(memoizedFunction(1, 2)); // "Computing 1 + 2", returns 3
console.log(memoizedFunction(1, 2)); // Returns 3 (from cache, no console.log)

// Generic retry function
async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Usage
const fetchData = async (): Promise<string> => {
  const response = await fetch('https://api.example.com/data');
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.text();
};

const dataWithRetry = await retry(fetchData, 3, 2000);
```

## Practical Examples

### Generic Repository Pattern

```typescript
// Generic repository interface
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: ID, updates: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

// Generic base repository implementation
abstract class BaseRepository<T extends { id: ID }, ID> implements Repository<T, ID> {
  protected items: Map<ID, T> = new Map();
  
  async findById(id: ID): Promise<T | null> {
    return this.items.get(id) || null;
  }
  
  async findAll(): Promise<T[]> {
    return Array.from(this.items.values());
  }
  
  async create(entity: Omit<T, 'id'>): Promise<T> {
    const id = this.generateId();
    const newEntity = { ...entity, id } as T;
    this.items.set(id, newEntity);
    return newEntity;
  }
  
  async update(id: ID, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }
  
  async delete(id: ID): Promise<boolean> {
    return this.items.delete(id);
  }
  
  protected abstract generateId(): ID;
}

// Specific repository implementations
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

class UserRepository extends BaseRepository<User, string> {
  protected generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.email === email) || null;
  }
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

class ProductRepository extends BaseRepository<Product, number> {
  private nextId = 1;
  
  protected generateId(): number {
    return this.nextId++;
  }
  
  async findByCategory(category: string): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.category === category);
  }
}
```

### Generic Event System

```typescript
// Generic event system
type EventMap = Record<string, any>;

class TypedEventEmitter<TEvents extends EventMap> {
  private listeners: {
    [K in keyof TEvents]?: Array<(data: TEvents[K]) => void>;
  } = {};
  
  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }
  
  off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Define event types
interface AppEvents {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string; timestamp: Date };
  'product:created': { productId: number; name: string };
  'product:updated': { productId: number; changes: string[] };
}

// Usage with type safety
const eventEmitter = new TypedEventEmitter<AppEvents>();

// Type-safe event listeners
eventEmitter.on('user:login', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

eventEmitter.on('product:created', (data) => {
  console.log(`Product ${data.name} created with ID ${data.productId}`);
});

// Type-safe event emission
eventEmitter.emit('user:login', {
  userId: 'user123',
  timestamp: new Date()
});

eventEmitter.emit('product:created', {
  productId: 1,
  name: 'Laptop'
});

// TypeScript will catch errors
// eventEmitter.emit('user:login', { userId: 123 }); // Error: userId should be string
// eventEmitter.emit('invalid:event', {}); // Error: event doesn't exist
```

## Best Practices

### ✅ Good Practices

```typescript
// Use meaningful generic parameter names
interface Repository<TEntity, TKey> { // Clear what T represents
  findById(id: TKey): Promise<TEntity | null>;
}

// Use constraints to make generics more specific
function processItems<T extends { id: string }>(
  items: T[]
): T[] {
  return items.filter(item => item.id.length > 0);
}

// Provide default type parameters when appropriate
interface ApiResponse<TData = any, TError = string> {
  data?: TData;
  error?: TError;
  success: boolean;
}

// Use generic constraints for better type safety
function updateEntity<T extends { id: string }>(
  entity: T,
  updates: Partial<Omit<T, 'id'>>
): T {
  return { ...entity, ...updates };
}

// Use conditional types for complex type transformations
type NonNullable<T> = T extends null | undefined ? never : T;

function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined');
  }
}
```

### ❌ Avoid

```typescript
// Don't use single-letter names without context
function bad<T, U, V>(a: T, b: U): V { // What do these represent?
  // Implementation
}

// Don't make everything generic unnecessarily
function unnecessarilyGeneric<T>(value: T): T {
  return value; // This doesn't add value
}

// Better: Only make it generic if it needs to be
function identity(value: string): string {
  return value;
}

// Don't use any in generic constraints
function badConstraint<T extends any>(value: T): T {
  return value; // any defeats the purpose
}

// Don't ignore type safety with generics
function unsafe<T>(value: any): T {
  return value as T; // Dangerous casting
}
```

## Summary Checklist

- [ ] Understand basic generic syntax with `<T>`
- [ ] Use generics for functions, interfaces, and classes
- [ ] Apply generic constraints with `extends`
- [ ] Use multiple type parameters when needed
- [ ] Understand conditional types and mapped types
- [ ] Use meaningful names for generic parameters
- [ ] Apply constraints to make generics more specific
- [ ] Leverage type inference when possible
- [ ] Use utility types like `Partial<T>`, `Required<T>`, etc.
- [ ] Create reusable generic patterns for common scenarios

## Next Steps

Now that you understand generics, let's explore type guards and advanced type checking techniques in TypeScript.

---

*Continue to: [Type Guards and Advanced Type Checking](12-type-guards.md)*