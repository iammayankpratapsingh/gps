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
          <Text style={[styles.featuresTitle, { color: colors.text }]}>{t('whatYouCanDo')}</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.bulletPoint}>
                <Icon name="location-on" size={16} color="#0097b2" />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{t('trackRealtimeLocation')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bulletPoint}>
                <Icon name="assessment" size={16} color="#0097b2" />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{t('viewDetailedReports')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bulletPoint}>
                <Icon name="notifications" size={16} color="#0097b2" />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{t('getNotifications')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.bulletPoint}>
                <Icon name="route" size={16} color="#0097b2" />
              </View>
              <Text style={[styles.featureText, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">{t('viewRouteHistory')}</Text>
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
    maxWidth: 400,
    alignSelf: 'center',
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
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
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
    marginTop: 8,
    paddingHorizontal: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    width: '100%',
  },
  bulletPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
});
