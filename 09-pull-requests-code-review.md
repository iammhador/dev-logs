# Pull Requests and Code Review

Pull Requests (PRs) are GitHub's mechanism for proposing changes, facilitating code review, and managing collaborative development. They're essential for maintaining code quality and team coordination.

## What is a Pull Request?

A **Pull Request** is a request to merge changes from one branch into another. It provides:
- **Code Review**: Team members can review changes before merging
- **Discussion**: Comments and suggestions on specific lines
- **Testing**: Automated tests run on proposed changes
- **Documentation**: Clear description of what changes do
- **History**: Permanent record of why changes were made

## Pull Request Workflow

```
1. Create feature branch
2. Make changes and commit
3. Push branch to GitHub
4. Create Pull Request
5. Code review and discussion
6. Address feedback
7. Merge when approved
8. Clean up branches
```

## Creating Your First Pull Request

### Step 1: Prepare Feature Branch

```bash
# Start from updated main branch
cd portfolio-website
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-projects-section

# Add projects section to portfolio
cat > projects.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Projects - John Doe</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="projects.html">Projects</a>
            <a href="contact.html">Contact</a>
        </nav>
    </header>
    <main>
        <h1>My Projects</h1>
        <div class="projects-grid">
            <article class="project-card">
                <h3>E-commerce Website</h3>
                <p>Full-stack e-commerce solution built with React and Node.js</p>
                <div class="tech-stack">
                    <span>React</span>
                    <span>Node.js</span>
                    <span>MongoDB</span>
                </div>
                <a href="#" class="project-link">View Project</a>
            </article>
            <article class="project-card">
                <h3>Task Management App</h3>
                <p>Collaborative task management tool with real-time updates</p>
                <div class="tech-stack">
                    <span>Vue.js</span>
                    <span>Express</span>
                    <span>Socket.io</span>
                </div>
                <a href="#" class="project-link">View Project</a>
            </article>
            <article class="project-card">
                <h3>Weather Dashboard</h3>
                <p>Responsive weather application with location-based forecasts</p>
                <div class="tech-stack">
                    <span>JavaScript</span>
                    <span>API Integration</span>
                    <span>CSS Grid</span>
                </div>
                <a href="#" class="project-link">View Project</a>
            </article>
        </div>
    </main>
    <footer>© 2024 John Doe</footer>
</body>
</html>
EOF

# Add CSS for projects
cat >> style.css << EOF

/* Projects Section */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem 0;
}

.project-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.project-card h3 {
    color: #333;
    margin-bottom: 1rem;
}

.project-card p {
    color: #666;
    margin-bottom: 1rem;
    line-height: 1.6;
}

.tech-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.tech-stack span {
    background: #007bff;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
}

.project-link {
    display: inline-block;
    background: #28a745;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.project-link:hover {
    background: #218838;
}
EOF

# Update main navigation
sed -i 's|<a href="portfolio.html">Portfolio</a>|<a href="projects.html">Projects</a>|' index.html

# Commit changes
git add .
git commit -m "Add projects section with responsive grid layout

- Create projects.html with project showcase
- Add responsive CSS grid for project cards
- Include hover effects and tech stack tags
- Update navigation in index.html"
```

### Step 2: Push Branch to GitHub

```bash
# Push feature branch
git push -u origin feature/add-projects-section
```

Output:
```
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Delta compression using up to 8 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (5/5), 2.1 KiB | 2.1 MiB/s, done.
Total 5 (delta 2), reused 0 (delta 0)
remote: 
remote: Create a pull request for 'feature/add-projects-section' on GitHub by visiting:
remote:      https://github.com/yourusername/portfolio-website/pull/new/feature/add-projects-section
remote: 
To https://github.com/yourusername/portfolio-website.git
 * [new branch]      feature/add-projects-section -> feature/add-projects-section
Branch 'feature/add-projects-section' set up to track remote branch 'feature/add-projects-section' from 'origin'.
```

### Step 3: Create Pull Request on GitHub

1. **Go to GitHub repository**
2. **Click "Compare & pull request"** (appears after pushing)
3. **Fill out PR template:**

```markdown
## Description
Adds a comprehensive projects section to showcase portfolio work with responsive design and interactive elements.

## Changes Made
- ✅ Created projects.html with project showcase
- ✅ Added responsive CSS grid layout
- ✅ Implemented hover effects for better UX
- ✅ Added tech stack tags for each project
- ✅ Updated main navigation

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [x] Tested responsive design on mobile/desktop
- [x] Verified all links work correctly
- [x] Checked cross-browser compatibility
- [x] Validated HTML and CSS

## Screenshots
[Add screenshots of the new projects section]

## Checklist
- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex logic
- [x] No console errors
- [x] Responsive design tested
```

4. **Select reviewers**
5. **Add labels** (feature, frontend, etc.)
6. **Create pull request**

## Code Review Process

### As a Reviewer

#### 1. Review Checklist

```markdown
## Code Review Checklist

### Functionality
- [ ] Does the code do what it's supposed to do?
- [ ] Are there any edge cases not handled?
- [ ] Is error handling appropriate?

### Code Quality
- [ ] Is the code readable and well-structured?
- [ ] Are variable and function names descriptive?
- [ ] Is there unnecessary code duplication?
- [ ] Are comments helpful and up-to-date?

### Performance
- [ ] Are there any performance concerns?
- [ ] Are images optimized?
- [ ] Is CSS efficient?

### Security
- [ ] Are there any security vulnerabilities?
- [ ] Is user input properly validated?
- [ ] Are sensitive data properly handled?

### Testing
- [ ] Are there adequate tests?
- [ ] Do all tests pass?
- [ ] Is the feature manually tested?

### Documentation
- [ ] Is documentation updated?
- [ ] Are breaking changes documented?
```

#### 2. Providing Feedback

**Good Review Comments:**

```markdown
# Suggestion for improvement
Consider using CSS custom properties for consistent spacing:

```css
:root {
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}

.projects-grid {
  gap: var(--spacing-lg);
}
```

# Question about implementation
Why did you choose CSS Grid over Flexbox here? Grid works great, just curious about the decision.

# Positive feedback
Great use of hover effects! The subtle animation really enhances the user experience.

# Security concern
The project links are currently placeholder. When implementing real links, make sure to add `rel="noopener"` for external links.
```

**Avoid:**
- "This is wrong" → "Consider this alternative approach..."
- "Bad code" → "This could be improved by..."
- "Fix this" → "What do you think about..."

#### 3. Review Types

```bash
# Approve PR
"LGTM! Great work on the responsive design. The hover effects are a nice touch."

# Request changes
"The functionality looks good, but I have a few suggestions for code organization. Please see my inline comments."

# Comment only
"Nice implementation! I left a few optional suggestions for future improvements."
```

### As a PR Author

#### 1. Responding to Feedback

```bash
# Address feedback with new commits
git checkout feature/add-projects-section

# Make requested changes
echo ":root { --spacing-lg: 2rem; }" >> style.css
sed -i 's/gap: 2rem/gap: var(--spacing-lg)/' style.css

# Commit improvements
git add style.css
git commit -m "Use CSS custom properties for consistent spacing

Addresses review feedback about maintainable spacing values."

# Push updates
git push origin feature/add-projects-section
```

#### 2. Responding to Comments

```markdown
> Why did you choose CSS Grid over Flexbox here?

Good question! I chose CSS Grid because:
1. It handles both rows and columns automatically
2. The `auto-fit` and `minmax()` functions provide better responsive behavior
3. It's more semantic for this card-based layout

Flexbox would work too, but would require more media queries for the responsive behavior.
```

## Advanced PR Techniques

### 1. Draft Pull Requests

```bash
# Create draft PR for early feedback
# On GitHub: Check "Create draft pull request"
# Or use GitHub CLI:
gh pr create --draft --title "WIP: Add projects section" --body "Early version for feedback"
```

### 2. PR Templates

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)

## Additional Notes
```

### 3. Linking Issues

```markdown
## Description
Implements user authentication system

Closes #123
Fixes #456
Resolves #789
```

### 4. Co-authored Commits

```bash
# When pair programming
git commit -m "Add user authentication

Co-authored-by: Jane Doe <jane@example.com>"
```

## GitHub CLI for Pull Requests

### Installation

```bash
# Windows
winget install GitHub.cli

# macOS
brew install gh

# Linux
sudo apt install gh
```

### Authentication

```bash
# Login to GitHub
gh auth login

# Check status
gh auth status
```

### PR Commands

```bash
# Create PR
gh pr create --title "Add projects section" --body "Adds responsive projects showcase"

# Create draft PR
gh pr create --draft

# List PRs
gh pr list
gh pr list --state open
gh pr list --author @me

# View PR
gh pr view 123
gh pr view --web  # Open in browser

# Check out PR locally
gh pr checkout 123

# Review PR
gh pr review 123 --approve
gh pr review 123 --request-changes --body "Please fix the CSS issues"

# Merge PR
gh pr merge 123
gh pr merge 123 --squash
gh pr merge 123 --rebase

# Close PR
gh pr close 123
```

## PR Best Practices

### 1. Size and Scope

```bash
# Good: Small, focused PRs
git log --oneline main..feature/add-button  # 2-3 commits

# Avoid: Large, multi-purpose PRs
git log --oneline main..feature/redesign-everything  # 20+ commits
```

**Guidelines:**
- **< 400 lines changed**: Easy to review
- **400-1000 lines**: Manageable but requires focus
- **> 1000 lines**: Consider breaking into smaller PRs

### 2. Clear Descriptions

```markdown
# Good PR Description
## What
Adds user authentication with JWT tokens

## Why
Users need to log in to access personalized features

## How
- Implemented login/logout endpoints
- Added JWT middleware for protected routes
- Created user registration flow

## Testing
- Added unit tests for auth functions
- Tested login flow manually
- Verified token expiration handling
```

### 3. Commit Organization

```bash
# Before creating PR, clean up commits
git rebase -i HEAD~5

# Squash related commits
# Fix commit messages
# Remove debug commits
```

### 4. Self-Review

```bash
# Review your own changes before creating PR
git diff main..feature/branch

# Check for:
# - Debug code left behind
# - TODO comments
# - Formatting issues
# - Missing documentation
```

## Merge Strategies

### 1. Merge Commit

```bash
# Creates merge commit preserving branch history
git checkout main
git merge feature/branch
```

Result:
```
*   a1b2c3d Merge pull request #123 from feature/branch
|\  
| * d4e5f6g Add projects section
| * g7h8i9j Update navigation
|/  
* j0k1l2m Previous commit
```

### 2. Squash and Merge

```bash
# Combines all commits into single commit
# Available on GitHub PR interface
```

Result:
```
* a1b2c3d Add projects section (#123)
* j0k1l2m Previous commit
```

### 3. Rebase and Merge

```bash
# Replays commits without merge commit
git checkout main
git rebase feature/branch
```

Result:
```
* d4e5f6g Add projects section
* g7h8i9j Update navigation
* j0k1l2m Previous commit
```

## Automated Checks

### 1. Status Checks

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on:
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
    - name: Run linter
      run: npm run lint
    - name: Check formatting
      run: npm run format:check
```

### 2. Branch Protection Rules

```bash
# Configure on GitHub:
# Settings → Branches → Add rule

# Require:
# - Status checks to pass
# - Up-to-date branches
# - Review from code owners
# - Signed commits
```

## Troubleshooting

### PR Conflicts

```bash
# Update feature branch with latest main
git checkout feature/branch
git fetch origin
git rebase origin/main

# Resolve conflicts if any
# Push updated branch
git push --force-with-lease origin feature/branch
```

### Failed Checks

```bash
# Fix issues locally
npm run lint:fix
npm test

# Commit fixes
git add .
git commit -m "Fix linting issues"
git push origin feature/branch
```

### Accidental Force Push

```bash
# Check reflog for lost commits
git reflog

# Recover if needed
git reset --hard commit-hash
git push --force-with-lease origin feature/branch
```

## Quick Reference

```bash
# PR workflow
git checkout -b feature/branch    # Create feature branch
# ... make changes ...
git push -u origin feature/branch # Push to GitHub
# Create PR on GitHub interface

# GitHub CLI
gh pr create                      # Create PR
gh pr list                        # List PRs
gh pr checkout 123               # Checkout PR locally
gh pr review 123 --approve       # Approve PR
gh pr merge 123 --squash         # Merge PR

# Update PR
git add .
git commit -m "Address feedback"
git push origin feature/branch

# Clean up after merge
git checkout main
git pull origin main
git branch -d feature/branch
```

---

**Previous:** [Merge Conflicts](08-merge-conflicts.md)  
**Next:** [Forking and Upstream](10-forking-upstream.md)