import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { ThemeColors } from '../services/themeService';

interface UseStatusBarProps {
  colors: ThemeColors;
  animated?: boolean;
  enabled?: boolean;
}

export const useStatusBar = ({ colors, animated = true, enabled = true }: UseStatusBarProps) => {
  useEffect(() => {
    if (!enabled) {
      return; // Don't update status bar if disabled
    }

    // Determine the appropriate bar style based on header color
    const getBarStyle = (headerColor: string) => {
      // Convert hex to RGB to determine brightness
      const hex = headerColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate brightness using luminance formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return light content for dark backgrounds, dark content for light backgrounds
      return brightness < 128 ? 'light-content' : 'dark-content';
    };

    const barStyle = getBarStyle(colors.header);
    
    // Update status bar with professional settings
    StatusBar.setBarStyle(barStyle, animated);
    
    // Set background color for Android
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.header, animated);
    }
    
    // Ensure status bar is not translucent for consistent appearance
    StatusBar.setTranslucent(false);
    
    console.log(`🎨 Status bar updated: ${colors.header} with ${barStyle} content`);
  }, [colors.header, animated, enabled]);
};

// Helper function to get status bar style for any color
export const getStatusBarStyle = (backgroundColor: string): 'light-content' | 'dark-content' => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? 'light-content' : 'dark-content';
};
