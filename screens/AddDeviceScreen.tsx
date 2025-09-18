import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { Theme, ThemeColors } from '../services/themeService';
import deviceService from '../services/deviceService';
import simpleTraccarService from '../services/traccarServiceSimple';
import { useStatusBar } from '../hooks/useStatusBar';

interface AddDeviceScreenProps {
  onClose: () => void;
  onAddDevice: (deviceData: DeviceData) => void;
  theme: Theme;
}

export interface DeviceData {
  objectType: string;
  objectName: string;
  objectIcon: string;
  deviceId: string;
  simNumber: string;
  timeZone: string;
}

// Object types with their corresponding icons
const OBJECT_TYPES = [
  { value: 'Two Wheeler', label: 'Two Wheeler', icon: '🏍️' },
  { value: 'Four Wheeler', label: 'Four Wheeler', icon: '🚗' },
  { value: 'Heavy Vehicle', label: 'Heavy Vehicle', icon: '🚛' },
  { value: 'Commercial Vehicle', label: 'Commercial Vehicle', icon: '🚚' },
  { value: 'Personal Vehicle', label: 'Personal Vehicle', icon: '🚙' },
  { value: 'Motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'Bicycle', label: 'Bicycle', icon: '🚲' },
  { value: 'Marine Vehicle', label: 'Marine Vehicle', icon: '⛵' },
  { value: 'Aircraft', label: 'Aircraft', icon: '✈️' },
  { value: 'Horse', label: 'Horse', icon: '🐴' },
  { value: 'Cow', label: 'Cow', icon: '🐄' },
  { value: 'Buffalo', label: 'Buffalo', icon: '🐃' },
  { value: 'Sheep', label: 'Sheep', icon: '🐑' },
  { value: 'Goat', label: 'Goat', icon: '🐐' },
  { value: 'Dog', label: 'Dog', icon: '🐕' },
  { value: 'Cat', label: 'Cat', icon: '🐱' },
  { value: 'Other Animal', label: 'Other Animal', icon: '🐾' },
  { value: 'Other Vehicle', label: 'Other Vehicle', icon: '🚜' },
];

// Worldwide timezones
const TIMEZONES = [
  { value: '(GMT-12:00) International Date Line West', label: '(GMT-12:00) International Date Line West' },
  { value: '(GMT-11:00) Midway Island, Samoa', label: '(GMT-11:00) Midway Island, Samoa' },
  { value: '(GMT-10:00) Hawaii', label: '(GMT-10:00) Hawaii' },
  { value: '(GMT-09:00) Alaska', label: '(GMT-09:00) Alaska' },
  { value: '(GMT-08:00) Pacific Time (US & Canada)', label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { value: '(GMT-07:00) Mountain Time (US & Canada)', label: '(GMT-07:00) Mountain Time (US & Canada)' },
  { value: '(GMT-06:00) Central Time (US & Canada)', label: '(GMT-06:00) Central Time (US & Canada)' },
  { value: '(GMT-05:00) Eastern Time (US & Canada)', label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: '(GMT-04:00) Atlantic Time (Canada)', label: '(GMT-04:00) Atlantic Time (Canada)' },
  { value: '(GMT-03:00) Brasilia', label: '(GMT-03:00) Brasilia' },
  { value: '(GMT-02:00) Mid-Atlantic', label: '(GMT-02:00) Mid-Atlantic' },
  { value: '(GMT-01:00) Azores', label: '(GMT-01:00) Azores' },
  { value: '(GMT+00:00) Greenwich Mean Time', label: '(GMT+00:00) Greenwich Mean Time' },
  { value: '(GMT+01:00) Amsterdam, Berlin, Paris', label: '(GMT+01:00) Amsterdam, Berlin, Paris' },
  { value: '(GMT+02:00) Athens, Bucharest, Istanbul', label: '(GMT+02:00) Athens, Bucharest, Istanbul' },
  { value: '(GMT+03:00) Moscow, St. Petersburg', label: '(GMT+03:00) Moscow, St. Petersburg' },
  { value: '(GMT+04:00) Abu Dhabi, Muscat', label: '(GMT+04:00) Abu Dhabi, Muscat' },
  { value: '(GMT+05:00) Islamabad, Karachi, Tashkent', label: '(GMT+05:00) Islamabad, Karachi, Tashkent' },
  { value: '(GMT+05:30) India Standard Time', label: '(GMT+05:30) India Standard Time' },
  { value: '(GMT+06:00) Almaty, Dhaka', label: '(GMT+06:00) Almaty, Dhaka' },
  { value: '(GMT+07:00) Bangkok, Hanoi, Jakarta', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
  { value: '(GMT+08:00) Beijing, Chongqing, Hong Kong', label: '(GMT+08:00) Beijing, Chongqing, Hong Kong' },
  { value: '(GMT+09:00) Osaka, Sapporo, Tokyo', label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
  { value: '(GMT+10:00) Canberra, Melbourne, Sydney', label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
  { value: '(GMT+11:00) Magadan, Solomon Islands', label: '(GMT+11:00) Magadan, Solomon Islands' },
  { value: '(GMT+12:00) Auckland, Wellington', label: '(GMT+12:00) Auckland, Wellington' },
];

export default function AddDeviceScreen({ onClose, onAddDevice, theme }: AddDeviceScreenProps) {
  const [colors, setColors] = useState<ThemeColors>(themeService.getColors());
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });
  
  const [formData, setFormData] = useState<DeviceData>({
    objectType: 'Two Wheeler',
    objectName: '',
    objectIcon: '🏍️',
    deviceId: '',
    simNumber: '',
    timeZone: '(GMT+05:30) India Standard Time',
  });

  const [showObjectTypeDropdown, setShowObjectTypeDropdown] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showBLEScan, setShowBLEScan] = useState(false);
  const [bleDevices, setBleDevices] = useState<Array<{id: string, name: string, imei: string, sim: string}>>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = themeService.subscribe((currentTheme) => {
      setColors(themeService.getColors());
    });
    
    // Small delay to ensure proper rendering on first launch
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleInputChange = (field: keyof DeviceData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectTypeSelect = (objectType: string) => {
    const selectedType = OBJECT_TYPES.find(type => type.value === objectType);
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        objectType: selectedType.value,
        objectIcon: selectedType.icon
      }));
    }
    setShowObjectTypeDropdown(false);
  };

  const handleTimezoneSelect = (timezone: string) => {
    setFormData(prev => ({
      ...prev,
      timeZone: timezone
    }));
    setShowTimezoneDropdown(false);
  };

  const handleBLEDeviceSelect = (device: any) => {
    setFormData(prev => ({
      ...prev,
      deviceId: device.imei,
      simNumber: device.sim
    }));
    setShowBLEScan(false);
  };

  const handleBLEScan = async () => {
    try {
      // Get all available devices from Firebase database
      const availableDevices = await deviceService.getAllAvailableDevices();
      const bleDeviceList = availableDevices.map(device => ({
        id: device.id,
        name: device.name || 'Unknown Device',
        imei: device.device_id,
        sim: device.sim_number || 'N/A'
      }));
      setBleDevices(bleDeviceList);
      setShowBLEScan(true);
    } catch (error) {
      console.error('Error fetching BLE devices:', error);
      Alert.alert('Error', 'Failed to fetch available devices');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.objectName.trim()) {
      Alert.alert('Error', 'Object name is required');
      return;
    }
    if (!formData.deviceId.trim()) {
      Alert.alert('Error', 'Device ID (IMEI) is required');
      return;
    }
    if (!formData.simNumber.trim()) {
      Alert.alert('Error', 'SIM number is required');
      return;
    }

    setIsConnecting(true);

    try {
      console.log('[AddDeviceScreen] Looking up device in Traccar:', formData.deviceId);
      
      // Look up device in Traccar server
      const traccarResult = await simpleTraccarService.findDeviceByUniqueId(formData.deviceId.trim());
      
      if (!traccarResult.success) {
        Alert.alert('Error', `Failed to connect to Traccar server: ${traccarResult.error}`);
        return;
      }

      if (!traccarResult.data) {
        Alert.alert('Error', 'Device not found in Traccar server. Please check the Device ID.');
        return;
      }

      const traccarDevice = traccarResult.data;
      console.log('[AddDeviceScreen] Found device in Traccar:', traccarDevice);

      // Device found in Traccar - show success
      Alert.alert(
        'Success', 
        `Device "${formData.objectName}" (${traccarDevice.name}) has been successfully connected to Traccar!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              onAddDevice(formData);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding device:', error);
      Alert.alert('Error', 'An unexpected error occurred while adding the device');
    } finally {
      setIsConnecting(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      backgroundColor: colors.background,
      zIndex: 1000,
    },
    safeArea: {
      backgroundColor: colors.header,
      minHeight: 70, // Reduced header height
    },
    header: {
      backgroundColor: colors.header,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: 8,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 8, // Reduced padding
      minHeight: 40, // Reduced minimum height
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16, // Perfect circle (half of width/height)
      backgroundColor: colors.input,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 30,
    },
    formContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
    },
    formRow: {
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    dropdownContainer: {
      position: 'relative',
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dropdownButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    dropdownIcon: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginTop: 4,
      zIndex: 1000,
      maxHeight: 250,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    dropdownScrollView: {
      maxHeight: 250,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    dropdownItemText: {
      fontSize: 16,
      color: colors.text,
    },
    textInput: {
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    selectedIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    iconText: {
      fontSize: 16,
      color: colors.text,
    },
    inputWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    inputIcon: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 12,
    },
    inputText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    helpText: {
      fontSize: 12,
      marginTop: 4,
      fontStyle: 'italic',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    scanButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    scanButtonDisabled: {
      backgroundColor: colors.textSecondary,
      opacity: 0.6,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    orLineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    orText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    // BLE Scan Modal Styles
    bleModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bleModal: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    bleModalHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    bleIcon: {
      fontSize: 48,
      color: colors.primary,
      marginBottom: 12,
    },
    bleTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },
    bleDeviceList: {
      maxHeight: 300,
    },
    bleDeviceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bleDeviceInfo: {
      flex: 1,
    },
    bleDeviceName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    bleDeviceDetails: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    bleDeviceId: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  // Don't render until ready to prevent layout issues
  if (!isReady) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>+ Add Device</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Object Type Dropdown */}
          <View style={styles.formRow}>
            <Text style={styles.label}>Object type</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowObjectTypeDropdown(!showObjectTypeDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{formData.objectType}</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              
              {showObjectTypeDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView 
                    style={styles.dropdownScrollView} 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {OBJECT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={styles.dropdownItem}
                        onPress={() => handleObjectTypeSelect(type.value)}
                      >
                        <Text style={styles.dropdownItemIcon}>{type.icon}</Text>
                        <Text style={styles.dropdownItemText}>{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Object Name */}
          <View style={styles.formRow}>
            <Text style={styles.label}>Object name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.objectName}
              onChangeText={(value) => handleInputChange('objectName', value)}
              placeholder="Name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Object Icon */}
          <View style={styles.formRow}>
            <Text style={styles.label}>Object icon</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.selectedIcon}>{formData.objectIcon}</Text>
            </View>
          </View>

          {/* Device ID (IMEI) */}
          <View style={styles.formRow}>
            <Text style={styles.label}>Device ID (IMEI)</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.inputText}
                value={formData.deviceId}
                onChangeText={(value) => handleInputChange('deviceId', value)}
                placeholder="92692518 or 31910150"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              💡 Available device IDs: 92692518 (Moto), 31910150 (Moto2)
            </Text>
          </View>

          {/* SIM Number */}
          <View style={styles.formRow}>
            <Text style={styles.label}>SIM number</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>📶</Text>
              <TextInput
                style={styles.inputText}
                value={formData.simNumber}
                onChangeText={(value) => handleInputChange('simNumber', value)}
                placeholder="0987654321"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Time Zone */}
          <View style={styles.formRow}>
            <Text style={styles.label}>Time zone</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              >
                <Text style={styles.dropdownButtonText}>{formData.timeZone}</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
              
              {showTimezoneDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView 
                    style={styles.dropdownScrollView} 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {TIMEZONES.map((timezone) => (
                      <TouchableOpacity
                        key={timezone.value}
                        style={styles.dropdownItem}
                        onPress={() => handleTimezoneSelect(timezone.value)}
                      >
                        <Text style={styles.dropdownItemText}>{timezone.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* OR Line */}
        <View style={styles.orLineContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleBLEScan}
          >
            <Text style={styles.scanButtonText}>🔍</Text>
            <Text style={styles.scanButtonText}>Scan via BLE</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View style={[styles.buttonContainer, { marginTop: 20 }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.scanButton, isConnecting && styles.scanButtonDisabled]} 
            onPress={handleSave}
            disabled={isConnecting}
          >
            <Text style={styles.scanButtonText}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BLE Scan Modal */}
      <Modal
        visible={showBLEScan}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBLEScan(false)}
      >
        <View style={styles.bleModalOverlay}>
          <View style={styles.bleModal}>
            <View style={styles.bleModalHeader}>
              <Text style={styles.bleIcon}>📶</Text>
              <Text style={styles.bleTitle}>Searching for nearby devices...</Text>
            </View>
            
            <ScrollView style={styles.bleDeviceList}>
              {bleDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.bleDeviceItem}
                  onPress={() => handleBLEDeviceSelect(device)}
                >
                  <View style={styles.bleDeviceInfo}>
                    <Text style={styles.bleDeviceName}>{device.name}</Text>
                    <Text style={styles.bleDeviceDetails}>
                      {device.imei} / {device.sim}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}