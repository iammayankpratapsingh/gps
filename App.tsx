import React, { useEffect, useState } from 'react';
import { StatusBar, View, Platform, AppState, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import './config/i18n'; // Initialize i18n
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';
import ProfileScreen from './screens/ProfileScreen';
import AddDeviceScreen from './screens/AddDeviceScreen';
import ThemeManagementScreen from './screens/ThemeManagementScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import AccountScreen from './screens/AccountScreen';
import DefaultMapTypeScreen from './screens/DefaultMapTypeScreen';
import ManageNotificationScreen from './screens/ManageNotificationScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import ShareScreen from './screens/ShareScreen';
import RateUsScreen from './screens/RateUsScreen';
import PreviousRoutesScreen from './screens/PreviousRoutesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
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
import { DeviceProvider } from './contexts/DeviceContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ExitConfirmationPopup from './components/ExitConfirmationPopup';
import { AnimatedTabContainer } from './components/AnimatedTabContainer';

export default function App() {
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
    showNotifications,
    setShowNotifications,
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

  const {
    isDrawerOpen,
    drawerAnimation,
    toggleDrawer,
    closeDrawer,
    resetDrawer,
  } = useDrawer();

  // Set drawer reset callback
  useEffect(() => {
    setDrawerResetCallback(() => resetDrawer);
  }, [resetDrawer, setDrawerResetCallback]);

  // Reset drawer only when user first becomes authenticated
  const [hasResetDrawerOnAuth, setHasResetDrawerOnAuth] = useState(false);
  useEffect(() => {
    if (isAuthenticated && !hasResetDrawerOnAuth) {
      console.log('User authenticated - resetting drawer to show dashboard');
      resetDrawer();
      setHasResetDrawerOnAuth(true);
    } else if (!isAuthenticated) {
      setHasResetDrawerOnAuth(false);
    }
  }, [isAuthenticated, hasResetDrawerOnAuth, resetDrawer]);

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
  
  // Bottom Navigation State
  const [activeTab, setActiveTab] = useState('devices');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const [exitingTab, setExitingTab] = useState<string | null>(null);
  const [animationsEnabled, setAnimationsEnabled] = useState(false);
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
      // If hamburger menu is open, show exit confirmation instead of just closing
      if (isDrawerOpen) {
        setShowExitPopup(true);
        return true; // Prevent default back behavior
      }
      
      // Check if user is on a main tab screen (not in any modal or deep screen)
      const isOnMainScreen = !showAddDevice && !showSearchScreen && !showProfileScreen && 
                            !showThemeManagement && !showDefaultMapType && !showManageNotification &&
                            !showPrivacyPolicy && !showShare && !showRateUs && !showPreviousRoutes &&
                            !showNotifications && !showReauthPopup && !showDeleteConfirmation;
      
      if (isOnMainScreen) {
        // User is on main tab screen, show exit confirmation
        setShowExitPopup(true);
        return true; // Prevent default back behavior
      }
      
      // User is on a deep screen or modal, handle normal back navigation
      return false; // Allow default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isDrawerOpen, showAddDevice, showSearchScreen, showProfileScreen, showThemeManagement, 
      showDefaultMapType, showManageNotification, showPrivacyPolicy, showShare, 
      showRateUs, showPreviousRoutes, showNotifications, showReauthPopup, showDeleteConfirmation]);

  // Menu items with theme management handler
  const handleOpenThemeManagement = () => {
    setShowThemeManagement(true);
  };

  // New screen handlers
  const handleOpenDefaultMapType = () => {
    setShowDefaultMapType(true);
  };

  const handleOpenManageNotification = () => {
    setShowManageNotification(true);
  };

  const handleOpenPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const handleOpenShare = () => {
    setShowShare(true);
  };

  const handleOpenRateUs = () => {
    setShowRateUs(true);
  };

  const handleOpenPreviousRoutes = () => {
    setShowPreviousRoutes(true);
  };

  const handleOpenNotifications = () => {
    setShowNotifications(true);
  };

  // Delete Account Handlers
  const handleDeleteAccount = async () => {
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
      closeDrawer();
    } catch (error) {
      console.error('Error starting delete account flow:', error);
      setShowReauthPopup(true);
      closeDrawer();
    }
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
    handleOpenPreviousRoutes,
    handleOpenNotifications
  );

  // Event handlers
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleProfilePress = () => {
    setShowProfileScreen(true);
    closeDrawer();
  };

  const handleProfileBack = () => {
    setShowProfileScreen(false);
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
      // Enable animations after first tab switch
      setAnimationsEnabled(true);
      
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

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show splash while checking session
  if (isCheckingSession) {
    return <SplashScreen onFinish={() => {}} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (showProfileScreen && userData) {
    return (
      <ProfileScreen
        userData={userData}
        onBack={handleProfileBack}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }


  if (showThemeManagement) {
    return (
      <ThemeManagementScreen 
        onBack={() => setShowThemeManagement(false)}
        currentTheme={theme}
      />
    );
  }

  if (showDefaultMapType) {
    return (
      <DefaultMapTypeScreen 
        onBack={() => setShowDefaultMapType(false)}
        colors={colors}
      />
    );
  }

  if (showManageNotification) {
    return (
      <ManageNotificationScreen 
        onBack={() => setShowManageNotification(false)}
        colors={colors}
      />
    );
  }

  if (showPrivacyPolicy) {
    return (
      <PrivacyPolicyScreen 
        onBack={() => setShowPrivacyPolicy(false)}
        colors={colors}
      />
    );
  }

  if (showShare) {
    return (
      <ShareScreen 
        onBack={() => setShowShare(false)}
        colors={colors}
      />
    );
  }

  if (showRateUs) {
    return (
      <RateUsScreen 
        onBack={() => setShowRateUs(false)}
        colors={colors}
      />
    );
  }

  if (showPreviousRoutes) {
    return (
      <PreviousRoutesScreen 
        onBack={() => setShowPreviousRoutes(false)}
        colors={colors}
      />
    );
  }

  if (showNotifications) {
    return (
      <NotificationsScreen 
        onBack={() => setShowNotifications(false)}
        colors={colors}
      />
    );
  }


  // Render current tab content with dual animations
  const renderTabContent = () => {
    const tabs = ['devices', 'reports', 'settings', 'account'];
    const directions = getAnimationDirections(activeTab, previousTab);
    
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
                    onAddDevicePress={() => setShowAddDevice(true)}
                    onFilterPress={() => setShowSearchScreen(true)}
                    onSearchPress={() => setShowSearchScreen(true)}
                  />

                  {/* Main Dashboard */}
                  <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: 80 }}>
                    <TraccarDeviceList 
                      colors={colors} 
                      addedDevices={addedDevices} 
                      onAddDevice={() => setShowAddDevice(true)}
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
                  onNavigateToProfile={() => setShowProfileScreen(true)}
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
        {showAddDevice ? (
          <AddDeviceScreen 
            onClose={() => setShowAddDevice(false)}
            onAddDevice={handleAddDevice}
            theme={theme}
          />
        ) : showSearchScreen ? (
          <SearchScreen
            colors={colors}
            onBack={() => setShowSearchScreen(false)}
            onDeviceSelect={(device) => {
              console.log('Device selected from search:', device.name);
              // TODO: Implement device selection functionality (e.g., scroll to device, highlight, etc.)
              setShowSearchScreen(false);
            }}
          />
        ) : (
          renderTabContent()
        )}

      {/* Only show these components when not in AddDeviceScreen */}
      {!showAddDevice && (
        <>
          {/* Settings Drawer */}
          <AppDrawer
            colors={colors}
            isDrawerOpen={isDrawerOpen}
            drawerAnimation={drawerAnimation}
            profileImage={profileImage}
            menuItems={menuItems}
            onToggleDrawer={toggleDrawer}
            onProfilePress={handleProfilePress}
            onLogout={handleLogout}
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
        </>
      )}

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

