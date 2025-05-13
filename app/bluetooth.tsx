import React, { useState } from 'react';
import { Alert, Platform, TouchableOpacity, Text, ScrollView, FlatList, StyleSheet, View } from 'react-native';
import { useBluetooth } from '../hooks/useBluetooth';
import { LinearGradient } from 'expo-linear-gradient';
import { Device } from 'react-native-ble-plx';
import { Link } from 'expo-router';

export default function BluetoothScreen() {
  const {
    isInitialized,
    error,
    initialize,
    isScanning,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectDevice,
    devices,
    connectedDevice,
    heartRate,
    heartRateVariability,
  } = useBluetooth();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isWeb = Platform.OS === 'web';

  const handleInitialize = async () => {
    try {
      setErrorMessage(null);
      await initialize();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize Bluetooth';
      setErrorMessage(message);
      Alert.alert('Error', message);
    }
  };

  const handleScanPress = async () => {
    try {
      setErrorMessage(null);
      if (isScanning) {
        stopScanning();
      } else {
        await startScanning();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start scanning';
      setErrorMessage(message);
      Alert.alert('Error', message);
    }
  };

  const handleDevicePress = async (device: Device) => {
    try {
      setErrorMessage(null);
      if (connectedDevice?.id === device.id) {
        await disconnectDevice();
      } else {
        await connectToDevice(device.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to device';
      setErrorMessage(message);
      Alert.alert('Error', message);
    }
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={[styles.deviceItem, connectedDevice?.id === item.id && styles.deviceItemConnected]}
      onPress={() => handleDevicePress(item)}
    >
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
      <Text style={styles.deviceRSSI}>Signal: {item.rssi} dBm</Text>
    </TouchableOpacity>
  );

  if (isWeb) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Bluetooth Scanner</Text>
          <View style={styles.card}>
            <Text style={styles.message}>
              Bluetooth functionality is not available in web browsers. Please use the mobile app to access Bluetooth features.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bluetooth Scanner</Text>

        <View style={styles.card}>
          <Text style={styles.status}>Status: {isInitialized ? 'Ready' : 'Not Initialized'}</Text>

          {connectedDevice && (
            <View style={styles.connectedStatus}>
              <Text style={styles.connectedText}>
                Connected to: {connectedDevice.name || 'Unknown Device'}
              </Text>
              {heartRate !== null && <Text style={styles.dataText}>Heart Rate: {heartRate} bpm</Text>}
              {heartRateVariability !== null && <Text style={styles.dataText}>HRV: {heartRateVariability} ms</Text>}
            </View>
          )}

          {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

          <Text style={styles.instructions}>
            {isInitialized ? 'Press the button below to start scanning for Bluetooth devices' : 'Press the button below to initialize Bluetooth'}
          </Text>

          <TouchableOpacity
            style={[styles.button, isScanning && styles.buttonScanning]}
            onPress={isInitialized ? handleScanPress : handleInitialize}
          >
            <Text style={styles.buttonText}>
              {isInitialized ? (isScanning ? 'Stop Scanning' : 'Start Scanning') : 'Initialize Bluetooth'}
            </Text>
          </TouchableOpacity>

          <Link href="/(tabs)" style={styles.homeButton}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </Link>
        </View>

        <View style={styles.deviceListContainer}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            style={styles.deviceList}
            contentContainerStyle={styles.deviceListContent}
          />
        </View>
      </View>
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
    marginBottom: 10,
  },
  buttonScanning: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  deviceListContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    paddingBottom: 20,
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
  connectedStatus: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  connectedText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 16,
    color: '#2e7d32',
    marginTop: 5,
  },
}); 