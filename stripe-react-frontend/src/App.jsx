import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState({});
  const [email, setEmail] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Check for session_id in URL after redirect from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session_id');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
      fetchCustomerId(sessionIdFromUrl);
    }
  }, []);

  // Fetch products
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

  // Fetch customer ID from session
  const fetchCustomerId = async (sessionId) => {
    try {
      const response = await fetch('http://localhost:3000/checkout-session?session_id=' + sessionId);
      const session = await response.json();
      if (session.customer) {
        setCustomerId(session.customer);
      }
    } catch (error) {
      console.error('Error fetching customer ID:', error);
    }
  };

  // Handle checkout
  /*const handleCheckout = async (priceId) => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    setCheckoutLoading(prev => ({ ...prev, [priceId]: true }));
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, customerEmail: email }),
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
  };*/

  // Handle checkout
  const handleCheckout = async (priceId, interval) => { // Add interval param
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    setCheckoutLoading(prev => ({ ...prev, [priceId]: true }));
    try {
      const response = await fetch('http://localhost:3000/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, customerEmail: email, interval }), // Pass interval
      });
      const { sessionId } = await response.json();
      console.log("session id ",sessionId)
      const stripe = window.Stripe('pk_test_51SAddDEk5KmZ05qH6M9KZ8AVuXZNWJZ2I7U3JXUEGfQ6moow74ZSRvuGeIvlSGCV9ROnY40TugVgct0GVQhyGEdA007GYYtst9'); // Replace with your Stripe publishable key
      //const stripe = window.Stripe('pk_test_51O3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4bKz2o3X4b'); // Replace key
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) console.error(error);
    } catch (error) {
      console.error(error);
    } finally {
      setCheckoutLoading(prev => ({ ...prev, [priceId]: false }));
    }
  };

  // Handle Customer Portal redirect
  const handleCustomerPortal = async () => {
    if (!customerId) {
      alert('No customer ID available. Complete a subscription first.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      alert('Failed to access customer portal');
    }
  };

  if (loading) {
    return <div className="container">Loading products...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Subscription Plans</h1>
      <div className="email-input">
        <label htmlFor="email" className="email-label">Your Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="email-field"
          required
        />
      </div>
      {customerId && (
        <button onClick={handleCustomerPortal} className="button portal-button">
          Manage Subscription
        </button>
      )}
      {products.length === 0 ? (
        <p className="description">No subscription plans available. Add some in your Stripe Dashboard.</p>
      ) : (
        <div className="plans-grid">
          {products.map((product) => (
            <div key={product.id} className="plan-card">
              <h2 className="plan-title">{product.name}</h2>
              <p className="plan-description">{product.description}</p>
              <div className="plan-price">
                ${product.price.amount} {product.price.currency} / {product.price.interval}
              </div>
              
              {/* <button
                onClick={() => handleCheckout(product.price.id)}
                disabled={checkoutLoading[product.price.id] || !email}
                className="button"
              >
                {checkoutLoading[product.price.id] ? 'Processing...' : 'Subscribe Now'}
              </button> */}

              <button
                onClick={() => handleCheckout(product.price.id, product.price.interval)}
                disabled={checkoutLoading[product.price.id] || !email}
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
}

export default App;