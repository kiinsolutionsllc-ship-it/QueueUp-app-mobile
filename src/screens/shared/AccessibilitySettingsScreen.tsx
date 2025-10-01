import * as React from 'react';
import { useState } from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

interface AccessibilitySettingsScreenProps {
  navigation: any;
}

const AccessibilitySettingsScreen: React.FC<AccessibilitySettingsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
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
  });

  const handleSettingToggle = (setting: string) => {
    setAccessibilitySettings((prev: any) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your accessibility settings have been saved successfully!');
  };

  const SettingItem = ({ 
    title, 
    description, 
    setting, 
    icon 
  }: {
    title: string;
    description: string;
    setting: string;
    icon: string;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Accessibility"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Visual Accessibility
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Customize visual elements to improve readability and usability.
          </Text>
        </View>

        <View style={styles.settingsContainer}>
          <SettingItem
            title="High Contrast"
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Audio & Haptic
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Configure audio and haptic feedback settings.
          </Text>
        </View>

        <View style={styles.settingsContainer}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Navigation & Interaction
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Customize how you navigate and interact with the app.
          </Text>
        </View>

        <View style={styles.settingsContainer}>
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
        </View>

        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSaveSettings}
          >
            <Text style={[styles.saveButtonText, { color: theme.onPrimary }]}>
              Save Settings
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  settingsContainer: {
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 12,
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

export default AccessibilitySettingsScreen;
