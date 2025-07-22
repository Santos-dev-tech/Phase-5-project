# 🎨 Mealy Frontend File Structure

## 📁 Current Project Structure

```
client/                              # Frontend source code
├── components/                      # React components
│   ├── ui/                         # Reusable UI components (Radix UI + shadcn/ui)
│   │   ├── accordion.jsx
│   │   ├── alert-dialog.jsx
│   │   ├── alert.jsx
│   │   ├── aspect-ratio.jsx
│   │   ├── avatar.jsx
│   │   ├── badge.jsx
│   │   ├── breadcrumb.jsx
│   │   ├── button.jsx
│   │   ├── calendar.jsx
│   │   ├── card.jsx
│   │   ├── carousel.jsx
│   │   ├── chart.jsx
│   │   ���── checkbox.jsx
│   │   ├── collapsible.jsx
│   │   ├── command.jsx
│   │   ├── context-menu.jsx
│   │   ├── dialog.jsx
│   │   ├── drawer.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── form.jsx
│   │   ├── hover-card.jsx
│   │   ├── input-otp.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── menubar.jsx
│   │   ├── navigation-menu.jsx
│   │   ├── pagination.jsx
│   │   ├── popover.jsx
│   │   ├── progress.jsx
│   │   ├── radio-group.jsx
│   │   ├── resizable.jsx
│   │   ├── scroll-area.jsx
│   │   ├── select.jsx
│   │   ├── separator.jsx
│   │   ├── sheet.jsx
│   │   ├── sidebar.jsx
│   │   ├── skeleton.jsx
│   │   ├── slider.jsx
│   │   ├── sonner.jsx
│   │   ├── switch.jsx
│   │   ├── table.jsx
│   │   ├── tabs.jsx
│   │   ├── textarea.jsx
│   │   ├── toast.jsx
│   │   ├── toaster.jsx
│   │   ├── toggle-group.jsx
│   │   ├── toggle.jsx
│   │   └── tooltip.jsx
│   ├── FirebaseDebug.jsx           # Development debugging component
│   ├── Layout.jsx                  # Main layout wrapper
│   ├── MpesaPayment.jsx           # M-Pesa payment integration
│   └── ProtectedRoute.jsx         # Route protection component
├── contexts/                       # React Context providers
│   └── AppContext.jsx             # Global application context
├── hooks/                         # Custom React hooks
│   ├── use-mobile.jsx             # Mobile device detection
│   └── use-toast.js               # Toast notification hook
├── lib/                           # Utility libraries
│   ├── firebase.js                # Firebase configuration
│   └── utils.js                   # General utility functions
├── pages/                         # Page components (React Router)
│   ├── AdminDashboard.jsx         # Admin dashboard page
│   ├── Dashboard.jsx              # Customer dashboard page
│   ├── Index.jsx                  # Landing/home page
│   ├── Login.jsx                  # Login page
│   ├── NotFound.jsx               # 404 error page
│   └── Register.jsx               # Registration page
├── store/                         # Redux store configuration
│   ├── slices/                    # Redux Toolkit slices
│   │   ├── authSlice.js           # Authentication state
│   │   ├── mealsSlice.js          # Meal options management
│   │   ├── menusSlice.js          # Daily menu management
│   │   ├── notificationsSlice.js  # Notifications state
│   │   └── ordersSlice.js         # Order management
│   └── store.js                   # Store configuration
├── App.jsx                        # Main application component
└── global.css                     # Global styles with Tailwind CSS
```

## 📦 Root Level Files

```
├── components.json                # shadcn/ui component configuration
├── index.html                    # Main HTML template
├── package.json                  # Node.js dependencies and scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.js                # Vite build configuration
└── vite.config.server.js         # Vite server build configuration
```

## 🔧 Key Technologies

### Core Framework
- **React** 18.3.1 - Modern React with hooks
- **React Router DOM** 6.26.2 - Client-side routing
- **Vite** 6.2.2 - Fast build tool and dev server

### State Management
- **Redux Toolkit** 2.0.1 - Predictable state container
- **React Redux** 9.0.4 - React bindings for Redux
- **TanStack Query** 5.56.2 - Server state management

### UI Components
- **Radix UI** - Unstyled, accessible components
- **Tailwind CSS** 3.4.11 - Utility-first CSS framework
- **Lucide React** 0.462.0 - Beautiful icon library
- **Framer Motion** 12.6.2 - Animation library

### Form Handling
- **React Hook Form** 7.53.0 - Performant forms
- **Hookform Resolvers** 3.9.0 - Validation resolvers
- **Zod** 3.23.8 - TypeScript-first schema validation

### Additional Features
- **Firebase** 11.10.0 - Authentication and real-time data
- **Next Themes** 0.3.0 - Dark/light theme support
- **Sonner** 1.5.0 - Toast notifications
- **Date-fns** 3.6.0 - Date utility library

## 🎨 Styling System

### CSS Architecture
- **Tailwind CSS** for utility-first styling
- **CSS Custom Properties** for theme variables
- **HSL Color System** for consistent theming
- **Dark/Light Mode** support with CSS variables

### Design Tokens
- **Brand Colors**: Orange and Green palette
- **Semantic Colors**: Primary, secondary, accent, destructive
- **Layout**: Consistent spacing and sizing scales
- **Typography**: Responsive font scales

## 🔄 State Management Architecture

### Redux Store Structure
```javascript
store: {
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  meals: {
    items: [],
    loading: false,
    error: null
  },
  menus: {
    todaysMenu: null,
    loading: false,
    error: null
  },
  orders: {
    items: [],
    currentOrder: null,
    loading: false,
    error: null
  },
  notifications: {
    items: [],
    unreadCount: 0
  }
}
```

### Context Providers
- **AppContext**: Global app state and functions
- **Theme Context**: Dark/light mode management
- **Toast Context**: Notification management

## 🛣️ Routing Structure

### Page Routes
```javascript
const routes = [
  { path: "/", component: Index },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/dashboard", component: Dashboard, protected: true },
  { path: "/admin", component: AdminDashboard, protected: true, role: "admin" },
  { path: "*", component: NotFound }
]
```

### Protected Routes
- **Authentication Required**: Dashboard, Admin
- **Role-based Access**: Admin routes restricted to admin users
- **Redirect Logic**: Unauthenticated users redirected to login

## 🔧 Build Configuration

### Vite Configuration
- **SWC Plugin**: Fast React compilation
- **Path Aliases**: `@/` for src directory
- **Proxy Setup**: API calls proxied to backend
- **Development Server**: Hot reload on port 3001

### Build Output
```
dist/spa/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── public assets
```

## 🧩 Component Architecture

### Component Categories
1. **UI Components** (`components/ui/`)
   - Atomic, reusable components
   - Based on Radix UI primitives
   - Styled with Tailwind CSS variants

2. **Feature Components** (`components/`)
   - Business logic components
   - Composed of UI components
   - Connected to state management

3. **Page Components** (`pages/`)
   - Route-level components
   - Layout and navigation logic
   - Data fetching and state management

### Design Patterns
- **Compound Components**: For complex UI patterns
- **Render Props**: For reusable logic sharing
- **Custom Hooks**: For stateful logic extraction
- **Context + Hooks**: For cross-component state

## 🔐 Security Implementation

### Frontend Security
- **Input Sanitization**: XSS prevention
- **Token Storage**: Secure JWT handling
- **Route Protection**: Authentication guards
- **Environment Variables**: Secure configuration
- **CORS**: Cross-origin request handling

### Firebase Integration
- **Authentication**: Google, email/password
- **Firestore**: Real-time database
- **Security Rules**: Access control
- **Offline Support**: PWA capabilities

## 📱 Responsive Design

### Breakpoint System
- **Mobile**: 0-768px
- **Tablet**: 768-1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1400px+

### Mobile-First Approach
- Progressive enhancement
- Touch-friendly interactions
- Optimized performance
- Offline capabilities

## 🎯 Performance Optimizations

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports
- Bundle size optimization

### Caching Strategy
- Browser caching
- Service worker caching
- API response caching
- Static asset caching

### Bundle Analysis
- Chunk size warnings
- Tree shaking
- Dead code elimination
- Dependency optimization

## 🧪 Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Environment Setup
- `.env.example` - Environment template
- `.env.local` - Local development variables
- Hot module replacement
- Auto-refresh on changes

## 📚 Documentation Standards

### Component Documentation
- Props interface
- Usage examples
- Styling variants
- Accessibility notes

### Code Comments
- Complex logic explanation
- API integration notes
- Performance considerations
- Security implementations
