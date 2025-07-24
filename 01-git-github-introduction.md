# Git and GitHub Introduction

## What is Git?

Git is a **distributed version control system** that tracks changes in files and coordinates work among multiple people. It was created by Linus Torvalds in 2005 for Linux kernel development.

### Key Features of Git:
- **Distributed**: Every developer has a complete copy of the project history
- **Fast**: Operations are performed locally, making them lightning fast
- **Branching**: Create, merge, and delete branches easily
- **Data Integrity**: Uses SHA-1 hashing to ensure data integrity
- **Non-linear Development**: Support for parallel development workflows

## What is GitHub?

GitHub is a **cloud-based hosting service** for Git repositories. It provides a web-based interface and additional collaboration features on top of Git.

### GitHub Features:
- **Repository Hosting**: Store your Git repositories in the cloud
- **Collaboration Tools**: Issues, Pull Requests, Project boards
- **Social Coding**: Follow developers, star repositories, contribute to open source
- **CI/CD**: GitHub Actions for automated workflows
- **Documentation**: Wiki, README files, GitHub Pages

## Git vs GitHub

| Git | GitHub |
|-----|--------|
| Version control system | Hosting service for Git repositories |
| Command-line tool | Web-based platform |
| Works offline | Requires internet connection |
| Free and open source | Free tier + paid plans |
| Local repositories | Remote repositories |

## Installing Git

### Windows
```bash
# Download from https://git-scm.com/download/win
# Or use package manager
winget install Git.Git
```

### macOS
```bash
# Using Homebrew
brew install git

# Using Xcode Command Line Tools
xcode-select --install
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install git
```

## Initial Git Configuration

After installing Git, configure your identity:

```bash
# Set your name and email (required)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"  # VS Code
# or
git config --global core.editor "vim"  # Vim

# View all configurations
git config --list

# View specific configuration
git config user.name
```

## Creating Your First Repository

### Method 1: Start Locally

```bash
# Create a new directory
mkdir my-first-repo
cd my-first-repo

# Initialize Git repository
git init

# Create a README file
echo "# My First Repository" > README.md

# Check status
git status
```

### Method 2: Clone from GitHub

```bash
# Clone an existing repository
git clone https://github.com/username/repository-name.git
cd repository-name
```

## Real-World Example: Personal Portfolio Project

Let's create a personal portfolio website project to demonstrate Git basics:

```bash
# Create project directory
mkdir portfolio-website
cd portfolio-website

# Initialize Git repository
git init

# Create basic files
echo "# John Doe - Portfolio Website" > README.md
echo "<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>Welcome to my portfolio</h1></body></html>" > index.html
echo "body { font-family: Arial, sans-serif; }" > style.css

# Check what files Git sees
git status
```

Output:
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
        index.html
        style.css

nothing added to commit but untracked files present (use "git add" to track)
```

## Understanding Git Workflow

Git has three main areas:

1. **Working Directory**: Your local files
2. **Staging Area (Index)**: Files prepared for commit
3. **Repository**: Committed snapshots

```
Working Directory → Staging Area → Repository
     (git add)        (git commit)
```

## Next Steps

Now that you understand what Git and GitHub are, let's move on to the basic commands in the next chapter: **Basic Git Commands**.

## Quick Reference

```bash
# Essential first-time setup
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git init                    # Initialize repository
git status                  # Check repository status
git clone <url>            # Clone remote repository
```

---

**Next:** [Basic Git Commands](02-basic-git-commands.md)