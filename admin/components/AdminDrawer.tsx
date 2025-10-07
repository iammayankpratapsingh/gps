import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdmin } from '../contexts/AdminContext';
import { AdminNavigationItem } from '../types';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.8;

interface AdminDrawerProps {
  isDrawerOpen: boolean;
  drawerAnimation: Animated.Value;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isDrawerOpen,
  drawerAnimation,
  onClose,
  onNavigate,
  onLogout
}) => {
  const { currentUser, theme, isSuperAdmin } = useAdmin();

  const navigationItems: AdminNavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      screen: 'AdminDashboard'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: 'people',
      screen: 'AdminUserManagement'
    },
    {
      id: 'devices',
      title: 'Device Management',
      icon: 'devices',
      screen: 'AdminDeviceManagement'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: 'analytics',
      screen: 'AdminAnalytics'
    },
    {
      id: 'settings',
      title: 'Admin Settings',
      icon: 'settings',
      screen: 'AdminSettings'
    }
  ];

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const overlayOpacity = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <>
      {/* Overlay */}
      {isDrawerOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.drawer,
            transform: [{ translateX: drawerTranslateX }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              {currentUser?.profileImageUrl ? (
                <Image
                  source={{ uri: currentUser.profileImageUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Icon name="admin-panel-settings" size={32} color={theme.drawerText} />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.drawerText }]}>
                {currentUser?.displayName || 'Super Admin'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                {currentUser?.email || 'superadmin@gmail.com'}
              </Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.roleText, { color: theme.drawerText }]}>
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Icon name="close" size={24} color={theme.drawerText} />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <ScrollView style={styles.navigation} showsVerticalScrollIndicator={false}>
          {navigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                { borderBottomColor: theme.border }
              ]}
              onPress={() => {
                onNavigate(item.screen);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.navItemContent}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={theme.drawerText}
                  style={styles.navIcon}
                />
                <Text style={[styles.navText, { color: theme.drawerText }]}>
                  {item.title}
                </Text>
                {item.badge && item.badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.error }]}>
                    <Text style={styles.badgeText}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Icon name="logout" size={24} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 998,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 999,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    borderRadius: 20,
  },
  navigation: {
    flex: 1,
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    marginRight: 16,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default AdminDrawer;
