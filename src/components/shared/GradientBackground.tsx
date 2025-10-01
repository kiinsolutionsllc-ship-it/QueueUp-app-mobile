import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  style?: any;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'neutral',
  style,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return ['#0891B2', '#0E7490', '#155E75'];
      case 'secondary':
        return ['#6B7280', '#4B5563', '#374151'];
      case 'success':
        return ['#10B981', '#059669', '#047857'];
      case 'warning':
        return ['#F59E0B', '#D97706', '#B45309'];
      case 'error':
        return ['#EF4444', '#DC2626', '#B91C1C'];
      case 'neutral':
      default:
        return ['#F8FAFC', '#F1F5F9', '#E2E8F0'];
    }
  };

  const getFallbackBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#0891B2';
      case 'secondary':
        return '#6B7280';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'neutral':
      default:
        return '#F8FAFC';
    }
  };

  // Try to use LinearGradient, fallback to solid color if it fails
  try {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={getGradientColors() as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </View>
    );
  } catch (error) {
    // Fallback to solid color if LinearGradient fails
    return (
      <View style={[styles.container, { backgroundColor: getFallbackBackgroundColor() }, style]}>
        {children}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default GradientBackground;
