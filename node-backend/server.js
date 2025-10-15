const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const stripe = Stripe('sk_test_51SAddDEk5KmZ05qHKYlGmZTUVtevLsBM1KfSrZCA7tmtWPTtb0Ew68hsNMU2jgUzauIXTqI2n7SFthe4N7HUo8c600Q0CFaSEG'); // Replace with your Stripe secret key
const endpointSecret = 'whsec_3BtZubWxQgV3OlRZ0KgCNCoCsyPiLB1r'; // Replace with your webhook signing secret from Stripe Dashboard

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

//Default end point
app.get('/', (req, res) => {
  res.send('Hello world!');
});

// Serve raw body for webhook verification
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  console.log("event ",event)
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    handleCheckoutCompletion(session);
  }

  res.json({ received: true });
});

//  GLOBAL MIDDLEWARE FOR OTHER ROUTES
// This *must* come *after* the raw webhook route.
app.use(express.json()); // or app.use(bodyParser.json());
// --------------------------------------------------

// Function to handle subscription update
async function handleCheckoutCompletion(session) {
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);

    if (price.recurring && price.recurring.interval === 'month') {
      // Cancel after 12 months (1 year)
      const cancelAt = Math.floor(Date.now() / 1000) + (3600 * 24 * 365); // Approx 1 year from now
      await stripe.subscriptions.update(subscription.id, {
        cancel_at: cancelAt,
      });
      console.log(`Monthly subscription ${subscription.id} set to cancel after 1 year.`);
    } else if (price.recurring && price.recurring.interval === 'year') {
      // Yearly: Do nothing, remains active
      console.log(`Yearly subscription ${subscription.id} left active.`);
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

// Existing endpoints (updated for metadata)
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
          amount: product.default_price.unit_amount / 100,
          currency: product.default_price.currency.toUpperCase(),
          interval: product.default_price.recurring ? product.default_price.recurring.interval : null,
        } : null,
      }))
      .filter(product => product.price && product.price.interval);
    res.json(productList);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/create-checkout-session', async (req, res) => {
  const { priceId, customerEmail, interval } = req.body; // interval: 'month' or 'year'
  if (!priceId || !customerEmail) {
    return res.status(400).json({ error: 'priceId and customerEmail are required' });
  }
  try {
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customer;
    if (customers.data.length > 0) {
      console.log("customer exist already")
      customer = customers.data[0];
    } else {
      console.log("customer created on stripe")
      customer = await stripe.customers.create({ email: customerEmail });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:5173/cancel',
      metadata: { interval }, // Pass interval for potential future use
    });
    console.log("Returning session id ",session.id)
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


// Existing /customer-portal endpoint (unchanged)...

app.listen(3000, () => console.log('Server running on http://localhost:3000'));