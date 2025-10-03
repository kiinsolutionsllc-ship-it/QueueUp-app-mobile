// Enhanced Notification Service
// Handles all notification operations for job updates and system events
// Uses Supabase for data storage and Firebase for push notifications
import { safeSupabase, TABLES } from '../config/supabaseConfig';
import PushNotificationService from './PushNotificationService';
import EmailSmsNotificationService from './EmailSmsNotificationService';

class NotificationService {
  constructor() {
    this.notifications = []; // In-memory cache for notifications
    this.isInitialized = false;
  }

  // Initialize the notification service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadNotifications();
      
      // Initialize Firebase push notification service for Play Store deployment
      await PushNotificationService.initialize();
      await EmailSmsNotificationService.initialize();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('NotificationService: Error initializing:', error);
      this.notifications = [];
      this.isInitialized = true;
    }
  }

  // Load notifications from Supabase
  async loadNotifications() {
    try {
      if (!safeSupabase) {
        console.warn('NotificationService: Supabase not configured, using empty array');
        this.notifications = [];
        return;
      }

      const { data, error } = await safeSupabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Load last 100 notifications

      if (error) {
        console.error('NotificationService: Error loading notifications from Supabase:', error);
        this.notifications = [];
        return;
      }

      this.notifications = data || [];
      console.log(`NotificationService: Loaded ${this.notifications.length} notifications from Supabase`);
    } catch (error) {
      console.error('NotificationService: Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      if (!safeSupabase) {
        console.warn('NotificationService: Supabase not configured, cannot create notification');
        return { success: false, error: 'Supabase not configured' };
      }

      const notification = {
        ...notificationData,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await safeSupabase
        .from(TABLES.NOTIFICATIONS)
        .insert([notification])
        .select()
        .single();

      if (error) {
        console.error('NotificationService: Error creating notification in Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      this.notifications.unshift(data);

      // Send Firebase push notification if configured
      if (notificationData.sendPush && notificationData.userId) {
        await this.sendPushNotification(notificationData.userId, notificationData.title, notificationData.body);
      }

      return { success: true, data };
    } catch (error) {
      console.error('NotificationService: Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get notifications for a user
  async getNotificationsForUser(userId, limit = 50) {
    try {
      if (!safeSupabase) {
        console.warn('NotificationService: Supabase not configured, using local cache');
        const userNotifications = this.notifications
          .filter(n => n.user_id === userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, limit);
        return { success: true, data: userNotifications };
      }

      const { data, error } = await safeSupabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('NotificationService: Error fetching notifications from Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      if (!safeSupabase) {
        console.warn('NotificationService: Supabase not configured, updating local cache only');
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          return { success: true, data: notification };
        } else {
          return { success: false, error: 'Notification not found' };
        }
      }

      const { data, error } = await safeSupabase
        .from(TABLES.NOTIFICATIONS)
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('NotificationService: Error marking notification as read in Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        this.notifications[notificationIndex] = data;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      if (!safeSupabase) {
        console.warn('NotificationService: Supabase not configured, updating local cache only');
        const userNotifications = this.notifications.filter(n => n.user_id === userId && !n.is_read);
        userNotifications.forEach(notification => {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
        });
        return { success: true, data: userNotifications };
      }

      const { data, error } = await safeSupabase
        .from(TABLES.NOTIFICATIONS)
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('NotificationService: Error marking all notifications as read in Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      this.notifications.forEach(notification => {
        if (notification.user_id === userId && !notification.is_read) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
        }
      });

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread notification count for a user
  async getUnreadCount(userId) {
    try {
      const unreadCount = this.notifications.filter(n => n.userId === userId && !n.read).length;
      return { success: true, data: unreadCount };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        const deletedNotification = this.notifications.splice(index, 1)[0];
        return { success: true, data: deletedNotification };
      } else {
        return { success: false, error: 'Notification not found' };
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all notifications for a user
  async clearAllNotifications(userId) {
    try {
      const userNotifications = this.notifications.filter(n => n.userId === userId);
      this.notifications = this.notifications.filter(n => n.userId !== userId);
      return { success: true, data: userNotifications };
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== COMPREHENSIVE WORKFLOW NOTIFICATIONS =====

  // Job Creation Notifications
  async notifyAdmins(jobId, eventType, data = {}) {
    // Notify admin users about new job postings
    const adminUsers = ['admin1', 'admin2']; // In real app, query admin users
    
    const notifications = [];
    for (const adminId of adminUsers) {
      const notification = await this.createNotification({
        userId: adminId,
        type: eventType,
        title: 'New Job Posted',
        message: `A new job has been posted and is awaiting review.`,
        jobId,
        priority: 'medium',
        actionRequired: false,
        ...data
      });
      notifications.push(notification);
    }
    return { success: true, data: notifications };
  }

  // Job Creation - Notify Mechanics
  async notifyNewJobPosted(jobId, jobTitle, customerName, estimatedPrice) {
    // Get all mechanics from the system instead of hardcoded IDs
    const testMechanics = []; // Will be populated dynamically
    
    const notifications = [];
    for (const mechanicId of testMechanics) {
      const notification = await this.createNotification({
        userId: mechanicId,
        type: 'new_job_posted',
        title: 'New Job Available!',
        message: `${customerName} posted "${jobTitle}". Estimated value: $${estimatedPrice || 'TBD'}`,
        jobId,
        priority: 'high',
        actionRequired: false,
        category: 'job_opportunity'
      });
      notifications.push(notification);
    }
    
    return { success: true, data: notifications };
  }

  // Bidding Notifications
  async notifyCustomer(userId, jobId, eventType, data = {}) {
    const notificationTemplates = {
      'new_bid_placed': {
        title: 'New Bid Received!',
        message: `${data.mechanicName} submitted a bid of $${data.price} for your job.`,
        priority: 'high',
        actionRequired: true,
        category: 'bidding'
      },
      'bid_accepted_confirmation': {
        title: 'Bid Accepted!',
        message: `You have accepted ${data.mechanicName}'s bid. You can now schedule the work.`,
        priority: 'high',
        actionRequired: true,
        category: 'scheduling'
      },
      'job_scheduled': {
        title: 'Job Scheduled!',
        message: 'Your job has been scheduled. The mechanic will be notified.',
        priority: 'medium',
        actionRequired: false,
        category: 'scheduling'
      },
      'schedule_confirmed': {
        title: 'Schedule Confirmed!',
        message: `${data.mechanicName} has confirmed the scheduled time.`,
        priority: 'medium',
        actionRequired: false,
        category: 'scheduling'
      },
      'schedule_declined': {
        title: 'Schedule Declined',
        message: `${data.mechanicName} declined the proposed time. Please check for alternative suggestions.`,
        priority: 'high',
        actionRequired: true,
        category: 'scheduling'
      },
      'schedule_suggestion': {
        title: 'Schedule Suggestion',
        message: `${data.mechanicName} has suggested a different time for your job. Please review and respond.`,
        priority: 'high',
        actionRequired: true,
        category: 'scheduling'
      },
      'job_started': {
        title: 'Work Started!',
        message: `${data.mechanicName} has started working on your job.`,
        priority: 'medium',
        actionRequired: false,
        category: 'work_progress'
      },
      'job_completed': {
        title: 'Job Completed!',
        message: `${data.mechanicName} has completed your job. Please review and confirm completion.`,
        priority: 'high',
        actionRequired: true,
        category: 'completion'
      },
      'job_note_added': {
        title: 'Job Update',
        message: `${data.mechanicName} has added a note to your job. Check for updates.`,
        priority: 'medium',
        actionRequired: false,
        category: 'work_progress'
      },
      'job_photo_added': {
        title: 'Progress Photo',
        message: `${data.mechanicName} has shared a progress photo for your job.`,
        priority: 'medium',
        actionRequired: false,
        category: 'work_progress'
      },
      // Change Order Notifications
      'change_order_created': {
        title: 'Change Order Request',
        message: `${data.mechanicName} has requested additional work for $${data.amount}. Please review and approve.`,
        priority: 'high',
        actionRequired: true,
        category: 'change_order'
      },
      'change_order_approved': {
        title: 'Change Order Approved',
        message: `Your change order request for $${data.amount} has been approved. You can proceed with the work.`,
        priority: 'high',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_rejected': {
        title: 'Change Order Rejected',
        message: `Your change order request has been rejected. Reason: ${data.reason}`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_cancelled': {
        title: 'Change Order Cancelled',
        message: `${data.mechanicName} has cancelled the change order request.`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_expired': {
        title: 'Change Order Expired',
        message: `The change order "${data.title}" ($${data.amount}) has expired because the job was completed.`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_payment_escrow': {
        title: 'Payment in Escrow',
        message: `Payment of $${data.amount} has been received and held in escrow. Complete the work to receive payment.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      'change_order_payment_released': {
        title: 'Payment Released',
        message: `Payment of $${data.amount} has been released from escrow for your completed work.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      'change_order_payment_received': {
        title: 'Payment Received',
        message: `Payment of $${data.amount} has been received for the change order.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      'new_message': {
        title: 'New Message',
        message: data.messageContent || 'You have received a new message.',
        priority: 'medium',
        actionRequired: false,
        category: 'message'
      }
    };

    const template = notificationTemplates[eventType];
    if (!template) {
      console.warn(`NotificationService: Unknown event type: ${eventType}`);
      return { success: false, error: 'Unknown event type' };
    }

    return this.createNotification({
      userId,
      type: eventType,
      jobId,
      ...template,
      ...data
    });
  }

  async notifyMechanic(userId, jobId, eventType, data = {}) {
    const notificationTemplates = {
      'bid_accepted': {
        title: 'Bid Accepted!',
        message: `Your bid has been accepted for "${data.jobTitle}". You can now start the job.`,
        priority: 'high',
        actionRequired: true,
        category: 'bidding'
      },
      'schedule_proposed': {
        title: 'Schedule Proposed',
        message: 'A customer has proposed a schedule for your accepted job. Please review and respond.',
        priority: 'high',
        actionRequired: true,
        category: 'scheduling'
      },
      'job_cancelled': {
        title: 'Job Cancelled',
        message: `A job has been cancelled. Reason: ${data.reason || 'No reason provided'}`,
        priority: 'medium',
        actionRequired: false,
        category: 'cancellation'
      },
      // Change Order Notifications for Mechanics
      'change_order_approved': {
        title: 'Change Order Approved',
        message: `Your change order request for $${data.amount} has been approved. You can proceed with the work.`,
        priority: 'high',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_rejected': {
        title: 'Change Order Rejected',
        message: `Your change order request has been rejected. Reason: ${data.reason}`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_cancelled': {
        title: 'Change Order Cancelled',
        message: `You have cancelled the change order request.`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      'change_order_expired': {
        title: 'Change Order Expired',
        message: `Your change order "${data.title}" ($${data.amount}) has expired because the job was completed.`,
        priority: 'medium',
        actionRequired: false,
        category: 'change_order'
      },
      // Direct Booking Notifications
      'direct_booking_received': {
        title: 'New Direct Booking! 🎉',
        message: `You have received a direct booking from ${data.customerName} for "${data.jobTitle}". Estimated cost: $${data.estimatedCost}`,
        priority: 'high',
        actionRequired: true,
        category: 'direct_booking'
      },
      'direct_booking_scheduled': {
        title: 'Direct Booking Scheduled',
        message: `Your direct booking with ${data.customerName} has been scheduled for ${data.scheduledDate} at ${data.scheduledTime}`,
        priority: 'high',
        actionRequired: false,
        category: 'direct_booking'
      },
      'direct_booking_reminder': {
        title: 'Upcoming Direct Booking',
        message: `Reminder: You have a direct booking with ${data.customerName} starting in ${data.timeRemaining}`,
        priority: 'medium',
        actionRequired: false,
        category: 'direct_booking'
      },
      'change_order_payment_received': {
        title: 'Payment Received',
        message: `Payment of $${data.amount} has been received for your change order.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      // Payment Release Notifications
      'payment_released': {
        title: 'Payment Released! 💰',
        message: `Payment of $${data.amount} has been released for your completed job "${data.jobTitle}". The funds are now available in your account.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      'change_order_payment_released': {
        title: 'Change Order Payment Released! 💰',
        message: `Payment of $${data.amount} has been released for your change order. The funds are now available in your account.`,
        priority: 'high',
        actionRequired: false,
        category: 'payment'
      },
      // Rating and Review Notifications
      'rating_received': {
        title: 'New Rating Received! ⭐',
        message: `You received a ${data.rating}-star rating from ${data.customerName} for your work on "${data.jobTitle}". ${data.review ? `Review: "${data.review}"` : ''}`,
        priority: 'medium',
        actionRequired: false,
        category: 'rating'
      },
      'review_received': {
        title: 'New Review Received! 📝',
        message: `You received a new review from ${data.customerName} for your work on "${data.jobTitle}". Check your profile to see the full review.`,
        priority: 'medium',
        actionRequired: false,
        category: 'rating'
      }
    };

    const template = notificationTemplates[eventType];
    if (!template) {
      console.warn(`NotificationService: Unknown event type: ${eventType}`);
      return { success: false, error: 'Unknown event type' };
    }

    return this.createNotification({
      userId,
      type: eventType,
      jobId,
      ...template,
      ...data
    });
  }

  // Legacy method for backward compatibility
  async notifyJobAssigned(customerId, jobId, mechanicName) {
    return this.createNotification({
      userId: customerId,
      type: 'job_assigned',
      title: 'Mechanic Assigned!',
      message: `${mechanicName} has been assigned to your job and will contact you soon.`,
      jobId,
      priority: 'high',
      actionRequired: false,
    });
  }

  // ===== ADDITIONAL NOTIFICATION METHODS =====

  // Payment and Financial Notifications
  async notifyPaymentReceived(mechanicId, jobId, amount) {
    return this.createNotification({
      userId: mechanicId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You have received a payment of $${amount} for your completed job.`,
      jobId,
      priority: 'high',
      actionRequired: false,
      category: 'payment'
    });
  }

  async notifyDisputeCreated(mechanicId, jobId, customerName) {
    return this.createNotification({
      userId: mechanicId,
      type: 'dispute_created',
      title: 'Dispute Filed',
      message: `${customerName} has filed a dispute for your job. Please review and respond.`,
      jobId,
      priority: 'high',
      actionRequired: true,
      category: 'dispute'
    });
  }

  // System and Admin Notifications
  async notifySystemMaintenance(userId, message) {
    return this.createNotification({
      userId,
      type: 'system_maintenance',
      title: 'System Maintenance',
      message: message || 'The system will be under maintenance. Some features may be temporarily unavailable.',
      priority: 'medium',
      actionRequired: false,
      category: 'system'
    });
  }

  async notifyAppUpdate(userId, version) {
    return this.createNotification({
      userId,
      type: 'app_update',
      title: 'App Update Available',
      message: `A new version (${version}) is available. Update now for the latest features and improvements.`,
      priority: 'medium',
      actionRequired: false,
      category: 'system'
    });
  }

  // Enhanced notification methods with multi-channel support
  async notifyMechanicEnhanced(userId, jobId, eventType, data = {}) {
    try {
      // Create in-app notification
      const notification = await this.notifyMechanic(userId, jobId, eventType, data);
      
      // Send push notification
      const pushToken = PushNotificationService.getExpoPushToken();
      if (pushToken) {
        await this.sendPushNotificationForEvent(pushToken, eventType, data);
      }
      
      // Send email notification (if user has email)
      if (data.userEmail) {
        await this.sendEmailNotificationForEvent(data.userEmail, eventType, data);
      }
      
      // Send SMS notification (if user has phone)
      if (data.userPhone) {
        await this.sendSmsNotificationForEvent(data.userPhone, eventType, data);
      }
      
      // Create calendar event for direct bookings
      if (eventType === 'direct_booking_received' && data.jobData) {
        // Calendar integration removed
      }
      
      return notification;
    } catch (error) {
      console.error('Error sending enhanced notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send push notification for specific event
  async sendPushNotificationForEvent(pushToken, eventType, data) {
    switch (eventType) {
      case 'direct_booking_received':
        return await PushNotificationService.sendDirectBookingNotification(pushToken, data);
      case 'direct_booking_scheduled':
        return await PushNotificationService.sendScheduleUpdateNotification(pushToken, data);
      case 'direct_booking_reminder':
        return await PushNotificationService.sendJobReminderNotification(pushToken, data);
      default:
        console.log(`No push notification handler for ${eventType}`);
        return { success: false, reason: 'No handler' };
    }
  }

  // Send email notification for specific event
  async sendEmailNotificationForEvent(userEmail, eventType, data) {
    switch (eventType) {
      case 'direct_booking_received':
        return await EmailSmsNotificationService.sendDirectBookingEmail(userEmail, data);
      case 'direct_booking_scheduled':
        return await EmailSmsNotificationService.sendScheduleUpdateEmail(userEmail, data);
      default:
        console.log(`No email notification handler for ${eventType}`);
        return { success: false, reason: 'No handler' };
    }
  }

  // Send SMS notification for specific event
  async sendSmsNotificationForEvent(userPhone, eventType, data) {
    switch (eventType) {
      case 'direct_booking_received':
        return await EmailSmsNotificationService.sendDirectBookingSms(userPhone, data);
      case 'direct_booking_scheduled':
        return await EmailSmsNotificationService.sendScheduleUpdateSms(userPhone, data);
      case 'direct_booking_reminder':
        return await EmailSmsNotificationService.sendJobReminderSms(userPhone, data);
      default:
        console.log(`No SMS notification handler for ${eventType}`);
        return { success: false, reason: 'No handler' };
    }
  }

  // Send Firebase push notification
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // This will be implemented with Firebase Cloud Messaging
      // For now, we'll use the existing PushNotificationService
      await PushNotificationService.sendNotification({
        userId,
        title,
        body,
        data
      });
    } catch (error) {
      console.error('NotificationService: Error sending push notification:', error);
    }
  }

  // Add mock data for development (disabled - no mock data)
  addMockData() {
    // Mock data disabled - start with empty data
  }
}

export default new NotificationService();
