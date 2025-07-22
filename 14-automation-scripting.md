# 🤖 Automation & Scripting: Mastering System Administration Automation

> **Automate repetitive tasks, create powerful scripts, and build efficient workflows**

## 📖 What You'll Learn

Automation is the key to efficient system administration. This chapter covers comprehensive automation techniques and scripting:

- Bash scripting fundamentals and advanced techniques
- Task automation with cron and systemd timers
- Configuration management with Ansible
- Infrastructure as Code (IaC) concepts
- Log management and rotation automation
- Backup automation strategies
- System maintenance automation
- Monitoring and alerting automation
- Error handling and debugging scripts

## 🌍 Why This Matters

**Critical applications:**
- **Efficiency**: Automate repetitive tasks to save time and reduce errors
- **Consistency**: Ensure tasks are performed the same way every time
- **Scalability**: Manage multiple systems efficiently
- **Reliability**: Reduce human error and improve system reliability
- **Cost Reduction**: Minimize manual intervention and operational costs

## 📝 Bash Scripting Fundamentals

### Script Structure and Best Practices

```bash
#!/bin/bash
# script-template.sh - Professional script template

# Script metadata
SCRIPT_NAME="$(basename "$0")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_VERSION="1.0.0"
SCRIPT_AUTHOR="Your Name"
SCRIPT_DATE="$(date '+%Y-%m-%d')"

# Configuration
LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"
CONFIG_FILE="${SCRIPT_DIR}/${SCRIPT_NAME%.sh}.conf"
LOCK_FILE="/var/run/${SCRIPT_NAME%.sh}.lock"
DEBUG=${DEBUG:-0}
VERBOSE=${VERBOSE:-0}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { [[ $DEBUG -eq 1 ]] && log "DEBUG" "$@"; }

# Output functions
print_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $*"; }
print_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# Error handling
set -euo pipefail  # Exit on error, undefined vars, pipe failures

error_handler() {
    local line_number="$1"
    local error_code="$2"
    log_error "Script failed at line $line_number with exit code $error_code"
    cleanup
    exit "$error_code"
}

trap 'error_handler ${LINENO} $?' ERR

# Cleanup function
cleanup() {
    log_info "Performing cleanup..."
    [[ -f "$LOCK_FILE" ]] && rm -f "$LOCK_FILE"
    # Add other cleanup tasks here
}

trap cleanup EXIT

# Lock mechanism to prevent multiple instances
acquire_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_error "Script is already running (PID: $pid)"
            exit 1
        else
            log_warn "Removing stale lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    echo $$ > "$LOCK_FILE"
    log_info "Lock acquired (PID: $$)"
}

# Usage function
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Description:
    Professional script template with logging, error handling, and best practices.

Options:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose output
    -d, --debug         Enable debug mode
    -c, --config FILE   Use custom config file
    --version           Show version information

Examples:
    $SCRIPT_NAME --verbose
    $SCRIPT_NAME --config /path/to/config.conf
    $SCRIPT_NAME --debug

Author: $SCRIPT_AUTHOR
Version: $SCRIPT_VERSION
Date: $SCRIPT_DATE
EOF
}

# Configuration loading
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        log_info "Loading configuration from $CONFIG_FILE"
        source "$CONFIG_FILE"
    else
        log_warn "Configuration file not found: $CONFIG_FILE"
    fi
}

# Argument parsing
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=1
                shift
                ;;
            -d|--debug)
                DEBUG=1
                shift
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --version)
                echo "$SCRIPT_NAME version $SCRIPT_VERSION"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# Validation functions
validate_requirements() {
    local required_commands=("curl" "jq" "awk")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing_commands[*]}"
        exit 1
    fi
}

validate_permissions() {
    if [[ $EUID -eq 0 ]]; then
        log_warn "Running as root user"
    fi
    
    if [[ ! -w "$(dirname "$LOG_FILE")" ]]; then
        log_error "Cannot write to log directory: $(dirname "$LOG_FILE")"
        exit 1
    fi
}

# Main function
main() {
    log_info "Starting $SCRIPT_NAME v$SCRIPT_VERSION"
    
    # Your main script logic here
    print_info "Script execution started"
    
    # Example operations
    if [[ $VERBOSE -eq 1 ]]; then
        print_info "Verbose mode enabled"
    fi
    
    if [[ $DEBUG -eq 1 ]]; then
        print_info "Debug mode enabled"
        set -x  # Enable command tracing
    fi
    
    # Simulate some work
    sleep 2
    
    print_success "Script completed successfully"
    log_info "$SCRIPT_NAME completed successfully"
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_arguments "$@"
    acquire_lock
    load_config
    validate_requirements
    validate_permissions
    main
fi
```

### Advanced Bash Techniques

```bash
#!/bin/bash
# advanced-bash-examples.sh

# Arrays and associative arrays
declare -a servers=("web1" "web2" "db1")
declare -A server_ips=(
    ["web1"]="192.168.1.10"
    ["web2"]="192.168.1.11"
    ["db1"]="192.168.1.20"
)

# Function with return values
check_service() {
    local service="$1"
    local host="$2"
    
    if ssh "$host" "systemctl is-active --quiet $service"; then
        return 0  # Service is running
    else
        return 1  # Service is not running
    fi
}

# Process arrays
for server in "${servers[@]}"; do
    ip="${server_ips[$server]}"
    echo "Checking server: $server ($ip)"
    
    if check_service "apache2" "$ip"; then
        echo "✓ Apache is running on $server"
    else
        echo "✗ Apache is not running on $server"
    fi
done

# Here documents for multi-line strings
generate_config() {
    local server_name="$1"
    local server_ip="$2"
    
    cat << EOF > "/etc/nginx/sites-available/$server_name"
server {
    listen 80;
    server_name $server_name;
    
    location / {
        proxy_pass http://$server_ip:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
}

# Parameter expansion and string manipulation
process_filename() {
    local filepath="$1"
    
    # Extract components
    local filename="${filepath##*/}"          # basename
    local directory="${filepath%/*}"          # dirname
    local extension="${filename##*.}"         # file extension
    local basename="${filename%.*}"           # filename without extension
    
    echo "Full path: $filepath"
    echo "Directory: $directory"
    echo "Filename: $filename"
    echo "Basename: $basename"
    echo "Extension: $extension"
    
    # String replacement
    local new_filename="${filename/old/new}"  # Replace first occurrence
    local all_replaced="${filename//old/new}" # Replace all occurrences
    
    echo "Modified: $new_filename"
    echo "All replaced: $all_replaced"
}

# Process substitution
compare_processes() {
    # Compare running processes on two servers
    diff <(ssh server1 "ps aux | sort") <(ssh server2 "ps aux | sort")
}

# Command substitution and arithmetic
calculate_disk_usage() {
    local path="$1"
    local size_bytes=$(du -sb "$path" | cut -f1)
    local size_mb=$((size_bytes / 1024 / 1024))
    local size_gb=$((size_mb / 1024))
    
    echo "Path: $path"
    echo "Size: ${size_bytes} bytes"
    echo "Size: ${size_mb} MB"
    echo "Size: ${size_gb} GB"
}

# Conditional expressions
validate_input() {
    local input="$1"
    
    # Multiple conditions
    if [[ -n "$input" && "$input" =~ ^[0-9]+$ && $input -gt 0 && $input -lt 100 ]]; then
        echo "Valid input: $input"
        return 0
    else
        echo "Invalid input: $input"
        return 1
    fi
}

# File operations with error checking
safe_file_operations() {
    local source="$1"
    local destination="$2"
    
    # Check if source exists and is readable
    if [[ ! -r "$source" ]]; then
        echo "Error: Cannot read source file: $source" >&2
        return 1
    fi
    
    # Create destination directory if it doesn't exist
    local dest_dir="$(dirname "$destination")"
    if [[ ! -d "$dest_dir" ]]; then
        mkdir -p "$dest_dir" || {
            echo "Error: Cannot create directory: $dest_dir" >&2
            return 1
        }
    fi
    
    # Copy with verification
    if cp "$source" "$destination"; then
        echo "Successfully copied $source to $destination"
        
        # Verify copy
        if cmp -s "$source" "$destination"; then
            echo "Copy verified successfully"
        else
            echo "Warning: Copy verification failed" >&2
            return 1
        fi
    else
        echo "Error: Failed to copy $source to $destination" >&2
        return 1
    fi
}

# Parallel processing
parallel_ping() {
    local hosts=("8.8.8.8" "1.1.1.1" "208.67.222.222")
    local pids=()
    
    # Start background processes
    for host in "${hosts[@]}"; do
        {
            if ping -c 3 "$host" &>/dev/null; then
                echo "$host: REACHABLE"
            else
                echo "$host: UNREACHABLE"
            fi
        } &
        pids+=("$!")
    done
    
    # Wait for all processes to complete
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
}

# Signal handling
handle_signals() {
    local cleanup_needed=false
    
    cleanup_handler() {
        echo "Received signal, cleaning up..."
        cleanup_needed=true
        # Perform cleanup operations
        exit 0
    }
    
    trap cleanup_handler SIGINT SIGTERM
    
    # Long-running operation
    for i in {1..60}; do
        if [[ $cleanup_needed == true ]]; then
            break
        fi
        echo "Working... $i/60"
        sleep 1
    done
}
```

## ⏰ Task Scheduling and Automation

### Cron Jobs

```bash
# View current cron jobs
$ crontab -l

# Edit cron jobs
$ crontab -e

# Cron syntax: minute hour day month weekday command
# * * * * * command
# | | | | |
# | | | | +-- Day of week (0-7, Sunday = 0 or 7)
# | | | +---- Month (1-12)
# | | +------ Day of month (1-31)
# | +-------- Hour (0-23)
# +---------- Minute (0-59)

# Common cron examples
# Run every minute
* * * * * /usr/local/bin/check-services.sh

# Run every 5 minutes
*/5 * * * * /usr/local/bin/monitor-disk.sh

# Run every hour at minute 0
0 * * * * /usr/local/bin/cleanup-logs.sh

# Run daily at 2:30 AM
30 2 * * * /usr/local/bin/backup-database.sh

# Run weekly on Sunday at 3:00 AM
0 3 * * 0 /usr/local/bin/weekly-maintenance.sh

# Run monthly on the 1st at 4:00 AM
0 4 1 * * /usr/local/bin/monthly-report.sh

# Run on weekdays at 9:00 AM
0 9 * * 1-5 /usr/local/bin/business-hours-check.sh

# Multiple times per day
0 6,12,18 * * * /usr/local/bin/three-times-daily.sh

# System-wide cron jobs
$ sudo nano /etc/crontab

# Example system crontab
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=admin@example.com

# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )

# Cron directories for different intervals
/etc/cron.hourly/
/etc/cron.daily/
/etc/cron.weekly/
/etc/cron.monthly/

# Example cron script with logging
#!/bin/bash
# /etc/cron.daily/system-maintenance

LOGFILE="/var/log/system-maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting system maintenance" >> $LOGFILE

# Update package database
apt update >> $LOGFILE 2>&1

# Clean package cache
apt autoclean >> $LOGFILE 2>&1

# Remove orphaned packages
apt autoremove -y >> $LOGFILE 2>&1

# Clean temporary files
find /tmp -type f -atime +7 -delete >> $LOGFILE 2>&1

# Rotate logs
logrotate /etc/logrotate.conf >> $LOGFILE 2>&1

echo "[$DATE] System maintenance completed" >> $LOGFILE
```

### Systemd Timers

```bash
# Create a systemd service
$ sudo nano /etc/systemd/system/backup.service

[Unit]
Description=Database Backup Service
Wants=backup.timer

[Service]
Type=oneshot
User=backup
Group=backup
ExecStart=/usr/local/bin/backup-database.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

# Create a systemd timer
$ sudo nano /etc/systemd/system/backup.timer

[Unit]
Description=Run backup service daily
Requires=backup.service

[Timer]
# Run daily at 2:00 AM
OnCalendar=daily
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target

# Enable and start the timer
$ sudo systemctl daemon-reload
$ sudo systemctl enable backup.timer
$ sudo systemctl start backup.timer

# Check timer status
$ sudo systemctl status backup.timer
$ sudo systemctl list-timers

# Advanced timer examples
# /etc/systemd/system/monitoring.timer
[Timer]
# Every 5 minutes
OnCalendar=*:0/5

# /etc/systemd/system/weekly-report.timer
[Timer]
# Every Monday at 9:00 AM
OnCalendar=Mon *-*-* 09:00:00

# /etc/systemd/system/hourly-check.timer
[Timer]
# Every hour, 10 minutes after the hour
OnCalendar=*-*-* *:10:00

# /etc/systemd/system/business-hours.timer
[Timer]
# Weekdays from 9 AM to 5 PM, every hour
OnCalendar=Mon..Fri 09..17:00:00
```

## 🔧 Configuration Management with Ansible

### Ansible Installation and Setup

```bash
# Install Ansible
$ sudo apt update
$ sudo apt install ansible

# Or install via pip
$ pip3 install ansible

# Verify installation
$ ansible --version
ansible [core 2.12.1]
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/home/user/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /usr/lib/python3/dist-packages/ansible
  ansible collection location = /home/user/.ansible/collections:/usr/share/ansible/collections
  executable location = /usr/bin/ansible
  python version = 3.9.2 (default, Feb 28 2021, 17:03:44) [GCC 10.2.1 20210110]
  jinja version = 2.11.3
  libyaml = True

# Create Ansible directory structure
$ mkdir -p ~/ansible/{inventories,playbooks,roles,group_vars,host_vars}
$ cd ~/ansible

# Create inventory file
$ nano inventories/production

[webservers]
web1 ansible_host=192.168.1.10 ansible_user=ubuntu
web2 ansible_host=192.168.1.11 ansible_user=ubuntu

[databases]
db1 ansible_host=192.168.1.20 ansible_user=ubuntu

[loadbalancers]
lb1 ansible_host=192.168.1.5 ansible_user=ubuntu

[production:children]
webservers
databases
loadbalancers

[production:vars]
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3

# Test connectivity
$ ansible all -i inventories/production -m ping
web1 | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

### Ansible Playbooks

```yaml
# playbooks/webserver-setup.yml
---
- name: Configure Web Servers
  hosts: webservers
  become: yes
  vars:
    nginx_port: 80
    app_user: webapp
    app_dir: /var/www/html
    
  tasks:
    - name: Update package cache
      apt:
        update_cache: yes
        cache_valid_time: 3600
        
    - name: Install required packages
      apt:
        name:
          - nginx
          - ufw
          - certbot
          - python3-certbot-nginx
        state: present
        
    - name: Create application user
      user:
        name: "{{ app_user }}"
        system: yes
        shell: /bin/bash
        home: "{{ app_dir }}"
        create_home: yes
        
    - name: Configure nginx
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/default
        backup: yes
      notify: restart nginx
      
    - name: Enable nginx site
      file:
        src: /etc/nginx/sites-available/default
        dest: /etc/nginx/sites-enabled/default
        state: link
      notify: restart nginx
      
    - name: Configure firewall
      ufw:
        rule: allow
        port: "{{ item }}"
        proto: tcp
      loop:
        - "22"
        - "80"
        - "443"
        
    - name: Enable firewall
      ufw:
        state: enabled
        policy: deny
        direction: incoming
        
    - name: Start and enable services
      systemd:
        name: "{{ item }}"
        state: started
        enabled: yes
      loop:
        - nginx
        - ufw
        
    - name: Deploy application files
      copy:
        src: "{{ item.src }}"
        dest: "{{ app_dir }}/{{ item.dest }}"
        owner: "{{ app_user }}"
        group: "{{ app_user }}"
        mode: '0644'
      loop:
        - { src: 'index.html', dest: 'index.html' }
        - { src: 'style.css', dest: 'css/style.css' }
      notify: restart nginx
      
  handlers:
    - name: restart nginx
      systemd:
        name: nginx
        state: restarted
```

```yaml
# playbooks/database-setup.yml
---
- name: Configure Database Servers
  hosts: databases
  become: yes
  vars:
    mysql_root_password: "{{ vault_mysql_root_password }}"
    mysql_databases:
      - name: webapp_prod
        encoding: utf8mb4
        collation: utf8mb4_unicode_ci
    mysql_users:
      - name: webapp_user
        password: "{{ vault_mysql_webapp_password }}"
        priv: "webapp_prod.*:ALL"
        host: "%"
        
  tasks:
    - name: Install MySQL server
      apt:
        name:
          - mysql-server
          - mysql-client
          - python3-pymysql
        state: present
        
    - name: Start and enable MySQL
      systemd:
        name: mysql
        state: started
        enabled: yes
        
    - name: Set MySQL root password
      mysql_user:
        name: root
        password: "{{ mysql_root_password }}"
        login_unix_socket: /var/run/mysqld/mysqld.sock
        
    - name: Create MySQL databases
      mysql_db:
        name: "{{ item.name }}"
        encoding: "{{ item.encoding }}"
        collation: "{{ item.collation }}"
        state: present
        login_user: root
        login_password: "{{ mysql_root_password }}"
      loop: "{{ mysql_databases }}"
      
    - name: Create MySQL users
      mysql_user:
        name: "{{ item.name }}"
        password: "{{ item.password }}"
        priv: "{{ item.priv }}"
        host: "{{ item.host }}"
        state: present
        login_user: root
        login_password: "{{ mysql_root_password }}"
      loop: "{{ mysql_users }}"
      
    - name: Configure MySQL
      template:
        src: my.cnf.j2
        dest: /etc/mysql/mysql.conf.d/mysqld.cnf
        backup: yes
      notify: restart mysql
      
    - name: Configure firewall for MySQL
      ufw:
        rule: allow
        port: "3306"
        src: "{{ hostvars[item]['ansible_default_ipv4']['address'] }}"
      loop: "{{ groups['webservers'] }}"
      
  handlers:
    - name: restart mysql
      systemd:
        name: mysql
        state: restarted
```

### Ansible Roles

```bash
# Create role structure
$ ansible-galaxy init roles/common
$ ansible-galaxy init roles/webserver
$ ansible-galaxy init roles/database

# Role structure
roles/
├── common/
│   ├── tasks/
│   │   └── main.yml
│   ├── handlers/
│   │   └── main.yml
│   ├── templates/
│   ├── files/
│   ├── vars/
│   │   └── main.yml
│   ├── defaults/
│   │   └── main.yml
│   └── meta/
│       └── main.yml
```

```yaml
# roles/common/tasks/main.yml
---
- name: Update package cache
  apt:
    update_cache: yes
    cache_valid_time: 3600
    
- name: Install common packages
  apt:
    name:
      - curl
      - wget
      - vim
      - htop
      - git
      - unzip
      - software-properties-common
    state: present
    
- name: Configure timezone
  timezone:
    name: "{{ system_timezone | default('UTC') }}"
    
- name: Configure NTP
  apt:
    name: ntp
    state: present
    
- name: Start and enable NTP
  systemd:
    name: ntp
    state: started
    enabled: yes
    
- name: Create admin user
  user:
    name: "{{ admin_user }}"
    groups: sudo
    shell: /bin/bash
    create_home: yes
    
- name: Add SSH key for admin user
  authorized_key:
    user: "{{ admin_user }}"
    key: "{{ admin_ssh_key }}"
    state: present
    
- name: Configure SSH
  template:
    src: sshd_config.j2
    dest: /etc/ssh/sshd_config
    backup: yes
  notify: restart ssh
    
- name: Disable root login
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^PermitRootLogin'
    line: 'PermitRootLogin no'
  notify: restart ssh
```

```yaml
# playbooks/site.yml - Main playbook using roles
---
- name: Configure all servers
  hosts: all
  become: yes
  roles:
    - common
    
- name: Configure web servers
  hosts: webservers
  become: yes
  roles:
    - webserver
    
- name: Configure database servers
  hosts: databases
  become: yes
  roles:
    - database
```

## 📊 Log Management Automation

### Automated Log Rotation

```bash
# Configure logrotate
$ sudo nano /etc/logrotate.d/webapp

/var/log/webapp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 webapp webapp
    postrotate
        systemctl reload webapp
    endscript
}

# Custom logrotate configuration
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi \
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}

# Test logrotate configuration
$ sudo logrotate -d /etc/logrotate.d/webapp
$ sudo logrotate -f /etc/logrotate.d/webapp  # Force rotation

# Custom log rotation script
#!/bin/bash
# /usr/local/bin/custom-log-rotate.sh

LOG_DIR="/var/log/myapp"
RETENTION_DAYS=30
COMPRESS_AFTER_DAYS=1

# Rotate logs
find "$LOG_DIR" -name "*.log" -type f | while read logfile; do
    # Get file modification time
    file_age=$(stat -c %Y "$logfile")
    current_time=$(date +%s)
    age_days=$(( (current_time - file_age) / 86400 ))
    
    # Compress old logs
    if [[ $age_days -gt $COMPRESS_AFTER_DAYS ]] && [[ ! "$logfile" =~ \.gz$ ]]; then
        gzip "$logfile"
        echo "Compressed: $logfile"
    fi
    
    # Remove very old logs
    if [[ $age_days -gt $RETENTION_DAYS ]]; then
        rm -f "$logfile" "${logfile}.gz"
        echo "Removed: $logfile"
    fi
done

# Restart application to release file handles
systemctl reload myapp
```

### Centralized Logging with rsyslog

```bash
# Configure rsyslog server
$ sudo nano /etc/rsyslog.conf

# Enable UDP reception
$ModLoad imudp
$UDPServerRun 514
$UDPServerAddress 0.0.0.0

# Enable TCP reception
$ModLoad imtcp
$InputTCPServerRun 514

# Template for remote logs
$template RemoteLogs,"/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log"
*.* ?RemoteLogs
& stop

# Configure rsyslog client
$ sudo nano /etc/rsyslog.d/50-remote.conf

# Send all logs to remote server
*.* @@log-server.example.com:514

# Send specific logs
mail.* @@log-server.example.com:514
auth.* @@log-server.example.com:514

# Restart rsyslog
$ sudo systemctl restart rsyslog

# Automated log analysis script
#!/bin/bash
# /usr/local/bin/log-analyzer.sh

LOG_FILE="/var/log/auth.log"
ALERT_EMAIL="admin@example.com"
FAILED_LOGIN_THRESHOLD=5
TIME_WINDOW=300  # 5 minutes

# Check for failed login attempts
check_failed_logins() {
    local current_time=$(date +%s)
    local start_time=$((current_time - TIME_WINDOW))
    
    # Get recent failed login attempts
    local failed_attempts=$(awk -v start="$start_time" '
        BEGIN {
            "date -d \"" $1 " " $2 " " $3 "\" +%s" | getline timestamp
            if (timestamp >= start && /Failed password/) {
                print $0
            }
        }
    ' "$LOG_FILE" | wc -l)
    
    if [[ $failed_attempts -gt $FAILED_LOGIN_THRESHOLD ]]; then
        local message="Warning: $failed_attempts failed login attempts in the last $((TIME_WINDOW/60)) minutes"
        echo "$message" | mail -s "Security Alert: Failed Logins" "$ALERT_EMAIL"
        logger "SECURITY_ALERT: $message"
    fi
}

# Check for suspicious activities
check_suspicious_activity() {
    # Check for privilege escalation
    if grep -q "sudo.*COMMAND" "$LOG_FILE"; then
        local sudo_commands=$(grep "sudo.*COMMAND" "$LOG_FILE" | tail -10)
        echo "Recent sudo commands:" | mail -s "Sudo Activity Report" "$ALERT_EMAIL"
        echo "$sudo_commands" | mail -s "Sudo Activity Report" "$ALERT_EMAIL"
    fi
    
    # Check for new user creation
    if grep -q "useradd" "$LOG_FILE"; then
        local new_users=$(grep "useradd" "$LOG_FILE" | tail -5)
        echo "New user accounts created:" | mail -s "New User Alert" "$ALERT_EMAIL"
        echo "$new_users" | mail -s "New User Alert" "$ALERT_EMAIL"
    fi
}

check_failed_logins
check_suspicious_activity
```

## 💾 Backup Automation

### Database Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-database.sh

# Configuration
DB_USER="backup_user"
DB_PASS="backup_password"
DB_HOST="localhost"
BACKUP_DIR="/backup/mysql"
RETENTION_DAYS=30
S3_BUCKET="my-backup-bucket"
ENCRYPTION_KEY="/etc/backup/encryption.key"

# Logging
LOG_FILE="/var/log/backup-database.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get list of databases
DATABASES=$(mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "SHOW DATABASES;" | grep -Ev "^(Database|information_schema|performance_schema|mysql|sys)$")

log "Starting database backup"

for db in $DATABASES; do
    log "Backing up database: $db"
    
    # Create backup filename
    BACKUP_FILE="$BACKUP_DIR/${db}_$(date +%Y%m%d_%H%M%S).sql"
    
    # Create database dump
    if mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        "$db" > "$BACKUP_FILE"; then
        
        log "Database dump created: $BACKUP_FILE"
        
        # Compress backup
        if gzip "$BACKUP_FILE"; then
            BACKUP_FILE="${BACKUP_FILE}.gz"
            log "Backup compressed: $BACKUP_FILE"
        else
            log "ERROR: Failed to compress backup"
            continue
        fi
        
        # Encrypt backup
        if [[ -f "$ENCRYPTION_KEY" ]]; then
            if openssl enc -aes-256-cbc -salt -in "$BACKUP_FILE" -out "${BACKUP_FILE}.enc" -pass file:"$ENCRYPTION_KEY"; then
                rm "$BACKUP_FILE"
                BACKUP_FILE="${BACKUP_FILE}.enc"
                log "Backup encrypted: $BACKUP_FILE"
            else
                log "ERROR: Failed to encrypt backup"
            fi
        fi
        
        # Upload to S3
        if command -v aws &> /dev/null; then
            if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/mysql/$(basename "$BACKUP_FILE")"; then
                log "Backup uploaded to S3: $BACKUP_FILE"
            else
                log "ERROR: Failed to upload backup to S3"
            fi
        fi
        
    else
        log "ERROR: Failed to create database dump for $db"
    fi
done

# Clean up old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "*.sql.gz*" -mtime +$RETENTION_DAYS -delete

# Clean up old S3 backups
if command -v aws &> /dev/null; then
    aws s3 ls "s3://$S3_BUCKET/mysql/" | while read -r line; do
        file_date=$(echo "$line" | awk '{print $1}')
        file_name=$(echo "$line" | awk '{print $4}')
        
        if [[ -n "$file_date" && -n "$file_name" ]]; then
            file_timestamp=$(date -d "$file_date" +%s)
            cutoff_timestamp=$(date -d "$RETENTION_DAYS days ago" +%s)
            
            if [[ $file_timestamp -lt $cutoff_timestamp ]]; then
                aws s3 rm "s3://$S3_BUCKET/mysql/$file_name"
                log "Removed old S3 backup: $file_name"
            fi
        fi
    done
fi

log "Database backup completed"

# Send notification
if command -v mail &> /dev/null; then
    echo "Database backup completed successfully at $(date)" | \
        mail -s "Database Backup Report" admin@example.com
fi
```

### File System Backup Script

```bash
#!/bin/bash
# /usr/local/bin/backup-filesystem.sh

# Configuration
SOURCE_DIRS=("/etc" "/home" "/var/www" "/opt")
BACKUP_DEST="/backup/filesystem"
REMOTE_DEST="backup@backup-server:/backup/$(hostname)"
EXCLUDE_FILE="/etc/backup/exclude.txt"
RETENTION_DAYS=14
MAX_BACKUP_SIZE="10G"

# Logging
LOG_FILE="/var/log/backup-filesystem.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

# Create exclude file if it doesn't exist
if [[ ! -f "$EXCLUDE_FILE" ]]; then
    cat > "$EXCLUDE_FILE" << EOF
*.tmp
*.cache
*.log
/home/*/.cache/
/var/cache/
/var/tmp/
/tmp/
*.iso
*.img
EOF
fi

# Create backup directory
mkdir -p "$BACKUP_DEST"

log "Starting filesystem backup"

# Create backup filename
BACKUP_FILE="$BACKUP_DEST/filesystem_$(date +%Y%m%d_%H%M%S).tar.gz"

# Create tar archive with compression
log "Creating compressed archive: $BACKUP_FILE"

if tar -czf "$BACKUP_FILE" \
    --exclude-from="$EXCLUDE_FILE" \
    --one-file-system \
    --preserve-permissions \
    --preserve-order \
    --totals \
    "${SOURCE_DIRS[@]}" 2>&1; then
    
    log "Archive created successfully: $BACKUP_FILE"
    
    # Check backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
    
    # Verify archive integrity
    if tar -tzf "$BACKUP_FILE" >/dev/null 2>&1; then
        log "Archive integrity verified"
    else
        log "ERROR: Archive integrity check failed"
        exit 1
    fi
    
    # Copy to remote location
    if [[ -n "$REMOTE_DEST" ]]; then
        log "Copying backup to remote location: $REMOTE_DEST"
        if rsync -avz --progress "$BACKUP_FILE" "$REMOTE_DEST/"; then
            log "Backup copied to remote location successfully"
        else
            log "ERROR: Failed to copy backup to remote location"
        fi
    fi
    
else
    log "ERROR: Failed to create archive"
    exit 1
fi

# Clean up old backups
log "Cleaning up old backups (older than $RETENTION_DAYS days)"
find "$BACKUP_DEST" -name "filesystem_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Clean up remote backups
if [[ -n "$REMOTE_DEST" ]]; then
    ssh "${REMOTE_DEST%:*}" "find ${REMOTE_DEST#*:} -name 'filesystem_*.tar.gz' -mtime +$RETENTION_DAYS -delete"
fi

log "Filesystem backup completed"

# Generate backup report
REPORT_FILE="/tmp/backup-report-$(date +%Y%m%d).txt"
cat > "$REPORT_FILE" << EOF
Filesystem Backup Report
========================
Date: $(date)
Hostname: $(hostname)
Backup File: $BACKUP_FILE
Backup Size: $BACKUP_SIZE
Source Directories: ${SOURCE_DIRS[*]}
Retention: $RETENTION_DAYS days
Remote Destination: $REMOTE_DEST

Backup Status: SUCCESS
EOF

# Send email report
if command -v mail &> /dev/null; then
    mail -s "Filesystem Backup Report - $(hostname)" admin@example.com < "$REPORT_FILE"
fi

rm -f "$REPORT_FILE"
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between cron and systemd timers?**
   <details>
   <summary>Answer</summary>
   
   Systemd timers offer better logging, dependency management, and integration with systemd services. They also support more flexible scheduling options and better error handling compared to traditional cron jobs.
   </details>

2. **How do you ensure a script runs only one instance at a time?**
   <details>
   <summary>Answer</summary>
   
   Use a lock file mechanism with PID checking, or use `flock` command to create file locks that prevent multiple instances from running simultaneously.
   </details>

3. **What's the purpose of the `set -euo pipefail` command in bash scripts?**
   <details>
   <summary>Answer</summary>
   
   - `set -e`: Exit immediately if any command fails
   - `set -u`: Treat unset variables as errors
   - `set -o pipefail`: Make pipelines fail if any command in the pipeline fails
   </details>

4. **How do you securely store passwords in Ansible?**
   <details>
   <summary>Answer</summary>
   
   Use Ansible Vault to encrypt sensitive data: `ansible-vault create secrets.yml` or `ansible-vault encrypt_string 'password' --name 'vault_mysql_password'`
   </details>

### Hands-On Challenges

**Challenge 1: Complete Automation Suite**
```bash
# Create a comprehensive automation suite:
# - System monitoring with automated alerts
# - Automated backup system with encryption
# - Log rotation and analysis
# - Security hardening automation
# - Performance optimization scripts
# - Disaster recovery procedures
```

**Challenge 2: Infrastructure as Code**
```bash
# Implement Infrastructure as Code:
# - Create Ansible playbooks for complete infrastructure
# - Implement configuration management
# - Set up automated testing and validation
# - Create rollback procedures
# - Implement blue-green deployment automation
```

**Challenge 3: Advanced Monitoring Automation**
```bash
# Build advanced monitoring automation:
# - Custom metrics collection
# - Predictive alerting based on trends
# - Automated remediation scripts
# - Integration with external services
# - Comprehensive reporting and dashboards
```

## 🚀 Next Steps

Congratulations! You've mastered automation and scripting. You can now:
- Write professional bash scripts with proper error handling
- Automate tasks using cron and systemd timers
- Manage infrastructure with Ansible
- Implement automated backup and monitoring systems
- Create comprehensive automation workflows
- Handle complex system administration tasks programmatically

**Ready for security and firewalls?** Continue to [15-troubleshooting-debugging.md](15-troubleshooting-debugging.md) to learn advanced troubleshooting and debugging techniques.

---

> **Pro Tip**: Start small with automation - automate one task at a time, test thoroughly, and gradually build more complex workflows. Always include proper logging, error handling, and rollback procedures! 🤖