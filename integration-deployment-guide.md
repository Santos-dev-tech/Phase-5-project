# 🚀 Mealy - Integration & Deployment Guide

## 📋 Repository Integration Strategy

### 🔄 Communication Between Repositories

#### API Communication
```javascript
// Frontend: API Base URL Configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Backend: CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

#### Environment Synchronization
```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENVIRONMENT=development

# Backend (.env)
FRONTEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
```

### 🔧 Development Setup

#### 1. Clone Both Repositories
```bash
# Create workspace directory
mkdir mealy-workspace
cd mealy-workspace

# Clone repositories
git clone <frontend-repo-url> mealy-frontend
git clone <backend-repo-url> mealy-backend
```

#### 2. Backend Setup First
```bash
cd mealy-backend

# Install dependencies
npm install

# Setup database
createdb mealy_db
npm run setup

# Start backend server
npm run dev  # Runs on http://localhost:3000
```

#### 3. Frontend Setup
```bash
cd ../mealy-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with backend URL

# Start frontend server
npm run dev  # Runs on http://localhost:3001
```

#### 4. Development Workflow
```bash
# Terminal 1: Backend
cd mealy-backend && npm run dev

# Terminal 2: Frontend
cd mealy-frontend && npm run dev

# Terminal 3: Database (if local)
redis-server

# Terminal 4: Python Services (optional)
cd mealy-backend/python-services && python manage.py runserver 8000
```

## 🌐 Deployment Strategies

### 🔹 Strategy 1: Separate Hosting (Recommended)

#### Frontend Deployment (Vercel/Netlify)
```bash
# Frontend on Vercel
cd mealy-frontend
vercel --prod

# Frontend on Netlify
cd mealy-frontend
netlify deploy --prod
```

**Frontend Environment Variables:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENVIRONMENT=production
VITE_FIREBASE_API_KEY=your_production_key
```

#### Backend Deployment (Railway/Render/AWS)
```bash
# Backend on Railway
cd mealy-backend
railway deploy

# Backend on Render
cd mealy-backend
render deploy

# Backend on AWS (with Docker)
docker build -t mealy-backend .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag mealy-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/mealy-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/mealy-backend:latest
```

**Backend Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://user:pass@host:6379
JWT_SECRET=your-production-secret
FRONTEND_URL=https://yourdomain.com
```

### 🔹 Strategy 2: Monorepo Deployment (Alternative)

#### Using Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: ./mealy-frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:3000/api
    depends_on:
      - backend

  backend:
    build: ./mealy-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=http://frontend
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=mealy_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 🔹 Strategy 3: Serverless Deployment

#### Frontend: Static Hosting
```bash
# Build and deploy to S3/CloudFront
cd mealy-frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Backend: Serverless Functions
```bash
# Deploy to Vercel Functions
cd mealy-backend
vercel --prod

# Deploy to AWS Lambda
serverless deploy
```

## 🔒 Security & Configuration

### SSL/TLS Configuration
```nginx
# Nginx configuration for SSL
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://frontend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Security
```bash
# Use environment-specific configurations
# Development
cp .env.development .env

# Staging
cp .env.staging .env

# Production
cp .env.production .env
```

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// Backend: Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV
  });
});

// Frontend: Error Tracking
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENVIRONMENT
});
```

### Logging Strategy
```javascript
// Backend: Structured Logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
        working-directory: ./mealy-backend
      - name: Run tests
        run: npm test
        working-directory: ./mealy-backend
      - name: Deploy to production
        run: npm run deploy
        working-directory: ./mealy-backend
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
        working-directory: ./mealy-frontend
      - name: Build
        run: npm run build
        working-directory: ./mealy-frontend
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          working-directory: ./mealy-frontend
```

## 🌍 Production Environment Setup

### Database Configuration
```sql
-- Production database setup
CREATE DATABASE mealy_production;
CREATE USER mealy_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mealy_production TO mealy_user;

-- Enable necessary extensions
\c mealy_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### Redis Configuration
```bash
# Redis production configuration
# /etc/redis/redis.conf
bind 127.0.0.1 ::1
port 6379
requirepass your_secure_redis_password
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### Load Balancer Configuration
```nginx
# Load balancer for multiple backend instances
upstream backend {
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// Backend: Ensure CORS is properly configured
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### Environment Variables Not Loading
```bash
# Check environment variables are set
echo $VITE_API_BASE_URL  # Frontend
echo $DATABASE_URL       # Backend
```

#### Database Connection Issues
```javascript
// Backend: Test database connection
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
```

### Performance Optimization

#### Frontend Optimizations
```javascript
// Code splitting
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

// Image optimization
import { useState, useEffect } from 'react';

const LazyImage = ({ src, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      style={{ opacity: loaded ? 1 : 0 }}
      {...props}
    />
  );
};
```

#### Backend Optimizations
```javascript
// Database query optimization
const getCachedMenus = async (date) => {
  const cacheKey = `menus:${date}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const menus = await pool.query(
    'SELECT * FROM daily_menus WHERE date = $1',
    [date]
  );
  
  await redis.setex(cacheKey, 3600, JSON.stringify(menus.rows));
  return menus.rows;
};
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Frontend**: CDN distribution, multiple edge locations
- **Backend**: Load balancers, multiple server instances
- **Database**: Read replicas, connection pooling
- **Cache**: Redis clustering, distributed caching

### Vertical Scaling
- **CPU**: Monitor and scale based on usage
- **Memory**: Optimize for memory usage patterns
- **Storage**: SSD for database, efficient file storage

### Auto-scaling Configuration
```yaml
# Kubernetes auto-scaling
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```
