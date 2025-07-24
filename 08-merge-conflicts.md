# Resolving Merge Conflicts

Merge conflicts occur when Git cannot automatically merge changes from different branches. Understanding how to resolve them is essential for collaborative development.

## What Causes Merge Conflicts?

Conflicts happen when:

- **Same lines modified**: Two branches change the same lines differently
- **File deleted vs modified**: One branch deletes a file, another modifies it
- **Rename conflicts**: File renamed differently in each branch
- **Binary file conflicts**: Binary files changed in both branches

## Understanding Conflict Markers

When Git encounters a conflict, it adds special markers to the file:

```
Content from merging branch
```

**Markers explained:**

- `<<<<<<< HEAD`: Start of current branch content
- `=======`: Separator between conflicting content
- `>>>>>>> branch-name`: End of merging branch content

## Creating a Conflict Scenario

Let's create a realistic conflict scenario with our portfolio project:

### Setup: Create Conflicting Changes

```bash
# Start from main branch
cd portfolio-website
git checkout main
git pull origin main

# Create feature branch for team member 1
git checkout -b feature/update-homepage

# Team member 1 updates the homepage
cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Senior Web Developer</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
        </nav>
    </header>
    <main>
        <h1>Senior Web Developer</h1>
        <p>I specialize in modern web technologies and have 5+ years of experience.</p>
        <section id="experience">
            <h2>Experience</h2>
            <ul>
                <li>Senior Developer at TechCorp (2022-Present)</li>
                <li>Full-Stack Developer at StartupXYZ (2020-2022)</li>
            </ul>
        </section>
    </main>
    <footer>© 2024 John Doe - All Rights Reserved</footer>
</body>
</html>
EOF

# Commit team member 1's changes
git add index.html
git commit -m "Update homepage with senior developer profile"

# Switch back to main and create another feature branch
git checkout main
git checkout -b feature/redesign-homepage

# Team member 2 redesigns the homepage differently
cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Creative Developer</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="portfolio.html">Portfolio</a>
            <a href="contact.html">Contact</a>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h1>Creative Web Developer</h1>
            <p>Passionate about creating beautiful and functional web experiences.</p>
        </section>
        <section id="skills">
            <h2>Core Skills</h2>
            <div class="skills-grid">
                <div>Frontend Development</div>
                <div>UI/UX Design</div>
                <div>JavaScript Frameworks</div>
            </div>
        </section>
    </main>
    <footer>© 2024 John Doe</footer>
</body>
</html>
EOF

# Commit team member 2's changes
git add index.html
git commit -m "Redesign homepage with creative developer focus"
```

### Simulate Merge Conflict

```bash
# Merge first feature into main
git checkout main
git merge feature/update-homepage

# Now try to merge second feature (this will conflict)
git merge feature/redesign-homepage
```

Output:

```
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

## Examining the Conflict

```bash
# Check repository status
git status
```

Output:

```
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   index.html

no changes added to commit (use "git add" to track)
```

```bash
# View the conflicted file
cat index.html
```

Output:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>John Doe - Creative Developer</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header>
      <nav>
        <a href="index.html">Home</a>
        <a href="portfolio.html">Portfolio</a>
        <a href="contact.html">Contact</a>
      </nav>
    </header>
    <main>
      <section class="hero">
        <h1>Creative Web Developer</h1>
        <p>
          Passionate about creating beautiful and functional web experiences.
        </p>
      </section>
      <section id="skills">
        <h2>Core Skills</h2>
        <div class="skills-grid">
          <div>Frontend Development</div>
          <div>UI/UX Design</div>
          <div>JavaScript Frameworks</div>
        </div>
      </section>
    </main>
    <footer>© 2024 John Doe</footer>
  </body>
</html>
```

## Manual Conflict Resolution

### Step 1: Analyze the Conflict

Look at both versions and decide:

- Which parts to keep from each version
- What new content to create
- How to combine the best of both

### Step 2: Edit the File

```bash
# Edit index.html to resolve conflicts
cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Senior Creative Developer</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="portfolio.html">Portfolio</a>
            <a href="contact.html">Contact</a>
        </nav>
    </header>
    <main>
        <section class="hero">
            <h1>Senior Creative Developer</h1>
            <p>I specialize in modern web technologies with 5+ years of experience, passionate about creating beautiful and functional web experiences.</p>
        </section>
        <section id="experience">
            <h2>Professional Experience</h2>
            <ul>
                <li>Senior Developer at TechCorp (2022-Present)</li>
                <li>Full-Stack Developer at StartupXYZ (2020-2022)</li>
            </ul>
        </section>
        <section id="skills">
            <h2>Core Skills</h2>
            <div class="skills-grid">
                <div>Frontend Development</div>
                <div>UI/UX Design</div>
                <div>JavaScript Frameworks</div>
            </div>
        </section>
    </main>
    <footer>© 2024 John Doe - All Rights Reserved</footer>
</body>
</html>
EOF
```

### Step 3: Mark as Resolved

```bash
# Add the resolved file
git add index.html

# Check status
git status
```

Output:

```
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   index.html
```

### Step 4: Complete the Merge

```bash
# Commit the merge
git commit -m "Merge feature/redesign-homepage: Combine senior and creative developer profiles

- Merged navigation from both branches
- Combined experience and skills sections
- Updated title to reflect both senior and creative aspects"

# View the result
git log --oneline --graph -5
```

## Using Merge Tools

### Configure Merge Tool

```bash
# Configure VS Code as merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Configure Vim as merge tool
git config --global merge.tool vimdiff

# Configure other tools
git config --global merge.tool meld      # Linux
git config --global merge.tool opendiff  # macOS
git config --global merge.tool tortoisemerge  # Windows
```

### Using Merge Tool

```bash
# When conflicts occur, launch merge tool
git mergetool

# Launch specific tool
git mergetool --tool=vscode

# Don't prompt for each file
git config --global mergetool.prompt false
```

### VS Code Merge Interface

VS Code provides a visual interface with:

- **Accept Current Change**: Keep HEAD version
- **Accept Incoming Change**: Keep merging branch version
- **Accept Both Changes**: Keep both versions
- **Compare Changes**: Side-by-side comparison

## Different Types of Conflicts

### 1. Content Conflicts

Most common - same lines modified differently:

```bash
# Create content conflict
echo "Version A content" > conflict-file.txt
git add conflict-file.txt
git commit -m "Add version A"

git checkout -b feature-b
echo "Version B content" > conflict-file.txt
git add conflict-file.txt
git commit -m "Add version B"

git checkout main
echo "Version A updated" > conflict-file.txt
git add conflict-file.txt
git commit -m "Update version A"

git merge feature-b  # Conflict!
```

### 2. Delete vs Modify Conflicts

```bash
# Create delete vs modify conflict
echo "Original content" > temp-file.txt
git add temp-file.txt
git commit -m "Add temp file"

# Branch 1: Delete file
git checkout -b delete-branch
git rm temp-file.txt
git commit -m "Remove temp file"

# Branch 2: Modify file
git checkout main
echo "Modified content" > temp-file.txt
git add temp-file.txt
git commit -m "Modify temp file"

git merge delete-branch  # Conflict!
```

Resolution:

```bash
# Decide to keep the file
git add temp-file.txt

# Or decide to delete it
git rm temp-file.txt

git commit -m "Resolve delete vs modify conflict"
```

### 3. Rename Conflicts

```bash
# Create rename conflict
echo "File content" > original.txt
git add original.txt
git commit -m "Add original file"

# Branch 1: Rename to name A
git checkout -b rename-a
git mv original.txt renamed-a.txt
git commit -m "Rename to renamed-a.txt"

# Branch 2: Rename to name B
git checkout main
git mv original.txt renamed-b.txt
git commit -m "Rename to renamed-b.txt"

git merge rename-a  # Conflict!
```

## Advanced Conflict Resolution

### Using git diff for Conflicts

```bash
# Show conflicts in diff format
git diff

# Show conflicts with more context
git diff --conflict=diff3

# Show only conflicted files
git diff --name-only --diff-filter=U
```

### Three-Way Merge View

```bash
# Configure diff3 conflict style
git config --global merge.conflictstyle diff3
```

This shows:

```
Merging branch content
```

### Resolving Conflicts in Chunks

```bash
# Stage resolved parts of a file
git add --patch conflicted-file.txt

# Interactive staging
git add -i
```

## Preventing Conflicts

### 1. Communication

```bash
# Check what others are working on
git log --oneline --since="1 week ago" --author="teammate"

# See current branches
git branch -a

# Check recent activity
git log --graph --oneline --all -10
```

### 2. Frequent Integration

```bash
# Regularly update feature branches
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Or merge main into feature
git merge origin/main
```

### 3. Small, Focused Changes

```bash
# Make smaller, focused commits
git add specific-file.js
git commit -m "Add specific function"

# Avoid large, sweeping changes
# Break big features into smaller parts
```

### 4. Code Organization

```bash
# Work on different files when possible
# Use modular architecture
# Separate concerns into different files
```

## Conflict Resolution Strategies

### Strategy 1: Accept One Side

```bash
# Accept current branch (ours)
git checkout --ours conflicted-file.txt
git add conflicted-file.txt

# Accept merging branch (theirs)
git checkout --theirs conflicted-file.txt
git add conflicted-file.txt
```

### Strategy 2: Manual Merge

```bash
# Edit file manually to combine both sides
# Remove conflict markers
# Test the result
git add conflicted-file.txt
```

### Strategy 3: Abort and Retry

```bash
# Abort current merge
git merge --abort

# Try different approach
git rebase feature/branch  # Instead of merge
# Or update branch first
git checkout feature/branch
git rebase main
git checkout main
git merge feature/branch
```

## Testing After Resolution

```bash
# Always test after resolving conflicts
npm test           # Run test suite
npm run build      # Check if build works
npm start          # Test application

# Check syntax
npm run lint       # Run linter
git diff --check   # Check for whitespace errors
```

## Best Practices

### 1. Understand the Changes

```bash
# Before resolving, understand what each side does
git show HEAD                    # Current branch changes
git show MERGE_HEAD             # Merging branch changes
git log --oneline HEAD..MERGE_HEAD  # Commits being merged
```

### 2. Communicate with Team

```bash
# If unsure, ask the author of conflicting changes
git log --oneline --author="teammate" -- conflicted-file.txt

# Check commit messages for context
git show commit-hash
```

### 3. Test Thoroughly

```bash
# Test the merged result
# Run automated tests
# Manual testing of affected features
# Code review if needed
```

### 4. Document Resolution

```bash
# Write clear merge commit messages
git commit -m "Merge feature/branch: Resolve navigation conflicts

- Combined navigation items from both branches
- Kept About page from feature/update-homepage
- Kept Portfolio page from feature/redesign-homepage
- Tested all navigation links"
```

## Troubleshooting

### Conflict Resolution Gone Wrong

```bash
# Undo merge commit (if not pushed)
git reset --hard HEAD~1

# Redo the merge
git merge feature/branch
```

### Lost Changes During Resolution

```bash
# Check reflog for lost commits
git reflog

# Recover lost changes
git checkout commit-hash -- lost-file.txt
```

### Merge Tool Issues

```bash
# Reset merge tool configuration
git config --global --unset merge.tool

# Use built-in merge resolution
git checkout --conflict=merge conflicted-file.txt
```

## Quick Reference

```bash
# Conflict resolution workflow
git status                    # Check conflicted files
git diff                      # See conflicts
# Edit files to resolve conflicts
git add resolved-file.txt     # Mark as resolved
git commit                    # Complete merge

# Merge tools
git mergetool                 # Launch merge tool
git mergetool --tool=vscode   # Use specific tool

# Conflict strategies
git checkout --ours file.txt  # Accept current branch
git checkout --theirs file.txt # Accept merging branch
git merge --abort             # Abort merge

# Prevention
git fetch origin              # Stay updated
git rebase origin/main        # Update feature branch
git log --graph --oneline     # Check branch status
```

---

**Previous:** [Git Diff and Log](07-git-diff-log.md)  
**Next:** [Pull Requests and Code Review](09-pull-requests-code-review.md)
