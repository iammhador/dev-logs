# Classes and Object-Oriented Programming

> Master TypeScript classes, access modifiers, inheritance, and object-oriented programming patterns

## Basic Classes

### Class Declaration and Constructor

```typescript
// Basic class with constructor
class User {
  // Properties
  id: number;
  name: string;
  email: string;
  
  // Constructor
  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
  
  // Methods
  getDisplayName(): string {
    return `${this.name} (${this.email})`;
  }
  
  updateEmail(newEmail: string): void {
    this.email = newEmail;
  }
}

// Creating instances
const user1 = new User(1, "John Doe", "john@example.com");
const user2 = new User(2, "Jane Smith", "jane@example.com");

console.log(user1.getDisplayName()); // "John Doe (john@example.com)"
user1.updateEmail("john.doe@example.com");
```

### Property Initialization

```typescript
// Property initialization in declaration
class Counter {
  count: number = 0; // Default value
  step: number = 1;
  
  constructor(initialCount?: number, step?: number) {
    if (initialCount !== undefined) {
      this.count = initialCount;
    }
    if (step !== undefined) {
      this.step = step;
    }
  }
  
  increment(): void {
    this.count += this.step;
  }
  
  decrement(): void {
    this.count -= this.step;
  }
  
  reset(): void {
    this.count = 0;
  }
}

// Shorthand constructor parameter properties
class Product {
  constructor(
    public id: number,
    public name: string,
    public price: number,
    public category: string = "general"
  ) {
    // Properties are automatically created and assigned
  }
  
  getFormattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }
}

const product = new Product(1, "Laptop", 999.99, "electronics");
console.log(product.name); // "Laptop"
console.log(product.getFormattedPrice()); // "$999.99"
```

## Access Modifiers

### Public, Private, and Protected

```typescript
class BankAccount {
  public accountNumber: string; // Accessible everywhere
  private balance: number; // Only accessible within this class
  protected accountType: string; // Accessible in this class and subclasses
  
  constructor(accountNumber: string, initialBalance: number, accountType: string) {
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.accountType = accountType;
  }
  
  // Public method
  public getBalance(): number {
    return this.balance;
  }
  
  // Public method
  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }
  
  // Public method
  public withdraw(amount: number): boolean {
    if (this.canWithdraw(amount)) {
      this.balance -= amount;
      return true;
    }
    return false;
  }
  
  // Private method - only accessible within this class
  private canWithdraw(amount: number): boolean {
    return amount > 0 && amount <= this.balance;
  }
  
  // Protected method - accessible in subclasses
  protected getAccountInfo(): string {
    return `${this.accountType} Account: ${this.accountNumber}`;
  }
}

const account = new BankAccount("123456789", 1000, "Checking");
console.log(account.accountNumber); // OK: public
console.log(account.getBalance()); // OK: public method
// console.log(account.balance); // Error: private
// account.canWithdraw(100); // Error: private method
```

### Private Fields (ES2022)

```typescript
// Using # for truly private fields (runtime private)
class SecureUser {
  #password: string; // Truly private
  #salt: string;
  public username: string;
  
  constructor(username: string, password: string) {
    this.username = username;
    this.#salt = this.generateSalt();
    this.#password = this.hashPassword(password);
  }
  
  #generateSalt(): string {
    return Math.random().toString(36).substring(2);
  }
  
  #hashPassword(password: string): string {
    return `${password}_${this.#salt}_hashed`;
  }
  
  public verifyPassword(password: string): boolean {
    return this.#hashPassword(password) === this.#password;
  }
  
  public changePassword(oldPassword: string, newPassword: string): boolean {
    if (this.verifyPassword(oldPassword)) {
      this.#password = this.hashPassword(newPassword);
      return true;
    }
    return false;
  }
}

const user = new SecureUser("john", "secret123");
console.log(user.username); // OK
// console.log(user.#password); // SyntaxError: Private field '#password' must be declared in an enclosing class
```

## Getters and Setters

### Property Accessors

```typescript
class Temperature {
  private _celsius: number = 0;
  
  constructor(celsius: number) {
    this.celsius = celsius; // Uses setter for validation
  }
  
  // Getter
  get celsius(): number {
    return this._celsius;
  }
  
  // Setter with validation
  set celsius(value: number) {
    if (value < -273.15) {
      throw new Error("Temperature cannot be below absolute zero");
    }
    this._celsius = value;
  }
  
  // Computed property
  get fahrenheit(): number {
    return (this._celsius * 9/5) + 32;
  }
  
  set fahrenheit(value: number) {
    this.celsius = (value - 32) * 5/9;
  }
  
  get kelvin(): number {
    return this._celsius + 273.15;
  }
  
  set kelvin(value: number) {
    this.celsius = value - 273.15;
  }
}

const temp = new Temperature(25);
console.log(temp.celsius); // 25
console.log(temp.fahrenheit); // 77
console.log(temp.kelvin); // 298.15

temp.fahrenheit = 100;
console.log(temp.celsius); // 37.77777777777778
```

### Read-only Properties

```typescript
class ImmutablePoint {
  private _x: number;
  private _y: number;
  
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }
  
  // Read-only getters
  get x(): number {
    return this._x;
  }
  
  get y(): number {
    return this._y;
  }
  
  // Computed properties
  get magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }
  
  get angle(): number {
    return Math.atan2(this._y, this._x);
  }
  
  // Methods that return new instances (immutable pattern)
  translate(dx: number, dy: number): ImmutablePoint {
    return new ImmutablePoint(this._x + dx, this._y + dy);
  }
  
  scale(factor: number): ImmutablePoint {
    return new ImmutablePoint(this._x * factor, this._y * factor);
  }
}

const point = new ImmutablePoint(3, 4);
console.log(point.x, point.y); // 3, 4
console.log(point.magnitude); // 5
// point.x = 5; // Error: Cannot assign to 'x' because it is a read-only property

const newPoint = point.translate(1, 1);
console.log(newPoint.x, newPoint.y); // 4, 5
```

## Inheritance

### Basic Inheritance with extends

```typescript
// Base class
class Animal {
  protected name: string;
  protected age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  public makeSound(): string {
    return "Some generic animal sound";
  }
  
  public getInfo(): string {
    return `${this.name} is ${this.age} years old`;
  }
  
  protected sleep(): string {
    return `${this.name} is sleeping`;
  }
}

// Derived class
class Dog extends Animal {
  private breed: string;
  
  constructor(name: string, age: number, breed: string) {
    super(name, age); // Call parent constructor
    this.breed = breed;
  }
  
  // Override parent method
  public makeSound(): string {
    return "Woof! Woof!";
  }
  
  // Add new method
  public fetch(): string {
    return `${this.name} is fetching the ball`;
  }
  
  // Override and extend parent method
  public getInfo(): string {
    return `${super.getInfo()} and is a ${this.breed}`;
  }
  
  // Access protected method from parent
  public rest(): string {
    return this.sleep(); // Can access protected method
  }
}

class Cat extends Animal {
  private indoor: boolean;
  
  constructor(name: string, age: number, indoor: boolean = true) {
    super(name, age);
    this.indoor = indoor;
  }
  
  public makeSound(): string {
    return "Meow!";
  }
  
  public climb(): string {
    return `${this.name} is climbing`;
  }
  
  public getInfo(): string {
    const location = this.indoor ? "indoor" : "outdoor";
    return `${super.getInfo()} and is an ${location} cat`;
  }
}

// Usage
const dog = new Dog("Buddy", 3, "Golden Retriever");
const cat = new Cat("Whiskers", 2, true);

console.log(dog.makeSound()); // "Woof! Woof!"
console.log(cat.makeSound()); // "Meow!"
console.log(dog.getInfo()); // "Buddy is 3 years old and is a Golden Retriever"
console.log(cat.getInfo()); // "Whiskers is 2 years old and is an indoor cat"
```

### Method Overriding and super

```typescript
class Vehicle {
  protected brand: string;
  protected model: string;
  protected year: number;
  
  constructor(brand: string, model: string, year: number) {
    this.brand = brand;
    this.model = model;
    this.year = year;
  }
  
  public start(): string {
    return `Starting the ${this.brand} ${this.model}`;
  }
  
  public getDescription(): string {
    return `${this.year} ${this.brand} ${this.model}`;
  }
  
  protected performMaintenance(): string {
    return "Performing basic maintenance";
  }
}

class ElectricCar extends Vehicle {
  private batteryCapacity: number;
  private currentCharge: number;
  
  constructor(brand: string, model: string, year: number, batteryCapacity: number) {
    super(brand, model, year);
    this.batteryCapacity = batteryCapacity;
    this.currentCharge = batteryCapacity; // Start fully charged
  }
  
  // Override start method
  public start(): string {
    if (this.currentCharge > 0) {
      return `${super.start()} - Electric motor engaged`;
    }
    return "Cannot start - battery depleted";
  }
  
  // Override and extend getDescription
  public getDescription(): string {
    return `${super.getDescription()} (Electric - ${this.batteryCapacity}kWh)`;
  }
  
  // New methods specific to electric cars
  public charge(amount: number): void {
    this.currentCharge = Math.min(this.currentCharge + amount, this.batteryCapacity);
  }
  
  public getBatteryLevel(): number {
    return (this.currentCharge / this.batteryCapacity) * 100;
  }
  
  // Override protected method
  protected performMaintenance(): string {
    return `${super.performMaintenance()} + Battery health check`;
  }
  
  public scheduleMaintenance(): string {
    return this.performMaintenance(); // Can access overridden protected method
  }
}

const tesla = new ElectricCar("Tesla", "Model 3", 2023, 75);
console.log(tesla.start()); // "Starting the Tesla Model 3 - Electric motor engaged"
console.log(tesla.getDescription()); // "2023 Tesla Model 3 (Electric - 75kWh)"
console.log(tesla.getBatteryLevel()); // 100
```

## Static Members

### Static Properties and Methods

```typescript
class MathUtils {
  // Static properties
  static readonly PI = 3.14159;
  static readonly E = 2.71828;
  private static instanceCount = 0;
  
  // Instance property
  private id: number;
  
  constructor() {
    MathUtils.instanceCount++;
    this.id = MathUtils.instanceCount;
  }
  
  // Static methods
  static add(a: number, b: number): number {
    return a + b;
  }
  
  static multiply(a: number, b: number): number {
    return a * b;
  }
  
  static circleArea(radius: number): number {
    return MathUtils.PI * radius * radius;
  }
  
  static getInstanceCount(): number {
    return MathUtils.instanceCount;
  }
  
  // Instance method
  getId(): number {
    return this.id;
  }
  
  // Instance method accessing static member
  getCircleArea(radius: number): number {
    return MathUtils.circleArea(radius); // Access static method
  }
}

// Using static members without creating instances
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.circleArea(5)); // 78.5395

// Creating instances
const math1 = new MathUtils();
const math2 = new MathUtils();

console.log(math1.getId()); // 1
console.log(math2.getId()); // 2
console.log(MathUtils.getInstanceCount()); // 2
```

### Static Factory Methods

```typescript
class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: "admin" | "user" | "guest"
  ) {}
  
  // Static factory methods
  static createAdmin(name: string, email: string): User {
    return new User(
      `admin_${Date.now()}`,
      name,
      email,
      "admin"
    );
  }
  
  static createUser(name: string, email: string): User {
    return new User(
      `user_${Date.now()}`,
      name,
      email,
      "user"
    );
  }
  
  static createGuest(): User {
    return new User(
      `guest_${Date.now()}`,
      "Guest",
      "guest@example.com",
      "guest"
    );
  }
  
  // Static validation method
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // Static factory with validation
  static fromData(data: {
    name: string;
    email: string;
    role?: "admin" | "user";
  }): User | null {
    if (!User.isValidEmail(data.email)) {
      return null;
    }
    
    const role = data.role || "user";
    return role === "admin" 
      ? User.createAdmin(data.name, data.email)
      : User.createUser(data.name, data.email);
  }
}

// Usage
const admin = User.createAdmin("John Doe", "john@admin.com");
const user = User.createUser("Jane Smith", "jane@user.com");
const guest = User.createGuest();

const userFromData = User.fromData({
  name: "Bob Wilson",
  email: "bob@example.com",
  role: "user"
});
```

## Abstract Classes

### Abstract Classes and Methods

```typescript
// Abstract base class
abstract class Shape {
  protected color: string;
  
  constructor(color: string) {
    this.color = color;
  }
  
  // Abstract method - must be implemented by subclasses
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
  
  // Concrete method - can be used by subclasses
  getColor(): string {
    return this.color;
  }
  
  // Concrete method using abstract methods
  getDescription(): string {
    return `A ${this.color} shape with area ${this.calculateArea().toFixed(2)} and perimeter ${this.calculatePerimeter().toFixed(2)}`;
  }
  
  // Abstract method with default implementation
  display(): void {
    console.log(this.getDescription());
  }
}

// Concrete implementation
class Circle extends Shape {
  private radius: number;
  
  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }
  
  // Must implement abstract methods
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
  
  // Additional method specific to Circle
  getDiameter(): number {
    return this.radius * 2;
  }
}

class Rectangle extends Shape {
  private width: number;
  private height: number;
  
  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }
  
  calculateArea(): number {
    return this.width * this.height;
  }
  
  calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }
  
  // Override display method
  display(): void {
    console.log(`Rectangle: ${this.getDescription()}`);
  }
}

// Usage
const circle = new Circle("red", 5);
const rectangle = new Rectangle("blue", 4, 6);

circle.display(); // "A red shape with area 78.54 and perimeter 31.42"
rectangle.display(); // "Rectangle: A blue shape with area 24.00 and perimeter 20.00"

// Cannot instantiate abstract class
// const shape = new Shape("green"); // Error: Cannot create an instance of an abstract class

// Array of shapes
const shapes: Shape[] = [circle, rectangle];
shapes.forEach(shape => shape.display());
```

## Implementing Interfaces

### Classes Implementing Interfaces

```typescript
// Interface definitions
interface Flyable {
  fly(): string;
  altitude: number;
}

interface Swimmable {
  swim(): string;
  depth: number;
}

interface Walkable {
  walk(): string;
  speed: number;
}

// Class implementing single interface
class Bird implements Flyable {
  altitude: number = 0;
  
  constructor(private species: string) {}
  
  fly(): string {
    this.altitude = 100;
    return `${this.species} is flying at ${this.altitude} feet`;
  }
  
  land(): void {
    this.altitude = 0;
  }
}

// Class implementing multiple interfaces
class Duck implements Flyable, Swimmable, Walkable {
  altitude: number = 0;
  depth: number = 0;
  speed: number = 2;
  
  constructor(private name: string) {}
  
  fly(): string {
    this.altitude = 50;
    return `${this.name} is flying at ${this.altitude} feet`;
  }
  
  swim(): string {
    this.depth = 3;
    return `${this.name} is swimming at ${this.depth} feet deep`;
  }
  
  walk(): string {
    return `${this.name} is walking at ${this.speed} mph`;
  }
  
  // Additional methods
  quack(): string {
    return `${this.name} says quack!`;
  }
}

// Interface for class structure
interface Drawable {
  draw(): void;
  getArea(): number;
}

class Square implements Drawable {
  constructor(private sideLength: number) {}
  
  draw(): void {
    console.log(`Drawing a square with side length ${this.sideLength}`);
  }
  
  getArea(): number {
    return this.sideLength * this.sideLength;
  }
}

// Usage
const bird = new Bird("Eagle");
const duck = new Duck("Donald");
const square = new Square(5);

console.log(bird.fly()); // "Eagle is flying at 100 feet"
console.log(duck.swim()); // "Donald is swimming at 3 feet deep"
console.log(duck.quack()); // "Donald says quack!"

square.draw(); // "Drawing a square with side length 5"
console.log(square.getArea()); // 25
```

## Practical Examples

### Event System

```typescript
// Event system using classes
abstract class EventEmitter {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  off(event: string, listener: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  protected emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }
}

class HttpClient extends EventEmitter {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    super();
    this.baseUrl = baseUrl;
  }
  
  async get(endpoint: string): Promise<any> {
    this.emit('request:start', { method: 'GET', endpoint });
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      
      this.emit('request:success', { method: 'GET', endpoint, data });
      return data;
    } catch (error) {
      this.emit('request:error', { method: 'GET', endpoint, error });
      throw error;
    }
  }
}

// Usage
const client = new HttpClient('https://api.example.com');

client.on('request:start', (details) => {
  console.log('Request started:', details);
});

client.on('request:success', (details) => {
  console.log('Request successful:', details);
});

client.on('request:error', (details) => {
  console.error('Request failed:', details);
});
```

### Repository Pattern

```typescript
// Repository pattern with classes
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

abstract class BaseRepository<T extends { id: string }> implements Repository<T> {
  protected items: Map<string, T> = new Map();
  
  async findById(id: string): Promise<T | null> {
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
  
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return updated;
  }
  
  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }
  
  protected abstract generateId(): string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

class UserRepository extends BaseRepository<User> {
  protected generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Additional user-specific methods
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.email === email) || null;
  }
  
  async findActiveUsers(): Promise<User[]> {
    const users = await this.findAll();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return users.filter(user => user.createdAt > thirtyDaysAgo);
  }
}

// Usage
const userRepo = new UserRepository();

async function example() {
  const user = await userRepo.create({
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date()
  });
  
  console.log('Created user:', user);
  
  const foundUser = await userRepo.findByEmail("john@example.com");
  console.log('Found user:', foundUser);
}
```

## Best Practices

### ✅ Good Practices

```typescript
// Use access modifiers appropriately
class GoodExample {
  private _data: string[]; // Private implementation detail
  protected config: object; // For subclasses
  public readonly id: string; // Public immutable property
  
  constructor(id: string) {
    this.id = id;
    this._data = [];
    this.config = {};
  }
  
  // Public interface
  public addItem(item: string): void {
    this.validateItem(item);
    this._data.push(item);
  }
  
  // Private helper
  private validateItem(item: string): void {
    if (!item.trim()) {
      throw new Error("Item cannot be empty");
    }
  }
}

// Use composition over inheritance when appropriate
class Logger {
  log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

class UserService {
  private logger = new Logger(); // Composition
  
  createUser(userData: any): User {
    this.logger.log('Creating user');
    // Implementation
    return new User(userData);
  }
}

// Use interfaces for contracts
interface PaymentProcessor {
  processPayment(amount: number): Promise<boolean>;
}

class StripeProcessor implements PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    // Stripe implementation
    return true;
  }
}

class PayPalProcessor implements PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    // PayPal implementation
    return true;
  }
}
```

### ❌ Avoid

```typescript
// Don't make everything public
class BadExample {
  public internalData: any; // Should be private
  public helperMethod(): void {} // Should be private
}

// Don't use inheritance for code reuse only
class BadInheritance extends Array {
  // This is confusing - is it an array or something else?
}

// Don't ignore access modifiers
class IgnoredModifiers {
  private secret: string;
  
  constructor() {
    this.secret = "secret";
  }
}

// Accessing private members (bad practice)
const bad = new IgnoredModifiers();
// (bad as any).secret; // Don't do this!
```

## Summary Checklist

- [ ] Use appropriate access modifiers (public, private, protected)
- [ ] Understand the difference between TypeScript private and # private fields
- [ ] Use getters and setters for controlled property access
- [ ] Implement inheritance with extends and super
- [ ] Use abstract classes for shared behavior with required implementations
- [ ] Implement interfaces to define contracts
- [ ] Use static members for class-level functionality
- [ ] Prefer composition over inheritance when appropriate
- [ ] Use readonly for immutable properties
- [ ] Follow the principle of least privilege for access modifiers

## Next Steps

Now that you understand classes and OOP in TypeScript, let's explore generics for creating reusable and type-safe code.

---

*Continue to: [Generics and Reusable Code](11-generics.md)*