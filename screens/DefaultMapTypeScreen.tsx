import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DefaultMapTypeScreenProps {
  colors: any;
  onBack: () => void;
}

export default function DefaultMapTypeScreen({ colors, onBack }: DefaultMapTypeScreenProps) {
  const [selectedMapType, setSelectedMapType] = useState('standard');

  const mapTypes = [
    { id: 'standard', name: 'Standard', description: 'Default map view with roads and labels' },
    { id: 'satellite', name: 'Satellite', description: 'Satellite imagery view' },
    { id: 'hybrid', name: 'Hybrid', description: 'Satellite view with road labels' },
    { id: 'terrain', name: 'Terrain', description: 'Topographic view with elevation' },
  ];

  // Back handler for hamburger menu item screen
  useEffect(() => {
    const backAction = () => {
      onBack(); // Navigate back to hamburger menu
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const handleMapTypeSelect = (mapType: string) => {
    setSelectedMapType(mapType);
    // TODO: Save to AsyncStorage and apply to map
    console.log('Selected map type:', mapType);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Default Map Type</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Default Map Type</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select your preferred map type that will be used by default in the app.
          </Text>
        </View>

        <View style={styles.mapTypesContainer}>
          {mapTypes.map((mapType) => (
            <TouchableOpacity
              key={mapType.id}
              style={[
                styles.mapTypeOption,
                { 
                  backgroundColor: colors.surface,
                  borderColor: selectedMapType === mapType.id ? colors.primary : colors.border,
                  borderWidth: selectedMapType === mapType.id ? 2 : 1,
                }
              ]}
              onPress={() => handleMapTypeSelect(mapType.id)}
              activeOpacity={0.7}
            >
              <View style={styles.mapTypeInfo}>
                <Text style={[styles.mapTypeName, { color: colors.text }]}>{mapType.name}</Text>
                <Text style={[styles.mapTypeDescription, { color: colors.textSecondary }]}>
                  {mapType.description}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                { 
                  borderColor: selectedMapType === mapType.id ? colors.primary : colors.border,
                  backgroundColor: selectedMapType === mapType.id ? colors.primary : 'transparent'
                }
              ]}>
                {selectedMapType === mapType.id && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.surface }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preview</Text>
          <View style={[styles.previewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.previewText, { color: colors.textSecondary }]}>
              Map preview will be shown here
            </Text>
            <Text style={[styles.previewSubtext, { color: colors.textSecondary }]}>
              Selected: {mapTypes.find(mt => mt.id === selectedMapType)?.name}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  mapTypesContainer: {
    marginBottom: 32,
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mapTypeInfo: {
    flex: 1,
  },
  mapTypeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mapTypeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewContainer: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  previewText: {
    fontSize: 16,
    marginBottom: 8,
  },
  previewSubtext: {
    fontSize: 14,
  },
});
