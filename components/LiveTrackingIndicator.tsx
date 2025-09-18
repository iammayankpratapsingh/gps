import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useDevices } from '../contexts/DeviceContext';

interface LiveTrackingIndicatorProps {
  colors: any;
}

export const LiveTrackingIndicator: React.FC<LiveTrackingIndicatorProps> = ({ colors }) => {
  const { isConnected, connectionState } = useWebSocket();
  const { isLiveTracking, enableLiveTracking, disableLiveTracking } = useDevices();

  const getStatusColor = (): string => {
    if (!isConnected) return colors.error;
    if (isLiveTracking) return colors.success;
    return colors.warning || '#FFA500';
  };

  const getStatusText = (): string => {
    if (!isConnected) return 'Disconnected';
    if (isLiveTracking) return 'Live Tracking';
    return 'Connected';
  };

  const getStatusIcon = (): string => {
    if (!isConnected) return '🔴';
    if (isLiveTracking) return '🟢';
    return '🟡';
  };

  const handleToggle = () => {
    if (isLiveTracking) {
      disableLiveTracking();
    } else {
      enableLiveTracking();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: getStatusColor(),
        }
      ]}
      onPress={handleToggle}
      disabled={!isConnected}
    >
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.statusText, { color: colors.text }]}>
        {getStatusIcon()} {getStatusText()}
      </Text>
      {isConnected && (
        <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
          {isLiveTracking ? 'Tap to disable live updates' : 'Tap to enable live updates'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  toggleText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
