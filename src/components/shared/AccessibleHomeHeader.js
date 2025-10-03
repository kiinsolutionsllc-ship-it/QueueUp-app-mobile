import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  AccessibilityInfo,
  Image,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';
import { FadeIn } from '../shared/Animations';

const { width: screenWidth } = Dimensions.get('window');

export default function AccessibleHomeHeader({ 
  user,
  onNotificationPress,
  onProfilePress,
  notificationCount = 0,
  onWeatherPress,
  showQuickStats = true,
  // Availability status props
  availabilityStatus,
  onAvailabilityPress,
  showAvailability = false,
  accessibilityLabel,
  accessibilityHint,
}) {
  const { getCurrentTheme, isDarkMode } = useTheme();
  const theme = getCurrentTheme();
  
  // Debug user data
  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [quickStats, setQuickStats] = useState({
    activeJobs: 0,
    completedToday: 0,
    totalSpent: 0,
  });
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  useEffect(() => {
    // Check if accessibility is enabled
    AccessibilityInfo.isScreenReaderEnabled().then(setIsAccessibilityEnabled);

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
      
      // Update greeting based on time
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    // Animate header elements with reduced motion consideration
    const animationDuration = isAccessibilityEnabled ? 0 : 800;
    const slideDuration = isAccessibilityEnabled ? 0 : 600;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: slideDuration,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for notifications (only if accessibility is not enabled)
    if (!isAccessibilityEnabled && notificationCount > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }


    // Mock quick stats (in real app, fetch from API)
    setQuickStats({
      activeJobs: 2,
      completedToday: 1,
      totalSpent: 150,
    });

    return () => {
      clearInterval(interval);
    };
  }, [notificationCount, isAccessibilityEnabled, fadeAnim, pulseAnim, slideAnim]);

  const handleNotificationPress = async () => {
    await hapticService.buttonPress();
    onNotificationPress?.();
  };

  const handleProfilePress = async () => {
    await hapticService.buttonPress();
    onProfilePress?.();
  };



  const handleAvailabilityPress = async () => {
    await hapticService.buttonPress();
    onAvailabilityPress?.();
  };


  const getAvailabilityIcon = (status) => {
    switch (status) {
      case 'available': return 'check-circle';
      case 'busy': return 'schedule';
      case 'unavailable': return 'cancel';
      case 'break': return 'coffee';
      default: return 'check-circle';
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'available': return theme.success;
      case 'busy': return theme.warning;
      case 'unavailable': return theme.error;
      case 'break': return theme.info;
      default: return theme.success;
    }
  };

  const getAvailabilityName = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      case 'break': return 'On Break';
      default: return 'Available';
    }
  };

  // Responsive sizing based on screen size
  const getResponsiveSize = (baseSize) => {
    if (screenWidth < 375) return baseSize * 0.9; // Small phones
    if (screenWidth > 768) return baseSize * 1.2; // Tablets
    return baseSize;
  };

  const getResponsiveSpacing = (baseSpacing) => {
    if (screenWidth < 375) return baseSpacing * 0.8;
    if (screenWidth > 768) return baseSpacing * 1.3;
    return baseSpacing;
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || "Home screen header"}
      accessibilityHint={accessibilityHint || "Contains greeting, location, weather, and navigation options"}
      accessibilityRole="header"
    >
      <StatusBar 
        barStyle={isDarkMode() ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
        translucent={false}
      />
      
      {/* Top Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.timeContainer}>
          <Text 
            style={[styles.time, { color: theme.text, fontSize: getResponsiveSize(16) }]}
            accessible={true}
            accessibilityLabel={`Current time is ${currentTime}`}
            accessibilityRole="text"
          >
            {currentTime}
          </Text>
          <Text 
            style={[styles.date, { color: theme.textSecondary, fontSize: getResponsiveSize(12) }]}
            accessible={true}
            accessibilityLabel={`Today is ${currentDate}`}
            accessibilityRole="text"
          >
            {currentDate}
          </Text>
        </View>
        
        <View style={styles.statusIcons}>
          <IconFallback 
            name="signal-cellular-4-bar" 
            size={getResponsiveSize(16)} 
            color={theme.text} 
            accessible={true}
            accessibilityLabel="Cellular signal strength"
          />
          <IconFallback 
            name="wifi" 
            size={getResponsiveSize(16)} 
            color={theme.text} 
            accessible={true}
            accessibilityLabel="WiFi connected"
          />
          <IconFallback 
            name="battery-full" 
            size={getResponsiveSize(16)} 
            color={theme.text} 
            accessible={true}
            accessibilityLabel="Battery full"
          />
        </View>
      </View>

      {/* Main Header Content */}
      <View style={styles.headerContent}>
        {/* Left Section - Greeting and Location */}
        <View style={styles.leftSection}>
          <FadeIn delay={200}>
            <View style={styles.greetingContainer}>
              <Text 
                style={[styles.greeting, { color: theme.text, fontSize: getResponsiveSize(14) }]}
                accessible={true}
                accessibilityLabel={greeting}
                accessibilityRole="text"
              >
                {greeting}
              </Text>
              <Text 
                style={[styles.userName, { color: theme.text, fontSize: getResponsiveSize(24) }]}
                accessible={true}
                accessibilityLabel={`Welcome ${user?.name ? user.name.split(' ')[0] : 'Customer'}`}
                accessibilityRole="text"
              >
                {user?.name ? user.name.split(' ')[0] : 'Customer'}
              </Text>
            </View>
          </FadeIn>
          
        </View>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          {/* Availability Status */}
          {showAvailability && availabilityStatus && (
            <FadeIn delay={300}>
              <TouchableOpacity 
                style={[
                  styles.availabilityContainer, 
                  { 
                    backgroundColor: getAvailabilityColor(availabilityStatus) + '20',
                    borderColor: getAvailabilityColor(availabilityStatus),
                    paddingHorizontal: getResponsiveSpacing(10),
                    paddingVertical: getResponsiveSpacing(6),
                  }
                ]}
                onPress={handleAvailabilityPress}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={`Availability status: ${getAvailabilityName(availabilityStatus)}`}
                accessibilityHint="Double tap to change availability status"
                accessibilityRole="button"
              >
                <IconFallback 
                  name={getAvailabilityIcon(availabilityStatus)} 
                  size={getResponsiveSize(16)} 
                  color={getAvailabilityColor(availabilityStatus)} 
                />
                <Text 
                  style={[styles.availabilityText, { color: getAvailabilityColor(availabilityStatus), fontSize: getResponsiveSize(12) }]}
                >
                  {getAvailabilityName(availabilityStatus)}
                </Text>
              </TouchableOpacity>
            </FadeIn>
          )}
          
          {/* Notifications */}
          <FadeIn delay={350}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleNotificationPress}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
                accessibilityHint="Double tap to view notifications"
                accessibilityRole="button"
              >
                <View style={[
                  styles.iconContainer, 
                  { 
                    backgroundColor: theme.surface,
                    width: getResponsiveSize(40),
                    height: getResponsiveSize(40),
                    borderRadius: getResponsiveSize(20),
                  }
                ]}>
                  <IconFallback 
                    name="notifications" 
                    size={getResponsiveSize(20)} 
                    color={theme.text} 
                  />
                  {notificationCount > 0 && (
                    <View style={[
                      styles.badge, 
                      { 
                        backgroundColor: theme.error,
                        minWidth: getResponsiveSize(18),
                        height: getResponsiveSize(18),
                        borderRadius: getResponsiveSize(9),
                      }
                    ]}>
                      <Text style={[
                        styles.badgeText, 
                        { 
                          color: theme.onError,
                          fontSize: getResponsiveSize(10),
                        }
                      ]}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </FadeIn>
          
          {/* Profile */}
          <FadeIn delay={400}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel={`Profile for ${user?.name || 'Customer'}`}
              accessibilityHint="Double tap to view profile settings"
              accessibilityRole="button"
            >
              <View style={[
                styles.avatar, 
                { 
                  backgroundColor: theme.accentLight,
                  width: getResponsiveSize(44),
                  height: getResponsiveSize(44),
                  borderRadius: getResponsiveSize(22),
                }
              ]}>
                {user?.avatar && user.avatar.startsWith('file://') ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={[styles.avatarImage, {
                      width: getResponsiveSize(44),
                      height: getResponsiveSize(44),
                      borderRadius: getResponsiveSize(22),
                    }]}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[
                    styles.avatarText, 
                    { 
                      color: '#333333',
                      fontSize: getResponsiveSize(16),
                    }
                  ]}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '👤'}
                  </Text>
                )}
              </View>
              {notificationCount > 0 && (
                <View style={[
                  styles.badge, 
                  styles.profileBadge, 
                  { 
                    backgroundColor: theme.error,
                    minWidth: getResponsiveSize(18),
                    height: getResponsiveSize(18),
                    borderRadius: getResponsiveSize(9),
                  }
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    { 
                      color: theme.onError,
                      fontSize: getResponsiveSize(10),
                    }
                  ]}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </FadeIn>
        </View>
      </View>

      {/* Quick Stats Section */}
      {showQuickStats && (
        <FadeIn delay={600}>
          <View style={[styles.quickStatsContainer, { backgroundColor: theme.surface }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickStatsContent}
              accessible={true}
              accessibilityLabel="Quick statistics"
              accessibilityRole="scrollbar"
            >
              <View style={[
                styles.statItem, 
                { 
                  backgroundColor: theme.background,
                  paddingHorizontal: getResponsiveSpacing(12),
                  paddingVertical: getResponsiveSpacing(8),
                  minWidth: getResponsiveSize(120),
                }
              ]}>
                <IconFallback 
                  name="work" 
                  size={getResponsiveSize(16)} 
                  color={theme.primary} 
                />
                <Text style={[
                  styles.statValue, 
                  { 
                    color: theme.text,
                    fontSize: getResponsiveSize(16),
                  }
                ]}>
                  {quickStats.activeJobs}
                </Text>
                <Text style={[
                  styles.statLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: getResponsiveSize(11),
                  }
                ]}>
                  Active Jobs
                </Text>
              </View>
              
              <View style={[
                styles.statItem, 
                { 
                  backgroundColor: theme.background,
                  paddingHorizontal: getResponsiveSpacing(12),
                  paddingVertical: getResponsiveSpacing(8),
                  minWidth: getResponsiveSize(120),
                }
              ]}>
                <IconFallback 
                  name="check-circle" 
                  size={getResponsiveSize(16)} 
                  color={theme.success} 
                />
                <Text style={[
                  styles.statValue, 
                  { 
                    color: theme.text,
                    fontSize: getResponsiveSize(16),
                  }
                ]}>
                  {quickStats.completedToday}
                </Text>
                <Text style={[
                  styles.statLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: getResponsiveSize(11),
                  }
                ]}>
                  Completed Today
                </Text>
              </View>
              
              <View style={[
                styles.statItem, 
                { 
                  backgroundColor: theme.background,
                  paddingHorizontal: getResponsiveSpacing(12),
                  paddingVertical: getResponsiveSpacing(8),
                  minWidth: getResponsiveSize(120),
                }
              ]}>
                <IconFallback 
                  name="attach-money" 
                  size={getResponsiveSize(16)} 
                  color={theme.warning} 
                />
                <Text style={[
                  styles.statValue, 
                  { 
                    color: theme.text,
                    fontSize: getResponsiveSize(16),
                  }
                ]}>
                  ${quickStats.totalSpent}
                </Text>
                <Text style={[
                  styles.statLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: getResponsiveSize(11),
                  }
                ]}>
                  Total Spent
                </Text>
              </View>
            </ScrollView>
          </View>
        </FadeIn>
      )}

      {/* Decorative Elements - Hidden from screen readers */}
      <View style={styles.decorativeElements} accessibilityElementsHidden={true}>
        <View style={[styles.decorativeCircle, { backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2, { backgroundColor: theme.accent + '10' }]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle3, { backgroundColor: theme.success + '10' }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 44, // Status bar height
    position: 'relative',
    overflow: 'hidden',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  time: {
    fontWeight: '700',
  },
  date: {
    fontWeight: '500',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 80,
  },
  leftSection: {
    flex: 1,
    paddingRight: 16,
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greeting: {
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 2,
  },
  userName: {
    fontWeight: 'bold',
    lineHeight: 28,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 4,
  },
  weatherText: {
    fontWeight: '600',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  availabilityText: {
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileButton: {
    padding: 4,
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileBadge: {
    top: 0,
    right: 0,
  },
  badgeText: {
    fontWeight: 'bold',
  },
  quickStatsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 12,
  },
  quickStatsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 6,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    fontWeight: '500',
    flex: 1,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    pointerEvents: 'none',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -60,
    right: -60,
  },
  decorativeCircle2: {
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -40,
    right: -40,
  },
  decorativeCircle3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    top: -20,
    right: -20,
  },
});
