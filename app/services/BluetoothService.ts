import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform } from 'react-native';

class BluetoothService {
  private bleManager: BleManager | null = null;
  private isScanning: boolean = false;
  private isWeb: boolean;

  constructor() {
    this.isWeb = Platform.OS === 'web';
    if (!this.isWeb) {
      try {
        this.bleManager = new BleManager();
      } catch (error) {
        console.error('Failed to initialize BleManager:', error);
      }
    }
  }

  // Initialize Bluetooth
  async initialize(): Promise<void> {
    if (this.isWeb) {
      throw new Error('Bluetooth is not supported in web browser');
    }

    try {
      if (!this.bleManager) {
        this.bleManager = new BleManager();
      }
      // Check if Bluetooth is powered on
      const state = await this.bleManager.state();
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on');
      }
    } catch (error) {
      console.error('Failed to initialize Bluetooth:', error);
      throw error;
    }
  }

  // Start scanning for devices
  async startScanning(onDeviceFound: (device: Device) => void): Promise<void> {
    if (this.isWeb) {
      throw new Error('Bluetooth is not supported in web browser');
    }

    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized');
    }
    if (this.isScanning) return;

    try {
      this.isScanning = true;
      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          return;
        }
        if (device) {
          onDeviceFound(device);
        }
      });
    } catch (error) {
      console.error('Failed to start scanning:', error);
      this.isScanning = false;
      throw error;
    }
  }

  // Stop scanning
  stopScanning(): void {
    if (this.isWeb) return;
    if (!this.bleManager) return;
    if (this.isScanning) {
      this.bleManager.stopDeviceScan();
      this.isScanning = false;
    }
  }

  // Connect to a device
  async connectToDevice(deviceId: string): Promise<Device> {
    if (this.isWeb) {
      throw new Error('Bluetooth is not supported in web browser');
    }

    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized');
    }
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      return device;
    } catch (error) {
      console.error('Failed to connect to device:', error);
      throw error;
    }
  }

  // Disconnect from a device
  async disconnectDevice(deviceId: string): Promise<void> {
    if (this.isWeb) return;
    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized');
    }
    try {
      await this.bleManager.cancelDeviceConnection(deviceId);
    } catch (error) {
      console.error('Failed to disconnect from device:', error);
      throw error;
    }
  }

  // Read characteristic value
  async readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string> {
    if (this.isWeb) {
      throw new Error('Bluetooth is not supported in web browser');
    }

    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized');
    }
    try {
      const device = await this.bleManager.readCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID
      );
      return device.value || '';
    } catch (error) {
      console.error('Failed to read characteristic:', error);
      throw error;
    }
  }

  // Write characteristic value
  async writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<void> {
    if (this.isWeb) {
      throw new Error('Bluetooth is not supported in web browser');
    }

    if (!this.bleManager) {
      throw new Error('Bluetooth manager not initialized');
    }
    try {
      await this.bleManager.writeCharacteristicWithResponseForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        value
      );
    } catch (error) {
      console.error('Failed to write characteristic:', error);
      throw error;
    }
  }

  // Clean up
  destroy(): void {
    if (this.isWeb) return;
    if (this.bleManager) {
      this.bleManager.destroy();
      this.bleManager = null;
    }
  }

  // Add this method to expose monitorCharacteristicForDevice
  monitorCharacteristicForDevice(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    listener: (error: any, characteristic: any) => void
  ) {
    if (this.bleManager) {
      return this.bleManager.monitorCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        listener
      );
    }
    throw new Error('Bluetooth manager not initialized');
  }
}

export default new BluetoothService(); 