import React from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useFeatureContext } from '../../contexts/FeatureContext';
import ModernHeader from '../../components/shared/ModernHeader';


interface FeatureToggleScreenProps {
  navigation: any;
}
export default function FeatureToggleScreen({ navigation }: FeatureToggleScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { 
    featureFlags, 
    isFeatureEnabled, 
    toggleFeature, 
    enableFeature, 
    disableFeature,
    getEnabledFeatures,
    getDisabledFeatures,
    resetFeatureFlags
  } = useFeatureContext();
  const theme = getCurrentTheme();

  const featureCategories = [
    {
      title: 'Core Features',
      description: 'Essential features that should always be enabled',
      features: [
        { key: 'homeScreen', label: 'Home Screen', description: 'Main dashboard' },
        { key: 'createJob', label: 'Create Job', description: 'Book services' },
        { key: 'jobsScreen', label: 'Jobs Screen', description: 'View job status' },
        { key: 'profileScreen', label: 'Profile Screen', description: 'Account management' },
        { key: 'basicSettings', label: 'Basic Settings', description: 'Essential settings' },
      ]
    },
    {
      title: 'Advanced Features',
      description: 'Complex features that can overwhelm users',
      features: [
        { key: 'analytics', label: 'Analytics', description: 'Usage statistics and insights' },
        { key: 'dataExport', label: 'Data Export', description: 'Export user data' },
        { key: 'mileageTracking', label: 'Mileage Tracking', description: 'Track vehicle mileage' },
        { key: 'recallNotifications', label: 'Recall Notifications', description: 'Vehicle recall alerts' },
        { key: 'googleCalendar', label: 'Google Calendar', description: 'Calendar integration' },
        { key: 'maintenanceCalendar', label: 'Maintenance Calendar', description: 'Service scheduling' },
        { key: 'vehicleDashboard', label: 'Vehicle Dashboard', description: 'Detailed vehicle info' },
        { key: 'exploreScreen', label: 'Explore Screen', description: 'Discover features' },
        { key: 'advancedMessaging', label: 'Advanced Messaging', description: 'Complex chat features' },
        { key: 'paymentMethods', label: 'Payment Methods', description: 'Payment management' },
        { key: 'serviceHistory', label: 'Service History', description: 'Detailed service records' },
        { key: 'carInfo', label: 'Car Info', description: 'Vehicle information' },
        { key: 'customerService', label: 'Customer Service', description: 'Support system' },
      ]
    },
    {
      title: 'Future Features',
      description: 'Features planned for future releases',
      features: [
        { key: 'aiRecommendations', label: 'AI Recommendations', description: 'Smart service suggestions' },
        { key: 'socialFeatures', label: 'Social Features', description: 'Community features' },
        { key: 'gamification', label: 'Gamification', description: 'Points and rewards' },
      ]
    }
  ];

  const handleToggleFeature = async (featureKey) => {
    const currentState = isFeatureEnabled(featureKey);
    const feature = featureCategories
      .flatMap(cat => cat.features)
      .find(f => f.key === featureKey);
    
    console.log(`Toggling feature: ${featureKey}, current state: ${currentState}`);
    
    if (currentState) {
      Alert.alert(
        'Disable Feature',
        `Are you sure you want to disable "${feature?.label}"? This will hide it from the app.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disable', style: 'destructive', onPress: async () => {
            console.log(`Disabling ${featureKey}...`);
            try {
              await disableFeature(featureKey);
              console.log(`${featureKey} disabled successfully!`);
            } catch (error) {
              console.error(`Error disabling ${featureKey}:`, error);
            }
          }}
        ]
      );
    } else {
      console.log(`Enabling ${featureKey}...`);
      try {
        await enableFeature(featureKey);
        console.log(`${featureKey} enabled successfully!`);
      } catch (error) {
        console.error(`Error enabling ${featureKey}:`, error);
      }
    }
  };

  const handleEnableAll = () => {
    Alert.alert(
      'Enable All Features',
      'This will enable all advanced features. Users may find the app overwhelming.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Enable All', onPress: async () => {
          console.log('Enabling all features...');
          try {
            for (const category of featureCategories) {
              for (const feature of category.features) {
                console.log(`Enabling ${feature.key}...`);
                await enableFeature(feature.key);
              }
            }
            console.log('All features enabled successfully!');
            Alert.alert('Success', 'All features have been enabled!');
          } catch (error) {
            console.error('Error enabling features:', error);
            Alert.alert('Error', 'Failed to enable some features. Please try again.');
          }
        }}
      ]
    );
  };

  const handleDisableAllAdvanced = () => {
    Alert.alert(
      'Disable All Advanced Features',
      'This will disable all advanced features, keeping only the core functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disable All', style: 'destructive', onPress: async () => {
          console.log('Disabling all advanced features...');
          try {
            for (const feature of featureCategories[1].features) {
              console.log(`Disabling ${feature.key}...`);
              await disableFeature(feature.key);
            }
            console.log('All advanced features disabled successfully!');
            Alert.alert('Success', 'All advanced features have been disabled!');
          } catch (error) {
            console.error('Error disabling features:', error);
            Alert.alert('Error', 'Failed to disable some features. Please try again.');
          }
        }}
      ]
    );
  };

  const handleResetToDefault = () => {
    Alert.alert(
      'Reset to Default',
      'This will reset all feature flags to their default state (core features enabled, advanced features disabled).',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: async () => {
          console.log('Resetting feature flags to default...');
          try {
            await resetFeatureFlags();
            console.log('Feature flags reset successfully!');
            Alert.alert('Success', 'Feature flags have been reset to default!');
          } catch (error) {
            console.error('Error resetting feature flags:', error);
            Alert.alert('Error', 'Failed to reset feature flags. Please try again.');
          }
        }}
      ]
    );
  };

  const FeatureItem = ({ feature }) => (
    <View style={[styles.featureItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.featureInfo}>
        <Text style={[styles.featureLabel, { color: theme.text }]}>
          {feature.label}
        </Text>
        <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
          {feature.description}
        </Text>
      </View>
      <Switch
        value={isFeatureEnabled(feature.key)}
        onValueChange={() => handleToggleFeature(feature.key)}
        trackColor={{ false: theme.border, true: theme.accentLight }}
        thumbColor={isFeatureEnabled(feature.key) ? 'white' : theme.textSecondary}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Feature Toggle"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.accentLight }]}
            onPress={handleEnableAll}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.actionButtonText}>Enable All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={handleDisableAllAdvanced}
          >
            <MaterialIcons name="remove" size={20} color="white" />
            <Text style={styles.actionButtonText}>Disable Advanced</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.textSecondary }]}
            onPress={handleResetToDefault}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Categories */}
        {featureCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.category}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>
              {category.title}
            </Text>
            <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
              {category.description}
            </Text>
            
            {category.features.map((feature, featureIndex) => (
              <FeatureItem key={featureIndex} feature={feature} />
            ))}
          </View>
        ))}

        {/* Summary */}
        <View style={[styles.summary, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            Current Status
          </Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Enabled: {getEnabledFeatures().length} features
          </Text>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            Disabled: {getDisabledFeatures().length} features
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  category: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  featureInfo: {
    flex: 1,
    marginRight: 16,
  },
  featureLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
