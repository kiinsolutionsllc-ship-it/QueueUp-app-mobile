import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Theme } from '../../types/JobTypes';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  theme: Theme;
  style?: any;
  variant?: 'text' | 'rect' | 'circle';
  lines?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  theme,
  style,
  variant = 'rect',
  lines = 1,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const getSkeletonStyle = () => {
    const baseStyle = {
      width: typeof width === 'number' ? width : 200,
      height,
      backgroundColor: theme.border + '40',
      borderRadius: variant === 'circle' ? height / 2 : borderRadius,
    };

    return baseStyle;
  };

  if (lines > 1) {
    return (
      <View style={[styles.container, style]}>
        {Array.from({ length: lines }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              getSkeletonStyle(),
              shimmerStyle,
              {
                marginBottom: index < lines - 1 ? 8 : 0,
                width: index === lines - 1 ? '80%' as any : (typeof width === 'number' ? width : 200),
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        getSkeletonStyle(),
        shimmerStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LoadingSkeleton;
