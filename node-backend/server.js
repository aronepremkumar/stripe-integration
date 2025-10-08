const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
//const stripe = Stripe('sk_test_51O3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4b'); // Replace with your Stripe secret key
const stripe = Stripe('sk_test_51SAddDEk5KmZ05qHKYlGmZTUVtevLsBM1KfSrZCA7tmtWPTtb0Ew68hsNMU2jgUzauIXTqI2n7SFthe4N7HUo8c600Q0CFaSEG'); // Replace with your Stripe secret key

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// GET /products - List products with recurring prices
app.get('/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      expand: ['data.default_price'],
    });
    const productList = products.data
      .map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || 'No description available',
        price: product.default_price ? {
          id: product.default_price.id,
          amount: product.default_price.unit_amount / 100, // Convert cents to dollars
          currency: product.default_price.currency.toUpperCase(),
          interval: product.default_price.recurring ? product.default_price.recurring.interval : null,
        } : null,
      }))
      .filter(product => product.price && product.price.interval); // Only recurring prices
    res.json(productList);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /create-checkout-session - Create subscription session
app.post('/create-checkout-session', async (req, res) => {
  const { priceId, customerEmail } = req.body;
  if (!priceId || !customerEmail) {
    return res.status(400).json({ error: 'priceId and customerEmail are required' });
  }
  try {
    // Create or retrieve customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({ email: customerEmail });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /customer-portal - Redirect to Customer Portal
app.post('/customer-portal', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'customerId is required' });
  }
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'http://localhost:5173',
    });
    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));