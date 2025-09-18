import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import simpleTraccarService, { TraccarDevice } from '../services/traccarServiceSimple';
import { useWebSocket } from './WebSocketContext';
import websocketService from '../services/websocketService';

export type DeviceFilter = 'all' | 'online' | 'offline';

interface DeviceContextType {
  devices: TraccarDevice[];
  positions: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefreshTime: string;
  lastFetchTime: number;
  selectedDeviceId: string | null;
  deviceFilter: DeviceFilter;
  isLiveTracking: boolean;
  loadDevices: (forceRefresh?: boolean) => Promise<void>;
  refreshDevices: () => Promise<void>;
  clearCache: () => Promise<void>;
  selectDevice: (deviceId: string | null) => void;
  setDeviceFilter: (filter: DeviceFilter) => void;
  getFilteredDevices: () => TraccarDevice[];
  enableLiveTracking: () => void;
  disableLiveTracking: () => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

const CACHE_KEY = 'cached_devices';
const POSITIONS_CACHE_KEY = 'cached_positions';
const LAST_FETCH_KEY = 'last_fetch_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [devices, setDevices] = useState<TraccarDevice[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<DeviceFilter>('all');
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  
  // WebSocket integration
  const { 
    isConnected, 
    livePositions, 
    deviceStatuses, 
    subscribeToPosition, 
    subscribeToDeviceStatus,
    getLivePosition,
    getDeviceStatus 
  } = useWebSocket();

  // Load cached data on app start
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const [cachedDevices, cachedPositions, cachedFetchTime] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY),
        AsyncStorage.getItem(POSITIONS_CACHE_KEY),
        AsyncStorage.getItem(LAST_FETCH_KEY)
      ]);

      if (cachedDevices) {
        const parsedDevices = JSON.parse(cachedDevices);
        setDevices(parsedDevices);
        console.log('[DeviceContext] Loaded cached devices:', parsedDevices.length);
      }

      if (cachedPositions) {
        const parsedPositions = JSON.parse(cachedPositions);
        setPositions(parsedPositions);
        console.log('[DeviceContext] Loaded cached positions:', parsedPositions.length);
      }

      if (cachedFetchTime) {
        const fetchTime = parseInt(cachedFetchTime);
        setLastFetchTime(fetchTime);
        setLastRefreshTime(new Date(fetchTime).toLocaleString());
        console.log('[DeviceContext] Last fetch time:', new Date(fetchTime).toLocaleString());
      }
    } catch (error) {
      console.error('[DeviceContext] Error loading cached data:', error);
    }
  };

  const saveToCache = async (devicesData: TraccarDevice[], positionsData: any[]) => {
    try {
      const now = Date.now();
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(devicesData)),
        AsyncStorage.setItem(POSITIONS_CACHE_KEY, JSON.stringify(positionsData)),
        AsyncStorage.setItem(LAST_FETCH_KEY, now.toString())
      ]);
      setLastFetchTime(now);
      setLastRefreshTime(new Date(now).toLocaleString());
      console.log('[DeviceContext] Data cached successfully');
    } catch (error) {
      console.error('[DeviceContext] Error saving to cache:', error);
    }
  };

  const isDataStale = (): boolean => {
    const now = Date.now();
    return (now - lastFetchTime) > CACHE_DURATION;
  };

  const loadDevices = async (forceRefresh: boolean = false) => {
    // Don't load if we have recent data and not forcing refresh
    if (!forceRefresh && devices.length > 0 && !isDataStale()) {
      console.log('[DeviceContext] Using cached data, skipping API call');
      return;
    }

    try {
      setIsLoading(true);
      console.log('[DeviceContext] Loading devices from API...');
      
      // Load devices and positions in parallel
      const [devicesResult, positionsResult] = await Promise.all([
        simpleTraccarService.getAllDevices(),
        simpleTraccarService.getLatestPositions()
      ]);

      if (devicesResult.success && positionsResult.success) {
        setDevices(devicesResult.data || []);
        setPositions(positionsResult.data || []);
        await saveToCache(devicesResult.data || [], positionsResult.data || []);
        console.log('[DeviceContext] Devices loaded successfully:', devicesResult.data?.length || 0);
      } else {
        console.error('[DeviceContext] Failed to load devices:', devicesResult.error || positionsResult.error);
      }
    } catch (error) {
      console.error('[DeviceContext] Error loading devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDevices = async () => {
    try {
      setIsRefreshing(true);
      console.log('[DeviceContext] Refreshing devices...');
      await loadDevices(true); // Force refresh
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearCache = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEY),
        AsyncStorage.removeItem(POSITIONS_CACHE_KEY),
        AsyncStorage.removeItem(LAST_FETCH_KEY)
      ]);
      setDevices([]);
      setPositions([]);
      setLastFetchTime(0);
      setLastRefreshTime('');
      console.log('[DeviceContext] Cache cleared');
    } catch (error) {
      console.error('[DeviceContext] Error clearing cache:', error);
    }
  };

  const selectDevice = (deviceId: string | null) => {
    setSelectedDeviceId(deviceId);
    console.log('[DeviceContext] Device selected:', deviceId);
  };

  const getFilteredDevices = (): TraccarDevice[] => {
    if (deviceFilter === 'all') {
      return devices;
    }
    
    return devices.filter(device => {
      const isOnline = device.status.toLowerCase() === 'online';
      return deviceFilter === 'online' ? isOnline : !isOnline;
    });
  };

  const enableLiveTracking = () => {
    setIsLiveTracking(true);
    console.log('[DeviceContext] Live tracking enabled');
  };

  const disableLiveTracking = () => {
    setIsLiveTracking(false);
    console.log('[DeviceContext] Live tracking disabled');
  };

  // Subscribe to live position updates for all devices
  useEffect(() => {
    if (!isLiveTracking || !isConnected) return;

    const unsubscribeFunctions: (() => void)[] = [];

    devices.forEach(device => {
      // Subscribe to position updates
      const unsubscribePosition = subscribeToPosition(device.id.toString(), (position) => {
        console.log(`[DeviceContext] Live position update for device ${device.id}:`, position);
        
        // Update positions array with live data
        setPositions(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(p => p.deviceId === device.id);
          
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              ...position,
              timestamp: position.timestamp,
            };
          } else {
            updated.push({
              deviceId: device.id,
              ...position,
            });
          }
          
          return updated;
        });
      });

      // Subscribe to device status updates
      const unsubscribeStatus = subscribeToDeviceStatus(device.id.toString(), (status) => {
        console.log(`[DeviceContext] Live status update for device ${device.id}:`, status);
        
        // Update device status
        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { ...d, status: status.status, lastUpdate: status.lastUpdate }
            : d
        ));
      });

      unsubscribeFunctions.push(unsubscribePosition, unsubscribeStatus);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [devices, isLiveTracking, isConnected, subscribeToPosition, subscribeToDeviceStatus]);

  // Auto-enable live tracking when WebSocket connects
  useEffect(() => {
    if (isConnected && devices.length > 0) {
      enableLiveTracking();
      
      // Log device IDs for WebSocket tracking
      const deviceIds = devices.map(device => device.id.toString());
      console.log('[DeviceContext] Devices available for WebSocket tracking:', deviceIds);
    }
  }, [isConnected, devices.length, devices]);

  const value: DeviceContextType = {
    devices,
    positions,
    isLoading,
    isRefreshing,
    lastRefreshTime,
    lastFetchTime,
    selectedDeviceId,
    deviceFilter,
    isLiveTracking,
    loadDevices,
    refreshDevices,
    clearCache,
    selectDevice,
    setDeviceFilter,
    getFilteredDevices,
    enableLiveTracking,
    disableLiveTracking,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevices = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
};
