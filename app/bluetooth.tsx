import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBluetooth } from '../hooks/useBluetooth';
import { Device } from 'react-native-ble-plx';

export default function BluetoothScreen() {
  const { 
    isInitialized, 
    isScanning, 
    devices, 
    connectedDevice,
    initialize, 
    startScanning, 
    stopScanning, 
    connectToDevice, 
    disconnectDevice 
  } = useBluetooth();
  const [error, setError] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';

  const handleInitialize = async () => {
    try {
      setError(null);
      await initialize();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Bluetooth';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleScanPress = async () => {
    try {
      setError(null);
      if (isScanning) {
        stopScanning();
      } else {
        await startScanning();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scanning';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDevicePress = async (device: Device) => {
    try {
      setError(null);
      if (connectedDevice?.id === device.id) {
        await disconnectDevice();
      } else {
        await connectToDevice(device.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to device';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  if (isWeb) {
    return (
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Bluetooth Scanner</Text>
          <View style={styles.card}>
            <Text style={styles.message}>
              Bluetooth functionality is not available in web browsers.
              Please use the mobile app to access Bluetooth features.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Bluetooth Scanner</Text>
        
        <View style={styles.card}>
          <Text style={styles.status}>
            Status: {isInitialized ? 'Ready' : 'Not Initialized'}
          </Text>
          
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <Text style={styles.instructions}>
            {isInitialized 
              ? 'Press the button below to start scanning for Bluetooth devices'
              : 'Press the button below to initialize Bluetooth'}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              isScanning && styles.buttonScanning
            ]}
            onPress={isInitialized ? handleScanPress : handleInitialize}
          >
            <Text style={styles.buttonText}>
              {isInitialized 
                ? (isScanning ? 'Stop Scanning' : 'Start Scanning')
                : 'Initialize Bluetooth'}
            </Text>
          </TouchableOpacity>
        </View>

        {devices.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  styles.deviceItem,
                  connectedDevice?.id === device.id && styles.deviceItemConnected
                ]}
                onPress={() => handleDevicePress(device)}
              >
                <Text style={styles.deviceName}>
                  {device.name || 'Unknown Device'}
                </Text>
                <Text style={styles.deviceId}>ID: {device.id}</Text>
                <Text style={styles.deviceRSSI}>
                  Signal: {device.rssi} dBm
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4c669f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonScanning: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  deviceItemConnected: {
    borderColor: '#4c669f',
    borderWidth: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceId: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deviceRSSI: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 