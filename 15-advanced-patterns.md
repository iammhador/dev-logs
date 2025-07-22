# 15. Advanced Patterns 🎨

> "Good architecture is not about the framework you choose, but about the patterns you apply." - Clean Architecture Principles

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- Render Props pattern and its use cases
- Compound Components pattern
- Higher-Order Components (HOCs)
- Provider pattern with Context
- State Reducer pattern
- Controlled vs Uncontrolled component patterns
- When and why to use each pattern

## 🎭 Render Props Pattern

Render Props is a technique for sharing code between components using a prop whose value is a function.

### Basic Render Props

```jsx
// ✅ Mouse tracker with render props
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };
  
  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  };
  
  render() {
    return (
      <div 
        style={{ height: '100vh' }} 
        onMouseMove={this.handleMouseMove}
      >
        {/* Call the render prop function with current state */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

// Usage
function App() {
  return (
    <div>
      <h1>Mouse Tracker Demo</h1>
      
      <MouseTracker render={({ x, y }) => (
        <div>
          <h2>Mouse position: ({x}, {y})</h2>
          <div 
            style={{
              position: 'absolute',
              left: x - 10,
              top: y - 10,
              width: 20,
              height: 20,
              backgroundColor: 'red',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />
        </div>
      )} />
    </div>
  );
}
```

### Modern Render Props with Hooks

```jsx
// ✅ Hook-based render props
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return position;
}

// Render props component using the hook
function MouseProvider({ children }) {
  const mousePosition = useMouse();
  
  return (
    <div>
      {typeof children === 'function' ? children(mousePosition) : children}
    </div>
  );
}

// Usage
function App() {
  return (
    <MouseProvider>
      {({ x, y }) => (
        <div>
          <h2>Mouse at: ({x}, {y})</h2>
          <MouseCursor x={x} y={y} />
        </div>
      )}
    </MouseProvider>
  );
}

function MouseCursor({ x, y }) {
  return (
    <div 
      style={{
        position: 'fixed',
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        backgroundColor: 'blue',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
```

### Data Fetching with Render Props

```jsx
// ✅ Generic data fetcher
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
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
  }, [url]);
  
  return children({ data, loading, error });
}

// Usage
function UserProfile({ userId }) {
  return (
    <DataFetcher url={`/api/users/${userId}`}>
      {({ data: user, loading, error }) => {
        if (loading) return <div>Loading user...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!user) return <div>User not found</div>;
        
        return (
          <div>
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        );
      }}
    </DataFetcher>
  );
}

function PostsList() {
  return (
    <DataFetcher url="/api/posts">
      {({ data: posts, loading, error }) => {
        if (loading) return <div>Loading posts...</div>;
        if (error) return <div>Error: {error}</div>;
        
        return (
          <div>
            <h2>Posts</h2>
            {posts?.map(post => (
              <article key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </article>
            ))}
          </div>
        );
      }}
    </DataFetcher>
  );
}
```

## 🧩 Compound Components Pattern

Compound components work together to form a complete UI. Think of HTML elements like `<select>` and `<option>`.

### Basic Compound Components

```jsx
// ✅ Accordion compound component
const AccordionContext = createContext();

function Accordion({ children, allowMultiple = false }) {
  const [openItems, setOpenItems] = useState(new Set());
  
  const toggleItem = useCallback((id) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      
      return newSet;
    });
  }, [allowMultiple]);
  
  const value = useMemo(() => ({
    openItems,
    toggleItem
  }), [openItems, toggleItem]);
  
  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, children }) {
  const { openItems, toggleItem } = useContext(AccordionContext);
  const isOpen = openItems.has(id);
  
  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { id, isOpen });
        }
        return child;
      })}
    </div>
  );
}

function AccordionHeader({ id, isOpen, children }) {
  const { toggleItem } = useContext(AccordionContext);
  
  return (
    <button 
      className="accordion-header"
      onClick={() => toggleItem(id)}
      aria-expanded={isOpen}
    >
      {children}
      <span className={`accordion-icon ${isOpen ? 'rotated' : ''}`}>▼</span>
    </button>
  );
}

function AccordionContent({ isOpen, children }) {
  return (
    <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
      <div className="accordion-content-inner">
        {children}
      </div>
    </div>
  );
}

// Attach sub-components to main component
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Content = AccordionContent;

// Usage
function App() {
  return (
    <div>
      <h1>FAQ</h1>
      
      <Accordion allowMultiple={false}>
        <Accordion.Item id="item1">
          <Accordion.Header>What is React?</Accordion.Header>
          <Accordion.Content>
            React is a JavaScript library for building user interfaces.
            It was created by Facebook and is now maintained by Meta.
          </Accordion.Content>
        </Accordion.Item>
        
        <Accordion.Item id="item2">
          <Accordion.Header>What are React Hooks?</Accordion.Header>
          <Accordion.Content>
            Hooks are functions that let you use state and other React features
            in functional components. They were introduced in React 16.8.
          </Accordion.Content>
        </Accordion.Item>
        
        <Accordion.Item id="item3">
          <Accordion.Header>What is JSX?</Accordion.Header>
          <Accordion.Content>
            JSX is a syntax extension for JavaScript that looks similar to XML or HTML.
            It allows you to write HTML-like code in your JavaScript files.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
```

### Advanced Compound Components with Flexible API

```jsx
// ✅ Flexible Modal compound component
const ModalContext = createContext();

function Modal({ children, isOpen, onClose }) {
  const value = useMemo(() => ({
    isOpen,
    onClose
  }), [isOpen, onClose]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <ModalContext.Provider value={value}>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

function ModalHeader({ children }) {
  const { onClose } = useContext(ModalContext);
  
  return (
    <div className="modal-header">
      <h2>{children}</h2>
      <button className="modal-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function ModalBody({ children }) {
  return (
    <div className="modal-body">
      {children}
    </div>
  );
}

function ModalFooter({ children }) {
  return (
    <div className="modal-footer">
      {children}
    </div>
  );
}

// Attach sub-components
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

// Usage
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>Confirm Action</Modal.Header>
        
        <Modal.Body>
          <p>Are you sure you want to delete this item?</p>
          <p>This action cannot be undone.</p>
        </Modal.Body>
        
        <Modal.Footer>
          <button onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button 
            className="danger"
            onClick={() => {
              // Perform delete action
              console.log('Item deleted');
              setIsModalOpen(false);
            }}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
```

## 🎯 Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new component with additional functionality.

### Basic HOC Example

```jsx
// ✅ withLoading HOC
function withLoading(WrappedComponent) {
  return function WithLoadingComponent(props) {
    if (props.isLoading) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// Usage
function UserProfile({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

const UserProfileWithLoading = withLoading(UserProfile);

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser({ name: 'John Doe', email: 'john@example.com' });
      setIsLoading(false);
    }, 2000);
  }, []);
  
  return (
    <UserProfileWithLoading 
      user={user} 
      isLoading={isLoading} 
    />
  );
}
```

### Advanced HOC with Configuration

```jsx
// ✅ withAuth HOC with configuration
function withAuth(WrappedComponent, options = {}) {
  const {
    redirectTo = '/login',
    requiredRoles = [],
    fallbackComponent: FallbackComponent
  } = options;
  
  return function WithAuthComponent(props) {
    const { user, isAuthenticated } = useAuth(); // Custom hook
    
    // Not authenticated
    if (!isAuthenticated) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      // In a real app, you'd use React Router
      window.location.href = redirectTo;
      return null;
    }
    
    // Check roles if required
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        user.roles?.includes(role)
      );
      
      if (!hasRequiredRole) {
        return (
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You don't have permission to view this page.</p>
          </div>
        );
      }
    }
    
    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage
function AdminPanel({ user }) {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Welcome, {user.name}!</p>
      <button>Manage Users</button>
      <button>View Analytics</button>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div>
      <h2>Please log in</h2>
      <button>Login</button>
    </div>
  );
}

const ProtectedAdminPanel = withAuth(AdminPanel, {
  requiredRoles: ['admin'],
  fallbackComponent: LoginPrompt
});
```

## 🏪 Provider Pattern

The Provider pattern uses React Context to share data across the component tree.

### Theme Provider Example

```jsx
// ✅ Theme provider with multiple themes
const ThemeContext = createContext();

const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    primary: '#007bff',
    secondary: '#6c757d'
  },
  dark: {
    background: '#121212',
    text: '#ffffff',
    primary: '#bb86fc',
    secondary: '#03dac6'
  },
  blue: {
    background: '#e3f2fd',
    text: '#0d47a1',
    primary: '#1976d2',
    secondary: '#42a5f5'
  }
};

function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const theme = themes[currentTheme];
  
  const toggleTheme = useCallback(() => {
    setCurrentTheme(prev => {
      const themeNames = Object.keys(themes);
      const currentIndex = themeNames.indexOf(prev);
      const nextIndex = (currentIndex + 1) % themeNames.length;
      return themeNames[nextIndex];
    });
  }, []);
  
  const setTheme = useCallback((themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);
  
  const value = useMemo(() => ({
    theme,
    currentTheme,
    toggleTheme,
    setTheme,
    availableThemes: Object.keys(themes)
  }), [theme, currentTheme, toggleTheme, setTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      <div 
        style={{
          backgroundColor: theme.background,
          color: theme.text,
          minHeight: '100vh',
          transition: 'all 0.3s ease'
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme
function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Components using the theme
function Header() {
  const { theme, toggleTheme, currentTheme } = useTheme();
  
  return (
    <header 
      style={{
        padding: '1rem',
        borderBottom: `2px solid ${theme.primary}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      <h1 style={{ color: theme.primary }}>My App</h1>
      
      <button 
        onClick={toggleTheme}
        style={{
          backgroundColor: theme.primary,
          color: theme.background,
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Theme: {currentTheme}
      </button>
    </header>
  );
}

function Card({ title, children }) {
  const { theme } = useTheme();
  
  return (
    <div 
      style={{
        border: `1px solid ${theme.secondary}`,
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem',
        backgroundColor: theme.background,
        boxShadow: `0 2px 4px ${theme.secondary}30`
      }}
    >
      <h3 style={{ color: theme.primary, marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

// App using the provider
function App() {
  return (
    <ThemeProvider>
      <Header />
      
      <main style={{ padding: '1rem' }}>
        <Card title="Welcome">
          <p>This is a themed application!</p>
          <p>Click the theme button to cycle through different themes.</p>
        </Card>
        
        <Card title="Features">
          <ul>
            <li>Multiple theme support</li>
            <li>Smooth transitions</li>
            <li>Context-based state management</li>
          </ul>
        </Card>
      </main>
    </ThemeProvider>
  );
}
```

## 🔄 State Reducer Pattern

The State Reducer pattern gives users control over how state updates work.

### Flexible Counter with State Reducer

```jsx
// ✅ Counter with customizable state reducer
function useCounter({
  initialValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  reducer = (state, action) => state // Default: no-op reducer
} = {}) {
  
  // Internal reducer that handles the core logic
  const internalReducer = useCallback((state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return Math.min(max, state + step);
      case 'DECREMENT':
        return Math.max(min, state - step);
      case 'SET':
        return Math.max(min, Math.min(max, action.payload));
      case 'RESET':
        return initialValue;
      default:
        return state;
    }
  }, [min, max, step, initialValue]);
  
  // Combined reducer: user reducer gets first chance to handle actions
  const combinedReducer = useCallback((state, action) => {
    // Let user reducer handle the action first
    const userResult = reducer(state, action);
    
    // If user reducer returned the same state, use internal reducer
    if (userResult === state) {
      return internalReducer(state, action);
    }
    
    // User reducer modified state, respect their decision
    return userResult;
  }, [reducer, internalReducer]);
  
  const [count, dispatch] = useReducer(combinedReducer, initialValue);
  
  const increment = useCallback(() => {
    dispatch({ type: 'INCREMENT' });
  }, []);
  
  const decrement = useCallback(() => {
    dispatch({ type: 'DECREMENT' });
  }, []);
  
  const set = useCallback((value) => {
    dispatch({ type: 'SET', payload: value });
  }, []);
  
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  return {
    count,
    increment,
    decrement,
    set,
    reset,
    dispatch // Allow direct dispatch for custom actions
  };
}

// Usage examples
function BasicCounter() {
  const counter = useCounter({ initialValue: 10, min: 0, max: 100 });
  
  return (
    <div>
      <h3>Basic Counter: {counter.count}</h3>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}

function CustomCounter() {
  // Custom reducer that adds logging and prevents odd numbers
  const customReducer = useCallback((state, action) => {
    console.log('Counter action:', action.type, 'Current state:', state);
    
    // Prevent setting odd numbers
    if (action.type === 'SET' && action.payload % 2 !== 0) {
      console.log('Odd numbers not allowed!');
      return state; // Don't change state
    }
    
    // Let the default reducer handle other cases
    return state;
  }, []);
  
  const counter = useCounter({
    initialValue: 0,
    step: 2,
    reducer: customReducer
  });
  
  return (
    <div>
      <h3>Custom Counter (Even Numbers Only): {counter.count}</h3>
      <button onClick={counter.decrement}>-2</button>
      <button onClick={counter.increment}>+2</button>
      <button onClick={() => counter.set(7)}>Set to 7 (will fail)</button>
      <button onClick={() => counter.set(8)}>Set to 8 (will work)</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <BasicCounter />
      <hr />
      <CustomCounter />
    </div>
  );
}
```

## 🎯 Mini-Challenge: Build a Flexible Form Component

### Challenge: Create a Compound Form Component

Build a form system using compound components that supports:
- Field validation
- Custom field types
- Form-level state management
- Flexible layout

```jsx
// Your task: Implement this form system
// Usage should work like this:
function ContactForm() {
  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <Form.Field name="name" required>
        <Form.Label>Full Name</Form.Label>
        <Form.Input placeholder="Enter your name" />
        <Form.Error />
      </Form.Field>
      
      <Form.Field name="email" required validate={validateEmail}>
        <Form.Label>Email Address</Form.Label>
        <Form.Input type="email" placeholder="Enter your email" />
        <Form.Error />
      </Form.Field>
      
      <Form.Field name="message" required>
        <Form.Label>Message</Form.Label>
        <Form.Textarea rows={4} placeholder="Enter your message" />
        <Form.Error />
      </Form.Field>
      
      <Form.Actions>
        <Form.Reset>Clear</Form.Reset>
        <Form.Submit>Send Message</Form.Submit>
      </Form.Actions>
    </Form>
  );
}

function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? '' : 'Please enter a valid email address';
}
```

### Solution: Compound Form Component

```jsx
// ✅ Form context and provider
const FormContext = createContext();

function Form({ children, onSubmit, initialValues = {} }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);
  
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  const setTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  const validateField = useCallback((name, value, validator) => {
    if (validator) {
      const error = validator(value);
      setError(name, error);
      return !error;
    }
    return true;
  }, [setError]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validate all fields
    const formData = new FormData(e.target);
    const fieldValidations = [];
    
    // Get all field validators from form elements
    const fields = e.target.querySelectorAll('[data-field-name]');
    fields.forEach(field => {
      const name = field.dataset.fieldName;
      const validator = field.dataset.validator;
      const required = field.hasAttribute('required');
      const value = values[name] || '';
      
      if (required && !value.trim()) {
        setError(name, 'This field is required');
        fieldValidations.push(false);
      } else if (validator && window[validator]) {
        const isValid = validateField(name, value, window[validator]);
        fieldValidations.push(isValid);
      } else {
        fieldValidations.push(true);
      }
      
      setTouched(name);
    });
    
    // Submit if all validations pass
    if (fieldValidations.every(Boolean)) {
      onSubmit(values);
    }
  }, [values, validateField, setError, setTouched, onSubmit]);
  
  const value = useMemo(() => ({
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    validateField,
    reset
  }), [values, errors, touched, setValue, setError, setTouched, validateField, reset]);
  
  return (
    <FormContext.Provider value={value}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Field wrapper component
function FormField({ name, required, validate, children }) {
  const { values, errors, touched } = useContext(FormContext);
  
  const fieldValue = values[name] || '';
  const fieldError = errors[name];
  const fieldTouched = touched[name];
  const showError = fieldTouched && fieldError;
  
  const fieldContext = useMemo(() => ({
    name,
    value: fieldValue,
    error: fieldError,
    touched: fieldTouched,
    showError,
    required,
    validate
  }), [name, fieldValue, fieldError, fieldTouched, showError, required, validate]);
  
  return (
    <FieldContext.Provider value={fieldContext}>
      <div className={`form-field ${showError ? 'has-error' : ''}`}>
        {children}
      </div>
    </FieldContext.Provider>
  );
}

const FieldContext = createContext();

// Form input components
function FormLabel({ children }) {
  const { name, required } = useContext(FieldContext);
  
  return (
    <label htmlFor={name} className="form-label">
      {children}
      {required && <span className="required">*</span>}
    </label>
  );
}

function FormInput({ type = 'text', ...props }) {
  const { name, value, required, validate } = useContext(FieldContext);
  const { setValue, setTouched, validateField } = useContext(FormContext);
  
  const handleChange = (e) => {
    setValue(name, e.target.value);
  };
  
  const handleBlur = () => {
    setTouched(name);
    if (validate) {
      validateField(name, value, validate);
    }
  };
  
  return (
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      required={required}
      data-field-name={name}
      data-validator={validate?.name}
      className="form-input"
      {...props}
    />
  );
}

function FormTextarea({ ...props }) {
  const { name, value, required, validate } = useContext(FieldContext);
  const { setValue, setTouched, validateField } = useContext(FormContext);
  
  const handleChange = (e) => {
    setValue(name, e.target.value);
  };
  
  const handleBlur = () => {
    setTouched(name);
    if (validate) {
      validateField(name, value, validate);
    }
  };
  
  return (
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      required={required}
      data-field-name={name}
      data-validator={validate?.name}
      className="form-textarea"
      {...props}
    />
  );
}

function FormError() {
  const { showError, error } = useContext(FieldContext);
  
  if (!showError) return null;
  
  return (
    <div className="form-error">
      {error}
    </div>
  );
}

function FormActions({ children }) {
  return (
    <div className="form-actions">
      {children}
    </div>
  );
}

function FormSubmit({ children, ...props }) {
  return (
    <button type="submit" className="form-submit" {...props}>
      {children}
    </button>
  );
}

function FormReset({ children, ...props }) {
  const { reset } = useContext(FormContext);
  
  return (
    <button 
      type="button" 
      onClick={reset} 
      className="form-reset" 
      {...props}
    >
      {children}
    </button>
  );
}

// Attach sub-components
Form.Field = FormField;
Form.Label = FormLabel;
Form.Input = FormInput;
Form.Textarea = FormTextarea;
Form.Error = FormError;
Form.Actions = FormActions;
Form.Submit = FormSubmit;
Form.Reset = FormReset;
```

## 🎯 When to Use Each Pattern

### Pattern Selection Guide

| Pattern | Use When | Avoid When |
|---------|----------|------------|
| **Render Props** | Sharing stateful logic, flexible rendering | Simple prop passing |
| **Compound Components** | Related components that work together | Unrelated components |
| **HOCs** | Cross-cutting concerns, legacy code | Modern React (prefer hooks) |
| **Provider** | Global state, theme, auth | Local component state |
| **State Reducer** | Complex state logic, user customization | Simple state updates |

### Decision Framework

```
What are you trying to achieve?

├─ Share stateful logic between components
│  ├─ Need flexible rendering → Render Props
│  └─ Logic only → Custom Hook
│
├─ Create reusable component API
│  ├─ Components work together → Compound Components
│  └─ Single component → Regular props
│
├─ Add functionality to existing components
│  ├─ Modern React → Custom Hook + Component
│  └─ Legacy/Class components → HOC
│
├─ Share data across component tree
│  ├─ Global state → Provider Pattern
│  └─ Local state → Props/State lifting
│
└─ Complex state management
   ├─ User needs control → State Reducer
   └─ Internal only → useReducer
```

---

**Next up**: We'll explore error boundaries and learn how to handle errors gracefully in React! 🛡️