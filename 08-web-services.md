# 🌐 Web Services: HTTP, HTTPS, and Server Management

> **Master web server setup, SSL/TLS configuration, and HTTP protocol fundamentals**

## 📖 What You'll Learn

Web services are the backbone of modern internet infrastructure. This chapter covers everything from basic HTTP concepts to advanced web server management:

- HTTP/HTTPS protocol fundamentals
- Web server installation and configuration (Apache, Nginx)
- SSL/TLS certificate management
- Virtual hosts and domain configuration
- Load balancing and reverse proxying
- Web server security and hardening
- Performance optimization
- Troubleshooting web services

## 🌍 Why This Matters

**Critical applications:**
- **Web Development**: Host websites and web applications
- **API Services**: Serve REST APIs and microservices
- **Content Delivery**: Serve static and dynamic content efficiently
- **Security**: Implement HTTPS and secure web communications
- **DevOps**: Deploy and manage web infrastructure

## 🔗 HTTP/HTTPS Protocol Fundamentals

### Understanding HTTP

```bash
# Basic HTTP request with curl
$ curl -v http://example.com
* Trying 93.184.216.34:80...
* Connected to example.com (93.184.216.34) port 80 (#0)
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/7.68.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Content-Type: text/html; charset=UTF-8
< Content-Length: 1256
< Server: ECS (dcb/7F83)
<
<!doctype html>
<html>
...

# HTTP methods demonstration
$ curl -X GET http://api.example.com/users
$ curl -X POST -H "Content-Type: application/json" -d '{"name":"John"}' http://api.example.com/users
$ curl -X PUT -H "Content-Type: application/json" -d '{"name":"Jane"}' http://api.example.com/users/1
$ curl -X DELETE http://api.example.com/users/1

# HTTP headers
$ curl -H "Authorization: Bearer token123" http://api.example.com/protected
$ curl -H "Accept: application/json" http://api.example.com/data
$ curl -H "User-Agent: MyApp/1.0" http://example.com

# View response headers only
$ curl -I http://example.com
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1256
Server: ECS (dcb/7F83)
Date: Mon, 15 Dec 2023 10:30:00 GMT
Last-Modified: Thu, 17 Oct 2019 07:18:26 GMT
ETag: "3147526947+gzip"
Expires: Mon, 22 Dec 2023 10:30:00 GMT
Cache-Control: max-age=604800

# HTTP status codes
$ curl -w "%{http_code}" -s -o /dev/null http://example.com
200

$ curl -w "%{http_code}" -s -o /dev/null http://example.com/nonexistent
404
```

### HTTPS and SSL/TLS

```bash
# HTTPS request
$ curl -v https://example.com
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384

# Check SSL certificate
$ openssl s_client -connect example.com:443 -servername example.com
$ openssl s_client -connect example.com:443 -showcerts

# Check certificate expiration
$ echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
notBefore=Oct 22 12:00:00 2023 GMT
notAfter=Oct 22 12:00:00 2024 GMT

# Test SSL configuration
$ curl --tlsv1.2 https://example.com
$ curl --tlsv1.3 https://example.com

# Ignore SSL certificate errors (for testing)
$ curl -k https://self-signed.example.com
$ curl --insecure https://self-signed.example.com
```

## 🔧 Apache Web Server

### Apache Installation and Basic Configuration

```bash
# Install Apache
$ sudo apt update
$ sudo apt install apache2

# Start and enable Apache
$ sudo systemctl start apache2
$ sudo systemctl enable apache2
$ sudo systemctl status apache2

# Check Apache version
$ apache2 -v
Server version: Apache/2.4.41 (Ubuntu)
Server built:   2023-10-10T19:35:51

# Test Apache installation
$ curl http://localhost
$ curl http://$(hostname -I | awk '{print $1}')

# Apache configuration files
/etc/apache2/
├── apache2.conf          # Main configuration
├── sites-available/      # Available sites
├── sites-enabled/        # Enabled sites
├── mods-available/       # Available modules
├── mods-enabled/         # Enabled modules
├── conf-available/       # Available configurations
└── conf-enabled/         # Enabled configurations

# Enable/disable sites
$ sudo a2ensite default-ssl
$ sudo a2dissite 000-default
$ sudo systemctl reload apache2

# Enable/disable modules
$ sudo a2enmod ssl
$ sudo a2enmod rewrite
$ sudo a2dismod autoindex
$ sudo systemctl reload apache2

# Check enabled modules
$ apache2ctl -M
```

### Apache Virtual Hosts

```bash
# Create virtual host configuration
$ sudo nano /etc/apache2/sites-available/example.com.conf

<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com
    ErrorLog ${APACHE_LOG_DIR}/example.com_error.log
    CustomLog ${APACHE_LOG_DIR}/example.com_access.log combined
    
    <Directory /var/www/example.com>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# HTTPS virtual host
$ sudo nano /etc/apache2/sites-available/example.com-ssl.conf

<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/example.com.crt
    SSLCertificateKeyFile /etc/ssl/private/example.com.key
    SSLCertificateChainFile /etc/ssl/certs/example.com-chain.crt
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    ErrorLog ${APACHE_LOG_DIR}/example.com_ssl_error.log
    CustomLog ${APACHE_LOG_DIR}/example.com_ssl_access.log combined
</VirtualHost>

# Create document root
$ sudo mkdir -p /var/www/example.com
$ sudo chown -R www-data:www-data /var/www/example.com
$ sudo chmod -R 755 /var/www/example.com

# Create test page
$ sudo nano /var/www/example.com/index.html
<!DOCTYPE html>
<html>
<head>
    <title>Welcome to example.com</title>
</head>
<body>
    <h1>Hello from example.com!</h1>
    <p>This is a test page.</p>
</body>
</html>

# Enable site
$ sudo a2ensite example.com
$ sudo systemctl reload apache2
```

### Apache Security and Performance

```bash
# Security configuration
$ sudo nano /etc/apache2/conf-available/security.conf

# Hide Apache version
ServerTokens Prod
ServerSignature Off

# Disable server-info and server-status
<Location "/server-info">
    Require all denied
</Location>

<Location "/server-status">
    Require all denied
</Location>

# Prevent access to .htaccess files
<FilesMatch "^\.ht">
    Require all denied
</FilesMatch>

# Enable security configuration
$ sudo a2enconf security
$ sudo systemctl reload apache2

# Performance tuning
$ sudo nano /etc/apache2/mods-available/mpm_prefork.conf

<IfModule mpm_prefork_module>
    StartServers             4
    MinSpareServers          20
    MaxSpareServers          40
    MaxRequestWorkers        200
    MaxConnectionsPerChild   4500
</IfModule>

# Enable compression
$ sudo a2enmod deflate
$ sudo nano /etc/apache2/mods-available/deflate.conf

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Enable caching
$ sudo a2enmod expires
$ sudo a2enmod headers
$ sudo nano /etc/apache2/mods-available/expires.conf

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
</IfModule>
```

## ⚡ Nginx Web Server

### Nginx Installation and Basic Configuration

```bash
# Install Nginx
$ sudo apt update
$ sudo apt install nginx

# Start and enable Nginx
$ sudo systemctl start nginx
$ sudo systemctl enable nginx
$ sudo systemctl status nginx

# Check Nginx version
$ nginx -v
nginx version: nginx/1.18.0 (Ubuntu)

# Test Nginx configuration
$ sudo nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx configuration
$ sudo systemctl reload nginx
$ sudo nginx -s reload

# Nginx configuration structure
/etc/nginx/
├── nginx.conf            # Main configuration
├── sites-available/      # Available sites
├── sites-enabled/        # Enabled sites (symlinks)
├── conf.d/              # Additional configurations
└── snippets/            # Configuration snippets
```

### Nginx Server Blocks (Virtual Hosts)

```bash
# Create server block configuration
$ sudo nano /etc/nginx/sites-available/example.com

server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.htm index.nginx-debian.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Logging
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;
}

# HTTPS server block
$ sudo nano /etc/nginx/sites-available/example.com-ssl

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.htm;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    access_log /var/log/nginx/example.com-ssl.access.log;
    error_log /var/log/nginx/example.com-ssl.error.log;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# Enable site
$ sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
$ sudo nginx -t
$ sudo systemctl reload nginx
```

### Nginx as Reverse Proxy

```bash
# Reverse proxy configuration
$ sudo nano /etc/nginx/sites-available/app.example.com

upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name app.example.com;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files
    location /static/ {
        alias /var/www/app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://backend;
        # ... other proxy settings
    }
}

# Rate limiting configuration
$ sudo nano /etc/nginx/nginx.conf

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    # Connection limiting
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    limit_conn conn_limit_per_ip 20;
    
    # ... rest of configuration
}
```

## 🔒 SSL/TLS Certificate Management

### Let's Encrypt with Certbot

```bash
# Install Certbot
$ sudo apt install certbot python3-certbot-apache  # For Apache
$ sudo apt install certbot python3-certbot-nginx   # For Nginx

# Obtain certificate (Apache)
$ sudo certbot --apache -d example.com -d www.example.com

# Obtain certificate (Nginx)
$ sudo certbot --nginx -d example.com -d www.example.com

# Manual certificate generation
$ sudo certbot certonly --standalone -d example.com -d www.example.com
$ sudo certbot certonly --webroot -w /var/www/example.com -d example.com

# List certificates
$ sudo certbot certificates
Found the following certs:
  Certificate Name: example.com
    Serial Number: 3a2b1c4d5e6f7890abcdef1234567890
    Key Type: RSA
    Domains: example.com www.example.com
    Expiry Date: 2024-03-15 10:30:00+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/example.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/example.com/privkey.pem

# Renew certificates
$ sudo certbot renew
$ sudo certbot renew --dry-run  # Test renewal

# Auto-renewal with cron
$ sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet

# Revoke certificate
$ sudo certbot revoke --cert-path /etc/letsencrypt/live/example.com/cert.pem
```

### Self-Signed Certificates

```bash
# Generate private key
$ sudo openssl genrsa -out /etc/ssl/private/example.com.key 2048

# Generate certificate signing request
$ sudo openssl req -new -key /etc/ssl/private/example.com.key -out /tmp/example.com.csr
Country Name (2 letter code) [AU]: US
State or Province Name (full name) [Some-State]: California
Locality Name (eg, city) []: San Francisco
Organization Name (eg, company) [Internet Widgits Pty Ltd]: Example Corp
Organizational Unit Name (eg, section) []: IT Department
Common Name (e.g. server FQDN or YOUR name) []: example.com
Email Address []: admin@example.com

# Generate self-signed certificate
$ sudo openssl x509 -req -days 365 -in /tmp/example.com.csr -signkey /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt

# Generate certificate and key in one command
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/example.com.key -out /etc/ssl/certs/example.com.crt

# Set proper permissions
$ sudo chmod 600 /etc/ssl/private/example.com.key
$ sudo chmod 644 /etc/ssl/certs/example.com.crt

# Verify certificate
$ openssl x509 -in /etc/ssl/certs/example.com.crt -text -noout
```

## 📊 Web Server Monitoring and Troubleshooting

### Apache Monitoring

```bash
# Enable server status module
$ sudo a2enmod status
$ sudo nano /etc/apache2/mods-available/status.conf

<Location "/server-status">
    SetHandler server-status
    Require local
    Require ip 192.168.1
</Location>

<Location "/server-info">
    SetHandler server-info
    Require local
    Require ip 192.168.1
</Location>

# View server status
$ curl http://localhost/server-status
$ curl http://localhost/server-status?auto  # Machine readable

# Monitor Apache logs
$ sudo tail -f /var/log/apache2/access.log
$ sudo tail -f /var/log/apache2/error.log

# Analyze Apache logs
$ sudo grep "404" /var/log/apache2/access.log | head -10
$ sudo awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | head -10

# Check Apache processes
$ ps aux | grep apache2
$ sudo apache2ctl status
```

### Nginx Monitoring

```bash
# Enable stub status module
$ sudo nano /etc/nginx/sites-available/default

server {
    listen 80;
    server_name localhost;
    
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 192.168.1.0/24;
        deny all;
    }
}

# View Nginx status
$ curl http://localhost/nginx_status
Active connections: 2
server accepts handled requests
 1000 1000 2000
Reading: 0 Writing: 1 Waiting: 1

# Monitor Nginx logs
$ sudo tail -f /var/log/nginx/access.log
$ sudo tail -f /var/log/nginx/error.log

# Analyze Nginx logs
$ sudo awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
$ sudo grep "error" /var/log/nginx/error.log | tail -10

# Check Nginx processes
$ ps aux | grep nginx
$ sudo nginx -T  # Show complete configuration
```

### Performance Testing

```bash
# Apache Bench (ab)
$ ab -n 1000 -c 10 http://example.com/
This is ApacheBench, Version 2.3
Copyright 1996 Adam Twiss, Zeus Technology Ltd
...
Server Software:        nginx/1.18.0
Server Hostname:        example.com
Server Port:            80

Document Path:          /
Document Length:        612 bytes

Concurrency Level:      10
Time taken for tests:   0.123 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      853000 bytes
HTML transferred:       612000 bytes
Requests per second:    8130.08 [#/sec] (mean)
Time per request:       1.230 [ms] (mean)
Time per request:       0.123 [ms] (mean, across all concurrent requests)
Transfer rate:          6767.89 [Kbytes/sec] received

# wrk (modern alternative)
$ sudo apt install wrk
$ wrk -t12 -c400 -d30s http://example.com/
Running 30s test @ http://example.com/
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    15.50ms   10.23ms 200.00ms   89.12%
    Req/Sec     2.15k   500.23     3.50k    68.75%
  774000 requests in 30.00s, 1.23GB read
Requests/sec:  25800.00
Transfer/sec:   42.00MB

# curl timing
$ curl -w "@curl-format.txt" -o /dev/null -s http://example.com/
# curl-format.txt:
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### Common Troubleshooting

```bash
# Check if web server is running
$ sudo systemctl status apache2
$ sudo systemctl status nginx

# Check listening ports
$ sudo netstat -tlnp | grep :80
$ sudo ss -tlnp | grep :80

# Test configuration
$ sudo apache2ctl configtest
$ sudo nginx -t

# Check disk space
$ df -h /var/log
$ df -h /var/www

# Check file permissions
$ ls -la /var/www/example.com/
$ sudo find /var/www/example.com -type f -exec chmod 644 {} \;
$ sudo find /var/www/example.com -type d -exec chmod 755 {} \;

# Check DNS resolution
$ nslookup example.com
$ dig example.com

# Test SSL certificate
$ openssl s_client -connect example.com:443 -servername example.com
$ curl -I https://example.com

# Check firewall
$ sudo ufw status
$ sudo iptables -L

# Monitor real-time connections
$ sudo netstat -an | grep :80 | wc -l
$ watch 'sudo netstat -an | grep :80 | wc -l'
```

## 🧠 Knowledge Check

### Quick Quiz

1. **What's the difference between Apache and Nginx architecture?**
   <details>
   <summary>Answer</summary>
   
   Apache uses a process/thread-based model where each request is handled by a separate process or thread, while Nginx uses an event-driven, asynchronous architecture that can handle many connections with fewer resources.
   </details>

2. **How do you redirect HTTP to HTTPS in Nginx?**
   <details>
   <summary>Answer</summary>
   
   ```nginx
   server {
       listen 80;
       server_name example.com;
       return 301 https://$server_name$request_uri;
   }
   ```
   </details>

3. **What does the HTTP status code 502 mean?**
   <details>
   <summary>Answer</summary>
   
   502 Bad Gateway means the server acting as a gateway or proxy received an invalid response from the upstream server.
   </details>

4. **How do you check SSL certificate expiration from command line?**
   <details>
   <summary>Answer</summary>
   
   ```bash
   echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
   ```
   </details>

### Hands-On Challenges

**Challenge 1: Complete Web Server Setup**
```bash
# Set up a web server that:
# - Serves multiple domains with virtual hosts
# - Implements SSL/TLS with Let's Encrypt
# - Includes security headers and hardening
# - Has proper logging and monitoring
# - Implements caching and compression
```

**Challenge 2: Load Balancer Configuration**
```bash
# Create a load balancer setup that:
# - Distributes traffic across multiple backend servers
# - Implements health checks
# - Handles SSL termination
# - Includes rate limiting
# - Provides failover capabilities
```

**Challenge 3: Web Performance Optimization**
```bash
# Optimize a web server for:
# - Maximum concurrent connections
# - Fastest response times
# - Efficient resource usage
# - Proper caching strategies
# - Security without performance impact
```

## 🚀 Next Steps

Excellent! You've mastered web services and HTTP/HTTPS. You can now:
- Set up and configure Apache and Nginx web servers
- Implement SSL/TLS certificates and HTTPS
- Create virtual hosts for multiple domains
- Configure reverse proxies and load balancing
- Monitor and troubleshoot web services
- Optimize web server performance
- Implement security best practices

**Ready for advanced networking tools?** Continue to [12-security-firewalls.md](12-security-firewalls.md) to learn about network security, firewalls, and intrusion detection.

---

> **Pro Tip**: Always use HTTPS in production, keep your web server software updated, monitor logs regularly, and implement proper security headers. Performance and security go hand in hand - optimize for both! 🌐