import { NativeModules, Platform } from 'react-native';

// Get the current locale from the device
const getDeviceLocale = (): string => {
  if (Platform.OS === 'ios') {
    return NativeModules.SettingsManager?.settings?.AppleLocale || 
           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 
           'en-US';
  } else {
    return NativeModules.I18nManager?.localeIdentifier || 'en-US';
  }
};

// Format numbers according to the current locale
export const formatNumber = (value: number | string, options?: Intl.NumberFormatOptions): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return value.toString();
  }

  try {
    const locale = getDeviceLocale();
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }).format(numValue);
  } catch (error) {
    // Fallback to default formatting if locale is not supported
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    });
  }
};

// Format battery percentage
export const formatBatteryPercentage = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'N/A';
  }

  // If the value is already a percentage (0-100), use it directly
  // If the value is a decimal (0-1), convert it to percentage
  let batteryValue = numValue;
  if (numValue > 1) {
    // Value is already a percentage (like 79.0)
    batteryValue = numValue;
  } else {
    // Value is a decimal (like 0.79), convert to percentage
    batteryValue = numValue * 100;
  }

  // Ensure the value is between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, Math.round(batteryValue)));
  
  return `${clampedValue}%`;
};

// Format coordinates
export const formatCoordinates = (latitude: number | string, longitude: number | string): string => {
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
  if (isNaN(lat) || isNaN(lng)) {
    return 'N/A, N/A';
  }

  const formattedLat = formatNumber(lat, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  const formattedLng = formatNumber(lng, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  
  return `${formattedLat}, ${formattedLng}`;
};

// Format speed
export const formatSpeed = (value: number | string, unit: 'kmh' | 'mph' = 'kmh'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'N/A';
  }

  const formattedValue = formatNumber(numValue, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${formattedValue} ${unit === 'kmh' ? 'km/h' : 'mph'}`;
};

// Format distance
export const formatDistance = (value: number | string, unit: 'km' | 'miles' = 'km'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'N/A';
  }

  const formattedValue = formatNumber(numValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${formattedValue} ${unit}`;
};
