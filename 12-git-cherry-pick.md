# Git Cherry-pick

Git cherry-pick allows you to apply specific commits from one branch to another without merging the entire branch. This is useful for selectively applying bug fixes, features, or patches across different branches.

## Understanding Cherry-pick

### What is Cherry-pick?

Cherry-pick creates a new commit with the same changes as an existing commit, but with a different parent commit and commit hash.

**Visual representation:**
```
Before cherry-pick:
main:     A---B---C
feature:      D---E---F

After cherry-picking commit E to main:
main:     A---B---C---E'
feature:      D---E---F
```

Note: `E'` is a new commit with the same changes as `E` but different hash.

## Basic Cherry-pick Operations

### Simple Cherry-pick

```bash
# Setup example repository
mkdir cherry-pick-demo
cd cherry-pick-demo
git init

# Create initial commits
echo "Initial content" > main.txt
git add main.txt
git commit -m "Initial commit"

echo "Main branch update" >> main.txt
git add main.txt
git commit -m "Update main branch"

# Create feature branch
git checkout -b feature/new-feature
echo "Feature content" > feature.txt
git add feature.txt
git commit -m "Add feature file"

echo "Bug fix in feature" >> feature.txt
git add feature.txt
git commit -m "Fix bug in feature"

echo "More feature work" >> feature.txt
git add feature.txt
git commit -m "Enhance feature"

# View commit history
git log --oneline --graph --all
```

Output:
```
* e5f6g7h (HEAD -> feature/new-feature) Enhance feature
* d4e5f6g Fix bug in feature
* c3d4e5f Add feature file
| * b2c3d4e (main) Update main branch
|/  
* a1b2c3d Initial commit
```

### Cherry-pick Specific Commit

```bash
# Switch to main branch
git checkout main

# Cherry-pick the bug fix commit
git cherry-pick d4e5f6g

# View result
git log --oneline --graph --all
```

Output:
```
* f6g7h8i (HEAD -> main) Fix bug in feature
* b2c3d4e Update main branch
| * e5f6g7h (feature/new-feature) Enhance feature
| * d4e5f6g Fix bug in feature
| * c3d4e5f Add feature file
|/  
* a1b2c3d Initial commit
```

## Practical Cherry-pick Use Cases

### Use Case 1: Hotfix from Development Branch

```bash
# Setup scenario: critical bug found in production
git checkout -b release/v1.0
echo "Version 1.0 release" > version.txt
git add version.txt
git commit -m "Release v1.0"

# Meanwhile, development continues
git checkout -b develop
echo "New feature A" > feature-a.txt
git add feature-a.txt
git commit -m "Add feature A"

echo "New feature B" > feature-b.txt
git add feature-b.txt
git commit -m "Add feature B"

# Critical bug fix in development
echo "Fixed critical security issue" > security-fix.txt
git add security-fix.txt
git commit -m "SECURITY: Fix authentication bypass vulnerability"

echo "More development" > feature-c.txt
git add feature-c.txt
git commit -m "Add feature C"

# View current state
git log --oneline --graph --all
```

Output:
```
* j1k2l3m (HEAD -> develop) Add feature C
* i0j1k2l SECURITY: Fix authentication bypass vulnerability
* h9i0j1k Add feature B
* g8h9i0j Add feature A
| * f7g8h9i (release/v1.0) Release v1.0
|/  
* a1b2c3d (main) Initial commit
```

```bash
# Cherry-pick security fix to release branch
git checkout release/v1.0
git cherry-pick i0j1k2l

# Create hotfix release
git tag v1.0.1
git log --oneline
```

Output:
```
k2l3m4n (HEAD -> release/v1.0, tag: v1.0.1) SECURITY: Fix authentication bypass vulnerability
f7g8h9i Release v1.0
a1b2c3d Initial commit
```

### Use Case 2: Selective Feature Backporting

```bash
# Setup multiple release branches
git checkout main
git checkout -b release/v2.0
echo "Version 2.0 features" > v2-features.txt
git add v2-features.txt
git commit -m "Add v2.0 features"

git checkout -b release/v3.0
echo "Version 3.0 features" > v3-features.txt
git add v3-features.txt
git commit -m "Add v3.0 features"

# Add backward-compatible improvement
echo "Performance optimization" > performance.txt
git add performance.txt
git commit -m "PERF: Optimize database queries (backward compatible)"

# This improvement should be in v2.0 as well
git checkout release/v2.0
git cherry-pick HEAD~0  # Cherry-pick from v3.0

# Verify both branches have the optimization
git log --oneline
git checkout release/v3.0
git log --oneline
```

### Use Case 3: Documentation Updates

```bash
# Setup documentation scenario
git checkout main
git checkout -b docs/api-updates
echo "# API Documentation\n\n## Authentication\nUpdated auth flow" > api-docs.md
git add api-docs.md
git commit -m "Update API authentication documentation"

echo "\n## Rate Limiting\nNew rate limiting info" >> api-docs.md
git add api-docs.md
git commit -m "Add rate limiting documentation"

echo "\n## Error Codes\nComplete error code reference" >> api-docs.md
git add api-docs.md
git commit -m "Add comprehensive error code documentation"

# Cherry-pick only the authentication update to main
git checkout main
git cherry-pick docs/api-updates~2  # Pick the first commit

# Later, cherry-pick error codes documentation
git cherry-pick docs/api-updates    # Pick the latest commit

# View result
git log --oneline
```

## Advanced Cherry-pick Techniques

### Cherry-pick Multiple Commits

```bash
# Cherry-pick a range of commits
git cherry-pick commit1..commit3

# Cherry-pick multiple specific commits
git cherry-pick commit1 commit2 commit4

# Cherry-pick with range (exclusive start)
git cherry-pick commit1^..commit3
```

### Practical Example: Multiple Commits

```bash
# Setup scenario with multiple related commits
git checkout -b feature/user-management

# Commit 1: Add user model
cat > user.js << EOF
class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    validate() {
        return this.name && this.email;
    }
}

module.exports = User;
EOF

git add user.js
git commit -m "Add User model class"

# Commit 2: Add user validation
cat >> user.js << EOF

// Additional validation methods
User.prototype.validateEmail = function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
};
EOF

git add user.js
git commit -m "Add email validation to User model"

# Commit 3: Add user repository
cat > user-repository.js << EOF
const User = require('./user');

class UserRepository {
    constructor() {
        this.users = [];
    }

    create(userData) {
        const user = new User(userData.name, userData.email);
        if (user.validate() && user.validateEmail()) {
            this.users.push(user);
            return user;
        }
        throw new Error('Invalid user data');
    }

    findByEmail(email) {
        return this.users.find(user => user.email === email);
    }
}

module.exports = UserRepository;
EOF

git add user-repository.js
git commit -m "Add UserRepository for user management"

# Commit 4: Add tests
cat > user.test.js << EOF
const User = require('./user');
const UserRepository = require('./user-repository');

// Test User model
const user = new User('John Doe', 'john@example.com');
console.assert(user.validate(), 'User should be valid');
console.assert(user.validateEmail(), 'Email should be valid');

// Test UserRepository
const repo = new UserRepository();
const createdUser = repo.create({ name: 'Jane Doe', email: 'jane@example.com' });
console.assert(createdUser.name === 'Jane Doe', 'User should be created');

console.log('All tests passed!');
EOF

git add user.test.js
git commit -m "Add tests for User model and repository"

# View commits
git log --oneline
```

Output:
```
p4q5r6s (HEAD -> feature/user-management) Add tests for User model and repository
o3p4q5r Add UserRepository for user management
n2o3p4q Add email validation to User model
m1n2o3p Add User model class
```

```bash
# Cherry-pick User model and validation (first two commits)
git checkout main
git cherry-pick m1n2o3p..n2o3p4q

# Later, cherry-pick the repository and tests
git cherry-pick o3p4q5r p4q5r6s

# View result
git log --oneline
```

### Cherry-pick with Edit

```bash
# Cherry-pick and edit the commit
git cherry-pick --edit commit-hash

# Cherry-pick without committing (stage changes only)
git cherry-pick --no-commit commit-hash

# Make additional changes
echo "Additional changes" >> file.txt
git add file.txt

# Commit with custom message
git commit -m "Cherry-picked and enhanced: original feature"
```

### Cherry-pick with Strategy

```bash
# Cherry-pick with merge strategy
git cherry-pick -X theirs commit-hash    # Prefer their changes
git cherry-pick -X ours commit-hash      # Prefer our changes
git cherry-pick -X patience commit-hash  # Use patience algorithm
```

## Handling Cherry-pick Conflicts

### Conflict Resolution

```bash
# Create conflict scenario
git checkout main
echo "Main branch content" > shared.txt
git add shared.txt
git commit -m "Add shared file on main"

git checkout -b feature/modify-shared
echo "Feature modification" > shared.txt
git add shared.txt
git commit -m "Modify shared file in feature"

# Update main with different content
git checkout main
echo "Different main content" > shared.txt
git add shared.txt
git commit -m "Update shared file differently on main"

# Try to cherry-pick (will conflict)
git cherry-pick feature/modify-shared
```

Output:
```
error: could not apply a1b2c3d... Modify shared file in feature
hint: after resolving the conflicts, mark the corrected paths
hint: with 'git add <paths>' or 'git rm <paths>'
hint: and commit the result with 'git commit'
```

### Resolving Cherry-pick Conflicts

```bash
# View conflict
cat shared.txt
```

Output:
```
<<<<<<< HEAD
Different main content
=======
Feature modification
>>>>>>> a1b2c3d (Modify shared file in feature)
```

```bash
# Resolve conflict
echo "Merged: Different main content with feature modification" > shared.txt

# Stage resolved file
git add shared.txt

# Continue cherry-pick
git cherry-pick --continue
```

### Cherry-pick Conflict Commands

```bash
# Continue after resolving conflicts
git cherry-pick --continue

# Skip current commit
git cherry-pick --skip

# Abort cherry-pick
git cherry-pick --abort

# Show what's being cherry-picked
git status
```

## Advanced Cherry-pick Scenarios

### Cherry-pick from Remote Branch

```bash
# Fetch latest changes
git fetch origin

# Cherry-pick from remote branch
git cherry-pick origin/feature/branch~2

# Cherry-pick from specific remote commit
git cherry-pick 1a2b3c4d
```

### Cherry-pick Merge Commits

```bash
# Cherry-pick a merge commit (specify parent)
git cherry-pick -m 1 merge-commit-hash  # Use first parent
git cherry-pick -m 2 merge-commit-hash  # Use second parent
```

### Practical Example: Merge Commit Cherry-pick

```bash
# Create merge commit scenario
git checkout main
git checkout -b feature/a
echo "Feature A" > feature-a.txt
git add feature-a.txt
git commit -m "Add feature A"

git checkout main
git merge feature/a --no-ff -m "Merge feature A"

# Cherry-pick the merge commit to another branch
git checkout -b release/v1.0
git cherry-pick -m 1 HEAD  # Cherry-pick merge commit
```

### Cherry-pick with Mainline

```bash
# When cherry-picking merge commits, specify mainline
git log --graph --oneline

# Cherry-pick merge commit with first parent as mainline
git cherry-pick -m 1 merge-commit

# Cherry-pick merge commit with second parent as mainline
git cherry-pick -m 2 merge-commit
```

## Cherry-pick Workflows

### Workflow 1: Release Branch Management

```bash
#!/bin/bash
# Script: cherry-pick-to-release.sh

# Function to cherry-pick commits to release branch
cherry_pick_to_release() {
    local release_branch=$1
    shift
    local commits=("$@")
    
    echo "Cherry-picking commits to $release_branch"
    git checkout "$release_branch"
    
    for commit in "${commits[@]}"; do
        echo "Cherry-picking $commit"
        if git cherry-pick "$commit"; then
            echo "✓ Successfully cherry-picked $commit"
        else
            echo "✗ Conflict in $commit - resolve manually"
            return 1
        fi
    done
    
    echo "All commits cherry-picked successfully"
}

# Usage
# cherry_pick_to_release "release/v2.1" "abc123" "def456" "ghi789"
```

### Workflow 2: Hotfix Distribution

```bash
#!/bin/bash
# Script: distribute-hotfix.sh

distribute_hotfix() {
    local hotfix_commit=$1
    local branches=("release/v1.0" "release/v2.0" "release/v3.0")
    
    echo "Distributing hotfix $hotfix_commit to release branches"
    
    for branch in "${branches[@]}"; do
        echo "Applying to $branch"
        git checkout "$branch"
        
        if git cherry-pick "$hotfix_commit"; then
            echo "✓ Applied to $branch"
            git tag "${branch#release/}.$(date +%Y%m%d)"
        else
            echo "✗ Failed to apply to $branch"
            git cherry-pick --abort
        fi
    done
}

# Usage
# distribute_hotfix "security-fix-commit-hash"
```

### Workflow 3: Feature Backporting

```bash
# Interactive script for selective backporting
backport_features() {
    local source_branch=$1
    local target_branch=$2
    
    echo "Available commits in $source_branch:"
    git log --oneline "$target_branch..$source_branch"
    
    echo "\nEnter commit hashes to backport (space-separated):"
    read -r commits
    
    git checkout "$target_branch"
    
    for commit in $commits; do
        echo "Backporting $commit"
        git cherry-pick "$commit"
    done
}
```

## Cherry-pick Best Practices

### 1. Document Cherry-picks

```bash
# Include original commit info in cherry-pick message
git cherry-pick -x commit-hash

# This adds: "(cherry picked from commit abc123)"
```

### 2. Test After Cherry-pick

```bash
# Always test after cherry-picking
git cherry-pick commit-hash
npm test
npm run build

# Verify functionality works in target branch context
```

### 3. Use Descriptive Commit Messages

```bash
# When editing cherry-pick message
git cherry-pick --edit commit-hash

# Example message:
# "BACKPORT: Fix authentication bug from v3.0
# 
# Original commit: abc123 from feature/auth-fix
# Cherry-picked to v2.0 for security patch
# 
# (cherry picked from commit abc123)"
```

### 4. Avoid Cherry-picking Merge Commits

```bash
# Instead of cherry-picking merge commits, cherry-pick individual commits
# BAD:
git cherry-pick merge-commit

# GOOD:
git cherry-pick commit1 commit2 commit3
```

### 5. Keep Track of Cherry-picks

```bash
# Use git notes to track cherry-picks
git notes add -m "Cherry-picked to release/v2.0" commit-hash

# View notes
git log --show-notes
```

## Troubleshooting Cherry-pick

### Common Issues and Solutions

#### 1. Empty Cherry-pick

```bash
# When cherry-pick results in no changes
git cherry-pick commit-hash
# Output: "The previous cherry-pick is now empty"

# Options:
git cherry-pick --skip          # Skip this commit
git cherry-pick --allow-empty    # Keep empty commit
git cherry-pick --abort          # Abort operation
```

#### 2. Cherry-pick Wrong Commit

```bash
# Undo last cherry-pick
git reset --hard HEAD~1

# Or use reflog to find previous state
git reflog
git reset --hard HEAD@{1}
```

#### 3. Multiple Conflicts

```bash
# When cherry-picking multiple commits with conflicts
git cherry-pick commit1 commit2 commit3

# Resolve each conflict individually
# After resolving first conflict:
git add .
git cherry-pick --continue

# Repeat for each conflict
```

#### 4. Find Cherry-picked Commits

```bash
# Find commits that have been cherry-picked
git log --cherry-pick --left-right main...feature

# Show commits in feature not in main
git log main..feature --oneline

# Show commits that exist in both (potential cherry-picks)
git log --cherry main...feature
```

### Recovery Commands

```bash
# Abort current cherry-pick
git cherry-pick --abort

# Reset to before cherry-pick
git reflog
git reset --hard HEAD@{n}

# Remove last cherry-picked commit
git reset --hard HEAD~1

# Undo cherry-pick but keep changes staged
git reset --soft HEAD~1
```

## Quick Reference

```bash
# Basic cherry-pick
git cherry-pick commit-hash        # Apply single commit
git cherry-pick commit1 commit2    # Apply multiple commits
git cherry-pick commit1..commit3   # Apply range of commits

# Cherry-pick options
git cherry-pick -x commit-hash     # Add "cherry picked from" note
git cherry-pick --edit commit-hash # Edit commit message
git cherry-pick --no-commit hash   # Stage changes without committing
git cherry-pick -m 1 merge-hash    # Cherry-pick merge commit

# Conflict resolution
git cherry-pick --continue         # Continue after resolving conflicts
git cherry-pick --skip            # Skip current commit
git cherry-pick --abort            # Abort cherry-pick operation

# Advanced options
git cherry-pick -X theirs hash     # Prefer their changes in conflicts
git cherry-pick -X ours hash       # Prefer our changes in conflicts
git cherry-pick --allow-empty hash # Allow empty commits

# Finding commits
git log --cherry-pick main...feature  # Show cherry-pick candidates
git log --oneline branch1..branch2    # Commits in branch2 not in branch1
```

---

**Previous:** [Advanced Git Rebase](11-advanced-git-rebase.md)  
**Next:** [Git Reset Deep Dive](13-git-reset-deep-dive.md)