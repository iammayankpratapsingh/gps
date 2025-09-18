import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ShareScreenProps {
  colors: any;
  onBack: () => void;
}

export default function ShareScreen({ colors, onBack }: ShareScreenProps) {
  const [selectedShareType, setSelectedShareType] = useState<string | null>(null);

  const shareOptions = [
    {
      id: 'app',
      title: 'Share App',
      description: 'Share the GPS Tracker app with friends',
      icon: '📱',
      action: () => handleShareApp()
    },
    {
      id: 'location',
      title: 'Share Location',
      description: 'Share your current location or device location',
      icon: '📍',
      action: () => handleShareLocation()
    },
    {
      id: 'route',
      title: 'Share Route',
      description: 'Share a specific route or journey',
      icon: '🛣️',
      action: () => handleShareRoute()
    },
    {
      id: 'device',
      title: 'Share Device',
      description: 'Share device information and status',
      icon: '📡',
      action: () => handleShareDevice()
    },
    {
      id: 'report',
      title: 'Share Report',
      description: 'Share tracking reports and analytics',
      icon: '📊',
      action: () => handleShareReport()
    },
    {
      id: 'contact',
      title: 'Share Contact',
      description: 'Share your contact information',
      icon: '👤',
      action: () => handleShareContact()
    }
  ];

  const shareMethods = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc'
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      color: '#EA4335'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: '💬',
      color: '#34A853'
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '📋',
      color: '#6C757D'
    },
    {
      id: 'more',
      name: 'More Options',
      icon: '⋯',
      color: '#6C757D'
    }
  ];

  const handleShareApp = () => {
    setSelectedShareType('app');
    // TODO: Implement app sharing functionality
    Alert.alert('Share App', 'App sharing functionality will be implemented here');
  };

  const handleShareLocation = () => {
    setSelectedShareType('location');
    // TODO: Implement location sharing functionality
    Alert.alert('Share Location', 'Location sharing functionality will be implemented here');
  };

  const handleShareRoute = () => {
    setSelectedShareType('route');
    // TODO: Implement route sharing functionality
    Alert.alert('Share Route', 'Route sharing functionality will be implemented here');
  };

  const handleShareDevice = () => {
    setSelectedShareType('device');
    // TODO: Implement device sharing functionality
    Alert.alert('Share Device', 'Device sharing functionality will be implemented here');
  };

  const handleShareReport = () => {
    setSelectedShareType('report');
    // TODO: Implement report sharing functionality
    Alert.alert('Share Report', 'Report sharing functionality will be implemented here');
  };

  const handleShareContact = () => {
    setSelectedShareType('contact');
    // TODO: Implement contact sharing functionality
    Alert.alert('Share Contact', 'Contact sharing functionality will be implemented here');
  };

  const handleShareMethod = (method: string) => {
    if (!selectedShareType) {
      Alert.alert('Select Content', 'Please select what you want to share first');
      return;
    }
    
    // TODO: Implement specific sharing method
    Alert.alert('Share via ' + method, `Sharing ${selectedShareType} via ${method}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Share</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What would you like to share?</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select the content you want to share with others.
          </Text>
        </View>

        <View style={styles.shareOptionsContainer}>
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.shareOption,
                { 
                  backgroundColor: colors.surface,
                  borderColor: selectedShareType === option.id ? colors.primary : colors.border,
                  borderWidth: selectedShareType === option.id ? 2 : 1,
                }
              ]}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <Text style={styles.shareOptionIcon}>{option.icon}</Text>
              <View style={styles.shareOptionInfo}>
                <Text style={[styles.shareOptionTitle, { color: colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.shareOptionDescription, { color: colors.textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                { 
                  borderColor: selectedShareType === option.id ? colors.primary : colors.border,
                  backgroundColor: selectedShareType === option.id ? colors.primary : 'transparent'
                }
              ]}>
                {selectedShareType === option.id && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.surface }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedShareType && (
          <View style={styles.shareMethodsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Share via</Text>
            <View style={styles.shareMethodsContainer}>
              {shareMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.shareMethod,
                    { backgroundColor: colors.surface, borderColor: colors.border }
                  ]}
                  onPress={() => handleShareMethod(method.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.shareMethodIcon}>{method.icon}</Text>
                  <Text style={[styles.shareMethodName, { color: colors.text }]}>
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
          <View style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.previewText, { color: colors.textSecondary }]}>
              {selectedShareType 
                ? `Preview of ${selectedShareType} sharing content will appear here`
                : 'Select what you want to share to see preview'
              }
            </Text>
          </View>
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
  shareOptionsContainer: {
    marginBottom: 32,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  shareOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  shareOptionInfo: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shareOptionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shareMethodsSection: {
    marginBottom: 32,
  },
  shareMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareMethod: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  shareMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  shareMethodName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewContainer: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 16,
  },
  previewText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
