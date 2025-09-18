import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemeColors } from '../services/themeService';
import simpleTraccarService from '../services/traccarServiceSimple';

interface TraccarTestProps {
  colors: ThemeColors;
}

export const TraccarTest: React.FC<TraccarTestProps> = ({ colors }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested');

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing...');
    
    try {
      console.log('[TraccarTest] Testing Traccar connection...');
      const result = await simpleTraccarService.testConnection();
      
      if (result.success) {
        setConnectionStatus('✅ Connected successfully!');
        Alert.alert('Success', 'Traccar connection is working!');
      } else {
        setConnectionStatus(`❌ Failed: ${result.error}`);
        Alert.alert('Error', `Connection failed: ${result.error}`);
      }
    } catch (error) {
      console.error('[TraccarTest] Connection test error:', error);
      setConnectionStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testDeviceLookup = async () => {
    setIsLoading(true);
    
    try {
      console.log('[TraccarTest] Testing device lookup...');
      const result = await simpleTraccarService.findDeviceByUniqueId('92692518');
      
      if (result.success && result.data) {
        Alert.alert('Success', `Found device: ${result.data.name} (${result.data.uniqueId})`);
      } else if (result.success && !result.data) {
        Alert.alert('Info', 'Device not found in Traccar server');
      } else {
        Alert.alert('Error', `Lookup failed: ${result.error}`);
      }
    } catch (error) {
      console.error('[TraccarTest] Device lookup error:', error);
      Alert.alert('Error', 'An unexpected error occurred during device lookup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Traccar Integration Test</Text>
        
        <View style={styles.statusContainer}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Connection Status:</Text>
          <Text style={[styles.statusText, { color: colors.text }]}>{connectionStatus}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={testConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={testDeviceLookup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Device Lookup'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.info, { color: colors.textSecondary }]}>
          This will test the connection to your Traccar server and device lookup functionality.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
