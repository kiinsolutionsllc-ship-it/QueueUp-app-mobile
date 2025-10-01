// UX Enhancer
// Centralized user experience enhancement utilities

import { Platform, Dimensions, Alert, Vibration } from 'react-native';
import { hapticService } from '../services/HapticService';

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// UX Enhancement utilities
export const uxEnhancer = {
  // Haptic feedback
  haptic: {
    light: () => {
      try {
        hapticService.light();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
    medium: () => {
      try {
        hapticService.medium();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
    heavy: () => {
      try {
        hapticService.heavy();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
    success: () => {
      try {
        hapticService.success();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
    warning: () => {
      try {
        hapticService.warning();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
    error: () => {
      try {
        hapticService.error();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    },
  },

  // Visual feedback
  visual: {
    // Show success feedback
    showSuccess: (message, duration = 2000) => {
      // This would integrate with your toast/notification system
    },

    // Show error feedback
    showError: (message, duration = 3000) => {
    },

    // Show loading feedback
    showLoading: (message = 'Loading...') => {
    },

    // Show confirmation dialog
    showConfirmation: (title, message, onConfirm, onCancel) => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancel', onPress: onCancel, style: 'cancel' },
          { text: 'Confirm', onPress: onConfirm, style: 'destructive' },
        ],
        { cancelable: true }
      );
    },
  },

  // Accessibility enhancements
  accessibility: {
    // Get optimal touch target size
    getTouchTargetSize: (baseSize = 44) => {
      return Math.max(baseSize, 44); // Minimum 44pt for accessibility
    },

    // Get optimal font size
    getOptimalFontSize: (baseSize, scale = 1) => {
      const scaledSize = baseSize * scale;
      return Math.max(scaledSize, 12); // Minimum 12pt for readability
    },

    // Get high contrast colors
    getHighContrastColors: (theme) => {
      return {
        primary: theme.primary,
        secondary: theme.secondary,
        background: theme.background,
        surface: theme.surface,
        text: theme.text,
        textSecondary: theme.textSecondary,
        error: theme.error,
        success: theme.success,
        warning: theme.warning,
        info: theme.info,
      };
    },

    // Get accessible spacing
    getAccessibleSpacing: (baseSpacing = 8) => {
      return {
        xs: baseSpacing * 0.5,
        sm: baseSpacing,
        md: baseSpacing * 1.5,
        lg: baseSpacing * 2,
        xl: baseSpacing * 3,
        xxl: baseSpacing * 4,
      };
    },
  },

  // Responsive design
  responsive: {
    // Get responsive dimensions
    getDimensions: () => ({
      width: screenWidth,
      height: screenHeight,
      isSmallScreen: screenWidth < 375,
      isMediumScreen: screenWidth >= 375 && screenWidth < 414,
      isLargeScreen: screenWidth >= 414,
      isTablet: screenWidth >= 768,
    }),

    // Get responsive font sizes
    getFontSizes: (baseSize = 16) => {
      const { isSmallScreen, isMediumScreen, isLargeScreen, isTablet } = uxEnhancer.responsive.getDimensions();
      
      let multiplier = 1;
      if (isSmallScreen) multiplier = 0.9;
      else if (isMediumScreen) multiplier = 1;
      else if (isLargeScreen) multiplier = 1.1;
      else if (isTablet) multiplier = 1.2;

      return {
        xs: Math.round(baseSize * 0.75 * multiplier),
        sm: Math.round(baseSize * 0.875 * multiplier),
        md: Math.round(baseSize * multiplier),
        lg: Math.round(baseSize * 1.125 * multiplier),
        xl: Math.round(baseSize * 1.25 * multiplier),
        xxl: Math.round(baseSize * 1.5 * multiplier),
      };
    },

    // Get responsive spacing
    getSpacing: (baseSpacing = 8) => {
      const { isSmallScreen, isMediumScreen, isLargeScreen, isTablet } = uxEnhancer.responsive.getDimensions();
      
      let multiplier = 1;
      if (isSmallScreen) multiplier = 0.8;
      else if (isMediumScreen) multiplier = 1;
      else if (isLargeScreen) multiplier = 1.1;
      else if (isTablet) multiplier = 1.3;

      return {
        xs: Math.round(baseSpacing * 0.5 * multiplier),
        sm: Math.round(baseSpacing * multiplier),
        md: Math.round(baseSpacing * 1.5 * multiplier),
        lg: Math.round(baseSpacing * 2 * multiplier),
        xl: Math.round(baseSpacing * 3 * multiplier),
        xxl: Math.round(baseSpacing * 4 * multiplier),
      };
    },
  },

  // Animation enhancements
  animation: {
    // Get smooth animation config
    getSmoothConfig: (duration = 300) => ({
      duration,
      useNativeDriver: true,
      easing: Platform.OS === 'ios' ? 
        require('react-native').Easing.bezier(0.25, 0.1, 0.25, 1) :
        require('react-native').Easing.out(require('react-native').Easing.quad),
    }),

    // Get bounce animation config
    getBounceConfig: (duration = 400) => ({
      duration,
      useNativeDriver: true,
      easing: require('react-native').Easing.bounce,
    }),

    // Get spring animation config
    getSpringConfig: () => ({
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }),
  },

  // Loading states
  loading: {
    // Get loading states for different operations
    getLoadingStates: () => ({
      idle: 'idle',
      loading: 'loading',
      success: 'success',
      error: 'error',
    }),

    // Get loading messages
    getLoadingMessages: () => ({
      default: 'Loading...',
      saving: 'Saving...',
      deleting: 'Deleting...',
      uploading: 'Uploading...',
      processing: 'Processing...',
      connecting: 'Connecting...',
    }),
  },

  // Error handling
  error: {
    // Get user-friendly error messages
    getErrorMessage: (error) => {
      if (typeof error === 'string') return error;
      
      if (error?.message) {
        // Map technical errors to user-friendly messages
        const errorMap = {
          'Network request failed': 'Please check your internet connection',
          'Timeout': 'Request timed out. Please try again',
          'Unauthorized': 'Please log in again',
          'Forbidden': 'You don\'t have permission to perform this action',
          'Not Found': 'The requested resource was not found',
          'Internal Server Error': 'Something went wrong. Please try again later',
        };
        
        return errorMap[error.message] || error.message;
      }
      
      return 'An unexpected error occurred';
    },

    // Get error recovery suggestions
    getRecoverySuggestions: (error) => {
      const suggestions = {
        'Network request failed': [
          'Check your internet connection',
          'Try again in a few moments',
          'Switch to a different network',
        ],
        'Timeout': [
          'Try again with a better connection',
          'Check if the service is available',
        ],
        'Unauthorized': [
          'Log out and log back in',
          'Check your credentials',
        ],
        'default': [
          'Try again later',
          'Contact support if the problem persists',
        ],
      };
      
      const errorType = error?.message || 'default';
      return suggestions[errorType] || suggestions.default;
    },
  },

  // Form validation
  validation: {
    // Get validation messages
    getValidationMessages: () => ({
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      minLength: (min) => `Must be at least ${min} characters`,
      maxLength: (max) => `Must be no more than ${max} characters`,
      pattern: 'Please enter a valid format',
      match: 'Values do not match',
    }),

    // Get validation rules
    getValidationRules: () => ({
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[+]?[1-9][\d]{0,15}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    }),
  },

  // Performance monitoring
  performance: {
    // Track user interactions
    trackInteraction: (action, component, metadata = {}) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Interaction tracked:', { action, component, metadata });
      }
    },

    // Track performance metrics
    trackPerformance: (metric, value, unit = 'ms') => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance tracked:', { metric, value, unit });
      }
    },

    // Track errors
    trackError: (error, context = {}) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`🚨 Error:`, error, context);
      }
    },
  },
};

// Export individual utilities for easier imports
export const {
  haptic,
  visual,
  accessibility,
  responsive,
  animation,
  loading,
  error,
  validation,
  performance,
} = uxEnhancer;

export default uxEnhancer;
