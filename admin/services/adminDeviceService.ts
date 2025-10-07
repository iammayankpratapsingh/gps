import { realtimeDb } from '../../config/firebaseConfig';
import { 
  ref,
  get,
  set,
  remove,
  query,
  orderByChild,
  orderByKey,
  limitToLast
} from 'firebase/database';
import { AdminDevice } from '../types';

class AdminDeviceService {
  // Get all devices from Traccar integration
  async getAllDevices(): Promise<AdminDevice[]> {
    try {
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.keys(devicesData).map(deviceId => {
          const data = devicesData[deviceId];
          return {
            id: deviceId,
            name: data.name || 'Unknown Device',
            uniqueId: data.uniqueId || data.deviceId || deviceId,
            status: data.status || 'unknown',
            lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
            position: data.position ? {
              latitude: data.position.latitude || 0,
              longitude: data.position.longitude || 0,
              speed: data.position.speed || 0,
              course: data.position.course || 0,
              address: data.position.address || ''
            } : undefined,
            owner: {
              uid: data.ownerId || data.uid || 'unknown',
              email: data.ownerEmail || 'unknown@example.com',
              displayName: data.ownerName || 'Unknown User'
            },
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
          } as AdminDevice;
        });
      }
      return [];
    } catch (error) {
      console.error('Error getting all devices:', error);
      return [];
    }
  }

  // Get devices by owner
  async getDevicesByOwner(ownerId: string): Promise<AdminDevice[]> {
    try {
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.keys(devicesData)
          .filter(deviceId => {
            const data = devicesData[deviceId];
            return data.ownerId === ownerId || data.uid === ownerId;
          })
          .map(deviceId => {
            const data = devicesData[deviceId];
            return {
              id: deviceId,
              name: data.name || 'Unknown Device',
              uniqueId: data.uniqueId || data.deviceId || deviceId,
              status: data.status || 'unknown',
              lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
              position: data.position ? {
                latitude: data.position.latitude || 0,
                longitude: data.position.longitude || 0,
                speed: data.position.speed || 0,
                course: data.position.course || 0,
                address: data.position.address || ''
              } : undefined,
              owner: {
                uid: data.ownerId || data.uid || 'unknown',
                email: data.ownerEmail || 'unknown@example.com',
                displayName: data.ownerName || 'Unknown User'
              },
              createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
              updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
            } as AdminDevice;
          });
      }
      return [];
    } catch (error) {
      console.error('Error getting devices by owner:', error);
      return [];
    }
  }

  // Update device
  async updateDevice(deviceId: string, updates: Partial<AdminDevice>): Promise<boolean> {
    try {
      const deviceRef = ref(realtimeDb, `devices/${deviceId}`);
      await set(deviceRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating device:', error);
      return false;
    }
  }

  // Delete device
  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      const deviceRef = ref(realtimeDb, `devices/${deviceId}`);
      await remove(deviceRef);
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      return false;
    }
  }

  // Get device statistics
  async getDeviceStats(): Promise<{
    total: number;
    online: number;
    offline: number;
    unknown: number;
  }> {
    try {
      const devices = await this.getAllDevices();
      const stats = {
        total: devices.length,
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        unknown: devices.filter(d => d.status === 'unknown').length
      };
      return stats;
    } catch (error) {
      console.error('Error getting device stats:', error);
      return { total: 0, online: 0, offline: 0, unknown: 0 };
    }
  }

  // Search devices
  async searchDevices(searchTerm: string): Promise<AdminDevice[]> {
    try {
      const devices = await this.getAllDevices();
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return devices.filter(device => 
        device.name.toLowerCase().includes(lowerSearchTerm) ||
        device.uniqueId.toLowerCase().includes(lowerSearchTerm) ||
        device.owner.displayName.toLowerCase().includes(lowerSearchTerm) ||
        device.owner.email.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching devices:', error);
      return [];
    }
  }
}

export default new AdminDeviceService();
