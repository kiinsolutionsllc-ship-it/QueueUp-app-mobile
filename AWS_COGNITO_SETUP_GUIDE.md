# AWS Cognito Setup Guide

## Issue: "Auth UserPool not configured"

This error occurs because AWS Cognito is not properly configured in your `.env` file.

## ✅ Quick Fix

The app now handles this gracefully and will show a helpful error message instead of crashing.

## 🔧 To Set Up AWS Cognito (Optional)

If you want to use AWS Cognito for authentication, follow these steps:

### 1. Create AWS Cognito User Pool

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click "Create user pool"
3. Choose "Step through settings"
4. Configure:
   - **Pool name**: `QueueUp-UserPool`
   - **How do you want your end users to sign in?**: Email
   - **Do you want to add MFA?**: No (for free tier)
   - **Do you want to customize your user pool?**: No

### 2. Create App Client

1. In your User Pool, go to "App clients"
2. Click "Create app client"
3. Configure:
   - **App client name**: `QueueUp-Mobile`
   - **Authentication flows**: Select "ALLOW_USER_SRP_AUTH"
   - **Generate client secret**: No (for mobile apps)

### 3. Update Your .env File

Copy the values from your AWS Cognito User Pool:

```env
# AWS Cognito Configuration
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_actual_client_id_here
EXPO_PUBLIC_AWS_COGNITO_DOMAIN=your-pool-name.auth.us-east-1.amazoncognito.com
```

### 4. Restart Your App

After updating the `.env` file, restart your Expo development server:

```bash
npx expo start
```

## 🚀 Alternative: Use Supabase Auth (Recommended)

Instead of AWS Cognito, you can use Supabase for authentication:

1. **Set up Supabase** (free tier available)
2. **Update your .env file** with Supabase credentials
3. **Use Supabase Auth** instead of AWS Cognito

## 📋 Current Status

- ✅ App handles missing AWS configuration gracefully
- ✅ Shows helpful error messages
- ✅ Continues to work with other authentication methods
- ✅ No more crashes from missing AWS config

## 🆘 Need Help?

If you need help setting up AWS Cognito or want to switch to Supabase, let me know!
