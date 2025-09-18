import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAIfyfoXHJ0spU1DWqXTfRn0uTYnBdZGk",
  authDomain: "my-gps-app-45f1e.firebaseapp.com",
  projectId: "my-gps-app-45f1e",
  storageBucket: "my-gps-app-45f1e.firebasestorage.app",
  messagingSenderId: "827483476565",
  appId: "1:827483476565:android:8e5df4160b2e867913fadc",
  databaseURL: "https://my-gps-app-45f1e-default-rtdb.firebaseio.com"
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
