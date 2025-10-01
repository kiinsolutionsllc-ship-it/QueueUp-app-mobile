// Stripe Backend Configuration
// This file contains configuration for your backend Stripe integration

export interface StripeBackendConfig {
  baseUrl: string;
  endpoints: {
    createPaymentIntent: string;
    confirmPayment: string;
    createCustomer: string;
    getPaymentMethods: string;
  };
  headers: {
    'Content-Type': string;
    'Authorization'?: string;
  };
}

// Development/Testing configuration
export const STRIPE_BACKEND_CONFIG: StripeBackendConfig = {
  baseUrl: 'https://your-backend.com/api/stripe', // Replace with your actual backend URL
  endpoints: {
    createPaymentIntent: '/create-payment-intent',
    confirmPayment: '/confirm-payment',
    createCustomer: '/create-customer',
    getPaymentMethods: '/payment-methods',
  },
  headers: {
    'Content-Type': 'application/json',
    // Add your API key or JWT token here
    // 'Authorization': 'Bearer your-api-key',
  },
};

// Helper function to get full endpoint URL
export const getStripeEndpoint = (endpoint: keyof StripeBackendConfig['endpoints']): string => {
  return `${STRIPE_BACKEND_CONFIG.baseUrl}${STRIPE_BACKEND_CONFIG.endpoints[endpoint]}`;
};

// Helper function to make authenticated requests to your backend
export const makeStripeRequest = async (
  endpoint: keyof StripeBackendConfig['endpoints'],
  data: any
): Promise<any> => {
  const url = getStripeEndpoint(endpoint);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: STRIPE_BACKEND_CONFIG.headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Stripe backend request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Example backend endpoint implementations (Node.js/Express)
export const BACKEND_EXAMPLES = {
  // Example: Create Payment Intent endpoint
  createPaymentIntent: `
    // Backend endpoint: POST /api/stripe/create-payment-intent
    app.post('/api/stripe/create-payment-intent', async (req, res) => {
      try {
        const { amount, currency, customer, metadata } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency || 'usd',
          customer: customer,
          metadata: metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });
        
        res.json({
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id,
        });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
      }
    });
  `,
  
  // Example: Confirm Payment endpoint
  confirmPayment: `
    // Backend endpoint: POST /api/stripe/confirm-payment
    app.post('/api/stripe/confirm-payment', async (req, res) => {
      try {
        const { payment_intent_id, payment_method } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.confirm(
          payment_intent_id,
          {
            payment_method: payment_method,
          }
        );
        
        res.json({
          status: paymentIntent.status,
          payment_intent_id: paymentIntent.id,
        });
      } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
      }
    });
  `,
};

export default STRIPE_BACKEND_CONFIG;
