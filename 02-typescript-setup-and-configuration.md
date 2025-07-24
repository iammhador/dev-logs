# TypeScript Setup and Configuration

> Complete guide to installing TypeScript, setting up your development environment, and configuring your first project

## Installation Methods

### Global Installation

Install TypeScript globally to use the `tsc` command anywhere:

```bash
# Using npm
npm install -g typescript

# Using yarn
yarn global add typescript

# Using pnpm
pnpm add -g typescript

# Verify installation
tsc --version
```

### Project-Specific Installation (Recommended)

Install TypeScript as a development dependency in your project:

```bash
# Using npm
npm install --save-dev typescript

# Using yarn
yarn add --dev typescript

# Using pnpm
pnpm add -D typescript
```

### Why Project-Specific Installation?
- **Version consistency**: Different projects can use different TypeScript versions
- **Team collaboration**: Everyone uses the same TypeScript version
- **CI/CD compatibility**: Build systems use the exact version specified

## Basic Project Setup

### 1. Initialize Your Project

```bash
# Create project directory
mkdir my-typescript-project
cd my-typescript-project

# Initialize package.json
npm init -y

# Install TypeScript
npm install --save-dev typescript

# Install Node.js types (for Node.js projects)
npm install --save-dev @types/node
```

### 2. Create TypeScript Configuration

```bash
# Generate tsconfig.json
npx tsc --init
```

### 3. Project Structure

```
my-typescript-project/
├── src/
│   ├── index.ts
│   └── utils/
│       └── helpers.ts
├── dist/
├── node_modules/
├── package.json
├── tsconfig.json
└── README.md
```

## TypeScript Configuration (tsconfig.json)

### Basic Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Key Configuration Options

#### Compilation Options

```json
{
  "compilerOptions": {
    // Target JavaScript version
    "target": "ES2020", // ES5, ES6, ES2017, ES2018, ES2019, ES2020, ES2021, ESNext
    
    // Module system
    "module": "commonjs", // commonjs, amd, es6, es2015, es2020, esnext
    
    // Output directory
    "outDir": "./dist",
    
    // Root directory of source files
    "rootDir": "./src",
    
    // Library files to include
    "lib": ["ES2020", "DOM"],
    
    // Module resolution strategy
    "moduleResolution": "node"
  }
}
```

#### Type Checking Options

```json
{
  "compilerOptions": {
    // Enable all strict type checking options
    "strict": true,
    
    // Individual strict options (enabled by "strict")
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

#### Development Options

```json
{
  "compilerOptions": {
    // Generate source maps for debugging
    "sourceMap": true,
    
    // Generate declaration files
    "declaration": true,
    "declarationMap": true,
    
    // Remove comments from output
    "removeComments": false,
    
    // Import helpers from tslib
    "importHelpers": true,
    
    // Enable experimental decorators
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Compilation Commands

### Basic Compilation

```bash
# Compile all files
npx tsc

# Compile specific file
npx tsc src/index.ts

# Compile with custom config
npx tsc --project tsconfig.prod.json
```

### Watch Mode

```bash
# Watch for changes and recompile
npx tsc --watch

# Watch with custom config
npx tsc --watch --project tsconfig.dev.json
```

### Build Scripts

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "build:prod": "tsc --project tsconfig.prod.json",
    "clean": "rm -rf dist",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  }
}
```

## Development Tools Setup

### ts-node for Development

Run TypeScript files directly without compilation:

```bash
# Install ts-node
npm install --save-dev ts-node

# Run TypeScript file directly
npx ts-node src/index.ts

# With nodemon for auto-restart
npm install --save-dev nodemon
```

Create `nodemon.json`:

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

Create `.vscode/tasks.json` for build tasks:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "typescript",
      "tsconfig": "tsconfig.json",
      "option": "watch",
      "problemMatcher": ["$tsc-watch"],
      "group": "build",
      "label": "TypeScript: Watch"
    }
  ]
}
```

## Environment-Specific Configurations

### Development Configuration (tsconfig.dev.json)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "removeComments": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

### Production Configuration (tsconfig.prod.json)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "exclude": ["node_modules", "tests", "**/*.test.ts", "**/*.spec.ts"]
}
```

## Path Mapping

Simplify imports with path mapping:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@utils/*": ["utils/*"],
      "@components/*": ["components/*"],
      "@services/*": ["services/*"]
    }
  }
}
```

Usage:

```typescript
// Instead of
import { helper } from '../../../utils/helper';

// Use
import { helper } from '@utils/helper';
```

## Common Setup Issues and Solutions

### Issue: Module Not Found

```bash
# Install missing type definitions
npm install --save-dev @types/node
npm install --save-dev @types/express
```

### Issue: Cannot Find Global Types

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node"],
    "typeRoots": ["./node_modules/@types"]
  }
}
```

### Issue: Import/Export Errors

Ensure proper module configuration:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

## Next Steps

With your TypeScript environment set up, you're ready to start learning about type annotations and basic TypeScript syntax.

---

*Continue to: [Basic Type Annotations](03-basic-type-annotations.md)*