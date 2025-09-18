import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationsScreenProps {
  colors: any;
  onBack: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  action?: string;
}

export default function NotificationsScreen({ colors, onBack }: NotificationsScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Mock data - in real app, this would come from your database
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Device Online',
      message: 'Your GPS device "Car Tracker" is now online and tracking.',
      timestamp: '2024-12-15T10:30:00Z',
      type: 'success',
      isRead: false,
      action: 'View Device'
    },
    {
      id: '2',
      title: 'Low Battery Warning',
      message: 'Device "Bike Tracker" battery is at 15%. Please charge soon.',
      timestamp: '2024-12-15T09:15:00Z',
      type: 'warning',
      isRead: false,
      action: 'View Device'
    },
    {
      id: '3',
      title: 'Route Completed',
      message: 'Your route "Morning Commute" has been completed successfully.',
      timestamp: '2024-12-14T18:45:00Z',
      type: 'info',
      isRead: true,
      action: 'View Route'
    },
    {
      id: '4',
      title: 'Geofence Alert',
      message: 'Device "Car Tracker" has left the "Home" geofence area.',
      timestamp: '2024-12-14T16:20:00Z',
      type: 'warning',
      isRead: true,
      action: 'View Location'
    },
    {
      id: '5',
      title: 'App Update Available',
      message: 'A new version of GPS Tracker is available with improved features.',
      timestamp: '2024-12-13T14:00:00Z',
      type: 'info',
      isRead: true,
      action: 'Update Now'
    },
    {
      id: '6',
      title: 'Device Offline',
      message: 'Your GPS device "Bike Tracker" has gone offline.',
      timestamp: '2024-12-13T12:30:00Z',
      type: 'error',
      isRead: true,
      action: 'Check Device'
    },
    {
      id: '7',
      title: 'Weekly Report',
      message: 'Your weekly tracking report is ready. View your activity summary.',
      timestamp: '2024-12-12T08:00:00Z',
      type: 'info',
      isRead: true,
      action: 'View Report'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    if (selectedFilter === 'read') return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      console.log('Mark notification as read:', notification.id);
    }
    
    if (notification.action) {
      Alert.alert(
        notification.title,
        notification.message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: notification.action, onPress: () => console.log('Action:', notification.action) }
        ]
      );
    } else {
      Alert.alert(notification.title, notification.message);
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All Read', onPress: () => console.log('Mark all notifications as read') }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => console.log('Clear all notifications') }
      ]
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      case 'info': return '#0097b2';
      default: return '#6c757d';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: colors.primary }]}
                onPress={handleMarkAllAsRead}
              >
                <Text style={[styles.markAllButtonText, { color: colors.surface }]}>
                  Mark All Read
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'all' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'all' ? colors.surface : colors.text }
            ]}>
              All ({notifications.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'unread' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('unread')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'unread' ? colors.surface : colors.text }
            ]}>
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'read' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('read')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'read' ? colors.surface : colors.text }
            ]}>
              Read ({notifications.length - unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No notifications</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                {selectedFilter === 'all' 
                  ? 'You don\'t have any notifications yet.'
                  : `No ${selectedFilter} notifications found.`
                }
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    borderLeftColor: getNotificationColor(notification.type),
                    borderLeftWidth: 4,
                    opacity: notification.isRead ? 0.7 : 1
                  }
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationHeader}>
                  <View style={styles.notificationIcon}>
                    <Text style={styles.iconText}>{getNotificationIcon(notification.type)}</Text>
                  </View>
                  <View style={styles.notificationInfo}>
                    <View style={styles.notificationTitleRow}>
                      <Text style={[
                        styles.notificationTitle, 
                        { 
                          color: colors.text,
                          fontWeight: notification.isRead ? '400' : '600'
                        }
                      ]}>
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                      {notification.message}
                    </Text>
                  </View>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
                
                {notification.action && (
                  <View style={styles.notificationAction}>
                    <Text style={[styles.actionText, { color: colors.primary }]}>
                      {notification.action} →
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Clear All Button */}
        {notifications.length > 0 && (
          <View style={styles.clearAllContainer}>
            <TouchableOpacity
              style={[styles.clearAllButton, { borderColor: colors.border }]}
              onPress={handleClearAll}
            >
              <Text style={[styles.clearAllButtonText, { color: colors.error }]}>
                Clear All Notifications
              </Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notificationsContainer: {
    marginBottom: 20,
  },
  notificationItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  iconText: {
    fontSize: 20,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  notificationAction: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearAllContainer: {
    marginBottom: 32,
  },
  clearAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
