import { supabase } from '../config/supabase';
import CommissionService from './CommissionService';
import { paypalService } from './PayPalService';

class PaymentService {
  // Create a payment intent for posting deposit
  async createPostingDepositPayment(customerId, jobId, amount = 10, paymentMethod = 'card') {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Create a payment intent for escrow deposit
  async createEscrowPayment(customerId, jobId, mechanicId, amount, bidId) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Create a payment intent for final balance
  async createFinalPayment(customerId, jobId, amount) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Process payment with Stripe
  async processPayment(paymentId, paymentMethodId, paymentMethod = 'card') {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Process PayPal payment
  async processPayPalPayment(customerId, jobId, amount, description = '', metadata = {}) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Confirm PayPal payment
  async confirmPayPalPayment(paymentId, paymentIntentId) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Refund a payment
  async refundPayment(paymentId, reason) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Get mock payouts for a mechanic
  getMockPayouts(mechanicId) {
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

  // Get payment history for a customer
  async getCustomerPayments(customerId) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Get payment history for a mechanic
  async getMechanicPayments(mechanicId) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Calculate platform commission with dynamic rates
  calculateCommission(jobAmount, serviceCategory = null) {
    return CommissionService.calculateCommission(jobAmount, serviceCategory);
  }

  // Calculate mechanic payout with dynamic rates
  calculateMechanicPayout(jobAmount, serviceCategory = null) {
    return CommissionService.calculateMechanicPayout(jobAmount, serviceCategory);
  }

  // Get commission rate for a service category
  getCommissionRate(serviceCategory) {
    return CommissionService.getCommissionRate(serviceCategory);
  }

  // Get commission details for display
  getCommissionDetails(serviceCategory) {
    return CommissionService.getCommissionDetails(serviceCategory);
  }

  // Process mechanic payout
  async processMechanicPayout(jobId, mechanicId, amount) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Get payout history for a mechanic
  async getMechanicPayouts(mechanicId) {
    try {
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
      return { success: false, error: error.message };
    }
  }

  // Mock data for development
  getMockPayments(customerId) {
    return [
      {
        id: 'payment1',
        customer_id: customerId,
        job_id: 'job1',
        amount: 10,
        currency: 'USD',
        type: 'posting_deposit',
        status: 'completed',
        description: 'Job posting deposit',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        job: {
          id: 'job1',
          title: 'Brake Repair',
          category: 'Repair',
          subcategory: 'Brake Repair',
          status: 'bidding'
        }
      },
      {
        id: 'payment2',
        customer_id: customerId,
        job_id: 'job2',
        amount: 30,
        currency: 'USD',
        type: 'escrow_deposit',
        status: 'completed',
        description: 'Escrow deposit',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        job: {
          id: 'job2',
          title: 'Oil Change',
          category: 'Maintenance',
          subcategory: 'Oil Change',
          status: 'accepted'
        }
      }
    ];
  }


  // Change Order Payment Methods

  // Create a payment intent for change order
  async createChangeOrderPayment(customerId, changeOrderId, amount, paymentMethod = 'card') {
    try {
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

      const paymentData = {
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
        processed_at: new Date().toISOString()
      };

      return { success: true, data: paymentData };
    } catch (error) {
      console.error('Error creating change order payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Process change order payment with Stripe
  async processChangeOrderPaymentWithStripe(customerId, changeOrderId, amount, paymentMethodId) {
    try {
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

      const paymentData = {
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
        processed_at: new Date().toISOString()
      };

      return { success: true, data: paymentData };
    } catch (error) {
      console.error('Error processing change order payment with Stripe:', error);
      return { success: false, error: error.message };
    }
  }

  // Get change order payment history
  async getChangeOrderPayments(customerId = null, changeOrderId = null) {
    try {
      // For mock environment, return simulated data
      const mockPayments = [
        {
          id: 'change_payment_1',
          customer_id: 'customer1',
          change_order_id: 'change-order-1',
          amount: 75.00,
          currency: 'USD',
          type: 'change_order_payment',
          status: 'completed',
          description: 'Payment for additional brake work',
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
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
    } catch (error) {
      console.error('Error fetching change order payments:', error);
      return { success: false, error: error.message };
    }
  }

  // Refund change order payment
  async refundChangeOrderPayment(paymentId, reason = 'Customer request') {
    try {
      // Simulate refund processing
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
    } catch (error) {
      console.error('Error refunding change order payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment analytics for change orders
  async getChangeOrderPaymentAnalytics(mechanicId = null, customerId = null, dateRange = null) {
    try {
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
    } catch (error) {
      console.error('Error fetching change order payment analytics:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PaymentService();
