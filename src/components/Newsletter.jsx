import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X } from 'lucide-react';
import { useStore } from '../store';

const Newsletter = () => {
  const { subscribeNewsletter, leadEmail, setLeadEmail, showNewsletter, setShowNewsletter } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    subscribeNewsletter();
  };

  if (showNewsletter) {
    return (
      <motion.div 
        className="newsletter-success"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Check size={20} />
        <span>Thanks! You'll receive our free growth guide soon.</span>
        <button onClick={() => setShowNewsletter(false)}><X size={16} /></button>
      </motion.div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-content">
        <div className="newsletter-icon"><Mail size={20} /></div>
        <div className="newsletter-text">
          <h4>Get Our Free Growth Guide</h4>
          <p>Join 2,000+ business owners getting free growth strategies weekly.</p>
        </div>
      </div>
      <div className="newsletter-input-group">
        <input 
          type="email" 
          placeholder="Enter your email"
          value={leadEmail}
          onChange={e => setLeadEmail(e.target.value)}
          required
        />
        <button type="submit">Get Free Guide</button>
      </div>
    </form>
  );
};

export default Newsletter;