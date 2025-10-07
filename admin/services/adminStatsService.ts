import { realtimeDb } from '../../config/firebaseConfig';
import { 
  ref,
  get,
  query,
  orderByChild,
  orderByKey,
  limitToLast
} from 'firebase/database';
import { AdminStats } from '../types';

class AdminStatsService {
  // Get comprehensive admin statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const [
        totalUsers,
        activeUsers,
        totalDevices,
        onlineDevices,
        newUsersToday,
        newDevicesToday
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getTotalDevices(),
        this.getOnlineDevices(),
        this.getNewUsersToday(),
        this.getNewDevicesToday()
      ]);

      const offlineDevices = totalDevices - onlineDevices;

      return {
        totalUsers,
        activeUsers,
        totalDevices,
        onlineDevices,
        offlineDevices,
        newUsersToday,
        newDevicesToday
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0,
        newUsersToday: 0,
        newDevicesToday: 0
      };
    }
  }

  // Get total number of users
  private async getTotalUsers(): Promise<number> {
    try {
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.values(usersData).filter((user: any) => user.isActive !== false).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting total users:', error);
      return 0;
    }
  }

  // Get active users (logged in within last 7 days)
  private async getActiveUsers(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.values(usersData).filter((user: any) => {
          if (user.isActive === false) return false;
          const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(0);
          return lastLogin >= sevenDaysAgo;
        }).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  // Get total number of devices
  private async getTotalDevices(): Promise<number> {
    try {
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.keys(devicesData).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting total devices:', error);
      return 0;
    }
  }

  // Get online devices
  private async getOnlineDevices(): Promise<number> {
    try {
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.values(devicesData).filter((device: any) => device.status === 'online').length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting online devices:', error);
      return 0;
    }
  }

  // Get new users today
  private async getNewUsersToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.values(usersData).filter((user: any) => {
          if (user.isActive === false) return false;
          const createdAt = user.createdAt ? new Date(user.createdAt) : new Date(0);
          return createdAt >= today;
        }).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting new users today:', error);
      return 0;
    }
  }

  // Get new devices today
  private async getNewDevicesToday(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        return Object.values(devicesData).filter((device: any) => {
          const createdAt = device.createdAt ? new Date(device.createdAt) : new Date(0);
          return createdAt >= today;
        }).length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting new devices today:', error);
      return 0;
    }
  }

  // Get user growth over time (last 30 days)
  async getUserGrowthData(): Promise<Array<{ date: string; count: number }>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const usersRef = ref(realtimeDb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        
        // Group by date
        const dailyCounts: { [key: string]: number } = {};
        Object.values(usersData).forEach((user: any) => {
          if (user.isActive !== false) {
            const createdAt = user.createdAt ? new Date(user.createdAt) : new Date(0);
            if (createdAt >= thirtyDaysAgo) {
              const date = createdAt.toISOString().split('T')[0];
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            }
          }
        });
        
        return Object.entries(dailyCounts).map(([date, count]) => ({
          date,
          count
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error getting user growth data:', error);
      return [];
    }
  }

  // Get device status distribution
  async getDeviceStatusDistribution(): Promise<{
    online: number;
    offline: number;
    unknown: number;
  }> {
    try {
      const devicesRef = ref(realtimeDb, 'devices');
      const snapshot = await get(devicesRef);
      
      const distribution = { online: 0, offline: 0, unknown: 0 };
      
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        Object.values(devicesData).forEach((device: any) => {
          const status = device.status || 'unknown';
          if (status === 'online') distribution.online++;
          else if (status === 'offline') distribution.offline++;
          else distribution.unknown++;
        });
      }
      
      return distribution;
    } catch (error) {
      console.error('Error getting device status distribution:', error);
      return { online: 0, offline: 0, unknown: 0 };
    }
  }

  // Get recent activity (last 10 activities)
  async getRecentActivity(): Promise<Array<{
    type: 'user_created' | 'user_updated' | 'device_created' | 'device_updated' | 'user_deleted' | 'device_deleted';
    description: string;
    timestamp: Date;
    userId?: string;
    deviceId?: string;
  }>> {
    try {
      // This would typically come from an activity log collection
      // For now, we'll return a mock implementation
      return [
        {
          type: 'user_created',
          description: 'New user registered',
          timestamp: new Date(),
          userId: 'user1'
        },
        {
          type: 'device_created',
          description: 'New device added',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          deviceId: 'device1'
        }
      ];
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}

export default new AdminStatsService();
