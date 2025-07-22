# 🧩 JSX & Components: The Building Blocks of React

> **Master the foundation: JSX syntax, component creation, and the mental model that powers React applications**

## 🎯 What You'll Learn

- JSX syntax and how it transforms into JavaScript
- Creating functional components with modern React
- Component composition and the component tree
- Props flow and component communication
- Common JSX patterns and best practices

## 🤔 What is JSX?

JSX (JavaScript XML) is a syntax extension that lets you write HTML-like code inside JavaScript. It's **not** HTML - it's syntactic sugar that gets compiled to `React.createElement()` calls.

```jsx
// This JSX...
const element = <h1>Hello, World!</h1>;

// ...compiles to this JavaScript:
const element = React.createElement('h1', null, 'Hello, World!');
```

### JSX Rules You Must Know

```jsx
// ✅ CORRECT: JSX must return a single parent element
function ValidComponent() {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
}

// ✅ CORRECT: Use React.Fragment or <> for multiple elements
function AlsoValid() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  );
}

// ❌ WRONG: Multiple root elements
function InvalidComponent() {
  return (
    <h1>Title</h1>
    <p>Content</p> // This will cause an error!
  );
}
```

### JSX vs HTML: Key Differences

```jsx
function JSXDifferences() {
  return (
    <div>
      {/* Use className instead of class */}
      <div className="container">
        
        {/* Use camelCase for attributes */}
        <input 
          type="text" 
          onChange={handleChange}  // not onchange
          autoComplete="off"       // not autocomplete
        />
        
        {/* Self-closing tags must have closing slash */}
        <img src="image.jpg" alt="Description" />
        <br />
        
        {/* Use curly braces for JavaScript expressions */}
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        
        {/* Comments use JavaScript syntax */}
        {/* This is a comment in JSX */}
      </div>
    </div>
  );
}
```

## 🏗️ Creating Components

### Functional Components (Modern React)

```jsx
// Simple component
function Welcome() {
  return <h1>Welcome to React!</h1>;
}

// Component with props
function Greeting({ name, age }) {
  return (
    <div>
      <h2>Hello, {name}!</h2>
      <p>You are {age} years old.</p>
    </div>
  );
}

// Arrow function component
const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Using the components
function App() {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div>
      <Welcome />
      <Greeting name="Alice" age={25} />
      <Button onClick={handleClick} variant="success">
        Click me!
      </Button>
    </div>
  );
}
```

### Component Naming and File Structure

```jsx
// ✅ CORRECT: PascalCase for component names
function UserProfile() { /* ... */ }
const NavigationBar = () => { /* ... */ };

// ❌ WRONG: lowercase or camelCase
function userProfile() { /* ... */ }  // Won't work as JSX element
const navigationBar = () => { /* ... */ };

// File structure best practices:
// components/
//   ├── UserProfile.jsx
//   ├── NavigationBar.jsx
//   └── Button/
//       ├── Button.jsx
//       ├── Button.css
//       └── index.js  // exports Button
```

## 🔄 Component Composition

### The Power of Composition

```jsx
// Base components
function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}

// Composed component
function UserCard({ user }) {
  return (
    <Card className="user-card">
      <CardHeader>
        <h3>{user.name}</h3>
      </CardHeader>
      <CardBody>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </CardBody>
      <CardFooter>
        <button>Edit Profile</button>
      </CardFooter>
    </Card>
  );
}
```

### Conditional Rendering Patterns

```jsx
function ConditionalExample({ user, isLoading, error }) {
  // Pattern 1: Logical AND (&&)
  const showWelcome = user && !isLoading;
  
  return (
    <div>
      {/* Simple conditional rendering */}
      {isLoading && <div>Loading...</div>}
      
      {/* Conditional with logical AND */}
      {showWelcome && (
        <div>
          <h2>Welcome back, {user.name}!</h2>
        </div>
      )}
      
      {/* Ternary operator for if-else */}
      {error ? (
        <div className="error">Error: {error.message}</div>
      ) : (
        <div className="success">Everything looks good!</div>
      )}
      
      {/* Complex conditional logic */}
      {(() => {
        if (isLoading) return <div>Loading...</div>;
        if (error) return <div>Error occurred</div>;
        if (user) return <div>Welcome, {user.name}</div>;
        return <div>Please log in</div>;
      })()}
    </div>
  );
}
```

## 📊 Visual Component Tree

```
App
├── Header
│   ├── Logo
│   └── Navigation
│       ├── NavItem ("Home")
│       ├── NavItem ("About")
│       └── NavItem ("Contact")
├── Main
│   ├── UserCard
│   │   ├── CardHeader
│   │   ├── CardBody
│   │   └── CardFooter
│   └── PostList
│       ├── Post
│       ├── Post
│       └── Post
└── Footer
    └── Copyright
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Mutating Props

```jsx
// ❌ WRONG: Never mutate props
function BadComponent({ user }) {
  user.name = 'Modified'; // DON'T DO THIS!
  return <div>{user.name}</div>;
}

// ✅ CORRECT: Props are read-only
function GoodComponent({ user }) {
  const displayName = user.name.toUpperCase();
  return <div>{displayName}</div>;
}
```

### 2. Incorrect JSX Expressions

```jsx
function JSXMistakes({ items, showTitle }) {
  return (
    <div>
      {/* ❌ WRONG: Will render "false" as text */}
      {showTitle && true && <h1>Title</h1>}
      
      {/* ✅ CORRECT: Use boolean conversion */}
      {!!showTitle && <h1>Title</h1>}
      {showTitle === true && <h1>Title</h1>}
      
      {/* ❌ WRONG: Will render "0" when items is empty */}
      {items.length && <div>Items: {items.length}</div>}
      
      {/* ✅ CORRECT: Explicit boolean check */}
      {items.length > 0 && <div>Items: {items.length}</div>}
    </div>
  );
}
```

### 3. Inline Object Creation

```jsx
// ❌ WRONG: Creates new object on every render
function BadStyling() {
  return (
    <div style={{ color: 'red', fontSize: '16px' }}>
      This creates a new object every render!
    </div>
  );
}

// ✅ CORRECT: Define styles outside or use CSS classes
const styles = {
  error: {
    color: 'red',
    fontSize: '16px'
  }
};

function GoodStyling() {
  return (
    <div style={styles.error}>
      This reuses the same object!
    </div>
  );
}
```

## 🎯 When and Why to Use Components

### Component Creation Guidelines

```jsx
// ✅ GOOD: Create components for reusability
function Button({ children, variant, onClick }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// ✅ GOOD: Create components for complex logic
function UserAvatar({ user, size = 'medium' }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg'
  };
  
  return (
    <div className={`avatar ${sizeClasses[size]}`}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} />
      ) : (
        <span>{getInitials(user.name)}</span>
      )}
    </div>
  );
}

// ❌ AVOID: Over-componentizing simple elements
// Don't create a component for every single div or span
function OverEngineered() {
  return <div>Just use a div here</div>;
}
```

## 🧪 Mini Challenges

### Challenge 1: Build a Product Card

Create a `ProductCard` component that displays:
- Product image
- Product name
- Price (with currency formatting)
- "Add to Cart" button
- Sale badge (if on sale)

```jsx
// Your solution here:
function ProductCard({ product }) {
  // Implement this component
}

// Test data:
const sampleProduct = {
  id: 1,
  name: "Wireless Headphones",
  price: 99.99,
  image: "headphones.jpg",
  onSale: true,
  originalPrice: 149.99
};
```

<details>
<summary>💡 Solution</summary>

```jsx
function ProductCard({ product }) {
  const formatPrice = (price) => `$${price.toFixed(2)}`;
  
  return (
    <div className="product-card">
      {product.onSale && (
        <div className="sale-badge">SALE</div>
      )}
      
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image"
      />
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="price-section">
          <span className="current-price">
            {formatPrice(product.price)}
          </span>
          
          {product.onSale && product.originalPrice && (
            <span className="original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        
        <button className="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

</details>

### Challenge 2: Conditional Navigation

Create a `Navigation` component that shows different menu items based on user authentication status.

```jsx
// Requirements:
// - Show "Login" and "Register" when user is null
// - Show "Dashboard", "Profile", "Logout" when user exists
// - Highlight current page

function Navigation({ user, currentPage }) {
  // Your solution here
}
```

<details>
<summary>💡 Solution</summary>

```jsx
function Navigation({ user, currentPage }) {
  const NavItem = ({ href, children, isActive }) => (
    <a 
      href={href} 
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      {children}
    </a>
  );
  
  return (
    <nav className="navigation">
      {user ? (
        // Authenticated user menu
        <>
          <NavItem 
            href="/dashboard" 
            isActive={currentPage === 'dashboard'}
          >
            Dashboard
          </NavItem>
          <NavItem 
            href="/profile" 
            isActive={currentPage === 'profile'}
          >
            Profile
          </NavItem>
          <NavItem href="/logout">Logout</NavItem>
        </>
      ) : (
        // Guest user menu
        <>
          <NavItem 
            href="/login" 
            isActive={currentPage === 'login'}
          >
            Login
          </NavItem>
          <NavItem 
            href="/register" 
            isActive={currentPage === 'register'}
          >
            Register
          </NavItem>
        </>
      )}
    </nav>
  );
}
```

</details>

## 🎤 Interview Insights

### What Interviewers Look For

1. **JSX Understanding**: "Explain what happens when JSX is compiled"
   - **Good Answer**: JSX transforms into `React.createElement()` calls, creating a virtual DOM representation

2. **Component Design**: "How do you decide when to create a new component?"
   - **Good Answer**: Reusability, single responsibility, complex logic separation, and maintainability

3. **Props vs State**: "What's the difference between props and state?"
   - **Good Answer**: Props are read-only data passed from parent; state is mutable data managed within component

### Common Interview Questions

```jsx
// Q: What's wrong with this code?
function BrokenComponent({ items }) {
  return (
    <div>
      <h1>Items</h1>
      {items.map(item => (
        <div>{item.name}</div>  // Missing key prop!
      ))}
    </div>
  );
}

// Q: Fix this conditional rendering
function FixMe({ count }) {
  return (
    <div>
      {count && <p>Count: {count}</p>}  // Will show "0" when count is 0
    </div>
  );
}

// A: Correct version
function Fixed({ count }) {
  return (
    <div>
      {count > 0 && <p>Count: {count}</p>}
    </div>
  );
}
```

### Pro Tips for Interviews

1. **Always mention keys** when discussing lists
2. **Explain the virtual DOM** concept clearly
3. **Show awareness of performance** implications
4. **Demonstrate composition** over inheritance
5. **Use modern functional components** (avoid class components unless specifically asked)

## 🚀 Next Steps

Now that you understand JSX and components, you're ready to dive into:
- **Props & Children** - How components communicate
- **State Management** - Making components interactive
- **Event Handling** - Responding to user interactions

---

> **Key Takeaway**: JSX is just syntactic sugar for `React.createElement()`. Components are functions that return JSX. Master these fundamentals, and everything else in React becomes much clearer!