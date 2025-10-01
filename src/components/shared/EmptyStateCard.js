/**
 * Reusable empty state card component
 * Eliminates duplicate empty state patterns across screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

export const EmptyStateCard = ({
  icon = 'inbox',
  title = 'No Data',
  subtitle = 'There\'s nothing to show here yet',
  actionText,
  onActionPress,
  theme: propTheme,
  style,
}) => {
  // Get theme with comprehensive fallback
  let theme = {};
  try {
    const themeContext = useTheme();
    theme = themeContext?.getCurrentTheme?.() || {};
  } catch (error) {
    console.warn('EmptyStateCard: Theme context error, using fallback theme:', error);
  }

  // Use prop theme if provided, otherwise use context theme
  const safeTheme = propTheme || {
    cardBackground: theme.cardBackground || '#FFFFFF',
    primary: theme.primary || '#0891B2',
    text: theme.text || '#000000',
    textSecondary: theme.textSecondary || '#666666',
    onPrimary: theme.onPrimary || '#FFFFFF'
  };

  return (
    <View style={[styles.emptyCard, { backgroundColor: safeTheme.cardBackground }, style]}>
      <View style={[styles.iconContainer, { backgroundColor: safeTheme.primary + '20' }]}>
        <IconFallback name={icon} size={48} color={safeTheme.primary} />
      </View>
      
      <Text style={[styles.title, { color: safeTheme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: safeTheme.textSecondary }]}>{subtitle}</Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: safeTheme.primary }]}
          onPress={onActionPress}
        >
          <Text style={[styles.actionButtonText, { color: safeTheme.onPrimary }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Predefined empty states for common scenarios
export const NoJobsEmptyState = ({ onCreateJob, theme, style }) => (
  <EmptyStateCard
    icon="work"
    title="No jobs yet"
    subtitle="Book a service to see your jobs here"
    actionText="Book Service"
    onActionPress={onCreateJob}
    theme={theme}
    style={style}
  />
);

export const NoBookingsEmptyState = ({ onBookService, theme, style }) => (
  <EmptyStateCard
    icon="event"
    title="No scheduled bookings"
    subtitle="Book a service to see scheduled appointments here"
    actionText="Book Service"
    onActionPress={onBookService}
    theme={theme}
    style={style}
  />
);

export const NoMechanicsEmptyState = ({ onRefresh, theme, style }) => (
  <EmptyStateCard
    icon="person"
    title="No mechanics available"
    subtitle="Check back later for available mechanics"
    actionText="Refresh"
    onActionPress={onRefresh}
    theme={theme}
    style={style}
  />
);

const styles = StyleSheet.create({
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyStateCard;
