import { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
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
  };

  return (
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
  );
}

export default App;