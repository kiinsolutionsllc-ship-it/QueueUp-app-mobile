import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Alert,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';

// Accessibility Manager Hook
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);
  const [isGrayscaleEnabled, setIsGrayscaleEnabled] = useState(false);
  const [isInvertColorsEnabled, setIsInvertColorsEnabled] = useState(false);
  const [fontScale] = useState(1);

  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const screenReader = await AccessibilityInfo.isScreenReaderEnabled();
        const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
        const boldText = await AccessibilityInfo.isBoldTextEnabled();
        const grayscale = await AccessibilityInfo.isGrayscaleEnabled();
        const invertColors = await AccessibilityInfo.isInvertColorsEnabled();

        setIsScreenReaderEnabled(screenReader);
        setIsReduceMotionEnabled(reduceMotion);
        setIsBoldTextEnabled(boldText);
        setIsGrayscaleEnabled(grayscale);
        setIsInvertColorsEnabled(invertColors);

        // Listen for changes
        const screenReaderSubscription = AccessibilityInfo.addEventListener(
          'screenReaderChanged',
          setIsScreenReaderEnabled
        );

        const reduceMotionSubscription = AccessibilityInfo.addEventListener(
          'reduceMotionChanged',
          setIsReduceMotionEnabled
        );

        const boldTextSubscription = AccessibilityInfo.addEventListener(
          'boldTextChanged',
          setIsBoldTextEnabled
        );

        const grayscaleSubscription = AccessibilityInfo.addEventListener(
          'grayscaleChanged',
          setIsGrayscaleEnabled
        );

        const invertColorsSubscription = AccessibilityInfo.addEventListener(
          'invertColorsChanged',
          setIsInvertColorsEnabled
        );

        return () => {
          screenReaderSubscription?.remove();
          reduceMotionSubscription?.remove();
          boldTextSubscription?.remove();
          grayscaleSubscription?.remove();
          invertColorsSubscription?.remove();
        };
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();
  }, []);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isBoldTextEnabled,
    isGrayscaleEnabled,
    isInvertColorsEnabled,
    fontScale,
  };
};

// Enhanced Accessible Button
export const AccessibleButton = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { isScreenReaderEnabled } = useAccessibility();

  const handlePress = async () => {
    if (isScreenReaderEnabled) {
      await hapticService.light();
    } else {
      await hapticService.buttonPress();
    }
    onPress?.();
  };

  return (
    <View
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      style={[styles.accessibleButton, { backgroundColor: theme.primary }, style]}
      onTouchEnd={handlePress}
      {...props}
    >
      {children}
    </View>
  );
};

// Accessible Text Input
export const AccessibleTextInput = ({
  value,
  placeholder,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...otherProps
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[styles.accessibleInput, { borderColor: theme.divider }, style]}
    >
      <Text
        style={[styles.inputText, { color: theme.text }]}
        onPress={() => {
          // Focus the input
        }}
      >
        {value || placeholder}
      </Text>
    </View>
  );
};

// Accessible Card
export const AccessibleCard = ({
  children,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={subtitle}
      style={[styles.accessibleCard, { backgroundColor: theme.surface }, style]}
      onTouchEnd={onPress}
      {...props}
    >
      {title && (
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {title}
        </Text>
      )}
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      )}
      {children}
    </View>
  );
};

// Accessible List Item
export const AccessibleListItem = ({
  title,
  subtitle,
  icon,
  onPress,
  accessibilityLabel,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={subtitle}
      style={[styles.listItem, { backgroundColor: theme.surface }, style]}
      onTouchEnd={onPress}
      {...props}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={24}
          color={theme.primary}
          style={styles.listItemIcon}
        />
      )}
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

// Accessible Switch
export const AccessibleSwitch = ({
  value,
  onValueChange,
  label,
  accessibilityLabel,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View
      accessible={true}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ checked: value }}
      style={[styles.switchContainer, style]}
      {...props}
    >
      <Text style={[styles.switchLabel, { color: theme.text }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.divider, true: theme.primary }}
        thumbColor={value ? theme.onPrimary : theme.textSecondary}
      />
    </View>
  );
};

// Accessible Progress Bar
export const AccessibleProgressBar = ({
  progress,
  total = 100,
  label,
  accessibilityLabel,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const percentage = Math.round((progress / total) * 100);

  return (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityValue={{ min: 0, max: total, now: progress }}
      style={[styles.progressContainer, style]}
      {...props}
    >
      {label && (
        <Text style={[styles.progressLabel, { color: theme.text }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: theme.divider },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: theme.accentLight,
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
        {percentage}%
      </Text>
    </View>
  );
};

// Accessibility Settings Screen
export const AccessibilitySettings = () => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isBoldTextEnabled,
  } = useAccessibility();

  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const handleAnnouncement = async (message) => {
    if (isScreenReaderEnabled) {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const handleHapticToggle = async (value) => {
    setHapticFeedback(value);
    await hapticService.light();
    await handleAnnouncement(`Haptic feedback ${value ? 'enabled' : 'disabled'}`);
  };

  const handleHighContrastToggle = async (value) => {
    setHighContrast(value);
    await hapticService.light();
    await handleAnnouncement(`High contrast ${value ? 'enabled' : 'disabled'}`);
  };

  const handleLargeTextToggle = async (value) => {
    setLargeText(value);
    await hapticService.light();
    await handleAnnouncement(`Large text ${value ? 'enabled' : 'disabled'}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Accessibility Settings
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          System Settings
        </Text>
        
        <AccessibleListItem
          title="Screen Reader"
          subtitle={isScreenReaderEnabled ? 'Enabled' : 'Disabled'}
          icon="accessibility"
          accessibilityLabel={`Screen reader is ${isScreenReaderEnabled ? 'enabled' : 'disabled'}`}
        />
        
        <AccessibleListItem
          title="Reduce Motion"
          subtitle={isReduceMotionEnabled ? 'Enabled' : 'Disabled'}
          icon="motion-photos-off"
          accessibilityLabel={`Reduce motion is ${isReduceMotionEnabled ? 'enabled' : 'disabled'}`}
        />
        
        <AccessibleListItem
          title="Bold Text"
          subtitle={isBoldTextEnabled ? 'Enabled' : 'Disabled'}
          icon="format-bold"
          accessibilityLabel={`Bold text is ${isBoldTextEnabled ? 'enabled' : 'disabled'}`}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          App Settings
        </Text>
        
        <AccessibleSwitch
          label="Haptic Feedback"
          value={hapticFeedback}
          onValueChange={handleHapticToggle}
          accessibilityLabel="Toggle haptic feedback"
        />
        
        <AccessibleSwitch
          label="High Contrast"
          value={highContrast}
          onValueChange={handleHighContrastToggle}
          accessibilityLabel="Toggle high contrast mode"
        />
        
        <AccessibleSwitch
          label="Large Text"
          value={largeText}
          onValueChange={handleLargeTextToggle}
          accessibilityLabel="Toggle large text mode"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Test Accessibility
        </Text>
        
        <AccessibleButton
          onPress={() => handleAnnouncement('This is a test announcement')}
          accessibilityLabel="Test screen reader announcement"
          style={styles.testButton}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            Test Announcement
          </Text>
        </AccessibleButton>
        
        <AccessibleButton
          onPress={() => {
            Alert.alert('Accessibility Test', 'This is a test alert for accessibility');
          }}
          accessibilityLabel="Test alert dialog"
          style={styles.testButton}
        >
          <Text style={[styles.buttonText, { color: theme.onPrimary }]}>
            Test Alert
          </Text>
        </AccessibleButton>
      </View>
    </View>
  );
};

// Accessibility Utils
export const accessibilityUtils = {
  // Announce text to screen reader
  announce: async (text) => {
    await AccessibilityInfo.announceForAccessibility(text);
  },

  // Set accessibility focus
  setFocus: (ref) => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  },

  // Check if screen reader is enabled
  isScreenReaderEnabled: async () => {
    return await AccessibilityInfo.isScreenReaderEnabled();
  },

  // Check if reduce motion is enabled
  isReduceMotionEnabled: async () => {
    return await AccessibilityInfo.isReduceMotionEnabled();
  },

  // Generate accessibility label
  generateLabel: (title, subtitle, status) => {
    let label = title;
    if (subtitle) label += `, ${subtitle}`;
    if (status) label += `, ${status}`;
    return label;
  },

  // Generate accessibility hint
  generateHint: (action, additionalInfo) => {
    let hint = `Double tap to ${action}`;
    if (additionalInfo) hint += `. ${additionalInfo}`;
    return hint;
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  accessibleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Minimum touch target size
  },
  accessibleInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
  },
  accessibleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 44,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 44,
  },
  listItemIcon: {
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 44,
  },
  switchLabel: {
    fontSize: 16,
    flex: 1,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  testButton: {
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default {
  useAccessibility,
  AccessibleButton,
  AccessibleTextInput,
  AccessibleCard,
  AccessibleListItem,
  AccessibleSwitch,
  AccessibleProgressBar,
  AccessibilitySettings,
  accessibilityUtils,
};
