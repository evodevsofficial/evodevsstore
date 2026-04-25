import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import {
  ArrowRight, ArrowDown, TrendingUp, Zap, Settings,
  CheckCircle, Star, Users, BarChart3, Globe,
  Mail, Phone, MapPin, Send, XCircle, CheckCircle2,
  Wrench, Sparkles, MessageSquare, Loader2, X
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store';
import './Home.css';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const testimonials = [
  { text: "Before EvoDevs, we relied on walk-ins. Now we get consistent online orders every day.", author: "Michael Chen", role: "Founder, Local Cafe", rating: 5 },
  { text: "Our trial bookings doubled in the first month. Best investment we've made.", author: "Mike Thompson", role: "Fitness First", rating: 5 },
  { text: "No-shows dropped 90%. Clients love booking themselves.", author: "Lisa Rodriguez", role: "Glow Salon", rating: 5 }
];

const PHONE = '9111005300';
const EMAIL = 'evodevs.official@gmail.com';
const INSTA = 'evodevs';

const saveCustomRequest = async (data) => {
  try {
    const { db } = await import('../firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    await addDoc(collection(db, 'customRequests'), {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to save custom request:', err);
    throw err;
  }
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { captureLead } = useStore();
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [customLoading, setCustomLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { db } = await import('../firebase');
        const { collection: col, getDocs: get, query: q, orderBy: o, limit: l } = await import('firebase/firestore');
        const queryRef = q(col(db, 'products'), o('createdAt', 'desc'), l(3));
        const snap = await get(queryRef);
        setFeaturedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.2], [0, -30]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.4], [30, 0]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' }
    })
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i = 0) => ({
      opacity: 1, scale: 1,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
    })
  };

  return (
    <div className="home-page">
      <div className="ai-breathing-border"></div>

      <section ref={heroRef} className="hero-scroll-wrapper">
        <div className="hero-sticky">
        
          <div className="hero-spline-layer">
              <Spline scene="https://prod.spline.design/WDsa2aJ-HgvwK7Mi/scene.splinecode" />
          </div>

          <div className="hero-mesh-bg">
            <div className="mesh-orb mesh-orb--1"></div>
            <div className="mesh-orb mesh-orb--2"></div>
            <div className="mesh-orb mesh-orb--3"></div>
            <div className="mesh-orb mesh-orb--4"></div>
            <div className="mesh-grid"></div>
          </div>

          <div className="hero-overlay"></div>

          <div className="hero-content">
            <div className="hero-text-center">

              <motion.div style={{ opacity: opacity1, y: y1 }} className="hero-step">
                <img src="/logo.jpg" alt="EvoDevs" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} />
                <h1 className="hero-h1">
                  We build systems that<br />
                  <span className="text-gradient">bring you customers.</span>
                </h1>
              </motion.div>

              <motion.div style={{ opacity: opacity2, y: y2 }} className="hero-step">
                <h2 className="hero-h2">
                  Websites.<br />Apps.<br />
                  <span className="text-gradient">AI automation.</span>
                </h2>
              </motion.div>
            </div>
          </div>

          <motion.div style={{ opacity: opacity1 }} className="hero-cue">
            <span>Scroll to explore</span>
            <ArrowDown size={16} />
          </motion.div>
        </div>
      </section>

      <motion.section className="stats-strip" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
        <div className="container stats-row">
          {[
            { icon: <Users size={22} />, val: '150+', lbl: 'Businesses Helped' },
            { icon: <BarChart3 size={22} />, val: '47%', lbl: 'Avg. Revenue Lift' },
            { icon: <Globe size={22} />, val: '24/7', lbl: 'System Uptime' },
            { icon: <Star size={22} />, val: '4.9', lbl: 'Client Rating' }
          ].map((s, i) => (
            <motion.div key={i} className="stat-card" variants={fadeUp} custom={i}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="how-section">
        <div className="container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">Stop Guessing. Start Growing.</h2>
            <p className="sec-sub">Most businesses struggle because they try random things. We give you a proven system that works.</p>
          </motion.div>

          <div className="steps-row">
            {[
              { num: '01', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80', title: 'Pick Your Growth System', desc: 'Choose a system designed for your business — not a generic website.', color: '#2563EB' },
              { num: '02', img: 'https://images.unsplash.com/photo-1542744173-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', title: 'We Build & Launch', desc: 'We handle everything — setup, automation, optimization.', color: '#8B5CF6' },
              { num: '03', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', title: 'Customers Start Coming', desc: 'Your system runs 24/7, bringing leads and converting them into paying customers.', color: '#06B6D4' }
            ].map((step, i) => (
              <motion.div key={i} className="step-card" style={{ backgroundImage: `url(${step.img})` }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="step-overlay"></div>
                <div className="step-card-content">
                  <div className="step-num-inline" style={{ background: step.color }}>{step.num}</div>
                  <h3 className="step-title" style={{ color: '#ffffff' }}>{step.title}</h3>
                  <p className="step-desc" style={{ color: '#f1f5f9' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="shift-section">
        <div className="container shift-container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">This is the difference.</h2>
          </motion.div>

          <div className="shift-visual">
            <motion.div className="shift-before" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="shift-box shift-box--dim">
                <div className="shift-banner">
                  <img src="https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80" alt="Without System" loading="lazy" />
                  <div className="shift-banner-overlay shift-banner-overlay--red"></div>
                </div>
                <div className="shift-box-content">
                  <div className="shift-metric"><span><XCircle color="#ef4444" size={22} /></span><div><strong>No consistent leads</strong></div></div>
                  <div className="shift-metric"><span><XCircle color="#ef4444" size={22} /></span><div><strong>Manual follow-ups</strong></div></div>
                  <div className="shift-metric"><span><XCircle color="#ef4444" size={22} /></span><div><strong>Missed opportunities</strong></div></div>
                </div>
              </div>
            </motion.div>

            <motion.div className="shift-center-arrow" initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <div className="arrow-circle"><ArrowRight size={24} /></div>
            </motion.div>

            <motion.div className="shift-after" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
              <div className="shift-box shift-box--glow">
                <div className="shift-banner">
                  <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&q=80" alt="With System" loading="lazy" />
                  <div className="shift-banner-overlay shift-banner-overlay--blue"></div>
                  <div className="shift-badge">With EvoDevs</div>
                </div>
                <div className="shift-box-content">
                  <div className="shift-metric"><span><CheckCircle2 color="#10b981" size={22} /></span><div><strong>Predictable customer flow</strong></div></div>
                  <div className="shift-metric"><span><CheckCircle2 color="#10b981" size={22} /></span><div><strong>Fully automated systems</strong></div></div>
                  <div className="shift-metric"><span><CheckCircle2 color="#10b981" size={22} /></span><div><strong>Business growing even when you're offline</strong></div></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="systems-section">
        <div className="container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">Not services. Systems.</h2>
            <p className="sec-sub">Everything works together — not separate tools.</p>
          </motion.div>

          <div className="systems-grid">
            {[
              { img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', title: 'Growth System', desc: 'Brings customers to you automatically.' },
              { img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', title: 'Automation System', desc: 'Handles follow-ups, bookings, and communication.' },
              { img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&q=80', title: 'Control System', desc: 'Shows exactly what’s working and what’s not.' }
            ].map((sys, i) => (
              <motion.div key={i} className="sys-card" style={{ backgroundImage: `url(${sys.img})` }} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="sys-overlay"></div>
                <div className="sys-card-content">
                  <h3 className="sys-title" style={{ color: '#ffffff' }}>{sys.title}</h3>
                  <p className="sys-desc" style={{ fontSize: '1rem', fontWeight: 500, color: '#f1f5f9', margin: 0 }}>{sys.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="market-section">
        <div className="container">
          <motion.div className="market-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div>
              <h2 className="sec-title">Start with a ready-made system</h2>
              <p className="sec-sub">Pick your industry. Launch faster than ever.</p>
            </div>
            <Link to="/marketplace" className="btn btn-secondary">
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="market-grid">
            {loading ? (
              <div className="text-center text-secondary py-12">Loading...</div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, idx) => (
                <motion.div key={product.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={idx}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <div className="text-center text-secondary py-12">No products yet. Add some in Admin!</div>
            )}
          </div>
        </div>
      </section>

      <section className="testi-section">
        <div className="container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">What Our Clients Say</h2>
          </motion.div>
          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <motion.div key={i} className="testi-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="testi-stars">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <blockquote className="testi-quote">"{t.text}"</blockquote>
                <div className="testi-author">
                  <div>
                    <div className="testi-name">{t.author}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="custom-section">
        <div className="container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">Need something custom?</h2>
            <p className="sec-sub">Don't see what you need? Tell us your idea — we'll build it for you.</p>
          </motion.div>

          <motion.div className="custom-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}>
            <div className="custom-icon"><Wrench size={32} /></div>
            <h3>Custom Solution</h3>
            <p>Apps, websites, AI tools, automations — if you can imagine it, we can build it. Tell us what you need and we'll make it happen.</p>
            <div className="custom-features">
              <span><Sparkles size={16} /> Custom App</span>
              <span><Wrench size={16} /> Tailored to You</span>
              <span><TrendingUp size={16} /> Scalable System</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCustomModal(true)}>
              <MessageSquare size={18} /> Request Custom Solution
            </button>
          </motion.div>
        </div>
      </section>

      {showCustomModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCustomModal(false); }}>
          <div className="modal-box">
            <button className="modal-close" onClick={() => setShowCustomModal(false)}><X size={20} /></button>
            <div className="modal-icon"><Wrench size={28} /></div>
            {customSubmitted ? (
              <div className="modal-success">
                <div className="custom-check"><CheckCircle2 size={32} /></div>
                <h3>Request Sent!</h3>
                <p>Thanks {customName}! We'll contact you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => setShowCustomModal(false)}>Close</button>
              </div>
            ) : (
              <>
                <h3>Request Custom Solution</h3>
                <p className="modal-desc">We will contact you within a few hours. Just share your name and phone.</p>
                <form onSubmit={async e => {
                  e.preventDefault();
                  setCustomLoading(true);
                  try {
                    await saveCustomRequest({ name: customName, phone: customPhone });
                    setCustomSubmitted(true);
                  } catch (err) {
                    alert('Failed to send. Please contact us directly.');
                  } finally {
                    setCustomLoading(false);
                  }
                }}>
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Phone / WhatsApp *</label>
                    <input type="tel" value={customPhone} onChange={e => setCustomPhone(e.target.value)} required placeholder="+91 9XXXXXXXXX" />
                  </div>
                  <button type="submit" className="btn btn-primary btn--full" disabled={customLoading}>
                    {customLoading ? <><Loader2 size={16} className="spin" /> Sending...</> : <><MessageSquare size={16} /> Submit Request</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <section id="contact" className="contact-section">
        <div className="container">
          <motion.div className="sec-header" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="sec-title">Let's build something that actually works.</h2>
            <p className="sec-sub">Tell us about your business. We'll show you the exact system you need.</p>
          </motion.div>

          <div className="contact-grid">
            <motion.div className="contact-info" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="contact-info-card">
                <div className="contact-item">
<div className="contact-item-icon"><Mail size={20} /></div>
                   <div>
                     <div className="contact-item-label">Email</div>
                     <div className="contact-item-value">evodevs.official@gmail.com</div>
                   </div>
                 </div>
                 <div className="contact-item">
                   <div className="contact-item-icon"><Phone size={20} /></div>
                   <div>
                     <div className="contact-item-label">Phone</div>
                     <div className="contact-item-value">+91 9111005300</div>
                   </div>
                 </div>
                 <div className="contact-item">
                   <div className="contact-item-icon"><MapPin size={20} /></div>
                   <div>
                     <div className="contact-item-label">Instagram</div>
                     <div className="contact-item-value">@evodevs</div>
                   </div>
                </div>
              </div>

              <div className="social-block">
                <div className="social-label">Follow Us</div>
                <div className="social-buttons">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn social-btn--ig" aria-label="Instagram"><InstagramIcon /></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn social-btn--tw" aria-label="Twitter"><TwitterIcon /></a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn social-btn--li" aria-label="LinkedIn"><LinkedinIcon /></a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-btn social-btn--gh" aria-label="GitHub"><GithubIcon /></a>
                </div>
              </div>
            </motion.div>

            <motion.form className="contact-form" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              onSubmit={async e => { 
                e.preventDefault();
                const form = e.target;
                const email = form['cf-email'].value;
                await captureLead(email, 'contact');
                alert('Thanks! We\'ll be in touch soon.');
                form.reset();
              }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cf-name">Your Name</label>
                  <input id="cf-name" type="text" placeholder="John Doe" required />
                </div>
                <div className="form-group">
                  <label htmlFor="cf-email">Email</label>
                  <input id="cf-email" type="email" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="cf-subject">Subject</label>
                <input id="cf-subject" type="text" placeholder="I'm interested in..." />
              </div>
              <div className="form-group">
                <label htmlFor="cf-message">Message</label>
                <textarea id="cf-message" rows="5" placeholder="Tell us about your business..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn--lg btn--full">
                Send Message <Send size={18} />
              </button>
            </motion.form>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;