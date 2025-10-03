import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Custom hook to get the current notification count
 * Returns the unread notification count for the current user
 */
export const useNotificationCount = () => {
  try {
    const context = useContext(NotificationContext);
    
    if (!context) {
      console.warn('useNotificationCount must be used within a NotificationProvider');
      return {
        unreadCount: 0,
        notifications: [],
        loading: false,
        markAsRead: () => {},
        markAllAsRead: () => {},
        deleteNotification: () => {},
        clearAllNotifications: () => {},
        refreshNotifications: () => {}
      };
    }

    const { unreadCount, notifications, loading, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, refreshNotifications } = context;

    return {
      unreadCount: unreadCount || 0,
      notifications: notifications || [],
      loading: loading || false,
      markAsRead: markAsRead || (() => {}),
      markAllAsRead: markAllAsRead || (() => {}),
      deleteNotification: deleteNotification || (() => {}),
      clearAllNotifications: clearAllNotifications || (() => {}),
      refreshNotifications: refreshNotifications || (() => {})
    };
  } catch (error) {
    console.error('Error in useNotificationCount:', error);
    return {
      unreadCount: 0,
      notifications: [],
      loading: false,
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      clearAllNotifications: () => {},
      refreshNotifications: () => {}
    };
  }
};

export default useNotificationCount;
