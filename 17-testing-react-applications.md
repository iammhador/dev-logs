# 17. Testing React Applications 🧪

> "Testing is not about finding bugs, it's about building confidence in your code." - Kent C. Dodds

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- Different types of testing in React (Unit, Integration, E2E)
- Setting up and using React Testing Library
- Testing components, hooks, and user interactions
- Mocking dependencies and external services
- Testing async operations and error scenarios
- Best practices for maintainable tests
- Performance testing and accessibility testing

## 🔍 Types of Testing

### Testing Pyramid

```
        /\     E2E Tests
       /  \    (Few, Slow, Expensive)
      /____\   
     /      \  Integration Tests
    /        \ (Some, Medium Speed)
   /__________\
  /            \ Unit Tests
 /              \ (Many, Fast, Cheap)
/________________\
```

### 1. Unit Tests
- Test individual components in isolation
- Fast and focused
- Easy to debug
- High code coverage

### 2. Integration Tests
- Test component interactions
- Test with real dependencies
- More realistic scenarios
- Catch integration issues

### 3. End-to-End (E2E) Tests
- Test complete user workflows
- Test in real browser environment
- Catch system-level issues
- Slower but comprehensive

## 🛠️ Setting Up Testing Environment

### React Testing Library Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# For custom render utilities
npm install --save-dev @testing-library/react-hooks
```

### Test Setup File

```javascript
// src/setupTests.js
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
```

### Custom Render Utility

```jsx
// src/test-utils.js
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Create a custom render function that includes providers
function customRender(ui, options = {}) {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
```

## 🧩 Testing Components

### Basic Component Testing

```jsx
// Button.jsx
function Button({ children, onClick, disabled = false, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
      data-testid="button"
    >
      {children}
    </button>
  );
}

export default Button;
```

```jsx
// Button.test.jsx
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('applies correct CSS class for variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
  
  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Testing Forms and User Input

```jsx
// LoginForm.jsx
import { useState } from 'react';

function LoginForm({ onSubmit, isLoading = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ email, password });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert" className="error">
            {errors.email}
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <div id="password-error" role="alert" className="error">
            {errors.password}
          </div>
        )}
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default LoginForm;
```

```jsx
// LoginForm.test.jsx
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  it('renders form fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /email is required/i })).toBeInTheDocument();
    expect(screen.getByRole('alert', { name: /password is required/i })).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /email is invalid/i })).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('shows validation error for short password', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByRole('alert', { name: /password must be at least 6 characters/i })).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('disables submit button when loading', () => {
    render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
  
  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    // Trigger validation errors
    await user.click(screen.getByRole('button', { name: /login/i }));
    expect(screen.getByRole('alert', { name: /email is required/i })).toBeInTheDocument();
    
    // Start typing to clear error
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    await waitFor(() => {
      expect(screen.queryByRole('alert', { name: /email is required/i })).not.toBeInTheDocument();
    });
  });
});
```

## 🪝 Testing Custom Hooks

### Testing Hooks with renderHook

```jsx
// useCounter.js
import { useState, useCallback } from 'react';

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
  
  const setValue = useCallback((value) => {
    setCount(value);
  }, []);
  
  return {
    count,
    increment,
    decrement,
    reset,
    setValue
  };
}

export default useCounter;
```

```jsx
// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });
  
  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });
  
  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
  
  it('resets to initial value', () => {
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
  
  it('sets specific value', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.setValue(42);
    });
    
    expect(result.current.count).toBe(42);
  });
  
  it('updates reset when initial value changes', () => {
    let initialValue = 0;
    const { result, rerender } = renderHook(() => useCounter(initialValue));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
    
    // Change initial value and rerender
    initialValue = 10;
    rerender();
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

### Testing Async Hooks

```jsx
// useApi.js
import { useState, useEffect, useCallback } from 'react';

function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData, url]);
  
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch
  };
}

export default useApi;
```

```jsx
// useApi.test.js
import { renderHook, waitFor } from '@testing-library/react';
import useApi from './useApi';

// Mock fetch
global.fetch = jest.fn();

describe('useApi', () => {
  beforeEach(() => {
    fetch.mockClear();
  });
  
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });
    
    const { result } = renderHook(() => useApi('/api/test'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(fetch).toHaveBeenCalledWith('/api/test', {});
  });
  
  it('handles fetch error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useApi('/api/test'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
  
  it('handles HTTP error status', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    
    const { result } = renderHook(() => useApi('/api/test'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('HTTP 404: Not Found');
  });
  
  it('refetches data when refetch is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    
    const { result } = renderHook(() => useApi('/api/test'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Call refetch
    result.current.refetch();
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
  
  it('does not fetch when url is null', () => {
    renderHook(() => useApi(null));
    
    expect(fetch).not.toHaveBeenCalled();
  });
});
```

## 🎭 Mocking Dependencies

### Mocking External Libraries

```jsx
// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' }),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => '2024-01-01'),
  isValid: jest.fn(() => true),
}));
```

### Mocking Custom Hooks

```jsx
// Mock custom hook
jest.mock('../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ProtectedComponent', () => {
  it('renders when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'John' },
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
    });
    
    render(<ProtectedComponent />);
    
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  });
  
  it('shows login prompt when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    
    render(<ProtectedComponent />);
    
    expect(screen.getByText('Please log in')).toBeInTheDocument();
  });
});
```

### Mocking API Calls with MSW

```javascript
// src/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  // Mock GET request
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ])
    );
  }),
  
  // Mock POST request
  rest.post('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ id: 3, ...req.body })
    );
  }),
  
  // Mock error response
  rest.get('/api/error', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ message: 'Internal server error' })
    );
  }),
];
```

```javascript
// src/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```javascript
// src/setupTests.js
import { server } from './mocks/server';

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

## 🔄 Testing Async Operations

### Testing Components with Async Data

```jsx
// UserList.jsx
import { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
```

```jsx
// UserList.test.jsx
import { render, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { rest } from 'msw';
import UserList from './UserList';

describe('UserList', () => {
  it('displays loading state initially', () => {
    render(<UserList />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });
  
  it('displays users after successful fetch', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe - john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith - jane@example.com')).toBeInTheDocument();
  });
  
  it('displays error message when fetch fails', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'Server error' })
        );
      })
    );
    
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch users')).toBeInTheDocument();
    });
  });
  
  it('does not show loading state after data is loaded', async () => {
    render(<UserList />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
    });
  });
});
```

### Testing with React Query

```jsx
// UserListWithQuery.jsx
import { useQuery } from '@tanstack/react-query';

function UserListWithQuery() {
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });
  
  if (isLoading) return <div>Loading users...</div>;
  if (error) {
    return (
      <div>
        <div>Error: {error.message}</div>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => refetch()}>Refresh</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserListWithQuery;
```

```jsx
// UserListWithQuery.test.jsx
import { render, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { rest } from 'msw';
import userEvent from '@testing-library/user-event';
import UserListWithQuery from './UserListWithQuery';

describe('UserListWithQuery', () => {
  it('displays users and allows refresh', async () => {
    const user = userEvent.setup();
    
    render(<UserListWithQuery />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
    
    expect(screen.getByText('John Doe - john@example.com')).toBeInTheDocument();
    
    // Test refresh functionality
    await user.click(screen.getByText('Refresh'));
    
    // Should still show users after refresh
    await waitFor(() => {
      expect(screen.getByText('John Doe - john@example.com')).toBeInTheDocument();
    });
  });
  
  it('shows retry button on error', async () => {
    const user = userEvent.setup();
    
    // Mock error response
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'Server error' })
        );
      })
    );
    
    render(<UserListWithQuery />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
    
    expect(screen.getByText('Retry')).toBeInTheDocument();
    
    // Reset to successful response
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([
            { id: 1, name: 'John Doe', email: 'john@example.com' },
          ])
        );
      })
    );
    
    // Click retry
    await user.click(screen.getByText('Retry'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe - john@example.com')).toBeInTheDocument();
    });
  });
});
```

## 🎯 Mini-Challenge: Build a Comprehensive Test Suite

### Challenge: Test a Todo Application

Create comprehensive tests for a todo application with the following features:
- Add new todos
- Mark todos as complete
- Delete todos
- Filter todos (all, active, completed)
- Persist todos to localStorage

```jsx
// TodoApp.jsx - Your task: Write comprehensive tests for this component
import { useState, useEffect } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newTodo, setNewTodo] = useState('');
  
  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);
  
  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  const addTodo = () => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos(prev => [...prev, todo]);
      setNewTodo('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };
  
  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;
  
  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      
      <div className="add-todo">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
          aria-label="New todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({todos.length})
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active ({activeCount})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </button>
      </div>
      
      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <span className="todo-text">{todo.text}</span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              aria-label={`Delete "${todo.text}"`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      
      {completedCount > 0 && (
        <button onClick={clearCompleted} className="clear-completed">
          Clear Completed ({completedCount})
        </button>
      )}
      
      {todos.length === 0 && (
        <p className="empty-state">No todos yet. Add one above!</p>
      )}
    </div>
  );
}

export default TodoApp;
```

### Solution: Comprehensive Todo App Tests

```jsx
// TodoApp.test.jsx
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import TodoApp from './TodoApp';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('TodoApp', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });
  
  describe('Initial Render', () => {
    it('renders the todo app with empty state', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      expect(screen.getByText('Todo App')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
      expect(screen.getByText('All (0)')).toBeInTheDocument();
      expect(screen.getByText('Active (0)')).toBeInTheDocument();
      expect(screen.getByText('Completed (0)')).toBeInTheDocument();
    });
    
    it('loads todos from localStorage on mount', () => {
      const savedTodos = [
        { id: 1, text: 'Test todo', completed: false, createdAt: '2024-01-01' },
        { id: 2, text: 'Completed todo', completed: true, createdAt: '2024-01-02' }
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTodos));
      
      render(<TodoApp />);
      
      expect(screen.getByText('Test todo')).toBeInTheDocument();
      expect(screen.getByText('Completed todo')).toBeInTheDocument();
      expect(screen.getByText('All (2)')).toBeInTheDocument();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
  });
  
  describe('Adding Todos', () => {
    it('adds a new todo when clicking Add button', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      const addButton = screen.getByText('Add');
      
      await user.type(input, 'New todo item');
      await user.click(addButton);
      
      expect(screen.getByText('New todo item')).toBeInTheDocument();
      expect(screen.getByText('All (1)')).toBeInTheDocument();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });
    
    it('adds a new todo when pressing Enter', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'New todo item{enter}');
      
      expect(screen.getByText('New todo item')).toBeInTheDocument();
      expect(input).toHaveValue('');
    });
    
    it('does not add empty todos', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const addButton = screen.getByText('Add');
      
      await user.click(addButton);
      
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
      expect(screen.getByText('All (0)')).toBeInTheDocument();
    });
    
    it('trims whitespace from todo text', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, '  Trimmed todo  ');
      await user.click(screen.getByText('Add'));
      
      expect(screen.getByText('Trimmed todo')).toBeInTheDocument();
    });
  });
  
  describe('Todo Interactions', () => {
    beforeEach(() => {
      const savedTodos = [
        { id: 1, text: 'Active todo', completed: false, createdAt: '2024-01-01' },
        { id: 2, text: 'Completed todo', completed: true, createdAt: '2024-01-02' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTodos));
    });
    
    it('toggles todo completion status', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const activeCheckbox = screen.getByLabelText('Mark "Active todo" as complete');
      const completedCheckbox = screen.getByLabelText('Mark "Completed todo" as incomplete');
      
      expect(activeCheckbox).not.toBeChecked();
      expect(completedCheckbox).toBeChecked();
      
      await user.click(activeCheckbox);
      
      expect(activeCheckbox).toBeChecked();
      expect(screen.getByText('Active (0)')).toBeInTheDocument();
      expect(screen.getByText('Completed (2)')).toBeInTheDocument();
      
      await user.click(completedCheckbox);
      
      expect(completedCheckbox).not.toBeChecked();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
    
    it('deletes todos', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const deleteButton = screen.getByLabelText('Delete "Active todo"');
      
      await user.click(deleteButton);
      
      expect(screen.queryByText('Active todo')).not.toBeInTheDocument();
      expect(screen.getByText('Completed todo')).toBeInTheDocument();
      expect(screen.getByText('All (1)')).toBeInTheDocument();
      expect(screen.getByText('Active (0)')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
    
    it('clears completed todos', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const clearButton = screen.getByText('Clear Completed (1)');
      
      await user.click(clearButton);
      
      expect(screen.queryByText('Completed todo')).not.toBeInTheDocument();
      expect(screen.getByText('Active todo')).toBeInTheDocument();
      expect(screen.getByText('All (1)')).toBeInTheDocument();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (0)')).toBeInTheDocument();
      expect(screen.queryByText('Clear Completed')).not.toBeInTheDocument();
    });
  });
  
  describe('Filtering', () => {
    beforeEach(() => {
      const savedTodos = [
        { id: 1, text: 'Active todo 1', completed: false, createdAt: '2024-01-01' },
        { id: 2, text: 'Active todo 2', completed: false, createdAt: '2024-01-02' },
        { id: 3, text: 'Completed todo 1', completed: true, createdAt: '2024-01-03' },
        { id: 4, text: 'Completed todo 2', completed: true, createdAt: '2024-01-04' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTodos));
    });
    
    it('shows all todos by default', () => {
      render(<TodoApp />);
      
      expect(screen.getByText('Active todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active todo 2')).toBeInTheDocument();
      expect(screen.getByText('Completed todo 1')).toBeInTheDocument();
      expect(screen.getByText('Completed todo 2')).toBeInTheDocument();
      
      const allButton = screen.getByText('All (4)');
      expect(allButton).toHaveClass('active');
    });
    
    it('filters to show only active todos', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      await user.click(screen.getByText('Active (2)'));
      
      expect(screen.getByText('Active todo 1')).toBeInTheDocument();
      expect(screen.getByText('Active todo 2')).toBeInTheDocument();
      expect(screen.queryByText('Completed todo 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Completed todo 2')).not.toBeInTheDocument();
      
      const activeButton = screen.getByText('Active (2)');
      expect(activeButton).toHaveClass('active');
    });
    
    it('filters to show only completed todos', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      await user.click(screen.getByText('Completed (2)'));
      
      expect(screen.queryByText('Active todo 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Active todo 2')).not.toBeInTheDocument();
      expect(screen.getByText('Completed todo 1')).toBeInTheDocument();
      expect(screen.getByText('Completed todo 2')).toBeInTheDocument();
      
      const completedButton = screen.getByText('Completed (2)');
      expect(completedButton).toHaveClass('active');
    });
    
    it('updates filter counts when todos change', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      // Toggle an active todo to completed
      await user.click(screen.getByLabelText('Mark "Active todo 1" as complete'));
      
      expect(screen.getByText('All (4)')).toBeInTheDocument();
      expect(screen.getByText('Active (1)')).toBeInTheDocument();
      expect(screen.getByText('Completed (3)')).toBeInTheDocument();
    });
  });
  
  describe('LocalStorage Integration', () => {
    it('saves todos to localStorage when todos change', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, 'New todo');
      await user.click(screen.getByText('Add'));
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'todos',
          expect.stringContaining('New todo')
        );
      });
    });
    
    it('handles invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      // Should not throw an error
      expect(() => render(<TodoApp />)).not.toThrow();
      
      expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
    });
  });
  
  describe('Accessibility', () => {
    beforeEach(() => {
      const savedTodos = [
        { id: 1, text: 'Test todo', completed: false, createdAt: '2024-01-01' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTodos));
    });
    
    it('has proper ARIA labels for form controls', () => {
      render(<TodoApp />);
      
      expect(screen.getByLabelText('New todo')).toBeInTheDocument();
      expect(screen.getByLabelText('Mark "Test todo" as complete')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete "Test todo"')).toBeInTheDocument();
    });
    
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<TodoApp />);
      
      const input = screen.getByLabelText('New todo');
      
      // Focus should start on input
      await user.tab();
      expect(input).toHaveFocus();
      
      // Tab to Add button
      await user.tab();
      expect(screen.getByText('Add')).toHaveFocus();
      
      // Tab to filter buttons
      await user.tab();
      expect(screen.getByText('All (1)')).toHaveFocus();
    });
  });
  
  describe('Edge Cases', () => {
    it('handles very long todo text', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      const longText = 'A'.repeat(1000);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      await user.type(input, longText);
      await user.click(screen.getByText('Add'));
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
    
    it('handles rapid todo additions', async () => {
      const user = userEvent.setup();
      localStorageMock.getItem.mockReturnValue(null);
      
      render(<TodoApp />);
      
      const input = screen.getByPlaceholderText('What needs to be done?');
      
      // Add multiple todos quickly
      for (let i = 1; i <= 5; i++) {
        await user.type(input, `Todo ${i}`);
        await user.click(screen.getByText('Add'));
      }
      
      expect(screen.getByText('All (5)')).toBeInTheDocument();
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 5')).toBeInTheDocument();
    });
  });
});
```

## 🎯 Best Practices for Testing

### 1. Test Structure and Organization

```jsx
// ✅ Good test structure
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset mocks, clear localStorage, etc.
  });
  
  describe('Rendering', () => {
    it('renders with default props', () => {});
    it('renders with custom props', () => {});
  });
  
  describe('User Interactions', () => {
    it('handles click events', () => {});
    it('handles form submission', () => {});
  });
  
  describe('Edge Cases', () => {
    it('handles error states', () => {});
    it('handles loading states', () => {});
  });
});
```

### 2. Query Priority

```jsx
// ✅ Query priority (in order of preference)

// 1. Accessible to everyone (screen readers, etc.)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);
screen.getByPlaceholderText(/search/i);
screen.getByText(/hello world/i);

// 2. Semantic queries
screen.getByAltText(/profile picture/i);
screen.getByTitle(/close/i);

// 3. Test IDs (last resort)
screen.getByTestId('submit-button');
```

### 3. Async Testing Patterns

```jsx
// ✅ Async testing best practices

// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Use findBy for elements that will appear
const element = await screen.findByText('Async content');

// Use act for state updates
act(() => {
  result.current.updateState();
});

// Set reasonable timeouts
await waitFor(
  () => expect(screen.getByText('Slow content')).toBeInTheDocument(),
  { timeout: 5000 }
);
```

### 4. Mock Management

```jsx
// ✅ Mock management best practices

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Use specific mocks for specific tests
it('handles API error', () => {
  mockApiCall.mockRejectedValueOnce(new Error('API Error'));
  // Test error handling
});

// Restore original implementations
afterAll(() => {
  jest.restoreAllMocks();
});
```

---

**Next up**: We'll explore performance optimization techniques and learn how to build fast, efficient React applications! ⚡