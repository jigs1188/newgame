import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8rclW1QSQ9jQ1Jf1Ybru_mTYf-Tv2a7Y",
  authDomain: "game-82f0a.firebaseapp.com",
  projectId: "game-82f0a",
  storageBucket: "game-82f0a.firebasestorage.app",
  messagingSenderId: "55371272524",
  appId: "1:55371272524:web:34c6d7cab245bb18213fe9",
  measurementId: "G-XZLY0F3SMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };