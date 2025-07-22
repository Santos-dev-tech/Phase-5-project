# 🎨 Mealy Frontend Repository Structure

## 📁 Root Structure
```
mealy-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components (Radix UI)
│   │   │   ├── accordion.jsx
│   │   │   ├── alert-dialog.jsx
│   │   │   ├── avatar.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── checkbox.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── form.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── progress.jsx
│   │   │   ├── radio-group.jsx
│   │   │   ├── select.jsx
│   │   │   ├── separator.jsx
│   │   │   ├── sheet.jsx
│   │   │   ├── sidebar.jsx
│   │   │   ├── switch.jsx
│   │   │   ├── table.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   ├── toast.jsx
│   │   │   ├── toaster.jsx
│   │   │   └── tooltip.jsx
│   │   ├── layout/
│   │   │   ├── Layout.jsx         # Main layout wrapper
│   │   │   ├── Navigation.jsx     # Navigation components
│   │   │   └── Sidebar.jsx        # Sidebar component
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── payments/
│   │   │   │   ├── MpesaPayment.jsx
│   │   │   │   └── PaymentStatus.jsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderForm.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   └── OrderStatus.jsx
│   │   │   └── admin/
│   │   │       ├── MealManagement.jsx
│   │   │       ├── MenuSetup.jsx
│   │   │       └── OrderManagement.jsx
│   │   └── debug/
│   │       └── FirebaseDebug.jsx  # Development debugging
│   ├── pages/
│   │   ├── Index.jsx              # Landing page
│   │   ├── Login.jsx              # Login page
│   │   ├── Register.jsx           # Registration page
│   │   ├── Dashboard.jsx          # Customer dashboard
│   │   ├── AdminDashboard.jsx     # Admin/Caterer dashboard
│   │   └── NotFound.jsx           # 404 page
│   ├── store/
│   │   ├── store.js               # Redux store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.js       # Authentication state
│   │   │   ├── mealsSlice.js      # Meal options management
│   │   │   ├── menusSlice.js      # Daily menu management
│   │   │   ├── ordersSlice.js     # Order management
│   │   │   └── notificationsSlice.js # Notifications
│   │   └── middleware/
│   │       └── apiMiddleware.js   # API middleware
│   ├── contexts/
│   │   ├── AppContext.jsx         # Global app context
│   │   └── ThemeContext.jsx       # Theme management
│   ├── hooks/
│   │   ├── use-mobile.jsx         # Mobile detection hook
│   │   ├── use-toast.js           # Toast notifications
│   │   ├── useAuth.js             # Authentication hook
│   │   ├── useApi.js              # API calls hook
│   │   └── useLocalStorage.js     # Local storage hook
│   ├── lib/
│   │   ├── utils.js               # Utility functions
│   │   ├── api.js                 # API client configuration
│   │   ├── firebase.js            # Firebase configuration
│   │   └── constants.js           # App constants
│   ├── styles/
│   │   ├── global.css             # Global styles with Tailwind
│   │   └── components.css         # Component-specific styles
│   ├── utils/
│   │   ├── formatters.js          # Data formatting utilities
│   │   ├── validators.js          # Form validation
│   │   └── auth.js                # Auth helpers
│   └── types/
│       ├── auth.js                # Auth type definitions
│       ├── meals.js               # Meal type definitions
│       └── orders.js              # Order type definitions
├── public/
│   ├─�� favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── assets/
│       └── images/
├── docs/
│   ├── API.md                     # API documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   └── DEVELOPMENT.md             # Development setup
├── tests/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
├── .env.example                   # Environment variables template
├── .env.local                     # Local environment variables
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── components.json                # Shadcn/ui configuration
├── vitest.config.js               # Test configuration
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
└── README.md
```

## 📦 Key Dependencies (package.json)

### Production Dependencies
- **react**: ^18.3.1
- **react-dom**: ^18.3.1
- **react-router-dom**: ^6.26.2
- **@reduxjs/toolkit**: ^2.0.1
- **react-redux**: ^9.0.4
- **@tanstack/react-query**: ^5.56.2
- **firebase**: ^11.10.0
- **zod**: ^3.23.8
- **react-hook-form**: ^7.53.0
- **@hookform/resolvers**: ^3.9.0
- **framer-motion**: ^12.6.2
- **next-themes**: ^0.3.0
- **sonner**: ^1.5.0
- **date-fns**: ^3.6.0

### UI Library Dependencies
- **@radix-ui/react-***: All Radix UI components
- **lucide-react**: ^0.462.0
- **tailwindcss**: ^3.4.11
- **class-variance-authority**: ^0.7.1
- **clsx**: ^2.1.1
- **tailwind-merge**: ^2.5.2

### Development Dependencies
- **vite**: ^6.2.2
- **@vitejs/plugin-react-swc**: ^3.5.0
- **vitest**: ^3.1.4
- **tailwindcss-animate**: ^1.0.7
- **autoprefixer**: ^10.4.21
- **postcss**: ^8.5.6

## 🚀 Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext js,jsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

## 🔧 Configuration Files

### Environment Variables (.env.example)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_ENVIRONMENT=development

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# M-Pesa Configuration (for frontend display)
VITE_MPESA_ENVIRONMENT=sandbox
```

### Vite Configuration (vite.config.js)
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

## 🎨 Styling Configuration

### Tailwind Config (tailwind.config.js)
- Pre-configured with custom color scheme
- Includes Mealy brand colors (orange, green)
- Dark mode support
- Custom animations and keyframes
- Radix UI integration

### Global Styles (src/styles/global.css)
- Tailwind base, components, utilities
- CSS custom properties for theming
- Dark/light mode variables
- Custom component styles

## 🧩 Architecture Patterns

### State Management
- **Redux Toolkit** for global state
- **React Query** for server state
- **Context API** for theme and app-wide state
- **Local Storage** hooks for persistence

### Component Architecture
- **Atomic Design**: ui components → feature components → pages
- **Compound Components**: For complex UI patterns
- **Render Props**: For reusable logic
- **Custom Hooks**: For stateful logic extraction

### Routing Strategy
- **React Router v6** with data loading
- **Protected Routes** with authentication guards
- **Layout Routes** for consistent UI structure
- **Error Boundaries** for graceful error handling

## 🔐 Security Features
- **Environment variable validation**
- **Input sanitization**
- **XSS protection**
- **CSRF protection**
- **Secure token storage**
- **Role-based component rendering**
