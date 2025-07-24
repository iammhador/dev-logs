# Node.js Installation and Running Basic Scripts

## Overview

Before you can start building applications with Node.js, you need to install it on your system and understand how to run JavaScript files. This chapter covers the installation process, version management, and running your first Node.js scripts.

## Key Concepts

### Node.js Installation Methods

There are several ways to install Node.js:

1. **Official Installer** - Download from nodejs.org
2. **Package Managers** - Using npm, Chocolatey (Windows), Homebrew (macOS)
3. **Version Managers** - nvm (Node Version Manager)
4. **Docker** - Running Node.js in containers

### LTS vs Current Versions

- **LTS (Long Term Support)**: Stable, recommended for production
- **Current**: Latest features, may have breaking changes

### Node.js REPL

REPL (Read-Eval-Print Loop) is an interactive shell for testing JavaScript code quickly.

## Example Code

### Installation Steps

#### Method 1: Official Installer (Recommended for Beginners)

1. Visit [nodejs.org](https://nodejs.org)
2. Download the LTS version
3. Run the installer
4. Verify installation:

```bash
# Check Node.js version
node --version
# or
node -v

# Check npm version
npm --version
# or
npm -v
```

#### Method 2: Using nvm (Recommended for Developers)

**Windows (nvm-windows):**
```bash
# Download and install nvm-windows from GitHub
# Then install Node.js
nvm install lts
nvm use lts
```

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest LTS
nvm install --lts
nvm use --lts

# List installed versions
nvm list

# Switch between versions
nvm use 18.17.0
```

### Your First Node.js Script

Create a file called `first-script.js`:

```javascript
// first-script.js
console.log('Welcome to Node.js!');
console.log('Today is:', new Date().toLocaleDateString());
console.log('Current working directory:', process.cwd());

// Access command line arguments
console.log('Command line arguments:', process.argv);

// Environment variables
console.log('Node environment:', process.env.NODE_ENV || 'development');
```

Run it:
```bash
node first-script.js
```

### Working with Command Line Arguments

```javascript
// args-demo.js
const args = process.argv.slice(2); // Remove 'node' and script name

if (args.length === 0) {
    console.log('No arguments provided!');
    console.log('Usage: node args-demo.js <name> <age>');
    process.exit(1);
}

const [name, age] = args;
console.log(`Hello ${name}, you are ${age} years old!`);

// Handle optional arguments
if (args[2]) {
    console.log(`Additional info: ${args[2]}`);
}
```

Run with arguments:
```bash
node args-demo.js John 25 "Software Developer"
```

### Using the Node.js REPL

Start the REPL by typing `node` without any arguments:

```bash
node
```

Then you can run JavaScript interactively:

```javascript
> console.log('Hello from REPL!');
Hello from REPL!
undefined

> const greeting = 'Hello World';
undefined

> greeting
'Hello World'

> Math.random()
0.8394729834729834

> .help  // Show REPL commands
> .exit  // Exit REPL (or Ctrl+C twice)
```

### Useful REPL Commands

```javascript
// In REPL:
.help     // Show help
.break    // Break out of multi-line expression
.clear    // Clear the context
.exit     // Exit REPL
.save filename    // Save session to file
.load filename    // Load file into session
```

### Creating a Simple Calculator

```javascript
// calculator.js
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error('Division by zero is not allowed');
    }
    return a / b;
}

// Get command line arguments
const [operation, num1, num2] = process.argv.slice(2);

if (!operation || !num1 || !num2) {
    console.log('Usage: node calculator.js <operation> <num1> <num2>');
    console.log('Operations: add, subtract, multiply, divide');
    process.exit(1);
}

const a = parseFloat(num1);
const b = parseFloat(num2);

if (isNaN(a) || isNaN(b)) {
    console.log('Please provide valid numbers');
    process.exit(1);
}

try {
    let result;
    
    switch (operation.toLowerCase()) {
        case 'add':
            result = add(a, b);
            break;
        case 'subtract':
            result = subtract(a, b);
            break;
        case 'multiply':
            result = multiply(a, b);
            break;
        case 'divide':
            result = divide(a, b);
            break;
        default:
            console.log('Unknown operation:', operation);
            process.exit(1);
    }
    
    console.log(`${a} ${operation} ${b} = ${result}`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
```

Test the calculator:
```bash
node calculator.js add 10 5        # Output: 10 add 5 = 15
node calculator.js multiply 7 8    # Output: 7 multiply 8 = 56
node calculator.js divide 10 0     # Output: Error: Division by zero is not allowed
```

## Real-World Use Case

### File Processing Script

Create a script that processes text files:

```javascript
// file-processor.js
const fs = require('fs');
const path = require('path');

function processFile(filename) {
    // Check if file exists
    if (!fs.existsSync(filename)) {
        console.error(`File '${filename}' not found!`);
        return;
    }
    
    try {
        // Read file content
        const content = fs.readFileSync(filename, 'utf8');
        
        // Process the content
        const lines = content.split('\n');
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = content.length;
        
        // Display statistics
        console.log(`\n📄 File: ${filename}`);
        console.log(`📊 Statistics:`);
        console.log(`   Lines: ${lines.length}`);
        console.log(`   Words: ${wordCount}`);
        console.log(`   Characters: ${charCount}`);
        console.log(`   Size: ${fs.statSync(filename).size} bytes`);
        
        // Show first few lines
        console.log(`\n📖 First 3 lines:`);
        lines.slice(0, 3).forEach((line, index) => {
            console.log(`   ${index + 1}: ${line}`);
        });
        
    } catch (error) {
        console.error('Error processing file:', error.message);
    }
}

// Get filename from command line
const filename = process.argv[2];

if (!filename) {
    console.log('Usage: node file-processor.js <filename>');
    process.exit(1);
}

processFile(filename);
```

Create a test file and run:
```bash
echo "Hello World\nThis is a test file\nWith multiple lines" > test.txt
node file-processor.js test.txt
```

## Best Practices

### 1. Version Management
```bash
# Always specify Node.js version in your project
echo "18.17.0" > .nvmrc

# Team members can then use:
nvm use  # Automatically uses version from .nvmrc
```

### 2. Error Handling
```javascript
// ❌ Bad - unhandled errors
const result = JSON.parse(userInput);

// ✅ Good - proper error handling
try {
    const result = JSON.parse(userInput);
    console.log('Parsed successfully:', result);
} catch (error) {
    console.error('Invalid JSON:', error.message);
    process.exit(1);
}
```

### 3. Exit Codes
```javascript
// Use appropriate exit codes
process.exit(0);  // Success
process.exit(1);  // General error
process.exit(2);  // Misuse of shell command
```

### 4. Environment Detection
```javascript
// environment.js
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

if (isDevelopment) {
    console.log('Running in development mode');
}

// Set environment when running
// NODE_ENV=production node app.js
```

### 5. Script Organization
```javascript
// main.js - Entry point
function main() {
    try {
        // Your main logic here
        console.log('Application started successfully');
    } catch (error) {
        console.error('Application failed to start:', error.message);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    main();
}

// Export for testing
module.exports = { main };
```

## Summary

Getting started with Node.js involves:

- **Installation**: Use official installer for beginners, nvm for developers
- **Version Management**: Always use LTS for production, consider nvm for multiple projects
- **Running Scripts**: Use `node filename.js` to execute JavaScript files
- **REPL**: Interactive shell for quick testing and experimentation
- **Command Line Arguments**: Access via `process.argv` for dynamic scripts
- **Error Handling**: Always handle errors gracefully and use appropriate exit codes

Key commands to remember:
```bash
node --version          # Check Node.js version
node script.js          # Run a script
node                    # Start REPL
node -e "console.log('Hi')"  # Execute inline code
```

Now that you have Node.js installed and understand the basics, you're ready to explore npm and start building more complex applications. The next chapter will cover npm fundamentals and package management.