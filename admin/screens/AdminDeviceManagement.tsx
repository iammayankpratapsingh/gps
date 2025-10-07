import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdmin } from '../contexts/AdminContext';
import AdminHeader from '../components/AdminHeader';
import { AdminDevice } from '../types';

interface AdminDeviceManagementProps {
  onNavigate?: (screen: string) => void;
}

const AdminDeviceManagement: React.FC<AdminDeviceManagementProps> = ({ onNavigate }) => {
  const {
    theme,
    devices,
    isLoading,
    refreshDevices,
    updateDevice,
    deleteDevice,
    toggleDrawer
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<AdminDevice | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline' | 'unknown'>('all');

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDevices();
    setRefreshing(false);
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.owner.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleDevicePress = (device: AdminDevice) => {
    setSelectedDevice(device);
    setShowDeviceModal(true);
  };

  const handleDeleteDevice = (device: AdminDevice) => {
    Alert.alert(
      'Delete Device',
      `Are you sure you want to delete ${device.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteDevice(device.id);
              if (success) {
                Alert.alert('Success', 'Device deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete device');
              }
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting device');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.success;
      case 'offline':
        return theme.error;
      default:
        return theme.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return 'wifi';
      case 'offline':
        return 'wifi-off';
      default:
        return 'help';
    }
  };

  const DeviceCard: React.FC<{ device: AdminDevice }> = ({ device }) => (
    <TouchableOpacity
      style={[styles.deviceCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => handleDevicePress(device)}
      activeOpacity={0.7}
    >
      <View style={styles.deviceInfo}>
        <View style={[styles.deviceIcon, { backgroundColor: theme.primary }]}>
          <Icon name="devices" size={24} color={theme.drawerText} />
        </View>
        <View style={styles.deviceDetails}>
          <Text style={[styles.deviceName, { color: theme.text }]} numberOfLines={1}>
            {device.name}
          </Text>
          <Text style={[styles.deviceId, { color: theme.textSecondary }]} numberOfLines={1}>
            ID: {device.uniqueId}
          </Text>
          <Text style={[styles.deviceOwner, { color: theme.textSecondary }]} numberOfLines={1}>
            Owner: {device.owner.displayName}
          </Text>
          <View style={styles.deviceMeta}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.status) }]}>
              <Icon name={getStatusIcon(device.status)} size={12} color={theme.drawerText} />
              <Text style={[styles.statusText, { color: theme.drawerText }]}>
                {device.status.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.lastUpdate, { color: theme.textSecondary }]}>
              {device.lastUpdate.toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.deviceActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.error }]}
          onPress={() => handleDeleteDevice(device)}
          activeOpacity={0.7}
        >
          <Icon name="delete" size={16} color={theme.drawerText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterButton: React.FC<{
    status: 'all' | 'online' | 'offline' | 'unknown';
    label: string;
    count: number;
  }> = ({ status, label, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { backgroundColor: theme.card, borderColor: theme.border },
        filterStatus === status && { backgroundColor: theme.primary, borderColor: theme.primary }
      ]}
      onPress={() => setFilterStatus(status)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterButtonText,
        { color: filterStatus === status ? theme.drawerText : theme.text }
      ]}>
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const getDeviceCounts = () => {
    return {
      all: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      unknown: devices.filter(d => d.status === 'unknown').length
    };
  };

  const counts = getDeviceCounts();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader
        title="Device Management"
        onMenuPress={toggleDrawer}
        showBackButton={true}
        onBackPress={() => onNavigate?.('AdminDashboard')}
      />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search devices..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <FilterButton status="all" label="All" count={counts.all} />
          <FilterButton status="online" label="Online" count={counts.online} />
          <FilterButton status="offline" label="Offline" count={counts.offline} />
          <FilterButton status="unknown" label="Unknown" count={counts.unknown} />
        </View>

        {/* Devices List */}
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DeviceCard device={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Device Details Modal */}
      <Modal
        visible={showDeviceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <AdminHeader
            title="Device Details"
            onMenuPress={toggleDrawer}
            showBackButton={true}
            onBackPress={() => setShowDeviceModal(false)}
          />
          {selectedDevice && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.deviceDetailCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.deviceDetailHeader}>
                  <View style={[styles.largeDeviceIcon, { backgroundColor: theme.primary }]}>
                    <Icon name="devices" size={40} color={theme.drawerText} />
                  </View>
                  <Text style={[styles.largeDeviceName, { color: theme.text }]}>
                    {selectedDevice.name}
                  </Text>
                  <Text style={[styles.largeDeviceId, { color: theme.textSecondary }]}>
                    ID: {selectedDevice.uniqueId}
                  </Text>
                  <View style={[styles.largeStatusBadge, { backgroundColor: getStatusColor(selectedDevice.status) }]}>
                    <Icon name={getStatusIcon(selectedDevice.status)} size={16} color={theme.drawerText} />
                    <Text style={[styles.largeStatusText, { color: theme.drawerText }]}>
                      {selectedDevice.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.deviceDetailInfo}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Device ID:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedDevice.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Owner:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedDevice.owner.displayName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Owner Email:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>{selectedDevice.owner.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedDevice.createdAt.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Last Update:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedDevice.lastUpdate.toLocaleDateString()}
                    </Text>
                  </View>
                  {selectedDevice.position && (
                    <>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                          {selectedDevice.position.latitude.toFixed(6)}, {selectedDevice.position.longitude.toFixed(6)}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Speed:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                          {selectedDevice.position.speed} km/h
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Course:</Text>
                        <Text style={[styles.detailValue, { color: theme.text }]}>
                          {selectedDevice.position.course}°
                        </Text>
                      </View>
                      {selectedDevice.position.address && (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Address:</Text>
                          <Text style={[styles.detailValue, { color: theme.text }]}>
                            {selectedDevice.position.address}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    marginBottom: 4,
  },
  deviceOwner: {
    fontSize: 14,
    marginBottom: 8,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  lastUpdate: {
    fontSize: 12,
  },
  deviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  deviceDetailCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  deviceDetailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeDeviceIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  largeDeviceName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  largeDeviceId: {
    fontSize: 16,
    marginBottom: 12,
  },
  largeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  largeStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deviceDetailInfo: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
});

export default AdminDeviceManagement;
