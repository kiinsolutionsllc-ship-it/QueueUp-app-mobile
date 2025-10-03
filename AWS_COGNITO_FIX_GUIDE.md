# AWS Cognito Configuration Fix Guide

## 🎯 **Root Cause Identified**

The error `signInWithCustomSRPAuth` indicates that your AWS Cognito User Pool App Client is **NOT properly configured for mobile apps**. This is a common issue with AWS Cognito setup.

## 🔧 **Required Fixes**

### **Step 1: Fix App Client Configuration**

1. **Go to AWS Cognito Console**:
   - Navigate to: https://console.aws.amazon.com/cognito/
   - Select your User Pool: `us-east-2_RNDeb3LGm`

2. **Edit App Client**:
   - Go to "App clients" tab
   - Click on your app client: `2pql2mbi2jlrk61d95lnbcfg88`
   - Click "Edit" or "Show details"

3. **Critical Settings to Fix**:

   **❌ DISABLE Client Secret**:
   - Uncheck "Generate client secret"
   - **This is the most common cause of the error**
   - Mobile apps should NEVER have client secrets

   **✅ Enable Authentication Flows**:
   - Check "ALLOW_USER_SRP_AUTH" ✅
   - Check "ALLOW_REFRESH_TOKEN_AUTH" ✅
   - Uncheck "ALLOW_USER_PASSWORD_AUTH" ❌
   - Uncheck "ALLOW_ADMIN_USER_PASSWORD_AUTH" ❌

4. **Save Changes**

### **Step 2: Verify User Pool Settings**

1. **Go to "General settings"**:
   - Ensure "Email" is selected as a required attribute
   - Ensure "Email verification" is enabled (if you want email verification)

2. **Go to "Policies"**:
   - Set password policy to match your app requirements
   - Default: 8+ characters, uppercase, lowercase, number, special character

### **Step 3: Create Test User**

1. **Go to "Users" tab**:
   - Click "Create user"
   - Email: `test@example.com`
   - Password: `Test123!`
   - **Important**: Set "Mark email as verified" to ✅
   - **Important**: Set "Mark phone number as verified" to ✅ (if applicable)

2. **Save the user**

### **Step 4: Test the Fix**

1. **Restart your development server**:
   ```bash
   npx expo start --clear
   ```

2. **Try logging in** with the test credentials:
   - Email: `test@example.com`
   - Password: `Test123!`

## 🚨 **Most Common Issues**

### **Issue 1: Client Secret Enabled**
- **Problem**: Your app client has a client secret
- **Solution**: Disable "Generate client secret" in app client settings
- **Why**: Mobile apps use SRP authentication which doesn't support client secrets

### **Issue 2: Wrong Authentication Flows**
- **Problem**: Missing `ALLOW_USER_SRP_AUTH` flow
- **Solution**: Enable `ALLOW_USER_SRP_AUTH` and `ALLOW_REFRESH_TOKEN_AUTH`
- **Why**: Mobile apps need SRP authentication for security

### **Issue 3: User Not Confirmed**
- **Problem**: User account exists but is not confirmed
- **Solution**: Set user status to "Confirmed" in AWS Console
- **Why**: Unconfirmed users cannot sign in

## 📋 **Verification Checklist**

After making changes, verify these settings:

- [ ] App client has NO client secret
- [ ] `ALLOW_USER_SRP_AUTH` is enabled
- [ ] `ALLOW_REFRESH_TOKEN_AUTH` is enabled
- [ ] `ALLOW_USER_PASSWORD_AUTH` is disabled
- [ ] `ALLOW_ADMIN_USER_PASSWORD_AUTH` is disabled
- [ ] Test user is created and confirmed
- [ ] Development server is restarted

## 🔄 **Alternative: Create New App Client**

If the above doesn't work, create a new app client:

1. **Delete current app client** (if possible)
2. **Create new app client**:
   - Name: "QueueUp Mobile App"
   - Authentication flows: `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
   - Generate client secret: **DISABLED**
3. **Update your `.env` file** with the new client ID

## 🎯 **Expected Results**

After fixing the configuration:

- ✅ Login should work with valid credentials
- ✅ You should get specific error messages for invalid credentials
- ✅ No more `signInWithCustomSRPAuth` errors
- ✅ Proper error handling for different scenarios

## 🆘 **If Still Not Working**

If you're still getting errors after these fixes:

1. **Check AWS CloudWatch logs** for your User Pool
2. **Verify your AWS credentials** have proper permissions
3. **Test with AWS CLI** to verify User Pool accessibility
4. **Check network connectivity** to AWS endpoints

The most likely fix is **disabling the client secret** in your app client settings. This is the #1 cause of this specific error.


