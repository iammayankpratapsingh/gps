import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

interface EmptyDeviceStateProps {
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
  };
  onAddDevice: () => void;
}

export const EmptyDeviceState: React.FC<EmptyDeviceStateProps> = ({ colors, onAddDevice }) => {
  const { t } = useTranslation('devices');
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.iconContainer}>
          <Icon name="devices" size={40} color="#0097b2" />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{t('noDevices')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t('noDevicesMessage')}
        </Text>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddDevice}
          activeOpacity={0.8}
        >
          <Text style={[styles.addButtonText, { color: colors.surface }]}>{t('addFirstDevice')}</Text>
        </TouchableOpacity>
        
        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>What you can do:</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="location-on" size={20} color="#0097b2" style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Track real-time location</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="assessment" size={20} color="#0097b2" style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>View detailed reports</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="notifications" size={20} color="#0097b2" style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>Get notifications</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="route" size={20} color="#0097b2" style={styles.featureIcon} />
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>View route history</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    // Removed fontSize as it's not needed for vector icons
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
