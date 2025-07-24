# Arrays, Tuples, and Enums

> Learn how to work with collections, fixed-length arrays, and enumerated values in TypeScript

## Arrays in TypeScript

### Basic Array Types

```typescript
// Array type annotations
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ["Alice", "Bob", "Charlie"];
let flags: boolean[] = [true, false, true];

// Alternative syntax using Array<T>
let scores: Array<number> = [95, 87, 92, 88];
let cities: Array<string> = ["New York", "London", "Tokyo"];

// Empty arrays
let emptyNumbers: number[] = [];
let emptyStrings: Array<string> = [];
```

### Array Type Inference

```typescript
// TypeScript infers array types
let fruits = ["apple", "banana", "orange"]; // string[]
let ages = [25, 30, 35, 40]; // number[]
let mixed = ["hello", 42, true]; // (string | number | boolean)[]

// Be careful with empty arrays
let empty = []; // any[] - not very useful
let typedEmpty: string[] = []; // Better - explicitly typed
```

### Multi-dimensional Arrays

```typescript
// 2D arrays
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// 3D arrays
let cube: number[][][] = [
  [[1, 2], [3, 4]],
  [[5, 6], [7, 8]]
];

// Array of objects
interface User {
  id: number;
  name: string;
  email: string;
}

let users: User[] = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" }
];
```

### Array Methods with Types

```typescript
let numbers: number[] = [1, 2, 3, 4, 5];

// Map - transforms each element
let doubled: number[] = numbers.map(n => n * 2); // [2, 4, 6, 8, 10]
let strings: string[] = numbers.map(n => n.toString()); // ["1", "2", "3", "4", "5"]

// Filter - keeps elements that match condition
let evens: number[] = numbers.filter(n => n % 2 === 0); // [2, 4]

// Reduce - combines all elements into single value
let sum: number = numbers.reduce((acc, n) => acc + n, 0); // 15
let product: number = numbers.reduce((acc, n) => acc * n, 1); // 120

// Find - returns first matching element or undefined
let found: number | undefined = numbers.find(n => n > 3); // 4

// Some/Every - boolean checks
let hasEven: boolean = numbers.some(n => n % 2 === 0); // true
let allPositive: boolean = numbers.every(n => n > 0); // true
```

### Generic Array Functions

```typescript
// Generic function for arrays
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}

function getLast<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Usage
const firstNumber = getFirst([1, 2, 3]); // number | undefined
const lastString = getLast(["a", "b", "c"]); // string | undefined
const numberChunks = chunk([1, 2, 3, 4, 5, 6], 2); // number[][]
```

### Readonly Arrays

```typescript
// Readonly array - cannot be modified
let readonlyNumbers: readonly number[] = [1, 2, 3, 4, 5];
// readonlyNumbers.push(6); // Error: Property 'push' does not exist
// readonlyNumbers[0] = 10; // Error: Index signature in type 'readonly number[]' only permits reading

// ReadonlyArray<T> type
let readonlyStrings: ReadonlyArray<string> = ["a", "b", "c"];

// Const assertions create readonly arrays
const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]

// Function with readonly parameter
function processNumbers(numbers: readonly number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0);
}

processNumbers([1, 2, 3]); // OK
processNumbers(readonlyNumbers); // OK
```

## Tuples

Tuples are arrays with fixed length and specific types for each position.

### Basic Tuples

```typescript
// Basic tuple types
let coordinate: [number, number] = [10, 20];
let person: [string, number] = ["John", 30];
let flag: [string, boolean] = ["isActive", true];

// Accessing tuple elements
let x = coordinate[0]; // number
let y = coordinate[1]; // number
let name = person[0]; // string
let age = person[1]; // number

// Tuple assignment
coordinate = [5, 15]; // OK
// coordinate = [5]; // Error: Type '[number]' is not assignable to type '[number, number]'
// coordinate = [5, 15, 25]; // Error: Type '[number, number, number]' is not assignable to type '[number, number]'
```

### Optional Tuple Elements

```typescript
// Optional elements (must be at the end)
let optionalTuple: [string, number?] = ["hello"];
optionalTuple = ["hello", 42]; // Also valid

// Multiple optional elements
let userInfo: [string, number?, boolean?] = ["John"];
userInfo = ["John", 30];
userInfo = ["John", 30, true];

// Function returning optional tuple
function parseCoordinate(input: string): [number, number] | [number] {
  const parts = input.split(",").map(Number);
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  } else if (parts.length === 1) {
    return [parts[0]];
  }
  throw new Error("Invalid coordinate format");
}
```

### Rest Elements in Tuples

```typescript
// Rest elements
let restTuple: [string, ...number[]] = ["prefix", 1, 2, 3, 4];
let mixedRest: [boolean, ...string[], number] = [true, "a", "b", "c", 42];

// Spread in tuple types
type StringNumberTuple = [string, number];
type ExtendedTuple = [...StringNumberTuple, boolean]; // [string, number, boolean]

// Function with rest tuple parameter
function logWithNumbers(message: string, ...numbers: number[]): void {
  console.log(message, numbers);
}

logWithNumbers("Numbers:", 1, 2, 3, 4, 5);
```

### Named Tuple Elements

```typescript
// Named tuple elements (TypeScript 4.0+)
type Point3D = [x: number, y: number, z: number];
type RGB = [red: number, green: number, blue: number];
type UserRecord = [id: number, name: string, email: string, isActive: boolean];

// Usage remains the same, but provides better documentation
let point: Point3D = [10, 20, 30];
let color: RGB = [255, 128, 0];
let user: UserRecord = [1, "John", "john@example.com", true];

// Destructuring with named tuples
let [userId, userName, userEmail, userActive] = user;
```

### Tuple Methods and Operations

```typescript
let tuple: [string, number, boolean] = ["hello", 42, true];

// Length property
let length = tuple.length; // 3

// Destructuring
let [message, count, isEnabled] = tuple;

// Spread operator
let newTuple: [string, number, boolean, string] = [...tuple, "extra"];

// Array methods (that don't change length)
let found = tuple.find(item => typeof item === "number"); // string | number | boolean | undefined
let hasString = tuple.some(item => typeof item === "string"); // boolean

// Converting to array
let asArray: (string | number | boolean)[] = [...tuple];
```

## Enums

Enums allow you to define a set of named constants.

### Numeric Enums

```typescript
// Basic numeric enum
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right  // 3
}

// Custom numeric values
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  InternalServerError = 500
}

// Mixed numeric enum
enum MixedEnum {
  A,        // 0
  B,        // 1
  C = 10,   // 10
  D,        // 11
  E = 20,   // 20
  F         // 21
}

// Using numeric enums
function move(direction: Direction): void {
  switch (direction) {
    case Direction.Up:
      console.log("Moving up");
      break;
    case Direction.Down:
      console.log("Moving down");
      break;
    case Direction.Left:
      console.log("Moving left");
      break;
    case Direction.Right:
      console.log("Moving right");
      break;
  }
}

move(Direction.Up);
move(0); // Also valid - numeric enums are bidirectional
```

### String Enums

```typescript
// String enum
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow"
}

// Theme enum
enum Theme {
  Light = "light",
  Dark = "dark",
  Auto = "auto"
}

// Using string enums
function setTheme(theme: Theme): void {
  document.body.className = theme;
}

setTheme(Theme.Dark);
// setTheme("dark"); // Error: Argument of type '"dark"' is not assignable to parameter of type 'Theme'

// String enums are not bidirectional
console.log(Color.Red); // "red"
// console.log(Color["red"]); // Error: Element implicitly has an 'any' type
```

### Const Enums

```typescript
// Const enum - inlined at compile time
const enum Sizes {
  Small = "small",
  Medium = "medium",
  Large = "large"
}

// Usage
let size = Sizes.Medium; // Compiled to: let size = "medium";

// Benefits: No runtime overhead, smaller bundle size
// Drawbacks: Cannot be used with computed property access

// Regular enum vs const enum compilation:
// Regular: Creates an object at runtime
// Const: Replaces with literal values
```

### Heterogeneous Enums

```typescript
// Mixed string and numeric enum (not recommended)
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES"
}

// Better approach: Use union types
type Status = "pending" | "approved" | "rejected";
type Priority = 1 | 2 | 3 | 4 | 5;
```

### Enum Utilities

```typescript
enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest",
  Moderator = "moderator"
}

// Get all enum values
function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

// Check if value is valid enum value
function isValidRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

// Get enum keys
function getRoleKeys(): string[] {
  return Object.keys(UserRole);
}

// Usage
const roles = getAllRoles(); // ["admin", "user", "guest", "moderator"]
const isValid = isValidRole("admin"); // true
const keys = getRoleKeys(); // ["Admin", "User", "Guest", "Moderator"]
```

### Reverse Mapping (Numeric Enums)

```typescript
enum Status {
  Pending,
  Approved,
  Rejected
}

// Numeric enums have reverse mapping
console.log(Status.Pending); // 0
console.log(Status[0]); // "Pending"
console.log(Status[Status.Pending]); // "Pending"

// Iterate over enum
for (let status in Status) {
  if (isNaN(Number(status))) {
    console.log(status); // "Pending", "Approved", "Rejected"
  }
}

// Get numeric values only
const numericValues = Object.keys(Status)
  .filter(key => !isNaN(Number(key)))
  .map(key => Number(key)); // [0, 1, 2]
```

## Advanced Patterns

### Array and Tuple Utilities

```typescript
// Utility types for arrays and tuples
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer T] ? T : never;
type Length<T extends readonly unknown[]> = T['length'];

// Usage
type FirstElement = Head<[string, number, boolean]>; // string
type RestElements = Tail<[string, number, boolean]>; // [number, boolean]
type TupleLength = Length<[string, number, boolean]>; // 3

// Array manipulation utilities
function flatten<T>(arrays: T[][]): T[] {
  return arrays.reduce((acc, arr) => acc.concat(arr), []);
}

function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

function groupBy<T, K extends keyof any>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {} as Record<K, T[]>);
}
```

### Enum-like Patterns with Objects

```typescript
// Object as enum alternative
const Theme = {
  Light: "light",
  Dark: "dark",
  Auto: "auto"
} as const;

type Theme = typeof Theme[keyof typeof Theme]; // "light" | "dark" | "auto"

// Benefits: Tree-shakable, no runtime overhead
// Usage
function applyTheme(theme: Theme): void {
  document.body.setAttribute("data-theme", theme);
}

applyTheme(Theme.Dark);
```

## Best Practices

### ✅ Good Practices

```typescript
// Use specific array types
const userIds: number[] = [1, 2, 3]; // Better than any[]

// Use readonly for immutable data
function processItems(items: readonly string[]): string[] {
  return items.map(item => item.toUpperCase());
}

// Use tuples for fixed-structure data
type Coordinate = [x: number, y: number];
type RGB = [red: number, green: number, blue: number];

// Use string enums for better type safety
enum Status {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}

// Use const enums for performance when appropriate
const enum LogLevel {
  Debug = "debug",
  Info = "info",
  Warning = "warning",
  Error = "error"
}
```

### ❌ Avoid

```typescript
// Don't use any[] when you can be specific
const badArray: any[] = [1, "hello", true]; // Use union types instead

// Don't mutate readonly arrays
function badFunction(items: readonly string[]): void {
  // items.push("new"); // Error - good!
}

// Don't use heterogeneous enums
enum BadEnum {
  StringValue = "string",
  NumberValue = 42 // Confusing and error-prone
}

// Don't use numeric enums when string enums are clearer
enum BadStatus {
  Pending, // What does 0 mean?
  Approved,
  Rejected
}
```

## Summary Checklist

- [ ] Use specific array types instead of `any[]`
- [ ] Consider `readonly` for arrays that shouldn't be modified
- [ ] Use tuples for fixed-length, heterogeneous data
- [ ] Prefer string enums over numeric enums for clarity
- [ ] Use const enums for performance when tree-shaking isn't a concern
- [ ] Consider union types as alternatives to enums
- [ ] Use named tuple elements for better documentation

## Next Steps

Now that you understand arrays, tuples, and enums, let's explore union and intersection types for more flexible type combinations.

---

*Continue to: [Union and Intersection Types](07-union-intersection-types.md)*