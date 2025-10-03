import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../types/JobTypes';

interface GlassCardProps {
  children: React.ReactNode;
  theme: Theme;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: any;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  theme,
  intensity = 20,
  tint = 'light',
  style,
}) => {
  // Fallback implementation without expo-blur for better compatibility
  const getBackgroundColor = () => {
    switch (tint) {
      case 'dark':
        return 'rgba(0, 0, 0, 0.3)';
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.15)';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, { backgroundColor: getBackgroundColor() }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
  },
});

export default GlassCard;
