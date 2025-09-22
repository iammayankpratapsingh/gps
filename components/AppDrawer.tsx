import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuItem } from '../constants/menuItems';
import { styles } from '../styles/drawerStyles';

interface AppDrawerProps {
  colors: any;
  isDrawerOpen: boolean;
  drawerAnimation: Animated.Value;
  profileImage: string | null;
  menuItems: MenuItem[];
  onToggleDrawer: () => void;
  onProfilePress: () => void;
  onLogout: () => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  colors,
  isDrawerOpen,
  drawerAnimation,
  profileImage,
  menuItems,
  onToggleDrawer,
  onProfilePress,
  onLogout,
}) => {
  return (
    <>
      <Animated.View style={[styles.drawer, { 
        transform: [{ translateX: drawerAnimation }],
        backgroundColor: colors.surface,
        borderRightColor: colors.border
      }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={[styles.drawerHeader, { backgroundColor: colors.drawer }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={onToggleDrawer} style={styles.backButton}>
                <Text style={[styles.backArrow, { color: colors.drawerText }]}>←</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={onProfilePress} style={styles.profileImageContainer}>
                <View style={styles.profileImage}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImageSource} />
                  ) : (
                    <Text style={styles.profileEmoji}>👨</Text>
                  )}
                </View>
                <View style={styles.editIcon}>
                  <Icon name="edit" size={16} color="#0097b2" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={item.action || (() => {})}
            >
              <Icon name={item.icon} size={20} color={item.color} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }, item.id === 9 && styles.deleteText]}>{item.title}</Text>
              <Text style={[styles.menuArrow, { color: colors.text }]}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Logout Button */}
        <View style={[styles.logoutContainer, { 
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        }]}>
          <TouchableOpacity style={[styles.logoutButton, { 
            backgroundColor: colors.error,
            shadowColor: colors.error
          }]} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.drawerFooter, { backgroundColor: colors.surface }]}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>
        </SafeAreaView>
      </Animated.View>

      {/* Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          onPress={onToggleDrawer}
          activeOpacity={1}
        />
      )}
    </>
  );
};
