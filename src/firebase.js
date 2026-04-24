import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

export const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_CLIXFWX2KjeaQ3q5_eMc8WOTVM6iVD45Id7ZPCoIQQqDuS9";

const firebaseConfig = {
  apiKey: "AIzaSyDkfsMZ9OAqGVjX50c-69lvpi2if-Ko1Yc",
  authDomain: "evoweb-7edd3.firebaseapp.com",
  projectId: "evoweb-7edd3",
  storageBucket: "evoweb-7edd3.firebasestorage.app",
  messagingSenderId: "536509490250",
  appId: "1:536509490250:web:1d446420d7ad1c574272b3",
  measurementId: "G-11TMSNZB62"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);