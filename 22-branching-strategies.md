# Branching Strategies: Git Flow vs Trunk-Based Development

Choosing the right branching strategy is crucial for team productivity, code quality, and release management. This guide compares popular branching strategies and helps you choose the best approach for your team.

## Overview of Branching Strategies

### What is a Branching Strategy?

A branching strategy defines:
- How branches are created and named
- When branches are merged
- Who can merge to which branches
- How releases are managed
- How hotfixes are handled

### Popular Strategies

1. **Git Flow** - Feature-rich, structured approach
2. **GitHub Flow** - Simple, continuous deployment
3. **GitLab Flow** - Hybrid approach with environment branches
4. **Trunk-Based Development** - Minimal branching, frequent integration
5. **Release Flow** - Microsoft's approach for large teams

## Git Flow

### Overview

Git Flow is a branching model that uses multiple long-lived branches and specific branch types for different purposes.

### Branch Structure

```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/user-auth
│   ├── feature/payment-system
│   └── feature/admin-dashboard
├── release/v1.2.0 (release preparation)
└── hotfix/critical-bug (emergency fixes)
```

### Branch Types

#### Main Branches

```bash
# main: Production-ready code
# Always deployable, tagged with version numbers
git checkout main
git tag v1.1.0

# develop: Integration branch
# Latest development changes for next release
git checkout develop
```

#### Supporting Branches

```bash
# Feature branches: New features
git checkout develop
git checkout -b feature/user-authentication
# Work on feature...
git checkout develop
git merge --no-ff feature/user-authentication
git branch -d feature/user-authentication

# Release branches: Prepare releases
git checkout develop
git checkout -b release/v1.2.0
# Bug fixes, version bumps, documentation
git checkout main
git merge --no-ff release/v1.2.0
git tag v1.2.0
git checkout develop
git merge --no-ff release/v1.2.0
git branch -d release/v1.2.0

# Hotfix branches: Emergency fixes
git checkout main
git checkout -b hotfix/critical-security-fix
# Make fix...
git checkout main
git merge --no-ff hotfix/critical-security-fix
git tag v1.2.1
git checkout develop
git merge --no-ff hotfix/critical-security-fix
git branch -d hotfix/critical-security-fix
```

### Git Flow Setup

```bash
# Install git-flow (if not already installed)
# On macOS: brew install git-flow
# On Ubuntu: sudo apt-get install git-flow
# On Windows: Download from GitHub

# Initialize git flow in repository
git flow init

# Follow prompts (or use defaults):
# Branch name for production releases: [main]
# Branch name for "next release" development: [develop]
# Feature branches prefix: [feature/]
# Release branches prefix: [release/]
# Hotfix branches prefix: [hotfix/]
# Support branches prefix: [support/]
# Version tag prefix: []
```

### Git Flow Workflow Example

```bash
# Start new feature
git flow feature start user-dashboard
# Creates and switches to feature/user-dashboard

# Work on feature
echo "Dashboard component" > dashboard.js
git add dashboard.js
git commit -m "feat(dashboard): add user dashboard component"

echo "Dashboard styles" > dashboard.css
git add dashboard.css
git commit -m "style(dashboard): add dashboard styling"

echo "Dashboard tests" > dashboard.test.js
git add dashboard.test.js
git commit -m "test(dashboard): add dashboard component tests"

# Finish feature (merges to develop)
git flow feature finish user-dashboard

# Start release
git flow release start 1.2.0

# Prepare release
echo "1.2.0" > VERSION
git add VERSION
git commit -m "chore(release): bump version to 1.2.0"

# Update changelog
cat > CHANGELOG.md << EOF
## v1.2.0 ($(date +%Y-%m-%d))

### Features
- Add user dashboard with statistics
- Improve user authentication flow

### Bug Fixes
- Fix memory leak in data processing
- Resolve CSS layout issues on mobile
EOF

git add CHANGELOG.md
git commit -m "docs(release): update changelog for v1.2.0"

# Finish release (merges to main and develop, creates tag)
git flow release finish 1.2.0

# Handle hotfix
git flow hotfix start critical-fix

# Make fix
echo "Security patch" > security.js
git add security.js
git commit -m "fix(security): patch XSS vulnerability"

# Finish hotfix (merges to main and develop, creates tag)
git flow hotfix finish critical-fix
```

### Git Flow Pros and Cons

#### Pros ✅

- **Clear structure**: Well-defined branch purposes
- **Parallel development**: Multiple features can be developed simultaneously
- **Release management**: Dedicated release preparation
- **Hotfix support**: Quick fixes without disrupting development
- **Stable main**: Production branch is always stable
- **Tool support**: Many tools support Git Flow

#### Cons ❌

- **Complexity**: Many branches to manage
- **Merge overhead**: Frequent merging required
- **Delayed integration**: Features integrated late
- **Conflicts**: More merge conflicts due to delayed integration
- **Overhead**: Not suitable for continuous deployment
- **Learning curve**: Team needs to understand the model

### When to Use Git Flow

✅ **Good for:**
- Large teams with multiple features in parallel
- Scheduled releases (not continuous deployment)
- Products requiring stable releases
- Teams comfortable with complex branching
- Projects with long development cycles

❌ **Not good for:**
- Small teams (< 5 developers)
- Continuous deployment workflows
- Simple projects
- Teams new to Git
- Fast-moving startups

## GitHub Flow

### Overview

GitHub Flow is a lightweight, branch-based workflow designed for continuous deployment.

### Workflow

```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feature/add-search-functionality

# 2. Make changes and commit
echo "Search component" > search.js
git add search.js
git commit -m "feat: add search functionality"

echo "Search tests" > search.test.js
git add search.test.js
git commit -m "test: add search component tests"

# 3. Push branch and create pull request
git push -u origin feature/add-search-functionality
gh pr create --title "Add search functionality" \
  --body "Implements user search with filters and pagination"

# 4. Review and discuss
# Team reviews code, suggests changes

# 5. Deploy for testing (optional)
# Deploy branch to staging environment

# 6. Merge to main
gh pr merge --squash

# 7. Deploy main
# Automatic deployment to production
```

### GitHub Flow Rules

1. **Main is always deployable**
2. **Create descriptive branch names**
3. **Commit early and often**
4. **Open pull request early**
5. **Deploy for testing**
6. **Merge after review**

### GitHub Flow Example

```bash
# Feature development
git checkout main
git pull origin main
git checkout -b feature/user-notifications

# Implement feature incrementally
git commit -m "feat(notifications): add notification model"
git push origin feature/user-notifications

# Open draft PR early for feedback
gh pr create --draft --title "WIP: User notifications system"

git commit -m "feat(notifications): add notification service"
git push origin feature/user-notifications

git commit -m "feat(notifications): add notification UI components"
git push origin feature/user-notifications

git commit -m "test(notifications): add comprehensive tests"
git push origin feature/user-notifications

# Mark PR as ready for review
gh pr ready

# After review and approval
gh pr merge --squash

# Clean up
git checkout main
git pull origin main
git branch -d feature/user-notifications
```

### GitHub Flow Pros and Cons

#### Pros ✅

- **Simple**: Easy to understand and implement
- **Fast**: Quick feature delivery
- **Continuous deployment**: Perfect for CD workflows
- **Collaboration**: Early feedback through PRs
- **Flexible**: Adaptable to different team sizes
- **Low overhead**: Minimal branch management

#### Cons ❌

- **No release branches**: Difficult for scheduled releases
- **Main instability**: Risk of breaking main branch
- **No hotfix process**: Emergency fixes follow same process
- **Limited for complex releases**: Not suitable for complex release management

### When to Use GitHub Flow

✅ **Good for:**
- Continuous deployment
- Small to medium teams
- Web applications
- SaaS products
- Agile development
- Simple release cycles

❌ **Not good for:**
- Scheduled releases
- Multiple production versions
- Complex release processes
- Large enterprise teams

## Trunk-Based Development

### Overview

Trunk-based development focuses on keeping branches short-lived and integrating changes frequently into the main branch (trunk).

### Core Principles

1. **Short-lived branches** (< 2 days)
2. **Frequent integration** (multiple times per day)
3. **Feature flags** for incomplete features
4. **Continuous integration**
5. **Automated testing**

### Workflow

```bash
# 1. Create short-lived branch
git checkout main
git pull origin main
git checkout -b add-user-validation

# 2. Make small, focused changes
echo "Basic validation" > validation.js
git add validation.js
git commit -m "feat: add basic user validation"

# 3. Push and create PR immediately
git push -u origin add-user-validation
gh pr create --title "Add user validation" \
  --body "Small focused change for user input validation"

# 4. Quick review and merge (same day)
gh pr merge --squash

# 5. Delete branch immediately
git checkout main
git pull origin main
git branch -d add-user-validation

# 6. Repeat for next small change
git checkout -b improve-validation-messages
# Continue with next small improvement...
```

### Feature Flags Implementation

```javascript
// Feature flag for incomplete features
const featureFlags = {
  newUserDashboard: process.env.ENABLE_NEW_DASHBOARD === 'true',
  advancedSearch: process.env.ENABLE_ADVANCED_SEARCH === 'true'
};

// Use feature flags in code
function renderDashboard() {
  if (featureFlags.newUserDashboard) {
    return <NewDashboard />;
  }
  return <LegacyDashboard />;
}

// Gradual rollout
function shouldShowNewFeature(userId) {
  // Show to 10% of users
  return (userId % 10) === 0;
}
```

### Branch by Abstraction

```javascript
// Old implementation
class LegacyPaymentProcessor {
  processPayment(amount) {
    // Legacy payment logic
  }
}

// New implementation (developed incrementally)
class NewPaymentProcessor {
  processPayment(amount) {
    // New payment logic
  }
}

// Abstraction layer
class PaymentService {
  constructor() {
    this.processor = featureFlags.newPaymentSystem 
      ? new NewPaymentProcessor()
      : new LegacyPaymentProcessor();
  }
  
  processPayment(amount) {
    return this.processor.processPayment(amount);
  }
}
```

### Trunk-Based Development Example

```bash
# Day 1: Start new feature with feature flag
git checkout main
git pull origin main
git checkout -b feature-flag-setup

# Add feature flag infrastructure
cat > feature-flags.js << EOF
module.exports = {
  newCheckoutFlow: process.env.ENABLE_NEW_CHECKOUT === 'true'
};
EOF

git add feature-flags.js
git commit -m "feat: add feature flag infrastructure"
git push -u origin feature-flag-setup
gh pr create --title "Add feature flag infrastructure"
gh pr merge --squash

# Day 1: Add basic checkout component (behind flag)
git checkout main
git pull origin main
git checkout -b checkout-component-basic

cat > checkout.js << EOF
const { newCheckoutFlow } = require('./feature-flags');

function renderCheckout() {
  if (newCheckoutFlow) {
    return '<div>New Checkout (Basic)</div>';
  }
  return '<div>Legacy Checkout</div>';
}
EOF

git add checkout.js
git commit -m "feat: add basic new checkout component (behind flag)"
git push -u origin checkout-component-basic
gh pr create --title "Add basic checkout component"
gh pr merge --squash

# Day 2: Enhance checkout component
git checkout main
git pull origin main
git checkout -b checkout-payment-integration

# Enhance the component
sed -i 's/Basic/with Payment Integration/' checkout.js
git add checkout.js
git commit -m "feat: add payment integration to new checkout"
git push -u origin checkout-payment-integration
gh pr create --title "Add payment integration to checkout"
gh pr merge --squash

# Day 3: Enable feature for testing
git checkout main
git pull origin main
git checkout -b enable-checkout-testing

# Update documentation
echo "Set ENABLE_NEW_CHECKOUT=true for testing" > README.md
git add README.md
git commit -m "docs: add instructions for testing new checkout"
git push -u origin enable-checkout-testing
gh pr create --title "Add testing instructions for new checkout"
gh pr merge --squash

# After testing: Enable for all users
# Remove feature flag in production deployment
```

### Trunk-Based Development Pros and Cons

#### Pros ✅

- **Fast integration**: Immediate feedback on changes
- **Reduced conflicts**: Fewer merge conflicts
- **Continuous delivery**: Always ready to deploy
- **Simple branching**: Minimal branch management
- **Team collaboration**: Shared codebase visibility
- **Quality focus**: Emphasis on automated testing

#### Cons ❌

- **Requires discipline**: Team must commit to practices
- **Feature flag complexity**: Managing feature flags
- **Incomplete features**: Risk of shipping incomplete work
- **Testing overhead**: Comprehensive automated testing required
- **Cultural change**: Significant workflow change

### When to Use Trunk-Based Development

✅ **Good for:**
- High-performing teams
- Continuous deployment
- Microservices architecture
- Teams with strong testing culture
- Fast-moving products
- Experienced developers

❌ **Not good for:**
- Teams new to CI/CD
- Complex release processes
- Regulated industries (without proper controls)
- Large, distributed teams
- Projects requiring long-term feature development

## GitLab Flow

### Overview

GitLab Flow combines feature-driven development with issue tracking and environment-specific branches.

### Environment Branches

```bash
# Branch structure
main (development)
├── pre-production (staging)
└── production (live)

# Feature development
git checkout main
git checkout -b feature/user-profile
# Develop feature...
git push origin feature/user-profile
# Create merge request to main

# Deploy to staging
git checkout pre-production
git merge main
git push origin pre-production

# Deploy to production
git checkout production
git merge pre-production
git push origin production
git tag v1.2.0
```

### Release Branches (Alternative)

```bash
# For scheduled releases
main (development)
├── 2-3-stable (release branch)
└── 2-4-stable (next release)

# Cherry-pick fixes to release branches
git checkout 2-3-stable
git cherry-pick abc123  # Bug fix from main
git push origin 2-3-stable
```

### GitLab Flow Workflow

```bash
# 1. Create issue
gh issue create --title "Add user profile page" \
  --body "Users need a profile page to manage their information"

# 2. Create branch from issue
git checkout main
git pull origin main
git checkout -b 123-add-user-profile  # Issue number prefix

# 3. Develop feature
git commit -m "feat: add user profile component

Implements basic user profile page with:
- Personal information display
- Avatar upload
- Settings management

Closes #123"

# 4. Push and create merge request
git push -u origin 123-add-user-profile
gh pr create --title "Add user profile page" \
  --body "Closes #123" \
  --assignee @reviewer

# 5. Code review and merge to main
gh pr merge --squash

# 6. Deploy to pre-production
git checkout pre-production
git merge main
git push origin pre-production

# 7. Test in staging environment
# Run integration tests, manual testing

# 8. Deploy to production
git checkout production
git merge pre-production
git push origin production
git tag v1.2.0
```

## Release Flow (Microsoft)

### Overview

Release Flow is designed for large teams with scheduled releases and multiple supported versions.

### Branch Structure

```bash
main (development)
├── releases/v1.0 (supported release)
├── releases/v1.1 (current release)
└── releases/v1.2 (next release)

# Topic branches
├── users/alice/feature-x
├── users/bob/bugfix-y
└── teams/frontend/ui-refresh
```

### Workflow

```bash
# 1. Create topic branch
git checkout main
git checkout -b users/alice/add-search-feature

# 2. Develop and push regularly
git commit -m "feat: add search infrastructure"
git push -u origin users/alice/add-search-feature

# 3. Create pull request to main
gh pr create --title "Add search feature" \
  --body "Implements full-text search with filters"

# 4. Merge to main after review
gh pr merge --squash

# 5. Create release branch when ready
git checkout main
git checkout -b releases/v1.2
git push -u origin releases/v1.2

# 6. Cherry-pick fixes to release branch
git checkout releases/v1.2
git cherry-pick abc123  # Bug fix from main

# 7. Deploy from release branch
git tag v1.2.0
git push origin v1.2.0
```

## Choosing the Right Strategy

### Decision Matrix

| Factor | Git Flow | GitHub Flow | Trunk-Based | GitLab Flow |
|--------|----------|-------------|-------------|-------------|
| Team Size | Large | Small-Medium | Any | Medium-Large |
| Release Cycle | Scheduled | Continuous | Continuous | Flexible |
| Complexity | High | Low | Medium | Medium |
| CI/CD Maturity | Medium | High | Very High | High |
| Feature Flags | Optional | Optional | Required | Optional |
| Learning Curve | Steep | Gentle | Medium | Medium |
| Parallel Features | Excellent | Good | Limited | Good |
| Hotfix Support | Excellent | Basic | Good | Good |

### Team Characteristics

#### Small Team (2-5 developers)
```bash
# Recommended: GitHub Flow
# Simple, fast, minimal overhead
git checkout main
git checkout -b feature/quick-fix
git commit -m "fix: resolve login issue"
git push origin feature/quick-fix
gh pr create --title "Fix login issue"
gh pr merge --squash
```

#### Medium Team (5-15 developers)
```bash
# Recommended: GitLab Flow or Trunk-Based
# Balance between structure and simplicity

# GitLab Flow approach
git checkout main
git checkout -b feature/user-dashboard
# Develop feature...
gh pr create --title "Add user dashboard"
# Merge to main, then promote through environments
```

#### Large Team (15+ developers)
```bash
# Recommended: Git Flow or Release Flow
# Structure needed for coordination

# Git Flow approach
git flow feature start user-management
# Develop feature...
git flow feature finish user-management
# Structured release process
```

### Project Characteristics

#### Web Application (SaaS)
```bash
# Recommended: GitHub Flow or Trunk-Based
# Fast deployment, continuous delivery

# Trunk-based with feature flags
git checkout main
git checkout -b add-feature-flag
echo "newFeature: false" >> config.js
git commit -m "feat: add feature flag for new feature"
gh pr create --title "Add feature flag"
gh pr merge --squash
```

#### Mobile Application
```bash
# Recommended: Git Flow or GitLab Flow
# App store releases, testing cycles

# Git Flow for app releases
git flow release start 2.1.0
# Prepare release, test thoroughly
git flow release finish 2.1.0
# Submit to app stores
```

#### Enterprise Software
```bash
# Recommended: Git Flow or Release Flow
# Multiple supported versions, scheduled releases

# Release Flow for enterprise
git checkout main
git checkout -b releases/v2023.1
# Stabilize release
git tag v2023.1.0
# Support multiple versions
```

## Implementation Guide

### Transitioning Strategies

#### From No Strategy to GitHub Flow

```bash
# Week 1: Establish main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{}'

# Week 2: Train team on PR workflow
# Create PR template
cat > .github/pull_request_template.md << EOF
## Description
Brief description of changes

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
EOF

# Week 3: Implement CI/CD pipeline
# Add GitHub Actions workflow

# Week 4: Full adoption
# All changes go through PRs
```

#### From GitHub Flow to Trunk-Based

```bash
# Phase 1: Reduce branch lifetime
# Encourage smaller, more frequent PRs

# Phase 2: Implement feature flags
npm install --save feature-flags

# Phase 3: Increase integration frequency
# Multiple merges per day

# Phase 4: Remove long-lived feature branches
# All work in short-lived branches
```

### Team Training

#### Git Flow Training Plan

```bash
# Day 1: Concepts and setup
git flow init
# Explain branch types and purposes

# Day 2: Feature workflow
git flow feature start training-feature
git commit -m "feat: add training example"
git flow feature finish training-feature

# Day 3: Release workflow
git flow release start 1.0.0
# Practice release preparation
git flow release finish 1.0.0

# Day 4: Hotfix workflow
git flow hotfix start critical-fix
git commit -m "fix: critical security patch"
git flow hotfix finish critical-fix

# Day 5: Integration with tools
# Configure CI/CD for Git Flow
```

#### Trunk-Based Training Plan

```bash
# Week 1: Feature flag infrastructure
# Set up feature flag system

# Week 2: Short-lived branches
# Practice 1-day branch lifecycle

# Week 3: Continuous integration
# Multiple integrations per day

# Week 4: Branch by abstraction
# Practice large feature development
```

## Monitoring and Metrics

### Branch Metrics

```bash
# Script to analyze branch patterns
#!/bin/bash

# Average branch lifetime
git for-each-ref --format='%(refname:short) %(committerdate)' refs/remotes/origin/ | \
  grep -v 'main\|develop' | \
  while read branch date; do
    created=$(git log --reverse --format='%ct' $branch | head -1)
    merged=$(git log --format='%ct' --grep="Merge.*$branch" main | head -1)
    if [ ! -z "$merged" ]; then
      lifetime=$((($merged - $created) / 86400))
      echo "$branch: $lifetime days"
    fi
  done

# Number of active branches
git branch -r | grep -v 'main\|develop' | wc -l

# Merge frequency
git log --oneline --grep="Merge" --since="1 month ago" | wc -l
```

### Quality Metrics

```bash
# Commit frequency
git log --oneline --since="1 week ago" | wc -l

# Average commits per PR
gh pr list --state merged --limit 50 --json number | \
  jq -r '.[] | .number' | \
  while read pr; do
    commits=$(gh pr view $pr --json commits | jq '.commits | length')
    echo $commits
  done | \
  awk '{sum+=$1; count++} END {print "Average:", sum/count}'

# Conflict resolution time
git log --grep="resolve.*conflict" --format='%ct' | \
  # Calculate time between conflict and resolution
```

## Best Practices Summary

### Universal Best Practices

✅ **Protect main branch** - Require reviews and status checks  
✅ **Use descriptive branch names** - Clear purpose and scope  
✅ **Write good commit messages** - Follow conventional commits  
✅ **Review all changes** - No direct pushes to main  
✅ **Automate testing** - CI/CD for all branches  
✅ **Clean up branches** - Delete merged branches  
✅ **Document strategy** - Team guidelines and training  
✅ **Monitor metrics** - Track branch health and team velocity  

### Strategy-Specific Tips

#### Git Flow
- Use git-flow tools for consistency
- Automate release branch creation
- Maintain clear release notes
- Train team on all branch types

#### GitHub Flow
- Deploy branches for testing
- Use draft PRs for early feedback
- Implement feature flags for incomplete work
- Maintain high test coverage

#### Trunk-Based Development
- Invest in automated testing
- Use feature flags extensively
- Keep branches under 2 days
- Practice branch by abstraction

#### GitLab Flow
- Use environment branches consistently
- Implement proper promotion process
- Link issues to merge requests
- Maintain environment parity

## Quick Reference

```bash
# Git Flow commands
git flow init                     # Initialize git flow
git flow feature start <name>    # Start feature
git flow feature finish <name>   # Finish feature
git flow release start <version> # Start release
git flow release finish <version># Finish release
git flow hotfix start <name>     # Start hotfix
git flow hotfix finish <name>    # Finish hotfix

# GitHub Flow commands
git checkout -b feature/name     # Create feature branch
gh pr create                     # Create pull request
gh pr merge --squash             # Squash and merge
git branch -d feature/name       # Delete branch

# Trunk-based commands
git checkout -b short-lived      # Short-lived branch
git commit -m "small change"     # Small, focused commits
gh pr create --draft             # Draft PR for feedback
gh pr merge --squash             # Quick merge

# Branch analysis
git branch -r                    # List remote branches
git log --graph --oneline        # Visual branch history
git show-branch                  # Show branch relationships
```

---

**Previous:** [Clean Git History](21-clean-git-history.md)  
**Next:** [Force Push Safety](23-force-push-safety.md)