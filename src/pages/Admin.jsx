import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, Pencil, Trash2, Upload, X, Image as ImageIcon, ArrowLeft, Save, Plus, ShoppingCart, CheckCircle, Users, XCircle, Gift, Receipt } from 'lucide-react';
import './Admin.css';
import { formatPrice } from '../currency';
import Billing from './Billing';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Admin error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="admin-layout">
          <div className="admin-main">
            <div className="admin-page">
              <h1>Something went wrong</h1>
              <p>{this.state.error?.message}</p>
              <button onClick={() => window.location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

let db = null;
let collection = null;
let addDoc = null;
let updateDoc = null;
let deleteDoc = null;
let doc = null;
let onSnapshot = null;
let serverTimestamp = null;
let query = null;
let orderBy = null;
let uploadImage = null;
let getDocs = null;


const defaultProduct = {
  title: '', result: '+25 Customers / Month', shortDescription: 'Capture leads & turn walk-ins into loyal customers.', image: '', priceSelf: '8200', priceBuilt: '41000', badge: '', category: 'app',
  heroSelf: 'Launch this system yourself in minutes', subSelf: 'Get full code, setup guide, and deploy instantly', ctaSelf: 'Download Code',
  whatYouGetSelf: 'Full source code (React + Node.js)\nStep-by-step setup guide\nDeployment instructions\n30-day support included',
  requirements: 'Basic coding knowledge\nHosting account (Vercel/Render)\n1-2 hours setup time',
  benefitsSelf: 'Full control over your system\nOne-time cost\nDeploy in under 1 hour',
  heroSetup: 'We build and launch this system for you', subSetup: 'No tech needed. We handle everything.', ctaSetup: 'Start My Setup',
  whatYouGetSetup: 'Full system customized for your business\nDomain & hosting setup\nAutomation connections\nTraining session included',
  benefitsSetup: 'No technical knowledge needed\nDone-for-you system\nFaster results',
  timeline: '3-5 days',
  results: '+25 new customers monthly\nAutomated lead capture\n24×7 system running',
  reviewText: "Transformed our customer flow. Went from 5 to 25 walk-ins daily.",
  reviewAuthor: "Sarah M., Coffee Corner",
  reviewRating: "5",
  reviewImage: "",
  onSale: false,
  salePriceSelf: '',
  salePriceBuilt: '',
  saleEndDate: '',
  saleNoTimer: true,
  projectFile: ''
};

const categories = [
  { id: 'app', label: 'App' },
  { id: 'website', label: 'Website' },
  { id: 'ai', label: 'AI' },
  { id: 'automation', label: 'Automation' }
];

const Admin = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebaseMod = await import('../firebase');
        db = firebaseMod.db;
        const firestoreMod = await import('firebase/firestore');
        collection = firestoreMod.collection;
        addDoc = firestoreMod.addDoc;
        updateDoc = firestoreMod.updateDoc;
        deleteDoc = firestoreMod.deleteDoc;
        doc = firestoreMod.doc;
        onSnapshot = firestoreMod.onSnapshot;
        serverTimestamp = firestoreMod.serverTimestamp;
        query = firestoreMod.query;
        orderBy = firestoreMod.orderBy;
        getDocs = firestoreMod.getDocs;
        const blobMod = await import('../blob');
        uploadImage = blobMod.uploadImage;
      } catch (err) {
        console.error('Firebase init error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initFirebase();
  }, []);

  if (loading) {
    return <div className="admin-layout"><div className="admin-main"><div className="admin-page"><h1>Loading...</h1></div></div></div>;
  }

  if (error || !db) {
    return (
      <div className="admin-layout">
        <div className="admin-main">
          <div className="admin-page">
            <h1>Configuration Error</h1>
            <p>{error || 'Firebase not configured'}</p>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo"><span>Admin</span></div>
        <nav className="admin-nav">
          <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}><LayoutDashboard size={18} />Dashboard</button>
          <button className={`nav-item ${currentPage === 'products' ? 'active' : ''}`} onClick={() => setCurrentPage('products')}><Package size={18} />Products</button>
          <button className={`nav-item ${currentPage === 'orders' ? 'active' : ''}`} onClick={() => setCurrentPage('orders')}><ShoppingCart size={18} />Orders</button>
          <button className={`nav-item ${currentPage === 'users' ? 'active' : ''}`} onClick={() => setCurrentPage('users')}><Users size={18} />Users</button>
          <button className={`nav-item ${currentPage === 'billing' ? 'active' : ''}`} onClick={() => setCurrentPage('billing')}><Receipt size={18} />Billing System</button>
        </nav>
        <div className="nav-bottom"><Link to="/" className="nav-item"><ArrowLeft size={18} />Back to Site</Link></div>
      </aside>
      <main className="admin-main">
        {currentPage === 'dashboard' && <DashboardHome />}
        {currentPage === 'products' && <ProductManager />}
        {currentPage === 'orders' && <OrderManager />}
        {currentPage === 'users' && <UserManager />}
        {currentPage === 'billing' && <Billing db={db} collection={collection} addDoc={addDoc} updateDoc={updateDoc} deleteDoc={deleteDoc} doc={doc} onSnapshot={onSnapshot} serverTimestamp={serverTimestamp} query={query} orderBy={orderBy} getDocs={getDocs} />}
      </main>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState({ products: 0, users: 0, revenue: 0, pending: 0, totalOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  React.useEffect(() => {
    const unsubP = onSnapshot(collection(db, 'products'), (s) => setStats(p => ({ ...p, products: s.size })));
    const unsubU = onSnapshot(collection(db, 'users'), (s) => setStats(p => ({ ...p, users: s.size })));
    
    // Process orders for revenue, pending count, and recent list
    const unsubO = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => {
      let rev = 0;
      let pend = 0;
      const ordersData = [];
      s.forEach(doc => {
        const data = doc.data();
        if (data.paymentStatus === 'paid' || data.status === 'paid') {
          rev += Number(data.total) || 0;
        } else if (data.paymentStatus === 'pending' || data.status === 'pending') {
          pend++;
        }
        ordersData.push({ id: doc.id, ...data });
      });
      setStats(p => ({ ...p, revenue: rev, pending: pend, totalOrders: s.size }));
      setRecentOrders(ordersData.slice(0, 5));
    });

    return () => { unsubP(); unsubU(); unsubO(); };
  }, []);

  return (
    <div className="admin-page">
      <div className="page-header"><h1 className="page-title">Business Overview</h1></div>
      
      <div className="stats-grid" style={{marginBottom: '2rem'}}>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#4f46e5'}}>{formatPrice(stats.revenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: stats.pending > 0 ? '#f59e0b' : 'inherit'}}>{stats.pending}</div>
          <div className="stat-label">Action Required (Pending)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.products}</div>
          <div className="stat-label">Active Products</div>
        </div>
      </div>

      <div className="recent-orders-section">
        <h2 className="page-title" style={{fontSize: '1.2rem'}}>Recent Orders</h2>
        <div className="items-list">
          {recentOrders.length === 0 && <p className="empty">No recent orders found.</p>}
          {recentOrders.map(order => (
             <div key={order.id} className="list-item" style={{borderLeft: (order.paymentStatus === 'paid' || order.status === 'paid') ? '4px solid #10b981' : '4px solid #f59e0b', display: 'flex', flexDirection: 'column'}}>
               <div className="list-item-header" style={{width: '100%', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                 <strong>{order.userEmail || 'Unknown User'}</strong>
                 <span className="item-category-badge" style={{background: (order.paymentStatus === 'paid' || order.status === 'paid') ? '#10b981' : '#f59e0b', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem'}}>
                   {(order.paymentStatus || order.status || 'Unknown').toUpperCase()}
                 </span>
               </div>
               <div className="list-item-content">
                  <p style={{marginTop: 0}}>Amount: <strong>{formatPrice(order.total)}</strong> • Method: {order.paymentMethod?.toUpperCase() || 'N/A'}</p>
                  <p style={{fontSize: '0.75rem'}}>Date: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingReview, setUploadingReview] = useState(false);
  const [uploadingProject, setUploadingProject] = useState(false);
  const [form, setForm] = useState({ ...defaultProduct });

  React.useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (s) => { setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return () => { if (unsub) unsub(); };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, image: url }));
    } catch (err) { console.error('Upload error:', err); }
    setUploading(false);
  };

  const handleReviewImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingReview(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, reviewImage: url }));
    } catch (err) { console.error('Upload error:', err); }
    setUploadingReview(false);
  };

  const handleProjectFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingProject(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, projectFile: url }));
    } catch (err) { console.error('Upload error:', err); }
    setUploadingProject(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { 
        ...form, 
        priceSelf: Number(form.priceSelf), 
        priceBuilt: Number(form.priceBuilt),
        salePriceSelf: form.salePriceSelf ? Number(form.salePriceSelf) : null,
        salePriceBuilt: form.salePriceBuilt ? Number(form.salePriceBuilt) : null,
        createdAt: serverTimestamp()
      };
      if (editingItem?.id) await updateDoc(doc(db, 'products', editingItem.id), data);
      else await addDoc(collection(db, 'products'), data);
      setForm({ ...defaultProduct }); setIsAdding(false); setEditingItem(null);
    } catch (err) { console.error('Save error:', err); }
  };

  const handleEdit = (p) => {
    setEditingItem(p);
    setForm({
      ...p,
      onSale: p.onSale || false,
      salePriceSelf: p.salePriceSelf || '',
      salePriceBuilt: p.salePriceBuilt || '',
      saleEndDate: p.saleEndDate || '',
      saleNoTimer: p.saleNoTimer !== false,
      whatYouGetSelf: Array.isArray(p.whatYouGetSelf) ? p.whatYouGetSelf.join('\n') : (p.whatYouGetSelf || ''),
      requirements: Array.isArray(p.requirements) ? p.requirements.join('\n') : (p.requirements || ''),
      benefitsSelf: Array.isArray(p.benefitsSelf) ? p.benefitsSelf.join('\n') : (p.benefitsSelf || ''),
      whatYouGetSetup: Array.isArray(p.whatYouGetSetup) ? p.whatYouGetSetup.join('\n') : (p.whatYouGetSetup || ''),
      benefitsSetup: Array.isArray(p.benefitsSetup) ? p.benefitsSetup.join('\n') : (p.benefitsSetup || ''),
      results: Array.isArray(p.results) ? p.results.join('\n') : (p.results || ''),
    });
    setIsAdding(true);
  };

  const handleDelete = async (product) => { 
    if (confirm('Delete this product completely? This will also remove all images.')) {
      try {
        // Delete images from Blob if they exist
        if (product.image) {
          try {
            const { del } = await import('@vercel/blob');
            await del(product.image);
          } catch (e) { console.log('Could not delete product image'); }
        }
        if (product.reviewImage) {
          try {
            const { del } = await import('@vercel/blob');
            await del(product.reviewImage);
          } catch (e) { console.log('Could not delete review image'); }
        }
        if (product.projectFile) {
          try {
            const { del } = await import('@vercel/blob');
            await del(product.projectFile);
          } catch (e) { console.log('Could not delete project file'); }
        }
        // Delete from Firestore
        await deleteDoc(doc(db, 'products', product.id));
      } catch (err) {
        console.error('Delete error:', err);
        alert('Error deleting product');
      }
    }
  };

  const handleAddNew = () => {
    setForm({ ...defaultProduct, image: '', reviewImage: '' });
    setEditingItem(null);
    setIsAdding(true);
  };

  if (isAdding) {
    return (
      <div className="admin-page">
        <div className="form-header">
          <h1 className="page-title">{editingItem ? 'Edit Product' : 'Add Product'}</h1>
          <button className="btn-cancel" onClick={() => { setIsAdding(false); setEditingItem(null); }}><X size={18} />Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-section"><h3>Product Image</h3>
            <div className="form-group">
              <div className="image-upload">
                {form.image ? (
                  <div className="image-preview large"><img src={form.image} alt="Preview" /><button type="button" onClick={() => setForm(p => ({...p, image: ''}))}><X size={16} /></button></div>
                ) : (
                  <label className="upload-btn" htmlFor="prod-img-in"><Upload size={24} /><span>Upload Product Image</span><input id="prod-img-in" type="file" accept="image/*" onChange={handleImageUpload} hidden /></label>
                )}
                {uploading && <span className="uploading">Uploading...</span>}
              </div>
            </div>
          </div>

          <div className="form-section"><h3>Basic Info</h3>
            <div className="form-row">
              <div className="form-group"><label>Product Title *</label><input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Cafe Growth System" required /></div>
              <div className="form-group"><label>Badge</label><input type="text" value={form.badge} onChange={e => setForm(p => ({...p, badge: e.target.value}))} placeholder="Most Popular" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Result (shown on image)</label><input type="text" value={form.result} onChange={e => setForm(p => ({...p, result: e.target.value}))} placeholder="+25 Customers / Month" /></div>
              <div className="form-group"><label>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Short Description</label><textarea rows={2} value={form.shortDescription} onChange={e => setForm(p => ({...p, shortDescription: e.target.value}))} placeholder="Capture leads & turn walk-ins into loyal customers." /></div>
            <div className="form-row">
              <div className="form-group"><label>Price (Self Use) in Rupees</label><input type="number" value={form.priceSelf} onChange={e => setForm(p => ({...p, priceSelf: e.target.value}))} placeholder="e.g. 8200" /></div>
              <div className="form-group"><label>Price (Full Setup) in Rupees</label><input type="number" value={form.priceBuilt} onChange={e => setForm(p => ({...p, priceBuilt: e.target.value}))} placeholder="e.g. 49900" /></div>
            </div>
            <div className="form-row" style={{ alignItems: 'center', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="onSale" checked={form.onSale} onChange={e => setForm(p => ({...p, onSale: e.target.checked}))} style={{ width: 'auto' }} />
                <label htmlFor="onSale" style={{ marginBottom: 0 }}>Enable Sale</label>
              </div>
            </div>
            {form.onSale && (
              <div className="form-row">
                <div className="form-group"><label>Sale Price - Self Use (₹)</label><input type="number" value={form.salePriceSelf} onChange={e => setForm(p => ({...p, salePriceSelf: e.target.value}))} placeholder="e.g. 5900" /></div>
                <div className="form-group"><label>Sale Price - Full Setup (₹)</label><input type="number" value={form.salePriceBuilt} onChange={e => setForm(p => ({...p, salePriceBuilt: e.target.value}))} placeholder="e.g. 29900" /></div>
              </div>
            )}
            {form.onSale && (
              <div className="form-row" style={{ alignItems: 'center', gap: '1rem' }}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="saleNoTimer" checked={form.saleNoTimer || false} onChange={e => setForm(p => ({...p, saleNoTimer: e.target.checked}))} style={{ width: 'auto' }} />
                  <label htmlFor="saleNoTimer" style={{ marginBottom: 0 }}>No countdown timer (manual off)</label>
                </div>
                {!form.saleNoTimer && (
                  <div className="form-group"><label>Sale Ends On</label><input type="datetime-local" value={form.saleEndDate} onChange={e => setForm(p => ({...p, saleEndDate: e.target.value}))} /></div>
                )}
              </div>
            )}
          </div>

          <div className="form-section"><h3>Self Use Mode</h3>
            <div className="form-group">
              <label>Project File (Code ZIP/PDF)</label>
              <div className="image-upload" style={{marginBottom: '1rem'}}>
                {form.projectFile ? (
                  <div className="image-preview" style={{padding: '0.5rem', background: '#f1f5f9', borderRadius: '8px', wordBreak: 'break-all'}}>
                    <a href={form.projectFile} target="_blank" rel="noreferrer">View Uploaded File</a>
                    <button type="button" onClick={() => setForm(p => ({...p, projectFile: ''}))} style={{marginLeft: '1rem'}}><X size={16} /></button>
                  </div>
                ) : (
                  <label className="upload-btn" htmlFor="proj-file-in">
                    <Upload size={20} /><span>Upload Project ZIP/File</span>
                    <input id="proj-file-in" type="file" onChange={handleProjectFileUpload} hidden />
                  </label>
                )}
                {uploadingProject && <span className="uploading">Uploading...</span>}
              </div>
            </div>
            <div className="form-group"><label>Hero Headline</label><input type="text" value={form.heroSelf} onChange={e => setForm(p => ({...p, heroSelf: e.target.value}))} /></div>
            <div className="form-group"><label>Hero Subtext</label><input type="text" value={form.subSelf} onChange={e => setForm(p => ({...p, subSelf: e.target.value}))} /></div>
            <div className="form-group"><label>CTA Button</label><input type="text" value={form.ctaSelf} onChange={e => setForm(p => ({...p, ctaSelf: e.target.value}))} /></div>
            <div className="form-group"><label>What You Get (one per line)</label><textarea rows={4} value={form.whatYouGetSelf} onChange={e => setForm(p => ({...p, whatYouGetSelf: e.target.value}))} /></div>
            <div className="form-group"><label>Requirements (one per line)</label><textarea rows={3} value={form.requirements} onChange={e => setForm(p => ({...p, requirements: e.target.value}))} /></div>
            <div className="form-group"><label>Benefits (one per line)</label><textarea rows={3} value={form.benefitsSelf} onChange={e => setForm(p => ({...p, benefitsSelf: e.target.value}))} /></div>
          </div>

          <div className="form-section"><h3>Full Setup Mode</h3>
            <div className="form-group"><label>Hero Headline</label><input type="text" value={form.heroSetup} onChange={e => setForm(p => ({...p, heroSetup: e.target.value}))} /></div>
            <div className="form-group"><label>Hero Subtext</label><input type="text" value={form.subSetup} onChange={e => setForm(p => ({...p, subSetup: e.target.value}))} /></div>
            <div className="form-group"><label>CTA Button</label><input type="text" value={form.ctaSetup} onChange={e => setForm(p => ({...p, ctaSetup: e.target.value}))} /></div>
            <div className="form-group"><label>What We Do (one per line)</label><textarea rows={4} value={form.whatYouGetSetup} onChange={e => setForm(p => ({...p, whatYouGetSetup: e.target.value}))} /></div>
            <div className="form-group"><label>Timeline</label><input type="text" value={form.timeline} onChange={e => setForm(p => ({...p, timeline: e.target.value}))} /></div>
            <div className="form-group"><label>Why This Works (one per line)</label><textarea rows={3} value={form.benefitsSetup} onChange={e => setForm(p => ({...p, benefitsSetup: e.target.value}))} /></div>
          </div>

          <div className="form-section"><h3>Results & Review</h3>
            <div className="form-group"><label>Results (one per line)</label><textarea rows={3} value={form.results} onChange={e => setForm(p => ({...p, results: e.target.value}))} /></div>
            <div className="form-group"><label>Review Rating</label>
              <select value={form.reviewRating} onChange={e => setForm(p => ({...p, reviewRating: e.target.value}))}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div className="form-group"><label>Review Text</label><textarea rows={2} value={form.reviewText} onChange={e => setForm(p => ({...p, reviewText: e.target.value}))} placeholder="Great experience!" /></div>
            <div className="form-group"><label>Review Author</label><input type="text" value={form.reviewAuthor} onChange={e => setForm(p => ({...p, reviewAuthor: e.target.value}))} placeholder="John, Coffee Shop" /></div>
            <div className="form-group">
              <label>Review Image (optional)</label>
              <div className="image-upload small">
                {form.reviewImage ? (
                  <div className="image-preview small"><img src={form.reviewImage} alt="Review" /><button type="button" onClick={() => setForm(p => ({...p, reviewImage: ''}))}><X size={14} /></button></div>
                ) : (
                  <label className="upload-btn small" htmlFor="review-img-in"><Upload size={18} /><span>Add Image</span><input id="review-img-in" type="file" accept="image/*" onChange={handleReviewImageUpload} hidden /></label>
                )}
                {uploadingReview && <span className="uploading">Uploading...</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit full"><Save size={18} />{editingItem ? 'Update Product' : 'Add Product'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header"><h1 className="page-title">Products & Reviews</h1><button className="btn-add" onClick={handleAddNew}><Plus size={18} />Add Product</button></div>
      <div className="items-grid">
        {products.map(p => (
          <div key={p.id} className="item-card">
            <div className="item-image">{p.image ? <img src={p.image} alt={p.title} /> : <ImageIcon />}</div>
            <div className="item-content">
              <div className="item-badge-row">
                <span className="item-category-badge">{categories.find(c => c.id === p.category)?.label || p.category}</span>
                {p.badge && <span className="item-feature-badge">{p.badge}</span>}
              </div>
              <h3>{p.title}</h3>
              <p>{p.result}</p>
              <div className="item-meta"><span>{formatPrice(p.priceSelf)}</span><span>{formatPrice(p.priceBuilt)}</span></div>
              {p.reviewText && (
                <div className="item-review">
                  <span className="stars">{"★".repeat(p.reviewRating || 5)}</span>
                  <p>"{p.reviewText}"</p>
                  <small>— {p.reviewAuthor}</small>
                </div>
              )}
            </div>
            <div className="item-actions">
              <button onClick={() => handleEdit(p)}><Pencil size={16} /></button>
              <button onClick={() => handleDelete(p)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="empty">No products yet. Click "Add Product" to create one.</p>}
      </div>
    </div>
  );
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return unsub;
  }, []);

  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm("Confirm payment is received and update order status to PAID?")) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'paid',
        paymentStatus: 'paid'
      });
    } catch(err) { console.error(err); alert('Failed to update order.'); }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Reject this payment?")) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'rejected',
        paymentStatus: 'rejected'
      });
    } catch(err) { console.error(err); }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Permanently delete this order record?")) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch(err) { console.error(err); }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Order Confirmations</h2>
        <p>Review user payments and manual UI/Contact transactions here.</p>
      </div>
      <div className="admin-grid" style={{gridTemplateColumns: '1fr', gap: '1rem'}}>
        {orders.length === 0 && <p>No orders found.</p>}
        {orders.map(order => (
          <div key={order.id} className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: order.paymentStatus === 'paid' ? '4px solid #10b981' : '4px solid #f59e0b', paddingLeft: '1.25rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{fontSize: '1.1rem', marginBottom: '0.2rem'}}>{order.userEmail}</h3>
                <p style={{color: '#64748b', fontSize: '0.85rem'}}><strong>Method:</strong> {order.paymentMethod?.toUpperCase() || 'Contact'} | <strong>Ref:</strong> {order.paymentReference || 'N/A'}</p>
                <p style={{color: '#64748b', fontSize: '0.85rem'}}><strong>Total:</strong> {formatPrice(order.total)}</p>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end'}}>
                {order.paymentStatus === 'pending' ? (
                  <>
                    <button onClick={() => handleConfirmOrder(order.id)} style={{background: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.8rem'}}>
                      <CheckCircle size={14} /> Verify
                    </button>
                    <button onClick={() => handleRejectOrder(order.id)} style={{background: '#f43f5e', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.8rem'}}>
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                ) : (
                  <span style={{background: order.paymentStatus === 'rejected' ? '#ffe4e6' : '#dcfce7', color: order.paymentStatus === 'rejected' ? '#e11d48' : '#15803d', padding: '0.3rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600}}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                )}
                <button onClick={() => handleDeleteOrder(order.id)} style={{color: '#94a3b8', background: 'none', border: 'none', display: 'flex', gap: '0.2rem', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline'}}>
                  <Trash2 size={12} /> Delete Order
                </button>
              </div>
            </div>
            
            <div style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0'}}>
              <p style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '0.2rem'}}>Purchased Items:</p>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{fontSize: '0.85rem', color: '#334155'}}>• {item.title} ({item.type === 'self' ? 'Use it myself' : 'Set it up for me'})</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [giftUserId, setGiftUserId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => setUsers(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubP = onSnapshot(collection(db, 'products'), (snap) => setProducts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubO = onSnapshot(collection(db, 'orders'), (snap) => setOrders(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsub(); unsubP(); unsubO(); };
  }, []);

  const handleGiftItem = async () => {
    if (!selectedProductId || !giftUserId) return;
    const prod = products.find(p => p.id === selectedProductId);
    const userSnap = users.find(u => u.id === giftUserId);
    if (!prod || !userSnap) return;

    try {
      await addDoc(collection(db, 'orders'), {
        userId: userSnap.id,
        userEmail: userSnap.email,
        items: [{
          productId: prod.id,
          title: prod.title,
          type: 'self',
          price: 0,
          image: prod.image || ''
        }],
        total: 0,
        status: 'paid',
        paymentStatus: 'paid',
        paymentMethod: 'gift',
        giftMessage: giftMessage.trim() || '',
        createdAt: serverTimestamp()
      });
      alert('Item successfully gifted to ' + userSnap.email);
      setGiftUserId(null);
      setGiftMessage('');
    } catch(e) {
      console.error(e);
      alert('Failed to drop gift.');
    }
  };

  const handleRevokeOrder = async (orderId) => {
    if (!window.confirm("Permanently revoke this item from the user's dashboard?")) return;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch(e) {
      console.error(e);
      alert('Failed to revoke item.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Users Management</h2>
        <p>Review users, view what products they own, and manually gift or revoke items securely.</p>
      </div>

      <div className="admin-grid" style={{gridTemplateColumns: '1fr', gap: '1rem'}}>
        {users.map(u => {
          const userProducts = orders.filter(o => o.userId === u.id && (o.paymentStatus === 'paid' || o.status === 'paid'));
          
          return (
            <div key={u.id} className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <h3 style={{fontSize: '1.2rem'}}>{u.name || 'Unnamed User'}</h3>
                  <p style={{fontSize: '0.85rem', color: '#64748b'}}>{u.email}</p>
                </div>
                {giftUserId === u.id ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end'}}>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} style={{padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem'}}>
                        <option value="">-- Select Product --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                      <button onClick={handleGiftItem} style={{background: '#8b5cf6', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600}}>
                        <CheckCircle size={14} /> Send Gift
                      </button>
                      <button onClick={() => { setGiftUserId(null); setGiftMessage(''); }} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'}}><X size={16} /></button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Short message (e.g. Thanks for subscribing!)" 
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      style={{padding: '0.4rem 0.6rem', width: '100%', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', maxWidth: '300px'}}
                    />
                  </div>
                ) : (
                  <button 
                    onClick={() => { setGiftUserId(u.id); setSelectedProductId(''); setGiftMessage(''); }}
                    style={{background: '#f1f5f9', color: '#8b5cf6', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: '500', fontSize: '0.85rem'}}
                  >
                    <Gift size={16} /> Gift Product
                  </button>
                )}
              </div>

              <div style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9'}}>
                <h4 style={{fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem'}}>OWNED PRODUCTS</h4>
                {userProducts.length === 0 ? (
                  <p style={{fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic'}}>User hasn't acquired anything yet.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {userProducts.map(order => (
                      <div key={order.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px'}}>
                        <div>
                          {order.items?.map((item, i) => (
                            <span key={i} style={{fontWeight: 500, fontSize: '0.9rem', color: '#334155', display: 'block'}}>{item.title}</span>
                          ))}
                          {order.giftMessage && <span style={{fontSize: '0.75rem', color: '#6366f1', display: 'block', marginTop: '0.2rem'}}>Gift Msg: "{order.giftMessage}"</span>}
                          <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>Method: {order.paymentMethod?.toUpperCase()}</span>
                        </div>
                        <button onClick={() => handleRevokeOrder(order.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: 600}}>
                          <Trash2 size={12} /> Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Admin;