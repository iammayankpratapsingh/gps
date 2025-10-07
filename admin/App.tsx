import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform, AppState } from 'react-native';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import AdminAuthScreen from './screens/AdminAuthScreen';
import AdminDashboard from './screens/AdminDashboard';
import AdminUserManagement from './screens/AdminUserManagement';
import AdminDeviceManagement from './screens/AdminDeviceManagement';
import AdminDrawer from './components/AdminDrawer';
import { AdminUser } from './types';

// Admin App Content Component (uses useAdmin hook)
const AdminAppContent: React.FC<{
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}> = ({ currentScreen, onNavigate, onLogout }) => {
  const { currentUser, isAdmin, isSuperAdmin, theme, drawerState, closeDrawer } = useAdmin();

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'AdminDashboard':
        return <AdminDashboard onNavigate={onNavigate} />;
      case 'AdminUserManagement':
        return <AdminUserManagement onNavigate={onNavigate} />;
      case 'AdminDeviceManagement':
        return <AdminDeviceManagement onNavigate={onNavigate} />;
      case 'AdminAnalytics':
        return <AdminDashboard onNavigate={onNavigate} />; // Placeholder
      case 'AdminSettings':
        return <AdminDashboard onNavigate={onNavigate} />; // Placeholder
      default:
        return <AdminDashboard onNavigate={onNavigate} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.header}
        translucent={Platform.OS === 'android'}
      />
      
      {/* Main Content */}
      {renderScreen()}
      
      {/* Admin Drawer */}
      <AdminDrawer
        isDrawerOpen={drawerState.isOpen}
        drawerAnimation={drawerState.animation}
        onClose={closeDrawer}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </View>
  );
};

// Main Admin App Component
const AdminApp: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState('AdminDashboard');

  // Navigation handler
  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  // Session refresh effect
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    const setupSessionRefresh = async () => {
      try {
        const adminAuthService = (await import('./services/adminAuthService')).default;
        const currentUser = adminAuthService.getCurrentAdminUser();
        
        if (currentUser) {
          console.log('🔄 Setting up admin session refresh every 30 minutes');
          
          // Refresh session every 30 minutes
          refreshInterval = setInterval(async () => {
            try {
              console.log('🔄 Refreshing admin session...');
              await adminAuthService.saveAdminSession(currentUser);
              console.log('✅ Admin session refreshed');
            } catch (error) {
              console.error('❌ Error refreshing admin session:', error);
            }
          }, 30 * 60 * 1000); // 30 minutes
        }
      } catch (error) {
        console.error('❌ Error setting up session refresh:', error);
      }
    };

    setupSessionRefresh();

    // Cleanup interval on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        console.log('🧹 Admin session refresh interval cleared');
      }
    };
  }, []);

  return (
    <AdminProvider>
      <AdminAppContent 
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={onLogout}
      />
    </AdminProvider>
  );
};

// Main Admin App Entry Point
const AdminAppMain: React.FC<{
  onLogin: (user: AdminUser) => void;
  onBackToUser: () => void;
}> = ({ onLogin, onBackToUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const adminAuthService = (await import('./services/adminAuthService')).default;
        const user = adminAuthService.getCurrentAdminUser();
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
          setIsAuthenticated(true);
          onLogin(user);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onLogin]);

  const handleAdminLogin = (user: AdminUser) => {
    setIsAuthenticated(true);
    onLogin(user);
  };

  // Handle admin logout - navigate back to main app
  const handleAdminLogout = async () => {
    try {
      const adminAuthService = (await import('./services/adminAuthService')).default;
      await adminAuthService.signOut();
      
      // Navigate back to main app
      setIsAuthenticated(false);
      onBackToUser();
    } catch (error) {
      console.error('Error during admin logout:', error);
      // Even if there's an error, navigate back to main app
      setIsAuthenticated(false);
      onBackToUser();
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a202c', justifyContent: 'center', alignItems: 'center' }}>
        {/* Loading indicator would go here */}
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuthScreen onLogin={handleAdminLogin} />;
  }

  return <AdminApp onLogout={handleAdminLogout} />;
};

export default AdminAppMain;
