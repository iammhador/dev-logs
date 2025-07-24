# Type Inference and Narrowing

> Master TypeScript's type inference capabilities and learn advanced type narrowing techniques

## Type Inference Fundamentals

TypeScript can automatically infer types in many situations, reducing the need for explicit type annotations while maintaining type safety.

### Basic Type Inference

```typescript
// Variable type inference
let message = "Hello World"; // Inferred as string
let count = 42; // Inferred as number
let isActive = true; // Inferred as boolean
let items = [1, 2, 3]; // Inferred as number[]
let mixed = ["hello", 42, true]; // Inferred as (string | number | boolean)[]

// Object type inference
let user = {
  id: 1,
  name: "John",
  email: "john@example.com"
}; // Inferred as { id: number; name: string; email: string; }

// Function return type inference
function add(a: number, b: number) {
  return a + b; // Return type inferred as number
}

function getUser() {
  return {
    id: 1,
    name: "John",
    isActive: true
  }; // Return type inferred as { id: number; name: string; isActive: boolean; }
}
```

### Contextual Type Inference

```typescript
// Array method callbacks
const numbers = [1, 2, 3, 4, 5];

// TypeScript infers parameter types from context
const doubled = numbers.map(n => n * 2); // n is inferred as number
const filtered = numbers.filter(n => n > 2); // n is inferred as number
const sum = numbers.reduce((acc, n) => acc + n, 0); // acc and n inferred as number

// Event handlers
const button = document.querySelector('button');
button?.addEventListener('click', (event) => {
  // event is inferred as MouseEvent
  console.log(event.clientX, event.clientY);
});

// Promise chains
fetch('/api/users')
  .then(response => response.json()) // response inferred as Response
  .then(data => console.log(data)); // data inferred as any (from json())
```

### Best Common Type Inference

```typescript
// TypeScript finds the best common type
let mixed = [1, "hello", true]; // (string | number | boolean)[]
let numbers = [1, 2, 3.14]; // number[]

// With objects
let animals = [
  { name: "Fluffy", type: "cat" },
  { name: "Buddy", type: "dog" },
  { name: "Tweety", type: "bird" }
]; // { name: string; type: string; }[]

// When no common type exists
class Cat { meow() {} }
class Dog { bark() {} }

let pets = [new Cat(), new Dog()]; // (Cat | Dog)[]
```

### Generic Type Inference

```typescript
// Generic function with inference
function identity<T>(arg: T): T {
  return arg;
}

// Type parameter inferred from argument
const stringResult = identity("hello"); // T inferred as string
const numberResult = identity(42); // T inferred as number

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const stringNumberPair = pair("hello", 42); // [string, number]

// Generic constraints with inference
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "John", email: "john@example.com" };
const userName = getProperty(user, "name"); // string
const userId = getProperty(user, "id"); // number
```

## Advanced Type Inference

### Conditional Type Inference

```typescript
// Infer keyword in conditional types
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type StringFunction = () => string;
type NumberFunction = () => number;

type StringReturn = ReturnType<StringFunction>; // string
type NumberReturn = ReturnType<NumberFunction>; // number

// Infer array element type
type ElementType<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ElementType<string[]>; // string
type NumberArrayElement = ElementType<number[]>; // number

// Infer promise value type
type PromiseValue<T> = T extends Promise<infer U> ? U : never;

type StringPromiseValue = PromiseValue<Promise<string>>; // string
type UserPromiseValue = PromiseValue<Promise<User>>; // User
```

### Template Literal Type Inference

```typescript
// Template literal type inference
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">; // "onClick"
type HoverEvent = EventName<"hover">; // "onHover"

// Extract parts from template literals
type ExtractEventType<T> = T extends `on${infer U}` ? Lowercase<U> : never;

type ClickType = ExtractEventType<"onClick">; // "click"
type HoverType = ExtractEventType<"onHover">; // "hover"

// Complex template literal inference
type ParseRoute<T extends string> = 
  T extends `/${infer Segment}/${infer Rest}`
    ? [Segment, ...ParseRoute<`/${Rest}`>]
    : T extends `/${infer Segment}`
    ? [Segment]
    : [];

type UserRoute = ParseRoute<"/users/123/profile">; // ["users", "123", "profile"]
```

### Mapped Type Inference

```typescript
// Infer from mapped types
type GetValueType<T> = T extends { [K in keyof T]: infer U } ? U : never;

type StringRecord = { a: string; b: string; c: string };
type StringType = GetValueType<StringRecord>; // string

type MixedRecord = { a: string; b: number; c: boolean };
type MixedType = GetValueType<MixedRecord>; // string | number | boolean

// Infer function parameter types
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

type AddFunction = (a: number, b: number) => number;
type AddParams = Parameters<AddFunction>; // [number, number]
```

## Type Narrowing Techniques

Type narrowing helps TypeScript understand more specific types within conditional blocks.

### typeof Type Guards

```typescript
function processValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    // TypeScript knows value is string here
    return value.toUpperCase();
  } else if (typeof value === "number") {
    // TypeScript knows value is number here
    return value.toFixed(2);
  } else {
    // TypeScript knows value is boolean here
    return value ? "true" : "false";
  }
}

// Typeof with objects
function handleInput(input: string | string[] | null): string {
  if (typeof input === "string") {
    return input;
  } else if (typeof input === "object" && input !== null) {
    // TypeScript knows input is string[] here
    return input.join(", ");
  } else {
    // TypeScript knows input is null here
    return "No input";
  }
}
```

### instanceof Type Guards

```typescript
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function handlePet(pet: Dog | Cat): void {
  if (pet instanceof Dog) {
    pet.bark(); // TypeScript knows pet is Dog
  } else {
    pet.meow(); // TypeScript knows pet is Cat
  }
}

// instanceof with built-in types
function processError(error: Error | string): string {
  if (error instanceof Error) {
    return error.message; // TypeScript knows error is Error
  } else {
    return error; // TypeScript knows error is string
  }
}
```

### in Operator Type Guards

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Human = { walk: () => void };

function move(creature: Fish | Bird | Human): void {
  if ("swim" in creature) {
    creature.swim(); // TypeScript knows creature is Fish
  } else if ("fly" in creature) {
    creature.fly(); // TypeScript knows creature is Bird
  } else {
    creature.walk(); // TypeScript knows creature is Human
  }
}

// in operator with optional properties
interface User {
  id: number;
  name: string;
  email?: string;
}

function processUser(user: User): void {
  if ("email" in user && user.email) {
    // TypeScript knows user.email exists and is not undefined
    console.log(`Email: ${user.email}`);
  }
}
```

### Custom Type Guards

```typescript
// Basic type guard
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

// Object type guard
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(obj: any): obj is User {
  return obj &&
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string";
}

// Generic type guard
function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

// Usage
function processUnknownValue(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase()); // TypeScript knows value is string
  } else if (isNumber(value)) {
    console.log(value.toFixed(2)); // TypeScript knows value is number
  } else if (isUser(value)) {
    console.log(`User: ${value.name}`); // TypeScript knows value is User
  }
}

const maybeUsers: unknown = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" }
];

if (isArrayOf(maybeUsers, isUser)) {
  // TypeScript knows maybeUsers is User[]
  maybeUsers.forEach(user => console.log(user.name));
}
```

### Discriminated Union Narrowing

```typescript
// Discriminated unions with literal types
type LoadingState = { status: "loading" };
type SuccessState = { status: "success"; data: any };
type ErrorState = { status: "error"; error: string };

type AsyncState = LoadingState | SuccessState | ErrorState;

function handleState(state: AsyncState): void {
  switch (state.status) {
    case "loading":
      console.log("Loading...");
      break;
    case "success":
      console.log("Data:", state.data); // TypeScript knows state is SuccessState
      break;
    case "error":
      console.error("Error:", state.error); // TypeScript knows state is ErrorState
      break;
    default:
      // Exhaustiveness check
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}

// Complex discriminated unions
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2; // TypeScript knows shape has radius
    case "rectangle":
      return shape.width * shape.height; // TypeScript knows shape has width and height
    case "triangle":
      return (shape.base * shape.height) / 2; // TypeScript knows shape has base and height
    default:
      const exhaustiveCheck: never = shape;
      throw new Error(`Unknown shape: ${exhaustiveCheck}`);
  }
}
```

### Truthiness Narrowing

```typescript
// Truthiness narrowing
function processOptionalString(str: string | null | undefined): string {
  if (str) {
    // TypeScript knows str is string (not null or undefined)
    return str.toUpperCase();
  } else {
    return "No string provided";
  }
}

// Array length narrowing
function processArray(arr: string[]): string {
  if (arr.length > 0) {
    // TypeScript knows arr is not empty
    return arr[0].toUpperCase(); // Safe to access first element
  } else {
    return "Empty array";
  }
}

// Object property narrowing
interface Config {
  apiUrl?: string;
  timeout?: number;
}

function makeRequest(config: Config): void {
  if (config.apiUrl) {
    // TypeScript knows config.apiUrl is string (not undefined)
    fetch(config.apiUrl);
  }
}
```

### Equality Narrowing

```typescript
// Equality narrowing with literals
function handleStatus(status: "pending" | "approved" | "rejected" | null): void {
  if (status === "approved") {
    // TypeScript knows status is "approved"
    console.log("Request approved");
  } else if (status === null) {
    // TypeScript knows status is null
    console.log("No status");
  } else {
    // TypeScript knows status is "pending" | "rejected"
    console.log(`Status: ${status}`);
  }
}

// Equality narrowing with discriminated unions
type ApiResponse = 
  | { success: true; data: any }
  | { success: false; error: string };

function handleResponse(response: ApiResponse): void {
  if (response.success === true) {
    console.log("Data:", response.data); // TypeScript knows response has data
  } else {
    console.error("Error:", response.error); // TypeScript knows response has error
  }
}
```

## Advanced Narrowing Patterns

### Control Flow Analysis

```typescript
// TypeScript tracks control flow
function processValue(value: string | number | null): string {
  if (value === null) {
    return "null value";
  }
  
  // TypeScript knows value is string | number here
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  
  // TypeScript knows value is number here
  return value.toString();
}

// Early returns
function validateUser(user: any): User {
  if (!user) {
    throw new Error("User is required");
  }
  
  if (typeof user.id !== "number") {
    throw new Error("User ID must be a number");
  }
  
  if (typeof user.name !== "string") {
    throw new Error("User name must be a string");
  }
  
  // TypeScript knows user has the right shape here
  return user as User;
}
```

### Assertion Functions

```typescript
// Assertion functions
function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Expected string");
  }
}

function assertIsUser(obj: any): asserts obj is User {
  assert(obj && typeof obj === "object", "Expected object");
  assert(typeof obj.id === "number", "Expected numeric id");
  assert(typeof obj.name === "string", "Expected string name");
  assert(typeof obj.email === "string", "Expected string email");
}

// Usage
function processUnknown(value: unknown): void {
  assertIsString(value);
  // TypeScript knows value is string after assertion
  console.log(value.toUpperCase());
}

function processUserData(data: any): void {
  assertIsUser(data);
  // TypeScript knows data is User after assertion
  console.log(`User: ${data.name} (${data.email})`);
}
```

### Never Type for Exhaustiveness

```typescript
// Exhaustiveness checking with never
type Action = 
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "increment":
      return state + 1;
    case "decrement":
      return state - 1;
    case "reset":
      return 0;
    default:
      // This ensures all cases are handled
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled action: ${exhaustiveCheck}`);
  }
}

// If you add a new action type, TypeScript will error
// type Action = 
//   | { type: "increment" }
//   | { type: "decrement" }
//   | { type: "reset" }
//   | { type: "multiply"; factor: number }; // New action

// The default case will now error because action is not never
```

## Best Practices

### ✅ Good Practices

```typescript
// Let TypeScript infer when obvious
const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" }
]; // Let TypeScript infer the array type

// Use type guards for runtime safety
function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && email.includes("@");
}

// Use assertion functions for validation
function assertIsPositive(value: number): asserts value is number {
  if (value <= 0) {
    throw new Error("Value must be positive");
  }
}

// Use discriminated unions for state management
type RequestState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; error: string };
```

### ❌ Avoid

```typescript
// Don't over-annotate when inference works
const message: string = "Hello"; // Unnecessary annotation
const message = "Hello"; // Better

// Don't use any when you can narrow
function badProcess(value: any): any {
  return value.whatever; // No type safety
}

// Don't ignore exhaustiveness checking
function badReducer(action: Action): number {
  switch (action.type) {
    case "increment":
      return 1;
    // Missing other cases - no compile-time error
  }
  return 0; // Fallback hides missing cases
}
```

## Summary Checklist

- [ ] Leverage TypeScript's type inference when types are obvious
- [ ] Use type guards for runtime type checking
- [ ] Implement custom type guards for complex objects
- [ ] Use discriminated unions for state management
- [ ] Implement exhaustiveness checking with `never`
- [ ] Use assertion functions for validation
- [ ] Understand control flow analysis
- [ ] Use the `in` operator for property checking
- [ ] Implement proper error handling with type narrowing

## Next Steps

Now that you understand type inference and narrowing, let's move on to intermediate topics starting with optional and readonly properties.

---

*Continue to: [Optional and Readonly Properties](09-optional-readonly-properties.md)*