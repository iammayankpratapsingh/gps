import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Animated, Dimensions, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors, Theme } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import ManageNotificationScreen from './ManageNotificationScreen';
import PrivacySecurityScreen from './PrivacySecurityScreen';
import BackupSyncScreen from './BackupSyncScreen';
import LanguageScreen from './LanguageScreen';
import AboutScreen from './AboutScreen';
import ThemeManagementScreen from './ThemeManagementScreen';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ExitConfirmationPopup from '../components/ExitConfirmationPopup';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
}

export default function SettingsScreen({ onNavigateToTheme }: SettingsScreenProps) {
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
      // If user is on a deep screen (not main settings screen), handle normal back navigation
      if (selectedScreen) {
        handleBack();
        return true; // Prevent default back behavior
      }
      
      // If user is on main settings screen, show exit confirmation
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

  const settingsItems = [
    { id: 'theme', title: t('theme'), icon: 'palette', action: () => {
      setSelectedScreen('theme');
      overlayTranslateX.setValue(screenWidth);
      Animated.parallel([
        Animated.timing(mainTranslateX, {
          toValue: -screenWidth,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } },
    { id: 'manageNotifications', title: t('manageNotification'), icon: 'settings', action: () => {
      setSelectedScreen('manageNotifications');
      overlayTranslateX.setValue(screenWidth);
      Animated.parallel([
        Animated.timing(mainTranslateX, {
          toValue: -screenWidth,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } },
    { id: 'privacy', title: t('privacy'), icon: 'security', action: () => {
      setSelectedScreen('privacy');
      overlayTranslateX.setValue(screenWidth);
      Animated.parallel([
        Animated.timing(mainTranslateX, {
          toValue: -screenWidth,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } },
    { id: 'backup', title: t('backupSync'), icon: 'cloud-upload', action: () => {
      setSelectedScreen('backup');
      overlayTranslateX.setValue(screenWidth);
      Animated.parallel([
        Animated.timing(mainTranslateX, {
          toValue: -screenWidth,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } },
    { id: 'about', title: t('about'), icon: 'info', action: () => {
      setSelectedScreen('about');
      overlayTranslateX.setValue(screenWidth);
      Animated.parallel([
        Animated.timing(mainTranslateX, {
          toValue: -screenWidth,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayTranslateX, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Main content with slide-out */}
      <Animated.View style={{ flex: 1, transform: [{ translateX: mainTranslateX }] }}>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('settings')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>

        {/* Language Switcher */}
        <LanguageSwitcher colors={colors} />

        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Icon name={item.icon} size={24} color={colors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
        </ScrollView>
      </Animated.View>

      {/* Overlay for selected settings screen with slide-in */}
      {selectedScreen && (
        <Animated.View style={[styles.overlay, { transform: [{ translateX: overlayTranslateX }] }]}> 
          {selectedScreen === 'theme' && (
            <ThemeManagementScreen onBack={handleBack} currentTheme={themeService.getCurrentTheme() as Theme} />
          )}
          {selectedScreen === 'manageNotifications' && (
            <ManageNotificationScreen colors={colors} onBack={handleBack} />
          )}
          {selectedScreen === 'privacy' && (
            <PrivacySecurityScreen onBack={handleBack} />
          )}
          {selectedScreen === 'backup' && (
            <BackupSyncScreen onBack={handleBack} />
          )}
          {selectedScreen === 'language' && (
            <LanguageScreen onBack={handleBack} />
          )}
          {selectedScreen === 'about' && (
            <AboutScreen onBack={handleBack} />
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
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to prevent bottom navigation overlap
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
  settingItem: {
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
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
