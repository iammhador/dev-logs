# Basic Type Annotations

> Learn how to add type annotations to variables, parameters, and return values in TypeScript

## What are Type Annotations?

Type annotations are explicit declarations that tell TypeScript what type of value a variable, parameter, or function return should be. They provide compile-time type checking and better IDE support.

```typescript
// Without type annotation (JavaScript)
let message = "Hello World";

// With type annotation (TypeScript)
let message: string = "Hello World";
```

## Primitive Types

### String Type

```typescript
let firstName: string = "John";
let lastName: string = 'Doe';
let fullName: string = `${firstName} ${lastName}`; // Template literals

// String methods are fully typed
let upperName: string = firstName.toUpperCase();
let nameLength: number = firstName.length;
```

### Number Type

```typescript
let age: number = 25;
let price: number = 99.99;
let hexValue: number = 0xff; // Hexadecimal
let binaryValue: number = 0b1010; // Binary
let octalValue: number = 0o744; // Octal

// Number methods are typed
let rounded: number = price.toFixed(2);
let parsed: number = parseInt("42");
```

### Boolean Type

```typescript
let isActive: boolean = true;
let isComplete: boolean = false;
let hasPermission: boolean = age >= 18; // Expression result

// Boolean operations
let canAccess: boolean = isActive && hasPermission;
let shouldShow: boolean = !isComplete;
```

### Null and Undefined

```typescript
let nullValue: null = null;
let undefinedValue: undefined = undefined;

// Often used in union types
let optionalName: string | null = null;
let maybeAge: number | undefined = undefined;

// Strict null checks (when strictNullChecks is enabled)
let name: string = "John";
// name = null; // Error: Type 'null' is not assignable to type 'string'
```

## Special Types

### Any Type

The `any` type disables type checking - use sparingly!

```typescript
let anything: any = "hello";
anything = 42;
anything = true;
anything = { name: "John" };
anything = [1, 2, 3];

// No type checking - can call any method
anything.foo.bar.baz; // No error, but might crash at runtime

// When to use any:
// 1. Migrating from JavaScript
// 2. Working with dynamic content
// 3. Third-party libraries without types
```

### Unknown Type

Safer alternative to `any` - requires type checking before use:

```typescript
let userInput: unknown;
userInput = "hello";
userInput = 42;
userInput = true;

// Must check type before using
if (typeof userInput === "string") {
  console.log(userInput.toUpperCase()); // OK: TypeScript knows it's a string
}

// Type assertion (use carefully)
let strValue: string = userInput as string;

// Type guard function
function isString(value: unknown): value is string {
  return typeof value === "string";
}

if (isString(userInput)) {
  console.log(userInput.length); // OK: TypeScript knows it's a string
}
```

### Void Type

Used for functions that don't return a value:

```typescript
function logMessage(message: string): void {
  console.log(message);
  // No return statement, or return; (without value)
}

function processData(data: any[]): void {
  data.forEach(item => console.log(item));
  return; // OK: returning without value
}

// Variables of type void can only be undefined or null
let voidValue: void = undefined;
```

### Never Type

Represents values that never occur:

```typescript
// Function that never returns (throws error)
function throwError(message: string): never {
  throw new Error(message);
}

// Function with infinite loop
function infiniteLoop(): never {
  while (true) {
    // Do something forever
  }
}

// Exhaustive checking in switch statements
type Color = "red" | "green" | "blue";

function getColorCode(color: Color): string {
  switch (color) {
    case "red":
      return "#FF0000";
    case "green":
      return "#00FF00";
    case "blue":
      return "#0000FF";
    default:
      // This should never be reached
      const exhaustiveCheck: never = color;
      throw new Error(`Unhandled color: ${exhaustiveCheck}`);
  }
}
```

## Type Inference

TypeScript can automatically infer types in many cases:

```typescript
// Type inference - no annotation needed
let message = "Hello"; // Inferred as string
let count = 42; // Inferred as number
let isReady = false; // Inferred as boolean

// Function return type inference
function add(a: number, b: number) {
  return a + b; // Return type inferred as number
}

// Array type inference
let numbers = [1, 2, 3]; // Inferred as number[]
let mixed = ["hello", 42, true]; // Inferred as (string | number | boolean)[]

// Object type inference
let person = {
  name: "John",
  age: 30
}; // Inferred as { name: string; age: number; }
```

## When to Use Type Annotations

### Always Annotate

```typescript
// Function parameters (cannot be inferred)
function greet(name: string, age: number): string {
  return `Hello ${name}, you are ${age} years old`;
}

// When initial value doesn't match intended type
let userId: string | number = "user123";
// Later: userId = 456;

// When declaring without initialization
let userName: string;
// Later: userName = "John";
```

### Optional Annotations

```typescript
// Clear from context - annotation optional
let message: string = "Hello"; // Could be: let message = "Hello";

// When you want to be explicit
let price: number = 99.99; // Makes intent clear

// For better documentation
function calculateTax(amount: number): number { // Clear what function does
  return amount * 0.1;
}
```

## Variable Declaration Patterns

### Multiple Variables

```typescript
// Same type
let firstName: string, lastName: string;
firstName = "John";
lastName = "Doe";

// Different types
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Destructuring with types
let [x, y]: [number, number] = [10, 20];
let { name: userName, age: userAge }: { name: string; age: number } = {
  name: "John",
  age: 30
};
```

### Const Assertions

```typescript
// Regular const - type is widened
const colors = ["red", "green", "blue"]; // Type: string[]

// Const assertion - type is narrowed
const colorsConst = ["red", "green", "blue"] as const; // Type: readonly ["red", "green", "blue"]

// Object const assertion
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000
} as const; // Properties become readonly and literal types
```

## Type Annotations in Practice

### API Response Handling

```typescript
// Define expected response structure
interface ApiResponse {
  data: any;
  status: number;
  message: string;
}

function handleApiResponse(response: ApiResponse): void {
  if (response.status === 200) {
    console.log("Success:", response.message);
    processData(response.data);
  } else {
    console.error("Error:", response.message);
  }
}

function processData(data: any): void {
  // Process the data
  console.log("Processing:", data);
}
```

### Form Handling

```typescript
// Form data types
interface UserForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

function validateForm(formData: UserForm): boolean {
  const emailValid: boolean = formData.email.includes("@");
  const passwordValid: boolean = formData.password.length >= 8;
  
  return emailValid && passwordValid;
}

function submitForm(formData: UserForm): void {
  if (validateForm(formData)) {
    console.log("Form is valid, submitting...");
  } else {
    console.log("Form validation failed");
  }
}
```

## Common Mistakes and Best Practices

### ❌ Common Mistakes

```typescript
// Over-annotating when inference works
let message: string = "Hello"; // Unnecessary
let message = "Hello"; // Better

// Using any too liberally
let data: any = fetchData(); // Loses type safety

// Forgetting function parameter types
function greet(name) { // Error: Parameter 'name' implicitly has an 'any' type
  return `Hello ${name}`;
}
```

### ✅ Best Practices

```typescript
// Let TypeScript infer when obvious
let count = 0; // Clear it's a number

// Annotate when intent isn't clear
let userId: string | number; // Will be assigned later

// Always annotate function parameters
function greet(name: string): string {
  return `Hello ${name}`;
}

// Use specific types over general ones
type Status = "pending" | "approved" | "rejected"; // Better than string
let orderStatus: Status = "pending";
```

## Type Annotation Checklist

- [ ] Function parameters are always annotated
- [ ] Return types are annotated for public functions
- [ ] Variables are annotated when type isn't obvious
- [ ] Avoid `any` unless absolutely necessary
- [ ] Use `unknown` instead of `any` when possible
- [ ] Let TypeScript infer types when they're obvious
- [ ] Use specific types over general ones

## Next Steps

Now that you understand basic type annotations, let's explore more complex type structures like interfaces and type aliases.

---

*Continue to: [Interfaces and Type Aliases](04-interfaces-and-types.md)*