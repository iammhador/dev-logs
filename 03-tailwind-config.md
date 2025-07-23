# Tailwind Configuration

## Understanding tailwind.config.js

The `tailwind.config.js` file is the heart of your Tailwind setup. It controls everything from which files to scan for classes to custom colors, spacing, and plugins.

## Basic Configuration Structure

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],      // Files to scan for classes
  theme: {},        // Design system customization
  plugins: [],      // Third-party plugins
  corePlugins: {},  // Enable/disable core utilities
  prefix: '',       // Add prefix to all utilities
  important: false, // Make utilities !important
  separator: ':',   // Separator for modifiers
}
```

## Content Configuration

The `content` array tells Tailwind which files to scan for class names. This is crucial for purging unused styles.

```javascript
module.exports = {
  content: [
    // HTML files
    './src/**/*.html',
    
    // JavaScript/TypeScript files
    './src/**/*.{js,jsx,ts,tsx}',
    
    // Vue files
    './src/**/*.vue',
    
    // Svelte files
    './src/**/*.svelte',
    
    // PHP files (for Laravel, etc.)
    './resources/**/*.blade.php',
    
    // Include node_modules if using component libraries
    './node_modules/@my-company/ui/**/*.{js,jsx,ts,tsx}',
  ],
}
```

### Content Configuration Best Practices

```javascript
// ✅ Good: Specific paths
content: [
  './src/components/**/*.{js,jsx,ts,tsx}',
  './src/pages/**/*.{js,jsx,ts,tsx}',
  './src/app/**/*.{js,jsx,ts,tsx}',
]

// ❌ Avoid: Too broad (slow builds)
content: ['./src/**/*']

// ❌ Avoid: Missing file extensions
content: ['./src/**/*']
```

## Theme Configuration

The `theme` section is where you customize Tailwind's design system.

### Extending vs Overriding

```javascript
module.exports = {
  theme: {
    // Override completely (replaces default)
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
    },
    
    // Extend (adds to default)
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

### Custom Colors

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Simple color
        'brand-blue': '#1e40af',
        
        // Color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Default shade
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Using CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
}
```

### Custom Spacing

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        // Custom spacing values
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
        
        // Fractional spacing
        '1/7': '14.2857143%',
        '2/7': '28.5714286%',
        
        // Viewport-based spacing
        'screen-1/2': '50vh',
        'screen-1/3': '33.333333vh',
      },
    },
  },
}
```

### Custom Typography

```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Custom font families
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Open Sans', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'monospace'],
      },
      
      fontSize: {
        // Custom font sizes
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        
        // Custom sizes with line height and letter spacing
        'display': ['4rem', {
          lineHeight: '1',
          letterSpacing: '-0.02em',
          fontWeight: '700',
        }],
      },
      
      fontWeight: {
        'extra-light': 200,
        'medium': 500,
        'extra-bold': 800,
      },
    },
  },
}
```

### Custom Breakpoints

```javascript
module.exports = {
  theme: {
    screens: {
      // Override default breakpoints
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      
      // Add custom breakpoints
      'xs': '475px',
      '3xl': '1600px',
      
      // Custom breakpoint ranges
      'tablet': {'min': '640px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
      
      // Height-based breakpoints
      'tall': {'raw': '(min-height: 800px)'},
    },
  },
}
```

## Advanced Configuration

### CSS Variables Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
      },
    },
  },
}
```

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
}
```

### Custom Utilities

```javascript
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.2)',
        },
        '.backface-visible': {
          'backface-visibility': 'visible',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      }
      
      addUtilities(newUtilities)
    })
  ],
}
```

### Component Classes

```javascript
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addComponents, theme }) {
      addComponents({
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.semibold'),
          transition: 'all 0.2s',
        },
        '.btn-primary': {
          backgroundColor: theme('colors.blue.500'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.blue.600'),
          },
        },
      })
    })
  ],
}
```

## Environment-Specific Configuration

```javascript
// tailwind.config.js
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  
  // Conditional configuration
  ...(isProduction && {
    safelist: [
      // Classes that might be generated dynamically
      'bg-red-500',
      'bg-green-500',
      'bg-blue-500',
    ],
  }),
  
  theme: {
    extend: {
      // Development-only utilities
      ...(!isProduction && {
        colors: {
          'debug-red': '#ff0000',
          'debug-blue': '#0000ff',
        },
      }),
    },
  },
}
```

## Common Configuration Patterns

### Design System Configuration

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Brand colors
        brand: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
        },
        
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Neutral palette
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      
      spacing: {
        // 8px grid system
        '1': '0.125rem',  // 2px
        '2': '0.25rem',   // 4px
        '3': '0.375rem',  // 6px
        '4': '0.5rem',    // 8px
        '6': '0.75rem',   // 12px
        '8': '1rem',      // 16px
        '12': '1.5rem',   // 24px
        '16': '2rem',     // 32px
        '24': '3rem',     // 48px
        '32': '4rem',     // 64px
      },
      
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
    },
  },
}
```

## Mini Challenges

### Challenge 1: Custom Color Palette
Create a custom color palette for a fintech app with:
- Primary: Blue shades
- Success: Green shades
- Warning: Orange shades
- Error: Red shades

### Challenge 2: Typography System
Set up a typography system with:
- Display font: Inter
- Body font: Open Sans
- Mono font: Fira Code
- Custom font sizes for headings

### Challenge 3: Custom Utilities
Create custom utilities for:
- Text shadows
- Glassmorphism effects
- Custom animations

## Interview Tips

**Q: "How do you organize and maintain large Tailwind configurations?"**

**A:** "For large projects, I:
1. **Split configuration** into multiple files using require()
2. **Use design tokens** - define colors, spacing in separate files
3. **Document custom utilities** with clear naming conventions
4. **Version control** configuration changes carefully
5. **Use TypeScript** for better IntelliSense and validation
6. **Create presets** for reusable configurations across projects"

**Q: "How do you handle design system consistency with Tailwind?"**

**A:** "I establish consistency through:
1. **Centralized theme configuration** with design tokens
2. **Custom component classes** for complex patterns
3. **Strict spacing scale** (usually 4px or 8px based)
4. **Semantic color naming** (primary, secondary, success, etc.)
5. **Consistent breakpoint strategy**
6. **Documentation** of design decisions and usage patterns"

---

## Challenge Answers

### Answer 1: Fintech Color Palette
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
}
```

### Answer 2: Typography System
```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Open Sans', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'display-xs': ['1.5rem', { lineHeight: '1.4' }],
      },
    },
  },
}
```

### Answer 3: Custom Utilities
```javascript
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-shadow-sm': {
          'text-shadow': '1px 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 0.2)',
        },
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.animate-float': {
          'animation': 'float 3s ease-in-out infinite',
        },
      })
      
      addUtilities({
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      })
    })
  ],
}
```