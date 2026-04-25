import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, Loader2, Check, Send, Clock } from 'lucide-react';
import './Contact.css';
import { useAuth } from '../contexts/AuthContext';

const PHONE = '9111005300';
const EMAIL = 'evodevs.official@gmail.com';
const INSTA = 'evodevs';

const saveContact = async (data) => {
  try {
    const { db } = await import('../firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, 'contacts'), {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to save contact:', err);
    throw err;
  }
};

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await saveContact({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        userId: user?.uid || null
      });
      await new Promise(resolve => setTimeout(resolve, 600));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const openGmail = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(form.subject || 'Inquiry')}&body=${encodeURIComponent(form.message || '')}`, '_blank');
  };

  const callNow = () => {
    window.location.href = `tel:${PHONE.replace(/\s/g, '')}`;
  };

  if (submitted) {
    return (
      <div className="contact-page">
        <div className="contact-success-full">
          <div className="success-checkmark">
            <Check size={40} />
          </div>
          <h2>Message Sent!</h2>
          <p>Thanks {form.name || 'there'}! We'll get back to you within 24 hours.</p>
          <div className="success-actions">
            <button className="btn btn-outline" onClick={callNow}>
              <Phone size={16} /> Call Us Now
            </button>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <div className="container">

        <div className="contact-hero">
          <h1>Get in Touch</h1>
          <p>Have a question, want to build something, or need help? We're one message away.</p>
        </div>

        <div className="contact-quick-actions">
          <button className="quick-action-btn call" onClick={callNow}>
            <Phone size={20} />
            <span>Call</span>
            <small>+91 {PHONE}</small>
          </button>
          <button className="quick-action-btn whatsapp" onClick={() => window.open(`https://wa.me/91${PHONE.replace(/\s/g, '')}?text=Hi, I need help with...`, '_blank')}>
            <MessageSquare size={20} />
            <span>WhatsApp</span>
            <small>Instant reply</small>
          </button>
          <button className="quick-action-btn email" onClick={openGmail}>
            <Mail size={20} />
            <span>Email</span>
            <small>{EMAIL}</small>
          </button>
          <a className="quick-action-btn insta" href={`https://instagram.com/${INSTA}`} target="_blank" rel="noopener noreferrer">
            <MessageSquare size={20} />
            <span>Instagram</span>
            <small>@{INSTA}</small>
          </a>
        </div>

        <div className="contact-main-layout">
          <div className="contact-left-panel">
            <div className="contact-card">
              <h3>Direct Contact</h3>
              <div className="contact-detail-row">
                <Phone size={18} />
                <div>
                  <span>Phone / WhatsApp</span>
                  <a href={`tel:${PHONE.replace(/\s/g, '')}`}>+91 {PHONE}</a>
                </div>
              </div>
              <div className="contact-detail-row">
                <Mail size={18} />
                <div>
                  <span>Email</span>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </div>
              </div>
              <div className="contact-detail-row">
                <MessageSquare size={18} />
                <div>
                  <span>Instagram</span>
                  <a href={`https://instagram.com/${INSTA}`} target="_blank" rel="noopener noreferrer">@{INSTA}</a>
                </div>
              </div>
            </div>

            <div className="contact-card">
              <h3>Response Time</h3>
              <div className="response-time-row">
                <Clock size={18} />
                <span>We reply within <strong>24 hours</strong></span>
              </div>
            </div>

            <div className="payment-mini">
              <h3>Payment Methods</h3>
              <div className="payment-row-mini">UPI: <strong>ansh20bsp@okaxis</strong></div>
              <div className="payment-row-mini">PayPal: <a href="https://www.paypal.me/AnshRajput680" target="_blank" rel="noopener noreferrer">paypal.me/AnshRajput680</a></div>
            </div>
          </div>

          <form className="contact-form-panel" onSubmit={handleSubmit}>
            <h2>Send a Message</h2>

            <div className="form-row-2">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label>Email * {user && <span className="auto-fill">Auto-filled</span>}</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>What's this about? *</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              >
                <option value="">Select a topic</option>
                <option value="Sales Inquiry">Sales Inquiry</option>
                <option value="Custom Build Request">Custom Build Request</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Payment Instructions">Payment Instructions</option>
                <option value="Order Status">Order Status</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Your Message *</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                placeholder="Tell us about your business or what you need help with..."
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn--lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
              <p className="form-note">We reply within 24 hours. No spam, ever.</p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;