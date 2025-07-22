# 14. React.memo & Optimization 🚀

> "Premature optimization is the root of all evil, but knowing when and how to optimize is the mark of a skilled developer." - Adapted from Donald Knuth

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What React.memo is and how it works
- When and why to use React.memo
- How to optimize component re-renders
- Performance measurement techniques
- Common optimization patterns and anti-patterns
- The relationship between memo, useMemo, and useCallback

## 🔍 What is React.memo?

React.memo is a higher-order component that memoizes the result of a component. It only re-renders when its props change, similar to `PureComponent` for class components.

### Basic Example

```jsx
// ✅ Basic React.memo usage
const ExpensiveComponent = React.memo(function ExpensiveComponent({ name, age }) {
  console.log('ExpensiveComponent rendered');
  
  // Simulate expensive calculation
  const expensiveValue = useMemo(() => {
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += i;
    }
    return result;
  }, []);
  
  return (
    <div>
      <h3>{name} (Age: {age})</h3>
      <p>Expensive calculation result: {expensiveValue}</p>
    </div>
  );
});

// Parent component
function App() {
  const [count, setCount] = useState(0);
  const [user] = useState({ name: 'John', age: 30 });
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      
      {/* This won't re-render when count changes */}
      <ExpensiveComponent name={user.name} age={user.age} />
    </div>
  );
}
```

## 🔧 How React.memo Works

### Shallow Comparison

React.memo performs a shallow comparison of props by default:

```jsx
// ✅ These will NOT trigger re-render (shallow equal)
const props1 = { name: 'John', age: 30 };
const props2 = { name: 'John', age: 30 };
// React.memo will prevent re-render

// ❌ These WILL trigger re-render (not shallow equal)
const props3 = { name: 'John', user: { id: 1 } };
const props4 = { name: 'John', user: { id: 1 } };
// Different object references, so re-render happens
```

### Custom Comparison Function

```jsx
// ✅ Custom comparison for complex props
const UserCard = React.memo(function UserCard({ user, settings }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>Theme: {settings.theme}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props are different (re-render)
  
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.name === nextProps.user.name &&
    prevProps.settings.theme === nextProps.settings.theme
  );
});

// Usage
function App() {
  const [count, setCount] = useState(0);
  const [user] = useState({ id: 1, name: 'John', email: 'john@example.com' });
  const [settings] = useState({ theme: 'dark', notifications: true });
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      
      {/* Won't re-render when count changes, even though user/settings are objects */}
      <UserCard user={user} settings={settings} />
    </div>
  );
}
```

## 🎯 When to Use React.memo

### ✅ Good Use Cases

1. **Expensive Rendering**: Components with heavy calculations or complex UI
2. **Stable Props**: Props that don't change often
3. **Large Lists**: List items that render frequently
4. **Pure Components**: Components that only depend on props
5. **Leaf Components**: Components at the end of the component tree

```jsx
// ✅ Good candidate for React.memo
const ProductCard = React.memo(function ProductCard({ product }) {
  // Expensive image processing
  const processedImage = useMemo(() => {
    return processImage(product.image);
  }, [product.image]);
  
  return (
    <div className="product-card">
      <img src={processedImage} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </div>
  );
});

// Usage in a list
function ProductList({ products, searchTerm }) {
  const [sortOrder, setSortOrder] = useState('name');
  
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a[sortOrder].localeCompare(b[sortOrder]));
  }, [products, searchTerm, sortOrder]);
  
  return (
    <div>
      <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="name">Name</option>
        <option value="price">Price</option>
      </select>
      
      {/* Each ProductCard will only re-render if its product prop changes */}
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### ❌ When NOT to Use React.memo

1. **Props Change Frequently**: If props change on every render
2. **Simple Components**: Very lightweight components
3. **Always Re-rendering Parent**: If parent always re-renders anyway
4. **Complex Comparison**: When custom comparison is more expensive than re-rendering

```jsx
// ❌ Bad candidate for React.memo
const SimpleButton = React.memo(function SimpleButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
});
// This is too simple to benefit from memoization

// ❌ Props change every render
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      {/* onClick is a new function every render, so memo won't help */}
      <SimpleButton onClick={() => setCount(count + 1)}>
        Count: {count}
      </SimpleButton>
    </div>
  );
}
```

## 🔄 React.memo + useCallback + useMemo

### The Holy Trinity of Optimization

```jsx
// ✅ Properly optimized component hierarchy
const TodoItem = React.memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log(`TodoItem ${todo.id} rendered`);
  
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
});

const TodoList = React.memo(function TodoList({ todos, onToggle, onDelete }) {
  console.log('TodoList rendered');
  
  return (
    <div className="todo-list">
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build an app', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  
  // ✅ Memoized callbacks prevent unnecessary re-renders
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  const handleAdd = useCallback(() => {
    if (newTodo.trim()) {
      setTodos(prev => [...prev, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  }, [newTodo]);
  
  // ✅ Memoized filtered todos
  const incompleteTodos = useMemo(() => {
    return todos.filter(todo => !todo.completed);
  }, [todos]);
  
  return (
    <div>
      <div>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo"
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      
      <h3>Incomplete Todos ({incompleteTodos.length})</h3>
      <TodoList
        todos={incompleteTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
      
      <h3>All Todos</h3>
      <TodoList
        todos={todos}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

## 📊 Performance Measurement

### Using React DevTools Profiler

```jsx
// ✅ Component with performance monitoring
const PerformanceDemo = React.memo(function PerformanceDemo({ data }) {
  const startTime = performance.now();
  
  // Expensive calculation
  const processedData = useMemo(() => {
    console.log('Processing data...');
    return data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }));
  }, [data]);
  
  useEffect(() => {
    const endTime = performance.now();
    console.log(`PerformanceDemo render took ${endTime - startTime} milliseconds`);
  });
  
  return (
    <div>
      <h3>Processed Data ({processedData.length} items)</h3>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});
```

### Custom Performance Hook

```jsx
// ✅ Hook to measure render performance
function useRenderTime(componentName) {
  const renderStartTime = useRef();
  
  // Mark start of render
  renderStartTime.current = performance.now();
  
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  });
}

// Usage
const MyComponent = React.memo(function MyComponent({ data }) {
  useRenderTime('MyComponent');
  
  return (
    <div>
      {/* Component content */}
    </div>
  );
});
```

## 🎯 Mini-Challenge: Optimize a Data Dashboard

### Challenge: Build an Optimized Dashboard

Create a dashboard that efficiently renders large amounts of data:

```jsx
// Your task: Optimize this dashboard for performance
function DataDashboard() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      const newData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 100,
        category: ['A', 'B', 'C'][i % 3],
        timestamp: new Date(Date.now() - Math.random() * 86400000)
      }));
      setData(newData);
    };
    
    fetchData();
  }, [refreshCount]);
  
  // Filter and sort data
  const processedData = data
    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'value') return b.value - a.value;
      return 0;
    });
  
  return (
    <div>
      <div className="controls">
        <input
          placeholder="Filter items..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="value">Sort by Value</option>
        </select>
        
        <button onClick={() => setRefreshCount(c => c + 1)}>
          Refresh Data
        </button>
      </div>
      
      <div className="stats">
        <div>Total Items: {data.length}</div>
        <div>Filtered Items: {processedData.length}</div>
        <div>Average Value: {(processedData.reduce((sum, item) => sum + item.value, 0) / processedData.length).toFixed(2)}</div>
      </div>
      
      <div className="data-grid">
        {processedData.map(item => (
          <div key={item.id} className="data-item">
            <h4>{item.name}</h4>
            <p>Value: {item.value.toFixed(2)}</p>
            <p>Category: {item.category}</p>
            <small>{item.timestamp.toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Solution: Optimized Dashboard

```jsx
// ✅ Optimized data item component
const DataItem = React.memo(function DataItem({ item }) {
  return (
    <div className="data-item">
      <h4>{item.name}</h4>
      <p>Value: {item.value.toFixed(2)}</p>
      <p>Category: {item.category}</p>
      <small>{item.timestamp.toLocaleDateString()}</small>
    </div>
  );
});

// ✅ Optimized stats component
const DataStats = React.memo(function DataStats({ totalItems, filteredItems, averageValue }) {
  return (
    <div className="stats">
      <div>Total Items: {totalItems}</div>
      <div>Filtered Items: {filteredItems}</div>
      <div>Average Value: {averageValue}</div>
    </div>
  );
});

// ✅ Optimized controls component
const DataControls = React.memo(function DataControls({ 
  filter, 
  onFilterChange, 
  sortBy, 
  onSortChange, 
  onRefresh 
}) {
  return (
    <div className="controls">
      <input
        placeholder="Filter items..."
        value={filter}
        onChange={onFilterChange}
      />
      
      <select value={sortBy} onChange={onSortChange}>
        <option value="name">Sort by Name</option>
        <option value="value">Sort by Value</option>
      </select>
      
      <button onClick={onRefresh}>
        Refresh Data
      </button>
    </div>
  );
});

// ✅ Optimized main dashboard
function DataDashboard() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      const newData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 100,
        category: ['A', 'B', 'C'][i % 3],
        timestamp: new Date(Date.now() - Math.random() * 86400000)
      }));
      setData(newData);
    };
    
    fetchData();
  }, [refreshCount]);
  
  // ✅ Memoized data processing
  const processedData = useMemo(() => {
    return data
      .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'value') return b.value - a.value;
        return 0;
      });
  }, [data, filter, sortBy]);
  
  // ✅ Memoized statistics
  const stats = useMemo(() => {
    const averageValue = processedData.length > 0 
      ? (processedData.reduce((sum, item) => sum + item.value, 0) / processedData.length).toFixed(2)
      : '0.00';
    
    return {
      totalItems: data.length,
      filteredItems: processedData.length,
      averageValue
    };
  }, [data.length, processedData]);
  
  // ✅ Memoized event handlers
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, []);
  
  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);
  
  const handleRefresh = useCallback(() => {
    setRefreshCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <DataControls
        filter={filter}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
      />
      
      <DataStats
        totalItems={stats.totalItems}
        filteredItems={stats.filteredItems}
        averageValue={stats.averageValue}
      />
      
      <div className="data-grid">
        {processedData.map(item => (
          <DataItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

## ❌ Common Optimization Mistakes

### 1. Over-Memoization

```jsx
// ❌ Unnecessary memoization
const SimpleText = React.memo(function SimpleText({ text }) {
  return <span>{text}</span>; // Too simple to benefit from memo
});

// ❌ Memoizing everything
function App() {
  const [count, setCount] = useState(0);
  
  // These change every render anyway!
  const memoizedCount = useMemo(() => count, [count]);
  const memoizedIncrement = useCallback(() => setCount(count + 1), [count]);
  
  return (
    <div>
      <span>{memoizedCount}</span>
      <button onClick={memoizedIncrement}>+</button>
    </div>
  );
}
```

### 2. Incorrect Dependencies

```jsx
// ❌ Missing dependencies
const BadComponent = React.memo(function BadComponent({ items, multiplier }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value * multiplier, 0);
  }, [items]); // Missing 'multiplier' dependency!
  
  return <div>{expensiveValue}</div>;
});

// ✅ Correct dependencies
const GoodComponent = React.memo(function GoodComponent({ items, multiplier }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value * multiplier, 0);
  }, [items, multiplier]); // All dependencies included
  
  return <div>{expensiveValue}</div>;
});
```

### 3. Comparing Functions in memo

```jsx
// ❌ Functions will always be different
const BadComponent = React.memo(function BadComponent({ onClick }) {
  return <button onClick={onClick}>Click me</button>;
}, (prevProps, nextProps) => {
  // This will always return false because functions are recreated
  return prevProps.onClick === nextProps.onClick;
});

// ✅ Use useCallback in parent instead
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <BadComponent onClick={handleClick} />;
}
```

## 🎤 Interview Insights

### Common Questions

**Q: When should you use React.memo?**

A: Use React.memo when:
- Component renders frequently with the same props
- Component has expensive rendering logic
- Component is a leaf node in the component tree
- Props are stable and don't change often

**Q: What's the difference between React.memo, useMemo, and useCallback?**

A:
- **React.memo**: Memoizes entire component based on props
- **useMemo**: Memoizes computed values within a component
- **useCallback**: Memoizes function references

**Q: How do you measure if React.memo is helping performance?**

A: Use:
- React DevTools Profiler
- Console.log in components to track renders
- Performance.now() to measure render times
- React's built-in performance monitoring

**Q: Can React.memo cause memory leaks?**

A: React.memo itself doesn't cause memory leaks, but:
- Memoized components hold references to props
- Custom comparison functions might hold references
- Always clean up subscriptions and timers

### Code Review Red Flags

❌ **Memoizing every component without measurement**
❌ **Complex custom comparison functions**
❌ **Missing dependencies in useMemo/useCallback**
❌ **Memoizing props that change every render**
❌ **Not using React DevTools to verify optimizations**
❌ **Optimizing before identifying performance bottlenecks**

## 🎯 Key Takeaways

1. **Measure first, optimize second** - Use React DevTools Profiler
2. **React.memo prevents re-renders** - Only when props haven't changed
3. **Shallow comparison by default** - Deep objects need custom comparison
4. **Combine with useCallback/useMemo** - For stable prop references
5. **Don't over-optimize** - Simple components don't need memoization
6. **Profile your optimizations** - Verify they actually help
7. **Consider the whole tree** - Optimize parent components first

## 🏆 Best Practices

1. **Start with React DevTools** - Identify actual performance bottlenecks
2. **Optimize from top down** - Parent optimizations often help more
3. **Use memo for expensive components** - Complex calculations or large lists
4. **Memoize stable callbacks** - Use useCallback for event handlers
5. **Avoid premature optimization** - Don't memo everything by default
6. **Test your optimizations** - Measure before and after
7. **Consider code splitting** - Sometimes better than memoization

## 🔧 Production Tips

- **Use React.memo for list items** - Especially in large lists
- **Memoize context values** - Prevent unnecessary provider re-renders
- **Consider virtualization** - For very large lists (react-window)
- **Profile in production mode** - Development mode has extra overhead
- **Monitor bundle size** - Memoization adds code
- **Use React Concurrent features** - Suspense and transitions
- **Implement error boundaries** - Around memoized components

---

**Next up**: We'll explore advanced patterns like render props, compound components, and more! 🎨