import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CustomerLoginScreen from '../screens/auth/CustomerLoginScreen';
import MechanicLoginScreen from '../screens/auth/MechanicLoginScreen';
import CustomerRegisterScreen from '../screens/auth/CustomerRegisterScreen';
import MechanicRegisterScreen from '../screens/auth/MechanicRegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

const Stack = createStackNavigator();

export default function AuthNavigator({ route }) {
  const { userType } = route?.params || {};

  // Determine which screens to show based on user type
  const LoginComponent = userType === 'mechanic' ? MechanicLoginScreen : CustomerLoginScreen;
  const RegisterComponent = userType === 'mechanic' ? MechanicRegisterScreen : CustomerRegisterScreen;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
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
      }}
      initialRouteName="Login"
    >
      <Stack.Screen 
        name="Login" 
        component={LoginComponent}
        initialParams={{ userType }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterComponent}
        initialParams={{ userType }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        initialParams={{ userType }}
      />
      <Stack.Screen 
        name="EmailVerification" 
        component={EmailVerificationScreen}
        initialParams={{ userType }}
      />
    </Stack.Navigator>
  );
}