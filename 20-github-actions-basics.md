# GitHub Actions Basics

GitHub Actions is a powerful CI/CD platform that allows you to automate your software development workflows directly in your GitHub repository. You can build, test, and deploy your code right from GitHub.

## Understanding GitHub Actions

### Key Concepts

- **Workflow**: Automated process defined by a YAML file
- **Event**: Specific activity that triggers a workflow
- **Job**: Set of steps that execute on the same runner
- **Step**: Individual task that can run commands or actions
- **Action**: Reusable unit of code
- **Runner**: Server that runs your workflows

### Workflow Structure

```yaml
name: Workflow Name
on: [events]
jobs:
  job-name:
    runs-on: runner-type
    steps:
      - name: Step name
        uses: action@version
      - name: Another step
        run: command
```

## Setting Up Your First Workflow

### Basic Project Setup

```bash
# Create example project
mkdir github-actions-demo
cd github-actions-demo
git init

# Create package.json
cat > package.json << EOF
{
  "name": "github-actions-demo",
  "version": "1.0.0",
  "description": "Demo project for GitHub Actions",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "node test.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "build": "echo 'Building application...'"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.0.0"
  }
}
EOF

# Create main application
cat > index.js << EOF
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Hello from GitHub Actions!',
    timestamp: new Date().toISOString()
  }));
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
EOF

# Create test file
cat > test.js << EOF
const http = require('http');
const server = require('./index');

function runTests() {
  console.log('🧪 Running tests...');
  
  let passed = 0;
  let failed = 0;
  
  function test(name, condition) {
    if (condition) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  }
  
  // Basic tests
  test('Server module exports', typeof server === 'object');
  test('Environment variables', process.env.NODE_ENV !== undefined || true);
  test('Package.json exists', require('./package.json').name === 'github-actions-demo');
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
  
  console.log('✅ All tests passed!');
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
EOF

# Create ESLint config
cat > .eslintrc.js << EOF
module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'error',
  },
};
EOF

# Create Prettier config
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80
}
EOF

# Initial commit
git add .
git commit -m "feat: initial project setup"
```

### Creating Workflows Directory

```bash
# Create GitHub Actions directory
mkdir -p .github/workflows

# This is where all workflow files will be stored
# Files must have .yml or .yaml extension
```

## Basic CI Workflow

### Simple CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

# Trigger events
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# Jobs
jobs:
  test:
    name: Test Application
    runs-on: ubuntu-latest
    
    steps:
      # Checkout code
      - name: Checkout code
        uses: actions/checkout@v4
      
      # Setup Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      # Install dependencies
      - name: Install dependencies
        run: npm ci
      
      # Run linting
      - name: Run ESLint
        run: npm run lint
      
      # Run tests
      - name: Run tests
        run: npm test
      
      # Check formatting
      - name: Check Prettier formatting
        run: npx prettier --check .
```

### Multi-Job Workflow

```yaml
# .github/workflows/comprehensive-ci.yml
name: Comprehensive CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Linting job
  lint:
    name: Code Linting
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Check Prettier
        run: npx prettier --check .
  
  # Testing job
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
  
  # Build job
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, test]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: dist/
          retention-days: 30
```

## Workflow Triggers

### Event Types

```yaml
# Push events
on:
  push:
    branches: [ main, develop ]
    tags: [ 'v*' ]
    paths:
      - 'src/**'
      - '!docs/**'

# Pull request events
on:
  pull_request:
    branches: [ main ]
    types: [opened, synchronize, reopened]

# Scheduled events (cron)
on:
  schedule:
    - cron: '0 2 * * 1-5'  # 2 AM, Monday to Friday

# Manual trigger
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

# Multiple events
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  release:
    types: [published]
```

### Conditional Execution

```yaml
# .github/workflows/conditional.yml
name: Conditional Workflow

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Only run on main branch
      - name: Deploy to staging
        if: github.ref == 'refs/heads/main'
        run: echo "Deploying to staging"
      
      # Only run on pull requests
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        run: echo "This is a pull request"
      
      # Only run if specific files changed
      - name: Check for changes
        uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            src:
              - 'src/**'
            docs:
              - 'docs/**'
      
      - name: Run tests
        if: steps.changes.outputs.src == 'true'
        run: npm test
```

## Environment Variables and Secrets

### Using Environment Variables

```yaml
# .github/workflows/environment.yml
name: Environment Variables

on: [push]

env:
  NODE_ENV: production
  API_URL: https://api.example.com

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DEPLOY_ENV: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Print environment
        run: |
          echo "Node environment: $NODE_ENV"
          echo "API URL: $API_URL"
          echo "Deploy environment: $DEPLOY_ENV"
          echo "GitHub ref: $GITHUB_REF"
          echo "GitHub actor: $GITHUB_ACTOR"
      
      - name: Set dynamic environment
        run: |
          if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
          else
            echo "ENVIRONMENT=development" >> $GITHUB_ENV
          fi
      
      - name: Use dynamic environment
        run: echo "Deploying to $ENVIRONMENT"
```

### Managing Secrets

```yaml
# .github/workflows/secrets.yml
name: Using Secrets

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Using repository secrets
      - name: Deploy to server
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_HOST: ${{ secrets.SERVER_HOST }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Deploying with secrets..."
          # Never echo secrets directly!
          echo "Host: $SERVER_HOST"
      
      # Using secrets in actions
      - name: Deploy to AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
```

## Common Actions and Use Cases

### Code Quality Checks

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for better analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # ESLint with annotations
      - name: Run ESLint
        run: |
          npx eslint . --format=@microsoft/eslint-formatter-sarif --output-file eslint-results.sarif
        continue-on-error: true
      
      - name: Upload ESLint results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: eslint-results.sarif
        if: always()
      
      # Security audit
      - name: Run security audit
        run: npm audit --audit-level=high
      
      # Check for outdated dependencies
      - name: Check outdated packages
        run: npm outdated || true
      
      # License check
      - name: Check licenses
        run: |
          npx license-checker --summary
```

### Testing with Coverage

```yaml
# .github/workflows/test-coverage.yml
name: Test Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      # Run tests with coverage
      - name: Run tests with coverage
        run: |
          npm test -- --coverage
          # For Jest: npm test -- --coverage --coverageReporters=lcov
      
      # Upload coverage to Codecov
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
      
      # Comment coverage on PR
      - name: Coverage comment
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

### Docker Build and Push

```yaml
# .github/workflows/docker.yml
name: Docker Build

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      # Setup Docker Buildx
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      # Login to registry
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      # Extract metadata
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      # Build and push
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Deployment Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      # Deploy to staging
      - name: Deploy to staging
        if: github.event.inputs.environment == 'staging' || github.ref == 'refs/heads/main'
        run: |
          echo "Deploying to staging environment"
          # Add your staging deployment commands here
      
      # Deploy to production (with approval)
      - name: Deploy to production
        if: github.event.inputs.environment == 'production'
        run: |
          echo "Deploying to production environment"
          # Add your production deployment commands here
      
      # Notify deployment
      - name: Notify deployment
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Advanced Features

### Matrix Builds

```yaml
# .github/workflows/matrix.yml
name: Matrix Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        include:
          - os: ubuntu-latest
            node-version: 20
            experimental: true
        exclude:
          - os: windows-latest
            node-version: 16
      fail-fast: false
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        continue-on-error: ${{ matrix.experimental || false }}
```

### Reusable Workflows

```yaml
# .github/workflows/reusable-ci.yml
name: Reusable CI

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '18'
      environment:
        required: false
        type: string
        default: 'development'
    secrets:
      NPM_TOKEN:
        required: false
    outputs:
      build-status:
        description: "Build status"
        value: ${{ jobs.ci.outputs.status }}

jobs:
  ci:
    runs-on: ubuntu-latest
    outputs:
      status: ${{ steps.build.outcome }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Run tests
        run: npm test
      
      - name: Build
        id: build
        run: npm run build
        env:
          NODE_ENV: ${{ inputs.environment }}
```

```yaml
# .github/workflows/use-reusable.yml
name: Use Reusable Workflow

on: [push]

jobs:
  call-reusable:
    uses: ./.github/workflows/reusable-ci.yml
    with:
      node-version: '20'
      environment: 'production'
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  
  deploy:
    needs: call-reusable
    runs-on: ubuntu-latest
    if: needs.call-reusable.outputs.build-status == 'success'
    
    steps:
      - name: Deploy
        run: echo "Deploying after successful build"
```

### Custom Actions

```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
description: 'Setup Node.js project with caching'
inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '18'
  cache-dependency-path:
    description: 'Path to package-lock.json'
    required: false
    default: 'package-lock.json'
outputs:
  cache-hit:
    description: 'Whether cache was hit'
    value: ${{ steps.cache.outputs.cache-hit }}

runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
    
    - name: Cache dependencies
      id: cache
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles(inputs.cache-dependency-path) }}
        restore-keys: |
          ${{ runner.os }}-node-
    
    - name: Install dependencies
      shell: bash
      run: npm ci
```

## Monitoring and Debugging

### Workflow Status Checks

```yaml
# .github/workflows/status-check.yml
name: Status Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Check workflow status
        run: |
          echo "Workflow: $GITHUB_WORKFLOW"
          echo "Run ID: $GITHUB_RUN_ID"
          echo "Run Number: $GITHUB_RUN_NUMBER"
          echo "Actor: $GITHUB_ACTOR"
          echo "Repository: $GITHUB_REPOSITORY"
          echo "Event: $GITHUB_EVENT_NAME"
          echo "Ref: $GITHUB_REF"
          echo "SHA: $GITHUB_SHA"
      
      - name: Debug context
        env:
          GITHUB_CONTEXT: ${{ toJson(github) }}
        run: echo "$GITHUB_CONTEXT"
      
      - name: Check previous jobs
        if: always()
        run: |
          echo "Job status: ${{ job.status }}"
          echo "Steps context: ${{ toJson(steps) }}"
```

### Error Handling

```yaml
# .github/workflows/error-handling.yml
name: Error Handling

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      # Continue on error
      - name: Run tests (continue on error)
        run: npm test
        continue-on-error: true
      
      # Conditional step based on previous step
      - name: Handle test failure
        if: failure()
        run: |
          echo "Tests failed, but continuing..."
          # Send notification, create issue, etc.
      
      # Always run cleanup
      - name: Cleanup
        if: always()
        run: |
          echo "Cleaning up..."
          # Cleanup commands here
      
      # Timeout for long-running steps
      - name: Long running task
        run: |
          echo "Starting long task..."
          sleep 300  # 5 minutes
        timeout-minutes: 10
```

## Best Practices

### 1. Workflow Organization

```bash
# Organize workflows by purpose
.github/workflows/
├── ci.yml              # Continuous Integration
├── cd.yml              # Continuous Deployment
├── security.yml        # Security scans
├── release.yml         # Release automation
└── maintenance.yml     # Scheduled maintenance
```

### 2. Efficient Caching

```yaml
# Efficient dependency caching
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-deps-

# Cache build outputs
- name: Cache build
  uses: actions/cache@v3
  with:
    path: dist/
    key: ${{ runner.os }}-build-${{ github.sha }}
```

### 3. Security Best Practices

```yaml
# Minimal permissions
permissions:
  contents: read
  pull-requests: write

# Pin action versions
- uses: actions/checkout@v4.1.1  # Pin to specific version
- uses: actions/setup-node@v4.0.0

# Use secrets properly
env:
  API_KEY: ${{ secrets.API_KEY }}  # Good
  # Never: API_KEY: "hardcoded-key"  # Bad

# Validate inputs
- name: Validate input
  run: |
    if [[ ! "${{ github.event.inputs.environment }}" =~ ^(staging|production)$ ]]; then
      echo "Invalid environment"
      exit 1
    fi
```

### 4. Performance Optimization

```yaml
# Use appropriate runners
runs-on: ubuntu-latest  # Fastest for most tasks
# runs-on: windows-latest  # Only when needed
# runs-on: macos-latest    # Only when needed

# Parallel jobs
jobs:
  lint:
    runs-on: ubuntu-latest
    # ...
  
  test:
    runs-on: ubuntu-latest
    # ... runs in parallel with lint
  
  build:
    needs: [lint, test]  # Runs after both complete
    runs-on: ubuntu-latest
    # ...

# Conditional execution
- name: Skip on draft PR
  if: github.event.pull_request.draft == false
  run: npm test
```

## Troubleshooting

### Common Issues

1. **Workflow not triggering**
   ```yaml
   # Check file location: .github/workflows/
   # Check YAML syntax
   # Check branch protection rules
   # Check if workflow is disabled
   ```

2. **Permission denied errors**
   ```yaml
   # Add necessary permissions
   permissions:
     contents: read
     packages: write
     pull-requests: write
   ```

3. **Cache issues**
   ```bash
   # Clear cache via GitHub UI or API
   # Update cache key
   # Check cache path
   ```

4. **Secret not found**
   ```bash
   # Check secret name spelling
   # Verify secret is set in repository/organization
   # Check environment restrictions
   ```

## Quick Reference

```yaml
# Basic workflow structure
name: Workflow Name
on: [push, pull_request]
jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Step name
        run: command

# Common triggers
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  schedule: [{ cron: '0 2 * * *' }]
  workflow_dispatch:

# Environment variables
env:
  NODE_ENV: production
  API_URL: ${{ secrets.API_URL }}

# Conditional execution
if: github.ref == 'refs/heads/main'
if: github.event_name == 'pull_request'
if: success() && github.ref == 'refs/heads/main'

# Matrix strategy
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [16, 18, 20]

# Common actions
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
- uses: actions/cache@v3
- uses: actions/upload-artifact@v4
```

---

**Previous:** [GitHub CLI](19-github-cli.md)  
**Next:** [Clean Git History](21-clean-git-history.md)