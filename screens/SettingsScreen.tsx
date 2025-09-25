import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import NotificationsScreen from './NotificationsScreen';
import PrivacySecurityScreen from './PrivacySecurityScreen';
import BackupSyncScreen from './BackupSyncScreen';
import LanguageScreen from './LanguageScreen';
import AboutScreen from './AboutScreen';
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
        setSelectedScreen(null);
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
    setSelectedScreen(null);
  };

  const handleExitConfirm = () => {
    setShowExitPopup(false);
    BackHandler.exitApp(); // Close the app
  };

  const handleExitCancel = () => {
    setShowExitPopup(false);
  };

  const settingsItems = [
    { id: 'theme', title: t('theme'), icon: 'palette', action: onNavigateToTheme },
    { id: 'notifications', title: t('notifications'), icon: 'notifications', action: () => setSelectedScreen('notifications') },
    { id: 'privacy', title: t('privacy'), icon: 'security', action: () => setSelectedScreen('privacy') },
    { id: 'backup', title: t('backupSync'), icon: 'cloud-upload', action: () => setSelectedScreen('backup') },
    { id: 'about', title: t('about'), icon: 'info', action: () => setSelectedScreen('about') },
  ];

  // Render individual settings screens
  if (selectedScreen === 'notifications') {
    return <NotificationsScreen colors={colors} onBack={handleBack} />;
  }
  
  if (selectedScreen === 'privacy') {
    return <PrivacySecurityScreen onBack={handleBack} />;
  }
  
  if (selectedScreen === 'backup') {
    return <BackupSyncScreen onBack={handleBack} />;
  }
  
  if (selectedScreen === 'language') {
    return <LanguageScreen onBack={handleBack} />;
  }
  
  if (selectedScreen === 'about') {
    return <AboutScreen onBack={handleBack} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.content, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
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
