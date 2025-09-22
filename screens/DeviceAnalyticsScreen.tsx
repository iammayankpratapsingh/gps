import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface DeviceAnalyticsScreenProps {
  onBack: () => void;
}

export default function DeviceAnalyticsScreen({ onBack }: DeviceAnalyticsScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Device Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="analytics" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage Statistics</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Device Usage Overview</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Track how your devices are being used over time
            </Text>
            <View style={styles.placeholderContent}>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Usage charts and statistics will be displayed here
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="sync" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Online/Offline Patterns</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Connection Patterns</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Analyze when devices are online vs offline
            </Text>
            <View style={styles.placeholderContent}>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Connection timeline and patterns will be shown here
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="directions" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Movement Analysis</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Activity Patterns</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Understand device movement and activity patterns
            </Text>
            <View style={styles.placeholderContent}>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Movement analysis and activity charts will be displayed here
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="trending-up" size={20} color={colors.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Trends</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Performance Metrics</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              Monitor device performance over time
            </Text>
            <View style={styles.placeholderContent}>
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Performance trends and metrics will be shown here
              </Text>
            </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 100,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  placeholderContent: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
