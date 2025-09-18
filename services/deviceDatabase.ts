import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeviceLocation {
  timestamp: string;
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number;
    heading: number;
    altitude: number;
  };
  is_moving: boolean;
  odometer: number;
  battery: {
    level: number;
    is_charging: boolean;
  };
  activity: {
    type: string;
  };
  extras: any;
  manual: boolean;
}

export interface Device {
  id: string;
  device_id: string;
  name: string;
  sim_number: string;
  object_type: string;
  time_zone: string;
  location: DeviceLocation;
  isOnline: boolean;
  lastSeen: string;
  address: string;
  parameters: string;
  battery: number;
}

// Mock device database
const MOCK_DEVICES: { [key: string]: Device } = {
  "device001": {
    id: "device001",
    device_id: "71886210",
    name: "Delivery Truck #1",
    sim_number: "9876543210",
    object_type: "Commercial Vehicle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:01:38.996Z",
      coords: {
        latitude: 28.6063196,
        longitude: 77.4300792,
        accuracy: 17.42,
        speed: 0.74,
        heading: 11.59,
        altitude: 210.7
      },
      is_moving: true,
      odometer: 0,
      battery: { level: 0.88, is_charging: true },
      activity: { type: "still" },
      extras: {},
      manual: true
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:01:38.996Z",
    address: "New Delhi, India",
    parameters: "Speed: 0.74 km/h, Heading: 11.59°",
    battery: 88
  },
  "device002": {
    id: "device002",
    device_id: "71886211",
    name: "Personal Car #2",
    sim_number: "9876543211",
    object_type: "Four Wheeler",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:05:12.100Z",
      coords: {
        latitude: 28.7041,
        longitude: 77.1025,
        accuracy: 15.5,
        speed: 12.4,
        heading: 45.0,
        altitude: 215.2
      },
      is_moving: true,
      odometer: 102,
      battery: { level: 0.75, is_charging: false },
      activity: { type: "walking" },
      extras: {},
      manual: false
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:05:12.100Z",
    address: "Delhi, India",
    parameters: "Speed: 12.4 km/h, Heading: 45.0°",
    battery: 75
  },
  "device003": {
    id: "device003",
    device_id: "71886212",
    name: "Motorcycle #3",
    sim_number: "9876543212",
    object_type: "Two Wheeler",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:07:30.500Z",
      coords: {
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: 12.1,
        speed: 0.0,
        heading: 0.0,
        altitude: 18.4
      },
      is_moving: false,
      odometer: 300,
      battery: { level: 0.64, is_charging: true },
      activity: { type: "still" },
      extras: {},
      manual: true
    },
    isOnline: false,
    lastSeen: "2025-09-12T10:30:00.000Z",
    address: "Mumbai, India",
    parameters: "Speed: 0.0 km/h, Stationary",
    battery: 64
  },
  "device004": {
    id: "device004",
    device_id: "71886213",
    name: "Fleet Vehicle #4",
    sim_number: "9876543213",
    object_type: "Heavy Vehicle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:10:01.220Z",
      coords: {
        latitude: 13.0827,
        longitude: 80.2707,
        accuracy: 19.8,
        speed: 8.1,
        heading: 120.5,
        altitude: 67.0
      },
      is_moving: true,
      odometer: 550,
      battery: { level: 0.91, is_charging: false },
      activity: { type: "running" },
      extras: {},
      manual: false
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:10:01.220Z",
    address: "Chennai, India",
    parameters: "Speed: 8.1 km/h, Heading: 120.5°",
    battery: 91
  },
  "device005": {
    id: "device005",
    device_id: "71886214",
    name: "Service Van #5",
    sim_number: "9876543214",
    object_type: "Commercial Vehicle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:15:43.900Z",
      coords: {
        latitude: 12.9716,
        longitude: 77.5946,
        accuracy: 16.0,
        speed: 0.0,
        heading: 0.0,
        altitude: 900.5
      },
      is_moving: false,
      odometer: 1100,
      battery: { level: 0.55, is_charging: true },
      activity: { type: "still" },
      extras: {},
      manual: true
    },
    isOnline: false,
    lastSeen: "2025-09-12T10:45:00.000Z",
    address: "Bangalore, India",
    parameters: "Speed: 0.0 km/h, Stationary",
    battery: 55
  },
  "device006": {
    id: "device006",
    device_id: "71886215",
    name: "Bicycle Tracker #6",
    sim_number: "9876543215",
    object_type: "Bicycle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:20:20.010Z",
      coords: {
        latitude: 26.9124,
        longitude: 75.7873,
        accuracy: 14.2,
        speed: 5.6,
        heading: 89.0,
        altitude: 430.2
      },
      is_moving: true,
      odometer: 150,
      battery: { level: 0.66, is_charging: false },
      activity: { type: "cycling" },
      extras: {},
      manual: false
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:20:20.010Z",
    address: "Jaipur, India",
    parameters: "Speed: 5.6 km/h, Heading: 89.0°",
    battery: 66
  },
  "device007": {
    id: "device007",
    device_id: "71886216",
    name: "Pet Tracker #7",
    sim_number: "9876543216",
    object_type: "Dog",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:25:55.440Z",
      coords: {
        latitude: 22.5726,
        longitude: 88.3639,
        accuracy: 18.7,
        speed: 0.0,
        heading: 0.0,
        altitude: 9.0
      },
      is_moving: false,
      odometer: 210,
      battery: { level: 0.42, is_charging: true },
      activity: { type: "still" },
      extras: {},
      manual: true
    },
    isOnline: false,
    lastSeen: "2025-09-12T10:15:00.000Z",
    address: "Kolkata, India",
    parameters: "Speed: 0.0 km/h, Stationary",
    battery: 42
  },
  "device008": {
    id: "device008",
    device_id: "71886217",
    name: "Fleet Truck #8",
    sim_number: "9876543217",
    object_type: "Heavy Vehicle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:30:12.789Z",
      coords: {
        latitude: 23.0225,
        longitude: 72.5714,
        accuracy: 20.0,
        speed: 15.5,
        heading: 200.0,
        altitude: 53.2
      },
      is_moving: true,
      odometer: 780,
      battery: { level: 0.39, is_charging: false },
      activity: { type: "driving" },
      extras: {},
      manual: false
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:30:12.789Z",
    address: "Ahmedabad, India",
    parameters: "Speed: 15.5 km/h, Heading: 200.0°",
    battery: 39
  },
  "device009": {
    id: "device009",
    device_id: "71886218",
    name: "Personal Bike #9",
    sim_number: "9876543218",
    object_type: "Motorcycle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:35:42.333Z",
      coords: {
        latitude: 17.3850,
        longitude: 78.4867,
        accuracy: 13.5,
        speed: 0.0,
        heading: 0.0,
        altitude: 505.5
      },
      is_moving: false,
      odometer: 350,
      battery: { level: 0.81, is_charging: true },
      activity: { type: "still" },
      extras: {},
      manual: true
    },
    isOnline: false,
    lastSeen: "2025-09-12T10:20:00.000Z",
    address: "Hyderabad, India",
    parameters: "Speed: 0.0 km/h, Stationary",
    battery: 81
  },
  "device010": {
    id: "device010",
    device_id: "71886219",
    name: "Fleet Car #10",
    sim_number: "9876543219",
    object_type: "Personal Vehicle",
    time_zone: "(GMT+05:30) India Standard Time",
    location: {
      timestamp: "2025-09-12T11:40:25.000Z",
      coords: {
        latitude: 15.3173,
        longitude: 75.7139,
        accuracy: 17.0,
        speed: 9.5,
        heading: 270.0,
        altitude: 650.0
      },
      is_moving: true,
      odometer: 920,
      battery: { level: 0.72, is_charging: false },
      activity: { type: "walking" },
      extras: {},
      manual: false
    },
    isOnline: true,
    lastSeen: "2025-09-12T11:40:25.000Z",
    address: "Hubli, India",
    parameters: "Speed: 9.5 km/h, Heading: 270.0°",
    battery: 72
  }
};

const DEVICE_DB_KEY = 'device_database';
const USER_DEVICES_KEY = 'user_devices';

class DeviceDatabase {
  private devices: { [key: string]: Device } = {};
  private userDevices: string[] = [];

  async initialize(): Promise<void> {
    try {
      // Load user's registered devices
      const storedUserDevices = await AsyncStorage.getItem(USER_DEVICES_KEY);
      if (storedUserDevices) {
        this.userDevices = JSON.parse(storedUserDevices);
      }

      // Initialize with mock devices
      this.devices = { ...MOCK_DEVICES };
    } catch (error) {
      console.error('Error initializing device database:', error);
    }
  }

  // Get all available devices in the database
  getAllDevices(): Device[] {
    return Object.values(this.devices);
  }

  // Get user's registered devices
  getUserDevices(): Device[] {
    return this.userDevices.map(deviceId => this.devices[deviceId]).filter(Boolean);
  }

  // Check if device exists in database
  isDeviceRegistered(deviceId: string): boolean {
    return Object.values(this.devices).some(device => device.device_id === deviceId);
  }

  // Get device by ID
  getDeviceById(deviceId: string): Device | null {
    return Object.values(this.devices).find(device => device.device_id === deviceId) || null;
  }

  // Add device to user's collection
  async addUserDevice(deviceId: string, deviceData: {
    name: string;
    sim_number: string;
    object_type: string;
    time_zone: string;
  }): Promise<boolean> {
    try {
      if (!this.isDeviceRegistered(deviceId)) {
        return false; // Device not found in database
      }

      const device = this.getDeviceById(deviceId);
      if (!device) {
        return false;
      }

      // Update device with user data
      device.name = deviceData.name;
      device.sim_number = deviceData.sim_number;
      device.object_type = deviceData.object_type;
      device.time_zone = deviceData.time_zone;

      // Add to user's devices if not already added
      if (!this.userDevices.includes(device.id)) {
        this.userDevices.push(device.id);
        await AsyncStorage.setItem(USER_DEVICES_KEY, JSON.stringify(this.userDevices));
      }

      return true;
    } catch (error) {
      console.error('Error adding user device:', error);
      return false;
    }
  }

  // Remove device from user's collection
  async removeUserDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.getDeviceById(deviceId);
      if (!device) {
        return false;
      }

      this.userDevices = this.userDevices.filter(id => id !== device.id);
      await AsyncStorage.setItem(USER_DEVICES_KEY, JSON.stringify(this.userDevices));
      return true;
    } catch (error) {
      console.error('Error removing user device:', error);
      return false;
    }
  }

  // Get device statistics
  getDeviceStats(): { total: number; online: number; offline: number } {
    const userDevices = this.getUserDevices();
    const total = userDevices.length;
    const online = userDevices.filter(device => device.isOnline).length;
    const offline = total - online;

    return { total, online, offline };
  }

  // Update device location (simulate real-time updates)
  updateDeviceLocation(deviceId: string, location: DeviceLocation): void {
    const device = this.getDeviceById(deviceId);
    if (device) {
      device.location = location;
      device.lastSeen = location.timestamp;
      device.isOnline = true;
      device.battery = Math.round(location.battery.level * 100);
      device.parameters = `Speed: ${location.coords.speed.toFixed(1)} km/h, Heading: ${location.coords.heading.toFixed(1)}°`;
    }
  }

  // Simulate device going offline
  setDeviceOffline(deviceId: string): void {
    const device = this.getDeviceById(deviceId);
    if (device) {
      device.isOnline = false;
      device.lastSeen = new Date().toISOString();
    }
  }
}

export default new DeviceDatabase();
