# Force Push Safety: Using --force-with-lease

Force pushing is sometimes necessary in Git workflows, but it can be dangerous in team environments. This guide covers safe practices for force pushing, with emphasis on `--force-with-lease` and other protective measures.

## Understanding Force Push

### What is Force Push?

Force push overwrites the remote branch history with your local branch history, potentially losing commits that others have made.

```bash
# Dangerous: Traditional force push
git push --force origin feature-branch

# Safer: Force push with lease
git push --force-with-lease origin feature-branch
```

### When Force Push is Needed

1. **After interactive rebase** - Cleaning up commit history
2. **After amending commits** - Fixing commit messages or content
3. **After squashing commits** - Combining related commits
4. **After cherry-picking** - Applying commits from other branches
5. **After resetting commits** - Undoing recent commits

### The Dangers of Force Push

```bash
# Scenario: Developer A and B working on same branch

# Developer A's work
git checkout feature-branch
echo "A's work" > file-a.txt
git add file-a.txt
git commit -m "feat: add A's feature"
git push origin feature-branch

# Developer B pulls and adds work
git pull origin feature-branch
echo "B's work" > file-b.txt
git add file-b.txt
git commit -m "feat: add B's feature"
git push origin feature-branch

# Developer A rebases (without pulling B's work)
git rebase -i HEAD~2  # Squash commits
git push --force origin feature-branch  # DANGEROUS!

# Result: B's work is lost!
```

## --force-with-lease: The Safe Alternative

### How --force-with-lease Works

`--force-with-lease` only allows the force push if the remote branch is at the expected commit (the one you last fetched).

```bash
# Safe force push workflow
git fetch origin                              # Update remote refs
git rebase -i HEAD~3                         # Clean up commits
git push --force-with-lease origin feature-branch  # Safe force push
```

### Detailed Example

```bash
# Initial setup
git checkout -b feature/user-authentication
echo "Login component" > login.js
git add login.js
git commit -m "feat: add login component"
git push -u origin feature/user-authentication

# Add more commits
echo "Password validation" >> login.js
git add login.js
git commit -m "feat: add password validation"

echo "Login tests" > login.test.js
git add login.test.js
git commit -m "test: add login tests"

echo "Fix typo" >> login.js
git add login.js
git commit -m "fix: typo in login component"

git push origin feature/user-authentication

# Clean up history with interactive rebase
git rebase -i HEAD~3

# In the editor:
# pick abc123 feat: add login component
# pick def456 feat: add password validation
# squash ghi789 test: add login tests
# fixup jkl012 fix: typo in login component

# After rebase, history is rewritten
git log --oneline
# abc123 feat: add login component
# def456 feat: add password validation and tests

# Safe force push
git push --force-with-lease origin feature/user-authentication

# If someone else pushed in the meantime:
# error: failed to push some refs to 'origin'
# hint: Updates were rejected because the tip of your current branch is behind
# hint: its remote counterpart. Integrate the remote changes (e.g.
# hint: 'git pull ...') before pushing again.
```

### --force-with-lease vs --force

```bash
# Scenario: Remote has new commits

# Setup: Remote branch has commits you don't have locally
git log --oneline origin/feature-branch
# abc123 feat: teammate's work (you don't have this)
# def456 feat: your previous work

git log --oneline feature-branch
# ghi789 feat: your rebased work
# def456 feat: your previous work (rebased)

# Using --force (DANGEROUS)
git push --force origin feature-branch
# SUCCESS: Overwrites teammate's work!

# Using --force-with-lease (SAFE)
git push --force-with-lease origin feature-branch
# ERROR: Rejects push, protects teammate's work
```

## Safe Force Push Workflows

### Pre-Force Push Checklist

```bash
#!/bin/bash
# safe-force-push.sh - Script for safe force pushing

BRANCH=$(git branch --show-current)
REMOTE="origin"

echo "🔍 Pre-force-push safety checks for branch: $BRANCH"

# 1. Ensure we're not on main/develop
if [[ "$BRANCH" == "main" || "$BRANCH" == "develop" || "$BRANCH" == "master" ]]; then
    echo "❌ Cannot force push to protected branch: $BRANCH"
    exit 1
fi

# 2. Fetch latest remote state
echo "📡 Fetching latest remote state..."
git fetch $REMOTE

# 3. Check if remote branch exists
if ! git show-ref --verify --quiet refs/remotes/$REMOTE/$BRANCH; then
    echo "❌ Remote branch $REMOTE/$BRANCH does not exist"
    exit 1
fi

# 4. Show what will be overwritten
echo "📊 Commits that will be overwritten:"
git log --oneline $REMOTE/$BRANCH..$BRANCH

echo "📊 Commits that will be lost:"
git log --oneline $BRANCH..$REMOTE/$BRANCH

# 5. Confirm with user
read -p "🤔 Proceed with force push? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Force push cancelled"
    exit 1
fi

# 6. Perform safe force push
echo "🚀 Performing safe force push..."
if git push --force-with-lease $REMOTE $BRANCH; then
    echo "✅ Force push successful!"
else
    echo "❌ Force push failed - remote branch was updated"
    echo "💡 Run 'git pull --rebase' and try again"
    exit 1
fi
```

### Team Coordination Workflow

```bash
# 1. Communicate intent
# Post in team chat: "Rebasing feature/user-auth, will force push in 5 min"

# 2. Ensure no one else is working on the branch
git fetch origin
git log --oneline feature/user-auth..origin/feature/user-auth
# Should be empty if no one else pushed

# 3. Perform rebase
git rebase -i HEAD~5

# 4. Force push with lease
git push --force-with-lease origin feature/user-auth

# 5. Notify team
# Post in team chat: "Force push complete on feature/user-auth"
```

### Collaborative Feature Branch

```bash
# When multiple developers work on same feature branch

# Developer A: Wants to clean up commits
git checkout feature/shared-feature
git fetch origin

# Check if others have pushed
if git log --oneline HEAD..origin/feature/shared-feature | grep -q .; then
    echo "⚠️  Others have pushed to this branch"
    echo "📞 Coordinate with team before force pushing"
    
    # Show who made recent commits
    git log --oneline --format="%h %an %s" HEAD..origin/feature/shared-feature
    
    exit 1
fi

# Safe to rebase if no new commits
git rebase -i HEAD~3
git push --force-with-lease origin feature/shared-feature
```

## Advanced Force Push Scenarios

### Recovering from Failed Force Push

```bash
# If force push fails due to remote updates
git push --force-with-lease origin feature-branch
# error: failed to push some refs

# Option 1: Rebase on top of remote changes
git fetch origin
git rebase origin/feature-branch
git push --force-with-lease origin feature-branch

# Option 2: Merge remote changes (if rebase is complex)
git fetch origin
git merge origin/feature-branch
git push origin feature-branch  # No force needed

# Option 3: Reset and start over (if safe)
git fetch origin
git reset --hard origin/feature-branch
# Redo your changes
```

### Force Push with Specific Lease

```bash
# Force push only if remote is at specific commit
git push --force-with-lease=feature-branch:abc123 origin feature-branch

# This ensures remote branch is exactly at commit abc123
# Useful when you know the exact state you expect
```

### Partial Force Push

```bash
# Force push only specific commits
git push --force-with-lease origin HEAD~2:feature-branch

# This pushes all commits except the last 2 to remote
# Useful for partial updates
```

## Branch Protection and Policies

### GitHub Branch Protection Rules

```bash
# Set up branch protection via GitHub CLI
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":2}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false

# Protect develop branch
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci/tests"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field allow_force_pushes=false
```

### Git Hooks for Force Push Protection

```bash
# Server-side pre-receive hook
cat > hooks/pre-receive << 'EOF'
#!/bin/bash

while read oldrev newrev refname; do
    branch=$(echo $refname | sed 's/refs\/heads\///')
    
    # Protect main branches from force push
    if [[ "$branch" == "main" || "$branch" == "develop" ]]; then
        if [[ "$oldrev" != "0000000000000000000000000000000000000000" ]]; then
            # Check if this is a force push (non-fast-forward)
            if ! git merge-base --is-ancestor $oldrev $newrev; then
                echo "❌ Force push to $branch is not allowed"
                exit 1
            fi
        fi
    fi
    
    # Warn about force pushes to feature branches
    if [[ "$branch" == feature/* ]]; then
        if [[ "$oldrev" != "0000000000000000000000000000000000000000" ]]; then
            if ! git merge-base --is-ancestor $oldrev $newrev; then
                echo "⚠️  Force push detected on feature branch: $branch"
                echo "💡 Consider using --force-with-lease for safety"
            fi
        fi
    fi
done
EOF

chmod +x hooks/pre-receive
```

### Client-side Protection

```bash
# Pre-push hook to prevent accidental force push
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

protected_branches="main develop master"
remote="$1"
url="$2"

while read local_ref local_sha remote_ref remote_sha; do
    branch=$(echo $remote_ref | sed 's/refs\/heads\///')
    
    # Check if pushing to protected branch
    for protected in $protected_branches; do
        if [[ "$branch" == "$protected" ]]; then
            echo "❌ Direct push to $branch is not allowed"
            echo "💡 Use pull request workflow instead"
            exit 1
        fi
    done
    
    # Check for force push
    if [[ "$remote_sha" != "0000000000000000000000000000000000000000" ]]; then
        if ! git merge-base --is-ancestor $remote_sha $local_sha; then
            echo "⚠️  Force push detected to $branch"
            read -p "🤔 Are you sure? This will rewrite history. (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ Push cancelled"
                exit 1
            fi
        fi
    fi
done
EOF

chmod +x .git/hooks/pre-push
```

## Team Guidelines and Best Practices

### Force Push Policy Template

```markdown
# Force Push Policy

## Allowed Scenarios
- ✅ Feature branches (with coordination)
- ✅ Personal branches (user/name/*)
- ✅ Experimental branches (experiment/*)
- ✅ After team coordination

## Forbidden Scenarios
- ❌ main/master branch
- ❌ develop branch
- ❌ release/* branches
- ❌ Shared feature branches (without coordination)

## Required Practices
1. **Always use --force-with-lease**
2. **Fetch before force pushing**
3. **Communicate with team**
4. **Verify branch state**
5. **Have backup plan**

## Communication Protocol
1. Announce intent in team chat
2. Wait for acknowledgment
3. Perform force push
4. Confirm completion

## Emergency Procedures
If force push causes issues:
1. Immediately notify team
2. Use git reflog to find lost commits
3. Create recovery branch
4. Coordinate team recovery
```

### Team Training Checklist

```bash
# Force push training session

# 1. Demonstrate the danger
git checkout -b demo-danger
echo "Original work" > file.txt
git add file.txt
git commit -m "original work"
git push -u origin demo-danger

# Simulate teammate's work
echo "Teammate's work" >> file.txt
git add file.txt
git commit -m "teammate's addition"
git push origin demo-danger

# Reset to simulate rebase
git reset --hard HEAD~1
echo "My rebased work" > file.txt
git add file.txt
git commit -m "my rebased work"

# Show difference between --force and --force-with-lease
git push --force-with-lease origin demo-danger  # Fails safely
git push --force origin demo-danger             # Succeeds dangerously

# 2. Practice safe workflow
git checkout -b demo-safe
echo "Safe work" > safe.txt
git add safe.txt
git commit -m "safe work"
git push -u origin demo-safe

# Rebase safely
git fetch origin
git rebase -i HEAD~1
git push --force-with-lease origin demo-safe

# 3. Recovery practice
# Simulate lost work and recovery using reflog
```

## Automation and Tooling

### Git Aliases for Safe Force Push

```bash
# Set up helpful aliases
git config --global alias.force-lease 'push --force-with-lease'
git config --global alias.safe-force '!f() { git fetch origin && git push --force-with-lease origin "$@"; }; f'
git config --global alias.force-check '!f() { git fetch origin && git log --oneline "$1"..origin/"$1"; }; f'

# Usage examples
git force-lease origin feature-branch
git safe-force feature-branch
git force-check feature-branch  # Check what would be overwritten
```

### Shell Functions

```bash
# Add to ~/.bashrc or ~/.zshrc

# Safe force push function
safe_force_push() {
    local branch=${1:-$(git branch --show-current)}
    local remote=${2:-origin}
    
    echo "🔍 Checking branch: $branch"
    
    # Fetch latest
    git fetch $remote
    
    # Check if branch exists remotely
    if ! git show-ref --verify --quiet refs/remotes/$remote/$branch; then
        echo "❌ Remote branch $remote/$branch does not exist"
        return 1
    fi
    
    # Show what will be lost
    local lost_commits=$(git rev-list --count $branch..$remote/$branch)
    if [ $lost_commits -gt 0 ]; then
        echo "⚠️  $lost_commits commits will be lost:"
        git log --oneline $branch..$remote/$branch
        
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Cancelled"
            return 1
        fi
    fi
    
    # Perform safe force push
    git push --force-with-lease $remote $branch
}

# Check force push safety
check_force_safety() {
    local branch=${1:-$(git branch --show-current)}
    local remote=${2:-origin}
    
    git fetch $remote
    
    echo "📊 Branch status for $branch:"
    echo "Local commits not on remote:"
    git log --oneline $remote/$branch..$branch
    
    echo "Remote commits not local:"
    git log --oneline $branch..$remote/$branch
    
    echo "Last common commit:"
    git merge-base $branch $remote/$branch | xargs git show --oneline -s
}
```

### IDE Integration

```json
// VS Code settings.json
{
    "git.allowForcePush": false,
    "git.useForcePushWithLease": true,
    "git.confirmForcePush": true,
    "git.protectedBranches": ["main", "develop", "master"]
}
```

## Troubleshooting Force Push Issues

### Common Problems and Solutions

#### Problem: Force Push Rejected

```bash
# Error message:
# error: failed to push some refs to 'origin'
# hint: Updates were rejected because the tip of your current branch is behind

# Solution 1: Check what changed
git fetch origin
git log --oneline HEAD..origin/feature-branch

# Solution 2: Rebase on top of changes
git rebase origin/feature-branch
git push --force-with-lease origin feature-branch

# Solution 3: Merge if rebase is complex
git merge origin/feature-branch
git push origin feature-branch  # No force needed
```

#### Problem: Lost Commits After Force Push

```bash
# Recovery using reflog
git reflog
# Find the commit before force push
# abc123 HEAD@{1}: commit: lost work

# Create recovery branch
git checkout -b recovery-branch abc123

# Cherry-pick lost commits
git checkout feature-branch
git cherry-pick abc123

# Or reset to lost commit
git reset --hard abc123
```

#### Problem: Team Member Can't Pull After Force Push

```bash
# Team member sees:
# error: Your local changes to the following files would be overwritten by merge

# Solution: Reset their local branch
git fetch origin
git reset --hard origin/feature-branch

# Or create backup and reset
git branch backup-branch  # Backup local work
git reset --hard origin/feature-branch
# Cherry-pick from backup if needed
```

### Recovery Strategies

#### Complete Branch Recovery

```bash
# If entire branch history is lost

# 1. Check reflog on all team members' machines
git reflog --all | grep feature-branch

# 2. Find the lost commits
git show abc123  # Verify this is the lost work

# 3. Recreate branch from lost commit
git checkout -b feature-branch-recovered abc123

# 4. Force push the recovery (with team coordination)
git push --force-with-lease origin feature-branch-recovered

# 5. Rename branch back
git branch -m feature-branch-recovered feature-branch
git push origin :feature-branch-recovered  # Delete old branch
git push -u origin feature-branch
```

#### Partial Recovery

```bash
# If only some commits are lost

# 1. Find lost commits in reflog
git reflog | grep "commit:"

# 2. Cherry-pick specific commits
git cherry-pick abc123 def456 ghi789

# 3. Resolve any conflicts
git add .
git cherry-pick --continue

# 4. Push recovered branch
git push origin feature-branch
```

## Monitoring and Auditing

### Force Push Audit Script

```bash
#!/bin/bash
# audit-force-pushes.sh

echo "📊 Force Push Audit Report"
echo "========================="

# Check for force pushes in git log
echo "🔍 Recent force pushes:"
git log --walk-reflogs --grep="forced-update" --oneline --since="1 month ago"

echo "\n📈 Force push frequency by author:"
git log --walk-reflogs --grep="forced-update" --format="%an" --since="1 month ago" | \
    sort | uniq -c | sort -nr

echo "\n🌿 Branches with recent force pushes:"
git for-each-ref --format="%(refname:short) %(push:track)" refs/heads/ | \
    grep "ahead\|behind" | \
    while read branch status; do
        if git log --walk-reflogs --grep="forced-update" refs/heads/$branch --since="1 week ago" >/dev/null 2>&1; then
            echo "  $branch (force pushed recently)"
        fi
    done

echo "\n⚠️  Protected branches status:"
for branch in main develop master; do
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "  $branch: $(git log --oneline -1 $branch)"
    fi
done
```

### GitHub Actions Monitoring

```yaml
# .github/workflows/force-push-monitor.yml
name: Force Push Monitor

on:
  push:
    branches: ['**']

jobs:
  monitor-force-push:
    runs-on: ubuntu-latest
    if: github.event.forced
    
    steps:
      - name: Notify force push
        uses: actions/github-script@v6
        with:
          script: |
            const { owner, repo } = context.repo;
            const branch = context.ref.replace('refs/heads/', '');
            const pusher = context.actor;
            
            // Post to Slack/Teams/Discord
            await github.rest.issues.createComment({
              owner,
              repo,
              issue_number: 1, // Or find related PR
              body: `⚠️ Force push detected on \`${branch}\` by @${pusher}`
            });
            
            // Create audit issue
            await github.rest.issues.create({
              owner,
              repo,
              title: `Force Push Audit: ${branch}`,
              body: `Force push detected:\n- Branch: ${branch}\n- Author: ${pusher}\n- Commit: ${context.sha}`,
              labels: ['audit', 'force-push']
            });
```

## Best Practices Summary

### Do's ✅

- **Always use --force-with-lease** instead of --force
- **Fetch before force pushing** to get latest remote state
- **Communicate with team** before force pushing shared branches
- **Protect main branches** from force pushes
- **Use descriptive commit messages** when cleaning history
- **Have a recovery plan** before force pushing
- **Document force push policies** for your team
- **Train team members** on safe practices

### Don'ts ❌

- **Never force push to main/develop** branches
- **Don't force push without fetching** first
- **Don't force push shared branches** without coordination
- **Don't use --force** when --force-with-lease is available
- **Don't force push during active collaboration**
- **Don't ignore force push failures** - investigate why
- **Don't force push without backup** of important work
- **Don't skip team communication** for shared branches

## Quick Reference

```bash
# Safe force push commands
git fetch origin                              # Update remote refs
git push --force-with-lease origin branch    # Safe force push
git push --force-with-lease=branch:sha origin branch  # Specific lease

# Check before force push
git log --oneline HEAD..origin/branch        # What you'll overwrite
git log --oneline origin/branch..HEAD        # What you'll push
git merge-base HEAD origin/branch             # Common ancestor

# Recovery commands
git reflog                                    # Find lost commits
git cherry-pick <commit>                      # Recover specific commit
git reset --hard <commit>                     # Reset to specific commit
git branch recovery-branch <commit>           # Create recovery branch

# Protection setup
gh api repos/:owner/:repo/branches/main/protection --method PUT --field allow_force_pushes=false
git config --global alias.force-lease 'push --force-with-lease'

# Audit commands
git log --walk-reflogs --grep="forced-update" # Find force pushes
git for-each-ref --format="%(refname:short) %(push:track)" refs/heads/  # Branch status
```

---

**Previous:** [Branching Strategies](22-branching-strategies.md)  
**Next:** [README](README.md)