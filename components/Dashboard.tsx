import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FirebaseDevice } from '../services/firebaseDatabase';

interface DashboardProps {
  colors: any;
  devices: FirebaseDevice[];
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  lastRefreshTime?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  colors,
  devices,
  totalDevices,
  onlineDevices,
  offlineDevices,
  lastRefreshTime,
}) => {
  return (
    <View style={[styles.dashboard, { backgroundColor: colors.background, zIndex: 1 }]}>
      {/* Fixed Summary Cards */}
      <View style={[styles.summaryContainer, { zIndex: 1 }]}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalDevices}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryNumber, styles.onlineNumber]}>{onlineDevices}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Online</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryNumber, styles.offlineNumber]}>{offlineDevices}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Offline</Text>
        </View>
      </View>


      {/* Scrollable Device Cards */}
      <ScrollView style={[styles.deviceScrollContainer, { zIndex: 1 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.deviceContainer}>
        {devices.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No devices found</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>Tap the + button to add your first device</Text>
          </View>
        ) : (
          devices.map((device) => (
            <View key={device.id} style={[styles.deviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.deviceHeader}>
                <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: device.isOnline ? colors.success : colors.error }
                ]}>
                  <Text style={styles.statusText}>
                    {device.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </Text>
                </View>
              </View>
              <View style={styles.deviceInfo}>
                <Text style={[styles.deviceAddress, { color: colors.textSecondary }]}>{device.address}</Text>
                <Text style={[styles.deviceId, { color: colors.textSecondary }]}>ID: {device.device_id}</Text>
                <Text style={[styles.deviceType, { color: colors.textSecondary }]}>Type: {device.object_type}</Text>
                <Text style={[styles.deviceParams, { color: colors.textSecondary }]}>{device.parameters}</Text>
                <View style={styles.deviceStats}>
                  <Text style={[styles.batteryText, { color: colors.textSecondary }]}>🔋 {device.battery}%</Text>
                  <Text style={[styles.recentTimeText, { color: colors.primary }]}>
                    📍 Recent: {new Date(device.lastSeen).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Live</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Playback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Geofence Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboard: {
    flex: 1,
  },
  deviceScrollContainer: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  refreshIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 11,
    opacity: 0.7,
  },
  onlineNumber: {
    color: '#28a745',
  },
  offlineNumber: {
    color: '#dc3545',
  },
  deviceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  deviceCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceAddress: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
    fontWeight: '500',
  },
  deviceId: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.8,
  },
  deviceType: {
    fontSize: 12,
    marginBottom: 6,
    opacity: 0.8,
  },
  deviceParams: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  batteryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastSeenText: {
    fontSize: 11,
    opacity: 0.7,
  },
  recentTimeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#0097b2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#0097b2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});
