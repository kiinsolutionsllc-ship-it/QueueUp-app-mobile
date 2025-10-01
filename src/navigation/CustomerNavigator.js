import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { useFeatureContext } from '../contexts/FeatureContext';

// Import screens
import HomeScreen from '../screens/customer/HomeScreen';
import ExploreScreen from '../screens/customer/ExploreScreen';
import MechanicProfileScreen from '../screens/customer/MechanicProfileScreen';
import BidComparisonScreen from '../screens/customer/BidComparisonScreen';
import EscrowPaymentScreen from '../screens/customer/EscrowPaymentScreen';
import DisputeResolutionScreen from '../screens/shared/DisputeResolutionScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import VehicleDashboardScreen from '../screens/customer/VehicleDashboardScreen';
import CustomerJobsScreen from '../screens/customer/CustomerJobsScreen';
import JobDetailsScreen from '../screens/customer/JobDetailsScreen';
import UnifiedProfileScreen from '../screens/shared/UnifiedProfileScreen';
import UnifiedSettingsScreen from '../screens/shared/UnifiedSettingsScreen';
// CreateJobScreen and DirectBookingScreen consolidated into CustomerJobsScreen
import CreateJobScreen from '../screens/customer/CreateJobScreen';
import UnifiedMessagingScreen from '../screens/shared/UnifiedMessagingScreen';
import SchedulingScreenNew from '../screens/shared/SchedulingScreenNew';
import RateMechanicScreen from '../screens/shared/RateMechanicScreen';
import CarInfoScreen from '../screens/customer/CarInfoScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import RecallNotificationsScreen from '../screens/customer/RecallNotificationsScreen';
import ServiceHistoryScreen from '../screens/customer/ServiceHistoryScreen';
import MileageTrackingScreen from '../screens/customer/MileageTrackingScreen';
import ChangeOrderApprovalScreen from '../screens/customer/ChangeOrderApprovalScreen';

// Create wrapper components to avoid inline functions
const CustomerMyBookingsScreen = (props) => <CustomerJobsScreen {...props} />;
const CustomerJobManagementScreen = (props) => <CustomerJobsScreen {...props} />;
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import TwoFactorAuthScreen from '../screens/shared/TwoFactorAuthScreen';
import CustomerAnalyticsScreen from '../screens/customer/CustomerAnalyticsScreen';
import CustomerServiceScreen from '../screens/customer/CustomerServiceScreen';
import CustomerDataExportScreen from '../screens/customer/CustomerDataExportScreen';
import FavoritesScreen from '../screens/customer/FavoritesScreen';
import LoginActivityScreen from '../screens/shared/LoginActivityScreen';
import RatingScreen from '../screens/shared/RatingScreen';
import RebookingScreen from '../screens/shared/RebookingScreen';
import LanguageSelectionScreen from '../screens/shared/LanguageSelectionScreen';
import PrivacyPolicyScreen from '../screens/shared/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/shared/TermsOfServiceScreen';
import PaymentConfirmationScreen from '../screens/shared/PaymentConfirmationScreen';
import PaymentReceiptScreen from '../screens/shared/PaymentReceiptScreen';
import JobCompletionScreen from '../screens/shared/JobCompletionScreen';
import NotificationSettingsScreen from '../screens/shared/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/shared/PrivacySecurityScreen';
import AccessibilitySettingsScreen from '../screens/shared/AccessibilitySettingsScreen';
import UnifiedSupportScreen from '../screens/shared/UnifiedSupportScreen';
import WeatherDetailsScreen from '../screens/shared/WeatherDetailsScreen';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import UnifiedBottomTab from '../components/shared/UnifiedBottomTab';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function CustomerTabs() {

  return (
    <Tab.Navigator
      tabBar={(props) => <UnifiedBottomTab {...props} userType="customer" />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar since we're using custom
        },
      }}
    >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />
        <Tab.Screen
          name="Messaging"
          component={UnifiedMessagingScreen}
        />
        <Tab.Screen
          name="Settings"
          component={UnifiedSettingsScreen}
        />
      </Tab.Navigator>
    );
  }

export default function CustomerNavigator() {
  const { isFeatureEnabled } = useFeatureContext();
  

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
        },
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen name="Jobs" component={CustomerJobsScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="MyBookings" component={CustomerMyBookingsScreen} />
      <Stack.Screen name="JobManagement" component={CustomerJobManagementScreen} />
      <Stack.Screen name="CustomerAnalytics" component={CustomerAnalyticsScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="MechanicProfile" component={MechanicProfileScreen} />
      <Stack.Screen name="BidComparison" component={BidComparisonScreen} />
      <Stack.Screen name="EscrowPayment" component={EscrowPaymentScreen} />
      <Stack.Screen name="DisputeResolution" component={DisputeResolutionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="VehicleDashboard" component={VehicleDashboardScreen} />
      <Stack.Screen name="Profile" component={UnifiedProfileScreen} />
      <Stack.Screen name="UnifiedProfile" component={UnifiedProfileScreen} />
      <Stack.Screen name="CreateJob" component={CreateJobScreen} />
      <Stack.Screen name="DirectBooking" component={CustomerJobsScreen} />
      
      {/* Messaging screens - always accessible */}
      <Stack.Screen name="Messaging" component={UnifiedMessagingScreen} />
      <Stack.Screen name="SimpleMessaging" component={UnifiedMessagingScreen} />
      <Stack.Screen name="ConversationList" component={UnifiedMessagingScreen} />
      
      <Stack.Screen 
        name="Scheduling" 
        component={SchedulingScreenNew}
        options={{
          headerShown: false,
          presentation: 'card',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="RateMechanic" component={RateMechanicScreen} />
      <Stack.Screen 
        name="ChangeOrderApproval" 
        component={ChangeOrderApprovalScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          animationTypeForReplace: 'push',
        }}
      />
      
      <Stack.Screen name="CarInfo" component={CarInfoScreen} />
      
      {isFeatureEnabled('recallNotifications') && (
        <Stack.Screen name="RecallNotifications" component={RecallNotificationsScreen} />
      )}
      
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      
      {isFeatureEnabled('mileageTracking') && (
        <Stack.Screen name="MileageTracking" component={MileageTrackingScreen} />
      )}
      
      <Stack.Screen name="Settings" component={UnifiedSettingsScreen} />
      
      {isFeatureEnabled('paymentMethods') && (
        <Stack.Screen name="PaymentMethods" component={PaymentMethodScreen} />
      )}
      
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} />
      <Stack.Screen name="JobCompletion" component={JobCompletionScreen} />
      <Stack.Screen name="WeatherDetails" component={WeatherDetailsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
      <Stack.Screen name="LoginActivity" component={LoginActivityScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
      <Stack.Screen name="Rebooking" component={RebookingScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
      <Stack.Screen name="HelpSupport" component={UnifiedSupportScreen} />
      
      {isFeatureEnabled('analytics') && (
        <Stack.Screen name="Analytics" component={AnalyticsDashboard} />
      )}
      
      {isFeatureEnabled('customerService') && (
        <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
      )}
      
      {isFeatureEnabled('dataExport') && (
        <Stack.Screen name="CustomerDataExport" component={CustomerDataExportScreen} />
      )}
      
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      
      {/* Feature Toggle Screen - Always accessible for admin purposes */}
    </Stack.Navigator>
  );
}
