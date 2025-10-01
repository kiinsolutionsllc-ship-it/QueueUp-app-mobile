// Mock Notification Service - Full mock implementation for testing
import { MockServiceBase, simulateNetworkDelay, generateMockId, MOCK_CONSTANTS } from './MockServiceManager';

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: 'job_update' | 'payment' | 'system' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  jobId?: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface MockNotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  jobUpdates: boolean;
  paymentNotifications: boolean;
  systemAlerts: boolean;
  reminders: boolean;
}

export class MockNotificationService extends MockServiceBase {
  private notifications: MockNotification[] = [];
  private settings: Map<string, MockNotificationSettings> = new Map();

  constructor() {
    super('NotificationService');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // DISABLED FOR TESTING - No mock notifications will be created
    console.log('MockNotificationService: Mock data initialization is DISABLED for proper testing');
    this.notifications = [];
    
    // Initialize empty settings
    this.settings.clear();
  }

  // Send notification
  async sendNotification(notification: Omit<MockNotification, 'id' | 'createdAt' | 'read'>): Promise<MockNotification> {
    await simulateNetworkDelay(200, 800);

    const newNotification: MockNotification = {
      ...notification,
      id: generateMockId('notif'),
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);
    console.log(`MockNotificationService - Sent notification: ${newNotification.title}`);
    
    return newNotification;
  }

  // Get notifications for user
  async getNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<MockNotification[]> {
    await simulateNetworkDelay(100, 400);

    const userNotifications = this.notifications
      .filter(notif => notif.userId === userId)
      .slice(offset, offset + limit);

    return userNotifications;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    await simulateNetworkDelay(100, 300);

    const notification = this.notifications.find(notif => notif.id === notificationId);
    if (notification) {
      notification.read = true;
      console.log(`MockNotificationService - Marked notification as read: ${notificationId}`);
      return true;
    }
    return false;
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<number> {
    await simulateNetworkDelay(200, 500);

    let count = 0;
    this.notifications.forEach(notif => {
      if (notif.userId === userId && !notif.read) {
        notif.read = true;
        count++;
      }
    });

    console.log(`MockNotificationService - Marked ${count} notifications as read for user: ${userId}`);
    return count;
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    await simulateNetworkDelay(50, 200);

    const unreadCount = this.notifications.filter(
      notif => notif.userId === userId && !notif.read
    ).length;

    return unreadCount;
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    await simulateNetworkDelay(100, 300);

    const index = this.notifications.findIndex(notif => notif.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      console.log(`MockNotificationService - Deleted notification: ${notificationId}`);
      return true;
    }
    return false;
  }

  // Get notification settings
  async getNotificationSettings(userId: string): Promise<MockNotificationSettings | null> {
    await simulateNetworkDelay(100, 300);

    return this.settings.get(userId) || null;
  }

  // Update notification settings
  async updateNotificationSettings(userId: string, settings: Partial<MockNotificationSettings>): Promise<MockNotificationSettings> {
    await simulateNetworkDelay(200, 500);

    const currentSettings = this.settings.get(userId) || {
      userId,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      jobUpdates: true,
      paymentNotifications: true,
      systemAlerts: true,
      reminders: true,
    };

    const updatedSettings = { ...currentSettings, ...settings };
    this.settings.set(userId, updatedSettings);

    console.log(`MockNotificationService - Updated notification settings for user: ${userId}`);
    return updatedSettings;
  }

  // Send job update notification
  async sendJobUpdateNotification(jobId: string, userId: string, update: string): Promise<MockNotification> {
    return this.sendNotification({
      title: 'Job Update',
      message: update,
      type: 'job_update',
      priority: 'medium',
      userId,
      jobId,
    });
  }

  // Send payment notification
  async sendPaymentNotification(userId: string, amount: number, type: 'received' | 'sent'): Promise<MockNotification> {
    const title = type === 'received' ? 'Payment Received' : 'Payment Sent';
    const message = type === 'received' 
      ? `You received a payment of $${amount.toFixed(2)}`
      : `You sent a payment of $${amount.toFixed(2)}`;

    return this.sendNotification({
      title,
      message,
      type: 'payment',
      priority: 'high',
      userId,
    });
  }

  // Send reminder notification
  async sendReminderNotification(userId: string, title: string, message: string): Promise<MockNotification> {
    return this.sendNotification({
      title,
      message,
      type: 'reminder',
      priority: 'medium',
      userId,
    });
  }

  // Send system alert
  async sendSystemAlert(userId: string, title: string, message: string): Promise<MockNotification> {
    return this.sendNotification({
      title,
      message,
      type: 'system',
      priority: 'high',
      userId,
    });
  }

  // Clear all notifications for user
  async clearAllNotifications(userId: string): Promise<number> {
    await simulateNetworkDelay(200, 500);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(notif => notif.userId !== userId);
    const deletedCount = initialCount - this.notifications.length;

    console.log(`MockNotificationService - Cleared ${deletedCount} notifications for user: ${userId}`);
    return deletedCount;
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    await simulateNetworkDelay(100, 300);

    const userNotifications = this.notifications.filter(notif => notif.userId === userId);
    const unread = userNotifications.filter(notif => !notif.read).length;

    const byType = userNotifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = userNotifications.reduce((acc, notif) => {
      acc[notif.priority] = (acc[notif.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: userNotifications.length,
      unread,
      byType,
      byPriority,
    };
  }
}

// Export singleton instance
export const mockNotificationService = new MockNotificationService();
export default mockNotificationService;
