// PayPal Payment Service (via Stripe)
// This service handles PayPal payments through Stripe's PayPal integration

import { MOCK_MODE, PAYPAL_CONFIG } from '../config/payment';

class PayPalService {
  constructor() {
    this.isInitialized = false;
    this.paypalEnabled = PAYPAL_CONFIG.enabled;
  }

  /**
   * Initialize PayPal service
   */
  async initialize() {
    if (MOCK_MODE) {
      console.log('🔧 PayPal Service: Running in MOCK MODE');
      this.isInitialized = true;
      return { success: true };
    }

    try {
      // In production, PayPal is handled through Stripe
      // No additional initialization needed as Stripe handles PayPal integration
      this.isInitialized = true;
      console.log('✅ PayPal Service: Initialized via Stripe');
      return { success: true };
    } catch (error) {
      console.error('❌ PayPal Service: Initialization failed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if PayPal is available for the given country and currency
   */
  isPayPalAvailable(country = 'US', currency = 'USD') {
    if (!this.paypalEnabled) {
      return false;
    }

    const supportedCountries = PAYPAL_CONFIG.stripe.supportedCountries;
    const supportedCurrencies = PAYPAL_CONFIG.stripe.supportedCurrencies;

    return supportedCountries.includes(country) && supportedCurrencies.includes(currency);
  }

  /**
   * Create a PayPal payment intent through Stripe
   */
  async createPayPalPaymentIntent(amount, currency = 'USD', metadata = {}) {
    if (!this.isInitialized) {
      throw new Error('PayPal service not initialized');
    }

    if (MOCK_MODE) {
      // Mock PayPal payment intent creation
      const mockPaymentIntent = {
        id: `pi_paypal_mock_${Date.now()}`,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        payment_method_types: ['paypal'],
        metadata: {
          ...metadata,
          payment_method: 'paypal',
          created_via: 'mock_mode'
        },
        client_secret: `pi_paypal_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('🔧 Mock PayPal Payment Intent Created:', mockPaymentIntent.id);
      return { success: true, paymentIntent: mockPaymentIntent };
    }

    try {
      // In production, this would call your backend API
      // which would create a Stripe Payment Intent with PayPal enabled
      const response = await fetch('/api/payments/create-paypal-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          payment_method_types: ['paypal'],
          metadata: {
            ...metadata,
            payment_method: 'paypal'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ PayPal Payment Intent Created:', data.paymentIntent.id);
      return { success: true, paymentIntent: data.paymentIntent };

    } catch (error) {
      console.error('❌ PayPal Payment Intent Creation Failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Confirm PayPal payment through Stripe
   */
  async confirmPayPalPayment(paymentIntentId, returnUrl = null) {
    if (!this.isInitialized) {
      throw new Error('PayPal service not initialized');
    }

    if (MOCK_MODE) {
      // Mock PayPal payment confirmation
      const mockResult = {
        id: paymentIntentId,
        status: 'succeeded',
        payment_method: {
          id: `pm_paypal_mock_${Date.now()}`,
          type: 'paypal',
          paypal: {
            payer_email: 'customer@example.com',
            payer_id: 'PAYPAL_PAYER_ID_MOCK'
          }
        },
        charges: {
          data: [{
            id: `ch_paypal_mock_${Date.now()}`,
            amount: 1000, // $10.00 in cents
            currency: 'usd',
            status: 'succeeded'
          }]
        }
      };

      console.log('🔧 Mock PayPal Payment Confirmed:', paymentIntentId);
      return { success: true, paymentIntent: mockResult };
    }

    try {
      // In production, this would call your backend API
      // which would confirm the Stripe Payment Intent
      const response = await fetch('/api/payments/confirm-paypal-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          return_url: returnUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ PayPal Payment Confirmed:', paymentIntentId);
      return { success: true, paymentIntent: data.paymentIntent };

    } catch (error) {
      console.error('❌ PayPal Payment Confirmation Failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get PayPal payment status
   */
  async getPaymentStatus(paymentIntentId) {
    if (!this.isInitialized) {
      throw new Error('PayPal service not initialized');
    }

    if (MOCK_MODE) {
      // Mock payment status check
      const mockStatus = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        payment_method: 'paypal'
      };

      return { success: true, paymentIntent: mockStatus };
    }

    try {
      const response = await fetch(`/api/payments/status/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, paymentIntent: data.paymentIntent };

    } catch (error) {
      console.error('❌ PayPal Payment Status Check Failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel PayPal payment
   */
  async cancelPayPalPayment(paymentIntentId) {
    if (!this.isInitialized) {
      throw new Error('PayPal service not initialized');
    }

    if (MOCK_MODE) {
      console.log('🔧 Mock PayPal Payment Cancelled:', paymentIntentId);
      return { success: true };
    }

    try {
      const response = await fetch('/api/payments/cancel-paypal-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ PayPal Payment Cancelled:', paymentIntentId);
      return { success: true };

    } catch (error) {
      console.error('❌ PayPal Payment Cancellation Failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get supported countries and currencies
   */
  getSupportedOptions() {
    return {
      countries: PAYPAL_CONFIG.stripe.supportedCountries,
      currencies: PAYPAL_CONFIG.stripe.supportedCurrencies
    };
  }
}

// Export singleton instance
export const paypalService = new PayPalService();
export default paypalService;
