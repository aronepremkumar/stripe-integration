import { useState } from 'react';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 1, quantity: 1 }] }),
      });
      const { sessionId } = await response.json();
      const stripe = window.Stripe('pk_test_51O3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4b'); // Replace with your Stripe publishable key
      const { error } = await stripe.redirectToCheckout({ sessionId });
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