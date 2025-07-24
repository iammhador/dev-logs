# Template Engines: EJS and Pug for Server-Side Rendering

## Overview

Template engines allow you to generate dynamic HTML content on the server side by combining static templates with dynamic data. Express.js supports various template engines, with EJS (Embedded JavaScript) and Pug (formerly Jade) being among the most popular. Template engines enable you to create reusable layouts, inject data into HTML, implement conditional rendering, and build complete web applications with server-side rendering (SSR).

## Key Concepts

### Template Engines Fundamentals

**Template Engine**: A tool that combines templates (static markup) with data to produce HTML output.

**Benefits**:
- **Server-Side Rendering (SSR)**: Better SEO and initial page load performance
- **Dynamic Content**: Inject data from databases or APIs
- **Reusable Components**: Create layouts and partials
- **Logic in Templates**: Conditional rendering and loops
- **Security**: Automatic escaping prevents XSS attacks

### EJS (Embedded JavaScript)

**Characteristics**:
- Uses plain JavaScript syntax
- Familiar HTML-like structure
- Easy to learn for JavaScript developers
- Supports includes and layouts
- Good performance

**Syntax**:
- `<% %>` - JavaScript code (no output)
- `<%= %>` - Output escaped content
- `<%- %>` - Output unescaped content
- `<%# %>` - Comments
- `<%- include('partial') %>` - Include partials

### Pug (formerly Jade)

**Characteristics**:
- Indentation-based syntax (no closing tags)
- Concise and clean
- Built-in features like mixins and inheritance
- Powerful templating features
- Steeper learning curve

**Syntax**:
- Indentation defines nesting
- `#{}` - Interpolation
- `!{}` - Unescaped interpolation
- `//` - Comments
- `include` and `extends` for modularity

## Example Code

### Setting Up EJS

```javascript
// app.js - EJS Setup
const express = require('express');
const path = require('path');
const app = express();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sample data
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', active: false }
];

const posts = [
    { id: 1, title: 'Getting Started with EJS', content: 'EJS is a simple templating language...', authorId: 1, published: true, createdAt: new Date('2024-01-15') },
    { id: 2, title: 'Advanced EJS Techniques', content: 'Learn advanced EJS features...', authorId: 2, published: true, createdAt: new Date('2024-01-20') },
    { id: 3, title: 'Draft Post', content: 'This is a draft...', authorId: 1, published: false, createdAt: new Date('2024-01-25') }
];

// Routes
app.get('/', (req, res) => {
    const publishedPosts = posts.filter(post => post.published);
    res.render('index', {
        title: 'Welcome to EJS Demo',
        posts: publishedPosts,
        users,
        currentUser: users[0] // Simulate logged-in user
    });
});

app.get('/users', (req, res) => {
    res.render('users', {
        title: 'User Management',
        users,
        currentUser: users[0]
    });
});

app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return res.status(404).render('error', {
            title: 'User Not Found',
            error: 'The requested user could not be found.',
            currentUser: users[0]
        });
    }
    
    const userPosts = posts.filter(post => post.authorId === userId);
    
    res.render('user-detail', {
        title: `User: ${user.name}`,
        user,
        posts: userPosts,
        currentUser: users[0]
    });
});

app.get('/posts/new', (req, res) => {
    res.render('post-form', {
        title: 'Create New Post',
        post: null,
        users,
        currentUser: users[0]
    });
});

app.post('/posts', (req, res) => {
    const { title, content, authorId, published } = req.body;
    
    const newPost = {
        id: Math.max(...posts.map(p => p.id)) + 1,
        title,
        content,
        authorId: parseInt(authorId),
        published: published === 'on',
        createdAt: new Date()
    };
    
    posts.push(newPost);
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 EJS Server running on http://localhost:${PORT}`);
});
```

### EJS Templates

```html
<!-- views/layout.ejs - Main Layout -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %> | EJS Demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .navbar-brand { font-weight: bold; }
        .post-card { transition: transform 0.2s; }
        .post-card:hover { transform: translateY(-2px); }
        .user-avatar { width: 40px; height: 40px; }
        footer { margin-top: 50px; }
    </style>
</head>
<body>
    <!-- Navigation -->
    <%- include('partials/navbar') %>
    
    <!-- Main Content -->
    <main class="container mt-4">
        <!-- Flash Messages -->
        <% if (typeof message !== 'undefined' && message) { %>
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <%= message %>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <% } %>
        
        <!-- Page Content -->
        <%- body %>
    </main>
    
    <!-- Footer -->
    <%- include('partials/footer') %>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

```html
<!-- views/partials/navbar.ejs -->
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" href="/">
            <i class="fas fa-code"></i> EJS Demo
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/">
                        <i class="fas fa-home"></i> Home
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/users">
                        <i class="fas fa-users"></i> Users
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/posts/new">
                        <i class="fas fa-plus"></i> New Post
                    </a>
                </li>
            </ul>
            
            <!-- User Info -->
            <% if (typeof currentUser !== 'undefined' && currentUser) { %>
                <div class="navbar-nav">
                    <div class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                            <img src="https://ui-avatars.com/api/?name=<%= encodeURIComponent(currentUser.name) %>&background=random" 
                                 alt="<%= currentUser.name %>" class="rounded-circle user-avatar me-2">
                            <%= currentUser.name %>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="/users/<%= currentUser.id %>">Profile</a></li>
                            <li><a class="dropdown-item" href="/settings">Settings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="/logout">Logout</a></li>
                        </ul>
                    </div>
                </div>
            <% } %>
        </div>
    </div>
</nav>
```

```html
<!-- views/partials/footer.ejs -->
<footer class="bg-light py-4 mt-5">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <h5>EJS Demo Application</h5>
                <p class="text-muted">Built with Express.js and EJS template engine.</p>
            </div>
            <div class="col-md-6 text-md-end">
                <p class="text-muted">
                    &copy; <%= new Date().getFullYear() %> EJS Demo. 
                    Generated at <%= new Date().toLocaleString() %>
                </p>
            </div>
        </div>
    </div>
</footer>
```

```html
<!-- views/index.ejs -->
<% 
// Define the body content
const bodyContent = `
<div class="row">
    <div class="col-lg-8">
        <h1 class="mb-4">
            <i class="fas fa-newspaper"></i> Latest Posts
        </h1>
        
        <% if (posts && posts.length > 0) { %>
            <% posts.forEach(post => { %>
                <% const author = users.find(u => u.id === post.authorId) %>
                <div class="card post-card mb-4 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">
                                <a href="/posts/<%= post.id %>" class="text-decoration-none">
                                    <%= post.title %>
                                </a>
                            </h5>
                            <% if (post.published) { %>
                                <span class="badge bg-success">Published</span>
                            <% } else { %>
                                <span class="badge bg-warning">Draft</span>
                            <% } %>
                        </div>
                        
                        <p class="card-text text-muted">
                            <%= post.content.substring(0, 150) %>
                            <% if (post.content.length > 150) { %>...<% } %>
                        </p>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img src="https://ui-avatars.com/api/?name=<%= encodeURIComponent(author.name) %>&background=random" 
                                     alt="<%= author.name %>" class="rounded-circle me-2" width="32" height="32">
                                <small class="text-muted">
                                    By <a href="/users/<%= author.id %>" class="text-decoration-none"><%= author.name %></a>
                                    on <%= post.createdAt.toLocaleDateString() %>
                                </small>
                            </div>
                            <a href="/posts/<%= post.id %>" class="btn btn-outline-primary btn-sm">
                                Read More <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            <% }) %>
        <% } else { %>
            <div class="text-center py-5">
                <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                <h3 class="text-muted">No posts available</h3>
                <p class="text-muted">Be the first to create a post!</p>
                <a href="/posts/new" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create Post
                </a>
            </div>
        <% } %>
    </div>
    
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-users"></i> Active Users
                </h5>
            </div>
            <div class="card-body">
                <% const activeUsers = users.filter(u => u.active) %>
                <% activeUsers.forEach(user => { %>
                    <div class="d-flex align-items-center mb-3">
                        <img src="https://ui-avatars.com/api/?name=<%= encodeURIComponent(user.name) %>&background=random" 
                             alt="<%= user.name %>" class="rounded-circle me-3" width="40" height="40">
                        <div>
                            <h6 class="mb-0">
                                <a href="/users/<%= user.id %>" class="text-decoration-none"><%= user.name %></a>
                            </h6>
                            <small class="text-muted">
                                <i class="fas fa-crown text-warning"></i> <%= user.role %>
                            </small>
                        </div>
                    </div>
                <% }) %>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-chart-bar"></i> Statistics
                </h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-6">
                        <h3 class="text-primary"><%= posts.filter(p => p.published).length %></h3>
                        <small class="text-muted">Published Posts</small>
                    </div>
                    <div class="col-6">
                        <h3 class="text-success"><%= users.filter(u => u.active).length %></h3>
                        <small class="text-muted">Active Users</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
%>

<%- include('layout', { body: bodyContent }) %>
```

```html
<!-- views/users.ejs -->
<% 
const bodyContent = `
<div class="d-flex justify-content-between align-items-center mb-4">
    <h1><i class="fas fa-users"></i> User Management</h1>
    <a href="/users/new" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add User
    </a>
</div>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <% users.forEach(user => { %>
                        <tr>
                            <td>
                                <img src="https://ui-avatars.com/api/?name=<%= encodeURIComponent(user.name) %>&background=random" 
                                     alt="<%= user.name %>" class="rounded-circle" width="40" height="40">
                            </td>
                            <td>
                                <strong><%= user.name %></strong>
                            </td>
                            <td>
                                <a href="mailto:<%= user.email %>" class="text-decoration-none">
                                    <%= user.email %>
                                </a>
                            </td>
                            <td>
                                <% if (user.role === 'admin') { %>
                                    <span class="badge bg-danger">
                                        <i class="fas fa-crown"></i> Admin
                                    </span>
                                <% } else { %>
                                    <span class="badge bg-primary">
                                        <i class="fas fa-user"></i> User
                                    </span>
                                <% } %>
                            </td>
                            <td>
                                <% if (user.active) { %>
                                    <span class="badge bg-success">
                                        <i class="fas fa-check"></i> Active
                                    </span>
                                <% } else { %>
                                    <span class="badge bg-secondary">
                                        <i class="fas fa-times"></i> Inactive
                                    </span>
                                <% } %>
                            </td>
                            <td>
                                <div class="btn-group" role="group">
                                    <a href="/users/<%= user.id %>" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye"></i>
                                    </a>
                                    <a href="/users/<%= user.id %>/edit" class="btn btn-sm btn-outline-warning">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <% if (user.id !== currentUser.id) { %>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(<%= user.id %>)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    <% } %>
                                </div>
                            </td>
                        </tr>
                    <% }) %>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(\`/users/\${userId}\`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                location.reload();
            } else {
                alert('Error deleting user');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting user');
        });
    }
}
</script>
`;
%>

<%- include('layout', { body: bodyContent }) %>
```

### Setting Up Pug

```javascript
// app-pug.js - Pug Setup
const express = require('express');
const path = require('path');
const app = express();

// Set Pug as template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views-pug'));

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper functions for templates
app.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

app.locals.truncate = (text, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
};

// Sample data (same as EJS example)
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', active: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', active: false }
];

const posts = [
    { id: 1, title: 'Getting Started with Pug', content: 'Pug is a clean, whitespace-sensitive syntax...', authorId: 1, published: true, createdAt: new Date('2024-01-15') },
    { id: 2, title: 'Advanced Pug Features', content: 'Learn about mixins, inheritance, and more...', authorId: 2, published: true, createdAt: new Date('2024-01-20') },
    { id: 3, title: 'Draft Post', content: 'This is a draft...', authorId: 1, published: false, createdAt: new Date('2024-01-25') }
];

// Routes
app.get('/', (req, res) => {
    const publishedPosts = posts.filter(post => post.published);
    res.render('index', {
        title: 'Welcome to Pug Demo',
        posts: publishedPosts,
        users,
        currentUser: users[0]
    });
});

app.get('/users', (req, res) => {
    res.render('users', {
        title: 'User Management',
        users,
        currentUser: users[0]
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Pug',
        features: [
            { name: 'Clean Syntax', description: 'No closing tags, indentation-based' },
            { name: 'Powerful Features', description: 'Mixins, inheritance, includes' },
            { name: 'JavaScript Integration', description: 'Full JavaScript support' },
            { name: 'Performance', description: 'Compiled templates for speed' }
        ],
        currentUser: users[0]
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Pug Server running on http://localhost:${PORT}`);
});
```

### Pug Templates

```pug
//- views-pug/layout.pug - Main Layout
doctype html
html(lang='en')
  head
    meta(charset='UTF-8')
    meta(name='viewport', content='width=device-width, initial-scale=1.0')
    title #{title} | Pug Demo
    link(href='https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css', rel='stylesheet')
    link(href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', rel='stylesheet')
    style.
      .navbar-brand { font-weight: bold; }
      .post-card { transition: transform 0.2s; }
      .post-card:hover { transform: translateY(-2px); }
      .user-avatar { width: 40px; height: 40px; }
      footer { margin-top: 50px; }
      
  body
    //- Navigation
    include partials/navbar
    
    //- Main Content
    main.container.mt-4
      //- Flash Messages
      if message
        .alert.alert-info.alert-dismissible.fade.show(role='alert')
          = message
          button.btn-close(type='button', data-bs-dismiss='alert')
      
      //- Page Content
      block content
    
    //- Footer
    include partials/footer
    
    script(src='https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js')
```

```pug
//- views-pug/partials/navbar.pug
nav.navbar.navbar-expand-lg.navbar-dark.bg-primary
  .container
    a.navbar-brand(href='/')
      i.fas.fa-code
      |  Pug Demo
    
    button.navbar-toggler(type='button', data-bs-toggle='collapse', data-bs-target='#navbarNav')
      span.navbar-toggler-icon
    
    .collapse.navbar-collapse#navbarNav
      ul.navbar-nav.me-auto
        li.nav-item
          a.nav-link(href='/')
            i.fas.fa-home
            |  Home
        li.nav-item
          a.nav-link(href='/users')
            i.fas.fa-users
            |  Users
        li.nav-item
          a.nav-link(href='/about')
            i.fas.fa-info-circle
            |  About
      
      //- User Info
      if currentUser
        .navbar-nav
          .nav-item.dropdown
            a.nav-link.dropdown-toggle(href='#', role='button', data-bs-toggle='dropdown')
              img.rounded-circle.user-avatar.me-2(src=`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`, alt=currentUser.name)
              = currentUser.name
            ul.dropdown-menu
              li: a.dropdown-item(href=`/users/${currentUser.id}`) Profile
              li: a.dropdown-item(href='/settings') Settings
              li: hr.dropdown-divider
              li: a.dropdown-item(href='/logout') Logout
```

```pug
//- views-pug/partials/footer.pug
footer.bg-light.py-4.mt-5
  .container
    .row
      .col-md-6
        h5 Pug Demo Application
        p.text-muted Built with Express.js and Pug template engine.
      .col-md-6.text-md-end
        p.text-muted
          | &copy; #{new Date().getFullYear()} Pug Demo. 
          | Generated at #{new Date().toLocaleString()}
```

```pug
//- views-pug/mixins/post-card.pug
mixin postCard(post, author)
  .card.post-card.mb-4.shadow-sm
    .card-body
      .d-flex.justify-content-between.align-items-start.mb-3
        h5.card-title.mb-0
          a.text-decoration-none(href=`/posts/${post.id}`)= post.title
        if post.published
          span.badge.bg-success Published
        else
          span.badge.bg-warning Draft
      
      p.card-text.text-muted= truncate(post.content, 150)
      
      .d-flex.justify-content-between.align-items-center
        .d-flex.align-items-center
          img.rounded-circle.me-2(src=`https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`, alt=author.name, width='32', height='32')
          small.text-muted
            | By 
            a.text-decoration-none(href=`/users/${author.id}`)= author.name
            |  on #{formatDate(post.createdAt)}
        a.btn.btn-outline-primary.btn-sm(href=`/posts/${post.id}`)
          | Read More 
          i.fas.fa-arrow-right

mixin userBadge(user)
  .d-flex.align-items-center.mb-3
    img.rounded-circle.me-3(src=`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`, alt=user.name, width='40', height='40')
    div
      h6.mb-0
        a.text-decoration-none(href=`/users/${user.id}`)= user.name
      small.text-muted
        i.fas.fa-crown.text-warning
        |  #{user.role}
```

```pug
//- views-pug/index.pug
extends layout
include mixins/post-card

block content
  .row
    .col-lg-8
      h1.mb-4
        i.fas.fa-newspaper
        |  Latest Posts
      
      if posts && posts.length > 0
        each post in posts
          - const author = users.find(u => u.id === post.authorId)
          +postCard(post, author)
      else
        .text-center.py-5
          i.fas.fa-newspaper.fa-3x.text-muted.mb-3
          h3.text-muted No posts available
          p.text-muted Be the first to create a post!
          a.btn.btn-primary(href='/posts/new')
            i.fas.fa-plus
            |  Create Post
    
    .col-lg-4
      .card
        .card-header
          h5.mb-0
            i.fas.fa-users
            |  Active Users
        .card-body
          - const activeUsers = users.filter(u => u.active)
          each user in activeUsers
            +userBadge(user)
      
      .card.mt-4
        .card-header
          h5.mb-0
            i.fas.fa-chart-bar
            |  Statistics
        .card-body
          .row.text-center
            .col-6
              h3.text-primary= posts.filter(p => p.published).length
              small.text-muted Published Posts
            .col-6
              h3.text-success= users.filter(u => u.active).length
              small.text-muted Active Users
```

```pug
//- views-pug/about.pug
extends layout

block content
  .row.justify-content-center
    .col-lg-8
      h1.text-center.mb-5
        i.fas.fa-info-circle.text-primary
        |  About Pug Template Engine
      
      .card.shadow
        .card-body.p-5
          p.lead.text-center.mb-4
            | Pug is a clean, whitespace-sensitive syntax for writing HTML.
          
          h3.mb-4 Key Features
          
          .row
            each feature in features
              .col-md-6.mb-4
                .card.h-100.border-0.bg-light
                  .card-body.text-center
                    h5.card-title.text-primary= feature.name
                    p.card-text= feature.description
          
          h3.mb-3 Syntax Comparison
          
          .row
            .col-md-6
              h5 HTML
              pre.bg-light.p-3
                code.
                  &lt;div class="container"&gt;
                    &lt;h1&gt;Hello World&lt;/h1&gt;
                    &lt;p&gt;Welcome to our site&lt;/p&gt;
                  &lt;/div&gt;
            
            .col-md-6
              h5 Pug
              pre.bg-light.p-3
                code.
                  .container
                    h1 Hello World
                    p Welcome to our site
          
          .text-center.mt-4
            a.btn.btn-primary.btn-lg(href='https://pugjs.org', target='_blank')
              | Learn More About Pug
              i.fas.fa-external-link-alt.ms-2
```

## Real-World Use Case

### Blog Application with Both Template Engines

```javascript
// blog-app.js - Complete Blog Application
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

// Configuration
const config = {
    templateEngine: process.env.TEMPLATE_ENGINE || 'ejs', // 'ejs' or 'pug'
    port: process.env.PORT || 3000,
    postsPerPage: 5
};

// Set template engine based on config
if (config.templateEngine === 'pug') {
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views-pug'));
} else {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
}

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Template helpers
app.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

app.locals.truncate = (text, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
};

app.locals.slugify = (text) => {
    return text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Data storage (in production, use a database)
let blogData = {
    posts: [
        {
            id: 1,
            title: 'Getting Started with Template Engines',
            slug: 'getting-started-template-engines',
            content: `Template engines are powerful tools that allow developers to generate dynamic HTML content by combining static templates with dynamic data. In this comprehensive guide, we'll explore the fundamentals of template engines and how they can revolutionize your web development workflow.

## What are Template Engines?

Template engines separate the presentation layer from the business logic, making your code more maintainable and organized. They allow you to:

- Create reusable layouts and components
- Inject dynamic data into static templates
- Implement conditional rendering and loops
- Maintain clean separation of concerns

## Popular Template Engines

### EJS (Embedded JavaScript)
EJS uses familiar JavaScript syntax and HTML-like structure, making it easy for developers to adopt.

### Pug (formerly Jade)
Pug offers a clean, indentation-based syntax that eliminates the need for closing tags.

### Handlebars
Handlebars provides a logic-less templating approach with powerful helpers.

## Best Practices

1. **Keep logic minimal** - Templates should focus on presentation
2. **Use partials** - Break down templates into reusable components
3. **Escape user input** - Prevent XSS attacks with proper escaping
4. **Cache templates** - Improve performance in production

Template engines are essential tools for modern web development, enabling developers to create dynamic, maintainable, and secure web applications.`,
            excerpt: 'Learn the fundamentals of template engines and how they can improve your web development workflow.',
            authorId: 1,
            categoryId: 1,
            published: true,
            featured: true,
            tags: ['web-development', 'templates', 'ejs', 'pug'],
            createdAt: new Date('2024-01-15T10:00:00Z'),
            updatedAt: new Date('2024-01-15T10:00:00Z'),
            views: 1250,
            likes: 89
        },
        {
            id: 2,
            title: 'Advanced EJS Techniques and Best Practices',
            slug: 'advanced-ejs-techniques',
            content: `EJS (Embedded JavaScript) is one of the most popular template engines for Node.js applications. While it's easy to get started with EJS, mastering its advanced features can significantly improve your development productivity and code quality.

## Advanced EJS Features

### Custom Delimiters
You can customize EJS delimiters to avoid conflicts with other templating systems:

\`\`\`javascript
app.set('view options', {
    delimiter: '?'
});
\`\`\`

### Includes with Data
Pass data to included templates:

\`\`\`ejs
<%- include('partials/header', { pageTitle: 'Custom Title' }) %>
\`\`\`

### Caching for Performance
Enable template caching in production:

\`\`\`javascript
if (process.env.NODE_ENV === 'production') {
    app.set('view cache', true);
}
\`\`\`

### Error Handling
Implement proper error handling in templates:

\`\`\`ejs
<% try { %>
    <%= user.name %>
<% } catch (error) { %>
    <span class="text-muted">Name not available</span>
<% } %>
\`\`\`

## Performance Optimization

1. **Enable caching** in production environments
2. **Minimize logic** in templates
3. **Use partials** for reusable components
4. **Precompile templates** for better performance

## Security Considerations

- Always use `<%= %>` for user input to prevent XSS
- Validate data before passing to templates
- Use Content Security Policy (CSP) headers
- Sanitize HTML content when necessary

By following these advanced techniques and best practices, you can build robust, secure, and performant web applications with EJS.`,
            excerpt: 'Discover advanced EJS techniques, performance optimization tips, and security best practices.',
            authorId: 2,
            categoryId: 1,
            published: true,
            featured: false,
            tags: ['ejs', 'performance', 'security', 'best-practices'],
            createdAt: new Date('2024-01-20T14:30:00Z'),
            updatedAt: new Date('2024-01-20T14:30:00Z'),
            views: 892,
            likes: 67
        },
        {
            id: 3,
            title: 'Mastering Pug: From Basics to Advanced Features',
            slug: 'mastering-pug-template-engine',
            content: `Pug (formerly known as Jade) is a powerful, clean, and feature-rich template engine for Node.js. Its indentation-based syntax and powerful features make it a favorite among developers who value clean, maintainable code.

## Why Choose Pug?

### Clean Syntax
Pug's indentation-based syntax eliminates the need for closing tags:

\`\`\`pug
div.container
  h1.title Welcome to Pug
  p.description This is much cleaner than HTML
\`\`\`

### Powerful Features

#### Mixins
Create reusable template functions:

\`\`\`pug
mixin button(text, type='button')
  button(class=\`btn btn-\${type}\`)= text

+button('Click me', 'primary')
+button('Cancel', 'secondary')
\`\`\`

#### Template Inheritance
Extend layouts for consistent structure:

\`\`\`pug
//- layout.pug
doctype html
html
  head
    title= title
  body
    block content

//- page.pug
extends layout
block content
  h1 Page Content
\`\`\`

#### Filters
Process content with built-in filters:

\`\`\`pug
script.
  const message = 'Hello from Pug!';
  console.log(message);

style.
  .highlight {
    background-color: yellow;
  }
\`\`\`

## Advanced Techniques

### Conditional Classes
\`\`\`pug
div(class={ active: isActive, disabled: !isEnabled })
\`\`\`

### Iteration with Index
\`\`\`pug
ul
  each item, index in items
    li(class=index % 2 ? 'odd' : 'even')= item
\`\`\`

### Case Statements
\`\`\`pug
case user.role
  when 'admin'
    p You are an administrator
  when 'user'
    p You are a regular user
  default
    p Unknown role
\`\`\`

## Best Practices

1. **Use mixins** for reusable components
2. **Leverage inheritance** for consistent layouts
3. **Keep indentation consistent** (2 or 4 spaces)
4. **Use meaningful variable names**
5. **Comment complex logic**

Pug's powerful features and clean syntax make it an excellent choice for developers who want to write maintainable, readable templates while leveraging advanced templating capabilities.`,
            excerpt: 'Explore Pug\'s powerful features including mixins, inheritance, and advanced templating techniques.',
            authorId: 1,
            categoryId: 1,
            published: true,
            featured: true,
            tags: ['pug', 'jade', 'templates', 'mixins', 'inheritance'],
            createdAt: new Date('2024-01-25T09:15:00Z'),
            updatedAt: new Date('2024-01-25T09:15:00Z'),
            views: 1456,
            likes: 123
        }
    ],
    authors: [
        {
            id: 1,
            name: 'Alex Johnson',
            email: 'alex@example.com',
            bio: 'Full-stack developer with 8+ years of experience in Node.js and modern web technologies.',
            avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=random',
            social: {
                twitter: '@alexjohnson',
                github: 'alexjohnson',
                linkedin: 'alex-johnson'
            },
            active: true
        },
        {
            id: 2,
            name: 'Sarah Chen',
            email: 'sarah@example.com',
            bio: 'Frontend specialist and UI/UX enthusiast. Passionate about creating beautiful, accessible web experiences.',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random',
            social: {
                twitter: '@sarahchen',
                github: 'sarahchen',
                dribbble: 'sarahchen'
            },
            active: true
        }
    ],
    categories: [
        { id: 1, name: 'Web Development', slug: 'web-development', description: 'Articles about web development technologies and best practices' },
        { id: 2, name: 'JavaScript', slug: 'javascript', description: 'JavaScript tutorials, tips, and advanced techniques' },
        { id: 3, name: 'Node.js', slug: 'nodejs', description: 'Server-side JavaScript with Node.js' }
    ]
};

// Helper functions
const getPostsByCategory = (categoryId) => {
    return blogData.posts.filter(post => post.categoryId === categoryId && post.published);
};

const getPostsByTag = (tag) => {
    return blogData.posts.filter(post => post.tags.includes(tag) && post.published);
};

const getFeaturedPosts = () => {
    return blogData.posts.filter(post => post.featured && post.published);
};

const getPopularPosts = (limit = 5) => {
    return blogData.posts
        .filter(post => post.published)
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
};

// Routes
app.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = config.postsPerPage;
    const offset = (page - 1) * limit;
    
    const publishedPosts = blogData.posts.filter(post => post.published);
    const totalPosts = publishedPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    
    const posts = publishedPosts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(offset, offset + limit);
    
    const featuredPosts = getFeaturedPosts();
    const popularPosts = getPopularPosts(3);
    
    res.render('blog/index', {
        title: 'Template Engine Blog',
        posts,
        featuredPosts,
        popularPosts,
        authors: blogData.authors,
        categories: blogData.categories,
        pagination: {
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            nextPage: page + 1,
            prevPage: page - 1
        },
        templateEngine: config.templateEngine
    });
});

app.get('/post/:slug', (req, res) => {
    const post = blogData.posts.find(p => p.slug === req.params.slug && p.published);
    
    if (!post) {
        return res.status(404).render('error', {
            title: 'Post Not Found',
            error: 'The requested blog post could not be found.',
            statusCode: 404
        });
    }
    
    // Increment views
    post.views++;
    
    const author = blogData.authors.find(a => a.id === post.authorId);
    const category = blogData.categories.find(c => c.id === post.categoryId);
    const relatedPosts = getPostsByCategory(post.categoryId)
        .filter(p => p.id !== post.id)
        .slice(0, 3);
    
    res.render('blog/post', {
        title: post.title,
        post,
        author,
        category,
        relatedPosts,
        authors: blogData.authors
    });
});

app.get('/category/:slug', (req, res) => {
    const category = blogData.categories.find(c => c.slug === req.params.slug);
    
    if (!category) {
        return res.status(404).render('error', {
            title: 'Category Not Found',
            error: 'The requested category could not be found.',
            statusCode: 404
        });
    }
    
    const posts = getPostsByCategory(category.id);
    
    res.render('blog/category', {
        title: `Category: ${category.name}`,
        category,
        posts,
        authors: blogData.authors
    });
});

app.get('/tag/:tag', (req, res) => {
    const tag = req.params.tag;
    const posts = getPostsByTag(tag);
    
    res.render('blog/tag', {
        title: `Tag: ${tag}`,
        tag,
        posts,
        authors: blogData.authors
    });
});

app.get('/author/:id', (req, res) => {
    const authorId = parseInt(req.params.id);
    const author = blogData.authors.find(a => a.id === authorId);
    
    if (!author) {
        return res.status(404).render('error', {
            title: 'Author Not Found',
            error: 'The requested author could not be found.',
            statusCode: 404
        });
    }
    
    const posts = blogData.posts.filter(p => p.authorId === authorId && p.published);
    
    res.render('blog/author', {
        title: `Author: ${author.name}`,
        author,
        posts
    });
});

// API endpoints for AJAX requests
app.get('/api/posts/search', (req, res) => {
    const { q, category, tag } = req.query;
    let posts = blogData.posts.filter(post => post.published);
    
    if (q) {
        const query = q.toLowerCase();
        posts = posts.filter(post => 
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query)
        );
    }
    
    if (category) {
        const categoryId = parseInt(category);
        posts = posts.filter(post => post.categoryId === categoryId);
    }
    
    if (tag) {
        posts = posts.filter(post => post.tags.includes(tag));
    }
    
    res.json({
        success: true,
        data: posts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            author: blogData.authors.find(a => a.id === post.authorId)?.name,
            category: blogData.categories.find(c => c.id === post.categoryId)?.name,
            createdAt: post.createdAt,
            views: post.views,
            likes: post.likes
        })),
        count: posts.length
    });
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        error: 'The requested page could not be found.',
        statusCode: 404
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        title: 'Server Error',
        error: process.env.NODE_ENV === 'production' 
            ? 'An internal server error occurred.' 
            : err.message,
        statusCode: 500
    });
});

app.listen(config.port, () => {
    console.log(`🚀 Blog Server running on http://localhost:${config.port}`);
    console.log(`📝 Template Engine: ${config.templateEngine.toUpperCase()}`);
    console.log(`📚 Total Posts: ${blogData.posts.length}`);
});

module.exports = app;
```

## Best Practices

### 1. Choose the Right Template Engine

**Use EJS when**:
- Team is familiar with HTML and JavaScript
- Need quick setup and minimal learning curve
- Working with existing HTML templates
- Prefer explicit syntax

**Use Pug when**:
- Want clean, concise syntax
- Need powerful features like mixins and inheritance
- Building new projects from scratch
- Team values code brevity

### 2. Organize Templates Effectively

```
views/
├── layouts/
│   ├── main.ejs
│   └── admin.ejs
├── partials/
│   ├── header.ejs
│   ├── footer.ejs
│   └── navigation.ejs
├── pages/
│   ├── home.ejs
│   ├── about.ejs
│   └── contact.ejs
└── components/
    ├── post-card.ejs
    └── user-profile.ejs
```

### 3. Security Considerations

```javascript
// Always escape user input
<%= userInput %> // Safe - automatically escaped
<%- userInput %> // Dangerous - unescaped

// Validate data before rendering
const sanitizeHtml = require('sanitize-html');
app.locals.sanitize = (html) => sanitizeHtml(html);
```

### 4. Performance Optimization

```javascript
// Enable template caching in production
if (process.env.NODE_ENV === 'production') {
    app.set('view cache', true);
}

// Precompile templates
const ejs = require('ejs');
const template = ejs.compile(templateString, { cache: true });
```

### 5. Error Handling

```javascript
// Graceful error handling in templates
<% try { %>
    <%= user.profile.name %>
<% } catch (error) { %>
    <span class="text-muted">Name not available</span>
<% } %>
```

## Summary

Template engines are essential tools for server-side rendering:

**Key Benefits**:
- **Dynamic Content**: Inject data into static templates
- **Code Reusability**: Create layouts, partials, and components
- **Separation of Concerns**: Keep presentation separate from logic
- **Security**: Automatic escaping prevents XSS attacks

**EJS Advantages**:
- Familiar JavaScript syntax
- Easy learning curve
- Good performance
- Extensive ecosystem

**Pug Advantages**:
- Clean, concise syntax
- Powerful features (mixins, inheritance)
- Built-in filters and helpers
- Excellent for new projects

**Best Practices**:
- Choose the right engine for your team and project
- Organize templates logically
- Always escape user input
- Enable caching in production
- Handle errors gracefully

Template engines enable you to build dynamic, maintainable web applications with server-side rendering capabilities. Next, we'll explore RESTful API design principles for building robust web services.