// Push Notification Service
// Handles push notifications for immediate awareness of important events
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// AsyncStorage removed - using Supabase only


// Detect Expo Go environment
const IS_EXPO_GO = Constants?.appOwnership === 'expo';

// Configure notification behavior (disabled in Expo Go)
if (!IS_EXPO_GO) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const PUSH_TOKEN_STORAGE_KEY = 'expo_push_token';
const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

class PushNotificationService {
  constructor() {
    this.expoPushToken = null;
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

  // Initialize push notifications
  async initialize() {
    if (this.isInitialized) return;
    
    // Skip remote push setup in Expo Go (SDK 53+ removed remote push support in Expo Go)
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Skipping remote push setup in Expo Go');
      this.isInitialized = true;
      return;
    }

    // Remote push setup can be added here for dev builds/production apps if needed
    this.isInitialized = true;
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: register skipped in Expo Go');
      return null;
    }
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    if (token) {
      // Push token is now managed in memory only
    }

    return token;
  }

  // Set up notification listeners
  setupNotificationListeners() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Notification listeners skipped in Expo Go');
      return;
    }

    // Handle notifications received while app is foregrounded
    Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    const { data } = notification.request.content;
    
    // Emit event for UI updates
    if (data?.eventType) {
      // You can emit events here to update UI components
      console.log(`Received ${data.eventType} notification:`, data);
    }
  }

  // Handle notification response (user tapped notification)
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Handle navigation based on notification type
    if (data?.jobId && data?.eventType) {
      this.navigateToJobDetails(data.jobId, data.eventType);
    }
  }

  // Navigate to job details based on notification type
  navigateToJobDetails(jobId, eventType) {
    // This would integrate with your navigation system
    // For now, we'll just log the action
    console.log(`Navigate to job ${jobId} for event ${eventType}`);
    
    // In a real implementation, you would use your navigation service:
    // NavigationService.navigate('JobDetails', { jobId, eventType });
  }

  // Send push notification
  async sendPushNotification(expoPushToken, title, body, data = {}) {
    // Push notifications are disabled
    console.log('PushNotificationService: Push notifications are disabled - not sending:', title);
    return { success: false, error: 'Push notifications are disabled' };
  }

  // Send direct booking notification
  async sendDirectBookingNotification(mechanicToken, jobData) {
    if (!this.notificationPreferences.directBookings) return;

    const title = 'New Direct Booking! 🎉';
    const body = `You have received a direct booking from ${jobData.customerName} for "${jobData.jobTitle}"`;

    return await this.sendPushNotification(mechanicToken, title, body, {
      eventType: 'direct_booking_received',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      jobTitle: jobData.jobTitle,
      estimatedCost: jobData.estimatedCost,
    });
  }

  // Send schedule update notification
  async sendScheduleUpdateNotification(mechanicToken, jobData) {
    if (!this.notificationPreferences.scheduleUpdates) return;

    const title = 'Direct Booking Scheduled';
    const body = `Your direct booking with ${jobData.customerName} has been scheduled for ${jobData.scheduledDate} at ${jobData.scheduledTime}`;

    return await this.sendPushNotification(mechanicToken, title, body, {
      eventType: 'direct_booking_scheduled',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      scheduledDate: jobData.scheduledDate,
      scheduledTime: jobData.scheduledTime,
    });
  }

  // Send job reminder notification
  async sendJobReminderNotification(mechanicToken, jobData) {
    if (!this.notificationPreferences.jobReminders) return;

    const title = 'Upcoming Direct Booking';
    const body = `Reminder: You have a direct booking with ${jobData.customerName} starting in ${jobData.timeRemaining}`;

    return await this.sendPushNotification(mechanicToken, title, body, {
      eventType: 'direct_booking_reminder',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
      timeRemaining: jobData.timeRemaining,
    });
  }

  // Schedule local notification
  async scheduleLocalNotification(title, body, trigger, data = {}) {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Local notification scheduling skipped in Expo Go');
      return { success: false, error: 'Notifications disabled in Expo Go' };
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.notificationPreferences.soundEnabled ? 'default' : null,
        },
        trigger,
      });

      console.log('Local notification scheduled:', notificationId);
      return { success: true, notificationId };
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule job reminder
  async scheduleJobReminder(jobData, reminderTime) {
    const title = 'Upcoming Direct Booking';
    const body = `Reminder: You have a direct booking with ${jobData.customerName} starting soon`;

    const trigger = {
      date: reminderTime,
    };

    return await this.scheduleLocalNotification(title, body, trigger, {
      eventType: 'direct_booking_reminder',
      jobId: jobData.jobId,
      customerName: jobData.customerName,
    });
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Cancel notification skipped in Expo Go');
      return { success: true };
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Scheduled notification cancelled:', notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Cancel all notifications skipped in Expo Go');
      return { success: true };
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
      return { success: true };
    } catch (error) {
      console.error('Error cancelling all scheduled notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Load notification preferences
  async loadNotificationPreferences() {
    try {
      // Notification preferences are now managed in memory only
      if (preferences) {
        this.notificationPreferences = { ...this.notificationPreferences, ...JSON.parse(preferences) };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  // Save notification preferences
  async saveNotificationPreferences(preferences) {
    try {
      this.notificationPreferences = { ...this.notificationPreferences, ...preferences };
      // Notification preferences are now managed in memory only
      return { success: true };
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current notification preferences
  getNotificationPreferences() {
    return { ...this.notificationPreferences };
  }

  // Get expo push token
  getExpoPushToken() {
    return this.expoPushToken;
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    if (IS_EXPO_GO) {
      return false; // Always return false in Expo Go
    }
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Request notification permissions
  async requestNotificationPermissions() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Permission request skipped in Expo Go');
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Get notification history
  async getNotificationHistory() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Notification history skipped in Expo Go');
      return { success: true, notifications: [] };
    }

    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return { success: true, notifications };
    } catch (error) {
      console.error('Error getting notification history:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    if (IS_EXPO_GO) {
      console.log('PushNotificationService: Clear notifications skipped in Expo Go');
      return { success: true };
    }

    try {
      await Notifications.dismissAllNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new PushNotificationService();
