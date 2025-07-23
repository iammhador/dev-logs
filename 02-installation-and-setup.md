# Installation and Setup

## Overview

Tailwind CSS can be installed in multiple ways depending on your project setup. This chapter covers the most common installation methods and initial configuration.

## Installation Methods

### 1. CDN (Quick Start)

**Best for:** Learning, prototyping, or simple HTML projects

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CDN Example</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="bg-blue-500 text-white p-8 text-center">
        <h1 class="text-4xl font-bold">Hello Tailwind!</h1>
        <p class="mt-4">This is using the CDN version.</p>
    </div>
</body>
</html>
```

**Pros:**
- Zero setup required
- Perfect for learning
- Works immediately

**Cons:**
- Larger file size (includes all utilities)
- No customization
- No purging of unused styles
- Requires internet connection

### 2. Vite + Tailwind (Recommended for Modern Projects)

**Best for:** Modern frontend projects, SPAs, component libraries

#### Step 1: Create Vite Project
```bash
npm create vite@latest my-tailwind-project
cd my-tailwind-project
npm install
```

#### Step 2: Install Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Step 3: Configure `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 4: Add Tailwind to CSS
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 5: Import CSS in main file
```javascript
// src/main.js
import './index.css'
// ... rest of your code
```

### 3. Next.js + Tailwind

**Best for:** React applications, SSR/SSG projects

#### Step 1: Create Next.js Project with Tailwind
```bash
npx create-next-app@latest my-project --typescript --tailwind --eslint
```

#### Or add to existing Next.js project:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Step 2: Configure `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 3: Add Tailwind to globals.css
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. React (Create React App)

**Note:** CRA is no longer recommended, but still widely used

#### Step 1: Install Tailwind
```bash
npm install -D tailwindcss
npx tailwindcss init
```

#### Step 2: Configure `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

#### Step 3: Add Tailwind to CSS
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Project Structure After Setup

```
my-tailwind-project/
├── node_modules/
├── src/
│   ├── components/
│   ├── styles/
│   │   └── globals.css
│   └── main.js
├── public/
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Understanding the Configuration Files

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Specify files to scan for classes
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Customize the default theme
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1e40af',
        'brand-green': '#10b981',
      },
      fontFamily: {
        'custom': ['Inter', 'sans-serif'],
      },
    },
  },
  
  // Add plugins
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Verifying Installation

Create a test component to verify everything works:

```html
<!-- Test HTML -->
<div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
  <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md">
    <div class="text-center">
      <div class="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
      <p class="text-gray-600">Tailwind CSS is working correctly.</p>
      <button class="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
        Get Started
      </button>
    </div>
  </div>
</div>
```

## Common Setup Issues & Solutions

### Issue 1: Styles Not Loading
**Problem:** Tailwind classes aren't being applied

**Solutions:**
1. Check that CSS file is imported correctly
2. Verify `content` paths in `tailwind.config.js`
3. Ensure build process is running
4. Clear browser cache

### Issue 2: Purging Too Aggressive
**Problem:** Some classes are being removed in production

**Solution:** Add to safelist in config:
```javascript
module.exports = {
  content: ['./src/**/*.{html,js}'],
  safelist: [
    'bg-red-500',
    'text-3xl',
    'lg:text-4xl',
  ]
}
```

### Issue 3: PostCSS Errors
**Problem:** Build fails with PostCSS errors

**Solution:** Ensure `postcss.config.js` is properly configured:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Development Workflow

### 1. Development Mode
```bash
# Vite
npm run dev

# Next.js
npm run dev

# Watch mode for vanilla projects
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

### 2. Production Build
```bash
# Vite
npm run build

# Next.js
npm run build

# Manual build
npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
```

## Mini Challenges

### Challenge 1: Setup Verification
Create a simple landing page with:
- Gradient background
- Centered card
- Responsive text sizes
- Hover effects on buttons

### Challenge 2: Custom Configuration
Extend your Tailwind config to include:
- Custom color palette
- Custom font family
- Custom spacing values

### Challenge 3: Plugin Integration
Install and configure:
- `@tailwindcss/forms`
- `@tailwindcss/typography`

## Interview Tips

**Q: "How do you optimize Tailwind CSS for production?"**

**A:** "Several optimization strategies:
1. **Purging unused CSS** - Tailwind automatically removes unused utilities in production
2. **Proper content configuration** - Ensure all template files are included in the content array
3. **Minification** - Use `--minify` flag or build tools for compression
4. **Tree shaking** - Only import utilities you need
5. **CDN caching** - Serve CSS from CDN with proper cache headers"

**Q: "What's the difference between installing Tailwind via CDN vs npm?"**

**A:** "CDN is great for prototyping but includes all utilities (~3MB). npm installation allows:
- Customization through config file
- Purging unused styles (typically results in <10KB)
- Integration with build tools
- Offline development
- Version control
- Plugin ecosystem access"

---

## Challenge Answers

### Answer 1: Setup Verification
```html
<div class="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-4">
      Welcome to Tailwind
    </h1>
    <p class="text-gray-600 text-center mb-8 text-sm md:text-base">
      Your setup is working perfectly!
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
        Get Started
      </button>
      <button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
        Learn More
      </button>
    </div>
  </div>
</div>
```

### Answer 2: Custom Configuration
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        'accent': '#f59e0b',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Open Sans', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
```

### Answer 3: Plugin Integration
```bash
npm install -D @tailwindcss/forms @tailwindcss/typography
```

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```