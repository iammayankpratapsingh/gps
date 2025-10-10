import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, View, Platform, AppState, BackHandler, Animated, Easing, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './config/i18n'; // Initialize i18n
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';
import IntroSlides from './components/IntroSlides';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddDeviceScreen from './screens/AddDeviceScreen';
import ThemeManagementScreen from './screens/ThemeManagementScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AccountScreen from './screens/AccountScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DefaultMapTypeScreen from './screens/DefaultMapTypeScreen';
import ManageNotificationScreen from './screens/ManageNotificationScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ShareScreen from './screens/ShareScreen';
import RateUsScreen from './screens/RateUsScreen';
import PreviousRoutesScreen from './screens/PreviousRoutesScreen';
import { AppHeader } from './components/AppHeader';
import { Dashboard } from './components/Dashboard';
import { TraccarDashboard } from './components/TraccarDashboard';
import { TraccarTest } from './components/TraccarTest';
import { TraccarDeviceList } from './components/TraccarDeviceList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppDrawer } from './components/AppDrawer';
import { SearchScreen } from './components/SearchScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { ReauthenticationPopup } from './components/ReauthenticationPopup';
import { DeleteConfirmationPopup } from './components/DeleteConfirmationPopup';
import { useAppState } from './hooks/useAppState';
import { useDrawer } from './hooks/useDrawer';
import { useImagePicker } from './hooks/useImagePicker';
import { useStatusBar } from './hooks/useStatusBar';
import { createMenuItems } from './constants/menuItems';
import themeService from './services/themeService';
import { UserData } from './services/authService';
import { DeviceProvider } from './contexts/DeviceContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
// import { NotificationsProvider, useNotifications } from './contexts/NotificationsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ExitConfirmationPopup from './components/ExitConfirmationPopup';
import { AnimatedTabContainer } from './components/AnimatedTabContainer';
import firstTimeUserService from './services/firstTimeUserService';
import languageSelectionService from './services/languageSelectionService';
// Admin imports
import { AdminApp, AdminUser } from './admin';

export default function App() {
  // Admin state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);

  // Intro slides state
  const [showIntroSlides, setShowIntroSlides] = useState(false);
  const [isCheckingFirstTimeUser, setIsCheckingFirstTimeUser] = useState(true);
  
  // Language selection state
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [isCheckingLanguageSelection, setIsCheckingLanguageSelection] = useState(true);

  // Admin handlers
  const handleAdminLogin = (adminUser: AdminUser) => {
    setAdminUser(adminUser);
    setIsAdminMode(true);
  };

  const handleBackToUser = () => {
    setIsAdminMode(false);
    setAdminUser(null);
  };


  // Test function to manually check admin session
  const testAdminSession = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const adminSessionData = await AsyncStorage.getItem('admin_session');
      console.log('🧪 Admin session test:', adminSessionData ? 'FOUND' : 'NOT FOUND');
      
      if (adminSessionData) {
        const sessionData = JSON.parse(adminSessionData);
        const isExpired = Date.now() > sessionData.expiresAt;
        console.log('🧪 Session expired:', isExpired);
        console.log('🧪 Session expires at:', new Date(sessionData.expiresAt).toLocaleString());
        console.log('🧪 Current time:', new Date().toLocaleString());
      }
    } catch (error) {
      console.error('🧪 Test error:', error);
    }
  };

  // Make test function available globally
  (global as any).testAdminSession = testAdminSession;


  // Check for existing admin session on app startup - ABSOLUTE PRIORITY
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        console.log('🚀 Checking for admin session...');
        
        // Check AsyncStorage directly for admin session
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const adminSessionData = await AsyncStorage.getItem('admin_session');
        
        if (adminSessionData) {
          console.log('📦 Admin session found in storage');
          const sessionData = JSON.parse(adminSessionData);
          
          // Check if session is not expired (24 hours)
          if (Date.now() <= sessionData.expiresAt) {
            console.log('✅ Admin session is valid, restoring admin mode');
            
            // IMMEDIATELY set admin mode
            setAdminUser(sessionData.userData);
            setIsAdminMode(true);
            
            // Clear any normal user sessions to prevent conflicts
            await AsyncStorage.removeItem('user_session');
            console.log('🧹 Cleared normal user session');
            
            console.log('🎯 Admin mode activated successfully');
            setIsCheckingAdminSession(false);
            return;
          } else {
            console.log('⏰ Admin session expired, clearing...');
            await AsyncStorage.removeItem('admin_session');
          }
        } else {
          console.log('❌ No admin session found');
        }
        
        console.log('ℹ️ No valid admin session, proceeding with normal flow');
      } catch (error) {
        console.error('❌ Error checking admin session:', error);
      } finally {
        setIsCheckingAdminSession(false);
      }
    };

    // Run admin session check immediately
    checkAdminSession();
  }, []);

  // Custom hooks for state management
  const {
    showSplash,
    setShowSplash,
    isAuthenticated,
    profileImage,
    setProfileImage,
    userData,
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
    theme,
    devices,
    totalDevices,
    onlineDevices,
    offlineDevices,
    lastRefreshTime,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    setDrawerResetCallback,
  } = useAppState();

  // Check first-time user status
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const hasCompletedIntro = await firstTimeUserService.hasCompletedIntro();
        console.log('🔍 First-time user check:', hasCompletedIntro ? 'Completed' : 'First time');

        if (!hasCompletedIntro) {
          setShowIntroSlides(true);
        }
      } catch (error) {
        console.error('❌ Error checking first-time user status:', error);
        // Default to showing intro slides if there's an error
        setShowIntroSlides(true);
      } finally {
        setIsCheckingFirstTimeUser(false);
      }
    };

    // Only check if not in admin mode and not checking admin session
    if (!isAdminMode && !isCheckingAdminSession) {
      checkFirstTimeUser();
    }
  }, [isAdminMode, isCheckingAdminSession]);

  // Check language selection status (first-time only)
  useEffect(() => {
    const checkLanguageSelection = async () => {
      try {
        const hasCompletedLanguageSelection = await languageSelectionService.hasCompletedLanguageSelection();
        console.log('🌐 Language selection check:', hasCompletedLanguageSelection ? 'Completed' : 'First time');

        if (!hasCompletedLanguageSelection) {
          setShowLanguageSelection(true);
        }
      } catch (error) {
        console.error('❌ Error checking language selection status:', error);
        // Default to showing language selection if there's an error
        setShowLanguageSelection(true);
      } finally {
        setIsCheckingLanguageSelection(false);
      }
    };

    // Only check if not in admin mode and not checking admin session
    if (!isAdminMode && !isCheckingAdminSession) {
      checkLanguageSelection();
    }
  }, [isAdminMode, isCheckingAdminSession]);

  const {
    isDrawerOpen,
    drawerAnimation,
    toggleDrawer,
    closeDrawer,
    resetDrawer,
    forceCloseDrawer,
    validateDrawerState,
    cleanup: cleanupDrawer,
  } = useDrawer();

  // Set drawer reset callback
  useEffect(() => {
    setDrawerResetCallback(() => resetDrawer);
  }, [resetDrawer, setDrawerResetCallback]);

  // Consolidated drawer reset logic - only reset when authentication state changes
  const [lastAuthState, setLastAuthState] = useState<boolean | null>(null);
  useEffect(() => {
    // Only reset drawer when authentication state actually changes
    if (lastAuthState !== null && lastAuthState !== isAuthenticated) {
      console.log('🔄 Authentication state changed, resetting drawer:', {
        from: lastAuthState,
        to: isAuthenticated
      });
      resetDrawer();
    }
    setLastAuthState(isAuthenticated);
  }, [isAuthenticated, lastAuthState, resetDrawer]);

  // Cleanup drawer on unmount
  useEffect(() => {
    return () => {
      cleanupDrawer();
    };
  }, [cleanupDrawer]);

  // Validate drawer state periodically to prevent flicker
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        validateDrawerState();
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isAuthenticated, validateDrawerState]);

  // Load added devices when app starts
  useEffect(() => {
    if (isAuthenticated) {
      loadAddedDevices();
    }
  }, [isAuthenticated]);

  // Delete Account State
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  
  // Reauthentication State
  const [showReauthPopup, setShowReauthPopup] = useState(false);
  const [isReauthenticated, setIsReauthenticated] = useState(false);
  const [userAuthProvider, setUserAuthProvider] = useState<string>('password');
  
  // Final Delete Confirmation State
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // Search Screen State
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [isSearchAnimating, setIsSearchAnimating] = useState(false);
  
  // Search Screen Animation Values
  const searchTranslateX = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Notifications Screen State
  const [showNotificationsScreen, setShowNotificationsScreen] = useState(false);
  const [isNotificationsAnimating, setIsNotificationsAnimating] = useState(false);
  
  // Simple notification state
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Device Connected',
      message: 'GPS Tracker #001 has come online',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'device',
      isRead: false,
      deviceName: 'GPS Tracker #001',
    },
    {
      id: '2',
      title: 'Low Battery Alert',
      message: 'GPS Tracker #002 battery is below 20%',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'alert',
      isRead: false,
      deviceName: 'GPS Tracker #002',
    },
    {
      id: '3',
      title: 'Geofence Alert',
      message: 'GPS Tracker #003 has left the designated area',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'alert',
      isRead: true,
      deviceName: 'GPS Tracker #003',
    },
  ]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };
  
  // Notifications Screen Animation Values
  const notificationsTranslateX = useRef(new Animated.Value(0)).current;
  const notificationsOpacity = useRef(new Animated.Value(0)).current;
  const notificationsBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Device Opening Animation State
  const [selectedDeviceForAnimation, setSelectedDeviceForAnimation] = useState<any>(null);
  const [isDeviceAnimating, setIsDeviceAnimating] = useState(false);
  
  // Device Opening Animation Values
  const deviceScale = useRef(new Animated.Value(1)).current;
  const deviceOpacity = useRef(new Animated.Value(1)).current;

  // Add Device Screen Animation State
  const [isAddDeviceAnimating, setIsAddDeviceAnimating] = useState(false);
  
  // Add Device Screen Animation Values
  const addDeviceTranslateX = useRef(new Animated.Value(0)).current;
  const addDeviceOpacity = useRef(new Animated.Value(0)).current;
  const addDeviceBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Profile Screen Animation State
  const [showProfileScreenAnimated, setShowProfileScreenAnimated] = useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = useState(false);
  const profileTranslateX = useRef(new Animated.Value(0)).current;
  const profileOpacity = useRef(new Animated.Value(0)).current;
  const profileBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Theme Management Screen Animation State
  const [showThemeManagementAnimated, setShowThemeManagementAnimated] = useState(false);
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const themeTranslateX = useRef(new Animated.Value(0)).current;
  const themeOpacity = useRef(new Animated.Value(0)).current;
  const themeBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Default Map Type Screen Animation State
  const [showDefaultMapTypeAnimated, setShowDefaultMapTypeAnimated] = useState(false);
  const [isMapTypeAnimating, setIsMapTypeAnimating] = useState(false);
  const mapTypeTranslateX = useRef(new Animated.Value(0)).current;
  const mapTypeOpacity = useRef(new Animated.Value(0)).current;
  const mapTypeBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Manage Notification Screen Animation State
  const [showManageNotificationAnimated, setShowManageNotificationAnimated] = useState(false);
  const [isManageNotifAnimating, setIsManageNotifAnimating] = useState(false);
  const manageNotifTranslateX = useRef(new Animated.Value(0)).current;
  const manageNotifOpacity = useRef(new Animated.Value(0)).current;
  const manageNotifBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Privacy Policy Screen Animation State
  const [showPrivacyPolicyAnimated, setShowPrivacyPolicyAnimated] = useState(false);
  const [isPrivacyAnimating, setIsPrivacyAnimating] = useState(false);
  const privacyTranslateX = useRef(new Animated.Value(0)).current;
  const privacyOpacity = useRef(new Animated.Value(0)).current;
  const privacyBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Share Screen Animation State
  const [showShareAnimated, setShowShareAnimated] = useState(false);
  const [isShareAnimating, setIsShareAnimating] = useState(false);
  const shareTranslateX = useRef(new Animated.Value(0)).current;
  const shareOpacity = useRef(new Animated.Value(0)).current;
  const shareBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Rate Us Screen Animation State
  const [showRateUsAnimated, setShowRateUsAnimated] = useState(false);
  const [isRateUsAnimating, setIsRateUsAnimating] = useState(false);
  const rateUsTranslateX = useRef(new Animated.Value(0)).current;
  const rateUsOpacity = useRef(new Animated.Value(0)).current;
  const rateUsBackdropOpacity = useRef(new Animated.Value(0)).current;

  // Previous Routes Screen Animation State
  const [showPreviousRoutesAnimated, setShowPreviousRoutesAnimated] = useState(false);
  const [isPreviousRoutesAnimating, setIsPreviousRoutesAnimating] = useState(false);
  const previousRoutesTranslateX = useRef(new Animated.Value(0)).current;
  const previousRoutesOpacity = useRef(new Animated.Value(0)).current;
  const previousRoutesBackdropOpacity = useRef(new Animated.Value(0)).current;
  
  // Bottom Navigation State
  const [activeTab, setActiveTab] = useState('devices');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [exitingTab, setExitingTab] = useState<string | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [addedDevices, setAddedDevices] = useState<Array<{
    traccarDeviceId: string;
    customName: string;
    deviceId: string;
  }>>([]);
  
  // Exit Confirmation State
  const [showExitPopup, setShowExitPopup] = useState(false);

  const {
    handleProfilePhotoChange,
    uploadProfileImage,
  } = useImagePicker();

  const colors = themeService.getColors();
  
  // Professional status bar that matches header color (only after splash screen)
  useStatusBar({ colors, animated: true, enabled: !showSplash });

  // Search Screen Animation Functions
  const openSearchScreen = () => {
    setIsSearchAnimating(true);
    setShowSearchScreen(true);
    
    // Reset animation values
    searchTranslateX.setValue(300); // Start from right side
    searchOpacity.setValue(0);
    backdropOpacity.setValue(0);
    
    // Animate in - Faster speeds
    Animated.parallel([
      Animated.timing(searchTranslateX, {
        toValue: 0,
        duration: 200, // Reduced from 300ms
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 150, // Reduced from 250ms
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 120, // Reduced from 200ms
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSearchAnimating(false);
    });
  };

  const closeSearchScreen = () => {
    setIsSearchAnimating(true);
    
    // Animate out - Match open speed for symmetry and proper coordination
    Animated.parallel([
      Animated.timing(searchTranslateX, {
        toValue: 300,
        duration: 200, // Match open (200ms)
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 150, // Match open (150ms)
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 120, // Match open (120ms)
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Add small delay to ensure smooth transition
      setTimeout(() => {
        setShowSearchScreen(false);
        setIsSearchAnimating(false);
      }, 50); // Small delay to prevent flicker
    });
  };

  // Notifications Screen Animation Functions
  const openNotificationsScreen = () => {
    setIsNotificationsAnimating(true);
    setShowNotificationsScreen(true);
    
    // Reset animation values
    notificationsTranslateX.setValue(300); // Start from right side
    notificationsOpacity.setValue(0);
    notificationsBackdropOpacity.setValue(0);
    
    // Animate in - Faster speeds
    Animated.parallel([
      Animated.timing(notificationsTranslateX, {
        toValue: 0,
        duration: 200, // Reduced from 300ms
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(notificationsOpacity, {
        toValue: 1,
        duration: 150, // Reduced from 250ms
        useNativeDriver: true,
      }),
      Animated.timing(notificationsBackdropOpacity, {
        toValue: 1,
        duration: 120, // Reduced from 200ms
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsNotificationsAnimating(false);
    });
  };

  const closeNotificationsScreen = () => {
    setIsNotificationsAnimating(true);
    
    // Animate out - Faster speeds and proper coordination
    Animated.parallel([
      Animated.timing(notificationsTranslateX, {
        toValue: 300,
        duration: 180, // Reduced from 250ms
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(notificationsOpacity, {
        toValue: 0,
        duration: 150, // Reduced from 200ms
        useNativeDriver: true,
      }),
      Animated.timing(notificationsBackdropOpacity, {
        toValue: 0,
        duration: 120, // Reduced from 150ms
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Add small delay to ensure smooth transition
      setTimeout(() => {
        setShowNotificationsScreen(false);
        setIsNotificationsAnimating(false);
      }, 50); // Small delay to prevent flicker
    });
  };

  // Profile Screen Animation Functions
  const openProfileScreen = () => {
    setIsProfileAnimating(true);
    setShowProfileScreenAnimated(true);
    
    profileTranslateX.setValue(300);
    profileOpacity.setValue(0);
    profileBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(profileTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(profileOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(profileBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsProfileAnimating(false);
    });
  };

  const closeProfileScreen = () => {
    setIsProfileAnimating(true);
    
    Animated.parallel([
      Animated.timing(profileTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(profileOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(profileBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowProfileScreenAnimated(false);
        setIsProfileAnimating(false);
        setShowProfileScreen(false); // Also update the original state
      }, 50);
    });
  };

  // Theme Management Screen Animation Functions
  const openThemeScreen = () => {
    setIsThemeAnimating(true);
    setShowThemeManagementAnimated(true);
    
    themeTranslateX.setValue(300);
    themeOpacity.setValue(0);
    themeBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(themeTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(themeOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(themeBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsThemeAnimating(false);
    });
  };

  const closeThemeScreen = () => {
    setIsThemeAnimating(true);
    
    Animated.parallel([
      Animated.timing(themeTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(themeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(themeBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowThemeManagementAnimated(false);
        setIsThemeAnimating(false);
        setShowThemeManagement(false); // Also update the original state
      }, 50);
    });
  };

  // Default Map Type Screen Animation Functions
  const openMapTypeScreen = () => {
    setIsMapTypeAnimating(true);
    setShowDefaultMapTypeAnimated(true);
    
    mapTypeTranslateX.setValue(300);
    mapTypeOpacity.setValue(0);
    mapTypeBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(mapTypeTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(mapTypeOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(mapTypeBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMapTypeAnimating(false);
    });
  };

  const closeMapTypeScreen = () => {
    setIsMapTypeAnimating(true);
    
    Animated.parallel([
      Animated.timing(mapTypeTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(mapTypeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(mapTypeBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowDefaultMapTypeAnimated(false);
        setIsMapTypeAnimating(false);
        setShowDefaultMapType(false); // Also update the original state
      }, 50);
    });
  };

  // Manage Notification Screen Animation Functions
  const openManageNotifScreen = () => {
    setIsManageNotifAnimating(true);
    setShowManageNotificationAnimated(true);
    
    manageNotifTranslateX.setValue(300);
    manageNotifOpacity.setValue(0);
    manageNotifBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(manageNotifTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(manageNotifOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(manageNotifBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsManageNotifAnimating(false);
    });
  };

  const closeManageNotifScreen = () => {
    setIsManageNotifAnimating(true);
    
    Animated.parallel([
      Animated.timing(manageNotifTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(manageNotifOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(manageNotifBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowManageNotificationAnimated(false);
        setIsManageNotifAnimating(false);
        setShowManageNotification(false); // Also update the original state
      }, 50);
    });
  };

  // Privacy Policy Screen Animation Functions
  const openPrivacyScreen = () => {
    setIsPrivacyAnimating(true);
    setShowPrivacyPolicyAnimated(true);
    
    privacyTranslateX.setValue(300);
    privacyOpacity.setValue(0);
    privacyBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(privacyTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(privacyOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(privacyBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPrivacyAnimating(false);
    });
  };

  const closePrivacyScreen = () => {
    setIsPrivacyAnimating(true);
    
    Animated.parallel([
      Animated.timing(privacyTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(privacyOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(privacyBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowPrivacyPolicyAnimated(false);
        setIsPrivacyAnimating(false);
        setShowPrivacyPolicy(false); // Also update the original state
      }, 50);
    });
  };

  // Share Screen Animation Functions
  const openShareScreen = () => {
    setIsShareAnimating(true);
    setShowShareAnimated(true);
    
    shareTranslateX.setValue(300);
    shareOpacity.setValue(0);
    shareBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(shareTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(shareOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shareBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsShareAnimating(false);
    });
  };

  const closeShareScreen = () => {
    setIsShareAnimating(true);
    
    Animated.parallel([
      Animated.timing(shareTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(shareOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(shareBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowShareAnimated(false);
        setIsShareAnimating(false);
        setShowShare(false); // Also update the original state
      }, 50);
    });
  };

  // Rate Us Screen Animation Functions
  const openRateUsScreen = () => {
    setIsRateUsAnimating(true);
    setShowRateUsAnimated(true);
    
    rateUsTranslateX.setValue(300);
    rateUsOpacity.setValue(0);
    rateUsBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(rateUsTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(rateUsOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rateUsBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRateUsAnimating(false);
    });
  };

  const closeRateUsScreen = () => {
    setIsRateUsAnimating(true);
    
    Animated.parallel([
      Animated.timing(rateUsTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(rateUsOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(rateUsBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowRateUsAnimated(false);
        setIsRateUsAnimating(false);
        setShowRateUs(false); // Also update the original state
      }, 50);
    });
  };

  // Previous Routes Screen Animation Functions
  const openPreviousRoutesScreen = () => {
    setIsPreviousRoutesAnimating(true);
    setShowPreviousRoutesAnimated(true);
    
    previousRoutesTranslateX.setValue(300);
    previousRoutesOpacity.setValue(0);
    previousRoutesBackdropOpacity.setValue(0);
    
    Animated.parallel([
      Animated.timing(previousRoutesTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(previousRoutesOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(previousRoutesBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsPreviousRoutesAnimating(false);
    });
  };

  const closePreviousRoutesScreen = () => {
    setIsPreviousRoutesAnimating(true);
    
    Animated.parallel([
      Animated.timing(previousRoutesTranslateX, {
        toValue: 300,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(previousRoutesOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(previousRoutesBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setShowPreviousRoutesAnimated(false);
        setIsPreviousRoutesAnimating(false);
        setShowPreviousRoutes(false); // Also update the original state
      }, 50);
    });
  };

  // Device Opening Animation Function
  const animateDeviceOpen = (device: any) => {
    setIsDeviceAnimating(true);
    setSelectedDeviceForAnimation(device);
    
    // Reset animation values
    deviceScale.setValue(1);
    deviceOpacity.setValue(1);
    
    // Animate device card - Faster speeds
    Animated.sequence([
      Animated.parallel([
        Animated.timing(deviceScale, {
          toValue: 0.95,
          duration: 80, // Reduced from 100ms
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(deviceOpacity, {
          toValue: 0.7,
          duration: 80, // Reduced from 100ms
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(deviceScale, {
          toValue: 1.05,
          duration: 120, // Reduced from 150ms
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(deviceOpacity, {
          toValue: 1,
          duration: 120, // Reduced from 150ms
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(deviceScale, {
        toValue: 1,
        duration: 80, // Reduced from 100ms
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start(() => {
      setIsDeviceAnimating(false);
      setSelectedDeviceForAnimation(null);
      
      // TODO: Navigate to device details screen or perform device action
      console.log('Device opened:', device.name);
    });
  };

  // Add Device Screen Animation Functions
  const openAddDeviceScreen = () => {
    setIsAddDeviceAnimating(true);
    setShowAddDevice(true);
    
    // Reset animation values
    addDeviceTranslateX.setValue(300); // Start from right side
    addDeviceOpacity.setValue(0);
    addDeviceBackdropOpacity.setValue(0);
    
    // Animate in - Match other overlays
    Animated.parallel([
      Animated.timing(addDeviceTranslateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(addDeviceOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(addDeviceBackdropOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAddDeviceAnimating(false);
    });
  };

  const closeAddDeviceScreen = () => {
    setIsAddDeviceAnimating(true);
    
    // Animate out - Match other overlays
    Animated.parallel([
      Animated.timing(addDeviceTranslateX, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
      Animated.timing(addDeviceOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(addDeviceBackdropOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Add small delay to ensure smooth transition
      setTimeout(() => {
        setShowAddDevice(false);
        setIsAddDeviceAnimating(false);
      }, 50);
    });
  };

  // Handle app state changes to prevent header jumping
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Force re-render to prevent header jumping
        console.log('App became active - preventing header jump');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Back handler for exit confirmation on main tab screens
  useEffect(() => {
    const backAction = () => {
      // Close topmost overlays/modals first
      if (showNotificationsScreen) {
        closeNotificationsScreen();
        return true;
      }
      if (showSearchScreen) {
        closeSearchScreen();
        return true;
      }
      if (showAddDevice) {
        closeAddDeviceScreen();
        return true;
      }
      if (showDeleteConfirmation) {
        setShowDeleteConfirmation(false);
        return true;
      }
      if (showReauthPopup) {
        setShowReauthPopup(false);
        return true;
      }
      if (showProfileScreen || showProfileScreenAnimated) {
        closeProfileScreen();
        return true;
      }
      if (showThemeManagement || showThemeManagementAnimated) {
        closeThemeScreen();
        return true;
      }
      if (showDefaultMapType || showDefaultMapTypeAnimated) {
        closeMapTypeScreen();
        return true;
      }
      if (showManageNotification || showManageNotificationAnimated) {
        closeManageNotifScreen();
        return true;
      }
      if (showPrivacyPolicy || showPrivacyPolicyAnimated) {
        closePrivacyScreen();
        return true;
      }
      if (showShare || showShareAnimated) {
        closeShareScreen();
        return true;
      }
      if (showRateUs || showRateUsAnimated) {
        closeRateUsScreen();
        return true;
      }
      if (showPreviousRoutes || showPreviousRoutesAnimated) {
        closePreviousRoutesScreen();
        return true;
      }

      // If hamburger menu is open, show exit confirmation instead of just closing
      if (isDrawerOpen) {
        setShowExitPopup(true);
        return true; // Prevent default back behavior
      }

      // On main screens, show exit confirmation
      setShowExitPopup(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isDrawerOpen, showAddDevice, showSearchScreen, showProfileScreen, showThemeManagement, 
      showDefaultMapType, showManageNotification, showPrivacyPolicy, showShare, 
      showRateUs, showPreviousRoutes, showNotificationsScreen, showReauthPopup, showDeleteConfirmation,
      showProfileScreenAnimated, showThemeManagementAnimated, showDefaultMapTypeAnimated, 
      showManageNotificationAnimated, showPrivacyPolicyAnimated, showShareAnimated, 
      showRateUsAnimated, showPreviousRoutesAnimated]);

  // Menu items with theme management handler
  const handleOpenThemeManagement = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowThemeManagement(true);
      openThemeScreen();
    }, 100);
  };

  // New screen handlers
  const handleOpenDefaultMapType = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowDefaultMapType(true);
      openMapTypeScreen();
    }, 100);
  };

  const handleOpenManageNotification = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowManageNotification(true);
      openManageNotifScreen();
    }, 100);
  };

  const handleOpenPrivacyPolicy = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowPrivacyPolicy(true);
      openPrivacyScreen();
    }, 100);
  };

  const handleOpenShare = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowShare(true);
      openShareScreen();
    }, 100);
  };

  const handleOpenRateUs = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowRateUs(true);
      openRateUsScreen();
    }, 100);
  };

  const handleOpenPreviousRoutes = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowPreviousRoutes(true);
      openPreviousRoutesScreen();
    }, 100);
  };

  const handleOpenNotifications = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      openNotificationsScreen();
    }, 100);
  };



  // Delete Account Handlers
  const handleDeleteAccount = async () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(async () => {
      try {
        // Get user's authentication provider
        const authService = (await import('./services/authService')).default;
        
        // Debug current user state
        authService.debugCurrentUser();
        
        const authProvider = authService.getUserAuthProvider();
        setUserAuthProvider(authProvider);
        
        console.log('Starting delete account flow, auth provider:', authProvider);
        
        // Always show reauthentication first (like GitHub/Google)
        setShowReauthPopup(true);
      } catch (error) {
        console.error('Error starting delete account flow:', error);
        setShowReauthPopup(true);
      }
    }, 100);
  };


  const handleCancelReauth = () => {
    setShowReauthPopup(false);
    setIsReauthenticated(false);
  };

  const handleReauthSuccess = () => {
    console.log('✅ Reauthentication successful, showing final confirmation');
    setShowReauthPopup(false);
    setIsReauthenticated(true);
    setShowDeleteConfirmation(true);
  };

  const handleCancelDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setIsReauthenticated(false);
  };

  const handleConfirmDeleteConfirmation = async () => {
    console.log('✅ Final confirmation received, proceeding to delete account');
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Delete operation timeout');
      setDeleteAccountError('Delete operation timed out. Please try again.');
      setIsDeletingAccount(false);
    }, 30000); // 30 second timeout
    
    try {
      console.log('=== USER CONFIRMED DELETE - STARTING ACCOUNT DELETION ===');
      const authService = (await import('./services/authService')).default;
      
      // Check if user is reauthenticated
      if (!isReauthenticated) {
        console.log('❌ User not reauthenticated, cannot delete account');
        setDeleteAccountError('Please complete reauthentication first.');
        setIsDeletingAccount(false);
        clearTimeout(timeoutId);
        return;
      }
      
      const result = await authService.deleteAccount();
      
      // Clear timeout since operation completed
      clearTimeout(timeoutId);
      
      console.log('Delete account result:', result);
      
      if (result.success) {
        console.log('✅ Account deletion successful');
        
        // Close popup immediately
        setShowDeleteConfirmation(false);
        setIsDeletingAccount(false);
        setDeleteAccountError(null);
        setIsReauthenticated(false);
        
        // Show success message
        alert('✅ Account deleted successfully! You will be redirected to login.');
        
        // The user will be automatically logged out and redirected to auth screen
        // due to Firebase Auth state change
      } else {
        console.error('❌ Account deletion failed:', result.error);
        setDeleteAccountError(result.error || 'Failed to delete account');
        setIsDeletingAccount(false);
      }
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleConfirmDeleteConfirmation:', error);
      setDeleteAccountError(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
      setIsDeletingAccount(false);
      clearTimeout(timeoutId);
    }
  };


  const menuItems = createMenuItems(
    handleOpenThemeManagement, 
    handleDeleteAccount,
    handleOpenDefaultMapType,
    handleOpenManageNotification,
    handleOpenPrivacyPolicy,
    handleOpenShare,
    handleOpenRateUs,
    handleOpenPreviousRoutes
  );

  // Event handlers
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Intro slides handlers
  const handleIntroSlidesComplete = async () => {
    console.log('✅ Intro slides completed');
    await firstTimeUserService.markIntroCompleted();
    setShowIntroSlides(false);
  };

  const handleIntroSlidesSkip = async () => {
    console.log('⏭️ Intro slides skipped');
    await firstTimeUserService.markIntroCompleted();
    setShowIntroSlides(false);
  };

  // Language selection handlers
  const handleLanguageSelectionComplete = async () => {
    console.log('✅ Language selection completed');
    await languageSelectionService.markLanguageSelectionCompleted();
    setShowLanguageSelection(false);
  };

  const handleProfilePress = () => {
    closeDrawer(); // Standard UX: close drawer before navigation
    // Small delay for smooth sequential animation
    setTimeout(() => {
      setShowProfileScreen(true);
      openProfileScreen();
    }, 100);
  };

  const handleProfileBack = () => {
    closeProfileScreen();
  };

  // Helper function to determine animation directions
  const getAnimationDirections = (currentTab: string, previousTab: string | null) => {
    const tabOrder = ['devices', 'reports', 'settings', 'account'];
    const currentIndex = tabOrder.indexOf(currentTab);
    
    // If no previous tab (initial load), always slide from right
    if (!previousTab) {
      return {
        enterDirection: 'right' as const,
        exitDirection: 'left' as const
      };
    }
    
    const previousIndex = tabOrder.indexOf(previousTab);
    
    if (currentIndex > previousIndex) {
      // Moving forward (left to right): new tab enters from right, old tab exits to left
      return {
        enterDirection: 'right' as const,
        exitDirection: 'left' as const
      };
    } else {
      // Moving backward (right to left): new tab enters from left, old tab exits to right
      return {
        enterDirection: 'left' as const,
        exitDirection: 'right' as const
      };
    }
  };

  const handleTabPress = (tab: string) => {
    if (tab !== activeTab) {
      setPreviousTab(activeTab);
      setExitingTab(activeTab);
      setActiveTab(tab);
      
      // Clear exiting tab after animation completes
      setTimeout(() => {
        setExitingTab(null);
      }, 300);
    }
    // Close drawer if open when switching tabs
    if (isDrawerOpen) {
      closeDrawer();
    }
  };

  // Save added devices to AsyncStorage
  const saveAddedDevices = async (devices: any[]) => {
    try {
      await AsyncStorage.setItem('addedDevices', JSON.stringify(devices));
      console.log('[App] Saved added devices to storage:', devices.length);
    } catch (error) {
      console.error('[App] Failed to save added devices:', error);
    }
  };

  // Load added devices from AsyncStorage
  const loadAddedDevices = async () => {
    try {
      const stored = await AsyncStorage.getItem('addedDevices');
      if (stored) {
        const devices = JSON.parse(stored);
        setAddedDevices(devices);
        console.log('[App] Loaded added devices from storage:', devices.length);
      }
    } catch (error) {
      console.error('[App] Failed to load added devices:', error);
    }
  };

  const handleAddDevice = (deviceData: any) => {
    // Add device to the addedDevices state with custom name
    const newAddedDevice = {
      traccarDeviceId: deviceData.deviceId, // This is the Traccar uniqueId
      customName: deviceData.objectName, // This is the custom name from AddDeviceScreen
      deviceId: deviceData.deviceId,
    };
    
    const updatedDevices = [...addedDevices, newAddedDevice];
    setAddedDevices(updatedDevices);
    saveAddedDevices(updatedDevices);
    console.log('Device added with custom name:', newAddedDevice);
  };

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
    if (userData) {
      uploadProfileImage(userData, uri, (url: string) => {
        setProfileImage(url);
      });
    }
  };

  const handleProfilePhotoPress = () => {
    handleProfilePhotoChange(userData, handleImageSelected, (url: string) => {
      setProfileImage(url);
    });
  };

  // Exit confirmation handlers
  const handleExitConfirm = () => {
    setShowExitPopup(false);
    if (isDrawerOpen) {
      toggleDrawer(); // Close hamburger menu if open
    }
    BackHandler.exitApp(); // Close the app
  };

  const handleExitCancel = () => {
    setShowExitPopup(false);
    // Don't close hamburger menu on cancel - let user continue using it
  };

  // Always show custom splash screen first, then handle session checking
  if (showSplash || isCheckingSession || isCheckingAdminSession || isCheckingFirstTimeUser || isCheckingLanguageSelection) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show intro slides for first-time users only
  if (showIntroSlides) {
    return (
      <LanguageProvider>
        <IntroSlides
          onComplete={handleIntroSlidesComplete}
          onSkip={handleIntroSlidesSkip}
        />
      </LanguageProvider>
    );
  }

  // Show language selection screen for first-time users only
  if (showLanguageSelection) {
    return (
      <LanguageProvider>
        <LanguageSelectionScreen
          onComplete={handleLanguageSelectionComplete}
        />
      </LanguageProvider>
    );
  }

  // Admin mode routing - ABSOLUTE PRIORITY
  if (isAdminMode && adminUser) {
    console.log('🎯 Rendering Admin App - admin mode active');
    return (
      <AdminApp
        onLogin={handleAdminLogin}
        onBackToUser={handleBackToUser}
      />
    );
  }

        // Only show login screen if not authenticated AND not in admin mode
        if (!isAuthenticated && !isAdminMode) {
          console.log('🔐 Showing login screen');
          return <AuthScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
        }

  // Removed early return statements - now using overlay approach for all menu screens

  // Render current tab content with dual animations
  const renderTabContent = () => {
    const tabs = ['devices', 'reports', 'settings', 'account'];
    const directions = getAnimationDirections(activeTab, previousTab);
    
    // Disable tab animations when overlays are transitioning to prevent flicker
    const shouldDisableTabAnimations = isSearchAnimating || isNotificationsAnimating || 
      isProfileAnimating || isThemeAnimating || isMapTypeAnimating || 
      isManageNotifAnimating || isPrivacyAnimating || isShareAnimating || 
      isRateUsAnimating || isPreviousRoutesAnimating;
    
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const isExiting = exitingTab === tab;
          
          // Only render active tab or exiting tab
          if (!isActive && !isExiting) return null;
          
          return (
            <AnimatedTabContainer
              key={tab}
              isActive={isActive}
              isExiting={isExiting}
              enterDirection={directions.enterDirection}
              exitDirection={directions.exitDirection}
              animationsEnabled={animationsEnabled}
            >
              {tab === 'devices' && (
                <>
                  {/* Fixed Header with Absolute Positioning */}
                  <AppHeader
                    colors={colors}
                    onMenuPress={toggleDrawer}
                    onAddDevicePress={openAddDeviceScreen}
                    onSearchPress={openSearchScreen}
                    onNotificationPress={openNotificationsScreen}
                    notificationCount={unreadCount}
                  />

                  {/* Main Dashboard */}
                  <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: 80 }}>
                    <TraccarDeviceList 
                      colors={colors} 
                      addedDevices={addedDevices} 
                      onAddDevice={openAddDeviceScreen}
                      onDevicePress={animateDeviceOpen}
                      selectedDeviceForAnimation={selectedDeviceForAnimation}
                      deviceScale={deviceScale}
                      deviceOpacity={deviceOpacity}
                      isDeviceAnimating={isDeviceAnimating}
                    />
                  </View>
                </>
              )}
              
              {tab === 'reports' && <ReportsScreen />}
              
              {tab === 'settings' && (
                <SettingsScreen onNavigateToTheme={() => setShowThemeManagement(true)} />
              )}
              
              {tab === 'account' && (
                <AccountScreen
                  userData={userData}
                  profileImage={profileImage}
                  onNavigateToProfile={handleProfilePress}
                  onLogout={handleLogout}
                />
              )}
            </AnimatedTabContainer>
          );
        })}
      </View>
    );
  };


  return (
    <LanguageProvider>
      <WebSocketProvider>
        <DeviceProvider>
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            {renderTabContent()}

            {/* Search Overlay */}
            {showSearchScreen && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: backdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeSearchScreen}
                    disabled={isSearchAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: searchTranslateX }],
                    opacity: searchOpacity,
                    zIndex: 1001,
                  }}
                >
                  <SearchScreen
                    colors={colors}
                    onBack={closeSearchScreen}
                    onDeviceSelect={(device) => {
                      console.log('Device selected from search:', device.name);
                      closeSearchScreen();
                    }}
                    addedDevices={addedDevices}
                  />
                </Animated.View>
              </>
            )}

            {/* Notifications Overlay */}
            {showNotificationsScreen && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: notificationsBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeNotificationsScreen}
                    disabled={isNotificationsAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: notificationsTranslateX }],
                    opacity: notificationsOpacity,
                    zIndex: 1001,
                    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
                  }}
                >
                  <NotificationsScreen
                    colors={colors}
                    onBack={closeNotificationsScreen}
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                  />
                </Animated.View>
              </>
            )}

            {/* Add Device Overlay */}
            {showAddDevice && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: addDeviceBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeAddDeviceScreen}
                    disabled={isAddDeviceAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: addDeviceTranslateX }],
                    opacity: addDeviceOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <AddDeviceScreen 
                    onClose={closeAddDeviceScreen}
                    onAddDevice={handleAddDevice}
                    theme={theme}
                  />
                </Animated.View>
              </>
            )}

            {/* Profile Screen Overlay */}
            {showProfileScreenAnimated && userData && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: profileBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeProfileScreen}
                    disabled={isProfileAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: profileTranslateX }],
                    opacity: profileOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <ProfileScreen
                    userData={userData}
                    onBack={closeProfileScreen}
                    onUpdateProfile={handleUpdateProfile}
                  />
                </Animated.View>
              </>
            )}

            {/* Theme Management Overlay */}
            {showThemeManagementAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: themeBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeThemeScreen}
                    disabled={isThemeAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: themeTranslateX }],
                    opacity: themeOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <ThemeManagementScreen 
                    onBack={closeThemeScreen}
                    currentTheme={theme}
                  />
                </Animated.View>
              </>
            )}

            {/* Default Map Type Overlay */}
            {showDefaultMapTypeAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: mapTypeBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeMapTypeScreen}
                    disabled={isMapTypeAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: mapTypeTranslateX }],
                    opacity: mapTypeOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <DefaultMapTypeScreen 
                    onBack={closeMapTypeScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Manage Notification Overlay */}
            {showManageNotificationAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: manageNotifBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeManageNotifScreen}
                    disabled={isManageNotifAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: manageNotifTranslateX }],
                    opacity: manageNotifOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <ManageNotificationScreen 
                    onBack={closeManageNotifScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Privacy Policy Overlay */}
            {showPrivacyPolicyAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: privacyBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closePrivacyScreen}
                    disabled={isPrivacyAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: privacyTranslateX }],
                    opacity: privacyOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <PrivacyPolicyScreen 
                    onBack={closePrivacyScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Share Screen Overlay */}
            {showShareAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: shareBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeShareScreen}
                    disabled={isShareAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: shareTranslateX }],
                    opacity: shareOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <ShareScreen 
                    onBack={closeShareScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Rate Us Screen Overlay */}
            {showRateUsAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: rateUsBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closeRateUsScreen}
                    disabled={isRateUsAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: rateUsTranslateX }],
                    opacity: rateUsOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <RateUsScreen 
                    onBack={closeRateUsScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Previous Routes Overlay */}
            {showPreviousRoutesAnimated && (
              <>
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    opacity: previousRoutesBackdropOpacity,
                    zIndex: 1000,
                  }}
                >
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={closePreviousRoutesScreen}
                    disabled={isPreviousRoutesAnimating}
                  />
                </Animated.View>

                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: [{ translateX: previousRoutesTranslateX }],
                    opacity: previousRoutesOpacity,
                    zIndex: 1001,
                    backgroundColor: colors.background,
                  }}
                >
                  <PreviousRoutesScreen 
                    onBack={closePreviousRoutesScreen}
                    colors={colors}
                  />
                </Animated.View>
              </>
            )}

            {/* Settings Drawer */}
            <AppDrawer
              colors={colors}
              isDrawerOpen={isDrawerOpen}
              drawerAnimation={drawerAnimation}
              profileImage={profileImage}
              menuItems={menuItems}
              onToggleDrawer={toggleDrawer}
              onProfilePress={handleProfilePress}
              onLanguageChange={(languageCode) => {
                // Language change is handled by the LanguageContext
                console.log('Language changed to:', languageCode);
              }}
            />

            {/* Reauthentication Popup */}
            <ReauthenticationPopup
              visible={showReauthPopup}
              onSuccess={handleReauthSuccess}
              onCancel={handleCancelReauth}
              colors={colors}
              userEmail={userData?.email}
              authProvider={userAuthProvider}
            />

            {/* Final Delete Confirmation Popup */}
            <DeleteConfirmationPopup
              visible={showDeleteConfirmation}
              onConfirm={handleConfirmDeleteConfirmation}
              onCancel={handleCancelDeleteConfirmation}
              colors={colors}
              isLoading={isDeletingAccount}
              errorMessage={deleteAccountError || undefined}
            />

            {/* Bottom Navigation */}
            <BottomNavigation
              colors={colors}
              activeTab={activeTab}
              onTabPress={handleTabPress}
            />
          </View>

          {/* Exit Confirmation Popup */}
          <ExitConfirmationPopup
            visible={showExitPopup}
            onConfirm={handleExitConfirm}
            onCancel={handleExitCancel}
            colors={colors}
          />
        </DeviceProvider>
      </WebSocketProvider>
    </LanguageProvider>
  );
}

