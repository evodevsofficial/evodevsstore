import React, { useState, useEffect, useRef } from 'react';
import { Receipt, Search, Plus, Trash2, Edit, X, Save, Download, FileText, ChevronDown, CheckCircle, ChevronRight, User, AlertTriangle } from 'lucide-react';
import './Billing.css';
import { formatPrice } from '../currency';

const Billing = ({ db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, getDocs }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const fs = { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, getDocs };

  return (
    <div className="billing-module">
      <div className="billing-nav">
        <button className={`bnav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={`bnav-item ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>Bills</button>
        <button className={`bnav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Billing Products</button>
        <button className={`bnav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clients</button>
        <button className={`bnav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>
      
      <div className="billing-content">
        {activeTab === 'dashboard' && <BillingDashboard fs={fs} />}
        {activeTab === 'bills' && <BillingBills fs={fs} />}
        {activeTab === 'products' && <BillingProducts fs={fs} />}
        {activeTab === 'clients' && <BillingClients fs={fs} />}
        {activeTab === 'settings' && <BillingSettings fs={fs} />}
      </div>
    </div>
  );
};

// 1. Dashboard
const BillingDashboard = ({ fs }) => {
  const { db, collection, onSnapshot, query, orderBy } = fs;
  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubB = onSnapshot(query(collection(db, 'bills'), orderBy('createdAt', 'desc')), s => setBills(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubC = onSnapshot(collection(db, 'billingClients'), s => setClients(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubB(); unsubC(); };
  }, []);

  const totalRevenue = bills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  
  const filteredBills = bills.filter(b => {
    if (!searchQuery) return true;
    const client = clients.find(c => c.id === b.clientId);
    const q = searchQuery.toLowerCase();
    const phone = client?.phone || '';
    const name = client?.name?.toLowerCase() || '';
    return phone.includes(q) || name.includes(q) || b.billNumber?.toLowerCase().includes(q);
  });

  return (
    <div className="billing-page">
      <h2 className="bp-title">Billing Dashboard</h2>
      
      <div className="stats-grid bp-stats">
        <div className="stat-card">
          <div className="stat-value">{formatPrice(totalRevenue)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{clients.length}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bills.length}</div>
          <div className="stat-label">Total Bills</div>
        </div>
      </div>

      <div className="bp-section">
        <div className="bp-section-header">
          <h3>Recent Bills</h3>
          <div className="bp-search">
            <Search size={16} />
            <input type="text" placeholder="Search by phone, name or bill #" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        <div className="bp-list">
          {filteredBills.length === 0 && <p className="empty-text">No bills found.</p>}
          {filteredBills.map(b => {
            const client = clients.find(c => c.id === b.clientId);
            return (
              <div key={b.id} className="bp-list-item">
                <div>
                  <h4>{b.billNumber}</h4>
                  <p>{client ? `${client.name} (${client.phone})` : 'Unknown Client'}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className="bp-amount">{formatPrice(b.totalAmount)}</span>
                  <p style={{fontSize: '0.8rem', color: '#64748b'}}>{b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : 'Just now'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 2. Bills system (creation and list)
const BillingBills = ({ fs }) => {
  const { db, doc, collection, onSnapshot, query, orderBy, deleteDoc } = fs;
  const [bills, setBills] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [clients, setClients] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const unsubB = onSnapshot(query(collection(db, 'bills'), orderBy('createdAt', 'desc')), s => setBills(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubC = onSnapshot(collection(db, 'billingClients'), s => setClients(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubS = onSnapshot(doc(db, 'billingSettings', 'main'), d => {
      if (d.exists()) setSettings(d.data());
    });
    return () => { unsubB(); unsubC(); unsubS(); };
  }, []);

  const getNextBillNumber = () => {
    const year = new Date().getFullYear();
    const prefix = `EVODEVS-${year}-`;
    const yearBills = bills.filter(b => b.billNumber && b.billNumber.startsWith(prefix));
    
    if (yearBills.length === 0) return `${prefix}0001`;
    
    // find max
    let max = 0;
    yearBills.forEach(b => {
      const parts = b.billNumber.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > max) max = num;
    });
    
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  };

  const handleDeleteBill = async (billId, billNumber) => {
    if (!window.confirm(`Permanently delete bill "${billNumber}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'bills', billId));
      alert('Bill deleted.');
    } catch(e) {
      console.error(e);
      alert('Failed to delete bill.');
    }
  };

  return (
    <div className="billing-page">
      {!isCreating ? (
        <>
          <div className="bp-section-header">
            <h2 className="bp-title">All Bills</h2>
            <button className="bp-btn bp-btn-primary" onClick={() => setIsCreating(true)}><Plus size={16} /> Create Bill</button>
          </div>
          <div className="bp-list">
            {bills.length === 0 && <p className="empty-text">No bills created yet.</p>}
            {bills.map(b => {
              const client = clients.find(c => c.id === b.clientId);
              return (
                <div key={b.id} className="bp-list-item">
                  <div>
                    <h4>{b.billNumber}</h4>
                    <p>{client?.name || 'Unknown'} - {client?.phone || ''}</p>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span className="bp-amount">{formatPrice(b.totalAmount)}</span>
                    <button 
                      onClick={() => handleDeleteBill(b.id, b.billNumber)}
                      style={{background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500}}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <CreateBillFlow 
          onCancel={() => setIsCreating(false)} 
          clients={clients} 
          nextBillNumber={getNextBillNumber()} 
          settings={settings}
          fs={fs}
        />
      )}
    </div>
  );
};

const CreateBillFlow = ({ onCancel, clients, nextBillNumber, settings, fs }) => {
  const { db, collection, addDoc, serverTimestamp, getDocs } = fs;
  // Step 1: Client
  const [phone, setPhone] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClientData, setNewClientData] = useState({ name: '', businessName: '', email: '' });
  
  // Step 2: Products
  const [websiteProducts, setWebsiteProducts] = useState([]);
  const [customProducts, setCustomProducts] = useState([]);
  const [useWebsiteProds, setUseWebsiteProds] = useState(false);
  
  // Cart
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // UI States
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [savedBillId, setSavedBillId] = useState(null);
  
  const invoiceRef = useRef(null);

  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => setWebsiteProducts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    getDocs(collection(db, 'billingProducts')).then(snap => setCustomProducts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const handlePhoneSearch = (e) => {
    e.preventDefault();
    if (!phone) return;
    const existing = clients.find(c => c.phone === phone);
    if (existing) {
      setSelectedClient(existing);
      setStep(2);
    } else {
      setSelectedClient(null);
      setStep(1.5); // collect new relative
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, 'billingClients'), {
      ...newClientData,
      phone,
      createdAt: serverTimestamp()
    });
    setSelectedClient({ id: docRef.id, phone, ...newClientData });
    setStep(2);
  };

  const addItemToCart = (prod, isWebsite) => {
    const existingIndex = items.findIndex(i => i.id === prod.id && i.isWebsite === isWebsite);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].qty += 1;
      newItems[existingIndex].total = newItems[existingIndex].qty * newItems[existingIndex].price;
      setItems(newItems);
    } else {
      let price = isWebsite ? (prod.priceSelf || prod.priceBuilt || 0) : (prod.price || 0);
      setItems([...items, {
        id: prod.id,
        isWebsite,
        name: isWebsite ? `${prod.title} (Synced)` : prod.name,
        price: Number(price),
        qty: 1,
        total: Number(price)
      }]);
    }
  };

  const updateItemQty = (idx, qty) => {
    if (qty <= 0) {
      setItems(items.filter((_, i) => i !== idx));
      return;
    }
    const newItems = [...items];
    newItems[idx].qty = qty;
    newItems[idx].total = qty * newItems[idx].price;
    setItems(newItems);
  };

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const totalAmount = Math.max(0, subtotal - Number(discount));

  const handleSaveBill = async () => {
    if (savedBillId) return; // already saved
    try {
      const billData = {
        clientId: selectedClient.id,
        items,
        subtotal,
        discount: Number(discount),
        totalAmount,
        paymentMethod,
        billNumber: nextBillNumber,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'bills'), billData);
      setSavedBillId(docRef.id);
    } catch (err) {
      console.error(err);
      alert('Error saving bill');
    }
  };

  const generateHTML = () => {
    if (!invoiceRef.current) return;
    const htmlContent = invoiceRef.current.outerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${nextBillNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            #invoice { border-radius: 0 !important; box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .no-print { display: none !important; }
          }
          body { 
            font-family: 'Inter', sans-serif; 
            background: #f1f5f9; 
            padding: 40px 20px; 
            color: #1e293b;
            line-height: 1.5;
          }
          #invoice { 
            max-width: 850px; 
            margin: 0 auto; 
            background: #fff; 
            padding: 60px; 
            border-radius: 16px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
          }
          .inv-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 30px; margin-bottom: 40px; }
          .inv-company h1 { margin: 0 0 10px 0; color: #0f172a; font-size: 28px; letter-spacing: -0.5px; }
          .inv-logo { max-width: 180px; max-height: 70px; margin-bottom: 15px; object-fit: contain; }
          .inv-co-details p { margin: 4px 0; font-size: 14px; color: #64748b; }
          .inv-meta h2 { margin: 0 0 10px 0; color: #4f46e5; text-align: right; letter-spacing: 3px; font-size: 24px; text-transform: uppercase; }
          .inv-meta p { margin: 4px 0; text-align: right; font-size: 14px; font-weight: 500; }
          .inv-bill-to { margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .inv-bill-to h3 { color: #4f46e5; margin: 0 0 15px 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
          .inv-bill-to p { margin: 4px 0; font-size: 15px; }
          .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .inv-table th { background: #f8fafc; padding: 15px; font-size: 13px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; font-weight: 600; text-align: left; }
          .inv-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
          .inv-summary { width: 350px; margin-left: auto; margin-bottom: 50px; background: #f8fafc; padding: 20px; border-radius: 8px; }
          .inv-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 15px; }
          .inv-row.total { border-top: 2px solid #e2e8f0; font-size: 20px; font-weight: 700; color: #0f172a; padding-top: 15px; margin-top: 5px; }
          .inv-footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 30px; color: #64748b; font-size: 14px; }
          .btn-print { display: block; margin: 0 auto 30px auto; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; text-align: center; max-width: 200px; font-weight: 600; }
          .btn-print:hover { background: #4338ca; }
        </style>
      </head>
      <body>
        <button class="no-print btn-print" onclick="window.print()">Print or Save as PDF</button>
        ${htmlContent}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${nextBillNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="create-bill-flow">
      <div className="flow-header">
        <h3>Create New Bill <span className="bill-tag">{nextBillNumber}</span></h3>
        <button className="bp-btn bp-btn-icon" onClick={onCancel}><X size={18} /></button>
      </div>

      <div className="flow-body">
        <div className="flow-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Client details</div>
          <div className="step-sep"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Add Products</div>
        </div>

        {step === 1 && (
          <form className="flow-panel" onSubmit={handlePhoneSearch}>
            <h4>Enter Client Phone Number</h4>
            <div className="bp-search" style={{marginBottom: '1rem'}}>
              <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
              <button type="submit" className="bp-btn bp-btn-primary">Search / Next</button>
            </div>
            <p className="bp-hint">If phone is found, client will auto-load. If not, you can create a new client profile.</p>
          </form>
        )}

        {step === 1.5 && (
          <form className="flow-panel" onSubmit={handleCreateClient}>
            <h4>Create New Client</h4>
            <div className="form-group row">
              <label>Phone Number *</label>
              <input type="text" value={phone} disabled className="bp-input disabled" />
            </div>
            <div className="form-group row">
              <label>Full Name *</label>
              <input type="text" value={newClientData.name} onChange={e => setNewClientData({...newClientData, name: e.target.value})} className="bp-input" required />
            </div>
            <div className="form-group row">
              <label>Business Name (Optional)</label>
              <input type="text" value={newClientData.businessName} onChange={e => setNewClientData({...newClientData, businessName: e.target.value})} className="bp-input" />
            </div>
            <div className="form-group row">
              <label>Email (Optional)</label>
              <input type="email" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="bp-input" />
            </div>
            <button type="submit" className="bp-btn bp-btn-primary full">Save Client & Continue</button>
            <button type="button" className="bp-btn bp-btn-text full" onClick={() => setStep(1)}>Back</button>
          </form>
        )}

        {step >= 2 && (
          <div className="flow-split">
            <div className="flow-left">
              <div className="bp-products-toggle">
                <button className={`toggle-btn ${!useWebsiteProds ? 'active' : ''}`} onClick={() => setUseWebsiteProds(false)}>Custom Products</button>
                <button className={`toggle-btn ${useWebsiteProds ? 'active' : ''}`} onClick={() => setUseWebsiteProds(true)}>Website Products</button>
              </div>
              
              <div className="bp-prod-list">
                {!useWebsiteProds && customProducts.map(p => (
                  <div key={p.id} className="bp-prod-card" onClick={() => addItemToCart(p, false)}>
                    <div><strong>{p.name}</strong><br/><small>{p.category}</small></div>
                    <div className="bp-amount">{formatPrice(p.price)}</div>
                  </div>
                ))}
                {useWebsiteProds && websiteProducts.map(p => (
                  <div key={p.id} className="bp-prod-card" onClick={() => addItemToCart(p, true)}>
                    <div><strong>{p.title}</strong><br/><small>{p.category}</small></div>
                    <div className="bp-amount">{formatPrice(p.priceSelf || p.priceBuilt)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flow-right">
              <div className="bp-cart">
                <div className="bp-cart-client">
                  <User size={16}/> <strong>{selectedClient.name}</strong> ({selectedClient.phone})
                  <button className="bp-btn-text small" onClick={() => {setStep(1); setSelectedClient(null); setItems([]);}}>Change</button>
                </div>
                
                <h4 style={{marginTop: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem'}}>Bill Items</h4>
                {items.length === 0 ? <p className="empty-text">Click products to add to bill</p> : (
                  <table className="bp-cart-table">
                    <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.name} <br/><small style={{color: '#94a3b8'}}>{formatPrice(it.price)} each</small></td>
                          <td>
                            <div className="bp-qty-ctrl">
                              <button onClick={() => updateItemQty(idx, it.qty - 1)}>-</button>
                              <span>{it.qty}</span>
                              <button onClick={() => updateItemQty(idx, it.qty + 1)}>+</button>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}}>{formatPrice(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {items.length > 0 && (
                  <div className="bp-cart-summary">
                    <div className="summary-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="summary-row">
                      <span>Discount (₹)</span>
                      <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} className="bp-input small-num" />
                    </div>
                    <div className="summary-row payment-method-row">
                      <span>Payment Method</span>
                      <select className="bp-input small-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card / Online</option>
                      </select>
                    </div>
                    <div className="summary-row total"><span>Total Amount</span><span>{formatPrice(totalAmount)}</span></div>
                    
                    <button className="bp-btn bp-btn-primary full" onClick={() => setShowPreview(true)}>Preview & Generate</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPreview && (
        <div className="bp-modal-overlay">
          <div className="bp-modal large">
            <div className="bp-modal-header">
              <h3>Invoice Preview</h3>
              <button className="bp-btn bp-btn-icon" onClick={() => setShowPreview(false)}><X size={18} /></button>
            </div>
            <div className="bp-modal-body no-pad" style={{background: '#f1f5f9', padding: '1rem'}}>
              
              <div id="invoice" ref={invoiceRef} className="invoice-template">
                <div className="inv-header">
                  <div className="inv-company">
                    {settings?.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="inv-logo" /> : <h1>{settings?.companyName || 'Evodevs'}</h1>}
                    <div className="inv-co-details">
                      {settings?.address && <p>{settings.address}</p>}
                      {settings?.phone && <p>Phone: {settings.phone}</p>}
                      {settings?.email && <p>Email: {settings.email}</p>}
                      {settings?.gstNumber && <p>GSTIN: {settings.gstNumber}</p>}
                    </div>
                  </div>
                  <div className="inv-meta">
                    <h2>INVOICE</h2>
                    <p><strong>Invoice #:</strong> {nextBillNumber}</p>
                    <p><strong>Date:</strong> {today}</p>
                  </div>
                </div>

                <div className="inv-bill-to">
                  <h3>Bill To:</h3>
                  <p><strong>{selectedClient?.name}</strong></p>
                  {selectedClient?.businessName && <p>{selectedClient.businessName}</p>}
                  <p>Phone: {selectedClient?.phone}</p>
                  {selectedClient?.email && <p>Email: {selectedClient.email}</p>}
                </div>

                <table className="inv-table">
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left'}}>Description</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th style={{textAlign: 'right'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.name}</td>
                        <td align="center">{it.qty}</td>
                        <td align="center">{formatPrice(it.price)}</td>
                        <td align="right">{formatPrice(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="inv-summary">
                  <div className="inv-row"><span>Subtotal:</span><span>{formatPrice(subtotal)}</span></div>
                  {Number(discount) > 0 && <div className="inv-row"><span>Discount:</span><span>-{formatPrice(Number(discount))}</span></div>}
                  <div className="inv-row total"><span>Total:</span><span>{formatPrice(totalAmount)}</span></div>
                </div>

                <div className="inv-footer">
                  <p><strong>Payment Method:</strong> {paymentMethod.replace('_', ' ').toUpperCase()}</p>
                  <p>Thank you for your business!</p>
                </div>
              </div>

            </div>
            <div className="bp-modal-actions">
              {!savedBillId ? (
                <>
                  <button className="bp-btn" onClick={() => setShowPreview(false)}>Edit</button>
                  <button className="bp-btn bp-btn-primary" onClick={handleSaveBill}><Save size={16}/> Save Invoice & Enable Download</button>
                </>
              ) : (
                <>
                  <div style={{color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: 'auto'}}><CheckCircle size={18}/> Saved to Firebase</div>
                  <button className="bp-btn bp-btn-primary" onClick={generateHTML}><FileText size={16} /> Download HTML Invoice</button>
                  <button className="bp-btn bp-btn-text" onClick={onCancel} style={{marginLeft:'1rem'}}>Done</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Billing Products
const BillingProducts = ({ fs }) => {
  const { db, collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } = fs;
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'billingProducts'), s => {
      setProducts(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
    return unsub;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    await addDoc(collection(db, 'billingProducts'), {
      ...form,
      price: Number(form.price),
      type: 'custom',
      createdAt: serverTimestamp()
    });
    setIsModalOpen(false);
    setForm({ name: '', price: '', category: '' });
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this custom product?")) {
      await deleteDoc(doc(db, 'billingProducts', id));
    }
  };

  return (
    <div className="billing-page">
      <div className="bp-section-header">
        <h2 className="bp-title">Custom Billing Products</h2>
        <button className="bp-btn bp-btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={16} /> Add Product</button>
      </div>

      <div className="bp-list">
        {products.length === 0 && <p className="empty-text">No custom billing products yet.</p>}
        {products.map(p => (
          <div key={p.id} className="bp-list-item">
            <div>
              <h4>{p.name}</h4>
              <p>{p.category || 'Service'} <span className="bp-badge">Custom</span></p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <span className="bp-amount">{formatPrice(p.price)}</span>
              <button className="bp-btn-icon" onClick={() => handleDelete(p.id)}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="bp-modal-overlay">
          <div className="bp-modal">
            <div className="bp-modal-header">
              <h3>Add Custom Product</h3>
              <button className="bp-btn-icon" onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="bp-modal-body">
              <div className="form-group row">
                <label>Product / Service Name *</label>
                <input className="bp-input" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
              </div>
              <div className="form-group row">
                <label>Price (₹) *</label>
                <input className="bp-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required/>
              </div>
              <div className="form-group row">
                <label>Category</label>
                <input className="bp-input" type="text" placeholder="e.g. Social Media, Maintenance" value={form.category} onChange={e => setForm({...form, category: e.target.value})}/>
              </div>
              <button type="submit" className="bp-btn bp-btn-primary full">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Clients CRM
const BillingClients = ({ fs }) => {
  const { db, collection, onSnapshot, deleteDoc, doc } = fs;
  const [clients, setClients] = useState([]);
  const [bills, setBills] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);

  useEffect(() => {
    const unsubC = onSnapshot(collection(db, 'billingClients'), s => setClients(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubB = onSnapshot(collection(db, 'bills'), s => setBills(s.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubC(); unsubB(); };
  }, []);

  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Permanently delete client "${clientName}" and ALL their bills? This cannot be undone.`)) return;
    try {
      const clientBills = bills.filter(b => b.clientId === clientId);
      for (const bill of clientBills) {
        await deleteDoc(doc(db, 'bills', bill.id));
      }
      await deleteDoc(doc(db, 'billingClients', clientId));
      alert('Client and all their bills deleted.');
    } catch(e) {
      console.error(e);
      alert('Failed to delete client.');
    }
  };

  return (
    <div className="billing-page">
      <div className="bp-section-header">
        <h2 className="bp-title">Client Management CRM</h2>
      </div>

      <div className="bp-list">
        {clients.length === 0 && <p className="empty-text">No clients generated yet. Clients are auto-created when you make a bill.</p>}
        {clients.map(c => {
          const clientBills = bills.filter(b => b.clientId === c.id);
          const totalSpent = clientBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
          const isExpanded = expandedClient === c.id;

          return (
            <div key={c.id} className={`bp-list-item ${isExpanded ? 'expanded' : ''}`} style={{flexDirection: 'column', alignItems: 'stretch'}}>
              
              <div className="crm-row" onClick={() => setExpandedClient(isExpanded ? null : c.id)} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  {isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                  <div>
                    <h4>{c.name}</h4>
                    <p style={{color: '#64748b'}}>{c.phone} {c.businessName && `• ${c.businessName}`}</p>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className="bp-badge">{clientBills.length} Bills</span>
                  <span className="bp-amount" style={{marginLeft: '1rem'}}>{formatPrice(totalSpent)} Lifetime</span>
                </div>
              </div>

              {isExpanded && (
                <div className="crm-expanded">
                  <div className="crm-details">
                    <p><strong>Email:</strong> {c.email || 'N/A'}</p>
                    <p><strong>Created:</strong> {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteClient(c.id, c.name)}
                    style={{background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', fontSize: '0.8rem', fontWeight: 500, marginTop: '0.5rem'}}
                  >
                    <Trash2 size={14} /> Delete Client & All Bills
                  </button>
                  <h5 style={{margin: '1rem 0 0.5rem 0'}}>Billing History</h5>
                  {clientBills.length === 0 ? <p className="empty-text">No bills generated.</p> : (
                    <table className="bp-cart-table">
                      <thead><tr><th>Bill No.</th><th>Date</th><th>Amount</th><th>Method</th></tr></thead>
                      <tbody>
                        {clientBills.map(cb => (
                          <tr key={cb.id}>
                            <td>{cb.billNumber}</td>
                            <td>{cb.createdAt?.toDate ? cb.createdAt.toDate().toLocaleDateString() : ''}</td>
                            <td>{formatPrice(cb.totalAmount)}</td>
                            <td>{cb.paymentMethod?.toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 5. Settings
const BillingSettings = ({ fs }) => {
  const { db, doc, collection, onSnapshot, updateDoc, addDoc } = fs;
  const [form, setForm] = useState({ companyName: '', email: '', phone: '', address: '', gstNumber: '', logoUrl: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'billingSettings', 'main'), d => {
      if (d.exists()) setForm(d.data());
    });
    return unsub;
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'billingSettings', 'main'), form).catch(async () => {
      await addDoc(collection(db, 'billingSettings'), form); // fallback if it doesn't exist
    });
    
    // Fallback using pure firestore logic provided by fs
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="billing-page bp-settings">
      <div className="bp-section-header">
        <h2 className="bp-title">Invoice Settings</h2>
      </div>

      <form className="bp-form" onSubmit={handleSave}>
        <div className="form-group row">
          <label>Company Name *</label>
          <input className="bp-input" type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required/>
        </div>
        <div className="form-row" style={{display: 'flex', gap: '1rem'}}>
          <div className="form-group row" style={{flex: 1}}>
            <label>Business Email</label>
            <input className="bp-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group row" style={{flex: 1}}>
            <label>Business Phone</label>
            <input className="bp-input" type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
        </div>
        <div className="form-group row">
          <label>Business Address</label>
          <textarea className="bp-input" rows="3" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        </div>
        <div className="form-group row">
          <label>GST Number / Tax ID (Optional)</label>
          <input className="bp-input" type="text" value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} />
        </div>
        <div className="form-group row">
          <label>Logo URL (Optional)</label>
          <input className="bp-input" type="text" placeholder="https://example.com/logo.png" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} />
        </div>
        <button type="submit" className="bp-btn bp-btn-primary"><Save size={16} /> Save Settings</button>
        {saved && <span style={{marginLeft: '1rem', color: '#10b981'}}>Settings saved successfully!</span>}
      </form>
    </div>
  );
};

export default Billing;
