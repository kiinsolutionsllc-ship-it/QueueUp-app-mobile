// Notifications Screen
// Displays all notifications for the current user

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import IconFallback from '../../components/shared/IconFallback';
import { hapticService } from '../../services/HapticService';

const NotificationsScreen = ({ navigation }: any) => {
  const { getCurrentTheme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
    refreshNotifications 
  } = useNotifications();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const [refreshing, setRefreshing] = useState<any>(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    // Add haptic feedback
    await hapticService.buttonPress();
    
    // Mark as read first
    await handleMarkAsRead(notification);
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'new_bid_placed':
        // Navigate to bid comparison screen
        if (notification.jobId) {
          navigation.navigate('BidComparison', { jobId: notification.jobId });
        }
        break;
        
      case 'bid_accepted_confirmation':
        // Navigate to scheduling screen
        if (notification.jobId) {
          navigation.navigate('Scheduling', { jobId: notification.jobId });
        }
        break;
        
      case 'job_scheduled':
      case 'schedule_confirmed':
      case 'schedule_declined':
        // Navigate to jobs screen to view scheduled jobs
        navigation.navigate('Jobs');
        break;
        
      case 'job_started':
        // Navigate to jobs screen to view in-progress jobs
        navigation.navigate('Jobs');
        break;
        
      case 'job_completed':
        // Navigate to job completion review screen
        if (notification.jobId) {
          navigation.navigate('JobCompletion', { jobId: notification.jobId });
        }
        break;
        
      case 'new_job_posted':
        // Navigate to available jobs for mechanics
        navigation.navigate('Jobs');
        break;
        
      case 'bid_accepted':
        // Navigate to assigned jobs for mechanics
        navigation.navigate('Jobs');
        break;
        
      case 'schedule_proposed':
        // Navigate to scheduled jobs for mechanics
        navigation.navigate('Jobs');
        break;
        
      case 'change_order_created':
      case 'change_order_requested':
        // Navigate to change order approval screen for customers
        if (notification.changeOrderId) {
          navigation.navigate('ChangeOrderApproval', { changeOrderId: notification.changeOrderId });
        } else if (notification.data?.changeOrderId) {
          navigation.navigate('ChangeOrderApproval', { changeOrderId: notification.data.changeOrderId });
        }
        break;
        
      case 'change_order_approved':
      case 'change_order_rejected':
      case 'change_order_cancelled':
      case 'change_order_expired':
      case 'change_order_payment_received':
        // Navigate to jobs screen to view updated job with refresh flag
        navigation.navigate('Jobs', { refreshChangeOrders: true });
        break;
        
      default:
        // For other notifications, just show an alert with the message
        Alert.alert(notification.title, notification.message);
        break;
    }
  };

  const handleDeleteNotification = (notification: any) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotification(notification.id),
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      Alert.alert(
        'Mark All as Read',
        `Mark all ${unreadCount} unread notifications as read?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Mark All Read', onPress: markAllAsRead },
        ]
      );
    }
  };

  const handleClearAll = () => {
    if (notifications.length > 0) {
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to delete all notifications? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: clearAllNotifications,
          },
        ]
      );
    }
  };

  const getNotificationIcon = (type: any) => {
    const iconMap = {
      'new_job_posted': 'work',
      'new_bid_placed': 'attach_money',
      'bid_accepted': 'check_circle',
      'bid_accepted_confirmation': 'check_circle',
      'job_scheduled': 'schedule',
      'schedule_proposed': 'schedule',
      'schedule_confirmed': 'check_circle',
      'schedule_declined': 'cancel',
      'job_started': 'play_circle',
      'job_completed': 'done_all',
      'payment_received': 'payment',
      'dispute_created': 'warning',
      'system_maintenance': 'build',
      'app_update': 'system_update',
      'change_order_created': 'add_circle',
      'change_order_requested': 'add_circle',
      'change_order_approved': 'check_circle',
      'change_order_rejected': 'cancel',
      'change_order_cancelled': 'cancel',
      'change_order_expired': 'schedule',
      'change_order_payment_received': 'payment',
    };
    return iconMap[type as keyof typeof iconMap] || 'notifications';
  };

  const getNotificationColor = (priority: any, read: any) => {
    if (read) return theme.textSecondary;
    
    switch (priority) {
      case 'high': return theme.error || '#F44336';
      case 'medium': return theme.warning || '#FF9800';
      case 'low': return theme.info || '#2196F3';
      default: return theme.primary;
    }
  };

  const renderNotification = ({ item: notification }: any) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: notification.read ? theme.cardBackground : theme.primaryLight,
          borderLeftColor: getNotificationColor(notification.priority, notification.read),
        }
      ]}
      onPress={() => handleNotificationPress(notification)}
      onLongPress={() => handleDeleteNotification(notification)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIconContainer}>
            <IconFallback
              name={getNotificationIcon(notification.type)}
              size={24}
              color={getNotificationColor(notification.priority, notification.read)}
            />
            {!notification.read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
          </View>
          <View style={styles.notificationTextContainer}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
              {notification.message}
            </Text>
            <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>
              {new Date(notification.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.notificationActions}>
          {notification.actionRequired && (
            <View style={[styles.actionRequiredBadge, { backgroundColor: theme.warning }]}>
              <Text style={[styles.actionRequiredText, { color: 'white' }]}>
                Action Required
              </Text>
            </View>
          )}
          <IconFallback
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconFallback name="notifications_none" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyStateMessage, { color: theme.textSecondary }]}>
        You'll receive notifications about job updates, bids, and important updates here.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <ResponsiveContainer>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Heading3 style={{ color: theme.text }}>Notifications</Heading3>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.unreadBadgeText, { color: 'white' }]}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                onPress={handleMarkAllAsRead}
              >
                <Text style={[styles.actionButtonText, { color: 'white' }]}>
                  Mark All Read
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.error }]}
              onPress={handleClearAll}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ResponsiveContainer>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notificationItem: {
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionRequiredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionRequiredText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;
