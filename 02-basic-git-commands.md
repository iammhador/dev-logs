# Basic Git Commands

This chapter covers the fundamental Git commands you'll use daily. We'll continue with our portfolio website example.

## git init - Initialize a Repository

The `git init` command creates a new Git repository in the current directory.

```bash
# Initialize a new repository
git init

# Initialize with specific branch name
git init --initial-branch=main
# or
git init -b main
```

**What happens:**
- Creates a hidden `.git` directory
- Sets up the repository structure
- Creates the initial branch (usually `main` or `master`)

## git add - Stage Changes

The `git add` command moves changes from the working directory to the staging area.

```bash
# Add a specific file
git add README.md

# Add multiple files
git add index.html style.css

# Add all files in current directory
git add .

# Add all files in repository
git add -A

# Add files interactively
git add -i

# Add only tracked files (ignore new files)
git add -u
```

### Practical Example

```bash
# In our portfolio project
cd portfolio-website

# Check current status
git status

# Add README first
git add README.md
git status

# Add remaining files
git add index.html style.css
git status
```

Output after adding files:
```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
        new file:   index.html
        new file:   style.css
```

## git commit - Save Changes

The `git commit` command saves staged changes to the repository with a descriptive message.

```bash
# Commit with inline message
git commit -m "Add initial portfolio files"

# Commit with detailed message (opens editor)
git commit

# Add and commit tracked files in one step
git commit -am "Update existing files"

# Amend the last commit
git commit --amend -m "Updated commit message"
```

### Writing Good Commit Messages

**Good commit message structure:**
```
Subject line (50 characters or less)

Optional body explaining what and why
(wrap at 72 characters)
```

**Examples:**
```bash
# Good
git commit -m "Add responsive navigation menu"
git commit -m "Fix login button alignment on mobile devices"
git commit -m "Update dependencies to latest versions"

# Bad
git commit -m "fix"
git commit -m "changes"
git commit -m "updated stuff"
```

### Complete Example

```bash
# Commit our portfolio files
git commit -m "Initial commit: Add portfolio website structure

- Add README.md with project description
- Add index.html with basic HTML structure
- Add style.css with basic styling"
```

Output:
```
[main (root-commit) a1b2c3d] Initial commit: Add portfolio website structure
 3 files changed, 15 insertions(+)
 create mode 100644 README.md
 create mode 100644 index.html
 create mode 100644 style.css
```

## git status - Check Repository Status

The `git status` command shows the current state of your working directory and staging area.

```bash
# Basic status
git status

# Short format
git status -s
# or
git status --short

# Show branch info
git status -b
```

### Status Output Explained

```bash
# Create a new file and modify existing one
echo "console.log('Hello World');" > script.js
echo "<script src='script.js'></script>" >> index.html

git status
```

Output:
```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   index.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        script.js

no changes added to commit (use "git add" to track)
```

**Status indicators:**
- `modified:` - File has been changed since last commit
- `new file:` - File is staged and will be included in next commit
- `deleted:` - File has been removed
- `Untracked files:` - Files Git doesn't know about

## git log - View Commit History

The `git log` command displays the commit history.

```bash
# Basic log
git log

# One line per commit
git log --oneline

# Show last 3 commits
git log -3

# Show commits with file changes
git log --stat

# Show commits with actual changes
git log -p

# Graphical representation
git log --graph --oneline

# Pretty format
git log --pretty=format:"%h - %an, %ar : %s"
```

### Practical Examples

```bash
# Add and commit the new files
git add script.js index.html
git commit -m "Add JavaScript functionality"

# View commit history
git log --oneline
```

Output:
```
b2c3d4e Add JavaScript functionality
a1b2c3d Initial commit: Add portfolio website structure
```

```bash
# Detailed log with changes
git log --stat
```

Output:
```
commit b2c3d4e (HEAD -> main)
Author: Your Name <your.email@example.com>
Date:   Mon Jan 15 10:30:00 2024 -0500

    Add JavaScript functionality

 index.html | 1 +
 script.js  | 1 +
 2 files changed, 2 insertions(+)

commit a1b2c3d
Author: Your Name <your.email@example.com>
Date:   Mon Jan 15 10:00:00 2024 -0500

    Initial commit: Add portfolio website structure

 README.md  | 1 +
 index.html | 1 +
 style.css  | 1 +
 3 files changed, 3 insertions(+)
```

## Practical Workflow Example

Let's simulate a typical development workflow:

```bash
# 1. Check current status
git status

# 2. Create a new feature
echo "<footer>© 2024 John Doe</footer>" >> index.html
echo "footer { text-align: center; margin-top: 50px; }" >> style.css

# 3. Check what changed
git status
git diff  # Shows exact changes (covered in intermediate section)

# 4. Stage changes
git add index.html style.css

# 5. Verify staged changes
git status

# 6. Commit changes
git commit -m "Add footer to portfolio page"

# 7. View updated history
git log --oneline
```

## Common Scenarios and Solutions

### Unstaging Files

```bash
# Unstage a specific file
git restore --staged filename.txt
# or (older Git versions)
git reset HEAD filename.txt

# Unstage all files
git restore --staged .
```

### Discarding Changes

```bash
# Discard changes in working directory
git restore filename.txt
# or (older Git versions)
git checkout -- filename.txt

# Discard all changes
git restore .
```

### Viewing Differences

```bash
# See changes in working directory
git diff

# See staged changes
git diff --staged
# or
git diff --cached
```

## Best Practices

1. **Commit Often**: Make small, logical commits
2. **Write Clear Messages**: Describe what and why, not how
3. **Use Present Tense**: "Add feature" not "Added feature"
4. **Check Before Committing**: Always run `git status` and `git diff`
5. **Stage Selectively**: Don't always use `git add .`

## Quick Reference

```bash
# Basic workflow
git status                  # Check status
git add <file>             # Stage specific file
git add .                  # Stage all files
git commit -m "message"    # Commit with message
git log                    # View history
git log --oneline          # Compact history

# Undoing changes
git restore <file>         # Discard working changes
git restore --staged <file> # Unstage file
git commit --amend         # Modify last commit
```

---

**Previous:** [Git and GitHub Introduction](01-git-github-introduction.md)  
**Next:** [Remote Repositories and GitHub](03-remote-repositories-github.md)