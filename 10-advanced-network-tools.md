# 🔬 Advanced Network Tools: Professional Diagnostics

> **Master nmap, tcpdump, wireshark, iptables, and advanced network analysis techniques**

## 📖 What You'll Learn

Advanced network tools provide deep insights into network behavior, security, and performance. This chapter covers professional-grade utilities used by network administrators, security professionals, and system engineers:

- Network scanning and discovery with `nmap`
- Packet capture and analysis with `tcpdump` and `wireshark`
- Firewall management with `iptables` and `ufw`
- Network performance testing with `iperf3` and `mtr`
- Advanced troubleshooting techniques
- Security scanning and vulnerability assessment

## 🌍 Why This Matters

**Professional applications:**
- **Security**: Identify open ports, services, and vulnerabilities
- **Performance**: Analyze network bottlenecks and optimize traffic
- **Troubleshooting**: Deep packet inspection for complex issues
- **Monitoring**: Real-time network traffic analysis
- **Compliance**: Network security auditing and documentation

## 🗺️ Network Discovery with `nmap`

### Basic `nmap` Usage

`nmap` (Network Mapper) is the most powerful network discovery and security auditing tool:

```bash
# Basic host discovery
$ nmap 192.168.1.1
Starting Nmap 7.80 ( https://nmap.org )
Nmap scan report for router.local (192.168.1.1)
Host is up (0.001s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
80/tcp   open  http
443/tcp  open  https

# Scan multiple hosts
$ nmap 192.168.1.1-10
$ nmap 192.168.1.0/24
$ nmap google.com facebook.com

# Quick scan (top 100 ports)
$ nmap -F 192.168.1.1

# Scan all 65535 ports
$ nmap -p- 192.168.1.1

# Scan specific ports
$ nmap -p 22,80,443 192.168.1.1
$ nmap -p 1-1000 192.168.1.1
```

### Advanced `nmap` Scanning

```bash
# TCP SYN scan (default, fast and stealthy)
$ nmap -sS 192.168.1.1

# TCP connect scan (when SYN scan not possible)
$ nmap -sT 192.168.1.1

# UDP scan (slower but important)
$ nmap -sU 192.168.1.1

# Service version detection
$ nmap -sV 192.168.1.1
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp open  http    Apache httpd 2.4.41

# Operating system detection
$ nmap -O 192.168.1.1
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.6

# Aggressive scan (OS, version, script, traceroute)
$ nmap -A 192.168.1.1

# Script scanning
$ nmap --script vuln 192.168.1.1
$ nmap --script http-enum 192.168.1.1
$ nmap --script ssl-cert 192.168.1.1
```

### Network Discovery Techniques

```bash
# Ping scan (discover live hosts)
$ nmap -sn 192.168.1.0/24
Nmap scan report for 192.168.1.1
Host is up (0.001s latency).
Nmap scan report for 192.168.1.100
Host is up (0.002s latency).
Nmap scan report for 192.168.1.150
Host is up (0.003s latency).

# ARP scan (local network only)
$ nmap -PR 192.168.1.0/24

# List scan (just list targets, no scanning)
$ nmap -sL 192.168.1.0/24

# Top ports scan
$ nmap --top-ports 1000 192.168.1.1

# Fast scan with service detection
$ nmap -sV -T4 -F 192.168.1.1

# Stealth scan (avoid detection)
$ nmap -sS -T2 -f 192.168.1.1
```

### Practical `nmap` Examples

```bash
# Web server analysis
$ nmap -p 80,443 --script http-title,http-headers google.com

# SSH server analysis
$ nmap -p 22 --script ssh-hostkey,ssh-auth-methods 192.168.1.1

# SMB/NetBIOS analysis
$ nmap -p 139,445 --script smb-os-discovery 192.168.1.1

# Database server scan
$ nmap -p 3306,5432,1433 --script mysql-info,pgsql-info 192.168.1.1

# Vulnerability scanning
$ nmap --script vuln --script-args=unsafe=1 192.168.1.1

# Save results to file
$ nmap -oN scan_results.txt 192.168.1.0/24
$ nmap -oX scan_results.xml 192.168.1.0/24
```

## 📦 Packet Capture with `tcpdump`

### Basic `tcpdump` Usage

`tcpdump` captures and analyzes network packets in real-time:

```bash
# Capture all traffic on interface
$ sudo tcpdump -i eth0
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
10:30:00.123456 IP 192.168.1.100.54321 > 8.8.8.8.53: UDP, length 32
10:30:00.125678 IP 8.8.8.8.53 > 192.168.1.100.54321: UDP, length 48

# Capture specific number of packets
$ sudo tcpdump -i eth0 -c 10

# Capture to file
$ sudo tcpdump -i eth0 -w capture.pcap

# Read from file
$ tcpdump -r capture.pcap

# More verbose output
$ sudo tcpdump -i eth0 -v
$ sudo tcpdump -i eth0 -vv
$ sudo tcpdump -i eth0 -vvv
```

### Advanced `tcpdump` Filtering

```bash
# Filter by host
$ sudo tcpdump -i eth0 host 192.168.1.100
$ sudo tcpdump -i eth0 src 192.168.1.100
$ sudo tcpdump -i eth0 dst 192.168.1.100

# Filter by port
$ sudo tcpdump -i eth0 port 80
$ sudo tcpdump -i eth0 src port 80
$ sudo tcpdump -i eth0 dst port 80

# Filter by protocol
$ sudo tcpdump -i eth0 tcp
$ sudo tcpdump -i eth0 udp
$ sudo tcpdump -i eth0 icmp

# Complex filters
$ sudo tcpdump -i eth0 'tcp port 80 and host 192.168.1.100'
$ sudo tcpdump -i eth0 'udp port 53 or tcp port 80'
$ sudo tcpdump -i eth0 'not port 22'

# HTTP traffic analysis
$ sudo tcpdump -i eth0 -A 'tcp port 80'
$ sudo tcpdump -i eth0 -s 0 -A 'tcp port 80 and (tcp[tcpflags] & tcp-push != 0)'
```

### Practical `tcpdump` Examples

```bash
# Monitor DNS queries
$ sudo tcpdump -i eth0 -n 'udp port 53'
10:30:00.123 IP 192.168.1.100.54321 > 8.8.8.8.53: 12345+ A? google.com. (28)
10:30:00.125 IP 8.8.8.8.53 > 192.168.1.100.54321: 12345 1/0/0 A 142.250.191.14 (44)

# Monitor HTTP requests
$ sudo tcpdump -i eth0 -A -s 1500 'tcp port 80 and (tcp[tcpflags] & tcp-push != 0)'

# Monitor SSH connections
$ sudo tcpdump -i eth0 'tcp port 22'

# Monitor specific subnet
$ sudo tcpdump -i eth0 'net 192.168.1.0/24'

# Monitor large packets (potential issues)
$ sudo tcpdump -i eth0 'greater 1000'

# Monitor SYN packets (connection attempts)
$ sudo tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'

# Save and rotate capture files
$ sudo tcpdump -i eth0 -w capture-%Y%m%d-%H%M%S.pcap -G 3600 -C 100
```

### Analyzing Captured Traffic

```bash
# Basic statistics
$ tcpdump -r capture.pcap | wc -l  # Count packets

# Protocol distribution
$ tcpdump -r capture.pcap -n | awk '{print $3}' | cut -d'.' -f1-4 | sort | uniq -c | sort -nr

# Top talkers
$ tcpdump -r capture.pcap -n | awk '{print $3}' | cut -d'.' -f1-4 | sort | uniq -c | sort -nr | head -10

# Extract HTTP requests
$ tcpdump -r capture.pcap -A | grep -E 'GET|POST|PUT|DELETE'

# Find specific patterns
$ tcpdump -r capture.pcap -A | grep -i 'password\|login\|auth'
```

## 🔍 Advanced Analysis with `wireshark`

### Command-line Wireshark (`tshark`)

```bash
# Basic capture
$ tshark -i eth0

# Capture with display filter
$ tshark -i eth0 -f "tcp port 80"

# Capture to file
$ tshark -i eth0 -w capture.pcapng

# Read and analyze file
$ tshark -r capture.pcapng

# Protocol statistics
$ tshark -r capture.pcapng -q -z io,phs

# Conversation statistics
$ tshark -r capture.pcapng -q -z conv,tcp
$ tshark -r capture.pcapng -q -z conv,udp

# HTTP statistics
$ tshark -r capture.pcapng -q -z http,stat
$ tshark -r capture.pcapng -q -z http,tree
```

### Advanced `tshark` Analysis

```bash
# Extract specific fields
$ tshark -r capture.pcapng -T fields -e ip.src -e ip.dst -e tcp.port

# Filter and extract HTTP data
$ tshark -r capture.pcapng -Y "http.request" -T fields -e http.host -e http.request.uri

# DNS analysis
$ tshark -r capture.pcapng -Y "dns" -T fields -e dns.qry.name -e dns.resp.addr

# SSL/TLS analysis
$ tshark -r capture.pcapng -Y "ssl.handshake.type == 1" -T fields -e ip.src -e ssl.handshake.extensions_server_name

# Export objects
$ tshark -r capture.pcapng --export-objects http,/tmp/http_objects/

# Follow TCP streams
$ tshark -r capture.pcapng -q -z follow,tcp,ascii,0
```

## 🛡️ Firewall Management

### Using `iptables`

```bash
# View current rules
$ sudo iptables -L
$ sudo iptables -L -n -v  # Numerical, verbose

Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     all  --  anywhere             anywhere
INPUT_direct  all  --  anywhere             anywhere

# View specific chain
$ sudo iptables -L INPUT
$ sudo iptables -L OUTPUT
$ sudo iptables -L FORWARD

# View with line numbers
$ sudo iptables -L --line-numbers
```

### Basic `iptables` Rules

```bash
# Allow SSH (port 22)
$ sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
$ sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
$ sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow from specific IP
$ sudo iptables -A INPUT -s 192.168.1.100 -j ACCEPT

# Block specific IP
$ sudo iptables -A INPUT -s 192.168.1.200 -j DROP

# Allow loopback
$ sudo iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
$ sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Set default policies
$ sudo iptables -P INPUT DROP
$ sudo iptables -P FORWARD DROP
$ sudo iptables -P OUTPUT ACCEPT
```

### Advanced `iptables` Usage

```bash
# Rate limiting (prevent DoS)
$ sudo iptables -A INPUT -p tcp --dport 22 -m limit --limit 3/min --limit-burst 3 -j ACCEPT

# Port forwarding
$ sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 80

# NAT (masquerading)
$ sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Log dropped packets
$ sudo iptables -A INPUT -j LOG --log-prefix "DROPPED: "
$ sudo iptables -A INPUT -j DROP

# Delete specific rule
$ sudo iptables -D INPUT 3  # Delete rule number 3
$ sudo iptables -D INPUT -p tcp --dport 80 -j ACCEPT  # Delete specific rule

# Flush all rules
$ sudo iptables -F
$ sudo iptables -t nat -F

# Save and restore rules
$ sudo iptables-save > /etc/iptables/rules.v4
$ sudo iptables-restore < /etc/iptables/rules.v4
```

### Using `ufw` (Uncomplicated Firewall)

```bash
# Enable/disable firewall
$ sudo ufw enable
$ sudo ufw disable

# Check status
$ sudo ufw status
$ sudo ufw status verbose
$ sudo ufw status numbered

# Basic rules
$ sudo ufw allow 22
$ sudo ufw allow ssh
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp

# Allow from specific IP
$ sudo ufw allow from 192.168.1.100
$ sudo ufw allow from 192.168.1.0/24

# Allow to specific port from specific IP
$ sudo ufw allow from 192.168.1.100 to any port 22

# Deny rules
$ sudo ufw deny 23
$ sudo ufw deny from 192.168.1.200

# Delete rules
$ sudo ufw delete allow 80
$ sudo ufw delete 3  # Delete rule number 3

# Reset firewall
$ sudo ufw --force reset
```

## 📊 Network Performance Testing

### Using `iperf3`

```bash
# Server mode (on target machine)
$ iperf3 -s
-----------------------------------------------------------
Server listening on 5201
-----------------------------------------------------------

# Client mode (test bandwidth)
$ iperf3 -c 192.168.1.100
Connecting to host 192.168.1.100, port 5201
[  5] local 192.168.1.200 port 54321 connected to 192.168.1.100 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  112 MBytes   941 Mbits/sec    0    408 KBytes
[  5]   1.00-2.00   sec  112 MBytes   941 Mbits/sec    0    408 KBytes
...
[  5]   0.00-10.00  sec  1.10 GBytes   941 Mbits/sec    0             sender
[  5]   0.00-10.04  sec  1.10 GBytes   938 Mbits/sec                  receiver

# UDP test
$ iperf3 -c 192.168.1.100 -u

# Reverse test (server sends to client)
$ iperf3 -c 192.168.1.100 -R

# Bidirectional test
$ iperf3 -c 192.168.1.100 --bidir

# Custom duration and parallel streams
$ iperf3 -c 192.168.1.100 -t 60 -P 4

# Test specific bandwidth
$ iperf3 -c 192.168.1.100 -u -b 100M
```

### Using `mtr` (My Traceroute)

```bash
# Real-time traceroute with statistics
$ mtr google.com
                             My traceroute  [v0.93]
host (192.168.1.100)                    2023-12-15T10:30:00+0000
Keys:  Help   Display mode   Restart statistics   Order of fields   quit
                                           Packets               Pings
 Host                                    Loss%   Snt   Last   Avg  Best  Wrst StDev
 1. 192.168.1.1                          0.0%    10    1.2   1.3   1.1   1.8   0.2
 2. 10.0.0.1                             0.0%    10    5.4   5.6   5.2   6.1   0.3
 3. 203.0.113.1                          0.0%    10   12.3  12.5  12.1  13.2   0.4
 4. google.com                           0.0%    10   15.6  15.8  15.4  16.5   0.3

# Report mode (non-interactive)
$ mtr --report --report-cycles 10 google.com

# Show IP addresses only
$ mtr -n google.com

# Show both hostnames and IPs
$ mtr -b google.com

# UDP mode
$ mtr -u google.com

# TCP mode
$ mtr -T google.com
```

## 🔧 Advanced Troubleshooting Techniques

### Network Latency Analysis

```bash
#!/bin/bash
# latency-test.sh - Comprehensive latency analysis

TARGET="$1"
if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target>"
    exit 1
fi

echo "=== Latency Analysis for $TARGET ==="
echo

# Basic ping test
echo "1. Basic Connectivity:"
ping -c 4 "$TARGET" | tail -1
echo

# Detailed ping statistics
echo "2. Detailed Ping Statistics:"
ping -c 20 "$TARGET" | grep -E 'min/avg/max'
echo

# MTR analysis
echo "3. Path Analysis (MTR):"
mtr --report --report-cycles 5 "$TARGET"
echo

# Traceroute comparison
echo "4. Traceroute Analysis:"
traceroute "$TARGET" 2>/dev/null | tail -5
echo

echo "=== Analysis Complete ==="
```

### Bandwidth Testing Script

```bash
#!/bin/bash
# bandwidth-test.sh - Multi-target bandwidth testing

TEST_SERVERS=(
    "iperf.scottlinux.com"
    "ping.online.net"
    "bouygues.iperf.fr"
)

echo "=== Bandwidth Testing ==="
echo

for server in "${TEST_SERVERS[@]}"; do
    echo "Testing against $server:"
    timeout 15 iperf3 -c "$server" -t 10 2>/dev/null | grep -E 'sender|receiver' || echo "Failed to connect"
    echo
    sleep 2
done

echo "=== Testing Complete ==="
```

### Security Scanning Script

```bash
#!/bin/bash
# security-scan.sh - Basic security assessment

TARGET="$1"
if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target>"
    exit 1
fi

echo "=== Security Scan for $TARGET ==="
echo

# Host discovery
echo "1. Host Discovery:"
nmap -sn "$TARGET" 2>/dev/null | grep -E 'Nmap scan report|Host is up'
echo

# Port scan
echo "2. Open Ports:"
nmap -F "$TARGET" 2>/dev/null | grep -E 'open|filtered'
echo

# Service detection
echo "3. Service Detection:"
nmap -sV --top-ports 100 "$TARGET" 2>/dev/null | grep -E 'open.*tcp'
echo

# Basic vulnerability check
echo "4. Basic Vulnerability Check:"
nmap --script vuln --top-ports 100 "$TARGET" 2>/dev/null | grep -E 'VULNERABLE|CVE'
echo

echo "=== Scan Complete ==="
echo "Note: This is a basic scan. Use professional tools for comprehensive security assessment."
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between `nmap -sS` and `nmap -sT`?**
   <details>
   <summary>Answer</summary>
   
   `-sS` performs a SYN scan (half-open scan) which is faster and more stealthy, while `-sT` performs a full TCP connect scan which completes the three-way handshake.
   </details>

2. **How do you capture only HTTP traffic with tcpdump?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   sudo tcpdump -i eth0 'tcp port 80'
   # or for both HTTP and HTTPS
   sudo tcpdump -i eth0 'tcp port 80 or tcp port 443'
   ```
   </details>

3. **What iptables command blocks all traffic from IP 192.168.1.100?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   sudo iptables -A INPUT -s 192.168.1.100 -j DROP
   ```
   </details>

4. **How do you test bidirectional bandwidth with iperf3?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   iperf3 -c server_ip --bidir
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Network Mapping**
```bash
# Map your local network
# Identify all active hosts and their open ports
# Create a network diagram with services
```

**Challenge 2: Traffic Analysis**
```bash
# Capture network traffic for 5 minutes
# Analyze the most active connections
# Identify the protocols being used
```

**Challenge 3: Security Assessment**
```bash
# Perform a security scan of a test system
# Identify potential vulnerabilities
# Create a basic security report
```

## 🚀 Next Steps

Excellent! You've mastered advanced network tools and techniques. You can now:
- Perform comprehensive network discovery and mapping
- Capture and analyze network traffic
- Manage firewalls and security policies
- Test network performance and diagnose issues
- Conduct basic security assessments

**Ready for real-world applications?** Continue to [11-dns-deep-dive.md](11-dns-deep-dive.md) to master DNS configuration, troubleshooting, and security.

---

> **Pro Tip**: Always get proper authorization before scanning networks or systems you don't own. Create a lab environment for practicing these tools safely. Consider setting up virtual machines or containers to practice advanced techniques without affecting production systems! 🔒