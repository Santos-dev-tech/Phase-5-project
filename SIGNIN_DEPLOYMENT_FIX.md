# Sign-In Deployment Fix Guide

## 🚨 Problem: Sign-In Doesn't Work After Deployment

The sign-in functionality fails when deployed because the current deployment configuration (`vercel.json`) only deploys the frontend as a static site, but the authentication system requires backend API endpoints.

## 🔍 Root Cause Analysis

The app has two authentication systems:

1. **Firebase Authentication** (Google sign-in) - Works in static deployments
2. **Custom Backend Authentication** (Email/Password) - Requires serverless functions

The login form uses the custom backend (`/api/auth/login`), which doesn't exist in static-only deployments.

## ✅ Solution Options

### Option 1: Deploy with Backend (Recommended)

**For Vercel:**

1. Replace `vercel.json` with `vercel-full.json`:

```bash
mv vercel.json vercel-static.json  # backup current config
mv vercel-full.json vercel.json   # use full-stack config
```

2. Add environment variables in Vercel dashboard:

```
MPESA_CONSUMER_KEY = F7id9AW94hl3BxC1aedkJaCy3I6HJmHAaUAfNQYzyOTaKzLJ
MPESA_CONSUMER_SECRET = Dy4V6j1I6RpBBxc4qz0CBHfAA1q646ABBibnACMNiYJi4vqukNecNkwy1gVp7sLa
MPESA_ENVIRONMENT = sandbox
MPESA_SHORT_CODE = 174379
MPESA_PASSKEY = bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_BUSINESS_PHONE = 254746013145
JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters
```

3. Redeploy

**For Netlify:**

The app is already configured for Netlify! Just deploy to Netlify instead:

1. Connect your repository to Netlify
2. Set build command: `npm run build:client`
3. Set publish directory: `dist/spa`
4. Add the same environment variables as above
5. Deploy

### Option 2: Use Firebase Authentication Only

Switch the login form to use Firebase instead of custom backend:

1. Update `client/pages/Login.jsx` to use Firebase sign-in methods
2. Remove dependency on `/api/auth/*` endpoints
3. This allows static-only deployments

### Option 3: Hybrid Approach

Keep both authentication methods but add fallback:

1. Try custom backend first
2. Fall back to Firebase if backend is unavailable
3. Detect deployment environment and choose appropriate method

## 🛠️ Quick Fix Steps

### For Current Deployment Issue:

1. **Identify your deployment platform:**

   - Vercel: Use Option 1 (switch to full-stack config)
   - Netlify: Already supported, just add environment variables
   - Other: Consider Option 2 (Firebase only)

2. **Set environment variables:**

   - Copy variables from VERCEL_DEPLOYMENT_GUIDE.md
   - Add JWT_SECRET for authentication
   - Set all for "All Environments"

3. **Redeploy:**
   - Full redeploy (not just re-run)
   - Check deployment logs for errors
   - Test sign-in functionality

## 🧪 Testing Authentication

After deployment, test these scenarios:

1. **Email/Password Sign-in:**

   - Should work with any email/password in demo mode
   - Check browser network tab for API calls

2. **Registration:**

   - Should create accounts in demo mode
   - Verify JWT token is generated

3. **Protected Routes:**
   - Dashboard should be accessible after login
   - Should redirect to login if not authenticated

## 🔧 Environment Variables Needed

Create `.env` file based on `.env.example` for local development.

For deployment, set these in your platform:

### Required:

- `MPESA_*` variables (for payments)
- `JWT_SECRET` (for authentication)

### Optional:

- `VITE_FIREBASE_*` variables (if using environment-specific Firebase)
- `DB_PASSWORD` (if using database instead of demo mode)

## 📞 Still Having Issues?

1. **Check deployment logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly: `https://yourapp.com/api/auth/login`
4. **Check browser console** for client-side errors
5. **Try different deployment platform** (Netlify vs Vercel)

## 💡 Development vs Production

- **Development**: Full-stack with hot reload
- **Production**: Choose between static (Firebase only) or full-stack (serverless)
- **Demo Mode**: Works without database for quick testing

The app is designed to work in multiple deployment scenarios - choose the one that fits your needs!
