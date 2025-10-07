import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'device' | 'system' | 'alert' | 'update';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string for persistence
  type: NotificationType;
  isRead: boolean;
  deviceName?: string;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const STORAGE_KEY = 'app_notifications_v1';

const seedMockNotifications = (): AppNotification[] => [
  {
    id: '1',
    title: 'Device Connected',
    message: 'GPS Tracker #001 has come online',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    type: 'device',
    isRead: false,
    deviceName: 'GPS Tracker #001',
  },
  {
    id: '2',
    title: 'Low Battery Alert',
    message: 'GPS Tracker #002 battery is below 20%',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: 'alert',
    isRead: false,
    deviceName: 'GPS Tracker #002',
  },
  {
    id: '3',
    title: 'Geofence Alert',
    message: 'GPS Tracker #003 has left the designated area',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'alert',
    isRead: true,
    deviceName: 'GPS Tracker #003',
  },
  {
    id: '4',
    title: 'System Update',
    message: 'App has been updated to version 2.1.0',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'update',
    isRead: true,
  },
  {
    id: '5',
    title: 'Device Disconnected',
    message: 'GPS Tracker #004 has gone offline',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'device',
    isRead: true,
    deviceName: 'GPS Tracker #004',
  },
];

async function loadFromStorage(): Promise<AppNotification[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AppNotification[];
    return null;
  } catch {
    return null;
  }
}

async function saveToStorage(notifications: AppNotification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
    [notifications]
  );

  const refreshNotifications = async () => {
    // Placeholder for fetching from backend/WebSocket; currently load from storage or seed
    const stored = await loadFromStorage();
    if (stored && stored.length) {
      setNotifications(stored);
    } else {
      const seeded = seedMockNotifications();
      setNotifications(seeded);
      await saveToStorage(seeded);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const value = useMemo(
    () => ({ notifications, unreadCount, setNotifications, markAsRead, markAllAsRead, refreshNotifications }),
    [notifications, unreadCount]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return ctx;
}


