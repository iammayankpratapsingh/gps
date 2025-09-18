import { TraccarDevice } from './traccarServiceSimple';
import { getWebSocketConfig, WebSocketMessage, PositionUpdate, DeviceStatusUpdate } from '../config/websocketConfig';

// Traccar credentials for WebSocket authentication
const TRACCAR_CREDENTIALS = {
  username: 'mayankpratapsingh07122020@gmail.com',
  password: 'Mayank@123',
};

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  pingInterval: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  // Connect to WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      console.log('[WebSocket] Connecting to Traccar server...');
      console.log('[WebSocket] Server URL:', this.config.url);
      console.log('[WebSocket] Username:', TRACCAR_CREDENTIALS.username);

      try {
        // Create WebSocket URL - Traccar uses basic auth in URL
        const authUrl = `${this.config.url.replace('wss://', `wss://${TRACCAR_CREDENTIALS.username}:${TRACCAR_CREDENTIALS.password}@`)}`;
        this.ws = new WebSocket(authUrl);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected successfully to Traccar server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPing();
          this.emit('connected', { timestamp: Date.now() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.stopPing();
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // Handle different close codes
          if (event.code === 1006) {
            console.log('[WebSocket] Connection lost - will attempt to reconnect');
          } else if (event.code === 1002) {
            console.log('[WebSocket] Protocol error - check authentication');
          } else if (event.code === 1003) {
            console.log('[WebSocket] Unsupported data - check message format');
          }
          
          if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Connection error:', error);
          console.error('[WebSocket] Error details:', {
            url: this.config.url,
            readyState: this.ws?.readyState,
            credentials: `${TRACCAR_CREDENTIALS.username}:***`
          });
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    this.stopPing();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  // Send message to server
  send(message: Partial<WebSocketMessage>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: message.type || 'ping',
        data: message.data || {},
        timestamp: Date.now(),
      };
      
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  // Subscribe to specific message types
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  // Get connection status
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }


  // Private methods
  private handleMessage(message: any): void {
    console.log('[WebSocket] Received Traccar message:', message);
    
    // Traccar WebSocket sends different message types
    if (message.type === 'position') {
      // Convert Traccar position format to our format
      const positionUpdate: PositionUpdate = {
        deviceId: message.deviceId?.toString() || message.id?.toString(),
        latitude: message.latitude || 0,
        longitude: message.longitude || 0,
        speed: message.speed || 0,
        course: message.course || 0,
        altitude: message.altitude || 0,
        accuracy: message.accuracy || 0,
        timestamp: message.fixTime || message.serverTime || new Date().toISOString(),
        batteryLevel: message.attributes?.batteryLevel || message.batteryLevel,
        address: message.address,
      };
      console.log('[WebSocket] Emitting position update:', positionUpdate);
      this.emit('position', positionUpdate);
    } else if (message.type === 'device') {
      // Convert Traccar device format to our format
      const deviceStatusUpdate: DeviceStatusUpdate = {
        deviceId: message.id?.toString(),
        status: message.status === 'online' ? 'online' : 'offline',
        lastUpdate: message.lastUpdate || new Date().toISOString(),
        batteryLevel: message.attributes?.batteryLevel || message.batteryLevel,
      };
      console.log('[WebSocket] Emitting device status update:', deviceStatusUpdate);
      this.emit('device', deviceStatusUpdate);
    } else if (message.type === 'event') {
      console.log('[WebSocket] Emitting event:', message);
      this.emit('event', message);
    } else if (message.type === 'pong') {
      this.emit('pong', message);
    } else {
      console.log('[WebSocket] Unknown Traccar message type:', message.type, message);
    }
  }

  private emit(type: string, data: any): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[WebSocket] Error in listener:', error);
        }
      });
    }
  }

  private startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, this.config.pingInterval);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached', { attempts: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[WebSocket] Reconnection failed:', error);
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService(getWebSocketConfig());

export default websocketService;
