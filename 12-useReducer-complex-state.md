# useReducer: Complex State Management

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- What `useReducer` is and when to use it over `useState`
- How to design reducer functions and action patterns
- State management patterns for complex applications
- Integration with Context for global state
- Performance optimization techniques
- Real-world state machine implementations

---

## 🧠 What is useReducer?

`useReducer` is a React Hook that provides an alternative to `useState` for managing **complex state logic**. It's particularly useful when:
- State has multiple sub-values
- Next state depends on the previous state
- State transitions are complex
- You need predictable state updates

### The Problem: Complex State with useState

```jsx
// ❌ Complex state management with useState becomes unwieldy
function ComplexForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitCount, setSubmitCount] = useState(0);
  
  // Multiple state updates scattered throughout
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);
    setErrors({});
    
    try {
      // Validation logic
      const newErrors = {};
      if (!firstName) newErrors.firstName = 'Required';
      if (!lastName) newErrors.lastName = 'Required';
      if (!email) newErrors.email = 'Required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords must match';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsValid(false);
        setIsSubmitting(false);
        return;
      }
      
      // Submit logic
      await submitForm({ firstName, lastName, email, password });
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      setIsValid(false);
      setTouched({});
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // More scattered state updates...
}
```

### The Solution: useReducer

```jsx
// ✅ Clean, predictable state management with useReducer
const initialState = {
  fields: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: false,
  submitCount: 0
};

function formReducer(state, action) {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.field]: action.value
        },
        errors: {
          ...state.errors,
          [action.field]: undefined // Clear error for this field
        }
      };
    
    case 'FIELD_BLUR':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };
    
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        submitCount: state.submitCount + 1,
        errors: {}
      };
    
    case 'SUBMIT_SUCCESS':
      return {
        ...initialState // Reset to initial state
      };
    
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errors: action.errors
      };
    
    case 'VALIDATION_RESULT':
      return {
        ...state,
        isValid: action.isValid,
        errors: {
          ...state.errors,
          ...action.errors
        }
      };
    
    default:
      return state;
  }
}

function CleanForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  const handleFieldChange = (field, value) => {
    dispatch({ type: 'FIELD_CHANGE', field, value });
  };
  
  const handleFieldBlur = (field) => {
    dispatch({ type: 'FIELD_BLUR', field });
  };
  
  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      // Validation
      const errors = validateForm(state.fields);
      if (Object.keys(errors).length > 0) {
        dispatch({ 
          type: 'VALIDATION_RESULT', 
          isValid: false, 
          errors 
        });
        return;
      }
      
      // Submit
      await submitForm(state.fields);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ 
        type: 'SUBMIT_ERROR', 
        errors: { submit: error.message } 
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields using state and dispatch */}
    </form>
  );
}
```

## 🔍 Deep Dive: useReducer Fundamentals

### Basic Syntax

```jsx
const [state, dispatch] = useReducer(reducer, initialState, init?);
```

- **reducer**: `(state, action) => newState`
- **initialState**: The initial state value
- **init**: Optional lazy initialization function
- **state**: Current state value
- **dispatch**: Function to trigger state updates

### Reducer Function Patterns

```jsx
// 🎯 Basic reducer pattern
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// 🎯 Reducer with payload
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now(),
            text: action.payload.text,
            completed: false,
            createdAt: new Date().toISOString()
          }
        ]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload.id)
      };
    
    case 'EDIT_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, text: action.payload.text }
            : todo
        )
      };
    
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload.filter
      };
    
    default:
      return state;
  }
}

// 🎯 Reducer with complex state updates
function shoppingCartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [
          ...state.items,
          { ...product, quantity: 1 }
        ]
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id
            ? { ...item, quantity }
            : item
        )
      };
    }
    
    case 'APPLY_DISCOUNT': {
      const { code, percentage } = action.payload;
      return {
        ...state,
        discount: {
          code,
          percentage,
          applied: true
        }
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        discount: null
      };
    
    default:
      return state;
  }
}
```

### Action Creators Pattern

```jsx
// 🎯 Action creators for better maintainability
const todoActions = {
  addTodo: (text) => ({
    type: 'ADD_TODO',
    payload: { text }
  }),
  
  toggleTodo: (id) => ({
    type: 'TOGGLE_TODO',
    payload: { id }
  }),
  
  deleteTodo: (id) => ({
    type: 'DELETE_TODO',
    payload: { id }
  }),
  
  editTodo: (id, text) => ({
    type: 'EDIT_TODO',
    payload: { id, text }
  }),
  
  clearCompleted: () => ({
    type: 'CLEAR_COMPLETED'
  }),
  
  setFilter: (filter) => ({
    type: 'SET_FILTER',
    payload: { filter }
  })
};

// 🎯 Usage with action creators
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  const addTodo = (text) => {
    dispatch(todoActions.addTodo(text));
  };
  
  const toggleTodo = (id) => {
    dispatch(todoActions.toggleTodo(id));
  };
  
  // ... rest of component
}
```

## 🚀 Real-World Patterns

### Pattern 1: State Machine with useReducer

```jsx
// 🎯 Async data fetching state machine
const initialState = {
  status: 'idle', // idle | loading | success | error
  data: null,
  error: null,
  retryCount: 0
};

function dataFetchReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        status: 'loading',
        error: null
      };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        status: 'success',
        data: action.payload.data,
        error: null,
        retryCount: 0
      };
    
    case 'FETCH_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload.error,
        data: null
      };
    
    case 'RETRY':
      return {
        ...state,
        status: 'loading',
        error: null,
        retryCount: state.retryCount + 1
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

function useAsyncData(url) {
  const [state, dispatch] = useReducer(dataFetchReducer, initialState);
  
  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: { data } });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: { error: error.message } });
    }
  }, [url]);
  
  const retry = useCallback(() => {
    if (state.retryCount < 3) {
      dispatch({ type: 'RETRY' });
      fetchData();
    }
  }, [fetchData, state.retryCount]);
  
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    ...state,
    refetch: fetchData,
    retry,
    reset,
    canRetry: state.retryCount < 3
  };
}

// 🎯 Usage
function DataComponent() {
  const { status, data, error, retry, canRetry } = useAsyncData('/api/users');
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'error') {
    return (
      <div>
        <p>Error: {error}</p>
        {canRetry && (
          <button onClick={retry}>Retry</button>
        )}
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div>
        {data.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
  
  return null;
}
```

### Pattern 2: Multi-Step Wizard

```jsx
// 🎯 Multi-step wizard with validation
const wizardSteps = [
  { id: 'personal', title: 'Personal Info', component: PersonalStep },
  { id: 'address', title: 'Address', component: AddressStep },
  { id: 'payment', title: 'Payment', component: PaymentStep },
  { id: 'review', title: 'Review', component: ReviewStep }
];

const initialWizardState = {
  currentStep: 0,
  data: {
    personal: {},
    address: {},
    payment: {}
  },
  errors: {},
  touched: {},
  isValid: false,
  isSubmitting: false,
  completedSteps: []
};

function wizardReducer(state, action) {
  switch (action.type) {
    case 'NEXT_STEP': {
      const nextStep = Math.min(state.currentStep + 1, wizardSteps.length - 1);
      return {
        ...state,
        currentStep: nextStep,
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])]
      };
    }
    
    case 'PREV_STEP': {
      const prevStep = Math.max(state.currentStep - 1, 0);
      return {
        ...state,
        currentStep: prevStep
      };
    }
    
    case 'GO_TO_STEP': {
      const { step } = action.payload;
      // Only allow going to completed steps or next step
      if (state.completedSteps.includes(step) || step === state.currentStep + 1) {
        return {
          ...state,
          currentStep: step
        };
      }
      return state;
    }
    
    case 'UPDATE_STEP_DATA': {
      const { step, data } = action.payload;
      return {
        ...state,
        data: {
          ...state.data,
          [step]: {
            ...state.data[step],
            ...data
          }
        }
      };
    }
    
    case 'SET_STEP_ERRORS': {
      const { step, errors } = action.payload;
      return {
        ...state,
        errors: {
          ...state.errors,
          [step]: errors
        }
      };
    }
    
    case 'SET_STEP_TOUCHED': {
      const { step, touched } = action.payload;
      return {
        ...state,
        touched: {
          ...state.touched,
          [step]: {
            ...state.touched[step],
            ...touched
          }
        }
      };
    }
    
    case 'VALIDATE_STEP': {
      const { step, isValid, errors } = action.payload;
      return {
        ...state,
        isValid,
        errors: {
          ...state.errors,
          [step]: errors
        }
      };
    }
    
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true
      };
    
    case 'SUBMIT_SUCCESS':
      return {
        ...initialWizardState,
        // Maybe keep some success state
      };
    
    case 'SUBMIT_ERROR':
      return {
        ...state,
        isSubmitting: false,
        errors: {
          ...state.errors,
          submit: action.payload.error
        }
      };
    
    case 'RESET_WIZARD':
      return initialWizardState;
    
    default:
      return state;
  }
}

function useWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  
  const nextStep = useCallback(() => {
    const currentStepId = wizardSteps[state.currentStep].id;
    const stepData = state.data[currentStepId];
    const errors = validateStep(currentStepId, stepData);
    
    if (Object.keys(errors).length === 0) {
      dispatch({ type: 'NEXT_STEP' });
    } else {
      dispatch({ 
        type: 'VALIDATE_STEP', 
        payload: { step: currentStepId, isValid: false, errors } 
      });
    }
  }, [state.currentStep, state.data]);
  
  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);
  
  const goToStep = useCallback((step) => {
    dispatch({ type: 'GO_TO_STEP', payload: { step } });
  }, []);
  
  const updateStepData = useCallback((step, data) => {
    dispatch({ type: 'UPDATE_STEP_DATA', payload: { step, data } });
  }, []);
  
  const submitWizard = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      // Validate all steps
      const allErrors = {};
      let hasErrors = false;
      
      Object.keys(state.data).forEach(step => {
        const errors = validateStep(step, state.data[step]);
        if (Object.keys(errors).length > 0) {
          allErrors[step] = errors;
          hasErrors = true;
        }
      });
      
      if (hasErrors) {
        dispatch({ type: 'SUBMIT_ERROR', payload: { error: 'Please fix validation errors' } });
        return;
      }
      
      // Submit data
      const response = await fetch('/api/wizard-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data)
      });
      
      if (!response.ok) {
        throw new Error('Submission failed');
      }
      
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', payload: { error: error.message } });
    }
  }, [state.data]);
  
  return {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    updateStepData,
    submitWizard,
    currentStepData: state.data[wizardSteps[state.currentStep]?.id] || {},
    canGoNext: state.currentStep < wizardSteps.length - 1,
    canGoPrev: state.currentStep > 0,
    isLastStep: state.currentStep === wizardSteps.length - 1
  };
}

// 🎯 Wizard component
function MultiStepWizard() {
  const wizard = useWizard();
  const currentStep = wizardSteps[wizard.currentStep];
  const StepComponent = currentStep.component;
  
  return (
    <div className="wizard">
      <WizardProgress 
        steps={wizardSteps}
        currentStep={wizard.currentStep}
        completedSteps={wizard.completedSteps}
        onStepClick={wizard.goToStep}
      />
      
      <div className="wizard-content">
        <StepComponent
          data={wizard.currentStepData}
          errors={wizard.errors[currentStep.id] || {}}
          onChange={(data) => wizard.updateStepData(currentStep.id, data)}
        />
      </div>
      
      <WizardNavigation
        canGoNext={wizard.canGoNext}
        canGoPrev={wizard.canGoPrev}
        isLastStep={wizard.isLastStep}
        isSubmitting={wizard.isSubmitting}
        onNext={wizard.nextStep}
        onPrev={wizard.prevStep}
        onSubmit={wizard.submitWizard}
      />
    </div>
  );
}
```

### Pattern 3: Game State Management

```jsx
// 🎯 Tic-tac-toe game with useReducer
const initialGameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  gameStatus: 'playing', // playing | won | draw
  moveHistory: [],
  scores: { X: 0, O: 0, draws: 0 }
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const { index } = action.payload;
      
      // Invalid move
      if (state.board[index] || state.winner) {
        return state;
      }
      
      const newBoard = [...state.board];
      newBoard[index] = state.currentPlayer;
      
      const winner = calculateWinner(newBoard);
      const isDraw = !winner && newBoard.every(cell => cell !== null);
      
      let newScores = state.scores;
      let gameStatus = 'playing';
      
      if (winner) {
        gameStatus = 'won';
        newScores = {
          ...state.scores,
          [winner]: state.scores[winner] + 1
        };
      } else if (isDraw) {
        gameStatus = 'draw';
        newScores = {
          ...state.scores,
          draws: state.scores.draws + 1
        };
      }
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        winner,
        gameStatus,
        scores: newScores,
        moveHistory: [
          ...state.moveHistory,
          {
            player: state.currentPlayer,
            index,
            board: newBoard,
            timestamp: Date.now()
          }
        ]
      };
    }
    
    case 'RESET_GAME':
      return {
        ...initialGameState,
        scores: state.scores // Keep scores
      };
    
    case 'NEW_GAME':
      return initialGameState;
    
    case 'UNDO_MOVE': {
      if (state.moveHistory.length === 0) {
        return state;
      }
      
      const newHistory = state.moveHistory.slice(0, -1);
      const lastMove = newHistory[newHistory.length - 1];
      
      if (lastMove) {
        return {
          ...state,
          board: lastMove.board,
          currentPlayer: lastMove.player === 'X' ? 'O' : 'X',
          winner: calculateWinner(lastMove.board),
          gameStatus: 'playing',
          moveHistory: newHistory
        };
      } else {
        return {
          ...state,
          board: Array(9).fill(null),
          currentPlayer: 'X',
          winner: null,
          gameStatus: 'playing',
          moveHistory: []
        };
      }
    }
    
    default:
      return state;
  }
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  return null;
}

function TicTacToe() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  
  const makeMove = (index) => {
    dispatch({ type: 'MAKE_MOVE', payload: { index } });
  };
  
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
  };
  
  const newGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };
  
  const undoMove = () => {
    dispatch({ type: 'UNDO_MOVE' });
  };
  
  return (
    <div className="tic-tac-toe">
      <div className="game-header">
        <div className="scores">
          <span>X: {state.scores.X}</span>
          <span>O: {state.scores.O}</span>
          <span>Draws: {state.scores.draws}</span>
        </div>
        
        <div className="game-controls">
          <button onClick={undoMove} disabled={state.moveHistory.length === 0}>
            Undo
          </button>
          <button onClick={resetGame}>Reset Game</button>
          <button onClick={newGame}>New Game</button>
        </div>
      </div>
      
      <div className="game-status">
        {state.gameStatus === 'won' && (
          <h2>🎉 Player {state.winner} wins!</h2>
        )}
        {state.gameStatus === 'draw' && (
          <h2>🤝 It's a draw!</h2>
        )}
        {state.gameStatus === 'playing' && (
          <h2>Current player: {state.currentPlayer}</h2>
        )}
      </div>
      
      <div className="board">
        {state.board.map((cell, index) => (
          <button
            key={index}
            className="cell"
            onClick={() => makeMove(index)}
            disabled={cell !== null || state.gameStatus !== 'playing'}
          >
            {cell}
          </button>
        ))}
      </div>
      
      <div className="move-history">
        <h3>Move History</h3>
        {state.moveHistory.map((move, index) => (
          <div key={index} className="move">
            Move {index + 1}: Player {move.player} → Position {move.index}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔄 useReducer + Context Pattern

```jsx
// 🎯 Global state management with useReducer + Context
const AppStateContext = createContext();
const AppDispatchContext = createContext();

const initialAppState = {
  user: null,
  theme: 'light',
  notifications: [],
  cart: {
    items: [],
    total: 0
  },
  ui: {
    sidebarOpen: false,
    modalStack: []
  }
};

function appReducer(state, action) {
  switch (action.type) {
    // User actions
    case 'USER_LOGIN':
      return {
        ...state,
        user: action.payload.user
      };
    
    case 'USER_LOGOUT':
      return {
        ...state,
        user: null,
        cart: { items: [], total: 0 } // Clear cart on logout
      };
    
    // Theme actions
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };
    
    // Notification actions
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload
          }
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
    
    // Cart actions
    case 'ADD_TO_CART': {
      const { product } = action.payload;
      const existingItem = state.cart.items.find(item => item.id === product.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.cart.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.cart.items, { ...product, quantity: 1 }];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        cart: {
          items: newItems,
          total: newTotal
        }
      };
    }
    
    // UI actions
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      };
    
    case 'OPEN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modalStack: [...state.ui.modalStack, action.payload.modal]
        }
      };
    
    case 'CLOSE_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          modalStack: state.ui.modalStack.slice(0, -1)
        }
      };
    
    default:
      return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// 🎯 Custom hooks for consuming state and dispatch
function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

// 🎯 Specialized hooks for specific state slices
function useUser() {
  const { user } = useAppState();
  const dispatch = useAppDispatch();
  
  const login = useCallback((userData) => {
    dispatch({ type: 'USER_LOGIN', payload: { user: userData } });
  }, [dispatch]);
  
  const logout = useCallback(() => {
    dispatch({ type: 'USER_LOGOUT' });
  }, [dispatch]);
  
  return {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };
}

function useTheme() {
  const { theme } = useAppState();
  const dispatch = useAppDispatch();
  
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, [dispatch]);
  
  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme
  };
}

function useNotifications() {
  const { notifications } = useAppState();
  const dispatch = useAppDispatch();
  
  const addNotification = useCallback((notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, [dispatch]);
  
  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  }, [dispatch]);
  
  return {
    notifications,
    addNotification,
    removeNotification
  };
}

function useCart() {
  const { cart } = useAppState();
  const dispatch = useAppDispatch();
  
  const addToCart = useCallback((product) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product } });
  }, [dispatch]);
  
  return {
    ...cart,
    addToCart,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}
```

## ⚠️ Common Mistakes and Anti-Patterns

### Mistake 1: Mutating State

```jsx
// ❌ Bad: Mutating state directly
function badReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      state.items.push(action.payload); // Mutation!
      return state;
    
    case 'UPDATE_ITEM':
      const item = state.items.find(item => item.id === action.payload.id);
      item.name = action.payload.name; // Mutation!
      return state;
    
    default:
      return state;
  }
}

// ✅ Good: Returning new state objects
function goodReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, name: action.payload.name }
            : item
        )
      };
    
    default:
      return state;
  }
}
```

### Mistake 2: Complex Logic in Components

```jsx
// ❌ Bad: Complex state logic in component
function BadTodoList() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  const addTodo = (text) => {
    // Complex logic in component
    if (text.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority: text.includes('!') ? 'high' : 'normal'
    };
    
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };
  
  // More complex logic...
}

// ✅ Good: Logic in reducer or custom hooks
function goodTodoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': {
      const { text } = action.payload;
      
      // Validation and processing in reducer
      if (!text || text.trim() === '') {
        return state;
      }
      
      const newTodo = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        priority: text.includes('!') ? 'high' : 'normal'
      };
      
      return {
        ...state,
        todos: [...state.todos, newTodo]
      };
    }
    
    default:
      return state;
  }
}

function GoodTodoList() {
  const [state, dispatch] = useReducer(goodTodoReducer, initialState);
  
  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', payload: { text } });
  };
  
  // Clean component logic
}
```

### Mistake 3: Not Using Action Types Constants

```jsx
// ❌ Bad: Magic strings
function badComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleClick = () => {
    dispatch({ type: 'INCREMENT_COUNTER' }); // Typo-prone
  };
}

// ✅ Good: Action type constants
const ACTION_TYPES = {
  INCREMENT_COUNTER: 'INCREMENT_COUNTER',
  DECREMENT_COUNTER: 'DECREMENT_COUNTER',
  RESET_COUNTER: 'RESET_COUNTER'
};

function goodReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.INCREMENT_COUNTER:
      return { count: state.count + 1 };
    
    case ACTION_TYPES.DECREMENT_COUNTER:
      return { count: state.count - 1 };
    
    case ACTION_TYPES.RESET_COUNTER:
      return { count: 0 };
    
    default:
      return state;
  }
}

function goodComponent() {
  const [state, dispatch] = useReducer(goodReducer, initialState);
  
  const handleClick = () => {
    dispatch({ type: ACTION_TYPES.INCREMENT_COUNTER }); // Type-safe
  };
}
```

## 🏋️‍♂️ Mini-Challenges

### Challenge 1: Advanced Todo App

Build a todo app with categories, due dates, priorities, and search functionality using `useReducer`.

<details>
<summary>💡 Solution</summary>

```jsx
const initialTodoState = {
  todos: [],
  categories: ['Personal', 'Work', 'Shopping'],
  filter: {
    category: 'all',
    priority: 'all',
    status: 'all',
    search: ''
  },
  sort: {
    field: 'createdAt',
    direction: 'desc'
  }
};

function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO': {
      const { text, category, priority, dueDate } = action.payload;
      
      const newTodo = {
        id: Date.now(),
        text: text.trim(),
        category: category || 'Personal',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      return {
        ...state,
        todos: [...state.todos, newTodo]
      };
    }
    
    case 'TOGGLE_TODO': {
      const { id } = action.payload;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? {
                ...todo,
                completed: !todo.completed,
                completedAt: !todo.completed ? new Date().toISOString() : null
              }
            : todo
        )
      };
    }
    
    case 'UPDATE_TODO': {
      const { id, updates } = action.payload;
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === id
            ? { ...todo, ...updates }
            : todo
        )
      };
    }
    
    case 'DELETE_TODO': {
      const { id } = action.payload;
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== id)
      };
    }
    
    case 'SET_FILTER': {
      const { filterType, value } = action.payload;
      return {
        ...state,
        filter: {
          ...state.filter,
          [filterType]: value
        }
      };
    }
    
    case 'SET_SORT': {
      const { field, direction } = action.payload;
      return {
        ...state,
        sort: { field, direction }
      };
    }
    
    case 'ADD_CATEGORY': {
      const { category } = action.payload;
      if (!state.categories.includes(category)) {
        return {
          ...state,
          categories: [...state.categories, category]
        };
      }
      return state;
    }
    
    default:
      return state;
  }
}

function useTodos() {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  
  // Filtered and sorted todos
  const filteredTodos = useMemo(() => {
    let filtered = state.todos;
    
    // Filter by category
    if (state.filter.category !== 'all') {
      filtered = filtered.filter(todo => todo.category === state.filter.category);
    }
    
    // Filter by priority
    if (state.filter.priority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === state.filter.priority);
    }
    
    // Filter by status
    if (state.filter.status !== 'all') {
      filtered = filtered.filter(todo => 
        state.filter.status === 'completed' ? todo.completed : !todo.completed
      );
    }
    
    // Filter by search
    if (state.filter.search) {
      filtered = filtered.filter(todo =>
        todo.text.toLowerCase().includes(state.filter.search.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      const { field, direction } = state.sort;
      let aValue = a[field];
      let bValue = b[field];
      
      if (field === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[aValue];
        bValue = priorityOrder[bValue];
      }
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [state.todos, state.filter, state.sort]);
  
  // Actions
  const addTodo = useCallback((todoData) => {
    dispatch({ type: 'ADD_TODO', payload: todoData });
  }, []);
  
  const toggleTodo = useCallback((id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  }, []);
  
  const updateTodo = useCallback((id, updates) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  }, []);
  
  const deleteTodo = useCallback((id) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  }, []);
  
  const setFilter = useCallback((filterType, value) => {
    dispatch({ type: 'SET_FILTER', payload: { filterType, value } });
  }, []);
  
  const setSort = useCallback((field, direction) => {
    dispatch({ type: 'SET_SORT', payload: { field, direction } });
  }, []);
  
  const addCategory = useCallback((category) => {
    dispatch({ type: 'ADD_CATEGORY', payload: { category } });
  }, []);
  
  // Statistics
  const stats = useMemo(() => {
    const total = state.todos.length;
    const completed = state.todos.filter(todo => todo.completed).length;
    const overdue = state.todos.filter(todo => {
      if (!todo.dueDate || todo.completed) return false;
      return new Date(todo.dueDate) < new Date();
    }).length;
    
    return {
      total,
      completed,
      pending: total - completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [state.todos]);
  
  return {
    todos: filteredTodos,
    allTodos: state.todos,
    categories: state.categories,
    filter: state.filter,
    sort: state.sort,
    stats,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    setSort,
    addCategory
  };
}

function AdvancedTodoApp() {
  const {
    todos,
    categories,
    filter,
    sort,
    stats,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    setFilter,
    setSort,
    addCategory
  } = useTodos();
  
  return (
    <div className="advanced-todo-app">
      <TodoStats stats={stats} />
      <TodoFilters 
        filter={filter}
        categories={categories}
        onFilterChange={setFilter}
        onSortChange={setSort}
      />
      <TodoForm 
        categories={categories}
        onAddTodo={addTodo}
        onAddCategory={addCategory}
      />
      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
      />
    </div>
  );
}
```

</details>

### Challenge 2: Shopping Cart with Discounts

Create a shopping cart system with multiple discount types, tax calculation, and shipping options.

<details>
<summary>💡 Solution</summary>

```jsx
const initialCartState = {
  items: [],
  discounts: {
    coupon: null,
    bulk: null,
    loyalty: null
  },
  shipping: {
    method: 'standard',
    cost: 0,
    estimatedDays: 5
  },
  tax: {
    rate: 0.08,
    amount: 0
  },
  totals: {
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    shippingCost: 0,
    total: 0
  }
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id);
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity }];
      }
      
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } });
      }
      
      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'REMOVE_ITEM': {
      const { id } = action.payload;
      const newItems = state.items.filter(item => item.id !== id);
      return calculateTotals({ ...state, items: newItems });
    }
    
    case 'APPLY_COUPON': {
      const { coupon } = action.payload;
      const newState = {
        ...state,
        discounts: {
          ...state.discounts,
          coupon
        }
      };
      return calculateTotals(newState);
    }
    
    case 'REMOVE_COUPON': {
      const newState = {
        ...state,
        discounts: {
          ...state.discounts,
          coupon: null
        }
      };
      return calculateTotals(newState);
    }
    
    case 'SET_SHIPPING': {
      const { method, cost, estimatedDays } = action.payload;
      const newState = {
        ...state,
        shipping: { method, cost, estimatedDays }
      };
      return calculateTotals(newState);
    }
    
    case 'CLEAR_CART':
      return initialCartState;
    
    default:
      return state;
  }
}

function calculateTotals(state) {
  const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discounts
  let discountAmount = 0;
  
  // Coupon discount
  if (state.discounts.coupon) {
    const coupon = state.discounts.coupon;
    if (coupon.type === 'percentage') {
      discountAmount += subtotal * (coupon.value / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount += Math.min(coupon.value, subtotal);
    }
  }
  
  // Bulk discount (10% off if subtotal > $100)
  if (subtotal > 100) {
    const bulkDiscount = subtotal * 0.1;
    discountAmount += bulkDiscount;
    state.discounts.bulk = {
      type: 'bulk',
      description: '10% off orders over $100',
      amount: bulkDiscount
    };
  } else {
    state.discounts.bulk = null;
  }
  
  // Loyalty discount (5% off for returning customers)
  // This would typically come from user data
  const isLoyalCustomer = true; // Placeholder
  if (isLoyalCustomer && subtotal > 50) {
    const loyaltyDiscount = subtotal * 0.05;
    discountAmount += loyaltyDiscount;
    state.discounts.loyalty = {
      type: 'loyalty',
      description: '5% loyalty discount',
      amount: loyaltyDiscount
    };
  } else {
    state.discounts.loyalty = null;
  }
  
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = discountedSubtotal * state.tax.rate;
  const total = discountedSubtotal + taxAmount + state.shipping.cost;
  
  return {
    ...state,
    totals: {
      subtotal,
      discountAmount,
      taxAmount,
      shippingCost: state.shipping.cost,
      total
    }
  };
}

function useShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  
  const addItem = useCallback((product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  }, []);
  
  const updateQuantity = useCallback((id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  }, []);
  
  const removeItem = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  }, []);
  
  const applyCoupon = useCallback((coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: { coupon } });
  }, []);
  
  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);
  
  const setShipping = useCallback((method, cost, estimatedDays) => {
    dispatch({ type: 'SET_SHIPPING', payload: { method, cost, estimatedDays } });
  }, []);
  
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);
  
  const itemCount = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);
  
  return {
    ...state,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    setShipping,
    clearCart
  };
}

function ShoppingCart() {
  const {
    items,
    discounts,
    shipping,
    totals,
    itemCount,
    addItem,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    setShipping
  } = useShoppingCart();
  
  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h2>Shopping Cart ({itemCount} items)</h2>
      </div>
      
      <div className="cart-items">
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      
      <CouponSection
        coupon={discounts.coupon}
        onApplyCoupon={applyCoupon}
        onRemoveCoupon={removeCoupon}
      />
      
      <ShippingOptions
        shipping={shipping}
        onSetShipping={setShipping}
      />
      
      <CartSummary
        totals={totals}
        discounts={discounts}
        shipping={shipping}
      />
    </div>
  );
}
```

</details>

## 🎯 When and Why to Use useReducer

### ✅ Use useReducer When:

1. **Complex State Logic**: Multiple related state values that change together
2. **State Transitions**: Next state depends on previous state
3. **Predictable Updates**: Need consistent, testable state changes
4. **Multiple Actions**: Different ways to update the same state
5. **State Validation**: Need to validate state changes
6. **Undo/Redo**: Need to track state history
7. **Global State**: Combined with Context for app-wide state

### ❌ Avoid useReducer When:

1. **Simple State**: Single primitive values (string, number, boolean)
2. **Independent State**: State values that don't relate to each other
3. **Frequent Updates**: High-frequency state changes (animations, mouse tracking)
4. **Server State**: Use data fetching libraries instead
5. **Form State**: Consider form libraries for complex forms

### 🤔 Decision Framework

```
Do you have multiple related state values?
├─ No → Use useState
└─ Yes
   ├─ Do state updates depend on previous state?
   │  ├─ No → Consider multiple useState
   │  └─ Yes → useReducer is good
   └─ Do you need predictable state transitions?
      ├─ No → useState might be simpler
      └─ Yes → useReducer is perfect
```

## 🚀 Performance Optimization

### Memoizing Dispatch

```jsx
// ✅ dispatch is automatically stable
function MyComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // dispatch never changes, so this is safe
  const memoizedCallback = useCallback(() => {
    dispatch({ type: 'SOME_ACTION' });
  }, [dispatch]); // dispatch can be omitted from deps
  
  return <ChildComponent onAction={memoizedCallback} />;
}
```

### Optimizing Reducer Performance

```jsx
// ✅ Use early returns for performance
function optimizedReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_ITEM': {
      const { id, updates } = action.payload;
      
      // Early return if item doesn't exist
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        return state;
      }
      
      // Early return if no actual changes
      const currentItem = state.items[itemIndex];
      const hasChanges = Object.keys(updates).some(
        key => currentItem[key] !== updates[key]
      );
      if (!hasChanges) {
        return state;
      }
      
      // Only update if necessary
      const newItems = [...state.items];
      newItems[itemIndex] = { ...currentItem, ...updates };
      
      return {
        ...state,
        items: newItems
      };
    }
    
    default:
      return state;
  }
}
```

### Lazy Initialization

```jsx
// ✅ Expensive initial state calculation
function init(initialCount) {
  // Expensive computation
  const expensiveValue = computeExpensiveValue(initialCount);
  return {
    count: initialCount,
    expensiveValue,
    history: []
  };
}

function Counter({ initialCount }) {
  // init function only runs once
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>
        +
      </button>
    </div>
  );
}
```

## 🎤 Interview Insights

### Common Questions

**Q: When would you use useReducer instead of useState?**

A: useReducer is better when:
- Managing complex state with multiple sub-values
- State updates depend on previous state
- Need predictable state transitions
- Multiple components need to trigger the same state changes
- Building state machines or complex workflows

**Q: How does useReducer compare to Redux?**

A: Similarities:
- Both use reducer pattern
- Predictable state updates
- Action-based state changes

Differences:
- useReducer is local to component tree
- Redux has global state and middleware
- Redux has time-travel debugging
- useReducer is simpler for component-level state

**Q: Can you combine useReducer with Context?**

A: Yes! This is a powerful pattern for global state management:

```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
```

**Q: How do you test components that use useReducer?**

A: Test the reducer function separately, then test component behavior:

```jsx
// Test reducer
describe('todoReducer', () => {
  it('should add a todo', () => {
    const initialState = { todos: [] };
    const action = { type: 'ADD_TODO', payload: { text: 'Test' } };
    const newState = todoReducer(initialState, action);
    
    expect(newState.todos).toHaveLength(1);
    expect(newState.todos[0].text).toBe('Test');
  });
});

// Test component
test('adds todo when form is submitted', () => {
  render(<TodoApp />);
  
  fireEvent.change(screen.getByPlaceholderText('Add todo'), {
    target: { value: 'New todo' }
  });
  fireEvent.click(screen.getByText('Add'));
  
  expect(screen.getByText('New todo')).toBeInTheDocument();
});
```

### Code Review Red Flags

❌ **Mutating state in reducer**
❌ **Complex logic in components instead of reducer**
❌ **Not handling all action types**
❌ **Missing default case in reducer**
❌ **Using useReducer for simple state**
❌ **Not memoizing expensive calculations**

## 🎯 Key Takeaways

1. **useReducer is for complex state** - Use when useState becomes unwieldy
2. **Reducers must be pure** - No side effects, always return new state
3. **Actions describe what happened** - Use descriptive action types
4. **Combine with Context for global state** - Powerful alternative to Redux
5. **Test reducers separately** - Pure functions are easy to test
6. **Use action creators** - Improve maintainability and type safety
7. **Consider performance** - Early returns and memoization help

## 🏆 Best Practices

1. **Keep reducers pure** - No side effects or mutations
2. **Use action type constants** - Prevent typos and improve maintainability
3. **Structure actions consistently** - Use `{ type, payload }` pattern
4. **Handle all cases** - Always include default case
5. **Split large reducers** - Use reducer composition for complex state
6. **Document state shape** - Clear interfaces help team collaboration
7. **Use TypeScript** - Better developer experience and fewer bugs

## 🔧 Production Tips

- **Monitor reducer performance** with React DevTools Profiler
- **Use immer** for complex immutable updates
- **Implement middleware pattern** for logging and debugging
- **Consider reducer composition** for large applications
- **Use action creators** for complex action logic
- **Implement optimistic updates** for better UX
- **Add error boundaries** around components using reducers

---

**Next up**: We'll explore custom hooks and learn how to create reusable stateful logic! 🚀