import firebaseDatabase, { FirebaseDevice } from './firebaseDatabase';
import { DeviceData } from '../screens/AddDeviceScreen';
import authService from './authService';

class DeviceService {
  private listeners: ((devices: FirebaseDevice[]) => void)[] = [];
  private currentUserId: string | null = null;
  private firebaseUnsubscribe: (() => void) | null = null;

  async initialize(): Promise<FirebaseDevice[]> {
    try {
      // Get current user
      const user = authService.getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      this.currentUserId = user.uid;
      
      // Initialize user data in Firebase
      await firebaseDatabase.initializeUserData(user.uid, user.email || '');
      
      // Get user's devices
      const devices = await firebaseDatabase.getUserDevices(user.uid);
      
      // Set up real-time listener
      this.setupRealtimeListener(user.uid);
      
      console.log(`Device service initialized for user ${user.uid} with ${devices.length} devices`);
      return devices;
    } catch (error) {
      console.error('Error initializing device service:', error);
      return [];
    }
  }

  private setupRealtimeListener(userId: string): void {
    // Clean up existing listener
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }

    // Set up new real-time listener
    this.firebaseUnsubscribe = firebaseDatabase.listenToUserDevices(userId, (devices) => {
      this.notifyListeners(devices);
    });
  }

  getDevices(): FirebaseDevice[] {
    // This will be updated by real-time listeners
    return [];
  }

  async addDevice(deviceData: DeviceData): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.currentUserId) {
        return { success: false, message: 'User not authenticated' };
      }

      const result = await firebaseDatabase.addUserDevice(this.currentUserId, deviceData.deviceId, {
        name: deviceData.objectName,
        sim_number: deviceData.simNumber,
        object_type: deviceData.objectType,
        time_zone: deviceData.timeZone,
      });

      return result;
    } catch (error) {
      console.error('Error adding device:', error);
      return { success: false, message: 'Failed to add device. Please try again.' };
    }
  }

  async removeDevice(deviceId: string): Promise<boolean> {
    try {
      if (!this.currentUserId) {
        return false;
      }

      return await firebaseDatabase.removeUserDevice(this.currentUserId, deviceId);
    } catch (error) {
      console.error('Error removing device:', error);
      return false;
    }
  }

  async updateDevice(deviceId: string, updates: Partial<FirebaseDevice>): Promise<void> {
    // Real-time updates are handled by Firebase listeners
    console.log('Device updates are handled by Firebase real-time listeners');
  }

  getDevice(deviceId: string): FirebaseDevice | undefined {
    // This will be updated by real-time listeners
    return undefined;
  }

  async getTotalDevices(): Promise<number> {
    try {
      if (!this.currentUserId) {
        return 0;
      }
      const stats = await firebaseDatabase.getDeviceStats(this.currentUserId);
      return stats.total;
    } catch (error) {
      console.error('Error getting total devices:', error);
      return 0;
    }
  }

  async getOnlineDevices(): Promise<number> {
    try {
      if (!this.currentUserId) {
        return 0;
      }
      const stats = await firebaseDatabase.getDeviceStats(this.currentUserId);
      return stats.online;
    } catch (error) {
      console.error('Error getting online devices:', error);
      return 0;
    }
  }

  async getOfflineDevices(): Promise<number> {
    try {
      if (!this.currentUserId) {
        return 0;
      }
      const stats = await firebaseDatabase.getDeviceStats(this.currentUserId);
      return stats.offline;
    } catch (error) {
      console.error('Error getting offline devices:', error);
      return 0;
    }
  }

  async simulateDeviceStatusUpdate(): Promise<void> {
    // Real-time updates are handled by Firebase
    console.log('Device status updates are handled by Firebase real-time listeners');
  }

  subscribe(listener: (devices: FirebaseDevice[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(devices: FirebaseDevice[]): void {
    this.listeners.forEach(listener => listener([...devices]));
  }

  // Check if device exists in Firebase database
  async isDeviceRegistered(deviceId: string): Promise<boolean> {
    try {
      return await firebaseDatabase.isDeviceRegistered(deviceId);
    } catch (error) {
      console.error('Error checking device registration:', error);
      return false;
    }
  }

  // Get all available devices in Firebase (for BLE scan)
  async getAllAvailableDevices(): Promise<FirebaseDevice[]> {
    try {
      return await firebaseDatabase.getAllDevices();
    } catch (error) {
      console.error('Error getting all available devices:', error);
      return [];
    }
  }

  // Get device by device_id (IMEI)
  async getDeviceByDeviceId(deviceId: string): Promise<FirebaseDevice | null> {
    try {
      return await firebaseDatabase.getDeviceByDeviceId(deviceId);
    } catch (error) {
      console.error('Error getting device by ID:', error);
      return null;
    }
  }

  // Cleanup when service is destroyed
  cleanup(): void {
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
      this.firebaseUnsubscribe = null;
    }
    firebaseDatabase.cleanup();
    this.listeners = [];
    this.currentUserId = null;
  }

  // Update current user when authentication changes
  updateCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    if (userId) {
      this.setupRealtimeListener(userId);
    } else {
      if (this.firebaseUnsubscribe) {
        this.firebaseUnsubscribe();
        this.firebaseUnsubscribe = null;
      }
    }
  }
}

export default new DeviceService();