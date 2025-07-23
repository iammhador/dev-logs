# Dark Mode

## Introduction to Dark Mode in Tailwind

Dark mode has become an essential feature in modern web applications. Tailwind CSS provides built-in support for dark mode through the `dark:` variant, making it easy to create interfaces that adapt to user preferences or system settings.

## Enabling Dark Mode

First, you need to configure dark mode in your `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' or false
  // ... rest of your config
}
```

### Dark Mode Strategies

1. **`'media'`** - Uses CSS media queries (respects system preference)
2. **`'class'`** - Uses a class-based approach (manual toggle)
3. **`false`** - Disables dark mode

## Basic Dark Mode Usage

### Simple Dark Mode Styling

```html
<!-- Basic dark mode example -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 rounded-lg">
  <h1 class="text-2xl font-bold mb-4">Welcome to Our App</h1>
  <p class="text-gray-600 dark:text-gray-300">
    This content adapts to light and dark modes automatically.
  </p>
</div>

<!-- Card with dark mode -->
<div class="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg p-6">
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
    Card Title
  </h2>
  <p class="text-gray-600 dark:text-gray-300 mb-4">
    This is a card that looks great in both light and dark modes.
  </p>
  <button class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
    Action Button
  </button>
</div>
```

### Navigation with Dark Mode

```html
<nav class="bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
        <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">Brand</span>
      </div>
      
      <!-- Navigation Links -->
      <div class="hidden md:flex space-x-8">
        <a href="#" class="text-blue-600 dark:text-blue-400 font-medium">
          Home
        </a>
        <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          About
        </a>
        <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Services
        </a>
        <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Contact
        </a>
      </div>
      
      <!-- Dark Mode Toggle -->
      <button 
        id="theme-toggle"
        class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <!-- Sun icon (visible in dark mode) -->
        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <!-- Moon icon (visible in light mode) -->
        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      </button>
    </div>
  </div>
</nav>
```

## Dark Mode Toggle Implementation

### JavaScript for Class-Based Dark Mode

```html
<script>
// Dark mode toggle functionality
function initDarkMode() {
  // Check for saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Initialize dark mode on page load
initDarkMode();

// Add event listener to toggle button
document.getElementById('theme-toggle')?.addEventListener('click', toggleDarkMode);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});
</script>
```

### React Dark Mode Hook

```javascript
// useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { isDark, toggleDarkMode };
}

// DarkModeToggle.jsx
import { useDarkMode } from './useDarkMode';

export function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        // Sun icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

## Dark Mode Design Patterns

### Form Elements in Dark Mode

```html
<form class="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg dark:shadow-gray-900/50">
  <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Form</h2>
  
  <div class="space-y-6">
    <!-- Input Field -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Name
      </label>
      <input 
        type="text" 
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
        placeholder="Enter your name"
      >
    </div>
    
    <!-- Textarea -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Message
      </label>
      <textarea 
        rows="4"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors resize-none"
        placeholder="Enter your message"
      ></textarea>
    </div>
    
    <!-- Select Dropdown -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Subject
      </label>
      <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
        <option>General Inquiry</option>
        <option>Support</option>
        <option>Sales</option>
      </select>
    </div>
    
    <!-- Checkbox -->
    <div class="flex items-center">
      <input 
        type="checkbox" 
        id="newsletter"
        class="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
      >
      <label for="newsletter" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
        Subscribe to newsletter
      </label>
    </div>
    
    <!-- Submit Button -->
    <button 
      type="submit"
      class="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
    >
      Send Message
    </button>
  </div>
</form>
```

### Dashboard in Dark Mode

```html
<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <!-- Sidebar -->
  <aside class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border-r border-gray-200 dark:border-gray-700">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
    </div>
    
    <nav class="px-4">
      <ul class="space-y-2">
        <li>
          <a href="#" class="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            <div class="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded mr-3"></div>
            Overview
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-3"></div>
            Analytics
          </a>
        </li>
        <li>
          <a href="#" class="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div class="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-3"></div>
            Users
          </a>
        </li>
      </ul>
    </nav>
  </aside>
  
  <!-- Main Content -->
  <main class="ml-64 p-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Here's what's happening with your projects today.</p>
    </header>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">1,234</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded"></div>
          </div>
        </div>
        <p class="text-sm text-green-600 dark:text-green-400 mt-2">+12% from last month</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">$12,345</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-green-500 dark:bg-green-400 rounded"></div>
          </div>
        </div>
        <p class="text-sm text-green-600 dark:text-green-400 mt-2">+8% from last month</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Orders</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">567</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-yellow-500 dark:bg-yellow-400 rounded"></div>
          </div>
        </div>
        <p class="text-sm text-red-600 dark:text-red-400 mt-2">-3% from last month</p>
      </div>
      
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Growth</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">+12%</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
            <div class="w-6 h-6 bg-purple-500 dark:bg-purple-400 rounded"></div>
          </div>
        </div>
        <p class="text-sm text-green-600 dark:text-green-400 mt-2">+2% from last month</p>
      </div>
    </div>
    
    <!-- Chart Section -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analytics Overview</h3>
      <div class="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <p class="text-gray-500 dark:text-gray-400">Chart would go here</p>
      </div>
    </div>
  </main>
</div>
```

## Advanced Dark Mode Techniques

### Custom Color Schemes

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom dark mode colors
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Brand colors with dark variants
        brand: {
          light: '#3b82f6',
          dark: '#60a5fa',
        }
      }
    }
  }
}
```

### Dark Mode with CSS Variables

```css
/* In your CSS file */
:root {
  --color-primary: 59 130 246; /* blue-500 */
  --color-background: 255 255 255; /* white */
  --color-text: 17 24 39; /* gray-900 */
}

.dark {
  --color-primary: 96 165 250; /* blue-400 */
  --color-background: 17 24 39; /* gray-900 */
  --color-text: 243 244 246; /* gray-100 */
}

/* Use in Tailwind config */
```

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
      }
    }
  }
}
```

### Animated Dark Mode Toggle

```html
<button 
  id="theme-toggle"
  class="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 overflow-hidden"
>
  <!-- Toggle Track -->
  <div class="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors duration-300">
    <!-- Toggle Thumb -->
    <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 dark:translate-x-6">
      <!-- Sun Icon -->
      <svg class="w-3 h-3 text-yellow-500 absolute top-1 left-1 transition-opacity duration-300 opacity-100 dark:opacity-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
      </svg>
      
      <!-- Moon Icon -->
      <svg class="w-3 h-3 text-gray-700 absolute top-1 left-1 transition-opacity duration-300 opacity-0 dark:opacity-100" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>
    </div>
  </div>
</button>
```

## Dark Mode Best Practices

### Color Contrast and Accessibility

```html
<!-- Good: Sufficient contrast in both modes -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h2 class="text-2xl font-bold mb-4">High Contrast Title</h2>
  <p class="text-gray-700 dark:text-gray-300">
    This text maintains good readability in both light and dark modes.
  </p>
</div>

<!-- Good: Proper focus indicators -->
<button class="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
  Accessible Button
</button>

<!-- Good: Clear interactive states -->
<a href="#" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">
  Accessible Link
</a>
```

### Consistent Design System

```html
<!-- Define consistent color patterns -->
<div class="space-y-4">
  <!-- Primary elements -->
  <div class="bg-blue-500 dark:bg-blue-600 text-white p-4 rounded">
    Primary element
  </div>
  
  <!-- Secondary elements -->
  <div class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded">
    Secondary element
  </div>
  
  <!-- Success states -->
  <div class="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded border border-green-200 dark:border-green-800">
    Success message
  </div>
  
  <!-- Warning states -->
  <div class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded border border-yellow-200 dark:border-yellow-800">
    Warning message
  </div>
  
  <!-- Error states -->
  <div class="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded border border-red-200 dark:border-red-800">
    Error message
  </div>
</div>
```

## Visual Dark Mode Diagram

```
Dark Mode Implementation Flow:

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ System/User     │    │ JavaScript      │    │ CSS Classes     │
│ Preference      │───▶│ Detection       │───▶│ Applied         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       ▼
        │                       │              ┌─────────────────┐
        │                       │              │ Dark Mode       │
        │                       │              │ Styles Active   │
        │                       │              └─────────────────┘
        │                       │
        │              ┌─────────────────┐
        │              │ localStorage    │
        └─────────────▶│ Persistence     │
                       └─────────────────┘

Color Adaptation Pattern:

Light Mode:                    Dark Mode:
┌─────────────────┐           ┌─────────────────┐
│ bg-white        │    ───▶   │ bg-gray-900     │
│ text-gray-900   │           │ text-white      │
│ border-gray-200 │           │ border-gray-700 │
└─────────────────┘           └─────────────────┘

Component Structure:
┌─────────────────────────────────────────┐
│ <html class="dark">                     │
│   <body class="bg-white dark:bg-gray-900">│
│     <div class="text-black dark:text-white">│
│       Content adapts automatically      │
│     </div>                              │
│   </body>                               │
└─────────────────────────────────────────┘
```

## Common Pitfalls & Anti-Patterns

### ❌ Inconsistent Dark Mode Coverage

```html
<!-- Bad: Some elements don't have dark mode styles -->
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600">This text doesn't adapt to dark mode</p>
  <button class="bg-blue-500 text-white">Button without dark styles</button>
</div>
```

### ✅ Complete Dark Mode Coverage

```html
<!-- Good: All elements have dark mode styles -->
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Title</h1>
  <p class="text-gray-600 dark:text-gray-300">This text adapts properly</p>
  <button class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white">Proper button</button>
</div>
```

### ❌ Poor Contrast in Dark Mode

```html
<!-- Bad: Poor contrast in dark mode -->
<div class="bg-gray-900 text-gray-700">
  This text is hard to read in dark mode
</div>
```

### ✅ Good Contrast in Both Modes

```html
<!-- Good: Proper contrast in both modes -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  This text is readable in both modes
</div>
```

### ❌ Forgetting Interactive States

```html
<!-- Bad: No dark mode for interactive states -->
<button class="bg-blue-500 hover:bg-blue-600 text-white">
  Missing dark hover state
</button>
```

### ✅ Complete Interactive States

```html
<!-- Good: Dark mode for all states -->
<button class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-blue-400 text-white">
  Complete state coverage
</button>
```

## When and Why to Use Dark Mode

### ✅ Benefits of Dark Mode:

1. **Reduced eye strain** - Especially in low-light environments
2. **Battery savings** - On OLED screens
3. **User preference** - Many users prefer dark interfaces
4. **Modern aesthetics** - Trendy and professional appearance
5. **Accessibility** - Can help users with light sensitivity
6. **Focus enhancement** - Content stands out more

### ✅ When to Implement:

1. **Content-heavy applications** - Reading apps, documentation
2. **Developer tools** - Code editors, terminals
3. **Entertainment apps** - Video streaming, gaming
4. **Productivity apps** - Task managers, note-taking
5. **Mobile applications** - Battery conservation
6. **24/7 applications** - Monitoring dashboards

## Performance Considerations

### Efficient Dark Mode Implementation

```html
<!-- Good: Use CSS transitions for smooth mode switching -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
  Smooth color transitions
</div>

<!-- Good: Minimize layout shifts -->
<img 
  src="light-logo.png" 
  alt="Logo"
  class="block dark:hidden"
>
<img 
  src="dark-logo.png" 
  alt="Logo"
  class="hidden dark:block"
>
```

### Avoid Performance Issues

```html
<!-- Avoid: Too many transition properties -->
<div class="transition-all duration-500">
  Can cause performance issues
</div>

<!-- Better: Specific transition properties -->
<div class="transition-colors duration-200">
  More performant
</div>
```

## Mini Challenges

### Challenge 1: Dark Mode Landing Page
Create a landing page that:
- Has a working dark mode toggle
- Includes hero section, features, and footer
- All elements properly adapt to dark mode
- Maintains good contrast and accessibility
- Persists user preference in localStorage

### Challenge 2: Dark Mode Dashboard
Build a dashboard featuring:
- Sidebar navigation with dark mode
- Data cards that adapt to both modes
- Form elements with proper dark styling
- Charts/graphs that work in both modes
- Consistent color scheme throughout

### Challenge 3: Dark Mode E-commerce
Create an e-commerce product page with:
- Product images that work in both modes
- Shopping cart with dark mode support
- Product reviews and ratings
- Checkout form with proper dark styling
- Responsive design that works in both modes

## Interview Tips

**Q: "How do you implement dark mode in Tailwind CSS?"**

**A:** "I implement dark mode in Tailwind using the `dark:` variant:
1. **Configure darkMode** - Set `darkMode: 'class'` in tailwind.config.js
2. **Add dark variants** - Use `dark:` prefix for dark mode styles
3. **Toggle implementation** - JavaScript to add/remove 'dark' class on html element
4. **Persistence** - Store user preference in localStorage
5. **System preference** - Respect `prefers-color-scheme` media query
6. **Complete coverage** - Ensure all elements have dark mode styles
7. **Accessibility** - Maintain proper contrast ratios in both modes"

**Q: "What are the challenges of implementing dark mode?"**

**A:** "Main challenges include:
1. **Consistent coverage** - Ensuring all components have dark variants
2. **Color contrast** - Maintaining accessibility in both modes
3. **Image handling** - Adapting images/logos for different backgrounds
4. **Third-party components** - Ensuring external components support dark mode
5. **Performance** - Smooth transitions without layout shifts
6. **Testing** - Verifying functionality across both modes
7. **Design system** - Maintaining brand consistency in dark mode"

**Q: "How do you ensure accessibility in dark mode?"**

**A:** "For dark mode accessibility, I:
1. **Test contrast ratios** - Use tools to verify WCAG compliance
2. **Focus indicators** - Ensure visible focus states in both modes
3. **Color independence** - Don't rely solely on color for information
4. **User testing** - Test with users who have visual impairments
5. **Screen reader compatibility** - Ensure mode changes are announced
6. **Respect preferences** - Honor system and user preferences
7. **Fallback support** - Graceful degradation for unsupported browsers"

---

## Challenge Answers

### Answer 1: Dark Mode Landing Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dark Mode Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
</head>
<body class="bg-white dark:bg-gray-900 transition-colors duration-300">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
                    <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">DarkMode</span>
                </div>
                
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#" class="text-blue-600 dark:text-blue-400 font-medium">Home</a>
                    <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                    <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                    <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
                    
                    <!-- Dark Mode Toggle -->
                    <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                    Beautiful Dark Mode
                    <span class="text-blue-600 dark:text-blue-400">Experience</span>
                </h1>
                <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                    Experience the perfect balance of light and dark with our carefully crafted interface that adapts to your preferences.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button class="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Get Started
                    </button>
                    <button class="border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-white transition-colors">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-20 bg-white dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Why Choose Dark Mode?
                </h2>
                <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Discover the benefits of a well-implemented dark mode interface.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reduced Eye Strain</h3>
                    <p class="text-gray-600 dark:text-gray-300">Easier on the eyes, especially in low-light environments.</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <div class="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <div class="w-8 h-8 bg-green-500 dark:bg-green-400 rounded"></div>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Battery Savings</h3>
                    <p class="text-gray-600 dark:text-gray-300">Conserve battery life on OLED and AMOLED displays.</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                    <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <div class="w-8 h-8 bg-purple-500 dark:bg-purple-400 rounded"></div>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Modern Design</h3>
                    <p class="text-gray-600 dark:text-gray-300">Sleek, professional appearance that users love.</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <div class="flex items-center justify-center mb-4">
                    <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
                    <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">DarkMode</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-4">
                    Experience the perfect balance of light and dark.
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    © 2024 DarkMode. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
    
    <script>
        // Dark mode functionality
        function initDarkMode() {
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        
        function toggleDarkMode() {
            const isDark = document.documentElement.classList.contains('dark');
            
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        }
        
        // Initialize on page load
        initDarkMode();
        
        // Add event listener
        document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        });
    </script>
</body>
</html>
```

### Answer 2: Dark Mode Dashboard
```html
<div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <div class="flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border-r border-gray-200 dark:border-gray-700 min-h-screen">
            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
                    <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">Dashboard</span>
                </div>
            </div>
            
            <nav class="p-4">
                <ul class="space-y-2">
                    <li>
                        <a href="#" class="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            <div class="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded mr-3"></div>
                            Overview
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-3"></div>
                            Analytics
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-3"></div>
                            Users
                        </a>
                    </li>
                    <li>
                        <a href="#" class="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded mr-3"></div>
                            Settings
                        </a>
                    </li>
                </ul>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="flex-1 p-8">
            <!-- Header -->
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p class="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
                </div>
                
                <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                </button>
            </header>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white">$45,231</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                            <div class="w-6 h-6 bg-green-500 dark:bg-green-400 rounded"></div>
                        </div>
                    </div>
                    <p class="text-sm text-green-600 dark:text-green-400 mt-2">+20.1% from last month</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white">2,350</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                            <div class="w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded"></div>
                        </div>
                    </div>
                    <p class="text-sm text-blue-600 dark:text-blue-400 mt-2">+180.1% from last month</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Sales</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white">12,234</p>
                        </div>
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                            <div class="w-6 h-6 bg-yellow-500 dark:bg-yellow-400 rounded"></div>
                        </div>
                    </div>
                    <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">+19% from last month</p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Now</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white">573</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                            <div class="w-6 h-6 bg-purple-500 dark:bg-purple-400 rounded"></div>
                        </div>
                    </div>
                    <p class="text-sm text-purple-600 dark:text-purple-400 mt-2">+201 since last hour</p>
                </div>
            </div>
            
            <!-- Charts and Forms -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Chart Section -->
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                    <div class="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p class="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
                    </div>
                </div>
                
                <!-- Form Section -->
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Name</label>
                            <input type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" placeholder="Enter user name">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                            <select class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
                                <option>Admin</option>
                                <option>User</option>
                                <option>Moderator</option>
                            </select>
                        </div>
                        
                        <button type="submit" class="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
                            Add User
                        </button>
                    </form>
                </div>
            </div>
        </main>
    </div>
</div>

<script>
// Dark mode functionality
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize on page load
initDarkMode();

// Add event listener
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
</script>
```

### Answer 3: Dark Mode E-commerce
```html
<div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 dark:bg-blue-400 rounded"></div>
                    <span class="ml-2 text-xl font-bold text-gray-900 dark:text-white">Shop</span>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <div class="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded"></div>
                    </button>
                    
                    <button id="theme-toggle" class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Product Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Product Image -->
            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                <div class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p class="text-gray-500 dark:text-gray-400">Product Image</p>
                </div>
            </div>
            
            <!-- Product Details -->
            <div class="space-y-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Premium Headphones</h1>
                    <p class="text-2xl font-semibold text-blue-600 dark:text-blue-400">$299.99</p>
                </div>
                
                <p class="text-gray-600 dark:text-gray-300">
                    Experience premium sound quality with these professional-grade headphones. Perfect for music lovers and professionals alike.
                </p>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                        <div class="flex space-x-2">
                            <button class="w-8 h-8 bg-black rounded-full border-2 border-gray-300 dark:border-gray-600"></button>
                            <button class="w-8 h-8 bg-white border-2 border-gray-300 dark:border-gray-600 rounded-full"></button>
                            <button class="w-8 h-8 bg-blue-500 rounded-full border-2 border-gray-300 dark:border-gray-600"></button>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                        <select class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                        </select>
                    </div>
                </div>
                
                <div class="flex space-x-4">
                    <button class="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                        Add to Cart
                    </button>
                    <button class="px-6 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white dark:hover:text-white transition-colors">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Reviews Section -->
        <div class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Customer Reviews</h2>
            
            <div class="space-y-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                            <div>
                                <p class="font-semibold text-gray-900 dark:text-white">John Doe</p>
                                <div class="flex text-yellow-400">
                                    <span>★★★★★</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">
                        Amazing sound quality! These headphones exceeded my expectations. The build quality is excellent and they're very comfortable for long listening sessions.
                    </p>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-10 h-10 bg-green-500 dark:bg-green-400 rounded-full"></div>
                            <div>
                                <p class="font-semibold text-gray-900 dark:text-white">Jane Smith</p>
                                <div class="flex text-yellow-400">
                                    <span>★★★★☆</span>
                                </div>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">1 week ago</p>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300">
                        Great headphones overall. The only minor issue is that they can get a bit warm during extended use, but the sound quality more than makes up for it.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Dark mode functionality (same as previous examples)
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

initDarkMode();
document.getElementById('theme-toggle').addEventListener('click', toggleDarkMode);
</script>
```