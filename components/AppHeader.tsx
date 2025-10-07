import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles/headerStyles';

interface AppHeaderProps {
  colors: any;
  onMenuPress: () => void;
  onAddDevicePress: () => void;
  onSearchPress: () => void;
  onNotificationPress: () => void;
  notificationCount?: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  colors,
  onMenuPress,
  onAddDevicePress,
  onSearchPress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  const { t } = useTranslation('common');
  
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: colors.header,
        zIndex: 500,
      }}
    >
      <View style={[styles.header, { backgroundColor: colors.header, zIndex: 10000 }]}>
        <View style={styles.headerContent}>
          {/* Left side - Menu and App Title */}
          <View style={styles.leftSection}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={onMenuPress}
            >
              <Icon name="menu" size={22} color={colors.text} />
            </TouchableOpacity>
            
            {/* App Title */}
            <Text style={[styles.appTitle, { color: colors.text }]}>
              GPS Tracker
            </Text>
          </View>
          
          {/* Right side icons */}
          <View style={styles.rightIcons}>
            {/* Search Icon */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onSearchPress}
            >
              <Icon name="search" size={22} color={colors.text} />
            </TouchableOpacity>
            
            {/* Notification Bell with Badge */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onNotificationPress}
            >
              <Icon name="notifications" size={22} color={colors.text} />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Add Device Button */}
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={onAddDevicePress}
            >
              <Icon name="add" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};