# Advanced Git Rebase

Git rebase is a powerful tool for rewriting commit history, cleaning up branches, and maintaining a linear project timeline. This chapter covers advanced rebase techniques including interactive rebase, squashing, and complex scenarios.

## Understanding Rebase vs Merge

### Visual Comparison

**Before Integration:**
```
main:     A---B---C
               \
feature:        D---E---F
```

**After Merge:**
```
main:     A---B---C-------G (merge commit)
               \         /
feature:        D---E---F
```

**After Rebase:**
```
main:     A---B---C---D'---E'---F'
feature:                   (moved)
```

## Basic Rebase Review

### Simple Rebase

```bash
# Setup example repository
mkdir rebase-demo
cd rebase-demo
git init

# Create initial commits
echo "Initial content" > file.txt
git add file.txt
git commit -m "Initial commit"

echo "Main branch change" >> file.txt
git add file.txt
git commit -m "Update on main branch"

# Create feature branch
git checkout -b feature/new-feature
echo "Feature content" >> feature.txt
git add feature.txt
git commit -m "Add feature file"

echo "More feature work" >> feature.txt
git add feature.txt
git commit -m "Enhance feature"

# Meanwhile, main branch gets more commits
git checkout main
echo "Another main change" >> file.txt
git add file.txt
git commit -m "Another update on main"

# View current state
git log --graph --oneline --all
```

Output:
```
* f1e2d3c (HEAD -> main) Another update on main
| * a4b5c6d (feature/new-feature) Enhance feature
| * e7f8g9h Add feature file
|/  
* b2c3d4e Update on main branch
* a1b2c3d Initial commit
```

```bash
# Rebase feature branch onto main
git checkout feature/new-feature
git rebase main

# View result
git log --graph --oneline --all
```

Output:
```
* h9i0j1k (HEAD -> feature/new-feature) Enhance feature
* g8h9i0j Add feature file
* f1e2d3c (main) Another update on main
* b2c3d4e Update on main branch
* a1b2c3d Initial commit
```

## Interactive Rebase

Interactive rebase allows you to modify commits during the rebase process.

### Starting Interactive Rebase

```bash
# Interactive rebase for last 3 commits
git rebase -i HEAD~3

# Interactive rebase from specific commit
git rebase -i a1b2c3d

# Interactive rebase onto another branch
git rebase -i main
```

### Interactive Rebase Commands

When you start interactive rebase, Git opens an editor with:

```
pick a1b2c3d Add feature file
pick b2c3d4e Enhance feature
pick c3d4e5f Fix typo in feature

# Rebase f1e2d3c..c3d4e5f onto f1e2d3c (3 commands)
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# x, exec <command> = run command (the rest of the line) using shell
# b, break = stop here (continue rebase later with 'git rebase --continue')
# d, drop <commit> = remove commit
# l, label <label> = label current HEAD with a name
# t, reset <label> = reset HEAD to a label
# m, merge [-C <commit> | -c <commit>] <label> [# <oneline>]
```

## Practical Interactive Rebase Examples

### Example 1: Squashing Related Commits

Let's create a realistic scenario with multiple small commits:

```bash
# Create feature branch with multiple small commits
git checkout -b feature/user-profile

# First commit: Add basic structure
cat > profile.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>User Profile</title>
</head>
<body>
    <div id="profile">
        <h1>User Profile</h1>
    </div>
</body>
</html>
EOF

git add profile.html
git commit -m "Add basic profile HTML structure"

# Second commit: Add CSS
cat > profile.css << EOF
#profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
}

#profile h1 {
    color: #333;
    text-align: center;
}
EOF

git add profile.css
git commit -m "Add basic profile styling"

# Third commit: Fix CSS typo
sed -i 's/text-align: center/text-align: center;/' profile.css
git add profile.css
git commit -m "Fix missing semicolon in CSS"

# Fourth commit: Add JavaScript
cat > profile.js << EOF
class UserProfile {
    constructor(userId) {
        this.userId = userId;
        this.loadProfile();
    }

    async loadProfile() {
        try {
            const response = await fetch(`/api/users/${this.userId}`);
            const user = await response.json();
            this.displayProfile(user);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }

    displayProfile(user) {
        const profileDiv = document.getElementById('profile');
        profileDiv.innerHTML = `
            <h1>${user.name}</h1>
            <p>Email: ${user.email}</p>
            <p>Joined: ${user.joinDate}</p>
        `;
    }
}
EOF

git add profile.js
git commit -m "Add JavaScript for profile functionality"

# Fifth commit: Fix JavaScript bug
sed -i 's/user.joinDate/new Date(user.joinDate).toLocaleDateString()/' profile.js
git add profile.js
git commit -m "Fix date formatting in profile display"

# Sixth commit: Add error handling
sed -i 's/console.error/this.showError/' profile.js
cat >> profile.js << EOF

    showError(message) {
        const profileDiv = document.getElementById('profile');
        profileDiv.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
EOF

git add profile.js
git commit -m "Improve error handling in profile loader"

# View commit history
git log --oneline
```

Output:
```
g7h8i9j (HEAD -> feature/user-profile) Improve error handling in profile loader
f6g7h8i Fix date formatting in profile display
e5f6g7h Add JavaScript for profile functionality
d4e5f6g Fix missing semicolon in CSS
c3d4e5f Add basic profile styling
b2c3d4e Add basic profile HTML structure
a1b2c3d (main) Initial commit
```

### Squashing the Commits

```bash
# Start interactive rebase for last 6 commits
git rebase -i HEAD~6
```

Edit the rebase file:
```
pick b2c3d4e Add basic profile HTML structure
squash c3d4e5f Add basic profile styling
fixup d4e5f6g Fix missing semicolon in CSS
pick e5f6g7h Add JavaScript for profile functionality
fixup f6g7h8i Fix date formatting in profile display
squash g7h8i9j Improve error handling in profile loader

# This will result in 2 commits:
# 1. HTML structure + CSS styling (squashed)
# 2. JavaScript functionality + error handling (squashed)
```

After saving, Git will prompt for commit messages:

**First squash (HTML + CSS):**
```
Add user profile HTML structure and styling

- Create basic profile HTML layout
- Add responsive CSS styling
- Fix CSS syntax issues
```

**Second squash (JavaScript):**
```
Add user profile JavaScript functionality

- Implement UserProfile class with API integration
- Add proper date formatting
- Improve error handling and user feedback
```

Result:
```bash
git log --oneline
```

Output:
```
h8i9j0k (HEAD -> feature/user-profile) Add user profile JavaScript functionality
g7h8i9j Add user profile HTML structure and styling
a1b2c3d (main) Initial commit
```

## Advanced Rebase Techniques

### 1. Reword Commit Messages

```bash
# Fix commit messages during rebase
git rebase -i HEAD~3
```

Change `pick` to `reword` for commits with poor messages:
```
reword a1b2c3d fix stuff
pick b2c3d4e Add proper error handling
reword c3d4e5f update
```

Git will prompt to edit each marked commit message.

### 2. Edit Commits

```bash
# Stop at specific commit to make changes
git rebase -i HEAD~3
```

Change `pick` to `edit`:
```
pick a1b2c3d Add feature
edit b2c3d4e Add tests
pick c3d4e5f Update documentation
```

When rebase stops:
```bash
# Make additional changes
echo "Additional test case" >> test.js
git add test.js

# Amend the commit
git commit --amend --no-edit

# Continue rebase
git rebase --continue
```

### 3. Split Commits

```bash
# Split a large commit into smaller ones
git rebase -i HEAD~2
```

Mark commit for editing:
```
pick a1b2c3d Good commit
edit b2c3d4e Large commit with multiple changes
```

When rebase stops:
```bash
# Reset the commit but keep changes
git reset HEAD~1

# Stage and commit changes separately
git add file1.js
git commit -m "Add user authentication"

git add file2.css
git commit -m "Update login form styling"

git add file3.html
git commit -m "Add password reset form"

# Continue rebase
git rebase --continue
```

### 4. Reorder Commits

```bash
# Reorder commits during interactive rebase
git rebase -i HEAD~4
```

Reorder lines in the editor:
```
# Original order:
pick a1b2c3d Add feature A
pick b2c3d4e Add feature B
pick c3d4e5f Fix feature A
pick d4e5f6g Add feature C

# Reordered:
pick a1b2c3d Add feature A
pick c3d4e5f Fix feature A
pick b2c3d4e Add feature B
pick d4e5f6g Add feature C
```

### 5. Drop Commits

```bash
# Remove commits entirely
git rebase -i HEAD~4
```

Change `pick` to `drop` or delete the line:
```
pick a1b2c3d Add feature
drop b2c3d4e Add debug code
pick c3d4e5f Add tests
drop d4e5f6g Temporary fix
```

## Rebase onto Different Branch

### Moving Branch Base

```bash
# Move feature branch from old-main to new-main
git rebase --onto new-main old-main feature-branch
```

**Visual representation:**
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

### Practical Example

```bash
# Setup scenario
git checkout -b old-approach
echo "Old implementation" > old-feature.js
git add old-feature.js
git commit -m "Implement old approach"

# Create feature based on old approach
git checkout -b feature/enhancement
echo "Enhancement to old approach" >> old-feature.js
git add old-feature.js
git commit -m "Enhance old implementation"

# Meanwhile, new approach is developed
git checkout main
git checkout -b new-approach
echo "New implementation" > new-feature.js
git add new-feature.js
git commit -m "Implement new approach"

# Move enhancement to new approach
git checkout feature/enhancement
git rebase --onto new-approach old-approach

# Now feature/enhancement is based on new-approach
```

## Handling Rebase Conflicts

### Conflict Resolution During Rebase

```bash
# Create conflict scenario
git checkout main
echo "Main branch content" > shared-file.txt
git add shared-file.txt
git commit -m "Add shared file on main"

git checkout -b feature/modify-shared
echo "Feature branch content" > shared-file.txt
git add shared-file.txt
git commit -m "Modify shared file in feature"

# Update main with conflicting change
git checkout main
echo "Updated main content" > shared-file.txt
git add shared-file.txt
git commit -m "Update shared file on main"

# Rebase feature branch (will conflict)
git checkout feature/modify-shared
git rebase main
```

Output:
```
Auto-merging shared-file.txt
CONFLICT (content): Merge conflict in shared-file.txt
error: could not apply a1b2c3d... Modify shared file in feature
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
```

### Resolving Conflicts

```bash
# View conflicted file
cat shared-file.txt
```

Output:
```
<<<<<<< HEAD
Updated main content
=======
Feature branch content
>>>>>>> a1b2c3d (Modify shared file in feature)
```

```bash
# Resolve conflict
echo "Merged: Updated main content with feature additions" > shared-file.txt

# Mark as resolved
git add shared-file.txt

# Continue rebase
git rebase --continue
```

### Rebase Conflict Commands

```bash
# Continue after resolving conflicts
git rebase --continue

# Skip current commit
git rebase --skip

# Abort rebase and return to original state
git rebase --abort

# Edit commit message during conflict resolution
git commit --amend
```

## Autosquash Workflow

### Using --fixup and --squash

```bash
# Create initial commit
echo "function calculate() { return 1 + 1; }" > math.js
git add math.js
git commit -m "Add calculate function"

# Later, find a bug and create fixup commit
echo "function calculate() { return 2 + 2; }" > math.js
git add math.js
git commit --fixup HEAD

# Add more functionality
echo "function multiply(a, b) { return a * b; }" >> math.js
git add math.js
git commit -m "Add multiply function"

# Another fixup for the original commit
echo "function calculate() { return 2 + 2; } // Fixed calculation" > math.js
echo "function multiply(a, b) { return a * b; }" >> math.js
git add math.js
git commit --fixup HEAD~2

# View commits
git log --oneline
```

Output:
```
f6g7h8i fixup! Add calculate function
e5f6g7h Add multiply function
d4e5f6g fixup! Add calculate function
c3d4e5f Add calculate function
```

### Autosquash Rebase

```bash
# Automatically arrange and squash fixup commits
git rebase -i --autosquash HEAD~4
```

Git automatically arranges commits:
```
pick c3d4e5f Add calculate function
fixup d4e5f6g fixup! Add calculate function
fixup f6g7h8i fixup! Add calculate function
pick e5f6g7h Add multiply function
```

### Squash Commits

```bash
# Create squash commit (keeps commit message)
echo "Additional math utilities" >> math.js
git add math.js
git commit --squash HEAD~1  # Squash into "Add multiply function"

# Autosquash will combine messages
git rebase -i --autosquash HEAD~3
```

## Advanced Rebase Scenarios

### 1. Cherry-pick During Rebase

```bash
# Use exec command to cherry-pick during rebase
git rebase -i HEAD~3
```

Add exec commands:
```
pick a1b2c3d First commit
exec git cherry-pick other-branch~2
pick b2c3d4e Second commit
exec git cherry-pick other-branch~1
pick c3d4e5f Third commit
```

### 2. Break and Continue

```bash
# Stop rebase at specific point
git rebase -i HEAD~5
```

Add break command:
```
pick a1b2c3d First commit
pick b2c3d4e Second commit
break
pick c3d4e5f Third commit
pick d4e5f6g Fourth commit
pick e5f6g7h Fifth commit
```

When rebase stops:
```bash
# Do additional work
echo "Additional changes" >> file.txt
git add file.txt
git commit -m "Additional work during rebase"

# Continue rebase
git rebase --continue
```

### 3. Label and Reset

```bash
# Use labels for complex rebases
git rebase -i HEAD~6
```

Use label and reset:
```
label start
pick a1b2c3d First commit
pick b2c3d4e Second commit
label middle
pick c3d4e5f Third commit
reset middle
pick d4e5f6g Fourth commit
pick e5f6g7h Fifth commit
```

## Rebase Best Practices

### 1. Never Rebase Public Branches

```bash
# DON'T do this if others are using the branch
git checkout main
git rebase feature/branch  # DANGEROUS!

# DO this instead
git checkout feature/branch
git rebase main            # Safe - private branch
```

### 2. Use --force-with-lease

```bash
# Safer than --force
git push --force-with-lease origin feature/branch

# This fails if someone else pushed to the branch
```

### 3. Backup Before Complex Rebases

```bash
# Create backup branch
git branch backup/feature-branch

# Do complex rebase
git rebase -i HEAD~10

# If something goes wrong
git reset --hard backup/feature-branch
```

### 4. Test After Rebase

```bash
# Always test after rebase
npm test
npm run build
npm run lint

# Check that functionality still works
```

## Troubleshooting Rebase

### Undo Rebase

```bash
# Find original commit in reflog
git reflog

# Reset to before rebase
git reset --hard HEAD@{5}
```

### Recover Lost Commits

```bash
# Find lost commits
git fsck --lost-found

# Or check reflog
git reflog --all

# Recover specific commit
git cherry-pick lost-commit-hash
```

### Fix Broken Rebase

```bash
# If rebase gets stuck
git rebase --abort

# Start over with different strategy
git rebase -X theirs main  # Prefer their changes
git rebase -X ours main    # Prefer our changes
```

## Quick Reference

```bash
# Basic rebase
git rebase main                    # Rebase current branch onto main
git rebase --onto new old branch   # Move branch from old to new base

# Interactive rebase
git rebase -i HEAD~3               # Interactive rebase last 3 commits
git rebase -i --autosquash HEAD~5  # Auto-arrange fixup/squash commits

# Conflict resolution
git rebase --continue              # Continue after resolving conflicts
git rebase --skip                  # Skip current commit
git rebase --abort                 # Abort rebase

# Fixup workflow
git commit --fixup HEAD~2          # Create fixup commit
git commit --squash HEAD~1         # Create squash commit
git rebase -i --autosquash HEAD~5  # Apply fixups automatically

# Safety
git push --force-with-lease        # Safer force push
git reflog                         # Find lost commits
git reset --hard HEAD@{n}         # Undo rebase
```

---

**Previous:** [Forking and Upstream](10-forking-upstream.md)  
**Next:** [Git Cherry-pick](12-git-cherry-pick.md)