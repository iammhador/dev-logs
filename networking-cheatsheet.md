# 🚀 Linux & Networking Command Cheat Sheet

> **Quick reference for essential Linux and networking commands - your go-to guide for daily operations**

## 📋 Table of Contents

- [Basic Linux Commands](#basic-linux-commands)
- [File Operations](#file-operations)
- [System Information](#system-information)
- [Process Management](#process-management)
- [Network Interface Management](#network-interface-management)
- [Connectivity Testing](#connectivity-testing)
- [DNS Operations](#dns-operations)
- [Network Monitoring](#network-monitoring)
- [Firewall Management](#firewall-management)
- [Advanced Network Tools](#advanced-network-tools)
- [Performance Testing](#performance-testing)
- [Security & Scanning](#security--scanning)
- [Troubleshooting Workflows](#troubleshooting-workflows)
- [Common Network Ports](#common-network-ports)
- [IP Address Ranges](#ip-address-ranges)

---

## 🖥️ Basic Linux Commands

### Navigation & File System

```bash
# Directory navigation
pwd                     # Show current directory
ls -la                  # List files with details
cd /path/to/dir         # Change directory
cd ~                    # Go to home directory
cd -                    # Go to previous directory

# File operations
cp file1 file2          # Copy file
mv file1 file2          # Move/rename file
rm file                 # Delete file
rm -rf directory        # Delete directory recursively
mkdir directory         # Create directory
rmdir directory         # Remove empty directory

# File viewing
cat file                # Display file content
less file               # View file with pagination
head -n 10 file         # Show first 10 lines
tail -n 10 file         # Show last 10 lines
tail -f file            # Follow file changes

# File searching
find /path -name "*.txt" # Find files by name
grep "pattern" file      # Search text in file
grep -r "pattern" /dir   # Recursive text search
locate filename         # Find file by name (fast)
```

### Permissions & Ownership

```bash
# View permissions
ls -l file              # Show file permissions
stat file               # Detailed file info

# Change permissions
chmod 755 file          # rwxr-xr-x
chmod u+x file          # Add execute for user
chmod g-w file          # Remove write for group
chmod o=r file          # Set read-only for others

# Change ownership
chown user:group file   # Change owner and group
chown user file         # Change owner only
chgrp group file        # Change group only
sudo chown -R user:group /dir  # Recursive ownership change
```

---

## 📁 File Operations

### Text Processing

```bash
# Text manipulation
cut -d':' -f1 /etc/passwd     # Extract first field
awk '{print $1}' file         # Print first column
sed 's/old/new/g' file        # Replace text
sort file                     # Sort lines
uniq file                     # Remove duplicates
wc -l file                    # Count lines

# File comparison
diff file1 file2              # Compare files
comm file1 file2              # Compare sorted files

# Archives
tar -czf archive.tar.gz dir   # Create compressed archive
tar -xzf archive.tar.gz       # Extract archive
zip -r archive.zip dir        # Create zip archive
unzip archive.zip             # Extract zip
```

### File Transfer

```bash
# Local transfer
cp -r source/ dest/           # Copy directory
rsync -av source/ dest/       # Sync directories

# Remote transfer
scp file user@host:/path      # Copy file to remote
scp user@host:/path file      # Copy file from remote
rsync -av dir/ user@host:/path # Sync to remote

# Download
wget https://example.com/file # Download file
curl -O https://example.com/file # Download with curl
```

---

## 🖥️ System Information

### Hardware & System

```bash
# System info
uname -a                # System information
hostname                # System hostname
uptime                  # System uptime
whoami                  # Current user
id                      # User and group IDs

# Hardware info
lscpu                   # CPU information
lsmem                   # Memory information
lsblk                   # Block devices
lsusb                   # USB devices
lspci                   # PCI devices

# Memory & disk
free -h                 # Memory usage
df -h                   # Disk usage
du -sh /path            # Directory size
```

### Performance Monitoring

```bash
# Process monitoring
top                     # Real-time processes
htop                    # Enhanced process viewer
ps aux                  # All running processes
ps -ef | grep process   # Find specific process

# System load
w                       # Who is logged in and load
vmstat 1                # Virtual memory statistics
iostat 1                # I/O statistics
sar -u 1 10             # CPU usage over time
```

---

## ⚙️ Process Management

### Process Control

```bash
# Start/stop processes
nohup command &         # Run in background
command &               # Run in background
jobs                    # List background jobs
fg %1                   # Bring job to foreground
bg %1                   # Send job to background

# Kill processes
kill PID                # Terminate process
kill -9 PID             # Force kill process
killall process_name    # Kill by name
pkill -f pattern        # Kill by pattern

# Process priority
nice -n 10 command      # Start with lower priority
renice 10 PID           # Change process priority
```

### Service Management

```bash
# Systemd services
sudo systemctl start service    # Start service
sudo systemctl stop service     # Stop service
sudo systemctl restart service  # Restart service
sudo systemctl enable service   # Enable at boot
sudo systemctl disable service  # Disable at boot
sudo systemctl status service   # Check service status
sudo systemctl list-units       # List all services
```

---

## 🌐 Network Interface Management

### Interface Information

```bash
# Modern commands (ip)
ip addr show            # Show all interfaces
ip addr show eth0       # Show specific interface
ip -4 addr show         # Show IPv4 only
ip -6 addr show         # Show IPv6 only
ip link show            # Show link status

# Legacy commands (ifconfig)
ifconfig                # Show all interfaces
ifconfig eth0           # Show specific interface
ifconfig -a             # Show all interfaces (including down)
```

### Interface Configuration

```bash
# Bring interface up/down
sudo ip link set eth0 up
sudo ip link set eth0 down
sudo ifconfig eth0 up
sudo ifconfig eth0 down

# Configure IP address
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip addr del 192.168.1.100/24 dev eth0
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Configure routes
ip route show           # Show routing table
sudo ip route add 10.0.0.0/8 via 192.168.1.1
sudo ip route del 10.0.0.0/8
sudo ip route add default via 192.168.1.1
```

---

## 🏓 Connectivity Testing

### Basic Connectivity

```bash
# Ping tests
ping google.com         # Basic connectivity test
ping -c 4 google.com    # Ping 4 times
ping -i 0.5 google.com  # Ping every 0.5 seconds
ping -s 1000 google.com # Ping with 1000 byte packets
ping6 google.com        # IPv6 ping

# Path tracing
traceroute google.com   # Trace route to destination
traceroute -I google.com # Use ICMP instead of UDP
traceroute -T google.com # Use TCP
traceroute6 google.com  # IPv6 traceroute
mtr google.com          # Real-time traceroute
```

### Port Testing

```bash
# Test port connectivity
telnet google.com 80    # Test TCP port
nc -zv google.com 80    # Test port with netcat
nc -zvu google.com 53   # Test UDP port
timeout 5 bash -c '</dev/tcp/google.com/80' # Bash TCP test

# HTTP testing
curl -I http://google.com       # HTTP headers only
curl -w "%{time_total}" google.com # Show timing
wget --spider google.com        # Test without downloading
```

---

## 🔍 DNS Operations

### DNS Queries

```bash
# Basic DNS lookup
nslookup google.com     # Basic DNS query
dig google.com          # Detailed DNS query
dig +short google.com   # Short answer only
host google.com         # Simple DNS lookup

# Specific record types
dig A google.com        # IPv4 address
dig AAAA google.com     # IPv6 address
dig MX google.com       # Mail exchange
dig NS google.com       # Name servers
dig TXT google.com      # Text records
dig SOA google.com      # Start of authority

# Reverse DNS
dig -x 8.8.8.8          # Reverse lookup
nslookup 8.8.8.8        # Reverse lookup
```

### Advanced DNS

```bash
# DNS tracing
dig +trace google.com   # Trace DNS resolution
dig +trace +additional google.com # Include additional records

# Query specific server
dig @8.8.8.8 google.com # Query Google DNS
dig @1.1.1.1 google.com # Query Cloudflare DNS

# DNS cache management
sudo systemd-resolve --flush-caches # Clear DNS cache
sudo systemctl restart systemd-resolved # Restart DNS service
systemd-resolve --status # Show DNS status
```

---

## 📊 Network Monitoring

### Connection Monitoring

```bash
# Active connections
netstat -tulpn          # All listening ports with processes
netstat -an             # All connections (numerical)
netstat -i              # Interface statistics
netstat -r              # Routing table

# Modern alternative (ss)
ss -tulpn               # All listening ports
ss -an                  # All connections
ss -o state established # Established connections
ss -s                   # Socket statistics
```

### Traffic Analysis

```bash
# Real-time monitoring
iftop                   # Real-time bandwidth usage
nload                   # Network load monitor
bmon                    # Bandwidth monitor
watch -n 1 'cat /proc/net/dev' # Interface statistics

# Packet capture
sudo tcpdump -i eth0    # Capture all traffic
sudo tcpdump -i eth0 port 80 # Capture HTTP traffic
sudo tcpdump -i eth0 host 192.168.1.1 # Capture specific host
sudo tcpdump -w capture.pcap # Save to file
tcpdump -r capture.pcap # Read from file
```

---

## 🛡️ Firewall Management

### iptables

```bash
# View rules
sudo iptables -L        # List all rules
sudo iptables -L -n -v  # Numerical and verbose
sudo iptables -L INPUT  # List INPUT chain

# Basic rules
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT # Allow SSH
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT # Allow HTTP
sudo iptables -A INPUT -s 192.168.1.100 -j ACCEPT # Allow IP
sudo iptables -A INPUT -j DROP # Drop everything else

# Delete rules
sudo iptables -D INPUT 1 # Delete rule number 1
sudo iptables -F        # Flush all rules

# Save/restore
sudo iptables-save > rules.txt
sudo iptables-restore < rules.txt
```

### ufw (Ubuntu Firewall)

```bash
# Basic operations
sudo ufw enable         # Enable firewall
sudo ufw disable        # Disable firewall
sudo ufw status         # Show status
sudo ufw status numbered # Show numbered rules

# Allow/deny rules
sudo ufw allow 22       # Allow SSH
sudo ufw allow ssh      # Allow SSH (by name)
sudo ufw allow 80/tcp   # Allow HTTP
sudo ufw allow from 192.168.1.0/24 # Allow subnet
sudo ufw deny 23        # Deny telnet

# Delete rules
sudo ufw delete allow 80
sudo ufw delete 1       # Delete rule number 1
sudo ufw --force reset  # Reset all rules
```

---

## 🔬 Advanced Network Tools

### Network Scanning (nmap)

```bash
# Host discovery
nmap -sn 192.168.1.0/24 # Ping scan
nmap 192.168.1.1-10     # Scan range
nmap -F 192.168.1.1     # Fast scan (top 100 ports)

# Port scanning
nmap -p 22,80,443 192.168.1.1 # Specific ports
nmap -p- 192.168.1.1    # All ports
nmap -sS 192.168.1.1    # SYN scan
nmap -sU 192.168.1.1    # UDP scan

# Service detection
nmap -sV 192.168.1.1    # Version detection
nmap -O 192.168.1.1     # OS detection
nmap -A 192.168.1.1     # Aggressive scan
nmap --script vuln 192.168.1.1 # Vulnerability scan
```

### Packet Analysis

```bash
# tcpdump filters
sudo tcpdump -i eth0 'tcp port 80' # HTTP traffic
sudo tcpdump -i eth0 'udp port 53'  # DNS traffic
sudo tcpdump -i eth0 'icmp'         # ICMP traffic
sudo tcpdump -i eth0 'host 192.168.1.1' # Specific host
sudo tcpdump -i eth0 'net 192.168.1.0/24' # Subnet

# Wireshark command line (tshark)
tshark -i eth0          # Live capture
tshark -r capture.pcap  # Read file
tshark -Y "http"        # Display filter
tshark -T fields -e ip.src -e ip.dst # Extract fields
```

---

## 📈 Performance Testing

### Bandwidth Testing

```bash
# iperf3 (requires server)
iperf3 -s               # Server mode
iperf3 -c server_ip     # Client mode
iperf3 -c server_ip -u  # UDP test
iperf3 -c server_ip -R  # Reverse test
iperf3 -c server_ip -P 4 # Parallel streams

# Speed test
speedtest-cli           # Internet speed test
wget -O /dev/null http://speedtest.wdc01.softlayer.com/downloads/test100.zip
```

### Latency Testing

```bash
# Continuous monitoring
ping -i 0.2 google.com  # High frequency ping
mtr --report-cycles 100 google.com # MTR report

# Jitter testing
ping -c 100 google.com | grep 'time=' | awk -F'time=' '{print $2}' | awk -F' ' '{print $1}'
```

---

## 🔒 Security & Scanning

### Security Scanning

```bash
# Port scanning
nmap -sS -O target      # Stealth scan with OS detection
nmap --script vuln target # Vulnerability scan
nmap --script safe target # Safe scripts only

# SSL/TLS testing
nmap --script ssl-cert target
nmap --script ssl-enum-ciphers target
openssl s_client -connect target:443

# Web security
nmap --script http-enum target
nmap --script http-vuln* target
curl -I https://target  # Check headers
```

### Network Security

```bash
# Monitor connections
ss -tulpn | grep LISTEN # Listening services
lsof -i                 # Open network files
netstat -an | grep ESTABLISHED # Active connections

# Check for suspicious activity
last                    # Login history
who                     # Currently logged in
w                       # What users are doing
journalctl -f           # System logs
```

---

## 🔧 Troubleshooting Workflows

### Network Connectivity Issues

```bash
# Step 1: Check local interface
ip addr show
ping 127.0.0.1

# Step 2: Check local network
ping $(ip route | grep default | awk '{print $3}')

# Step 3: Check DNS
nslookup google.com
ping 8.8.8.8

# Step 4: Check internet
ping google.com
curl -I http://google.com

# Step 5: Check specific service
telnet target 80
nc -zv target 80
```

### DNS Issues

```bash
# Check DNS configuration
cat /etc/resolv.conf
systemd-resolve --status

# Test different DNS servers
dig @8.8.8.8 domain.com
dig @1.1.1.1 domain.com

# Clear DNS cache
sudo systemd-resolve --flush-caches
sudo systemctl restart systemd-resolved

# Check DNS propagation
dig +trace domain.com
```

### Performance Issues

```bash
# Check bandwidth
iperf3 -c speedtest.server.com
speedtest-cli

# Check latency
ping -c 10 target
mtr --report target

# Check packet loss
ping -c 100 target | grep 'packet loss'

# Check interface errors
ip -s link show
cat /proc/net/dev
```

---

## 🔌 Common Network Ports

### Well-Known Ports

```
20/21   FTP (File Transfer Protocol)
22      SSH (Secure Shell)
23      Telnet
25      SMTP (Simple Mail Transfer Protocol)
53      DNS (Domain Name System)
67/68   DHCP (Dynamic Host Configuration Protocol)
80      HTTP (Hypertext Transfer Protocol)
110     POP3 (Post Office Protocol v3)
143     IMAP (Internet Message Access Protocol)
443     HTTPS (HTTP Secure)
993     IMAPS (IMAP Secure)
995     POP3S (POP3 Secure)
```

### Application Ports

```
3306    MySQL
5432    PostgreSQL
6379    Redis
27017   MongoDB
3389    RDP (Remote Desktop Protocol)
5900    VNC (Virtual Network Computing)
8080    HTTP Alternative
8443    HTTPS Alternative
9200    Elasticsearch
5601    Kibana
```

---

## 🌐 IP Address Ranges

### Private IP Ranges (RFC 1918)

```
10.0.0.0/8        (10.0.0.0 - 10.255.255.255)
172.16.0.0/12     (172.16.0.0 - 172.31.255.255)
192.168.0.0/16    (192.168.0.0 - 192.168.255.255)
```

### Special IP Addresses

```
127.0.0.0/8      Loopback (localhost)
169.254.0.0/16   Link-local (APIPA)
224.0.0.0/4      Multicast
0.0.0.0/0        Default route (any address)
255.255.255.255  Broadcast
```

### Subnet Masks (CIDR)

```
/8  = 255.0.0.0       (16,777,214 hosts)
/16 = 255.255.0.0     (65,534 hosts)
/24 = 255.255.255.0   (254 hosts)
/25 = 255.255.255.128 (126 hosts)
/26 = 255.255.255.192 (62 hosts)
/27 = 255.255.255.224 (30 hosts)
/28 = 255.255.255.240 (14 hosts)
/29 = 255.255.255.248 (6 hosts)
/30 = 255.255.255.252 (2 hosts)
```

---

## 🎯 Quick Reference Scripts

### Network Health Check

```bash
#!/bin/bash
# Quick network health check
echo "=== Network Health Check ==="
echo "Interface Status:"
ip addr show | grep -E '^[0-9]+:|inet '
echo "\nDefault Gateway:"
ip route | grep default
echo "\nDNS Servers:"
cat /etc/resolv.conf | grep nameserver
echo "\nConnectivity Test:"
ping -c 1 8.8.8.8 > /dev/null && echo "✅ Internet OK" || echo "❌ Internet FAIL"
echo "\nDNS Test:"
nslookup google.com > /dev/null && echo "✅ DNS OK" || echo "❌ DNS FAIL"
```

### Port Scanner

```bash
#!/bin/bash
# Simple port scanner
HOST="$1"
for PORT in 22 23 25 53 80 110 143 443 993 995; do
    timeout 1 bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null &&
    echo "Port $PORT: Open" || echo "Port $PORT: Closed"
done
```

### Bandwidth Monitor

```bash
#!/bin/bash
# Simple bandwidth monitor
INTERFACE="eth0"
while true; do
    RX1=$(cat /sys/class/net/$INTERFACE/statistics/rx_bytes)
    TX1=$(cat /sys/class/net/$INTERFACE/statistics/tx_bytes)
    sleep 1
    RX2=$(cat /sys/class/net/$INTERFACE/statistics/rx_bytes)
    TX2=$(cat /sys/class/net/$INTERFACE/statistics/tx_bytes)

    RX_RATE=$(((RX2-RX1)/1024))
    TX_RATE=$(((TX2-TX1)/1024))

    echo "$(date): RX: ${RX_RATE} KB/s, TX: ${TX_RATE} KB/s"
done
```

---

## 💡 Pro Tips

### Command Aliases

```bash
# Add to ~/.bashrc or ~/.zshrc
alias ll='ls -la'
alias la='ls -la'
alias myip='curl -s ifconfig.me'
alias ports='netstat -tulpn'
alias listening='ss -tulpn'
alias connections='ss -tuln'
alias flushdns='sudo systemd-resolve --flush-caches'
alias netcheck='ping -c 4 8.8.8.8 && nslookup google.com'
```

### Useful One-liners

```bash
# Find your public IP
curl -s ifconfig.me
curl -s ipinfo.io/ip

# Show all listening ports
ss -tulpn | grep LISTEN

# Find process using specific port
lsof -i :80
ss -tulpn | grep :80

# Monitor network connections
watch -n 1 'ss -tuln'

# Check if port is open
nc -zv google.com 80

# Quick HTTP test
curl -w "@curl-format.txt" -o /dev/null -s http://example.com

# DNS lookup with timing
time nslookup google.com

# Show routing table
ip route show
route -n

# Monitor interface traffic
watch -n 1 'cat /proc/net/dev'
```

---

> **🎓 Congratulations!** You now have a comprehensive reference for Linux and networking commands. Bookmark this page and refer to it whenever you need quick command syntax or troubleshooting workflows. Practice these commands regularly to build muscle memory and become a networking power user! 🚀

**Remember**: Always test commands in a safe environment first, especially those that modify system configuration. When in doubt, check the man pages (`man command`) for detailed documentation.
