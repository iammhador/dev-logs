# Advanced Layout Techniques

## Introduction to Advanced Layouts

Beyond basic flexbox and grid, Tailwind CSS provides powerful utilities for creating complex, responsive layouts. This chapter covers advanced layout patterns, positioning techniques, and modern CSS features that enable sophisticated design implementations.

## Advanced Positioning

### Absolute and Relative Positioning

```html
<!-- Relative positioning container -->
<div class="relative bg-gray-100 h-64 p-4">
  <div class="absolute top-0 left-0 bg-blue-500 text-white p-2 rounded">
    Top Left
  </div>
  <div class="absolute top-0 right-0 bg-green-500 text-white p-2 rounded">
    Top Right
  </div>
  <div class="absolute bottom-0 left-0 bg-red-500 text-white p-2 rounded">
    Bottom Left
  </div>
  <div class="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded">
    Bottom Right
  </div>
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black p-2 rounded">
    Centered
  </div>
</div>
```

### Fixed and Sticky Positioning

```html
<!-- Fixed header -->
<header class="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 p-4">
  <nav class="flex justify-between items-center max-w-6xl mx-auto">
    <div class="text-xl font-bold">Logo</div>
    <div class="space-x-4">
      <a href="#" class="hover:text-blue-500">Home</a>
      <a href="#" class="hover:text-blue-500">About</a>
      <a href="#" class="hover:text-blue-500">Contact</a>
    </div>
  </nav>
</header>

<!-- Sticky sidebar -->
<div class="flex pt-20"> <!-- Account for fixed header -->
  <aside class="sticky top-20 h-screen w-64 bg-gray-50 p-4 overflow-y-auto">
    <nav class="space-y-2">
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Section 1</a>
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Section 2</a>
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Section 3</a>
    </nav>
  </aside>
  
  <main class="flex-1 p-8">
    <div class="space-y-8">
      <section class="h-96 bg-blue-100 p-4 rounded">
        <h2 class="text-2xl font-bold mb-4">Content Section 1</h2>
        <p>Lorem ipsum dolor sit amet...</p>
      </section>
      <section class="h-96 bg-green-100 p-4 rounded">
        <h2 class="text-2xl font-bold mb-4">Content Section 2</h2>
        <p>Lorem ipsum dolor sit amet...</p>
      </section>
      <section class="h-96 bg-red-100 p-4 rounded">
        <h2 class="text-2xl font-bold mb-4">Content Section 3</h2>
        <p>Lorem ipsum dolor sit amet...</p>
      </section>
    </div>
  </main>
</div>
```

### Z-Index and Layering

```html
<!-- Layered modal system -->
<div class="relative">
  <!-- Background overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
  
  <!-- Modal -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Modal Title</h3>
        <p class="text-gray-600 mb-6">Modal content goes here...</p>
        
        <!-- Dropdown within modal -->
        <div class="relative">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Open Dropdown
          </button>
          <div class="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-20 hidden">
            <a href="#" class="block px-4 py-2 hover:bg-gray-100">Option 1</a>
            <a href="#" class="block px-4 py-2 hover:bg-gray-100">Option 2</a>
            <a href="#" class="block px-4 py-2 hover:bg-gray-100">Option 3</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Container Queries and Intrinsic Layouts

### Container-Based Responsive Design

```html
<!-- Container query example -->
<div class="@container">
  <div class="bg-white rounded-lg shadow p-4">
    <div class="@sm:flex @sm:items-center @sm:space-x-4">
      <img src="avatar.jpg" alt="Avatar" class="w-16 h-16 rounded-full @sm:w-12 @sm:h-12">
      <div class="mt-4 @sm:mt-0">
        <h3 class="text-lg font-semibold @sm:text-base">John Doe</h3>
        <p class="text-gray-600 @sm:text-sm">Software Developer</p>
      </div>
    </div>
  </div>
</div>
```

### Intrinsic Web Design Patterns

```html
<!-- Auto-fit grid with minimum width -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold mb-2">Card 1</h3>
    <p class="text-gray-600">Content adapts to available space</p>
  </div>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold mb-2">Card 2</h3>
    <p class="text-gray-600">Minimum 250px, grows to fill space</p>
  </div>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold mb-2">Card 3</h3>
    <p class="text-gray-600">Responsive without media queries</p>
  </div>
</div>

<!-- Flexible sidebar layout -->
<div class="grid grid-cols-[minmax(250px,1fr)_3fr] gap-6">
  <aside class="bg-gray-50 p-4 rounded">
    <h3 class="font-semibold mb-4">Sidebar</h3>
    <nav class="space-y-2">
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Link 1</a>
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Link 2</a>
    </nav>
  </aside>
  <main class="bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Main Content</h2>
    <p>This content takes up 3 times the space of the sidebar</p>
  </main>
</div>
```

## Advanced Flexbox Patterns

### Holy Grail Layout

```html
<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-blue-600 text-white p-4">
    <h1 class="text-xl font-bold">Holy Grail Layout</h1>
  </header>
  
  <!-- Main content area -->
  <div class="flex-1 flex">
    <!-- Left sidebar -->
    <aside class="w-64 bg-gray-100 p-4 order-1">
      <h3 class="font-semibold mb-4">Left Sidebar</h3>
      <nav class="space-y-2">
        <a href="#" class="block p-2 rounded hover:bg-gray-200">Navigation</a>
        <a href="#" class="block p-2 rounded hover:bg-gray-200">Links</a>
      </nav>
    </aside>
    
    <!-- Main content -->
    <main class="flex-1 p-6 order-2">
      <h2 class="text-2xl font-bold mb-4">Main Content</h2>
      <div class="space-y-4">
        <p>This is the main content area that expands to fill available space.</p>
        <p>The layout adapts to different screen sizes while maintaining the structure.</p>
      </div>
    </main>
    
    <!-- Right sidebar -->
    <aside class="w-64 bg-gray-50 p-4 order-3">
      <h3 class="font-semibold mb-4">Right Sidebar</h3>
      <div class="space-y-4">
        <div class="bg-white p-3 rounded shadow">
          <h4 class="font-medium">Widget 1</h4>
          <p class="text-sm text-gray-600">Additional content</p>
        </div>
        <div class="bg-white p-3 rounded shadow">
          <h4 class="font-medium">Widget 2</h4>
          <p class="text-sm text-gray-600">More content</p>
        </div>
      </div>
    </aside>
  </div>
  
  <!-- Footer -->
  <footer class="bg-gray-800 text-white p-4 text-center">
    <p>&copy; 2024 Your Company. All rights reserved.</p>
  </footer>
</div>

<!-- Responsive version -->
<div class="min-h-screen flex flex-col">
  <header class="bg-blue-600 text-white p-4">
    <h1 class="text-xl font-bold">Responsive Holy Grail</h1>
  </header>
  
  <div class="flex-1 flex flex-col lg:flex-row">
    <!-- On mobile: stack vertically, on large screens: side by side -->
    <aside class="lg:w-64 bg-gray-100 p-4 lg:order-1">
      <h3 class="font-semibold mb-4">Left Sidebar</h3>
      <nav class="flex lg:flex-col space-x-4 lg:space-x-0 lg:space-y-2">
        <a href="#" class="block p-2 rounded hover:bg-gray-200">Nav 1</a>
        <a href="#" class="block p-2 rounded hover:bg-gray-200">Nav 2</a>
      </nav>
    </aside>
    
    <main class="flex-1 p-6 lg:order-2">
      <h2 class="text-2xl font-bold mb-4">Main Content</h2>
      <p>Responsive main content that stacks on mobile and flows on desktop.</p>
    </main>
    
    <aside class="lg:w-64 bg-gray-50 p-4 lg:order-3">
      <h3 class="font-semibold mb-4">Right Sidebar</h3>
      <div class="grid grid-cols-2 lg:grid-cols-1 gap-4">
        <div class="bg-white p-3 rounded shadow">
          <h4 class="font-medium">Widget 1</h4>
        </div>
        <div class="bg-white p-3 rounded shadow">
          <h4 class="font-medium">Widget 2</h4>
        </div>
      </div>
    </aside>
  </div>
  
  <footer class="bg-gray-800 text-white p-4 text-center">
    <p>&copy; 2024 Responsive Layout</p>
  </footer>
</div>
```

### Media Object Pattern

```html
<!-- Basic media object -->
<div class="flex space-x-4 p-4">
  <div class="flex-shrink-0">
    <img src="avatar.jpg" alt="Avatar" class="w-12 h-12 rounded-full">
  </div>
  <div class="flex-1">
    <h4 class="text-lg font-semibold">John Doe</h4>
    <p class="text-gray-600">This is a media object pattern where the image stays fixed width and the content flows around it.</p>
  </div>
</div>

<!-- Media object with actions -->
<div class="flex space-x-4 p-4 border-b">
  <div class="flex-shrink-0">
    <img src="avatar.jpg" alt="Avatar" class="w-10 h-10 rounded-full">
  </div>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <h4 class="font-semibold">Jane Smith</h4>
      <span class="text-sm text-gray-500">2 hours ago</span>
    </div>
    <p class="text-gray-700 mt-1">Just shipped a new feature! The media object pattern is perfect for comments, notifications, and social media posts.</p>
    <div class="flex space-x-4 mt-3 text-sm">
      <button class="text-blue-500 hover:text-blue-700">Like</button>
      <button class="text-blue-500 hover:text-blue-700">Reply</button>
      <button class="text-blue-500 hover:text-blue-700">Share</button>
    </div>
  </div>
</div>

<!-- Nested media objects (comments) -->
<div class="space-y-4">
  <div class="flex space-x-4">
    <img src="avatar1.jpg" alt="User" class="w-10 h-10 rounded-full flex-shrink-0">
    <div class="flex-1">
      <div class="bg-gray-100 rounded-lg p-3">
        <h5 class="font-semibold text-sm">Alice Johnson</h5>
        <p class="text-sm">Great post! This really helped me understand the concept.</p>
      </div>
      <div class="flex space-x-4 mt-2 text-xs text-gray-500">
        <button class="hover:text-gray-700">Like</button>
        <button class="hover:text-gray-700">Reply</button>
        <span>5 minutes ago</span>
      </div>
      
      <!-- Nested reply -->
      <div class="flex space-x-3 mt-3 ml-4">
        <img src="avatar2.jpg" alt="User" class="w-8 h-8 rounded-full flex-shrink-0">
        <div class="flex-1">
          <div class="bg-gray-50 rounded-lg p-2">
            <h6 class="font-semibold text-xs">Bob Wilson</h6>
            <p class="text-xs">Thanks Alice! Glad it was helpful.</p>
          </div>
          <div class="flex space-x-3 mt-1 text-xs text-gray-500">
            <button class="hover:text-gray-700">Like</button>
            <span>2 minutes ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Advanced Grid Techniques

### Named Grid Lines and Areas

```html
<!-- CSS Grid with named areas -->
<div class="grid grid-areas-layout min-h-screen" style="
  grid-template-areas: 
    'header header header'
    'sidebar main aside'
    'footer footer footer';
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 250px 1fr 200px;
">
  <header class="bg-blue-600 text-white p-4" style="grid-area: header;">
    <h1 class="text-xl font-bold">Grid Areas Layout</h1>
  </header>
  
  <nav class="bg-gray-100 p-4" style="grid-area: sidebar;">
    <h3 class="font-semibold mb-4">Navigation</h3>
    <div class="space-y-2">
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Home</a>
      <a href="#" class="block p-2 rounded hover:bg-gray-200">About</a>
      <a href="#" class="block p-2 rounded hover:bg-gray-200">Services</a>
    </div>
  </nav>
  
  <main class="p-6" style="grid-area: main;">
    <h2 class="text-2xl font-bold mb-4">Main Content</h2>
    <div class="space-y-4">
      <p>This layout uses CSS Grid named areas for semantic and maintainable code.</p>
      <p>Each section is explicitly placed using grid-area properties.</p>
    </div>
  </main>
  
  <aside class="bg-gray-50 p-4" style="grid-area: aside;">
    <h3 class="font-semibold mb-4">Sidebar</h3>
    <div class="space-y-3">
      <div class="bg-white p-3 rounded shadow">
        <h4 class="font-medium text-sm">Quick Links</h4>
        <ul class="text-xs text-gray-600 mt-2 space-y-1">
          <li><a href="#" class="hover:text-blue-500">Link 1</a></li>
          <li><a href="#" class="hover:text-blue-500">Link 2</a></li>
        </ul>
      </div>
    </div>
  </aside>
  
  <footer class="bg-gray-800 text-white p-4 text-center" style="grid-area: footer;">
    <p>&copy; 2024 Grid Areas Example</p>
  </footer>
</div>
```

### Subgrid and Nested Grids

```html
<!-- Nested grid layout -->
<div class="grid grid-cols-12 gap-6 p-6">
  <!-- Main content area -->
  <main class="col-span-8">
    <div class="grid grid-cols-2 gap-4 h-full">
      <article class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-3">Article 1</h2>
        <p class="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <a href="#" class="text-blue-500 hover:text-blue-700">Read more</a>
      </article>
      
      <article class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-3">Article 2</h2>
        <p class="text-gray-600 mb-4">Sed do eiusmod tempor incididunt ut labore et dolore magna.</p>
        <a href="#" class="text-blue-500 hover:text-blue-700">Read more</a>
      </article>
      
      <div class="col-span-2 bg-blue-50 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-3">Featured Content</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded p-3 text-center">
            <div class="text-2xl font-bold text-blue-600">42</div>
            <div class="text-sm text-gray-600">Projects</div>
          </div>
          <div class="bg-white rounded p-3 text-center">
            <div class="text-2xl font-bold text-green-600">98%</div>
            <div class="text-sm text-gray-600">Success</div>
          </div>
          <div class="bg-white rounded p-3 text-center">
            <div class="text-2xl font-bold text-purple-600">24/7</div>
            <div class="text-sm text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  </main>
  
  <!-- Sidebar -->
  <aside class="col-span-4">
    <div class="grid grid-rows-[auto_1fr_auto] gap-4 h-full">
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-3">Quick Stats</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Views</span>
            <span class="font-semibold">1,234</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Likes</span>
            <span class="font-semibold">567</span>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="font-semibold mb-3">Recent Activity</h3>
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm text-gray-600">New user registered</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Article published</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span class="text-sm text-gray-600">Comment posted</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <h3 class="font-semibold mb-2">Upgrade Now</h3>
        <p class="text-sm opacity-90 mb-3">Get access to premium features</p>
        <button class="bg-white text-blue-600 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100">
          Learn More
        </button>
      </div>
    </div>
  </aside>
</div>
```

## Layout Composition Patterns

### The Stack Pattern

```html
<!-- Vertical stack with consistent spacing -->
<div class="space-y-6 max-w-2xl mx-auto p-6">
  <header class="text-center">
    <h1 class="text-3xl font-bold text-gray-900">The Stack Pattern</h1>
    <p class="text-gray-600 mt-2">Consistent vertical rhythm and spacing</p>
  </header>
  
  <section class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4">Section Title</h2>
    <div class="space-y-4">
      <p class="text-gray-700">This demonstrates the stack pattern where elements are stacked vertically with consistent spacing.</p>
      <p class="text-gray-700">Each element in the stack maintains the same gap, creating visual rhythm.</p>
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p class="text-blue-800">This is a highlighted note within the stack.</p>
      </div>
    </div>
  </section>
  
  <section class="bg-white rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4">Another Section</h2>
    <div class="space-y-3">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Feature one with consistent spacing</span>
      </div>
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Feature two maintains the rhythm</span>
      </div>
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Feature three completes the pattern</span>
      </div>
    </div>
  </section>
  
  <footer class="text-center text-gray-500 text-sm">
    <p>Stack pattern maintains consistent vertical spacing throughout</p>
  </footer>
</div>
```

### The Cluster Pattern

```html
<!-- Horizontal clustering with wrapping -->
<div class="p-6">
  <h2 class="text-2xl font-bold mb-6">The Cluster Pattern</h2>
  
  <!-- Tag cluster -->
  <div class="mb-8">
    <h3 class="text-lg font-semibold mb-3">Tags</h3>
    <div class="flex flex-wrap gap-2">
      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">React</span>
      <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Vue.js</span>
      <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Angular</span>
      <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">JavaScript</span>
      <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">TypeScript</span>
      <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Node.js</span>
      <span class="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Express</span>
    </div>
  </div>
  
  <!-- Button cluster -->
  <div class="mb-8">
    <h3 class="text-lg font-semibold mb-3">Actions</h3>
    <div class="flex flex-wrap gap-3">
      <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Primary</button>
      <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Secondary</button>
      <button class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">Outline</button>
      <button class="text-red-500 hover:text-red-700">Delete</button>
    </div>
  </div>
  
  <!-- Social links cluster -->
  <div>
    <h3 class="text-lg font-semibold mb-3">Social Links</h3>
    <div class="flex flex-wrap gap-4">
      <a href="#" class="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
        </svg>
        <span>Facebook</span>
      </a>
      <a href="#" class="flex items-center space-x-2 text-blue-400 hover:text-blue-600">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
        </svg>
        <span>Twitter</span>
      </a>
      <a href="#" class="flex items-center space-x-2 text-blue-700 hover:text-blue-900">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
        </svg>
        <span>LinkedIn</span>
      </a>
    </div>
  </div>
</div>
```

### The Sidebar Pattern

```html
<!-- Flexible sidebar layout -->
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-900 text-white flex-shrink-0">
    <div class="p-4">
      <h2 class="text-xl font-bold mb-6">Dashboard</h2>
      <nav class="space-y-2">
        <a href="#" class="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
          </svg>
          <span>Overview</span>
        </a>
        <a href="#" class="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <span>Users</span>
        </a>
        <a href="#" class="flex items-center space-x-3 p-2 rounded hover:bg-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span>Analytics</span>
        </a>
      </nav>
    </div>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b p-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <div class="flex items-center space-x-4">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            New Project
          </button>
          <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </header>
    
    <!-- Content area -->
    <div class="flex-1 p-6 bg-gray-50">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-2">Total Users</h3>
          <p class="text-3xl font-bold text-blue-600">1,234</p>
          <p class="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-2">Revenue</h3>
          <p class="text-3xl font-bold text-green-600">$45,678</p>
          <p class="text-sm text-gray-500 mt-1">+8% from last month</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-2">Orders</h3>
          <p class="text-3xl font-bold text-purple-600">567</p>
          <p class="text-sm text-gray-500 mt-1">+15% from last month</p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h3 class="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-medium">New user registered</p>
                <p class="text-sm text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="font-medium">Order completed</p>
                <p class="text-sm text-gray-500">5 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

## Visual Layout Diagrams

```
Advanced Layout Patterns:

┌─────────────────────────────────────────────────────────────┐
│                    HOLY GRAIL LAYOUT                       │
├─────────────────────────────────────────────────────────────┤
│                        Header                               │
├─────────────┬─────────────────────────┬─────────────────────┤
│             │                         │                     │
│   Left      │      Main Content       │    Right Sidebar   │
│  Sidebar    │                         │                     │
│             │   (Flexible width)      │                     │
│ (Fixed)     │                         │     (Fixed)         │
│             │                         │                     │
├─────────────┴─────────────────────────┴─────────────────────┤
│                        Footer                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   MEDIA OBJECT PATTERN                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────────────────────────────────────────────────┐ │
│ │     │ │ Title                                           │ │
│ │ IMG │ │ Content that flows around the fixed-width       │ │
│ │     │ │ image. This pattern is perfect for comments,    │ │
│ └─────┘ │ notifications, and social media posts.          │ │
│         └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    STACK PATTERN                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Element 1                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                         ↕ gap                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Element 2                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                         ↕ gap                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                   Element 3                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   CLUSTER PATTERN                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                           │
│ │ Tag │ │ Tag │ │ Tag │ │ Tag │ ┌─────┐ ┌─────┐             │
│ └─────┘ └─────┘ └─────┘ └─────┘ │ Tag │ │ Tag │             │
│                                 └─────┘ └─────┘             │
│ Elements wrap to new lines when space runs out             │
└─────────────────────────────────────────────────────────────┘

Grid Areas Layout:

┌─────────────────────────────────────────────────────────────┐
│                      "header"                              │
├─────────────┬─────────────────────────┬─────────────────────┤
│             │                         │                     │
│ "sidebar"   │        "main"           │      "aside"        │
│             │                         │                     │
├─────────────┴─────────────────────────┴─────────────────────┤
│                      "footer"                              │
└─────────────────────────────────────────────────────────────┘

Positioning Context:

┌─────────────────────────────────────────────────────────────┐
│                 relative container                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ┌─────┐                                     ┌─────┐     │ │
│ │ │ abs │                                     │ abs │     │ │
│ │ │top-0│                                     │top-0│     │ │
│ │ │left │                                     │right│     │ │
│ │ └─────┘                                     └─────┘     │ │
│ │                                                         │ │
│ │                    ┌─────┐                              │ │
│ │                    │ abs │                              │ │
│ │                    │cent │                              │ │
│ │                    │ered │                              │ │
│ │                    └─────┘                              │ │
│ │                                                         │ │
│ │ ┌─────┐                                     ┌─────┐     │ │
│ │ │ abs │                                     │ abs │     │ │
│ │ │bot-0│                                     │bot-0│     │ │
│ │ │left │                                     │right│     │ │
│ │ └─────┘                                     └─────┘     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Common Pitfalls & Anti-Patterns

### ❌ Overusing Absolute Positioning

```html
<!-- Bad: Everything positioned absolutely -->
<div class="relative h-screen">
  <div class="absolute top-0 left-0">Header</div>
  <div class="absolute top-16 left-0">Sidebar</div>
  <div class="absolute top-16 left-64">Content</div>
  <div class="absolute bottom-0 left-0">Footer</div>
  <!-- Breaks on different screen sizes, not responsive -->
</div>
```

### ✅ Using Appropriate Layout Methods

```html
<!-- Good: Semantic layout with flexbox/grid -->
<div class="min-h-screen flex flex-col">
  <header class="bg-white shadow p-4">Header</header>
  <div class="flex-1 flex">
    <aside class="w-64 bg-gray-100 p-4">Sidebar</aside>
    <main class="flex-1 p-4">Content</main>
  </div>
  <footer class="bg-gray-800 text-white p-4">Footer</footer>
</div>
```

### ❌ Fixed Heights and Widths

```html
<!-- Bad: Fixed dimensions -->
<div class="h-96 w-80">
  <p>This content might overflow or leave empty space</p>
</div>
```

### ✅ Flexible and Responsive Sizing

```html
<!-- Good: Flexible sizing -->
<div class="min-h-96 max-w-sm">
  <p>This content adapts to its contents and constraints</p>
</div>
```

### ❌ Ignoring Content Flow

```html
<!-- Bad: Fighting against natural document flow -->
<div class="grid grid-cols-3">
  <div class="col-start-3">Should be first</div>
  <div class="col-start-1">Should be third</div>
  <div class="col-start-2">Should be second</div>
</div>
```

### ✅ Working with Natural Flow

```html
<!-- Good: Logical content order -->
<div class="grid grid-cols-3">
  <div>First content</div>
  <div>Second content</div>
  <div>Third content</div>
</div>
```

## When and Why to Use Advanced Layouts

### ✅ Use Advanced Positioning When:

1. **Creating overlays** - Modals, tooltips, dropdowns
2. **Fixed navigation** - Headers, sidebars that stay in place
3. **Decorative elements** - Background graphics, badges
4. **Complex interactions** - Drag and drop interfaces

### ✅ Use Grid When:

1. **Two-dimensional layouts** - Both rows and columns matter
2. **Complex alignments** - Items need precise positioning
3. **Responsive design** - Layout changes significantly across breakpoints
4. **Magazine-style layouts** - Overlapping or irregular grids

### ✅ Use Flexbox When:

1. **One-dimensional layouts** - Either row or column
2. **Component layouts** - Navigation bars, card internals
3. **Centering content** - Both horizontal and vertical
4. **Distributing space** - Equal spacing between items

### ✅ Use Layout Patterns When:

1. **Consistent spacing** - Stack pattern for vertical rhythm
2. **Flexible grouping** - Cluster pattern for tags, buttons
3. **Content + metadata** - Media object for comments, posts
4. **Application layouts** - Sidebar pattern for dashboards

## Performance Considerations

### Layout Thrashing Prevention

```html
<!-- Avoid frequent layout changes -->
<div class="transform-gpu will-change-transform">
  <!-- Use transform instead of changing position -->
  <div class="transition-transform hover:translate-x-2">
    Smooth animation
  </div>
</div>
```

### Efficient Grid Layouts

```html
<!-- Use CSS Grid efficiently -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <!-- Auto-sizing reduces layout calculations -->
  <div class="bg-white p-4 rounded shadow">Card 1</div>
  <div class="bg-white p-4 rounded shadow">Card 2</div>
  <div class="bg-white p-4 rounded shadow">Card 3</div>
</div>
```

### Minimize Reflows

```html
<!-- Use flexbox for dynamic content -->
<div class="flex flex-col space-y-4">
  <!-- Adding/removing items doesn't affect siblings -->
  <div class="bg-white p-4 rounded">Dynamic item 1</div>
  <div class="bg-white p-4 rounded">Dynamic item 2</div>
</div>
```

## Mini Challenges

### Challenge 1: Complex Dashboard Layout
Create a responsive dashboard layout that includes:
- Fixed header with navigation
- Collapsible sidebar
- Main content area with grid of cards
- Sticky footer
- Modal overlay system

### Challenge 2: Magazine-Style Layout
Build a magazine-style layout featuring:
- Hero article with overlapping elements
- Multi-column text layout
- Sidebar with related articles
- Image galleries with captions
- Responsive breakpoints

### Challenge 3: Advanced Component Library
Develop a component library with:
- Media object variations
- Stack components with different spacing
- Cluster components for tags and buttons
- Flexible card layouts
- Positioning utilities

## Interview Tips

**Q: "How do you decide between CSS Grid and Flexbox?"**

**A:** "I choose based on the layout requirements:

**CSS Grid for:**
- Two-dimensional layouts (rows AND columns)
- Complex, magazine-style layouts
- When I need precise control over item placement
- Layouts that change significantly across breakpoints

**Flexbox for:**
- One-dimensional layouts (either rows OR columns)
- Component-level layouts (navigation, cards)
- When I need to distribute space or align items
- Simple responsive behavior

Often I use both together - Grid for page layout, Flexbox for component internals."

**Q: "How do you handle complex positioning without breaking responsiveness?"**

**A:** "I follow these principles:
1. **Use relative positioning containers** - Establish positioning context
2. **Prefer transforms over position changes** - Better performance
3. **Test across breakpoints** - Ensure positioning works on all sizes
4. **Use CSS Grid/Flexbox first** - Only use absolute positioning when necessary
5. **Consider content flow** - Don't fight against natural document flow
6. **Use viewport units carefully** - They can cause issues on mobile"

**Q: "What are some performance considerations for complex layouts?"**

**A:** "Key performance considerations include:
1. **Minimize layout thrashing** - Avoid frequent position/size changes
2. **Use transform for animations** - Triggers compositing, not layout
3. **Batch DOM changes** - Group layout-affecting changes together
4. **Use will-change sparingly** - Only for elements that will actually change
5. **Optimize grid/flexbox** - Use auto-sizing when possible
6. **Consider paint complexity** - Complex shadows/gradients can be expensive
7. **Test on lower-end devices** - Performance varies significantly"

---

## Challenge Answers

### Answer 1: Complex Dashboard Layout
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Advanced Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
  <!-- Fixed Header -->
  <header class="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 h-16">
    <div class="flex items-center justify-between h-full px-6">
      <div class="flex items-center space-x-4">
        <button id="sidebar-toggle" class="lg:hidden p-2 rounded hover:bg-gray-100">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold">Dashboard</h1>
      </div>
      <div class="flex items-center space-x-4">
        <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          New Project
        </button>
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  </header>

  <div class="flex pt-16 min-h-screen">
    <!-- Collapsible Sidebar -->
    <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out pt-16 lg:pt-0">
      <div class="p-4">
        <nav class="space-y-2">
          <a href="#" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            </svg>
            <span>Overview</span>
          </a>
          <a href="#" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <span>Users</span>
          </a>
          <a href="#" class="flex items-center space-x-3 p-3 rounded hover:bg-gray-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Analytics</span>
          </a>
        </nav>
      </div>
    </aside>

    <!-- Sidebar Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden hidden"></div>

    <!-- Main Content -->
    <main class="flex-1 lg:ml-0">
      <div class="p-6 pb-20">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">Total Users</h3>
            <p class="text-3xl font-bold text-blue-600">1,234</p>
            <p class="text-sm text-gray-500 mt-1">+12% from last month</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">Revenue</h3>
            <p class="text-3xl font-bold text-green-600">$45,678</p>
            <p class="text-sm text-gray-500 mt-1">+8% from last month</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">Orders</h3>
            <p class="text-3xl font-bold text-purple-600">567</p>
            <p class="text-sm text-gray-500 mt-1">+15% from last month</p>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-2">Conversion</h3>
            <p class="text-3xl font-bold text-orange-600">3.2%</p>
            <p class="text-sm text-gray-500 mt-1">+0.5% from last month</p>
          </div>
        </div>

        <!-- Content Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">New user registered</p>
                    <p class="text-sm text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium">Order completed</p>
                    <p class="text-sm text-gray-500">5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="text-lg font-semibold">Performance Metrics</h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Page Views</span>
                  <span class="font-semibold">12,345</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Bounce Rate</span>
                  <span class="font-semibold">32%</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Session Duration</span>
                  <span class="font-semibold">4:32</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Sticky Footer -->
  <footer class="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20">
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">&copy; 2024 Advanced Dashboard</p>
      <div class="flex space-x-4">
        <button class="text-sm text-blue-500 hover:text-blue-700">Help</button>
        <button class="text-sm text-blue-500 hover:text-blue-700">Support</button>
      </div>
    </div>
  </footer>

  <!-- Modal Overlay -->
  <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Modal Title</h3>
        <p class="text-gray-600 mb-6">This is a modal overlay example.</p>
        <div class="flex space-x-3">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Confirm
          </button>
          <button id="close-modal" class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
    });

    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
    });
  </script>
 </body>
 </html>
```

### Answer 3: Advanced Component Library
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Library</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-6xl mx-auto space-y-12">
    <header class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Advanced Component Library</h1>
      <p class="text-gray-600">Reusable layout patterns and components</p>
    </header>

    <!-- Media Object Variations -->
    <section class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">Media Object Variations</h2>
      
      <!-- Basic Media Object -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Basic Media Object</h3>
        <div class="flex space-x-4 p-4 border rounded">
          <img src="https://via.placeholder.com/64x64" alt="Avatar" class="w-16 h-16 rounded-full flex-shrink-0">
          <div class="flex-1">
            <h4 class="font-semibold">John Doe</h4>
            <p class="text-gray-600">Software Developer at TechCorp</p>
            <p class="text-sm text-gray-500 mt-1">Joined 2 years ago</p>
          </div>
        </div>
      </div>

      <!-- Media Object with Actions -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Media Object with Actions</h3>
        <div class="flex space-x-4 p-4 border rounded">
          <img src="https://via.placeholder.com/48x48" alt="Avatar" class="w-12 h-12 rounded-full flex-shrink-0">
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold">Jane Smith</h4>
              <span class="text-sm text-gray-500">2 hours ago</span>
            </div>
            <p class="text-gray-700 mt-1">Just shipped a new feature! The media object pattern is perfect for social feeds.</p>
            <div class="flex space-x-4 mt-3">
              <button class="text-blue-500 hover:text-blue-700 text-sm">Like</button>
              <button class="text-blue-500 hover:text-blue-700 text-sm">Reply</button>
              <button class="text-blue-500 hover:text-blue-700 text-sm">Share</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reversed Media Object -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Reversed Media Object</h3>
        <div class="flex space-x-4 p-4 border rounded">
          <div class="flex-1 text-right">
            <h4 class="font-semibold">Alice Johnson</h4>
            <p class="text-gray-600">UX Designer</p>
            <p class="text-sm text-gray-500 mt-1">Available for freelance work</p>
          </div>
          <img src="https://via.placeholder.com/64x64" alt="Avatar" class="w-16 h-16 rounded-full flex-shrink-0">
        </div>
      </div>
    </section>

    <!-- Stack Components -->
    <section class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">Stack Components</h2>
      
      <!-- Tight Stack -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Tight Stack (space-y-2)</h3>
        <div class="space-y-2 p-4 border rounded">
          <div class="bg-blue-100 p-3 rounded">Item 1</div>
          <div class="bg-blue-100 p-3 rounded">Item 2</div>
          <div class="bg-blue-100 p-3 rounded">Item 3</div>
        </div>
      </div>

      <!-- Regular Stack -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Regular Stack (space-y-4)</h3>
        <div class="space-y-4 p-4 border rounded">
          <div class="bg-green-100 p-4 rounded">Item 1</div>
          <div class="bg-green-100 p-4 rounded">Item 2</div>
          <div class="bg-green-100 p-4 rounded">Item 3</div>
        </div>
      </div>

      <!-- Loose Stack -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Loose Stack (space-y-8)</h3>
        <div class="space-y-8 p-4 border rounded">
          <div class="bg-purple-100 p-4 rounded">Item 1</div>
          <div class="bg-purple-100 p-4 rounded">Item 2</div>
          <div class="bg-purple-100 p-4 rounded">Item 3</div>
        </div>
      </div>
    </section>

    <!-- Cluster Components -->
    <section class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">Cluster Components</h2>
      
      <!-- Tag Cluster -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Tag Cluster</h3>
        <div class="flex flex-wrap gap-2 p-4 border rounded">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">React</span>
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Vue.js</span>
          <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Angular</span>
          <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">JavaScript</span>
          <span class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">TypeScript</span>
        </div>
      </div>

      <!-- Button Cluster -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Button Cluster</h3>
        <div class="flex flex-wrap gap-3 p-4 border rounded">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Primary</button>
          <button class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Secondary</button>
          <button class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">Outline</button>
          <button class="text-red-500 hover:text-red-700">Delete</button>
        </div>
      </div>

      <!-- Icon Cluster -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Icon Cluster</h3>
        <div class="flex flex-wrap gap-4 p-4 border rounded">
          <div class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
            <span>Dashboard</span>
          </div>
          <div class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
            </svg>
            <span>Users</span>
          </div>
          <div class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 cursor-pointer">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Tasks</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Flexible Card Layouts -->
    <section class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">Flexible Card Layouts</h2>
      
      <!-- Auto-fit Cards -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Auto-fit Cards</h3>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h4 class="text-lg font-semibold mb-2">Card 1</h4>
            <p class="text-sm opacity-90">Auto-sizing card that adapts to container width</p>
          </div>
          <div class="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-lg">
            <h4 class="text-lg font-semibold mb-2">Card 2</h4>
            <p class="text-sm opacity-90">Minimum 250px width, grows to fill space</p>
          </div>
          <div class="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-lg">
            <h4 class="text-lg font-semibold mb-2">Card 3</h4>
            <p class="text-sm opacity-90">Responsive without media queries</p>
          </div>
        </div>
      </div>

      <!-- Aspect Ratio Cards -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Aspect Ratio Cards</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="aspect-video bg-gray-200 flex items-center justify-center">
              <span class="text-gray-500">16:9 Image</span>
            </div>
            <div class="p-4">
              <h4 class="font-semibold mb-2">Video Card</h4>
              <p class="text-sm text-gray-600">Perfect for video thumbnails and media content</p>
            </div>
          </div>
          <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="aspect-square bg-gray-200 flex items-center justify-center">
              <span class="text-gray-500">1:1 Image</span>
            </div>
            <div class="p-4">
              <h4 class="font-semibold mb-2">Square Card</h4>
              <p class="text-sm text-gray-600">Great for profile pictures and product images</p>
            </div>
          </div>
          <div class="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="aspect-[4/3] bg-gray-200 flex items-center justify-center">
              <span class="text-gray-500">4:3 Image</span>
            </div>
            <div class="p-4">
              <h4 class="font-semibold mb-2">Classic Card</h4>
              <p class="text-sm text-gray-600">Traditional aspect ratio for general content</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Positioning Utilities -->
    <section class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">Positioning Utilities</h2>
      
      <!-- Relative Positioning Container -->
      <div class="relative bg-gray-100 h-64 p-4 rounded border">
        <h3 class="text-lg font-semibold mb-4">Relative Container with Absolute Children</h3>
        
        <!-- Corner positioned elements -->
        <div class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Top Left
        </div>
        <div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Top Right
        </div>
        <div class="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
          Bottom Left
        </div>
        <div class="absolute bottom-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs">
          Bottom Right
        </div>
        
        <!-- Centered element -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black px-3 py-2 rounded font-semibold">
          Perfectly Centered
        </div>
      </div>
    </section>
  </div>
</body>
</html>
```

This comprehensive chapter on Advanced Layout Techniques provides you with the tools and patterns needed to create sophisticated, responsive layouts using Tailwind CSS. From complex positioning to modern layout patterns, these techniques will help you build professional-grade interfaces that work across all devices and screen sizes.

### Answer 2: Magazine-Style Layout
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magazine Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <!-- Hero Section with Overlapping Elements -->
  <section class="relative h-screen bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
    <div class="absolute inset-0 bg-black bg-opacity-40"></div>
    <div class="relative z-10 h-full flex items-center">
      <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="text-white">
          <h1 class="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            The Future of
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Design
            </span>
          </h1>
          <p class="text-xl mb-8 text-gray-200">
            Exploring the intersection of technology, creativity, and human experience in modern digital design.
          </p>
          <button class="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            Read Article
          </button>
        </div>
        <div class="relative">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
          <div class="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-400 rounded-full opacity-30"></div>
          <img src="https://via.placeholder.com/600x400" alt="Hero Image" class="rounded-lg shadow-2xl relative z-10">
        </div>
      </div>
    </div>
  </section>

  <!-- Main Content Area -->
  <div class="max-w-7xl mx-auto px-6 py-16">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Main Article Content -->
      <main class="lg:col-span-3">
        <!-- Multi-column Text Layout -->
        <article class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-3xl font-bold mb-6 text-gray-900">
            The Evolution of Digital Experiences
          </h2>
          <div class="columns-1 md:columns-2 gap-8 text-gray-700 leading-relaxed">
            <p class="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="mb-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p class="mb-4">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <p class="mb-4">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </div>
        </article>

        <!-- Image Gallery with Captions -->
        <section class="bg-white rounded-lg shadow-lg p-8">
          <h3 class="text-2xl font-bold mb-6 text-gray-900">Visual Showcase</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <figure class="group">
              <img src="https://via.placeholder.com/300x200" alt="Gallery Image 1" class="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300">
              <figcaption class="mt-3 text-sm text-gray-600">
                <strong>Modern Architecture:</strong> Exploring geometric forms in contemporary design
              </figcaption>
            </figure>
            <figure class="group">
              <img src="https://via.placeholder.com/300x200" alt="Gallery Image 2" class="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300">
              <figcaption class="mt-3 text-sm text-gray-600">
                <strong>Digital Art:</strong> The intersection of technology and creativity
              </figcaption>
            </figure>
            <figure class="group">
              <img src="https://via.placeholder.com/300x200" alt="Gallery Image 3" class="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300">
              <figcaption class="mt-3 text-sm text-gray-600">
                <strong>User Experience:</strong> Designing for human-centered interactions
              </figcaption>
            </figure>
          </div>
        </section>
      </main>

      <!-- Sidebar with Related Articles -->
      <aside class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-bold mb-4 text-gray-900">Related Articles</h3>
          <div class="space-y-4">
            <article class="border-b border-gray-200 pb-4 last:border-b-0">
              <img src="https://via.placeholder.com/100x60" alt="Related Article" class="w-full h-24 object-cover rounded mb-3">
              <h4 class="font-semibold text-sm mb-2 hover:text-blue-600 cursor-pointer">
                The Psychology of Color in Digital Design
              </h4>
              <p class="text-xs text-gray-600">March 15, 2024</p>
            </article>
            <article class="border-b border-gray-200 pb-4 last:border-b-0">
              <img src="https://via.placeholder.com/100x60" alt="Related Article" class="w-full h-24 object-cover rounded mb-3">
              <h4 class="font-semibold text-sm mb-2 hover:text-blue-600 cursor-pointer">
                Responsive Design Patterns for 2024
              </h4>
              <p class="text-xs text-gray-600">March 12, 2024</p>
            </article>
            <article>
              <img src="https://via.placeholder.com/100x60" alt="Related Article" class="w-full h-24 object-cover rounded mb-3">
              <h4 class="font-semibold text-sm mb-2 hover:text-blue-600 cursor-pointer">
                Accessibility in Modern Web Development
              </h4>
              <p class="text-xs text-gray-600">March 10, 2024</p>
            </article>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
          <h3 class="text-lg font-bold mb-3">Newsletter</h3>
          <p class="text-sm mb-4 opacity-90">
            Get the latest design insights delivered to your inbox.
          </p>
          <form class="space-y-3">
            <input type="email" placeholder="Your email" class="w-full px-3 py-2 rounded text-gray-900 text-sm">
            <button class="w-full bg-white text-purple-600 py-2 rounded font-semibold text-sm hover:bg-gray-100">
              Subscribe
            </button>
          </form>
        </div>
      </aside>
    </div>
  </div>
</body>
</html>
```