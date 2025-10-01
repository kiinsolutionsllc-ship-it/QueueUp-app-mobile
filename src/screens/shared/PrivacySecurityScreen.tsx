import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';


interface PrivacySecurityScreenProps {
  navigation: any;
}
export default function PrivacySecurityScreen({ navigation }: PrivacySecurityScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [privacySettings, setPrivacySettings] = useState<any>({
    profileVisibility: 'public',
    showLocation: true,
    showContactInfo: false,
    showJobHistory: true,
    allowMessaging: true,
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    personalizedAds: false,
    shareDataWithPartners: false,
  });

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call to save privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Settings Saved',
        'Your privacy and security settings have been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save privacy settings. Please try again.');
    }
  };

  const renderPrivacyItem = (key, title, subtitle, icon) => (
    <View key={key} style={styles.privacyItem}>
      <View style={styles.privacyInfo}>
        <IconFallback name={icon} size={24} color={theme.primary} />
        <View style={styles.privacyText}>
          <Text style={[styles.privacyTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.privacySubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={privacySettings[key]}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: theme.divider, true: theme.primary + '40' }}
        thumbColor={privacySettings[key] ? theme.primary : theme.textSecondary}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Privacy & Security"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Privacy & Security Settings
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Control how your information is shared and used
          </Text>
        </View>

        {/* Profile Visibility */}
        <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Profile Visibility
          </Text>
          
          {renderPrivacyItem(
            'showLocation',
            'Show Location',
            'Display your general location to other users',
            'location-on'
          )}
          
          {renderPrivacyItem(
            'showContactInfo',
            'Show Contact Information',
            'Display your phone number and email',
            'contact-phone'
          )}
          
          {renderPrivacyItem(
            'showJobHistory',
            'Show Job History',
            'Display your completed jobs publicly',
            'history'
          )}
          
          {renderPrivacyItem(
            'allowMessaging',
            'Allow Direct Messaging',
            'Let other users send you messages',
            'chat'
          )}
        </MaterialCard>

        {/* Data Collection */}
        <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Data Collection
          </Text>
          
          {renderPrivacyItem(
            'dataCollection',
            'Data Collection',
            'Allow collection of usage data to improve the app',
            'data-usage'
          )}
          
          {renderPrivacyItem(
            'analytics',
            'Analytics',
            'Help us understand how you use the app',
            'analytics'
          )}
          
          {renderPrivacyItem(
            'crashReporting',
            'Crash Reporting',
            'Send crash reports to help fix bugs',
            'bug-report'
          )}
        </MaterialCard>

        {/* Advertising & Marketing */}
        <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Advertising & Marketing
          </Text>
          
          {renderPrivacyItem(
            'personalizedAds',
            'Personalized Ads',
            'Show ads based on your interests',
            'campaign'
          )}
          
          {renderPrivacyItem(
            'shareDataWithPartners',
            'Share Data with Partners',
            'Allow sharing of anonymized data with partners',
            'share'
          )}
        </MaterialCard>

        {/* Account Security */}
        <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account Security
          </Text>
          
          <View style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <IconFallback name="security" size={24} color={theme.primary} />
              <View style={styles.securityText}>
                <Text style={[styles.securityTitle, { color: theme.text }]}>
                  Two-Factor Authentication
                </Text>
                <Text style={[styles.securitySubtitle, { color: theme.textSecondary }]}>
                  Add extra security to your account
                </Text>
              </View>
            </View>
            <MaterialButton
              title="Enable"
              onPress={() => navigation.navigate('TwoFactorAuth')}
              variant="outlined"
              size="small"
            />
          </View>
          
          <View style={styles.securityItem}>
            <View style={styles.securityInfo}>
              <IconFallback name="lock" size={24} color={theme.primary} />
              <View style={styles.securityText}>
                <Text style={[styles.securityTitle, { color: theme.text }]}>
                  Change Password
                </Text>
                <Text style={[styles.securitySubtitle, { color: theme.textSecondary }]}>
                  Update your account password
                </Text>
              </View>
            </View>
            <MaterialButton
              title="Change"
              onPress={() => navigation.navigate('ChangePassword')}
              variant="outlined"
              size="small"
            />
          </View>
        </MaterialCard>

        {/* Data Management */}
        <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Data Management
          </Text>
          
          <View style={styles.dataItem}>
            <View style={styles.dataInfo}>
              <IconFallback name="download" size={24} color={theme.primary} />
              <View style={styles.dataText}>
                <Text style={[styles.dataTitle, { color: theme.text }]}>
                  Download Your Data
                </Text>
                <Text style={[styles.dataSubtitle, { color: theme.textSecondary }]}>
                  Get a copy of all your data
                </Text>
              </View>
            </View>
            <MaterialButton
              title="Download"
              onPress={() => Alert.alert('Download Data', 'Data download feature coming soon!')}
              variant="outlined"
              size="small"
            />
          </View>
          
          <View style={styles.dataItem}>
            <View style={styles.dataInfo}>
              <IconFallback name="delete-forever" size={24} color={theme.error} />
              <View style={styles.dataText}>
                <Text style={[styles.dataTitle, { color: theme.text }]}>
                  Delete Account
                </Text>
                <Text style={[styles.dataSubtitle, { color: theme.textSecondary }]}>
                  Permanently delete your account and data
                </Text>
              </View>
            </View>
            <MaterialButton
              title="Delete"
              onPress={() => Alert.alert('Delete Account', 'Account deletion feature coming soon!')}
              variant="outlined"
              size="small"
              textStyle={{ color: theme.error }}
            />
          </View>
        </MaterialCard>

        {/* Privacy Information */}
        <MaterialCard style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoHeader}>
            <IconFallback name="info" size={20} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Privacy Information
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Your privacy is important to us. We never sell your personal data.
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • You can change these settings at any time.
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Some features may not work if you disable certain permissions.
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Read our Privacy Policy for more details.
          </Text>
        </MaterialCard>

        {/* Save Button */}
        <MaterialButton
          title="Save Settings"
          onPress={handleSave}
          variant="filled"
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  privacyText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  privacySubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityText: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dataInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataText: {
    marginLeft: 12,
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dataSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 16,
  },
});
