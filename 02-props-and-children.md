# 🎁 Props & Children: Component Communication Mastery

> **Learn how React components talk to each other through props and unlock the power of component composition with children**

## 🎯 What You'll Learn

- Props: the data highway between components
- Destructuring props like a pro
- Default props and prop validation
- The special `children` prop and composition patterns
- Prop drilling and when it becomes a problem
- Advanced prop patterns for flexible components

## 🚀 Understanding Props

Props (short for "properties") are how parent components pass data to child components. Think of them as function arguments for your components.

```jsx
// Parent component passing props
function App() {
  const user = {
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "avatar.jpg",
    isOnline: true
  };
  
  return (
    <div>
      {/* Passing different types of props */}
      <UserProfile 
        user={user}                    // Object prop
        theme="dark"                   // String prop
        showStatus={true}              // Boolean prop
        onEdit={() => console.log('Edit')} // Function prop
        maxPosts={10}                  // Number prop
      />
    </div>
  );
}

// Child component receiving props
function UserProfile({ user, theme, showStatus, onEdit, maxPosts }) {
  return (
    <div className={`profile profile--${theme}`}>
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      
      {showStatus && (
        <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
          {user.isOnline ? '🟢 Online' : '⚫ Offline'}
        </span>
      )}
      
      <button onClick={onEdit}>Edit Profile</button>
      <p>Showing last {maxPosts} posts</p>
    </div>
  );
}
```

## 🎯 Props Destructuring Patterns

### Basic Destructuring

```jsx
// ✅ GOOD: Destructure in function parameters
function Welcome({ name, age, city }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}, City: {city}</p>
    </div>
  );
}

// ❌ AVOID: Using props object directly
function WelcomeVerbose(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>Age: {props.age}, City: {props.city}</p>
    </div>
  );
}
```

### Advanced Destructuring with Defaults

```jsx
function Button({ 
  children,
  variant = 'primary',     // Default value
  size = 'medium',
  disabled = false,
  onClick = () => {},      // Default function
  ...restProps            // Spread remaining props
}) {
  const baseClasses = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  
  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass}`}
      disabled={disabled}
      onClick={onClick}
      {...restProps}  // Pass through any additional props
    >
      {children}
    </button>
  );
}

// Usage examples
function ButtonExamples() {
  return (
    <div>
      <Button>Default Button</Button>
      <Button variant="secondary" size="large">
        Large Secondary
      </Button>
      <Button disabled onClick={() => alert('Clicked')}>
        Disabled Button
      </Button>
      <Button type="submit" form="myForm">  {/* type and form passed via ...restProps */}
        Submit
      </Button>
    </div>
  );
}
```

### Nested Object Destructuring

```jsx
function UserCard({ 
  user: { 
    name, 
    email, 
    profile: { bio, location, website } = {} // Default empty object
  },
  settings: { theme, notifications } = { theme: 'light', notifications: true }
}) {
  return (
    <div className={`user-card user-card--${theme}`}>
      <h3>{name}</h3>
      <p>{email}</p>
      {bio && <p className="bio">{bio}</p>}
      {location && <p>📍 {location}</p>}
      {website && <a href={website}>🌐 Website</a>}
      
      {notifications && (
        <div className="notification-badge">🔔</div>
      )}
    </div>
  );
}

// Usage
const userData = {
  name: "Alex Johnson",
  email: "alex@example.com",
  profile: {
    bio: "Full-stack developer passionate about React",
    location: "San Francisco, CA",
    website: "https://alexjohnson.dev"
  }
};

const userSettings = {
  theme: "dark",
  notifications: true
};

<UserCard user={userData} settings={userSettings} />
```

## 👶 The Children Prop: Composition Magic

The `children` prop is special - it represents the content between opening and closing JSX tags.

### Basic Children Usage

```jsx
// Container component that wraps children
function Card({ children, title, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body">
        {children}  {/* This is where child content goes */}
      </div>
    </div>
  );
}

// Usage - anything between <Card> tags becomes children
function App() {
  return (
    <div>
      <Card title="User Info">
        <h3>John Doe</h3>
        <p>Software Engineer</p>
        <button>Contact</button>
      </Card>
      
      <Card title="Statistics" className="stats-card">
        <div className="stat">
          <span className="number">1,234</span>
          <span className="label">Users</span>
        </div>
        <div className="stat">
          <span className="number">567</span>
          <span className="label">Orders</span>
        </div>
      </Card>
    </div>
  );
}
```

### Advanced Children Patterns

```jsx
// 1. Children as a function (render props pattern)
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);
  
  // Call children as a function, passing state
  return children({ data, loading, error });
}

// Usage
function UserList() {
  return (
    <DataFetcher url="/api/users">
      {({ data, loading, error }) => {
        if (loading) return <div>Loading users...</div>;
        if (error) return <div>Error: {error.message}</div>;
        
        return (
          <ul>
            {data.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        );
      }}
    </DataFetcher>
  );
}

// 2. Manipulating children with React.Children
function List({ children, ordered = false }) {
  const Tag = ordered ? 'ol' : 'ul';
  
  // Add props to each child
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        key: index,
        className: `${child.props.className || ''} list-item`.trim()
      });
    }
    return child;
  });
  
  return <Tag className="custom-list">{enhancedChildren}</Tag>;
}

// Usage
function TodoApp() {
  return (
    <List ordered>
      <li>Learn React fundamentals</li>
      <li>Master hooks</li>
      <li>Build awesome projects</li>
    </List>
  );
}

// 3. Conditional children rendering
function Modal({ children, isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
```

## 🔄 Prop Flow and Communication Patterns

### Parent to Child Communication

```jsx
// Parent manages state and passes down
function ShoppingCart() {
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop', price: 999, quantity: 1 },
    { id: 2, name: 'Mouse', price: 25, quantity: 2 }
  ]);
  
  const updateQuantity = (id, newQuantity) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={updateQuantity}  // Function prop
          onRemove={removeItem}              // Function prop
        />
      ))}
      <CartTotal items={items} />           {/* Data prop */}
    </div>
  );
}

// Child receives props and calls parent functions
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    onUpdateQuantity(item.id, newQuantity);
  };
  
  return (
    <div className="cart-item">
      <span>{item.name}</span>
      <span>${item.price}</span>
      <input 
        type="number" 
        value={item.quantity}
        onChange={handleQuantityChange}
        min="1"
      />
      <button onClick={() => onRemove(item.id)}>
        Remove
      </button>
    </div>
  );
}

function CartTotal({ items }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <div className="cart-total">
      <strong>Total: ${total.toFixed(2)}</strong>
    </div>
  );
}
```

### Prop Drilling Problem

```jsx
// ❌ PROBLEM: Prop drilling - passing props through multiple levels
function App() {
  const [user, setUser] = useState({ name: 'John', theme: 'dark' });
  
  return (
    <Layout user={user} setUser={setUser}>
      <Dashboard user={user} setUser={setUser} />
    </Layout>
  );
}

function Layout({ children, user, setUser }) {
  return (
    <div>
      <Header user={user} setUser={setUser} />  {/* Passing through */}
      <main>{children}</main>
    </div>
  );
}

function Header({ user, setUser }) {
  return (
    <header>
      <Navigation user={user} />               {/* Still passing through */}
      <UserMenu user={user} setUser={setUser} />
    </header>
  );
}

function Navigation({ user }) {
  return (
    <nav>
      <ThemeToggle user={user} />              {/* Finally used here */}
    </nav>
  );
}

function ThemeToggle({ user }) {
  // This component is 4 levels deep but needs user data!
  return (
    <button>
      Current theme: {user.theme}
    </button>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Mutating Props

```jsx
// ❌ WRONG: Never mutate props
function BadComponent({ user, items }) {
  user.name = 'Modified';           // DON'T DO THIS!
  items.push({ id: 4, name: 'New' }); // DON'T DO THIS!
  
  return <div>{user.name}</div>;
}

// ✅ CORRECT: Create new objects/arrays
function GoodComponent({ user, items }) {
  const updatedUser = { ...user, name: 'Modified' };
  const updatedItems = [...items, { id: 4, name: 'New' }];
  
  return <div>{updatedUser.name}</div>;
}
```

### 2. Unnecessary Prop Passing

```jsx
// ❌ WRONG: Passing all props when only some are needed
function OverpassingParent() {
  const massiveUserObject = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    preferences: { /* huge object */ },
    history: { /* huge array */ },
    // ... 50 more properties
  };
  
  return <SimpleGreeting user={massiveUserObject} />;
}

function SimpleGreeting({ user }) {
  return <h1>Hello, {user.name}!</h1>;  // Only needs name!
}

// ✅ CORRECT: Pass only what's needed
function EfficientParent() {
  const user = { /* massive object */ };
  
  return <SimpleGreeting name={user.name} />;
}

function SimpleGreeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

### 3. Boolean Prop Mistakes

```jsx
// ❌ WRONG: Explicit true values
<Button disabled={true} loading={true} />

// ✅ CORRECT: Shorthand for true
<Button disabled loading />

// ❌ WRONG: String booleans
<Button disabled="true" />  // This is always truthy!

// ✅ CORRECT: Actual booleans
<Button disabled={isDisabled} />
```

## 🎯 When and Why to Use Different Prop Patterns

### Component Flexibility Spectrum

```jsx
// 1. RIGID: Specific, limited use cases
function UserAvatar({ user }) {
  return (
    <img 
      src={user.avatar} 
      alt={user.name}
      className="user-avatar"
    />
  );
}

// 2. FLEXIBLE: Configurable behavior
function Avatar({ 
  src, 
  alt, 
  size = 'medium', 
  shape = 'circle',
  fallback = '👤'
}) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };
  
  return (
    <div className={`avatar avatar--${shape} ${sizeClasses[size]}`}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="avatar-fallback">{fallback}</span>
      )}
    </div>
  );
}

// 3. HIGHLY FLEXIBLE: Composition-based
function FlexibleCard({ children, ...props }) {
  return (
    <div className="card" {...props}>
      {children}
    </div>
  );
}

// Usage shows the flexibility
function Examples() {
  return (
    <div>
      {/* Rigid - only works with user objects */}
      <UserAvatar user={currentUser} />
      
      {/* Flexible - works with any image data */}
      <Avatar 
        src="profile.jpg" 
        alt="Profile" 
        size="large" 
        shape="square"
      />
      
      {/* Highly flexible - can contain anything */}
      <FlexibleCard className="special" onClick={handleClick}>
        <h3>Custom Content</h3>
        <p>Any JSX can go here</p>
        <Avatar src="user.jpg" alt="User" />
      </FlexibleCard>
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Smart Button Component

Create a `Button` component that:
- Accepts `variant` (primary, secondary, danger)
- Accepts `size` (small, medium, large)
- Shows loading state with spinner
- Handles disabled state
- Accepts any additional HTML button props

```jsx
// Your solution:
function Button({ children, variant, size, loading, disabled, ...props }) {
  // Implement this component
}

// Test cases:
<Button variant="primary" size="large">Save</Button>
<Button variant="danger" loading disabled>Delete</Button>
<Button onClick={handleClick} type="submit">Submit</Button>
```

<details>
<summary>💡 Solution</summary>

```jsx
function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const loadingClass = loading ? 'btn--loading' : '';
  
  const allClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <button
      className={allClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner">⏳</span>}
      {children}
    </button>
  );
}
```

</details>

### Challenge 2: Flexible List Component

Create a `List` component that:
- Renders items from an array
- Accepts a render function for custom item rendering
- Shows empty state when no items
- Supports loading state

```jsx
// Your solution:
function List({ items, renderItem, loading, emptyMessage }) {
  // Implement this component
}

// Test cases:
const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];

<List 
  items={users}
  renderItem={(user) => <div key={user.id}>{user.name}</div>}
  emptyMessage="No users found"
/>
```

<details>
<summary>💡 Solution</summary>

```jsx
function List({ 
  items = [], 
  renderItem, 
  loading = false, 
  emptyMessage = 'No items found',
  className = ''
}) {
  if (loading) {
    return <div className="list-loading">Loading...</div>;
  }
  
  if (items.length === 0) {
    return <div className="list-empty">{emptyMessage}</div>;
  }
  
  return (
    <div className={`list ${className}`}>
      {items.map((item, index) => {
        // Support both render function and default rendering
        if (renderItem) {
          return renderItem(item, index);
        }
        
        // Default rendering assumes item has id and can be stringified
        return (
          <div key={item.id || index} className="list-item">
            {typeof item === 'object' ? JSON.stringify(item) : item}
          </div>
        );
      })}
    </div>
  );
}
```

</details>

## 🎤 Interview Insights

### What Interviewers Ask

1. **"Explain the difference between props and state"**
   - **Good Answer**: Props are read-only data passed from parent to child. State is mutable data managed within a component. Props flow down, events flow up.

2. **"What is prop drilling and how do you solve it?"**
   - **Good Answer**: Prop drilling is passing props through multiple component layers. Solutions include Context API, state management libraries, or component composition.

3. **"How do you make components reusable?"**
   - **Good Answer**: Use props for configuration, provide sensible defaults, use children for composition, and follow single responsibility principle.

### Code Review Red Flags

```jsx
// ❌ RED FLAGS in interviews:

// 1. Mutating props
function Bad({ user }) {
  user.name = 'Changed';  // NEVER!
  return <div>{user.name}</div>;
}

// 2. Not using destructuring
function Verbose(props) {
  return <div>{props.user.name} - {props.user.email}</div>;
}

// 3. Inline object creation
function Inefficient() {
  return (
    <Component 
      style={{ color: 'red' }}  // New object every render!
      data={{ items: [] }}       // New object every render!
    />
  );
}

// 4. Missing key props in lists
function MissingKeys({ items }) {
  return (
    <div>
      {items.map(item => <div>{item.name}</div>)}  // No key!
    </div>
  );
}
```

### Pro Interview Tips

1. **Always destructure props** in function parameters
2. **Mention performance implications** of prop changes
3. **Show awareness of prop drilling** and solutions
4. **Demonstrate composition patterns** with children
5. **Use TypeScript prop types** if asked about type safety

## 🚀 Next Steps

Now that you understand props and children, you're ready for:
- **useState and Functional State** - Making components interactive
- **Event Handling** - Responding to user actions
- **Controlled Components** - Managing form inputs

---

> **Key Takeaway**: Props are the communication system of React. Master prop patterns and component composition, and you'll build flexible, reusable components that scale with your application!