# 🔐 File Permissions & Ownership: Security Fundamentals

> **Master Linux file permissions, ownership, and access control for secure system administration**

## 📖 What You'll Learn

File permissions and ownership are the foundation of Linux security. This chapter covers everything you need to know about controlling access to files and directories:

- Understanding Linux permission model
- Reading and interpreting permission strings
- Changing permissions with `chmod`
- Managing ownership with `chown` and `chgrp`
- Special permissions (setuid, setgid, sticky bit)
- Access Control Lists (ACLs)
- Security best practices
- Troubleshooting permission issues

## 🌍 Why This Matters

**Critical applications:**
- **Security**: Protect sensitive files and system resources
- **Multi-user Systems**: Control access in shared environments
- **Web Servers**: Secure web applications and content
- **System Administration**: Maintain proper system security
- **Compliance**: Meet security requirements and standards

## 🏗️ Understanding Linux Permissions

### Permission Model Overview

```bash
# Linux uses a simple but powerful permission model:
# Every file/directory has:
# 1. Owner (user who owns the file)
# 2. Group (group that owns the file)
# 3. Others (everyone else)

# Each category has three permissions:
# r = read (4)
# w = write (2)
# x = execute (1)

# Example permission string:
# -rwxr-xr--
# ||||||||||
# ||||||||+-- Others: read only (r--)
# |||||||+--- Others: no write
# ||||||+---- Others: no execute
# |||||+----- Group: read and execute (r-x)
# ||||+------ Group: no write
# |||+------- Group: execute
# ||+-------- Owner: read, write, execute (rwx)
# |+--------- Owner: write
# +---------- File type: - (regular file)
```

### Viewing Permissions

```bash
# Basic permission viewing
$ ls -l
total 12
-rw-r--r-- 1 user group  1024 Dec 15 10:30 document.txt
drwxr-xr-x 2 user group  4096 Dec 15 10:31 directory
-rwxr-xr-x 1 user group  2048 Dec 15 10:32 script.sh

# Detailed breakdown:
# -rw-r--r-- 1 user group  1024 Dec 15 10:30 document.txt
# |          | |    |     |    |           |
# |          | |    |     |    |           +-- Filename
# |          | |    |     |    +-- Modification time
# |          | |    |     +-- File size
# |          | |    +-- Group owner
# |          | +-- User owner
# |          +-- Number of hard links
# +-- Permissions

# Show permissions in octal format
$ stat -c "%a %n" *
644 document.txt
755 directory
755 script.sh

# Show detailed file information
$ stat document.txt
  File: document.txt
  Size: 1024      	Blocks: 8          IO Block: 4096   regular file
Device: 801h/2049d	Inode: 123456      Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/    user)   Gid: ( 1000/   group)
Access: 2023-12-15 10:30:00.000000000 +0000
Modify: 2023-12-15 10:30:00.000000000 +0000
Change: 2023-12-15 10:30:00.000000000 +0000
```

### File Type Indicators

```bash
# First character indicates file type:
-  Regular file
d  Directory
l  Symbolic link
c  Character device
b  Block device
p  Named pipe (FIFO)
s  Socket

# Examples:
$ ls -l /dev/ | head -5
crw-rw-rw- 1 root tty     5,   0 Dec 15 10:30 tty
brw-rw---- 1 root disk    8,   0 Dec 15 10:30 sda
lrwxrwxrwx 1 root root        15 Dec 15 10:30 stdout -> /proc/self/fd/1
prw-r--r-- 1 root root         0 Dec 15 10:30 mypipe
srwxrwxrwx 1 root root         0 Dec 15 10:30 socket
```

## 🔧 Changing Permissions with `chmod`

### Symbolic Mode

```bash
# Symbolic mode uses letters and symbols:
# u = user (owner)
# g = group
# o = others
# a = all (user + group + others)

# + = add permission
# - = remove permission
# = = set exact permission

# Examples:
$ chmod u+x script.sh        # Add execute for user
$ chmod g-w document.txt     # Remove write for group
$ chmod o=r document.txt     # Set others to read-only
$ chmod a+r document.txt     # Add read for all
$ chmod u+rwx,g+rx,o+r file  # Multiple permissions

# Before and after examples:
$ ls -l script.sh
-rw-r--r-- 1 user group 1024 Dec 15 10:30 script.sh

$ chmod u+x script.sh
$ ls -l script.sh
-rwxr--r-- 1 user group 1024 Dec 15 10:30 script.sh

$ chmod g+w,o-r script.sh
$ ls -l script.sh
-rwxrw---- 1 user group 1024 Dec 15 10:30 script.sh
```

### Numeric (Octal) Mode

```bash
# Numeric mode uses three digits (0-7):
# Each digit represents permissions for user, group, others
# 4 = read (r)
# 2 = write (w)
# 1 = execute (x)

# Common permission combinations:
# 0 = --- (no permissions)
# 1 = --x (execute only)
# 2 = -w- (write only)
# 3 = -wx (write + execute)
# 4 = r-- (read only)
# 5 = r-x (read + execute)
# 6 = rw- (read + write)
# 7 = rwx (read + write + execute)

# Examples:
$ chmod 755 script.sh        # rwxr-xr-x
$ chmod 644 document.txt     # rw-r--r--
$ chmod 600 private.txt      # rw-------
$ chmod 777 shared_dir       # rwxrwxrwx (dangerous!)
$ chmod 000 locked_file      # --------- (no access)

# Practical examples:
$ chmod 755 ~/bin/*          # Make all scripts executable
$ chmod 644 *.txt            # Standard file permissions
$ chmod 700 ~/.ssh           # Secure SSH directory
$ chmod 600 ~/.ssh/id_rsa    # Secure private key
```

### Recursive Permission Changes

```bash
# Apply permissions recursively to directories
$ chmod -R 755 /var/www/html # Web directory permissions
$ chmod -R 644 /var/www/html/*.html # HTML files

# Set directory and file permissions differently:
$ find /path -type d -exec chmod 755 {} \;  # Directories: 755
$ find /path -type f -exec chmod 644 {} \;  # Files: 644

# One-liner for web directories:
$ find /var/www/html -type d -exec chmod 755 {} \; -o -type f -exec chmod 644 {} \;

# Using chmod with find for specific file types:
$ find . -name "*.sh" -exec chmod +x {} \;   # Make all .sh files executable
$ find . -name "*.txt" -exec chmod 644 {} \; # Set standard permissions for text files
```

## 👥 Managing Ownership

### Changing File Ownership

```bash
# Change owner only
$ sudo chown newuser file.txt
$ ls -l file.txt
-rw-r--r-- 1 newuser group 1024 Dec 15 10:30 file.txt

# Change owner and group
$ sudo chown newuser:newgroup file.txt
$ ls -l file.txt
-rw-r--r-- 1 newuser newgroup 1024 Dec 15 10:30 file.txt

# Change ownership recursively
$ sudo chown -R apache:apache /var/www/html

# Copy ownership from another file
$ sudo chown --reference=template.txt file.txt

# Change ownership of symbolic links
$ sudo chown -h user:group symlink  # Change link itself, not target
```

### Changing Group Ownership

```bash
# Change group only
$ sudo chgrp developers project_dir
$ ls -ld project_dir
drwxr-xr-x 2 user developers 4096 Dec 15 10:30 project_dir

# Change group recursively
$ sudo chgrp -R www-data /var/www

# Copy group from another file
$ sudo chgrp --reference=template.txt file.txt
```

### Practical Ownership Examples

```bash
# Web server setup
$ sudo chown -R www-data:www-data /var/www/html
$ sudo chmod -R 755 /var/www/html

# Database files
$ sudo chown -R mysql:mysql /var/lib/mysql
$ sudo chmod -R 750 /var/lib/mysql

# Log files
$ sudo chown -R syslog:adm /var/log
$ sudo chmod -R 640 /var/log/*.log

# User home directory
$ sudo chown -R user:user /home/user
$ sudo chmod 755 /home/user
$ sudo chmod 700 /home/user/.ssh
```

## 🔒 Special Permissions

### Setuid (Set User ID)

```bash
# Setuid allows a file to run with owner's privileges
# Represented by 's' in user execute position

# Set setuid bit
$ sudo chmod u+s /usr/bin/passwd
$ ls -l /usr/bin/passwd
-rwsr-xr-x 1 root root 68208 Dec 15 10:30 /usr/bin/passwd

# Numeric method (add 4000)
$ sudo chmod 4755 /usr/bin/passwd

# Remove setuid
$ sudo chmod u-s /usr/bin/passwd

# Find setuid files (security audit)
$ find / -type f -perm -4000 2>/dev/null
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
```

### Setgid (Set Group ID)

```bash
# Setgid on files: run with group's privileges
# Setgid on directories: new files inherit directory's group

# Set setgid on directory
$ sudo chmod g+s /shared/project
$ ls -ld /shared/project
drwxrwsr-x 2 user developers 4096 Dec 15 10:30 /shared/project

# Files created in this directory inherit the group
$ touch /shared/project/newfile.txt
$ ls -l /shared/project/newfile.txt
-rw-r--r-- 1 user developers 0 Dec 15 10:30 newfile.txt

# Numeric method (add 2000)
$ sudo chmod 2775 /shared/project

# Find setgid files and directories
$ find / -type f -perm -2000 2>/dev/null
$ find / -type d -perm -2000 2>/dev/null
```

### Sticky Bit

```bash
# Sticky bit on directories: only owner can delete files
# Common on /tmp directory

$ ls -ld /tmp
drwxrwxrwt 10 root root 4096 Dec 15 10:30 /tmp
#        ^
#        +-- Sticky bit (t)

# Set sticky bit
$ sudo chmod +t /shared/temp
$ ls -ld /shared/temp
drwxrwxrwt 2 root root 4096 Dec 15 10:30 /shared/temp

# Numeric method (add 1000)
$ sudo chmod 1777 /shared/temp

# Remove sticky bit
$ sudo chmod -t /shared/temp
```

### Combined Special Permissions

```bash
# All special permissions combined
$ sudo chmod 7755 special_file  # setuid + setgid + sticky + 755
$ ls -l special_file
-rwsrwsrwt 1 user group 1024 Dec 15 10:30 special_file

# Understanding the numbers:
# 7755 = 4000 (setuid) + 2000 (setgid) + 1000 (sticky) + 755 (rwxr-xr-x)
```

## 📋 Access Control Lists (ACLs)

### Basic ACL Operations

```bash
# Check if filesystem supports ACLs
$ mount | grep acl
/dev/sda1 on / type ext4 (rw,relatime,acl,user_xattr)

# View ACLs
$ getfacl file.txt
# file: file.txt
# owner: user
# group: group
user::rw-
group::r--
other::r--

# Set ACL for specific user
$ setfacl -m u:alice:rw file.txt
$ getfacl file.txt
# file: file.txt
# owner: user
# group: group
user::rw-
user:alice:rw-
group::r--
mask::rw-
other::r--

# Set ACL for specific group
$ setfacl -m g:developers:rwx project_dir

# Set default ACLs for directories
$ setfacl -d -m g:developers:rwx project_dir
$ setfacl -d -m o::r-x project_dir
```

### Advanced ACL Management

```bash
# Remove specific ACL entry
$ setfacl -x u:alice file.txt

# Remove all ACLs
$ setfacl -b file.txt

# Copy ACLs from one file to another
$ getfacl file1.txt | setfacl --set-file=- file2.txt

# Recursive ACL operations
$ setfacl -R -m g:developers:rwx /project

# Set ACLs with mask
$ setfacl -m m::rw file.txt  # Limit maximum permissions

# Backup and restore ACLs
$ getfacl -R /project > acl_backup.txt
$ setfacl --restore=acl_backup.txt
```

## 🛡️ Security Best Practices

### Principle of Least Privilege

```bash
# Give minimum necessary permissions

# Bad: World-writable files
$ chmod 777 file.txt  # DON'T DO THIS!

# Good: Specific permissions
$ chmod 644 file.txt  # Read-write for owner, read for others
$ chmod 755 script.sh # Executable for owner, read-execute for others

# Secure directories
$ chmod 700 ~/.ssh           # SSH directory
$ chmod 600 ~/.ssh/id_rsa    # Private key
$ chmod 644 ~/.ssh/id_rsa.pub # Public key
$ chmod 644 ~/.ssh/authorized_keys # Authorized keys

# Web application security
$ chmod 755 /var/www/html    # Web root
$ chmod 644 /var/www/html/*.html # HTML files
$ chmod 600 /var/www/html/config.php # Config files
```

### Common Security Patterns

```bash
# System configuration files
$ sudo chmod 644 /etc/passwd     # World-readable
$ sudo chmod 600 /etc/shadow     # Root-only
$ sudo chmod 644 /etc/group      # World-readable
$ sudo chmod 600 /etc/gshadow    # Root-only

# Log files
$ sudo chmod 640 /var/log/*.log  # Owner read-write, group read
$ sudo chmod 600 /var/log/auth.log # Sensitive logs

# Temporary directories
$ sudo chmod 1777 /tmp           # Sticky bit for shared temp
$ chmod 700 ~/tmp                # Private temp directory

# Backup files
$ chmod 600 backup_*.tar.gz      # Secure backups
$ chmod 700 backup_scripts/      # Secure backup scripts
```

### Permission Auditing

```bash
#!/bin/bash
# security-audit.sh - Basic permission audit

echo "=== Security Audit ==="
echo

# Find world-writable files (potential security risk)
echo "World-writable files:"
find / -type f -perm -002 2>/dev/null | head -10
echo

# Find setuid files
echo "Setuid files:"
find / -type f -perm -4000 2>/dev/null
echo

# Find setgid files
echo "Setgid files:"
find / -type f -perm -2000 2>/dev/null
echo

# Find files with no owner
echo "Files with no owner:"
find / -nouser 2>/dev/null | head -10
echo

# Find files with no group
echo "Files with no group:"
find / -nogroup 2>/dev/null | head -10
echo

echo "=== Audit Complete ==="
```

## 🔧 Troubleshooting Permission Issues

### Common Permission Problems

```bash
# Problem: Permission denied
$ ./script.sh
bash: ./script.sh: Permission denied

# Solution: Add execute permission
$ chmod +x script.sh
$ ./script.sh
Hello World!

# Problem: Cannot write to file
$ echo "test" > file.txt
bash: file.txt: Permission denied

# Check permissions
$ ls -l file.txt
-r--r--r-- 1 user group 0 Dec 15 10:30 file.txt

# Solution: Add write permission
$ chmod u+w file.txt
$ echo "test" > file.txt

# Problem: Cannot access directory
$ cd /restricted
bash: cd: /restricted: Permission denied

# Check directory permissions
$ ls -ld /restricted
drw-r--r-- 2 root root 4096 Dec 15 10:30 /restricted

# Solution: Need execute permission on directories
$ sudo chmod +x /restricted
```

### Permission Debugging Tools

```bash
# Check effective permissions
$ namei -l /path/to/file
f: /path/to/file
 drwxr-xr-x root root /
 drwxr-xr-x root root path
 drwxr-xr-x user user to
 -rw-r--r-- user user file

# Test file access
$ test -r file.txt && echo "Readable" || echo "Not readable"
$ test -w file.txt && echo "Writable" || echo "Not writable"
$ test -x file.txt && echo "Executable" || echo "Not executable"

# Check user groups
$ groups
user sudo developers

$ id
uid=1000(user) gid=1000(user) groups=1000(user),27(sudo),1001(developers)

# Check file ownership
$ stat -c "%U %G" file.txt
user group
```

### Permission Recovery

```bash
# Reset home directory permissions
$ sudo chmod 755 /home/user
$ sudo chmod -R u+rwX,go-w /home/user
$ sudo chmod 700 /home/user/.ssh
$ sudo chmod 600 /home/user/.ssh/*

# Reset web directory permissions
$ sudo find /var/www/html -type d -exec chmod 755 {} \;
$ sudo find /var/www/html -type f -exec chmod 644 {} \;
$ sudo chown -R www-data:www-data /var/www/html

# Emergency permission reset script
#!/bin/bash
# reset-permissions.sh
DIR="$1"
if [ -z "$DIR" ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

echo "Resetting permissions for $DIR"
find "$DIR" -type d -exec chmod 755 {} \;
find "$DIR" -type f -exec chmod 644 {} \;
echo "Done!"
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What does the permission string `-rwxr-xr--` mean?**
   <details>
   <summary>Answer</summary>
   
   Regular file with owner having read/write/execute, group having read/execute, and others having read-only permissions.
   </details>

2. **How do you make a script executable for everyone?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   chmod +x script.sh
   # or
   chmod 755 script.sh
   ```
   </details>

3. **What's the difference between `chmod 755` and `chmod 644`?**
   <details>
   <summary>Answer</summary>
   
   755 includes execute permission (rwxr-xr-x), while 644 doesn't (rw-r--r--). 755 is for executables/directories, 644 is for regular files.
   </details>

4. **How do you find all setuid files on the system?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   find / -type f -perm -4000 2>/dev/null
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Secure Web Directory**
```bash
# Create a web directory structure with proper permissions
# - Web root: 755
# - HTML files: 644
# - CGI scripts: 755
# - Config files: 600
# - Log directory: 755 with www-data ownership
```

**Challenge 2: Shared Project Directory**
```bash
# Set up a shared directory where:
# - Multiple users can read/write
# - New files inherit the group
# - Only file owners can delete their files
# - Use ACLs for fine-grained control
```

**Challenge 3: Permission Audit**
```bash
# Write a script that:
# - Finds world-writable files
# - Identifies setuid/setgid binaries
# - Checks for files with unusual permissions
# - Reports potential security issues
```

## 🚀 Next Steps

Excellent! You've mastered Linux file permissions and ownership. You can now:
- Understand and interpret permission strings
- Set appropriate permissions for different scenarios
- Manage file ownership effectively
- Use special permissions securely
- Implement ACLs for complex access control
- Troubleshoot permission-related issues

**Ready for process management?** Continue to [04-process-management.md](04-process-management.md) to learn about controlling and monitoring system processes.

---

> **Pro Tip**: Always test permission changes in a safe environment first. Use `ls -l` frequently to verify permissions, and remember that directories need execute permission to be accessible. When in doubt, start with restrictive permissions and add access as needed! 🔒