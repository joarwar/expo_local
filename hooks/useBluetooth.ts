import { useState, useEffect, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import BluetoothService from '../app/services/BluetoothService';
import { requestBluetoothPermissions } from '../app/utils/bluetoothPermissions';

// UUIDs for STM32 firmware
const SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';
const HR_CHAR_UUID = '0000fe41-8e22-4541-9d4c-21edae82ed19';
const HRV_CHAR_UUID = '0000fe42-8e22-4541-9d4c-21edae82ed19';

export const useBluetooth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [heartRateVariability, setHeartRateVariability] = useState<number | null>(null);

  // Initialize Bluetooth
  const initialize = useCallback(async () => {
    try {
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) {
        setError('Bluetooth permissions not granted');
        return;
      }
      await BluetoothService.initialize();
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Bluetooth');
    }
  }, []);

  // Start scanning for devices
  const startScanning = useCallback(async () => {
    try {
      const permissionsGranted = await requestBluetoothPermissions();
      if (!permissionsGranted) {
        setError('Bluetooth permissions not granted');
        return;
      }
      setDevices([]);
      setIsScanning(true);
      setError(null);

      await BluetoothService.startScanning((device) => {
        setDevices((prevDevices) => {
          const existingDevice = prevDevices.find((d) => d.id === device.id);
          if (!existingDevice) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });
    } catch (err) {
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
      const device = await BluetoothService.connectToDevice(deviceId);
      setConnectedDevice(device);
      setError(null);
      // Wait 500ms before subscribing
      await new Promise((resolve) => setTimeout(resolve, 500));
      const connected = await device.isConnected();
      if (!connected) {
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
            setError('Failed to subscribe to HR notifications');
            return;
          }
          if (characteristic?.value) {
            const buffer = Buffer.from(characteristic.value, 'base64');
            const hr = buffer.readUInt16LE(0) / 100;
            setHeartRate(hr);
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
            setError('Failed to subscribe to HRV notifications');
            return;
          }
          if (characteristic?.value) {
            const buffer = Buffer.from(characteristic.value, 'base64');
            const hrv = buffer.readUInt16LE(0) / 100;
            setHeartRateVariability(hrv);
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to device');
    }
  }, []);

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

  // Read characteristic
  const readCharacteristic = useCallback(
    async (serviceUUID: string, characteristicUUID: string) => {
      if (!connectedDevice) {
        throw new Error('No device connected');
      }
      return await BluetoothService.readCharacteristic(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID
      );
    },
    [connectedDevice]
  );

  // Write characteristic
  const writeCharacteristic = useCallback(
    async (serviceUUID: string, characteristicUUID: string, value: string) => {
      if (!connectedDevice) {
        throw new Error('No device connected');
      }
      await BluetoothService.writeCharacteristic(
        connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        value
      );
    },
    [connectedDevice]
  );

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
    readCharacteristic,
    writeCharacteristic,
  };
}; 