import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enCommon from '../locales/en/common.json';
import enDevices from '../locales/en/devices.json';
import esCommon from '../locales/es/common.json';
import esDevices from '../locales/es/devices.json';
import hiCommon from '../locales/hi/common.json';
import hiDevices from '../locales/hi/devices.json';
import frCommon from '../locales/fr/common.json';
import frDevices from '../locales/fr/devices.json';

// Language detection
const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // Fallback to device language
      const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode || 'en';
      const supportedLanguages = ['en', 'es', 'hi', 'fr'];
      const language = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';
      
      callback(language);
    } catch (error) {
      console.log('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  },
};

// Translation resources
const resources = {
  en: {
    common: enCommon,
    devices: enDevices,
  },
  es: {
    common: esCommon,
    devices: esDevices,
  },
  hi: {
    common: hiCommon,
    devices: hiDevices,
  },
  fr: {
    common: frCommon,
    devices: frDevices,
  },
};

// i18n configuration
i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'devices'],
    react: {
      useSuspense: false,
    },
  });

// Language change function
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('user-language', language);
  } catch (error) {
    console.log('Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => {
  return i18n.language;
};

// Get supported languages
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];
};

export default i18n;
