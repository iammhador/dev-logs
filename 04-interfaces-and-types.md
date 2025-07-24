# Interfaces and Type Aliases

> Learn how to define custom types using interfaces and type aliases, and understand when to use each

## What are Interfaces?

Interfaces define the structure of objects, specifying what properties and methods an object should have. They act as contracts that ensure objects conform to a specific shape.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Object must match the interface
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
```

## Basic Interface Syntax

### Simple Interface

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

function displayProduct(product: Product): void {
  console.log(`${product.name}: $${product.price}`);
}

const laptop: Product = {
  id: 1,
  name: "MacBook Pro",
  price: 1999,
  description: "Powerful laptop for professionals"
};

displayProduct(laptop);
```

### Optional Properties

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string; // Optional property
  bio?: string;
  website?: string;
}

// Valid - optional properties can be omitted
const user1: UserProfile = {
  id: 1,
  username: "johndoe",
  email: "john@example.com"
};

// Also valid - optional properties included
const user2: UserProfile = {
  id: 2,
  username: "janedoe",
  email: "jane@example.com",
  avatar: "avatar.jpg",
  bio: "Software developer"
};
```

### Readonly Properties

```typescript
interface Config {
  readonly apiUrl: string;
  readonly version: string;
  timeout: number; // Can be modified
}

const appConfig: Config = {
  apiUrl: "https://api.example.com",
  version: "1.0.0",
  timeout: 5000
};

// appConfig.apiUrl = "new-url"; // Error: Cannot assign to 'apiUrl' because it is a read-only property
appConfig.timeout = 10000; // OK: timeout is not readonly
```

## Interface Extension

### Basic Extension

```typescript
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

interface Cat extends Animal {
  color: string;
  meow(): void;
}

const myDog: Dog = {
  name: "Buddy",
  age: 3,
  breed: "Golden Retriever",
  bark() {
    console.log("Woof!");
  }
};
```

### Multiple Extension

```typescript
interface Flyable {
  fly(): void;
  altitude: number;
}

interface Swimmable {
  swim(): void;
  depth: number;
}

// Extending multiple interfaces
interface Duck extends Animal, Flyable, Swimmable {
  quack(): void;
}

const duck: Duck = {
  name: "Donald",
  age: 2,
  altitude: 0,
  depth: 0,
  fly() {
    this.altitude = 100;
    console.log("Flying!");
  },
  swim() {
    this.depth = 5;
    console.log("Swimming!");
  },
  quack() {
    console.log("Quack!");
  }
};
```

## Function Types in Interfaces

### Method Signatures

```typescript
interface Calculator {
  // Method signature
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  
  // Property with function type
  multiply: (a: number, b: number) => number;
  
  // Optional method
  divide?(a: number, b: number): number;
}

const calc: Calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
  multiply: (a, b) => a * b
  // divide is optional, so we can omit it
};
```

### Event Handler Interfaces

```typescript
interface EventHandler {
  onClick(event: MouseEvent): void;
  onKeyPress(event: KeyboardEvent): void;
  onSubmit?(event: SubmitEvent): void;
}

interface ButtonProps {
  text: string;
  disabled?: boolean;
  handler: EventHandler;
}

function createButton(props: ButtonProps): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = props.text;
  button.disabled = props.disabled || false;
  
  button.addEventListener('click', props.handler.onClick);
  button.addEventListener('keypress', props.handler.onKeyPress);
  
  return button;
}
```

## Index Signatures

### String Index Signatures

```typescript
interface StringDictionary {
  [key: string]: string;
}

const translations: StringDictionary = {
  hello: "Hola",
  goodbye: "Adiós",
  thanks: "Gracias"
};

// Can add any string key
translations.welcome = "Bienvenido";
```

### Number Index Signatures

```typescript
interface NumberArray {
  [index: number]: number;
  length: number; // Can have named properties too
}

const scores: NumberArray = {
  0: 95,
  1: 87,
  2: 92,
  length: 3
};
```

### Mixed Index Signatures

```typescript
interface MixedDictionary {
  [key: string]: string | number;
  name: string; // Must be compatible with index signature
  age: number;
}

const person: MixedDictionary = {
  name: "John",
  age: 30,
  city: "New York",
  zipCode: 10001
};
```

## Type Aliases

Type aliases create new names for existing types, including complex type combinations.

### Basic Type Aliases

```typescript
// Primitive type alias
type UserID = string;
type Age = number;
type IsActive = boolean;

// Using type aliases
function getUser(id: UserID): User | null {
  // Implementation
  return null;
}

function updateAge(userId: UserID, newAge: Age): void {
  // Implementation
}
```

### Object Type Aliases

```typescript
type Point = {
  x: number;
  y: number;
};

type Rectangle = {
  topLeft: Point;
  bottomRight: Point;
};

function calculateArea(rect: Rectangle): number {
  const width = rect.bottomRight.x - rect.topLeft.x;
  const height = rect.bottomRight.y - rect.topLeft.y;
  return width * height;
}
```

### Union Types

```typescript
type Status = "pending" | "approved" | "rejected" | "cancelled";
type Theme = "light" | "dark" | "auto";
type Size = "small" | "medium" | "large";

// Union of different types
type ID = string | number;
type Response = string | { error: string } | { data: any };

function handleResponse(response: Response): void {
  if (typeof response === "string") {
    console.log("Message:", response);
  } else if ("error" in response) {
    console.error("Error:", response.error);
  } else {
    console.log("Data:", response.data);
  }
}
```

### Function Type Aliases

```typescript
// Function type aliases
type EventCallback = (event: Event) => void;
type Validator<T> = (value: T) => boolean;
type Transformer<T, U> = (input: T) => U;

// Using function type aliases
const emailValidator: Validator<string> = (email) => {
  return email.includes("@");
};

const stringToNumber: Transformer<string, number> = (str) => {
  return parseInt(str, 10);
};

function addEventListener(element: HTMLElement, event: string, callback: EventCallback): void {
  element.addEventListener(event, callback);
}
```

## Intersection Types

```typescript
type Name = {
  firstName: string;
  lastName: string;
};

type Contact = {
  email: string;
  phone: string;
};

type Address = {
  street: string;
  city: string;
  zipCode: string;
};

// Intersection type - combines all properties
type Person = Name & Contact & Address;

const person: Person = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "555-1234",
  street: "123 Main St",
  city: "Anytown",
  zipCode: "12345"
};

// Intersection with interfaces
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

type UserWithTimestamp = User & Timestamped;
```

## Interface vs Type Alias: When to Use Which?

### Use Interfaces When:

```typescript
// 1. Defining object shapes
interface User {
  id: number;
  name: string;
}

// 2. You need declaration merging
interface Window {
  customProperty: string;
}

// Later in another file...
interface Window {
  anotherProperty: number;
}
// Window now has both properties

// 3. Extending classes
class BaseUser implements User {
  constructor(public id: number, public name: string) {}
}

// 4. When you might extend later
interface AdminUser extends User {
  permissions: string[];
}
```

### Use Type Aliases When:

```typescript
// 1. Union types
type Status = "loading" | "success" | "error";

// 2. Intersection types
type UserWithRole = User & { role: string };

// 3. Computed properties
type Keys = "name" | "email";
type UserSubset = {
  [K in Keys]: string;
};

// 4. Complex type manipulations
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// 5. Function types
type EventHandler = (event: Event) => void;

// 6. Primitive aliases
type UserID = string;
```

## Advanced Interface Patterns

### Generic Interfaces

```typescript
interface Repository<T> {
  findById(id: string): T | null;
  save(entity: T): T;
  delete(id: string): boolean;
  findAll(): T[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository implements Repository<User> {
  private users: User[] = [];
  
  findById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }
  
  save(user: User): User {
    this.users.push(user);
    return user;
  }
  
  delete(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
  
  findAll(): User[] {
    return [...this.users];
  }
}
```

### Conditional Properties

```typescript
interface BaseConfig {
  apiUrl: string;
  timeout: number;
}

interface DevConfig extends BaseConfig {
  debug: true;
  logLevel: "verbose" | "info" | "warn" | "error";
}

interface ProdConfig extends BaseConfig {
  debug: false;
  compression: boolean;
}

type Config = DevConfig | ProdConfig;

function createLogger(config: Config): void {
  if (config.debug) {
    // TypeScript knows this is DevConfig
    console.log(`Log level: ${config.logLevel}`);
  } else {
    // TypeScript knows this is ProdConfig
    console.log(`Compression: ${config.compression}`);
  }
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Use descriptive names
interface UserAccount {
  id: string;
  email: string;
}

// Group related properties
interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  };
  contact: {
    email: string;
    phone?: string;
  };
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// Use readonly for immutable data
interface ApiResponse {
  readonly data: any;
  readonly status: number;
  readonly timestamp: Date;
}
```

### ❌ Avoid

```typescript
// Don't use overly generic names
interface Data {
  value: any;
}

// Don't make everything optional
interface BadUser {
  id?: string;
  name?: string;
  email?: string;
}

// Don't use any when you can be specific
interface BadResponse {
  data: any; // Be more specific about the data structure
}
```

## Next Steps

Now that you understand interfaces and type aliases, let's explore how to add types to functions, including parameters, return types, and overloads.

---

*Continue to: [Functions and Type Safety](05-functions-and-type-safety.md)*