# 🛠️ System Administration: Managing Linux Systems

> **Master essential system administration tasks for Linux servers and workstations**

## 📖 What You'll Learn

System administration is the backbone of maintaining reliable Linux systems. This chapter covers essential administrative tasks that every Linux professional should master:

- User and group management
- Package management across distributions
- System monitoring and logging
- Disk and filesystem management
- Network configuration and management
- System backup and recovery
- Security hardening basics
- Automation with cron and scripts

## 🌍 Why This Matters

**Critical applications:**
- **Server Management**: Maintain production servers and services
- **Security**: Implement proper access controls and monitoring
- **Performance**: Optimize system resources and troubleshoot issues
- **Reliability**: Ensure system uptime and data protection
- **Compliance**: Meet organizational and regulatory requirements

## 👥 User and Group Management

### User Account Management

```bash
# Create new user
$ sudo useradd -m -s /bin/bash john
$ sudo useradd -m -s /bin/bash -G sudo,developers john  # With groups

# Set user password
$ sudo passwd john
Enter new UNIX password:
Retype new UNIX password:
passwd: password updated successfully

# Create user with specific UID and home directory
$ sudo useradd -m -u 1500 -d /home/custom -s /bin/bash jane

# Modify existing user
$ sudo usermod -aG sudo john        # Add to sudo group
$ sudo usermod -s /bin/zsh john     # Change shell
$ sudo usermod -d /new/home john    # Change home directory
$ sudo usermod -l newname john      # Change username

# Lock/unlock user account
$ sudo usermod -L john              # Lock account
$ sudo usermod -U john              # Unlock account
$ sudo passwd -l john               # Lock password
$ sudo passwd -u john               # Unlock password

# Delete user
$ sudo userdel john                 # Delete user (keep home)
$ sudo userdel -r john              # Delete user and home directory

# View user information
$ id john
uid=1001(john) gid=1001(john) groups=1001(john),27(sudo),1002(developers)

$ finger john
Login: john                             Name: John Doe
Directory: /home/john                   Shell: /bin/bash
Last login Mon Dec 15 10:30 (UTC) on pts/0
No mail.
No Plan.

# List all users
$ cat /etc/passwd | cut -d: -f1
$ getent passwd | cut -d: -f1
```

### Group Management

```bash
# Create new group
$ sudo groupadd developers
$ sudo groupadd -g 2000 admins     # With specific GID

# Add user to group
$ sudo usermod -aG developers john
$ sudo gpasswd -a john developers  # Alternative method

# Remove user from group
$ sudo gpasswd -d john developers

# Change user's primary group
$ sudo usermod -g developers john

# Delete group
$ sudo groupdel developers

# List all groups
$ cat /etc/group | cut -d: -f1
$ getent group | cut -d: -f1

# Show groups for user
$ groups john
john : john sudo developers

# Show group members
$ getent group sudo
sudo:x:27:john,jane,admin
```

### Advanced User Management

```bash
# Set password policies
$ sudo nano /etc/login.defs
# PASS_MAX_DAYS   90
# PASS_MIN_DAYS   1
# PASS_WARN_AGE   7
# PASS_MIN_LEN    8

# Force password change on next login
$ sudo chage -d 0 john

# Set password expiration
$ sudo chage -M 90 john             # Max 90 days
$ sudo chage -m 1 john              # Min 1 day between changes
$ sudo chage -W 7 john              # Warn 7 days before expiry

# View password aging information
$ sudo chage -l john
Last password change                                    : Dec 15, 2023
Password expires                                        : Mar 14, 2024
Password inactive                                       : never
Account expires                                         : never
Minimum number of days between password change         : 1
Maximum number of days between password change         : 90
Number of days of warning before password expires      : 7

# Create system user (no login)
$ sudo useradd -r -s /bin/false -d /var/lib/myapp myapp

# Bulk user creation
$ sudo newusers users.txt
# users.txt format:
# username:password:uid:gid:comment:home:shell
```

## 📦 Package Management

### Debian/Ubuntu (APT)

```bash
# Update package lists
$ sudo apt update

# Upgrade packages
$ sudo apt upgrade
$ sudo apt full-upgrade            # More comprehensive upgrade

# Install packages
$ sudo apt install nginx
$ sudo apt install nginx mysql-server php  # Multiple packages

# Remove packages
$ sudo apt remove nginx
$ sudo apt purge nginx             # Remove with config files
$ sudo apt autoremove              # Remove unused dependencies

# Search packages
$ apt search nginx
$ apt-cache search web server

# Show package information
$ apt show nginx
$ apt-cache show nginx

# List installed packages
$ apt list --installed
$ dpkg -l

# Check if package is installed
$ dpkg -l | grep nginx
$ apt list --installed | grep nginx

# Download package without installing
$ apt download nginx

# Install local .deb package
$ sudo dpkg -i package.deb
$ sudo apt install -f             # Fix dependencies

# Hold package (prevent updates)
$ sudo apt-mark hold nginx
$ sudo apt-mark unhold nginx

# Clean package cache
$ sudo apt clean
$ sudo apt autoclean
```

### Red Hat/CentOS (YUM/DNF)

```bash
# Update package lists
$ sudo yum update                  # CentOS 7
$ sudo dnf update                  # CentOS 8+

# Install packages
$ sudo yum install nginx
$ sudo dnf install nginx mysql-server

# Remove packages
$ sudo yum remove nginx
$ sudo dnf remove nginx

# Search packages
$ yum search nginx
$ dnf search nginx

# Show package information
$ yum info nginx
$ dnf info nginx

# List installed packages
$ yum list installed
$ dnf list installed
$ rpm -qa

# Install local .rpm package
$ sudo rpm -ivh package.rpm
$ sudo yum localinstall package.rpm
$ sudo dnf localinstall package.rpm

# Enable/disable repositories
$ sudo yum-config-manager --enable epel
$ sudo dnf config-manager --enable epel

# Clean package cache
$ sudo yum clean all
$ sudo dnf clean all
```

### Package Management Best Practices

```bash
# Always update before installing
$ sudo apt update && sudo apt install package

# Check for security updates
$ sudo apt list --upgradable
$ sudo unattended-upgrade --dry-run  # Ubuntu

# Backup package list
$ dpkg --get-selections > package-list.txt
$ sudo dpkg --set-selections < package-list.txt
$ sudo apt-get dselect-upgrade

# Find which package provides a file
$ dpkg -S /usr/bin/nginx
$ yum whatprovides /usr/bin/nginx
$ dnf whatprovides /usr/bin/nginx

# List files in package
$ dpkg -L nginx
$ rpm -ql nginx

# Verify package integrity
$ debsums nginx                    # Debian/Ubuntu
$ rpm -V nginx                     # Red Hat/CentOS
```

## 📊 System Monitoring and Logging

### System Logs

```bash
# View system logs with journalctl (systemd)
$ sudo journalctl
$ sudo journalctl -f               # Follow logs
$ sudo journalctl -u nginx         # Service-specific logs
$ sudo journalctl --since today
$ sudo journalctl --since "2023-12-15 10:00:00"
$ sudo journalctl --until "2023-12-15 12:00:00"
$ sudo journalctl -p err           # Error level and above
$ sudo journalctl -n 50            # Last 50 entries

# Traditional log files
$ sudo tail -f /var/log/syslog     # System log
$ sudo tail -f /var/log/auth.log   # Authentication log
$ sudo tail -f /var/log/kern.log   # Kernel log
$ sudo tail -f /var/log/mail.log   # Mail log
$ sudo tail -f /var/log/apache2/access.log  # Web server logs

# Log rotation
$ sudo logrotate -d /etc/logrotate.conf  # Dry run
$ sudo logrotate -f /etc/logrotate.conf  # Force rotation

# Configure log rotation
$ sudo nano /etc/logrotate.d/myapp
/var/log/myapp/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 myapp myapp
    postrotate
        systemctl reload myapp
    endscript
}
```

### System Resource Monitoring

```bash
# Disk usage monitoring
$ df -h                            # Filesystem usage
$ du -sh /var/log/*                # Directory sizes
$ du -h --max-depth=1 /            # Top-level directory sizes

# Find large files
$ find / -type f -size +100M 2>/dev/null | head -10
$ find /var/log -type f -size +10M -exec ls -lh {} \;

# Monitor disk I/O
$ iostat -x 1                      # Extended I/O statistics
$ iotop                            # Top-like I/O monitor

# Network monitoring
$ netstat -tuln                    # Listening ports
$ ss -tuln                         # Modern alternative
$ iftop                            # Network bandwidth usage
$ nethogs                          # Per-process network usage

# System performance
$ vmstat 1                         # Virtual memory statistics
$ sar -u 1 10                      # CPU usage
$ sar -r 1 10                      # Memory usage
$ sar -d 1 10                      # Disk activity
```

### Automated Monitoring Scripts

```bash
#!/bin/bash
# system-health-check.sh - Automated system health monitoring

LOGFILE="/var/log/system-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting system health check" >> $LOGFILE

# Check disk usage
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Root filesystem is ${DISK_USAGE}% full" >> $LOGFILE
    # Send alert email
    echo "Root filesystem is ${DISK_USAGE}% full" | mail -s "Disk Space Alert" admin@example.com
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOGFILE
fi

# Check load average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_THRESHOLD="2.0"
if (( $(echo "$LOAD_AVG > $LOAD_THRESHOLD" | bc -l) )); then
    echo "[$DATE] WARNING: High load average: $LOAD_AVG" >> $LOGFILE
fi

# Check failed services
FAILED_SERVICES=$(systemctl --failed --no-legend | wc -l)
if [ $FAILED_SERVICES -gt 0 ]; then
    echo "[$DATE] WARNING: $FAILED_SERVICES failed services detected" >> $LOGFILE
    systemctl --failed --no-legend >> $LOGFILE
fi

echo "[$DATE] System health check completed" >> $LOGFILE
```

## 💾 Disk and Filesystem Management

### Disk Partitioning

```bash
# List block devices
$ lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   20G  0 disk
├─sda1   8:1    0    1G  0 part /boot
├─sda2   8:2    0    2G  0 part [SWAP]
└─sda3   8:3    0   17G  0 part /
sdb      8:16   0   10G  0 disk

# Partition disk with fdisk
$ sudo fdisk /dev/sdb
Command (m for help): n     # New partition
Command (m for help): p     # Print partition table
Command (m for help): w     # Write changes

# Partition disk with parted
$ sudo parted /dev/sdb
(parted) mklabel gpt
(parted) mkpart primary ext4 0% 100%
(parted) print
(parted) quit

# Create filesystem
$ sudo mkfs.ext4 /dev/sdb1
$ sudo mkfs.xfs /dev/sdb1
$ sudo mkfs.btrfs /dev/sdb1

# Check filesystem
$ sudo fsck /dev/sdb1
$ sudo fsck.ext4 /dev/sdb1
$ sudo e2fsck -f /dev/sdb1
```

### Mount Management

```bash
# Mount filesystem
$ sudo mkdir /mnt/data
$ sudo mount /dev/sdb1 /mnt/data

# Mount with specific options
$ sudo mount -o rw,noexec,nosuid /dev/sdb1 /mnt/data

# Unmount filesystem
$ sudo umount /mnt/data
$ sudo umount /dev/sdb1

# Force unmount (if busy)
$ sudo fuser -km /mnt/data
$ sudo umount -f /mnt/data

# Permanent mounts in /etc/fstab
$ sudo nano /etc/fstab
# Add line:
/dev/sdb1 /mnt/data ext4 defaults,noatime 0 2

# Test fstab entries
$ sudo mount -a

# View mounted filesystems
$ mount | grep ^/dev
$ df -h
$ findmnt
```

### LVM (Logical Volume Management)

```bash
# Create physical volume
$ sudo pvcreate /dev/sdb1
$ sudo pvdisplay

# Create volume group
$ sudo vgcreate data_vg /dev/sdb1
$ sudo vgdisplay

# Create logical volume
$ sudo lvcreate -L 5G -n data_lv data_vg
$ sudo lvdisplay

# Create filesystem on LV
$ sudo mkfs.ext4 /dev/data_vg/data_lv

# Mount logical volume
$ sudo mkdir /mnt/lvm_data
$ sudo mount /dev/data_vg/data_lv /mnt/lvm_data

# Extend logical volume
$ sudo lvextend -L +2G /dev/data_vg/data_lv
$ sudo resize2fs /dev/data_vg/data_lv  # For ext4
$ sudo xfs_growfs /mnt/lvm_data        # For XFS

# Add physical volume to VG
$ sudo pvcreate /dev/sdc1
$ sudo vgextend data_vg /dev/sdc1
```

## 🔒 Security Hardening Basics

### SSH Security

```bash
# Configure SSH security
$ sudo nano /etc/ssh/sshd_config

# Recommended settings:
Port 2222                          # Change default port
PermitRootLogin no                 # Disable root login
PasswordAuthentication no          # Use key-based auth only
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers john jane               # Limit allowed users
DenyUsers guest                    # Deny specific users

# Restart SSH service
$ sudo systemctl restart sshd

# Generate SSH key pair
$ ssh-keygen -t rsa -b 4096 -C "user@example.com"
$ ssh-keygen -t ed25519 -C "user@example.com"  # More secure

# Copy public key to server
$ ssh-copy-id user@server
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server
```

### Firewall Configuration

```bash
# UFW (Uncomplicated Firewall)
$ sudo ufw enable
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing
$ sudo ufw allow ssh
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp
$ sudo ufw allow from 192.168.1.0/24
$ sudo ufw status verbose

# iptables (more advanced)
$ sudo iptables -L
$ sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
$ sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
$ sudo iptables -A INPUT -j DROP
$ sudo iptables-save > /etc/iptables/rules.v4
```

### System Security Auditing

```bash
# Check for rootkits
$ sudo apt install rkhunter chkrootkit
$ sudo rkhunter --check
$ sudo chkrootkit

# File integrity monitoring
$ sudo apt install aide
$ sudo aideinit
$ sudo aide --check

# Check for SUID/SGID files
$ find / -type f \( -perm -4000 -o -perm -2000 \) -exec ls -l {} \; 2>/dev/null

# Check for world-writable files
$ find / -type f -perm -002 -exec ls -l {} \; 2>/dev/null

# Monitor login attempts
$ sudo tail -f /var/log/auth.log | grep "Failed password"
$ sudo lastb                       # Failed login attempts
$ sudo last                        # Successful logins
```

## ⏰ Automation with Cron

### Cron Job Management

```bash
# Edit user crontab
$ crontab -e

# List user crontab
$ crontab -l

# Remove user crontab
$ crontab -r

# Edit system-wide crontab
$ sudo nano /etc/crontab

# Cron format:
# minute hour day month weekday command
# 0-59   0-23 1-31 1-12  0-7 (0 and 7 are Sunday)

# Examples:
0 2 * * *     /usr/local/bin/backup.sh           # Daily at 2 AM
*/15 * * * *  /usr/local/bin/check-health.sh      # Every 15 minutes
0 0 * * 0     /usr/local/bin/weekly-cleanup.sh    # Weekly on Sunday
0 0 1 * *     /usr/local/bin/monthly-report.sh    # Monthly on 1st
@reboot       /usr/local/bin/startup.sh           # At boot
@daily        /usr/local/bin/daily-tasks.sh       # Daily
@weekly       /usr/local/bin/weekly-tasks.sh      # Weekly
```

### Cron Directories

```bash
# System cron directories
/etc/cron.hourly/     # Scripts run hourly
/etc/cron.daily/      # Scripts run daily
/etc/cron.weekly/     # Scripts run weekly
/etc/cron.monthly/    # Scripts run monthly

# Place executable scripts in these directories
$ sudo cp backup.sh /etc/cron.daily/
$ sudo chmod +x /etc/cron.daily/backup.sh

# Check cron logs
$ sudo grep CRON /var/log/syslog
$ sudo journalctl -u cron
```

### Backup Automation Example

```bash
#!/bin/bash
# /usr/local/bin/backup.sh - Automated backup script

BACKUP_DIR="/backup"
SOURCE_DIRS="/home /etc /var/www"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/system_backup_$DATE.tar.gz"
LOG_FILE="/var/log/backup.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Log start
echo "[$(date)] Starting backup" >> $LOG_FILE

# Create compressed backup
tar -czf $BACKUP_FILE $SOURCE_DIRS 2>>$LOG_FILE

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: $BACKUP_FILE" >> $LOG_FILE
    
    # Remove backups older than 7 days
    find $BACKUP_DIR -name "system_backup_*.tar.gz" -mtime +7 -delete
    
    # Send success notification
    echo "Backup completed: $BACKUP_FILE" | mail -s "Backup Success" admin@example.com
else
    echo "[$(date)] Backup failed" >> $LOG_FILE
    echo "Backup failed. Check $LOG_FILE for details" | mail -s "Backup Failed" admin@example.com
fi
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between `apt remove` and `apt purge`?**
   <details>
   <summary>Answer</summary>
   
   `apt remove` uninstalls the package but keeps configuration files, while `apt purge` removes both the package and its configuration files.
   </details>

2. **How do you make a filesystem mount automatically at boot?**
   <details>
   <summary>Answer</summary>
   
   Add an entry to `/etc/fstab` with the appropriate mount options and run `sudo mount -a` to test.
   </details>

3. **What does the cron expression `0 */6 * * *` mean?**
   <details>
   <summary>Answer</summary>
   
   Run at minute 0 of every 6th hour (00:00, 06:00, 12:00, 18:00) every day.
   </details>

4. **How do you check which package provides a specific file?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   dpkg -S /path/to/file        # Debian/Ubuntu
   rpm -qf /path/to/file        # Red Hat/CentOS
   ```
   </details>

### Hands-On Challenges

**Challenge 1: User Management System**
```bash
# Create a script that:
# - Adds users from a CSV file
# - Sets up proper home directories
# - Assigns users to appropriate groups
# - Sets password policies
# - Generates a report of created users
```

**Challenge 2: System Monitoring Dashboard**
```bash
# Create a monitoring system that:
# - Checks disk usage, memory, and CPU
# - Monitors critical services
# - Sends alerts when thresholds are exceeded
# - Logs all activities
# - Runs automatically via cron
```

**Challenge 3: Automated Backup Solution**
```bash
# Design a backup system that:
# - Backs up multiple directories
# - Implements rotation (keep last 30 days)
# - Compresses and encrypts backups
# - Verifies backup integrity
# - Sends status notifications
```

## 🚀 Next Steps

Excellent! You've mastered essential Linux system administration. You can now:
- Manage users and groups effectively
- Handle package management across distributions
- Monitor system resources and logs
- Configure disks and filesystems
- Implement basic security measures
- Automate tasks with cron
- Troubleshoot common system issues

**Ready for advanced networking?** Continue to [07-ssh-remote-access.md](07-ssh-remote-access.md) to master secure remote access and administration.

---

> **Pro Tip**: Always test system changes in a non-production environment first. Keep regular backups, monitor system logs, and document your configurations. Automation is powerful, but always include error handling and logging in your scripts! 🛠️