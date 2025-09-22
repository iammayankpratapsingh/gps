import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, getSupportedLanguages, changeLanguage } from '../config/i18n';

interface LanguageContextType {
  currentLanguage: string;
  supportedLanguages: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
  changeLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supportedLanguages = getSupportedLanguages();

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        const language = getCurrentLanguage();
        setCurrentLanguage(language);
      } catch (error) {
        console.log('Error initializing language:', error);
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const handleChangeLanguage = async (languageCode: string) => {
    try {
      setIsLoading(true);
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.log('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    supportedLanguages,
    changeLanguage: handleChangeLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
