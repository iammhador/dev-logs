# Conventional Commits

Conventional Commits is a specification for adding human and machine-readable meaning to commit messages. It provides an easy set of rules for creating an explicit commit history, making it easier to write automated tools on top of.

## What are Conventional Commits?

### Format Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Basic Examples

```bash
# Simple feature addition
feat: add user authentication

# Bug fix with scope
fix(auth): resolve login redirect issue

# Breaking change
feat!: change API response format

# With body and footer
feat(api): add user profile endpoint

Implement GET /api/users/:id endpoint to retrieve user profile information.
Includes validation for user ID and proper error handling.

Closes #123
```

## Commit Types

### Primary Types

| Type | Description | Example |
|------|-------------|----------|
| `feat` | New feature | `feat: add shopping cart` |
| `fix` | Bug fix | `fix: resolve payment processing error` |
| `docs` | Documentation | `docs: update API documentation` |
| `style` | Code style changes | `style: fix indentation in components` |
| `refactor` | Code refactoring | `refactor: extract validation logic` |
| `test` | Adding/updating tests | `test: add unit tests for calculator` |
| `chore` | Maintenance tasks | `chore: update dependencies` |

### Additional Types

| Type | Description | Example |
|------|-------------|----------|
| `perf` | Performance improvements | `perf: optimize database queries` |
| `ci` | CI/CD changes | `ci: add automated testing workflow` |
| `build` | Build system changes | `build: update webpack configuration` |
| `revert` | Revert previous commit | `revert: undo feature X implementation` |

## Practical Examples

### Setting Up a Project

```bash
# Create example project
mkdir conventional-commits-demo
cd conventional-commits-demo
git init

# Initial commit
echo "# Conventional Commits Demo" > README.md
git add README.md
git commit -m "chore: initial project setup"

# Add package.json
cat > package.json << EOF
{
  "name": "conventional-commits-demo",
  "version": "1.0.0",
  "description": "Demo project for conventional commits",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "node test.js",
    "lint": "eslint ."
  },
  "keywords": ["demo", "conventional-commits"],
  "author": "Your Name",
  "license": "MIT"
}
EOF

git add package.json
git commit -m "feat: add package.json with project configuration"
```

### Feature Development Examples

```bash
# Add main application file
cat > index.js << EOF
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
EOF

git add index.js
git commit -m "feat(server): add basic Express.js server

Implement basic HTTP server with Express.js framework.
Includes health check endpoint and configurable port.

Closes #1"

# Add user routes
mkdir routes
cat > routes/users.js << EOF
const express = require('express');
const router = express.Router();

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /users/:id
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

module.exports = router;
EOF

git add routes/
git commit -m "feat(api): add user management endpoints

Implement REST API endpoints for user operations:
- GET /users - list all users
- GET /users/:id - get user by ID

Includes proper error handling for non-existent users."

# Update main server to use routes
cat > index.js << EOF
const express = require('express');
const userRoutes = require('./routes/users');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server',
    version: '1.0.0',
    endpoints: {
      users: '/api/users'
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
EOF

git add index.js
git commit -m "feat(server): integrate user routes with main application

Connect user management routes to the main Express application.
Update root endpoint to provide API documentation."
```

### Bug Fix Examples

```bash
# Fix a bug in user route
cat > routes/users.js << EOF
const express = require('express');
const router = express.Router();

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /users/:id
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Fix: Add validation for invalid ID
  if (isNaN(userId) || userId < 1) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

module.exports = router;
EOF

git add routes/users.js
git commit -m "fix(api): add validation for user ID parameter

Resolve issue where invalid user IDs (non-numeric, negative) 
were not properly validated, causing unexpected behavior.

Fixes #15"
```

### Documentation Examples

```bash
# Add API documentation
cat > API.md << EOF
# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### GET /
Returns API information and available endpoints.

### GET /api/users
Returns list of all users.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

### GET /api/users/:id
Returns specific user by ID.

**Parameters:**
- `id` (number): User ID

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400`: Invalid user ID
- `404`: User not found
EOF

git add API.md
git commit -m "docs: add comprehensive API documentation

Include endpoint descriptions, request/response examples,
and error handling documentation for the user API."

# Update README
cat > README.md << EOF
# Conventional Commits Demo

A demonstration project showcasing conventional commit practices
with a simple Express.js API.

## Features

- RESTful user API
- Express.js server
- Conventional commit history
- Comprehensive documentation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Access the API at http://localhost:3000

## API Documentation

See [API.md](API.md) for detailed endpoint documentation.

## Development

This project follows [Conventional Commits](https://www.conventionalcommits.org/)
specification for commit messages.
EOF

git add README.md
git commit -m "docs(readme): enhance project documentation

Add comprehensive setup instructions, feature list,
and development guidelines to improve project onboarding."
```

### Testing Examples

```bash
# Add test file
cat > test.js << EOF
const request = require('supertest');
const app = require('./index');

function runTests() {
  console.log('🧪 Running API tests...');
  
  // Note: This is a simplified test example
  // In real projects, use proper testing frameworks like Jest or Mocha
  
  const tests = [
    {
      name: 'GET / should return API info',
      test: async () => {
        // Simplified test - in real scenario use supertest
        console.log('✓ Root endpoint test passed');
        return true;
      }
    },
    {
      name: 'GET /api/users should return users array',
      test: async () => {
        console.log('✓ Users endpoint test passed');
        return true;
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(async ({ name, test }) => {
    try {
      await test();
      console.log(`✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`✗ ${name}: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
EOF

git add test.js
git commit -m "test(api): add basic API endpoint tests

Implement test suite for API endpoints including:
- Root endpoint validation
- User endpoints testing
- Test result reporting

Sets foundation for comprehensive test coverage."
```

### Refactoring Examples

```bash
# Extract configuration
mkdir config
cat > config/server.js << EOF
module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  api: {
    version: '1.0.0',
    prefix: '/api'
  }
};
EOF

# Update main server file
cat > index.js << EOF
const express = require('express');
const config = require('./config/server');
const userRoutes = require('./routes/users');
const app = express();

app.use(express.json());
app.use(`${config.api.prefix}/users`, userRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Server',
    version: config.api.version,
    environment: config.env,
    endpoints: {
      users: `${config.api.prefix}/users`
    }
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.env} mode`);
});

module.exports = app;
EOF

git add config/ index.js
git commit -m "refactor(config): extract server configuration

Move server configuration to dedicated config module
for better maintainability and environment management.

Improves code organization and makes configuration
easier to modify across different environments."
```

### Performance Examples

```bash
# Add caching middleware
cat > middleware/cache.js << EOF
const cache = new Map();

function cacheMiddleware(duration = 300000) { // 5 minutes default
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      console.log(`Cache hit for ${key}`);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data: data,
        timestamp: Date.now()
      });
      console.log(`Cache set for ${key}`);
      return originalJson.call(this, data);
    };
    
    next();
  };
}

module.exports = cacheMiddleware;
EOF

# Update user routes to use caching
cat > routes/users.js << EOF
const express = require('express');
const cacheMiddleware = require('../middleware/cache');
const router = express.Router();

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /users with caching
router.get('/', cacheMiddleware(60000), (req, res) => {
  res.json(users);
});

// GET /users/:id
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId) || userId < 1) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

module.exports = router;
EOF

git add middleware/ routes/users.js
git commit -m "perf(api): add response caching middleware

Implement in-memory caching for user list endpoint
to reduce response time for frequently accessed data.

Improves API performance by caching responses for 1 minute,
reducing unnecessary data processing on repeated requests."
```

### Breaking Changes

```bash
# Make a breaking change to API response format
cat > routes/users.js << EOF
const express = require('express');
const cacheMiddleware = require('../middleware/cache');
const router = express.Router();

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02' }
];

// GET /users with new response format
router.get('/', cacheMiddleware(60000), (req, res) => {
  res.json({
    success: true,
    data: users,
    meta: {
      total: users.length,
      version: '2.0.0'
    }
  });
});

// GET /users/:id with new response format
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId) || userId < 1) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid user ID' 
    });
  }
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: 'User not found' 
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

module.exports = router;
EOF

git add routes/users.js
git commit -m "feat!: change API response format to include metadata

BREAKING CHANGE: API responses now include success flag and metadata.

Before:
```json
[{"id": 1, "name": "John"}]
```

After:
```json
{
  "success": true,
  "data": [{"id": 1, "name": "John"}],
  "meta": {"total": 1, "version": "2.0.0"}
}
```

This change improves API consistency and provides
additional metadata for client applications.

Migration guide available in MIGRATION.md"
```

## Advanced Conventional Commits

### Scopes

Scopes provide additional context about the change:

```bash
# Component-based scopes
feat(auth): add OAuth2 integration
fix(payment): resolve credit card validation
test(user): add profile update tests

# Layer-based scopes
feat(api): add new endpoint
fix(ui): resolve button alignment
perf(db): optimize query performance

# Feature-based scopes
feat(shopping-cart): add item quantity controls
fix(checkout): resolve payment processing error
```

### Multiple Scopes

```bash
# Multiple related scopes
feat(auth,api): add JWT token validation
fix(ui,ux): improve form validation feedback
refactor(db,api): optimize user data queries
```

### Body and Footer

```bash
# Detailed commit with body and footer
git commit -m "feat(api): add user profile image upload

Implement multipart form data handling for user profile images.
Includes image validation, resizing, and secure storage.

Supported formats: JPEG, PNG, WebP
Maximum file size: 5MB
Automatic resizing to 300x300 pixels

Closes #45
Reviewed-by: @johndoe
Tested-by: @janedoe"
```

### Co-authored Commits

```bash
# Pair programming commit
git commit -m "feat(search): implement full-text search functionality

Add Elasticsearch integration for advanced search capabilities.
Includes fuzzy matching, filters, and result highlighting.

Co-authored-by: Jane Doe <jane@example.com>
Co-authored-by: Bob Smith <bob@example.com>"
```

## Automation and Tooling

### Commitizen Setup

```bash
# Install commitizen globally
npm install -g commitizen
npm install -g cz-conventional-changelog

# Configure commitizen
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc

# Or configure per project
npm install --save-dev commitizen cz-conventional-changelog
echo '{ "path": "./node_modules/cz-conventional-changelog" }' > .czrc

# Add to package.json
cat > package.json << EOF
{
  "name": "conventional-commits-demo",
  "version": "1.0.0",
  "scripts": {
    "commit": "cz"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  },
  "devDependencies": {
    "commitizen": "^4.3.0",
    "cz-conventional-changelog": "^3.3.0"
  }
}
EOF

# Use commitizen for commits
npm run commit
# or
git cz
```

### Commit Linting

```bash
# Install commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# Create commitlint config
cat > .commitlintrc.js << EOF
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'revert'
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72]
  }
};
EOF

# Add to package.json scripts
"scripts": {
  "commitlint": "commitlint --from HEAD~1 --to HEAD --verbose"
}

# Test commitlint
echo "invalid commit message" | npx commitlint
```

### Husky Integration

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add commit-msg hook
npx husky add .husky/commit-msg 'npx commitlint --edit $1'

# Add prepare-commit-msg hook for commitizen
npx husky add .husky/prepare-commit-msg 'exec < /dev/tty && node_modules/.bin/cz --hook || true'

# Update package.json
"scripts": {
  "prepare": "husky install"
}
```

### Semantic Release

```bash
# Install semantic-release
npm install --save-dev semantic-release

# Create release config
cat > .releaserc.json << EOF
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github"
  ]
}
EOF

# Add to package.json
"scripts": {
  "semantic-release": "semantic-release"
}
```

## Best Practices

### 1. Commit Message Guidelines

```bash
# DO: Clear, concise, imperative mood
feat: add user authentication
fix: resolve memory leak in parser
docs: update API documentation

# DON'T: Unclear, past tense, too verbose
Added some stuff
Fixed a bug
Updated documentation and also refactored some code and fixed tests
```

### 2. Scope Usage

```bash
# DO: Consistent, meaningful scopes
feat(auth): add login functionality
feat(auth): add logout functionality
fix(auth): resolve token expiration

# DON'T: Inconsistent or meaningless scopes
feat(stuff): add things
fix(misc): fix issue
feat(component1): add feature
```

### 3. Breaking Changes

```bash
# DO: Clear breaking change indication
feat!: change API response format
feat(api)!: remove deprecated endpoints

# With detailed explanation
feat!: change user authentication method

BREAKING CHANGE: Replace session-based auth with JWT tokens.
Clients must now include Authorization header with Bearer token.

Migration:
- Update client to use JWT tokens
- Remove session cookie handling
- Add Authorization header to requests
```

### 4. Commit Frequency

```bash
# DO: Logical, atomic commits
feat: add user model
feat: add user controller
feat: add user routes
test: add user API tests

# DON'T: Massive commits or micro-commits
feat: add entire user management system
fix: typo
fix: another typo
fix: one more typo
```

## Integration with Development Workflow

### Feature Branch Workflow

```bash
# Start feature branch
git checkout -b feat/user-authentication

# Make atomic commits
git commit -m "feat(auth): add user model with validation"
git commit -m "feat(auth): implement password hashing"
git commit -m "feat(auth): add login endpoint"
git commit -m "test(auth): add authentication tests"
git commit -m "docs(auth): add authentication API docs"

# Squash if needed before merge
git rebase -i main
```

### Release Workflow

```bash
# Prepare release branch
git checkout -b release/v2.0.0

# Update version and changelog
git commit -m "chore(release): bump version to 2.0.0"

# Merge to main
git checkout main
git merge release/v2.0.0
git tag v2.0.0

# Deploy
git commit -m "ci: deploy version 2.0.0 to production"
```

## Troubleshooting

### Common Issues

1. **Commitlint fails on merge commits**
   ```bash
   # Configure commitlint to ignore merge commits
   echo "extends: ['@commitlint/config-conventional']
rules: {
  'subject-case': [0]
}" > .commitlintrc.yml
   ```

2. **Commitizen not working**
   ```bash
   # Check configuration
   cat .czrc
   
   # Reinstall if needed
   npm uninstall -g commitizen
   npm install -g commitizen
   ```

3. **Semantic release not creating releases**
   ```bash
   # Check commit format
   git log --oneline
   
   # Verify configuration
   cat .releaserc.json
   ```

## Quick Reference

```bash
# Commit types
feat     # New feature
fix      # Bug fix
docs     # Documentation
style    # Code style (formatting, etc.)
refactor # Code refactoring
test     # Adding/updating tests
chore    # Maintenance tasks
perf     # Performance improvements
ci       # CI/CD changes
build    # Build system changes
revert   # Revert previous commit

# Format
type(scope): description

# Breaking changes
type!: description
type(scope)!: description

# Tools
npx commitizen                    # Interactive commit
npx commitlint --from HEAD~1      # Lint last commit
npx semantic-release              # Create release

# Examples
feat: add shopping cart
fix(auth): resolve login issue
docs: update README
feat!: change API response format
```

---

**Previous:** [Git Hooks](17-git-hooks.md)  
**Next:** [GitHub CLI](19-github-cli.md)