# Forking and Upstream Remotes

Forking is essential for contributing to open source projects and collaborating on repositories you don't have write access to. This chapter covers the complete fork workflow.

## What is Forking?

A **fork** is a personal copy of someone else's repository on GitHub. It allows you to:
- **Experiment freely** without affecting the original project
- **Propose changes** via pull requests
- **Customize** the project for your needs
- **Learn** from existing codebases
- **Contribute** to open source projects

## Fork Workflow Overview

```
Original Repo (upstream)
    ↓ fork
Your Fork (origin)
    ↓ clone
Local Repository
    ↓ changes
Feature Branch
    ↓ push
Your Fork
    ↓ pull request
Original Repo
```

## Setting Up a Fork

### Step 1: Fork on GitHub

1. **Navigate to the repository** you want to contribute to
2. **Click "Fork"** button (top-right corner)
3. **Choose destination** (your account or organization)
4. **Wait for fork creation**

Example: Forking a popular open source project
```
Original: https://github.com/microsoft/vscode
Your Fork: https://github.com/yourusername/vscode
```

### Step 2: Clone Your Fork

```bash
# Clone your fork (not the original)
git clone https://github.com/yourusername/vscode.git
cd vscode

# Check current remotes
git remote -v
```

Output:
```
origin  https://github.com/yourusername/vscode.git (fetch)
origin  https://github.com/yourusername/vscode.git (push)
```

### Step 3: Add Upstream Remote

```bash
# Add original repository as upstream
git remote add upstream https://github.com/microsoft/vscode.git

# Verify remotes
git remote -v
```

Output:
```
origin    https://github.com/yourusername/vscode.git (fetch)
origin    https://github.com/yourusername/vscode.git (push)
upstream  https://github.com/microsoft/vscode.git (fetch)
upstream  https://github.com/microsoft/vscode.git (push)
```

### Step 4: Configure Upstream Push

```bash
# Prevent accidental pushes to upstream
git remote set-url --push upstream DISABLE

# Verify configuration
git remote -v
```

Output:
```
origin    https://github.com/yourusername/vscode.git (fetch)
origin    https://github.com/yourusername/vscode.git (push)
upstream  https://github.com/microsoft/vscode.git (fetch)
upstream  DISABLE (push)
```

## Keeping Your Fork in Sync

### Syncing with Upstream

```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push updates to your fork
git push origin main
```

### Alternative: Rebase Instead of Merge

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your main branch
git checkout main
git rebase upstream/main

# Force push (safe since it's your fork)
git push --force-with-lease origin main
```

### Automated Sync Script

Create a script to automate syncing:

```bash
#!/bin/bash
# sync-fork.sh

echo "Syncing fork with upstream..."

# Fetch all remotes
git fetch --all

# Store current branch
current_branch=$(git branch --show-current)

# Switch to main and sync
git checkout main
git merge upstream/main
git push origin main

# Switch back to original branch
git checkout "$current_branch"

echo "Fork synced successfully!"
```

```bash
# Make script executable
chmod +x sync-fork.sh

# Run sync
./sync-fork.sh
```

## Contributing to Open Source

### Example: Contributing to a Documentation Project

Let's simulate contributing to an open source documentation project:

```bash
# Fork and clone a documentation repository
git clone https://github.com/yourusername/awesome-docs.git
cd awesome-docs
git remote add upstream https://github.com/original/awesome-docs.git
git remote set-url --push upstream DISABLE

# Sync with latest changes
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Create feature branch for your contribution
git checkout -b docs/improve-git-section

# Make improvements to documentation
cat >> git-guide.md << EOF

## Advanced Git Tips

### Using Git Aliases for Productivity

Git aliases can significantly speed up your workflow:

\`\`\`bash
# Set up useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
\`\`\`

### Interactive Staging

Use interactive staging for precise commits:

\`\`\`bash
# Stage changes interactively
git add -i

# Stage patches interactively
git add -p
\`\`\`

### Finding Bugs with Git Bisect

Git bisect helps find the commit that introduced a bug:

\`\`\`bash
# Start bisect session
git bisect start
git bisect bad          # Current commit is bad
git bisect good v1.0    # v1.0 was good

# Git will checkout commits for testing
# Mark each commit as good or bad
git bisect good   # if current commit is good
git bisect bad    # if current commit is bad

# Git will find the problematic commit
git bisect reset  # End bisect session
\`\`\`
EOF

# Commit your contribution
git add git-guide.md
git commit -m "docs: Add advanced Git tips section

- Add section on Git aliases for productivity
- Document interactive staging techniques
- Explain git bisect for bug hunting
- Include practical examples and commands

Fixes #123"

# Push to your fork
git push -u origin docs/improve-git-section
```

### Creating the Pull Request

```bash
# Use GitHub CLI to create PR
gh pr create \
  --title "docs: Add advanced Git tips section" \
  --body "## Description
Adds comprehensive section on advanced Git techniques including aliases, interactive staging, and bisect.

## Changes
- ✅ Added Git aliases section with productivity tips
- ✅ Documented interactive staging workflow
- ✅ Explained git bisect for debugging
- ✅ Included practical examples

## Testing
- [x] Verified all commands work correctly
- [x] Checked markdown formatting
- [x] Tested examples on different Git versions

Fixes #123" \
  --reviewer maintainer1,maintainer2 \
  --label documentation,enhancement
```

## Managing Multiple Forks

### Working with Multiple Remotes

```bash
# Add multiple upstream sources
git remote add upstream-original https://github.com/original/repo.git
git remote add upstream-fork https://github.com/anotherfork/repo.git

# Fetch from specific remote
git fetch upstream-original
git fetch upstream-fork

# Compare different upstreams
git log --oneline upstream-original/main..upstream-fork/main
```

### Tracking Different Branches

```bash
# Track different branches from different remotes
git checkout -b feature-a upstream-original/feature-a
git checkout -b feature-b upstream-fork/feature-b

# Push to your fork
git push origin feature-a
git push origin feature-b
```

## Advanced Fork Workflows

### Triangular Workflow

Common in large open source projects:

```
Upstream (read-only)
    ↑ fetch
Local Repository
    ↓ push
Your Fork
    ↓ pull request
Upstream
```

```bash
# Setup triangular workflow
git clone https://github.com/yourusername/project.git
cd project
git remote add upstream https://github.com/original/project.git
git remote set-url --push upstream DISABLE

# Configure push default
git config remote.pushdefault origin
git config push.default current

# Workflow
git fetch upstream              # Get latest changes
git checkout -b feature/new     # Create feature branch
# ... make changes ...
git push                        # Pushes to origin (your fork)
# Create PR from your fork to upstream
```

### Maintaining a Personal Fork

```bash
# Keep personal customizations in separate branch
git checkout -b personal/customizations

# Make your personal changes
echo "# My personal notes" >> PERSONAL.md
git add PERSONAL.md
git commit -m "Add personal customizations"

# Regularly rebase on upstream
git fetch upstream
git rebase upstream/main

# Keep personal branch updated
git push --force-with-lease origin personal/customizations
```

## GitHub CLI for Forks

### Fork Management

```bash
# Fork repository
gh repo fork original/repository

# Fork and clone in one command
gh repo fork original/repository --clone

# List your forks
gh repo list --fork

# Sync fork with upstream
gh repo sync yourusername/repository

# Create PR from fork
gh pr create --repo original/repository
```

### Repository Information

```bash
# View repository info
gh repo view original/repository

# Check if repository is a fork
gh repo view --json isFork

# View parent repository
gh repo view --json parent
```

## Best Practices for Forks

### 1. Keep Fork Updated

```bash
# Create alias for syncing
git config --global alias.sync '!git fetch upstream && git checkout main && git merge upstream/main && git push origin main'

# Use the alias
git sync
```

### 2. Use Feature Branches

```bash
# Always create feature branches from updated main
git checkout main
git pull upstream main
git checkout -b feature/my-contribution

# Never work directly on main branch
```

### 3. Clean Commit History

```bash
# Before creating PR, clean up commits
git rebase -i upstream/main

# Squash related commits
# Fix commit messages
# Remove debug commits
```

### 4. Test Your Changes

```bash
# Test locally before pushing
npm test                    # Run test suite
npm run build              # Check build
npm run lint               # Check code style

# Test with upstream changes
git fetch upstream
git rebase upstream/main
npm test                   # Test after rebase
```

## Common Fork Scenarios

### Scenario 1: Contributing a Bug Fix

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# Create bug fix branch
git checkout -b fix/login-validation-bug

# Fix the bug
sed -i 's/email.length > 0/email.includes("@")/' login.js

# Test the fix
npm test

# Commit with descriptive message
git add login.js
git commit -m "fix: Improve email validation in login form

Replace simple length check with proper email format validation
to prevent invalid email addresses from being accepted.

Fixes #456"

# Push and create PR
git push -u origin fix/login-validation-bug
gh pr create --title "fix: Improve email validation in login form" --body "Fixes #456"
```

### Scenario 2: Adding a New Feature

```bash
# Create feature branch
git checkout -b feature/dark-mode-toggle

# Implement feature
cat > dark-mode.js << EOF
class DarkModeToggle {
  constructor() {
    this.isDark = localStorage.getItem('darkMode') === 'true';
    this.init();
  }

  init() {
    this.createToggle();
    this.applyTheme();
  }

  createToggle() {
    const toggle = document.createElement('button');
    toggle.textContent = '🌙';
    toggle.addEventListener('click', () => this.toggle());
    document.body.appendChild(toggle);
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem('darkMode', this.isDark);
    this.applyTheme();
  }

  applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDark);
  }
}

new DarkModeToggle();
EOF

# Add CSS
cat >> styles.css << EOF

/* Dark mode styles */
.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

.dark-mode button {
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
}
EOF

# Commit feature
git add .
git commit -m "feat: Add dark mode toggle functionality

- Implement DarkModeToggle class with localStorage persistence
- Add toggle button with moon emoji
- Include CSS styles for dark theme
- Automatically apply saved theme preference on load

Closes #789"

# Push and create PR
git push -u origin feature/dark-mode-toggle
gh pr create --title "feat: Add dark mode toggle" --body "Implements #789"
```

### Scenario 3: Updating Documentation

```bash
# Create documentation branch
git checkout -b docs/api-examples

# Update documentation
cat >> API.md << EOF

## Usage Examples

### Basic Authentication

\`\`\`javascript
const api = new APIClient({
  baseURL: 'https://api.example.com',
  apiKey: 'your-api-key'
});

// Login user
const user = await api.auth.login({
  email: 'user@example.com',
  password: 'password123'
});
\`\`\`

### Error Handling

\`\`\`javascript
try {
  const data = await api.users.get(userId);
  console.log(data);
} catch (error) {
  if (error.status === 404) {
    console.log('User not found');
  } else {
    console.error('API Error:', error.message);
  }
}
\`\`\`
EOF

# Commit documentation
git add API.md
git commit -m "docs: Add API usage examples

- Add authentication example with error handling
- Include common use cases and patterns
- Improve developer onboarding experience"

# Push and create PR
git push -u origin docs/api-examples
gh pr create --title "docs: Add comprehensive API examples"
```

## Troubleshooting Forks

### Fork is Behind Upstream

```bash
# Check how far behind
git fetch upstream
git log --oneline main..upstream/main

# Sync fork
git checkout main
git merge upstream/main
git push origin main
```

### Merge Conflicts During Sync

```bash
# Resolve conflicts during merge
git fetch upstream
git merge upstream/main
# Resolve conflicts in files
git add .
git commit -m "Merge upstream changes"
git push origin main
```

### Accidentally Pushed to Upstream

```bash
# If you have push access and made a mistake
git push upstream :branch-name  # Delete branch

# If you don't have push access, contact maintainers
```

### Lost Fork Sync

```bash
# Reset fork to match upstream exactly
git fetch upstream
git checkout main
git reset --hard upstream/main
git push --force-with-lease origin main
```

## Quick Reference

```bash
# Fork setup
gh repo fork original/repo --clone    # Fork and clone
git remote add upstream <url>         # Add upstream
git remote set-url --push upstream DISABLE  # Prevent upstream push

# Sync workflow
git fetch upstream                    # Get upstream changes
git checkout main                     # Switch to main
git merge upstream/main               # Merge changes
git push origin main                  # Update fork

# Contribution workflow
git checkout -b feature/branch        # Create feature branch
# ... make changes ...
git push -u origin feature/branch     # Push to fork
gh pr create                          # Create pull request

# Maintenance
gh repo sync yourusername/repo        # Sync fork via GitHub CLI
git branch -d feature/merged-branch   # Clean up merged branches
```

---

**Previous:** [Pull Requests and Code Review](09-pull-requests-code-review.md)  
**Next:** [Advanced Git Rebase](11-advanced-git-rebase.md)