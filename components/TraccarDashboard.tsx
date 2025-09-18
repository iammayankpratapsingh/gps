import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { DeviceWithPosition } from '../services/traccarIntegrationService';
import traccarIntegrationService from '../services/traccarIntegrationService';
import { ThemeColors } from '../services/themeService';
import { useDevices } from '../contexts/DeviceContext';

interface TraccarDashboardProps {
  colors: ThemeColors;
}

export const TraccarDashboard: React.FC<TraccarDashboardProps> = ({ colors }) => {
  const { 
    devices: contextDevices, 
    isLoading, 
    isRefreshing, 
    lastRefreshTime, 
    isLiveTracking,
    loadDevices, 
    refreshDevices 
  } = useDevices();
  
  
  const [devices, setDevices] = useState<DeviceWithPosition[]>([]);
  const [hasError, setHasError] = useState(false);

  // Load devices on component mount (only if no cached data)
  useEffect(() => {
    loadDevices();
  }, []);

  // Convert context devices to DeviceWithPosition format
  useEffect(() => {
    if (contextDevices.length > 0) {
      const convertedDevices = contextDevices.map(device => ({
        ...device,
        enteredDeviceId: device.id,
        device: device,
        isOnline: device.status.toLowerCase() === 'online',
        lastSeen: device.lastUpdate,
        // Add any additional properties needed for DeviceWithPosition
      })) as unknown as DeviceWithPosition[];
      setDevices(convertedDevices);
    }
  }, [contextDevices]);

  const handleRefresh = () => {
    refreshDevices();
  };

  const handleSyncAll = async () => {
    try {
      console.log('[TraccarDashboard] Syncing all devices...');
      
      const result = await traccarIntegrationService.syncAllDevices();
      if (result.success) {
        // Reload devices after sync using global context
        await refreshDevices();
        Alert.alert('Success', 'All devices have been synced with Traccar server');
      } else {
        Alert.alert('Error', result.error || 'Failed to sync devices');
      }
    } catch (error) {
      console.error('[TraccarDashboard] Error syncing devices:', error);
      Alert.alert('Error', 'An unexpected error occurred while syncing devices');
    }
  };

  const handleRemoveDevice = async (enteredDeviceId: string, customName: string) => {
    Alert.alert(
      'Remove Device',
      `Are you sure you want to remove "${customName}" from your devices?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await traccarIntegrationService.removeDevice(enteredDeviceId);
              if (result.success) {
                // Reload devices after removal
                await loadDevices();
                Alert.alert('Success', 'Device has been removed successfully');
              } else {
                Alert.alert('Error', result.error || 'Failed to remove device');
              }
            } catch (error) {
              console.error('[TraccarDashboard] Error removing device:', error);
              Alert.alert('Error', 'An unexpected error occurred while removing device');
            }
          }
        }
      ]
    );
  };

  const formatSpeed = (speed: number): string => {
    return `${(speed * 3.6).toFixed(1)} km/h`; // Convert m/s to km/h
  };

  const formatBattery = (batteryLevel?: number): string => {
    if (batteryLevel === undefined || batteryLevel === null) return 'N/A';
    return `${batteryLevel}%`;
  };

  const getStatusColor = (isOnline: boolean): string => {
    return isOnline ? '#28a745' : '#dc3545';
  };

  const getStatusText = (isOnline: boolean): string => {
    return isOnline ? 'ONLINE' : 'OFFLINE';
  };


  if (hasError) {
    return (
      <View style={[styles.dashboard, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Unable to load Traccar devices</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            The app will work in offline mode. You can still add devices manually.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setHasError(false);
              loadDevices();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.isOnline).length;
  const offlineDevices = totalDevices - onlineDevices;

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

      {/* Sync Button and Last Refresh Time */}
      <View style={styles.syncContainer}>
        <TouchableOpacity 
          style={[styles.syncButton, { backgroundColor: colors.primary }]}
          onPress={handleSyncAll}
          disabled={isRefreshing}
        >
          <Text style={styles.syncButtonText}>
            {isRefreshing ? '🔄 Syncing...' : '🔄 Sync All'}
          </Text>
        </TouchableOpacity>
        {lastRefreshTime && (
          <Text style={[styles.refreshText, { color: colors.textSecondary }]}>
            Last updated: {lastRefreshTime}
          </Text>
        )}
      </View>

      {/* Scrollable Device Cards */}
      <ScrollView 
        style={[styles.deviceScrollContainer, { zIndex: 1 }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.deviceContainer}>
          {devices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No Traccar devices found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Tap the + button to add your first device
              </Text>
            </View>
          ) : (
            devices.map((deviceWithPosition) => {
              const { device, position, isOnline, lastSeen } = deviceWithPosition;
              
              
              return (
                <View 
                  key={device.enteredDeviceId} 
                  style={[styles.deviceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceTitleContainer}>
                      <Text style={[styles.deviceName, { color: colors.text }]}>
                        {device.customName}
                      </Text>
                      <Text style={[styles.deviceId, { color: colors.textSecondary }]}>
                        ID: {device.enteredDeviceId}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: getStatusColor(isOnline) }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(isOnline)}
                      </Text>
                    </View>
                  </View>

                  {position ? (
                    <View style={styles.deviceInfo}>
                      <Text style={[styles.deviceAddress, { color: colors.textSecondary }]}>
                        📍 {position.address || 'Address not available'}
                      </Text>
                      
                      <View style={styles.positionDetails}>
                        <Text style={[styles.positionText, { color: colors.textSecondary }]}>
                          Lat: {position.latitude.toFixed(6)}
                        </Text>
                        <Text style={[styles.positionText, { color: colors.textSecondary }]}>
                          Lng: {position.longitude.toFixed(6)}
                        </Text>
                      </View>

                      <View style={styles.deviceStats}>
                        <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
                          🔋 {formatBattery(position.batteryLevel)}
                        </Text>
                        <Text style={[styles.speedText, { color: colors.textSecondary }]}>
                          🚗 {formatSpeed(position.speed)}
                        </Text>
                        <Text style={[styles.accuracyText, { color: colors.textSecondary }]}>
                          📡 ±{position.accuracy}m
                        </Text>
                      </View>

                      <Text style={[styles.lastSeenText, { color: colors.primary }]}>
                        📍 Last seen: {new Date(lastSeen).toLocaleString()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.deviceInfo}>
                      <Text style={[styles.noPositionText, { color: colors.textSecondary }]}>
                        📍 No position data available
                      </Text>
                      <Text style={[styles.lastSeenText, { color: colors.primary }]}>
                        📍 Last seen: {new Date(lastSeen).toLocaleString()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Live</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => handleRemoveDevice(device.enteredDeviceId, device.customName)}
                    >
                      <Text style={styles.actionButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  onlineNumber: {
    color: '#28a745',
  },
  offlineNumber: {
    color: '#dc3545',
  },
  syncContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshText: {
    fontSize: 11,
    opacity: 0.7,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  deviceTitleContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    opacity: 0.8,
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceAddress: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
    fontWeight: '500',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  positionText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  deviceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  speedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accuracyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastSeenText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noPositionText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
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
  removeButton: {
    backgroundColor: '#dc3545',
    shadowColor: '#dc3545',
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
