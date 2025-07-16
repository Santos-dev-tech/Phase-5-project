# Vercel Deployment Guide for Mealy Restaurant App

## 🚀 Quick Fix for Current Error

Your deployment is failing because M-Pesa environment variables aren't configured. Here's how to fix it:

### Step 1: Configure Environment Variables in Vercel

1. **Go to your Vercel project dashboard**

   - Navigate to https://vercel.com/santos-dev-tech/phase-9-project
   - Click on "Settings" tab
   - Click on "Environment Variables" in the sidebar

2. **Add these environment variables:**

```
MPESA_CONSUMER_KEY = F7id9AW94hl3BxC1aedkJaCy3I6HJmHAaUAfNQYzyOTaKzLJ
MPESA_CONSUMER_SECRET = Dy4V6j1I6RpBBxc4qz0CBHfAA1q646ABBibnACMNiYJi4vqukNecNkwy1gVp7sLa
MPESA_ENVIRONMENT = sandbox
MPESA_SHORT_CODE = 174379
MPESA_PASSKEY = bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_BUSINESS_PHONE = 254746013145
```

### Step 2: Set Environment for All Environments

- **Environment**: Select "All Environments" (Production, Preview, Development)
- **Click "Save"** for each variable

### Step 3: Redeploy

1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Select "Use existing Build Cache" and click "Redeploy"

## 🔧 Alternative: Use Demo Mode

If you want to deploy without M-Pesa integration temporarily, add this environment variable:

```
MPESA_ENVIRONMENT = demo
```

This will make all payments simulate success without requiring real M-Pesa credentials.

## 📋 Complete Environment Variables Reference

### Required for M-Pesa Sandbox:

- `MPESA_CONSUMER_KEY` - Your M-Pesa sandbox consumer key
- `MPESA_CONSUMER_SECRET` - Your M-Pesa sandbox consumer secret
- `MPESA_ENVIRONMENT` - Set to "sandbox" for testing
- `MPESA_SHORT_CODE` - Your M-Pesa short code (174379 for sandbox)
- `MPESA_PASSKEY` - Your M-Pesa passkey
- `MPESA_BUSINESS_PHONE` - Business phone number

### Required for Firebase (Optional):

- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID

## 🎯 Quick Actions

### Option A: Use Sandbox Credentials (Recommended)

Copy the sandbox credentials above into Vercel environment variables.

### Option B: Use Demo Mode

Add `MPESA_ENVIRONMENT=demo` to skip M-Pesa integration entirely.

### Option C: Use Your Live Credentials

Replace the sandbox credentials with your actual M-Pesa production credentials.

## 📞 Need Help?

If you're still getting errors after adding environment variables:

1. Check that all variables are saved in Vercel
2. Ensure "All Environments" is selected
3. Try redeploying from scratch
4. Check the deployment logs for specific errors

## 🔄 After Successful Deployment

Your app will be available at: `https://phase-9-project.vercel.app`

The M-Pesa integration will work with the sandbox credentials provided above.
