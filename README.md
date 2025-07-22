# Mealy - Food Ordering Platform

Mealy is a comprehensive food ordering application that allows customers to order meals and helps food vendors (caterers) manage their meal options and orders.

## 🍽️ Features

### Required Features ✅
1. **User Authentication** - Users can create accounts and log in with JWT-based authentication
2. **Meal Management** - Admin/Caterers can add, modify, and delete meal options
3. **Daily Menu Setup** - Admin/Caterers can set up menus for specific days
4. **Customer Ordering** - Authenticated users can view menus and select meal options
5. **Order Management** - Customers can change meal choices, admins can view orders
6. **Financial Overview** - Admins can see daily revenue
7. **M-Pesa Integration** - Payment processing via M-Pesa

### Extra Features 🚀
1. **Order History** - Customers can view their order history
2. **Notifications** - Users get notified when daily menus are set
3. **Admin Order History** - Complete order management for caterers
4. **Multi-Caterer Support** - Platform supports multiple caterers

## 🛠️ Tech Stack

- **Frontend**: React 18 + Redux Toolkit + TailwindCSS 3
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: M-Pesa Integration
- **State Management**: Redux Toolkit
- **UI Components**: Radix UI + Custom Components
- **Build Tool**: Vite
- **Testing**: Vitest

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- M-Pesa Developer Account (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mealy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb mealy_db
   
   # Run the schema file to create tables
   psql -d mealy_db -f server/database/schema.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

   Required environment variables:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mealy_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # M-Pesa (optional for development)
   MPESA_CONSUMER_KEY=your_key
   MPESA_CONSUMER_SECRET=your_secret
   MPESA_ENVIRONMENT=sandbox
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

### Default Admin Account

After running the schema, you'll have a default admin account:
- **Email**: admin@mealy.com
- **Password**: admin123
- **Role**: Admin

## 📱 User Roles

### Customer
- Register and login
- View daily menus
- Place orders
- Change meal selections
- View order history
- Receive notifications

### Caterer
- Manage meal options (add, edit, delete)
- Set up daily menus
- View and manage orders
- Monitor daily revenue
- Multi-caterer support

### Admin
- All caterer permissions
- Manage multiple caterers
- System-wide oversight
- User management

## 🗄️ Database Schema

### Core Tables
- `users` - User authentication and profiles
- `caterers` - Caterer information (multi-caterer support)
- `meal_options` - Available meal options
- `daily_menus` - Menus set for specific dates
- `menu_meal_options` - Meals included in daily menus
- `orders` - Customer orders
- `notifications` - User notifications

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
POST /api/auth/logout - User logout
```

### Meals Management
```
GET /api/meals/caterer/:catererId - Get meals for caterer
GET /api/meals/:id - Get single meal
POST /api/meals - Create meal (Admin/Caterer)
PUT /api/meals/:id - Update meal (Admin/Caterer)
DELETE /api/meals/:id - Delete meal (Admin/Caterer)
```

### Payment (M-Pesa)
```
POST /api/payments/mpesa/initiate - Initiate payment
GET /api/payments/mpesa/status/:id - Check payment status
POST /api/payments/mpesa/callback - M-Pesa callback
```

## 🎨 Frontend Architecture

### State Management (Redux Toolkit)
- `authSlice` - User authentication state
- `mealsSlice` - Meal options management
- `menusSlice` - Daily menu management
- `ordersSlice` - Order management
- `notificationsSlice` - Notifications

### Component Structure
```
client/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── Layout.jsx    # Main layout wrapper
│   └── ProtectedRoute.jsx # Route protection
├── pages/
│   ├── Index.jsx     # Landing page
│   ├── Login.jsx     # Login page
│   ├── Register.jsx  # Registration page
│   ├── Dashboard.jsx # Customer dashboard
│   └── AdminDashboard.jsx # Admin/Caterer dashboard
├── store/
│   ├── store.js      # Redux store configuration
│   └── slices/       # Redux slices
└── contexts/         # React contexts
```

## 💳 M-Pesa Integration

The application includes comprehensive M-Pesa integration for payment processing:

1. **STK Push** - Initiate payments directly from customer phones
2. **Payment Verification** - Real-time payment status checking
3. **Callback Handling** - Automatic payment confirmation
4. **Transaction Tracking** - Complete payment history

### M-Pesa Setup
1. Register for M-Pesa Developer Account
2. Create a sandbox application
3. Get Consumer Key, Consumer Secret, and Pass Key
4. Configure environment variables
5. Test with sandbox credentials

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Considerations
- Set `NODE_ENV=production`
- Use production database credentials
- Configure production M-Pesa credentials
- Set secure JWT secret
- Enable SSL/HTTPS

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Role-based access control (RBAC)
- Input validation with Zod schemas
- Rate limiting on authentication endpoints
- SQL injection protection with parameterized queries
- Password hashing with bcrypt
- CORS configuration

## 📊 Monitoring & Analytics

- Order tracking and analytics
- Daily revenue reporting
- User activity monitoring
- Payment transaction logs
- Error logging and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Create an issue on GitHub
- Contact the development team

---

**Mealy** - Bringing delicious meals to your doorstep! 🍽️
