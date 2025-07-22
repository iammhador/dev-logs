# ⚡ useEffect: Dependencies & Cleanup Mastery

> **Master React's most powerful hook: When effects run, how dependencies work, and why cleanup prevents memory leaks**

## 🎯 What You'll Learn

- How useEffect works under the hood
- The dependency array and its impact on performance
- Common dependency pitfalls and how to avoid them
- Cleanup functions and preventing memory leaks
- Advanced patterns: conditional effects, custom hooks
- Performance optimization strategies
- Real-world scenarios and best practices

## ⚡ Understanding useEffect Fundamentals

### The Effect Lifecycle

```jsx
function EffectLifecycleDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  console.log('🔄 Component render');
  
  // 🎯 Effect runs AFTER every render (no dependency array)
  useEffect(() => {
    console.log('🚀 Effect runs after render');
    document.title = `Count: ${count}`;
    
    // 🧹 Cleanup function (optional)
    return () => {
      console.log('🧹 Cleanup from previous effect');
    };
  });
  
  // 🎯 Effect runs only on mount (empty dependency array)
  useEffect(() => {
    console.log('🏁 Component mounted - runs once');
    
    return () => {
      console.log('💀 Component will unmount');
    };
  }, []); // ✅ Empty dependency array = run once
  
  // 🎯 Effect runs when count changes (specific dependency)
  useEffect(() => {
    console.log(`📊 Count changed to: ${count}`);
    
    if (count > 0) {
      const timer = setTimeout(() => {
        console.log(`⏰ Timer fired for count: ${count}`);
      }, 1000);
      
      // 🧹 Cleanup timer to prevent memory leaks
      return () => {
        console.log(`🧹 Cleaning up timer for count: ${count}`);
        clearTimeout(timer);
      };
    }
  }, [count]); // ✅ Only runs when count changes
  
  // 🎯 Effect with multiple dependencies
  useEffect(() => {
    console.log(`👤 User info: ${name}, Count: ${count}`);
    
    // Simulate API call
    if (name && count > 0) {
      console.log('📡 Making API call with user data');
    }
  }, [name, count]); // ✅ Runs when either name OR count changes
  
  return (
    <div className="effect-lifecycle-demo">
      <h3>useEffect Lifecycle Demo</h3>
      <p>Open console to see effect execution order</p>
      
      <div className="controls">
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      
      <div className="info">
        <p>Current count: {count}</p>
        <p>Current name: {name || 'No name'}</p>
        <p>Document title should show count</p>
      </div>
    </div>
  );
}
```

### Effect Execution Order

```jsx
function EffectExecutionOrder() {
  const [toggle, setToggle] = useState(false);
  
  console.log('1️⃣ Render phase');
  
  // Multiple effects to show execution order
  useEffect(() => {
    console.log('2️⃣ First effect (no deps)');
    return () => console.log('🧹 First effect cleanup');
  });
  
  useEffect(() => {
    console.log('3️⃣ Second effect (empty deps)');
    return () => console.log('🧹 Second effect cleanup');
  }, []);
  
  useEffect(() => {
    console.log('4️⃣ Third effect (toggle dep)');
    return () => console.log('🧹 Third effect cleanup');
  }, [toggle]);
  
  console.log('5️⃣ Render complete, effects will run next');
  
  return (
    <div>
      <h3>Effect Execution Order</h3>
      <p>Check console for execution sequence</p>
      <button onClick={() => setToggle(!toggle)}>
        Toggle: {toggle.toString()}
      </button>
      
      <div className="execution-info">
        <h4>Execution Order:</h4>
        <ol>
          <li>Component renders</li>
          <li>DOM is updated</li>
          <li>Cleanup functions run (for changed effects)</li>
          <li>New effects run (in order they're defined)</li>
        </ol>
      </div>
    </div>
  );
}
```

## 🎯 Dependency Array Deep Dive

### Understanding Dependencies

```jsx
function DependencyArrayExamples() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: 'John', age: 25 });
  const [items, setItems] = useState(['apple', 'banana']);
  
  // ❌ WRONG: Missing dependencies
  useEffect(() => {
    console.log(`Count is ${count}`); // Uses count but doesn't depend on it
    document.title = `User: ${user.name}`; // Uses user but doesn't depend on it
  }, []); // ❌ Missing count and user dependencies
  
  // ✅ CORRECT: All dependencies included
  useEffect(() => {
    console.log(`Count is ${count}`);
    document.title = `User: ${user.name}, Count: ${count}`;
  }, [count, user.name]); // ✅ Includes all used values
  
  // ⚠️ CAREFUL: Object dependencies
  useEffect(() => {
    console.log('User object changed:', user);
    // This will run on every render if user object is recreated
  }, [user]); // ⚠️ Object reference comparison
  
  // ✅ BETTER: Specific object properties
  useEffect(() => {
    console.log('User name or age changed');
  }, [user.name, user.age]); // ✅ Only specific properties
  
  // ❌ WRONG: Array dependencies without proper comparison
  useEffect(() => {
    console.log('Items changed:', items);
  }, [items]); // ❌ Array reference comparison
  
  // ✅ BETTER: Use useMemo for stable references
  const stableItems = useMemo(() => items, [items.join(',')]);
  useEffect(() => {
    console.log('Items actually changed:', stableItems);
  }, [stableItems]);
  
  // 🎯 Function dependencies
  const expensiveCalculation = useCallback((num) => {
    console.log('Expensive calculation running');
    return num * 2;
  }, []); // ✅ Memoized function
  
  useEffect(() => {
    const result = expensiveCalculation(count);
    console.log('Calculation result:', result);
  }, [count, expensiveCalculation]); // ✅ Include function dependency
  
  const updateUser = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };
  
  const addItem = () => {
    setItems(prev => [...prev, `item-${Date.now()}`]);
  };
  
  return (
    <div className="dependency-examples">
      <h3>Dependency Array Examples</h3>
      
      <div className="controls">
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
        
        <button onClick={() => updateUser('name', `User-${Date.now()}`)}>
          Change Name
        </button>
        
        <button onClick={() => updateUser('age', Math.floor(Math.random() * 50) + 20)}>
          Change Age
        </button>
        
        <button onClick={addItem}>
          Add Item
        </button>
      </div>
      
      <div className="state-display">
        <p>Count: {count}</p>
        <p>User: {JSON.stringify(user)}</p>
        <p>Items: {items.join(', ')}</p>
      </div>
    </div>
  );
}
```

### Dependency Array Patterns

```jsx
function DependencyPatterns() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ id: 1, preferences: { theme: 'dark' } });
  
  // 🎯 Pattern 1: Debounced API calls
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        // Simulate API call
        console.log(`Searching for: ${searchTerm}`);
        const mockResults = [
          `Result 1 for ${searchTerm}`,
          `Result 2 for ${searchTerm}`,
          `Result 3 for ${searchTerm}`
        ];
        setResults(mockResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
    
    // 🧹 Cleanup: Cancel previous search
    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [searchTerm]); // ✅ Only depends on searchTerm
  
  // 🎯 Pattern 2: Nested object dependencies
  useEffect(() => {
    console.log('User theme changed:', user.preferences.theme);
    document.body.className = `theme-${user.preferences.theme}`;
    
    return () => {
      document.body.className = ''; // Cleanup theme
    };
  }, [user.preferences.theme]); // ✅ Specific nested property
  
  // 🎯 Pattern 3: Conditional effects
  useEffect(() => {
    // Only run effect if user is logged in
    if (user.id) {
      console.log('Setting up user session');
      
      const sessionTimer = setInterval(() => {
        console.log('Refreshing user session');
      }, 60000); // Refresh every minute
      
      return () => {
        console.log('Cleaning up user session');
        clearInterval(sessionTimer);
      };
    }
  }, [user.id]); // ✅ Only runs when user.id changes
  
  // 🎯 Pattern 4: Effect with external dependencies
  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized:', window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // 🧹 Always cleanup event listeners
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // ✅ No dependencies - setup once
  
  // 🎯 Pattern 5: Effect with function dependencies
  const logUserActivity = useCallback((activity) => {
    console.log(`User ${user.id} performed: ${activity}`);
  }, [user.id]); // ✅ Function depends on user.id
  
  useEffect(() => {
    logUserActivity('page_view');
  }, [logUserActivity]); // ✅ Include function dependency
  
  const updateUserTheme = (theme) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme
      }
    }));
  };
  
  return (
    <div className="dependency-patterns">
      <h3>Advanced Dependency Patterns</h3>
      
      <div className="search-section">
        <h4>Debounced Search</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        {loading && <p>Searching...</p>}
        <ul>
          {results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      </div>
      
      <div className="theme-section">
        <h4>Theme Control</h4>
        <p>Current theme: {user.preferences.theme}</p>
        <button onClick={() => updateUserTheme('light')}>Light Theme</button>
        <button onClick={() => updateUserTheme('dark')}>Dark Theme</button>
        <button onClick={() => updateUserTheme('auto')}>Auto Theme</button>
      </div>
      
      <div className="user-section">
        <h4>User Session</h4>
        <p>User ID: {user.id}</p>
        <button onClick={() => setUser(prev => ({ ...prev, id: prev.id + 1 }))}>
          Switch User
        </button>
        <button onClick={() => setUser(prev => ({ ...prev, id: null }))}>
          Logout
        </button>
      </div>
    </div>
  );
}
```

## 🧹 Cleanup Functions: Preventing Memory Leaks

### Essential Cleanup Patterns

```jsx
function CleanupPatterns() {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [data, setData] = useState(null);
  
  // 🎯 Pattern 1: Timer cleanup
  useEffect(() => {
    if (!isActive) return;
    
    console.log('Starting timer');
    const intervalId = setInterval(() => {
      console.log('Timer tick:', new Date().toLocaleTimeString());
    }, 1000);
    
    // 🧹 CRITICAL: Clear timer to prevent memory leak
    return () => {
      console.log('Cleaning up timer');
      clearInterval(intervalId);
    };
  }, [isActive]);
  
  // 🎯 Pattern 2: Event listener cleanup
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        setIsActive(false);
      }
    };
    
    if (isActive) {
      console.log('Adding event listeners');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyPress);
    }
    
    // 🧹 CRITICAL: Remove event listeners
    return () => {
      console.log('Removing event listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isActive]);
  
  // 🎯 Pattern 3: AbortController for fetch requests
  useEffect(() => {
    if (!isActive) return;
    
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        console.log('Starting fetch request');
        
        // Simulate API call with abort signal
        const response = await fetch('/api/data', {
          signal: abortController.signal
        });
        
        if (!response.ok) throw new Error('Fetch failed');
        
        const result = await response.json();
        setData(result);
        console.log('Fetch completed');
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch was aborted');
        } else {
          console.error('Fetch error:', error);
        }
      }
    };
    
    fetchData();
    
    // 🧹 CRITICAL: Abort ongoing requests
    return () => {
      console.log('Aborting fetch request');
      abortController.abort();
    };
  }, [isActive]);
  
  // 🎯 Pattern 4: WebSocket cleanup
  useEffect(() => {
    if (!isActive) return;
    
    console.log('Connecting to WebSocket');
    const ws = new WebSocket('wss://echo.websocket.org');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send('Hello WebSocket!');
    };
    
    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    // 🧹 CRITICAL: Close WebSocket connection
    return () => {
      console.log('Closing WebSocket');
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isActive]);
  
  // 🎯 Pattern 5: Subscription cleanup
  useEffect(() => {
    if (!isActive) return;
    
    // Simulate subscription (like Redux store)
    const subscription = {
      unsubscribe: () => console.log('Unsubscribed from store')
    };
    
    console.log('Subscribing to store');
    
    // 🧹 CRITICAL: Unsubscribe to prevent memory leaks
    return () => {
      subscription.unsubscribe();
    };
  }, [isActive]);
  
  return (
    <div className="cleanup-patterns">
      <h3>Cleanup Patterns Demo</h3>
      
      <div className="controls">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={isActive ? 'active' : ''}
        >
          {isActive ? 'Stop' : 'Start'} Effects
        </button>
      </div>
      
      <div className="status">
        <p>Effects active: {isActive ? 'Yes' : 'No'}</p>
        <p>Mouse position: {position.x}, {position.y}</p>
        <p>Data: {data ? JSON.stringify(data) : 'No data'}</p>
        <p>Press Escape to deactivate</p>
      </div>
      
      <div className="cleanup-info">
        <h4>What gets cleaned up:</h4>
        <ul>
          <li>✅ Timers (setInterval, setTimeout)</li>
          <li>✅ Event listeners</li>
          <li>✅ Fetch requests (AbortController)</li>
          <li>✅ WebSocket connections</li>
          <li>✅ Subscriptions</li>
          <li>✅ Animation frames</li>
          <li>✅ DOM modifications</li>
        </ul>
      </div>
    </div>
  );
}
```

### Memory Leak Prevention

```jsx
function MemoryLeakPrevention() {
  const [componentCount, setComponentCount] = useState(1);
  const [showLeakyComponent, setShowLeakyComponent] = useState(true);
  
  return (
    <div className="memory-leak-demo">
      <h3>Memory Leak Prevention</h3>
      
      <div className="controls">
        <button onClick={() => setComponentCount(c => c + 1)}>
          Create Component #{componentCount + 1}
        </button>
        
        <button onClick={() => setShowLeakyComponent(!showLeakyComponent)}>
          {showLeakyComponent ? 'Hide' : 'Show'} Leaky Component
        </button>
      </div>
      
      {/* Show multiple instances to demonstrate leaks */}
      {Array.from({ length: componentCount }, (_, i) => (
        <div key={i}>
          <h4>Component Instance #{i + 1}</h4>
          {showLeakyComponent ? <LeakyComponent /> : <CleanComponent />}
        </div>
      ))}
    </div>
  );
}

// ❌ BAD: Component with memory leaks
function LeakyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // ❌ Timer without cleanup
    setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // ❌ Event listener without cleanup
    const handleClick = () => console.log('Clicked');
    document.addEventListener('click', handleClick);
    
    // ❌ No cleanup function!
  }, []);
  
  return (
    <div className="leaky-component">
      <p>❌ Leaky Component - Count: {count}</p>
      <p>This component creates memory leaks!</p>
    </div>
  );
}

// ✅ GOOD: Component with proper cleanup
function CleanComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // ✅ Timer with cleanup
    const intervalId = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // ✅ Event listener with cleanup
    const handleClick = () => console.log('Clicked');
    document.addEventListener('click', handleClick);
    
    // ✅ Proper cleanup function
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('click', handleClick);
    };
  }, []);
  
  return (
    <div className="clean-component">
      <p>✅ Clean Component - Count: {count}</p>
      <p>This component properly cleans up!</p>
    </div>
  );
}
```

## 🚀 Advanced useEffect Patterns

### Custom Hook Patterns

```jsx
// 🎯 Custom hook for API calls
function useApi(url, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!url) return;
    
    const abortController = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      abortController.abort();
    };
  }, [url, ...dependencies]);
  
  return { data, loading, error };
}

// 🎯 Custom hook for local storage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // 🎯 Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);
  
  return [storedValue, setValue];
}

// 🎯 Custom hook for window size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Set initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return windowSize;
}

// 🎯 Custom hook for debounced values
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage examples
function CustomHookExamples() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(1);
  
  // 🎯 Using custom hooks
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: userData, loading, error } = useApi(
    userId ? `/api/users/${userId}` : null,
    [userId]
  );
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en'
  });
  const windowSize = useWindowSize();
  
  // 🎯 Effect that depends on debounced value
  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('Searching for:', debouncedSearchTerm);
      // Perform search...
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div className="custom-hook-examples">
      <h3>Custom Hook Examples</h3>
      
      <div className="search-section">
        <h4>Debounced Search</h4>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search (debounced)..."
        />
        <p>Search term: {searchTerm}</p>
        <p>Debounced: {debouncedSearchTerm}</p>
      </div>
      
      <div className="api-section">
        <h4>API Data</h4>
        <button onClick={() => setUserId(userId + 1)}>
          Load User {userId + 1}
        </button>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {userData && <pre>{JSON.stringify(userData, null, 2)}</pre>}
      </div>
      
      <div className="storage-section">
        <h4>Local Storage Preferences</h4>
        <button 
          onClick={() => setPreferences(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
          }))}
        >
          Toggle Theme: {preferences.theme}
        </button>
        <pre>{JSON.stringify(preferences, null, 2)}</pre>
      </div>
      
      <div className="window-section">
        <h4>Window Size</h4>
        <p>Width: {windowSize.width}px</p>
        <p>Height: {windowSize.height}px</p>
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Missing Dependencies

```jsx
// ❌ WRONG: Missing dependencies
function MissingDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  useEffect(() => {
    const result = count * multiplier; // Uses count and multiplier
    console.log('Result:', result);
  }, []); // ❌ Missing count and multiplier dependencies
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <button onClick={() => setMultiplier(m => m + 1)}>Multiplier: {multiplier}</button>
    </div>
  );
}

// ✅ CORRECT: All dependencies included
function CorrectDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  useEffect(() => {
    const result = count * multiplier;
    console.log('Result:', result);
  }, [count, multiplier]); // ✅ All dependencies included
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <button onClick={() => setMultiplier(m => m + 1)}>Multiplier: {multiplier}</button>
    </div>
  );
}
```

### 2. Infinite Loops

```jsx
// ❌ WRONG: Infinite loop
function InfiniteLoop() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // This creates a new array every time
    setData([1, 2, 3]); // ❌ Causes infinite re-renders
  }, [data]); // ❌ data changes every render
  
  return <div>Data: {data.join(', ')}</div>;
}

// ✅ CORRECT: Stable dependencies
function NoInfiniteLoop() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    setData([1, 2, 3]);
  }, []); // ✅ Empty dependency array
  
  return <div>Data: {data.join(', ')}</div>;
}
```

### 3. Stale Closures

```jsx
// ❌ WRONG: Stale closure
function StaleClosure() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // ❌ Always uses initial count value (0)
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // ❌ Empty deps but uses count
  
  return <div>Count: {count}</div>;
}

// ✅ CORRECT: Functional update
function NoStaleClosure() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prevCount => prevCount + 1); // ✅ Uses current value
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // ✅ No dependencies needed
  
  return <div>Count: {count}</div>;
}
```

### 4. Unnecessary Effects

```jsx
// ❌ WRONG: Unnecessary effect for derived state
function UnnecessaryEffect() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  
  // ❌ Don't use effect for derived state
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  
  return (
    <div>
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
      />
      <input 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
      />
      <p>Full name: {fullName}</p>
    </div>
  );
}

// ✅ CORRECT: Derived state during render
function DerivedState() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // ✅ Calculate during render
  const fullName = `${firstName} ${lastName}`.trim();
  
  return (
    <div>
      <input 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
      />
      <input 
        value={lastName} 
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name"
      />
      <p>Full name: {fullName}</p>
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Data Fetcher with Cleanup

Build a component that:
- Fetches user data based on user ID
- Shows loading state
- Handles errors gracefully
- Cancels ongoing requests when user ID changes
- Implements retry functionality

<details>
<summary>💡 Solution</summary>

```jsx
function DataFetcher({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    if (!userId) {
      setData(null);
      setError(null);
      return;
    }
    
    const abortController = new AbortController();
    let retryTimeout;
    
    const fetchUserData = async (attempt = 0) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        setData(userData);
        setRetryCount(0);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request was aborted');
          return;
        }
        
        setError(err.message);
        
        // Retry logic
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          retryTimeout = setTimeout(() => {
            setRetryCount(attempt + 1);
            fetchUserData(attempt + 1);
          }, delay);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    return () => {
      abortController.abort();
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [userId]);
  
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    // Trigger re-fetch by updating a dependency
  };
  
  if (loading) {
    return (
      <div className="data-fetcher loading">
        <p>Loading user data...</p>
        {retryCount > 0 && <p>Retry attempt: {retryCount}</p>}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="data-fetcher error">
        <p>Error: {error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="data-fetcher empty">
        <p>No user selected</p>
      </div>
    );
  }
  
  return (
    <div className="data-fetcher success">
      <h3>User Data</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

</details>

### Challenge 2: Real-time Chat Component

Create a chat component that:
- Connects to WebSocket on mount
- Sends and receives messages
- Shows connection status
- Handles reconnection on disconnect
- Cleans up properly on unmount

<details>
<summary>💡 Solution</summary>

```jsx
function RealTimeChat({ roomId, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [ws, setWs] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  const connectWebSocket = useCallback(() => {
    if (!roomId || !userId) return;
    
    setConnectionStatus('connecting');
    
    const websocket = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      reconnectAttemptsRef.current = 0;
      
      // Send join message
      websocket.send(JSON.stringify({
        type: 'join',
        userId,
        roomId
      }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'message') {
          setMessages(prev => [...prev, {
            id: message.id,
            text: message.text,
            userId: message.userId,
            timestamp: new Date(message.timestamp)
          }]);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
    
    websocket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('disconnected');
      setWs(null);
      
      // Attempt to reconnect if not a clean close
      if (event.code !== 1000 && reconnectAttemptsRef.current < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connectWebSocket();
        }, delay);
      }
    };
    
    setWs(websocket);
  }, [roomId, userId]);
  
  // Connect on mount and when roomId/userId changes
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [connectWebSocket]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'leave',
          userId,
          roomId
        }));
        ws.close(1000, 'User leaving');
      }
    };
  }, []);
  
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    const message = {
      type: 'message',
      text: newMessage.trim(),
      userId,
      roomId,
      timestamp: new Date().toISOString()
    };
    
    ws.send(JSON.stringify(message));
    setNewMessage('');
  };
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'connecting': return 'orange';
      case 'error': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <div className="real-time-chat">
      <div className="chat-header">
        <h3>Chat Room: {roomId}</h3>
        <div className="connection-status">
          <span 
            className="status-indicator"
            style={{ backgroundColor: getStatusColor() }}
          />
          {connectionStatus}
          {reconnectAttemptsRef.current > 0 && (
            <span> (Attempt {reconnectAttemptsRef.current})</span>
          )}
        </div>
      </div>
      
      <div className="messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.userId === userId ? 'own' : 'other'}`}
          >
            <div className="message-header">
              <span className="user-id">{message.userId}</span>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="message-text">{message.text}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={connectionStatus !== 'connected'}
        />
        <button 
          type="submit" 
          disabled={connectionStatus !== 'connected' || !newMessage.trim()}
        >
          Send
        </button>
      </form>
      
      {connectionStatus === 'error' && (
        <button onClick={connectWebSocket} className="reconnect-button">
          Reconnect
        </button>
      )}
    </div>
  );
}
```

</details>

## 🎯 When and Why: useEffect Decision Framework

### Quick Decision Tree

```
🤔 Do I need useEffect?

├── Is this for side effects? (API calls, subscriptions, DOM manipulation)
│   ├── Yes → Continue...
│   └── No → Use regular variables or useMemo/useCallback
│
├── When should it run?
│   ├── Once on mount → useEffect(() => {}, [])
│   ├── On every render → useEffect(() => {})
│   ├── When specific values change → useEffect(() => {}, [dep1, dep2])
│   └── Conditionally → Add condition inside effect
│
├── Does it need cleanup?
│   ├── Timers → Yes, clear them
│   ├── Event listeners → Yes, remove them
│   ├── Subscriptions → Yes, unsubscribe
│   ├── Network requests → Yes, abort them
│   └── DOM modifications → Yes, revert them
│
└── Are dependencies correct?
    ├── Include all values from component scope used inside effect
    ├── Use ESLint plugin to catch missing dependencies
    └── Consider useCallback/useMemo for stable references
```

## 🎤 Interview Insights

### Common Interview Questions

1. **"Explain the useEffect dependency array"**
   - No array: runs after every render
   - Empty array: runs once on mount
   - With dependencies: runs when dependencies change
   - Show examples of each pattern

2. **"What happens if you don't clean up effects?"**
   - Memory leaks from timers and event listeners
   - Stale closures and race conditions
   - Performance degradation
   - Show before/after cleanup examples

3. **"How do you handle async operations in useEffect?"**
   - Can't make useEffect async directly
   - Create async function inside effect
   - Use AbortController for cleanup
   - Handle race conditions

4. **"What's the difference between useEffect and useLayoutEffect?"**
   - useEffect: runs after DOM updates (asynchronous)
   - useLayoutEffect: runs before DOM updates (synchronous)
   - Use useLayoutEffect for DOM measurements

### Code Review Red Flags

```jsx
// 🚨 Red Flags in Interviews:

// ❌ Missing cleanup
useEffect(() => {
  setInterval(() => {}, 1000); // No cleanup!
}, []);

// ❌ Missing dependencies
useEffect(() => {
  console.log(someVariable); // Uses someVariable but not in deps
}, []);

// ❌ Infinite loop
useEffect(() => {
  setSomeState({}); // Creates new object every time
}, [someState]);

// ❌ Async useEffect
useEffect(async () => { // Don't do this!
  const data = await fetch('/api');
}, []);

// ❌ Effect for derived state
useEffect(() => {
  setFullName(firstName + lastName); // Should be calculated during render
}, [firstName, lastName]);
```

## 🎯 Key Takeaways

### Mental Model

```jsx
// 🧠 Think of useEffect as:

// "After React finishes updating the DOM,
//  run this side effect if any of these
//  dependencies have changed since last time"

useEffect(() => {
  // Side effect code here
  
  return () => {
    // Cleanup code here
    // Runs before next effect or unmount
  };
}, [dependency1, dependency2]); // When to run
```

### Best Practices Summary

1. **Always include dependencies** that are used inside the effect
2. **Always clean up** timers, listeners, and subscriptions
3. **Use AbortController** for fetch requests
4. **Prefer functional updates** to avoid stale closures
5. **Don't use effects for derived state** - calculate during render
6. **Use custom hooks** to encapsulate complex effect logic
7. **Test your cleanup** by rapidly mounting/unmounting components

---

**Next up**: [useRef: Refs vs Variables](./08-useRef-refs-vs-variables.md) - Master direct DOM access and mutable values that don't trigger re-renders.

**Previous**: [Controlled vs Uncontrolled Inputs](./06-controlled-vs-uncontrolled-inputs.md)

---

*💡 Pro tip: In interviews, always explain your dependency choices and demonstrate understanding of cleanup. Show that you can prevent memory leaks and handle edge cases.*