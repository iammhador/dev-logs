# 🛡️ Security & Firewalls: Network Protection and Intrusion Detection

> **Master network security, firewall configuration, and intrusion detection systems**

## 📖 What You'll Learn

Network security is critical for protecting systems and data. This chapter covers comprehensive security measures from basic firewalls to advanced intrusion detection:

- Firewall fundamentals and types
- iptables and UFW configuration
- Network security scanning and assessment
- Intrusion detection and prevention systems
- Log analysis and security monitoring
- VPN setup and configuration
- Security hardening best practices
- Incident response and forensics basics

## 🌍 Why This Matters

**Critical applications:**
- **System Protection**: Defend against network attacks and intrusions
- **Compliance**: Meet security standards and regulations
- **Data Security**: Protect sensitive information in transit
- **Network Monitoring**: Detect and respond to security threats
- **Access Control**: Manage who can access what resources

## 🔥 Firewall Fundamentals

### Understanding Firewalls

```bash
# Check current firewall status
$ sudo ufw status
Status: inactive

$ sudo iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

# Check if firewall is running
$ sudo systemctl status ufw
$ sudo systemctl status iptables

# View network connections
$ sudo netstat -tuln
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
tcp6       0      0 :::22                   :::*                    LISTEN
tcp6       0      0 :::80                   :::*                    LISTEN

# Modern alternative with ss
$ sudo ss -tuln
Netid  State   Recv-Q  Send-Q    Local Address:Port    Peer Address:Port
tcp    LISTEN  0       128             0.0.0.0:22           0.0.0.0:*
tcp    LISTEN  0       80            127.0.0.1:3306         0.0.0.0:*
tcp    LISTEN  0       128                [::]:22              [::]:*
tcp    LISTEN  0       128                [::]:80              [::]:*
```

### UFW (Uncomplicated Firewall)

```bash
# Enable UFW
$ sudo ufw enable
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup

# Check status
$ sudo ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

# Basic rules
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing
$ sudo ufw default deny forward

# Allow specific services
$ sudo ufw allow ssh
$ sudo ufw allow 22/tcp
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp
$ sudo ufw allow 53/udp

# Allow from specific IP
$ sudo ufw allow from 192.168.1.100
$ sudo ufw allow from 192.168.1.0/24
$ sudo ufw allow from 192.168.1.100 to any port 22

# Allow specific protocols
$ sudo ufw allow out 53/udp
$ sudo ufw allow in on eth0 to any port 80

# Deny rules
$ sudo ufw deny 23/tcp
$ sudo ufw deny from 10.0.0.0/8

# Delete rules
$ sudo ufw status numbered
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    Anywhere
[ 3] 443/tcp                    ALLOW IN    Anywhere

$ sudo ufw delete 2
$ sudo ufw delete allow 80/tcp

# Advanced rules
$ sudo ufw limit ssh                    # Rate limiting
$ sudo ufw allow from 192.168.1.0/24 to any app OpenSSH

# Application profiles
$ sudo ufw app list
Available applications:
  Apache
  Apache Full
  Apache Secure
  OpenSSH
  Postfix
  Postfix SMTPS
  Postfix Submission

$ sudo ufw allow 'Apache Full'
$ sudo ufw app info 'Apache Full'
Profile: Apache Full
Title: Web Server (HTTP,HTTPS)
Description: Apache v2 is the next generation of the omnipresent Apache web
server.

Ports:
  80,443/tcp

# Logging
$ sudo ufw logging on
$ sudo ufw logging medium
$ sudo tail -f /var/log/ufw.log

# Reset UFW
$ sudo ufw --force reset
```

### iptables Advanced Configuration

```bash
# View current rules
$ sudo iptables -L -n -v
Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination

# Save current rules
$ sudo iptables-save > /tmp/iptables-backup.rules

# Basic iptables rules
# Allow loopback
$ sudo iptables -A INPUT -i lo -j ACCEPT
$ sudo iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
$ sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH
$ sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
$ sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
$ sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow DNS
$ sudo iptables -A INPUT -p udp --dport 53 -j ACCEPT
$ sudo iptables -A INPUT -p tcp --dport 53 -j ACCEPT

# Allow from specific network
$ sudo iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT

# Rate limiting SSH
$ sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set
$ sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 -j DROP

# Drop invalid packets
$ sudo iptables -A INPUT -m conntrack --ctstate INVALID -j DROP

# Log dropped packets
$ sudo iptables -A INPUT -j LOG --log-prefix "iptables-dropped: "

# Default policies
$ sudo iptables -P INPUT DROP
$ sudo iptables -P FORWARD DROP
$ sudo iptables -P OUTPUT ACCEPT

# Save rules (Ubuntu/Debian)
$ sudo apt install iptables-persistent
$ sudo netfilter-persistent save
$ sudo netfilter-persistent reload

# Advanced iptables script
#!/bin/bash
# /etc/iptables/firewall.sh

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X
iptables -t mangle -F
iptables -t mangle -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH with rate limiting
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow web services
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow DNS
iptables -A INPUT -p udp --dport 53 -j ACCEPT
iptables -A INPUT -p tcp --dport 53 -j ACCEPT

# Allow ICMP (ping)
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Log and drop everything else
iptables -A INPUT -j LOG --log-prefix "iptables-dropped: " --log-level 4
iptables -A INPUT -j DROP

echo "Firewall rules applied"
```

## 🔍 Network Security Scanning

### Nmap Security Scanning

```bash
# Basic host discovery
$ nmap -sn 192.168.1.0/24
Starting Nmap 7.80 ( https://nmap.org )
Nmap scan report for 192.168.1.1
Host is up (0.001s latency).
Nmap scan report for 192.168.1.100
Host is up (0.002s latency).
Nmap scan report for 192.168.1.150
Host is up (0.001s latency).
Nmap done: 256 IP addresses (3 hosts up) scanned in 2.5 seconds

# Port scanning
$ nmap -sS 192.168.1.100          # SYN scan
$ nmap -sT 192.168.1.100          # TCP connect scan
$ nmap -sU 192.168.1.100          # UDP scan
$ nmap -sA 192.168.1.100          # ACK scan

# Comprehensive scan
$ nmap -A 192.168.1.100
Starting Nmap 7.80 ( https://nmap.org )
Nmap scan report for server.local (192.168.1.100)
Host is up (0.001s latency).
Not shown: 996 closed ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5
80/tcp   open  http    Apache httpd 2.4.41
443/tcp  open  https   Apache httpd 2.4.41
3306/tcp open  mysql   MySQL 8.0.28-0ubuntu0.20.04.3

# Vulnerability scanning
$ nmap --script vuln 192.168.1.100
$ nmap --script ssl-enum-ciphers -p 443 192.168.1.100

# OS detection
$ sudo nmap -O 192.168.1.100

# Service version detection
$ nmap -sV 192.168.1.100

# Stealth scanning
$ sudo nmap -sS -T2 192.168.1.100  # Slow and stealthy
$ sudo nmap -f 192.168.1.100       # Fragment packets

# Scan specific ports
$ nmap -p 22,80,443 192.168.1.100
$ nmap -p 1-1000 192.168.1.100
$ nmap -p- 192.168.1.100           # All ports

# Output formats
$ nmap -oN scan_results.txt 192.168.1.100
$ nmap -oX scan_results.xml 192.168.1.100
$ nmap -oG scan_results.gnmap 192.168.1.100
$ nmap -oA scan_results 192.168.1.100  # All formats
```

### Security Assessment Tools

```bash
# Nikto web vulnerability scanner
$ sudo apt install nikto
$ nikto -h http://192.168.1.100
- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          192.168.1.100
+ Target Hostname:    192.168.1.100
+ Target Port:        80
+ Start Time:         2023-12-15 10:30:00 (GMT0)
---------------------------------------------------------------------------
+ Server: Apache/2.4.41 (Ubuntu)
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-XSS-Protection header is not defined.
+ The X-Content-Type-Options header is not set.

# OpenVAS vulnerability scanner
$ sudo apt install openvas
$ sudo gvm-setup
$ sudo gvm-start
# Access web interface at https://localhost:9392

# Lynis system auditing
$ sudo apt install lynis
$ sudo lynis audit system

# Chkrootkit rootkit detection
$ sudo apt install chkrootkit
$ sudo chkrootkit

# rkhunter rootkit detection
$ sudo apt install rkhunter
$ sudo rkhunter --update
$ sudo rkhunter --check

# ClamAV antivirus
$ sudo apt install clamav clamav-daemon
$ sudo freshclam                    # Update virus definitions
$ sudo clamscan -r /home            # Scan directory
$ sudo clamscan -r --infected /     # Scan for infected files only
```

## 🚨 Intrusion Detection Systems

### Fail2ban Configuration

```bash
# Install Fail2ban
$ sudo apt install fail2ban

# Check status
$ sudo systemctl status fail2ban
$ sudo fail2ban-client status
Status
|- Number of jail:      1
`- Jail list:   sshd

# Configuration files
/etc/fail2ban/
├── jail.conf         # Default configuration (don't edit)
├── jail.local        # Local overrides
├── filter.d/         # Filter definitions
└── action.d/         # Action definitions

# Create local configuration
$ sudo nano /etc/fail2ban/jail.local

[DEFAULT]
# Ban time in seconds (10 minutes)
bantime = 600

# Find time window (10 minutes)
findtime = 600

# Number of failures before ban
maxretry = 3

# Ignore local IPs
ignoreip = 127.0.0.1/8 192.168.1.0/24

# Email notifications
destemail = admin@example.com
sender = fail2ban@example.com
mta = sendmail
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/error.log
maxretry = 3

[apache-badbots]
enabled = true
port = http,https
filter = apache-badbots
logpath = /var/log/apache2/access.log
maxretry = 2

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

# Restart Fail2ban
$ sudo systemctl restart fail2ban

# Check jail status
$ sudo fail2ban-client status sshd
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     5
|  `- File list:        /var/log/auth.log
`- Actions
   |- Currently banned: 1
   |- Total banned:     2
   `- Banned IP list:   192.168.1.200

# Unban IP
$ sudo fail2ban-client set sshd unbanip 192.168.1.200

# Ban IP manually
$ sudo fail2ban-client set sshd banip 192.168.1.200

# Custom filter example
$ sudo nano /etc/fail2ban/filter.d/custom-app.conf

[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
ignoreregex =

# Test filter
$ fail2ban-regex /var/log/custom-app.log /etc/fail2ban/filter.d/custom-app.conf
```

### OSSEC Host-based IDS

```bash
# Install OSSEC
$ wget https://github.com/ossec/ossec-hids/archive/3.7.0.tar.gz
$ tar -xzf 3.7.0.tar.gz
$ cd ossec-hids-3.7.0
$ sudo ./install.sh

# Configuration
$ sudo nano /var/ossec/etc/ossec.conf

<ossec_config>
  <global>
    <email_notification>yes</email_notification>
    <email_to>admin@example.com</email_to>
    <smtp_server>localhost</smtp_server>
    <email_from>ossec@example.com</email_from>
  </global>

  <rules>
    <include>rules_config.xml</include>
    <include>pam_rules.xml</include>
    <include>sshd_rules.xml</include>
    <include>telnetd_rules.xml</include>
    <include>syslog_rules.xml</include>
    <include>arpwatch_rules.xml</include>
    <include>symantec-av_rules.xml</include>
    <include>symantec-ws_rules.xml</include>
    <include>pix_rules.xml</include>
    <include>named_rules.xml</include>
    <include>smbd_rules.xml</include>
    <include>vsftpd_rules.xml</include>
    <include>pure-ftpd_rules.xml</include>
    <include>proftpd_rules.xml</include>
    <include>ms_ftpd_rules.xml</include>
    <include>ftpd_rules.xml</include>
    <include>hordeimp_rules.xml</include>
    <include>roundcube_rules.xml</include>
    <include>wordpress_rules.xml</include>
    <include>cimserver_rules.xml</include>
    <include>vpopmail_rules.xml</include>
    <include>vmpop3d_rules.xml</include>
    <include>courier_rules.xml</include>
    <include>web_rules.xml</include>
    <include>web_appsec_rules.xml</include>
    <include>apache_rules.xml</include>
    <include>nginx_rules.xml</include>
    <include>php_rules.xml</include>
    <include>mysql_rules.xml</include>
    <include>postgresql_rules.xml</include>
    <include>ids_rules.xml</include>
    <include>squid_rules.xml</include>
    <include>firewall_rules.xml</include>
    <include>cisco-ios_rules.xml</include>
    <include>netscreenfw_rules.xml</include>
    <include>sonicwall_rules.xml</include>
    <include>postfix_rules.xml</include>
    <include>sendmail_rules.xml</include>
    <include>imapd_rules.xml</include>
    <include>mailscanner_rules.xml</include>
    <include>dovecot_rules.xml</include>
    <include>ms-exchange_rules.xml</include>
    <include>racoon_rules.xml</include>
    <include>vpn_concentrator_rules.xml</include>
    <include>spamd_rules.xml</include>
    <include>msauth_rules.xml</include>
    <include>mcafee_av_rules.xml</include>
    <include>trend-osce_rules.xml</include>
    <include>ms-se_rules.xml</include>
    <include>zeus_rules.xml</include>
    <include>solaris_bsm_rules.xml</include>
    <include>vmware_rules.xml</include>
    <include>ms_dhcp_rules.xml</include>
    <include>asterisk_rules.xml</include>
    <include>ossec_rules.xml</include>
    <include>attack_rules.xml</include>
    <include>local_rules.xml</include>
  </rules>

  <syscheck>
    <!-- Frequency that syscheck is executed -- default every 22 hours -->
    <frequency>79200</frequency>
    
    <!-- Directories to check  (perform all possible verifications) -->
    <directories check_all="yes">/etc,/usr/bin,/usr/sbin</directories>
    <directories check_all="yes">/bin,/sbin,/boot</directories>

    <!-- Files/directories to ignore -->
    <ignore>/etc/mtab</ignore>
    <ignore>/etc/hosts.deny</ignore>
    <ignore>/etc/mail/statistics</ignore>
    <ignore>/etc/random-seed</ignore>
    <ignore>/etc/random.seed</ignore>
    <ignore>/etc/adjtime</ignore>
    <ignore>/etc/httpd/logs</ignore>
    <ignore>/etc/utmpx</ignore>
    <ignore>/etc/wtmpx</ignore>
    <ignore>/etc/cups/certs</ignore>
    <ignore>/etc/dumpdates</ignore>
    <ignore>/etc/svc/volatile</ignore>
  </syscheck>

  <rootcheck>
    <rootkit_files>/var/ossec/etc/shared/rootkit_files.txt</rootkit_files>
    <rootkit_trojans>/var/ossec/etc/shared/rootkit_trojans.txt</rootkit_trojans>
    <system_audit>/var/ossec/etc/shared/system_audit_rcl.txt</system_audit>
    <system_audit>/var/ossec/etc/shared/cis_debian_linux_rcl.txt</system_audit>
    <system_audit>/var/ossec/etc/shared/cis_rhel_linux_rcl.txt</system_audit>
    <system_audit>/var/ossec/etc/shared/cis_rhel5_linux_rcl.txt</system_audit>
  </rootcheck>

  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/messages</location>
  </localfile>

  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/auth.log</location>
  </localfile>

  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/syslog</location>
  </localfile>

  <localfile>
    <log_format>apache</log_format>
    <location>/var/log/apache2/access.log</location>
  </localfile>

  <localfile>
    <log_format>apache</log_format>
    <location>/var/log/apache2/error.log</location>
  </localfile>
</ossec_config>

# Start OSSEC
$ sudo /var/ossec/bin/ossec-control start

# Check status
$ sudo /var/ossec/bin/ossec-control status
ossec-monitord is running...
ossec-logcollector is running...
ossec-syscheckd is running...
ossec-analysisd is running...
ossec-maild is running...
ossec-execd is running...

# View alerts
$ sudo tail -f /var/ossec/logs/alerts/alerts.log
```

## 📊 Log Analysis and Security Monitoring

### Centralized Logging with rsyslog

```bash
# Configure rsyslog server
$ sudo nano /etc/rsyslog.conf

# Uncomment these lines to enable UDP syslog reception
$ModLoad imudp
$UDPServerRun 514
$UDPServerAddress 0.0.0.0

# Uncomment these lines to enable TCP syslog reception
$ModLoad imtcp
$InputTCPServerRun 514

# Template for remote logs
$template RemoteLogs,"/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log"
*.* ?RemoteLogs
& stop

# Restart rsyslog
$ sudo systemctl restart rsyslog

# Configure rsyslog client
$ sudo nano /etc/rsyslog.conf

# Add at the end
*.* @@192.168.1.100:514  # TCP
*.* @192.168.1.100:514   # UDP

# Restart client rsyslog
$ sudo systemctl restart rsyslog

# Test logging
$ logger "Test message from $(hostname)"
```

### Log Analysis Tools

```bash
# Basic log analysis with grep and awk
$ sudo grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr
     15 192.168.1.200
      8 10.0.0.50
      3 172.16.1.100

# Find successful SSH logins
$ sudo grep "Accepted password" /var/log/auth.log | awk '{print $1, $2, $3, $9, $11}'

# Analyze Apache access logs
$ sudo awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | head -10
$ sudo awk '{print $7}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | head -10

# Find 404 errors
$ sudo awk '$9 == 404 {print $7}' /var/log/apache2/access.log | sort | uniq -c | sort -nr

# GoAccess web log analyzer
$ sudo apt install goaccess
$ sudo goaccess /var/log/apache2/access.log -c
$ sudo goaccess /var/log/apache2/access.log -o /var/www/html/report.html --log-format=COMBINED

# Logwatch for automated log analysis
$ sudo apt install logwatch
$ sudo nano /etc/logwatch/conf/logwatch.conf

LogDir = /var/log
TmpDir = /var/cache/logwatch
Output = mail
Format = html
Encode = none
MailTo = admin@example.com
MailFrom = logwatch@example.com
Subject = Logwatch Report
Detail = Med
Service = All
Range = yesterday

# Run logwatch manually
$ sudo logwatch --detail Med --mailto admin@example.com --range yesterday

# Automated logwatch via cron
$ sudo nano /etc/cron.daily/00logwatch
#!/bin/bash
/usr/sbin/logwatch --output mail --mailto admin@example.com --detail high
```

### Security Information and Event Management (SIEM)

```bash
# ELK Stack installation (Elasticsearch, Logstash, Kibana)
# Add Elastic repository
$ wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
$ echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
$ sudo apt update

# Install Elasticsearch
$ sudo apt install elasticsearch
$ sudo systemctl enable elasticsearch
$ sudo systemctl start elasticsearch

# Test Elasticsearch
$ curl -X GET "localhost:9200/"

# Install Logstash
$ sudo apt install logstash

# Configure Logstash
$ sudo nano /etc/logstash/conf.d/syslog.conf

input {
  file {
    path => "/var/log/syslog"
    type => "syslog"
  }
  file {
    path => "/var/log/auth.log"
    type => "auth"
  }
}

filter {
  if [type] == "syslog" {
    grok {
      match => { "message" => "%{SYSLOGTIMESTAMP:timestamp} %{IPORHOST:host} %{DATA:program}(?:\[%{POSINT:pid}\])?: %{GREEDYDATA:message}" }
    }
  }
  if [type] == "auth" {
    grok {
      match => { "message" => "%{SYSLOGTIMESTAMP:timestamp} %{IPORHOST:host} %{DATA:program}(?:\[%{POSINT:pid}\])?: %{GREEDYDATA:message}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "logstash-%{+YYYY.MM.dd}"
  }
}

# Start Logstash
$ sudo systemctl enable logstash
$ sudo systemctl start logstash

# Install Kibana
$ sudo apt install kibana
$ sudo systemctl enable kibana
$ sudo systemctl start kibana

# Access Kibana at http://localhost:5601
```

## 🔐 VPN Configuration

### OpenVPN Server Setup

```bash
# Install OpenVPN and Easy-RSA
$ sudo apt install openvpn easy-rsa

# Set up CA directory
$ make-cadir ~/openvpn-ca
$ cd ~/openvpn-ca

# Configure CA variables
$ nano vars

export KEY_COUNTRY="US"
export KEY_PROVINCE="CA"
export KEY_CITY="SanFrancisco"
export KEY_ORG="Example Corp"
export KEY_EMAIL="admin@example.com"
export KEY_OU="IT Department"
export KEY_NAME="server"

# Source variables and build CA
$ source vars
$ ./clean-all
$ ./build-ca

# Generate server certificate
$ ./build-key-server server

# Generate Diffie-Hellman parameters
$ ./build-dh

# Generate client certificate
$ ./build-key client1

# Copy certificates to OpenVPN directory
$ sudo cp ~/openvpn-ca/keys/{server.crt,server.key,ca.crt,dh2048.pem} /etc/openvpn/

# Generate TLS auth key
$ sudo openvpn --genkey --secret /etc/openvpn/ta.key

# Configure OpenVPN server
$ sudo nano /etc/openvpn/server.conf

port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh2048.pem
server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
keepalive 10 120
tls-auth ta.key 0
cipher AES-256-CBC
user nobody
group nogroup
persist-key
persist-tun
status openvpn-status.log
verb 3
explicit-exit-notify 1

# Enable IP forwarding
$ sudo nano /etc/sysctl.conf
# Uncomment:
net.ipv4.ip_forward=1

$ sudo sysctl -p

# Configure firewall for VPN
$ sudo ufw allow 1194/udp
$ sudo ufw allow OpenSSH

# Add NAT rules
$ sudo nano /etc/ufw/before.rules
# Add at the top:
*nat
:POSTROUTING ACCEPT [0:0]
-A POSTROUTING -s 10.8.0.0/8 -o eth0 -j MASQUERADE
COMMIT

# Start OpenVPN
$ sudo systemctl enable openvpn@server
$ sudo systemctl start openvpn@server

# Create client configuration
$ nano ~/client1.ovpn

client
dev tun
proto udp
remote YOUR_SERVER_IP 1194
resolv-retry infinite
nobind
user nobody
group nogroup
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
verb 3

<ca>
[Insert ca.crt contents]
</ca>

<cert>
[Insert client1.crt contents]
</cert>

<key>
[Insert client1.key contents]
</key>

<tls-auth>
[Insert ta.key contents]
</tls-auth>
key-direction 1
```

### WireGuard VPN (Modern Alternative)

```bash
# Install WireGuard
$ sudo apt install wireguard

# Generate server keys
$ wg genkey | sudo tee /etc/wireguard/private.key
$ sudo chmod 600 /etc/wireguard/private.key
$ sudo cat /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key

# Configure WireGuard server
$ sudo nano /etc/wireguard/wg0.conf

[Interface]
PrivateKey = [SERVER_PRIVATE_KEY]
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = [CLIENT_PUBLIC_KEY]
AllowedIPs = 10.0.0.2/32

# Generate client keys
$ wg genkey | tee client_private.key | wg pubkey > client_public.key

# Client configuration
$ nano client.conf

[Interface]
PrivateKey = [CLIENT_PRIVATE_KEY]
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = [SERVER_PUBLIC_KEY]
Endpoint = YOUR_SERVER_IP:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25

# Start WireGuard
$ sudo systemctl enable wg-quick@wg0
$ sudo systemctl start wg-quick@wg0

# Check status
$ sudo wg show
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between UFW and iptables?**
   <details>
   <summary>Answer</summary>
   
   UFW (Uncomplicated Firewall) is a user-friendly frontend for iptables, making firewall management easier with simpler commands, while iptables provides more granular control but with more complex syntax.
   </details>

2. **How does Fail2ban protect against brute force attacks?**
   <details>
   <summary>Answer</summary>
   
   Fail2ban monitors log files for failed authentication attempts and automatically bans IP addresses that exceed the configured failure threshold for a specified time period.
   </details>

3. **What's the purpose of a SIEM system?**
   <details>
   <summary>Answer</summary>
   
   SIEM (Security Information and Event Management) systems collect, analyze, and correlate security events from multiple sources to provide real-time security monitoring and incident response capabilities.
   </details>

4. **Why is WireGuard considered better than OpenVPN?**
   <details>
   <summary>Answer</summary>
   
   WireGuard is simpler to configure, has better performance, uses modern cryptography, has a smaller codebase (easier to audit), and provides better battery life on mobile devices.
   </details>

### Hands-On Challenges

**Challenge 1: Complete Security Hardening**
```bash
# Implement comprehensive security for a server:
# - Configure advanced firewall rules with iptables
# - Set up Fail2ban with custom filters
# - Install and configure an IDS (OSSEC or Suricata)
# - Implement centralized logging
# - Set up automated security monitoring and alerting
```

**Challenge 2: Network Security Assessment**
```bash
# Perform a complete security assessment:
# - Use Nmap for network discovery and port scanning
# - Run vulnerability scans with OpenVAS or Nessus
# - Analyze web applications with Nikto and OWASP ZAP
# - Check for rootkits and malware
# - Generate a comprehensive security report
```

**Challenge 3: VPN Infrastructure**
```bash
# Set up a complete VPN infrastructure:
# - Deploy OpenVPN or WireGuard server
# - Configure multiple client access
# - Implement proper certificate management
# - Set up monitoring and logging
# - Create automated client provisioning
```

## 🚀 Next Steps

Excellent! You've mastered network security and firewalls. You can now:
- Configure and manage firewalls (UFW, iptables)
- Perform security assessments and vulnerability scanning
- Set up intrusion detection and prevention systems
- Implement centralized logging and SIEM solutions
- Configure VPN services for secure remote access
- Monitor and analyze security events
- Respond to security incidents effectively

**Ready for performance optimization?** Continue to [13-performance-monitoring.md](13-performance-monitoring.md) to learn about system performance monitoring, optimization, and troubleshooting.

---

> **Pro Tip**: Security is a continuous process, not a one-time setup. Regularly update your systems, monitor logs, perform security assessments, and stay informed about new threats. Defense in depth - use multiple layers of security! 🛡️