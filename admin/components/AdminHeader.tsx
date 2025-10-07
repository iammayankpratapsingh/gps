import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdmin } from '../contexts/AdminContext';
import { AdminTheme } from '../types';

interface AdminHeaderProps {
  title: string;
  onMenuPress: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
  showBackButton = false,
  onBackPress
}) => {
  const { theme } = useAdmin();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.header}
        translucent={Platform.OS === 'android'}
      />
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={24} color={theme.headerText} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={24} color={theme.headerText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.headerText }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {onNotificationPress && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={onNotificationPress}
              activeOpacity={0.7}
            >
              <Icon name="notifications" size={24} color={theme.headerText} />
              {notificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.error }]}>
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  titleSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AdminHeader;
