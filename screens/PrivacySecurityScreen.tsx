import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface PrivacySecurityScreenProps {
  onBack: () => void;
}

export default function PrivacySecurityScreen({ onBack }: PrivacySecurityScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [settings, setSettings] = useState({
    locationTracking: true,
    dataCollection: false,
    analytics: true,
    crashReports: true,
    biometricAuth: false,
    autoLock: true,
    dataEncryption: true,
    twoFactorAuth: false,
  });
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported to a secure file. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleting account...') }
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    description, 
    value, 
    onValueChange, 
    icon 
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: string;
  }) => (
    <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.surface : colors.textSecondary}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔒 Privacy Settings</Text>
          
          <SettingItem
            title="Location Tracking"
            description="Allow the app to track your device location"
            value={settings.locationTracking}
            onValueChange={(value) => handleSettingChange('locationTracking', value)}
            icon="📍"
          />
          
          <SettingItem
            title="Data Collection"
            description="Allow collection of usage data for app improvement"
            value={settings.dataCollection}
            onValueChange={(value) => handleSettingChange('dataCollection', value)}
            icon="📊"
          />
          
          <SettingItem
            title="Analytics"
            description="Share anonymous analytics to help improve the app"
            value={settings.analytics}
            onValueChange={(value) => handleSettingChange('analytics', value)}
            icon="📈"
          />
          
          <SettingItem
            title="Crash Reports"
            description="Automatically send crash reports to help fix issues"
            value={settings.crashReports}
            onValueChange={(value) => handleSettingChange('crashReports', value)}
            icon="🐛"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🛡️ Security Settings</Text>
          
          <SettingItem
            title="Biometric Authentication"
            description="Use fingerprint or face recognition to unlock the app"
            value={settings.biometricAuth}
            onValueChange={(value) => handleSettingChange('biometricAuth', value)}
            icon="👆"
          />
          
          <SettingItem
            title="Auto Lock"
            description="Automatically lock the app after inactivity"
            value={settings.autoLock}
            onValueChange={(value) => handleSettingChange('autoLock', value)}
            icon="🔐"
          />
          
          <SettingItem
            title="Data Encryption"
            description="Encrypt all stored data for maximum security"
            value={settings.dataEncryption}
            onValueChange={(value) => handleSettingChange('dataEncryption', value)}
            icon="🔒"
          />
          
          <SettingItem
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onValueChange={(value) => handleSettingChange('twoFactorAuth', value)}
            icon="🔑"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Data Management</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleExportData}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>📤</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Export Data</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Download a copy of your data
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Delete Account</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Permanently delete your account and data
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
