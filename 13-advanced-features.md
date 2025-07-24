# Advanced TypeScript Features

> Explore advanced TypeScript features including keyof, typeof, conditional types, mapped types, and template literal types

## keyof Operator

The `keyof` operator creates a union type of all property names of a given type.

### Basic keyof Usage

```typescript
// Basic keyof example
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// keyof creates a union of property names
type UserKeys = keyof User; // "id" | "name" | "email" | "age"

// Using keyof in function parameters
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  age: 30
};

const name = getProperty(user, "name"); // Type: string
const age = getProperty(user, "age"); // Type: number
// const invalid = getProperty(user, "invalid"); // Error: Argument of type '"invalid"' is not assignable

// keyof with arrays
const fruits = ["apple", "banana", "orange"] as const;
type FruitKeys = keyof typeof fruits; // "0" | "1" | "2" | "length" | "toString" | ...

// keyof with string literal types
type Colors = {
  red: string;
  green: string;
  blue: string;
};

type ColorKeys = keyof Colors; // "red" | "green" | "blue"
```

### Advanced keyof Patterns

```typescript
// keyof with generic constraints
function updateProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): T {
  return {
    ...obj,
    [key]: value
  };
}

const updatedUser = updateProperty(user, "name", "Jane Doe");
const updatedAge = updateProperty(user, "age", 31);
// const invalid = updateProperty(user, "name", 123); // Error: Type 'number' is not assignable to type 'string'

// keyof with multiple objects
function copyProperty<T, U, K extends keyof T & keyof U>(
  source: T,
  target: U,
  key: K
): U {
  return {
    ...target,
    [key]: source[key]
  };
}

interface Employee {
  id: number;
  name: string;
  department: string;
}

const employee: Employee = {
  id: 1,
  name: "John",
  department: "Engineering"
};

// Can copy properties that exist in both types
const result = copyProperty(user, employee, "name"); // OK: both have 'name'
// const invalid = copyProperty(user, employee, "email"); // Error: 'email' doesn't exist in Employee

// keyof with conditional types
type StringPropertyNames<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type UserStringProps = StringPropertyNames<User>; // "name" | "email"

// keyof with filtering
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type UserStringProperties = PickByType<User, string>; // { name: string; email: string }
type UserNumberProperties = PickByType<User, number>; // { id: number; age: number }
```

## typeof Operator

The `typeof` operator captures the type of a value or variable.

### Basic typeof Usage

```typescript
// typeof with variables
const message = "Hello, TypeScript!";
type MessageType = typeof message; // string

const count = 42;
type CountType = typeof count; // number

const isActive = true;
type IsActiveType = typeof isActive; // boolean

// typeof with objects
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  debug: false
};

type Config = typeof config;
// {
//   apiUrl: string;
//   timeout: number;
//   retries: number;
//   debug: boolean;
// }

// typeof with functions
function calculateArea(width: number, height: number): number {
  return width * height;
}

type CalculateAreaType = typeof calculateArea;
// (width: number, height: number) => number

// typeof with classes
class DatabaseConnection {
  constructor(public connectionString: string) {}
  
  connect(): void {
    console.log("Connecting to database...");
  }
}

type DatabaseConnectionType = typeof DatabaseConnection;
// typeof DatabaseConnection (constructor type)

type DatabaseInstanceType = InstanceType<typeof DatabaseConnection>;
// DatabaseConnection (instance type)
```

### Advanced typeof Patterns

```typescript
// typeof with const assertions
const themes = {
  light: {
    background: "#ffffff",
    text: "#000000"
  },
  dark: {
    background: "#000000",
    text: "#ffffff"
  }
} as const;

type Themes = typeof themes;
// {
//   readonly light: {
//     readonly background: "#ffffff";
//     readonly text: "#000000";
//   };
//   readonly dark: {
//     readonly background: "#000000";
//     readonly text: "#ffffff";
//   };
// }

type ThemeNames = keyof typeof themes; // "light" | "dark"
type ThemeColors = typeof themes["light"]; // { readonly background: "#ffffff"; readonly text: "#000000"; }

// typeof with arrays
const statusCodes = [200, 404, 500] as const;
type StatusCodes = typeof statusCodes; // readonly [200, 404, 500]
type StatusCode = typeof statusCodes[number]; // 200 | 404 | 500

// typeof with enum-like objects
const UserRole = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest"
} as const;

type UserRoleType = typeof UserRole;
type UserRoleValue = typeof UserRole[keyof typeof UserRole]; // "admin" | "user" | "guest"

// typeof with complex nested structures
const apiEndpoints = {
  users: {
    list: "/api/users",
    create: "/api/users",
    update: (id: number) => `/api/users/${id}`,
    delete: (id: number) => `/api/users/${id}`
  },
  products: {
    list: "/api/products",
    create: "/api/products",
    update: (id: number) => `/api/products/${id}`
  }
} as const;

type ApiEndpoints = typeof apiEndpoints;
type UserEndpoints = typeof apiEndpoints.users;
type UpdateUserEndpoint = typeof apiEndpoints.users.update; // (id: number) => string
```

## Conditional Types

Conditional types allow you to create types that depend on a condition.

### Basic Conditional Types

```typescript
// Basic conditional type syntax: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>; // true
type Test2 = IsString<number>; // false
type Test3 = IsString<"hello">; // true

// Conditional type with generic constraints
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type StringArrayElement = ArrayElement<string[]>; // string
type NumberArrayElement = ArrayElement<number[]>; // number
type NotArrayElement = ArrayElement<string>; // never

// Conditional type for function return types
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type FunctionReturn = ReturnType<() => string>; // string
type MethodReturn = ReturnType<(x: number) => boolean>; // boolean
type NotFunctionReturn = ReturnType<string>; // never

// Conditional type for promise unwrapping
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Awaited<Promise<string>>; // string
type PromiseNumber = Awaited<Promise<number>>; // number
type NotPromise = Awaited<string>; // string
```

### Advanced Conditional Types

```typescript
// Nested conditional types
type DeepAwaited<T> = T extends Promise<infer U>
  ? DeepAwaited<U>
  : T;

type NestedPromise = DeepAwaited<Promise<Promise<string>>>; // string

// Conditional types with union distribution
type ToArray<T> = T extends any ? T[] : never;

type UnionArrays = ToArray<string | number>; // string[] | number[]

// Non-distributive conditional types
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type NonDistributiveResult = ToArrayNonDistributive<string | number>; // (string | number)[]

// Conditional types for filtering
type NonNullable<T> = T extends null | undefined ? never : T;

type FilteredType = NonNullable<string | null | undefined>; // string

// Conditional types with multiple conditions
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type StringTypeName = TypeName<string>; // "string"
type NumberTypeName = TypeName<42>; // "number"
type FunctionTypeName = TypeName<() => void>; // "function"

// Conditional types for object property extraction
type GetProperty<T, K> = K extends keyof T ? T[K] : never;

type UserName = GetProperty<User, "name">; // string
type UserInvalid = GetProperty<User, "invalid">; // never
```

### Practical Conditional Types

```typescript
// API response type transformation
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type UnwrapApiResponse<T> = T extends ApiResponse<infer U> ? U : T;

type UserData = UnwrapApiResponse<ApiResponse<User>>; // User
type DirectData = UnwrapApiResponse<string>; // string

// Function parameter extraction
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type CalcParams = Parameters<typeof calculateArea>; // [number, number]

// Object value types
type ValueOf<T> = T[keyof T];

type UserValues = ValueOf<User>; // string | number

// Required vs Optional property detection
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface PartialUser {
  id: number;
  name?: string;
  email?: string;
}

type RequiredUserKeys = RequiredKeys<PartialUser>; // "id"
type OptionalUserKeys = OptionalKeys<PartialUser>; // "name" | "email"
```

## Mapped Types

Mapped types create new types by transforming properties of existing types.

### Basic Mapped Types

```typescript
// Basic mapped type syntax
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Usage
type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type RequiredUser = Required<PartialUser>;

// Custom mapped types
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

type Stringify<T> = {
  [P in keyof T]: string;
};

type NullableUser = Nullable<User>; // All properties can be null
type StringifiedUser = Stringify<User>; // All properties are strings
```

### Advanced Mapped Types

```typescript
// Mapped types with key remapping
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// {
//   getId: () => number;
//   getName: () => string;
//   getEmail: () => string;
//   getAge: () => number;
// }

// Mapped types with filtering
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type UserStringProps = PickByType<User, string>; // { name: string; email: string }

// Mapped types with transformation
type EventHandlers<T> = {
  [P in keyof T as `on${Capitalize<string & P>}Change`]: (value: T[P]) => void;
};

type UserEventHandlers = EventHandlers<User>;
// {
//   onIdChange: (value: number) => void;
//   onNameChange: (value: string) => void;
//   onEmailChange: (value: string) => void;
//   onAgeChange: (value: number) => void;
// }

// Deep mapped types
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedUser {
  id: number;
  profile: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
}

type DeepReadonlyUser = DeepReadonly<NestedUser>;
type DeepPartialUser = DeepPartial<NestedUser>;
```

## Template Literal Types

Template literal types allow you to create types using template literal syntax.

### Basic Template Literal Types

```typescript
// Basic template literal types
type Greeting = `Hello, ${string}!`;

type PersonalGreeting = `Hello, ${'John' | 'Jane'}!`; // "Hello, John!" | "Hello, Jane!"

// Template literals with unions
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type HttpRequest = `${HttpMethod} ${ApiEndpoint}`;

// Examples of HttpRequest:
// "GET /api/users" | "POST /api/users" | "PUT /api/users" | "DELETE /api/users" | ...

// Template literals with specific strings
type Color = 'red' | 'green' | 'blue';
type Shade = 'light' | 'dark';
type ColorVariant = `${Shade}-${Color}`;
// "light-red" | "light-green" | "light-blue" | "dark-red" | "dark-green" | "dark-blue"
```

### Advanced Template Literal Types

```typescript
// Template literals with utility types
type EventName<T> = {
  [K in keyof T]: `${string & K}Changed`;
}[keyof T];

type UserEventNames = EventName<User>; // "idChanged" | "nameChanged" | "emailChanged" | "ageChanged"

// Template literals for CSS properties
type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
type CSSValue = `${number}${CSSUnit}`;

type Margin = CSSValue; // "10px" | "1em" | "100%" | etc.

// Template literals for database operations
type TableName = 'users' | 'products' | 'orders';
type Operation = 'select' | 'insert' | 'update' | 'delete';
type SqlOperation = `${Operation}_${TableName}`;
// "select_users" | "insert_users" | "update_users" | "delete_users" | ...

// Template literals with conditional types
type AddPrefix<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
};

type PrefixedUser = AddPrefix<User, 'user_'>;
// {
//   user_id: number;
//   user_name: string;
//   user_email: string;
//   user_age: number;
// }

// Template literals for path building
type PathSegment = string | number;
type BuildPath<T extends readonly PathSegment[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends PathSegment
    ? Rest extends readonly PathSegment[]
      ? Rest['length'] extends 0
        ? `${First}`
        : `${First}/${BuildPath<Rest>}`
      : never
    : never
  : '';

type ApiPath = BuildPath<['api', 'v1', 'users', number]>; // "api/v1/users/number"
```

### Practical Template Literal Examples

```typescript
// Type-safe event system
type EventMap = {
  user: { id: number; name: string };
  product: { id: number; price: number };
  order: { id: number; total: number };
};

type EventType = keyof EventMap;
type EventAction = 'created' | 'updated' | 'deleted';
type EventName = `${EventType}:${EventAction}`;

class TypedEventEmitter {
  private listeners: Map<EventName, Function[]> = new Map();
  
  on<T extends EventType, A extends EventAction>(
    event: `${T}:${A}`,
    listener: (data: EventMap[T]) => void
  ): void {
    const eventName = event as EventName;
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(listener);
  }
  
  emit<T extends EventType, A extends EventAction>(
    event: `${T}:${A}`,
    data: EventMap[T]
  ): void {
    const eventName = event as EventName;
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Usage
const emitter = new TypedEventEmitter();

emitter.on('user:created', (user) => {
  console.log(`User created: ${user.name}`);
});

emitter.emit('user:created', { id: 1, name: 'John' });

// Type-safe CSS-in-JS
type CSSProperty = 
  | 'color'
  | 'background-color'
  | 'font-size'
  | 'margin'
  | 'padding'
  | 'width'
  | 'height';

type CSSValue = string | number;

type CSSRule = `${CSSProperty}: ${CSSValue}`;

type StyleObject = {
  [K in CSSProperty]?: CSSValue;
};

function createStyles(styles: StyleObject): string {
  return Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
}

const buttonStyles = createStyles({
  'background-color': '#007bff',
  'color': 'white',
  'padding': '10px 20px',
  'border': 'none'
});
```

## Utility Types

TypeScript provides many built-in utility types for common type transformations.

### Built-in Utility Types

```typescript
// Pick - Select specific properties
type UserSummary = Pick<User, 'id' | 'name'>;
// { id: number; name: string }

// Omit - Exclude specific properties
type UserWithoutId = Omit<User, 'id'>;
// { name: string; email: string; age: number }

// Record - Create object type with specific keys and values
type UserRoles = Record<'admin' | 'user' | 'guest', string[]>;
// {
//   admin: string[];
//   user: string[];
//   guest: string[];
// }

// Exclude - Remove types from union
type NonStringTypes = Exclude<string | number | boolean, string>;
// number | boolean

// Extract - Keep only specific types from union
type StringTypes = Extract<string | number | boolean, string>;
// string

// ReturnType - Get function return type
function getUser(): User {
  return { id: 1, name: 'John', email: 'john@example.com', age: 30 };
}

type GetUserReturn = ReturnType<typeof getUser>; // User

// Parameters - Get function parameter types
type GetUserParams = Parameters<typeof getProperty>; // [T, K]

// ConstructorParameters - Get constructor parameter types
type DbConnectionParams = ConstructorParameters<typeof DatabaseConnection>; // [string]

// InstanceType - Get instance type of constructor
type DbInstance = InstanceType<typeof DatabaseConnection>; // DatabaseConnection
```

### Custom Utility Types

```typescript
// Deep Pick - Pick nested properties
type DeepPick<T, K extends string> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? { [P in Key]: DeepPick<T[Key], Rest> }
    : never
  : K extends keyof T
  ? { [P in K]: T[K] }
  : never;

interface NestedData {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
}

type UserName = DeepPick<NestedData, 'user.profile.name'>;
// { user: { profile: { name: string } } }

// Mutable - Remove readonly modifiers
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type MutableReadonlyUser = Mutable<Readonly<User>>;
// { id: number; name: string; email: string; age: number }

// Optional to Required - Make specific properties required
type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

interface PartialProfile {
  name?: string;
  email?: string;
  age?: number;
}

type ProfileWithRequiredName = MakeRequired<PartialProfile, 'name'>;
// { name: string; email?: string; age?: number }

// Function property names
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

class Example {
  name: string = '';
  age: number = 0;
  getName(): string { return this.name; }
  setAge(age: number): void { this.age = age; }
}

type ExampleFunctions = FunctionPropertyNames<Example>; // "getName" | "setAge"
type ExampleProperties = NonFunctionPropertyNames<Example>; // "name" | "age"
```

## Practical Examples

### Type-Safe Configuration System

```typescript
// Configuration schema
interface ConfigSchema {
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    authentication: boolean;
    logging: boolean;
    analytics: boolean;
  };
}

// Type-safe configuration access
type ConfigPath<T, K extends string = ''> = {
  [P in keyof T]: T[P] extends object
    ? ConfigPath<T[P], K extends '' ? `${string & P}` : `${K}.${string & P}`>
    : K extends ''
    ? P
    : `${K}.${string & P}`;
}[keyof T];

type ConfigPaths = ConfigPath<ConfigSchema>;
// "database.host" | "database.port" | "database.username" | "database.password" |
// "api.baseUrl" | "api.timeout" | "api.retries" |
// "features.authentication" | "features.logging" | "features.analytics"

// Get nested value type
type GetConfigValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? GetConfigValue<T[Key], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

class ConfigManager {
  constructor(private config: ConfigSchema) {}
  
  get<P extends ConfigPaths>(path: P): GetConfigValue<ConfigSchema, P> {
    const keys = path.split('.');
    let value: any = this.config;
    
    for (const key of keys) {
      value = value[key];
    }
    
    return value;
  }
}

// Usage
const config = new ConfigManager({
  database: {
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: 'secret'
  },
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  features: {
    authentication: true,
    logging: false,
    analytics: true
  }
});

const dbHost = config.get('database.host'); // Type: string
const apiTimeout = config.get('api.timeout'); // Type: number
const authEnabled = config.get('features.authentication'); // Type: boolean
```

### Advanced Form Validation

```typescript
// Form field types
type FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox';

interface BaseField {
  type: FieldType;
  label: string;
  required?: boolean;
}

interface TextField extends BaseField {
  type: 'text' | 'email' | 'password';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
}

interface SelectField extends BaseField {
  type: 'select';
  options: { value: string; label: string }[];
}

interface CheckboxField extends BaseField {
  type: 'checkbox';
}

type Field = TextField | NumberField | SelectField | CheckboxField;

// Form schema type
type FormSchema = Record<string, Field>;

// Extract form data type from schema
type FormData<T extends FormSchema> = {
  [K in keyof T]: T[K] extends { type: 'checkbox' }
    ? boolean
    : T[K] extends { type: 'number' }
    ? number
    : string;
};

// Validation result type
type ValidationResult<T extends FormSchema> = {
  [K in keyof T]?: string[];
};

// Form validator
class FormValidator<T extends FormSchema> {
  constructor(private schema: T) {}
  
  validate(data: Partial<FormData<T>>): ValidationResult<T> {
    const errors: ValidationResult<T> = {};
    
    for (const [fieldName, field] of Object.entries(this.schema)) {
      const value = data[fieldName as keyof T];
      const fieldErrors: string[] = [];
      
      // Required validation
      if (field.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field.label} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null && value !== '') {
        // Type-specific validation
        if (field.type === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push('Invalid email format');
          }
        }
        
        if (field.type === 'text' || field.type === 'email' || field.type === 'password') {
          const textField = field as TextField;
          const stringValue = value as string;
          
          if (textField.minLength && stringValue.length < textField.minLength) {
            fieldErrors.push(`Minimum length is ${textField.minLength}`);
          }
          
          if (textField.maxLength && stringValue.length > textField.maxLength) {
            fieldErrors.push(`Maximum length is ${textField.maxLength}`);
          }
          
          if (textField.pattern && !textField.pattern.test(stringValue)) {
            fieldErrors.push('Invalid format');
          }
        }
        
        if (field.type === 'number') {
          const numberField = field as NumberField;
          const numberValue = value as number;
          
          if (numberField.min !== undefined && numberValue < numberField.min) {
            fieldErrors.push(`Minimum value is ${numberField.min}`);
          }
          
          if (numberField.max !== undefined && numberValue > numberField.max) {
            fieldErrors.push(`Maximum value is ${numberField.max}`);
          }
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[fieldName as keyof T] = fieldErrors;
      }
    }
    
    return errors;
  }
}

// Usage
const userFormSchema = {
  name: {
    type: 'text' as const,
    label: 'Full Name',
    required: true,
    minLength: 2,
    maxLength: 50
  },
  email: {
    type: 'email' as const,
    label: 'Email Address',
    required: true
  },
  age: {
    type: 'number' as const,
    label: 'Age',
    min: 18,
    max: 120
  },
  newsletter: {
    type: 'checkbox' as const,
    label: 'Subscribe to newsletter'
  }
};

type UserFormData = FormData<typeof userFormSchema>;
// {
//   name: string;
//   email: string;
//   age: number;
//   newsletter: boolean;
// }

const validator = new FormValidator(userFormSchema);

const formData: Partial<UserFormData> = {
  name: 'John Doe',
  email: 'invalid-email',
  age: 15,
  newsletter: true
};

const validationErrors = validator.validate(formData);
console.log(validationErrors);
// {
//   email: ['Invalid email format'],
//   age: ['Minimum value is 18']
// }
```

## Best Practices

### ✅ Good Practices

```typescript
// Use meaningful names for type parameters
type ApiResponse<TData, TError = string> = {
  data?: TData;
  error?: TError;
  success: boolean;
};

// Use conditional types for complex type logic
type NonNullable<T> = T extends null | undefined ? never : T;

// Use mapped types for systematic transformations
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
};

// Use template literal types for type-safe string manipulation
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type ApiCall = `${HttpMethod} ${ApiEndpoint}`;

// Use utility types to avoid repetition
type CreateUserRequest = Omit<User, 'id'>;
type UpdateUserRequest = Partial<Omit<User, 'id'>>;
```

### ❌ Avoid

```typescript
// Don't overuse complex type manipulations
type OverlyComplex<T> = {
  [K in keyof T as T[K] extends Function 
    ? never 
    : K extends `${infer Prefix}_${infer Suffix}` 
    ? `${Prefix}${Capitalize<Suffix>}` 
    : K
  ]: T[K] extends object ? OverlyComplex<T[K]> : T[K];
}; // Too complex, hard to understand

// Don't use any in advanced types
type BadConditional<T> = T extends any ? any : never; // Defeats the purpose

// Don't create overly nested conditional types
type TooNested<T> = T extends A 
  ? T extends B 
    ? T extends C 
      ? T extends D 
        ? E 
        : F 
      : G 
    : H 
  : I; // Hard to read and maintain

// Don't ignore type safety with assertions
function unsafeTypeManipulation<T>(value: unknown): T {
  return value as T; // Dangerous
}
```

## Summary Checklist

- [ ] Use `keyof` to create unions of property names
- [ ] Use `typeof` to capture types from values
- [ ] Create conditional types with `T extends U ? X : Y`
- [ ] Use `infer` to extract types in conditional types
- [ ] Create mapped types for systematic transformations
- [ ] Use template literal types for string manipulation
- [ ] Leverage built-in utility types (`Pick`, `Omit`, `Record`, etc.)
- [ ] Create custom utility types for common patterns
- [ ] Use distributive conditional types appropriately
- [ ] Combine advanced features for complex type logic

## Next Steps

Now that you understand advanced TypeScript features, let's explore modules, namespaces, and code organization patterns.

---

*Continue to: [Modules and Namespaces](14-modules-namespaces.md)*