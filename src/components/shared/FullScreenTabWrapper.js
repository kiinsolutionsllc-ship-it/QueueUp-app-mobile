import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function FullScreenTabWrapper({ children, style }) {
  const insets = useSafeAreaInsets();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingBottom: 40 + insets.bottom, // Tab bar height + safe area
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
