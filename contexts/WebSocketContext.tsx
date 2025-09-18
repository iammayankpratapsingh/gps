import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import websocketService, { PositionUpdate, DeviceStatusUpdate } from '../services/websocketService';
import { TraccarDevice } from '../services/traccarServiceSimple';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  livePositions: Map<string, PositionUpdate>;
  deviceStatuses: Map<string, DeviceStatusUpdate>;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToPosition: (deviceId: string, callback: (position: PositionUpdate) => void) => () => void;
  subscribeToDeviceStatus: (deviceId: string, callback: (status: DeviceStatusUpdate) => void) => () => void;
  getLivePosition: (deviceId: string) => PositionUpdate | null;
  getDeviceStatus: (deviceId: string) => DeviceStatusUpdate | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [livePositions, setLivePositions] = useState<Map<string, PositionUpdate>>(new Map());
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceStatusUpdate>>(new Map());

  // Connect to WebSocket on mount
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await websocketService.connect();
      } catch (error) {
        console.error('[WebSocketContext] Failed to connect:', error);
      }
    };

    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeConnected = websocketService.subscribe('connected', () => {
      setIsConnected(true);
      setConnectionState('connected');
      console.log('[WebSocketContext] Connected to live tracking');
    });

    const unsubscribeDisconnected = websocketService.subscribe('disconnected', () => {
      setIsConnected(false);
      setConnectionState('disconnected');
      console.log('[WebSocketContext] Disconnected from live tracking');
    });

    const unsubscribePosition = websocketService.subscribe('position', (data: PositionUpdate) => {
      console.log('[WebSocketContext] Position update received:', data.deviceId);
      setLivePositions(prev => {
        const newMap = new Map(prev);
        newMap.set(data.deviceId, data);
        return newMap;
      });
    });

    const unsubscribeDevice = websocketService.subscribe('device', (data: DeviceStatusUpdate) => {
      console.log('[WebSocketContext] Device status update received:', data.deviceId);
      setDeviceStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(data.deviceId, data);
        return newMap;
      });
    });

    const unsubscribeError = websocketService.subscribe('error', (error) => {
      console.error('[WebSocketContext] WebSocket error:', error);
      setConnectionState('error');
    });

    const unsubscribeMaxAttempts = websocketService.subscribe('maxReconnectAttemptsReached', () => {
      console.error('[WebSocketContext] Max reconnection attempts reached');
      setConnectionState('failed');
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribePosition();
      unsubscribeDevice();
      unsubscribeError();
      unsubscribeMaxAttempts();
    };
  }, []);

  const connect = async (): Promise<void> => {
    try {
      setConnectionState('connecting');
      await websocketService.connect();
    } catch (error) {
      console.error('[WebSocketContext] Connection failed:', error);
      setConnectionState('error');
      throw error;
    }
  };

  const disconnect = (): void => {
    websocketService.disconnect();
  };

  const subscribeToPosition = (deviceId: string, callback: (position: PositionUpdate) => void): (() => void) => {
    return websocketService.subscribe('position', (data: PositionUpdate) => {
      if (data.deviceId === deviceId) {
        callback(data);
      }
    });
  };

  const subscribeToDeviceStatus = (deviceId: string, callback: (status: DeviceStatusUpdate) => void): (() => void) => {
    return websocketService.subscribe('device', (data: DeviceStatusUpdate) => {
      if (data.deviceId === deviceId) {
        callback(data);
      }
    });
  };

  const getLivePosition = (deviceId: string): PositionUpdate | null => {
    return livePositions.get(deviceId) || null;
  };

  const getDeviceStatus = (deviceId: string): DeviceStatusUpdate | null => {
    return deviceStatuses.get(deviceId) || null;
  };

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    livePositions,
    deviceStatuses,
    connect,
    disconnect,
    subscribeToPosition,
    subscribeToDeviceStatus,
    getLivePosition,
    getDeviceStatus,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
