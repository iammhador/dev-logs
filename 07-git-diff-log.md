# Git Diff and Log

Git diff and log are essential tools for understanding changes in your repository. They help you see what changed, when it changed, and who changed it.

## git diff - Viewing Changes

### Basic Diff Operations

```bash
# Show unstaged changes (working directory vs staging area)
git diff

# Show staged changes (staging area vs last commit)
git diff --staged
# or
git diff --cached

# Show all changes (working directory vs last commit)
git diff HEAD
```

### Practical Example: Portfolio Updates

Let's create some changes to demonstrate diff:

```bash
# Make changes to existing files
cd portfolio-website

# Modify index.html
cat > index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <a href="index.html">Home</a>
            <a href="contact.html">Contact</a>
            <a href="gallery.html">Gallery</a>
        </nav>
    </header>
    <main>
        <h1>Welcome to my portfolio</h1>
        <p>I'm a web developer passionate about creating amazing user experiences.</p>
        <section id="skills">
            <h2>Skills</h2>
            <ul>
                <li>HTML5 & CSS3</li>
                <li>JavaScript (ES6+)</li>
                <li>React & Node.js</li>
            </ul>
        </section>
    </main>
    <footer>© 2024 John Doe</footer>
    <script src="script.js"></script>
</body>
</html>
EOF

# Add some changes to CSS
cat >> style.css << EOF

/* Header Styles */
header {
    background-color: #333;
    padding: 1rem 0;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

nav a:hover {
    background-color: #555;
}

/* Skills Section */
#skills {
    margin: 2rem 0;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
}

#skills ul {
    list-style-type: none;
    padding: 0;
}

#skills li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #dee2e6;
}

#skills li:last-child {
    border-bottom: none;
}
EOF

# View unstaged changes
git diff
```

### Understanding Diff Output

```diff
diff --git a/index.html b/index.html
index 1234567..abcdefg 100644
--- a/index.html
+++ b/index.html
@@ -1,8 +1,25 @@
 <!DOCTYPE html>
-<html>
+<html lang="en">
 <head>
+    <meta charset="UTF-8">
+    <meta name="viewport" content="width=device-width, initial-scale=1.0">
-    <title>Portfolio</title>
+    <title>John Doe - Portfolio</title>
     <link rel="stylesheet" href="style.css">
 </head>
 <body>
+    <header>
+        <nav>
+            <a href="index.html">Home</a>
+            <a href="contact.html">Contact</a>
+            <a href="gallery.html">Gallery</a>
+        </nav>
+    </header>
```

**Diff symbols:**
- `---` and `+++`: Old and new file versions
- `@@`: Hunk header showing line numbers
- `-`: Lines removed (red in terminal)
- `+`: Lines added (green in terminal)
- ` `: Unchanged lines (context)

### Diff Options and Formats

```bash
# Word-level diff (more granular)
git diff --word-diff

# Character-level diff
git diff --word-diff=color --word-diff-regex=.

# Ignore whitespace changes
git diff -w
# or
git diff --ignore-all-space

# Show only file names that changed
git diff --name-only

# Show file names with status
git diff --name-status

# Show statistics
git diff --stat

# Compact summary
git diff --shortstat
```

### Comparing Specific Commits

```bash
# Stage some changes first
git add index.html
git commit -m "Improve HTML structure and add navigation"

# Add more changes
echo "/* Additional mobile styles */" >> style.css
git add style.css
git commit -m "Add header and skills styling"

# Compare commits
git diff HEAD~2 HEAD~1    # Compare two commits ago with one commit ago
git diff HEAD~1 HEAD      # Compare last commit with current
git diff a1b2c3d..e4f5g6h # Compare specific commits

# Compare branches
git diff main..feature/branch
git diff main...feature/branch  # Three dots: common ancestor to branch tip
```

### Diff for Specific Files

```bash
# Diff specific file
git diff index.html
git diff HEAD~1 index.html

# Diff multiple files
git diff index.html style.css

# Diff files in directory
git diff src/

# Diff with path filtering
git diff '*.css'
git diff '*.js'
```

## git log - Viewing History

### Basic Log Operations

```bash
# Basic log
git log

# One line per commit
git log --oneline

# Show last N commits
git log -5
git log -n 3

# Show commits since date
git log --since="2024-01-01"
git log --since="2 weeks ago"
git log --since="yesterday"

# Show commits until date
git log --until="2024-01-31"
git log --before="1 week ago"
```

### Pretty Formats

```bash
# Built-in formats
git log --pretty=oneline
git log --pretty=short
git log --pretty=medium
git log --pretty=full
git log --pretty=fuller

# Custom format
git log --pretty=format:"%h - %an, %ar : %s"
git log --pretty=format:"%C(yellow)%h%C(reset) - %C(blue)%an%C(reset), %C(green)%ar%C(reset) : %s"
```

### Custom Format Placeholders

| Placeholder | Description |
|-------------|-------------|
| `%H` | Full commit hash |
| `%h` | Abbreviated commit hash |
| `%an` | Author name |
| `%ae` | Author email |
| `%ad` | Author date |
| `%ar` | Author date, relative |
| `%cn` | Committer name |
| `%cd` | Committer date |
| `%cr` | Committer date, relative |
| `%s` | Subject (commit message) |
| `%b` | Body (commit message) |
| `%d` | Ref names (branches, tags) |

### Advanced Log Examples

```bash
# Beautiful one-line format
git log --pretty=format:"%C(auto)%h%d %s %C(black)%C(bold)%cr" --graph

# Detailed format with colors
git log --pretty=format:"%C(yellow)%h %C(red)%d %C(reset)%s %C(green)(%cr) %C(blue)<%an>%C(reset)" --graph

# Show file changes
git log --stat
git log --name-only
git log --name-status

# Show actual changes
git log -p
git log --patch

# Limit patch output
git log -p -2  # Show patches for last 2 commits
```

### Filtering Commits

#### By Author

```bash
# Commits by specific author
git log --author="John Doe"
git log --author="john@example.com"

# Multiple authors (regex)
git log --author="John\|Jane"

# Exclude author
git log --author="^(?!John Doe).*$" --perl-regexp
```

#### By Message

```bash
# Commits containing specific text
git log --grep="fix"
git log --grep="feature"

# Case insensitive
git log --grep="FIX" -i

# Multiple patterns
git log --grep="fix" --grep="bug" --all-match

# Invert match
git log --grep="WIP" --invert-grep
```

#### By File Changes

```bash
# Commits that changed specific file
git log -- index.html
git log --follow -- index.html  # Follow renames

# Commits that changed files matching pattern
git log -- '*.css'
git log -- src/

# Commits that added or removed specific text
git log -S "function validateForm"  # Pickaxe search
git log -G "function.*validate"     # Regex search
```

#### By Date Range

```bash
# Specific date range
git log --since="2024-01-01" --until="2024-01-31"

# Relative dates
git log --since="2 weeks ago"
git log --since="yesterday" --until="today"

# Specific format
git log --since="Jan 1 2024" --until="Jan 31 2024"
```

### Graphical Log

```bash
# Simple graph
git log --graph --oneline

# Detailed graph
git log --graph --pretty=format:"%h -%d %s (%cr) <%an>" --abbrev-commit

# All branches
git log --graph --oneline --all

# Specific branches
git log --graph --oneline main feature/branch
```

Example output:
```
* b2c3d4e (HEAD -> feature/portfolio) Add header and skills styling
* a1b2c3d Improve HTML structure and add navigation
| * f9e8d7c (main) Fix contact form validation
|/  
* 5h4i3j2 Add contact form feature
* 9k8l7m6 Initial commit
```

### Practical Log Workflows

#### Daily Standup Report

```bash
# What did I work on yesterday?
git log --author="$(git config user.name)" --since="yesterday" --pretty=format:"%h %s"

# What did the team work on this week?
git log --since="1 week ago" --pretty=format:"%h - %an: %s" --graph
```

#### Release Notes

```bash
# Changes since last tag
git log v1.0.0..HEAD --pretty=format:"- %s (%h)"

# Features and fixes since last release
git log v1.0.0..HEAD --grep="feat:" --grep="fix:" --pretty=format:"- %s"
```

#### Code Review Preparation

```bash
# Changes in feature branch
git log main..feature/branch --oneline

# Detailed changes for review
git log main..feature/branch --stat

# All changes with patches
git log main..feature/branch -p
```

## Advanced Diff and Log Techniques

### Diff Tools Integration

```bash
# Configure external diff tool
git config --global diff.tool vimdiff
# or
git config --global diff.tool vscode

# Use external tool
git difftool
git difftool HEAD~1

# Configure VS Code as diff tool
git config --global diff.tool vscode
git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'
```

### Log Aliases

Create useful aliases for common log commands:

```bash
# Add to ~/.gitconfig or use git config
git config --global alias.lg "log --graph --pretty=format:'%C(yellow)%h%C(reset) -%C(red)%d%C(reset) %s %C(green)(%cr) %C(blue)<%an>%C(reset)' --abbrev-commit"

git config --global alias.lga "log --graph --pretty=format:'%C(yellow)%h%C(reset) -%C(red)%d%C(reset) %s %C(green)(%cr) %C(blue)<%an>%C(reset)' --abbrev-commit --all"

git config --global alias.ls "log --pretty=format:'%C(yellow)%h %C(blue)%ad%C(reset) %C(white)%s%C(reset) %C(green)[%an]%C(reset)' --decorate --date=short"

# Usage
git lg
git lga
git ls
```

### Searching Through History

```bash
# Find when a line was added
git log -S "specific code line" --source --all

# Find when a function was modified
git log -G "function myFunction" --patch

# Find commits that touch specific lines
git log -L 10,20:filename.js
git log -L :functionName:filename.js
```

### Performance and Large Repositories

```bash
# Limit log output for performance
git log --oneline -100  # Last 100 commits

# Skip merge commits
git log --no-merges

# Only merge commits
git log --merges

# Simplify history
git log --simplify-by-decoration
```

## Practical Examples

### Example 1: Bug Investigation

```bash
# Find when a bug was introduced
# Look for commits that changed the problematic file
git log --oneline -- problematic-file.js

# Check specific function changes
git log -G "buggyFunction" --patch -- problematic-file.js

# See what changed in suspicious commit
git show a1b2c3d

# Compare with previous version
git diff a1b2c3d~1 a1b2c3d -- problematic-file.js
```

### Example 2: Code Review

```bash
# Review all changes in feature branch
git log main..feature/new-feature --stat

# See detailed changes
git diff main...feature/new-feature

# Check individual commits
git log main..feature/new-feature --oneline
git show commit-hash
```

### Example 3: Release Preparation

```bash
# Generate changelog
git log v1.0.0..HEAD --pretty=format:"- %s" --reverse

# Check what files changed
git diff --name-only v1.0.0..HEAD

# Get statistics
git diff --stat v1.0.0..HEAD
```

## Troubleshooting

### Large Diff Output

```bash
# Limit context lines
git diff -U1  # 1 line of context instead of 3

# Show only changed files
git diff --name-only

# Use pager
git diff | less
```

### Log Performance Issues

```bash
# Limit history depth
git log --max-count=50

# Skip expensive operations
git log --no-patch

# Use shallow clone for large repos
git clone --depth 50 <url>
```

### Finding Lost Changes

```bash
# Search in all commits (including deleted)
git log --all --full-history -- deleted-file.txt

# Search in reflog
git reflog | grep "search term"

# Find dangling commits
git fsck --lost-found
```

## Best Practices

1. **Use Descriptive Commit Messages**: Makes log more useful
2. **Regular Small Commits**: Easier to track changes
3. **Use Aliases**: Create shortcuts for common log formats
4. **Learn Format Strings**: Customize output for your needs
5. **Combine with Other Tools**: Use with grep, less, etc.

## Quick Reference

```bash
# Diff commands
git diff                      # Working directory vs staging
git diff --staged             # Staging vs last commit
git diff HEAD                 # Working directory vs last commit
git diff commit1..commit2     # Between commits
git diff --stat               # Show statistics

# Log commands
git log                       # Basic log
git log --oneline             # Compact format
git log --graph               # Show branch graph
git log --stat                # Show file changes
git log -p                    # Show patches
git log --author="name"       # Filter by author
git log --grep="text"         # Filter by message
git log --since="date"        # Filter by date
git log -- filename           # Filter by file

# Useful aliases
git config --global alias.lg "log --graph --oneline --decorate"
git config --global alias.lga "log --graph --oneline --decorate --all"
```

---

**Previous:** [Git Stash](06-git-stash.md)  
**Next:** [Merge Conflicts](08-merge-conflicts.md)