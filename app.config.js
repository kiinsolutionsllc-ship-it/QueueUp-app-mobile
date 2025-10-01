// App Configuration for QueueUp
// Updated for free deployment setup

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const getAppName = () => {
  return 'QueueUp';
};

const getBundleIdentifier = () => {
  return 'com.queueup.app';
};

export default {
  expo: {
    name: getAppName(),
    slug: 'queueup',
    version: '5.0.0',
    assetBundlePatterns: [
      '**/*'
    ],
    web: {
      favicon: './assets/Logo.jpg',
      bundler: 'metro',
      // Optimize for web deployment
      build: {
        babel: {
          include: [
            '@react-native',
            'react-native',
            'react-native-web',
            'react-native-svg',
            'react-native-vector-icons',
            'react-native-paper',
            'react-native-elements',
            'react-native-gifted-chat',
            'react-native-maps',
            'react-native-calendars',
            'react-native-chart-kit',
            'react-native-ratings',
            'react-native-super-grid',
            'react-native-image-viewing',
            'react-native-modal',
            'react-native-credit-card-input',
            'react-native-device-info',
            'react-native-keychain',
            'react-native-permissions',
            'react-native-tts',
            'react-native-voice',
            'react-native-worklets',
            'react-native-worklets-core',
            'victory-native',
            '@shopify/react-native-skia',
            '@stripe/stripe-react-native',
            '@supabase/supabase-js',
            '@tanstack/react-query',
            '@reduxjs/toolkit',
            'redux-persist',
            'react-redux',
            'crypto-js',
            'ws'
          ]
        }
      }
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || '00000000-0000-0000-0000-000000000000'
      },
      // Production environment variables
      supabase: {
        url: process.env.EXPO_PUBLIC_SUPABASE_URL,
        anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      },
      app: {
        name: getAppName(),
        version: '5.0.0',
        environment: 'production'
      },
      // Production API keys
      apis: {
        googleMaps: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        stripe: {
          publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
        }
      }
    },
    // Update configuration for OTA updates
    updates: {
      enabled: true,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0
    },
    // Runtime version for updates
    runtimeVersion: {
      policy: 'sdkVersion'
    }
  }
};