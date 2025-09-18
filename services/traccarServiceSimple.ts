// Simplified Traccar service without external dependencies
import { Platform } from 'react-native';

// Simple base64 encoding for React Native
const simpleBase64Encode = (str: string): string => {
  if (Platform.OS === 'web') {
    return btoa(str);
  }
  
  // Simple base64 implementation for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    
    const bitmap = (a << 16) | (b << 8) | c;
    
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  
  return result;
};

// Traccar API Configuration
const TRACCAR_CONFIG = {
  baseUrl: 'https://demo.traccar.org',
  username: 'mayankpratapsingh07122020@gmail.com',
  password: 'Mayank@123',
};

// Types for Traccar API responses
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

class SimpleTraccarService {
  private baseUrl: string;
  private credentials: string;

  constructor() {
    console.log('[SimpleTraccarService] Initializing...');
    this.baseUrl = TRACCAR_CONFIG.baseUrl;
    
    try {
      const credentialsString = `${TRACCAR_CONFIG.username}:${TRACCAR_CONFIG.password}`;
      this.credentials = simpleBase64Encode(credentialsString);
      console.log('[SimpleTraccarService] Initialized successfully');
    } catch (error) {
      console.error('[SimpleTraccarService] Initialization failed:', error);
      throw new Error(`Failed to initialize Traccar service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make authenticated API request to Traccar
   */
  private async makeRequest<T>(endpoint: string): Promise<TraccarApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`[SimpleTraccarService] Making request to: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`[SimpleTraccarService] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SimpleTraccarService] API Error: ${response.status} - ${errorText}`);
        return {
          success: false,
          error: `API Error: ${response.status} - ${errorText}`,
        };
      }

      const data = await response.json();
      console.log(`[SimpleTraccarService] Successfully fetched data`);

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('[SimpleTraccarService] Request failed:', error);
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
    console.log('[SimpleTraccarService] Fetching all devices...');
    return this.makeRequest<TraccarDevice[]>('/api/devices');
  }

  /**
   * Find device by unique ID (IMEI)
   */
  async findDeviceByUniqueId(uniqueId: string): Promise<TraccarApiResponse<TraccarDevice | null>> {
    console.log(`[SimpleTraccarService] Finding device with uniqueId: ${uniqueId}`);
    
    const response = await this.getAllDevices();
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to fetch devices',
      };
    }

    const device = response.data.find(d => d.uniqueId === uniqueId);
    
    if (!device) {
      console.log(`[SimpleTraccarService] Device not found with uniqueId: ${uniqueId}`);
      return {
        success: true,
        data: null,
      };
    }

    console.log(`[SimpleTraccarService] Found device:`, device);
    return {
      success: true,
      data: device,
    };
  }

  /**
   * Get latest positions for all devices
   */
  async getLatestPositions(): Promise<TraccarApiResponse<TraccarPosition[]>> {
    console.log('[SimpleTraccarService] Fetching latest positions...');
    return this.makeRequest<TraccarPosition[]>('/api/positions');
  }

  /**
   * Test connection to Traccar server
   */
  async testConnection(): Promise<TraccarApiResponse<boolean>> {
    console.log('[SimpleTraccarService] Testing connection...');
    
    const response = await this.getAllDevices();
    return {
      success: response.success,
      data: response.success,
      error: response.error,
    };
  }
}

// Export singleton instance
export const simpleTraccarService = new SimpleTraccarService();
export default simpleTraccarService;
