import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasedItemIds, setPurchasedItemIds] = useState([]);

  useEffect(() => {
    let unsubOrders = () => {};
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Self-repair: create missing user document
            const newUserData = {
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'Unnamed User',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
            setUserData(newUserData);
          }

          const q = query(collection(db, 'orders'), where('userId', '==', firebaseUser.uid));
          unsubOrders = onSnapshot(q, (snap) => {
            const pIds = [];
            snap.forEach(docSnap => {
              const d = docSnap.data();
              if (d.paymentStatus === 'paid' || d.status === 'paid') {
                d.items?.forEach(i => pIds.push(i.productId));
              }
            });
            setPurchasedItemIds(pIds);
          });
        } catch (e) {
          console.warn('Could not read or self-repair user doc:', e);
        }
      } else {
        setUser(null);
        setUserData(null);
        setPurchasedItemIds([]);
        unsubOrders();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    try {
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        name,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Could not write user profile doc, continuing anyway:', err);
    }
    return result.user;
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userData,
    purchasedItemIds,
    loading,
    signup,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
