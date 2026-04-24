import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, Loader2, Check } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (error) {
      console.error('Contact error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-page">
        <div className="container">
          <div className="contact-success">
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h2>Message Sent!</h2>
            <p>We'll get back to you within 24 hours.</p>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Have questions? We're here to help.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="info-card">
              <Mail size={24} />
              <h3>Email</h3>
              <p>support@evodevs.com</p>
            </div>
            <div className="info-card">
              <MessageCircle size={24} />
              <h3>Live Chat</h3>
              <p>Available 9AM - 6PM IST</p>
            </div>
            <div className="info-card">
              <Phone size={24} />
              <h3>Phone</h3>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="payment-options">
            <h2>Payment Options</h2>
            <p className="payment-intro">
              Ready to complete your purchase? Here are the ways you can pay:
            </p>
            
            <div className="payment-methods">
              <div className="payment-card">
                <h3>UPI / Bank Transfer</h3>
                <p>Direct UPI to: <strong>ansh20bsp@okaxis</strong> or bank transfer</p>
                <span className="payment-note">Instant confirmation</span>
              </div>
              
              <div className="payment-card">
                <h3>International Payment</h3>
                <p>PayPal via <a href="https://www.paypal.me/AnshRajput680" target="_blank" rel="noopener noreferrer">paypal.me/AnshRajput680</a> or wire transfer.</p>
                <span className="payment-note">Available worldwide</span>
              </div>
              
              <div className="payment-card">
                <h3>Credit / Debit Card</h3>
                <p>Visa, Mastercard, RuPay via secure payment link</p>
                <span className="payment-note">Secure payment</span>
              </div>
            </div>

            <div className="payment-contact">
              <p>Contact us to get payment instructions for your order.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setForm({
                    ...form,
                    subject: 'Payment Instructions',
                    message: 'Hi, I would like to complete payment for my order. Please send me payment instructions.'
                  });
                  document.querySelector('.contact-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Request Payment Link
              </button>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send us a Message</h2>
            
            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              >
                <option value="">Select a topic</option>
                <option value="Payment Instructions">Payment Instructions</option>
                <option value="Order Status">Order Status</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Sales Inquiry">Sales Inquiry</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                placeholder="How can we help you?"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;