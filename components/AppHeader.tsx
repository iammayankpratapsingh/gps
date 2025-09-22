import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/headerStyles';

interface AppHeaderProps {
  colors: any;
  onMenuPress: () => void;
  onAddDevicePress: () => void;
  onFilterPress: () => void;
  onSearchPress: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  colors,
  onMenuPress,
  onAddDevicePress,
  onFilterPress,
  onSearchPress,
}) => {
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        backgroundColor: colors.header,
        zIndex: 10000, // Very high z-index to stay above summary cards
      }}
    >
      <View style={[styles.header, { backgroundColor: colors.header, zIndex: 10000 }]}>
        <View style={styles.headerContent}>
          {/* Menu button */}
          <TouchableOpacity 
            style={[styles.listGridButton, { backgroundColor: colors.input }]}
            onPress={onMenuPress}
          >
            <Icon name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          
          {/* Search bar - opens full screen search */}
          <TouchableOpacity 
            style={[
              styles.searchContainer,
              { 
                backgroundColor: colors.input, 
                borderColor: colors.border, 
                borderWidth: 1 
              }
            ]}
            onPress={onSearchPress}
          >
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Search Devices
            </Text>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={onFilterPress}
            >
              <Icon name="tune" size={20} color={colors.text} />
            </TouchableOpacity>
          </TouchableOpacity>
          
          {/* Add button */}
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={onAddDevicePress}
          >
            <Icon name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};