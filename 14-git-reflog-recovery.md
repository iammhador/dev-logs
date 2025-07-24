# Git Reflog Recovery

Git reflog (reference log) is a powerful recovery mechanism that tracks changes to branch tips and other references. It's your safety net for recovering "lost" commits, undoing destructive operations, and understanding your Git history.

## Understanding Git Reflog

### What is Reflog?

Reflog maintains a local history of where your branch tips have been. Unlike the commit history (which can be rewritten), reflog is a local safety mechanism that records:

- Every commit
- Every branch switch
- Every reset operation
- Every rebase
- Every merge
- Every pull operation

### Reflog vs Git Log

```bash
# Git log shows commit history
git log --oneline
# Output: Linear commit history

# Git reflog shows reference history
git reflog
# Output: Every action that moved HEAD
```

**Visual comparison:**
```
Git Log (commit history):
A---B---C---D (current)

Git Reflog (reference history):
HEAD@{0}: commit: D
HEAD@{1}: commit: C
HEAD@{2}: reset: moving to B
HEAD@{3}: commit: C (before reset)
HEAD@{4}: commit: B
HEAD@{5}: commit: A
```

## Setting Up Examples

```bash
# Create example repository
mkdir reflog-demo
cd reflog-demo
git init

# Create initial commits
echo "Initial content" > file1.txt
git add file1.txt
git commit -m "Initial commit"

echo "Second version" > file1.txt
echo "New file" > file2.txt
git add .
git commit -m "Second commit"

echo "Third version" > file1.txt
git add file1.txt
git commit -m "Third commit"

echo "Fourth version" > file1.txt
git add file1.txt
git commit -m "Fourth commit"

# View initial state
git log --oneline
git reflog
```

Output:
```
# Git log
d4e5f6g (HEAD -> main) Fourth commit
c3d4e5f Third commit
b2c3d4e Second commit
a1b2c3d Initial commit

# Git reflog
d4e5f6g (HEAD -> main) HEAD@{0}: commit: Fourth commit
c3d4e5f HEAD@{1}: commit: Third commit
b2c3d4e HEAD@{2}: commit: Second commit
a1b2c3d HEAD@{3}: commit (initial): Initial commit
```

## Basic Reflog Operations

### Viewing Reflog

```bash
# View reflog for current branch
git reflog

# View reflog for specific branch
git reflog main
git reflog feature/branch

# View reflog for all references
git reflog --all

# View reflog with dates
git reflog --date=iso

# View reflog with relative dates
git reflog --date=relative
```

### Reflog Output Format

```bash
# Standard reflog output
git reflog
```

Output explanation:
```
d4e5f6g HEAD@{0}: commit: Fourth commit
│       │        │       └─ Action description
│       │        └─ Action type
│       └─ Reflog reference (0 = most recent)
└─ Commit hash
```

### Detailed Reflog Information

```bash
# Show reflog with full commit info
git log -g --oneline

# Show reflog with patches
git log -g -p

# Show reflog with stat
git log -g --stat
```

## Recovery Scenarios

### Scenario 1: Recovering from Accidental Hard Reset

```bash
# Create scenario: accidental hard reset
git log --oneline
# Shows: d4e5f6g, c3d4e5f, b2c3d4e, a1b2c3d

# Accidentally reset too far back
git reset --hard HEAD~3

# Check current state
git log --oneline
# Shows only: a1b2c3d Initial commit

# OH NO! Lost 3 commits!
# Use reflog to find them
git reflog
```

Output:
```
a1b2c3d (HEAD -> main) HEAD@{0}: reset: moving to HEAD~3
d4e5f6g HEAD@{1}: commit: Fourth commit
c3d4e5f HEAD@{2}: commit: Third commit
b2c3d4e HEAD@{3}: commit: Second commit
a1b2c3d HEAD@{4}: commit (initial): Initial commit
```

```bash
# Recover by resetting to before the accidental reset
git reset --hard HEAD@{1}

# Verify recovery
git log --oneline
# Shows: d4e5f6g, c3d4e5f, b2c3d4e, a1b2c3d (recovered!)
```

### Scenario 2: Recovering Deleted Branch

```bash
# Create and work on feature branch
git checkout -b feature/important-work
echo "Important feature" > important.txt
git add important.txt
git commit -m "Add important feature"

echo "Critical fix" >> important.txt
git add important.txt
git commit -m "Critical fix for important feature"

# Switch back to main
git checkout main

# Accidentally delete the branch
git branch -D feature/important-work

# OH NO! Important work is gone!
# Use reflog to find the branch
git reflog --all | grep "important-work"
```

Output:
```
f7g8h9i refs/heads/feature/important-work@{0}: commit: Critical fix for important feature
e6f7g8h refs/heads/feature/important-work@{1}: commit: Add important feature
d4e5f6g refs/heads/feature/important-work@{2}: branch: Created from HEAD
```

```bash
# Recover the branch
git checkout -b feature/important-work f7g8h9i

# Verify recovery
git log --oneline
# Shows the recovered commits
```

### Scenario 3: Recovering from Failed Rebase

```bash
# Create scenario: complex rebase that went wrong
git checkout -b feature/complex
echo "Feature 1" > feature1.txt
git add feature1.txt
git commit -m "Add feature 1"

echo "Feature 2" > feature2.txt
git add feature2.txt
git commit -m "Add feature 2"

echo "Feature 3" > feature3.txt
git add feature3.txt
git commit -m "Add feature 3"

# Attempt interactive rebase that goes wrong
git rebase -i HEAD~3
# ... something goes wrong during rebase ...
# Let's say we abort it
git rebase --abort

# But what if we want to see the state before rebase?
git reflog
```

Output:
```
j3k4l5m (HEAD -> feature/complex) HEAD@{0}: rebase (abort): updating HEAD
j3k4l5m HEAD@{1}: rebase (start): checkout HEAD~3
j3k4l5m HEAD@{2}: commit: Add feature 3
i2j3k4l HEAD@{3}: commit: Add feature 2
h1i2j3k HEAD@{4}: commit: Add feature 1
```

```bash
# We can see exactly what happened and when
# If needed, we can reset to any previous state
git reset --hard HEAD@{2}  # Back to before rebase
```

## Advanced Reflog Usage

### Finding Specific Operations

```bash
# Find all resets
git reflog | grep reset

# Find all merges
git reflog | grep merge

# Find all rebases
git reflog | grep rebase

# Find all checkouts
git reflog | grep checkout

# Find operations from specific time
git reflog --since="2 hours ago"
git reflog --until="yesterday"
```

### Reflog for Specific References

```bash
# Reflog for specific branch
git reflog refs/heads/main
git reflog refs/heads/feature/branch

# Reflog for remote tracking branches
git reflog refs/remotes/origin/main

# Reflog for tags (if they've been moved)
git reflog refs/tags/v1.0

# Reflog for stash
git reflog refs/stash
```

### Practical Example: Complex Recovery

```bash
# Create complex scenario
git checkout main
git checkout -b feature/user-auth

# Multiple commits
echo "User model" > user.js
git add user.js
git commit -m "Add user model"

echo "Auth service" > auth.js
git add auth.js
git commit -m "Add authentication service"

echo "Login component" > login.js
git add login.js
git commit -m "Add login component"

# Merge to main
git checkout main
git merge feature/user-auth --no-ff

# Continue development
echo "Bug fix" >> user.js
git add user.js
git commit -m "Fix user model bug"

# Realize we need to undo the merge and fix something first
# Find the merge in reflog
git reflog | grep merge
```

Output:
```
p6q7r8s HEAD@{1}: merge feature/user-auth: Merge made by the 'recursive' strategy.
```

```bash
# Reset to before merge
git reset --hard HEAD@{2}  # Before the merge

# Now we can fix issues and re-merge later
```

## Reflog Expiration and Cleanup

### Understanding Reflog Expiration

Reflog entries are not permanent and will expire:

- **Reachable commits**: Expire after 90 days (default)
- **Unreachable commits**: Expire after 30 days (default)
- **Reflog entries**: Expire after 90 days (default)

### Configuring Reflog Expiration

```bash
# View current reflog settings
git config --get gc.reflogExpire
git config --get gc.reflogExpireUnreachable

# Set custom expiration times
git config gc.reflogExpire "180.days"  # 6 months for reachable
git config gc.reflogExpireUnreachable "60.days"  # 2 months for unreachable

# Never expire reflog (not recommended)
git config gc.reflogExpire "never"

# Per-branch reflog settings
git config gc.refs/heads/main.reflogExpire "365.days"
```

### Manual Reflog Management

```bash
# Clean up reflog manually
git reflog expire --expire=30.days --all

# Clean up unreachable entries
git reflog expire --expire-unreachable=7.days --all

# Force garbage collection
git gc --prune=now

# View reflog size
git count-objects -v
```

### Backup Important Reflog Entries

```bash
# Export reflog to file
git reflog > reflog-backup-$(date +%Y%m%d).txt

# Create permanent branches for important states
git branch backup-before-major-change HEAD@{5}
git tag important-state HEAD@{10}
```

## Recovery Strategies

### Strategy 1: Time-based Recovery

```bash
# Find state from specific time
git reflog --date=iso

# Reset to specific time
git reset --hard 'HEAD@{2 hours ago}'
git reset --hard 'HEAD@{yesterday}'
git reset --hard 'HEAD@{2023-12-01 14:30:00}'
```

### Strategy 2: Operation-based Recovery

```bash
# Find specific operation
git reflog | grep "merge feature/important"
git reflog | grep "rebase (start)"
git reflog | grep "reset: moving to"

# Reset to before that operation
git reset --hard HEAD@{n}
```

### Strategy 3: Content-based Recovery

```bash
# Search for commits with specific content
git log -g --grep="important feature"
git log -g -S"function importantFunction"

# Show changes in reflog entries
git show HEAD@{5}
git diff HEAD@{5} HEAD@{3}
```

## Reflog in Team Environments

### Understanding Reflog Limitations

```bash
# Reflog is LOCAL only - not shared with team
# Each developer has their own reflog

# Reflog doesn't track:
# - Other people's actions
# - Actions on remote repositories
# - Actions before you cloned the repository
```

### Team Recovery Strategies

```bash
# For team recovery, use:
# 1. Remote branches
git fetch origin
git reset --hard origin/main

# 2. Tags
git reset --hard v1.2.3

# 3. Shared backup branches
git reset --hard backup/before-major-change

# 4. Communication
# Ask team members for commit hashes
```

## Practical Recovery Workflows

### Workflow 1: Daily Safety Check

```bash
#!/bin/bash
# Script: daily-safety-check.sh

daily_safety_check() {
    echo "=== Daily Git Safety Check ==="
    
    # Show recent reflog entries
    echo "Recent reflog entries:"
    git reflog --date=relative -10
    
    # Check for any destructive operations
    echo "\nDestructive operations today:"
    git reflog --since="1 day ago" | grep -E "reset|rebase|merge"
    
    # Create daily backup branch
    local backup_branch="backup/daily-$(date +%Y%m%d)"
    git branch "$backup_branch" 2>/dev/null && echo "Created $backup_branch"
    
    # Clean old backup branches (older than 7 days)
    git for-each-ref --format='%(refname:short) %(committerdate:short)' refs/heads/backup/ | 
    while read branch date; do
        if [[ $(date -d "$date" +%s) -lt $(date -d "7 days ago" +%s) ]]; then
            git branch -D "$branch"
            echo "Deleted old backup: $branch"
        fi
    done
}
```

### Workflow 2: Emergency Recovery

```bash
#!/bin/bash
# Script: emergency-recovery.sh

emergency_recovery() {
    echo "🚨 Emergency Recovery Mode"
    
    # Show recent reflog
    echo "Recent reflog entries:"
    git reflog --date=relative -20
    
    # Show current status
    echo "\nCurrent status:"
    git status
    
    # Show recent commits
    echo "\nRecent commits:"
    git log --oneline -10
    
    # Interactive recovery
    echo "\nSelect recovery option:"
    echo "1. Reset to previous commit"
    echo "2. Reset to specific reflog entry"
    echo "3. Create recovery branch from reflog"
    echo "4. Show detailed reflog"
    
    read -p "Enter option (1-4): " option
    
    case $option in
        1)
            git reset --hard HEAD~1
            echo "Reset to previous commit"
            ;;
        2)
            read -p "Enter reflog reference (e.g., HEAD@{5}): " ref
            git reset --hard "$ref"
            echo "Reset to $ref"
            ;;
        3)
            read -p "Enter reflog reference: " ref
            read -p "Enter recovery branch name: " branch
            git checkout -b "$branch" "$ref"
            echo "Created recovery branch: $branch"
            ;;
        4)
            git reflog --date=iso
            ;;
    esac
}
```

### Workflow 3: Commit Archaeology

```bash
#!/bin/bash
# Script: commit-archaeology.sh

find_lost_work() {
    local search_term="$1"
    
    echo "🔍 Searching for lost work: $search_term"
    
    # Search in reflog commit messages
    echo "\nReflog entries matching '$search_term':"
    git reflog | grep -i "$search_term"
    
    # Search in all reachable commits
    echo "\nCommits in reflog matching '$search_term':"
    git log -g --grep="$search_term" --oneline
    
    # Search in commit content
    echo "\nCommits with content matching '$search_term':"
    git log -g -S"$search_term" --oneline
    
    # Search in unreachable commits
    echo "\nSearching unreachable commits..."
    git fsck --unreachable | grep commit | cut -d' ' -f3 | 
    while read commit; do
        if git show "$commit" | grep -q "$search_term"; then
            echo "Found in unreachable commit: $commit"
            git show --oneline -s "$commit"
        fi
    done
}

# Usage: find_lost_work "important feature"
```

## Reflog Best Practices

### 1. Regular Reflog Monitoring

```bash
# Check reflog regularly
git reflog --date=relative -10

# Look for unexpected operations
git reflog | grep -E "reset --hard|rebase|merge"
```

### 2. Create Backup Points

```bash
# Before risky operations
git branch backup-before-rebase
git tag checkpoint-$(date +%Y%m%d-%H%M)

# After major milestones
git tag milestone-v1.0
```

### 3. Understand Reflog Limitations

```bash
# Reflog is local only
# Reflog expires (default 90 days)
# Reflog doesn't survive repository deletion

# For permanent backup:
git bundle create backup.bundle --all
```

### 4. Document Recovery Procedures

```bash
# Create recovery documentation
cat > RECOVERY.md << EOF
# Git Recovery Procedures

## Common Recovery Commands
- View reflog: \`git reflog\`
- Reset to previous state: \`git reset --hard HEAD@{n}\`
- Recover deleted branch: \`git checkout -b branch-name commit-hash\`

## Emergency Contacts
- Team Lead: [contact info]
- Git Expert: [contact info]
EOF
```

## Troubleshooting Reflog

### Common Issues

#### 1. Reflog Entry Not Found

```bash
# Error: "HEAD@{10} does not exist"
# Check available entries
git reflog | wc -l

# Use valid entry number
git reflog | head -5
git reset --hard HEAD@{4}
```

#### 2. Reflog Expired

```bash
# If reflog entries are gone
# Check garbage collection logs
git reflog expire --dry-run --all

# Look for unreachable commits
git fsck --unreachable

# Try to recover from remote
git fetch origin
git reset --hard origin/main
```

#### 3. Corrupted Reflog

```bash
# If reflog is corrupted
# Rebuild from commits
git reflog expire --expire=now --all
git reflog delete --rewrite --all

# Or remove reflog files (dangerous!)
# rm .git/logs/refs/heads/main
# git checkout main  # Recreates reflog
```

## Quick Reference

```bash
# View reflog
git reflog                      # Current branch reflog
git reflog --all               # All references
git reflog branch-name         # Specific branch
git reflog --date=iso          # With timestamps

# Recovery operations
git reset --hard HEAD@{n}      # Reset to reflog entry
git checkout -b new-branch HEAD@{n}  # Create branch from reflog
git cherry-pick HEAD@{n}       # Cherry-pick from reflog
git show HEAD@{n}              # Show reflog entry

# Search and filter
git reflog | grep "reset"      # Find specific operations
git reflog --since="2 hours ago"  # Time-based filter
git log -g --grep="message"    # Search commit messages in reflog

# Maintenance
git reflog expire --expire=30.days --all  # Clean old entries
git gc                         # Garbage collection
git config gc.reflogExpire "180.days"     # Configure expiration

# Safety
git branch backup-$(date +%Y%m%d)  # Create backup before risky operations
git reflog > reflog-backup.txt     # Export reflog to file
```

---

**Previous:** [Git Reset Deep Dive](13-git-reset-deep-dive.md)  
**Next:** [Git Bisect Bug Hunting](15-git-bisect-bug-hunting.md)