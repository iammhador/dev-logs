# Deployment Strategies

## Overview

Deployment strategies are critical for delivering software reliably, safely, and efficiently. This chapter covers modern deployment patterns, containerization, CI/CD pipelines, and infrastructure management techniques that enable teams to deploy with confidence.

## Containerization

### Docker Fundamentals

**Dockerfile Best Practices:**

```dockerfile
# Multi-stage build for Python application
FROM python:3.11-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Set environment variables
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Expose port
EXPOSE 8000

# Start application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Docker Compose for Development:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - LOG_LEVEL=INFO
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Container Orchestration with Kubernetes

**Kubernetes Deployment:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: myapp-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: myapp-config
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: app-logs
          mountPath: /app/logs
      volumes:
      - name: app-logs
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - myapp.example.com
    secretName: myapp-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
```

**ConfigMap and Secrets:**

```yaml
# config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  redis-url: "redis://redis-service:6379"
  log-level: "INFO"
  max-connections: "100"
---
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secrets
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc3dvcmRAZGI6NTQzMi9teWFwcA== # base64 encoded
  api-key: YWJjZGVmZ2hpams= # base64 encoded
```

## CI/CD Pipelines

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
        cache: 'pip'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run linting
      run: |
        flake8 .
        black --check .
        isort --check-only .
    
    - name: Run type checking
      run: mypy .
    
    - name: Run tests
      run: |
        pytest --cov=app --cov-report=xml --cov-report=html
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_URL: redis://localhost:6379
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true

  security:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run security scan
      uses: securecodewarrior/github-action-add-sarif@v1
      with:
        sarif-file: 'security-scan-results.sarif'
    
    - name: Run dependency check
      run: |
        pip install safety
        safety check --json --output safety-report.json

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    permissions:
      contents: read
      packages: write
    
    outputs:
      image-digest: ${{ steps.build.outputs.digest }}
      image-tag: ${{ steps.meta.outputs.tags }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          BUILD_DATE=${{ fromJSON(steps.meta.outputs.json).labels['org.opencontainers.image.created'] }}
          VCS_REF=${{ github.sha }}

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_STAGING }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to staging
      run: |
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/myapp-deployment myapp=${{ needs.build.outputs.image-tag }} -n staging
        kubectl rollout status deployment/myapp-deployment -n staging --timeout=300s
    
    - name: Run smoke tests
      run: |
        python scripts/smoke_tests.py --environment=staging

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_PRODUCTION }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Blue-Green Deployment
      run: |
        export KUBECONFIG=kubeconfig
        python scripts/blue_green_deploy.py \
          --image=${{ needs.build.outputs.image-tag }} \
          --namespace=production \
          --deployment=myapp-deployment
    
    - name: Run production tests
      run: |
        python scripts/production_tests.py
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Blue-Green Deployment Script

```python
#!/usr/bin/env python3
# scripts/blue_green_deploy.py

import argparse
import subprocess
import time
import requests
import sys
from typing import Dict, List

class BlueGreenDeployer:
    def __init__(self, namespace: str, deployment_name: str, service_name: str):
        self.namespace = namespace
        self.deployment_name = deployment_name
        self.service_name = service_name
        self.kubectl_cmd = ["kubectl", "-n", namespace]
    
    def run_kubectl(self, args: List[str]) -> str:
        """Run kubectl command and return output"""
        cmd = self.kubectl_cmd + args
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            print(f"kubectl command failed: {' '.join(cmd)}")
            print(f"Error: {e.stderr}")
            sys.exit(1)
    
    def get_current_deployment_info(self) -> Dict:
        """Get current deployment information"""
        output = self.run_kubectl([
            "get", "deployment", self.deployment_name, 
            "-o", "jsonpath={.spec.replicas},{.status.readyReplicas},{.spec.template.spec.containers[0].image}"
        ])
        
        replicas, ready_replicas, image = output.split(',')
        return {
            'replicas': int(replicas),
            'ready_replicas': int(ready_replicas) if ready_replicas else 0,
            'image': image
        }
    
    def create_green_deployment(self, new_image: str) -> str:
        """Create green deployment with new image"""
        green_name = f"{self.deployment_name}-green"
        
        # Get current deployment spec
        current_spec = self.run_kubectl([
            "get", "deployment", self.deployment_name, "-o", "yaml"
        ])
        
        # Create green deployment spec
        import yaml
        spec = yaml.safe_load(current_spec)
        spec['metadata']['name'] = green_name
        spec['spec']['template']['spec']['containers'][0]['image'] = new_image
        
        # Add green label
        spec['metadata']['labels']['version'] = 'green'
        spec['spec']['template']['metadata']['labels']['version'] = 'green'
        
        # Write green deployment spec
        with open('/tmp/green-deployment.yaml', 'w') as f:
            yaml.dump(spec, f)
        
        # Apply green deployment
        self.run_kubectl(["apply", "-f", "/tmp/green-deployment.yaml"])
        
        return green_name
    
    def wait_for_deployment(self, deployment_name: str, timeout: int = 300) -> bool:
        """Wait for deployment to be ready"""
        print(f"Waiting for deployment {deployment_name} to be ready...")
        
        try:
            self.run_kubectl([
                "rollout", "status", "deployment", deployment_name,
                f"--timeout={timeout}s"
            ])
            return True
        except:
            return False
    
    def run_health_checks(self, deployment_name: str) -> bool:
        """Run health checks against the deployment"""
        print(f"Running health checks for {deployment_name}...")
        
        # Get pod IPs
        pod_ips = self.run_kubectl([
            "get", "pods", "-l", f"app={deployment_name.replace('-green', '')},version=green",
            "-o", "jsonpath={.items[*].status.podIP}"
        ]).split()
        
        if not pod_ips:
            print("No pods found for health check")
            return False
        
        # Test each pod
        for pod_ip in pod_ips:
            try:
                response = requests.get(f"http://{pod_ip}:8000/health", timeout=10)
                if response.status_code != 200:
                    print(f"Health check failed for pod {pod_ip}: {response.status_code}")
                    return False
            except Exception as e:
                print(f"Health check failed for pod {pod_ip}: {e}")
                return False
        
        print("All health checks passed")
        return True
    
    def switch_traffic(self, green_deployment: str):
        """Switch traffic from blue to green"""
        print("Switching traffic to green deployment...")
        
        # Update service selector to point to green deployment
        self.run_kubectl([
            "patch", "service", self.service_name,
            "-p", '{"spec":{"selector":{"version":"green"}}}'
        ])
        
        print("Traffic switched to green deployment")
    
    def cleanup_blue_deployment(self):
        """Remove the old blue deployment"""
        print("Cleaning up blue deployment...")
        
        # Scale down blue deployment
        self.run_kubectl(["scale", "deployment", self.deployment_name, "--replicas=0"])
        
        # Wait a bit for connections to drain
        time.sleep(30)
        
        # Delete blue deployment
        self.run_kubectl(["delete", "deployment", self.deployment_name])
        
        print("Blue deployment cleaned up")
    
    def promote_green_to_blue(self, green_deployment: str):
        """Promote green deployment to blue"""
        print("Promoting green deployment to blue...")
        
        # Remove version label from green deployment
        self.run_kubectl([
            "patch", "deployment", green_deployment,
            "-p", '{"metadata":{"labels":{"version":null}},"spec":{"template":{"metadata":{"labels":{"version":null}}}}}'
        ])
        
        # Rename green deployment to blue
        self.run_kubectl([
            "patch", "deployment", green_deployment,
            "-p", f'{{"metadata":{{"name":"{self.deployment_name}"}}}}'
        ])
        
        print("Green deployment promoted to blue")
    
    def rollback(self, green_deployment: str):
        """Rollback to blue deployment"""
        print("Rolling back to blue deployment...")
        
        # Switch traffic back to blue
        self.run_kubectl([
            "patch", "service", self.service_name,
            "-p", '{"spec":{"selector":{"version":null}}}'
        ])
        
        # Delete green deployment
        self.run_kubectl(["delete", "deployment", green_deployment])
        
        print("Rollback completed")
    
    def deploy(self, new_image: str) -> bool:
        """Execute blue-green deployment"""
        print(f"Starting blue-green deployment with image: {new_image}")
        
        try:
            # Get current deployment info
            current_info = self.get_current_deployment_info()
            print(f"Current deployment: {current_info}")
            
            # Create green deployment
            green_deployment = self.create_green_deployment(new_image)
            
            # Wait for green deployment to be ready
            if not self.wait_for_deployment(green_deployment):
                print("Green deployment failed to become ready")
                self.rollback(green_deployment)
                return False
            
            # Run health checks
            if not self.run_health_checks(green_deployment):
                print("Health checks failed")
                self.rollback(green_deployment)
                return False
            
            # Switch traffic to green
            self.switch_traffic(green_deployment)
            
            # Wait and monitor
            time.sleep(60)
            
            # Final health check
            if not self.run_health_checks(green_deployment):
                print("Final health checks failed, rolling back")
                self.rollback(green_deployment)
                return False
            
            # Cleanup old deployment
            self.cleanup_blue_deployment()
            
            # Promote green to blue
            self.promote_green_to_blue(green_deployment)
            
            print("Blue-green deployment completed successfully")
            return True
            
        except Exception as e:
            print(f"Deployment failed: {e}")
            try:
                self.rollback(green_deployment)
            except:
                pass
            return False

def main():
    parser = argparse.ArgumentParser(description='Blue-Green Deployment')
    parser.add_argument('--image', required=True, help='New container image')
    parser.add_argument('--namespace', required=True, help='Kubernetes namespace')
    parser.add_argument('--deployment', required=True, help='Deployment name')
    parser.add_argument('--service', help='Service name (defaults to deployment name)')
    
    args = parser.parse_args()
    
    service_name = args.service or args.deployment
    
    deployer = BlueGreenDeployer(
        namespace=args.namespace,
        deployment_name=args.deployment,
        service_name=service_name
    )
    
    success = deployer.deploy(args.image)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
  
  backend "s3" {
    bucket = "myapp-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "terraform"
    }
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "myapp"
}

variable "cluster_version" {
  description = "Kubernetes cluster version"
  type        = string
  default     = "1.28"
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.project_name}-${var.environment}"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b", "${var.aws_region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
  }
  
  public_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/elb" = "1"
  }
  
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = var.cluster_version
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  # Cluster access
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access  = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]
  
  # Node groups
  eks_managed_node_groups = {
    main = {
      min_size     = 1
      max_size     = 10
      desired_size = 3
      
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      
      k8s_labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }
      
      update_config = {
        max_unavailable_percentage = 25
      }
    }
    
    spot = {
      min_size     = 0
      max_size     = 5
      desired_size = 2
      
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "SPOT"
      
      k8s_labels = {
        Environment = var.environment
        NodeGroup   = "spot"
      }
      
      taints = {
        spot = {
          key    = "spot"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }
    }
  }
  
  # aws-auth configmap
  manage_aws_auth_configmap = true
  
  aws_auth_roles = [
    {
      rolearn  = aws_iam_role.eks_admin.arn
      username = "eks-admin"
      groups   = ["system:masters"]
    },
  ]
}

# IAM Role for EKS Admin
resource "aws_iam_role" "eks_admin" {
  name = "${var.project_name}-${var.environment}-eks-admin"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# RDS Database
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.environment == "production" ? "db.t3.medium" : "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true
  
  db_name  = "myapp"
  username = "myapp"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"
  
  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.environment}-redis"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}"
  description                = "Redis cluster for ${var.project_name} ${var.environment}"
  
  node_type            = var.environment == "production" ? "cache.t3.medium" : "cache.t3.micro"
  port                 = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters = var.environment == "production" ? 2 : 1
  
  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name = "${var.project_name}-${var.environment}"
  }
}

# Outputs
output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = module.eks.cluster_name
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}
```

### Helm Charts

```yaml
# charts/myapp/Chart.yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

```yaml
# charts/myapp/values.yaml
replicaCount: 3

image:
  repository: myapp
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext:
  fsGroup: 2000

securityContext:
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000

service:
  type: ClusterIP
  port: 80
  targetPort: 8000

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
  tls: []

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}

# Application configuration
config:
  logLevel: INFO
  maxConnections: 100

# Database configuration
postgresql:
  enabled: true
  auth:
    postgresPassword: "changeme"
    username: "myapp"
    password: "changeme"
    database: "myapp"
  primary:
    persistence:
      enabled: true
      size: 8Gi

# Redis configuration
redis:
  enabled: true
  auth:
    enabled: false
  master:
    persistence:
      enabled: true
      size: 8Gi
```

```yaml
# charts/myapp/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      {{- with .Values.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: LOG_LEVEL
              value: {{ .Values.config.logLevel | quote }}
            - name: MAX_CONNECTIONS
              value: {{ .Values.config.maxConnections | quote }}
            {{- if .Values.postgresql.enabled }}
            - name: DATABASE_URL
              value: "postgresql://{{ .Values.postgresql.auth.username }}:{{ .Values.postgresql.auth.password }}@{{ include "myapp.fullname" . }}-postgresql:5432/{{ .Values.postgresql.auth.database }}"
            {{- end }}
            {{- if .Values.redis.enabled }}
            - name: REDIS_URL
              value: "redis://{{ include "myapp.fullname" . }}-redis-master:6379"
            {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

## Monitoring and Observability

### Prometheus and Grafana Setup

```yaml
# monitoring/prometheus-values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp2
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi
    
    additionalScrapeConfigs:
      - job_name: 'myapp'
        kubernetes_sd_configs:
          - role: endpoints
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: myapp-service
          - source_labels: [__meta_kubernetes_endpoint_port_name]
            action: keep
            regex: metrics

grafana:
  adminPassword: admin123
  
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
      - name: 'default'
        orgId: 1
        folder: ''
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /var/lib/grafana/dashboards/default
  
  dashboards:
    default:
      myapp-dashboard:
        gnetId: 12345
        revision: 1
        datasource: Prometheus

alertmanager:
  config:
    global:
      slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    
    route:
      group_by: ['alertname']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
    
    receivers:
    - name: 'web.hook'
      slack_configs:
      - channel: '#alerts'
        title: 'Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

## Best Practices

### Deployment Checklist

**Pre-Deployment:**
- [ ] Code review completed
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance tests passed
- [ ] Database migrations tested
- [ ] Rollback plan prepared

**During Deployment:**
- [ ] Monitor application metrics
- [ ] Check error rates
- [ ] Verify health checks
- [ ] Monitor resource usage
- [ ] Test critical user flows

**Post-Deployment:**
- [ ] Verify deployment success
- [ ] Run smoke tests
- [ ] Monitor for 24 hours
- [ ] Update documentation
- [ ] Notify stakeholders

### Security Considerations

**Container Security:**
- Use minimal base images
- Run as non-root user
- Scan for vulnerabilities
- Use read-only filesystems
- Implement resource limits

**Kubernetes Security:**
- Use RBAC
- Network policies
- Pod security policies
- Secrets management
- Regular security updates

**Infrastructure Security:**
- VPC isolation
- Security groups
- Encryption at rest and in transit
- Regular patching
- Access logging

---

**Next Topic**: [Consistency and Consensus](consistency_and_consensus.md)
**Previous Topic**: [Performance Optimization](performance_optimization.md)
**Main Index**: [DEV LOGS - System Design](DEV%20LOGS%20-%20System%20Design.md)