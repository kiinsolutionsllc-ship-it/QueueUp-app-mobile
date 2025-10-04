/**
 * Stripe Customers API Endpoint
 * This handles customer creation using your Stripe secret key
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, phone } = req.body;

    // Create customer in Stripe
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
    });

    res.status(200).json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
    });
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
}
