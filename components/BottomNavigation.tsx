import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeColors } from '../services/themeService';

interface BottomNavigationProps {
  colors: ThemeColors;
  activeTab: string;
  onTabPress: (tab: string) => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'devices', label: 'Devices', icon: 'devices' },
  { id: 'reports', label: 'Reports', icon: 'assessment' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'account', label: 'Account', icon: 'person' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  colors,
  activeTab,
  onTabPress,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['bottom']}>
      <View style={[styles.navigationBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Icon 
                name={tab.icon} 
                size={24} 
                color={isActive ? colors.primary : colors.textSecondary} 
                style={styles.tabIcon} 
              />
              <Text style={[styles.tabLabel, { color: isActive ? colors.primary : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navigationBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
