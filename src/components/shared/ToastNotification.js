import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { designTokens } from '../../design-system/DesignSystem';
import IconFallback from './IconFallback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ToastNotification = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  position = 'top',
  onHide,
  action,
  actionText,
  onActionPress,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [isVisible, setIsVisible] = useState(visible);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      showToast();
    } else {
      hideToast();
    }
  }, [visible]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      // Progress animation
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const showToast = () => {
    Animated.parallel([
      Animated.spring(slideAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onHide?.();
    });
  };

  const getTypeConfig = () => {
    const configs = {
      success: {
        icon: 'check-circle',
        backgroundColor: theme.success,
        textColor: theme.onSuccess,
        iconColor: theme.onSuccess,
      },
      error: {
        icon: 'error',
        backgroundColor: theme.error,
        textColor: theme.onError,
        iconColor: theme.onError,
      },
      warning: {
        icon: 'warning',
        backgroundColor: theme.warning,
        textColor: theme.onWarning,
        iconColor: theme.onWarning,
      },
      info: {
        icon: 'info',
        backgroundColor: theme.info,
        textColor: theme.onInfo,
        iconColor: theme.onInfo,
      },
    };
    return configs[type] || configs.info;
  };

  const getPositionStyle = () => {
    const translateY = slideAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: position === 'top' ? [-100, 0] : [100, 0],
    });

    return {
      transform: [{ translateY }],
    };
  };

  const getProgressStyle = () => {
    const width = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return {
      width,
    };
  };

  const typeConfig = getTypeConfig();

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: position === 'top' ? StatusBar.currentHeight + 10 : undefined,
          bottom: position === 'bottom' ? 20 : undefined,
          opacity: opacityAnimation,
          ...getPositionStyle(),
        },
        style,
      ]}
      {...props}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: typeConfig.backgroundColor,
            borderRadius: designTokens.borderRadius.lg,
            ...designTokens.shadows.lg,
          },
        ]}
      >
        <View style={styles.content}>
          <IconFallback
            name={typeConfig.icon}
            size={20}
            color={typeConfig.iconColor}
            style={styles.icon}
          />
          
          <Text
            style={[
              styles.message,
              {
                color: typeConfig.textColor,
                flex: 1,
              },
            ]}
            numberOfLines={2}
          >
            {message}
          </Text>
          
          {action && actionText && onActionPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onActionPress}
            >
              <Text
                style={[
                  styles.actionText,
                  { color: typeConfig.textColor },
                ]}
              >
                {actionText}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideToast}
          >
            <IconFallback
              name="close"
              size={16}
              color={typeConfig.textColor}
            />
          </TouchableOpacity>
        </View>
        
        {duration > 0 && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: typeConfig.textColor,
                  ...getProgressStyle(),
                },
              ]}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (config) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      visible: true,
      ...config,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (config.duration !== 0) {
      setTimeout(() => {
        hideToast(id);
      }, config.duration || 3000);
    }

    return id;
  };

  const hideToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const hideAllToasts = () => {
    setToasts([]);
  };

  const showSuccess = (message, config = {}) => {
    return showToast({
      message,
      type: 'success',
      ...config,
    });
  };

  const showError = (message, config = {}) => {
    return showToast({
      message,
      type: 'error',
      ...config,
    });
  };

  const showWarning = (message, config = {}) => {
    return showToast({
      message,
      type: 'warning',
      ...config,
    });
  };

  const showInfo = (message, config = {}) => {
    return showToast({
      message,
      type: 'info',
      ...config,
    });
  };

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, onHide }) => {
  return (
    <View style={styles.toastContainer}>
      {toasts.map((toast, index) => (
        <ToastNotification
          key={toast.id}
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          action={toast.action}
          actionText={toast.actionText}
          onActionPress={toast.onActionPress}
          onHide={() => onHide(toast.id)}
          style={[
            styles.toastItem,
            { zIndex: 1000 - index },
          ]}
        />
      ))}
    </View>
  );
};

// Predefined toast types
export const SuccessToast = (props) => (
  <ToastNotification type="success" {...props} />
);

export const ErrorToast = (props) => (
  <ToastNotification type="error" {...props} />
);

export const WarningToast = (props) => (
  <ToastNotification type="warning" {...props} />
);

export const InfoToast = (props) => (
  <ToastNotification type="info" {...props} />
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
    pointerEvents: 'auto', // Allow touches on the toast itself
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none', // Allow touches to pass through to underlying components
  },
  toastItem: {
    marginBottom: 10,
  },
  toast: {
    padding: designTokens.spacing.md,
    marginBottom: designTokens.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: designTokens.spacing.sm,
  },
  message: {
    fontSize: designTokens.typography.fontSizes.base,
    fontWeight: designTokens.typography.fontWeights.medium,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.base,
  },
  actionButton: {
    marginLeft: designTokens.spacing.sm,
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
  },
  actionText: {
    fontSize: designTokens.typography.fontSizes.sm,
    fontWeight: designTokens.typography.fontWeights.semibold,
  },
  closeButton: {
    marginLeft: designTokens.spacing.sm,
    padding: designTokens.spacing.xs,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomLeftRadius: designTokens.borderRadius.lg,
    borderBottomRightRadius: designTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ToastNotification;




