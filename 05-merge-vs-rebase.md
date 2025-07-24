# Git Merge vs Rebase

Merge and rebase are two fundamental ways to integrate changes from one branch into another. Understanding the difference is crucial for maintaining a clean Git history.

## Understanding the Difference

### Merge: Preserves History

```
Before merge:
main:     A---B---C
               \
feature:        D---E

After merge:
main:     A---B---C---F (merge commit)
               \     /
feature:        D---E
```

### Rebase: Rewrites History

```
Before rebase:
main:     A---B---C
               \
feature:        D---E

After rebase:
main:     A---B---C
feature:           D'---E' (commits moved)
```

## git merge - Combining Branches

### Basic Merge

```bash
# Switch to target branch
git checkout main

# Merge feature branch
git merge feature/contact-form

# Push merged changes
git push origin main
```

### Types of Merges

#### 1. Fast-Forward Merge

When the target branch hasn't diverged:

```
Before:
main:     A---B
feature:      C---D

After fast-forward:
main:     A---B---C---D
```

```bash
# Fast-forward merge (default when possible)
git merge feature/simple-update

# Force merge commit even for fast-forward
git merge --no-ff feature/simple-update
```

#### 2. Three-Way Merge

When both branches have diverged:

```
Before:
main:     A---B---C
               \
feature:        D---E

After three-way merge:
main:     A---B---C---F
               \     /
feature:        D---E
```

```bash
# Three-way merge (automatic when branches diverged)
git merge feature/new-feature
```

### Merge Options

```bash
# Standard merge
git merge feature/branch

# No fast-forward (always create merge commit)
git merge --no-ff feature/branch

# Fast-forward only (fail if not possible)
git merge --ff-only feature/branch

# Squash merge (combine all commits into one)
git merge --squash feature/branch

# Merge with custom message
git merge -m "Merge feature: Add user authentication" feature/auth
```

## git rebase - Rewriting History

### Basic Rebase

```bash
# Switch to feature branch
git checkout feature/contact-form

# Rebase onto main
git rebase main

# If conflicts occur, resolve them and continue
git add .
git rebase --continue

# Push rebased branch (force required)
git push --force-with-lease origin feature/contact-form
```

### Rebase Process Step-by-Step

```
Initial state:
main:     A---B---C
               \
feature:        D---E

Step 1: Git finds common ancestor (B)
Step 2: Git temporarily removes D and E
Step 3: Git applies D and E on top of C

Final state:
main:     A---B---C
feature:           D'---E'
```

### Interactive Rebase

```bash
# Interactive rebase for last 3 commits
git rebase -i HEAD~3

# Interactive rebase from specific commit
git rebase -i <commit-hash>

# Interactive rebase onto main
git rebase -i main
```

#### Interactive Rebase Commands

```
pick a1b2c3d Add contact form HTML
squash d4e5f6g Add contact form styling
reword g7h8i9j Add contact form validation
drop j0k1l2m Remove debug code
```

**Commands:**
- `pick` (p): Use commit as-is
- `reword` (r): Use commit but edit message
- `edit` (e): Use commit but stop for amending
- `squash` (s): Combine with previous commit
- `fixup` (f): Like squash but discard message
- `drop` (d): Remove commit entirely

## Practical Example: Feature Development

Let's demonstrate both approaches with our portfolio project:

### Setup: Create Divergent Branches

```bash
# Start from main
git checkout main

# Create and work on feature branch
git checkout -b feature/blog-section
echo "<section id='blog'><h2>Blog Posts</h2></section>" >> index.html
git add index.html
git commit -m "Add blog section to homepage"

echo "#blog { margin: 20px 0; }" >> style.css
git add style.css
git commit -m "Style blog section"

# Meanwhile, someone else updated main
git checkout main
echo "<meta name='viewport' content='width=device-width, initial-scale=1'>" >> index.html
git add index.html
git commit -m "Add responsive viewport meta tag"

# Now we have divergent branches
git log --graph --oneline --all
```

Output:
```
* f9e8d7c (HEAD -> main) Add responsive viewport meta tag
| * c6b5a4d (feature/blog-section) Style blog section
| * 3d2e1f0 Add blog section to homepage
|/
* a1b2c3d Add contact form feature
```

### Approach 1: Using Merge

```bash
# Switch to main and merge
git checkout main
git merge feature/blog-section
```

If there are conflicts:
```bash
# Git will show conflict markers
cat index.html
# <<<<<<< HEAD
# <meta name="viewport" content="width=device-width, initial-scale=1">
# =======
# <section id="blog"><h2>Blog Posts</h2></section>
# >>>>>>> feature/blog-section

# Resolve conflicts manually
# Edit index.html to include both changes

# Mark as resolved
git add index.html
git commit -m "Merge feature/blog-section"

# View result
git log --graph --oneline
```

Result:
```
*   g7f6e5d (HEAD -> main) Merge feature/blog-section
|\  
| * c6b5a4d Style blog section
| * 3d2e1f0 Add blog section to homepage
* | f9e8d7c Add responsive viewport meta tag
|/  
* a1b2c3d Add contact form feature
```

### Approach 2: Using Rebase

```bash
# Reset to before merge (for demonstration)
git reset --hard f9e8d7c

# Switch to feature branch and rebase
git checkout feature/blog-section
git rebase main
```

If there are conflicts:
```bash
# Resolve conflicts in files
# Edit index.html to include both changes

# Mark as resolved and continue
git add index.html
git rebase --continue

# View result
git log --graph --oneline
```

Result:
```
* h8g7f6e (HEAD -> feature/blog-section) Style blog section
* e5d4c3b Add blog section to homepage
* f9e8d7c (main) Add responsive viewport meta tag
* a1b2c3d Add contact form feature
```

```bash
# Now merge into main (fast-forward)
git checkout main
git merge feature/blog-section

# Final clean history
git log --graph --oneline
```

Result:
```
* h8g7f6e (HEAD -> main, feature/blog-section) Style blog section
* e5d4c3b Add blog section to homepage
* f9e8d7c Add responsive viewport meta tag
* a1b2c3d Add contact form feature
```

## When to Use Merge vs Rebase

### Use Merge When:

1. **Working on public/shared branches**
   ```bash
   # Safe for shared branches
   git checkout main
   git merge feature/shared-feature
   ```

2. **Want to preserve exact history**
   ```bash
   # Keeps timeline of when work was done
   git merge --no-ff feature/important-feature
   ```

3. **Working with release branches**
   ```bash
   # Clear merge points for releases
   git checkout release/v1.0
   git merge feature/last-minute-fix
   ```

4. **Team prefers merge commits**
   ```bash
   # Some teams like explicit merge commits
   git merge --no-ff feature/team-feature
   ```

### Use Rebase When:

1. **Cleaning up feature branch history**
   ```bash
   # Before creating pull request
   git checkout feature/my-feature
   git rebase main
   ```

2. **Want linear history**
   ```bash
   # Creates clean, linear timeline
   git rebase main
   ```

3. **Squashing related commits**
   ```bash
   # Combine multiple small commits
   git rebase -i HEAD~3
   ```

4. **Working on private branches**
   ```bash
   # Safe to rewrite history on private branches
   git rebase main
   ```

## Advanced Rebase Techniques

### Squashing Commits

```bash
# Interactive rebase to squash last 3 commits
git rebase -i HEAD~3
```

In the editor:
```
pick a1b2c3d Add blog HTML structure
squash b2c3d4e Fix blog HTML formatting
squash c3d4e5f Add blog CSS styles
```

Result: Three commits become one clean commit.

### Splitting Commits

```bash
# Start interactive rebase
git rebase -i HEAD~2

# Mark commit for editing
# edit a1b2c3d Large commit with multiple changes

# When rebase stops, reset the commit
git reset HEAD~1

# Stage and commit changes separately
git add file1.html
git commit -m "Add HTML structure"

git add file2.css
git commit -m "Add CSS styles"

# Continue rebase
git rebase --continue
```

### Rebase onto Different Branch

```bash
# Move feature branch from old-main to new-main
git rebase --onto new-main old-main feature/branch
```

```
Before:
old-main: A---B---C
new-main: A---D---E
feature:      F---G (based on old-main)

After:
old-main: A---B---C
new-main: A---D---E
feature:          F'---G' (now based on new-main)
```

## Handling Conflicts

### Merge Conflicts

```bash
# During merge
git merge feature/branch
# CONFLICT (content): Merge conflict in file.txt

# View conflicted files
git status

# Edit files to resolve conflicts
# Remove conflict markers: <<<<<<<, =======, >>>>>>>

# Mark as resolved
git add file.txt
git commit -m "Resolve merge conflicts"
```

### Rebase Conflicts

```bash
# During rebase
git rebase main
# CONFLICT (content): Merge conflict in file.txt

# View conflicted files
git status

# Edit files to resolve conflicts

# Mark as resolved and continue
git add file.txt
git rebase --continue

# Or abort rebase
git rebase --abort
```

## Merge vs Rebase Comparison

| Aspect | Merge | Rebase |
|--------|-------|--------|
| **History** | Preserves original timeline | Creates linear timeline |
| **Commits** | Keeps all original commits | Can modify/combine commits |
| **Conflicts** | Resolve once | May resolve multiple times |
| **Safety** | Safe for shared branches | Dangerous for shared branches |
| **Traceability** | Shows when branches merged | Shows logical progression |
| **Complexity** | Simpler to understand | More complex but cleaner |

## Best Practices

### Golden Rules

1. **Never rebase public branches**
   ```bash
   # DON'T do this if others are using the branch
   git checkout main
   git rebase feature/branch  # DANGEROUS!
   ```

2. **Rebase before merging**
   ```bash
   # Clean up feature branch first
   git checkout feature/branch
   git rebase main
   
   # Then merge cleanly
   git checkout main
   git merge feature/branch
   ```

3. **Use --force-with-lease for safety**
   ```bash
   # Safer than --force
   git push --force-with-lease origin feature/branch
   ```

### Workflow Recommendations

#### For Feature Branches:
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Work and commit
git add .
git commit -m "Implement feature"

# 3. Before creating PR, clean up
git rebase -i main  # Squash/clean commits
git rebase main     # Update with latest main

# 4. Push and create PR
git push --force-with-lease origin feature/new-feature

# 5. Merge via PR (usually squash merge)
```

#### For Hotfixes:
```bash
# 1. Create hotfix from main
git checkout -b hotfix/critical-fix

# 2. Fix and commit
git add .
git commit -m "Fix critical bug"

# 3. Merge directly (no rebase needed)
git checkout main
git merge hotfix/critical-fix
git push origin main
```

## Troubleshooting

### Undo Merge

```bash
# Undo merge (if not pushed)
git reset --hard HEAD~1

# Undo merge (if pushed) - creates new commit
git revert -m 1 <merge-commit-hash>
```

### Undo Rebase

```bash
# Find original commit
git reflog

# Reset to before rebase
git reset --hard HEAD@{5}  # Use appropriate reflog entry
```

### Abort Operations

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort
```

## Quick Reference

```bash
# Merge commands
git merge <branch>            # Standard merge
git merge --no-ff <branch>    # Force merge commit
git merge --squash <branch>   # Squash all commits

# Rebase commands
git rebase <branch>           # Rebase onto branch
git rebase -i <commit>        # Interactive rebase
git rebase --continue         # Continue after conflict
git rebase --abort            # Abort rebase

# Conflict resolution
git status                    # See conflicted files
git add <file>               # Mark conflict resolved
git merge --abort            # Abort merge
git rebase --abort           # Abort rebase
```

---

**Previous:** [Branching Basics](04-branching-basics.md)  
**Next:** [Git Stash](06-git-stash.md)