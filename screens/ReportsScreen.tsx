import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Animated, Dimensions, Easing } from 'react-native';
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

const { width: screenWidth } = Dimensions.get('window');

export default function ReportsScreen() {
  const { t } = useTranslation('common');
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isExitingReport, setIsExitingReport] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  
  // Animation values for main screen
  const translateX = useRef(new Animated.Value(0)).current;
  
  
  // Animation values for report screen
  const reportTranslateX = useRef(new Animated.Value(screenWidth)).current;
  
  
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
      // If user is on a deep screen (not main reports screen), trigger unified back handler
      if (selectedReport) {
        if (!isExitingReport) {
          handleBack();
        }
        return true; // Prevent default back behavior
      }
      // If user is on main reports screen, show exit confirmation
      setShowExitPopup(true);
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [selectedReport, isExitingReport]);

  const handleReportPress = (reportType: string) => {
    setSelectedReport(reportType);
    
    // Reset report screen animation values
    reportTranslateX.setValue(screenWidth);
    
    // Animate out the main screen and slide in the report screen
    Animated.parallel([
      // Main screen animations
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Report screen slide-in animation
      Animated.timing(reportTranslateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBack = () => {
    if (isExitingReport) return;
    setIsExitingReport(true);

    // Fallback timeout to ensure unmount even if animation callback doesn't fire
    const fallback = setTimeout(() => {
      setSelectedReport(null);
      setIsExitingReport(false);
      // Reset animated values for next open
      reportTranslateX.setValue(screenWidth);
      translateX.setValue(0);
    }, 600);

    // Animate out the report screen and back to main screen
    Animated.parallel([
      // Report screen slide-out animation
      Animated.timing(reportTranslateX, {
        toValue: screenWidth,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      // Main screen animations
      Animated.timing(translateX, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      clearTimeout(fallback);
      setSelectedReport(null);
      setIsExitingReport(false);
      // Reset animated values for next open
      reportTranslateX.setValue(screenWidth);
      translateX.setValue(0);
    });
  };

  const handleExitConfirm = () => {
    setShowExitPopup(false);
    BackHandler.exitApp(); // Close the app
  };

  const handleExitCancel = () => {
    setShowExitPopup(false);
  };

  // Render individual report screens with animations
  const renderReportScreen = () => {
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
    
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Animated Main Content */}
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            transform: [
              { translateX }
            ],
          }
        ]}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
          activeOpacity={0.8}
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
          activeOpacity={0.8}
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
          activeOpacity={0.8}
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
          activeOpacity={0.8}
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
      </Animated.View>

      {/* Report Screen Overlay */}
      {selectedReport && (
        <Animated.View 
          style={[
            styles.reportOverlay,
            {
              transform: [{ translateX: reportTranslateX }],
            }
          ]}
          pointerEvents={isExitingReport ? 'none' : 'auto'}
        >
          {renderReportScreen()}
        </Animated.View>
      )}

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
  animatedContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Prevent bottom navigator overlap
  },
  reportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
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
    marginBottom: 20,
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
