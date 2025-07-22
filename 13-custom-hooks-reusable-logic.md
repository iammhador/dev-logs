# 13. Custom Hooks: Reusable Logic 🎣

> "Custom hooks are where React's composition model truly shines. They let you extract component logic into reusable functions." - React Team

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What custom hooks are and why they're powerful
- How to extract stateful logic into reusable hooks
- Common patterns for building custom hooks
- Best practices for hook composition
- Testing strategies for custom hooks
- Performance considerations

## 🔍 What Are Custom Hooks?

Custom hooks are JavaScript functions that:
1. **Start with "use"** (naming convention)
2. **Can call other hooks** (built-in or custom)
3. **Extract stateful logic** from components
4. **Enable logic reuse** across components
5. **Follow the rules of hooks**

### Basic Example

```jsx
// ✅ Simple custom hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);
  
  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);
  
  return {
    count,
    increment,
    decrement,
    reset
  };
}

// Usage in component
function Counter() {
  const { count, increment, decrement, reset } = useCounter(10);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## 🏗️ Common Custom Hook Patterns

### 1. State Management Hooks

```jsx
// ✅ Boolean state hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return [value, { toggle, setTrue, setFalse }];
}

// ✅ Array state hook
function useArray(initialArray = []) {
  const [array, setArray] = useState(initialArray);
  
  const push = useCallback((element) => {
    setArray(prev => [...prev, element]);
  }, []);
  
  const remove = useCallback((index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const update = useCallback((index, newElement) => {
    setArray(prev => prev.map((item, i) => 
      i === index ? newElement : item
    ));
  }, []);
  
  const clear = useCallback(() => {
    setArray([]);
  }, []);
  
  return {
    array,
    set: setArray,
    push,
    remove,
    update,
    clear
  };
}

// Usage
function TodoList() {
  const { array: todos, push, remove, update } = useArray([]);
  const [newTodo, setNewTodo] = useState('');
  
  const addTodo = () => {
    if (newTodo.trim()) {
      push({ id: Date.now(), text: newTodo, completed: false });
      setNewTodo('');
    }
  };
  
  const toggleTodo = (index) => {
    const todo = todos[index];
    update(index, { ...todo, completed: !todo.completed });
  };
  
  return (
    <div>
      <input 
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add</button>
      
      {todos.map((todo, index) => (
        <div key={todo.id}>
          <span 
            style={{ 
              textDecoration: todo.completed ? 'line-through' : 'none' 
            }}
            onClick={() => toggleTodo(index)}
          >
            {todo.text}
          </span>
          <button onClick={() => remove(index)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Data Fetching Hooks

```jsx
// ✅ Generic fetch hook
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!isCancelled) {
          setData(result);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [url, JSON.stringify(options)]);
  
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    // Trigger useEffect by updating a dependency
  }, []);
  
  return { data, loading, error, refetch };
}

// ✅ Specific API hook
function useUsers() {
  const { data, loading, error, refetch } = useFetch('/api/users');
  
  const users = useMemo(() => data || [], [data]);
  
  return {
    users,
    loading,
    error,
    refetch
  };
}

// Usage
function UserList() {
  const { users, loading, error, refetch } = useUsers();
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 3. Local Storage Hooks

```jsx
// ✅ Local storage hook with sync
function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue];
}

// Usage
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'en');
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
    </div>
  );
}
```

### 4. Event Listener Hooks

```jsx
// ✅ Generic event listener hook
function useEventListener(eventName, handler, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();
  
  // Update ref.current value if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // Make sure element supports addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    // Create event listener that calls handler function stored in ref
    const eventListener = (event) => savedHandler.current(event);
    
    element.addEventListener(eventName, eventListener);
    
    // Remove event listener on cleanup
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// ✅ Specific keyboard hook
function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = useState(false);
  
  const downHandler = useCallback((event) => {
    if (event.key === targetKey) {
      setKeyPressed(true);
    }
  }, [targetKey]);
  
  const upHandler = useCallback((event) => {
    if (event.key === targetKey) {
      setKeyPressed(false);
    }
  }, [targetKey]);
  
  useEventListener('keydown', downHandler);
  useEventListener('keyup', upHandler);
  
  return keyPressed;
}

// ✅ Window size hook
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Set initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}

// Usage
function ResponsiveComponent() {
  const { width } = useWindowSize();
  const escapePressed = useKeyPress('Escape');
  
  useEffect(() => {
    if (escapePressed) {
      console.log('Escape was pressed!');
    }
  }, [escapePressed]);
  
  return (
    <div>
      <p>Window width: {width}px</p>
      <p>Screen size: {width < 768 ? 'Mobile' : 'Desktop'}</p>
      {escapePressed && <p>Escape is being pressed!</p>}
    </div>
  );
}
```

## 🔄 Hook Composition

### Combining Multiple Hooks

```jsx
// ✅ Complex hook that combines multiple concerns
function useShoppingCart() {
  // Use multiple custom hooks
  const { array: items, push, remove, update, clear } = useArray([]);
  const [cartTotal, setCartTotal] = useLocalStorage('cartTotal', 0);
  const [isOpen, { toggle: toggleCart, setFalse: closeCart }] = useToggle(false);
  
  // Calculate total whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [items, setCartTotal]);
  
  // Add item to cart
  const addItem = useCallback((product) => {
    const existingIndex = items.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity if item exists
      const existingItem = items[existingIndex];
      update(existingIndex, {
        ...existingItem,
        quantity: existingItem.quantity + 1
      });
    } else {
      // Add new item
      push({ ...product, quantity: 1 });
    }
  }, [items, push, update]);
  
  // Remove item from cart
  const removeItem = useCallback((productId) => {
    const index = items.findIndex(item => item.id === productId);
    if (index >= 0) {
      remove(index);
    }
  }, [items, remove]);
  
  // Update item quantity
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    
    const index = items.findIndex(item => item.id === productId);
    if (index >= 0) {
      update(index, { ...items[index], quantity: newQuantity });
    }
  }, [items, update, removeItem]);
  
  return {
    items,
    total: cartTotal,
    itemCount: items.length,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart: clear,
    toggleCart,
    closeCart
  };
}

// Usage
function App() {
  const cart = useShoppingCart();
  
  const sampleProduct = {
    id: 1,
    name: 'React Handbook',
    price: 29.99
  };
  
  return (
    <div>
      <button onClick={() => cart.addItem(sampleProduct)}>
        Add to Cart
      </button>
      
      <button onClick={cart.toggleCart}>
        Cart ({cart.itemCount}) - ${cart.total.toFixed(2)}
      </button>
      
      {cart.isOpen && (
        <div className="cart-dropdown">
          {cart.items.map(item => (
            <div key={item.id}>
              <span>{item.name}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => cart.updateQuantity(item.id, parseInt(e.target.value))}
              />
              <button onClick={() => cart.removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <button onClick={cart.clearCart}>Clear Cart</button>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Mini-Challenge: Build a Form Hook

### Challenge 1: useForm Hook

Create a custom hook that manages form state, validation, and submission:

```jsx
// Your task: Implement this hook
function useForm(initialValues, validationRules) {
  // Should return:
  // - values: current form values
  // - errors: validation errors
  // - touched: which fields have been touched
  // - isValid: whether form is valid
  // - isSubmitting: submission state
  // - handleChange: function to update field values
  // - handleBlur: function to mark fields as touched
  // - handleSubmit: function to handle form submission
  // - reset: function to reset form
}

// Usage should work like this:
function ContactForm() {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  } = useForm(
    { name: '', email: '', message: '' },
    {
      name: (value) => value.length < 2 ? 'Name must be at least 2 characters' : '',
      email: (value) => !/\S+@\S+\.\S+/.test(value) ? 'Invalid email' : '',
      message: (value) => value.length < 10 ? 'Message must be at least 10 characters' : ''
    }
  );
  
  const onSubmit = async (formData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', formData);
    reset();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Name"
      />
      {touched.name && errors.name && <span>{errors.name}</span>}
      
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Email"
      />
      {touched.email && errors.email && <span>{errors.email}</span>}
      
      <textarea
        name="message"
        value={values.message}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Message"
      />
      {touched.message && errors.message && <span>{errors.message}</span>}
      
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      <button type="button" onClick={reset}>
        Reset
      </button>
    </form>
  );
}
```

### Solution:

```jsx
function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name];
    return rule ? rule(value) : '';
  }, [validationRules]);
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(values).every(name => {
      const error = validateField(name, values[name]);
      return !error;
    });
  }, [values, validateField]);
  
  // Handle input change
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);
  
  // Handle input blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);
  
  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => {
    return async (event) => {
      event.preventDefault();
      
      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      
      // Validate form
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validateForm]);
  
  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}
```

## ❌ Common Mistakes

### 1. Breaking Rules of Hooks

```jsx
// ❌ Calling hooks conditionally
function BadHook(shouldUseState) {
  if (shouldUseState) {
    const [state, setState] = useState(0); // This breaks rules!
  }
  return null;
}

// ✅ Always call hooks at top level
function GoodHook(shouldUseState) {
  const [state, setState] = useState(shouldUseState ? 0 : null);
  
  if (!shouldUseState) {
    return { state: null, setState: () => {} };
  }
  
  return { state, setState };
}
```

### 2. Not Memoizing Callbacks

```jsx
// ❌ Creating new functions on every render
function useCounter() {
  const [count, setCount] = useState(0);
  
  // These functions are recreated on every render!
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  
  return { count, increment, decrement };
}

// ✅ Memoize callbacks
function useCounter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);
  
  return { count, increment, decrement };
}
```

### 3. Missing Dependencies

```jsx
// ❌ Missing dependencies in useEffect
function useFetch(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData);
  }, []); // Missing 'url' dependency!
  
  return data;
}

// ✅ Include all dependencies
function useFetch(url) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let isCancelled = false;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!isCancelled) {
          setData(data);
        }
      });
    
    return () => {
      isCancelled = true;
    };
  }, [url]); // Include 'url' dependency
  
  return data;
}
```

### 4. Not Handling Cleanup

```jsx
// ❌ Memory leak - no cleanup
function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    // Missing cleanup!
  }, [callback, delay]);
}

// ✅ Proper cleanup
function useInterval(callback, delay) {
  const savedCallback = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id); // Cleanup!
    }
  }, [delay]);
}
```

## 🧪 Testing Custom Hooks

### Using React Testing Library

```jsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });
  
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });
  
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
  
  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    
    expect(result.current.count).toBe(12);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

### Testing Hooks with Dependencies

```jsx
import { renderHook } from '@testing-library/react';
import { useFetch } from './useFetch';

// Mock fetch
global.fetch = jest.fn();

describe('useFetch', () => {
  beforeEach(() => {
    fetch.mockClear();
  });
  
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useFetch('/api/test')
    );
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });
  
  it('should handle fetch errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useFetch('/api/test')
    );
    
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
});
```

## 🎯 When and Why to Use Custom Hooks

### ✅ Use Custom Hooks When:

1. **Reusing Stateful Logic**: Same logic needed in multiple components
2. **Complex State Management**: Multiple related state values
3. **Side Effect Patterns**: Common useEffect patterns
4. **API Integration**: Consistent data fetching patterns
5. **Event Handling**: Reusable event listener logic
6. **Form Management**: Common form state and validation
7. **Local Storage**: Persistent state management

### ❌ Avoid Custom Hooks When:

1. **Simple State**: Single useState is sufficient
2. **Component-Specific Logic**: Logic only used in one place
3. **No State or Effects**: Pure utility functions don't need hooks
4. **Over-Abstraction**: Making simple things complex

### 🤔 Decision Framework

```
Do you have stateful logic?
├─ No → Use regular functions
└─ Yes
   ├─ Is it used in multiple components?
   │  ├─ No → Keep in component (for now)
   │  └─ Yes → Custom hook is good
   └─ Is the logic complex?
      ├─ No → Consider if abstraction adds value
      └─ Yes → Custom hook helps organization
```

## 🚀 Performance Considerations

### Memoization in Custom Hooks

```jsx
// ✅ Properly memoized custom hook
function useExpensiveCalculation(data, options) {
  // Memoize expensive calculation
  const result = useMemo(() => {
    return performExpensiveCalculation(data, options);
  }, [data, options]);
  
  // Memoize callbacks
  const recalculate = useCallback(() => {
    // Force recalculation
  }, []);
  
  // Memoize returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    result,
    recalculate
  }), [result, recalculate]);
}
```

### Avoiding Unnecessary Re-renders

```jsx
// ❌ This will cause re-renders even when values don't change
function useBadHook() {
  const [count, setCount] = useState(0);
  
  // New object on every render!
  return {
    count,
    increment: () => setCount(prev => prev + 1)
  };
}

// ✅ Stable references
function useGoodHook() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  // Memoize the returned object
  return useMemo(() => ({
    count,
    increment
  }), [count, increment]);
}
```

---

**Next up**: We'll explore React.memo and optimization techniques to make your apps lightning fast! ⚡