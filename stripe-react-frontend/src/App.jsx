import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  /*const handleCheckout = async () => {
    setLoading(true);
    try {
      // Use an env-driven backend URL if present
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 1, quantity: 1 }] }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => 'no body');
        console.error('Backend returned non-OK status', response.status, text);
        return;
      }

      const json = await response.json().catch(() => null);
      if (!json || !json.sessionId) {
        console.error('Backend did not return a sessionId:', json);
        return;
      }

      // Ensure Stripe.js is loaded
      if (!window.Stripe) {
        console.error('Stripe.js not loaded. Make sure <script src="https://js.stripe.com/v3/"></script> is present.');
        return;
      }

      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SAddDEk5KmZ05qH6M9KZ8AVuXZNWJZ2I7U3JXUEGfQ6moow74ZSRvuGeIvlSGCV9ROnY40TugVgct0GVQhyGEdA007GYYtst9';
      const stripe = window.Stripe(publishableKey);
      const { error } = await stripe.redirectToCheckout({ sessionId: json.sessionId });
      if (error) {
        console.error('Stripe redirect error:', error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };*/

  const handleCheckout = async (priceId) => {
    setCheckoutLoading(prev => ({ ...prev, [priceId]: true }));
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId } = await response.json();
      const stripe = window.Stripe('pk_test_51SAddDEk5KmZ05qH6M9KZ8AVuXZNWJZ2I7U3JXUEGfQ6moow74ZSRvuGeIvlSGCV9ROnY40TugVgct0GVQhyGEdA007GYYtst9'); // Replace with your Stripe publishable key
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe redirect error:', error.message);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(prev => ({ ...prev, [priceId]: false }));
    }
  };

  if (loading) {
    return <div className="container">Loading products...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Available Plans</h1>
      {products.length === 0 ? (
        <p className="description">No products available. Add some in your Stripe Dashboard.</p>
      ) : (
        <div className="plans-grid">
          {products.map((product) => (
            <div key={product.id} className="plan-card">
              <h2 className="plan-title">{product.name}</h2>
              <p className="plan-description">{product.description}</p>
              <div className="plan-price">
                ${product.price.amount} {product.price.currency}
                {product.price.recurring === 'Yes' && ' / month'}
              </div>
              <button
                onClick={() => handleCheckout(product.price.id)}
                disabled={checkoutLoading[product.price.id]}
                className="button"
              >
                {checkoutLoading[product.price.id] ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /*return (
    <div className="container">
      <div className="card">
        <h1 className="title">Stripe Checkout Demo</h1>
        <p className="description">Purchase a $10.00 item</p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="button"
        >
          {loading ? 'Processing...' : 'Pay with Stripe'}
        </button>
      </div>
    </div>
  );*/
}

export default App;