import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const cartItemCount = cart?.length || 0;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="header glass-panel">
        <div className="container flex justify-between items-center header-content">
          <Link to="/" className="logo flex items-center gap-2">
            <div className="logo-icon flex items-center justify-center">
              <LayoutGrid size={20} color="var(--bg-color)" />
            </div>
            <span className="logo-text text-gradient">EvoDevs</span>
          </Link>
          
          <nav className="nav flex items-center gap-6">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/marketplace" 
              className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>
            
            <div className="nav-actions">
              <Link to="/cart" className="cart-icon" style={{position: 'relative'}}>
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span style={{position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="user-menu-container">
                  <button 
                    className="user-icon"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User size={20} />
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <Link 
                        to="/dashboard" 
                        className="dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        My Account
                      </Link>
                      <button 
                        className="dropdown-item logout"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="auth-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile-only Navigation Bar constructed as per user requested grid mapping */}
      <nav className="mobile-nav glass-panel">
        <div className="mobile-nav-grid">
          {/* Row 1 */}
          <Link to="/" className={`m-nav-item ${location.pathname === '/' ? 'active' : ''}`}>home</Link>
          <Link to="/" className="m-nav-logo text-gradient">EvoDevs</Link>
          <Link to="/contact" className={`m-nav-item ${location.pathname === '/contact' ? 'active' : ''}`}>contact</Link>
          <Link to="/marketplace" className={`m-nav-item ${location.pathname === '/marketplace' ? 'active' : ''}`}>marketplace</Link>
          
          {/* Row 2 */}
          {isAuthenticated ? (
             <Link to="/dashboard" className={`m-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>profile</Link>
          ) : (
             <button className="m-nav-item" onClick={() => setShowAuthModal(true)}>login</button>
          )}
          <div className="m-nav-empty"></div>
          <div className="m-nav-empty"></div>
          <Link to="/cart" className={`m-nav-item ${location.pathname === '/cart' ? 'active' : ''}`} style={{display: 'flex', justifyContent: 'center', position: 'relative'}}>
            <ShoppingCart size={18} />
            {cartItemCount > 0 && (
              <span style={{position: 'absolute', top: '10px', right: '15px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Header;
