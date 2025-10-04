// Payment Configuration
// This file controls payment processing modes and settings

// ========================================
// PRODUCTION READY CONFIGURATION
// ========================================

// Set to false when ready for production
export const MOCK_MODE = false;

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Test keys (replace with your actual keys)
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
    'pk_test_51S8nKH6HKxKWpydjftCdcPxttrdERkXt48vDPlULcJ69biFjO7pTaZy7arMzSgrxfVADFD62H2LQmPp8aZtH1KQA001CzoigHn',
  
  // Production key (uncomment when ready)
  // publishableKey: 'pk_live_your_actual_stripe_publishable_key_here',
  
  // Stripe Connect settings
  connect: {
    clientId: MOCK_MODE 
      ? 'mock_stripe_connect_client_id' 
      : 'your_stripe_connect_client_id_here',
    
    // OAuth redirect URLs
    redirectUri: MOCK_MODE 
      ? 'queued://stripe-connect' 
      : 'https://yourapp.com/stripe-connect',
  },
  
  // Webhook endpoints
  webhooks: {
    paymentIntentSucceeded: MOCK_MODE 
      ? '/api/mock/webhooks/stripe/payment-intent-succeeded' 
      : '/api/webhooks/stripe/payment-intent-succeeded',
    
    paymentIntentFailed: MOCK_MODE 
      ? '/api/mock/webhooks/stripe/payment-intent-failed' 
      : '/api/webhooks/stripe/payment-intent-failed',
  }
};

// PayPal Configuration (via Stripe)
export const PAYPAL_CONFIG = {
  // PayPal is handled through Stripe, so we use Stripe's PayPal integration
  enabled: true,
  
  // PayPal settings for Stripe
  stripe: {
    // PayPal will be available as a payment method in Stripe
    supportedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
    supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD', 'EUR'],
    
    // PayPal-specific settings
    captureMethod: 'automatic', // or 'manual' for delayed capture
    confirmationMethod: 'automatic',
  },
  
  // PayPal Connect settings (for merchant accounts)
  connect: {
    redirectUri: MOCK_MODE 
      ? 'queued://paypal-connect' 
      : 'https://yourapp.com/paypal-connect',
  }
};

// Payment Processing Settings
export const PAYMENT_SETTINGS = {
  // Platform fee percentage (10%)
  platformFeePercent: 0.10,
  
  // Minimum payment amount
  minimumAmount: 1.00,
  
  // Maximum payment amount
  maximumAmount: 10000.00,
  
  // Supported currencies
  supportedCurrencies: ['usd', 'eur', 'gbp', 'cad'],
  
  // Default currency
  defaultCurrency: 'usd',
  
  // Payment timeout (in minutes)
  paymentTimeout: 30,
  
  // Retry settings
  retryAttempts: 3,
  retryDelay: 2000, // milliseconds
};

// Mock Data Settings (only used in MOCK_MODE)
export const MOCK_SETTINGS = {
  // Simulate processing delays
  simulateDelays: true,
  
  // Simulate occasional failures (for testing)
  simulateFailures: true,
  failureRate: 0.05, // 5% failure rate
  
  // Mock response delays (in milliseconds)
  delays: {
    paymentIntentCreation: 500,
    paymentConfirmation: 800,
    refundProcessing: 1000,
    webhookDelivery: 2000,
  },
  
  // Mock test data
  testCards: {
    success: '4242424242424242',
    declined: '4000000000000002',
    insufficientFunds: '4000000000009995',
    expired: '4000000000000069',
  }
};

// Environment Detection
export const isProduction = () => !MOCK_MODE;
export const isDevelopment = () => MOCK_MODE;

// Configuration validation
export const validateConfig = () => {
  const errors = [];
  
  if (!MOCK_MODE) {
    if (STRIPE_CONFIG.publishableKey.includes('your_actual') || STRIPE_CONFIG.publishableKey.includes('mock')) {
      errors.push('Stripe publishable key not configured for production');
    }
    
    if (PAYPAL_CONFIG.clientId.includes('your_') || PAYPAL_CONFIG.clientId.includes('mock')) {
      errors.push('PayPal client ID not configured for production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all configurations
export default {
  MOCK_MODE,
  STRIPE_CONFIG,
  PAYPAL_CONFIG,
  PAYMENT_SETTINGS,
  MOCK_SETTINGS,
  isProduction,
  isDevelopment,
  validateConfig,
};
