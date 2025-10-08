const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51SAddDEk5KmZ05qHKYlGmZTUVtevLsBM1KfSrZCA7tmtWPTtb0Ew68hsNMU2jgUzauIXTqI2n7SFthe4N7HUo8c600Q0CFaSEG'); // Replace with your Stripe secret key

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});


// GET /products - List products with prices
app.get('/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      expand: ['data.default_price'], // Expands to include price details
    });
    // Map to include relevant details
    const productList = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || 'No description available',
      price: product.default_price ? {
        id: product.default_price.id,
        amount: product.default_price.unit_amount / 100, // Convert cents to dollars
        currency: product.default_price.currency.toUpperCase(),
        recurring: product.default_price.recurring ? 'Yes' : 'No', // For subscription plans
      } : null,
    })).filter(product => product.price); // Filter out products without prices
    res.json(productList);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Item',
            },
            unit_amount: 1000, // $10.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));