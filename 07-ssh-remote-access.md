# 🔐 SSH & Remote Access: Secure System Administration

> **Master secure remote access, file transfers, and advanced SSH techniques**

## 📖 What You'll Learn

SSH (Secure Shell) is the cornerstone of secure remote system administration. This chapter covers everything from basic connections to advanced SSH techniques:

- SSH fundamentals and security principles
- Key-based authentication setup
- SSH configuration and hardening
- Secure file transfers (SCP, SFTP, rsync)
- SSH tunneling and port forwarding
- SSH agent and key management
- Remote command execution
- Troubleshooting SSH connections

## 🌍 Why This Matters

**Critical applications:**
- **Remote Administration**: Manage servers from anywhere securely
- **DevOps**: Deploy applications and manage infrastructure
- **Security**: Replace insecure protocols like Telnet and FTP
- **Automation**: Execute remote commands in scripts
- **File Management**: Transfer files securely between systems

## 🔑 SSH Fundamentals

### Basic SSH Connection

```bash
# Basic connection
$ ssh username@hostname
$ ssh user@192.168.1.100
$ ssh user@example.com

# Connect with specific port
$ ssh -p 2222 user@hostname

# Connect with verbose output (debugging)
$ ssh -v user@hostname
$ ssh -vv user@hostname     # More verbose
$ ssh -vvv user@hostname    # Maximum verbosity

# Connect and execute command
$ ssh user@hostname 'ls -la'
$ ssh user@hostname 'df -h && free -h'

# Connect with X11 forwarding (GUI apps)
$ ssh -X user@hostname
$ ssh -Y user@hostname      # Trusted X11 forwarding

# Example connection output:
$ ssh john@192.168.1.100
The authenticity of host '192.168.1.100 (192.168.1.100)' can't be established.
ECDSA key fingerprint is SHA256:abc123def456...
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.1.100' (ECDSA) to the list of known hosts.
john@192.168.1.100's password:
Last login: Mon Dec 15 10:30:15 2023 from 192.168.1.50
john@server:~$
```

### SSH Key Generation and Management

```bash
# Generate SSH key pair (RSA)
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
Generating public/private rsa key pair.
Enter file in which to save the key (/home/user/.ssh/id_rsa):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/user/.ssh/id_rsa
Your public key has been saved in /home/user/.ssh/id_rsa.pub

# Generate Ed25519 key (more secure, recommended)
$ ssh-keygen -t ed25519 -C "your_email@example.com"

# Generate key with custom filename
$ ssh-keygen -t ed25519 -f ~/.ssh/server_key -C "server access key"

# List SSH keys
$ ls -la ~/.ssh/
total 16
drwx------ 2 user user 4096 Dec 15 10:30 .
drwxr-xr-x 5 user user 4096 Dec 15 10:29 ..
-rw------- 1 user user  411 Dec 15 10:30 id_ed25519
-rw-r--r-- 1 user user   99 Dec 15 10:30 id_ed25519.pub
-rw-r--r-- 1 user user  222 Dec 15 10:25 known_hosts

# View public key
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGq... your_email@example.com

# Copy public key to server
$ ssh-copy-id user@hostname
$ ssh-copy-id -i ~/.ssh/id_ed25519.pub user@hostname

# Manual key installation
$ cat ~/.ssh/id_ed25519.pub | ssh user@hostname 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'

# Set proper permissions
$ chmod 700 ~/.ssh
$ chmod 600 ~/.ssh/id_ed25519
$ chmod 644 ~/.ssh/id_ed25519.pub
$ chmod 600 ~/.ssh/authorized_keys
```

### SSH Configuration

```bash
# User SSH config file
$ nano ~/.ssh/config

# Example configuration:
Host server1
    HostName 192.168.1.100
    User john
    Port 2222
    IdentityFile ~/.ssh/server1_key
    IdentitiesOnly yes

Host *.example.com
    User admin
    Port 22
    IdentityFile ~/.ssh/company_key
    ForwardAgent yes

Host bastion
    HostName bastion.example.com
    User jumpuser
    Port 22
    IdentityFile ~/.ssh/bastion_key

Host internal-server
    HostName 10.0.1.100
    User admin
    ProxyJump bastion
    IdentityFile ~/.ssh/internal_key

# Global SSH client config
$ sudo nano /etc/ssh/ssh_config

# Common client settings:
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
    Compression yes
    ControlMaster auto
    ControlPath ~/.ssh/master-%r@%h:%p
    ControlPersist 10m

# Connect using config
$ ssh server1                # Uses config settings
$ ssh internal-server        # Automatically uses bastion as jump host
```

## 🛡️ SSH Server Configuration and Hardening

### SSH Server Configuration

```bash
# Edit SSH server config
$ sudo nano /etc/ssh/sshd_config

# Security hardening settings:
Port 2222                          # Change default port
Protocol 2                         # Use SSH protocol 2 only
PermitRootLogin no                 # Disable root login
PasswordAuthentication no          # Disable password auth
PubkeyAuthentication yes           # Enable key-based auth
AuthenticationMethods publickey    # Require public key auth
PermitEmptyPasswords no            # No empty passwords
MaxAuthTries 3                     # Limit auth attempts
MaxSessions 2                      # Limit concurrent sessions
MaxStartups 2                      # Limit connection attempts

# User and group restrictions
AllowUsers john jane admin        # Only allow specific users
DenyUsers guest nobody             # Deny specific users
AllowGroups ssh-users admin       # Only allow specific groups
DenyGroups guests                  # Deny specific groups

# Network settings
ListenAddress 0.0.0.0             # Listen on all interfaces
ListenAddress 192.168.1.100       # Listen on specific IP
AddressFamily inet                 # IPv4 only (or inet6 for IPv6)
TCPKeepAlive yes
ClientAliveInterval 300            # Send keepalive every 5 minutes
ClientAliveCountMax 2              # Disconnect after 2 failed keepalives

# Logging
LogLevel VERBOSE                   # Detailed logging
SyslogFacility AUTH               # Log to auth facility

# Disable dangerous features
X11Forwarding no                   # Disable X11 forwarding
AllowTcpForwarding no             # Disable TCP forwarding
GatewayPorts no                   # Disable gateway ports
PermitTunnel no                   # Disable tunneling

# Banner and MOTD
Banner /etc/ssh/banner            # Display banner before login
PrintMotd yes                     # Show message of the day

# Restart SSH service after changes
$ sudo systemctl restart sshd
$ sudo systemctl status sshd

# Test configuration
$ sudo sshd -t                    # Test config syntax
$ sudo sshd -T                    # Show effective configuration
```

### SSH Security Best Practices

```bash
# Create SSH banner
$ sudo nano /etc/ssh/banner
***************************************************************************
                    AUTHORIZED ACCESS ONLY
***************************************************************************
This system is for authorized users only. All activities are monitored
and logged. Unauthorized access is prohibited and will be prosecuted.
***************************************************************************

# Monitor SSH connections
$ sudo tail -f /var/log/auth.log | grep sshd
$ sudo journalctl -u sshd -f

# Check failed login attempts
$ sudo grep "Failed password" /var/log/auth.log
$ sudo lastb                      # Show failed logins

# Check successful logins
$ sudo last                       # Show successful logins
$ w                               # Show current users
$ who                             # Show logged-in users

# Install and configure fail2ban
$ sudo apt install fail2ban
$ sudo nano /etc/fail2ban/jail.local

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

$ sudo systemctl restart fail2ban
$ sudo fail2ban-client status sshd
```

## 📁 Secure File Transfers

### SCP (Secure Copy)

```bash
# Copy file to remote server
$ scp file.txt user@hostname:/path/to/destination/
$ scp -P 2222 file.txt user@hostname:/home/user/  # Custom port

# Copy file from remote server
$ scp user@hostname:/path/to/file.txt ./
$ scp user@hostname:/path/to/file.txt /local/path/

# Copy directory recursively
$ scp -r /local/directory user@hostname:/remote/path/
$ scp -r user@hostname:/remote/directory ./

# Copy with compression
$ scp -C large_file.tar.gz user@hostname:/tmp/

# Copy preserving permissions and timestamps
$ scp -p file.txt user@hostname:/path/

# Copy multiple files
$ scp file1.txt file2.txt user@hostname:/path/
$ scp *.txt user@hostname:/path/

# Copy with progress and verbose output
$ scp -v file.txt user@hostname:/path/

# Copy through jump host
$ scp -o ProxyJump=bastion file.txt user@target:/path/
```

### SFTP (SSH File Transfer Protocol)

```bash
# Connect to SFTP server
$ sftp user@hostname
$ sftp -P 2222 user@hostname      # Custom port

sftp> help                        # Show available commands
sftp> pwd                         # Show remote working directory
sftp> lpwd                        # Show local working directory
sftp> ls                          # List remote files
sftp> lls                         # List local files
sftp> cd /path/to/directory       # Change remote directory
sftp> lcd /local/path             # Change local directory

# File operations
sftp> get remote_file.txt         # Download file
sftp> get -r remote_directory     # Download directory recursively
sftp> put local_file.txt          # Upload file
sftp> put -r local_directory      # Upload directory recursively
sftp> mget *.txt                  # Download multiple files
sftp> mput *.txt                  # Upload multiple files

# File management
sftp> mkdir new_directory         # Create remote directory
sftp> rmdir directory             # Remove remote directory
sftp> rm file.txt                 # Delete remote file
sftp> rename old.txt new.txt      # Rename remote file
sftp> chmod 644 file.txt          # Change remote file permissions

sftp> quit                        # Exit SFTP

# Batch SFTP operations
$ echo -e "cd /remote/path\nput file.txt\nquit" | sftp user@hostname

# SFTP with script file
$ nano sftp_commands.txt
cd /remote/path
put *.txt
get *.log
quit

$ sftp -b sftp_commands.txt user@hostname
```

### Rsync over SSH

```bash
# Basic rsync over SSH
$ rsync -avz /local/path/ user@hostname:/remote/path/
$ rsync -avz user@hostname:/remote/path/ /local/path/

# Rsync options explained:
# -a: archive mode (preserves permissions, timestamps, etc.)
# -v: verbose output
# -z: compress data during transfer
# -h: human-readable output
# -P: show progress and keep partial files
# --delete: delete files in destination that don't exist in source

# Sync with progress and delete
$ rsync -avzP --delete /local/path/ user@hostname:/remote/path/

# Exclude files and directories
$ rsync -avz --exclude='*.log' --exclude='tmp/' /local/path/ user@hostname:/remote/path/

# Dry run (test without making changes)
$ rsync -avzn /local/path/ user@hostname:/remote/path/

# Rsync with custom SSH port
$ rsync -avz -e 'ssh -p 2222' /local/path/ user@hostname:/remote/path/

# Rsync with bandwidth limit
$ rsync -avz --bwlimit=1000 /local/path/ user@hostname:/remote/path/

# Backup script using rsync
#!/bin/bash
SOURCE="/home/user/documents"
DEST="backup@server:/backups/$(hostname)"
LOGFILE="/var/log/backup.log"

echo "[$(date)] Starting backup" >> $LOGFILE
rsync -avz --delete --log-file=$LOGFILE $SOURCE $DEST
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully" >> $LOGFILE
else
    echo "[$(date)] Backup failed" >> $LOGFILE
fi
```

## 🌐 SSH Tunneling and Port Forwarding

### Local Port Forwarding

```bash
# Forward local port to remote service
$ ssh -L 8080:localhost:80 user@hostname
# Access remote web server at http://localhost:8080

# Forward to different remote host
$ ssh -L 3306:database.internal:3306 user@gateway
# Access internal database at localhost:3306

# Multiple port forwards
$ ssh -L 8080:web.internal:80 -L 3306:db.internal:3306 user@gateway

# Background tunnel
$ ssh -f -N -L 8080:localhost:80 user@hostname
# -f: run in background
# -N: don't execute remote command

# Example: Access internal web application
$ ssh -L 8080:intranet.company.com:80 user@gateway.company.com
# Now browse to http://localhost:8080
```

### Remote Port Forwarding

```bash
# Forward remote port to local service
$ ssh -R 8080:localhost:80 user@hostname
# Remote users can access your local web server via hostname:8080

# Forward to different local host
$ ssh -R 3306:database.local:3306 user@remote

# Example: Share local development server
$ ssh -R 8080:localhost:3000 user@public-server
# Others can access your dev server at public-server:8080

# Persistent remote tunnel
$ ssh -f -N -R 8080:localhost:80 user@hostname
```

### Dynamic Port Forwarding (SOCKS Proxy)

```bash
# Create SOCKS proxy
$ ssh -D 1080 user@hostname
# Configure browser to use localhost:1080 as SOCKS proxy

# Background SOCKS proxy
$ ssh -f -N -D 1080 user@hostname

# Use with curl
$ curl --socks5 localhost:1080 http://internal.website.com

# Configure Firefox for SOCKS proxy:
# Preferences > Network Settings > Manual proxy configuration
# SOCKS Host: localhost, Port: 1080, SOCKS v5
```

### SSH Jump Hosts (ProxyJump)

```bash
# Connect through jump host
$ ssh -J jumphost user@target
$ ssh -J user1@jump1,user2@jump2 user@target  # Multiple jumps

# Using ProxyCommand (older method)
$ ssh -o ProxyCommand="ssh -W %h:%p user@jumphost" user@target

# Configure in ~/.ssh/config
Host target-server
    HostName 10.0.1.100
    User admin
    ProxyJump jumphost

Host jumphost
    HostName jump.example.com
    User jumpuser
    Port 22

# Now simply:
$ ssh target-server
```

## 🔧 SSH Agent and Key Management

### SSH Agent

```bash
# Start SSH agent
$ eval $(ssh-agent)
Agent pid 12345

# Add keys to agent
$ ssh-add ~/.ssh/id_ed25519
Enter passphrase for /home/user/.ssh/id_ed25519:
Identity added: /home/user/.ssh/id_ed25519 (user@hostname)

# Add all keys
$ ssh-add

# List loaded keys
$ ssh-add -l
256 SHA256:abc123... user@hostname (ED25519)

# Remove key from agent
$ ssh-add -d ~/.ssh/id_ed25519

# Remove all keys
$ ssh-add -D

# Kill SSH agent
$ ssh-agent -k

# Auto-start SSH agent in ~/.bashrc
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval $(ssh-agent -s)
    ssh-add ~/.ssh/id_ed25519
fi
```

### SSH Agent Forwarding

```bash
# Enable agent forwarding
$ ssh -A user@hostname

# Configure in ~/.ssh/config
Host *
    ForwardAgent yes

# Test agent forwarding
$ ssh server1
user@server1:~$ ssh server2  # Uses forwarded agent

# Security note: Only use agent forwarding with trusted hosts
```

### Key Management Best Practices

```bash
# Use different keys for different purposes
$ ssh-keygen -t ed25519 -f ~/.ssh/work_key -C "work access"
$ ssh-keygen -t ed25519 -f ~/.ssh/personal_key -C "personal servers"
$ ssh-keygen -t ed25519 -f ~/.ssh/github_key -C "github access"

# Configure specific keys in ~/.ssh/config
Host work-server
    HostName work.example.com
    User admin
    IdentityFile ~/.ssh/work_key
    IdentitiesOnly yes

Host github.com
    User git
    IdentityFile ~/.ssh/github_key
    IdentitiesOnly yes

# Rotate keys regularly
$ ssh-keygen -t ed25519 -f ~/.ssh/new_key
$ ssh-copy-id -i ~/.ssh/new_key.pub user@hostname
# Test new key, then remove old key from server

# Backup keys securely
$ tar -czf ssh_keys_backup.tar.gz ~/.ssh/
$ gpg -c ssh_keys_backup.tar.gz  # Encrypt backup
```

## 🔍 Troubleshooting SSH

### Common SSH Issues

```bash
# Connection refused
$ ssh -v user@hostname
# Check if SSH service is running on target
$ sudo systemctl status sshd
$ sudo netstat -tlnp | grep :22

# Permission denied (publickey)
# Check key permissions
$ ls -la ~/.ssh/
$ chmod 700 ~/.ssh
$ chmod 600 ~/.ssh/id_ed25519
$ chmod 644 ~/.ssh/id_ed25519.pub

# Check server-side authorized_keys
$ ssh user@hostname
$ ls -la ~/.ssh/authorized_keys
$ chmod 600 ~/.ssh/authorized_keys

# Host key verification failed
$ ssh-keygen -R hostname        # Remove old host key
$ ssh-keyscan hostname >> ~/.ssh/known_hosts  # Add new key

# Connection timeout
# Check firewall rules
$ sudo ufw status
$ sudo iptables -L

# Check network connectivity
$ ping hostname
$ telnet hostname 22
$ nmap -p 22 hostname

# Too many authentication failures
$ ssh -o IdentitiesOnly=yes -i ~/.ssh/specific_key user@hostname

# Debug SSH connection
$ ssh -vvv user@hostname 2>&1 | tee ssh_debug.log
```

### SSH Server Troubleshooting

```bash
# Check SSH server configuration
$ sudo sshd -t                  # Test config syntax
$ sudo sshd -T                  # Show effective config

# Check SSH server logs
$ sudo journalctl -u sshd -f
$ sudo tail -f /var/log/auth.log | grep sshd

# Check listening ports
$ sudo netstat -tlnp | grep sshd
$ sudo ss -tlnp | grep sshd

# Restart SSH service
$ sudo systemctl restart sshd
$ sudo systemctl status sshd

# Check SSH process
$ ps aux | grep sshd

# Test SSH from localhost
$ ssh localhost
$ ssh -p 22 127.0.0.1
```

### Network Diagnostics

```bash
# Test SSH port connectivity
$ nc -zv hostname 22
$ telnet hostname 22
$ nmap -p 22 hostname

# Trace route to SSH server
$ traceroute hostname
$ mtr hostname

# Check DNS resolution
$ nslookup hostname
$ dig hostname

# Test with different SSH client options
$ ssh -o ConnectTimeout=10 user@hostname
$ ssh -o ServerAliveInterval=60 user@hostname
$ ssh -4 user@hostname          # Force IPv4
$ ssh -6 user@hostname          # Force IPv6
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between SSH local and remote port forwarding?**
   <details>
   <summary>Answer</summary>
   
   Local forwarding (`-L`) forwards a local port to a remote service, while remote forwarding (`-R`) forwards a remote port to a local service.
   </details>

2. **How do you create an SSH tunnel that runs in the background?**
   <details>
   <summary>Answer</summary>
   
   Use `ssh -f -N -L localport:remotehost:remoteport user@hostname` where `-f` runs in background and `-N` doesn't execute commands.
   </details>

3. **What's the most secure SSH key type to use?**
   <details>
   <summary>Answer</summary>
   
   Ed25519 (`ssh-keygen -t ed25519`) is currently the most secure and efficient option.
   </details>

4. **How do you disable password authentication and only allow key-based auth?**
   <details>
   <summary>Answer</summary>
   
   Set `PasswordAuthentication no` and `PubkeyAuthentication yes` in `/etc/ssh/sshd_config`, then restart sshd.
   </details>

### Hands-On Challenges

**Challenge 1: SSH Hardening**
```bash
# Secure an SSH server by:
# - Changing the default port
# - Disabling root login
# - Setting up key-based authentication only
# - Configuring fail2ban
# - Setting up proper logging and monitoring
```

**Challenge 2: SSH Tunnel Setup**
```bash
# Create a setup where:
# - You access an internal web application through SSH tunnel
# - Set up a SOCKS proxy for browsing internal networks
# - Configure persistent tunnels that auto-reconnect
# - Use jump hosts to reach internal servers
```

**Challenge 3: Automated File Sync**
```bash
# Create a system that:
# - Syncs files between multiple servers using rsync over SSH
# - Implements proper error handling and logging
# - Runs automatically via cron
# - Sends notifications on success/failure
# - Handles network interruptions gracefully
```

## 🚀 Next Steps

Excellent! You've mastered SSH and secure remote access. You can now:
- Set up secure SSH connections with key-based authentication
- Configure and harden SSH servers
- Transfer files securely using SCP, SFTP, and rsync
- Create SSH tunnels for secure access to internal services
- Troubleshoot SSH connection issues
- Manage SSH keys and agents effectively

**Ready for web services?** Continue to [08-web-services.md](08-web-services.md) to learn about setting up and managing web servers and services.

---

> **Pro Tip**: Always use key-based authentication, keep your SSH keys secure, and regularly rotate them. Use SSH agent forwarding carefully and only with trusted hosts. Monitor SSH logs for security threats and implement proper access controls! 🔐