import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../types/JobTypes';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon: string;
  label?: string;
  theme: Theme;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: any;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  label,
  theme,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
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
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.textSecondary,
          shadowColor: theme.textSecondary,
        };
      case 'success':
        return {
          backgroundColor: theme.success,
          shadowColor: theme.success,
        };
      case 'warning':
        return {
          backgroundColor: theme.warning,
          shadowColor: theme.warning,
        };
      case 'error':
        return {
          backgroundColor: theme.error,
          shadowColor: theme.error,
        };
      default:
        return {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
      case 'medium':
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
      case 'large':
        return {
          width: 64,
          height: 64,
          borderRadius: 32,
        };
      default:
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'bottom-right':
        return {
          position: 'absolute',
          bottom: 20,
          right: 20,
        };
      case 'bottom-left':
        return {
          position: 'absolute',
          bottom: 20,
          left: 20,
        };
      case 'top-right':
        return {
          position: 'absolute',
          top: 20,
          right: 20,
        };
      case 'top-left':
        return {
          position: 'absolute',
          top: 20,
          left: 20,
        };
      default:
        return {
          position: 'absolute',
          bottom: 20,
          right: 20,
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();
  const positionStyle = getPositionStyle();

  return (
    <Animated.View
      style={[
        positionStyle,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          sizeStyle,
          variantStyle,
          {
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          disabled && styles.disabled,
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label || icon}
        accessibilityState={{ disabled }}
      >
        <MaterialIcons
          name={icon as any}
          size={getIconSize()}
          color={theme.onPrimary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default FloatingActionButton;
