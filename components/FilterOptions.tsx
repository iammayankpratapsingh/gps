import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { DeviceFilter } from '../contexts/DeviceContext';

interface FilterOptionsProps {
  colors: any;
  currentFilter: DeviceFilter;
  onFilterSelect: (filter: DeviceFilter) => void;
  onClose: () => void;
  visible: boolean;
}

export const FilterOptions: React.FC<FilterOptionsProps> = ({
  colors,
  currentFilter,
  onFilterSelect,
  onClose,
  visible,
}) => {
  // Safety check to prevent crashes
  if (!colors || !onFilterSelect || !onClose) {
    console.error('[FilterOptions] Missing required props');
    return null;
  }
  const filterOptions = [
    { key: 'all' as DeviceFilter, label: 'All Devices', icon: '📱' },
    { key: 'online' as DeviceFilter, label: 'Online Devices', icon: '🟢' },
    { key: 'offline' as DeviceFilter, label: 'Offline Devices', icon: '🔴' },
  ];

  const handleFilterSelect = (filter: DeviceFilter) => {
    try {
      onFilterSelect(filter);
      onClose();
    } catch (error) {
      console.error('[FilterOptions] Error selecting filter:', error);
      onClose(); // Still close the modal even if there's an error
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Filter Devices
            </Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.input }]}
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: currentFilter === option.key ? colors.primary + '20' : 'transparent',
                    borderColor: currentFilter === option.key ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => handleFilterSelect(option.key)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    { 
                      color: currentFilter === option.key ? colors.primary : colors.text,
                      fontWeight: currentFilter === option.key ? '600' : '400'
                    }
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {currentFilter === option.key && (
                  <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionsContainer: {
    padding: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
