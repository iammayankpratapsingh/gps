import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdmin } from '../contexts/AdminContext';
import AdminHeader from '../components/AdminHeader';
import { AdminStats } from '../types';

const { width } = Dimensions.get('window');

interface AdminDashboardProps {
  onNavigate?: (screen: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    theme,
    stats,
    isLoading,
    refreshStats,
    toggleDrawer
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStats();
    setRefreshing(false);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    onPress?: () => void;
  }> = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#ffffff" />
        </View>
        <View style={styles.statText}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {value.toLocaleString()}
          </Text>
          <Text style={[styles.statTitle, { color: theme.textSecondary }]}>
            {title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickAction: React.FC<{
    title: string;
    icon: string;
    onPress: () => void;
  }> = ({ title, icon, onPress }) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={32} color={theme.primary} />
      <Text style={[styles.quickActionText, { color: theme.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader
        title="Admin Dashboard"
        onMenuPress={toggleDrawer}
        onNotificationPress={() => onNavigate?.('AdminNotifications')}
        notificationCount={3}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Welcome to Admin Panel
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Manage users, devices, and monitor system performance
          </Text>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="people"
            color={theme.primary}
            onPress={() => onNavigate?.('AdminUserManagement')}
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon="person-check"
            color={theme.success}
            onPress={() => onNavigate?.('AdminUserManagement')}
          />
          <StatCard
            title="Total Devices"
            value={stats?.totalDevices || 0}
            icon="devices"
            color={theme.secondary}
            onPress={() => onNavigate?.('AdminDeviceManagement')}
          />
          <StatCard
            title="Online Devices"
            value={stats?.onlineDevices || 0}
            icon="wifi"
            color={theme.success}
            onPress={() => onNavigate?.('AdminDeviceManagement')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Manage Users"
              icon="people"
              onPress={() => onNavigate?.('AdminUserManagement')}
            />
            <QuickAction
              title="Manage Devices"
              icon="devices"
              onPress={() => onNavigate?.('AdminDeviceManagement')}
            />
            <QuickAction
              title="View Analytics"
              icon="analytics"
              onPress={() => onNavigate?.('AdminAnalytics')}
            />
            <QuickAction
              title="System Settings"
              icon="settings"
              onPress={() => onNavigate?.('AdminSettings')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Activity
          </Text>
          <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.activityItem}>
              <Icon name="person-add" size={20} color={theme.success} />
              <Text style={[styles.activityText, { color: theme.text }]}>
                New user registered
              </Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                2 min ago
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Icon name="devices" size={20} color={theme.primary} />
              <Text style={[styles.activityText, { color: theme.text }]}>
                Device added to system
              </Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                15 min ago
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Icon name="warning" size={20} color={theme.warning} />
              <Text style={[styles.activityText, { color: theme.text }]}>
                Device went offline
              </Text>
              <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                1 hour ago
              </Text>
            </View>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            System Status
          </Text>
          <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                All systems operational
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                Database connected
              </Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                API services running
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    flex: 1,
  },
});

export default AdminDashboard;
