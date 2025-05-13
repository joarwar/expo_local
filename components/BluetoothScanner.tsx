import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useBluetooth } from '../hooks/useBluetooth';

export const BluetoothScanner = () => {
  const {
    isInitialized,
    isScanning,
    devices,
    connectedDevice,
    error,
    initialize,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectDevice,
  } = useBluetooth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderDevice = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item.id)}
    >
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      {!isInitialized ? (
        <Text>Initializing Bluetooth...</Text>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            {!isScanning ? (
              <TouchableOpacity
                style={styles.button}
                onPress={startScanning}
              >
                <Text style={styles.buttonText}>Start Scanning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={stopScanning}
              >
                <Text style={styles.buttonText}>Stop Scanning</Text>
              </TouchableOpacity>
            )}
          </View>

          {connectedDevice && (
            <View style={styles.connectedDevice}>
              <Text style={styles.connectedText}>
                Connected to: {connectedDevice.name || 'Unknown Device'}
              </Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectDevice}
              >
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  connectedDevice: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  connectedText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
  },
  disconnectButton: {
    backgroundColor: '#D32F2F',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
}); 