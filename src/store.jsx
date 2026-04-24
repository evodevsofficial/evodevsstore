import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [leadEmail, setLeadEmail] = useState('');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showFaq, setShowFaq] = useState(null);

  const captureLeadInternal = async (email, source) => {
    const { db } = await import("./firebase");
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "leads"), { email, source, createdAt: serverTimestamp() });
    return { success: true };
  };

  const createOrder = async (product, customerInfo) => {
    try {
      const { db } = await import("./firebase");
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      
      const basePrice = product.priceSelf || product.priceSetup || product.priceBuilt || 0;
      const salePrice = product.salePriceSelf || product.salePriceBuilt;
      const finalPrice = (product.onSale && salePrice) ? salePrice : basePrice;
      
      const orderData = {
        productId: product.id,
        productTitle: product.title,
        mode: product.mode || 'self',
        price: finalPrice,
        originalPrice: (product.onSale && salePrice) ? basePrice : null,
        isOnSale: product.onSale && salePrice,
        customer: customerInfo,
        status: 'pending',
        image: product.image
      };
      
      await addDoc(collection(db, "orders"), { ...orderData, createdAt: serverTimestamp() });
      return { success: true };
    } catch (err) {
      console.error('Order error:', err);
      return { success: false, error: err.message };
    }
  };

  const captureLead = async (email, source = 'website') => {
    try {
      return await captureLeadInternal(email, source);
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const subscribeNewsletter = async () => {
    if (leadEmail) {
      const result = await captureLeadInternal(leadEmail, 'newsletter');
      if (result.success) {
        setShowNewsletter(true);
        setLeadEmail('');
      }
    }
  };

  return (
    <StoreContext.Provider value={{
      createOrder,
      captureLead,
      leadEmail,
      setLeadEmail,
      showFaq,
      setShowFaq,
      showNewsletter,
      setShowNewsletter,
      subscribeNewsletter
    }}>
      {children}
    </StoreContext.Provider>
  );
};