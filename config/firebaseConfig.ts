import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration - Updated from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBmSJrw8bhtg4cUQc5GOdfx3SXP6zDFL78",
  authDomain: "track-3b833.firebaseapp.com",
  projectId: "track-3b833",
  storageBucket: "track-3b833.firebasestorage.app",
  messagingSenderId: "873684952295",
  appId: "1:873684952295:android:94851e69788709635eae42",
  databaseURL: "https://track-3b833-default-rtdb.firebaseio.com"
};

// Initialize Firebase (prevent multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
// Note: Using getAuth instead of initializeAuth to avoid Expo Go compatibility issues
// Auth state will persist in memory but not between app restarts in Expo Go
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;
