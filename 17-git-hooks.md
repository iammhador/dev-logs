# Git Hooks

Git hooks are scripts that Git executes automatically at certain points in the Git workflow. They allow you to automate tasks, enforce policies, and integrate with external tools to maintain code quality and consistency.

## Understanding Git Hooks

### What are Git Hooks?

Git hooks are executable scripts that:
- Run automatically at specific Git events
- Can prevent actions if they exit with non-zero status
- Are stored in `.git/hooks/` directory
- Can be written in any scripting language
- Are not version controlled by default

### Types of Git Hooks

#### Client-side Hooks
- **pre-commit**: Before commit is created
- **prepare-commit-msg**: Before commit message editor
- **commit-msg**: After commit message is entered
- **post-commit**: After commit is completed
- **pre-rebase**: Before rebase operation
- **post-checkout**: After checkout
- **post-merge**: After merge
- **pre-push**: Before push to remote
- **post-rewrite**: After commands that rewrite commits

#### Server-side Hooks
- **pre-receive**: Before any refs are updated
- **update**: Before each ref is updated
- **post-receive**: After all refs are updated
- **post-update**: After all refs are updated (similar to post-receive)

## Setting Up Hook Examples

```bash
# Create example project
mkdir git-hooks-demo
cd git-hooks-demo
git init

# Create package.json for Node.js project
cat > package.json << EOF
{
  "name": "git-hooks-demo",
  "version": "1.0.0",
  "description": "Demo project for Git hooks",
  "main": "index.js",
  "scripts": {
    "test": "node test.js",
    "lint": "eslint .",
    "format": "prettier --write .",
    "lint:fix": "eslint . --fix"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.0.0"
  }
}
EOF

# Create sample JavaScript files
cat > index.js << EOF
const Calculator = require('./calculator');

function main() {
    const calc = new Calculator();
    console.log('2 + 3 =', calc.add(2, 3));
    console.log('10 - 4 =', calc.subtract(10, 4));
}

if (require.main === module) {
    main();
}

module.exports = { main };
EOF

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
    let passed = 0;
    let failed = 0;

    function test(description, actual, expected) {
        if (actual === expected) {
            console.log(`✓ ${description}`);
            passed++;
        } else {
            console.log(`✗ ${description}: expected ${expected}, got ${actual}`);
            failed++;
        }
    }

    // Run tests
    test('Addition: 2 + 3', calc.add(2, 3), 5);
    test('Subtraction: 10 - 4', calc.subtract(10, 4), 6);
    test('Multiplication: 3 * 4', calc.multiply(3, 4), 12);
    test('Division: 15 / 3', calc.divide(15, 3), 5);

    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();
EOF

# Create ESLint configuration
cat > .eslintrc.js << EOF
module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': 'error',
        'no-undef': 'error',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        'indent': ['error', 4],
    },
};
EOF

# Create Prettier configuration
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 4
}
EOF

git add .
git commit -m "Initial project setup"
```

## Pre-commit Hook

### Basic Pre-commit Hook

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running pre-commit checks..."

# Check if this is the initial commit
if git rev-parse --verify HEAD >/dev/null 2>&1
then
    against=HEAD
else
    # Initial commit: diff against an empty tree object
    against=$(git hash-object -t tree /dev/null)
fi

# Get list of staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$staged_files" ]; then
    echo "No staged files to check"
    exit 0
fi

echo "Checking staged files: $staged_files"

# Check for syntax errors in JavaScript files
for file in $staged_files; do
    if [[ "$file" =~ \.(js|jsx)$ ]]; then
        echo "Checking syntax: $file"
        node -c "$file"
        if [ $? -ne 0 ]; then
            echo "❌ Syntax error in $file"
            exit 1
        fi
    fi
done

echo "✅ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
```

### Advanced Pre-commit Hook with ESLint and Prettier

```bash
# Create comprehensive pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

set -e

echo "🔍 Running pre-commit checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Get staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)
js_files=$(echo "$staged_files" | grep -E '\.(js|jsx|ts|tsx)$' || true)
json_files=$(echo "$staged_files" | grep -E '\.(json)$' || true)

if [ -z "$staged_files" ]; then
    print_status $YELLOW "No staged files to check"
    exit 0
fi

print_status $YELLOW "Staged files: $(echo $staged_files | wc -w)"

# Check 1: Prevent commits to main branch
current_branch=$(git symbolic-ref --short HEAD)
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    print_status $RED "❌ Direct commits to $current_branch branch are not allowed"
    print_status $YELLOW "Please create a feature branch:"
    print_status $YELLOW "  git checkout -b feature/your-feature-name"
    exit 1
fi

# Check 2: Prevent large files
max_file_size=1048576  # 1MB in bytes
for file in $staged_files; do
    if [ -f "$file" ]; then
        file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
        if [ "$file_size" -gt "$max_file_size" ]; then
            print_status $RED "❌ File $file is too large ($(($file_size / 1024))KB > 1MB)"
            exit 1
        fi
    fi
done

# Check 3: Prevent sensitive information
print_status $YELLOW "🔒 Checking for sensitive information..."
sensitive_patterns=(
    "password\s*=\s*['\"][^'\"]+['\"]"  # password = "..."
    "api[_-]?key\s*=\s*['\"][^'\"]+['\"]"  # api_key = "..."
    "secret\s*=\s*['\"][^'\"]+['\"]"  # secret = "..."
    "token\s*=\s*['\"][^'\"]+['\"]"  # token = "..."
    "-----BEGIN [A-Z ]+-----"  # Private keys
)

for file in $staged_files; do
    if [ -f "$file" ]; then
        for pattern in "${sensitive_patterns[@]}"; do
            if grep -iE "$pattern" "$file" >/dev/null; then
                print_status $RED "❌ Potential sensitive information found in $file"
                print_status $RED "   Pattern: $pattern"
                exit 1
            fi
        done
    fi
done

# Check 4: JSON syntax validation
if [ -n "$json_files" ]; then
    print_status $YELLOW "📋 Validating JSON files..."
    for file in $json_files; do
        if [ -f "$file" ]; then
            if ! python -m json.tool "$file" >/dev/null 2>&1; then
                print_status $RED "❌ Invalid JSON syntax in $file"
                exit 1
            fi
        fi
    done
    print_status $GREEN "✅ JSON validation passed"
fi

# Check 5: JavaScript/TypeScript linting
if [ -n "$js_files" ]; then
    print_status $YELLOW "🔍 Running ESLint..."
    
    # Check if ESLint is available
    if command -v npx >/dev/null 2>&1 && [ -f "package.json" ]; then
        # Run ESLint on staged files
        echo "$js_files" | xargs npx eslint
        if [ $? -ne 0 ]; then
            print_status $RED "❌ ESLint found issues"
            print_status $YELLOW "💡 Try running: npm run lint:fix"
            exit 1
        fi
        print_status $GREEN "✅ ESLint passed"
    else
        print_status $YELLOW "⚠️  ESLint not available, skipping lint check"
    fi
    
    # Check 6: Prettier formatting
    print_status $YELLOW "💅 Checking Prettier formatting..."
    if command -v npx >/dev/null 2>&1 && [ -f "package.json" ]; then
        # Check if files are formatted
        echo "$js_files" | xargs npx prettier --check
        if [ $? -ne 0 ]; then
            print_status $RED "❌ Code formatting issues found"
            print_status $YELLOW "💡 Try running: npm run format"
            exit 1
        fi
        print_status $GREEN "✅ Prettier formatting passed"
    else
        print_status $YELLOW "⚠️  Prettier not available, skipping format check"
    fi
fi

# Check 7: Run tests
print_status $YELLOW "🧪 Running tests..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test
    if [ $? -ne 0 ]; then
        print_status $RED "❌ Tests failed"
        exit 1
    fi
    print_status $GREEN "✅ Tests passed"
elif [ -f "test.js" ]; then
    node test.js
    if [ $? -ne 0 ]; then
        print_status $RED "❌ Tests failed"
        exit 1
    fi
    print_status $GREEN "✅ Tests passed"
else
    print_status $YELLOW "⚠️  No tests found, skipping test check"
fi

# Check 8: Commit message preparation
print_status $YELLOW "📝 Preparing commit message validation..."

print_status $GREEN "🎉 All pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit
```

### Testing Pre-commit Hook

```bash
# Test the pre-commit hook
echo "console.log('test');" > test-file.js
git add test-file.js

# This should trigger the pre-commit hook
git commit -m "Test commit"

# Clean up
git reset --soft HEAD~1
rm test-file.js
```

## Commit Message Hook

### Commit Message Validation

```bash
# Create commit-msg hook for conventional commits
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

# Conventional Commits validation
# Format: type(scope): description
# Example: feat(auth): add login functionality

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

commit_message=$(cat "$1")

# Skip merge commits
if echo "$commit_message" | grep -qE '^Merge (branch|pull request)'; then
    exit 0
fi

# Skip revert commits
if echo "$commit_message" | grep -qE '^Revert '; then
    exit 0
fi

# Validate commit message format
if ! echo "$commit_message" | grep -qE "$commit_regex"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit message must follow Conventional Commits format:"
    echo "  type(scope): description"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo "Scope: optional, e.g., (auth), (ui), (api)"
    echo "Description: 1-50 characters"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add login functionality"
    echo "  fix: resolve memory leak in calculator"
    echo "  docs: update README with installation steps"
    echo "  test(calculator): add unit tests for division"
    echo ""
    echo "Your message: $commit_message"
    exit 1
fi

# Check for imperative mood
first_word=$(echo "$commit_message" | sed 's/^[^:]*: *//' | cut -d' ' -f1)
if echo "$first_word" | grep -qE '(ed|ing)$'; then
    echo "⚠️  Warning: Use imperative mood in commit messages"
    echo "   Instead of '$first_word', use the base form of the verb"
    echo "   Example: 'add' instead of 'added', 'fix' instead of 'fixing'"
fi

echo "✅ Commit message format is valid"
EOF

chmod +x .git/hooks/commit-msg
```

### Advanced Commit Message Hook

```bash
# Create comprehensive commit-msg hook
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

commit_message_file="$1"
commit_message=$(cat "$commit_message_file")

# Skip certain types of commits
if echo "$commit_message" | grep -qE '^(Merge|Revert|Initial commit)'; then
    print_status $GREEN "✅ Special commit type, skipping validation"
    exit 0
fi

# Extract first line (subject)
subject=$(echo "$commit_message" | head -n1)
body=$(echo "$commit_message" | tail -n +3)

print_status $YELLOW "📝 Validating commit message..."

# Validation 1: Conventional Commits format
conventional_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?: .{1,50}'
if ! echo "$subject" | grep -qE "$conventional_regex"; then
    print_status $RED "❌ Invalid commit message format!"
    echo ""
    echo "Format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    echo "Scope: optional, e.g., (auth), (ui), (api)"
    echo "Breaking change: add ! after type/scope"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add OAuth2 integration"
    echo "  fix!: resolve breaking API change"
    echo "  docs: update installation guide"
    echo ""
    echo "Your subject: $subject"
    exit 1
fi

# Validation 2: Subject line length
subject_length=${#subject}
if [ $subject_length -gt 72 ]; then
    print_status $RED "❌ Subject line too long ($subject_length > 72 characters)"
    exit 1
fi

# Validation 3: Subject line should not end with period
if echo "$subject" | grep -q '\.$'; then
    print_status $RED "❌ Subject line should not end with a period"
    exit 1
fi

# Validation 4: Body line length (if body exists)
if [ -n "$body" ]; then
    while IFS= read -r line; do
        if [ ${#line} -gt 72 ]; then
            print_status $YELLOW "⚠️  Body line exceeds 72 characters: ${#line}"
            print_status $YELLOW "   Consider wrapping: $line"
        fi
    done <<< "$body"
fi

# Validation 5: Check for issue references
if echo "$commit_message" | grep -qE '#[0-9]+'; then
    print_status $GREEN "✅ Issue reference found"
fi

# Validation 6: Suggest breaking change format
if echo "$subject" | grep -iE '(break|breaking)' && ! echo "$subject" | grep -q '!'; then
    print_status $YELLOW "⚠️  Possible breaking change detected"
    print_status $YELLOW "   Consider using ! in type: feat!: or fix!:"
fi

# Validation 7: Check for co-authors
if echo "$commit_message" | grep -qE '^Co-authored-by:'; then
    print_status $GREEN "✅ Co-author information found"
fi

print_status $GREEN "✅ Commit message validation passed"

# Optional: Add commit statistics
files_changed=$(git diff --cached --name-only | wc -l)
lines_added=$(git diff --cached --numstat | awk '{add += $1} END {print add+0}')
lines_deleted=$(git diff --cached --numstat | awk '{del += $2} END {print del+0}')

print_status $YELLOW "📊 Commit stats: $files_changed files, +$lines_added/-$lines_deleted lines"
EOF

chmod +x .git/hooks/commit-msg
```

## Pre-push Hook

### Basic Pre-push Hook

```bash
# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🚀 Running pre-push checks..."

remote="$1"
url="$2"

echo "Pushing to: $remote ($url)"

# Get current branch
current_branch=$(git symbolic-ref --short HEAD)

# Prevent push to main/master from local branches
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "❌ Direct push to $current_branch is not allowed"
    echo "Please use pull requests for main branch changes"
    exit 1
fi

# Run tests before push
echo "🧪 Running tests before push..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed, push aborted"
        exit 1
    fi
fi

echo "✅ Pre-push checks passed"
EOF

chmod +x .git/hooks/pre-push
```

### Advanced Pre-push Hook

```bash
# Create comprehensive pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

remote="$1"
url="$2"

print_status $BLUE "🚀 Running pre-push checks..."
print_status $YELLOW "Remote: $remote ($url)"

# Get current branch and commits being pushed
current_branch=$(git symbolic-ref --short HEAD)
print_status $YELLOW "Branch: $current_branch"

# Read stdin to get the range of commits being pushed
while read local_ref local_sha remote_ref remote_sha; do
    if [ "$local_sha" = "0000000000000000000000000000000000000000" ]; then
        # Branch is being deleted
        print_status $YELLOW "🗑️  Deleting branch: $(basename "$remote_ref")"
        continue
    fi
    
    if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
        # New branch
        range="$local_sha"
        print_status $YELLOW "🆕 New branch: $(basename "$remote_ref")"
    else
        # Existing branch
        range="$remote_sha..$local_sha"
        print_status $YELLOW "📤 Updating branch: $(basename "$remote_ref")"
    fi
    
    # Check 1: Prevent direct push to protected branches
    branch_name=$(basename "$remote_ref")
    if [ "$branch_name" = "main" ] || [ "$branch_name" = "master" ] || [ "$branch_name" = "develop" ]; then
        print_status $RED "❌ Direct push to protected branch '$branch_name' is not allowed"
        print_status $YELLOW "Please use pull requests for protected branch changes"
        exit 1
    fi
    
    # Check 2: Validate commit messages in the push
    print_status $YELLOW "📝 Validating commit messages..."
    conventional_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?: .{1,50}'
    
    invalid_commits=$(git rev-list "$range" | while read commit; do
        message=$(git log --format=%s -n 1 "$commit")
        if ! echo "$message" | grep -qE "$conventional_regex" && 
           ! echo "$message" | grep -qE '^(Merge|Revert|Initial commit)'; then
            echo "$commit: $message"
        fi
    done)
    
    if [ -n "$invalid_commits" ]; then
        print_status $RED "❌ Invalid commit messages found:"
        echo "$invalid_commits"
        print_status $YELLOW "Please fix commit messages or use interactive rebase"
        exit 1
    fi
    
    # Check 3: Prevent force push (unless explicitly allowed)
    if git merge-base --is-ancestor "$local_sha" "$remote_sha" 2>/dev/null; then
        print_status $YELLOW "⚠️  Force push detected"
        if [ "$ALLOW_FORCE_PUSH" != "true" ]; then
            print_status $RED "❌ Force push is not allowed"
            print_status $YELLOW "Use 'git push --force-with-lease' if you're sure"
            print_status $YELLOW "Or set ALLOW_FORCE_PUSH=true environment variable"
            exit 1
        fi
    fi
    
    # Check 4: Ensure no merge commits in feature branches
    if [ "$branch_name" != "main" ] && [ "$branch_name" != "master" ] && [ "$branch_name" != "develop" ]; then
        merge_commits=$(git rev-list --merges "$range")
        if [ -n "$merge_commits" ]; then
            print_status $YELLOW "⚠️  Merge commits found in feature branch"
            print_status $YELLOW "Consider rebasing to maintain linear history"
        fi
    fi
    
    # Check 5: Large file detection
    print_status $YELLOW "📁 Checking for large files..."
    large_files=$(git rev-list "$range" | while read commit; do
        git ls-tree -r -l "$commit" | awk '$4 > 1048576 {print $4, $5}' # Files > 1MB
    done | sort -u)
    
    if [ -n "$large_files" ]; then
        print_status $YELLOW "⚠️  Large files detected:"
        echo "$large_files"
        print_status $YELLOW "Consider using Git LFS for large files"
    fi
done

# Check 6: Run comprehensive tests
print_status $YELLOW "🧪 Running test suite..."
if [ -f "package.json" ]; then
    if grep -q '"lint"' package.json; then
        print_status $YELLOW "🔍 Running linter..."
        npm run lint
        if [ $? -ne 0 ]; then
            print_status $RED "❌ Linting failed"
            exit 1
        fi
    fi
    
    if grep -q '"test"' package.json; then
        print_status $YELLOW "🧪 Running tests..."
        npm test
        if [ $? -ne 0 ]; then
            print_status $RED "❌ Tests failed"
            exit 1
        fi
    fi
    
    if grep -q '"build"' package.json; then
        print_status $YELLOW "🔨 Running build..."
        npm run build
        if [ $? -ne 0 ]; then
            print_status $RED "❌ Build failed"
            exit 1
        fi
    fi
fi

# Check 7: Security scan (if tools available)
if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
    print_status $YELLOW "🔒 Running security audit..."
    npm audit --audit-level=high
    if [ $? -ne 0 ]; then
        print_status $YELLOW "⚠️  Security vulnerabilities found"
        print_status $YELLOW "Consider running 'npm audit fix'"
    fi
fi

# Check 8: Branch protection rules
if [ -f ".github/branch-protection.json" ]; then
    print_status $YELLOW "🛡️  Checking branch protection rules..."
    # Custom branch protection logic here
fi

print_status $GREEN "🎉 All pre-push checks passed!"
print_status $BLUE "📤 Proceeding with push..."
EOF

chmod +x .git/hooks/pre-push
```

## Post-commit Hook

### Notification and Automation

```bash
# Create post-commit hook for notifications
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# Get commit information
commit_hash=$(git rev-parse HEAD)
commit_message=$(git log -1 --pretty=%B)
author=$(git log -1 --pretty=%an)
email=$(git log -1 --pretty=%ae)
date=$(git log -1 --pretty=%ad --date=iso)
branch=$(git symbolic-ref --short HEAD)

# Count changes
files_changed=$(git diff-tree --no-commit-id --name-only -r HEAD | wc -l)
lines_added=$(git show --numstat HEAD | awk '{add += $1} END {print add+0}')
lines_deleted=$(git show --numstat HEAD | awk '{del += $2} END {print del+0}')

echo "📝 Commit completed successfully!"
echo "   Hash: $commit_hash"
echo "   Author: $author"
echo "   Branch: $branch"
echo "   Files: $files_changed changed"
echo "   Lines: +$lines_added/-$lines_deleted"
echo "   Message: $commit_message"

# Optional: Send notification to team chat
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"New commit by $author on $branch\\n$commit_message\\n$commit_hash\"
        }" \
        "$SLACK_WEBHOOK_URL"
fi

# Optional: Update issue tracker
if echo "$commit_message" | grep -qE '#[0-9]+'; then
    issue_number=$(echo "$commit_message" | grep -oE '#[0-9]+' | head -1 | tr -d '#')
    echo "🔗 Referenced issue: #$issue_number"
    # Add issue tracker integration here
fi

# Optional: Trigger CI/CD
if [ "$branch" = "main" ] || [ "$branch" = "develop" ]; then
    echo "🚀 Triggering CI/CD pipeline..."
    # Add CI/CD trigger logic here
fi
EOF

chmod +x .git/hooks/post-commit
```

## Hook Management and Sharing

### Sharing Hooks with Team

```bash
# Create hooks directory in repository
mkdir -p .githooks

# Move hooks to shared directory
cp .git/hooks/pre-commit .githooks/
cp .git/hooks/commit-msg .githooks/
cp .git/hooks/pre-push .githooks/

# Create installation script
cat > .githooks/install.sh << 'EOF'
#!/bin/bash

echo "Installing Git hooks..."

# Get the directory where this script is located
HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

# Install each hook
for hook in "$HOOKS_DIR"/*; do
    hook_name=$(basename "$hook")
    
    # Skip the install script itself
    if [ "$hook_name" = "install.sh" ]; then
        continue
    fi
    
    echo "Installing $hook_name..."
    cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
    chmod +x "$GIT_HOOKS_DIR/$hook_name"
done

echo "✅ Git hooks installed successfully!"
echo "To update hooks, run this script again."
EOF

chmod +x .githooks/install.sh

# Create README for hooks
cat > .githooks/README.md << 'EOF'
# Git Hooks

This directory contains shared Git hooks for the project.

## Installation

Run the installation script to set up hooks:

```bash
./.githooks/install.sh
```

## Available Hooks

- **pre-commit**: Runs linting, formatting, and tests before commit
- **commit-msg**: Validates commit message format (Conventional Commits)
- **pre-push**: Runs comprehensive checks before push
- **post-commit**: Sends notifications and updates trackers

## Bypassing Hooks

In emergency situations, you can bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "Emergency fix"

# Skip pre-push hook
git push --no-verify
```

**Note**: Use bypass sparingly and only in emergencies.
EOF

# Add hooks to version control
git add .githooks/
git commit -m "feat: add shared Git hooks for code quality"
```

### Hook Configuration

```bash
# Create hook configuration file
cat > .githooks/config.json << 'EOF'
{
  "hooks": {
    "pre-commit": {
      "enabled": true,
      "checks": {
        "syntax": true,
        "linting": true,
        "formatting": true,
        "tests": true,
        "security": true
      },
      "maxFileSize": "1MB",
      "allowedBranches": ["feature/*", "bugfix/*", "hotfix/*"]
    },
    "commit-msg": {
      "enabled": true,
      "format": "conventional",
      "maxLength": 72,
      "requireIssueReference": false
    },
    "pre-push": {
      "enabled": true,
      "protectedBranches": ["main", "master", "develop"],
      "allowForceWithLease": true,
      "runTests": true,
      "runBuild": true
    }
  },
  "notifications": {
    "slack": {
      "enabled": false,
      "webhook": ""
    },
    "email": {
      "enabled": false,
      "recipients": []
    }
  }
}
EOF
```

## Hook Best Practices

### 1. Keep Hooks Fast

```bash
# Optimize hook performance
cat > .githooks/performance-tips.md << 'EOF'
# Hook Performance Tips

## Pre-commit Optimization
- Only check staged files, not entire repository
- Use parallel processing for multiple files
- Cache results when possible
- Skip checks for certain file types

## Example: Parallel linting
```bash
# Instead of:
for file in $js_files; do
    eslint "$file"
done

# Use:
echo "$js_files" | xargs -P 4 eslint
```

## Pre-push Optimization
- Only run full test suite, not individual tests
- Use test result caching
- Skip redundant checks if CI will run them
EOF
```

### 2. Provide Clear Error Messages

```bash
# Example of good error messaging
cat > .githooks/error-example.sh << 'EOF'
#!/bin/bash

# BAD: Unclear error
if ! eslint .; then
    echo "ESLint failed"
    exit 1
fi

# GOOD: Clear, actionable error
if ! eslint .; then
    echo "❌ ESLint found code quality issues"
    echo ""
    echo "To fix automatically:"
    echo "  npm run lint:fix"
    echo ""
    echo "To see detailed errors:"
    echo "  npm run lint"
    echo ""
    echo "To bypass this check (not recommended):"
    echo "  git commit --no-verify"
    exit 1
fi
EOF
```

### 3. Make Hooks Configurable

```bash
# Create configurable hook
cat > .githooks/configurable-pre-commit << 'EOF'
#!/bin/bash

# Load configuration
CONFIG_FILE=".githooks/config.json"
if [ -f "$CONFIG_FILE" ]; then
    # Parse JSON config (requires jq)
    LINT_ENABLED=$(jq -r '.hooks."pre-commit".checks.linting' "$CONFIG_FILE")
    TEST_ENABLED=$(jq -r '.hooks."pre-commit".checks.tests' "$CONFIG_FILE")
else
    # Default values
    LINT_ENABLED="true"
    TEST_ENABLED="true"
fi

# Conditional checks
if [ "$LINT_ENABLED" = "true" ]; then
    echo "Running linter..."
    npm run lint
fi

if [ "$TEST_ENABLED" = "true" ]; then
    echo "Running tests..."
    npm test
fi
EOF
```

### 4. Document Hook Behavior

```bash
# Create comprehensive documentation
cat > .githooks/HOOKS_GUIDE.md << 'EOF'
# Git Hooks Guide

## Overview

This project uses Git hooks to maintain code quality and consistency.

## Hook Descriptions

### pre-commit
**When**: Before each commit is created
**Purpose**: Ensure code quality and prevent common issues
**Checks**:
- Syntax validation for JavaScript/TypeScript files
- ESLint code quality checks
- Prettier code formatting
- Unit tests execution
- File size limits (max 1MB)
- Sensitive information detection
- JSON syntax validation

**Bypass**: `git commit --no-verify`

### commit-msg
**When**: After commit message is entered
**Purpose**: Enforce consistent commit message format
**Format**: Conventional Commits (type(scope): description)
**Examples**:
- `feat(auth): add OAuth2 integration`
- `fix: resolve memory leak in calculator`
- `docs: update API documentation`

**Bypass**: `git commit --no-verify`

### pre-push
**When**: Before pushing to remote repository
**Purpose**: Final quality gate before sharing code
**Checks**:
- Prevent direct push to protected branches
- Validate all commit messages in push
- Run full test suite
- Build verification
- Security audit
- Large file detection

**Bypass**: `git push --no-verify`

## Troubleshooting

### Common Issues

1. **Hook not executing**
   - Check if hook file is executable: `chmod +x .git/hooks/hook-name`
   - Verify hook file exists in `.git/hooks/`

2. **Permission denied**
   - Make hook executable: `chmod +x .git/hooks/hook-name`

3. **Hook fails unexpectedly**
   - Check hook logs
   - Run hook manually: `.git/hooks/hook-name`
   - Verify dependencies are installed

### Getting Help

- Check hook output for specific error messages
- Review this documentation
- Ask team members for assistance
- Use `--no-verify` flag only in emergencies
EOF
```

## Quick Reference

```bash
# Hook locations
.git/hooks/                      # Local hooks (not version controlled)
.githooks/                       # Shared hooks (version controlled)

# Common hooks
pre-commit                       # Before commit creation
commit-msg                       # Validate commit message
pre-push                         # Before push to remote
post-commit                      # After commit creation
post-checkout                    # After checkout
post-merge                       # After merge

# Hook management
chmod +x .git/hooks/hook-name    # Make hook executable
git config core.hooksPath .githooks  # Use custom hooks directory

# Bypass hooks (use sparingly)
git commit --no-verify           # Skip pre-commit and commit-msg
git push --no-verify             # Skip pre-push

# Hook installation
./.githooks/install.sh           # Install shared hooks
cp .githooks/* .git/hooks/       # Manual installation

# Testing hooks
.git/hooks/pre-commit            # Run hook manually
echo "test" | .git/hooks/commit-msg /dev/stdin  # Test commit-msg
```

---

**Previous:** [Git Tags](16-git-tags.md)  
**Next:** [Conventional Commits](18-conventional-commits.md)