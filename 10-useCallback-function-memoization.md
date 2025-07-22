# useCallback: Function Memoization

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What useCallback is and when to use it
- How function references affect React re-renders
- The relationship between useCallback and React.memo
- Performance implications and trade-offs
- Common patterns and anti-patterns
- Real-world optimization scenarios

---

## 🧠 What is useCallback?

`useCallback` is a React Hook that **memoizes a function** and returns the same function reference between renders unless its dependencies change.

### The Problem: Function Recreation

```jsx
// ❌ Problem: New function on every render
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 🚨 This creates a NEW function on every render
  const handleClick = () => {
    console.log('Button clicked!');
  };
  
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <ExpensiveChild onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

// This component re-renders even when only 'name' changes!
const ExpensiveChild = React.memo(({ onClick }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click me</button>;
});
```

### The Solution: useCallback

```jsx
// ✅ Solution: Stable function reference
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  // 🎯 Same function reference unless dependencies change
  const handleClick = useCallback(() => {
    console.log('Button clicked!');
  }, []); // Empty dependencies = never changes
  
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <ExpensiveChild onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}

// Now this only re-renders when onClick actually changes!
const ExpensiveChild = React.memo(({ onClick }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click me</button>;
});
```

## 🔍 Deep Dive: How useCallback Works

### Basic Syntax

```jsx
const memoizedCallback = useCallback(
  () => {
    // Function body
    doSomething(a, b);
  },
  [a, b] // Dependencies
);
```

### Dependency Array Behavior

```jsx
function CallbackDemo() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [name, setName] = useState('');
  
  // 🎯 No dependencies - function never changes
  const handleReset = useCallback(() => {
    setCount(0);
    setMultiplier(1);
  }, []);
  
  // 🎯 Depends on count - changes when count changes
  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // ✅ No dependencies needed (using functional update)
  
  // 🎯 Depends on count and multiplier
  const handleCalculate = useCallback(() => {
    return count * multiplier;
  }, [count, multiplier]);
  
  // 🎯 Depends on external value
  const handleLog = useCallback(() => {
    console.log(`Current name: ${name}`);
  }, [name]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Multiplier: {multiplier}</p>
      <p>Name: {name}</p>
      
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleLog}>Log Name</button>
      
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name"
      />
      
      <input 
        type="number" 
        value={multiplier} 
        onChange={(e) => setMultiplier(Number(e.target.value))} 
      />
    </div>
  );
}
```

## 🎯 useCallback vs useMemo: Key Differences

```jsx
function ComparisonDemo() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  // 🎯 useMemo: Memoizes the RESULT of a calculation
  const expensiveValue = useMemo(() => {
    console.log('Calculating expensive value');
    return items.reduce((sum, item) => sum + item * item, 0);
  }, [items]);
  
  // 🎯 useCallback: Memoizes the FUNCTION itself
  const expensiveFunction = useCallback(() => {
    console.log('Creating expensive function');
    return items.reduce((sum, item) => sum + item * item, 0);
  }, [items]);
  
  // 🎯 Alternative: useMemo to create a function
  const expensiveFunctionAlt = useMemo(() => {
    console.log('Creating function with useMemo');
    return () => items.reduce((sum, item) => sum + item * item, 0);
  }, [items]);
  
  return (
    <div>
      <p>Expensive Value: {expensiveValue}</p>
      <button onClick={() => console.log(expensiveFunction())}>Call Function</button>
      <button onClick={() => console.log(expensiveFunctionAlt())}>Call Alt Function</button>
    </div>
  );
}
```

### Mental Model

```jsx
// 🧠 Think of it this way:

// useMemo: "Remember this VALUE"
const value = useMemo(() => expensiveCalculation(), [deps]);

// useCallback: "Remember this FUNCTION"
const func = useCallback(() => doSomething(), [deps]);

// They're equivalent:
useCallback(fn, deps) === useMemo(() => fn, deps)
```

## 🚀 Real-World Patterns

### Pattern 1: Event Handlers with Parameters

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build an app', completed: false },
    { id: 3, text: 'Deploy to production', completed: true }
  ]);
  
  // ❌ Bad: Creates new function for each todo
  const badRender = () => {
    return todos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        onToggle={() => toggleTodo(todo.id)} // New function every render!
        onDelete={() => deleteTodo(todo.id)} // New function every render!
      />
    ));
  };
  
  // ✅ Good: Stable function references
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  const handleAdd = useCallback((text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    setTodos(prev => [...prev, newTodo]);
  }, []);
  
  return (
    <div className="todo-list">
      <AddTodoForm onAdd={handleAdd} />
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// Optimized child component
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  console.log(`Rendering todo: ${todo.id}`);
  
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span>{todo.text}</span>
      <button onClick={() => onToggle(todo.id)}>Toggle</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
});

const AddTodoForm = React.memo(({ onAdd }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  }, [text, onAdd]);
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add new todo"
      />
      <button type="submit">Add</button>
    </form>
  );
});
```

### Pattern 2: API Calls and Async Operations

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 🎯 Stable API call function
  const fetchUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - function is stable
  
  // 🎯 Refresh function
  const refreshUser = useCallback(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);
  
  // 🎯 Update user function
  const updateUser = useCallback(async (updates) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Fetch user on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId, fetchUser]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      
      <UserActions 
        user={user}
        onRefresh={refreshUser}
        onUpdate={updateUser}
      />
    </div>
  );
}

const UserActions = React.memo(({ user, onRefresh, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  
  const handleSave = useCallback(() => {
    onUpdate(formData);
    setIsEditing(false);
  }, [formData, onUpdate]);
  
  const handleCancel = useCallback(() => {
    setFormData({ name: user.name, email: user.email });
    setIsEditing(false);
  }, [user.name, user.email]);
  
  if (isEditing) {
    return (
      <div className="edit-form">
        <input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Name"
        />
        <input
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }
  
  return (
    <div className="user-actions">
      <button onClick={() => setIsEditing(true)}>Edit</button>
      <button onClick={onRefresh}>Refresh</button>
    </div>
  );
});
```

### Pattern 3: Custom Hooks with Callbacks

```jsx
// 🎯 Custom hook for debounced callbacks
function useDebounceCallback(callback, delay) {
  const timeoutRef = useRef(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

// 🎯 Custom hook for throttled callbacks
function useThrottleCallback(callback, delay) {
  const lastRun = useRef(Date.now());
  
  const throttledCallback = useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
  
  return throttledCallback;
}

// 🎯 Usage example
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 🎯 Actual search function
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 🎯 Debounced search (waits 300ms after user stops typing)
  const debouncedSearch = useDebounceCallback(performSearch, 300);
  
  // 🎯 Throttled search (max once per 1000ms)
  const throttledSearch = useThrottleCallback(performSearch, 1000);
  
  // 🎯 Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);
  
  // 🎯 Handle manual search
  const handleManualSearch = useCallback(() => {
    throttledSearch(query);
  }, [query, throttledSearch]);
  
  return (
    <div className="search-component">
      <div className="search-input">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
        />
        <button onClick={handleManualSearch}>Search</button>
      </div>
      
      {loading && <div className="loading">Searching...</div>}
      
      <div className="search-results">
        {results.map((result, index) => (
          <div key={result.id || index} className="search-result">
            <h3>{result.title}</h3>
            <p>{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes and Anti-Patterns

### Mistake 1: Unnecessary useCallback

```jsx
// ❌ Bad: useCallback for simple functions that don't need optimization
function SimpleComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ Unnecessary - this function is simple and not passed to children
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  // ✅ Better - just use a regular function
  const handleClickBetter = () => {
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### Mistake 2: Missing Dependencies

```jsx
// ❌ Bad: Missing dependencies
function BuggyComponent() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  // ❌ Missing 'multiplier' in dependencies
  const handleCalculate = useCallback(() => {
    console.log(count * multiplier); // This will use stale 'multiplier'
  }, [count]); // Missing multiplier!
  
  // ✅ Correct dependencies
  const handleCalculateFixed = useCallback(() => {
    console.log(count * multiplier);
  }, [count, multiplier]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Multiplier: {multiplier}</p>
      <button onClick={handleCalculate}>Calculate (Buggy)</button>
      <button onClick={handleCalculateFixed}>Calculate (Fixed)</button>
    </div>
  );
}
```

### Mistake 3: Object/Array Dependencies

```jsx
// ❌ Bad: Object as dependency
function ProblematicComponent({ config }) {
  // ❌ 'config' object changes on every render
  const handleProcess = useCallback(() => {
    processData(config);
  }, [config]); // This will recreate the function every time!
  
  // ✅ Better: Extract specific properties
  const handleProcessFixed = useCallback(() => {
    processData(config);
  }, [config.apiUrl, config.timeout]); // Use specific properties
  
  // ✅ Even better: Memoize the config object in parent
  // const config = useMemo(() => ({ apiUrl, timeout }), [apiUrl, timeout]);
  
  return <ProcessButton onClick={handleProcess} />;
}
```

### Mistake 4: Inline Object Creation

```jsx
// ❌ Bad: Creating objects inline
function BadParent() {
  const [data, setData] = useState([]);
  
  const handleUpdate = useCallback((item) => {
    setData(prev => prev.map(d => d.id === item.id ? item : d));
  }, []);
  
  return (
    <div>
      {data.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
          // ❌ This creates a new object every render!
          config={{ theme: 'dark', size: 'large' }}
        />
      ))}
    </div>
  );
}

// ✅ Good: Memoize objects
function GoodParent() {
  const [data, setData] = useState([]);
  
  const handleUpdate = useCallback((item) => {
    setData(prev => prev.map(d => d.id === item.id ? item : d));
  }, []);
  
  // ✅ Stable object reference
  const config = useMemo(() => ({ theme: 'dark', size: 'large' }), []);
  
  return (
    <div>
      {data.map(item => (
        <ChildComponent
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
          config={config}
        />
      ))}
    </div>
  );
}
```

## 🏋️‍♂️ Mini-Challenges

### Challenge 1: Optimized Data Table

Create a data table with sorting, filtering, and pagination that doesn't re-render unnecessarily.

<details>
<summary>💡 Solution</summary>

```jsx
function OptimizedDataTable() {
  const [data, setData] = useState([
    { id: 1, name: 'Alice', age: 30, department: 'Engineering', salary: 75000 },
    { id: 2, name: 'Bob', age: 25, department: 'Design', salary: 65000 },
    { id: 3, name: 'Charlie', age: 35, department: 'Engineering', salary: 85000 },
    { id: 4, name: 'Diana', age: 28, department: 'Marketing', salary: 60000 },
    { id: 5, name: 'Eve', age: 32, department: 'Engineering', salary: 80000 },
    { id: 6, name: 'Frank', age: 29, department: 'Design', salary: 70000 },
    { id: 7, name: 'Grace', age: 31, department: 'Marketing', salary: 62000 },
    { id: 8, name: 'Henry', age: 27, department: 'Engineering', salary: 78000 }
  ]);
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // 🎯 Memoized filtered data
  const filteredData = useMemo(() => {
    if (!filterText) return data;
    
    return data.filter(item => 
      Object.values(item).some(value => 
        value.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [data, filterText]);
  
  // 🎯 Memoized sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);
  
  // 🎯 Memoized paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);
  
  // 🎯 Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    
    return { totalItems, totalPages, startItem, endItem };
  }, [sortedData.length, currentPage, pageSize]);
  
  // 🎯 Stable callback functions
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  const handleFilter = useCallback((text) => {
    setFilterText(text);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);
  
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);
  
  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);
  
  const handleEdit = useCallback((id, field, value) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);
  
  const handleDelete = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return (
    <div className="optimized-data-table">
      <h3>Optimized Data Table</h3>
      
      {/* Controls */}
      <TableControls
        filterText={filterText}
        onFilter={handleFilter}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        paginationInfo={paginationInfo}
      />
      
      {/* Table */}
      <DataTable
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// Memoized table controls
const TableControls = React.memo(({ filterText, onFilter, pageSize, onPageSizeChange, paginationInfo }) => {
  console.log('TableControls rendered');
  
  return (
    <div className="table-controls">
      <div className="filter-section">
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilter(e.target.value)}
          placeholder="Filter data..."
        />
      </div>
      
      <div className="page-size-section">
        <label>Items per page:</label>
        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      
      <div className="info-section">
        Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.totalItems} items
      </div>
    </div>
  );
});

// Memoized data table
const DataTable = React.memo(({ data, sortConfig, onSort, onEdit, onDelete }) => {
  console.log('DataTable rendered');
  
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'salary', label: 'Salary', sortable: true }
  ];
  
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(column => (
            <TableHeader
              key={column.key}
              column={column}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <TableRow
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
});

// Memoized table header
const TableHeader = React.memo(({ column, sortConfig, onSort }) => {
  const handleClick = useCallback(() => {
    if (column.sortable) {
      onSort(column.key);
    }
  }, [column.key, column.sortable, onSort]);
  
  const getSortIcon = () => {
    if (sortConfig.key !== column.key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  return (
    <th 
      className={column.sortable ? 'sortable' : ''}
      onClick={handleClick}
    >
      {column.label}
      {column.sortable && <span className="sort-icon">{getSortIcon()}</span>}
    </th>
  );
});

// Memoized table row
const TableRow = React.memo(({ item, onEdit, onDelete }) => {
  console.log(`Rendering row for ${item.name}`);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);
  
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditData(item);
  }, [item]);
  
  const handleSave = useCallback(() => {
    Object.keys(editData).forEach(key => {
      if (editData[key] !== item[key]) {
        onEdit(item.id, key, editData[key]);
      }
    });
    setIsEditing(false);
  }, [editData, item, onEdit]);
  
  const handleCancel = useCallback(() => {
    setEditData(item);
    setIsEditing(false);
  }, [item]);
  
  const handleDelete = useCallback(() => {
    if (window.confirm(`Delete ${item.name}?`)) {
      onDelete(item.id);
    }
  }, [item.id, item.name, onDelete]);
  
  if (isEditing) {
    return (
      <tr className="editing">
        <td>
          <input
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
          />
        </td>
        <td>
          <input
            type="number"
            value={editData.age}
            onChange={(e) => setEditData(prev => ({ ...prev, age: Number(e.target.value) }))}
          />
        </td>
        <td>
          <select
            value={editData.department}
            onChange={(e) => setEditData(prev => ({ ...prev, department: e.target.value }))}
          >
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </td>
        <td>
          <input
            type="number"
            value={editData.salary}
            onChange={(e) => setEditData(prev => ({ ...prev, salary: Number(e.target.value) }))}
          />
        </td>
        <td>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </td>
      </tr>
    );
  }
  
  return (
    <tr>
      <td>{item.name}</td>
      <td>{item.age}</td>
      <td>{item.department}</td>
      <td>${item.salary.toLocaleString()}</td>
      <td>
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </td>
    </tr>
  );
});

// Memoized pagination
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  console.log('Pagination rendered');
  
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);
  
  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);
  
  const handlePageClick = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination">
      <button 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={page === currentPage ? 'active' : ''}
        >
          {page}
        </button>
      ))}
      
      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
});
```

</details>

### Challenge 2: Real-time Chat Interface

Build a chat interface with message sending, typing indicators, and user presence that optimizes re-renders.

<details>
<summary>💡 Solution</summary>

```jsx
function ChatInterface() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice', text: 'Hello everyone!', timestamp: Date.now() - 60000 },
    { id: 2, user: 'Bob', text: 'Hey Alice! How are you?', timestamp: Date.now() - 45000 },
    { id: 3, user: 'Alice', text: 'I\'m doing great, thanks!', timestamp: Date.now() - 30000 }
  ]);
  
  const [currentUser, setCurrentUser] = useState('Charlie');
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(['Alice', 'Bob', 'Charlie', 'Diana']);
  const [isConnected, setIsConnected] = useState(true);
  
  // 🎯 Stable message sending function
  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      user: currentUser,
      text: text.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Simulate removing typing indicator
    setTypingUsers(prev => prev.filter(user => user !== currentUser));
  }, [currentUser]);
  
  // 🎯 Stable typing handler
  const handleTyping = useCallback((user, isTyping) => {
    setTypingUsers(prev => {
      if (isTyping) {
        return prev.includes(user) ? prev : [...prev, user];
      } else {
        return prev.filter(u => u !== user);
      }
    });
  }, []);
  
  // 🎯 Stable user presence handler
  const handleUserPresence = useCallback((user, isOnline) => {
    setOnlineUsers(prev => {
      if (isOnline) {
        return prev.includes(user) ? prev : [...prev, user];
      } else {
        return prev.filter(u => u !== user);
      }
    });
  }, []);
  
  // 🎯 Stable message deletion
  const deleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);
  
  // 🎯 Stable message editing
  const editMessage = useCallback((messageId, newText) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, text: newText, edited: true } : msg
    ));
  }, []);
  
  // 🎯 Simulate typing detection
  const typingTimeoutRef = useRef(null);
  
  const handleInputChange = useCallback((value) => {
    setNewMessage(value);
    
    // Start typing indicator
    handleTyping(currentUser, true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(currentUser, false);
    }, 1000);
  }, [currentUser, handleTyping]);
  
  // 🎯 Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="chat-interface">
      <ChatHeader 
        isConnected={isConnected}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
      
      <MessageList 
        messages={messages}
        currentUser={currentUser}
        onDelete={deleteMessage}
        onEdit={editMessage}
      />
      
      <TypingIndicator 
        typingUsers={typingUsers.filter(user => user !== currentUser)}
      />
      
      <MessageInput 
        value={newMessage}
        onChange={handleInputChange}
        onSend={sendMessage}
        disabled={!isConnected}
      />
    </div>
  );
}

// Memoized chat header
const ChatHeader = React.memo(({ isConnected, onlineUsers, currentUser, onUserChange }) => {
  console.log('ChatHeader rendered');
  
  return (
    <div className="chat-header">
      <div className="connection-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </span>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      
      <div className="user-selector">
        <label>You are:</label>
        <select value={currentUser} onChange={(e) => onUserChange(e.target.value)}>
          {onlineUsers.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
      </div>
      
      <div className="online-users">
        <span>Online: {onlineUsers.length}</span>
        <div className="user-list">
          {onlineUsers.map(user => (
            <span key={user} className="online-user">
              🟢 {user}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

// Memoized message list
const MessageList = React.memo(({ messages, currentUser, onDelete, onEdit }) => {
  console.log('MessageList rendered');
  
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="message-list">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          isOwn={message.user === currentUser}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});

// Memoized individual message
const Message = React.memo(({ message, isOwn, onDelete, onEdit }) => {
  console.log(`Rendering message ${message.id}`);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(message.text);
  }, [message.text]);
  
  const handleSave = useCallback(() => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  }, [editText, message.id, message.text, onEdit]);
  
  const handleCancel = useCallback(() => {
    setEditText(message.text);
    setIsEditing(false);
  }, [message.text]);
  
  const handleDelete = useCallback(() => {
    if (window.confirm('Delete this message?')) {
      onDelete(message.id);
    }
  }, [message.id, onDelete]);
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-header">
        <span className="username">{message.user}</span>
        <span className="timestamp">{formatTime(message.timestamp)}</span>
        {message.edited && <span className="edited-indicator">(edited)</span>}
      </div>
      
      <div className="message-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
            <div className="edit-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="message-text">{message.text}</div>
        )}
      </div>
      
      {isOwn && !isEditing && (
        <div className="message-actions">
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
});

// Memoized typing indicator
const TypingIndicator = React.memo(({ typingUsers }) => {
  console.log('TypingIndicator rendered');
  
  if (typingUsers.length === 0) return null;
  
  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };
  
  return (
    <div className="typing-indicator">
      <span className="typing-text">{getTypingText()}</span>
      <span className="typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </span>
    </div>
  );
});

// Memoized message input
const MessageInput = React.memo(({ value, onChange, onSend, disabled }) => {
  console.log('MessageInput rendered');
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSend(value);
  }, [value, onSend]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  }, [value, onSend]);
  
  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Disconnected...' : 'Type a message...'}
        disabled={disabled}
        rows={3}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
});
```

</details>

## 🎯 When and Why: useCallback Decision Framework

### Quick Decision Tree

```
🤔 Should I use useCallback?

├── Is this function passed to a child component?
│   ├── Yes → Continue evaluation...
│   └── No → Probably don't need useCallback ❌
│
├── Is the child component wrapped in React.memo?
│   ├── Yes → Use useCallback ✅
│   └── No → Continue evaluation...
│
├── Is this function used in a dependency array?
│   ├── Yes → Use useCallback ✅
│   └── No → Continue evaluation...
│
├── Is this an expensive function to recreate?
│   ├── Yes → Use useCallback ✅
│   └── No → Continue evaluation...
│
└── Does the function have complex dependencies?
    ├── Yes → Consider useCallback ⚠️
    └── No → Probably don't need useCallback ❌
```

### Performance Guidelines

```jsx
// 🎯 When TO use useCallback:

// ✅ Passed to memoized children
const ExpensiveChild = React.memo(({ onClick }) => { /* ... */ });
const handleClick = useCallback(() => { /* ... */ }, []);
<ExpensiveChild onClick={handleClick} />

// ✅ Used in dependency arrays
const fetchData = useCallback(async () => { /* ... */ }, [userId]);
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ Event handlers with parameters
const handleItemClick = useCallback((id) => { /* ... */ }, []);

// ✅ Custom hook callbacks
const debouncedCallback = useDebounceCallback(callback, 300);

// 🎯 When NOT to use useCallback:

// ❌ Simple event handlers not passed to children
const handleClick = () => setCount(c => c + 1); // Don't memo

// ❌ Functions that change on every render anyway
const handleClick = useCallback(() => {
  console.log(Math.random()); // Dependencies change constantly
}, [Math.random()]);

// ❌ More overhead than benefit
const simple = useCallback(() => a + b, [a, b]); // Too simple
```

## 🎤 Interview Insights

### Common Interview Questions

1. **"What's the difference between useCallback and useMemo?"**
   - useCallback memoizes functions, useMemo memoizes values
   - useCallback(fn, deps) === useMemo(() => fn, deps)
   - Show practical examples of when to use each

2. **"When would you use useCallback?"**
   - Preventing unnecessary re-renders of memoized children
   - Stabilizing function references for dependency arrays
   - Optimizing expensive function creation
   - Custom hooks that return callbacks

3. **"How does useCallback help with React.memo?"**
   - React.memo does shallow comparison of props
   - Functions are recreated on every render (new reference)
   - useCallback provides stable function reference
   - Prevents unnecessary child re-renders

4. **"What are the trade-offs of useCallback?"**
   - Memory overhead (storing function reference)
   - Comparison overhead (checking dependencies)
   - Code complexity
   - Can prevent garbage collection if overused

### Code Review Red Flags

```jsx
// 🚨 Red Flags in Interviews:

// ❌ Using useCallback everywhere
const simple = useCallback(() => setCount(c => c + 1), []);

// ❌ Missing dependencies
const handler = useCallback(() => {
  console.log(name); // Uses 'name' but not in deps
}, []); // Missing 'name'

// ❌ Expensive dependencies
const handler = useCallback(() => {
  process(data);
}, [data.map(x => x.id)]); // Creates new array every time

// ❌ Not using with React.memo
const Child = ({ onClick }) => <button onClick={onClick}>Click</button>;
const handler = useCallback(() => {}, []); // Useless without memo

// ❌ Inline object creation
<Child 
  onClick={useCallback(() => {}, [])}
  config={{ theme: 'dark' }} // This breaks memoization anyway!
/>
```

## 🎯 Key Takeaways

### Mental Model

```jsx
// 🧠 Think of useCallback as:

// "Give me the same function reference unless dependencies change"

const stableFunction = useCallback(() => {
  // This function object stays the same
  // unless dependencies in the array change
}, [dependencies]);
```

### Best Practices Summary

1. **Use with React.memo** - Primary use case for optimization
2. **Stabilize dependencies** - For useEffect and other hooks
3. **Don't overuse** - Has overhead, use judiciously
4. **Include all dependencies** - Avoid stale closures
5. **Consider alternatives** - Sometimes restructuring is better
6. **Profile performance** - Measure actual impact
7. **Use ESLint rules** - Catch missing dependencies

### Production Tips

- **Start without useCallback** - Add only when needed
- **Use React DevTools Profiler** - Identify actual bottlenecks
- **Combine with useMemo** - For complete optimization
- **Watch for stale closures** - Common bug with missing deps
- **Document optimization intent** - Help future developers

---

**Next up**: [useContext: Global State Management](./11-useContext-global-state.md) - Master React's built-in state management solution.

**Previous**: [useMemo: What, When, Why](./09-useMemo-what-when-why.md)

---

*💡 Pro tip: In interviews, demonstrate that you understand useCallback is an optimization tool, not a requirement. Show that you can identify when it's beneficial vs. when it adds unnecessary complexity.*