import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { ThemeColors } from '../services/themeService';

interface LanguageToggleProps {
  colors: ThemeColors;
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ colors, onLanguageChange }) => {
  const { t } = useTranslation('common');
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [toggleAnimation] = React.useState(new Animated.Value(currentLanguage === 'fr' ? 1 : 0));

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
      onLanguageChange?.(newLanguage);
    } catch (error) {
      console.log('Error changing language:', error);
    }
  };

  // Keep the toggle in sync with external language changes (e.g., first-time selection or settings)
  React.useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: currentLanguage === 'fr' ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [currentLanguage, toggleAnimation]);

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32], // Move 32px to the right when French is selected
  });

  return (
    <TouchableOpacity
      style={[styles.container, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}
      onPress={handleToggle}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.toggleRow}>
        <Icon name="language" size={20} color={colors.primary} style={styles.languageIcon} />
        <Text style={[styles.languageLabel, { color: colors.text }]}>
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
              styles.toggleLabel, 
              { 
                color: currentLanguage === 'en' ? colors.primary : colors.textSecondary,
                fontWeight: currentLanguage === 'en' ? '600' : '400'
              }
            ]}>
              EN
            </Text>
            <Text style={[
              styles.toggleLabel, 
              { 
                color: currentLanguage === 'fr' ? colors.primary : colors.textSecondary,
                fontWeight: currentLanguage === 'fr' ? '600' : '400'
              }
            ]}>
              FR
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    marginHorizontal: 8,
    borderRadius: 12,
    marginVertical: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageIcon: {
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  languageLabel: {
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
  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: 20,
  },
});

export default LanguageToggle;
