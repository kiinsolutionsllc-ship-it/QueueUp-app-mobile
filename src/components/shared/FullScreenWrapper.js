import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function FullScreenWrapper({ children, style, paddingTop = true, paddingBottom = true }) {
  const insets = useSafeAreaInsets();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: paddingTop ? insets.top : 0,
          paddingBottom: paddingBottom ? insets.bottom : 0,
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
