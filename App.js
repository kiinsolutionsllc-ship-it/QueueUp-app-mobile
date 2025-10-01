import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, persistor } from './src/store';
import { QueryProvider } from './src/providers/QueryProvider';

// Global error handler to catch _tracking errors with stack trace
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0] && args[0].includes && args[0].includes('_tracking')) {
    console.log('=== _TRACKING ERROR DETECTED ===');
    console.log('Error:', args[0]);
    console.log('Stack trace:', new Error().stack);
    console.log('================================');
  }
  originalConsoleError.apply(console, args);
};

// Import database initialization
import { initializeDatabase } from './src/services/initializeDatabase';

// Import navigation components
import AuthNavigator from './src/navigation/AuthNavigator';
import CustomerNavigator from './src/navigation/CustomerNavigator';
import MechanicNavigator from './src/navigation/MechanicNavigator';

// Import screens
import LoadingScreen from './src/screens/shared/LoadingScreen';
import UserTypeSelectionScreen from './src/screens/shared/UserTypeSelectionScreen';

// Import context providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext.tsx';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { JobProvider } from './src/contexts/SimplifiedJobContext';
import { ChangeOrderWorkflowProvider } from './src/contexts/ChangeOrderWorkflowContext';
import { UnifiedMessagingProvider } from './src/contexts/UnifiedMessagingContext';
import { PaymentProvider } from './src/contexts/PaymentContext';
import { ReviewProvider } from './src/contexts/ReviewContext';
import ServiceInitializer from './src/services/ServiceInitializer';
import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { EarningsDisplayProvider } from './src/contexts/EarningsDisplayContext';
import { FeatureProvider } from './src/contexts/FeatureContext';
import { VehicleProvider } from './src/contexts/VehicleContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { SupportProvider } from './src/contexts/SupportContext';
import { QueueUpStripeProvider } from './src/providers/StripeProvider';
import { useToast, ToastContainer } from './src/components/shared/ToastNotification';
import EventEmitter from './src/utils/EventEmitter';

const Stack = createStackNavigator();

// Error Boundary to catch React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('=== REACT ERROR BOUNDARY CAUGHT ===');
    console.log('Error:', error);
    console.log('Error Info:', errorInfo);
    console.log('Stack trace:', error.stack);
    console.log('===================================');
  }

  render() {
    if (this.state.hasError) {
      return null; // Let the app continue running
    }
    return this.props.children;
  }
}

function AppContent() {
  const { user, userType, loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const { toasts, hideToast, showWarning } = useToast();

  // Initialize services and database
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize services
        ServiceInitializer.initializeServices();
        
        // Initialize database (Supabase)
        console.log('App: Initializing Supabase connection...');
        const dbResult = await initializeDatabase();
        if (dbResult.success) {
          console.log('App: Supabase connection ready');
        } else {
          console.error('App: Supabase connection failed:', dbResult.error);
        }
      } catch (error) {
        console.error('App: Error during initialization:', error);
      }
    };
    
    initializeApp();
  }, []);

  // Listen for job expiration and expiring events
  useEffect(() => {
    const handleJobExpired = (data) => {
      const { message } = data;
      showWarning(message, { duration: 5000 });
    };

    const handleJobExpiring = (data) => {
      const { message } = data;
      showWarning(message, { duration: 7000 });
    };

    // Use EventEmitter for cross-platform compatibility
    EventEmitter.on('jobExpired', handleJobExpired);
    EventEmitter.on('jobExpiring', handleJobExpiring);
    
    return () => {
      EventEmitter.off('jobExpired', handleJobExpired);
      EventEmitter.off('jobExpiring', handleJobExpiring);
    };
  }, [showWarning]);

  useEffect(() => {
    if (!loading) {
      // Show loading screen for 4 seconds, then show user type selection
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleUserTypeSelect = (type) => {
    setSelectedUserType(type);
  };

  // Determine what to render based on state
  const shouldShowLoading = showLoading; // Removed loading from auth flow to prevent brief flash

  // Always render the same structure to maintain hook order
  return (
    <SupportProvider userId={user?.id}>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent" 
        translucent={true}
        hidden={false}
      />
      <ToastContainer toasts={toasts} onHide={hideToast} />
      
      {shouldShowLoading ? (
        <LoadingScreen onComplete={setShowLoading} />
      ) : (
        <NavigationContainer
          key={user ? 'authenticated' : 'unauthenticated'}
          onReady={() => {
            console.log('NavigationContainer is ready');
          }}
        >
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
              gestureEnabled: true,
            }}
          >
            {!user ? (
              <>
                <Stack.Screen 
                  name="UserTypeSelection" 
                  component={UserTypeSelectionScreen}
                />
                <Stack.Screen 
                  name="Auth" 
                  component={AuthNavigator}
                  initialParams={{ userType: selectedUserType }}
                />
              </>
            ) : userType === 'customer' ? (
              <Stack.Screen name="Customer" component={CustomerNavigator} />
            ) : (
              <Stack.Screen name="Mechanic" component={MechanicNavigator} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </SupportProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          {persistor ? (
            <PersistGate loading={null} persistor={persistor}>
            <QueryProvider>
              <LanguageProvider>
                <AuthProvider>
                  <ThemeProvider>
                    <AccessibilityProvider>
                      <PaperProvider>
                        <FeatureProvider>
                          <EarningsDisplayProvider>
                            <VehicleProvider>
                              <SubscriptionProvider>
                                <JobProvider>
                                  <ChangeOrderWorkflowProvider>
                                    <UnifiedMessagingProvider>
                                      <PaymentProvider>
                                        <ReviewProvider>
                                          <NotificationProvider>
                                            <LocationProvider>
                                              <QueueUpStripeProvider>
                                                <AppContent />
                                              </QueueUpStripeProvider>
                                            </LocationProvider>
                                          </NotificationProvider>
                                        </ReviewProvider>
                                      </PaymentProvider>
                                    </UnifiedMessagingProvider>
                                  </ChangeOrderWorkflowProvider>
                                </JobProvider>
                              </SubscriptionProvider>
                            </VehicleProvider>
                          </EarningsDisplayProvider>
                        </FeatureProvider>
                      </PaperProvider>
                    </AccessibilityProvider>
                    </ThemeProvider>
                </AuthProvider>
              </LanguageProvider>
            </QueryProvider>
            </PersistGate>
          ) : (
            <QueryProvider>
              <LanguageProvider>
                <AuthProvider>
                  <ThemeProvider>
                    <AccessibilityProvider>
                      <PaperProvider>
                        <FeatureProvider>
                          <EarningsDisplayProvider>
                            <VehicleProvider>
                              <SubscriptionProvider>
                                <JobProvider>
                                  <ChangeOrderWorkflowProvider>
                                    <UnifiedMessagingProvider>
                                      <PaymentProvider>
                                        <ReviewProvider>
                                          <NotificationProvider>
                                            <LocationProvider>
                                              <QueueUpStripeProvider>
                                                <AppContent />
                                              </QueueUpStripeProvider>
                                            </LocationProvider>
                                          </NotificationProvider>
                                        </ReviewProvider>
                                      </PaymentProvider>
                                    </UnifiedMessagingProvider>
                                  </ChangeOrderWorkflowProvider>
                                </JobProvider>
                              </SubscriptionProvider>
                            </VehicleProvider>
                          </EarningsDisplayProvider>
                        </FeatureProvider>
                      </PaperProvider>
                    </AccessibilityProvider>
                    </ThemeProvider>
                </AuthProvider>
              </LanguageProvider>
            </QueryProvider>
          )}
        </ReduxProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

