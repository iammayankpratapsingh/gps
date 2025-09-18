import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ManageNotificationScreenProps {
  colors: any;
  onBack: () => void;
}

export default function ManageNotificationScreen({ colors, onBack }: ManageNotificationScreenProps) {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: false,
    deviceAlerts: true,
    locationUpdates: true,
    maintenanceReminders: false,
    securityAlerts: true,
    marketingEmails: false,
    weeklyReports: true,
  });

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // TODO: Save to AsyncStorage and sync with backend
    console.log('Notification setting changed:', key, !notifications[key]);
  };

  const notificationSettings = [
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive push notifications on your device',
      category: 'General'
    },
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      category: 'General'
    },
    {
      key: 'deviceAlerts',
      title: 'Device Alerts',
      description: 'Get notified when devices go offline or online',
      category: 'Device'
    },
    {
      key: 'locationUpdates',
      title: 'Location Updates',
      description: 'Receive updates about device location changes',
      category: 'Device'
    },
    {
      key: 'maintenanceReminders',
      title: 'Maintenance Reminders',
      description: 'Reminders for device maintenance and updates',
      category: 'Maintenance'
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      description: 'Important security and safety notifications',
      category: 'Security'
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Emails',
      description: 'Receive promotional emails and app updates',
      category: 'Marketing'
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Get weekly summary reports of your devices',
      category: 'Reports'
    },
  ];

  const groupedSettings = notificationSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof notificationSettings>);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Settings</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Customize how and when you receive notifications from the app.
          </Text>
        </View>

        {Object.entries(groupedSettings).map(([category, settings]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
            <View style={[styles.categoryContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {settings.map((setting, index) => (
                <View key={setting.key}>
                  <View style={styles.notificationOption}>
                    <View style={styles.notificationInfo}>
                      <Text style={[styles.notificationTitle, { color: colors.text }]}>
                        {setting.title}
                      </Text>
                      <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
                        {setting.description}
                      </Text>
                    </View>
                    <Switch
                      value={notifications[setting.key as keyof typeof notifications]}
                      onValueChange={() => handleToggle(setting.key)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={notifications[setting.key as keyof typeof notifications] ? colors.surface : colors.textSecondary}
                    />
                  </View>
                  {index < settings.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // TODO: Save all notification settings
              console.log('Saving notification settings:', notifications);
            }}
          >
            <Text style={[styles.saveButtonText, { color: colors.surface }]}>Save Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={() => {
              // TODO: Reset to default settings
              console.log('Resetting to default settings');
            }}
          >
            <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset to Default</Text>
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
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
  actionsSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
