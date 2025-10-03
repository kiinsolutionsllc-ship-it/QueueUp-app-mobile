import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { hapticService } from '../../services/HapticService';
import { useNotificationCount } from '../../hooks/useNotificationCount';

export default function ModernHeader({ 
  title, 
  subtitle = '', 
  showBack = false, 
  onBackPress = () => {},
  rightActions = [],
  showNotifications = true,
  onNotificationPress = () => {},
  showProfile = true,
  profileAvatar = '👤',
  onProfilePress = () => {},
  notificationCount = null, // Allow override, but default to context
  showStatusBar = true,
  user = null,
  showGreeting = false,
  showThemeToggle = false}) {
  const { getCurrentTheme, isDarkMode } = useTheme();
  const { userType } = useAuth();
  
  // Get notification count with fallback
  const { unreadCount } = useNotificationCount();
  
  const theme = getCurrentTheme(userType);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Use provided notificationCount or fall back to context unreadCount
  const displayNotificationCount = notificationCount !== null ? notificationCount : unreadCount;


  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
      
      setCurrentTime(timeString);
      setCurrentDate(dateString);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
        translucent={false}
      />
      
      {/* Status Bar Area */}
      {showStatusBar && (
        <View style={styles.statusBar}>
          <View style={styles.timeContainer}>
            <Text style={[styles.time, { color: theme.text }]}>{currentTime}</Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{currentDate}</Text>
          </View>
          <View style={styles.statusIcons}>
            <IconFallback name="signal-cellular-4-bar" size={16} color={theme.text} />
            <IconFallback name="wifi" size={16} color={theme.text} />
            <IconFallback name="battery-full" size={16} color={theme.text} />
          </View>
        </View>
      )}

      {/* Header Content */}
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={async () => {
                await hapticService.buttonPress();
                onBackPress?.();
              }} 
              style={styles.backButton}
            >
              <IconFallback name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.titleSection}>
            <Text 
              style={[styles.title, { color: theme.text }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                style={[styles.subtitle, { color: theme.textSecondary }]} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            )}
        </View>

        <View style={styles.rightSection}>
          {rightActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={async () => {
                await hapticService.buttonPress();
                action.onPress?.();
              }}
              style={styles.actionButton}
            >
              <IconFallback name={action.icon} size={24} color={action.color || theme.text} />
              {action.badge && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={[styles.badgeText, { color: theme.onError }]}>
                    {action.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {showNotifications && (
            <TouchableOpacity
              style={styles.actionButton} 
              onPress={async () => {
                await hapticService.buttonPress();
                onNotificationPress?.();
              }}
            >
              <IconFallback name="notifications" size={24} color={userType === 'customer' ? theme.primary : theme.text} />
              {displayNotificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={[styles.badgeText, { color: theme.onError }]}>
                    {displayNotificationCount > 9 ? '9+' : displayNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {/* Theme Toggle Button - Disabled (light theme only) */}
          {/* {showThemeToggle && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                await hapticService.buttonPress();
                // toggleTheme(); // Disabled - light theme only
              }}
            >
              <IconFallback 
                name="palette" 
                size={24} 
                color="#7C3AED" 
              />
            </TouchableOpacity>
          )} */}
          
          {showProfile && (
            <TouchableOpacity
              style={styles.profileButton}
              onPress={async () => {
                await hapticService.buttonPress();
                onProfilePress?.();
              }}
            >
              <View style={[styles.avatar, { backgroundColor: userType === 'customer' ? theme.primary : theme.accentLight }]}>
                {user?.avatar && user.avatar.startsWith('file://') ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[styles.avatarText, { color: '#333333' }]}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : profileAvatar}
                  </Text>
                )}
              </View>
              {displayNotificationCount > 0 && (
                <View style={[styles.badge, styles.profileBadge, { backgroundColor: theme.error }]}>
                  <Text style={[styles.badgeText, { color: theme.onError }]}>
                    {displayNotificationCount > 9 ? '9+' : displayNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 44, // Status bar height
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8},
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8},
  time: {
    fontSize: 16,
    fontWeight: '700'},
  date: {
    fontSize: 12,
    fontWeight: '500'},
  statusIcons: {
    flexDirection: 'row',
    gap: 6},
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 20,
    paddingVertical: 16,
    minHeight: 80},
  leftSection: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60},
  backButton: {
    marginRight: 12,
    padding: 4},
  titleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingRight: 16,
    marginLeft: -20},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2},
  subtitle: {
    fontSize: 14},
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0,
    justifyContent: 'flex-end',
    minWidth: 100},
  actionButton: {
    padding: 8,
    position: 'relative'},
  profileButton: {
    padding: 4,
    position: 'relative'},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3},
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold'},
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22},
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4},
  profileBadge: {
    top: 0,
    right: 0},
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold'}});
