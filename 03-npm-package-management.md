# NPM: Node Package Manager Fundamentals

## Overview

npm (Node Package Manager) is the default package manager for Node.js and the world's largest software registry. It allows you to install, share, and manage dependencies for your Node.js projects. Understanding npm is crucial for modern JavaScript development.

## Key Concepts

### What is npm?

npm serves three main purposes:
1. **Package Registry**: A massive database of JavaScript packages
2. **Command Line Tool**: For installing and managing packages
3. **Package Manager**: Handles dependencies and versions

### package.json

The `package.json` file is the heart of any Node.js project. It contains:
- Project metadata
- Dependencies
- Scripts
- Configuration

### Semantic Versioning (SemVer)

npm uses semantic versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Dependencies vs DevDependencies

- **dependencies**: Required for production
- **devDependencies**: Only needed for development

## Example Code

### Initializing a New Project

```bash
# Create a new directory
mkdir my-node-project
cd my-node-project

# Initialize npm (interactive)
npm init

# Initialize with defaults
npm init -y
# or
npm init --yes
```

### Sample package.json

```json
{
  "name": "my-node-project",
  "version": "1.0.0",
  "description": "A sample Node.js project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["node", "javascript", "tutorial"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}
}
```

### Installing Packages

```bash
# Install a package and add to dependencies
npm install express
# or
npm i express

# Install multiple packages
npm install express mongoose dotenv

# Install as dev dependency
npm install --save-dev nodemon
# or
npm i -D nodemon

# Install globally
npm install -g nodemon

# Install specific version
npm install express@4.18.0

# Install from GitHub
npm install user/repo
```

### Version Specifiers

```json
{
  "dependencies": {
    "express": "^4.18.0",     // Compatible version (4.x.x)
    "mongoose": "~7.0.0",     // Approximately equivalent (7.0.x)
    "lodash": "4.17.21",      // Exact version
    "moment": ">=2.29.0",     // Greater than or equal
    "axios": "<1.0.0",        // Less than
    "dotenv": "*"             // Any version (not recommended)
  }
}
```

### Package Management Commands

```bash
# List installed packages
npm list
npm ls

# List global packages
npm list -g --depth=0

# Check for outdated packages
npm outdated

# Update packages
npm update
npm update express

# Uninstall packages
npm uninstall express
npm remove express
npm rm express

# Uninstall global package
npm uninstall -g nodemon

# Clean npm cache
npm cache clean --force
```

### Working with Scripts

Create an `index.js` file:

```javascript
// index.js
console.log('Hello from npm scripts!');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Simple HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from Node.js server!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "prod": "NODE_ENV=production node index.js",
    "test": "echo \"Running tests...\" && node test.js",
    "build": "echo \"Building project...\"",
    "clean": "rm -rf node_modules package-lock.json",
    "reinstall": "npm run clean && npm install",
    "lint": "echo \"Linting code...\"",
    "prestart": "echo \"Pre-start hook\"",
    "poststart": "echo \"Post-start hook\""
  }
}
```

Run scripts:

```bash
# Run scripts
npm start
npm run dev
npm test
npm run build

# List available scripts
npm run
```

### Creating a Complete Project Setup

```bash
# Initialize project
mkdir todo-app
cd todo-app
npm init -y

# Install dependencies
npm install express cors helmet morgan
npm install -D nodemon jest supertest
```

Update the `package.json`:

```json
{
  "name": "todo-app",
  "version": "1.0.0",
  "description": "A simple todo application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "echo \"Add linting here\"",
    "build": "echo \"Build process\""
  },
  "keywords": ["todo", "express", "api"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

Create `server.js`:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// In-memory storage for todos
let todos = [
    { id: 1, text: 'Learn Node.js', completed: false },
    { id: 2, text: 'Build an API', completed: false }
];

// Routes
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    const newTodo = {
        id: todos.length + 1,
        text,
        completed: false
    };
    
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API available at http://localhost:${PORT}/api/todos`);
});

module.exports = app;
```

## Real-World Use Case

### Package.json for a Production App

```json
{
  "name": "production-api",
  "version": "2.1.0",
  "description": "Production-ready REST API",
  "main": "src/server.js",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "build": "npm run lint && npm run test",
    "precommit": "npm run lint && npm run test",
    "docker:build": "docker build -t production-api .",
    "docker:run": "docker run -p 3000:3000 production-api"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.4.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.1",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "joi": "^17.9.2",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/username/production-api.git"
  },
  "keywords": ["api", "express", "mongodb", "jwt"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

### NPM Configuration

Create `.npmrc` file for project-specific npm configuration:

```bash
# .npmrc
registry=https://registry.npmjs.org/
save-exact=true
engine-strict=true
fund=false
audit-level=moderate
```

### Security Best Practices

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Install specific security updates
npm update --depth 3

# Check package info before installing
npm info express
npm view express versions --json
```

## Best Practices

### 1. Lock File Management
```bash
# Always commit package-lock.json
git add package-lock.json

# Use npm ci in production/CI
npm ci  # Faster, reliable, reproducible builds
```

### 2. Version Management
```bash
# Bump version
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.0 -> 1.1.0
npm version major   # 1.0.0 -> 2.0.0

# Pre-release versions
npm version prerelease  # 1.0.0 -> 1.0.1-0
```

### 3. Script Organization
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:watch": "jest --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "build": "npm run lint && npm run test",
    "clean": "rm -rf node_modules dist",
    "reset": "npm run clean && npm install"
  }
}
```

### 4. Environment-Specific Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "start:dev": "NODE_ENV=development nodemon server.js",
    "start:prod": "NODE_ENV=production node server.js",
    "start:test": "NODE_ENV=test node server.js"
  }
}
```

### 5. Useful npm Commands
```bash
# Show npm configuration
npm config list

# Set npm configuration
npm config set registry https://registry.npmjs.org/

# Show package information
npm info package-name

# Search for packages
npm search express

# Show dependency tree
npm ls --depth=0

# Find duplicate packages
npm ls --depth=0 | grep -E '^[├└]'
```

## Summary

npm is essential for Node.js development, providing:

- **Package Management**: Install, update, and remove dependencies
- **Version Control**: Semantic versioning and lock files for reproducible builds
- **Script Runner**: Automate common development tasks
- **Registry Access**: Access to millions of open-source packages

Key commands to remember:
```bash
npm init -y              # Initialize project
npm install package      # Install dependency
npm install -D package   # Install dev dependency
npm run script-name      # Run npm script
npm audit               # Check security vulnerabilities
npm outdated            # Check for package updates
```

Mastering npm will significantly improve your development workflow and project management. Next, we'll explore Node.js core modules that provide built-in functionality for file system operations, HTTP servers, and more.