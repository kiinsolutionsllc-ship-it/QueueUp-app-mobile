import React, { useRef } from 'react';
import { Text, ActivityIndicator, View, Platform, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { hapticService } from '../../services/HapticService';

const MaterialButton = ({
  title,
  onPress,
  variant = 'filled', // filled, outlined, text
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  icon = null, // Make icon optional with default
  iconPosition = 'left', // left, right
  fullWidth = false,
  style = {},
  textStyle = {}, // Make textStyle optional with default
  children = null, // Make children optional with default
  hapticFeedback = true,
  hapticType = 'buttonPress',
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const { announceButton } = useAccessibility();
  const theme = getCurrentTheme();
  
  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      // Map haptic types to actual methods with error handling
      try {
        switch (hapticType) {
          case 'buttonPress':
            hapticService.buttonPress();
            break;
          case 'success':
            hapticService.success();
            break;
          case 'error':
            hapticService.error();
            break;
          case 'warning':
            hapticService.warning();
            break;
          case 'light':
            hapticService.light();
            break;
          case 'medium':
            hapticService.medium();
            break;
          case 'heavy':
            hapticService.heavy();
            break;
          default:
            hapticService.buttonPress();
            break;
        }
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
    
    if (onPress) {
      onPress();
    }
    
    if (announceButton) {
      announceButton(title || 'Button');
    }
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: size === 'small' ? 16 : size === 'large' ? 24 : 20,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: size === 'small' ? 36 : size === 'large' ? 56 : 48,
      width: fullWidth ? '100%' : undefined,
      elevation: Platform.OS === 'android' && variant === 'filled' ? 2 : 0,
      shadowColor: Platform.OS === 'ios' && variant === 'filled' ? '#000' : 'transparent',
      shadowOffset: Platform.OS === 'ios' && variant === 'filled' ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: Platform.OS === 'ios' && variant === 'filled' ? 0.2 : 0,
      shadowRadius: Platform.OS === 'ios' && variant === 'filled' ? 4 : 0,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.textSecondary + '40' : theme.primary};
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.textSecondary + '40' : theme.primary};
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent'};
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 16 : 14,
      fontWeight: '500',
      textAlign: 'center'};

    switch (variant) {
      case 'filled':
        return {
          ...baseTextStyle,
          color: disabled ? theme.textSecondary : theme.onPrimary};
      case 'outlined':
      case 'text':
        return {
          ...baseTextStyle,
          color: disabled ? theme.textSecondary + '40' : theme.primary};
      default:
        return baseTextStyle;
    }
  };


  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnimation }], opacity: opacityAnimation },
        fullWidth && { width: '100%' }
      ]}
    >
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'filled' ? theme.onPrimary : theme.primary}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconContainer}>
                {typeof icon === 'string' ? (
                  <IconFallback name={icon} size={20} color={variant === 'filled' ? theme.onPrimary : theme.primary} />
                ) : (
                  icon
                )}
              </View>
            )}
            {children || (title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>)}
            {icon && iconPosition === 'right' && (
              <View style={[styles.iconContainer, { marginRight: 0, marginLeft: 8 }]}>
                {typeof icon === 'string' ? (
                  <IconFallback name={icon} size={20} color={variant === 'filled' ? theme.onPrimary : theme.primary} />
                ) : (
                  icon
                )}
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginRight: 8,
  },
});

export default MaterialButton;
