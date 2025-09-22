import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
    { id: 'theme', title: 'Theme Management', icon: 'palette', action: onNavigateToTheme },
    { id: 'notifications', title: 'Notifications', icon: 'notifications', action: () => setSelectedScreen('notifications') },
    { id: 'privacy', title: 'Privacy & Security', icon: 'security', action: () => setSelectedScreen('privacy') },
    { id: 'backup', title: 'Backup & Sync', icon: 'cloud-upload', action: () => setSelectedScreen('backup') },
    { id: 'language', title: 'Language', icon: 'language', action: () => setSelectedScreen('language') },
    { id: 'about', title: 'About', icon: 'info', action: () => setSelectedScreen('about') },
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
              <Icon name={item.icon} size={24} color={colors.primary} style={styles.settingIcon} />
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
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
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
});
