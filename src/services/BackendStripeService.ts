/**
 * Backend Stripe Service Implementation
 * This uses your backend API for Stripe operations
 */

import { STRIPE_CONFIG } from '../config/payment';

// Backend API base URL - update this to match your backend
const BACKEND_API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://queueup-callback-c9wttgci8-kiinsolutionsllc-gmailcoms-projects.vercel.app';

// Development mode detection
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export class BackendStripeService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${BACKEND_API_URL}/api/stripe`;
    
    if (isDevelopment) {
      console.log('🔧 BackendStripeService: Development mode enabled');
      console.log('🔗 API URL:', this.apiUrl);
    }
  }

  /**
   * Create a customer in Stripe via backend
   */
  async createCustomer(data: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<{ id: string; email: string; name: string }> {
    console.log('Backend Stripe: Creating customer', data);
    
    try {
      const response = await fetch(`${this.apiUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const customer = await response.json();
      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      };
    } catch (error) {
      console.error('Backend Stripe: Customer creation failed', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a payment intent in Stripe via backend
   */
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    metadata?: any;
  }): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    client_secret: string;
  }> {
    console.log('Backend Stripe: Creating payment intent', data);
    
    try {
      const response = await fetch(`${this.apiUrl}/payment-intents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customerId,
          payment_method: data.paymentMethodId,
          metadata: data.metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const paymentIntent = await response.json();
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Backend Stripe: Payment intent creation failed', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Confirm a payment intent via backend
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<{
    id: string;
    status: string;
    payment_method: string;
  }> {
    console.log('Backend Stripe: Confirming payment intent', {
      paymentIntentId,
      paymentMethodId,
    });
    
    try {
      const response = await fetch(
        `${this.apiUrl}/payment-intents/${paymentIntentId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_method: paymentMethodId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        status: result.status,
        payment_method: result.payment_method,
      };
    } catch (error) {
      console.error('Backend Stripe: Payment intent confirmation failed', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  /**
   * Create a payment method via backend
   */
  async createPaymentMethod(data: {
    type: string;
    card?: any;
    billing_details?: any;
  }): Promise<{
    id: string;
    type: string;
    card?: any;
  }> {
    console.log('Backend Stripe: Creating payment method', data);
    
    try {
      const response = await fetch(`${this.apiUrl}/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const paymentMethod = await response.json();
      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card,
      };
    } catch (error) {
      console.error('Backend Stripe: Payment method creation failed', error);
      throw new Error('Failed to create payment method');
    }
  }

  /**
   * Attach a payment method to a customer via backend
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<{
    id: string;
    customer: string;
  }> {
    console.log('Backend Stripe: Attaching payment method', {
      paymentMethodId,
      customerId,
    });
    
    try {
      const response = await fetch(
        `${this.apiUrl}/payment-methods/${paymentMethodId}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: customerId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id,
        customer: result.customer,
      };
    } catch (error) {
      console.error('Backend Stripe: Payment method attachment failed', error);
      throw new Error('Failed to attach payment method');
    }
  }

  /**
   * Get payment methods for a customer via backend
   */
  async getPaymentMethods(customerId: string): Promise<any[]> {
    console.log('Backend Stripe: Getting payment methods for customer', customerId);
    
    try {
      const response = await fetch(`${this.apiUrl}/customers/${customerId}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend Stripe: API error response:', errorData);
        
        // If customer doesn't exist, return empty array instead of throwing error
        if (errorData.message && errorData.message.includes('No such customer')) {
          console.log('Backend Stripe: Customer does not exist, returning empty payment methods');
          return [];
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend Stripe: Payment methods retrieved successfully:', data);
      return data.data || [];
    } catch (error) {
      console.error('Backend Stripe: Failed to get payment methods', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('Backend Stripe: Network request failed - backend server may not be running');
        throw new Error('Network request failed - please check your backend server');
      }
      
      // If customer doesn't exist, return empty array instead of throwing error
      if (error instanceof Error && error.message.includes('No such customer')) {
        console.log('Backend Stripe: Customer does not exist, returning empty payment methods');
        return [];
      }
      
      throw new Error('Failed to get payment methods');
    }
  }

  /**
   * Process a refund via backend
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    console.log('Backend Stripe: Processing refund', { paymentIntentId, amount });
    
    try {
      const response = await fetch(`${this.apiUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent: paymentIntentId,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Backend Stripe: Refund processing failed', error);
      throw new Error('Failed to process refund');
    }
  }

  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 BackendStripeService: Testing connection to', `${this.apiUrl}/test`);
      const response = await fetch(`${this.apiUrl}/test`);
      const isOk = response.ok;
      
      if (isOk) {
        console.log('✅ BackendStripeService: Connection successful');
      } else {
        console.error('❌ BackendStripeService: Connection failed with status', response.status);
      }
      
      return isOk;
    } catch (error) {
      console.error('❌ BackendStripeService: Connection test failed', error);
      
      if (isDevelopment) {
        console.log('💡 Development tip: Make sure the server is running with: npm run server');
        console.log('🔗 Server should be accessible at:', this.apiUrl);
      }
      
      return false;
    }
  }

  /**
   * Get Stripe configuration from backend
   */
  async getConfig(): Promise<{ publishableKey: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/config`);
      if (!response.ok) {
        throw new Error('Failed to get Stripe config');
      }
      return await response.json();
    } catch (error) {
      console.error('Backend Stripe: Failed to get config', error);
      throw new Error('Failed to get Stripe configuration');
    }
  }
}

// Export singleton instance
export default new BackendStripeService();
