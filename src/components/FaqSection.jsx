import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, RotateCcw, Headphones } from 'lucide-react';

const faqs = [
  {
    q: 'How long does setup take?',
    a: 'Self-use products are delivered immediately. Full setup services take 3-5 business days after your consultation call.'
  },
  {
    q: 'Do I need technical knowledge?',
    a: 'Not at all for full setup! We handle everything. For self-use versions, basic coding knowledge helps but our guide makes it easy.'
  },
  {
    q: 'What if it doesn\'t work for me?',
    a: 'We offer a 30-day money-back guarantee. No questions asked.'
  },
  {
    q: 'Can I get changes after setup?',
    a: 'Yes! Full setup customers get 30 days of unlimited revisions included.'
  },
  {
    q: 'How do you handle support?',
    a: 'We provide support via email, chat, and even screen sharing sessions when needed.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'Absolutely. 30-day money-back guarantee on all products.'
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = React.useState(null);

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={18} />
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="trust-badges">
          <div className="trust-badge">
            <Shield size={24} />
            <span>30-Day Guarantee</span>
          </div>
          <div className="trust-badge">
            <RotateCcw size={24} />
            <span>Easy Refunds</span>
          </div>
          <div className="trust-badge">
            <Headphones size={24} />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;