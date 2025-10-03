// Stripe Provider Setup
// This file provides Stripe SDK integration that can be easily enabled/disabled

import React from 'react';
import { MOCK_MODE, STRIPE_CONFIG } from '../config/payment';

// Conditional import - only import Stripe SDK when not in mock mode
let StripeProvider, useStripe, useElements;

if (!MOCK_MODE) {
  try {
    const stripeModule = require('@stripe/stripe-react-native');
    StripeProvider = stripeModule.StripeProvider;
    useStripe = stripeModule.useStripe;
    useElements = stripeModule.useElements;
  } catch (error) {
    console.warn('Stripe SDK not available. Running in mock mode.');
  }
}

// Mock Stripe hooks for development
const createMockStripe = () => ({
  confirmPayment: async (params) => {
    return { error: null, paymentIntent: { id: 'pi_mock_' + Date.now(), status: 'succeeded' } };
  },
  confirmSetupIntent: async (params) => {
    return { error: null, setupIntent: { id: 'seti_mock_' + Date.now(), status: 'succeeded' } };
  },
  retrievePaymentIntent: async (clientSecret) => {
    return { error: null, paymentIntent: { id: 'pi_mock_' + Date.now(), status: 'requires_payment_method' } };
  },
  presentPaymentSheet: async (params) => {
    return { error: null };
  },
  initPaymentSheet: async (params) => {
    return { error: null };
  },
  createPaymentMethod: async (params) => {
    return { error: null, paymentMethod: { id: 'pm_mock_' + Date.now() } };
  },
  retrieveSetupIntent: async (clientSecret) => {
    return { error: null, setupIntent: { id: 'seti_mock_' + Date.now(), status: 'requires_payment_method' } };
  },
  presentApplePay: async (params) => {
    return { error: null };
  },
  presentGooglePay: async (params) => {
    return { error: null };
  },
  isApplePaySupported: async () => {
    return false;
  },
  isGooglePaySupported: async () => {
    return false;
  },
});

const createMockElements = () => ({
  create: (type, options) => {
    return {
      mount: (selector) => {
        return { error: null };
      },
      unmount: () => {
        return { error: null };
      },
      on: (event, handler) => {
        return { error: null };
      },
      update: (options) => {
        return { error: null };
      },
      destroy: () => {
        return { error: null };
      },
    };
  },
  getElement: (type) => {
    return null;
  },
});

// Mock hooks
const useMockStripe = () => createMockStripe();
const useMockElements = () => createMockElements();

// Export the appropriate hooks based on mode
export const useStripeHook = MOCK_MODE ? useMockStripe : (useStripe || useMockStripe);
export const useElementsHook = MOCK_MODE ? useMockElements : (useElements || useMockElements);

// Stripe Provider Component
export const QueueUpStripeProvider = ({ children }) => {
  if (MOCK_MODE) {
    return <>{children}</>;
  }

  if (!StripeProvider) {
    console.warn('StripeProvider not available. Running without Stripe integration.');
    return <>{children}</>;
  }

  return (
    <StripeProvider
      publishableKey={STRIPE_CONFIG.publishableKey}
      merchantIdentifier="merchant.com.queueup.app" // Replace with your merchant ID
      urlScheme="queueup" // Your app's URL scheme
    >
      {children}
    </StripeProvider>
  );
};

// Export Stripe utilities
export const StripeUtils = {
  // Check if Stripe is available
  isAvailable: () => !MOCK_MODE && !!StripeProvider,
  
  // Get current mode
  getMode: () => MOCK_MODE ? 'mock' : 'production',
  
  // Get publishable key
  getPublishableKey: () => STRIPE_CONFIG.publishableKey,
  
  // Validate configuration
  validateConfig: () => {
    if (MOCK_MODE) return { valid: true, message: 'Running in mock mode' };
    
    if (!STRIPE_CONFIG.publishableKey || STRIPE_CONFIG.publishableKey.includes('mock')) {
      return { valid: false, message: 'Stripe publishable key not configured' };
    }
    
    return { valid: true, message: 'Stripe configuration valid' };
  }
};

export default QueueUpStripeProvider;
