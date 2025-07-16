# 🔥 LIVE M-PESA INTEGRATION SETUP

## To Enable Real M-Pesa Payments

### 1. Get Safaricom M-Pesa API Credentials

1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Create a business account
3. Apply for "Lipa na M-Pesa" API access
4. Get your production credentials:
   - Consumer Key
   - Consumer Secret
   - PassKey
   - Short Code

### 2. Set Environment Variables

Add these to your deployment platform (Vercel/Netlify):

```env
MPESA_CONSUMER_KEY=your_actual_consumer_key
MPESA_CONSUMER_SECRET=your_actual_consumer_secret
MPESA_PASSKEY=your_actual_passkey
MPESA_SHORT_CODE=your_actual_shortcode
MPESA_BUSINESS_PHONE=254746013145
MPESA_ENVIRONMENT=production
MPESA_CALLBACK_URL=https://your-domain.vercel.app/api/payments/mpesa/callback
```

### 3. Test Setup

1. Deploy with real credentials
2. Test with small amount (KSH 1)
3. Verify money reaches your business account
4. Check real-time notifications work

## Current Demo Mode Features

✅ Realistic 8-second payment simulation
✅ 95% success rate for good UX
✅ Real-time status updates
✅ Proper pending state handling
✅ No false failures during processing

## To Convert to Live Payments

Simply set the environment variables above and the system will automatically:

- Switch to live Safaricom API
- Process real money transfers
- Send actual STK push notifications
- Provide real-time payment confirmations

⚠️ **WARNING**: Once live credentials are set, ALL payments will be real money!
