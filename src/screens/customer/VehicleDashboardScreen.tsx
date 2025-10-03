import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useFeatureContext } from '../../contexts/FeatureContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';
import AccessibleHomeHeader from '../../components/shared/AccessibleHomeHeader';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3, Heading4 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import { hapticService } from '../../services/HapticService';
import { HelpModal, HelpContent } from '../../components/shared/HelpSystem';

// Import simplified vehicle components
import VehicleOverview from '../../components/vehicle/VehicleOverview';
import QuickActions from '../../components/vehicle/QuickActions';
import RecentActivity from '../../components/vehicle/RecentActivity';


interface VehicleDashboardScreenProps {
  navigation: any;
}
export default function VehicleDashboardScreen({ navigation }: VehicleDashboardScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isFeatureEnabled, enableFeature } = useFeatureContext();
  const { vehicles, addVehicle } = useVehicle();
  const { unreadCount } = useNotificationCount();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const [isRefreshing, setIsRefreshing] = useState<any>(false);
  const [showHelpModal, setShowHelpModal] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);

  // Enable vehicle-related features when component mounts
  useEffect(() => {
    const enableVehicleFeatures = () => {
      // Enable all vehicle-related features for better user experience
      enableFeature('carInfo');
      enableFeature('serviceHistory');
      enableFeature('maintenanceCalendar');
      enableFeature('recallNotifications');
      enableFeature('mileageTracking');
    };
    
    enableVehicleFeatures();
  }, []); // Empty dependency array to run only once on mount

  // Vehicle initialization is now handled by VehicleContext with AsyncStorage persistence

  // Vehicles are now managed by VehicleContext

  // Simplified data for overview
  const [upcomingServices] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      service: 'Engine Diagnostic',
      date: '2024-02-15',
      priority: 'high',
    },
    {
      id: '2',
      vehicleId: '2',
      service: 'AC System Check',
      date: '2024-03-10',
      priority: 'medium',
    },
  ]);

  const [recallAlerts] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      title: 'Airbag Recall Notice',
      severity: 'high',
      actionRequired: true,
    },
  ]);

  const [recentActivity] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      service: 'Oil Change',
      date: '2024-01-15',
      cost: 45,
      status: 'completed',
    },
    {
      id: '2',
      vehicleId: '1',
      service: 'Brake Inspection',
      date: '2024-01-10',
      cost: 120,
      status: 'completed',
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAddVehicle = async () => {
    await hapticService.buttonPress();
    
    try {
      navigation.navigate('CarInfo', { mode: 'add' });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to CarInfo screen. Please try again.');
    }
  };

  const handleVehiclePress = async (vehicle: any) => {
    try {
      navigation.navigate('CarInfo', { vehicleId: vehicle.id });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to CarInfo screen. Please try again.');
    }
  };

  const handleQuickAction = async (action: any) => {
    try {
      await hapticService.buttonPress();
      
      switch (action) {
        case 'add_vehicle':
          handleAddVehicle();
          break;
        case 'service_history':
          if (isFeatureEnabled('serviceHistory')) {
            navigation.navigate('ServiceHistory');
          } else {
            // Enable the feature and then navigate with a small delay
            enableFeature('serviceHistory');
            setTimeout(() => {
              navigation.navigate('ServiceHistory');
            }, 100);
          }
          break;
        case 'maintenance_calendar':
          if (isFeatureEnabled('maintenanceCalendar')) {
            navigation.navigate('MaintenanceCalendar');
          } else {
            // Enable the feature and then navigate with a small delay
            enableFeature('maintenanceCalendar');
            setTimeout(() => {
              navigation.navigate('MaintenanceCalendar');
            }, 100);
          }
          break;
        case 'recall_notifications':
          if (isFeatureEnabled('recallNotifications')) {
            navigation.navigate('RecallNotifications');
          } else {
            // Enable the feature and then navigate with a small delay
            enableFeature('recallNotifications');
            setTimeout(() => {
              navigation.navigate('RecallNotifications');
            }, 100);
          }
          break;
        case 'mileage_tracking':
          if (isFeatureEnabled('mileageTracking')) {
            navigation.navigate('MileageTracking');
          } else {
            // Enable the feature and then navigate with a small delay
            enableFeature('mileageTracking');
            setTimeout(() => {
              navigation.navigate('MileageTracking');
            }, 100);
          }
          break;
        default:
          // Fallback to jobs screen for unknown actions
          navigation.navigate('Jobs');
          break;
      }
    } catch (error) {
      console.error('Error in handleQuickAction:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to navigate to the requested screen. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleViewAll = async (type: any) => {
    try {
      await hapticService.buttonPress();
      
      switch (type) {
        case 'ServiceHistory':
          if (isFeatureEnabled('serviceHistory')) {
            navigation.navigate('ServiceHistory');
          } else {
            enableFeature('serviceHistory');
            setTimeout(() => {
              navigation.navigate('ServiceHistory');
            }, 100);
          }
          break;
        case 'MaintenanceCalendar':
          if (isFeatureEnabled('maintenanceCalendar')) {
            navigation.navigate('MaintenanceCalendar');
          } else {
            enableFeature('maintenanceCalendar');
            setTimeout(() => {
              navigation.navigate('MaintenanceCalendar');
            }, 100);
          }
          break;
        case 'RecallNotifications':
          if (isFeatureEnabled('recallNotifications')) {
            navigation.navigate('RecallNotifications');
          } else {
            enableFeature('recallNotifications');
            setTimeout(() => {
              navigation.navigate('RecallNotifications');
            }, 100);
          }
          break;
        case 'MileageTracking':
          if (isFeatureEnabled('mileageTracking')) {
            navigation.navigate('MileageTracking');
          } else {
            enableFeature('mileageTracking');
            setTimeout(() => {
              navigation.navigate('MileageTracking');
            }, 100);
          }
          break;
        default:
          // Fallback to Jobs screen
          navigation.navigate('Jobs');
          break;
      }
    } catch (error) {
      console.error('Error in handleViewAll:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to navigate to the requested screen. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Custom Header with Back Button */}
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <IconFallback name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <Text style={[styles.headerTitleText, { color: theme.text }]}>
                My Garage
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <IconFallback name="notifications" size={24} color={theme.text} />
              {(unreadCount > 0 || recallAlerts.filter((alert: any) => alert.actionRequired).length > 0) && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={[styles.badgeText, { color: 'white' }]}>
                    {unreadCount + recallAlerts.filter((alert: any) => alert.actionRequired).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          bounces={true}
          nestedScrollEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustContentInsets={true}
        >
          {/* Vehicle Overview - Compact */}
          <ResponsiveContainer>
            <VehicleOverview
              vehicles={vehicles}
              onVehiclePress={handleVehiclePress}
              onAddVehicle={handleAddVehicle}
              theme={theme}
            />
          </ResponsiveContainer>

          {/* Quick Actions */}
          <ResponsiveContainer>
            <QuickActions
              onActionPress={handleQuickAction}
              theme={theme}
            />
          </ResponsiveContainer>

          {/* Recent Activity - Compact */}
          <ResponsiveContainer>
            <RecentActivity
              recentActivity={recentActivity}
              upcomingServices={upcomingServices}
              recallAlerts={recallAlerts}
              vehicles={vehicles}
              onViewAll={handleViewAll}
              theme={theme}
            />
          </ResponsiveContainer>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Help Modal */}
        <HelpModal
          visible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title="Vehicle Dashboard Help"
          content={HelpContent.vehicleDashboard()}
          style={{}}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 44, // Status bar height
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100, // Increased to ensure bottom content is fully visible
  },
});
