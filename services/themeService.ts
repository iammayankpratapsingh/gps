import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'app_theme';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  primary: string;
  success: string;
  warning: string;
  error: string;
  
  // Interactive colors
  button: string;
  buttonText: string;
  input: string;
  inputBorder: string;
  
  // Header colors
  header: string;
  headerText: string;
  
  // Drawer colors
  drawer: string;
  drawerText: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#212529',
  textSecondary: '#6c757d',
  
  // Border colors
  border: '#dee2e6',
  borderLight: '#e9ecef',
  
  // Status colors
  primary: '#0097b2',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  
  // Interactive colors
  button: '#0097b2',
  buttonText: '#ffffff',
  input: '#ffffff',
  inputBorder: '#ced4da',
  
  // Header colors
  header: '#ffffff',
  headerText: '#212529',
  
  // Drawer colors
  drawer: '#0097b2',
  drawerText: '#ffffff',
};

export const darkTheme: ThemeColors = {
  // Background colors
  background: '#1a1a1a',
  surface: '#2d2d2d',
  card: '#2d2d2d',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#adb5bd',
  
  // Border colors
  border: '#404040',
  borderLight: '#495057',
  
  // Status colors
  primary: '#0097b2',
  success: '#198754',
  warning: '#fd7e14',
  error: '#dc3545',
  
  // Interactive colors
  button: '#0d6efd',
  buttonText: '#ffffff',
  input: '#1a1a1a',
  inputBorder: '#404040',
  
  // Header colors
  header: '#2d2d2d',
  headerText: '#ffffff',
  
  // Drawer colors
  drawer: '#1a1a1a',
  drawerText: '#ffffff',
};

class ThemeService {
  private currentTheme: Theme = 'system';
  private listeners: ((theme: Theme) => void)[] = [];
  private systemThemeListener: (() => void) | null = null;

  async initialize(): Promise<Theme> {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
        this.currentTheme = storedTheme;
      } else {
        // Default to system theme if no stored preference
        this.currentTheme = 'system';
        await this.setTheme(this.currentTheme);
      }
      
      // Start listening for system theme changes
      this.startSystemThemeListener();
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to system theme
      this.currentTheme = 'system';
    }
    return this.currentTheme;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getColors(): ThemeColors {
    if (this.currentTheme === 'system') {
      const systemTheme = Appearance.getColorScheme();
      return systemTheme === 'dark' ? darkTheme : lightTheme;
    }
    return this.currentTheme === 'dark' ? darkTheme : lightTheme;
  }

  async setTheme(theme: Theme): Promise<void> {
    try {
      this.currentTheme = theme;
      await AsyncStorage.setItem(THEME_KEY, theme);
      
      // Restart system theme listener if switching to/from system theme
      if (this.systemThemeListener) {
        this.systemThemeListener();
      }
      this.startSystemThemeListener();
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  async toggleTheme(): Promise<Theme> {
    let newTheme: Theme;
    switch (this.currentTheme) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'system';
        break;
      case 'system':
        newTheme = 'light';
        break;
      default:
        newTheme = 'light';
    }
    await this.setTheme(newTheme);
    return newTheme;
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // Listen for system theme changes
  startSystemThemeListener(): () => void {
    // Remove existing listener if any
    if (this.systemThemeListener) {
      this.systemThemeListener();
    }

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-update if current theme is 'system'
      if (this.currentTheme === 'system') {
        this.notifyListeners();
      }
    });

    this.systemThemeListener = () => subscription?.remove();
    return this.systemThemeListener;
  }
}

export default new ThemeService();
