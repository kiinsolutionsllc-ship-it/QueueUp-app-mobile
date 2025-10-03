import { Amplify } from 'aws-amplify';
import Constants from 'expo-constants';

// AWS Cognito Configuration for Amplify v6
const userPoolId = Constants.expoConfig?.extra?.aws?.userPoolId || process.env.EXPO_PUBLIC_AWS_USER_POOL_ID;
const userPoolClientId = Constants.expoConfig?.extra?.aws?.userPoolClientId || process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID;
const region = Constants.expoConfig?.extra?.aws?.region || process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-2';

// Check if AWS Cognito is properly configured
const isAWSConfigured = userPoolId && userPoolClientId && 
  userPoolId !== '' && userPoolClientId !== '' &&
  !userPoolId.includes('XXXXXXXXX') && !userPoolClientId.includes('your_cognito');

const awsConfig = isAWSConfigured ? {
  Auth: {
    Cognito: {
      userPoolId: userPoolId,
      userPoolClientId: userPoolClientId,
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
} : null;

// Initialize Amplify
export const initializeAWS = () => {
  try {
    if (!isAWSConfigured) {
      console.warn('AWS Cognito not configured. App will continue without AWS authentication.');
      console.warn('To enable AWS Cognito, set EXPO_PUBLIC_AWS_USER_POOL_ID and EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID in your .env file');
      return { success: true, warning: 'AWS Cognito not configured - using alternative auth' };
    }
    
    console.log('AWS Amplify: Initializing with configuration:', {
      userPoolId: userPoolId ? `${userPoolId.substring(0, 10)}...` : 'Missing',
      userPoolClientId: userPoolClientId ? `${userPoolClientId.substring(0, 10)}...` : 'Missing',
      region: region
    });
    
    Amplify.configure(awsConfig as any);
    console.log('AWS Amplify configured successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to configure AWS Amplify:', error);
    console.error('Configuration details:', {
      userPoolId: userPoolId ? 'Set' : 'Missing',
      userPoolClientId: userPoolClientId ? 'Set' : 'Missing',
      region: region,
      isConfigured: isAWSConfigured
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default awsConfig;
