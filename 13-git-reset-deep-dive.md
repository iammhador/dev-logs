# Git Reset Deep Dive

Git reset is a powerful command that allows you to undo changes by moving the HEAD pointer and optionally modifying the staging area and working directory. Understanding the different reset modes is crucial for effective Git workflow management.

## Understanding Git Reset

### The Three Trees of Git

Before diving into reset, it's important to understand Git's three trees:

1. **HEAD** - Points to the last commit snapshot
2. **Index (Staging Area)** - Proposed next commit snapshot
3. **Working Directory** - Sandbox where you make changes

### Visual Representation

```
Working Directory  →  git add  →  Staging Area  →  git commit  →  Repository (HEAD)
     (files)                        (index)                        (commits)
```

## Reset Modes Overview

### The Three Reset Modes

| Mode | HEAD | Index | Working Directory |
|------|------|-------|------------------|
| `--soft` | ✓ | ✗ | ✗ |
| `--mixed` (default) | ✓ | ✓ | ✗ |
| `--hard` | ✓ | ✓ | ✓ |

- ✓ = Modified
- ✗ = Unchanged

## Setting Up Examples

```bash
# Create example repository
mkdir git-reset-demo
cd git-reset-demo
git init

# Create initial commit
echo "Initial content" > file1.txt
echo "Another file" > file2.txt
git add .
git commit -m "Initial commit"

# Second commit
echo "Updated content" > file1.txt
echo "New file" > file3.txt
git add .
git commit -m "Second commit"

# Third commit
echo "Final content" > file1.txt
echo "Updated another file" > file2.txt
git add .
git commit -m "Third commit"

# Make some working directory changes
echo "Work in progress" >> file1.txt
echo "Staged changes" > file4.txt
git add file4.txt

# View current state
git status
git log --oneline
```

Output:
```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   file4.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   file1.txt

c3d4e5f (HEAD -> main) Third commit
b2c3d4e Second commit
a1b2c3d Initial commit
```

## Soft Reset (--soft)

### What Soft Reset Does

- Moves HEAD to specified commit
- Keeps staging area unchanged
- Keeps working directory unchanged
- Effectively "uncommits" changes but keeps them staged

### Practical Example

```bash
# Current state before reset
git log --oneline
git status

# Soft reset to previous commit
git reset --soft HEAD~1

# Check what happened
git log --oneline
git status
```

Output after soft reset:
```
b2c3d4e (HEAD -> main) Second commit
a1b2c3d Initial commit

On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   file1.txt
        modified:   file2.txt
        new file:   file4.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   file1.txt
```

### Use Cases for Soft Reset

#### 1. Amending Multiple Commits

```bash
# Reset to combine last 3 commits
git reset --soft HEAD~3

# All changes from those 3 commits are now staged
git status

# Create a single commit with better message
git commit -m "Implement complete user authentication system

- Add user registration
- Add login functionality  
- Add password validation
- Add session management"
```

#### 2. Splitting a Large Commit

```bash
# Reset the last commit but keep changes staged
git reset --soft HEAD~1

# Unstage specific files
git restore --staged file2.txt file3.txt

# Commit first part
git commit -m "Add user registration feature"

# Stage and commit second part
git add file2.txt
git commit -m "Add user validation"

# Stage and commit third part
git add file3.txt
git commit -m "Add password encryption"
```

#### 3. Fixing Commit Messages

```bash
# Reset to fix multiple commit messages
git reset --soft HEAD~2

# Recommit with better messages
git commit -m "First improved commit message"

# Add remaining changes and commit
git add .
git commit -m "Second improved commit message"
```

## Mixed Reset (--mixed)

### What Mixed Reset Does

- Moves HEAD to specified commit
- Resets staging area to match HEAD
- Keeps working directory unchanged
- This is the **default** reset mode

### Practical Example

```bash
# Setup: Create commits and stage some changes
echo "New feature" > feature.txt
git add feature.txt
git commit -m "Add new feature"

echo "Bug fix" > bugfix.txt
git add bugfix.txt
git commit -m "Fix critical bug"

# Make working directory and staging changes
echo "Work in progress" >> feature.txt
echo "Staged work" > staged.txt
git add staged.txt

# View current state
git status
git log --oneline

# Mixed reset (default behavior)
git reset HEAD~2

# Check what happened
git log --oneline
git status
```

Output after mixed reset:
```
a1b2c3d (HEAD -> main) Initial commit

On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        bugfix.txt
        feature.txt
        staged.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   file1.txt
```

### Use Cases for Mixed Reset

#### 1. Unstaging Files

```bash
# Stage multiple files
echo "Change 1" > file1.txt
echo "Change 2" > file2.txt
echo "Change 3" > file3.txt
git add .

# Unstage specific file
git reset file2.txt

# Or unstage all files
git reset

# Check status
git status
```

#### 2. Reorganizing Commits

```bash
# Reset to reorganize last few commits
git reset HEAD~3

# Now all changes are in working directory
# Stage related changes together
git add user-auth.js user-model.js
git commit -m "Add user authentication system"

git add user-profile.js user-settings.js
git commit -m "Add user profile management"

git add tests/
git commit -m "Add comprehensive user tests"
```

#### 3. Partial Commit Preparation

```bash
# After mixed reset, selectively stage changes
git add -p  # Interactive staging

# Or stage specific hunks
git add --patch file.txt
```

## Hard Reset (--hard)

### What Hard Reset Does

- Moves HEAD to specified commit
- Resets staging area to match HEAD
- Resets working directory to match HEAD
- **DESTRUCTIVE**: Loses all uncommitted changes

### ⚠️ Warning

**Hard reset is destructive and will permanently delete uncommitted changes. Always ensure you have backups or are certain you want to lose the changes.**

### Practical Example

```bash
# Setup: Create messy working state
echo "Experimental feature" > experiment.txt
echo "Debug code" >> file1.txt
echo "Temporary fix" > temp.txt
git add experiment.txt

# View current messy state
git status

# Hard reset to clean state
git reset --hard HEAD

# Check what happened - everything is clean
git status
ls  # experiment.txt and temp.txt are gone!
```

Output after hard reset:
```
HEAD is now at c3d4e5f Third commit
On branch main
nothing to commit, working tree clean
```

### Use Cases for Hard Reset

#### 1. Discarding All Local Changes

```bash
# When you want to start fresh from last commit
git reset --hard HEAD

# When you want to go back to specific commit
git reset --hard commit-hash

# When you want to match remote branch exactly
git fetch origin
git reset --hard origin/main
```

#### 2. Undoing Merge Conflicts

```bash
# During a problematic merge
git merge feature-branch
# ... conflicts occur ...

# Abort merge and reset to clean state
git reset --hard HEAD
```

#### 3. Emergency Cleanup

```bash
# When working directory is completely messed up
git reset --hard HEAD  # Back to last commit
git clean -fd          # Remove untracked files and directories
```

## Advanced Reset Scenarios

### Reset to Specific Commit

```bash
# Reset to specific commit hash
git reset --soft abc123
git reset --mixed def456
git reset --hard ghi789

# Reset to relative position
git reset --soft HEAD~3
git reset --mixed HEAD^^  # Same as HEAD~2
git reset --hard HEAD@{2}  # Using reflog
```

### Reset Specific Files

```bash
# Reset specific file to HEAD (unstage)
git reset file.txt

# Reset specific file to specific commit
git reset commit-hash file.txt

# Reset multiple files
git reset HEAD file1.txt file2.txt
```

### Practical File Reset Example

```bash
# Setup: Modify and stage files
echo "New content" > important.txt
echo "Other changes" > other.txt
git add .

# Reset only one file
git reset important.txt

# Check status
git status
```

Output:
```
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   other.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   important.txt
```

## Reset vs Other Commands

### Reset vs Revert

```bash
# Reset (changes history)
git reset --hard HEAD~1  # Removes commit from history

# Revert (creates new commit)
git revert HEAD          # Creates new commit that undoes changes
```

**Visual comparison:**
```
Before:
A---B---C (HEAD)

After reset --hard HEAD~1:
A---B (HEAD)

After revert HEAD:
A---B---C---D (HEAD, where D undoes C)
```

### Reset vs Checkout

```bash
# Reset (moves branch pointer)
git reset --hard commit-hash  # Moves current branch to commit

# Checkout (moves HEAD only)
git checkout commit-hash      # Detached HEAD state
git checkout branch-name      # Switch to branch
```

### Reset vs Restore

```bash
# Reset (affects staging area)
git reset file.txt           # Unstage file

# Restore (affects working directory or staging)
git restore file.txt         # Discard working directory changes
git restore --staged file.txt # Unstage file (same as reset)
git restore --source=HEAD~1 file.txt  # Restore from specific commit
```

## Dangerous Reset Scenarios

### Recovering from Accidental Hard Reset

```bash
# Accidentally did hard reset
git reset --hard HEAD~5  # Oops! Lost 5 commits

# Use reflog to find lost commits
git reflog
```

Output:
```
abc123 (HEAD -> main) HEAD@{0}: reset: moving to HEAD~5
def456 HEAD@{1}: commit: Important feature
ghi789 HEAD@{2}: commit: Bug fix
jkl012 HEAD@{3}: commit: Documentation update
...
```

```bash
# Recover by resetting to previous state
git reset --hard HEAD@{1}  # Back to "Important feature"

# Or reset to specific commit
git reset --hard def456
```

### Protecting Against Accidental Reset

```bash
# Create backup branch before risky operations
git branch backup-$(date +%Y%m%d-%H%M%S)

# Or create tag
git tag backup-before-reset

# Then do risky reset
git reset --hard HEAD~10

# If needed, recover
git reset --hard backup-before-reset
```

## Reset in Team Environments

### Safe Reset Practices

```bash
# NEVER reset commits that have been pushed and shared
# BAD:
git reset --hard HEAD~3
git push --force  # Dangerous!

# GOOD: Use revert instead
git revert HEAD~2..HEAD
git push  # Safe
```

### Reset Private Branches

```bash
# Safe to reset private feature branches
git checkout feature/my-work
git reset --hard HEAD~5  # OK - private branch

# When ready to share
git push --force-with-lease origin feature/my-work
```

## Practical Reset Workflows

### Workflow 1: Clean Commit History

```bash
#!/bin/bash
# Script: clean-history.sh

clean_last_commits() {
    local num_commits=$1
    local new_message="$2"
    
    echo "Cleaning last $num_commits commits"
    
    # Backup current state
    git branch "backup-$(date +%Y%m%d-%H%M%S)"
    
    # Soft reset to keep changes
    git reset --soft "HEAD~$num_commits"
    
    # Recommit with clean message
    git commit -m "$new_message"
    
    echo "History cleaned. Backup branch created."
}

# Usage: clean_last_commits 3 "Implement user authentication system"
```

### Workflow 2: Selective File Reset

```bash
#!/bin/bash
# Script: selective-reset.sh

reset_files_to_commit() {
    local commit=$1
    shift
    local files=("$@")
    
    echo "Resetting files to $commit"
    
    for file in "${files[@]}"; do
        echo "Resetting $file"
        git reset "$commit" "$file"
    done
    
    echo "Files reset. Review changes with 'git status'"
}

# Usage: reset_files_to_commit HEAD~2 file1.txt file2.txt
```

### Workflow 3: Emergency Cleanup

```bash
#!/bin/bash
# Script: emergency-cleanup.sh

emergency_cleanup() {
    echo "⚠️  Emergency cleanup - this will lose all uncommitted changes!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        # Reset to clean state
        git reset --hard HEAD
        
        # Remove untracked files
        git clean -fd
        
        # Sync with remote
        git fetch origin
        git reset --hard origin/$(git branch --show-current)
        
        echo "✓ Emergency cleanup complete"
    else
        echo "Cleanup cancelled"
    fi
}
```

## Reset Best Practices

### 1. Always Backup Before Destructive Operations

```bash
# Create backup branch
git branch backup-before-reset

# Or create tag
git tag backup-$(date +%Y%m%d-%H%M%S)

# Then do reset
git reset --hard HEAD~5
```

### 2. Use Appropriate Reset Mode

```bash
# For uncommitting but keeping changes
git reset --soft HEAD~1

# For unstaging files
git reset file.txt

# For complete cleanup (be careful!)
git reset --hard HEAD
```

### 3. Understand the Impact

```bash
# Check what will be affected
git log --oneline HEAD~5..HEAD  # See commits that will be reset
git diff HEAD~5                # See changes that will be lost

# Then decide on reset mode
```

### 4. Never Reset Shared Commits

```bash
# Check if commits are pushed
git log origin/main..HEAD  # Commits not yet pushed (safe to reset)
git log HEAD..origin/main  # Commits on remote (don't reset)
```

## Troubleshooting Reset

### Common Issues and Solutions

#### 1. Accidentally Lost Commits

```bash
# Use reflog to find lost commits
git reflog --all

# Reset to previous state
git reset --hard HEAD@{n}

# Or cherry-pick specific commits
git cherry-pick lost-commit-hash
```

#### 2. Reset Didn't Work as Expected

```bash
# Check current state
git status
git log --oneline

# Check reflog to see what happened
git reflog

# Reset to previous state if needed
git reset --hard HEAD@{1}
```

#### 3. Partial Reset Issues

```bash
# If file reset didn't work
git status  # Check current state

# Reset file properly
git reset HEAD file.txt

# Or restore from specific commit
git restore --source=commit-hash file.txt
```

### Recovery Commands

```bash
# Find lost commits
git reflog
git fsck --lost-found

# Recover specific commit
git reset --hard commit-hash
git cherry-pick commit-hash

# Recover from backup
git reset --hard backup-branch
git reset --hard backup-tag
```

## Quick Reference

```bash
# Reset modes
git reset --soft HEAD~1     # Uncommit, keep staged and working changes
git reset --mixed HEAD~1    # Uncommit, unstage, keep working changes (default)
git reset --hard HEAD~1     # Uncommit, unstage, discard all changes

# File operations
git reset file.txt          # Unstage file
git reset HEAD~1 file.txt   # Reset file to previous commit
git reset --hard            # Reset everything to HEAD

# Specific targets
git reset commit-hash       # Reset to specific commit
git reset HEAD~3            # Reset 3 commits back
git reset HEAD@{2}          # Reset using reflog

# Safety
git reflog                  # View reset history
git reset --hard HEAD@{1}   # Undo last reset
git branch backup           # Create backup before reset

# Alternatives
git revert HEAD             # Undo with new commit (safe for shared history)
git restore file.txt        # Discard working directory changes
git restore --staged file   # Unstage file (alternative to reset)
```

---

**Previous:** [Git Cherry-pick](12-git-cherry-pick.md)  
**Next:** [Git Reflog Recovery](14-git-reflog-recovery.md)