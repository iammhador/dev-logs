# Git Tags

Git tags are references that point to specific commits, typically used to mark release points, important milestones, or significant versions in your project history. Tags provide a way to create permanent bookmarks in your repository.

## Understanding Git Tags

### What are Tags?

Tags are immutable references to specific commits that:
- Mark important points in history (releases, milestones)
- Provide human-readable names for commits
- Can include additional metadata (annotated tags)
- Are typically used for versioning (v1.0, v2.1.3, etc.)

### Tags vs Branches

| Feature | Tags | Branches |
|---------|------|----------|
| **Mutability** | Immutable | Mutable |
| **Purpose** | Mark specific points | Track ongoing work |
| **Movement** | Stay at one commit | Move with new commits |
| **Typical Use** | Releases, milestones | Feature development |

## Types of Tags

### Lightweight Tags

Lightweight tags are simple pointers to commits:
- Just a name pointing to a commit
- No additional metadata
- Stored as a simple reference
- Quick and easy to create

### Annotated Tags

Annotated tags are full objects in Git database:
- Contain tagger name, email, and date
- Include a tagging message
- Can be signed with GPG
- Recommended for releases

## Setting Up Examples

```bash
# Create example repository
mkdir git-tags-demo
cd git-tags-demo
git init

# Create initial project structure
cat > package.json << EOF
{
  "name": "awesome-calculator",
  "version": "0.1.0",
  "description": "An awesome calculator library",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}
EOF

cat > index.js << EOF
class Calculator {
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
}

module.exports = Calculator;
EOF

cat > README.md << EOF
# Awesome Calculator

A simple calculator library for Node.js.

## Installation

\`\`\`bash
npm install awesome-calculator
\`\`\`

## Usage

\`\`\`javascript
const Calculator = require('awesome-calculator');
const calc = new Calculator();
console.log(calc.add(2, 3)); // 5
\`\`\`
EOF

git add .
git commit -m "Initial project setup"

# Add basic functionality
cat >> index.js << EOF

    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        return a / b;
    }
EOF

# Update version
sed -i 's/"version": "0.1.0"/"version": "1.0.0"/' package.json

git add .
git commit -m "Add multiply and divide functions - ready for v1.0.0"

# View commit history
git log --oneline
```

Output:
```
b2c3d4e (HEAD -> main) Add multiply and divide functions - ready for v1.0.0
a1b2c3d Initial project setup
```

## Creating Tags

### Lightweight Tags

```bash
# Create lightweight tag for current commit
git tag v1.0.0

# Create lightweight tag for specific commit
git tag v0.1.0 a1b2c3d

# View tags
git tag
```

Output:
```
v0.1.0
v1.0.0
```

### Annotated Tags

```bash
# Create annotated tag with message
git tag -a v1.0.0-annotated -m "Release version 1.0.0

Features:
- Basic arithmetic operations
- Error handling for division by zero
- Clean API design"

# Create annotated tag with editor
git tag -a v1.0.1 -m "Patch release v1.0.1"

# View tag information
git show v1.0.0-annotated
```

Output:
```
tag v1.0.0-annotated
Tagger: Your Name <your.email@example.com>
Date:   [timestamp]

Release version 1.0.0

Features:
- Basic arithmetic operations
- Error handling for division by zero
- Clean API design

commit b2c3d4e...
Author: Your Name <your.email@example.com>
Date:   [timestamp]

    Add multiply and divide functions - ready for v1.0.0

[commit details...]
```

### Signed Tags

```bash
# Create GPG-signed tag (requires GPG setup)
git tag -s v1.0.0-signed -m "Signed release v1.0.0"

# Verify signed tag
git tag -v v1.0.0-signed

# Create signed tag with specific key
git tag -u key-id v1.0.0-signed -m "Signed with specific key"
```

## Working with Tags

### Listing Tags

```bash
# List all tags
git tag

# List tags with pattern
git tag -l "v1.*"
git tag -l "*beta*"

# List tags with commit info
git tag -n
git tag -n3  # Show 3 lines of annotation

# List tags sorted by version
git tag --sort=version:refname
git tag --sort=-version:refname  # Reverse order
```

### Viewing Tag Information

```bash
# Show tag details
git show v1.0.0

# Show only tag object (for annotated tags)
git cat-file -p v1.0.0-annotated

# Show commit that tag points to
git rev-list -n 1 v1.0.0

# Show tag type
git cat-file -t v1.0.0          # commit (lightweight)
git cat-file -t v1.0.0-annotated # tag (annotated)
```

### Checking Out Tags

```bash
# Checkout specific tag (detached HEAD)
git checkout v1.0.0

# Create branch from tag
git checkout -b hotfix/v1.0.1 v1.0.0

# View current state
git status
```

Output:
```
HEAD detached at v1.0.0
nothing to commit, working tree clean
```

## Practical Tagging Workflows

### Semantic Versioning Workflow

```bash
# Create development commits
echo "// Added input validation" >> index.js
git add index.js
git commit -m "Add input validation"

echo "// Performance improvements" >> index.js
git add index.js
git commit -m "Improve performance"

# Update version for minor release
sed -i 's/"version": "1.0.0"/"version": "1.1.0"/' package.json
git add package.json
git commit -m "Bump version to 1.1.0"

# Create release tag
git tag -a v1.1.0 -m "Release v1.1.0

New Features:
- Input validation for all operations
- Performance improvements

Breaking Changes:
- None

Bug Fixes:
- None"

# Create patch release
echo "// Bug fix" >> index.js
git add index.js
git commit -m "Fix edge case in division"

sed -i 's/"version": "1.1.0"/"version": "1.1.1"/' package.json
git add package.json
git commit -m "Bump version to 1.1.1"

git tag -a v1.1.1 -m "Release v1.1.1

Bug Fixes:
- Fix edge case in division operation"

# View version history
git tag --sort=version:refname
```

Output:
```
v0.1.0
v1.0.0
v1.0.0-annotated
v1.1.0
v1.1.1
```

### Release Branch Workflow

```bash
# Create release branch
git checkout -b release/v2.0.0

# Prepare release
cat > CHANGELOG.md << EOF
# Changelog

## [2.0.0] - $(date +%Y-%m-%d)

### Added
- New advanced mathematical operations
- Comprehensive error handling
- TypeScript definitions

### Changed
- API restructured for better usability
- Improved performance

### Breaking Changes
- Constructor now requires configuration object
- Method signatures changed for consistency
EOF

# Update version
sed -i 's/"version": "1.1.1"/"version": "2.0.0"/' package.json

git add .
git commit -m "Prepare release v2.0.0"

# Create release candidate tag
git tag -a v2.0.0-rc.1 -m "Release candidate v2.0.0-rc.1"

# After testing, create final release
git tag -a v2.0.0 -m "Release v2.0.0

Major release with breaking changes.
See CHANGELOG.md for details."

# Merge back to main
git checkout main
git merge release/v2.0.0 --no-ff
```

### Hotfix Workflow

```bash
# Create hotfix from production tag
git checkout -b hotfix/v2.0.1 v2.0.0

# Fix critical bug
echo "// Critical security fix" >> index.js
git add index.js
git commit -m "SECURITY: Fix critical vulnerability"

# Update version
sed -i 's/"version": "2.0.0"/"version": "2.0.1"/' package.json
git add package.json
git commit -m "Bump version to 2.0.1"

# Create hotfix tag
git tag -a v2.0.1 -m "Hotfix v2.0.1

Security Fix:
- Fix critical vulnerability in input processing

This is a security release. All users should upgrade immediately."

# Merge hotfix to main and develop
git checkout main
git merge hotfix/v2.0.1 --no-ff

# Clean up hotfix branch
git branch -d hotfix/v2.0.1
```

## Advanced Tag Operations

### Moving and Deleting Tags

```bash
# Delete local tag
git tag -d v1.0.0-annotated

# Recreate tag at different commit
git tag -a v1.0.0-corrected HEAD~2 -m "Corrected release tag"

# Force move existing tag
git tag -f v1.0.0 HEAD~1

# Delete remote tag
git push origin --delete v1.0.0-annotated

# Push corrected tag
git push origin v1.0.0-corrected
```

### Tag Ranges and Comparisons

```bash
# Show commits between tags
git log v1.0.0..v1.1.0 --oneline

# Show changes between tags
git diff v1.0.0..v1.1.0

# Show files changed between tags
git diff --name-only v1.0.0..v1.1.0

# Show commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Count commits since tag
git rev-list --count v1.0.0..HEAD
```

### Finding Tags

```bash
# Find tag containing specific commit
git tag --contains commit-hash

# Find most recent tag
git describe --tags
git describe --tags --abbrev=0  # Just tag name

# Find tag with pattern
git tag -l "v1.*" --sort=-version:refname | head -1

# Find tags by date
git for-each-ref --format='%(refname:short) %(taggerdate)' refs/tags
```

## Working with Remote Tags

### Pushing Tags

```bash
# Push specific tag
git push origin v1.0.0

# Push all tags
git push origin --tags

# Push only annotated tags
git push origin --follow-tags

# Push tags and commits together
git push origin main --tags
```

### Fetching Tags

```bash
# Fetch all tags
git fetch origin --tags

# Fetch specific tag
git fetch origin refs/tags/v1.0.0:refs/tags/v1.0.0

# Fetch and prune deleted tags
git fetch origin --prune --prune-tags
```

### Syncing Tags

```bash
# Script to sync tags with remote
cat > sync-tags.sh << 'EOF'
#!/bin/bash

echo "Syncing tags with remote..."

# Fetch all remote tags
git fetch origin --tags

# Remove local tags that don't exist on remote
git tag -l | while read tag; do
    if ! git ls-remote --tags origin | grep -q "refs/tags/$tag"; then
        echo "Removing local tag: $tag"
        git tag -d "$tag"
    fi
done

# Fetch any new tags
git fetch origin --prune --prune-tags

echo "Tag sync complete"
EOF

chmod +x sync-tags.sh
```

## Tag Automation

### Automated Tagging Script

```bash
# Create automated release script
cat > create-release.sh << 'EOF'
#!/bin/bash

set -e

# Configuration
VERSION_FILE="package.json"
CHANGELOG_FILE="CHANGELOG.md"

# Functions
get_current_version() {
    grep '"version":' "$VERSION_FILE" | sed 's/.*"version": "\([^"]*\)".*/\1/'
}

update_version() {
    local new_version=$1
    sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$VERSION_FILE"
}

update_changelog() {
    local version=$1
    local date=$(date +%Y-%m-%d)
    
    # Create temporary file with new entry
    cat > temp_changelog << EOF
# Changelog

## [$version] - $date

### Added
- 

### Changed
- 

### Fixed
- 

EOF
    
    # Append existing changelog (skip first line)
    tail -n +2 "$CHANGELOG_FILE" >> temp_changelog
    mv temp_changelog "$CHANGELOG_FILE"
}

create_release() {
    local version=$1
    local message="$2"
    
    echo "Creating release $version"
    
    # Update version
    update_version "$version"
    
    # Update changelog
    update_changelog "$version"
    
    # Commit changes
    git add "$VERSION_FILE" "$CHANGELOG_FILE"
    git commit -m "Prepare release $version"
    
    # Create annotated tag
    git tag -a "v$version" -m "$message"
    
    echo "Release $version created successfully"
    echo "Don't forget to push: git push origin main --tags"
}

# Main script
if [ $# -lt 2 ]; then
    echo "Usage: $0 <version> <release_message>"
    echo "Example: $0 1.2.0 'Release with new features'"
    exit 1
fi

VERSION=$1
MESSAGE="$2"

# Validate version format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "Error: Version must be in format X.Y.Z"
    exit 1
fi

# Check if tag already exists
if git tag -l | grep -q "^v$VERSION$"; then
    echo "Error: Tag v$VERSION already exists"
    exit 1
fi

# Create release
create_release "$VERSION" "$MESSAGE"
EOF

chmod +x create-release.sh

# Usage example
# ./create-release.sh 1.2.0 "Release with new features and bug fixes"
```

### Git Hooks for Tagging

```bash
# Create pre-push hook to validate tags
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# Validate tag format before pushing
while read local_ref local_sha remote_ref remote_sha; do
    if [[ "$remote_ref" == refs/tags/* ]]; then
        tag_name=$(basename "$remote_ref")
        
        # Check semantic versioning format
        if ! echo "$tag_name" | grep -qE '^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$'; then
            echo "Error: Tag '$tag_name' does not follow semantic versioning"
            echo "Expected format: vX.Y.Z or vX.Y.Z-suffix"
            exit 1
        fi
        
        # Check if tag is annotated
        if [ "$(git cat-file -t "$tag_name")" != "tag" ]; then
            echo "Warning: Tag '$tag_name' is lightweight. Consider using annotated tags for releases."
        fi
        
        echo "✓ Tag '$tag_name' validation passed"
    fi
done
EOF

chmod +x .git/hooks/pre-push
```

## Tag Best Practices

### 1. Use Semantic Versioning

```bash
# Follow semantic versioning (semver.org)
# MAJOR.MINOR.PATCH

# Examples:
v1.0.0      # Initial release
v1.0.1      # Patch release (bug fixes)
v1.1.0      # Minor release (new features, backward compatible)
v2.0.0      # Major release (breaking changes)

# Pre-release versions
v1.0.0-alpha.1
v1.0.0-beta.2
v1.0.0-rc.1
```

### 2. Use Annotated Tags for Releases

```bash
# Always use annotated tags for releases
git tag -a v1.0.0 -m "Release v1.0.0

Features:
- Feature A
- Feature B

Bug Fixes:
- Fix issue #123
- Fix issue #456"

# Include release notes
git tag -a v1.1.0 -F release-notes.txt
```

### 3. Consistent Tagging Strategy

```bash
# Establish team conventions
# - Tag format: v{major}.{minor}.{patch}
# - Tag message format: standardized template
# - Who can create tags: maintainers only
# - When to tag: after successful CI/CD

# Example tag message template
cat > tag-template.txt << EOF
Release v{VERSION}

## New Features
- 

## Bug Fixes
- 

## Breaking Changes
- 

## Migration Guide
- 
EOF
```

### 4. Protect Important Tags

```bash
# Use signed tags for security
git tag -s v1.0.0 -m "Signed release v1.0.0"

# Backup important tags
git tag > important-tags-backup.txt

# Document tag policies
cat > TAG_POLICY.md << EOF
# Tag Policy

## Tag Creation
- Only maintainers can create release tags
- All release tags must be annotated
- Tag names must follow semantic versioning
- Tags must include comprehensive release notes

## Tag Protection
- Release tags should never be deleted
- If tag needs correction, create new tag
- Use signed tags for security-critical releases
EOF
```

## Troubleshooting Tags

### Common Issues

#### 1. Tag Already Exists

```bash
# Error: tag 'v1.0.0' already exists
# Solution: Use different name or force update
git tag -f v1.0.0 HEAD

# Or delete and recreate
git tag -d v1.0.0
git tag -a v1.0.0 -m "Corrected release"
```

#### 2. Tag Points to Wrong Commit

```bash
# Move tag to correct commit
git tag -f v1.0.0 correct-commit-hash

# If already pushed, delete remote and push corrected
git push origin --delete v1.0.0
git push origin v1.0.0
```

#### 3. Missing Tags After Clone

```bash
# Fetch all tags
git fetch origin --tags

# Or fetch specific tag
git fetch origin refs/tags/v1.0.0:refs/tags/v1.0.0
```

#### 4. Tag Conflicts

```bash
# When local and remote tags differ
git fetch origin
git tag -l | while read tag; do
    local_commit=$(git rev-list -n 1 "$tag")
    remote_commit=$(git rev-list -n 1 "origin/$tag" 2>/dev/null || echo "missing")
    
    if [ "$local_commit" != "$remote_commit" ]; then
        echo "Tag conflict: $tag"
        echo "  Local:  $local_commit"
        echo "  Remote: $remote_commit"
    fi
done
```

## Quick Reference

```bash
# Create tags
git tag <tagname>                    # Lightweight tag
git tag -a <tagname> -m "message"    # Annotated tag
git tag -s <tagname> -m "message"    # Signed tag
git tag <tagname> <commit>           # Tag specific commit

# List tags
git tag                              # List all tags
git tag -l "pattern"                 # List with pattern
git tag -n                           # List with messages
git tag --sort=version:refname       # Sort by version

# View tags
git show <tagname>                   # Show tag details
git describe --tags                  # Most recent tag
git tag --contains <commit>          # Tags containing commit

# Delete tags
git tag -d <tagname>                 # Delete local tag
git push origin --delete <tagname>   # Delete remote tag

# Push tags
git push origin <tagname>            # Push specific tag
git push origin --tags               # Push all tags
git push origin --follow-tags        # Push annotated tags

# Checkout tags
git checkout <tagname>               # Checkout tag (detached HEAD)
git checkout -b <branch> <tagname>   # Create branch from tag
```

---

**Previous:** [Git Bisect Bug Hunting](15-git-bisect-bug-hunting.md)  
**Next:** [Git Hooks](17-git-hooks.md)