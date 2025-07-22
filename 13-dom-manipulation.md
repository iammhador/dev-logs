# 📚 Chapter 13: DOM Manipulation

> Master the art of dynamically controlling web page content and user interactions.

## 📖 Plain English Explanation

DOM manipulation is like being a stage director for a theater production:
- **Selecting elements** = finding specific actors on stage
- **Changing content** = giving actors new lines to say
- **Modifying styles** = changing costumes and lighting
- **Adding/removing elements** = bringing actors on/off stage
- **Event handling** = responding to audience reactions
- **Animation** = choreographing smooth movements

The DOM (Document Object Model) is the browser's representation of your HTML page as a tree of objects that JavaScript can manipulate.

## 🎯 Selecting Elements

### Basic Selection Methods
```javascript
// By ID (returns single element or null)
const header = document.getElementById('main-header');
const loginForm = document.getElementById('login-form');

// By class name (returns HTMLCollection - array-like)
const buttons = document.getElementsByClassName('btn');
const cards = document.getElementsByClassName('card');

// By tag name (returns HTMLCollection)
const paragraphs = document.getElementsByTagName('p');
const images = document.getElementsByTagName('img');

// By name attribute (returns NodeList)
const radioButtons = document.getElementsByName('gender');
const checkboxes = document.getElementsByName('interests');

// Modern selectors (CSS-style)
const firstButton = document.querySelector('.btn');           // First match
const allButtons = document.querySelectorAll('.btn');         // All matches (NodeList)
const specificButton = document.querySelector('#submit-btn'); // By ID
const nestedElement = document.querySelector('.container .card .title');

// Advanced CSS selectors
const evenRows = document.querySelectorAll('tr:nth-child(even)');
const firstChild = document.querySelector('.menu > li:first-child');
const lastInput = document.querySelector('input:last-of-type');
const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
const externalLinks = document.querySelectorAll('a[href^="http"]');

// Attribute selectors
const requiredFields = document.querySelectorAll('input[required]');
const dataElements = document.querySelectorAll('[data-category="electronics"]');
const partialMatch = document.querySelectorAll('[class*="btn"]');
```

### Element Relationships and Navigation
```javascript
// Parent/child relationships
const element = document.querySelector('.target');

// Parent navigation
const parent = element.parentElement;           // Direct parent
const parentNode = element.parentNode;          // Parent node (includes text nodes)
const closestContainer = element.closest('.container'); // Nearest ancestor matching selector

// Child navigation
const children = element.children;              // HTMLCollection of child elements
const childNodes = element.childNodes;          // NodeList including text nodes
const firstChild = element.firstElementChild;   // First child element
const lastChild = element.lastElementChild;     // Last child element

// Sibling navigation
const nextSibling = element.nextElementSibling;     // Next sibling element
const prevSibling = element.previousElementSibling; // Previous sibling element
const allSiblings = Array.from(element.parentElement.children)
    .filter(child => child !== element);

// Practical examples
function highlightSiblings(element) {
    const siblings = Array.from(element.parentElement.children);
    siblings.forEach(sibling => {
        if (sibling !== element) {
            sibling.classList.add('highlighted');
        }
    });
}

function findFormContainer(inputElement) {
    return inputElement.closest('form') || inputElement.closest('.form-container');
}

function getTableRow(cellElement) {
    return cellElement.closest('tr');
}

// Walking the DOM tree
function walkDOM(node, callback) {
    callback(node);
    
    for (let child of node.children) {
        walkDOM(child, callback);
    }
}

// Usage: Find all elements with specific data attribute
walkDOM(document.body, (element) => {
    if (element.dataset && element.dataset.trackable) {
        console.log('Trackable element:', element);
    }
});
```

### Modern Selection Patterns
```javascript
// Utility functions for common selections
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Usage
const header = $('#main-header');
const buttons = $$('.btn');

// Converting NodeList to Array for array methods
const buttonArray = Array.from($$('.btn'));
const activeButtons = [...$$('.btn')].filter(btn => !btn.disabled);

// Chaining selections
const menuItems = Array.from($('.navigation').children)
    .filter(item => item.tagName === 'LI')
    .map(item => item.querySelector('a'))
    .filter(link => link !== null);

// Conditional selection
function getElement(selector, fallback = null) {
    const element = document.querySelector(selector);
    return element || (fallback && document.querySelector(fallback));
}

const mainContent = getElement('#main-content', '.content');

// Selection with error handling
function safeSelect(selector) {
    try {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements);
    } catch (error) {
        console.error('Invalid selector:', selector, error);
        return [];
    }
}

// Scoped selection (within a container)
function selectWithin(container, selector) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    return container ? Array.from(container.querySelectorAll(selector)) : [];
}

const formInputs = selectWithin('#user-form', 'input, select, textarea');
const cardButtons = selectWithin('.card-container', '.btn');
```

## 📝 Content Manipulation

### Text Content
```javascript
// Getting and setting text content
const heading = document.querySelector('h1');

// textContent - gets/sets text only (no HTML)
console.log(heading.textContent);     // "Welcome to Our Site"
heading.textContent = 'New Heading';  // Safe - no HTML injection

// innerText - respects styling (hidden elements ignored)
console.log(heading.innerText);       // Visible text only
heading.innerText = 'Styled Heading';

// innerHTML - gets/sets HTML content (dangerous with user input)
const container = document.querySelector('.content');
console.log(container.innerHTML);     // "<p>Hello <strong>World</strong></p>"
container.innerHTML = '<p>New <em>content</em></p>';

// Safe HTML insertion
function safeSetHTML(element, htmlString) {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    
    // Clear existing content
    element.innerHTML = '';
    
    // Move parsed nodes to target element
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
}

// Text manipulation utilities
function appendText(element, text) {
    element.textContent += text;
}

function prependText(element, text) {
    element.textContent = text + element.textContent;
}

function replaceText(element, oldText, newText) {
    element.textContent = element.textContent.replace(oldText, newText);
}

// Practical examples
function updateCounter(element, count) {
    element.textContent = `Count: ${count}`;
}

function formatPrice(element, price) {
    element.textContent = `$${price.toFixed(2)}`;
}

function truncateText(element, maxLength) {
    const text = element.textContent;
    if (text.length > maxLength) {
        element.textContent = text.substring(0, maxLength) + '...';
        element.title = text; // Show full text on hover
    }
}

// Dynamic content updates
function updateStatus(statusElement, status, message) {
    statusElement.textContent = message;
    statusElement.className = `status status-${status}`;
}

// Usage
updateStatus($('.status'), 'success', 'Operation completed successfully!');
updateStatus($('.status'), 'error', 'Something went wrong.');
```

### HTML Content and Templates
```javascript
// Template-based content creation
function createUserCard(user) {
    return `
        <div class="user-card" data-user-id="${user.id}">
            <img src="${user.avatar}" alt="${user.name}" class="avatar">
            <h3 class="name">${user.name}</h3>
            <p class="email">${user.email}</p>
            <div class="actions">
                <button class="btn btn-primary" onclick="editUser(${user.id})">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Safe template rendering
function renderTemplate(container, template, data) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    
    const html = typeof template === 'function' ? template(data) : template;
    container.innerHTML = html;
}

// List rendering
function renderUserList(users) {
    const container = document.querySelector('#user-list');
    const html = users.map(user => createUserCard(user)).join('');
    container.innerHTML = html;
}

// Conditional rendering
function renderContent(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="empty-state">No data available</p>';
        return;
    }
    
    const html = data.map(item => createItemTemplate(item)).join('');
    container.innerHTML = html;
}

// Template with escaping for security
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createSafeUserCard(user) {
    return `
        <div class="user-card">
            <h3>${escapeHtml(user.name)}</h3>
            <p>${escapeHtml(user.email)}</p>
            <p>${escapeHtml(user.bio)}</p>
        </div>
    `;
}

// Using HTML templates (modern approach)
function createElementFromTemplate(templateId, data) {
    const template = document.querySelector(`#${templateId}`);
    const clone = template.content.cloneNode(true);
    
    // Fill in data
    Object.keys(data).forEach(key => {
        const element = clone.querySelector(`[data-field="${key}"]`);
        if (element) {
            element.textContent = data[key];
        }
    });
    
    return clone;
}

// HTML template in the document:
// <template id="user-template">
//     <div class="user-card">
//         <h3 data-field="name"></h3>
//         <p data-field="email"></p>
//     </div>
// </template>

// Usage
const userElement = createElementFromTemplate('user-template', {
    name: 'Alice',
    email: 'alice@example.com'
});

document.querySelector('#container').appendChild(userElement);
```

## 🎨 Style Manipulation

### CSS Classes
```javascript
const element = document.querySelector('.target');

// Class manipulation methods
element.classList.add('active');           // Add class
element.classList.remove('hidden');        // Remove class
element.classList.toggle('expanded');      // Toggle class
element.classList.replace('old', 'new');   // Replace class

// Check if class exists
if (element.classList.contains('active')) {
    console.log('Element is active');
}

// Multiple classes
element.classList.add('class1', 'class2', 'class3');
element.classList.remove('class1', 'class2');

// Conditional class manipulation
function setActiveState(element, isActive) {
    element.classList.toggle('active', isActive);
    element.classList.toggle('inactive', !isActive);
}

// Class utilities
function hasAnyClass(element, classes) {
    return classes.some(className => element.classList.contains(className));
}

function hasAllClasses(element, classes) {
    return classes.every(className => element.classList.contains(className));
}

function replaceClasses(element, oldClasses, newClasses) {
    oldClasses.forEach(cls => element.classList.remove(cls));
    newClasses.forEach(cls => element.classList.add(cls));
}

// State management with classes
class ElementState {
    constructor(element) {
        this.element = element;
        this.states = new Set();
    }
    
    setState(state, active = true) {
        if (active) {
            this.states.add(state);
            this.element.classList.add(`state-${state}`);
        } else {
            this.states.delete(state);
            this.element.classList.remove(`state-${state}`);
        }
    }
    
    hasState(state) {
        return this.states.has(state);
    }
    
    clearStates() {
        this.states.forEach(state => {
            this.element.classList.remove(`state-${state}`);
        });
        this.states.clear();
    }
}

// Usage
const buttonState = new ElementState(document.querySelector('#my-button'));
buttonState.setState('loading', true);
buttonState.setState('disabled', true);

// Practical examples
function showElement(element) {
    element.classList.remove('hidden', 'fade-out');
    element.classList.add('visible', 'fade-in');
}

function hideElement(element) {
    element.classList.remove('visible', 'fade-in');
    element.classList.add('hidden', 'fade-out');
}

function setLoadingState(button, isLoading) {
    button.classList.toggle('loading', isLoading);
    button.disabled = isLoading;
    
    const text = button.querySelector('.text');
    const spinner = button.querySelector('.spinner');
    
    if (isLoading) {
        text.style.display = 'none';
        spinner.style.display = 'inline-block';
    } else {
        text.style.display = 'inline-block';
        spinner.style.display = 'none';
    }
}
```

### Inline Styles
```javascript
const element = document.querySelector('.target');

// Setting individual styles
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.fontSize = '16px';
element.style.marginTop = '10px';

// CSS property names (camelCase)
element.style.borderRadius = '5px';
element.style.textAlign = 'center';
element.style.zIndex = '1000';

// Setting multiple styles
function setStyles(element, styles) {
    Object.assign(element.style, styles);
}

// Usage
setStyles(element, {
    color: 'white',
    backgroundColor: 'navy',
    padding: '10px',
    borderRadius: '5px'
});

// CSS custom properties (CSS variables)
element.style.setProperty('--primary-color', '#007bff');
element.style.setProperty('--border-width', '2px');

// Getting computed styles
const computedStyle = window.getComputedStyle(element);
const color = computedStyle.getPropertyValue('color');
const fontSize = computedStyle.fontSize;

// Style utilities
function getNumericStyle(element, property) {
    const value = window.getComputedStyle(element).getPropertyValue(property);
    return parseFloat(value) || 0;
}

function setOpacity(element, opacity) {
    element.style.opacity = Math.max(0, Math.min(1, opacity));
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    const start = performance.now();
    const startOpacity = parseFloat(element.style.opacity) || 1;
    
    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element.style.opacity = startOpacity * (1 - progress);
        
        if (progress >= 1) {
            element.style.display = 'none';
        } else {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Responsive style adjustments
function adjustForScreenSize(element) {
    const width = window.innerWidth;
    
    if (width < 768) {
        setStyles(element, {
            fontSize: '14px',
            padding: '5px'
        });
    } else if (width < 1024) {
        setStyles(element, {
            fontSize: '16px',
            padding: '10px'
        });
    } else {
        setStyles(element, {
            fontSize: '18px',
            padding: '15px'
        });
    }
}

// Theme switching
function applyTheme(themeName) {
    const themes = {
        light: {
            '--bg-color': '#ffffff',
            '--text-color': '#333333',
            '--border-color': '#cccccc'
        },
        dark: {
            '--bg-color': '#333333',
            '--text-color': '#ffffff',
            '--border-color': '#555555'
        }
    };
    
    const theme = themes[themeName];
    if (theme) {
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }
}
```

## 🏗️ Creating and Modifying Elements

### Creating Elements
```javascript
// Basic element creation
const div = document.createElement('div');
const paragraph = document.createElement('p');
const button = document.createElement('button');
const image = document.createElement('img');

// Setting attributes and content
div.className = 'container';
div.id = 'main-container';
paragraph.textContent = 'Hello, World!';
button.textContent = 'Click me';
button.type = 'button';
image.src = 'image.jpg';
image.alt = 'Description';

// Creating complex elements
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
}

// Usage
const card = createElement('div', {
    className: 'card',
    'data-id': '123'
}, [
    createElement('h3', { textContent: 'Card Title' }),
    createElement('p', { textContent: 'Card description' }),
    createElement('button', {
        className: 'btn btn-primary',
        textContent: 'Action'
    })
]);

// Factory functions for common elements
function createButton(text, className = 'btn', onClick = null) {
    const button = createElement('button', {
        className,
        textContent: text,
        type: 'button'
    });
    
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    
    return button;
}

function createInput(type, name, placeholder = '') {
    return createElement('input', {
        type,
        name,
        placeholder,
        className: 'form-control'
    });
}

function createSelect(name, options = []) {
    const select = createElement('select', {
        name,
        className: 'form-control'
    });
    
    options.forEach(option => {
        const optionElement = createElement('option', {
            value: option.value,
            textContent: option.text
        });
        select.appendChild(optionElement);
    });
    
    return select;
}

// Creating from HTML strings
function createFromHTML(htmlString) {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}

// Usage
const element = createFromHTML(`
    <div class="alert alert-success">
        <strong>Success!</strong> Operation completed.
    </div>
`);

// Document fragments for efficient DOM manipulation
function createMultipleElements(count, elementFactory) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        fragment.appendChild(elementFactory(i));
    }
    
    return fragment;
}

// Usage
const listItems = createMultipleElements(10, (index) => {
    return createElement('li', {
        textContent: `Item ${index + 1}`,
        'data-index': index
    });
});

document.querySelector('#list').appendChild(listItems);
```

### Adding and Removing Elements
```javascript
// Adding elements
const container = document.querySelector('#container');
const newElement = document.createElement('div');

// Append to end
container.appendChild(newElement);

// Insert at beginning
container.insertBefore(newElement, container.firstChild);

// Insert at specific position
const referenceElement = container.children[2];
container.insertBefore(newElement, referenceElement);

// Modern insertion methods
const targetElement = document.querySelector('.target');

// Insert adjacent to element
targetElement.insertAdjacentElement('beforebegin', newElement); // Before target
targetElement.insertAdjacentElement('afterbegin', newElement);  // First child of target
targetElement.insertAdjacentElement('beforeend', newElement);   // Last child of target
targetElement.insertAdjacentElement('afterend', newElement);    // After target

// Insert HTML strings
targetElement.insertAdjacentHTML('beforebegin', '<div>Before</div>');
targetElement.insertAdjacentHTML('afterbegin', '<div>First child</div>');
targetElement.insertAdjacentHTML('beforeend', '<div>Last child</div>');
targetElement.insertAdjacentHTML('afterend', '<div>After</div>');

// Removing elements
const elementToRemove = document.querySelector('.remove-me');

// Modern way
elementToRemove.remove();

// Traditional way
elementToRemove.parentNode.removeChild(elementToRemove);

// Remove all children
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    // Or simply:
    // element.innerHTML = '';
}

// Conditional removal
function removeIf(selector, condition) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        if (condition(element)) {
            element.remove();
        }
    });
}

// Usage: Remove all empty paragraphs
removeIf('p', (p) => p.textContent.trim() === '');

// Replace elements
function replaceElement(oldElement, newElement) {
    oldElement.parentNode.replaceChild(newElement, oldElement);
}

// Clone elements
const original = document.querySelector('.original');
const clone = original.cloneNode(true); // true = deep clone (includes children)
const shallowClone = original.cloneNode(false); // false = shallow clone

// Move elements
function moveElement(element, newParent) {
    newParent.appendChild(element); // Automatically removes from old parent
}

// Batch operations with DocumentFragment
function batchInsert(container, elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach(element => fragment.appendChild(element));
    container.appendChild(fragment); // Single DOM operation
}

// List management utilities
class ListManager {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.items = [];
    }
    
    addItem(data, template) {
        const element = template(data);
        this.container.appendChild(element);
        this.items.push({ data, element });
        return element;
    }
    
    removeItem(index) {
        if (this.items[index]) {
            this.items[index].element.remove();
            this.items.splice(index, 1);
        }
    }
    
    updateItem(index, newData, template) {
        if (this.items[index]) {
            const newElement = template(newData);
            this.items[index].element.replaceWith(newElement);
            this.items[index] = { data: newData, element: newElement };
        }
    }
    
    clear() {
        this.container.innerHTML = '';
        this.items = [];
    }
    
    getItems() {
        return this.items.map(item => item.data);
    }
}

// Usage
const todoList = new ListManager('#todo-list');

todoList.addItem(
    { id: 1, text: 'Buy groceries', completed: false },
    (data) => createElement('li', {
        textContent: data.text,
        className: data.completed ? 'completed' : ''
    })
);
```

## 🎛️ Attributes and Properties

### Working with Attributes
```javascript
const element = document.querySelector('.target');

// Getting attributes
const id = element.getAttribute('id');
const className = element.getAttribute('class');
const dataValue = element.getAttribute('data-value');

// Setting attributes
element.setAttribute('id', 'new-id');
element.setAttribute('class', 'new-class');
element.setAttribute('data-value', '123');
element.setAttribute('aria-label', 'Close button');

// Removing attributes
element.removeAttribute('data-old');
element.removeAttribute('disabled');

// Checking if attribute exists
if (element.hasAttribute('data-value')) {
    console.log('Element has data-value attribute');
}

// Getting all attributes
const attributes = Array.from(element.attributes);
attributes.forEach(attr => {
    console.log(`${attr.name}: ${attr.value}`);
});

// Data attributes (modern approach)
const element = document.querySelector('[data-user-id="123"]');

// Access via dataset property
console.log(element.dataset.userId);     // "123"
console.log(element.dataset.userName);   // Gets data-user-name

// Setting data attributes
element.dataset.status = 'active';
element.dataset.lastModified = new Date().toISOString();

// Data attribute utilities
function setDataAttributes(element, data) {
    Object.entries(data).forEach(([key, value]) => {
        element.dataset[key] = value;
    });
}

function getDataAttributes(element) {
    return { ...element.dataset };
}

// Usage
setDataAttributes(element, {
    userId: '456',
    role: 'admin',
    permissions: 'read,write,delete'
});

const data = getDataAttributes(element);
console.log(data); // { userId: '456', role: 'admin', permissions: 'read,write,delete' }

// Boolean attributes
function setBooleanAttribute(element, attribute, value) {
    if (value) {
        element.setAttribute(attribute, '');
    } else {
        element.removeAttribute(attribute);
    }
}

// Usage
setBooleanAttribute(button, 'disabled', true);
setBooleanAttribute(input, 'required', false);
setBooleanAttribute(details, 'open', true);
```

### Properties vs Attributes
```javascript
const input = document.querySelector('input[type="text"]');

// Properties (JavaScript object properties)
input.value = 'Hello';           // Current value
input.disabled = true;           // Current state
input.checked = false;           // For checkboxes/radios

// Attributes (HTML attributes)
input.setAttribute('value', 'Hello');     // Default value
input.setAttribute('disabled', '');       // Presence indicates disabled
input.setAttribute('checked', '');        // Default checked state

// Key differences:
// 1. Properties reflect current state, attributes reflect initial state
// 2. Properties are typed (boolean, string, number), attributes are always strings
// 3. Some properties don't have corresponding attributes

// Form element properties
const form = document.querySelector('form');
const select = document.querySelector('select');
const checkbox = document.querySelector('input[type="checkbox"]');

// Input properties
console.log(input.value);        // Current value
console.log(input.defaultValue); // Original value attribute
console.log(input.validity);     // Validation state
console.log(input.files);        // For file inputs

// Select properties
console.log(select.selectedIndex);     // Index of selected option
console.log(select.selectedOptions);   // Selected option elements
console.log(select.options);           // All option elements

// Checkbox/radio properties
console.log(checkbox.checked);         // Current checked state
console.log(checkbox.defaultChecked);  // Original checked attribute

// Form properties
console.log(form.elements);            // All form controls
console.log(form.length);              // Number of form controls

// Property utilities
function getFormData(form) {
    const data = {};
    const formData = new FormData(form);
    
    for (const [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (checkboxes, multi-select)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    return data;
}

function setFormData(form, data) {
    Object.entries(data).forEach(([name, value]) => {
        const element = form.elements[name];
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = value;
            } else {
                element.value = value;
            }
        }
    });
}

// Element state management
class ElementState {
    constructor(element) {
        this.element = element;
        this.originalAttributes = new Map();
        this.originalProperties = new Map();
    }
    
    saveState() {
        // Save current attributes
        Array.from(this.element.attributes).forEach(attr => {
            this.originalAttributes.set(attr.name, attr.value);
        });
        
        // Save important properties
        const props = ['value', 'checked', 'selected', 'disabled'];
        props.forEach(prop => {
            if (prop in this.element) {
                this.originalProperties.set(prop, this.element[prop]);
            }
        });
    }
    
    restoreState() {
        // Restore attributes
        this.originalAttributes.forEach((value, name) => {
            this.element.setAttribute(name, value);
        });
        
        // Restore properties
        this.originalProperties.forEach((value, prop) => {
            this.element[prop] = value;
        });
    }
}

// Usage
const elementState = new ElementState(input);
elementState.saveState();

// Make changes...
input.value = 'Modified';
input.disabled = true;

// Restore original state
elementState.restoreState();
```

## ⚠️ Common Pitfalls

### 1. NodeList vs HTMLCollection
```javascript
// ❌ Assuming live collections are static
const divs = document.getElementsByTagName('div'); // HTMLCollection (live)
console.log(divs.length); // 5

// Adding a new div
document.body.appendChild(document.createElement('div'));
console.log(divs.length); // 6 (automatically updated!)

// This can cause infinite loops:
for (let i = 0; i < divs.length; i++) {
    document.body.appendChild(document.createElement('div')); // Infinite loop!
}

// ✅ Convert to static array when needed
const staticDivs = Array.from(document.getElementsByTagName('div'));
for (let i = 0; i < staticDivs.length; i++) {
    document.body.appendChild(document.createElement('div')); // Safe
}

// ✅ Or use querySelectorAll (returns static NodeList)
const divs = document.querySelectorAll('div');
```

### 2. innerHTML Security Issues
```javascript
// ❌ Dangerous - XSS vulnerability
const userInput = '<img src="x" onerror="alert(\'XSS\')">';
element.innerHTML = userInput; // Executes malicious script!

// ✅ Safe alternatives
// Use textContent for plain text
element.textContent = userInput; // Safe - no HTML execution

// Use createElement for dynamic content
const img = document.createElement('img');
img.src = userSrc; // Validate userSrc first
img.alt = userAlt; // Validate userAlt first
element.appendChild(img);

// Sanitize HTML if you must use innerHTML
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

element.innerHTML = sanitizeHTML(userInput);
```

### 3. Event Delegation Issues
```javascript
// ❌ Adding event listeners to many elements
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
    button.addEventListener('click', handleClick); // Memory intensive
});

// ✅ Use event delegation
document.addEventListener('click', (event) => {
    if (event.target.matches('.btn')) {
        handleClick(event);
    }
});

// ❌ Not checking if element exists
document.querySelector('.non-existent').addEventListener('click', handler);
// TypeError: Cannot read property 'addEventListener' of null

// ✅ Always check existence
const element = document.querySelector('.maybe-exists');
if (element) {
    element.addEventListener('click', handler);
}

// Or use optional chaining (modern browsers)
document.querySelector('.maybe-exists')?.addEventListener('click', handler);
```

### 4. Style Manipulation Issues
```javascript
// ❌ Setting styles that cause layout thrashing
function animateElements(elements) {
    elements.forEach((element, index) => {
        element.style.left = `${index * 100}px`; // Causes reflow for each element
    });
}

// ✅ Batch DOM operations
function animateElementsEfficiently(elements) {
    // Use DocumentFragment or CSS transforms
    elements.forEach((element, index) => {
        element.style.transform = `translateX(${index * 100}px)`; // No reflow
    });
}

// ❌ Reading and writing styles in a loop
for (let i = 0; i < elements.length; i++) {
    const height = elements[i].offsetHeight; // Read (causes reflow)
    elements[i].style.height = `${height + 10}px`; // Write (causes reflow)
}

// ✅ Separate reads and writes
const heights = elements.map(el => el.offsetHeight); // Batch reads
elements.forEach((el, i) => {
    el.style.height = `${heights[i] + 10}px`; // Batch writes
});
```

### 5. Memory Leaks
```javascript
// ❌ Not removing event listeners
function setupComponent() {
    const button = document.createElement('button');
    const handler = () => console.log('clicked');
    
    button.addEventListener('click', handler);
    document.body.appendChild(button);
    
    // Later, removing the button but not the listener
    button.remove(); // Memory leak - handler still referenced
}

// ✅ Proper cleanup
function setupComponentProperly() {
    const button = document.createElement('button');
    const handler = () => console.log('clicked');
    
    button.addEventListener('click', handler);
    document.body.appendChild(button);
    
    // Cleanup function
    return () => {
        button.removeEventListener('click', handler);
        button.remove();
    };
}

const cleanup = setupComponentProperly();
// Later...
cleanup(); // Proper cleanup

// ❌ Circular references
function createCircularReference() {
    const element = document.createElement('div');
    element.customProperty = {
        element: element, // Circular reference
        data: 'some data'
    };
    return element;
}

// ✅ Avoid circular references
function createProperReference() {
    const element = document.createElement('div');
    const data = {
        elementId: element.id || `element-${Date.now()}`,
        data: 'some data'
    };
    element.dataset.objectId = data.elementId;
    return { element, data };
}
```

## 🏋️ Mini Practice Problems

### Problem 1: Dynamic Table Generator
```javascript
// Create a function that generates a sortable, filterable table
function createDataTable(container, data, options = {}) {
    // Your implementation should:
    // - Generate table with headers and data rows
    // - Add sorting functionality (click headers to sort)
    // - Add filtering (search input)
    // - Support pagination
    // - Handle empty data gracefully
    // - Allow custom cell renderers
    
    // Options should support:
    // {
    //   sortable: true,
    //   filterable: true,
    //   pageSize: 10,
    //   columns: [
    //     { key: 'name', title: 'Name', sortable: true },
    //     { key: 'age', title: 'Age', sortable: true, type: 'number' },
    //     { key: 'email', title: 'Email', sortable: false },
    //     { key: 'actions', title: 'Actions', render: (row) => `<button onclick="edit(${row.id})">Edit</button>` }
    //   ]
    // }
}

// Test data
const users = [
    { id: 1, name: 'Alice', age: 30, email: 'alice@example.com' },
    { id: 2, name: 'Bob', age: 25, email: 'bob@example.com' },
    { id: 3, name: 'Charlie', age: 35, email: 'charlie@example.com' }
];

createDataTable('#table-container', users, {
    sortable: true,
    filterable: true,
    pageSize: 5,
    columns: [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age', type: 'number' },
        { key: 'email', title: 'Email' },
        { key: 'actions', title: 'Actions', render: (row) => `<button>Edit</button>` }
    ]
});
```

### Problem 2: Modal Dialog System
```javascript
// Create a reusable modal dialog system
class ModalManager {
    constructor() {
        // Your implementation
        // Should handle:
        // - Multiple modals
        // - Modal stacking (z-index management)
        // - Backdrop clicks
        // - Escape key handling
        // - Focus management
        // - Animations
    }
    
    create(options) {
        // Create and return a modal instance
        // Options: { title, content, size, closable, backdrop }
    }
    
    open(modal) {
        // Open a modal
    }
    
    close(modal) {
        // Close a modal
    }
    
    closeAll() {
        // Close all open modals
    }
    
    confirm(message, options = {}) {
        // Show confirmation dialog, return promise
    }
    
    alert(message, options = {}) {
        // Show alert dialog, return promise
    }
    
    prompt(message, defaultValue = '', options = {}) {
        // Show prompt dialog, return promise with user input
    }
}

// Usage examples:
const modals = new ModalManager();

// Basic modal
const modal = modals.create({
    title: 'User Profile',
    content: '<form>...</form>',
    size: 'large'
});
modals.open(modal);

// Confirmation
modals.confirm('Are you sure you want to delete this item?')
    .then(confirmed => {
        if (confirmed) {
            console.log('Item deleted');
        }
    });

// Prompt
modals.prompt('Enter your name:', 'John Doe')
    .then(name => {
        if (name) {
            console.log('Hello,', name);
        }
    });
```

### Problem 3: Drag and Drop List
```javascript
// Create a drag-and-drop sortable list
class SortableList {
    constructor(container, options = {}) {
        // Your implementation should:
        // - Make list items draggable
        // - Show visual feedback during drag
        // - Handle drop zones
        // - Animate reordering
        // - Support touch devices
        // - Emit events for reorder
        // - Support disabled items
        // - Handle nested lists (optional)
        
        // Options: {
        //   itemSelector: '.list-item',
        //   handleSelector: '.drag-handle', // Optional drag handle
        //   placeholder: 'drop-placeholder',
        //   animation: 300,
        //   disabled: false,
        //   onSort: (oldIndex, newIndex) => {}
        // }
    }
    
    enable() {
        // Enable drag and drop
    }
    
    disable() {
        // Disable drag and drop
    }
    
    destroy() {
        // Clean up event listeners
    }
    
    getOrder() {
        // Return current order of items
    }
    
    setOrder(order) {
        // Set order of items
    }
}

// HTML structure:
// <ul id="sortable-list">
//   <li class="list-item" data-id="1">
//     <span class="drag-handle">⋮⋮</span>
//     <span>Item 1</span>
//   </li>
//   <li class="list-item" data-id="2">
//     <span class="drag-handle">⋮⋮</span>
//     <span>Item 2</span>
//   </li>
// </ul>

// Usage:
const sortable = new SortableList('#sortable-list', {
    handleSelector: '.drag-handle',
    onSort: (oldIndex, newIndex) => {
        console.log(`Moved item from ${oldIndex} to ${newIndex}`);
    }
});
```

### Problem 4: Virtual Scrolling List
```javascript
// Create a virtual scrolling list for large datasets
class VirtualList {
    constructor(container, options = {}) {
        // Your implementation should:
        // - Only render visible items
        // - Handle scrolling efficiently
        // - Support variable item heights
        // - Maintain scroll position
        // - Support dynamic data updates
        // - Handle resize events
        
        // Options: {
        //   itemHeight: 50, // Fixed height or function
        //   renderItem: (item, index) => string, // Item renderer
        //   overscan: 5, // Extra items to render outside viewport
        //   data: [], // Initial data
        //   estimatedItemHeight: 50 // For variable heights
        // }
    }
    
    setData(data) {
        // Update the data and re-render
    }
    
    scrollToIndex(index) {
        // Scroll to specific item
    }
    
    scrollToTop() {
        // Scroll to top
    }
    
    refresh() {
        // Force re-render
    }
    
    destroy() {
        // Clean up
    }
}

// Usage:
const virtualList = new VirtualList('#list-container', {
    itemHeight: 60,
    renderItem: (item, index) => `
        <div class="list-item">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
        </div>
    `,
    overscan: 10
});

// Large dataset
const largeData = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `Description for item ${i}`
}));

virtualList.setData(largeData);
```

### Problem 5: Form Validation System
```javascript
// Create a comprehensive form validation system
class FormValidator {
    constructor(form, rules = {}) {
        // Your implementation should:
        // - Validate on input, blur, and submit
        // - Show/hide error messages
        // - Support custom validation rules
        // - Handle different input types
        // - Support async validation
        // - Prevent form submission if invalid
        // - Highlight invalid fields
        
        // Rules format:
        // {
        //   fieldName: [
        //     { rule: 'required', message: 'This field is required' },
        //     { rule: 'email', message: 'Invalid email format' },
        //     { rule: 'minLength', value: 8, message: 'Minimum 8 characters' },
        //     { rule: 'custom', validate: (value) => boolean, message: 'Custom error' },
        //     { rule: 'async', validate: async (value) => boolean, message: 'Async error' }
        //   ]
        // }
    }
    
    addRule(fieldName, rule) {
        // Add validation rule to field
    }
    
    removeRule(fieldName, ruleType) {
        // Remove validation rule from field
    }
    
    validate(fieldName = null) {
        // Validate specific field or entire form
        // Return { isValid: boolean, errors: {} }
    }
    
    showError(fieldName, message) {
        // Show error message for field
    }
    
    hideError(fieldName) {
        // Hide error message for field
    }
    
    reset() {
        // Reset form and clear all errors
    }
    
    destroy() {
        // Clean up event listeners
    }
}

// Built-in validation rules
const validationRules = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (value, length) => value.length >= length,
    maxLength: (value, length) => value.length <= length,
    pattern: (value, regex) => regex.test(value),
    number: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }
};

// Usage:
const validator = new FormValidator('#user-form', {
    username: [
        { rule: 'required', message: 'Username is required' },
        { rule: 'minLength', value: 3, message: 'Username must be at least 3 characters' }
    ],
    email: [
        { rule: 'required', message: 'Email is required' },
        { rule: 'email', message: 'Please enter a valid email' },
        { 
            rule: 'async', 
            validate: async (email) => {
                const response = await fetch(`/api/check-email?email=${email}`);
                const result = await response.json();
                return !result.exists;
            },
            message: 'Email already exists'
        }
    ],
    password: [
        { rule: 'required', message: 'Password is required' },
        { rule: 'minLength', value: 8, message: 'Password must be at least 8 characters' },
        { 
            rule: 'custom',
            validate: (value) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value),
            message: 'Password must contain uppercase, lowercase, and number'
        }
    ]
});
```

## 💼 Interview Notes

### Common Questions:

**Q: What's the difference between `innerHTML`, `textContent`, and `innerText`?**
- `innerHTML`: Gets/sets HTML content, can execute scripts (security risk)
- `textContent`: Gets/sets text content, ignores HTML tags, includes hidden text
- `innerText`: Gets/sets visible text content, respects styling (hidden elements ignored)

**Q: How do you efficiently add many elements to the DOM?**
- Use `DocumentFragment` to batch operations
- Use `insertAdjacentHTML` for HTML strings
- Avoid adding elements one by one in a loop

**Q: What's the difference between `querySelector` and `getElementById`?**
- `getElementById`: Faster, returns single element by ID
- `querySelector`: More flexible (CSS selectors), returns first match
- `querySelectorAll`: Returns all matches as static NodeList

**Q: How do you prevent XSS when inserting user content?**
- Use `textContent` instead of `innerHTML` for plain text
- Sanitize HTML content before insertion
- Use `createElement` and set properties instead of HTML strings
- Validate and escape user input

**Q: What's event delegation and when should you use it?**
- Attaching event listener to parent element instead of individual children
- Use when you have many similar elements or dynamic content
- More memory efficient, handles dynamically added elements

### 🏢 Asked at Companies:
- **Google**: "Implement a virtual scrolling component for large lists"
- **Facebook**: "Create a drag-and-drop interface with React-like virtual DOM"
- **Amazon**: "Build a form validation system with real-time feedback"
- **Microsoft**: "Design a modal system that handles focus management and accessibility"
- **Netflix**: "Create a responsive grid layout that adapts to different screen sizes"

## 🎯 Key Takeaways

1. **Use modern selectors** - `querySelector` and `querySelectorAll` are more flexible
2. **Batch DOM operations** - Use DocumentFragment for multiple insertions
3. **Prefer `textContent` over `innerHTML`** - Safer and often faster
4. **Use event delegation** - More efficient for many elements
5. **Check element existence** - Always verify elements exist before manipulation
6. **Separate reads and writes** - Avoid layout thrashing
7. **Clean up event listeners** - Prevent memory leaks
8. **Use CSS classes over inline styles** - Better performance and maintainability

---

**Previous Chapter**: [← ES6+ Features](./12-es6-features.md)  
**Next Chapter**: [Event Handling →](./14-event-handling.md)

**Practice**: Try the DOM manipulation problems and experiment with different selection and modification techniques!