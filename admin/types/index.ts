// Admin Types
export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  profileImageUrl?: string;
  phoneNumber?: string;
  customClaims?: {
    role?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  };
}

export interface AdminDevice {
  id: string;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  lastUpdate: Date;
  position?: {
    latitude: number;
    longitude: number;
    speed: number;
    course: number;
    address?: string;
  };
  owner: {
    uid: string;
    email: string;
    displayName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  newUsersToday: number;
  newDevicesToday: number;
}

export interface AdminNavigationItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  badge?: number;
  isActive?: boolean;
}

export interface AdminTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  header: string;
  headerText: string;
  card: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  drawer: string;
  drawerText: string;
  button: string;
  buttonText: string;
  input: string;
  inputBorder: string;
  borderLight: string;
}

export interface AdminDrawerState {
  isOpen: boolean;
  animation: any;
}

export interface AdminContextType {
  currentUser: AdminUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  theme: AdminTheme;
  drawerState: AdminDrawerState;
  stats: AdminStats | null;
  users: AdminUser[];
  devices: AdminDevice[];
  isLoading: boolean;
  error: string | null;
  // Actions
  toggleDrawer: () => void;
  closeDrawer: () => void;
  refreshStats: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshDevices: () => Promise<void>;
  updateUserRole: (uid: string, role: string) => Promise<boolean>;
  deleteUser: (uid: string) => Promise<boolean>;
  updateDevice: (deviceId: string, updates: Partial<AdminDevice>) => Promise<boolean>;
  deleteDevice: (deviceId: string) => Promise<boolean>;
}
