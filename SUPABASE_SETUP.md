# Supabase Setup Guide for QueueUp App

## Overview
This app now uses Supabase for authentication and database. Supabase provides a complete backend-as-a-service with authentication, database, and real-time features.

## Why Supabase?
- ✅ **5-minute setup** vs hours for AWS Cognito
- ✅ **Free tier**: 50,000 users/month
- ✅ **All-in-one**: Auth + Database + Real-time
- ✅ **Better developer experience**
- ✅ **Built-in email verification**
- ✅ **Row Level Security (RLS)**

## Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase
1. Go to [Supabase](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click **"New Project"**
2. Choose your organization
3. Enter project details:
   - **Name**: `QueueUp-App`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**

### 1.3 Wait for Setup
- Project setup takes 2-3 minutes
- You'll see a progress indicator

## Step 2: Get Configuration Values

### 2.1 Project Settings
1. Go to **Settings** → **API**
2. Copy these values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2.2 Enable Authentication
1. Go to **Authentication** → **Settings**
2. Enable **Email** authentication
3. Configure email templates (optional)

## Step 3: Configure Environment Variables

### 3.1 Create .env File
Create a `.env` file in your project root:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Other configurations...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3.2 Restart Development Server
```bash
npx expo start --clear
```

## Step 4: Test Authentication

### 4.1 Test Sign Up
1. Open your app
2. Try to sign up with a new email
3. Check your email for verification code
4. Enter the 6-digit verification code

### 4.2 Test Sign In
1. Try to sign in with your confirmed account
2. You should be logged in successfully

## Step 5: Database Setup (Optional)

### 5.1 Create Tables
If you need custom tables, go to **Table Editor** in Supabase dashboard:

```sql
-- Example: Create a profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_type TEXT CHECK (user_type IN ('customer', 'mechanic')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 5.2 Set Up Row Level Security (RLS)
1. Go to **Authentication** → **Policies**
2. Enable RLS on your tables
3. Create policies for data access

## Step 6: Email Configuration (Optional)

### 6.1 Custom SMTP
1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Configure your email provider:
   - **SendGrid** (recommended)
   - **Mailgun**
   - **Custom SMTP**

### 6.2 Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize verification code and reset emails
3. Add your branding
4. **Important**: Ensure OTP (One-Time Password) is enabled for signup emails

## Troubleshooting

### Common Issues

#### 1. "Supabase not configured" error
- Check your `.env` file has correct values
- Restart your development server
- Verify the URL and key are correct

#### 2. "Invalid credentials" error
- Check email/password are correct
- Ensure email is confirmed
- Check Supabase logs in dashboard

#### 3. Email verification not working
- Check spam folder
- Verify SMTP settings
- Test with a different email provider
- Ensure OTP is enabled in Supabase dashboard

#### 4. Database connection issues
- Check your project is active
- Verify API keys are correct
- Check network connectivity

### Debug Steps
1. Check Supabase dashboard logs
2. Verify environment variables
3. Test with Supabase CLI
4. Check network connectivity

## Security Best Practices

1. **Enable RLS** on all tables
2. **Use environment variables** for secrets
3. **Set up proper policies** for data access
4. **Enable email confirmation**
5. **Use HTTPS** in production

## Cost Information

Supabase offers a generous free tier:
- **50,000 monthly active users** (free)
- **500MB database storage** (free)
- **2GB bandwidth** (free)
- **Additional users**: $25/month for 100,000 users

## Next Steps

1. Set up your Supabase project
2. Configure environment variables
3. Test authentication flow
4. Set up database tables (if needed)
5. Deploy to production

## Support

If you encounter issues:
1. Check [Supabase Documentation](https://supabase.com/docs)
2. Review Supabase dashboard logs
3. Test with Supabase CLI
4. Contact Supabase support

## Migration from AWS Cognito

✅ **Completed:**
- Removed AWS Cognito service
- Implemented Supabase authentication
- Updated all auth contexts
- Updated Redux store
- Removed AWS configuration files

✅ **Benefits:**
- Simpler setup and maintenance
- Better developer experience
- Built-in database and real-time features
- More reliable authentication

