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
  Image,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from '../../contexts/LocationContext';
import { hapticService } from '../../services/HapticService';
import { FadeIn } from '../shared/Animations';


export default function AdvancedHomeHeader({ 
  user,
  onNotificationPress,
  onProfilePress,
  notificationCount = 0,
  onLocationPress,
  onWeatherPress,
  showLocation = true,
  showWeather = true,
  showQuickStats = true,
}) {
  const { getCurrentTheme, isDarkMode } = useTheme();
  const { locationName } = useLocation();
  const theme = getCurrentTheme();
  
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [weather, setWeather] = useState(null);
  const [quickStats, setQuickStats] = useState({
    activeJobs: 0,
    completedToday: 0,
    totalSpent: 0,
  });
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

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
      
      // Update greeting based on time
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    // Animate header elements
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for notifications
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

    if (notificationCount > 0) {
      pulseAnimation.start();
    }

    // Mock weather data (in real app, fetch from weather API)
    setWeather({
      temperature: 72,
      condition: 'sunny',
      humidity: 45,
      windSpeed: 8,
    });

    // Mock quick stats (in real app, fetch from API)
    setQuickStats({
      activeJobs: 2,
      completedToday: 1,
      totalSpent: 150,
    });

    return () => {
      clearInterval(interval);
      pulseAnimation.stop();
    };
  }, [notificationCount, fadeAnim, slideAnim, pulseAnim]);

  const handleNotificationPress = async () => {
    await hapticService.buttonPress();
    onNotificationPress?.();
  };

  const handleProfilePress = async () => {
    await hapticService.buttonPress();
    onProfilePress?.();
  };

  const handleLocationPress = async () => {
    await hapticService.buttonPress();
    onLocationPress?.();
  };

  const handleWeatherPress = async () => {
    await hapticService.buttonPress();
    onWeatherPress?.();
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return 'wb-sunny';
      case 'cloudy': return 'cloud';
      case 'rainy': return 'grain';
      case 'stormy': return 'thunderstorm';
      default: return 'wb-sunny';
    }
  };

  const getWeatherColor = (condition) => {
    switch (condition) {
      case 'sunny': return theme.warning;
      case 'cloudy': return theme.textSecondary;
      case 'rainy': return theme.info;
      case 'stormy': return theme.error;
      default: return theme.warning;
    }
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
    >
      <StatusBar 
        barStyle={isDarkMode() ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background}
        translucent={false}
      />
      
      {/* Top Status Bar */}
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

      {/* Main Header Content */}
      <View style={styles.headerContent}>
        {/* Left Section - Greeting and Location */}
        <View style={styles.leftSection}>
          <FadeIn delay={200}>
            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: theme.text }]}>
                {greeting}
              </Text>
              <Text style={[styles.userName, { color: theme.text }]}>
                {user?.name || 'Customer'}
              </Text>
            </View>
          </FadeIn>
          
          {showLocation && (
            <FadeIn delay={400}>
              <TouchableOpacity 
                style={[styles.locationContainer, { backgroundColor: theme.surface }]}
                onPress={handleLocationPress}
                activeOpacity={0.7}
              >
                <IconFallback name="location-on" size={16} color={theme.primary} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {locationName || 'Getting location...'}
                </Text>
                <IconFallback name="keyboard-arrow-down" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </FadeIn>
          )}
        </View>

        {/* Right Section - Actions */}
        <View style={styles.rightSection}>
          {/* Weather */}
          {showWeather && weather && (
            <FadeIn delay={300}>
              <TouchableOpacity 
                style={[styles.weatherContainer, { backgroundColor: theme.surface }]}
                onPress={handleWeatherPress}
                activeOpacity={0.7}
              >
                <IconFallback 
                  name={getWeatherIcon(weather.condition)} 
                  size={18} 
                  color={getWeatherColor(weather.condition)} 
                />
                <Text style={[styles.weatherText, { color: theme.text }]}>
                  {weather.temperature}°
                </Text>
              </TouchableOpacity>
            </FadeIn>
          )}
          
          {/* Notifications */}
          <FadeIn delay={400}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleNotificationPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
                  <IconFallback name="notifications" size={20} color={theme.text} />
                  {notificationCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.error }]}>
                      <Text style={[styles.badgeText, { color: theme.onError }]}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </FadeIn>
          
          {/* Profile */}
          <FadeIn delay={500}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: theme.accentLight }]}>
                {user?.avatar && user.avatar.startsWith('file://') ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={[styles.avatarText, { color: '#333333' }]}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '👤'}
                  </Text>
                )}
              </View>
              {notificationCount > 0 && (
                <View style={[styles.badge, styles.profileBadge, { backgroundColor: theme.error }]}>
                  <Text style={[styles.badgeText, { color: theme.onError }]}>
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
            >
              <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                <IconFallback name="work" size={16} color={theme.primary} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {quickStats.activeJobs}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Active Jobs
                </Text>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                <IconFallback name="check-circle" size={16} color={theme.success} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {quickStats.completedToday}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Completed Today
                </Text>
              </View>
              
              <View style={[styles.statItem, { backgroundColor: theme.background }]}>
                <IconFallback name="attach-money" size={16} color={theme.warning} />
                <Text style={[styles.statValue, { color: theme.text }]}>
                  ${quickStats.totalSpent}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total Spent
                </Text>
              </View>
            </ScrollView>
          </View>
        </FadeIn>
      )}

      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
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
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    maxWidth: '90%',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileButton: {
    padding: 4,
    position: 'relative',
  },
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
    elevation: 3,
  },
  avatarText: {
    fontSize: 16,
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
    minWidth: 18,
    height: 18,
    borderRadius: 9,
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
    fontSize: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    minWidth: 120,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
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
