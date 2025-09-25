import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Alert, AppState } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { ThemeColors } from '../services/themeService';
import { EmptyDeviceState } from './EmptyDeviceState';
import { useDevices } from '../contexts/DeviceContext';
import { formatBatteryPercentage, formatCoordinates } from '../utils/numberFormatting';

interface TraccarDeviceListProps {
  colors: ThemeColors;
  addedDevices?: Array<{
    traccarDeviceId: string;
    customName: string;
    deviceId: string;
  }>;
  onAddDevice?: () => void;
}

export const TraccarDeviceList: React.FC<TraccarDeviceListProps> = ({ colors, addedDevices = [], onAddDevice }) => {
  const { t } = useTranslation('common');
  const { 
    devices, 
    positions, 
    isLoading, 
    isRefreshing, 
    lastRefreshTime, 
    selectedDeviceId,
    isLiveTracking,
    getFilteredDevices,
    loadDevices, 
    refreshDevices 
  } = useDevices();
  
  

  // Load devices on component mount (only if no cached data)
  useEffect(() => {
    loadDevices();
  }, []);

  // Auto-refresh when addedDevices changes (only if we have devices to show)
  useEffect(() => {
    if (addedDevices.length > 0 && devices.length > 0) {
      console.log('[TraccarDeviceList] Added devices changed, refreshing data...');
      loadDevices(true); // Force refresh when added devices change
    }
  }, [addedDevices]);

  // Auto-refresh timer for continuous updates
  useEffect(() => {
    if (addedDevices.length > 0) {
      console.log('[TraccarDeviceList] Starting auto-refresh timer...');
      
      let interval: NodeJS.Timeout;
      
      const startAutoRefresh = () => {
        // Refresh every 30 seconds
        interval = setInterval(() => {
          console.log('[TraccarDeviceList] Auto-refreshing data...');
          loadDevices(true);
        }, 30000); // 30 seconds
      };

      const stopAutoRefresh = () => {
        if (interval) {
          clearInterval(interval);
        }
      };

      // Handle app state changes
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          console.log('[TraccarDeviceList] App became active, starting auto-refresh...');
          startAutoRefresh();
        } else {
          console.log('[TraccarDeviceList] App went to background, stopping auto-refresh...');
          stopAutoRefresh();
        }
      };

      // Start auto-refresh
      startAutoRefresh();
      
      // Listen to app state changes
      const subscription = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        console.log('[TraccarDeviceList] Clearing auto-refresh timer...');
        stopAutoRefresh();
        subscription?.remove();
      };
    }
  }, [addedDevices.length]);

  const handleRefresh = () => {
    refreshDevices();
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'online':
        return '#28a745';
      case 'offline':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  };

  const getStatusText = (status: string): string => {
    return status.toUpperCase();
  };

  const formatLastUpdate = (lastUpdate: string): string => {
    try {
      return new Date(lastUpdate).toLocaleString();
    } catch {
      return lastUpdate;
    }
  };


  // Get filtered devices based on current filter
  const filteredByStatus = getFilteredDevices();
  
  // Filter devices to only show those that have been added
  const addedDeviceIds = addedDevices.map(ad => ad.traccarDeviceId);
  const filteredDevices = filteredByStatus.filter(device => addedDeviceIds.includes(device.uniqueId));
  
  const totalDevices = filteredDevices.length;
  const onlineDevices = filteredDevices.filter(d => d.status.toLowerCase() === 'online').length;
  const offlineDevices = filteredDevices.filter(d => d.status.toLowerCase() !== 'online').length; // Everything else is offline


  // Show empty state if no devices are added
  if (addedDevices.length === 0) {
    return <EmptyDeviceState colors={colors} onAddDevice={onAddDevice || (() => {})} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Device Summary Cards */}
      <View style={[styles.summaryContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryCardContent}>
            <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalDevices}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Devices</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryCardContent}>
            <Text style={[styles.summaryNumber, styles.onlineNumber]}>{onlineDevices}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Online</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryCardContent}>
            <Text style={[styles.summaryNumber, styles.offlineNumber]}>{offlineDevices}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Offline</Text>
          </View>
        </View>
      </View>


      {/* Device List */}
      <ScrollView 
        style={styles.deviceList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredDevices.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateContent}>
              <Icon name="devices" size={32} color={colors.textSecondary} style={styles.emptyStateIcon} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No devices added yet
              </Text>
            </View>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Tap the + button to add your first device from Traccar
            </Text>
          </View>
        ) : (
          <View style={styles.deviceContainer}>
            {filteredDevices.map((device) => {
              // Check if this device has a custom name
              const addedDevice = addedDevices.find(ad => ad.traccarDeviceId === device.uniqueId);
              const displayName = addedDevice ? addedDevice.customName : device.name;
              
              // Find position data for this device
              const position = positions.find(p => p.deviceId === device.id);
              const batteryLevel = position?.batteryLevel || position?.attributes?.batteryLevel || 'N/A';
              const latitude = position?.latitude || 'N/A';
              const longitude = position?.longitude || 'N/A';
              
              return (
                <View 
                  key={device.id} 
                  style={[
                    styles.deviceCard, 
                    { 
                      backgroundColor: colors.surface, 
                      borderColor: selectedDeviceId === device.id.toString() ? colors.primary : colors.border,
                      borderWidth: selectedDeviceId === device.id.toString() ? 2 : 1,
                    }
                  ]}
                >
                  <View style={styles.deviceHeader}>
                    <View style={styles.deviceNameContainer}>
                      <View>
                        <Text style={[styles.deviceName, { color: colors.text }]}>{displayName}</Text>
                      </View>
                      {addedDevice && (
                        <Text style={[styles.originalName, { color: colors.textSecondary }]}>
                          ({device.name})
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.statusIndicator, 
                      { backgroundColor: device.status.toLowerCase() === 'online' ? colors.success : colors.error }
                    ]}>
                      <Text style={styles.statusText}>
                        {device.status.toLowerCase() === 'online' ? 'ONLINE' : 'OFFLINE'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceDetailRow}>
                      <Icon name="devices" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                      <Text style={[styles.deviceDetail, { color: colors.textSecondary }]}>
                        Device ID: {device.uniqueId}
                      </Text>
                    </View>
                    <View style={styles.deviceDetailRow}>
                      <Icon name="location-on" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                      <Text style={[styles.deviceDetail, { color: colors.textSecondary }]}>
                        Location: {formatCoordinates(latitude, longitude)}
                      </Text>
                    </View>
                    <View style={styles.deviceDetailRow}>
                      <Icon name="battery-std" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                      <Text style={[styles.deviceDetail, { color: colors.textSecondary }]}>
                        Battery: {formatBatteryPercentage(batteryLevel)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons Row */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Icon name="play-arrow" size={14} color="#ffffff" />
                      <Text style={styles.actionButtonText}>{t('live')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Icon name="camera-alt" size={14} color="#ffffff" />
                      <Text style={styles.actionButtonText}>{t('camera')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Icon name="info" size={14} color="#ffffff" />
                      <Text style={styles.actionButtonText}>{t('details')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Icon name="notifications" size={14} color="#ffffff" />
                      <Text style={styles.actionButtonText}>{t('alert')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Icon name="history" size={14} color="#ffffff" />
                      <Text style={styles.actionButtonText}>{t('playback')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  onlineNumber: {
    color: '#28a745',
  },
  offlineNumber: {
    color: '#dc3545',
  },
  updateIndicator: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deviceList: {
    flex: 1,
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
  deviceInfo: {
    marginBottom: 16,
  },
  deviceNameContainer: {
    flex: 1,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  originalName: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  deviceDetail: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
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
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  deviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
});
