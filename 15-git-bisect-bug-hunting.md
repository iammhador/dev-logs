# Git Bisect Bug Hunting

Git bisect is a powerful binary search tool that helps you find the exact commit that introduced a bug. It's particularly useful when you know a bug exists now but worked correctly in the past, and you need to identify when it was introduced.

## Understanding Git Bisect

### How Bisect Works

Bisect uses binary search algorithm to efficiently find the problematic commit:

1. You specify a "bad" commit (where bug exists)
2. You specify a "good" commit (where bug doesn't exist)
3. Git checks out the middle commit
4. You test and mark it as "good" or "bad"
5. Git narrows down the range and repeats
6. Process continues until the exact commit is found

### Visual Representation

```
Commit history: A---B---C---D---E---F---G---H
                ↑               ↑
              good            bad

Step 1: Test E (middle)
A---B---C---D---E---F---G---H
            ↑       ↑
          good    bad

Step 2: Test F (middle of E-H)
A---B---C---D---E---F---G---H
                ↑   ↑
              good bad

Step 3: Test G (middle of F-H)
Result: G is the first bad commit!
```

## Setting Up Bug Hunt Example

```bash
# Create example repository with a bug introduction
mkdir bisect-demo
cd bisect-demo
git init

# Create initial working code
cat > calculator.js << EOF
class Calculator {
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }
}

module.exports = Calculator;
EOF

# Create test file
cat > test.js << EOF
const Calculator = require('./calculator');

function runTests() {
    const calc = new Calculator();
    
    // Test addition
    console.assert(calc.add(2, 3) === 5, 'Addition test failed');
    
    // Test subtraction
    console.assert(calc.subtract(5, 3) === 2, 'Subtraction test failed');
    
    // Test multiplication
    console.assert(calc.multiply(4, 3) === 12, 'Multiplication test failed');
    
    // Test division
    console.assert(calc.divide(10, 2) === 5, 'Division test failed');
    
    // Test division by zero
    try {
        calc.divide(10, 0);
        console.assert(false, 'Division by zero should throw error');
    } catch (e) {
        console.assert(e.message === 'Division by zero', 'Wrong error message');
    }
    
    console.log('All tests passed!');
}

runTests();
EOF

git add .
git commit -m "Initial calculator implementation"

# Test that it works
node test.js
```

Output:
```
All tests passed!
```

### Create History with Bug Introduction

```bash
# Commit 2: Add percentage calculation
cat >> calculator.js << EOF

    percentage(value, percent) {
        return (value * percent) / 100;
    }
EOF

git add calculator.js
git commit -m "Add percentage calculation"

# Commit 3: Add power function
cat >> calculator.js << EOF

    power(base, exponent) {
        return Math.pow(base, exponent);
    }
EOF

git add calculator.js
git commit -m "Add power function"

# Commit 4: Add square root
cat >> calculator.js << EOF

    sqrt(value) {
        if (value < 0) {
            throw new Error('Cannot calculate square root of negative number');
        }
        return Math.sqrt(value);
    }
EOF

git add calculator.js
git commit -m "Add square root function"

# Commit 5: "Optimize" division (introduce bug)
sed -i 's/return a \/ b;/return a \/ b + 0.1;/' calculator.js
git add calculator.js
git commit -m "Optimize division calculation"

# Commit 6: Add factorial
cat >> calculator.js << EOF

    factorial(n) {
        if (n < 0) {
            throw new Error('Factorial of negative number is undefined');
        }
        if (n === 0 || n === 1) {
            return 1;
        }
        return n * this.factorial(n - 1);
    }
EOF

git add calculator.js
git commit -m "Add factorial function"

# Commit 7: Add logarithm
cat >> calculator.js << EOF

    log(value, base = Math.E) {
        if (value <= 0) {
            throw new Error('Logarithm of non-positive number is undefined');
        }
        return Math.log(value) / Math.log(base);
    }
EOF

git add calculator.js
git commit -m "Add logarithm function"

# Commit 8: Add more tests
cat >> test.js << EOF

// Test new functions
const calc2 = new Calculator();
console.assert(calc2.percentage(200, 15) === 30, 'Percentage test failed');
console.assert(calc2.power(2, 3) === 8, 'Power test failed');
console.assert(calc2.sqrt(16) === 4, 'Square root test failed');
console.log('Extended tests passed!');
EOF

git add test.js
git commit -m "Add tests for new functions"

# View commit history
git log --oneline
```

Output:
```
h8i9j0k (HEAD -> main) Add tests for new functions
g7h8i9j Add logarithm function
f6g7h8i Add factorial function
e5f6g7h Optimize division calculation  ← Bug introduced here!
d4e5f6g Add square root function
c3d4e5f Add power function
b2c3d4e Add percentage calculation
a1b2c3d Initial calculator implementation
```

```bash
# Test current state (should fail)
node test.js
```

Output:
```
Assertion failed: Division test failed
```

## Basic Bisect Workflow

### Starting Bisect Session

```bash
# Start bisect session
git bisect start

# Mark current commit as bad (bug exists)
git bisect bad

# Mark a known good commit (first commit)
git bisect good a1b2c3d

# Git will checkout a middle commit
```

Output:
```
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[d4e5f6g] Add square root function
```

### Testing and Marking Commits

```bash
# Test the current commit
node test.js
```

Output:
```
All tests passed!
```

```bash
# Mark as good since tests pass
git bisect good
```

Output:
```
Bisecting: 1 revision left to test after this (roughly 1 step)
[f6g7h8i] Add factorial function
```

```bash
# Test this commit
node test.js
```

Output:
```
Assertion failed: Division test failed
```

```bash
# Mark as bad since tests fail
git bisect bad
```

Output:
```
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[e5f6g7h] Optimize division calculation
```

```bash
# Test this commit
node test.js
```

Output:
```
Assertion failed: Division test failed
```

```bash
# Mark as bad
git bisect bad
```

Output:
```
e5f6g7h is the first bad commit
commit e5f6g7h
Author: Your Name <your.email@example.com>
Date:   [timestamp]

    Optimize division calculation

 calculator.js | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

### Finishing Bisect Session

```bash
# End bisect session and return to original HEAD
git bisect reset

# View the problematic commit
git show e5f6g7h
```

Output:
```
commit e5f6g7h
Author: Your Name <your.email@example.com>
Date:   [timestamp]

    Optimize division calculation

diff --git a/calculator.js b/calculator.js
index abc123..def456 100644
--- a/calculator.js
+++ b/calculator.js
@@ -15,7 +15,7 @@ class Calculator {
         if (b === 0) {
             throw new Error('Division by zero');
         }
-        return a / b;
+        return a / b + 0.1;  ← Here's the bug!
     }
 }
```

## Advanced Bisect Techniques

### Automated Bisect with Scripts

```bash
# Create test script for automated bisect
cat > bisect-test.sh << 'EOF'
#!/bin/bash

# Run the test
node test.js > /dev/null 2>&1

# Return exit code (0 = good, 1 = bad)
if [ $? -eq 0 ]; then
    echo "Tests passed - marking as good"
    exit 0
else
    echo "Tests failed - marking as bad"
    exit 1
fi
EOF

chmod +x bisect-test.sh

# Start automated bisect
git bisect start
git bisect bad HEAD
git bisect good a1b2c3d

# Run automated bisect
git bisect run ./bisect-test.sh
```

Output:
```
running ./bisect-test.sh
Tests passed - marking as good
Bisecting: 1 revision left to test after this (roughly 1 step)
[f6g7h8i] Add factorial function
running ./bisect-test.sh
Tests failed - marking as bad
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[e5f6g7h] Optimize division calculation
running ./bisect-test.sh
Tests failed - marking as bad
e5f6g7h is the first bad commit
```

### Complex Test Scripts

```bash
# Create more sophisticated test script
cat > advanced-bisect-test.sh << 'EOF'
#!/bin/bash

set -e  # Exit on any error

echo "Testing commit: $(git rev-parse --short HEAD)"

# Check if required files exist
if [ ! -f "calculator.js" ] || [ ! -f "test.js" ]; then
    echo "Required files missing - skipping"
    exit 125  # Skip this commit
fi

# Check if Node.js syntax is valid
node -c calculator.js || {
    echo "Syntax error in calculator.js - skipping"
    exit 125
}

node -c test.js || {
    echo "Syntax error in test.js - skipping"
    exit 125
}

# Run tests with timeout
timeout 10s node test.js > test-output.log 2>&1
test_result=$?

if [ $test_result -eq 0 ]; then
    echo "✓ All tests passed"
    exit 0  # Good commit
elif [ $test_result -eq 124 ]; then
    echo "⏰ Tests timed out - skipping"
    exit 125  # Skip commit
else
    echo "✗ Tests failed"
    cat test-output.log
    exit 1  # Bad commit
fi
EOF

chmod +x advanced-bisect-test.sh
```

### Bisect with Build Systems

```bash
# Example for projects with build steps
cat > build-and-test.sh << 'EOF'
#!/bin/bash

echo "Building and testing commit: $(git rev-parse --short HEAD)"

# Install dependencies (if package.json exists)
if [ -f "package.json" ]; then
    npm install --silent || {
        echo "npm install failed - skipping"
        exit 125
    }
fi

# Build project
if [ -f "Makefile" ]; then
    make clean && make || {
        echo "Build failed - skipping"
        exit 125
    }
elif [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build || {
        echo "Build failed - skipping"
        exit 125
    }
fi

# Run tests
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test
elif [ -f "test.js" ]; then
    node test.js
else
    echo "No tests found - skipping"
    exit 125
fi
EOF

chmod +x build-and-test.sh
```

## Real-world Bisect Examples

### Example 1: Performance Regression

```bash
# Create performance test scenario
cat > performance-test.js << EOF
const Calculator = require('./calculator');

function performanceTest() {
    const calc = new Calculator();
    const start = Date.now();
    
    // Perform many calculations
    for (let i = 0; i < 100000; i++) {
        calc.add(i, i + 1);
        calc.multiply(i, 2);
        calc.divide(i + 1, 2);
    }
    
    const duration = Date.now() - start;
    console.log(\`Performance test completed in \${duration}ms\`);
    
    // Fail if too slow (arbitrary threshold)
    if (duration > 1000) {
        console.error('Performance regression detected!');
        process.exit(1);
    }
    
    console.log('Performance test passed');
}

performanceTest();
EOF

# Create bisect script for performance
cat > perf-bisect.sh << 'EOF'
#!/bin/bash
node performance-test.js
EOF

chmod +x perf-bisect.sh
```

### Example 2: Integration Test Failure

```bash
# Create integration test
cat > integration-test.js << EOF
const Calculator = require('./calculator');

function integrationTest() {
    const calc = new Calculator();
    
    // Complex calculation that might reveal bugs
    const result = calc.divide(
        calc.multiply(
            calc.add(10, 5),
            calc.subtract(20, 5)
        ),
        calc.power(2, 3)
    );
    
    const expected = (15 * 15) / 8; // 28.125
    
    console.log(\`Result: \${result}, Expected: \${expected}\`);
    
    if (Math.abs(result - expected) > 0.01) {
        console.error('Integration test failed!');
        process.exit(1);
    }
    
    console.log('Integration test passed');
}

integrationTest();
EOF

# Run integration test
node integration-test.js
```

### Example 3: Cross-platform Compatibility

```bash
# Create platform-specific test
cat > platform-test.sh << 'EOF'
#!/bin/bash

echo "Testing on platform: $(uname -s)"

# Test platform-specific functionality
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows-specific tests
    echo "Running Windows-specific tests"
    # Add Windows-specific test logic
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS-specific tests
    echo "Running macOS-specific tests"
    # Add macOS-specific test logic
else
    # Linux-specific tests
    echo "Running Linux-specific tests"
    # Add Linux-specific test logic
fi

# Run common tests
node test.js
EOF

chmod +x platform-test.sh
```

## Bisect Best Practices

### 1. Prepare Good Test Cases

```bash
# Create comprehensive test that clearly identifies the bug
cat > comprehensive-test.js << EOF
const Calculator = require('./calculator');

function runComprehensiveTests() {
    const calc = new Calculator();
    const tests = [
        // Basic operations
        { method: 'add', args: [2, 3], expected: 5 },
        { method: 'subtract', args: [5, 3], expected: 2 },
        { method: 'multiply', args: [4, 3], expected: 12 },
        { method: 'divide', args: [10, 2], expected: 5 },
        
        // Edge cases
        { method: 'divide', args: [1, 3], expected: 0.3333333333333333 },
        { method: 'add', args: [0, 0], expected: 0 },
        { method: 'multiply', args: [-2, 3], expected: -6 },
    ];
    
    for (const test of tests) {
        const result = calc[test.method](...test.args);
        if (Math.abs(result - test.expected) > 0.0001) {
            console.error(\`Test failed: \${test.method}(\${test.args.join(', ')})\`);
            console.error(\`Expected: \${test.expected}, Got: \${result}\`);
            process.exit(1);
        }
    }
    
    console.log('All comprehensive tests passed');
}

runComprehensiveTests();
EOF
```

### 2. Handle Edge Cases in Bisect Scripts

```bash
# Robust bisect script
cat > robust-bisect.sh << 'EOF'
#!/bin/bash

set -e

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Testing commit: $(git rev-parse --short HEAD)"

# Check if this is a merge commit (might want to skip)
if git rev-parse --verify HEAD^2 >/dev/null 2>&1; then
    log "Merge commit detected - skipping"
    exit 125
fi

# Check for required files
required_files=("calculator.js" "test.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        log "Required file $file missing - skipping"
        exit 125
    fi
done

# Check syntax
for file in *.js; do
    if ! node -c "$file" 2>/dev/null; then
        log "Syntax error in $file - skipping"
        exit 125
    fi
done

# Run tests with proper error handling
if timeout 30s node comprehensive-test.js; then
    log "Tests passed - good commit"
    exit 0
else
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
        log "Tests timed out - skipping"
        exit 125
    else
        log "Tests failed - bad commit"
        exit 1
    fi
fi
EOF

chmod +x robust-bisect.sh
```

### 3. Document Bisect Process

```bash
# Create bisect documentation
cat > BISECT_GUIDE.md << 'EOF'
# Bisect Guide for This Project

## Quick Start

```bash
# Start bisect
git bisect start
git bisect bad HEAD
git bisect good v1.0.0  # Known good version

# Run automated bisect
git bisect run ./robust-bisect.sh
```

## Manual Testing

If automated bisect fails, test manually:

1. Run: `node comprehensive-test.js`
2. If tests pass: `git bisect good`
3. If tests fail: `git bisect bad`
4. If unsure/broken: `git bisect skip`

## Common Issues

- **Syntax errors**: Use `git bisect skip`
- **Missing dependencies**: Check if commit predates dependency
- **Build failures**: May need to skip or fix build process

## Exit Codes

- 0: Good commit (tests pass)
- 1: Bad commit (tests fail)
- 125: Skip commit (can't test)
EOF
```

## Troubleshooting Bisect

### Common Issues and Solutions

#### 1. Skipping Untestable Commits

```bash
# When a commit can't be tested
git bisect skip

# Skip multiple commits
git bisect skip commit1 commit2 commit3

# Skip a range
git bisect skip commit1..commit5
```

#### 2. Bisect Got Confused

```bash
# Reset and start over
git bisect reset
git bisect start

# Be more careful with good/bad marking
git bisect bad HEAD
git bisect good known-good-commit
```

#### 3. Multiple Bugs

```bash
# If there are multiple bugs, bisect one at a time
# Create specific test for each bug

# Test for bug A only
cat > test-bug-a.sh << 'EOF'
#!/bin/bash
# Test only for specific bug A
node test-bug-a.js
EOF

# Run bisect for bug A
git bisect run ./test-bug-a.sh
```

#### 4. Non-linear History

```bash
# For complex merge histories
git bisect start --first-parent

# This follows only the first parent of merges
```

### Recovery from Bisect Problems

```bash
# View bisect log
git bisect log

# Replay bisect with modifications
git bisect replay bisect-log-file

# Visualize bisect progress
git bisect visualize
git bisect view  # Same as visualize
```

## Advanced Bisect Workflows

### Workflow 1: Continuous Integration Bisect

```bash
#!/bin/bash
# CI-friendly bisect script

ci_bisect() {
    local good_commit=$1
    local bad_commit=$2
    local test_command=$3
    
    echo "Starting CI bisect from $good_commit to $bad_commit"
    
    git bisect start "$bad_commit" "$good_commit"
    
    # Create CI test script
    cat > ci-test.sh << EOF
#!/bin/bash
set -e

# Setup CI environment
export NODE_ENV=test
export CI=true

# Install dependencies
npm ci --silent

# Run build
npm run build

# Run tests
$test_command
EOF
    
    chmod +x ci-test.sh
    
    # Run automated bisect
    git bisect run ./ci-test.sh
    
    # Cleanup
    rm ci-test.sh
    git bisect reset
}

# Usage: ci_bisect v1.0.0 HEAD "npm test"
```

### Workflow 2: Performance Bisect

```bash
#!/bin/bash
# Performance regression bisect

performance_bisect() {
    local baseline_commit=$1
    local regression_commit=$2
    local performance_threshold=$3
    
    cat > perf-test.sh << EOF
#!/bin/bash

# Build project
npm run build > /dev/null 2>&1 || exit 125

# Run performance test
start_time=\$(date +%s%N)
npm run perf-test > /dev/null 2>&1
end_time=\$(date +%s%N)

# Calculate duration in milliseconds
duration=\$(( (end_time - start_time) / 1000000 ))

echo "Performance test took: \${duration}ms"

if [ \$duration -gt $performance_threshold ]; then
    echo "Performance regression detected"
    exit 1
else
    echo "Performance acceptable"
    exit 0
fi
EOF
    
    chmod +x perf-test.sh
    
    git bisect start "$regression_commit" "$baseline_commit"
    git bisect run ./perf-test.sh
    
    rm perf-test.sh
    git bisect reset
}
```

## Quick Reference

```bash
# Start bisect
git bisect start                # Begin bisect session
git bisect bad [commit]         # Mark commit as bad (default: HEAD)
git bisect good [commit]        # Mark commit as good
git bisect skip [commit]        # Skip untestable commit

# Automated bisect
git bisect run <script>         # Run script automatically
git bisect run make test        # Example with make
git bisect run npm test         # Example with npm

# Bisect control
git bisect reset [commit]       # End bisect, return to commit (default: original HEAD)
git bisect log                  # Show bisect log
git bisect replay <file>        # Replay bisect from log file

# Visualization
git bisect visualize            # Show commits being bisected
git bisect view                 # Same as visualize

# Advanced options
git bisect start --first-parent # Follow only first parent in merges
git bisect start --no-checkout  # Don't checkout commits (for worktrees)

# Script exit codes
# 0: Good commit
# 1-124, 126-255: Bad commit
# 125: Skip commit (untestable)
```

---

**Previous:** [Git Reflog Recovery](14-git-reflog-recovery.md)  
**Next:** [Git Tags](16-git-tags.md)