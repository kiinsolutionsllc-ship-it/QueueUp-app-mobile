import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// Import screens
import MechanicDashboard from '../screens/mechanic/MechanicDashboard';
import MechanicJobsScreen from '../screens/mechanic/MechanicJobsScreen';
import UnifiedSettingsScreen from '../screens/shared/UnifiedSettingsScreen';
import UnifiedMessagingScreen from '../screens/shared/UnifiedMessagingScreen';
import SchedulingScreenNew from '../screens/shared/SchedulingScreenNew';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SubscriptionPlanScreen from '../screens/mechanic/SubscriptionPlanScreen';
import ChangePasswordScreen from '../screens/shared/ChangePasswordScreen';
import TwoFactorAuthScreen from '../screens/shared/TwoFactorAuthScreen';
import LoginActivityScreen from '../screens/shared/LoginActivityScreen';
import ProfileManagementScreen from '../screens/shared/ProfileManagementScreen';
import RatingScreen from '../screens/shared/RatingScreen';
import LanguageSelectionScreen from '../screens/shared/LanguageSelectionScreen';
import PrivacyPolicyScreen from '../screens/shared/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/shared/TermsOfServiceScreen';
import ExportHistoryScreen from '../screens/shared/ExportHistoryScreen';
import RepeatJobScreen from '../screens/shared/RepeatJobScreen';
import NotificationSettingsScreen from '../screens/shared/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/shared/PrivacySecurityScreen';
import AccessibilitySettingsScreen from '../screens/shared/AccessibilitySettingsScreen';
import UnifiedSupportScreen from '../screens/shared/UnifiedSupportScreen';
import PaymentConfirmationScreen from '../screens/shared/PaymentConfirmationScreen';
import PaymentReceiptScreen from '../screens/shared/PaymentReceiptScreen';
import JobCompletionScreen from '../screens/shared/JobCompletionScreen';
import PaymentMethodScreen from '../screens/customer/PaymentMethodScreen';
import PricingManagementScreen from '../screens/mechanic/PricingManagementScreen';
import AvailabilityStatusScreen from '../screens/mechanic/AvailabilityStatusScreen';
import UnifiedProfileScreen from '../screens/shared/UnifiedProfileScreen';
import UnifiedBottomTab from '../components/shared/UnifiedBottomTab';
import MechanicEarningsScreen from '../screens/mechanic/MechanicEarningsScreen';
import BankAccountInfoScreen from '../screens/mechanic/BankAccountInfoScreen';
import PaymentHistoryScreen from '../screens/mechanic/PaymentHistoryScreen';
import MechanicAnalyticsScreen from '../screens/mechanic/MechanicAnalyticsScreen';
import JobHistoryScreen from '../screens/mechanic/JobHistoryScreen';
import CustomerServiceScreen from '../screens/customer/CustomerServiceScreen';
// StripeConnectScreen removed - using backend integration
import MechanicChangeOrderRequestScreen from '../screens/mechanic/MechanicChangeOrderRequestScreen';
import JobDetailsScreen from '../screens/customer/JobDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MechanicTabs() {
  const { getCurrentTheme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <UnifiedBottomTab {...props} userType="mechanic" />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide default tab bar since we're using custom
        },
      }}
    >
        <Tab.Screen
          name="Dashboard"
          component={MechanicDashboard}
        />
        <Tab.Screen
          name="Jobs"
          component={MechanicJobsScreen}
        />
        <Tab.Screen
          name="Analytics"
          component={MechanicAnalyticsScreen}
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

export default function MechanicNavigator() {
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
      <Stack.Screen name="MechanicTabs" component={MechanicTabs} />
      <Stack.Screen 
        name="Scheduling" 
        component={SchedulingScreenNew}
        options={{
          headerShown: false,
          presentation: 'card',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SubscriptionPlan" component={SubscriptionPlanScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
      <Stack.Screen name="LoginActivity" component={LoginActivityScreen} />
      <Stack.Screen name="ProfileManagement" component={ProfileManagementScreen} />
      <Stack.Screen name="Rating" component={RatingScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="ExportHistory" component={ExportHistoryScreen} />
      <Stack.Screen name="RepeatJob" component={RepeatJobScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="AccessibilitySettings" component={AccessibilitySettingsScreen} />
      <Stack.Screen name="HelpSupport" component={UnifiedSupportScreen} />
      <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
      <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} />
      <Stack.Screen name="JobCompletion" component={JobCompletionScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodScreen} />
      <Stack.Screen name="PricingManagement" component={PricingManagementScreen} />
      <Stack.Screen name="AvailabilityStatus" component={AvailabilityStatusScreen} />
      <Stack.Screen name="MechanicProfile" component={UnifiedProfileScreen} />
      <Stack.Screen name="UnifiedProfile" component={UnifiedProfileScreen} />
      <Stack.Screen name="MechanicEarnings" component={MechanicEarningsScreen} />
      <Stack.Screen name="BankAccountInfo" component={BankAccountInfoScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="JobHistory" component={JobHistoryScreen} />
      <Stack.Screen name="CustomerService" component={CustomerServiceScreen} />
      {/* StripeConnect screen removed - using backend integration */}
      <Stack.Screen 
        name="ChangeOrderRequest" 
        component={MechanicChangeOrderRequestScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="JobManagement" component={MechanicJobsScreen} />
      
      {/* Messaging screens */}
      <Stack.Screen name="Messaging" component={UnifiedMessagingScreen} />
      <Stack.Screen name="SimpleMessaging" component={UnifiedMessagingScreen} />
      <Stack.Screen name="ConversationList" component={UnifiedMessagingScreen} />
    </Stack.Navigator>
  );
}
