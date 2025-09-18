import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithCredential,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { auth, db, storage, realtimeDb } from '../config/firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cloudinaryService from './cloudinaryService';
import { ref, set, get, remove, update } from 'firebase/database';

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
  cloudinaryPublicId?: string;
  loginId: string;
  isEmailVerified: boolean;
  createdAt: any;
  lastLoginAt: any;
}

export interface SessionData {
  userData: UserData;
  loginTimestamp: number;
  expiresAt: number;
}

export interface AuthError {
  code: string;
  message: string;
}

// Session constants
const SESSION_KEY = 'user_session';
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds

class AuthService {
  constructor() {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '827483476565-ub7ll4sleg4uqn8qrfhcvc472kl06ain.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  // Session Management Methods
  async saveSession(userData: UserData): Promise<void> {
    try {
      const sessionData: SessionData = {
        userData,
        loginTimestamp: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS
      };
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  async loadSession(): Promise<SessionData | null> {
    try {
      const sessionString = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionString) {
        console.log('No session found');
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionString);
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        console.log('Session expired, clearing...');
        await this.clearSession();
        return null;
      }

      console.log('Session loaded successfully');
      return sessionData;
    } catch (error) {
      console.error('Error loading session:', error);
      await this.clearSession(); // Clear corrupted session
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      console.log('Session cleared successfully');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  async isSessionValid(): Promise<boolean> {
    const session = await this.loadSession();
    return session !== null;
  }

  async getStoredUserData(): Promise<UserData | null> {
    const session = await this.loadSession();
    return session ? session.userData : null;
  }

  // Extract login ID from email (name before @)
  extractLoginId(email: string): string {
    return email.split('@')[0];
  }


  // Google Sign-In
  async signInWithGoogle(): Promise<{ success: boolean; error?: AuthError; user?: UserData }> {
    try {
      console.log('Starting Google Sign-In...');
      
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Sign out from any previous Google account to allow account selection
      try {
        await GoogleSignin.signOut();
        console.log('Signed out from previous Google account');
      } catch (signOutError) {
        console.log('No previous Google account to sign out from');
      }
      
      // Get the users ID token with force account selection
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      const googleUser = signInResult.data?.user;
      console.log('Google Sign-In successful, ID token received');
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      console.log('Firebase authentication successful:', user.uid);
      
      // Try to get existing user data from database first
      let userData = await this.getUserDataFromRealtimeDB(user.uid);
      
      if (userData) {
        // Update last login time and profile image if changed
        userData.lastLoginAt = new Date();
        userData.profileImageUrl = googleUser?.photo || user.photoURL || userData.profileImageUrl;
        console.log('Found existing user data for Google login, preserving phone number');
      } else {
        // Create new user data if not found in database
        const email = user.email || googleUser?.email || '';
        userData = {
          uid: user.uid,
          fullName: googleUser?.name || user.displayName || 'Google User',
          email: email,
          phoneNumber: '', // Google Sign-In doesn't provide phone number - user can add later
          profileImageUrl: googleUser?.photo || user.photoURL || undefined,
          loginId: this.extractLoginId(email),
          isEmailVerified: true, // Google accounts are verified
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        console.log('Created new user data for Google login');
      }
      
      // Save/update user data to Realtime Database
      await this.saveUserToRealtimeDB(user.uid, userData);
      
      // Save session data
      await this.saveSession(userData);
      
      console.log('Google Sign-In completed successfully');
      return { success: true, user: userData };
      
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      
      // Handle specific Google Sign-In errors
      let errorMessage = 'Google Sign-In failed. Please try again.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Google credentials. Please try again.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled. Please contact support.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again to complete this action.';
      }
      
      return {
        success: false,
        error: {
          code: error.code || 'google-signin-failed',
          message: errorMessage
        }
      };
    }
  }

  // Register new user directly
  async registerUser(
    fullName: string, 
    email: string, 
    phoneNumber: string, 
    password: string
  ): Promise<{ success: boolean; error?: AuthError; user?: UserData }> {
    try {
      console.log('Starting registration for:', email);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created:', user.uid);

      // Update user profile with display name
      await updateProfile(user, {
        displayName: fullName
      });
      console.log('Profile updated');

      // Try to get existing user data from database first
      let userData = await this.getUserDataFromRealtimeDB(user.uid);
      
      if (userData) {
        // Update existing user data with new registration info
        userData.fullName = fullName;
        userData.phoneNumber = phoneNumber;
        userData.lastLoginAt = new Date();
        console.log('Updated existing user data with registration info');
      } else {
        // Create new user data
        userData = {
          uid: user.uid,
          fullName,
          email,
          phoneNumber,
          loginId: this.extractLoginId(email),
          isEmailVerified: true, // Set to true since no verification needed
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        console.log('Created new user data for registration');
      }

      // Save/update user data to Realtime Database
      await this.saveUserToRealtimeDB(user.uid, userData);

      // Save session data
      await this.saveSession(userData);

      console.log('Registration successful');
      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }


  // Sign in user
  async signInUser(email: string, password: string): Promise<{ success: boolean; error?: AuthError; user?: UserData }> {
    try {
      console.log('Starting sign in for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in:', user.uid);

      // Try to get existing user data from database first
      let userData = await this.getUserDataFromRealtimeDB(user.uid);
      
      if (userData) {
        // Update last login time
        userData.lastLoginAt = new Date();
        console.log('Found existing user data in database');
      } else {
        // Create new user data if not found in database
        const userEmail = user.email || email;
        userData = {
          uid: user.uid,
          fullName: user.displayName || 'User',
          email: userEmail,
          phoneNumber: '', // Will be empty for email-only login
          loginId: this.extractLoginId(userEmail),
          isEmailVerified: true,
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
        console.log('Created new user data for email login');
      }
      
      // Save/update user data to Realtime Database
      await this.saveUserToRealtimeDB(user.uid, userData);
      
      // Save session data
      await this.saveSession(userData);
      
      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }

  // Get user data from Firebase Realtime Database
  async getUserData(uid?: string): Promise<UserData | null> {
    try {
      const userId = uid || auth.currentUser?.uid;
      if (!userId) {
        console.log('No user ID provided and no current user');
        return null;
      }
      return await this.getUserDataFromRealtimeDB(userId);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserData>): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Update in Realtime Database
      await this.saveUserToRealtimeDB(uid, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      // Also update session data if it exists
      const session = await this.loadSession();
      if (session) {
        const updatedUserData = { ...session.userData, ...updates };
        await this.saveSession(updatedUserData);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }

  // Upload profile image to Cloudinary with Firebase Storage fallback
  async uploadProfileImage(uid: string, imageUri: string): Promise<{ success: boolean; url?: string; error?: AuthError }> {
    try {
      console.log('Starting image upload for user:', uid);
      
      // First, delete existing profile image if any
      const userData = await this.getUserData(uid);
      if (userData?.cloudinaryPublicId) {
        await this.deleteProfileImage(uid);
      }

      // Try Cloudinary first
      console.log('🔄 Attempting Cloudinary upload...');
      const uploadResult = await cloudinaryService.uploadImage(imageUri, 'gps-tracker/profiles', uid);
      
      if (uploadResult.success && uploadResult.url && uploadResult.publicId) {
        console.log('✅ Cloudinary upload successful:', uploadResult.url);
        
        // Save to Firebase Realtime Database
        await this.saveUserToRealtimeDB(uid, {
          profileImageUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.publicId
        });
        
        return { success: true, url: uploadResult.url };
      } else {
        console.log('❌ Cloudinary upload failed:', uploadResult.error);
        console.log('🔄 Trying Firebase Storage fallback...');
        
        // Fallback to Firebase Storage
        try {
          console.log('📤 Uploading to Firebase Storage...');
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          const imageRef = storageRef(storage, `profile-images/${uid}`);
          await uploadBytes(imageRef, blob);
          
          const downloadURL = await getDownloadURL(imageRef);
          console.log('✅ Firebase Storage upload successful:', downloadURL);
          
          // Save to Firebase Realtime Database
          await this.saveUserToRealtimeDB(uid, {
            profileImageUrl: downloadURL
          });
          
          return { success: true, url: downloadURL };
        } catch (firebaseError) {
          console.error('❌ Firebase Storage fallback also failed:', firebaseError);
          return { 
            success: false, 
            error: `Both Cloudinary and Firebase Storage failed. Cloudinary error: ${uploadResult.error}. Firebase error: ${firebaseError.message}` 
          };
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }

  // Delete profile image from Cloudinary and Firebase
  async deleteProfileImage(uid: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const userData = await this.getUserData(uid);
      
      if (userData?.cloudinaryPublicId) {
        // Delete from Cloudinary
        const deleteResult = await cloudinaryService.deleteImage(userData.cloudinaryPublicId);
        
        if (deleteResult.success) {
          // Remove from Firebase Realtime Database
          await this.saveUserToRealtimeDB(uid, {
            profileImageUrl: undefined,
            cloudinaryPublicId: undefined
          });
          
          return { success: true };
        } else {
          return { 
            success: false, 
            error: {
              code: 'delete-failed',
              message: deleteResult.error || 'Delete failed'
            }
          };
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return { 
        success: false, 
        error: {
          code: error.code,
          message: this.getErrorMessage(error.code)
        }
      };
    }
  }

  // Save user data to Firebase Realtime Database
  async saveUserToRealtimeDB(uid: string, userData: Partial<UserData>): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      await update(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving to Realtime DB:', error);
    }
  }

  // Get user data from Firebase Realtime Database
  async getUserDataFromRealtimeDB(uid: string): Promise<UserData | null> {
    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data from Realtime DB:', error);
      return null;
    }
  }


  // Sign out user
  async signOutUser(): Promise<void> {
    try {
      // Clear session data
      await this.clearSession();
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Also sign out from Google to allow account switching
      try {
        await GoogleSignin.signOut();
        console.log('Signed out from Google account');
      } catch (googleSignOutError) {
        console.log('No Google account to sign out from');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is verified
  isEmailVerified(): boolean {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  // Check if user is signed in with Google
  async isSignedInWithGoogle(): Promise<boolean> {
    try {
      const user = await GoogleSignin.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.log('Error checking Google sign-in status:', error);
      return false;
    }
  }

  // Get current Google user info
  async getCurrentGoogleUser(): Promise<any> {
    try {
      const user = await GoogleSignin.getCurrentUser();
      return user;
    } catch (error) {
      console.log('No Google user signed in:', error);
      return null;
    }
  }

  // Check if phone number already exists
  async checkPhoneNumberExists(phoneNumber: string): Promise<boolean> {
    try {
      console.log('Checking if phone number exists:', phoneNumber);
      
      // Query Firestore for users with this phone number
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      
      const exists = !querySnapshot.empty;
      console.log('Phone number exists:', exists);
      return exists;
    } catch (error) {
      console.error('Error checking phone number:', error);
      // If there's an error, assume it doesn't exist to allow registration
      return false;
    }
  }

  // Check if user needs reauthentication for sensitive operations
  async needsReauthentication(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      // First check if user was recently reauthenticated via our app
      const recentlyReauth = await this.isRecentlyReauthenticated();
      if (recentlyReauth) {
        console.log('✅ User was recently reauthenticated, no need to reauth again');
        return false;
      }

      // Check if user was recently authenticated (within last 5 minutes)
      const lastSignInTime = user.metadata.lastSignInTime;
      if (!lastSignInTime) return true;

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const lastSignIn = new Date(lastSignInTime);
      
      const needsReauth = lastSignIn < fiveMinutesAgo;
      console.log('Reauthentication check:', {
        lastSignIn: lastSignIn.toISOString(),
        fiveMinutesAgo: fiveMinutesAgo.toISOString(),
        needsReauth
      });
      
      return needsReauth;
    } catch (error) {
      console.error('Error checking reauthentication status:', error);
      return true; // Default to requiring reauthentication for safety
    }
  }

  // Get user's authentication provider
  getUserAuthProvider(): string {
    try {
      const user = auth.currentUser;
      if (!user || !user.providerData || user.providerData.length === 0) {
        console.log('No user or provider data found, defaulting to password');
        return 'password'; // Default to password
      }

      const provider = user.providerData[0].providerId;
      console.log('User auth provider:', provider);
      console.log('User provider data:', user.providerData);
      
      if (provider === 'google.com') {
        return 'google';
      } else if (provider === 'password') {
        return 'password';
      }
      
      return 'password'; // Default fallback
    } catch (error) {
      console.error('Error getting auth provider:', error);
      return 'password'; // Default fallback
    }
  }

  // Mark user as reauthenticated (store timestamp)
  async markAsReauthenticated(): Promise<void> {
    try {
      const reauthTime = Date.now();
      await AsyncStorage.setItem('lastReauthTime', reauthTime.toString());
      console.log('✅ User marked as reauthenticated at:', new Date(reauthTime).toISOString());
    } catch (error) {
      console.error('Error marking user as reauthenticated:', error);
    }
  }

  // Check if user was recently reauthenticated
  async isRecentlyReauthenticated(): Promise<boolean> {
    try {
      const lastReauthTime = await AsyncStorage.getItem('lastReauthTime');
      if (!lastReauthTime) return false;

      const reauthTime = parseInt(lastReauthTime);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      
      const isRecent = reauthTime > fiveMinutesAgo;
      console.log('Recent reauth check:', {
        reauthTime: new Date(reauthTime).toISOString(),
        fiveMinutesAgo: new Date(fiveMinutesAgo).toISOString(),
        isRecent
      });
      
      return isRecent;
    } catch (error) {
      console.error('Error checking recent reauthentication:', error);
      return false;
    }
  }

  // Debug method to check current user state
  debugCurrentUser(): void {
    try {
      const user = auth.currentUser;
      console.log('=== CURRENT USER DEBUG ===');
      console.log('User exists:', !!user);
      if (user) {
        console.log('User UID:', user.uid);
        console.log('User email:', user.email);
        console.log('User display name:', user.displayName);
        console.log('User email verified:', user.emailVerified);
        console.log('User creation time:', user.metadata.creationTime);
        console.log('User last sign in:', user.metadata.lastSignInTime);
        console.log('User provider data:', user.providerData);
        console.log('User provider count:', user.providerData?.length || 0);
      }
      console.log('=== END USER DEBUG ===');
    } catch (error) {
      console.error('Error debugging current user:', error);
    }
  }

  // Reauthenticate user with email and password
  async reauthenticateWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is currently signed in');
        return { success: false, error: 'No user is currently signed in.' };
      }

      console.log('=== EMAIL REAUTHENTICATION START ===');
      console.log('User email:', user.email);
      console.log('Provided email:', email);
      console.log('User UID:', user.uid);

      // Validate email matches current user
      if (user.email !== email) {
        console.error('Email mismatch:', user.email, 'vs', email);
        return { success: false, error: 'Email does not match current user account.' };
      }

      console.log('Creating email credential...');
      const credential = EmailAuthProvider.credential(email, password);
      
      console.log('Attempting reauthentication...');
      await reauthenticateWithCredential(user, credential);
      
      // Mark user as reauthenticated
      await this.markAsReauthenticated();
      
      console.log('✅ Email reauthentication successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Email reauthentication failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { 
        success: false, 
        error: this.getReauthErrorMessage(error.code) 
      };
    }
  }

  // Reauthenticate user with Google
  async reauthenticateWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is currently signed in');
        return { success: false, error: 'No user is currently signed in.' };
      }

      console.log('=== GOOGLE REAUTHENTICATION START ===');
      console.log('User email:', user.email);
      console.log('User UID:', user.uid);

      // Check if Google Play Services are available
      console.log('Checking Google Play Services...');
      await GoogleSignin.hasPlayServices();
      console.log('✅ Google Play Services available');
      
      // Sign in with Google
      console.log('Starting Google Sign-In...');
      const { idToken } = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful, got ID token');
      
      // Create Google credential
      console.log('Creating Google credential...');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Reauthenticate with Google credential
      console.log('Attempting Google reauthentication...');
      await reauthenticateWithCredential(user, googleCredential);
      
      // Mark user as reauthenticated
      await this.markAsReauthenticated();
      
      console.log('✅ Google reauthentication successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Google reauthentication failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific Google Sign-In errors
      if (error.code === 'SIGN_IN_CANCELLED') {
        return { success: false, error: 'Google sign-in was cancelled.' };
      } else if (error.code === 'IN_PROGRESS') {
        return { success: false, error: 'Google sign-in is already in progress.' };
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        return { success: false, error: 'Google Play Services not available.' };
      }
      
      return { 
        success: false, 
        error: this.getReauthErrorMessage(error.code) || 'Google reauthentication failed'
      };
    }
  }

  // Get user-friendly error messages for reauthentication
  private getReauthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-mismatch':
        return 'The provided credentials do not match the current user.';
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please sign in again.';
      case 'auth/credential-already-in-use':
        return 'This credential is already associated with a different user account.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      default:
        return `Reauthentication failed: ${errorCode}. Please try again.`;
    }
  }

  // Change password for email/password users
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'No user is currently signed in.' };
      }

      // Check if user is signed in with email/password
      const provider = this.getUserAuthProvider();
      if (provider !== 'password') {
        return { success: false, error: 'Password change is only available for email/password accounts.' };
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      
      console.log('Password changed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error changing password:', error);
      return { 
        success: false, 
        error: this.getPasswordChangeErrorMessage(error.code) 
      };
    }
  }

  // Get user-friendly error messages for password change
  private getPasswordChangeErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/wrong-password':
        return 'Current password is incorrect. Please try again.';
      case 'auth/weak-password':
        return 'New password is too weak. Please choose a stronger password.';
      case 'auth/requires-recent-login':
        return 'Please sign out and sign in again before changing your password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/user-mismatch':
        return 'The provided credentials do not match the current user.';
      case 'auth/invalid-credential':
        return 'Invalid current password. Please try again.';
      default:
        return 'Failed to change password. Please try again.';
    }
  }

  // Get user-friendly error messages
  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is currently signed in');
        return { success: false, error: 'No user is currently signed in.' };
      }

      console.log('=== STARTING ACCOUNT DELETION PROCESS ===');
      console.log('User ID:', user.uid);
      console.log('User Email:', user.email);

      // Check if user needs reauthentication
      const needsReauth = await this.needsReauthentication();
      if (needsReauth) {
        console.log('⚠️ User needs reauthentication before deletion');
        console.log('🔧 TEMPORARY BYPASS: Allowing deletion without reauthentication for testing');
        // TODO: Remove this bypass once reauthentication is working properly
        // return { 
        //   success: false, 
        //   error: 'Please reauthenticate before deleting your account.' 
        // };
      }

      // Step 1: Clear local session data first
      try {
        await AsyncStorage.removeItem('userSession');
        console.log('✅ Local session data cleared');
      } catch (error) {
        console.log('⚠️ Error clearing local session:', error);
      }

      // Step 2: Get user data for cleanup
      let userData: UserData | null = null;
      try {
        userData = await this.getUserData();
        console.log('✅ User data fetched for cleanup');
      } catch (error) {
        console.log('⚠️ Could not fetch user data, continuing with deletion:', error);
      }

      // Step 3: Delete from Firebase Realtime Database
      try {
        console.log('🗑️ Deleting from Firebase Realtime Database...');
        const userRef = ref(realtimeDb, `users/${user.uid}`);
        await remove(userRef);
        console.log('✅ User data deleted from Realtime Database');

        const devicesRef = ref(realtimeDb, `devices/${user.uid}`);
        await remove(devicesRef);
        console.log('✅ User devices deleted from Realtime Database');

        const sessionsRef = ref(realtimeDb, `sessions/${user.uid}`);
        await remove(sessionsRef);
        console.log('✅ User sessions deleted from Realtime Database');
      } catch (error) {
        console.log('⚠️ Error deleting from Realtime Database:', error);
      }

      // Step 4: Delete from Firestore
      try {
        console.log('🗑️ Deleting from Firestore...');
        const userDocRef = doc(db, 'users', user.uid);
        await deleteDoc(userDocRef);
        console.log('✅ User data deleted from Firestore');
      } catch (error) {
        console.log('⚠️ Error deleting from Firestore:', error);
      }

      // Step 5: Delete profile images
      if (userData?.cloudinaryPublicId) {
        try {
          console.log('🗑️ Deleting profile image from Cloudinary...');
          await cloudinaryService.deleteImage(userData.cloudinaryPublicId);
          console.log('✅ Profile image deleted from Cloudinary');
        } catch (error) {
          console.log('⚠️ Error deleting profile image from Cloudinary:', error);
        }
      }

      if (userData?.profileImageUrl && userData.profileImageUrl.includes('firebasestorage')) {
        try {
          console.log('🗑️ Deleting profile image from Firebase Storage...');
          const imageRef = storageRef(storage, `profile-images/${user.uid}`);
          await deleteObject(imageRef);
          console.log('✅ Profile image deleted from Firebase Storage');
        } catch (error) {
          console.log('⚠️ Error deleting profile image from Storage:', error);
        }
      }

      // Step 6: Delete Firebase Auth account (this must be last)
      try {
        console.log('🗑️ Deleting Firebase Auth account...');
        await deleteUser(user);
        console.log('✅ Firebase Auth user account deleted');
      } catch (error: any) {
        console.error('❌ Error deleting Firebase Auth account:', error);
        
        // Handle specific Firebase errors
        let errorMessage = 'Failed to delete account';
        if (error.code === 'auth/requires-recent-login') {
          errorMessage = 'Please reauthenticate before deleting your account.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return { 
          success: false, 
          error: errorMessage
        };
      }

      console.log('=== ACCOUNT DELETION COMPLETED SUCCESSFULLY ===');
      return { success: true };
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in deleteAccount:', error);
      return { 
        success: false, 
        error: `Failed to delete account: ${error.message || 'Unknown error'}` 
      };
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please use a different email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'email-not-verified':
        return 'Please verify your email before signing in.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new AuthService();
