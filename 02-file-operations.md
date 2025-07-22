# 📁 File Operations: Text Processing Mastery

> **Master file manipulation, text processing, and command-line editors**

## 📖 What You'll Learn

File operations are the heart of Linux system administration and development. This chapter covers advanced file manipulation, powerful text processing tools, and essential editors that every Linux user must know:

- Advanced file searching and filtering
- Text processing with `grep`, `sed`, and `awk`
- File comparison and merging
- Command-line editors (`nano`, `vim`)
- File permissions and ownership
- Symbolic and hard links

## 🌍 Why This Matters

**Real-world applications:**
- **Log Analysis**: Parse and analyze system logs for troubleshooting
- **Configuration Management**: Edit config files on remote servers
- **Data Processing**: Clean and transform text data
- **Automation**: Create scripts that process files automatically
- **Security**: Analyze files for suspicious content or changes

## 🔍 Advanced File Searching

### Finding Files with `find`

```bash
# Find files by name
$ find /home -name "*.txt"
/home/user/documents/notes.txt
/home/user/projects/readme.txt

# Find files by type
$ find /var/log -type f -name "*.log"
/var/log/syslog
/var/log/auth.log
/var/log/kern.log

# Find directories
$ find /etc -type d -name "*conf*"
/etc/apparmor.d
/etc/systemd/system.conf.d

# Find files by size
$ find /var -size +100M
/var/log/huge_log.log
/var/cache/large_file.cache

# Find files modified in last 7 days
$ find /home -mtime -7

# Find files by permissions
$ find /usr/bin -perm 755
```

### Advanced `find` Examples

```bash
# Find and execute command on results
$ find /tmp -name "*.tmp" -exec rm {} \;

# Find large files and show their sizes
$ find /var -size +50M -exec ls -lh {} \;

# Find files owned by specific user
$ find /home -user john -type f

# Find files with specific permissions
$ find /etc -perm 644 -type f

# Find empty files
$ find /tmp -empty -type f

# Find files modified more than 30 days ago
$ find /var/log -mtime +30 -name "*.log"
```

### Using `locate` for Fast Searches

```bash
# Update locate database (run as root)
$ sudo updatedb

# Fast file search
$ locate nginx.conf
/etc/nginx/nginx.conf
/usr/share/doc/nginx/examples/nginx.conf

# Case-insensitive search
$ locate -i README
/home/user/projects/readme.md
/usr/share/doc/README
```

## 🔎 Text Processing with `grep`

### Basic `grep` Usage

```bash
# Search for pattern in file
$ grep "error" /var/log/syslog
Dec 15 10:30:15 server kernel: [12345.678] USB disconnect, address 1
Dec 15 10:31:22 server systemd[1]: Failed to start service

# Case-insensitive search
$ grep -i "ERROR" /var/log/syslog

# Show line numbers
$ grep -n "failed" /var/log/auth.log
23:Dec 15 10:25:30 server sshd[1234]: Failed password for user from 192.168.1.100
45:Dec 15 10:26:15 server sshd[1235]: Failed password for admin from 192.168.1.101

# Count matches
$ grep -c "ssh" /var/log/auth.log
127

# Show context around matches
$ grep -A 2 -B 2 "error" /var/log/syslog
# -A 2: show 2 lines after
# -B 2: show 2 lines before
# -C 2: show 2 lines before and after
```

### Advanced `grep` Patterns

```bash
# Regular expressions
$ grep "^Dec 15" /var/log/syslog          # Lines starting with "Dec 15"
$ grep "error$" /var/log/syslog           # Lines ending with "error"
$ grep "[0-9]\{1,3\}\.[0-9]\{1,3\}" /var/log/auth.log  # IP addresses

# Multiple patterns
$ grep -E "error|warning|critical" /var/log/syslog

# Exclude patterns
$ grep -v "info" /var/log/syslog          # Show all lines except those with "info"

# Recursive search in directories
$ grep -r "TODO" /home/user/projects/
/home/user/projects/app.js:15:// TODO: Add error handling
/home/user/projects/README.md:23:TODO: Update documentation

# Search in specific file types
$ grep -r --include="*.py" "import" /home/user/projects/
```

### Practical `grep` Examples

```bash
# Find failed login attempts
$ grep "Failed password" /var/log/auth.log

# Find all IP addresses in logs
$ grep -oE "[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}" /var/log/auth.log

# Find processes using specific port
$ netstat -tulpn | grep ":80 "

# Search for configuration errors
$ grep -i "error\|warning\|fail" /etc/nginx/nginx.conf
```

## ✂️ Text Manipulation with `sed`

### Basic `sed` Operations

```bash
# Replace first occurrence per line
$ sed 's/old/new/' file.txt

# Replace all occurrences
$ sed 's/old/new/g' file.txt

# Replace and save to new file
$ sed 's/old/new/g' file.txt > newfile.txt

# Edit file in place
$ sed -i 's/old/new/g' file.txt

# Replace with backup
$ sed -i.bak 's/old/new/g' file.txt
```

### Advanced `sed` Examples

```bash
# Delete lines containing pattern
$ sed '/pattern/d' file.txt

# Delete empty lines
$ sed '/^$/d' file.txt

# Print specific lines
$ sed -n '10,20p' file.txt              # Print lines 10-20
$ sed -n '/pattern/p' file.txt          # Print lines matching pattern

# Insert text before/after pattern
$ sed '/pattern/i\New line before' file.txt
$ sed '/pattern/a\New line after' file.txt

# Multiple operations
$ sed -e 's/old1/new1/g' -e 's/old2/new2/g' file.txt
```

### Practical `sed` Use Cases

```bash
# Remove comments from config file
$ sed '/^#/d' /etc/ssh/sshd_config

# Change IP address in config
$ sed -i 's/192.168.1.100/192.168.1.200/g' /etc/hosts

# Add line numbers
$ sed = file.txt | sed 'N;s/\n/\t/'

# Convert DOS line endings to Unix
$ sed -i 's/\r$//' file.txt

# Extract email addresses
$ sed -n 's/.*\([a-zA-Z0-9._%+-]\+@[a-zA-Z0-9.-]\+\.[a-zA-Z]\{2,\}\).*/\1/p' file.txt
```

## 🔧 Text Processing with `awk`

### Basic `awk` Concepts

```bash
# Print specific columns
$ awk '{print $1, $3}' /etc/passwd       # Print 1st and 3rd columns

# Print with custom separator
$ awk -F: '{print $1, $3}' /etc/passwd   # Use : as field separator

# Print lines matching condition
$ awk '$3 >= 1000' /etc/passwd           # Users with UID >= 1000

# Count lines
$ awk 'END {print NR}' file.txt

# Sum numbers in column
$ awk '{sum += $1} END {print sum}' numbers.txt
```

### Advanced `awk` Examples

```bash
# Process log files
$ awk '$9 == 404 {print $1, $7}' /var/log/apache2/access.log

# Calculate averages
$ awk '{sum += $3; count++} END {print sum/count}' data.txt

# Format output
$ awk -F: '{printf "%-20s %s\n", $1, $5}' /etc/passwd

# Conditional processing
$ awk '$3 > 1000 {print $1 " is a regular user"}' /etc/passwd

# Multiple conditions
$ awk '$3 >= 1000 && $7 != "/usr/sbin/nologin" {print $1}' /etc/passwd
```

### Real-World `awk` Scripts

```bash
# Analyze web server logs
$ awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -nr
# Shows most frequent IP addresses

# Process CSV files
$ awk -F, '{print $2, $4}' data.csv

# Calculate disk usage summary
$ df -h | awk 'NR>1 {gsub(/%/, "", $5); if($5 > 80) print $6 " is " $5 "% full"}'

# Monitor system load
$ uptime | awk '{print "Load average: " $(NF-2) " " $(NF-1) " " $NF}'
```

## 📝 Command-Line Editors

### `nano` - Beginner-Friendly Editor

```bash
# Open file in nano
$ nano filename.txt

# Nano shortcuts (shown at bottom of screen):
# Ctrl+O: Save (WriteOut)
# Ctrl+X: Exit
# Ctrl+W: Search
# Ctrl+K: Cut line
# Ctrl+U: Paste
# Ctrl+G: Help
```

**Nano Configuration:**
```bash
# Create ~/.nanorc for custom settings
$ cat > ~/.nanorc << EOF
set linenumbers
set mouse
set smooth
set tabsize 4
include /usr/share/nano/*.nanorc
EOF
```

### `vim` - Powerful Modal Editor

#### Vim Modes
- **Normal Mode**: Navigation and commands (default)
- **Insert Mode**: Text editing
- **Visual Mode**: Text selection
- **Command Mode**: Execute commands

#### Basic Vim Commands

```bash
# Open file
$ vim filename.txt

# Mode switching:
# i: Enter insert mode
# Esc: Return to normal mode
# v: Enter visual mode
# :: Enter command mode

# Navigation (Normal mode):
# h,j,k,l: Left, down, up, right
# w: Next word
# b: Previous word
# 0: Beginning of line
# $: End of line
# gg: First line
# G: Last line
# :n: Go to line n

# Editing (Normal mode):
# x: Delete character
# dd: Delete line
# yy: Copy line
# p: Paste
# u: Undo
# Ctrl+r: Redo

# Search and replace:
# /pattern: Search forward
# ?pattern: Search backward
# n: Next match
# N: Previous match
# :%s/old/new/g: Replace all

# Save and exit:
# :w: Save
# :q: Quit
# :wq: Save and quit
# :q!: Quit without saving
```

#### Vim Configuration

```bash
# Create ~/.vimrc for custom settings
$ cat > ~/.vimrc << EOF
set number          " Show line numbers
set tabstop=4       " Tab width
set shiftwidth=4    " Indent width
set expandtab       " Use spaces instead of tabs
set hlsearch        " Highlight search results
set ignorecase      " Case-insensitive search
set smartcase       " Smart case search
syntax on           " Enable syntax highlighting
set mouse=a         " Enable mouse support
EOF
```

## 🔐 File Permissions and Ownership

### Understanding Permissions

```bash
# View permissions
$ ls -l file.txt
-rw-r--r-- 1 user group 1024 Dec 15 10:30 file.txt
# ^^^^^^^^^^
# |||||||++-- Other permissions (r--)
# ||||+++---- Group permissions (r--)
# |+++------- User permissions (rw-)
# +---------- File type (-=file, d=directory, l=link)
```

### Permission Types
| Symbol | Permission | Numeric | Meaning |
|--------|------------|---------|----------|
| `r` | Read | 4 | View file contents |
| `w` | Write | 2 | Modify file |
| `x` | Execute | 1 | Run file as program |
| `-` | No permission | 0 | No access |

### Changing Permissions

```bash
# Symbolic method
$ chmod u+x script.sh              # Add execute for user
$ chmod g-w file.txt               # Remove write for group
$ chmod o+r file.txt               # Add read for others
$ chmod a+x script.sh              # Add execute for all

# Numeric method
$ chmod 755 script.sh              # rwxr-xr-x
$ chmod 644 file.txt               # rw-r--r--
$ chmod 600 private.txt            # rw-------
$ chmod 777 public_dir/            # rwxrwxrwx (dangerous!)

# Recursive permissions
$ chmod -R 755 /var/www/html/
```

### Common Permission Patterns

| Permissions | Numeric | Use Case |
|-------------|---------|----------|
| `rwx------` | 700 | Private executable |
| `rwxr-xr-x` | 755 | Public executable |
| `rw-------` | 600 | Private file |
| `rw-r--r--` | 644 | Public readable file |
| `rw-rw-r--` | 664 | Group writable file |

### Changing Ownership

```bash
# Change owner
$ sudo chown newuser file.txt

# Change owner and group
$ sudo chown newuser:newgroup file.txt

# Change only group
$ sudo chgrp newgroup file.txt

# Recursive ownership change
$ sudo chown -R www-data:www-data /var/www/

# Copy permissions from another file
$ chmod --reference=source.txt target.txt
```

## 🔗 Links: Symbolic and Hard

### Hard Links

```bash
# Create hard link
$ ln original.txt hardlink.txt

# Both files point to same data
$ ls -li original.txt hardlink.txt
123456 -rw-r--r-- 2 user group 1024 Dec 15 10:30 original.txt
123456 -rw-r--r-- 2 user group 1024 Dec 15 10:30 hardlink.txt
#      ^
#      Same inode number

# Deleting original doesn't affect hard link
$ rm original.txt
$ cat hardlink.txt  # Still works
```

### Symbolic Links

```bash
# Create symbolic link
$ ln -s /path/to/original.txt symlink.txt

# View symbolic link
$ ls -l symlink.txt
lrwxrwxrwx 1 user group 20 Dec 15 10:30 symlink.txt -> /path/to/original.txt

# Create relative symbolic link
$ ln -s ../config/settings.conf current_settings.conf

# Update symbolic link
$ ln -sfn /new/path/file.txt symlink.txt
```

### Link Differences

| Feature | Hard Link | Symbolic Link |
|---------|-----------|---------------|
| Cross filesystems | No | Yes |
| Link to directories | No | Yes |
| Original deleted | Still works | Broken link |
| Shows in `ls -l` | No | Yes |
| Disk space | None | Minimal |

## 📊 File Comparison and Merging

### Comparing Files

```bash
# Simple comparison
$ diff file1.txt file2.txt
2c2
< This is line 2 in file1
---
> This is line 2 in file2

# Side-by-side comparison
$ diff -y file1.txt file2.txt
Line 1 is same                    Line 1 is same
This is line 2 in file1         | This is line 2 in file2
Line 3 is same                    Line 3 is same

# Unified diff format
$ diff -u file1.txt file2.txt
--- file1.txt	2023-12-15 10:30:00.000000000 +0000
+++ file2.txt	2023-12-15 10:31:00.000000000 +0000
@@ -1,3 +1,3 @@
 Line 1 is same
-This is line 2 in file1
+This is line 2 in file2
 Line 3 is same

# Compare directories
$ diff -r dir1/ dir2/
```

### Advanced Comparison Tools

```bash
# Compare ignoring whitespace
$ diff -w file1.txt file2.txt

# Compare ignoring case
$ diff -i file1.txt file2.txt

# Show only if files differ
$ diff -q file1.txt file2.txt
Files file1.txt and file2.txt differ

# Context diff
$ diff -c file1.txt file2.txt
```

## 🎯 Practical Scenario: Log Analysis

Let's analyze a web server log file:

```bash
# 1. Create sample log file
$ cat > access.log << EOF
192.168.1.100 - - [15/Dec/2023:10:30:15 +0000] "GET /index.html HTTP/1.1" 200 1024
192.168.1.101 - - [15/Dec/2023:10:30:16 +0000] "GET /about.html HTTP/1.1" 200 2048
192.168.1.100 - - [15/Dec/2023:10:30:17 +0000] "GET /contact.php HTTP/1.1" 404 512
192.168.1.102 - - [15/Dec/2023:10:30:18 +0000] "POST /login.php HTTP/1.1" 200 256
192.168.1.100 - - [15/Dec/2023:10:30:19 +0000] "GET /admin.php HTTP/1.1" 403 128
EOF

# 2. Find all 404 errors
$ grep " 404 " access.log
192.168.1.100 - - [15/Dec/2023:10:30:17 +0000] "GET /contact.php HTTP/1.1" 404 512

# 3. Count requests per IP
$ awk '{print $1}' access.log | sort | uniq -c
      3 192.168.1.100
      1 192.168.1.101
      1 192.168.1.102

# 4. Find most requested pages
$ awk '{print $7}' access.log | sort | uniq -c | sort -nr
      1 /index.html
      1 /contact.php
      1 /admin.php
      1 /about.html
      1 /login.php

# 5. Calculate total bytes transferred
$ awk '{sum += $10} END {print "Total bytes:", sum}' access.log
Total bytes: 3968

# 6. Find suspicious activity (multiple failed attempts)
$ awk '$9 >= 400 {print $1, $7, $9}' access.log
192.168.1.100 /contact.php 404
192.168.1.100 /admin.php 403

# 7. Extract unique IP addresses
$ awk '{print $1}' access.log | sort -u
192.168.1.100
192.168.1.101
192.168.1.102
```

## ⚠️ Common Pitfalls and Best Practices

### 1. Backup Before Editing
```bash
# Always backup important files
$ cp /etc/important.conf /etc/important.conf.backup
$ sed -i.bak 's/old/new/g' /etc/important.conf
```

### 2. Test Regular Expressions
```bash
# Test grep patterns before using in scripts
$ echo "test string" | grep "pattern"
```

### 3. Use Quotes with Special Characters
```bash
# Protect special characters
$ grep "\$variable" file.txt
$ find . -name "*.tmp"
```

### 4. Understand File Permissions
```bash
# Check permissions before changing
$ ls -l file.txt
$ chmod 644 file.txt  # Don't use 777 unless necessary
```

## 🧠 Knowledge Check

### Quick Quiz

1. **How do you search for all files larger than 100MB in /var?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   find /var -size +100M
   ```
   </details>

2. **What's the difference between `>` and `>>` when redirecting output?**
   <details>
   <summary>Answer</summary>
   
   - `>` overwrites the file
   - `>>` appends to the file
   </details>

3. **How do you replace all occurrences of "old" with "new" in a file using sed?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   sed -i 's/old/new/g' filename
   ```
   </details>

4. **What permission number gives read and write to owner, read to group, and no access to others?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   640 (rw-r-----)
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Log Processing**
```bash
# Create a script that:
# 1. Finds all ERROR entries in /var/log/syslog
# 2. Counts how many errors occurred today
# 3. Saves unique error messages to a file
```

**Challenge 2: Configuration Management**
```bash
# 1. Create a backup of /etc/hosts
# 2. Add a new entry: "127.0.0.1 myapp.local"
# 3. Verify the change was made correctly
```

**Challenge 3: File Cleanup**
```bash
# Create a script that:
# 1. Finds all .tmp files older than 7 days
# 2. Lists them with their sizes
# 3. Asks for confirmation before deleting
```

## 🚀 Next Steps

Excellent work! You've mastered advanced file operations and text processing. You can now:
- Search and filter files efficiently
- Process text data with grep, sed, and awk
- Edit files with nano and vim
- Manage file permissions and ownership
- Compare and analyze files

**Ready to dive deeper?** Continue to [03-process-management.md](03-process-management.md) to learn about managing processes, services, and system resources.

---

> **Pro Tip**: Text processing skills are invaluable for automation and data analysis. Practice these commands with real log files and configuration files to build muscle memory. The combination of grep, sed, and awk can solve most text processing challenges! 🔧