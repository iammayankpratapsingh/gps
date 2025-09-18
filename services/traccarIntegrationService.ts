import { traccarService, TraccarDevice, TraccarPosition } from './traccarService';
import { sqliteService, TraccarDeviceRecord, TraccarPositionRecord } from './sqliteService';
import authService from './authService';

export interface TraccarIntegrationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeviceWithPosition {
  device: TraccarDeviceRecord;
  position?: TraccarPositionRecord;
  isOnline: boolean;
  lastSeen: string;
}

class TraccarIntegrationService {
  private isInitialized = false;

  /**
   * Initialize the service
   */
  async initialize(): Promise<TraccarIntegrationResult<boolean>> {
    try {
      if (this.isInitialized) {
        return { success: true, data: true };
      }

      console.log('[TraccarIntegrationService] Initializing...');
      
      // Initialize SQLite database
      const dbResult = await sqliteService.initialize();
      if (!dbResult.success) {
        return {
          success: false,
          error: `Database initialization failed: ${dbResult.error}`,
        };
      }

      // Test Traccar connection (but don't fail if it doesn't work)
      try {
        const connectionResult = await traccarService.testConnection();
        if (!connectionResult.success) {
          console.warn('[TraccarIntegrationService] Traccar connection test failed:', connectionResult.error);
          console.warn('[TraccarIntegrationService] Continuing with offline mode...');
        } else {
          console.log('[TraccarIntegrationService] Traccar connection test successful');
        }
      } catch (connectionError) {
        console.warn('[TraccarIntegrationService] Traccar connection test error:', connectionError);
        console.warn('[TraccarIntegrationService] Continuing with offline mode...');
      }

      this.isInitialized = true;
      console.log('[TraccarIntegrationService] Initialized successfully');
      
      return { success: true, data: true };
    } catch (error) {
      console.error('[TraccarIntegrationService] Initialization failed:', error);
      console.error('[TraccarIntegrationService] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      };
    }
  }

  /**
   * Add a device by looking it up in Traccar and saving to local database
   */
  async addDevice(enteredDeviceId: string, customName: string): Promise<TraccarIntegrationResult<boolean>> {
    try {
      console.log(`[TraccarIntegrationService] Adding device: ${enteredDeviceId} with name: ${customName}`);
      
      // Get current user
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Look up device in Traccar
      const deviceResult = await traccarService.findDeviceByUniqueId(enteredDeviceId);
      if (!deviceResult.success) {
        return {
          success: false,
          error: `Failed to connect to Traccar: ${deviceResult.error}`,
        };
      }

      if (!deviceResult.data) {
        return {
          success: false,
          error: 'Device not found in Traccar server. Please check the Device ID.',
        };
      }

      const traccarDevice = deviceResult.data;

      // Save device to local database
      const deviceRecord: Omit<TraccarDeviceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        appUserId: currentUser.uid,
        enteredDeviceId: enteredDeviceId,
        internalDeviceId: traccarDevice.id,
        customName: customName,
        deviceName: traccarDevice.name,
        status: traccarDevice.status,
        lastUpdate: traccarDevice.lastUpdate,
      };

      const saveResult = await sqliteService.saveDevice(deviceRecord);
      if (!saveResult.success) {
        return {
          success: false,
          error: `Failed to save device: ${saveResult.error}`,
        };
      }

      // Try to get initial position
      await this.syncDevicePosition(enteredDeviceId);

      console.log(`[TraccarIntegrationService] Successfully added device: ${enteredDeviceId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to add device:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add device',
      };
    }
  }

  /**
   * Sync position data for a specific device
   */
  async syncDevicePosition(enteredDeviceId: string): Promise<TraccarIntegrationResult<boolean>> {
    try {
      console.log(`[TraccarIntegrationService] Syncing position for device: ${enteredDeviceId}`);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Get device from local database
      const devicesResult = await sqliteService.getUserDevices(currentUser.uid);
      if (!devicesResult.success || !devicesResult.data) {
        return {
          success: false,
          error: 'Failed to get user devices',
        };
      }

      const device = devicesResult.data.find(d => d.enteredDeviceId === enteredDeviceId);
      if (!device) {
        return {
          success: false,
          error: 'Device not found in local database',
        };
      }

      // Get latest position from Traccar
      const positionResult = await traccarService.getDevicePosition(device.internalDeviceId);
      if (!positionResult.success) {
        console.warn(`[TraccarIntegrationService] Failed to get position from Traccar: ${positionResult.error}`);
        return {
          success: false,
          error: `Failed to get position: ${positionResult.error}`,
        };
      }

      if (!positionResult.data) {
        console.log(`[TraccarIntegrationService] No position data available for device: ${enteredDeviceId}`);
        return { success: true, data: true };
      }

      const traccarPosition = positionResult.data;

      // Save position to local database
      const positionRecord: Omit<TraccarPositionRecord, 'id' | 'createdAt'> = {
        appUserId: currentUser.uid,
        internalDeviceId: device.internalDeviceId,
        enteredDeviceId: enteredDeviceId,
        latitude: traccarPosition.latitude,
        longitude: traccarPosition.longitude,
        altitude: traccarPosition.altitude,
        speed: traccarPosition.speed,
        course: traccarPosition.course,
        address: traccarPosition.address,
        accuracy: traccarPosition.accuracy,
        batteryLevel: traccarPosition.attributes.batteryLevel,
        deviceTime: traccarPosition.deviceTime,
        fixTime: traccarPosition.fixTime,
        serverTime: traccarPosition.serverTime,
        valid: traccarPosition.valid,
        outdated: traccarPosition.outdated,
      };

      const saveResult = await sqliteService.savePosition(positionRecord);
      if (!saveResult.success) {
        return {
          success: false,
          error: `Failed to save position: ${saveResult.error}`,
        };
      }

      console.log(`[TraccarIntegrationService] Successfully synced position for device: ${enteredDeviceId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to sync device position:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync device position',
      };
    }
  }

  /**
   * Sync all devices for the current user
   */
  async syncAllDevices(): Promise<TraccarIntegrationResult<boolean>> {
    try {
      console.log('[TraccarIntegrationService] Syncing all devices...');
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Get all user devices
      const devicesResult = await sqliteService.getUserDevices(currentUser.uid);
      if (!devicesResult.success || !devicesResult.data) {
        return {
          success: false,
          error: 'Failed to get user devices',
        };
      }

      // Sync each device
      const syncPromises = devicesResult.data.map(device => 
        this.syncDevicePosition(device.enteredDeviceId)
      );

      const results = await Promise.allSettled(syncPromises);
      
      const failed = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      );

      if (failed.length > 0) {
        console.warn(`[TraccarIntegrationService] ${failed.length} devices failed to sync`);
      }

      console.log(`[TraccarIntegrationService] Sync completed. ${devicesResult.data.length - failed.length}/${devicesResult.data.length} devices synced successfully`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to sync all devices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync all devices',
      };
    }
  }

  /**
   * Get all devices with their latest positions for the current user
   */
  async getUserDevicesWithPositions(): Promise<TraccarIntegrationResult<DeviceWithPosition[]>> {
    try {
      console.log('[TraccarIntegrationService] Getting user devices with positions...');
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        console.log('[TraccarIntegrationService] No authenticated user found');
        return {
          success: true, // Return success with empty array instead of error
          data: [],
        };
      }

      // Get devices with positions from local database
      const result = await sqliteService.getUserDevicesWithPositions(currentUser.uid);
      if (!result.success || !result.data) {
        console.log('[TraccarIntegrationService] No devices found in database');
        return {
          success: true, // Return success with empty array instead of error
          data: [],
        };
      }

      // Transform to DeviceWithPosition format
      const devicesWithPositions: DeviceWithPosition[] = result.data.map(item => {
        const isOnline = item.status === 'online';
        const lastSeen = item.latestPosition?.serverTime || item.lastUpdate;
        
        return {
          device: item,
          position: item.latestPosition,
          isOnline,
          lastSeen,
        };
      });

      console.log(`[TraccarIntegrationService] Retrieved ${devicesWithPositions.length} devices with positions`);
      return { success: true, data: devicesWithPositions };
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to get user devices with positions:', error);
      return {
        success: true, // Return success with empty array instead of error to prevent crashes
        data: [],
      };
    }
  }

  /**
   * Remove a device
   */
  async removeDevice(enteredDeviceId: string): Promise<TraccarIntegrationResult<boolean>> {
    try {
      console.log(`[TraccarIntegrationService] Removing device: ${enteredDeviceId}`);
      
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const result = await sqliteService.deleteDevice(currentUser.uid, enteredDeviceId);
      if (!result.success) {
        return {
          success: false,
          error: `Failed to remove device: ${result.error}`,
        };
      }

      console.log(`[TraccarIntegrationService] Successfully removed device: ${enteredDeviceId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to remove device:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove device',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<TraccarIntegrationResult<{ deviceCount: number; positionCount: number }>> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      return await sqliteService.getStats(currentUser.uid);
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to get stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      };
    }
  }

  /**
   * Clear all user data
   */
  async clearUserData(): Promise<TraccarIntegrationResult<boolean>> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      return await sqliteService.clearUserData(currentUser.uid);
    } catch (error) {
      console.error('[TraccarIntegrationService] Failed to clear user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear user data',
      };
    }
  }
}

// Export singleton instance
export const traccarIntegrationService = new TraccarIntegrationService();
export default traccarIntegrationService;
