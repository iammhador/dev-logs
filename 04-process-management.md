# ⚙️ Process Management: Controlling System Resources

> **Master process control, monitoring, and system resource management in Linux**

## 📖 What You'll Learn

Process management is essential for system administration and troubleshooting. This chapter covers everything you need to know about controlling processes and system resources:

- Understanding processes and process hierarchy
- Monitoring running processes with `ps`, `top`, and `htop`
- Starting, stopping, and controlling processes
- Background and foreground job management
- Process signals and communication
- System resource monitoring
- Service management with systemd
- Performance optimization and troubleshooting

## 🌍 Why This Matters

**Critical applications:**
- **System Administration**: Monitor and control system resources
- **Troubleshooting**: Identify and resolve performance issues
- **Security**: Detect suspicious processes and resource abuse
- **Automation**: Manage services and background tasks
- **Performance**: Optimize system resource utilization

## 🔍 Understanding Processes

### Process Basics

```bash
# Every running program is a process
# Each process has:
# - PID (Process ID): Unique identifier
# - PPID (Parent Process ID): Parent process
# - UID/GID: User and group ownership
# - State: Running, sleeping, stopped, zombie
# - Priority: CPU scheduling priority
# - Memory usage: RAM and virtual memory

# View your current shell process
$ echo $$
1234

# View parent process ID
$ echo $PPID
1000

# Process hierarchy example:
# systemd (PID 1)
# ├── sshd (PID 500)
# │   └── sshd (PID 1000) - your SSH session
# │       └── bash (PID 1234) - your shell
# │           └── ps (PID 1500) - command you're running
```

### Process States

```bash
# Process states in Linux:
# R - Running or runnable
# S - Interruptible sleep (waiting for event)
# D - Uninterruptible sleep (usually I/O)
# T - Stopped (by signal or debugger)
# Z - Zombie (finished but not cleaned up)
# X - Dead (should never be seen)

# View process states
$ ps aux | head -5
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 225316  9876 ?        Ss   10:00   0:01 /sbin/init
root         2  0.0  0.0      0     0 ?        S    10:00   0:00 [kthreadd]
root         3  0.0  0.0      0     0 ?        I<   10:00   0:00 [rcu_gp]
user      1234  0.0  0.2  21532  5432 pts/0    Ss   10:30   0:00 -bash
```

## 📊 Monitoring Processes

### Using `ps` Command

```bash
# Basic process listing
$ ps
  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 1567 pts/0    00:00:00 ps

# Show all processes
$ ps aux
$ ps -ef

# Show process tree
$ ps auxf
$ ps -ef --forest
$ pstree

# Show processes for specific user
$ ps -u username
$ ps aux | grep username

# Show processes by command name
$ ps aux | grep nginx
$ pgrep nginx
$ pgrep -l nginx  # Show PID and name

# Show process hierarchy
$ ps -ejH
$ ps axjf

# Custom output format
$ ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu
  PID  PPID CMD                         %MEM %CPU
 1500  1234 firefox                     15.2 25.3
 1600  1234 chrome                      12.1 18.7
 1234     1 bash                         0.2  0.1
```

### Real-time Monitoring with `top`

```bash
# Basic top usage
$ top

top - 10:30:45 up 2 days,  3:15,  2 users,  load average: 0.15, 0.25, 0.30
Tasks: 125 total,   1 running, 124 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.2 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   8192.0 total,   2048.5 free,   3072.2 used,   3071.3 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   4608.1 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1500 user      20   0 2097152 524288  65536 S  25.3  15.2   5:23.45 firefox
 1600 user      20   0 1572864 393216  49152 S  18.7  12.1   3:45.67 chrome
 1234 user      20   0   21532   5432   3456 S   0.1   0.2   0:00.12 bash

# Top interactive commands:
# q - quit
# k - kill process (enter PID)
# r - renice process (change priority)
# u - show processes for specific user
# M - sort by memory usage
# P - sort by CPU usage
# T - sort by running time
# 1 - show individual CPU cores
# h - help

# Top with specific options
$ top -u username     # Show processes for specific user
$ top -p 1234,5678    # Monitor specific PIDs
$ top -n 1            # Run once and exit
$ top -b -n 1         # Batch mode (good for scripts)
```

### Enhanced Monitoring with `htop`

```bash
# Install htop (if not available)
$ sudo apt install htop  # Ubuntu/Debian
$ sudo yum install htop  # CentOS/RHEL

# Run htop
$ htop

# htop features:
# - Color-coded display
# - Mouse support
# - Tree view (F5)
# - Search (F3)
# - Filter (F4)
# - Kill process (F9)
# - Nice/renice (F7/F8)
# - Setup (F2)

# htop command line options
$ htop -u username    # Show processes for specific user
$ htop -p 1234,5678   # Monitor specific PIDs
$ htop -t             # Tree view
$ htop -s PERCENT_CPU # Sort by CPU usage
```

### System Resource Monitoring

```bash
# Memory usage
$ free -h
              total        used        free      shared  buff/cache   available
Mem:          8.0Gi       3.0Gi       2.0Gi       256Mi       3.0Gi       4.6Gi
Swap:         2.0Gi          0B       2.0Gi

# Detailed memory information
$ cat /proc/meminfo | head -10
MemTotal:        8388608 kB
MemFree:         2097152 kB
MemAvailable:    4718592 kB
Buffers:          524288 kB
Cached:          2621440 kB

# CPU information
$ lscpu
Architecture:        x86_64
CPU op-mode(s):      32-bit, 64-bit
Byte Order:          Little Endian
CPU(s):              4
On-line CPU(s) list: 0-3
Thread(s) per core:  2
Core(s) per socket:  2
Socket(s):           1

# Load average
$ uptime
 10:30:45 up 2 days,  3:15,  2 users,  load average: 0.15, 0.25, 0.30

$ cat /proc/loadavg
0.15 0.25 0.30 2/125 1567

# I/O statistics
$ iostat 1 3  # 1-second intervals, 3 times
Linux 5.4.0 (hostname)     12/15/2023      _x86_64_        (4 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.50    0.00    1.25    0.25    0.00   96.00

Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               5.25        125.50        75.25     125500      75250
```

## 🎮 Process Control

### Starting and Stopping Processes

```bash
# Start process in foreground
$ long_running_command

# Start process in background
$ long_running_command &
[1] 1234

# Start with nohup (survives logout)
$ nohup long_running_command &
[1] 1234
nohup: ignoring input and appending output to 'nohup.out'

# Start with custom output redirection
$ nohup long_running_command > output.log 2>&1 &

# Disown process (remove from job control)
$ long_running_command &
$ disown %1

# Start process with specific priority
$ nice -n 10 cpu_intensive_task  # Lower priority
$ nice -n -5 important_task      # Higher priority (requires sudo)
```

### Job Control

```bash
# List active jobs
$ jobs
[1]+  Running                 long_running_command &
[2]-  Stopped                 vim file.txt

# Bring job to foreground
$ fg %1        # Bring job 1 to foreground
$ fg           # Bring most recent job to foreground

# Send job to background
$ bg %1        # Send job 1 to background
$ bg           # Send most recent job to background

# Suspend current foreground process
# Press Ctrl+Z
$ vim file.txt
^Z
[1]+  Stopped                 vim file.txt

# Resume suspended job in background
$ bg %1
[1]+ vim file.txt &

# Kill job
$ kill %1      # Kill job 1
$ kill %2      # Kill job 2
```

### Process Signals

```bash
# Common signals:
# SIGTERM (15) - Graceful termination (default)
# SIGKILL (9)  - Force kill (cannot be caught)
# SIGSTOP (19) - Stop process (cannot be caught)
# SIGCONT (18) - Continue stopped process
# SIGHUP (1)   - Hangup (often used to reload config)
# SIGINT (2)   - Interrupt (Ctrl+C)
# SIGQUIT (3)  - Quit (Ctrl+\)

# Send signals to processes
$ kill 1234           # Send SIGTERM to PID 1234
$ kill -9 1234        # Send SIGKILL to PID 1234
$ kill -TERM 1234     # Send SIGTERM (same as default)
$ kill -HUP 1234      # Send SIGHUP (reload config)
$ kill -STOP 1234     # Stop process
$ kill -CONT 1234     # Continue process

# Kill processes by name
$ killall firefox     # Kill all firefox processes
$ killall -9 firefox  # Force kill all firefox processes
$ pkill firefox       # Kill processes matching pattern
$ pkill -f "python script.py"  # Kill by full command line

# Kill processes by user
$ pkill -u username   # Kill all processes by user
$ sudo pkill -u username  # Kill as root

# Interactive process killing
$ top                 # Press 'k' and enter PID
$ htop                # Press F9 and select signal
```

### Process Priority Management

```bash
# View process priorities
$ ps -eo pid,ni,pri,pcpu,comm
  PID  NI PRI %CPU COMMAND
 1234   0  20  0.1 bash
 1500  10  30  5.2 backup_script
 1600 -10  10 15.3 important_app

# Change priority of running process
$ sudo renice 10 1234      # Lower priority (higher nice value)
$ sudo renice -5 1234      # Higher priority (lower nice value)
$ sudo renice 0 1234       # Normal priority

# Change priority by process name
$ sudo renice 10 $(pgrep firefox)

# Start process with specific priority
$ nice -n 19 backup_script.sh    # Lowest priority
$ nice -n 0 normal_script.sh     # Normal priority
$ sudo nice -n -20 critical_app  # Highest priority

# Real-time priority (use with caution)
$ sudo chrt -f 50 critical_realtime_app  # FIFO scheduling
$ sudo chrt -r 50 critical_realtime_app  # Round-robin scheduling
```

## 🔧 Service Management with systemd

### Basic Service Operations

```bash
# Check service status
$ sudo systemctl status nginx
● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2023-12-15 10:00:00 UTC; 2h 30min ago
     Docs: man:nginx(8)
  Process: 1234 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
  Process: 1235 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
 Main PID: 1236 (nginx)
    Tasks: 5 (limit: 4915)
   Memory: 15.2M
   CGroup: /system.slice/nginx.service
           ├─1236 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
           ├─1237 nginx: worker process
           └─1238 nginx: worker process

# Start/stop/restart services
$ sudo systemctl start nginx
$ sudo systemctl stop nginx
$ sudo systemctl restart nginx
$ sudo systemctl reload nginx    # Reload config without restart

# Enable/disable services (auto-start at boot)
$ sudo systemctl enable nginx
$ sudo systemctl disable nginx

# Check if service is enabled
$ systemctl is-enabled nginx
enabled

# Check if service is active
$ systemctl is-active nginx
active
```

### Service Management Commands

```bash
# List all services
$ systemctl list-units --type=service
$ systemctl list-units --type=service --state=running
$ systemctl list-units --type=service --state=failed

# List all unit files
$ systemctl list-unit-files --type=service

# Show service dependencies
$ systemctl list-dependencies nginx

# View service logs
$ sudo journalctl -u nginx
$ sudo journalctl -u nginx -f        # Follow logs
$ sudo journalctl -u nginx --since today
$ sudo journalctl -u nginx --since "2023-12-15 10:00:00"

# Mask/unmask services (prevent starting)
$ sudo systemctl mask nginx
$ sudo systemctl unmask nginx

# Edit service configuration
$ sudo systemctl edit nginx          # Create override file
$ sudo systemctl edit --full nginx   # Edit full unit file

# Reload systemd configuration
$ sudo systemctl daemon-reload
```

### Creating Custom Services

```bash
# Create a simple service file
$ sudo nano /etc/systemd/system/myapp.service

[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start the service
$ sudo systemctl daemon-reload
$ sudo systemctl enable myapp
$ sudo systemctl start myapp
$ sudo systemctl status myapp

# Service types:
# simple - Default, process doesn't fork
# forking - Process forks and parent exits
# oneshot - Process exits after completion
# notify - Process sends notification when ready
# idle - Waits for other jobs to complete
```

## 📈 Performance Monitoring and Optimization

### System Performance Analysis

```bash
# CPU usage over time
$ sar -u 1 10         # CPU usage every 1 second, 10 times
Linux 5.4.0 (hostname)     12/15/2023      _x86_64_        (4 CPU)

10:30:01 AM     CPU     %user     %nice   %system   %iowait    %steal     %idle
10:30:02 AM     all      2.50      0.00      1.25      0.25      0.00     96.00
10:30:03 AM     all      3.75      0.00      1.50      0.50      0.00     94.25

# Memory usage over time
$ sar -r 1 5          # Memory usage every 1 second, 5 times

# I/O statistics
$ sar -b 1 5          # I/O statistics
$ sar -d 1 5          # Disk statistics

# Network statistics
$ sar -n DEV 1 5      # Network device statistics

# Generate system activity report
$ sar -A > system_report.txt
```

### Process Resource Usage

```bash
# Detailed process information
$ cat /proc/1234/status
Name:	firefox
State:	S (sleeping)
Pid:	1234
PPid:	1000
VmPeak:	 2097152 kB
VmSize:	 1572864 kB
VmRSS:	  524288 kB

# Process memory maps
$ cat /proc/1234/maps | head -5
7f8b4c000000-7f8b4c021000 rw-p 00000000 00:00 0 
7f8b4c021000-7f8b50000000 ---p 00000000 00:00 0 
7f8b50000000-7f8b50021000 rw-p 00000000 00:00 0 

# Process file descriptors
$ ls -l /proc/1234/fd/
total 0
lrwx------ 1 user user 64 Dec 15 10:30 0 -> /dev/pts/0
lrwx------ 1 user user 64 Dec 15 10:30 1 -> /dev/pts/0
lrwx------ 1 user user 64 Dec 15 10:30 2 -> /dev/pts/0

# Process environment
$ cat /proc/1234/environ | tr '\0' '\n' | head -5
PATH=/usr/local/bin:/usr/bin:/bin
HOME=/home/user
USER=user
SHELL=/bin/bash
TERM=xterm-256color

# Process command line
$ cat /proc/1234/cmdline
firefox--no-remote--profile
```

### Resource Monitoring Scripts

```bash
#!/bin/bash
# system-monitor.sh - Comprehensive system monitoring

echo "=== System Performance Monitor ==="
echo "Date: $(date)"
echo

# CPU usage
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print "User: " $2 ", System: " $4 ", Idle: " $8}'
echo

# Memory usage
echo "Memory Usage:"
free -h | grep -E "Mem|Swap"
echo

# Load average
echo "Load Average:"
uptime | awk -F'load average:' '{print $2}'
echo

# Top 5 CPU consumers
echo "Top 5 CPU Consumers:"
ps aux --sort=-%cpu | head -6 | awk '{print $11 " (" $3 "%)"}'  | tail -5
echo

# Top 5 Memory consumers
echo "Top 5 Memory Consumers:"
ps aux --sort=-%mem | head -6 | awk '{print $11 " (" $4 "%)"}'  | tail -5
echo

# Disk usage
echo "Disk Usage:"
df -h | grep -E "^/dev"
echo

echo "=== Monitor Complete ==="
```

### Performance Optimization Tips

```bash
# Find resource-intensive processes
$ ps aux --sort=-%cpu | head -10    # Top CPU users
$ ps aux --sort=-%mem | head -10    # Top memory users

# Find processes with many open files
$ lsof | awk '{print $2}' | sort | uniq -c | sort -nr | head -10

# Monitor process creation
$ sudo sysctl kernel.fork_rate
$ watch -n 1 'ps aux | wc -l'

# Check for zombie processes
$ ps aux | grep -E "<defunct>|Z"

# Monitor system calls
$ strace -p 1234          # Trace system calls for PID 1234
$ strace -c command       # Count system calls

# Profile CPU usage
$ perf top                # Real-time CPU profiling
$ perf record command     # Record performance data
$ perf report             # Analyze recorded data
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between `kill` and `killall`?**
   <details>
   <summary>Answer</summary>
   
   `kill` terminates a specific process by PID, while `killall` terminates all processes with a specific name.
   </details>

2. **How do you start a process that survives logout?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   nohup command &
   # or
   command &
   disown
   ```
   </details>

3. **What does a load average of 2.0 mean on a 4-core system?**
   <details>
   <summary>Answer</summary>
   
   The system is 50% utilized. Load average represents the number of processes waiting for CPU time. 2.0 on a 4-core system means 2 cores are fully utilized on average.
   </details>

4. **How do you change the priority of a running process?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   sudo renice 10 PID    # Lower priority
   sudo renice -5 PID    # Higher priority
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Process Monitoring Dashboard**
```bash
# Create a script that displays:
# - Top 5 CPU-consuming processes
# - Top 5 memory-consuming processes
# - Current load average
# - Available memory
# - Number of running processes
```

**Challenge 2: Service Management**
```bash
# Create a custom systemd service for a simple application
# Configure it to:
# - Start automatically at boot
# - Restart on failure
# - Log to a specific file
# - Run as a non-root user
```

**Challenge 3: Performance Troubleshooting**
```bash
# Simulate a high CPU load and:
# - Identify the problematic process
# - Reduce its priority
# - Monitor the impact
# - Create a script to automatically detect and handle such situations
```

## 🚀 Next Steps

Excellent! You've mastered Linux process management. You can now:
- Monitor system processes and resource usage
- Control process execution and priority
- Manage background jobs effectively
- Work with systemd services
- Troubleshoot performance issues
- Optimize system resource utilization

**Ready for networking fundamentals?** Continue to [05-networking-basics.md](05-networking-basics.md) to learn about network concepts and protocols.

---

> **Pro Tip**: Use `htop` for interactive process management, `systemctl` for service control, and always check system load before making changes. Remember that killing processes with `-9` should be a last resort - try graceful termination first! ⚙️