import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface BackupSyncScreenProps {
  onBack: () => void;
}

export default function BackupSyncScreen({ onBack }: BackupSyncScreenProps) {
  const { t } = useTranslation('common');
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [settings, setSettings] = useState({
    autoBackup: true,
    wifiOnly: true,
    deviceData: true,
    routes: true,
    settings: true,
    notifications: false,
    cloudSync: true,
    lastBackup: '2024-12-15T10:30:00Z',
    nextBackup: '2024-12-16T10:30:00Z',
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

  const handleBackupNow = () => {
    Alert.alert(
      t('backupAlertTitle'),
      t('backupAlertMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('backupNow'), onPress: () => console.log('Starting backup...') }
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      t('restoreAlertTitle'),
      t('restoreAlertMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('restoreData'), onPress: () => console.log('Restoring data...') }
      ]
    );
  };

  const handleSyncNow = () => {
    Alert.alert(
      t('syncAlertTitle'),
      t('syncAlertMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('syncNow'), onPress: () => console.log('Starting sync...') }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Backup & Sync</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>☁️ Backup Settings</Text>
          
          <SettingItem
            title={t('autoBackup')}
            description={t('autoBackupDesc')}
            value={settings.autoBackup}
            onValueChange={(value) => handleSettingChange('autoBackup', value)}
            icon="🔄"
          />
          
          <SettingItem
            title={t('wifiOnly')}
            description={t('wifiOnlyDesc')}
            value={settings.wifiOnly}
            onValueChange={(value) => handleSettingChange('wifiOnly', value)}
            icon="📶"
          />
          
          <SettingItem
            title={t('cloudSync')}
            description={t('cloudSyncDesc')}
            value={settings.cloudSync}
            onValueChange={(value) => handleSettingChange('cloudSync', value)}
            icon="☁️"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📦 What to Backup</Text>
          
          <SettingItem
            title={t('deviceData')}
            description={t('deviceDataDesc')}
            value={settings.deviceData}
            onValueChange={(value) => handleSettingChange('deviceData', value)}
            icon="📱"
          />
          
          <SettingItem
            title={t('routes')}
            description={t('routesDesc')}
            value={settings.routes}
            onValueChange={(value) => handleSettingChange('routes', value)}
            icon="🗺️"
          />
          
          <SettingItem
            title={t('appSettings')}
            description={t('appSettingsDesc')}
            value={settings.settings}
            onValueChange={(value) => handleSettingChange('settings', value)}
            icon="⚙️"
          />
          
          <SettingItem
            title={t('notifications')}
            description={t('notificationsDesc')}
            value={settings.notifications}
            onValueChange={(value) => handleSettingChange('notifications', value)}
            icon="🔔"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Backup Status</Text>
          
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Last Backup:</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>{formatDate(settings.lastBackup)}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Next Backup:</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>{formatDate(settings.nextBackup)}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Storage Used:</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>2.3 MB</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🛠️ {t('actions')}</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleBackupNow}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>💾</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{t('backupTitle')}</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  {t('backupDescription')}
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleSyncNow}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>🔄</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{t('syncTitle')}</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  {t('syncDescription')}
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleRestoreData}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>📥</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>{t('restoreTitle')}</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  {t('restoreDescription')}
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
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to prevent bottom navigation overlap
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
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
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
