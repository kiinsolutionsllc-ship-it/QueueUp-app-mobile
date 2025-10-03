# AWS Cognito Setup Guide for QueueUp

This guide will help you set up AWS Cognito for email verification in your QueueUp mobile app.

## Prerequisites

1. AWS Account (free tier available)
2. AWS CLI installed (optional but recommended)
3. Your QueueUp mobile app project

## Step 1: Create AWS Cognito User Pool

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Navigate to **Cognito** service

2. **Create User Pool**
   - Click "Create user pool"
   - Choose "Step through settings"

3. **Configure Sign-in Options**
   - Select "Email" as the sign-in option
   - Click "Next"

4. **Configure Security Requirements**
   - Password policy: Choose your requirements (minimum 8 characters recommended)
   - Multi-factor authentication: Optional (can be enabled later)
   - Click "Next"

5. **Configure Sign-up Experience**
   - Self-registration: Enable
   - Cognito-assisted verification: Enable
   - Required attributes: Select "email" and "name"
   - Custom attributes: Add the following:
     - `user_type` (String, Mutable)
     - `phone` (String, Mutable)
     - `avatar` (String, Mutable)
     - `location` (String, Mutable)
     - `profile_completed` (String, Mutable)
     - `subscription_tier` (String, Mutable)
   - Click "Next"

6. **Configure Message Delivery**
   - Email provider: Choose "Send email with Cognito"
   - Email subject: "Verify your QueueUp account"
   - Email message: Customize as needed
   - Click "Next"

7. **Integrate Your App**
   - User pool name: "QueueUp-UserPool" (or your preferred name)
   - App client name: "QueueUp-MobileApp"
   - Generate client secret: **Uncheck this** (React Native doesn't support client secrets)
   - Click "Next"

8. **Review and Create**
   - Review all settings
   - Click "Create user pool"

## Step 2: Configure App Client

1. **Select Your User Pool**
   - Click on your newly created user pool

2. **Go to App Integration Tab**
   - Click on your app client
   - Note down the **Client ID**

3. **Configure Authentication Flows**
   - Enable: "ALLOW_USER_SRP_AUTH"
   - Enable: "ALLOW_REFRESH_TOKEN_AUTH"
   - Click "Save changes"

## Step 3: Set Up Custom Domain (Optional but Recommended)

1. **Go to Domain Name Tab**
   - Click "Create Cognito domain"
   - Choose a unique domain name (e.g., "queueup-auth")
   - Click "Create Cognito domain"

## Step 4: Configure Environment Variables

1. **Copy the example environment file**
   ```bash
   cp env.example .env
   ```

2. **Update your .env file with AWS Cognito values**
   ```env
   # AWS Cognito Configuration
   EXPO_PUBLIC_AWS_REGION=us-east-1
   EXPO_PUBLIC_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
   EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id_here
   EXPO_PUBLIC_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
   ```

3. **Get the values from AWS Console**
   - **Region**: Found in the top-right corner of AWS Console
   - **User Pool ID**: Found in the "General settings" tab of your user pool
   - **Client ID**: Found in the "App integration" tab under "App clients"
   - **Domain**: The domain you created in Step 3

## Step 5: Update Your App to Use AWS Cognito

1. **Replace the AuthContext import in your App.js**
   ```typescript
   // Change from:
   import { AuthProvider, useAuth } from './src/contexts/AuthContext.tsx';
   
   // To:
   import { AuthProvider, useAuth } from './src/contexts/AuthContextAWS.tsx';
   ```

2. **Test the Integration**
   - Start your Expo development server
   - Try signing up with a new email
   - Check your email for the verification link
   - Complete the verification process

## Step 6: Customize Email Templates (Optional)

1. **Go to Message Customizations Tab**
   - Customize the verification email template
   - Add your app branding
   - Include helpful instructions

## Step 7: Configure Redirect URLs

1. **Go to App Integration Tab**
   - Add your app's callback URLs:
     - `https://queuedv5.vercel.app/auth/callback`
     - `exp://localhost:8081` (for development)
   - Add sign-out URLs:
     - `https://queuedv5.vercel.app/auth/signout`

## Testing Your Setup

1. **Test Sign Up**
   - Create a new account
   - Verify email is sent
   - Check email verification works

2. **Test Sign In**
   - Sign in with verified account
   - Verify user data is loaded correctly

3. **Test Password Reset**
   - Use forgot password feature
   - Verify reset email is sent
   - Test password reset flow

## Troubleshooting

### Common Issues

1. **"User pool client is not configured for this operation"**
   - Check that client secret is disabled
   - Verify authentication flows are enabled

2. **"Invalid client"**
   - Verify client ID is correct
   - Check region matches your user pool

3. **"Email not verified"**
   - Check email verification is enabled
   - Verify email template is configured

4. **"Domain not found"**
   - Verify custom domain is created
   - Check domain name is correct

### Debug Mode

Enable debug logging by setting:
```env
EXPO_PUBLIC_DEBUG=true
```

## Security Best Practices

1. **Use HTTPS in production**
2. **Enable MFA for admin users**
3. **Regularly rotate access keys**
4. **Monitor CloudTrail logs**
5. **Use least privilege IAM policies**

## Cost Considerations

- **Free Tier**: 50,000 monthly active users
- **Beyond Free Tier**: $0.0055 per monthly active user
- **Email**: 62,000 emails per month free with SES

## Next Steps

1. Set up AWS SES for custom email templates
2. Configure social login providers (Google, Facebook)
3. Implement advanced security features
4. Set up monitoring and alerts

## Support

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Native AWS Amplify Guide](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/)
