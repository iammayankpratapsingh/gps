import * as SQLite from 'expo-sqlite';

// Database configuration
const DATABASE_NAME = 'traccar_cache.db';
const DATABASE_VERSION = 1;

// Types for database operations
export interface TraccarDeviceRecord {
  id?: number;
  appUserId: string;
  enteredDeviceId: string; // The device ID entered by user (IMEI)
  internalDeviceId: number; // Traccar's internal device ID
  customName: string;
  deviceName: string; // Traccar device name
  status: string;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraccarPositionRecord {
  id?: number;
  appUserId: string;
  internalDeviceId: number;
  enteredDeviceId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address: string;
  accuracy: number;
  batteryLevel?: number;
  deviceTime: string;
  fixTime: string;
  serverTime: string;
  valid: boolean;
  outdated: boolean;
  createdAt: string;
}

export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize the database
   */
  async initialize(): Promise<DatabaseResult<boolean>> {
    try {
      if (this.isInitialized && this.db) {
        return { success: true, data: true };
      }

      console.log('[SQLiteService] Initializing database...');
      
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('[SQLiteService] Database initialized successfully');
      
      return { success: true, data: true };
    } catch (error) {
      console.error('[SQLiteService] Database initialization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database initialization failed',
      };
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create devices table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS traccar_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_user_id TEXT NOT NULL,
        entered_device_id TEXT NOT NULL,
        internal_device_id INTEGER NOT NULL,
        custom_name TEXT NOT NULL,
        device_name TEXT NOT NULL,
        status TEXT NOT NULL,
        last_update TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(app_user_id, entered_device_id)
      );
    `);

    // Create positions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS traccar_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_user_id TEXT NOT NULL,
        internal_device_id INTEGER NOT NULL,
        entered_device_id TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        altitude REAL NOT NULL,
        speed REAL NOT NULL,
        course REAL NOT NULL,
        address TEXT NOT NULL,
        accuracy REAL NOT NULL,
        battery_level INTEGER,
        device_time TEXT NOT NULL,
        fix_time TEXT NOT NULL,
        server_time TEXT NOT NULL,
        valid INTEGER NOT NULL,
        outdated INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_devices_user_id ON traccar_devices(app_user_id);
    `);
    
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_positions_user_id ON traccar_positions(app_user_id);
    `);
    
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_positions_device_id ON traccar_positions(internal_device_id);
    `);

    console.log('[SQLiteService] Database tables created successfully');
  }

  /**
   * Add or update a device record
   */
  async saveDevice(device: Omit<TraccarDeviceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResult<number>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const now = new Date().toISOString();
      
      // Check if device already exists
      const existingDevice = await this.db.getFirstAsync<TraccarDeviceRecord>(
        'SELECT id FROM traccar_devices WHERE app_user_id = ? AND entered_device_id = ?',
        [device.appUserId, device.enteredDeviceId]
      );

      let result;
      if (existingDevice) {
        // Update existing device
        result = await this.db.runAsync(
          `UPDATE traccar_devices SET 
           internal_device_id = ?, custom_name = ?, device_name = ?, 
           status = ?, last_update = ?, updated_at = ?
           WHERE app_user_id = ? AND entered_device_id = ?`,
          [
            device.internalDeviceId,
            device.customName,
            device.deviceName,
            device.status,
            device.lastUpdate,
            now,
            device.appUserId,
            device.enteredDeviceId,
          ]
        );
        console.log(`[SQLiteService] Updated device: ${device.enteredDeviceId}`);
      } else {
        // Insert new device
        result = await this.db.runAsync(
          `INSERT INTO traccar_devices 
           (app_user_id, entered_device_id, internal_device_id, custom_name, 
            device_name, status, last_update, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            device.appUserId,
            device.enteredDeviceId,
            device.internalDeviceId,
            device.customName,
            device.deviceName,
            device.status,
            device.lastUpdate,
            now,
            now,
          ]
        );
        console.log(`[SQLiteService] Added new device: ${device.enteredDeviceId}`);
      }

      return { success: true, data: result.lastInsertRowId };
    } catch (error) {
      console.error('[SQLiteService] Failed to save device:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save device',
      };
    }
  }

  /**
   * Save position data
   */
  async savePosition(position: Omit<TraccarPositionRecord, 'id' | 'createdAt'>): Promise<DatabaseResult<number>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const now = new Date().toISOString();
      
      const result = await this.db.runAsync(
        `INSERT INTO traccar_positions 
         (app_user_id, internal_device_id, entered_device_id, latitude, longitude, 
          altitude, speed, course, address, accuracy, battery_level, device_time, 
          fix_time, server_time, valid, outdated, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          position.appUserId,
          position.internalDeviceId,
          position.enteredDeviceId,
          position.latitude,
          position.longitude,
          position.altitude,
          position.speed,
          position.course,
          position.address,
          position.accuracy,
          position.batteryLevel || null,
          position.deviceTime,
          position.fixTime,
          position.serverTime,
          position.valid ? 1 : 0,
          position.outdated ? 1 : 0,
          now,
        ]
      );

      console.log(`[SQLiteService] Saved position for device: ${position.enteredDeviceId}`);
      return { success: true, data: result.lastInsertRowId };
    } catch (error) {
      console.error('[SQLiteService] Failed to save position:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save position',
      };
    }
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(appUserId: string): Promise<DatabaseResult<TraccarDeviceRecord[]>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const devices = await this.db.getAllAsync<TraccarDeviceRecord>(
        'SELECT * FROM traccar_devices WHERE app_user_id = ? ORDER BY created_at DESC',
        [appUserId]
      );

      console.log(`[SQLiteService] Retrieved ${devices.length} devices for user: ${appUserId}`);
      return { success: true, data: devices };
    } catch (error) {
      console.error('[SQLiteService] Failed to get user devices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user devices',
      };
    }
  }

  /**
   * Get latest position for a device
   */
  async getLatestPosition(appUserId: string, enteredDeviceId: string): Promise<DatabaseResult<TraccarPositionRecord | null>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const position = await this.db.getFirstAsync<TraccarPositionRecord>(
        `SELECT * FROM traccar_positions 
         WHERE app_user_id = ? AND entered_device_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [appUserId, enteredDeviceId]
      );

      return { success: true, data: position || null };
    } catch (error) {
      console.error('[SQLiteService] Failed to get latest position:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get latest position',
      };
    }
  }

  /**
   * Get all devices with their latest positions for a user
   */
  async getUserDevicesWithPositions(appUserId: string): Promise<DatabaseResult<Array<TraccarDeviceRecord & { latestPosition?: TraccarPositionRecord }>>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const devices = await this.getUserDevices(appUserId);
      if (!devices.success || !devices.data) {
        return devices;
      }

      // Get latest position for each device
      const devicesWithPositions = await Promise.all(
        devices.data.map(async (device) => {
          const positionResult = await this.getLatestPosition(appUserId, device.enteredDeviceId);
          return {
            ...device,
            latestPosition: positionResult.success ? positionResult.data || undefined : undefined,
          };
        })
      );

      console.log(`[SQLiteService] Retrieved ${devicesWithPositions.length} devices with positions for user: ${appUserId}`);
      return { success: true, data: devicesWithPositions };
    } catch (error) {
      console.error('[SQLiteService] Failed to get user devices with positions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user devices with positions',
      };
    }
  }

  /**
   * Delete a device and all its positions
   */
  async deleteDevice(appUserId: string, enteredDeviceId: string): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      // Delete positions first
      await this.db.runAsync(
        'DELETE FROM traccar_positions WHERE app_user_id = ? AND entered_device_id = ?',
        [appUserId, enteredDeviceId]
      );

      // Delete device
      const result = await this.db.runAsync(
        'DELETE FROM traccar_devices WHERE app_user_id = ? AND entered_device_id = ?',
        [appUserId, enteredDeviceId]
      );

      console.log(`[SQLiteService] Deleted device: ${enteredDeviceId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[SQLiteService] Failed to delete device:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete device',
      };
    }
  }

  /**
   * Clear all data for a user
   */
  async clearUserData(appUserId: string): Promise<DatabaseResult<boolean>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      await this.db.runAsync('DELETE FROM traccar_positions WHERE app_user_id = ?', [appUserId]);
      await this.db.runAsync('DELETE FROM traccar_devices WHERE app_user_id = ?', [appUserId]);

      console.log(`[SQLiteService] Cleared all data for user: ${appUserId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error('[SQLiteService] Failed to clear user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear user data',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(appUserId: string): Promise<DatabaseResult<{ deviceCount: number; positionCount: number }>> {
    try {
      if (!this.db) {
        await this.initialize();
        if (!this.db) throw new Error('Database not available');
      }

      const deviceCount = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM traccar_devices WHERE app_user_id = ?',
        [appUserId]
      );

      const positionCount = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM traccar_positions WHERE app_user_id = ?',
        [appUserId]
      );

      return {
        success: true,
        data: {
          deviceCount: deviceCount?.count || 0,
          positionCount: positionCount?.count || 0,
        },
      };
    } catch (error) {
      console.error('[SQLiteService] Failed to get stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      };
    }
  }
}

// Export singleton instance
export const sqliteService = new SQLiteService();
export default sqliteService;
