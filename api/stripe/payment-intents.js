/**
 * Stripe Payment Intents API Endpoint
 * This handles payment intent operations using your Stripe secret key
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'POST':
        // Create a payment intent
        const { amount, currency = 'usd', customer, payment_method, metadata } = req.body;

        if (!amount) {
          return res.status(400).json({ error: 'Amount is required' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          customer,
          payment_method,
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        res.status(200).json({
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret,
        });
        break;

      case 'PUT':
        // Confirm a payment intent
        const { paymentIntentId, paymentMethodId } = req.body;

        if (!paymentIntentId) {
          return res.status(400).json({ error: 'Payment intent ID is required' });
        }

        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
          payment_method: paymentMethodId,
        });

        res.status(200).json({
          id: confirmedPaymentIntent.id,
          status: confirmedPaymentIntent.status,
          payment_method: confirmedPaymentIntent.payment_method,
        });
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment intent',
      message: error.message 
    });
  }
}
