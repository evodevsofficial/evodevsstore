import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import './Marketplace.css';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'app', label: 'App' },
  { id: 'website', label: 'Website' },
  { id: 'ai', label: 'AI' },
  { id: 'automation', label: 'Automation' }
];

const Marketplace = () => {
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { db } = await import('../firebase');
        const { collection: col, getDocs: get, query: q, orderBy: o } = await import('firebase/firestore');
        const queryRef = q(col(db, 'products'), o('createdAt', 'desc'));
        const snap = await get(queryRef);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'all' || p.category === filter;
    const matchesSearch = search === '' || 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDescription?.toLowerCase().includes(search.toLowerCase()) ||
      p.result?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="marketplace-page py-32 container">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="text-5xl font-semibold mb-6">Marketplace</h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto">
          Choose a pre-built growth system tailored to your industry. Buy the core infrastructure or let us deploy it for you.
        </p>
      </div>

      <div className="search-bar mb-8">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filters flex justify-center gap-4 mb-12 flex-wrap">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-secondary">Loading...</div>
      ) : error ? (
        <div className="text-center text-secondary">
          <p>Unable to load products</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-secondary">No products found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;