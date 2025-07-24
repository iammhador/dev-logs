# Branching Basics

Branching is one of Git's most powerful features. It allows you to diverge from the main line of development and work on features, experiments, or bug fixes in isolation.

## What is a Branch?

A **branch** is a lightweight, movable pointer to a specific commit. Think of it as an independent line of development.

```
main:     A---B---C---D
               \
feature:        E---F
```

### Why Use Branches?

- **Isolation**: Work on features without affecting main code
- **Experimentation**: Try new ideas safely
- **Collaboration**: Multiple developers can work simultaneously
- **Organization**: Separate different types of work
- **Code Review**: Review changes before merging

## git branch - Managing Branches

### Viewing Branches

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List remote branches only
git branch -r

# List branches with last commit
git branch -v

# List merged branches
git branch --merged

# List unmerged branches
git branch --no-merged
```

### Creating Branches

```bash
# Create new branch
git branch <branch-name>
git branch feature/user-authentication

# Create and switch to new branch
git checkout -b <branch-name>
git checkout -b feature/user-authentication

# Create branch from specific commit
git branch <branch-name> <commit-hash>
git branch hotfix/bug-123 a1b2c3d

# Create branch from remote branch
git checkout -b local-branch origin/remote-branch
```

### Deleting Branches

```bash
# Delete merged branch
git branch -d <branch-name>
git branch -d feature/completed-feature

# Force delete unmerged branch
git branch -D <branch-name>
git branch -D feature/abandoned-feature

# Delete remote branch
git push origin --delete <branch-name>
git push origin --delete feature/old-feature
```

## git checkout vs git switch

Git 2.23 introduced `git switch` as a clearer alternative to `git checkout` for branch operations.

### git checkout (Traditional)

```bash
# Switch to existing branch
git checkout <branch-name>
git checkout main
git checkout feature/user-auth

# Create and switch to new branch
git checkout -b <branch-name>
git checkout -b feature/new-feature

# Switch to previous branch
git checkout -

# Checkout specific commit (detached HEAD)
git checkout <commit-hash>
git checkout a1b2c3d
```

### git switch (Modern)

```bash
# Switch to existing branch
git switch <branch-name>
git switch main
git switch feature/user-auth

# Create and switch to new branch
git switch -c <branch-name>
git switch -c feature/new-feature

# Switch to previous branch
git switch -

# Switch to remote branch
git switch <remote-branch>
git switch origin/feature-branch
```

### git restore (File Operations)

```bash
# Restore file from staging
git restore --staged <file>

# Restore file from working directory
git restore <file>

# Restore file from specific commit
git restore --source=<commit> <file>
```

## Practical Branching Example

Let's add a contact form to our portfolio website using branches:

### Step 1: Create Feature Branch

```bash
# Start from main branch
git checkout main
git pull origin main  # Ensure we're up-to-date

# Create feature branch
git checkout -b feature/contact-form

# Verify current branch
git branch
```

Output:
```
* feature/contact-form
  main
```

### Step 2: Develop the Feature

```bash
# Create contact form HTML
cat > contact.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Contact - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Contact Me</h1>
    <form id="contact-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="message">Message:</label>
        <textarea id="message" name="message" required></textarea>
        
        <button type="submit">Send Message</button>
    </form>
    <script src="contact.js"></script>
</body>
</html>
EOF

# Create contact form JavaScript
cat > contact.js << EOF
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Simple validation
    if (name && email && message) {
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
    } else {
        alert('Please fill in all fields.');
    }
});
EOF

# Add contact form styles
cat >> style.css << EOF

/* Contact Form Styles */
form {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

label {
    display: block;
    margin-top: 10px;
    font-weight: bold;
}

input, textarea {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    box-sizing: border-box;
}

textarea {
    height: 100px;
    resize: vertical;
}

button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    margin-top: 10px;
}

button:hover {
    background-color: #0056b3;
}
EOF

# Update main page with navigation
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <a href="index.html">Home</a>
        <a href="contact.html">Contact</a>
    </nav>
    <h1>Welcome to my portfolio</h1>
    <p>This is my personal portfolio website.</p>
    <footer>© 2024 John Doe</footer>
    <script src="script.js"></script>
</body>
</html>
EOF
```

### Step 3: Commit Changes

```bash
# Check what we've changed
git status

# Add all new files
git add .

# Commit the feature
git commit -m "Add contact form feature

- Create contact.html with form structure
- Add contact.js for form validation
- Update style.css with form styling
- Add navigation to index.html"

# View commit history
git log --oneline
```

### Step 4: Push Feature Branch

```bash
# Push feature branch to remote
git push -u origin feature/contact-form
```

## Branch Naming Conventions

### Common Patterns

```bash
# Feature branches
feature/user-authentication
feature/shopping-cart
feature/payment-integration

# Bug fix branches
bugfix/login-error
bugfix/mobile-layout
hotfix/security-patch

# Release branches
release/v1.2.0
release/2024-01-15

# Experimental branches
experiment/new-ui
experiment/performance-test

# Personal branches
john/refactor-database
mary/update-dependencies
```

### Naming Best Practices

1. **Use lowercase**: `feature/user-auth` not `Feature/User-Auth`
2. **Use hyphens**: `feature/user-auth` not `feature/user_auth`
3. **Be descriptive**: `feature/user-authentication` not `feature/auth`
4. **Include ticket numbers**: `feature/JIRA-123-user-auth`
5. **Use prefixes**: `feature/`, `bugfix/`, `hotfix/`

## Working with Remote Branches

### Tracking Remote Branches

```bash
# List remote branches
git branch -r

# Create local branch from remote
git checkout -b local-branch origin/remote-branch

# Set upstream for existing branch
git branch --set-upstream-to=origin/remote-branch local-branch
# or
git push -u origin local-branch

# Check tracking information
git branch -vv
```

### Fetching Remote Branches

```bash
# Fetch all remote branches
git fetch origin

# Fetch specific remote branch
git fetch origin feature/new-feature

# Prune deleted remote branches
git fetch --prune origin
# or
git remote prune origin
```

## Branch Workflows

### Feature Branch Workflow

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Work on feature
# ... make changes ...
git add .
git commit -m "Implement new feature"

# 4. Push feature branch
git push -u origin feature/new-feature

# 5. Create Pull Request on GitHub
# 6. After review and approval, merge
# 7. Clean up
git checkout main
git pull origin main
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix the bug
# ... make changes ...
git add .
git commit -m "Fix critical security vulnerability"

# 3. Push and merge immediately
git push -u origin hotfix/critical-bug
# Merge via Pull Request or directly

# 4. Clean up
git checkout main
git pull origin main
git branch -d hotfix/critical-bug
```

## Viewing Branch History

### Graphical Log

```bash
# Simple graph
git log --graph --oneline

# Detailed graph
git log --graph --pretty=format:"%h -%d %s (%cr) <%an>" --abbrev-commit

# All branches
git log --graph --oneline --all

# Specific branches
git log --graph --oneline main feature/contact-form
```

Example output:
```
* b2c3d4e (HEAD -> feature/contact-form) Add contact form feature
* a1b2c3d (origin/main, main) Add footer to portfolio page
* 9e8f7g6 Add JavaScript functionality
* 5h4i3j2 Initial commit: Add portfolio website structure
```

### Comparing Branches

```bash
# Show commits in feature branch not in main
git log main..feature/contact-form

# Show commits in main not in feature branch
git log feature/contact-form..main

# Show differences between branches
git diff main..feature/contact-form

# Show file differences
git diff main..feature/contact-form --name-only
```

## Common Branch Operations

### Switching Between Branches

```bash
# Switch to main
git switch main

# Switch to feature branch
git switch feature/contact-form

# Switch to previous branch
git switch -

# Create and switch in one command
git switch -c feature/new-feature
```

### Renaming Branches

```bash
# Rename current branch
git branch -m new-branch-name

# Rename specific branch
git branch -m old-name new-name

# Update remote after renaming
git push origin --delete old-name
git push -u origin new-name
```

## Troubleshooting

### Issue 1: Can't Switch Branches (Uncommitted Changes)

```bash
# Option 1: Commit changes
git add .
git commit -m "Work in progress"
git switch other-branch

# Option 2: Stash changes
git stash
git switch other-branch
# Later: git stash pop

# Option 3: Discard changes
git restore .
git switch other-branch
```

### Issue 2: Branch Not Found

```bash
# Fetch latest remote branches
git fetch origin

# List all branches
git branch -a

# Create local branch from remote
git checkout -b local-branch origin/remote-branch
```

### Issue 3: Accidentally Deleted Branch

```bash
# Find the commit hash
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

## Best Practices

1. **Keep Branches Small**: Focus on single features or fixes
2. **Use Descriptive Names**: Make purpose clear from name
3. **Regular Updates**: Keep feature branches updated with main
4. **Clean Up**: Delete merged branches promptly
5. **Test Before Merging**: Ensure branches work correctly
6. **Document Changes**: Use clear commit messages

## Quick Reference

```bash
# Branch management
git branch                     # List branches
git branch <name>             # Create branch
git checkout -b <name>        # Create and switch
git switch <name>             # Switch branch
git branch -d <name>          # Delete branch

# Remote branches
git push -u origin <branch>   # Push new branch
git fetch origin              # Fetch remote branches
git branch -r                 # List remote branches

# Branch information
git log --graph --oneline     # Visual history
git branch -v                 # Branches with commits
git diff main..feature        # Compare branches
```

---

**Previous:** [Remote Repositories and GitHub](03-remote-repositories-github.md)  
**Next:** [Git Merge vs Rebase](05-merge-vs-rebase.md)