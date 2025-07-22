# 📋 Rendering Logic, Lists, and Keys: Dynamic Content Mastery

> **Master React's rendering patterns: conditional rendering, list rendering, and the crucial role of keys in React's reconciliation process**

## 🎯 What You'll Learn

- Conditional rendering patterns and best practices
- List rendering with map() and performance considerations
- The critical importance of keys in React's reconciliation
- Advanced rendering patterns and optimization techniques
- Common pitfalls and how to avoid them
- When and how to use React.Fragment

## 🔀 Conditional Rendering Patterns

### Basic Conditional Rendering

```jsx
function ConditionalBasics({ user, isLoading, error }) {
  // 1. Simple if statement (early return)
  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }
  
  if (!user) {
    return <div className="empty">No user found</div>;
  }
  
  // 2. Ternary operator for inline conditions
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      
      {/* Simple ternary */}
      <p>{user.isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      
      {/* Ternary with components */}
      {user.isPremium ? (
        <PremiumBadge />
      ) : (
        <button onClick={() => upgradeToPremium(user.id)}>
          Upgrade to Premium
        </button>
      )}
      
      {/* Logical AND for optional rendering */}
      {user.bio && <p className="bio">{user.bio}</p>}
      
      {/* Multiple conditions */}
      {user.isAdmin && user.permissions.includes('delete') && (
        <button className="danger" onClick={() => deleteUser(user.id)}>
          Delete User
        </button>
      )}
    </div>
  );
}

// Helper components
function PremiumBadge() {
  return <span className="premium-badge">⭐ Premium</span>;
}
```

### Advanced Conditional Patterns

```jsx
function AdvancedConditionals({ userRole, permissions, features }) {
  // 1. Switch-like pattern with object mapping
  const roleComponents = {
    admin: <AdminDashboard />,
    moderator: <ModeratorPanel />,
    user: <UserDashboard />,
    guest: <GuestWelcome />
  };
  
  // 2. Complex conditional logic with helper functions
  const canAccessFeature = (feature) => {
    return permissions.includes(feature) || userRole === 'admin';
  };
  
  const renderFeatureSection = () => {
    if (!features || features.length === 0) {
      return <EmptyState message="No features available" />;
    }
    
    const availableFeatures = features.filter(feature => 
      canAccessFeature(feature.permission)
    );
    
    if (availableFeatures.length === 0) {
      return <AccessDenied />;
    }
    
    return (
      <div className="features">
        {availableFeatures.map(feature => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    );
  };
  
  // 3. Nested conditional rendering
  const renderUserActions = () => {
    if (userRole === 'guest') {
      return (
        <div className="guest-actions">
          <button>Sign In</button>
          <button>Sign Up</button>
        </div>
      );
    }
    
    return (
      <div className="user-actions">
        {userRole === 'admin' && (
          <>
            <button>Manage Users</button>
            <button>System Settings</button>
          </>
        )}
        
        {(userRole === 'admin' || userRole === 'moderator') && (
          <button>Moderate Content</button>
        )}
        
        <button>Profile Settings</button>
        <button>Sign Out</button>
      </div>
    );
  };
  
  return (
    <div className="dashboard">
      {/* Render role-specific component */}
      {roleComponents[userRole] || <div>Unknown role</div>}
      
      {/* Conditional sections */}
      {renderFeatureSection()}
      {renderUserActions()}
      
      {/* Complex conditional with multiple factors */}
      {userRole !== 'guest' && permissions.includes('notifications') && (
        <NotificationCenter />
      )}
    </div>
  );
}

// Helper components
function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="access-denied">
      <p>You don't have permission to access these features.</p>
    </div>
  );
}
```

### Conditional Rendering Anti-Patterns

```jsx
// ❌ WRONG: These patterns can cause issues
function ConditionalAntiPatterns({ items, user }) {
  return (
    <div>
      {/* ❌ DON'T: Conditional rendering with numbers (0 is falsy!) */}
      {items.length && (
        <div>You have {items.length} items</div>
      )}
      {/* If items.length is 0, this renders "0" instead of nothing! */}
      
      {/* ❌ DON'T: Complex expressions in JSX */}
      {user && user.preferences && user.preferences.theme === 'dark' && user.isActive && (
        <DarkThemeComponent />
      )}
      
      {/* ❌ DON'T: Nested ternaries (hard to read) */}
      {user ? (
        user.isAdmin ? (
          user.permissions.includes('delete') ? (
            <DeleteButton />
          ) : (
            <span>No delete permission</span>
          )
        ) : (
          <span>Not an admin</span>
        )
      ) : (
        <span>No user</span>
      )}
    </div>
  );
}

// ✅ CORRECT: Better patterns
function ConditionalBestPractices({ items, user }) {
  // Helper functions for complex logic
  const hasItems = items && items.length > 0;
  const canDelete = user?.isAdmin && user?.permissions?.includes('delete');
  const isDarkThemeUser = user?.preferences?.theme === 'dark' && user?.isActive;
  
  const renderUserStatus = () => {
    if (!user) return <span>No user</span>;
    if (!user.isAdmin) return <span>Not an admin</span>;
    if (!user.permissions.includes('delete')) return <span>No delete permission</span>;
    return <DeleteButton />;
  };
  
  return (
    <div>
      {/* ✅ DO: Explicit boolean conversion */}
      {hasItems && (
        <div>You have {items.length} items</div>
      )}
      
      {/* ✅ DO: Extract complex conditions */}
      {isDarkThemeUser && <DarkThemeComponent />}
      
      {/* ✅ DO: Use helper functions for complex logic */}
      {renderUserStatus()}
      
      {/* ✅ DO: Use early returns in helper functions */}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

## 📋 List Rendering Mastery

### Basic List Rendering

```jsx
function BasicListRendering() {
  const fruits = ['apple', 'banana', 'orange', 'grape'];
  const users = [
    { id: 1, name: 'John', email: 'john@example.com', isActive: true },
    { id: 2, name: 'Jane', email: 'jane@example.com', isActive: false },
    { id: 3, name: 'Bob', email: 'bob@example.com', isActive: true }
  ];
  
  return (
    <div>
      {/* Simple array of strings */}
      <h3>Fruits</h3>
      <ul>
        {fruits.map((fruit, index) => (
          <li key={index}>{fruit}</li>
        ))}
      </ul>
      
      {/* Array of objects */}
      <h3>Users</h3>
      <div className="user-list">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h4>{user.name}</h4>
            <p>{user.email}</p>
            <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
      
      {/* Conditional rendering within lists */}
      <h3>Active Users Only</h3>
      <div className="active-users">
        {users
          .filter(user => user.isActive)
          .map(user => (
            <UserCard key={user.id} user={user} />
          ))
        }
      </div>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="user-card">
      <h4>{user.name}</h4>
      <p>{user.email}</p>
    </div>
  );
}
```

### Advanced List Patterns

```jsx
function AdvancedListPatterns() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop', category: 'electronics', price: 999, inStock: true },
    { id: 2, name: 'Book', category: 'education', price: 25, inStock: false },
    { id: 3, name: 'Headphones', category: 'electronics', price: 199, inStock: true },
    { id: 4, name: 'Notebook', category: 'education', price: 5, inStock: true }
  ]);
  
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  
  // Complex filtering and sorting
  const processedProducts = useMemo(() => {
    let filtered = products;
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }
    
    // Filter by stock status
    if (!showOutOfStock) {
      filtered = filtered.filter(product => product.inStock);
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [products, sortBy, filterCategory, showOutOfStock]);
  
  // Group products by category
  const groupedProducts = useMemo(() => {
    return processedProducts.reduce((groups, product) => {
      const category = product.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  }, [processedProducts]);
  
  const renderProductList = () => {
    if (processedProducts.length === 0) {
      return (
        <div className="empty-state">
          <p>No products found matching your criteria.</p>
        </div>
      );
    }
    
    return (
      <div className="product-list">
        {processedProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onToggleStock={() => toggleStock(product.id)}
          />
        ))}
      </div>
    );
  };
  
  const renderGroupedProducts = () => {
    return Object.entries(groupedProducts).map(([category, categoryProducts]) => (
      <div key={category} className="category-group">
        <h3 className="category-title">
          {category.charAt(0).toUpperCase() + category.slice(1)} 
          ({categoryProducts.length})
        </h3>
        <div className="category-products">
          {categoryProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              onToggleStock={() => toggleStock(product.id)}
            />
          ))}
        </div>
      </div>
    ));
  };
  
  const toggleStock = (productId) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, inStock: !product.inStock }
          : product
      )
    );
  };
  
  return (
    <div className="product-manager">
      {/* Controls */}
      <div className="controls">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="category">Sort by Category</option>
        </select>
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="education">Education</option>
        </select>
        
        <label>
          <input 
            type="checkbox"
            checked={showOutOfStock}
            onChange={(e) => setShowOutOfStock(e.target.checked)}
          />
          Show out of stock
        </label>
      </div>
      
      {/* View toggle */}
      <div className="view-toggle">
        <button onClick={() => setViewMode('list')}>List View</button>
        <button onClick={() => setViewMode('grouped')}>Grouped View</button>
      </div>
      
      {/* Render products */}
      {viewMode === 'grouped' ? renderGroupedProducts() : renderProductList()}
    </div>
  );
}

function ProductCard({ product, onToggleStock }) {
  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
      <h4>{product.name}</h4>
      <p className="category">{product.category}</p>
      <p className="price">${product.price}</p>
      <p className="stock">
        {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
      </p>
      <button onClick={onToggleStock}>
        {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
      </button>
    </div>
  );
}
```

## 🔑 Keys: The Heart of React's Reconciliation

### Understanding Keys and Reconciliation

```jsx
// React's reconciliation process:
// 1. Compare new virtual DOM with previous virtual DOM
// 2. Identify what changed
// 3. Update only the changed parts in real DOM
// 4. Keys help React identify which items changed, moved, or were added/removed

function KeysExplanation() {
  const [items, setItems] = useState([
    { id: 1, name: 'Apple', color: 'red' },
    { id: 2, name: 'Banana', color: 'yellow' },
    { id: 3, name: 'Orange', color: 'orange' }
  ]);
  
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: 'New Fruit',
      color: 'green'
    };
    setItems(prevItems => [newItem, ...prevItems]); // Add to beginning
  };
  
  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const shuffleItems = () => {
    setItems(prevItems => [...prevItems].sort(() => Math.random() - 0.5));
  };
  
  return (
    <div>
      <div className="controls">
        <button onClick={addItem}>Add Item to Beginning</button>
        <button onClick={shuffleItems}>Shuffle Items</button>
      </div>
      
      {/* ❌ BAD: Using index as key */}
      <div className="bad-example">
        <h3>❌ Bad: Index as Key</h3>
        {items.map((item, index) => (
          <ItemComponent 
            key={index} // DON'T DO THIS!
            item={item}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>
      
      {/* ✅ GOOD: Using stable unique ID as key */}
      <div className="good-example">
        <h3>✅ Good: Stable ID as Key</h3>
        {items.map(item => (
          <ItemComponent 
            key={item.id} // DO THIS!
            item={item}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Component with internal state to demonstrate key importance
function ItemComponent({ item, onRemove }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // This component maintains its own state
  // Wrong keys can cause state to "stick" to wrong items
  
  return (
    <div className="item-component">
      <div className="item-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span style={{ color: item.color }}>🍎</span>
        <span>{item.name}</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }}>Remove</button>
      </div>
      
      {isExpanded && (
        <div className="item-details">
          <p>Color: {item.color}</p>
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
          />
          <p>You typed: {inputValue}</p>
        </div>
      )}
    </div>
  );
}
```

### Key Selection Strategies

```jsx
function KeyStrategies() {
  // Different scenarios for choosing keys
  
  // 1. ✅ BEST: Stable unique IDs from data
  const usersWithIds = [
    { id: 'user_123', name: 'John', email: 'john@example.com' },
    { id: 'user_456', name: 'Jane', email: 'jane@example.com' }
  ];
  
  // 2. ✅ GOOD: Composite keys when no single unique field
  const userPosts = [
    { userId: 1, postId: 101, title: 'First Post' },
    { userId: 1, postId: 102, title: 'Second Post' },
    { userId: 2, postId: 103, title: 'Another Post' }
  ];
  
  // 3. ⚠️ ACCEPTABLE: Index when list is static and never reordered
  const staticMenuItems = ['Home', 'About', 'Contact']; // Never changes
  
  // 4. ✅ GOOD: Generated stable IDs
  const [dynamicItems, setDynamicItems] = useState([
    { tempId: generateId(), text: 'Item 1' },
    { tempId: generateId(), text: 'Item 2' }
  ]);
  
  return (
    <div>
      {/* ✅ Using stable IDs */}
      <section>
        <h3>Users (Stable IDs)</h3>
        {usersWithIds.map(user => (
          <div key={user.id}>
            {user.name} - {user.email}
          </div>
        ))}
      </section>
      
      {/* ✅ Using composite keys */}
      <section>
        <h3>User Posts (Composite Keys)</h3>
        {userPosts.map(post => (
          <div key={`${post.userId}-${post.postId}`}>
            User {post.userId}: {post.title}
          </div>
        ))}
      </section>
      
      {/* ⚠️ Index acceptable for static lists */}
      <section>
        <h3>Static Menu (Index OK)</h3>
        {staticMenuItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </section>
      
      {/* ✅ Generated stable IDs */}
      <section>
        <h3>Dynamic Items (Generated IDs)</h3>
        {dynamicItems.map(item => (
          <div key={item.tempId}>
            {item.text}
            <button onClick={() => removeItem(item.tempId)}>Remove</button>
          </div>
        ))}
      </section>
    </div>
  );
}

// Helper function to generate stable IDs
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Key Anti-Patterns and Solutions

```jsx
function KeyAntiPatterns() {
  const [todos, setTodos] = useState([
    { text: 'Learn React', completed: false },
    { text: 'Build a project', completed: false },
    { text: 'Get a job', completed: false }
  ]);
  
  // ❌ WRONG: Random keys (breaks reconciliation)
  const renderWithRandomKeys = () => {
    return todos.map(todo => (
      <div key={Math.random()}> {/* DON'T DO THIS! */}
        <TodoItem todo={todo} />
      </div>
    ));
  };
  
  // ❌ WRONG: Using array index when list can be reordered
  const renderWithIndexKeys = () => {
    return todos.map((todo, index) => (
      <div key={index}> {/* PROBLEMATIC for dynamic lists */}
        <TodoItem todo={todo} />
      </div>
    ));
  };
  
  // ❌ WRONG: Non-unique keys
  const renderWithNonUniqueKeys = () => {
    return todos.map(todo => (
      <div key={todo.completed}> {/* NOT UNIQUE! */}
        <TodoItem todo={todo} />
      </div>
    ));
  };
  
  // ✅ CORRECT: Add stable IDs to data
  const [todosWithIds, setTodosWithIds] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a project', completed: false },
    { id: 3, text: 'Get a job', completed: false }
  ]);
  
  const renderCorrectly = () => {
    return todosWithIds.map(todo => (
      <div key={todo.id}> {/* CORRECT! */}
        <TodoItem todo={todo} />
      </div>
    ));
  };
  
  // ✅ ALTERNATIVE: Use content-based keys when appropriate
  const renderWithContentKeys = () => {
    // Only if todo text is guaranteed to be unique and stable
    return todos.map(todo => (
      <div key={todo.text}> {/* OK if text is unique */}
        <TodoItem todo={todo} />
      </div>
    ));
  };
  
  return (
    <div>
      <h3>Todo List</h3>
      {renderCorrectly()}
    </div>
  );
}

function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  
  return (
    <div className="todo-item">
      {isEditing ? (
        <input 
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)}>{todo.text}</span>
      )}
      
      <input 
        type="checkbox"
        checked={todo.completed}
        onChange={() => {/* toggle todo */}}
      />
    </div>
  );
}
```

## 🧩 React.Fragment and Multiple Elements

### Using React.Fragment

```jsx
import React, { Fragment } from 'react';

function FragmentExamples() {
  const items = ['apple', 'banana', 'orange'];
  
  return (
    <div>
      {/* ❌ PROBLEM: Extra wrapper div */}
      <div className="wrapper">
        <h3>Fruits</h3>
        <p>Here are some fruits:</p>
      </div>
      
      {/* ✅ SOLUTION 1: React.Fragment */}
      <React.Fragment>
        <h3>Fruits</h3>
        <p>Here are some fruits:</p>
      </React.Fragment>
      
      {/* ✅ SOLUTION 2: Fragment shorthand */}
      <>
        <h3>Fruits</h3>
        <p>Here are some fruits:</p>
      </>
      
      {/* ✅ SOLUTION 3: Fragment with key (when needed in lists) */}
      {items.map(item => (
        <Fragment key={item}>
          <h4>{item}</h4>
          <p>Description of {item}</p>
        </Fragment>
      ))}
      
      {/* ✅ SOLUTION 4: Array of elements (less common) */}
      {[
        <h3 key="title">Fruits</h3>,
        <p key="description">Here are some fruits:</p>
      ]}
    </div>
  );
}

// Real-world Fragment usage
function TableRowFragment({ user }) {
  // Fragment allows returning multiple <td> elements
  // without wrapping them in a <div> (which would break table structure)
  return (
    <>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <button>Edit</button>
        <button>Delete</button>
      </td>
    </>
  );
}

function UserTable({ users }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <TableRowFragment user={user} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## ⚡ Performance Considerations

### Optimizing List Rendering

```jsx
import { memo, useMemo, useCallback } from 'react';

// ✅ Memoized list item to prevent unnecessary re-renders
const ListItem = memo(function ListItem({ item, onUpdate, onDelete }) {
  console.log(`Rendering item: ${item.name}`);
  
  return (
    <div className="list-item">
      <span>{item.name}</span>
      <span>${item.price}</span>
      <button onClick={() => onUpdate(item.id)}>Update</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </div>
  );
});

function OptimizedList() {
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Mouse', price: 25 },
    { id: 3, name: 'Keyboard', price: 75 }
  ]);
  const [filter, setFilter] = useState('');
  
  // ✅ Memoize filtered items to avoid recalculation
  const filteredItems = useMemo(() => {
    console.log('Filtering items...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  // ✅ Memoize callbacks to prevent child re-renders
  const handleUpdate = useCallback((id) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, price: item.price * 1.1 }
          : item
      )
    );
  }, []);
  
  const handleDelete = useCallback((id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);
  
  return (
    <div>
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      
      <div className="item-list">
        {filteredItems.map(item => (
          <ListItem 
            key={item.id}
            item={item}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      <p>Showing {filteredItems.length} of {items.length} items</p>
    </div>
  );
}
```

### Virtual Scrolling for Large Lists

```jsx
// For very large lists (1000+ items), consider virtual scrolling
function VirtualScrollExample() {
  const [items] = useState(() => 
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      value: Math.random() * 100
    }))
  );
  
  // This is a simplified example - use libraries like react-window or react-virtualized
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const itemHeight = 50;
  const containerHeight = 400;
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);
  
  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 5, items.length);
    
    setVisibleRange({ start, end });
  };
  
  return (
    <div 
      className="virtual-scroll-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div 
            key={item.id}
            style={{
              position: 'absolute',
              top: (visibleRange.start + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {item.name} - {item.value.toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Index as Key in Dynamic Lists

```jsx
// ❌ WRONG: Index as key with dynamic operations
function BrokenTodoList() {
  const [todos, setTodos] = useState([
    'Learn React',
    'Build a project',
    'Get a job'
  ]);
  
  const addTodo = () => {
    setTodos(['New todo', ...todos]); // Adding to beginning
  };
  
  return (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      {todos.map((todo, index) => (
        <TodoInput key={index} initialValue={todo} /> // BROKEN!
      ))}
    </div>
  );
}

function TodoInput({ initialValue }) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <input 
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// ✅ CORRECT: Stable keys
function FixedTodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React' },
    { id: 2, text: 'Build a project' },
    { id: 3, text: 'Get a job' }
  ]);
  
  const addTodo = () => {
    const newTodo = { id: Date.now(), text: 'New todo' };
    setTodos([newTodo, ...todos]);
  };
  
  return (
    <div>
      <button onClick={addTodo}>Add Todo</button>
      {todos.map(todo => (
        <TodoInput key={todo.id} initialValue={todo.text} /> // FIXED!
      ))}
    </div>
  );
}
```

### 2. Conditional Rendering Gotchas

```jsx
// ❌ WRONG: Falsy values rendering unexpectedly
function ConditionalGotchas({ items, count }) {
  return (
    <div>
      {/* ❌ Renders "0" when count is 0 */}
      {count && <div>Count: {count}</div>}
      
      {/* ❌ Renders "0" when items array is empty */}
      {items.length && <div>Items: {items.length}</div>}
      
      {/* ❌ Can render "NaN" or unexpected values */}
      {items.length && items.length > 0 && (
        <div>Average: {items.reduce((a, b) => a + b, 0) / items.length}</div>
      )}
    </div>
  );
}

// ✅ CORRECT: Explicit boolean conversion
function ConditionalFixed({ items, count }) {
  return (
    <div>
      {/* ✅ Explicit boolean conversion */}
      {count > 0 && <div>Count: {count}</div>}
      
      {/* ✅ Explicit length check */}
      {items.length > 0 && <div>Items: {items.length}</div>}
      
      {/* ✅ Safe calculation with proper checks */}
      {items.length > 0 && (
        <div>Average: {(items.reduce((a, b) => a + b, 0) / items.length).toFixed(2)}</div>
      )}
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Dynamic Table with Sorting

Build a sortable table component with:
- Click column headers to sort
- Visual indicators for sort direction
- Multiple data types (string, number, date)

```jsx
// Your solution:
function SortableTable({ data, columns }) {
  // Implement sorting logic
}

// Test data:
const userData = [
  { id: 1, name: 'John', age: 30, email: 'john@example.com', joinDate: '2023-01-15' },
  { id: 2, name: 'Jane', age: 25, email: 'jane@example.com', joinDate: '2023-03-20' },
  { id: 3, name: 'Bob', age: 35, email: 'bob@example.com', joinDate: '2023-02-10' }
];

const columns = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'joinDate', label: 'Join Date', type: 'date' }
];
```

<details>
<summary>💡 Solution</summary>

```jsx
function SortableTable({ data, columns }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Find column type
      const column = columns.find(col => col.key === sortConfig.key);
      const type = column?.type || 'string';
      
      let comparison = 0;
      
      switch (type) {
        case 'number':
          comparison = aValue - bValue;
          break;
        case 'date':
          comparison = new Date(aValue) - new Date(bValue);
          break;
        case 'string':
        default:
          comparison = aValue.localeCompare(bValue);
          break;
      }
      
      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sortConfig, columns]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  return (
    <table className="sortable-table">
      <thead>
        <tr>
          {columns.map(column => (
            <th 
              key={column.key}
              onClick={() => handleSort(column.key)}
              className="sortable-header"
            >
              {column.label} {getSortIcon(column.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map(row => (
          <tr key={row.id}>
            {columns.map(column => (
              <td key={column.key}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

</details>

### Challenge 2: Nested Comment System

Create a nested comment component with:
- Recursive rendering of replies
- Expand/collapse functionality
- Add reply functionality

<details>
<summary>💡 Solution</summary>

```jsx
function CommentSystem({ comments }) {
  return (
    <div className="comment-system">
      {comments.map(comment => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

function Comment({ comment, depth = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);
  
  const addReply = (replyText) => {
    const newReply = {
      id: Date.now(),
      author: 'Current User',
      text: replyText,
      timestamp: new Date().toISOString(),
      replies: []
    };
    
    setReplies(prevReplies => [...prevReplies, newReply]);
    setShowReplyForm(false);
  };
  
  return (
    <div 
      className="comment" 
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="comment-header">
        <strong>{comment.author}</strong>
        <span className="timestamp">{comment.timestamp}</span>
        {replies.length > 0 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-replies"
          >
            {isExpanded ? '▼' : '▶'} {replies.length} replies
          </button>
        )}
      </div>
      
      <div className="comment-text">{comment.text}</div>
      
      <div className="comment-actions">
        <button onClick={() => setShowReplyForm(!showReplyForm)}>
          Reply
        </button>
      </div>
      
      {showReplyForm && (
        <ReplyForm 
          onSubmit={addReply}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
      
      {isExpanded && replies.length > 0 && (
        <div className="replies">
          {replies.map(reply => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyForm({ onSubmit, onCancel }) {
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="reply-form">
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        rows={3}
      />
      <div className="form-actions">
        <button type="submit" disabled={!text.trim()}>
          Post Reply
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
```

</details>

## 🎤 Interview Insights

### What Interviewers Look For

1. **Key Understanding**: "Why are keys important in React?"
   - **Good Answer**: Keys help React identify which items have changed, been added, or removed. They're crucial for efficient reconciliation and maintaining component state correctly.

2. **Conditional Rendering**: "What's wrong with `{count && <div>{count}</div>}`?"
   - **Good Answer**: If count is 0, it will render "0" instead of nothing. Should use `{count > 0 && <div>{count}</div>}`

3. **Performance**: "How would you optimize a large list?"
   - **Good Answer**: Use React.memo for list items, useMemo for filtering/sorting, useCallback for event handlers, consider virtual scrolling for very large lists.

### Common Interview Questions

```jsx
// Q: What will this render when items is an empty array?
function Question1({ items }) {
  return (
    <div>
      {items.length && <div>Items: {items.length}</div>}
    </div>
  );
}
// Answer: It will render "0" because items.length is 0 (falsy)

// Q: What's the problem with this key usage?
function Question2({ todos }) {
  return (
    <div>
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />
      ))}
    </div>
  );
}
// Answer: Index as key can cause issues when list is reordered or items are added/removed

// Q: How would you render this list efficiently?
function Question3({ largeList }) {
  return (
    <div>
      {largeList.map(item => (
        <ExpensiveComponent key={item.id} item={item} />
      ))}
    </div>
  );
}
// Answer: Memoize ExpensiveComponent with React.memo, use virtual scrolling for very large lists
```

### Pro Interview Tips

1. **Always mention keys** when discussing list rendering
2. **Explain reconciliation** - show you understand how React works under the hood
3. **Discuss performance** implications of different patterns
4. **Show awareness of edge cases** (falsy values, empty arrays, etc.)
5. **Demonstrate optimization knowledge** (memo, useMemo, virtual scrolling)

## 🚀 Next Steps

Now that you've mastered rendering patterns, you're ready for:
- **Handling DOM Events** - User interactions and event handling
- **Controlled vs Uncontrolled Inputs** - Form handling patterns
- **useEffect** - Side effects and lifecycle management

---

> **Key Takeaway**: Master conditional rendering, list rendering with proper keys, and React's reconciliation process. Keys are crucial for performance and correctness - always use stable, unique identifiers when possible!