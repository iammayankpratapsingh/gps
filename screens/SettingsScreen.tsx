import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import NotificationsScreen from './NotificationsScreen';
import PrivacySecurityScreen from './PrivacySecurityScreen';
import BackupSyncScreen from './BackupSyncScreen';
import LanguageScreen from './LanguageScreen';
import AboutScreen from './AboutScreen';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
}

export default function SettingsScreen({ onNavigateToTheme }: SettingsScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null);
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const handleBack = () => {
    setSelectedScreen(null);
  };

  const settingsItems = [
    { id: 'theme', title: 'Theme Management', icon: '🎨', action: onNavigateToTheme },
    { id: 'notifications', title: 'Notifications', icon: '🔔', action: () => setSelectedScreen('notifications') },
    { id: 'privacy', title: 'Privacy & Security', icon: '🔒', action: () => setSelectedScreen('privacy') },
    { id: 'backup', title: 'Backup & Sync', icon: '☁️', action: () => setSelectedScreen('backup') },
    { id: 'language', title: 'Language', icon: '🌐', action: () => setSelectedScreen('language') },
    { id: 'about', title: 'About', icon: 'ℹ️', action: () => setSelectedScreen('about') },
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>

        {settingsItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={item.action}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <Text style={styles.settingIcon}>{item.icon}</Text>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    fontSize: 24,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
