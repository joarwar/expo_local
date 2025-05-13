import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Device } from 'react-native-ble-plx';
import { useRouter } from 'expo-router';
import BluetoothService from '../app/services/BluetoothService';
import { requestBluetoothPermissions } from '../utils/bluetoothPermissions';
import { Buffer } from 'buffer';

// UUIDs for STM32 firmware
const SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';
const HR_CHAR_UUID = '0000fe41-8e22-4541-9d4c-21edae82ed19';
const HRV_CHAR_UUID = '0000fe42-8e22-4541-9d4c-21edae82ed19';

export const useBluetooth = () => {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [heartRateVariability, setHeartRateVariability] = useState<number | null>(null);

  // Use refs to track heart rate and HRV during asynchronous operations
  const heartRateRef = useRef(heartRate);
  const heartRateVariabilityRef = useRef(heartRateVariability);

  // Update refs when state changes
  useEffect(() => {
    heartRateRef.current = heartRate;
  }, [heartRate]);

  useEffect(() => {
    heartRateVariabilityRef.current = heartRateVariability;
  }, [heartRateVariability]);

  // Initialize Bluetooth
  const initialize = useCallback(async () => {
    try {
      console.log('useBluetooth: Initializing Bluetooth...');
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) {
        console.log('useBluetooth: Bluetooth permissions not granted');
        setError('Bluetooth permissions not granted');
        return;
      }
      await BluetoothService.initialize();
      setIsInitialized(true);
      setError(null);
      console.log('useBluetooth: Bluetooth initialized successfully');
    } catch (err) {
      console.error('useBluetooth: Failed to initialize Bluetooth:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Bluetooth');
    }
  }, []);

  // Start scanning for devices
  const startScanning = useCallback(async () => {
    try {
      console.log('useBluetooth: Starting device scan...');
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) {
        console.log('useBluetooth: Bluetooth permissions not granted');
        setError('Bluetooth permissions not granted');
        return;
      }
      setDevices([]);
      setIsScanning(true);
      setError(null);

      await BluetoothService.startScanning((device) => {
        console.log('useBluetooth: Device found:', {
          id: device.id,
          name: device.name,
          rssi: device.rssi
        });
        setDevices((prevDevices) => {
          const existingDevice = prevDevices.find((d) => d.id === device.id);
          if (!existingDevice) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });
    } catch (err) {
      console.error('useBluetooth: Failed to start scanning:', err);
      setError(err instanceof Error ? err.message : 'Failed to start scanning');
      setIsScanning(false);
    }
  }, []);

  // Stop scanning
  const stopScanning = useCallback(() => {
    BluetoothService.stopScanning();
    setIsScanning(false);
  }, []);

  // Connect to a device and subscribe to HR/HRV notifications
  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      console.log('useBluetooth: Connecting to device:', deviceId);
      const device = await BluetoothService.connectToDevice(deviceId);
      setConnectedDevice(device);
      setError(null);
      console.log('useBluetooth: Connected to device:', deviceId);

      // Wait 1 second before subscribing to ensure connection is stable
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const connected = await device.isConnected();
      if (!connected) {
        console.log('useBluetooth: Device disconnected before subscribing');
        setError('Device disconnected before subscribing to HR/HRV');
        return;
      }

      // Subscribe to Heart Rate notifications
      BluetoothService.monitorCharacteristicForDevice(
        deviceId,
        SERVICE_UUID,
        HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('useBluetooth: Failed to subscribe to HR notifications:', error);
            setError('Failed to subscribe to HR notifications');
            return;
          }
          if (characteristic?.value) {
            try {
              const buffer = Buffer.from(characteristic.value, 'base64');
              const dataView = new DataView(buffer.buffer);
              const hr = dataView.getUint16(0, true) / 100;
              setHeartRate(hr);
            } catch (err) {
              console.error('useBluetooth: Error parsing HR value:', err);
            }
          }
        }
      );

      // Subscribe to HRV notifications
      BluetoothService.monitorCharacteristicForDevice(
        deviceId,
        SERVICE_UUID,
        HRV_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('useBluetooth: Failed to subscribe to HRV notifications:', error);
            setError('Failed to subscribe to HRV notifications');
            return;
          }
          if (characteristic?.value) {
            try {
              const buffer = Buffer.from(characteristic.value, 'base64');
              const dataView = new DataView(buffer.buffer);
              const hrv = dataView.getUint16(0, true) / 100;
              setHeartRateVariability(hrv);
            } catch (err) {
              console.error('useBluetooth: Error parsing HRV value:', err);
            }
          }
        }
      );

      // Wait for initial data before navigating
      let attempts = 0;
      const maxAttempts = 3;
      const checkData = () => {
        if (heartRateRef.current !== null || heartRateVariabilityRef.current !== null) {
          console.log('useBluetooth: Received initial data, navigating to home');
          router.replace('/');
        } else if (attempts < maxAttempts) {
          attempts++;
          console.log('useBluetooth: Waiting for data, attempt:', attempts);
          setTimeout(checkData, 5000); // Check every 5 seconds
        } else {
          console.log('useBluetooth: No data received after', maxAttempts, 'attempts');
          router.replace('/');
        }
      };
      checkData();
    } catch (err) {
      console.error('useBluetooth: Failed to connect to device:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
    }
  }, [router]);

  // Disconnect from device
  const disconnectDevice = useCallback(async () => {
    if (connectedDevice) {
      try {
        await BluetoothService.disconnectDevice(connectedDevice.id);
        setConnectedDevice(null);
        setHeartRate(null);
        setHeartRateVariability(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disconnect from device');
      }
    }
  }, [connectedDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      BluetoothService.destroy();
    };
  }, []);

  return {
    isInitialized,
    isScanning,
    devices,
    connectedDevice,
    error,
    heartRate,
    heartRateVariability,
    initialize,
    startScanning,
    stopScanning,
    connectToDevice,
    disconnectDevice,
  };
};
