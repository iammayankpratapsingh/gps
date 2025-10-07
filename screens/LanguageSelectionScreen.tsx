import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import themeService from '../services/themeService';

const { width, height } = Dimensions.get('window');

interface LanguageSelectionScreenProps {
  onComplete: () => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
];

export default function LanguageSelectionScreen({ onComplete }: LanguageSelectionScreenProps) {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);
  const [isChanging, setIsChanging] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const colors = themeService.getColors();

  const handleLanguageSelect = async (languageCode: string) => {
    if (isChanging) return;
    
    setSelectedLanguage(languageCode);
    
    // Animate selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsChanging(true);
    try {
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const renderLanguageOption = (language: LanguageOption) => {
    const isSelected = selectedLanguage === language.code;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageOption,
          {
            backgroundColor: isSelected ? colors.primary : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.languageContent,
            { transform: [{ scale: isSelected ? scaleAnim : 1 }] },
          ]}
        >
          <View style={styles.flagContainer}>
            <Text style={styles.flag}>{language.flag}</Text>
          </View>
          
          <View style={styles.languageInfo}>
            <Text style={[styles.languageName, { color: colors.text }]}>
              {language.name}
            </Text>
            <Text style={[styles.nativeName, { color: colors.textSecondary }]}>
              {language.nativeName}
            </Text>
          </View>
          
          {isSelected && (
            <View style={[styles.checkIcon, { backgroundColor: colors.primary }]}>
              <Icon name="check" size={20} color="#ffffff" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Icon name="language" size={32} color="#ffffff" />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          {t('selectLanguage')}
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('languageDescription')}
        </Text>
      </View>

      {/* Language Options */}
      <View style={styles.languagesContainer}>
        {languages.map(renderLanguageOption)}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: colors.primary,
              opacity: selectedLanguage ? 1 : 0.5,
            },
          ]}
          onPress={handleContinue}
          disabled={!selectedLanguage || isChanging}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <Icon name="arrow-forward" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  languagesContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  languageOption: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  flagContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '400',
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
