import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeColors } from '../services/themeService';

interface LanguageSwitcherProps {
  colors: ThemeColors;
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ colors, onLanguageChange }) => {
  const { t } = useTranslation('common');
  const { currentLanguage, supportedLanguages, changeLanguage, isLoading } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === currentLanguage) {
      setIsModalVisible(false);
      return;
    }

    try {
      await changeLanguage(languageCode);
      setIsModalVisible(false);
      onLanguageChange?.(languageCode);
    } catch (error) {
      Alert.alert(t('error'), 'Failed to change language');
    }
  };

  const getCurrentLanguageName = () => {
    const language = supportedLanguages.find(lang => lang.code === currentLanguage);
    return language?.nativeName || 'English';
  };

  const renderLanguageItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
        item.code === currentLanguage && { backgroundColor: colors.primary + '15' },
      ]}
      onPress={() => handleLanguageSelect(item.code)}
      disabled={isLoading}
    >
      <View style={styles.languageItemContent}>
        <Text style={[
          styles.languageName,
          { color: colors.text },
          item.code === currentLanguage && { color: colors.primary, fontWeight: '600' },
        ]}>
          {item.nativeName}
        </Text>
        <Text style={[
          styles.languageCode,
          { color: colors.textSecondary },
          item.code === currentLanguage && { color: colors.primary },
        ]}>
          {item.name}
        </Text>
      </View>
      {item.code === currentLanguage && (
        <Icon name="check" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.languageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setIsModalVisible(true)}
        disabled={isLoading}
      >
        <View style={styles.languageButtonContent}>
          <Icon name="language" size={24} color={colors.primary} />
          <View style={styles.languageButtonText}>
            <Text style={[styles.languageButtonLabel, { color: colors.text }]}>{t('language')}</Text>
            <Text style={[styles.languageButtonValue, { color: colors.textSecondary }]}>{getCurrentLanguageName()}</Text>
          </View>
          <Icon name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('language')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={supportedLanguages}
              keyExtractor={(item) => item.code}
              renderItem={renderLanguageItem}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  languageButton: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  languageButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageButtonValue: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  languageItemContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  languageCode: {
    fontSize: 14,
  },
});

export default LanguageSwitcher;
