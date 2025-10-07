import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import themeService from '../services/themeService';
// import { useNotifications } from '../contexts/NotificationsContext';

const { width } = Dimensions.get('window');

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'device' | 'system' | 'alert' | 'update';
  isRead: boolean;
  deviceName?: string;
}

interface NotificationsScreenProps {
  colors: any;
  onBack: () => void;
  notifications?: any[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

// Mock notification data - replace with real data from your service
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Device Connected',
    message: 'GPS Tracker #001 has come online',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    type: 'device',
    isRead: false,
    deviceName: 'GPS Tracker #001',
  },
  {
    id: '2',
    title: 'Low Battery Alert',
    message: 'GPS Tracker #002 battery is below 20%',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    type: 'alert',
    isRead: false,
    deviceName: 'GPS Tracker #002',
  },
  {
    id: '3',
    title: 'Geofence Alert',
    message: 'GPS Tracker #003 has left the designated area',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: 'alert',
    isRead: true,
    deviceName: 'GPS Tracker #003',
  },
  {
    id: '4',
    title: 'System Update',
    message: 'App has been updated to version 2.1.0',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'update',
    isRead: true,
  },
  {
    id: '5',
    title: 'Device Disconnected',
    message: 'GPS Tracker #004 has gone offline',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    type: 'device',
    isRead: true,
    deviceName: 'GPS Tracker #004',
  },
];

export default function NotificationsScreen({ 
  colors, 
  onBack, 
  notifications: propNotifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onUnreadCountChange
}: NotificationsScreenProps) {
  const { t } = useTranslation('common');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(mockNotifications);
  
  // Use prop notifications if provided, otherwise use local state
  const notifications = propNotifications ? propNotifications.map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    timestamp: new Date(n.timestamp),
    type: n.type,
    isRead: n.isRead,
    deviceName: n.deviceName,
  })) : localNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'device':
        return 'devices';
      case 'alert':
        return 'warning';
      case 'system':
        return 'settings';
      case 'update':
        return 'system-update';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'device':
        return colors.success;
      case 'alert':
        return colors.error;
      case 'system':
        return colors.primary;
      case 'update':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    } else {
      setLocalNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setLocalNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    }
  };

  const getFilteredNotifications = () => {
    switch (selectedFilter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'alerts':
        return notifications.filter(n => n.type === 'alert');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Notify parent about unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const renderNotificationItem = (notification: NotificationItem) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        {
          backgroundColor: notification.isRead ? colors.surface : colors.primaryLight,
          borderLeftColor: getNotificationColor(notification.type),
        },
      ]}
      onPress={() => handleMarkAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Icon
              name={getNotificationIcon(notification.type)}
              size={20}
              color={getNotificationColor(notification.type)}
            />
          </View>
          
          <View style={styles.notificationText}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
              {notification.message}
            </Text>
          </View>
          
          <View style={styles.notificationMeta}>
            <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
              {formatTimestamp(notification.timestamp)}
            </Text>
            {!notification.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: 'all' | 'unread' | 'alerts', label: string, count?: number) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
          borderColor: selectedFilter === filter ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: selectedFilter === filter ? '#ffffff' : colors.text,
          },
        ]}
      >
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={colors.text === '#ffffff' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.header}
        translucent={false}
        animated={true}
      />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={[styles.headerTitleText, { color: colors.text }]}>Notifications</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: colors.surface }]}
            onPress={handleMarkAllAsRead}
            activeOpacity={0.8}
            disabled={unreadCount === 0}
          >
            <Icon name="done-all" size={20} color={unreadCount > 0 ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          {renderFilterButton('all', 'All', notifications.length)}
          {renderFilterButton('unread', 'Unread', unreadCount)}
          {renderFilterButton('alerts', 'Alerts', notifications.filter(n => n.type === 'alert').length)}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.notificationsList} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotificationItem)
        ) : (
          <View style={styles.emptyState}>
            <Icon name="notifications-none" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No notifications
            </Text>
            <Text style={[styles.emptyStateMessage, { color: colors.textSecondary }]}>
              {selectedFilter === 'unread' 
                ? 'All notifications have been read'
                : selectedFilter === 'alerts'
                ? 'No alerts at this time'
                : 'You\'ll see notifications here when they arrive'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  unreadCount: {
    fontSize: 12,
    marginTop: 2,
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to prevent bottom navigation overlap
  },
  notificationItem: {
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
});