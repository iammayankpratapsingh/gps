import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import themeService, { Theme, ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface ThemeManagementScreenProps {
  onBack: () => void;
  currentTheme: Theme;
}

export default function ThemeManagementScreen({ onBack, currentTheme }: ThemeManagementScreenProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
  const [colors, setColors] = useState<ThemeColors>(themeService.getColors());
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  useEffect(() => {
    const unsubscribe = themeService.subscribe((theme) => {
      setSelectedTheme(theme);
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const handleThemeSelect = async (theme: Theme) => {
    try {
      await themeService.setTheme(theme);
      setSelectedTheme(theme);
      setColors(themeService.getColors());
    } catch (error) {
      console.error('Error setting theme:', error);
      Alert.alert('Error', 'Failed to change theme');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      backgroundColor: colors.header,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      fontSize: 18,
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    themeCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    themeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    themeIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    themeDescription: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    themePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
    },
    previewBox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      marginRight: 8,
    },
    previewText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    selectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unselectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    checkmark: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    infoSection: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });

  const themeOptions = [
    {
      id: 'system' as Theme,
      name: 'System Default',
      description: 'Automatically follows your device\'s system theme (dark/light)',
      icon: '⚙️',
      previewColors: {
        background: '#f8f9fa',
        surface: '#ffffff',
        text: '#212529',
      },
    },
    {
      id: 'light' as Theme,
      name: 'Light Theme',
      description: 'Clean and bright interface with dark text on light backgrounds',
      icon: '☀️',
      previewColors: {
        background: '#f8f9fa',
        surface: '#ffffff',
        text: '#212529',
      },
    },
    {
      id: 'dark' as Theme,
      name: 'Dark Theme',
      description: 'Easy on the eyes with light text on dark backgrounds',
      icon: '🌙',
      previewColors: {
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Theme</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Choose Your Theme</Text>
        
        {themeOptions.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              selectedTheme === theme.id && { borderColor: colors.primary }
            ]}
            onPress={() => handleThemeSelect(theme.id)}
          >
            <View style={styles.themeHeader}>
              <Text style={styles.themeIcon}>{theme.icon}</Text>
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeDescription}>{theme.description}</Text>
              </View>
              <View style={
                selectedTheme === theme.id 
                  ? styles.selectedIndicator 
                  : styles.unselectedIndicator
              }>
                {selectedTheme === theme.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
            
            <View style={styles.themePreview}>
              <View style={[styles.previewBox, { backgroundColor: theme.previewColors.background }]} />
              <View style={[styles.previewBox, { backgroundColor: theme.previewColors.surface }]} />
              <View style={[styles.previewBox, { backgroundColor: theme.previewColors.text }]} />
              <Text style={styles.previewText}>Preview colors</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About Themes</Text>
          <Text style={styles.infoText}>
            • System Default automatically follows your device's theme setting{'\n'}
            • Light theme provides better visibility in bright environments{'\n'}
            • Dark theme reduces eye strain in low-light conditions{'\n'}
            • Your theme preference is saved automatically{'\n'}
            • Changes apply immediately across the entire app
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

