# 🌐 Networking Basics: Core Concepts

> **Understand IP addresses, subnets, protocols, and how devices communicate**

## 📖 What You'll Learn

Networking is the foundation of modern computing. Whether you're troubleshooting connectivity issues, setting up servers, or securing systems, understanding networking fundamentals is essential. This chapter covers:

- IP addressing and subnetting (IPv4 and IPv6)
- MAC addresses and how they work
- Network protocols and the OSI model
- CIDR notation and subnet calculations
- Private vs public IP addresses
- How devices find and communicate with each other

## 🌍 Why This Matters

**Real-world applications:**
- **Web Development**: Understanding how browsers connect to servers
- **System Administration**: Configuring network interfaces and routing
- **DevOps**: Setting up cloud infrastructure and container networking
- **Cybersecurity**: Analyzing network traffic and implementing security
- **Troubleshooting**: Diagnosing connectivity and performance issues

## 🏠 Network Fundamentals

### What is a Network?

A network is a collection of devices that can communicate with each other. Think of it like a postal system:

```
[Your Computer] ←→ [Router] ←→ [Internet] ←→ [Web Server]
      ↓                ↓           ↓          ↓
   Your House    Post Office   Highway    Destination
```

### Network Components

| Component | Purpose | Example |
|-----------|---------|----------|
| **Host** | End device that sends/receives data | Computer, phone, server |
| **Switch** | Connects devices in local network | Office network switch |
| **Router** | Connects different networks | Home router, ISP router |
| **Gateway** | Entry/exit point between networks | Default gateway |
| **Firewall** | Controls network traffic | Hardware/software firewall |

## 📍 IP Addresses: The Internet's Postal System

### IPv4 Addresses

IPv4 addresses are 32-bit numbers written as four octets (0-255):

```bash
# Example IPv4 address
192.168.1.100
# ^^^.^^^.^.^^^
#  |   |  | |
#  |   |  | +-- Host part (100)
#  |   |  +---- Network part
#  |   +------- Network part  
#  +----------- Network part (192.168.1)
```

### IPv4 Address Classes (Historical)

| Class | Range | Default Subnet | Typical Use |
|-------|-------|----------------|-------------|
| A | 1.0.0.0 - 126.255.255.255 | /8 | Large organizations |
| B | 128.0.0.0 - 191.255.255.255 | /16 | Medium organizations |
| C | 192.0.0.0 - 223.255.255.255 | /24 | Small networks |
| D | 224.0.0.0 - 239.255.255.255 | - | Multicast |
| E | 240.0.0.0 - 255.255.255.255 | - | Reserved |

### Private vs Public IP Addresses

**Private IP Ranges (RFC 1918):**
```bash
# These are NOT routed on the internet
10.0.0.0/8        # 10.0.0.0 - 10.255.255.255
172.16.0.0/12     # 172.16.0.0 - 172.31.255.255
192.168.0.0/16    # 192.168.0.0 - 192.168.255.255

# Special addresses
127.0.0.0/8       # Loopback (localhost)
169.254.0.0/16    # Link-local (APIPA)
```

**Public IP Addresses:**
- Globally unique and routable on the internet
- Assigned by Internet Service Providers (ISPs)
- Examples: 8.8.8.8 (Google DNS), 1.1.1.1 (Cloudflare DNS)

### Checking Your IP Addresses

```bash
# Check private IP address
$ ip addr show
# or
$ ifconfig

# Check public IP address
$ curl ifconfig.me
203.0.113.45

# or
$ curl ipinfo.io/ip
203.0.113.45

# Detailed public IP info
$ curl ipinfo.io
{
  "ip": "203.0.113.45",
  "city": "New York",
  "region": "New York",
  "country": "US",
  "org": "AS12345 Example ISP"
}
```

## 🔢 Subnetting and CIDR Notation

### Understanding Subnet Masks

Subnet masks determine which part of an IP address is the network and which part is the host:

```bash
# IP Address:    192.168.1.100
# Subnet Mask:   255.255.255.0
# Network:       192.168.1.0
# Host:          100
# Broadcast:     192.168.1.255
```

### CIDR Notation

CIDR (Classless Inter-Domain Routing) uses a slash followed by the number of network bits:

```bash
# Common CIDR notations
192.168.1.0/24    # 255.255.255.0   - 254 hosts
192.168.1.0/25    # 255.255.255.128 - 126 hosts
192.168.1.0/26    # 255.255.255.192 - 62 hosts
192.168.1.0/27    # 255.255.255.224 - 30 hosts
192.168.1.0/28    # 255.255.255.240 - 14 hosts
```

### Subnet Calculation Examples

**Example 1: /24 Network**
```bash
Network: 192.168.1.0/24
Subnet Mask: 255.255.255.0
Network Address: 192.168.1.0
First Host: 192.168.1.1
Last Host: 192.168.1.254
Broadcast: 192.168.1.255
Total Hosts: 254
```

**Example 2: /26 Network**
```bash
Network: 192.168.1.0/26
Subnet Mask: 255.255.255.192
Network Address: 192.168.1.0
First Host: 192.168.1.1
Last Host: 192.168.1.62
Broadcast: 192.168.1.63
Total Hosts: 62
```

### Subnet Calculation Tools

```bash
# Using ipcalc (install if needed)
$ sudo apt install ipcalc
$ ipcalc 192.168.1.0/24
Address:   192.168.1.0          11000000.10101000.00000001. 00000000
Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
Wildcard:  0.0.0.255            00000000.00000000.00000000. 11111111
=>
Network:   192.168.1.0/24       11000000.10101000.00000001. 00000000
HostMin:   192.168.1.1          11000000.10101000.00000001. 00000001
HostMax:   192.168.1.254        11000000.10101000.00000001. 11111110
Broadcast: 192.168.1.255        11000000.10101000.00000001. 11111111
Hosts/Net: 254                   Class C, Private Internet

# Using sipcalc
$ sudo apt install sipcalc
$ sipcalc 192.168.1.0/24
```

## 🆔 MAC Addresses: Hardware Identifiers

### What is a MAC Address?

MAC (Media Access Control) addresses are unique 48-bit identifiers assigned to network interfaces:

```bash
# MAC address format
00:1B:44:11:3A:B7
# ^^:^^:^^:^^:^^:^^
# |     |     |
# |     |     +-- Device-specific (NIC)
# |     +-------- Manufacturer-specific
# +-------------- Organizationally Unique Identifier (OUI)
```

### Viewing MAC Addresses

```bash
# Linux - show all interfaces
$ ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP
    link/ether 00:1b:44:11:3a:b7 brd ff:ff:ff:ff:ff:ff

# Show specific interface
$ cat /sys/class/net/eth0/address
00:1b:44:11:3a:b7

# Using ifconfig
$ ifconfig eth0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:1b:44:11:3a:b7  txqueuelen 1000  (Ethernet)
```

### MAC Address vs IP Address

| Feature | MAC Address | IP Address |
|---------|-------------|------------|
| **Scope** | Local network only | Global (with routing) |
| **Layer** | Data Link (Layer 2) | Network (Layer 3) |
| **Changes** | Fixed to hardware | Can change |
| **Format** | 6 hex octets | 4 decimal octets (IPv4) |
| **Purpose** | Local delivery | End-to-end delivery |

## 🌐 IPv6: The Future of Internet Addressing

### IPv6 Address Format

IPv6 addresses are 128-bit numbers written in hexadecimal:

```bash
# Full IPv6 address
2001:0db8:85a3:0000:0000:8a2e:0370:7334

# Compressed format (remove leading zeros)
2001:db8:85a3:0:0:8a2e:370:7334

# Further compressed (:: replaces consecutive zeros)
2001:db8:85a3::8a2e:370:7334
```

### IPv6 Address Types

```bash
# Loopback
::1                    # Equivalent to 127.0.0.1

# Link-local (auto-configured)
fe80::/10              # fe80:0000:0000:0000::/64

# Unique local (private)
fc00::/7               # Similar to RFC 1918

# Global unicast (public)
2000::/3               # Routable on internet

# Multicast
ff00::/8               # Group communication
```

### Viewing IPv6 Addresses

```bash
# Show IPv6 addresses
$ ip -6 addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    inet6 2001:db8:85a3::8a2e:370:7334/64 scope global
    inet6 fe80::21b:44ff:fe11:3ab7/64 scope link

# Check IPv6 connectivity
$ ping6 google.com
$ ping6 2001:4860:4860::8888  # Google's IPv6 DNS
```

## 🚦 Network Protocols and the OSI Model

### The OSI Model

| Layer | Name | Purpose | Examples |
|-------|------|---------|----------|
| 7 | Application | User interface | HTTP, FTP, SSH, DNS |
| 6 | Presentation | Data formatting | SSL/TLS, compression |
| 5 | Session | Connection management | NetBIOS, RPC |
| 4 | Transport | End-to-end delivery | TCP, UDP |
| 3 | Network | Routing | IP, ICMP, OSPF |
| 2 | Data Link | Local delivery | Ethernet, WiFi |
| 1 | Physical | Electrical signals | Cables, radio waves |

### TCP vs UDP

**TCP (Transmission Control Protocol):**
```bash
# Characteristics:
# ✅ Reliable (guaranteed delivery)
# ✅ Connection-oriented
# ✅ Error checking and correction
# ✅ Flow control
# ❌ Higher overhead

# Common TCP ports:
22   # SSH
23   # Telnet
25   # SMTP
53   # DNS (also UDP)
80   # HTTP
110  # POP3
143  # IMAP
443  # HTTPS
993  # IMAPS
995  # POP3S
```

**UDP (User Datagram Protocol):**
```bash
# Characteristics:
# ✅ Fast (low overhead)
# ✅ Connectionless
# ❌ No guaranteed delivery
# ❌ No error correction
# ❌ No flow control

# Common UDP ports:
53   # DNS
67   # DHCP Server
68   # DHCP Client
69   # TFTP
123  # NTP
161  # SNMP
514  # Syslog
```

### Common Network Protocols

**Application Layer Protocols:**
```bash
# HTTP/HTTPS - Web traffic
$ curl -I https://google.com
HTTP/2 200
date: Fri, 15 Dec 2023 10:30:00 GMT
server: gws

# DNS - Name resolution
$ nslookup google.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	google.com
Address: 142.250.191.14

# SSH - Secure remote access
$ ssh user@192.168.1.100

# FTP - File transfer
$ ftp ftp.example.com
```

**Network Layer Protocols:**
```bash
# ICMP - Internet Control Message Protocol
$ ping google.com
PING google.com (142.250.191.14) 56(84) bytes of data.
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=1 ttl=117 time=12.3 ms

# ARP - Address Resolution Protocol
$ arp -a
? (192.168.1.1) at 00:1a:2b:3c:4d:5e [ether] on eth0
? (192.168.1.100) at 00:1b:44:11:3a:b7 [ether] on eth0
```

## 🏠 How Home Networks Work

### Typical Home Network Setup

```
Internet (ISP)
      |
   [Modem]  ← Converts ISP signal to Ethernet
      |
   [Router] ← NAT, DHCP, Firewall, WiFi
      |
   [Switch] ← Additional wired ports (optional)
   /  |  \
 [PC] [Laptop] [Phone]
```

### Network Address Translation (NAT)

NAT allows multiple devices to share one public IP address:

```bash
# Without NAT (not possible - not enough public IPs)
Phone:  203.0.113.45
Laptop: 203.0.113.46  ← Would need separate public IPs
PC:     203.0.113.47

# With NAT (how it actually works)
Public IP:  203.0.113.45
           ↓ (NAT Router)
Phone:     192.168.1.10:5000 → 203.0.113.45:5000
Laptop:    192.168.1.11:5001 → 203.0.113.45:5001
PC:        192.168.1.12:5002 → 203.0.113.45:5002
```

### DHCP (Dynamic Host Configuration Protocol)

DHCP automatically assigns IP addresses to devices:

```bash
# DHCP process:
1. Device: "I need an IP address" (DHCP Discover)
2. Router: "Here are available options" (DHCP Offer)
3. Device: "I'll take 192.168.1.100" (DHCP Request)
4. Router: "Confirmed, here's your config" (DHCP Acknowledge)

# DHCP provides:
# - IP address (192.168.1.100)
# - Subnet mask (255.255.255.0)
# - Default gateway (192.168.1.1)
# - DNS servers (8.8.8.8, 8.8.4.4)
# - Lease time (24 hours)
```

### Viewing Network Configuration

```bash
# Show IP configuration
$ ip addr show eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:1b:44:11:3a:b7 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86395sec preferred_lft 86395sec

# Show routing table
$ ip route show
default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100

# Show DNS configuration
$ cat /etc/resolv.conf
nameserver 8.8.8.8
nameserver 8.8.4.4
search local.domain
```

## 🎯 Practical Scenario: Network Troubleshooting

Let's diagnose a connectivity issue step by step:

```bash
# Problem: "I can't access google.com"

# Step 1: Check local network interface
$ ip addr show
# Look for: IP address assigned, interface UP

# Step 2: Check local connectivity
$ ping 127.0.0.1
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.045 ms
# ✅ Local interface works

# Step 3: Check default gateway
$ ip route | grep default
default via 192.168.1.1 dev eth0

$ ping 192.168.1.1
PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.23 ms
# ✅ Can reach router

# Step 4: Check DNS resolution
$ nslookup google.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	google.com
Address: 142.250.191.14
# ✅ DNS works

# Step 5: Check internet connectivity
$ ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=12.3 ms
# ✅ Internet connectivity works

# Step 6: Check specific service
$ curl -I https://google.com
HTTP/2 200
# ✅ Web service works

# Conclusion: Network is working properly
# Issue might be browser-specific or application-level
```

## ⚠️ Common Networking Mistakes

### 1. Subnet Misconfiguration
```bash
# ❌ Wrong: Device and gateway in different subnets
Device:  192.168.1.100/25  (subnet: 192.168.1.0-127)
Gateway: 192.168.1.200     (subnet: 192.168.1.128-255)

# ✅ Correct: Same subnet
Device:  192.168.1.100/24
Gateway: 192.168.1.1
```

### 2. IP Address Conflicts
```bash
# ❌ Two devices with same IP
Device A: 192.168.1.100
Device B: 192.168.1.100  ← Conflict!

# Check for conflicts
$ arping 192.168.1.100
```

### 3. DNS Issues
```bash
# ❌ Wrong DNS servers
nameserver 192.168.1.999  ← Invalid IP

# ✅ Use reliable DNS
nameserver 8.8.8.8        ← Google
nameserver 1.1.1.1        ← Cloudflare
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between 192.168.1.0/24 and 192.168.1.0/25?**
   <details>
   <summary>Answer</summary>
   
   - /24 has 254 usable hosts (192.168.1.1-254)
   - /25 has 126 usable hosts (192.168.1.1-126)
   - /25 splits the /24 network into two smaller subnets
   </details>

2. **Why can't you ping a device on the internet using its MAC address?**
   <details>
   <summary>Answer</summary>
   
   MAC addresses only work on the local network segment. Routers strip and replace MAC addresses as packets travel between networks. Only IP addresses are used for end-to-end communication.
   </details>

3. **What happens when you type "google.com" in your browser?**
   <details>
   <summary>Answer</summary>
   
   1. DNS lookup to resolve google.com to IP address
   2. TCP connection to port 80/443
   3. HTTP/HTTPS request sent
   4. Server responds with web page
   5. Browser renders the content
   </details>

4. **What's the broadcast address for 10.0.0.0/8?**
   <details>
   <summary>Answer</summary>
   
   10.255.255.255
   </details>

### Hands-On Challenges

**Challenge 1: Subnet Planning**
```bash
# You have 192.168.1.0/24 and need 4 subnets with ~60 hosts each
# Calculate the subnet addresses, ranges, and broadcast addresses
```

**Challenge 2: Network Discovery**
```bash
# Find all devices on your local network
# Identify their IP addresses, MAC addresses, and hostnames
```

**Challenge 3: Protocol Analysis**
```bash
# Use netstat to identify:
# - All listening TCP services
# - All active connections
# - Which processes are using the network
```

## 🚀 Next Steps

Fantastic! You now understand networking fundamentals. You can:
- Calculate subnets and understand IP addressing
- Distinguish between different types of addresses and protocols
- Understand how devices communicate on networks
- Troubleshoot basic connectivity issues

**Ready to get hands-on with tools?** Continue to [09-basic-network-tools.md](09-basic-network-tools.md) to master essential networking commands and diagnostic tools.

---

> **Pro Tip**: Networking concepts build on each other. Make sure you understand IP addressing and subnetting before moving to advanced topics. Practice subnet calculations until they become second nature - this knowledge is fundamental for network administration and troubleshooting! 🌐