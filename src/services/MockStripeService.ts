import { PaymentData, PaymentResult } from '../types/JobTypes';

// Mock Stripe payment methods for testing
export const MOCK_PAYMENT_METHODS = {
  card: {
    id: 'pm_card_visa',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      exp_month: 12,
      exp_year: 2025,
    },
  },
  google_pay: {
    id: 'pm_google_pay',
    type: 'google_pay',
    google_pay: {
      last4: '1234',
    },
  },
  paypal: {
    id: 'pm_paypal',
    type: 'paypal',
    paypal: {
      email: 'test@example.com',
    },
  },
};

// Mock payment intents for testing
export const MOCK_PAYMENT_INTENTS = {
  success: {
    id: 'pi_success',
    status: 'succeeded',
    amount: 1000, // $10.00 in cents
    currency: 'usd',
    client_secret: 'pi_success_secret',
  },
  requires_action: {
    id: 'pi_requires_action',
    status: 'requires_action',
    amount: 1000,
    currency: 'usd',
    client_secret: 'pi_requires_action_secret',
    next_action: {
      type: 'use_stripe_sdk',
    },
  },
  failed: {
    id: 'pi_failed',
    status: 'requires_payment_method',
    amount: 1000,
    currency: 'usd',
    client_secret: 'pi_failed_secret',
    last_payment_error: {
      type: 'card_error',
      code: 'card_declined',
      message: 'Your card was declined.',
    },
  },
};

// Mock customer data
export const MOCK_CUSTOMER = {
  id: 'cus_test_customer',
  email: 'test@example.com',
  name: 'Test Customer',
  phone: '+1234567890',
};

// Mock Stripe service class
export class MockStripeService {
  private static instance: MockStripeService;
  private apiKey: string;

  constructor(apiKey: string = 'sk_test_mock_key') {
    this.apiKey = apiKey;
  }

  static getInstance(apiKey?: string): MockStripeService {
    if (!MockStripeService.instance) {
      MockStripeService.instance = new MockStripeService(apiKey);
    }
    return MockStripeService.instance;
  }

  // Mock create payment intent
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    console.log('MockStripeService - Creating payment intent:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock different scenarios based on amount or payment method
    if (data.amount === 999) {
      // Special case for testing failure
      return MOCK_PAYMENT_INTENTS.failed;
    } else if (data.amount === 1001) {
      // Special case for testing requires action
      return MOCK_PAYMENT_INTENTS.requires_action;
    } else {
      // Default success case
      return MOCK_PAYMENT_INTENTS.success;
    }
  }

  // Mock confirm payment intent
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    console.log('MockStripeService - Confirming payment intent:', {
      paymentIntentId,
      paymentMethodId,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock different scenarios
    if (paymentIntentId === 'pi_failed') {
      return {
        success: false,
        error: 'Your card was declined.',
        errorCode: 'card_declined',
      };
    } else if (paymentIntentId === 'pi_requires_action') {
      return {
        success: false,
        error: 'Additional authentication required.',
        errorCode: 'requires_action',
        requiresAction: true,
      };
    } else {
      return {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentIntentId,
        amount: 1000,
        currency: 'usd',
      };
    }
  }

  // Mock create customer
  async createCustomer(data: {
    email: string;
    name?: string;
    phone?: string;
  }): Promise<any> {
    console.log('MockStripeService - Creating customer:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      ...MOCK_CUSTOMER,
      email: data.email,
      name: data.name || MOCK_CUSTOMER.name,
      phone: data.phone || MOCK_CUSTOMER.phone,
    };
  }

  // Mock attach payment method to customer
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<any> {
    console.log('MockStripeService - Attaching payment method:', {
      paymentMethodId,
      customerId,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      id: paymentMethodId,
      customer: customerId,
      attached: true,
    };
  }

  // Mock create payment method
  async createPaymentMethod(data: {
    type: string;
    card?: any;
    billing_details?: any;
  }): Promise<any> {
    console.log('MockStripeService - Creating payment method:', data);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const methodType = data.type;
    return MOCK_PAYMENT_METHODS[methodType as keyof typeof MOCK_PAYMENT_METHODS] || {
      id: `pm_${methodType}_${Date.now()}`,
      type: methodType,
    };
  }

  // Mock retrieve payment intent
  async retrievePaymentIntent(paymentIntentId: string): Promise<any> {
    console.log('MockStripeService - Retrieving payment intent:', paymentIntentId);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return MOCK_PAYMENT_INTENTS.success;
  }

  // Mock refund payment
  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    console.log('MockStripeService - Refunding payment:', {
      paymentIntentId,
      amount,
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      id: `re_${Date.now()}`,
      amount: amount || 1000,
      currency: 'usd',
      status: 'succeeded',
      payment_intent: paymentIntentId,
    };
  }

  // Mock webhook verification (for backend)
  verifyWebhookSignature(payload: string, signature: string): boolean {
    console.log('MockStripeService - Verifying webhook signature');
    
    // Mock verification - always return true for testing
    return true;
  }

  // Mock parse webhook event
  parseWebhookEvent(payload: string): any {
    console.log('MockStripeService - Parsing webhook event');
    
    // Mock webhook event
    return {
      id: `evt_${Date.now()}`,
      type: 'payment_intent.succeeded',
      data: {
        object: MOCK_PAYMENT_INTENTS.success,
      },
    };
  }
}

// Export singleton instance
export const mockStripeService = MockStripeService.getInstance();

// Mock Stripe configuration
export const MOCK_STRIPE_CONFIG = {
  publishableKey: 'pk_test_mock_publishable_key',
  secretKey: 'sk_test_mock_secret_key',
  webhookSecret: 'whsec_mock_webhook_secret',
  apiVersion: '2023-10-16',
};

// Mock payment method validation
export const validatePaymentMethod = (methodId: string): boolean => {
  const validMethods = Object.keys(MOCK_PAYMENT_METHODS);
  return validMethods.some(method => methodId.includes(method));
};

// Mock error scenarios for testing
export const MOCK_ERROR_SCENARIOS = {
  CARD_DECLINED: {
    type: 'card_error',
    code: 'card_declined',
    message: 'Your card was declined.',
  },
  INSUFFICIENT_FUNDS: {
    type: 'card_error',
    code: 'card_declined',
    message: 'Your card has insufficient funds.',
  },
  EXPIRED_CARD: {
    type: 'card_error',
    code: 'expired_card',
    message: 'Your card has expired.',
  },
  PROCESSING_ERROR: {
    type: 'api_error',
    message: 'An error occurred while processing your card. Try again in a few seconds.',
  },
  NETWORK_ERROR: {
    type: 'api_connection_error',
    message: 'Somehting went wrong on our end. Please try again.',
  },
};

// Helper function to simulate random errors for testing
export const simulateRandomError = (): any => {
  const errors = Object.values(MOCK_ERROR_SCENARIOS);
  const randomError = errors[Math.floor(Math.random() * errors.length)];
  return randomError;
};

// Mock test data for different scenarios
export const MOCK_TEST_DATA = {
  // Test successful payment
  SUCCESS: {
    amount: 1000,
    paymentMethodId: 'pm_card_visa',
    customerId: 'cus_test_customer',
  },
  // Test declined card
  CARD_DECLINED: {
    amount: 999,
    paymentMethodId: 'pm_card_visa',
    customerId: 'cus_test_customer',
  },
  // Test requires action (3D Secure)
  REQUIRES_ACTION: {
    amount: 1001,
    paymentMethodId: 'pm_card_visa',
    customerId: 'cus_test_customer',
  },
  // Test processing error
  PROCESSING_ERROR: {
    amount: 1002,
    paymentMethodId: 'pm_card_visa',
    customerId: 'cus_test_customer',
  },
};
