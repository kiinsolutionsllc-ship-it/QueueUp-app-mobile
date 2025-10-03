// Email/SMS Notification Service
// Simplified version to avoid errors
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAIL_SMS_PREFERENCES_KEY = 'email_sms_preferences';

class EmailSmsNotificationService {
  constructor() {
    this.isInitialized = false;
    this.preferences = {
      email: {
        enabled: true,
        directBookings: true,
        scheduleUpdates: true,
        jobReminders: true,
        changeOrders: true,
        generalUpdates: false,
      },
      sms: {
        enabled: true,
        directBookings: true,
        scheduleUpdates: true,
        jobReminders: false,
        changeOrders: true,
        generalUpdates: false,
      },
    };
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadPreferences();
      this.isInitialized = true;
      console.log('EmailSmsNotificationService initialized successfully');
    } catch (error) {
      console.error('EmailSmsNotificationService: Error initializing:', error);
    }
  }

  // Load preferences from storage
  async loadPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(EMAIL_SMS_PREFERENCES_KEY);
      if (preferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(preferences) };
      }
    } catch (error) {
      console.error('Error loading email/SMS preferences:', error);
    }
  }

  // Save preferences to storage
  async savePreferences(preferences) {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await AsyncStorage.setItem(EMAIL_SMS_PREFERENCES_KEY, JSON.stringify(this.preferences));
      return { success: true };
    } catch (error) {
      console.error('Error saving email/SMS preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Replace template variables
  replaceTemplateVariables(template, variables) {
    let result = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, variables[key] || '');
    });
    return result;
  }

  // Send email notification
  async sendEmailNotification(recipientEmail, eventType, data) {
    if (!this.preferences.email.enabled || !this.preferences.email[eventType]) {
      console.log(`Email notifications disabled for ${eventType}`);
      return { success: false, reason: 'disabled' };
    }

    try {
      // Simple email template
      const emailTemplate = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Booking Notification</h2>
            <p><strong>Customer:</strong> ${data.customerName || 'Customer'}</p>
            <p><strong>Service:</strong> ${data.jobTitle || 'Service Request'}</p>
            <p><strong>Price:</strong> $${data.price || 'TBD'}</p>
            <p><strong>Location:</strong> ${data.location || 'Location TBD'}</p>
            <p>Please check your QueueUp app for more details.</p>
          </body>
        </html>
      `;

      const emailData = {
        to: recipientEmail,
        subject: 'New Booking - QueueUp App',
        html: emailTemplate,
      };

      // Mock email sending
      console.log('Sending email:', emailData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, emailData };
    } catch (error) {
      console.error('Error sending email notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS notification
  async sendSmsNotification(recipientPhone, eventType, data) {
    if (!this.preferences.sms.enabled || !this.preferences.sms[eventType]) {
      console.log(`SMS notifications disabled for ${eventType}`);
      return { success: false, reason: 'disabled' };
    }

    try {
      // Simple SMS template
      const smsMessage = `New booking: ${data.customerName || 'Customer'} - ${data.jobTitle || 'Service'} - $${data.price || 'TBD'}. Check QueueUp app.`;

      const smsData = {
        to: recipientPhone,
        message: smsMessage,
      };

      // Mock SMS sending
      console.log('Sending SMS:', smsData);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, smsData };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Send direct booking email notification
  async sendDirectBookingEmail(mechanicEmail, jobData) {
    return await this.sendEmailNotification(mechanicEmail, 'directBookings', {
      customerName: jobData.customerName || 'Customer',
      jobTitle: jobData.jobTitle || jobData.title || 'Service Request',
      price: jobData.price || jobData.budget || 'TBD',
      location: jobData.location || 'Location TBD',
    });
  }

  // Send direct booking SMS notification
  async sendDirectBookingSms(mechanicPhone, jobData) {
    return await this.sendSmsNotification(mechanicPhone, 'directBookings', {
      customerName: jobData.customerName || 'Customer',
      jobTitle: jobData.jobTitle || jobData.title || 'Service Request',
      price: jobData.price || jobData.budget || 'TBD',
    });
  }

  // Send schedule update email notification
  async sendScheduleUpdateEmail(mechanicEmail, jobData) {
    return await this.sendEmailNotification(mechanicEmail, 'scheduleUpdates', {
      customerName: jobData.customerName || 'Customer',
      jobTitle: jobData.jobTitle || jobData.title || 'Service Request',
      scheduledDate: jobData.scheduledDate || 'TBD',
      scheduledTime: jobData.scheduledTime || 'TBD',
      location: jobData.location || 'Location TBD',
    });
  }

  // Send schedule update SMS notification
  async sendScheduleUpdateSms(mechanicPhone, jobData) {
    return await this.sendSmsNotification(mechanicPhone, 'scheduleUpdates', {
      customerName: jobData.customerName || 'Customer',
      jobTitle: jobData.jobTitle || jobData.title || 'Service Request',
      scheduledDate: jobData.scheduledDate || 'TBD',
      scheduledTime: jobData.scheduledTime || 'TBD',
      location: jobData.location || 'Location TBD',
    });
  }

  // Send job reminder SMS notification
  async sendJobReminderSms(mechanicPhone, jobData) {
    return await this.sendSmsNotification(mechanicPhone, 'jobReminders', {
      customerName: jobData.customerName || 'Customer',
      timeRemaining: jobData.timeRemaining || 'soon',
    });
  }

  // Get current preferences
  getPreferences() {
    return { ...this.preferences };
  }

  // Test email notification
  async testEmailNotification(recipientEmail, eventType = 'directBookings') {
    const testData = {
      customerName: 'John Doe',
      jobTitle: 'Oil Change',
      price: '75',
      location: '123 Main St, City, State',
    };

    return await this.sendEmailNotification(recipientEmail, eventType, testData);
  }

  // Test SMS notification
  async testSmsNotification(recipientPhone, eventType = 'directBookings') {
    const testData = {
      customerName: 'John Doe',
      jobTitle: 'Oil Change',
      price: '75',
    };

    return await this.sendSmsNotification(recipientPhone, eventType, testData);
  }
}

// Export singleton instance
export default new EmailSmsNotificationService();