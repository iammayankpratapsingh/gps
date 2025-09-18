import { Platform } from 'react-native';
import { Base64 } from 'react-native-base64';

// Traccar API Configuration
const TRACCAR_CONFIG = {
  baseUrl: 'https://demo.traccar.org',
  username: 'mayankpratapsingh07122020@gmail.com',
  password: 'Mayank@123',
};

// Types for Traccar API responses (matching actual server response)
export interface TraccarDevice {
  id: number;
  attributes: Record<string, any>;
  groupId: number;
  calendarId: number;
  name: string;
  uniqueId: string;
  status: string;
  lastUpdate: string;
  positionId: number;
  phone: string | null;
  model: string | null;
  contact: string | null;
  category: string | null;
  disabled: boolean;
  expirationTime: string | null;
}

export interface TraccarPosition {
  id: number;
  attributes: {
    motion?: boolean;
    odometer?: number;
    activity?: string;
    batteryLevel?: number;
    charge?: boolean;
    distance?: number;
    totalDistance?: number;
    [key: string]: any;
  };
  deviceId: number;
  protocol: string;
  serverTime: string;
  deviceTime: string;
  fixTime: string;
  outdated: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address: string | null;
  accuracy: number;
  network: any;
  geofenceIds: any;
}

export interface TraccarApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class TraccarService {
  private baseUrl: string;
  private credentials: string;

  constructor() {
    console.log('[TraccarService] Initializing Traccar service...');
    this.baseUrl = TRACCAR_CONFIG.baseUrl;
    
    try {
      const credentialsString = `${TRACCAR_CONFIG.username}:${TRACCAR_CONFIG.password}`;
      console.log('[TraccarService] Encoding credentials for:', TRACCAR_CONFIG.username);
      this.credentials = Base64.encode(credentialsString);
      console.log('[TraccarService] Credentials encoded successfully');
    } catch (error) {
      console.error('[TraccarService] Failed to encode credentials:', error);
      throw new Error(`Failed to initialize Traccar service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated API request to Traccar
   */
  private async makeRequest<T>(endpoint: string): Promise<TraccarApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      console.log(`[TraccarService] Making request to: ${url}`);
      console.log(`[TraccarService] Using credentials: ${this.credentials.substring(0, 20)}...`);

      // Create timeout controller for better compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[TraccarService] Response status: ${response.status}`);
      console.log(`[TraccarService] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TraccarService] API Error: ${response.status} - ${errorText}`);
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      console.log(`[TraccarService] Successfully fetched data:`, data);

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('[TraccarService] Request failed:', error);
      console.error('[TraccarService] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all devices from Traccar
   */
  async getAllDevices(): Promise<TraccarApiResponse<TraccarDevice[]>> {
    console.log('[TraccarService] Fetching all devices...');
    return this.makeRequest<TraccarDevice[]>('/api/devices');
  }

  /**
   * Find device by unique ID (IMEI)
   */
  async findDeviceByUniqueId(uniqueId: string): Promise<TraccarApiResponse<TraccarDevice | null>> {
    console.log(`[TraccarService] Finding device with uniqueId: ${uniqueId}`);
    
    const response = await this.getAllDevices();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to fetch devices',
      };
    }

    const device = response.data.find(d => d.uniqueId === uniqueId);
    
    if (!device) {
      console.log(`[TraccarService] Device not found with uniqueId: ${uniqueId}`);
      return {
        success: true,
        data: null,
      };
    }

    console.log(`[TraccarService] Found device:`, device);
    return {
      success: true,
      data: device,
    };
  }

  /**
   * Get latest positions for all devices
   */
  async getLatestPositions(): Promise<TraccarApiResponse<TraccarPosition[]>> {
    console.log('[TraccarService] Fetching latest positions...');
    return this.makeRequest<TraccarPosition[]>('/api/positions');
  }

  /**
   * Get latest position for a specific device
   */
  async getDevicePosition(deviceId: number): Promise<TraccarApiResponse<TraccarPosition | null>> {
    console.log(`[TraccarService] Fetching position for deviceId: ${deviceId}`);
    
    const response = await this.getLatestPositions();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to fetch positions',
      };
    }

    const position = response.data.find(p => p.deviceId === deviceId);
    
    if (!position) {
      console.log(`[TraccarService] Position not found for deviceId: ${deviceId}`);
      return {
        success: true,
        data: null,
      };
    }

    console.log(`[TraccarService] Found position:`, position);
    return {
      success: true,
      data: position,
    };
  }

  /**
   * Get device with its latest position
   */
  async getDeviceWithPosition(uniqueId: string): Promise<TraccarApiResponse<{
    device: TraccarDevice;
    position: TraccarPosition | null;
  } | null>> {
    console.log(`[TraccarService] Getting device with position for uniqueId: ${uniqueId}`);
    
    // First find the device
    const deviceResponse = await this.findDeviceByUniqueId(uniqueId);
    if (!deviceResponse.success) {
      return {
        success: false,
        error: deviceResponse.error,
      };
    }

    if (!deviceResponse.data) {
      return {
        success: true,
        data: null,
      };
    }

    // Then get its position
    const positionResponse = await this.getDevicePosition(deviceResponse.data.id);
    if (!positionResponse.success) {
      return {
        success: false,
        error: positionResponse.error,
      };
    }

    return {
      success: true,
      data: {
        device: deviceResponse.data,
        position: positionResponse.data,
      },
    };
  }

  /**
   * Test connection to Traccar server
   */
  async testConnection(): Promise<TraccarApiResponse<boolean>> {
    console.log('[TraccarService] Testing connection...');
    
    const response = await this.getAllDevices();
    return {
      success: response.success,
      data: response.success,
      error: response.error,
    };
  }
}

// Export singleton instance
export const traccarService = new TraccarService();
export default traccarService;
