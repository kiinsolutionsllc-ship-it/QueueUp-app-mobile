import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';


// Advanced Fade In with Stagger
export const StaggeredFadeIn = ({ children, delay = 0, style }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 600 }, () => {
        'worklet';
        runOnJS(hapticService.light)();
      })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 150 })
    );
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// Morphing Button Animation
export const MorphingButton = ({ 
  children, 
  onPress, 
  loading = false,
  success = false,
  style 
}) => {
  const scale = useSharedValue(1);
  const borderRadius = useSharedValue(8);
  const backgroundColor = useSharedValue(0);
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    hapticService.buttonPress();
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderRadius: borderRadius.value,
    backgroundColor: interpolate(
      backgroundColor.value,
      [0, 1, 2],
      [theme.primary, theme.success, theme.error],
      Extrapolate.CLAMP
    ),
  }));

  useEffect(() => {
    if (loading) {
      borderRadius.value = withTiming(25, { duration: 300 });
      backgroundColor.value = withTiming(1, { duration: 300 });
    } else if (success) {
      borderRadius.value = withTiming(25, { duration: 300 });
      backgroundColor.value = withTiming(2, { duration: 300 });
    } else {
      borderRadius.value = withTiming(8, { duration: 300 });
      backgroundColor.value = withTiming(0, { duration: 300 });
    }
  }, [loading, success, borderRadius, backgroundColor]);

  return (
    <GestureDetector gesture={Gesture.Tap().onEnd(handlePress)}>
      <Animated.View style={[styles.morphingButton, animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Floating Action Button with Ripple
export const FloatingActionButton = ({ 
  onPress, 
  icon = 'add',
  style 
}) => {
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const handlePress = () => {
    // Ripple effect
    rippleScale.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0, { duration: 200 })
    );
    rippleOpacity.value = withSequence(
      withTiming(0.3, { duration: 300 }),
      withTiming(0, { duration: 200 })
    );
    
    // Button press
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    
    hapticService.buttonPress();
    onPress?.();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  return (
    <GestureDetector gesture={Gesture.Tap().onEnd(handlePress)}>
      <Animated.View style={[styles.fab, { backgroundColor: theme.primary }, style]}>
        <Animated.View style={[styles.ripple, rippleStyle]} />
        <IconFallback name={icon} size={24} color={theme.onPrimary} />
        <Animated.View style={[styles.fab, buttonStyle]} />
      </Animated.View>
    </GestureDetector>
  );
};

// Card Flip Animation
export const FlipCard = ({ 
  front, 
  back, 
  flipped = false,
  onFlip,
  style 
}) => {
  const rotateY = useSharedValue(0);
  useEffect(() => {
    rotateY.value = withSpring(flipped ? 180 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [flipped, rotateY]);

  const handlePress = () => {
    hapticService.selection();
    onFlip?.(!flipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
  }));

  return (
    <GestureDetector gesture={Gesture.Tap().onEnd(handlePress)}>
      <View style={[styles.flipContainer, style]}>
        <Animated.View style={[styles.flipCard, frontStyle]}>
          {front}
        </Animated.View>
        <Animated.View style={[styles.flipCard, backStyle]}>
          {back}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

// Parallax Scroll Animation
export const ParallaxScrollView = ({ 
  children, 
  headerHeight = 200,
  parallaxFactor = 0.5,
  style 
}) => {
  const scrollY = useSharedValue(0);
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, headerHeight],
          [0, -headerHeight * parallaxFactor],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, headerHeight],
          [0, headerHeight * (1 - parallaxFactor)],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={[styles.parallaxContainer, style]}>
      <Animated.View style={[styles.parallaxHeader, { height: headerHeight }, headerStyle]}>
        <View style={[styles.headerContent, { backgroundColor: theme.primary }]}>
          <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>
            Parallax Header
          </Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.parallaxContent, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
};

// Shake Animation for Errors
export const ShakeView = ({ 
  children, 
  shake = false,
  onShakeComplete,
  style 
}) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (shake) {
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }, () => {
          'worklet';
          runOnJS(onShakeComplete)?.();
        })
      );
      try {
        hapticService.error();
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [shake, translateX, onShakeComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// Progress Ring Animation
export const ProgressRing = ({ 
  progress = 0,
  size = 100,
  strokeWidth = 8,
  backgroundColor,
  style 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const animatedProgress = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.progressRingContainer, { width: size, height: size }, style]}>
      <Animated.View style={styles.progressRing}>
        <Animated.View
          style={[
            styles.progressRingFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor || theme.divider,
            },
            animatedStyle,
          ]}
        />
        <View style={styles.progressRingContent}>
          <Text style={[styles.progressText, { color: theme.text }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// Loading Skeleton with Shimmer
export const ShimmerSkeleton = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const shimmer = useSharedValue(0);
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.divider,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Gesture-based Swipe Card
export const SwipeCard = ({ 
  children, 
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  style 
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Add rotation based on horizontal movement
      rotation.value = event.translationX * 0.1;
      
      // Scale down slightly when dragging
      scale.value = 1 - Math.abs(event.translationX) / 1000;
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      
      // Determine swipe direction and trigger callbacks
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > 100 || velocityX > 500) {
          onSwipeRight?.();
        } else if (translationX < -100 || velocityX < -500) {
          onSwipeLeft?.();
        }
      } else {
        if (translationY > 100 || velocityY > 500) {
          onSwipeDown?.();
        } else if (translationY < -100 || velocityY < -500) {
          onSwipeUp?.();
        }
      }
      
      // Reset position
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotation.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.swipeCard, { backgroundColor: theme.surface }, animatedStyle, style]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  morphingButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  flipContainer: {
    width: 200,
    height: 200,
    perspective: 1000,
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parallaxContainer: {
    flex: 1,
  },
  parallaxHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  parallaxContent: {
    flex: 1,
    paddingTop: 200,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'relative',
  },
  progressRingFill: {
    position: 'absolute',
  },
  progressRingContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  skeleton: {
    marginVertical: 2,
  },
  swipeCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default {
  StaggeredFadeIn,
  MorphingButton,
  FloatingActionButton,
  FlipCard,
  ParallaxScrollView,
  ShakeView,
  ProgressRing,
  ShimmerSkeleton,
  SwipeCard,
};
