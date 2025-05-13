import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import bluetoothService from '../services/BluetoothService';

export default function BleTest() {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [hrv, setHrv] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectToDevice = async () => {
    try {
      // Start scanning
      bluetoothService.startScanning((device) => {
        console.log('Found device:', device.name);
        // Connect to the first device we find
        bluetoothService.connectToDevice(device.id);
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Connect to BLE Device" onPress={connectToDevice} />
      <View style={styles.output}>
        <Text>Heart Rate: {heartRate !== null ? `${heartRate} bpm` : 'N/A'}</Text>
        <Text>HRV: {hrv !== null ? `${hrv} ms` : 'N/A'}</Text>
        {error && <Text style={styles.error}>Error: {error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  output: {
    marginTop: 20,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
}); 