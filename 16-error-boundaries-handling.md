# 16. Error Boundaries & Error Handling 🛡️

> "Errors are not failures, they're learning opportunities. In React, Error Boundaries help us learn gracefully." - React Philosophy

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What Error Boundaries are and how they work
- How to create and implement Error Boundaries
- Different error handling strategies in React
- Best practices for error reporting and recovery
- How to handle async errors and promise rejections
- Testing error scenarios
- Production error monitoring

## 🔍 What are Error Boundaries?

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

### Key Characteristics

- **Catch errors during rendering**
- **Catch errors in lifecycle methods**
- **Catch errors in constructors**
- **Display fallback UI**
- **Log error information**
- **Only work in class components** (for now)

### What Error Boundaries DON'T Catch

- Event handlers
- Asynchronous code (setTimeout, promises)
- Errors during server-side rendering
- Errors thrown in the error boundary itself

## 🏗️ Creating Error Boundaries

### Basic Error Boundary

```jsx
// ✅ Basic Error Boundary class component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <h2>🚨 Something went wrong!</h2>
          <p>We're sorry, but something unexpected happened.</p>
          
          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details (Development Only)</summary>
              <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
              <p><strong>Stack Trace:</strong></p>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <MainContent />
      <Footer />
    </ErrorBoundary>
  );
}
```

### Advanced Error Boundary with Hooks Support

```jsx
// ✅ Advanced Error Boundary with more features
class AdvancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    const { onError, enableLogging = true } = this.props;
    
    // Generate unique error ID
    const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      eventId
    });
    
    // Custom error handler
    if (onError) {
      onError(error, errorInfo, eventId);
    }
    
    // Log to console in development
    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Event ID:', eventId);
      console.groupEnd();
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, eventId);
    }
  }
  
  logErrorToService = (error, errorInfo, eventId) => {
    // Example: Send to error monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      eventId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Send to your error monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });
    
    console.log('Would send to error service:', errorData);
  };
  
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };
  
  handleReload = () => {
    window.location.reload();
  };
  
  render() {
    const { fallback: Fallback, children } = this.props;
    const { hasError, error, errorInfo, eventId } = this.state;
    
    if (hasError) {
      // Use custom fallback component if provided
      if (Fallback) {
        return (
          <Fallback 
            error={error}
            errorInfo={errorInfo}
            eventId={eventId}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">🚨</div>
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry, but an unexpected error occurred.</p>
            
            {eventId && (
              <p className="error-id">
                Error ID: <code>{eventId}</code>
              </p>
            )}
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>
            
            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>🔍 Error Details (Development)</summary>
                <div className="error-content">
                  <h3>Error Message:</h3>
                  <pre>{error?.toString()}</pre>
                  
                  <h3>Component Stack:</h3>
                  <pre>{errorInfo?.componentStack}</pre>
                  
                  <h3>Error Stack:</h3>
                  <pre>{error?.stack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }
    
    return children;
  }
}

// Custom fallback component
function CustomErrorFallback({ error, errorInfo, eventId, onRetry, onReload }) {
  return (
    <div className="custom-error-fallback">
      <h2>🎭 Custom Error Handler</h2>
      <p>Something unexpected happened in our application.</p>
      
      {eventId && (
        <div className="error-reference">
          <strong>Reference ID:</strong> {eventId}
        </div>
      )}
      
      <div className="error-actions">
        <button onClick={onRetry}>🔄 Try Again</button>
        <button onClick={onReload}>🔃 Reload Page</button>
        <button onClick={() => window.history.back()}>⬅️ Go Back</button>
      </div>
    </div>
  );
}

// Usage with custom fallback
function App() {
  const handleError = (error, errorInfo, eventId) => {
    // Custom error handling logic
    console.log('Custom error handler called:', { error, errorInfo, eventId });
    
    // Send to analytics
    // analytics.track('Error Occurred', { eventId, errorMessage: error.message });
  };
  
  return (
    <AdvancedErrorBoundary 
      fallback={CustomErrorFallback}
      onError={handleError}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </AdvancedErrorBoundary>
  );
}
```

## 🎣 Error Boundary Hook (Custom Implementation)

Since Error Boundaries only work with class components, here's a custom hook approach:

```jsx
// ✅ Custom hook for error handling
function useErrorHandler() {
  const [error, setError] = useState(null);
  
  const resetError = useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = useCallback((error, errorInfo = {}) => {
    console.error('Error captured by useErrorHandler:', error);
    
    setError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...errorInfo
    });
    
    // Log to external service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }, []);
  
  // Automatically capture unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      captureError(new Error(event.reason), {
        type: 'unhandledRejection',
        reason: event.reason
      });
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);
  
  return {
    error,
    captureError,
    resetError,
    hasError: !!error
  };
}

// Error boundary component using the hook
function ErrorBoundaryWithHook({ children, fallback: Fallback }) {
  const { error, resetError, hasError } = useErrorHandler();
  
  if (hasError) {
    if (Fallback) {
      return <Fallback error={error} onRetry={resetError} />;
    }
    
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={resetError}>Try Again</button>
      </div>
    );
  }
  
  return children;
}

// Usage in functional components
function MyComponent() {
  const { captureError } = useErrorHandler();
  
  const handleAsyncOperation = async () => {
    try {
      const result = await riskyAsyncOperation();
      // Handle success
    } catch (error) {
      captureError(error, { context: 'async operation' });
    }
  };
  
  return (
    <div>
      <button onClick={handleAsyncOperation}>
        Perform Risky Operation
      </button>
    </div>
  );
}
```

## 🔄 Handling Different Types of Errors

### 1. Async Errors and Promise Rejections

```jsx
// ✅ Async error handling component
function AsyncErrorHandler({ children }) {
  const [asyncError, setAsyncError] = useState(null);
  
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setAsyncError({
        type: 'unhandledRejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        timestamp: new Date().toISOString()
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    };
    
    // Handle general JavaScript errors
    const handleError = (event) => {
      console.error('JavaScript error:', event.error);
      setAsyncError({
        type: 'javascriptError',
        message: event.error?.message || 'JavaScript error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      });
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (asyncError) {
    return (
      <div className="async-error">
        <h3>🚨 Async Error Detected</h3>
        <p><strong>Type:</strong> {asyncError.type}</p>
        <p><strong>Message:</strong> {asyncError.message}</p>
        <p><strong>Time:</strong> {asyncError.timestamp}</p>
        
        <button onClick={() => setAsyncError(null)}>
          Dismiss
        </button>
        
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    );
  }
  
  return children;
}
```

### 2. Network Error Handling

```jsx
// ✅ Network error handling hook
function useNetworkErrorHandler() {
  const [networkError, setNetworkError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError({
        type: 'offline',
        message: 'You are currently offline. Please check your internet connection.'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const handleNetworkError = useCallback((error, context = {}) => {
    let errorMessage = 'Network error occurred';
    let errorType = 'network';
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to server';
      errorType = 'connection';
    } else if (error.status) {
      errorMessage = `Server error: ${error.status} ${error.statusText}`;
      errorType = 'server';
    }
    
    setNetworkError({
      type: errorType,
      message: errorMessage,
      status: error.status,
      context,
      timestamp: new Date().toISOString()
    });
  }, []);
  
  const clearNetworkError = useCallback(() => {
    setNetworkError(null);
  }, []);
  
  return {
    networkError,
    isOnline,
    handleNetworkError,
    clearNetworkError
  };
}

// Network-aware fetch wrapper
function useNetworkFetch() {
  const { handleNetworkError, isOnline } = useNetworkErrorHandler();
  
  const networkFetch = useCallback(async (url, options = {}) => {
    if (!isOnline) {
      throw new Error('No internet connection');
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        throw error;
      }
      
      return response;
    } catch (error) {
      handleNetworkError(error, { url, options });
      throw error;
    }
  }, [isOnline, handleNetworkError]);
  
  return networkFetch;
}

// Usage
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const networkFetch = useNetworkFetch();
  const { networkError, clearNetworkError } = useNetworkErrorHandler();
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await networkFetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  if (networkError) {
    return (
      <div className="network-error">
        <h3>🌐 Network Error</h3>
        <p>{networkError.message}</p>
        
        <div className="error-actions">
          <button onClick={fetchData}>Retry</button>
          <button onClick={clearNetworkError}>Dismiss</button>
        </div>
      </div>
    );
  }
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

## 🎯 Mini-Challenge: Build a Comprehensive Error System

### Challenge: Create an Error Management System

Build a complete error handling system that includes:
- Error boundaries for different app sections
- Async error handling
- Error reporting and logging
- User-friendly error recovery

```jsx
// Your task: Implement this error management system
function App() {
  return (
    <ErrorProvider>
      <div className="app">
        <ErrorBoundary name="header">
          <Header />
        </ErrorBoundary>
        
        <ErrorBoundary name="main" fallback={MainErrorFallback}>
          <main>
            <ErrorBoundary name="sidebar">
              <Sidebar />
            </ErrorBoundary>
            
            <ErrorBoundary name="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </ErrorBoundary>
        
        <ErrorBoundary name="footer">
          <Footer />
        </ErrorBoundary>
        
        <ErrorNotifications />
      </div>
    </ErrorProvider>
  );
}

// Components that might throw errors
function BuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Intentional error for testing!');
  }
  
  return (
    <div>
      <h3>Buggy Component</h3>
      <button onClick={() => setShouldThrow(true)}>
        Throw Error
      </button>
    </div>
  );
}

function AsyncBuggyComponent() {
  const handleAsyncError = async () => {
    // This should be caught by async error handlers
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Async error!')), 1000);
    });
  };
  
  return (
    <div>
      <h3>Async Buggy Component</h3>
      <button onClick={handleAsyncError}>
        Trigger Async Error
      </button>
    </div>
  );
}
```

### Solution: Comprehensive Error Management System

```jsx
// ✅ Error context for global error management
const ErrorContext = createContext();

function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);
  const [errorStats, setErrorStats] = useState({
    total: 0,
    byType: {},
    byComponent: {}
  });
  
  const addError = useCallback((error, context = {}) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorEntry = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      dismissed: false
    };
    
    setErrors(prev => [errorEntry, ...prev].slice(0, 50)); // Keep last 50 errors
    
    // Update statistics
    setErrorStats(prev => ({
      total: prev.total + 1,
      byType: {
        ...prev.byType,
        [context.type || 'unknown']: (prev.byType[context.type || 'unknown'] || 0) + 1
      },
      byComponent: {
        ...prev.byComponent,
        [context.component || 'unknown']: (prev.byComponent[context.component || 'unknown'] || 0) + 1
      }
    }));
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(errorEntry);
    }
    
    return errorId;
  }, []);
  
  const dismissError = useCallback((errorId) => {
    setErrors(prev => prev.map(error => 
      error.id === errorId ? { ...error, dismissed: true } : error
    ));
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);
  
  const logErrorToService = useCallback((errorEntry) => {
    // Mock error logging service
    console.log('📊 Logging error to service:', errorEntry);
    
    // In real app, send to your error monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorEntry)
    // });
  }, []);
  
  const value = useMemo(() => ({
    errors: errors.filter(error => !error.dismissed),
    allErrors: errors,
    errorStats,
    addError,
    dismissError,
    clearErrors
  }), [errors, errorStats, addError, dismissError, clearErrors]);
  
  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

// Custom hook to use error context
function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within ErrorProvider');
  }
  return context;
}

// Enhanced Error Boundary with context integration
class ContextualErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    const { name, onError } = this.props;
    
    // Add error to global context
    if (this.context?.addError) {
      this.context.addError(error, {
        type: 'boundary',
        component: name,
        componentStack: errorInfo.componentStack
      });
    }
    
    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }
  
  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback, name } = this.props;
    
    if (hasError) {
      if (Fallback) {
        return (
          <Fallback 
            error={error}
            componentName={name}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        );
      }
      
      return (
        <div className="error-boundary-fallback">
          <h3>⚠️ Error in {name}</h3>
          <p>Something went wrong in this section.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return children;
  }
}

ContextualErrorBoundary.contextType = ErrorContext;

// Error notification component
function ErrorNotifications() {
  const { errors, dismissError } = useErrorContext();
  
  if (errors.length === 0) return null;
  
  return (
    <div className="error-notifications">
      {errors.slice(0, 3).map(error => (
        <div key={error.id} className="error-notification">
          <div className="error-content">
            <strong>Error:</strong> {error.message}
            {error.context.component && (
              <div className="error-context">
                Component: {error.context.component}
              </div>
            )}
          </div>
          
          <button 
            className="error-dismiss"
            onClick={() => dismissError(error.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// Error statistics component
function ErrorStats() {
  const { errorStats, allErrors } = useErrorContext();
  
  return (
    <div className="error-stats">
      <h3>📊 Error Statistics</h3>
      
      <div className="stat-item">
        <strong>Total Errors:</strong> {errorStats.total}
      </div>
      
      <div className="stat-section">
        <h4>By Type:</h4>
        {Object.entries(errorStats.byType).map(([type, count]) => (
          <div key={type} className="stat-item">
            {type}: {count}
          </div>
        ))}
      </div>
      
      <div className="stat-section">
        <h4>By Component:</h4>
        {Object.entries(errorStats.byComponent).map(([component, count]) => (
          <div key={component} className="stat-item">
            {component}: {count}
          </div>
        ))}
      </div>
      
      <div className="stat-section">
        <h4>Recent Errors:</h4>
        {allErrors.slice(0, 5).map(error => (
          <div key={error.id} className="recent-error">
            <div>{error.message}</div>
            <small>{new Date(error.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// Custom fallback components
function MainErrorFallback({ error, componentName, onRetry }) {
  return (
    <div className="main-error-fallback">
      <h2>🚨 Main Content Error</h2>
      <p>The main content area encountered an error.</p>
      
      <div className="error-details">
        <strong>Component:</strong> {componentName}<br />
        <strong>Error:</strong> {error?.message}
      </div>
      
      <div className="error-actions">
        <button onClick={onRetry}>🔄 Retry</button>
        <button onClick={() => window.location.href = '/'}>🏠 Go Home</button>
      </div>
    </div>
  );
}

// Async error handler component
function AsyncErrorHandler({ children }) {
  const { addError } = useErrorContext();
  
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      addError(new Error(event.reason), {
        type: 'unhandledRejection',
        component: 'global'
      });
      event.preventDefault();
    };
    
    const handleError = (event) => {
      addError(event.error, {
        type: 'javascript',
        component: 'global',
        filename: event.filename,
        lineno: event.lineno
      });
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [addError]);
  
  return children;
}

// Main app with comprehensive error handling
function App() {
  return (
    <ErrorProvider>
      <AsyncErrorHandler>
        <div className="app">
          <ContextualErrorBoundary name="header">
            <Header />
          </ContextualErrorBoundary>
          
          <ContextualErrorBoundary name="main" fallback={MainErrorFallback}>
            <main className="main-content">
              <ContextualErrorBoundary name="sidebar">
                <Sidebar />
              </ContextualErrorBoundary>
              
              <ContextualErrorBoundary name="content">
                <div className="content">
                  <BuggyComponent />
                  <AsyncBuggyComponent />
                  <ErrorStats />
                </div>
              </ContextualErrorBoundary>
            </main>
          </ContextualErrorBoundary>
          
          <ContextualErrorBoundary name="footer">
            <Footer />
          </ContextualErrorBoundary>
          
          <ErrorNotifications />
        </div>
      </AsyncErrorHandler>
    </ErrorProvider>
  );
}

// Test components
function Header() {
  return <header>📱 My App Header</header>;
}

function Sidebar() {
  return (
    <aside>
      <h3>Sidebar</h3>
      <nav>
        <a href="/">Home</a>
        <a href="/profile">Profile</a>
      </nav>
    </aside>
  );
}

function Footer() {
  return <footer>© 2024 My App</footer>;
}

function BuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('Intentional boundary error for testing!');
  }
  
  return (
    <div className="buggy-component">
      <h3>🐛 Boundary Error Test</h3>
      <button onClick={() => setShouldThrow(true)}>
        Throw Boundary Error
      </button>
    </div>
  );
}

function AsyncBuggyComponent() {
  const { addError } = useErrorContext();
  
  const handleAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Intentional async error!')), 1000);
      });
    } catch (error) {
      addError(error, {
        type: 'async',
        component: 'AsyncBuggyComponent'
      });
    }
  };
  
  const handleUnhandledAsyncError = () => {
    // This will be caught by the global handler
    setTimeout(() => {
      throw new Error('Unhandled async error!');
    }, 1000);
  };
  
  return (
    <div className="async-buggy-component">
      <h3>⚡ Async Error Test</h3>
      <button onClick={handleAsyncError}>
        Handled Async Error
      </button>
      <button onClick={handleUnhandledAsyncError}>
        Unhandled Async Error
      </button>
    </div>
  );
}
```

## 🧪 Testing Error Scenarios

### Testing Error Boundaries

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws on command
function ThrowError({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('should catch and display error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
  
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
  
  it('should allow retry after error', async () => {
    const user = userEvent.setup();
    
    function TestComponent() {
      const [shouldThrow, setShouldThrow] = useState(true);
      
      return (
        <ErrorBoundary>
          <button onClick={() => setShouldThrow(false)}>Fix Error</button>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    }
    
    render(<TestComponent />);
    
    // Error should be displayed
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Click retry
    await user.click(screen.getByText('Try Again'));
    
    // Should show the component again
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

## 🎯 Best Practices

### 1. Error Boundary Placement

```jsx
// ✅ Strategic error boundary placement
function App() {
  return (
    <ErrorBoundary name="app"> {/* Top-level boundary */}
      <Header />
      
      <ErrorBoundary name="main"> {/* Section-level boundary */}
        <Router>
          <Routes>
            <Route path="/" element={
              <ErrorBoundary name="home"> {/* Page-level boundary */}
                <Home />
              </ErrorBoundary>
            } />
            
            <Route path="/profile" element={
              <ErrorBoundary name="profile">
                <Profile />
              </ErrorBoundary>
            } />
          </Routes>
        </Router>
      </ErrorBoundary>
      
      <Footer />
    </ErrorBoundary>
  );
}
```

### 2. Error Logging and Monitoring

```jsx
// ✅ Production error logging
function logErrorToService(error, errorInfo, context = {}) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo?.componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: getCurrentUserId(), // If available
    sessionId: getSessionId(), // If available
    buildVersion: process.env.REACT_APP_VERSION,
    ...context
  };
  
  // Send to error monitoring service (Sentry, LogRocket, etc.)
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      extra: errorData
    });
  }
  
  // Send to custom analytics
  if (window.analytics) {
    window.analytics.track('Error Occurred', errorData);
  }
  
  // Send to custom error endpoint
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorData)
  }).catch(err => {
    console.error('Failed to log error:', err);
  });
}
```

### 3. User-Friendly Error Messages

```jsx
// ✅ Context-aware error messages
function getErrorMessage(error, context) {
  const errorMessages = {
    ChunkLoadError: 'The application has been updated. Please refresh the page.',
    NetworkError: 'Please check your internet connection and try again.',
    AuthenticationError: 'Your session has expired. Please log in again.',
    ValidationError: 'Please check your input and try again.',
    PermissionError: 'You don\'t have permission to perform this action.',
    default: 'Something unexpected happened. Please try again.'
  };
  
  // Determine error type
  if (error.name === 'ChunkLoadError') return errorMessages.ChunkLoadError;
  if (error.message.includes('fetch')) return errorMessages.NetworkError;
  if (error.status === 401) return errorMessages.AuthenticationError;
  if (error.status === 403) return errorMessages.PermissionError;
  if (context.type === 'validation') return errorMessages.ValidationError;
  
  return errorMessages.default;
}
```

---

**Next up**: We'll explore testing strategies and learn how to write comprehensive tests for React applications! 🧪