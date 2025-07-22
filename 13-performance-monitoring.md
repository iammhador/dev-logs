# 📊 Performance Monitoring: System Optimization and Troubleshooting

> **Master system performance analysis, monitoring tools, and optimization techniques**

## 📖 What You'll Learn

System performance monitoring is crucial for maintaining efficient and reliable systems. This chapter covers comprehensive performance analysis and optimization:

- System resource monitoring (CPU, Memory, Disk, Network)
- Performance monitoring tools and utilities
- Bottleneck identification and analysis
- System optimization techniques
- Automated monitoring and alerting
- Performance tuning best practices
- Capacity planning and scaling
- Troubleshooting performance issues

## 🌍 Why This Matters

**Critical applications:**
- **System Reliability**: Ensure systems run smoothly and efficiently
- **Cost Optimization**: Maximize resource utilization and reduce costs
- **User Experience**: Maintain fast response times and availability
- **Capacity Planning**: Predict and plan for future resource needs
- **Troubleshooting**: Quickly identify and resolve performance issues

## 🖥️ System Resource Monitoring

### CPU Monitoring

```bash
# Real-time CPU usage
$ top
top - 10:30:15 up 5 days,  2:15,  3 users,  load average: 0.45, 0.32, 0.28
Tasks: 234 total,   1 running, 233 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.1 id,  0.6 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7982.1 total,   1234.5 free,   3456.7 used,   3290.9 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   4123.8 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 www-data  20   0  123456  45678  12345 S  15.3   5.7   1:23.45 apache2
 5678 mysql     20   0  987654 234567  56789 S  12.1  29.4  12:34.56 mysqld

# Enhanced top with htop
$ htop
# Interactive process viewer with better visualization

# CPU usage per core
$ nproc                           # Number of CPU cores
4

$ lscpu                           # Detailed CPU information
Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Byte Order:                      Little Endian
CPU(s):                          4
On-line CPU(s) list:             0-3
Thread(s) per core:              2
Core(s) per socket:              2
Socket(s):                       1
NUMA node(s):                    1
Vendor ID:                       GenuineIntel
CPU family:                      6
Model:                           142
Model name:                      Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
Stepping:                        10
CPU MHz:                         1800.000
CPU max MHz:                     3400.0000
CPU min MHz:                     400.0000
BogoMIPS:                        3600.00

# CPU usage statistics
$ vmstat 1 5                     # Every 1 second, 5 times
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 1234567  89012 3456789    0    0    12    45  123  456  5  2 92  1  0
 0  0      0 1234567  89012 3456789    0    0     0     8  134  467  3  1 96  0  0

# Detailed CPU statistics with sar
$ sar -u 1 5                     # CPU utilization
Linux 5.4.0-74-generic (hostname)      12/15/2023      _x86_64_        (4 CPU)

10:30:16 AM     CPU     %user     %nice   %system   %iowait    %steal     %idle
10:30:17 AM     all      5.25      0.00      2.13      0.63      0.00     91.99
10:30:18 AM     all      4.87      0.00      1.89      0.25      0.00     92.99

# Per-CPU statistics
$ sar -P ALL 1 3                 # All CPUs

# CPU load average
$ uptime
 10:30:15 up 5 days,  2:15,  3 users,  load average: 0.45, 0.32, 0.28

$ cat /proc/loadavg
0.45 0.32 0.28 2/234 12345

# Process CPU usage
$ ps aux --sort=-%cpu | head -10
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
www-data  1234 15.3  5.7 123456 45678 ?        S    09:15   1:23 apache2
mysql     5678 12.1 29.4 987654 234567 ?       Sl   08:30  12:34 mysqld

# CPU usage by process over time
$ pidstat -u 1 5                 # All processes
$ pidstat -u -p 1234 1 5         # Specific process
```

### Memory Monitoring

```bash
# Memory usage overview
$ free -h
              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       3.4Gi       1.2Gi       234Mi       3.2Gi       4.0Gi
Swap:         2.0Gi          0B       2.0Gi

# Detailed memory information
$ cat /proc/meminfo
MemTotal:        8165432 kB
MemFree:         1264532 kB
MemAvailable:    4123456 kB
Buffers:          89012 kB
Cached:         3201234 kB
SwapCached:            0 kB
Active:         4567890 kB
Inactive:       2345678 kB
Active(anon):   2123456 kB
Inactive(anon):  123456 kB
Active(file):   2444434 kB
Inactive(file): 2222222 kB

# Memory usage by process
$ ps aux --sort=-%mem | head -10
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
mysql     5678 12.1 29.4 987654 234567 ?       Sl   08:30  12:34 mysqld
apache    1234 15.3  5.7 123456 45678 ?        S    09:15   1:23 apache2

# Memory statistics with sar
$ sar -r 1 5                     # Memory utilization
Linux 5.4.0-74-generic (hostname)      12/15/2023      _x86_64_        (4 CPU)

10:30:16 AM kbmemfree kbmemused  %memused kbbuffers  kbcached  kbcommit   %commit  kbactive   kbinact   kbdirty
10:30:17 AM   1264532   6900900     84.51     89012   3201234   4567890     55.93   4567890   2345678      1234

# Memory usage per process with smem
$ sudo apt install smem
$ smem -t
  PID User     Command                         Swap      USS      PSS      RSS
 1234 apache   apache2                            0    12345    23456    45678
 5678 mysql    mysqld                             0   123456   234567   456789
-------------------------------------------------------------------------------
   15 2        2 processes                        0   135801   258023   502467

# Memory mapping of a process
$ pmap -x 1234                   # Process memory map
$ cat /proc/1234/smaps           # Detailed memory mapping

# Check for memory leaks
$ valgrind --tool=memcheck --leak-check=full ./your_program

# Monitor swap usage
$ swapon --show
NAME      TYPE      SIZE USED PRIO
/dev/sda2 partition   2G   0B   -2

$ cat /proc/swaps
Filename                                Type            Size    Used    Priority
/dev/sda2                               partition       2097148 0       -2
```

### Disk I/O Monitoring

```bash
# Disk usage
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G   12G  7.2G  63% /
/dev/sda2       100G   45G   50G  48% /home
tmpfs           3.9G     0  3.9G   0% /dev/shm

# Inode usage
$ df -i
Filesystem      Inodes   IUsed   IFree IUse% Mounted on
/dev/sda1      1310720  123456 1187264   10% /
/dev/sda2      6553600  234567 6319033    4% /home

# Directory sizes
$ du -sh /var/log/*
1.2G    /var/log/apache2
456M    /var/log/mysql
123M    /var/log/syslog
89M     /var/log/auth.log

# Find large files
$ find / -type f -size +100M 2>/dev/null | head -10
/var/log/apache2/access.log
/var/lib/mysql/ibdata1
/home/user/large_file.iso

# Real-time disk I/O
$ iostat -x 1 5
Linux 5.4.0-74-generic (hostname)      12/15/2023      _x86_64_        (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           5.25    0.00    2.13    0.63    0.00   91.99

Device            r/s     w/s     rkB/s     wkB/s   rrqm/s   wrqm/s  %rrqm  %wrqm     await    r_await    w_await  svctm  %util
sda              12.34    5.67    123.45     67.89     0.12     2.34   0.96  29.23      8.45       6.78      12.34   2.45   4.32

# I/O statistics per process
$ iotop
Total DISK READ :       1.23 M/s | Total DISK WRITE :       456.78 K/s
Actual DISK READ:       1.23 M/s | Actual DISK WRITE:       456.78 K/s
  TID  PRIO  USER     DISK READ  DISK WRITE  SWAPIN     IO>    COMMAND
 1234 be/4 mysql       123.45 K/s   67.89 K/s  0.00 % 12.34 % mysqld
 5678 be/4 apache       45.67 K/s   23.45 K/s  0.00 %  5.67 % apache2

# Disk I/O per process with pidstat
$ pidstat -d 1 5                 # All processes
$ pidstat -d -p 1234 1 5         # Specific process

# Block device statistics
$ cat /proc/diskstats
   8       0 sda 123456 789 1234567 8901 234567 890 2345678 9012 0 12345 67890
   8       1 sda1 12345 67 123456 789 23456 78 234567 890 0 1234 5678

# Check disk health
$ sudo smartctl -a /dev/sda
$ sudo smartctl -H /dev/sda       # Health status only
```

### Network Monitoring

```bash
# Network interface statistics
$ ip -s link
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    RX: bytes  packets  errors  dropped overrun mcast
    1234567    8901     0       0       0       0
    TX: bytes  packets  errors  dropped carrier collsns
    1234567    8901     0       0       0       0

2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP mode DEFAULT group default qlen 1000
    link/ether aa:bb:cc:dd:ee:ff brd ff:ff:ff:ff:ff:ff
    RX: bytes  packets  errors  dropped overrun mcast
    12345678901 8901234  0       0       0       123
    TX: bytes  packets  errors  dropped carrier collsns
    9876543210  7654321  0       0       0       0

# Network statistics with sar
$ sar -n DEV 1 5                 # Network device statistics
Linux 5.4.0-74-generic (hostname)      12/15/2023      _x86_64_        (4 CPU)

10:30:16 AM     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s   rxcmp/s   txcmp/s  rxmcst/s   %ifutil
10:30:17 AM        lo      1.23      1.23      0.12      0.12      0.00      0.00      0.00      0.00
10:30:17 AM      eth0     45.67     34.56     67.89     45.67      0.00      0.00      0.12      0.05

# Real-time network usage
$ iftop                          # Interactive network usage
$ nethogs                        # Network usage per process
$ nload                          # Network load monitor

# Network connections
$ netstat -tuln                  # Listening ports
$ netstat -tun                   # All connections
$ ss -tuln                       # Modern alternative
$ ss -tun                        # All connections with ss

# Network connection statistics
$ netstat -s
Ip:
    123456 total packets received
    0 forwarded
    0 incoming packets discarded
    123456 incoming packets delivered
    98765 requests sent out
Tcp:
    1234 active connections openings
    567 passive connection openings
    89 failed connection attempts
    12 connection resets received

# Bandwidth monitoring
$ vnstat                         # Network traffic statistics
$ vnstat -d                      # Daily statistics
$ vnstat -m                      # Monthly statistics

# Network latency and packet loss
$ ping -c 10 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 time=12.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 time=11.8 ms
...
--- 8.8.8.8 ping statistics ---
10 packets transmitted, 10 received, 0% packet loss, time 9012ms
rtt min/avg/max/mdev = 11.234/12.567/13.890/0.789 ms

# Continuous network monitoring
$ mtr 8.8.8.8                   # My traceroute (combines ping and traceroute)
```

## 🔧 Advanced Monitoring Tools

### System Activity Reporter (SAR)

```bash
# Install sysstat package
$ sudo apt install sysstat

# Enable data collection
$ sudo systemctl enable sysstat
$ sudo systemctl start sysstat

# Configure data collection interval
$ sudo nano /etc/cron.d/sysstat
# Collect data every 10 minutes
*/10 * * * * root /usr/lib/sysstat/debian-sa1 1 1

# Generate daily reports
5 19 * * * root /usr/lib/sysstat/debian-sa2 -A

# View historical data
$ sar -u                         # CPU usage (today)
$ sar -u -f /var/log/sysstat/sa15  # CPU usage (15th of month)
$ sar -r                         # Memory usage
$ sar -d                         # Disk activity
$ sar -n DEV                     # Network statistics
$ sar -q                         # Load average and run queue
$ sar -w                         # Context switches and interrupts

# Generate comprehensive report
$ sar -A                         # All statistics

# Custom time range
$ sar -u -s 09:00:00 -e 17:00:00  # Business hours only

# Export data for analysis
$ sadf -d /var/log/sysstat/sa15 > sar_data.csv
```

### Nagios Monitoring

```bash
# Install Nagios
$ sudo apt update
$ sudo apt install nagios3 nagios-plugins

# Configure Nagios
$ sudo nano /etc/nagios3/nagios.cfg

# Main configuration file
cfg_file=/etc/nagios3/commands.cfg
cfg_dir=/etc/nagios3/conf.d
log_file=/var/log/nagios3/nagios.log
object_cache_file=/var/cache/nagios3/objects.cache
precached_object_file=/var/lib/nagios3/objects.precache
resource_file=/etc/nagios3/resource.cfg
status_file=/var/lib/nagios3/status.dat
status_update_interval=10
nagios_user=nagios
nagios_group=nagios
check_external_commands=1
command_check_interval=-1
command_file=/var/lib/nagios3/rw/nagios.cmd

# Define host
$ sudo nano /etc/nagios3/conf.d/localhost.cfg

define host {
    use                     linux-server
    host_name               localhost
    alias                   localhost
    address                 127.0.0.1
    max_check_attempts      5
    check_period            24x7
    notification_interval   30
    notification_period     24x7
}

# Define services
define service {
    use                     generic-service
    host_name               localhost
    service_description     CPU Load
    check_command           check_load!5.0!4.0!3.0!10.0!6.0!4.0
}

define service {
    use                     generic-service
    host_name               localhost
    service_description     Disk Space
    check_command           check_all_disks!20%!10%
}

define service {
    use                     generic-service
    host_name               localhost
    service_description     Memory Usage
    check_command           check_memory!80!90
}

# Custom check commands
$ sudo nano /etc/nagios3/commands.cfg

define command {
    command_name    check_memory
    command_line    /usr/lib/nagios/plugins/check_memory.sh -w $ARG1$ -c $ARG2$
}

# Memory check script
$ sudo nano /usr/lib/nagios/plugins/check_memory.sh

#!/bin/bash
WARNING=$1
CRITICAL=$2

MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')

if (( $(echo "$MEMORY_USAGE > $CRITICAL" | bc -l) )); then
    echo "CRITICAL - Memory usage is ${MEMORY_USAGE}%"
    exit 2
elif (( $(echo "$MEMORY_USAGE > $WARNING" | bc -l) )); then
    echo "WARNING - Memory usage is ${MEMORY_USAGE}%"
    exit 1
else
    echo "OK - Memory usage is ${MEMORY_USAGE}%"
    exit 0
fi

$ sudo chmod +x /usr/lib/nagios/plugins/check_memory.sh

# Restart Nagios
$ sudo systemctl restart nagios3

# Access web interface at http://localhost/nagios3
# Default credentials: nagiosadmin / nagiosadmin
```

### Zabbix Monitoring

```bash
# Install Zabbix repository
$ wget https://repo.zabbix.com/zabbix/5.4/ubuntu/pool/main/z/zabbix-release/zabbix-release_5.4-1+ubuntu20.04_all.deb
$ sudo dpkg -i zabbix-release_5.4-1+ubuntu20.04_all.deb
$ sudo apt update

# Install Zabbix server, frontend, and agent
$ sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-agent

# Install and configure MySQL
$ sudo apt install mysql-server
$ sudo mysql_secure_installation

# Create Zabbix database
$ sudo mysql -uroot -p
mysql> create database zabbix character set utf8 collate utf8_bin;
mysql> create user zabbix@localhost identified by 'password';
mysql> grant all privileges on zabbix.* to zabbix@localhost;
mysql> quit;

# Import initial schema
$ zcat /usr/share/doc/zabbix-server-mysql*/create.sql.gz | mysql -uzabbix -p zabbix

# Configure Zabbix server
$ sudo nano /etc/zabbix/zabbix_server.conf

DBPassword=password

# Configure PHP for Zabbix frontend
$ sudo nano /etc/zabbix/apache.conf

php_value max_execution_time 300
php_value memory_limit 128M
php_value post_max_size 16M
php_value upload_max_filesize 2M
php_value max_input_time 300
php_value max_input_vars 10000
php_value always_populate_raw_post_data -1
php_value date.timezone Europe/London

# Start Zabbix services
$ sudo systemctl restart zabbix-server zabbix-agent apache2
$ sudo systemctl enable zabbix-server zabbix-agent

# Access web interface at http://localhost/zabbix
# Default credentials: Admin / zabbix
```

### Prometheus and Grafana

```bash
# Install Prometheus
$ sudo useradd --no-create-home --shell /bin/false prometheus
$ sudo mkdir /etc/prometheus /var/lib/prometheus
$ sudo chown prometheus:prometheus /etc/prometheus /var/lib/prometheus

$ cd /tmp
$ wget https://github.com/prometheus/prometheus/releases/download/v2.30.3/prometheus-2.30.3.linux-amd64.tar.gz
$ tar xvf prometheus-2.30.3.linux-amd64.tar.gz
$ sudo cp prometheus-2.30.3.linux-amd64/prometheus /usr/local/bin/
$ sudo cp prometheus-2.30.3.linux-amd64/promtool /usr/local/bin/
$ sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool

# Configure Prometheus
$ sudo nano /etc/prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

# Create systemd service
$ sudo nano /etc/systemd/system/prometheus.service

[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target

# Install Node Exporter
$ wget https://github.com/prometheus/node_exporter/releases/download/v1.2.2/node_exporter-1.2.2.linux-amd64.tar.gz
$ tar xvf node_exporter-1.2.2.linux-amd64.tar.gz
$ sudo cp node_exporter-1.2.2.linux-amd64/node_exporter /usr/local/bin/
$ sudo useradd --no-create-home --shell /bin/false node_exporter
$ sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter

# Create Node Exporter service
$ sudo nano /etc/systemd/system/node_exporter.service

[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target

# Start services
$ sudo systemctl daemon-reload
$ sudo systemctl start prometheus node_exporter
$ sudo systemctl enable prometheus node_exporter

# Install Grafana
$ sudo apt-get install -y software-properties-common
$ sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
$ wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
$ sudo apt-get update
$ sudo apt-get install grafana

# Start Grafana
$ sudo systemctl start grafana-server
$ sudo systemctl enable grafana-server

# Access Grafana at http://localhost:3000
# Default credentials: admin / admin
```

## ⚡ Performance Optimization

### CPU Optimization

```bash
# Check CPU governor
$ cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
powersave

# Set performance governor
$ sudo cpupower frequency-set -g performance
$ echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Install and configure cpufrequtils
$ sudo apt install cpufrequtils
$ sudo nano /etc/default/cpufrequtils
GOVERNOR="performance"
MAX_SPEED="0"
MIN_SPEED="0"

# CPU affinity for processes
$ taskset -c 0,1 command              # Run on CPUs 0 and 1
$ taskset -p 0x3 1234                 # Set CPU affinity for PID 1234

# Process priority (nice values)
$ nice -n -10 command                 # Higher priority
$ renice -10 1234                     # Change priority of running process

# Real-time scheduling
$ chrt -f 99 command                  # FIFO real-time scheduling
$ chrt -r 50 command                  # Round-robin real-time scheduling

# Disable CPU mitigations for performance (security trade-off)
$ sudo nano /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash mitigations=off"
$ sudo update-grub
```

### Memory Optimization

```bash
# Tune virtual memory settings
$ sudo nano /etc/sysctl.conf

# Reduce swappiness (prefer RAM over swap)
vm.swappiness=10

# Increase dirty page cache
vm.dirty_ratio=15
vm.dirty_background_ratio=5

# Optimize for database workloads
vm.dirty_expire_centisecs=500
vm.dirty_writeback_centisecs=100

# Increase shared memory
kernel.shmmax=68719476736
kernel.shmall=4294967296

# Apply changes
$ sudo sysctl -p

# Huge pages configuration
$ echo 1024 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
$ sudo nano /etc/sysctl.conf
vm.nr_hugepages=1024

# Memory compaction
$ echo 1 | sudo tee /proc/sys/vm/compact_memory

# Drop caches (for testing)
$ sudo sync
$ echo 3 | sudo tee /proc/sys/vm/drop_caches

# Memory allocation policies
$ numactl --hardware                  # Show NUMA topology
$ numactl --cpubind=0 --membind=0 command  # Bind to specific NUMA node
```

### Disk I/O Optimization

```bash
# Check current I/O scheduler
$ cat /sys/block/sda/queue/scheduler
none mq-deadline [kyber] bfq

# Change I/O scheduler
$ echo mq-deadline | sudo tee /sys/block/sda/queue/scheduler

# Permanent I/O scheduler change
$ sudo nano /etc/default/grub
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash elevator=mq-deadline"
$ sudo update-grub

# Optimize mount options
$ sudo nano /etc/fstab
/dev/sda1 / ext4 defaults,noatime,nodiratime 0 1
/dev/sda2 /home ext4 defaults,noatime,nodiratime 0 2

# SSD optimizations
/dev/ssd1 /data ext4 defaults,noatime,discard 0 2

# Tune filesystem parameters
$ sudo tune2fs -o journal_data_writeback /dev/sda1
$ sudo tune2fs -O ^has_journal /dev/sda1  # Remove journal (risky)

# Adjust read-ahead
$ sudo blockdev --setra 4096 /dev/sda

# Configure I/O limits with cgroups
$ sudo nano /etc/systemd/system/myapp.service
[Service]
IOWeight=500
IODeviceWeight=/dev/sda 750
IOReadBandwidthMax=/dev/sda 100M
IOWriteBandwidthMax=/dev/sda 50M

# Optimize database storage
$ sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size=2G
innodb_log_file_size=256M
innodb_flush_log_at_trx_commit=2
innodb_flush_method=O_DIRECT
```

### Network Optimization

```bash
# Network buffer tuning
$ sudo nano /etc/sysctl.conf

# Increase network buffers
net.core.rmem_default=262144
net.core.rmem_max=16777216
net.core.wmem_default=262144
net.core.wmem_max=16777216

# TCP buffer tuning
net.ipv4.tcp_rmem=4096 65536 16777216
net.ipv4.tcp_wmem=4096 65536 16777216

# TCP congestion control
net.ipv4.tcp_congestion_control=bbr

# Increase connection tracking
net.netfilter.nf_conntrack_max=1048576

# Optimize for high-performance networking
net.core.netdev_max_backlog=5000
net.ipv4.tcp_window_scaling=1
net.ipv4.tcp_timestamps=1
net.ipv4.tcp_sack=1
net.ipv4.tcp_no_metrics_save=1

# Apply changes
$ sudo sysctl -p

# Network interface optimization
$ sudo ethtool -G eth0 rx 4096 tx 4096  # Increase ring buffers
$ sudo ethtool -K eth0 gro on           # Generic receive offload
$ sudo ethtool -K eth0 tso on           # TCP segmentation offload

# CPU affinity for network interrupts
$ sudo nano /etc/rc.local
echo 2 > /proc/irq/24/smp_affinity     # Bind network IRQ to CPU 1
```

## 📈 Automated Monitoring and Alerting

### Custom Monitoring Scripts

```bash
#!/bin/bash
# /usr/local/bin/system-monitor.sh

LOGFILE="/var/log/system-monitor.log"
ALERT_EMAIL="admin@example.com"
HOSTNAME=$(hostname)
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to send alerts
send_alert() {
    local subject="$1"
    local message="$2"
    echo "[$DATE] ALERT: $subject" >> $LOGFILE
    echo "$message" | mail -s "[$HOSTNAME] $subject" $ALERT_EMAIL
}

# Check CPU load
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
LOAD_THRESHOLD="4.0"
if (( $(echo "$LOAD_AVG > $LOAD_THRESHOLD" | bc -l) )); then
    send_alert "High CPU Load" "Current load average: $LOAD_AVG (threshold: $LOAD_THRESHOLD)"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
MEM_THRESHOLD="90"
if (( $(echo "$MEM_USAGE > $MEM_THRESHOLD" | bc -l) )); then
    send_alert "High Memory Usage" "Current memory usage: ${MEM_USAGE}% (threshold: ${MEM_THRESHOLD}%)"
fi

# Check disk usage
while read output; do
    usage=$(echo $output | awk '{print $5}' | sed 's/%//g')
    partition=$(echo $output | awk '{print $6}')
    if [ $usage -ge 90 ]; then
        send_alert "High Disk Usage" "Partition $partition is ${usage}% full"
    fi
done <<< "$(df -h | grep -vE '^Filesystem|tmpfs|cdrom')"

# Check service status
SERVICES=("apache2" "mysql" "ssh")
for service in "${SERVICES[@]}"; do
    if ! systemctl is-active --quiet $service; then
        send_alert "Service Down" "Service $service is not running"
    fi
done

# Check network connectivity
if ! ping -c 1 8.8.8.8 &> /dev/null; then
    send_alert "Network Connectivity" "Cannot reach external network (8.8.8.8)"
fi

# Log successful check
echo "[$DATE] System check completed" >> $LOGFILE

# Schedule with cron
# */5 * * * * /usr/local/bin/system-monitor.sh
```

### Performance Baseline Script

```bash
#!/bin/bash
# /usr/local/bin/performance-baseline.sh

OUTPUT_DIR="/var/log/performance-baseline"
DATE=$(date '+%Y%m%d_%H%M%S')
REPORT_FILE="$OUTPUT_DIR/baseline_$DATE.txt"

mkdir -p $OUTPUT_DIR

echo "Performance Baseline Report - $DATE" > $REPORT_FILE
echo "=========================================" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# System information
echo "SYSTEM INFORMATION:" >> $REPORT_FILE
echo "Hostname: $(hostname)" >> $REPORT_FILE
echo "Uptime: $(uptime)" >> $REPORT_FILE
echo "Kernel: $(uname -r)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# CPU information
echo "CPU INFORMATION:" >> $REPORT_FILE
lscpu >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Memory information
echo "MEMORY INFORMATION:" >> $REPORT_FILE
free -h >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Disk information
echo "DISK INFORMATION:" >> $REPORT_FILE
df -h >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Network information
echo "NETWORK INFORMATION:" >> $REPORT_FILE
ip addr show >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Performance metrics
echo "PERFORMANCE METRICS:" >> $REPORT_FILE
echo "Load Average: $(cat /proc/loadavg)" >> $REPORT_FILE
echo "Memory Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')" >> $REPORT_FILE
echo "Disk I/O: $(iostat -x 1 1 | tail -n +4)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Top processes
echo "TOP PROCESSES (CPU):" >> $REPORT_FILE
ps aux --sort=-%cpu | head -10 >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "TOP PROCESSES (Memory):" >> $REPORT_FILE
ps aux --sort=-%mem | head -10 >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Network connections
echo "NETWORK CONNECTIONS:" >> $REPORT_FILE
netstat -tuln >> $REPORT_FILE
echo "" >> $REPORT_FILE

echo "Baseline report saved to: $REPORT_FILE"
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What does a load average of 2.0 mean on a 4-core system?**
   <details>
   <summary>Answer</summary>
   
   A load average of 2.0 on a 4-core system means the system is 50% utilized on average. The system can handle up to 4.0 before being fully utilized.
   </details>

2. **What's the difference between buffer and cache in memory usage?**
   <details>
   <summary>Answer</summary>
   
   Buffers are used for block device I/O operations, while cache stores frequently accessed file contents. Both can be freed when applications need more memory.
   </details>

3. **What does %iowait in CPU statistics indicate?**
   <details>
   <summary>Answer</summary>
   
   %iowait shows the percentage of time the CPU is idle while waiting for I/O operations to complete. High iowait indicates disk or network bottlenecks.
   </details>

4. **How do you identify which process is causing high disk I/O?**
   <details>
   <summary>Answer</summary>
   
   Use `iotop` for real-time I/O monitoring or `pidstat -d` to see per-process disk statistics.
   </details>

### Hands-On Challenges

**Challenge 1: Complete Monitoring Setup**
```bash
# Set up comprehensive monitoring:
# - Install and configure Prometheus + Grafana
# - Create custom dashboards for system metrics
# - Set up alerting rules for critical thresholds
# - Implement automated reporting
# - Configure log aggregation and analysis
```

**Challenge 2: Performance Optimization**
```bash
# Optimize a system for specific workload:
# - Identify performance bottlenecks
# - Tune kernel parameters for the workload
# - Optimize application configurations
# - Implement caching strategies
# - Measure and document improvements
```

**Challenge 3: Capacity Planning**
```bash
# Create a capacity planning system:
# - Collect historical performance data
# - Analyze growth trends
# - Predict future resource requirements
# - Create scaling recommendations
# - Implement automated scaling triggers
```

## 🚀 Next Steps

Excellent! You've mastered performance monitoring and optimization. You can now:
- Monitor all system resources (CPU, memory, disk, network)
- Use advanced monitoring tools (SAR, Nagios, Prometheus, Grafana)
- Identify and resolve performance bottlenecks
- Optimize system performance for specific workloads
- Set up automated monitoring and alerting
- Plan for future capacity requirements
- Troubleshoot complex performance issues

**Ready for automation and scripting?** Continue to [14-automation-scripting.md](14-automation-scripting.md) to learn about automating system administration tasks and creating powerful scripts.

---

> **Pro Tip**: Performance monitoring is an ongoing process. Establish baselines, monitor trends, and optimize proactively rather than reactively. Always measure before and after changes to validate improvements! 📊