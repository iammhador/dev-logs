# Chapter 22: Cloud Databases & Database as a Service (DBaaS)

## 📚 Learning Objectives

By the end of this chapter, you will:
- Understand cloud database concepts and benefits
- Learn about major cloud database providers (AWS, Azure, GCP)
- Master database migration strategies to the cloud
- Implement cloud-native database solutions
- Understand serverless database concepts
- Learn about multi-cloud and hybrid database architectures
- Implement database monitoring and cost optimization in the cloud
- Understand compliance and security in cloud databases

---

## 🌐 Introduction to Cloud Databases

### What are Cloud Databases?

Cloud databases are databases that run on cloud computing platforms, providing:
- **Scalability**: Automatic scaling based on demand
- **Availability**: High availability with built-in redundancy
- **Managed Services**: Reduced operational overhead
- **Global Reach**: Deploy databases closer to users worldwide
- **Cost Efficiency**: Pay-as-you-use pricing models

### Types of Cloud Database Services

1. **Infrastructure as a Service (IaaS)**
   - Virtual machines with self-managed databases
   - Full control over database configuration
   - Examples: EC2 with MySQL, Azure VMs with SQL Server

2. **Platform as a Service (PaaS)**
   - Managed database services
   - Automated backups, updates, and scaling
   - Examples: AWS RDS, Azure SQL Database, Google Cloud SQL

3. **Software as a Service (SaaS)**
   - Fully managed database applications
   - No infrastructure management required
   - Examples: Salesforce, Office 365

4. **Database as a Service (DBaaS)**
   - Specialized managed database services
   - Optimized for specific use cases
   - Examples: MongoDB Atlas, Redis Cloud, Snowflake

---

## ☁️ Major Cloud Database Providers

### Amazon Web Services (AWS)

#### AWS RDS (Relational Database Service)

```sql
-- Creating an RDS MySQL instance via AWS CLI
aws rds create-db-instance \
    --db-instance-identifier myapp-mysql \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password MySecurePassword123! \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-12345678 \
    --db-subnet-group-name myapp-subnet-group \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --tags Key=Environment,Value=Production Key=Application,Value=MyApp

-- Connecting to RDS MySQL
mysql -h myapp-mysql.cluster-xyz.us-east-1.rds.amazonaws.com \
       -u admin \
       -p \
       -P 3306 \
       myapp_database
```

#### AWS Aurora (MySQL/PostgreSQL Compatible)

```sql
-- Creating Aurora Cluster
aws rds create-db-cluster \
    --db-cluster-identifier myapp-aurora-cluster \
    --engine aurora-mysql \
    --engine-version 8.0.mysql_aurora.3.02.0 \
    --master-username admin \
    --master-user-password MySecurePassword123! \
    --vpc-security-group-ids sg-12345678 \
    --db-subnet-group-name myapp-subnet-group \
    --backup-retention-period 7 \
    --storage-encrypted \
    --enable-cloudwatch-logs-exports error general slowquery

-- Creating Aurora instances
aws rds create-db-instance \
    --db-instance-identifier myapp-aurora-writer \
    --db-instance-class db.r6g.large \
    --engine aurora-mysql \
    --db-cluster-identifier myapp-aurora-cluster

aws rds create-db-instance \
    --db-instance-identifier myapp-aurora-reader \
    --db-instance-class db.r6g.large \
    --engine aurora-mysql \
    --db-cluster-identifier myapp-aurora-cluster
```

#### AWS DynamoDB (NoSQL)

```python
import boto3
from boto3.dynamodb.conditions import Key, Attr

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Create table
table = dynamodb.create_table(
    TableName='Users',
    KeySchema=[
        {
            'AttributeName': 'user_id',
            'KeyType': 'HASH'  # Partition key
        },
        {
            'AttributeName': 'created_at',
            'KeyType': 'RANGE'  # Sort key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'user_id',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'created_at',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'email',
            'AttributeType': 'S'
        }
    ],
    GlobalSecondaryIndexes=[
        {
            'IndexName': 'EmailIndex',
            'KeySchema': [
                {
                    'AttributeName': 'email',
                    'KeyType': 'HASH'
                }
            ],
            'Projection': {
                'ProjectionType': 'ALL'
            },
            'BillingMode': 'PAY_PER_REQUEST'
        }
    ],
    BillingMode='PAY_PER_REQUEST',
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'Production'
        }
    ]
)

# Wait for table to be created
table.wait_until_exists()

# Insert data
table = dynamodb.Table('Users')
table.put_item(
    Item={
        'user_id': 'user123',
        'created_at': '2024-01-15T10:30:00Z',
        'email': 'user@example.com',
        'name': 'John Doe',
        'age': 30,
        'preferences': {
            'theme': 'dark',
            'notifications': True
        }
    }
)

# Query data
response = table.query(
    KeyConditionExpression=Key('user_id').eq('user123')
)

# Scan with filter
response = table.scan(
    FilterExpression=Attr('age').gt(25) & Attr('preferences.notifications').eq(True)
)

# Update item
table.update_item(
    Key={
        'user_id': 'user123',
        'created_at': '2024-01-15T10:30:00Z'
    },
    UpdateExpression='SET age = :age, preferences.theme = :theme',
    ExpressionAttributeValues={
        ':age': 31,
        ':theme': 'light'
    }
)
```

### Microsoft Azure

#### Azure SQL Database

```sql
-- Creating Azure SQL Database via Azure CLI
az sql server create \
    --name myapp-sql-server \
    --resource-group myapp-rg \
    --location eastus \
    --admin-user sqladmin \
    --admin-password MySecurePassword123!

az sql db create \
    --resource-group myapp-rg \
    --server myapp-sql-server \
    --name myapp-database \
    --service-objective S2 \
    --backup-storage-redundancy Local

-- Connection string
-- Server=myapp-sql-server.database.windows.net;Database=myapp-database;User ID=sqladmin;Password=MySecurePassword123!;Encrypt=True;TrustServerCertificate=False;

-- Azure SQL Database specific features
-- Automatic tuning
ALTER DATABASE myapp_database SET AUTOMATIC_TUNING (FORCE_LAST_GOOD_PLAN = ON);
ALTER DATABASE myapp_database SET AUTOMATIC_TUNING (CREATE_INDEX = ON);
ALTER DATABASE myapp_database SET AUTOMATIC_TUNING (DROP_INDEX = ON);

-- Query Store (automatically enabled)
SELECT 
    qsq.query_id,
    qsq.query_sql_text,
    qrs.avg_duration/1000.0 as avg_duration_ms,
    qrs.avg_cpu_time/1000.0 as avg_cpu_time_ms,
    qrs.execution_count
FROM sys.query_store_query qsq
JOIN sys.query_store_plan qsp ON qsq.query_id = qsp.query_id
JOIN sys.query_store_runtime_stats qrs ON qsp.plan_id = qrs.plan_id
WHERE qrs.last_execution_time > DATEADD(hour, -1, GETUTCDATE())
ORDER BY qrs.avg_duration DESC;

-- Elastic Pool for multiple databases
az sql elastic-pool create \
    --resource-group myapp-rg \
    --server myapp-sql-server \
    --name myapp-elastic-pool \
    --edition Standard \
    --dtu 100 \
    --db-dtu-max 20 \
    --db-dtu-min 5
```

#### Azure Database for PostgreSQL

```sql
-- Creating Azure PostgreSQL via Azure CLI
az postgres server create \
    --resource-group myapp-rg \
    --name myapp-postgres-server \
    --location eastus \
    --admin-user postgres \
    --admin-password MySecurePassword123! \
    --sku-name GP_Gen5_2 \
    --version 13

az postgres db create \
    --resource-group myapp-rg \
    --server-name myapp-postgres-server \
    --name myapp_database

-- Connection via psql
psql "host=myapp-postgres-server.postgres.database.azure.com port=5432 dbname=myapp_database user=postgres@myapp-postgres-server password=MySecurePassword123! sslmode=require"

-- Azure PostgreSQL specific features
-- Read replicas
az postgres server replica create \
    --name myapp-postgres-replica \
    --resource-group myapp-rg \
    --source-server myapp-postgres-server

-- Point-in-time restore
az postgres server restore \
    --resource-group myapp-rg \
    --name myapp-postgres-restored \
    --restore-point-in-time "2024-01-15T10:00:00Z" \
    --source-server myapp-postgres-server
```

### Google Cloud Platform (GCP)

#### Google Cloud SQL

```sql
-- Creating Cloud SQL MySQL via gcloud CLI
gcloud sql instances create myapp-mysql-instance \
    --database-version=MYSQL_8_0 \
    --tier=db-n1-standard-2 \
    --region=us-central1 \
    --root-password=MySecurePassword123! \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --storage-auto-increase \
    --storage-size=20GB \
    --storage-type=SSD

-- Create database
gcloud sql databases create myapp_database \
    --instance=myapp-mysql-instance

-- Create user
gcloud sql users create appuser \
    --instance=myapp-mysql-instance \
    --password=AppUserPassword123!

-- Connection via Cloud SQL Proxy
./cloud_sql_proxy -instances=myproject:us-central1:myapp-mysql-instance=tcp:3306 &
mysql -h 127.0.0.1 -u root -p myapp_database
```

#### Google Cloud Spanner (Globally Distributed)

```sql
-- Creating Spanner instance via gcloud
gcloud spanner instances create myapp-spanner-instance \
    --config=regional-us-central1 \
    --description="MyApp Spanner Instance" \
    --nodes=1

-- Create database
gcloud spanner databases create myapp_database \
    --instance=myapp-spanner-instance

-- DDL for Spanner
CREATE TABLE Users (
    UserId STRING(36) NOT NULL,
    Email STRING(255) NOT NULL,
    Name STRING(100),
    CreatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
    UpdatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
) PRIMARY KEY (UserId);

CREATE INDEX UsersByEmail ON Users(Email);

CREATE TABLE Orders (
    OrderId STRING(36) NOT NULL,
    UserId STRING(36) NOT NULL,
    TotalAmount NUMERIC NOT NULL,
    Status STRING(20) NOT NULL,
    CreatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true)
) PRIMARY KEY (UserId, OrderId),
  INTERLEAVE IN PARENT Users ON DELETE CASCADE;

-- Spanner-specific queries
-- Strong consistency read
SELECT * FROM Users WHERE UserId = @user_id;

-- Stale read (for better performance)
SELECT * FROM Users WHERE Email = @email
OPTIONS (read_timestamp = CURRENT_TIMESTAMP() - INTERVAL 10 SECOND);

-- Partitioned DML for large updates
PARTITION UPDATE Users SET UpdatedAt = PENDING_COMMIT_TIMESTAMP()
WHERE CreatedAt < TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY);
```

---

## 🔄 Database Migration to Cloud

### Migration Strategies

1. **Lift and Shift**
   - Move existing database to cloud VMs
   - Minimal changes required
   - Quick migration but limited cloud benefits

2. **Re-platform**
   - Move to managed database services
   - Some application changes may be needed
   - Better cloud integration

3. **Re-architect**
   - Redesign for cloud-native services
   - Significant changes but maximum benefits
   - Microservices, serverless, etc.

### AWS Database Migration Service (DMS)

```python
import boto3
import json

# Initialize DMS client
dms = boto3.client('dms', region_name='us-east-1')

# Create replication subnet group
response = dms.create_replication_subnet_group(
    ReplicationSubnetGroupIdentifier='myapp-dms-subnet-group',
    ReplicationSubnetGroupDescription='DMS subnet group for MyApp migration',
    SubnetIds=[
        'subnet-12345678',
        'subnet-87654321'
    ],
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'Migration'
        }
    ]
)

# Create replication instance
response = dms.create_replication_instance(
    ReplicationInstanceIdentifier='myapp-dms-instance',
    ReplicationInstanceClass='dms.t3.micro',
    AllocatedStorage=20,
    VpcSecurityGroupIds=[
        'sg-12345678'
    ],
    ReplicationSubnetGroupIdentifier='myapp-dms-subnet-group',
    MultiAZ=False,
    PubliclyAccessible=False,
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'Migration'
        }
    ]
)

# Create source endpoint (on-premises MySQL)
response = dms.create_endpoint(
    EndpointIdentifier='myapp-source-mysql',
    EndpointType='source',
    EngineName='mysql',
    Username='dms_user',
    Password='dms_password',
    ServerName='onprem-mysql.company.com',
    Port=3306,
    DatabaseName='myapp_production',
    ExtraConnectionAttributes='initstmt=SET foreign_key_checks=0',
    Tags=[
        {
            'Key': 'Type',
            'Value': 'Source'
        }
    ]
)

# Create target endpoint (AWS RDS)
response = dms.create_endpoint(
    EndpointIdentifier='myapp-target-rds',
    EndpointType='target',
    EngineName='mysql',
    Username='admin',
    Password='MySecurePassword123!',
    ServerName='myapp-mysql.cluster-xyz.us-east-1.rds.amazonaws.com',
    Port=3306,
    DatabaseName='myapp_production',
    Tags=[
        {
            'Key': 'Type',
            'Value': 'Target'
        }
    ]
)

# Create migration task
table_mappings = {
    "rules": [
        {
            "rule-type": "selection",
            "rule-id": "1",
            "rule-name": "1",
            "object-locator": {
                "schema-name": "myapp_production",
                "table-name": "%"
            },
            "rule-action": "include"
        },
        {
            "rule-type": "transformation",
            "rule-id": "2",
            "rule-name": "2",
            "rule-target": "table",
            "object-locator": {
                "schema-name": "myapp_production",
                "table-name": "user_sessions"
            },
            "rule-action": "exclude"
        }
    ]
}

response = dms.create_replication_task(
    ReplicationTaskIdentifier='myapp-migration-task',
    SourceEndpointArn='arn:aws:dms:us-east-1:123456789012:endpoint:myapp-source-mysql',
    TargetEndpointArn='arn:aws:dms:us-east-1:123456789012:endpoint:myapp-target-rds',
    ReplicationInstanceArn='arn:aws:dms:us-east-1:123456789012:rep:myapp-dms-instance',
    MigrationType='full-load-and-cdc',
    TableMappings=json.dumps(table_mappings),
    ReplicationTaskSettings=json.dumps({
        "TargetMetadata": {
            "TargetSchema": "",
            "SupportLobs": True,
            "FullLobMode": False,
            "LobChunkSize": 0,
            "LimitedSizeLobMode": True,
            "LobMaxSize": 32,
            "InlineLobMaxSize": 0,
            "LoadMaxFileSize": 0,
            "ParallelLoadThreads": 0,
            "ParallelLoadBufferSize": 0,
            "BatchApplyEnabled": False,
            "TaskRecoveryTableEnabled": False,
            "ParallelApplyThreads": 0,
            "ParallelApplyBufferSize": 0,
            "ParallelApplyQueuesPerThread": 0
        },
        "FullLoadSettings": {
            "TargetTablePrepMode": "DROP_AND_CREATE",
            "CreatePkAfterFullLoad": False,
            "StopTaskCachedChangesApplied": False,
            "StopTaskCachedChangesNotApplied": False,
            "MaxFullLoadSubTasks": 8,
            "TransactionConsistencyTimeout": 600,
            "CommitRate": 10000
        },
        "Logging": {
            "EnableLogging": True,
            "LogComponents": [
                {
                    "Id": "SOURCE_UNLOAD",
                    "Severity": "LOGGER_SEVERITY_DEFAULT"
                },
                {
                    "Id": "TARGET_LOAD",
                    "Severity": "LOGGER_SEVERITY_DEFAULT"
                }
            ]
        }
    }),
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'Migration'
        }
    ]
)

# Start migration task
response = dms.start_replication_task(
    ReplicationTaskArn='arn:aws:dms:us-east-1:123456789012:task:myapp-migration-task',
    StartReplicationTaskType='start-replication'
)

# Monitor migration progress
def check_migration_status(task_arn):
    response = dms.describe_replication_tasks(
        Filters=[
            {
                'Name': 'replication-task-arn',
                'Values': [task_arn]
            }
        ]
    )
    
    task = response['ReplicationTasks'][0]
    status = task['Status']
    
    if 'ReplicationTaskStats' in task:
        stats = task['ReplicationTaskStats']
        print(f"Status: {status}")
        print(f"Full Load Progress: {stats.get('FullLoadProgressPercent', 0)}%")
        print(f"Tables Loaded: {stats.get('TablesLoaded', 0)}")
        print(f"Tables Loading: {stats.get('TablesLoading', 0)}")
        print(f"Tables Queued: {stats.get('TablesQueued', 0)}")
        print(f"Tables Errored: {stats.get('TablesErrored', 0)}")
    
    return status

# Usage
status = check_migration_status('arn:aws:dms:us-east-1:123456789012:task:myapp-migration-task')
```

### Schema Conversion Tool (SCT)

```python
# AWS SCT automation script
import subprocess
import json

class AWSSchemaConversionTool:
    def __init__(self, sct_path):
        self.sct_path = sct_path
    
    def create_project(self, project_name, source_config, target_config):
        """Create SCT project"""
        project_config = {
            "projectName": project_name,
            "sourceDatabase": source_config,
            "targetDatabase": target_config
        }
        
        with open(f"{project_name}_config.json", 'w') as f:
            json.dump(project_config, f, indent=2)
        
        cmd = [
            self.sct_path,
            "--create-project",
            f"{project_name}_config.json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    
    def convert_schema(self, project_file, output_dir):
        """Convert database schema"""
        cmd = [
            self.sct_path,
            "--project", project_file,
            "--convert-schema",
            "--output-dir", output_dir
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Schema conversion completed successfully")
            print(f"Converted files saved to: {output_dir}")
        else:
            print(f"Schema conversion failed: {result.stderr}")
        
        return result.returncode == 0
    
    def generate_assessment_report(self, project_file, report_path):
        """Generate migration assessment report"""
        cmd = [
            self.sct_path,
            "--project", project_file,
            "--assessment-report",
            "--output", report_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0

# Usage example
sct = AWSSchemaConversionTool("/opt/aws-schema-conversion-tool/bin/aws-sct")

# Source database configuration (Oracle)
source_config = {
    "engine": "oracle",
    "host": "oracle.company.com",
    "port": 1521,
    "database": "ORCL",
    "username": "hr",
    "password": "password",
    "schemas": ["HR", "SALES"]
}

# Target database configuration (PostgreSQL)
target_config = {
    "engine": "postgresql",
    "host": "myapp-postgres.cluster-xyz.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "myapp_production",
    "username": "postgres",
    "password": "MySecurePassword123!"
}

# Create project and convert
sct.create_project("oracle_to_postgres_migration", source_config, target_config)
sct.convert_schema("oracle_to_postgres_migration.sct", "./converted_schema")
sct.generate_assessment_report("oracle_to_postgres_migration.sct", "./assessment_report.html")
```

---

## 🚀 Serverless Databases

### AWS Aurora Serverless

```python
import boto3
import json
from botocore.exceptions import ClientError

# Initialize RDS Data API client
rds_data = boto3.client('rds-data', region_name='us-east-1')

class AuroraServerlessManager:
    def __init__(self, cluster_arn, secret_arn, database_name):
        self.cluster_arn = cluster_arn
        self.secret_arn = secret_arn
        self.database_name = database_name
        self.client = boto3.client('rds-data')
    
    def execute_sql(self, sql, parameters=None):
        """Execute SQL statement using Data API"""
        try:
            kwargs = {
                'resourceArn': self.cluster_arn,
                'secretArn': self.secret_arn,
                'database': self.database_name,
                'sql': sql
            }
            
            if parameters:
                kwargs['parameters'] = parameters
            
            response = self.client.execute_statement(**kwargs)
            return response
            
        except ClientError as e:
            print(f"Error executing SQL: {e}")
            raise
    
    def begin_transaction(self):
        """Begin a transaction"""
        response = self.client.begin_transaction(
            resourceArn=self.cluster_arn,
            secretArn=self.secret_arn,
            database=self.database_name
        )
        return response['transactionId']
    
    def commit_transaction(self, transaction_id):
        """Commit a transaction"""
        response = self.client.commit_transaction(
            resourceArn=self.cluster_arn,
            secretArn=self.secret_arn,
            transactionId=transaction_id
        )
        return response
    
    def rollback_transaction(self, transaction_id):
        """Rollback a transaction"""
        response = self.client.rollback_transaction(
            resourceArn=self.cluster_arn,
            secretArn=self.secret_arn,
            transactionId=transaction_id
        )
        return response
    
    def batch_execute_sql(self, sql, parameter_sets):
        """Execute SQL with multiple parameter sets"""
        response = self.client.batch_execute_statement(
            resourceArn=self.cluster_arn,
            secretArn=self.secret_arn,
            database=self.database_name,
            sql=sql,
            parameterSets=parameter_sets
        )
        return response

# Usage example
aurora_manager = AuroraServerlessManager(
    cluster_arn='arn:aws:rds:us-east-1:123456789012:cluster:myapp-aurora-serverless',
    secret_arn='arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp-aurora-secret',
    database_name='myapp_production'
)

# Create table
create_table_sql = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
"""

aurora_manager.execute_sql(create_table_sql)

# Insert data with parameters
insert_sql = "INSERT INTO users (email, name) VALUES (:email, :name)"
parameters = [
    {'name': 'email', 'value': {'stringValue': 'john@example.com'}},
    {'name': 'name', 'value': {'stringValue': 'John Doe'}}
]

result = aurora_manager.execute_sql(insert_sql, parameters)
print(f"Inserted user with ID: {result['generatedFields'][0]['longValue']}")

# Batch insert
batch_insert_sql = "INSERT INTO users (email, name) VALUES (:email, :name)"
batch_parameters = [
    [
        {'name': 'email', 'value': {'stringValue': 'alice@example.com'}},
        {'name': 'name', 'value': {'stringValue': 'Alice Smith'}}
    ],
    [
        {'name': 'email', 'value': {'stringValue': 'bob@example.com'}},
        {'name': 'name', 'value': {'stringValue': 'Bob Johnson'}}
    ]
]

aurora_manager.batch_execute_sql(batch_insert_sql, batch_parameters)

# Query data
select_sql = "SELECT id, email, name, created_at FROM users WHERE email LIKE :email_pattern"
query_parameters = [
    {'name': 'email_pattern', 'value': {'stringValue': '%@example.com'}}
]

result = aurora_manager.execute_sql(select_sql, query_parameters)

for record in result['records']:
    user_id = record[0]['longValue']
    email = record[1]['stringValue']
    name = record[2]['stringValue']
    created_at = record[3]['stringValue']
    print(f"User {user_id}: {name} ({email}) - Created: {created_at}")

# Transaction example
transaction_id = aurora_manager.begin_transaction()

try:
    # Update user
    update_sql = "UPDATE users SET name = :name WHERE email = :email"
    update_params = [
        {'name': 'name', 'value': {'stringValue': 'John Smith'}},
        {'name': 'email', 'value': {'stringValue': 'john@example.com'}}
    ]
    
    aurora_manager.execute_sql(update_sql, update_params)
    
    # Insert audit log
    audit_sql = "INSERT INTO audit_log (action, table_name, record_id) VALUES (:action, :table_name, :record_id)"
    audit_params = [
        {'name': 'action', 'value': {'stringValue': 'UPDATE'}},
        {'name': 'table_name', 'value': {'stringValue': 'users'}},
        {'name': 'record_id', 'value': {'longValue': 1}}
    ]
    
    aurora_manager.execute_sql(audit_sql, audit_params)
    
    # Commit transaction
    aurora_manager.commit_transaction(transaction_id)
    print("Transaction committed successfully")
    
except Exception as e:
    # Rollback on error
    aurora_manager.rollback_transaction(transaction_id)
    print(f"Transaction rolled back due to error: {e}")
```

### Azure SQL Database Serverless

```sql
-- Creating Azure SQL Database Serverless
az sql db create \
    --resource-group myapp-rg \
    --server myapp-sql-server \
    --name myapp-serverless-db \
    --edition GeneralPurpose \
    --compute-model Serverless \
    --family Gen5 \
    --capacity 1 \
    --auto-pause-delay 60 \
    --min-capacity 0.5

-- Monitor serverless database usage
SELECT 
    start_time,
    end_time,
    avg_cpu_percent,
    avg_data_io_percent,
    avg_log_write_percent,
    max_worker_percent,
    max_session_percent
FROM sys.dm_db_resource_stats
WHERE start_time > DATEADD(hour, -24, GETUTCDATE())
ORDER BY start_time DESC;

-- Check auto-pause status
SELECT 
    database_id,
    name,
    state_desc,
    create_date
FROM sys.databases
WHERE name = 'myapp-serverless-db';
```

---

## 🔐 Security and Compliance

### Encryption at Rest and in Transit

```python
# AWS RDS Encryption
import boto3

rds = boto3.client('rds')

# Create encrypted RDS instance
response = rds.create_db_instance(
    DBInstanceIdentifier='myapp-encrypted-db',
    DBInstanceClass='db.t3.micro',
    Engine='mysql',
    MasterUsername='admin',
    MasterUserPassword='MySecurePassword123!',
    AllocatedStorage=20,
    StorageEncrypted=True,  # Enable encryption at rest
    KmsKeyId='arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012',
    VpcSecurityGroupIds=['sg-12345678'],
    BackupRetentionPeriod=7,
    MultiAZ=True,
    Tags=[
        {
            'Key': 'Environment',
            'Value': 'Production'
        },
        {
            'Key': 'Encryption',
            'Value': 'Enabled'
        }
    ]
)

# SSL/TLS connection configuration
connection_config = {
    'host': 'myapp-encrypted-db.cluster-xyz.us-east-1.rds.amazonaws.com',
    'user': 'admin',
    'password': 'MySecurePassword123!',
    'database': 'myapp_production',
    'ssl_ca': '/path/to/rds-ca-2019-root.pem',
    'ssl_verify_cert': True,
    'ssl_verify_identity': True
}
```

### Identity and Access Management (IAM)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowRDSAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/MyAppDatabaseRole"
      },
      "Action": [
        "rds-db:connect"
      ],
      "Resource": [
        "arn:aws:rds-db:us-east-1:123456789012:dbuser:myapp-mysql-instance/myapp_user"
      ]
    },
    {
      "Sid": "AllowSecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:123456789012:secret:myapp/database/credentials-*"
      ]
    }
  ]
}
```

### Database Activity Monitoring

```python
# AWS RDS Performance Insights
import boto3
from datetime import datetime, timedelta

pi = boto3.client('pi', region_name='us-east-1')

class PerformanceInsightsMonitor:
    def __init__(self, resource_id):
        self.resource_id = resource_id
        self.client = pi
    
    def get_top_sql_statements(self, hours=1):
        """Get top SQL statements by CPU usage"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        response = self.client.get_dimension_key_details(
            ServiceType='RDS',
            Identifier=self.resource_id,
            Group='db.SQL_Innodb.Innodb_rows_read.avg',
            RequestedDimensions=['db.sql.Innodb_rows_read.avg']
        )
        
        return response
    
    def get_resource_metrics(self, metric_queries, hours=1):
        """Get resource metrics"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        response = self.client.get_resource_metrics(
            ServiceType='RDS',
            Identifier=self.resource_id,
            MetricQueries=metric_queries,
            StartTime=start_time,
            EndTime=end_time,
            PeriodInSeconds=300
        )
        
        return response
    
    def analyze_performance(self):
        """Analyze database performance"""
        # Define metric queries
        metric_queries = [
            {
                'Metric': 'db.CPU.Innodb_rows_read.avg',
                'GroupBy': {
                    'Group': 'db.sql_tokenized',
                    'Limit': 10
                }
            },
            {
                'Metric': 'db.IO.Innodb_data_read.avg',
                'GroupBy': {
                    'Group': 'db.sql_tokenized',
                    'Limit': 10
                }
            }
        ]
        
        metrics = self.get_resource_metrics(metric_queries)
        
        print("Performance Analysis Results:")
        for metric_result in metrics['MetricList']:
            print(f"\nMetric: {metric_result['Key']['Metric']}")
            for data_point in metric_result['DataPoints']:
                timestamp = data_point['Timestamp']
                value = data_point['Value']
                print(f"  {timestamp}: {value}")

# Usage
monitor = PerformanceInsightsMonitor('myapp-mysql-instance')
monitor.analyze_performance()
```

---

## 💰 Cost Optimization

### Right-sizing Database Instances

```python
import boto3
from datetime import datetime, timedelta

class DatabaseCostOptimizer:
    def __init__(self):
        self.rds = boto3.client('rds')
        self.cloudwatch = boto3.client('cloudwatch')
        self.pricing = boto3.client('pricing', region_name='us-east-1')
    
    def get_db_instances(self):
        """Get all RDS instances"""
        response = self.rds.describe_db_instances()
        return response['DBInstances']
    
    def get_cpu_utilization(self, instance_id, days=30):
        """Get average CPU utilization"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        response = self.cloudwatch.get_metric_statistics(
            Namespace='AWS/RDS',
            MetricName='CPUUtilization',
            Dimensions=[
                {
                    'Name': 'DBInstanceIdentifier',
                    'Value': instance_id
                }
            ],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,  # 1 hour
            Statistics=['Average']
        )
        
        if response['Datapoints']:
            avg_cpu = sum(dp['Average'] for dp in response['Datapoints']) / len(response['Datapoints'])
            return avg_cpu
        return 0
    
    def get_connection_count(self, instance_id, days=30):
        """Get average connection count"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        response = self.cloudwatch.get_metric_statistics(
            Namespace='AWS/RDS',
            MetricName='DatabaseConnections',
            Dimensions=[
                {
                    'Name': 'DBInstanceIdentifier',
                    'Value': instance_id
                }
            ],
            StartTime=start_time,
            EndTime=end_time,
            Period=3600,
            Statistics=['Average']
        )
        
        if response['Datapoints']:
            avg_connections = sum(dp['Average'] for dp in response['Datapoints']) / len(response['Datapoints'])
            return avg_connections
        return 0
    
    def recommend_instance_size(self, instance):
        """Recommend optimal instance size"""
        instance_id = instance['DBInstanceIdentifier']
        current_class = instance['DBInstanceClass']
        
        avg_cpu = self.get_cpu_utilization(instance_id)
        avg_connections = self.get_connection_count(instance_id)
        
        recommendations = []
        
        # CPU-based recommendations
        if avg_cpu < 20:
            recommendations.append({
                'type': 'downsize',
                'reason': f'Low CPU utilization ({avg_cpu:.1f}%)',
                'suggested_action': 'Consider smaller instance class'
            })
        elif avg_cpu > 80:
            recommendations.append({
                'type': 'upsize',
                'reason': f'High CPU utilization ({avg_cpu:.1f}%)',
                'suggested_action': 'Consider larger instance class'
            })
        
        # Connection-based recommendations
        if avg_connections < 10:
            recommendations.append({
                'type': 'optimize',
                'reason': f'Low connection count ({avg_connections:.1f})',
                'suggested_action': 'Consider connection pooling or smaller instance'
            })
        
        return {
            'instance_id': instance_id,
            'current_class': current_class,
            'avg_cpu': avg_cpu,
            'avg_connections': avg_connections,
            'recommendations': recommendations
        }
    
    def analyze_all_instances(self):
        """Analyze all RDS instances for cost optimization"""
        instances = self.get_db_instances()
        analysis_results = []
        
        for instance in instances:
            if instance['DBInstanceStatus'] == 'available':
                result = self.recommend_instance_size(instance)
                analysis_results.append(result)
        
        return analysis_results
    
    def generate_cost_report(self):
        """Generate cost optimization report"""
        results = self.analyze_all_instances()
        
        print("=== RDS Cost Optimization Report ===")
        print(f"Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total Instances Analyzed: {len(results)}")
        print()
        
        total_recommendations = 0
        
        for result in results:
            print(f"Instance: {result['instance_id']}")
            print(f"  Current Class: {result['current_class']}")
            print(f"  Avg CPU: {result['avg_cpu']:.1f}%")
            print(f"  Avg Connections: {result['avg_connections']:.1f}")
            
            if result['recommendations']:
                print("  Recommendations:")
                for rec in result['recommendations']:
                    print(f"    - {rec['type'].upper()}: {rec['reason']}")
                    print(f"      Action: {rec['suggested_action']}")
                total_recommendations += len(result['recommendations'])
            else:
                print("  No recommendations - instance appears optimally sized")
            print()
        
        print(f"Total Optimization Opportunities: {total_recommendations}")

# Usage
optimizer = DatabaseCostOptimizer()
optimizer.generate_cost_report()
```

### Reserved Instances and Savings Plans

```python
# AWS RDS Reserved Instance management
import boto3
from datetime import datetime, timedelta

class RDSReservedInstanceManager:
    def __init__(self):
        self.rds = boto3.client('rds')
        self.ce = boto3.client('ce')  # Cost Explorer
    
    def get_current_usage(self):
        """Get current RDS usage patterns"""
        instances = self.rds.describe_db_instances()
        
        usage_summary = {}
        
        for instance in instances['DBInstances']:
            if instance['DBInstanceStatus'] == 'available':
                instance_class = instance['DBInstanceClass']
                engine = instance['Engine']
                multi_az = instance['MultiAZ']
                
                key = f"{engine}_{instance_class}_{multi_az}"
                
                if key not in usage_summary:
                    usage_summary[key] = {
                        'engine': engine,
                        'instance_class': instance_class,
                        'multi_az': multi_az,
                        'count': 0,
                        'instances': []
                    }
                
                usage_summary[key]['count'] += 1
                usage_summary[key]['instances'].append(instance['DBInstanceIdentifier'])
        
        return usage_summary
    
    def get_reserved_instances(self):
        """Get current reserved instances"""
        response = self.rds.describe_reserved_db_instances()
        return response['ReservedDBInstances']
    
    def get_available_offerings(self, engine, instance_class):
        """Get available reserved instance offerings"""
        response = self.rds.describe_reserved_db_instances_offerings(
            DBInstanceClass=instance_class,
            ProductDescription=engine,
            MultiAZ=True
        )
        return response['ReservedDBInstancesOfferings']
    
    def calculate_savings(self, usage_summary):
        """Calculate potential savings with reserved instances"""
        savings_analysis = []
        
        for usage_key, usage_data in usage_summary.items():
            if usage_data['count'] > 0:
                offerings = self.get_available_offerings(
                    usage_data['engine'],
                    usage_data['instance_class']
                )
                
                for offering in offerings:
                    if offering['Duration'] == 31536000:  # 1 year
                        upfront_cost = offering.get('FixedPrice', 0)
                        hourly_cost = offering.get('UsagePrice', 0)
                        
                        # Calculate annual costs
                        annual_reserved_cost = upfront_cost + (hourly_cost * 8760)  # 8760 hours/year
                        annual_on_demand_cost = self.get_on_demand_cost(
                            usage_data['engine'],
                            usage_data['instance_class']
                        ) * 8760
                        
                        annual_savings = (annual_on_demand_cost - annual_reserved_cost) * usage_data['count']
                        savings_percentage = (annual_savings / (annual_on_demand_cost * usage_data['count'])) * 100
                        
                        savings_analysis.append({
                            'usage_key': usage_key,
                            'engine': usage_data['engine'],
                            'instance_class': usage_data['instance_class'],
                            'instance_count': usage_data['count'],
                            'offering_id': offering['ReservedDBInstancesOfferingId'],
                            'duration': offering['Duration'],
                            'payment_option': offering['PaymentOption'],
                            'upfront_cost': upfront_cost,
                            'hourly_cost': hourly_cost,
                            'annual_savings': annual_savings,
                            'savings_percentage': savings_percentage
                        })
        
        return sorted(savings_analysis, key=lambda x: x['annual_savings'], reverse=True)
    
    def get_on_demand_cost(self, engine, instance_class):
        """Get on-demand hourly cost (simplified - would need pricing API)"""
        # This is a simplified example - in practice, you'd use the AWS Pricing API
        pricing_map = {
            'mysql': {
                'db.t3.micro': 0.017,
                'db.t3.small': 0.034,
                'db.t3.medium': 0.068,
                'db.r5.large': 0.24,
                'db.r5.xlarge': 0.48
            },
            'postgres': {
                'db.t3.micro': 0.018,
                'db.t3.small': 0.036,
                'db.t3.medium': 0.072,
                'db.r5.large': 0.252,
                'db.r5.xlarge': 0.504
            }
        }
        
        return pricing_map.get(engine, {}).get(instance_class, 0)
    
    def purchase_reserved_instance(self, offering_id, instance_count):
        """Purchase reserved instance"""
        try:
            response = self.rds.purchase_reserved_db_instances_offering(
                ReservedDBInstancesOfferingId=offering_id,
                DBInstanceCount=instance_count,
                Tags=[
                    {
                        'Key': 'PurchaseDate',
                        'Value': datetime.now().strftime('%Y-%m-%d')
                    },
                    {
                        'Key': 'Environment',
                        'Value': 'Production'
                    }
                ]
            )
            return response
        except Exception as e:
            print(f"Error purchasing reserved instance: {e}")
            return None
    
    def generate_ri_recommendation_report(self):
        """Generate reserved instance recommendation report"""
        usage_summary = self.get_current_usage()
        current_ris = self.get_reserved_instances()
        savings_analysis = self.calculate_savings(usage_summary)
        
        print("=== RDS Reserved Instance Recommendation Report ===")
        print(f"Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        print("Current Usage Summary:")
        for usage_key, usage_data in usage_summary.items():
            print(f"  {usage_data['engine']} {usage_data['instance_class']} (Multi-AZ: {usage_data['multi_az']}): {usage_data['count']} instances")
        print()
        
        print("Current Reserved Instances:")
        if current_ris:
            for ri in current_ris:
                print(f"  {ri['ProductDescription']} {ri['DBInstanceClass']}: {ri['DBInstanceCount']} instances")
                print(f"    State: {ri['State']}, Remaining: {ri['Duration']} seconds")
        else:
            print("  No reserved instances found")
        print()
        
        print("Savings Opportunities:")
        total_potential_savings = 0
        
        for analysis in savings_analysis[:5]:  # Top 5 opportunities
            print(f"  {analysis['engine']} {analysis['instance_class']}:")
            print(f"    Instance Count: {analysis['instance_count']}")
            print(f"    Payment Option: {analysis['payment_option']}")
            print(f"    Annual Savings: ${analysis['annual_savings']:,.2f} ({analysis['savings_percentage']:.1f}%)")
            print(f"    Upfront Cost: ${analysis['upfront_cost']:,.2f}")
            print(f"    Hourly Cost: ${analysis['hourly_cost']:.4f}")
            print()
            
            total_potential_savings += analysis['annual_savings']
        
        print(f"Total Potential Annual Savings: ${total_potential_savings:,.2f}")

# Usage
ri_manager = RDSReservedInstanceManager()
ri_manager.generate_ri_recommendation_report()
```

---

## 🎯 Next Steps

Congratulations! You've completed Chapter 22 on Cloud Databases & Database as a Service (DBaaS). You should now understand:

✅ Cloud database concepts and service models (IaaS, PaaS, SaaS, DBaaS)
✅ Major cloud providers (AWS, Azure, GCP) and their database offerings
✅ Database migration strategies and tools (DMS, SCT)
✅ Serverless database concepts and implementation
✅ Cloud database security and compliance
✅ Cost optimization strategies and reserved instances
✅ Multi-cloud and hybrid database architectures
✅ Monitoring and performance optimization in the cloud

**Continue to:** [Chapter 23: Database DevOps & CI/CD](23-database-devops-cicd.md)

**Practice Projects:**
1. Migrate an on-premises database to the cloud
2. Implement a serverless application with Aurora Serverless
3. Set up multi-region database replication
4. Create a cost optimization dashboard for cloud databases
5. Implement database monitoring and alerting

**Additional Resources:**
- AWS Database Migration Service documentation
- Azure Database Migration Guide
- Google Cloud Database Migration documentation
- Cloud database security best practices
- Serverless database design patterns