# 🎯 Handling DOM Events: User Interactions Mastery

> **Master React's event system: SyntheticEvents, event handling patterns, and building interactive user interfaces**

## 🎯 What You'll Learn

- React's SyntheticEvent system and how it differs from native events
- Event handling patterns and best practices
- Event delegation and performance considerations
- Form events and input handling
- Mouse, keyboard, and touch events
- Event propagation, bubbling, and capturing
- Custom event handlers and event composition
- Common event handling mistakes and solutions

## ⚡ React's SyntheticEvent System

### Understanding SyntheticEvents

```jsx
// React wraps native DOM events in SyntheticEvent objects
// This provides cross-browser compatibility and consistent behavior

function SyntheticEventDemo() {
  const handleClick = (event) => {
    console.log('Event type:', event.type); // 'click'
    console.log('Is SyntheticEvent:', event.nativeEvent !== undefined); // true
    console.log('Target element:', event.target); // The clicked element
    console.log('Current target:', event.currentTarget); // The element with the event handler
    console.log('Native event:', event.nativeEvent); // Original DOM event
    
    // SyntheticEvent properties (cross-browser compatible)
    console.log('Timestamp:', event.timeStamp);
    console.log('Bubbles:', event.bubbles);
    console.log('Cancelable:', event.cancelable);
    
    // Prevent default behavior
    event.preventDefault();
    
    // Stop event propagation
    event.stopPropagation();
  };
  
  const handleMouseEvent = (event) => {
    // Mouse-specific properties
    console.log('Mouse position:', { x: event.clientX, y: event.clientY });
    console.log('Button pressed:', event.button); // 0: left, 1: middle, 2: right
    console.log('Modifier keys:', {
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey // Cmd on Mac, Windows key on PC
    });
  };
  
  const handleKeyEvent = (event) => {
    // Keyboard-specific properties
    console.log('Key pressed:', event.key); // 'a', 'Enter', 'ArrowUp', etc.
    console.log('Key code:', event.keyCode); // Deprecated but still used
    console.log('Which:', event.which); // Deprecated
    console.log('Code:', event.code); // 'KeyA', 'Enter', 'ArrowUp', etc.
    
    // Modern way to check for specific keys
    if (event.key === 'Enter') {
      console.log('Enter key pressed!');
    }
    
    if (event.key === 'Escape') {
      console.log('Escape key pressed!');
    }
  };
  
  return (
    <div>
      <button onClick={handleClick}>
        Click me (check console)
      </button>
      
      <div 
        onMouseMove={handleMouseEvent}
        style={{ 
          width: 200, 
          height: 100, 
          border: '1px solid #ccc',
          margin: '10px 0'
        }}
      >
        Move mouse here
      </div>
      
      <input 
        type="text"
        onKeyDown={handleKeyEvent}
        placeholder="Type here and check console"
      />
    </div>
  );
}
```

### Event Handler Patterns

```jsx
function EventHandlerPatterns() {
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);
  
  // 1. ✅ Inline arrow function (good for simple handlers)
  const inlineHandler = (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
  
  // 2. ✅ Function declaration (good for complex logic)
  function handleComplexClick(event) {
    console.log('Complex click handler');
    setCount(prevCount => prevCount + 1);
    setMessage(`Button clicked at ${new Date().toLocaleTimeString()}`);
  }
  
  // 3. ✅ Arrow function with useCallback (for performance)
  const handleOptimizedClick = useCallback((event) => {
    setCount(prevCount => prevCount + 1);
  }, []); // Empty dependency array since we use functional update
  
  // 4. ✅ Parameterized event handlers
  const handleParameterizedClick = (increment) => (event) => {
    setCount(prevCount => prevCount + increment);
  };
  
  // 5. ✅ Event handler with additional parameters
  const handleClickWithParams = (id, action) => (event) => {
    console.log(`Performing ${action} on item ${id}`);
    // Handle the action
  };
  
  // 6. ❌ WRONG: Calling function immediately
  const wrongHandler = (
    <button onClick={handleComplexClick()}> {/* DON'T DO THIS! */}
      Wrong way
    </button>
  );
  
  return (
    <div>
      <h3>Event Handler Patterns</h3>
      
      {/* Pattern 1: Inline */}
      {inlineHandler}
      
      {/* Pattern 2: Function reference */}
      <button onClick={handleComplexClick}>
        Complex Handler
      </button>
      
      {/* Pattern 3: Optimized with useCallback */}
      <button onClick={handleOptimizedClick}>
        Optimized Handler
      </button>
      
      {/* Pattern 4: Parameterized */}
      <button onClick={handleParameterizedClick(5)}>
        Add 5
      </button>
      <button onClick={handleParameterizedClick(-1)}>
        Subtract 1
      </button>
      
      {/* Pattern 5: With additional parameters */}
      <button onClick={handleClickWithParams('user123', 'delete')}>
        Delete User
      </button>
      
      <p>Message: {message}</p>
    </div>
  );
}
```

## 🖱️ Mouse Events

### Comprehensive Mouse Event Handling

```jsx
function MouseEventHandling() {
  const [mouseState, setMouseState] = useState({
    position: { x: 0, y: 0 },
    isDown: false,
    button: null,
    clickCount: 0,
    dragStart: null,
    isDragging: false
  });
  
  const [hoverState, setHoverState] = useState({
    isHovered: false,
    hoverTime: 0
  });
  
  // Mouse movement tracking
  const handleMouseMove = (event) => {
    setMouseState(prev => ({
      ...prev,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    }));
    
    // If dragging, update drag position
    if (mouseState.isDragging && mouseState.dragStart) {
      const deltaX = event.clientX - mouseState.dragStart.x;
      const deltaY = event.clientY - mouseState.dragStart.y;
      console.log('Drag delta:', { deltaX, deltaY });
    }
  };
  
  // Mouse button events
  const handleMouseDown = (event) => {
    setMouseState(prev => ({
      ...prev,
      isDown: true,
      button: event.button,
      dragStart: {
        x: event.clientX,
        y: event.clientY
      },
      isDragging: true
    }));
    
    // Prevent text selection during drag
    event.preventDefault();
  };
  
  const handleMouseUp = (event) => {
    setMouseState(prev => ({
      ...prev,
      isDown: false,
      button: null,
      dragStart: null,
      isDragging: false
    }));
  };
  
  // Click events
  const handleClick = (event) => {
    setMouseState(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1
    }));
    
    // Different actions based on button
    switch (event.button) {
      case 0: // Left click
        console.log('Left click');
        break;
      case 1: // Middle click
        console.log('Middle click');
        event.preventDefault(); // Prevent default middle-click behavior
        break;
      case 2: // Right click
        console.log('Right click');
        break;
    }
  };
  
  const handleDoubleClick = (event) => {
    console.log('Double click detected');
    setMouseState(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1
    }));
  };
  
  // Context menu (right-click menu)
  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent default context menu
    console.log('Custom context menu would appear here');
  };
  
  // Hover events
  const handleMouseEnter = (event) => {
    setHoverState({
      isHovered: true,
      hoverTime: Date.now()
    });
  };
  
  const handleMouseLeave = (event) => {
    const hoverDuration = Date.now() - hoverState.hoverTime;
    console.log(`Hovered for ${hoverDuration}ms`);
    
    setHoverState({
      isHovered: false,
      hoverTime: 0
    });
  };
  
  // Mouse wheel events
  const handleWheel = (event) => {
    console.log('Wheel delta:', {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ
    });
    
    // Prevent page scroll if needed
    // event.preventDefault();
  };
  
  return (
    <div className="mouse-demo">
      <h3>Mouse Event Demo</h3>
      
      {/* Mouse tracking area */}
      <div 
        className="mouse-area"
        style={{
          width: 400,
          height: 200,
          border: '2px solid #333',
          position: 'relative',
          backgroundColor: hoverState.isHovered ? '#f0f0f0' : '#fff',
          cursor: mouseState.isDragging ? 'grabbing' : 'grab'
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div className="instructions">
          <p>Try different mouse interactions:</p>
          <ul>
            <li>Move mouse to track position</li>
            <li>Click (left, middle, right)</li>
            <li>Double-click</li>
            <li>Right-click for context menu</li>
            <li>Drag to see drag detection</li>
            <li>Scroll wheel</li>
          </ul>
        </div>
        
        {/* Mouse position indicator */}
        <div 
          style={{
            position: 'absolute',
            left: mouseState.position.x - 5,
            top: mouseState.position.y - 5,
            width: 10,
            height: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {/* Mouse state display */}
      <div className="mouse-state">
        <h4>Mouse State:</h4>
        <p>Position: ({mouseState.position.x}, {mouseState.position.y})</p>
        <p>Mouse Down: {mouseState.isDown ? 'Yes' : 'No'}</p>
        <p>Button: {mouseState.button !== null ? mouseState.button : 'None'}</p>
        <p>Click Count: {mouseState.clickCount}</p>
        <p>Dragging: {mouseState.isDragging ? 'Yes' : 'No'}</p>
        <p>Hovered: {hoverState.isHovered ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}
```

## ⌨️ Keyboard Events

### Advanced Keyboard Event Handling

```jsx
function KeyboardEventHandling() {
  const [keyState, setKeyState] = useState({
    lastKey: '',
    keysPressed: new Set(),
    keySequence: [],
    shortcuts: []
  });
  
  const [textInput, setTextInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  // Key down event
  const handleKeyDown = (event) => {
    const key = event.key;
    
    setKeyState(prev => ({
      ...prev,
      lastKey: key,
      keysPressed: new Set([...prev.keysPressed, key]),
      keySequence: [...prev.keySequence, key].slice(-10) // Keep last 10 keys
    }));
    
    // Handle special key combinations
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      console.log('Save shortcut triggered');
      setKeyState(prev => ({
        ...prev,
        shortcuts: [...prev.shortcuts, 'Ctrl+S']
      }));
    }
    
    if (event.ctrlKey && event.key === 'z') {
      event.preventDefault();
      console.log('Undo shortcut triggered');
      setKeyState(prev => ({
        ...prev,
        shortcuts: [...prev.shortcuts, 'Ctrl+Z']
      }));
    }
    
    // Handle arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      console.log(`Arrow key pressed: ${key}`);
      // Prevent default scrolling if needed
      // event.preventDefault();
    }
    
    // Handle escape key
    if (key === 'Escape') {
      console.log('Escape pressed - could close modal, clear input, etc.');
      setTextInput('');
    }
    
    // Handle enter key
    if (key === 'Enter') {
      if (event.shiftKey) {
        console.log('Shift+Enter: New line');
      } else {
        console.log('Enter: Submit form');
        event.preventDefault();
      }
    }
  };
  
  // Key up event
  const handleKeyUp = (event) => {
    setKeyState(prev => {
      const newKeysPressed = new Set(prev.keysPressed);
      newKeysPressed.delete(event.key);
      return {
        ...prev,
        keysPressed: newKeysPressed
      };
    });
  };
  
  // Input composition events (for IME support)
  const handleCompositionStart = (event) => {
    setIsComposing(true);
    console.log('Composition started (IME input)');
  };
  
  const handleCompositionEnd = (event) => {
    setIsComposing(false);
    console.log('Composition ended:', event.data);
  };
  
  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      // Global shortcuts that work anywhere on the page
      if (event.ctrlKey && event.shiftKey && event.key === 'K') {
        event.preventDefault();
        console.log('Global shortcut: Ctrl+Shift+K');
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);
  
  // Custom hook for keyboard shortcuts
  const useKeyboardShortcut = (keys, callback) => {
    useEffect(() => {
      const handleKeyDown = (event) => {
        const pressedKeys = [];
        if (event.ctrlKey) pressedKeys.push('ctrl');
        if (event.shiftKey) pressedKeys.push('shift');
        if (event.altKey) pressedKeys.push('alt');
        if (event.metaKey) pressedKeys.push('meta');
        pressedKeys.push(event.key.toLowerCase());
        
        const shortcut = pressedKeys.join('+');
        if (keys.includes(shortcut)) {
          event.preventDefault();
          callback(event);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [keys, callback]);
  };
  
  // Use the custom hook
  useKeyboardShortcut(['ctrl+k'], () => {
    console.log('Quick search triggered');
  });
  
  return (
    <div className="keyboard-demo">
      <h3>Keyboard Event Demo</h3>
      
      <div className="input-section">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="Type here to test keyboard events..."
          rows={4}
          cols={50}
        />
        
        <p>Composing: {isComposing ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="keyboard-state">
        <h4>Keyboard State:</h4>
        <p>Last Key: {keyState.lastKey}</p>
        <p>Keys Currently Pressed: {Array.from(keyState.keysPressed).join(', ')}</p>
        <p>Key Sequence: {keyState.keySequence.join(' → ')}</p>
        <p>Shortcuts Used: {keyState.shortcuts.join(', ')}</p>
      </div>
      
      <div className="shortcuts-help">
        <h4>Try These Shortcuts:</h4>
        <ul>
          <li>Ctrl+S - Save</li>
          <li>Ctrl+Z - Undo</li>
          <li>Ctrl+K - Quick search</li>
          <li>Ctrl+Shift+K - Global shortcut</li>
          <li>Escape - Clear input</li>
          <li>Enter - Submit</li>
          <li>Shift+Enter - New line</li>
        </ul>
      </div>
    </div>
  );
}
```

## 📝 Form Events

### Comprehensive Form Event Handling

```jsx
function FormEventHandling() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    country: '',
    interests: [],
    newsletter: false,
    bio: ''
  });
  
  const [formState, setFormState] = useState({
    isDirty: false,
    isValid: false,
    errors: {},
    touchedFields: new Set(),
    isSubmitting: false
  });
  
  // Input change handler
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    setFormState(prev => ({
      ...prev,
      isDirty: true,
      touchedFields: new Set([...prev.touchedFields, name])
    }));
    
    // Real-time validation
    validateField(name, type === 'checkbox' ? checked : value);
  };
  
  // Multi-select handler
  const handleMultiSelectChange = (event) => {
    const { name, value } = event.target;
    
    setFormData(prev => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [name]: newValues
      };
    });
  };
  
  // Field validation
  const validateField = (fieldName, value) => {
    const errors = { ...formState.errors };
    
    switch (fieldName) {
      case 'username':
        if (!value.trim()) {
          errors.username = 'Username is required';
        } else if (value.length < 3) {
          errors.username = 'Username must be at least 3 characters';
        } else {
          delete errors.username;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          delete errors.password;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
        
      case 'age':
        const ageNum = parseInt(value);
        if (!value) {
          errors.age = 'Age is required';
        } else if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
          errors.age = 'Please enter a valid age (13-120)';
        } else {
          delete errors.age;
        }
        break;
    }
    
    setFormState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }));
  };
  
  // Focus and blur events
  const handleFocus = (event) => {
    const { name } = event.target;
    console.log(`Field focused: ${name}`);
    
    // Could show help text, highlight field, etc.
  };
  
  const handleBlur = (event) => {
    const { name, value } = event.target;
    console.log(`Field blurred: ${name}`);
    
    setFormState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, name])
    }));
    
    // Validate on blur
    validateField(name, value);
  };
  
  // Form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    
    if (formState.isValid) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('Form submitted:', formData);
        alert('Form submitted successfully!');
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          age: '',
          country: '',
          interests: [],
          newsletter: false,
          bio: ''
        });
        
        setFormState({
          isDirty: false,
          isValid: false,
          errors: {},
          touchedFields: new Set(),
          isSubmitting: false
        });
      } catch (error) {
        console.error('Submission error:', error);
        setFormState(prev => ({ ...prev, isSubmitting: false }));
      }
    } else {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      console.log('Form has errors:', formState.errors);
    }
  };
  
  // Form reset
  const handleReset = (event) => {
    // event.preventDefault(); // Uncomment to prevent default reset
    console.log('Form reset');
    
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      country: '',
      interests: [],
      newsletter: false,
      bio: ''
    });
    
    setFormState({
      isDirty: false,
      isValid: false,
      errors: {},
      touchedFields: new Set(),
      isSubmitting: false
    });
  };
  
  return (
    <div className="form-demo">
      <h3>Form Event Handling Demo</h3>
      
      <form onSubmit={handleSubmit} onReset={handleReset}>
        {/* Text input */}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={formState.errors.username ? 'error' : ''}
          />
          {formState.errors.username && (
            <span className="error-message">{formState.errors.username}</span>
          )}
        </div>
        
        {/* Email input */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={formState.errors.email ? 'error' : ''}
          />
          {formState.errors.email && (
            <span className="error-message">{formState.errors.email}</span>
          )}
        </div>
        
        {/* Password input */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={formState.errors.password ? 'error' : ''}
          />
          {formState.errors.password && (
            <span className="error-message">{formState.errors.password}</span>
          )}
        </div>
        
        {/* Confirm password */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={formState.errors.confirmPassword ? 'error' : ''}
          />
          {formState.errors.confirmPassword && (
            <span className="error-message">{formState.errors.confirmPassword}</span>
          )}
        </div>
        
        {/* Number input */}
        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            min="13"
            max="120"
            className={formState.errors.age ? 'error' : ''}
          />
          {formState.errors.age && (
            <span className="error-message">{formState.errors.age}</span>
          )}
        </div>
        
        {/* Select dropdown */}
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="">Select a country</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
          </select>
        </div>
        
        {/* Checkboxes */}
        <div className="form-group">
          <label>Interests:</label>
          {['Technology', 'Sports', 'Music', 'Travel', 'Cooking'].map(interest => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                name="interests"
                value={interest}
                checked={formData.interests.includes(interest)}
                onChange={handleMultiSelectChange}
              />
              {interest}
            </label>
          ))}
        </div>
        
        {/* Single checkbox */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleInputChange}
            />
            Subscribe to newsletter
          </label>
        </div>
        
        {/* Textarea */}
        <div className="form-group">
          <label htmlFor="bio">Bio:</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>
        
        {/* Form actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={!formState.isValid || formState.isSubmitting}
          >
            {formState.isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="reset">Reset</button>
        </div>
      </form>
      
      {/* Form state display */}
      <div className="form-state">
        <h4>Form State:</h4>
        <p>Dirty: {formState.isDirty ? 'Yes' : 'No'}</p>
        <p>Valid: {formState.isValid ? 'Yes' : 'No'}</p>
        <p>Submitting: {formState.isSubmitting ? 'Yes' : 'No'}</p>
        <p>Touched Fields: {Array.from(formState.touchedFields).join(', ')}</p>
        <p>Errors: {Object.keys(formState.errors).length}</p>
      </div>
    </div>
  );
}
```

## 🌊 Event Propagation and Delegation

### Understanding Event Flow

```jsx
function EventPropagationDemo() {
  const [eventLog, setEventLog] = useState([]);
  
  const logEvent = (phase, element, event) => {
    setEventLog(prev => [...prev, {
      id: Date.now() + Math.random(),
      phase,
      element,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };
  
  const clearLog = () => setEventLog([]);
  
  // Event handlers for different phases
  const handleGrandparentCapture = (event) => {
    logEvent('Capture', 'Grandparent', event);
  };
  
  const handleGrandparentBubble = (event) => {
    logEvent('Bubble', 'Grandparent', event);
  };
  
  const handleParentCapture = (event) => {
    logEvent('Capture', 'Parent', event);
  };
  
  const handleParentBubble = (event) => {
    logEvent('Bubble', 'Parent', event);
  };
  
  const handleChildClick = (event) => {
    logEvent('Target', 'Child', event);
    
    // Uncomment to stop propagation
    // event.stopPropagation();
  };
  
  const handleChildStopPropagation = (event) => {
    logEvent('Target', 'Child (Stop Propagation)', event);
    event.stopPropagation(); // Stops bubbling
  };
  
  const handleChildPreventDefault = (event) => {
    logEvent('Target', 'Child (Prevent Default)', event);
    event.preventDefault(); // Prevents default behavior
  };
  
  return (
    <div className="propagation-demo">
      <h3>Event Propagation Demo</h3>
      
      <div className="controls">
        <button onClick={clearLog}>Clear Log</button>
      </div>
      
      {/* Event propagation example */}
      <div 
        className="grandparent"
        style={{
          padding: '20px',
          border: '3px solid red',
          backgroundColor: '#ffe6e6'
        }}
        onClickCapture={handleGrandparentCapture}
        onClick={handleGrandparentBubble}
      >
        <strong>Grandparent (Red)</strong>
        
        <div 
          className="parent"
          style={{
            padding: '20px',
            border: '3px solid blue',
            backgroundColor: '#e6f3ff',
            margin: '10px'
          }}
          onClickCapture={handleParentCapture}
          onClick={handleParentBubble}
        >
          <strong>Parent (Blue)</strong>
          
          <div style={{ margin: '10px' }}>
            <button 
              className="child"
              style={{
                padding: '10px',
                border: '3px solid green',
                backgroundColor: '#e6ffe6',
                margin: '5px'
              }}
              onClick={handleChildClick}
            >
              Child (Normal)
            </button>
            
            <button 
              className="child"
              style={{
                padding: '10px',
                border: '3px solid green',
                backgroundColor: '#e6ffe6',
                margin: '5px'
              }}
              onClick={handleChildStopPropagation}
            >
              Child (Stop Propagation)
            </button>
            
            <a 
              href="#"
              style={{
                display: 'inline-block',
                padding: '10px',
                border: '3px solid green',
                backgroundColor: '#e6ffe6',
                margin: '5px',
                textDecoration: 'none'
              }}
              onClick={handleChildPreventDefault}
            >
              Link (Prevent Default)
            </a>
          </div>
        </div>
      </div>
      
      {/* Event log */}
      <div className="event-log">
        <h4>Event Log (Order of Execution):</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {eventLog.map(log => (
            <div key={log.id} className="log-entry">
              <span className="timestamp">{log.timestamp}</span>
              <span className="phase">{log.phase}</span>
              <span className="element">{log.element}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="explanation">
        <h4>Event Flow Explanation:</h4>
        <ol>
          <li><strong>Capture Phase:</strong> Event travels from root to target</li>
          <li><strong>Target Phase:</strong> Event reaches the target element</li>
          <li><strong>Bubble Phase:</strong> Event bubbles back up to root</li>
        </ol>
        <p>Click different buttons to see how stopPropagation() and preventDefault() affect the flow.</p>
      </div>
    </div>
  );
}
```

### Event Delegation Pattern

```jsx
function EventDelegationDemo() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', type: 'task' },
    { id: 2, name: 'Item 2', type: 'note' },
    { id: 3, name: 'Item 3', type: 'task' },
    { id: 4, name: 'Item 4', type: 'note' }
  ]);
  
  // ❌ INEFFICIENT: Individual event handlers for each item
  const renderWithIndividualHandlers = () => {
    return items.map(item => (
      <div key={item.id} className="item">
        <span>{item.name}</span>
        <button onClick={() => editItem(item.id)}>Edit</button>
        <button onClick={() => deleteItem(item.id)}>Delete</button>
        <button onClick={() => duplicateItem(item.id)}>Duplicate</button>
      </div>
    ));
  };
  
  // ✅ EFFICIENT: Event delegation with single handler
  const handleItemAction = (event) => {
    const action = event.target.dataset.action;
    const itemId = parseInt(event.target.dataset.itemId);
    
    if (!action || !itemId) return;
    
    switch (action) {
      case 'edit':
        editItem(itemId);
        break;
      case 'delete':
        deleteItem(itemId);
        break;
      case 'duplicate':
        duplicateItem(itemId);
        break;
      case 'toggle':
        toggleItem(itemId);
        break;
    }
  };
  
  const renderWithDelegation = () => {
    return (
      <div className="items-container" onClick={handleItemAction}>
        {items.map(item => (
          <div key={item.id} className="item">
            <input 
              type="checkbox"
              data-action="toggle"
              data-item-id={item.id}
            />
            <span>{item.name} ({item.type})</span>
            <button 
              data-action="edit"
              data-item-id={item.id}
            >
              Edit
            </button>
            <button 
              data-action="delete"
              data-item-id={item.id}
            >
              Delete
            </button>
            <button 
              data-action="duplicate"
              data-item-id={item.id}
            >
              Duplicate
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  // Action handlers
  const editItem = (id) => {
    console.log(`Editing item ${id}`);
    const newName = prompt('Enter new name:');
    if (newName) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, name: newName } : item
      ));
    }
  };
  
  const deleteItem = (id) => {
    console.log(`Deleting item ${id}`);
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const duplicateItem = (id) => {
    console.log(`Duplicating item ${id}`);
    const item = items.find(item => item.id === id);
    if (item) {
      const newItem = {
        ...item,
        id: Math.max(...items.map(i => i.id)) + 1,
        name: `${item.name} (Copy)`
      };
      setItems(prev => [...prev, newItem]);
    }
  };
  
  const toggleItem = (id) => {
    console.log(`Toggling item ${id}`);
    // Toggle logic here
  };
  
  const addItem = () => {
    const newItem = {
      id: Math.max(...items.map(i => i.id)) + 1,
      name: `Item ${items.length + 1}`,
      type: Math.random() > 0.5 ? 'task' : 'note'
    };
    setItems(prev => [...prev, newItem]);
  };
  
  return (
    <div className="delegation-demo">
      <h3>Event Delegation Demo</h3>
      
      <button onClick={addItem}>Add Item</button>
      
      <h4>✅ With Event Delegation (Efficient):</h4>
      {renderWithDelegation()}
      
      <div className="performance-note">
        <p><strong>Performance Benefits:</strong></p>
        <ul>
          <li>Single event listener instead of multiple</li>
          <li>Better memory usage</li>
          <li>Automatically handles dynamically added elements</li>
          <li>Easier to manage and maintain</li>
        </ul>
      </div>
    </div>
  );
}
```

## 📱 Touch Events

### Mobile Touch Event Handling

```jsx
function TouchEventHandling() {
  const [touchState, setTouchState] = useState({
    touches: [],
    gesture: null,
    swipeDirection: null,
    pinchScale: 1,
    rotation: 0
  });
  
  const [dragState, setDragState] = useState({
    isDragging: false,
    startPosition: null,
    currentPosition: null
  });
  
  // Touch start
  const handleTouchStart = (event) => {
    const touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));
    
    setTouchState(prev => ({
      ...prev,
      touches
    }));
    
    if (touches.length === 1) {
      setDragState({
        isDragging: true,
        startPosition: { x: touches[0].x, y: touches[0].y },
        currentPosition: { x: touches[0].x, y: touches[0].y }
      });
    }
    
    console.log(`Touch start: ${touches.length} touches`);
  };
  
  // Touch move
  const handleTouchMove = (event) => {
    event.preventDefault(); // Prevent scrolling
    
    const touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));
    
    setTouchState(prev => ({
      ...prev,
      touches
    }));
    
    // Single finger drag
    if (touches.length === 1 && dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentPosition: { x: touches[0].x, y: touches[0].y }
      }));
    }
    
    // Two finger gestures (pinch/zoom)
    if (touches.length === 2) {
      const [touch1, touch2] = touches;
      const distance = Math.sqrt(
        Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
      );
      
      // Calculate rotation
      const angle = Math.atan2(touch2.y - touch1.y, touch2.x - touch1.x) * 180 / Math.PI;
      
      setTouchState(prev => ({
        ...prev,
        gesture: 'pinch',
        pinchScale: distance / 100, // Normalize
        rotation: angle
      }));
    }
  };
  
  // Touch end
  const handleTouchEnd = (event) => {
    const remainingTouches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY
    }));
    
    // Detect swipe gesture
    if (dragState.isDragging && dragState.startPosition && dragState.currentPosition) {
      const deltaX = dragState.currentPosition.x - dragState.startPosition.x;
      const deltaY = dragState.currentPosition.y - dragState.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > 50) { // Minimum swipe distance
        let direction;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
        
        setTouchState(prev => ({
          ...prev,
          swipeDirection: direction
        }));
        
        console.log(`Swipe detected: ${direction}`);
        
        // Clear swipe direction after a delay
        setTimeout(() => {
          setTouchState(prev => ({
            ...prev,
            swipeDirection: null
          }));
        }, 1000);
      }
    }
    
    setTouchState(prev => ({
      ...prev,
      touches: remainingTouches,
      gesture: remainingTouches.length > 1 ? prev.gesture : null
    }));
    
    if (remainingTouches.length === 0) {
      setDragState({
        isDragging: false,
        startPosition: null,
        currentPosition: null
      });
    }
    
    console.log(`Touch end: ${remainingTouches.length} touches remaining`);
  };
  
  // Touch cancel (when touch is interrupted)
  const handleTouchCancel = (event) => {
    console.log('Touch cancelled');
    setTouchState({
      touches: [],
      gesture: null,
      swipeDirection: null,
      pinchScale: 1,
      rotation: 0
    });
    
    setDragState({
      isDragging: false,
      startPosition: null,
      currentPosition: null
    });
  };
  
  return (
    <div className="touch-demo">
      <h3>Touch Event Handling Demo</h3>
      
      <div 
        className="touch-area"
        style={{
          width: 300,
          height: 200,
          border: '2px solid #333',
          backgroundColor: '#f0f0f0',
          position: 'relative',
          touchAction: 'none', // Disable default touch behaviors
          transform: `scale(${touchState.pinchScale}) rotate(${touchState.rotation}deg)`,
          transition: touchState.gesture ? 'none' : 'transform 0.2s'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="instructions">
          <p>Touch Area</p>
          <p>Try:</p>
          <ul>
            <li>Single finger drag</li>
            <li>Swipe gestures</li>
            <li>Two finger pinch/zoom</li>
            <li>Two finger rotation</li>
          </ul>
        </div>
        
        {/* Visualize touch points */}
        {touchState.touches.map(touch => (
          <div
            key={touch.id}
            style={{
              position: 'absolute',
              left: touch.x - 10,
              top: touch.y - 10,
              width: 20,
              height: 20,
              backgroundColor: 'red',
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />
        ))}
        
        {/* Show swipe direction */}
        {touchState.swipeDirection && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'blue'
            }}
          >
            Swipe: {touchState.swipeDirection.toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Touch state display */}
      <div className="touch-state">
        <h4>Touch State:</h4>
        <p>Active Touches: {touchState.touches.length}</p>
        <p>Gesture: {touchState.gesture || 'None'}</p>
        <p>Swipe Direction: {touchState.swipeDirection || 'None'}</p>
        <p>Pinch Scale: {touchState.pinchScale.toFixed(2)}</p>
        <p>Rotation: {touchState.rotation.toFixed(1)}°</p>
        <p>Dragging: {dragState.isDragging ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="touch-tips">
        <h4>Touch Event Tips:</h4>
        <ul>
          <li>Use <code>touchAction: 'none'</code> to disable default behaviors</li>
          <li>Always call <code>preventDefault()</code> in touchmove to prevent scrolling</li>
          <li>Handle <code>touchcancel</code> for interrupted touches</li>
          <li>Use touch identifiers to track individual fingers</li>
          <li>Consider gesture libraries for complex interactions</li>
        </ul>
      </div>
    </div>
  );
}
```

## ⚠️ Common Mistakes & Anti-Patterns

### 1. Event Handler Performance Issues

```jsx
// ❌ WRONG: Creating new functions on every render
function PerformanceIssues({ items }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {/* New function created on every render! */}
          <button onClick={() => console.log(item.id)}>Click</button>
          
          {/* Inline object creation */}
          <div style={{ color: item.active ? 'green' : 'red' }}>
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
}

// ✅ CORRECT: Optimized event handlers
function OptimizedEventHandlers({ items }) {
  // Memoized handler
  const handleItemClick = useCallback((itemId) => {
    console.log(itemId);
  }, []);
  
  // Memoized style objects
  const activeStyle = useMemo(() => ({ color: 'green' }), []);
  const inactiveStyle = useMemo(() => ({ color: 'red' }), []);
  
  return (
    <div>
      {items.map(item => (
        <ItemComponent 
          key={item.id}
          item={item}
          onClick={handleItemClick}
          activeStyle={activeStyle}
          inactiveStyle={inactiveStyle}
        />
      ))}
    </div>
  );
}

const ItemComponent = memo(({ item, onClick, activeStyle, inactiveStyle }) => {
  const handleClick = useCallback(() => {
    onClick(item.id);
  }, [item.id, onClick]);
  
  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <div style={item.active ? activeStyle : inactiveStyle}>
        {item.name}
      </div>
    </div>
  );
});
```

### 2. Event Object Persistence

```jsx
// ❌ WRONG: Accessing event after async operation
function EventPersistenceIssue() {
  const handleClick = (event) => {
    // This will cause an error!
    setTimeout(() => {
      console.log(event.target.value); // Error: event is pooled
    }, 1000);
  };
  
  return <button onClick={handleClick}>Click me</button>;
}

// ✅ CORRECT: Persist event data
function EventPersistenceFixed() {
  const handleClick = (event) => {
    // Extract needed data immediately
    const targetValue = event.target.value;
    const eventType = event.type;
    
    setTimeout(() => {
      console.log(targetValue); // Works!
      console.log(eventType); // Works!
    }, 1000);
    
    // Alternative: persist the entire event (React 17+)
    // event.persist();
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### 3. Incorrect Event Binding

```jsx
// ❌ WRONG: Common binding mistakes
function EventBindingMistakes() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      {/* ❌ Calling function immediately */}
      <button onClick={setCount(count + 1)}>Wrong</button>
      
      {/* ❌ Missing function reference */}
      <button onClick="handleClick()">Wrong</button>
      
      {/* ❌ Incorrect this binding (class components) */}
      <button onClick={this.handleClick}>Might be wrong</button>
    </div>
  );
}

// ✅ CORRECT: Proper event binding
function EventBindingCorrect() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      {/* ✅ Function reference */}
      <button onClick={handleClick}>Correct</button>
      
      {/* ✅ Inline arrow function */}
      <button onClick={() => setCount(prev => prev + 1)}>Correct</button>
      
      {/* ✅ Functional update */}
      <button onClick={() => setCount(count + 1)}>Correct</button>
    </div>
  );
}
```

## 🧪 Mini Challenges

### Challenge 1: Keyboard Shortcut Manager

Build a component that:
- Registers multiple keyboard shortcuts
- Shows active shortcuts
- Handles conflicts
- Allows enabling/disabling shortcuts

<details>
<summary>💡 Solution</summary>

```jsx
function KeyboardShortcutManager() {
  const [shortcuts, setShortcuts] = useState([
    { id: 1, keys: 'ctrl+s', action: 'Save', enabled: true },
    { id: 2, keys: 'ctrl+z', action: 'Undo', enabled: true },
    { id: 3, keys: 'ctrl+y', action: 'Redo', enabled: true },
    { id: 4, keys: 'ctrl+k', action: 'Search', enabled: true },
    { id: 5, keys: 'escape', action: 'Cancel', enabled: true }
  ]);
  
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [lastTriggered, setLastTriggered] = useState(null);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      const pressedKeys = [];
      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      if (event.metaKey) pressedKeys.push('meta');
      pressedKeys.push(event.key.toLowerCase());
      
      const keyCombo = pressedKeys.join('+');
      
      setActiveKeys(new Set(pressedKeys));
      
      const matchedShortcut = shortcuts.find(
        shortcut => shortcut.enabled && shortcut.keys === keyCombo
      );
      
      if (matchedShortcut) {
        event.preventDefault();
        setLastTriggered({
          shortcut: matchedShortcut,
          timestamp: new Date().toLocaleTimeString()
        });
        console.log(`Triggered: ${matchedShortcut.action}`);
      }
    };
    
    const handleKeyUp = () => {
      setActiveKeys(new Set());
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts]);
  
  const toggleShortcut = (id) => {
    setShortcuts(prev => prev.map(shortcut => 
      shortcut.id === id 
        ? { ...shortcut, enabled: !shortcut.enabled }
        : shortcut
    ));
  };
  
  const addShortcut = (keys, action) => {
    const newShortcut = {
      id: Math.max(...shortcuts.map(s => s.id)) + 1,
      keys,
      action,
      enabled: true
    };
    setShortcuts(prev => [...prev, newShortcut]);
  };
  
  return (
    <div className="shortcut-manager">
      <h3>Keyboard Shortcut Manager</h3>
      
      <div className="active-keys">
        <h4>Currently Pressed Keys:</h4>
        <p>{Array.from(activeKeys).join(' + ') || 'None'}</p>
      </div>
      
      {lastTriggered && (
        <div className="last-triggered">
          <h4>Last Triggered:</h4>
          <p>{lastTriggered.shortcut.action} at {lastTriggered.timestamp}</p>
        </div>
      )}
      
      <div className="shortcuts-list">
        <h4>Registered Shortcuts:</h4>
        {shortcuts.map(shortcut => (
          <div key={shortcut.id} className="shortcut-item">
            <span className={`keys ${shortcut.enabled ? 'enabled' : 'disabled'}`}>
              {shortcut.keys}
            </span>
            <span className="action">{shortcut.action}</span>
            <button onClick={() => toggleShortcut(shortcut.id)}>
              {shortcut.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

</details>

### Challenge 2: Advanced Form Validation

Create a form with:
- Real-time validation
- Custom validation rules
- Field dependencies
- Async validation

<details>
<summary>💡 Solution</summary>

```jsx
function AdvancedFormValidation() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    terms: false
  });
  
  const [validationState, setValidationState] = useState({
    errors: {},
    isValidating: {},
    touchedFields: new Set()
  });
  
  // Validation rules
  const validationRules = {
    username: [
      { rule: (value) => value.length >= 3, message: 'Username must be at least 3 characters' },
      { rule: (value) => /^[a-zA-Z0-9_]+$/.test(value), message: 'Username can only contain letters, numbers, and underscores' }
    ],
    email: [
      { rule: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: 'Please enter a valid email' }
    ],
    password: [
      { rule: (value) => value.length >= 8, message: 'Password must be at least 8 characters' },
      { rule: (value) => /(?=.*[a-z])/.test(value), message: 'Password must contain lowercase letter' },
      { rule: (value) => /(?=.*[A-Z])/.test(value), message: 'Password must contain uppercase letter' },
      { rule: (value) => /(?=.*\d)/.test(value), message: 'Password must contain number' }
    ],
    confirmPassword: [
      { rule: (value) => value === formData.password, message: 'Passwords do not match' }
    ],
    age: [
      { rule: (value) => parseInt(value) >= 13, message: 'Must be at least 13 years old' },
      { rule: (value) => parseInt(value) <= 120, message: 'Please enter a valid age' }
    ],
    terms: [
      { rule: (value) => value === true, message: 'You must accept the terms' }
    ]
  };
  
  // Async validation (simulate API call)
  const asyncValidateUsername = async (username) => {
    if (username.length < 3) return;
    
    setValidationState(prev => ({
      ...prev,
      isValidating: { ...prev.isValidating, username: true }
    }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isAvailable = !['admin', 'user', 'test'].includes(username.toLowerCase());
    
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      if (!isAvailable) {
        newErrors.username = 'Username is already taken';
      } else {
        delete newErrors.username;
      }
      
      return {
        ...prev,
        errors: newErrors,
        isValidating: { ...prev.isValidating, username: false }
      };
    });
  };
  
  const validateField = (fieldName, value) => {
    const rules = validationRules[fieldName] || [];
    const errors = { ...validationState.errors };
    
    for (const { rule, message } of rules) {
      if (!rule(value)) {
        errors[fieldName] = message;
        break;
      } else {
        delete errors[fieldName];
      }
    }
    
    setValidationState(prev => ({
      ...prev,
      errors
    }));
    
    // Async validation for username
    if (fieldName === 'username' && !errors[fieldName]) {
      asyncValidateUsername(value);
    }
  };
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate field if it's been touched
    if (validationState.touchedFields.has(name)) {
      validateField(name, newValue);
    }
  };
  
  const handleBlur = (event) => {
    const { name, value } = event.target;
    
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, name])
    }));
    
    validateField(name, value);
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    
    const hasErrors = Object.keys(validationState.errors).length > 0;
    const isValidating = Object.values(validationState.isValidating).some(Boolean);
    
    if (!hasErrors && !isValidating) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="advanced-form">
      <h3>Advanced Form Validation</h3>
      
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={validationState.errors.username ? 'error' : ''}
        />
        {validationState.isValidating.username && <span className="validating">Checking availability...</span>}
        {validationState.errors.username && <span className="error-message">{validationState.errors.username}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={validationState.errors.email ? 'error' : ''}
        />
        {validationState.errors.email && <span className="error-message">{validationState.errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={validationState.errors.password ? 'error' : ''}
        />
        {validationState.errors.password && <span className="error-message">{validationState.errors.password}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={validationState.errors.confirmPassword ? 'error' : ''}
        />
        {validationState.errors.confirmPassword && <span className="error-message">{validationState.errors.confirmPassword}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="age">Age:</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={validationState.errors.age ? 'error' : ''}
        />
        {validationState.errors.age && <span className="error-message">{validationState.errors.age}</span>}
      </div>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />
          I accept the terms and conditions
        </label>
        {validationState.errors.terms && <span className="error-message">{validationState.errors.terms}</span>}
      </div>
      
      <button 
        type="submit" 
        disabled={Object.keys(validationState.errors).length > 0 || Object.values(validationState.isValidating).some(Boolean)}
      >
        Submit
      </button>
    </form>
  );
}
```

</details>

## 🎯 When and Why to Use Different Event Patterns

### Event Handler Patterns Decision Tree

```
📊 Choosing the Right Event Handler Pattern:

1. **Simple, one-time actions** → Inline arrow functions
   Example: onClick={() => setCount(count + 1)}

2. **Complex logic or reusable handlers** → Function declarations
   Example: const handleComplexSubmit = (event) => { /* complex logic */ }

3. **Performance-critical components** → useCallback + memo
   Example: const optimizedHandler = useCallback(() => {}, [deps])

4. **Dynamic parameters** → Higher-order functions
   Example: const handleClick = (id) => (event) => { /* use id */ }

5. **Many similar elements** → Event delegation
   Example: Single handler on parent with event.target checks

6. **Global shortcuts** → useEffect with document listeners
   Example: Global keyboard shortcuts, escape key handling
```

### Performance Considerations

```jsx
// 🎯 Performance Guidelines

// ✅ Good for small lists or simple interactions
const SimpleList = ({ items }) => (
  <div>
    {items.map(item => (
      <button key={item.id} onClick={() => handleClick(item.id)}>
        {item.name}
      </button>
    ))}
  </div>
);

// ✅ Better for large lists or complex components
const OptimizedList = ({ items }) => {
  const handleClick = useCallback((event) => {
    const itemId = event.target.dataset.itemId;
    // Handle click
  }, []);
  
  return (
    <div onClick={handleClick}>
      {items.map(item => (
        <button key={item.id} data-item-id={item.id}>
          {item.name}
        </button>
      ))}
    </div>
  );
};
```

## 🎤 Interview Insights

### Common Interview Questions

1. **"Explain React's SyntheticEvent system"**
   - Cross-browser compatibility wrapper
   - Event pooling (React 16 and earlier)
   - Access to native event via `nativeEvent`
   - Consistent API across browsers

2. **"How do you handle performance with many event handlers?"**
   - Event delegation pattern
   - useCallback for expensive handlers
   - React.memo for component optimization
   - Avoid inline functions in render-heavy components

3. **"What's the difference between onClick and onClickCapture?"**
   - onClick: Bubble phase (default)
   - onClickCapture: Capture phase
   - Event flow: Capture → Target → Bubble

4. **"How do you prevent event bubbling?"**
   - `event.stopPropagation()` - Stops bubbling
   - `event.preventDefault()` - Prevents default behavior
   - `event.stopImmediatePropagation()` - Stops all handlers

5. **"Explain event delegation and when to use it"**
   - Single event listener on parent element
   - Use `event.target` to determine actual clicked element
   - Better performance for large lists
   - Automatically handles dynamically added elements

### Code Review Red Flags

```jsx
// 🚨 Red flags interviewers look for:

// 1. Calling functions immediately
<button onClick={handleClick()}> // ❌ Wrong

// 2. Not handling async operations properly
const handleClick = (event) => {
  setTimeout(() => {
    console.log(event.target); // ❌ Event is pooled
  }, 1000);
};

// 3. Memory leaks with global listeners
useEffect(() => {
  document.addEventListener('click', handler);
  // ❌ Missing cleanup
}, []);

// 4. Inefficient re-renders
{items.map(item => (
  <div onClick={() => expensive(item)}> // ❌ New function every render
))}

// 5. Not preventing default when needed
const handleSubmit = (event) => {
  // ❌ Missing event.preventDefault()
  // Form will submit and page will reload
};
```

## 🎯 Key Takeaways

1. **SyntheticEvents** provide cross-browser compatibility and consistent behavior
2. **Event delegation** is crucial for performance with large lists
3. **useCallback** and **memo** help optimize event handler performance
4. **Event propagation** understanding is essential for complex UIs
5. **Touch events** require special handling for mobile experiences
6. **Form events** need careful validation and state management
7. **Global event listeners** must be cleaned up to prevent memory leaks
8. **Event persistence** is important for async operations

---

**Next up**: [06-controlled-vs-uncontrolled-inputs.md](06-controlled-vs-uncontrolled-inputs.md) - Master form input patterns and when to use each approach!