# 🎯 useRef: Refs vs Variables Deep Dive

> **Master React's escape hatch: Direct DOM access, mutable values, and when refs are better than state**

## 🎯 What You'll Learn

- Understanding refs vs regular variables vs state
- Direct DOM manipulation and focus management
- Storing mutable values that don't trigger re-renders
- Ref forwarding and imperative APIs
- Common ref patterns and anti-patterns
- Performance optimizations with refs
- Real-world scenarios and best practices

## 🎯 Understanding useRef Fundamentals

### Refs vs State vs Variables

```jsx
function RefVsStateVsVariables() {
  // 🎯 State: Triggers re-render when changed
  const [stateValue, setStateValue] = useState(0);
  
  // 🎯 Ref: Persists between renders, doesn't trigger re-render
  const refValue = useRef(0);
  
  // ❌ Regular variable: Gets reset on every render
  let regularVariable = 0;
  
  // 🎯 Ref for tracking render count
  const renderCount = useRef(0);
  
  // Increment render count on every render
  renderCount.current += 1;
  
  const handleStateIncrement = () => {
    setStateValue(prev => prev + 1); // ✅ Triggers re-render
  };
  
  const handleRefIncrement = () => {
    refValue.current += 1; // ✅ Persists but no re-render
    console.log('Ref value:', refValue.current);
  };
  
  const handleVariableIncrement = () => {
    regularVariable += 1; // ❌ Will be reset on next render
    console.log('Variable value:', regularVariable);
  };
  
  const forceRerender = () => {
    setStateValue(prev => prev); // Force re-render without changing state
  };
  
  return (
    <div className="ref-comparison">
      <h3>Refs vs State vs Variables</h3>
      
      <div className="render-info">
        <p><strong>Render count:</strong> {renderCount.current}</p>
      </div>
      
      <div className="value-display">
        <div className="state-section">
          <h4>State Value (triggers re-render)</h4>
          <p>Current value: {stateValue}</p>
          <button onClick={handleStateIncrement}>Increment State</button>
        </div>
        
        <div className="ref-section">
          <h4>Ref Value (persists, no re-render)</h4>
          <p>Current value: {refValue.current}</p>
          <button onClick={handleRefIncrement}>Increment Ref</button>
          <p><em>Check console for actual value</em></p>
        </div>
        
        <div className="variable-section">
          <h4>Regular Variable (resets each render)</h4>
          <p>Current value: {regularVariable}</p>
          <button onClick={handleVariableIncrement}>Increment Variable</button>
          <p><em>Always resets to 0</em></p>
        </div>
      </div>
      
      <div className="controls">
        <button onClick={forceRerender}>Force Re-render</button>
        <button onClick={() => {
          console.log('Current values:');
          console.log('State:', stateValue);
          console.log('Ref:', refValue.current);
          console.log('Variable:', regularVariable);
        }}>Log All Values</button>
      </div>
      
      <div className="explanation">
        <h4>Key Differences:</h4>
        <ul>
          <li><strong>State:</strong> Triggers re-render, UI updates automatically</li>
          <li><strong>Ref:</strong> Persists between renders, no re-render, manual UI updates</li>
          <li><strong>Variable:</strong> Resets on every render, loses value</li>
        </ul>
      </div>
    </div>
  );
}
```

### DOM Refs and Element Access

```jsx
function DOMRefExamples() {
  // 🎯 Refs for DOM elements
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const divRef = useRef(null);
  const videoRef = useRef(null);
  
  // 🎯 Refs for storing DOM measurements
  const measurementsRef = useRef({ width: 0, height: 0 });
  
  const [measurements, setMeasurements] = useState({ width: 0, height: 0 });
  const [inputValue, setInputValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 🎯 Focus management
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text
    }
  };
  
  const clearAndFocus = () => {
    setInputValue('');
    // Focus after state update
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  
  // 🎯 Scroll management
  const scrollToTop = () => {
    if (divRef.current) {
      divRef.current.scrollTop = 0;
    }
  };
  
  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  };
  
  // 🎯 Measurements
  const measureElement = () => {
    if (divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      const newMeasurements = {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      };
      
      // Store in ref (doesn't trigger re-render)
      measurementsRef.current = newMeasurements;
      
      // Update state to show in UI
      setMeasurements(newMeasurements);
    }
  };
  
  // 🎯 Video control
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const setVideoTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
    }
  };
  
  // 🎯 Text manipulation
  const insertTextAtCursor = (text) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      
      const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
      textarea.value = newValue;
      
      // Set cursor position after inserted text
      const newCursorPos = start + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }
  };
  
  return (
    <div className="dom-ref-examples">
      <h3>DOM Refs and Element Access</h3>
      
      {/* Input Focus Management */}
      <div className="input-section">
        <h4>Input Focus Management</h4>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
        />
        <div className="input-controls">
          <button onClick={focusInput}>Focus & Select</button>
          <button onClick={clearAndFocus}>Clear & Focus</button>
          <button onClick={() => {
            if (inputRef.current) {
              inputRef.current.blur();
            }
          }}>Blur</button>
        </div>
      </div>
      
      {/* Textarea with Text Insertion */}
      <div className="textarea-section">
        <h4>Textarea Manipulation</h4>
        <textarea
          ref={textareaRef}
          rows={4}
          cols={50}
          placeholder="Click buttons to insert text at cursor..."
        />
        <div className="textarea-controls">
          <button onClick={() => insertTextAtCursor('Hello ')}>Insert "Hello "</button>
          <button onClick={() => insertTextAtCursor('World!')}>Insert "World!"</button>
          <button onClick={() => insertTextAtCursor('\n')}>Insert New Line</button>
          <button onClick={() => {
            if (textareaRef.current) {
              textareaRef.current.value = '';
              textareaRef.current.focus();
            }
          }}>Clear</button>
        </div>
      </div>
      
      {/* Scrollable Div */}
      <div className="scroll-section">
        <h4>Scroll Management</h4>
        <div 
          ref={divRef}
          className="scrollable-div"
          style={{
            height: '150px',
            overflow: 'auto',
            border: '1px solid #ccc',
            padding: '10px'
          }}
        >
          {Array.from({ length: 50 }, (_, i) => (
            <p key={i}>Line {i + 1} - This is some scrollable content</p>
          ))}
        </div>
        <div className="scroll-controls">
          <button onClick={scrollToTop}>Scroll to Top</button>
          <button onClick={scrollToBottom}>Scroll to Bottom</button>
          <button onClick={measureElement}>Measure Element</button>
        </div>
      </div>
      
      {/* Measurements Display */}
      <div className="measurements-section">
        <h4>Element Measurements</h4>
        <pre>{JSON.stringify(measurements, null, 2)}</pre>
      </div>
      
      {/* Video Control */}
      <div className="video-section">
        <h4>Video Control</h4>
        <video
          ref={videoRef}
          width="300"
          height="200"
          controls={false}
          style={{ border: '1px solid #ccc' }}
        >
          <source src="/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-controls">
          <button onClick={toggleVideo}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => setVideoTime(0)}>Reset</button>
          <button onClick={() => setVideoTime(10)}>Skip to 10s</button>
        </div>
      </div>
    </div>
  );
}
```

## 🔄 Mutable Values and Performance

### Using Refs for Mutable Values

```jsx
function MutableValueExamples() {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState([]);
  
  // 🎯 Refs for values that don't need to trigger re-renders
  const timerIdRef = useRef(null);
  const previousCountRef = useRef(0);
  const callbackCountRef = useRef(0);
  const isComponentMountedRef = useRef(true);
  
  // 🎯 Ref for storing expensive calculations
  const expensiveValueRef = useRef(null);
  const lastCalculationInputRef = useRef(null);
  
  // 🎯 Track previous value
  useEffect(() => {
    previousCountRef.current = count;
  });
  
  // 🎯 Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, []);
  
  const startTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }
    
    timerIdRef.current = setInterval(() => {
      // ✅ Check if component is still mounted
      if (isComponentMountedRef.current) {
        setCount(prevCount => prevCount + 1);
      }
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };
  
  // 🎯 Expensive calculation with caching
  const getExpensiveValue = (input) => {
    // Only recalculate if input changed
    if (lastCalculationInputRef.current !== input) {
      console.log('Performing expensive calculation...');
      
      // Simulate expensive operation
      let result = 0;
      for (let i = 0; i < input * 1000000; i++) {
        result += Math.random();
      }
      
      expensiveValueRef.current = result;
      lastCalculationInputRef.current = input;
    }
    
    return expensiveValueRef.current;
  };
  
  // 🎯 Callback with ref to avoid stale closures
  const handleAsyncOperation = useCallback(() => {
    callbackCountRef.current += 1;
    const currentCallCount = callbackCountRef.current;
    
    console.log(`Starting async operation #${currentCallCount}`);
    
    setTimeout(() => {
      // ✅ Check if this is still the latest call
      if (callbackCountRef.current === currentCallCount && isComponentMountedRef.current) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Async operation #${currentCallCount} completed`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        console.log(`Async operation #${currentCallCount} was superseded`);
      }
    }, 2000);
  }, []);
  
  const clearMessages = () => {
    setMessages([]);
  };
  
  const expensiveValue = getExpensiveValue(count);
  
  return (
    <div className="mutable-value-examples">
      <h3>Mutable Values with Refs</h3>
      
      <div className="counter-section">
        <h4>Timer with Ref Management</h4>
        <p>Current count: {count}</p>
        <p>Previous count: {previousCountRef.current}</p>
        <p>Change: {count - previousCountRef.current}</p>
        
        <div className="timer-controls">
          <button onClick={startTimer}>Start Timer</button>
          <button onClick={stopTimer}>Stop Timer</button>
          <button onClick={() => setCount(0)}>Reset Count</button>
        </div>
      </div>
      
      <div className="expensive-calculation">
        <h4>Cached Expensive Calculation</h4>
        <p>Input: {count}</p>
        <p>Expensive result: {expensiveValue?.toFixed(2) || 'Not calculated'}</p>
        <p><em>Check console - calculation only runs when count changes</em></p>
      </div>
      
      <div className="async-section">
        <h4>Async Operations with Race Condition Prevention</h4>
        <button onClick={handleAsyncOperation}>
          Start Async Operation (2s delay)
        </button>
        <p>Callback count: {callbackCountRef.current}</p>
        
        <div className="messages">
          <h5>Messages:</h5>
          {messages.length === 0 ? (
            <p>No messages yet</p>
          ) : (
            <ul>
              {messages.map(message => (
                <li key={message.id}>
                  <strong>{message.timestamp}:</strong> {message.text}
                </li>
              ))}
            </ul>
          )}
          {messages.length > 0 && (
            <button onClick={clearMessages}>Clear Messages</button>
          )}
        </div>
      </div>
      
      <div className="ref-info">
        <h4>Ref Usage Summary:</h4>
        <ul>
          <li><code>timerIdRef</code>: Stores timer ID for cleanup</li>
          <li><code>previousCountRef</code>: Tracks previous state value</li>
          <li><code>callbackCountRef</code>: Prevents race conditions</li>
          <li><code>isComponentMountedRef</code>: Prevents state updates after unmount</li>
          <li><code>expensiveValueRef</code>: Caches expensive calculations</li>
        </ul>
      </div>
    </div>
  );
}
```

### Performance Optimization with Refs

```jsx
function PerformanceOptimizationWithRefs() {
  const [items, setItems] = useState(
    Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}`, selected: false }))
  );
  const [filter, setFilter] = useState('');
  
  // 🎯 Refs for performance optimization
  const selectedItemsRef = useRef(new Set());
  const lastFilterRef = useRef('');
  const filteredItemsRef = useRef([]);
  const renderCountRef = useRef(0);
  
  renderCountRef.current += 1;
  
  // 🎯 Memoized filtered items with ref caching
  const filteredItems = useMemo(() => {
    // Only recalculate if filter actually changed
    if (lastFilterRef.current === filter && filteredItemsRef.current.length > 0) {
      return filteredItemsRef.current;
    }
    
    console.log('Filtering items...');
    const result = items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    lastFilterRef.current = filter;
    filteredItemsRef.current = result;
    
    return result;
  }, [items, filter]);
  
  // 🎯 Optimized selection handling
  const toggleItemSelection = useCallback((itemId) => {
    const selectedItems = selectedItemsRef.current;
    
    if (selectedItems.has(itemId)) {
      selectedItems.delete(itemId);
    } else {
      selectedItems.add(itemId);
    }
    
    // Update items state
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, selected: selectedItems.has(itemId) }
          : item
      )
    );
  }, []);
  
  const selectAll = () => {
    const selectedItems = selectedItemsRef.current;
    selectedItems.clear();
    
    filteredItems.forEach(item => {
      selectedItems.add(item.id);
    });
    
    setItems(prevItems => 
      prevItems.map(item => ({
        ...item,
        selected: selectedItems.has(item.id)
      }))
    );
  };
  
  const clearSelection = () => {
    selectedItemsRef.current.clear();
    
    setItems(prevItems => 
      prevItems.map(item => ({ ...item, selected: false }))
    );
  };
  
  const getSelectionCount = () => {
    return selectedItemsRef.current.size;
  };
  
  return (
    <div className="performance-optimization">
      <h3>Performance Optimization with Refs</h3>
      
      <div className="stats">
        <p>Render count: {renderCountRef.current}</p>
        <p>Total items: {items.length}</p>
        <p>Filtered items: {filteredItems.length}</p>
        <p>Selected items: {getSelectionCount()}</p>
      </div>
      
      <div className="controls">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter items..."
        />
        
        <div className="selection-controls">
          <button onClick={selectAll}>Select All Filtered</button>
          <button onClick={clearSelection}>Clear Selection</button>
        </div>
      </div>
      
      <div className="items-list" style={{ height: '300px', overflow: 'auto' }}>
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className={`item ${item.selected ? 'selected' : ''}`}
            onClick={() => toggleItemSelection(item.id)}
            style={{
              padding: '5px',
              cursor: 'pointer',
              backgroundColor: item.selected ? '#e3f2fd' : 'transparent'
            }}
          >
            <input 
              type="checkbox" 
              checked={item.selected} 
              onChange={() => {}} // Handled by parent click
            />
            {item.name}
          </div>
        ))}
      </div>
      
      <div className="optimization-notes">
        <h4>Optimization Techniques Used:</h4>
        <ul>
          <li><strong>selectedItemsRef:</strong> Tracks selection without triggering re-renders</li>
          <li><strong>filteredItemsRef:</strong> Caches filtered results</li>
          <li><strong>lastFilterRef:</strong> Prevents unnecessary filtering</li>
          <li><strong>useMemo:</strong> Memoizes expensive filtering operation</li>
          <li><strong>useCallback:</strong> Prevents function recreation</li>
        </ul>
      </div>
    </div>
  );
}
```

## 🔄 Ref Forwarding and Imperative APIs

### Ref Forwarding Patterns

```jsx
// 🎯 Basic ref forwarding
const CustomInput = forwardRef((props, ref) => {
  const { label, error, ...inputProps } = props;
  
  return (
    <div className="custom-input">
      {label && <label>{label}</label>}
      <input ref={ref} {...inputProps} />
      {error && <span className="error">{error}</span>}
    </div>
  );
});

// 🎯 Advanced ref forwarding with imperative API
const AdvancedInput = forwardRef((props, ref) => {
  const { onValueChange, ...otherProps } = props;
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  
  // 🎯 Expose imperative API
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
    clear: () => {
      setValue('');
      inputRef.current?.focus();
    },
    getValue: () => value,
    setValue: (newValue) => {
      setValue(newValue);
    },
    selectAll: () => {
      inputRef.current?.select();
    },
    insertAtCursor: (text) => {
      const input = inputRef.current;
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const newValue = value.substring(0, start) + text + value.substring(end);
        setValue(newValue);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          const newPos = start + text.length;
          input.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  }), [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange?.(newValue);
  };
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      {...otherProps}
    />
  );
});

// 🎯 Modal component with ref forwarding
const Modal = forwardRef(({ children, title, onClose }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    open: () => {
      previousFocusRef.current = document.activeElement;
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      previousFocusRef.current?.focus();
    },
    isOpen: () => isOpen
  }), [isOpen]);
  
  // 🎯 Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  // 🎯 Escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        onClose?.();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={() => {
      setIsOpen(false);
      onClose?.();
    }}>
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
});

// Usage examples
function RefForwardingExamples() {
  const customInputRef = useRef(null);
  const advancedInputRef = useRef(null);
  const modalRef = useRef(null);
  
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div className="ref-forwarding-examples">
      <h3>Ref Forwarding Examples</h3>
      
      {/* Basic ref forwarding */}
      <div className="basic-forwarding">
        <h4>Basic Ref Forwarding</h4>
        <CustomInput
          ref={customInputRef}
          label="Custom Input"
          placeholder="Type something..."
        />
        <button onClick={() => customInputRef.current?.focus()}>
          Focus Custom Input
        </button>
      </div>
      
      {/* Advanced ref forwarding with imperative API */}
      <div className="advanced-forwarding">
        <h4>Advanced Ref Forwarding (Imperative API)</h4>
        <AdvancedInput
          ref={advancedInputRef}
          placeholder="Advanced input..."
          onValueChange={setInputValue}
        />
        <p>Current value: {inputValue}</p>
        
        <div className="advanced-controls">
          <button onClick={() => advancedInputRef.current?.focus()}>
            Focus
          </button>
          <button onClick={() => advancedInputRef.current?.clear()}>
            Clear
          </button>
          <button onClick={() => advancedInputRef.current?.selectAll()}>
            Select All
          </button>
          <button onClick={() => advancedInputRef.current?.insertAtCursor(' [INSERTED] ')}>
            Insert Text
          </button>
          <button onClick={() => {
            const value = advancedInputRef.current?.getValue();
            alert(`Current value: ${value}`);
          }}>
            Get Value
          </button>
        </div>
      </div>
      
      {/* Modal with ref forwarding */}
      <div className="modal-forwarding">
        <h4>Modal with Ref Forwarding</h4>
        <button onClick={() => modalRef.current?.open()}>
          Open Modal
        </button>
        
        <Modal
          ref={modalRef}
          title="Example Modal"
          onClose={() => console.log('Modal closed')}
        >
          <p>This is modal content.</p>
          <p>Press Escape or click outside to close.</p>
          <input type="text" placeholder="Focus is managed automatically" />
        </Modal>
      </div>
    </div>
  );
}
```

### Custom Hooks with Refs

```jsx
// 🎯 Custom hook for element visibility
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options]);
  
  return [elementRef, isIntersecting, entry];
}

// 🎯 Custom hook for click outside
function useClickOutside(callback) {
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  
  return ref;
}

// 🎯 Custom hook for hover
function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return [ref, isHovered];
}

// 🎯 Custom hook for element size
function useElementSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    
    resizeObserver.observe(element);
    
    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);
  
  return [ref, size];
}

// Usage examples
function CustomHookExamples() {
  const [visibilityRef, isVisible] = useIntersectionObserver({
    threshold: 0.5
  });
  
  const [hoverRef, isHovered] = useHover();
  const [sizeRef, size] = useElementSize();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useClickOutside(() => setShowDropdown(false));
  
  return (
    <div className="custom-hook-examples">
      <h3>Custom Hooks with Refs</h3>
      
      {/* Intersection Observer */}
      <div style={{ height: '200px', overflow: 'auto', border: '1px solid #ccc' }}>
        <div style={{ height: '300px', padding: '20px' }}>
          <p>Scroll down to see the observed element...</p>
        </div>
        <div 
          ref={visibilityRef}
          style={{
            padding: '20px',
            backgroundColor: isVisible ? 'lightgreen' : 'lightcoral',
            transition: 'background-color 0.3s'
          }}
        >
          <p>This element is {isVisible ? 'visible' : 'not visible'}</p>
        </div>
        <div style={{ height: '300px', padding: '20px' }}>
          <p>More content below...</p>
        </div>
      </div>
      
      {/* Hover Detection */}
      <div 
        ref={hoverRef}
        style={{
          padding: '20px',
          margin: '20px 0',
          backgroundColor: isHovered ? 'lightblue' : 'lightgray',
          transition: 'background-color 0.3s',
          cursor: 'pointer'
        }}
      >
        <p>Hover over me! Currently {isHovered ? 'hovered' : 'not hovered'}</p>
      </div>
      
      {/* Element Size */}
      <div 
        ref={sizeRef}
        style={{
          padding: '20px',
          margin: '20px 0',
          border: '2px solid #333',
          resize: 'both',
          overflow: 'auto',
          minWidth: '200px',
          minHeight: '100px'
        }}
      >
        <p>Resize me!</p>
        <p>Width: {size.width.toFixed(0)}px</p>
        <p>Height: {size.height.toFixed(0)}px</p>
      </div>
      
      {/* Click Outside */}
      <div className="dropdown-container">
        <button onClick={() => setShowDropdown(!showDropdown)}>
          Toggle Dropdown
        </button>
        
        {showDropdown && (
          <div 
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              padding: '10px',
              zIndex: 1000
            }}
          >
            <p>Click outside to close</p>
            <button onClick={() => alert('Button clicked!')}>Action</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Using Refs Instead of State

```jsx
// ❌ WRONG: Using ref for UI state
function WrongRefUsage() {
  const countRef = useRef(0);
  
  const increment = () => {
    countRef.current += 1;
    // ❌ UI won't update because no re-render is triggered
  };
  
  return (
    <div>
      <p>Count: {countRef.current}</p> {/* ❌ Won't update */}
      <button onClick={increment}>Increment</button>
    </div>
  );
}

// ✅ CORRECT: Use state for UI values
function CorrectStateUsage() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(prev => prev + 1); // ✅ Triggers re-render
  };
  
  return (
    <div>
      <p>Count: {count}</p> {/* ✅ Updates correctly */}
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 2. Accessing Refs During Render

```jsx
// ❌ WRONG: Accessing ref.current during render
function WrongRefAccess() {
  const inputRef = useRef(null);
  
  // ❌ Don't access ref.current during render
  const inputValue = inputRef.current?.value || '';
  
  return (
    <div>
      <input ref={inputRef} />
      <p>Value: {inputValue}</p> {/* ❌ May be stale or null */}
    </div>
  );
}

// ✅ CORRECT: Access refs in effects or event handlers
function CorrectRefAccess() {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  
  const handleGetValue = () => {
    // ✅ Access ref in event handler
    const value = inputRef.current?.value || '';
    setInputValue(value);
  };
  
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleGetValue}>Get Value</button>
      <p>Value: {inputValue}</p>
    </div>
  );
}
```

### 3. Not Handling Null Refs

```jsx
// ❌ WRONG: Not checking for null
function UnsafeRefAccess() {
  const elementRef = useRef(null);
  
  const handleClick = () => {
    elementRef.current.focus(); // ❌ May throw error if null
  };
  
  return (
    <div>
      <input ref={elementRef} />
      <button onClick={handleClick}>Focus</button>
    </div>
  );
}

// ✅ CORRECT: Always check for null
function SafeRefAccess() {
  const elementRef = useRef(null);
  
  const handleClick = () => {
    if (elementRef.current) { // ✅ Safe null check
      elementRef.current.focus();
    }
    
    // Or use optional chaining
    elementRef.current?.focus(); // ✅ Also safe
  };
  
  return (
    <div>
      <input ref={elementRef} />
      <button onClick={handleClick}>Focus</button>
    </div>
  );
}
```

### 4. Ref Callback Mistakes

```jsx
// ❌ WRONG: Inline ref callback
function InlineRefCallback() {
  const [elements, setElements] = useState([]);
  
  return (
    <div>
      {[1, 2, 3].map(num => (
        <input
          key={num}
          ref={(el) => { // ❌ Creates new function on every render
            if (el) {
              setElements(prev => [...prev, el]);
            }
          }}
        />
      ))}
    </div>
  );
}

// ✅ CORRECT: Stable ref callback
function StableRefCallback() {
  const [elements, setElements] = useState([]);
  const elementsRef = useRef([]);
  
  const setElementRef = useCallback((index) => (el) => {
    if (el) {
      elementsRef.current[index] = el;
    }
  }, []);
  
  return (
    <div>
      {[1, 2, 3].map((num, index) => (
        <input
          key={num}
          ref={setElementRef(index)} // ✅ Stable callback
        />
      ))}
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Focus Management System

Build a focus management system that:
- Tracks focus history
- Provides focus navigation (next/previous)
- Handles focus trapping in modals
- Restores focus when components unmount

<details>
<summary>💡 Solution</summary>

```jsx
function useFocusManager() {
  const focusHistoryRef = useRef([]);
  const currentFocusIndexRef = useRef(-1);
  const trapContainerRef = useRef(null);
  const isTrapActiveRef = useRef(false);
  
  const addToHistory = useCallback((element) => {
    if (element && element !== focusHistoryRef.current[currentFocusIndexRef.current]) {
      focusHistoryRef.current.push(element);
      currentFocusIndexRef.current = focusHistoryRef.current.length - 1;
    }
  }, []);
  
  const focusPrevious = useCallback(() => {
    if (currentFocusIndexRef.current > 0) {
      currentFocusIndexRef.current -= 1;
      const element = focusHistoryRef.current[currentFocusIndexRef.current];
      if (element && document.contains(element)) {
        element.focus();
      }
    }
  }, []);
  
  const focusNext = useCallback(() => {
    if (currentFocusIndexRef.current < focusHistoryRef.current.length - 1) {
      currentFocusIndexRef.current += 1;
      const element = focusHistoryRef.current[currentFocusIndexRef.current];
      if (element && document.contains(element)) {
        element.focus();
      }
    }
  }, []);
  
  const enableFocusTrap = useCallback((container) => {
    trapContainerRef.current = container;
    isTrapActiveRef.current = true;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && isTrapActiveRef.current && trapContainerRef.current) {
        const focusableElements = trapContainerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      isTrapActiveRef.current = false;
    };
  }, []);
  
  const disableFocusTrap = useCallback(() => {
    isTrapActiveRef.current = false;
    trapContainerRef.current = null;
  }, []);
  
  useEffect(() => {
    const handleFocus = (e) => {
      if (!isTrapActiveRef.current) {
        addToHistory(e.target);
      }
    };
    
    document.addEventListener('focusin', handleFocus);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, [addToHistory]);
  
  return {
    focusPrevious,
    focusNext,
    enableFocusTrap,
    disableFocusTrap,
    getFocusHistory: () => focusHistoryRef.current
  };
}

function FocusManagementDemo() {
  const { focusPrevious, focusNext, enableFocusTrap, disableFocusTrap } = useFocusManager();
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (showModal && modalRef.current) {
      const cleanup = enableFocusTrap(modalRef.current);
      return cleanup;
    } else {
      disableFocusTrap();
    }
  }, [showModal, enableFocusTrap, disableFocusTrap]);
  
  return (
    <div className="focus-management-demo">
      <h3>Focus Management System</h3>
      
      <div className="controls">
        <button onClick={focusPrevious}>Focus Previous</button>
        <button onClick={focusNext}>Focus Next</button>
        <button onClick={() => setShowModal(true)}>Open Modal</button>
      </div>
      
      <div className="form">
        <input placeholder="Input 1" />
        <input placeholder="Input 2" />
        <button>Button 1</button>
        <textarea placeholder="Textarea"></textarea>
        <button>Button 2</button>
      </div>
      
      {showModal && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal" tabIndex={-1}>
            <h4>Modal with Focus Trap</h4>
            <input placeholder="Modal input 1" />
            <input placeholder="Modal input 2" />
            <button onClick={() => setShowModal(false)}>Close</button>
            <button>Another Button</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

</details>

### Challenge 2: Virtual Scrolling with Refs

Create a virtual scrolling component that:
- Only renders visible items
- Uses refs for scroll position tracking
- Handles dynamic item heights
- Maintains scroll position during updates

<details>
<summary>💡 Solution</summary>

```jsx
function useVirtualScroll({ items, itemHeight, containerHeight, overscan = 5 }) {
  const scrollElementRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index
  }));
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  const scrollToIndex = useCallback((index) => {
    if (scrollElementRef.current) {
      const scrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);
  
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);
  
  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);
  
  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    isScrolling
  };
}

function VirtualScrollDemo() {
  const items = useMemo(() => 
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `Description for item ${i}`
    })),
    []
  );
  
  const {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    isScrolling
  } = useVirtualScroll({
    items,
    itemHeight: 50,
    containerHeight: 400
  });
  
  const [jumpToIndex, setJumpToIndex] = useState('');
  
  const handleJumpTo = () => {
    const index = parseInt(jumpToIndex);
    if (!isNaN(index) && index >= 0 && index < items.length) {
      scrollToIndex(index);
    }
  };
  
  return (
    <div className="virtual-scroll-demo">
      <h3>Virtual Scrolling with Refs</h3>
      
      <div className="controls">
        <button onClick={scrollToTop}>Scroll to Top</button>
        <button onClick={scrollToBottom}>Scroll to Bottom</button>
        
        <div className="jump-controls">
          <input
            type="number"
            value={jumpToIndex}
            onChange={(e) => setJumpToIndex(e.target.value)}
            placeholder="Jump to index"
            min="0"
            max={items.length - 1}
          />
          <button onClick={handleJumpTo}>Jump</button>
        </div>
      </div>
      
      <div className="scroll-info">
        <p>Total items: {items.length}</p>
        <p>Visible items: {visibleItems.length}</p>
        <p>Scrolling: {isScrolling ? 'Yes' : 'No'}</p>
      </div>
      
      <div
        ref={scrollElementRef}
        className="virtual-scroll-container"
        style={{
          height: '400px',
          overflow: 'auto',
          border: '1px solid #ccc'
        }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  height: '50px',
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <br />
                  <small>{item.description}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

</details>

## 🎯 When and Why: useRef Decision Framework

### Quick Decision Tree

```
🤔 Should I use useRef?

├── Do I need to access DOM elements directly?
│   ├── Yes → useRef for DOM reference ✅
│   └── No → Continue...
│
├── Do I need a value that persists but doesn't trigger re-renders?
│   ├── Yes → useRef for mutable value ✅
│   └── No → Continue...
│
├── Do I need to store timer IDs, intervals, or subscriptions?
│   ├── Yes → useRef for cleanup references ✅
│   └── No → Continue...
│
├── Do I need to track previous values?
│   ├── Yes → useRef for previous state ✅
│   └── No → Continue...
│
├── Do I need to prevent stale closures in effects?
│   ├── Yes → useRef for current values ✅
│   └── No → Use useState instead
│
└── Is this for UI state that should trigger re-renders?
    └── Yes → Use useState, not useRef ❌
```

## 🎤 Interview Insights

### Common Interview Questions

1. **"What's the difference between useRef and useState?"**
   - useRef: Mutable, doesn't trigger re-renders, persists between renders
   - useState: Immutable updates, triggers re-renders, for UI state
   - Show examples of when to use each

2. **"How do you access DOM elements in React?"**
   - Use useRef to create a ref
   - Attach ref to JSX element
   - Access via ref.current in effects or event handlers
   - Show focus management example

3. **"What is ref forwarding and when do you use it?"**
   - Passing refs through components to child elements
   - Use forwardRef and useImperativeHandle
   - Common in reusable component libraries
   - Show custom input component example

4. **"How do you prevent memory leaks with refs?"**
   - Store cleanup functions (timers, subscriptions)
   - Check if component is mounted before state updates
   - Clean up in useEffect return function
   - Show timer cleanup example

### Code Review Red Flags

```jsx
// 🚨 Red Flags in Interviews:

// ❌ Using ref for UI state
const countRef = useRef(0);
return <p>{countRef.current}</p>; // Won't update

// ❌ Accessing ref during render
const value = inputRef.current?.value; // May be null/stale

// ❌ Not checking for null
elementRef.current.focus(); // May throw error

// ❌ Inline ref callbacks
ref={(el) => { /* new function every render */ }}

// ❌ Forgetting cleanup
const timer = setInterval(...);
// No cleanup in useEffect return
```

## 🎯 Key Takeaways

### Mental Model

```jsx
// 🧠 Think of useRef as:

// "A box that holds a value that:
//  - Persists between renders
//  - Doesn't trigger re-renders when changed
//  - Can hold any mutable value
//  - Is perfect for DOM access and cleanup"

const ref = useRef(initialValue);
// ref.current = the actual value
// ref itself never changes
```

### Best Practices Summary

1. **Use refs for DOM access** - focus, scroll, measurements
2. **Use refs for mutable values** - timers, counters, flags
3. **Always check for null** - refs may be null initially
4. **Don't access refs during render** - use effects or event handlers
5. **Use ref forwarding** for reusable components
6. **Store cleanup references** - prevent memory leaks
7. **Prefer useState for UI state** - don't use refs for visible data

---

**Next up**: [useMemo: What, When, and Why](./09-useMemo-what-when-why.md) - Master performance optimization and expensive calculation caching.

**Previous**: [useEffect Dependencies & Cleanup](./07-useEffect-dependencies-cleanup.md)

---

*💡 Pro tip: In interviews, demonstrate understanding of when NOT to use refs. Show that you know the difference between mutable refs and immutable state, and always explain your choice.*