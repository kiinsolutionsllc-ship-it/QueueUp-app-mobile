import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

// Skeleton Loading Component
export const SkeletonLoader = ({ 
  width: skeletonWidth = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animation value first
    animatedValue.setValue(0);
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      try {
        animation.stop();
        animatedValue.stopAnimation();
      } catch (error) {
        console.log('Error stopping animation:', error);
      }
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]});

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
          backgroundColor: theme.divider,
          opacity},
        style,
      ]}
    />
  );
};

// Card Skeleton Loader
export const CardSkeleton = ({ style }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.cardSkeleton, { backgroundColor: theme.cardBackground }, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={60} height={60} borderRadius={30} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="50%" height={14} />
        </View>
      </View>
      <View style={styles.cardContent}>
        <SkeletonLoader width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="80%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={14} />
      </View>
      <View style={styles.cardFooter}>
        <SkeletonLoader width={80} height={32} borderRadius={16} />
        <SkeletonLoader width={60} height={16} />
      </View>
    </View>
  );
};

// List Skeleton Loader
export const ListSkeleton = ({ count = 3, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} style={{ marginBottom: 16 }} />
      ))}
    </View>
  );
};

// Spinner Loading Component
export const Spinner = ({ size = 'small', color, style }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }));
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']});

  const spinnerSize = size === 'large' ? 32 : size === 'medium' ? 24 : 16;

  return (
    <Animated.View
      style={[
        styles.spinner,
        {
          transform: [{ rotate: rotation }],
          width: spinnerSize,
          height: spinnerSize
        },
        style,
      ]}
    >
      <IconFallback name="refresh" size={spinnerSize} color={color || theme.accentLight} />
    </Animated.View>
  );
};

// Full Screen Loading Component
export const FullScreenLoader = ({ 
  message = 'Loading...', 
  showSpinner = true,
  style 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.fullScreenLoader, { backgroundColor: theme.accentLight }, style]}>
      {showSpinner && <Spinner size="large" style={{ marginBottom: 16 }} />}
      <Text style={[styles.loadingText, { color: theme.text }]}>{message}</Text>
    </View>
  );
};

// Button Loading State
export const ButtonLoader = ({ loading, children, style }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  if (!loading) return children;

  return (
    <View style={[styles.buttonLoader, style]}>
      <Spinner size="small" color={theme.onPrimary} />
    </View>
  );
};

// Progress Bar
export const ProgressBar = ({ 
  progress = 0, 
  height = 4, 
  color, 
  backgroundColor,
  style 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [progress, animatedValue]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']});

  return (
    <View
      style={[
        styles.progressBar,
        {
          height,
          backgroundColor: backgroundColor || theme.divider},
        style,
      ]}
    >
      <View
        style={[
          styles.progressFill,
          {
            width,
            backgroundColor: color || theme.accentLight},
        ]}
      />
    </View>
  );
};

// Shimmer Effect
export const ShimmerEffect = ({ children, loading = false, style }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const animation = Animated.loop(Animated.sequence([Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true}), Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true}),
        ])
      );
      animation.start();

      return () => animation.stop();
    }
  }, [loading, animatedValue]);

  if (!loading) return children;

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]});

  return (
    <View style={[styles.shimmer, { opacity }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 2},
  cardSkeleton: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16},
  cardHeaderText: {
    flex: 1,
    marginLeft: 12},
  cardContent: {
    marginBottom: 16},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'},
  spinner: {
    alignItems: 'center',
    justifyContent: 'center'},
  fullScreenLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20},
  loadingText: {
    fontSize: 16,
    fontWeight: '500'},
  buttonLoader: {
    alignItems: 'center',
    justifyContent: 'center'},
  progressBar: {
    borderRadius: 2,
    overflow: 'hidden'},
  progressFill: {
    height: '100%',
    borderRadius: 2},
  shimmer: {
    opacity: 0.5}});
