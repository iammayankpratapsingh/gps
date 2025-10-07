import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, BackHandler, Animated, Dimensions, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import { UserData } from '../services/authService';
import SubscriptionScreen from './SubscriptionScreen';
import BillingPaymentsScreen from './BillingPaymentsScreen';
import HelpSupportScreen from './HelpSupportScreen';
import SendFeedbackScreen from './SendFeedbackScreen';
import ExitConfirmationPopup from '../components/ExitConfirmationPopup';

interface AccountScreenProps {
  userData: UserData | null;
  profileImage: string | null;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export default function AccountScreen({ 
  userData, 
  profileImage, 
  onNavigateToProfile, 
  onLogout 
}: AccountScreenProps) {
  const { t } = useTranslation('common');
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Slide-only animation values
  const mainTranslateX = useRef(new Animated.Value(0)).current;
  const overlayTranslateX = useRef(new Animated.Value(screenWidth)).current;
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  // Back handler for exit confirmation
  useEffect(() => {
    const backAction = () => {
      // If user is on a deep screen (not main account screen), handle normal back navigation
      if (selectedScreen) {
        handleBack();
        return true; // Prevent default back behavior
      }
      
      // If user is on main account screen, show exit confirmation
      setShowExitPopup(true);
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [selectedScreen]);

  const handleBack = () => {
    if (!selectedScreen) return;
    // Slide overlay out and main back in
    Animated.parallel([
      Animated.timing(overlayTranslateX, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(mainTranslateX, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedScreen(null);
      overlayTranslateX.setValue(screenWidth);
      mainTranslateX.setValue(0);
    });
  };

  const handleExitConfirm = () => {
    setShowExitPopup(false);
    BackHandler.exitApp(); // Close the app
  };

  const handleExitCancel = () => {
    setShowExitPopup(false);
  };

  const accountItems = [
    { id: 'subscription', title: 'Subscription', icon: 'diamond', action: () => {
      overlayTranslateX.setValue(screenWidth);
      setSelectedScreen('subscription');
      Animated.parallel([
        Animated.timing(mainTranslateX, { toValue: -screenWidth, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(overlayTranslateX, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
    } },
    { id: 'billing', title: 'Billing & Payments', icon: 'payment', action: () => {
      overlayTranslateX.setValue(screenWidth);
      setSelectedScreen('billing');
      Animated.parallel([
        Animated.timing(mainTranslateX, { toValue: -screenWidth, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(overlayTranslateX, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
    } },
    { id: 'support', title: 'Help & Support', icon: 'help', action: () => {
      overlayTranslateX.setValue(screenWidth);
      setSelectedScreen('support');
      Animated.parallel([
        Animated.timing(mainTranslateX, { toValue: -screenWidth, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(overlayTranslateX, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
    } },
    { id: 'feedback', title: 'Send Feedback', icon: 'feedback', action: () => {
      overlayTranslateX.setValue(screenWidth);
      setSelectedScreen('feedback');
      Animated.parallel([
        Animated.timing(mainTranslateX, { toValue: -screenWidth, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(overlayTranslateX, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true })
      ]).start();
    } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Main content with slide-out */}
      <Animated.View style={{ flex: 1, transform: [{ translateX: mainTranslateX }] }}>
        <ScrollView style={[styles.content, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your account and preferences
          </Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.profileContent} onPress={onNavigateToProfile} activeOpacity={0.7}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profilePlaceholder, { backgroundColor: colors.primary }]}>
                  <Icon name="person" size={30} color="#ffffff" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userData?.fullName || 'User Name'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {userData?.email || 'user@example.com'}
              </Text>
            </View>
            <Icon name="edit" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Account Items */}
        {accountItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.accountItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={styles.accountContent}>
              <Icon name={item.icon} size={24} color={colors.primary} style={styles.accountIcon} />
              <Text style={[styles.accountTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Overlay for selected account screen with slide-in */}
      {selectedScreen && (
        <Animated.View style={[styles.overlay, { transform: [{ translateX: overlayTranslateX }], backgroundColor: colors.background }]}> 
          {selectedScreen === 'subscription' && (
            <SubscriptionScreen onBack={handleBack} />
          )}
          {selectedScreen === 'billing' && (
            <BillingPaymentsScreen onBack={handleBack} />
          )}
          {selectedScreen === 'support' && (
            <HelpSupportScreen onBack={handleBack} />
          )}
          {selectedScreen === 'feedback' && (
            <SendFeedbackScreen onBack={handleBack} />
          )}
        </Animated.View>
      )}

      {/* Exit Confirmation Popup */}
      <ExitConfirmationPopup
        visible={showExitPopup}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    marginRight: 16,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
