# 🔄 useState & Functional State: Making Components Interactive

> **Master React's most fundamental hook: useState. Learn how to manage component state, trigger re-renders, and build truly interactive applications**

## 🎯 What You'll Learn

- useState fundamentals and the state update cycle
- State initialization patterns and lazy initialization
- Functional updates and avoiding stale closures
- Managing different types of state (primitives, objects, arrays)
- State batching and performance considerations
- Common useState patterns and anti-patterns

## 🚀 useState Fundamentals

### The Anatomy of useState

```jsx
import { useState } from 'react';

function Counter() {
  // useState returns an array with exactly 2 elements:
  // [currentValue, setterFunction]
  const [count, setCount] = useState(0); // 0 is the initial value
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
```

### State Update Cycle

```jsx
function StateUpdateDemo() {
  const [message, setMessage] = useState('Initial');
  
  console.log('Component rendering with message:', message);
  
  const handleClick = () => {
    console.log('Before setState:', message);
    setMessage('Updated');
    console.log('After setState (still old):', message); // Still "Initial"!
    
    // State updates are asynchronous and trigger re-render
    // The new value will be available in the next render
  };
  
  return (
    <div>
      <p>Message: {message}</p>
      <button onClick={handleClick}>Update Message</button>
    </div>
  );
}

// Console output when button is clicked:
// "Component rendering with message: Initial"
// "Before setState: Initial"
// "After setState (still old): Initial"
// "Component rendering with message: Updated"
```

## 🎯 State Initialization Patterns

### Simple Initialization

```jsx
function SimpleState() {
  // Primitive values
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Objects and arrays
  const [user, setUser] = useState({ name: '', email: '' });
  const [items, setItems] = useState([]);
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input 
        type="number" 
        value={age} 
        onChange={(e) => setAge(Number(e.target.value))}
        placeholder="Age"
      />
      <label>
        <input 
          type="checkbox" 
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>
    </div>
  );
}
```

### Lazy Initialization (Performance Optimization)

```jsx
// ❌ EXPENSIVE: This function runs on every render
function ExpensiveInit() {
  const [data, setData] = useState(expensiveCalculation()); // Runs every render!
  return <div>{data}</div>;
}

// ✅ OPTIMIZED: Lazy initialization with function
function OptimizedInit() {
  // Pass a function to useState - it only runs once
  const [data, setData] = useState(() => {
    console.log('Expensive calculation running...');
    return expensiveCalculation(); // Only runs on initial render
  });
  
  return <div>{data}</div>;
}

// Real-world examples of lazy initialization
function LazyExamples() {
  // Reading from localStorage only once
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Complex object creation
  const [gameState, setGameState] = useState(() => {
    return {
      level: 1,
      score: 0,
      lives: 3,
      powerUps: [],
      enemies: generateEnemies(1) // Expensive function
    };
  });
  
  // Date/time that shouldn't change
  const [sessionStart, setSessionStart] = useState(() => new Date());
  
  return (
    <div>
      <p>Theme: {theme}</p>
      <p>Game Level: {gameState.level}</p>
      <p>Session started: {sessionStart.toLocaleTimeString()}</p>
    </div>
  );
}

function expensiveCalculation() {
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }
  return result;
}

function generateEnemies(level) {
  // Simulate expensive enemy generation
  return Array.from({ length: level * 5 }, (_, i) => ({
    id: i,
    type: 'goblin',
    health: 100,
    position: { x: Math.random() * 800, y: Math.random() * 600 }
  }));
}
```

## 🔄 Functional Updates: Avoiding Stale Closures

### The Stale Closure Problem

```jsx
// ❌ PROBLEM: Stale closure with rapid updates
function StaleClosureProblem() {
  const [count, setCount] = useState(0);
  
  const handleMultipleUpdates = () => {
    // These all use the same 'count' value from when the function was created
    setCount(count + 1); // If count was 0, this sets it to 1
    setCount(count + 1); // This also sets it to 1 (not 2!)
    setCount(count + 1); // This also sets it to 1 (not 3!)
    
    // Result: count becomes 1, not 3
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleMultipleUpdates}>
        Add 3 (Broken)
      </button>
    </div>
  );
}

// ✅ SOLUTION: Functional updates
function FunctionalUpdatesSolution() {
  const [count, setCount] = useState(0);
  
  const handleMultipleUpdates = () => {
    // Use functional updates - each gets the latest value
    setCount(prevCount => prevCount + 1); // Gets current count
    setCount(prevCount => prevCount + 1); // Gets updated count
    setCount(prevCount => prevCount + 1); // Gets updated count again
    
    // Result: count increases by 3
  };
  
  const handleAsyncUpdate = () => {
    // Functional updates work great with async operations
    setTimeout(() => {
      setCount(prevCount => prevCount + 1); // Always gets latest value
    }, 1000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleMultipleUpdates}>
        Add 3 (Works!)
      </button>
      <button onClick={handleAsyncUpdate}>
        Add 1 After Delay
      </button>
    </div>
  );
}
```

### Advanced Functional Update Patterns

```jsx
function AdvancedFunctionalUpdates() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a project', completed: false }
  ]);
  
  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };
  
  // Add new todo
  const addTodo = (text) => {
    setTodos(prevTodos => [
      ...prevTodos,
      {
        id: Date.now(), // Simple ID generation
        text,
        completed: false
      }
    ]);
  };
  
  // Remove todo
  const removeTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };
  
  // Complex state update with multiple conditions
  const updateTodoWithValidation = (id, newText) => {
    setTodos(prevTodos => {
      // You can add complex logic in functional updates
      if (!newText.trim()) {
        // Don't update if text is empty
        return prevTodos;
      }
      
      return prevTodos.map(todo => {
        if (todo.id === id) {
          return {
            ...todo,
            text: newText.trim(),
            lastModified: new Date().toISOString()
          };
        }
        return todo;
      });
    });
  };
  
  return (
    <div>
      <h3>Todo List</h3>
      {todos.map(todo => (
        <div key={todo.id} className="todo-item">
          <input 
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleTodo(todo.id)}
          />
          <span className={todo.completed ? 'completed' : ''}>
            {todo.text}
          </span>
          <button onClick={() => removeTodo(todo.id)}>Remove</button>
        </div>
      ))}
      
      <button onClick={() => addTodo('New todo')}>
        Add Todo
      </button>
    </div>
  );
}
```

## 📊 Managing Different State Types

### Object State Management

```jsx
function ObjectStateManagement() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    profile: {
      bio: '',
      avatar: null,
      socialLinks: []
    }
  });
  
  // ❌ WRONG: Mutating state directly
  const updateNameWrong = (newName) => {
    user.name = newName; // DON'T DO THIS!
    setUser(user);
  };
  
  // ✅ CORRECT: Creating new object
  const updateName = (newName) => {
    setUser(prevUser => ({
      ...prevUser,
      name: newName
    }));
  };
  
  // ✅ CORRECT: Updating nested objects
  const updateTheme = (newTheme) => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        theme: newTheme
      }
    }));
  };
  
  // ✅ CORRECT: Updating deeply nested arrays
  const addSocialLink = (platform, url) => {
    setUser(prevUser => ({
      ...prevUser,
      profile: {
        ...prevUser.profile,
        socialLinks: [
          ...prevUser.profile.socialLinks,
          { platform, url, id: Date.now() }
        ]
      }
    }));
  };
  
  // Helper function for complex nested updates
  const updateUserField = (path, value) => {
    setUser(prevUser => {
      const newUser = { ...prevUser };
      
      // Simple path handling (for demo purposes)
      if (path === 'preferences.theme') {
        newUser.preferences = { ...newUser.preferences, theme: value };
      } else if (path === 'profile.bio') {
        newUser.profile = { ...newUser.profile, bio: value };
      }
      
      return newUser;
    });
  };
  
  return (
    <div>
      <input 
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
        placeholder="Name"
      />
      
      <select 
        value={user.preferences.theme}
        onChange={(e) => updateTheme(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <textarea 
        value={user.profile.bio}
        onChange={(e) => updateUserField('profile.bio', e.target.value)}
        placeholder="Bio"
      />
      
      <button onClick={() => addSocialLink('twitter', '@username')}>
        Add Twitter
      </button>
      
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
```

### Array State Management

```jsx
function ArrayStateManagement() {
  const [items, setItems] = useState([
    { id: 1, name: 'Apple', category: 'fruit', price: 1.2 },
    { id: 2, name: 'Banana', category: 'fruit', price: 0.8 },
    { id: 3, name: 'Carrot', category: 'vegetable', price: 0.5 }
  ]);
  
  // Add item to end
  const addItem = (item) => {
    setItems(prevItems => [...prevItems, { ...item, id: Date.now() }]);
  };
  
  // Add item to beginning
  const addItemToStart = (item) => {
    setItems(prevItems => [{ ...item, id: Date.now() }, ...prevItems]);
  };
  
  // Remove item by id
  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Update item by id
  const updateItem = (id, updates) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };
  
  // Insert item at specific index
  const insertItemAt = (index, item) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 0, { ...item, id: Date.now() });
      return newItems;
    });
  };
  
  // Move item (reorder)
  const moveItem = (fromIndex, toIndex) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };
  
  // Sort items
  const sortItems = (sortBy) => {
    setItems(prevItems => {
      const sorted = [...prevItems].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'price') {
          return a.price - b.price;
        }
        return 0;
      });
      return sorted;
    });
  };
  
  // Filter and update (complex operation)
  const updateItemsInCategory = (category, updates) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.category === category 
          ? { ...item, ...updates }
          : item
      )
    );
  };
  
  return (
    <div>
      <h3>Items ({items.length})</h3>
      
      <div className="controls">
        <button onClick={() => addItem({ name: 'Orange', category: 'fruit', price: 1.0 })}>
          Add Orange
        </button>
        <button onClick={() => sortItems('name')}>Sort by Name</button>
        <button onClick={() => sortItems('price')}>Sort by Price</button>
        <button onClick={() => updateItemsInCategory('fruit', { onSale: true })}>
          Put Fruits on Sale
        </button>
      </div>
      
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <span>{item.name} - ${item.price}</span>
            {item.onSale && <span className="sale-badge">ON SALE</span>}
            <button onClick={() => updateItem(item.id, { price: item.price * 0.9 })}>
              10% Off
            </button>
            <button onClick={() => removeItem(item.id)}>Remove</button>
            <button onClick={() => moveItem(index, 0)}>Move to Top</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## ⚡ State Batching and Performance

### Understanding State Batching

```jsx
function StateBatchingDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  console.log('Component rendered with:', { count, name, email });
  
  // React 18: Automatic batching in all scenarios
  const handleBatchedUpdates = () => {
    console.log('Before updates');
    
    // These will be batched together - only one re-render
    setCount(c => c + 1);
    setName('John');
    setEmail('john@example.com');
    
    console.log('After updates (but before re-render)');
    // Component will re-render once with all updates
  };
  
  // Even in async operations (React 18+)
  const handleAsyncBatchedUpdates = () => {
    setTimeout(() => {
      // These are also batched in React 18
      setCount(c => c + 1);
      setName('Jane');
      setEmail('jane@example.com');
    }, 1000);
  };
  
  // Force separate updates (rarely needed)
  const handleUnbatchedUpdates = () => {
    import('react-dom').then(({ flushSync }) => {
      flushSync(() => {
        setCount(c => c + 1);
      });
      // Re-render happens here
      
      flushSync(() => {
        setName('Bob');
      });
      // Another re-render happens here
    });
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
      
      <button onClick={handleBatchedUpdates}>
        Batched Updates (1 render)
      </button>
      
      <button onClick={handleAsyncBatchedUpdates}>
        Async Batched Updates
      </button>
      
      <button onClick={handleUnbatchedUpdates}>
        Unbatched Updates (multiple renders)
      </button>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Direct State Mutation

```jsx
// ❌ WRONG: Mutating state directly
function MutationMistakes() {
  const [user, setUser] = useState({ name: 'John', hobbies: ['reading'] });
  const [items, setItems] = useState([1, 2, 3]);
  
  const badUpdate = () => {
    // DON'T DO THESE:
    user.name = 'Jane';           // Mutating object
    user.hobbies.push('coding');  // Mutating nested array
    items.push(4);                // Mutating array
    setUser(user);                // React won't detect the change!
    setItems(items);
  };
  
  // ✅ CORRECT: Create new objects/arrays
  const goodUpdate = () => {
    setUser(prevUser => ({
      ...prevUser,
      name: 'Jane',
      hobbies: [...prevUser.hobbies, 'coding']
    }));
    
    setItems(prevItems => [...prevItems, 4]);
  };
  
  return (
    <div>
      <p>User: {user.name}</p>
      <p>Hobbies: {user.hobbies.join(', ')}</p>
      <p>Items: {items.join(', ')}</p>
      <button onClick={badUpdate}>Bad Update</button>
      <button onClick={goodUpdate}>Good Update</button>
    </div>
  );
}
```

### 2. Stale State in Event Handlers

```jsx
// ❌ PROBLEM: Stale state in closures
function StaleStateProblems() {
  const [count, setCount] = useState(0);
  
  // This creates a closure that captures the current count value
  const handleDelayedIncrement = () => {
    setTimeout(() => {
      setCount(count + 1); // Uses stale count value!
    }, 3000);
  };
  
  // ✅ SOLUTION: Use functional updates
  const handleCorrectDelayedIncrement = () => {
    setTimeout(() => {
      setCount(prevCount => prevCount + 1); // Always gets latest value
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment Now</button>
      <button onClick={handleDelayedIncrement}>Increment in 3s (Broken)</button>
      <button onClick={handleCorrectDelayedIncrement}>Increment in 3s (Fixed)</button>
    </div>
  );
}
```

### 3. Unnecessary State

```jsx
// ❌ WRONG: Storing derived values in state
function UnnecessaryState({ items }) {
  const [itemCount, setItemCount] = useState(0);
  const [expensiveItems, setExpensiveItems] = useState([]);
  
  // DON'T DO THIS - these should be computed values!
  useEffect(() => {
    setItemCount(items.length);
    setExpensiveItems(items.filter(item => item.price > 100));
  }, [items]);
  
  return (
    <div>
      <p>Item count: {itemCount}</p>
      <p>Expensive items: {expensiveItems.length}</p>
    </div>
  );
}

// ✅ CORRECT: Compute derived values during render
function ComputedValues({ items }) {
  // These are computed on every render (which is fine for simple calculations)
  const itemCount = items.length;
  const expensiveItems = items.filter(item => item.price > 100);
  
  // For expensive calculations, use useMemo (covered in later chapters)
  const expensiveCalculation = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return (
    <div>
      <p>Item count: {itemCount}</p>
      <p>Expensive items: {expensiveItems.length}</p>
      <p>Total value: ${expensiveCalculation}</p>
    </div>
  );
}
```

## 🎯 When and Why to Use useState

### useState Decision Tree

```
Do you need to store data that:
├── Changes over time? ────────────────────── YES → useState
├── Triggers re-renders when it changes? ──── YES → useState
├── Is derived from props or other state? ─── NO → Computed value
├── Persists between renders? ─────────────── YES → useState
├── Is only used in event handlers? ───────── MAYBE → useRef
└── Is shared between components? ─────────── MAYBE → Context/Props
```

### Real-World useState Patterns

```jsx
// 1. Form state management
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await submitForm(formData);
      setFormData({ name: '', email: '', message: '' }); // Reset form
    } catch (error) {
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="Name"
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <input 
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <textarea 
        value={formData.message}
        onChange={(e) => handleInputChange('message', e.target.value)}
        placeholder="Message"
      />
      {errors.message && <span className="error">{errors.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      {errors.submit && <div className="error">{errors.submit}</div>}
    </form>
  );
}

// 2. Toggle and UI state
function ToggleExamples() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? 'Close' : 'Open'} Menu
      </button>
      
      <div className="tabs">
        {['home', 'about', 'contact'].map(tab => (
          <button 
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 2000);
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Load Data'}
      </button>
      
      <button onClick={() => setShowModal(true)}>Show Modal</button>
      
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Modal Content</h3>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Shopping Cart

Build a shopping cart component with:
- Add/remove items
- Update quantities
- Calculate total price
- Clear cart functionality

```jsx
// Your solution:
function ShoppingCart() {
  // Implement cart state and functions
}

// Test data:
const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 75 }
];
```

<details>
<summary>💡 Solution</summary>

```jsx
function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };
  
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };
  
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );
  
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart ({totalItems} items)</h2>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>${item.price}</span>
              <input 
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                min="1"
              />
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}
          
          <div className="cart-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
          
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
      
      <div className="products">
        <h3>Products</h3>
        {products.map(product => (
          <div key={product.id} className="product">
            <span>{product.name} - ${product.price}</span>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

</details>

### Challenge 2: Multi-Step Form

Create a multi-step form with:
- Step navigation (next/previous)
- Form validation
- Progress indicator
- Data persistence between steps

<details>
<summary>💡 Solution</summary>

```jsx
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    // Step 2
    address: '',
    city: '',
    zipCode: '',
    // Step 3
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  
  const totalSteps = 3;
  
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Required';
      if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Required';
      if (!formData.city.trim()) newErrors.city = 'Required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'Required';
    } else if (step === 3) {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Required';
      if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Required';
      if (!formData.cvv.trim()) newErrors.cvv = 'Required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Personal Information</h3>
            <input 
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="First Name"
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}
            
            <input 
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Last Name"
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
            
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
        );
      
      case 2:
        return (
          <div>
            <h3>Address Information</h3>
            <input 
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Address"
            />
            {errors.address && <span className="error">{errors.address}</span>}
            
            <input 
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
            />
            {errors.city && <span className="error">{errors.city}</span>}
            
            <input 
              value={formData.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              placeholder="Zip Code"
            />
            {errors.zipCode && <span className="error">{errors.zipCode}</span>}
          </div>
        );
      
      case 3:
        return (
          <div>
            <h3>Payment Information</h3>
            <input 
              value={formData.cardNumber}
              onChange={(e) => updateField('cardNumber', e.target.value)}
              placeholder="Card Number"
            />
            {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
            
            <input 
              value={formData.expiryDate}
              onChange={(e) => updateField('expiryDate', e.target.value)}
              placeholder="MM/YY"
            />
            {errors.expiryDate && <span className="error">{errors.expiryDate}</span>}
            
            <input 
              value={formData.cvv}
              onChange={(e) => updateField('cvv', e.target.value)}
              placeholder="CVV"
            />
            {errors.cvv && <span className="error">{errors.cvv}</span>}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="multi-step-form">
      <div className="progress-bar">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div 
            key={i + 1}
            className={`step ${currentStep >= i + 1 ? 'active' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      {renderStep()}
      
      <div className="form-navigation">
        {currentStep > 1 && (
          <button onClick={prevStep}>Previous</button>
        )}
        
        {currentStep < totalSteps ? (
          <button onClick={nextStep}>Next</button>
        ) : (
          <button onClick={handleSubmit}>Submit</button>
        )}
      </div>
      
      <div className="step-indicator">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
```

</details>

## 🎤 Interview Insights

### What Interviewers Look For

1. **State Update Understanding**: "What happens when you call setState?"
   - **Good Answer**: setState schedules a re-render, state updates are asynchronous, React may batch multiple updates

2. **Functional Updates**: "When would you use a function in setState?"
   - **Good Answer**: When the new state depends on the previous state, to avoid stale closures, especially in async operations

3. **State Structure**: "How do you decide what to put in state?"
   - **Good Answer**: Only data that changes over time and affects rendering. Avoid derived values, prefer computed values.

### Common Interview Questions

```jsx
// Q: What's wrong with this code?
function BrokenCounter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);
    setCount(count + 1); // Won't work as expected!
  };
  
  return <button onClick={increment}>Count: {count}</button>;
}

// Q: Fix this async state update
function AsyncProblem() {
  const [count, setCount] = useState(0);
  
  const delayedIncrement = () => {
    setTimeout(() => {
      setCount(count + 1); // Stale closure!
    }, 1000);
  };
  
  return <button onClick={delayedIncrement}>Count: {count}</button>;
}

// Q: Optimize this expensive initialization
function ExpensiveInit() {
  const [data, setData] = useState(expensiveCalculation()); // Runs every render!
  return <div>{data}</div>;
}
```

### Pro Interview Tips

1. **Always mention functional updates** when discussing state that depends on previous state
2. **Explain the difference** between state and props clearly
3. **Show awareness of performance** implications (unnecessary re-renders)
4. **Demonstrate immutability** principles with objects and arrays
5. **Know when NOT to use state** (derived values, refs for non-rendering data)

## 🚀 Next Steps

Now that you've mastered useState, you're ready for:
- **Rendering Logic, Lists, and Keys** - Efficiently rendering dynamic content
- **Handling DOM Events** - User interactions and event handling
- **useEffect** - Side effects and lifecycle management

---

> **Key Takeaway**: useState is React's fundamental state primitive. Master functional updates, immutability, and when to use state vs computed values. Remember: state should only contain data that changes over time and affects what's rendered!