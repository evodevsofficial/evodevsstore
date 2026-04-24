import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product, type) => {
    const existingIndex = cart.findIndex(
      item => item.productId === product.id && item.type === type
    );

    if (existingIndex >= 0) {
      showToast('Item already in cart!');
      return { success: false, message: 'Item already in cart' };
    }

    const price = type === 'self' 
      ? (product.onSale && product.salePriceSelf ? product.salePriceSelf : product.priceSelf)
      : (product.onSale && product.salePriceBuilt ? product.salePriceBuilt : product.priceBuilt || product.priceSetup);

    const cartItem = {
      productId: product.id,
      title: product.title,
      image: product.image,
      type,
      price,
      originalPrice: product.onSale 
        ? (type === 'self' ? product.priceSelf : (product.priceBuilt || product.priceSetup))
        : null,
      rawProductParams: {
        priceSelf: product.priceSelf || 0,
        priceBuilt: product.priceBuilt || product.priceSetup || 0,
        salePriceSelf: product.salePriceSelf || null,
        salePriceBuilt: product.salePriceBuilt || null,
        onSale: product.onSale || false
      }
    };

    setCart(prev => [...prev, cartItem]);
    showToast('Item added to cart!');
    return { success: true };
  };

  const removeFromCart = (productId, type) => {
    setCart(prev => prev.filter(
      item => !(item.productId === productId && item.type === type)
    ));
  };

  const updateCartItemType = (productId, oldType, newType) => {
    const index = cart.findIndex(
      item => item.productId === productId && item.type === oldType
    );
    
    if (index < 0) return;
    const itemToUpdate = cart[index];
    const rp = itemToUpdate.rawProductParams;
    if(!rp) return;

    const newPrice = newType === 'self'
      ? (rp.onSale && rp.salePriceSelf ? rp.salePriceSelf : rp.priceSelf)
      : (rp.onSale && rp.salePriceBuilt ? rp.salePriceBuilt : rp.priceBuilt);
      
    const newOriginalPrice = rp.onSale 
      ? (newType === 'self' ? rp.priceSelf : rp.priceBuilt)
      : null;

    setCart(prev => prev.map((item, i) => 
      i === index ? { ...item, type: newType, price: newPrice, originalPrice: newOriginalPrice } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartCount = cart.length;

  const value = {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemType,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="cart-toast-popup">
          {toastMessage}
        </div>
      )}
    </CartContext.Provider>
  );
};
