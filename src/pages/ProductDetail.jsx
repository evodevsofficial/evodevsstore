import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Star, Zap, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductDetail.css';
import { formatPrice } from '../currency';
import { useStore } from '../store';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const categoryLabels = { app: 'App', website: 'Website', ai: 'AI', automation: 'Automation' };

const defaultProduct = {
  title: 'Product Not Found',
  result: '',
  shortDescription: '',
  priceSelf: 8200,
  priceSetup: 41000,
  heroSelf: 'Launch this system yourself in minutes',
  subSelf: 'Get full code, setup guide, and deploy instantly',
  ctaSelf: 'Download Code',
  heroSetup: 'We build and launch this system for you',
  subSetup: 'No tech needed. We handle everything.',
  ctaSetup: 'Start My Setup',
  whatYouGetSelf: [],
  requirements: [],
  benefitsSelf: [],
  whatYouGetSetup: [],
  benefitsSetup: [],
  timeline: '3-5 days',
  results: [],
  reviewText: '',
  reviewAuthor: '',
  reviewRating: 5,
  onSale: false,
  salePriceSelf: null,
  salePriceBuilt: null,
  saleEndDate: '',
  saleNoTimer: true
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('self');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', company: '' });
  const [addedToCart, setAddedToCart] = useState(false);
  const store = useStore();
  const createOrder = store?.createOrder;
  const { addToCart, cart } = useCart();
  const { isAuthenticated, purchasedItemIds } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);

  const handleAddToCart = () => {
    if (!product) return;
    
    const type = mode === 'self' ? 'self' : 'setup';
    const result = addToCart(product, type);
    
    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert(result.message);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/product/' + id);
      return;
    }
    handleAddToCart();
    navigate('/cart');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!product || !createOrder) return;
    
    setSubmitting(true);
    const result = await createOrder({ ...product, mode }, customerInfo);
    if (result.success) {
      setOrderPlaced(true);
      setShowOrderForm(false);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (!product?.onSale || product.saleNoTimer || !product.saleEndDate) {
      setTimeLeft(null);
      return;
    }
    
    const calculateTimeLeft = () => {
      const end = new Date(product.saleEndDate).getTime();
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) return null;
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [product?.onSale, product?.saleNoTimer, product?.saleEndDate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const { db } = await import('../firebase');
        const { doc: docFn, getDoc } = await import('firebase/firestore');
        const docRef = docFn(db, 'products', id);
        const snap = await getDoc(docRef);
        if (isMounted) {
          if (snap.exists()) {
            setProduct({ id: snap.id, ...snap.data() });
          } else {
            setProduct(defaultProduct);
          }
        }
      } catch (err) {
        if (isMounted) setProduct(defaultProduct);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return <div className="container py-32 text-center"><div className="text-secondary">Loading...</div></div>;
  }

  if (!product) {
    return <div className="container py-32 text-center"><h2 className="text-3xl mb-4">Product not found</h2><Link to="/marketplace" className="btn btn-secondary">Back to Marketplace</Link></div>;
  }

  const isSelf = mode === 'self';
  const basePrice = isSelf ? product.priceSelf : (product.priceSetup || product.priceBuilt);
  const salePrice = isSelf ? product.salePriceSelf : product.salePriceBuilt;
  const price = product.onSale && salePrice ? salePrice : basePrice;
  const isOnSale = product.onSale && salePrice;
  const hasTimer = product.onSale && !product.saleNoTimer && product.saleEndDate;
  const image = product.image || '';
  const title = product.title || '';
  const resultBadge = product.result || '';
  const category = product.category || 'app';
  
  const isPurchased = isAuthenticated && purchasedItemIds?.includes(product.id);
  const isInCart = cart?.some(c => c.productId === product.id);
  
  const p = {
    heroSelf: product.heroSelf || defaultProduct.heroSelf,
    subSelf: product.subSelf || defaultProduct.subSelf,
    ctaSelf: product.ctaSelf || defaultProduct.ctaSelf,
    heroSetup: product.heroSetup || defaultProduct.heroSetup,
    subSetup: product.subSetup || defaultProduct.subSetup,
    ctaSetup: product.ctaSetup || defaultProduct.ctaSetup,
    whatYouGetSelf: Array.isArray(product.whatYouGetSelf) ? product.whatYouGetSelf : [],
    requirements: Array.isArray(product.requirements) ? product.requirements : [],
    benefitsSelf: Array.isArray(product.benefitsSelf) ? product.benefitsSelf : [],
    whatYouGetSetup: Array.isArray(product.whatYouGetSetup) ? product.whatYouGetSetup : [],
    benefitsSetup: Array.isArray(product.benefitsSetup) ? product.benefitsSetup : [],
    timeline: product.timeline || defaultProduct.timeline,
    processSteps: Array.isArray(product.processSteps) ? product.processSteps : [
      { step: '1', title: 'Place Order', desc: 'Choose your plan' },
      { step: '2', title: 'We Contact You', desc: 'Within 24 hours' },
      { step: '3', title: 'Setup Complete', desc: 'In 3-5 days' },
      { step: '4', title: 'You Go Live', desc: 'Start getting customers' }
    ],
    results: Array.isArray(product.results) ? product.results : []
  };

  const review = {
    text: product.reviewText || '',
    author: product.reviewAuthor || '',
    rating: product.reviewRating || 5
  };

  return (
    <div className="product-page">
      <div className="sticky-toggle-container">
        <div className="container">
          <div className="sticky-toggle">
            <button className={`sticky-toggle-btn ${isSelf ? 'active' : ''}`} onClick={() => setMode('self')}>Use It Myself</button>
            <button className={`sticky-toggle-btn ${!isSelf ? 'active' : ''}`} onClick={() => setMode('full')}>Set It Up For Me</button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <Link to="/marketplace" className="back-link"><ArrowLeft size={16} />Back to Marketplace</Link>

        <div className="product-grid">
          <div className="product-image-section">
            <div className="image-wrapper">
              {image ? <img src={image} alt={title} className="product-image" /> : <div className="product-image placeholder" />}
              <div className="image-overlay"><span className="result-badge">{resultBadge}</span></div>
              <div className="detail-badges">
                <span className="detail-category-badge">{categoryLabels[category] || category}</span>
                {product.badge && <span className="detail-feature-badge">{product.badge}</span>}
              </div>
            </div>
          </div>

          <div className="product-content-section">
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="mode-content">
                <div className="hero-section">
                  {timeLeft && (
                    <div className="urgency-bar">
                      <Zap size={14} />
                      <span className="countdown">
                        {timeLeft.hours > 0 && `${timeLeft.hours}:`}{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                  <h1 className="hero-headline">{isSelf ? p.heroSelf : p.heroSetup}</h1>
                  <p className="hero-sub">{isSelf ? p.subSelf : p.subSetup}</p>
                  <div className="cta-buttons">
                    {isPurchased ? (
                      <button className="hero-cta" style={{background: '#10b981'}} onClick={() => navigate('/dashboard')}>
                        <CheckCircle size={18} /> Already Purchased
                      </button>
                    ) : isInCart ? (
                      <button className="hero-cta" style={{background: '#3b82f6'}} onClick={() => navigate('/cart')}>
                        <ShoppingCart size={18} /> Already in Cart
                      </button>
                    ) : (
                      <>
                        <button 
                          className={`hero-cta${isOnSale ? ' hero-cta--sale' : ''} ${addedToCart ? 'added' : ''}`}
                          onClick={handleAddToCart}
                        >
                          {addedToCart ? <>Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
                        </button>
                        <button className="hero-cta hero-cta--secondary" onClick={handleBuyNow}>
                          {isSelf ? 'Buy Now' : 'Get Started'}
                        </button>
                      </>
                    )}
                  </div>
                  <p className="price-note">
                    {isOnSale && basePrice ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        {formatPrice(price)}
                        <span style={{ textDecoration: 'line-through', opacity: 0.6, marginLeft: '0.5rem', color: '#64748b' }}>
                          {formatPrice(basePrice)}
                        </span>
                      </span>
                    ) : (
                      <span>From {formatPrice(price)}</span>
                    )}
                    {' '}one-time
                  </p>
                </div>

                <div className="content-blocks">
                  <AnimatePresence mode="wait">
                    <motion.div key={`blocks-${mode}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      {isSelf ? (
                        <>
                          <div className="content-block">
                            <h3 className="block-title">What You Get</h3>
                            <ul className="block-list">
                              {p.whatYouGetSelf.length > 0 ? p.whatYouGetSelf.map((item, i) => <li key={i}><Check size={14} />{item}</li>) : <li><Check size={14} />Full source code</li>}
                            </ul>
                          </div>
                          <div className="content-block">
                            <h3 className="block-title">Requirements</h3>
                            <ul className="block-list requirements">
                              {p.requirements.length > 0 ? p.requirements.map((item, i) => <li key={i}>{item}</li>) : <li>Basic coding knowledge</li>}
                            </ul>
                          </div>
                          <div className="content-block">
                            <h3 className="block-title">Benefits</h3>
                            <ul className="block-list benefits">
                              {p.benefitsSelf.length > 0 ? p.benefitsSelf.map((item, i) => <li key={i}><Check size={14} />{item}</li>) : <li><Check size={14} />Full control</li>}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="content-block highlight">
                            <h3 className="block-title">What We Do</h3>
                            <ul className="block-list">
                              {p.whatYouGetSetup.length > 0 ? p.whatYouGetSetup.map((item, i) => <li key={i}><Check size={14} />{item}</li>) : <li><Check size={14} />Full system setup</li>}
                            </ul>
                          </div>
                          <div className="timeline-block">
                            <div className="timeline-header"><Clock size={16} /><span>Ready in {p.timeline}</span></div>
                            <div className="process-steps">
                              {p.processSteps.map((step, i) => (
                                <div key={i} className="process-step"><span className="step-number">{step.step}</span><div><div className="step-title">{step.title}</div><div className="step-desc">{step.desc}</div></div></div>
                              ))}
                            </div>
                          </div>
                          <div className="content-block">
                            <h3 className="block-title">Why This Works</h3>
                            <ul className="block-list benefits">
                              {p.benefitsSetup.length > 0 ? p.benefitsSetup.map((item, i) => <li key={i}><Check size={14} />{item}</li>) : <li><Check size={14} />No tech needed</li>}
                            </ul>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {review.text && (
          <div className="testimonial-section">
            <h2 className="section-title">Review</h2>
            <div className="testimonial-card">
              <div className="stars">
                {[...Array(5)].map((_, j) => <Star key={j} size={18} fill={j < review.rating ? "#eab308" : "none"} color={j < review.rating ? "#eab308" : "#ccc"} />)}
              </div>
              <p className="testimonial-text">"{review.text}"</p>
              <p className="testimonial-author">— {review.author}</p>
            </div>
          </div>
        )}

        {!review.text && p.results.length > 0 && (
          <div className="results-section">
            <h2 className="section-title">What You Can Expect</h2>
            <div className="results-grid">
              {p.results.map((result, i) => (
                <div key={i} className="result-item"><span className="result-text">{result}</span></div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showOrderForm && (
          <motion.div 
            className="order-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOrderForm(false)}
          >
            <motion.div 
              className="order-form"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {orderPlaced ? (
                <div className="order-success">
                  <div className="order-success-icon">✓</div>
                  <h2>Order Placed!</h2>
                  <p>We'll contact you within 24 hours.</p>
                  <button onClick={() => { setOrderPlaced(false); setShowOrderForm(false); }} className="btn btn-primary">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder}>
                  <h2>Complete Your Order</h2>
                  <p className="order-sub">Fill in your details and we'll get started</p>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={customerInfo.name}
                      onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      required 
                      value={customerInfo.email}
                      onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone *</label>
                    <input 
                      type="tel" 
                      required 
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Company (Optional)</label>
                    <input 
                      type="text" 
                      value={customerInfo.company}
                      onChange={e => setCustomerInfo({...customerInfo, company: e.target.value})}
                    />
                  </div>

                  <div className="order-summary">
                    <div className="order-item">
                      <span>{product?.title}</span>
                      <span>{isOnSale && basePrice ? formatPrice(price) : formatPrice(basePrice)}</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn--lg btn--full" disabled={submitting}>
                    {submitting ? 'Processing...' : `Pay ${isOnSale && basePrice ? formatPrice(price) : formatPrice(basePrice)}`}
                  </button>
                  
                  <button type="button" className="order-cancel" onClick={() => setShowOrderForm(false)}>
                    Cancel
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;