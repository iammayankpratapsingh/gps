import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LanguageScreenProps {
  onBack: () => void;
}

export default function LanguageScreen({ onBack }: LanguageScreenProps) {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [toggleAnimation] = React.useState(new Animated.Value(currentLanguage === 'fr' ? 1 : 0));
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const handleToggle = async () => {
    if (isLoading) return;
    
    const newLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    
    try {
      // Animate the toggle switch
      Animated.timing(toggleAnimation, {
        toValue: newLanguage === 'fr' ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }).start();

      await changeLanguage(newLanguage);
    } catch (error) {
      console.log('Error changing language:', error);
    }
  };

  // Update animation when currentLanguage changes from external source
  React.useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: currentLanguage === 'fr' ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [currentLanguage]);

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32], // Move 32px to the right when French is selected
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.content, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('language')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your preferred language for the app interface
          </Text>
        </View>

        {/* Language Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.toggleHeader}>
            <Icon name="language" size={24} color={colors.primary} />
            <Text style={[styles.toggleTitle, { color: colors.text }]}>{t('language')}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.toggleRow, { borderBottomColor: colors.border }]}
            onPress={handleToggle}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              {t('language')}
            </Text>
            
            <View style={[styles.toggleSwitch, { backgroundColor: colors.border }]}>
              <Animated.View 
                style={[
                  styles.toggleThumb, 
                  { 
                    backgroundColor: colors.primary,
                    transform: [{ translateX }]
                  }
                ]} 
              />
              <View style={styles.toggleLabels}>
                <Text style={[
                  styles.toggleLabelText, 
                  { 
                    color: currentLanguage === 'en' ? colors.primary : colors.textSecondary,
                    fontWeight: currentLanguage === 'en' ? '600' : '400'
                  }
                ]}>
                  EN
                </Text>
                <Text style={[
                  styles.toggleLabelText, 
                  { 
                    color: currentLanguage === 'fr' ? colors.primary : colors.textSecondary,
                    fontWeight: currentLanguage === 'fr' ? '600' : '400'
                  }
                ]}>
                  FR
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.infoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{t('languageSupport')}</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('currentlySupportedLanguages')}
          </Text>
          <View style={styles.languageList}>
            <Text style={[styles.languageItem, { color: colors.text }]}>• {t('english')}</Text>
            <Text style={[styles.languageItem, { color: colors.text }]}>• {t('french')}</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {t('moreLanguagesComing')}
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
  toggleContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  toggleSwitch: {
    width: 64,
    height: 32,
    borderRadius: 16,
    padding: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  toggleLabelText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: 20,
  },
  infoContainer: {
    marginTop: 0,
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