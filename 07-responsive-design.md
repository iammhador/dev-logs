# Responsive Design

## Introduction to Responsive Design in Tailwind

Tailwind CSS follows a **mobile-first** approach to responsive design. This means you start by designing for mobile devices and then add styles for larger screens using responsive prefixes. This approach ensures your design works well on all devices and progressively enhances the experience on larger screens.

## Default Breakpoints

Tailwind includes five default breakpoints:

```javascript
// Default breakpoints
{
  'sm': '640px',   // Small devices (landscape phones)
  'md': '768px',   // Medium devices (tablets)
  'lg': '1024px',  // Large devices (laptops)
  'xl': '1280px',  // Extra large devices (large laptops)
  '2xl': '1536px', // 2X large devices (larger desktops)
}
```

## Mobile-First Approach

In Tailwind, unprefixed utilities apply to all screen sizes, while prefixed utilities apply from that breakpoint and up:

```html
<!-- This div is:
     - Full width on mobile (default)
     - Half width on small screens and up (sm:w-1/2)
     - One-third width on large screens and up (lg:w-1/3)
-->
<div class="w-full sm:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

## Responsive Utilities

### Width and Height

```html
<!-- Responsive widths -->
<div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive width container
</div>

<!-- Responsive heights -->
<div class="h-32 md:h-48 lg:h-64">
  Responsive height container
</div>

<!-- Responsive max-width -->
<div class="max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
  Responsive max-width container
</div>
```

### Typography

```html
<!-- Responsive font sizes -->
<h1 class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
  Responsive heading
</h1>

<!-- Responsive text alignment -->
<p class="text-center md:text-left lg:text-right">
  Text alignment changes with screen size
</p>

<!-- Responsive line height -->
<p class="leading-normal md:leading-relaxed lg:leading-loose">
  Line height adjusts for better readability on larger screens
</p>
```

### Spacing

```html
<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8 xl:p-12">
  Padding increases on larger screens
</div>

<!-- Responsive margin -->
<div class="mb-4 md:mb-6 lg:mb-8">
  Bottom margin increases with screen size
</div>

<!-- Responsive gap in flex/grid -->
<div class="flex gap-2 md:gap-4 lg:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Layout

```html
<!-- Responsive flex direction -->
<div class="flex flex-col md:flex-row">
  <div class="bg-blue-500 text-white p-4">Sidebar</div>
  <div class="bg-green-500 text-white p-4 flex-1">Main content</div>
</div>

<!-- Responsive grid columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <div class="bg-gray-200 p-4">Item 1</div>
  <div class="bg-gray-200 p-4">Item 2</div>
  <div class="bg-gray-200 p-4">Item 3</div>
  <div class="bg-gray-200 p-4">Item 4</div>
</div>
```

### Display

```html
<!-- Show/hide elements at different breakpoints -->
<div class="block md:hidden">
  Only visible on mobile
</div>

<div class="hidden md:block">
  Hidden on mobile, visible on tablet and up
</div>

<div class="hidden lg:block">
  Only visible on large screens and up
</div>

<!-- Responsive display types -->
<div class="block md:flex lg:grid">
  Changes display type based on screen size
</div>
```

## Common Responsive Patterns

### Navigation Bar

```html
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <img class="h-8 w-8" src="logo.png" alt="Logo">
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="#" class="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Home</a>
          <a href="#" class="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">About</a>
          <a href="#" class="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Services</a>
          <a href="#" class="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Contact</a>
        </div>
      </div>
      
      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button class="text-gray-900 hover:text-gray-700 focus:outline-none focus:text-gray-700">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Mobile Navigation Menu -->
  <div class="md:hidden">
    <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
      <a href="#" class="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">Home</a>
      <a href="#" class="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">About</a>
      <a href="#" class="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">Services</a>
      <a href="#" class="text-gray-900 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium">Contact</a>
    </div>
  </div>
</nav>
```

### Hero Section

```html
<section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col lg:flex-row items-center py-12 lg:py-24">
      <!-- Content -->
      <div class="flex-1 text-center lg:text-left mb-8 lg:mb-0 lg:pr-8">
        <h1 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
          Build Amazing Websites
        </h1>
        <p class="text-lg md:text-xl lg:text-2xl mb-6 lg:mb-8 opacity-90">
          Create responsive, beautiful websites with our powerful tools and components.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
          <button class="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
      
      <!-- Image -->
      <div class="flex-1 max-w-md lg:max-w-lg">
        <img src="hero-image.png" alt="Hero" class="w-full h-auto">
      </div>
    </div>
  </div>
</section>
```

### Card Grid

```html
<section class="py-12 lg:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
      Our Services
    </h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <!-- Card 1 -->
      <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div class="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
        <h3 class="text-xl font-semibold mb-2">Web Development</h3>
        <p class="text-gray-600 mb-4">Build modern, responsive websites with the latest technologies.</p>
        <a href="#" class="text-blue-500 hover:text-blue-600 font-medium">Learn more →</a>
      </div>
      
      <!-- Card 2 -->
      <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div class="w-12 h-12 bg-green-500 rounded-lg mb-4"></div>
        <h3 class="text-xl font-semibold mb-2">Mobile Apps</h3>
        <p class="text-gray-600 mb-4">Create native and cross-platform mobile applications.</p>
        <a href="#" class="text-blue-500 hover:text-blue-600 font-medium">Learn more →</a>
      </div>
      
      <!-- Card 3 -->
      <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div class="w-12 h-12 bg-purple-500 rounded-lg mb-4"></div>
        <h3 class="text-xl font-semibold mb-2">UI/UX Design</h3>
        <p class="text-gray-600 mb-4">Design beautiful and intuitive user experiences.</p>
        <a href="#" class="text-blue-500 hover:text-blue-600 font-medium">Learn more →</a>
      </div>
    </div>
  </div>
</section>
```

## Custom Breakpoints

You can customize breakpoints in your `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1600px',
    },
  },
}
```

### Max-Width Breakpoints

You can also create max-width breakpoints:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Max-width breakpoints
      'max-sm': {'max': '639px'},
      'max-md': {'max': '767px'},
      'max-lg': {'max': '1023px'},
    },
  },
}
```

```html
<!-- Only applies on screens smaller than 640px -->
<div class="max-sm:text-center">
  Centered on mobile only
</div>
```

### Range Breakpoints

Create breakpoints that apply within a specific range:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      // Range breakpoints
      'tablet': {'min': '640px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
    },
  },
}
```

```html
<!-- Only applies on tablet-sized screens -->
<div class="tablet:grid-cols-2">
  Two columns on tablets only
</div>
```

## Container

Tailwind's `container` class centers content and applies responsive max-widths:

```html
<!-- Basic container -->
<div class="container mx-auto">
  Centered content with responsive max-width
</div>

<!-- Container with padding -->
<div class="container mx-auto px-4 sm:px-6 lg:px-8">
  Centered content with responsive padding
</div>
```

### Customizing Container

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
}
```

## Visual Layout Diagram

```
Responsive Breakpoints:

0px     640px    768px    1024px   1280px   1536px
│        │        │        │        │        │
│   xs   │   sm   │   md   │   lg   │   xl   │  2xl
│        │        │        │        │        │
└────────┴────────┴────────┴────────┴────────┴────────→

Mobile-First Approach:

w-full           → applies to all screen sizes
sm:w-1/2         → applies from 640px and up
md:w-1/3         → applies from 768px and up
lg:w-1/4         → applies from 1024px and up

Result:
0-639px:    w-full     (100% width)
640-767px:  sm:w-1/2   (50% width)
768-1023px: md:w-1/3   (33.33% width)
1024px+:    lg:w-1/4   (25% width)

Grid Example:

Mobile (0-767px):     [────────────]
                      [────────────]
                      [────────────]

Tablet (768-1023px):  [──────][──────]
                      [──────][──────]

Desktop (1024px+):    [────][────][────]
                      [────][────][────]
```

## Common Pitfalls & Anti-Patterns

### ❌ Desktop-First Thinking

```html
<!-- Bad: Designing for desktop first -->
<div class="w-1/4 sm:w-1/2 md:w-full">
  This goes from small to large, fighting the mobile-first approach
</div>
```

### ✅ Mobile-First Approach

```html
<!-- Good: Mobile-first design -->
<div class="w-full md:w-1/2 lg:w-1/4">
  This progressively enhances from mobile to desktop
</div>
```

### ❌ Overusing Breakpoints

```html
<!-- Bad: Too many breakpoint variations -->
<div class="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
  Overly complex responsive typography
</div>
```

### ✅ Strategic Breakpoint Usage

```html
<!-- Good: Strategic, meaningful breakpoints -->
<div class="text-lg md:text-xl lg:text-2xl">
  Clean, purposeful responsive typography
</div>
```

### ❌ Ignoring Content

```html
<!-- Bad: Fixed layouts that don't consider content -->
<div class="grid grid-cols-4 gap-4">
  <!-- This might not work well on all screen sizes -->
</div>
```

### ✅ Content-Aware Design

```html
<!-- Good: Responsive layout that considers content -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  <!-- This adapts to screen size and content needs -->
</div>
```

## Testing Responsive Design

### Browser DevTools

1. **Chrome DevTools**: F12 → Toggle device toolbar
2. **Firefox DevTools**: F12 → Responsive Design Mode
3. **Safari DevTools**: Develop → Enter Responsive Design Mode

### Testing Strategy

```html
<!-- Add visual indicators for testing -->
<div class="bg-red-500 sm:bg-blue-500 md:bg-green-500 lg:bg-yellow-500 xl:bg-purple-500">
  <span class="block sm:hidden">Mobile</span>
  <span class="hidden sm:block md:hidden">Small</span>
  <span class="hidden md:block lg:hidden">Medium</span>
  <span class="hidden lg:block xl:hidden">Large</span>
  <span class="hidden xl:block">Extra Large</span>
</div>
```

## Performance Considerations

### Responsive Images

```html
<!-- Responsive images with different sources -->
<picture>
  <source media="(min-width: 1024px)" srcset="large-image.jpg">
  <source media="(min-width: 768px)" srcset="medium-image.jpg">
  <img src="small-image.jpg" alt="Responsive image" class="w-full h-auto">
</picture>

<!-- Using Tailwind with responsive images -->
<img 
  src="image.jpg" 
  alt="Responsive image" 
  class="w-full h-32 sm:h-48 md:h-64 lg:h-80 object-cover"
>
```

### Conditional Loading

```html
<!-- Load different content based on screen size -->
<div class="block md:hidden">
  <!-- Lightweight mobile content -->
  <div class="text-center p-4">
    <h2 class="text-xl font-bold">Mobile View</h2>
    <p>Simplified content for mobile</p>
  </div>
</div>

<div class="hidden md:block">
  <!-- Rich desktop content -->
  <div class="grid grid-cols-2 gap-8 p-8">
    <div>
      <h2 class="text-3xl font-bold mb-4">Desktop View</h2>
      <p class="mb-4">Rich content with more details</p>
      <!-- More complex components -->
    </div>
    <div>
      <!-- Additional content -->
    </div>
  </div>
</div>
```

## Mini Challenges

### Challenge 1: Responsive Landing Page
Create a landing page that:
- Has a hero section with different layouts on mobile vs desktop
- Shows a 1-column layout on mobile, 2-column on tablet, 3-column on desktop
- Has responsive typography that scales appropriately
- Includes a navigation that collapses on mobile

### Challenge 2: Dashboard Layout
Build a dashboard that:
- Has a collapsible sidebar on desktop, bottom navigation on mobile
- Shows different numbers of cards per row based on screen size
- Has responsive spacing and typography
- Adapts chart/graph sizes for different screens

### Challenge 3: E-commerce Product Grid
Create a product grid that:
- Shows 1 product per row on mobile
- Shows 2 products per row on tablet
- Shows 3-4 products per row on desktop
- Has responsive product cards with appropriate spacing
- Includes responsive filters (sidebar on desktop, modal on mobile)

## Interview Tips

**Q: "How do you approach responsive design with Tailwind CSS?"**

**A:** "I follow Tailwind's mobile-first approach:
1. **Start with mobile design** - design for the smallest screen first
2. **Use progressive enhancement** - add styles for larger screens using breakpoint prefixes
3. **Focus on content hierarchy** - ensure the most important content is accessible on all devices
4. **Test across devices** - use browser dev tools and real devices
5. **Consider performance** - use responsive images and conditional loading
6. **Keep it simple** - don't over-complicate with too many breakpoint variations"

**Q: "How do you handle complex responsive layouts?"**

**A:** "For complex layouts, I:
1. **Break down into components** - handle responsiveness at the component level
2. **Use CSS Grid and Flexbox strategically** - Grid for page layout, Flexbox for components
3. **Create responsive design systems** - establish consistent patterns for spacing, typography, etc.
4. **Use container queries when needed** - for component-based responsiveness
5. **Document responsive patterns** - create a style guide for the team
6. **Test thoroughly** - ensure layouts work across all target devices and screen sizes"

---

## Challenge Answers

### Answer 1: Responsive Landing Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 rounded"></div>
                    <span class="ml-2 text-xl font-bold">Brand</span>
                </div>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex space-x-8">
                    <a href="#" class="text-gray-700 hover:text-blue-500">Home</a>
                    <a href="#" class="text-gray-700 hover:text-blue-500">About</a>
                    <a href="#" class="text-gray-700 hover:text-blue-500">Services</a>
                    <a href="#" class="text-gray-700 hover:text-blue-500">Contact</a>
                </div>
                
                <!-- Mobile Menu Button -->
                <button class="md:hidden">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col lg:flex-row items-center py-12 lg:py-24">
                <div class="flex-1 text-center lg:text-left mb-8 lg:mb-0">
                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6">
                        Build Amazing Products
                    </h1>
                    <p class="text-lg sm:text-xl lg:text-2xl mb-6 lg:mb-8 opacity-90">
                        Create beautiful, responsive websites with our powerful platform.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                            Get Started
                        </button>
                        <button class="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
                            Learn More
                        </button>
                    </div>
                </div>
                <div class="flex-1 max-w-md lg:max-w-lg">
                    <div class="w-full h-64 lg:h-80 bg-white/20 rounded-lg"></div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Features Section -->
    <section class="py-12 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 lg:mb-12">
                Why Choose Us?
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <div class="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-semibold mb-2">Fast Performance</h3>
                    <p class="text-gray-600">Lightning-fast loading times and optimized performance.</p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <div class="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-semibold mb-2">Responsive Design</h3>
                    <p class="text-gray-600">Beautiful designs that work perfectly on all devices.</p>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-md text-center md:col-span-2 lg:col-span-1">
                    <div class="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-semibold mb-2">24/7 Support</h3>
                    <p class="text-gray-600">Round-the-clock support to help you succeed.</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>
```

### Answer 2: Dashboard Layout
```html
<div class="flex h-screen bg-gray-100">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex lg:flex-col lg:w-64 bg-white shadow-lg">
        <div class="p-4 border-b">
            <h2 class="text-xl font-bold">Dashboard</h2>
        </div>
        <nav class="flex-1 p-4">
            <ul class="space-y-2">
                <li><a href="#" class="block p-2 rounded hover:bg-gray-100">Overview</a></li>
                <li><a href="#" class="block p-2 rounded hover:bg-gray-100">Analytics</a></li>
                <li><a href="#" class="block p-2 rounded hover:bg-gray-100">Users</a></li>
                <li><a href="#" class="block p-2 rounded hover:bg-gray-100">Settings</a></li>
            </ul>
        </nav>
    </aside>
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
        <!-- Header -->
        <header class="bg-white shadow p-4 lg:p-6">
            <h1 class="text-xl lg:text-2xl font-bold">Dashboard Overview</h1>
        </header>
        
        <!-- Content -->
        <main class="flex-1 p-4 lg:p-6 overflow-y-auto">
            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Total Users</h3>
                    <p class="text-2xl lg:text-3xl font-bold">1,234</p>
                </div>
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Revenue</h3>
                    <p class="text-2xl lg:text-3xl font-bold">$12,345</p>
                </div>
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Orders</h3>
                    <p class="text-2xl lg:text-3xl font-bold">567</p>
                </div>
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-sm font-medium text-gray-500">Growth</h3>
                    <p class="text-2xl lg:text-3xl font-bold">+12%</p>
                </div>
            </div>
            
            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Sales Chart</h3>
                    <div class="h-48 lg:h-64 bg-gray-100 rounded"></div>
                </div>
                <div class="bg-white p-4 lg:p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">User Activity</h3>
                    <div class="h-48 lg:h-64 bg-gray-100 rounded"></div>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden bg-white border-t border-gray-200">
        <div class="flex">
            <a href="#" class="flex-1 p-4 text-center text-blue-500">
                <div class="text-xs">Overview</div>
            </a>
            <a href="#" class="flex-1 p-4 text-center text-gray-500">
                <div class="text-xs">Analytics</div>
            </a>
            <a href="#" class="flex-1 p-4 text-center text-gray-500">
                <div class="text-xs">Users</div>
            </a>
            <a href="#" class="flex-1 p-4 text-center text-gray-500">
                <div class="text-xs">Settings</div>
            </a>
        </div>
    </nav>
</div>
```

### Answer 3: E-commerce Product Grid
```html
<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 class="text-2xl lg:text-3xl font-bold">Products</h1>
        </div>
    </header>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <!-- Desktop Sidebar Filters -->
            <aside class="hidden lg:block lg:w-64">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold mb-4">Filters</h3>
                    
                    <div class="mb-6">
                        <h4 class="font-medium mb-2">Category</h4>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2">
                                <span class="text-sm">Electronics</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2">
                                <span class="text-sm">Clothing</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="mr-2">
                                <span class="text-sm">Books</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="font-medium mb-2">Price Range</h4>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="price" class="mr-2">
                                <span class="text-sm">Under $25</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="price" class="mr-2">
                                <span class="text-sm">$25 - $50</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="price" class="mr-2">
                                <span class="text-sm">Over $50</span>
                            </label>
                        </div>
                    </div>
                </div>
            </aside>
            
            <!-- Main Content -->
            <main class="flex-1">
                <!-- Mobile Filter Button -->
                <div class="lg:hidden mb-4">
                    <button class="bg-white px-4 py-2 rounded-lg shadow border">
                        Filters
                    </button>
                </div>
                
                <!-- Product Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    <!-- Product Card -->
                    <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
                        <div class="p-4">
                            <h3 class="font-semibold mb-1">Product Name</h3>
                            <p class="text-gray-600 text-sm mb-2">Short description</p>
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-bold">$29.99</span>
                                <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Repeat for more products -->
                    <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div class="aspect-square bg-gray-200 rounded-t-lg"></div>
                        <div class="p-4">
                            <h3 class="font-semibold mb-1">Another Product</h3>
                            <p class="text-gray-600 text-sm mb-2">Product description</p>
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-bold">$49.99</span>
                                <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Add more product cards as needed -->
                </div>
            </main>
        </div>
    </div>
</div>
```