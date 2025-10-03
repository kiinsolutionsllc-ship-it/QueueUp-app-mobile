import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';


interface NotificationScreenProps {
  navigation: any;
}
export default function NotificationScreen({ navigation }: NotificationScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const theme = getCurrentTheme();
  
  const closeScreen = () => {
    navigation.goBack();
  };

  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: 'New Job Available',
      message: 'A new automotive service request is available in your area',
      time: '2 minutes ago',
      type: 'job',
      read: false,
    },
    {
      id: 2,
      title: 'Payment Received',
      message: 'Payment of $150 has been processed for Job #1234',
      time: '1 hour ago',
      type: 'payment',
      read: true,
    },
    {
      id: 3,
      title: 'Job Completed',
      message: 'Customer has rated your service 5 stars',
      time: '3 hours ago',
      type: 'rating',
      read: true,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return 'work';
      case 'payment':
        return 'payment';
      case 'rating':
        return 'star';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job':
        return theme.primary;
      case 'payment':
        return '#4CAF50';
      case 'rating':
        return '#FF9800';
      default:
        return theme.textLight;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title={t('notifications')}
        onBackPress={() => navigation.goBack()}
        showBack
        showNotifications={false}
        showProfile={false}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconFallback name="notifications-none" size={64} color={theme.textLight} />
            <Text style={[styles.emptyText, { color: theme.textLight }]}>
              {t('noNotifications')}
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <MaterialCard key={notification.id} style={styles.notificationCard}>
              <TouchableOpacity style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: getNotificationColor(notification.type) + '20' }
                  ]}>
                    <IconFallback name={getNotificationIcon(notification.type)} size={24} color={getNotificationColor(notification.type)} />
                  </View>
                  <View style={styles.notificationText}>
                    <Text style={[
                      styles.notificationTitle,
                      { color: theme.text },
                      !notification.read && styles.unreadTitle
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.textLight }]}>
                      {notification.time}
                    </Text>
                  </View>
                  {!notification.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            </MaterialCard>
          ))
        )}
      </ScrollView>
      
      {/* Close Button */}
      <View style={[styles.closeButtonContainer, { backgroundColor: theme.background }]}>
        <MaterialButton
          title="Close"
          onPress={closeScreen}
          variant="outlined"
          icon="close"
          style={styles.closeButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: 12,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  closeButtonContainer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    marginHorizontal: 0,
  },
});

