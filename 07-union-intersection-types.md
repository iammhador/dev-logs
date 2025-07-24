# Union and Intersection Types

> Learn how to combine types using unions and intersections to create flexible and powerful type definitions

## Union Types

Union types allow a value to be one of several types, using the `|` operator.

### Basic Union Types

```typescript
// Basic union types
type StringOrNumber = string | number;
type Status = "pending" | "approved" | "rejected";
type Theme = "light" | "dark" | "auto";

// Using union types
let id: StringOrNumber = "user123";
id = 456; // Also valid

let currentStatus: Status = "pending";
// currentStatus = "invalid"; // Error: Type '"invalid"' is not assignable

function setTheme(theme: Theme): void {
  document.body.setAttribute("data-theme", theme);
}

setTheme("dark"); // OK
// setTheme("blue"); // Error: Argument of type '"blue"' is not assignable
```

### Union Types with Objects

```typescript
// Union of object types
type Cat = {
  type: "cat";
  meow: () => void;
  purr: () => void;
};

type Dog = {
  type: "dog";
  bark: () => void;
  wag: () => void;
};

type Pet = Cat | Dog;

// Function accepting union type
function handlePet(pet: Pet): void {
  // Can only access common properties
  console.log(`Pet type: ${pet.type}`);
  
  // Need type narrowing for specific properties
  if (pet.type === "cat") {
    pet.meow(); // TypeScript knows this is a Cat
    pet.purr();
  } else {
    pet.bark(); // TypeScript knows this is a Dog
    pet.wag();
  }
}
```

### Discriminated Unions

Discriminated unions use a common property to distinguish between union members.

```typescript
// Discriminated union with literal types
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: any;
};

type ErrorState = {
  status: "error";
  error: string;
};

type ApiState = LoadingState | SuccessState | ErrorState;

// Type-safe handling of discriminated unions
function handleApiState(state: ApiState): void {
  switch (state.status) {
    case "loading":
      console.log("Loading...");
      break;
    case "success":
      console.log("Data:", state.data); // TypeScript knows state.data exists
      break;
    case "error":
      console.error("Error:", state.error); // TypeScript knows state.error exists
      break;
    default:
      // Exhaustiveness check
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled state: ${exhaustiveCheck}`);
  }
}
```

### Complex Discriminated Unions

```typescript
// Shape examples
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Triangle = {
  kind: "triangle";
  base: number;
  height: number;
};

type Shape = Circle | Rectangle | Triangle;

// Calculate area with type safety
function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      const exhaustiveCheck: never = shape;
      throw new Error(`Unknown shape: ${exhaustiveCheck}`);
  }
}

// Usage
const circle: Circle = { kind: "circle", radius: 5 };
const rectangle: Rectangle = { kind: "rectangle", width: 10, height: 20 };

console.log(calculateArea(circle)); // 78.54
console.log(calculateArea(rectangle)); // 200
```

### Union Types with Functions

```typescript
// Function union types
type EventHandler = (() => void) | ((event: Event) => void);

function addEventListener(element: HTMLElement, eventType: string, handler: EventHandler): void {
  if (handler.length === 0) {
    // Handler takes no parameters
    element.addEventListener(eventType, handler as () => void);
  } else {
    // Handler takes event parameter
    element.addEventListener(eventType, handler as (event: Event) => void);
  }
}

// Union of different function signatures
type Formatter = 
  | ((value: string) => string)
  | ((value: number) => string)
  | ((value: boolean) => string);

const formatters: Formatter[] = [
  (value: string) => value.toUpperCase(),
  (value: number) => value.toFixed(2),
  (value: boolean) => value ? "Yes" : "No"
];
```

## Type Narrowing with Union Types

### Using typeof

```typescript
function processValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // TypeScript knows value is string
  } else if (typeof value === "number") {
    return value.toFixed(2); // TypeScript knows value is number
  } else {
    return value ? "true" : "false"; // TypeScript knows value is boolean
  }
}
```

### Using instanceof

```typescript
class Car {
  drive() { console.log("Driving car"); }
}

class Bike {
  ride() { console.log("Riding bike"); }
}

function useVehicle(vehicle: Car | Bike): void {
  if (vehicle instanceof Car) {
    vehicle.drive(); // TypeScript knows vehicle is Car
  } else {
    vehicle.ride(); // TypeScript knows vehicle is Bike
  }
}
```

### Using 'in' operator

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird): void {
  if ("swim" in animal) {
    animal.swim(); // TypeScript knows animal is Fish
  } else {
    animal.fly(); // TypeScript knows animal is Bird
  }
}
```

### Custom Type Guards

```typescript
// Custom type guard functions
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isUser(obj: any): obj is User {
  return obj && typeof obj.id === "number" && typeof obj.name === "string";
}

// Using custom type guards
function processUnknown(value: unknown): string {
  if (isString(value)) {
    return value.toUpperCase();
  } else if (isNumber(value)) {
    return value.toString();
  } else {
    return "Unknown type";
  }
}
```

## Intersection Types

Intersection types combine multiple types into one, using the `&` operator.

### Basic Intersection Types

```typescript
// Basic intersection
type Name = {
  firstName: string;
  lastName: string;
};

type Contact = {
  email: string;
  phone: string;
};

type Person = Name & Contact;

// Person has all properties from both types
const person: Person = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234"
};
```

### Intersection with Interfaces

```typescript
interface Serializable {
  serialize(): string;
}

interface Loggable {
  log(): void;
}

// Intersection of interfaces
type SerializableLoggable = Serializable & Loggable;

class DataModel implements SerializableLoggable {
  constructor(private data: any) {}
  
  serialize(): string {
    return JSON.stringify(this.data);
  }
  
  log(): void {
    console.log(this.serialize());
  }
}
```

### Intersection with Function Types

```typescript
type EventEmitter = {
  on(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
};

type Disposable = {
  dispose(): void;
};

type EventEmitterWithDisposal = EventEmitter & Disposable;

class MyEventEmitter implements EventEmitterWithDisposal {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }
  
  dispose(): void {
    this.listeners.clear();
  }
}
```

### Merging Object Types

```typescript
// Merging configuration objects
type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
};

type AuthConfig = {
  username: string;
  password: string;
};

type SSLConfig = {
  ssl: boolean;
  cert?: string;
};

type FullConfig = DatabaseConfig & AuthConfig & SSLConfig;

const config: FullConfig = {
  host: "localhost",
  port: 5432,
  database: "myapp",
  username: "admin",
  password: "secret",
  ssl: true,
  cert: "/path/to/cert"
};
```

## Advanced Union and Intersection Patterns

### Conditional Types with Unions

```typescript
// Conditional type based on union
type ApiResponse<T> = T extends string
  ? { message: T }
  : T extends number
  ? { code: T }
  : { data: T };

type StringResponse = ApiResponse<string>; // { message: string }
type NumberResponse = ApiResponse<number>; // { code: number }
type ObjectResponse = ApiResponse<User>; // { data: User }
```

### Distributive Conditional Types

```typescript
// Distributive conditional types with unions
type ToArray<T> = T extends any ? T[] : never;

type StringOrNumberArray = ToArray<string | number>;
// Distributes to: ToArray<string> | ToArray<number>
// Results in: string[] | number[]

// Non-distributive version
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type Combined = ToArrayNonDistributive<string | number>;
// Results in: (string | number)[]
```

### Utility Types with Intersections

```typescript
// Merge utility type
type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

type A = { a: string; b: number };
type B = { b: string; c: boolean };
type Merged = Merge<A, B>; // { a: string; b: string; c: boolean }

// Override utility type
type Override<T, U> = Omit<T, keyof U> & U;

type Original = { id: number; name: string; email: string };
type Updates = { name: string; age: number };
type Updated = Override<Original, Updates>; // { id: number; email: string; name: string; age: number }
```

## Practical Examples

### API Response Handling

```typescript
// API response types
type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiError = {
  success: false;
  error: string;
  code: number;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Type-safe response handling
function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.success) {
    console.log("Success:", response.message);
    return response.data;
  } else {
    console.error(`Error ${response.code}: ${response.error}`);
    return null;
  }
}

// Usage
const userResponse: ApiResponse<User> = {
  success: true,
  data: { id: 1, name: "John", email: "john@example.com" }
};

const user = handleApiResponse(userResponse);
```

### Form Validation

```typescript
// Validation result types
type ValidationSuccess = {
  valid: true;
  value: any;
};

type ValidationError = {
  valid: false;
  errors: string[];
};

type ValidationResult = ValidationSuccess | ValidationError;

// Validator functions
type Validator<T> = (value: T) => ValidationResult;

const emailValidator: Validator<string> = (email) => {
  const errors: string[] = [];
  
  if (!email.includes("@")) {
    errors.push("Email must contain @");
  }
  
  if (email.length < 5) {
    errors.push("Email must be at least 5 characters");
  }
  
  return errors.length === 0
    ? { valid: true, value: email }
    : { valid: false, errors };
};

// Combine validators
function combineValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    const allErrors: string[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        allErrors.push(...result.errors);
      }
    }
    
    return allErrors.length === 0
      ? { valid: true, value }
      : { valid: false, errors: allErrors };
  };
}
```

### Event System

```typescript
// Event types
type ClickEvent = {
  type: "click";
  x: number;
  y: number;
  button: "left" | "right" | "middle";
};

type KeyEvent = {
  type: "keypress";
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
};

type ResizeEvent = {
  type: "resize";
  width: number;
  height: number;
};

type AppEvent = ClickEvent | KeyEvent | ResizeEvent;

// Event handler types
type EventHandler<T extends AppEvent> = (event: T) => void;

// Type-safe event dispatcher
class EventDispatcher {
  private handlers: {
    click: EventHandler<ClickEvent>[];
    keypress: EventHandler<KeyEvent>[];
    resize: EventHandler<ResizeEvent>[];
  } = {
    click: [],
    keypress: [],
    resize: []
  };
  
  on<T extends AppEvent["type"]>(
    eventType: T,
    handler: EventHandler<Extract<AppEvent, { type: T }>>
  ): void {
    this.handlers[eventType].push(handler as any);
  }
  
  emit<T extends AppEvent>(event: T): void {
    const handlers = this.handlers[event.type] as EventHandler<T>[];
    handlers.forEach(handler => handler(event));
  }
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Use discriminated unions for complex state
type RequestState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: any }
  | { status: "error"; error: string };

// Use intersection for composing types
type TimestampedUser = User & {
  createdAt: Date;
  updatedAt: Date;
};

// Use literal types in unions for better type safety
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

// Use type guards for runtime type checking
function isErrorResponse(response: ApiResponse<any>): response is ApiError {
  return !response.success;
}
```

### ❌ Avoid

```typescript
// Don't use overly complex unions
type BadUnion = string | number | boolean | object | Function | symbol; // Too broad

// Don't forget exhaustiveness checking
function badHandler(state: RequestState): void {
  switch (state.status) {
    case "loading":
      // Handle loading
      break;
    case "success":
      // Handle success
      break;
    // Missing "idle" and "error" cases!
  }
}

// Don't use intersection with conflicting types
type Conflicting = { id: string } & { id: number }; // id becomes never
```

## Summary Checklist

- [ ] Use union types for values that can be one of several types
- [ ] Use discriminated unions for complex state management
- [ ] Implement exhaustiveness checking with `never`
- [ ] Use intersection types to combine multiple type contracts
- [ ] Implement proper type narrowing with type guards
- [ ] Use literal types in unions for better type safety
- [ ] Avoid overly complex union types
- [ ] Consider using branded types for better type safety

## Next Steps

Now that you understand union and intersection types, let's explore type inference and type narrowing techniques in more detail.

---

*Continue to: [Type Inference and Narrowing](08-type-inference-narrowing.md)*