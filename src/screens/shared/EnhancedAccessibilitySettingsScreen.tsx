import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

interface EnhancedAccessibilitySettingsScreenProps {
  navigation: any;
}

const EnhancedAccessibilitySettingsScreen: React.FC<EnhancedAccessibilitySettingsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [accessibilitySettings, setAccessibilitySettings] = useState<any>({
    highContrast: false,
    largeText: false,
    screenReader: false,
    voiceOver: false,
    reducedMotion: false,
    colorBlindSupport: false,
    hapticFeedback: true,
    soundEffects: true,
    keyboardNavigation: false,
    focusIndicators: true,
    textToSpeech: false,
    voiceRecognition: false,
    announceNavigation: true,
    announceButtons: true,
    announceErrors: true,
  });

  const handleSettingToggle = (setting: string) => {
    setAccessibilitySettings((prev: any) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your enhanced accessibility settings have been saved successfully!');
  };

  const SettingItem = ({ 
    title, 
    description, 
    setting, 
    icon,
    category = 'general'
  }: {
    title: string;
    description: string;
    setting: string;
    icon: string;
    category?: string;
  }) => (
    <MaterialCard style={styles.settingItem}>
      <View style={styles.settingContent}>
        <View style={styles.settingInfo}>
          <IconFallback name={icon} size={24} color={theme.primary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              {description}
            </Text>
          </View>
        </View>
        <Switch
          value={accessibilitySettings[setting]}
          onValueChange={() => handleSettingToggle(setting)}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={accessibilitySettings[setting] ? theme.onPrimary : theme.textSecondary}
        />
      </View>
    </MaterialCard>
  );

  const CategorySection = ({ 
    title, 
    description, 
    children 
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.categorySection}>
      <Text style={[styles.categoryTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
        {description}
      </Text>
      <View style={styles.settingsContainer}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Enhanced Accessibility"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visual Accessibility */}
        <CategorySection
          title="Visual Accessibility"
          description="Customize visual elements for better readability and usability"
        >
          <SettingItem
            title="High Contrast Mode"
            description="Increase contrast for better visibility"
            setting="highContrast"
            icon="contrast"
          />
          <SettingItem
            title="Large Text"
            description="Use larger text sizes throughout the app"
            setting="largeText"
            icon="text-fields"
          />
          <SettingItem
            title="Color Blind Support"
            description="Use patterns and shapes instead of just colors"
            setting="colorBlindSupport"
            icon="palette"
          />
          <SettingItem
            title="Focus Indicators"
            description="Show clear focus indicators for navigation"
            setting="focusIndicators"
            icon="visibility"
          />
        </CategorySection>

        {/* Audio & Haptic */}
        <CategorySection
          title="Audio & Haptic"
          description="Configure audio and haptic feedback settings"
        >
          <SettingItem
            title="Haptic Feedback"
            description="Provide tactile feedback for interactions"
            setting="hapticFeedback"
            icon="vibration"
          />
          <SettingItem
            title="Sound Effects"
            description="Play sounds for actions and notifications"
            setting="soundEffects"
            icon="volume-up"
          />
          <SettingItem
            title="Text to Speech"
            description="Read text aloud for better accessibility"
            setting="textToSpeech"
            icon="record-voice-over"
          />
          <SettingItem
            title="Voice Recognition"
            description="Use your voice to interact with the app"
            setting="voiceRecognition"
            icon="mic"
          />
        </CategorySection>

        {/* Navigation & Interaction */}
        <CategorySection
          title="Navigation & Interaction"
          description="Customize how you navigate and interact with the app"
        >
          <SettingItem
            title="Screen Reader"
            description="Enable screen reader support"
            setting="screenReader"
            icon="record-voice-over"
          />
          <SettingItem
            title="Voice Over"
            description="Enable voice over for iOS devices"
            setting="voiceOver"
            icon="mic"
          />
          <SettingItem
            title="Keyboard Navigation"
            description="Enable keyboard navigation support"
            setting="keyboardNavigation"
            icon="keyboard"
          />
          <SettingItem
            title="Reduced Motion"
            description="Minimize animations and transitions"
            setting="reducedMotion"
            icon="slow-motion-video"
          />
        </CategorySection>

        {/* Announcements */}
        <CategorySection
          title="Announcements"
          description="Configure what gets announced during navigation"
        >
          <SettingItem
            title="Announce Navigation"
            description="Speak when navigating between screens"
            setting="announceNavigation"
            icon="navigation"
          />
          <SettingItem
            title="Announce Buttons"
            description="Speak when buttons are pressed"
            setting="announceButtons"
            icon="touch-app"
          />
          <SettingItem
            title="Announce Errors"
            description="Speak when errors occur"
            setting="announceErrors"
            icon="error"
          />
        </CategorySection>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveSettings}
          >
            <Text style={[styles.saveButtonText, { color: theme.onPrimary }]}>
              Save Enhanced Settings
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  settingsContainer: {
    gap: 12,
  },
  settingItem: {
    padding: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  saveSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EnhancedAccessibilitySettingsScreen;
