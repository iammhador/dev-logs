# Type Guards and Advanced Type Checking

> Master TypeScript's type guards, type predicates, and advanced type checking techniques for runtime type safety

## Introduction to Type Guards

Type guards are runtime checks that help TypeScript narrow down types within conditional blocks, providing both runtime safety and compile-time type information.

### Built-in Type Guards

#### typeof Type Guard

```typescript
// Basic typeof type guard
function processValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    // TypeScript knows value is string here
    return value.toUpperCase();
  }
  
  if (typeof value === "number") {
    // TypeScript knows value is number here
    return value.toFixed(2);
  }
  
  if (typeof value === "boolean") {
    // TypeScript knows value is boolean here
    return value ? "true" : "false";
  }
  
  // TypeScript knows this is unreachable
  return "unknown";
}

// More complex typeof usage
function handleInput(input: unknown): string {
  if (typeof input === "string") {
    return `String: ${input}`;
  }
  
  if (typeof input === "number") {
    return `Number: ${input}`;
  }
  
  if (typeof input === "object" && input !== null) {
    if (Array.isArray(input)) {
      return `Array with ${input.length} items`;
    }
    return `Object: ${JSON.stringify(input)}`;
  }
  
  return `Unknown type: ${typeof input}`;
}

// Function type checking
function executeIfFunction(value: unknown): any {
  if (typeof value === "function") {
    // TypeScript knows value is a function
    return value();
  }
  
  throw new Error("Value is not a function");
}
```

#### instanceof Type Guard

```typescript
// Classes for instanceof examples
class Dog {
  constructor(public name: string) {}
  
  bark(): string {
    return `${this.name} says woof!`;
  }
}

class Cat {
  constructor(public name: string) {}
  
  meow(): string {
    return `${this.name} says meow!`;
  }
}

class Bird {
  constructor(public name: string) {}
  
  fly(): string {
    return `${this.name} is flying!`;
  }
}

// instanceof type guard
function handleAnimal(animal: Dog | Cat | Bird): string {
  if (animal instanceof Dog) {
    // TypeScript knows animal is Dog
    return animal.bark();
  }
  
  if (animal instanceof Cat) {
    // TypeScript knows animal is Cat
    return animal.meow();
  }
  
  if (animal instanceof Bird) {
    // TypeScript knows animal is Bird
    return animal.fly();
  }
  
  // TypeScript knows this is unreachable
  throw new Error("Unknown animal type");
}

// instanceof with built-in types
function processError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  
  if (error instanceof TypeError) {
    return `Type Error: ${error.message}`;
  }
  
  if (error instanceof RangeError) {
    return `Range Error: ${error.message}`;
  }
  
  return `Unknown error: ${String(error)}`;
}

// instanceof with Date, Array, etc.
function handleValue(value: unknown): string {
  if (value instanceof Date) {
    return `Date: ${value.toISOString()}`;
  }
  
  if (value instanceof Array) {
    return `Array with ${value.length} items`;
  }
  
  if (value instanceof RegExp) {
    return `RegExp: ${value.source}`;
  }
  
  return "Unknown value type";
}
```

#### in Operator Type Guard

```typescript
// Interfaces for 'in' operator examples
interface Car {
  brand: string;
  model: string;
  drive(): void;
}

interface Boat {
  name: string;
  length: number;
  sail(): void;
}

interface Plane {
  model: string;
  capacity: number;
  fly(): void;
}

// 'in' operator type guard
function operateVehicle(vehicle: Car | Boat | Plane): string {
  if ("drive" in vehicle) {
    // TypeScript knows vehicle is Car
    vehicle.drive();
    return `Driving ${vehicle.brand} ${vehicle.model}`;
  }
  
  if ("sail" in vehicle) {
    // TypeScript knows vehicle is Boat
    vehicle.sail();
    return `Sailing ${vehicle.name} (${vehicle.length}ft)`;
  }
  
  if ("fly" in vehicle) {
    // TypeScript knows vehicle is Plane
    vehicle.fly();
    return `Flying ${vehicle.model} (capacity: ${vehicle.capacity})`;
  }
  
  throw new Error("Unknown vehicle type");
}

// 'in' operator with optional properties
interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

function getContactInfo(user: User): string {
  const contacts: string[] = [];
  
  if ("email" in user && user.email) {
    contacts.push(`Email: ${user.email}`);
  }
  
  if ("phone" in user && user.phone) {
    contacts.push(`Phone: ${user.phone}`);
  }
  
  return contacts.length > 0 
    ? contacts.join(", ")
    : "No contact information available";
}

// Complex 'in' operator usage
interface ApiSuccessResponse {
  success: true;
  data: any;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code: number;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

function handleApiResponse(response: ApiResponse): string {
  if ("data" in response) {
    // TypeScript knows response is ApiSuccessResponse
    return `Success: ${JSON.stringify(response.data)}`;
  }
  
  if ("error" in response) {
    // TypeScript knows response is ApiErrorResponse
    return `Error ${response.code}: ${response.error}`;
  }
  
  throw new Error("Invalid response format");
}
```

## Custom Type Guards

### Type Predicate Functions

```typescript
// Basic type predicate
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

// Usage of type predicates
function processUnknownValue(value: unknown): string {
  if (isString(value)) {
    // TypeScript knows value is string
    return value.toUpperCase();
  }
  
  if (isNumber(value)) {
    // TypeScript knows value is number
    return value.toFixed(2);
  }
  
  if (isBoolean(value)) {
    // TypeScript knows value is boolean
    return value ? "YES" : "NO";
  }
  
  return "Unknown type";
}

// Complex type predicate for objects
interface Person {
  name: string;
  age: number;
  email?: string;
}

function isPerson(value: unknown): value is Person {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "age" in value &&
    typeof (value as any).name === "string" &&
    typeof (value as any).age === "number" &&
    ((value as any).email === undefined || typeof (value as any).email === "string")
  );
}

// Array type predicate
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(item => typeof item === "number");
}

// Generic type predicate
function isArrayOf<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemGuard);
}

// Usage of generic type predicate
const data: unknown = ["hello", "world", "typescript"];

if (isArrayOf(data, isString)) {
  // TypeScript knows data is string[]
  console.log(data.map(s => s.toUpperCase()));
}
```

### Advanced Type Predicates

```typescript
// Type predicate for discriminated unions
interface Circle {
  kind: "circle";
  radius: number;
}

interface Rectangle {
  kind: "rectangle";
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

// Type predicates for each shape
function isCircle(shape: Shape): shape is Circle {
  return shape.kind === "circle";
}

function isRectangle(shape: Shape): shape is Rectangle {
  return shape.kind === "rectangle";
}

function isTriangle(shape: Shape): shape is Triangle {
  return shape.kind === "triangle";
}

// Calculate area using type predicates
function calculateArea(shape: Shape): number {
  if (isCircle(shape)) {
    return Math.PI * shape.radius * shape.radius;
  }
  
  if (isRectangle(shape)) {
    return shape.width * shape.height;
  }
  
  if (isTriangle(shape)) {
    return (shape.base * shape.height) / 2;
  }
  
  // TypeScript knows this is unreachable
  throw new Error("Unknown shape");
}

// Type predicate for nullable values
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// Usage with array filtering
const mixedArray: (string | null | undefined)[] = ["hello", null, "world", undefined, "typescript"];

const validStrings = mixedArray.filter(isNotNullOrUndefined);
// TypeScript knows validStrings is string[]

console.log(validStrings.map(s => s.toUpperCase()));
```

### Type Guards for API Responses

```typescript
// API response type guards
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Type guard for User
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).id === "number" &&
    typeof (value as any).name === "string" &&
    typeof (value as any).email === "string" &&
    typeof (value as any).createdAt === "string"
  );
}

// Type guard for Product
function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).id === "number" &&
    typeof (value as any).name === "string" &&
    typeof (value as any).price === "number" &&
    typeof (value as any).category === "string"
  );
}

// Generic API response type guard
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function isApiResponse<T>(
  value: unknown,
  dataGuard: (data: unknown) => data is T
): value is ApiResponse<T> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  
  const response = value as any;
  
  if (typeof response.success !== "boolean") {
    return false;
  }
  
  if (response.data !== undefined && !dataGuard(response.data)) {
    return false;
  }
  
  if (response.error !== undefined && typeof response.error !== "string") {
    return false;
  }
  
  return true;
}

// Usage
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (isApiResponse(data, isUser)) {
    if (data.success && data.data) {
      return data.data; // TypeScript knows this is User
    }
    throw new Error(data.error || "Unknown error");
  }
  
  throw new Error("Invalid API response format");
}
```

## Discriminated Unions and Exhaustive Checking

### Basic Discriminated Unions

```typescript
// Discriminated union with literal types
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: any;
}

interface ErrorState {
  status: "error";
  error: string;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

// Type guard using discriminant property
function handleAsyncState(state: AsyncState): string {
  switch (state.status) {
    case "loading":
      return "Loading...";
    
    case "success":
      // TypeScript knows state is SuccessState
      return `Success: ${JSON.stringify(state.data)}`;
    
    case "error":
      // TypeScript knows state is ErrorState
      return `Error: ${state.error}`;
    
    default:
      // Exhaustive check - TypeScript ensures all cases are handled
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}

// Type predicate for discriminated union
function isSuccessState(state: AsyncState): state is SuccessState {
  return state.status === "success";
}

function isErrorState(state: AsyncState): state is ErrorState {
  return state.status === "error";
}

function isLoadingState(state: AsyncState): state is LoadingState {
  return state.status === "loading";
}
```

### Complex Discriminated Unions

```typescript
// Complex discriminated union for form validation
interface ValidField {
  type: "valid";
  value: string;
}

interface InvalidField {
  type: "invalid";
  value: string;
  errors: string[];
}

interface PendingField {
  type: "pending";
  value: string;
  validationPromise: Promise<boolean>;
}

type FieldState = ValidField | InvalidField | PendingField;

// Type guards for field states
function isValidField(field: FieldState): field is ValidField {
  return field.type === "valid";
}

function isInvalidField(field: FieldState): field is InvalidField {
  return field.type === "invalid";
}

function isPendingField(field: FieldState): field is PendingField {
  return field.type === "pending";
}

// Form validation handler
function renderField(field: FieldState): string {
  if (isValidField(field)) {
    return `✓ ${field.value}`;
  }
  
  if (isInvalidField(field)) {
    const errorList = field.errors.join(", ");
    return `✗ ${field.value} (${errorList})`;
  }
  
  if (isPendingField(field)) {
    return `⏳ ${field.value} (validating...)`;
  }
  
  // Exhaustive check
  const exhaustiveCheck: never = field;
  throw new Error(`Unhandled field type: ${exhaustiveCheck}`);
}

// Event system with discriminated unions
interface UserLoginEvent {
  type: "user:login";
  userId: string;
  timestamp: Date;
}

interface UserLogoutEvent {
  type: "user:logout";
  userId: string;
  timestamp: Date;
}

interface ProductCreatedEvent {
  type: "product:created";
  productId: number;
  name: string;
  timestamp: Date;
}

interface ProductUpdatedEvent {
  type: "product:updated";
  productId: number;
  changes: Record<string, any>;
  timestamp: Date;
}

type AppEvent = UserLoginEvent | UserLogoutEvent | ProductCreatedEvent | ProductUpdatedEvent;

// Event handler with type guards
function handleEvent(event: AppEvent): void {
  switch (event.type) {
    case "user:login":
      console.log(`User ${event.userId} logged in at ${event.timestamp}`);
      break;
    
    case "user:logout":
      console.log(`User ${event.userId} logged out at ${event.timestamp}`);
      break;
    
    case "product:created":
      console.log(`Product "${event.name}" created with ID ${event.productId}`);
      break;
    
    case "product:updated":
      console.log(`Product ${event.productId} updated:`, event.changes);
      break;
    
    default:
      // Exhaustive check ensures all event types are handled
      const exhaustiveCheck: never = event;
      throw new Error(`Unhandled event type: ${exhaustiveCheck}`);
  }
}
```

## Assertion Functions

### Basic Assertion Functions

```typescript
// Basic assertion function
function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

// Type assertion function
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`Expected string, got ${typeof value}`);
  }
}

function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Expected number, got ${typeof value}`);
  }
}

// Usage of assertion functions
function processUserInput(input: unknown): string {
  assertIsString(input);
  // TypeScript now knows input is string
  return input.toUpperCase();
}

function calculateSquare(input: unknown): number {
  assertIsNumber(input);
  // TypeScript now knows input is number
  return input * input;
}

// Complex assertion function
function assertIsUser(value: unknown): asserts value is User {
  if (!isPerson(value)) {
    throw new Error("Value is not a valid User object");
  }
}

// Assertion function for non-null values
function assertNotNull<T>(value: T | null): asserts value is T {
  if (value === null) {
    throw new Error("Value is null");
  }
}

function assertNotUndefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error("Value is undefined");
  }
}

function assertNotNullOrUndefined<T>(value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}
```

### Advanced Assertion Functions

```typescript
// Assertion function for array validation
function assertIsArrayOf<T>(
  value: unknown,
  itemAssertion: (item: unknown) => asserts item is T
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error("Value is not an array");
  }
  
  value.forEach((item, index) => {
    try {
      itemAssertion(item);
    } catch (error) {
      throw new Error(`Item at index ${index} is invalid: ${error.message}`);
    }
  });
}

// Assertion function for object properties
function assertHasProperty<T, K extends string>(
  obj: T,
  key: K
): asserts obj is T & Record<K, unknown> {
  if (typeof obj !== "object" || obj === null || !(key in obj)) {
    throw new Error(`Object does not have property '${key}'`);
  }
}

// Usage examples
function processApiData(data: unknown): void {
  assertIsArrayOf(data, assertIsUser);
  // TypeScript now knows data is User[]
  
  data.forEach(user => {
    console.log(`Processing user: ${user.name}`);
  });
}

function processConfig(config: unknown): void {
  assertHasProperty(config, "apiUrl");
  assertHasProperty(config, "timeout");
  
  // TypeScript knows config has apiUrl and timeout properties
  assertIsString(config.apiUrl);
  assertIsNumber(config.timeout);
  
  console.log(`API URL: ${config.apiUrl}, Timeout: ${config.timeout}`);
}
```

## Practical Examples

### Form Validation with Type Guards

```typescript
// Form field types
interface FormField {
  name: string;
  value: string;
  required: boolean;
}

interface EmailField extends FormField {
  type: "email";
}

interface PasswordField extends FormField {
  type: "password";
  minLength: number;
}

interface NumberField extends FormField {
  type: "number";
  min?: number;
  max?: number;
}

type Field = EmailField | PasswordField | NumberField;

// Type guards for field types
function isEmailField(field: Field): field is EmailField {
  return field.type === "email";
}

function isPasswordField(field: Field): field is PasswordField {
  return field.type === "password";
}

function isNumberField(field: Field): field is NumberField {
  return field.type === "number";
}

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string, minLength: number): boolean {
  return password.length >= minLength;
}

function validateNumber(value: string, min?: number, max?: number): boolean {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}

// Main validation function using type guards
function validateField(field: Field): { isValid: boolean; error?: string } {
  if (field.required && !field.value.trim()) {
    return { isValid: false, error: `${field.name} is required` };
  }
  
  if (isEmailField(field)) {
    if (field.value && !validateEmail(field.value)) {
      return { isValid: false, error: "Invalid email format" };
    }
  } else if (isPasswordField(field)) {
    if (field.value && !validatePassword(field.value, field.minLength)) {
      return { isValid: false, error: `Password must be at least ${field.minLength} characters` };
    }
  } else if (isNumberField(field)) {
    if (field.value && !validateNumber(field.value, field.min, field.max)) {
      let error = "Invalid number";
      if (field.min !== undefined && field.max !== undefined) {
        error += ` (must be between ${field.min} and ${field.max})`;
      } else if (field.min !== undefined) {
        error += ` (must be at least ${field.min})`;
      } else if (field.max !== undefined) {
        error += ` (must be at most ${field.max})`;
      }
      return { isValid: false, error };
    }
  }
  
  return { isValid: true };
}
```

### API Client with Type Guards

```typescript
// API response types
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Type guards for API responses
function isApiSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

function isApiErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

// Generic API client
class ApiClient {
  constructor(private baseUrl: string) {}
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data: ApiResponse<T> = await response.json();
    
    if (isApiSuccessResponse(data)) {
      return data.data;
    }
    
    if (isApiErrorResponse(data)) {
      throw new Error(`API Error ${data.error.code}: ${data.error.message}`);
    }
    
    throw new Error('Invalid API response format');
  }
  
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

// Usage with type safety
const apiClient = new ApiClient('https://api.example.com');

async function fetchUser(id: number): Promise<User> {
  try {
    const user = await apiClient.get<User>(`/users/${id}`);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Use type predicates for reusable type checking
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as any).id === "number" &&
    typeof (value as any).name === "string" &&
    isValidEmail((value as any).email)
  );
}

// Use discriminated unions for state management
type RequestState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; error: string };

// Use assertion functions for runtime validation
function assertIsPositiveNumber(value: unknown): asserts value is number {
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Expected positive number");
  }
}

// Use exhaustive checking with never
function handleState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading...";
    case "success":
      return `Success: ${state.data}`;
    case "error":
      return `Error: ${state.error}`;
    default:
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}
```

### ❌ Avoid

```typescript
// Don't use type assertions without validation
function badTypeAssertion(value: unknown): User {
  return value as User; // Dangerous - no runtime check
}

// Don't ignore exhaustive checking
function incompleteHandler(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading...";
    // Missing success and error cases
  }
  return "Unknown"; // This hides missing cases
}

// Don't make type guards too complex
function overlyComplexGuard(value: unknown): value is ComplexType {
  // 50 lines of validation logic...
  // Better to break into smaller, focused guards
}

// Don't use any in type guards
function badGuard(value: any): value is User {
  return value.id && value.name; // Loses type safety
}
```

## Summary Checklist

- [ ] Use built-in type guards (`typeof`, `instanceof`, `in`)
- [ ] Create custom type predicates with `value is Type`
- [ ] Use discriminated unions for complex state management
- [ ] Implement exhaustive checking with `never`
- [ ] Use assertion functions for runtime validation
- [ ] Combine type guards with control flow analysis
- [ ] Validate API responses with type guards
- [ ] Use type guards in array filtering and mapping
- [ ] Avoid unsafe type assertions
- [ ] Keep type guards focused and reusable

## Next Steps

Now that you understand type guards and advanced type checking, let's explore advanced TypeScript features like keyof, typeof, and conditional types.

---

*Continue to: [Advanced TypeScript Features](13-advanced-features.md)*