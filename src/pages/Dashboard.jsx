import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Download, Settings, Clock, CheckCircle, AlertCircle, LogOut, User, ShoppingBag, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, limit, orderBy } from 'firebase/firestore';
import { formatPrice } from '../currency';
import ProductCard from '../components/ProductCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user, userData, logout, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchases');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort orders locally to bypass Firestore composite index requirements
      ordersData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const qRef = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(qRef);
        setRecommendedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Error fetching recommended:', e);
      }
    };
    fetchRecommended();
  }, []);

  useEffect(() => {
    if (searchParams.get('order') === 'pending') {
      setActiveTab('purchases');
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="auth-required">
            <User size={64} />
            <h2>Please Sign In</h2>
            <p>You need to be signed in to view your dashboard</p>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending');
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid' || o.status === 'paid');

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="user-info">
            <div className="user-avatar">
              {userData?.name?.[0] || user.email?.[0] || 'U'}
            </div>
            <div>
              <h1>{userData?.name || 'User'}</h1>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            <Package size={18} />
            My Purchases
          </button>
          <button 
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <User size={18} />
            Account
          </button>
        </div>

        {activeTab === 'purchases' && (
          <div className="dashboard-content">
            {loading ? (
              <div className="loading">Loading your dashboard...</div>
            ) : orders.length === 0 ? (
              <div className="dashboard-empty-hub">
                <div className="empty-state-banner">
                  <div className="empty-state-content">
                    <ShoppingBag size={48} />
                    <h3>Welcome to Your Dashboard!</h3>
                    <p>It looks like you don't have any active systems yet.</p>
                    <p>Evodevs specializes in custom, highly-converting growth platforms. Ready to transform your business?</p>
                    <Link to="/marketplace" className="btn btn-primary" style={{marginTop: '1rem'}}>Explore Platforms</Link>
                  </div>
                </div>
                
                {recommendedProducts.length > 0 && (
                  <div className="recommended-section" style={{marginTop: '3rem'}}>
                    <h3 className="section-title">
                      <Gift size={18} />
                      Recommended for Your Business
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem'}}>
                      {recommendedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {pendingOrders.length > 0 && (
                  <div className="orders-section">
                    <h3 className="section-title">
                      <Clock size={18} />
                      Pending Payments
                    </h3>
                    <div className="orders-grid">
                      {pendingOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}

                {paidOrders.length > 0 && (
                  <div className="orders-section">
                    <h3 className="section-title">
                      <CheckCircle size={18} />
                      Purchased Products
                    </h3>
                    <div className="orders-grid">
                      {paidOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  </div>
                )}

                {recommendedProducts.length > 0 && (
                  <div className="recommended-section" style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0'}}>
                    <h3 className="section-title">
                      <Gift size={18} />
                      Explore More Solutions
                    </h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem'}}>
                      {recommendedProducts.slice(0, 2).map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'account' && (
          <div className="dashboard-content">
            <div className="account-section">
              <h3>Account Details</h3>
              <div className="account-card">
                <div className="account-field">
                  <label>Name</label>
                  <span>{userData?.name || 'Not set'}</span>
                </div>
                <div className="account-field">
                  <label>Email</label>
                  <span>{user.email}</span>
                </div>
                <div className="account-field">
                  <label>Member Since</label>
                  <span>
                    {userData?.createdAt 
                      ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="account-section">
              <h3>Need Help?</h3>
              <p className="help-text">
                Contact our support team for any questions about your purchases or setup services.
              </p>
              <Link to="/contact" className="btn btn-secondary">Contact Support</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order }) => {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (item) => {
    setDownloading(item.productId);
    try {
      const productDoc = await import('firebase/firestore').then(({ doc, getDoc }) => getDoc(doc(db, 'products', item.productId)));
      if (productDoc.exists()) {
        const data = productDoc.data();
        if (data.projectFile) {
          window.open(data.projectFile, '_blank', 'noopener,noreferrer');
        } else {
          alert('Download file is not attached yet. Please contact support.');
        }
      } else {
        alert('Product not found.');
      }
    } catch (e) {
      console.error('Download fetch error:', e);
      alert('Error fetching download link.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isPending = order.paymentStatus === 'pending' || order.status === 'pending';

  return (
    <div className="order-card">
      <div className="order-header">
        <span className="order-date">{formatDate(order.createdAt)}</span>
        <span className={`order-status ${isPending ? 'pending' : 'paid'}`}>
          {isPending ? (
            <>
              <Clock size={14} />
              Pending Payment
            </>
          ) : (
            <>
              <CheckCircle size={14} />
              Paid
            </>
          )}
        </span>
      </div>

      <div className="order-items">
        {order.items?.map((item, idx) => (
          <div key={idx} className="order-item">
            <div className="order-item-image">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <Package size={24} />
              )}
            </div>
            <div className="order-item-info">
              <h4>{item.title}</h4>
              <span className="item-type">
                {item.type === 'self' ? 'Self Use - Download' : 'Full Setup Service'}
              </span>
              {order.paymentMethod === 'gift' && (
                <span className="gift-badge" style={{display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#8b5cf6', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.4rem', fontWeight: 600}}>
                  <Gift size={12} /> Gifted
                </span>
              )}
              {order.giftMessage && (
                <p style={{fontSize: '0.8rem', color: '#6366f1', marginTop: '0.4rem', fontStyle: 'italic', background: '#e0e7ff', padding: '0.4rem 0.6rem', borderRadius: '6px', borderLeft: '3px solid #6366f1'}}>
                  "{order.giftMessage}"
                </p>
              )}
            </div>
            <div className="order-item-price">
              {formatPrice(item.price)}
            </div>
          </div>
        ))}
      </div>

      <div className="order-footer">
        <div className="order-total">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        {isPending ? (
          <div className="order-actions pending-actions">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pending-message">
                {item.type === 'self' ? (
                  <p className="status-note code-note">
                     Code available to download within 5 minutes after verification.
                  </p>
                ) : (
                  <p className="status-note service-note">
                     Setup instructions will be sent within 24 hours after verification.
                  </p>
                )}
              </div>
            ))}
            <Link to="/contact" className="btn btn-secondary" style={{marginTop: '1rem'}}>
              Contact Support for Issues
            </Link>
          </div>
        ) : (
          <div className="order-actions">
            {order.items?.map((item, idx) => (
              <div key={idx} className="download-action">
                {item.type === 'self' ? (
                  <button 
                    className="btn-download"
                    onClick={() => handleDownload(item)}
                    disabled={downloading === item.productId}
                  >
                    {downloading === item.productId ? (
                      <>
                        <span className="spinner"></span>
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Download {item.title}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="setup-status">
                    <Settings size={16} />
                    <span>Setup in Progress</span>
                    <Link to="/contact" className="contact-link">
                      Contact Support
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
