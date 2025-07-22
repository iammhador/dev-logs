# useContext: Global State Management

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What React Context is and when to use it
- How to create and consume context effectively
- Context vs prop drilling solutions
- Performance implications and optimization strategies
- Common patterns and anti-patterns
- Real-world state management scenarios

---

## 🧠 What is useContext?

`useContext` is a React Hook that allows you to **consume context values** without wrapping your component in a Context Consumer. It provides a way to share data across the component tree without passing props down manually at every level.

### The Problem: Prop Drilling

```jsx
// ❌ Problem: Prop drilling through multiple levels
function App() {
  const [user, setUser] = useState({ name: 'Alice', theme: 'dark' });
  
  return (
    <div>
      <Header user={user} />
      <Main user={user} setUser={setUser} />
      <Footer user={user} />
    </div>
  );
}

function Header({ user }) {
  return (
    <header>
      <Navigation user={user} />
    </header>
  );
}

function Navigation({ user }) {
  return (
    <nav>
      <UserProfile user={user} />
    </nav>
  );
}

function UserProfile({ user }) {
  return <span>Welcome, {user.name}!</span>;
}

function Main({ user, setUser }) {
  return (
    <main>
      <Content user={user} setUser={setUser} />
    </main>
  );
}

function Content({ user, setUser }) {
  return (
    <div>
      <Settings user={user} setUser={setUser} />
    </div>
  );
}

function Settings({ user, setUser }) {
  return (
    <div>
      <ThemeToggle user={user} setUser={setUser} />
    </div>
  );
}

function ThemeToggle({ user, setUser }) {
  const toggleTheme = () => {
    setUser(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {user.theme}
    </button>
  );
}
```

### The Solution: Context

```jsx
// ✅ Solution: Context eliminates prop drilling
import { createContext, useContext, useState } from 'react';

// 🎯 Create context
const UserContext = createContext();

// 🎯 Context provider component
function UserProvider({ children }) {
  const [user, setUser] = useState({ name: 'Alice', theme: 'dark' });
  
  const value = {
    user,
    setUser,
    toggleTheme: () => {
      setUser(prev => ({
        ...prev,
        theme: prev.theme === 'dark' ? 'light' : 'dark'
      }));
    }
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 🎯 Custom hook for consuming context
function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 🎯 Clean component tree
function App() {
  return (
    <UserProvider>
      <div>
        <Header />
        <Main />
        <Footer />
      </div>
    </UserProvider>
  );
}

function Header() {
  return (
    <header>
      <Navigation />
    </header>
  );
}

function Navigation() {
  return (
    <nav>
      <UserProfile />
    </nav>
  );
}

function UserProfile() {
  const { user } = useUser(); // Direct access!
  return <span>Welcome, {user.name}!</span>;
}

function Main() {
  return (
    <main>
      <Content />
    </main>
  );
}

function Content() {
  return (
    <div>
      <Settings />
    </div>
  );
}

function Settings() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}

function ThemeToggle() {
  const { user, toggleTheme } = useUser(); // Direct access!
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {user.theme}
    </button>
  );
}
```

## 🔍 Deep Dive: Context Fundamentals

### Creating Context

```jsx
import { createContext } from 'react';

// 🎯 Basic context creation
const MyContext = createContext();

// 🎯 Context with default value
const ThemeContext = createContext('light');

// 🎯 Context with complex default value
const AppContext = createContext({
  user: null,
  theme: 'light',
  language: 'en',
  updateUser: () => {},
  toggleTheme: () => {},
  setLanguage: () => {}
});

// 🎯 Context with TypeScript (if using TypeScript)
// interface UserContextType {
//   user: User | null;
//   login: (user: User) => void;
//   logout: () => void;
// }
// const UserContext = createContext<UserContextType | undefined>(undefined);
```

### Provider Pattern

```jsx
function ContextDemo() {
  // 🎯 Multiple context providers
  return (
    <ThemeProvider>
      <UserProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

// 🎯 Theme context
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#007bff');
  
  const value = {
    theme,
    primaryColor,
    setTheme,
    setPrimaryColor,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 🎯 User context
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };
  
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// 🎯 Language context
const LanguageContext = createContext();

function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  
  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/api/translations/${lang}`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };
  
  const translate = (key, fallback = key) => {
    return translations[key] || fallback;
  };
  
  const value = {
    language,
    setLanguage,
    translate,
    loadTranslations
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
```

### Custom Hooks for Context

```jsx
// 🎯 Custom hooks with error handling
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 🎯 Selective context consumption
function useThemeActions() {
  const { setTheme, setPrimaryColor, toggleTheme } = useTheme();
  return { setTheme, setPrimaryColor, toggleTheme };
}

function useThemeValues() {
  const { theme, primaryColor, isDark } = useTheme();
  return { theme, primaryColor, isDark };
}

function useAuth() {
  const { user, isAuthenticated, login, logout } = useUser();
  return { user, isAuthenticated, login, logout };
}
```

## 🚀 Real-World Patterns

### Pattern 1: Shopping Cart Context

```jsx
const CartContext = createContext();

function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // 🎯 Cart calculations
  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);
  
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);
  
  // 🎯 Cart actions
  const addItem = useCallback((product) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);
  
  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
  }, []);
  
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev => prev.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  }, [removeItem]);
  
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);
  
  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  // 🎯 Persist cart to localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);
  
  const value = {
    items,
    totalItems,
    totalPrice,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// 🎯 Usage examples
function ProductCard({ product }) {
  const { addItem } = useCart();
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>
        Add to Cart
      </button>
    </div>
  );
}

function CartIcon() {
  const { totalItems, toggleCart } = useCart();
  
  return (
    <button className="cart-icon" onClick={toggleCart}>
      🛒 {totalItems > 0 && <span className="badge">{totalItems}</span>}
    </button>
  );
}

function CartSidebar() {
  const { items, totalPrice, isOpen, updateQuantity, removeItem, clearCart } = useCart();
  
  if (!isOpen) return null;
  
  return (
    <div className="cart-sidebar">
      <h2>Shopping Cart</h2>
      
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <h4>{item.name}</h4>
              <p>${item.price} each</p>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          
          <div className="cart-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
          
          <div className="cart-actions">
            <button onClick={clearCart}>Clear Cart</button>
            <button className="checkout-btn">Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Pattern 2: Notification System

```jsx
const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // 🎯 Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    addNotification({ type: 'success', message, ...options });
  }, [addNotification]);
  
  const showError = useCallback((message, options = {}) => {
    addNotification({ type: 'error', message, duration: 0, ...options });
  }, [addNotification]);
  
  const showWarning = useCallback((message, options = {}) => {
    addNotification({ type: 'warning', message, ...options });
  }, [addNotification]);
  
  const showInfo = useCallback((message, options = {}) => {
    addNotification({ type: 'info', message, ...options });
  }, [addNotification]);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications } = useNotifications();
  
  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function Notification({ notification }) {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeNotification(notification.id), 300);
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };
  
  return (
    <div className={`notification notification-${notification.type} ${isVisible ? 'visible' : ''}`}>
      <span className="notification-icon">{getIcon()}</span>
      <span className="notification-message">{notification.message}</span>
      <button className="notification-close" onClick={handleClose}>×</button>
    </div>
  );
}

// 🎯 Usage examples
function LoginForm() {
  const { showSuccess, showError } = useNotifications();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        showSuccess('Login successful! Welcome back.');
      } else {
        showError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Pattern 3: Modal Management

```jsx
const ModalContext = createContext();

function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);
  
  const openModal = useCallback((modalConfig) => {
    const id = Date.now() + Math.random();
    const modal = {
      id,
      ...modalConfig
    };
    
    setModals(prev => [...prev, modal]);
    return id;
  }, []);
  
  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);
  
  const updateModal = useCallback((id, updates) => {
    setModals(prev => prev.map(modal => 
      modal.id === id ? { ...modal, ...updates } : modal
    ));
  }, []);
  
  // 🎯 Convenience methods
  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const id = openModal({
        type: 'confirm',
        message,
        onConfirm: () => {
          closeModal(id);
          resolve(true);
        },
        onCancel: () => {
          closeModal(id);
          resolve(false);
        },
        ...options
      });
    });
  }, [openModal, closeModal]);
  
  const alert = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const id = openModal({
        type: 'alert',
        message,
        onClose: () => {
          closeModal(id);
          resolve();
        },
        ...options
      });
    });
  }, [openModal, closeModal]);
  
  const prompt = useCallback((message, defaultValue = '', options = {}) => {
    return new Promise((resolve) => {
      const id = openModal({
        type: 'prompt',
        message,
        defaultValue,
        onSubmit: (value) => {
          closeModal(id);
          resolve(value);
        },
        onCancel: () => {
          closeModal(id);
          resolve(null);
        },
        ...options
      });
    });
  }, [openModal, closeModal]);
  
  const value = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    confirm,
    alert,
    prompt
  };
  
  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalContainer />
    </ModalContext.Provider>
  );
}

function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

function ModalContainer() {
  const { modals } = useModal();
  
  if (modals.length === 0) return null;
  
  return (
    <div className="modal-overlay">
      {modals.map(modal => (
        <Modal key={modal.id} modal={modal} />
      ))}
    </div>
  );
}

function Modal({ modal }) {
  const { closeModal } = useModal();
  const [inputValue, setInputValue] = useState(modal.defaultValue || '');
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && modal.closeOnBackdrop !== false) {
      closeModal(modal.id);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && modal.closeOnEscape !== false) {
      closeModal(modal.id);
    }
  };
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const renderContent = () => {
    switch (modal.type) {
      case 'confirm':
        return (
          <div className="modal-content">
            <h3>{modal.title || 'Confirm'}</h3>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button onClick={modal.onCancel}>Cancel</button>
              <button onClick={modal.onConfirm} className="primary">Confirm</button>
            </div>
          </div>
        );
      
      case 'alert':
        return (
          <div className="modal-content">
            <h3>{modal.title || 'Alert'}</h3>
            <p>{modal.message}</p>
            <div className="modal-actions">
              <button onClick={modal.onClose} className="primary">OK</button>
            </div>
          </div>
        );
      
      case 'prompt':
        return (
          <div className="modal-content">
            <h3>{modal.title || 'Input Required'}</h3>
            <p>{modal.message}</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={modal.placeholder}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={modal.onCancel}>Cancel</button>
              <button onClick={() => modal.onSubmit(inputValue)} className="primary">Submit</button>
            </div>
          </div>
        );
      
      default:
        return modal.content;
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        {renderContent()}
      </div>
    </div>
  );
}

// 🎯 Usage examples
function DeleteButton({ itemId, itemName }) {
  const { confirm } = useModal();
  
  const handleDelete = async () => {
    const confirmed = await confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      { title: 'Delete Item' }
    );
    
    if (confirmed) {
      // Proceed with deletion
      console.log('Deleting item:', itemId);
    }
  };
  
  return (
    <button onClick={handleDelete} className="delete-btn">
      Delete
    </button>
  );
}

function RenameButton({ itemId, currentName }) {
  const { prompt } = useModal();
  
  const handleRename = async () => {
    const newName = await prompt(
      'Enter a new name:',
      currentName,
      { title: 'Rename Item', placeholder: 'Item name' }
    );
    
    if (newName && newName !== currentName) {
      // Proceed with rename
      console.log('Renaming item:', itemId, 'to:', newName);
    }
  };
  
  return (
    <button onClick={handleRename}>
      Rename
    </button>
  );
}
```

## ⚠️ Common Mistakes and Anti-Patterns

### Mistake 1: Context for Everything

```jsx
// ❌ Bad: Using context for local state
function BadExample() {
  // Don't create context for state that's only used in one component
  const CountContext = createContext();
  
  function CountProvider({ children }) {
    const [count, setCount] = useState(0);
    return (
      <CountContext.Provider value={{ count, setCount }}>
        {children}
      </CountContext.Provider>
    );
  }
  
  // This is overkill for local state
  return (
    <CountProvider>
      <Counter />
    </CountProvider>
  );
}

// ✅ Good: Use local state for local concerns
function GoodExample() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

### Mistake 2: Not Memoizing Context Values

```jsx
// ❌ Bad: Creating new objects on every render
function BadProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // This creates a new object on every render!
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ Good: Memoize the context value
function GoodProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ Even better: Separate stable and changing values
function BetterProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const actions = useMemo(() => ({
    setUser,
    login: async (credentials) => { /* ... */ },
    logout: () => setUser(null)
  }), []); // Stable functions
  
  const state = useMemo(() => ({
    user,
    isAuthenticated: !!user
  }), [user]); // Changing state
  
  const value = useMemo(() => ({
    ...state,
    ...actions
  }), [state, actions]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### Mistake 3: Too Many Contexts

```jsx
// ❌ Bad: Separate context for every piece of state
function BadApp() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NotificationProvider>
            <CartProvider>
              <ModalProvider>
                <LoadingProvider>
                  <ErrorProvider>
                    <App />
                  </ErrorProvider>
                </LoadingProvider>
              </ModalProvider>
            </CartProvider>
          </NotificationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// ✅ Good: Combine related contexts
function GoodApp() {
  return (
    <AppProvider> {/* Combines user, theme, language */}
      <UIProvider> {/* Combines notifications, modals, loading */}
        <ShoppingProvider> {/* Combines cart, wishlist, orders */}
          <App />
        </ShoppingProvider>
      </UIProvider>
    </AppProvider>
  );
}

// ✅ Combined context example
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  
  const value = useMemo(() => ({
    // User state
    user,
    setUser,
    isAuthenticated: !!user,
    
    // Theme state
    theme,
    setTheme,
    toggleTheme: () => setTheme(prev => prev === 'light' ? 'dark' : 'light'),
    
    // Language state
    language,
    setLanguage
  }), [user, theme, language]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
```

### Mistake 4: Context Performance Issues

```jsx
// ❌ Bad: Single context with frequently changing values
function BadPerformanceProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY }); // Causes all consumers to re-render!
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const value = useMemo(() => ({
    user,
    setUser,
    mousePosition // This changes constantly!
  }), [user, mousePosition]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// ✅ Good: Separate contexts for different update frequencies
function GoodPerformanceProvider({ children }) {
  return (
    <UserProvider> {/* Stable user data */}
      <MouseProvider> {/* Frequently changing mouse data */}
        {children}
      </MouseProvider>
    </UserProvider>
  );
}

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    setUser
  }), [user]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

function MouseProvider({ children }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <MouseContext.Provider value={mousePosition}>
      {children}
    </MouseContext.Provider>
  );
}
```

## 🏋️‍♂️ Mini-Challenges

### Challenge 1: Multi-Step Form Context

Create a context for managing a multi-step form with validation, progress tracking, and data persistence.

<details>
<summary>💡 Solution</summary>

```jsx
const FormContext = createContext();

function FormProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personal: { firstName: '', lastName: '', email: '', phone: '' },
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    preferences: { newsletter: false, notifications: true, theme: 'light' }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const steps = [
    { id: 'personal', title: 'Personal Information', fields: ['firstName', 'lastName', 'email', 'phone'] },
    { id: 'address', title: 'Address Information', fields: ['street', 'city', 'state', 'zipCode', 'country'] },
    { id: 'preferences', title: 'Preferences', fields: ['newsletter', 'notifications', 'theme'] },
    { id: 'review', title: 'Review & Submit', fields: [] }
  ];
  
  // 🎯 Validation rules
  const validationRules = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true, pattern: /^[\d\s\-\(\)\+]+$/ },
    street: { required: true, minLength: 5 },
    city: { required: true, minLength: 2 },
    state: { required: true, minLength: 2 },
    zipCode: { required: true, pattern: /^\d{5}(-\d{4})?$/ },
    country: { required: true }
  };
  
  // 🎯 Validate field
  const validateField = useCallback((field, value) => {
    const rules = validationRules[field];
    if (!rules) return null;
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${field} is required`;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${field} format is invalid`;
    }
    
    return null;
  }, []);
  
  // 🎯 Validate step
  const validateStep = useCallback((stepIndex) => {
    const step = steps[stepIndex];
    const stepErrors = {};
    
    step.fields.forEach(field => {
      const section = Object.keys(formData).find(key => 
        formData[key].hasOwnProperty(field)
      );
      
      if (section) {
        const error = validateField(field, formData[section][field]);
        if (error) {
          stepErrors[field] = error;
        }
      }
    });
    
    return stepErrors;
  }, [formData, validateField, steps]);
  
  // 🎯 Update form data
  const updateFormData = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  // 🎯 Navigation
  const nextStep = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return false;
    }
    
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    return true;
  }, [currentStep, validateStep, steps.length]);
  
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);
  
  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setErrors({});
    }
  }, [steps.length]);
  
  // 🎯 Submit form
  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Clear form data
        setFormData({
          personal: { firstName: '', lastName: '', email: '', phone: '' },
          address: { street: '', city: '', state: '', zipCode: '', country: '' },
          preferences: { newsletter: false, notifications: true, theme: 'light' }
        });
        setCurrentStep(0);
        return { success: true };
      } else {
        return { success: false, error: 'Submission failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);
  
  // 🎯 Progress calculation
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);
  
  // 🎯 Completion status
  const isStepComplete = useCallback((stepIndex) => {
    const stepErrors = validateStep(stepIndex);
    return Object.keys(stepErrors).length === 0;
  }, [validateStep]);
  
  // 🎯 Persist to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('multiStepForm');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setCurrentStep(parsed.currentStep || 0);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('multiStepForm', JSON.stringify({
      formData,
      currentStep
    }));
  }, [formData, currentStep]);
  
  const value = {
    // State
    currentStep,
    formData,
    errors,
    isSubmitting,
    steps,
    progress,
    
    // Actions
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    validateField,
    validateStep,
    isStepComplete
  };
  
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}

// 🎯 Form components
function MultiStepForm() {
  const { currentStep, steps } = useForm();
  
  return (
    <div className="multi-step-form">
      <FormProgress />
      <FormSteps />
      <FormNavigation />
    </div>
  );
}

function FormProgress() {
  const { progress, currentStep, steps } = useForm();
  
  return (
    <div className="form-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="step-indicators">
        {steps.map((step, index) => (
          <StepIndicator key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

function StepIndicator({ step, index }) {
  const { currentStep, goToStep, isStepComplete } = useForm();
  
  const isActive = index === currentStep;
  const isComplete = index < currentStep || isStepComplete(index);
  const isClickable = index <= currentStep;
  
  return (
    <div 
      className={`step-indicator ${
        isActive ? 'active' : ''
      } ${
        isComplete ? 'complete' : ''
      } ${
        isClickable ? 'clickable' : ''
      }`}
      onClick={() => isClickable && goToStep(index)}
    >
      <div className="step-number">
        {isComplete ? '✓' : index + 1}
      </div>
      <div className="step-title">{step.title}</div>
    </div>
  );
}

function FormSteps() {
  const { currentStep } = useForm();
  
  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PersonalInfoStep />;
      case 1: return <AddressInfoStep />;
      case 2: return <PreferencesStep />;
      case 3: return <ReviewStep />;
      default: return null;
    }
  };
  
  return (
    <div className="form-steps">
      {renderStep()}
    </div>
  );
}

function PersonalInfoStep() {
  const { formData, updateFormData, errors } = useForm();
  
  return (
    <div className="form-step">
      <h2>Personal Information</h2>
      
      <FormField
        label="First Name"
        value={formData.personal.firstName}
        onChange={(value) => updateFormData('personal', 'firstName', value)}
        error={errors.firstName}
        required
      />
      
      <FormField
        label="Last Name"
        value={formData.personal.lastName}
        onChange={(value) => updateFormData('personal', 'lastName', value)}
        error={errors.lastName}
        required
      />
      
      <FormField
        label="Email"
        type="email"
        value={formData.personal.email}
        onChange={(value) => updateFormData('personal', 'email', value)}
        error={errors.email}
        required
      />
      
      <FormField
        label="Phone"
        type="tel"
        value={formData.personal.phone}
        onChange={(value) => updateFormData('personal', 'phone', value)}
        error={errors.phone}
        required
      />
    </div>
  );
}

function AddressInfoStep() {
  const { formData, updateFormData, errors } = useForm();
  
  return (
    <div className="form-step">
      <h2>Address Information</h2>
      
      <FormField
        label="Street Address"
        value={formData.address.street}
        onChange={(value) => updateFormData('address', 'street', value)}
        error={errors.street}
        required
      />
      
      <div className="form-row">
        <FormField
          label="City"
          value={formData.address.city}
          onChange={(value) => updateFormData('address', 'city', value)}
          error={errors.city}
          required
        />
        
        <FormField
          label="State"
          value={formData.address.state}
          onChange={(value) => updateFormData('address', 'state', value)}
          error={errors.state}
          required
        />
      </div>
      
      <div className="form-row">
        <FormField
          label="ZIP Code"
          value={formData.address.zipCode}
          onChange={(value) => updateFormData('address', 'zipCode', value)}
          error={errors.zipCode}
          required
        />
        
        <FormField
          label="Country"
          type="select"
          value={formData.address.country}
          onChange={(value) => updateFormData('address', 'country', value)}
          error={errors.country}
          options={[
            { value: '', label: 'Select Country' },
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
            { value: 'UK', label: 'United Kingdom' }
          ]}
          required
        />
      </div>
    </div>
  );
}

function PreferencesStep() {
  const { formData, updateFormData } = useForm();
  
  return (
    <div className="form-step">
      <h2>Preferences</h2>
      
      <FormField
        label="Newsletter Subscription"
        type="checkbox"
        checked={formData.preferences.newsletter}
        onChange={(checked) => updateFormData('preferences', 'newsletter', checked)}
      />
      
      <FormField
        label="Email Notifications"
        type="checkbox"
        checked={formData.preferences.notifications}
        onChange={(checked) => updateFormData('preferences', 'notifications', checked)}
      />
      
      <FormField
        label="Theme Preference"
        type="select"
        value={formData.preferences.theme}
        onChange={(value) => updateFormData('preferences', 'theme', value)}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto' }
        ]}
      />
    </div>
  );
}

function ReviewStep() {
  const { formData, submitForm, isSubmitting } = useForm();
  const [submitResult, setSubmitResult] = useState(null);
  
  const handleSubmit = async () => {
    const result = await submitForm();
    setSubmitResult(result);
  };
  
  if (submitResult?.success) {
    return (
      <div className="form-step">
        <div className="success-message">
          <h2>✅ Form Submitted Successfully!</h2>
          <p>Thank you for your submission. We'll be in touch soon.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="form-step">
      <h2>Review & Submit</h2>
      
      <div className="review-section">
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> {formData.personal.firstName} {formData.personal.lastName}</p>
        <p><strong>Email:</strong> {formData.personal.email}</p>
        <p><strong>Phone:</strong> {formData.personal.phone}</p>
      </div>
      
      <div className="review-section">
        <h3>Address</h3>
        <p><strong>Street:</strong> {formData.address.street}</p>
        <p><strong>City:</strong> {formData.address.city}, {formData.address.state} {formData.address.zipCode}</p>
        <p><strong>Country:</strong> {formData.address.country}</p>
      </div>
      
      <div className="review-section">
        <h3>Preferences</h3>
        <p><strong>Newsletter:</strong> {formData.preferences.newsletter ? 'Yes' : 'No'}</p>
        <p><strong>Notifications:</strong> {formData.preferences.notifications ? 'Yes' : 'No'}</p>
        <p><strong>Theme:</strong> {formData.preferences.theme}</p>
      </div>
      
      {submitResult?.error && (
        <div className="error-message">
          Error: {submitResult.error}
        </div>
      )}
      
      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className="submit-btn"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Form'}
      </button>
    </div>
  );
}

function FormField({ label, type = 'text', value, checked, onChange, error, required, options, ...props }) {
  const renderInput = () => {
    switch (type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            {...props}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          >
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
          />
        );
    }
  };
  
  return (
    <div className={`form-field ${error ? 'error' : ''}`}>
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      {renderInput()}
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

function FormNavigation() {
  const { currentStep, steps, nextStep, prevStep, isStepComplete } = useForm();
  
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;
  const isLastStep = currentStep === steps.length - 1;
  
  return (
    <div className="form-navigation">
      <button 
        onClick={prevStep} 
        disabled={!canGoPrev}
        className="nav-btn prev-btn"
      >
        Previous
      </button>
      
      {!isLastStep && (
        <button 
          onClick={nextStep}
          disabled={!canGoNext}
          className="nav-btn next-btn"
        >
          Next
        </button>
      )}
    </div>
  );
}
```

</details>

### Challenge 2: Real-time Collaboration Context

Build a context for managing real-time collaboration features like user presence, cursors, and live updates.

<details>
<summary>💡 Solution</summary>

```jsx
const CollaborationContext = createContext();

function CollaborationProvider({ children, documentId }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [userCursors, setUserCursors] = useState({});
  const [documentContent, setDocumentContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastSaved, setLastSaved] = useState(null);
  
  const wsRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  
  // 🎯 WebSocket connection
  useEffect(() => {
    if (!documentId || !currentUser) return;
    
    const ws = new WebSocket(`ws://localhost:8080/collaborate/${documentId}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Send user join message
      ws.send(JSON.stringify({
        type: 'user_join',
        user: currentUser
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = () => {
      setConnectionStatus('error');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'user_leave',
          user: currentUser
        }));
      }
      ws.close();
    };
  }, [documentId, currentUser]);
  
  // 🎯 Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'user_joined':
        setConnectedUsers(prev => {
          if (prev.find(user => user.id === message.user.id)) {
            return prev;
          }
          return [...prev, message.user];
        });
        break;
      
      case 'user_left':
        setConnectedUsers(prev => prev.filter(user => user.id !== message.user.id));
        setUserCursors(prev => {
          const newCursors = { ...prev };
          delete newCursors[message.user.id];
          return newCursors;
        });
        break;
      
      case 'users_list':
        setConnectedUsers(message.users.filter(user => user.id !== currentUser?.id));
        break;
      
      case 'cursor_update':
        setUserCursors(prev => ({
          ...prev,
          [message.userId]: {
            position: message.position,
            selection: message.selection,
            timestamp: Date.now()
          }
        }));
        break;
      
      case 'content_update':
        setDocumentContent(message.content);
        break;
      
      case 'document_saved':
        setLastSaved(new Date(message.timestamp));
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [currentUser]);
  
  // 🎯 Send cursor position
  const updateCursor = useCallback((position, selection = null) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'cursor_update',
      position,
      selection,
      userId: currentUser?.id
    }));
  }, [currentUser]);
  
  // 🎯 Update document content
  const updateContent = useCallback((content) => {
    setDocumentContent(content);
    
    // Debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'content_update',
          content,
          userId: currentUser?.id
        }));
      }
    }, 500);
  }, [currentUser]);
  
  // 🎯 Join collaboration session
  const joinSession = useCallback((user) => {
    setCurrentUser(user);
  }, []);
  
  // 🎯 Leave collaboration session
  const leaveSession = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_leave',
        user: currentUser
      }));
    }
    setCurrentUser(null);
    setConnectedUsers([]);
    setUserCursors({});
  }, [currentUser]);
  
  // 🎯 Get user color
  const getUserColor = useCallback((userId) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  }, []);
  
  // 🎯 Clean up old cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUserCursors(prev => {
        const filtered = {};
        Object.entries(prev).forEach(([userId, cursor]) => {
          if (now - cursor.timestamp < 10000) { // Keep cursors for 10 seconds
            filtered[userId] = cursor;
          }
        });
        return filtered;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const value = {
    // State
    currentUser,
    connectedUsers,
    userCursors,
    documentContent,
    isConnected,
    connectionStatus,
    lastSaved,
    
    // Actions
    joinSession,
    leaveSession,
    updateCursor,
    updateContent,
    getUserColor
  };
  
  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}

// 🎯 Collaboration components
function CollaborativeEditor() {
  const {
    documentContent,
    updateContent,
    updateCursor,
    connectedUsers,
    userCursors,
    getUserColor
  } = useCollaboration();
  
  const editorRef = useRef(null);
  
  const handleContentChange = (e) => {
    updateContent(e.target.value);
  };
  
  const handleSelectionChange = () => {
    if (!editorRef.current) return;
    
    const { selectionStart, selectionEnd } = editorRef.current;
    updateCursor(selectionStart, { start: selectionStart, end: selectionEnd });
  };
  
  return (
    <div className="collaborative-editor">
      <div className="editor-header">
        <UserPresence />
        <ConnectionStatus />
      </div>
      
      <div className="editor-container">
        <textarea
          ref={editorRef}
          value={documentContent}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onClick={handleSelectionChange}
          className="editor-textarea"
          placeholder="Start typing..."
        />
        
        {/* Render user cursors */}
        {Object.entries(userCursors).map(([userId, cursor]) => {
          const user = connectedUsers.find(u => u.id === userId);
          if (!user) return null;
          
          return (
            <UserCursor
              key={userId}
              user={user}
              cursor={cursor}
              color={getUserColor(userId)}
            />
          );
        })}
      </div>
    </div>
  );
}

function UserPresence() {
  const { connectedUsers, getUserColor } = useCollaboration();
  
  return (
    <div className="user-presence">
      <span className="presence-label">Online:</span>
      {connectedUsers.map(user => (
        <div
          key={user.id}
          className="user-avatar"
          style={{ backgroundColor: getUserColor(user.id) }}
          title={user.name}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}

function ConnectionStatus() {
  const { connectionStatus, lastSaved } = useCollaboration();
  
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'disconnected': return '🔴';
      case 'error': return '🟡';
      default: return '⚪';
    }
  };
  
  return (
    <div className="connection-status">
      <span className="status-indicator">
        {getStatusIcon()} {connectionStatus}
      </span>
      {lastSaved && (
        <span className="last-saved">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

function UserCursor({ user, cursor, color }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Calculate cursor position based on text position
  useEffect(() => {
    // This would need more complex calculation in a real implementation
    // For demo purposes, we'll use a simple approximation
    const lineHeight = 20;
    const charWidth = 8;
    const line = Math.floor(cursor.position / 80); // Assuming 80 chars per line
    const char = cursor.position % 80;
    
    setPosition({
      top: line * lineHeight,
      left: char * charWidth
    });
  }, [cursor.position]);
  
  return (
    <div
      className="user-cursor"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        borderColor: color
      }}
    >
      <div className="cursor-line" style={{ backgroundColor: color }} />
      <div className="cursor-label" style={{ backgroundColor: color }}>
        {user.name}
      </div>
    </div>
  );
}
```

</details>

## 🎯 When and Why to Use Context

### ✅ Good Use Cases

1. **Theme/UI State**: Colors, fonts, layout preferences
2. **User Authentication**: Current user, permissions, auth status
3. **Language/Localization**: Current language, translations
4. **Global App State**: Shopping cart, notifications, modals
5. **Feature Flags**: A/B testing, feature toggles
6. **API Configuration**: Base URLs, auth tokens, request settings

### ❌ Avoid Context For

1. **Local Component State**: State used by only one component
2. **Frequently Changing Values**: Mouse position, scroll position
3. **Performance-Critical Data**: Large datasets, real-time updates
4. **Server State**: Use React Query, SWR, or similar instead
5. **Form State**: Use local state or form libraries

### 🤔 Decision Framework

```
Do multiple components need this data?
├─ No → Use local state
└─ Yes
   ├─ Does it change frequently?
   │  ├─ Yes → Consider alternatives (state management library)
   │  └─ No → Context is good
   └─ Is it server data?
      ├─ Yes → Use data fetching library
      └─ No → Context is perfect
```

## 🚀 Performance Optimization

### Split Contexts by Update Frequency

```jsx
// ✅ Separate stable and changing values
function OptimizedProvider({ children }) {
  return (
    <StableDataProvider>  {/* User, theme, config */}
      <ChangingDataProvider>  {/* Notifications, real-time data */}
        {children}
      </ChangingDataProvider>
    </StableDataProvider>
  );
}
```

### Use React.memo with Context

```jsx
// ✅ Prevent unnecessary re-renders
const ExpensiveComponent = React.memo(function ExpensiveComponent() {
  const { stableValue } = useStableContext();
  
  return (
    <div>
      {/* Expensive rendering logic */}
      {stableValue}
    </div>
  );
});
```

### Selective Context Consumption

```jsx
// ✅ Only consume what you need
function useThemeActions() {
  const { setTheme, toggleTheme } = useTheme();
  return useMemo(() => ({ setTheme, toggleTheme }), [setTheme, toggleTheme]);
}

function useThemeValues() {
  const { theme, colors } = useTheme();
  return useMemo(() => ({ theme, colors }), [theme, colors]);
}
```

## 🎤 Interview Insights

### Common Questions

**Q: When would you use Context vs Redux?**

A: Context is great for:
- Simple global state
- Theme/user preferences
- Authentication state
- Small to medium apps

Redux is better for:
- Complex state logic
- Time-travel debugging
- Predictable state updates
- Large applications
- Team collaboration

**Q: How do you prevent Context performance issues?**

A: 
1. Split contexts by update frequency
2. Memoize context values
3. Use React.memo for expensive components
4. Avoid putting frequently changing data in context
5. Consider state colocation

**Q: What's the difference between Context and prop drilling?**

A: Prop drilling passes data through intermediate components that don't use it. Context allows direct access to data from any component in the tree, eliminating unnecessary prop passing.

### Code Review Red Flags

❌ **Creating context for every piece of state**
❌ **Not memoizing context values**
❌ **Putting frequently changing data in context**
❌ **Missing error boundaries around context providers**
❌ **Not providing default values**
❌ **Using context for server state**

## 🎯 Key Takeaways

1. **Context solves prop drilling** - Share data across component trees
2. **Not a replacement for all state management** - Use appropriately
3. **Performance matters** - Memoize values and split contexts
4. **Custom hooks improve DX** - Encapsulate context logic
5. **Error handling is crucial** - Always check if context exists
6. **Default values help** - Provide sensible defaults
7. **Think about update frequency** - Separate stable from changing data

## 🏆 Best Practices

1. **Always provide custom hooks** for consuming context
2. **Memoize context values** to prevent unnecessary re-renders
3. **Split contexts** by concern and update frequency
4. **Use TypeScript** for better developer experience
5. **Provide meaningful error messages** when context is missing
6. **Keep context values focused** - single responsibility
7. **Document your contexts** - explain when and how to use them

## 🔧 Production Tips

- **Monitor context re-renders** with React DevTools Profiler
- **Use React.StrictMode** to catch context-related issues
- **Consider context composition** for complex applications
- **Implement proper error boundaries** around providers
- **Test context providers** in isolation
- **Use context for configuration** that rarely changes
- **Avoid context for derived state** - compute in components instead

---

**Next up**: We'll explore `useMemo` and learn how to optimize expensive calculations and prevent unnecessary re-renders! 🚀