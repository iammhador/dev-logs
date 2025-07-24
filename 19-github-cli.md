# GitHub CLI (gh)

GitHub CLI is a command-line tool that brings GitHub functionality to your terminal. It allows you to manage repositories, pull requests, issues, and other GitHub features without leaving the command line.

## Installation

### Windows

```bash
# Using winget
winget install --id GitHub.cli

# Using Chocolatey
choco install gh

# Using Scoop
scoop install gh

# Download from GitHub releases
# Visit: https://github.com/cli/cli/releases
```

### macOS

```bash
# Using Homebrew
brew install gh

# Using MacPorts
sudo port install gh
```

### Linux

```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# CentOS/RHEL/Fedora
sudo dnf install gh

# Arch Linux
sudo pacman -S github-cli
```

## Authentication

### Initial Setup

```bash
# Authenticate with GitHub
gh auth login

# Choose authentication method:
# 1. GitHub.com
# 2. GitHub Enterprise Server
# 3. Login with a token
# 4. Login with web browser

# Check authentication status
gh auth status

# View current user
gh api user
```

### Token Authentication

```bash
# Create personal access token at:
# https://github.com/settings/tokens

# Login with token
gh auth login --with-token < token.txt

# Or set environment variable
export GITHUB_TOKEN="your_token_here"

# Refresh token
gh auth refresh

# Logout
gh auth logout
```

## Repository Management

### Creating Repositories

```bash
# Create a new repository
gh repo create my-new-repo

# Create with options
gh repo create my-new-repo \
  --description "My awesome project" \
  --public \
  --clone \
  --gitignore Node \
  --license MIT

# Create from template
gh repo create my-new-repo \
  --template owner/template-repo \
  --clone

# Create private repository
gh repo create my-private-repo --private

# Create repository in organization
gh repo create myorg/team-project --public
```

### Repository Operations

```bash
# Clone repository
gh repo clone owner/repo-name
gh repo clone https://github.com/owner/repo-name

# Fork repository
gh repo fork owner/repo-name
gh repo fork owner/repo-name --clone

# View repository information
gh repo view
gh repo view owner/repo-name
gh repo view owner/repo-name --web

# List repositories
gh repo list
gh repo list owner
gh repo list --limit 50
gh repo list --language javascript
gh repo list --public

# Delete repository (be careful!)
gh repo delete owner/repo-name
```

### Repository Settings

```bash
# Edit repository settings
gh repo edit
gh repo edit --description "Updated description"
gh repo edit --homepage "https://example.com"
gh repo edit --visibility private
gh repo edit --enable-issues=false
gh repo edit --enable-wiki=false

# Archive repository
gh repo archive owner/repo-name

# Set default branch
gh repo edit --default-branch main
```

## Pull Request Management

### Creating Pull Requests

```bash
# Create pull request from current branch
gh pr create

# Create with title and body
gh pr create --title "Add new feature" --body "This PR adds..."

# Create draft pull request
gh pr create --draft

# Create with reviewers and assignees
gh pr create \
  --title "Fix bug in authentication" \
  --body "Resolves issue with login timeout" \
  --reviewer @johndoe,@janedoe \
  --assignee @myself \
  --label bug,priority-high

# Create from template
gh pr create --template .github/pull_request_template.md

# Create and open in browser
gh pr create --web
```

### Pull Request Operations

```bash
# List pull requests
gh pr list
gh pr list --state open
gh pr list --state closed
gh pr list --author @me
gh pr list --assignee johndoe
gh pr list --label bug

# View pull request details
gh pr view 123
gh pr view 123 --web
gh pr view 123 --comments

# Check out pull request locally
gh pr checkout 123
gh pr checkout https://github.com/owner/repo/pull/123

# Review pull request
gh pr review 123
gh pr review 123 --approve
gh pr review 123 --request-changes
gh pr review 123 --comment "Looks good!"

# Merge pull request
gh pr merge 123
gh pr merge 123 --merge      # Create merge commit
gh pr merge 123 --squash     # Squash and merge
gh pr merge 123 --rebase     # Rebase and merge
gh pr merge 123 --delete-branch  # Delete branch after merge

# Close pull request
gh pr close 123

# Reopen pull request
gh pr reopen 123
```

### Pull Request Status

```bash
# Check PR status
gh pr status

# View PR checks
gh pr checks 123
gh pr checks 123 --watch  # Watch checks in real-time

# View PR diff
gh pr diff 123
gh pr diff 123 --name-only

# Ready draft PR
gh pr ready 123

# Convert to draft
gh pr ready 123 --undo
```

## Issue Management

### Creating Issues

```bash
# Create new issue
gh issue create

# Create with title and body
gh issue create \
  --title "Bug: Login form not working" \
  --body "Steps to reproduce: 1. Go to login page..."

# Create with labels and assignees
gh issue create \
  --title "Feature request: Dark mode" \
  --body "Add dark mode support" \
  --label enhancement,ui \
  --assignee johndoe

# Create from template
gh issue create --template .github/ISSUE_TEMPLATE/bug_report.md

# Create and open in browser
gh issue create --web
```

### Issue Operations

```bash
# List issues
gh issue list
gh issue list --state open
gh issue list --state closed
gh issue list --author @me
gh issue list --assignee johndoe
gh issue list --label bug
gh issue list --milestone "v1.0"

# View issue details
gh issue view 456
gh issue view 456 --web
gh issue view 456 --comments

# Edit issue
gh issue edit 456
gh issue edit 456 --title "Updated title"
gh issue edit 456 --body "Updated description"
gh issue edit 456 --add-label priority-high
gh issue edit 456 --remove-label low-priority

# Close issue
gh issue close 456
gh issue close 456 --comment "Fixed in PR #123"

# Reopen issue
gh issue reopen 456

# Pin/unpin issue
gh issue pin 456
gh issue unpin 456

# Transfer issue
gh issue transfer 456 owner/other-repo
```

### Issue Comments

```bash
# Add comment to issue
gh issue comment 456 --body "Thanks for reporting this!"

# Edit comment
gh issue comment 456 --edit-last

# View issue comments
gh issue view 456 --comments
```

## Workflow and Actions

### GitHub Actions

```bash
# List workflow runs
gh run list
gh run list --workflow=ci.yml
gh run list --status=failure
gh run list --branch=main

# View workflow run details
gh run view 123456789
gh run view 123456789 --web
gh run view 123456789 --log

# Download run artifacts
gh run download 123456789
gh run download 123456789 --name artifact-name

# Re-run workflow
gh run rerun 123456789
gh run rerun 123456789 --failed-jobs

# Cancel workflow run
gh run cancel 123456789

# Watch workflow run
gh run watch 123456789
```

### Workflow Management

```bash
# List workflows
gh workflow list

# View workflow details
gh workflow view ci.yml
gh workflow view ci.yml --web

# Run workflow manually
gh workflow run ci.yml
gh workflow run ci.yml --ref feature-branch

# Enable/disable workflow
gh workflow enable ci.yml
gh workflow disable ci.yml
```

## Release Management

### Creating Releases

```bash
# Create release
gh release create v1.0.0

# Create with title and notes
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "First stable release"

# Create from notes file
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes-file CHANGELOG.md

# Create draft release
gh release create v1.0.0 --draft

# Create pre-release
gh release create v1.0.0-beta --prerelease

# Create with assets
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "Release notes" \
  dist/*.zip dist/*.tar.gz
```

### Release Operations

```bash
# List releases
gh release list
gh release list --limit 10

# View release details
gh release view v1.0.0
gh release view v1.0.0 --web

# Download release assets
gh release download v1.0.0
gh release download v1.0.0 --pattern "*.zip"
gh release download v1.0.0 --archive=zip

# Upload assets to existing release
gh release upload v1.0.0 dist/app.zip
gh release upload v1.0.0 dist/*.zip

# Edit release
gh release edit v1.0.0
gh release edit v1.0.0 --title "Updated title"
gh release edit v1.0.0 --notes "Updated notes"

# Delete release
gh release delete v1.0.0
gh release delete v1.0.0 --yes  # Skip confirmation
```

## Advanced Features

### GitHub API Access

```bash
# Make API requests
gh api repos/:owner/:repo
gh api user
gh api orgs/:org/repos

# POST request
gh api repos/:owner/:repo/issues \
  --method POST \
  --field title="New issue" \
  --field body="Issue description"

# Paginate through results
gh api repos/:owner/:repo/issues --paginate

# Use JQ for JSON processing
gh api repos/:owner/:repo | jq '.name'
gh api user/repos | jq '.[].name'
```

### Gist Management

```bash
# Create gist
gh gist create file.txt
gh gist create file1.txt file2.txt
gh gist create --desc "My gist" --public file.txt

# List gists
gh gist list
gh gist list --public
gh gist list --secret

# View gist
gh gist view abc123
gh gist view abc123 --web

# Edit gist
gh gist edit abc123

# Clone gist
gh gist clone abc123

# Delete gist
gh gist delete abc123
```

### SSH Key Management

```bash
# List SSH keys
gh ssh-key list

# Add SSH key
gh ssh-key add ~/.ssh/id_rsa.pub
gh ssh-key add ~/.ssh/id_rsa.pub --title "My laptop key"

# Delete SSH key
gh ssh-key delete key-id
```

## Practical Workflows

### Feature Development Workflow

```bash
# 1. Create feature branch and work on it
git checkout -b feature/new-dashboard
# ... make changes ...
git add .
git commit -m "feat: add new dashboard component"
git push -u origin feature/new-dashboard

# 2. Create pull request
gh pr create \
  --title "Add new dashboard component" \
  --body "Implements new dashboard with charts and metrics" \
  --reviewer @teamlead \
  --label enhancement

# 3. Check PR status
gh pr status
gh pr checks

# 4. Address review comments
# ... make changes ...
git add .
git commit -m "fix: address review comments"
git push

# 5. Merge when approved
gh pr merge --squash --delete-branch
```

### Bug Fix Workflow

```bash
# 1. Create issue for bug
gh issue create \
  --title "Bug: Login form validation error" \
  --body "Login form shows error even with valid credentials" \
  --label bug,priority-high

# 2. Create hotfix branch
git checkout -b hotfix/login-validation
# ... fix the bug ...
git add .
git commit -m "fix: resolve login form validation issue"
git push -u origin hotfix/login-validation

# 3. Create PR that references the issue
gh pr create \
  --title "Fix login form validation" \
  --body "Fixes #123 - resolves validation error in login form" \
  --label bug

# 4. Merge and close issue
gh pr merge --squash
gh issue close 123 --comment "Fixed in PR #124"
```

### Release Workflow

```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version and changelog
echo "1.2.0" > VERSION
echo "## v1.2.0\n- New dashboard\n- Bug fixes" >> CHANGELOG.md
git add VERSION CHANGELOG.md
git commit -m "chore: bump version to 1.2.0"
git push -u origin release/v1.2.0

# 3. Create release PR
gh pr create \
  --title "Release v1.2.0" \
  --body "Release version 1.2.0 with new features and bug fixes" \
  --base main

# 4. Merge release PR
gh pr merge --merge

# 5. Create GitHub release
git checkout main
git pull
git tag v1.2.0
git push origin v1.2.0

gh release create v1.2.0 \
  --title "Version 1.2.0" \
  --notes-file CHANGELOG.md \
  dist/*.zip
```

### Code Review Workflow

```bash
# 1. List PRs to review
gh pr list --review-requested=@me

# 2. Check out PR for testing
gh pr checkout 456
npm test
npm run build

# 3. Review the changes
gh pr view 456
gh pr diff 456

# 4. Leave review
gh pr review 456 \
  --approve \
  --body "LGTM! Great work on the implementation."

# Or request changes
gh pr review 456 \
  --request-changes \
  --body "Please address the following issues: ..."
```

## Configuration and Customization

### Configuration

```bash
# View configuration
gh config list

# Set configuration values
gh config set editor vim
gh config set git_protocol ssh
gh config set prompt enabled

# Set default repository
gh config set default_repo owner/repo-name

# Configuration file location
# Windows: %APPDATA%\GitHub CLI\config.yml
# macOS/Linux: ~/.config/gh/config.yml
```

### Aliases

```bash
# Create aliases
gh alias set pv 'pr view'
gh alias set co 'pr checkout'
gh alias set prs 'pr list --state=open --author=@me'

# List aliases
gh alias list

# Delete alias
gh alias delete pv

# Example useful aliases
gh alias set bugs 'issue list --label=bug'
gh alias set features 'issue list --label=enhancement'
gh alias set myissues 'issue list --assignee=@me'
gh alias set myprs 'pr list --author=@me'
```

### Extensions

```bash
# List available extensions
gh extension list

# Install extension
gh extension install owner/gh-extension-name

# Popular extensions
gh extension install dlvhdr/gh-dash      # Dashboard
gh extension install vilmibm/gh-screensaver  # Fun screensaver
gh extension install mislav/gh-branch    # Branch utilities

# Use extension
gh dash  # If gh-dash is installed

# Update extensions
gh extension upgrade --all

# Remove extension
gh extension remove owner/gh-extension-name
```

## Scripting and Automation

### Bash Scripts with GitHub CLI

```bash
#!/bin/bash
# create-feature-branch.sh

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <feature-name>"
    exit 1
fi

FEATURE_NAME="$1"
BRANCH_NAME="feature/$FEATURE_NAME"

echo "Creating feature branch: $BRANCH_NAME"

# Create and checkout branch
git checkout -b "$BRANCH_NAME"

# Push branch to remote
git push -u origin "$BRANCH_NAME"

echo "Feature branch created successfully!"
echo "Start working on your feature and create a PR when ready:"
echo "  gh pr create --title 'Add $FEATURE_NAME' --body 'Description of the feature'"
```

```bash
#!/bin/bash
# auto-merge-dependabot.sh

set -e

echo "Checking for Dependabot PRs..."

# Get Dependabot PRs
DEPENDABOT_PRS=$(gh pr list --author "app/dependabot" --json number,title,statusCheckRollup --jq '.[] | select(.statusCheckRollup[].state == "SUCCESS") | .number')

if [ -z "$DEPENDABOT_PRS" ]; then
    echo "No Dependabot PRs with passing checks found."
    exit 0
fi

echo "Found Dependabot PRs with passing checks:"
echo "$DEPENDABOT_PRS"

for pr in $DEPENDABOT_PRS; do
    echo "Auto-merging PR #$pr"
    gh pr merge "$pr" --squash --delete-branch
    echo "Merged PR #$pr"
done

echo "All eligible Dependabot PRs have been merged."
```

### PowerShell Scripts

```powershell
# create-release.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [string]$Title = "Version $Version",
    
    [string]$NotesFile = "CHANGELOG.md"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating release $Version" -ForegroundColor Green

# Create and push tag
git tag $Version
git push origin $Version

# Create GitHub release
if (Test-Path $NotesFile) {
    gh release create $Version --title $Title --notes-file $NotesFile
} else {
    gh release create $Version --title $Title --generate-notes
}

Write-Host "Release $Version created successfully!" -ForegroundColor Green
```

### JSON Processing with jq

```bash
# Get repository statistics
gh api repos/:owner/:repo | jq '{
  name: .name,
  stars: .stargazers_count,
  forks: .forks_count,
  issues: .open_issues_count,
  language: .language
}'

# List all open PRs with details
gh pr list --json number,title,author,createdAt | jq '.[] | {
  number: .number,
  title: .title,
  author: .author.login,
  created: .createdAt
}'

# Get workflow run summary
gh run list --json status,conclusion,workflowName | jq 'group_by(.workflowName) | map({
  workflow: .[0].workflowName,
  total: length,
  success: map(select(.conclusion == "success")) | length,
  failure: map(select(.conclusion == "failure")) | length
})'
```

## Best Practices

### 1. Use Meaningful Commit Messages

```bash
# Good commit messages work well with GitHub CLI
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve memory leak in data processing"
git commit -m "docs: update API documentation"

# These create better PR titles when using:
gh pr create  # Uses last commit message as default title
```

### 2. Template Usage

```bash
# Create PR template
mkdir -p .github
cat > .github/pull_request_template.md << EOF
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
EOF

# Template will be used automatically with:
gh pr create
```

### 3. Automation Scripts

```bash
# Create daily standup script
cat > daily-standup.sh << 'EOF'
#!/bin/bash

echo "📊 Daily Standup Report - $(date)"
echo "================================"

echo "\n🔄 My Open PRs:"
gh pr list --author @me --state open

echo "\n👀 PRs Awaiting My Review:"
gh pr list --review-requested @me

echo "\n🐛 My Open Issues:"
gh issue list --assignee @me --state open

echo "\n📈 Recent Activity:"
gh api user/events --paginate | jq -r '.[] | select(.created_at > "'$(date -d '1 day ago' -I)'T00:00:00Z") | "\(.type): \(.repo.name) - \(.created_at)"' | head -10
EOF

chmod +x daily-standup.sh
```

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   ```bash
   # Check auth status
   gh auth status
   
   # Re-authenticate
   gh auth logout
   gh auth login
   
   # Check token permissions
   gh api user
   ```

2. **API Rate Limiting**
   ```bash
   # Check rate limit status
   gh api rate_limit
   
   # Use authenticated requests (higher limits)
   gh auth login
   ```

3. **Repository Not Found**
   ```bash
   # Check if you're in a git repository
   git remote -v
   
   # Specify repository explicitly
   gh pr list --repo owner/repo-name
   ```

4. **Permission Denied**
   ```bash
   # Check repository permissions
   gh api repos/:owner/:repo
   
   # Ensure you have necessary permissions for the operation
   ```

## Quick Reference

```bash
# Authentication
gh auth login                    # Login to GitHub
gh auth status                   # Check auth status
gh auth logout                   # Logout

# Repository
gh repo create name              # Create repository
gh repo clone owner/repo         # Clone repository
gh repo fork owner/repo          # Fork repository
gh repo view                     # View repository info

# Pull Requests
gh pr create                     # Create PR
gh pr list                       # List PRs
gh pr view 123                   # View PR details
gh pr checkout 123               # Checkout PR
gh pr merge 123                  # Merge PR
gh pr review 123                 # Review PR

# Issues
gh issue create                  # Create issue
gh issue list                    # List issues
gh issue view 456                # View issue
gh issue close 456               # Close issue

# Workflows
gh run list                      # List workflow runs
gh run view 789                  # View run details
gh workflow run ci.yml           # Trigger workflow

# Releases
gh release create v1.0.0         # Create release
gh release list                  # List releases
gh release download v1.0.0       # Download release

# API
gh api user                      # Make API request
gh api repos/:owner/:repo        # Repository API

# Configuration
gh config set editor vim         # Set configuration
gh alias set co 'pr checkout'    # Create alias
gh extension install owner/ext   # Install extension
```

---

**Previous:** [Conventional Commits](18-conventional-commits.md)  
**Next:** [GitHub Actions Basics](20-github-actions-basics.md)