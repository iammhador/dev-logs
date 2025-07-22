# 🐧 Linux Basics: Foundation Skills

> **Master the terminal, file system navigation, and essential commands**

## 📖 What You'll Learn

Linux is the backbone of the internet, powering everything from web servers to smartphones. Understanding Linux fundamentals is essential for any technical professional. In this chapter, you'll master:

- Terminal navigation and basic commands
- Linux file system structure
- File and directory operations
- Basic permissions and ownership
- Essential shortcuts and productivity tips

## 🌍 Why This Matters

**Real-world applications:**
- **Web Development**: Deploy applications on Linux servers
- **DevOps**: Automate infrastructure and deployments
- **System Administration**: Manage servers and services
- **Cybersecurity**: Analyze systems and investigate incidents
- **Data Science**: Process large datasets on Linux clusters

## 💻 Getting Started: The Terminal

### Opening the Terminal

**Ubuntu/Debian:**
```bash
# Keyboard shortcut
Ctrl + Alt + T

# Or search for "Terminal" in applications
```

**Your First Command:**
```bash
$ whoami
username

$ pwd
/home/username
```

### Understanding the Prompt

```bash
username@hostname:~$ 
#   ^        ^     ^  ^
#   |        |     |  |
#   user   computer |  command prompt
#                   |
#                current directory (~ = home)
```

## 🗂️ Linux File System Structure

### The Root Directory (`/`)

```bash
$ ls /
bin   dev  home  lib64  mnt  proc  run   srv  tmp  var
boot  etc  lib   media  opt  root  sbin  sys  usr
```

### Key Directories Explained

| Directory | Purpose | Example Contents |
|-----------|---------|------------------|
| `/home` | User home directories | `/home/john`, `/home/mary` |
| `/etc` | System configuration files | `/etc/passwd`, `/etc/hosts` |
| `/var` | Variable data (logs, databases) | `/var/log`, `/var/www` |
| `/usr` | User programs and libraries | `/usr/bin`, `/usr/local` |
| `/tmp` | Temporary files | Session files, cache |
| `/bin` | Essential system binaries | `ls`, `cp`, `mv` |
| `/sbin` | System administration binaries | `iptables`, `mount` |

### Visualizing the Structure

```bash
$ tree -L 2 /
/
├── bin -> usr/bin
├── boot
│   ├── grub
│   └── vmlinuz
├── dev
│   ├── sda1
│   └── tty1
├── etc
│   ├── passwd
│   └── hosts
├── home
│   ├── john
│   └── mary
└── var
    ├── log
    └── www
```

## 🧭 Navigation Commands

### Basic Navigation

```bash
# Print working directory
$ pwd
/home/username

# List directory contents
$ ls
Documents  Downloads  Pictures  Videos

# List with details
$ ls -l
total 16
drwxr-xr-x 2 user user 4096 Dec 15 10:30 Documents
drwxr-xr-x 2 user user 4096 Dec 15 10:30 Downloads
drwxr-xr-x 2 user user 4096 Dec 15 10:30 Pictures
drwxr-xr-x 2 user user 4096 Dec 15 10:30 Videos

# List including hidden files
$ ls -la
total 24
drwxr-xr-x 3 user user 4096 Dec 15 10:30 .
drwxr-xr-x 3 root root 4096 Dec 15 10:00 ..
-rw-r--r-- 1 user user  220 Dec 15 10:00 .bash_logout
-rw-r--r-- 1 user user 3771 Dec 15 10:00 .bashrc
drwxr-xr-x 2 user user 4096 Dec 15 10:30 Documents
```

### Change Directory

```bash
# Go to home directory
$ cd
$ cd ~
$ cd /home/username

# Go to specific directory
$ cd /var/log
$ pwd
/var/log

# Go back one level
$ cd ..
$ pwd
/var

# Go back to previous directory
$ cd -
/var/log

# Relative vs Absolute paths
$ cd Documents          # Relative path
$ cd /home/user/Documents  # Absolute path
```

### Path Shortcuts

| Symbol | Meaning | Example |
|--------|---------|----------|
| `~` | Home directory | `cd ~/Documents` |
| `.` | Current directory | `./script.sh` |
| `..` | Parent directory | `cd ../..` |
| `-` | Previous directory | `cd -` |
| `/` | Root directory | `cd /` |

## 📁 File and Directory Operations

### Creating Files and Directories

```bash
# Create empty file
$ touch newfile.txt
$ ls -l newfile.txt
-rw-r--r-- 1 user user 0 Dec 15 11:00 newfile.txt

# Create multiple files
$ touch file1.txt file2.txt file3.txt

# Create directory
$ mkdir projects
$ ls -ld projects
drwxr-xr-x 2 user user 4096 Dec 15 11:01 projects

# Create nested directories
$ mkdir -p projects/web/frontend
$ tree projects
projects
└── web
    └── frontend
```

### Copying Files and Directories

```bash
# Copy file
$ cp file1.txt file1_backup.txt

# Copy file to directory
$ cp file1.txt projects/

# Copy directory recursively
$ cp -r projects projects_backup

# Copy with verbose output
$ cp -v file1.txt file1_copy.txt
'file1.txt' -> 'file1_copy.txt'

# Copy preserving attributes
$ cp -p file1.txt file1_preserve.txt
```

### Moving and Renaming

```bash
# Rename file
$ mv file1.txt renamed_file.txt

# Move file to directory
$ mv renamed_file.txt projects/

# Move and rename simultaneously
$ mv file2.txt projects/project_file.txt

# Move directory
$ mv projects_backup archive/
```

### Removing Files and Directories

```bash
# Remove file
$ rm file3.txt

# Remove multiple files
$ rm *.txt

# Remove directory (empty)
$ rmdir empty_directory

# Remove directory and contents
$ rm -r projects_backup

# Remove with confirmation
$ rm -i important_file.txt
rm: remove regular file 'important_file.txt'? y

# Force remove (be careful!)
$ rm -rf dangerous_directory
```

## 🔍 Viewing File Contents

### Basic File Viewing

```bash
# Display entire file
$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...

# Display with line numbers
$ cat -n /etc/passwd
     1	root:x:0:0:root:/root:/bin/bash
     2	daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
...

# View first 10 lines
$ head /var/log/syslog
Dec 15 10:00:01 hostname systemd[1]: Started Daily apt download activities.
Dec 15 10:00:01 hostname systemd[1]: Starting Daily apt upgrade and clean activities...
...

# View last 10 lines
$ tail /var/log/syslog
Dec 15 11:45:01 hostname CRON[1234]: (root) CMD (command -v debian-sa1 > /dev/null && debian-sa1 1 1)
...

# Follow file changes (useful for logs)
$ tail -f /var/log/syslog
# Press Ctrl+C to stop
```

### Paging Through Files

```bash
# View file page by page
$ less /var/log/syslog
# Navigation:
# Space: next page
# b: previous page
# /search_term: search
# q: quit

# Alternative pager
$ more /var/log/syslog
```

## 🔧 Essential Commands Reference

### File Information

```bash
# File type and permissions
$ file /bin/ls
/bin/ls: ELF 64-bit LSB executable, x86-64

# Disk usage of files/directories
$ du -h projects/
4.0K	projects/web/frontend
8.0K	projects/web
12K	projects/

# File size
$ ls -lh file1.txt
-rw-r--r-- 1 user user 1.2K Dec 15 11:00 file1.txt

# Count lines, words, characters
$ wc /etc/passwd
  45   65 2419 /etc/passwd
# lines words chars filename
```

### System Information

```bash
# Current user
$ whoami
username

# User ID information
$ id
uid=1000(username) gid=1000(username) groups=1000(username),4(adm),24(cdrom),27(sudo)

# Current date and time
$ date
Fri Dec 15 11:30:45 UTC 2023

# System uptime
$ uptime
 11:30:45 up  2:15,  1 user,  load average: 0.08, 0.03, 0.01

# Disk space usage
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G  5.5G   14G  30% /
/dev/sda2       100G   45G   50G  48% /home
```

## ⚠️ Common Pitfalls and Tips

### 1. Case Sensitivity
```bash
# Linux is case-sensitive!
$ ls Documents  # ✅ Correct
$ ls documents  # ❌ Error if directory is "Documents"
ls: cannot access 'documents': No such file or directory
```

### 2. Spaces in Filenames
```bash
# Use quotes or escape spaces
$ touch "my file.txt"        # ✅ Correct
$ touch my\ file.txt          # ✅ Correct
$ touch my file.txt          # ❌ Creates two files: "my" and "file.txt"
```

### 3. Hidden Files
```bash
# Files starting with . are hidden
$ ls              # Won't show .bashrc
$ ls -a           # Shows all files including hidden ones
```

### 4. Tab Completion
```bash
# Use Tab to auto-complete
$ cd Doc<Tab>     # Completes to "Documents"
$ ls /etc/pas<Tab> # Completes to "/etc/passwd"
```

## 🎯 Practical Scenario: Setting Up a Project

Let's create a typical project structure:

```bash
# 1. Create project directory
$ mkdir -p ~/projects/my-website
$ cd ~/projects/my-website

# 2. Create project structure
$ mkdir -p {src,docs,tests,config}
$ touch README.md
$ touch src/{index.html,style.css,script.js}
$ touch docs/setup.md
$ touch config/settings.conf

# 3. Verify structure
$ tree
.
├── README.md
├── config
│   └── settings.conf
├── docs
│   └── setup.md
├── src
│   ├── index.html
│   ├── script.js
│   └── style.css
└── tests

# 4. Add some content
$ echo "# My Website Project" > README.md
$ echo "<!DOCTYPE html><html><head><title>My Site</title></head><body><h1>Hello World!</h1></body></html>" > src/index.html

# 5. Check our work
$ cat README.md
# My Website Project

$ cat src/index.html
<!DOCTYPE html><html><head><title>My Site</title></head><body><h1>Hello World!</h1></body></html>
```

## 🔧 Productivity Tips

### Command History
```bash
# View command history
$ history
  1  ls
  2  cd projects
  3  mkdir my-website
  ...

# Repeat last command
$ !!

# Repeat command by number
$ !3

# Search history
$ Ctrl+R
(reverse-i-search)`cd': cd projects
```

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current command |
| `Ctrl+D` | Exit terminal/logout |
| `Ctrl+L` | Clear screen |
| `Ctrl+A` | Move to beginning of line |
| `Ctrl+E` | Move to end of line |
| `Ctrl+U` | Delete from cursor to beginning |
| `Ctrl+K` | Delete from cursor to end |
| `Tab` | Auto-complete |
| `↑/↓` | Navigate command history |

### Aliases for Efficiency
```bash
# Add to ~/.bashrc for permanent aliases
$ echo 'alias ll="ls -la"' >> ~/.bashrc
$ echo 'alias la="ls -la"' >> ~/.bashrc
$ echo 'alias ..="cd .."' >> ~/.bashrc
$ source ~/.bashrc

# Now you can use:
$ ll        # Instead of ls -la
$ ..        # Instead of cd ..
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What command shows your current directory?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   pwd
   ```
   </details>

2. **How do you create a directory called "test" and navigate into it in one line?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   mkdir test && cd test
   ```
   </details>

3. **What's the difference between `rm file.txt` and `rm -r directory/`?**
   <details>
   <summary>Answer</summary>
   
   - `rm file.txt` removes a single file
   - `rm -r directory/` removes a directory and all its contents recursively
   </details>

4. **How do you view the last 20 lines of a file called "logfile.txt"?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   tail -n 20 logfile.txt
   # or
   tail -20 logfile.txt
   ```
   </details>

### Hands-On Challenges

**Challenge 1: File System Explorer**
```bash
# Navigate to root directory and explore
# Find the largest directory in /var
# List all files in /etc that contain "conf" in their name
```

**Challenge 2: Project Setup**
```bash
# Create a project structure for a blog:
# blog/
# ├── posts/
# ├── images/
# ├── css/
# ├── js/
# └── index.html
```

**Challenge 3: File Operations**
```bash
# Create 5 text files with different extensions
# Copy all .txt files to a backup directory
# Rename all .log files to have today's date in the filename
```

## 🚀 Next Steps

Congratulations! You've mastered Linux basics. You can now:
- Navigate the Linux file system confidently
- Create, copy, move, and delete files and directories
- View file contents and system information
- Use essential productivity shortcuts

**Ready for the next level?** Continue to [02-file-operations.md](02-file-operations.md) to master advanced file manipulation, text processing, and powerful command-line editors.

---

> **Pro Tip**: The best way to learn Linux is by using it daily. Set up a Linux virtual machine or use WSL on Windows to practice these commands regularly. Remember: every expert was once a beginner! 🐧