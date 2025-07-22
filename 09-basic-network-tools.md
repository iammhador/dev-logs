# 🛠️ Basic Network Tools: Essential Commands

> **Master ping, traceroute, nslookup, dig, netstat, and ip commands for network diagnostics**

## 📖 What You'll Learn

Network troubleshooting requires the right tools. This chapter covers the essential command-line utilities that every network administrator, developer, and system administrator must know:

- Connectivity testing with `ping` and `traceroute`
- DNS troubleshooting with `nslookup` and `dig`
- Network interface management with `ip` and `ifconfig`
- Connection monitoring with `netstat` and `ss`
- Basic network scanning and testing
- Real-world troubleshooting workflows

## 🌍 Why This Matters

**Real-world applications:**
- **Troubleshooting**: Diagnose network connectivity issues quickly
- **Monitoring**: Check network performance and identify bottlenecks
- **Security**: Identify open ports and suspicious connections
- **Administration**: Configure network interfaces and routing
- **Development**: Test API endpoints and service connectivity

## 🏓 Connectivity Testing with `ping`

### Basic `ping` Usage

`ping` sends ICMP Echo Request packets to test connectivity:

```bash
# Basic ping
$ ping google.com
PING google.com (142.250.191.14) 56(84) bytes of data.
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=1 ttl=117 time=12.3 ms
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=2 ttl=117 time=11.8 ms
64 bytes from lga25s62-in-f14.1e100.net (142.250.191.14): icmp_seq=3 ttl=117 time=12.1 ms
^C
--- google.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
time 2003ms
rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms
```

### Understanding `ping` Output

```bash
# Analyzing ping results:
# 64 bytes: packet size
# icmp_seq: sequence number
# ttl: Time To Live (hops remaining)
# time: round-trip time in milliseconds

# Packet loss indicates network issues:
# 0% = Perfect connectivity
# 1-5% = Minor issues
# >10% = Significant problems
# 100% = No connectivity
```

### Advanced `ping` Options

```bash
# Ping specific number of times
$ ping -c 4 google.com

# Ping with larger packet size
$ ping -s 1000 google.com

# Ping with specific interval (default is 1 second)
$ ping -i 0.5 google.com  # Every 0.5 seconds

# Ping IPv6
$ ping6 google.com
$ ping6 2001:4860:4860::8888

# Flood ping (be careful!)
$ sudo ping -f google.com

# Ping with timestamp
$ ping -D google.com
[1702636200.123456] 64 bytes from google.com: icmp_seq=1 ttl=117 time=12.3 ms

# Set TTL value
$ ping -t 10 google.com

# Ping broadcast address (local network discovery)
$ ping -b 192.168.1.255
```

### Ping Troubleshooting Scenarios

```bash
# Scenario 1: No response
$ ping 192.168.1.999
PING 192.168.1.999 (192.168.1.999) 56(84) bytes of data.
^C
--- 192.168.1.999 ping statistics ---
5 packets transmitted, 0 received, 100% packet loss
# Possible causes: Wrong IP, firewall, device down

# Scenario 2: High latency
$ ping google.com
64 bytes from google.com: icmp_seq=1 ttl=117 time=500.3 ms
# Possible causes: Network congestion, poor connection

# Scenario 3: Intermittent loss
64 bytes from google.com: icmp_seq=1 ttl=117 time=12.3 ms
Request timeout for icmp_seq 2
64 bytes from google.com: icmp_seq=3 ttl=117 time=11.8 ms
# Possible causes: Unstable connection, interference
```

## 🗺️ Path Tracing with `traceroute`

### Basic `traceroute` Usage

`traceroute` shows the path packets take to reach a destination:

```bash
# Trace route to destination
$ traceroute google.com
traceroute to google.com (142.250.191.14), 30 hops max, 60 byte packets
 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.045 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.234 ms
 3  203.0.113.1 (203.0.113.1)  12.345 ms  12.123 ms  12.456 ms
 4  * * *
 5  142.250.191.14 (142.250.191.14)  15.678 ms  15.432 ms  15.234 ms
```

### Understanding `traceroute` Output

```bash
# Each line represents a "hop" (router) in the path:
# 1. Hop number
# 2. Hostname/IP address
# 3. Three round-trip times (3 packets sent)

# Special symbols:
# * = No response (timeout)
# !H = Host unreachable
# !N = Network unreachable
# !P = Protocol unreachable
```

### Advanced `traceroute` Options

```bash
# Use ICMP instead of UDP
$ traceroute -I google.com

# Use TCP (useful when UDP is blocked)
$ sudo traceroute -T -p 80 google.com

# IPv6 traceroute
$ traceroute6 google.com

# Set maximum hops
$ traceroute -m 15 google.com

# Set packet size
$ traceroute -s 1000 google.com

# Don't resolve hostnames (faster)
$ traceroute -n google.com
1  192.168.1.1  1.234 ms  1.123 ms  1.045 ms
2  10.0.0.1  5.678 ms  5.432 ms  5.234 ms
```

### Traceroute Analysis

```bash
# Identifying network issues:

# High latency at specific hop:
 3  slow-router.isp.com  150.345 ms  149.123 ms  151.456 ms
 4  fast-router.isp.com  25.678 ms  25.432 ms  25.234 ms
# Problem: Hop 3 is slow (bottleneck)

# Timeouts in middle of path:
 5  * * *
 6  destination.com  15.678 ms  15.432 ms  15.234 ms
# Problem: Hop 5 doesn't respond but traffic gets through

# Complete failure:
 3  router.isp.com  12.345 ms  12.123 ms  12.456 ms
 4  * * *
 5  * * *
# Problem: Traffic blocked after hop 3
```

## 🔍 DNS Troubleshooting

### Using `nslookup`

```bash
# Basic DNS lookup
$ nslookup google.com
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
Name:	google.com
Address: 142.250.191.14

# Reverse DNS lookup
$ nslookup 8.8.8.8
Server:		8.8.8.8
Address:	8.8.8.8#53

Non-authoritative answer:
8.8.8.8.in-addr.arpa	name = dns.google.

# Query specific DNS server
$ nslookup google.com 1.1.1.1
Server:		1.1.1.1
Address:	1.1.1.1#53

# Interactive mode
$ nslookup
> google.com
> set type=MX
> google.com
> exit
```

### Advanced `nslookup` Queries

```bash
# Query different record types
$ nslookup -type=MX google.com
google.com	mail exchanger = 10 smtp.google.com.

$ nslookup -type=NS google.com
google.com	nameserver = ns1.google.com.
google.com	nameserver = ns2.google.com.

$ nslookup -type=TXT google.com
google.com	text = "v=spf1 include:_spf.google.com ~all"

$ nslookup -type=AAAA google.com
google.com	has AAAA address 2607:f8b0:4004:c1b::65
```

### Using `dig` (More Powerful)

```bash
# Basic dig query
$ dig google.com

; <<>> DiG 9.16.1-Ubuntu <<>> google.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;google.com.			IN	A

;; ANSWER SECTION:
google.com.		300	IN	A	142.250.191.14

;; Query time: 12 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Fri Dec 15 10:30:00 UTC 2023
;; MSG SIZE  rcvd: 55

# Short answer only
$ dig +short google.com
142.250.191.14

# Query specific record type
$ dig MX google.com
$ dig NS google.com
$ dig TXT google.com
$ dig AAAA google.com

# Reverse DNS lookup
$ dig -x 8.8.8.8
$ dig +short -x 8.8.8.8
dns.google.
```

### Advanced `dig` Usage

```bash
# Query specific DNS server
$ dig @1.1.1.1 google.com

# Trace DNS resolution path
$ dig +trace google.com

# Show all record types
$ dig ANY google.com

# Query with TCP (instead of UDP)
$ dig +tcp google.com

# Batch queries from file
$ echo -e "google.com\nfacebook.com\ntwitter.com" | dig -f -

# Check DNSSEC validation
$ dig +dnssec google.com
```

### DNS Troubleshooting Scenarios

```bash
# Scenario 1: Domain doesn't resolve
$ dig nonexistent.example.com
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN
# NXDOMAIN = Domain doesn't exist

# Scenario 2: DNS server timeout
$ dig @192.168.1.999 google.com
;; connection timed out; no servers could be reached

# Scenario 3: Different results from different servers
$ dig @8.8.8.8 example.com
$ dig @1.1.1.1 example.com
# Compare results for consistency
```

## 🔧 Network Interface Management

### Using `ip` Command (Modern)

```bash
# Show all network interfaces
$ ip addr show
# or
$ ip a

1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:1b:44:11:3a:b7 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global dynamic eth0
       valid_lft 86395sec preferred_lft 86395sec

# Show specific interface
$ ip addr show eth0

# Show only IPv4 addresses
$ ip -4 addr show

# Show only IPv6 addresses
$ ip -6 addr show
```

### Interface Configuration with `ip`

```bash
# Bring interface up/down
$ sudo ip link set eth0 up
$ sudo ip link set eth0 down

# Add IP address to interface
$ sudo ip addr add 192.168.1.200/24 dev eth0

# Remove IP address from interface
$ sudo ip addr del 192.168.1.200/24 dev eth0

# Change MAC address
$ sudo ip link set dev eth0 address 00:1b:44:11:3a:b8

# Set MTU
$ sudo ip link set dev eth0 mtu 1400
```

### Routing with `ip`

```bash
# Show routing table
$ ip route show
# or
$ ip r

default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100

# Add static route
$ sudo ip route add 10.0.0.0/8 via 192.168.1.1

# Delete route
$ sudo ip route del 10.0.0.0/8

# Add default gateway
$ sudo ip route add default via 192.168.1.1

# Show route to specific destination
$ ip route get 8.8.8.8
8.8.8.8 via 192.168.1.1 dev eth0 src 192.168.1.100 uid 1000
```

### Using `ifconfig` (Legacy but Common)

```bash
# Show all interfaces
$ ifconfig

# Show specific interface
$ ifconfig eth0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:1b:44:11:3a:b7  txqueuelen 1000  (Ethernet)
        RX packets 12345  bytes 1234567 (1.2 MB)
        TX packets 6789   bytes 789012 (789.0 KB)

# Configure interface
$ sudo ifconfig eth0 192.168.1.200 netmask 255.255.255.0
$ sudo ifconfig eth0 up
$ sudo ifconfig eth0 down
```

## 📊 Connection Monitoring

### Using `netstat`

```bash
# Show all connections
$ netstat -a

# Show listening ports
$ netstat -l
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:25            0.0.0.0:*               LISTEN

# Show TCP connections
$ netstat -t

# Show UDP connections
$ netstat -u

# Show with process information
$ netstat -p

# Show numerical addresses (don't resolve)
$ netstat -n

# Common combinations
$ netstat -tulpn  # TCP, UDP, Listening, Process, Numerical
$ netstat -an     # All connections, Numerical
```

### Advanced `netstat` Usage

```bash
# Show routing table
$ netstat -r
Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         192.168.1.1     0.0.0.0         UG        0 0          0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 eth0

# Show interface statistics
$ netstat -i
Kernel Interface table
Iface      MTU    RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg
eth0      1500    12345      0      0 0          6789      0      0      0 BMRU
lo       65536      100      0      0 0           100      0      0      0 LRU

# Show network statistics
$ netstat -s
```

### Using `ss` (Modern Alternative)

```bash
# Show all sockets
$ ss -a

# Show listening sockets
$ ss -l

# Show TCP sockets
$ ss -t

# Show UDP sockets
$ ss -u

# Show with process information
$ ss -p

# Common combination
$ ss -tulpn

# Show sockets for specific port
$ ss -tulpn | grep :80
$ ss -tulpn | grep :22

# Show established connections
$ ss -o state established
```

### Practical Connection Analysis

```bash
# Find what's using port 80
$ ss -tulpn | grep :80
tcp   LISTEN 0      128          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=1234,fd=6))

# Find all connections to specific IP
$ ss -an | grep 192.168.1.100

# Count connections by state
$ ss -an | awk '{print $2}' | sort | uniq -c
     10 ESTAB
      5 LISTEN
      2 TIME-WAIT

# Monitor connections in real-time
$ watch -n 1 'ss -tulpn'
```

## 🎯 Practical Troubleshooting Workflow

### Complete Network Diagnostic

```bash
#!/bin/bash
# network-check.sh - Comprehensive network diagnostic

echo "=== Network Diagnostic Report ==="
echo "Date: $(date)"
echo

# 1. Check network interfaces
echo "1. Network Interfaces:"
ip addr show | grep -E '^[0-9]+:|inet '
echo

# 2. Check routing
echo "2. Default Gateway:"
ip route | grep default
echo

# 3. Check DNS
echo "3. DNS Servers:"
cat /etc/resolv.conf | grep nameserver
echo

# 4. Test local connectivity
echo "4. Local Connectivity:"
ping -c 1 127.0.0.1 > /dev/null && echo "✅ Loopback OK" || echo "❌ Loopback FAIL"
GATEWAY=$(ip route | grep default | awk '{print $3}')
if [ ! -z "$GATEWAY" ]; then
    ping -c 1 $GATEWAY > /dev/null && echo "✅ Gateway OK" || echo "❌ Gateway FAIL"
fi
echo

# 5. Test DNS resolution
echo "5. DNS Resolution:"
nslookup google.com > /dev/null && echo "✅ DNS OK" || echo "❌ DNS FAIL"
echo

# 6. Test internet connectivity
echo "6. Internet Connectivity:"
ping -c 1 8.8.8.8 > /dev/null && echo "✅ Internet OK" || echo "❌ Internet FAIL"
echo

# 7. Show listening services
echo "7. Listening Services:"
ss -tulpn | grep LISTEN | head -10
echo

echo "=== End Report ==="
```

### Web Service Testing

```bash
# Test HTTP connectivity
$ curl -I http://example.com
HTTP/1.1 200 OK
Date: Fri, 15 Dec 2023 10:30:00 GMT
Server: Apache/2.4.41

# Test HTTPS with timing
$ curl -w "@curl-format.txt" -o /dev/null -s https://google.com

# Create curl-format.txt:
$ cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

# Test specific port connectivity
$ telnet google.com 80
$ nc -zv google.com 80
Connection to google.com 80 port [tcp/http] succeeded!
```

## ⚠️ Common Tool Limitations and Alternatives

### When Tools Don't Work

```bash
# ICMP might be blocked
$ ping google.com
# No response doesn't always mean the host is down

# Try TCP ping instead
$ nc -zv google.com 80
$ telnet google.com 80

# Some routers don't respond to traceroute
$ traceroute google.com
# Use different protocols
$ traceroute -I google.com  # ICMP
$ traceroute -T google.com  # TCP

# DNS might be cached
$ dig google.com
# Clear DNS cache
$ sudo systemctl flush-dns  # systemd-resolved
$ sudo service nscd restart  # nscd
```

### Tool Alternatives

| Traditional | Modern | Purpose |
|-------------|--------|---------|
| `ifconfig` | `ip` | Interface management |
| `route` | `ip route` | Routing table |
| `netstat` | `ss` | Socket statistics |
| `arp` | `ip neigh` | ARP table |
| `iwconfig` | `iw` | Wireless configuration |

## 🧠 Knowledge Check

### Quick Quiz

1. **What does a TTL of 1 in a ping response indicate?**
   <details>
   <summary>Answer</summary>
   
   The packet has only 1 hop remaining before it's discarded. This usually means the responding device is very close (possibly the next router).
   </details>

2. **How do you test if port 443 is open on google.com without using a web browser?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   nc -zv google.com 443
   # or
   telnet google.com 443
   # or
   curl -I https://google.com
   ```
   </details>

3. **What's the difference between `dig +short` and regular `dig`?**
   <details>
   <summary>Answer</summary>
   
   `dig +short` returns only the answer (IP address), while regular `dig` returns the full DNS response including headers, query details, and timing information.
   </details>

4. **How do you find which process is listening on port 80?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   ss -tulpn | grep :80
   # or
   netstat -tulpn | grep :80
   # or
   lsof -i :80
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Network Path Analysis**
```bash
# Trace the route to 3 different websites
# Compare the paths and identify common routers
# Measure and compare latencies
```

**Challenge 2: DNS Investigation**
```bash
# Find all DNS record types for your domain
# Compare results from different DNS servers
# Identify the authoritative name servers
```

**Challenge 3: Service Discovery**
```bash
# Find all listening services on your system
# Identify which processes are using the network
# Create a summary report of open ports
```

## 🚀 Next Steps

Excellent! You've mastered the essential network diagnostic tools. You can now:
- Test connectivity and diagnose network issues
- Troubleshoot DNS problems effectively
- Monitor network connections and services
- Analyze network paths and performance

**Ready for advanced techniques?** Continue to [10-advanced-network-tools.md](10-advanced-network-tools.md) to learn about `nmap`, `tcpdump`, `wireshark`, and advanced network analysis.

---

> **Pro Tip**: Create aliases for commonly used command combinations like `alias netcheck='ss -tulpn'` and `alias myip='curl -s ifconfig.me'`. Build a personal toolkit of network diagnostic scripts that you can run quickly during troubleshooting sessions! 🔧