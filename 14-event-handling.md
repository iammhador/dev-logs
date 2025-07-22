# 📚 Chapter 14: Event Handling

> Master the art of creating interactive web applications through effective event management.

## 📖 Plain English Explanation

Event handling is like being a receptionist at a busy office:
- **Events** = phone calls, visitors, emails coming in
- **Event listeners** = your ears and eyes watching for these events
- **Event handlers** = your responses to each type of event
- **Event delegation** = training assistants to handle certain types of calls
- **Event bubbling** = how information travels up the company hierarchy
- **Event capturing** = intercepting information before it reaches its destination

Events are actions that happen in the browser - clicks, key presses, mouse movements, form submissions, page loads, etc. Event handling is how we make our web pages respond to these actions.

## 🎯 Event Fundamentals

### Adding Event Listeners
```javascript
// Modern way (recommended)
const button = document.querySelector('#my-button');

// Basic event listener
button.addEventListener('click', function(event) {
    console.log('Button clicked!');
    console.log('Event object:', event);
});

// Arrow function syntax
button.addEventListener('click', (event) => {
    console.log('Button clicked with arrow function!');
});

// Named function (easier to remove later)
function handleButtonClick(event) {
    console.log('Button clicked with named function!');
}
button.addEventListener('click', handleButtonClick);

// Multiple event listeners on same element
button.addEventListener('click', handleButtonClick);
button.addEventListener('click', anotherClickHandler);
button.addEventListener('mouseenter', handleMouseEnter);
button.addEventListener('mouseleave', handleMouseLeave);

// Event listener options
button.addEventListener('click', handleClick, {
    once: true,        // Remove after first execution
    passive: true,     // Never calls preventDefault()
    capture: true      // Capture phase instead of bubble phase
});

// Legacy ways (avoid these)
// HTML attribute: <button onclick="handleClick()">Click me</button>
// DOM property: button.onclick = handleClick;
```

### Removing Event Listeners
```javascript
// Remove specific event listener
button.removeEventListener('click', handleButtonClick);

// Anonymous functions can't be removed!
// ❌ This won't work:
button.addEventListener('click', () => console.log('click'));
button.removeEventListener('click', () => console.log('click')); // Different function!

// ✅ Use named functions or store references:
const clickHandler = () => console.log('click');
button.addEventListener('click', clickHandler);
button.removeEventListener('click', clickHandler); // This works!

// Utility function for temporary event listeners
function addTemporaryListener(element, eventType, handler, duration) {
    element.addEventListener(eventType, handler);
    
    setTimeout(() => {
        element.removeEventListener(eventType, handler);
        console.log(`Removed ${eventType} listener after ${duration}ms`);
    }, duration);
}

// Usage
addTemporaryListener(button, 'click', handleClick, 5000); // Remove after 5 seconds

// Clean up all listeners (nuclear option)
function removeAllListeners(element) {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
}
```

### Event Object Properties
```javascript
function handleEvent(event) {
    // Target vs CurrentTarget
    console.log('event.target:', event.target);           // Element that triggered the event
    console.log('event.currentTarget:', event.currentTarget); // Element with the listener
    
    // Event type and timing
    console.log('event.type:', event.type);               // 'click', 'keydown', etc.
    console.log('event.timeStamp:', event.timeStamp);     // When event occurred
    
    // Event flow control
    console.log('event.bubbles:', event.bubbles);         // Does event bubble?
    console.log('event.cancelable:', event.cancelable);   // Can be cancelled?
    
    // Prevent default behavior
    event.preventDefault(); // Stop default action (form submit, link navigation)
    
    // Stop event propagation
    event.stopPropagation();          // Stop bubbling to parent elements
    event.stopImmediatePropagation(); // Stop other listeners on same element
    
    // Mouse events specific properties
    if (event.type.startsWith('mouse') || event.type === 'click') {
        console.log('Mouse position:', event.clientX, event.clientY);
        console.log('Page position:', event.pageX, event.pageY);
        console.log('Screen position:', event.screenX, event.screenY);
        console.log('Button pressed:', event.button); // 0=left, 1=middle, 2=right
        console.log('Modifier keys:', {
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
            meta: event.metaKey // Cmd on Mac, Windows key on PC
        });
    }
    
    // Keyboard events specific properties
    if (event.type.startsWith('key')) {
        console.log('Key pressed:', event.key);           // 'a', 'Enter', 'ArrowUp'
        console.log('Key code:', event.code);            // 'KeyA', 'Enter', 'ArrowUp'
        console.log('Legacy keyCode:', event.keyCode);   // Deprecated but still used
        console.log('Modifier keys:', {
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
            meta: event.metaKey
        });
    }
}

// Practical examples
function handleMouseClick(event) {
    // Different actions based on which button was clicked
    switch (event.button) {
        case 0: // Left click
            console.log('Left click');
            break;
        case 1: // Middle click
            console.log('Middle click');
            event.preventDefault(); // Prevent scroll behavior
            break;
        case 2: // Right click
            console.log('Right click');
            break;
    }
    
    // Modifier key combinations
    if (event.ctrlKey && event.shiftKey) {
        console.log('Ctrl+Shift+Click');
    } else if (event.ctrlKey) {
        console.log('Ctrl+Click');
    }
}

function handleKeyPress(event) {
    // Common key combinations
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                console.log('Save shortcut');
                break;
            case 'z':
                event.preventDefault();
                console.log('Undo shortcut');
                break;
            case 'y':
                event.preventDefault();
                console.log('Redo shortcut');
                break;
        }
    }
    
    // Navigation keys
    switch (event.key) {
        case 'Escape':
            console.log('Close modal or cancel action');
            break;
        case 'Enter':
            console.log('Submit or confirm');
            break;
        case 'Tab':
            // Don't prevent default - let normal tab behavior work
            console.log('Tab navigation');
            break;
    }
}
```

## 🎪 Event Types and Examples

### Mouse Events
```javascript
const element = document.querySelector('.interactive');

// Basic mouse events
element.addEventListener('click', (e) => {
    console.log('Single click');
});

element.addEventListener('dblclick', (e) => {
    console.log('Double click');
});

element.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // Prevent right-click menu
    console.log('Right click');
});

// Mouse movement events
element.addEventListener('mouseenter', (e) => {
    console.log('Mouse entered element');
    e.target.classList.add('hovered');
});

element.addEventListener('mouseleave', (e) => {
    console.log('Mouse left element');
    e.target.classList.remove('hovered');
});

element.addEventListener('mouseover', (e) => {
    console.log('Mouse over (bubbles from children)');
});

element.addEventListener('mouseout', (e) => {
    console.log('Mouse out (bubbles from children)');
});

element.addEventListener('mousemove', (e) => {
    // Be careful - this fires very frequently!
    console.log(`Mouse at: ${e.clientX}, ${e.clientY}`);
});

// Mouse button events
element.addEventListener('mousedown', (e) => {
    console.log('Mouse button pressed');
    e.target.classList.add('pressed');
});

element.addEventListener('mouseup', (e) => {
    console.log('Mouse button released');
    e.target.classList.remove('pressed');
});

// Practical mouse event examples
function createDraggableElement(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        element.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent text selection
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        element.style.left = `${initialX + deltaX}px`;
        element.style.top = `${initialY + deltaY}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

// Mouse tracking utility
class MouseTracker {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.isDown = false;
        this.button = null;
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.position.x = e.clientX;
            this.position.y = e.clientY;
        });
        
        document.addEventListener('mousedown', (e) => {
            this.isDown = true;
            this.button = e.button;
        });
        
        document.addEventListener('mouseup', () => {
            this.isDown = false;
            this.button = null;
        });
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    isMouseDown() {
        return this.isDown;
    }
    
    getButton() {
        return this.button;
    }
}

const mouseTracker = new MouseTracker();

// Usage
setInterval(() => {
    if (mouseTracker.isMouseDown()) {
        const pos = mouseTracker.getPosition();
        console.log(`Mouse down at: ${pos.x}, ${pos.y}`);
    }
}, 100);
```

### Keyboard Events
```javascript
// Keyboard event types
document.addEventListener('keydown', (e) => {
    console.log('Key pressed down:', e.key);
    // Fires repeatedly while key is held
});

document.addEventListener('keyup', (e) => {
    console.log('Key released:', e.key);
    // Fires once when key is released
});

document.addEventListener('keypress', (e) => {
    console.log('Key pressed (deprecated):', e.key);
    // Deprecated - use keydown instead
});

// Input-specific events (for form elements)
const input = document.querySelector('input');

input.addEventListener('input', (e) => {
    console.log('Input value changed:', e.target.value);
    // Fires on every character change
});

input.addEventListener('change', (e) => {
    console.log('Input lost focus with changes:', e.target.value);
    // Fires when element loses focus and value has changed
});

input.addEventListener('focus', (e) => {
    console.log('Input gained focus');
    e.target.classList.add('focused');
});

input.addEventListener('blur', (e) => {
    console.log('Input lost focus');
    e.target.classList.remove('focused');
});

// Keyboard shortcuts system
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.pressedKeys = new Set();
        
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => {
            this.pressedKeys.add(e.code);
            this.checkShortcuts(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.pressedKeys.delete(e.code);
        });
        
        // Clear pressed keys when window loses focus
        window.addEventListener('blur', () => {
            this.pressedKeys.clear();
        });
    }
    
    addShortcut(keys, callback, description = '') {
        const keyString = Array.isArray(keys) ? keys.join('+') : keys;
        this.shortcuts.set(keyString.toLowerCase(), {
            callback,
            description,
            keys: Array.isArray(keys) ? keys : [keys]
        });
    }
    
    removeShortcut(keys) {
        const keyString = Array.isArray(keys) ? keys.join('+') : keys;
        this.shortcuts.delete(keyString.toLowerCase());
    }
    
    checkShortcuts(event) {
        for (const [keyString, shortcut] of this.shortcuts) {
            if (this.isShortcutPressed(shortcut.keys, event)) {
                event.preventDefault();
                shortcut.callback(event);
                break;
            }
        }
    }
    
    isShortcutPressed(keys, event) {
        // Check if all required keys are pressed
        return keys.every(key => {
            if (key === 'ctrl') return event.ctrlKey;
            if (key === 'shift') return event.shiftKey;
            if (key === 'alt') return event.altKey;
            if (key === 'meta') return event.metaKey;
            return this.pressedKeys.has(key) || event.code === key;
        });
    }
    
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([keys, data]) => ({
            keys,
            description: data.description
        }));
    }
}

// Usage
const shortcuts = new KeyboardShortcuts();

// Add shortcuts
shortcuts.addShortcut(['ctrl', 'KeyS'], () => {
    console.log('Save document');
}, 'Save document');

shortcuts.addShortcut(['ctrl', 'shift', 'KeyZ'], () => {
    console.log('Redo action');
}, 'Redo last action');

shortcuts.addShortcut(['Escape'], () => {
    console.log('Close modal');
}, 'Close modal or cancel');

// Form validation with keyboard events
function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('input', (e) => {
            validateField(e.target);
        });
        
        // Validation on blur
        input.addEventListener('blur', (e) => {
            validateField(e.target);
        });
        
        // Enter key handling
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (input.type === 'textarea' && !e.shiftKey) {
                    // Allow line breaks with Shift+Enter
                    return;
                }
                
                e.preventDefault();
                
                // Move to next field or submit
                const nextInput = getNextInput(input, inputs);
                if (nextInput) {
                    nextInput.focus();
                } else {
                    form.requestSubmit();
                }
            }
        });
    });
}

function getNextInput(currentInput, allInputs) {
    const currentIndex = Array.from(allInputs).indexOf(currentInput);
    return allInputs[currentIndex + 1] || null;
}

function validateField(field) {
    // Add your validation logic here
    const isValid = field.value.trim() !== '';
    field.classList.toggle('invalid', !isValid);
    return isValid;
}
```

### Form Events
```javascript
const form = document.querySelector('#my-form');
const inputs = form.querySelectorAll('input, select, textarea');

// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    
    console.log('Form submitted');
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form data:', data);
    
    // Validate form
    if (validateForm(form)) {
        submitForm(data);
    } else {
        console.log('Form validation failed');
    }
});

// Form reset
form.addEventListener('reset', (e) => {
    console.log('Form reset');
    
    // Custom reset logic if needed
    inputs.forEach(input => {
        input.classList.remove('invalid', 'valid');
    });
});

// Input events for different field types
inputs.forEach(input => {
    // Universal input event
    input.addEventListener('input', (e) => {
        console.log(`${e.target.name} changed to:`, e.target.value);
        
        // Real-time validation
        validateField(e.target);
        
        // Auto-save draft
        saveDraft(form);
    });
    
    // Focus events
    input.addEventListener('focus', (e) => {
        e.target.classList.add('focused');
        
        // Show help text
        showFieldHelp(e.target);
    });
    
    input.addEventListener('blur', (e) => {
        e.target.classList.remove('focused');
        
        // Hide help text
        hideFieldHelp(e.target);
        
        // Final validation
        validateField(e.target);
    });
});

// Specific input type events
const fileInput = document.querySelector('input[type="file"]');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        console.log('Files selected:', files.map(f => f.name));
        
        // Validate file types and sizes
        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                console.error('File too large:', file.name);
            }
        });
        
        // Preview images
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                previewImage(file);
            }
        });
    });
}

const selectElement = document.querySelector('select');
if (selectElement) {
    selectElement.addEventListener('change', (e) => {
        console.log('Selection changed to:', e.target.value);
        
        // Show/hide dependent fields
        toggleDependentFields(e.target.value);
    });
}

// Checkbox and radio events
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        console.log(`${e.target.name} ${e.target.checked ? 'checked' : 'unchecked'}`);
        
        // Handle "select all" functionality
        if (e.target.classList.contains('select-all')) {
            const relatedCheckboxes = document.querySelectorAll(`input[name="${e.target.dataset.group}"]`);
            relatedCheckboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
        }
    });
});

// Form utilities
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function saveDraft(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    localStorage.setItem(`draft_${form.id}`, JSON.stringify(data));
}

function loadDraft(form) {
    const draft = localStorage.getItem(`draft_${form.id}`);
    if (draft) {
        const data = JSON.parse(draft);
        
        Object.entries(data).forEach(([name, value]) => {
            const field = form.elements[name];
            if (field) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = value === 'on';
                } else {
                    field.value = value;
                }
            }
        });
    }
}

function clearDraft(form) {
    localStorage.removeItem(`draft_${form.id}`);
}

// Auto-save functionality
class AutoSave {
    constructor(form, options = {}) {
        this.form = form;
        this.options = {
            interval: 30000, // 30 seconds
            storageKey: `autosave_${form.id}`,
            ...options
        };
        
        this.timeoutId = null;
        this.init();
    }
    
    init() {
        this.form.addEventListener('input', () => {
            this.scheduleAutoSave();
        });
        
        // Load saved data on page load
        this.loadAutoSave();
    }
    
    scheduleAutoSave() {
        clearTimeout(this.timeoutId);
        
        this.timeoutId = setTimeout(() => {
            this.saveForm();
        }, this.options.interval);
    }
    
    saveForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        localStorage.setItem(this.options.storageKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        console.log('Form auto-saved');
    }
    
    loadAutoSave() {
        const saved = localStorage.getItem(this.options.storageKey);
        if (saved) {
            const { data, timestamp } = JSON.parse(saved);
            
            // Check if data is not too old (e.g., 24 hours)
            if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
                Object.entries(data).forEach(([name, value]) => {
                    const field = this.form.elements[name];
                    if (field && field.value === '') { // Only fill empty fields
                        field.value = value;
                    }
                });
                
                console.log('Auto-saved data loaded');
            }
        }
    }
    
    clearAutoSave() {
        localStorage.removeItem(this.options.storageKey);
        clearTimeout(this.timeoutId);
    }
}

// Usage
const autoSave = new AutoSave(form, {
    interval: 10000, // Save every 10 seconds
    storageKey: 'my_form_autosave'
});
```

### Window and Document Events
```javascript
// Page lifecycle events
window.addEventListener('load', () => {
    console.log('Page fully loaded (including images, stylesheets)');
    // Initialize heavy components here
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded (before images, stylesheets)');
    // Initialize DOM-dependent code here
});

window.addEventListener('beforeunload', (e) => {
    console.log('User is about to leave the page');
    
    // Show confirmation dialog for unsaved changes
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
        return ''; // Required for some browsers
    }
});

window.addEventListener('unload', () => {
    console.log('Page is being unloaded');
    // Clean up, send analytics, etc.
    // Note: Limited time and functionality here
});

// Visibility API
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page is hidden (tab switched, minimized)');
        // Pause animations, stop timers
        pauseApplication();
    } else {
        console.log('Page is visible again');
        // Resume animations, restart timers
        resumeApplication();
    }
});

// Window resize and scroll
window.addEventListener('resize', () => {
    console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
    
    // Debounce resize events
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        handleResize();
    }, 250);
});

window.addEventListener('scroll', () => {
    console.log('Page scrolled to:', window.pageYOffset);
    
    // Throttle scroll events
    if (!window.scrolling) {
        window.scrolling = true;
        requestAnimationFrame(() => {
            handleScroll();
            window.scrolling = false;
        });
    }
});

// Focus and blur (for entire window)
window.addEventListener('focus', () => {
    console.log('Window gained focus');
    // Resume real-time updates
});

window.addEventListener('blur', () => {
    console.log('Window lost focus');
    // Pause real-time updates to save resources
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    console.error('Error details:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
    
    // Send error to logging service
    logError(e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Prevent the default browser behavior
    e.preventDefault();
    
    // Send error to logging service
    logError(e.reason);
});

// Utility functions
function hasUnsavedChanges() {
    // Check if there are unsaved changes
    return document.querySelector('.dirty') !== null;
}

function pauseApplication() {
    // Pause animations, timers, etc.
    document.querySelectorAll('video, audio').forEach(media => {
        if (!media.paused) {
            media.pause();
            media.dataset.wasPlaying = 'true';
        }
    });
}

function resumeApplication() {
    // Resume animations, timers, etc.
    document.querySelectorAll('video, audio').forEach(media => {
        if (media.dataset.wasPlaying === 'true') {
            media.play();
            delete media.dataset.wasPlaying;
        }
    });
}

function handleResize() {
    console.log('Handling resize...');
    // Recalculate layouts, update responsive components
}

function handleScroll() {
    console.log('Handling scroll...');
    // Update scroll-dependent UI elements
}

function logError(error) {
    // Send error to logging service
    console.log('Logging error:', error);
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            domContentLoadedTime: 0,
            firstPaintTime: 0,
            firstContentfulPaintTime: 0
        };
        
        this.init();
    }
    
    init() {
        // Page load metrics
        window.addEventListener('load', () => {
            this.metrics.pageLoadTime = performance.now();
            this.reportMetrics();
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domContentLoadedTime = performance.now();
        });
        
        // Paint metrics (if supported)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaintTime = entry.startTime;
                    } else if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaintTime = entry.startTime;
                    }
                }
            });
            
            observer.observe({ entryTypes: ['paint'] });
        }
    }
    
    reportMetrics() {
        console.log('Performance Metrics:', this.metrics);
        
        // Send to analytics service
        // analytics.track('page_performance', this.metrics);
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}

const performanceMonitor = new PerformanceMonitor();
```

## 🎯 Event Delegation

### Basic Event Delegation
```javascript
// ❌ Adding listeners to many elements (inefficient)
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
});

// ✅ Event delegation (efficient)
const container = document.querySelector('.button-container');
container.addEventListener('click', (e) => {
    if (e.target.matches('.btn')) {
        handleButtonClick(e);
    }
});

// More complex delegation with multiple selectors
document.addEventListener('click', (e) => {
    // Handle different types of elements
    if (e.target.matches('.btn-primary')) {
        handlePrimaryButton(e);
    } else if (e.target.matches('.btn-secondary')) {
        handleSecondaryButton(e);
    } else if (e.target.matches('.delete-btn')) {
        handleDeleteButton(e);
    } else if (e.target.closest('.card')) {
        handleCardClick(e);
    }
});

// Delegation utility function
function delegate(container, selector, eventType, handler) {
    container.addEventListener(eventType, (e) => {
        const target = e.target.closest(selector);
        if (target && container.contains(target)) {
            handler.call(target, e);
        }
    });
}

// Usage
delegate(document, '.btn', 'click', function(e) {
    console.log('Button clicked:', this.textContent);
});

delegate(document, '.card', 'mouseenter', function(e) {
    this.classList.add('hovered');
});

delegate(document, '.card', 'mouseleave', function(e) {
    this.classList.remove('hovered');
});
```

### Advanced Event Delegation
```javascript
// Event delegation class for complex scenarios
class EventDelegator {
    constructor(container) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        this.handlers = new Map();
        
        this.init();
    }
    
    init() {
        // Single event listener for all delegated events
        this.container.addEventListener('click', (e) => this.handleEvent(e, 'click'));
        this.container.addEventListener('change', (e) => this.handleEvent(e, 'change'));
        this.container.addEventListener('input', (e) => this.handleEvent(e, 'input'));
        this.container.addEventListener('submit', (e) => this.handleEvent(e, 'submit'));
        this.container.addEventListener('keydown', (e) => this.handleEvent(e, 'keydown'));
    }
    
    handleEvent(e, eventType) {
        const key = `${eventType}:${e.target.tagName.toLowerCase()}`;
        
        // Check for specific handlers
        for (const [selector, handler] of this.handlers) {
            if (selector.startsWith(eventType + ':')) {
                const selectorPart = selector.substring(eventType.length + 1);
                const target = e.target.closest(selectorPart);
                
                if (target && this.container.contains(target)) {
                    handler.call(target, e);
                }
            }
        }
    }
    
    on(eventType, selector, handler) {
        const key = `${eventType}:${selector}`;
        this.handlers.set(key, handler);
        return this; // For chaining
    }
    
    off(eventType, selector) {
        const key = `${eventType}:${selector}`;
        this.handlers.delete(key);
        return this;
    }
    
    destroy() {
        this.handlers.clear();
        // Note: In a real implementation, you'd also remove the event listeners
    }
}

// Usage
const delegator = new EventDelegator('#app');

delegator
    .on('click', '.btn-save', function(e) {
        console.log('Save button clicked');
        saveData();
    })
    .on('click', '.btn-delete', function(e) {
        console.log('Delete button clicked');
        if (confirm('Are you sure?')) {
            deleteItem(this.dataset.id);
        }
    })
    .on('change', 'select.category', function(e) {
        console.log('Category changed to:', this.value);
        updateSubcategories(this.value);
    })
    .on('input', 'input.search', function(e) {
        console.log('Search input:', this.value);
        debounce(() => performSearch(this.value), 300)();
    });

// Dynamic list management with delegation
class DynamicList {
    constructor(container) {
        this.container = document.querySelector(container);
        this.items = [];
        
        this.setupEventDelegation();
    }
    
    setupEventDelegation() {
        // Handle all list item interactions through delegation
        this.container.addEventListener('click', (e) => {
            const listItem = e.target.closest('.list-item');
            if (!listItem) return;
            
            const itemId = listItem.dataset.id;
            
            if (e.target.matches('.edit-btn')) {
                this.editItem(itemId);
            } else if (e.target.matches('.delete-btn')) {
                this.deleteItem(itemId);
            } else if (e.target.matches('.toggle-btn')) {
                this.toggleItem(itemId);
            } else {
                this.selectItem(itemId);
            }
        });
        
        // Handle keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            const listItem = e.target.closest('.list-item');
            if (!listItem) return;
            
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.selectItem(listItem.dataset.id);
                    break;
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    this.deleteItem(listItem.dataset.id);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPreviousItem(listItem);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextItem(listItem);
                    break;
            }
        });
    }
    
    addItem(data) {
        const item = {
            id: Date.now().toString(),
            ...data
        };
        
        this.items.push(item);
        
        const element = this.createItemElement(item);
        this.container.appendChild(element);
        
        return item;
    }
    
    createItemElement(item) {
        const element = document.createElement('div');
        element.className = 'list-item';
        element.dataset.id = item.id;
        element.tabIndex = 0;
        
        element.innerHTML = `
            <span class="item-text">${item.text}</span>
            <div class="item-actions">
                <button class="edit-btn" type="button">Edit</button>
                <button class="toggle-btn" type="button">
                    ${item.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="delete-btn" type="button">Delete</button>
            </div>
        `;
        
        if (item.completed) {
            element.classList.add('completed');
        }
        
        return element;
    }
    
    editItem(id) {
        console.log('Edit item:', id);
        // Implementation for editing
    }
    
    deleteItem(id) {
        console.log('Delete item:', id);
        
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
            
            const element = this.container.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.remove();
            }
        }
    }
    
    toggleItem(id) {
        console.log('Toggle item:', id);
        
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.completed = !item.completed;
            
            const element = this.container.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.classList.toggle('completed', item.completed);
                
                const toggleBtn = element.querySelector('.toggle-btn');
                toggleBtn.textContent = item.completed ? 'Undo' : 'Complete';
            }
        }
    }
    
    selectItem(id) {
        console.log('Select item:', id);
        
        // Remove previous selection
        this.container.querySelectorAll('.list-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to current item
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('selected');
            element.focus();
        }
    }
    
    focusPreviousItem(currentItem) {
        const previousItem = currentItem.previousElementSibling;
        if (previousItem && previousItem.classList.contains('list-item')) {
            previousItem.focus();
        }
    }
    
    focusNextItem(currentItem) {
        const nextItem = currentItem.nextElementSibling;
        if (nextItem && nextItem.classList.contains('list-item')) {
            nextItem.focus();
        }
    }
}

// Usage
const todoList = new DynamicList('#todo-list');

todoList.addItem({ text: 'Learn JavaScript', completed: false });
todoList.addItem({ text: 'Build a project', completed: false });
todoList.addItem({ text: 'Get a job', completed: false });
```

## 🔄 Event Flow and Propagation

### Understanding Event Phases
```javascript
// Event flow: Capture → Target → Bubble

// HTML structure:
// <div id="outer">
//   <div id="middle">
//     <button id="inner">Click me</button>
//   </div>
// </div>

const outer = document.getElementById('outer');
const middle = document.getElementById('middle');
const inner = document.getElementById('inner');

// Capture phase (top to bottom)
outer.addEventListener('click', (e) => {
    console.log('Outer - Capture phase');
}, true); // true = capture phase

middle.addEventListener('click', (e) => {
    console.log('Middle - Capture phase');
}, true);

inner.addEventListener('click', (e) => {
    console.log('Inner - Capture phase');
}, true);

// Target phase (at the target element)
inner.addEventListener('click', (e) => {
    console.log('Inner - Target phase');
    console.log('Event phase:', e.eventPhase); // 2 = AT_TARGET
});

// Bubble phase (bottom to top) - default
inner.addEventListener('click', (e) => {
    console.log('Inner - Bubble phase');
});

middle.addEventListener('click', (e) => {
    console.log('Middle - Bubble phase');
    console.log('Event phase:', e.eventPhase); // 3 = BUBBLING_PHASE
});

outer.addEventListener('click', (e) => {
    console.log('Outer - Bubble phase');
});

// When you click the button, you'll see:
// Outer - Capture phase
// Middle - Capture phase
// Inner - Capture phase
// Inner - Target phase
// Inner - Bubble phase
// Middle - Bubble phase
// Outer - Bubble phase
```

### Controlling Event Propagation
```javascript
// Stop propagation examples
const button = document.querySelector('#stop-button');
const container = document.querySelector('#container');

// Container click handler
container.addEventListener('click', (e) => {
    console.log('Container clicked');
});

// Button click handler that stops propagation
button.addEventListener('click', (e) => {
    console.log('Button clicked');
    
    // Stop the event from bubbling up to container
    e.stopPropagation();
    
    // Container click handler will NOT be called
});

// Stop immediate propagation (stops other listeners on same element)
button.addEventListener('click', (e) => {
    console.log('First button handler');
    e.stopImmediatePropagation();
    // Other listeners on this button won't be called
});

button.addEventListener('click', (e) => {
    console.log('Second button handler'); // This won't be called
});

// Prevent default behavior
const link = document.querySelector('a');
link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent navigation
    console.log('Link clicked but navigation prevented');
});

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent form submission
    console.log('Form submission prevented');
    
    // Handle form submission with JavaScript
    handleFormSubmission(e.target);
});

// Conditional event handling
function handleConditionalClick(e) {
    // Only handle if certain conditions are met
    if (e.target.classList.contains('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Action disabled');
        return;
    }
    
    if (e.ctrlKey) {
        // Special behavior for Ctrl+click
        e.preventDefault();
        handleCtrlClick(e);
        return;
    }
    
    // Normal click behavior
    handleNormalClick(e);
}

// Event flow visualization utility
function visualizeEventFlow(element) {
    const phases = ['capture', 'target', 'bubble'];
    const phaseNames = {
        1: 'CAPTURING_PHASE',
        2: 'AT_TARGET',
        3: 'BUBBLING_PHASE'
    };
    
    // Add listeners for all phases
    element.addEventListener('click', (e) => {
        console.log(`${element.tagName}#${element.id} - ${phaseNames[e.eventPhase]}`);
        console.log('Target:', e.target.tagName + '#' + e.target.id);
        console.log('CurrentTarget:', e.currentTarget.tagName + '#' + e.currentTarget.id);
        console.log('---');
    }, true); // Capture
    
    element.addEventListener('click', (e) => {
        console.log(`${element.tagName}#${element.id} - ${phaseNames[e.eventPhase]} (bubble)`);
    }, false); // Bubble
}

// Apply to all elements to see event flow
document.querySelectorAll('*[id]').forEach(visualizeEventFlow);
```

### Custom Event System
```javascript
// Creating and dispatching custom events
class CustomEventSystem {
    constructor() {
        this.listeners = new Map();
    }
    
    // Create custom event
    createEvent(type, detail = {}, options = {}) {
        return new CustomEvent(type, {
            detail,
            bubbles: options.bubbles || false,
            cancelable: options.cancelable || false,
            composed: options.composed || false
        });
    }
    
    // Dispatch custom event
    dispatch(element, eventType, detail = {}, options = {}) {
        const event = this.createEvent(eventType, detail, options);
        return element.dispatchEvent(event);
    }
    
    // Listen for custom events
    on(element, eventType, handler) {
        element.addEventListener(eventType, handler);
        
        // Store for cleanup
        if (!this.listeners.has(element)) {
            this.listeners.set(element, new Map());
        }
        
        if (!this.listeners.get(element).has(eventType)) {
            this.listeners.get(element).set(eventType, new Set());
        }
        
        this.listeners.get(element).get(eventType).add(handler);
    }
    
    // Remove custom event listener
    off(element, eventType, handler) {
        element.removeEventListener(eventType, handler);
        
        // Clean up storage
        if (this.listeners.has(element)) {
            const elementListeners = this.listeners.get(element);
            if (elementListeners.has(eventType)) {
                elementListeners.get(eventType).delete(handler);
            }
        }
    }
    
    // Clean up all listeners for an element
    cleanup(element) {
        if (this.listeners.has(element)) {
            const elementListeners = this.listeners.get(element);
            
            for (const [eventType, handlers] of elementListeners) {
                for (const handler of handlers) {
                    element.removeEventListener(eventType, handler);
                }
            }
            
            this.listeners.delete(element);
        }
    }
}

const eventSystem = new CustomEventSystem();

// Usage examples
const component = document.querySelector('#my-component');

// Listen for custom events
eventSystem.on(component, 'data-loaded', (e) => {
    console.log('Data loaded:', e.detail.data);
    console.log('Load time:', e.detail.loadTime);
});

eventSystem.on(component, 'user-action', (e) => {
    console.log('User action:', e.detail.action);
    console.log('User data:', e.detail.user);
});

// Dispatch custom events
eventSystem.dispatch(component, 'data-loaded', {
    data: { users: [], posts: [] },
    loadTime: 1250
}, { bubbles: true });

eventSystem.dispatch(component, 'user-action', {
    action: 'profile-update',
    user: { id: 123, name: 'Alice' }
});

// Real-world example: Component communication
class ComponentA {
    constructor(element) {
        this.element = element;
        this.eventSystem = new CustomEventSystem();
        
        this.init();
    }
    
    init() {
        // Listen for events from other components
        this.eventSystem.on(document, 'component-b-updated', (e) => {
            this.handleComponentBUpdate(e.detail);
        });
        
        // Set up internal event handlers
        this.element.addEventListener('click', () => {
            this.performAction();
        });
    }
    
    performAction() {
        // Do some work
        const result = { message: 'Action completed', timestamp: Date.now() };
        
        // Notify other components
        this.eventSystem.dispatch(document, 'component-a-action', result, {
            bubbles: true
        });
    }
    
    handleComponentBUpdate(data) {
        console.log('Component A received update from Component B:', data);
        // Update UI based on Component B's state
    }
    
    destroy() {
        this.eventSystem.cleanup(this.element);
        this.eventSystem.cleanup(document);
    }
}

class ComponentB {
    constructor(element) {
        this.element = element;
        this.eventSystem = new CustomEventSystem();
        
        this.init();
    }
    
    init() {
        // Listen for events from Component A
        this.eventSystem.on(document, 'component-a-action', (e) => {
            this.handleComponentAAction(e.detail);
        });
    }
    
    handleComponentAAction(data) {
        console.log('Component B received action from Component A:', data);
        
        // Update state and notify others
        this.updateState(data);
        
        this.eventSystem.dispatch(document, 'component-b-updated', {
            state: this.getState(),
            triggeredBy: 'component-a-action'
        }, { bubbles: true });
    }
    
    updateState(data) {
        // Update component state
        console.log('Updating Component B state...');
    }
    
    getState() {
        return { status: 'updated', lastAction: Date.now() };
    }
    
    destroy() {
        this.eventSystem.cleanup(this.element);
        this.eventSystem.cleanup(document);
    }
}

// Initialize components
const componentA = new ComponentA(document.querySelector('#component-a'));
const componentB = new ComponentB(document.querySelector('#component-b'));
```

## ⚠️ Common Pitfalls

### 1. Memory Leaks from Event Listeners
```javascript
// ❌ Not removing event listeners
function createComponent() {
    const element = document.createElement('div');
    const handler = () => console.log('clicked');
    
    element.addEventListener('click', handler);
    document.body.appendChild(element);
    
    // Later, removing element but not cleaning up listener
    element.remove(); // Memory leak - handler still referenced
}

// ✅ Proper cleanup
function createComponentProperly() {
    const element = document.createElement('div');
    const handler = () => console.log('clicked');
    
    element.addEventListener('click', handler);
    document.body.appendChild(element);
    
    // Return cleanup function
    return () => {
        element.removeEventListener('click', handler);
        element.remove();
    };
}

const cleanup = createComponentProperly();
// Later...
cleanup(); // Proper cleanup

// ❌ Anonymous functions can't be removed
element.addEventListener('click', () => console.log('click')); // Can't remove this!

// ✅ Use named functions or store references
const clickHandler = () => console.log('click');
element.addEventListener('click', clickHandler);
// Later...
element.removeEventListener('click', clickHandler); // This works
```

### 2. Event Listener Performance Issues
```javascript
// ❌ Adding listeners to many elements
const items = document.querySelectorAll('.list-item'); // 1000 items
items.forEach(item => {
    item.addEventListener('click', handleClick); // 1000 event listeners!
});

// ✅ Use event delegation
const list = document.querySelector('.list');
list.addEventListener('click', (e) => {
    if (e.target.matches('.list-item')) {
        handleClick(e);
    }
}); // Only 1 event listener

// ❌ Not throttling/debouncing high-frequency events
window.addEventListener('scroll', () => {
    console.log('Scrolling...'); // Fires hundreds of times per second!
    updateScrollPosition();
});

// ✅ Throttle high-frequency events
let scrolling = false;
window.addEventListener('scroll', () => {
    if (!scrolling) {
        scrolling = true;
        requestAnimationFrame(() => {
            updateScrollPosition();
            scrolling = false;
        });
    }
});

// ✅ Or use debouncing for resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        handleResize();
    }, 250);
});
```

### 3. Event Object Misunderstanding
```javascript
// ❌ Confusing target vs currentTarget
document.querySelector('.container').addEventListener('click', (e) => {
    console.log('Target:', e.target);         // Element that was actually clicked
    console.log('CurrentTarget:', e.currentTarget); // Element with the listener (.container)
    
    // Wrong: assuming target is always the container
    if (e.target.classList.contains('container')) {
        // This might not work if user clicks on child elements!
    }
    
    // ✅ Correct: use currentTarget for the element with listener
    if (e.currentTarget.classList.contains('container')) {
        // This always works
    }
});

// ❌ Not preventing default when needed
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    // Forgot e.preventDefault() - form will submit normally!
    console.log('Form submitted');
    handleFormSubmission();
});

// ✅ Always prevent default for custom handling
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent normal form submission
    console.log('Form submitted');
    handleFormSubmission();
});
```

### 4. Timing Issues
```javascript
// ❌ Adding listeners before elements exist
document.querySelector('#my-button').addEventListener('click', handler);
// Error: Cannot read property 'addEventListener' of null

// ✅ Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#my-button').addEventListener('click', handler);
});

// ✅ Or check if element exists
const button = document.querySelector('#my-button');
if (button) {
    button.addEventListener('click', handler);
}

// ✅ Or use optional chaining (modern browsers)
document.querySelector('#my-button')?.addEventListener('click', handler);

// ❌ Race conditions with dynamic content
function addDynamicContent() {
    const container = document.querySelector('#container');
    container.innerHTML = '<button id="dynamic-btn">Click me</button>';
    
    // This might not work - button might not be in DOM yet
    document.querySelector('#dynamic-btn').addEventListener('click', handler);
}

// ✅ Use event delegation for dynamic content
const container = document.querySelector('#container');
container.addEventListener('click', (e) => {
    if (e.target.id === 'dynamic-btn') {
        handler(e);
    }
});

// Now adding dynamic content works automatically
function addDynamicContent() {
    container.innerHTML = '<button id="dynamic-btn">Click me</button>';
    // Event delegation handles this automatically
}
```

### 5. Form Event Issues
```javascript
// ❌ Not handling form submission properly
const submitButton = document.querySelector('#submit-btn');
submitButton.addEventListener('click', (e) => {
    // This doesn't prevent form submission!
    handleFormSubmission();
});

// ✅ Listen to form submit event
const form = document.querySelector('#my-form');
form.addEventListener('submit', (e) => {
    e.preventDefault(); // This prevents form submission
    handleFormSubmission();
});

// ❌ Not validating before submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Submitting without validation!
    submitData();
});

// ✅ Validate before submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm(form)) {
        submitData();
    } else {
        showValidationErrors();
    }
});
```

## 🏋️ Mini Practice Problems

### Problem 1: Interactive Todo List
```javascript
// Create a fully interactive todo list with the following features:
// - Add new todos by typing and pressing Enter
// - Mark todos as complete by clicking
// - Delete todos with a delete button
// - Edit todos by double-clicking
// - Filter todos (all, active, completed)
// - Clear all completed todos
// - Keyboard navigation (arrow keys, Enter, Escape)
// - Drag and drop reordering
// - Local storage persistence

class InteractiveTodoList {
    constructor(container) {
        // Your implementation here
        // Should handle all the features listed above
        // Use event delegation for efficiency
        // Implement proper keyboard accessibility
    }
    
    // Methods to implement:
    // addTodo(text)
    // deleteTodo(id)
    // toggleTodo(id)
    // editTodo(id, newText)
    // filterTodos(filter) // 'all', 'active', 'completed'
    // clearCompleted()
    // saveTodos()
    // loadTodos()
    // setupEventListeners()
    // setupKeyboardNavigation()
    // setupDragAndDrop()
}

// Usage:
const todoList = new InteractiveTodoList('#todo-app');
```

### Problem 2: Modal Dialog System
```javascript
// Create a modal system that handles:
// - Multiple modals with proper z-index stacking
// - Focus management (trap focus within modal)
// - Escape key to close
// - Backdrop click to close (optional)
// - Prevent body scroll when modal is open
// - Smooth animations
// - Accessibility (ARIA attributes, screen reader support)
// - Promise-based API for user responses

class ModalSystem {
    constructor() {
        // Your implementation
        // Handle focus management
        // Manage modal stack
        // Setup global event listeners
    }
    
    // Methods to implement:
    // show(options) - returns Promise
    // hide(modal)
    // hideAll()
    // confirm(message, options) - returns Promise<boolean>
    // prompt(message, defaultValue, options) - returns Promise<string|null>
    // alert(message, options) - returns Promise
    // setupFocusTrap(modal)
    // setupKeyboardHandling()
    // preventBodyScroll()
    // restoreBodyScroll()
}

// Usage:
const modals = new ModalSystem();

// Show custom modal
modals.show({
    title: 'Confirm Action',
    content: '<p>Are you sure you want to delete this item?</p>',
    buttons: [
        { text: 'Cancel', value: false, class: 'btn-secondary' },
        { text: 'Delete', value: true, class: 'btn-danger' }
    ]
}).then(result => {
    if (result) {
        deleteItem();
    }
});

// Built-in dialogs
modals.confirm('Delete this item?').then(confirmed => {
    if (confirmed) deleteItem();
});

modals.prompt('Enter your name:', 'John Doe').then(name => {
    if (name) console.log('Hello,', name);
});
```

### Problem 3: Drag and Drop File Uploader
```javascript
// Create a drag-and-drop file uploader with:
// - Visual feedback during drag operations
// - File type validation
// - File size limits
// - Progress indicators
// - Preview for images
// - Multiple file support
// - Error handling
// - Accessibility support

class DragDropUploader {
    constructor(container, options = {}) {
        // Your implementation
        // Options: {
        //   maxFileSize: 5 * 1024 * 1024, // 5MB
        //   allowedTypes: ['image/*', '.pdf', '.doc'],
        //   multiple: true,
        //   uploadUrl: '/api/upload',
        //   onProgress: (file, progress) => {},
        //   onComplete: (file, response) => {},
        //   onError: (file, error) => {}
        // }
    }
    
    // Methods to implement:
    // setupDragAndDrop()
    // setupFileInput()
    // handleDragEnter(e)
    // handleDragOver(e)
    // handleDragLeave(e)
    // handleDrop(e)
    // validateFiles(files)
    // uploadFiles(files)
    // createPreview(file)
    // showProgress(file, progress)
    // showError(file, error)
}

// Usage:
const uploader = new DragDropUploader('#upload-area', {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', '.pdf'],
    multiple: true,
    onProgress: (file, progress) => {
        console.log(`${file.name}: ${progress}%`);
    },
    onComplete: (file, response) => {
        console.log(`${file.name} uploaded successfully`);
    },
    onError: (file, error) => {
        console.error(`Error uploading ${file.name}:`, error);
    }
});
```

### Problem 4: Keyboard Shortcut Manager
```javascript
// Create a comprehensive keyboard shortcut system:
// - Register shortcuts with descriptions
// - Handle modifier key combinations
// - Context-aware shortcuts (different shortcuts in different areas)
// - Conflict detection and resolution
// - Help dialog showing all shortcuts
// - Enable/disable shortcuts dynamically
// - Import/export shortcut configurations

class ShortcutManager {
    constructor() {
        // Your implementation
        // Handle global and context-specific shortcuts
        // Manage shortcut conflicts
        // Provide help system
    }
    
    // Methods to implement:
    // register(keys, callback, options)
    // unregister(keys, context)
    // setContext(context)
    // enable(keys)
    // disable(keys)
    // showHelp()
    // exportConfig()
    // importConfig(config)
    // detectConflicts()
    // resolveConflict(keys, resolution)
}

// Usage:
const shortcuts = new ShortcutManager();

// Global shortcuts
shortcuts.register('ctrl+s', () => save(), {
    description: 'Save document',
    global: true
});

// Context-specific shortcuts
shortcuts.register('enter', () => submitForm(), {
    description: 'Submit form',
    context: 'form',
    element: '#contact-form'
});

shortcuts.register('escape', () => closeModal(), {
    description: 'Close modal',
    context: 'modal'
});

// Change context
shortcuts.setContext('form');

// Show help
shortcuts.showHelp(); // Display all available shortcuts
```

### Problem 5: Real-time Form Validation
```javascript
// Create a real-time form validation system:
// - Validate as user types (debounced)
// - Show/hide error messages smoothly
// - Custom validation rules
// - Async validation (check username availability)
// - Field dependencies (password confirmation)
// - Accessibility support (ARIA attributes)
// - Visual indicators (colors, icons)
// - Summary of all errors

class FormValidator {
    constructor(form, rules = {}) {
        // Your implementation
        // Handle real-time validation
        // Manage error display
        // Support async validation
    }
    
    // Methods to implement:
    // addRule(field, rule)
    // removeRule(field, ruleType)
    // validateField(field)
    // validateForm()
    // showError(field, message)
    // hideError(field)
    // showSummary()
    // hideSummary()
    // setupRealTimeValidation()
    // setupAsyncValidation()
}

// Built-in validation rules
const validationRules = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max,
    pattern: (value, regex) => regex.test(value),
    number: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
    url: (value) => {
        try { new URL(value); return true; } catch { return false; }
    },
    async: async (value, validator) => await validator(value)
};

// Usage:
const validator = new FormValidator('#registration-form', {
    username: [
        { rule: 'required', message: 'Username is required' },
        { rule: 'minLength', value: 3, message: 'Minimum 3 characters' },
        { 
            rule: 'async',
            validator: async (username) => {
                const response = await fetch(`/api/check-username?username=${username}`);
                const result = await response.json();
                return !result.exists;
            },
            message: 'Username already taken'
        }
    ],
    email: [
        { rule: 'required', message: 'Email is required' },
        { rule: 'email', message: 'Invalid email format' }
    ],
    password: [
        { rule: 'required', message: 'Password is required' },
        { rule: 'minLength', value: 8, message: 'Minimum 8 characters' },
        {
            rule: 'pattern',
            value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Must contain uppercase, lowercase, and number'
        }
    ],
    confirmPassword: [
        { rule: 'required', message: 'Please confirm password' },
        {
            rule: 'custom',
            validator: (value, form) => value === form.elements.password.value,
            message: 'Passwords do not match'
        }
    ]
});
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between event capturing and bubbling?**
- **Capturing**: Event travels from document root down to target element
- **Bubbling**: Event travels from target element up to document root
- **Target phase**: Event is at the target element itself
- Use `addEventListener(event, handler, true)` for capturing phase

**Q: How do you prevent memory leaks with event listeners?**
- Always remove event listeners when elements are destroyed
- Use named functions instead of anonymous functions for removal
- Use event delegation to reduce number of listeners
- Clean up listeners in component destroy/unmount methods

**Q: When should you use event delegation?**
- When you have many similar elements (like list items)
- When elements are added/removed dynamically
- To improve performance by reducing number of event listeners
- When you need to handle events on elements that don't exist yet

**Q: How do you handle keyboard accessibility?**
- Support Tab navigation with proper focus management
- Handle Enter and Space for activation
- Support Arrow keys for navigation within components
- Use Escape key to cancel/close operations
- Provide keyboard shortcuts for common actions

**Q: What's the difference between `target` and `currentTarget`?**
- `target`: The element that actually triggered the event
- `currentTarget`: The element that has the event listener attached
- In event delegation, `target` is the clicked child, `currentTarget` is the parent

### 🏢 Asked at Companies:
- **Google**: "Implement a keyboard-navigable dropdown menu with accessibility support"
- **Facebook**: "Create an infinite scroll component that handles scroll events efficiently"
- **Amazon**: "Build a form validation system that works with screen readers"
- **Microsoft**: "Design a drag-and-drop interface for file uploads with progress tracking"
- **Netflix**: "Create a video player with custom keyboard controls and event handling"

## 🎯 Key Takeaways

1. **Use event delegation** - More efficient for many elements and dynamic content
2. **Always clean up listeners** - Prevent memory leaks by removing listeners
3. **Throttle/debounce high-frequency events** - Improve performance for scroll, resize, input
4. **Handle keyboard accessibility** - Support Tab, Enter, Escape, Arrow keys
5. **Understand event flow** - Know when to use capturing vs bubbling
6. **Prevent default when needed** - Stop unwanted browser behavior
7. **Use custom events for component communication** - Decouple components
8. **Check element existence** - Always verify elements exist before adding listeners

---

**Previous Chapter**: [← DOM Manipulation](./13-dom-manipulation.md)  
**Next Chapter**: [Browser APIs →](./15-browser-apis.md)

**Practice**: Try the event handling problems and experiment with different event types and delegation patterns!