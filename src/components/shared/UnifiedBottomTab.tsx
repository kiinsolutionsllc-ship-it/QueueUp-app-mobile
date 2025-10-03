import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import enhancedUnifiedMessagingService from '../../services/EnhancedUnifiedMessagingService';

const { width } = Dimensions.get('window');

export interface TabConfig {
  icon: string;
  label: string;
  badge?: boolean;
}

export interface UnifiedBottomTabProps {
  state: any;
  navigation: any;
  descriptors?: any;
  userType: 'mechanic' | 'customer';
  style?: any;
}

// Tab configurations for different user types
const TAB_CONFIGS = {
  mechanic: {
    'Dashboard': { icon: 'speed', label: 'Dashboard' },
    'Jobs': { icon: 'work', label: 'Jobs' },
    'Analytics': { icon: 'analytics', label: 'Analytics' },
    'Messaging': { icon: 'chat', label: 'Messages', badge: true },
    'Settings': { icon: 'settings', label: 'Settings' },
  },
  customer: {
    'Home': { icon: 'home', label: 'Home' },
    'Messaging': { icon: 'chat', label: 'Messages', badge: true },
    'Settings': { icon: 'settings', label: 'Settings' },
  },
} as const;

const UnifiedBottomTab: React.FC<UnifiedBottomTabProps> = ({
  state,
  navigation,
  descriptors,
  userType,
  style,
}) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  
  // Get theme with comprehensive fallback
  let theme = {
    primary: '#0891B2',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    accent: '#0891B2',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#2A2A2A',
    surface: '#3A3A3A',
    onPrimary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF'
  };
  
  try {
    const currentTheme = getCurrentTheme(userType);
    if (currentTheme && Object.keys(currentTheme).length > 0) {
      theme = currentTheme;
    }
  } catch (error) {
    console.warn('UnifiedBottomTab: Theme context error, using fallback theme:', error);
  }

  // Comprehensive fallback theme
  const safeTheme = useMemo(() => ({
    primary: theme.primary || '#0891B2',
    text: theme.text || '#FFFFFF',
    textSecondary: theme.textSecondary || '#CCCCCC',
    accent: theme.accent || '#0891B2',
    success: theme.success || '#10B981',
    warning: theme.warning || '#F59E0B',
    error: theme.error || '#EF4444',
    background: theme.background || '#2A2A2A',
    surface: theme.surface || '#3A3A3A',
    onPrimary: theme.onPrimary || '#FFFFFF',
    onBackground: theme.onBackground || '#FFFFFF',
    onSurface: theme.onSurface || '#FFFFFF'
  }), [theme]);

  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get tab configuration based on user type
  const tabConfig = useMemo(() => TAB_CONFIGS[userType], [userType]);

  // Load unread message count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (user?.id) {
        try {
          await enhancedUnifiedMessagingService.initialize();
          const count = enhancedUnifiedMessagingService.getUnreadCountForUser(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error loading unread count:', error);
        }
      }
    };

    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Handle tab press with haptic feedback
  const handleTabPress = useCallback((route: any, isFocused: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  }, [navigation]);

  // Render individual tab
  const renderTab = useCallback((route: any, index: number) => {
    const isFocused = state.index === index;
    const config = tabConfig[route.name as keyof typeof tabConfig] || { icon: 'help', label: route.name };
    const showBadge = (config as any).badge && unreadCount > 0;
    
    // Use theme primary color (now yellow for customers, teal for mechanics)
    const activeColor = safeTheme.primary;

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabItem}
        onPress={() => handleTabPress(route, isFocused)}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={`${config.label} tab`}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={config.icon as any}
            size={24}
            color={isFocused ? activeColor : '#9CA3AF'}
            style={styles.tabIcon}
          />
          {showBadge && (
            <View style={[styles.badge, { backgroundColor: safeTheme.error }]}>
              <Text style={[styles.badgeText, { color: safeTheme.onPrimary }]}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? activeColor : '#9CA3AF' }
          ]}
        >
          {config.label}
        </Text>
      </TouchableOpacity>
    );
  }, [state.index, tabConfig, unreadCount, safeTheme, handleTabPress, userType]);

  return (
    <View style={[styles.container, { backgroundColor: safeTheme.background }, style]}>
      <View style={styles.tabBar}>
        {state.routes.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2A2A2A',
    paddingBottom: 8, // Add bottom padding for safe area
    zIndex: 1000,
    height: 80, // Increased from 35 to 80
    elevation: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    height: 72, // Increased from 35 to 72
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: 72, // Increased from 35 to 72
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIcon: {
    // marginBottom moved to iconContainer
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 11, // Slightly increased from 10
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default UnifiedBottomTab;
