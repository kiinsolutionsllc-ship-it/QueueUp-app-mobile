import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import IconFallback from '../../components/shared/IconFallback';
import MaterialButton from '../../components/shared/MaterialButton';
import PushNotificationService from '../../services/PushNotificationService';
import EmailSmsNotificationService from '../../services/EmailSmsNotificationService';


interface NotificationSettingsScreenProps {
  navigation: any;
}
export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // State for different notification types
  const [pushPreferences, setPushPreferences] = useState<any>({});
  const [emailSmsPreferences, setEmailSmsPreferences] = useState<any>({});
  const [calendarPreferences, setCalendarPreferences] = useState<any>({});
  const [loading, setLoading] = useState<any>(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Load push notification preferences
      const pushPrefs = PushNotificationService.getNotificationPreferences();
      setPushPreferences(pushPrefs);

      // Load email/SMS preferences
      const emailSmsPrefs = EmailSmsNotificationService.getPreferences();
      setEmailSmsPreferences(emailSmsPrefs);

      // Calendar integration removed

    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePushPreferences = async (newPreferences) => {
    try {
      const result = await PushNotificationService.saveNotificationPreferences(newPreferences);
      if (result.success) {
        setPushPreferences(newPreferences);
      } else {
        Alert.alert('Error', 'Failed to save push notification preferences');
      }
    } catch (error) {
      console.error('Error saving push preferences:', error);
      Alert.alert('Error', 'Failed to save push notification preferences');
    }
  };

  const saveEmailSmsPreferences = async (newPreferences) => {
    try {
      const result = await EmailSmsNotificationService.savePreferences(newPreferences);
      if (result.success) {
        setEmailSmsPreferences(newPreferences);
      } else {
        Alert.alert('Error', 'Failed to save email/SMS preferences');
      }
    } catch (error) {
      console.error('Error saving email/SMS preferences:', error);
      Alert.alert('Error', 'Failed to save email/SMS preferences');
    }
  };

  const saveCalendarPreferences = async (newPreferences) => {
    // Calendar integration removed
  };

  const testPushNotification = async () => {
    try {
      const token = PushNotificationService.getExpoPushToken();
      if (!token) {
        Alert.alert('Error', 'Push notification token not available');
        return;
      }

      const result = await PushNotificationService.sendPushNotification(
        token,
        'Test Notification',
        'This is a test push notification from QueueUp App',
        { test: true }
      );

      if (result.success) {
        Alert.alert('Success', 'Test push notification sent!');
      } else {
        Alert.alert('Error', 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error testing push notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const testEmailNotification = async () => {
    try {
      if (!user?.email) {
        Alert.alert('Error', 'No email address found in your profile');
        return;
      }

      const result = await EmailSmsNotificationService.testEmailNotification(user.email);
      if (result.success) {
        Alert.alert('Success', 'Test email sent! Check your inbox.');
      } else {
        Alert.alert('Error', 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email notification:', error);
      Alert.alert('Error', 'Failed to send test email');
    }
  };

  const testSmsNotification = async () => {
    try {
      if (!user?.phone) {
        Alert.alert('Error', 'No phone number found in your profile');
        return;
      }

      const result = await EmailSmsNotificationService.testSmsNotification(user.phone);
      if (result.success) {
        Alert.alert('Success', 'Test SMS sent! Check your phone.');
      } else {
        Alert.alert('Error', 'Failed to send test SMS');
      }
    } catch (error) {
      console.error('Error testing SMS notification:', error);
      Alert.alert('Error', 'Failed to send test SMS');
    }
  };

  const renderPreferenceSection = (title, icon, children) => (
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
      <View style={styles.sectionHeader}>
        <IconFallback name={icon} size={24} color={theme.primary} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const renderToggle = (label, value, onValueChange, description = null) => (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.divider, true: theme.primary + '40' }}
        thumbColor={value ? theme.primary : theme.textSecondary}
      />
    </View>
  );

  const renderTestButton = (label, onPress, icon = 'send') => (
    <TouchableOpacity
      style={[styles.testButton, { borderColor: theme.primary }]}
      onPress={onPress}
    >
      <IconFallback name={icon} size={16} color={theme.primary} />
      <Text style={[styles.testButtonText, { color: theme.primary }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Notification Preferences
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Manage your notification settings
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        {renderPreferenceSection(
          'Push Notifications',
          'notifications',
          <View>
            {renderToggle(
              'Direct Bookings',
              pushPreferences.directBookings,
              (value) => savePushPreferences({ ...pushPreferences, directBookings: value }),
              'Get notified when you receive new direct bookings'
            )}
            {renderToggle(
              'Schedule Updates',
              pushPreferences.scheduleUpdates,
              (value) => savePushPreferences({ ...pushPreferences, scheduleUpdates: value }),
              'Get notified when bookings are scheduled or rescheduled'
            )}
            {renderToggle(
              'Job Reminders',
              pushPreferences.jobReminders,
              (value) => savePushPreferences({ ...pushPreferences, jobReminders: value }),
              'Get reminded before upcoming jobs'
            )}
            {renderToggle(
              'Change Orders',
              pushPreferences.changeOrders,
              (value) => savePushPreferences({ ...pushPreferences, changeOrders: value }),
              'Get notified about change order updates'
            )}
            {renderToggle(
              'Sound',
              pushPreferences.soundEnabled,
              (value) => savePushPreferences({ ...pushPreferences, soundEnabled: value }),
              'Play sound for notifications'
            )}
            {renderToggle(
              'Vibration',
              pushPreferences.vibrationEnabled,
              (value) => savePushPreferences({ ...pushPreferences, vibrationEnabled: value }),
              'Vibrate for notifications'
            )}
            <View style={styles.testButtonContainer}>
              {renderTestButton('Test Push Notification', testPushNotification, 'notifications')}
            </View>
          </View>
        )}

        {/* Email Notifications */}
        {renderPreferenceSection(
          'Email Notifications',
          'email',
          <View>
            {renderToggle(
              'Enable Email Notifications',
              emailSmsPreferences.email?.enabled,
              (value) => saveEmailSmsPreferences({
                ...emailSmsPreferences,
                email: { ...emailSmsPreferences.email, enabled: value }
              }),
              'Receive email notifications for important updates'
            )}
            {emailSmsPreferences.email?.enabled && (
              <>
                {renderToggle(
                  'Direct Bookings',
                  emailSmsPreferences.email?.directBookings,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    email: { ...emailSmsPreferences.email, directBookings: value }
                  }),
                  'Get email notifications for new direct bookings'
                )}
                {renderToggle(
                  'Schedule Updates',
                  emailSmsPreferences.email?.scheduleUpdates,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    email: { ...emailSmsPreferences.email, scheduleUpdates: value }
                  }),
                  'Get email notifications for schedule changes'
                )}
                {renderToggle(
                  'Change Orders',
                  emailSmsPreferences.email?.changeOrders,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    email: { ...emailSmsPreferences.email, changeOrders: value }
                  }),
                  'Get email notifications for change orders'
                )}
                <View style={styles.testButtonContainer}>
                  {renderTestButton('Test Email', testEmailNotification, 'email')}
                </View>
              </>
            )}
          </View>
        )}

        {/* SMS Notifications */}
        {renderPreferenceSection(
          'SMS Notifications',
          'sms',
          <View>
            {renderToggle(
              'Enable SMS Notifications',
              emailSmsPreferences.sms?.enabled,
              (value) => saveEmailSmsPreferences({
                ...emailSmsPreferences,
                sms: { ...emailSmsPreferences.sms, enabled: value }
              }),
              'Receive SMS notifications for urgent updates'
            )}
            {emailSmsPreferences.sms?.enabled && (
              <>
                {renderToggle(
                  'Direct Bookings',
                  emailSmsPreferences.sms?.directBookings,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    sms: { ...emailSmsPreferences.sms, directBookings: value }
                  }),
                  'Get SMS notifications for new direct bookings'
                )}
                {renderToggle(
                  'Schedule Updates',
                  emailSmsPreferences.sms?.scheduleUpdates,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    sms: { ...emailSmsPreferences.sms, scheduleUpdates: value }
                  }),
                  'Get SMS notifications for schedule changes'
                )}
                {renderToggle(
                  'Change Orders',
                  emailSmsPreferences.sms?.changeOrders,
                  (value) => saveEmailSmsPreferences({
                    ...emailSmsPreferences,
                    sms: { ...emailSmsPreferences.sms, changeOrders: value }
                  }),
                  'Get SMS notifications for change orders'
                )}
                <View style={styles.testButtonContainer}>
                  {renderTestButton('Test SMS', testSmsNotification, 'sms')}
                </View>
              </>
            )}
          </View>
        )}

        {/* Calendar Integration */}
        {renderPreferenceSection(
          'Calendar Integration',
          'event',
          <View>
            {renderToggle(
              'Enable Calendar Integration',
              calendarPreferences.enabled,
              (value) => saveCalendarPreferences({ ...calendarPreferences, enabled: value }),
              'Automatically create calendar events for bookings'
            )}
            {calendarPreferences.enabled && (
              <>
                {renderToggle(
                  'Auto-Create Events',
                  calendarPreferences.autoCreateEvents,
                  (value) => saveCalendarPreferences({ ...calendarPreferences, autoCreateEvents: value }),
                  'Automatically create calendar events when bookings are scheduled'
                )}
                {renderToggle(
                  'Include Reminders',
                  calendarPreferences.includeReminders,
                  (value) => saveCalendarPreferences({ ...calendarPreferences, includeReminders: value }),
                  'Add reminders to calendar events'
                )}
                {renderToggle(
                  'Sync with Device Calendar',
                  calendarPreferences.syncWithDeviceCalendar,
                  (value) => saveCalendarPreferences({ ...calendarPreferences, syncWithDeviceCalendar: value }),
                  'Sync events with your device calendar app'
                )}
              </>
            )}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  testButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
