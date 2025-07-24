# Git Stash

Git stash is a powerful feature that temporarily saves your uncommitted changes, allowing you to switch branches or pull updates without committing incomplete work.

## What is Git Stash?

Stash creates a temporary snapshot of your:
- **Working directory changes** (modified files)
- **Staged changes** (files added to index)
- **Optionally untracked files**

Think of it as a "clipboard" for your work-in-progress.

## Basic Stash Operations

### git stash - Save Current Work

```bash
# Stash working directory and staged changes
git stash

# Stash with a descriptive message
git stash push -m "Work in progress on contact form validation"

# Stash including untracked files
git stash -u
# or
git stash --include-untracked

# Stash everything including ignored files
git stash -a
# or
git stash --all
```

### git stash pop - Restore Latest Stash

```bash
# Apply and remove latest stash
git stash pop

# Apply specific stash and remove it
git stash pop stash@{2}
```

### git stash apply - Restore Without Removing

```bash
# Apply latest stash but keep it in stash list
git stash apply

# Apply specific stash
git stash apply stash@{1}
```

## Practical Example: Emergency Bug Fix

Let's simulate a common scenario where you're working on a feature but need to fix an urgent bug:

### Scenario Setup

```bash
# Working on portfolio enhancement
cd portfolio-website
git checkout -b feature/portfolio-gallery

# Start working on image gallery
cat > gallery.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Portfolio Gallery</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>My Work</h1>
    <div class="gallery">
        <!-- TODO: Add image grid -->
        <div class="image-placeholder">Project 1</div>
        <div class="image-placeholder">Project 2</div>
    </div>
</body>
</html>
EOF

# Add some CSS (work in progress)
cat >> style.css << EOF

/* Gallery Styles - Work in Progress */
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.image-placeholder {
    height: 200px;
    background-color: #f0f0f0;
    border: 2px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    /* TODO: Add hover effects */
}
EOF

# Check current status
git status
```

Output:
```
On branch feature/portfolio-gallery
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   style.css

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        gallery.html

no changes added to commit
```

### Emergency: Need to Fix Bug on Main

```bash
# Urgent bug report comes in!
# Need to switch to main branch immediately

# Stash current work
git stash push -u -m "WIP: Portfolio gallery layout and styling"

# Verify clean working directory
git status
```

Output:
```
On branch feature/portfolio-gallery
nothing to commit, working tree clean
```

```bash
# Switch to main and fix bug
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/contact-form-validation

# Fix the bug (contact form wasn't validating email properly)
sed -i 's/type="email"/type="email" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"/' contact.html

# Commit the fix
git add contact.html
git commit -m "Fix email validation pattern in contact form"

# Merge hotfix
git checkout main
git merge hotfix/contact-form-validation
git push origin main

# Clean up hotfix branch
git branch -d hotfix/contact-form-validation
```

### Return to Feature Work

```bash
# Switch back to feature branch
git checkout feature/portfolio-gallery

# Restore stashed work
git stash pop

# Verify work is restored
git status
ls -la  # gallery.html should be back
```

## Managing Multiple Stashes

### Viewing Stashes

```bash
# List all stashes
git stash list

# Show stash contents
git stash show
git stash show stash@{1}

# Show detailed diff
git stash show -p
git stash show -p stash@{2}
```

### Creating Multiple Stashes

```bash
# Create first stash
echo "<!-- Adding navigation -->" >> index.html
git stash push -m "Navigation improvements"

# Make different changes
echo "/* Mobile responsive styles */" >> style.css
git stash push -m "Mobile responsive work"

# Make more changes
echo "console.log('Debug mode');" >> script.js
git stash push -m "Debug logging"

# View all stashes
git stash list
```

Output:
```
stash@{0}: On feature/portfolio-gallery: Debug logging
stash@{1}: On feature/portfolio-gallery: Mobile responsive work
stash@{2}: On feature/portfolio-gallery: Navigation improvements
stash@{3}: On feature/portfolio-gallery: WIP: Portfolio gallery layout and styling
```

### Applying Specific Stashes

```bash
# Apply specific stash by index
git stash apply stash@{2}

# Apply specific stash by partial name
git stash apply "stash@{1}"

# Pop specific stash
git stash pop stash@{0}
```

## Advanced Stash Operations

### Partial Stashing

```bash
# Stash only specific files
git stash push -m "Stash only CSS changes" style.css

# Interactive stashing (choose hunks)
git stash -p
# or
git stash --patch
```

Interactive stashing example:
```
diff --git a/style.css b/style.css
index 1234567..abcdefg 100644
--- a/style.css
+++ b/style.css
@@ -10,6 +10,10 @@ body {
     margin: 0;
 }
 
+/* New navigation styles */
+nav { background: blue; }
+
Stash this hunk [y,n,q,a,d,/,s,e,?]?
```

**Options:**
- `y` - stash this hunk
- `n` - do not stash this hunk
- `q` - quit; do not stash this hunk or any remaining
- `a` - stash this hunk and all later hunks
- `d` - do not stash this hunk or any later hunks
- `s` - split the current hunk into smaller hunks
- `e` - manually edit the current hunk

### Stash Branch

```bash
# Create new branch from stash
git stash branch new-feature-branch stash@{1}
```

This command:
1. Creates a new branch from the commit where stash was created
2. Applies the stash to the new branch
3. Removes the stash if applied successfully

### Stash Drop and Clear

```bash
# Remove specific stash
git stash drop stash@{1}

# Remove latest stash
git stash drop

# Remove all stashes
git stash clear
```

## Stash with Untracked and Ignored Files

### Including Untracked Files

```bash
# Create some untracked files
echo "temp data" > temp.txt
echo "cache data" > cache.dat

# Stash including untracked files
git stash -u -m "Include untracked files"

# Verify files are stashed
ls  # temp.txt and cache.dat should be gone

# Restore
git stash pop
ls  # files should be back
```

### Including Ignored Files

```bash
# Add to .gitignore
echo "*.log" >> .gitignore
echo "node_modules/" >> .gitignore

# Create ignored files
echo "debug info" > debug.log
mkdir node_modules
echo "dependency" > node_modules/package.txt

# Stash everything including ignored files
git stash -a -m "Include ignored files too"

# Check what was stashed
git stash show -p
```

## Practical Workflows

### Workflow 1: Quick Branch Switch

```bash
# Working on feature
# ... making changes ...

# Need to quickly check something on main
git stash
git checkout main
# ... check something ...
git checkout feature/branch
git stash pop

# Continue working
```

### Workflow 2: Pull Latest Changes

```bash
# Working on feature with uncommitted changes
git status  # shows modified files

# Need to pull latest from remote
git stash
git pull origin main
git stash pop

# Resolve any conflicts if they occur
```

### Workflow 3: Experiment Safely

```bash
# Save current work
git stash push -m "Stable version before experiment"

# Try experimental changes
# ... make risky changes ...

# If experiment fails
git reset --hard HEAD
git stash pop  # Restore stable version

# If experiment succeeds
git add .
git commit -m "Successful experiment"
git stash drop  # Remove backup
```

## Stash Conflicts and Resolution

### When Stash Pop Conflicts

```bash
# Create conflict scenario
echo "Original content" > conflict-file.txt
git add conflict-file.txt
git commit -m "Add conflict file"

# Modify and stash
echo "Stashed changes" > conflict-file.txt
git stash

# Modify same file differently
echo "Different changes" > conflict-file.txt
git add conflict-file.txt
git commit -m "Different changes to same file"

# Try to pop stash (will conflict)
git stash pop
```

Output:
```
Auto-merging conflict-file.txt
CONFLICT (content): Merge conflict in conflict-file.txt
The stash entry is kept in case you need it again.
```

### Resolving Stash Conflicts

```bash
# View conflicted file
cat conflict-file.txt
```

Output:
```
<<<<<<< Updated upstream
Different changes
=======
Stashed changes
>>>>>>> Stashed changes
```

```bash
# Resolve conflict manually
echo "Merged: Different changes and stashed changes" > conflict-file.txt

# Mark as resolved
git add conflict-file.txt

# Stash is automatically removed after successful resolution
git status
```

## Stash Best Practices

### 1. Use Descriptive Messages

```bash
# Good
git stash push -m "WIP: User authentication form validation"
git stash push -m "Debugging CSS grid layout issues"
git stash push -m "Experimental API integration approach"

# Bad
git stash
git stash push -m "stuff"
git stash push -m "changes"
```

### 2. Clean Up Regularly

```bash
# Review stashes periodically
git stash list

# Remove old/unnecessary stashes
git stash drop stash@{5}

# Clear all if needed
git stash clear
```

### 3. Prefer Commits for Important Work

```bash
# For important work, commit instead of stash
git add .
git commit -m "WIP: Important feature progress"

# Can always amend or squash later
git commit --amend
```

### 4. Use Stash for Temporary Storage

```bash
# Good use cases:
# - Quick branch switches
# - Pulling updates
# - Emergency bug fixes
# - Experimental changes

# Avoid for:
# - Long-term storage
# - Sharing with others
# - Important work
```

## Troubleshooting

### Stash Not Working

```bash
# Check if there are actually changes to stash
git status

# Stash requires changes in working directory or index
# If no changes, stash will say "No local changes to save"
```

### Lost Stash

```bash
# Find lost stashes in reflog
git fsck --unreachable | grep commit | cut -d' ' -f3 | xargs git log --merges --no-walk --grep=WIP

# Or check reflog
git reflog | grep stash
```

### Stash Apply Failed

```bash
# If stash apply fails due to conflicts
git stash show -p  # See what's in the stash
git reset --hard   # Reset to clean state
git stash apply    # Try again

# Or create a branch from stash
git stash branch temp-branch
```

## Quick Reference

```bash
# Basic stash operations
git stash                     # Stash changes
git stash push -m "message"   # Stash with message
git stash pop                 # Apply and remove latest stash
git stash apply               # Apply without removing
git stash list                # List all stashes

# Advanced operations
git stash -u                  # Include untracked files
git stash -p                  # Interactive stashing
git stash show -p             # Show stash diff
git stash drop stash@{1}      # Remove specific stash
git stash clear               # Remove all stashes

# Specific stash operations
git stash apply stash@{2}     # Apply specific stash
git stash branch new-branch   # Create branch from stash
```

---

**Previous:** [Git Merge vs Rebase](05-merge-vs-rebase.md)  
**Next:** [Git Diff and Log](07-git-diff-log.md)