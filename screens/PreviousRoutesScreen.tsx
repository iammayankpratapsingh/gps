import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PreviousRoutesScreenProps {
  colors: any;
  onBack: () => void;
}

interface Route {
  id: string;
  name: string;
  date: string;
  duration: string;
  distance: string;
  startLocation: string;
  endLocation: string;
  status: 'completed' | 'incomplete';
}

export default function PreviousRoutesScreen({ colors, onBack }: PreviousRoutesScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  // Back handler for hamburger menu item screen
  useEffect(() => {
    const backAction = () => {
      onBack(); // Navigate back to hamburger menu
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  // Mock data - in real app, this would come from your database
  const routes: Route[] = [
    {
      id: '1',
      name: 'Morning Commute',
      date: '2024-12-15',
      duration: '45 min',
      distance: '12.5 km',
      startLocation: 'Home',
      endLocation: 'Office',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Weekend Trip',
      date: '2024-12-14',
      duration: '2h 30min',
      distance: '85.2 km',
      startLocation: 'City Center',
      endLocation: 'Mountain Resort',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Grocery Run',
      date: '2024-12-13',
      duration: '25 min',
      distance: '8.1 km',
      startLocation: 'Home',
      endLocation: 'Supermarket',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Evening Walk',
      date: '2024-12-12',
      duration: '15 min',
      distance: '3.2 km',
      startLocation: 'Park',
      endLocation: 'Home',
      status: 'incomplete'
    },
    {
      id: '5',
      name: 'Business Meeting',
      date: '2024-12-11',
      duration: '1h 15min',
      distance: '22.8 km',
      startLocation: 'Office',
      endLocation: 'Client Office',
      status: 'completed'
    }
  ];

  const filteredRoutes = routes.filter(route => {
    if (selectedFilter === 'all') return true;
    return route.status === selectedFilter;
  });

  const handleRoutePress = (route: Route) => {
    Alert.alert(
      route.name,
      `Date: ${route.date}\nDuration: ${route.duration}\nDistance: ${route.distance}\nFrom: ${route.startLocation}\nTo: ${route.endLocation}`,
      [
        { text: 'View Details', onPress: () => console.log('View route details:', route.id) },
        { text: 'Share Route', onPress: () => console.log('Share route:', route.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert(
      'Delete Route',
      'Are you sure you want to delete this route? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => console.log('Delete route:', routeId)
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Previous Routes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Route History</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            View and manage your previous routes and journeys.
          </Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'all' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'all' ? colors.surface : colors.text }
            ]}>
              All ({routes.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'completed' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('completed')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'completed' ? colors.surface : colors.text }
            ]}>
              Completed ({routes.filter(r => r.status === 'completed').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              { 
                backgroundColor: selectedFilter === 'incomplete' ? colors.primary : colors.surface,
                borderColor: colors.border
              }
            ]}
            onPress={() => setSelectedFilter('incomplete')}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedFilter === 'incomplete' ? colors.surface : colors.text }
            ]}>
              Incomplete ({routes.filter(r => r.status === 'incomplete').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Routes List */}
        <View style={styles.routesContainer}>
          {filteredRoutes.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🛣️</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No routes found</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                {selectedFilter === 'all' 
                  ? 'You haven\'t recorded any routes yet.'
                  : `No ${selectedFilter} routes found.`
                }
              </Text>
            </View>
          ) : (
            filteredRoutes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[styles.routeItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => handleRoutePress(route)}
                activeOpacity={0.7}
              >
                <View style={styles.routeHeader}>
                  <View style={styles.routeInfo}>
                    <Text style={[styles.routeName, { color: colors.text }]}>{route.name}</Text>
                    <Text style={[styles.routeDate, { color: colors.textSecondary }]}>
                      {formatDate(route.date)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { 
                      backgroundColor: route.status === 'completed' ? '#28a745' : '#ffc107',
                    }
                  ]}>
                    <Text style={styles.statusText}>
                      {route.status === 'completed' ? '✓' : '⏸'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.routeDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {route.duration}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📏</Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                      {route.distance}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.routeLocations}>
                  <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                    📍 {route.startLocation} → {route.endLocation}
                  </Text>
                </View>
                
                <View style={styles.routeActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.border }]}
                    onPress={() => console.log('View route on map:', route.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                      View on Map
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.border }]}
                    onPress={() => handleDeleteRoute(route.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routesContainer: {
    marginBottom: 32,
  },
  routeItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  routeDate: {
    fontSize: 14,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  routeDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
  },
  routeLocations: {
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
  },
  routeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
