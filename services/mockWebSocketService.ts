import { PositionUpdate, DeviceStatusUpdate } from '../config/websocketConfig';

// Mock WebSocket service for testing live updates
class MockWebSocketService {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected = false;
  private mockInterval: NodeJS.Timeout | null = null;
  private deviceIds: string[] = [];

  // Mock device data
  private mockDevices = [
    { id: '1', name: 'Device 1', status: 'online' as const },
    { id: '2', name: 'Device 2', status: 'offline' as const },
    { id: '3', name: 'Device 3', status: 'online' as const },
  ];

  // Mock position data
  private generateMockPosition(deviceId: string): PositionUpdate {
    const device = this.mockDevices.find(d => d.id === deviceId);
    const isOnline = device?.status === 'online';
    
    return {
      deviceId,
      latitude: isOnline ? 28.6139 + (Math.random() - 0.5) * 0.01 : 0, // Delhi area with small random offset
      longitude: isOnline ? 77.2090 + (Math.random() - 0.5) * 0.01 : 0,
      speed: isOnline ? Math.random() * 60 : 0, // 0-60 km/h
      course: isOnline ? Math.random() * 360 : 0,
      altitude: isOnline ? 200 + Math.random() * 50 : 0,
      accuracy: isOnline ? 5 + Math.random() * 10 : 0,
      timestamp: new Date().toISOString(),
      batteryLevel: isOnline ? Math.floor(20 + Math.random() * 80) : 0, // 20-100%
      address: isOnline ? 'Delhi, India' : 'Unknown',
    };
  }

  // Mock device status update
  private generateMockStatus(deviceId: string): DeviceStatusUpdate {
    const device = this.mockDevices.find(d => d.id === deviceId);
    const isOnline = device?.status === 'online';
    
    return {
      deviceId,
      status: isOnline ? 'online' : 'offline',
      lastUpdate: new Date().toISOString(),
      batteryLevel: isOnline ? Math.floor(20 + Math.random() * 80) : 0,
    };
  }

  // Connect to mock WebSocket
  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log('[MockWebSocket] Connecting to mock server...');
      
      setTimeout(() => {
        this.isConnected = true;
        this.emit('connected', { timestamp: Date.now() });
        console.log('[MockWebSocket] Connected successfully');
        resolve();
      }, 1000);
    });
  }

  // Disconnect from mock WebSocket
  disconnect(): void {
    console.log('[MockWebSocket] Disconnecting...');
    this.isConnected = false;
    this.stopMockUpdates();
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' });
  }

  // Send message (mock implementation)
  send(message: any): void {
    console.log('[MockWebSocket] Sending message:', message);
  }

  // Subscribe to message types
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(callback);
    
    // Start mock updates if this is the first subscription
    if (this.isConnected && !this.mockInterval) {
      this.startMockUpdates();
    }
    
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
  isConnectedStatus(): boolean {
    return this.isConnected;
  }

  // Get connection state
  getConnectionState(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  // Start mock data updates
  private startMockUpdates(): void {
    console.log('[MockWebSocket] Starting mock data updates...');
    
    this.mockInterval = setInterval(() => {
      if (!this.isConnected) return;

      // Update device statuses randomly
      this.mockDevices.forEach(device => {
        // 10% chance to change status
        if (Math.random() < 0.1) {
          device.status = device.status === 'online' ? 'offline' : 'online';
          
          const statusUpdate = this.generateMockStatus(device.id);
          this.emit('device', statusUpdate);
          console.log(`[MockWebSocket] Device ${device.id} status changed to ${device.status}`);
        }
      });

      // Send position updates for online devices
      this.mockDevices
        .filter(device => device.status === 'online')
        .forEach(device => {
          const positionUpdate = this.generateMockPosition(device.id);
          this.emit('position', positionUpdate);
          console.log(`[MockWebSocket] Position update for device ${device.id}:`, {
            lat: positionUpdate.latitude.toFixed(6),
            lng: positionUpdate.longitude.toFixed(6),
            speed: positionUpdate.speed.toFixed(1),
            battery: positionUpdate.batteryLevel
          });
        });
    }, 5000); // Update every 5 seconds
  }

  // Stop mock data updates
  private stopMockUpdates(): void {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
      console.log('[MockWebSocket] Stopped mock data updates');
    }
  }

  // Emit events to listeners
  private emit(type: string, data: any): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[MockWebSocket] Error in listener:', error);
        }
      });
    }
  }

  // Set device IDs to track (called from DeviceContext)
  setDeviceIds(deviceIds: string[]): void {
    this.deviceIds = deviceIds;
    console.log('[MockWebSocket] Tracking devices:', deviceIds);
  }
}

// Create singleton instance
const mockWebSocketService = new MockWebSocketService();

export default mockWebSocketService;
