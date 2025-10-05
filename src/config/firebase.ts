import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD_nhQJdxwSn5C87XGSeKnF3stvq1ozQ1U",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "whgdp-auction-prototype.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "whgdp-auction-prototype",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "whgdp-auction-prototype.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "150928624597",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:150928624597:web:329c22198cd3b7d52c8b5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
