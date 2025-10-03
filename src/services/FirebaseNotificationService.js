// Firebase Cloud Messaging (FCM) Push Notification Service
// Handles push notifications using Firebase instead of Expo notifications
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
// AsyncStorage removed - using Supabase only

// Firebase configuration is handled by @react-native-firebase/app
// No need to manually initialize Firebase for React Native

const FCM_TOKEN_STORAGE_KEY = 'fcm_token';
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

class FirebaseNotificationService {
  constructor() {
    this.fcmToken = null;
    this.isInitialized = false;
    this.notificationPreferences = {
      directBookings: true,
      scheduleUpdates: true,
      jobReminders: true,
      changeOrders: true,
      generalUpdates: true,
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }

  // Initialize Firebase messaging
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                     authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FirebaseNotificationService: Notification permission granted');
        
        // Get FCM token
        await this.getFCMToken();
        
        // Set up message listener
        this.setupMessageListener();
      } else {
        console.log('FirebaseNotificationService: Notification permission denied');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('FirebaseNotificationService: Initialization failed:', error);
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      
      if (token) {
        this.fcmToken = token;
        // FCM token is now managed in memory only
        console.log('FirebaseNotificationService: FCM token obtained:', token);
        
        // Send token to your backend
        await this.sendTokenToBackend(token);
        
        return token;
      } else {
        console.log('FirebaseNotificationService: No registration token available');
      }
    } catch (error) {
      console.error('FirebaseNotificationService: Error getting FCM token:', error);
    }
    return null;
  }

  // Send FCM token to backend
  async sendTokenToBackend(token) {
    try {
      // User ID is now managed in memory only
      if (!userId) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          fcmToken: token,
          platform: Platform.OS,
        }),
      });

      if (response.ok) {
        console.log('FirebaseNotificationService: Token sent to backend successfully');
      } else {
        console.error('FirebaseNotificationService: Failed to send token to backend');
      }
    } catch (error) {
      console.error('FirebaseNotificationService: Error sending token to backend:', error);
    }
  }

  // Set up message listener for foreground messages
  setupMessageListener() {
    // Listen for foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FirebaseNotificationService: Message received in foreground:', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Listen for background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('FirebaseNotificationService: Message received in background:', remoteMessage);
      this.handleBackgroundMessage(remoteMessage);
    });

    return unsubscribe;
  }

  // Handle foreground messages
  handleForegroundMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    // Show notification manually for foreground messages
    if (notification) {
      this.showLocalNotification(notification.title, notification.body, data);
    }
    
    // Emit event for UI updates
    if (data?.eventType) {
      console.log(`FirebaseNotificationService: Received ${data.eventType} notification:`, data);
      // You can emit events here to update UI components
    }
  }

  // Handle background messages
  handleBackgroundMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    // Handle background message processing
    if (data?.eventType) {
      console.log(`FirebaseNotificationService: Background ${data.eventType} notification:`, data);
      // Process background notification data
    }
  }

  // Show local notification (for foreground messages)
  showLocalNotification(title, body, data = {}) {
    if (Platform.OS === 'web' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: '/icon.png', // You can customize this
        badge: '/badge.png',
        tag: data.jobId || 'general',
        data,
      });

      notification.onclick = () => {
        this.handleNotificationClick(data);
        notification.close();
      };
    }
  }

  // Handle notification click
  handleNotificationClick(data) {
    console.log('FirebaseNotificationService: Notification clicked:', data);
    
    // Handle navigation based on notification type
    if (data?.jobId && data?.eventType) {
      this.navigateToJobDetails(data.jobId, data.eventType);
    }
  }

  // Navigate to job details based on notification type
  navigateToJobDetails(jobId, eventType) {
    console.log(`FirebaseNotificationService: Navigate to job ${jobId} for event ${eventType}`);
    
    // In a real implementation, you would use your navigation service:
    // NavigationService.navigate('JobDetails', { jobId, eventType });
  }

  // Send push notification via backend
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          title,
          body,
          data,
        }),
      });

      if (response.ok) {
        console.log('FirebaseNotificationService: Push notification sent successfully');
        return { success: true };
      } else {
        console.error('FirebaseNotificationService: Failed to send push notification');
        return { success: false, error: 'Failed to send notification' };
      }
    } catch (error) {
      console.error('FirebaseNotificationService: Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send direct booking notification
  async sendDirectBookingNotification(mechanicId, jobData) {
    if (!this.notificationPreferences.directBookings) return;

    const title = 'New Direct Booking! 🎉';
    const body = `You have received a direct booking from ${jobData.customerName} for "${jobData.jobTitle}"`;

    return await this.sendPushNotification(mechanicId, title, body, {
      eventType: 'direct_booking_received',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      jobTitle: jobData.jobTitle,
      estimatedCost: jobData.estimatedCost,
    });
  }

  // Send schedule update notification
  async sendScheduleUpdateNotification(mechanicId, jobData) {
    if (!this.notificationPreferences.scheduleUpdates) return;

    const title = 'Direct Booking Scheduled';
    const body = `Your direct booking with ${jobData.customerName} has been scheduled for ${jobData.scheduledDate} at ${jobData.scheduledTime}`;

    return await this.sendPushNotification(mechanicId, title, body, {
      eventType: 'direct_booking_scheduled',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      scheduledDate: jobData.scheduledDate,
      scheduledTime: jobData.scheduledTime,
    });
  }

  // Send job reminder notification
  async sendJobReminderNotification(mechanicId, jobData) {
    if (!this.notificationPreferences.jobReminders) return;

    const title = 'Upcoming Direct Booking';
    const body = `Reminder: You have a direct booking with ${jobData.customerName} starting in ${jobData.timeRemaining}`;

    return await this.sendPushNotification(mechanicId, title, body, {
      eventType: 'direct_booking_reminder',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      timeRemaining: jobData.timeRemaining,
    });
  }

  // Load notification preferences
  async loadNotificationPreferences() {
    try {
      // Notification preferences are now managed in memory only
      if (preferences) {
        this.notificationPreferences = { ...this.notificationPreferences, ...JSON.parse(preferences) };
      }
    } catch (error) {
      console.error('FirebaseNotificationService: Error loading notification preferences:', error);
    }
  }

  // Save notification preferences
  async saveNotificationPreferences(preferences) {
    try {
      this.notificationPreferences = { ...this.notificationPreferences, ...preferences };
      // Notification preferences are now managed in memory only
      return { success: true };
    } catch (error) {
      console.error('FirebaseNotificationService: Error saving notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current notification preferences
  getNotificationPreferences() {
    return { ...this.notificationPreferences };
  }

  // Get FCM token
  getFCMToken() {
    return this.fcmToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    const authStatus = await messaging().hasPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }

  // Request notification permissions
  async requestNotificationPermissions() {
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  }

  // Clear all notifications
  async clearAllNotifications() {
    // This would be platform-specific implementation
    console.log('FirebaseNotificationService: Clear notifications not implemented for this platform');
    return { success: true };
  }
}

// Export singleton instance
export default new FirebaseNotificationService();
