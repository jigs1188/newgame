import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using environment variables
// For development, copy .env.example to .env and fill in your values
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyA8rclW1QSQ9jQ1Jf1Ybru_mTYf-Tv2a7Y",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "game-82f0a.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "game-82f0a",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "game-82f0a.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "55371272524",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:55371272524:web:34c6d7cab245bb18213fe9",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XZLY0F3SMV"
};

// Warn if using default/hardcoded values in production
if (process.env.NODE_ENV === 'production' && !process.env.EXPO_PUBLIC_FIREBASE_API_KEY) {
  console.warn('Warning: Using default Firebase configuration. Please set environment variables for production.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };