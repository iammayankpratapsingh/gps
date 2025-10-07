import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Image, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MenuItem } from '../constants/menuItems';
import { styles } from '../styles/drawerStyles';
import LanguageToggle from './LanguageToggle';

const { width } = Dimensions.get('window');

interface AppDrawerProps {
  colors: any;
  isDrawerOpen: boolean;
  drawerAnimation: Animated.Value;
  profileImage: string | null;
  menuItems: MenuItem[];
  onToggleDrawer: () => void;
  onProfilePress: () => void;
  onLanguageChange?: (languageCode: string) => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  colors,
  isDrawerOpen,
  drawerAnimation,
  profileImage,
  menuItems,
  onToggleDrawer,
  onProfilePress,
  onLanguageChange,
}) => {
  const { t } = useTranslation('common');

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

          {/* Language Toggle Button */}
          <LanguageToggle 
            colors={colors} 
            onLanguageChange={onLanguageChange}
          />

        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={item.action || (() => {})}
            >
              <Icon name={item.icon} size={20} color={item.color} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }, item.id === 9 && styles.deleteText]}>{t(item.titleKey)}</Text>
              <Text style={[styles.menuArrow, { color: colors.text }]}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        

        <View style={[styles.drawerFooter, { backgroundColor: colors.surface }]}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>{t('version')} 1.0.0</Text>
        </View>
        </SafeAreaView>
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: drawerAnimation.interpolate({
              inputRange: [-width * 0.8, 0],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
        pointerEvents={isDrawerOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject}
          onPress={onToggleDrawer}
          activeOpacity={1}
        />
      </Animated.View>
    </>
  );
};
