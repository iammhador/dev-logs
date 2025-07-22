# 📚 Chapter 9: Prototypes & Inheritance

> Master JavaScript's prototype-based inheritance system and understand how objects inherit from other objects.

## 📖 Plain English Explanation

Prototypes are like "blueprints" or "templates" that objects can inherit properties and methods from. Think of them as:
- **Family traits** = children inherit characteristics from parents
- **Recipe templates** = specific recipes inherit basic cooking methods
- **Car models** = all Honda Civics share common features from the Civic "prototype"
- **Employee types** = all managers inherit basic employee properties plus management-specific ones

Unlike class-based languages, JavaScript uses prototype-based inheritance where objects can directly inherit from other objects.

## 🧬 Understanding Prototypes

### The Prototype Chain
```javascript
// Every object has a prototype (except Object.prototype)
const person = {
    name: 'Alice',
    age: 30
};

// Check the prototype
console.log(Object.getPrototypeOf(person)); // Object.prototype
console.log(person.__proto__);              // Object.prototype (deprecated way)

// The prototype chain
console.log(person.toString); // Inherited from Object.prototype
console.log(person.hasOwnProperty); // Inherited from Object.prototype

// Prototype chain visualization:
// person -> Object.prototype -> null

// Arrays have their own prototype chain
const numbers = [1, 2, 3];
console.log(Object.getPrototypeOf(numbers)); // Array.prototype
console.log(numbers.push); // Inherited from Array.prototype
console.log(numbers.toString); // Inherited from Object.prototype

// Array prototype chain:
// numbers -> Array.prototype -> Object.prototype -> null
```

### Creating Objects with Specific Prototypes
```javascript
// Method 1: Object.create()
const animalPrototype = {
    makeSound: function() {
        return `${this.name} makes a sound`;
    },
    eat: function() {
        return `${this.name} is eating`;
    }
};

const dog = Object.create(animalPrototype);
dog.name = 'Buddy';
dog.breed = 'Golden Retriever';

console.log(dog.makeSound()); // "Buddy makes a sound"
console.log(dog.eat());       // "Buddy is eating"

// Check prototype relationship
console.log(Object.getPrototypeOf(dog) === animalPrototype); // true
console.log(animalPrototype.isPrototypeOf(dog)); // true

// Method 2: Constructor functions
function Animal(name) {
    this.name = name;
}

Animal.prototype.makeSound = function() {
    return `${this.name} makes a sound`;
};

Animal.prototype.eat = function() {
    return `${this.name} is eating`;
};

const cat = new Animal('Whiskers');
console.log(cat.makeSound()); // "Whiskers makes a sound"
console.log(Object.getPrototypeOf(cat) === Animal.prototype); // true
```

### Prototype Property vs __proto__
```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const alice = new Person('Alice');

// Constructor function has 'prototype' property
console.log(Person.prototype); // { greet: function, constructor: Person }

// Instance has '__proto__' (or use Object.getPrototypeOf)
console.log(alice.__proto__ === Person.prototype); // true
console.log(Object.getPrototypeOf(alice) === Person.prototype); // true

// The relationship:
// Person.prototype === alice.__proto__
// alice inherits from Person.prototype
```

## 🏗️ Constructor Functions

### Basic Constructor Pattern
```javascript
// Constructor function (capitalized by convention)
function Person(name, age, city) {
    // Instance properties
    this.name = name;
    this.age = age;
    this.city = city;
}

// Methods on prototype (shared by all instances)
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name} from ${this.city}`;
};

Person.prototype.getAge = function() {
    return this.age;
};

Person.prototype.haveBirthday = function() {
    this.age++;
    return `Happy birthday! Now I'm ${this.age}`;
};

// Create instances
const alice = new Person('Alice', 30, 'New York');
const bob = new Person('Bob', 25, 'London');

console.log(alice.greet()); // "Hello, I'm Alice from New York"
console.log(bob.greet());   // "Hello, I'm Bob from London"

// Methods are shared (same reference)
console.log(alice.greet === bob.greet); // true

// But instance properties are separate
console.log(alice.name === bob.name); // false
```

### Constructor Function Patterns
```javascript
// Pattern 1: All methods in constructor (not recommended)
function BadPerson(name) {
    this.name = name;
    
    // ❌ Each instance gets its own copy of this method
    this.greet = function() {
        return `Hello, I'm ${this.name}`;
    };
}

// Pattern 2: Methods on prototype (recommended)
function GoodPerson(name) {
    this.name = name;
}

// ✅ All instances share this method
GoodPerson.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// Pattern 3: Prototype object replacement
function BestPerson(name) {
    this.name = name;
}

BestPerson.prototype = {
    constructor: BestPerson, // Important: restore constructor reference
    
    greet: function() {
        return `Hello, I'm ${this.name}`;
    },
    
    introduce: function() {
        return `My name is ${this.name}`;
    }
};

// Test memory efficiency
const bad1 = new BadPerson('Alice');
const bad2 = new BadPerson('Bob');
console.log(bad1.greet === bad2.greet); // false (different functions)

const good1 = new GoodPerson('Alice');
const good2 = new GoodPerson('Bob');
console.log(good1.greet === good2.greet); // true (same function)
```

### The `new` Operator
```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

// What happens when you use 'new':
// 1. Create a new empty object
// 2. Set the object's prototype to the constructor's prototype
// 3. Call the constructor with 'this' bound to the new object
// 4. Return the new object (unless constructor returns an object)

const alice = new Person('Alice', 30);

// Manual simulation of 'new' operator
function createPerson(name, age) {
    // Step 1: Create new object
    const obj = {};
    
    // Step 2: Set prototype
    Object.setPrototypeOf(obj, Person.prototype);
    
    // Step 3: Call constructor
    Person.call(obj, name, age);
    
    // Step 4: Return object
    return obj;
}

const bob = createPerson('Bob', 25);
console.log(bob.greet()); // "Hello, I'm Bob"

// Forgetting 'new' keyword
function SafePerson(name, age) {
    // Guard against missing 'new'
    if (!(this instanceof SafePerson)) {
        return new SafePerson(name, age);
    }
    
    this.name = name;
    this.age = age;
}

const charlie1 = new SafePerson('Charlie', 35); // With 'new'
const charlie2 = SafePerson('Charlie', 35);     // Without 'new'
console.log(charlie1 instanceof SafePerson); // true
console.log(charlie2 instanceof SafePerson); // true
```

## 🧬 Prototype-Based Inheritance

### Basic Inheritance Pattern
```javascript
// Parent constructor
function Animal(name, species) {
    this.name = name;
    this.species = species;
}

Animal.prototype.makeSound = function() {
    return `${this.name} makes a sound`;
};

Animal.prototype.eat = function() {
    return `${this.name} is eating`;
};

Animal.prototype.sleep = function() {
    return `${this.name} is sleeping`;
};

// Child constructor
function Dog(name, breed) {
    // Call parent constructor
    Animal.call(this, name, 'Canine');
    this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Restore constructor reference

// Add child-specific methods
Dog.prototype.bark = function() {
    return `${this.name} barks: Woof!`;
};

// Override parent method
Dog.prototype.makeSound = function() {
    return `${this.name} barks loudly`;
};

// Create instance
const buddy = new Dog('Buddy', 'Golden Retriever');

console.log(buddy.name);      // 'Buddy'
console.log(buddy.species);   // 'Canine'
console.log(buddy.breed);     // 'Golden Retriever'
console.log(buddy.eat());     // "Buddy is eating" (inherited)
console.log(buddy.bark());    // "Buddy barks: Woof!" (own method)
console.log(buddy.makeSound()); // "Buddy barks loudly" (overridden)

// Check inheritance chain
console.log(buddy instanceof Dog);    // true
console.log(buddy instanceof Animal); // true
console.log(buddy instanceof Object); // true

// Prototype chain: buddy -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
```

### Multiple Levels of Inheritance
```javascript
// Grandparent
function LivingBeing(name) {
    this.name = name;
    this.alive = true;
}

LivingBeing.prototype.breathe = function() {
    return `${this.name} is breathing`;
};

// Parent
function Animal(name, species) {
    LivingBeing.call(this, name);
    this.species = species;
}

Animal.prototype = Object.create(LivingBeing.prototype);
Animal.prototype.constructor = Animal;

Animal.prototype.move = function() {
    return `${this.name} is moving`;
};

// Child
function Mammal(name, species, furColor) {
    Animal.call(this, name, species);
    this.furColor = furColor;
    this.warmBlooded = true;
}

Mammal.prototype = Object.create(Animal.prototype);
Mammal.prototype.constructor = Mammal;

Mammal.prototype.produceMilk = function() {
    return `${this.name} produces milk`;
};

// Grandchild
function Dog(name, breed, furColor) {
    Mammal.call(this, name, 'Canine', furColor);
    this.breed = breed;
}

Dog.prototype = Object.create(Mammal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
    return `${this.name} barks`;
};

// Create instance
const max = new Dog('Max', 'German Shepherd', 'brown');

console.log(max.breathe());    // "Max is breathing" (from LivingBeing)
console.log(max.move());       // "Max is moving" (from Animal)
console.log(max.produceMilk()); // "Max produces milk" (from Mammal)
console.log(max.bark());       // "Max barks" (from Dog)

// Complex inheritance chain:
// max -> Dog.prototype -> Mammal.prototype -> Animal.prototype -> LivingBeing.prototype -> Object.prototype -> null
```

### Mixin Pattern
```javascript
// Mixins for adding functionality
const Flyable = {
    fly: function() {
        return `${this.name} is flying`;
    },
    land: function() {
        return `${this.name} has landed`;
    }
};

const Swimmable = {
    swim: function() {
        return `${this.name} is swimming`;
    },
    dive: function() {
        return `${this.name} is diving`;
    }
};

// Mixin function
function mixin(target, ...sources) {
    sources.forEach(source => {
        Object.getOwnPropertyNames(source).forEach(name => {
            if (name !== 'constructor') {
                target[name] = source[name];
            }
        });
    });
    return target;
}

// Base class
function Bird(name, species) {
    this.name = name;
    this.species = species;
}

Bird.prototype.chirp = function() {
    return `${this.name} chirps`;
};

// Add flying ability
mixin(Bird.prototype, Flyable);

// Duck can fly and swim
function Duck(name) {
    Bird.call(this, name, 'Duck');
}

Duck.prototype = Object.create(Bird.prototype);
Duck.prototype.constructor = Duck;

// Add swimming ability to Duck
mixin(Duck.prototype, Swimmable);

Duck.prototype.quack = function() {
    return `${this.name} quacks`;
};

// Create duck instance
const donald = new Duck('Donald');

console.log(donald.chirp()); // "Donald chirps" (from Bird)
console.log(donald.fly());   // "Donald is flying" (from Flyable mixin)
console.log(donald.swim());  // "Donald is swimming" (from Swimmable mixin)
console.log(donald.quack()); // "Donald quacks" (own method)
```

## 🎯 ES6 Classes (Syntactic Sugar)

### Basic Class Syntax
```javascript
// ES6 class (syntactic sugar over prototypes)
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    getAge() {
        return this.age;
    }
    
    haveBirthday() {
        this.age++;
        return `Happy birthday! Now I'm ${this.age}`;
    }
    
    // Static method
    static createAnonymous() {
        return new Person('Anonymous', 0);
    }
}

// Equivalent to constructor function approach
const alice = new Person('Alice', 30);
console.log(alice.greet()); // "Hello, I'm Alice"

// Static method usage
const anon = Person.createAnonymous();
console.log(anon.name); // 'Anonymous'

// Classes are still functions under the hood
console.log(typeof Person); // 'function'
console.log(Person.prototype.greet); // function
```

### Class Inheritance with `extends`
```javascript
// Parent class
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
    
    makeSound() {
        return `${this.name} makes a sound`;
    }
    
    eat() {
        return `${this.name} is eating`;
    }
    
    static getKingdom() {
        return 'Animalia';
    }
}

// Child class
class Dog extends Animal {
    constructor(name, breed) {
        super(name, 'Canine'); // Call parent constructor
        this.breed = breed;
    }
    
    // Override parent method
    makeSound() {
        return `${this.name} barks: Woof!`;
    }
    
    // New method
    fetch() {
        return `${this.name} fetches the ball`;
    }
    
    // Call parent method from child
    describe() {
        return `${super.eat()} and ${this.makeSound()}`;
    }
    
    // Static method
    static getSpecies() {
        return 'Canis lupus';
    }
}

// Create instance
const buddy = new Dog('Buddy', 'Golden Retriever');

console.log(buddy.name);        // 'Buddy'
console.log(buddy.species);     // 'Canine'
console.log(buddy.breed);       // 'Golden Retriever'
console.log(buddy.makeSound()); // "Buddy barks: Woof!"
console.log(buddy.fetch());     // "Buddy fetches the ball"
console.log(buddy.describe());  // "Buddy is eating and Buddy barks: Woof!"

// Static methods
console.log(Animal.getKingdom()); // 'Animalia'
console.log(Dog.getSpecies());    // 'Canis lupus'

// Inheritance check
console.log(buddy instanceof Dog);    // true
console.log(buddy instanceof Animal); // true
```

### Private Fields and Methods (ES2022)
```javascript
class BankAccount {
    // Private fields (start with #)
    #balance = 0;
    #accountNumber;
    
    constructor(accountNumber, initialBalance = 0) {
        this.#accountNumber = accountNumber;
        this.#balance = initialBalance;
    }
    
    // Public methods
    deposit(amount) {
        if (amount > 0) {
            this.#balance += amount;
            return this.#formatTransaction('deposit', amount);
        }
        throw new Error('Deposit amount must be positive');
    }
    
    withdraw(amount) {
        if (amount > 0 && amount <= this.#balance) {
            this.#balance -= amount;
            return this.#formatTransaction('withdrawal', amount);
        }
        throw new Error('Invalid withdrawal amount');
    }
    
    getBalance() {
        return this.#balance;
    }
    
    // Private method
    #formatTransaction(type, amount) {
        return `${type.toUpperCase()}: $${amount}. New balance: $${this.#balance}`;
    }
    
    // Getter
    get accountInfo() {
        return `Account ${this.#accountNumber}: $${this.#balance}`;
    }
}

const account = new BankAccount('12345', 1000);

console.log(account.deposit(500));  // "DEPOSIT: $500. New balance: $1500"
console.log(account.withdraw(200)); // "WITHDRAWAL: $200. New balance: $1300"
console.log(account.accountInfo);   // "Account 12345: $1300"

// Private fields are not accessible
// console.log(account.#balance); // SyntaxError
// account.#formatTransaction();  // SyntaxError
```

### Getters and Setters in Classes
```javascript
class Temperature {
    constructor(celsius = 0) {
        this._celsius = celsius;
    }
    
    // Getter for Fahrenheit
    get fahrenheit() {
        return (this._celsius * 9/5) + 32;
    }
    
    // Setter for Fahrenheit
    set fahrenheit(value) {
        this._celsius = (value - 32) * 5/9;
    }
    
    // Getter for Celsius
    get celsius() {
        return this._celsius;
    }
    
    // Setter for Celsius with validation
    set celsius(value) {
        if (value < -273.15) {
            throw new Error('Temperature cannot be below absolute zero');
        }
        this._celsius = value;
    }
    
    // Getter for Kelvin
    get kelvin() {
        return this._celsius + 273.15;
    }
    
    // Setter for Kelvin
    set kelvin(value) {
        this.celsius = value - 273.15; // Uses the celsius setter for validation
    }
}

const temp = new Temperature(25);

console.log(temp.celsius);    // 25
console.log(temp.fahrenheit); // 77
console.log(temp.kelvin);     // 298.15

// Set temperature using different scales
temp.fahrenheit = 86;
console.log(temp.celsius); // 30

temp.kelvin = 300;
console.log(temp.celsius); // 26.85

// Validation works
// temp.celsius = -300; // Error: Temperature cannot be below absolute zero
```

## 🔍 Prototype Manipulation

### Checking Prototypes
```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const buddy = new Dog('Buddy', 'Labrador');

// Check prototype relationships
console.log(Object.getPrototypeOf(buddy) === Dog.prototype);    // true
console.log(Dog.prototype.isPrototypeOf(buddy));               // true
console.log(Animal.prototype.isPrototypeOf(buddy));            // true
console.log(Object.prototype.isPrototypeOf(buddy));            // true

// Check constructor
console.log(buddy.constructor === Dog);    // true
console.log(buddy instanceof Dog);        // true
console.log(buddy instanceof Animal);     // true
console.log(buddy instanceof Object);     // true

// Get prototype chain
function getPrototypeChain(obj) {
    const chain = [];
    let current = obj;
    
    while (current) {
        chain.push(current.constructor?.name || 'Object');
        current = Object.getPrototypeOf(current);
        if (current === Object.prototype) {
            chain.push('Object.prototype');
            break;
        }
    }
    
    return chain;
}

console.log(getPrototypeChain(buddy)); // ['Dog', 'Animal', 'Object.prototype']
```

### Dynamic Prototype Modification
```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const alice = new Person('Alice');
const bob = new Person('Bob');

console.log(alice.greet()); // "Hello, I'm Alice"

// Add method to prototype after instances are created
Person.prototype.introduce = function() {
    return `My name is ${this.name}`;
};

// All instances get the new method
console.log(alice.introduce()); // "My name is Alice"
console.log(bob.introduce());   // "My name is Bob"

// Modify existing method
Person.prototype.greet = function() {
    return `Hi there, I'm ${this.name}!`;
};

console.log(alice.greet()); // "Hi there, I'm Alice!"

// Add property to prototype
Person.prototype.species = 'Homo sapiens';
console.log(alice.species); // 'Homo sapiens'
console.log(bob.species);   // 'Homo sapiens'

// Instance property shadows prototype property
alice.species = 'Human';
console.log(alice.species); // 'Human' (own property)
console.log(bob.species);   // 'Homo sapiens' (prototype property)

// Delete instance property to reveal prototype property
delete alice.species;
console.log(alice.species); // 'Homo sapiens' (prototype property again)
```

### Prototype Pollution (Security Concern)
```javascript
// ⚠️ Prototype pollution example (DON'T DO THIS)
function vulnerableFunction(obj) {
    // Dangerous: modifying Object.prototype
    if (obj.constructor && obj.constructor.prototype) {
        obj.constructor.prototype.isAdmin = true;
    }
}

// This affects ALL objects
const user = {};
vulnerableFunction({ constructor: Object });

console.log(user.isAdmin); // true (BAD!)
console.log({}.isAdmin);   // true (BAD!)

// ✅ Safe alternatives:
// 1. Use Object.create(null) for data objects
const safeData = Object.create(null);
safeData.name = 'Alice';
console.log(safeData.toString); // undefined (no inherited methods)

// 2. Use Map for key-value storage
const dataMap = new Map();
dataMap.set('name', 'Alice');
dataMap.set('age', 30);

// 3. Validate input and use Object.hasOwnProperty
function safeFunction(obj) {
    if (obj && typeof obj === 'object' && obj.hasOwnProperty('name')) {
        return obj.name;
    }
    return null;
}
```

## ⚠️ Common Pitfalls

### 1. Forgetting to Set Constructor
```javascript
function Animal(name) {
    this.name = name;
}

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

// ❌ Wrong: constructor reference is lost
Dog.prototype = Object.create(Animal.prototype);

const buddy = new Dog('Buddy', 'Labrador');
console.log(buddy.constructor === Dog);    // false
console.log(buddy.constructor === Animal); // true (wrong!)

// ✅ Correct: restore constructor reference
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const max = new Dog('Max', 'German Shepherd');
console.log(max.constructor === Dog); // true
```

### 2. Modifying Built-in Prototypes
```javascript
// ❌ Don't modify built-in prototypes (can break other code)
Array.prototype.last = function() {
    return this[this.length - 1];
};

// This affects ALL arrays in your application
const numbers = [1, 2, 3];
console.log(numbers.last()); // 3

// ✅ Better: create utility functions or extend in your own classes
class ExtendedArray extends Array {
    last() {
        return this[this.length - 1];
    }
    
    first() {
        return this[0];
    }
}

const extNumbers = new ExtendedArray(1, 2, 3);
console.log(extNumbers.last()); // 3
```

### 3. Prototype vs Instance Properties
```javascript
function Person(name) {
    this.name = name;
}

// ❌ Wrong: array is shared among all instances
Person.prototype.hobbies = [];

const alice = new Person('Alice');
const bob = new Person('Bob');

alice.hobbies.push('reading');
console.log(bob.hobbies); // ['reading'] (shared!)

// ✅ Correct: initialize arrays in constructor
function BetterPerson(name) {
    this.name = name;
    this.hobbies = []; // Each instance gets its own array
}

BetterPerson.prototype.addHobby = function(hobby) {
    this.hobbies.push(hobby);
};

const charlie = new BetterPerson('Charlie');
const diana = new BetterPerson('Diana');

charlie.addHobby('swimming');
console.log(diana.hobbies); // [] (separate arrays)
```

### 4. Arrow Functions and `this`
```javascript
function Person(name) {
    this.name = name;
}

// ❌ Wrong: arrow function doesn't bind 'this'
Person.prototype.greet = () => {
    return `Hello, I'm ${this.name}`; // 'this' is not the instance!
};

const alice = new Person('Alice');
console.log(alice.greet()); // "Hello, I'm undefined"

// ✅ Correct: use regular function
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

console.log(alice.greet()); // "Hello, I'm Alice"
```

## 🏋️ Mini Practice Problems

### Problem 1: Shape Hierarchy
```javascript
// Create a shape hierarchy with inheritance
// Base Shape class with area() and perimeter() methods
// Rectangle and Circle classes that extend Shape
// Square class that extends Rectangle

// Your implementation here:
class Shape {
    // Base implementation
}

class Rectangle extends Shape {
    // Rectangle implementation
}

class Circle extends Shape {
    // Circle implementation
}

class Square extends Rectangle {
    // Square implementation
}

// Test your implementation:
const rect = new Rectangle(5, 3);
const circle = new Circle(4);
const square = new Square(4);

console.log(rect.area());      // 15
console.log(circle.area());    // ~50.27
console.log(square.area());    // 16
console.log(square.perimeter()); // 16
```

### Problem 2: Mixin Implementation
```javascript
// Implement a mixin system that allows multiple inheritance

const Flyable = {
    fly() { return `${this.name} is flying`; },
    land() { return `${this.name} has landed`; }
};

const Swimmable = {
    swim() { return `${this.name} is swimming`; },
    dive() { return `${this.name} is diving`; }
};

const Walkable = {
    walk() { return `${this.name} is walking`; },
    run() { return `${this.name} is running`; }
};

// Implement mixin function
function mixin(target, ...sources) {
    // Your implementation here
}

// Base class
class Animal {
    constructor(name) {
        this.name = name;
    }
}

// Create Duck class that can fly, swim, and walk
class Duck extends Animal {
    constructor(name) {
        super(name);
    }
}

// Apply mixins
mixin(Duck.prototype, Flyable, Swimmable, Walkable);

const donald = new Duck('Donald');
console.log(donald.fly());  // "Donald is flying"
console.log(donald.swim()); // "Donald is swimming"
console.log(donald.walk()); // "Donald is walking"
```

### Problem 3: Custom instanceof
```javascript
// Implement your own version of instanceof operator

function myInstanceof(obj, constructor) {
    // Your implementation here
    // Should return true if obj is an instance of constructor
    // Should work with inheritance chain
}

// Test cases:
function Animal(name) {
    this.name = name;
}

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const buddy = new Dog('Buddy', 'Labrador');

console.log(myInstanceof(buddy, Dog));    // true
console.log(myInstanceof(buddy, Animal)); // true
console.log(myInstanceof(buddy, Object)); // true
console.log(myInstanceof(buddy, Array));  // false
```

### Problem 4: Prototype Chain Visualizer
```javascript
// Create a function that visualizes the prototype chain

function visualizePrototypeChain(obj) {
    // Your implementation here
    // Should return an array of constructor names in the chain
    // Example: ['Dog', 'Animal', 'Object']
}

// Test with complex inheritance
class LivingBeing {
    constructor(name) {
        this.name = name;
    }
}

class Animal extends LivingBeing {
    constructor(name, species) {
        super(name);
        this.species = species;
    }
}

class Mammal extends Animal {
    constructor(name, species, furColor) {
        super(name, species);
        this.furColor = furColor;
    }
}

class Dog extends Mammal {
    constructor(name, breed) {
        super(name, 'Canine', 'brown');
        this.breed = breed;
    }
}

const max = new Dog('Max', 'German Shepherd');
console.log(visualizePrototypeChain(max));
// Should output: ['Dog', 'Mammal', 'Animal', 'LivingBeing', 'Object']
```

### Problem 5: Safe Object Creation
```javascript
// Create a factory function that creates objects with safe prototypes
// to prevent prototype pollution

function createSafeObject(properties = {}) {
    // Your implementation here
    // Should create object without inheriting from Object.prototype
    // Should still allow setting and getting properties
    // Should prevent prototype pollution
}

// Test your implementation:
const safeObj = createSafeObject({ name: 'Alice', age: 30 });

console.log(safeObj.name);      // 'Alice'
console.log(safeObj.age);       // 30
console.log(safeObj.toString);  // undefined (no inherited methods)
console.log(safeObj.hasOwnProperty); // undefined

// Should not affect other objects
const normalObj = {};
console.log(normalObj.toString); // function (should still work)
```

## 💼 Interview Notes

### Common Questions:

**Q: What is the prototype chain?**
- Chain of objects linked through their prototypes
- When property is accessed, JavaScript looks up the chain
- Ends at Object.prototype (which has null prototype)
- Enables inheritance in JavaScript

**Q: Difference between `__proto__` and `prototype`?**
- `__proto__`: property of instances, points to constructor's prototype
- `prototype`: property of constructor functions, template for instances
- `obj.__proto__ === Constructor.prototype`

**Q: How does `new` operator work?**
1. Creates new empty object
2. Sets object's prototype to constructor's prototype
3. Calls constructor with `this` bound to new object
4. Returns the object (unless constructor returns object)

**Q: What's the difference between classical and prototypal inheritance?**
- Classical: classes inherit from classes (Java, C++)
- Prototypal: objects inherit from objects (JavaScript)
- JavaScript ES6 classes are syntactic sugar over prototypes

**Q: How do you implement inheritance in JavaScript?**
- Constructor functions + Object.create()
- ES6 classes with extends
- Object.create() for direct object inheritance
- Mixins for multiple inheritance

### 🏢 Asked at Companies:
- **Google**: "Implement your own version of Object.create()"
- **Facebook**: "Explain prototype pollution and how to prevent it"
- **Amazon**: "Create a mixin system for multiple inheritance"
- **Microsoft**: "Implement classical inheritance using prototypes"
- **Netflix**: "Design a safe object creation system"

## 🎯 Key Takeaways

1. **Understand the prototype chain** - foundation of JavaScript inheritance
2. **Know constructor functions vs ES6 classes** - classes are syntactic sugar
3. **Master inheritance patterns** - Object.create(), extends, mixins
4. **Be aware of prototype pollution** - security and stability concerns
5. **Use appropriate inheritance method** - composition over inheritance when possible
6. **Understand `this` binding** - especially with arrow functions
7. **Know when to use prototypes vs instances** - shared vs individual properties
8. **Practice inheritance hierarchies** - real-world object modeling

---

**Previous Chapter**: [← Objects & Object Access](./08-objects.md)  
**Next Chapter**: [Asynchronous JavaScript →](./10-async-javascript.md)

**Practice**: Try implementing the inheritance problems and experiment with different prototype patterns!