import { PaymentData, PaymentResult } from '../types/JobTypes';
import { mockStripeService, MOCK_TEST_DATA } from './MockStripeService';
import { mockServiceManager } from './MockServiceManager';
import { MOCK_MODE } from '../config/payment';
import { supabase } from '../config/supabase';
import CommissionService from './CommissionService';
import { paypalService } from './PayPalService';

export interface PaymentServiceConfig {
  useMockService?: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
}

export interface PaymentRecord {
  id: string;
  customer_id: string;
  job_id?: string;
  mechanic_id?: string;
  bid_id?: string;
  change_order_id?: string;
  amount: number;
  currency: string;
  type: 'posting_deposit' | 'escrow_deposit' | 'final_payment' | 'paypal_payment' | 'change_order_payment';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_method_id?: string;
  stripe_payment_intent_id?: string;
  description?: string;
  metadata?: Record<string, any>;
  platform_fee?: number;
  mechanic_amount?: number;
  refund_reason?: string;
  created_at: string;
  processed_at?: string;
  refunded_at?: string;
}

export interface PayoutRecord {
  id: string;
  job_id: string;
  mechanic_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
  processed_at?: string;
}

export class PaymentServiceNew {
  private static instance: PaymentServiceNew;
  private config: PaymentServiceConfig;
  private useMock: boolean;

  constructor(config: PaymentServiceConfig = {}) {
    this.config = {
      useMockService: MOCK_MODE, // Use global mock mode setting
      ...config,
    };
    this.useMock = this.config.useMockService || MOCK_MODE;
  }

  static getInstance(config?: PaymentServiceConfig): PaymentServiceNew {
    if (!PaymentServiceNew.instance) {
      PaymentServiceNew.instance = new PaymentServiceNew(config);
    }
    return PaymentServiceNew.instance;
  }

  // ==================== CORE PAYMENT PROCESSING ====================

  // Process payment using mock or real Stripe
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentServiceNew - Processing payment:', {
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
      console.error('PaymentServiceNew - Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Mock payment processing
  private async processMockPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentServiceNew - Using mock payment processing');

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
    console.log('PaymentServiceNew - Using real Stripe payment processing');
    
    // TODO: Implement real Stripe integration
    // This would use the actual Stripe SDK
    throw new Error('Real Stripe integration not implemented yet');
  }

  // ==================== JOB PAYMENT METHODS ====================

  // Create a payment intent for posting deposit
  async createPostingDepositPayment(
    customerId: string, 
    jobId: string, 
    amount: number = 10, 
    paymentMethod: string = 'card'
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData: PaymentRecord = {
          id: `payment_${Date.now()}`,
          customer_id: customerId,
          job_id: jobId,
          amount: amount,
          currency: 'USD',
          type: 'posting_deposit',
          status: 'pending',
          payment_method: paymentMethod,
          description: 'Job posting deposit - refundable if no mechanic accepts',
          created_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            customer_id: customerId,
            job_id: jobId,
            amount: amount,
            currency: 'USD',
            type: 'posting_deposit',
            status: 'pending',
            payment_method: paymentMethod,
            description: 'Job posting deposit - refundable if no mechanic accepts',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating posting deposit payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a payment intent for escrow deposit
  async createEscrowPayment(
    customerId: string, 
    jobId: string, 
    mechanicId: string, 
    amount: number, 
    bidId: string
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData: PaymentRecord = {
          id: `escrow_${Date.now()}`,
          customer_id: customerId,
          job_id: jobId,
          mechanic_id: mechanicId,
          bid_id: bidId,
          amount: amount,
          currency: 'USD',
          type: 'escrow_deposit',
          status: 'pending',
          description: 'Escrow deposit - held until job completion',
          created_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            customer_id: customerId,
            job_id: jobId,
            mechanic_id: mechanicId,
            bid_id: bidId,
            amount: amount,
            currency: 'USD',
            type: 'escrow_deposit',
            status: 'pending',
            description: 'Escrow deposit - held until job completion',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating escrow payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a payment intent for final balance
  async createFinalPayment(
    customerId: string, 
    jobId: string, 
    amount: number
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData: PaymentRecord = {
          id: `final_${Date.now()}`,
          customer_id: customerId,
          job_id: jobId,
          amount: amount,
          currency: 'USD',
          type: 'final_payment',
          status: 'pending',
          description: 'Final payment for completed job',
          created_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            customer_id: customerId,
            job_id: jobId,
            amount: amount,
            currency: 'USD',
            type: 'final_payment',
            status: 'pending',
            description: 'Final payment for completed job',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating final payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Process payment with Stripe
  async processPaymentWithStripe(
    paymentId: string, 
    paymentMethodId: string, 
    paymentMethod: string = 'card'
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockData: PaymentRecord = {
          id: paymentId,
          customer_id: 'mock_customer',
          amount: 100,
          currency: 'USD',
          type: 'escrow_deposit',
          status: 'completed',
          payment_method: paymentMethod,
          payment_method_id: paymentMethodId,
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      // In production, this would integrate with Stripe
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_method_id: paymentMethodId,
          payment_method: paymentMethod,
          processed_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== PAYPAL INTEGRATION ====================

  // Process PayPal payment
  async processPayPalPayment(
    customerId: string, 
    jobId: string, 
    amount: number, 
    description: string = '', 
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; payment?: PaymentRecord; paymentIntent?: any; error?: string }> {
    try {
      if (this.useMock) {
        // Mock PayPal implementation
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockPayment: PaymentRecord = {
          id: `paypal_${Date.now()}`,
          customer_id: customerId,
          job_id: jobId,
          amount: amount,
          currency: 'USD',
          type: 'paypal_payment',
          status: 'completed',
          payment_method: 'paypal',
          stripe_payment_intent_id: `pi_paypal_${Date.now()}`,
          description: description,
          metadata: metadata,
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };
        return { success: true, payment: mockPayment, paymentIntent: { id: mockPayment.stripe_payment_intent_id } };
      }

      // Initialize PayPal service
      const initResult = await paypalService.initialize();
      if (!initResult.success) {
        throw new Error('PayPal service initialization failed');
      }

      // Check if PayPal is available
      const isAvailable = paypalService.isPayPalAvailable('US', 'USD');
      if (!isAvailable) {
        throw new Error('PayPal is not available in your region');
      }

      // Create PayPal payment intent
      const paymentResult = await paypalService.createPayPalPaymentIntent(
        amount,
        'USD',
        {
          customer_id: customerId,
          job_id: jobId,
          description: description,
          ...metadata
        }
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create PayPal payment');
      }

      // Store payment record in database
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            customer_id: customerId,
            job_id: jobId,
            amount: amount,
            currency: 'USD',
            type: 'paypal_payment',
            status: 'pending',
            payment_method: 'paypal',
            stripe_payment_intent_id: paymentResult.paymentIntent.id,
            description: description,
            metadata: metadata,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        payment: data,
        paymentIntent: paymentResult.paymentIntent
      };

    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Confirm PayPal payment
  async confirmPayPalPayment(
    paymentId: string, 
    paymentIntentId: string
  ): Promise<{ success: boolean; payment?: PaymentRecord; paymentIntent?: any; error?: string }> {
    try {
      if (this.useMock) {
        // Mock confirmation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPayment: PaymentRecord = {
          id: paymentId,
          customer_id: 'mock_customer',
          amount: 100,
          currency: 'USD',
          type: 'paypal_payment',
          status: 'completed',
          payment_method: 'paypal',
          stripe_payment_intent_id: paymentIntentId,
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };
        return { success: true, payment: mockPayment, paymentIntent: { id: paymentIntentId } };
      }

      // Confirm payment with PayPal service
      const confirmResult = await paypalService.confirmPayPalPayment(paymentIntentId);
      
      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'PayPal payment confirmation failed');
      }

      // Update payment record
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_method: 'paypal',
          processed_at: new Date().toISOString(),
          metadata: {
            paypal_payment_intent: confirmResult.paymentIntent,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        payment: data,
        paymentIntent: confirmResult.paymentIntent
      };

    } catch (error) {
      console.error('Error confirming PayPal payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== REFUNDS ====================

  // Refund a payment
  async refundPayment(
    paymentId: string, 
    reason: string = 'Customer request'
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock refund implementation
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockData: PaymentRecord = {
          id: paymentId,
          customer_id: 'mock_customer',
          amount: 100,
          currency: 'USD',
          type: 'escrow_deposit',
          status: 'refunded',
          payment_method: 'card',
          refund_reason: reason,
          created_at: new Date().toISOString(),
          refunded_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      // In production, this would integrate with Stripe
      // For now, simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update payment status
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== PAYMENT METHODS MANAGEMENT ====================

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

  // ==================== COMMISSION & PAYOUTS ====================

  // Calculate platform commission with dynamic rates
  calculateCommission(jobAmount: number, serviceCategory: string | null = null): number {
    return CommissionService.calculateCommission(jobAmount, serviceCategory);
  }

  // Calculate mechanic payout with dynamic rates
  calculateMechanicPayout(jobAmount: number, serviceCategory: string | null = null): number {
    return CommissionService.calculateMechanicPayout(jobAmount, serviceCategory);
  }

  // Get commission rate for a service category
  getCommissionRate(serviceCategory: string | null): number {
    return CommissionService.getCommissionRate(serviceCategory);
  }

  // Get commission details for display
  getCommissionDetails(serviceCategory: string | null): any {
    return CommissionService.getCommissionDetails(serviceCategory);
  }

  // Process mechanic payout
  async processMechanicPayout(
    jobId: string, 
    mechanicId: string, 
    amount: number
  ): Promise<{ success: boolean; data?: PayoutRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock payout implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockPayout: PayoutRecord = {
          id: `payout_${Date.now()}`,
          job_id: jobId,
          mechanic_id: mechanicId,
          amount: amount,
          currency: 'USD',
          status: 'pending',
          description: 'Payment for completed job',
          created_at: new Date().toISOString(),
        };
        return { success: true, data: mockPayout };
      }

      const { data, error } = await supabase
        .from('payouts')
        .insert([
          {
            job_id: jobId,
            mechanic_id: mechanicId,
            amount: amount,
            currency: 'USD',
            status: 'pending',
            description: 'Payment for completed job',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error processing mechanic payout:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get mock payouts for a mechanic
  getMockPayouts(mechanicId: string): any[] {
    return [
      {
        id: 'payout_1',
        mechanicId: mechanicId,
        amount: 150.00,
        status: 'completed',
        date: '2024-01-15',
        description: 'Oil change service - Job #12345'
      },
      {
        id: 'payout_2',
        mechanicId: mechanicId,
        amount: 75.50,
        status: 'pending',
        date: '2024-01-20',
        description: 'Brake inspection - Job #12346'
      },
      {
        id: 'payout_3',
        mechanicId: mechanicId,
        amount: 200.00,
        status: 'completed',
        date: '2024-01-10',
        description: 'Engine diagnostic - Job #12344'
      }
    ];
  }

  // Get payout history for a mechanic
  async getMechanicPayouts(mechanicId: string): Promise<{ success: boolean; data?: PayoutRecord[]; error?: string }> {
    try {
      if (this.useMock) {
        // Return mock payouts
        return { success: true, data: this.getMockPayouts(mechanicId) };
      }

      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          job:jobs(
            id,
            title,
            category,
            subcategory
          )
        `)
        .eq('mechanic_id', mechanicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching mechanic payouts:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== PAYMENT HISTORY ====================

  // Get payment history for a customer
  async getCustomerPayments(customerId: string): Promise<{ success: boolean; data?: PaymentRecord[]; error?: string }> {
    try {
      if (this.useMock) {
        // Return mock payments
        return { success: true, data: this.getMockPayments(customerId) };
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          job:jobs(
            id,
            title,
            category,
            subcategory,
            status
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get payment history for a mechanic
  async getMechanicPayments(mechanicId: string): Promise<{ success: boolean; data?: PaymentRecord[]; error?: string }> {
    try {
      if (this.useMock) {
        // Return mock payments
        return { success: true, data: this.getMockPayments('mock_customer') };
      }

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          job:jobs(
            id,
            title,
            category,
            subcategory,
            status
          )
        `)
        .eq('mechanic_id', mechanicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching mechanic payments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Mock data for development
  getMockPayments(customerId: string): PaymentRecord[] {
    return [
      {
        id: 'payment1',
        customer_id: customerId,
        job_id: 'job1',
        amount: 10,
        currency: 'USD',
        type: 'posting_deposit',
        status: 'completed',
        payment_method: 'card',
        description: 'Job posting deposit',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'payment2',
        customer_id: customerId,
        job_id: 'job2',
        amount: 30,
        currency: 'USD',
        type: 'escrow_deposit',
        status: 'completed',
        payment_method: 'card',
        description: 'Escrow deposit',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        processed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }

  // ==================== CHANGE ORDER PAYMENTS ====================

  // Create a payment intent for change order
  async createChangeOrderPayment(
    customerId: string, 
    changeOrderId: string, 
    amount: number, 
    paymentMethod: string = 'card'
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Calculate commission for change order (typically lower rate for additional work)
        const serviceCategory = 'additional_work';
        const platformFee = CommissionService.calculateCommission(amount, serviceCategory);
        const mechanicAmount = CommissionService.calculateMechanicPayout(amount, serviceCategory);

        const mockData: PaymentRecord = {
          id: `change_payment_${Date.now()}`,
          customer_id: customerId,
          change_order_id: changeOrderId,
          amount: amount,
          currency: 'USD',
          type: 'change_order_payment',
          status: 'completed',
          description: 'Payment for additional work via change order',
          payment_method: paymentMethod,
          stripe_payment_intent_id: `txn_change_${Date.now()}`,
          platform_fee: platformFee,
          mechanic_amount: mechanicAmount,
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      // For mock environment, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful payment processing
      const paymentResult = {
        success: true,
        paymentId: `change_payment_${Date.now()}`,
        transactionId: `txn_change_${Date.now()}`,
        paymentMethod: paymentMethod
      };

      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error };
      }

      // Calculate commission for change order (typically lower rate for additional work)
      const serviceCategory = 'additional_work';
      const platformFee = CommissionService.calculateCommission(amount, serviceCategory);
      const mechanicAmount = CommissionService.calculateMechanicPayout(amount, serviceCategory);

      const paymentData: PaymentRecord = {
        id: paymentResult.paymentId,
        customer_id: customerId,
        change_order_id: changeOrderId,
        amount: amount,
        currency: 'USD',
        type: 'change_order_payment',
        status: 'completed',
        description: 'Payment for additional work via change order',
        payment_method: paymentMethod,
        stripe_payment_intent_id: paymentResult.transactionId,
        platform_fee: platformFee,
        mechanic_amount: mechanicAmount,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      };

      return { success: true, data: paymentData };
    } catch (error) {
      console.error('Error creating change order payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Process change order payment with Stripe
  async processChangeOrderPaymentWithStripe(
    customerId: string, 
    changeOrderId: string, 
    amount: number, 
    paymentMethodId: string
  ): Promise<{ success: boolean; data?: PaymentRecord; error?: string }> {
    try {
      if (this.useMock) {
        // Mock Stripe processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Calculate commission
        const serviceCategory = 'additional_work';
        const platformFee = CommissionService.calculateCommission(amount, serviceCategory);
        const mechanicAmount = CommissionService.calculateMechanicPayout(amount, serviceCategory);

        const mockData: PaymentRecord = {
          id: `change_payment_${Date.now()}`,
          customer_id: customerId,
          change_order_id: changeOrderId,
          amount: amount,
          currency: 'USD',
          type: 'change_order_payment',
          status: 'completed',
          description: 'Payment for additional work via change order',
          payment_method_id: paymentMethodId,
          stripe_payment_intent_id: `pi_change_${Date.now()}`,
          platform_fee: platformFee,
          mechanic_amount: mechanicAmount,
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        };
        return { success: true, data: mockData };
      }

      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful Stripe payment
      const stripeResult = {
        success: true,
        paymentIntentId: `pi_change_${Date.now()}`,
        status: 'succeeded',
        amount: amount * 100, // Stripe uses cents
        currency: 'usd'
      };

      if (!stripeResult.success) {
        return { success: false, error: 'Payment processing failed' };
      }

      // Calculate commission
      const serviceCategory = 'additional_work';
      const platformFee = CommissionService.calculateCommission(amount, serviceCategory);
      const mechanicAmount = CommissionService.calculateMechanicPayout(amount, serviceCategory);

      const paymentData: PaymentRecord = {
        id: `change_payment_${Date.now()}`,
        customer_id: customerId,
        change_order_id: changeOrderId,
        amount: amount,
        currency: 'USD',
        type: 'change_order_payment',
        status: 'completed',
        description: 'Payment for additional work via change order',
        payment_method_id: paymentMethodId,
        stripe_payment_intent_id: stripeResult.paymentIntentId,
        platform_fee: platformFee,
        mechanic_amount: mechanicAmount,
        created_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      };

      return { success: true, data: paymentData };
    } catch (error) {
      console.error('Error processing change order payment with Stripe:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get change order payment history
  async getChangeOrderPayments(
    customerId: string | null = null, 
    changeOrderId: string | null = null
  ): Promise<{ success: boolean; data?: PaymentRecord[]; error?: string }> {
    try {
      if (this.useMock) {
        // Mock data
        const mockPayments: PaymentRecord[] = [
          {
            id: 'change_payment_1',
            customer_id: 'customer1',
            change_order_id: 'change-order-1',
            amount: 75.00,
            currency: 'USD',
            type: 'change_order_payment',
            status: 'completed',
            payment_method: 'card',
            description: 'Payment for additional brake work',
            created_at: new Date().toISOString(),
            processed_at: new Date().toISOString(),
          }
        ];

        let filteredPayments = mockPayments;

        if (customerId) {
          filteredPayments = filteredPayments.filter(p => p.customer_id === customerId);
        }

        if (changeOrderId) {
          filteredPayments = filteredPayments.filter(p => p.change_order_id === changeOrderId);
        }

        return { success: true, data: filteredPayments };
      }

      // TODO: Implement real database query
      return { success: true, data: [] };
    } catch (error) {
      console.error('Error fetching change order payments:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Refund change order payment
  async refundChangeOrderPayment(
    paymentId: string, 
    reason: string = 'Customer request'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (this.useMock) {
        // Mock refund processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const refundResult = {
          success: true,
          refundId: `re_${Date.now()}`,
          amount: 75.00, // Mock amount
          status: 'succeeded'
        };

        if (!refundResult.success) {
          return { success: false, error: 'Refund processing failed' };
        }

        return { 
          success: true, 
          data: {
            refundId: refundResult.refundId,
            amount: refundResult.amount,
            status: refundResult.status,
            reason: reason,
            refunded_at: new Date().toISOString()
          }
        };
      }

      // TODO: Implement real refund processing
      return { success: false, error: 'Real refund processing not implemented yet' };
    } catch (error) {
      console.error('Error refunding change order payment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get payment analytics for change orders
  async getChangeOrderPaymentAnalytics(
    mechanicId: string | null = null, 
    customerId: string | null = null, 
    dateRange: any = null
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (this.useMock) {
        // Mock analytics data
        const analytics = {
          totalChangeOrderPayments: 15,
          totalChangeOrderAmount: 1250.00,
          averageChangeOrderAmount: 83.33,
          changeOrderSuccessRate: 94.2,
          topChangeOrderCategories: [
            { category: 'parts', count: 8, amount: 450.00 },
            { category: 'labor', count: 12, amount: 600.00 },
            { category: 'materials', count: 3, amount: 200.00 }
          ],
          monthlyTrends: [
            { month: 'Jan', count: 3, amount: 250.00 },
            { month: 'Feb', count: 5, amount: 400.00 },
            { month: 'Mar', count: 7, amount: 600.00 }
          ]
        };

        return { success: true, data: analytics };
      }

      // TODO: Implement real analytics
      return { success: true, data: {} };
    } catch (error) {
      console.error('Error fetching change order payment analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ==================== STRIPE CONNECT ====================

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

  // ==================== TESTING & UTILITIES ====================

  // Test different payment scenarios
  async testPaymentScenario(scenario: keyof typeof MOCK_TEST_DATA): Promise<PaymentResult> {
    console.log(`PaymentServiceNew - Testing payment scenario: ${scenario}`);
    
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

  // Switch between mock and real service
  setUseMock(useMock: boolean): void {
    this.useMock = useMock;
    console.log(`PaymentServiceNew - Switched to ${useMock ? 'mock' : 'real'} service`);
  }

  // Get current configuration
  getConfig(): PaymentServiceConfig {
    return { ...this.config, useMockService: this.useMock };
  }
}

// Export singleton instance
export const paymentServiceNew = PaymentServiceNew.getInstance();

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
      const result = await paymentServiceNew.testPaymentScenario(scenario);
      console.log(`Scenario ${scenario}:`, result);
    } catch (error) {
      console.error(`Scenario ${scenario} failed:`, error);
    }
  }
};

// Export for easy testing
export default paymentServiceNew;
