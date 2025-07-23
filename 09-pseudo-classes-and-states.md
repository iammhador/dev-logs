# Pseudo-Classes and State-Based Styling

## Introduction to Pseudo-Classes in Tailwind

Pseudo-classes allow you to style elements based on their state or position. Tailwind CSS provides utilities for the most commonly used pseudo-classes, making it easy to create interactive and dynamic user interfaces without writing custom CSS.

## Hover States

The `hover:` prefix applies styles when an element is hovered over:

```html
<!-- Basic hover effects -->
<button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
  Hover me
</button>

<!-- Multiple hover effects -->
<div class="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all duration-300">
  <h3 class="text-xl font-bold hover:text-blue-600 transition-colors">Card Title</h3>
  <p class="text-gray-600">This card has hover effects</p>
</div>

<!-- Hover with color changes -->
<a href="#" class="text-blue-500 hover:text-blue-700 hover:underline">
  Hover link
</a>

<!-- Background hover effects -->
<div class="grid grid-cols-3 gap-4">
  <div class="bg-red-100 hover:bg-red-200 p-4 rounded transition-colors cursor-pointer">
    Hover for red
  </div>
  <div class="bg-green-100 hover:bg-green-200 p-4 rounded transition-colors cursor-pointer">
    Hover for green
  </div>
  <div class="bg-blue-100 hover:bg-blue-200 p-4 rounded transition-colors cursor-pointer">
    Hover for blue
  </div>
</div>
```

## Focus States

The `focus:` prefix applies styles when an element receives focus:

```html
<!-- Input focus styles -->
<div class="space-y-4">
  <input 
    type="text" 
    placeholder="Focus me" 
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  >
  
  <input 
    type="email" 
    placeholder="Email address" 
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
  >
  
  <textarea 
    placeholder="Your message" 
    rows="4"
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
  ></textarea>
</div>

<!-- Button focus styles -->
<div class="space-x-4">
  <button class="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
    Focus me
  </button>
  
  <button class="bg-green-500 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
    Or me
  </button>
</div>

<!-- Focus within (when any child element is focused) -->
<div class="border border-gray-300 rounded-lg p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all">
  <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
  <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none">
</div>
```

## Active States

The `active:` prefix applies styles when an element is being pressed:

```html
<!-- Button active states -->
<div class="space-x-4">
  <button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
    Press me
  </button>
  
  <button class="bg-green-500 hover:bg-green-600 active:bg-green-700 active:scale-95 text-white px-4 py-2 rounded transition-all">
    Press with scale
  </button>
  
  <button class="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 active:shadow-inner text-white px-4 py-2 rounded transition-all">
    Press with shadow
  </button>
</div>

<!-- Card active states -->
<div class="bg-white p-6 rounded-lg shadow hover:shadow-lg active:shadow-md active:scale-98 transition-all cursor-pointer">
  <h3 class="text-xl font-bold">Clickable Card</h3>
  <p class="text-gray-600">Click me to see active state</p>
</div>
```

## Disabled States

The `disabled:` prefix applies styles when an element is disabled:

```html
<!-- Disabled buttons -->
<div class="space-x-4">
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
    Enabled Button
  </button>
  
  <button 
    disabled 
    class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Disabled Button
  </button>
</div>

<!-- Disabled inputs -->
<div class="space-y-4">
  <input 
    type="text" 
    placeholder="Enabled input" 
    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  >
  
  <input 
    type="text" 
    placeholder="Disabled input" 
    disabled
    class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
  >
</div>

<!-- Disabled form example -->
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
    <input 
      type="email" 
      disabled
      value="user@example.com"
      class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500"
    >
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
    <textarea 
      disabled
      class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-500 disabled:resize-none"
      rows="3"
    >This form is disabled</textarea>
  </div>
  
  <button 
    type="submit" 
    disabled
    class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
  >
    Submit
  </button>
</form>
```

## Group Hover and Focus

The `group` class combined with `group-hover:` and `group-focus:` allows child elements to respond to parent states:

```html
<!-- Group hover example -->
<div class="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer">
  <div class="flex items-center">
    <div class="w-12 h-12 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors"></div>
    <div class="ml-4">
      <h3 class="text-xl font-bold group-hover:text-blue-600 transition-colors">Card Title</h3>
      <p class="text-gray-600 group-hover:text-gray-700 transition-colors">Hover the card to see effects</p>
    </div>
  </div>
  <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <button class="bg-blue-500 text-white px-4 py-2 rounded text-sm">
      Action Button
    </button>
  </div>
</div>

<!-- Navigation with group hover -->
<nav class="bg-gray-800 p-4">
  <ul class="space-y-2">
    <li>
      <a href="#" class="group flex items-center p-3 rounded-lg text-white hover:bg-gray-700 transition-colors">
        <div class="w-5 h-5 bg-gray-400 rounded group-hover:bg-white transition-colors"></div>
        <span class="ml-3 group-hover:text-blue-300 transition-colors">Dashboard</span>
        <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    </li>
    <li>
      <a href="#" class="group flex items-center p-3 rounded-lg text-white hover:bg-gray-700 transition-colors">
        <div class="w-5 h-5 bg-gray-400 rounded group-hover:bg-white transition-colors"></div>
        <span class="ml-3 group-hover:text-blue-300 transition-colors">Analytics</span>
        <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    </li>
  </ul>
</nav>

<!-- Card grid with group effects -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
    <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 group-hover:scale-105 transition-transform"></div>
    <div class="p-6">
      <h3 class="text-xl font-bold group-hover:text-blue-600 transition-colors">Product 1</h3>
      <p class="text-gray-600 mt-2">Product description goes here</p>
      <div class="mt-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
  
  <!-- Repeat for more cards -->
  <div class="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
    <div class="h-48 bg-gradient-to-br from-green-400 to-teal-500 group-hover:scale-105 transition-transform"></div>
    <div class="p-6">
      <h3 class="text-xl font-bold group-hover:text-green-600 transition-colors">Product 2</h3>
      <p class="text-gray-600 mt-2">Another product description</p>
      <div class="mt-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
        <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</div>
```

## First, Last, and Nth Child

Tailwind provides utilities for positional pseudo-classes:

```html
<!-- First and last child styling -->
<ul class="space-y-2">
  <li class="p-3 bg-gray-100 first:bg-blue-100 first:border-l-4 first:border-blue-500 last:bg-green-100 last:border-l-4 last:border-green-500">
    First item (blue)
  </li>
  <li class="p-3 bg-gray-100 first:bg-blue-100 first:border-l-4 first:border-blue-500 last:bg-green-100 last:border-l-4 last:border-green-500">
    Middle item
  </li>
  <li class="p-3 bg-gray-100 first:bg-blue-100 first:border-l-4 first:border-blue-500 last:bg-green-100 last:border-l-4 last:border-green-500">
    Another middle item
  </li>
  <li class="p-3 bg-gray-100 first:bg-blue-100 first:border-l-4 first:border-blue-500 last:bg-green-100 last:border-l-4 last:border-green-500">
    Last item (green)
  </li>
</ul>

<!-- Odd and even child styling -->
<div class="space-y-1">
  <div class="p-3 odd:bg-gray-100 even:bg-white">Row 1 (odd)</div>
  <div class="p-3 odd:bg-gray-100 even:bg-white">Row 2 (even)</div>
  <div class="p-3 odd:bg-gray-100 even:bg-white">Row 3 (odd)</div>
  <div class="p-3 odd:bg-gray-100 even:bg-white">Row 4 (even)</div>
  <div class="p-3 odd:bg-gray-100 even:bg-white">Row 5 (odd)</div>
</div>

<!-- Table with alternating rows -->
<table class="w-full">
  <thead>
    <tr class="bg-gray-50">
      <th class="px-4 py-2 text-left">Name</th>
      <th class="px-4 py-2 text-left">Email</th>
      <th class="px-4 py-2 text-left">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
      <td class="px-4 py-2">John Doe</td>
      <td class="px-4 py-2">john@example.com</td>
      <td class="px-4 py-2">Admin</td>
    </tr>
    <tr class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
      <td class="px-4 py-2">Jane Smith</td>
      <td class="px-4 py-2">jane@example.com</td>
      <td class="px-4 py-2">User</td>
    </tr>
    <tr class="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors">
      <td class="px-4 py-2">Bob Johnson</td>
      <td class="px-4 py-2">bob@example.com</td>
      <td class="px-4 py-2">Editor</td>
    </tr>
  </tbody>
</table>
```

## Form States

Tailwind provides utilities for various form states:

```html
<!-- Required field styling -->
<form class="space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Name <span class="text-red-500">*</span>
    </label>
    <input 
      type="text" 
      required
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 required:border-red-300 invalid:border-red-500 invalid:ring-red-500"
    >
  </div>
  
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Email <span class="text-red-500">*</span>
    </label>
    <input 
      type="email" 
      required
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 required:border-red-300 invalid:border-red-500 invalid:ring-red-500"
    >
  </div>
  
  <!-- Valid state styling -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
    <input 
      type="tel" 
      pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
      placeholder="123-456-7890"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 valid:border-green-500 valid:ring-green-500"
    >
  </div>
</form>

<!-- Checkbox and radio states -->
<div class="space-y-4">
  <div class="flex items-center">
    <input 
      type="checkbox" 
      id="checkbox1" 
      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600"
    >
    <label for="checkbox1" class="ml-2 text-sm text-gray-700">I agree to the terms</label>
  </div>
  
  <div class="space-y-2">
    <div class="flex items-center">
      <input 
        type="radio" 
        id="radio1" 
        name="option" 
        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600"
      >
      <label for="radio1" class="ml-2 text-sm text-gray-700">Option 1</label>
    </div>
    <div class="flex items-center">
      <input 
        type="radio" 
        id="radio2" 
        name="option" 
        class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 checked:bg-blue-600 checked:border-blue-600"
      >
      <label for="radio2" class="ml-2 text-sm text-gray-700">Option 2</label>
    </div>
  </div>
</div>
```

## Custom State Combinations

You can combine multiple pseudo-classes for complex interactions:

```html
<!-- Hover + focus combinations -->
<button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded transition-all">
  Hover and Focus
</button>

<!-- Group hover + individual hover -->
<div class="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all">
  <h3 class="text-xl font-bold group-hover:text-blue-600 transition-colors">Card Title</h3>
  <p class="text-gray-600 mt-2">Card description</p>
  <button class="mt-4 bg-blue-500 hover:bg-blue-600 group-hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
    Action
  </button>
</div>

<!-- Disabled + hover (hover won't work when disabled) -->
<div class="space-x-4">
  <button class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors">
    Enabled
  </button>
  <button disabled class="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors">
    Disabled
  </button>
</div>
```

## Visual State Diagram

```
Element State Lifecycle:

┌─────────────┐    hover     ┌─────────────┐
│   Normal    │ ──────────→  │   Hovered   │
│   State     │ ←──────────  │   State     │
└─────────────┘              └─────────────┘
       │                            │
       │ focus                      │ focus
       ↓                            ↓
┌─────────────┐    hover     ┌─────────────┐
│   Focused   │ ──────────→  │ Focused +   │
│   State     │ ←──────────  │  Hovered    │
└─────────────┘              └─────────────┘
       │                            │
       │ active                     │ active
       ↓                            ↓
┌─────────────┐              ┌─────────────┐
│   Active    │              │ Active +    │
│   State     │              │  Hovered    │
└─────────────┘              └─────────────┘

Group Interaction:

┌─────────────────────────────────────┐
│ Group Container                     │
│ ┌─────────────┐ ┌─────────────┐    │
│ │   Child 1   │ │   Child 2   │    │
│ │             │ │             │    │
│ └─────────────┘ └─────────────┘    │
└─────────────────────────────────────┘

When group is hovered:
┌─────────────────────────────────────┐ ← hover
│ Group Container (hovered)           │
│ ┌─────────────┐ ┌─────────────┐    │
│ │   Child 1   │ │   Child 2   │    │ ← both children
│ │ (affected)  │ │ (affected)  │    │   get group-hover
│ └─────────────┘ └─────────────┘    │   styles
└─────────────────────────────────────┘
```

## Common Pitfalls & Anti-Patterns

### ❌ Overusing Hover Effects

```html
<!-- Bad: Too many hover effects -->
<div class="hover:bg-red-500 hover:text-white hover:shadow-lg hover:scale-110 hover:rotate-12 hover:border-4 hover:border-blue-500 transition-all">
  Overwhelming hover effects
</div>
```

### ✅ Subtle, Purposeful Hover Effects

```html
<!-- Good: Subtle, meaningful hover effects -->
<div class="bg-white p-4 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
  Clean hover effect
</div>
```

### ❌ Forgetting Focus States

```html
<!-- Bad: No focus styles for accessibility -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  No focus styles
</button>
```

### ✅ Including Focus States

```html
<!-- Good: Proper focus styles for accessibility -->
<button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded transition-all">
  Accessible button
</button>
```

### ❌ Inconsistent State Styling

```html
<!-- Bad: Inconsistent state styling across similar elements -->
<div class="space-x-4">
  <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
    Button 1
  </button>
  <button class="bg-blue-500 hover:bg-red-600 text-white px-4 py-2 rounded">
    Button 2 (different hover color)
  </button>
</div>
```

### ✅ Consistent State Styling

```html
<!-- Good: Consistent state styling -->
<div class="space-x-4">
  <button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded transition-all">
    Button 1
  </button>
  <button class="bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded transition-all">
    Button 2
  </button>
</div>
```

## When and Why to Use Pseudo-Classes

### ✅ Essential Use Cases:

1. **Interactive feedback** - Show users that elements are interactive
2. **Accessibility** - Provide clear focus indicators for keyboard navigation
3. **Form validation** - Visual feedback for form states
4. **Navigation** - Highlight current page or hovered menu items
5. **Cards and buttons** - Enhance user experience with hover effects
6. **Tables** - Improve readability with alternating row colors

### ✅ Best Practices:

1. **Always include focus styles** for accessibility
2. **Use transitions** to make state changes smooth
3. **Be consistent** across similar elements
4. **Test with keyboard navigation** to ensure accessibility
5. **Consider mobile** - hover states don't work on touch devices
6. **Use semantic HTML** - pseudo-classes work best with proper HTML elements

## Performance Considerations

### Efficient State Styling

```html
<!-- Good: Use CSS transitions for smooth state changes -->
<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200 text-white px-4 py-2 rounded">
  Smooth transition
</button>

<!-- Good: Group related state changes -->
<div class="group bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-300">
  <h3 class="group-hover:text-blue-600 transition-colors">Title</h3>
  <p class="group-hover:text-gray-700 transition-colors">Description</p>
</div>
```

### Avoid Performance Issues

```html
<!-- Avoid: Too many simultaneous animations -->
<div class="hover:scale-110 hover:rotate-12 hover:skew-x-12 hover:translate-x-4 hover:translate-y-4 transition-all duration-1000">
  Too many transforms
</div>

<!-- Better: Simple, focused animations -->
<div class="hover:scale-105 transition-transform duration-200">
  Simple scale effect
</div>
```

## Mini Challenges

### Challenge 1: Interactive Navigation
Create a navigation bar that:
- Has hover effects on menu items
- Shows focus states for keyboard navigation
- Has a different style for the active/current page
- Uses group hover for dropdown menus
- Is fully accessible

### Challenge 2: Form with State Styling
Build a contact form featuring:
- Focus states on all form inputs
- Validation styling (valid/invalid states)
- Disabled state styling
- Hover effects on the submit button
- Required field indicators

### Challenge 3: Product Card Grid
Create a product grid where:
- Cards have hover effects that reveal additional information
- Images scale slightly on hover
- Buttons appear on hover using group states
- Each card has consistent state styling
- The grid is responsive and accessible

## Interview Tips

**Q: "How do you handle interactive states in Tailwind CSS?"**

**A:** "I use Tailwind's pseudo-class prefixes like `hover:`, `focus:`, and `active:` to create interactive states:
1. **Hover states** - for visual feedback on interactive elements
2. **Focus states** - essential for accessibility and keyboard navigation
3. **Active states** - for button press feedback
4. **Group states** - for coordinated hover effects across multiple elements
5. **Form states** - like `invalid:`, `required:`, and `disabled:` for form validation

I always include transitions for smooth state changes and ensure focus states are clearly visible for accessibility."

**Q: "What's the difference between hover and group-hover?"**

**A:** "The key differences are:
1. **`hover:`** - applies to the element itself when hovered
2. **`group-hover:`** - applies to child elements when their parent (with class `group`) is hovered

`group-hover:` is perfect for card components where hovering the card should affect multiple child elements like titles, images, and buttons. It creates coordinated hover effects without JavaScript."

**Q: "How do you ensure accessibility with pseudo-classes?"**

**A:** "For accessibility, I:
1. **Always include focus states** - use `focus:` with clear visual indicators
2. **Use focus-visible** - for better keyboard vs mouse focus distinction
3. **Test keyboard navigation** - ensure all interactive elements are reachable
4. **Provide sufficient contrast** - especially for focus rings and hover states
5. **Use semantic HTML** - pseudo-classes work best with proper HTML elements
6. **Consider screen readers** - ensure state changes are announced properly
7. **Test with real users** - including users who rely on keyboard navigation"

---

## Challenge Answers

### Answer 1: Interactive Navigation
```html
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <div class="w-8 h-8 bg-blue-500 rounded"></div>
        <span class="ml-2 text-xl font-bold text-gray-900">Brand</span>
      </div>
      
      <!-- Navigation Links -->
      <div class="hidden md:flex space-x-8">
        <a href="#" class="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium transition-colors">
          Home
        </a>
        <a href="#" class="text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 focus:text-blue-600 focus:border-b-2 focus:border-blue-600 focus:outline-none px-3 py-2 text-sm font-medium transition-all">
          About
        </a>
        
        <!-- Dropdown Menu -->
        <div class="group relative">
          <button class="text-gray-700 hover:text-blue-600 focus:text-blue-600 focus:outline-none px-3 py-2 text-sm font-medium transition-colors flex items-center">
            Services
            <svg class="ml-1 w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Dropdown Content -->
          <div class="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div class="py-1">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none transition-colors">
                Web Development
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none transition-colors">
                Mobile Apps
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none transition-colors">
                Consulting
              </a>
            </div>
          </div>
        </div>
        
        <a href="#" class="text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 focus:text-blue-600 focus:border-b-2 focus:border-blue-600 focus:outline-none px-3 py-2 text-sm font-medium transition-all">
          Contact
        </a>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:text-blue-600 focus:bg-gray-100 focus:outline-none transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>
  </div>
</nav>
```

### Answer 2: Form with State Styling
```html
<form class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
  <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
  
  <div class="space-y-6">
    <!-- Name Field -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
        Name <span class="text-red-500">*</span>
      </label>
      <input 
        type="text" 
        id="name"
        name="name"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 invalid:border-red-500 invalid:ring-red-500 valid:border-green-500 transition-all"
        placeholder="Enter your full name"
      >
    </div>
    
    <!-- Email Field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
        Email <span class="text-red-500">*</span>
      </label>
      <input 
        type="email" 
        id="email"
        name="email"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 invalid:border-red-500 invalid:ring-red-500 valid:border-green-500 transition-all"
        placeholder="Enter your email address"
      >
    </div>
    
    <!-- Phone Field -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
        Phone
      </label>
      <input 
        type="tel" 
        id="phone"
        name="phone"
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 valid:border-green-500 transition-all"
        placeholder="123-456-7890"
      >
    </div>
    
    <!-- Subject Field -->
    <div>
      <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
        Subject <span class="text-red-500">*</span>
      </label>
      <select 
        id="subject"
        name="subject"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 invalid:border-red-500 invalid:ring-red-500 transition-all"
      >
        <option value="">Select a subject</option>
        <option value="general">General Inquiry</option>
        <option value="support">Support</option>
        <option value="sales">Sales</option>
        <option value="feedback">Feedback</option>
      </select>
    </div>
    
    <!-- Message Field -->
    <div>
      <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
        Message <span class="text-red-500">*</span>
      </label>
      <textarea 
        id="message"
        name="message"
        rows="4"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 invalid:border-red-500 invalid:ring-red-500 resize-none transition-all"
        placeholder="Enter your message here..."
      ></textarea>
    </div>
    
    <!-- Checkbox -->
    <div class="flex items-start">
      <input 
        type="checkbox" 
        id="newsletter"
        name="newsletter"
        class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 checked:bg-blue-600 checked:border-blue-600 transition-all"
      >
      <label for="newsletter" class="ml-2 text-sm text-gray-700">
        Subscribe to our newsletter for updates and news
      </label>
    </div>
    
    <!-- Submit Button -->
    <div class="flex space-x-4">
      <button 
        type="submit"
        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      >
        Send Message
      </button>
      
      <button 
        type="button"
        disabled
        class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
      >
        Save Draft
      </button>
    </div>
  </div>
</form>
```

### Answer 3: Product Card Grid
```html
<div class="max-w-7xl mx-auto p-6">
  <h1 class="text-3xl font-bold text-center mb-8">Our Products</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <!-- Product Card 1 -->
    <div class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div class="relative overflow-hidden">
        <div class="h-48 bg-gradient-to-br from-blue-400 to-purple-500 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button class="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
          Premium Headphones
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          High-quality wireless headphones with noise cancellation
        </p>
        
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-gray-900">$199.99</span>
          <div class="flex items-center">
            <div class="flex text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <span class="text-sm text-gray-500 ml-1">(4.8)</span>
          </div>
        </div>
        
        <div class="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div class="flex space-x-2">
            <button class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 transition-all">
              Add to Cart
            </button>
            <button class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all">
              Quick View
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Product Card 2 -->
    <div class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div class="relative overflow-hidden">
        <div class="h-48 bg-gradient-to-br from-green-400 to-teal-500 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="absolute top-2 left-2">
          <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Sale</span>
        </div>
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button class="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
          Smart Watch
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          Feature-rich smartwatch with health monitoring
        </p>
        
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-gray-900">$149.99</span>
            <span class="text-lg text-gray-500 line-through">$199.99</span>
          </div>
          <div class="flex items-center">
            <div class="flex text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <span class="text-sm text-gray-500 ml-1">(4.2)</span>
          </div>
        </div>
        
        <div class="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div class="flex space-x-2">
            <button class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-green-800 transition-all">
              Add to Cart
            </button>
            <button class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all">
              Quick View
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add more product cards following the same pattern -->
    <!-- Product Card 3 -->
    <div class="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div class="relative overflow-hidden">
        <div class="h-48 bg-gradient-to-br from-red-400 to-pink-500 group-hover:scale-110 transition-transform duration-300"></div>
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button class="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <h3 class="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-2">
          Wireless Speaker
        </h3>
        <p class="text-gray-600 text-sm mb-4">
          Portable Bluetooth speaker with premium sound
        </p>
        
        <div class="flex items-center justify-between mb-4">
          <span class="text-2xl font-bold text-gray-900">$79.99</span>
          <div class="flex items-center">
            <div class="flex text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
              <svg class="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            </div>
            <span class="text-sm text-gray-500 ml-1">(4.5)</span>
          </div>
        </div>
        
        <div class="transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div class="flex space-x-2">
            <button class="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-800 transition-all">
              Add to Cart
            </button>
            <button class="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all">
              Quick View
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```