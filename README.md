# Complete Git and GitHub Tutorial

A comprehensive guide to Git and GitHub, from beginner to advanced concepts. This tutorial covers everything you need to know to master version control and collaborative development.

## 📚 Table of Contents

### 🟢 Beginner Topics

1. **[Introduction to Git and GitHub](01-introduction.md)**
   - What is Git and GitHub?
   - Key concepts and terminology
   - Installation and setup
   - First-time configuration

2. **[Basic Git Commands](02-basic-commands.md)**
   - `git init`, `git add`, `git commit`
   - `git status`, `git log`
   - Working directory, staging area, and repository
   - Basic workflow examples

3. **[Remote Repositories](03-remote-repositories.md)**
   - `git remote add`, `git push`, `git pull`
   - Creating and cloning repositories on GitHub
   - Understanding origin and upstream
   - SSH vs HTTPS authentication

4. **[Gitignore and File Management](04-gitignore.md)**
   - `.gitignore` basics and patterns
   - Global gitignore configuration
   - Handling different file types
   - Common gitignore templates

5. **[Branching Basics](05-branching-basics.md)**
   - `git branch`, `git checkout`, `git switch`
   - Creating and switching branches
   - Branch naming conventions
   - Basic branch workflows

### 🟡 Intermediate Topics

6. **[Merge vs Rebase](06-merge-vs-rebase.md)**
   - Understanding merge and rebase
   - Visual diagrams and examples
   - When to use each approach
   - Fast-forward vs non-fast-forward merges

7. **[Git Stash](07-git-stash.md)**
   - Stashing changes temporarily
   - Multiple stash management
   - Stash operations and best practices
   - Advanced stashing techniques

8. **[Git Diff and Log](08-git-diff-log.md)**
   - `git diff` for comparing changes
   - `git log` with formatting and filters
   - Viewing file history and blame
   - Advanced log techniques

9. **[Pull Requests and Code Review](09-pull-requests-code-review.md)**
   - Creating and managing pull requests
   - Code review workflow and best practices
   - PR templates and automation
   - Merge strategies

10. **[Forking and Upstream](10-forking-upstream.md)**
    - Forking repositories
    - Managing upstream remotes
    - Contributing to open source
    - Keeping forks in sync

### 🔴 Advanced Topics

11. **[Advanced Git Rebase](11-advanced-git-rebase.md)**
    - Interactive rebase (`git rebase -i`)
    - Squashing and fixup commits
    - Reordering and editing commits
    - Complex rebase scenarios

12. **[Git Cherry-pick](12-git-cherry-pick.md)**
    - Cherry-picking commits
    - Use cases and best practices
    - Handling conflicts
    - Advanced cherry-pick techniques

13. **[Git Reset Deep Dive](13-git-reset-deep-dive.md)**
    - Understanding `git reset` modes
    - `--soft`, `--mixed`, `--hard` options
    - Recovering from reset operations
    - Safe reset practices

14. **[Git Reflog and Recovery](14-git-reflog-recovery.md)**
    - Using `git reflog` for recovery
    - Finding and restoring lost commits
    - Recovery strategies and workflows
    - Reflog limitations and best practices

15. **[Git Bisect for Bug Hunting](15-git-bisect-bug-hunting.md)**
    - Binary search for bug identification
    - Automated bisect with scripts
    - Real-world debugging examples
    - Bisect best practices

16. **[Git Tags](16-git-tags.md)**
    - Lightweight vs annotated tags
    - Tagging strategies for releases
    - Managing and sharing tags
    - Semantic versioning with tags

17. **[Git Hooks](17-git-hooks.md)**
    - Client-side and server-side hooks
    - Pre-commit, pre-push hooks
    - ESLint and Prettier integration
    - Hook management and sharing

18. **[Conventional Commits](18-conventional-commits.md)**
    - Commit message standards
    - Conventional commit format
    - Automation and tooling
    - Team adoption strategies

### 🛠️ Tools and Workflows

19. **[GitHub CLI](19-github-cli.md)**
    - GitHub CLI installation and setup
    - Managing PRs, issues, and repositories
    - Automation and scripting
    - Advanced GitHub CLI features

20. **[GitHub Actions Basics](20-github-actions-basics.md)**
    - CI/CD with GitHub Actions
    - Workflow creation and management
    - Common actions and use cases
    - Best practices and optimization

21. **[Maintaining Clean Git History](21-clean-git-history.md)**
    - Principles of clean history
    - Team workflows and conventions
    - Commit organization techniques
    - Automated history management

22. **[Branching Strategies](22-branching-strategies.md)**
    - Git Flow vs GitHub Flow
    - Trunk-based development
    - Choosing the right strategy
    - Implementation guidelines

23. **[Force Push Safety](23-force-push-safety.md)**
    - Understanding `--force-with-lease`
    - Safe force push practices
    - Team coordination and policies
    - Recovery from force push issues

## 🎯 Learning Path Recommendations

### For Complete Beginners
1. Start with [Introduction](01-introduction.md)
2. Master [Basic Commands](02-basic-commands.md)
3. Learn [Remote Repositories](03-remote-repositories.md)
4. Understand [Gitignore](04-gitignore.md)
5. Practice [Branching Basics](05-branching-basics.md)

### For Developers with Basic Git Knowledge
1. Review [Merge vs Rebase](06-merge-vs-rebase.md)
2. Learn [Git Stash](07-git-stash.md)
3. Master [Pull Requests](09-pull-requests-code-review.md)
4. Understand [Forking](10-forking-upstream.md)

### For Advanced Users
1. Master [Advanced Rebase](11-advanced-git-rebase.md)
2. Learn [Git Reset](13-git-reset-deep-dive.md)
3. Understand [Recovery](14-git-reflog-recovery.md)
4. Implement [Clean History](21-clean-git-history.md)
5. Choose [Branching Strategy](22-branching-strategies.md)

### For Team Leads and DevOps
1. Study [Branching Strategies](22-branching-strategies.md)
2. Implement [GitHub Actions](20-github-actions-basics.md)
3. Establish [Clean History](21-clean-git-history.md) practices
4. Set up [Git Hooks](17-git-hooks.md)
5. Define [Force Push Safety](23-force-push-safety.md) policies

## 🚀 Quick Start Guide

### Prerequisites
- Git installed on your system
- GitHub account created
- Basic command line knowledge

### Setup Checklist
```bash
# 1. Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. Set up SSH (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub  # Add to GitHub

# 3. Create your first repository
mkdir my-project
cd my-project
git init
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"

# 4. Connect to GitHub
gh repo create my-project --public
git remote add origin git@github.com:username/my-project.git
git push -u origin main
```

## 📖 How to Use This Tutorial

### Reading Order
- **Sequential**: Follow the numbered order for comprehensive learning
- **Topic-based**: Jump to specific topics based on your needs
- **Reference**: Use as a reference guide for specific commands

### Hands-on Practice
Each tutorial includes:
- ✅ **Practical examples** you can try locally
- 🔧 **Real-world scenarios** and use cases
- 💡 **Best practices** and tips
- ⚠️ **Common pitfalls** and how to avoid them
- 🚨 **Troubleshooting** guides

### Code Examples
All code examples are:
- **Copy-pasteable** - Ready to run in your terminal
- **Commented** - Explanations for each step
- **Progressive** - Building on previous concepts
- **Tested** - Verified to work as described

## 🤝 Contributing

This tutorial is open source and welcomes contributions!

### How to Contribute
1. Fork this repository
2. Create a feature branch: `git checkout -b improve-tutorial`
3. Make your changes and test them
4. Commit with conventional format: `git commit -m "docs: improve rebase examples"`
5. Push and create a pull request

### Contribution Guidelines
- **Accuracy**: Ensure all commands and examples work
- **Clarity**: Write clear, beginner-friendly explanations
- **Completeness**: Include practical examples and use cases
- **Consistency**: Follow the established format and style
- **Testing**: Verify all examples work as described

### Areas for Contribution
- 📝 **Content improvements** - Better explanations, more examples
- 🐛 **Bug fixes** - Correct errors in commands or explanations
- 🌟 **New topics** - Additional advanced topics or tools
- 🎨 **Visual aids** - Diagrams, screenshots, or ASCII art
- 🔧 **Tooling** - Scripts, automation, or helpful utilities

## 📚 Additional Resources

### Official Documentation
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [GitHub CLI Manual](https://cli.github.com/manual/)

### Interactive Learning
- [Learn Git Branching](https://learngitbranching.js.org/) - Visual Git tutorial
- [GitHub Skills](https://skills.github.com/) - Hands-on GitHub courses
- [Git Immersion](http://gitimmersion.com/) - Step-by-step Git tutorial

### Advanced Topics
- [Pro Git Book](https://git-scm.com/book) - Comprehensive Git guide
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials) - In-depth tutorials
- [Git Workflows](https://www.atlassian.com/git/tutorials/comparing-workflows) - Workflow comparisons

### Tools and Extensions
- [GitHub Desktop](https://desktop.github.com/) - GUI for Git and GitHub
- [GitKraken](https://www.gitkraken.com/) - Advanced Git GUI
- [Sourcetree](https://www.sourcetreeapp.com/) - Free Git GUI
- [VS Code Git Extensions](https://marketplace.visualstudio.com/search?term=git&target=VSCode) - IDE integrations

## 🏷️ Version and Updates

**Current Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Git 2.30+, GitHub CLI 2.0+

### Changelog
- **v1.0.0** - Initial comprehensive tutorial release
  - 23 detailed tutorial files
  - Beginner to advanced coverage
  - Practical examples and best practices
  - Team workflow guidance

### Planned Updates
- Advanced GitHub Actions workflows
- Git LFS (Large File Storage) tutorial
- Monorepo management strategies
- Advanced conflict resolution techniques
- Git performance optimization

## 📄 License

This tutorial is released under the [MIT License](LICENSE). Feel free to use, modify, and distribute for educational purposes.

## 🙏 Acknowledgments

Special thanks to:
- The Git development team for creating an amazing tool
- GitHub for revolutionizing collaborative development
- The open source community for continuous learning and sharing
- All contributors who help improve this tutorial

---

**Happy Git-ing! 🚀**

*Start your journey with [Introduction to Git and GitHub](01-introduction.md)*