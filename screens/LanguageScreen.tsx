import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface LanguageScreenProps {
  onBack: () => void;
}

export default function LanguageScreen({ onBack }: LanguageScreenProps) {
  const { t } = useTranslation('common');
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.content, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('language')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your preferred language for the app interface
          </Text>
        </View>

        {/* Language Switcher */}
        <LanguageSwitcher colors={colors} />
        
        <View style={[styles.infoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Language Support</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Currently supported languages:
          </Text>
          <View style={styles.languageList}>
            <Text style={[styles.languageItem, { color: colors.text }]}>• English</Text>
            <Text style={[styles.languageItem, { color: colors.text }]}>• Español (Spanish)</Text>
            <Text style={[styles.languageItem, { color: colors.text }]}>• हिन्दी (Hindi)</Text>
            <Text style={[styles.languageItem, { color: colors.text }]}>• Français (French)</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            More languages will be added in future updates.
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoContainer: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  languageList: {
    marginLeft: 10,
    marginBottom: 12,
  },
  languageItem: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
});