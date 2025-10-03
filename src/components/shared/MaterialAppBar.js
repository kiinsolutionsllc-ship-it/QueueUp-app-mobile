import React from 'react';
import { View, Text, StatusBar, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import MaterialButton from './MaterialButton';

const MaterialAppBar = ({
  title,
  subtitle,
  leftAction,
  rightActions = [],
  elevation = 4,
  style}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <>
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={theme.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: theme.primary,
            elevation: Platform.OS === 'android' ? elevation : 0,
            shadowColor: Platform.OS === 'ios' ? '#000' : 'transparent',
            shadowOffset: Platform.OS === 'ios' ? { width: 0, height: elevation * 2 } : { width: 0, height: 0 },
            shadowOpacity: Platform.OS === 'ios' ? 0.1 * elevation : 0,
            shadowRadius: Platform.OS === 'ios' ? elevation * 2 : 0,
          },
          style,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {leftAction}
          </View>
          
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.title,
                { color: theme.onPrimary }
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.onPrimary + 'B3' }
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
          
          <View style={styles.rightSection}>
            {rightActions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                {action}
              </View>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  appBar: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    minHeight: Platform.OS === 'android' ? 56 + (StatusBar.currentHeight || 0) : 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1},
  leftSection: {
    marginRight: 16,
    minWidth: 40},
  titleSection: {
    flex: 1,
    justifyContent: 'center'},
  title: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24},
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 2},
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16},
  actionItem: {
    marginLeft: 8}});

export default MaterialAppBar;
