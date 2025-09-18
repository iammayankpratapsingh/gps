import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const handleOpenLink = (url: string, title: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', `Could not open ${title}`);
    });
  };

  const handleCheckUpdates = () => {
    Alert.alert(
      'Check for Updates',
      'Checking for app updates...',
      [
        { text: 'OK', onPress: () => console.log('Checking for updates...') }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Thank you for using our app! Would you like to rate it on the app store?',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Opening app store...') }
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Share App',
      'Share this app with your friends and family!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Sharing app...') }
      ]
    );
  };

  const InfoItem = ({ 
    title, 
    value, 
    onPress, 
    icon 
  }: {
    title: string;
    value: string;
    onPress?: () => void;
    icon: string;
  }) => (
    <TouchableOpacity
      style={[styles.infoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.infoContent}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <View style={styles.infoText}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
        </View>
      </View>
      {onPress && <Text style={[styles.infoArrow, { color: colors.primary }]}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={[styles.appInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.appIcon}>📱</Text>
            <Text style={[styles.appName, { color: colors.text }]}>GPS Tracker</Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
            <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
              Professional GPS tracking and device management app
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 App Information</Text>
          
          <InfoItem
            title="Build Number"
            value="2024.12.15.001"
            icon="🔢"
          />
          
          <InfoItem
            title="Release Date"
            value="December 15, 2024"
            icon="📅"
          />
          
          <InfoItem
            title="App Size"
            value="45.2 MB"
            icon="💾"
          />
          
          <InfoItem
            title="Minimum OS"
            value="iOS 13.0 / Android 8.0"
            icon="📱"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔗 Links & Support</Text>
          
          <InfoItem
            title="Website"
            value="www.gpstracker.com"
            onPress={() => handleOpenLink('https://www.gpstracker.com', 'Website')}
            icon="🌐"
          />
          
          <InfoItem
            title="Support"
            value="support@gpstracker.com"
            onPress={() => handleOpenLink('mailto:support@gpstracker.com', 'Support Email')}
            icon="📧"
          />
          
          <InfoItem
            title="Privacy Policy"
            value="View our privacy policy"
            onPress={() => handleOpenLink('https://www.gpstracker.com/privacy', 'Privacy Policy')}
            icon="🔒"
          />
          
          <InfoItem
            title="Terms of Service"
            value="View terms and conditions"
            onPress={() => handleOpenLink('https://www.gpstracker.com/terms', 'Terms of Service')}
            icon="📄"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ App Actions</Text>
          
          <InfoItem
            title="Check for Updates"
            value="Check if a new version is available"
            onPress={handleCheckUpdates}
            icon="🔄"
          />
          
          <InfoItem
            title="Rate App"
            value="Rate us on the app store"
            onPress={handleRateApp}
            icon="⭐"
          />
          
          <InfoItem
            title="Share App"
            value="Share with friends and family"
            onPress={handleShareApp}
            icon="📤"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 Development Team</Text>
          
          <View style={[styles.teamCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.teamTitle, { color: colors.text }]}>GPS Tracker Team</Text>
            <Text style={[styles.teamDescription, { color: colors.textSecondary }]}>
              Developed with ❤️ by a dedicated team of developers, designers, and engineers 
              who are passionate about creating the best GPS tracking experience.
            </Text>
            <Text style={[styles.teamDescription, { color: colors.textSecondary }]}>
              Special thanks to our beta testers and community for their valuable feedback 
              and support in making this app better.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📜 Open Source</Text>
          
          <View style={[styles.opensourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.opensourceTitle, { color: colors.text }]}>Open Source Libraries</Text>
            <Text style={[styles.opensourceText, { color: colors.textSecondary }]}>
              This app uses several open source libraries. We believe in the power of 
              open source and contribute back to the community whenever possible.
            </Text>
            <TouchableOpacity
              style={[styles.opensourceButton, { backgroundColor: colors.primary }]}
              onPress={() => handleOpenLink('https://github.com/gpstracker', 'GitHub')}
            >
              <Text style={[styles.opensourceButtonText, { color: colors.surface }]}>
                View on GitHub
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2024 GPS Tracker. All rights reserved.
          </Text>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  appInfoCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
  },
  infoArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  teamDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  opensourceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  opensourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  opensourceText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  opensourceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  opensourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
