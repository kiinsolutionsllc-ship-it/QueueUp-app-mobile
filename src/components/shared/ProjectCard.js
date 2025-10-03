import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCard from './MaterialCard';
import { useTheme } from '../../contexts/ThemeContext';

const ProjectCard = ({
  title,
  description,
  progress = 0,
  onPress,
  style,
  ...props
}) => {
  // Get theme with comprehensive fallback
  let theme = {};
  try {
    const themeContext = useTheme();
    theme = themeContext?.getCurrentTheme?.() || {};
  } catch (error) {
    console.warn('ProjectCard: Theme context error, using fallback theme:', error);
  }

  // Comprehensive fallback theme
  const safeTheme = {
    text: theme.text || '#000000',
    textSecondary: theme.textSecondary || '#666666',
    accent: theme.accent || '#0891B2',
    success: theme.success || '#10B981',
    primary: theme.primary || '#0891B2',
    background: theme.background || '#F8F9FA'
  };

  return (
    <MaterialCard
      onPress={onPress}
      style={[styles.card, style]}
      {...props}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: safeTheme.text }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.description, { color: safeTheme.textSecondary }]}>
            {description}
          </Text>
        )}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: safeTheme.background }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: progress >= 100 ? safeTheme.success : safeTheme.accent,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: safeTheme.textSecondary }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    </MaterialCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  content: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
});

export default ProjectCard;
