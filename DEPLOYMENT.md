# Mealy - Deployment Guide

## Vercel Deployment

This application is configured for deployment on Vercel with both frontend and backend.

### Prerequisites

1. Vercel account
2. GitHub repository
3. M-Pesa credentials (optional for demo mode)

### Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_ENVIRONMENT=demo
MPESA_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey_here
```

### Deployment Steps

1. **Connect Repository**

   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**

   - Add the M-Pesa environment variables above
   - For demo mode, you can use dummy values

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm start
```

### Features

- ✅ Full React SPA with routing
- ✅ Express API backend
- ✅ Real M-Pesa payment integration
- ✅ Demo mode for development
- ✅ Responsive design
- ✅ Order management
- ✅ Admin dashboard

### M-Pesa Integration

The app supports both demo and live M-Pesa modes:

- **Demo Mode**: Simulates realistic payment flow with delays
- **Live Mode**: Uses real Safaricom M-Pesa API
- **Funds Recipient**: 0746013145

### API Endpoints

- `/api/auth/*` - Authentication
- `/api/meals/*` - Meal management
- `/api/orders/*` - Order processing
- `/api/payments/mpesa/*` - M-Pesa payments
- `/api/menu/today` - Today's menu

### Troubleshooting

**404 Errors on Refresh:**

- Ensure `vercel.json` is configured properly
- SPA routing should redirect to `/dist/spa/index.html`

**Payment Issues:**

- Check M-Pesa credentials
- Verify callback URLs
- Check console logs for errors

**Build Failures:**

- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies
