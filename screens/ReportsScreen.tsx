import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';
import DeviceAnalyticsScreen from './DeviceAnalyticsScreen';
import LocationReportsScreen from './LocationReportsScreen';
import BatteryReportsScreen from './BatteryReportsScreen';
import PerformanceMetricsScreen from './PerformanceMetricsScreen';
import ExitConfirmationPopup from '../components/ExitConfirmationPopup';

export default function ReportsScreen() {
  const { t } = useTranslation('common');
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  
  // Professional status bar that matches header color
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  // Back handler for exit confirmation
  useEffect(() => {
    const backAction = () => {
      // If user is on a deep screen (not main reports screen), handle normal back navigation
      if (selectedReport) {
        setSelectedReport(null);
        return true; // Prevent default back behavior
      }
      
      // If user is on main reports screen, show exit confirmation
      setShowExitPopup(true);
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [selectedReport]);

  const handleReportPress = (reportType: string) => {
    setSelectedReport(reportType);
  };

  const handleBack = () => {
    setSelectedReport(null);
  };

  const handleExitConfirm = () => {
    setShowExitPopup(false);
    BackHandler.exitApp(); // Close the app
  };

  const handleExitCancel = () => {
    setShowExitPopup(false);
  };

  // Render individual report screens
  if (selectedReport === 'Device Analytics') {
    return <DeviceAnalyticsScreen onBack={handleBack} />;
  }
  
  if (selectedReport === 'Location Reports') {
    return <LocationReportsScreen onBack={handleBack} />;
  }
  
  if (selectedReport === 'Battery Reports') {
    return <BatteryReportsScreen onBack={handleBack} />;
  }
  
  if (selectedReport === 'Performance Metrics') {
    return <PerformanceMetricsScreen onBack={handleBack} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.content, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('reports')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            View detailed analytics and reports for your devices
          </Text>
        </View>

        {/* Device Analytics Section */}
        <TouchableOpacity 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.surface, 
              borderColor: selectedReport === 'Device Analytics' ? colors.primary : colors.border,
              borderWidth: selectedReport === 'Device Analytics' ? 2 : 1
            }
          ]}
          onPress={() => handleReportPress('Device Analytics')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon name="analytics" size={20} color={colors.primary} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Device Analytics</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Track device performance, usage patterns, and location history
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Device usage statistics</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Online/offline patterns</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Movement analysis</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Performance trends</Text>
          </View>
        </TouchableOpacity>

        {/* Location Reports Section */}
        <TouchableOpacity 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.surface, 
              borderColor: selectedReport === 'Location Reports' ? colors.primary : colors.border,
              borderWidth: selectedReport === 'Location Reports' ? 2 : 1
            }
          ]}
          onPress={() => handleReportPress('Location Reports')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon name="location-on" size={20} color={colors.primary} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Location Reports</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            View detailed location tracking reports and route analysis
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Route history and maps</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Distance traveled</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Speed analysis</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Geofence reports</Text>
          </View>
        </TouchableOpacity>

        {/* Battery Reports Section */}
        <TouchableOpacity 
          style={[
            styles.card, 
            { 
              backgroundColor: colors.surface, 
              borderColor: selectedReport === 'Battery Reports' ? colors.primary : colors.border,
              borderWidth: selectedReport === 'Battery Reports' ? 2 : 1
            }
          ]}
          onPress={() => handleReportPress('Battery Reports')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon name="battery-std" size={20} color={colors.primary} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Battery Reports</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Monitor battery usage and performance across all devices
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Battery level trends</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Charging patterns</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Power consumption</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Low battery alerts</Text>
          </View>
        </TouchableOpacity>

        {/* Performance Metrics Section */}
        <TouchableOpacity 
          style={[
            styles.card, 
            styles.lastCard,
            { 
              backgroundColor: colors.surface, 
              borderColor: selectedReport === 'Performance Metrics' ? colors.primary : colors.border,
              borderWidth: selectedReport === 'Performance Metrics' ? 2 : 1
            }
          ]}
          onPress={() => handleReportPress('Performance Metrics')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Icon name="trending-up" size={20} color={colors.primary} style={styles.cardIcon} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Performance Metrics</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Analyze device performance and identify optimization opportunities
          </Text>
          <View style={styles.cardFeatures}>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Response time analysis</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Data accuracy metrics</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• System health status</Text>
            <Text style={[styles.featureItem, { color: colors.textSecondary }]}>• Optimization suggestions</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Exit Confirmation Popup */}
      <ExitConfirmationPopup
        visible={showExitPopup}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 60,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFeatures: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
});
