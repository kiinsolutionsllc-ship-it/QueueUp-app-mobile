# AWS Cognito Error Troubleshooting Guide

## Current Error Analysis
The error you're seeing is related to `signInWithCustomSRPAuth.js`, which suggests:

1. **AWS Amplify is now properly configured** (our previous fixes worked)
2. **The error is now in the authentication flow itself**
3. **Possible User Pool configuration issues**

## Step-by-Step Troubleshooting

### Step 1: Add Debug Component (Temporary)

Add this to your login screen temporarily to get detailed error information:

```tsx
import { AWSConfigDebugger } from '../components/debug/AWSConfigDebugger';

// Add this state
const [showDebugger, setShowDebugger] = useState(false);

// Add this button somewhere in your login screen
<TouchableOpacity onPress={() => setShowDebugger(true)}>
  <Text>Debug AWS Config</Text>
</TouchableOpacity>

// Add this at the end of your component
{showDebugger && (
  <AWSConfigDebugger onClose={() => setShowDebugger(false)} />
)}
```

### Step 2: Check AWS Cognito User Pool Configuration

Go to your AWS Cognito Console and verify these settings:

#### User Pool Settings
1. **Go to**: AWS Cognito Console → Your User Pool (`us-east-2_RNDeb3LGm`)
2. **Check General Settings**:
   - ✅ User Pool name is set
   - ✅ MFA is configured (if required)
   - ✅ Email verification is enabled (if required)

#### App Client Settings
1. **Go to**: App clients → Your app client (`2pql2mbi2jlrk61d95lnbcfg88`)
2. **Check Authentication Flows**:
   - ✅ `ALLOW_USER_SRP_AUTH` (REQUIRED for mobile apps)
   - ✅ `ALLOW_REFRESH_TOKEN_AUTH`
   - ❌ `ALLOW_USER_PASSWORD_AUTH` (should be DISABLED for security)
   - ❌ `ALLOW_ADMIN_USER_PASSWORD_AUTH` (should be DISABLED)

3. **Check App Client Configuration**:
   - ❌ "Generate client secret" should be **DISABLED** (mobile apps don't use secrets)
   - ✅ "Enable username password based authentication" should be **ENABLED**

#### User Pool Policies
1. **Go to**: Policies → Password policy
   - Ensure password requirements match what users are creating
   - Default: 8+ characters, uppercase, lowercase, number, special character

### Step 3: Test with AWS Console

1. **Create a test user** in AWS Cognito Console:
   - Go to Users tab → Create user
   - Use a simple email like `test@example.com`
   - Set a simple password like `Test123!`
   - **Confirm the user** (set status to "Confirmed")

2. **Test login** with these credentials in your app

### Step 4: Check Network and Permissions

#### Network Issues
- Ensure you have internet connectivity
- Check if your firewall/proxy is blocking AWS endpoints
- Try from a different network

#### AWS Permissions
- Verify your AWS credentials have proper permissions
- Check if there are any IAM policy restrictions

### Step 5: Common Configuration Issues

#### Issue 1: Client Secret Enabled
**Problem**: Mobile apps should NOT have client secrets
**Solution**: 
1. Go to App clients → Edit your app client
2. Uncheck "Generate client secret"
3. Save changes

#### Issue 2: Wrong Authentication Flows
**Problem**: Missing or incorrect authentication flows
**Solution**:
1. Go to App clients → Edit your app client
2. Enable these flows:
   - `ALLOW_USER_SRP_AUTH` ✅
   - `ALLOW_REFRESH_TOKEN_AUTH` ✅
3. Disable these flows:
   - `ALLOW_USER_PASSWORD_AUTH` ❌
   - `ALLOW_ADMIN_USER_PASSWORD_AUTH` ❌

#### Issue 3: User Pool Region Mismatch
**Problem**: User Pool region doesn't match configuration
**Solution**:
- Your User Pool ID: `us-east-2_RNDeb3LGm` (region: us-east-2)
- Your config region: `us-east-2` ✅ (correct)

#### Issue 4: User Not Confirmed
**Problem**: User account exists but is not confirmed
**Solution**:
1. Go to AWS Cognito Console → Users
2. Find your user
3. Set status to "Confirmed"

### Step 6: Test Different Scenarios

#### Test 1: Invalid Credentials
Try logging in with wrong password to see if you get a different error:
- Expected: "Invalid email or password"
- If you get the same error: Configuration issue

#### Test 2: Non-existent User
Try logging in with email that doesn't exist:
- Expected: "No account found with this email"
- If you get the same error: Configuration issue

#### Test 3: Unconfirmed User
Try logging in with unconfirmed user:
- Expected: "Please confirm your email address"
- If you get the same error: Configuration issue

### Step 7: Advanced Debugging

#### Check AWS CloudWatch Logs
1. Go to AWS CloudWatch Console
2. Look for logs related to your User Pool
3. Check for any error messages

#### Test with AWS CLI
```bash
# Test if your User Pool is accessible
aws cognito-idp describe-user-pool --user-pool-id us-east-2_RNDeb3LGm --region us-east-2

# Test if your app client is accessible
aws cognito-idp describe-user-pool-client --user-pool-id us-east-2_RNDeb3LGm --client-id 2pql2mbi2jlrk61d95lnbcfg88 --region us-east-2
```

### Step 8: Quick Fixes to Try

#### Fix 1: Recreate App Client
1. Delete your current app client
2. Create a new one with these settings:
   - Name: "QueueUp Mobile App"
   - Authentication flows: `ALLOW_USER_SRP_AUTH`, `ALLOW_REFRESH_TOKEN_AUTH`
   - Generate client secret: **DISABLED**
3. Update your `.env` file with the new client ID

#### Fix 2: Reset User Pool
1. Create a new User Pool with default settings
2. Create a new app client with mobile app settings
3. Update your configuration

#### Fix 3: Check Expo Configuration
Make sure your `app.config.js` is properly configured and restart your development server.

## Expected Error Messages

If everything is working correctly, you should see these specific error messages:

- **Invalid credentials**: "Invalid email or password"
- **User not found**: "No account found with this email"
- **Email not confirmed**: "Please confirm your email address before signing in"
- **Too many attempts**: "Too many sign-in attempts. Please try again later"

If you're still getting the generic `signInWithCustomSRPAuth` error, it's likely a configuration issue.

## Next Steps

1. **Add the debug component** to your app
2. **Run the config test** to see detailed information
3. **Check your AWS Cognito User Pool settings** against this guide
4. **Test with a known good user account** from AWS Console
5. **Share the debug output** if you need further assistance

The debug component will give us much more specific information about what's going wrong with the authentication flow.


