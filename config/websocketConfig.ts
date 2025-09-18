// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  // Traccar WebSocket URL - Using your Traccar server
  url: 'wss://demo.traccar.org:8082',
  
  // Connection settings
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 10,
  pingInterval: 30000, // 30 seconds
  
  // Message types
  messageTypes: {
    POSITION: 'position',
    DEVICE: 'device',
    EVENT: 'event',
    PING: 'ping',
    PONG: 'pong',
  },
  
  // Connection states
  connectionStates: {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CLOSING: 'closing',
    CLOSED: 'closed',
    ERROR: 'error',
    FAILED: 'failed',
  },
};

// Environment-specific configurations
export const getWebSocketConfig = () => {
  // You can modify this based on your environment
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    return {
      ...WEBSOCKET_CONFIG,
      url: 'wss://demo.traccar.org:8082', // Use your Traccar server
      reconnectInterval: 2000, // Faster reconnection in dev
    };
  }
  
  return WEBSOCKET_CONFIG;
};

// WebSocket message schemas
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PositionUpdate {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  altitude: number;
  accuracy: number;
  timestamp: string;
  batteryLevel?: number;
  address?: string;
}

export interface DeviceStatusUpdate {
  deviceId: string;
  status: 'online' | 'offline';
  lastUpdate: string;
  batteryLevel?: number;
}

export interface EventUpdate {
  deviceId: string;
  eventType: string;
  timestamp: string;
  data?: any;
}
