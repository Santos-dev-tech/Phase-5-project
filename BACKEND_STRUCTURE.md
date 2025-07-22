# 🔧 Mealy Backend File Structure

## 📁 Current Project Structure

```
server/                              # Node.js Express backend
├── database/                        # Database configuration and utilities
│   └── db.js                       # PostgreSQL connection and setup
├── middleware/                      # Express middleware
│   └── auth.js                     # JWT authentication middleware
├── routes/                         # API route handlers
│   ├── auth.js                     # Authentication routes (JWT-based)
│   ├── demo.js                     # Demo/testing routes
│   ├── meals.js                    # Meal management routes
│   ├── mealy.js                    # Legacy Mealy API routes
│   ├── payments.js                 # M-Pesa payment routes
│   └── payments-fixed.js           # Fixed payment implementation
├── services/                       # Business logic services
│   ├── mpesa.js                    # M-Pesa integration service
│   └── mpesa-live.js               # Live M-Pesa service
├── index.js                        # Express app configuration
├── node-build.js                   # Production build entry point
└── payment-status-override.js      # Payment status utilities

api/                                 # Serverless functions
├── auth/
│   └── [action].js                 # Dynamic auth endpoints
├── menu/
│   └── today.js                    # Today's menu endpoint
├── orders/
│   └── index.js                    # Order management endpoints
├── payments/
│   └── [...slug].js                # Dynamic payment endpoints
└── index.js                        # Main serverless entry point

backend/                            # Python Django backend
├── mealy/                          # Django project configuration
│   ├── __init__.py
│   ├── asgi.py                     # ASGI application
│   ├── urls.py                     # URL configuration
│   └─��� wsgi.py                     # WSGI application
├── restaurant/                     # Restaurant app
│   ├── __init__.py
│   ├── admin.py                    # Django admin configuration
│   ├── apps.py                     # App configuration
│   └── models.py                   # Data models
├── manage.py                       # Django management script
└── requirements.txt                # Python dependencies

shared/                             # Shared utilities
└── api.js                          # Shared API utilities

netlify/functions/                  # Netlify serverless functions
└── api.js                          # Netlify function handler
```

## 📦 Node.js Backend Structure

### Core Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2", // Web framework
    "cors": "^2.8.5", // Cross-origin resource sharing
    "dotenv": "^16.3.1", // Environment variables
    "pg": "^8.11.3", // PostgreSQL client
    "jsonwebtoken": "^9.0.2", // JWT authentication
    "bcryptjs": "^2.4.3", // Password hashing
    "zod": "^3.23.8", // Schema validation
    "express-rate-limit": "^7.1.5", // Rate limiting
    "firebase": "^11.10.0" // Firebase integration
  }
}
```

### Server Configuration (`server/index.js`)

```javascript
// Express app factory
export function createServer() {
  const app = express();

  // Middleware stack
  app.use(cors());
  app.use(express.json());
  app.use(rateLimit());

  // Route handlers
  app.use("/api/auth", authRoutes);
  app.use("/api/meals", mealsRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);

  return app;
}
```

## 🗄️ Database Architecture

### PostgreSQL Schema

```sql
-- Core tables
users              # User authentication and profiles
caterers           # Caterer information and settings
meal_options       # Available meal options
daily_menus        # Menus for specific dates
orders             # Customer orders
payments           # Payment transactions
notifications      # User notifications

-- Junction tables
menu_meal_options  # Many-to-many: menus ↔ meals
order_meals        # Many-to-many: orders ↔ meals
```

### Database Connection (`server/database/db.js`)

```javascript
// PostgreSQL connection setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export { pool };
```

## 🛣️ API Route Structure

### Authentication Routes (`server/routes/auth.js`)

```javascript
POST / api / auth / register; // User registration
POST / api / auth / login; // User login
POST / api / auth / refresh; // Token refresh
POST / api / auth / logout; // User logout
GET / api / auth / profile; // Get user profile
PUT / api / auth / profile; // Update user profile
```

### Meal Management Routes (`server/routes/meals.js`)

```javascript
GET    /api/meals              // Get all meals
POST   /api/meals              // Create new meal
GET    /api/meals/:id          // Get specific meal
PUT    /api/meals/:id          // Update meal
DELETE /api/meals/:id          // Delete meal
```

### Order Routes (`server/routes/orders.js`)

```javascript
POST   /api/orders             // Place new order
GET    /api/orders             // Get user orders
GET    /api/orders/:id         // Get specific order
PUT    /api/orders/:id/status  // Update order status
DELETE /api/orders/:id         // Cancel order
```

### Payment Routes (`server/routes/payments.js`)

```javascript
POST   /api/payments/mpesa/initiate     // Initiate M-Pesa payment
GET    /api/payments/mpesa/status/:id   // Check payment status
POST   /api/payments/mpesa/callback     // M-Pesa callback
POST   /api/payments/mpesa/verify       // Verify payment
GET    /api/payments/transactions       // Get payment history
```

## 🔐 Authentication & Security

### JWT Middleware (`server/middleware/auth.js`)

```javascript
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};
```

### Security Features

- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **CORS Configuration**: Cross-origin request control
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries

## 💳 Payment Integration

### M-Pesa Service (`server/services/mpesa.js`)

```javascript
class MpesaService {
  constructor() {
    this.environment = process.env.MPESA_ENVIRONMENT;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    this.passKey = process.env.MPESA_PASS_KEY;
  }

  async initiatePayment(amount, phoneNumber, accountReference) {
    // STK Push implementation
  }

  async checkPaymentStatus(checkoutRequestId) {
    // Payment status check
  }
}
```

### Payment Flow

1. **Initiate Payment**: STK Push to customer phone
2. **Customer Authorization**: Customer enters M-Pesa PIN
3. **Callback Processing**: M-Pesa sends payment result
4. **Status Verification**: Backend verifies payment
5. **Order Confirmation**: Order status updated

## 🐍 Python Django Backend

### Django Project Structure (`backend/`)

```python
# Settings configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### Django Models (`backend/restaurant/models.py`)

```python
class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    available = models.BooleanField(default=True)
```

## ☁️ Serverless Functions

### Netlify Functions (`netlify/functions/api.js`)

```javascript
exports.handler = serverless(app);
```

### Vercel Functions (`api/`)

- Dynamic route handling
- Edge runtime support
- Auto-scaling capabilities
- Global CDN distribution

## 🔧 Configuration Files

### Environment Variables (`.env.example`)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mealy_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_ENVIRONMENT=sandbox
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASS_KEY=your_pass_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Frontend Configuration
FRONTEND_URL=http://localhost:8080
```

### Build Configuration

#### Vite Server Config (`vite.config.server.js`)

```javascript
export default defineConfig({
  build: {
    ssr: true,
    target: "node18",
    outDir: "dist/server",
    rollupOptions: {
      input: "server/node-build.js",
      output: {
        format: "es",
        entryFileNames: "node-build.mjs",
      },
    },
  },
});
```

## 📊 API Documentation

### Health Check Endpoints

```javascript
GET / api / health; // Server health status
GET / api / ping; // Simple ping response
```

### Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Deployment Architecture

### Production Build

```bash
npm run build                  # Build client and server
npm run build:client          # Build frontend SPA
npm run build:server          # Build server SSR
npm start                     # Start production server
```

### Deployment Targets

- **Vercel**: Full-stack deployment with serverless functions
- **Netlify**: JAMstack deployment with edge functions
- **Traditional VPS**: PM2 + Nginx setup
- **Docker**: Containerized deployment

### Static File Serving

```javascript
// Serve built SPA files
app.use(express.static(path.join(__dirname, "../spa")));

// Handle React Router
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "../spa/index.html"));
  }
});
```

## 🔍 Monitoring & Logging

### Request Logging

```javascript
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Error tracking
app.use((err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  next(err);
});
```

### Performance Monitoring

- Request timing
- Database query performance
- Memory usage tracking
- Error rate monitoring

## 🧪 Testing Strategy

### API Testing

```javascript
// Jest + Supertest
describe("Auth API", () => {
  test("POST /api/auth/login", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
```

### Database Testing

- Test database setup
- Transaction rollback
- Seed data management
- Migration testing

## 🚀 Scalability Considerations

### Horizontal Scaling

- Stateless server design
- Load balancer ready
- Database connection pooling
- Session management

### Caching Strategy

- Database query caching
- API response caching
- Static asset caching
- CDN integration

### Performance Optimizations

- Database indexing
- Query optimization
- Connection pooling
- Memory management
