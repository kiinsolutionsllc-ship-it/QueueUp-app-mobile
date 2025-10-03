import React, { useRef, useCallback } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Platform 
} from 'react-native';
import { Theme } from '../../types/ThemeTypes';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  elevation?: number;
  style?: any;
  theme: Theme;
  haptic?: boolean;
  variant?: 'default' | 'selected' | 'disabled';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  disabled = false,
  elevation = 2,
  style,
  theme,
  haptic = true,
  variant = 'default',
}) => {
  const styles = createJobStyles(theme);
  
  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const shadowAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  // Handle press in
  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) return;
    
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, onPress, scaleAnimation, shadowAnimation, opacityAnimation]);

  // Handle press out
  const handlePressOut = useCallback(() => {
    if (disabled || !onPress) return;
    
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(shadowAnimation, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, onPress, scaleAnimation, shadowAnimation, opacityAnimation]);

  // Handle press
  const handlePress = useCallback(() => {
    if (disabled || !onPress) return;
    
    if (haptic) {
      // Add haptic feedback here if needed
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  }, [disabled, onPress, haptic]);

  // Get card style based on variant
  const getCardStyle = useCallback(() => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'selected':
        return [
          ...baseStyle,
          {
            borderColor: theme.primary,
            backgroundColor: theme.primary + '10',
          },
        ];
      case 'disabled':
        return [
          ...baseStyle,
          {
            opacity: 0.6,
            backgroundColor: theme.textSecondary + '20',
          },
        ];
      default:
        return baseStyle;
    }
  }, [styles.card, theme, variant]);

  // Get shadow style
  const getShadowStyle = useCallback(() => {
    if (Platform.OS === 'android') {
      return {
        elevation: shadowAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [elevation, elevation + 4],
        }),
      };
    }
    
    return {
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: shadowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.3],
      }),
      shadowRadius: shadowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 8],
      }),
    };
  }, [elevation, shadowAnimation, theme.cardShadow, Platform.OS]);

  const cardStyle = [
    ...getCardStyle(),
    {
      elevation: Platform.OS === 'android' ? elevation : 0,
      ...getShadowStyle(),
    },
    style,
  ];

  if (onPress) {
    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnimation }],
            opacity: opacityAnimation,
          },
          disabled && { opacity: 0.5 },
        ]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessible={true}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          <View style={cardStyle}>
            {children}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

// Additional styles for this component
const additionalStyles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
});

export default AnimatedCard;
