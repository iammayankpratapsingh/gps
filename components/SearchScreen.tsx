import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TraccarDevice } from '../services/traccarServiceSimple';
import { useDevices, DeviceFilter } from '../contexts/DeviceContext';
import { FilterOptions } from './FilterOptions';

interface SearchScreenProps {
  colors: any;
  onBack: () => void;
  onDeviceSelect: (device: TraccarDevice) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  colors,
  onBack,
  onDeviceSelect,
}) => {
  const { devices, selectDevice, deviceFilter, setDeviceFilter, getFilteredDevices } = useDevices();
  
  // Safety check to prevent crashes
  if (!devices || !selectDevice || !setDeviceFilter || !getFilteredDevices) {
    console.error('[SearchScreen] DeviceContext not properly initialized');
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              Search functionality is not available. Please try again.
            </Text>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.primary }]}
              onPress={onBack}
            >
              <Text style={[styles.backButtonText, { color: '#ffffff' }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  const [searchText, setSearchText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Get filtered devices based on current filter
  const filteredByStatus = getFilteredDevices();
  
  // Further filter by search text
  const filteredDevices = searchText.trim() === ''
    ? filteredByStatus
    : filteredByStatus.filter(device =>
        device.name.toLowerCase().includes(searchText.toLowerCase()) ||
        device.uniqueId.toLowerCase().includes(searchText.toLowerCase()) ||
        device.status.toLowerCase().includes(searchText.toLowerCase())
      );

  // Auto-focus search input when screen opens
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleDeviceSelect = (device: TraccarDevice) => {
    try {
      selectDevice(device.id.toString());
      onDeviceSelect(device);
      onBack(); // Close search screen after selection
    } catch (error) {
      console.error('[SearchScreen] Error selecting device:', error);
      onBack(); // Still close the screen even if there's an error
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    onBack();
  };

  const handleClearSearch = () => {
    setSearchText('');
    searchInputRef.current?.focus();
  };

  const handleFilterPress = () => {
    try {
      setShowFilterOptions(true);
    } catch (error) {
      console.error('[SearchScreen] Error opening filter options:', error);
    }
  };

  const getFilterLabel = (filter: DeviceFilter): string => {
    switch (filter) {
      case 'all': return 'All Devices';
      case 'online': return 'Online Devices';
      case 'offline': return 'Offline Devices';
      default: return 'All Devices';
    }
  };

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <StatusBar
          barStyle={colors.text === '#ffffff' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.header}
          translucent={false}
          animated={true}
        />

      {/* Header with Back Button and Search Input */}
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.input }]}
            onPress={handleBack}
          >
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>

          {/* Search Input */}
          <View style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input,
              borderColor: colors.primary,
              borderWidth: 1,
            }
          ]}>
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search Devices"
              placeholderTextColor={colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              blurOnSubmit={false}
            />

            {/* Clear Button */}
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}
              >
                <Text style={[styles.clearButtonText, { color: colors.textSecondary }]}>×</Text>
              </TouchableOpacity>
            )}

            {/* Filter Button */}
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: deviceFilter !== 'all' ? colors.primary : 'transparent' }]}
              onPress={handleFilterPress}
            >
              <View style={styles.threeDotsContainer}>
                <View style={[styles.dot, { backgroundColor: deviceFilter !== 'all' ? '#ffffff' : colors.text }]} />
                <View style={[styles.dot, { backgroundColor: deviceFilter !== 'all' ? '#ffffff' : colors.text }]} />
                <View style={[styles.dot, { backgroundColor: deviceFilter !== 'all' ? '#ffffff' : colors.text }]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Results */}
      <View style={[styles.resultsContainer, { backgroundColor: colors.background }]}>
        {/* Results Header */}
        <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.resultsHeaderText, { color: colors.textSecondary }]}>
            {searchText.trim() === ''
              ? `${getFilterLabel(deviceFilter)} (${filteredDevices.length})`
              : `Found ${filteredDevices.length} device${filteredDevices.length !== 1 ? 's' : ''} in ${getFilterLabel(deviceFilter).toLowerCase()}`
            }
          </Text>
        </View>

        {/* Device List */}
        <ScrollView
          style={styles.deviceList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.deviceListContent,
            { paddingBottom: isKeyboardVisible ? 20 : 40 }
          ]}
        >
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device, index) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceItem,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: index % 2 === 0 ? 'transparent' : colors.input + '20'
                  }
                ]}
                onPress={() => handleDeviceSelect(device)}
              >
                <View style={styles.deviceItemContent}>
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceName, { color: colors.text }]}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceId, { color: colors.textSecondary }]}>
                      ID: {device.uniqueId}
                    </Text>
                    <Text style={[styles.deviceType, { color: colors.textSecondary }]}>
                      Model: {device.model || 'Unknown'}
                    </Text>
                    <Text style={[styles.deviceParams, { color: colors.textSecondary }]}>
                      Category: {device.category || 'Default'}
                    </Text>
                    <Text style={[styles.recentTimeText, { color: colors.primary }]}>
                      📍 Last Update: {new Date(device.lastUpdate).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: device.status.toLowerCase() === 'online' ? colors.success : colors.error }
                  ]}>
                    <Text style={styles.statusText}>
                      {device.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {searchText.trim() === ''
                  ? 'No devices available'
                  : `No devices found for "${searchText}"`
                }
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                {searchText.trim() === ''
                  ? 'Add devices to see them here'
                  : 'Try a different search term'
                }
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      </SafeAreaView>

      {/* Filter Options Modal */}
      <FilterOptions
        colors={colors}
        currentFilter={deviceFilter}
        onFilterSelect={setDeviceFilter}
        onClose={() => setShowFilterOptions(false)}
        visible={showFilterOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    borderRadius: 6,
  },
  threeDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  resultsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    paddingBottom: 40,
  },
  deviceItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  deviceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deviceAddress: {
    fontSize: 14,
    marginBottom: 2,
    lineHeight: 18,
  },
  deviceId: {
    fontSize: 12,
    marginBottom: 2,
    opacity: 0.8,
  },
  deviceType: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  deviceParams: {
    fontSize: 13,
    marginBottom: 2,
  },
  deviceBattery: {
    fontSize: 13,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },
  recentTimeText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
