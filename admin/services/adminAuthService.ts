import { auth, realtimeDb } from '../../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  ref, 
  get, 
  set,
  push,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  getDatabase
} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser } from '../types';

class AdminAuthService {
  private currentUser: AdminUser | null = null;
  private authStateListeners: ((user: AdminUser | null) => void)[] = [];
  private readonly ADMIN_SESSION_KEY = 'admin_session';

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await this.loadAdminUser(user);
      } else {
        this.currentUser = null;
        await this.clearAdminSession();
        this.notifyListeners(null);
      }
    });
  }

  // Save admin session to AsyncStorage - SIMPLIFIED LIKE NORMAL USER
  async saveAdminSession(adminUser: AdminUser): Promise<void> {
    try {
      const sessionData = {
        userData: adminUser,
        loginTimestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours in milliseconds
      };
      
      await AsyncStorage.setItem(this.ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      console.log('✅ Admin session saved successfully');
    } catch (error) {
      console.error('❌ Error saving admin session:', error);
    }
  }

  // Load admin session from AsyncStorage - SIMPLIFIED LIKE NORMAL USER
  private async loadAdminSession(): Promise<AdminUser | null> {
    try {
      const sessionString = await AsyncStorage.getItem(this.ADMIN_SESSION_KEY);
      if (!sessionString) {
        console.log('No admin session found');
        return null;
      }

      const sessionData = JSON.parse(sessionString);
      
      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        console.log('Admin session expired, clearing...');
        await this.clearAdminSession();
        return null;
      }

      console.log('Admin session loaded successfully');
      return sessionData.userData;
    } catch (error) {
      console.error('Error loading admin session:', error);
      await this.clearAdminSession(); // Clear corrupted session
      return null;
    }
  }

  // Clear admin session from AsyncStorage - SIMPLIFIED LIKE NORMAL USER
  private async clearAdminSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ADMIN_SESSION_KEY);
      console.log('Admin session cleared successfully');
    } catch (error) {
      console.error('Error clearing admin session:', error);
    }
  }

  // Check if admin session exists on app startup - SIMPLIFIED LIKE NORMAL USER
  async checkExistingAdminSession(): Promise<AdminUser | null> {
    try {
      const adminUser = await this.loadAdminSession();
      if (adminUser) {
        console.log('Found existing admin session:', adminUser.email);
        this.currentUser = adminUser;
        this.notifyListeners(adminUser);
        return adminUser;
      }
      return null;
    } catch (error) {
      console.error('Error checking existing admin session:', error);
      return null;
    }
  }


  // Check if user is superadmin based on email and password
  async checkSuperAdminCredentials(email: string, password: string): Promise<boolean> {
    try {
      // Check for hardcoded superadmin credentials
      if (email === 'superadmin@gmail.com' && password === 'super@dmin') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking superadmin credentials:', error);
      return false;
    }
  }

  // Sign in as superadmin - SEPARATE FROM NORMAL USER AUTH
  async signInAsSuperAdmin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    try {
      console.log('🔐 Starting superadmin sign in process...');
      
      // First check credentials
      const isValidCredentials = await this.checkSuperAdminCredentials(email, password);
      if (!isValidCredentials) {
        console.log('❌ Invalid superadmin credentials');
        return { 
          success: false, 
          error: 'Invalid superadmin credentials' 
        };
      }
      console.log('✅ Superadmin credentials validated');

      // Clear any existing normal user Firebase Auth session first
      try {
        await signOut(auth);
        console.log('🧹 Cleared existing Firebase Auth session for admin login');
      } catch (error) {
        console.log('ℹ️ No existing Firebase Auth session to clear');
      }

      // Sign in with Firebase Auth using admin credentials
      console.log('🔥 Signing in with Firebase Auth...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase Auth successful:', user.uid);

      // Create superadmin user data
      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email || email,
        displayName: 'Super Admin',
        role: 'superadmin',
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        profileImageUrl: user.photoURL || undefined,
        customClaims: {
          role: 'superadmin',
          isAdmin: true,
          isSuperAdmin: true
        }
      };

      // Save admin user data to Realtime Database
      console.log('💾 Saving admin user to Realtime Database...');
      await this.saveAdminUser(adminUser);

      // Save admin session to AsyncStorage for persistence
      await this.saveAdminSession(adminUser);

      this.currentUser = adminUser;
      this.notifyListeners(adminUser);

      console.log('🎉 Admin login successful - separate from normal user auth');
      return { success: true, user: adminUser };
    } catch (error: any) {
      console.error('❌ Superadmin sign in error:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  }

  // Load admin user data
  private async loadAdminUser(firebaseUser: User): Promise<void> {
    try {
      // First check if user has superadmin custom claims
      const tokenResult = await firebaseUser.getIdTokenResult();
      const claims = tokenResult.claims;

      if (claims.role === 'superadmin' || claims.isSuperAdmin) {
        // Load from Realtime Database or create if doesn't exist
        const adminUser = await this.getAdminUserFromRealtimeDB(firebaseUser.uid);
        
        if (adminUser) {
          this.currentUser = adminUser;
          // Save session for persistence
          await this.saveAdminSession(adminUser);
        } else {
          // Create new admin user
          const newAdminUser: AdminUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Super Admin',
            role: 'superadmin',
            isActive: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
            profileImageUrl: firebaseUser.photoURL || undefined,
            customClaims: {
              role: 'superadmin',
              isAdmin: true,
              isSuperAdmin: true
            }
          };
          
          await this.saveAdminUser(newAdminUser);
          // Save session for persistence
          await this.saveAdminSession(newAdminUser);
          this.currentUser = newAdminUser;
        }
      } else {
        // Check if user is regular admin
        const adminUser = await this.getAdminUserFromRealtimeDB(firebaseUser.uid);
        if (adminUser && (adminUser.role === 'admin' || adminUser.role === 'superadmin')) {
          this.currentUser = adminUser;
        } else {
          this.currentUser = null;
        }
      }

      this.notifyListeners(this.currentUser);
    } catch (error) {
      console.error('Error loading admin user:', error);
      this.currentUser = null;
      this.notifyListeners(null);
    }
  }

  // Get admin user from Realtime Database
  private async getAdminUserFromRealtimeDB(uid: string): Promise<AdminUser | null> {
    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return {
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : new Date(),
        } as AdminUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting admin user from Realtime Database:', error);
      return null;
    }
  }

  // Save admin user to Realtime Database
  private async saveAdminUser(adminUser: AdminUser): Promise<void> {
    try {
      const userRef = ref(realtimeDb, `users/${adminUser.uid}`);
      await set(userRef, {
        ...adminUser,
        createdAt: adminUser.createdAt.toISOString(),
        lastLoginAt: adminUser.lastLoginAt.toISOString(),
      });
    } catch (error) {
      console.error('Error saving admin user to Realtime Database:', error);
    }
  }

  // Get all users for admin management
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(usersData).map(uid => {
          const data = usersData[uid];
          return {
            ...data,
            uid,
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : new Date(),
          } as AdminUser;
        }).filter(user => user.role === 'admin' || user.role === 'superadmin');
      }
      return [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Update user role
  async updateUserRole(uid: string, role: 'user' | 'admin' | 'superadmin'): Promise<boolean> {
    try {
      const userRef = ref(realtimeDb, `users/${uid}`);
      await set(userRef, {
        role,
        isAdmin: role === 'admin' || role === 'superadmin',
        isSuperAdmin: role === 'superadmin',
        updatedAt: new Date().toISOString()
      });

      // Update current user if it's the same user
      if (this.currentUser?.uid === uid) {
        this.currentUser.role = role;
        this.currentUser.customClaims = {
          ...this.currentUser.customClaims,
          role,
          isAdmin: role === 'admin' || role === 'superadmin',
          isSuperAdmin: role === 'superadmin'
        };
        this.notifyListeners(this.currentUser);
      }

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  // Delete user
  async deleteUser(uid: string): Promise<boolean> {
    try {
      // Don't allow deleting superadmin
      if (this.currentUser?.uid === uid && this.currentUser?.role === 'superadmin') {
        return false;
      }

      const userRef = ref(realtimeDb, `users/${uid}`);
      await set(userRef, {
        isActive: false,
        deletedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Clear admin session from AsyncStorage
      await this.clearAdminSession();
      
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Clear current user
      this.currentUser = null;
      this.notifyListeners(null);
      
      console.log('Admin signed out successfully - returning to main app');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if Firebase signOut fails, clear local session
      await this.clearAdminSession();
      this.currentUser = null;
      this.notifyListeners(null);
    }
  }

  // Get current admin user
  getCurrentAdminUser(): AdminUser | null {
    return this.currentUser;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'superadmin';
  }

  // Check if current user is superadmin
  isSuperAdmin(): boolean {
    return this.currentUser?.role === 'superadmin';
  }

  // Add auth state listener
  onAuthStateChanged(callback: (user: AdminUser | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(user: AdminUser | null): void {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Get error message
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new AdminAuthService();
