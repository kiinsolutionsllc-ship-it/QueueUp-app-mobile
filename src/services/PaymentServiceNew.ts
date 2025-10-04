import { PaymentData, PaymentResult } from '../types/JobTypes';
import { supabase } from '../config/supabase';
import CommissionService from './CommissionService';
import { paypalService } from './PayPalService';
import BackendStripeService from './BackendStripeService';

// Test data for development/testing (remove for production)
const TEST_DATA = {
  SUCCESS: {
    amount: 5000, // $50.00 in cents
    paymentMethodId: 'pm_test_success',
    customerId: 'cus_test_success',
  },
  CARD_DECLINED: {
    amount: 5000,
    paymentMethodId: 'pm_test_declined',
    customerId: 'cus_test_declined',
  },
  REQUIRES_ACTION: {
    amount: 5000,
    paymentMethodId: 'pm_test_requires_action',
    customerId: 'cus_test_requires_action',
  },
  PROCESSING_ERROR: {
    amount: 5000,
    paymentMethodId: 'pm_test_error',
    customerId: 'cus_test_error',
  },
};

// Use backend Stripe service for all payments (sandbox environment)
const stripeService = BackendStripeService;

export interface PaymentServiceConfig {
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

  constructor(config: PaymentServiceConfig = {}) {
    this.config = config;
  }

  static getInstance(config?: PaymentServiceConfig): PaymentServiceNew {
    if (!PaymentServiceNew.instance) {
      PaymentServiceNew.instance = new PaymentServiceNew(config);
    }
    return PaymentServiceNew.instance;
  }

  // ==================== CORE PAYMENT PROCESSING ====================

  // Process payment using backend Stripe service
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentServiceNew - Processing payment:', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethodId: paymentData.paymentMethodId,
    });

    try {
      return await this.processBackendPayment(paymentData);
    } catch (error) {
      console.error('PaymentServiceNew - Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Backend Stripe payment processing
  private async processBackendPayment(paymentData: PaymentData): Promise<PaymentResult> {
    console.log('PaymentServiceNew - Using backend Stripe payment processing');

    try {
      // Create customer if needed
      let customerId = paymentData.customerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer({
          email: paymentData.metadata?.customerEmail || 'customer@example.com',
          name: paymentData.metadata?.customerName || 'Customer',
          phone: paymentData.metadata?.customerPhone || '+1234567890',
        });
        customerId = customer.id;
      }

      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        customerId: customerId ?? undefined,
        paymentMethodId: paymentData.paymentMethodId || undefined,
        metadata: paymentData.metadata,
      });

      // Confirm payment intent
      const result = await stripeService.confirmPaymentIntent(
        paymentIntent.id || '',
        paymentData.paymentMethodId || ''
      );

      return {
        success: result.status === 'succeeded',
        error: result.status !== 'succeeded' ? 'Payment failed' : undefined,
        ...result,
        customerId: customerId ?? undefined,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Backend payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Backend payment processing failed',
      };
    }
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
      const { data, error } = await supabase!
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
      const { data, error } = await supabase!
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
      const { data, error } = await supabase!
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
      if (false) {
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
      const { data, error } = await supabase!
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
      if (false) {
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
      const { data, error } = await supabase!
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
      if (false) {
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
      const { data, error } = await supabase!
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
      if (false) {
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
      const { data, error } = await supabase!
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
    console.log('PaymentServiceNew - Creating payment method:', {
      type: methodData.type,
    });
    
    return await stripeService.createPaymentMethod(methodData);
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string): Promise<any[]> {
    console.log('PaymentServiceNew - Getting payment methods for customer:', customerId);
    
    // Get payment methods from backend Stripe service
    return await stripeService.getPaymentMethods(customerId);
  }

  // Save payment method
  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    console.log('PaymentServiceNew - Saving payment method:', {
      customerId,
      paymentMethodId,
    });
    
    return await stripeService.attachPaymentMethod(paymentMethodId, customerId);
  }

  // Set default payment method
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    // TODO: Implement backend API for setting default payment method
    console.log('Setting default payment method not yet implemented for backend');
    return { success: true, defaultPaymentMethod: paymentMethodId };
  }

  // Delete payment method
  async deletePaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    // TODO: Implement backend API for deleting payment method
    console.log('Deleting payment method not yet implemented for backend');
    return { success: true, deletedPaymentMethod: paymentMethodId };
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
      if (false) {
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

      const { data, error } = await supabase!
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
      if (false) {
        // Return mock payouts
        return { success: true, data: this.getMockPayouts(mechanicId) };
      }

      const { data, error } = await supabase!
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
      if (false) {
        // Return mock payments
        return { success: true, data: this.getMockPayments(customerId) };
      }

      const { data, error } = await supabase!
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
      if (false) {
        // Return mock payments
        return { success: true, data: this.getMockPayments('mock_customer') };
      }

      const { data, error } = await supabase!
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
      if (false) {
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
        return { success: false, error: 'Payment processing failed' };
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
      if (false) {
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
          payment_method: 'card',
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
        payment_method: 'card',
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
      if (false) {
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
      if (false) {
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
      if (false) {
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
    if (false) {
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
    if (false) {
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
    if (false) {
      // Mock Stripe Connect OAuth URL
      return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=mock_client_id&scope=read_write&redirect_uri=${encodeURIComponent(data.returnUrl)}`;
    } else {
      // TODO: Implement real Stripe Connect account creation
      throw new Error('Real Stripe Connect account creation not implemented yet');
    }
  }

  // Disconnect Stripe account
  async disconnectStripeAccount(userId: string): Promise<any> {
    if (false) {
      // Mock disconnection
      return { success: true, disconnected: true };
    } else {
      // TODO: Implement real Stripe account disconnection
      throw new Error('Real Stripe account disconnection not implemented yet');
    }
  }

  // Get Stripe Dashboard URL
  async getStripeDashboardUrl(userId: string): Promise<string> {
    if (false) {
      // Mock dashboard URL
      return 'https://dashboard.stripe.com/test/dashboard';
    } else {
      // TODO: Implement real Stripe Dashboard URL generation
      throw new Error('Real Stripe Dashboard URL generation not implemented yet');
    }
  }

  // ==================== TESTING & UTILITIES ====================

  // Test different payment scenarios
  async testPaymentScenario(scenario: keyof typeof TEST_DATA): Promise<PaymentResult> {
    console.log(`PaymentServiceNew - Testing payment scenario: ${String(scenario)}`);
    
    const testData = TEST_DATA[scenario];
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
    console.log('PaymentServiceNew - Creating payment intent:', {
      amount: data.amount,
      currency: data.currency,
    });
    
    return await stripeService.createPaymentIntent({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency.toLowerCase(),
      customerId: data.customer,
      metadata: data.metadata,
    });
  }


  // Get current configuration
  getConfig(): PaymentServiceConfig {
    return { ...this.config };
  }

  // Test backend connection
  async testBackendConnection(): Promise<boolean> {
    try {
      return await stripeService.testConnection();
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Get service status
  getServiceStatus(): { 
    stripeConfigured: boolean;
    stripeMode: 'BACKEND_STRIPE';
  } {
    return {
      stripeConfigured: true,
      stripeMode: 'BACKEND_STRIPE',
    };
  }
}

// Export singleton instance
export const paymentServiceNew = PaymentServiceNew.getInstance();

// Helper functions for testing
export const testPaymentScenarios = async () => {
  console.log('Testing all payment scenarios...');
  
  const scenarios: (keyof typeof TEST_DATA)[] = [
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
      console.error(`Scenario ${String(scenario)} failed:`, error);
    }
  }
};

// Export for easy testing
export default paymentServiceNew;
