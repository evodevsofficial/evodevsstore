import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../currency';
import { loadStripe } from '@stripe/stripe-js';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Cart.css';

const Cart = () => {
  const { cart, cartTotal, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'paypal', 'contact'
  const [transactionId, setTransactionId] = useState('');

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }
    setShowPaymentModal(true);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        title: item.title,
        type: item.type,
        price: item.price,
        image: item.image
      }));

      // Add to orders
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: orderItems,
        total: cartTotal,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: paymentMethod, // 'upi' or 'paypal' or 'contact'
        paymentReference: transactionId,
        createdAt: serverTimestamp()
      });

      // Send admin notification
      try {
        await addDoc(collection(db, 'notifications'), {
          type: 'new_order',
          message: `New pending order from ${user.email} via ${paymentMethod}`,
          userId: user.uid,
          userEmail: user.email,
          total: cartTotal,
          paymentReference: transactionId,
          createdAt: serverTimestamp(),
          read: false
        });
      } catch (err) {
        console.warn('Could not write notification doc, continuing anyway:', err);
      }

      clearCart();
      setShowPaymentModal(false);
      navigate('/dashboard?order=pending');
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.code === 'permission-denied') {
        alert('Checkout failed due to Firebase Database permissions. Please tell Admin to update Firestore rules.');
      } else {
        alert('Checkout failed. Please try again or check permissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectOrder = async (item) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: [{
          productId: item.productId,
          title: item.title,
          type: item.type,
          price: item.price,
          image: item.image
        }],
        total: item.price,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp()
      });

      navigate('/dashboard?order=pending');
    } catch (error) {
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <ShoppingBag size={64} />
            <h2>Your cart is empty</h2>
            <p>Browse our marketplace and add products to your cart</p>
            <Link to="/marketplace" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="cart-clear" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-grid">
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={`${item.productId}-${item.type}-${index}`} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <Package size={32} />
                  )}
                </div>
                <div className="cart-item-details">
                  <h3>{item.title}</h3>
                  {item.rawProductParams ? (
                    <select 
                      className="cart-type-select"
                      value={item.type}
                      onChange={(e) => updateCartItemType(item.productId, item.type, e.target.value)}
                      style={{padding: '0.3rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff', cursor: 'pointer', marginTop: '0.4rem', outline: 'none'}}
                    >
                      <option value="self">Use it myself</option>
                      <option value="setup">Set it up for me</option>
                    </select>
                  ) : (
                    <span className="cart-item-type" style={{marginTop: '0.4rem', display: 'block', fontSize: '0.85rem'}}>
                      {item.type === 'self' ? 'Use it myself' : 'Set it up for me'}
                    </span>
                  )}
                  {item.originalPrice && (
                    <span className="cart-item-original">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <div className="cart-item-price">
                  {formatPrice(item.price)}
                </div>
                <div className="cart-item-actions">
                  <button 
                    className="btn-contact"
                    onClick={() => handleDirectOrder(item)}
                    disabled={loading}
                  >
                    Contact to Pay
                  </button>
                  <button 
                    className="cart-remove"
                    onClick={() => removeFromCart(item.productId, item.type)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.length} items)</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
              <ArrowRight size={18} />
            </button>

            <p className="checkout-note">
              Need help? <Link to="/contact">Contact us</Link> for payment options
            </p>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h2>Complete Your Payment</h2>
              <button className="auth-close" onClick={() => setShowPaymentModal(false)}>&times;</button>
            </div>
            
            <div className="payment-method-selector">
              <button 
                className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                UPI Transfer
              </button>
              <button 
                className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                PayPal
              </button>
              <button 
                className={`method-btn ${paymentMethod === 'contact' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('contact')}
              >
                Contact Support
              </button>
            </div>

            <div className="payment-method-content">
              {paymentMethod === 'upi' && (
                <div className="payment-details">
                  <p>Scan the QR code or send payment to:</p>
                  <div className="upi-id"><strong>ansh20bsp@okaxis</strong></div>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=ansh20bsp@okaxis&pn=Ansh" alt="UPI QR Code" className="qr-code" style={{width: '150px', height: '150px', margin: '1rem auto'}} />
                  <a href={`upi://pay?pa=ansh20bsp@okaxis&pn=Ansh&am=${cartTotal}`} className="btn btn-primary" style={{marginBottom: '1rem', display: 'block', width: '100%', textAlign: 'center'}}>Open Payment App</a>
                  <p className="payment-amt-text">Amount to pay: <strong>{formatPrice(cartTotal)}</strong></p>
                </div>
              )}
              {paymentMethod === 'paypal' && (
                <div className="payment-details">
                  <p>Send payment via PayPal using the link below:</p>
                  <a href="https://www.paypal.me/AnshRajput680" target="_blank" rel="noopener noreferrer" className="paypal-link">
                    paypal.me/AnshRajput680
                  </a>
                  <p className="payment-amt-text">Amount to pay: <strong>{formatPrice(cartTotal)}</strong></p>
                  <p className="warning-text">Please ensure the final amount matches correctly.</p>
                </div>
              )}
              {paymentMethod === 'contact' && (
                <div className="payment-details">
                  <p>If you prefer standard wire transfer or have an issue, please contact us.</p>
                  <Link to="/contact" className="btn btn-secondary" style={{width: '100%', marginTop: '1rem'}}>
                    Go to Contact Page
                  </Link>
                </div>
              )}
            </div>

            {paymentMethod !== 'contact' && (
              <div className="transaction-input">
                <label>Transaction ID / Reference Number (Required)</label>
                <input 
                  type="text" 
                  placeholder="e.g. UPI Ref Num or PayPal Txn ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="payment-modal-footer">
              <button 
                className="btn-pay" 
                onClick={handleConfirmOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : paymentMethod === 'contact' ? 'Submit Contact Request' : `Confirm Payment of ${formatPrice(cartTotal)}`}
              </button>
            </div>
            <p className="help-small">After confirmation, your order will be marked as pending. An admin will verify the transaction within 1-2 hours.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
