# Firebase Push Notifications Setup Guide

## Why Firebase Instead of Expo Notifications?

✅ **Better Performance** - Firebase Cloud Messaging (FCM) is more reliable
✅ **No Expo Go Limitations** - Works in development builds and production
✅ **Cross-Platform** - Works on web, iOS, and Android
✅ **Free Tier** - Generous free limits
✅ **Better Analytics** - Detailed delivery and engagement metrics
✅ **Server Integration** - Easy backend integration

## 🔧 Setup Steps

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `QueueUp-Notifications`
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Add Web App to Firebase

1. In your Firebase project, click **"Add app"**
2. Select **Web app** (</> icon)
3. Enter app nickname: `QueueUp-Web`
4. Check **"Also set up Firebase Hosting"** (optional)
5. Click **"Register app"**
6. Copy the Firebase configuration object

### Step 3: Enable Cloud Messaging

1. In Firebase Console, go to **"Cloud Messaging"**
2. Click **"Get started"**
3. This will enable FCM for your project

### Step 4: Get VAPID Key (for Web)

1. In Firebase Console, go to **"Project Settings"**
2. Click **"Cloud Messaging"** tab
3. Scroll down to **"Web configuration"**
4. Copy the **"Key pair"** (VAPID key)

### Step 5: Update Your .env File

Add these Firebase configuration values to your `.env` file:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here
EXPO_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Step 6: Update Your Backend

Add Firebase Admin SDK to your backend for sending notifications:

```bash
# In your backend directory
npm install firebase-admin
```

Create a Firebase Admin service in your backend:

```javascript
// backend/services/FirebaseAdminService.js
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

class FirebaseAdminService {
  async sendNotification(userId, title, body, data = {}) {
    try {
      // Get user's FCM token from database
      const userToken = await this.getUserFCMToken(userId);
      
      if (!userToken) {
        return { success: false, error: 'No FCM token found for user' };
      }

      const message = {
        token: userToken,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString(),
        },
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserFCMToken(userId) {
    // Implement this to get user's FCM token from your database
    // This should return the FCM token stored when user registers
  }
}

module.exports = new FirebaseAdminService();
```

### Step 7: Update Your App

The Firebase notification service is already created. You just need to:

1. **Initialize it in your app** (add to ServiceInitializer.js)
2. **Update your backend** to handle FCM token registration
3. **Test the setup**

## 🧪 Testing Your Setup

### Test 1: Check Firebase Configuration
```javascript
// Add this to your app to test Firebase connection
import firebaseNotificationService from './src/services/FirebaseNotificationService';

// Test initialization
firebaseNotificationService.initialize().then(() => {
  console.log('Firebase notifications initialized');
});
```

### Test 2: Send Test Notification
```javascript
// Test sending a notification
firebaseNotificationService.sendPushNotification(
  'user-id',
  'Test Notification',
  'This is a test notification from Firebase!',
  { eventType: 'test' }
);
```

## 📱 Platform-Specific Setup

### Web Platform
- ✅ Already implemented in the service
- ✅ Uses Firebase Web SDK
- ✅ Requires VAPID key

### Mobile Platforms (iOS/Android)
For mobile platforms, you'll need to:

1. **Add native Firebase configuration**
2. **Update app.config.js** with Firebase plugins
3. **Build development client** (not Expo Go)

## 🔗 Backend Integration

### Register FCM Token Endpoint
```javascript
// POST /api/notifications/register-token
app.post('/api/notifications/register-token', async (req, res) => {
  const { userId, fcmToken, platform } = req.body;
  
  // Store FCM token in database
  await db.collection('users').doc(userId).update({
    fcmToken,
    platform,
    lastTokenUpdate: new Date(),
  });
  
  res.json({ success: true });
});
```

### Send Notification Endpoint
```javascript
// POST /api/notifications/send
app.post('/api/notifications/send', async (req, res) => {
  const { userId, title, body, data } = req.body;
  
  const result = await firebaseAdminService.sendNotification(
    userId,
    title,
    body,
    data
  );
  
  res.json(result);
});
```

## 🎯 Benefits of This Setup

1. **No Expo Go Limitations** - Works in development builds
2. **Better Reliability** - Firebase is more stable than Expo notifications
3. **Cross-Platform** - Same code works on web, iOS, and Android
4. **Free Tier** - Generous limits for development and small apps
5. **Analytics** - Detailed delivery and engagement metrics
6. **Server Integration** - Easy to send notifications from your backend

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase not configured"** - Check your .env file has all Firebase variables
2. **"No FCM token"** - Make sure user has granted notification permissions
3. **"Token not found"** - Check if FCM token is stored in your database
4. **"Permission denied"** - User needs to grant notification permissions

### Debug Steps:

1. Check Firebase Console for delivery reports
2. Verify FCM token is generated and stored
3. Test with Firebase Console's "Send test message"
4. Check browser/device notification permissions

## 📋 Next Steps

1. **Set up Firebase project** and get configuration
2. **Update your .env file** with Firebase credentials
3. **Update your backend** to handle FCM tokens
4. **Test the setup** with a simple notification
5. **Build development client** for mobile testing

Your push notifications will now work reliably across all platforms! 🎉
