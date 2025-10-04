/**
 * Stripe Payment Methods API Endpoint
 * This handles payment method operations using your Stripe secret key
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { customerId } = req.query;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get payment methods for a customer
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });

        res.status(200).json({
          data: paymentMethods.data,
          has_more: paymentMethods.has_more,
        });
        break;

      case 'POST':
        // Attach a payment method to a customer
        const { paymentMethodId } = req.body;
        
        if (!paymentMethodId) {
          return res.status(400).json({ error: 'Payment method ID is required' });
        }

        const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });

        res.status(200).json({
          id: attachedPaymentMethod.id,
          customer: attachedPaymentMethod.customer,
          type: attachedPaymentMethod.type,
        });
        break;

      case 'DELETE':
        // Detach a payment method from a customer
        const { paymentMethodId: detachPaymentMethodId } = req.body;
        
        if (!detachPaymentMethodId) {
          return res.status(400).json({ error: 'Payment method ID is required' });
        }

        const detachedPaymentMethod = await stripe.paymentMethods.detach(detachPaymentMethodId);

        res.status(200).json({
          id: detachedPaymentMethod.id,
          detached: true,
        });
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Stripe payment methods error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payment methods',
      message: error.message 
    });
  }
}
