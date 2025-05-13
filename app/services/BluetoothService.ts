import { BleManager, Device, State, ScanMode, ScanCallbackType } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { nativeBleService } from './NativeBleModule';

class BluetoothService {
  private bleManager: BleManager;
  private isReconnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private readonly CONNECTION_TIMEOUT = 15000;
  private isInitialized: boolean = false;
  private isScanning: boolean = false;
  private discoveredDevices: Set<string> = new Set();

  // Define UUIDs
  private SERVICE_UUID = '0000fe40-cc7a-482a-984a-7f2ed5b3e58f';
  private HR_CHAR_UUID = '0000fe41-8e22-4541-9d4c-21edae82ed19';
  private HRV_CHAR_UUID = '0000fe42-8e22-4541-9d4c-21edae82ed19';

  constructor() {
    this.bleManager = new BleManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized && this.bleManager) {
      console.log('Bluetooth already initialized');
      return;
    }

    try {
      // Request permissions first
      const { requestBluetoothPermissions } = require('../../utils/bluetoothPermissions');
      const permissionsGranted = await requestBluetoothPermissions();
      
      if (!permissionsGranted) {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in Settings.');
      }

      // Check if Bluetooth is powered on
      const state = await this.bleManager.state();
      console.log('BluetoothService: Current Bluetooth state:', state);
      
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on');
      }

      // Clean up any existing connections
      try {
        const connectedDevices = await this.bleManager.connectedDevices([this.SERVICE_UUID]);
        for (const device of connectedDevices) {
          try {
            await this.bleManager.cancelDeviceConnection(device.id);
            console.log('BluetoothService: Cleaned up existing connection to', device.id);
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }

      this.isInitialized = true;
      console.log('BluetoothService: Initialization complete');
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      // If initialization fails, clean up
      this.destroy();
      throw error;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      // Start monitoring HR
      device.monitorCharacteristicForService(
        this.SERVICE_UUID,
        this.HR_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('HR Error:', error);
            return;
          }
          if (characteristic?.value) {
            const value = Buffer.from(characteristic.value, 'base64');
            const hr = value.readUInt16LE(0) / 100;
            console.log('Heart Rate:', hr);
          }
        }
      );

      // Start monitoring HRV
      device.monitorCharacteristicForService(
        this.SERVICE_UUID,
        this.HRV_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('HRV Error:', error);
            return;
          }
          if (characteristic?.value) {
            const value = Buffer.from(characteristic.value, 'base64');
            const hrv = value.readUInt16LE(0) / 100;
            console.log('HRV:', hrv);
          }
        }
      );

    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  private async reconnectToDevice(deviceId: string): Promise<void> {
    try {
      console.log(`Reconnecting to device ${deviceId} (Attempt ${this.reconnectAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await this.connectToDevice(deviceId);
    } catch (error) {
      console.error('Reconnect failed:', error);
    } finally {
      this.isReconnecting = false;
    }
  }

  async ensureDeviceConnected(deviceId: string): Promise<void> {
    try {
      await this.connectToDevice(deviceId);
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  monitorCharacteristicForDevice(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    listener: (error: any, value: number | null) => void
  ): void {
    if (!this.bleManager) {
      console.error('BleManager is not initialized');
      listener(new Error('BleManager is not initialized'), null);
      return;
    }

    console.log(`Starting to monitor characteristic ${characteristicUUID}`);
    
    // Try to read the characteristic first
    this.bleManager.readCharacteristicForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID
    ).then(characteristic => {
      if (characteristic?.value) {
        try {
          const value = Buffer.from(characteristic.value, 'base64');
          const number = value.readUInt16LE(0) / 100;
          console.log(`Initial read value:`, number);
          listener(null, number);
        } catch (error) {
          console.error('Error parsing initial value:', error);
        }
      }
    }).catch(error => {
      console.error('Error reading initial value:', error);
    });

    // Then start monitoring
    this.bleManager.monitorCharacteristicForDevice(
      deviceId,
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('Error monitoring characteristic:', error);
          listener(error, null);
          return;
        }

        if (characteristic?.value) {
          try {
            const value = Buffer.from(characteristic.value, 'base64');
            const number = value.readUInt16LE(0) / 100;
            console.log(`Raw value:`, characteristic.value);
            console.log(`Parsed value:`, number);
            listener(null, number);
          } catch (parseError) {
            console.error('Error parsing value:', parseError);
            listener(parseError, null);
          }
        } else {
          console.log('No value received');
          listener(null, null);
        }
      }
    );
  }

  subscribeToHeartRate(
    deviceId: string,
    listener: (error: any, value: number | null) => void
  ): void {
    console.log('Subscribing to heart rate...');
    this.monitorCharacteristicForDevice(deviceId, this.SERVICE_UUID, this.HR_CHAR_UUID, listener);
  }

  subscribeToHeartRateVariability(
    deviceId: string,
    listener: (error: any, value: number | null) => void
  ): void {
    console.log('Subscribing to heart rate variability...');
    this.monitorCharacteristicForDevice(deviceId, this.SERVICE_UUID, this.HRV_CHAR_UUID, listener);
  }

  async isConnected(deviceId: string): Promise<boolean> {
    if (!this.bleManager) {
      console.error('BleManager is not initialized');
      return false;
    }
    
    try {
      const connectedDevices = await this.bleManager.connectedDevices([this.SERVICE_UUID]);
      const device = connectedDevices.find(d => d.id === deviceId);
      
      if (!device) {
        return false;
      }

      // Double check the connection
      try {
        return await device.isConnected();
      } catch (error) {
        console.error('Error checking device connection:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking if device is connected:', error);
      return false;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    if (!this.bleManager) {
      console.error('BleManager is not initialized');
      return;
    }

    try {
      await this.bleManager.cancelDeviceConnection(deviceId);
      console.log(`Disconnected from device: ${deviceId}`);
    } catch (error) {
      console.warn('Disconnect error:', error);
    }
  }

  destroy(): void {
    if (this.bleManager) {
      this.bleManager.destroy();
      console.log('BluetoothManager destroyed');
      this.bleManager = new BleManager();
    } else {
      console.warn('BluetoothManager is not initialized');
    }
  }

  async startScanning(onDeviceFound: (device: Device) => void): Promise<void> {
    this.bleManager.startDeviceScan(
      null,
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }
        if (device) {
          onDeviceFound(device);
        }
      }
    );
  }

  stopScanning(): void {
    this.bleManager.stopDeviceScan();
  }
}

// Create and export a single instance
const bluetoothService = new BluetoothService();
export default bluetoothService;
