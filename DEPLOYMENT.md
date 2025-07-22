# Deployment Guide

This project supports deployment to both Vercel and Netlify.

## Prerequisites

1. Build the project: `npm run build`
2. Set up environment variables on your deployment platform

## Environment Variables

For both platforms, you'll need to set these environment variables:

### Required for M-Pesa Integration
- `MPESA_CONSUMER_KEY` - Your M-Pesa consumer key
- `MPESA_CONSUMER_SECRET` - Your M-Pesa consumer secret  
- `MPESA_ENVIRONMENT` - Either "sandbox" or "production"
- `MPESA_SHORT_CODE` - Your M-Pesa short code (default: 174379)
- `MPESA_PASSKEY` - Your M-Pesa passkey
- `MPESA_BUSINESS_PHONE` - Your business phone number

### Required for Authentication
- `JWT_SECRET` - Secret key for JWT token signing

### Optional Database
- `DB_PASSWORD` - Database password (if using database features)

## Vercel Deployment

### Option 1: Using Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `npm run deploy:vercel`

### Option 2: Using Git Integration
1. Connect your GitHub repo to Vercel
2. Vercel will automatically use the `vercel.json` configuration
3. Set environment variables in Vercel dashboard

### Configuration Files
- `vercel.json` - Main configuration
- `vercel-full.json` - Full configuration with all environment variables
- `vercel-simple.json` - Simple configuration for testing

## Netlify Deployment

### Option 1: Using Netlify CLI
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify login`
3. Run: `npm run deploy:netlify`

### Option 2: Using Git Integration
1. Connect your GitHub repo to Netlify
2. Netlify will automatically use the `netlify.toml` configuration
3. Set environment variables in Netlify dashboard

### Configuration
- Build command: `npm run build`
- Publish directory: `dist/spa`
- Functions directory: `netlify/functions`

## Troubleshooting

### Vercel Issues
- Ensure you're using Node.js 20.x runtime
- Check that API routes are properly configured in `vercel.json`
- Verify environment variables are set in Vercel dashboard

### Netlify Issues
- Ensure all external dependencies are listed in `netlify.toml`
- Check function logs in Netlify dashboard
- Verify build command completes successfully

### Common Issues
- **Build failures**: Run `npm run build` locally first to check for errors
- **API routes not working**: Verify function configuration and environment variables
- **Missing dependencies**: Check that all required packages are in package.json dependencies (not devDependencies)

## Testing Deployment

After deployment, test these endpoints:
- `https://yourdomain.com/` - Frontend should load
- `https://yourdomain.com/api/health` - Should return API status
- `https://yourdomain.com/api/demo` - Should return demo data
