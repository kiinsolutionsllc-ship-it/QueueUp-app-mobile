import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Enhanced Notification Service for Messaging System
 * 
 * Features:
 * - Push notifications for new messages
 * - In-app notifications
 * - Notification scheduling
 * - Notification categories and actions
 * - Badge management
 * - Sound and vibration control
 * - Notification history
 * - User preferences
 */

class EnhancedNotificationService {
  constructor() {
    this.notifications = [];
    this.isInitialized = false;
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    
    // Notification categories
    this.NOTIFICATION_CATEGORIES = {
      MESSAGE: 'message',
      JOB_UPDATE: 'job_update',
      SYSTEM: 'system',
      REMINDER: 'reminder'
    };

    // Notification types
    this.NOTIFICATION_TYPES = {
      NEW_MESSAGE: 'new_message',
      MESSAGE_DELIVERED: 'message_delivered',
      MESSAGE_READ: 'message_read',
      TYPING_START: 'typing_start',
      TYPING_STOP: 'typing_stop',
      JOB_CREATED: 'job_created',
      JOB_ASSIGNED: 'job_assigned',
      JOB_COMPLETED: 'job_completed',
      PAYMENT_RECEIVED: 'payment_received',
      SYSTEM_MAINTENANCE: 'system_maintenance',
      APP_UPDATE: 'app_update'
    };

    // User preferences
    this.preferences = {
      enablePushNotifications: true,
      enableInAppNotifications: true,
      enableSound: true,
      enableVibration: true,
      enableBadge: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      messageNotifications: {
        enabled: true,
        sound: 'default',
        vibration: true
      },
      jobNotifications: {
        enabled: true,
        sound: 'default',
        vibration: true
      },
      systemNotifications: {
        enabled: true,
        sound: 'default',
        vibration: false
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    // Push notifications are disabled
    console.log('EnhancedNotificationService: Push notifications are disabled');
    this.isInitialized = true;
    return;
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return false;
      }

      // Request additional permissions for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  configureNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const { data } = notification.request.content;
        
        // Check if notifications are enabled for this type
        if (!this.shouldShowNotification(data.type)) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
          };
        }

        // Check quiet hours
        if (this.isQuietHours()) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: true,
          };
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: this.preferences.enableSound,
          shouldSetBadge: this.preferences.enableBadge,
        };
      },
    });
  }

  async getPushToken() {
    try {
      if (!Device.isDevice) {
        return null;
      }

      this.expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your actual project ID
      });

      return this.expoPushToken.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  setupListeners() {
    // Listen for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationReceived(notification);
    });

    // Listen for notification responses (user tapped notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  async registerNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('message', [
        {
          identifier: 'reply',
          buttonTitle: 'Reply',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'mark_read',
          buttonTitle: 'Mark as Read',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('job_update', [
        {
          identifier: 'view_job',
          buttonTitle: 'View Job',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
      ]);
    } catch (error) {
      console.error('Error registering notification categories:', error);
    }
  }

  // ==================== NOTIFICATION SENDING ====================

  async sendMessageNotification(conversationId, senderName, messageContent, messageType = 'text') {
    try {
      const notificationId = `msg_${Date.now()}`;
      
      const content = {
        title: senderName,
        body: this.formatMessagePreview(messageContent, messageType),
        data: {
          type: this.NOTIFICATION_TYPES.NEW_MESSAGE,
          conversationId,
          senderName,
          messageContent,
          messageType,
          notificationId
        },
        categoryIdentifier: 'message',
        sound: this.preferences.messageNotifications.sound,
        badge: await this.getBadgeCount() + 1,
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // Show immediately
      });

      // Store notification
      await this.storeNotification({
        id: notificationId,
        type: this.NOTIFICATION_TYPES.NEW_MESSAGE,
        title: content.title,
        body: content.body,
        data: content.data,
        timestamp: new Date().toISOString(),
        read: false
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error sending message notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendJobNotification(jobId, jobTitle, notificationType, additionalData = {}) {
    try {
      const notificationId = `job_${Date.now()}`;
      
      const { title, body } = this.getJobNotificationContent(notificationType, jobTitle, additionalData);
      
      const content = {
        title,
        body,
        data: {
          type: notificationType,
          jobId,
          jobTitle,
          ...additionalData,
          notificationId
        },
        categoryIdentifier: 'job_update',
        sound: this.preferences.jobNotifications.sound,
        badge: await this.getBadgeCount() + 1,
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });

      // Store notification
      await this.storeNotification({
        id: notificationId,
        type: notificationType,
        title: content.title,
        body: content.body,
        data: content.data,
        timestamp: new Date().toISOString(),
        read: false
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error sending job notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSystemNotification(title, body, notificationType = this.NOTIFICATION_TYPES.SYSTEM_MAINTENANCE) {
    try {
      const notificationId = `sys_${Date.now()}`;
      
      const content = {
        title,
        body,
        data: {
          type: notificationType,
          notificationId
        },
        categoryIdentifier: 'system',
        sound: this.preferences.systemNotifications.sound,
        badge: await this.getBadgeCount() + 1,
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null,
      });

      // Store notification
      await this.storeNotification({
        id: notificationId,
        type: notificationType,
        title: content.title,
        body: content.body,
        data: content.data,
        timestamp: new Date().toISOString(),
        read: false
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error sending system notification:', error);
      return { success: false, error: error.message };
    }
  }

  async scheduleReminder(title, body, triggerDate, data = {}) {
    try {
      const notificationId = `rem_${Date.now()}`;
      
      const content = {
        title,
        body,
        data: {
          type: this.NOTIFICATION_TYPES.REMINDER,
          ...data,
          notificationId
        },
        sound: 'default',
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { date: triggerDate },
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== NOTIFICATION HANDLING ====================

  handleNotificationReceived(notification) {
    
    // Update badge count
    this.updateBadgeCount();
    
    // Store in-app notification
    this.addInAppNotification(notification);
    
    // Trigger any custom handlers
    this.triggerNotificationHandlers(notification);
  }

  handleNotificationResponse(response) {
    
    const { data } = response.notification.request.content;
    
    // Mark notification as read
    this.markNotificationAsRead(data.notificationId);
    
    // Handle different notification types
    switch (data.type) {
      case this.NOTIFICATION_TYPES.NEW_MESSAGE:
        this.handleMessageNotificationResponse(data);
        break;
      case this.NOTIFICATION_TYPES.JOB_CREATED:
      case this.NOTIFICATION_TYPES.JOB_ASSIGNED:
      case this.NOTIFICATION_TYPES.JOB_COMPLETED:
        this.handleJobNotificationResponse(data);
        break;
      default:
    }
  }

  handleMessageNotificationResponse(data) {
    // Navigate to conversation
    // This would typically be handled by the navigation system
  }

  handleJobNotificationResponse(data) {
    // Navigate to job details
  }

  // ==================== NOTIFICATION MANAGEMENT ====================

  async storeNotification(notification) {
    this.notifications.unshift(notification);
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    await this.saveNotifications();
  }

  async markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveNotifications();
    }
  }

  async markAllNotificationsAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    await this.saveNotifications();
  }

  async clearAllNotifications() {
    this.notifications = [];
    await this.saveNotifications();
    await Notifications.dismissAllNotificationsAsync();
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // ==================== PREFERENCES ====================

  async loadPreferences() {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  async savePreferences() {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  async updatePreference(key, value) {
    this.preferences[key] = value;
    await this.savePreferences();
  }

  // ==================== UTILITY METHODS ====================

  formatMessagePreview(content, messageType) {
    switch (messageType) {
      case 'text':
        return content.length > 50 ? content.substring(0, 50) + '...' : content;
      case 'image':
        return '📷 Photo';
      case 'audio':
        return '🎵 Voice message';
      case 'video':
        return '🎥 Video';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      default:
        return 'New message';
    }
  }

  getJobNotificationContent(notificationType, jobTitle, additionalData) {
    switch (notificationType) {
      case this.NOTIFICATION_TYPES.JOB_CREATED:
        return {
          title: 'New Job Available',
          body: `${jobTitle} - New job posted in your area`
        };
      case this.NOTIFICATION_TYPES.JOB_ASSIGNED:
        return {
          title: 'Job Assigned',
          body: `You've been assigned to: ${jobTitle}`
        };
      case this.NOTIFICATION_TYPES.JOB_COMPLETED:
        return {
          title: 'Job Completed',
          body: `${jobTitle} has been completed`
        };
      case this.NOTIFICATION_TYPES.PAYMENT_RECEIVED:
        return {
          title: 'Payment Received',
          body: `Payment received for: ${jobTitle}`
        };
      default:
        return {
          title: 'Job Update',
          body: `Update for: ${jobTitle}`
        };
    }
  }

  shouldShowNotification(notificationType) {
    switch (notificationType) {
      case this.NOTIFICATION_TYPES.NEW_MESSAGE:
        return this.preferences.messageNotifications.enabled;
      case this.NOTIFICATION_TYPES.JOB_CREATED:
      case this.NOTIFICATION_TYPES.JOB_ASSIGNED:
      case this.NOTIFICATION_TYPES.JOB_COMPLETED:
      case this.NOTIFICATION_TYPES.PAYMENT_RECEIVED:
        return this.preferences.jobNotifications.enabled;
      case this.NOTIFICATION_TYPES.SYSTEM_MAINTENANCE:
      case this.NOTIFICATION_TYPES.APP_UPDATE:
        return this.preferences.systemNotifications.enabled;
      default:
        return true;
    }
  }

  isQuietHours() {
    if (!this.preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  async updateBadgeCount() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    await Notifications.setBadgeCountAsync(unreadCount);
  }

  addInAppNotification(notification) {
    // This would typically be handled by a context or state management system
  }

  triggerNotificationHandlers(notification) {
    // This would trigger any custom notification handlers
  }

  // ==================== DATA PERSISTENCE ====================

  async loadNotifications() {
    try {
      const stored = await AsyncStorage.getItem('notification_history');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  async saveNotifications() {
    try {
      await AsyncStorage.setItem('notification_history', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // ==================== CLEANUP ====================

  async cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // ==================== GETTERS ====================

  getNotifications() {
    return this.notifications;
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  getPreferences() {
    return this.preferences;
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }
}

// Export singleton instance
export default new EnhancedNotificationService();
