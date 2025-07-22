# 19. Deployment & Production 🚀

> "Shipping is a feature. A feature that needs to be built, tested, and maintained like any other." - Production Philosophy

## 🎯 Learning Objectives

By the end of this chapter, you'll understand:
- Production build optimization and configuration
- Deployment strategies and platforms
- Environment management and configuration
- CI/CD pipelines for React applications
- Monitoring and error tracking in production
- Performance optimization for production
- Security best practices
- Scaling and maintenance strategies

## 🏗️ Production Build Preparation

### Build Optimization

```javascript
// package.json - Production scripts
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx serve -s build",
    "build:profile": "react-scripts build --profile",
    "build:stats": "react-scripts build && npx webpack-bundle-analyzer build/static/js/*.js",
    "preview": "npx serve -s build -l 3000",
    "test:e2e": "cypress run",
    "test:e2e:ci": "start-server-and-test preview http://localhost:3000 test:e2e"
  },
  "homepage": "https://myapp.com"
}
```

### Environment Configuration

```javascript
// .env.production
REACT_APP_API_URL=https://api.myapp.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=$npm_package_version
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
REACT_APP_ANALYTICS_ID=GA-XXXXXXXXX
GENERATE_SOURCEMAP=false

// .env.staging
REACT_APP_API_URL=https://staging-api.myapp.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_VERSION=$npm_package_version
REACT_APP_SENTRY_DSN=https://your-staging-sentry-dsn
GENERATE_SOURCEMAP=true

// .env.development
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=dev
GENERATE_SOURCEMAP=true
```

```jsx
// config/environment.js
const config = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    enableDevTools: true,
    logLevel: 'debug',
    enableMocking: true
  },
  staging: {
    apiUrl: process.env.REACT_APP_API_URL,
    enableDevTools: true,
    logLevel: 'info',
    enableMocking: false
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL,
    enableDevTools: false,
    logLevel: 'error',
    enableMocking: false
  }
};

const environment = process.env.REACT_APP_ENVIRONMENT || 'development';

export default {
  ...config[environment],
  environment,
  version: process.env.REACT_APP_VERSION || 'unknown'
};
```

### Advanced Webpack Configuration

```javascript
// craco.config.js - Custom webpack config with CRACO
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks')
    },
    plugins: {
      add: [
        // Gzip compression
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8
        }),
        
        // Bundle analysis in production
        ...(process.env.ANALYZE === 'true' ? [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-report.html'
          })
        ] : [])
      ]
    },
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // Optimize chunks
        webpackConfig.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              enforce: true
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true
            }
          }
        };
        
        // Remove console logs in production
        webpackConfig.optimization.minimizer[0].options.terserOptions.compress.drop_console = true;
      }
      
      return webpackConfig;
    }
  },
  
  // PWA configuration
  plugins: [
    {
      plugin: require('craco-workbox'),
      options: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.myapp\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400 // 24 hours
              }
            }
          }
        ]
      }
    }
  ]
};
```

## 🌐 Deployment Platforms

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|svg|gif|woff|woff2)$)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "env": {
    "REACT_APP_ENVIRONMENT": "production"
  }
}
```

### Netlify Deployment

```toml
# netlify.toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  REACT_APP_ENVIRONMENT = "production"
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://api.myapp.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### AWS S3 + CloudFront Deployment

```yaml
# deploy-aws.yml (GitHub Actions)
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
        REACT_APP_ENVIRONMENT: production
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to S3
      run: |
        aws s3 sync build/ s3://${{ secrets.S3_BUCKET }} --delete
        aws s3 cp build/index.html s3://${{ secrets.S3_BUCKET }}/index.html --cache-control "no-cache"
    
    - name: Invalidate CloudFront
      run: |
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

### Docker Deployment

```dockerfile
# Dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Cache static assets
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
            
            # Don't cache the main HTML file
            location = /index.html {
                add_header Cache-Control "no-cache, no-store, must-revalidate";
                add_header Pragma "no-cache";
                add_header Expires "0";
            }
        }
        
        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  CACHE_KEY: node-modules

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Run E2E tests
      run: |
        npm run build
        npm run test:e2e:ci
    
    - name: Upload E2E artifacts
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: cypress/screenshots
  
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Run security audit
      run: npm audit --audit-level=high
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test, security]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        REACT_APP_VERSION: ${{ github.sha }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: build/
        retention-days: 30
  
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: build/
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Add your staging deployment commands here
  
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: build/
    
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # Add your production deployment commands here
    
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

## 📊 Production Monitoring

### Error Tracking with Sentry

```jsx
// src/utils/errorTracking.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import config from '../config/environment';

// Initialize Sentry
if (config.environment === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: config.environment,
    release: config.version,
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [config.apiUrl],
      }),
    ],
    tracesSampleRate: 0.1, // 10% of transactions
    beforeSend(event, hint) {
      // Filter out development errors
      if (config.environment === 'development') {
        console.error('Sentry Event:', event, hint);
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'error') {
        return breadcrumb;
      }
      if (breadcrumb.category === 'navigation') {
        return breadcrumb;
      }
      return null;
    }
  });
}

// Error boundary with Sentry integration
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: ({ error, resetError }) => (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>We've been notified about this error.</p>
        <button onClick={resetError}>Try again</button>
        {config.environment === 'development' && (
          <details>
            <summary>Error details</summary>
            <pre>{error.toString()}</pre>
          </details>
        )}
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
    }
  }
);

// Custom error logging
export const logError = (error, context = {}) => {
  if (config.environment === 'production') {
    Sentry.withScope((scope) => {
      Object.keys(context).forEach(key => {
        scope.setContext(key, context[key]);
      });
      Sentry.captureException(error);
    });
  } else {
    console.error('Error:', error, context);
  }
};

// Performance monitoring
export const startTransaction = (name, op = 'navigation') => {
  if (config.environment === 'production') {
    return Sentry.startTransaction({ name, op });
  }
  return {
    finish: () => {},
    setTag: () => {},
    setData: () => {}
  };
};
```

### Analytics Integration

```jsx
// src/utils/analytics.js
import config from '../config/environment';

class Analytics {
  constructor() {
    this.isEnabled = config.environment === 'production';
    this.queue = [];
    
    if (this.isEnabled) {
      this.initializeGA();
    }
  }
  
  initializeGA() {
    // Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_ANALYTICS_ID}`;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', process.env.REACT_APP_ANALYTICS_ID, {
      page_title: document.title,
      page_location: window.location.href
    });
  }
  
  track(eventName, properties = {}) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', eventName, properties);
      return;
    }
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: properties.category || 'General',
        event_label: properties.label,
        value: properties.value,
        ...properties
      });
    }
    
    // Custom analytics endpoint
    this.sendToCustomAnalytics(eventName, properties);
  }
  
  page(path, title) {
    if (!this.isEnabled) {
      console.log('Analytics Page (dev):', path, title);
      return;
    }
    
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_ANALYTICS_ID, {
        page_path: path,
        page_title: title
      });
    }
  }
  
  identify(userId, traits = {}) {
    if (!this.isEnabled) {
      console.log('Analytics Identify (dev):', userId, traits);
      return;
    }
    
    if (window.gtag) {
      window.gtag('config', process.env.REACT_APP_ANALYTICS_ID, {
        user_id: userId
      });
    }
  }
  
  async sendToCustomAnalytics(eventName, properties) {
    try {
      await fetch(`${config.apiUrl}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            version: config.version
          }
        })
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

export default new Analytics();

// React hook for analytics
export function useAnalytics() {
  const track = useCallback((eventName, properties) => {
    analytics.track(eventName, properties);
  }, []);
  
  const page = useCallback((path, title) => {
    analytics.page(path, title);
  }, []);
  
  const identify = useCallback((userId, traits) => {
    analytics.identify(userId, traits);
  }, []);
  
  return { track, page, identify };
}
```

### Performance Monitoring

```jsx
// src/utils/performanceMonitoring.js
import config from '../config/environment';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.isEnabled = config.environment === 'production';
    
    if (this.isEnabled) {
      this.initializeWebVitals();
      this.setupPerformanceObserver();
    }
  }
  
  async initializeWebVitals() {
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
    
    getCLS(this.sendMetric.bind(this));
    getFID(this.sendMetric.bind(this));
    getFCP(this.sendMetric.bind(this));
    getLCP(this.sendMetric.bind(this));
    getTTFB(this.sendMetric.bind(this));
  }
  
  setupPerformanceObserver() {
    // Long tasks observer
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.sendMetric({
            name: 'long-task',
            value: entry.duration,
            id: `long-task-${Date.now()}`
          });
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }
  
  sendMetric(metric) {
    if (!this.isEnabled) {
      console.log('Performance Metric (dev):', metric);
      return;
    }
    
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta
      });
    }
    
    // Send to custom endpoint
    this.sendToCustomEndpoint(metric);
  }
  
  async sendToCustomEndpoint(metric) {
    try {
      await fetch(`${config.apiUrl}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...metric,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          version: config.version
        })
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }
  
  // Custom performance measurements
  mark(name) {
    if (performance.mark) {
      performance.mark(name);
    }
  }
  
  measure(name, startMark, endMark) {
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure) {
        this.sendMetric({
          name: `custom-${name}`,
          value: measure.duration,
          id: `custom-${name}-${Date.now()}`
        });
      }
    }
  }
}

export default new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const mark = useCallback((name) => {
    performanceMonitor.mark(name);
  }, []);
  
  const measure = useCallback((name, startMark, endMark) => {
    performanceMonitor.measure(name, startMark, endMark);
  }, []);
  
  return { mark, measure };
}
```

## 🔒 Security Best Practices

### Content Security Policy

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Security headers -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.myapp.com https://www.google-analytics.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  ">
  
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  
  <title>My React App</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
```

### Environment Variable Security

```jsx
// src/utils/security.js

// Sanitize environment variables
export const sanitizeEnvVars = () => {
  const allowedVars = [
    'REACT_APP_API_URL',
    'REACT_APP_ENVIRONMENT',
    'REACT_APP_VERSION'
  ];
  
  const sanitized = {};
  
  allowedVars.forEach(varName => {
    if (process.env[varName]) {
      sanitized[varName] = process.env[varName];
    }
  });
  
  return sanitized;
};

// Validate API responses
export const validateApiResponse = (response, schema) => {
  // Implement response validation logic
  // Use libraries like Joi or Yup for schema validation
  return response;
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>"'&]/g, (match) => {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
};

// Rate limiting for API calls
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    
    // Remove old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

export const apiRateLimiter = new RateLimiter();
```

## 🎯 Production Checklist

### Pre-Deployment Checklist

```markdown
## 🚀 Production Deployment Checklist

### Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage above threshold (80%+)
- [ ] No console.log statements in production code
- [ ] No TODO/FIXME comments for critical issues
- [ ] Code reviewed and approved
- [ ] TypeScript errors resolved
- [ ] ESLint warnings addressed

### Performance
- [ ] Bundle size analyzed and optimized
- [ ] Images optimized and compressed
- [ ] Lazy loading implemented for routes
- [ ] Code splitting configured
- [ ] Service worker configured (if PWA)
- [ ] Caching strategies implemented

### Security
- [ ] Environment variables properly configured
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependencies audited for vulnerabilities

### Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Performance monitoring setup
- [ ] Health check endpoints working
- [ ] Logging configured

### Infrastructure
- [ ] Domain and SSL certificate configured
- [ ] CDN configured for static assets
- [ ] Backup and disaster recovery plan
- [ ] Monitoring and alerting setup
- [ ] Load balancing configured (if needed)

### Documentation
- [ ] Deployment documentation updated
- [ ] API documentation current
- [ ] Environment setup documented
- [ ] Troubleshooting guide available
```

### Post-Deployment Monitoring

```jsx
// src/utils/healthCheck.js
export class HealthChecker {
  constructor() {
    this.checks = new Map();
    this.interval = null;
  }
  
  addCheck(name, checkFunction, interval = 30000) {
    this.checks.set(name, {
      fn: checkFunction,
      interval,
      lastRun: null,
      status: 'unknown'
    });
  }
  
  async runCheck(name) {
    const check = this.checks.get(name);
    if (!check) return null;
    
    try {
      const result = await check.fn();
      check.status = 'healthy';
      check.lastRun = new Date();
      return { name, status: 'healthy', result };
    } catch (error) {
      check.status = 'unhealthy';
      check.lastRun = new Date();
      return { name, status: 'unhealthy', error: error.message };
    }
  }
  
  async runAllChecks() {
    const results = [];
    
    for (const [name] of this.checks) {
      const result = await this.runCheck(name);
      results.push(result);
    }
    
    return results;
  }
  
  startMonitoring() {
    this.interval = setInterval(async () => {
      const results = await this.runAllChecks();
      const unhealthy = results.filter(r => r.status === 'unhealthy');
      
      if (unhealthy.length > 0) {
        console.warn('Health check failures:', unhealthy);
        // Send alerts
      }
    }, 60000); // Check every minute
  }
  
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// Setup health checks
const healthChecker = new HealthChecker();

// API health check
healthChecker.addCheck('api', async () => {
  const response = await fetch(`${config.apiUrl}/health`);
  if (!response.ok) {
    throw new Error(`API health check failed: ${response.status}`);
  }
  return response.json();
});

// Local storage check
healthChecker.addCheck('localStorage', () => {
  const testKey = '__test__';
  localStorage.setItem(testKey, 'test');
  const value = localStorage.getItem(testKey);
  localStorage.removeItem(testKey);
  
  if (value !== 'test') {
    throw new Error('localStorage not working');
  }
  
  return { available: true };
});

// Performance check
healthChecker.addCheck('performance', () => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const loadTime = navigation.loadEventEnd - navigation.fetchStart;
  
  if (loadTime > 5000) {
    throw new Error(`Slow page load: ${loadTime}ms`);
  }
  
  return { loadTime };
});

export default healthChecker;
```

## 🎯 Key Production Takeaways

### 1. Build Optimization
- Minimize bundle size with code splitting
- Optimize assets (images, fonts, etc.)
- Enable compression (gzip/brotli)
- Configure caching strategies

### 2. Deployment Strategy
- Use CI/CD pipelines for automated deployments
- Implement blue-green or rolling deployments
- Have rollback strategies in place
- Test deployments in staging first

### 3. Monitoring & Observability
- Set up error tracking and alerting
- Monitor performance metrics
- Track user analytics
- Implement health checks

### 4. Security
- Configure security headers
- Implement Content Security Policy
- Audit dependencies regularly
- Sanitize user inputs

### 5. Maintenance
- Keep dependencies updated
- Monitor for security vulnerabilities
- Regular performance audits
- Backup and disaster recovery plans

---

**Congratulations!** 🎉 You've completed the comprehensive React.js learning journey! You now have the knowledge and tools to build, test, optimize, and deploy production-ready React applications. Keep practicing, stay updated with the React ecosystem, and continue building amazing user experiences!