import { PaymentData, PaymentResult } from '../types/JobTypes';
import { mockStripeService, MOCK_TEST_DATA } from './MockStripeService';
import { mockServiceManager } from './MockServiceManager';
import { MOCK_MODE } from '../config/payment';

export interface PaymentServiceConfig {
  useMockService?: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private config: PaymentServiceConfig;
  private useMock: boolean;

  constructor(config: PaymentServiceConfig = {}) {
    this.config = {
      useMockService: MOCK_MODE, // Use global mock mode setting
      ...config,
    };
    this.useMock = this.config.useMockService || MOCK_MODE;
  }

  static getInstance(config?: PaymentServiceConfig): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService(config);
    }
    return PaymentService.instance;
  }

  // Process payment using mock or real Stripe
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentService - Processing payment:', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethodId: paymentData.paymentMethodId,
      useMock: this.useMock,
    });

    try {
      if (this.useMock) {
        return await this.processMockPayment(paymentData);
      } else {
        return await this.processRealPayment(paymentData);
      }
    } catch (error) {
      console.error('PaymentService - Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Mock payment processing
  private async processMockPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentService - Using mock payment processing');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create customer if needed
    let customerId = paymentData.customerId;
    if (!customerId) {
      const customer = await mockStripeService.createCustomer({
        email: paymentData.metadata?.customerEmail || 'test@example.com',
        name: paymentData.metadata?.customerName || 'Test Customer',
        phone: paymentData.metadata?.customerPhone || '+1234567890',
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await mockStripeService.createPaymentIntent({
      amount: Math.round(paymentData.amount * 100), // Convert to cents
      currency: paymentData.currency.toLowerCase(),
      customerId,
      paymentMethodId: paymentData.paymentMethodId,
      metadata: paymentData.metadata,
    });

    // Confirm payment intent
    const result = await mockStripeService.confirmPaymentIntent(
      paymentIntent.id,
      paymentData.paymentMethodId
    );

    return {
      ...result,
      customerId,
      paymentIntentId: paymentIntent.id,
    };
  }

  // Real Stripe payment processing (placeholder for future implementation)
  private async processRealPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentService - Using real Stripe payment processing');
    
    // TODO: Implement real Stripe integration
    // This would use the actual Stripe SDK
    throw new Error('Real Stripe integration not implemented yet');
  }

  // Create payment method
  async createPaymentMethod(methodData: {
    type: string;
    card?: any;
    billing_details?: any;
  }): Promise<any> {
    if (this.useMock) {
      return await mockStripeService.createPaymentMethod(methodData);
    } else {
      // TODO: Implement real Stripe payment method creation
      throw new Error('Real Stripe payment method creation not implemented yet');
    }
  }

  // Refund payment
  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    if (this.useMock) {
      return await mockStripeService.refundPayment(paymentIntentId, amount);
    } else {
      // TODO: Implement real Stripe refund
      throw new Error('Real Stripe refund not implemented yet');
    }
  }

  // Test different payment scenarios
  async testPaymentScenario(scenario: keyof typeof MOCK_TEST_DATA): Promise<PaymentResult> {
    console.log(`PaymentService - Testing payment scenario: ${scenario}`);
    
    const testData = MOCK_TEST_DATA[scenario];
    const paymentData: PaymentData = {
      amount: testData.amount / 100, // Convert from cents to dollars
      currency: 'USD',
      paymentMethodId: testData.paymentMethodId,
      customerId: testData.customerId,
      metadata: {
        testScenario: scenario,
        timestamp: Date.now().toString(),
      },
    };

    return await this.processPayment(paymentData);
  }

  // Switch between mock and real service
  setUseMock(useMock: boolean): void {
    this.useMock = useMock;
    console.log(`PaymentService - Switched to ${useMock ? 'mock' : 'real'} service`);
  }

  // Get current configuration
  getConfig(): PaymentServiceConfig {
    return { ...this.config, useMockService: this.useMock };
  }

  // Create payment intent (for Stripe integration)
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customer?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    if (this.useMock) {
      return await mockStripeService.createPaymentIntent({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customerId: data.customer,
        metadata: data.metadata,
      });
    } else {
      // TODO: Implement real Stripe payment intent creation
      throw new Error('Real Stripe payment intent creation not implemented yet');
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string): Promise<any[]> {
    if (this.useMock) {
      // Return mock payment methods
      return [
        {
          id: 'pm_card_visa',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
          isDefault: true,
        },
        {
          id: 'pm_card_mastercard',
          type: 'card',
          card: {
            brand: 'mastercard',
            last4: '5555',
            exp_month: 8,
            exp_year: 2026,
          },
          isDefault: false,
        },
      ];
    } else {
      // TODO: Implement real Stripe payment methods retrieval
      throw new Error('Real Stripe payment methods retrieval not implemented yet');
    }
  }

  // Save payment method
  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    if (this.useMock) {
      await mockStripeService.attachPaymentMethod(paymentMethodId, customerId);
      return { success: true, paymentMethodId };
    } else {
      // TODO: Implement real Stripe payment method saving
      throw new Error('Real Stripe payment method saving not implemented yet');
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    if (this.useMock) {
      // Mock implementation
      return { success: true, defaultPaymentMethod: paymentMethodId };
    } else {
      // TODO: Implement real Stripe default payment method setting
      throw new Error('Real Stripe default payment method setting not implemented yet');
    }
  }

  // Delete payment method
  async deletePaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    if (this.useMock) {
      // Mock implementation
      return { success: true, deletedPaymentMethod: paymentMethodId };
    } else {
      // TODO: Implement real Stripe payment method deletion
      throw new Error('Real Stripe payment method deletion not implemented yet');
    }
  }

  // Process escrow payment
  async processEscrowPayment(data: {
    jobId: string;
    bidId: string;
    paymentIntentId: string;
    amount: number;
    customerId: string;
    mechanicId: string;
  }): Promise<any> {
    if (this.useMock) {
      // Mock escrow processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        escrowId: `escrow_${Date.now()}`,
        amount: data.amount,
        status: 'held',
      };
    } else {
      // TODO: Implement real escrow processing
      throw new Error('Real escrow processing not implemented yet');
    }
  }

  // Get Stripe Connect account
  async getStripeConnectAccount(userId: string): Promise<any> {
    if (this.useMock) {
      // Mock Stripe Connect account
      return {
        id: 'acct_mock_connect',
        charges_enabled: true,
        payouts_enabled: true,
        country: 'US',
        currency: 'usd',
        email: 'mechanic@example.com',
      };
    } else {
      // TODO: Implement real Stripe Connect account retrieval
      throw new Error('Real Stripe Connect account retrieval not implemented yet');
    }
  }

  // Create Stripe Connect account
  async createStripeConnectAccount(data: {
    userId: string;
    email: string;
    returnUrl: string;
  }): Promise<string> {
    if (this.useMock) {
      // Mock Stripe Connect OAuth URL
      return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=mock_client_id&scope=read_write&redirect_uri=${encodeURIComponent(data.returnUrl)}`;
    } else {
      // TODO: Implement real Stripe Connect account creation
      throw new Error('Real Stripe Connect account creation not implemented yet');
    }
  }

  // Disconnect Stripe account
  async disconnectStripeAccount(userId: string): Promise<any> {
    if (this.useMock) {
      // Mock disconnection
      return { success: true, disconnected: true };
    } else {
      // TODO: Implement real Stripe account disconnection
      throw new Error('Real Stripe account disconnection not implemented yet');
    }
  }

  // Get Stripe Dashboard URL
  async getStripeDashboardUrl(userId: string): Promise<string> {
    if (this.useMock) {
      // Mock dashboard URL
      return 'https://dashboard.stripe.com/test/dashboard';
    } else {
      // TODO: Implement real Stripe Dashboard URL generation
      throw new Error('Real Stripe Dashboard URL generation not implemented yet');
    }
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance();

// Helper functions for testing
export const testPaymentScenarios = async () => {
  console.log('Testing all payment scenarios...');
  
  const scenarios: (keyof typeof MOCK_TEST_DATA)[] = [
    'SUCCESS',
    'CARD_DECLINED', 
    'REQUIRES_ACTION',
    'PROCESSING_ERROR'
  ];

  for (const scenario of scenarios) {
    try {
      const result = await paymentService.testPaymentScenario(scenario);
      console.log(`Scenario ${scenario}:`, result);
    } catch (error) {
      console.error(`Scenario ${scenario} failed:`, error);
    }
  }
};

// Export for easy testing
export default paymentService;