# 🔧 Stripe Configuration Fix Guide

## Current Issues:
- ❌ Mock mode is enabled (`MOCK_MODE = true`)
- ❌ No real Stripe API keys configured
- ❌ Backend URL is placeholder
- ❌ Missing environment variables
- ❌ Multiple conflicting payment services

## Step-by-Step Fix:

### 1. Get Your Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign up or log in to your account
3. Go to **Developers > API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)

### 2. Create Environment Variables
Create a `.env` file in your project root with:

```env
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key_here

# Backend API (if you have one)
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Update Payment Configuration
Update `src/config/payment.js`:

```javascript
// Set to false when you have real Stripe keys
export const MOCK_MODE = false;

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_actual_stripe_publishable_key_here',
  // ... rest of config
};
```

### 4. Update Backend Configuration
Update `src/config/stripeBackend.ts`:

```typescript
export const STRIPE_BACKEND_CONFIG: StripeBackendConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/stripe',
  // ... rest of config
};
```

### 5. Install Stripe Dependencies
```bash
npm install @stripe/stripe-js @stripe/react-native-js
```

### 6. Test Payment Processing
After configuration, test with:
- Test card: `4242424242424242`
- Any future expiry date
- Any 3-digit CVC

## Quick Fix for Testing:
If you want to test immediately without setting up Stripe:

1. Keep `MOCK_MODE = true`
2. The mock service should work for testing
3. Check console logs for specific error messages

## Production Setup:
1. Get live Stripe keys from Stripe Dashboard
2. Set `MOCK_MODE = false`
3. Update all placeholder URLs
4. Test with real payment methods
