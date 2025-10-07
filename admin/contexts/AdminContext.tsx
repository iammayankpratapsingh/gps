import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { AdminContextType, AdminUser, AdminDevice, AdminStats, AdminTheme, AdminDrawerState } from '../types';
import adminAuthService from '../services/adminAuthService';
import adminDeviceService from '../services/adminDeviceService';
import adminStatsService from '../services/adminStatsService';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin theme colors
const adminTheme: AdminTheme = {
  primary: '#0097b2',
  secondary: '#0066cc',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1a202c',
  textSecondary: '#718096',
  header: '#0097b2',
  headerText: '#ffffff',
  card: '#ffffff',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  drawer: '#1a202c',
  drawerText: '#ffffff',
  button: '#0097b2',
  buttonText: '#ffffff',
  input: '#ffffff',
  inputBorder: '#d1d5db',
  borderLight: '#e5e7eb'
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(0));

  const drawerState: AdminDrawerState = {
    isOpen: isDrawerOpen,
    animation: drawerAnimation
  };

  // Initialize admin context
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is already signed in
        const user = adminAuthService.getCurrentAdminUser();
        if (user) {
          setCurrentUser(user);
          await loadAdminData();
        }
      } catch (err) {
        console.error('Error initializing admin:', err);
        setError('Failed to initialize admin panel');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();

    // Listen to auth state changes
    const unsubscribe = adminAuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadAdminData();
      } else {
        setStats(null);
        setUsers([]);
        setDevices([]);
      }
    });

    return unsubscribe;
  }, []);

  // Load admin data
  const loadAdminData = useCallback(async () => {
    try {
      const [statsData, usersData, devicesData] = await Promise.all([
        adminStatsService.getAdminStats(),
        adminAuthService.getAllUsers(),
        adminDeviceService.getAllDevices()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setDevices(devicesData);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
    }
  }, []);

  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    const toValue = isDrawerOpen ? 0 : 1;
    
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsDrawerOpen(!isDrawerOpen);
  }, [isDrawerOpen, drawerAnimation]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      setIsDrawerOpen(false);
    }
  }, [isDrawerOpen, drawerAnimation]);

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const statsData = await adminStatsService.getAdminStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      setError('Failed to refresh statistics');
    }
  }, []);

  // Refresh users
  const refreshUsers = useCallback(async () => {
    try {
      const usersData = await adminAuthService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setError('Failed to refresh users');
    }
  }, []);

  // Refresh devices
  const refreshDevices = useCallback(async () => {
    try {
      const devicesData = await adminDeviceService.getAllDevices();
      setDevices(devicesData);
    } catch (err) {
      console.error('Error refreshing devices:', err);
      setError('Failed to refresh devices');
    }
  }, []);

  // Update user role
  const updateUserRole = useCallback(async (uid: string, role: string) => {
    try {
      const success = await adminAuthService.updateUserRole(uid, role as 'user' | 'admin' | 'superadmin');
      if (success) {
        await refreshUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
      return false;
    }
  }, [refreshUsers]);

  // Delete user
  const deleteUser = useCallback(async (uid: string) => {
    try {
      const success = await adminAuthService.deleteUser(uid);
      if (success) {
        await refreshUsers();
        await refreshStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
      return false;
    }
  }, [refreshUsers, refreshStats]);

  // Update device
  const updateDevice = useCallback(async (deviceId: string, updates: Partial<AdminDevice>) => {
    try {
      const success = await adminDeviceService.updateDevice(deviceId, updates);
      if (success) {
        await refreshDevices();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating device:', err);
      setError('Failed to update device');
      return false;
    }
  }, [refreshDevices]);

  // Delete device
  const deleteDevice = useCallback(async (deviceId: string) => {
    try {
      const success = await adminDeviceService.deleteDevice(deviceId);
      if (success) {
        await refreshDevices();
        await refreshStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting device:', err);
      setError('Failed to delete device');
      return false;
    }
  }, [refreshDevices, refreshStats]);

  const contextValue: AdminContextType = {
    currentUser,
    isAdmin: adminAuthService.isAdmin(),
    isSuperAdmin: adminAuthService.isSuperAdmin(),
    theme: adminTheme,
    drawerState,
    stats,
    users,
    devices,
    isLoading,
    error,
    toggleDrawer,
    closeDrawer,
    refreshStats,
    refreshUsers,
    refreshDevices,
    updateUserRole,
    deleteUser,
    updateDevice,
    deleteDevice
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
