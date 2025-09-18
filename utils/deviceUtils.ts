import { Alert } from 'react-native';
import deviceService from '../services/deviceService';
import { DeviceData } from '../screens/AddDeviceScreen';

export const handleAddDevice = async (deviceData: DeviceData) => {
  try {
    const result = await deviceService.addDevice(deviceData);
    if (!result.success) {
      Alert.alert('Error', result.message);
    }
  } catch (error) {
    console.error('Error adding device:', error);
    Alert.alert('Error', 'Failed to add device');
  }
};
