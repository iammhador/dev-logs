# Chapter 18: Security Best Practices 🔒

## 📚 Table of Contents
- [Security Fundamentals](#security-fundamentals)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
- [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
- [Content Security Policy (CSP)](#content-security-policy-csp)
- [Authentication & Authorization](#authentication--authorization)
- [Secure Communication](#secure-communication)
- [Data Protection](#data-protection)
- [Common Pitfalls](#common-pitfalls)
- [Practice Problems](#practice-problems)
- [Interview Notes](#interview-notes)

---

## 🎯 Security Fundamentals

### Security Principles
```javascript
// CIA Triad: Confidentiality, Integrity, Availability

// 1. Confidentiality - Protect sensitive data
class SecureDataHandler {
    constructor() {
        this.sensitiveData = new Map();
    }
    
    // Never log sensitive data
    processUserData(userData) {
        // ❌ Don't do this
        // console.log('Processing user:', userData); // May contain passwords
        
        // ✅ Log safely
        console.log('Processing user:', {
            id: userData.id,
            email: userData.email.replace(/(.{2}).*(@.*)/, '$1***$2')
        });
    }
    
    // Store sensitive data securely
    storeSensitiveData(key, value) {
        // Encrypt before storing
        const encrypted = this.encrypt(value);
        this.sensitiveData.set(key, encrypted);
    }
    
    encrypt(data) {
        // Use proper encryption (this is just an example)
        return btoa(JSON.stringify(data));
    }
}

// 2. Integrity - Ensure data hasn't been tampered with
class DataIntegrityChecker {
    static generateHash(data) {
        // Use crypto API for real hashing
        return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
            .then(hashBuffer => {
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            });
    }
    
    static async verifyIntegrity(data, expectedHash) {
        const actualHash = await this.generateHash(data);
        return actualHash === expectedHash;
    }
}

// 3. Availability - Ensure service remains accessible
class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.requests = new Map();
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }
    
    isAllowed(clientId) {
        const now = Date.now();
        const clientRequests = this.requests.get(clientId) || [];
        
        // Remove old requests
        const validRequests = clientRequests.filter(
            timestamp => now - timestamp < this.windowMs
        );
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(clientId, validRequests);
        return true;
    }
}
```

### Threat Modeling
```javascript
// STRIDE Threat Model
class ThreatAnalyzer {
    static analyzeThreat(component, data) {
        const threats = {
            spoofing: this.checkSpoofing(component, data),
            tampering: this.checkTampering(component, data),
            repudiation: this.checkRepudiation(component, data),
            informationDisclosure: this.checkInformationDisclosure(component, data),
            denialOfService: this.checkDenialOfService(component, data),
            elevationOfPrivilege: this.checkElevationOfPrivilege(component, data)
        };
        
        return threats;
    }
    
    static checkSpoofing(component, data) {
        // Check for authentication mechanisms
        return {
            risk: component.hasAuthentication ? 'low' : 'high',
            mitigations: ['Implement strong authentication', 'Use multi-factor authentication']
        };
    }
    
    static checkTampering(component, data) {
        // Check for data integrity measures
        return {
            risk: component.hasIntegrityChecks ? 'low' : 'medium',
            mitigations: ['Implement checksums', 'Use digital signatures']
        };
    }
    
    // ... other threat checks
}
```

---

## 🛡️ Input Validation & Sanitization

### Input Validation
```javascript
// Comprehensive input validator
class InputValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || typeof email !== 'string') {
            throw new Error('Email must be a non-empty string');
        }
        
        if (email.length > 254) {
            throw new Error('Email too long');
        }
        
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        
        return email.toLowerCase().trim();
    }
    
    static validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password must be a non-empty string');
        }
        
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        
        if (password.length > 128) {
            throw new Error('Password too long');
        }
        
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
            throw new Error('Password must contain uppercase, lowercase, numbers, and special characters');
        }
        
        return password;
    }
    
    static validateUsername(username) {
        if (!username || typeof username !== 'string') {
            throw new Error('Username must be a non-empty string');
        }
        
        const trimmed = username.trim();
        
        if (trimmed.length < 3 || trimmed.length > 30) {
            throw new Error('Username must be 3-30 characters');
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
        }
        
        return trimmed;
    }
    
    static validateURL(url) {
        try {
            const parsed = new URL(url);
            
            // Only allow HTTP and HTTPS
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new Error('Only HTTP and HTTPS URLs are allowed');
            }
            
            // Prevent localhost and private IPs in production
            if (process.env.NODE_ENV === 'production') {
                const hostname = parsed.hostname;
                if (hostname === 'localhost' || 
                    hostname.startsWith('127.') ||
                    hostname.startsWith('192.168.') ||
                    hostname.startsWith('10.') ||
                    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) {
                    throw new Error('Private IP addresses not allowed');
                }
            }
            
            return parsed.toString();
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }
    
    static sanitizeHTML(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // Basic HTML sanitization (use DOMPurify in real applications)
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    static validateAndSanitizeInput(input, type, options = {}) {
        try {
            switch (type) {
                case 'email':
                    return this.validateEmail(input);
                case 'password':
                    return this.validatePassword(input);
                case 'username':
                    return this.validateUsername(input);
                case 'url':
                    return this.validateURL(input);
                case 'html':
                    return this.sanitizeHTML(input);
                case 'number':
                    return this.validateNumber(input, options);
                default:
                    throw new Error(`Unknown validation type: ${type}`);
            }
        } catch (error) {
            console.error(`Validation error for ${type}:`, error.message);
            throw error;
        }
    }
    
    static validateNumber(input, { min = -Infinity, max = Infinity, integer = false } = {}) {
        const num = Number(input);
        
        if (isNaN(num)) {
            throw new Error('Invalid number');
        }
        
        if (num < min || num > max) {
            throw new Error(`Number must be between ${min} and ${max}`);
        }
        
        if (integer && !Number.isInteger(num)) {
            throw new Error('Number must be an integer');
        }
        
        return num;
    }
}

// Usage
try {
    const email = InputValidator.validateEmail('user@example.com');
    const password = InputValidator.validatePassword('SecurePass123!');
    const safeHTML = InputValidator.sanitizeHTML('<script>alert("xss")</script>');
    console.log('Validation successful');
} catch (error) {
    console.error('Validation failed:', error.message);
}
```

### Schema Validation
```javascript
// Schema-based validation
class SchemaValidator {
    static createSchema(definition) {
        return new Schema(definition);
    }
    
    static validate(data, schema) {
        return schema.validate(data);
    }
}

class Schema {
    constructor(definition) {
        this.definition = definition;
    }
    
    validate(data) {
        const errors = [];
        const sanitized = {};
        
        for (const [field, rules] of Object.entries(this.definition)) {
            try {
                sanitized[field] = this.validateField(data[field], rules, field);
            } catch (error) {
                errors.push({ field, message: error.message });
            }
        }
        
        if (errors.length > 0) {
            throw new ValidationError('Validation failed', errors);
        }
        
        return sanitized;
    }
    
    validateField(value, rules, fieldName) {
        // Required check
        if (rules.required && (value === undefined || value === null || value === '')) {
            throw new Error(`${fieldName} is required`);
        }
        
        // Skip validation if value is empty and not required
        if (!rules.required && (value === undefined || value === null || value === '')) {
            return rules.default || null;
        }
        
        // Type validation
        if (rules.type) {
            value = this.validateType(value, rules.type, fieldName);
        }
        
        // Custom validation
        if (rules.validate) {
            value = rules.validate(value);
        }
        
        return value;
    }
    
    validateType(value, type, fieldName) {
        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new Error(`${fieldName} must be a string`);
                }
                return value;
            case 'number':
                const num = Number(value);
                if (isNaN(num)) {
                    throw new Error(`${fieldName} must be a number`);
                }
                return num;
            case 'boolean':
                return Boolean(value);
            case 'email':
                return InputValidator.validateEmail(value);
            case 'url':
                return InputValidator.validateURL(value);
            default:
                return value;
        }
    }
}

class ValidationError extends Error {
    constructor(message, errors) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

// Usage
const userSchema = SchemaValidator.createSchema({
    username: {
        type: 'string',
        required: true,
        validate: InputValidator.validateUsername
    },
    email: {
        type: 'email',
        required: true
    },
    age: {
        type: 'number',
        required: false,
        validate: (value) => InputValidator.validateNumber(value, { min: 13, max: 120, integer: true })
    },
    website: {
        type: 'url',
        required: false
    }
});

try {
    const validatedUser = userSchema.validate({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
        website: 'https://johndoe.com'
    });
    console.log('User data validated:', validatedUser);
} catch (error) {
    console.error('Validation errors:', error.errors);
}
```

---

## 🚨 Cross-Site Scripting (XSS)

### XSS Prevention
```javascript
// XSS Protection utilities
class XSSProtection {
    // HTML encoding
    static encodeHTML(str) {
        if (!str) return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // More comprehensive HTML sanitization
    static sanitizeHTML(html, allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']) {
        if (!html) return '';
        
        // Create a temporary DOM element
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove all script tags
        const scripts = temp.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        // Remove event handlers
        const allElements = temp.querySelectorAll('*');
        allElements.forEach(element => {
            // Remove all event attributes
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            });
            
            // Remove javascript: URLs
            ['href', 'src', 'action'].forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && value.toLowerCase().startsWith('javascript:')) {
                    element.removeAttribute(attr);
                }
            });
            
            // Remove disallowed tags
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                element.replaceWith(...element.childNodes);
            }
        });
        
        return temp.innerHTML;
    }
    
    // Safe DOM manipulation
    static safeSetInnerHTML(element, html) {
        element.innerHTML = this.sanitizeHTML(html);
    }
    
    static safeSetTextContent(element, text) {
        element.textContent = text; // Always safe
    }
    
    // Safe URL validation
    static isSafeURL(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }
    
    // Template literal tag for safe HTML
    static html(strings, ...values) {
        let result = strings[0];
        
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const encodedValue = typeof value === 'string' 
                ? this.encodeHTML(value) 
                : String(value);
            result += encodedValue + strings[i + 1];
        }
        
        return result;
    }
}

// Safe component rendering
class SafeComponent {
    constructor(container) {
        this.container = container;
    }
    
    render(data) {
        // ❌ Dangerous - direct innerHTML
        // this.container.innerHTML = `<h1>${data.title}</h1><p>${data.content}</p>`;
        
        // ✅ Safe - using template tag
        this.container.innerHTML = XSSProtection.html`
            <h1>${data.title}</h1>
            <p>${data.content}</p>
        `;
    }
    
    renderUserContent(userHTML) {
        // ✅ Safe - sanitized HTML
        const safeHTML = XSSProtection.sanitizeHTML(userHTML);
        this.container.innerHTML = safeHTML;
    }
    
    renderLink(url, text) {
        if (XSSProtection.isSafeURL(url)) {
            this.container.innerHTML = XSSProtection.html`
                <a href="${url}">${text}</a>
            `;
        } else {
            this.container.textContent = text; // Fallback to text
        }
    }
}

// Content Security Policy helper
class CSPHelper {
    static generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }
    
    static createCSPHeader(options = {}) {
        const nonce = this.generateNonce();
        
        const directives = {
            'default-src': ["'self'"],
            'script-src': ["'self'", `'nonce-${nonce}'`],
            'style-src': ["'self'", "'unsafe-inline'"], // Consider using nonce for styles too
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'", 'https:'],
            'connect-src': ["'self'"],
            'frame-ancestors': ["'none'"],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
            ...options
        };
        
        const cspString = Object.entries(directives)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');
        
        return { csp: cspString, nonce };
    }
}

// Usage examples
const component = new SafeComponent(document.getElementById('content'));

// Safe rendering
component.render({
    title: 'User Profile',
    content: 'Welcome <script>alert("xss")</script> back!' // Will be encoded
});

// Safe user content
const userHTML = '<p>Hello <script>alert("xss")</script> world!</p>';
component.renderUserContent(userHTML); // Script will be removed
```

### DOM-based XSS Prevention
```javascript
// Secure DOM manipulation
class SecureDOM {
    static createElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        // Safely set attributes
        for (const [key, value] of Object.entries(attributes)) {
            if (this.isSafeAttribute(key, value)) {
                element.setAttribute(key, value);
            }
        }
        
        // Safely set text content
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }
    
    static isSafeAttribute(name, value) {
        // Blacklist dangerous attributes
        const dangerousAttributes = [
            'onload', 'onerror', 'onclick', 'onmouseover',
            'onfocus', 'onblur', 'onchange', 'onsubmit'
        ];
        
        if (dangerousAttributes.includes(name.toLowerCase())) {
            return false;
        }
        
        // Check for javascript: URLs
        if (['href', 'src', 'action'].includes(name.toLowerCase())) {
            return !String(value).toLowerCase().startsWith('javascript:');
        }
        
        return true;
    }
    
    static safeAppendChild(parent, child) {
        if (child instanceof Node) {
            parent.appendChild(child);
        } else {
            // If it's a string, create a text node
            parent.appendChild(document.createTextNode(String(child)));
        }
    }
    
    static updateURL(newURL) {
        try {
            const url = new URL(newURL, window.location.origin);
            
            // Only allow same-origin URLs
            if (url.origin === window.location.origin) {
                window.history.pushState({}, '', url.pathname + url.search + url.hash);
            } else {
                console.warn('Cross-origin URL not allowed:', newURL);
            }
        } catch (error) {
            console.error('Invalid URL:', newURL);
        }
    }
}

// Secure event handling
class SecureEventHandler {
    constructor() {
        this.handlers = new Map();
    }
    
    addEventListener(element, eventType, handler, options = {}) {
        // Validate event type
        if (!this.isValidEventType(eventType)) {
            throw new Error(`Invalid event type: ${eventType}`);
        }
        
        // Wrap handler for security
        const secureHandler = (event) => {
            try {
                // Prevent default for potentially dangerous events
                if (this.isDangerousEvent(event)) {
                    event.preventDefault();
                    return;
                }
                
                handler(event);
            } catch (error) {
                console.error('Event handler error:', error);
            }
        };
        
        element.addEventListener(eventType, secureHandler, options);
        
        // Store for cleanup
        const key = `${element.id || 'anonymous'}-${eventType}`;
        this.handlers.set(key, { element, eventType, handler: secureHandler });
    }
    
    isValidEventType(eventType) {
        const validEvents = [
            'click', 'submit', 'change', 'input', 'focus', 'blur',
            'mouseenter', 'mouseleave', 'keydown', 'keyup'
        ];
        return validEvents.includes(eventType);
    }
    
    isDangerousEvent(event) {
        // Check for suspicious event properties
        if (event.isTrusted === false) {
            console.warn('Untrusted event detected');
            return true;
        }
        
        return false;
    }
    
    removeAllListeners() {
        for (const [key, { element, eventType, handler }] of this.handlers) {
            element.removeEventListener(eventType, handler);
        }
        this.handlers.clear();
    }
}

// Usage
const secureEvents = new SecureEventHandler();

// Safe event binding
secureEvents.addEventListener(
    document.getElementById('myButton'),
    'click',
    (event) => {
        console.log('Button clicked safely');
    }
);

// Safe DOM creation
const safeDiv = SecureDOM.createElement('div', {
    class: 'user-content',
    'data-user-id': '123'
}, 'This is safe text content');

document.body.appendChild(safeDiv);
```

---

## 🛡️ Cross-Site Request Forgery (CSRF)

### CSRF Protection
```javascript
// CSRF Token management
class CSRFProtection {
    constructor() {
        this.token = this.generateToken();
        this.tokenName = 'csrf_token';
    }
    
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }
    
    getToken() {
        return this.token;
    }
    
    setTokenInForm(form) {
        // Remove existing CSRF token
        const existingToken = form.querySelector(`input[name="${this.tokenName}"]`);
        if (existingToken) {
            existingToken.remove();
        }
        
        // Add new CSRF token
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = this.tokenName;
        tokenInput.value = this.token;
        form.appendChild(tokenInput);
    }
    
    setTokenInHeaders(headers = {}) {
        return {
            ...headers,
            'X-CSRF-Token': this.token
        };
    }
    
    validateToken(receivedToken) {
        return receivedToken === this.token;
    }
    
    refreshToken() {
        this.token = this.generateToken();
        
        // Update all forms
        document.querySelectorAll('form').forEach(form => {
            this.setTokenInForm(form);
        });
        
        return this.token;
    }
}

// Secure API client with CSRF protection
class SecureAPIClient {
    constructor() {
        this.csrfProtection = new CSRFProtection();
        this.baseURL = '/api';
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            credentials: 'same-origin', // Include cookies
            headers: {
                'Content-Type': 'application/json',
                ...this.csrfProtection.setTokenInHeaders()
            }
        };
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, mergedOptions);
            
            if (response.status === 403) {
                // CSRF token might be invalid, refresh it
                this.csrfProtection.refreshToken();
                throw new Error('CSRF token invalid, please retry');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Secure form handler
class SecureFormHandler {
    constructor(csrfProtection) {
        this.csrfProtection = csrfProtection;
        this.setupFormProtection();
    }
    
    setupFormProtection() {
        // Add CSRF tokens to all forms
        document.querySelectorAll('form').forEach(form => {
            this.protectForm(form);
        });
        
        // Monitor for new forms
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'FORM') {
                            this.protectForm(node);
                        } else {
                            node.querySelectorAll('form').forEach(form => {
                                this.protectForm(form);
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    protectForm(form) {
        // Skip if already protected
        if (form.dataset.csrfProtected) {
            return;
        }
        
        // Add CSRF token
        this.csrfProtection.setTokenInForm(form);
        
        // Add submit handler for validation
        form.addEventListener('submit', (event) => {
            if (!this.validateFormSubmission(form)) {
                event.preventDefault();
                console.error('Form submission blocked: CSRF validation failed');
            }
        });
        
        // Mark as protected
        form.dataset.csrfProtected = 'true';
    }
    
    validateFormSubmission(form) {
        const tokenInput = form.querySelector(`input[name="${this.csrfProtection.tokenName}"]`);
        
        if (!tokenInput) {
            console.error('CSRF token missing from form');
            return false;
        }
        
        return this.csrfProtection.validateToken(tokenInput.value);
    }
}

// SameSite cookie helper
class SecureCookieManager {
    static setCookie(name, value, options = {}) {
        const defaults = {
            secure: window.location.protocol === 'https:',
            sameSite: 'Strict',
            httpOnly: false, // Can't set httpOnly from JavaScript
            maxAge: 86400 // 24 hours
        };
        
        const settings = { ...defaults, ...options };
        
        let cookieString = `${name}=${encodeURIComponent(value)}`;
        
        if (settings.maxAge) {
            cookieString += `; Max-Age=${settings.maxAge}`;
        }
        
        if (settings.secure) {
            cookieString += '; Secure';
        }
        
        if (settings.sameSite) {
            cookieString += `; SameSite=${settings.sameSite}`;
        }
        
        if (settings.path) {
            cookieString += `; Path=${settings.path}`;
        }
        
        document.cookie = cookieString;
    }
    
    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop().split(';').shift());
        }
        return null;
    }
    
    static deleteCookie(name, path = '/') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }
}

// Usage
const apiClient = new SecureAPIClient();
const formHandler = new SecureFormHandler(apiClient.csrfProtection);

// Make secure API calls
try {
    const userData = await apiClient.get('/user/profile');
    console.log('User data:', userData);
} catch (error) {
    console.error('Failed to fetch user data:', error);
}

// Set secure cookies
SecureCookieManager.setCookie('session_id', 'abc123', {
    secure: true,
    sameSite: 'Strict',
    maxAge: 3600
});
```

---

## 🔒 Content Security Policy (CSP)

### CSP Implementation
```javascript
// CSP policy builder
class CSPBuilder {
    constructor() {
        this.directives = new Map();
        this.nonces = new Set();
    }
    
    addDirective(directive, sources) {
        if (!this.directives.has(directive)) {
            this.directives.set(directive, new Set());
        }
        
        const directiveSet = this.directives.get(directive);
        if (Array.isArray(sources)) {
            sources.forEach(source => directiveSet.add(source));
        } else {
            directiveSet.add(sources);
        }
        
        return this;
    }
    
    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        const nonce = btoa(String.fromCharCode(...array));
        this.nonces.add(nonce);
        return nonce;
    }
    
    allowInlineScript(nonce) {
        if (!nonce) {
            nonce = this.generateNonce();
        }
        
        this.addDirective('script-src', `'nonce-${nonce}'`);
        return nonce;
    }
    
    allowInlineStyle(nonce) {
        if (!nonce) {
            nonce = this.generateNonce();
        }
        
        this.addDirective('style-src', `'nonce-${nonce}'`);
        return nonce;
    }
    
    build() {
        const policyParts = [];
        
        for (const [directive, sources] of this.directives) {
            const sourceList = Array.from(sources).join(' ');
            policyParts.push(`${directive} ${sourceList}`);
        }
        
        return policyParts.join('; ');
    }
    
    static createStrictPolicy() {
        return new CSPBuilder()
            .addDirective('default-src', "'self'")
            .addDirective('script-src', ["'self'", "'strict-dynamic'"])
            .addDirective('style-src', ["'self'", "'unsafe-inline'"])
            .addDirective('img-src', ["'self'", 'data:', 'https:'])
            .addDirective('font-src', ["'self'", 'https:'])
            .addDirective('connect-src', "'self'")
            .addDirective('frame-ancestors', "'none'")
            .addDirective('base-uri', "'self'")
            .addDirective('form-action', "'self'");
    }
    
    static createDevelopmentPolicy() {
        return new CSPBuilder()
            .addDirective('default-src', "'self'")
            .addDirective('script-src', ["'self'", "'unsafe-eval'", 'localhost:*'])
            .addDirective('style-src', ["'self'", "'unsafe-inline'"])
            .addDirective('img-src', ["'self'", 'data:', 'https:', 'http:'])
            .addDirective('connect-src', ["'self'", 'ws:', 'wss:', 'localhost:*']);
    }
}

// CSP violation reporter
class CSPViolationReporter {
    constructor(reportEndpoint) {
        this.reportEndpoint = reportEndpoint;
        this.setupViolationListener();
    }
    
    setupViolationListener() {
        document.addEventListener('securitypolicyviolation', (event) => {
            this.handleViolation(event);
        });
    }
    
    handleViolation(event) {
        const violation = {
            documentURI: event.documentURI,
            referrer: event.referrer,
            blockedURI: event.blockedURI,
            violatedDirective: event.violatedDirective,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
            columnNumber: event.columnNumber,
            statusCode: event.statusCode,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.warn('CSP Violation:', violation);
        
        // Report to server
        this.reportViolation(violation);
    }
    
    async reportViolation(violation) {
        try {
            await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(violation)
            });
        } catch (error) {
            console.error('Failed to report CSP violation:', error);
        }
    }
}

// Secure script loader with CSP
class SecureScriptLoader {
    constructor(cspBuilder) {
        this.cspBuilder = cspBuilder;
    }
    
    loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            
            // Generate nonce for inline scripts
            if (options.inline) {
                const nonce = this.cspBuilder.allowInlineScript();
                script.nonce = nonce;
                script.textContent = src;
            } else {
                script.src = src;
                
                // Add integrity check if provided
                if (options.integrity) {
                    script.integrity = options.integrity;
                    script.crossOrigin = 'anonymous';
                }
            }
            
            script.onload = resolve;
            script.onerror = reject;
            
            // Set other attributes
            if (options.async !== undefined) {
                script.async = options.async;
            }
            
            if (options.defer !== undefined) {
                script.defer = options.defer;
            }
            
            document.head.appendChild(script);
        });
    }
    
    loadStylesheet(href, options = {}) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            // Add integrity check if provided
            if (options.integrity) {
                link.integrity = options.integrity;
                link.crossOrigin = 'anonymous';
            }
            
            link.onload = resolve;
            link.onerror = reject;
            
            document.head.appendChild(link);
        });
    }
}

// Usage
const cspBuilder = CSPBuilder.createStrictPolicy();
const scriptNonce = cspBuilder.allowInlineScript();
const policy = cspBuilder.build();

console.log('CSP Policy:', policy);

// Set CSP header (this would typically be done server-side)
// For client-side, you can use meta tag
const metaCSP = document.createElement('meta');
metaCSP.httpEquiv = 'Content-Security-Policy';
metaCSP.content = policy;
document.head.appendChild(metaCSP);

// Setup violation reporting
const violationReporter = new CSPViolationReporter('/api/csp-violations');

// Load scripts securely
const scriptLoader = new SecureScriptLoader(cspBuilder);

// Load external script with integrity
scriptLoader.loadScript('https://cdn.example.com/library.js', {
    integrity: 'sha384-abc123...',
    async: true
});

// Load inline script with nonce
scriptLoader.loadScript('console.log("Safe inline script");', {
    inline: true
});
```

---

## 🔐 Authentication & Authorization

### JWT Token Management
```javascript
// Secure JWT token manager
class JWTManager {
    constructor() {
        this.tokenKey = 'auth_token';
        this.refreshTokenKey = 'refresh_token';
    }
    
    // Store token securely
    setToken(token, refreshToken = null) {
        try {
            // Validate token format
            if (!this.isValidJWT(token)) {
                throw new Error('Invalid JWT format');
            }
            
            // Store in memory (most secure for access tokens)
            this.accessToken = token;
            
            // Store refresh token in httpOnly cookie (server-side)
            if (refreshToken) {
                this.refreshToken = refreshToken;
            }
            
            // Set expiration timer
            this.setTokenExpirationTimer(token);
            
        } catch (error) {
            console.error('Failed to set token:', error);
            throw error;
        }
    }
    
    getToken() {
        return this.accessToken;
    }
    
    isValidJWT(token) {
        if (!token || typeof token !== 'string') {
            return false;
        }
        
        const parts = token.split('.');
        return parts.length === 3;
    }
    
    parseJWT(token) {
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (error) {
            console.error('Failed to parse JWT:', error);
            return null;
        }
    }
    
    isTokenExpired(token = this.accessToken) {
        if (!token) return true;
        
        const payload = this.parseJWT(token);
        if (!payload || !payload.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    }
    
    setTokenExpirationTimer(token) {
        const payload = this.parseJWT(token);
        if (!payload || !payload.exp) return;
        
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        
        // Refresh token 5 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiration - 300000, 0);
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        this.refreshTimer = setTimeout(() => {
            this.refreshAccessToken();
        }, refreshTime);
    }
    
    async refreshAccessToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include', // Include httpOnly refresh token cookie
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const data = await response.json();
            this.setToken(data.accessToken, data.refreshToken);
            
            // Notify listeners
            this.notifyTokenRefresh(data.accessToken);
            
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.logout();
        }
    }
    
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        
        // Clear refresh token cookie
        fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).catch(console.error);
        
        // Redirect to login
        window.location.href = '/login';
    }
    
    notifyTokenRefresh(newToken) {
        // Notify other tabs/windows
        localStorage.setItem('token_refreshed', Date.now().toString());
        localStorage.removeItem('token_refreshed');
    }
    
    // Listen for token refresh in other tabs
    setupCrossTabSync() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'token_refreshed') {
                // Token was refreshed in another tab
                this.refreshAccessToken();
            }
        });
    }
}

// Role-based access control
class RBACManager {
    constructor(jwtManager) {
        this.jwtManager = jwtManager;
    }
    
    getCurrentUser() {
        const token = this.jwtManager.getToken();
        if (!token) return null;
        
        return this.jwtManager.parseJWT(token);
    }
    
    hasRole(role) {
        const user = this.getCurrentUser();
        if (!user || !user.roles) return false;
        
        return user.roles.includes(role);
    }
    
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user || !user.permissions) return false;
        
        return user.permissions.includes(permission);
    }
    
    hasAnyRole(roles) {
        return roles.some(role => this.hasRole(role));
    }
    
    hasAllRoles(roles) {
        return roles.every(role => this.hasRole(role));
    }
    
    canAccess(resource, action = 'read') {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // Check if user is admin
        if (this.hasRole('admin')) return true;
        
        // Check specific permissions
        const permission = `${resource}:${action}`;
        return this.hasPermission(permission);
    }
    
    requireAuth() {
        if (!this.getCurrentUser()) {
            throw new Error('Authentication required');
        }
    }
    
    requireRole(role) {
        this.requireAuth();
        if (!this.hasRole(role)) {
            throw new Error(`Role '${role}' required`);
        }
    }
    
    requirePermission(permission) {
        this.requireAuth();
        if (!this.hasPermission(permission)) {
            throw new Error(`Permission '${permission}' required`);
        }
    }
}

// Secure API client with authentication
class AuthenticatedAPIClient {
    constructor(jwtManager, rbacManager) {
        this.jwtManager = jwtManager;
        this.rbacManager = rbacManager;
        this.baseURL = '/api';
    }
    
    async request(endpoint, options = {}) {
        const token = this.jwtManager.getToken();
        
        if (!token || this.jwtManager.isTokenExpired()) {
            await this.jwtManager.refreshAccessToken();
        }
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.jwtManager.getToken()}`,
            ...options.headers
        };
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token might be invalid, try to refresh
            await this.jwtManager.refreshAccessToken();
            
            // Retry with new token
            headers.Authorization = `Bearer ${this.jwtManager.getToken()}`;
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });
            
            if (retryResponse.status === 401) {
                this.jwtManager.logout();
                throw new Error('Authentication failed');
            }
            
            return retryResponse;
        }
        
        if (response.status === 403) {
            throw new Error('Access denied');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    async get(endpoint, requiredPermission = null) {
        if (requiredPermission) {
            this.rbacManager.requirePermission(requiredPermission);
        }
        
        return this.request(endpoint, { method: 'GET' });
    }
    
    async post(endpoint, data, requiredPermission = null) {
        if (requiredPermission) {
            this.rbacManager.requirePermission(requiredPermission);
        }
        
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async put(endpoint, data, requiredPermission = null) {
        if (requiredPermission) {
            this.rbacManager.requirePermission(requiredPermission);
        }
        
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async delete(endpoint, requiredPermission = null) {
        if (requiredPermission) {
            this.rbacManager.requirePermission(requiredPermission);
        }
        
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Usage
const jwtManager = new JWTManager();
const rbacManager = new RBACManager(jwtManager);
const apiClient = new AuthenticatedAPIClient(jwtManager, rbacManager);

// Setup cross-tab token sync
jwtManager.setupCrossTabSync();

// Login
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        jwtManager.setToken(data.accessToken, data.refreshToken);
        
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Protected API calls
try {
    const userData = await apiClient.get('/user/profile', 'user:read');
    const adminData = await apiClient.get('/admin/users', 'admin:read');
} catch (error) {
    console.error('API call failed:', error);
}
```

---

## 🔐 Secure Communication

### HTTPS and Certificate Validation
```javascript
// Certificate pinning for critical requests
class SecureHTTPClient {
    constructor() {
        this.pinnedCertificates = new Map();
        this.trustedDomains = new Set();
    }
    
    addTrustedDomain(domain) {
        this.trustedDomains.add(domain);
    }
    
    pinCertificate(domain, fingerprint) {
        if (!this.pinnedCertificates.has(domain)) {
            this.pinnedCertificates.set(domain, new Set());
        }
        this.pinnedCertificates.get(domain).add(fingerprint);
    }
    
    async secureRequest(url, options = {}) {
        const parsedURL = new URL(url);
        
        // Ensure HTTPS
        if (parsedURL.protocol !== 'https:') {
            throw new Error('Only HTTPS requests are allowed');
        }
        
        // Check if domain is trusted
        if (!this.trustedDomains.has(parsedURL.hostname)) {
            console.warn(`Untrusted domain: ${parsedURL.hostname}`);
        }
        
        // Add security headers
        const secureOptions = {
            ...options,
            headers: {
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, secureOptions);
            
            // Validate response headers
            this.validateResponseHeaders(response);
            
            return response;
        } catch (error) {
            console.error('Secure request failed:', error);
            throw error;
        }
    }
    
    validateResponseHeaders(response) {
        const requiredHeaders = [
            'strict-transport-security',
            'x-content-type-options',
            'x-frame-options'
        ];
        
        const missingHeaders = requiredHeaders.filter(
            header => !response.headers.has(header)
        );
        
        if (missingHeaders.length > 0) {
            console.warn('Missing security headers:', missingHeaders);
        }
    }
    
    async validateCertificate(domain) {
        // Note: Certificate validation is typically handled by the browser
        // This is a conceptual example
        try {
            const response = await fetch(`https://${domain}`, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Certificate validation failed:', error);
            return false;
        }
    }
}

// Secure WebSocket communication
class SecureWebSocket {
    constructor(url, protocols = []) {
        this.url = url;
        this.protocols = protocols;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure WSS (secure WebSocket)
                const wsURL = new URL(this.url);
                if (wsURL.protocol !== 'wss:') {
                    throw new Error('Only secure WebSocket connections (wss://) are allowed');
                }
                
                this.ws = new WebSocket(this.url, this.protocols);
                
                this.ws.onopen = (event) => {
                    console.log('Secure WebSocket connected');
                    this.reconnectAttempts = 0;
                    
                    // Send queued messages
                    this.flushMessageQueue();
                    
                    resolve(event);
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(event);
                };
                
                this.ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    this.handleReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    handleMessage(event) {
        try {
            // Validate message format
            const data = JSON.parse(event.data);
            
            // Verify message integrity if needed
            if (data.signature) {
                if (!this.verifyMessageSignature(data)) {
                    console.error('Message signature verification failed');
                    return;
                }
            }
            
            // Process message
            this.onMessage(data);
            
        } catch (error) {
            console.error('Failed to process WebSocket message:', error);
        }
    }
    
    verifyMessageSignature(data) {
        // Implement message signature verification
        // This would typically use HMAC or digital signatures
        return true; // Placeholder
    }
    
    send(data) {
        const message = {
            ...data,
            timestamp: Date.now(),
            id: this.generateMessageId()
        };
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // Queue message for later
            this.messageQueue.push(message);
        }
    }
    
    generateMessageId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.ws.send(JSON.stringify(message));
        }
    }
    
    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`Reconnecting in ${delay}ms...`);
            
            setTimeout(() => {
                this.connect().catch(console.error);
            }, delay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }
    
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
    
    onMessage(data) {
        // Override this method to handle messages
        console.log('Received message:', data);
    }
}

// Usage
const secureClient = new SecureHTTPClient();
secureClient.addTrustedDomain('api.example.com');
secureClient.pinCertificate('api.example.com', 'sha256-fingerprint');

// Secure WebSocket
const secureWS = new SecureWebSocket('wss://api.example.com/ws');
secureWS.onMessage = (data) => {
    console.log('Secure message received:', data);
};

secureWS.connect().then(() => {
    secureWS.send({ type: 'hello', message: 'Secure connection established' });
});
```

---

## 🔒 Data Protection

### Client-Side Encryption
```javascript
// Client-side encryption utilities
class ClientEncryption {
    static async generateKey() {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    static async encryptData(data, key) {
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(data));
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encodedData
        );
        
        return {
            data: Array.from(new Uint8Array(encryptedData)),
            iv: Array.from(iv)
        };
    }
    
    static async decryptData(encryptedData, key) {
        const data = new Uint8Array(encryptedData.data);
        const iv = new Uint8Array(encryptedData.iv);
        
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            data
        );
        
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedData);
        return JSON.parse(jsonString);
    }
    
    static async exportKey(key) {
        const exported = await crypto.subtle.exportKey('jwk', key);
        return exported;
    }
    
    static async importKey(keyData) {
        return await crypto.subtle.importKey(
            'jwk',
            keyData,
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }
}

// Secure local storage
class SecureStorage {
    constructor() {
        this.encryptionKey = null;
        this.initializeKey();
    }
    
    async initializeKey() {
        // Try to get existing key from secure storage
        const storedKey = localStorage.getItem('encryption_key');
        
        if (storedKey) {
            try {
                this.encryptionKey = await ClientEncryption.importKey(JSON.parse(storedKey));
            } catch (error) {
                console.error('Failed to import stored key:', error);
                await this.generateNewKey();
            }
        } else {
            await this.generateNewKey();
        }
    }
    
    async generateNewKey() {
        this.encryptionKey = await ClientEncryption.generateKey();
        const exportedKey = await ClientEncryption.exportKey(this.encryptionKey);
        localStorage.setItem('encryption_key', JSON.stringify(exportedKey));
    }
    
    async setItem(key, value) {
        if (!this.encryptionKey) {
            await this.initializeKey();
        }
        
        try {
            const encryptedData = await ClientEncryption.encryptData(value, this.encryptionKey);
            localStorage.setItem(key, JSON.stringify(encryptedData));
        } catch (error) {
            console.error('Failed to encrypt and store data:', error);
            throw error;
        }
    }
    
    async getItem(key) {
        if (!this.encryptionKey) {
            await this.initializeKey();
        }
        
        try {
            const storedData = localStorage.getItem(key);
            if (!storedData) return null;
            
            const encryptedData = JSON.parse(storedData);
            return await ClientEncryption.decryptData(encryptedData, this.encryptionKey);
        } catch (error) {
            console.error('Failed to decrypt stored data:', error);
            return null;
        }
    }
    
    removeItem(key) {
        localStorage.removeItem(key);
    }
    
    clear() {
        localStorage.clear();
        this.encryptionKey = null;
    }
}

// Sensitive data handler
class SensitiveDataHandler {
    constructor() {
        this.secureStorage = new SecureStorage();
        this.dataClassifications = new Map();
    }
    
    classifyData(key, classification) {
        // Classifications: public, internal, confidential, restricted
        this.dataClassifications.set(key, classification);
    }
    
    async storeData(key, data, classification = 'internal') {
        this.classifyData(key, classification);
        
        switch (classification) {
            case 'public':
                // Store in regular localStorage
                localStorage.setItem(key, JSON.stringify(data));
                break;
            case 'internal':
            case 'confidential':
            case 'restricted':
                // Store encrypted
                await this.secureStorage.setItem(key, data);
                break;
            default:
                throw new Error(`Unknown classification: ${classification}`);
        }
    }
    
    async retrieveData(key) {
        const classification = this.dataClassifications.get(key) || 'internal';
        
        switch (classification) {
            case 'public':
                const publicData = localStorage.getItem(key);
                return publicData ? JSON.parse(publicData) : null;
            case 'internal':
            case 'confidential':
            case 'restricted':
                return await this.secureStorage.getItem(key);
            default:
                throw new Error(`Unknown classification: ${classification}`);
        }
    }
    
    sanitizeForLogging(data, classification = 'internal') {
        if (classification === 'public') {
            return data;
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (this.isSensitiveField(key)) {
                    sanitized[key] = '[REDACTED]';
                } else if (typeof value === 'string' && value.length > 10) {
                    sanitized[key] = value.substring(0, 3) + '***' + value.substring(value.length - 3);
                } else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        }
        
        return '[REDACTED]';
    }
    
    isSensitiveField(fieldName) {
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'ssn',
            'credit_card', 'bank_account', 'api_key'
        ];
        
        return sensitiveFields.some(field => 
            fieldName.toLowerCase().includes(field)
        );
    }
}

// Usage
const dataHandler = new SensitiveDataHandler();

// Store different types of data
await dataHandler.storeData('user_preferences', {
    theme: 'dark',
    language: 'en'
}, 'public');

await dataHandler.storeData('user_profile', {
    name: 'John Doe',
    email: 'john@example.com',
    api_key: 'secret123'
}, 'confidential');

// Retrieve data
const preferences = await dataHandler.retrieveData('user_preferences');
const profile = await dataHandler.retrieveData('user_profile');

// Safe logging
console.log('User preferences:', preferences); // Safe to log
console.log('User profile:', dataHandler.sanitizeForLogging(profile, 'confidential'));
```

---

## ⚠️ Common Pitfalls

### 1. **Trusting Client-Side Data**
```javascript
// ❌ Never trust client-side validation alone
function validateAge(age) {
    if (age >= 18) {
        // This can be bypassed by modifying client code
        return true;
    }
    return false;
}

// ✅ Always validate on server-side too
function clientSideValidation(age) {
    // Client-side for UX only
    return age >= 18;
}

// Server-side validation is mandatory
function serverSideValidation(age) {
    // This runs on the server and cannot be bypassed
    return typeof age === 'number' && age >= 18;
}
```

### 2. **Storing Secrets in Client Code**
```javascript
// ❌ Never store secrets in client-side code
const API_SECRET = 'secret123'; // Visible to anyone
const DATABASE_PASSWORD = 'password'; // Exposed in source

// ✅ Use environment variables and server-side configuration
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT; // Public config only

// Secrets should be on server-side only
class SecureAPIClient {
    constructor() {
        // Only store public configuration
        this.baseURL = '/api'; // Relative URL
    }
    
    async authenticatedRequest(endpoint, options = {}) {
        // Let server handle authentication
        return fetch(endpoint, {
            ...options,
            credentials: 'include' // Include httpOnly cookies
        });
    }
}
```

### 3. **Improper Error Handling**
```javascript
// ❌ Exposing sensitive information in errors
function loginUser(email, password) {
    try {
        // ... authentication logic
    } catch (error) {
        // Don't expose internal details
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

// ✅ Generic error messages for security
function secureLoginUser(email, password) {
    try {
        // ... authentication logic
    } catch (error) {
        // Log detailed error server-side
        console.error('Login error:', error);
        
        // Return generic message to client
        throw new Error('Invalid credentials');
    }
}
```

### 4. **Insufficient Input Validation**
```javascript
// ❌ Weak validation
function processUserInput(input) {
    if (input.length > 0) {
        return input;
    }
}

// ✅ Comprehensive validation
function secureProcessUserInput(input) {
    // Type check
    if (typeof input !== 'string') {
        throw new Error('Input must be a string');
    }
    
    // Length check
    if (input.length === 0 || input.length > 1000) {
        throw new Error('Input length must be between 1 and 1000 characters');
    }
    
    // Content validation
    const sanitized = input.trim();
    if (!/^[a-zA-Z0-9\s\-_.,!?]+$/.test(sanitized)) {
        throw new Error('Input contains invalid characters');
    }
    
    // XSS prevention
    return XSSProtection.sanitizeHTML(sanitized);
}
```

### 5. **Insecure Direct Object References**
```javascript
// ❌ Exposing internal IDs
function getUserData(userId) {
    // Anyone can guess user IDs
    return fetch(`/api/users/${userId}`);
}

// ✅ Use authorization checks
function secureGetUserData(userToken) {
    // Server validates token and returns appropriate data
    return fetch('/api/user/profile', {
        headers: {
            'Authorization': `Bearer ${userToken}`
        }
    });
}
```

---

## 🎯 Mini Practice Problems

### Problem 1: Secure User Registration Form
```javascript
// Create a secure user registration system
class SecureRegistration {
    constructor() {
        this.validator = new InputValidator();
        this.csrfProtection = new CSRFProtection();
    }
    
    async registerUser(formData) {
        try {
            // Validate all inputs
            const validatedData = {
                username: this.validator.validateUsername(formData.username),
                email: this.validator.validateEmail(formData.email),
                password: this.validator.validatePassword(formData.password)
            };
            
            // Check password confirmation
            if (formData.password !== formData.confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Add CSRF protection
            const requestData = {
                ...validatedData,
                csrf_token: this.csrfProtection.getToken()
            };
            
            // Send to server
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Registration error:', error.message);
            throw error;
        }
    }
}
```

### Problem 2: Secure File Upload
```javascript
// Implement secure file upload with validation
class SecureFileUpload {
    constructor() {
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }
    
    validateFile(file) {
        // Check file type
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('File type not allowed');
        }
        
        // Check file size
        if (file.size > this.maxFileSize) {
            throw new Error('File too large');
        }
        
        // Check file name
        const fileName = file.name;
        if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
            throw new Error('Invalid file name');
        }
        
        return true;
    }
    
    async uploadFile(file, progressCallback) {
        this.validateFile(file);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('csrf_token', csrfToken);
        
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    progressCallback(progress);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error('Upload failed'));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Upload error'));
            });
            
            xhr.open('POST', '/api/upload');
            xhr.send(formData);
        });
    }
}
```

### Problem 3: Secure Chat Application
```javascript
// Build a secure real-time chat with message encryption
class SecureChat {
    constructor(userId) {
        this.userId = userId;
        this.encryptionKey = null;
        this.ws = null;
        this.messageHistory = [];
        this.initializeEncryption();
    }
    
    async initializeEncryption() {
        this.encryptionKey = await ClientEncryption.generateKey();
    }
    
    connect() {
        this.ws = new SecureWebSocket('wss://chat.example.com/ws');
        
        this.ws.onMessage = (data) => {
            this.handleMessage(data);
        };
        
        return this.ws.connect();
    }
    
    async sendMessage(text, recipientId) {
        // Validate message
        if (!text || text.trim().length === 0) {
            throw new Error('Message cannot be empty');
        }
        
        if (text.length > 1000) {
            throw new Error('Message too long');
        }
        
        // Sanitize message
        const sanitizedText = XSSProtection.sanitizeHTML(text.trim());
        
        // Encrypt message
        const encryptedMessage = await ClientEncryption.encryptData(
            {
                text: sanitizedText,
                timestamp: Date.now(),
                senderId: this.userId,
                recipientId: recipientId
            },
            this.encryptionKey
        );
        
        // Send through WebSocket
        this.ws.send({
            type: 'message',
            data: encryptedMessage
        });
    }
    
    async handleMessage(data) {
        try {
            if (data.type === 'message') {
                // Decrypt message
                const decryptedMessage = await ClientEncryption.decryptData(
                    data.data,
                    this.encryptionKey
                );
                
                // Validate message structure
                if (!this.isValidMessage(decryptedMessage)) {
                    console.error('Invalid message format');
                    return;
                }
                
                // Add to history
                this.messageHistory.push(decryptedMessage);
                
                // Display message
                this.displayMessage(decryptedMessage);
            }
        } catch (error) {
            console.error('Failed to handle message:', error);
        }
    }
    
    isValidMessage(message) {
        return message &&
               typeof message.text === 'string' &&
               typeof message.timestamp === 'number' &&
               typeof message.senderId === 'string' &&
               typeof message.recipientId === 'string';
    }
    
    displayMessage(message) {
        const messageElement = SecureDOM.createElement('div', {
            class: 'chat-message',
            'data-sender': message.senderId
        });
        
        const timeElement = SecureDOM.createElement('span', {
            class: 'message-time'
        }, new Date(message.timestamp).toLocaleTimeString());
        
        const textElement = SecureDOM.createElement('p', {
            class: 'message-text'
        }, message.text);
        
        messageElement.appendChild(timeElement);
        messageElement.appendChild(textElement);
        
        document.getElementById('chat-messages').appendChild(messageElement);
    }
}
```

---

## 📝 Interview Notes

### Common Security Questions

**Q: What is XSS and how do you prevent it?**
A: Cross-Site Scripting (XSS) is when malicious scripts are injected into web pages. Prevention includes:
- Input validation and sanitization
- Output encoding
- Content Security Policy (CSP)
- Using textContent instead of innerHTML
- Validating and sanitizing user-generated content

**Q: Explain CSRF and its mitigation strategies.**
A: Cross-Site Request Forgery tricks users into performing unwanted actions. Mitigation:
- CSRF tokens in forms
- SameSite cookie attributes
- Checking Referer headers
- Double-submit cookies
- Custom headers for AJAX requests

**Q: How do you securely store sensitive data on the client-side?**
A: 
- Never store secrets in client-side code
- Use encryption for sensitive data in localStorage
- Prefer httpOnly cookies for authentication tokens
- Implement proper key management
- Use secure storage APIs when available

**Q: What are the security considerations for JWT tokens?**
A:
- Store access tokens in memory, not localStorage
- Use httpOnly cookies for refresh tokens
- Implement proper token expiration
- Validate token signatures
- Use HTTPS for token transmission
- Implement token refresh mechanisms

### Company-Specific Questions

**Frontend Security (React/Vue/Angular):**
- How do you prevent XSS in component-based frameworks?
- What are the security implications of dangerouslySetInnerHTML?
- How do you implement secure routing and authentication?

**API Security:**
- How do you secure API communications?
- What is API rate limiting and how do you implement it?
- How do you handle API authentication and authorization?

**Performance vs Security:**
- How do you balance security measures with performance?
- What are the trade-offs of client-side encryption?
- How do you optimize secure communication?

### Key Takeaways

1. **Defense in Depth**: Implement multiple layers of security
2. **Input Validation**: Never trust user input, validate everything
3. **Principle of Least Privilege**: Grant minimum necessary permissions
4. **Secure by Default**: Make secure choices the default option
5. **Regular Updates**: Keep dependencies and libraries updated
6. **Security Testing**: Include security testing in your development process
7. **Incident Response**: Have a plan for security incidents
8. **Education**: Stay informed about latest security threats and best practices

---

*Remember: Security is not a feature you add at the end—it should be built into every aspect of your application from the beginning. Always assume that attackers will find the most creative ways to exploit vulnerabilities, so be proactive in your security measures.*