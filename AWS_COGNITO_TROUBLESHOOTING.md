# AWS Cognito Troubleshooting Guide

## Common "Unknown Error" Issues

### 1. **User Pool Configuration Issues**

**Check your User Pool settings:**
- Go to AWS Cognito Console → Your User Pool → General settings
- Verify **"Authentication flows"** includes:
  - ✅ `ALLOW_USER_SRP_AUTH` (for mobile apps)
  - ✅ `ALLOW_REFRESH_TOKEN_AUTH`

**Check App Client settings:**
- Go to App clients → Your app client
- Verify **"Authentication flows"** are enabled
- Make sure **"Generate client secret"** is **DISABLED** for mobile apps

### 2. **Environment Variables Issues**

**Verify your .env file has correct values:**
```env
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_actual_client_id
```

**Common mistakes:**
- ❌ Using placeholder values like `XXXXXXXXX`
- ❌ Missing region prefix in User Pool ID
- ❌ Using wrong region
- ❌ Extra spaces or quotes around values

### 3. **User Account Issues**

**For Sign-In:**
- ✅ User account exists in User Pool
- ✅ Email is confirmed (if required)
- ✅ Password is correct
- ✅ Account is not disabled

**For Sign-Up:**
- ✅ Email format is valid
- ✅ Password meets requirements (8+ chars, uppercase, lowercase, number, special char)
- ✅ User doesn't already exist

### 4. **Network/Connectivity Issues**

**Check:**
- ✅ Internet connection
- ✅ AWS service status
- ✅ No firewall blocking AWS endpoints
- ✅ VPN/proxy settings

### 5. **AWS Amplify v6 Compatibility**

**The app uses AWS Amplify v6, which has different API:**
- ✅ Using correct import: `import { signIn, signUp } from 'aws-amplify/auth'`
- ✅ Using correct method signatures
- ✅ Proper error handling

## 🔧 Quick Fixes

### Fix 1: Verify User Pool Configuration
1. Go to AWS Cognito Console
2. Select your User Pool
3. Go to "App clients"
4. Edit your app client
5. Enable these authentication flows:
   - `ALLOW_USER_SRP_AUTH`
   - `ALLOW_REFRESH_TOKEN_AUTH`
6. Save changes

### Fix 2: Check Environment Variables
1. Open your `.env` file
2. Verify all AWS values are correct
3. Remove any extra spaces or quotes
4. Restart your Expo server

### Fix 3: Test with AWS Console
1. Go to AWS Cognito Console
2. Go to "Users" tab
3. Try creating a test user manually
4. Test sign-in with that user

### Fix 4: Enable Debug Logging
The app now logs detailed error information. Check your console for:
- Error name
- Error code
- Error message
- Stack trace

## 🆘 Still Having Issues?

**Try these steps:**

1. **Create a new User Pool** with default settings
2. **Use a simple test account** (email: test@example.com, password: Test123!)
3. **Check AWS CloudWatch logs** for detailed error information
4. **Contact AWS Support** if the issue persists

## 📋 Debug Checklist

- [ ] User Pool ID is correct (format: `us-east-1_XXXXXXXXX`)
- [ ] App Client ID is correct
- [ ] Region matches your User Pool region
- [ ] Authentication flows are enabled
- [ ] Client secret is disabled
- [ ] User account exists and is confirmed
- [ ] Password meets requirements
- [ ] No network connectivity issues
- [ ] Environment variables are loaded correctly

## 🔗 Useful Links

- [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
- [AWS Amplify v6 Documentation](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [AWS Cognito User Pool Settings](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings.html)
