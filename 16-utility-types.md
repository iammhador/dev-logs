# Utility Types and Type Manipulations

> Master TypeScript's built-in utility types and learn to create custom type manipulations for advanced type safety and code reusability

## Built-in Utility Types

TypeScript provides many built-in utility types that help transform and manipulate existing types.

### Object Manipulation Utilities

```typescript
// Base interface for examples
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Partial<T> - Makes all properties optional
type PartialUser = Partial<User>;
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
//   isActive?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// Required<T> - Makes all properties required
interface OptionalUser {
  id?: number;
  name?: string;
  email?: string;
}

type RequiredUser = Required<OptionalUser>;
// {
//   id: number;
//   name: string;
//   email: string;
// }

// Readonly<T> - Makes all properties readonly
type ReadonlyUser = Readonly<User>;
// {
//   readonly id: number;
//   readonly name: string;
//   readonly email: string;
//   // ... all properties are readonly
// }

// Pick<T, K> - Select specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
// {
//   id: number;
//   name: string;
//   email: string;
// }

// Omit<T, K> - Exclude specific properties
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
// {
//   name: string;
//   email: string;
//   age: number;
//   isActive: boolean;
// }

// Record<K, T> - Create object type with specific keys and values
type UserRoles = Record<'admin' | 'user' | 'guest', string[]>;
// {
//   admin: string[];
//   user: string[];
//   guest: string[];
// }

type StatusMessages = Record<number, string>;
// { [key: number]: string }

// Example usage
const httpStatusMessages: StatusMessages = {
  200: 'OK',
  404: 'Not Found',
  500: 'Internal Server Error'
};

const rolePermissions: UserRoles = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read']
};
```

### Union and Intersection Utilities

```typescript
// Exclude<T, U> - Remove types from union
type PrimaryColors = 'red' | 'green' | 'blue';
type WarmColors = 'red' | 'orange' | 'yellow';

type CoolColors = Exclude<PrimaryColors, 'red'>; // 'green' | 'blue'
type NonWarmPrimary = Exclude<PrimaryColors, WarmColors>; // 'green' | 'blue'

// Extract<T, U> - Keep only specific types from union
type WarmPrimaryColors = Extract<PrimaryColors, WarmColors>; // 'red'

// NonNullable<T> - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Example with more complex types
type ApiResponse<T> = T | null | undefined | Error;
type ValidApiResponse<T> = NonNullable<ApiResponse<T>>; // T | Error

// Practical example: filtering union types
type EventType = 'click' | 'hover' | 'focus' | 'blur' | 'keydown' | 'keyup';
type MouseEvents = Extract<EventType, 'click' | 'hover'>; // 'click' | 'hover'
type KeyboardEvents = Extract<EventType, `key${string}`>; // 'keydown' | 'keyup'
type NonMouseEvents = Exclude<EventType, MouseEvents>; // 'focus' | 'blur' | 'keydown' | 'keyup'
```

### Function Utilities

```typescript
// Function type for examples
function calculateTotal(price: number, tax: number, discount?: number): number {
  const subtotal = price + (price * tax);
  return discount ? subtotal - discount : subtotal;
}

class UserService {
  async getUser(id: string): Promise<User> {
    // Implementation
    return {} as User;
  }
  
  updateUser(id: string, updates: Partial<User>): User {
    // Implementation
    return {} as User;
  }
}

// Parameters<T> - Extract function parameter types
type CalculateTotalParams = Parameters<typeof calculateTotal>;
// [price: number, tax: number, discount?: number]

type GetUserParams = Parameters<UserService['getUser']>;
// [id: string]

// ReturnType<T> - Extract function return type
type CalculateTotalReturn = ReturnType<typeof calculateTotal>; // number
type GetUserReturn = ReturnType<UserService['getUser']>; // Promise<User>

// ConstructorParameters<T> - Extract constructor parameter types
class DatabaseConnection {
  constructor(host: string, port: number, options?: { ssl: boolean }) {
    // Implementation
  }
}

type DbConnectionParams = ConstructorParameters<typeof DatabaseConnection>;
// [host: string, port: number, options?: { ssl: boolean }]

// InstanceType<T> - Extract instance type from constructor
type DbInstance = InstanceType<typeof DatabaseConnection>; // DatabaseConnection

// ThisParameterType<T> - Extract 'this' parameter type
function greetUser(this: User, message: string): string {
  return `${message}, ${this.name}!`;
}

type GreetUserThis = ThisParameterType<typeof greetUser>; // User

// OmitThisParameter<T> - Remove 'this' parameter from function type
type GreetUserWithoutThis = OmitThisParameter<typeof greetUser>;
// (message: string) => string

// Practical example: creating type-safe event handlers
interface EventHandlers {
  onClick(this: HTMLButtonElement, event: MouseEvent): void;
  onSubmit(this: HTMLFormElement, event: SubmitEvent): void;
  onChange(this: HTMLInputElement, event: Event): void;
}

type ClickHandler = EventHandlers['onClick'];
type ClickHandlerParams = Parameters<ClickHandler>; // [event: MouseEvent]
type ClickHandlerThis = ThisParameterType<ClickHandler>; // HTMLButtonElement
type ClickHandlerWithoutThis = OmitThisParameter<ClickHandler>; // (event: MouseEvent) => void
```

### String Manipulation Utilities

```typescript
// Uppercase<T> - Convert string literal to uppercase
type UppercaseHello = Uppercase<'hello'>; // 'HELLO'
type UppercaseColors = Uppercase<'red' | 'green' | 'blue'>; // 'RED' | 'GREEN' | 'BLUE'

// Lowercase<T> - Convert string literal to lowercase
type LowercaseHello = Lowercase<'HELLO'>; // 'hello'
type LowercaseStatus = Lowercase<'SUCCESS' | 'ERROR' | 'PENDING'>; // 'success' | 'error' | 'pending'

// Capitalize<T> - Capitalize first letter
type CapitalizedHello = Capitalize<'hello world'>; // 'Hello world'
type CapitalizedColors = Capitalize<'red' | 'green' | 'blue'>; // 'Red' | 'Green' | 'Blue'

// Uncapitalize<T> - Uncapitalize first letter
type UncapitalizedHello = Uncapitalize<'Hello World'>; // 'hello World'

// Practical example: API endpoint generation
type HttpMethod = 'get' | 'post' | 'put' | 'delete';
type Resource = 'user' | 'product' | 'order';

type ApiEndpoint<M extends HttpMethod, R extends Resource> = 
  `${Uppercase<M>} /api/${R}s`;

type UserEndpoints = ApiEndpoint<HttpMethod, 'user'>;
// 'GET /api/users' | 'POST /api/users' | 'PUT /api/users' | 'DELETE /api/users'

// Environment variable types
type EnvPrefix = 'DATABASE' | 'API' | 'REDIS';
type EnvSuffix = 'HOST' | 'PORT' | 'PASSWORD';

type EnvVariable<P extends EnvPrefix, S extends EnvSuffix> = `${P}_${S}`;

type DatabaseEnvVars = EnvVariable<'DATABASE', EnvSuffix>;
// 'DATABASE_HOST' | 'DATABASE_PORT' | 'DATABASE_PASSWORD'

// CSS property generation
type CSSProperty = 'margin' | 'padding';
type CSSDirection = 'top' | 'right' | 'bottom' | 'left';

type CSSDirectionalProperty<P extends CSSProperty, D extends CSSDirection> = 
  `${P}-${D}`;

type MarginProperties = CSSDirectionalProperty<'margin', CSSDirection>;
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'
```

## Custom Utility Types

### Advanced Object Manipulation

```typescript
// DeepPartial - Make all properties optional recursively
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
}

type PartialNestedConfig = DeepPartial<NestedConfig>;
// {
//   database?: {
//     host?: string;
//     port?: number;
//     credentials?: {
//       username?: string;
//       password?: string;
//     };
//   };
//   api?: {
//     baseUrl?: string;
//     timeout?: number;
//   };
// }

// DeepReadonly - Make all properties readonly recursively
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type ReadonlyNestedConfig = DeepReadonly<NestedConfig>;

// DeepRequired - Make all properties required recursively
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Mutable - Remove readonly modifiers
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type MutableUser = Mutable<ReadonlyUser>;
// Back to regular User interface

// PickByType - Pick properties by their type
type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

type UserStringProperties = PickByType<User, string>;
// { name: string; email: string }

type UserNumberProperties = PickByType<User, number>;
// { id: number; age: number }

type UserDateProperties = PickByType<User, Date>;
// { createdAt: Date; updatedAt: Date }

// OmitByType - Omit properties by their type
type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

type UserWithoutDates = OmitByType<User, Date>;
// { id: number; name: string; email: string; age: number; isActive: boolean }

// NonEmptyArray - Ensure array has at least one element
type NonEmptyArray<T> = [T, ...T[]];

function processItems<T>(items: NonEmptyArray<T>): T {
  return items[0]; // Safe to access first element
}

// Usage
const validItems: NonEmptyArray<string> = ['first', 'second'];
const firstItem = processItems(validItems); // OK

// const emptyItems: NonEmptyArray<string> = []; // Error: Source has 0 element(s) but target requires 1
```

### Conditional Type Utilities

```typescript
// IsNever - Check if type is never
type IsNever<T> = [T] extends [never] ? true : false;

type TestNever1 = IsNever<never>; // true
type TestNever2 = IsNever<string>; // false

// IsAny - Check if type is any
type IsAny<T> = 0 extends (1 & T) ? true : false;

type TestAny1 = IsAny<any>; // true
type TestAny2 = IsAny<string>; // false

// IsUnknown - Check if type is unknown
type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

type TestUnknown1 = IsUnknown<unknown>; // true
type TestUnknown2 = IsUnknown<string>; // false

// Equals - Check if two types are equal
type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

type TestEquals1 = Equals<string, string>; // true
type TestEquals2 = Equals<string, number>; // false
type TestEquals3 = Equals<string | number, number | string>; // true

// If - Conditional type helper
type If<C extends boolean, T, F> = C extends true ? T : F;

type TestIf1 = If<true, 'yes', 'no'>; // 'yes'
type TestIf2 = If<false, 'yes', 'no'>; // 'no'

// Not - Boolean negation
type Not<C extends boolean> = C extends true ? false : true;

type TestNot1 = Not<true>; // false
type TestNot2 = Not<false>; // true

// And - Boolean AND operation
type And<A extends boolean, B extends boolean> = A extends true ? B : false;

type TestAnd1 = And<true, true>; // true
type TestAnd2 = And<true, false>; // false
type TestAnd3 = And<false, true>; // false

// Or - Boolean OR operation
type Or<A extends boolean, B extends boolean> = A extends true ? true : B;

type TestOr1 = Or<true, false>; // true
type TestOr2 = Or<false, false>; // false
type TestOr3 = Or<false, true>; // true
```

### Array and Tuple Utilities

```typescript
// Head - Get first element of array/tuple
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;

type FirstString = Head<['a', 'b', 'c']>; // 'a'
type FirstNumber = Head<[1, 2, 3]>; // 1
type EmptyHead = Head<[]>; // never

// Tail - Get all elements except first
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];

type RestStrings = Tail<['a', 'b', 'c']>; // ['b', 'c']
type RestNumbers = Tail<[1, 2, 3]>; // [2, 3]
type EmptyTail = Tail<[]>; // []

// Last - Get last element of array/tuple
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;

type LastString = Last<['a', 'b', 'c']>; // 'c'
type LastNumber = Last<[1, 2, 3]>; // 3

// Length - Get length of tuple
type Length<T extends readonly unknown[]> = T['length'];

type LengthOfTuple = Length<['a', 'b', 'c']>; // 3
type LengthOfEmpty = Length<[]>; // 0

// Reverse - Reverse tuple order
type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

type ReversedTuple = Reverse<['a', 'b', 'c']>; // ['c', 'b', 'a']
type ReversedNumbers = Reverse<[1, 2, 3, 4]>; // [4, 3, 2, 1]

// Flatten - Flatten nested arrays
type Flatten<T extends readonly unknown[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends readonly unknown[]
    ? [...Flatten<First>, ...Flatten<Rest>]
    : [First, ...Flatten<Rest>]
  : [];

type FlatArray = Flatten<[1, [2, 3], [4, [5, 6]]]>; // [1, 2, 3, 4, [5, 6]]

// Includes - Check if array includes specific type
type Includes<T extends readonly unknown[], U> = T extends readonly [infer First, ...infer Rest]
  ? Equals<First, U> extends true
    ? true
    : Includes<Rest, U>
  : false;

type HasString = Includes<['a', 'b', 'c'], 'b'>; // true
type HasNumber = Includes<['a', 'b', 'c'], 1>; // false

// Unique - Remove duplicate types from tuple
type Unique<T extends readonly unknown[], Result extends readonly unknown[] = []> = 
  T extends readonly [infer First, ...infer Rest]
    ? Includes<Result, First> extends true
      ? Unique<Rest, Result>
      : Unique<Rest, [...Result, First]>
    : Result;

type UniqueArray = Unique<['a', 'b', 'a', 'c', 'b']>; // ['a', 'b', 'c']
```

### String Manipulation Utilities

```typescript
// Split - Split string by delimiter
type Split<S extends string, D extends string> = 
  S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

type SplitPath = Split<'user/profile/settings', '/'>; // ['user', 'profile', 'settings']
type SplitEmail = Split<'user@example.com', '@'>; // ['user', 'example.com']

// Join - Join array of strings with delimiter
type Join<T extends readonly string[], D extends string> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? Rest['length'] extends 0
          ? First
          : `${First}${D}${Join<Rest, D>}`
        : never
      : never
    : '';

type JoinedPath = Join<['user', 'profile', 'settings'], '/'>; // 'user/profile/settings'
type JoinedWords = Join<['hello', 'world'], ' '>; // 'hello world'

// Replace - Replace substring in string
type Replace<S extends string, From extends string, To extends string> = 
  S extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${Suffix}`
    : S;

type ReplacedString = Replace<'hello world', 'world', 'TypeScript'>; // 'hello TypeScript'

// ReplaceAll - Replace all occurrences of substring
type ReplaceAll<S extends string, From extends string, To extends string> = 
  S extends `${infer Prefix}${From}${infer Suffix}`
    ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
    : S;

type ReplacedAllSpaces = ReplaceAll<'hello world test', ' ', '-'>; // 'hello-world-test'

// StartsWith - Check if string starts with prefix
type StartsWith<S extends string, Prefix extends string> = 
  S extends `${Prefix}${string}` ? true : false;

type StartsWithHello = StartsWith<'hello world', 'hello'>; // true
type StartsWithBye = StartsWith<'hello world', 'bye'>; // false

// EndsWith - Check if string ends with suffix
type EndsWith<S extends string, Suffix extends string> = 
  S extends `${string}${Suffix}` ? true : false;

type EndsWithWorld = EndsWith<'hello world', 'world'>; // true
type EndsWithTest = EndsWith<'hello world', 'test'>; // false

// TrimLeft - Remove leading whitespace
type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;

type TrimmedLeft = TrimLeft<'   hello world'>; // 'hello world'

// TrimRight - Remove trailing whitespace
type TrimRight<S extends string> = S extends `${infer Rest} ` ? TrimRight<Rest> : S;

type TrimmedRight = TrimRight<'hello world   '>; // 'hello world'

// Trim - Remove leading and trailing whitespace
type Trim<S extends string> = TrimLeft<TrimRight<S>>;

type TrimmedString = Trim<'   hello world   '>; // 'hello world'
```

### Path and Property Utilities

```typescript
// Get - Get nested property type by path
type Get<T, K> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Get<T[Key], Rest>
    : never
  : K extends keyof T
  ? T[K]
  : never;

interface NestedObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  app: {
    version: string;
  };
}

type UserName = Get<NestedObject, 'user.profile.name'>; // string
type UserAge = Get<NestedObject, 'user.profile.age'>; // number
type Theme = Get<NestedObject, 'user.settings.theme'>; // 'light' | 'dark'
type AppVersion = Get<NestedObject, 'app.version'>; // string

// Paths - Generate all possible paths in an object
type Paths<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
  {
    [K in keyof T]-?: K extends string | number ?
      `${K}` | Join<[K, Paths<T[K], Prev[D]>], '.'>
      : never
  }[keyof T] : '';

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

type AllPaths = Paths<NestedObject>;
// 'user' | 'app' | 'user.profile' | 'user.settings' | 'user.profile.name' | 
// 'user.profile.age' | 'user.settings.theme' | 'user.settings.notifications' | 'app.version'

// Leaves - Get only leaf paths (paths to primitive values)
type Leaves<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
  {
    [K in keyof T]-?: Join<[K, Leaves<T[K], Prev[D]>], '.'>
  }[keyof T] : '';

type LeafPaths = Leaves<NestedObject>;
// 'user.profile.name' | 'user.profile.age' | 'user.settings.theme' | 
// 'user.settings.notifications' | 'app.version'

// Set - Set nested property type by path
type Set<T, K extends string, V> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? {
        [P in keyof T]: P extends Key ? Set<T[P], Rest, V> : T[P]
      }
    : T
  : K extends keyof T
  ? {
      [P in keyof T]: P extends K ? V : T[P]
    }
  : T;

type UpdatedObject = Set<NestedObject, 'user.profile.name', number>;
// Changes user.profile.name from string to number
```

## Practical Examples

### Type-Safe Configuration System

```typescript
// Configuration schema with nested structure
interface AppConfig {
  database: {
    host: string;
    port: number;
    ssl: boolean;
    pool: {
      min: number;
      max: number;
    };
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

// Type-safe configuration getter
class ConfigManager<T extends Record<string, any>> {
  constructor(private config: T) {}
  
  get<P extends Paths<T>>(path: P): Get<T, P> {
    const keys = path.split('.') as string[];
    let value: any = this.config;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value;
  }
  
  set<P extends Paths<T>, V>(path: P, value: V): ConfigManager<Set<T, P, V>> {
    const keys = path.split('.') as string[];
    const newConfig = JSON.parse(JSON.stringify(this.config));
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return new ConfigManager(newConfig);
  }
  
  update<P extends Paths<T>>(path: P, updater: (current: Get<T, P>) => Get<T, P>): ConfigManager<T> {
    const currentValue = this.get(path);
    const newValue = updater(currentValue);
    return this.set(path, newValue) as ConfigManager<T>;
  }
}

// Usage
const config = new ConfigManager<AppConfig>({
  database: {
    host: 'localhost',
    port: 5432,
    ssl: false,
    pool: { min: 2, max: 10 }
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

// Type-safe access
const dbHost = config.get('database.host'); // string
const poolMax = config.get('database.pool.max'); // number
const authEnabled = config.get('features.authentication'); // boolean

// Type-safe updates
const updatedConfig = config
  .set('database.ssl', true)
  .set('api.timeout', 10000)
  .update('database.pool.max', current => current * 2);
```

### Form Validation System

```typescript
// Form field types
type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'email';

interface FieldSchema {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

type FormSchema = Record<string, FieldSchema>;

// Extract form data type from schema
type FormDataFromSchema<T extends FormSchema> = {
  [K in keyof T]: T[K]['type'] extends 'string' | 'email'
    ? string
    : T[K]['type'] extends 'number'
    ? number
    : T[K]['type'] extends 'boolean'
    ? boolean
    : T[K]['type'] extends 'date'
    ? Date
    : unknown;
};

// Extract required fields
type RequiredFields<T extends FormSchema> = {
  [K in keyof T]: T[K]['required'] extends true ? K : never;
}[keyof T];

// Extract optional fields
type OptionalFields<T extends FormSchema> = Exclude<keyof T, RequiredFields<T>>;

// Create form data type with proper optionality
type FormData<T extends FormSchema> = 
  Pick<FormDataFromSchema<T>, RequiredFields<T>> & 
  Partial<Pick<FormDataFromSchema<T>, OptionalFields<T>>>;

// Validation result type
type ValidationResult<T extends FormSchema> = {
  isValid: boolean;
  errors: Partial<Record<keyof T, string[]>>;
};

// Form validator class
class FormValidator<T extends FormSchema> {
  constructor(private schema: T) {}
  
  validate(data: Partial<FormDataFromSchema<T>>): ValidationResult<T> {
    const errors: Partial<Record<keyof T, string[]>> = {};
    let isValid = true;
    
    for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
      const value = data[fieldName as keyof T];
      const fieldErrors: string[] = [];
      
      // Required validation
      if (fieldSchema.required && (value === undefined || value === null)) {
        fieldErrors.push(`${fieldName} is required`);
        isValid = false;
      }
      
      if (value !== undefined && value !== null) {
        // Type-specific validation
        if (fieldSchema.type === 'email' && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            fieldErrors.push('Invalid email format');
            isValid = false;
          }
        }
        
        if (fieldSchema.type === 'string' && typeof value === 'string') {
          if (fieldSchema.min && value.length < fieldSchema.min) {
            fieldErrors.push(`Minimum length is ${fieldSchema.min}`);
            isValid = false;
          }
          if (fieldSchema.max && value.length > fieldSchema.max) {
            fieldErrors.push(`Maximum length is ${fieldSchema.max}`);
            isValid = false;
          }
          if (fieldSchema.pattern) {
            const regex = new RegExp(fieldSchema.pattern);
            if (!regex.test(value)) {
              fieldErrors.push('Invalid format');
              isValid = false;
            }
          }
        }
        
        if (fieldSchema.type === 'number' && typeof value === 'number') {
          if (fieldSchema.min && value < fieldSchema.min) {
            fieldErrors.push(`Minimum value is ${fieldSchema.min}`);
            isValid = false;
          }
          if (fieldSchema.max && value > fieldSchema.max) {
            fieldErrors.push(`Maximum value is ${fieldSchema.max}`);
            isValid = false;
          }
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[fieldName as keyof T] = fieldErrors;
      }
    }
    
    return { isValid, errors };
  }
}

// Usage example
const userFormSchema = {
  name: { type: 'string' as const, required: true, min: 2, max: 50 },
  email: { type: 'email' as const, required: true },
  age: { type: 'number' as const, min: 18, max: 120 },
  newsletter: { type: 'boolean' as const },
  website: { type: 'string' as const, pattern: '^https?://.+' }
} satisfies FormSchema;

type UserFormData = FormData<typeof userFormSchema>;
// {
//   name: string;
//   email: string;
//   age?: number;
//   newsletter?: boolean;
//   website?: string;
// }

const validator = new FormValidator(userFormSchema);

const formData: Partial<FormDataFromSchema<typeof userFormSchema>> = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25,
  newsletter: true,
  website: 'https://johndoe.com'
};

const result = validator.validate(formData);
if (result.isValid) {
  console.log('Form is valid!');
} else {
  console.log('Validation errors:', result.errors);
}
```

### API Response Type System

```typescript
// Base API response structure
interface BaseApiResponse {
  success: boolean;
  timestamp: string;
  requestId: string;
}

interface SuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

interface ErrorResponse extends BaseApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// API endpoint definitions
interface ApiEndpoints {
  'GET /users': {
    response: User[];
    query?: {
      page?: number;
      limit?: number;
      search?: string;
    };
  };
  'GET /users/:id': {
    response: User;
    params: { id: string };
  };
  'POST /users': {
    response: User;
    body: CreateUserRequest;
  };
  'PUT /users/:id': {
    response: User;
    params: { id: string };
    body: Partial<CreateUserRequest>;
  };
  'DELETE /users/:id': {
    response: void;
    params: { id: string };
  };
}

// Extract types from endpoint definitions
type ExtractResponse<T> = T extends { response: infer R } ? R : never;
type ExtractParams<T> = T extends { params: infer P } ? P : never;
type ExtractQuery<T> = T extends { query: infer Q } ? Q : never;
type ExtractBody<T> = T extends { body: infer B } ? B : never;

// Type-safe API client
class ApiClient {
  constructor(private baseUrl: string) {}
  
  async request<K extends keyof ApiEndpoints>(
    endpoint: K,
    options: {
      params?: ExtractParams<ApiEndpoints[K]>;
      query?: ExtractQuery<ApiEndpoints[K]>;
      body?: ExtractBody<ApiEndpoints[K]>;
    } = {}
  ): Promise<ApiResponse<ExtractResponse<ApiEndpoints[K]>>> {
    const [method, path] = endpoint.split(' ') as [string, string];
    
    // Replace path parameters
    let url = path;
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url = url.replace(`:${key}`, String(value));
      }
    }
    
    // Add query parameters
    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }
    
    const response = await fetch(`${this.baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    return response.json();
  }
}

// Usage with full type safety
const apiClient = new ApiClient('https://api.example.com');

// Get all users with query parameters
const usersResponse = await apiClient.request('GET /users', {
  query: { page: 1, limit: 10, search: 'john' }
});

if (usersResponse.success) {
  const users = usersResponse.data; // Type: User[]
  console.log('Users:', users);
} else {
  console.error('Error:', usersResponse.error.message);
}

// Get specific user
const userResponse = await apiClient.request('GET /users/:id', {
  params: { id: '123' }
});

// Create new user
const createResponse = await apiClient.request('POST /users', {
  body: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 28,
    isActive: true
  }
});

// Update user
const updateResponse = await apiClient.request('PUT /users/:id', {
  params: { id: '123' },
  body: { name: 'Jane Smith' }
});

// Delete user
const deleteResponse = await apiClient.request('DELETE /users/:id', {
  params: { id: '123' }
});
```

## Best Practices

### ✅ Good Practices

```typescript
// Use built-in utility types when possible
type UserUpdate = Partial<Pick<User, 'name' | 'email' | 'age'>>;

// Create reusable utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Use meaningful names for complex types
type DatabaseEntity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Combine utility types for complex transformations
type ApiCreateRequest<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
type ApiUpdateRequest<T> = Partial<ApiCreateRequest<T>>;

// Use conditional types for flexible APIs
type EventPayload<T extends string> = T extends 'user:created'
  ? { user: User }
  : T extends 'user:updated'
  ? { user: User; changes: Partial<User> }
  : T extends 'user:deleted'
  ? { userId: string }
  : never;
```

### ❌ Avoid

```typescript
// Don't create overly complex utility types
type OverlyComplex<T> = {
  [K in keyof T as T[K] extends Function 
    ? never 
    : K extends `${infer Prefix}_${infer Suffix}` 
    ? `${Prefix}${Capitalize<Suffix>}` 
    : K
  ]: T[K] extends object ? OverlyComplex<T[K]> : T[K];
}; // Too complex, hard to understand and maintain

// Don't use utility types when simple types suffice
type SimpleString = Pick<{ value: string }, 'value'>['value']; // Just use string

// Don't create utility types that are used only once
type OneTimeUse<T> = T & { timestamp: Date }; // Better to inline

// Don't ignore type constraints
type BadUtility<T> = T extends any ? T[] : never; // any defeats the purpose

// Don't create confusing type aliases
type A<T> = T; // Not descriptive
type B<T, U> = T | U; // Use Union<T, U> or inline
```

## Summary Checklist

- [ ] Master built-in utility types (`Partial`, `Pick`, `Omit`, etc.)
- [ ] Create custom utility types for common patterns
- [ ] Use conditional types for flexible type logic
- [ ] Implement string manipulation utilities when needed
- [ ] Build type-safe configuration and form systems
- [ ] Create reusable utility types for your domain
- [ ] Use meaningful names for complex type transformations
- [ ] Combine utility types for sophisticated type manipulations
- [ ] Avoid overly complex utility types
- [ ] Document complex utility types with examples

## Next Steps

Now that you understand utility types and type manipulations, let's explore declaration merging and ambient declarations.

---

*Continue to: [Declaration Merging and Ambient Declarations](17-declaration-merging.md)*