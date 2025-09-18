import { realtimeDb as database } from '../config/firebaseConfig';
import { ref, get, set, update, remove, onValue, off, push, child } from 'firebase/database';
import { Device, DeviceLocation } from './deviceDatabase';

export interface FirebaseDevice {
  id: string; // Firebase database key
  device_id: string;
  name?: string;
  sim_number?: string;
  object_type?: string;
  time_zone?: string;
  location: DeviceLocation;
  isOnline: boolean;
  lastSeen: string;
  address: string;
  parameters: string;
  battery: number;
  owner?: string; // User ID who owns this device
}

export interface UserDeviceData {
  email: string;
  registeredDevices: string[]; // Array of device IDs
  profile?: any;
}

class FirebaseDatabaseService {
  private listeners: { [key: string]: any } = {};

  // Get all devices from Firebase
  async getAllDevices(): Promise<FirebaseDevice[]> {
    try {
      const devicesRef = ref(database, 'devices/unknown');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        
        // Group devices by device_id and get the latest entry for each
        const deviceMap = new Map<string, any>();
        
        Object.keys(devicesData).forEach(firebaseKey => {
          const deviceData = devicesData[firebaseKey];
          const deviceId = deviceData.device_id;
          const timestamp = new Date(deviceData.location.timestamp).getTime();
          
          if (!deviceMap.has(deviceId) || timestamp > new Date(deviceMap.get(deviceId).location.timestamp).getTime()) {
            deviceMap.set(deviceId, {
              firebaseKey,
              ...deviceData
            });
          }
        });
        
        // Convert map to array of devices
        return Array.from(deviceMap.values()).map(deviceData => ({
          id: deviceData.firebaseKey,
          device_id: deviceData.device_id,
          name: `Device ${deviceData.device_id}`,
          sim_number: 'N/A',
          object_type: 'GPS Tracker',
          time_zone: '(GMT+05:30) India Standard Time',
          location: deviceData.location,
          isOnline: true, // Assume online if data exists
          lastSeen: deviceData.location.timestamp,
          address: this.getAddressFromCoords(deviceData.location.coords),
          parameters: this.getParametersFromLocation(deviceData.location),
          battery: Math.round(deviceData.location.battery.level * 100),
          owner: undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching devices from Firebase:', error);
      return [];
    }
  }

  // Get user's registered devices
  async getUserDevices(userId: string): Promise<FirebaseDevice[]> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        return [];
      }

      const userData = userSnapshot.val();
      const registeredDeviceIds = userData.registeredDevices || [];

      if (registeredDeviceIds.length === 0) {
        return [];
      }

      // Fetch device details for each registered device
      const devicePromises = registeredDeviceIds.map(async (deviceId: string) => {
        const deviceRef = ref(database, `devices/${deviceId}`);
        const deviceSnapshot = await get(deviceRef);
        
        if (deviceSnapshot.exists()) {
          return {
            id: deviceId,
            ...(deviceSnapshot.val() as any)
          };
        }
        return null;
      });

      const devices = await Promise.all(devicePromises);
      return devices.filter(device => device !== null) as FirebaseDevice[];
    } catch (error) {
      console.error('Error fetching user devices from Firebase:', error);
      return [];
    }
  }

  // Check if device exists in Firebase
  async isDeviceRegistered(deviceId: string): Promise<boolean> {
    try {
      const deviceRef = ref(database, 'devices/unknown');
      const snapshot = await get(deviceRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.values(devicesData).some((device: any) => device.device_id === deviceId);
      }
      return false;
    } catch (error) {
      console.error('Error checking device registration:', error);
      return false;
    }
  }

  // Get device by device_id (IMEI)
  async getDeviceByDeviceId(deviceId: string): Promise<FirebaseDevice | null> {
    try {
      const devicesRef = ref(database, 'devices/unknown');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const deviceEntry = Object.entries(devicesData).find(
          ([_, device]: [string, any]) => device.device_id === deviceId
        );
        
        if (deviceEntry) {
          const [firebaseKey, deviceData] = deviceEntry;
          const typedDeviceData = deviceData as any;
          return {
            id: firebaseKey,
            device_id: typedDeviceData.device_id,
            name: `Device ${typedDeviceData.device_id}`,
            sim_number: 'N/A',
            object_type: 'GPS Tracker',
            time_zone: '(GMT+05:30) India Standard Time',
            location: typedDeviceData.location,
            isOnline: true,
            lastSeen: typedDeviceData.location.timestamp,
            address: this.getAddressFromCoords(typedDeviceData.location.coords),
            parameters: this.getParametersFromLocation(typedDeviceData.location),
            battery: Math.round(typedDeviceData.location.battery.level * 100),
            owner: undefined
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching device by ID:', error);
      return null;
    }
  }

  // Add device to user's collection
  async addUserDevice(userId: string, deviceId: string, deviceData: {
    name: string;
    sim_number: string;
    object_type: string;
    time_zone: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // First, check if device exists in Firebase
      const deviceExists = await this.isDeviceRegistered(deviceId);
      if (!deviceExists) {
        return { success: false, message: 'Device not found in database. Please check the Device ID.' };
      }

      // Get the Firebase device ID (not the IMEI)
      const firebaseDevice = await this.getDeviceByDeviceId(deviceId);
      if (!firebaseDevice) {
        return { success: false, message: 'Device not found in database. Please check the Device ID.' };
      }

      // Update device with user data
      const deviceRef = ref(database, `devices/${firebaseDevice.id}`);
      await update(deviceRef, {
        name: deviceData.name,
        sim_number: deviceData.sim_number,
        object_type: deviceData.object_type,
        time_zone: deviceData.time_zone,
        owner: userId
      });

      // Add device to user's registered devices list
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      let userData: UserDeviceData;
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
        if (!userData.registeredDevices) {
          userData.registeredDevices = [];
        }
        if (!userData.registeredDevices.includes(firebaseDevice.id)) {
          userData.registeredDevices.push(firebaseDevice.id);
        }
      } else {
        userData = {
          email: '', // Will be set by auth service
          registeredDevices: [firebaseDevice.id]
        };
      }

      await set(userRef, userData);
      return { success: true, message: 'Device added successfully!' };
    } catch (error) {
      console.error('Error adding user device:', error);
      return { success: false, message: 'Failed to add device. Please try again.' };
    }
  }

  // Remove device from user's collection
  async removeUserDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      // Get the Firebase device ID (not the IMEI)
      const firebaseDevice = await this.getDeviceByDeviceId(deviceId);
      if (!firebaseDevice) {
        return false;
      }

      // Remove device from user's registered devices list
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if (userData.registeredDevices) {
          userData.registeredDevices = userData.registeredDevices.filter(
            (id: string) => id !== firebaseDevice.id
          );
          await set(userRef, userData);
        }
      }

      // Remove owner from device
      const deviceRef = ref(database, `devices/${firebaseDevice.id}`);
      await update(deviceRef, {
        owner: null
      });

      return true;
    } catch (error) {
      console.error('Error removing user device:', error);
      return false;
    }
  }

  // Get device statistics for a user
  async getDeviceStats(userId: string): Promise<{ total: number; online: number; offline: number }> {
    try {
      const userDevices = await this.getUserDevices(userId);
      const total = userDevices.length;
      const online = userDevices.filter(device => device.isOnline).length;
      const offline = total - online;

      return { total, online, offline };
    } catch (error) {
      console.error('Error getting device stats:', error);
      return { total: 0, online: 0, offline: 0 };
    }
  }

  // Listen for real-time updates on user's devices
  listenToUserDevices(userId: string, callback: (devices: FirebaseDevice[]) => void): () => void {
    const userRef = ref(database, `users/${userId}`);
    const deviceRef = ref(database, 'devices/unknown');
    
    let userRegisteredDevices: string[] = [];
    
    // Listen to user's registered devices
    const userUnsubscribe = onValue(userRef, (userSnapshot) => {
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        userRegisteredDevices = userData.registeredDevices || [];
        
        if (userRegisteredDevices.length === 0) {
          callback([]);
          return;
        }
        
        // Fetch current device data for registered devices
        this.fetchUserDevicesData(userRegisteredDevices, callback);
      } else {
        callback([]);
      }
    });
    
    // Listen to all device changes for real-time updates
    const deviceUnsubscribe = onValue(deviceRef, () => {
      if (userRegisteredDevices.length > 0) {
        this.fetchUserDevicesData(userRegisteredDevices, callback);
      }
    });
    
    // Store both listeners for cleanup
    this.listeners[userId] = () => {
      userUnsubscribe();
      deviceUnsubscribe();
    };
    
    // Return cleanup function
    return () => {
      if (this.listeners[userId]) {
        this.listeners[userId]();
        delete this.listeners[userId];
      }
    };
  }
  
  // Helper method to fetch user devices data
  private async fetchUserDevicesData(registeredDeviceIds: string[], callback: (devices: FirebaseDevice[]) => void): Promise<void> {
    try {
      const deviceRef = ref(database, 'devices/unknown');
      const snapshot = await get(deviceRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const userDevices: FirebaseDevice[] = [];
        
        // Group all devices by device_id and get the latest entry for each
        const deviceMap = new Map<string, any>();
        
        Object.keys(devicesData).forEach(firebaseKey => {
          const deviceData = devicesData[firebaseKey];
          const deviceId = deviceData.device_id;
          const timestamp = new Date(deviceData.location.timestamp).getTime();
          
          if (!deviceMap.has(deviceId) || timestamp > new Date(deviceMap.get(deviceId).location.timestamp).getTime()) {
            deviceMap.set(deviceId, {
              firebaseKey,
              ...deviceData
            });
          }
        });
        
        // Filter devices that belong to this user (using device_id instead of firebaseKey)
        registeredDeviceIds.forEach(firebaseKey => {
          // Find the device by firebaseKey in the original data
          if (devicesData[firebaseKey]) {
            const deviceData = devicesData[firebaseKey];
            const deviceId = deviceData.device_id;
            
            // Get the latest data for this device_id
            if (deviceMap.has(deviceId)) {
              const latestDeviceData = deviceMap.get(deviceId);
              userDevices.push({
                id: latestDeviceData.firebaseKey,
                device_id: latestDeviceData.device_id,
                name: `Device ${latestDeviceData.device_id}`,
                sim_number: 'N/A',
                object_type: 'GPS Tracker',
                time_zone: '(GMT+05:30) India Standard Time',
                location: latestDeviceData.location,
                isOnline: true,
                lastSeen: latestDeviceData.location.timestamp,
                address: this.getAddressFromCoords(latestDeviceData.location.coords),
                parameters: this.getParametersFromLocation(latestDeviceData.location),
                battery: Math.round(latestDeviceData.location.battery.level * 100),
                owner: undefined
              });
            }
          }
        });
        
        callback(userDevices);
      } else {
        callback([]);
      }
    } catch (error) {
      console.error('Error fetching user devices data:', error);
      callback([]);
    }
  }

  // Listen for real-time updates on a specific device
  listenToDevice(deviceId: string, callback: (device: FirebaseDevice | null) => void): () => void {
    const deviceRef = ref(database, `devices/unknown/${deviceId}`);
    
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        const deviceData = snapshot.val();
        callback({
          id: deviceId,
          device_id: deviceData.device_id,
          name: `Device ${deviceData.device_id}`,
          sim_number: 'N/A',
          object_type: 'GPS Tracker',
          time_zone: '(GMT+05:30) India Standard Time',
          location: deviceData.location,
          isOnline: true,
          lastSeen: deviceData.location.timestamp,
          address: this.getAddressFromCoords(deviceData.location.coords),
          parameters: this.getParametersFromLocation(deviceData.location),
          battery: Math.round(deviceData.location.battery.level * 100),
          owner: undefined
        });
      } else {
        callback(null);
      }
    });

    // Store listener for cleanup
    this.listeners[deviceId] = unsubscribe;
    
    // Return cleanup function
    return () => {
      if (this.listeners[deviceId]) {
        this.listeners[deviceId]();
        delete this.listeners[deviceId];
      }
    };
  }

  // Cleanup all listeners
  cleanup(): void {
    Object.values(this.listeners).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = {};
  }

  // Initialize user data in Firebase
  async initializeUserData(userId: string, email: string): Promise<void> {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        const userData: UserDeviceData = {
          email: email,
          registeredDevices: []
        };
        await set(userRef, userData);
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  }

  // Helper method to get address from coordinates
  private getAddressFromCoords(coords: any): string {
    // Simple address generation based on coordinates
    // In a real app, you'd use reverse geocoding
    const lat = coords.latitude;
    const lon = coords.longitude;
    
    // Basic location approximation for India
    if (lat >= 28 && lat <= 29 && lon >= 77 && lon <= 78) {
      return 'New Delhi, India';
    } else if (lat >= 19 && lat <= 20 && lon >= 72 && lon <= 73) {
      return 'Mumbai, India';
    } else if (lat >= 12 && lat <= 13 && lon >= 77 && lon <= 78) {
      return 'Bangalore, India';
    } else if (lat >= 13 && lat <= 14 && lon >= 80 && lon <= 81) {
      return 'Chennai, India';
    } else {
      return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
    }
  }

  // Helper method to get parameters from location data
  private getParametersFromLocation(location: any): string {
    const speed = location.coords.speed;
    const heading = location.coords.heading;
    
    if (speed > 0 && heading >= 0) {
      return `Speed: ${speed.toFixed(1)} km/h, Heading: ${heading.toFixed(1)}°`;
    } else if (speed > 0) {
      return `Speed: ${speed.toFixed(1)} km/h`;
    } else {
      return 'Stationary';
    }
  }
}

export default new FirebaseDatabaseService();
