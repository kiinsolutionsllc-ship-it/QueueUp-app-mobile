import { ErrorBoundaryConfig } from './GenericErrorBoundary';

export const FORM_ERROR_CONFIG: ErrorBoundaryConfig = {
  errorCode: 'FORM_ERROR',
  title: 'Something went wrong',
  message: 'We encountered an unexpected error. This could be due to:',
  iconName: 'warning',
  possibleCauses: [
    'Form validation issues',
    'Network connectivity problems',
    'Temporary service outage',
  ],
  primaryAction: {
    label: 'Try Again',
    icon: 'replay',
    onPress: () => {}, // Will be overridden by the component
  },
  secondaryAction: {
    label: 'Reset Form',
    icon: 'refresh',
    onPress: () => {}, // Will be overridden by the component
  },
};

export const PAYMENT_ERROR_CONFIG: ErrorBoundaryConfig = {
  errorCode: 'PAYMENT_ERROR',
  title: 'Payment Error',
  message: 'We encountered an error while processing your payment. This could be due to:',
  iconName: 'error-outline',
  possibleCauses: [
    'Network connectivity issues',
    'Payment method declined',
    'Temporary service outage',
  ],
  primaryAction: {
    label: 'Try Again',
    icon: 'replay',
    onPress: () => {}, // Will be overridden by the component
  },
  secondaryAction: {
    label: 'Cancel',
    icon: 'close',
    onPress: () => {}, // Will be overridden by the component
  },
};

export const NETWORK_ERROR_CONFIG: ErrorBoundaryConfig = {
  errorCode: 'NETWORK_ERROR',
  title: 'Connection Error',
  message: 'We encountered a network error. This could be due to:',
  iconName: 'wifi-off',
  possibleCauses: [
    'Poor internet connection',
    'Server temporarily unavailable',
    'Network timeout',
  ],
  primaryAction: {
    label: 'Retry',
    icon: 'refresh',
    onPress: () => {}, // Will be overridden by the component
  },
};

export const GENERAL_ERROR_CONFIG: ErrorBoundaryConfig = {
  errorCode: 'GENERAL_ERROR',
  title: 'Something went wrong',
  message: 'We encountered an unexpected error. This could be due to:',
  iconName: 'error',
  possibleCauses: [
    'Temporary service issues',
    'Data synchronization problems',
    'Application state conflicts',
  ],
  primaryAction: {
    label: 'Try Again',
    icon: 'replay',
    onPress: () => {}, // Will be overridden by the component
  },
  secondaryAction: {
    label: 'Go Back',
    icon: 'arrow-back',
    onPress: () => {}, // Will be overridden by the component
  },
};
