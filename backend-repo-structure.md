# 🔧 Mealy Backend Repository Structure

## 📁 Root Structure

```
mealy-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js     # Authentication logic
│   │   ├── meals.controller.js    # Meal management
│   │   ├── menus.controller.js    # Daily menu management
│   │   ├── orders.controller.js   # Order processing
│   │   ├── payments.controller.js # Payment processing
│   │   ├── users.controller.js    # User management
│   │   └── admin.controller.js    # Admin operations
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT authentication
│   │   ├── validation.middleware.js # Input validation
│   │   ├── rateLimit.middleware.js # Rate limiting
│   ���   ├── cors.middleware.js     # CORS configuration
│   │   ├── error.middleware.js    # Error handling
│   │   └── logging.middleware.js  # Request logging
│   ├── routes/
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── meals.routes.js        # Meal management routes
│   │   ├── menus.routes.js        # Menu routes
│   │   ├── orders.routes.js       # Order routes
│   │   ├── payments.routes.js     # Payment routes
│   │   ├── users.routes.js        # User management routes
│   │   ├── admin.routes.js        # Admin routes
│   │   └── index.routes.js        # Route aggregation
│   ├── services/
│   │   ├── auth.service.js        # Authentication business logic
│   │   ├── meals.service.js       # Meal operations
│   │   ├── orders.service.js      # Order processing
│   │   ├── payments/
│   │   │   ├── mpesa.service.js   # M-Pesa integration
│   │   │   ├── mpesa-live.service.js # Live M-Pesa
│   │   │   └── payment.service.js # General payment logic
│   │   ├── notification.service.js # Notifications
│   │   ├── email.service.js       # Email service
│   │   ���── cache.service.js       # Redis caching
│   ├── models/
│   │   ├── user.model.js          # User data model
│   │   ├── meal.model.js          # Meal data model
│   │   ├── order.model.js         # Order data model
│   │   ├── payment.model.js       # Payment data model
│   │   └── caterer.model.js       # Caterer data model
│   ├── database/
│   │   ├── connection.js          # Database connection
│   │   ├── migrations/
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_caterers.sql
│   │   │   ├── 003_create_meals.sql
│   │   │   ├── 004_create_menus.sql
│   │   │   ├── 005_create_orders.sql
│   │   │   ├── 006_create_payments.sql
│   │   │   └── 007_create_notifications.sql
│   │   ├── seeds/
│   │   │   ├── users.seed.js
│   │   │   ├── meals.seed.js
│   │   │   └── caterers.seed.js
│   │   └── schema.sql             # Complete database schema
│   ├── utils/
│   │   ├── logger.js              # Winston logger configuration
│   │   ├── validators.js          # Zod validation schemas
│   │   ├── crypto.js              # Password hashing utilities
│   │   ├── jwt.js                 # JWT utilities
│   │   ├── dateHelpers.js         # Date manipulation
│   │   └── responseHelpers.js     # Standardized API responses
│   ├── config/
│   │   ├── database.config.js     # Database configuration
│   │   ├── redis.config.js        # Redis configuration
│   │   ├── jwt.config.js          # JWT configuration
│   │   ├── mpesa.config.js        # M-Pesa configuration
│   │   └── app.config.js          # General app configuration
│   └── app.js                     # Express app configuration
├── api/                           # Serverless functions
│   ├── auth/
│   │   └── [action].js           # Auth serverless functions
│   ├── menu/
│   │   └── today.js              # Menu serverless functions
│   ├── orders/
│   │   └── index.js              # Orders serverless functions
│   ├── payments/
│   │   └── [...slug].js          # Payment serverless functions
│   └── index.js                  # Main serverless entry
├── python-services/              # Django/Python microservice
│   ├── mealy/
│   │   ├── __init__.py
│   │   ├── settings.py           # Django settings
│   │   ├── urls.py               # URL configuration
│   │   ├── wsgi.py               # WSGI application
│   │   └── asgi.py               # ASGI application
│   ├── restaurant/
│   │   ├── __init__.py
│   │   ├── models.py             # Django models
│   │   ├── views.py              # API views
│   │   ├── serializers.py        # DRF serializers
│   │   ├── urls.py               # Restaurant URLs
│   │   ├── admin.py              # Django admin
│   │   └── apps.py               # App configuration
│   ├── analytics/
│   │   ├── __init__.py
│   │   ├── models.py             # Analytics models
│   │   ├── views.py              # Analytics views
│   │   └── tasks.py              # Celery tasks
│   ├── notifications/
│   │   ├── __init__.py
│   │   ├── models.py             # Notification models
│   │   ├── services.py           # Notification services
│   │   └── tasks.py              # Background tasks
│   ├── requirements.txt          # Python dependencies
│   └── manage.py                 # Django management
├── tests/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── orders.test.js
│   │   └── payments.test.js
│   ├── e2e/
│   │   └── api.test.js
│   ├── fixtures/
│   │   ├── users.json
│   │   ├── meals.json
│   │   └── orders.json
│   └── helpers/
│       ├── testDb.js
│       └── mockData.js
├── scripts/
│   ├── setup-database.js         # Database setup script
│   ├── seed-data.js              # Data seeding
│   ├── migrate.js                # Database migrations
│   └── deploy.js                 # Deployment scripts
├── docs/
│   ├── API.md                    # API documentation
│   ├── DATABASE.md               # Database schema docs
│   ├── DEPLOYMENT.md             # Deployment guide
│   └── DEVELOPMENT.md            # Development setup
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment variables
├── .env.production               # Production environment variables
├── .gitignore
├── package.json
├── package-lock.json
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose for development
├── docker-compose.prod.yml       # Docker Compose for production
├── server.js                     # Main server entry point
├── jest.config.js                # Jest test configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── nodemon.json                  # Nodemon configuration
└── README.md
```

## 📦 Key Dependencies (package.json)

### Production Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "redis": "^5.0.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.8",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "node-cron": "^3.0.3",
    "axios": "^1.6.0",
    "multer": "^1.4.5",
    "sharp": "^0.32.6",
    "nodemailer": "^6.9.7",
    "express-validator": "^7.0.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/node": "^20.8.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.3",
    "husky": "^8.0.3",
    "lint-staged": "^15.0.2"
  }
}
```

### Python Dependencies (requirements.txt)

```
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
python-decouple==3.8
requests==2.31.0
gunicorn==21.2.0
psycopg2-binary==2.9.9
pillow==10.1.0
django-environ==0.11.2
celery==5.3.4
redis==5.0.1
django-extensions==3.2.3
django-debug-toolbar==4.2.0
```

## 🚀 Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed-data.js",
    "setup": "node scripts/setup-database.js",
    "build": "echo 'Build complete'",
    "docker:build": "docker build -t mealy-backend .",
    "docker:run": "docker run -p 3000:3000 mealy-backend",
    "docker:dev": "docker-compose up",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up"
  }
}
```

## 🔧 Configuration Files

### Environment Variables (.env.example)

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mealy_db
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:password@localhost:5432/mealy_db

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_ENVIRONMENT=sandbox
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASS_KEY=your_pass_key
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5MB

# Python Services
PYTHON_SERVICE_URL=http://localhost:8000
```

### Docker Configuration (Dockerfile)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Docker Compose (docker-compose.yml)

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=mealy_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  python-service:
    build: ./python-services
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    volumes:
      - ./python-services:/app

volumes:
  postgres_data:
```

## 🗄️ Database Architecture

### PostgreSQL Schema

- **users**: User authentication and profiles
- **caterers**: Caterer information and settings
- **meal_options**: Available meal options
- **daily_menus**: Menus for specific dates
- **menu_meal_options**: Junction table for menu-meal relationships
- **orders**: Customer orders
- **payments**: Payment transactions
- **notifications**: User notifications

### Redis Usage

- **Session storage**: User sessions and JWT blacklist
- **Caching**: Frequently accessed data
- **Rate limiting**: API rate limiting data
- **Queue management**: Background job queues

## 🔐 Security Features

- **JWT authentication** with refresh tokens
- **Rate limiting** on all endpoints
- **Input validation** with Zod schemas
- **SQL injection protection** with parameterized queries
- **Password hashing** with bcrypt
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Request logging** with Winston
- **Environment variable validation**

## 🧪 Testing Strategy

- **Unit tests**: Controller and service logic
- **Integration tests**: Database operations
- **E2E tests**: Complete API workflows
- **Load testing**: Performance validation
- **Security testing**: Vulnerability scanning

## 📊 Monitoring & Logging

- **Winston logging** with structured logs
- **Request/response logging** with Morgan
- **Error tracking** and reporting
- **Performance monitoring**
- **Health check endpoints**
- **Metrics collection**

## 🔄 Background Jobs

- **Email sending**: Async email processing
- **Notification delivery**: Push notifications
- **Data cleanup**: Periodic cleanup tasks
- **Report generation**: Automated reports
- **Payment verification**: Async payment checks

## 🚀 Deployment Options

- **Traditional servers**: PM2 + Nginx
- **Containerized**: Docker + Kubernetes
- **Serverless**: Vercel, Netlify Functions
- **Cloud platforms**: AWS, Google Cloud, Azure
- **Database hosting**: AWS RDS, Google Cloud SQL
