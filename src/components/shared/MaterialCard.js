import React, { useRef } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';

const MaterialCard = ({
  children,
  elevation = 2,
  style,
  onPress = null, // Make onPress optional with default
  disabled = false,
  haptic = true,
  padding = 'lg',
  ...props
}) => {
  // Get theme with comprehensive fallback
  let theme = {};
  try {
    const themeContext = useTheme();
    theme = themeContext?.getCurrentTheme?.() || {};
  } catch (error) {
    console.warn('MaterialCard: Theme context error, using fallback theme:', error);
  }

  // Comprehensive fallback theme
  const safeTheme = {
    cardBackground: theme.cardBackground || '#FFFFFF',
    cardShadow: theme.cardShadow || '#000000',
    primary: theme.primary || '#0891B2',
    text: theme.text || '#000000',
    textSecondary: theme.textSecondary || '#666666',
    border: theme.border || '#E5E7EB',
    accent: theme.accent || '#0891B2',
    success: theme.success || '#10B981',
    warning: theme.warning || '#F59E0B',
    error: theme.error || '#EF4444',
    background: theme.background || '#FFFFFF',
    surface: theme.surface || '#F8F9FA',
    onPrimary: theme.onPrimary || '#FFFFFF',
    onBackground: theme.onBackground || '#000000',
    onSurface: theme.onSurface || '#000000'
  };

  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const shadowAnimation = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;

    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;

    if (haptic) {
      try {
        hapticService.buttonPress();
      } catch (error) {
        console.warn('MaterialCard: Haptic feedback error:', error);
      }
    }

    onPress();
  };

  const getPaddingValue = () => {
    switch (padding) {
      case 'xs': return 4;
      case 'sm': return 8;
      case 'md': return 12;
      case 'lg': return 16;
      case 'xl': return 20;
      case 'xxl': return 24;
      default: return 16;
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: safeTheme.cardBackground,
      padding: getPaddingValue(),
      elevation: Platform.OS === 'android' ? elevation : 0,
      shadowColor: safeTheme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: shadowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.3],
      }),
      shadowRadius: shadowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 8],
      }),
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnimation }] },
          cardStyle,
          disabled && styles.disabled,
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          {...props}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default MaterialCard;
