# 🔍 Troubleshooting & Debugging: Advanced Problem-Solving Techniques

> **Master systematic troubleshooting, debugging tools, and problem resolution strategies**

## 📖 What You'll Learn

Troubleshooting is a critical skill for any system administrator. This chapter covers comprehensive problem-solving techniques:

- Systematic troubleshooting methodology
- Advanced debugging tools and techniques
- Network troubleshooting and analysis
- System performance debugging
- Application and service debugging
- Log analysis and correlation
- Root cause analysis techniques
- Documentation and knowledge management
- Preventive measures and monitoring

## 🌍 Why This Matters

**Critical applications:**
- **Rapid Problem Resolution**: Minimize downtime and service disruption
- **Root Cause Analysis**: Prevent recurring issues
- **System Reliability**: Maintain stable and predictable systems
- **Cost Reduction**: Reduce operational costs through efficient problem resolution
- **Knowledge Building**: Create organizational knowledge base for future issues

## 🔧 Systematic Troubleshooting Methodology

### The ITIL Problem-Solving Process

```bash
# 1. IDENTIFY - What is the problem?
# 2. INVESTIGATE - Gather information
# 3. DIAGNOSE - Analyze the data
# 4. RESOLVE - Implement solution
# 5. VERIFY - Confirm resolution
# 6. DOCUMENT - Record findings

#!/bin/bash
# troubleshooting-template.sh - Systematic troubleshooting framework

TROUBLE_LOG="/var/log/troubleshooting-$(date +%Y%m%d_%H%M%S).log"
ISSUE_ID="ISSUE-$(date +%Y%m%d-%H%M%S)"

log_step() {
    local step="$1"
    local description="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$ISSUE_ID] [$step] $description" | tee -a "$TROUBLE_LOG"
}

# Step 1: Identify the problem
identify_problem() {
    log_step "IDENTIFY" "Problem identification started"
    
    echo "Problem Description:"
    echo "- What is happening?"
    echo "- When did it start?"
    echo "- Who is affected?"
    echo "- What is the impact?"
    
    # Gather initial symptoms
    log_step "IDENTIFY" "System uptime: $(uptime)"
    log_step "IDENTIFY" "Load average: $(cat /proc/loadavg)"
    log_step "IDENTIFY" "Memory usage: $(free -h | grep Mem)"
    log_step "IDENTIFY" "Disk usage: $(df -h / | tail -1)"
    
    # Check recent system changes
    log_step "IDENTIFY" "Recent package changes:"
    grep "$(date +%Y-%m-%d)" /var/log/dpkg.log | tail -10 | tee -a "$TROUBLE_LOG"
    
    # Check system logs for errors
    log_step "IDENTIFY" "Recent system errors:"
    journalctl --since "1 hour ago" --priority=err | tail -20 | tee -a "$TROUBLE_LOG"
}

# Step 2: Investigate and gather information
investigate_issue() {
    log_step "INVESTIGATE" "Information gathering started"
    
    # System information
    log_step "INVESTIGATE" "Hostname: $(hostname)"
    log_step "INVESTIGATE" "Kernel: $(uname -r)"
    log_step "INVESTIGATE" "OS: $(lsb_release -d | cut -f2)"
    
    # Network connectivity
    log_step "INVESTIGATE" "Network connectivity test:"
    if ping -c 3 8.8.8.8 &>/dev/null; then
        log_step "INVESTIGATE" "External connectivity: OK"
    else
        log_step "INVESTIGATE" "External connectivity: FAILED"
    fi
    
    # Service status
    log_step "INVESTIGATE" "Critical services status:"
    for service in ssh nginx apache2 mysql postgresql; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log_step "INVESTIGATE" "Service $service: RUNNING"
        else
            log_step "INVESTIGATE" "Service $service: NOT RUNNING"
        fi
    done
    
    # Resource utilization
    log_step "INVESTIGATE" "Top CPU consumers:"
    ps aux --sort=-%cpu | head -10 | tee -a "$TROUBLE_LOG"
    
    log_step "INVESTIGATE" "Top memory consumers:"
    ps aux --sort=-%mem | head -10 | tee -a "$TROUBLE_LOG"
    
    # Disk I/O
    log_step "INVESTIGATE" "Disk I/O statistics:"
    iostat -x 1 3 | tee -a "$TROUBLE_LOG"
}

# Step 3: Diagnose the issue
diagnose_issue() {
    log_step "DIAGNOSE" "Analysis started"
    
    # Analyze patterns in logs
    log_step "DIAGNOSE" "Analyzing error patterns:"
    
    # Common error patterns
    local error_patterns=(
        "out of memory"
        "disk full"
        "connection refused"
        "timeout"
        "permission denied"
        "segmentation fault"
        "kernel panic"
    )
    
    for pattern in "${error_patterns[@]}"; do
        local count=$(journalctl --since "1 hour ago" | grep -i "$pattern" | wc -l)
        if [[ $count -gt 0 ]]; then
            log_step "DIAGNOSE" "Found $count occurrences of: $pattern"
        fi
    done
    
    # Check for resource exhaustion
    local mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    
    log_step "DIAGNOSE" "Resource analysis:"
    log_step "DIAGNOSE" "Memory usage: ${mem_usage}%"
    log_step "DIAGNOSE" "Disk usage: ${disk_usage}%"
    log_step "DIAGNOSE" "Load average: $load_avg"
    
    # Threshold checks
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        log_step "DIAGNOSE" "CRITICAL: High memory usage detected"
    fi
    
    if [[ $disk_usage -gt 90 ]]; then
        log_step "DIAGNOSE" "CRITICAL: High disk usage detected"
    fi
    
    if (( $(echo "$load_avg > 4.0" | bc -l) )); then
        log_step "DIAGNOSE" "WARNING: High load average detected"
    fi
}

# Step 4: Implement resolution
resolve_issue() {
    log_step "RESOLVE" "Resolution implementation started"
    
    echo "Common resolution steps:"
    echo "1. Restart affected services"
    echo "2. Clear temporary files"
    echo "3. Adjust configuration"
    echo "4. Apply patches/updates"
    echo "5. Scale resources"
    
    # Example automated fixes
    # Clear temporary files if disk is full
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 90 ]]; then
        log_step "RESOLVE" "Attempting to clear temporary files"
        find /tmp -type f -atime +7 -delete 2>/dev/null
        find /var/tmp -type f -atime +7 -delete 2>/dev/null
        apt-get clean 2>/dev/null
        log_step "RESOLVE" "Temporary files cleared"
    fi
}

# Step 5: Verify resolution
verify_resolution() {
    log_step "VERIFY" "Resolution verification started"
    
    # Re-run initial checks
    log_step "VERIFY" "Post-resolution system status:"
    log_step "VERIFY" "Load average: $(cat /proc/loadavg)"
    log_step "VERIFY" "Memory usage: $(free -h | grep Mem)"
    log_step "VERIFY" "Disk usage: $(df -h / | tail -1)"
    
    # Test functionality
    if ping -c 3 8.8.8.8 &>/dev/null; then
        log_step "VERIFY" "Network connectivity: VERIFIED"
    else
        log_step "VERIFY" "Network connectivity: STILL FAILING"
    fi
}

# Step 6: Document findings
document_findings() {
    log_step "DOCUMENT" "Documentation started"
    
    cat >> "$TROUBLE_LOG" << EOF

=== TROUBLESHOOTING SUMMARY ===
Issue ID: $ISSUE_ID
Date: $(date)
Duration: [TO BE FILLED]
Severity: [TO BE FILLED]
Root Cause: [TO BE FILLED]
Resolution: [TO BE FILLED]
Preventive Measures: [TO BE FILLED]
Lessons Learned: [TO BE FILLED]

=== FOLLOW-UP ACTIONS ===
- [ ] Monitor for recurrence
- [ ] Update documentation
- [ ] Implement preventive measures
- [ ] Review and improve monitoring
EOF
    
    log_step "DOCUMENT" "Troubleshooting log saved to: $TROUBLE_LOG"
}

# Main execution
echo "Starting systematic troubleshooting for Issue ID: $ISSUE_ID"
identify_problem
investigate_issue
diagnose_issue
resolve_issue
verify_resolution
document_findings

echo "Troubleshooting completed. Log file: $TROUBLE_LOG"
```

## 🔍 Advanced Debugging Tools

### System Call Tracing with strace

```bash
# Trace system calls for a running process
$ strace -p 1234
execve("/bin/ls", ["ls", "-la"], 0x7fff8b7e1d40 /* 23 vars */) = 0
brk(NULL)                               = 0x55a8c9e1a000
access("/etc/ld.so.noinherit", F_OK)      = -1 ENOENT (No such file or directory)
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f8b5c9e1000

# Trace specific system calls
$ strace -e trace=open,read,write -p 1234

# Trace file operations
$ strace -e trace=file ls /home

# Trace network operations
$ strace -e trace=network curl http://example.com

# Save trace to file
$ strace -o trace.log -p 1234

# Trace with timestamps
$ strace -t -p 1234

# Trace child processes
$ strace -f -p 1234

# Count system calls
$ strace -c ls /home
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 28.57    0.000020           4         5           mmap
 21.43    0.000015           3         5           close
 14.29    0.000010           2         5           fstat
 14.29    0.000010           5         2           getdents64

# Advanced strace usage
#!/bin/bash
# debug-application.sh

APP_PID="$1"
OUTPUT_DIR="/tmp/debug-$(date +%Y%m%d_%H%M%S)"

if [[ -z "$APP_PID" ]]; then
    echo "Usage: $0 <PID>"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "Starting comprehensive debugging for PID: $APP_PID"
echo "Output directory: $OUTPUT_DIR"

# System call trace
echo "Collecting system call trace..."
strace -o "$OUTPUT_DIR/syscalls.log" -f -t -p "$APP_PID" &
STRACE_PID=$!

# Library call trace
echo "Collecting library call trace..."
ltrace -o "$OUTPUT_DIR/libcalls.log" -f -t -p "$APP_PID" &
LTRACE_PID=$!

# Memory usage
echo "Monitoring memory usage..."
while kill -0 "$APP_PID" 2>/dev/null; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') $(cat /proc/$APP_PID/status | grep VmRSS)" >> "$OUTPUT_DIR/memory.log"
    sleep 5
done &
MEMORY_PID=$!

# File descriptor usage
echo "Monitoring file descriptors..."
while kill -0 "$APP_PID" 2>/dev/null; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') FDs: $(ls /proc/$APP_PID/fd | wc -l)" >> "$OUTPUT_DIR/fds.log"
    sleep 5
done &
FD_PID=$!

echo "Debugging started. Press Ctrl+C to stop."

# Cleanup function
cleanup() {
    echo "Stopping debugging..."
    kill $STRACE_PID $LTRACE_PID $MEMORY_PID $FD_PID 2>/dev/null
    echo "Debug data saved to: $OUTPUT_DIR"
}

trap cleanup SIGINT SIGTERM

# Wait for user interrupt
wait
```

### Process Debugging with gdb

```bash
# Attach to running process
$ gdb -p 1234
(gdb) bt                    # Show backtrace
(gdb) info threads          # Show all threads
(gdb) thread 2              # Switch to thread 2
(gdb) print variable_name   # Print variable value
(gdb) continue              # Continue execution
(gdb) detach                # Detach from process

# Debug core dump
$ gdb /path/to/binary /path/to/core
(gdb) bt                    # Show backtrace at crash
(gdb) info registers        # Show register values
(gdb) disassemble          # Show assembly code

# Generate core dump
$ ulimit -c unlimited       # Enable core dumps
$ echo '/tmp/core.%e.%p' | sudo tee /proc/sys/kernel/core_pattern

# Debug script for application crashes
#!/bin/bash
# crash-debugger.sh

APP_NAME="$1"
CORE_DIR="/tmp"
DEBUG_LOG="/var/log/crash-debug.log"

if [[ -z "$APP_NAME" ]]; then
    echo "Usage: $0 <application_name>"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$DEBUG_LOG"
}

# Find the binary
BINARY_PATH=$(which "$APP_NAME")
if [[ -z "$BINARY_PATH" ]]; then
    log "ERROR: Binary not found for $APP_NAME"
    exit 1
fi

# Find core dump
CORE_FILE=$(find "$CORE_DIR" -name "core.$APP_NAME.*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)

if [[ -z "$CORE_FILE" ]]; then
    log "ERROR: No core dump found for $APP_NAME"
    exit 1
fi

log "Analyzing crash for $APP_NAME"
log "Binary: $BINARY_PATH"
log "Core dump: $CORE_FILE"

# Generate debug report
DEBUG_REPORT="/tmp/crash-report-$(date +%Y%m%d_%H%M%S).txt"

cat > "$DEBUG_REPORT" << EOF
Crash Analysis Report
====================
Application: $APP_NAME
Binary: $BINARY_PATH
Core Dump: $CORE_FILE
Analysis Date: $(date)

Backtrace:
EOF

# Get backtrace
gdb -batch -ex "bt" -ex "quit" "$BINARY_PATH" "$CORE_FILE" >> "$DEBUG_REPORT" 2>&1

echo "" >> "$DEBUG_REPORT"
echo "Thread Information:" >> "$DEBUG_REPORT"
gdb -batch -ex "info threads" -ex "quit" "$BINARY_PATH" "$CORE_FILE" >> "$DEBUG_REPORT" 2>&1

echo "" >> "$DEBUG_REPORT"
echo "Register Information:" >> "$DEBUG_REPORT"
gdb -batch -ex "info registers" -ex "quit" "$BINARY_PATH" "$CORE_FILE" >> "$DEBUG_REPORT" 2>&1

log "Debug report generated: $DEBUG_REPORT"

# Send alert
if command -v mail &> /dev/null; then
    mail -s "Application Crash: $APP_NAME" admin@example.com < "$DEBUG_REPORT"
fi
```

### Network Debugging

```bash
# Comprehensive network debugging script
#!/bin/bash
# network-debug.sh

DEBUG_LOG="/tmp/network-debug-$(date +%Y%m%d_%H%M%S).log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$DEBUG_LOG"
}

log "Starting network debugging"

# Basic connectivity tests
log "=== BASIC CONNECTIVITY ==="
log "Testing localhost connectivity:"
if ping -c 3 127.0.0.1 &>/dev/null; then
    log "Localhost: OK"
else
    log "Localhost: FAILED"
fi

log "Testing gateway connectivity:"
GATEWAY=$(ip route | grep default | awk '{print $3}' | head -1)
if [[ -n "$GATEWAY" ]]; then
    if ping -c 3 "$GATEWAY" &>/dev/null; then
        log "Gateway ($GATEWAY): OK"
    else
        log "Gateway ($GATEWAY): FAILED"
    fi
else
    log "No default gateway found"
fi

log "Testing external connectivity:"
if ping -c 3 8.8.8.8 &>/dev/null; then
    log "External (8.8.8.8): OK"
else
    log "External (8.8.8.8): FAILED"
fi

log "Testing DNS resolution:"
if nslookup google.com &>/dev/null; then
    log "DNS resolution: OK"
else
    log "DNS resolution: FAILED"
fi

# Interface information
log "=== INTERFACE INFORMATION ==="
log "Network interfaces:"
ip addr show | tee -a "$DEBUG_LOG"

log "Routing table:"
ip route show | tee -a "$DEBUG_LOG"

log "ARP table:"
arp -a | tee -a "$DEBUG_LOG"

# Port and connection analysis
log "=== PORT AND CONNECTION ANALYSIS ==="
log "Listening ports:"
netstat -tuln | tee -a "$DEBUG_LOG"

log "Active connections:"
netstat -tun | head -20 | tee -a "$DEBUG_LOG"

log "Connection states summary:"
netstat -tun | awk 'NR>2 {print $6}' | sort | uniq -c | tee -a "$DEBUG_LOG"

# DNS configuration
log "=== DNS CONFIGURATION ==="
log "DNS servers:"
cat /etc/resolv.conf | tee -a "$DEBUG_LOG"

log "DNS resolution test:"
for dns in 8.8.8.8 1.1.1.1 208.67.222.222; do
    response_time=$(dig @"$dns" google.com | grep "Query time" | awk '{print $4}')
    if [[ -n "$response_time" ]]; then
        log "DNS $dns: ${response_time}ms"
    else
        log "DNS $dns: FAILED"
    fi
done

# Firewall status
log "=== FIREWALL STATUS ==="
if command -v ufw &> /dev/null; then
    log "UFW status:"
    ufw status verbose | tee -a "$DEBUG_LOG"
fi

if command -v iptables &> /dev/null; then
    log "iptables rules:"
    iptables -L -n | tee -a "$DEBUG_LOG"
fi

# Network performance
log "=== NETWORK PERFORMANCE ==="
log "Network interface statistics:"
cat /proc/net/dev | tee -a "$DEBUG_LOG"

log "Network errors:"
for interface in $(ip link show | grep -E '^[0-9]+:' | cut -d: -f2 | tr -d ' '); do
    if [[ "$interface" != "lo" ]]; then
        errors=$(cat "/sys/class/net/$interface/statistics/rx_errors" 2>/dev/null)
        dropped=$(cat "/sys/class/net/$interface/statistics/rx_dropped" 2>/dev/null)
        log "Interface $interface: RX errors=$errors, dropped=$dropped"
    fi
done

# Advanced diagnostics
log "=== ADVANCED DIAGNOSTICS ==="
log "MTU discovery test:"
ping -M do -s 1472 -c 1 8.8.8.8 &>/dev/null
if [[ $? -eq 0 ]]; then
    log "MTU 1500: OK"
else
    log "MTU 1500: FRAGMENTATION NEEDED"
fi

log "Traceroute to 8.8.8.8:"
traceroute -n 8.8.8.8 | head -10 | tee -a "$DEBUG_LOG"

log "Network debugging completed. Log saved to: $DEBUG_LOG"

# Specific service debugging
debug_web_service() {
    local url="$1"
    local service_log="/tmp/web-debug-$(date +%Y%m%d_%H%M%S).log"
    
    log "Debugging web service: $url"
    
    # HTTP response test
    log "HTTP response test:"
    curl -I -s -w "HTTP Code: %{http_code}\nTotal Time: %{time_total}s\nConnect Time: %{time_connect}s\nSSL Time: %{time_appconnect}s\n" "$url" | tee -a "$service_log"
    
    # SSL certificate check
    if [[ "$url" =~ ^https ]]; then
        log "SSL certificate check:"
        echo | openssl s_client -connect "${url#https://}:443" -servername "${url#https://}" 2>/dev/null | openssl x509 -noout -dates | tee -a "$service_log"
    fi
    
    # DNS resolution for the domain
    domain=$(echo "$url" | sed -E 's|^https?://([^/]+).*|\1|')
    log "DNS resolution for $domain:"
    dig "$domain" | tee -a "$service_log"
}

# Usage example
# debug_web_service "https://example.com"
```

## 📊 Log Analysis and Correlation

### Advanced Log Analysis

```bash
#!/bin/bash
# log-analyzer.sh - Comprehensive log analysis tool

LOG_DIR="/var/log"
ANALYSIS_DIR="/tmp/log-analysis-$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="$ANALYSIS_DIR/analysis-report.txt"

mkdir -p "$ANALYSIS_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$REPORT_FILE"
}

log "Starting comprehensive log analysis"

# Error pattern analysis
analyze_error_patterns() {
    log "=== ERROR PATTERN ANALYSIS ==="
    
    local error_patterns=(
        "error"
        "fail"
        "exception"
        "timeout"
        "refused"
        "denied"
        "critical"
        "fatal"
    )
    
    for pattern in "${error_patterns[@]}"; do
        local count=$(find "$LOG_DIR" -name "*.log" -type f -exec grep -i "$pattern" {} \; 2>/dev/null | wc -l)
        if [[ $count -gt 0 ]]; then
            log "Pattern '$pattern': $count occurrences"
            
            # Get recent occurrences
            log "Recent occurrences of '$pattern':"
            find "$LOG_DIR" -name "*.log" -type f -exec grep -i "$pattern" {} \; 2>/dev/null | tail -5 | while read line; do
                log "  $line"
            done
        fi
    done
}

# Time-based analysis
analyze_time_patterns() {
    log "=== TIME-BASED ANALYSIS ==="
    
    # Analyze log entries by hour
    log "Log entries by hour (last 24 hours):"
    for hour in {0..23}; do
        local hour_pattern=$(printf "%02d:" $hour)
        local count=$(journalctl --since "24 hours ago" | grep "$hour_pattern" | wc -l)
        log "Hour $hour_pattern $count entries"
    done
    
    # Peak activity analysis
    log "Peak activity analysis:"
    journalctl --since "24 hours ago" --output=short-iso | awk '{print $1" "$2}' | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c | sort -nr | head -5 | while read count hour; do
        log "Peak hour $hour:00 with $count entries"
    done
}

# Service-specific analysis
analyze_services() {
    log "=== SERVICE-SPECIFIC ANALYSIS ==="
    
    local services=("ssh" "nginx" "apache2" "mysql" "postgresql")
    
    for service in "${services[@]}"; do
        if systemctl is-enabled "$service" &>/dev/null; then
            log "Analyzing service: $service"
            
            # Service status
            local status=$(systemctl is-active "$service")
            log "  Status: $status"
            
            # Recent service logs
            local error_count=$(journalctl -u "$service" --since "24 hours ago" --priority=err | wc -l)
            local warning_count=$(journalctl -u "$service" --since "24 hours ago" --priority=warning | wc -l)
            
            log "  Errors (24h): $error_count"
            log "  Warnings (24h): $warning_count"
            
            # Service restarts
            local restart_count=$(journalctl -u "$service" --since "24 hours ago" | grep -i "start\|restart" | wc -l)
            log "  Restarts (24h): $restart_count"
            
            if [[ $restart_count -gt 0 ]]; then
                log "  Recent restart events:"
                journalctl -u "$service" --since "24 hours ago" | grep -i "start\|restart" | tail -3 | while read line; do
                    log "    $line"
                done
            fi
        fi
    done
}

# Security analysis
analyze_security() {
    log "=== SECURITY ANALYSIS ==="
    
    # Failed login attempts
    local failed_logins=$(grep "Failed password" /var/log/auth.log 2>/dev/null | wc -l)
    log "Failed login attempts: $failed_logins"
    
    if [[ $failed_logins -gt 0 ]]; then
        log "Top failed login sources:"
        grep "Failed password" /var/log/auth.log 2>/dev/null | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -5 | while read count ip; do
            log "  $ip: $count attempts"
        done
    fi
    
    # Sudo usage
    local sudo_count=$(grep "sudo:" /var/log/auth.log 2>/dev/null | wc -l)
    log "Sudo commands executed: $sudo_count"
    
    if [[ $sudo_count -gt 0 ]]; then
        log "Recent sudo activity:"
        grep "sudo:" /var/log/auth.log 2>/dev/null | tail -5 | while read line; do
            log "  $line"
        done
    fi
    
    # UFW blocks
    local ufw_blocks=$(grep "UFW BLOCK" /var/log/kern.log 2>/dev/null | wc -l)
    log "UFW blocked connections: $ufw_blocks"
    
    if [[ $ufw_blocks -gt 0 ]]; then
        log "Top blocked sources:"
        grep "UFW BLOCK" /var/log/kern.log 2>/dev/null | awk '{print $13}' | cut -d'=' -f2 | sort | uniq -c | sort -nr | head -5 | while read count ip; do
            log "  $ip: $count blocks"
        done
    fi
}

# Performance analysis
analyze_performance() {
    log "=== PERFORMANCE ANALYSIS ==="
    
    # System load analysis
    log "System load analysis:"
    sar -q 1 1 | tail -1 | awk '{print "Load average: "$4" "$5" "$6}' | tee -a "$REPORT_FILE"
    
    # Memory pressure
    local oom_kills=$(dmesg | grep -i "killed process" | wc -l)
    log "OOM kills detected: $oom_kills"
    
    if [[ $oom_kills -gt 0 ]]; then
        log "Recent OOM kills:"
        dmesg | grep -i "killed process" | tail -3 | while read line; do
            log "  $line"
        done
    fi
    
    # Disk I/O issues
    local io_errors=$(dmesg | grep -i "i/o error" | wc -l)
    log "I/O errors detected: $io_errors"
    
    if [[ $io_errors -gt 0 ]]; then
        log "Recent I/O errors:"
        dmesg | grep -i "i/o error" | tail -3 | while read line; do
            log "  $line"
        done
    fi
}

# Generate correlation matrix
generate_correlation() {
    log "=== EVENT CORRELATION ==="
    
    # Create timeline of events
    local timeline_file="$ANALYSIS_DIR/timeline.txt"
    
    # Collect events from different sources
    {
        journalctl --since "24 hours ago" --output=short-iso | awk '{print $1" "$2" SYSTEM "$0}'
        grep "Failed password" /var/log/auth.log 2>/dev/null | awk '{print $1" "$2" "$3" AUTH "$0}'
        grep "error\|Error\|ERROR" /var/log/nginx/error.log 2>/dev/null | awk '{print $1" "$2" WEB "$0}'
    } | sort > "$timeline_file"
    
    log "Event timeline created: $timeline_file"
    
    # Identify event clusters
    log "Event clustering analysis:"
    awk '{
        timestamp = $1" "$2
        gsub(/[0-9]{2}:[0-9]{2}:[0-9]{2}/, "XX:XX:XX", timestamp)
        count[timestamp]++
    }
    END {
        for (ts in count) {
            if (count[ts] > 5) {
                print "High activity period: "ts" ("count[ts]" events)"
            }
        }
    }' "$timeline_file" | tee -a "$REPORT_FILE"
}

# Main execution
analyze_error_patterns
analyze_time_patterns
analyze_services
analyze_security
analyze_performance
generate_correlation

log "Log analysis completed. Report saved to: $REPORT_FILE"

# Generate summary
log "=== ANALYSIS SUMMARY ==="
log "Analysis completed at: $(date)"
log "Total log files analyzed: $(find "$LOG_DIR" -name "*.log" -type f | wc -l)"
log "Analysis artifacts saved to: $ANALYSIS_DIR"

# Send report if email is configured
if command -v mail &> /dev/null; then
    mail -s "Log Analysis Report - $(hostname)" admin@example.com < "$REPORT_FILE"
    log "Report emailed to admin@example.com"
fi
```

### Real-time Log Monitoring

```bash
#!/bin/bash
# real-time-monitor.sh - Real-time log monitoring with alerting

MONITOR_LOGS=(
    "/var/log/syslog"
    "/var/log/auth.log"
    "/var/log/nginx/error.log"
    "/var/log/apache2/error.log"
    "/var/log/mysql/error.log"
)

ALERT_PATTERNS=(
    "CRITICAL|critical|Critical"
    "ERROR|error|Error"
    "FAILED|failed|Failed"
    "DENIED|denied|Denied"
    "TIMEOUT|timeout|Timeout"
)

ALERT_EMAIL="admin@example.com"
ALERT_THRESHOLD=5  # Alert after 5 occurrences in 5 minutes
CHECK_INTERVAL=60  # Check every minute

# Alert tracking
declare -A alert_counts
declare -A last_alert_time

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

send_alert() {
    local pattern="$1"
    local count="$2"
    local logfile="$3"
    local sample_lines="$4"
    
    local subject="Alert: Pattern '$pattern' detected $count times"
    local body="Alert Details:
Pattern: $pattern
Count: $count
Log file: $logfile
Time: $(date)

Sample log entries:
$sample_lines"
    
    echo "$body" | mail -s "$subject" "$ALERT_EMAIL"
    log "ALERT SENT: $subject"
}

monitor_logs() {
    local current_time=$(date +%s)
    
    for logfile in "${MONITOR_LOGS[@]}"; do
        if [[ ! -f "$logfile" ]]; then
            continue
        fi
        
        for pattern in "${ALERT_PATTERNS[@]}"; do
            # Count occurrences in the last 5 minutes
            local count=$(tail -1000 "$logfile" | awk -v pattern="$pattern" -v cutoff="$(date -d '5 minutes ago' '+%b %d %H:%M')" '
                $0 ~ cutoff && $0 ~ pattern { count++ }
                END { print count+0 }
            ')
            
            if [[ $count -ge $ALERT_THRESHOLD ]]; then
                local alert_key="${logfile}_${pattern}"
                local last_alert=${last_alert_time[$alert_key]:-0}
                
                # Only send alert if it's been more than 30 minutes since last alert
                if [[ $((current_time - last_alert)) -gt 1800 ]]; then
                    local sample_lines=$(tail -1000 "$logfile" | grep -E "$pattern" | tail -5)
                    send_alert "$pattern" "$count" "$logfile" "$sample_lines"
                    last_alert_time[$alert_key]=$current_time
                fi
            fi
        done
    done
}

# Real-time monitoring with tail
real_time_monitor() {
    log "Starting real-time log monitoring"
    
    # Create named pipes for each log file
    local pipes=()
    for logfile in "${MONITOR_LOGS[@]}"; do
        if [[ -f "$logfile" ]]; then
            local pipe="/tmp/monitor_$(basename "$logfile").pipe"
            mkfifo "$pipe" 2>/dev/null
            tail -f "$logfile" > "$pipe" &
            pipes+=("$pipe")
        fi
    done
    
    # Monitor all pipes simultaneously
    while true; do
        for pipe in "${pipes[@]}"; do
            if read -t 1 line < "$pipe"; then
                # Check line against alert patterns
                for pattern in "${ALERT_PATTERNS[@]}"; do
                    if echo "$line" | grep -qE "$pattern"; then
                        log "PATTERN MATCH: $pattern in $line"
                        
                        # Immediate alert for critical patterns
                        if echo "$pattern" | grep -qi "critical"; then
                            echo "CRITICAL ALERT: $line" | mail -s "CRITICAL: Immediate attention required" "$ALERT_EMAIL"
                        fi
                    fi
                done
            fi
        done
    done
}

# Cleanup function
cleanup() {
    log "Cleaning up monitoring processes"
    pkill -f "tail -f"
    rm -f /tmp/monitor_*.pipe
    exit 0
}

trap cleanup SIGINT SIGTERM

# Main execution
case "${1:-periodic}" in
    "realtime")
        real_time_monitor
        ;;
    "periodic")
        log "Starting periodic log monitoring"
        while true; do
            monitor_logs
            sleep $CHECK_INTERVAL
        done
        ;;
    "once")
        log "Running single log check"
        monitor_logs
        ;;
    *)
        echo "Usage: $0 [realtime|periodic|once]"
        echo "  realtime - Monitor logs in real-time"
        echo "  periodic - Check logs periodically (default)"
        echo "  once     - Run single check"
        exit 1
        ;;
esac
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between strace and ltrace?**
   <details>
   <summary>Answer</summary>
   
   strace traces system calls made by a process to the kernel, while ltrace traces library function calls made by a process to shared libraries.
   </details>

2. **How do you generate a core dump for a running process?**
   <details>
   <summary>Answer</summary>
   
   Use `gcore <PID>` to generate a core dump, or send a SIGQUIT signal with `kill -3 <PID>` (if the application handles it properly).
   </details>

3. **What information does the /proc filesystem provide for troubleshooting?**
   <details>
   <summary>Answer</summary>
   
   /proc provides real-time information about processes, system resources, kernel parameters, memory usage, file descriptors, network connections, and system statistics.
   </details>

4. **How do you correlate events across multiple log files?**
   <details>
   <summary>Answer</summary>
   
   Use timestamps to create a unified timeline, employ log aggregation tools like ELK stack, or create custom scripts that merge and sort log entries by timestamp.
   </details>

### Hands-On Challenges

**Challenge 1: Complete Debugging Suite**
```bash
# Create a comprehensive debugging toolkit:
# - Automated problem detection and classification
# - Multi-layer debugging (system, network, application)
# - Real-time monitoring with intelligent alerting
# - Automated log correlation and analysis
# - Performance bottleneck identification
# - Root cause analysis automation
```

**Challenge 2: Incident Response System**
```bash
# Build an incident response system:
# - Automated incident detection and classification
# - Escalation procedures and notifications
# - Evidence collection and preservation
# - Recovery procedures and rollback capabilities
# - Post-incident analysis and reporting
```

**Challenge 3: Predictive Problem Detection**
```bash
# Implement predictive problem detection:
# - Trend analysis and anomaly detection
# - Machine learning for pattern recognition
# - Proactive alerting before issues occur
# - Capacity planning and resource prediction
# - Automated preventive actions
```

## 🚀 Next Steps

Excellent! You've mastered troubleshooting and debugging. You can now:
- Apply systematic troubleshooting methodologies
- Use advanced debugging tools (strace, gdb, network analyzers)
- Perform comprehensive log analysis and correlation
- Implement real-time monitoring and alerting
- Conduct root cause analysis effectively
- Build automated debugging and incident response systems
- Create comprehensive documentation and knowledge bases

**Ready for the final chapter?** Continue to [16-best-practices.md](16-best-practices.md) to learn industry best practices and advanced techniques for Linux and networking mastery.

---

> **Pro Tip**: Great troubleshooters are made, not born. Practice systematic approaches, build comprehensive toolkits, and always document your findings. The key is to remain calm, methodical, and persistent! 🔍