import React, { useState, useEffect, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react'; // Removed - no persistence
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
import { AuthProvider, useAuth } from './src/contexts/AuthContextSupabase';
import { PublicDataProvider } from './src/contexts/PublicDataContext';
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
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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

function AppContent(): React.JSX.Element {
  const { user, userType, loading } = useAuth();
  const [showLoading, setShowLoading] = useState<boolean>(true);
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'mechanic' | null>(null);
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
    const handleJobExpired = (data: any) => {
      const { message } = data;
      showWarning(message, { duration: 5000 });
    };

    const handleJobExpiring = (data: any) => {
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
      // If user is authenticated, skip loading screen and go directly to their home
      if (user) {
        setShowLoading(false);
        return;
      }
      
      // Show loading screen for 4 seconds, then show user type selection
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, user]);

  const handleUserTypeSelect = (type: 'customer' | 'mechanic') => {
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

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <QueryProvider>
            <LanguageProvider>
              <PublicDataProvider>
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
            </PublicDataProvider>
          </LanguageProvider>
        </QueryProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  </ErrorBoundary>
);
}

