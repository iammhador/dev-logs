# Chapter 17: Backup and Recovery

## 📚 What You'll Learn

Database backup and recovery are critical for protecting data against hardware failures, human errors, corruption, and disasters. This chapter covers comprehensive backup strategies, recovery procedures, and high availability configurations for MySQL and PostgreSQL.

---

## 🎯 Learning Objectives

By the end of this chapter, you will:
- Understand different types of database backups
- Implement automated backup strategies
- Perform point-in-time recovery
- Configure high availability and replication
- Plan disaster recovery procedures
- Monitor backup integrity and performance
- Handle various failure scenarios

---

## 🔍 Concept Explanation

### Why Backup and Recovery Matter

**Data Loss Scenarios:**
- **Hardware Failures**: Disk crashes, server failures
- **Human Errors**: Accidental deletions, wrong updates
- **Software Bugs**: Application errors, corruption
- **Security Breaches**: Malicious attacks, ransomware
- **Natural Disasters**: Fire, flood, earthquakes

**Business Impact:**
- **Downtime Costs**: Lost revenue, productivity
- **Data Loss**: Irreplaceable business information
- **Compliance**: Legal and regulatory requirements
- **Reputation**: Customer trust and brand damage

### Key Concepts

**Recovery Point Objective (RPO)**: Maximum acceptable data loss
**Recovery Time Objective (RTO)**: Maximum acceptable downtime
**Backup Types**: Full, incremental, differential
**Recovery Types**: Complete, point-in-time, partial

---

## 🛠️ Backup Strategies

### MySQL Backup Methods

#### 1. Logical Backups with mysqldump

```bash
# Full database backup
mysqldump -u root -p --all-databases > full_backup.sql

# Single database backup
mysqldump -u root -p ecommerce_db > ecommerce_backup.sql

# Backup with additional options
mysqldump -u root -p \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --all-databases > complete_backup.sql

# Compressed backup
mysqldump -u root -p ecommerce_db | gzip > ecommerce_backup.sql.gz

# Backup specific tables
mysqldump -u root -p ecommerce_db customers orders > tables_backup.sql
```

#### 2. Physical Backups

```bash
# MySQL Enterprise Backup (Commercial)
mysqlbackup --user=root --password \
  --backup-dir=/backup/mysql \
  backup-and-apply-log

# Percona XtraBackup (Open Source)
xtrabackup --user=root --password=password \
  --backup --target-dir=/backup/mysql/

# Hot backup with XtraBackup
xtrabackup --user=root --password=password \
  --backup \
  --target-dir=/backup/mysql/$(date +%Y%m%d_%H%M%S)
```

#### 3. Binary Log Backups

```sql
-- Enable binary logging in my.cnf
[mysqld]
log-bin=mysql-bin
server-id=1
binlog-format=ROW
expire_logs_days=7

-- Flush and backup binary logs
FLUSH LOGS;

-- Copy binary log files
-- mysql-bin.000001, mysql-bin.000002, etc.
```

### PostgreSQL Backup Methods

#### 1. Logical Backups with pg_dump

```bash
# Full database backup
pg_dump -U postgres -h localhost ecommerce_db > ecommerce_backup.sql

# Compressed backup
pg_dump -U postgres -h localhost -Fc ecommerce_db > ecommerce_backup.dump

# All databases backup
pg_dumpall -U postgres -h localhost > all_databases.sql

# Backup with specific options
pg_dump -U postgres -h localhost \
  --verbose \
  --clean \
  --if-exists \
  --format=custom \
  ecommerce_db > ecommerce_backup.dump

# Parallel backup (faster for large databases)
pg_dump -U postgres -h localhost \
  --format=directory \
  --jobs=4 \
  --file=ecommerce_backup_dir \
  ecommerce_db
```

#### 2. Physical Backups with pg_basebackup

```bash
# Base backup
pg_basebackup -U postgres -h localhost \
  -D /backup/postgresql/base \
  -Ft -z -P

# Streaming backup
pg_basebackup -U postgres -h localhost \
  -D /backup/postgresql/$(date +%Y%m%d_%H%M%S) \
  -X stream -P

# WAL archiving setup in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/postgresql/wal/%f'
```

---

## 🔄 Automated Backup Scripts

### MySQL Automated Backup Script

```bash
#!/bin/bash
# mysql_backup.sh

# Configuration
DB_USER="backup_user"
DB_PASS="secure_password"
BACKUP_DIR="/backup/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to backup database
backup_database() {
    local db_name=$1
    local backup_file="$BACKUP_DIR/${db_name}_${DATE}.sql.gz"
    
    echo "Backing up database: $db_name"
    mysqldump -u $DB_USER -p$DB_PASS \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        $db_name | gzip > $backup_file
    
    if [ $? -eq 0 ]; then
        echo "Backup successful: $backup_file"
    else
        echo "Backup failed for: $db_name"
        exit 1
    fi
}

# Backup all databases
DATABASES=$(mysql -u $DB_USER -p$DB_PASS -e "SHOW DATABASES;" | grep -Ev "^(Database|information_schema|performance_schema|mysql|sys)$")

for db in $DATABASES; do
    backup_database $db
done

# Clean old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed at $(date)"
```

### PostgreSQL Automated Backup Script

```bash
#!/bin/bash
# postgresql_backup.sh

# Configuration
export PGUSER="postgres"
export PGPASSWORD="secure_password"
BACKUP_DIR="/backup/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to backup database
backup_database() {
    local db_name=$1
    local backup_file="$BACKUP_DIR/${db_name}_${DATE}.dump"
    
    echo "Backing up database: $db_name"
    pg_dump -h localhost \
        --format=custom \
        --compress=9 \
        --verbose \
        --file=$backup_file \
        $db_name
    
    if [ $? -eq 0 ]; then
        echo "Backup successful: $backup_file"
    else
        echo "Backup failed for: $db_name"
        exit 1
    fi
}

# Get list of databases
DATABASES=$(psql -h localhost -t -c "SELECT datname FROM pg_database WHERE NOT datistemplate AND datname != 'postgres';")

for db in $DATABASES; do
    # Remove whitespace
    db=$(echo $db | xargs)
    backup_database $db
done

# Clean old backups
find $BACKUP_DIR -name "*.dump" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed at $(date)"
```

---

## 🔧 Recovery Procedures

### MySQL Recovery

#### 1. Full Database Restore

```bash
# Restore from mysqldump
mysql -u root -p < full_backup.sql

# Restore specific database
mysql -u root -p ecommerce_db < ecommerce_backup.sql

# Restore compressed backup
gunzip < ecommerce_backup.sql.gz | mysql -u root -p ecommerce_db
```

#### 2. Point-in-Time Recovery

```bash
# Step 1: Restore from full backup
mysql -u root -p < full_backup_20241201_020000.sql

# Step 2: Apply binary logs up to specific time
mysqlbinlog --stop-datetime="2024-12-01 14:30:00" \
    mysql-bin.000001 mysql-bin.000002 | mysql -u root -p

# Alternative: Stop at specific position
mysqlbinlog --stop-position=12345 \
    mysql-bin.000001 | mysql -u root -p
```

#### 3. XtraBackup Recovery

```bash
# Prepare the backup
xtrabackup --prepare --target-dir=/backup/mysql/20241201_020000

# Stop MySQL service
sudo systemctl stop mysql

# Remove old data directory
sudo rm -rf /var/lib/mysql/*

# Copy backup to data directory
xtrabackup --copy-back --target-dir=/backup/mysql/20241201_020000

# Fix permissions
sudo chown -R mysql:mysql /var/lib/mysql

# Start MySQL service
sudo systemctl start mysql
```

### PostgreSQL Recovery

#### 1. Database Restore

```bash
# Restore from pg_dump (SQL format)
psql -U postgres -h localhost -d ecommerce_db < ecommerce_backup.sql

# Restore from custom format
pg_restore -U postgres -h localhost \
    --dbname=ecommerce_db \
    --verbose \
    ecommerce_backup.dump

# Restore with parallel jobs
pg_restore -U postgres -h localhost \
    --dbname=ecommerce_db \
    --jobs=4 \
    --verbose \
    ecommerce_backup_dir

# Create database and restore
createdb -U postgres ecommerce_db_restored
pg_restore -U postgres -h localhost \
    --dbname=ecommerce_db_restored \
    ecommerce_backup.dump
```

#### 2. Point-in-Time Recovery (PITR)

```bash
# Step 1: Stop PostgreSQL
sudo systemctl stop postgresql

# Step 2: Restore base backup
rm -rf /var/lib/postgresql/13/main/*
tar -xzf base_backup.tar.gz -C /var/lib/postgresql/13/main/

# Step 3: Create recovery.conf (PostgreSQL < 12) or recovery.signal (PostgreSQL >= 12)
echo "restore_command = 'cp /backup/postgresql/wal/%f %p'" > /var/lib/postgresql/13/main/recovery.conf
echo "recovery_target_time = '2024-12-01 14:30:00'" >> /var/lib/postgresql/13/main/recovery.conf

# For PostgreSQL >= 12
touch /var/lib/postgresql/13/main/recovery.signal
echo "restore_command = 'cp /backup/postgresql/wal/%f %p'" >> /var/lib/postgresql/13/main/postgresql.conf
echo "recovery_target_time = '2024-12-01 14:30:00'" >> /var/lib/postgresql/13/main/postgresql.conf

# Step 4: Start PostgreSQL
sudo systemctl start postgresql
```

---

## 🔄 High Availability and Replication

### MySQL Replication

#### Master-Slave Replication Setup

```sql
-- Master configuration (my.cnf)
[mysqld]
server-id=1
log-bin=mysql-bin
binlog-format=ROW
binlog-do-db=ecommerce_db

-- Create replication user on master
CREATE USER 'replication'@'%' IDENTIFIED BY 'secure_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';
FLUSH PRIVILEGES;

-- Get master status
SHOW MASTER STATUS;
-- Note: File and Position values

-- Slave configuration (my.cnf)
[mysqld]
server-id=2
relay-log=mysql-relay-bin
read-only=1

-- Configure slave
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='replication',
    MASTER_PASSWORD='secure_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=12345;

-- Start replication
START SLAVE;

-- Check slave status
SHOW SLAVE STATUS\G
```

#### MySQL Group Replication

```sql
-- Install Group Replication plugin
INSTALL PLUGIN group_replication SONAME 'group_replication.so';

-- Configure Group Replication
SET GLOBAL group_replication_group_name="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
SET GLOBAL group_replication_start_on_boot=off;
SET GLOBAL group_replication_local_address="192.168.1.10:33061";
SET GLOBAL group_replication_group_seeds="192.168.1.10:33061,192.168.1.11:33061,192.168.1.12:33061";
SET GLOBAL group_replication_bootstrap_group=on;

-- Start Group Replication
START GROUP_REPLICATION;

-- Check group members
SELECT * FROM performance_schema.replication_group_members;
```

### PostgreSQL Replication

#### Streaming Replication Setup

```bash
# Primary server configuration (postgresql.conf)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
archive_mode = on
archive_command = 'cp %p /backup/postgresql/wal/%f'

# Create replication user
psql -U postgres -c "CREATE USER replication REPLICATION LOGIN PASSWORD 'secure_password';"

# Configure pg_hba.conf on primary
echo "host replication replication 192.168.1.0/24 md5" >> /etc/postgresql/13/main/pg_hba.conf

# Setup standby server
pg_basebackup -h primary_ip -D /var/lib/postgresql/13/main -U replication -P -W

# Configure standby (postgresql.conf)
hot_standby = on

# Create standby.signal file
touch /var/lib/postgresql/13/main/standby.signal

# Configure primary connection info
echo "primary_conninfo = 'host=primary_ip port=5432 user=replication password=secure_password'" >> /var/lib/postgresql/13/main/postgresql.conf
```

#### PostgreSQL Logical Replication

```sql
-- Publisher setup
ALTER SYSTEM SET wal_level = logical;
SELECT pg_reload_conf();

-- Create publication
CREATE PUBLICATION ecommerce_pub FOR TABLE customers, orders, products;

-- Subscriber setup
CREATE SUBSCRIPTION ecommerce_sub 
CONNECTION 'host=publisher_ip dbname=ecommerce_db user=replication password=secure_password' 
PUBLICATION ecommerce_pub;

-- Monitor replication
SELECT * FROM pg_stat_replication;
SELECT * FROM pg_stat_subscription;
```

---

## 📊 Monitoring and Maintenance

### Backup Monitoring

```sql
-- MySQL: Check binary log status
SHOW BINARY LOGS;
SHOW MASTER STATUS;

-- Check slave lag
SHOW SLAVE STATUS\G

-- PostgreSQL: Check WAL status
SELECT pg_current_wal_lsn();
SELECT * FROM pg_stat_archiver;

-- Check replication lag
SELECT 
    client_addr,
    state,
    pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn) as send_lag,
    pg_wal_lsn_diff(sent_lsn, flush_lsn) as receive_lag
FROM pg_stat_replication;
```

### Backup Verification Script

```bash
#!/bin/bash
# verify_backup.sh

BACKUP_FILE=$1
TEST_DB="backup_test_$(date +%s)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Create test database
mysql -u root -p -e "CREATE DATABASE $TEST_DB;"

# Restore backup to test database
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip < $BACKUP_FILE | mysql -u root -p $TEST_DB
else
    mysql -u root -p $TEST_DB < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "Backup verification successful"
    # Run basic integrity checks
    mysql -u root -p $TEST_DB -e "CHECK TABLE customers, orders, products;"
else
    echo "Backup verification failed"
fi

# Cleanup
mysql -u root -p -e "DROP DATABASE $TEST_DB;"
```

---

## 🚨 Disaster Recovery Planning

### Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

| Scenario | RTO Target | RPO Target | Strategy |
|----------|------------|------------|-----------|
| Hardware Failure | < 1 hour | < 15 minutes | Hot standby with replication |
| Data Corruption | < 4 hours | < 1 hour | Point-in-time recovery |
| Site Disaster | < 24 hours | < 1 hour | Geographic replication |
| Human Error | < 2 hours | < 30 minutes | Transaction log replay |

### Disaster Recovery Checklist

```markdown
## Pre-Disaster Preparation
- [ ] Document all backup procedures
- [ ] Test recovery procedures monthly
- [ ] Maintain off-site backup copies
- [ ] Configure monitoring and alerting
- [ ] Train staff on recovery procedures
- [ ] Maintain emergency contact list

## During Disaster
- [ ] Assess the scope of the problem
- [ ] Activate disaster recovery team
- [ ] Communicate with stakeholders
- [ ] Execute recovery procedures
- [ ] Document all actions taken
- [ ] Monitor recovery progress

## Post-Disaster
- [ ] Verify data integrity
- [ ] Test application functionality
- [ ] Update documentation
- [ ] Conduct post-mortem analysis
- [ ] Improve procedures based on lessons learned
```

### Cloud Backup Strategies

```bash
# AWS S3 backup
aws s3 cp backup.sql.gz s3://company-db-backups/mysql/$(date +%Y/%m/%d)/

# Google Cloud Storage
gsutil cp backup.sql.gz gs://company-db-backups/mysql/$(date +%Y/%m/%d)/

# Azure Blob Storage
az storage blob upload \
    --account-name companystorage \
    --container-name db-backups \
    --name mysql/$(date +%Y/%m/%d)/backup.sql.gz \
    --file backup.sql.gz
```

---

## 💡 Real-World Examples

### Example 1: E-commerce Platform Recovery

**Scenario**: Online store database corruption during peak shopping season

```bash
# 1. Immediate response
# Switch to read-only mode
mysql -u root -p -e "SET GLOBAL read_only = ON;"

# 2. Assess damage
mysql -u root -p ecommerce_db -e "CHECK TABLE orders, customers, products;"

# 3. Point-in-time recovery to just before corruption
# Restore from last good backup (2 hours ago)
mysql -u root -p < ecommerce_backup_20241201_140000.sql

# Apply binary logs up to corruption point
mysqlbinlog --stop-datetime="2024-12-01 16:25:00" \
    mysql-bin.000015 | mysql -u root -p ecommerce_db

# 4. Verify data integrity
mysql -u root -p ecommerce_db -e "
    SELECT COUNT(*) FROM orders WHERE order_date = CURDATE();
    SELECT COUNT(*) FROM customers WHERE created_at = CURDATE();
"

# 5. Resume normal operations
mysql -u root -p -e "SET GLOBAL read_only = OFF;"
```

### Example 2: PostgreSQL Failover

**Scenario**: Primary database server hardware failure

```bash
# 1. Promote standby to primary
psql -U postgres -c "SELECT pg_promote();"

# 2. Update application connection strings
# Point applications to new primary server

# 3. Verify replication status
psql -U postgres -c "SELECT pg_is_in_recovery();"

# 4. Setup new standby server
pg_basebackup -h new_primary_ip -D /var/lib/postgresql/13/main -U replication -P -W

# 5. Configure new standby
echo "primary_conninfo = 'host=new_primary_ip port=5432 user=replication'" >> postgresql.conf
touch standby.signal
```

---

## 🎯 Use Cases & Interview Tips

### Common Interview Questions

1. **"How would you design a backup strategy for a 24/7 e-commerce application?"**
   - Continuous replication for high availability
   - Automated daily full backups
   - Hourly incremental backups
   - Off-site backup storage
   - Regular recovery testing

2. **"What's the difference between hot, warm, and cold backups?"**
   - **Hot**: Database remains online and accessible
   - **Warm**: Database is online but in read-only mode
   - **Cold**: Database is shut down during backup

3. **"How do you ensure backup integrity?"**
   - Checksum verification
   - Regular restore testing
   - Backup validation scripts
   - Monitoring backup completion
   - Multiple backup copies

4. **"Explain point-in-time recovery."**
   - Restore from full backup
   - Apply transaction logs up to specific time
   - Useful for recovering from human errors
   - Requires continuous log archiving

### Best Practices

1. **3-2-1 Rule**: 3 copies of data, 2 different media types, 1 off-site
2. **Test Regularly**: Recovery procedures should be tested monthly
3. **Automate Everything**: Reduce human error with automation
4. **Monitor Continuously**: Alert on backup failures immediately
5. **Document Thoroughly**: Clear procedures for emergency situations

---

## ⚠️ Things to Watch Out For

### Common Backup Mistakes

1. **Not Testing Restores**
   ```bash
   # Bad: Only creating backups
   mysqldump -u root -p database > backup.sql
   
   # Good: Testing restore process
   mysql -u root -p test_db < backup.sql
   ```

2. **Insufficient Retention**
   ```bash
   # Bad: Only keeping recent backups
   find /backup -name "*.sql" -mtime +7 -delete
   
   # Good: Graduated retention policy
   # Keep daily for 30 days, weekly for 12 weeks, monthly for 12 months
   ```

3. **No Off-site Storage**
   ```bash
   # Bad: All backups on same server
   cp backup.sql /local/backup/
   
   # Good: Remote storage
   rsync backup.sql remote-server:/backup/
   aws s3 cp backup.sql s3://backup-bucket/
   ```

4. **Ignoring Binary Logs**
   ```sql
   -- Bad: Only full backups
   mysqldump --all-databases > backup.sql
   
   -- Good: Enable binary logging for point-in-time recovery
   SET GLOBAL log_bin = ON;
   ```

### Security Considerations

1. **Encrypt Backup Files**
   ```bash
   # Encrypt during backup
   mysqldump -u root -p database | gpg --encrypt -r backup@company.com > backup.sql.gpg
   
   # Decrypt during restore
   gpg --decrypt backup.sql.gpg | mysql -u root -p database
   ```

2. **Secure Backup Storage**
   ```bash
   # Set proper permissions
   chmod 600 backup.sql
   chown backup:backup backup.sql
   
   # Use secure transfer protocols
   scp backup.sql backup-server:/secure/location/
   ```

3. **Backup User Privileges**
   ```sql
   -- Create dedicated backup user with minimal privileges
   CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON *.* TO 'backup_user'@'localhost';
   ```

---

## 🔗 Next Steps

🎉 **Congratulations!** You've now completed the comprehensive SQL learning path covering all essential database topics!

### 🚀 You've Mastered:
- **Database Fundamentals** (RDBMS, ACID properties)
- **Core SQL Operations** (CRUD, joins, subqueries)
- **Advanced Analytics** (Window functions, CTEs)
- **Performance Optimization** (Indexes, query tuning)
- **Database Programming** (Stored procedures, triggers)
- **Enterprise Features** (Transactions, security, user management)
- **Backup and Recovery** (Disaster recovery, high availability)

### 🎯 What's Next?
- **Practice Projects**: Build real-world applications using your SQL skills
- **Specialization**: Choose MySQL or PostgreSQL for deeper expertise
- **Integration**: Learn how SQL works with programming languages (Python, Node.js, etc.)
- **Advanced Topics**: Explore database administration, replication, and cloud databases
- **Certification**: Consider MySQL or PostgreSQL certification exams

### 📚 Continue Learning:
- Check out other branches in this repository (JavaScript, React, etc.)
- Build full-stack applications combining SQL with web technologies
- Explore NoSQL databases for comparison and broader database knowledge
- Learn about database DevOps and infrastructure as code

**You're now ready to work as a confident database professional!** 🎊

---

*This completes the comprehensive SQL learning journey. You now have the knowledge and skills to design, implement, optimize, and maintain production database systems.*