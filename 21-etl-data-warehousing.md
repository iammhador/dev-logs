# Chapter 21: ETL & Data Warehousing

## 📚 What You'll Learn

ETL (Extract, Transform, Load) and data warehousing are fundamental for business intelligence and analytics. This chapter covers data extraction from multiple sources, transformation processes, loading strategies, dimensional modeling, and building robust data pipelines for both MySQL and PostgreSQL environments.

---

## 🎯 Learning Objectives

- **ETL Fundamentals**: Understand Extract, Transform, Load processes
- **Data Extraction**: Pull data from various sources (databases, APIs, files)
- **Data Transformation**: Clean, validate, and transform data
- **Data Loading**: Efficiently load data into warehouses
- **Dimensional Modeling**: Design star and snowflake schemas
- **Data Pipelines**: Build automated, scalable data workflows
- **Performance Optimization**: Optimize ETL processes for large datasets

---

## 📖 Concept Explanation

### What is ETL?

**ETL** is a data integration process that:
- **Extract**: Retrieves data from source systems
- **Transform**: Cleans, validates, and converts data
- **Load**: Inserts processed data into target systems

### What is Data Warehousing?

**Data Warehousing** involves:
- Centralized repository for integrated data
- Optimized for analytical queries (OLAP)
- Historical data storage
- Support for business intelligence tools

### ETL vs ELT

| Aspect | ETL | ELT |
|--------|-----|-----|
| **Processing** | Transform before loading | Transform after loading |
| **Performance** | Slower for large datasets | Faster initial loading |
| **Flexibility** | Less flexible | More flexible |
| **Storage** | Requires staging area | Uses target system storage |
| **Best For** | Traditional warehouses | Cloud/modern platforms |

---

## 🔧 Data Extraction

### Database Extraction

#### MySQL Source Extraction

```python
import mysql.connector
import pandas as pd
from datetime import datetime, timedelta
import logging

class MySQLExtractor:
    def __init__(self, config):
        self.config = config
        self.connection = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            logging.info("Connected to MySQL source")
        except Exception as e:
            logging.error(f"Failed to connect to MySQL: {e}")
            raise
    
    def extract_incremental(self, table, timestamp_column, last_extracted):
        """Extract data incrementally based on timestamp"""
        query = f"""
            SELECT * FROM {table}
            WHERE {timestamp_column} > %s
            ORDER BY {timestamp_column}
        """
        
        try:
            df = pd.read_sql(query, self.connection, params=[last_extracted])
            logging.info(f"Extracted {len(df)} rows from {table}")
            return df
        except Exception as e:
            logging.error(f"Failed to extract from {table}: {e}")
            raise
    
    def extract_full(self, table, batch_size=10000):
        """Extract full table in batches"""
        offset = 0
        all_data = []
        
        while True:
            query = f"""
                SELECT * FROM {table}
                LIMIT {batch_size} OFFSET {offset}
            """
            
            batch_df = pd.read_sql(query, self.connection)
            
            if batch_df.empty:
                break
                
            all_data.append(batch_df)
            offset += batch_size
            logging.info(f"Extracted batch {offset//batch_size}, {len(batch_df)} rows")
        
        if all_data:
            return pd.concat(all_data, ignore_index=True)
        return pd.DataFrame()
    
    def extract_with_joins(self, query):
        """Extract data using complex queries with joins"""
        try:
            df = pd.read_sql(query, self.connection)
            logging.info(f"Extracted {len(df)} rows from custom query")
            return df
        except Exception as e:
            logging.error(f"Failed to execute custom query: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logging.info("MySQL connection closed")

# Usage
mysql_config = {
    'host': 'localhost',
    'user': 'etl_user',
    'password': 'password',
    'database': 'ecommerce'
}

extractor = MySQLExtractor(mysql_config)
extractor.connect()

# Extract incremental data
last_run = datetime.now() - timedelta(days=1)
orders_df = extractor.extract_incremental('orders', 'created_at', last_run)

# Extract with complex query
customer_analytics_query = """
    SELECT 
        u.id as user_id,
        u.username,
        u.email,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.created_at >= %s
    GROUP BY u.id, u.username, u.email
"""

customer_df = extractor.extract_with_joins(customer_analytics_query)
extractor.close()
```

#### PostgreSQL Source Extraction

```python
import psycopg2
import pandas as pd
from sqlalchemy import create_engine

class PostgreSQLExtractor:
    def __init__(self, config):
        self.config = config
        self.engine = None
        
    def connect(self):
        """Create SQLAlchemy engine"""
        connection_string = f"postgresql://{self.config['user']}:{self.config['password']}@{self.config['host']}:{self.config['port']}/{self.config['database']}"
        self.engine = create_engine(connection_string)
        logging.info("Connected to PostgreSQL source")
    
    def extract_with_cursor(self, query, chunk_size=10000):
        """Extract large datasets using server-side cursor"""
        connection = self.engine.raw_connection()
        cursor = connection.cursor('server_side_cursor')
        
        try:
            cursor.execute(query)
            
            while True:
                rows = cursor.fetchmany(chunk_size)
                if not rows:
                    break
                    
                # Convert to DataFrame
                columns = [desc[0] for desc in cursor.description]
                chunk_df = pd.DataFrame(rows, columns=columns)
                
                yield chunk_df
                
        finally:
            cursor.close()
            connection.close()
    
    def extract_partitioned_table(self, table_name, partition_column, start_date, end_date):
        """Extract from partitioned table with date range"""
        query = f"""
            SELECT * FROM {table_name}
            WHERE {partition_column} BETWEEN %s AND %s
            ORDER BY {partition_column}
        """
        
        return pd.read_sql(query, self.engine, params=[start_date, end_date])
    
    def extract_json_data(self, table, json_column, json_path):
        """Extract and flatten JSON data"""
        query = f"""
            SELECT 
                id,
                {json_column}->>'$.{json_path}' as extracted_value,
                {json_column}
            FROM {table}
            WHERE {json_column} IS NOT NULL
        """
        
        return pd.read_sql(query, self.engine)

# Usage
postgres_config = {
    'host': 'localhost',
    'port': 5432,
    'user': 'etl_user',
    'password': 'password',
    'database': 'analytics'
}

pg_extractor = PostgreSQLExtractor(postgres_config)
pg_extractor.connect()

# Extract large dataset in chunks
for chunk in pg_extractor.extract_with_cursor("SELECT * FROM large_table"):
    # Process each chunk
    print(f"Processing chunk with {len(chunk)} rows")
```

### API Data Extraction

```python
import requests
import json
import time
from typing import List, Dict

class APIExtractor:
    def __init__(self, base_url, api_key=None, rate_limit=100):
        self.base_url = base_url
        self.api_key = api_key
        self.rate_limit = rate_limit
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
    
    def extract_paginated(self, endpoint, params=None, page_size=100):
        """Extract data from paginated API"""
        all_data = []
        page = 1
        
        while True:
            request_params = params.copy() if params else {}
            request_params.update({
                'page': page,
                'per_page': page_size
            })
            
            response = self._make_request(endpoint, request_params)
            
            if not response or 'data' not in response:
                break
                
            data = response['data']
            if not data:
                break
                
            all_data.extend(data)
            page += 1
            
            # Rate limiting
            time.sleep(1 / self.rate_limit)
            
            logging.info(f"Extracted page {page-1}, total records: {len(all_data)}")
        
        return all_data
    
    def extract_with_cursor(self, endpoint, params=None):
        """Extract data using cursor-based pagination"""
        all_data = []
        cursor = None
        
        while True:
            request_params = params.copy() if params else {}
            if cursor:
                request_params['cursor'] = cursor
                
            response = self._make_request(endpoint, request_params)
            
            if not response or 'data' not in response:
                break
                
            data = response['data']
            if not data:
                break
                
            all_data.extend(data)
            cursor = response.get('next_cursor')
            
            if not cursor:
                break
                
            time.sleep(1 / self.rate_limit)
        
        return all_data
    
    def _make_request(self, endpoint, params=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logging.error(f"API request failed: {e}")
            return None

# Usage
api_extractor = APIExtractor('https://api.example.com/v1', api_key='your_api_key')

# Extract customer data
customers = api_extractor.extract_paginated('customers', {'status': 'active'})
customer_df = pd.DataFrame(customers)

# Extract orders with cursor pagination
orders = api_extractor.extract_with_cursor('orders', {'date_from': '2024-01-01'})
orders_df = pd.DataFrame(orders)
```

### File Data Extraction

```python
import pandas as pd
import json
import xml.etree.ElementTree as ET
from pathlib import Path

class FileExtractor:
    def __init__(self, base_path):
        self.base_path = Path(base_path)
    
    def extract_csv(self, filename, **kwargs):
        """Extract data from CSV files"""
        file_path = self.base_path / filename
        
        try:
            df = pd.read_csv(file_path, **kwargs)
            logging.info(f"Extracted {len(df)} rows from {filename}")
            return df
        except Exception as e:
            logging.error(f"Failed to read CSV {filename}: {e}")
            raise
    
    def extract_excel(self, filename, sheet_name=None):
        """Extract data from Excel files"""
        file_path = self.base_path / filename
        
        try:
            if sheet_name:
                df = pd.read_excel(file_path, sheet_name=sheet_name)
            else:
                # Read all sheets
                excel_file = pd.ExcelFile(file_path)
                dfs = {}
                for sheet in excel_file.sheet_names:
                    dfs[sheet] = pd.read_excel(file_path, sheet_name=sheet)
                return dfs
            
            logging.info(f"Extracted {len(df)} rows from {filename}")
            return df
        except Exception as e:
            logging.error(f"Failed to read Excel {filename}: {e}")
            raise
    
    def extract_json(self, filename):
        """Extract data from JSON files"""
        file_path = self.base_path / filename
        
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            # Convert to DataFrame if it's a list of objects
            if isinstance(data, list):
                df = pd.DataFrame(data)
                logging.info(f"Extracted {len(df)} rows from {filename}")
                return df
            else:
                return data
        except Exception as e:
            logging.error(f"Failed to read JSON {filename}: {e}")
            raise
    
    def extract_xml(self, filename, record_path):
        """Extract data from XML files"""
        file_path = self.base_path / filename
        
        try:
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            records = []
            for record in root.findall(record_path):
                record_data = {}
                for child in record:
                    record_data[child.tag] = child.text
                records.append(record_data)
            
            df = pd.DataFrame(records)
            logging.info(f"Extracted {len(df)} rows from {filename}")
            return df
        except Exception as e:
            logging.error(f"Failed to read XML {filename}: {e}")
            raise
    
    def extract_multiple_files(self, pattern, extract_func):
        """Extract data from multiple files matching pattern"""
        files = list(self.base_path.glob(pattern))
        all_data = []
        
        for file_path in files:
            try:
                df = extract_func(file_path.name)
                df['source_file'] = file_path.name
                all_data.append(df)
            except Exception as e:
                logging.error(f"Failed to process {file_path}: {e}")
                continue
        
        if all_data:
            combined_df = pd.concat(all_data, ignore_index=True)
            logging.info(f"Combined {len(files)} files, total {len(combined_df)} rows")
            return combined_df
        
        return pd.DataFrame()

# Usage
file_extractor = FileExtractor('/data/sources')

# Extract from single files
sales_df = file_extractor.extract_csv('sales_2024.csv')
products_df = file_extractor.extract_excel('products.xlsx', sheet_name='Products')
config_data = file_extractor.extract_json('config.json')

# Extract from multiple CSV files
all_sales = file_extractor.extract_multiple_files('sales_*.csv', file_extractor.extract_csv)
```

---

## 🔄 Data Transformation

### Data Cleaning and Validation

```python
import pandas as pd
import numpy as np
from datetime import datetime
import re

class DataTransformer:
    def __init__(self):
        self.transformation_log = []
    
    def clean_text_data(self, df, text_columns):
        """Clean and standardize text data"""
        df_clean = df.copy()
        
        for col in text_columns:
            if col in df_clean.columns:
                # Remove extra whitespace
                df_clean[col] = df_clean[col].astype(str).str.strip()
                
                # Standardize case
                df_clean[col] = df_clean[col].str.title()
                
                # Remove special characters (keep alphanumeric and spaces)
                df_clean[col] = df_clean[col].str.replace(r'[^\w\s]', '', regex=True)
                
                # Replace multiple spaces with single space
                df_clean[col] = df_clean[col].str.replace(r'\s+', ' ', regex=True)
        
        self._log_transformation(f"Cleaned text columns: {text_columns}")
        return df_clean
    
    def validate_email(self, df, email_column):
        """Validate and clean email addresses"""
        df_clean = df.copy()
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        # Mark invalid emails
        df_clean['email_valid'] = df_clean[email_column].str.match(email_pattern, na=False)
        
        # Clean valid emails
        df_clean[email_column] = df_clean[email_column].str.lower().str.strip()
        
        invalid_count = (~df_clean['email_valid']).sum()
        self._log_transformation(f"Email validation: {invalid_count} invalid emails found")
        
        return df_clean
    
    def standardize_phone_numbers(self, df, phone_column):
        """Standardize phone number format"""
        df_clean = df.copy()
        
        def clean_phone(phone):
            if pd.isna(phone):
                return None
            
            # Remove all non-digit characters
            digits = re.sub(r'\D', '', str(phone))
            
            # Handle different formats
            if len(digits) == 10:
                return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
            elif len(digits) == 11 and digits[0] == '1':
                return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
            else:
                return digits  # Return as-is if format is unclear
        
        df_clean[f"{phone_column}_standardized"] = df_clean[phone_column].apply(clean_phone)
        
        self._log_transformation(f"Standardized phone numbers in {phone_column}")
        return df_clean
    
    def handle_missing_values(self, df, strategies):
        """Handle missing values with different strategies"""
        df_clean = df.copy()
        
        for column, strategy in strategies.items():
            if column not in df_clean.columns:
                continue
                
            missing_count = df_clean[column].isna().sum()
            
            if strategy == 'drop':
                df_clean = df_clean.dropna(subset=[column])
            elif strategy == 'mean':
                df_clean[column].fillna(df_clean[column].mean(), inplace=True)
            elif strategy == 'median':
                df_clean[column].fillna(df_clean[column].median(), inplace=True)
            elif strategy == 'mode':
                mode_value = df_clean[column].mode().iloc[0] if not df_clean[column].mode().empty else 'Unknown'
                df_clean[column].fillna(mode_value, inplace=True)
            elif isinstance(strategy, (str, int, float)):
                df_clean[column].fillna(strategy, inplace=True)
            
            self._log_transformation(f"Handled {missing_count} missing values in {column} using {strategy}")
        
        return df_clean
    
    def detect_outliers(self, df, numeric_columns, method='iqr'):
        """Detect outliers in numeric data"""
        outliers_info = {}
        
        for col in numeric_columns:
            if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
                continue
                
            if method == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
                
            elif method == 'zscore':
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                outliers = df[z_scores > 3]
            
            outliers_info[col] = {
                'count': len(outliers),
                'percentage': len(outliers) / len(df) * 100,
                'outlier_indices': outliers.index.tolist()
            }
        
        return outliers_info
    
    def create_derived_columns(self, df, derivations):
        """Create derived columns based on existing data"""
        df_enhanced = df.copy()
        
        for new_col, formula in derivations.items():
            try:
                if callable(formula):
                    df_enhanced[new_col] = formula(df_enhanced)
                else:
                    df_enhanced[new_col] = eval(formula, {'df': df_enhanced, 'pd': pd, 'np': np})
                
                self._log_transformation(f"Created derived column: {new_col}")
            except Exception as e:
                logging.error(f"Failed to create derived column {new_col}: {e}")
        
        return df_enhanced
    
    def _log_transformation(self, message):
        """Log transformation steps"""
        timestamp = datetime.now().isoformat()
        self.transformation_log.append(f"{timestamp}: {message}")
        logging.info(message)

# Usage
transformer = DataTransformer()

# Clean customer data
customers_clean = transformer.clean_text_data(
    customers_df, 
    ['first_name', 'last_name', 'company']
)

# Validate emails
customers_clean = transformer.validate_email(customers_clean, 'email')

# Standardize phone numbers
customers_clean = transformer.standardize_phone_numbers(customers_clean, 'phone')

# Handle missing values
missing_strategies = {
    'age': 'median',
    'income': 'mean',
    'city': 'Unknown',
    'country': 'US'
}
customers_clean = transformer.handle_missing_values(customers_clean, missing_strategies)

# Create derived columns
derivations = {
    'full_name': lambda df: df['first_name'] + ' ' + df['last_name'],
    'age_group': lambda df: pd.cut(df['age'], bins=[0, 25, 35, 50, 65, 100], labels=['18-25', '26-35', '36-50', '51-65', '65+']),
    'customer_lifetime_days': lambda df: (pd.Timestamp.now() - pd.to_datetime(df['created_at'])).dt.days
}
customers_enhanced = transformer.create_derived_columns(customers_clean, derivations)

# Check transformation log
for log_entry in transformer.transformation_log:
    print(log_entry)
```

### Data Type Conversions and Formatting

```python
class DataTypeConverter:
    def __init__(self):
        pass
    
    def convert_data_types(self, df, type_mapping):
        """Convert data types based on mapping"""
        df_converted = df.copy()
        
        for column, target_type in type_mapping.items():
            if column not in df_converted.columns:
                continue
                
            try:
                if target_type == 'datetime':
                    df_converted[column] = pd.to_datetime(df_converted[column])
                elif target_type == 'category':
                    df_converted[column] = df_converted[column].astype('category')
                elif target_type == 'numeric':
                    df_converted[column] = pd.to_numeric(df_converted[column], errors='coerce')
                else:
                    df_converted[column] = df_converted[column].astype(target_type)
                
                logging.info(f"Converted {column} to {target_type}")
            except Exception as e:
                logging.error(f"Failed to convert {column} to {target_type}: {e}")
        
        return df_converted
    
    def normalize_currency(self, df, currency_columns, target_currency='USD'):
        """Normalize currency values"""
        # Exchange rates (in real implementation, fetch from API)
        exchange_rates = {
            'EUR': 1.1,
            'GBP': 1.25,
            'JPY': 0.0067,
            'CAD': 0.74
        }
        
        df_normalized = df.copy()
        
        for col in currency_columns:
            if col not in df_normalized.columns:
                continue
                
            # Assume currency is in a separate column or can be detected
            currency_col = f"{col}_currency"
            
            if currency_col in df_normalized.columns:
                for currency, rate in exchange_rates.items():
                    mask = df_normalized[currency_col] == currency
                    df_normalized.loc[mask, col] = df_normalized.loc[mask, col] * rate
                
                df_normalized[currency_col] = target_currency
            
            logging.info(f"Normalized currency for {col} to {target_currency}")
        
        return df_normalized
    
    def standardize_dates(self, df, date_columns, target_format='%Y-%m-%d'):
        """Standardize date formats"""
        df_standardized = df.copy()
        
        for col in date_columns:
            if col not in df_standardized.columns:
                continue
                
            # Convert to datetime first
            df_standardized[col] = pd.to_datetime(df_standardized[col], errors='coerce')
            
            # Format as string if needed
            if target_format:
                df_standardized[f"{col}_formatted"] = df_standardized[col].dt.strftime(target_format)
            
            logging.info(f"Standardized date format for {col}")
        
        return df_standardized

# Usage
converter = DataTypeConverter()

# Convert data types
type_mapping = {
    'user_id': 'int64',
    'created_at': 'datetime',
    'status': 'category',
    'amount': 'numeric'
}
orders_converted = converter.convert_data_types(orders_df, type_mapping)

# Normalize currencies
orders_normalized = converter.normalize_currency(orders_converted, ['amount', 'tax'])

# Standardize dates
orders_final = converter.standardize_dates(orders_normalized, ['created_at', 'updated_at'])
```

---

## 📥 Data Loading

### Bulk Loading Strategies

#### MySQL Bulk Loading

```python
import mysql.connector
from mysql.connector import Error
import pandas as pd
import csv
import tempfile

class MySQLLoader:
    def __init__(self, config):
        self.config = config
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            self.connection.autocommit = False
            logging.info("Connected to MySQL target")
        except Error as e:
            logging.error(f"Failed to connect to MySQL: {e}")
            raise
    
    def bulk_insert_csv(self, df, table_name, batch_size=10000):
        """Bulk insert using LOAD DATA INFILE"""
        cursor = self.connection.cursor()
        
        try:
            # Create temporary CSV file
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv') as temp_file:
                df.to_csv(temp_file.name, index=False, header=False)
                temp_file_path = temp_file.name
            
            # Use LOAD DATA INFILE for fast bulk insert
            load_query = f"""
                LOAD DATA INFILE '{temp_file_path}'
                INTO TABLE {table_name}
                FIELDS TERMINATED BY ','
                LINES TERMINATED BY '\n'
                IGNORE 1 LINES
            """
            
            cursor.execute(load_query)
            self.connection.commit()
            
            logging.info(f"Bulk inserted {len(df)} rows into {table_name}")
            
        except Error as e:
            self.connection.rollback()
            logging.error(f"Bulk insert failed: {e}")
            raise
        finally:
            cursor.close()
            # Clean up temp file
            import os
            if 'temp_file_path' in locals():
                os.unlink(temp_file_path)
    
    def batch_insert(self, df, table_name, batch_size=1000, on_duplicate='IGNORE'):
        """Insert data in batches with duplicate handling"""
        cursor = self.connection.cursor()
        
        try:
            columns = ', '.join(df.columns)
            placeholders = ', '.join(['%s'] * len(df.columns))
            
            if on_duplicate == 'UPDATE':
                update_clause = ', '.join([f"{col} = VALUES({col})" for col in df.columns])
                query = f"""
                    INSERT INTO {table_name} ({columns})
                    VALUES ({placeholders})
                    ON DUPLICATE KEY UPDATE {update_clause}
                """
            else:
                query = f"""
                    INSERT {on_duplicate} INTO {table_name} ({columns})
                    VALUES ({placeholders})
                """
            
            total_rows = len(df)
            inserted_rows = 0
            
            for start_idx in range(0, total_rows, batch_size):
                end_idx = min(start_idx + batch_size, total_rows)
                batch_data = df.iloc[start_idx:end_idx].values.tolist()
                
                cursor.executemany(query, batch_data)
                inserted_rows += len(batch_data)
                
                logging.info(f"Inserted batch {start_idx//batch_size + 1}, {inserted_rows}/{total_rows} rows")
            
            self.connection.commit()
            logging.info(f"Successfully inserted {inserted_rows} rows into {table_name}")
            
        except Error as e:
            self.connection.rollback()
            logging.error(f"Batch insert failed: {e}")
            raise
        finally:
            cursor.close()
    
    def upsert_data(self, df, table_name, key_columns):
        """Upsert data (insert or update based on key columns)"""
        cursor = self.connection.cursor()
        
        try:
            columns = ', '.join(df.columns)
            placeholders = ', '.join(['%s'] * len(df.columns))
            
            # Create update clause for non-key columns
            non_key_columns = [col for col in df.columns if col not in key_columns]
            update_clause = ', '.join([f"{col} = VALUES({col})" for col in non_key_columns])
            
            query = f"""
                INSERT INTO {table_name} ({columns})
                VALUES ({placeholders})
                ON DUPLICATE KEY UPDATE {update_clause}
            """
            
            data = df.values.tolist()
            cursor.executemany(query, data)
            
            self.connection.commit()
            logging.info(f"Upserted {len(df)} rows into {table_name}")
            
        except Error as e:
            self.connection.rollback()
            logging.error(f"Upsert failed: {e}")
            raise
        finally:
            cursor.close()
    
    def create_staging_table(self, table_name, df):
        """Create staging table with same structure as DataFrame"""
        cursor = self.connection.cursor()
        
        try:
            # Drop staging table if exists
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}_staging")
            
            # Create staging table structure
            column_definitions = []
            for col in df.columns:
                dtype = df[col].dtype
                
                if pd.api.types.is_integer_dtype(dtype):
                    sql_type = "BIGINT"
                elif pd.api.types.is_float_dtype(dtype):
                    sql_type = "DECIMAL(15,2)"
                elif pd.api.types.is_datetime64_any_dtype(dtype):
                    sql_type = "DATETIME"
                else:
                    sql_type = "TEXT"
                
                column_definitions.append(f"`{col}` {sql_type}")
            
            create_query = f"""
                CREATE TABLE {table_name}_staging (
                    {', '.join(column_definitions)}
                )
            """
            
            cursor.execute(create_query)
            self.connection.commit()
            
            logging.info(f"Created staging table {table_name}_staging")
            
        except Error as e:
            self.connection.rollback()
            logging.error(f"Failed to create staging table: {e}")
            raise
        finally:
            cursor.close()
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logging.info("MySQL connection closed")

# Usage
mysql_loader = MySQLLoader(mysql_config)
mysql_loader.connect()

# Create staging table
mysql_loader.create_staging_table('customers', customers_enhanced)

# Bulk insert into staging
mysql_loader.bulk_insert_csv(customers_enhanced, 'customers_staging')

# Upsert from staging to main table
mysql_loader.upsert_data(customers_enhanced, 'customers', ['id'])

mysql_loader.close()
```

#### PostgreSQL Bulk Loading

```python
import psycopg2
from psycopg2.extras import execute_values
import pandas as pd
from io import StringIO

class PostgreSQLLoader:
    def __init__(self, config):
        self.config = config
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(**self.config)
            self.connection.autocommit = False
            logging.info("Connected to PostgreSQL target")
        except Exception as e:
            logging.error(f"Failed to connect to PostgreSQL: {e}")
            raise
    
    def bulk_copy(self, df, table_name):
        """Bulk insert using COPY command"""
        cursor = self.connection.cursor()
        
        try:
            # Create CSV string buffer
            output = StringIO()
            df.to_csv(output, sep='\t', header=False, index=False, na_rep='\\N')
            output.seek(0)
            
            # Use COPY command for fast bulk insert
            cursor.copy_from(
                output, 
                table_name, 
                columns=df.columns.tolist(),
                sep='\t',
                null='\\N'
            )
            
            self.connection.commit()
            logging.info(f"Bulk copied {len(df)} rows into {table_name}")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"Bulk copy failed: {e}")
            raise
        finally:
            cursor.close()
    
    def batch_upsert(self, df, table_name, key_columns, batch_size=1000):
        """Batch upsert using ON CONFLICT"""
        cursor = self.connection.cursor()
        
        try:
            columns = df.columns.tolist()
            placeholders = ', '.join(['%s'] * len(columns))
            
            # Create conflict resolution clause
            non_key_columns = [col for col in columns if col not in key_columns]
            update_clause = ', '.join([f"{col} = EXCLUDED.{col}" for col in non_key_columns])
            conflict_columns = ', '.join(key_columns)
            
            query = f"""
                INSERT INTO {table_name} ({', '.join(columns)})
                VALUES %s
                ON CONFLICT ({conflict_columns})
                DO UPDATE SET {update_clause}
            """
            
            total_rows = len(df)
            processed_rows = 0
            
            for start_idx in range(0, total_rows, batch_size):
                end_idx = min(start_idx + batch_size, total_rows)
                batch_data = df.iloc[start_idx:end_idx].values.tolist()
                
                execute_values(
                    cursor,
                    query,
                    batch_data,
                    template=None,
                    page_size=batch_size
                )
                
                processed_rows += len(batch_data)
                logging.info(f"Upserted batch {start_idx//batch_size + 1}, {processed_rows}/{total_rows} rows")
            
            self.connection.commit()
            logging.info(f"Successfully upserted {processed_rows} rows into {table_name}")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"Batch upsert failed: {e}")
            raise
        finally:
            cursor.close()
    
    def create_temp_table(self, table_name, df):
        """Create temporary table for staging"""
        cursor = self.connection.cursor()
        
        try:
            # Drop temp table if exists
            cursor.execute(f"DROP TABLE IF EXISTS temp_{table_name}")
            
            # Get column definitions from main table
            cursor.execute(f"""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = '{table_name}'
                ORDER BY ordinal_position
            """)
            
            columns_info = cursor.fetchall()
            
            if columns_info:
                # Use existing table structure
                cursor.execute(f"CREATE TEMP TABLE temp_{table_name} (LIKE {table_name})")
            else:
                # Create based on DataFrame structure
                column_definitions = []
                for col in df.columns:
                    dtype = df[col].dtype
                    
                    if pd.api.types.is_integer_dtype(dtype):
                        sql_type = "BIGINT"
                    elif pd.api.types.is_float_dtype(dtype):
                        sql_type = "DECIMAL"
                    elif pd.api.types.is_datetime64_any_dtype(dtype):
                        sql_type = "TIMESTAMP"
                    else:
                        sql_type = "TEXT"
                    
                    column_definitions.append(f"{col} {sql_type}")
                
                create_query = f"""
                    CREATE TEMP TABLE temp_{table_name} (
                        {', '.join(column_definitions)}
                    )
                """
                
                cursor.execute(create_query)
            
            self.connection.commit()
            logging.info(f"Created temporary table temp_{table_name}")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"Failed to create temp table: {e}")
            raise
        finally:
            cursor.close()
    
    def merge_from_temp(self, table_name, key_columns):
        """Merge data from temp table to main table"""
        cursor = self.connection.cursor()
        
        try:
            # Get all columns from temp table
            cursor.execute(f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'temp_{table_name}'
                ORDER BY ordinal_position
            """)
            
            columns = [row[0] for row in cursor.fetchall()]
            non_key_columns = [col for col in columns if col not in key_columns]
            
            # Create merge query
            merge_query = f"""
                INSERT INTO {table_name} ({', '.join(columns)})
                SELECT {', '.join(columns)}
                FROM temp_{table_name}
                ON CONFLICT ({', '.join(key_columns)})
                DO UPDATE SET
                {', '.join([f"{col} = EXCLUDED.{col}" for col in non_key_columns])}
            """
            
            cursor.execute(merge_query)
            rows_affected = cursor.rowcount
            
            self.connection.commit()
            logging.info(f"Merged {rows_affected} rows from temp table to {table_name}")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"Merge from temp table failed: {e}")
            raise
        finally:
            cursor.close()
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logging.info("PostgreSQL connection closed")

# Usage
postgres_loader = PostgreSQLLoader(postgres_config)
postgres_loader.connect()

# Create temp table and bulk load
postgres_loader.create_temp_table('orders', orders_final)
postgres_loader.bulk_copy(orders_final, 'temp_orders')
postgres_loader.merge_from_temp('orders', ['id'])

postgres_loader.close()
```

---

## 🏗️ Dimensional Modeling

### Star Schema Design

```sql
-- Fact Table: Sales
CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY,
    date_key INT NOT NULL,
    customer_key INT NOT NULL,
    product_key INT NOT NULL,
    store_key INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    profit_amount DECIMAL(10,2),
    
    -- Foreign keys to dimension tables
    FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
    FOREIGN KEY (customer_key) REFERENCES dim_customer(customer_key),
    FOREIGN KEY (product_key) REFERENCES dim_product(product_key),
    FOREIGN KEY (store_key) REFERENCES dim_store(store_key)
);

-- Dimension Table: Date
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE NOT NULL,
    day_of_week INT NOT NULL,
    day_name VARCHAR(10) NOT NULL,
    day_of_month INT NOT NULL,
    day_of_year INT NOT NULL,
    week_of_year INT NOT NULL,
    month_number INT NOT NULL,
    month_name VARCHAR(10) NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE,
    fiscal_year INT,
    fiscal_quarter INT
);

-- Dimension Table: Customer
CREATE TABLE dim_customer (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    age_group VARCHAR(20),
    gender VARCHAR(10),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    customer_segment VARCHAR(50),
    registration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- SCD Type 2 fields
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    UNIQUE(customer_id, effective_date)
);

-- Dimension Table: Product
CREATE TABLE dim_product (
    product_key INT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    sku VARCHAR(100),
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    product_line VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    weight DECIMAL(8,2),
    unit_cost DECIMAL(10,2),
    list_price DECIMAL(10,2),
    supplier_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- SCD Type 2 fields
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    UNIQUE(product_id, effective_date)
);

-- Dimension Table: Store
CREATE TABLE dim_store (
    store_key INT PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_type VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(50),
    region VARCHAR(100),
    district VARCHAR(100),
    manager_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_date DATE,
    store_size_sqft INT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- SCD Type 2 fields
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    UNIQUE(store_id, effective_date)
);

-- Create indexes for performance
CREATE INDEX idx_fact_sales_date ON fact_sales(date_key);
CREATE INDEX idx_fact_sales_customer ON fact_sales(customer_key);
CREATE INDEX idx_fact_sales_product ON fact_sales(product_key);
CREATE INDEX idx_fact_sales_store ON fact_sales(store_key);
CREATE INDEX idx_fact_sales_amount ON fact_sales(total_amount);

CREATE INDEX idx_dim_date_full_date ON dim_date(full_date);
CREATE INDEX idx_dim_date_year_month ON dim_date(year, month_number);

CREATE INDEX idx_dim_customer_id ON dim_customer(customer_id);
CREATE INDEX idx_dim_customer_current ON dim_customer(is_current);
CREATE INDEX idx_dim_customer_segment ON dim_customer(customer_segment);

CREATE INDEX idx_dim_product_id ON dim_product(product_id);
CREATE INDEX idx_dim_product_current ON dim_product(is_current);
CREATE INDEX idx_dim_product_category ON dim_product(category, subcategory);

CREATE INDEX idx_dim_store_id ON dim_store(store_id);
CREATE INDEX idx_dim_store_current ON dim_store(is_current);
CREATE INDEX idx_dim_store_region ON dim_store(region, district);
```

### Slowly Changing Dimensions (SCD)

```python
class SCDManager:
    def __init__(self, connection):
        self.connection = connection
    
    def handle_scd_type1(self, table_name, new_data, key_column):
        """Handle SCD Type 1 - Overwrite existing data"""
        cursor = self.connection.cursor()
        
        try:
            for _, row in new_data.iterrows():
                # Get non-key columns for update
                columns = [col for col in new_data.columns if col != key_column]
                set_clause = ', '.join([f"{col} = %s" for col in columns])
                
                update_query = f"""
                    UPDATE {table_name}
                    SET {set_clause}
                    WHERE {key_column} = %s
                """
                
                values = [row[col] for col in columns] + [row[key_column]]
                cursor.execute(update_query, values)
            
            self.connection.commit()
            logging.info(f"Updated {len(new_data)} records in {table_name} (SCD Type 1)")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"SCD Type 1 update failed: {e}")
            raise
        finally:
            cursor.close()
    
    def handle_scd_type2(self, table_name, new_data, key_column, effective_date):
        """Handle SCD Type 2 - Keep history with versioning"""
        cursor = self.connection.cursor()
        
        try:
            for _, row in new_data.iterrows():
                # Check if record exists and is current
                cursor.execute(f"""
                    SELECT * FROM {table_name}
                    WHERE {key_column} = %s AND is_current = TRUE
                """, (row[key_column],))
                
                existing_record = cursor.fetchone()
                
                if existing_record:
                    # Expire the current record
                    cursor.execute(f"""
                        UPDATE {table_name}
                        SET expiry_date = %s, is_current = FALSE
                        WHERE {key_column} = %s AND is_current = TRUE
                    """, (effective_date, row[key_column]))
                
                # Insert new version
                columns = list(new_data.columns) + ['effective_date', 'expiry_date', 'is_current']
                placeholders = ', '.join(['%s'] * len(columns))
                
                insert_query = f"""
                    INSERT INTO {table_name} ({', '.join(columns)})
                    VALUES ({placeholders})
                """
                
                values = list(row.values) + [effective_date, None, True]
                cursor.execute(insert_query, values)
            
            self.connection.commit()
            logging.info(f"Processed {len(new_data)} records in {table_name} (SCD Type 2)")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"SCD Type 2 processing failed: {e}")
            raise
        finally:
            cursor.close()
    
    def handle_scd_type3(self, table_name, new_data, key_column, tracked_columns):
        """Handle SCD Type 3 - Keep limited history in same record"""
        cursor = self.connection.cursor()
        
        try:
            for _, row in new_data.iterrows():
                # For each tracked column, move current to previous and update current
                set_clauses = []
                values = []
                
                for col in tracked_columns:
                    set_clauses.append(f"previous_{col} = {col}")
                    set_clauses.append(f"{col} = %s")
                    values.append(row[col])
                
                # Add other non-tracked columns
                other_columns = [col for col in new_data.columns 
                               if col not in tracked_columns and col != key_column]
                
                for col in other_columns:
                    set_clauses.append(f"{col} = %s")
                    values.append(row[col])
                
                values.append(row[key_column])
                
                update_query = f"""
                    UPDATE {table_name}
                    SET {', '.join(set_clauses)}
                    WHERE {key_column} = %s
                """
                
                cursor.execute(update_query, values)
            
            self.connection.commit()
            logging.info(f"Updated {len(new_data)} records in {table_name} (SCD Type 3)")
            
        except Exception as e:
            self.connection.rollback()
            logging.error(f"SCD Type 3 update failed: {e}")
            raise
        finally:
            cursor.close()

# Usage
scd_manager = SCDManager(postgres_loader.connection)

# Handle customer dimension changes
customer_changes = pd.DataFrame([
    {'customer_id': 'CUST001', 'email': 'newemail@example.com', 'city': 'New York'},
    {'customer_id': 'CUST002', 'phone': '+1-555-0199', 'address_line1': '456 Oak St'}
])

# Type 2 SCD for customer changes (keep history)
scd_manager.handle_scd_type2(
    'dim_customer', 
    customer_changes, 
    'customer_id', 
    datetime.now().date()
)
```

---

## 🔄 ETL Pipeline Orchestration

### Complete ETL Pipeline

```python
import schedule
import time
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class ETLConfig:
    source_configs: Dict[str, Any]
    target_config: Dict[str, Any]
    transformation_rules: Dict[str, Any]
    schedule_config: Dict[str, Any]
    notification_config: Dict[str, Any]

class ETLPipeline:
    def __init__(self, config: ETLConfig):
        self.config = config
        self.extractors = {}
        self.transformers = {}
        self.loaders = {}
        self.last_run_times = {}
        
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize ETL components"""
        # Initialize extractors
        for source_name, source_config in self.config.source_configs.items():
            if source_config['type'] == 'mysql':
                self.extractors[source_name] = MySQLExtractor(source_config['connection'])
            elif source_config['type'] == 'postgresql':
                self.extractors[source_name] = PostgreSQLExtractor(source_config['connection'])
            elif source_config['type'] == 'api':
                self.extractors[source_name] = APIExtractor(
                    source_config['base_url'], 
                    source_config.get('api_key')
                )
            elif source_config['type'] == 'file':
                self.extractors[source_name] = FileExtractor(source_config['base_path'])
        
        # Initialize transformer
        self.transformer = DataTransformer()
        
        # Initialize loader
        if self.config.target_config['type'] == 'mysql':
            self.loader = MySQLLoader(self.config.target_config['connection'])
        elif self.config.target_config['type'] == 'postgresql':
            self.loader = PostgreSQLLoader(self.config.target_config['connection'])
    
    def extract_data(self, source_name: str, extraction_config: Dict) -> pd.DataFrame:
        """Extract data from specified source"""
        extractor = self.extractors[source_name]
        
        try:
            if extraction_config['method'] == 'incremental':
                last_run = self.last_run_times.get(source_name, datetime.now() - timedelta(days=1))
                data = extractor.extract_incremental(
                    extraction_config['table'],
                    extraction_config['timestamp_column'],
                    last_run
                )
            elif extraction_config['method'] == 'full':
                data = extractor.extract_full(extraction_config['table'])
            elif extraction_config['method'] == 'custom':
                data = extractor.extract_with_joins(extraction_config['query'])
            
            logging.info(f"Extracted {len(data)} rows from {source_name}")
            return data
            
        except Exception as e:
            logging.error(f"Extraction failed for {source_name}: {e}")
            raise
    
    def transform_data(self, data: pd.DataFrame, transformation_rules: Dict) -> pd.DataFrame:
        """Apply transformations to data"""
        try:
            transformed_data = data.copy()
            
            # Apply data cleaning
            if 'clean_text' in transformation_rules:
                transformed_data = self.transformer.clean_text_data(
                    transformed_data, 
                    transformation_rules['clean_text']
                )
            
            # Handle missing values
            if 'missing_values' in transformation_rules:
                transformed_data = self.transformer.handle_missing_values(
                    transformed_data, 
                    transformation_rules['missing_values']
                )
            
            # Create derived columns
            if 'derived_columns' in transformation_rules:
                transformed_data = self.transformer.create_derived_columns(
                    transformed_data, 
                    transformation_rules['derived_columns']
                )
            
            # Data type conversions
            if 'data_types' in transformation_rules:
                converter = DataTypeConverter()
                transformed_data = converter.convert_data_types(
                    transformed_data, 
                    transformation_rules['data_types']
                )
            
            logging.info(f"Transformed data: {len(transformed_data)} rows")
            return transformed_data
            
        except Exception as e:
            logging.error(f"Transformation failed: {e}")
            raise
    
    def load_data(self, data: pd.DataFrame, load_config: Dict):
        """Load data to target system"""
        try:
            self.loader.connect()
            
            if load_config['method'] == 'bulk_insert':
                self.loader.bulk_insert_csv(data, load_config['table'])
            elif load_config['method'] == 'batch_insert':
                self.loader.batch_insert(
                    data, 
                    load_config['table'], 
                    batch_size=load_config.get('batch_size', 1000)
                )
            elif load_config['method'] == 'upsert':
                self.loader.upsert_data(
                    data, 
                    load_config['table'], 
                    load_config['key_columns']
                )
            
            logging.info(f"Loaded {len(data)} rows to {load_config['table']}")
            
        except Exception as e:
            logging.error(f"Loading failed: {e}")
            raise
        finally:
            self.loader.close()
    
    def run_pipeline(self, pipeline_name: str):
        """Run complete ETL pipeline"""
        start_time = datetime.now()
        logging.info(f"Starting ETL pipeline: {pipeline_name}")
        
        try:
            pipeline_config = self.config.transformation_rules[pipeline_name]
            
            # Extract phase
            all_data = {}
            for source_name, extraction_config in pipeline_config['sources'].items():
                data = self.extract_data(source_name, extraction_config)
                all_data[source_name] = data
            
            # Transform phase
            if 'joins' in pipeline_config:
                # Handle data joins
                transformed_data = self._join_data(all_data, pipeline_config['joins'])
            else:
                # Single source transformation
                source_name = list(all_data.keys())[0]
                transformed_data = all_data[source_name]
            
            # Apply transformations
            if 'transformations' in pipeline_config:
                transformed_data = self.transform_data(
                    transformed_data, 
                    pipeline_config['transformations']
                )
            
            # Load phase
            self.load_data(transformed_data, pipeline_config['target'])
            
            # Update last run time
            self.last_run_times[pipeline_name] = start_time
            
            duration = datetime.now() - start_time
            logging.info(f"ETL pipeline {pipeline_name} completed in {duration}")
            
            # Send success notification
            self._send_notification(
                f"ETL Success: {pipeline_name}", 
                f"Pipeline completed successfully. Processed {len(transformed_data)} rows in {duration}"
            )
            
        except Exception as e:
            duration = datetime.now() - start_time
            logging.error(f"ETL pipeline {pipeline_name} failed after {duration}: {e}")
            
            # Send failure notification
            self._send_notification(
                f"ETL Failure: {pipeline_name}", 
                f"Pipeline failed after {duration}. Error: {str(e)}"
            )
            raise
    
    def _join_data(self, data_sources: Dict[str, pd.DataFrame], join_config: List[Dict]) -> pd.DataFrame:
        """Join multiple data sources"""
        result_data = None
        
        for join in join_config:
            left_source = join['left']
            right_source = join['right']
            
            if result_data is None:
                left_df = data_sources[left_source]
            else:
                left_df = result_data
            
            right_df = data_sources[right_source]
            
            result_data = left_df.merge(
                right_df,
                left_on=join['left_on'],
                right_on=join['right_on'],
                how=join.get('how', 'inner'),
                suffixes=join.get('suffixes', ('', '_right'))
            )
        
        return result_data
    
    def _send_notification(self, subject: str, message: str):
        """Send notification about pipeline status"""
        # Implementation depends on notification method (email, Slack, etc.)
        logging.info(f"Notification: {subject} - {message}")
    
    def schedule_pipelines(self):
        """Schedule ETL pipelines"""
        for pipeline_name, schedule_config in self.config.schedule_config.items():
            if schedule_config['type'] == 'daily':
                schedule.every().day.at(schedule_config['time']).do(
                    self.run_pipeline, pipeline_name
                )
            elif schedule_config['type'] == 'hourly':
                schedule.every().hour.do(self.run_pipeline, pipeline_name)
            elif schedule_config['type'] == 'weekly':
                getattr(schedule.every(), schedule_config['day']).at(
                    schedule_config['time']
                ).do(self.run_pipeline, pipeline_name)
        
        logging.info("ETL pipelines scheduled")
        
        # Keep the scheduler running
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

# ETL Configuration Example
etl_config = ETLConfig(
    source_configs={
        'ecommerce_mysql': {
            'type': 'mysql',
            'connection': {
                'host': 'localhost',
                'user': 'etl_user',
                'password': 'password',
                'database': 'ecommerce'
            }
        },
        'analytics_api': {
            'type': 'api',
            'base_url': 'https://api.analytics.com/v1',
            'api_key': 'your_api_key'
        }
    },
    target_config={
        'type': 'postgresql',
        'connection': {
            'host': 'warehouse.company.com',
            'port': 5432,
            'user': 'warehouse_user',
            'password': 'warehouse_password',
            'database': 'data_warehouse'
        }
    },
    transformation_rules={
        'daily_sales_etl': {
            'sources': {
                'ecommerce_mysql': {
                    'method': 'incremental',
                    'table': 'orders',
                    'timestamp_column': 'created_at'
                }
            },
            'transformations': {
                'clean_text': ['customer_name', 'product_name'],
                'missing_values': {
                    'discount_amount': 0,
                    'tax_amount': 'mean'
                },
                'derived_columns': {
                    'profit_margin': lambda df: (df['total_amount'] - df['cost_amount']) / df['total_amount'] * 100,
                    'order_month': lambda df: pd.to_datetime(df['created_at']).dt.to_period('M')
                },
                'data_types': {
                    'created_at': 'datetime',
                    'total_amount': 'numeric'
                }
            },
            'target': {
                'method': 'upsert',
                'table': 'fact_sales',
                'key_columns': ['order_id']
            }
        }
    },
    schedule_config={
        'daily_sales_etl': {
            'type': 'daily',
            'time': '02:00'
        }
    },
    notification_config={
        'email': {
            'smtp_server': 'smtp.company.com',
            'recipients': ['data-team@company.com']
        }
    }
)

# Usage
etl_pipeline = ETLPipeline(etl_config)

# Run single pipeline
etl_pipeline.run_pipeline('daily_sales_etl')

# Schedule all pipelines
# etl_pipeline.schedule_pipelines()
```

---

## 📊 Data Quality and Monitoring

### Data Quality Checks

```python
class DataQualityChecker:
    def __init__(self):
        self.quality_rules = {}
        self.quality_results = []
    
    def add_rule(self, rule_name: str, rule_function, severity='ERROR'):
        """Add data quality rule"""
        self.quality_rules[rule_name] = {
            'function': rule_function,
            'severity': severity
        }
    
    def check_completeness(self, df: pd.DataFrame, required_columns: List[str]) -> Dict:
        """Check data completeness"""
        results = {}
        
        for column in required_columns:
            if column in df.columns:
                null_count = df[column].isnull().sum()
                null_percentage = (null_count / len(df)) * 100
                
                results[f"{column}_completeness"] = {
                    'passed': null_count == 0,
                    'null_count': null_count,
                    'null_percentage': null_percentage,
                    'message': f"{column} has {null_count} null values ({null_percentage:.2f}%)"
                }
        
        return results
    
    def check_uniqueness(self, df: pd.DataFrame, unique_columns: List[str]) -> Dict:
        """Check data uniqueness"""
        results = {}
        
        for column in unique_columns:
            if column in df.columns:
                total_count = len(df)
                unique_count = df[column].nunique()
                duplicate_count = total_count - unique_count
                
                results[f"{column}_uniqueness"] = {
                    'passed': duplicate_count == 0,
                    'duplicate_count': duplicate_count,
                    'uniqueness_percentage': (unique_count / total_count) * 100,
                    'message': f"{column} has {duplicate_count} duplicate values"
                }
        
        return results
    
    def check_data_types(self, df: pd.DataFrame, expected_types: Dict[str, str]) -> Dict:
        """Check data types"""
        results = {}
        
        for column, expected_type in expected_types.items():
            if column in df.columns:
                actual_type = str(df[column].dtype)
                type_match = self._types_match(actual_type, expected_type)
                
                results[f"{column}_data_type"] = {
                    'passed': type_match,
                    'expected_type': expected_type,
                    'actual_type': actual_type,
                    'message': f"{column} type mismatch: expected {expected_type}, got {actual_type}"
                }
        
        return results
    
    def check_value_ranges(self, df: pd.DataFrame, range_rules: Dict[str, Dict]) -> Dict:
        """Check value ranges"""
        results = {}
        
        for column, rule in range_rules.items():
            if column in df.columns:
                if 'min' in rule:
                    below_min = (df[column] < rule['min']).sum()
                    results[f"{column}_min_range"] = {
                        'passed': below_min == 0,
                        'violations': below_min,
                        'message': f"{column} has {below_min} values below minimum {rule['min']}"
                    }
                
                if 'max' in rule:
                    above_max = (df[column] > rule['max']).sum()
                    results[f"{column}_max_range"] = {
                        'passed': above_max == 0,
                        'violations': above_max,
                        'message': f"{column} has {above_max} values above maximum {rule['max']}"
                    }
        
        return results
    
    def check_referential_integrity(self, df: pd.DataFrame, reference_data: Dict[str, pd.DataFrame]) -> Dict:
        """Check referential integrity"""
        results = {}
        
        for column, ref_df in reference_data.items():
            if column in df.columns:
                ref_column = ref_df.columns[0]  # Assume first column is the key
                valid_values = set(ref_df[ref_column].values)
                df_values = set(df[column].dropna().values)
                
                invalid_values = df_values - valid_values
                invalid_count = len(invalid_values)
                
                results[f"{column}_referential_integrity"] = {
                    'passed': invalid_count == 0,
                    'invalid_count': invalid_count,
                    'invalid_values': list(invalid_values)[:10],  # Show first 10
                    'message': f"{column} has {invalid_count} invalid reference values"
                }
        
        return results
    
    def run_quality_checks(self, df: pd.DataFrame, rules_config: Dict) -> Dict:
        """Run all configured quality checks"""
        all_results = {}
        
        if 'completeness' in rules_config:
            completeness_results = self.check_completeness(df, rules_config['completeness'])
            all_results.update(completeness_results)
        
        if 'uniqueness' in rules_config:
            uniqueness_results = self.check_uniqueness(df, rules_config['uniqueness'])
            all_results.update(uniqueness_results)
        
        if 'data_types' in rules_config:
            type_results = self.check_data_types(df, rules_config['data_types'])
            all_results.update(type_results)
        
        if 'value_ranges' in rules_config:
            range_results = self.check_value_ranges(df, rules_config['value_ranges'])
            all_results.update(range_results)
        
        if 'referential_integrity' in rules_config:
            ref_results = self.check_referential_integrity(df, rules_config['referential_integrity'])
            all_results.update(ref_results)
        
        # Run custom rules
        for rule_name, rule_config in self.quality_rules.items():
            try:
                custom_result = rule_config['function'](df)
                all_results[rule_name] = {
                    'passed': custom_result,
                    'severity': rule_config['severity'],
                    'message': f"Custom rule {rule_name}: {'PASSED' if custom_result else 'FAILED'}"
                }
            except Exception as e:
                all_results[rule_name] = {
                    'passed': False,
                    'severity': 'ERROR',
                    'message': f"Custom rule {rule_name} failed with error: {str(e)}"
                }
        
        return all_results
    
    def _types_match(self, actual_type: str, expected_type: str) -> bool:
        """Check if data types match"""
        type_mappings = {
            'int': ['int64', 'int32', 'int16', 'int8'],
            'float': ['float64', 'float32'],
            'string': ['object', 'string'],
            'datetime': ['datetime64[ns]', 'datetime64'],
            'bool': ['bool']
        }
        
        if expected_type in type_mappings:
            return actual_type in type_mappings[expected_type]
        
        return actual_type == expected_type
    
    def generate_quality_report(self, results: Dict) -> str:
        """Generate data quality report"""
        report = ["\n=== DATA QUALITY REPORT ==="]
        
        passed_count = sum(1 for result in results.values() if result.get('passed', False))
        total_count = len(results)
        
        report.append(f"\nOverall: {passed_count}/{total_count} checks passed ({passed_count/total_count*100:.1f}%)")
        
        # Group by severity
        errors = []
        warnings = []
        passed = []
        
        for check_name, result in results.items():
            if result.get('passed', False):
                passed.append((check_name, result))
            elif result.get('severity', 'ERROR') == 'ERROR':
                errors.append((check_name, result))
            else:
                warnings.append((check_name, result))
        
        if errors:
            report.append("\n🔴 ERRORS:")
            for check_name, result in errors:
                report.append(f"  - {check_name}: {result['message']}")
        
        if warnings:
            report.append("\n🟡 WARNINGS:")
            for check_name, result in warnings:
                report.append(f"  - {check_name}: {result['message']}")
        
        if passed:
            report.append(f"\n🟢 PASSED: {len(passed)} checks")
        
        return "\n".join(report)

# Usage
quality_checker = DataQualityChecker()

# Add custom rule
quality_checker.add_rule(
    'positive_amounts',
    lambda df: (df['total_amount'] > 0).all(),
    severity='ERROR'
)

# Define quality rules
quality_rules = {
    'completeness': ['customer_id', 'order_date', 'total_amount'],
    'uniqueness': ['order_id'],
    'data_types': {
        'customer_id': 'int',
        'order_date': 'datetime',
        'total_amount': 'float'
    },
    'value_ranges': {
        'total_amount': {'min': 0, 'max': 10000},
        'quantity': {'min': 1, 'max': 100}
    }
}

# Run quality checks
quality_results = quality_checker.run_quality_checks(orders_df, quality_rules)

# Generate report
report = quality_checker.generate_quality_report(quality_results)
print(report)
```

---

## 🏢 Data Warehousing Concepts

### Star Schema Design

```sql
-- Fact Table: Sales
CREATE TABLE fact_sales (
    sale_id BIGINT PRIMARY KEY,
    date_key INT NOT NULL,
    customer_key INT NOT NULL,
    product_key INT NOT NULL,
    store_key INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL,
    profit_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
    FOREIGN KEY (customer_key) REFERENCES dim_customer(customer_key),
    FOREIGN KEY (product_key) REFERENCES dim_product(product_key),
    FOREIGN KEY (store_key) REFERENCES dim_store(store_key)
);

-- Dimension Table: Date
CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE NOT NULL,
    day_of_week VARCHAR(10),
    day_of_month INT,
    day_of_year INT,
    week_of_year INT,
    month_name VARCHAR(10),
    month_number INT,
    quarter INT,
    year INT,
    is_weekend BOOLEAN,
    is_holiday BOOLEAN,
    fiscal_year INT,
    fiscal_quarter INT
);

-- Dimension Table: Customer
CREATE TABLE dim_customer (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
    customer_segment VARCHAR(50),
    registration_date DATE,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimension Table: Product
CREATE TABLE dim_product (
    product_key INT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    product_line VARCHAR(100),
    unit_cost DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    product_size VARCHAR(50),
    product_color VARCHAR(50),
    product_weight DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimension Table: Store
CREATE TABLE dim_store (
    store_key INT PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_type VARCHAR(50),
    manager_name VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    opening_date DATE,
    store_size_sqft INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Snowflake Schema Example

```sql
-- Normalized Product Dimension
CREATE TABLE dim_product_category (
    category_key INT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_description TEXT,
    department VARCHAR(100)
);

CREATE TABLE dim_product_brand (
    brand_key INT PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL,
    brand_description TEXT,
    country_of_origin VARCHAR(100)
);

CREATE TABLE dim_product_normalized (
    product_key INT PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category_key INT,
    brand_key INT,
    unit_cost DECIMAL(10,2),
    unit_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (category_key) REFERENCES dim_product_category(category_key),
    FOREIGN KEY (brand_key) REFERENCES dim_product_brand(brand_key)
);
```

### Slowly Changing Dimensions (SCD)

```sql
-- SCD Type 1: Overwrite
UPDATE dim_customer 
SET 
    email = 'new_email@example.com',
    updated_at = CURRENT_TIMESTAMP
WHERE customer_key = 12345;

-- SCD Type 2: Add New Record
CREATE TABLE dim_customer_scd2 (
    customer_key INT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    customer_segment VARCHAR(50),
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    version_number INT DEFAULT 1
);

-- Insert new version for SCD Type 2
INSERT INTO dim_customer_scd2 (
    customer_key, customer_id, first_name, last_name, 
    email, customer_segment, effective_date, is_current, version_number
)
SELECT 
    (SELECT MAX(customer_key) + 1 FROM dim_customer_scd2),
    customer_id,
    first_name,
    last_name,
    'updated_email@example.com',
    'Premium',
    CURRENT_DATE,
    TRUE,
    (SELECT MAX(version_number) + 1 FROM dim_customer_scd2 WHERE customer_id = 'CUST001')
FROM dim_customer_scd2 
WHERE customer_id = 'CUST001' AND is_current = TRUE;

-- Update previous version
UPDATE dim_customer_scd2 
SET 
    expiration_date = CURRENT_DATE - INTERVAL '1 day',
    is_current = FALSE
WHERE customer_id = 'CUST001' 
  AND is_current = TRUE 
  AND customer_key != (SELECT MAX(customer_key) FROM dim_customer_scd2 WHERE customer_id = 'CUST001');

-- SCD Type 3: Add New Column
ALTER TABLE dim_customer 
ADD COLUMN previous_segment VARCHAR(50),
ADD COLUMN segment_change_date DATE;

UPDATE dim_customer 
SET 
    previous_segment = customer_segment,
    customer_segment = 'Premium',
    segment_change_date = CURRENT_DATE
WHERE customer_key = 12345;
```

### Data Mart Creation

```sql
-- Sales Data Mart
CREATE VIEW sales_data_mart AS
SELECT 
    fs.sale_id,
    dd.full_date,
    dd.year,
    dd.quarter,
    dd.month_name,
    dc.customer_segment,
    dc.city as customer_city,
    dc.country as customer_country,
    dp.product_name,
    dp.category,
    dp.brand,
    ds.store_name,
    ds.store_type,
    ds.city as store_city,
    fs.quantity,
    fs.unit_price,
    fs.total_amount,
    fs.discount_amount,
    fs.profit_amount,
    
    -- Calculated measures
    fs.total_amount - fs.discount_amount as net_sales,
    fs.profit_amount / NULLIF(fs.total_amount, 0) * 100 as profit_margin_pct,
    
    -- Running totals
    SUM(fs.total_amount) OVER (
        PARTITION BY dd.year, dd.month_number 
        ORDER BY dd.full_date
        ROWS UNBOUNDED PRECEDING
    ) as running_monthly_sales
    
FROM fact_sales fs
JOIN dim_date dd ON fs.date_key = dd.date_key
JOIN dim_customer dc ON fs.customer_key = dc.customer_key
JOIN dim_product dp ON fs.product_key = dp.product_key
JOIN dim_store ds ON fs.store_key = ds.store_key
WHERE dd.year >= EXTRACT(YEAR FROM CURRENT_DATE) - 2;

-- Customer Analytics Data Mart
CREATE VIEW customer_analytics_mart AS
SELECT 
    dc.customer_key,
    dc.customer_id,
    dc.customer_segment,
    dc.city,
    dc.country,
    
    -- Customer metrics
    COUNT(DISTINCT fs.sale_id) as total_orders,
    SUM(fs.total_amount) as lifetime_value,
    AVG(fs.total_amount) as avg_order_value,
    MAX(dd.full_date) as last_purchase_date,
    MIN(dd.full_date) as first_purchase_date,
    
    -- Customer behavior
    COUNT(DISTINCT dd.year || '-' || dd.month_number) as active_months,
    COUNT(DISTINCT dp.category) as categories_purchased,
    
    -- Recency, Frequency, Monetary (RFM)
    CURRENT_DATE - MAX(dd.full_date) as recency_days,
    COUNT(DISTINCT fs.sale_id) as frequency,
    SUM(fs.total_amount) as monetary_value,
    
    -- Customer classification
    CASE 
        WHEN SUM(fs.total_amount) > 10000 THEN 'High Value'
        WHEN SUM(fs.total_amount) > 5000 THEN 'Medium Value'
        ELSE 'Low Value'
    END as value_segment
    
FROM dim_customer dc
LEFT JOIN fact_sales fs ON dc.customer_key = fs.customer_key
LEFT JOIN dim_date dd ON fs.date_key = dd.date_key
WHERE dc.is_active = TRUE
GROUP BY 
    dc.customer_key, dc.customer_id, dc.customer_segment, 
    dc.city, dc.country;
```

---

## 🎯 Real-World ETL Project: E-commerce Analytics

### Project Overview
Build a complete ETL pipeline for an e-commerce company that:
- Extracts data from multiple sources (MySQL, APIs, CSV files)
- Transforms data for analytics
- Loads into a PostgreSQL data warehouse
- Implements data quality checks
- Provides automated reporting

### Implementation

```python
# Complete E-commerce ETL Project
class EcommerceETLProject:
    def __init__(self):
        self.config = self._load_config()
        self.logger = self._setup_logging()
        self.quality_checker = DataQualityChecker()
        self.metrics = ETLMetrics()
        
    def _load_config(self):
        return {
            'sources': {
                'orders_db': {
                    'type': 'mysql',
                    'host': 'prod-mysql.company.com',
                    'database': 'ecommerce',
                    'tables': ['orders', 'order_items', 'customers', 'products']
                },
                'web_analytics': {
                    'type': 'api',
                    'base_url': 'https://api.analytics.com/v1',
                    'endpoints': ['sessions', 'page_views', 'conversions']
                },
                'inventory_files': {
                    'type': 'file',
                    'path': '/data/inventory/',
                    'format': 'csv'
                }
            },
            'target': {
                'type': 'postgresql',
                'host': 'warehouse.company.com',
                'database': 'analytics_dw'
            },
            'schedule': {
                'daily_sales': '02:00',
                'hourly_inventory': '*/1 * * * *',
                'weekly_customer_analysis': '0 6 * * 1'
            }
        }
    
    def extract_orders_data(self, start_date: str, end_date: str):
        """Extract orders data from MySQL"""
        query = """
        SELECT 
            o.order_id,
            o.customer_id,
            o.order_date,
            o.status,
            o.total_amount,
            o.shipping_cost,
            o.tax_amount,
            oi.product_id,
            oi.quantity,
            oi.unit_price,
            oi.discount_amount,
            c.email,
            c.registration_date,
            c.customer_segment,
            p.product_name,
            p.category,
            p.brand
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN products p ON oi.product_id = p.product_id
        WHERE o.order_date BETWEEN %s AND %s
        """
        
        extractor = MySQLExtractor(self.config['sources']['orders_db'])
        return extractor.execute_query(query, (start_date, end_date))
    
    def extract_web_analytics(self, date: str):
        """Extract web analytics data from API"""
        api_extractor = APIExtractor(self.config['sources']['web_analytics'])
        
        sessions = api_extractor.get_data(f'sessions?date={date}')
        page_views = api_extractor.get_data(f'page_views?date={date}')
        conversions = api_extractor.get_data(f'conversions?date={date}')
        
        return {
            'sessions': pd.DataFrame(sessions),
            'page_views': pd.DataFrame(page_views),
            'conversions': pd.DataFrame(conversions)
        }
    
    def transform_sales_data(self, orders_df: pd.DataFrame):
        """Transform orders data for analytics"""
        transformer = DataTransformer()
        
        # Data cleaning
        orders_df = transformer.clean_text_data(orders_df, ['email', 'product_name'])
        orders_df = transformer.handle_missing_values(orders_df, {
            'discount_amount': 0,
            'shipping_cost': 'mean'
        })
        
        # Create derived columns
        orders_df['net_amount'] = orders_df['total_amount'] - orders_df['discount_amount']
        orders_df['profit_amount'] = orders_df['net_amount'] * 0.3  # Assume 30% margin
        orders_df['order_year'] = pd.to_datetime(orders_df['order_date']).dt.year
        orders_df['order_month'] = pd.to_datetime(orders_df['order_date']).dt.month
        orders_df['order_quarter'] = pd.to_datetime(orders_df['order_date']).dt.quarter
        
        # Customer segmentation
        orders_df['customer_value_segment'] = orders_df.groupby('customer_id')['total_amount'].transform('sum').apply(
            lambda x: 'High' if x > 10000 else 'Medium' if x > 5000 else 'Low'
        )
        
        # Product performance metrics
        orders_df['product_revenue_rank'] = orders_df.groupby(['order_year', 'order_month'])['net_amount'].rank(method='dense', ascending=False)
        
        return orders_df
    
    def create_dimensional_model(self, transformed_data: pd.DataFrame):
        """Create dimensional model from transformed data"""
        
        # Create dimension tables
        dim_date = self._create_date_dimension()
        dim_customer = self._create_customer_dimension(transformed_data)
        dim_product = self._create_product_dimension(transformed_data)
        
        # Create fact table
        fact_sales = self._create_sales_fact(transformed_data, dim_date, dim_customer, dim_product)
        
        return {
            'dim_date': dim_date,
            'dim_customer': dim_customer,
            'dim_product': dim_product,
            'fact_sales': fact_sales
        }
    
    def _create_date_dimension(self):
        """Create date dimension"""
        start_date = datetime(2020, 1, 1)
        end_date = datetime(2025, 12, 31)
        
        dates = pd.date_range(start=start_date, end=end_date, freq='D')
        
        dim_date = pd.DataFrame({
            'date_key': [int(d.strftime('%Y%m%d')) for d in dates],
            'full_date': dates,
            'day_of_week': dates.day_name(),
            'day_of_month': dates.day,
            'day_of_year': dates.dayofyear,
            'week_of_year': dates.isocalendar().week,
            'month_name': dates.month_name(),
            'month_number': dates.month,
            'quarter': dates.quarter,
            'year': dates.year,
            'is_weekend': dates.weekday >= 5,
            'is_holiday': False  # Would need holiday calendar integration
        })
        
        return dim_date
    
    def _create_customer_dimension(self, data: pd.DataFrame):
        """Create customer dimension"""
        customers = data.groupby('customer_id').agg({
            'email': 'first',
            'registration_date': 'first',
            'customer_segment': 'first',
            'customer_value_segment': 'first',
            'total_amount': 'sum'
        }).reset_index()
        
        customers['customer_key'] = range(1, len(customers) + 1)
        
        return customers[[
            'customer_key', 'customer_id', 'email', 'registration_date',
            'customer_segment', 'customer_value_segment', 'total_amount'
        ]]
    
    def _create_product_dimension(self, data: pd.DataFrame):
        """Create product dimension"""
        products = data.groupby('product_id').agg({
            'product_name': 'first',
            'category': 'first',
            'brand': 'first',
            'unit_price': 'mean'
        }).reset_index()
        
        products['product_key'] = range(1, len(products) + 1)
        
        return products[[
            'product_key', 'product_id', 'product_name', 
            'category', 'brand', 'unit_price'
        ]]
    
    def _create_sales_fact(self, data: pd.DataFrame, dim_date: pd.DataFrame, 
                          dim_customer: pd.DataFrame, dim_product: pd.DataFrame):
        """Create sales fact table"""
        
        # Create date keys
        data['date_key'] = pd.to_datetime(data['order_date']).dt.strftime('%Y%m%d').astype(int)
        
        # Merge with dimensions to get keys
        fact_sales = data.merge(
            dim_customer[['customer_key', 'customer_id']], 
            on='customer_id'
        ).merge(
            dim_product[['product_key', 'product_id']], 
            on='product_id'
        )
        
        return fact_sales[[
            'order_id', 'date_key', 'customer_key', 'product_key',
            'quantity', 'unit_price', 'total_amount', 'discount_amount',
            'net_amount', 'profit_amount'
        ]]
    
    def run_quality_checks(self, data: Dict[str, pd.DataFrame]):
        """Run comprehensive data quality checks"""
        quality_results = {}
        
        # Check fact table
        fact_rules = {
            'completeness': ['order_id', 'date_key', 'customer_key', 'product_key'],
            'uniqueness': ['order_id'],
            'value_ranges': {
                'quantity': {'min': 1, 'max': 1000},
                'unit_price': {'min': 0, 'max': 10000},
                'total_amount': {'min': 0, 'max': 100000}
            }
        }
        
        quality_results['fact_sales'] = self.quality_checker.run_quality_checks(
            data['fact_sales'], fact_rules
        )
        
        # Check dimension tables
        dim_customer_rules = {
            'completeness': ['customer_id', 'email'],
            'uniqueness': ['customer_id', 'email']
        }
        
        quality_results['dim_customer'] = self.quality_checker.run_quality_checks(
            data['dim_customer'], dim_customer_rules
        )
        
        return quality_results
    
    def load_to_warehouse(self, dimensional_data: Dict[str, pd.DataFrame]):
        """Load data to PostgreSQL warehouse"""
        loader = PostgreSQLLoader(self.config['target'])
        loader.connect()
        
        try:
            # Load dimensions first
            for table_name, df in dimensional_data.items():
                if table_name.startswith('dim_'):
                    loader.upsert_data(df, table_name, ['customer_id'] if 'customer' in table_name else ['product_id'])
            
            # Load fact table
            loader.upsert_data(
                dimensional_data['fact_sales'], 
                'fact_sales', 
                ['order_id']
            )
            
            self.logger.info("Data loaded successfully to warehouse")
            
        except Exception as e:
            self.logger.error(f"Failed to load data: {e}")
            raise
        finally:
            loader.close()
    
    def generate_business_reports(self):
        """Generate automated business reports"""
        warehouse_conn = PostgreSQLExtractor(self.config['target'])
        
        # Daily sales report
        daily_sales_query = """
        SELECT 
            dd.full_date,
            SUM(fs.total_amount) as total_sales,
            SUM(fs.profit_amount) as total_profit,
            COUNT(DISTINCT fs.order_id) as total_orders,
            AVG(fs.total_amount) as avg_order_value
        FROM fact_sales fs
        JOIN dim_date dd ON fs.date_key = dd.date_key
        WHERE dd.full_date >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY dd.full_date
        ORDER BY dd.full_date DESC
        """
        
        daily_sales = warehouse_conn.execute_query(daily_sales_query)
        
        # Customer segment analysis
        segment_analysis_query = """
        SELECT 
            dc.customer_segment,
            COUNT(DISTINCT dc.customer_id) as customer_count,
            SUM(fs.total_amount) as total_revenue,
            AVG(fs.total_amount) as avg_order_value,
            SUM(fs.profit_amount) as total_profit
        FROM dim_customer dc
        JOIN fact_sales fs ON dc.customer_key = fs.customer_key
        JOIN dim_date dd ON fs.date_key = dd.date_key
        WHERE dd.full_date >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY dc.customer_segment
        ORDER BY total_revenue DESC
        """
        
        segment_analysis = warehouse_conn.execute_query(segment_analysis_query)
        
        return {
            'daily_sales': daily_sales,
            'segment_analysis': segment_analysis
        }
    
    def run_full_pipeline(self, date: str):
        """Run the complete ETL pipeline"""
        start_time = datetime.now()
        self.logger.info(f"Starting ETL pipeline for {date}")
        
        try:
            # Extract
            orders_data = self.extract_orders_data(date, date)
            web_data = self.extract_web_analytics(date)
            
            # Transform
            transformed_orders = self.transform_sales_data(orders_data)
            dimensional_data = self.create_dimensional_model(transformed_orders)
            
            # Quality checks
            quality_results = self.run_quality_checks(dimensional_data)
            
            # Check if quality passed
            failed_checks = sum(1 for table_results in quality_results.values() 
                              for result in table_results.values() 
                              if not result.get('passed', True))
            
            if failed_checks > 0:
                self.logger.warning(f"Quality checks failed: {failed_checks} issues found")
                # Decide whether to continue or halt
            
            # Load
            self.load_to_warehouse(dimensional_data)
            
            # Generate reports
            reports = self.generate_business_reports()
            
            # Record metrics
            duration = datetime.now() - start_time
            self.metrics.record_pipeline_run({
                'pipeline_name': 'ecommerce_etl',
                'date': date,
                'duration': duration,
                'records_processed': len(transformed_orders),
                'quality_score': (len([r for table_results in quality_results.values() 
                                     for r in table_results.values() 
                                     if r.get('passed', True)]) / 
                                max(1, sum(len(table_results) for table_results in quality_results.values()))) * 100
            })
            
            self.logger.info(f"ETL pipeline completed successfully in {duration}")
            return True
            
        except Exception as e:
            self.logger.error(f"ETL pipeline failed: {e}")
            return False

# Usage
etl_project = EcommerceETLProject()
etl_project.run_full_pipeline('2024-01-15')
```

---

## 📈 Performance Optimization

### ETL Performance Best Practices

1. **Parallel Processing**
```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing as mp

class ParallelETL:
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or mp.cpu_count()
    
    def parallel_extract(self, source_configs):
        """Extract from multiple sources in parallel"""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {}
            for source_name, config in source_configs.items():
                future = executor.submit(self._extract_single_source, source_name, config)
                futures[source_name] = future
            
            results = {}
            for source_name, future in futures.items():
                results[source_name] = future.result()
            
            return results
    
    def parallel_transform(self, data_chunks):
        """Transform data chunks in parallel"""
        with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
            futures = [executor.submit(self._transform_chunk, chunk) for chunk in data_chunks]
            results = [future.result() for future in futures]
            
            # Combine results
            return pd.concat(results, ignore_index=True)
```

2. **Incremental Loading**
```python
class IncrementalETL:
    def __init__(self):
        self.watermark_table = 'etl_watermarks'
    
    def get_last_watermark(self, table_name: str) -> datetime:
        """Get last processed timestamp"""
        query = f"""
        SELECT last_processed_timestamp 
        FROM {self.watermark_table} 
        WHERE table_name = %s
        """
        result = self.db.execute_query(query, (table_name,))
        return result[0][0] if result else datetime(1900, 1, 1)
    
    def update_watermark(self, table_name: str, timestamp: datetime):
        """Update watermark after successful processing"""
        query = f"""
        INSERT INTO {self.watermark_table} (table_name, last_processed_timestamp)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE last_processed_timestamp = %s
        """
        self.db.execute_query(query, (table_name, timestamp, timestamp))
    
    def incremental_extract(self, table_name: str, timestamp_column: str):
        """Extract only new/modified records"""
        last_watermark = self.get_last_watermark(table_name)
        
        query = f"""
        SELECT * FROM {table_name}
        WHERE {timestamp_column} > %s
        ORDER BY {timestamp_column}
        """
        
        data = self.db.execute_query(query, (last_watermark,))
        
        if data:
            max_timestamp = max(row[timestamp_column] for row in data)
            self.update_watermark(table_name, max_timestamp)
        
        return data
```

3. **Batch Processing**
```python
class BatchProcessor:
    def __init__(self, batch_size=10000):
        self.batch_size = batch_size
    
    def process_in_batches(self, data: pd.DataFrame, process_func):
        """Process large datasets in batches"""
        total_rows = len(data)
        processed_rows = 0
        
        for start_idx in range(0, total_rows, self.batch_size):
            end_idx = min(start_idx + self.batch_size, total_rows)
            batch = data.iloc[start_idx:end_idx]
            
            try:
                process_func(batch)
                processed_rows += len(batch)
                
                # Progress logging
                progress = (processed_rows / total_rows) * 100
                logging.info(f"Processed {processed_rows}/{total_rows} rows ({progress:.1f}%)")
                
            except Exception as e:
                logging.error(f"Failed to process batch {start_idx}-{end_idx}: {e}")
                raise
```

---

## 🎓 Interview Questions & Answers

### Beginner Level

**Q1: What is ETL and why is it important?**

**A:** ETL stands for Extract, Transform, Load. It's a data integration process that:
- **Extract**: Retrieves data from various sources (databases, APIs, files)
- **Transform**: Cleans, validates, and converts data into the desired format
- **Load**: Stores the processed data into a target system (data warehouse, database)

ETL is important because it enables organizations to consolidate data from multiple sources, ensure data quality, and make data available for analytics and reporting.

**Q2: What's the difference between ETL and ELT?**

**A:** 
- **ETL**: Transform data before loading into the target system. Better for complex transformations and when target system has limited processing power.
- **ELT**: Load raw data first, then transform within the target system. Better for cloud data warehouses with powerful processing capabilities like Snowflake, BigQuery.

### Intermediate Level

**Q3: How do you handle slowly changing dimensions (SCD)?**

**A:** There are three main types:
- **Type 1**: Overwrite old values (no history preserved)
- **Type 2**: Create new records for changes (full history preserved)
- **Type 3**: Add columns for previous values (limited history)

Choice depends on business requirements for historical data tracking.

**Q4: What are the key considerations for ETL performance optimization?**

**A:**
- **Parallel processing**: Process multiple data streams simultaneously
- **Incremental loading**: Only process new/changed data
- **Batch processing**: Handle large datasets in manageable chunks
- **Indexing**: Optimize database queries with proper indexes
- **Data partitioning**: Distribute data across multiple storage units
- **Compression**: Reduce data transfer and storage costs

### Advanced Level

**Q5: How do you design an ETL pipeline for real-time data processing?**

**A:** Real-time ETL requires:
- **Streaming platforms**: Apache Kafka, Amazon Kinesis
- **Stream processing**: Apache Spark Streaming, Apache Flink
- **Micro-batch processing**: Process small batches frequently
- **Change Data Capture (CDC)**: Capture database changes in real-time
- **Event-driven architecture**: React to data changes immediately

**Q6: How do you ensure data quality in ETL pipelines?**

**A:**
- **Data profiling**: Understand data characteristics and patterns
- **Validation rules**: Check completeness, uniqueness, referential integrity
- **Data lineage**: Track data flow from source to destination
- **Monitoring and alerting**: Detect anomalies and failures
- **Data quality metrics**: Measure and report quality scores
- **Automated testing**: Unit tests for transformation logic

---

## ⚠️ Common Pitfalls

1. **Not handling data quality early**
   - Always validate data at extraction point
   - Implement comprehensive quality checks

2. **Ignoring incremental loading**
   - Full loads become unsustainable with large datasets
   - Implement proper watermarking strategies

3. **Poor error handling**
   - ETL pipelines should be resilient to failures
   - Implement retry mechanisms and proper logging

4. **Not considering data lineage**
   - Track data flow for debugging and compliance
   - Document transformation logic

5. **Inadequate monitoring**
   - Monitor pipeline performance and data quality
   - Set up alerts for failures and anomalies

---

## 🎯 Next Steps

Congratulations! You've completed Chapter 21 on ETL and Data Warehousing. You should now understand:

✅ ETL vs ELT concepts and when to use each
✅ Data extraction from multiple sources (databases, APIs, files)
✅ Data transformation techniques and best practices
✅ Data loading strategies (bulk, batch, incremental)
✅ Data warehousing concepts (star schema, snowflake schema)
✅ Slowly changing dimensions (SCD) implementation
✅ Data quality management and monitoring
✅ Performance optimization techniques
✅ Real-world ETL project implementation

**Continue to:** [Chapter 22: Cloud Databases & Database as a Service (DBaaS)](22-cloud-databases-dbaas.md)

**Practice Projects:**
1. Build an ETL pipeline for your own data sources
2. Implement a real-time streaming ETL with Kafka
3. Create a data quality monitoring dashboard
4. Design a multi-source data warehouse

**Additional Resources:**
- Apache Airflow for workflow orchestration
- dbt (data build tool) for transformation
- Great Expectations for data quality
- Apache Spark for big data processing