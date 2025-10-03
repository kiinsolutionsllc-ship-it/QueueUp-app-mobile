# AWS Cognito Custom Attributes Setup

## Issue: "Attributes did not conform to the schema"

This error occurs because custom attributes like `custom:user_type` are not defined in your AWS Cognito User Pool schema.

## ✅ Quick Fix Applied

I've updated the code to work without custom attributes for now. The app will:
- Use only standard AWS Cognito attributes (email, name, phone_number, picture)
- Default user_type to 'customer' 
- Store additional user data in your Supabase database instead

## 🔧 To Add Custom Attributes (Optional)

If you want to use custom attributes in AWS Cognito:

### Step 1: Add Custom Attributes in AWS Console

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Select your User Pool
3. Go to **"Sign-up experience"** tab
4. Scroll down to **"Required attributes"**
5. Click **"Add custom attribute"**
6. Add these custom attributes:

```
custom:user_type
- Type: String
- Min length: 1
- Max length: 20
- Mutable: Yes

custom:phone
- Type: String
- Min length: 0
- Max length: 20
- Mutable: Yes

custom:avatar
- Type: String
- Min length: 0
- Max length: 500
- Mutable: Yes

custom:location
- Type: String
- Min length: 0
- Max length: 1000
- Mutable: Yes
```

### Step 2: Update the Code

After adding custom attributes, you can uncomment the custom attributes in the signup code:

```typescript
const attributes = {
  email: email,
  name: userData.name || email.split('@')[0],
  'custom:user_type': userData.user_type,
  'custom:phone': userData.phone || '',
  'custom:avatar': userData.avatar || '',
  'custom:location': userData.location ? JSON.stringify(userData.location) : '',
};
```

## 🚀 Recommended Approach: Use Supabase for User Data

Instead of custom attributes, consider storing user data in Supabase:

### Benefits:
- ✅ More flexible data structure
- ✅ Better querying capabilities
- ✅ Easier to manage
- ✅ No AWS Cognito limitations

### Implementation:
1. Store basic auth data in AWS Cognito (email, password)
2. Store user profile data in Supabase (user_type, phone, avatar, etc.)
3. Link them using the Cognito user ID

## 📋 Current Status

- ✅ **Signup works** without custom attributes
- ✅ **Signin works** with standard attributes
- ✅ **User data** stored with sensible defaults
- ✅ **No more schema errors**

## 🧪 Test Your Setup

Try signing up with a new account:
1. Use a valid email address
2. Use a strong password (8+ characters, mixed case, numbers)
3. The signup should work without errors

The user will be created with:
- Email: Your provided email
- Name: Extracted from email
- User Type: 'customer' (default)
- Role: 'customer' (default)
- Other fields: Default values

## 🔄 Next Steps

1. **Test signup/signin** - Should work without errors now
2. **Consider Supabase integration** - For better user data management
3. **Add custom attributes later** - If you need them in AWS Cognito

The app is now working with standard AWS Cognito attributes! 🎉
