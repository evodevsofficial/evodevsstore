import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductCard.css';
import { formatPrice } from '../currency';
import { useStore } from '../store';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const categoryLabels = {
  app: 'App',
  website: 'Website',
  ai: 'AI',
  automation: 'Automation'
};

const ProductCard = ({ product }) => {
  const [mode, setMode] = useState('self');
  const { addToCart } = useStore();
  const { cart } = useCart();
  const { purchasedItemIds } = useAuth();

  const isSelf = mode === 'self';
  const basePrice = isSelf ? product.priceSelf : product.priceBuilt;
  const salePrice = isSelf ? product.salePriceSelf : product.salePriceBuilt;
  const finalPrice = product.onSale && salePrice ? salePrice : basePrice;
  const isOnSale = product.onSale && salePrice;
  const originalPrice = product.onSale && salePrice ? basePrice : null;
  const image = product.image || product.imageUrl || '';
  const title = product.title || '';
  const shortDescription = product.shortDescription || product.description || '';
  const resultBadge = product.result || product.resultBadge || '';
  const category = product.category || 'app';

  return (
    <div className={`pc-card${isOnSale ? ' pc-card--sale' : ''}`}>
      <div className="pc-image-container">
        {image && <img src={image} alt={title} className="pc-image" />}
        <div className="pc-image-overlay">
          <span className="pc-result-badge">{resultBadge}</span>
          {product.onSale && product.salePrice && (
            <span className="pc-sale-badge">SALE</span>
          )}
        </div>
        <div className="pc-badges">
          <span className="pc-category-badge">{categoryLabels[category] || category}</span>
          {product.badge && <span className="pc-feature-badge">{product.badge}</span>}
        </div>
      </div>

      <div className="pc-content">
        <h3 className="pc-title">{title}</h3>
        <p className="pc-description">{shortDescription}</p>

        <div className="pc-toggle-row">
          <button
            className={`pc-toggle-btn ${isSelf ? 'pc-toggle-btn--active' : ''}`}
            onClick={() => setMode('self')}
          >
            Use it myself
          </button>
          <button
            className={`pc-toggle-btn ${!isSelf ? 'pc-toggle-btn--active' : ''}`}
            onClick={() => setMode('done')}
          >
            Set it up for me
          </button>
        </div>

        <div className="pc-footer">
          <div className="pc-price">
            {isOnSale && originalPrice ? (
              <>
                <span className="pc-price-label" style={{ color: '#dc2626' }}>Sale</span>
                <span className="pc-price-value" style={{ color: '#dc2626' }}>
                  {formatPrice(finalPrice)}
                  <span className="pc-original-price" style={{ textDecoration: 'line-through', fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.6, color: '#64748b' }}>
                    {formatPrice(originalPrice)}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="pc-price-label">From</span>
                <span className="pc-price-value">{formatPrice(finalPrice)}</span>
              </>
            )}
          </div>

          {purchasedItemIds?.includes(product.id) ? (
            <Link to="/dashboard" className="pc-cta" style={{background: '#10b981'}}>
              Already Purchased
            </Link>
          ) : cart?.some(c => c.productId === product.id) ? (
            <Link to="/cart" className="pc-cta" style={{background: '#3b82f6'}}>
              In Cart
            </Link>
          ) : (
            <Link to={`/product/${product.id}`} className="pc-cta">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;