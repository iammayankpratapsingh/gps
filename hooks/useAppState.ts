import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import authService, { UserData } from '../services/authService';
import themeService, { Theme } from '../services/themeService';
import deviceService from '../services/deviceService';
import { FirebaseDevice } from '../services/firebaseDatabase';

export const useAppState = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showProfileScreen, setShowProfileScreen] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showThemeManagement, setShowThemeManagement] = useState(false);
  const [showDefaultMapType, setShowDefaultMapType] = useState(false);
  const [showManageNotification, setShowManageNotification] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showRateUs, setShowRateUs] = useState(false);
  const [showPreviousRoutes, setShowPreviousRoutes] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [devices, setDevices] = useState<FirebaseDevice[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  
  // Callback to reset drawer when needed
  const [drawerResetCallback, setDrawerResetCallback] = useState<(() => void) | null>(null);

  // Initialize app services
  const initializeApp = async () => {
    try {
      console.log('Initializing app services...');
      
      // Initialize theme
      const currentTheme = await themeService.initialize();
      setTheme(currentTheme);
      
      // Start system theme listener
      themeService.startSystemThemeListener();
      
      // Check for existing session first
      const storedUserData = await authService.getStoredUserData();
      
      if (storedUserData) {
        console.log('Found existing session, user:', storedUserData.email);
        
        // Load fresh user data from database to get latest profile image
        const freshUserData = await authService.getUserData(storedUserData.uid);
        const userDataToUse = freshUserData || storedUserData;
        
        console.log('Using fresh user data from database:', userDataToUse.profileImageUrl);
        setUserData(userDataToUse);
        setIsAuthenticated(true);
        
        // Reset all screen states to ensure clean dashboard view
        setShowProfileScreen(false);
        setShowAddDevice(false);
        setShowThemeManagement(false);
        
        // Set profile image if available (use fresh data)
        if (userDataToUse.profileImageUrl) {
          setProfileImage(userDataToUse.profileImageUrl);
        }
        
        // Note: Drawer reset is now handled centrally in App.tsx
        // No need to reset here to prevent conflicts
        
        // Initialize devices for authenticated user
        console.log('Initializing devices for authenticated user...');
        const deviceList = await deviceService.initialize();
        setDevices(deviceList);
        await updateDeviceCounts(deviceList);
      } else {
        console.log('No existing session found');
        setIsAuthenticated(false);
        setDevices([]);
        setTotalDevices(0);
        setOnlineDevices(0);
        setOfflineDevices(0);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingSession(false);
      // Keep splash screen visible for a minimum duration
      setTimeout(() => {
        setShowSplash(false);
      }, 2000); // 2 seconds minimum splash duration
    }
  };

  // Update device counts
  const updateDeviceCounts = async (deviceList: FirebaseDevice[]) => {
    try {
      const total = await deviceService.getTotalDevices();
      const online = await deviceService.getOnlineDevices();
      const offline = await deviceService.getOfflineDevices();
      
      setTotalDevices(total);
      setOnlineDevices(online);
      setOfflineDevices(offline);
    } catch (error) {
      console.error('Error updating device counts:', error);
    }
  };

  // Initialize app on start
  useEffect(() => {
    // Show splash screen immediately
    setShowSplash(true);
    setIsCheckingSession(true);
    
    // Initialize app services
    initializeApp();
  }, []);

  // Subscribe to theme changes
  useEffect(() => {
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  // Subscribe to device changes
  useEffect(() => {
    const unsubscribe = deviceService.subscribe(async (deviceList) => {
      setDevices(deviceList);
      await updateDeviceCounts(deviceList);
      setLastRefreshTime(new Date().toLocaleTimeString());
      console.log(`Device data updated at ${new Date().toLocaleTimeString()}`);
    });
    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      deviceService.cleanup();
    };
  }, []);

  // Listen for app state changes to check session when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && isAuthenticated) {
        // Check if session is still valid when app comes to foreground
        const isSessionValid = await authService.isSessionValid();
        if (!isSessionValid) {
          console.log('Session expired while app was in background, logging out...');
          await handleLogout();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Force close drawer immediately to prevent flicker during logout
      if (drawerResetCallback) {
        drawerResetCallback();
      }
      
      await authService.signOutUser();
      console.log('Auth service signOut completed');
      
      setIsAuthenticated(false);
      setUserData(null);
      setProfileImage(null);
      setShowProfileScreen(false);
      
      // Update device service to clear user data
      deviceService.updateCurrentUser(null);
      setDevices([]);
      setTotalDevices(0);
      setOnlineDevices(0);
      setOfflineDevices(0);
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state to prevent app from being stuck
      setIsAuthenticated(false);
      setUserData(null);
      setProfileImage(null);
      setShowProfileScreen(false);
      deviceService.updateCurrentUser(null);
      setDevices([]);
      setTotalDevices(0);
      setOnlineDevices(0);
      setOfflineDevices(0);
    }
  };

  const handleLogin = async (user: UserData) => {
    try {
      console.log('handleLogin called with user:', user);
      
      // Check if user is superadmin - this will be handled by the parent App component
      // We'll just set the regular user state here
      setUserData(user);
      setIsAuthenticated(true);
      
      // Reset all screen states to ensure clean dashboard view
      setShowProfileScreen(false);
      setShowAddDevice(false);
      setShowThemeManagement(false);
      
      // Note: Drawer reset is now handled centrally in App.tsx
      // No need to reset here to prevent conflicts
      
      // Update device service with new user
      deviceService.updateCurrentUser(user.uid);
      
      // Initialize devices for the new user
      const deviceList = await deviceService.initialize();
      setDevices(deviceList);
      await updateDeviceCounts(deviceList);
      
      // Set profile image if available
      if (user.profileImageUrl) {
        setProfileImage(user.profileImageUrl);
      }
      console.log('Login state updated successfully - user will see dashboard');
    } catch (error) {
      console.error('Error in handleLogin:', error);
    }
  };

  const handleUpdateProfile = (updatedUserData: UserData) => {
    setUserData(updatedUserData);
    if (updatedUserData.profileImageUrl) {
      setProfileImage(updatedUserData.profileImageUrl);
    }
  };

  return {
    // State
    showSplash,
    setShowSplash,
    isAuthenticated,
    profileImage,
    setProfileImage,
    userData,
    setUserData,
    showProfileScreen,
    setShowProfileScreen,
    isCheckingSession,
    showAddDevice,
    setShowAddDevice,
    showThemeManagement,
    setShowThemeManagement,
    showDefaultMapType,
    setShowDefaultMapType,
    showManageNotification,
    setShowManageNotification,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
    showShare,
    setShowShare,
    showRateUs,
    setShowRateUs,
    showPreviousRoutes,
    setShowPreviousRoutes,
    showNotifications,
    setShowNotifications,
    theme,
    devices,
    totalDevices,
    onlineDevices,
    offlineDevices,
    lastRefreshTime,
    
    // Actions
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    updateDeviceCounts,
    setDrawerResetCallback,
  };
};
